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

  // ----- Draft Campaign basics from a brief -----
  // Reads state.campaign.brief, asks AI to fill name/description/objective/
  // budget_mode/bid_strategy/daily_budget. Overwrites the campaign fields on
  // success so the user sees the AI draft and can edit before moving on.
  function ncwAIDraftCampaign() {
    var state = _ncwState(); if (!state) return;
    if (state.aiLoading) return;
    if (!LLMService.isConfigured()) { state.aiError = 'AI not configured — open Settings → AI.'; _ncwRefresh(); return; }

    // Pull the latest brief from the DOM in case the user hasn't tabbed out.
    var $brief = $('#cpNCW [data-ncw-field="campaign.brief"]');
    if ($brief.length) state.campaign.brief = ($brief.val() || '').trim();
    var brief = (state.campaign.brief || '').trim();
    if (!brief) { state.aiError = 'Write a brief first — describe what you\'re selling, who you\'re targeting, and what success looks like.'; _ncwRefresh(); return; }

    _ncwBegin(state);

    var objectives = Object.keys(Constants.META_OBJECTIVES).map(function(k) {
      return '- ' + k + ': ' + Constants.META_OBJECTIVES[k].label + ' — ' + Constants.META_OBJECTIVES[k].description;
    }).join('\n');
    var bidStrategies = Object.keys(Constants.META_BID_STRATEGIES).map(function(k) {
      return '- ' + k + ': ' + Constants.META_BID_STRATEGIES[k].label;
    }).join('\n');

    var prompt = 'You are a Meta Ads strategist. Draft the top-level Campaign settings from the brief below.\n\n';
    prompt += 'Brief:\n' + brief + '\n\n';
    prompt += 'Valid objectives (pick exactly ONE by key):\n' + objectives + '\n\n';
    prompt += 'Valid bid strategies (pick exactly ONE by key):\n' + bidStrategies + '\n\n';
    prompt += 'Budget modes: CBO (Meta allocates across Ad Sets — default for most cases), ABO (per-Ad-Set budgets — pick when ad sets need fixed splits).\n';
    prompt += brandSnippet('research');
    prompt += '\n\nRules:\n';
    prompt += '- name: ≤60 chars, specific and product-oriented (no generic "Q3 Campaign").\n';
    prompt += '- description: ≤200 chars, plain prose explaining the goal.\n';
    prompt += '- objective: must be a key from the list above.\n';
    prompt += '- bid_strategy: must be a key from the list above (default LOWEST_COST_WITHOUT_CAP).\n';
    prompt += '- daily_budget: integer in the brief\'s currency if a budget is stated or strongly implied; otherwise null. Do NOT invent budgets.\n';
    prompt += '- Output strict JSON only, no preamble, no markdown:\n';
    prompt += '{"name":"","description":"","objective":"OUTCOME_...","budget_mode":"CBO|ABO","bid_strategy":"LOWEST_COST_WITHOUT_CAP","daily_budget":NUMBER_OR_NULL}';

    callAIWithRetry(prompt, function(parsed) {
      if (!parsed || typeof parsed !== 'object') { _ncwEndErr(state, 'AI returned no campaign basics'); _ncwRefresh(); return; }
      var cam = state.campaign;
      cam.name        = String(parsed.name || '').trim().substring(0, 80) || cam.name;
      cam.description = String(parsed.description || '').trim().substring(0, 240);
      cam.objective   = Constants.META_OBJECTIVES[parsed.objective] ? parsed.objective : (cam.objective || 'OUTCOME_LEADS');
      cam.budget_mode = parsed.budget_mode === 'ABO' ? 'ABO' : 'CBO';
      cam.bid_strategy = Constants.META_BID_STRATEGIES[parsed.bid_strategy] ? parsed.bid_strategy : 'LOWEST_COST_WITHOUT_CAP';
      var db = parsed.daily_budget;
      cam.daily_budget = (db != null && db !== '' && !isNaN(Number(db)) && Number(db) > 0) ? Number(db) : (cam.daily_budget || '');
      state.stepGenerated[1] = true;
      _ncwEndOk(state);
      _ncwRefresh();
    }, function(err) {
      _ncwEndErr(state, err);
      _ncwRefresh();
    }, 'ncw-ai', BrandService.getSystemPrompt('research'), parseJSON);
  }

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
    if (cam.description) prompt += 'Description: ' + cam.description + '\n';
    if (cam.objective) prompt += 'Objective: ' + cam.objective + '\n';
    if (cam.budget_mode) prompt += 'Budget mode: ' + cam.budget_mode + '\n';
    if (cam.daily_budget) prompt += 'Daily budget: ' + cam.daily_budget + '\n';
    if (cam.brief) prompt += '\nBrief: ' + cam.brief + '\n';
    if (personas.length) {
      prompt += '\nAvailable personas (use persona_id if a match — exact id, otherwise empty string):\n';
      prompt += personas.map(function(p) { return '- ' + p.id + ': ' + p.name + (p.description ? ' — ' + p.description : ''); }).join('\n') + '\n';
    }
    prompt += brandSnippet('research');
    prompt += '\n\nValid optimization goals (pick one key per Ad Set): ' + goalList;
    prompt += '\nValid objectives: ' + objList;
    prompt += '\n\nRules:';
    prompt += '\n- Generate exactly 3 Ad Sets. Each targets a DIFFERENT angle / audience cut (e.g. pain-point split, life-stage split, intent level).';
    prompt += '\n- Ad Set name ≤60 chars, descriptive (e.g. "Founders — Time-poor"), not generic.';
    prompt += '\n- optimization_goal must be valid for the campaign objective (e.g. OFFSITE_CONVERSIONS for OUTCOME_LEADS/SALES, LINK_CLICKS for OUTCOME_TRAFFIC).';
    prompt += '\n- creative_direction: 1-2 sentences describing the angle and tone for this Ad Set.';
    prompt += '\n- hook_angles: 3 short, distinct hook angles (e.g. "regret of waiting", "shipping speed", "social proof"). 2-6 words each.';
    prompt += '\n- ai_notes: short steer for the ad-writer (constraints, do/don\'ts). Empty string if nothing to add.';
    prompt += '\n- Output strict JSON only, no preamble, no markdown:\n';
    prompt += '{"ad_sets":[{"name":"","persona_id":"","audience_overrides":"","optimization_goal":"","brief":{"creative_direction":"","hook_angles":["","",""],"ai_notes":""}}]}';

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
    var ctaList = Object.keys(Constants.META_CTA_TYPES).slice(0, 16).join(', ');

    var prompt = 'You are a Meta Ads creative director. Generate 3 distinct Ads for the Ad Set below.\n\n';
    prompt += 'Campaign: ' + (cam.name || '(untitled)') + '\n';
    if (cam.objective) prompt += 'Objective: ' + cam.objective + '\n';
    if (cam.brief)     prompt += 'Campaign brief: ' + cam.brief + '\n';
    prompt += '\nAd Set: ' + (adSet.name || '') + '\n';
    if (persona)       prompt += 'Persona: ' + persona.name + ' — ' + truncate(persona.description || '', 140) + '\n';
    var brief = adSet.brief || {};
    if (brief.creative_direction) prompt += 'Creative direction: ' + brief.creative_direction + '\n';
    if (brief.hook_angles && brief.hook_angles.length) prompt += 'Hook angles to consider: ' + brief.hook_angles.join(' | ') + '\n';
    if (brief.ai_notes) prompt += 'Writer notes: ' + brief.ai_notes + '\n';
    if (state._adsContext[setIdx]) prompt += '\nAdditional ad direction: ' + state._adsContext[setIdx] + '\n';
    prompt += brandSnippet('content');
    prompt += '\n\nValid CTA keys: ' + ctaList;
    prompt += '\n\nRules:';
    prompt += '\n- Generate exactly 3 Ads. Each uses a DIFFERENT hook angle and hook type — no two Ads should feel interchangeable.';
    prompt += '\n- name ≤60 chars, descriptive (e.g. "Regret hook — testimonial").';
    prompt += '\n- hook.text: the opening line/headline that makes someone stop scrolling. ≤90 chars.';
    prompt += '\n- hook.type: one of question|bold|story|data|direct|curiosity|challenge.';
    prompt += '\n- primary_text: 90-140 chars, conversational, expands on the hook with a single concrete payoff.';
    prompt += '\n- headline: ≤27 chars. description: ≤27 chars. Both must be specific, not generic.';
    prompt += '\n- cta_type: pick from the CTA keys above that fits the objective.';
    prompt += '\n- cta_link: empty string (user fills landing URL later).';
    prompt += '\n- creative_type: pick single_image, single_video, or carousel based on what the hook needs.';
    prompt += '\n- Output strict JSON only, no preamble, no markdown:\n';
    prompt += '{"ads":[{"name":"","creative_type":"single_image","hook":{"text":"","type":"direct"},"creative":{"primary_text":"","headline":"","description":"","cta_type":"LEARN_MORE","cta_link":""}}]}';

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
            image: { asset_id: '', prompt: m.image_prompt || m.image_brief || '', aspect_ratio: '1:1', reference_image_ids: [] },
            video: { asset_id: '', duration_seconds: 30, aspect_ratio: '9:16', concept: m.video_concept || '', script: { sections: [] } },
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
