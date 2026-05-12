  // ------------------------------------------------------------------
  // SECTION 9.4d: SETUP WIZARD — STEP RENDERERS (Phase 5: Steps 7 & 8)
  // ------------------------------------------------------------------
  //
  // Step 7 is the Meta v2 Campaign tree (Campaign → Ad Sets → Ads). It runs in
  // two modes: 'ai' (auto-generate the tree from the wizard's selected library
  // entities) and 'manual' (user adds Ad Sets / Ads by hand). Both produce the
  // same state shape so the finalize step is identity-mode-agnostic.

  // --- Step 7: Campaign Tree ---

  function renderSWStep7() {
    var ws       = setupWizardState;
    var generated = ws.stepGenerated[7];
    var aiLoading = ws.aiLoading;
    var mode     = ws._step7Mode || 'ai';

    var html = _buildSWStepHeader(
      'Campaign Tree',
      'Build the Meta-shape Campaign that ships when you launch — one Campaign, 2-3 Ad Sets, 2-3 Ads each. AI drafts a starting tree from your selected library.',
      'c'
    );

    html += _swAIErrorBanner(7);

    // Mode toggle
    html += '<div class="cp-sw-mode-toggle">';
    html += '<button class="cp-sw-mode-btn' + (mode === 'ai' ? ' cp-sw-mode-btn--active' : '') + '" data-action="sw-step7-mode" data-mode="ai">';
    html += icon('sparkles') + ' AI Generated';
    html += '</button>';
    html += '<button class="cp-sw-mode-btn' + (mode === 'manual' ? ' cp-sw-mode-btn--active' : '') + '" data-action="sw-step7-mode" data-mode="manual">';
    html += icon('pen-fancy') + ' Manual';
    html += '</button>';
    html += '</div>';

    // Generation bar (AI mode only)
    if (mode === 'ai') {
      html += '<div class="cp-sw-gen-bar">';
      html += '<textarea class="cp-textarea" id="swCampaignTreeContext" rows="2"';
      html += ' placeholder="Optional: campaign direction (e.g., \'push the &quot;ship in days not weeks&quot; angle, target enterprise + startup segments\')...">';
      html += esc(ws._campaignTreeContext || '');
      html += '</textarea>';
      html += _swGenButton('sw-ai-gen-campaign-tree', generated, aiLoading);
      html += '</div>';
    }

    // Campaign basics form (always shown)
    html += _buildSWStep7CampaignForm(ws);

    if (aiLoading) {
      html += _buildSWTreeSkeleton();
      return html;
    }

    // Ad-set tree
    var sets = ws.ad_sets || [];

    if (mode === 'manual') {
      html += _buildSWStep7ManualTree(ws, sets);
    } else if (generated && !sets.length) {
      html += _swAIEmptyAfterGenBanner('ad sets', ws._campaignTreeContext || '');
    } else if (!sets.length) {
      html += '<div class="cp-sw-empty-state">';
      html += '<div class="cp-sw-empty-icon">' + icon('sitemap') + '</div>';
      html += '<p>Click <strong>Generate with AI</strong> to draft your Campaign tree — 1 Campaign + 2-3 Ad Sets + 2-3 Ads each, based on your selected library.</p>';
      html += '</div>';
    } else {
      html += _buildSWStep7AITree(ws, sets);
    }

    return html;
  }

  // Campaign-level form (name, objective, budget, brief)
  function _buildSWStep7CampaignForm(ws) {
    var cam   = ws.campaign || {};
    var C     = Constants;
    var html  = '<div class="cp-sw-form cp-sw-step7-form">';

    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Campaign Name <span class="cp-required">*</span></label>';
    html += '<input type="text" class="cp-input" data-sw-field="campaign.name"';
    html += ' placeholder="e.g., Q3 Lead Gen" value="' + esc(cam.name || '') + '" autocomplete="off">';
    html += '</div>';

    html += '<div class="cp-sw-field-row">';
    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Objective</label>';
    html += '<select class="cp-select" data-sw-field="campaign.objective">';
    for (var ok in C.META_OBJECTIVES) {
      var oSel = (cam.objective === ok) ? ' selected' : (!cam.objective && ok === 'OUTCOME_LEADS' ? ' selected' : '');
      html += '<option value="' + esc(ok) + '"' + oSel + '>' + esc(C.META_OBJECTIVES[ok].label) + '</option>';
    }
    html += '</select>';
    html += '</div>';

    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Budget mode</label>';
    html += '<select class="cp-select" data-sw-field="campaign.budget_mode">';
    for (var bmk in C.META_BUDGET_MODES) {
      var bmSel = (cam.budget_mode === bmk) ? ' selected' : (!cam.budget_mode && bmk === 'CBO' ? ' selected' : '');
      html += '<option value="' + esc(bmk) + '"' + bmSel + '>' + esc(C.META_BUDGET_MODES[bmk].label) + ' (' + esc(C.META_BUDGET_MODES[bmk].short) + ')</option>';
    }
    html += '</select>';
    html += '</div>';
    html += '</div>';

    html += '<div class="cp-sw-field-row">';
    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Daily budget</label>';
    html += '<input type="number" class="cp-input" data-sw-field="campaign.daily_budget"';
    html += ' min="0" step="1" placeholder="0" value="' + esc(cam.daily_budget != null ? cam.daily_budget : '') + '">';
    html += '</div>';
    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Start date</label>';
    html += '<input type="date" class="cp-input" data-sw-field="campaign.start_time" value="' + esc(cam.start_time || '') + '">';
    html += '</div>';
    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">End date</label>';
    html += '<input type="date" class="cp-input" data-sw-field="campaign.stop_time" value="' + esc(cam.stop_time || '') + '">';
    html += '</div>';
    html += '</div>';

    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Brief</label>';
    html += '<textarea class="cp-textarea" data-sw-field="campaign.brief" rows="2"';
    html += ' placeholder="2-3 sentence campaign brief — context for the creative team and AI assists.">';
    html += esc(cam.brief || '');
    html += '</textarea>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  // AI-mode tree skeleton (1 campaign + 2 sets + ~4 ads)
  function _buildSWTreeSkeleton() {
    var html = '<div class="cp-sw-tree-skeleton">';
    for (var s = 0; s < 2; s++) {
      html += '<div class="cp-sw-tree-set cp-sw-skeleton-card">';
      html += '<div class="cp-sw-skeleton-line cp-sw-skeleton-line--title"></div>';
      html += '<div class="cp-sw-skeleton-line"></div>';
      for (var a = 0; a < 2; a++) {
        html += '<div class="cp-sw-tree-ad cp-sw-skeleton-card">';
        html += '<div class="cp-sw-skeleton-line"></div>';
        html += '<div class="cp-sw-skeleton-line cp-sw-skeleton-line--short"></div>';
        html += '</div>';
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  // AI-mode rendered tree (read-only-ish cards with selection toggles)
  function _buildSWStep7AITree(ws, sets) {
    var selPersonas = (ws.personas || []).filter(function(p) { return p._selected; });
    var selMessages = (ws.messages || []).filter(function(m) { return m._selected; });
    var totalSets = sets.filter(function(s) { return s._selected; }).length;
    var totalAds = 0;
    sets.forEach(function(s) { if (s._selected) totalAds += (s.ads || []).filter(function(a) { return a._selected; }).length; });

    var html = '<div class="cp-sw-card-bottom">';
    html += '<span class="cp-sw-sel-count' + (totalSets > 0 ? ' cp-sw-sel-count--ok' : '') + '">';
    html += 'Will create 1 Campaign · ' + totalSets + ' Ad Set' + (totalSets !== 1 ? 's' : '') + ' · ' + totalAds + ' Ad' + (totalAds !== 1 ? 's' : '');
    html += '</span>';
    html += _swLastGeneratedLabel(7);
    html += '</div>';

    html += '<div class="cp-sw-tree">';
    for (var i = 0; i < sets.length; i++) {
      html += _buildSWAdSetCard(sets[i], i, selPersonas, selMessages);
    }
    html += '</div>';

    return html;
  }

  function _buildSWAdSetCard(adSet, idx, selPersonas, selMessages) {
    var selected = adSet._selected;
    var setKey = 'set_' + idx;
    var setExpanded = setupWizardState._expandedCards[setKey];
    var persona = (selPersonas || [])[adSet.persona_idx] || null;
    var goal = Constants.META_OPTIMIZATION_GOALS[adSet.optimization_goal];
    var ads = adSet.ads || [];
    var selAds = ads.filter(function(a) { return a._selected; }).length;
    var brief = adSet.brief || {};

    var html = '<div class="cp-sw-tree-set' + (selected ? ' cp-sw-tree-set--selected' : '') + '">';

    // Header row
    html += '<div class="cp-sw-tree-set-header">';
    html += '<button class="cp-sw-tree-check' + (selected ? ' cp-sw-tree-check--on' : '') + '" data-action="sw-tree-ad-set-toggle" data-set-idx="' + idx + '" aria-label="Toggle Ad Set">';
    html += selected ? icon('check') : '';
    html += '</button>';
    html += '<div class="cp-sw-tree-set-title">';
    html += '<div class="cp-sw-tree-set-name">' + icon('crosshairs') + ' ' + esc(adSet.name || ('Ad Set ' + (idx + 1))) + '</div>';
    html += '<div class="cp-sw-tree-set-meta">';
    if (persona) html += '<span class="cp-sw-tree-set-tag">' + icon('user') + ' ' + esc(truncate(persona.name || '', 28)) + '</span>';
    if (goal)    html += '<span class="cp-sw-tree-set-tag">' + icon('bullseye') + ' ' + esc(goal.label) + '</span>';
    html += '<span class="cp-sw-tree-set-tag">' + selAds + '/' + ads.length + ' ads selected</span>';
    html += '</div>';
    html += '</div>';
    html += '<button class="cp-sw-tree-expand" data-action="sw-tree-expand" data-key="' + setKey + '">';
    html += icon(setExpanded ? 'chevron-up' : 'chevron-down') + ' ' + (setExpanded ? 'Hide brief' : 'Brief');
    html += '</button>';
    html += '</div>';

    // Expanded brief
    if (setExpanded) {
      html += '<div class="cp-sw-tree-set-brief">';
      if (brief.creative_direction) {
        html += '<div class="cp-sw-tree-brief-row"><span class="cp-sw-tree-brief-label">Creative direction</span><p>' + esc(brief.creative_direction) + '</p></div>';
      }
      if (brief.hook_angles && brief.hook_angles.length) {
        html += '<div class="cp-sw-tree-brief-row"><span class="cp-sw-tree-brief-label">Hook angles</span><ul>';
        brief.hook_angles.forEach(function(h) { html += '<li>' + esc(h) + '</li>'; });
        html += '</ul></div>';
      }
      if (brief.message_idx_list && brief.message_idx_list.length) {
        html += '<div class="cp-sw-tree-brief-row"><span class="cp-sw-tree-brief-label">Messages</span><div>';
        brief.message_idx_list.forEach(function(mi) {
          var m = (selMessages || [])[mi];
          if (m) html += '<span class="cp-badge cp-sw-tree-brief-badge">' + esc(m.name) + '</span>';
        });
        html += '</div></div>';
      }
      if (brief.ai_notes) {
        html += '<div class="cp-sw-tree-brief-row"><span class="cp-sw-tree-brief-label">AI notes</span><p>' + esc(brief.ai_notes) + '</p></div>';
      }
      if (adSet.audience_overrides) {
        html += '<div class="cp-sw-tree-brief-row"><span class="cp-sw-tree-brief-label">Audience overrides</span><p>' + esc(adSet.audience_overrides) + '</p></div>';
      }
      html += '</div>';
    }

    // Ads
    html += '<div class="cp-sw-tree-ads">';
    for (var j = 0; j < ads.length; j++) {
      html += _buildSWAdCard(ads[j], idx, j);
    }
    html += '</div>';

    html += '</div>';
    return html;
  }

  function _buildSWAdCard(ad, setIdx, adIdx) {
    var selected = ad._selected;
    var adKey = 'ad_' + setIdx + '_' + adIdx;
    var adExpanded = setupWizardState._expandedCards[adKey];
    var creative = ad.creative || {};
    var hook = ad.hook || {};
    var ctype = Constants.META_AD_CREATIVE_TYPES[ad.creative_type] || { label: 'Ad', icon: 'rectangle-ad' };
    var cta   = Constants.META_CTA_TYPES[creative.cta_type];

    var html = '<div class="cp-sw-tree-ad' + (selected ? ' cp-sw-tree-ad--selected' : '') + '">';

    html += '<div class="cp-sw-tree-ad-header">';
    html += '<button class="cp-sw-tree-check cp-sw-tree-check--sm' + (selected ? ' cp-sw-tree-check--on' : '') + '" data-action="sw-tree-ad-toggle" data-set-idx="' + setIdx + '" data-ad-idx="' + adIdx + '" aria-label="Toggle Ad">';
    html += selected ? icon('check') : '';
    html += '</button>';
    html += '<div class="cp-sw-tree-ad-body">';
    html += '<div class="cp-sw-tree-ad-name">' + icon(ctype.icon) + ' ' + esc(ad.name || ('Ad ' + (adIdx + 1))) + '</div>';
    if (hook.text) {
      html += '<blockquote class="cp-sw-tree-ad-hook">' + esc(hook.text) + '</blockquote>';
    }
    if (creative.primary_text) {
      html += '<div class="cp-sw-tree-ad-text">' + esc(truncate(creative.primary_text, 160)) + '</div>';
    }
    html += '<div class="cp-sw-tree-ad-meta">';
    if (creative.headline)   html += '<span class="cp-sw-tree-ad-meta-item"><strong>H:</strong> ' + esc(creative.headline) + '</span>';
    if (cta)                 html += '<span class="cp-sw-tree-ad-meta-item cp-sw-tree-ad-cta">' + esc(cta.label) + '</span>';
    if (hook.type)           html += '<span class="cp-sw-tree-ad-meta-item">' + esc(hook.type) + '</span>';
    html += '</div>';
    html += '</div>';
    html += '<button class="cp-sw-tree-expand cp-sw-tree-expand--sm" data-action="sw-tree-expand" data-key="' + adKey + '" aria-label="Toggle details">';
    html += icon(adExpanded ? 'chevron-up' : 'chevron-down');
    html += '</button>';
    html += '</div>';

    if (adExpanded) {
      html += '<div class="cp-sw-tree-ad-detail">';
      if (creative.description) html += '<p><strong>Description:</strong> ' + esc(creative.description) + '</p>';
      var media = ad.media || {};
      if (media.image_brief)   html += '<p><strong>Image brief:</strong> ' + esc(media.image_brief) + '</p>';
      if (media.image_prompt)  html += '<p><strong>Image prompt:</strong> ' + esc(media.image_prompt) + '</p>';
      if (media.video_concept) html += '<p><strong>Video concept:</strong> ' + esc(media.video_concept) + '</p>';
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  // Manual-mode tree — minimal form for each ad_set with persona dropdown + ads.
  function _buildSWStep7ManualTree(ws, sets) {
    var selPersonas = (ws.personas || []).filter(function(p) { return p._selected; });

    var totalSets = sets.filter(function(s) { return s._selected; }).length;
    var totalAds = 0;
    sets.forEach(function(s) { if (s._selected) totalAds += (s.ads || []).filter(function(a) { return a._selected; }).length; });

    var html = '<div class="cp-sw-card-bottom">';
    html += '<span class="cp-sw-sel-count' + (totalSets > 0 ? ' cp-sw-sel-count--ok' : '') + '">';
    html += '1 Campaign · ' + totalSets + ' Ad Set' + (totalSets !== 1 ? 's' : '') + ' · ' + totalAds + ' Ad' + (totalAds !== 1 ? 's' : '');
    html += '</span>';
    html += '<button class="cp-btn cp-btn-sm cp-btn-primary" data-action="sw-manual-add-ad-set">' + icon('plus') + ' Add Ad Set</button>';
    html += '</div>';

    if (!sets.length) {
      html += '<div class="cp-sw-empty-state">';
      html += '<div class="cp-sw-empty-icon">' + icon('crosshairs') + '</div>';
      html += '<p>Click <strong>Add Ad Set</strong> to start building your tree by hand. Each Ad Set needs at least one Ad.</p>';
      html += '</div>';
      return html;
    }

    html += '<div class="cp-sw-tree">';
    for (var i = 0; i < sets.length; i++) {
      html += _buildSWManualAdSetCard(sets[i], i, selPersonas);
    }
    html += '</div>';

    return html;
  }

  function _buildSWManualAdSetCard(adSet, idx, selPersonas) {
    var html = '<div class="cp-sw-tree-set cp-sw-tree-set--manual' + (adSet._selected ? ' cp-sw-tree-set--selected' : '') + '">';

    // Header with toggle + delete
    html += '<div class="cp-sw-tree-set-header">';
    html += '<button class="cp-sw-tree-check' + (adSet._selected ? ' cp-sw-tree-check--on' : '') + '" data-action="sw-tree-ad-set-toggle" data-set-idx="' + idx + '" aria-label="Toggle Ad Set">';
    html += adSet._selected ? icon('check') : '';
    html += '</button>';
    html += '<div class="cp-sw-tree-set-title" style="flex:1">';
    html += '<input type="text" class="cp-input cp-input-sm" data-sw-set-field="name" data-set-idx="' + idx + '" value="' + esc(adSet.name || '') + '" placeholder="Ad Set name">';
    html += '</div>';
    html += '<button class="cp-btn-icon cp-btn-icon-sm" data-action="sw-manual-delete-ad-set" data-set-idx="' + idx + '" title="Delete Ad Set">' + icon('trash') + '</button>';
    html += '</div>';

    // Persona + optimization goal row
    html += '<div class="cp-sw-tree-set-fields">';
    html += '<div class="cp-field cp-field-inline">';
    html += '<label class="cp-field-label">Persona</label>';
    html += '<select class="cp-select cp-select-sm" data-sw-set-field="persona_idx" data-set-idx="' + idx + '">';
    if (!selPersonas.length) {
      html += '<option value="0">(no personas selected)</option>';
    } else {
      for (var p = 0; p < selPersonas.length; p++) {
        html += '<option value="' + p + '"' + (adSet.persona_idx === p ? ' selected' : '') + '>' + esc(selPersonas[p].name || ('Persona ' + (p + 1))) + '</option>';
      }
    }
    html += '</select></div>';

    html += '<div class="cp-field cp-field-inline">';
    html += '<label class="cp-field-label">Optimization goal</label>';
    html += '<select class="cp-select cp-select-sm" data-sw-set-field="optimization_goal" data-set-idx="' + idx + '">';
    for (var gk in Constants.META_OPTIMIZATION_GOALS) {
      html += '<option value="' + esc(gk) + '"' + (adSet.optimization_goal === gk ? ' selected' : '') + '>' + esc(Constants.META_OPTIMIZATION_GOALS[gk].label) + '</option>';
    }
    html += '</select></div>';
    html += '</div>';

    // Ads
    html += '<div class="cp-sw-tree-ads">';
    var ads = adSet.ads || [];
    for (var j = 0; j < ads.length; j++) {
      html += _buildSWAdCard(ads[j], idx, j);
    }
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm cp-sw-tree-add-ad" data-action="sw-manual-add-ad" data-set-idx="' + idx + '">' + icon('plus') + ' Add Ad</button>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  // --- Step 8: Review & Launch ---

  function renderSWStep8() {
    var ws         = setupWizardState;
    var selPersonas = (ws.personas    || []).filter(function(p) { return p._selected; });
    var selPPs      = (ws.pain_points || []).filter(function(p) { return p._selected; });
    var selMessages = (ws.messages    || []).filter(function(m) { return m._selected; });
    var selStyles   = (ws.styles      || []).filter(function(s) { return s._selected; });
    var selFormats  = (ws.formats     || []).filter(function(f) { return f._selected; });
    var selSets     = (ws.ad_sets     || []).filter(function(s) { return s._selected; });
    var selAds      = [];
    selSets.forEach(function(s) { selAds = selAds.concat((s.ads || []).filter(function(a) { return a._selected; })); });

    var html = _buildSWStepHeader(
      'Review &amp; Launch',
      'Final check before we create your Campaign tree. Everything below will be created on Launch.',
      'c'
    );

    // Finalizing progress state
    if (ws.finalizing) {
      html += '<div class="cp-sw-finalize-progress">';
      html += '<div class="cp-sw-finalize-spinner">' + icon('loader') + '</div>';
      html += '<p class="cp-sw-finalize-msg">' + esc(ws.finalizeMsg || 'Setting up your workspace…') + '</p>';
      html += '</div>';
      return html;
    }

    // Summary stats grid
    html += '<div class="cp-sw-review-grid">';
    html += _buildSWReviewBox('users',         'Personas',    selPersonas.length, selPersonas.map(function(p) { return p.name; }));
    html += _buildSWReviewBox('crosshair',     'Pain Points', selPPs.length,      selPPs.map(function(p) { return p.pain_point; }));
    html += _buildSWReviewBox('message-square','Messages',    selMessages.length, selMessages.map(function(m) { return m.name; }));
    html += _buildSWReviewBox('palette',       'Styles',      selStyles.length,   selStyles.map(function(s) { return s.name; }));
    html += _buildSWReviewBox('clapperboard',  'Formats',     selFormats.length,  selFormats.map(function(f) { return f.name; }));
    html += _buildSWReviewBox('crosshairs',    'Ad Sets',     selSets.length,     selSets.map(function(s) { return s.name; }));
    html += _buildSWReviewBox('rectangle-ad',  'Ads',         selAds.length,      selAds.map(function(a) { return a.name; }));
    html += '</div>';

    // Campaign info box
    var cam = ws.campaign || {};
    if (cam.name) {
      var objLabel = (Constants.META_OBJECTIVES[cam.objective] || {}).label || cam.objective || '';
      var bmLabel = (Constants.META_BUDGET_MODES[cam.budget_mode] || {}).short || cam.budget_mode || '';
      html += '<div class="cp-sw-info-box cp-sw-info-box--success" style="margin-top:var(--cp-space-4)">';
      html += icon('bullhorn') + ' <strong>' + esc(cam.name) + '</strong>';
      if (objLabel) html += ' &nbsp;&middot;&nbsp; ' + esc(objLabel);
      if (bmLabel)  html += ' &nbsp;&middot;&nbsp; ' + esc(bmLabel);
      if (cam.daily_budget) html += ' &nbsp;&middot;&nbsp; ' + esc(String(cam.daily_budget)) + '/day';
      if (cam.start_time && cam.stop_time) html += ' &nbsp;&middot;&nbsp; ' + esc(cam.start_time) + ' → ' + esc(cam.stop_time);
      html += '</div>';
    }

    // Launch note
    html += '<p class="cp-sw-finalize-note" style="margin-top:var(--cp-space-5);text-align:center">';
    html += 'Hit <strong>Launch Workspace</strong> below to create your Campaign with ' + selSets.length + ' Ad Set' + (selSets.length !== 1 ? 's' : '');
    html += ' and ' + selAds.length + ' Ad' + (selAds.length !== 1 ? 's' : '') + '.';
    html += '</p>';

    return html;
  }

  function _buildSWReviewBox(iconName, label, count, names) {
    var html = '<div class="cp-sw-review-box">';
    html += '<div class="cp-sw-review-box-icon">' + icon(iconName) + '</div>';
    html += '<div class="cp-sw-review-box-count">' + count + '</div>';
    html += '<div class="cp-sw-review-box-label">' + esc(label) + '</div>';
    if (names && names.length) {
      html += '<div class="cp-sw-review-box-names">';
      var show = names.slice(0, 3);
      for (var i = 0; i < show.length; i++) {
        html += '<span>' + esc(truncate(show[i] || '', 30)) + '</span>';
      }
      if (names.length > 3) html += '<span>+' + (names.length - 3) + ' more</span>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }
