  // ============================================================
  // SECTION 3: INITIALIZATION
  // ============================================================

  function isCpPage() { return $('body').hasClass('node--type-campaign-planner'); }

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
      console.log('[CP] Part 1 initialized — ' + S.totalRecipes + ' recipes, ' + S.totalPersonas + ' personas, ' + S.totalMessages + ' messages, user: ' + (S.user.name || 'unknown'));
    } catch(e) {
      console.error('[CP] Part 1 init CRASHED:', e.message, e.stack);
      S._initializing = false;
      return;
    }

    // Timeout: if Part 2B hasn't loaded in 8 seconds, re-render with helpful messages
    setTimeout(function() {
      var R = window._cpRenderers || {};
      if (!R.researchView || !R.settingsView || !R.imagesView) {
        var diag = [];
        if (!window._cpPart2AScript) diag.push('Part 2A script not loaded');
        else if (!window._cpPart2A) diag.push('Part 2A crashed during init');
        else diag.push('Part 2A OK');
        if (!window._cpPart2B) diag.push('Part 2B not initialized');
        console.warn('[CP] Part 2B not loaded after 8s — ' + diag.join('; '));
        S._part2bTimeout = true;
        if (S.currentView === 'research' || S.currentView === 'settings' || S.currentView === 'images') renderCurrentView();
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
    // Detect and hide image field
    S.$imageField = S.$form.find('.field--name-field-images');
    if (S.$imageField.length) {
      S.$imageField.hide();
      console.log('[CP] Image field detected');
    } else {
      console.log('[CP] No image field found (field_images)');
    }
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

    // Parse images from Drupal field
    parseImageField();

    // Parse brand data from DOM
    parseBrandData();
  }

  function parseImageField() {
    S.images = []; S.imageMap = {};
    if (!S.$imageField || !S.$imageField.length) return;
    var imgMeta = (S.meta && S.meta.reference_images) || {};

    S.$imageField.find('.image-widget, [data-drupal-selector*="edit-field-images"]').each(function(idx) {
      var $widget = $(this);
      var $img = $widget.find('.image-preview img, .image-style-thumbnail, img').first();
      var $fileLink = $widget.find('.file a, a[href*="/files/"]').first();
      var imgUrl = '';
      if ($img.length) imgUrl = $img.attr('src') || '';
      if (!imgUrl && $fileLink.length) imgUrl = $fileLink.attr('href') || '';
      if (!imgUrl) return;

      var fid = '';
      var $fidInput = $widget.find('input[name*="fids"], input[data-fid]');
      if ($fidInput.length) fid = $fidInput.data('fid') || $fidInput.val() || '';
      if (!fid) {
        var $anyInput = $widget.find('input[name*="field_images"]').first();
        if ($anyInput.length) {
          var match = $anyInput.attr('name').match(/field_images\[(\d+)\]/);
          if (match) fid = 'idx_' + match[1];
        }
      }
      if (!fid) fid = 'img_' + idx;

      var filename = '';
      if ($fileLink.length) filename = $fileLink.text().trim();
      if (!filename && imgUrl) filename = imgUrl.split('/').pop().split('?')[0];

      var alt = $img.attr('alt') || '';
      var meta = imgMeta[fid] || {};

      S.images.push({
        fid: String(fid), url: imgUrl, filename: filename, alt: alt, index: idx,
        category: meta.category || '', tags: meta.tags || [], star: !!meta.star,
        description: meta.description || '', notes: meta.notes || '', usage: meta.usage || []
      });
    });

    for (var i = 0; i < S.images.length; i++) S.imageMap[S.images[i].fid] = S.images[i];
    console.log('[CP] Parsed ' + S.images.length + ' reference images');
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

