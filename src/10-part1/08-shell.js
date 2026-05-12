  // ============================================================
  // SECTION 8: APP SHELL
  // ============================================================

  function renderApp() {
    var toolbarH = 0;
    var $toolbarBar = $('#toolbar-bar');
    if ($toolbarBar.length) {
      toolbarH = $toolbarBar.outerHeight() || 0;
      var $tray = $('#toolbar-tray-horizontal');
      if ($tray.length && $tray.is(':visible')) toolbarH += $tray.outerHeight() || 0;
    }
    document.documentElement.style.setProperty('--cp-drupal-toolbar', toolbarH + 'px');
    $('body').addClass('cp-active');
    S.$form.closest('.layout-region-node-main, .node-form').hide();
    var $app = $('<div id="cpApp" class="cp-app"></div>');
    S.$form.closest('.layout-region-node-main, .node-form').before($app);
    $app.html(renderAppShell());
    renderCurrentView();
  }

  function renderAppShell() {
    return renderHeader() +
      '<div class="cp-body">' + renderSidebar() +
      '<div class="cp-main"><div class="cp-content" id="cpContent"></div></div></div>' +
      '<div id="cpToasts" class="cp-toast-container"></div>';
  }

  function renderHeader() {
    var ws = (S.meta && S.meta.workspace) || {};
    var setup = (S.meta && S.meta.setup) || {};
    var html = '<div class="cp-header"><div class="cp-header-left">';
    html += '<button class="cp-btn-icon cp-sidebar-toggle" id="cpSidebarToggle">' + icon('menu') + '</button>';
    html += '<div class="cp-header-logo"><span class="cp-header-logo-accent">Meta</span> Campaign Planner</div>';
    if (ws.name) html += '<div class="cp-header-workspace">' + esc(ws.name) + '</div>';
    // Brand identity pill
    if (S.brand && S.brand.configured && S.brand.identity.name) {
      html += '<div class="cp-header-brand">';
      if (S.brand.identity.logoUrl) html += '<img class="cp-header-brand-logo" src="' + esc(S.brand.identity.logoUrl) + '" alt="">';
      html += '<span class="cp-header-brand-name">' + esc(S.brand.core && S.brand.core.brand_name ? S.brand.core.brand_name : S.brand.identity.name) + '</span></div>';
    }
    html += '</div><div class="cp-header-center">';
    // Global search
    html += '<div class="cp-global-search" id="cpGlobalSearch">';
    html += '<div class="cp-search-wrapper">' + icon('search') + '<input type="text" class="cp-input" id="cpGlobalSearchInput" placeholder="Search everything... (Ctrl+K)" autocomplete="off"></div>';
    html += '<div class="cp-global-search-results" id="cpGlobalSearchResults" style="display:none"></div>';
    html += '</div>';
    html += '</div><div class="cp-header-right">';
    // Research Lab shortcut (only show after setup)
    if (setup.setup_complete) {
      html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="go-view" data-view="research">' + icon('flask') + ' Research Lab</button>';
    }
    html += '<span class="cp-save-status" id="cpSaveStatus"></span>';
    html += '<span class="cp-ai-status-indicator" id="cpAIStatus" title="AI status — loading..."><span class="cp-ai-status-dot cp-ai-status-loading"></span><span class="cp-ai-status-label">AI</span></span>';
    html += '<button class="cp-btn cp-btn-primary cp-btn-sm" id="cpSaveNodeBtn">' + icon('check') + ' Save</button>';
    if (S.user.fullName) html += '<span class="cp-header-user">' + icon('user') + ' ' + esc(S.user.fullName) + '</span>';
    html += '</div></div>';
    return html;
  }

  function renderSidebar() {
    var html = '<div class="cp-sidebar' + (S.sidebarHidden ? ' cp-sidebar-hidden' : '') + '" id="cpSidebar"><div class="cp-sidebar-overlay"></div><div class="cp-sidebar-inner"><nav class="cp-nav">';

    // Grouped sidebar
    var groupOrder = ['main', 'library', 'core', 'tools'];
    for (var gi = 0; gi < groupOrder.length; gi++) {
      var gk = groupOrder[gi];
      var grp = SIDEBAR_GROUPS[gk];
      html += '<div class="cp-nav-group">';
      html += '<div class="cp-nav-group-label">' + esc(grp.label) + '</div>';

      var metaV2 = !!(S.meta && S.meta.setup && S.meta.setup.meta_v2);
      for (var key in APP_VIEWS) {
        var v = APP_VIEWS[key];
        if (v.group !== gk) continue;
        if (v.hidden) continue;                       // never in sidebar (e.g. campaign_workspace)
        if (v.metaV2 && !metaV2) continue;            // gated to v2-enabled workspaces
        if (v.legacy && metaV2) continue;             // hide legacy entries once v2 is on
        var active = S.currentView === key ? ' cp-nav-item-active' : '';
        var badgeHtml = renderSidebarBadge(key);
        html += '<a href="#' + key + '" class="cp-nav-item' + active + '" data-view="' + key + '">';
        html += '<span class="cp-nav-icon">' + icon(v.icon) + '</span>';
        html += '<span class="cp-nav-label">' + esc(v.label) + '</span>';
        html += badgeHtml + '</a>';
      }
      html += '</div>';
    }

    html += '</nav>';

    // Workspace footer
    var ws = (S.meta && S.meta.workspace) || {};
    var setup = (S.meta && S.meta.setup) || {};
    html += '<div class="cp-sidebar-footer">';
    html += '<div class="cp-sidebar-footer-label">Workspace</div>';
    html += '<div class="cp-sidebar-footer-name">' + esc(ws.name || 'Meta Campaign Planner') + '</div>';
    html += '<div class="cp-sidebar-footer-meta">Meta Ads' + (setup.setup_complete ? ' · Setup ✓' : '') + (setup.meta_v2 ? ' · v2' : '') + '</div>';
    html += '</div>';

    html += '</div></div>';
    return html;
  }

  function renderSidebarBadge(viewKey) {
    var count = 0;
    switch (viewKey) {
      case 'personas': count = S.totalPersonas; break;
      case 'messages': count = S.totalMessages; break;
      case 'styles': count = S.totalStyles + S.totalFormats; break;
      case 'recipes': count = S.activeRecipes; break;
      case 'campaigns': count = S.activeCampaigns; break;
      case 'meta_campaigns': count = S.activeCampaignsV2; break;
      case 'images': count = S.images.length; break;
      case 'activity':
        var recent24h = (S.activity || []).filter(function(a) {
          return a.timestamp && (Date.now() - new Date(a.timestamp).getTime()) < 86400000;
        }).length;
        count = recent24h; break;
      default: count = 0;
    }
    return count > 0 ? '<span class="cp-nav-badge">' + count + '</span>' : '';
  }

