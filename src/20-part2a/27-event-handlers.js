  // ============================================================
  // SECTION 19: EVENT HANDLERS
  // ============================================================

  function setupPart2AEvents() {
    console.log('[CP] Setting up Part 2A event handlers...');

    // --- Modal events ---
    $(document).off('click.cp2a-modal-close').on('click.cp2a-modal-close', '[data-action="close-modal"]', function(e) {
      e.preventDefault(); closeModal();
    });
    $(document).off('click.cp2a-modal-save').on('click.cp2a-modal-save', '[data-action="modal-save"]', function(e) {
      e.preventDefault();
      if (currentModal && currentModal.onSave) currentModal.onSave();
    });
    $(document).off('click.cp2a-modal-bg').on('click.cp2a-modal-bg', '.cp-modal-backdrop', function(e) {
      if ($(e.target).hasClass('cp-modal-backdrop')) closeModal();
    });

    // --- Category CRUD ---
    $(document).off('click.cp2a-new-cat').on('click.cp2a-new-cat', '[data-action="new-category"]', function(e) {
      e.preventDefault(); openCategoryModal();
    });
    $(document).off('click.cp2a-edit-cat').on('click.cp2a-edit-cat', '[data-action="edit-category"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      openCategoryModal($(this).data('id'));
    });
    $(document).off('click.cp2a-delete-cat').on('click.cp2a-delete-cat', '[data-action="delete-category"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      confirmDeleteCategory($(this).data('id'));
    });

    // --- Persona CRUD ---
    $(document).off('click.cp2a-new-persona').on('click.cp2a-new-persona', '[data-action="new-persona"]', function(e) {
      e.preventDefault(); openPersonaModal();
    });
    $(document).off('click.cp2a-edit-persona').on('click.cp2a-edit-persona', '[data-action="edit-persona"]', function(e) {
      e.preventDefault(); openPersonaModal($(this).data('id'));
    });
    $(document).off('click.cp2a-delete-persona').on('click.cp2a-delete-persona', '[data-action="delete-persona"]', function(e) {
      e.preventDefault(); confirmDeletePersona($(this).data('id'));
    });
    $(document).off('click.cp2a-add-pp-persona').on('click.cp2a-add-pp-persona', '[data-action="add-pain-point-to-persona"]', function(e) {
      e.preventDefault();
      var personaId = $(this).data('persona-id');
      if (!personaId) return;
      openPainPointModal(); // Opens new pain point modal; user can link it to persona after creation
    });

    // --- Pain Point CRUD ---
    $(document).off('click.cp2a-new-pp').on('click.cp2a-new-pp', '[data-action="new-pain-point"]', function(e) {
      e.preventDefault(); openPainPointModal();
    });
    $(document).off('click.cp2a-select-pp').on('click.cp2a-select-pp', '[data-action="select-pain-point"]', function(e) {
      e.preventDefault(); openPainPointModal($(this).data('id'));
    });
    $(document).off('click.cp2a-delete-pp').on('click.cp2a-delete-pp', '[data-action="delete-pain-point"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      confirmDeletePainPoint($(this).data('id'));
    });

    // --- Message CRUD ---
    $(document).off('click.cp2a-new-msg').on('click.cp2a-new-msg', '[data-action="new-message"]', function(e) {
      e.preventDefault(); openMessageModal();
    });
    $(document).off('click.cp2a-edit-msg').on('click.cp2a-edit-msg', '[data-action="edit-message"]', function(e) {
      e.preventDefault(); e.stopPropagation(); openMessageModal($(this).data('id'));
    });
    $(document).off('click.cp2a-delete-msg').on('click.cp2a-delete-msg', '[data-action="delete-message"]', function(e) {
      e.preventDefault(); e.stopPropagation(); confirmDeleteMessage($(this).data('id'));
    });
    $(document).off('click.cp2a-select-msg').on('click.cp2a-select-msg', '[data-action="select-message"]', function(e) {
      e.preventDefault(); openMessageModal($(this).data('id'));
    });

    // --- Style CRUD ---
    $(document).off('click.cp2a-new-style').on('click.cp2a-new-style', '[data-action="new-style"]', function(e) {
      e.preventDefault(); openStyleModal();
    });
    $(document).off('click.cp2a-edit-style').on('click.cp2a-edit-style', '[data-action="edit-style"]', function(e) {
      e.preventDefault(); e.stopPropagation(); openStyleModal($(this).data('id'));
    });
    $(document).off('click.cp2a-delete-style').on('click.cp2a-delete-style', '[data-action="delete-style"]', function(e) {
      e.preventDefault(); e.stopPropagation(); confirmDeleteStyle($(this).data('id'));
    });

    // --- Format CRUD ---
    $(document).off('click.cp2a-new-format').on('click.cp2a-new-format', '[data-action="new-format"]', function(e) {
      e.preventDefault(); openFormatModal();
    });
    $(document).off('click.cp2a-edit-format').on('click.cp2a-edit-format', '[data-action="edit-format"]', function(e) {
      e.preventDefault(); e.stopPropagation(); openFormatModal($(this).data('id'));
    });
    $(document).off('click.cp2a-delete-format').on('click.cp2a-delete-format', '[data-action="delete-format"]', function(e) {
      e.preventDefault(); e.stopPropagation(); confirmDeleteFormat($(this).data('id'));
    });

    // --- Campaign CRUD ---
    $(document).off('click.cp2a-new-camp').on('click.cp2a-new-camp', '[data-action="new-campaign"]', function(e) {
      e.preventDefault(); openCampaignModal();
    });
    $(document).off('click.cp2a-edit-camp').on('click.cp2a-edit-camp', '[data-action="edit-campaign"]', function(e) {
      e.preventDefault(); e.stopPropagation(); openCampaignModal($(this).data('id'));
    });
    $(document).off('click.cp2a-delete-camp').on('click.cp2a-delete-camp', '[data-action="delete-campaign"]', function(e) {
      e.preventDefault(); e.stopPropagation(); confirmDeleteCampaign($(this).data('id'));
    });
    $(document).off('click.cp2a-select-camp').on('click.cp2a-select-camp', '[data-action="select-campaign"]', function(e) {
      e.preventDefault();
      S.selectedCampaignId = $(this).data('id');
      render();
    });

    // --- Tag CRUD ---
    $(document).off('click.cp2a-new-tag').on('click.cp2a-new-tag', '[data-action="new-tag"]', function(e) {
      e.preventDefault(); openTagModal();
    });
    $(document).off('click.cp2a-edit-tag').on('click.cp2a-edit-tag', '[data-action="edit-tag"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      openTagModal($(this).data('id'));
    });
    $(document).off('click.cp2a-delete-tag').on('click.cp2a-delete-tag', '[data-action="delete-tag"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      confirmDeleteTag($(this).data('id'));
    });

    // --- Recipe delete ---
    $(document).off('click.cp2a-delete-recipe').on('click.cp2a-delete-recipe', '[data-action="delete-recipe"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      var r = getRecipe(id);
      if (!r) return;
      openConfirmDialog({
        title: 'Delete Recipe',
        message: 'Delete "' + (r.title || 'Untitled') + '"?',
        confirmLabel: 'Delete', danger: true,
        onConfirm: function() {
          snapshot('Delete recipe'); deleteEntity('recipe', id);
          if (S.selectedRecipeId === id) { S.selectedRecipeId = null; S.currentStep = null; }
        }
      });
    });

    // --- Modal-specific interactions ---
    // Funnel chip toggle in modals
    $(document).off('click.cp2a-funnel-chip').on('click.cp2a-funnel-chip', '[data-action="toggle-funnel-chip"]', function(e) {
      e.preventDefault();
      var $chip = $(this);
      var stageId = $chip.data('stage-id');
      var f = getFunnelStage(stageId);
      if (!f) return;
      var isActive = $chip.hasClass('cp-funnel-chip-active');
      if (isActive) {
        $chip.removeClass('cp-funnel-chip-active').css({ background: '', borderColor: f.color + '40', color: f.color });
      } else {
        $chip.addClass('cp-funnel-chip-active').css({ background: f.color, borderColor: f.color, color: '#fff' });
      }
    });

    // Color swatch picker
    $(document).off('click.cp2a-color').on('click.cp2a-color', '[data-action="pick-color"]', function(e) {
      e.preventDefault();
      var color = $(this).data('color');
      $(this).closest('.cp-chip-selector').find('.cp-color-swatch').css('border-color', 'transparent').removeClass('cp-color-swatch-active');
      $(this).css('border-color', 'var(--cp-text-primary)').addClass('cp-color-swatch-active');
      $(this).closest('.cp-form-group').find('input[data-field="color"]').val(color);
    });

    // Add/remove hook rows in message modal
    $(document).off('click.cp2a-add-hook').on('click.cp2a-add-hook', '[data-action="add-hook-row"]', function(e) {
      e.preventDefault(); addHookRow();
    });
    $(document).off('click.cp2a-rm-hook').on('click.cp2a-rm-hook', '[data-action="remove-hook-row"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      removeHookRow(parseInt($(this).data('hook-index'), 10));
    });

    // Pain point picker checkbox toggle in persona modal
    $(document).off('change.cp2a-pp-check').on('change.cp2a-pp-check', '.cp-pain-point-picker-item input[type="checkbox"]', function() {
      $(this).closest('.cp-pain-point-picker-item').toggleClass('cp-pain-point-picker-item-selected', this.checked);
    });

    // --- Pipeline Step Events ---

    // Change dimension (opens picker modal)
    $(document).off('click.cp2a-change-dim').on('click.cp2a-change-dim', '[data-action="change-dimension"]', function(e) {
      e.preventDefault();
      var dim = $(this).data('dim');
      var recipeId = $(this).data('recipe-id') || (getSelectedRecipe() ? getSelectedRecipe().id : '');
      if (dim && recipeId) openDimensionPicker(dim, recipeId);
    });

    // Set media type
    $(document).off('click.cp2a-media-type').on('click.cp2a-media-type', '[data-action="set-media-type"]', function(e) {
      e.preventDefault();
      var type = $(this).data('type');
      var recipe = getSelectedRecipe();
      if (!recipe || !type) return;
      // Guard: media type is locked once a production node exists for the recipe.
      if (typeof getRecipeProduction === 'function' && getRecipeProduction(recipe)) {
        toast('Media type is locked — a production node exists for this recipe', 'warning');
        return;
      }
      saveEntityField('recipe', recipe.id, 'media_type', type);
      snapshot('Change media type');
    });

    // Refresh production data from the page (re-parse view-media-productions
    // block, then re-render). Used by the "Refresh from page" button on the
    // production-exists card.
    $(document).off('click.cp2a-refresh-prod').on('click.cp2a-refresh-prod', '[data-action="refresh-production"]', function(e) {
      e.preventDefault();
      if (typeof parseProductionData !== 'function') { toast('Refresh unavailable', 'warning'); return; }
      parseProductionData();
      toast('Production data refreshed', 'success');
      if (typeof window._cpRender === 'function') window._cpRender();
    });

    // Save recipe title
    $(document).off('blur.cp2a-recipe-title').on('blur.cp2a-recipe-title', '[data-action="save-recipe-title"]', function() {
      var recipe = getSelectedRecipe();
      if (recipe) saveEntityField('recipe', recipe.id, 'title', $(this).val() || '');
    });

    // Save recipe simple fields (priority, campaign, due_date)
    $(document).off('change.cp2a-recipe-field').on('change.cp2a-recipe-field', '[data-action="save-recipe-field"]', function() {
      var recipe = getSelectedRecipe();
      var field = $(this).data('rfield');
      if (recipe && field) saveEntityField('recipe', recipe.id, field, $(this).val() || '');
    });

    // Toggle recipe pain point
    $(document).off('change.cp2a-recipe-pp').on('change.cp2a-recipe-pp', '[data-action="toggle-recipe-pp"]', function() {
      var recipe = getSelectedRecipe();
      if (!recipe) return;
      var ppId = $(this).data('pp-id');
      var pps = recipe.selected_pain_point_ids || [];
      if (this.checked) { if (pps.indexOf(ppId) === -1) pps.push(ppId); }
      else { pps = pps.filter(function(id) { return id !== ppId; }); }
      saveEntityField('recipe', recipe.id, 'selected_pain_point_ids', pps);
      $(this).closest('.cp-pain-point-picker-item').toggleClass('cp-pain-point-picker-item-selected', this.checked);
    });

    // Composition pain point filter + scope toggle (in-step picker)
    $(document).off('input.cp2a-comp-pain-search').on('input.cp2a-comp-pain-search', '#cpRecipePainSearch', _cpDebouncePainSearch);
    $(document).off('change.cp2a-comp-pain-cat').on('change.cp2a-comp-pain-cat', '#cpRecipePainCategory', function() {
      S._compPainFilter = S._compPainFilter || {};
      S._compPainFilter.category = $(this).val() || '';
      render();
    });
    $(document).off('click.cp2a-comp-pain-scope').on('click.cp2a-comp-pain-scope', '[data-action="set-pain-scope"]', function(e) {
      e.preventDefault();
      S._compPainFilter = S._compPainFilter || {};
      S._compPainFilter.scope = $(this).data('scope') || 'persona';
      render();
    });

    // Hook selection (radio)
    $(document).off('change.cp2a-select-hook').on('change.cp2a-select-hook', '[data-action="select-hook"]', function() {
      var recipe = getSelectedRecipe();
      if (!recipe) return;
      recipe.hook = recipe.hook || {};
      recipe.hook.selected_hook_id = $(this).val() || '';
      recipe.updated = new Date().toISOString();
      syncToTextarea();
      if (maybeAdvanceRecipeStatus) maybeAdvanceRecipeStatus(recipe, 'hook selected');
      buildMaps(); render();
    });

    // Save custom hook
    $(document).off('blur.cp2a-hook-custom').on('blur.cp2a-hook-custom', '[data-action="save-recipe-hook-custom"]', function() {
      var recipe = getSelectedRecipe();
      if (!recipe) return;
      recipe.hook = recipe.hook || {};
      recipe.hook.custom_hook = $(this).val() || '';
      recipe.updated = new Date().toISOString();
      syncToTextarea();
      if (maybeAdvanceRecipeStatus) maybeAdvanceRecipeStatus(recipe, 'custom hook written');
      buildMaps();
    });

    // Save hook type
    $(document).off('change.cp2a-hook-type').on('change.cp2a-hook-type', '[data-action="save-recipe-hook-type"]', function() {
      var recipe = getSelectedRecipe();
      if (!recipe) return;
      recipe.hook = recipe.hook || {};
      recipe.hook.hook_type = $(this).val() || '';
      recipe.updated = new Date().toISOString();
      syncToTextarea();
    });

    // Save content fields (headline, description, cta, notes)
    $(document).off('blur.cp2a-content-field').on('blur.cp2a-content-field', '[data-action="save-content-field"]', function() {
      var field = $(this).data('cfield');
      if (field) saveContentField(field, $(this).val() || '');
    });

    // Save brief fields
    $(document).off('blur.cp2a-brief-field').on('blur.cp2a-brief-field', '[data-action="save-brief-field"]', function() {
      var field = $(this).data('bfield');
      if (field) saveBriefField(field, $(this).val() || '');
    });

    // Save prompt params
    $(document).off('change.cp2a-prompt-param blur.cp2a-prompt-param').on('change.cp2a-prompt-param blur.cp2a-prompt-param', '[data-action="save-prompt-param"]', function() {
      var param = $(this).data('param');
      if (param) savePromptParam(param, $(this).val() || '');
    });

    // Save video fields
    $(document).off('change.cp2a-video-field blur.cp2a-video-field').on('change.cp2a-video-field blur.cp2a-video-field', '[data-action="save-video-field"]', function() {
      var field = $(this).data('vfield');
      if (field) saveVideoField(field, $(this).val() || '');
    });

    // Save scene fields
    $(document).off('blur.cp2a-scene-field').on('blur.cp2a-scene-field', '[data-action="save-scene-field"]', function() {
      var idx = parseInt($(this).data('scene-index'), 10);
      var field = $(this).data('sfield');
      if (!isNaN(idx) && field) saveSceneField(idx, field, $(this).val() || '');
    });

    // Add/delete scene
    $(document).off('click.cp2a-add-scene').on('click.cp2a-add-scene', '[data-action="add-scene"]', function(e) { e.preventDefault(); addScene(); });
    $(document).off('click.cp2a-del-scene').on('click.cp2a-del-scene', '[data-action="delete-scene"]', function(e) {
      e.preventDefault();
      deleteScene(parseInt($(this).data('scene-index'), 10));
    });

    // Save script fields
    $(document).off('blur.cp2a-script-field').on('blur.cp2a-script-field', '[data-action="save-script-field"]', function() {
      var idx = parseInt($(this).data('row-index'), 10);
      var field = $(this).data('srfield');
      if (!isNaN(idx) && field) saveScriptField(idx, field, $(this).val() || '');
    });

    // Add script row
    $(document).off('click.cp2a-add-script-row').on('click.cp2a-add-script-row', '[data-action="add-script-row"]', function(e) { e.preventDefault(); addScriptRow(); });

    // Add/remove variants
    $(document).off('click.cp2a-add-variant').on('click.cp2a-add-variant', '[data-action="add-variant"]', function(e) { e.preventDefault(); addVariant(); });
    $(document).off('click.cp2a-rm-variant').on('click.cp2a-rm-variant', '[data-action="remove-variant"]', function(e) {
      e.preventDefault(); removeVariant(parseInt($(this).data('variant-index'), 10));
    });

    // Save variant text
    $(document).off('blur.cp2a-save-variant').on('blur.cp2a-save-variant', '[data-action="save-variant"]', function() {
      var recipe = getSelectedRecipe();
      if (!recipe) return;
      var idx = parseInt($(this).data('variant-index'), 10);
      recipe.content = recipe.content || {};
      recipe.content.variants = recipe.content.variants || [];
      if (recipe.content.variants[idx]) {
        recipe.content.variants[idx].text = $(this).val() || '';
        recipe.updated = new Date().toISOString();
        syncToTextarea();
      }
    });

    // Set recipe status (review step)
    $(document).off('click.cp2a-set-status').on('click.cp2a-set-status', '[data-action="set-recipe-status"]', function(e) {
      e.preventDefault();
      var status = $(this).data('status');
      var recipe = getSelectedRecipe();
      if (recipe && status) setRecipeStatus(recipe.id, status);
    });

    // Save review notes
    $(document).off('blur.cp2a-review-notes').on('blur.cp2a-review-notes', '[data-action="save-review-notes"]', function() {
      var recipe = getSelectedRecipe();
      if (recipe) saveEntityField('recipe', recipe.id, 'review_notes', $(this).val() || '');
    });

    // Save production notes
    $(document).off('blur.cp2a-prod-notes').on('blur.cp2a-prod-notes', '[data-action="save-production-notes"]', function() {
      var recipe = getSelectedRecipe();
      if (recipe) saveEntityField('recipe', recipe.id, 'production_notes', $(this).val() || '');
    });

    // Copy production handoff URL to clipboard
    $(document).off('click.cp2a-copy-prod-url').on('click.cp2a-copy-prod-url', '[data-action="copy-production-url"]', function(e) {
      e.preventDefault();
      var url = $(this).data('url') || '';
      if (!url) { toast('No production URL available', 'warning'); return; }
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function() { toast('Production URL copied', 'success'); });
        } else {
          var ta = document.createElement('textarea');
          ta.value = url; document.body.appendChild(ta); ta.select();
          document.execCommand('copy'); document.body.removeChild(ta);
          toast('Production URL copied', 'success');
        }
      } catch(ex) { toast('Copy failed: ' + ex.message, 'error'); }
    });

    // --- Mix & Match Engine ---
    $(document).off('click.cp2a-open-mixer').on('click.cp2a-open-mixer', '[data-action="open-mixer"]', function(e) {
      e.preventDefault();
      var mode = $(this).data('mode') || 'manual';
      openMixerModal(mode);
    });

    // --- Tag Input Component ---
    $(document).off('change.cp2a-add-tag').on('change.cp2a-add-tag', '[data-action="add-entity-tag"]', function() {
      var tagId = $(this).val();
      if (!tagId) return;
      var $container = $(this).closest('.cp-tag-input');
      var entityType = $container.data('entity-type');
      var entityId = $container.data('entity-id');
      if (!entityType || !entityId) return;
      var collections = {
        persona: S.data.personas, message: S.data.messages, style: S.data.styles,
        visual_format: S.data.visual_formats, recipe: S.data.recipes, campaign: S.data.campaigns
      };
      var coll = collections[entityType];
      if (!coll) return;
      var entity = coll.find(function(e) { return e.id === entityId; });
      if (!entity) return;
      entity.tags = entity.tags || [];
      if (entity.tags.indexOf(tagId) === -1) {
        entity.tags.push(tagId);
        entity.updated = new Date().toISOString();
        syncToTextarea(); buildMaps(); render();
      }
    });

    $(document).off('click.cp2a-rm-tag').on('click.cp2a-rm-tag', '[data-action="remove-entity-tag"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var tagId = $(this).data('tag-id');
      if (!tagId) return;
      var $container = $(this).closest('.cp-tag-input');
      var entityType = $container.data('entity-type');
      var entityId = $container.data('entity-id');
      if (!entityType || !entityId) return;
      var collections = {
        persona: S.data.personas, message: S.data.messages, style: S.data.styles,
        visual_format: S.data.visual_formats, recipe: S.data.recipes, campaign: S.data.campaigns
      };
      var coll = collections[entityType];
      if (!coll) return;
      var entity = coll.find(function(e) { return e.id === entityId; });
      if (!entity || !entity.tags) return;
      entity.tags = entity.tags.filter(function(tid) { return tid !== tagId; });
      entity.updated = new Date().toISOString();
      syncToTextarea(); buildMaps(); render();
    });

    // --- AI Action Bar expand/collapse ---
    $(document).off('click.cp2a-expand-ai').on('click.cp2a-expand-ai', '[data-action="expand-ai-action"]', function(e) {
      e.preventDefault();
      var panelId = $(this).data('panel-id');
      var $panel = $('#cpAIPanel_' + panelId);
      $('.cp-ai-action-expanded:visible').not($panel).slideUp(150);
      $panel.slideToggle(200);
    });
    $(document).off('click.cp2a-collapse-ai').on('click.cp2a-collapse-ai', '[data-action="collapse-ai-action"]', function(e) {
      e.preventDefault();
      var panelId = $(this).data('panel-id');
      $('#cpAIPanel_' + panelId).slideUp(150);
    });

    // --- Campaign Wizard ---
    $(document).off('click.cp2a-open-wizard').on('click.cp2a-open-wizard', '[data-action="open-campaign-wizard"]', function(e) {
      e.preventDefault(); openCampaignWizard();
    });
    $(document).off('click.cp2a-wizard-next').on('click.cp2a-wizard-next', '[data-action="wizard-next"]', function(e) {
      e.preventDefault();
      collectWizardFields();
      if (wizardState.step === 1 && (!wizardState.data.name || !wizardState.data.name.trim())) { toast('Campaign name is required', 'warning'); return; }
      if (wizardState.step < 4) { wizardState.step++; renderWizardModal(); }
    });
    $(document).off('click.cp2a-wizard-prev').on('click.cp2a-wizard-prev', '[data-action="wizard-prev"]', function(e) {
      e.preventDefault();
      collectWizardFields();
      if (wizardState.step > 1) { wizardState.step--; renderWizardModal(); }
    });
    $(document).off('click.cp2a-wizard-step').on('click.cp2a-wizard-step', '[data-action="wizard-go-step"]', function(e) {
      e.preventDefault();
      collectWizardFields();
      var targetStep = parseInt($(this).data('step'), 10);
      if (targetStep <= wizardState.step || targetStep === wizardState.step + 1) {
        wizardState.step = targetStep;
        renderWizardModal();
      }
    });
    $(document).off('change.cp2a-wizard-dim').on('change.cp2a-wizard-dim', '[data-action="wizard-toggle-dim"]', function() {
      var dim = $(this).data('dim');
      var id = $(this).data('id');
      var sel = wizardState.selections[dim];
      if (!sel) return;
      var idx = sel.indexOf(id);
      if (this.checked && idx === -1) sel.push(id);
      else if (!this.checked && idx > -1) sel.splice(idx, 1);
      collectWizardFields();
      renderWizardModal();
    });
    $(document).off('click.cp2a-wizard-recipe').on('click.cp2a-wizard-recipe', '[data-action="wizard-toggle-recipe"]', function(e) {
      e.preventDefault();
      var ridx = parseInt($(this).data('ridx'), 10);
      if (wizardState.recipes[ridx]) {
        wizardState.recipes[ridx].selected = !wizardState.recipes[ridx].selected;
        renderWizardModal();
      }
    });
    $(document).off('click.cp2a-wizard-selall').on('click.cp2a-wizard-selall', '[data-action="wizard-select-all"]', function(e) {
      e.preventDefault();
      wizardState.allSelected = !wizardState.allSelected;
      wizardState.recipes.forEach(function(r) { r.selected = wizardState.allSelected; });
      renderWizardModal();
    });
    $(document).off('click.cp2a-wizard-create').on('click.cp2a-wizard-create', '[data-action="wizard-create"]', function(e) {
      e.preventDefault(); executeWizardCreate();
    });
    // Add recipe to campaign (from detail view) — pre-link to campaign
    $(document).off('click.cp2a-add-recipe-camp').on('click.cp2a-add-recipe-camp', '[data-action="add-recipe-to-campaign"]', function(e) {
      e.preventDefault();
      var campId = $(this).data('campaign-id');
      if (!campId) return;
      S._pendingCampaignId = campId;
      openMixerModal('manual');
    });

    // Quick create recipe from campaign (uses first available dimension from each)
    $(document).off('click.cp2a-camp-quick').on('click.cp2a-camp-quick', '[data-action="camp-quick-recipe"]', function(e) {
      e.preventDefault();
      var campId = $(this).data('campaign-id');
      var camp = getCampaign(campId);
      if (!camp) return;
      snapshot('Quick recipe from campaign');
      var newRecipe = createEntity('recipe', {
        persona_id: (camp.persona_ids || [])[0] || '',
        message_id: (camp.message_ids || [])[0] || '',
        style_id: (camp.style_ids || [])[0] || '',
        visual_format_id: (camp.format_ids || [])[0] || '',
        campaign_id: campId
      });
      if (newRecipe) {
        S.selectedRecipeId = newRecipe.id;
        S.currentStep = 'composition';
        navigate('recipes');
        toast('Recipe created — edit its dimensions in the Composition step', 'success');
      }
    });

    // Move recipe to a different campaign
    $(document).off('click.cp2a-move-recipe-camp').on('click.cp2a-move-recipe-camp', '[data-action="move-recipe-campaign"]', function(e) {
      e.preventDefault();
      var recipeId = $(this).data('id');
      var recipe = getRecipe(recipeId);
      if (!recipe) return;
      var camps = getAllCampaigns();
      var html = '<div class="cp-editor-form">';
      html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-3)">Select a campaign to assign this recipe to:</p>';
      html += '<label style="display:flex;align-items:center;gap:var(--cp-space-2);padding:var(--cp-space-2) 0;border-bottom:1px solid var(--cp-border-light);cursor:pointer">';
      html += '<input type="radio" name="cp-move-camp" value="" ' + (!recipe.campaign_id ? 'checked' : '') + '>';
      html += '<span style="color:var(--cp-text-muted)">No campaign (unassigned)</span></label>';
      for (var ci = 0; ci < camps.length; ci++) {
        var c = camps[ci];
        html += '<label style="display:flex;align-items:center;gap:var(--cp-space-2);padding:var(--cp-space-2) 0;border-bottom:1px solid var(--cp-border-light);cursor:pointer">';
        html += '<input type="radio" name="cp-move-camp" value="' + esc(c.id) + '" ' + (recipe.campaign_id === c.id ? 'checked' : '') + '>';
        html += '<span>' + icon('bullhorn') + ' ' + esc(c.name) + '</span></label>';
      }
      html += '</div>';
      openModal('Move Recipe to Campaign', html, {
        titleIcon: 'arrow-right-arrow-left', size: 'md',
        saveLabel: 'Move',
        onSave: function() {
          var newCampId = $('input[name="cp-move-camp"]:checked').val() || '';
          snapshot('Move recipe to campaign');
          saveEntityField('recipe', recipeId, 'campaign_id', newCampId);
          closeModal();
          toast(newCampId ? 'Recipe moved to ' + (S.campaignMap[newCampId] ? S.campaignMap[newCampId].name : 'campaign') : 'Recipe unassigned from campaign', 'success');
        }
      });
    });

    // Create recipe from coverage matrix cell (persona × message pre-set)
    $(document).off('click.cp2a-camp-combo').on('click.cp2a-camp-combo', '[data-action="camp-create-combo"]', function(e) {
      e.preventDefault();
      var campId = $(this).data('campaign-id');
      var personaId = $(this).data('persona-id');
      var messageId = $(this).data('message-id');
      var camp = getCampaign(campId);
      if (!camp) return;
      snapshot('Recipe from coverage matrix');
      var newRecipe = createEntity('recipe', {
        persona_id: personaId || '',
        message_id: messageId || '',
        style_id: (camp.style_ids || [])[0] || '',
        visual_format_id: (camp.format_ids || [])[0] || '',
        campaign_id: campId
      });
      if (newRecipe) {
        S.selectedRecipeId = newRecipe.id;
        S.currentStep = 'composition';
        navigate('recipes');
        toast('Recipe created from coverage matrix', 'success');
      }
    });

    // Manage campaign phases
    $(document).off('click.cp2a-camp-phases').on('click.cp2a-camp-phases', '[data-action="manage-campaign-phases"]', function(e) {
      e.preventDefault();
      var campId = $(this).data('campaign-id');
      var camp = getCampaign(campId);
      if (!camp) return;
      openCampaignPhasesModal(campId);
    });

    // --- Recipe Templates ---
    $(document).off('click.cp2a-save-template').on('click.cp2a-save-template', '[data-action="save-recipe-template"]', function(e) {
      e.preventDefault();
      var recipeId = $(this).data('recipe-id');
      var recipe = getRecipe(recipeId);
      if (!recipe) return;
      var pName = S.personaMap[recipe.persona_id] ? S.personaMap[recipe.persona_id].name : '';
      var mName = S.messageMap[recipe.message_id] ? S.messageMap[recipe.message_id].title : '';
      var sName = S.styleMap[recipe.style_id] ? S.styleMap[recipe.style_id].name : '';
      var fName = S.formatMap[recipe.visual_format_id] ? S.formatMap[recipe.visual_format_id].name : '';
      var defaultName = [pName, mName, sName, fName].filter(Boolean).join(' × ') || 'Recipe Template';

      var html = '<div class="cp-editor-form">';
      html += '<div class="cp-form-group"><label>Template Name</label>';
      html += '<input type="text" class="cp-input" data-field="name" value="' + esc(defaultName) + '"></div>';
      html += '<p class="cp-text-muted">Saves the recipe\'s composition (persona, message, style, format, media type) as a reusable template.</p>';
      html += '</div>';

      openModal('Save Recipe Template', html, {
        titleIcon: 'bookmark', size: 'md', saveLabel: 'Save Template',
        onSave: function() {
          var name = collectModalFields().name || defaultName;
          S.meta.recipe_templates = S.meta.recipe_templates || [];
          S.meta.recipe_templates.push({
            id: 'tpl_' + Date.now(),
            name: name,
            persona_id: recipe.persona_id || '',
            message_id: recipe.message_id || '',
            style_id: recipe.style_id || '',
            visual_format_id: recipe.visual_format_id || '',
            media_type: recipe.media_type || 'image',
            created: new Date().toISOString()
          });
          syncToTextarea();
          closeModal();
          toast('Template "' + name + '" saved', 'success');
        }
      });
    });

    $(document).off('click.cp2a-apply-template').on('click.cp2a-apply-template', '[data-action="apply-recipe-template"]', function(e) {
      e.preventDefault();
      var recipeId = $(this).data('recipe-id');
      var recipe = getRecipe(recipeId);
      if (!recipe) return;
      var templates = (S.meta && S.meta.recipe_templates) || [];
      if (templates.length === 0) { toast('No templates saved yet', 'info'); return; }

      var html = '<div class="cp-editor-form">';
      html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-3)">Apply a template to set this recipe\'s dimensions:</p>';
      for (var ti = 0; ti < templates.length; ti++) {
        var t = templates[ti];
        html += '<label style="display:flex;align-items:center;gap:var(--cp-space-2);padding:var(--cp-space-2) 0;border-bottom:1px solid var(--cp-border-light);cursor:pointer">';
        html += '<input type="radio" name="cp-tpl" value="' + ti + '"' + (ti === 0 ? ' checked' : '') + '>';
        html += '<div style="flex:1"><strong>' + esc(t.name) + '</strong>';
        html += '<div style="font-size:11px;color:var(--cp-text-muted)">';
        var parts = [];
        if (t.persona_id && S.personaMap[t.persona_id]) parts.push(S.personaMap[t.persona_id].name);
        if (t.message_id && S.messageMap[t.message_id]) parts.push(S.messageMap[t.message_id].title);
        if (t.style_id && S.styleMap[t.style_id]) parts.push(S.styleMap[t.style_id].name);
        if (t.visual_format_id && S.formatMap[t.visual_format_id]) parts.push(S.formatMap[t.visual_format_id].name);
        html += parts.join(' × ') + ' · ' + (t.media_type || 'image');
        html += '</div></div>';
        html += '<button class="cp-btn-icon cp-btn-xs" data-action="delete-template" data-tidx="' + ti + '" title="Delete">' + icon('trash') + '</button>';
        html += '</label>';
      }
      html += '</div>';

      openModal('Apply Template', html, {
        titleIcon: 'file-import', size: 'md', saveLabel: 'Apply',
        onSave: function() {
          var idx = parseInt($('input[name="cp-tpl"]:checked').val(), 10);
          var t = templates[idx];
          if (!t) return;
          snapshot('Apply recipe template');
          if (t.persona_id) saveEntityField('recipe', recipeId, 'persona_id', t.persona_id);
          if (t.message_id) saveEntityField('recipe', recipeId, 'message_id', t.message_id);
          if (t.style_id) saveEntityField('recipe', recipeId, 'style_id', t.style_id);
          if (t.visual_format_id) saveEntityField('recipe', recipeId, 'visual_format_id', t.visual_format_id);
          if (t.media_type) saveEntityField('recipe', recipeId, 'media_type', t.media_type);
          closeModal();
          toast('Template applied', 'success');
        }
      });
    });

    // Delete template (from within apply modal)
    $(document).off('click.cp2a-del-tpl').on('click.cp2a-del-tpl', '[data-action="delete-template"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var idx = parseInt($(this).data('tidx'), 10);
      S.meta.recipe_templates = S.meta.recipe_templates || [];
      if (S.meta.recipe_templates[idx]) {
        S.meta.recipe_templates.splice(idx, 1);
        syncToTextarea();
        toast('Template deleted', 'success');
        closeModal();
      }
    });

    // --- Duplicate recipe ---
    $(document).off('click.cp2a-dup-recipe').on('click.cp2a-dup-recipe', '[data-action="duplicate-recipe"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id') || (getSelectedRecipe() ? getSelectedRecipe().id : '');
      if (id) {
        snapshot('Duplicate recipe');
        var clone = duplicateEntity('recipe', id);
        if (clone) { S.selectedRecipeId = clone.id; S.currentStep = 'composition'; }
      }
    });

    // --- Setup Wizard ---
    $(document).off('click.cp2a-sw-open').on('click.cp2a-sw-open', '[data-action="open-setup-wizard"]', function(e) {
      e.preventDefault();
      var forceReset = $(this).data('force-reset') === true || $(this).data('forceReset') === true;
      openSetupWizard(forceReset);
    });
    $(document).off('click.cp2a-sw-close').on('click.cp2a-sw-close', '[data-action="sw-close"]', function(e) {
      e.preventDefault();
      swSaveSession();
      openConfirmDialog(
        'Close Setup Wizard?',
        'Your progress has been saved. You can resume from where you left off.',
        function() { $('.cp-setup-wizard').remove(); }
      );
    });
    $(document).off('click.cp2a-sw-next').on('click.cp2a-sw-next', '[data-action="sw-next"]', function(e) {
      e.preventDefault(); swGoNext();
    });
    $(document).off('click.cp2a-sw-back').on('click.cp2a-sw-back', '[data-action="sw-back"]', function(e) {
      e.preventDefault(); swGoBack();
    });
    $(document).off('click.cp2a-sw-skip').on('click.cp2a-sw-skip', '[data-action="sw-skip"]', function(e) {
      e.preventDefault(); swSkipStep();
    });
    $(document).off('click.cp2a-sw-goto').on('click.cp2a-sw-goto', '[data-action="sw-goto-step"]', function(e) {
      e.preventDefault();
      var n = parseInt($(this).data('step'), 10);
      if (!isNaN(n)) swGotoStep(n);
    });
    $(document).off('click.cp2a-sw-card').on('click.cp2a-sw-card', '.cp-sw-sel-card', function(e) {
      // Ignore clicks that originate on the expand button
      if ($(e.target).closest('[data-action="sw-card-expand"]').length) return;
      e.preventDefault();
      var idx = parseInt($(this).data('idx'), 10);
      var step = setupWizardState.step;
      var listKey;
      if (step === 6) {
        // Step 6 hosts both styles and formats — distinguish by data-card-type
        listKey = $(this).data('card-type') === 'format' ? 'formats' : 'styles';
      } else {
        listKey = { 3: 'personas', 4: 'pain_points', 5: 'messages' }[step];
      }
      if (!listKey) return;
      var items = setupWizardState[listKey];
      if (!items || isNaN(idx) || !items[idx]) return;
      items[idx]._selected = !items[idx]._selected;
      refreshSetupWizard();
    });
    $(document).off('click.cp2a-sw-expand').on('click.cp2a-sw-expand', '[data-action="sw-card-expand"]', function(e) {
      e.preventDefault();
      var key = $(this).data('key');
      if (key) {
        setupWizardState._expandedCards[key] = !setupWizardState._expandedCards[key];
        refreshSetupWizard();
      }
    });
    $(document).off('click.cp2a-sw-gen-p').on('click.cp2a-sw-gen-p', '[data-action="sw-ai-gen-personas"]', function(e) {
      e.preventDefault();
      if (setupWizardState.aiLoading) return;
      setupWizardState._personaContext = $('#swPersonaContext').val() || '';
      var R = window._cpRenderers || {};
      if (typeof R.swAIGeneratePersonas === 'function') R.swAIGeneratePersonas();
      else toast('AI not ready — please wait for the page to fully load.', 'warning');
    });
    $(document).off('click.cp2a-sw-gen-pp').on('click.cp2a-sw-gen-pp', '[data-action="sw-ai-gen-painpoints"]', function(e) {
      e.preventDefault();
      if (setupWizardState.aiLoading) return;
      setupWizardState._ppContext = $('#swPainPointContext').val() || '';
      var R = window._cpRenderers || {};
      if (typeof R.swAIGeneratePainPoints === 'function') R.swAIGeneratePainPoints();
      else toast('AI not ready — please wait for the page to fully load.', 'warning');
    });
    $(document).off('click.cp2a-sw-pp-tab').on('click.cp2a-sw-pp-tab', '[data-action="sw-pp-tab"]', function(e) {
      e.preventDefault();
      var tab = parseInt($(this).data('tab'), 10);
      if (!isNaN(tab)) { setupWizardState._ppActiveTab = tab; refreshSetupWizard(); }
    });
    $(document).off('click.cp2a-sw-gen-msg').on('click.cp2a-sw-gen-msg', '[data-action="sw-ai-gen-messages"]', function(e) {
      e.preventDefault();
      if (setupWizardState.aiLoading) return;
      setupWizardState._messageContext = $('#swMessageContext').val() || '';
      var R = window._cpRenderers || {};
      if (typeof R.swAIGenerateMessages === 'function') R.swAIGenerateMessages();
      else toast('AI not ready — please wait for the page to fully load.', 'warning');
    });
    $(document).off('click.cp2a-sw-gen-sf').on('click.cp2a-sw-gen-sf', '[data-action="sw-ai-gen-styles-formats"]', function(e) {
      e.preventDefault();
      if (setupWizardState.aiLoading) return;
      setupWizardState._styleFormatContext = $('#swStyleFormatContext').val() || '';
      var R = window._cpRenderers || {};
      if (typeof R.swAIGenerateStylesFormats === 'function') R.swAIGenerateStylesFormats();
      else toast('AI not ready — please wait for the page to fully load.', 'warning');
    });
    $(document).off('click.cp2a-sw-combo-toggle').on('click.cp2a-sw-combo-toggle', '[data-action="sw-combo-toggle"]', function(e) {
      e.preventDefault();
      var idx = parseInt($(this).data('idx'), 10);
      var combos = setupWizardState.combos;
      if (!combos || isNaN(idx) || !combos[idx]) return;
      combos[idx].selected = !combos[idx].selected;
      refreshSetupWizard();
    });
    $(document).off('click.cp2a-sw-regen-combos').on('click.cp2a-sw-regen-combos', '[data-action="sw-regen-combos"]', function(e) {
      e.preventDefault();
      _swAutoGenerateCombos();
    });
    $(document).off('click.cp2a-sw-launch').on('click.cp2a-sw-launch', '[data-action="sw-launch"]', function(e) {
      e.preventDefault();
      if (typeof window._cpRenderers.finalizeSetupWizard === 'function') {
        window._cpRenderers.finalizeSetupWizard();
      }
    });
    $(document).off('click.cp2a-sw-test-ai').on('click.cp2a-sw-test-ai', '[data-action="sw-test-ai"]', function(e) {
      e.preventDefault(); _swTestAIConnection();
    });
    // Update wizard AI model dropdown when provider changes (Step 2)
    $(document).off('change.cp2a-sw-ai-prov').on('change.cp2a-sw-ai-prov', '.cp-sw-ai-picker-wrap .cp-ai-provider-select', function() {
      setupWizardState.aiConfig.tested = false; // reset test status on provider change
      var $prov = $(this);
      var pid = $prov.val();
      var $modelSel = $prov.closest('.cp-ai-picker').find('.cp-ai-model-select');
      if (!$modelSel.length) return;
      var p2b = window._cpPart2B;
      if (!p2b || !p2b.LLMService) return;
      var models = p2b.LLMService.getActiveModels(pid);
      var opts = '';
      for (var i = 0; i < models.length; i++) {
        opts += '<option value="' + esc(models[i].id) + '">' + esc(models[i].label || models[i].id) + '</option>';
      }
      $modelSel.html(opts);
      // Reset test status display
      $('#swAiTestStatus').html('<span class="cp-sw-test-idle">Not tested yet &mdash; you can still continue</span>');
    });

    // Escape key closes modal / wizard
    // Enter / Space activates selection cards and combo cards (accessibility)
    $(document).off('keydown.cp2a-sw-cards').on('keydown.cp2a-sw-cards', function(e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var $target = $(e.target);

      // Selection cards (personas / pain points / messages / styles / formats)
      if ($target.hasClass('cp-sw-sel-card')) {
        e.preventDefault();
        $target.trigger('click');
        return;
      }
      // Combo cards
      if ($target.hasClass('cp-sw-combo-card')) {
        e.preventDefault();
        $target.trigger('click');
        return;
      }
      // Clickable rail steps
      if ($target.hasClass('cp-sw-step-item--clickable')) {
        e.preventDefault();
        $target.trigger('click');
      }
    });

    // Tab focus trap — keep focus inside wizard overlay when it is open
    $(document).off('keydown.cp2a-sw-trap').on('keydown.cp2a-sw-trap', function(e) {
      if (e.key !== 'Tab') return;
      var $wiz = $('#cpSetupWizard');
      if (!$wiz.length) return;
      var focusable = $wiz.find(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), ' +
        'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ).filter(':visible');
      if (!focusable.length) return;
      var first = focusable.first()[0];
      var last  = focusable.last()[0];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    });

    $(document).off('keydown.cp2a-esc').on('keydown.cp2a-esc', function(e) {
      if (e.key === 'Escape') {
        if ($('.cp-confirm-backdrop').length) closeConfirmDialog();
        else if ($('.cp-modal-backdrop').length) closeModal();
        else if ($('.cp-setup-wizard').length && !setupWizardState.finalizing) {
          swSaveSession();
          openConfirmDialog(
            'Close Setup Wizard?',
            'Your progress has been saved. You can resume from the Setup page.',
            function() { $('.cp-setup-wizard').remove(); }
          );
        }
      }
    });

    // Undo/redo keyboard shortcuts
    $(document).off('keydown.cp2a-undo').on('keydown.cp2a-undo', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        if (!$(e.target).is('input, textarea, [contenteditable]')) { e.preventDefault(); undo(); }
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        if (!$(e.target).is('input, textarea, [contenteditable]')) { e.preventDefault(); redo(); }
      }
    });

    // --- Meta v2 actions (Campaign Workspace, Meta Campaigns list, modals) ---
    setupMetaV2EventHandlers();

    console.log('[CP] Part 2A event handlers ready');
  }

  function setupMetaV2EventHandlers() {
    // List view + workspace navigation
    $(document).off('click.cpv2-new-campaign').on('click.cpv2-new-campaign', '[data-action="new-campaign-v2"]', function(e) {
      e.preventDefault(); openMetaCampaignModal();
    });
    $(document).off('click.cpv2-open-campaign').on('click.cpv2-open-campaign', '[data-action="open-campaign-v2"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var id = $(this).data('id');
      if (id && window._cpNavigateToCampaignV2) window._cpNavigateToCampaignV2(id);
    });
    $(document).off('click.cpv2-edit-campaign').on('click.cpv2-edit-campaign', '[data-action="edit-campaign-v2"]', function(e) {
      e.preventDefault(); e.stopPropagation(); openMetaCampaignModal($(this).data('id'));
    });
    $(document).off('click.cpv2-delete-campaign').on('click.cpv2-delete-campaign', '[data-action="delete-campaign-v2"]', function(e) {
      e.preventDefault(); e.stopPropagation(); confirmDeleteMetaCampaign($(this).data('id'));
    });

    // Ad Set CRUD
    $(document).off('click.cpv2-add-adset').on('click.cpv2-add-adset', '[data-action="ws-add-ad-set"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var campId = $(this).data('campaign-id') || S.selectedCampaignV2Id;
      if (campId) openMetaAdSetModal(campId, { create: true });
    });
    $(document).off('click.cpv2-edit-adset').on('click.cpv2-edit-adset', '[data-action="edit-ad-set"]', function(e) {
      e.preventDefault(); e.stopPropagation(); openMetaAdSetModal($(this).data('id'));
    });
    $(document).off('click.cpv2-delete-adset').on('click.cpv2-delete-adset', '[data-action="delete-ad-set"]', function(e) {
      e.preventDefault(); e.stopPropagation(); confirmDeleteMetaAdSet($(this).data('id'));
    });

    // Ad CRUD
    $(document).off('click.cpv2-add-ad').on('click.cpv2-add-ad', '[data-action="ws-add-ad"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var setId = $(this).data('ad-set-id') || S.selectedAdSetId;
      if (setId) openMetaAdModal(setId, { create: true });
    });
    $(document).off('click.cpv2-edit-ad').on('click.cpv2-edit-ad', '[data-action="edit-ad"]', function(e) {
      e.preventDefault(); e.stopPropagation(); openMetaAdModal($(this).data('id'));
    });
    $(document).off('click.cpv2-delete-ad').on('click.cpv2-delete-ad', '[data-action="delete-ad"]', function(e) {
      e.preventDefault(); e.stopPropagation(); confirmDeleteMetaAd($(this).data('id'));
    });

    // Workspace tree selection
    $(document).off('click.cpv2-sel-camp').on('click.cpv2-sel-camp', '[data-action="ws-select-campaign"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id') || S.selectedCampaignV2Id;
      if (!id) return;
      S.selectedAdSetId = null; S.selectedAdId = null;
      navigate('campaign_workspace', { hash: 'campaign/' + id });
    });
    $(document).off('click.cpv2-sel-set').on('click.cpv2-sel-set', '[data-action="ws-select-ad-set"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      var set = id ? getAdSet(id) : null;
      if (!set) return;
      S.selectedAdSetId = id; S.selectedAdId = null;
      navigate('campaign_workspace', { hash: 'campaign/' + set.campaign_id + '/ad_set/' + id });
    });
    $(document).off('click.cpv2-sel-ad').on('click.cpv2-sel-ad', '[data-action="ws-select-ad"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      var ad = id ? getAd(id) : null;
      if (!ad) return;
      var set = getAdSet(ad.ad_set_id);
      S.selectedAdSetId = ad.ad_set_id; S.selectedAdId = id;
      navigate('campaign_workspace', { hash: 'campaign/' + (set ? set.campaign_id : '') + '/ad_set/' + ad.ad_set_id + '/ad/' + id });
    });

    // Tree branch collapse toggle
    $(document).off('click.cpv2-tree-toggle').on('click.cpv2-tree-toggle', '[data-action="ws-toggle-tree"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var id = $(this).data('id');
      if (!id) return;
      S.workspaceTreeCollapsed = S.workspaceTreeCollapsed || {};
      S.workspaceTreeCollapsed[id] = !S.workspaceTreeCollapsed[id];
      render();
    });

    // Meta Campaigns list filters
    $(document).off('input.cpv2-camp-search').on('input.cpv2-camp-search', '#cpCampaignV2Search', debounce(function() {
      S.campaignV2Filter = S.campaignV2Filter || {};
      S.campaignV2Filter.search = $(this).val() || '';
      render();
    }, 250));
    $(document).off('change.cpv2-camp-status').on('change.cpv2-camp-status', '#cpCampaignV2StatusFilter', function() {
      S.campaignV2Filter = S.campaignV2Filter || {};
      S.campaignV2Filter.status = $(this).val();
      render();
    });
    $(document).off('change.cpv2-camp-obj').on('change.cpv2-camp-obj', '#cpCampaignV2ObjectiveFilter', function() {
      S.campaignV2Filter = S.campaignV2Filter || {};
      S.campaignV2Filter.objective = $(this).val();
      render();
    });

    // Modal: chip toggles for Special Ad Categories + placements
    $(document).off('change.cpv2-chip').on('change.cpv2-chip', '.cp-modal-body .cp-chip input[type="checkbox"]', function() {
      var $label = $(this).closest('.cp-chip');
      $label.toggleClass('cp-chip-active', this.checked);
      // Special-case: if "NONE" is being toggled on, clear other categories
      if (this.checked && $(this).hasClass('cp-v2-special-cat') && $(this).data('key') === 'NONE') {
        $('.cp-v2-special-cat').not(this).each(function() {
          this.checked = false; $(this).closest('.cp-chip').removeClass('cp-chip-active');
        });
      }
      // If toggling a non-NONE category on, deselect NONE
      else if (this.checked && $(this).hasClass('cp-v2-special-cat') && $(this).data('key') !== 'NONE') {
        var $none = $('.cp-v2-special-cat[data-key="NONE"]');
        if ($none.is(':checked')) { $none.prop('checked', false); $none.closest('.cp-chip').removeClass('cp-chip-active'); }
      }
    });
    // Ad Set: Advantage Placements toggle hides/shows custom-placements section
    $(document).off('change.cpv2-adv-pl').on('change.cpv2-adv-pl', '.cp-v2-placements-advantage', function() {
      $('.cp-v2-custom-placements').toggle(!this.checked);
    });

    // (Stage 4: AI buttons are now handled in Part 2B — no Part 2A stubs needed.)

    // --- Stage 5: A/B testing ---
    $(document).off('click.cpv2-ab-config').on('click.cpv2-ab-config', '[data-action="ws-ab-config"]', function(e) {
      e.preventDefault(); openABTestConfigModal($(this).data('id'));
    });
    $(document).off('click.cpv2-ab-compare').on('click.cpv2-ab-compare', '[data-action="ws-ab-compare"]', function(e) {
      e.preventDefault(); openCompareVariantsModal($(this).data('id'));
    });
    $(document).off('click.cpv2-ab-mark').on('click.cpv2-ab-mark', '[data-action="ws-mark-ab-winner"]', function(e) {
      e.preventDefault(); setABWinner($(this).data('campaign-id'), $(this).data('set-id'), true);
    });
    $(document).off('click.cpv2-ab-clear').on('click.cpv2-ab-clear', '[data-action="ws-clear-ab-winner"]', function(e) {
      e.preventDefault(); setABWinner($(this).data('campaign-id'), $(this).data('set-id'), false);
    });

    // Stage 2: inspector tab switching
    $(document).off('click.cpv2-set-tab').on('click.cpv2-set-tab', '[data-action="set-inspector-tab"]', function(e) {
      e.preventDefault();
      S.workspaceInspectorTab = $(this).data('tab') || 'overview';
      render();
    });

    // Inline field save (blur for text/textarea; change for select/date)
    $(document).off('blur.cpv2-inline change.cpv2-inline').on('blur.cpv2-inline change.cpv2-inline', '.cp-v2-inline-field', function() {
      var $f = $(this);
      var entityType = $f.data('entity-type');
      var entityId = $f.data('entity-id');
      var field = $f.data('field');
      if (!entityType || !entityId || !field) return;
      var value = $f.val();
      if ($f.attr('type') === 'number') value = (value === '' ? null : Number(value));
      saveEntityField(entityType, entityId, field, value);
      // Auto-status for ads
      if (entityType === 'ad') {
        var ad = getAd(entityId);
        if (ad && typeof maybeAdvanceAdStatus === 'function') maybeAdvanceAdStatus(ad, 'edit');
      }
    });

    // Brief chip toggles (Ad Set message_ids / style_ids / format_ids)
    $(document).off('change.cpv2-brief-id').on('change.cpv2-brief-id', '.cp-v2-brief-id', function() {
      var $f = $(this);
      var field = $f.data('field');               // e.g. 'brief.message_ids'
      var entityId = $f.data('entity-id');
      var itemId = $f.data('id');
      var adSet = getAdSet(entityId);
      if (!adSet || !field) return;
      adSet.brief = adSet.brief || {};
      // Get the array via nested path
      var pathParts = field.split('.');
      var arr = adSet[pathParts[0]][pathParts[1]] || [];
      var idx = arr.indexOf(itemId);
      if (this.checked && idx === -1) arr.push(itemId);
      if (!this.checked && idx > -1)  arr.splice(idx, 1);
      saveEntityField('ad_set', entityId, field, arr);
      // Toggle visual state
      $(this).closest('.cp-chip').toggleClass('cp-chip-active', this.checked);
    });

    // Hook angles add/remove + edit (blur on the input)
    $(document).off('click.cpv2-add-angle').on('click.cpv2-add-angle', '[data-action="ws-add-hook-angle"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      var adSet = getAdSet(id);
      if (!adSet) return;
      adSet.brief = adSet.brief || {};
      adSet.brief.hook_angles = (adSet.brief.hook_angles || []).concat(['']);
      snapshot('Add hook angle');
      saveEntityField('ad_set', id, 'brief.hook_angles', adSet.brief.hook_angles);
    });
    $(document).off('click.cpv2-rm-angle').on('click.cpv2-rm-angle', '[data-action="ws-remove-hook-angle"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id'); var idx = $(this).data('index');
      var adSet = getAdSet(id);
      if (!adSet || !adSet.brief) return;
      adSet.brief.hook_angles = (adSet.brief.hook_angles || []).filter(function(_, i) { return i !== idx; });
      snapshot('Remove hook angle');
      saveEntityField('ad_set', id, 'brief.hook_angles', adSet.brief.hook_angles);
    });
    $(document).off('blur.cpv2-edit-angle').on('blur.cpv2-edit-angle', '.cp-v2-hook-angle', function() {
      var $f = $(this);
      var id = $f.data('entity-id'); var idx = $f.data('index');
      var adSet = getAdSet(id);
      if (!adSet || !adSet.brief) return;
      var angles = adSet.brief.hook_angles || [];
      if (angles[idx] === $f.val()) return;
      angles[idx] = $f.val();
      saveEntityField('ad_set', id, 'brief.hook_angles', angles);
    });

    // Pull a hook from a library message into an Ad (also captures snapshot)
    $(document).off('click.cpv2-pull-hook').on('click.cpv2-pull-hook', '[data-action="ws-pull-hook"]', function(e) {
      e.preventDefault();
      var adId = $(this).data('ad-id');
      var msgId = $(this).data('message-id');
      var hookId = $(this).data('hook-id');
      var ad = getAd(adId);
      var msg = getMessage(msgId);
      if (!ad || !msg) return;
      var hook = (msg.hooks || []).find(function(h) { return h.id === hookId; });
      if (!hook) return;
      snapshot('Pull hook from message');
      ad.hook = ad.hook || {};
      ad.hook.text = hook.text;
      ad.hook.type = hook.type || 'direct';
      ad.hook.source_message_id = msg.id;
      ad.hook.selected_hook_id = hook.id;
      // Capture message snapshot
      ad.message_snapshot = {
        captured_at: new Date().toISOString(),
        source_id: msg.id,
        source_updated: msg.updated || msg.created || '',
        title: msg.title || '',
        body: msg.body || '',
        funnel_stages: (msg.funnel_stages || []).slice(),
        hook_snapshot: { id: hook.id, text: hook.text, type: hook.type || 'direct' }
      };
      ad.updated = new Date().toISOString();
      if (typeof maybeAdvanceAdStatus === 'function') maybeAdvanceAdStatus(ad, 'hook pulled');
      buildMaps(); syncToTextarea(); render();
      toast('Hook pulled from "' + msg.title + '"', 'success');
    });

    // Re-sync persona snapshot (stage 3 surfaces the button)
    $(document).off('click.cpv2-resync-persona').on('click.cpv2-resync-persona', '[data-action="resync-persona-snapshot"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      var adSet = getAdSet(id);
      if (!adSet || !adSet.persona_id) return;
      var persona = getPersona(adSet.persona_id);
      if (!persona) return;
      snapshot('Re-sync persona snapshot');
      adSet.persona_snapshot = buildPersonaSnapshot(persona);
      adSet.updated = new Date().toISOString();
      logActivity('snapshot_resynced', 'ad_set', adSet.id, adSet.name, 'Re-synced persona snapshot from library');
      buildMaps(); syncToTextarea(); render();
      toast('Persona snapshot re-synced', 'success');
    });

    // Ad creative-type switch (media tab segmented control)
    $(document).off('change.cpv2-mediatype').on('change.cpv2-mediatype', '.cp-v2-media-type-switch', function() {
      var id = $(this).data('entity-id');
      var val = $(this).val();
      saveEntityField('ad', id, 'creative_type', val);
    });

    // Ad set pipeline status setter (Review tab)
    $(document).off('click.cpv2-set-ad-status').on('click.cpv2-set-ad-status', '[data-action="ws-set-ad-status"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      var status = $(this).data('status');
      saveEntityField('ad', id, 'pipeline_status', status);
    });

    // Video scene rows
    $(document).off('click.cpv2-add-scene').on('click.cpv2-add-scene', '[data-action="ws-ad-add-scene"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      var ad = getAd(id); if (!ad) return;
      ad.media = ad.media || {};
      ad.media.video = ad.media.video || { blueprint: { scenes: [] }, script: { rows: [] } };
      ad.media.video.blueprint = ad.media.video.blueprint || { scenes: [] };
      ad.media.video.blueprint.scenes.push({ name: '', description: '', timestamp: '', duration: 5 });
      snapshot('Add scene');
      saveEntityField('ad', id, 'media.video.blueprint.scenes', ad.media.video.blueprint.scenes);
    });
    $(document).off('click.cpv2-rm-scene').on('click.cpv2-rm-scene', '[data-action="ws-ad-remove-scene"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id'); var idx = $(this).data('index');
      var ad = getAd(id); if (!ad || !ad.media || !ad.media.video) return;
      var arr = (ad.media.video.blueprint && ad.media.video.blueprint.scenes) || [];
      arr.splice(idx, 1);
      snapshot('Remove scene');
      saveEntityField('ad', id, 'media.video.blueprint.scenes', arr);
    });
    $(document).off('blur.cpv2-scene-field').on('blur.cpv2-scene-field', '.cp-v2-scene-field', function() {
      var $f = $(this);
      var id = $f.data('entity-id'); var idx = $f.data('index'); var key = $f.data('key');
      var ad = getAd(id); if (!ad || !ad.media || !ad.media.video) return;
      var arr = (ad.media.video.blueprint && ad.media.video.blueprint.scenes) || [];
      if (!arr[idx]) return;
      if (arr[idx][key] === $f.val()) return;
      arr[idx][key] = $f.val();
      saveEntityField('ad', id, 'media.video.blueprint.scenes', arr);
    });

    // Video script rows
    $(document).off('click.cpv2-add-row').on('click.cpv2-add-row', '[data-action="ws-ad-add-script-row"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      var ad = getAd(id); if (!ad) return;
      ad.media = ad.media || {};
      ad.media.video = ad.media.video || { blueprint: { scenes: [] }, script: { rows: [] } };
      ad.media.video.script = ad.media.video.script || { rows: [] };
      ad.media.video.script.rows.push({ time: '', dialogue: '', visual: '', camera: '', audio: '' });
      snapshot('Add script row');
      saveEntityField('ad', id, 'media.video.script.rows', ad.media.video.script.rows);
    });
    $(document).off('click.cpv2-rm-row').on('click.cpv2-rm-row', '[data-action="ws-ad-remove-script-row"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id'); var idx = $(this).data('index');
      var ad = getAd(id); if (!ad || !ad.media || !ad.media.video) return;
      var arr = (ad.media.video.script && ad.media.video.script.rows) || [];
      arr.splice(idx, 1);
      snapshot('Remove script row');
      saveEntityField('ad', id, 'media.video.script.rows', arr);
    });
    $(document).off('blur.cpv2-script-field').on('blur.cpv2-script-field', '.cp-v2-script-field', function() {
      var $f = $(this);
      var id = $f.data('entity-id'); var idx = $f.data('index'); var key = $f.data('key');
      var ad = getAd(id); if (!ad || !ad.media || !ad.media.video) return;
      var arr = (ad.media.video.script && ad.media.video.script.rows) || [];
      if (!arr[idx]) return;
      if (arr[idx][key] === $f.val()) return;
      arr[idx][key] = $f.val();
      saveEntityField('ad', id, 'media.video.script.rows', arr);
    });

    // --- Stage 3: Library ↔ Workspace integration ---

    // Open an Ad Set in the workspace (from a library usage row)
    $(document).off('click.cpv2-lib-open-set').on('click.cpv2-lib-open-set', '[data-action="lib-open-ad-set"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      var campaignId = $(this).data('campaign-id');
      if (!id || !campaignId) return;
      window._cpNavigateToCampaignV2(campaignId, id);
    });
    // Open an Ad in the workspace
    $(document).off('click.cpv2-lib-open-ad').on('click.cpv2-lib-open-ad', '[data-action="lib-open-ad"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      var ad = id ? getAd(id) : null;
      if (!ad) return;
      var set = getAdSet(ad.ad_set_id);
      if (!set) return;
      window._cpNavigateToCampaignV2(set.campaign_id, set.id, ad.id);
    });

    // Create Ad Set from a library Persona. Opens a chooser if multiple
    // campaigns exist; otherwise opens the modal pre-populated.
    $(document).off('click.cpv2-lib-create-set').on('click.cpv2-lib-create-set', '[data-action="lib-create-ad-set-from-persona"]', function(e) {
      e.preventDefault();
      var personaId = $(this).data('id');
      var camps = getAllCampaignsV2();
      if (camps.length === 0) {
        // No campaigns yet — prompt to create one first
        toast('Create a Campaign first, then add Ad Sets to it', 'info');
        navigate('meta_campaigns');
        return;
      }
      if (camps.length === 1) {
        // Single campaign: open Ad Set modal under it, pre-pop persona
        openMetaAdSetModalWithPersona(camps[0].id, personaId);
        return;
      }
      // Multiple campaigns: show a quick picker
      openCampaignPickerForAdSet(personaId);
    });

    // Attach a library Message / Style / Format to an Ad Set's brief.
    // Opens a picker showing all Ad Sets across all campaigns.
    $(document).off('click.cpv2-lib-attach').on('click.cpv2-lib-attach', '[data-action="lib-attach-to-ad-set-brief"]', function(e) {
      e.preventDefault();
      var type = $(this).data('type');  // 'message' | 'style' | 'visual_format'
      var id = $(this).data('id');
      openAdSetBriefAttachPicker(type, id);
    });

    // Carousel cards
    $(document).off('click.cpv2-add-card').on('click.cpv2-add-card', '[data-action="ws-ad-add-card"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      var ad = getAd(id); if (!ad) return;
      ad.media = ad.media || {};
      ad.media.carousel_cards = ad.media.carousel_cards || [];
      ad.media.carousel_cards.push({ image_asset_id: '', headline: '', description: '', link: '' });
      snapshot('Add carousel card');
      saveEntityField('ad', id, 'media.carousel_cards', ad.media.carousel_cards);
    });
    $(document).off('click.cpv2-rm-card').on('click.cpv2-rm-card', '[data-action="ws-ad-remove-card"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id'); var idx = $(this).data('index');
      var ad = getAd(id); if (!ad) return;
      var arr = ad.media.carousel_cards || [];
      arr.splice(idx, 1);
      snapshot('Remove carousel card');
      saveEntityField('ad', id, 'media.carousel_cards', arr);
    });
    $(document).off('blur.cpv2-card-field').on('blur.cpv2-card-field', '.cp-v2-card-field', function() {
      var $f = $(this);
      var id = $f.data('entity-id'); var idx = $f.data('index'); var key = $f.data('key');
      var ad = getAd(id); if (!ad || !ad.media) return;
      var arr = ad.media.carousel_cards || [];
      if (!arr[idx]) return;
      if (arr[idx][key] === $f.val()) return;
      arr[idx][key] = $f.val();
      saveEntityField('ad', id, 'media.carousel_cards', arr);
    });
  }

