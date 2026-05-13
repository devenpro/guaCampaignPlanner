  // ============================================================
  // SECTION 13: STYLES VIEW
  // ============================================================

  function renderStylesView() {
    var html = '<div class="cp-view cp-view-styles">';

    // Header
    html += '<div class="cp-view-header"><div class="cp-view-header-left">';
    html += '<h1>' + icon('palette') + ' Styles & Tones</h1>';
    html += '<span class="cp-view-subtitle">' + S.totalStyles + ' styles</span>';
    html += '</div><div class="cp-view-header-right">';
    html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="new-style">' + icon('plus') + ' Add Style</button>';
    html += '</div></div>';

    // AI Research Panel
    html += '<div class="cp-ai-research-slot" id="cpStyleResearchSlot">';
    html += renderAIResearchBar('Style', '#e37400', 'palette', 'styles');
    html += '</div>';

    // Content
    html += renderStylesTabContent();

    html += '</div>';
    return html;
  }

  function renderStylesTabContent() {
    var styles = getAllStyles();
    var html = '';

    if (styles.length === 0) {
      html += '<div class="cp-empty-state"><div class="cp-empty-state-icon">' + icon('palette') + '</div>';
      html += '<div class="cp-empty-state-title">No styles yet</div>';
      html += '<div class="cp-empty-state-text">Define creative styles and tones for your ads — like "Friendly", "Professional", or "High-Energy".</div>';
      html += '<button class="cp-btn cp-btn-primary" data-action="new-style">' + icon('plus') + ' Create Style</button></div>';
    } else {
      html += '<div class="cp-card-grid">';
      for (var i = 0; i < styles.length; i++) {
        html += renderStyleCard(styles[i]);
      }
      html += '</div>';
    }
    return html;
  }

  function renderStyleCard(style) {
    var html = '<div class="cp-card cp-style-card" data-id="' + esc(style.id) + '">';
    html += '<div class="cp-style-card-header">';
    html += '<h3>' + esc(style.name || 'Untitled Style') + '</h3>';
    html += '<div class="cp-style-card-actions">';
    html += '<button class="cp-btn-icon cp-btn-xs" data-action="edit-style" data-id="' + esc(style.id) + '" title="Edit">' + icon('edit') + '</button>';
    html += '<button class="cp-btn-icon cp-btn-xs" data-action="delete-style" data-id="' + esc(style.id) + '" title="Delete">' + icon('trash') + '</button>';
    html += '</div></div>';

    if (style.description) {
      html += '<div class="cp-style-card-desc">' + esc(truncate(style.description, 120)) + '</div>';
    }

    // Tags
    if ((style.tags || []).length > 0) {
      html += '<div class="cp-style-card-tags">';
      for (var ti = 0; ti < style.tags.length; ti++) {
        var tag = S.tagMap[style.tags[ti]];
        if (tag) html += '<span class="cp-badge" style="background:' + tag.color + '15;color:' + tag.color + '">' + esc(tag.name) + '</span>';
      }
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  function renderFormatsTabContent() {
    var formats = getAllFormats();
    var html = '';

    if (formats.length === 0) {
      html += '<div class="cp-empty-state"><div class="cp-empty-state-icon">' + icon('clapperboard') + '</div>';
      html += '<div class="cp-empty-state-title">No visual formats yet</div>';
      html += '<div class="cp-empty-state-text">Define content structures — like "Indoor Studio", "UGC Style", "Whiteboard", or "Motion Graphics".</div>';
      html += '<button class="cp-btn cp-btn-primary" data-action="new-format">' + icon('plus') + ' Create Format</button></div>';
    } else {
      html += '<div class="cp-card-grid">';
      for (var i = 0; i < formats.length; i++) {
        html += renderFormatCard(formats[i]);
      }
      html += '</div>';
    }
    return html;
  }

  function renderFormatCard(format) {
    var catLabel = '';
    if (format.category) {
      var fcat = FORMAT_CATEGORIES.find(function(c) { return c.id === format.category; });
      catLabel = fcat ? fcat.name : format.category;
    }
    var catColor = '#80868b';
    if (format.category === 'vfc_shoot') catColor = '#1a73e8';
    else if (format.category === 'vfc_ugc') catColor = '#e37400';
    else if (format.category === 'vfc_graphic') catColor = '#9334e9';
    else if (format.category === 'vfc_animation') catColor = '#0891b2';

    var html = '<div class="cp-card cp-format-card" data-id="' + esc(format.id) + '">';
    html += '<div class="cp-format-card-header">';
    html += '<h3>' + esc(format.name || 'Untitled Format') + '</h3>';
    html += '<div class="cp-format-card-actions">';
    html += '<button class="cp-btn-icon cp-btn-xs" data-action="edit-format" data-id="' + esc(format.id) + '" title="Edit">' + icon('edit') + '</button>';
    html += '<button class="cp-btn-icon cp-btn-xs" data-action="delete-format" data-id="' + esc(format.id) + '" title="Delete">' + icon('trash') + '</button>';
    html += '</div></div>';

    if (catLabel) {
      html += '<div class="cp-format-card-cat"><span class="cp-badge" style="background:' + catColor + '15;color:' + catColor + '">' + esc(catLabel) + '</span></div>';
    }

    if (format.description) {
      html += '<div class="cp-format-card-desc">' + esc(truncate(format.description, 120)) + '</div>';
    }

    // Reference image thumbnails
    var refIds = format.reference_image_ids || [];
    if (refIds.length > 0) {
      html += '<div class="cp-format-card-refs">';
      var shown = 0;
      for (var ri = 0; ri < refIds.length && shown < 3; ri++) {
        var img = S.imageMap[refIds[ri]];
        if (img) {
          html += '<div class="cp-format-ref-thumb"><img src="' + esc(img.url) + '" alt="' + esc(img.filename) + '"></div>';
          shown++;
        }
      }
      if (refIds.length > 3) html += '<span class="cp-text-muted">+' + (refIds.length - 3) + ' more</span>';
      html += '</div>';
    }

    // Tags
    if ((format.tags || []).length > 0) {
      html += '<div class="cp-format-card-tags">';
      for (var ti = 0; ti < format.tags.length; ti++) {
        var tag = S.tagMap[format.tags[ti]];
        if (tag) html += '<span class="cp-badge" style="background:' + tag.color + '15;color:' + tag.color + '">' + esc(tag.name) + '</span>';
      }
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

