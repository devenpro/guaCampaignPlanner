  // ============================================================
  // SECTION 15: REVIEW STEP RENDERER
  // ============================================================

  function renderReviewStep(recipe) {
    var html = '<div class="cp-step-review" data-recipe-id="' + esc(recipe.id) + '">';

    // Completion checklist
    html += '<div class="cp-card cp-review-checklist">';
    html += '<div class="cp-section-header"><h3>' + icon('clipboard-check') + ' Completion Checklist</h3></div>';

    var checks = buildCompletionChecks(recipe);
    var doneCount = checks.filter(function(c) { return c.done; }).length;
    var totalChecks = checks.length;

    html += progressBar(Math.round(doneCount / totalChecks * 100), doneCount === totalChecks ? 'var(--cp-success)' : 'var(--cp-primary)');
    html += '<span class="cp-text-muted" style="display:block;margin:6px 0 12px">' + doneCount + ' of ' + totalChecks + ' complete</span>';

    for (var ci = 0; ci < checks.length; ci++) {
      var chk = checks[ci];
      html += '<div class="cp-review-check-item">';
      html += '<div class="cp-review-check-icon' + (chk.done ? ' cp-review-check-done' : ' cp-review-check-pending') + '">' + (chk.done ? icon('check') : '') + '</div>';
      html += '<span style="flex:1;font-size:var(--cp-font-size-sm);' + (chk.done ? 'color:var(--cp-success)' : '') + '">' + esc(chk.label) + '</span>';
      if (chk.action) html += '<button class="cp-btn-link cp-btn-sm" data-action="go-step" data-step="' + esc(chk.step) + '">' + icon('arrow-right') + ' Go</button>';
      html += '</div>';
    }
    html += '</div>';

    // Status management
    html += '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('signal') + ' Status</h3></div>';
    html += '<div style="margin-bottom:12px">';
    html += '<span class="cp-text-muted">Current: </span>' + recipeStatusBadge(recipe.status);
    html += '</div>';

    var stIdx = Constants.STATUS_ORDER.indexOf(recipe.status);
    // Manual status actions
    html += '<div class="cp-review-actions">';
    if (stIdx < Constants.STATUS_ORDER.indexOf('in_review') && stIdx >= Constants.STATUS_ORDER.indexOf('media_ready')) {
      html += '<button class="cp-btn cp-btn-primary" data-action="set-recipe-status" data-status="in_review">' + icon('magnifying-glass') + ' Submit for Review</button>';
    }
    if (recipe.status === 'in_review') {
      html += '<button class="cp-btn cp-btn-primary" data-action="set-recipe-status" data-status="approved">' + icon('circle-check') + ' Approve</button>';
      html += '<button class="cp-btn cp-btn-outline" data-action="set-recipe-status" data-status="content_ready">' + icon('arrow-left') + ' Request Changes</button>';
    }
    if (recipe.status === 'approved') {
      html += '<button class="cp-btn cp-btn-primary" data-action="set-recipe-status" data-status="live">' + icon('signal') + ' Mark as Live</button>';
    }
    if (recipe.status === 'live') {
      html += '<button class="cp-btn cp-btn-outline" data-action="set-recipe-status" data-status="paused">' + icon('pause') + ' Pause</button>';
    }
    if (recipe.status === 'paused') {
      html += '<button class="cp-btn cp-btn-primary" data-action="set-recipe-status" data-status="live">' + icon('signal') + ' Resume</button>';
    }
    if (recipe.status !== 'archived') {
      html += '<button class="cp-btn cp-btn-outline cp-btn-danger" data-action="set-recipe-status" data-status="archived">' + icon('box-archive') + ' Archive</button>';
    }
    html += '</div></div>';

    // Review notes
    html += '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('file-text') + ' Review Notes</h3></div>';
    html += '<textarea class="cp-textarea" data-action="save-review-notes" rows="3" placeholder="Feedback, approval notes, change requests...">' + esc(recipe.review_notes || '') + '</textarea>';
    html += '</div>';

    // Production notes
    html += '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('clipboard-list') + ' Production Notes</h3></div>';
    html += '<textarea class="cp-textarea" data-action="save-production-notes" rows="2" placeholder="Instructions for production team...">' + esc(recipe.production_notes || '') + '</textarea>';
    html += '</div>';

    // Export actions
    html += '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('share-nodes') + ' Export & Share</h3></div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:var(--cp-space-2)">';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="copy-recipe-content" data-recipe-id="' + esc(recipe.id) + '">' + icon('copy') + ' Copy Ad Copy</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="copy-recipe-brief" data-recipe-id="' + esc(recipe.id) + '">' + icon('clipboard') + ' Copy Creative Brief</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="export-recipe-json" data-recipe-id="' + esc(recipe.id) + '">' + icon('download') + ' Export JSON</button>';
    html += '</div></div>';

    html += '</div>';
    return html;
  }

  function buildCompletionChecks(recipe) {
    var content = recipe.content || {};
    var hook = recipe.hook || {};
    var effectiveHook = getEffectiveHook(recipe);
    var adCopyText = stripHtml(content.ad_copy || '');

    var checks = [
      { label: 'Persona assigned', done: !!recipe.persona_id, step: 'composition', action: true },
      { label: 'Message angle assigned', done: !!recipe.message_id, step: 'composition', action: true },
      { label: 'Hook selected or written', done: !!effectiveHook, step: 'hook', action: true },
      { label: 'Ad copy written (50+ chars)', done: adCopyText.trim().length >= 50, step: 'content', action: true },
      { label: 'Headline written', done: !!(content.headline && content.headline.trim()), step: 'content', action: true },
      { label: 'CTA defined', done: !!(content.cta && content.cta.trim()), step: 'content', action: true },
      { label: 'Media type selected for production', done: !!recipe.media_type, step: 'media', action: true }
    ];

    // Optional refinement checks (secondary)
    if (recipe.style_id) checks.push({ label: 'Style selected (optional)', done: true, step: 'composition', action: true });
    if (recipe.visual_format_id) checks.push({ label: 'Visual format selected (optional)', done: true, step: 'composition', action: true });

    return checks;
  }

