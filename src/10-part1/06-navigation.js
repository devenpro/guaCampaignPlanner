  // ============================================================
  // SECTION 6: NAVIGATION
  // ============================================================

  function navigate(viewName, options) {
    options = options || {};
    if (!APP_VIEWS[viewName]) { console.warn('[CP] Unknown view:', viewName); return; }
    S.previousView = S.currentView;
    S.currentView = viewName;
    updateSidebarActive(viewName);
    renderCurrentView();
    if (!options.noHash) updateHash(options.hash || viewName);
    if (options.scrollTop !== false) $('#cpContent').scrollTop(0);
  }

  // Convenience: jump to the Campaign Workspace focused on a Campaign,
  // and optionally select an Ad Set / Ad within it.
  function navigateToCampaignV2(campaignId, adSetId, adId) {
    if (campaignId) S.selectedCampaignV2Id = campaignId;
    S.selectedAdSetId = adSetId || null;
    S.selectedAdId = adId || null;
    var h = 'campaign/' + campaignId;
    if (adSetId) h += '/ad_set/' + adSetId;
    if (adId)    h += '/ad/' + adId;
    navigate('campaign_workspace', { hash: h });
  }

  function updateHash(v) {
    if (history.replaceState) history.replaceState(null, null, '#' + v);
    else window.location.hash = v;
  }

  // Parse a hash like `campaign/cmpv2_x/ad_set/adset_y/ad/ad_z` and update
  // S.selectedCampaignV2Id / selectedAdSetId / selectedAdId. Returns the
  // resolved view name.
  function parseWorkspaceHash(h) {
    if (!h || h.indexOf('campaign/') !== 0) return null;
    var parts = h.split('/');
    // parts: ['campaign', '<id>', 'ad_set'?, '<id>'?, 'ad'?, '<id>'?]
    S.selectedCampaignV2Id = parts[1] || null;
    S.selectedAdSetId = (parts[2] === 'ad_set') ? (parts[3] || null) : null;
    S.selectedAdId    = (parts[4] === 'ad')     ? (parts[5] || null) : null;
    return 'campaign_workspace';
  }

  function readHash() {
    var h = window.location.hash.replace('#', '');
    // Nested workspace routes
    if (h.indexOf('campaign/') === 0) {
      var w = parseWorkspaceHash(h);
      if (w) return w;
    }
    return (h && APP_VIEWS[h]) ? h : (S.meta && S.meta.settings && S.meta.settings.default_view) || 'dashboard';
  }

  function updateSidebarActive(v) {
    $('.cp-nav-item').removeClass('cp-nav-item-active');
    $('.cp-nav-item[data-view="' + v + '"]').addClass('cp-nav-item-active');
  }

  function renderCurrentView() {
    var R = window._cpRenderers;
    var html = '';

    // If setup not complete, show setup view
    if (!S.meta.setup || !S.meta.setup.setup_complete) {
      try {
        html = renderSetupView();
        $('#cpContent').html(html);
        setupViewEventHandlers();
      } catch (e) {
        console.error('[CP] renderSetupView crashed:', e);
        $('#cpContent').html(renderViewCrashCard('setup', e));
      }
      return;
    }

    // Legacy 'pain_points' view was merged into Personas. Redirect any
    // bookmarks / hash routes to the Personas view with the Pain Points tab
    // pre-selected.
    if (S.currentView === 'pain_points') {
      S.currentView = 'personas';
      S.personasTab = 'pain_points';
    }

    // Error boundary — if any single view renderer throws, the user sees a
    // diagnostic card instead of a blank #cpContent (silent failure).
    try {
      switch (S.currentView) {
        case 'dashboard':    html = renderDashboardView(); break;
        case 'personas':     html = renderPersonasView(); break;
        case 'messages':     html = renderMessagesView(); break;
        case 'styles':       html = renderStylesView(); break;
        case 'formats':      html = renderFormatsPageView(); break;
        case 'meta_campaigns':     html = renderMetaCampaignsView(); break;
        case 'campaign_workspace': html = renderCampaignWorkspaceView(); break;
        case 'calendar':   html = renderCalendarView(); break;
        case 'research':   html = (R.researchView) ? R.researchView() : renderResearchPlaceholder(); break;
        case 'images':     html = (R.imagesView) ? R.imagesView() : renderImagesPlaceholder(); break;
        case 'activity':   html = renderActivityView(); break;
        case 'settings':   html = (R.settingsView) ? R.settingsView() : renderSettingsPlaceholder(); break;
        default:           html = renderDashboardView();
      }
      $('#cpContent').html(html);
      setupViewEventHandlers();

      // Trigger Part 2A/2B view-specific event setup
      if (R.setupResearchEvents && S.currentView === 'research') R.setupResearchEvents();
      if (R.setupImagesEvents && S.currentView === 'images') R.setupImagesEvents();
      if (R.setupSettingsEvents && S.currentView === 'settings') R.setupSettingsEvents();

      // Replace any AI picker placeholders left in the DOM (Part 2B loads async).
      if (typeof window._cpReplaceAiPickers === 'function') window._cpReplaceAiPickers();
    } catch (e) {
      console.error('[CP] renderCurrentView crashed for view "' + S.currentView + '":', e);
      $('#cpContent').html(renderViewCrashCard(S.currentView, e));
    }
  }

  // Diagnostic card shown when a view renderer throws. Replaces the blank
  // #cpContent silent-failure mode with something the user can act on.
  function renderViewCrashCard(viewName, err) {
    var msg = (err && err.message) ? String(err.message) : String(err);
    var stack = (err && err.stack) ? String(err.stack) : '';
    var html = '';
    html += '<div class="cp-view-crash">';
    html += '<div class="cp-view-crash-inner">';
    html += '<div class="cp-view-crash-icon">' + icon('triangle-exclamation') + '</div>';
    html += '<h2 class="cp-view-crash-title">Something went wrong rendering this view.</h2>';
    html += '<p class="cp-view-crash-view">View: <code>' + esc(viewName || '(unknown)') + '</code></p>';
    html += '<pre class="cp-view-crash-msg">' + esc(msg) + '</pre>';
    if (stack) {
      html += '<details class="cp-view-crash-stack"><summary>Stack trace</summary><pre>' + esc(stack) + '</pre></details>';
    }
    html += '<div class="cp-view-crash-actions">';
    html += '<button class="cp-btn cp-btn-primary" data-action="crash-reload">' + icon('rotate') + ' Reload page</button>';
    html += '<button class="cp-btn cp-btn-outline" data-action="crash-go-dashboard">' + icon('chart-pie') + ' Back to Dashboard</button>';
    html += '</div>';
    html += '<p class="cp-text-muted" style="margin-top:var(--cp-space-3);font-size:var(--cp-font-size-xs)">Copy the stack trace above and share it with your developer for a fix.</p>';
    html += '</div>';
    html += '</div>';
    return html;
  }

