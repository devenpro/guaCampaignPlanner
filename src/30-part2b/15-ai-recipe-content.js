  // ============================================================
  // SECTION 14: AI — RECIPE CONTENT
  // ============================================================

  function aiGenerateHook(recipeId, customInstructions) {
    var recipe = getRecipe(recipeId); if (!recipe) return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    toast('Generating hooks...', 'info');

    var prompt = 'You are a copywriting expert specializing in scroll-stopping Meta Ads hooks. Generate 5 opening hooks for this ad.\n';
    prompt += recipeContextSnippet(recipe);
    prompt += brandSnippet('hooks');
    if (customInstructions) prompt += '\n\nAdditional instructions: ' + customInstructions;
    prompt += '\n\nRules:\n- Each hook MUST stop the scroll in under 2 seconds\n- Use different hook psychology types:\n  1. Question hook (provocative question)\n  2. Bold claim / contrarian statement\n  3. Story/curiosity hook ("I was wrong about...")\n  4. Data/statistic hook (specific number)\n  5. Direct address ("If you [specific situation]...")\n- Keep each hook under 15 words\n- Tailor to the specific persona and their pain points\n- No generic openers like "In today\'s world"\n\nRespond ONLY as JSON: {"hooks":[{"text":"hook text...","type":"question|bold|story|data|direct"}]}';

    callAIWithRetry(prompt, function(parsed) {
      var hooks = parsed.hooks || [];
      if (hooks.length === 0) { toast('AI returned no hooks — try again', 'warning'); return; }

      // Add hooks to linked message if it exists
      var msg = S.messageMap[recipe.message_id];
      if (msg) {
        msg.hooks = msg.hooks || [];
        hooks.forEach(function(h) {
          msg.hooks.push({ id: generateId('hk'), text: h.text || '', type: h.type || 'direct' });
        });
        msg.updated = new Date().toISOString();
        // Select the first new hook
        recipe.hook = recipe.hook || {};
        recipe.hook.selected_hook_id = msg.hooks[msg.hooks.length - hooks.length].id;
      } else {
        // No message linked — store the best hook as custom_hook
        recipe.hook = recipe.hook || {};
        recipe.hook.custom_hook = hooks[0].text || '';
        recipe.hook.hook_type = hooks[0].type || 'direct';
        // Log the others so the user can see them
        if (hooks.length > 1) {
          recipe.hook._ai_suggestions = hooks.map(function(h) { return { text: h.text || '', type: h.type || '' }; });
        }
        toast('No message linked — saved best hook as custom hook. Link a message to store all hooks.', 'info', 5000);
      }
      recipe.updated = new Date().toISOString();
      logActivity('hook_generated', 'recipe', recipeId, recipe.title, (parsed.hooks || []).length + ' hooks generated');
      snapshot('AI hooks'); if (maybeAdvanceRecipeStatus) maybeAdvanceRecipeStatus(recipe, 'hooks generated');
      buildMaps(); render(); syncToTextarea();
      toast('Generated ' + (parsed.hooks || []).length + ' hooks', 'success');
    }, function(err) { toast('AI Error: ' + err, 'error'); }, 'ai-generate-hook', BrandService.getSystemPrompt('content'), parseJSON);
  }

  function aiWriteContent(recipeId, customInstructions) {
    var recipe = getRecipe(recipeId); if (!recipe) return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    toast('Writing ad copy alternatives...', 'info');

    var hook = getEffectiveHook ? getEffectiveHook(recipe) : null;
    var prompt = 'You are a top-performing Meta Ads copywriter. Write 2 compelling ad copy ALTERNATIVES for this creative. Each should take a different angle or tone.\n';
    prompt += recipeContextSnippet(recipe);
    prompt += brandSnippet('content');
    if (customInstructions) prompt += '\n\nAdditional instructions: ' + customInstructions;
    prompt += '\n\nRules:\n- Start with the hook' + (hook ? ': "' + hook.text + '"' : '') + '\n- Write for Meta Ads: concise, punchy, action-oriented\n- Each alternative should be DISTINCT in approach\n- Include headline (under 10 words) and CTA button text per alternative\n- Alternative 1: more emotional/story-driven\n- Alternative 2: more direct/benefits-focused\n\nRespond ONLY as JSON: {"alternatives":[{"label":"approach name","ad_copy":"primary text with \\n for line breaks","headline":"short headline","description":"supporting description","cta":"CTA button text"}]}';

    callAIWithRetry(prompt, function(parsed) {
      var alts = parsed.alternatives || [];
      if (alts.length === 0) { toast('AI returned no content', 'warning'); return; }

      // Show preview modal
      var previewAlts = alts.map(function(a) {
        return {
          label: a.label || '',
          sections: [
            { label: 'Ad Copy', value: (a.ad_copy || '').replace(/\\n/g, '\n') },
            { label: 'Headline', value: a.headline || '' },
            { label: 'Description', value: a.description || '' },
            { label: 'CTA', value: a.cta || '' }
          ],
          _data: a
        };
      });

      showAIPreview('Choose Ad Copy — ' + truncate(recipe.title, 30), previewAlts, function(idx) {
        var chosen = alts[idx];
        recipe.content = recipe.content || {};
        var paragraphs = (chosen.ad_copy || '').split(/\\n|\n/).filter(function(p) { return p.trim(); });
        recipe.content.ad_copy = paragraphs.length > 0 ? '<p>' + paragraphs.join('</p><p>') + '</p>' : '<p>' + (chosen.ad_copy || '') + '</p>';
        if (chosen.headline) recipe.content.headline = chosen.headline;
        if (chosen.description) recipe.content.description = chosen.description;
        if (chosen.cta) recipe.content.cta = chosen.cta;
        recipe.updated = new Date().toISOString();
        logActivity('content_generated', 'recipe', recipeId, recipe.title, 'Ad copy selected from AI alternatives');
        snapshot('AI content'); if (maybeAdvanceRecipeStatus) maybeAdvanceRecipeStatus(recipe, 'content written');
        buildMaps(); render(); syncToTextarea();
        closeModal();
        toast('Ad copy applied', 'success');
      }, {
        onRegenerate: function(instructions) { aiWriteContent(recipeId, instructions); }
      });
    }, function(err) { toast('AI Error: ' + err, 'error'); }, 'ai-generate-content', BrandService.getSystemPrompt('content'), parseJSON);
  }

