  // ============================================================
  // SECTION 22: EVENTS & KEYBOARD SHORTCUTS
  // ============================================================

  // Wraps a block of handler registrations so an error in one block
  // doesn't suppress the rest. Mirrors Part 2A's _safeHandlerBlock.
  function _safeHandlerBlockB(label, fn) {
    try { fn(); }
    catch (e) {
      console.error('[CP] Handler block "' + label + '" failed:', e);
      if (typeof toast === 'function') toast('Some controls in "' + label + '" may not work — see console.', 'warning', 5000);
    }
  }

  function setupPart2BEvents() {
    _safeHandlerBlockB('Part 2B: core', function() {
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

    // AI research pain points (from persona detail)
    $(document).off('click.cp2b-ai-pp').on('click.cp2b-ai-pp', '[data-action="ai-research-pain-points"]', function(e) {
      e.preventDefault();
      aiResearchPainPoints($(this).data('persona-id'));
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

    // --- Meta v2 workspace defaults ---
    $(document).off('change.cp2b-v2-def').on('change.cp2b-v2-def', '.cp-v2-defaults-field', function() {
      var key = $(this).data('key');
      var val = $(this).val();
      S.meta.meta_defaults = S.meta.meta_defaults || {};
      S.meta.meta_defaults[key] = val;
      syncToTextarea();
    });

    // --- Stage 7: Export + per-field copy ---
    $(document).off('click.cp2b-v2-exp-open').on('click.cp2b-v2-exp-open', '[data-action="v2-export-open"]', function(e) {
      e.preventDefault(); openExportModal($(this).data('campaign-id') || null);
    });
    $(document).off('click.cp2b-v2-exp-json').on('click.cp2b-v2-exp-json', '[data-action="v2-export-json"]', function(e) {
      e.preventDefault(); exportV2JSON($(this).data('campaign-id') || null);
    });
    $(document).off('click.cp2b-v2-exp-csv').on('click.cp2b-v2-exp-csv', '[data-action="v2-export-csv"]', function(e) {
      e.preventDefault(); exportV2CSV($(this).data('campaign-id') || null);
    });
    $(document).off('click.cp2b-v2-copy').on('click.cp2b-v2-copy', '[data-action="v2-copy-ad-field"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      copyAdField($(this).data('id'), $(this).data('field'));
    });

    // --- Stage 7b: Per-ad structured media brief (Phase 5 of the audit) ---
    $(document).off('click.cp2b-brief-preview').on('click.cp2b-brief-preview', '[data-action="preview-media-brief"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      openMediaBriefPreview($(this).data('id'));
    });
    $(document).off('click.cp2b-brief-copy').on('click.cp2b-brief-copy', '[data-action="copy-media-brief"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      copyAdMediaBriefJSON($(this).data('id'));
    });
    $(document).off('click.cp2b-brief-copy-mcp').on('click.cp2b-brief-copy-mcp', '[data-action="copy-media-brief-mcp"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      copyAdMediaBriefJSON($(this).data('id'), { mcp: true });
    });
    $(document).off('click.cp2b-brief-dl').on('click.cp2b-brief-dl', '[data-action="download-media-brief"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      exportAdMediaBriefJSON($(this).data('id'));
    });
    });  // _safeHandlerBlockB('Part 2B: core')

    console.log('[CP] Part 2B event handlers ready');
  }

  function setupKeyboardShortcuts() {
    // Key '3' (formerly Pain Points) now opens the Personas view's Pain Points tab.
    var viewKeys = { '1': 'dashboard', '2': 'personas', '3': 'personas_pp', '4': 'messages', '5': 'styles', '6': 'formats', '7': 'meta_campaigns', '8': 'calendar', '9': 'research', '0': 'settings' };

    $(document).off('keydown.cp2b-shortcuts').on('keydown.cp2b-shortcuts', function(e) {
      // Skip if inside input/textarea or modal open
      if ($(e.target).is('input, textarea, select, [contenteditable]')) return;
      if ($('.cp-modal-backdrop').length || $('.cp-confirm-backdrop').length) return;

      // Number keys → navigate. 'personas_pp' is a synthetic key that means
      // "open Personas view with the Pain Points tab active".
      if (viewKeys[e.key]) {
        e.preventDefault();
        var target = viewKeys[e.key];
        if (target === 'personas_pp') {
          S.personasTab = 'pain_points';
          navigate('personas');
        } else {
          if (target === 'personas') S.personasTab = 'personas';
          navigate(target);
        }
        return;
      }
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
        if (view === 'personas') {
          // Personas view has two tabs — open the matching modal
          if (S.personasTab === 'pain_points') P2A.openPainPointModal();
          else P2A.openPersonaModal();
        }
        else if (view === 'messages') P2A.openMessageModal();
        else if (view === 'styles') P2A.openStyleModal();
        else if (view === 'formats') P2A.openFormatModal();
        else if (view === 'meta_campaigns' || view === 'campaign_workspace') {
          if (P2A.openNewCampaignWizard) P2A.openNewCampaignWizard();
        }
        return;
      }
    });
  }

