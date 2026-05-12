  // ============================================================
  // SECTION 10: DASHBOARD VIEW
  // ============================================================

  function renderDashboardView() {
    var html = '<div class="cp-view cp-view-dashboard">';

    // Check if library is empty → show onboarding
    if (S.totalPersonas === 0 && S.totalMessages === 0 && S.totalRecipes === 0) {
      html += renderDashOnboarding();
    } else {
      html += renderDashPopulated();
    }

    html += '</div>';
    return html;
  }

  function renderDashOnboarding() {
    var html = '<div class="cp-dash-onboarding">';
    html += '<div class="cp-dash-onboarding-header">';
    html += '<div class="cp-dash-onboarding-icon">' + icon('bullseye') + '</div>';
    html += '<h1>Start Building Your Creative Library</h1>';
    html += '<p>Build the four dimensions of creative diversity, then mix them into unique ad recipes. Start with personas — or jump to any step.</p>';
    html += '</div>';

    // 4-step guide
    html += '<div class="cp-dash-steps">';
    var steps = [
      { num: '1', label: 'Create Personas', desc: 'Define who you speak to', dim: 'persona', view: 'personas' },
      { num: '2', label: 'Add Messages', desc: 'Define what you say', dim: 'message', view: 'messages' },
      { num: '3', label: 'Set Styles & Formats', desc: 'Define how it looks & feels', dim: 'style', view: 'styles' },
      { num: '4', label: 'Generate Recipes', desc: 'Mix & match combinations', dim: 'format', view: 'recipes' }
    ];
    for (var i = 0; i < steps.length; i++) {
      var st = steps[i];
      var dim = DIMENSIONS[st.dim];
      html += '<div class="cp-dash-step-card" data-action="go-view" data-view="' + st.view + '">';
      html += '<div class="cp-dash-step-num" style="background:' + dim.color + '15;color:' + dim.color + '">' + st.num + '</div>';
      html += '<div class="cp-dash-step-label">' + esc(st.label) + '</div>';
      html += '<div class="cp-dash-step-desc">' + esc(st.desc) + '</div>';
      html += '</div>';
    }
    html += '</div>';

    // Research Lab shortcut
    html += '<div class="cp-dash-onboarding-actions">';
    html += '<button class="cp-btn cp-btn-ai" data-action="go-view" data-view="research">' + icon('sparkles') + ' Or use AI Research Lab to build everything at once</button>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderDashPopulated() {
    var html = '';

    // View header
    var v2 = isMetaV2Enabled();
    html += '<div class="cp-view-header"><div class="cp-view-header-left"><h1>' + icon('chart-pie') + ' Dashboard</h1></div>';
    html += '<div class="cp-view-header-right">';
    if (v2) {
      html += '<button class="cp-btn cp-btn-ai" data-action="ai-generate-campaign-tree">' + icon('wand-magic') + ' Generate Campaign</button>';
    } else {
      html += '<button class="cp-btn cp-btn-ai" data-action="open-campaign-wizard">' + icon('wand-magic') + ' New Campaign</button>';
    }
    html += '<button class="cp-btn cp-btn-outline" data-action="go-view" data-view="research">' + icon('flask') + ' Research Lab</button>';
    html += '</div></div>';

    // Meta v2 widget (only when enabled)
    if (v2) html += renderDashMetaV2Widget();

    // Continue working card (last edited recipe)
    var lastRecipe = (S.data.recipes || []).slice().sort(function(a, b) { return (b.updated || '') > (a.updated || '') ? 1 : -1; })[0];
    if (lastRecipe && lastRecipe.updated) {
      var lastCamp = S.campaignMap[lastRecipe.campaign_id];
      html += '<div class="cp-card cp-dash-continue" data-action="select-recipe" data-id="' + esc(lastRecipe.id) + '">';
      html += '<div style="display:flex;align-items:center;gap:var(--cp-space-3)">';
      html += '<div style="flex:1"><span class="cp-text-muted" style="font-size:var(--cp-font-size-xs)">Continue where you left off</span>';
      html += '<div style="font-weight:600">' + esc(lastRecipe.title || 'Untitled Recipe') + '</div>';
      html += '<div style="display:flex;gap:var(--cp-space-2);margin-top:4px">' + recipeStatusBadge(lastRecipe.status) + mediaTypeBadge(lastRecipe.media_type);
      if (lastCamp) html += '<span class="cp-badge" style="background:#0891b215;color:#0891b2">' + icon('bullhorn') + ' ' + esc(truncate(lastCamp.name, 14)) + '</span>';
      html += '</div></div>';
      html += '<span class="cp-text-muted">' + formatRelativeTime(lastRecipe.updated) + ' ' + icon('arrow-right') + '</span>';
      html += '</div></div>';
    }

    // Stat cards row
    html += renderDashStats();

    // Active campaigns summary
    var activeCamps = (S.data.campaigns || []).filter(function(c) { return c.status === 'active' || c.status === 'planning'; });
    if (activeCamps.length > 0) {
      html += '<div class="cp-card" style="margin-bottom:var(--cp-space-4)">';
      html += '<div class="cp-section-header"><h3>' + icon('bullhorn') + ' Active Campaigns (' + activeCamps.length + ')</h3></div>';
      for (var aci = 0; aci < activeCamps.length; aci++) {
        var ac = activeCamps[aci];
        var acRecipes = getRecipesByCampaign(ac.id);
        var acReady = acRecipes.filter(function(r) { return r.status === 'approved' || r.status === 'live'; }).length;
        var acPct = acRecipes.length > 0 ? Math.round((acReady / acRecipes.length) * 100) : 0;
        var acst = CAMPAIGN_STATUSES[ac.status] || { color: '#80868b', icon: 'circle' };
        html += '<div class="cp-dash-campaign-row" data-action="go-to-campaign" data-id="' + esc(ac.id) + '">';
        html += '<span class="cp-badge" style="background:' + acst.color + '15;color:' + acst.color + '">' + icon(acst.icon) + '</span>';
        html += '<span style="flex:1;font-weight:500">' + esc(truncate(ac.name, 28)) + '</span>';
        html += '<span class="cp-text-muted" style="font-size:11px">' + acRecipes.length + ' recipes</span>';
        html += '<div class="cp-recipe-progress-mini" style="width:60px"><div class="cp-recipe-progress-fill" style="width:' + acPct + '%;background:' + (acPct >= 80 ? 'var(--cp-success)' : acPct >= 40 ? '#e37400' : 'var(--cp-gray-300)') + '"></div></div>';
        html += '<span style="font-size:11px;font-weight:600;color:' + (acPct >= 80 ? 'var(--cp-success)' : '#e37400') + '">' + acPct + '%</span>';
        html += '</div>';
      }
      html += '</div>';
    }

    // Two-column grid
    html += '<div class="cp-dash-grid">';
    html += '<div class="cp-dash-col-left">';
    html += renderDashFunnelBar();
    html += renderDashPipeline();
    html += renderDashDiversity();
    html += '</div>';
    html += '<div class="cp-dash-col-right">';
    html += renderDashQuickActions();
    html += renderDashRecentRecipes();
    html += renderDashActivity();
    html += '</div>';
    html += '</div>';

    // Brand & Workspace Context Section
    html += renderDashBrandContext();

    return html;
  }

  function renderDashBrandContext() {
    var html = '';
    var setup = (S.meta && S.meta.setup) || {};
    var hasBrand = S.brand && S.brand.configured;
    var bc = (hasBrand && S.brand.core) || {};
    var bi = (hasBrand && S.brand.identity) || {};
    var cnt = (hasBrand && S.brand.content) || {};
    var seo = (hasBrand && S.brand.seo) || {};

    html += '<div class="cp-dash-brand-context">';
    html += '<div class="cp-section-header"><h2>' + icon('plug') + ' Context & AI Enrichment</h2></div>';

    html += '<div class="cp-brand-context-grid">';

    // Workspace/Setup context card
    html += '<div class="cp-card cp-brand-context-card">';
    html += '<div class="cp-section-header"><h3>' + icon('bullseye') + ' Workspace Setup</h3></div>';
    var setupItems = [];
    if (setup.product_name) setupItems.push(['Product', setup.product_name]);
    if (setup.objective) setupItems.push(['Objective', setup.objective]);
    if (setup.custom_instructions) setupItems.push(['Custom AI Instructions', truncate(setup.custom_instructions, 80)]);
    var funnels = (S.meta && S.meta.settings && S.meta.settings.funnel_stages) || [];
    if (funnels.length) setupItems.push(['Funnel', funnels.map(function(f) { return f.short; }).join(' → ')]);
    if (setupItems.length === 0) {
      html += '<p class="cp-text-muted">No setup context configured. <a href="#" data-action="go-view" data-view="settings" style="color:var(--cp-primary)">Configure in Settings</a></p>';
    } else {
      for (var si = 0; si < setupItems.length; si++) {
        html += '<div class="cp-brand-ctx-item"><span class="cp-brand-ctx-label">' + esc(setupItems[si][0]) + '</span>';
        html += '<span class="cp-brand-ctx-value">' + esc(setupItems[si][1]) + '</span></div>';
      }
    }
    html += '</div>';

    // Brand identity card
    html += '<div class="cp-card cp-brand-context-card">';
    html += '<div class="cp-section-header"><h3>' + icon('fingerprint') + ' Brand Identity</h3>';
    if (hasBrand) html += '<span class="cp-badge" style="background:var(--cp-success-light);color:var(--cp-success)">' + icon('circle-check') + ' Connected</span>';
    else html += '<span class="cp-badge" style="background:var(--cp-error-light);color:var(--cp-error)">' + icon('circle-xmark') + ' Not found</span>';
    html += '</div>';
    if (hasBrand) {
      var brandItems = [];
      if (bc.brand_name) brandItems.push(['Brand', bc.brand_name]);
      if (bc.tagline) brandItems.push(['Tagline', bc.tagline]);
      if (bc.brand_voice) brandItems.push(['Voice', truncate(bc.brand_voice, 80)]);
      var aud = bc.audience || {};
      if (aud.primary) brandItems.push(['Audience', aud.primary]);
      if (aud.pain_points) brandItems.push(['Audience Pains', Array.isArray(aud.pain_points) ? aud.pain_points.slice(0, 3).join('; ') : truncate(aud.pain_points, 80)]);
      if (bc.forbidden_words && bc.forbidden_words.length) brandItems.push(['Forbidden', bc.forbidden_words.slice(0, 5).join(', ')]);
      for (var bi2 = 0; bi2 < brandItems.length; bi2++) {
        html += '<div class="cp-brand-ctx-item"><span class="cp-brand-ctx-label">' + esc(brandItems[bi2][0]) + '</span>';
        html += '<span class="cp-brand-ctx-value">' + esc(brandItems[bi2][1]) + '</span></div>';
      }
    } else {
      html += '<p class="cp-text-muted">Add a brand profile in Drupal to auto-inject brand context into all AI prompts.</p>';
    }
    html += '</div>';

    // Content & SEO context card
    html += '<div class="cp-card cp-brand-context-card">';
    html += '<div class="cp-section-header"><h3>' + icon('pen-fancy') + ' Content & SEO</h3></div>';
    var cntItems = [];
    if (cnt.writing_style) cntItems.push(['Writing Style', truncate(cnt.writing_style, 80)]);
    if (cnt.cta_style) cntItems.push(['CTA Style', truncate(cnt.cta_style, 60)]);
    if (seo.niche) cntItems.push(['Niche', seo.niche]);
    if (seo.keyword_clusters) cntItems.push(['Keywords', Array.isArray(seo.keyword_clusters) ? seo.keyword_clusters.slice(0, 4).join(', ') : truncate(seo.keyword_clusters, 80)]);
    if (seo.content_gaps) cntItems.push(['Content Gaps', Array.isArray(seo.content_gaps) ? seo.content_gaps.slice(0, 3).join(', ') : truncate(seo.content_gaps, 80)]);
    if (cntItems.length === 0) {
      html += '<p class="cp-text-muted">No content or SEO context available from brand profile.</p>';
    } else {
      for (var ci = 0; ci < cntItems.length; ci++) {
        html += '<div class="cp-brand-ctx-item"><span class="cp-brand-ctx-label">' + esc(cntItems[ci][0]) + '</span>';
        html += '<span class="cp-brand-ctx-value">' + esc(cntItems[ci][1]) + '</span></div>';
      }
    }
    html += '</div>';

    // AI Status card
    html += '<div class="cp-card cp-brand-context-card">';
    html += '<div class="cp-section-header"><h3>' + icon('sparkles') + ' AI Status</h3></div>';
    var aiConnected = window._cpPart2B && window._cpPart2B.LLMService && window._cpPart2B.LLMService.isConfigured();
    if (aiConnected) {
      var provs = window._cpPart2B.LLMService.getActiveProviders();
      var def = window._cpPart2B.LLMService.getDefault();
      html += '<div class="cp-brand-ctx-item"><span class="cp-brand-ctx-label">Status</span>';
      html += '<span class="cp-brand-ctx-value" style="color:var(--cp-success)">' + icon('circle-check') + ' ' + provs.length + ' provider' + (provs.length > 1 ? 's' : '') + ' active</span></div>';
      if (def) {
        html += '<div class="cp-brand-ctx-item"><span class="cp-brand-ctx-label">Default</span>';
        html += '<span class="cp-brand-ctx-value">' + esc(def.provider) + ' / ' + esc(def.model) + '</span></div>';
      }
    } else {
      html += '<div class="cp-brand-ctx-item"><span class="cp-brand-ctx-label">Status</span>';
      html += '<span class="cp-brand-ctx-value" style="color:var(--cp-error)">' + icon('circle-xmark') + ' Not configured</span></div>';
      html += '<p class="cp-text-muted" style="margin-top:4px"><a href="#" data-action="go-view" data-view="settings" data-tab="ai" style="color:var(--cp-primary)">Configure AI providers</a></p>';
    }
    html += '</div>';

    html += '</div></div>';
    return html;
  }

  function renderDashStats() {
    var html = '<div class="cp-dash-stats">';

    // Personas
    var catCount = (S.data.persona_categories || []).length;
    html += renderStatCard(icon('users'), 'Personas', S.totalPersonas, catCount + ' categor' + (catCount === 1 ? 'y' : 'ies'), '#9334e9');

    // Messages
    var funnelSummary = [];
    var funnels = (S.meta.settings && S.meta.settings.funnel_stages) || [];
    for (var fi = 0; fi < funnels.length; fi++) {
      var fCnt = S.funnelCounts[funnels[fi].id] || 0;
      if (fCnt > 0) funnelSummary.push(funnels[fi].short + ' ' + fCnt);
    }
    html += renderStatCard(icon('comments'), 'Messages', S.totalMessages, funnelSummary.join(' · ') || 'No messages yet', '#1a73e8');

    // Recipes
    html += renderStatCard(icon('bolt'), 'Recipes', S.activeRecipes, 'active of ' + S.totalRecipes + ' total', '#e37400');

    // Campaigns
    html += renderStatCard(icon('bullhorn'), 'Campaigns', S.totalCampaigns, S.activeCampaigns + ' active', '#0891b2');

    html += '</div>';
    return html;
  }

  function renderStatCard(iconHtml, label, value, sub, color) {
    return '<div class="cp-stat-card">' +
      '<div class="cp-stat-icon" style="color:' + color + '">' + iconHtml + '</div>' +
      '<div class="cp-stat-body">' +
      '<div class="cp-stat-label">' + esc(label) + '</div>' +
      '<div class="cp-stat-value" style="color:' + color + '">' + formatNumber(value) + '</div>' +
      '<div class="cp-stat-sub">' + esc(sub) + '</div>' +
      '</div></div>';
  }

  function renderDashFunnelBar() {
    var funnels = (S.meta.settings && S.meta.settings.funnel_stages) || [];
    var totalFunnel = 0;
    for (var fi = 0; fi < funnels.length; fi++) totalFunnel += S.funnelCounts[funnels[fi].id] || 0;

    var html = '<div class="cp-section"><div class="cp-section-header"><h2>' + icon('filter') + ' Funnel Distribution</h2></div>';
    if (totalFunnel === 0) {
      html += '<div class="cp-empty-state cp-empty-state--compact"><p>No recipes with funnel stages yet.</p></div>';
    } else {
      html += '<div class="cp-funnel-bar">';
      for (var i = 0; i < funnels.length; i++) {
        var f = funnels[i];
        var cnt = S.funnelCounts[f.id] || 0;
        if (cnt === 0) continue;
        var w = (cnt / totalFunnel) * 100;
        html += '<div class="cp-funnel-bar-segment" style="width:' + w + '%;background:' + f.color + '" title="' + esc(f.name) + ': ' + cnt + '">';
        if (w > 8) html += '<span class="cp-funnel-bar-label">' + esc(f.short) + ' (' + cnt + ')</span>';
        html += '</div>';
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderDashPipeline() {
    var html = '<div class="cp-section"><div class="cp-section-header"><h2>' + icon('diagram-project') + ' Recipe Pipeline</h2></div>';
    html += '<div class="cp-pipeline">';
    for (var status in RECIPE_STATUSES) {
      if (status === 'archived') continue;
      var cfg = RECIPE_STATUSES[status];
      var count = S.recipeStatusCounts[status] || 0;
      html += '<div class="cp-pipeline-card" data-action="filter-pipeline-status" data-status="' + status + '">';
      html += '<div class="cp-pipeline-card-bar" style="background:' + cfg.color + '"></div>';
      html += '<div class="cp-pipeline-card-count" style="color:' + cfg.color + '">' + count + '</div>';
      html += '<div class="cp-pipeline-card-label">' + esc(cfg.label) + '</div>';
      html += '</div>';
    }
    html += '</div>';

    // Pipeline progress bar
    if (S.totalRecipes > 0) {
      html += '<div class="cp-pipeline-bar">';
      for (var s in RECIPE_STATUSES) {
        var cnt = S.recipeStatusCounts[s] || 0;
        var w = (cnt / S.totalRecipes) * 100;
        if (w > 0) html += '<div class="cp-pipeline-segment" style="width:' + w + '%;background:' + RECIPE_STATUSES[s].color + '" title="' + esc(RECIPE_STATUSES[s].label) + ': ' + cnt + '"></div>';
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderDashDiversity() {
    var ds = calculateDiversityScore();
    var html = '<div class="cp-section"><div class="cp-section-header"><h2>' + icon('chart-pie') + ' Diversity Score</h2></div>';
    html += '<div class="cp-diversity">';
    // SVG ring
    var circumference = 2 * Math.PI * 15;
    var dashArray = (ds.score / 100) * circumference;
    var scoreColor = ds.score >= 70 ? '#0d904f' : ds.score >= 40 ? '#e37400' : '#d93025';
    html += '<div class="cp-diversity-ring">';
    html += '<svg viewBox="0 0 36 36" class="cp-diversity-svg">';
    html += '<circle cx="18" cy="18" r="15" fill="none" stroke="var(--cp-border-light)" stroke-width="3"></circle>';
    if (ds.score > 0) {
      html += '<circle cx="18" cy="18" r="15" fill="none" stroke="' + scoreColor + '" stroke-width="3" stroke-dasharray="' + dashArray.toFixed(1) + ' ' + circumference.toFixed(1) + '" stroke-linecap="round" transform="rotate(-90 18 18)"></circle>';
    }
    html += '</svg>';
    html += '<span class="cp-diversity-pct" style="color:' + scoreColor + '">' + ds.score + '%</span>';
    html += '</div>';

    html += '<div class="cp-diversity-info">';
    if (ds.total === 0) {
      html += '<p>Add personas and messages to see your diversity score.</p>';
    } else {
      var scoreLabel = ds.score >= 70 ? 'Great coverage' : ds.score >= 40 ? 'Good progress' : 'Room to grow';
      html += '<div class="cp-diversity-label" style="color:' + scoreColor + '">' + scoreLabel + '</div>';
      html += '<p>' + ds.used + ' unique persona×message pairs used out of ' + ds.total + ' possible. ' + ds.remaining + ' untapped.</p>';
    }
    html += '</div></div></div>';
    return html;
  }

  function renderDashQuickActions() {
    var html = '<div class="cp-section"><div class="cp-section-header"><h2>' + icon('bolt') + ' Quick Actions</h2></div>';
    html += '<div class="cp-dash-actions">';
    html += '<button class="cp-btn cp-btn-ai cp-dash-action-btn" data-action="go-view" data-view="recipes">' + icon('bolt') + ' Create Recipe</button>';
    html += '<button class="cp-btn cp-btn-primary cp-dash-action-btn" data-action="go-view" data-view="recipes" data-sub="batch">' + icon('shuffle') + ' Batch Generate</button>';
    html += '<button class="cp-btn cp-btn-outline cp-dash-action-btn" data-action="go-view" data-view="research">' + icon('flask') + ' Research Lab</button>';
    html += '</div></div>';
    return html;
  }

  function renderDashRecentRecipes() {
    var recent = (S.data.recipes || []).slice().sort(function(a, b) {
      return (b.updated || b.created || '') > (a.updated || a.created || '') ? 1 : -1;
    }).slice(0, 5);

    var html = '<div class="cp-section"><div class="cp-section-header"><h2>' + icon('bolt') + ' Recent Recipes</h2>';
    if (S.totalRecipes > 0) html += '<a href="#" class="cp-btn-link" data-action="go-view" data-view="recipes">View all ' + icon('arrow-right') + '</a>';
    html += '</div>';

    if (recent.length === 0) {
      html += '<div class="cp-empty-state cp-empty-state--compact"><p>No recipes yet. Create your first!</p></div>';
    } else {
      html += '<div class="cp-dash-recipe-list">';
      for (var i = 0; i < recent.length; i++) {
        var r = recent[i];
        var stCfg = RECIPE_STATUSES[r.status] || { label: r.status, color: '#80868b' };
        html += '<div class="cp-dash-recipe-item" data-action="select-recipe" data-id="' + esc(r.id) + '">';
        html += '<span class="cp-status-dot" style="background:' + stCfg.color + '"></span>';
        html += '<span class="cp-dash-recipe-title">' + esc(truncate(r.title || 'Untitled Recipe', 45)) + '</span>';
        html += '<span class="cp-badge" style="background:' + stCfg.color + '15;color:' + stCfg.color + '">' + esc(stCfg.label) + '</span>';
        html += '</div>';
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderDashActivity() {
    var acts = getRecentActivity(8);
    var html = '<div class="cp-section"><div class="cp-section-header"><h2>' + icon('clock-rotate-left') + ' Recent Activity</h2>';
    if (S.activity && S.activity.length > 0) html += '<a href="#" class="cp-btn-link" data-action="go-view" data-view="activity">View all ' + icon('arrow-right') + '</a>';
    html += '</div>';

    if (acts.length === 0) {
      html += '<div class="cp-empty-state cp-empty-state--compact"><p>No activity yet.</p></div>';
    } else {
      html += '<div class="cp-activity-list">';
      for (var i = 0; i < acts.length; i++) html += renderActivityItem(acts[i]);
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderActivityItem(act) {
    var at = ACTIVITY_TYPES[act.type] || { icon: 'circle', color: '#80868b' };
    var html = '<div class="cp-activity-item">';
    html += '<div class="cp-activity-icon" style="background:' + at.color + '15;color:' + at.color + '">' + icon(at.icon) + '</div>';
    html += '<div class="cp-activity-body">';
    // Entity title (clickable if entity exists)
    if (act.entity_title) {
      html += '<div class="cp-activity-entity">';
      if (act.entity_id && act.entity_type) {
        html += '<a href="#" class="cp-activity-entity-link" data-action="select-entity" data-type="' + esc(act.entity_type) + '" data-id="' + esc(act.entity_id) + '">' + esc(act.entity_title) + '</a>';
      } else {
        html += '<span>' + esc(act.entity_title) + '</span>';
      }
      html += '</div>';
    }
    // Description
    if (act.description) html += '<div class="cp-activity-text">' + esc(act.description) + '</div>';
    // Time
    html += '<div class="cp-activity-meta">' + formatRelativeTime(act.timestamp);
    if (act.user_name) html += ' · ' + esc(act.user_name);
    html += '</div>';
    html += '</div></div>';
    return html;
  }
