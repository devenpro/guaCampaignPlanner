  // ============================================================
  // SECTION 14: PRODUCTION STEP RENDERER
  // ============================================================
  // Hands off recipe to the matching media-production Drupal app
  // (image_production / carousel_production / video_production).
  // Pre-fills title, brand, planner hub, planner id via query params.
  // ============================================================

  function renderMediaStep(recipe) {
    var html = '<div class="cp-step-production" data-recipe-id="' + esc(recipe.id) + '">';

    // Header / context
    html += '<div class="cp-card cp-production-header-card">';
    html += '<div class="cp-section-header"><h3>' + icon('rocket') + ' Production Handoff</h3>';
    html += '<span class="cp-text-muted">Send this recipe to the matching media production app.</span></div>';
    html += '<p class="cp-production-intro">';
    html += 'Choose the media type, then open the production node-add form pre-filled with this recipe’s title, brand, and planner IDs. ';
    html += 'You will craft the actual creative — image prompts, carousel slides, or video script — inside the production app.';
    html += '</p>';
    html += '</div>';

    // Media-type selector
    html += '<div class="cp-card cp-production-type-card">';
    html += '<div class="cp-section-header"><h3>' + icon('layer-group') + ' Media Type</h3></div>';
    html += '<div class="cp-production-type-grid">';
    var types = (typeof Constants !== 'undefined' && Constants.MEDIA_TYPES) || {};
    for (var key in types) {
      var mt = types[key];
      var active = recipe.media_type === key;
      html += '<button class="cp-production-type-card-btn' + (active ? ' cp-production-type-active' : '') + '" data-action="set-media-type" data-type="' + esc(key) + '" style="--mt-color:' + mt.color + '">';
      html += '<span class="cp-production-type-icon" style="background:' + mt.color + '15;color:' + mt.color + '">' + icon(mt.icon) + '</span>';
      html += '<span class="cp-production-type-label">' + esc(mt.label) + '</span>';
      html += '<span class="cp-production-type-sub">/node/add/' + esc(mt.node_type) + '</span>';
      if (active) html += '<span class="cp-production-type-selected">' + icon('circle-check') + ' Selected</span>';
      html += '</button>';
    }
    html += '</div></div>';

    // Production handoff panel for the selected type
    html += renderProductionHandoff(recipe);

    // Production / delivery notes (kept from before — used by reviewer)
    html += '<div class="cp-card" style="margin-top:var(--cp-space-3)">';
    html += '<div class="cp-section-header"><h3>' + icon('clipboard-list') + ' Production Notes</h3>';
    html += '<span class="cp-text-muted">Optional — passed along as context for the production team.</span></div>';
    html += '<textarea class="cp-textarea" data-action="save-production-notes" rows="3" placeholder="Anything the production team should know — references, constraints, tone reminders…">' + esc(recipe.production_notes || '') + '</textarea>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderProductionHandoff(recipe) {
    var mtKey = recipe.media_type || 'image';
    var mt = (Constants.MEDIA_TYPES || {})[mtKey] || Constants.MEDIA_TYPES.image;
    var url = buildProductionNodeAddUrl(recipe, mt);
    var brand = (S.brand && S.brand.identity) || {};
    var brandName = (S.brand && S.brand.core && S.brand.core.brand_name) || brand.name || '';
    var brandId = brand.id || '';
    var plannerHubId = getPlannerHubId();
    var plannerId = recipe.id;

    var html = '<div class="cp-card cp-production-handoff" style="margin-top:var(--cp-space-3);--mt-color:' + mt.color + '">';
    html += '<div class="cp-section-header"><h3 style="color:' + mt.color + '">' + icon(mt.icon) + ' ' + esc(mt.label) + ' Production</h3></div>';

    html += '<div class="cp-production-summary">';
    html += '<div class="cp-production-summary-row"><span class="cp-production-summary-label">Title</span><span class="cp-production-summary-value">' + esc(recipe.title || '(Untitled)') + '</span></div>';
    html += '<div class="cp-production-summary-row"><span class="cp-production-summary-label">Brand</span><span class="cp-production-summary-value">' + (brandName ? esc(brandName) : '<span class="cp-text-muted">(not detected)</span>') + (brandId ? ' <span class="cp-text-muted">(#' + esc(brandId) + ')</span>' : '') + '</span></div>';
    html += '<div class="cp-production-summary-row"><span class="cp-production-summary-label">Planner Hub</span><span class="cp-production-summary-value">' + (plannerHubId ? esc(plannerHubId) : '<span class="cp-text-muted">(not detected)</span>') + '</span></div>';
    html += '<div class="cp-production-summary-row"><span class="cp-production-summary-label">Planner ID</span><span class="cp-production-summary-value"><code>' + esc(plannerId) + '</code></span></div>';
    html += '</div>';

    // Validation warnings
    var warnings = [];
    if (!brandId) warnings.push('No brand ID detected from page (<code>.brand-id</code> inside <code>.brand-data</code>).');
    if (!plannerHubId) warnings.push('No planner hub ID detected. Production node will be created without the hub reference.');
    if (warnings.length > 0) {
      html += '<div class="cp-production-warning">' + icon('triangle-exclamation') + ' <div>';
      for (var wi = 0; wi < warnings.length; wi++) html += '<div>' + warnings[wi] + '</div>';
      html += '</div></div>';
    }

    // Open button
    html += '<div class="cp-production-actions">';
    html += '<a class="cp-btn cp-btn-primary cp-btn-lg cp-production-open-btn" href="' + esc(url) + '" target="_blank" rel="noopener">' + icon('external-link') + ' Create ' + esc(mt.label) + ' Production Node</a>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="copy-production-url" data-url="' + esc(url) + '">' + icon('copy') + ' Copy URL</button>';
    html += '</div>';

    // URL preview (collapsed)
    html += '<details class="cp-production-url-details">';
    html += '<summary>' + icon('link') + ' URL preview</summary>';
    html += '<code class="cp-production-url-preview">' + esc(url) + '</code>';
    html += '</details>';

    html += '</div>';
    return html;
  }

  function buildProductionNodeAddUrl(recipe, mt) {
    var origin = window.location.origin;
    var path = '/node/add/' + mt.node_type;
    var brand = (S.brand && S.brand.identity) || {};
    var brandId = brand.id || '';
    var plannerHubId = getPlannerHubId();
    var title = recipe.title || '';

    // Drupal nested-array query format: edit[field][widget][0][value|target_id]
    var params = [];
    if (title) params.push(_qpair('edit[title][widget][0][value]', title));
    if (brandId) params.push(_qpair('edit[field_brand][widget][0][target_id]', brandId));
    if (plannerHubId) params.push(_qpair('edit[field_planner_hub][widget][0][target_id]', plannerHubId));
    params.push(_qpair('edit[field_planner_id][widget][0][value]', recipe.id));

    return origin + path + (params.length ? '?' + params.join('&') : '');
  }

  function _qpair(key, val) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(val);
  }

  // Reads the current planner hub (campaign planner node) ID — the node we're
  // currently editing inside. We try several signals; first available wins.
  function getPlannerHubId() {
    // 1) Drupal data attribute on body (common in node-edit forms)
    var nid = $('body').attr('data-node-id') || $('body').attr('data-nid');
    if (nid) return String(nid).trim();

    // 2) Hidden Drupal field
    var $nid = $('input[name="nid"]').first();
    if ($nid.length && $nid.val()) return String($nid.val()).trim();

    // 3) Drupal settings (if exposed)
    if (window.drupalSettings && window.drupalSettings.path && window.drupalSettings.path.currentPath) {
      var m = String(window.drupalSettings.path.currentPath).match(/^node\/(\d+)/);
      if (m) return m[1];
    }

    // 4) Body class node-XXX
    var cls = $('body').attr('class') || '';
    var bm = cls.match(/\bnode-(\d+)\b/);
    if (bm) return bm[1];

    // 5) Page URL /node/123/edit or /node/123
    var um = String(window.location.pathname).match(/\/node\/(\d+)(\b|\/)/);
    if (um) return um[1];

    // 6) Configured in workspace meta
    if (S.meta && S.meta.workspace && S.meta.workspace.planner_hub_id) return String(S.meta.workspace.planner_hub_id);

    return '';
  }

