  // ============================================================
  // SECTION 15c: SETUP WIZARD — FINALIZE (Meta v2, ideas only)
  // ============================================================
  //
  // Creates library entities (personas / pain points / messages / styles /
  // formats), then one DRAFT campaign_v2 per selected campaign idea.
  // Ad Sets and Ads are NOT built here — the user runs the per-campaign
  // wizard from inside the campaign workspace to build those out.

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

    // ---- 7. Campaign ideas → draft campaign_v2 entities ----
    setMsg('Creating Campaigns…');
    var selIdeas = (state.campaign_ideas || []).filter(function(c) { return c._selected; });
    var campaignCount = 0;
    var firstCampaignId = '';

    for (var ii = 0; ii < selIdeas.length; ii++) {
      var idea = selIdeas[ii];

      // Map wizard message indices → real entity ids
      var ideaMsgIds = (idea.message_idx_list || []).map(function(i) {
        var realI = selMessages[i] ? (state.messages || []).indexOf(selMessages[i]) : -1;
        return realI >= 0 ? messageIdxToId[realI] : null;
      }).filter(Boolean);

      // Map persona idx → real entity id (or empty)
      var ideaPersonaEntId = '';
      if (idea.persona_idx != null && idea.persona_idx >= 0) {
        var personaWizard = selPersonas[idea.persona_idx];
        var personaRealIdx = personaWizard ? (state.personas || []).indexOf(personaWizard) : -1;
        if (personaRealIdx >= 0) ideaPersonaEntId = personaIdxToId[personaRealIdx] || '';
      }

      // Compose a brief that captures the linked persona so the per-campaign
      // wizard has full context to pick up.
      var briefText = idea.brief || '';
      if (ideaPersonaEntId) {
        var pEnt = getPersona(ideaPersonaEntId);
        if (pEnt && pEnt.name) {
          briefText = (briefText ? briefText + '\n\n' : '') + 'Target persona: ' + pEnt.name;
        }
      }

      var campEnt = createEntity('campaign_v2', $.extend({}, C.META_CAMPAIGN_DEFAULTS, {
        name:        idea.name || 'Untitled campaign',
        description: '',
        objective:   C.META_OBJECTIVES[idea.objective] ? idea.objective : C.META_CAMPAIGN_DEFAULTS.objective,
        brief:       briefText,
        ai_instructions: ideaMsgIds.length ? 'Linked message ids: ' + ideaMsgIds.join(',') : '',
        status:      'DRAFT'
      }));
      if (!campEnt) continue;
      state.created.campaignV2Ids.push(campEnt.id);
      if (!firstCampaignId) firstCampaignId = campEnt.id;
      campaignCount++;
    }

    // ---- 8. Mark setup complete + log ----
    setMsg('Finishing up…');
    S.meta.setup.setup_complete = true;
    logActivity(
      'setup_completed', '', '', ws.name || 'Workspace',
      'Setup wizard: created ' + campaignCount + ' Campaign idea' + (campaignCount !== 1 ? 's' : '')
    );
    buildMaps();
    syncToTextarea();

    // ---- 9. Clear session & close wizard ----
    if (window._cpPart2A && typeof window._cpPart2A.swClearSession === 'function') {
      window._cpPart2A.swClearSession();
    }
    $('.cp-setup-wizard').remove();

    // ---- 10. Re-render app shell & navigate to Campaigns list ----
    if (window._cpRenderAppShell) {
      $('#cpApp').html(window._cpRenderAppShell());
      $('.cp-ai-picker-loading').each(function() {
        var actionId = $(this).data('pending-action');
        if (actionId) $(this).replaceWith(LLMService.renderInlinePicker(actionId));
      });
      updateAIStatusIndicator();
    }
    S.selectedCampaignV2Id = null;
    S.selectedAdSetId = null;
    S.selectedAdId = null;
    navigate('meta_campaigns');

    toast(
      'Workspace ready! Created ' + campaignCount + ' Campaign idea' + (campaignCount !== 1 ? 's' : '') +
      '. Open one and run "AI Setup for this Campaign" to build out Ad Sets and Ads.',
      'success', 6000
    );
  }
