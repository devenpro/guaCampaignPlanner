  // ============================================================
  // SECTION 10A: DASHBOARD — META v2 WIDGET (Stage 8)
  // ============================================================
  //
  // Replaces the legacy "Active campaigns" card with a Meta v2 summary
  // when S.meta.setup.meta_v2 is true. Surfaces:
  //   - Active campaigns count
  //   - Ad Set status rollup (active / paused / draft)
  //   - Ads pipeline rollup (live / approved / in_review / draft+wip)
  //   - Snapshot divergence count (library updated since attach)
  //   - "Continue working" list (3 most recently updated Ads)

  function renderDashMetaV2Widget() {
    if (!isMetaV2Enabled()) return '';

    var camps = getAllCampaignsV2();
    var sets = getAllAdSets();
    var ads = getAllAds();
    var active = camps.filter(function(c) { return c.status === 'ACTIVE'; }).length;
    var drafts = camps.filter(function(c) { return c.status === 'DRAFT'; }).length;

    // Ads pipeline rollup
    var liveAds = ads.filter(function(a) { return a.pipeline_status === 'live'; }).length;
    var approvedAds = ads.filter(function(a) { return a.pipeline_status === 'approved'; }).length;
    var reviewAds = ads.filter(function(a) { return a.pipeline_status === 'in_review'; }).length;
    var wipAds = ads.filter(function(a) {
      return ['hook_ready', 'copy_ready', 'media_ready'].indexOf(a.pipeline_status) > -1;
    }).length;

    // Snapshot divergence count (Ad Sets whose persona has moved on)
    var divergent = 0;
    sets.forEach(function(s) { if (isPersonaSnapshotStale(s)) divergent++; });

    // Continue working: most recently updated ads, top 3
    var recentAds = ads.slice().sort(function(a, b) {
      return (b.updated || b.created || '') > (a.updated || a.created || '') ? 1 : -1;
    }).slice(0, 3);

    var html = '<div class="cp-dash-v2-card">';
    html += '<div class="cp-dash-v2-card-header">';
    html += '<h2>' + icon('bullhorn') + ' Meta Campaigns</h2>';
    html += '<div style="display:flex;gap:6px">';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="go-view" data-view="meta_campaigns">View all</button>';
    html += '<button class="cp-btn cp-btn-ai cp-btn-sm" data-action="ai-generate-campaign-tree">' + icon('wand-magic') + ' Generate</button>';
    html += '</div></div>';

    // Top stats row
    html += '<div class="cp-dash-v2-stats">';
    html += '<div class="cp-dash-v2-stat"><div class="cp-dash-v2-stat-val">' + camps.length + '</div><div class="cp-dash-v2-stat-lbl">Campaigns</div><div class="cp-dash-v2-stat-sub">' + active + ' active · ' + drafts + ' draft</div></div>';
    html += '<div class="cp-dash-v2-stat"><div class="cp-dash-v2-stat-val">' + sets.length + '</div><div class="cp-dash-v2-stat-lbl">Ad Sets</div></div>';
    html += '<div class="cp-dash-v2-stat"><div class="cp-dash-v2-stat-val">' + ads.length + '</div><div class="cp-dash-v2-stat-lbl">Ads</div><div class="cp-dash-v2-stat-sub">' + liveAds + ' live · ' + approvedAds + ' ready</div></div>';
    html += '<div class="cp-dash-v2-stat"><div class="cp-dash-v2-stat-val" style="color:' + (divergent > 0 ? 'var(--cp-accent)' : 'var(--cp-success)') + '">' + divergent + '</div><div class="cp-dash-v2-stat-lbl">Diverged</div><div class="cp-dash-v2-stat-sub">snapshots</div></div>';
    html += '</div>';

    // Pipeline progress bar
    if (ads.length > 0) {
      html += '<div class="cp-dash-v2-pipeline">';
      var segments = [
        { count: wipAds,      color: '#1a73e8', label: 'In progress' },
        { count: reviewAds,   color: '#e37400', label: 'In review' },
        { count: approvedAds, color: '#0d904f', label: 'Approved' },
        { count: liveAds,     color: '#0891b2', label: 'Live' }
      ];
      var totalWithStatus = wipAds + reviewAds + approvedAds + liveAds;
      var remaining = ads.length - totalWithStatus;
      if (remaining > 0) segments.unshift({ count: remaining, color: '#bdc1c6', label: 'Other' });

      html += '<div class="cp-dash-v2-pipeline-bar">';
      segments.forEach(function(seg) {
        if (seg.count === 0) return;
        var pct = (seg.count / ads.length) * 100;
        html += '<div class="cp-dash-v2-pipeline-seg" style="width:' + pct + '%;background:' + seg.color + '" title="' + esc(seg.label) + ': ' + seg.count + '"></div>';
      });
      html += '</div>';
      html += '<div class="cp-dash-v2-pipeline-legend">';
      segments.forEach(function(seg) {
        if (seg.count === 0) return;
        html += '<span><span class="cp-dash-v2-legend-dot" style="background:' + seg.color + '"></span> ' + esc(seg.label) + ' (' + seg.count + ')</span>';
      });
      html += '</div></div>';
    }

    // Continue working
    if (recentAds.length > 0) {
      html += '<div class="cp-dash-v2-section-title">' + icon('pen-fancy') + ' Continue working</div>';
      html += '<div class="cp-dash-v2-continue-list">';
      for (var i = 0; i < recentAds.length; i++) {
        var a = recentAds[i];
        var status = metaAdStatus(a.pipeline_status);
        var adSet = S.adSetMap[a.ad_set_id];
        var campId = adSet ? adSet.campaign_id : '';
        html += '<div class="cp-dash-v2-continue-item" data-action="lib-open-ad" data-id="' + esc(a.id) + '">';
        html += '<span class="cp-tree-status-dot" style="background:' + status.color + '"></span>';
        html += '<span class="cp-dash-v2-continue-name">' + esc(a.name) + '</span>';
        if (adSet) html += '<span class="cp-text-muted">' + esc(adSet.name) + '</span>';
        html += '<span class="cp-text-muted" style="font-size:11px">' + formatRelativeTime(a.updated || a.created) + '</span>';
        html += '</div>';
      }
      html += '</div>';
    }

    // Empty state CTA
    if (camps.length === 0) {
      html += '<div class="cp-dash-v2-empty">';
      html += '<p>No Meta Campaigns yet. Get started with an AI-generated tree from a brief, or build manually.</p>';
      html += '<div style="display:flex;gap:8px;margin-top:var(--cp-space-2)">';
      html += '<button class="cp-btn cp-btn-ai" data-action="ai-generate-campaign-tree">' + icon('wand-magic') + ' Generate from brief</button>';
      html += '<button class="cp-btn cp-btn-primary" data-action="new-campaign-v2">' + icon('plus') + ' New Campaign</button>';
      html += '</div></div>';
    }

    html += '</div>';
    return html;
  }
