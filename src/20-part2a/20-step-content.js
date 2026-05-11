  // ============================================================
  // SECTION 13: CONTENT STEP RENDERER
  // ============================================================

  function renderContentStep(recipe) {
    var content = recipe.content || {};
    var html = '<div class="cp-step-content" data-recipe-id="' + esc(recipe.id) + '">';

    // Ad copy (Quill editor)
    html += '<div class="cp-card cp-ad-copy-editor">';
    html += '<div class="cp-section-header"><h3>' + icon('pen-fancy') + ' Ad Copy / Primary Text</h3>';
    html += renderRecipeAIBar('ai-generate-content', recipe.id, 'AI Write', 'sparkles');
    html += renderRecipeAIBar('ai-improve-content', recipe.id, 'AI Improve', 'wand-magic');
    html += '</div>';
    html += '<div id="cpQuillEditor" class="cp-quill-container"></div>';
    html += '<input type="hidden" id="cpQuillContent" value="' + esc(content.ad_copy || '') + '">';
    html += '</div>';

    // Headline, Description, CTA
    html += '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('heading') + ' Headline & CTA</h3></div>';
    html += '<div class="cp-cta-fields">';
    html += '<div class="cp-form-group"><label class="cp-field-label">Headline</label>';
    html += '<input type="text" class="cp-input" data-action="save-content-field" data-cfield="headline" value="' + esc(content.headline || '') + '" placeholder="Short attention-grabbing headline"></div>';
    html += '<div class="cp-form-group"><label class="cp-field-label">Description</label>';
    html += '<input type="text" class="cp-input" data-action="save-content-field" data-cfield="description" value="' + esc(content.description || '') + '" placeholder="Supporting description text"></div>';
    html += '<div class="cp-form-group"><label class="cp-field-label">Call to Action</label>';
    html += '<input type="text" class="cp-input" data-action="save-content-field" data-cfield="cta" value="' + esc(content.cta || '') + '" placeholder="e.g., Book a Free Demo"></div>';
    html += '</div></div>';

    // Variants
    html += '<div class="cp-card cp-variant-panel" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('copy') + ' Variants</h3>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="add-variant">' + icon('plus') + ' Add Variant</button></div>';
    var variants = content.variants || [];
    if (variants.length === 0) {
      html += '<p class="cp-text-muted">No variants yet. Add variations of your ad copy for A/B testing.</p>';
    } else {
      for (var vi = 0; vi < variants.length; vi++) {
        html += '<div class="cp-variant-item" data-variant-index="' + vi + '">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">';
        html += '<span class="cp-field-label">Variant ' + (vi + 1) + '</span>';
        html += '<button class="cp-btn-icon cp-btn-xs" data-action="remove-variant" data-variant-index="' + vi + '">' + icon('trash') + '</button>';
        html += '</div>';
        html += '<textarea class="cp-textarea" data-action="save-variant" data-variant-index="' + vi + '" rows="3" placeholder="Variant copy...">' + esc(variants[vi].text || '') + '</textarea>';
        html += '</div>';
      }
    }
    html += '</div>';

    // Notes
    html += '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('file-text') + ' Content Notes</h3></div>';
    html += '<textarea class="cp-textarea" data-action="save-content-field" data-cfield="notes" rows="2" placeholder="Internal notes about this content...">' + esc(content.notes || '') + '</textarea>';
    html += '</div>';

    html += '</div>';

    // Init Quill after render
    setTimeout(function() { initQuillForRecipe(recipe.id); }, 50);

    return html;
  }

  var currentQuill = null;
  var currentQuillSaveTimeout = null;
  function destroyQuill() {
    if (currentQuillSaveTimeout) { clearTimeout(currentQuillSaveTimeout); currentQuillSaveTimeout = null; }
    if (currentQuill) {
      try { currentQuill.off('text-change'); } catch(e) {}
      currentQuill = null;
    }
    $('#cpQuillEditor').html('');
  }
  function initQuillForRecipe(recipeId) {
    if (typeof Quill === 'undefined') {
      console.warn('[CP] Quill not loaded');
      return;
    }
    var $container = $('#cpQuillEditor');
    if (!$container.length) return;
    destroyQuill();

    currentQuill = new Quill('#cpQuillEditor', {
      theme: 'snow',
      placeholder: 'Write your ad copy here...',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          ['link'],
          ['clean']
        ]
      }
    });

    // Load existing content
    var existing = $('#cpQuillContent').val() || '';
    if (existing) {
      try { currentQuill.root.innerHTML = existing; } catch(e) { currentQuill.setText(existing); }
    }

    // Save on change (debounced)
    currentQuill.on('text-change', function() {
      clearTimeout(currentQuillSaveTimeout);
      currentQuillSaveTimeout = setTimeout(function() {
        // Guard: only save if this Quill instance is still the active one for this recipe
        if (!currentQuill || recipeId !== S.selectedRecipeId) return;
        var recipe = getRecipe(recipeId);
        if (!recipe) return;
        recipe.content = recipe.content || {};
        recipe.content.ad_copy = currentQuill.root.innerHTML;
        recipe.updated = new Date().toISOString();
        syncToTextarea();
        if (maybeAdvanceRecipeStatus) maybeAdvanceRecipeStatus(recipe, 'content updated');
        buildMaps();
      }, 500);
    });
  }

