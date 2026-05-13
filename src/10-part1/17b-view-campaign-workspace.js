  // ============================================================
  // SECTION 15C: CAMPAIGN WORKSPACE VIEW (v2)
  // ============================================================
  //
  // Two-pane layout: left = Campaign tree (Campaign → Ad Sets → Ads),
  // right = inspector for the currently-selected node. Selection is driven
  // by S.selectedCampaignV2Id, S.selectedAdSetId, S.selectedAdId.

  function renderCampaignWorkspaceView() {
    var camp = S.campaignV2Map[S.selectedCampaignV2Id];

    // Fallback: if no campaign selected, redirect to list view
    if (!camp) {
      return '<div class="cp-view cp-view-workspace">' +
        '<div class="cp-empty-state cp-empty-state--center">' +
        '<div class="cp-empty-state-icon">' + icon('bullhorn') + '</div>' +
        '<div class="cp-empty-state-title">Pick a campaign to start</div>' +
        '<div class="cp-empty-state-text">Open the Campaigns list and select one, or create a new campaign.</div>' +
        '<div style="display:flex;gap:var(--cp-space-2);justify-content:center;margin-top:var(--cp-space-3)">' +
        '<button class="cp-btn cp-btn-outline" data-action="go-view" data-view="meta_campaigns">' + icon('arrow-left') + ' Campaigns</button>' +
        '<button class="cp-btn cp-btn-primary" data-action="new-campaign-v2">' + icon('plus') + ' New Campaign</button>' +
        '</div></div></div>';
    }

    var html = '<div class="cp-view cp-view-workspace">';

    // Workspace header — breadcrumbs + actions
    html += renderWorkspaceBreadcrumbs(camp);

    // Two-pane body
    html += '<div class="cp-workspace-body">';
    html += '<div class="cp-workspace-tree-pane">' + renderWorkspaceTree(camp) + '</div>';
    html += '<div class="cp-workspace-inspector-pane">' + renderWorkspaceInspector(camp) + '</div>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderWorkspaceBreadcrumbs(camp) {
    var adSet = S.adSetMap[S.selectedAdSetId];
    var ad = S.adMap[S.selectedAdId];

    var html = '<div class="cp-workspace-breadcrumbs">';
    html += '<a class="cp-workspace-breadcrumb" data-action="go-view" data-view="meta_campaigns" href="#meta_campaigns">' + icon('bullhorn') + ' Campaigns</a>';
    html += '<span class="cp-workspace-breadcrumb-sep">' + icon('chevron-right') + '</span>';
    html += '<a class="cp-workspace-breadcrumb cp-workspace-breadcrumb-current" data-action="ws-select-campaign" data-id="' + esc(camp.id) + '">' + esc(camp.name || 'Untitled') + '</a>';
    if (adSet) {
      html += '<span class="cp-workspace-breadcrumb-sep">' + icon('chevron-right') + '</span>';
      html += '<a class="cp-workspace-breadcrumb' + (!ad ? ' cp-workspace-breadcrumb-current' : '') + '" data-action="ws-select-ad-set" data-id="' + esc(adSet.id) + '">' + esc(adSet.name || 'Ad Set') + '</a>';
    }
    if (ad) {
      html += '<span class="cp-workspace-breadcrumb-sep">' + icon('chevron-right') + '</span>';
      html += '<span class="cp-workspace-breadcrumb cp-workspace-breadcrumb-current">' + esc(ad.name || 'Ad') + '</span>';
    }
    html += '</div>';
    return html;
  }

  function renderWorkspaceTree(camp) {
    var html = '';
    var sets = getAdSetsByCampaign(camp.id);
    var collapsed = S.workspaceTreeCollapsed || (S.workspaceTreeCollapsed = {});

    // Tree toolbar
    html += '<div class="cp-tree-toolbar">';
    html += '<div class="cp-tree-toolbar-title">' + icon('sitemap') + ' Tree</div>';
    html += '<button class="cp-btn-icon cp-btn-icon-sm" data-action="ws-add-ad-set" data-campaign-id="' + esc(camp.id) + '" title="Add Ad Set">' + icon('plus') + '</button>';
    html += '</div>';

    // Campaign node (root)
    var campSelected = (!S.selectedAdSetId && !S.selectedAdId);
    var campStatus = metaCampaignStatus(camp.status);
    html += '<div class="cp-tree-node cp-tree-node-campaign' + (campSelected ? ' cp-tree-node-selected' : '') + '" data-action="ws-select-campaign" data-id="' + esc(camp.id) + '">';
    html += '<span class="cp-tree-node-icon">' + icon('bullhorn') + '</span>';
    html += '<span class="cp-tree-node-label">' + esc(camp.name || 'Untitled') + '</span>';
    html += '<span class="cp-tree-node-meta">';
    html += '<span class="cp-tree-status-dot" style="background:' + campStatus.color + '" title="' + esc(campStatus.label) + '"></span>';
    html += '<span class="cp-tree-node-count">' + sets.length + '</span>';
    html += '</span>';
    html += '</div>';

    // Ad Set nodes
    if (sets.length === 0) {
      html += '<div class="cp-tree-empty-hint">';
      html += icon('arrow-down') + ' No Ad Sets yet. ';
      html += '<a href="#" data-action="ws-add-ad-set" data-campaign-id="' + esc(camp.id) + '">Add one</a>';
      html += '</div>';
    } else {
      for (var i = 0; i < sets.length; i++) html += renderTreeAdSetNode(sets[i], collapsed);
    }

    return html;
  }

  function renderTreeAdSetNode(adSet, collapsed) {
    var ads = getAdsByAdSet(adSet.id);
    var isCollapsed = !!collapsed[adSet.id];
    var setSelected = (S.selectedAdSetId === adSet.id && !S.selectedAdId);
    var setStatus = metaAdSetStatus(adSet.status);
    var persona = S.personaMap[adSet.persona_id];

    var html = '<div class="cp-tree-branch">';

    html += '<div class="cp-tree-node cp-tree-node-ad-set' + (setSelected ? ' cp-tree-node-selected' : '') + '" data-action="ws-select-ad-set" data-id="' + esc(adSet.id) + '">';
    html += '<button class="cp-tree-toggle' + (isCollapsed ? ' cp-tree-toggle-collapsed' : '') + '" data-action="ws-toggle-tree" data-id="' + esc(adSet.id) + '">' + icon(isCollapsed ? 'chevron-right' : 'chevron-down') + '</button>';
    html += '<span class="cp-tree-node-icon">' + icon('crosshairs') + '</span>';
    html += '<span class="cp-tree-node-label">' + esc(adSet.name || 'Ad Set') + '</span>';
    if (adSet.ab_role) {
      var ab = META_AB_ROLES[adSet.ab_role];
      if (ab) html += '<span class="cp-tree-ab-pill" style="background:' + ab.color + '15;color:' + ab.color + '">' + esc(ab.label) + '</span>';
    }
    html += '<span class="cp-tree-node-meta">';
    if (persona) html += '<span class="cp-tree-node-sub" title="Persona">' + icon('user') + ' ' + esc(truncate(persona.name, 14)) + '</span>';
    html += '<span class="cp-tree-status-dot" style="background:' + setStatus.color + '" title="' + esc(setStatus.label) + '"></span>';
    html += '<span class="cp-tree-node-count">' + ads.length + '</span>';
    html += '</span>';
    html += '</div>';

    // Children (ads)
    if (!isCollapsed) {
      html += '<div class="cp-tree-children">';
      for (var i = 0; i < ads.length; i++) html += renderTreeAdNode(ads[i]);
      html += '<button class="cp-tree-add-child" data-action="ws-add-ad" data-ad-set-id="' + esc(adSet.id) + '">' + icon('plus') + ' Add Ad</button>';
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  function renderTreeAdNode(ad) {
    var selected = (S.selectedAdId === ad.id);
    var status = metaAdStatus(ad.pipeline_status);
    var ctype = META_AD_CREATIVE_TYPES[ad.creative_type] || { icon: 'rectangle-ad' };

    var html = '<div class="cp-tree-node cp-tree-node-ad' + (selected ? ' cp-tree-node-selected' : '') + '" data-action="ws-select-ad" data-id="' + esc(ad.id) + '">';
    html += '<span class="cp-tree-node-icon">' + icon(ctype.icon) + '</span>';
    html += '<span class="cp-tree-node-label">' + esc(ad.name || 'Ad') + '</span>';
    html += '<span class="cp-tree-node-meta">';
    html += '<span class="cp-tree-status-dot" style="background:' + status.color + '" title="' + esc(status.label) + '"></span>';
    html += '</span>';
    html += '</div>';
    return html;
  }

  // --- Inspector ---

  function renderWorkspaceInspector(camp) {
    if (S.selectedAdId) {
      var ad = S.adMap[S.selectedAdId];
      if (ad) return renderInspectorForAdTabbed(ad);
    }
    if (S.selectedAdSetId) {
      var adSet = S.adSetMap[S.selectedAdSetId];
      if (adSet) return renderInspectorForAdSetTabbed(adSet);
    }
    return renderInspectorForCampaign(camp);
  }

  function renderInspectorForCampaign(camp) {
    var status = metaCampaignStatus(camp.status);
    var objective = metaObjective(camp.objective) || { label: '—' };
    var buying = META_BUYING_TYPES[camp.buying_type] || { label: '—' };
    var budgetMode = META_BUDGET_MODES[camp.budget_mode] || { label: '—' };
    var bid = META_BID_STRATEGIES[camp.bid_strategy] || { label: '—' };
    var sets = getAdSetsByCampaign(camp.id);
    var ads = getAdsByCampaign(camp.id);

    var html = '';
    html += '<div class="cp-inspector-header"><div>';
    html += '<div class="cp-inspector-eyebrow">' + icon('bullhorn') + ' Campaign</div>';
    html += '<h2 class="cp-inspector-title">' + esc(camp.name) + '</h2>';
    html += '<div style="display:flex;gap:var(--cp-space-2);flex-wrap:wrap;margin-top:6px">';
    html += '<span class="cp-badge" style="background:' + status.color + '15;color:' + status.color + '">' + icon(status.icon) + ' ' + esc(status.label) + '</span>';
    html += '<span class="cp-badge" style="background:#1a73e815;color:#1a73e8">' + esc(objective.label) + '</span>';
    if (camp.ab_test && camp.ab_test.enabled) html += '<span class="cp-badge" style="background:#9334e915;color:#9334e9">' + icon('flask') + ' A/B</span>';
    html += '</div>';
    html += '</div><div class="cp-inspector-header-actions">';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="edit-campaign-v2" data-id="' + esc(camp.id) + '">' + icon('edit') + ' Edit</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="delete-campaign-v2" data-id="' + esc(camp.id) + '">' + icon('trash') + '</button>';
    html += '</div></div>';

    // Stats strip
    html += '<div class="cp-inspector-stats">';
    html += '<div class="cp-inspector-stat"><div class="cp-inspector-stat-value">' + sets.length + '</div><div class="cp-inspector-stat-label">Ad Sets</div></div>';
    html += '<div class="cp-inspector-stat"><div class="cp-inspector-stat-value">' + ads.length + '</div><div class="cp-inspector-stat-label">Ads</div></div>';
    var live = ads.filter(function(a) { return a.pipeline_status === 'live'; }).length;
    var approved = ads.filter(function(a) { return a.pipeline_status === 'approved'; }).length;
    html += '<div class="cp-inspector-stat"><div class="cp-inspector-stat-value" style="color:var(--cp-success)">' + approved + '</div><div class="cp-inspector-stat-label">Approved</div></div>';
    html += '<div class="cp-inspector-stat"><div class="cp-inspector-stat-value" style="color:#0891b2">' + live + '</div><div class="cp-inspector-stat-label">Live</div></div>';
    html += '</div>';

    // Empty-campaign CTA — campaigns created from the setup wizard start empty
    // (no Ad Sets, no Ads). The per-campaign wizard fills them out.
    if (sets.length === 0) {
      html += '<div class="cp-inspector-section cp-empty-campaign-cta" style="background:linear-gradient(135deg,#f0f7ff 0%,#fff7e6 100%);border:1px dashed var(--cp-primary,#1a73e8);border-radius:var(--cp-radius-md);padding:var(--cp-space-4);margin-top:var(--cp-space-3)">';
      html += '<div style="display:flex;align-items:flex-start;gap:var(--cp-space-3)">';
      html += '<div style="font-size:32px;line-height:1">' + icon('rocket') + '</div>';
      html += '<div style="flex:1">';
      html += '<div style="font-weight:600;font-size:var(--cp-font-size-base);margin-bottom:var(--cp-space-1)">This campaign is empty.</div>';
      html += '<div class="cp-text-muted" style="font-size:var(--cp-font-size-sm);margin-bottom:var(--cp-space-3)">Run the AI setup for this campaign to generate Ad Sets and Ads from your brief, or add them manually.</div>';
      html += '<div style="display:flex;gap:var(--cp-space-2);flex-wrap:wrap">';
      html += '<button class="cp-btn cp-btn-ai" data-action="ai-suggest-ad-sets" data-campaign-id="' + esc(camp.id) + '">' + icon('sparkles') + ' AI Setup for this campaign</button>';
      html += '<button class="cp-btn cp-btn-outline" data-action="ws-add-ad-set" data-campaign-id="' + esc(camp.id) + '">' + icon('plus') + ' Add Ad Set manually</button>';
      html += '</div>';
      html += '</div></div></div>';
    }

    // Description
    if (camp.description) {
      html += '<div class="cp-inspector-section"><p>' + esc(camp.description) + '</p></div>';
    }

    // Meta-shaped settings grid
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('gear') + ' Campaign settings</div>';
    html += '<div class="cp-inspector-grid">';
    html += inspectorField('Objective', objective.label);
    html += inspectorField('Buying type', buying.label);
    html += inspectorField('Budget mode', budgetMode.label);
    html += inspectorField('Bid strategy', bid.label);
    html += inspectorField('Daily budget', camp.daily_budget ? formatCurrency(camp.daily_budget) : '—');
    html += inspectorField('Lifetime budget', camp.lifetime_budget ? formatCurrency(camp.lifetime_budget) : '—');
    html += inspectorField('Spend cap', camp.spend_cap ? formatCurrency(camp.spend_cap) : '—');
    html += inspectorField('Schedule', renderScheduleSummary(camp.start_time, camp.stop_time));
    var cats = (camp.special_ad_categories || []).filter(function(c) { return c && c !== 'NONE'; });
    html += inspectorField('Special ad categories', cats.length ? cats.map(function(k) { return (META_SPECIAL_AD_CATEGORIES[k] || {}).label || k; }).join(', ') : 'None');
    html += '</div></div>';

    // Brief
    if (camp.brief || camp.ai_instructions) {
      html += '<div class="cp-inspector-section">';
      if (camp.brief) {
        html += '<div class="cp-inspector-section-title">' + icon('file-lines') + ' Brief</div>';
        html += '<p>' + esc(camp.brief) + '</p>';
      }
      if (camp.ai_instructions) {
        html += '<div class="cp-inspector-section-title" style="margin-top:var(--cp-space-3)">' + icon('sparkles') + ' AI instructions</div>';
        html += '<p>' + esc(camp.ai_instructions) + '</p>';
      }
      html += '</div>';
    }

    // A/B test summary section
    html += renderCampaignABSection(camp);

    // Quick actions
    html += '<div class="cp-inspector-actions">';
    html += '<button class="cp-btn cp-btn-primary" data-action="ws-add-ad-set" data-campaign-id="' + esc(camp.id) + '">' + icon('plus') + ' Add Ad Set</button>';
    html += '<button class="cp-btn cp-btn-ai" data-action="ai-suggest-ad-sets" data-campaign-id="' + esc(camp.id) + '">' + icon('sparkles') + ' Suggest Ad Sets</button>';
    html += '<button class="cp-btn cp-btn-outline" data-action="ws-ab-config" data-id="' + esc(camp.id) + '">' + icon('flask') + ' A/B test setup</button>';
    html += '<button class="cp-btn cp-btn-outline" data-action="v2-export-open" data-campaign-id="' + esc(camp.id) + '">' + icon('download') + ' Export</button>';
    html += '</div>';

    return html;
  }

  function renderCampaignABSection(camp) {
    var ab = camp.ab_test || {};
    if (!ab.enabled || !(ab.variants || []).length) return '';
    var metric = (Constants.META_AB_METRICS[ab.primary_metric] || {}).label || '—';
    var winner = (ab.variants || []).find(function(v) { return v.winner; });
    var winnerSet = winner ? S.adSetMap[winner.ad_set_id] : null;

    var html = '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('flask') + ' A/B test';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="ws-ab-compare" data-id="' + esc(camp.id) + '" style="margin-left:auto">' + icon('arrows-up-down-left-right') + ' Compare variants</button>';
    html += '</div>';
    html += '<div class="cp-inspector-grid">';
    html += inspectorField('Primary metric', metric);
    html += inspectorField('Variants', String((ab.variants || []).length));
    if (winnerSet) html += inspectorField('Winner', winnerSet.name);
    html += '</div>';
    html += '</div>';
    return html;
  }

  function renderInspectorForAdSet(adSet) {
    var camp = S.campaignV2Map[adSet.campaign_id];
    var status = metaAdSetStatus(adSet.status);
    var goal = metaOptimizationGoal(adSet.optimization_goal) || { label: '—' };
    var billing = metaBillingEvent(adSet.billing_event) || { label: '—' };
    var persona = S.personaMap[adSet.persona_id];
    var ads = getAdsByAdSet(adSet.id);

    var html = '';
    html += '<div class="cp-inspector-header"><div>';
    html += '<div class="cp-inspector-eyebrow">' + icon('crosshairs') + ' Ad Set' + (camp ? ' · ' + esc(camp.name) : '') + '</div>';
    html += '<h2 class="cp-inspector-title">' + esc(adSet.name) + '</h2>';
    html += '<div style="display:flex;gap:var(--cp-space-2);flex-wrap:wrap;margin-top:6px">';
    html += '<span class="cp-badge" style="background:' + status.color + '15;color:' + status.color + '">' + icon(status.icon) + ' ' + esc(status.label) + '</span>';
    if (adSet.ab_role) {
      var ab = META_AB_ROLES[adSet.ab_role];
      if (ab) html += '<span class="cp-badge" style="background:' + ab.color + '15;color:' + ab.color + '">' + icon('flask') + ' ' + esc(ab.label) + '</span>';
    }
    html += '</div></div><div class="cp-inspector-header-actions">';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="edit-ad-set" data-id="' + esc(adSet.id) + '">' + icon('edit') + ' Edit</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="delete-ad-set" data-id="' + esc(adSet.id) + '">' + icon('trash') + '</button>';
    html += '</div></div>';

    // Stats
    html += '<div class="cp-inspector-stats">';
    html += '<div class="cp-inspector-stat"><div class="cp-inspector-stat-value">' + ads.length + '</div><div class="cp-inspector-stat-label">Ads</div></div>';
    var approved = ads.filter(function(a) { return a.pipeline_status === 'approved' || a.pipeline_status === 'live'; }).length;
    html += '<div class="cp-inspector-stat"><div class="cp-inspector-stat-value" style="color:var(--cp-success)">' + approved + '</div><div class="cp-inspector-stat-label">Approved+Live</div></div>';
    html += '</div>';

    // Audience
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('users') + ' Audience</div>';
    if (persona) {
      html += '<div class="cp-inspector-persona-card">';
      html += '<div class="cp-inspector-persona-name">' + icon('user') + ' ' + esc(persona.name) + '</div>';
      if (persona.description) html += '<div class="cp-inspector-persona-desc">' + esc(truncate(persona.description, 200)) + '</div>';
      html += '</div>';
    } else {
      html += '<div class="cp-text-muted">No persona linked. <a href="#" data-action="edit-ad-set" data-id="' + esc(adSet.id) + '">Add one</a>.</div>';
    }
    if (adSet.audience_overrides) {
      html += '<div class="cp-inspector-grid" style="margin-top:var(--cp-space-2)">';
      html += inspectorField('Audience overrides', adSet.audience_overrides);
      html += '</div>';
    }
    html += '</div>';

    // Placements
    var placements = adSet.placements || { advantage_enabled: true, custom_placements: [] };
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('object-group') + ' Placements</div>';
    if (placements.advantage_enabled) {
      html += '<span class="cp-badge" style="background:#9334e915;color:#9334e9">' + icon('sparkles') + ' Advantage Placements (auto)</span>';
    } else if ((placements.custom_placements || []).length) {
      html += '<div style="display:flex;flex-wrap:wrap;gap:6px">';
      placements.custom_placements.forEach(function(pk) {
        var p = META_PLACEMENTS[pk];
        if (p) html += '<span class="cp-badge">' + esc(p.label) + '</span>';
      });
      html += '</div>';
    } else {
      html += '<span class="cp-text-muted">No placements selected.</span>';
    }
    html += '</div>';

    // Optimization
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('bullseye-arrow') + ' Optimization & delivery</div>';
    html += '<div class="cp-inspector-grid">';
    html += inspectorField('Optimization goal', goal.label);
    html += inspectorField('Billing event', billing.label);
    var attr = META_ATTRIBUTION_SETTINGS[adSet.attribution_setting];
    html += inspectorField('Attribution', attr ? attr.label : '—');
    html += inspectorField('Bid amount', adSet.bid_amount ? formatCurrency(adSet.bid_amount) : '—');
    html += inspectorField('Daily budget',    adSet.daily_budget    ? formatCurrency(adSet.daily_budget)    : '— (CBO)');
    html += inspectorField('Lifetime budget', adSet.lifetime_budget ? formatCurrency(adSet.lifetime_budget) : '—');
    html += inspectorField('Schedule', renderScheduleSummary(adSet.start_time, adSet.stop_time));
    html += '</div></div>';

    // Brief preview (Stage 2 builds the editor)
    var brief = adSet.brief || {};
    var hasBrief = brief.creative_direction || (brief.message_ids || []).length || (brief.style_ids || []).length || (brief.format_ids || []).length || (brief.hook_angles || []).length;
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('file-lines') + ' Creative brief';
    html += '<span class="cp-text-muted" style="font-weight:400;font-size:11px;margin-left:8px">strategic layer</span>';
    html += '</div>';
    if (hasBrief) {
      if (brief.creative_direction) html += '<p>' + esc(brief.creative_direction) + '</p>';
      if ((brief.message_ids || []).length) {
        html += '<div class="cp-inspector-chip-row"><span class="cp-inspector-chip-label">Messages</span>';
        brief.message_ids.forEach(function(id) { var m = S.messageMap[id]; if (m) html += '<span class="cp-badge">' + esc(m.title) + '</span>'; });
        html += '</div>';
      }
      if ((brief.hook_angles || []).length) {
        html += '<div class="cp-inspector-chip-row"><span class="cp-inspector-chip-label">Hook angles</span>';
        brief.hook_angles.forEach(function(t) { html += '<span class="cp-badge">' + esc(t) + '</span>'; });
        html += '</div>';
      }
    } else {
      html += '<div class="cp-text-muted">No brief yet. Brief editor lands in Stage 2.</div>';
    }
    html += '</div>';

    // Quick actions
    html += '<div class="cp-inspector-actions">';
    html += '<button class="cp-btn cp-btn-primary" data-action="ws-add-ad" data-ad-set-id="' + esc(adSet.id) + '">' + icon('plus') + ' Add Ad</button>';
    html += '<button class="cp-btn cp-btn-ai" data-action="ai-suggest-ads" data-ad-set-id="' + esc(adSet.id) + '">' + icon('sparkles') + ' Suggest Ads</button>';
    html += '</div>';

    return html;
  }

  // --- Ad Overview tab ---
  //
  // Layout intent: this Overview is a CONFIGURATION + WALKTHROUGH panel
  // for the ad's production pipeline. It is NOT a static read-only dump.
  //
  // Inline-editable here:
  //   - name, creative_type, pipeline_status, assigned_to, due_date, tags
  // Read-only "summary card" here, edited in the matching tab:
  //   - Hook content (→ Hook tab)
  //   - Copy content (→ Copy tab)
  //   - Media direction (→ Media tab)
  //   - Review notes / production notes (→ Review tab)
  //
  // Each summary card carries a status pill (filled / partial / empty)
  // and a CTA that switches the inspector to the matching tab via
  // data-action="set-inspector-tab" data-tab="<key>" (existing handler
  // at src/20-part2a/27-event-handlers.js:723-727).

  function renderInspectorForAd(ad) {
    // Identity (name, type, status, actions) renders persistently in
    // `renderAdInspectorHeader` above the workflow tabs — no duplicate here.
    var adSet = S.adSetMap[ad.ad_set_id];
    var camp = adSet ? S.campaignV2Map[adSet.campaign_id] : null;
    var ctype = META_AD_CREATIVE_TYPES[ad.creative_type] || { label: 'Ad', icon: 'rectangle-ad' };

    var html = '';
    html += _renderAdOverviewConfig(ad);
    html += _renderAdSummaryHook(ad);
    html += _renderAdSummaryCopy(ad);
    html += _renderAdSummaryMedia(ad, ctype);
    html += _renderAdOverviewAssignment(ad);
    html += _renderAdSummaryReview(ad);
    html += _renderAdOverviewFooter(ad);
    return html;
  }

  // --- Ad overview helpers ---

  function _renderAdOverviewConfig(ad) {
    var html = '<div class="cp-inspector-section cp-inspector-config">';
    html += '<div class="cp-inspector-section-title">' + icon('gear') + ' Configuration</div>';

    // Creative type segmented (drives which Media tab variant renders).
    html += '<div class="cp-config-row">';
    html += '<div class="cp-config-label">Creative type</div>';
    html += '<div class="cp-segmented">';
    for (var ctk in META_AD_CREATIVE_TYPES) {
      var ct = META_AD_CREATIVE_TYPES[ctk];
      var ctSel = (ad.creative_type === ctk) ? ' cp-segmented-active' : '';
      html += '<label class="cp-segmented-option' + ctSel + '">';
      html += '<input type="radio" name="cp-ov-ad-ct-' + esc(ad.id) + '" class="cp-v2-media-type-switch" data-entity-id="' + esc(ad.id) + '" value="' + ctk + '"' + (ctSel ? ' checked' : '') + ' style="display:none">';
      html += icon(ct.icon) + ' ' + esc(ct.label);
      html += '</label>';
    }
    html += '</div></div>';

    // Tags (uses the Part 2A renderTagInput component if loaded).
    html += '<div class="cp-config-row">';
    html += '<div class="cp-config-label">Tags</div>';
    var R = window._cpRenderers || {};
    if (typeof R.tagInput === 'function') {
      html += '<div class="cp-config-control">' + R.tagInput(ad.tags || [], 'ad', ad.id) + '</div>';
    } else {
      html += '<div class="cp-config-control"><span class="cp-text-muted">Tags loading…</span></div>';
    }
    html += '</div>';

    html += '</div>';
    return html;
  }

  function _renderAdSummaryHook(ad) {
    var hook = ad.hook || {};
    var hasHook = !!(hook.text && hook.text.trim());
    var pill = hasHook
      ? '<span class="cp-inspector-status-pill cp-inspector-status-pill-filled">' + icon('circle-check') + ' Filled</span>'
      : '<span class="cp-inspector-status-pill cp-inspector-status-pill-empty">' + icon('circle') + ' Not set</span>';

    var body = hasHook
      ? '<blockquote class="cp-ad-hook">' + esc(truncate(hook.text, 220)) + '</blockquote>' +
        (hook.type ? '<div class="cp-text-muted" style="font-size:11px;margin-top:4px">Type: <strong>' + esc(hook.type) + '</strong></div>' : '')
      : '<div class="cp-text-muted">No hook yet. Open the Hook tab to add one.</div>';

    return _renderAdSummaryCard('anchor', 'Hook', 'hook', pill, body);
  }

  function _renderAdSummaryCopy(ad) {
    var c = ad.creative || {};
    var cta = metaCTA(c.cta_type);
    var fieldsFilled = (c.primary_text ? 1 : 0) + (c.headline ? 1 : 0) + (c.description ? 1 : 0) + (c.cta_type ? 1 : 0) + (c.cta_link ? 1 : 0);
    var pill;
    if (fieldsFilled === 0) pill = '<span class="cp-inspector-status-pill cp-inspector-status-pill-empty">' + icon('circle') + ' Not set</span>';
    else if (fieldsFilled < 4) pill = '<span class="cp-inspector-status-pill cp-inspector-status-pill-partial">' + icon('circle-half-stroke') + ' Partial</span>';
    else pill = '<span class="cp-inspector-status-pill cp-inspector-status-pill-filled">' + icon('circle-check') + ' Filled</span>';

    var body = '';
    if (fieldsFilled === 0) {
      body = '<div class="cp-text-muted">No copy yet. Open the Copy tab to add primary text, headline, description, and CTA.</div>';
    } else {
      body += '<div class="cp-inspector-grid cp-inspector-grid-1">';
      if (c.primary_text) body += '<div class="cp-inspector-field"><div class="cp-inspector-field-label">Primary text</div><div class="cp-inspector-field-value">' + esc(truncate(c.primary_text, 200)) + '</div></div>';
      if (c.headline)     body += '<div class="cp-inspector-field"><div class="cp-inspector-field-label">Headline</div><div class="cp-inspector-field-value">' + esc(c.headline) + '</div></div>';
      if (c.description)  body += '<div class="cp-inspector-field"><div class="cp-inspector-field-label">Description</div><div class="cp-inspector-field-value">' + esc(c.description) + '</div></div>';
      if (c.cta_type || c.cta_link) {
        var ctaVal = (cta ? cta.label : (c.cta_type || '')) + (c.cta_link ? ' → ' + truncate(c.cta_link, 80) : '');
        body += '<div class="cp-inspector-field"><div class="cp-inspector-field-label">CTA</div><div class="cp-inspector-field-value">' + esc(ctaVal) + '</div></div>';
      }
      if (c.display_link)     body += '<div class="cp-inspector-field"><div class="cp-inspector-field-label">Display link</div><div class="cp-inspector-field-value">' + esc(c.display_link) + '</div></div>';
      if (c.tracking_params)  body += '<div class="cp-inspector-field"><div class="cp-inspector-field-label">Tracking</div><div class="cp-inspector-field-value">' + esc(truncate(c.tracking_params, 120)) + '</div></div>';
      body += '</div>';
    }

    return _renderAdSummaryCard('pen-fancy', 'Copy', 'copy', pill, body);
  }

  function _renderAdSummaryMedia(ad, ctype) {
    var media = ad.media || {};
    var pill;
    var body;
    var title = 'Media · ' + (ctype.label || 'Ad');

    if (ad.creative_type === 'single_image') {
      var img = media.image || {};
      var imgFilled = !!(img.brief || img.ai_prompt);
      pill = imgFilled
        ? '<span class="cp-inspector-status-pill cp-inspector-status-pill-filled">' + icon('circle-check') + ' Filled</span>'
        : '<span class="cp-inspector-status-pill cp-inspector-status-pill-empty">' + icon('circle') + ' Not set</span>';
      if (imgFilled) {
        body = '';
        if (img.brief)     body += '<div class="cp-inspector-field"><div class="cp-inspector-field-label">Brief</div><div class="cp-inspector-field-value">' + esc(truncate(img.brief, 200)) + '</div></div>';
        if (img.ai_prompt) body += '<div class="cp-inspector-field"><div class="cp-inspector-field-label">AI prompt</div><div class="cp-inspector-field-value">' + esc(truncate(img.ai_prompt, 200)) + '</div></div>';
        body += '<div class="cp-text-muted" style="font-size:11px;margin-top:4px">Aspect: ' + esc(img.aspect_ratio || '1:1') + (img.negative_prompt ? ' · Neg: ' + esc(truncate(img.negative_prompt, 60)) : '') + '</div>';
      } else {
        body = '<div class="cp-text-muted">No image brief yet. Open the Media tab to fill it in.</div>';
      }
    } else if (ad.creative_type === 'single_video') {
      var vid = media.video || {};
      var scenes = (vid.blueprint && vid.blueprint.scenes) || [];
      var rows   = (vid.script && vid.script.rows) || [];
      var vidFilled = !!(vid.concept || scenes.length || rows.length);
      pill = vidFilled
        ? '<span class="cp-inspector-status-pill cp-inspector-status-pill-filled">' + icon('circle-check') + ' Filled</span>'
        : '<span class="cp-inspector-status-pill cp-inspector-status-pill-empty">' + icon('circle') + ' Not set</span>';
      if (vidFilled) {
        body = '';
        if (vid.concept) body += '<div class="cp-inspector-field"><div class="cp-inspector-field-label">Concept</div><div class="cp-inspector-field-value">' + esc(truncate(vid.concept, 200)) + '</div></div>';
        body += '<div class="cp-text-muted" style="font-size:11px;margin-top:4px">' + (vid.duration_seconds || '?') + 's · ' + esc(vid.aspect_ratio || '9:16') + ' · ' + scenes.length + ' scene' + (scenes.length !== 1 ? 's' : '') + ' · ' + rows.length + ' script row' + (rows.length !== 1 ? 's' : '') + '</div>';
      } else {
        body = '<div class="cp-text-muted">No video brief yet. Open the Media tab to add concept, scenes, and script.</div>';
      }
    } else if (ad.creative_type === 'carousel') {
      var cards = media.carousel_cards || [];
      pill = cards.length >= 2
        ? '<span class="cp-inspector-status-pill cp-inspector-status-pill-filled">' + icon('circle-check') + ' ' + cards.length + ' cards</span>'
        : (cards.length === 1
            ? '<span class="cp-inspector-status-pill cp-inspector-status-pill-partial">' + icon('circle-half-stroke') + ' Needs 2+ cards</span>'
            : '<span class="cp-inspector-status-pill cp-inspector-status-pill-empty">' + icon('circle') + ' No cards yet</span>');
      if (cards.length) {
        body = '<div class="cp-text-muted">' + cards.length + ' card' + (cards.length !== 1 ? 's' : '') + ' · Open Media tab to edit.</div>';
      } else {
        body = '<div class="cp-text-muted">No carousel cards yet. Open the Media tab to add them.</div>';
      }
    } else {
      pill = '<span class="cp-inspector-status-pill cp-inspector-status-pill-empty">' + icon('circle') + ' —</span>';
      body = '<div class="cp-text-muted">Pick a creative type above.</div>';
    }

    return _renderAdSummaryCard('wand-magic', title, 'media', pill, body);
  }

  function _renderAdOverviewAssignment(ad) {
    var html = '<div class="cp-inspector-section cp-inspector-config">';
    html += '<div class="cp-inspector-section-title">' + icon('user-clock') + ' Production &amp; assignment</div>';
    html += '<div class="cp-form-row">';
    html += '<div class="cp-form-half">';
    html += '<label class="cp-config-label">Assigned to</label>';
    html += '<input type="text" class="cp-input cp-v2-inline-field" data-field="assigned_to" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '" value="' + esc(ad.assigned_to || '') + '" placeholder="Teammate name or email">';
    html += '</div>';
    html += '<div class="cp-form-half">';
    html += '<label class="cp-config-label">Due date</label>';
    html += '<input type="date" class="cp-input cp-v2-inline-field" data-field="due_date" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '" value="' + esc(ad.due_date || '') + '">';
    html += '</div></div>';
    html += '</div>';
    return html;
  }

  function _renderAdSummaryReview(ad) {
    var hasNotes = !!(ad.review_notes || ad.production_notes);
    var pill = hasNotes
      ? '<span class="cp-inspector-status-pill cp-inspector-status-pill-filled">' + icon('circle-check') + ' Notes added</span>'
      : '<span class="cp-inspector-status-pill cp-inspector-status-pill-empty">' + icon('circle') + ' No notes</span>';

    var body = '';
    if (hasNotes) {
      body += '<div class="cp-inspector-grid cp-inspector-grid-1">';
      if (ad.production_notes) body += '<div class="cp-inspector-field"><div class="cp-inspector-field-label">Production</div><div class="cp-inspector-field-value">' + esc(truncate(ad.production_notes, 200)) + '</div></div>';
      if (ad.review_notes)     body += '<div class="cp-inspector-field"><div class="cp-inspector-field-label">Review</div><div class="cp-inspector-field-value">' + esc(truncate(ad.review_notes, 200)) + '</div></div>';
      body += '</div>';
    } else {
      body = '<div class="cp-text-muted">No notes yet. Open the Review tab to add production or review notes.</div>';
    }

    return _renderAdSummaryCard('clipboard-list', 'Review notes', 'review', pill, body);
  }

  function _renderAdOverviewFooter(ad) {
    var html = '<div class="cp-inspector-footer cp-text-muted" style="margin-top:var(--cp-space-3);font-size:11px;padding-top:var(--cp-space-3);border-top:1px solid var(--cp-border-light)">';
    var parts = [];
    if (ad.created) parts.push('Created ' + formatDate(ad.created));
    if (ad.updated) parts.push('Updated ' + formatRelativeTime(ad.updated));
    if (ad.created_by) parts.push('by ' + esc(ad.created_by));
    html += parts.join(' · ');
    html += '</div>';
    return html;
  }

  // Shared shell for the read-only summary cards. Card header has icon,
  // title, status pill on the right, then an "Open <tab> tab" CTA. The
  // explicit button is the click target — keeps activation predictable
  // (the whole-card click would otherwise also fire on the button via
  // bubble and double-trigger render()).
  function _renderAdSummaryCard(iconName, title, tabKey, pillHtml, bodyHtml) {
    var html = '<div class="cp-inspector-summary-card">';
    html += '<div class="cp-inspector-summary-card-header">';
    html += '<span class="cp-inspector-summary-card-icon">' + icon(iconName) + '</span>';
    html += '<span class="cp-inspector-summary-card-title">' + esc(title) + '</span>';
    html += pillHtml;
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm cp-inspector-summary-card-open" data-action="set-inspector-tab" data-tab="' + esc(tabKey) + '">' + icon('arrow-right') + ' Open tab</button>';
    html += '</div>';
    html += '<div class="cp-inspector-summary-card-body">' + bodyHtml + '</div>';
    html += '</div>';
    return html;
  }

  // --- Small helpers ---

  function inspectorField(label, value, wide) {
    var cls = wide ? ' cp-inspector-field-wide' : '';
    return '<div class="cp-inspector-field' + cls + '"><div class="cp-inspector-field-label">' + esc(label) + '</div><div class="cp-inspector-field-value">' + (typeof value === 'string' ? esc(value) : (value || '')) + '</div></div>';
  }

  // Same as inspectorField but with a small copy-to-clipboard button.
  function inspectorFieldCopy(label, value, adId, field, wide) {
    var cls = wide ? ' cp-inspector-field-wide' : '';
    var hasValue = value && value !== '—';
    var copyBtn = hasValue ? '<button class="cp-btn-icon cp-btn-icon-sm cp-inspector-field-copy" data-action="v2-copy-ad-field" data-id="' + esc(adId) + '" data-field="' + esc(field) + '" title="Copy ' + esc(label) + '">' + icon('copy') + '</button>' : '';
    return '<div class="cp-inspector-field cp-inspector-field-with-copy' + cls + '"><div class="cp-inspector-field-label">' + esc(label) + copyBtn + '</div><div class="cp-inspector-field-value">' + (typeof value === 'string' ? esc(value) : (value || '')) + '</div></div>';
  }

  function renderScheduleSummary(start, end) {
    if (!start && !end) return 'Always-on';
    return (start ? formatDateShort(start) : 'Now') + ' → ' + (end ? formatDateShort(end) : 'Ongoing');
  }
