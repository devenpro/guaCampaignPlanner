  // ============================================================
  // SECTION 8: INLINE AI ASSIST COMPONENT
  // ============================================================

  function renderInlineAIAssist(fieldId, entityType, entityId) {
    return '<div class="cp-ai-assist" data-field-id="' + esc(fieldId) + '" data-entity-type="' + esc(entityType || '') + '" data-entity-id="' + esc(entityId || '') + '">' +
      '<button class="cp-ai-assist-btn cp-ai-assist-suggest" data-action="ai-assist" data-mode="suggest" data-field-id="' + esc(fieldId) + '">' + icon('sparkles') + ' Suggest</button>' +
      '<button class="cp-ai-assist-btn cp-ai-assist-improve" data-action="ai-assist" data-mode="improve" data-field-id="' + esc(fieldId) + '">' + icon('wand-magic') + ' Improve</button>' +
      '</div>';
  }

  function handleInlineAssist(fieldId, mode) {
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    var $field = $('[data-field="' + fieldId + '"], [data-action-field="' + fieldId + '"]').first();
    if (!$field.length) $field = $('#' + fieldId);
    if (!$field.length) { toast('Field not found', 'error'); return; }

    var currentVal = $field.val() || '';
    var fieldLabel = $field.closest('.cp-form-group').find('label').text() || fieldId;
    var setupCtx = BrandService.getSetupContext();

    var prompt = '';
    if (mode === 'suggest') {
      prompt = 'Generate a concise, high-quality suggestion for the field "' + fieldLabel + '".\n';
      if (setupCtx) prompt += '\nContext:\n' + setupCtx;
      prompt += '\n\nRespond with ONLY the text content — no JSON, no labels, no quotes. Just the field value.';
    } else {
      prompt = 'Improve the following text for the field "' + fieldLabel + '":\n\n"' + currentVal + '"\n';
      if (setupCtx) prompt += '\nContext:\n' + setupCtx;
      prompt += '\n\nMake it more compelling, specific, and professional. Respond with ONLY the improved text — no JSON, no labels, no quotes.';
    }

    var $btn = $('[data-action="ai-assist"][data-mode="' + mode + '"][data-field-id="' + fieldId + '"]');
    $btn.prop('disabled', true).html(icon('spinner'));

    LLMService.callAI(prompt, function(text) {
      var cleanText = text.replace(/^["']|["']$/g, '').trim();
      $field.val(cleanText).trigger('change').trigger('blur');
      $btn.prop('disabled', false).html(icon(mode === 'suggest' ? 'sparkles' : 'wand-magic') + ' ' + (mode === 'suggest' ? 'Suggest' : 'Improve'));
      toast('AI ' + mode + ' applied', 'success');
    }, function(err) {
      $btn.prop('disabled', false).html(icon(mode === 'suggest' ? 'sparkles' : 'wand-magic') + ' ' + (mode === 'suggest' ? 'Suggest' : 'Improve'));
      toast('AI error: ' + err, 'error');
    }, 'ai-assist-' + fieldId, BrandService.getSystemPrompt('content'), parseJSON);
  }

