  // ============================================================
  // SECTION 9.6: AI RUNNER MODAL (per-call instruction + model picker)
  // ============================================================
  //
  // Generic modal that captures a free-form instruction from the user and
  // lets them pick the AI provider/model for a single call, then invokes
  // `opts.onConfirm({ instruction }, done)`. The picker lives inside the
  // modal with `data-action-id="<actionId>"` so `LLMService.callAI(...,
  // actionId, ...)` reads the user's choice via the existing `_getPickerSel`
  // lookup; the call inside `callAI` also persists the selection via
  // `savePreference(actionId, ...)` so the next open of the same modal
  // defaults to the user's last choice.
  //
  // The modal stays mounted while the AI request is in flight — the Run
  // button is disabled and shows a busy label. The handler closes the
  // modal on success or re-enables the button on error.

  function openAiRunnerModal(opts) {
    closeAiRunnerModal();
    opts = opts || {};
    var actionId = opts.actionId || 'ai-runner';
    var instructionLabel = opts.instructionLabel || 'Instructions';
    var instructionPlaceholder = opts.instructionPlaceholder || '';
    var instructionInitial = opts.instructionInitial || '';
    var instructionRequired = !!opts.instructionRequired;
    var confirmLabel = opts.confirmLabel || 'Run';
    var busyLabel = opts.busyLabel || 'Running…';
    var subtitle = opts.subtitle || '';

    var html = '<div class="cp-ai-runner-backdrop">';
    html += '<div class="cp-ai-runner-dialog">';
    html += '<div class="cp-ai-runner-header">';
    html += '<h3 class="cp-ai-runner-title">' + icon('sparkles') + ' ' + esc(opts.title || 'Run AI') + '</h3>';
    if (subtitle) html += '<p class="cp-ai-runner-subtitle">' + esc(subtitle) + '</p>';
    html += '</div>';
    html += '<div class="cp-ai-runner-body">';
    html += '<div class="cp-ai-runner-field">';
    html += '<label class="cp-ai-runner-label">' + esc(instructionLabel);
    html += ' <span class="cp-text-muted" style="font-weight:400;font-size:11px">' + (instructionRequired ? 'required' : 'optional') + '</span>';
    html += '</label>';
    html += '<textarea class="cp-textarea cp-ai-runner-instruction" rows="4" placeholder="' + esc(instructionPlaceholder) + '">' + esc(instructionInitial) + '</textarea>';
    html += '</div>';
    html += '<div class="cp-ai-runner-field cp-ai-runner-picker-row">';
    html += '<label class="cp-ai-runner-label">' + icon('robot') + ' AI model</label>';
    html += LLMService.renderInlinePicker(actionId);
    html += '</div>';
    html += '</div>';
    html += '<div class="cp-ai-runner-actions">';
    html += '<button class="cp-btn cp-btn-outline" data-action="ai-runner-cancel">Cancel</button>';
    html += '<button class="cp-btn cp-btn-primary cp-ai-runner-run" data-action="ai-runner-run">' + icon('sparkles') + ' ' + esc(confirmLabel) + '</button>';
    html += '</div>';
    html += '</div></div>';

    $('body').append(html);

    $(document).off('click.cp-air-cancel').on('click.cp-air-cancel', '[data-action="ai-runner-cancel"]', function(e) {
      e.preventDefault();
      closeAiRunnerModal();
    });

    $(document).off('click.cp-air-run').on('click.cp-air-run', '[data-action="ai-runner-run"]', function(e) {
      e.preventDefault();
      var $btn = $(this);
      if ($btn.prop('disabled')) return;
      var instruction = ($('.cp-ai-runner-instruction').val() || '').trim();
      if (instructionRequired && !instruction) {
        toast(instructionLabel + ' is required', 'warning');
        $('.cp-ai-runner-instruction').focus();
        return;
      }
      var originalHtml = $btn.html();
      $btn.prop('disabled', true).html(icon('rotate') + ' ' + esc(busyLabel));
      if (typeof opts.onConfirm !== 'function') {
        closeAiRunnerModal();
        return;
      }
      opts.onConfirm({ instruction: instruction }, function done(err) {
        if (err) {
          if ($('.cp-ai-runner-backdrop').length) {
            $('.cp-ai-runner-run').prop('disabled', false).html(originalHtml);
          }
          return;
        }
        closeAiRunnerModal();
      });
    });

    setTimeout(function() { $('.cp-ai-runner-instruction').focus(); }, 50);
  }

  function closeAiRunnerModal() {
    $('.cp-ai-runner-backdrop').remove();
    $(document).off('click.cp-air-cancel click.cp-air-run');
  }

