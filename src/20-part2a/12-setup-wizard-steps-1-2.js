  // ------------------------------------------------------------------
  // SECTION 9.4a: SETUP WIZARD — STEP RENDERERS (Phase 2: Steps 1 & 2)
  // ------------------------------------------------------------------

  function renderSWStep1() {
    var ws  = setupWizardState.workspace;
    var objectives = Constants.CAMPAIGN_OBJECTIVES || [];

    var html = _buildSWStepHeader(
      'Workspace Setup',
      'Tell us about your brand and what you\'re advertising. This context shapes every AI output throughout the wizard.',
      'a'
    );

    html += '<div class="cp-sw-form">';

    // Workspace Name
    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Workspace Name <span class="cp-required">*</span></label>';
    html += '<input type="text" class="cp-input" data-sw-field="workspace.name"';
    html += ' placeholder="e.g., Brand Q2 2026 Campaigns" value="' + esc(ws.name || '') + '" autocomplete="off">';
    html += '<p class="cp-field-hint">Names your Campaign Planner workspace — visible in the header.</p>';
    html += '</div>';

    // Product / Service
    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Product / Service <span class="cp-required">*</span></label>';
    html += '<input type="text" class="cp-input" data-sw-field="workspace.product_name"';
    html += ' placeholder="What are you advertising?" value="' + esc(ws.product_name || '') + '" autocomplete="off">';
    html += '<p class="cp-field-hint">Be specific — e.g., "SaaS project management tool for remote teams".</p>';
    html += '</div>';

    // Primary Objective
    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Primary Campaign Objective</label>';
    html += '<select class="cp-select" data-sw-field="workspace.objective">';
    html += '<option value="">Select objective...</option>';
    for (var i = 0; i < objectives.length; i++) {
      var obj = objectives[i];
      html += '<option value="' + esc(obj.id) + '"' + (ws.objective === obj.id ? ' selected' : '') + '>' + esc(obj.name) + '</option>';
    }
    html += '</select>';
    html += '</div>';

    // Product Description & Brand Voice
    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Product Description &amp; Brand Voice</label>';
    html += '<textarea class="cp-textarea" data-sw-field="workspace.description" rows="3"';
    html += ' placeholder="Describe what makes your product unique, your brand tone, key differentiators...">' + esc(ws.description || '') + '</textarea>';
    html += '<p class="cp-field-hint">The more detail here, the better your AI-generated personas, messages, and hooks will be.</p>';
    html += '</div>';

    // Target Audience Overview
    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Target Audience Overview</label>';
    html += '<textarea class="cp-textarea" data-sw-field="workspace.target_audience" rows="2"';
    html += ' placeholder="Who are your ideal customers? e.g., small business owners aged 30–50 in the US...">' + esc(ws.target_audience || '') + '</textarea>';
    html += '</div>';

    // Custom AI Instructions
    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Custom AI Instructions</label>';
    html += '<textarea class="cp-textarea" data-sw-field="workspace.custom_instructions" rows="2"';
    html += ' placeholder="Any rules for AI: tone, things to avoid, mandatory phrases...">' + esc(ws.custom_instructions || '') + '</textarea>';
    html += '</div>';

    // Brand context callout
    if (S.brand && S.brand.configured) {
      var brandName = (S.brand.identity && S.brand.identity.name) || 'Your brand';
      html += '<div class="cp-sw-info-box cp-sw-info-box--success">';
      html += icon('link') + ' <strong>Brand context connected</strong> — ' + esc(brandName) + ' data will be automatically injected into all AI prompts.';
      html += '</div>';
    } else {
      html += '<div class="cp-sw-info-box">';
      html += icon('info') + ' No brand profile connected. AI will use the information you enter above.';
      html += '</div>';
    }

    html += '</div>'; // .cp-sw-form
    return html;
  }

  function renderSWStep2() {
    var cfg   = setupWizardState.aiConfig;
    var p2b   = window._cpPart2B;
    var aiOk  = p2b && p2b.LLMService && p2b.LLMService.isConfigured();

    var html = _buildSWStepHeader(
      'AI Configuration',
      'Select the AI provider and model that will power all generation steps. API keys are managed in your Drupal LLM settings.',
      'a'
    );

    if (!aiOk) {
      html += '<div class="cp-sw-info-box cp-sw-info-box--warn">';
      html += icon('triangle-alert') + ' <div><strong>No AI providers configured.</strong> ';
      html += 'AI generation requires API keys set up in your Drupal LLM settings. ';
      html += 'You can continue through the wizard and fill in content manually.</div>';
      html += '</div>';
      html += '<p class="cp-sw-ai-skip-note">Skip this step to continue without AI assistance. You can configure AI in Settings &rarr; AI at any time.</p>';
      return html;
    }

    html += '<div class="cp-sw-form">';

    // Provider + model picker
    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">AI Provider &amp; Model</label>';
    html += '<div class="cp-sw-ai-picker-wrap" id="swAiPickerWrap">';
    html += window._cpAiSel('sw-ai-config');
    html += '</div>';
    html += '<p class="cp-field-hint">This selection will be used for all AI generation steps in this wizard.</p>';
    html += '</div>';

    // Test connection row
    html += '<div class="cp-sw-ai-test-row">';
    html += '<button class="cp-btn cp-btn-secondary" data-action="sw-test-ai" id="swTestAiBtn">' + icon('zap') + ' Test Connection</button>';
    html += '<span class="cp-sw-ai-test-status" id="swAiTestStatus">';
    if (cfg.tested === true) {
      html += '<span class="cp-sw-test-ok">' + icon('circle-check') + ' Connection verified</span>';
    } else if (cfg.tested === 'fail') {
      html += '<span class="cp-sw-test-fail">' + icon('circle-x') + ' Test failed — check your API key</span>';
    } else {
      html += '<span class="cp-sw-test-idle">Not tested yet &mdash; you can still continue</span>';
    }
    html += '</span>';
    html += '</div>';

    html += '<div class="cp-sw-info-box" style="margin-top:var(--cp-space-2)">';
    html += icon('info') + ' Skipping the test is fine — the wizard will let you know if AI calls fail during generation.';
    html += '</div>';

    html += '</div>'; // .cp-sw-form
    return html;
  }

  // Inline AI connection test for the wizard Step 2
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
        $btn.prop('disabled', false).html(icon('zap') + ' Test Connection');
        setupWizardState.aiConfig.tested = true;
        $status.html('<span class="cp-sw-test-ok">' + icon('circle-check') + ' Connection verified</span>');
      },
      function(err) {
        $btn.prop('disabled', false).html(icon('zap') + ' Test Connection');
        setupWizardState.aiConfig.tested = 'fail';
        $status.html('<span class="cp-sw-test-fail">' + icon('circle-x') + ' Test failed — ' + esc(String(err).substring(0, 80)) + '</span>');
      },
      'sw-ai-config'
    );
  }

