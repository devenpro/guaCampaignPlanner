  // ============================================================
  // SECTION 15c: SETUP WIZARD — FINALIZE (Meta v2 only)
  // ============================================================
  //
  // Creates library entities (personas / pain points / messages / styles /
  // formats), then a Meta v2 Campaign with its Ad Sets and Ads in one pass.
  // No legacy v1 path — the wizard always produces Meta-native output.

  function finalizeSetupWizard() {
    var state = _swState();
    if (!state) { toast('Wizard state not available.', 'error'); return; }

    state.finalizing  = true;
    state.finalizeMsg = 'Preparing your workspace…';
    _swRefresh();

    setTimeout(function() {
      try {
        _runFinalizeSetup(state);
      } catch(e) {
        console.error('[SW] Finalize error:', e);
        state.finalizing = false;
        _swRefresh();
        toast('Setup failed: ' + (e.message || String(e)), 'error');
      }
    }, 200);
  }

  function _runFinalizeSetup(state) {
    var ws = state.workspace || {};
    var C  = Constants;

    // --- Category maps ---
    var ppCatMap = {
      'Productivity':  'ppc_productivity',
      'Cost / Budget': 'ppc_cost',
      'Knowledge Gap': 'ppc_knowledge',
      'Competition':   'ppc_competition',
      'Growth':        'ppc_growth'
    };
    var vfCatMap = {
      'Shoot':     'vfc_shoot',
      'UGC':       'vfc_ugc',
      'Graphic':   'vfc_graphic',
      'Animation': 'vfc_animation'
    };
    var funnelMap = { 'top': 'fs_top', 'mid': 'fs_mid', 'bot': 'fs_bot' };

    function setMsg(msg) {
      state.finalizeMsg = msg;
      _swRefresh();
    }

    // ---- 1. Workspace settings ----
    setMsg('Saving workspace settings…');
    if (ws.name)                S.meta.workspace.name           = ws.name;
    if (!S.meta.workspace.created) S.meta.workspace.created     = new Date().toISOString();
    if (ws.product_name)        S.meta.setup.product_name       = ws.product_name;
    if (ws.objective)           S.meta.setup.objective          = ws.objective;
    if (ws.custom_instructions) S.meta.setup.custom_instructions = ws.custom_instructions;
    // Mark Meta v2 enabled — there is no legacy path
    S.meta.setup.meta_v2 = true;

    // ---- 2. Personas ----
    setMsg('Creating personas…');
    var personaIdxToId = {};
    var selPersonas = (state.personas || []).filter(function(p) { return p._selected; });
    for (var pi = 0; pi < selPersonas.length; pi++) {
      var p   = selPersonas[pi];
      var oi  = (state.personas || []).indexOf(p);
      var dem = p.demographics   || {};
      var psy = p.psychographics || {};
      var pEnt = createEntity('persona', {
        name: p.name || ('Persona ' + (pi + 1)), description: p.description || '',
        demographics: {
          age_range:    dem.age_range    || '', gender:       dem.gender       || 'all',
          location:     dem.location     || '', income_level: dem.income_level || '',
          education:    dem.education    || '', occupation:   dem.occupation   || ''
        },
        psychographics: {
          desires:     psy.desires     || '', fears:       psy.fears       || '',
          motivations: psy.motivations || '', values:      psy.values      || ''
        }
      });
      personaIdxToId[oi] = pEnt.id;
      state.created.personaIds.push(pEnt.id);
    }

    // ---- 3. Pain Points ----
    setMsg('Creating pain points…');
    var selPPs = (state.pain_points || []).filter(function(pp) { return pp._selected; });
    for (var ppi = 0; ppi < selPPs.length; ppi++) {
      var pp    = selPPs[ppi];
      var ppEnt = createEntity('pain_point', {
        pain_point: pp.pain_point || '',
        solution:   pp.solution   || '',
        category:   ppCatMap[pp.category] || pp.category || ''
      });
      state.created.painPointIds.push(ppEnt.id);
    }

    buildMaps();

    // ---- 4. Messages ----
    setMsg('Creating messages…');
    var messageIdxToId = {};
    var selMessages = (state.messages || []).filter(function(m) { return m._selected; });
    for (var mi = 0; mi < selMessages.length; mi++) {
      var m    = selMessages[mi];
      var omi  = (state.messages || []).indexOf(m);
      var fStg = funnelMap[m.funnel_stage] || '';
      var mEnt = createEntity('message', {
        title:         m.name        || ('Message ' + (mi + 1)),
        body:          m.body        || m.description || '',
        theme:         m.theme       || '',
        funnel_stages: fStg ? [fStg] : [],
        hooks:         m.hook_type ? [{ id: generateId('hk'), hook_type: m.hook_type, text: '' }] : []
      });
      messageIdxToId[omi] = mEnt.id;
      state.created.messageIds.push(mEnt.id);
    }

    // ---- 5. Styles ----
    setMsg('Creating styles…');
    var styleIdxToId = {};
    var selStyles = (state.styles || []).filter(function(s) { return s._selected; });
    for (var si = 0; si < selStyles.length; si++) {
      var sty  = selStyles[si];
      var osi  = (state.styles || []).indexOf(sty);
      var sEnt = createEntity('style', {
        name: sty.name || ('Style ' + (si + 1)), description: sty.description || ''
      });
      styleIdxToId[osi] = sEnt.id;
      state.created.styleIds.push(sEnt.id);
    }

    // ---- 6. Formats ----
    setMsg('Creating formats…');
    var formatIdxToId = {};
    var selFormats = (state.formats || []).filter(function(f) { return f._selected; });
    for (var fi = 0; fi < selFormats.length; fi++) {
      var fmt  = selFormats[fi];
      var ofi  = (state.formats || []).indexOf(fmt);
      var fEnt = createEntity('visual_format', {
        name:        fmt.name        || ('Format ' + (fi + 1)),
        description: fmt.description || '',
        category:    vfCatMap[fmt.category] || fmt.category || ''
      });
      formatIdxToId[ofi] = fEnt.id;
      state.created.formatIds.push(fEnt.id);
    }

    buildMaps();

    // ---- 7. Meta v2 Campaign ----
    setMsg('Creating Campaign…');
    var cam = state.campaign || {};
    var campEnt = createEntity('campaign_v2', $.extend({}, C.META_CAMPAIGN_DEFAULTS, {
      name:           cam.name || ws.product_name || 'My Campaign',
      description:    cam.description || '',
      objective:      C.META_OBJECTIVES[cam.objective] ? cam.objective : C.META_CAMPAIGN_DEFAULTS.objective,
      budget_mode:    cam.budget_mode === 'ABO' ? 'ABO' : 'CBO',
      daily_budget:   cam.daily_budget !== '' && cam.daily_budget != null ? Number(cam.daily_budget) : null,
      lifetime_budget: cam.lifetime_budget !== '' && cam.lifetime_budget != null ? Number(cam.lifetime_budget) : null,
      bid_strategy:   cam.bid_strategy || C.META_CAMPAIGN_DEFAULTS.bid_strategy,
      start_time:     cam.start_time || '',
      stop_time:      cam.stop_time || '',
      brief:          cam.brief || '',
      ai_instructions: cam.ai_instructions || '',
      status:         'DRAFT'
    }));
    if (!campEnt) {
      throw new Error('Failed to create Campaign entity.');
    }
    state.created.campaignV2Id = campEnt.id;

    // ---- 8. Ad Sets + Ads ----
    setMsg('Creating Ad Sets and Ads…');
    var selSets = (state.ad_sets || []).filter(function(s) { return s._selected; });
    var adSetCount = 0, adCount = 0;
    var buildPS = (window._cpPart2A && window._cpPart2A.buildPersonaSnapshot) ? window._cpPart2A.buildPersonaSnapshot : null;

    for (var asi = 0; asi < selSets.length; asi++) {
      var as = selSets[asi];

      // Resolve persona via selPersonas-relative idx → real state.personas idx → created entity id
      var personaWizard = selPersonas[as.persona_idx];
      var personaRealIdx = personaWizard ? (state.personas || []).indexOf(personaWizard) : -1;
      var personaEntId = personaRealIdx >= 0 ? personaIdxToId[personaRealIdx] : '';
      var personaEnt = personaEntId ? getPersona(personaEntId) : null;

      var brief = as.brief || {};
      var msgIds = (brief.message_idx_list || []).map(function(i) {
        var realI = selMessages[i] ? (state.messages || []).indexOf(selMessages[i]) : -1;
        return realI >= 0 ? messageIdxToId[realI] : null;
      }).filter(Boolean);
      var styleIds = (brief.style_idx_list || []).map(function(i) {
        var realI = selStyles[i] ? (state.styles || []).indexOf(selStyles[i]) : -1;
        return realI >= 0 ? styleIdxToId[realI] : null;
      }).filter(Boolean);
      var formatIds = (brief.format_idx_list || []).map(function(i) {
        var realI = selFormats[i] ? (state.formats || []).indexOf(selFormats[i]) : -1;
        return realI >= 0 ? formatIdxToId[realI] : null;
      }).filter(Boolean);

      var setEnt = createEntity('ad_set', {
        campaign_id:         campEnt.id,
        name:                as.name || 'Ad Set ' + (asi + 1),
        persona_id:          personaEntId || '',
        persona_snapshot:    (personaEnt && buildPS) ? buildPS(personaEnt) : null,
        audience_overrides:  as.audience_overrides || '',
        optimization_goal:   C.META_OPTIMIZATION_GOALS[as.optimization_goal] ? as.optimization_goal : C.META_AD_SET_DEFAULTS.optimization_goal,
        billing_event:       as.billing_event       || C.META_AD_SET_DEFAULTS.billing_event,
        attribution_setting: as.attribution_setting || C.META_AD_SET_DEFAULTS.attribution_setting,
        brief: {
          creative_direction: brief.creative_direction || '',
          message_ids:        msgIds,
          style_ids:          styleIds,
          format_ids:         formatIds,
          hook_angles:        Array.isArray(brief.hook_angles) ? brief.hook_angles : [],
          ai_notes:           brief.ai_notes || ''
        }
      });
      if (!setEnt) continue;
      state.created.adSetIds.push(setEnt.id);
      adSetCount++;

      var selAds = (as.ads || []).filter(function(a) { return a._selected; });
      for (var adi = 0; adi < selAds.length; adi++) {
        var ad = selAds[adi];
        var hook = ad.hook || {};
        var creative = ad.creative || {};
        var media = ad.media || {};
        var adEnt = createEntity('ad', {
          ad_set_id:     setEnt.id,
          name:          ad.name || ((setEnt.name || 'Ad Set') + ' — Ad ' + (adi + 1)),
          creative_type: C.META_AD_CREATIVE_TYPES[ad.creative_type] ? ad.creative_type : 'single_image',
          hook: {
            text:               hook.text || '',
            type:               hook.type || 'direct',
            source_message_id:  '',
            selected_hook_id:   ''
          },
          creative: {
            primary_text: creative.primary_text || '',
            headline:     creative.headline     || '',
            description:  creative.description  || '',
            cta_type:     C.META_CTA_TYPES[creative.cta_type] ? creative.cta_type : 'LEARN_MORE',
            cta_link:     creative.cta_link     || '',
            display_link: '',
            tracking_params: ''
          },
          media: {
            image: {
              asset_id: '',
              ai_prompt: media.image_prompt || '',
              brief: media.image_brief || '',
              aspect_ratio: '1:1',
              negative_prompt: '',
              reference_image_ids: []
            },
            video: {
              asset_id: '',
              duration_seconds: 30,
              aspect_ratio: '9:16',
              concept: media.video_concept || '',
              blueprint: { scenes: [] },
              script: { rows: [] }
            },
            carousel_cards: []
          }
        });
        if (adEnt) {
          state.created.adIds.push(adEnt.id);
          adCount++;
          if (typeof window._cpMaybeAdvanceAdStatus === 'function') {
            window._cpMaybeAdvanceAdStatus(adEnt, 'setup wizard');
          }
        }
      }
    }

    // ---- 9. Mark setup complete + log ----
    setMsg('Finishing up…');
    S.meta.setup.setup_complete = true;
    logActivity(
      'campaign_tree_generated', 'campaign_v2', campEnt.id, campEnt.name,
      'Setup wizard: ' + adSetCount + ' Ad Set' + (adSetCount !== 1 ? 's' : '') +
      ', ' + adCount + ' Ad' + (adCount !== 1 ? 's' : '')
    );
    buildMaps();
    syncToTextarea();

    // ---- 10. Clear session & close wizard ----
    if (window._cpPart2A && typeof window._cpPart2A.swClearSession === 'function') {
      window._cpPart2A.swClearSession();
    }
    $('.cp-setup-wizard').remove();

    // ---- 11. Re-render app shell & navigate to the new Campaign Workspace ----
    if (window._cpRenderAppShell) {
      $('#cpApp').html(window._cpRenderAppShell());
      $('.cp-ai-picker-loading').each(function() {
        var actionId = $(this).data('pending-action');
        if (actionId) $(this).replaceWith(LLMService.renderInlinePicker(actionId));
      });
      updateAIStatusIndicator();
    }
    S.selectedCampaignV2Id = campEnt.id;
    S.selectedAdSetId = null;
    S.selectedAdId = null;
    navigate('campaign_workspace', { hash: 'campaign/' + campEnt.id });

    toast(
      'Workspace ready! Created Campaign with ' +
      adSetCount + ' Ad Set' + (adSetCount !== 1 ? 's' : '') + ' and ' +
      adCount + ' Ad' + (adCount !== 1 ? 's' : '') + '.',
      'success', 6000
    );
  }
