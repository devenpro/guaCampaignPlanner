  // ============================================================
  // SECTION 9.5: AI PREVIEW MODAL (Alternatives Selector)
  // ============================================================

  function showAIPreview(title, alternatives, onSelect, opts) {
    opts = opts || {};
    var html = '<div class="cp-ai-preview">';
    html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-3)">' + icon('sparkles') + ' ' + alternatives.length + ' alternative' + (alternatives.length !== 1 ? 's' : '') + ' generated. Select the one you prefer.</p>';

    for (var i = 0; i < alternatives.length; i++) {
      var alt = alternatives[i];
      html += '<div class="cp-ai-preview-card" data-alt-idx="' + i + '">';
      html += '<div class="cp-ai-preview-header">';
      html += '<span class="cp-ai-preview-num">' + (i + 1) + '</span>';
      if (alt.label) html += '<span class="cp-ai-preview-label">' + esc(alt.label) + '</span>';
      html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="ai-preview-select" data-idx="' + i + '">' + icon('check') + ' Use This</button>';
      html += '</div>';

      // Render content based on type
      if (alt.sections) {
        // Multi-field (content: ad_copy + headline + cta)
        for (var si = 0; si < alt.sections.length; si++) {
          var sec = alt.sections[si];
          html += '<div class="cp-ai-preview-section">';
          html += '<div class="cp-ai-preview-section-label">' + esc(sec.label) + '</div>';
          html += '<div class="cp-ai-preview-section-value">' + esc(sec.value) + '</div>';
          html += '</div>';
        }
      } else if (alt.text) {
        // Single text block
        html += '<div class="cp-ai-preview-text">' + esc(alt.text) + '</div>';
      }
      html += '</div>';
    }

    // Regenerate option
    html += '<div class="cp-ai-preview-footer">';
    html += '<div class="cp-form-group" style="margin-bottom:var(--cp-space-2)">';
    html += '<textarea class="cp-textarea" id="cpAIPreviewInstructions" rows="2" placeholder="Adjust instructions and regenerate..."></textarea>';
    html += '</div>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="ai-preview-regenerate">' + icon('rotate') + ' Regenerate</button>';
    html += '</div>';

    html += '</div>';

    // Store callback and alternatives for event handlers
    S._aiPreview = { alternatives: alternatives, onSelect: onSelect, regenerate: opts.onRegenerate || null };

    openModal(title, html, { titleIcon: 'sparkles', size: 'lg', footer: false });
  }

