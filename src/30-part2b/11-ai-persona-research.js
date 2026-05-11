  // ============================================================
  // SECTION 10: AI — PERSONA RESEARCH
  // ============================================================

  function aiResearchPersonas(customInput) {
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    toast('Researching personas...', 'info');
    var stateKey = 'personas';
    $('#cpResearchLoading_' + stateKey).show();

    // Build existing personas list for deduplication
    var existing = getAllPersonas().map(function(p) { return p.name; });
    var existingStr = existing.length ? '\n\nExisting personas (do NOT duplicate these): ' + existing.join(', ') : '';

    var prompt = 'You are a senior Meta Ads strategist specializing in audience segmentation for paid campaigns. Generate 4 distinct target persona profiles.\n';
    prompt += brandSnippet('persona');
    prompt += existingStr;
    if (customInput) prompt += '\n\nUser direction: ' + customInput;
    prompt += '\n\nRules:\n- Each persona must be DISTINCT — different demographics, motivations, and buying triggers\n- Think about who would respond to Meta Ads for this product\n- Consider different funnel stages and awareness levels\n- Include actionable psychographic details that inform ad creative\n\nFor each persona provide:\n- name: short memorable name (2-4 words, e.g. "Aspiring Creator", "Budget-Conscious Parent")\n- description: 2-3 sentences summarizing this persona\n- demographics: {age_range, gender, location, income_level, education, occupation}\n- psychographics: {desires, requirements, emotional_triggers, motivations, fears, values}\n\nRespond ONLY as JSON: {"personas":[{...}]}';

    callAIWithRetry(prompt, function(parsed) {
      S._aiResearchResults = S._aiResearchResults || {};
      S._aiResearchResults[stateKey] = (parsed.personas || []).map(function(p) {
        p._selected = false;
        p._tags = [p.demographics && p.demographics.age_range, p.demographics && p.demographics.occupation].filter(Boolean);
        return p;
      });
      $('#cpResearchLoading_' + stateKey).hide();
      logActivity('personas_researched', '', '', (parsed.personas || []).length + ' personas generated');
      snapshot('AI persona research'); render();
      toast('Generated ' + (parsed.personas || []).length + ' persona suggestions', 'success');
    }, function(err) {
      $('#cpResearchLoading_' + stateKey).hide();
      toast('AI Error: ' + err, 'error');
    }, 'ai-research-personas', BrandService.getSystemPrompt('research'), parseJSON);
  }

