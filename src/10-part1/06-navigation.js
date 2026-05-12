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
      html = renderSetupView();
      $('#cpContent').html(html);
      setupViewEventHandlers();
      return;
    }

    switch (S.currentView) {
      case 'dashboard':    html = renderDashboardView(); break;
      case 'personas':     html = renderPersonasView(); break;
      case 'pain_points':  html = renderPainPointsPageView(); break;
      case 'messages':     html = renderMessagesView(); break;
      case 'styles':       html = renderStylesView(); break;
      case 'formats':      html = renderFormatsPageView(); break;
      case 'recipes':      html = renderRecipesView(); break;
      case 'campaigns':  html = renderCampaignsView(); break;
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
  }

