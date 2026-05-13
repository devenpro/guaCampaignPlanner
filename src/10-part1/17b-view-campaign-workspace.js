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

  function renderInspectorForAd(ad) {
    var adSet = S.adSetMap[ad.ad_set_id];
    var camp = adSet ? S.campaignV2Map[adSet.campaign_id] : null;
    var status = metaAdStatus(ad.pipeline_status);
    var ctype = META_AD_CREATIVE_TYPES[ad.creative_type] || { label: 'Ad', icon: 'rectangle-ad' };
    var cta = metaCTA((ad.creative || {}).cta_type);

    var html = '';
    html += '<div class="cp-inspector-header"><div style="flex:1">';
    var crumb = (camp ? esc(camp.name) + ' · ' : '') + (adSet ? esc(adSet.name) : '');
    html += '<div class="cp-inspector-eyebrow">' + icon(ctype.icon) + ' ' + esc(ctype.label) + (crumb ? ' · ' + crumb : '') + '</div>';
    // Inline-editable ad name (was a static <h2>). Blur saves via the
    // generic cp-v2-inline-field handler in 27-event-handlers.js.
    html += '<input type="text" class="cp-inspector-title-input cp-v2-inline-field" data-field="name" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '" value="' + esc(ad.name || '') + '" placeholder="Ad name" style="font-size:var(--cp-font-size-2xl,1.6rem);font-weight:700;border:1px solid transparent;background:transparent;width:100%;padding:2px 4px;margin:-2px -4px">';
    html += '<div style="display:flex;gap:var(--cp-space-2);flex-wrap:wrap;margin-top:6px;align-items:center">';
    html += '<span class="cp-badge" style="background:' + status.color + '15;color:' + status.color + '">' + icon(status.icon) + ' ' + esc(status.label) + '</span>';
    html += '<span class="cp-text-muted" style="font-size:11px">Status set from the Review tab</span>';
    html += '</div></div><div class="cp-inspector-header-actions">';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="v2-copy-ad-field" data-id="' + esc(ad.id) + '" data-field="all" title="Copy all ad fields">' + icon('copy') + '</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="delete-ad" data-id="' + esc(ad.id) + '">' + icon('trash') + '</button>';
    html += '</div></div>';

    // Hook
    var hook = ad.hook || {};
    if (hook.text) {
      html += '<div class="cp-inspector-section">';
      html += '<div class="cp-inspector-section-title">' + icon('anchor') + ' Hook</div>';
      html += '<blockquote class="cp-ad-hook">' + esc(hook.text) + '</blockquote>';
      html += '</div>';
    }

    // Creative — primary text / headline / description / CTA / link (with per-field copy buttons)
    var creative = ad.creative || {};
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('pen-fancy') + ' Creative</div>';
    html += '<div class="cp-inspector-grid cp-inspector-grid-1">';
    html += inspectorFieldCopy('Primary text', creative.primary_text || '—', ad.id, 'primary_text', true);
    html += inspectorFieldCopy('Headline',     creative.headline     || '—', ad.id, 'headline');
    html += inspectorFieldCopy('Description',  creative.description  || '—', ad.id, 'description');
    html += inspectorFieldCopy('CTA',          cta ? cta.label : (creative.cta_type || '—'), ad.id, 'cta_type');
    html += inspectorFieldCopy('Link',         creative.cta_link     || '—', ad.id, 'cta_link');
    html += inspectorField('Display link',     creative.display_link || '—');
    html += '</div></div>';

    // Media (preview only — full editor in Stage 2)
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('image') + ' Media';
    html += '<span class="cp-text-muted" style="font-weight:400;font-size:11px;margin-left:8px">' + esc(ctype.label) + '</span>';
    html += '</div>';
    var media = ad.media || {};
    if (ad.creative_type === 'single_image') {
      if (media.image && (media.image.brief || media.image.ai_prompt)) {
        if (media.image.brief)     html += '<p><strong>Brief:</strong> ' + esc(media.image.brief) + '</p>';
        if (media.image.ai_prompt) html += '<p><strong>Prompt:</strong> ' + esc(media.image.ai_prompt) + '</p>';
      } else html += '<div class="cp-text-muted">No image brief yet.</div>';
    } else if (ad.creative_type === 'single_video') {
      if (media.video && (media.video.concept || (media.video.script && media.video.script.rows && media.video.script.rows.length))) {
        if (media.video.concept) html += '<p><strong>Concept:</strong> ' + esc(media.video.concept) + '</p>';
        if (media.video.script && media.video.script.rows && media.video.script.rows.length) {
          html += '<p>' + media.video.script.rows.length + ' script rows · ' + (media.video.duration_seconds || '?') + 's · ' + (media.video.aspect_ratio || '') + '</p>';
        }
      } else html += '<div class="cp-text-muted">No video brief yet.</div>';
    } else if (ad.creative_type === 'carousel') {
      var cards = media.carousel_cards || [];
      html += '<div>' + cards.length + ' card' + (cards.length !== 1 ? 's' : '') + '</div>';
    }
    html += '</div>';

    // Review/production
    if (ad.review_notes || ad.production_notes || ad.assigned_to || ad.due_date) {
      html += '<div class="cp-inspector-section">';
      html += '<div class="cp-inspector-section-title">' + icon('clipboard-list') + ' Review & production</div>';
      html += '<div class="cp-inspector-grid">';
      html += inspectorField('Assigned to',     ad.assigned_to     || '—');
      html += inspectorField('Due date',        ad.due_date        || '—');
      html += inspectorField('Review notes',    ad.review_notes    || '—');
      html += inspectorField('Production notes',ad.production_notes|| '—');
      html += '</div></div>';
    }

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
