  // ============================================================
  // SECTION 15: AI — RECIPE MEDIA
  // ============================================================

  function aiImproveContent(recipeId, customInstructions) {
    var recipe = getRecipe(recipeId); if (!recipe) return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    var existing = stripHtml(recipe.content && recipe.content.ad_copy || '');
    if (!existing || existing.trim().length < 20) { toast('Write some ad copy first — then improve it', 'warning'); return; }
    toast('Improving ad copy...', 'info');

    var prompt = 'You are a Meta Ads copywriting expert. Improve the following ad copy. Make it more compelling, specific, and action-oriented while keeping the core message.\n\n';
    prompt += 'CURRENT AD COPY:\n' + existing + '\n';
    if (recipe.content.headline) prompt += 'CURRENT HEADLINE: ' + recipe.content.headline + '\n';
    if (recipe.content.cta) prompt += 'CURRENT CTA: ' + recipe.content.cta + '\n';
    prompt += recipeContextSnippet(recipe);
    prompt += brandSnippet('content');
    if (customInstructions) prompt += '\n\nSpecific improvement direction: ' + customInstructions;
    prompt += '\n\nRules:\n- Keep the same overall message and structure\n- Sharpen the language — remove filler words, strengthen verbs\n- Make the hook more scroll-stopping\n- Improve the CTA urgency\n- Keep the brand voice consistent\n\nRespond ONLY as JSON: {"ad_copy":"improved text with \\n for line breaks","headline":"improved headline","cta":"improved CTA","changes":"brief summary of what you changed and why"}';

    callAIWithRetry(prompt, function(parsed) {
      var improved = parsed.ad_copy || '';
      if (!improved) { toast('AI returned empty content', 'warning'); return; }

      // Show preview: original vs improved
      var previewAlts = [
        { label: 'Original (Current)', sections: [
          { label: 'Ad Copy', value: existing },
          { label: 'Headline', value: recipe.content.headline || '' },
          { label: 'CTA', value: recipe.content.cta || '' }
        ] },
        { label: 'Improved' + (parsed.changes ? ' — ' + truncate(parsed.changes, 40) : ''), sections: [
          { label: 'Ad Copy', value: improved.replace(/\\n/g, '\n') },
          { label: 'Headline', value: parsed.headline || recipe.content.headline || '' },
          { label: 'CTA', value: parsed.cta || recipe.content.cta || '' }
        ], _data: parsed }
      ];

      showAIPreview('Improve Ad Copy — ' + truncate(recipe.title, 30), previewAlts, function(idx) {
        if (idx === 0) { closeModal(); toast('Kept original', 'info'); return; }
        var paragraphs = improved.split(/\\n|\n/).filter(function(p) { return p.trim(); });
        recipe.content.ad_copy = '<p>' + paragraphs.join('</p><p>') + '</p>';
        if (parsed.headline) recipe.content.headline = parsed.headline;
        if (parsed.cta) recipe.content.cta = parsed.cta;
        recipe.updated = new Date().toISOString();
        logActivity('content_generated', 'recipe', recipeId, recipe.title, 'Ad copy improved via AI');
        snapshot('AI improve'); buildMaps(); render(); syncToTextarea();
        closeModal();
        toast('Improved ad copy applied', 'success');
      }, {
        onRegenerate: function(instructions) { aiImproveContent(recipeId, instructions); }
      });
    }, function(err) { toast('AI Error: ' + err, 'error'); }, 'ai-improve-content', BrandService.getSystemPrompt('content'), parseJSON);
  }

  function aiGenerateBrief(recipeId, customInstructions) {
    var recipe = getRecipe(recipeId); if (!recipe) return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    toast('Generating creative brief alternatives...', 'info');

    var prompt = 'You are a creative director writing creative briefs for Meta Ads images. Generate 2 DIFFERENT brief alternatives — each with a distinct visual approach.\n';
    prompt += recipeContextSnippet(recipe);
    prompt += brandSnippet('media');
    if (customInstructions) prompt += '\n\nAdditional instructions: ' + customInstructions;
    prompt += '\n\nRules:\n- Each brief must describe a DIFFERENT visual direction\n- Alternative 1: more lifestyle/emotional approach\n- Alternative 2: more product-focused/direct approach\n- Include: setting, subjects, composition, lighting, mood, key visual elements\n- Reference the persona and what resonates with them\n- Consider the visual format: ' + (S.formatMap[recipe.visual_format_id] ? S.formatMap[recipe.visual_format_id].name : 'not specified') + '\n\nRespond ONLY as JSON: {"alternatives":[{"label":"approach name","creative_brief":"detailed visual description (3-5 sentences)"}]}';

    callAIWithRetry(prompt, function(parsed) {
      var alts = parsed.alternatives || [];
      if (alts.length === 0) { toast('AI returned no briefs', 'warning'); return; }

      var previewAlts = alts.map(function(a) {
        return { label: a.label || '', text: a.creative_brief || '', _data: a };
      });

      showAIPreview('Choose Creative Brief — ' + truncate(recipe.title, 30), previewAlts, function(idx) {
        var chosen = alts[idx];
        recipe.image_brief = recipe.image_brief || {};
        recipe.image_brief.creative_brief = chosen.creative_brief || '';
        recipe.updated = new Date().toISOString();
        logActivity('brief_generated', 'recipe', recipeId, recipe.title, 'Creative brief selected from alternatives');
        snapshot('AI brief'); if (maybeAdvanceRecipeStatus) maybeAdvanceRecipeStatus(recipe, 'brief generated');
        buildMaps(); render(); syncToTextarea();
        closeModal();
        toast('Creative brief applied', 'success');
      }, {
        onRegenerate: function(instructions) { aiGenerateBrief(recipeId, instructions); }
      });
    }, function(err) { toast('AI Error: ' + err, 'error'); }, 'ai-generate-brief', BrandService.getSystemPrompt('media'), parseJSON);
  }

  function aiGenerateImagePrompt(recipeId, customInstructions) {
    var recipe = getRecipe(recipeId); if (!recipe) return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    toast('Generating AI image prompt...', 'info');

    var brief = (recipe.image_brief && recipe.image_brief.creative_brief) || '';
    var params = (recipe.image_brief && recipe.image_brief.prompt_params) || {};

    var prompt = 'You are an expert at writing AI image generation prompts (for Midjourney, DALL-E, or Flux).\n';
    if (brief) prompt += '\nCreative brief: ' + brief;
    prompt += recipeContextSnippet(recipe);
    prompt += brandSnippet('media');
    if (customInstructions) prompt += '\n\nAdditional instructions: ' + customInstructions;
    prompt += '\n\nRules:\n- Write a detailed, specific image generation prompt\n- Include: subject, setting, composition, lighting, camera angle, mood, color palette\n- Visual approach: ' + (params.visual_approach || 'photography') + '\n- Aspect ratio: ' + (params.aspect_ratio || '1:1') + '\n' + (params.mood ? '- Mood: ' + params.mood + '\n' : '') + '- Do NOT include text/typography in the image prompt (text overlays are added separately)\n- Write a negative prompt to exclude unwanted elements\n\nRespond ONLY as JSON: {"ai_prompt":"detailed image generation prompt...","negative_prompt":"elements to exclude..."}';

    callAIWithRetry(prompt, function(parsed) {
      recipe.image_brief = recipe.image_brief || {};
      recipe.image_brief.ai_prompt = parsed.ai_prompt || '';
      recipe.image_brief.prompt_params = recipe.image_brief.prompt_params || {};
      if (parsed.negative_prompt) recipe.image_brief.prompt_params.negative_prompt = parsed.negative_prompt;
      recipe.updated = new Date().toISOString();
      logActivity('media_generated', 'recipe', recipeId, recipe.title, 'AI image prompt generated');
      snapshot('AI prompt'); if (maybeAdvanceRecipeStatus) maybeAdvanceRecipeStatus(recipe, 'image prompt generated');
      buildMaps(); render(); syncToTextarea();
      toast('AI image prompt generated', 'success');
    }, function(err) { toast('AI Error: ' + err, 'error'); }, 'ai-generate-prompt', BrandService.getSystemPrompt('media'), parseJSON);
  }

  function aiGenerateBlueprint(recipeId, customInstructions) {
    var recipe = getRecipe(recipeId); if (!recipe) return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    toast('Generating video blueprint...', 'info');

    var vid = recipe.video || {};
    var duration = vid.duration_seconds || 30;
    var format = vid.format || 'Reel';

    var prompt = 'You are a video production expert creating a scene-by-scene blueprint for a Meta Ads video.\n';
    prompt += recipeContextSnippet(recipe);
    prompt += brandSnippet('content');
    if (customInstructions) prompt += '\n\nAdditional instructions: ' + customInstructions;
    prompt += '\n\nVideo specs:\n- Duration: ' + duration + ' seconds\n- Format: ' + format + '\n- Aspect ratio: ' + (vid.aspect_ratio || '9:16') + '\n' + (vid.concept ? '- Concept: ' + vid.concept + '\n' : '');
    prompt += '\n\nRules:\n- Break the video into 4-6 distinct scenes\n- Each scene should have a clear purpose in the narrative arc\n- First scene = HOOK (must grab attention in first 2 seconds)\n- Last scene = CTA / brand moment\n- Include timestamp for each scene (e.g., "0:00-0:05")\n- Scene descriptions should be actionable for a production team\n- Total scene durations must add up to approximately ' + duration + ' seconds\n\nRespond ONLY as JSON: {"scenes":[{"name":"scene name","description":"what happens, visuals, action...","timestamp":"0:00-0:05","duration":"5s"}]}';

    callAIWithRetry(prompt, function(parsed) {
      recipe.video = recipe.video || {};
      recipe.video.blueprint = recipe.video.blueprint || {};
      recipe.video.blueprint.scenes = (parsed.scenes || []).map(function(s) {
        return { name: s.name || '', description: s.description || '', timestamp: s.timestamp || '', duration: s.duration || '' };
      });
      recipe.updated = new Date().toISOString();
      logActivity('media_generated', 'recipe', recipeId, recipe.title, (parsed.scenes || []).length + ' video scenes generated');
      snapshot('AI blueprint'); if (maybeAdvanceRecipeStatus) maybeAdvanceRecipeStatus(recipe, 'blueprint generated');
      buildMaps(); render(); syncToTextarea();
      toast('Generated ' + (parsed.scenes || []).length + ' scene blueprint', 'success');
    }, function(err) { toast('AI Error: ' + err, 'error'); }, 'ai-generate-blueprint', BrandService.getSystemPrompt('content'), parseJSON);
  }

  function aiGenerateScript(recipeId, customInstructions) {
    var recipe = getRecipe(recipeId); if (!recipe) return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }

    var scenes = (recipe.video && recipe.video.blueprint && recipe.video.blueprint.scenes) || [];
    if (scenes.length === 0) { toast('Generate a blueprint first — the script is built from scenes', 'warning'); return; }
    toast('Generating detailed script...', 'info');

    var sceneSummary = scenes.map(function(s, i) { return 'Scene ' + (i + 1) + ' (' + (s.timestamp || '?') + '): ' + (s.name || '') + ' — ' + truncate(s.description || '', 60); }).join('\n');

    var prompt = 'You are a video production scriptwriter. Create a detailed production script based on the scene blueprint below.\n';
    prompt += recipeContextSnippet(recipe);
    prompt += '\n\nScene blueprint:\n' + sceneSummary;
    prompt += brandSnippet('content');
    if (customInstructions) prompt += '\n\nAdditional instructions: ' + customInstructions;
    prompt += '\n\nRules:\n- Create one row per scene (or split longer scenes into 2 rows)\n- Each row needs: time (timestamp), dialogue (what talent says), visual (what viewer sees), camera (camera angle/movement), audio (music/SFX)\n- Dialogue should match the brand voice and style\n- Camera directions should be specific: "close-up face", "wide establishing shot", "product detail B-roll"\n- Audio should enhance the emotional arc\n\nRespond ONLY as JSON: {"rows":[{"time":"0:00","dialogue":"what is said...","visual":"what is shown...","camera":"camera direction...","audio":"music/sfx note..."}]}';

    callAIWithRetry(prompt, function(parsed) {
      recipe.video = recipe.video || {};
      recipe.video.script = recipe.video.script || {};
      recipe.video.script.rows = (parsed.rows || []).map(function(r) {
        return { time: r.time || '', dialogue: r.dialogue || '', visual: r.visual || '', camera: r.camera || '', audio: r.audio || '' };
      });
      recipe.updated = new Date().toISOString();
      logActivity('script_generated', 'recipe', recipeId, recipe.title, (parsed.rows || []).length + ' script rows generated');
      snapshot('AI script'); buildMaps(); render(); syncToTextarea();
      toast('Generated ' + (parsed.rows || []).length + '-row script', 'success');
    }, function(err) { toast('AI Error: ' + err, 'error'); }, 'ai-generate-script', BrandService.getSystemPrompt('content'), parseJSON);
  }

