  // ============================================================
  // SECTION 13: AI — STYLE & FORMAT RESEARCH
  // ============================================================

  function aiResearchStyles(customInput) {
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    toast('Researching styles...', 'info');
    var stateKey = 'styles';
    $('#cpResearchLoading_' + stateKey).show();

    var existing = getAllStyles().map(function(s) { return s.name; });
    var existingStr = existing.length ? '\n\nExisting styles (avoid duplicates): ' + existing.join(', ') : '';

    var prompt = 'You are a creative director specializing in Meta Ads. Generate 4 distinct creative styles/tones for ad campaigns.\n';
    prompt += brandSnippet('content');
    prompt += existingStr;
    if (customInput) prompt += '\n\nUser direction: ' + customInput;
    prompt += '\n\nRules:\n- Each style must be DISTINCT — different emotional register, visual energy, and audience appeal\n- Consider styles that work well for Meta Ads (attention-grabbing, scroll-stopping)\n- Include specific guidance on how the style manifests in copy and visual\n- Think about: humor, authority, empathy, urgency, aspirational, educational\n\nRespond ONLY as JSON: {"styles":[{"name":"style name","description":"2-3 sentences describing the tone, approach, and how it manifests in ads"}]}';

    callAIWithRetry(prompt, function(parsed) {
      S._aiResearchResults = S._aiResearchResults || {};
      S._aiResearchResults[stateKey] = (parsed.styles || []).map(function(s) {
        s._selected = false; s._tags = [];
        return s;
      });
      $('#cpResearchLoading_' + stateKey).hide();
      logActivity('styles_researched', '', '', (parsed.styles || []).length + ' styles generated');
      snapshot('AI style research'); render();
      toast('Generated ' + (parsed.styles || []).length + ' style suggestions', 'success');
    }, function(err) {
      $('#cpResearchLoading_' + stateKey).hide();
      toast('AI Error: ' + err, 'error');
    }, 'ai-research-styles', BrandService.getSystemPrompt('content'), parseJSON);
  }

  function aiResearchFormats(customInput) {
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    toast('Researching visual formats...', 'info');
    var stateKey = 'formats';
    $('#cpResearchLoading_' + stateKey).show();

    var existing = getAllFormats().map(function(f) { return f.name; });
    var existingStr = existing.length ? '\n\nExisting formats (avoid duplicates): ' + existing.join(', ') : '';
    var cats = Constants.FORMAT_CATEGORIES || [];
    var catStr = cats.length ? '\nAvailable categories: ' + cats.map(function(c) { return c.id + ' (' + c.name + ')'; }).join(', ') : '';

    var prompt = 'You are a video/photo production expert for Meta Ads. Generate 4 distinct visual format ideas for ad creative production.\n';
    prompt += brandSnippet('media');
    prompt += existingStr + catStr;
    if (customInput) prompt += '\n\nUser direction: ' + customInput;
    prompt += '\n\nRules:\n- Each format must describe a distinct production approach (e.g., studio shoot, UGC style, motion graphics, whiteboard)\n- Include specific visual details: setting, camera approach, editing style\n- Consider what performs well on Meta Ads (Reels, Feed, Stories)\n- Assign appropriate category from the available list\n\nRespond ONLY as JSON: {"formats":[{"name":"format name","description":"2-3 sentences describing the visual approach, setting, and production style","category":"' + (cats[0] ? cats[0].id : 'vfc_shoot') + '"}]}';

    callAIWithRetry(prompt, function(parsed) {
      S._aiResearchResults = S._aiResearchResults || {};
      S._aiResearchResults[stateKey] = (parsed.formats || []).map(function(f) {
        f._selected = false;
        var catMatch = cats.find(function(c) { return c.id === f.category; });
        f._tags = catMatch ? [catMatch.name] : [];
        return f;
      });
      $('#cpResearchLoading_' + stateKey).hide();
      logActivity('formats_researched', '', '', (parsed.formats || []).length + ' formats generated');
      snapshot('AI format research'); render();
      toast('Generated ' + (parsed.formats || []).length + ' format suggestions', 'success');
    }, function(err) {
      $('#cpResearchLoading_' + stateKey).hide();
      toast('AI Error: ' + err, 'error');
    }, 'ai-research-formats', BrandService.getSystemPrompt('content'), parseJSON);
  }

