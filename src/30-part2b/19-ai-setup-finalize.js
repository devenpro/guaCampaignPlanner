  // ============================================================
  // SECTION 15c: SETUP WIZARD — FINALIZE
  // ============================================================

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
    if (ws.name)                S.meta.workspace.name                  = ws.name;
    if (!S.meta.workspace.created) S.meta.workspace.created            = new Date().toISOString();
    if (ws.product_name)        S.meta.setup.product_name              = ws.product_name;
    if (ws.objective)           S.meta.setup.objective                 = ws.objective;
    if (ws.custom_instructions) S.meta.setup.custom_instructions       = ws.custom_instructions;

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

    buildMaps(); // rebuild so IDs are resolvable

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

    buildMaps(); // rebuild again before campaign + recipe creation

    // ---- 7. Campaign ----
    setMsg('Creating campaign…');
    var cam = state.campaign || {};
    var campEnt = createEntity('campaign', {
      name:         cam.name         || ws.product_name || 'My Campaign',
      objective:    cam.objective    || ws.objective    || '',
      date_start:   cam.date_start   || '',
      date_end:     cam.date_end     || '',
      budget_notes: cam.budget_notes || '',
      persona_ids:  state.created.personaIds.slice(),
      message_ids:  state.created.messageIds.slice(),
      style_ids:    state.created.styleIds.slice(),
      format_ids:   state.created.formatIds.slice()
    });
    state.created.campaignId = campEnt.id;

    // ---- 8. Recipes (selected combos) ----
    setMsg('Creating ad recipes…');
    var selCombos = (state.combos || []).filter(function(c) { return c.selected; });
    for (var ci = 0; ci < selCombos.length; ci++) {
      var combo  = selCombos[ci];
      var pOri   = combo.persona ? (state.personas || []).indexOf(combo.persona) : -1;
      var mOri   = combo.message ? (state.messages || []).indexOf(combo.message) : -1;
      var sOri   = combo.style   ? (state.styles   || []).indexOf(combo.style)   : -1;
      var fOri   = combo.format  ? (state.formats  || []).indexOf(combo.format)  : -1;
      var rEnt   = createEntity('recipe', {
        campaign_id:      campEnt.id,
        persona_id:       personaIdxToId[pOri]  || '',
        message_id:       messageIdxToId[mOri]  || '',
        style_id:         styleIdxToId[sOri]    || '',
        visual_format_id: formatIdxToId[fOri]   || ''
      });
      state.created.recipeIds.push(rEnt.id);
    }

    // ---- 9. Mark setup complete ----
    setMsg('Finishing up…');
    S.meta.setup.setup_complete = true;
    logActivity('setup_completed', '', '', ws.name || 'Workspace', 'Setup wizard completed');
    buildMaps();
    syncToTextarea();

    // ---- 10. Clear session & close wizard ----
    if (window._cpPart2A && typeof window._cpPart2A.swClearSession === 'function') {
      window._cpPart2A.swClearSession();
    }
    $('.cp-setup-wizard').remove();

    // ---- 11. Re-render app shell & navigate to campaigns ----
    if (window._cpRenderAppShell) {
      $('#cpApp').html(window._cpRenderAppShell());
      // Re-attach AI picker placeholders and status indicator into new shell
      $('.cp-ai-picker-loading').each(function() {
        var actionId = $(this).data('pending-action');
        if (actionId) $(this).replaceWith(LLMService.renderInlinePicker(actionId));
      });
      updateAIStatusIndicator();
    }
    navigate('campaigns');

    var rCount = state.created.recipeIds.length;
    toast(
      'Workspace ready! Created ' + state.created.personaIds.length + ' personas, ' +
      state.created.messageIds.length + ' messages, and ' + rCount + ' recipe' + (rCount !== 1 ? 's' : '') + '.',
      'success', 6000
    );
  }

