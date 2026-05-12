  // ============================================================
  // SECTION 15B: META CAMPAIGNS LIST VIEW (v2)
  // ============================================================
  //
  // Lists campaigns_v2[] in a card grid. Each card is a click-target into
  // the Campaign Workspace. Visible when S.meta.setup.meta_v2 === true.

  function renderMetaCampaignsView() {
    var camps = getAllCampaignsV2();
    var f = S.campaignV2Filter || (S.campaignV2Filter = { search: '', status: '', objective: '' });

    var filtered = camps.slice();
    if (f.search) {
      var q = f.search.toLowerCase();
      filtered = filtered.filter(function(c) {
        return (c.name || '').toLowerCase().indexOf(q) > -1 ||
               (c.description || '').toLowerCase().indexOf(q) > -1;
      });
    }
    if (f.status)    filtered = filtered.filter(function(c) { return c.status === f.status; });
    if (f.objective) filtered = filtered.filter(function(c) { return c.objective === f.objective; });
    filtered.sort(function(a, b) { return (b.updated || b.created || '') > (a.updated || a.created || '') ? 1 : -1; });

    var html = '<div class="cp-view cp-view-meta-campaigns">';
    html += '<div class="cp-view-header"><div class="cp-view-header-left">';
    html += '<h1>' + icon('bullhorn') + ' Campaigns</h1>';
    html += '<span class="cp-view-subtitle">' + filtered.length + ' campaign' + (filtered.length !== 1 ? 's' : '') + ' · Meta-native structure</span>';
    html += '</div><div class="cp-view-header-right">';
    html += '<button class="cp-btn cp-btn-ai" data-action="ai-generate-campaign-tree">' + icon('wand-magic') + ' Generate from brief</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="v2-export-open">' + icon('download') + ' Export all</button>';
    html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="new-campaign-v2">' + icon('plus') + ' New Campaign</button>';
    html += '</div></div>';

    // Toolbar
    html += '<div class="cp-list-toolbar"><div class="cp-list-toolbar-row">';
    html += '<div class="cp-search-wrapper">' + icon('search') + '<input type="text" class="cp-input" id="cpCampaignV2Search" placeholder="Search campaigns..." value="' + esc(f.search) + '"></div>';
    html += '<select class="cp-select cp-select-sm" id="cpCampaignV2StatusFilter" style="width:auto;min-width:110px"><option value="">All statuses</option>';
    for (var sk in META_CAMPAIGN_STATUSES) {
      html += '<option value="' + sk + '"' + (f.status === sk ? ' selected' : '') + '>' + META_CAMPAIGN_STATUSES[sk].label + '</option>';
    }
    html += '</select>';
    html += '<select class="cp-select cp-select-sm" id="cpCampaignV2ObjectiveFilter" style="width:auto;min-width:140px"><option value="">All objectives</option>';
    for (var ok in META_OBJECTIVES) {
      html += '<option value="' + ok + '"' + (f.objective === ok ? ' selected' : '') + '>' + META_OBJECTIVES[ok].label + '</option>';
    }
    html += '</select>';
    html += '</div></div>';

    if (filtered.length === 0) {
      html += '<div class="cp-empty-state">';
      html += '<div class="cp-empty-state-icon">' + icon('bullhorn') + '</div>';
      if (camps.length === 0) {
        html += '<div class="cp-empty-state-title">No campaigns yet</div>';
        html += '<div class="cp-empty-state-text">Start with the AI brief-to-tree generator, or create one manually.</div>';
        html += '<div style="display:flex;gap:var(--cp-space-2);justify-content:center;margin-top:var(--cp-space-3)">';
        html += '<button class="cp-btn cp-btn-ai" data-action="ai-generate-campaign-tree">' + icon('wand-magic') + ' Generate from brief</button>';
        html += '<button class="cp-btn cp-btn-primary" data-action="new-campaign-v2">' + icon('plus') + ' New Campaign</button>';
        html += '</div>';
      } else {
        html += '<div class="cp-empty-state-title">No campaigns match</div>';
        html += '<div class="cp-empty-state-text">Try clearing your filters.</div>';
      }
      html += '</div></div>';
      return html;
    }

    // Card grid
    html += '<div class="cp-meta-camp-grid">';
    for (var i = 0; i < filtered.length; i++) html += renderMetaCampaignCard(filtered[i]);
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderMetaCampaignCard(camp) {
    var status = metaCampaignStatus(camp.status);
    var objective = metaObjective(camp.objective);
    var sets = getAdSetsByCampaign(camp.id);
    var ads = getAdsByCampaign(camp.id);

    // Per-status counts across ads in this campaign
    var statusCounts = {};
    ads.forEach(function(a) { statusCounts[a.pipeline_status] = (statusCounts[a.pipeline_status] || 0) + 1; });
    var readyCount = (statusCounts.approved || 0) + (statusCounts.live || 0);
    var progressPct = ads.length > 0 ? Math.round((readyCount / ads.length) * 100) : 0;

    var html = '<div class="cp-meta-camp-card" data-action="open-campaign-v2" data-id="' + esc(camp.id) + '">';

    // Header row
    html += '<div class="cp-meta-camp-card-header">';
    html += '<div class="cp-meta-camp-card-title">' + esc(camp.name || 'Untitled') + '</div>';
    html += '<span class="cp-badge" style="background:' + status.color + '15;color:' + status.color + '">' + icon(status.icon) + ' ' + esc(status.label) + '</span>';
    html += '</div>';

    // Description
    if (camp.description) {
      html += '<div class="cp-meta-camp-card-desc">' + esc(truncate(camp.description, 140)) + '</div>';
    }

    // Meta row
    html += '<div class="cp-meta-camp-card-meta">';
    if (objective) html += '<span class="cp-meta-camp-tag">' + icon(objective.icon) + ' ' + esc(objective.label) + '</span>';
    var bm = META_BUDGET_MODES[camp.budget_mode];
    if (bm) html += '<span class="cp-meta-camp-tag">' + icon('dollar-sign') + ' ' + esc(bm.short) + '</span>';
    if (camp.daily_budget)    html += '<span class="cp-meta-camp-tag">' + formatCurrency(camp.daily_budget) + '/d</span>';
    if (camp.lifetime_budget) html += '<span class="cp-meta-camp-tag">' + formatCurrency(camp.lifetime_budget) + ' lifetime</span>';
    if (camp.ab_test && camp.ab_test.enabled) html += '<span class="cp-meta-camp-tag cp-meta-camp-tag-ab">' + icon('flask') + ' A/B</span>';
    html += '</div>';

    // Children summary
    html += '<div class="cp-meta-camp-card-children">';
    html += '<div class="cp-meta-camp-card-stat"><span class="cp-meta-camp-card-stat-value">' + sets.length + '</span> <span class="cp-meta-camp-card-stat-label">Ad Set' + (sets.length !== 1 ? 's' : '') + '</span></div>';
    html += '<div class="cp-meta-camp-card-stat"><span class="cp-meta-camp-card-stat-value">' + ads.length + '</span> <span class="cp-meta-camp-card-stat-label">Ad' + (ads.length !== 1 ? 's' : '') + '</span></div>';
    if (ads.length > 0) html += '<div class="cp-meta-camp-card-stat"><span class="cp-meta-camp-card-stat-value" style="color:var(--cp-success)">' + progressPct + '%</span> <span class="cp-meta-camp-card-stat-label">Approved</span></div>';
    html += '</div>';

    // Footer
    html += '<div class="cp-meta-camp-card-footer">';
    html += '<span class="cp-text-muted">Updated ' + formatRelativeTime(camp.updated || camp.created) + '</span>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="open-campaign-v2" data-id="' + esc(camp.id) + '">Open ' + icon('arrow-right') + '</button>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  // Minimal currency formatter; respects S.meta.meta_defaults.currency.
  function formatCurrency(amount) {
    if (amount == null || amount === '') return '';
    var ccy = (S.meta && S.meta.meta_defaults && S.meta.meta_defaults.currency) || 'USD';
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: ccy, maximumFractionDigits: 0 }).format(Number(amount));
    } catch (_) {
      return ccy + ' ' + amount;
    }
  }
