  // ============================================================
  // SECTION 9: AI STATUS INDICATOR
  // ============================================================

  function updateAIStatusIndicator() {
    var $el = $('#cpAIStatus');
    if (!$el.length) return;
    if (LLMService.isConfigured()) {
      var def = LLMService.getDefault();
      var label = def ? (def.provider + '/' + def.model).substring(0, 28) : 'Ready';
      $el.html('<span class="cp-ai-status-dot cp-ai-status-ok"></span><span class="cp-ai-status-label">' + esc(label) + '</span>');
      $el.attr('title', 'AI active — click to switch');
    } else {
      $el.html('<span class="cp-ai-status-dot cp-ai-status-off"></span><span class="cp-ai-status-label">No AI</span>');
      $el.attr('title', 'AI not configured');
    }
  }

  function testAIConnection() {
    if (!LLMService.isConfigured()) { toast('No AI providers configured.', 'warning'); return; }
    toast('Testing AI connection...', 'info');
    var $btn = $('[data-action="test-ai-connection"]');
    $btn.prop('disabled', true).html(icon('spinner') + ' Testing...');
    LLMService.callAI('Respond with exactly: {"status":"ok"}', function(text) {
      $btn.prop('disabled', false).html(icon('bolt') + ' Test Connection');
      toast('AI connection successful!', 'success');
      $btn.after('<span class="cp-ai-test-result cp-ai-test-ok" style="margin-left:8px">' + icon('circle-check') + ' Connected</span>');
      setTimeout(function() { $('.cp-ai-test-result').fadeOut(400, function() { $(this).remove(); }); }, 4000);
    }, function(err) {
      $btn.prop('disabled', false).html(icon('bolt') + ' Test Connection');
      toast('AI connection failed: ' + err, 'error');
      $btn.after('<span class="cp-ai-test-result cp-ai-test-fail" style="margin-left:8px">' + icon('circle-xmark') + ' Failed</span>');
      setTimeout(function() { $('.cp-ai-test-result').fadeOut(400, function() { $(this).remove(); }); }, 6000);
    }, 'test-connection');
  }

