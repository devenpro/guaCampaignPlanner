  // ------------------------------------------------------------------
  // SECTION 9.4a: SETUP WIZARD — STAGE 1 (Brand + AI + Mode picker)
  // ------------------------------------------------------------------
  //
  // Stage 1 is the single combined "Setup" stage:
  //   - Brand context summary (read-only, pulled from .brand-data DOM)
  //   - Workspace name + product + objective (editable)
  //   - Custom AI instructions
  //   - AI provider + model picker
  //   - Two Start buttons: Full Auto vs Stage-by-Stage (Manual)
  //
  // Picking a mode validates the form, persists the AI selection, and jumps
  // straight to Stage 2 (Personas & Pain Points) — kicking off the chain.

  function renderSWStep1() {
    var ws    = setupWizardState.workspace;
    var bc    = setupWizardState.brandContext || {};
    var cfg   = setupWizardState.aiConfig;
    var p2b   = window._cpPart2B;
    var aiOk  = p2b && p2b.LLMService && p2b.LLMService.isConfigured();
    var brandOn = S && S.brand && S.brand.configured;

    var objMap = Constants.META_OBJECTIVES || {};
    var objectives = Object.keys(objMap).map(function(k) { return { id: k, name: objMap[k].label || k }; });

    var html = _buildSWStepHeader(
      'Brand Context & AI Setup',
      'We\'ll use your brand data plus the instructions below to generate every stage. Choose a mode at the bottom to start.',
      'a'
    );

    html += '<div class="cp-sw-form">';

    // ---- Brand context summary card ----
    html += '<section class="cp-sw-brand-card' + (brandOn ? '' : ' cp-sw-brand-card--empty') + '">';
    html += '<header class="cp-sw-brand-card-header">';
    html += '<span class="cp-sw-brand-card-icon">' + icon(brandOn ? 'link' : 'info') + '</span>';
    html += '<div>';
    html += '<div class="cp-sw-brand-card-title">' + (brandOn ? esc(bc.name || 'Connected brand') : 'No brand profile connected') + '</div>';
    html += '<div class="cp-sw-brand-card-sub">' + (brandOn
      ? 'Your brand context will be injected into every AI prompt automatically.'
      : 'AI will use only the information you enter below.') + '</div>';
    html += '</div></header>';
    if (brandOn) {
      html += '<dl class="cp-sw-brand-card-grid">';
      if (bc.tagline)   html += '<dt>Tagline</dt><dd>' + esc(bc.tagline) + '</dd>';
      if (bc.voice)     html += '<dt>Brand voice</dt><dd>' + esc(truncate(bc.voice, 180)) + '</dd>';
      if (bc.audience)  html += '<dt>Audience</dt><dd>' + esc(truncate(bc.audience, 180)) + '</dd>';
      if (bc.pillars)   html += '<dt>Content pillars</dt><dd>' + esc(truncate(bc.pillars, 180)) + '</dd>';
      if (bc.dos)       html += '<dt>Do</dt><dd>' + esc(truncate(bc.dos, 180)) + '</dd>';
      if (bc.donts)     html += '<dt>Don\'t</dt><dd>' + esc(truncate(bc.donts, 180)) + '</dd>';
      if (bc.forbidden) html += '<dt>Forbidden</dt><dd>' + esc(truncate(bc.forbidden, 140)) + '</dd>';
      if (bc.cta)       html += '<dt>CTA style</dt><dd>' + esc(truncate(bc.cta, 140)) + '</dd>';
      html += '</dl>';
    }
    html += '</section>';

    // ---- Workspace basics ----
    html += '<section class="cp-sw-section">';
    html += '<h3 class="cp-sw-section-title">Workspace basics</h3>';

    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Workspace name <span class="cp-required">*</span></label>';
    html += '<input type="text" class="cp-input" data-sw-field="workspace.name"';
    html += ' placeholder="e.g., Brand Q2 2026 Campaigns" value="' + esc(ws.name || '') + '" autocomplete="off">';
    html += '</div>';

    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Product / Service <span class="cp-required">*</span></label>';
    html += '<input type="text" class="cp-input" data-sw-field="workspace.product_name"';
    html += ' placeholder="What are you advertising?" value="' + esc(ws.product_name || '') + '" autocomplete="off">';
    html += '</div>';

    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Primary campaign objective</label>';
    html += '<select class="cp-select" data-sw-field="workspace.objective">';
    html += '<option value="">Select objective...</option>';
    for (var i = 0; i < objectives.length; i++) {
      var obj = objectives[i];
      html += '<option value="' + esc(obj.id) + '"' + (ws.objective === obj.id ? ' selected' : '') + '>' + esc(obj.name) + '</option>';
    }
    html += '</select>';
    html += '</div>';

    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Custom AI instructions</label>';
    html += '<textarea class="cp-textarea" data-sw-field="workspace.custom_instructions" rows="3"';
    html += ' placeholder="Optional: tone, things to avoid, mandatory phrases, angle preferences...">' + esc(ws.custom_instructions || '') + '</textarea>';
    html += '<p class="cp-field-hint">These instructions are added on top of your brand context for every AI run in the wizard.</p>';
    html += '</div>';
    html += '</section>';

    // ---- AI provider + model picker ----
    html += '<section class="cp-sw-section">';
    html += '<h3 class="cp-sw-section-title">AI provider</h3>';
    if (!aiOk) {
      html += '<div class="cp-sw-info-box cp-sw-info-box--warn">';
      html += icon('triangle-alert') + ' <div><strong>No AI providers configured.</strong> ';
      html += 'Set up API keys in Settings → AI, then return here. You can still complete the wizard manually after configuring providers.</div>';
      html += '</div>';
    } else {
      html += '<div class="cp-field">';
      html += '<label class="cp-field-label">Provider &amp; model <span class="cp-required">*</span></label>';
      html += '<div class="cp-sw-ai-picker-wrap" id="swAiPickerWrap">';
      // _cpAiSel is defined inside Part 2A's init-imports IIFE; the wizard can
      // auto-launch before Part 2B (and the full picker hookup) is ready, so
      // emit a placeholder that _cpReplaceAiPickers() rehydrates on Part 2B init.
      if (typeof window._cpAiSel === 'function') {
        html += window._cpAiSel('sw-ai-config');
      } else {
        html += '<span class="cp-ai-picker-loading" data-pending-action="sw-ai-config">' + icon('spinner') + ' Loading AI options…</span>';
      }
      html += '</div>';
      html += '<p class="cp-field-hint">This selection is used for every AI run during setup.</p>';
      html += '</div>';

      html += '<div class="cp-sw-ai-test-row">';
      html += '<button class="cp-btn cp-btn-secondary" data-action="sw-test-ai" id="swTestAiBtn">' + icon('zap') + ' Test connection</button>';
      html += '<span class="cp-sw-ai-test-status" id="swAiTestStatus">';
      if (cfg.tested === true) {
        html += '<span class="cp-sw-test-ok">' + icon('circle-check') + ' Connection verified</span>';
      } else if (cfg.tested === 'fail') {
        html += '<span class="cp-sw-test-fail">' + icon('circle-x') + ' Test failed — check your API key</span>';
      } else {
        html += '<span class="cp-sw-test-idle">Not tested yet — you can still continue</span>';
      }
      html += '</span>';
      html += '</div>';
    }
    html += '</section>';

    // ---- Mode picker (two big Start buttons) ----
    html += '<section class="cp-sw-section cp-sw-section--start">';
    html += '<h3 class="cp-sw-section-title">How should the AI run?</h3>';
    if (!aiOk) {
      html += '<div class="cp-sw-info-box">';
      html += icon('info') + ' Configure at least one AI provider in <strong>Settings → AI</strong>, then come back to pick a mode. Use the close button (top-right) to set that up now.';
      html += '</div>';
    } else {
      html += '<div class="cp-sw-mode-row">';

      html += '<button class="cp-sw-mode-card cp-sw-mode-card--manual" data-action="sw-start-manual">';
      html += '<div class="cp-sw-mode-card-icon">' + icon('hand') + '</div>';
      html += '<div class="cp-sw-mode-card-title">Stage-by-stage <span class="cp-sw-mode-card-tag">Recommended</span></div>';
      html += '<div class="cp-sw-mode-card-body">AI generates each stage automatically, then waits for you to review and approve before moving on. Edit anything between stages.</div>';
      html += '<div class="cp-sw-mode-card-cta">' + icon('arrow-right') + ' Start with my approval at each stage</div>';
      html += '</button>';

      html += '<button class="cp-sw-mode-card cp-sw-mode-card--auto" data-action="sw-start-auto">';
      html += '<div class="cp-sw-mode-card-icon">' + icon('zap') + '</div>';
      html += '<div class="cp-sw-mode-card-title">Full Auto</div>';
      html += '<div class="cp-sw-mode-card-body">AI runs every stage end-to-end without pausing. You can hit Pause at any point to step in and edit.</div>';
      html += '<div class="cp-sw-mode-card-cta">' + icon('arrow-right') + ' Run everything automatically</div>';
      html += '</button>';

      html += '</div>';
      html += '<p class="cp-sw-mode-hint">' + icon('info') + ' You can always switch by hitting Pause / Continue manually during the run.</p>';
    }
    html += '</section>';

    html += '</div>'; // .cp-sw-form
    return html;
  }

  // Inline AI connection test for Stage 1
  function _swTestAIConnection() {
    var p2b = window._cpPart2B;
    if (!p2b || !p2b.LLMService || !p2b.LLMService.isConfigured()) {
      toast('No AI provider configured — check Settings → AI.', 'warning');
      return;
    }
    var $btn    = $('#swTestAiBtn');
    var $status = $('#swAiTestStatus');
    $btn.prop('disabled', true).html(icon('spinner') + ' Testing...');
    $status.html('<span class="cp-sw-test-idle">Sending test request...</span>');

    // Capture current picker selection into state before testing
    var $prov = $('.cp-ai-provider-select[data-action-id="sw-ai-config"]');
    var $mod  = $('.cp-ai-model-select[data-action-id="sw-ai-config"]');
    if ($prov.length) setupWizardState.aiConfig.provider = $prov.val();
    if ($mod.length)  setupWizardState.aiConfig.model    = $mod.val();

    p2b.callAIWithRetry(
      'Reply with exactly one word: OK',
      function() {
        $btn.prop('disabled', false).html(icon('zap') + ' Test connection');
        setupWizardState.aiConfig.tested = true;
        $status.html('<span class="cp-sw-test-ok">' + icon('circle-check') + ' Connection verified</span>');
      },
      function(err) {
        $btn.prop('disabled', false).html(icon('zap') + ' Test connection');
        setupWizardState.aiConfig.tested = 'fail';
        $status.html('<span class="cp-sw-test-fail">' + icon('circle-x') + ' Test failed — ' + esc(String(err).substring(0, 80)) + '</span>');
      },
      'sw-ai-config'
    );
  }

