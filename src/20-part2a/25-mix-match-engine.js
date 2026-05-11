  // ============================================================
  // SECTION 17: MIX & MATCH ENGINE
  // ============================================================

  var mixerState = { mode: 'manual', selections: { persona: [], message: [], style: [], format: [] } };

  function openMixerModal(mode) {
    mixerState.mode = mode || 'manual';
    mixerState.selections = { persona: [], message: [], style: [], format: [] };

    var isManual = mixerState.mode === 'manual';
    var title = isManual ? 'Create Recipe' : 'Batch Generate Recipes';
    var titleIcon = isManual ? 'bolt' : 'shuffle';

    var html = '<div class="cp-mixer" data-mode="' + esc(mixerState.mode) + '">';

    // Mode description
    html += '<div style="margin-bottom:var(--cp-space-4)">';
    if (isManual) {
      html += '<p class="cp-text-muted">' + icon('info') + ' Select one from each dimension to create a single recipe.</p>';
    } else {
      html += '<p class="cp-text-muted">' + icon('info') + ' Select multiple from each dimension. All permutations will be generated as recipes.</p>';
    }
    html += '</div>';

    // Batch counter (batch mode only)
    if (!isManual) {
      html += '<div class="cp-mixer-batch-counter" id="cpMixerCounter" style="background:var(--cp-primary-light);margin-bottom:var(--cp-space-3)">';
      html += '<span class="cp-mixer-batch-count" id="cpMixerCountNum">0</span>';
      html += '<span class="cp-mixer-batch-label">recipes will be created</span>';
      html += '</div>';
    }

    // 4 columns
    html += '<div class="cp-mixer-columns">';
    var dimKeys = ['persona', 'message', 'style', 'format'];
    for (var di = 0; di < dimKeys.length; di++) {
      html += renderMixerColumn(dimKeys[di], isManual);
    }
    html += '</div>';

    // Warning zone for batch
    if (!isManual) {
      html += '<div id="cpMixerWarning" style="display:none"></div>';
    }

    html += '</div>';

    openModal(title, html, {
      titleIcon: titleIcon,
      size: 'xl',
      saveLabel: isManual ? icon('plus') + ' Create Recipe' : icon('shuffle') + ' Generate All',
      ai: !isManual,
      onSave: function() {
        if (isManual) {
          createRecipeFromMixer();
        } else {
          batchGenerateRecipes();
        }
      }
    });

    // Wire up mixer events after modal renders
    setTimeout(setupMixerEvents, 50);
  }

  function renderMixerColumn(dimKey, isManual) {
    var dim = Constants.DIMENSIONS[dimKey];
    var items = [];
    if (dimKey === 'persona') items = getAllPersonas();
    else if (dimKey === 'message') items = getAllMessages();
    else if (dimKey === 'style') items = getAllStyles();
    else if (dimKey === 'format') items = getAllFormats();

    var html = '<div class="cp-mixer-column" data-dim="' + dimKey + '">';
    html += '<div class="cp-mixer-column-header" style="background:' + dim.color + '10">';
    html += '<span class="cp-mixer-column-icon" style="color:' + dim.color + '">' + icon(dim.icon) + '</span>';
    html += '<span class="cp-mixer-column-title">' + esc(dim.label) + '</span>';
    html += '<span class="cp-mixer-column-count cp-nav-badge">' + items.length + '</span>';
    html += '</div>';

    html += '<div class="cp-mixer-list">';
    if (items.length === 0) {
      html += '<div class="cp-empty-state cp-empty-state--compact"><p>No ' + esc(dim.label.toLowerCase()) + 's yet.</p>';
      html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="new-' + dimKey + '">' + icon('plus') + ' Create</button></div>';
    } else {
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var iname = item.name || item.title || 'Untitled';
        var sub = getEntitySubtext(dimKey, item);
        var inputType = isManual ? 'radio' : 'checkbox';

        html += '<label class="cp-mixer-item" data-id="' + esc(item.id) + '" data-dim="' + dimKey + '">';
        html += '<input type="' + inputType + '" name="mixer_' + dimKey + '" value="' + esc(item.id) + '" class="cp-mixer-input" data-dim="' + dimKey + '" style="margin:3px 0 0;flex-shrink:0;cursor:pointer">';
        html += '<div style="flex:1;min-width:0">';
        html += '<div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(iname) + '</div>';
        if (sub) html += '<div style="font-size:11px;color:var(--cp-text-muted);margin-top:1px">' + esc(sub) + '</div>';
        html += '</div></label>';
      }
    }
    html += '</div></div>';
    return html;
  }

  function setupMixerEvents() {
    // Manual mode: radio selection highlight
    $('.cp-mixer-input[type="radio"]').off('change.mixer').on('change.mixer', function() {
      var dim = $(this).data('dim');
      $('.cp-mixer-item[data-dim="' + dim + '"]').removeClass('cp-mixer-item-selected');
      $(this).closest('.cp-mixer-item').addClass('cp-mixer-item-selected');
      mixerState.selections[dim] = [$(this).val()];
    });

    // Batch mode: checkbox selection + permutation counter
    $('.cp-mixer-input[type="checkbox"]').off('change.mixer').on('change.mixer', function() {
      var dim = $(this).data('dim');
      $(this).closest('.cp-mixer-item').toggleClass('cp-mixer-item-selected', this.checked);
      // Rebuild selection array
      mixerState.selections[dim] = [];
      $('.cp-mixer-input[data-dim="' + dim + '"]:checked').each(function() {
        mixerState.selections[dim].push($(this).val());
      });
      updatePermutationCount();
    });
  }

  function updatePermutationCount() {
    var sel = mixerState.selections;
    var counts = [
      Math.max(sel.persona.length, 0),
      Math.max(sel.message.length, 0),
      Math.max(sel.style.length, 0),
      Math.max(sel.format.length, 0)
    ];
    // Only count dimensions with selections; empty dims = 1 (will be left blank)
    var total = 1;
    var hasSel = false;
    for (var i = 0; i < counts.length; i++) {
      if (counts[i] > 0) { total *= counts[i]; hasSel = true; }
    }
    if (!hasSel) total = 0;

    $('#cpMixerCountNum').text(total);

    var $warn = $('#cpMixerWarning');
    if (total > 50) {
      $warn.show().html('<div class="cp-mixer-warning">' + icon('warning') + ' <strong>' + total + ' recipes</strong> is a lot! Consider narrowing your selection. Max 100 per batch.</div>');
    } else if (total > 20) {
      $warn.show().html('<div class="cp-mixer-warning" style="background:var(--cp-accent-light);border-color:rgba(227,116,0,0.2);color:#92400e">' + icon('circle-info') + ' ' + total + ' recipes will be generated.</div>');
    } else {
      $warn.hide();
    }
  }

  function createRecipeFromMixer() {
    var sel = mixerState.selections;
    var personaId = (sel.persona && sel.persona[0]) || '';
    var messageId = (sel.message && sel.message[0]) || '';
    var styleId = (sel.style && sel.style[0]) || '';
    var formatId = (sel.format && sel.format[0]) || '';

    if (!personaId && !messageId && !styleId && !formatId) {
      toast('Select at least one dimension', 'warning');
      return;
    }

    snapshot('Create recipe (mixer)');
    var newRecipe = createEntity('recipe', {
      persona_id: personaId, message_id: messageId,
      style_id: styleId, visual_format_id: formatId,
      campaign_id: S._pendingCampaignId || ''
    });

    if (newRecipe) {
      S.selectedRecipeId = newRecipe.id;
      S.currentStep = 'composition';
      S._pendingCampaignId = null;
      closeModal();
      navigate('recipes');
      toast('Recipe created', 'success');
    }
  }

  function batchGenerateRecipes() {
    var sel = mixerState.selections;
    var personas = sel.persona.length > 0 ? sel.persona : [''];
    var messages = sel.message.length > 0 ? sel.message : [''];
    var styles = sel.style.length > 0 ? sel.style : [''];
    var formats = sel.format.length > 0 ? sel.format : [''];

    var total = personas.length * messages.length * styles.length * formats.length;
    if (total === 0) { toast('Select at least one item from any dimension', 'warning'); return; }
    if (total > 100) { toast('Maximum 100 recipes per batch. Narrow your selection.', 'error'); return; }

    snapshot('Batch generate ' + total + ' recipes');
    var batchId = generateId('batch');
    var count = 0;

    for (var pi = 0; pi < personas.length; pi++) {
      for (var mi = 0; mi < messages.length; mi++) {
        for (var si = 0; si < styles.length; si++) {
          for (var fi = 0; fi < formats.length; fi++) {
            createEntity('recipe', {
              persona_id: personas[pi], message_id: messages[mi],
              style_id: styles[si], visual_format_id: formats[fi],
              batch_id: batchId, campaign_id: S._pendingCampaignId || ''
            });
            count++;
          }
        }
      }
    }

    logActivity('recipe_batch_generated', 'recipe', batchId, '', 'Batch generated ' + count + ' recipes');
    S._pendingCampaignId = null;
    closeModal();
    navigate('recipes');
    toast(count + ' recipes generated', 'success', 5000);
  }

