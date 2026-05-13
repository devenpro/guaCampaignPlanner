  // ============================================================
  // SECTION 19: EVENT HANDLERS
  // ============================================================

  // Wraps a block of handler registrations so an error in one block
  // doesn't suppress the rest. Use for each logical "island" of handlers.
  function _safeHandlerBlock(label, fn) {
    try { fn(); }
    catch (e) {
      console.error('[CP] Handler block "' + label + '" failed:', e);
      if (typeof toast === 'function') toast('Some controls in "' + label + '" may not work — see console.', 'warning', 5000);
    }
  }

  function setupPart2AEvents() {
    console.log('[CP] Setting up Part 2A event handlers...');

    _safeHandlerBlock('Part 2A: core', function() {
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
        visual_format: S.data.visual_formats, pain_point: S.data.pain_points,
        campaign_v2: S.data.campaigns_v2, ad_set: S.data.ad_sets, ad: S.data.ads
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
        visual_format: S.data.visual_formats, pain_point: S.data.pain_points,
        campaign_v2: S.data.campaigns_v2, ad_set: S.data.ad_sets, ad: S.data.ads
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
    $(document).off('click.cp2a-sw-gen-ideas').on('click.cp2a-sw-gen-ideas', '[data-action="sw-ai-gen-campaign-ideas"]', function(e) {
      e.preventDefault();
      if (setupWizardState.aiLoading) return;
      setupWizardState._campaignIdeasContext = $('#swCampaignIdeasContext').val() || '';
      swCollectFields();
      setupWizardState.stepGenerated[7] = false;
      var R = window._cpRenderers || {};
      if (typeof R.swAIGenerateCampaignIdeas === 'function') R.swAIGenerateCampaignIdeas();
      else toast('AI not ready — please wait for the page to fully load.', 'warning');
    });
    $(document).off('click.cp2a-sw-ai-cancel').on('click.cp2a-sw-ai-cancel', '[data-action="sw-ai-cancel"]', function(e) {
      e.preventDefault();
      swCancelAIGeneration();
    });
    $(document).off('click.cp2a-sw-ai-error-dismiss').on('click.cp2a-sw-ai-error-dismiss', '[data-action="sw-ai-error-dismiss"]', function(e) {
      e.preventDefault();
      setupWizardState.aiError = '';
      refreshSetupWizard();
    });
    $(document).off('click.cp2a-sw-ai-retry').on('click.cp2a-sw-ai-retry', '[data-action="sw-ai-retry-step"]', function(e) {
      e.preventDefault();
      var n = parseInt($(this).data('step'), 10);
      if (!isNaN(n)) swRetryStep(n);
    });
    // --- Step 7 campaign-idea handlers ---
    $(document).off('click.cp2a-sw-tree-expand').on('click.cp2a-sw-tree-expand', '[data-action="sw-tree-expand"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var key = $(this).data('key');
      if (!key) return;
      setupWizardState._expandedCards[key] = !setupWizardState._expandedCards[key];
      refreshSetupWizard();
    });
    $(document).off('click.cp2a-sw-idea-toggle').on('click.cp2a-sw-idea-toggle', '[data-action="sw-idea-toggle"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var i = parseInt($(this).data('idea-idx'), 10);
      var ideas = setupWizardState.campaign_ideas || [];
      if (isNaN(i) || !ideas[i]) return;
      ideas[i]._selected = !ideas[i]._selected;
      refreshSetupWizard();
    });
    $(document).off('click.cp2a-sw-idea-delete').on('click.cp2a-sw-idea-delete', '[data-action="sw-idea-delete"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var i = parseInt($(this).data('idea-idx'), 10);
      var ideas = setupWizardState.campaign_ideas || [];
      if (isNaN(i) || !ideas[i]) return;
      ideas.splice(i, 1);
      refreshSetupWizard();
    });
    $(document).off('click.cp2a-sw-idea-add').on('click.cp2a-sw-idea-add', '[data-action="sw-idea-add-manual"]', function(e) {
      e.preventDefault();
      setupWizardState.campaign_ideas = setupWizardState.campaign_ideas || [];
      var n = setupWizardState.campaign_ideas.length + 1;
      setupWizardState.campaign_ideas.push({
        name: 'Campaign ' + n,
        objective: 'OUTCOME_LEADS',
        brief: '',
        persona_idx: -1,
        message_idx_list: [],
        _selected: true
      });
      setupWizardState._expandedCards['idea_' + (setupWizardState.campaign_ideas.length - 1)] = true;
      refreshSetupWizard();
    });
    $(document).off('change.cp2a-sw-idea-field input.cp2a-sw-idea-field').on('change.cp2a-sw-idea-field input.cp2a-sw-idea-field', '[data-sw-idea-field]', function() {
      var i = parseInt($(this).data('idea-idx'), 10);
      var field = $(this).data('sw-idea-field');
      var ideas = setupWizardState.campaign_ideas || [];
      if (isNaN(i) || !ideas[i] || !field) return;
      var val = $(this).val();
      if (field === 'persona_idx') val = parseInt(val, 10);
      ideas[i][field] = val;
    });
    $(document).off('click.cp2a-sw-idea-msg').on('click.cp2a-sw-idea-msg', '[data-action="sw-idea-toggle-message"]', function(e) {
      e.preventDefault();
      var i = parseInt($(this).data('idea-idx'), 10);
      var mi = parseInt($(this).data('msg-idx'), 10);
      var ideas = setupWizardState.campaign_ideas || [];
      if (isNaN(i) || isNaN(mi) || !ideas[i]) return;
      ideas[i].message_idx_list = ideas[i].message_idx_list || [];
      var pos = ideas[i].message_idx_list.indexOf(mi);
      if (pos === -1) ideas[i].message_idx_list.push(mi);
      else ideas[i].message_idx_list.splice(pos, 1);
      refreshSetupWizard();
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
    });  // _safeHandlerBlock('Part 2A: core')

    // --- Meta v2 actions (Campaign Workspace, Meta Campaigns list, modals) ---
    _safeHandlerBlock('Part 2A: Meta v2', function() { setupMetaV2EventHandlers(); });

    console.log('[CP] Part 2A event handlers ready');
  }

  function setupMetaV2EventHandlers() {
    // List view + workspace navigation
    $(document).off('click.cpv2-new-campaign').on('click.cpv2-new-campaign', '[data-action="new-campaign-v2"]', function(e) {
      e.preventDefault();
      // Open the multi-step New Campaign Wizard instead of the legacy modal
      if (typeof openNewCampaignWizard === 'function') openNewCampaignWizard();
      else openMetaCampaignModal();
    });

    // --- New Campaign Wizard event wiring ---
    $(document).off('click.ncw-next').on('click.ncw-next', '[data-action="ncw-next"]', function(e) { e.preventDefault(); ncwGoNext(); });
    $(document).off('click.ncw-back').on('click.ncw-back', '[data-action="ncw-back"]', function(e) { e.preventDefault(); ncwGoBack(); });
    $(document).off('click.ncw-goto').on('click.ncw-goto', '[data-action="ncw-goto"]', function(e) {
      e.preventDefault();
      var n = parseInt($(this).data('step'), 10);
      if (!isNaN(n)) ncwGotoStep(n);
    });
    $(document).off('click.ncw-close').on('click.ncw-close', '[data-action="ncw-close"]', function(e) { e.preventDefault(); ncwClose(); });
    $(document).off('click.ncw-launch').on('click.ncw-launch', '[data-action="ncw-launch"]', function(e) { e.preventDefault(); ncwLaunch(); });
    $(document).off('click.ncw-error-dismiss').on('click.ncw-error-dismiss', '[data-action="ncw-error-dismiss"]', function(e) {
      e.preventDefault(); ncwState.aiError = ''; refreshNCW();
    });
    $(document).off('click.ncw-ai-cancel').on('click.ncw-ai-cancel', '[data-action="ncw-ai-cancel"]', function(e) {
      e.preventDefault();
      var p2b = window._cpPart2B;
      if (p2b && p2b.LLMService && typeof p2b.LLMService.abortAction === 'function') p2b.LLMService.abortAction(ncwState.aiActionId || 'ncw-ai');
      ncwState.aiLoading = false; ncwState.aiActionId = ''; ncwState.aiError = 'Generation cancelled.';
      refreshNCW();
    });
    $(document).off('click.ncw-suggest-sets').on('click.ncw-suggest-sets', '[data-action="ncw-ai-suggest-sets"]', function(e) {
      e.preventDefault();
      var R = window._cpRenderers || {};
      if (typeof R.ncwAISuggestAdSets === 'function') R.ncwAISuggestAdSets();
    });
    $(document).off('click.ncw-suggest-ads').on('click.ncw-suggest-ads', '[data-action="ncw-ai-suggest-ads"]', function(e) {
      e.preventDefault();
      var i = parseInt($(this).data('set-idx'), 10);
      var R = window._cpRenderers || {};
      if (typeof R.ncwAISuggestAds === 'function' && !isNaN(i)) R.ncwAISuggestAds(i);
    });
    $(document).off('click.ncw-add-set').on('click.ncw-add-set', '[data-action="ncw-add-ad-set"]', function(e) { e.preventDefault(); ncwAddAdSetManual(); });
    $(document).off('click.ncw-add-ad').on('click.ncw-add-ad', '[data-action="ncw-add-ad"]', function(e) {
      e.preventDefault();
      var i = parseInt($(this).data('set-idx'), 10);
      if (!isNaN(i)) ncwAddAdManual(i);
    });
    $(document).off('click.ncw-set-toggle').on('click.ncw-set-toggle', '[data-action="ncw-set-toggle"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var i = parseInt($(this).data('set-idx'), 10);
      var s = (ncwState.ad_sets || [])[i]; if (!s) return;
      s._selected = !s._selected;
      refreshNCW();
    });
    $(document).off('click.ncw-set-delete').on('click.ncw-set-delete', '[data-action="ncw-set-delete"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var i = parseInt($(this).data('set-idx'), 10);
      if (!isNaN(i) && ncwState.ad_sets) {
        ncwState.ad_sets.splice(i, 1);
        refreshNCW();
      }
    });
    $(document).off('click.ncw-ad-toggle').on('click.ncw-ad-toggle', '[data-action="ncw-ad-toggle"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var i = parseInt($(this).data('set-idx'), 10);
      var j = parseInt($(this).data('ad-idx'), 10);
      var s = (ncwState.ad_sets || [])[i]; if (!s || !s.ads || !s.ads[j]) return;
      s.ads[j]._selected = !s.ads[j]._selected;
      refreshNCW();
    });
    $(document).off('click.ncw-ad-delete').on('click.ncw-ad-delete', '[data-action="ncw-ad-delete"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var i = parseInt($(this).data('set-idx'), 10);
      var j = parseInt($(this).data('ad-idx'), 10);
      var s = (ncwState.ad_sets || [])[i]; if (!s || !s.ads) return;
      s.ads.splice(j, 1);
      refreshNCW();
    });
    $(document).off('click.ncw-tab').on('click.ncw-tab', '[data-action="ncw-tab"]', function(e) {
      e.preventDefault();
      var t = parseInt($(this).data('tab'), 10);
      if (!isNaN(t)) { ncwState._activeAdSetTab = t; refreshNCW(); }
    });
    $(document).off('change.ncw-set-field').on('change.ncw-set-field', '[data-ncw-set-field]', function() {
      var i = parseInt($(this).data('set-idx'), 10);
      var field = $(this).data('ncw-set-field');
      var s = (ncwState.ad_sets || [])[i]; if (!s || !field) return;
      s[field] = $(this).val();
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
    // "Edit ad" — open the Ad inline in the workspace inspector instead of
    // a modal. The inspector tabs (Hook / Copy / Media / Review) are all
    // inline-editable; the Overview tab is read-only summary.
    $(document).off('click.cpv2-edit-ad').on('click.cpv2-edit-ad', '[data-action="edit-ad"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var adId = $(this).data('id');
      var ad = adId ? getAd(adId) : null;
      var setId = ad ? ad.ad_set_id : null;
      var set = setId ? getAdSet(setId) : null;
      if (ad && set && typeof window._cpNavigateToCampaignV2 === 'function') {
        S.workspaceInspectorTab = 'hook';
        window._cpNavigateToCampaignV2(set.campaign_id, set.id, ad.id);
      } else {
        // Fallback only if navigation context is missing
        if (adId) openMetaAdModal(adId);
      }
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

    // AI hook ideas — pick / discard / clear / expand. Lives on
    // `ad.hook.ai_ideas` and is populated by `aiGenerateAdHooks`. Active
    // selection tracked by `ad.hook.active_idea_id`.
    //
    // saveEntityField('ad', id, 'hook', ad.hook) used to short-circuit here
    // because `ad === entity` so the same object reference is passed as
    // value — saveEntityField's identity check (`entity[field] === value`)
    // returned early and never re-rendered, leaving the hook text textarea
    // stale. Mutate directly and call the same buildMaps/sync/render trio
    // that aiGenerateAdHooks uses for its own writes.
    $(document).off('click.cpv2-use-hook-idea').on('click.cpv2-use-hook-idea', '[data-action="ws-use-ad-hook-idea"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      var idx = parseInt($(this).data('idx'), 10);
      var ad = getAd(id); if (!ad || !ad.hook) return;
      var ideas = ad.hook.ai_ideas || [];
      var idea = ideas[idx]; if (!idea) return;
      snapshot('Use AI hook idea');
      ad.hook.text = idea.text;
      ad.hook.type = idea.type || 'direct';
      ad.hook.active_idea_id = idea.id;
      ad.hook.source_message_id = '';
      ad.hook.selected_hook_id = '';
      ad.updated = new Date().toISOString();
      buildMaps(); syncToTextarea(); render();
      if (typeof maybeAdvanceAdStatus === 'function') maybeAdvanceAdStatus(ad, 'AI hook idea');
      logActivity('hook_selected', 'ad', id, ad.name, 'Applied AI hook idea (' + (idea.type || 'direct') + ')');
      toast('Hook applied', 'success');
    });

    $(document).off('click.cpv2-rm-hook-idea').on('click.cpv2-rm-hook-idea', '[data-action="ws-remove-ad-hook-idea"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      var idx = parseInt($(this).data('idx'), 10);
      var ad = getAd(id); if (!ad || !ad.hook) return;
      var ideas = ad.hook.ai_ideas || [];
      var removed = ideas[idx]; if (!removed) return;
      ideas.splice(idx, 1);
      if (ad.hook.active_idea_id === removed.id) ad.hook.active_idea_id = '';
      ad.updated = new Date().toISOString();
      snapshot('Discard hook idea');
      buildMaps(); syncToTextarea(); render();
    });

    $(document).off('click.cpv2-clear-hook-ideas').on('click.cpv2-clear-hook-ideas', '[data-action="ws-clear-ad-hook-ideas"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      var ad = getAd(id); if (!ad || !ad.hook) return;
      if (!(ad.hook.ai_ideas && ad.hook.ai_ideas.length)) return;
      snapshot('Clear hook ideas');
      ad.hook.ai_ideas = [];
      ad.hook.active_idea_id = '';
      ad.updated = new Date().toISOString();
      buildMaps(); syncToTextarea(); render();
    });


    // Expand a collapsed hook idea card without re-rendering — same pattern
    // as the status dropdown toggle, so adjacent inline fields keep focus.
    $(document).off('click.cpv2-toggle-hook-idea').on('click.cpv2-toggle-hook-idea', '[data-action="ws-toggle-hook-idea-expanded"]', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var ideaId = $(this).data('idea-id');
      var $card = $(this).closest('.cp-hook-idea-card[data-idea-id="' + ideaId + '"]');
      if (!$card.length) return;
      $card.removeClass('cp-hook-idea-card-collapsed');
    });

    // AI copy variants — pick / discard. Stored on
    // `ad.creative.ai_copy_variants`; populated by `aiWriteAdCopy` (single
    // draft) or `aiImproveAdCopy` (single refinement). Same bug as the
    // hook handlers: passing `ad.creative` to `saveEntityField` was a
    // no-op because of the identity short-circuit, so the primary_text
    // textarea never refreshed after Use. Mutate + sync + render.
    $(document).off('click.cpv2-use-copy-variant').on('click.cpv2-use-copy-variant', '[data-action="ws-use-ad-copy-variant"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      var idx = parseInt($(this).data('idx'), 10);
      var ad = getAd(id); if (!ad || !ad.creative) return;
      var variants = ad.creative.ai_copy_variants || [];
      var v = variants[idx]; if (!v) return;
      snapshot('Apply AI copy variant');
      ad.creative.primary_text = v.text;
      ad.creative.ai_copy_variants = [];
      ad.updated = new Date().toISOString();
      buildMaps(); syncToTextarea(); render();
      if (typeof maybeAdvanceAdStatus === 'function') maybeAdvanceAdStatus(ad, 'AI copy variant');
      logActivity('content_applied', 'ad', id, ad.name, 'Applied AI ' + (v.source || 'write') + ' variant to primary text');
      toast('Copy applied', 'success');
    });

    $(document).off('click.cpv2-rm-copy-variant').on('click.cpv2-rm-copy-variant', '[data-action="ws-remove-ad-copy-variant"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      var idx = parseInt($(this).data('idx'), 10);
      var ad = getAd(id); if (!ad || !ad.creative) return;
      var variants = ad.creative.ai_copy_variants || [];
      if (idx < 0 || idx >= variants.length) return;
      variants.splice(idx, 1);
      ad.updated = new Date().toISOString();
      snapshot('Discard copy variant');
      buildMaps(); syncToTextarea(); render();
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

    // Reset ad.media so the creative-type selector unlocks. Wipes all
    // image / video / carousel content for the ad. Triggered from the
    // Overview Configuration card's "Reset" button when media is touched.
    $(document).off('click.cpv2-reset-ctype').on('click.cpv2-reset-ctype', '[data-action="ws-ad-reset-creative-type"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      openConfirmDialog({
        title: 'Reset creative type',
        message: 'This clears all media work on this ad (image prompt, video script, carousel cards) so you can switch creative type. Continue?',
        confirmLabel: 'Clear media',
        danger: true,
        onConfirm: function() {
          var ad = getAd(id); if (!ad) return;
          var prevType = ad.creative_type;
          snapshot('Reset creative type');
          ad.media = {};
          saveEntityField('ad', id, 'media', {});
          if (typeof logActivity === 'function') {
            logActivity('media_reset', 'ad', id, ad.name, 'Cleared media for ' + (prevType || 'ad') + ' to switch creative type');
          }
        }
      });
    });

    // Ad pipeline status setter — dropdown items in the persistent inspector
    // header. Manual override; can move forward or backward. Activity log is
    // written by saveEntityField (status changes are tracked in 22-crud-helpers).
    $(document).off('click.cpv2-set-ad-status').on('click.cpv2-set-ad-status', '[data-action="ws-set-ad-status"]', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var id = $(this).data('id');
      var status = $(this).data('status');
      saveEntityField('ad', id, 'pipeline_status', status);
    });

    // Inspector header status dropdown — show/hide without re-rendering so we
    // don't blow away focus on the inline name input next to it.
    $(document).off('click.cpv2-status-dd-toggle').on('click.cpv2-status-dd-toggle', '[data-action="ws-status-dropdown-toggle"]', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var $dd = $(this).closest('.cp-status-dropdown');
      var willOpen = !$dd.hasClass('cp-status-dropdown-open');
      $('.cp-status-dropdown.cp-status-dropdown-open').not($dd).removeClass('cp-status-dropdown-open');
      $dd.toggleClass('cp-status-dropdown-open', willOpen);
      $(this).attr('aria-expanded', willOpen ? 'true' : 'false');
    });

    // Close any open status dropdown when clicking outside it.
    $(document).off('click.cpv2-status-dd-outside').on('click.cpv2-status-dd-outside', function(e) {
      if ($(e.target).closest('.cp-status-dropdown').length) return;
      $('.cp-status-dropdown.cp-status-dropdown-open').removeClass('cp-status-dropdown-open')
        .find('[data-action="ws-status-dropdown-toggle"]').attr('aria-expanded', 'false');
    });

    // Video script sections — each section is a { label, script } block. Old
    // ads with `script.rows` are auto-folded into a single section on first
    // edit (the renderer materialises them; writes always target `sections`).
    function _ensureScriptSections(ad) {
      ad.media = ad.media || {};
      ad.media.video = ad.media.video || {};
      ad.media.video.script = ad.media.video.script || {};
      if (!ad.media.video.script.sections) {
        var derived = (typeof getAdVideoScriptSections === 'function')
          ? getAdVideoScriptSections(ad.media.video).map(function(s) { return { label: s.label || '', script: s.script || '' }; })
          : [];
        ad.media.video.script.sections = derived;
      }
      return ad.media.video.script.sections;
    }

    $(document).off('click.cpv2-add-section').on('click.cpv2-add-section', '[data-action="ws-ad-add-script-section"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      var ad = getAd(id); if (!ad) return;
      var sections = _ensureScriptSections(ad);
      sections.push({ label: '', script: '' });
      snapshot('Add script section');
      saveEntityField('ad', id, 'media.video.script.sections', sections);
    });
    $(document).off('click.cpv2-rm-section').on('click.cpv2-rm-section', '[data-action="ws-ad-remove-script-section"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id'); var idx = parseInt($(this).data('index'), 10);
      var ad = getAd(id); if (!ad) return;
      var sections = _ensureScriptSections(ad);
      if (idx < 0 || idx >= sections.length) return;
      sections.splice(idx, 1);
      snapshot('Remove script section');
      saveEntityField('ad', id, 'media.video.script.sections', sections);
    });
    $(document).off('click.cpv2-mv-section').on('click.cpv2-mv-section', '[data-action="ws-ad-move-script-section"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id'); var idx = parseInt($(this).data('index'), 10); var dir = parseInt($(this).data('dir'), 10);
      var ad = getAd(id); if (!ad) return;
      var sections = _ensureScriptSections(ad);
      var newIdx = idx + dir;
      if (idx < 0 || idx >= sections.length || newIdx < 0 || newIdx >= sections.length) return;
      var moved = sections.splice(idx, 1)[0];
      sections.splice(newIdx, 0, moved);
      snapshot('Reorder script section');
      saveEntityField('ad', id, 'media.video.script.sections', sections);
    });
    $(document).off('blur.cpv2-section-field change.cpv2-section-field').on('blur.cpv2-section-field change.cpv2-section-field', '.cp-v2-script-section-field', function() {
      var $f = $(this);
      var id = $f.data('entity-id'); var idx = parseInt($f.data('index'), 10); var key = $f.data('key');
      var ad = getAd(id); if (!ad) return;
      var sections = _ensureScriptSections(ad);
      if (!sections[idx]) return;
      if (sections[idx][key] === $f.val()) return;
      sections[idx][key] = $f.val();
      saveEntityField('ad', id, 'media.video.script.sections', sections);
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
      ad.media.carousel_cards.push({ image_asset_id: '', prompt: '', caption: '' });
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

