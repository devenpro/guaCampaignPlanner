  // ============================================================
  // SECTION 13.6: DEDICATED FORMATS VIEW
  // ============================================================

  function renderFormatsPageView() {
    var formats = getAllFormats();
    var fmtFilter = S.formatFilter || {};

    // Apply filters
    var filtered = formats.slice();
    if (fmtFilter.search) {
      var q = fmtFilter.search.toLowerCase();
      filtered = filtered.filter(function(f) { return (f.name || '').toLowerCase().indexOf(q) > -1 || (f.description || '').toLowerCase().indexOf(q) > -1; });
    }
    if (fmtFilter.category) filtered = filtered.filter(function(f) { return f.category === fmtFilter.category; });

    var html = '<div class="cp-view cp-view-formats">';

    // Header
    html += '<div class="cp-view-header"><div class="cp-view-header-left">';
    html += '<h1>' + icon('clapperboard') + ' Visual Formats</h1>';
    html += '<span class="cp-view-subtitle">' + filtered.length + ' of ' + formats.length + ' formats</span>';
    html += '</div><div class="cp-view-header-right">';
    html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="new-format">' + icon('plus') + ' Add Format</button>';
    html += '</div></div>';

    // AI Research Panel
    html += '<div class="cp-ai-research-slot" id="cpFormatResearchSlot">';
    html += renderAIResearchBar('Visual Format', '#0891b2', 'clapperboard', 'formats');
    html += '</div>';

    // Toolbar
    html += '<div class="cp-view-toolbar">';
    html += '<div class="cp-search-wrapper">' + icon('search') + '<input type="text" class="cp-input" id="cpFormatPageSearch" placeholder="Search formats..." value="' + esc(fmtFilter.search || '') + '"></div>';
    html += '<select class="cp-select cp-select-sm" id="cpFormatCatFilter"><option value="">All Categories</option>';
    for (var ci = 0; ci < FORMAT_CATEGORIES.length; ci++) {
      var cat = FORMAT_CATEGORIES[ci];
      html += '<option value="' + esc(cat.id) + '"' + (fmtFilter.category === cat.id ? ' selected' : '') + '>' + icon(cat.icon) + ' ' + esc(cat.name) + '</option>';
    }
    html += '</select></div>';

    // Card grid
    if (filtered.length === 0) {
      html += '<div class="cp-empty-state"><div class="cp-empty-state-icon">' + icon('clapperboard') + '</div>';
      html += '<div class="cp-empty-state-title">No formats' + (fmtFilter.search || fmtFilter.category ? ' match your filters' : ' yet') + '</div>';
      html += '<div class="cp-empty-state-text">Define visual format approaches like "Talking Head Studio", "UGC Phone Style", or "Motion Graphics".</div>';
      html += '<button class="cp-btn cp-btn-primary" data-action="new-format">' + icon('plus') + ' Create Format</button></div>';
    } else {
      html += '<div class="cp-card-grid">';
      for (var i = 0; i < filtered.length; i++) html += renderFormatCard(filtered[i]);
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

