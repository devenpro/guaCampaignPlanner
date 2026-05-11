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
    if (!options.noHash) updateHash(viewName);
    if (options.scrollTop !== false) $('#cpContent').scrollTop(0);
  }

  function updateHash(v) {
    if (history.replaceState) history.replaceState(null, null, '#' + v);
    else window.location.hash = v;
  }

  function readHash() {
    var h = window.location.hash.replace('#', '');
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

