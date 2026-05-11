  // ============================================================
  // SECTION 11: AI — PAIN POINT RESEARCH
  // ============================================================

  function aiResearchPainPoints(personaId, customInput) {
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    toast('Researching pain points...', 'info');

    var persona = personaId ? getPersona(personaId) : null;
    var personaCtx = persona ? '\nTarget persona: ' + persona.name : '';
    if (persona) {
      var d = persona.demographics || {};
      var p = persona.psychographics || {};
      if (d.occupation) personaCtx += ' (' + d.occupation + ')';
      if (p.fears) personaCtx += '\nFears: ' + p.fears;
      if (p.desires) personaCtx += '\nDesires: ' + p.desires;
    }

    // Existing pain points for dedup
    var existing = getAllPainPoints().map(function(pp) { return truncate(pp.pain_point, 40); });
    var existingStr = existing.length ? '\n\nExisting pain points (avoid duplicates): ' + existing.join('; ') : '';

    var prompt = 'You are an expert at identifying customer pain points for Meta Ads targeting. Generate 5 specific, actionable pain points with solutions.\n';
    prompt += brandSnippet('research');
    prompt += personaCtx + existingStr;
    if (customInput) prompt += '\n\nUser direction: ' + customInput;
    prompt += '\n\nRules:\n- Pain points must be SPECIFIC and emotionally resonant — not generic\n- Each must directly relate to a problem the product/service solves\n- Solutions should connect to the product value proposition\n- Think about what keeps this audience up at night\n- Consider both functional and emotional pain points\n\nRespond ONLY as JSON: {"pain_points":[{"pain_point":"specific pain...","solution":"how product solves it...","category":"productivity|cost|knowledge|competition|growth"}]}';

    var stateKey = personaId ? 'pain_points_' + personaId : 'pain_points';
    callAIWithRetry(prompt, function(parsed) {
      if (personaId) {
        // Add directly to persona's pain points
        var results = parsed.pain_points || [];
        snapshot('AI pain point research');
        for (var i = 0; i < results.length; i++) {
          var pp = createEntity('pain_point', { pain_point: results[i].pain_point, solution: results[i].solution || '', category: results[i].category || '' });
          if (pp && persona) {
            persona.pain_point_ids = persona.pain_point_ids || [];
            if (persona.pain_point_ids.indexOf(pp.id) === -1) persona.pain_point_ids.push(pp.id);
          }
        }
        syncToTextarea(); buildMaps(); render();
        logActivity('pain_points_generated', 'persona', personaId, persona ? persona.name : '', results.length + ' pain points generated');
        toast('Generated ' + results.length + ' pain points', 'success');
      } else {
        // Store as research results for selection
        S._aiResearchResults = S._aiResearchResults || {};
        S._aiResearchResults.pain_points = (parsed.pain_points || []).map(function(pp) {
          pp._selected = false; pp.name = truncate(pp.pain_point, 50);
          pp._tags = [pp.category].filter(Boolean);
          return pp;
        });
        render();
        toast('Generated ' + (parsed.pain_points || []).length + ' pain point suggestions', 'success');
      }
    }, function(err) { toast('AI Error: ' + err, 'error'); }, 'ai-research-pain-points', BrandService.getSystemPrompt('research'), parseJSON);
  }

