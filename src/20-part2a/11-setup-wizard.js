  // ============================================================
  // SECTION 9.4: SETUP WIZARD (First-Run Guided Setup)
  // ============================================================
  //
  // Six-stage flow:
  //   1. Brand & AI   — brand context + AI provider/model + custom instructions
  //                     + mode picker (Manual vs Full Auto)
  //   2. Personas & Pain Points (merged)
  //   3. Messages
  //   4. Styles & Formats
  //   5. Campaign Ideas
  //   6. Review & Launch
  //
  // Auto-launches on empty state. The close (X) button is gated and only
  // appears after Stage 1 is complete (AI configured + mode chosen).

  // --- State ---
  // Singleton object. NEVER reassign — always mutate via _swReplaceState() so the
  // exported reference in window._cpPart2A.setupWizardState stays in sync with
  // Part 2B's AI generators (which read it as a snapshot).
  var setupWizardState = {};

  var SW_STAGES = [
    { num: 1, label: 'Brand & AI',           sublabel: 'Context + provider',     phase: 'a', icon: 'sparkles',     genKey: null },
    { num: 2, label: 'Personas & Pain',      sublabel: 'Who & their challenges', phase: 'b', icon: 'users',        genKey: 'personas' },
    { num: 3, label: 'Messages',             sublabel: 'Ad angles & hooks',      phase: 'b', icon: 'comment-dots', genKey: 'messages' },
    { num: 4, label: 'Styles & Formats',     sublabel: 'Creative approach',      phase: 'b', icon: 'palette',      genKey: 'stylesFormats' },
    { num: 5, label: 'Campaign Ideas',       sublabel: 'Pick campaigns to plan', phase: 'c', icon: 'lightbulb',    genKey: 'campaignIdeas' },
    { num: 6, label: 'Review',               sublabel: 'Launch your workspace',  phase: 'c', icon: 'rocket',       genKey: null }
  ];
  var SW_STAGE_COUNT = SW_STAGES.length;

  var SW_PHASE_LABELS = { a: 'Foundation', b: 'Library', c: 'Campaigns' };

  // Auto-advance delay (ms) shown to the user as a result preview between
  // stages in Full Auto mode. Long enough to read the headline, short enough
  // to feel like a chained run. User can hit Pause to freeze.
  var SW_AUTO_ADVANCE_MS = 2500;

  // Volatile keys excluded from session persistence (re-derived each run)
  var SW_VOLATILE_KEYS = ['aiLoading', 'aiActionId', 'aiStartedAt', 'aiError',
                          '_autoAdvanceTimer', '_autoAdvanceUntil', 'paused'];

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
          merged.paused = false; merged._autoAdvanceTimer = null;
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

  // --- Collect all data-sw-field inputs from current stage ---
  function swCollectFields() {
    $('.cp-sw-content-inner [data-sw-field]').each(function() {
      var path = $(this).data('sw-field');
      if (!path) return;
      var val = $(this).is(':checkbox') ? $(this).is(':checked') : $(this).val();
      swSetPath(path, val || '');
    });
    // Stage 1: capture AI picker provider/model (rendered by LLMService, no data-sw-field)
    if (setupWizardState.step === 1) {
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
      mode: '',  // '' until user picks; then 'manual' or 'auto'
      paused: false,
      _autoAdvanceTimer: null,
      _autoAdvanceUntil: 0,
      aiLoading: false, aiActionId: '', aiStartedAt: 0, aiError: '',
      // Generation tracking — string keys per stage (stage 2 has two: personas, painpoints)
      stepGenerated: {},   // { personas, painpoints, messages, stylesFormats, campaignIdeas }
      stepSkipped: {},
      _expandedCards: {}, _ppActiveTab: 0,
      // Pre-filled from brand context at wizard open (read-only display + AI hand-off)
      brandContext: {},
      workspace: { name: '', description: '', product_name: '', objective: '',
                   brand_voice: '', target_audience: '', custom_instructions: '' },
      aiConfig: { provider: '', model: '', tested: false },
      // Library entities — populated during stages 2-4
      personas:    [],
      pain_points: [],
      messages:    [],
      styles:      [],
      formats:     [],
      // Stage 5 produces a list of named campaign ideas. Each idea becomes a
      // draft campaign_v2 on launch. Ad Sets + Ads are built later by the
      // per-campaign wizard from inside the campaign workspace.
      campaign_ideas: [],
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

  // --- Pre-fill workspace fields from brand context when available ---
  // Brand JSON fields are heterogeneous: `audience` is an object
  // ({primary, pain_points, desires}), `forbidden_words`/`dos`/`donts`/
  // `content_pillars` are arrays, the rest are strings. Mirror the same
  // coercion conventions BrandService.getSystemPrompt() uses so the
  // brand-context card always receives strings.
  function _swPrefillFromBrand(state) {
    if (!(S.brand && S.brand.configured)) return;
    var core    = S.brand.core    || {};
    var content = S.brand.content || {};
    var video   = S.brand.video   || {};
    var ident   = S.brand.identity || {};

    function joinList(v, sep, cap) {
      if (Array.isArray(v)) return (cap ? v.slice(0, cap) : v).join(sep);
      return (v == null ? '' : String(v));
    }
    function audienceSummary(aud) {
      if (!aud) return '';
      if (typeof aud === 'string') return aud;
      // Mirrors BrandService: prefer `primary`, fall back to a one-line summary.
      if (aud.primary) return String(aud.primary);
      var bits = [];
      if (Array.isArray(aud.pain_points) && aud.pain_points.length) bits.push('Pain: ' + aud.pain_points.slice(0, 3).join('; '));
      if (Array.isArray(aud.desires)     && aud.desires.length)     bits.push('Wants: ' + aud.desires.slice(0, 3).join('; '));
      return bits.join(' · ');
    }

    state.brandContext = {
      name:      ident.name || core.brand_name || '',
      tagline:   core.tagline || '',
      voice:     core.brand_voice || content.writing_style || '',
      audience:  audienceSummary(core.audience) || (core.target_audience == null ? '' : String(core.target_audience)),
      forbidden: joinList(core.forbidden_words, ', '),
      dos:       joinList(core.dos,   '; ', 6),
      donts:     joinList(core.donts, '; ', 6),
      pillars:   joinList(video.content_pillars, ', '),
      cta:       content.cta_style || ''
    };
    // Seed workspace fields the wizard uses for AI prompts. User can still edit.
    if (!state.workspace.name && state.brandContext.name) {
      state.workspace.name = state.brandContext.name + ' Campaigns';
    }
    if (!state.workspace.product_name && state.brandContext.name) {
      state.workspace.product_name = state.brandContext.name;
    }
    if (!state.workspace.brand_voice && state.brandContext.voice) {
      state.workspace.brand_voice = state.brandContext.voice;
    }
    if (!state.workspace.target_audience && state.brandContext.audience) {
      state.workspace.target_audience = state.brandContext.audience;
    }
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
          message: 'You have an incomplete setup from a previous session (Stage ' + saved.step + ' of ' + SW_STAGE_COUNT + '). Would you like to continue where you left off?',
          confirmLabel: 'Resume',
          cancelLabel: 'Start Over',
          onConfirm: function() {
            try { _swReplaceState(saved); _renderSetupWizardDOM(); }
            catch (e) { _swHandleOpenFailure(e); }
          },
          onCancel:  function() { swClearSession(); _initFreshWizard(); }
        });
        return;
      }
    }
    _initFreshWizard();
  }

  // Recovery path when prefill or render throws. Tear down the
  // partially-built overlay so the user doesn't see a blank fixed
  // background on top of the app, surface a toast, and log the stack.
  function _swHandleOpenFailure(err) {
    try { $('.cp-setup-wizard').remove(); } catch (e2) {}
    try {
      if (typeof toast === 'function') {
        toast('Setup wizard failed to open — see console for details.', 'error', 6000);
      }
    } catch (e3) {}
    console.error('[CP] Setup wizard open/render failed:', (err && err.stack) || err);
  }

  // Auto-launch the wizard on an empty workspace. Returns true if launched.
  // Caller (init) should also check S.meta.setup.setup_complete is falsey.
  function maybeAutoLaunchSetupWizard() {
    if (!S || !S.meta || !S.data) return false;
    var setup = S.meta.setup || {};
    if (setup.setup_complete) return false;
    var hasPersonas  = Object.keys(S.data.personas       || {}).length > 0;
    var hasMessages  = Object.keys(S.data.messages       || {}).length > 0;
    var hasCampaigns = Object.keys(S.data.campaigns_v2   || {}).length > 0;
    if (hasPersonas || hasMessages || hasCampaigns) return false;
    if ($('.cp-setup-wizard').length) return false;  // already open
    console.log('[CP] Empty workspace detected — auto-launching Setup Wizard');
    openSetupWizard(false);
    return true;
  }

  function _initFreshWizard() {
    try {
      var fresh = _swFreshState();
      _swPrefillFromBrand(fresh);
      _swReplaceState(fresh);
      _renderSetupWizardDOM();
    } catch (e) {
      _swHandleOpenFailure(e);
    }
  }

  function _renderSetupWizardDOM() {
    // Remove any existing wizard overlay
    $('.cp-setup-wizard').remove();
    // Build and append overlay to #cpApp with ARIA dialog role
    var $wizard = $('<div class="cp-setup-wizard" id="cpSetupWizard" role="dialog" aria-modal="true" aria-label="Campaign Planner Setup Wizard"></div>');
    var $app = $('#cpApp');
    if ($app.length) $app.append($wizard); else $('body').append($wizard);
    renderSetupWizard();
  }

  // --- Main render (full wizard shell) ---
  function renderSetupWizard() {
    var html = _buildSWProgressBar();
    html += _buildSWCloseButton();
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
    // Re-render close button to reflect gating state
    var $close = $('#cpSetupWizard .cp-sw-close');
    if (_swStage1Complete() && !$close.length) {
      $('#cpSetupWizard').prepend(_buildSWCloseButton());
    } else if (!_swStage1Complete() && $close.length) {
      $close.remove();
    }
    // Focus first focusable element in new stage
    setTimeout(function() {
      var $first = $('#cpSetupWizard .cp-sw-content-inner input:not([type=hidden]), #cpSetupWizard .cp-sw-content-inner textarea, #cpSetupWizard .cp-sw-content-inner select');
      if ($first.length) $first.first().focus();
    }, 50);
  }

  // True when AI provider/model is selected and a mode has been chosen.
  // Gates the close button — until then, the user must engage with Stage 1.
  // Escape hatch: if no AI providers are configured at all, the user has
  // nothing to pick here, so allow close so they can go set up Settings → AI.
  function _swStage1Complete() {
    var cfg = setupWizardState.aiConfig || {};
    var hasAI = !!(cfg.provider && cfg.model);
    var hasMode = setupWizardState.mode === 'auto' || setupWizardState.mode === 'manual';
    var pastStage1 = (setupWizardState.step || 1) > 1;
    var p2b = window._cpPart2B;
    var aiUnavailable = !(p2b && p2b.LLMService && p2b.LLMService.isConfigured());
    return (hasAI && hasMode) || pastStage1 || aiUnavailable;
  }

  // --- Build: top progress bar ---
  function _buildSWProgressBar() {
    return '<div class="cp-sw-progress-bar"><div class="cp-sw-progress-fill" style="width:' + _swProgressPct() + '%"></div></div>';
  }
  function _swProgressPct() {
    return Math.round(((setupWizardState.step - 1) / SW_STAGE_COUNT) * 100);
  }

  // --- Build: gated close button (appears only after Stage 1 complete) ---
  function _buildSWCloseButton() {
    if (!_swStage1Complete()) return '';
    return '<button class="cp-sw-close" data-action="sw-close" aria-label="Close setup wizard">' + icon('x') + '</button>';
  }

  // --- Build: left rail ---
  function _buildSWRail() {
    var html = '<div class="cp-sw-rail">';
    html += '<div class="cp-sw-rail-header">';
    html += '<div class="cp-sw-rail-logo">Campaign<span class="cp-sw-rail-logo-accent">Planner</span></div>';
    html += '<div class="cp-sw-rail-subtitle">Setup Wizard</div>';
    if (setupWizardState.mode) {
      var modeLabel = setupWizardState.mode === 'auto' ? 'Full Auto' : 'Manual';
      var modeCls = setupWizardState.mode === 'auto' ? ' cp-sw-rail-mode--auto' : '';
      html += '<div class="cp-sw-rail-mode' + modeCls + '">' + icon(setupWizardState.mode === 'auto' ? 'zap' : 'hand') + ' ' + esc(modeLabel) + ' mode</div>';
    }
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
    // Count map: how many items are selected per stage (for done badge)
    var stage2Count = (ws.personas    || []).filter(function(p) { return p._selected; }).length +
                      (ws.pain_points || []).filter(function(p) { return p._selected; }).length;
    var stage5Count = (ws.campaign_ideas || []).filter(function(c) { return c._selected; }).length;
    var stageCounts = {
      2: stage2Count,
      3: (ws.messages || []).filter(function(m) { return m._selected; }).length,
      4: (ws.styles   || []).filter(function(s) { return s._selected; }).length +
         (ws.formats  || []).filter(function(f) { return f._selected; }).length,
      5: stage5Count
    };
    var html = '';
    var lastPhase = '';
    for (var i = 0; i < SW_STAGES.length; i++) {
      var st = SW_STAGES[i];
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
      if (i < SW_STAGES.length - 1) {
        html += '<div class="cp-sw-step-connector' + (isDone ? ' cp-sw-step-connector--done' : '') + '"></div>';
      }
      html += '</div>';

      html += '<div class="cp-sw-step-text">';
      html += '<div class="cp-sw-step-label">' + esc(st.label);
      // Selection count badge for done stages with counted items
      if (isDone && stageCounts[st.num] > 0) {
        html += '<span class="cp-sw-step-badge">' + stageCounts[st.num] + '</span>';
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

  // --- Stage content router ---
  function _buildSWStepContent() {
    var n = setupWizardState.step;
    if (typeof renderSWStep1 === 'function' && n === 1) return renderSWStep1();
    if (typeof renderSWStep2 === 'function' && n === 2) return renderSWStep2();
    if (typeof renderSWStep3 === 'function' && n === 3) return renderSWStep3();
    if (typeof renderSWStep4 === 'function' && n === 4) return renderSWStep4();
    if (typeof renderSWStep5 === 'function' && n === 5) return renderSWStep5();
    if (typeof renderSWStep6 === 'function' && n === 6) return renderSWStep6();
    return _buildSWStepPlaceholder(n);
  }

  function _buildSWStepPlaceholder(n) {
    var st = SW_STAGES[n - 1] || {};
    var phaseKey = st.phase || 'a';
    var html = _buildSWStepHeader(st.label || 'Stage ' + n, 'This stage is coming soon.', phaseKey);
    html += '<div class="cp-sw-placeholder-body">';
    html += '<div class="cp-sw-placeholder-icon">' + icon(st.icon || 'circle') + '</div>';
    html += '<p>' + esc('Stage ' + n + ': ' + (st.label || '')) + ' — content will be added in a later phase.</p>';
    html += '</div>';
    return html;
  }

  // --- Reusable stage header builder ---
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
    var isLast  = n === SW_STAGE_COUNT;
    var html = '';

    // Auto-advance preview bar takes over the whole footer in Full Auto mode
    // between stages — the user sees "Auto-advancing… Pause".
    if (setupWizardState._autoAdvanceTimer && !setupWizardState.paused) {
      html += '<div class="cp-sw-footer-auto">';
      html += '<div class="cp-sw-footer-auto-msg">' + icon('zap') + ' Reviewing this stage — auto-advancing in a moment…</div>';
      html += '<button class="cp-btn cp-btn-outline" data-action="sw-pause-auto">' + icon('pause') + ' Pause</button>';
      html += '</div>';
      return html;
    }
    if (setupWizardState.paused) {
      html += '<div class="cp-sw-footer-auto cp-sw-footer-auto--paused">';
      html += '<div class="cp-sw-footer-auto-msg">' + icon('pause') + ' Auto run paused. Edit anything you want, then resume.</div>';
      html += '<button class="cp-btn cp-btn-outline" data-action="sw-resume-auto">' + icon('zap') + ' Resume auto</button>';
      if (!isLast) {
        html += '<button class="cp-btn cp-btn-primary" data-action="sw-next">Continue manually ' + icon('arrow-right') + '</button>';
      }
      return html + '</div>';
    }

    // Left: Back button
    html += '<div class="cp-sw-footer-left">';
    if (!isFirst) {
      html += '<button class="cp-btn cp-btn-outline" data-action="sw-back">' + icon('arrow-left') + ' Back</button>';
    } else {
      html += '<span></span>';
    }
    html += '</div>';

    // Center: stage counter + skip link
    html += '<div class="cp-sw-footer-center">';
    html += '<div class="cp-sw-step-counter">Stage ' + n + ' of ' + SW_STAGE_COUNT + '</div>';
    if (!isFirst && !isLast) {
      html += '<button class="cp-sw-skip-link" data-action="sw-skip">Skip this stage</button>';
    }
    html += '</div>';

    // Right: Next / Launch button — except on Stage 1, where mode pickers replace it
    html += '<div class="cp-sw-footer-right">';
    if (isFirst) {
      // Stage 1 has its own mode-pick buttons inline. Hide footer-right.
      html += '<span class="cp-sw-footer-hint">Pick a mode above to continue</span>';
    } else if (!isLast) {
      var label = setupWizardState.mode === 'auto' ? 'Approve & auto-continue' : 'Approve & continue';
      html += '<button class="cp-btn cp-btn-primary" data-action="sw-next">' + esc(label) + ' ' + icon('arrow-right') + '</button>';
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
      if (!ws.aiConfig.provider || !ws.aiConfig.model) {
        return { valid: false, message: 'Pick an AI provider and model to continue.' };
      }
      if (!ws.mode) {
        return { valid: false, message: 'Choose Manual or Full Auto to start.' };
      }
    }
    if (n === 2) {
      if (ws.personas.filter(function(p) { return p._selected; }).length === 0) {
        return { valid: false, message: 'Please select at least one persona to continue.' };
      }
    }
    if (n === 3) {
      if (ws.messages.filter(function(m) { return m._selected; }).length === 0) {
        return { valid: false, message: 'Please select at least one message to continue.' };
      }
    }
    if (n === 4) {
      var noStyle  = ws.styles.filter(function(s) { return s._selected; }).length === 0;
      var noFormat = ws.formats.filter(function(f) { return f._selected; }).length === 0;
      if (noStyle || noFormat) {
        return { valid: false, message: 'Please select at least one style and one format to continue.' };
      }
    }
    if (n === 5) {
      var ideas = (ws.campaign_ideas || []).filter(function(c) { return c._selected; });
      if (ideas.length === 0) {
        return { valid: false, message: 'Please select at least one campaign idea to continue.' };
      }
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

  // --- Cancel any pending auto-advance timer ---
  function _swClearAutoAdvance() {
    if (setupWizardState._autoAdvanceTimer) {
      clearTimeout(setupWizardState._autoAdvanceTimer);
      setupWizardState._autoAdvanceTimer = null;
      setupWizardState._autoAdvanceUntil = 0;
    }
  }

  // --- Schedule auto-advance in Full Auto mode (called after AI completes) ---
  function _swScheduleAutoAdvance() {
    if (setupWizardState.mode !== 'auto') return;
    if (setupWizardState.paused) return;
    if (setupWizardState.aiError) return;
    if (setupWizardState.step >= SW_STAGE_COUNT) return;
    _swClearAutoAdvance();
    setupWizardState._autoAdvanceUntil = Date.now() + SW_AUTO_ADVANCE_MS;
    setupWizardState._autoAdvanceTimer = setTimeout(function() {
      setupWizardState._autoAdvanceTimer = null;
      // Validate current stage before auto-advancing; on failure, fall back to manual.
      var v = validateSWStep(setupWizardState.step);
      if (!v.valid) {
        setupWizardState.paused = true;
        refreshSetupWizard();
        return;
      }
      if (setupWizardState.step < SW_STAGE_COUNT) {
        setupWizardState.step++;
        refreshSetupWizard();
        _swAutoTriggerAI(setupWizardState.step);
      }
    }, SW_AUTO_ADVANCE_MS);
    // Refresh footer to show the auto-advance bar
    $('#cpSetupWizard .cp-sw-footer').html(_buildSWFooter());
  }

  // --- Mode picker (Stage 1) ---
  function swStartMode(mode) {
    swCollectFields();
    var v = validateSWStep(1);
    if (!v.valid) { _showSWValidation(v.message); return; }
    setupWizardState.mode = mode === 'auto' ? 'auto' : 'manual';
    setupWizardState.paused = false;
    // Persist AI picker selection so resolveSelection() picks it up downstream
    var p2b = window._cpPart2B;
    if (p2b && p2b.LLMService && setupWizardState.aiConfig.provider && setupWizardState.aiConfig.model) {
      p2b.LLMService.savePreference('sw-ai-config', setupWizardState.aiConfig.provider, setupWizardState.aiConfig.model);
    }
    setupWizardState.step = 2;
    refreshSetupWizard();
    _swAutoTriggerAI(2);
  }

  // --- Pause / resume Full Auto run ---
  function swPauseAutoRun() {
    _swClearAutoAdvance();
    setupWizardState.paused = true;
    refreshSetupWizard();
  }
  function swResumeAutoRun() {
    setupWizardState.paused = false;
    refreshSetupWizard();
    // If the current stage already has its generation done, resume the chain.
    var st = SW_STAGES[setupWizardState.step - 1];
    if (st && st.genKey) {
      if (setupWizardState.stepGenerated[st.genKey]) {
        _swScheduleAutoAdvance();
      } else if (!setupWizardState.aiLoading) {
        _swAutoTriggerAI(setupWizardState.step);
      }
    }
  }

  // --- Navigation ---
  function swGoNext() {
    swCollectFields();
    var n = setupWizardState.step;
    var v = validateSWStep(n);
    if (!v.valid) { _showSWValidation(v.message); return; }
    _swClearAutoAdvance();
    setupWizardState.paused = false;
    if (n < SW_STAGE_COUNT) {
      setupWizardState.step = n + 1;
      refreshSetupWizard();
      _swAutoTriggerAI(setupWizardState.step);
    }
  }

  function swGoBack() {
    swCollectFields();
    _swClearAutoAdvance();
    setupWizardState.paused = true;  // pause auto when going back manually
    if (setupWizardState.step > 1) {
      setupWizardState.step--;
      refreshSetupWizard();
    }
  }

  function swSkipStep() {
    var n = setupWizardState.step;
    _swClearAutoAdvance();
    setupWizardState.stepSkipped[n] = true;
    if (n < SW_STAGE_COUNT) {
      setupWizardState.step = n + 1;
      refreshSetupWizard();
      _swAutoTriggerAI(setupWizardState.step);
    }
  }

  function swGotoStep(n) {
    // Only allow navigating to already-completed stages
    if (n < setupWizardState.step) {
      swCollectFields();
      _swClearAutoAdvance();
      setupWizardState.paused = true;
      setupWizardState.step = n;
      refreshSetupWizard();
    }
  }

  // --- Auto-trigger AI for stages that support it ---
  function _swAutoTriggerAI(n) {
    var R    = window._cpRenderers || {};
    var p2b  = window._cpPart2B;
    var cfg  = setupWizardState.aiConfig;
    var LLM  = p2b && p2b.LLMService;

    if (cfg.provider && cfg.model && LLM) {
      LLM.savePreference('sw-ai-config', cfg.provider, cfg.model);
    }

    if (n >= 2 && n <= 5 && LLM && !LLM.isConfigured()) {
      setupWizardState.aiError = 'AI not configured. Go back to Stage 1 to pick a provider, or set one up in Settings → AI.';
      refreshSetupWizard();
      return;
    }

    if (n === 2) {
      // Stage 2 = personas + pain points. Generate personas first; pain points
      // are auto-triggered once personas land (handled by the generator's
      // success callback via _swAfterPersonasGenerated()).
      if (!setupWizardState.stepGenerated.personas && typeof R.swAIGeneratePersonas === 'function') {
        R.swAIGeneratePersonas();
      } else if (setupWizardState.stepGenerated.personas && !setupWizardState.stepGenerated.painpoints && typeof R.swAIGeneratePainPoints === 'function') {
        R.swAIGeneratePainPoints();
      } else if (setupWizardState.stepGenerated.personas && setupWizardState.stepGenerated.painpoints) {
        // Both done — schedule auto-advance if in auto mode
        _swScheduleAutoAdvance();
      }
      return;
    }
    if (n === 3 && !setupWizardState.stepGenerated.messages && typeof R.swAIGenerateMessages === 'function') {
      R.swAIGenerateMessages(); return;
    }
    if (n === 4 && !setupWizardState.stepGenerated.stylesFormats && typeof R.swAIGenerateStylesFormats === 'function') {
      R.swAIGenerateStylesFormats(); return;
    }
    if (n === 5 && !setupWizardState.stepGenerated.campaignIdeas && typeof R.swAIGenerateCampaignIdeas === 'function') {
      R.swAIGenerateCampaignIdeas(); return;
    }
    // Already generated — if in auto mode, advance
    if (n >= 2 && n <= 5) _swScheduleAutoAdvance();
  }

  // Called by the personas generator after a successful run. In Full Auto
  // mode this chains immediately into pain points. In Manual mode the user
  // sees the personas and may edit them before the wizard fires pain points.
  function _swAfterPersonasGenerated() {
    if (setupWizardState.step !== 2) return;
    if (setupWizardState.mode === 'auto' && !setupWizardState.paused) {
      var R = window._cpRenderers || {};
      if (typeof R.swAIGeneratePainPoints === 'function') {
        R.swAIGeneratePainPoints();
      }
    }
  }

  // Called by the pain-points generator after a successful run within Stage 2.
  function _swAfterPainPointsGenerated() {
    if (setupWizardState.step !== 2) return;
    if (setupWizardState.mode === 'auto' && !setupWizardState.paused) {
      _swScheduleAutoAdvance();
    }
  }

  // Called by stages 3-5's generators after success — picks up auto-advance.
  function _swAfterStageGenerated() {
    if (setupWizardState.mode === 'auto' && !setupWizardState.paused) {
      _swScheduleAutoAdvance();
    }
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
    _swClearAutoAdvance();
    state.paused = true;
    refreshSetupWizard();
  }

  // --- Retry a stage's AI generation ---
  function swRetryStep(n) {
    // n is the stage number; clear the relevant generation flag(s)
    if (n === 2) {
      setupWizardState.stepGenerated.personas = false;
      setupWizardState.stepGenerated.painpoints = false;
    } else if (n === 3) {
      setupWizardState.stepGenerated.messages = false;
    } else if (n === 4) {
      setupWizardState.stepGenerated.stylesFormats = false;
    } else if (n === 5) {
      setupWizardState.stepGenerated.campaignIdeas = false;
    }
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

