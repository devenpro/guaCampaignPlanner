  // ============================================================
  // SECTION 9.4: SETUP WIZARD (First-Run Guided Setup)
  // ============================================================

  // --- State ---
  // Singleton object. NEVER reassign — always mutate via _swReplaceState() so the
  // exported reference in window._cpPart2A.setupWizardState stays in sync with
  // Part 2B's AI generators (which read it as a snapshot).
  var setupWizardState = {};

  var SW_STEPS = [
    { num: 1, label: 'Workspace',        sublabel: 'Brand & product',       phase: 'a', icon: 'building' },
    { num: 2, label: 'AI Setup',         sublabel: 'Configure provider',    phase: 'a', icon: 'robot' },
    { num: 3, label: 'Personas',         sublabel: 'Target audiences',      phase: 'b', icon: 'users' },
    { num: 4, label: 'Pain Points',      sublabel: 'Audience challenges',   phase: 'b', icon: 'bolt' },
    { num: 5, label: 'Messages',         sublabel: 'Ad angles & hooks',     phase: 'b', icon: 'comment-dots' },
    { num: 6, label: 'Styles & Formats', sublabel: 'Creative approach',     phase: 'b', icon: 'palette' },
    { num: 7, label: 'Campaign Ideas',   sublabel: 'Pick campaigns to plan', phase: 'c', icon: 'lightbulb' },
    { num: 8, label: 'Review',           sublabel: 'Launch your workspace', phase: 'c', icon: 'rocket' }
  ];

  var SW_PHASE_LABELS = { a: 'Phase A — Foundation', b: 'Phase B — Library', c: 'Phase C — Campaigns' };

  // Volatile keys excluded from session persistence (re-derived each run)
  var SW_VOLATILE_KEYS = ['aiLoading', 'aiActionId', 'aiStartedAt', 'aiError'];

  // --- State persistence (session storage) ---
  function swSaveSession() {
    try {
      var clone = $.extend(true, {}, setupWizardState);
      for (var i = 0; i < SW_VOLATILE_KEYS.length; i++) delete clone[SW_VOLATILE_KEYS[i]];
      sessionStorage.setItem('cp_sw_state', JSON.stringify(clone));
    } catch(e) {}
  }
  function swLoadSession() {
    try {
      var saved = sessionStorage.getItem('cp_sw_state');
      if (saved) {
        var parsed = JSON.parse(saved);
        if (parsed && parsed.step) {
          // Merge over fresh defaults so older sessions get any new fields
          var merged = $.extend(true, _swFreshState(), parsed);
          merged.aiLoading = false; merged.aiActionId = ''; merged.aiStartedAt = 0;
          return merged;
        }
      }
    } catch(e) {}
    return null;
  }
  function swClearSession() {
    try { sessionStorage.removeItem('cp_sw_state'); } catch(e) {}
  }

  // --- Dot-path helpers for field collection ---
  function swSetPath(path, val) {
    var parts = path.split('.');
    var obj = setupWizardState;
    for (var i = 0; i < parts.length - 1; i++) { obj = obj[parts[i]] = obj[parts[i]] || {}; }
    obj[parts[parts.length - 1]] = val;
  }
  function swGetPath(path) {
    var parts = path.split('.');
    var obj = setupWizardState;
    for (var i = 0; i < parts.length; i++) { if (obj == null) return ''; obj = obj[parts[i]]; }
    return obj == null ? '' : obj;
  }

  // --- Collect all data-sw-field inputs from current step ---
  function swCollectFields() {
    $('.cp-sw-content-inner [data-sw-field]').each(function() {
      var path = $(this).data('sw-field');
      if (!path) return;
      var val = $(this).is(':checkbox') ? $(this).is(':checked') : $(this).val();
      swSetPath(path, val || '');
    });
    // Step 2: capture AI picker provider/model (rendered by LLMService, no data-sw-field)
    if (setupWizardState.step === 2) {
      var $prov = $('.cp-ai-provider-select[data-action-id="sw-ai-config"]');
      var $mod  = $('.cp-ai-model-select[data-action-id="sw-ai-config"]');
      if ($prov.length) setupWizardState.aiConfig.provider = $prov.val();
      if ($mod.length)  setupWizardState.aiConfig.model    = $mod.val();
    }
  }

  // Replace properties on the singleton `setupWizardState` object instead of
  // reassigning the variable. The exported reference in window._cpPart2A.setupWizardState
  // is captured at module load time, so reassigning the IIFE-local variable
  // would silently desync Part 2B (AI generators) from Part 2A (renderers).
  function _swReplaceState(newState) {
    var keys = Object.keys(setupWizardState);
    for (var i = 0; i < keys.length; i++) delete setupWizardState[keys[i]];
    var nkeys = Object.keys(newState);
    for (var j = 0; j < nkeys.length; j++) setupWizardState[nkeys[j]] = newState[nkeys[j]];
  }

  // Forward-declared call at end of file initializes the singleton shape.
  function _swFreshState() {
    return {
      step: 1,
      aiLoading: false, aiActionId: '', aiStartedAt: 0, aiError: '',
      stepGenerated: {}, stepSkipped: {},
      _expandedCards: {}, _ppActiveTab: 0,
      workspace: { name: '', description: '', product_name: '', objective: '',
                   brand_voice: '', target_audience: '', custom_instructions: '' },
      aiConfig: { provider: '', model: '', tested: false },
      // Library entities — selected during steps 3-6
      personas:    [],  // [{ name, description, demographics:{}, psychographics:{}, _selected }]
      pain_points: [],  // [{ pain_point, solution, category, _persona_idx, _selected }]
      messages:    [],  // [{ name, description, theme, hook_type, funnel_stage, body, _selected }]
      styles:      [],  // [{ name, description, _selected }]
      formats:     [],  // [{ name, description, category, _selected }]
      // Step 7 produces a list of named campaign ideas. Each idea becomes a
      // draft campaign_v2 on launch. Ad Sets + Ads are built later by the
      // per-campaign wizard from inside the campaign workspace.
      campaign_ideas: [],   // [{ name, objective, brief, persona_idx, message_idx_list, _selected }]
      _campaignIdeasContext: '',
      created: {
        personaIds: [], painPointIds: [], messageIds: [],
        styleIds: [], formatIds: [],
        campaignV2Ids: [],
        lastGeneratedAt: {}
      },
      finalizing: false, finalizeMsg: ''
    };
  }

  // --- Open wizard (entry point) ---
  function openSetupWizard(forceReset) {
    // Try to resume session unless forced reset
    if (!forceReset) {
      var saved = swLoadSession();
      if (saved && !saved.finalizing) {
        // Ask user to resume or restart
        openConfirmDialog({
          title: 'Resume Setup?',
          message: 'You have an incomplete setup from a previous session (Step ' + saved.step + ' of 8). Would you like to continue where you left off?',
          confirmLabel: 'Resume',
          cancelLabel: 'Start Over',
          onConfirm: function() { _swReplaceState(saved); _renderSetupWizardDOM(); },
          onCancel:  function() { swClearSession(); _initFreshWizard(); }
        });
        return;
      }
    }
    _initFreshWizard();
  }

  function _initFreshWizard() {
    _swReplaceState(_swFreshState());
    _renderSetupWizardDOM();
  }

  function _renderSetupWizardDOM() {
    // Remove any existing wizard overlay
    $('.cp-setup-wizard').remove();
    // Build and append overlay to #cpApp with ARIA dialog role
    var $wizard = $('<div class="cp-setup-wizard" id="cpSetupWizard" role="dialog" aria-modal="true" aria-label="Campaign Planner Setup Wizard"></div>');
    $('#cpApp').append($wizard);
    renderSetupWizard();
  }

  // --- Main render (full wizard shell) ---
  function renderSetupWizard() {
    var html = _buildSWProgressBar();
    html += '<div class="cp-sw-layout">';
    html += _buildSWRail();
    html += _buildSWContentArea();
    html += '</div>';
    $('#cpSetupWizard').html(html);
    // Focus first input in the content area
    setTimeout(function() {
      var $first = $('#cpSetupWizard .cp-sw-content-inner input, #cpSetupWizard .cp-sw-content-inner textarea, #cpSetupWizard .cp-sw-content-inner select');
      if ($first.length) $first.first().focus();
    }, 50);
  }

  // --- Partial refresh (rail + content only — avoids full re-render) ---
  function refreshSetupWizard() {
    swSaveSession();
    $('#cpSetupWizard .cp-sw-progress-fill').css('width', _swProgressPct() + '%');
    $('#cpSetupWizard .cp-sw-rail-steps').html(_buildSWRailSteps());
    $('#cpSetupWizard .cp-sw-content-inner').html(_buildSWStepContent());
    $('#cpSetupWizard .cp-sw-footer').html(_buildSWFooter());
    // Focus first focusable element in new step
    setTimeout(function() {
      var $first = $('#cpSetupWizard .cp-sw-content-inner input:not([type=hidden]), #cpSetupWizard .cp-sw-content-inner textarea, #cpSetupWizard .cp-sw-content-inner select');
      if ($first.length) $first.first().focus();
    }, 50);
  }

  // --- Build: top progress bar ---
  function _buildSWProgressBar() {
    return '<div class="cp-sw-progress-bar"><div class="cp-sw-progress-fill" style="width:' + _swProgressPct() + '%"></div></div>';
  }
  function _swProgressPct() {
    return Math.round(((setupWizardState.step - 1) / 8) * 100);
  }

  // --- Build: left rail ---
  function _buildSWRail() {
    var html = '<div class="cp-sw-rail">';
    html += '<div class="cp-sw-rail-header">';
    html += '<div class="cp-sw-rail-logo">Campaign<span class="cp-sw-rail-logo-accent">Planner</span></div>';
    html += '<div class="cp-sw-rail-subtitle">Setup Wizard</div>';
    html += '</div>';
    html += '<div class="cp-sw-rail-steps">' + _buildSWRailSteps() + '</div>';
    // Footer — brand connection status
    html += '<div class="cp-sw-rail-footer">';
    var brandOn = S && S.brand && S.brand.configured;
    html += '<div class="cp-sw-rail-brand">';
    html += '<div class="cp-sw-rail-brand-dot' + (brandOn ? '' : ' cp-sw-rail-brand-dot--off') + '"></div>';
    html += '<span>' + (brandOn ? 'Brand profile connected' : 'No brand profile') + '</span>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  function _buildSWRailSteps() {
    var ws          = setupWizardState;
    var currentStep = ws.step;
    // Count map: how many items are selected per step (for done badge)
    var step7Count = (ws.campaign_ideas || []).filter(function(c) { return c._selected; }).length;
    var stepCounts = {
      3: (ws.personas    || []).filter(function(p) { return p._selected; }).length,
      4: (ws.pain_points || []).filter(function(p) { return p._selected; }).length,
      5: (ws.messages    || []).filter(function(m) { return m._selected; }).length,
      6: (ws.styles      || []).filter(function(s) { return s._selected; }).length +
         (ws.formats     || []).filter(function(f) { return f._selected; }).length,
      7: step7Count
    };
    var html = '';
    var lastPhase = '';
    for (var i = 0; i < SW_STEPS.length; i++) {
      var st = SW_STEPS[i];
      if (st.phase !== lastPhase) {
        html += '<div class="cp-sw-phase-label">' + esc(SW_PHASE_LABELS[st.phase]) + '</div>';
        lastPhase = st.phase;
      }
      var isDone      = st.num < currentStep;
      var isActive    = st.num === currentStep;
      var isLocked    = st.num > currentStep;
      var isClickable = isDone;
      var cls = 'cp-sw-step-item';
      if (isActive)    cls += ' cp-sw-step-item--active';
      if (isDone)      cls += ' cp-sw-step-item--done';
      if (isLocked)    cls += ' cp-sw-step-item--locked';
      if (isClickable) cls += ' cp-sw-step-item--clickable';

      html += '<div class="' + cls + '"';
      if (isClickable) html += ' data-action="sw-goto-step" data-step="' + st.num + '"';
      html += ' role="' + (isClickable ? 'button' : 'listitem') + '"';
      if (isClickable) html += ' tabindex="0"';
      if (isActive)    html += ' aria-current="step"';
      html += '>';

      html += '<div class="cp-sw-step-left">';
      html += '<div class="cp-sw-step-circle">';
      if (isDone) html += icon('check');
      else html += st.num;
      html += '</div>';
      if (i < SW_STEPS.length - 1) {
        html += '<div class="cp-sw-step-connector' + (isDone ? ' cp-sw-step-connector--done' : '') + '"></div>';
      }
      html += '</div>';

      html += '<div class="cp-sw-step-text">';
      html += '<div class="cp-sw-step-label">' + esc(st.label);
      // Selection count badge for done steps with counted items
      if (isDone && stepCounts[st.num] > 0) {
        html += '<span class="cp-sw-step-badge">' + stepCounts[st.num] + '</span>';
      }
      html += '</div>';
      html += '<div class="cp-sw-step-sublabel">' + esc(st.sublabel) + '</div>';
      html += '</div>';
      html += '</div>';
    }
    return html;
  }

  // --- Build: right content area ---
  function _buildSWContentArea() {
    var html = '<div class="cp-sw-content">';
    html += '<div class="cp-sw-content-scroll"><div class="cp-sw-content-inner">';
    html += _buildSWStepContent();
    html += '</div></div>';
    html += '<div class="cp-sw-footer">' + _buildSWFooter() + '</div>';
    html += '</div>';
    return html;
  }

  // --- Step content router ---
  function _buildSWStepContent() {
    var n = setupWizardState.step;
    // Delegate to registered step renderers (added in later phases)
    if (typeof renderSWStep1 === 'function' && n === 1) return renderSWStep1();
    if (typeof renderSWStep2 === 'function' && n === 2) return renderSWStep2();
    if (typeof renderSWStep3 === 'function' && n === 3) return renderSWStep3();
    if (typeof renderSWStep4 === 'function' && n === 4) return renderSWStep4();
    if (typeof renderSWStep5 === 'function' && n === 5) return renderSWStep5();
    if (typeof renderSWStep6 === 'function' && n === 6) return renderSWStep6();
    if (typeof renderSWStep7 === 'function' && n === 7) return renderSWStep7();
    if (typeof renderSWStep8 === 'function' && n === 8) return renderSWStep8();
    return _buildSWStepPlaceholder(n);
  }

  function _buildSWStepPlaceholder(n) {
    var st = SW_STEPS[n - 1] || {};
    var phaseKey = st.phase || 'a';
    var html = _buildSWStepHeader(st.label || 'Step ' + n, 'This step is coming soon.', phaseKey);
    html += '<div class="cp-sw-placeholder-body">';
    html += '<div class="cp-sw-placeholder-icon">' + icon(st.icon || 'circle') + '</div>';
    html += '<p>' + esc('Step ' + n + ': ' + (st.label || '')) + ' — content will be added in a later phase.</p>';
    html += '</div>';
    return html;
  }

  // --- Reusable step header builder ---
  function _buildSWStepHeader(title, subtitle, phase) {
    var phaseCls = { a: 'cp-sw-phase-badge--a', b: 'cp-sw-phase-badge--b', c: 'cp-sw-phase-badge--c' };
    var html = '<div class="cp-sw-step-header">';
    html += '<div class="cp-sw-phase-badge ' + (phaseCls[phase] || phaseCls.a) + '">' + esc(SW_PHASE_LABELS[phase] || '') + '</div>';
    html += '<h2 class="cp-sw-step-title">' + esc(title) + '</h2>';
    html += '<p class="cp-sw-step-subtitle">' + esc(subtitle) + '</p>';
    html += '</div>';
    return html;
  }

  // --- Build: footer navigation ---
  function _buildSWFooter() {
    var n = setupWizardState.step;
    var isFirst = n === 1;
    var isLast  = n === 8;
    var html = '';

    // Left: Back button
    html += '<div class="cp-sw-footer-left">';
    if (!isFirst) {
      html += '<button class="cp-btn cp-btn-outline" data-action="sw-back">' + icon('arrow-left') + ' Back</button>';
    } else {
      html += '<span></span>';
    }
    html += '</div>';

    // Center: step counter + skip link
    html += '<div class="cp-sw-footer-center">';
    html += '<div class="cp-sw-step-counter">Step ' + n + ' of 8</div>';
    if (!isFirst && !isLast && n !== 1) {
      html += '<button class="cp-sw-skip-link" data-action="sw-skip">Skip this step</button>';
    }
    html += '</div>';

    // Right: Next / Launch button
    html += '<div class="cp-sw-footer-right">';
    if (!isLast) {
      html += '<button class="cp-btn cp-btn-primary" data-action="sw-next">Next ' + icon('arrow-right') + '</button>';
    } else {
      html += '<button class="cp-btn cp-btn-ai" data-action="sw-launch">' + icon('rocket') + ' Launch Workspace</button>';
    }
    html += '</div>';

    return html;
  }

  // --- Validation ---
  function validateSWStep(n) {
    var ws = setupWizardState;
    if (n === 1) {
      if (!ws.workspace.name.trim())         return { valid: false, message: 'Please enter a workspace name to continue.' };
      if (!ws.workspace.product_name.trim()) return { valid: false, message: 'Please enter your product or service name.' };
    }
    if (n === 3) {
      if (ws.personas.filter(function(p) { return p._selected; }).length === 0) {
        return { valid: false, message: 'Please select at least one persona to continue.' };
      }
    }
    if (n === 5) {
      if (ws.messages.filter(function(m) { return m._selected; }).length === 0) {
        return { valid: false, message: 'Please select at least one message to continue.' };
      }
    }
    if (n === 6) {
      var noStyle  = ws.styles.filter(function(s) { return s._selected; }).length === 0;
      var noFormat = ws.formats.filter(function(f) { return f._selected; }).length === 0;
      if (noStyle || noFormat) {
        return { valid: false, message: 'Please select at least one style and one format to continue.' };
      }
    }
    if (n === 7) {
      var ideas = (ws.campaign_ideas || []).filter(function(c) { return c._selected; });
      if (ideas.length === 0) {
        return { valid: false, message: 'Please select at least one campaign idea to continue.' };
      }
      // Each selected idea needs at least a name
      for (var i = 0; i < ideas.length; i++) {
        if (!(ideas[i].name && ideas[i].name.trim())) {
          return { valid: false, message: 'Each selected campaign idea needs a name.' };
        }
      }
    }
    return { valid: true };
  }

  // --- Show inline validation message ---
  function _showSWValidation(message) {
    $('.cp-sw-validation').remove();
    var $msg = $('<div class="cp-sw-validation">' + icon('warning') + ' <span>' + esc(message) + '</span></div>');
    $('.cp-sw-footer').prepend($msg);
    setTimeout(function() { $msg.fadeOut(300, function() { $msg.remove(); }); }, 4000);
  }

  // --- Navigation ---
  function swGoNext() {
    swCollectFields();
    var n = setupWizardState.step;
    var v = validateSWStep(n);
    if (!v.valid) { _showSWValidation(v.message); return; }
    if (n < 8) {
      setupWizardState.step = n + 1;
      refreshSetupWizard();
      // Trigger AI auto-generation for the new step if applicable
      _swAutoTriggerAI(setupWizardState.step);
    }
  }

  function swGoBack() {
    swCollectFields();
    if (setupWizardState.step > 1) {
      setupWizardState.step--;
      refreshSetupWizard();
    }
  }

  function swSkipStep() {
    var n = setupWizardState.step;
    setupWizardState.stepSkipped[n] = true;
    if (n < 8) {
      setupWizardState.step = n + 1;
      refreshSetupWizard();
      _swAutoTriggerAI(setupWizardState.step);
    }
  }

  function swGotoStep(n) {
    // Only allow navigating to already-completed steps
    if (n < setupWizardState.step) {
      swCollectFields();
      setupWizardState.step = n;
      refreshSetupWizard();
    }
  }

  // --- Auto-trigger AI for steps that support it ---
  function _swAutoTriggerAI(n) {
    var R    = window._cpRenderers || {};
    var p2b  = window._cpPart2B;
    var cfg  = setupWizardState.aiConfig;
    var LLM  = p2b && p2b.LLMService;

    // Persist wizard picker selection so Part 2B's resolveSelection finds it
    if (cfg.provider && cfg.model && LLM) {
      LLM.savePreference('sw-ai-config', cfg.provider, cfg.model);
    }

    // Show inline error if AI isn't configured and the step needs it
    if (n >= 3 && n <= 7 && LLM && !LLM.isConfigured()) {
      setupWizardState.aiError = 'AI not configured. Go back to Step 2 (AI Setup) or configure providers in Settings → AI.';
      refreshSetupWizard();
      return;
    }

    // Only generate once per wizard session per step (Regenerate flips the flag)
    if (setupWizardState.stepGenerated[n]) return;

    if (n === 3 && typeof R.swAIGeneratePersonas       === 'function') R.swAIGeneratePersonas();
    if (n === 4 && typeof R.swAIGeneratePainPoints     === 'function') R.swAIGeneratePainPoints();
    if (n === 5 && typeof R.swAIGenerateMessages       === 'function') R.swAIGenerateMessages();
    if (n === 6 && typeof R.swAIGenerateStylesFormats  === 'function') R.swAIGenerateStylesFormats();
    if (n === 7 && typeof R.swAIGenerateCampaignIdeas  === 'function') R.swAIGenerateCampaignIdeas();
  }

  // --- Cancel any in-flight wizard AI generation ---
  function swCancelAIGeneration() {
    var state = setupWizardState;
    var aid   = state.aiActionId || 'sw-ai-config';
    if (window._cpPart2B && window._cpPart2B.LLMService && typeof window._cpPart2B.LLMService.abortAction === 'function') {
      window._cpPart2B.LLMService.abortAction(aid);
    }
    state.aiLoading = false;
    state.aiActionId = '';
    state.aiError = 'Generation cancelled.';
    refreshSetupWizard();
  }

  // --- Retry a step's AI generation ---
  function swRetryStep(n) {
    setupWizardState.stepGenerated[n] = false;
    setupWizardState.aiError = '';
    refreshSetupWizard();
    _swAutoTriggerAI(n);
  }

  // --- Format relative time for "Last generated" badges ---
  function _swRelTime(ts) {
    if (!ts) return '';
    var diff = Date.now() - ts;
    if (diff < 5000)      return 'just now';
    if (diff < 60000)     return Math.round(diff / 1000) + 's ago';
    if (diff < 3600000)   return Math.round(diff / 60000) + 'm ago';
    if (diff < 86400000)  return Math.round(diff / 3600000) + 'h ago';
    return new Date(ts).toLocaleString();
  }

  // Initialize singleton with fresh state shape so anything reading it before
  // openSetupWizard runs gets a sensible object (rather than `{}`).
  _swReplaceState(_swFreshState());

