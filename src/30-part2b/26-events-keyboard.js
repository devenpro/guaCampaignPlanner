  // ============================================================
  // SECTION 22: EVENTS & KEYBOARD SHORTCUTS
  // ============================================================

  function setupPart2BEvents() {
    // AI Research Panel interactions
    $(document).off('click.cp2b-research-gen').on('click.cp2b-research-gen', '[data-action="ai-research-generate"]', function(e) {
      e.preventDefault();
      var entityType = $(this).data('entity-type');
      var stateKey = $(this).data('state-key');
      var customInput = $('#cpResearchInput_' + stateKey).val() || '';
      // Route to appropriate AI function
      if (entityType === 'Persona') aiResearchPersonas(customInput);
      else if (entityType === 'Message') aiResearchMessages(customInput);
      else if (entityType === 'Style') aiResearchStyles(customInput);
      else if (entityType === 'Visual Format') aiResearchFormats(customInput);
      else if (entityType === 'Pain Point') aiResearchPainPoints(null, customInput);
    });

    // Toggle research result selection
    $(document).off('click.cp2b-research-toggle').on('click.cp2b-research-toggle', '.cp-ai-research-result', function(e) {
      e.preventDefault();
      var stateKey = $(this).data('state-key');
      var index = parseInt($(this).data('result-index'), 10);
      if (!isNaN(index) && stateKey) toggleResearchResultSelection(stateKey, index);
    });

    // Select all research results
    $(document).off('click.cp2b-research-selall').on('click.cp2b-research-selall', '[data-action="ai-research-select-all"]', function(e) {
      e.preventDefault();
      selectAllResearchResults($(this).data('state-key'));
    });

    // Add selected to library
    $(document).off('click.cp2b-research-add').on('click.cp2b-research-add', '[data-action="ai-research-add-selected"]', function(e) {
      e.preventDefault();
      addSelectedToLibrary($(this).data('entity-type'), $(this).data('state-key'));
    });

    // Inline AI assist
    $(document).off('click.cp2b-ai-assist').on('click.cp2b-ai-assist', '[data-action="ai-assist"]', function(e) {
      e.preventDefault();
      handleInlineAssist($(this).data('field-id'), $(this).data('mode'));
    });

    // AI action buttons from Part 2A pipeline steps (read custom instructions from expandable panel)
    function _getAICustomInstructions(btn) {
      var panelId = $(btn).data('panel-id');
      if (panelId) return ($('.cp-ai-custom-instructions[data-panel-id="' + panelId + '"]').val() || '').trim();
      return '';
    }

    // AI Preview modal interactions
    $(document).off('click.cp2b-ai-preview-sel').on('click.cp2b-ai-preview-sel', '[data-action="ai-preview-select"]', function(e) {
      e.preventDefault();
      var idx = parseInt($(this).data('idx'), 10);
      if (S._aiPreview && S._aiPreview.onSelect) S._aiPreview.onSelect(idx);
    });
    $(document).off('click.cp2b-ai-preview-regen').on('click.cp2b-ai-preview-regen', '[data-action="ai-preview-regenerate"]', function(e) {
      e.preventDefault();
      var instructions = ($('#cpAIPreviewInstructions').val() || '').trim();
      if (S._aiPreview && S._aiPreview.regenerate) {
        closeModal();
        S._aiPreview.regenerate(instructions);
      }
    });

    // AI Improve content
    $(document).off('click.cp2b-ai-improve').on('click.cp2b-ai-improve', '[data-action="ai-improve-content"]', function(e) {
      e.preventDefault(); aiImproveContent($(this).data('recipe-id'), _getAICustomInstructions(this));
    });

    // Export — copy ad copy to clipboard
    $(document).off('click.cp2b-copy-content').on('click.cp2b-copy-content', '[data-action="copy-recipe-content"]', function(e) {
      e.preventDefault();
      var recipe = getRecipe($(this).data('recipe-id'));
      if (!recipe) return;
      var content = recipe.content || {};
      var text = '';
      if (content.headline) text += content.headline + '\n\n';
      text += stripHtml(content.ad_copy || '');
      if (content.cta) text += '\n\n[CTA: ' + content.cta + ']';
      copyToClipboard(text, 'Ad copy copied to clipboard');
    });
    $(document).off('click.cp2b-copy-brief').on('click.cp2b-copy-brief', '[data-action="copy-recipe-brief"]', function(e) {
      e.preventDefault();
      var recipe = getRecipe($(this).data('recipe-id'));
      if (!recipe) return;
      var brief = (recipe.image_brief && recipe.image_brief.creative_brief) || '';
      var prompt = (recipe.image_brief && recipe.image_brief.ai_prompt) || '';
      var text = 'Creative Brief:\n' + brief;
      if (prompt) text += '\n\nAI Prompt:\n' + prompt;
      copyToClipboard(text, 'Creative brief copied to clipboard');
    });
    $(document).off('click.cp2b-export-json').on('click.cp2b-export-json', '[data-action="export-recipe-json"]', function(e) {
      e.preventDefault();
      var recipe = getRecipe($(this).data('recipe-id'));
      if (!recipe) return;
      var json = JSON.stringify(recipe, null, 2);
      var blob = new Blob([json], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = (recipe.title || 'recipe').replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.json';
      a.click();
      URL.revokeObjectURL(url);
      toast('Recipe exported as JSON', 'success');
    });

    function copyToClipboard(text, msg) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() { toast(msg || 'Copied!', 'success'); }).catch(function() { fallbackCopy(text, msg); });
      } else { fallbackCopy(text, msg); }
    }
    function fallbackCopy(text, msg) {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast(msg || 'Copied!', 'success'); } catch(e) { toast('Copy failed — select and copy manually', 'warning'); }
      document.body.removeChild(ta);
    }
    $(document).off('click.cp2b-ai-hook').on('click.cp2b-ai-hook', '[data-action="ai-generate-hook"]', function(e) {
      e.preventDefault(); aiGenerateHook($(this).data('recipe-id'), _getAICustomInstructions(this));
    });
    $(document).off('click.cp2b-ai-content').on('click.cp2b-ai-content', '[data-action="ai-generate-content"]', function(e) {
      e.preventDefault(); aiWriteContent($(this).data('recipe-id'), _getAICustomInstructions(this));
    });
    $(document).off('click.cp2b-ai-brief').on('click.cp2b-ai-brief', '[data-action="ai-generate-brief"]', function(e) {
      e.preventDefault(); aiGenerateBrief($(this).data('recipe-id'), _getAICustomInstructions(this));
    });
    $(document).off('click.cp2b-ai-prompt').on('click.cp2b-ai-prompt', '[data-action="ai-generate-prompt"]', function(e) {
      e.preventDefault(); aiGenerateImagePrompt($(this).data('recipe-id'), _getAICustomInstructions(this));
    });
    $(document).off('click.cp2b-ai-blueprint').on('click.cp2b-ai-blueprint', '[data-action="ai-generate-blueprint"]', function(e) {
      e.preventDefault(); aiGenerateBlueprint($(this).data('recipe-id'), _getAICustomInstructions(this));
    });
    $(document).off('click.cp2b-ai-script').on('click.cp2b-ai-script', '[data-action="ai-generate-script"]', function(e) {
      e.preventDefault(); aiGenerateScript($(this).data('recipe-id'), _getAICustomInstructions(this));
    });

    // AI research pain points (from persona detail)
    $(document).off('click.cp2b-ai-pp').on('click.cp2b-ai-pp', '[data-action="ai-research-pain-points"]', function(e) {
      e.preventDefault();
      aiResearchPainPoints($(this).data('persona-id'));
    });

    // AI campaign recipe suggestions
    $(document).off('click.cp2b-ai-camp').on('click.cp2b-ai-camp', '[data-action="ai-campaign-recipes"]', function(e) {
      e.preventDefault();
      aiSuggestCampaignRecipes($(this).data('campaign-id'));
    });

    // AI campaign brief generation
    $(document).off('click.cp2b-ai-camp-brief').on('click.cp2b-ai-camp-brief', '[data-action="ai-campaign-brief"]', function(e) {
      e.preventDefault();
      aiGenerateCampaignBrief($(this).data('campaign-id'));
    });

    // AI campaign gap analysis
    $(document).off('click.cp2b-ai-camp-gaps').on('click.cp2b-ai-camp-gaps', '[data-action="ai-campaign-gaps"]', function(e) {
      e.preventDefault();
      aiAnalyzeCampaignGaps($(this).data('campaign-id'));
    });

    // Wizard AI suggest (from wizard step 3)
    $(document).off('click.cp2b-wizard-ai').on('click.cp2b-wizard-ai', '[data-action="wizard-ai-suggest"]', function(e) {
      e.preventDefault();
      // Use the wizard's selected dimensions to run campaign AI suggestion
      var P2A = window._cpPart2A;
      if (!P2A || !P2A.wizardState) return;
      var ws = P2A.wizardState;
      if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
      toast('AI analyzing combinations...', 'info');

      // Build a lightweight prompt for prioritizing combos
      var personas = ws.selections.personas.map(function(id) { var p = S.personaMap[id]; return p ? p.name : ''; }).filter(Boolean);
      var messages = ws.selections.messages.map(function(id) { var m = S.messageMap[id]; return m ? m.title : ''; }).filter(Boolean);
      var styles = ws.selections.styles.map(function(id) { var s = S.styleMap[id]; return s ? s.name : ''; }).filter(Boolean);
      var formats = ws.selections.formats.map(function(id) { var f = S.formatMap[id]; return f ? f.name : ''; }).filter(Boolean);

      var prompt = 'You are a campaign strategist. Given these dimensions, identify the top 6-8 best recipe combinations (persona × message × style × format). Rank by expected performance.\n\n';
      prompt += 'Personas: ' + personas.join(', ') + '\n';
      prompt += 'Messages: ' + messages.join(', ') + '\n';
      prompt += 'Styles: ' + styles.join(', ') + '\n';
      prompt += 'Formats: ' + formats.join(', ') + '\n';
      if (ws.data.objective) { var obj = (Constants.CAMPAIGN_OBJECTIVES || []).find(function(o) { return o.id === ws.data.objective; }); if (obj) prompt += 'Objective: ' + obj.name + '\n'; }
      prompt += brandSnippet('research');
      prompt += '\n\nRespond ONLY as JSON: {"best":[{"persona":"name","message":"name","style":"name","format":"name"}]}';

      callAIWithRetry(prompt, function(text) {
        var parsed = parseJSON(text);
        var best = parsed.best || [];
        // Mark matching wizard recipes as selected
        ws.recipes.forEach(function(r) { r.selected = false; });
        best.forEach(function(b) {
          var match = ws.recipes.find(function(r) {
            var pOk = !b.persona || (S.personaMap[r.persona_id] && S.personaMap[r.persona_id].name === b.persona);
            var mOk = !b.message || (S.messageMap[r.message_id] && S.messageMap[r.message_id].title === b.message);
            var sOk = !b.style || (S.styleMap[r.style_id] && S.styleMap[r.style_id].name === b.style);
            var fOk = !b.format || (S.formatMap[r.visual_format_id] && S.formatMap[r.visual_format_id].name === b.format);
            return pOk && mOk && sOk && fOk && !r.selected;
          });
          if (match) match.selected = true;
        });
        P2A.openCampaignWizard ? renderWizardRefresh() : null;
        toast('AI selected ' + best.length + ' best combinations', 'success');

        function renderWizardRefresh() {
          // Re-render the wizard modal to show updated selections
          if (P2A.wizardState && P2A.wizardState.step === 3) {
            // Close and reopen to refresh
            closeModal();
            setTimeout(function() {
              P2A.wizardState.step = 3;
              if (typeof P2A.openCampaignWizard === 'function') {
                // Trigger re-render by opening step 3
                openModal('Campaign Wizard', '', { size: 'xl' });
                closeModal();
                P2A.openCampaignWizard.__renderStep3 ? P2A.openCampaignWizard.__renderStep3() : null;
              }
              render();
            }, 100);
          }
        }
      }, function(err) { toast('AI Error: ' + err, 'error'); }, 'ai-wizard-suggest', BrandService.getSystemPrompt('research'), parseJSON);
    });

    // AI provider picker dynamic model update
    $(document).off('change.cp2b-aip').on('change.cp2b-aip', '.cp-ai-provider-select', function() {
      var actionId = $(this).data('action-id'); var pid = $(this).val();
      var models = LLMService.getActiveModels(pid);
      var $mSel = $('.cp-ai-model-select[data-action-id="' + actionId + '"]');
      $mSel.empty();
      for (var i = 0; i < models.length; i++) {
        $mSel.append('<option value="' + esc(models[i].id) + '" data-temp="' + (models[i].temperature !== undefined ? models[i].temperature : 1.0) + '" data-tokens="' + (models[i].max_tokens || 8192) + '">' + esc(models[i].label) + '</option>');
      }
    });

    // AI status indicator click → navigate to settings
    $(document).off('click.cp2b-ai-status').on('click.cp2b-ai-status', '#cpAIStatus', function(e) {
      e.preventDefault();
      S.settingsTab = 'ai';
      navigate('settings');
    });

    // Test AI connection
    $(document).off('click.cp2b-test-ai').on('click.cp2b-test-ai', '[data-action="test-ai-connection"]', function(e) {
      e.preventDefault(); testAIConnection();
    });

    // --- Settings View ---
    $(document).off('click.cp2b-stab').on('click.cp2b-stab', '[data-action="settings-tab"]', function(e) {
      e.preventDefault(); S.settingsTab = $(this).data('tab'); render();
    });
    $(document).off('click.cp2b-save-settings').on('click.cp2b-save-settings', '[data-action="save-settings"]', function(e) {
      e.preventDefault(); saveAllSettings();
    });
    // Brand color picker sync
    $(document).off('input.cp2b-brand-color').on('input.cp2b-brand-color', '.cp-brand-color', function() {
      var key = $(this).data('color-key');
      $(this).closest('.cp-brand-color-field').find('.cp-brand-color-text').val($(this).val());
    });
    $(document).off('change.cp2b-brand-color-text').on('change.cp2b-brand-color-text', '.cp-brand-color-text', function() {
      var key = $(this).data('color-key'); var val = $(this).val();
      if (/^#[0-9a-fA-F]{6}$/.test(val)) $(this).closest('.cp-brand-color-field').find('.cp-brand-color').val(val);
    });
    // Funnel stage management
    $(document).off('click.cp2b-add-funnel').on('click.cp2b-add-funnel', '[data-action="add-funnel-stage"]', function(e) {
      e.preventDefault(); addFunnelStage();
    });
    $(document).off('click.cp2b-del-funnel').on('click.cp2b-del-funnel', '[data-action="delete-funnel-stage"]', function(e) {
      e.preventDefault(); deleteFunnelStage(parseInt($(this).data('stage-index'), 10));
    });

    // --- Import/Export ---
    $(document).off('click.cp2b-export').on('click.cp2b-export', '[data-action="export-json"]', function(e) {
      e.preventDefault(); exportJSON($(this).data('mode') || 'combined');
    });
    $(document).off('click.cp2b-import').on('click.cp2b-import', '[data-action="import-json"]', function(e) {
      e.preventDefault(); importJSON();
    });

    // --- Research Lab ---
    $(document).off('click.cp2b-research-tab').on('click.cp2b-research-tab', '[data-action="research-tab"]', function(e) {
      e.preventDefault(); S._researchTab = $(this).data('tab'); render();
    });

    // --- Images View ---
    $(document).off('click.cp2b-select-img').on('click.cp2b-select-img', '[data-action="select-image"]', function(e) {
      e.preventDefault();
      S.selectedImageId = $(this).data('fid');
      render();
    });
    $(document).off('click.cp2b-save-img-meta').on('click.cp2b-save-img-meta', '[data-action="save-img-meta"]', function(e) {
      e.preventDefault(); saveImageMeta();
    });
    $(document).off('input.cp2b-img-search').on('input.cp2b-img-search', '#cpImgSearch', function() {
      S.imageFilter = S.imageFilter || {};
      S.imageFilter.search = $(this).val() || '';
      render();
    });
    $(document).off('change.cp2b-img-filter').on('change.cp2b-img-filter', '.cp-img-filter', function() {
      var filterKey = $(this).data('filter');
      S.imageFilter = S.imageFilter || {};
      S.imageFilter[filterKey] = $(this).val() || '';
      render();
    });
    $(document).off('click.cp2b-img-star-filter').on('click.cp2b-img-star-filter', '[data-action="toggle-img-star-filter"]', function(e) {
      e.preventDefault();
      S.imageFilter = S.imageFilter || {};
      S.imageFilter.star = !S.imageFilter.star;
      render();
    });
    $(document).off('click.cp2b-upload-img').on('click.cp2b-upload-img', '[data-action="upload-image"]', function(e) {
      e.preventDefault();
      triggerImageUpload();
    });
    // Pick ref images (from recipe media step)
    $(document).off('click.cp2b-pick-refs').on('click.cp2b-pick-refs', '[data-action="pick-ref-images"]', function(e) {
      e.preventDefault();
      var recipeId = $(this).data('recipe-id');
      var recipe = getRecipe(recipeId);
      if (!recipe) return;
      var current = (recipe.image_brief && recipe.image_brief.reference_image_ids) || [];
      renderImagePicker(current, function(selected) {
        recipe.image_brief = recipe.image_brief || {};
        recipe.image_brief.reference_image_ids = selected;
        recipe.updated = new Date().toISOString();
        syncToTextarea(); buildMaps(); render();
        toast('Reference images updated', 'success');
      });
    });

    // Remove individual reference image from recipe
    $(document).off('click.cp2b-remove-ref').on('click.cp2b-remove-ref', '[data-action="remove-ref-image"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var recipeId = $(this).data('recipe-id');
      var fid = $(this).data('fid');
      var recipe = getRecipe(recipeId);
      if (!recipe || !fid) return;
      recipe.image_brief = recipe.image_brief || {};
      recipe.image_brief.reference_image_ids = (recipe.image_brief.reference_image_ids || []).filter(function(id) { return id !== fid; });
      recipe.updated = new Date().toISOString();
      syncToTextarea(); buildMaps(); render();
      toast('Reference image removed', 'success');
    });

    // --- Stage 4: Meta v2 AI buttons (replace Stage 1/2 stubs) ---
    $(document).off('click.cp2b-ai-tree').on('click.cp2b-ai-tree', '[data-action="ai-generate-campaign-tree"]', function(e) {
      e.preventDefault(); aiGenerateCampaignTree();
    });
    $(document).off('click.cp2b-ai-sug-sets').on('click.cp2b-ai-sug-sets', '[data-action="ai-suggest-ad-sets"]', function(e) {
      e.preventDefault(); aiSuggestAdSets($(this).data('campaign-id'));
    });
    $(document).off('click.cp2b-ai-sug-ads').on('click.cp2b-ai-sug-ads', '[data-action="ai-suggest-ads"]', function(e) {
      e.preventDefault(); aiSuggestAds($(this).data('ad-set-id'));
    });
    $(document).off('click.cp2b-ai-set-brief').on('click.cp2b-ai-set-brief', '[data-action="ai-generate-ad-set-brief"]', function(e) {
      e.preventDefault(); aiGenerateAdSetBrief($(this).data('id'));
    });
    $(document).off('click.cp2b-ai-hooks').on('click.cp2b-ai-hooks', '[data-action="ai-generate-ad-hooks"]', function(e) {
      e.preventDefault(); aiGenerateAdHooks($(this).data('id'));
    });
    $(document).off('click.cp2b-ai-copy').on('click.cp2b-ai-copy', '[data-action="ai-write-ad-copy"]', function(e) {
      e.preventDefault(); aiWriteAdCopy($(this).data('id'));
    });
    $(document).off('click.cp2b-ai-improve').on('click.cp2b-ai-improve', '[data-action="ai-improve-ad-copy"]', function(e) {
      e.preventDefault(); aiImproveAdCopy($(this).data('id'));
    });
    $(document).off('click.cp2b-ai-img-prompt').on('click.cp2b-ai-img-prompt', '[data-action="ai-generate-ad-image-prompt"]', function(e) {
      e.preventDefault(); aiGenerateAdImagePrompt($(this).data('id'));
    });
    $(document).off('click.cp2b-ai-video-bp').on('click.cp2b-ai-video-bp', '[data-action="ai-generate-video-blueprint"]', function(e) {
      e.preventDefault(); aiGenerateVideoBlueprint($(this).data('id'));
    });
    $(document).off('click.cp2b-ai-video-scr').on('click.cp2b-ai-video-scr', '[data-action="ai-generate-video-script"]', function(e) {
      e.preventDefault(); aiGenerateVideoScript($(this).data('id'));
    });

    // --- Stage 6: migration wizard + feature flag toggle ---
    $(document).off('click.cp2b-v2-mig').on('click.cp2b-v2-mig', '[data-action="v2-open-migration"]', function(e) {
      e.preventDefault(); openMigrationWizard();
    });
    $(document).off('click.cp2b-v2-discard').on('click.cp2b-v2-discard', '[data-action="v2-discard-legacy"]', function(e) {
      e.preventDefault(); discardLegacyBackup();
    });
    $(document).off('change.cp2b-v2-flag').on('change.cp2b-v2-flag', '.cp-v2-toggle-flag', function() {
      snapshot('Toggle Meta v2');
      S.meta.setup = S.meta.setup || {};
      S.meta.setup.meta_v2 = !!this.checked;
      syncToTextarea();
      // Re-render the whole shell so sidebar regroups
      if (window._cpRenderAppShell) {
        $('#cpApp').html(window._cpRenderAppShell());
        render();
      }
      toast(this.checked ? 'Meta v2 enabled' : 'Meta v2 disabled', 'success');
    });
    $(document).off('change.cp2b-v2-def').on('change.cp2b-v2-def', '.cp-v2-defaults-field', function() {
      var key = $(this).data('key');
      var val = $(this).val();
      S.meta.meta_defaults = S.meta.meta_defaults || {};
      S.meta.meta_defaults[key] = val;
      syncToTextarea();
    });

    console.log('[CP] Part 2B event handlers ready');
  }

  function setupKeyboardShortcuts() {
    var viewKeys = { '1': 'dashboard', '2': 'personas', '3': 'pain_points', '4': 'messages', '5': 'styles', '6': 'formats', '7': 'recipes', '8': 'campaigns', '9': 'research', '0': 'settings' };

    $(document).off('keydown.cp2b-shortcuts').on('keydown.cp2b-shortcuts', function(e) {
      // Skip if inside input/textarea or modal open
      if ($(e.target).is('input, textarea, select, [contenteditable]')) return;
      if ($('.cp-modal-backdrop').length || $('.cp-confirm-backdrop').length) return;

      // Number keys → navigate
      if (viewKeys[e.key]) { e.preventDefault(); navigate(viewKeys[e.key]); return; }
      // / → focus search
      if (e.key === '/') {
        e.preventDefault();
        var $search = $('.cp-search-wrapper .cp-input:visible').first();
        if ($search.length) $search.focus();
        return;
      }
      // n → new entity (context-sensitive)
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        var P2A = window._cpPart2A;
        if (!P2A) return;
        var view = S.currentView;
        if (view === 'personas') P2A.openPersonaModal();
        else if (view === 'pain_points') P2A.openPainPointModal();
        else if (view === 'messages') P2A.openMessageModal();
        else if (view === 'styles') P2A.openStyleModal();
        else if (view === 'formats') P2A.openFormatModal();
        else if (view === 'campaigns') P2A.openCampaignModal();
        else if (view === 'recipes') P2A.openMixerModal('manual');
        return;
      }
    });
  }

