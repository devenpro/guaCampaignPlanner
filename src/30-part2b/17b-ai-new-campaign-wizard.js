  // ============================================================
  // SECTION 17B: AI — NEW CAMPAIGN WIZARD (per-campaign)
  // ============================================================

  function _ncwState() {
    return window._cpPart2A && window._cpPart2A.ncwState;
  }
  function _ncwRefresh() {
    if (window._cpPart2A && typeof window._cpPart2A.refreshNCW === 'function') {
      window._cpPart2A.refreshNCW();
    }
  }
  function _ncwBegin(state)   { state.aiLoading = true;  state.aiActionId = 'ncw-ai'; state.aiError = ''; _ncwRefresh(); }
  function _ncwEndOk(state)   { state.aiLoading = false; state.aiActionId = ''; state.aiError = ''; }
  function _ncwEndErr(state, err) { state.aiLoading = false; state.aiActionId = ''; state.aiError = String(err || 'AI failed').substring(0, 240); }

  // ----- Suggest Ad Sets from the Campaign brief -----
  function ncwAISuggestAdSets() {
    var state = _ncwState(); if (!state) return;
    if (state.aiLoading) return;
    if (!LLMService.isConfigured()) { state.aiError = 'AI not configured — open Settings → AI.'; _ncwRefresh(); return; }

    _ncwBegin(state);

    var cam = state.campaign || {};
    var personas = (S.data.personas || []).slice(0, 24).map(function(p) {
      return { id: p.id, name: p.name, description: truncate(p.description || '', 100) };
    });
    var objList = Object.keys(Constants.META_OBJECTIVES).join(', ');
    var goalList = Object.keys(Constants.META_OPTIMIZATION_GOALS).join(', ');

    var prompt = 'You are a Meta Ads strategist. Suggest 3 distinct Ad Sets for this Campaign.\n\n';
    prompt += 'Campaign: ' + (cam.name || '(untitled)') + '\n';
    if (cam.objective) prompt += 'Objective: ' + cam.objective + '\n';
    if (cam.budget_mode) prompt += 'Budget mode: ' + cam.budget_mode + '\n';
    if (cam.daily_budget) prompt += 'Daily budget: ' + cam.daily_budget + '\n';
    if (cam.brief) prompt += '\nBrief: ' + cam.brief + '\n';
    if (personas.length) {
      prompt += '\nAvailable personas (use persona_id if a match):\n';
      prompt += personas.map(function(p) { return '- ' + p.id + ': ' + p.name + (p.description ? ' — ' + p.description : ''); }).join('\n') + '\n';
    }
    prompt += brandSnippet('research');
    prompt += '\n\nValid optimization goals: ' + goalList + '\nValid objectives: ' + objList;
    prompt += '\n\nRules: Each Ad Set targets a DIFFERENT angle / audience cut. Optimization goal must be valid for the campaign objective.';
    prompt += '\nReturn ONLY this JSON:\n';
    prompt += '{ "ad_sets": [{\n';
    prompt += '  "name": "Ad Set name",\n';
    prompt += '  "persona_id": "library id or empty",\n';
    prompt += '  "audience_overrides": "",\n';
    prompt += '  "optimization_goal": "...",\n';
    prompt += '  "brief": { "creative_direction": "", "hook_angles": ["","",""], "ai_notes": "" }\n';
    prompt += '}] }';
    prompt += '\n\nNo markdown, no preamble.';

    callAIWithRetry(prompt, function(parsed) {
      var sets = (parsed && Array.isArray(parsed.ad_sets)) ? parsed.ad_sets : [];
      var allowedGoals = Constants.META_OPTIMIZATION_GOALS;
      state.ad_sets = sets.slice(0, 4).map(function(s, i) {
        var b = s.brief || {};
        var personaId = (s.persona_id && S.personaMap && S.personaMap[s.persona_id]) ? s.persona_id : '';
        return {
          name: String(s.name || 'Ad Set ' + (i + 1)).trim().substring(0, 80),
          persona_id: personaId,
          audience_overrides: String(s.audience_overrides || '').trim(),
          optimization_goal: allowedGoals[s.optimization_goal] ? s.optimization_goal : 'OFFSITE_CONVERSIONS',
          billing_event: 'IMPRESSIONS',
          attribution_setting: '7d_click',
          brief: {
            creative_direction: String(b.creative_direction || '').trim(),
            message_ids: [],
            style_ids: [],
            format_ids: [],
            hook_angles: Array.isArray(b.hook_angles) ? b.hook_angles.filter(Boolean).slice(0, 5) : [],
            ai_notes: String(b.ai_notes || '').trim()
          },
          ads: [],
          _selected: true
        };
      });
      state.stepGenerated[2] = true;
      _ncwEndOk(state);
      _ncwRefresh();
    }, function(err) {
      _ncwEndErr(state, err);
      _ncwRefresh();
    }, 'ncw-ai', BrandService.getSystemPrompt('research'), parseJSON);
  }

  // ----- Suggest Ads for one Ad Set -----
  function ncwAISuggestAds(setIdx) {
    var state = _ncwState(); if (!state) return;
    if (state.aiLoading) return;
    if (!LLMService.isConfigured()) { state.aiError = 'AI not configured — open Settings → AI.'; _ncwRefresh(); return; }

    var adSet = (state.ad_sets || [])[setIdx]; if (!adSet) return;
    var cam = state.campaign || {};

    state._adsContext = state._adsContext || {};
    state._adsContext[setIdx] = $('#ncwAdsContext').val() || state._adsContext[setIdx] || '';

    _ncwBegin(state);

    var persona = adSet.persona_id ? S.personaMap[adSet.persona_id] : null;
    var prompt = 'You are a Meta Ads creative director. Generate 3 distinct Ads for the Ad Set below.\n\n';
    prompt += 'Campaign: ' + (cam.name || '(untitled)') + '\n';
    if (cam.objective) prompt += 'Objective: ' + cam.objective + '\n';
    if (cam.brief)     prompt += 'Campaign brief: ' + cam.brief + '\n';
    prompt += '\nAd Set: ' + (adSet.name || '') + '\n';
    if (persona)       prompt += 'Persona: ' + persona.name + ' — ' + truncate(persona.description || '', 140) + '\n';
    var brief = adSet.brief || {};
    if (brief.creative_direction) prompt += 'Creative direction: ' + brief.creative_direction + '\n';
    if (brief.hook_angles && brief.hook_angles.length) prompt += 'Hook angles to consider: ' + brief.hook_angles.join(' | ') + '\n';
    if (state._adsContext[setIdx]) prompt += '\nAdditional ad direction: ' + state._adsContext[setIdx] + '\n';
    prompt += brandSnippet('content');
    prompt += '\n\nRules: each Ad uses a DIFFERENT hook angle. Primary text 90-140 chars. Headline ≤27. Description ≤27.';
    prompt += '\nReturn ONLY this JSON:\n';
    prompt += '{ "ads": [{\n';
    prompt += '  "name": "",\n';
    prompt += '  "creative_type": "single_image|single_video|carousel",\n';
    prompt += '  "hook": { "text": "", "type": "question|bold|story|data|direct|curiosity|challenge" },\n';
    prompt += '  "creative": { "primary_text": "", "headline": "", "description": "", "cta_type": "LEARN_MORE|SHOP_NOW|...", "cta_link": "" }\n';
    prompt += '}] }';
    prompt += '\n\nNo markdown, no preamble.';

    callAIWithRetry(prompt, function(parsed) {
      var ads = (parsed && Array.isArray(parsed.ads)) ? parsed.ads : [];
      var allowedCTAs = Constants.META_CTA_TYPES;
      var allowedTypes = Constants.META_AD_CREATIVE_TYPES;
      var allowedHook = { question:1, bold:1, story:1, data:1, direct:1, curiosity:1, challenge:1 };
      adSet.ads = ads.slice(0, 4).map(function(a, i) {
        var h = a.hook || {}; var cr = a.creative || {};
        return {
          name: String(a.name || 'Ad ' + (i + 1)).trim().substring(0, 80),
          creative_type: allowedTypes[a.creative_type] ? a.creative_type : 'single_image',
          hook: {
            text: String(h.text || '').trim(),
            type: allowedHook[h.type] ? h.type : 'direct'
          },
          creative: {
            primary_text: String(cr.primary_text || '').trim(),
            headline:     String(cr.headline     || '').trim(),
            description:  String(cr.description  || '').trim(),
            cta_type:     allowedCTAs[cr.cta_type] ? cr.cta_type : 'LEARN_MORE',
            cta_link:     String(cr.cta_link     || '').trim()
          },
          media: { image_brief: '', image_prompt: '', video_concept: '' },
          _selected: true
        };
      });
      state.stepGenerated[3] = state.stepGenerated[3] || {};
      state.stepGenerated[3][setIdx] = true;
      _ncwEndOk(state);
      _ncwRefresh();
    }, function(err) {
      _ncwEndErr(state, err);
      _ncwRefresh();
    }, 'ncw-ai', BrandService.getSystemPrompt('content'), parseJSON);
  }

  // ----- Finalize: create Campaign + Ad Sets + Ads -----
  function finalizeNewCampaignWizard() {
    var state = _ncwState(); if (!state) { toast('Wizard state not available.', 'error'); return; }
    state.finalizing = true;
    state.finalizeMsg = 'Creating Campaign…';
    _ncwRefresh();

    setTimeout(function() {
      try { _runNCWFinalize(state); }
      catch(e) {
        console.error('[NCW] Finalize error:', e);
        state.finalizing = false;
        _ncwRefresh();
        toast('Create failed: ' + (e.message || String(e)), 'error');
      }
    }, 150);
  }

  function _runNCWFinalize(state) {
    var C = Constants;
    var cam = state.campaign || {};

    function setMsg(msg) { state.finalizeMsg = msg; _ncwRefresh(); }

    setMsg('Creating Campaign…');
    var campEnt = createEntity('campaign_v2', $.extend({}, C.META_CAMPAIGN_DEFAULTS, {
      name: cam.name || 'Untitled Campaign',
      description: cam.description || '',
      objective: C.META_OBJECTIVES[cam.objective] ? cam.objective : C.META_CAMPAIGN_DEFAULTS.objective,
      budget_mode: cam.budget_mode === 'ABO' ? 'ABO' : 'CBO',
      daily_budget: cam.daily_budget !== '' && cam.daily_budget != null ? Number(cam.daily_budget) : null,
      lifetime_budget: cam.lifetime_budget !== '' && cam.lifetime_budget != null ? Number(cam.lifetime_budget) : null,
      bid_strategy: cam.bid_strategy || C.META_CAMPAIGN_DEFAULTS.bid_strategy,
      start_time: cam.start_time || '',
      stop_time: cam.stop_time || '',
      brief: cam.brief || '',
      ai_instructions: cam.ai_instructions || '',
      status: 'DRAFT'
    }));
    if (!campEnt) throw new Error('Failed to create Campaign');
    state.created.campaignV2Id = campEnt.id;

    var buildPS = (window._cpPart2A && window._cpPart2A.buildPersonaSnapshot) ? window._cpPart2A.buildPersonaSnapshot : null;
    var selSets = (state.ad_sets || []).filter(function(s) { return s._selected; });
    var adSetCount = 0, adCount = 0;

    setMsg('Creating Ad Sets and Ads…');
    for (var i = 0; i < selSets.length; i++) {
      var s = selSets[i];
      var personaEnt = s.persona_id ? getPersona(s.persona_id) : null;
      var brief = s.brief || {};
      var setEnt = createEntity('ad_set', {
        campaign_id: campEnt.id,
        name: s.name || ('Ad Set ' + (i + 1)),
        persona_id: personaEnt ? personaEnt.id : '',
        persona_snapshot: (personaEnt && buildPS) ? buildPS(personaEnt) : null,
        audience_overrides: s.audience_overrides || '',
        optimization_goal: C.META_OPTIMIZATION_GOALS[s.optimization_goal] ? s.optimization_goal : C.META_AD_SET_DEFAULTS.optimization_goal,
        billing_event: s.billing_event || C.META_AD_SET_DEFAULTS.billing_event,
        attribution_setting: s.attribution_setting || C.META_AD_SET_DEFAULTS.attribution_setting,
        brief: {
          creative_direction: brief.creative_direction || '',
          message_ids: brief.message_ids || [],
          style_ids: brief.style_ids || [],
          format_ids: brief.format_ids || [],
          hook_angles: brief.hook_angles || [],
          ai_notes: brief.ai_notes || ''
        }
      });
      if (!setEnt) continue;
      state.created.adSetIds.push(setEnt.id);
      adSetCount++;

      var selAds = (s.ads || []).filter(function(a) { return a._selected; });
      for (var j = 0; j < selAds.length; j++) {
        var ad = selAds[j];
        var cr = ad.creative || {}; var h = ad.hook || {}; var m = ad.media || {};
        var adEnt = createEntity('ad', {
          ad_set_id: setEnt.id,
          name: ad.name || ((setEnt.name || 'Ad Set') + ' — Ad ' + (j + 1)),
          creative_type: C.META_AD_CREATIVE_TYPES[ad.creative_type] ? ad.creative_type : 'single_image',
          hook: { text: h.text || '', type: h.type || 'direct', source_message_id: '', selected_hook_id: '' },
          creative: {
            primary_text: cr.primary_text || '',
            headline:     cr.headline     || '',
            description:  cr.description  || '',
            cta_type:     C.META_CTA_TYPES[cr.cta_type] ? cr.cta_type : 'LEARN_MORE',
            cta_link:     cr.cta_link     || '',
            display_link: '', tracking_params: ''
          },
          media: {
            image: { asset_id: '', ai_prompt: m.image_prompt || '', brief: m.image_brief || '', aspect_ratio: '1:1', negative_prompt: '', reference_image_ids: [] },
            video: { asset_id: '', duration_seconds: 30, aspect_ratio: '9:16', concept: m.video_concept || '', blueprint: { scenes: [] }, script: { rows: [] } },
            carousel_cards: []
          }
        });
        if (adEnt) {
          state.created.adIds.push(adEnt.id);
          adCount++;
          if (typeof window._cpMaybeAdvanceAdStatus === 'function') window._cpMaybeAdvanceAdStatus(adEnt, 'new campaign wizard');
        }
      }
    }

    setMsg('Finishing up…');
    logActivity('campaign_v2_created', 'campaign_v2', campEnt.id, campEnt.name,
      'New Campaign wizard: ' + adSetCount + ' Ad Set(s), ' + adCount + ' Ad(s)');
    buildMaps();
    syncToTextarea();

    $('.cp-ncw').remove();

    S.selectedCampaignV2Id = campEnt.id;
    S.selectedAdSetId = null; S.selectedAdId = null;
    navigate('campaign_workspace', { hash: 'campaign/' + campEnt.id });

    toast(
      'Campaign created with ' + adSetCount + ' Ad Set' + (adSetCount !== 1 ? 's' : '') +
      ' and ' + adCount + ' Ad' + (adCount !== 1 ? 's' : '') + '.',
      'success', 5000
    );
  }
