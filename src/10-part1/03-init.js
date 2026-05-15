  // ============================================================
  // SECTION 3: INITIALIZATION
  // ============================================================

  function isCpPage() { return $('body').hasClass('node--type-campaign-planner'); }

  console.log('%c[CP] Campaign Planner v' + (window.CP_VERSION || 'dev') + ' · built ' + (window.CP_BUILD_TIME || 'local'), 'font-weight:bold;color:#1a73e8');
  console.log('[CP] Part 1 script loaded. Page check: isCpPage=' + isCpPage() + ', body classes: ' + ($('body').attr('class') || '').substring(0, 120));

  Drupal.behaviors = Drupal.behaviors || {};
  Drupal.behaviors.cpPart1 = {
    attach: function(context) {
      if (S.initialized || S._initializing) return;
      if (!isCpPage()) { console.log('[CP] behaviors.attach: not a CP page, skipping'); return; }
      if (!$(context).find('#edit-field-json-data-0-value').length && !$(context).find('#edit-field-json-meta-0-value').length && context !== document) { console.log('[CP] behaviors.attach: form fields not found in context'); return; }
      console.log('[CP] behaviors.attach → calling init()');
      init();
    }
  };

  // Fallback: if Drupal.behaviors didn't trigger init, try on window load
  window.addEventListener('load', function() {
    if (S.initialized || S._initializing) return;
    if (!isCpPage()) return;
    console.log('[CP] window.load fallback → calling init()');
    init();
  });

  function init() {
    if (S._initializing || S.initialized) return;
    S._initializing = true;
    console.log('[CP] Initializing Part 1...');

    try {
      parseUserData();
      if (!detectDrupalForm()) {
        console.error('[CP] Could not find Drupal form');
        S._initializing = false;
        return;
      }

      loadData();
      migrateMeta();
      migrateData();
      injectQuillCSS();
      buildMaps();
      renderApp();
      setupEventHandlers();
      startAutoSave();

      S.initialized = true;
      S._initializing = false;
      console.log('[CP] Part 1 initialized — ' + S.totalAds + ' ads, ' + S.totalCampaignsV2 + ' campaigns, ' + S.totalPersonas + ' personas, ' + S.totalMessages + ' messages, user: ' + (S.user.name || 'unknown'));

      // Auto-launch the Setup Wizard on an empty workspace. Part 2A owns the
      // wizard; defer one tick so the harness finishes wiring up renderers
      // before the modal opens (the wizard's AI buttons depend on _cpRenderers).
      setTimeout(function() {
        var P2A = window._cpPart2A;
        if (P2A && typeof P2A.maybeAutoLaunchSetupWizard === 'function') {
          try { P2A.maybeAutoLaunchSetupWizard(); }
          catch(e2) { console.warn('[CP] Auto-launch setup wizard failed:', e2); }
        }
      }, 0);
    } catch(e) {
      console.error('[CP] Part 1 init CRASHED:', e.message, e.stack);
      S._initializing = false;
      return;
    }

    // Timeout: if Part 2B hasn't loaded in 8 seconds, re-render with helpful messages
    setTimeout(function() {
      var R = window._cpRenderers || {};
      if (!R.researchView || !R.settingsView) {
        var diag = [];
        if (!window._cpPart2AScript) diag.push('Part 2A script not loaded');
        else if (!window._cpPart2A) diag.push('Part 2A crashed during init');
        else diag.push('Part 2A OK');
        if (!window._cpPart2B) diag.push('Part 2B not initialized');
        console.warn('[CP] Part 2B not loaded after 8s — ' + diag.join('; '));
        S._part2bTimeout = true;
        if (S.currentView === 'research' || S.currentView === 'settings') renderCurrentView();
      }
    }, 8000);
  }

  function parseUserData() {
    var $ud = $('#guau-userdata');
    if (!$ud.length) { console.warn('[CP] User data div not found'); return; }
    S.user = {
      id: ($ud.find('#guau-userid').text() || '').trim(),
      name: ($ud.find('#guau-username').text() || '').trim(),
      email: ($ud.find('#guau-useremail').text() || '').trim(),
      fullName: ($ud.find('#guau-userfullname').text() || '').trim(),
      timezone: ($ud.find('#guau-usertimezone').text() || '').trim(),
      roles: ($ud.find('#guau-userroles').text() || '').trim()
    };
    console.log('[CP] User: ' + S.user.fullName + ' (' + S.user.name + ', id=' + S.user.id + ')');
  }

  function detectDrupalForm() {
    var $ta = $('#edit-field-json-data-0-value');
    var $metaTa = $('#edit-field-json-meta-0-value');
    var $actTa = $('#edit-field-activity-log-0-value');
    if (!$ta.length || !$metaTa.length || !$actTa.length) return false;
    S.$textarea = $ta; S.$metaTextarea = $metaTa; S.$activityTextarea = $actTa;
    S.$form = $ta.closest('form');
    S.$submitBtn = S.$form.find('#edit-submit, [data-drupal-selector="edit-submit"]').first();
    S.$textarea.closest('.field--name-field-json-data').hide();
    S.$metaTextarea.closest('.field--name-field-json-meta').hide();
    S.$activityTextarea.closest('.field--name-field-activity-log').hide();
    S.$form.find('.node-form-options, .field--name-title, .form-actions').hide();
    // Hide the legacy images field if it's still present on the content type
    // (the feature is removed from the UI; the storage field is owned by the
    // Drupal admin and will be dropped separately).
    var $legacyImages = S.$form.find('.field--name-field-images');
    if ($legacyImages.length) $legacyImages.hide();
    return true;
  }

  function loadData() {
    var rawData = S.$textarea.val();
    if (rawData && rawData.trim()) {
      try { S.data = JSON.parse(rawData); } catch (e) { console.error('[CP] JSON data parse error:', e); S.data = getDefaultData(); }
    } else { S.data = getDefaultData(); }

    var rawMeta = S.$metaTextarea.val();
    if (rawMeta && rawMeta.trim()) {
      try { S.meta = JSON.parse(rawMeta); } catch (e) { console.error('[CP] JSON meta parse error:', e); S.meta = getDefaultMeta(); }
    } else { S.meta = getDefaultMeta(); }

    var rawActivity = S.$activityTextarea.val();
    if (rawActivity && rawActivity.trim()) {
      try { S.activity = JSON.parse(rawActivity); } catch (e) { console.error('[CP] JSON activity parse error:', e); S.activity = []; }
    } else { S.activity = []; }
    if (!Array.isArray(S.activity)) S.activity = [];

    // Parse brand data from DOM
    parseBrandData();

    // Parse production-node list from the Drupal media-productions view block
    parseProductionData();
  }

  // Build S.productionMap from the Drupal view-media-productions block.
  // Production nodes are keyed by `data-planner-id`, which now corresponds
  // to a Meta v2 Ad id. The map is consulted by the Ad pipeline UI; we no
  // longer mirror into entity-level caches.
  function parseProductionData() {
    S.productionMap = {};
    var $items = $('.media-production-data .media-production-item, .view-media-productions .media-production-item');
    if (!$items.length) {
      console.log('[CP] No media-production-data view block found on page');
      return;
    }
    $items.each(function() {
      var $item = $(this);
      var plannerId = ($item.attr('data-planner-id') || '').trim();
      if (!plannerId) return;
      var entry = _readProductionItem($item, plannerId);
      if (!entry.node_id) return;
      S.productionMap[plannerId] = entry;
    });
    console.log('[CP] Parsed ' + Object.keys(S.productionMap).length + ' production node(s)');
  }

  function _readProductionItem($item, plannerId) {
    var $created = $item.find('.mp-created time').first();
    var $updated = $item.find('.mp-updated time').first();
    var rawType = ($item.find('.mp-type').text() || $item.attr('data-mp-type') || '').trim();
    var typeKey = rawType.replace(/-/g, '_').toLowerCase();
    return {
      node_id:    ($item.find('.mp-id').text() || '').trim(),
      title:      ($item.find('.mp-title').text() || '').trim(),
      url:        ($item.find('.mp-url').text() || '').trim(),
      status:     ($item.find('.mp-status').text() || '').trim(),
      type:       rawType,
      media_type: PRODUCTION_TYPE_TO_MEDIA[typeKey] || '',
      director:   ($item.find('.mp-director').text() || '').trim(),
      created:    ($created.attr('datetime') || $item.find('.mp-created').text() || '').trim(),
      updated:    ($updated.attr('datetime') || $item.find('.mp-updated').text() || '').trim(),
      planner_id: plannerId,
      _parsed_at: new Date().toISOString()
    };
  }

  function parseBrandData() {
    var $bd = $('.brand-data');
    if (!$bd.length) { S.brand.configured = false; return; }

    function parseDiv(sel) {
      var $el = $bd.find(sel);
      if (!$el.length) return null;
      try { return JSON.parse($el.text()); } catch (e) { return null; }
    }

    S.brand.core = parseDiv('.brand-core-data');
    S.brand.video = parseDiv('.brand-video-data');
    S.brand.content = parseDiv('.brand-content-data');
    S.brand.seo = parseDiv('.brand-seo-data');
    S.brand.social = parseDiv('.brand-social-data');

    // Identity — name, id, logo come from sibling spans/divs inside .brand-data
    var idFromDom = ($bd.find('.brand-id').text() || '').trim();
    var nameFromDom = ($bd.find('.brand-name').text() || '').trim();
    var logoFromDom = ($bd.find('.brand-logo-url').text() || '').trim();

    if (S.brand.core || idFromDom || nameFromDom) {
      S.brand.identity = {
        name: nameFromDom || (S.brand.core && S.brand.core.brand_name) || '',
        id: idFromDom || (S.brand.core && (S.brand.core.id || S.brand.core.brand_id || S.brand.core.nid)) || '',
        logoUrl: logoFromDom || (S.brand.core && S.brand.core.logo_url) || ''
      };
      S.brand.configured = !!(S.brand.identity.name || S.brand.core);
      if (S.brand.configured) console.log('[CP] Brand data loaded: ' + S.brand.identity.name + (S.brand.identity.id ? ' (#' + S.brand.identity.id + ')' : ''));
    } else {
      S.brand.configured = false;
    }
  }

  function injectQuillCSS() {
    if (!$('link[href*="quill"]').length) {
      $('head').append('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css">');
    }
  }

