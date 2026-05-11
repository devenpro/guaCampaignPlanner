  // ============================================================
  // SECTION 12: AI — MESSAGE RESEARCH
  // ============================================================

  function aiResearchMessages(customInput) {
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    toast('Researching messages...', 'info');
    var stateKey = 'messages';
    $('#cpResearchLoading_' + stateKey).show();

    var existing = getAllMessages().map(function(m) { return m.title; });
    var existingStr = existing.length ? '\n\nExisting messages (avoid duplicates): ' + existing.join(', ') : '';
    var funnels = (S.meta.settings && S.meta.settings.funnel_stages) || [];
    var funnelStr = funnels.length ? '\nFunnel stages available: ' + funnels.map(function(f) { return f.id + ' (' + f.name + ')'; }).join(', ') : '';

    var prompt = 'You are a Meta Ads copywriting expert. Generate 4 distinct message angles for ad campaigns.\n';
    prompt += brandSnippet('content');
    prompt += existingStr + funnelStr;
    if (customInput) prompt += '\n\nUser direction: ' + customInput;
    prompt += '\n\nRules:\n- Each message must target a different emotional trigger or value proposition\n- Include specific delivery guidance (tone, pacing, acting direction for video)\n- Include 2 opening hooks per message\n- Tag each message with appropriate funnel stage(s)\n- Messages should be adaptable to both image and video formats\n\nRespond ONLY as JSON: {"messages":[{"title":"short name","body":"core message text (2-3 sentences)","funnel_stages":["' + (funnels[0] ? funnels[0].id : 'fs_top') + '"],"delivery_notes":"how to deliver this message...","theme":"topic/angle","hooks":[{"text":"hook text...","type":"question|bold|story|data|direct"}]}]}';

    callAIWithRetry(prompt, function(parsed) {
      S._aiResearchResults = S._aiResearchResults || {};
      S._aiResearchResults[stateKey] = (parsed.messages || []).map(function(m) {
        m._selected = false;
        m.name = m.title; // For display in research panel
        var fLabels = (m.funnel_stages || []).map(function(fid) { var f = S.funnelStageMap[fid]; return f ? f.short : ''; }).filter(Boolean);
        m._tags = fLabels.concat(m.theme ? [m.theme] : []);
        return m;
      });
      $('#cpResearchLoading_' + stateKey).hide();
      logActivity('messages_suggested', '', '', (parsed.messages || []).length + ' messages generated');
      snapshot('AI message research'); render();
      toast('Generated ' + (parsed.messages || []).length + ' message suggestions', 'success');
    }, function(err) {
      $('#cpResearchLoading_' + stateKey).hide();
      toast('AI Error: ' + err, 'error');
    }, 'ai-research-messages', BrandService.getSystemPrompt('content'), parseJSON);
  }

