/**
 * Campaign Planner v1.0 - Part 1: Core Engine
 *
 * Meta ad creative planning app with 4-dimension creative diversity,
 * personas, messages, styles, visual formats, recipe pipeline, campaigns.
 *
 * Sections:
 *  1. Constants (15 objects)
 *  2. State object
 *  3. Initialization
 *  4. Migration & defaults
 *  5. Map builders
 *  6. Navigation
 *  7. Utilities (icons 100+, badges, formatters, getters)
 *  8. App shell (header, sidebar, 11 nav items) — Phase 1B
 *  9. Setup view — Phase 1B
 * 10. Dashboard view — Phase 1B
 * 11. Personas view — Phase 1C
 * 12. Messages view — Phase 1C
 * 13. Styles view — Phase 1C
 * 14. Recipes view (list) — Phase 1D
 * 15. Campaigns view — Phase 1D
 * 16. Calendar view — Phase 1D
 * 17. Activity view — Phase 1D
 * 18. Placeholder views — Phase 1D
 * 19. Filtering & sorting — Phase 1E
 * 20. Event handlers — Phase 1E
 * 21. CRUD helpers — Phase 1E
 * 22. Sync, save, toast, auto-status — Phase 1E
 * 23. API exports — Phase 1E
 *
 * @version 1.0.0
 */
(function($, Drupal) {
  'use strict';

  window._cpRenderers = window._cpRenderers || {};

  // ============================================================
  // SECTION 1: CONSTANTS
  // ============================================================

  var APP_VIEWS = {
    'dashboard':   { order: 1,  label: 'Dashboard',    icon: 'chart-pie',          group: 'main',    description: 'Overview & stats' },
    'personas':    { order: 2,  label: 'Personas',     icon: 'users',              group: 'library', description: 'Audience personas' },
    'pain_points': { order: 3,  label: 'Pain Points',  icon: 'bolt',               group: 'library', description: 'Pain points & solutions' },
    'messages':    { order: 4,  label: 'Messages',     icon: 'comments',           group: 'library', description: 'Message library' },
    'styles':      { order: 5,  label: 'Styles',       icon: 'palette',            group: 'library', description: 'Creative styles' },
    'formats':     { order: 6,  label: 'Formats',      icon: 'clapperboard',       group: 'library', description: 'Visual formats' },
    'recipes':     { order: 7,  label: 'Recipes',      icon: 'shuffle',            group: 'core',    description: 'Creative recipes' },
    'campaigns':   { order: 8,  label: 'Campaigns',    icon: 'bullhorn',           group: 'core',    description: 'Campaign planning' },
    'calendar':    { order: 9,  label: 'Calendar',     icon: 'calendar',           group: 'core',    description: 'Timeline view' },
    'research':    { order: 10, label: 'Research Lab',  icon: 'flask',             group: 'tools',   description: 'AI research hub' },
    'images':      { order: 11, label: 'Images',       icon: 'images',             group: 'tools',   description: 'Reference images' },
    'activity':    { order: 12, label: 'Activity',     icon: 'clock-rotate-left',  group: 'tools',   description: 'Activity log' },
    'settings':    { order: 13, label: 'Settings',     icon: 'gear',               group: 'tools',   description: 'Workspace config' }
  };

  var SIDEBAR_GROUPS = {
    'main':    { label: 'Main',             order: 0 },
    'library': { label: 'Creative Library', order: 1 },
    'core':    { label: 'Workspace',        order: 2 },
    'tools':   { label: 'Tools',            order: 3 }
  };

  var DIMENSIONS = {
    'persona': { key: 'persona', label: 'Persona',       icon: 'user',         color: '#9334e9' },
    'message': { key: 'message', label: 'Message',       icon: 'comment-dots', color: '#1a73e8' },
    'style':   { key: 'style',   label: 'Style',         icon: 'palette',      color: '#e37400' },
    'format':  { key: 'format',  label: 'Visual Format', icon: 'clapperboard', color: '#0891b2' }
  };

  var RECIPE_STATUSES = {
    'draft':         { key: 'draft',         label: 'Draft',         icon: 'pencil',            color: '#80868b', order: 0 },
    'hook_ready':    { key: 'hook_ready',    label: 'Hook Ready',    icon: 'anchor',            color: '#9334e9', order: 1 },
    'content_ready': { key: 'content_ready', label: 'Content Ready', icon: 'pen-fancy',         color: '#1a73e8', order: 2 },
    'media_ready':   { key: 'media_ready',   label: 'Media Ready',   icon: 'wand-magic',        color: '#7c3aed', order: 3 },
    'in_review':     { key: 'in_review',     label: 'In Review',     icon: 'magnifying-glass',  color: '#e37400', order: 4 },
    'approved':      { key: 'approved',      label: 'Approved',      icon: 'circle-check',      color: '#0d904f', order: 5 },
    'live':          { key: 'live',          label: 'Live',          icon: 'signal',            color: '#0891b2', order: 6 },
    'paused':        { key: 'paused',        label: 'Paused',        icon: 'pause',             color: '#be123c', order: 7 },
    'archived':      { key: 'archived',      label: 'Archived',      icon: 'box-archive',       color: '#bdc1c6', order: 8 }
  };

  var STATUS_ORDER = ['draft', 'hook_ready', 'content_ready', 'media_ready', 'in_review', 'approved', 'live', 'paused', 'archived'];
  var ACTIVE_STATUSES = ['draft', 'hook_ready', 'content_ready', 'media_ready', 'in_review', 'approved', 'live'];

  var CAMPAIGN_STATUSES = {
    'planning':  { key: 'planning',  label: 'Planning',  icon: 'clipboard-list', color: '#e37400' },
    'active':    { key: 'active',    label: 'Active',    icon: 'bolt',           color: '#0d904f' },
    'paused':    { key: 'paused',    label: 'Paused',    icon: 'pause',          color: '#be123c' },
    'completed': { key: 'completed', label: 'Completed', icon: 'flag-checkered', color: '#1a73e8' },
    'archived':  { key: 'archived',  label: 'Archived',  icon: 'box-archive',    color: '#80868b' }
  };

  var FUNNEL_DEFAULTS = [
    { id: 'fs_top', name: 'Top of Funnel',    short: 'TOFU', color: '#1a73e8', order: 0, system: true },
    { id: 'fs_mid', name: 'Middle of Funnel',  short: 'MOFU', color: '#e37400', order: 1, system: true },
    { id: 'fs_bot', name: 'Bottom of Funnel',  short: 'BOFU', color: '#0d904f', order: 2, system: true }
  ];

  var PIPELINE_STEPS = [
    { key: 'composition', label: 'Composition', icon: 'shapes',       order: 0 },
    { key: 'hook',        label: 'Hook',        icon: 'anchor',       order: 1 },
    { key: 'content',     label: 'Content',     icon: 'pen-fancy',    order: 2 },
    { key: 'media',       label: 'Media',       icon: 'wand-magic',   order: 3 },
    { key: 'review',      label: 'Review',      icon: 'eye',          order: 4 }
  ];

  var MEDIA_TYPES = {
    'image': { key: 'image', label: 'Image', icon: 'image',  color: '#1a73e8' },
    'video': { key: 'video', label: 'Video', icon: 'video',  color: '#d93025' }
  };

  var HOOK_TYPES = {
    'question':  { key: 'question',  label: 'Question',   color: '#1a73e8' },
    'bold':      { key: 'bold',      label: 'Bold Claim', color: '#e37400' },
    'story':     { key: 'story',     label: 'Story',      color: '#9334e9' },
    'data':      { key: 'data',      label: 'Data/Stat',  color: '#0d904f' },
    'direct':    { key: 'direct',    label: 'Direct',     color: '#0891b2' }
  };

  var PRIORITY_LEVELS = {
    'low':      { key: 'low',      label: 'Low',      icon: 'arrow-down', color: '#0d904f' },
    'medium':   { key: 'medium',   label: 'Medium',   icon: 'minus',      color: '#e37400' },
    'high':     { key: 'high',     label: 'High',     icon: 'arrow-up',   color: '#d93025' },
    'critical': { key: 'critical', label: 'Critical', icon: 'bolt',       color: '#be123c' }
  };

  var CAMPAIGN_OBJECTIVES = [
    { id: 'obj_leads',       name: 'Lead Generation',  icon: 'user-plus' },
    { id: 'obj_awareness',   name: 'Brand Awareness',  icon: 'eye' },
    { id: 'obj_conversions', name: 'Conversions',      icon: 'cart-shopping' },
    { id: 'obj_traffic',     name: 'Traffic',          icon: 'arrow-pointer' },
    { id: 'obj_engagement',  name: 'Engagement',       icon: 'heart' }
  ];

  var FORMAT_CATEGORIES = [
    { id: 'vfc_shoot',     name: 'Shoot',     icon: 'camera' },
    { id: 'vfc_ugc',       name: 'UGC',       icon: 'mobile' },
    { id: 'vfc_graphic',   name: 'Graphic',   icon: 'pen-ruler' },
    { id: 'vfc_animation', name: 'Animation', icon: 'film' }
  ];

  var PAIN_POINT_CATEGORIES = [
    { id: 'ppc_productivity', name: 'Productivity' },
    { id: 'ppc_cost',         name: 'Cost / Budget' },
    { id: 'ppc_knowledge',    name: 'Knowledge Gap' },
    { id: 'ppc_competition',  name: 'Competition' },
    { id: 'ppc_growth',       name: 'Growth' }
  ];

  var ACTIVITY_TYPES = {
    'recipe_created':            { icon: 'plus',           color: '#0d904f' },
    'recipe_updated':            { icon: 'edit',           color: '#1a73e8' },
    'recipe_status_changed':     { icon: 'refresh',        color: '#1a73e8' },
    'recipe_deleted':            { icon: 'trash',          color: '#d93025' },
    'recipe_batch_generated':    { icon: 'bolt',           color: '#e37400' },
    'persona_created':           { icon: 'user',           color: '#9334e9' },
    'persona_updated':           { icon: 'user',           color: '#9334e9' },
    'persona_deleted':           { icon: 'trash',          color: '#d93025' },
    'category_created':          { icon: 'folder-plus',    color: '#9334e9' },
    'category_deleted':          { icon: 'trash',          color: '#d93025' },
    'message_created':           { icon: 'comment-dots',   color: '#1a73e8' },
    'message_updated':           { icon: 'comment-dots',   color: '#1a73e8' },
    'message_deleted':           { icon: 'trash',          color: '#d93025' },
    'style_created':             { icon: 'palette',        color: '#e37400' },
    'style_updated':             { icon: 'palette',        color: '#e37400' },
    'style_deleted':             { icon: 'trash',          color: '#d93025' },
    'format_created':            { icon: 'clapperboard',   color: '#0891b2' },
    'format_updated':            { icon: 'clapperboard',   color: '#0891b2' },
    'format_deleted':            { icon: 'trash',          color: '#d93025' },
    'pain_point_created':        { icon: 'bolt',           color: '#d93025' },
    'pain_point_updated':        { icon: 'bolt',           color: '#d93025' },
    'pain_point_deleted':        { icon: 'trash',          color: '#d93025' },
    'campaign_created':          { icon: 'bullhorn',       color: '#0891b2' },
    'campaign_updated':          { icon: 'bullhorn',       color: '#0891b2' },
    'campaign_deleted':          { icon: 'trash',          color: '#d93025' },
    'brief_generated':           { icon: 'sparkles',       color: '#7c3aed' },
    'hook_generated':            { icon: 'anchor',         color: '#9334e9' },
    'content_generated':         { icon: 'pen-fancy',      color: '#1a73e8' },
    'media_generated':           { icon: 'wand-magic',     color: '#7c3aed' },
    'script_generated':          { icon: 'video',          color: '#d93025' },
    'delivery_notes_generated':  { icon: 'sparkles',       color: '#e37400' },
    'pain_points_generated':     { icon: 'sparkles',       color: '#9334e9' },
    'messages_suggested':        { icon: 'sparkles',       color: '#1a73e8' },
    'personas_researched':       { icon: 'flask',          color: '#9334e9' },
    'styles_researched':         { icon: 'flask',          color: '#e37400' },
    'formats_researched':        { icon: 'flask',          color: '#0891b2' },
    'image_uploaded':            { icon: 'upload',         color: '#0d904f' },
    'tag_created':               { icon: 'tag',            color: '#0d904f' },
    'tag_updated':               { icon: 'tag',            color: '#1a73e8' },
    'tag_deleted':               { icon: 'trash',          color: '#d93025' },
    'settings_changed':          { icon: 'gear',           color: '#80868b' },
    'data_imported':             { icon: 'upload',         color: '#1a73e8' },
    'data_exported':             { icon: 'download',       color: '#1a73e8' },
    'setup_completed':           { icon: 'circle-check',   color: '#0d904f' }
  };

  var CARD_DENSITIES = {
    'compact':  { label: 'Compact',  icon: 'list',        rowHeight: 40 },
    'normal':   { label: 'Normal',   icon: 'menu',        rowHeight: 56 },
    'detailed': { label: 'Detailed', icon: 'layout-grid',  rowHeight: 72 }
  };

  var GROUPING_OPTIONS = [
    { key: 'status',   label: 'Status' },
    { key: 'campaign', label: 'Campaign' },
    { key: 'funnel',   label: 'Funnel Stage' },
    { key: 'persona',  label: 'Persona' },
    { key: 'priority', label: 'Priority' },
    { key: 'tag',      label: 'Tag' }
  ];

  // ============================================================
  // SECTION 2: STATE OBJECT
  // ============================================================

  var S = {
    // Data (from JSON fields)
    data: { persona_categories: [], personas: [], pain_points: [], messages: [], styles: [], visual_formats: [], recipes: [], campaigns: [], tags: [], research_sessions: [] },
    meta: { workspace: {}, setup: {}, settings: {}, aiPreferences: {} },
    activity: [],
    user: { id: '', name: '', email: '', fullName: '', timezone: '', roles: '' },
    brand: { configured: false, identity: {}, core: null, video: null, content: null, seo: null, social: null },

    // Lookup maps (rebuilt by buildMaps)
    personaMap: {}, categoryMap: {}, painPointMap: {},
    messageMap: {}, styleMap: {}, formatMap: {},
    recipeMap: {}, campaignMap: {}, tagMap: {},
    funnelStageMap: {}, researchMap: {},

    // Aggregated counts
    recipeStatusCounts: {}, campaignStatusCounts: {},
    funnelCounts: {},
    personaRecipeCounts: {}, messageRecipeCounts: {},
    styleRecipeCounts: {}, formatRecipeCounts: {},
    categoryPersonaCounts: {},
    tagIndex: {},
    totalRecipes: 0, activeRecipes: 0,
    totalPersonas: 0, totalMessages: 0, totalStyles: 0, totalFormats: 0,
    totalCampaigns: 0, activeCampaigns: 0,

    // UI state
    currentView: 'dashboard', previousView: null,
    selectedRecipeId: null, currentStep: 'composition',
    selectedPersonaId: null, selectedCategoryId: null,
    selectedMessageId: null, selectedCampaignId: null,
    selectedImageId: null, selectedTagId: null,
    personasTab: 'personas', // 'personas' or 'pain_points'
    stylesTab: 'styles', // 'styles' or 'formats'
    settingsTab: 'workspace',
    cardDensity: 'normal',
    sidebarHidden: false,

    // Recipe list filters
    recipeGroupBy: 'status',
    recipeFilter: { search: '', statuses: [], campaign: '', persona: '', funnel: '', priority: '', type: '', tag: '', sortBy: 'updated', sortDir: 'desc' },
    collapsedGroups: {},

    // Persona search
    personaFilter: { search: '' },
    // Message filter
    messageFilter: { search: '', funnel: '', sortBy: 'updated' },
    // Campaign filter
    campaignFilter: { search: '', status: '' },
    selectedCampaignId: null,
    campaignDetailTab: 'overview',
    // Pain point filter + selection
    painPointFilter: { search: '', category: '' },
    selectedPainPointId: null,
    // Format filter
    formatFilter: { search: '', category: '' },

    // Calendar state
    calendarYear: null, calendarMonth: null,
    calendarMode: 'month',
    calendarWeekStart: null,
    calendarFilters: { campaign: '', status: '', funnel: '' },
    calendarPopover: null,

    // Activity filter
    activityFilter: { search: '', type: '' },

    // Images state
    images: [], imageMap: {}, $imageField: null,
    imageFilter: { search: '', category: '', tag: '', star: false, sort: 'newest' },
    imageViewMode: 'grid',

    // AI Research panel state (per view)
    aiResearchOpen: { personas: false, pain_points: false, messages: false, styles: false, formats: false, campaign_research: false },

    // Drupal refs + flags
    $textarea: null, $metaTextarea: null, $activityTextarea: null, $form: null, $submitBtn: null,
    _initializing: false, initialized: false, _part2bTimeout: false,
    dirty: false, autoSaveTimer: null, lastSaved: null
  };

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

    // Identity from core
    if (S.brand.core) {
      S.brand.identity = {
        name: S.brand.core.brand_name || '',
        logoUrl: S.brand.core.logo_url || ''
      };
      S.brand.configured = true;
      console.log('[CP] Brand data loaded: ' + S.brand.identity.name);
    } else {
      S.brand.configured = false;
    }
  }

  function injectQuillCSS() {
    if (!$('link[href*="quill"]').length) {
      $('head').append('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css">');
    }
  }

  // ============================================================
  // SECTION 4: MIGRATION & DEFAULTS
  // ============================================================

  function getDefaultData() {
    return {
      persona_categories: [], personas: [], pain_points: [],
      messages: [], styles: [], visual_formats: [],
      recipes: [], campaigns: [], tags: [],
      research_sessions: []
    };
  }

  function getDefaultMeta() {
    return {
      workspace: { name: '', description: '', created: new Date().toISOString() },
      setup: { product_name: '', objective: '', custom_instructions: '', setup_complete: false },
      settings: {
        timezone: 'Asia/Kolkata',
        default_view: 'dashboard',
        card_density: 'normal',
        funnel_stages: deepClone(FUNNEL_DEFAULTS),
        campaign_objectives: deepClone(CAMPAIGN_OBJECTIVES),
        visual_format_categories: deepClone(FORMAT_CATEGORIES),
        pain_point_categories: deepClone(PAIN_POINT_CATEGORIES),
        defaults: { priority: 'medium', funnel_stage: 'fs_top', recipe_status: 'draft', campaign_status: 'planning' },
        brand_design: getDefaultBrandDesign()
      },
      aiPreferences: { appDefault: { provider: '', model: '' }, perAction: {}, lastProvider: '', lastModel: '' },
      reference_images: {},
      image_categories: getDefaultImageCategories()
    };
  }

  function getDefaultBrandDesign() {
    return {
      colors: { primary: '', secondary: '', accent: '', background: '#ffffff', text: '#202124', palette_description: '' },
      typography: { heading_style: '', body_style: '', text_treatment: '' },
      visual_style: { overall_aesthetic: '', photography_style: '', illustration_style: '', icon_style: '', pattern_usage: '', mood: '' },
      layout_rules: { image_composition: '', ad_format_notes: '', border_radius: '', spacing: '' },
      reference_image_ids: { primary_style: [], ad_examples: [], mood_board: [] },
      brand_prompt_prefix: ''
    };
  }

  function getDefaultImageCategories() {
    return [
      { id: 'ad_example',  label: 'Ad Example',       icon: 'rectangle-ad', color: '#1a73e8' },
      { id: 'mood_board',  label: 'Mood Board',       icon: 'swatchbook',   color: '#9334e9' },
      { id: 'style_ref',   label: 'Style Reference',  icon: 'palette',      color: '#e37400' },
      { id: 'format_ref',  label: 'Format Reference', icon: 'clapperboard', color: '#0891b2' },
      { id: 'logo',        label: 'Logo',             icon: 'flag',         color: '#0d904f' },
      { id: 'other',       label: 'Other',            icon: 'folder',       color: '#80868b' }
    ];
  }

  function migrateData() {
    var d = S.data;
    d.persona_categories = d.persona_categories || [];
    d.personas = d.personas || [];
    d.pain_points = d.pain_points || [];
    d.messages = d.messages || [];
    d.styles = d.styles || [];
    d.visual_formats = d.visual_formats || [];
    d.recipes = d.recipes || [];
    d.campaigns = d.campaigns || [];
    d.tags = d.tags || [];
    d.research_sessions = d.research_sessions || [];

    // Ensure each persona has all fields
    for (var pi = 0; pi < d.personas.length; pi++) {
      var p = d.personas[pi];
      p.category_id = p.category_id || '';
      p.name = p.name || '';
      p.description = p.description || '';
      p.demographics = p.demographics || { age_range: '', gender: 'all', location: '', income_level: '', education: '', occupation: '', custom: {} };
      p.psychographics = p.psychographics || { desires: '', requirements: '', emotional_triggers: '', motivations: '', fears: '', values: '', custom: {} };
      p.pain_point_ids = p.pain_point_ids || [];
      p.custom_pain_points = p.custom_pain_points || [];
      p.notes = p.notes || '';
      p.tags = p.tags || [];
      p.created = p.created || new Date().toISOString();
      p.updated = p.updated || p.created;
      p.created_by = p.created_by || '';
    }

    // Ensure each pain point has all fields
    for (var ppi = 0; ppi < d.pain_points.length; ppi++) {
      var pp = d.pain_points[ppi];
      pp.pain_point = pp.pain_point || '';
      pp.solution = pp.solution || '';
      pp.category = pp.category || '';
      pp.tags = pp.tags || [];
      pp.created = pp.created || new Date().toISOString();
      pp.updated = pp.updated || pp.created;
    }

    // Ensure each message has all fields
    for (var mi = 0; mi < d.messages.length; mi++) {
      var m = d.messages[mi];
      m.title = m.title || '';
      m.body = m.body || '';
      m.funnel_stages = m.funnel_stages || [];
      m.delivery_notes = m.delivery_notes || '';
      m.theme = m.theme || '';
      m.hooks = m.hooks || [];
      // Ensure each hook has all fields
      for (var hi = 0; hi < m.hooks.length; hi++) {
        var h = m.hooks[hi];
        h.id = h.id || generateId('hk');
        h.text = h.text || '';
        h.type = h.type || 'direct';
      }
      m.tags = m.tags || [];
      m.notes = m.notes || '';
      m.created = m.created || new Date().toISOString();
      m.updated = m.updated || m.created;
      m.created_by = m.created_by || '';
    }

    // Ensure each style has all fields
    for (var si = 0; si < d.styles.length; si++) {
      var sty = d.styles[si];
      sty.name = sty.name || '';
      sty.description = sty.description || '';
      sty.tags = sty.tags || [];
      sty.created = sty.created || new Date().toISOString();
      sty.updated = sty.updated || sty.created;
    }

    // Ensure each visual format has all fields
    for (var vfi = 0; vfi < d.visual_formats.length; vfi++) {
      var vf = d.visual_formats[vfi];
      vf.name = vf.name || '';
      vf.description = vf.description || '';
      vf.category = vf.category || '';
      vf.reference_image_ids = vf.reference_image_ids || [];
      vf.tags = vf.tags || [];
      vf.created = vf.created || new Date().toISOString();
      vf.updated = vf.updated || vf.created;
    }

    // Ensure each recipe has all fields
    for (var ri = 0; ri < d.recipes.length; ri++) {
      var r = d.recipes[ri];
      r.title = r.title || '';
      r.status = r.status || 'draft';
      r.priority = r.priority || 'medium';
      r.campaign_id = r.campaign_id || '';
      r.persona_id = r.persona_id || '';
      r.message_id = r.message_id || '';
      r.style_id = r.style_id || '';
      r.visual_format_id = r.visual_format_id || '';
      r.selected_pain_point_ids = r.selected_pain_point_ids || [];
      r.media_type = r.media_type || 'image';
      // Hook
      r.hook = r.hook || { selected_hook_id: '', custom_hook: '', hook_type: '' };
      // Content
      r.content = r.content || { ad_copy: '', headline: '', description: '', cta: '', variants: [], notes: '' };
      r.content.variants = r.content.variants || [];
      // Media - image
      r.image_brief = r.image_brief || { creative_brief: '', ai_prompt: '', prompt_params: { aspect_ratio: '1:1', visual_approach: 'photography', mood: '', negative_prompt: '' }, reference_image_ids: [] };
      // Media - video
      r.video = r.video || { duration_seconds: 30, format: 'Reel', aspect_ratio: '9:16', concept: '' };
      r.video.blueprint = r.video.blueprint || { scenes: [] };
      r.video.script = r.video.script || { rows: [] };
      // Review
      r.review_notes = r.review_notes || '';
      r.production_notes = r.production_notes || '';
      r.assigned_to = r.assigned_to || '';
      r.due_date = r.due_date || '';
      r.delivery_notes = r.delivery_notes || '';
      r.creative_brief = r.creative_brief || '';
      // Meta
      r.tags = r.tags || [];
      r.batch_id = r.batch_id || '';
      r.created = r.created || new Date().toISOString();
      r.updated = r.updated || r.created;
      r.created_by = r.created_by || '';
    }

    // Ensure each campaign has all fields
    for (var ci = 0; ci < d.campaigns.length; ci++) {
      var c = d.campaigns[ci];
      c.name = c.name || '';
      c.description = c.description || '';
      c.objective = c.objective || '';
      c.funnel_stage = c.funnel_stage || '';
      c.date_start = c.date_start || '';
      c.date_end = c.date_end || '';
      c.status = c.status || 'planning';
      c.budget_notes = c.budget_notes || '';
      c.target_audience_notes = c.target_audience_notes || '';
      c.persona_ids = c.persona_ids || [];
      c.message_ids = c.message_ids || [];
      c.style_ids = c.style_ids || [];
      c.format_ids = c.format_ids || [];
      c.ai_instructions = c.ai_instructions || '';
      c.phases = c.phases || [];
      c.brief = c.brief || '';
      c.tags = c.tags || [];
      c.notes = c.notes || '';
      c.created = c.created || new Date().toISOString();
      c.updated = c.updated || c.created;
      c.created_by = c.created_by || '';
    }

    // Ensure each tag has all fields
    for (var ti = 0; ti < d.tags.length; ti++) {
      var t = d.tags[ti];
      t.name = t.name || '';
      t.color = t.color || '#1a73e8';
      t.description = t.description || '';
      t.created = t.created || new Date().toISOString();
    }
  }

  function migrateMeta() {
    var m = S.meta;
    m.workspace = m.workspace || { name: '', description: '', created: new Date().toISOString() };
    m.setup = m.setup || { product_name: '', objective: '', custom_instructions: '', setup_complete: false };
    m.settings = m.settings || {};
    m.settings.timezone = m.settings.timezone || 'Asia/Kolkata';
    m.settings.default_view = m.settings.default_view || 'dashboard';
    m.settings.card_density = m.settings.card_density || 'normal';
    m.settings.funnel_stages = m.settings.funnel_stages || deepClone(FUNNEL_DEFAULTS);
    m.settings.campaign_objectives = m.settings.campaign_objectives || deepClone(CAMPAIGN_OBJECTIVES);
    m.settings.visual_format_categories = m.settings.visual_format_categories || deepClone(FORMAT_CATEGORIES);
    m.settings.pain_point_categories = m.settings.pain_point_categories || deepClone(PAIN_POINT_CATEGORIES);
    m.settings.defaults = m.settings.defaults || { priority: 'medium', funnel_stage: 'fs_top', recipe_status: 'draft', campaign_status: 'planning' };
    m.settings.brand_design = m.settings.brand_design || getDefaultBrandDesign();
    m.aiPreferences = m.aiPreferences || {};
    m.aiPreferences.appDefault = m.aiPreferences.appDefault || { provider: '', model: '' };
    m.aiPreferences.perAction = m.aiPreferences.perAction || {};
    m.aiPreferences.lastProvider = m.aiPreferences.lastProvider || '';
    m.aiPreferences.lastModel = m.aiPreferences.lastModel || '';
    m.reference_images = m.reference_images || {};
    m.image_categories = m.image_categories || getDefaultImageCategories();
    m.recipe_templates = m.recipe_templates || [];

    S.cardDensity = m.settings.card_density;
    S.currentView = readHash();
  }

  // ============================================================
  // SECTION 5: MAP BUILDERS
  // ============================================================

  function buildMaps() {
    var i, item;

    // --- Persona categories ---
    S.categoryMap = {};
    S.categoryPersonaCounts = {};
    var cats = S.data.persona_categories || [];
    for (i = 0; i < cats.length; i++) {
      S.categoryMap[cats[i].id] = cats[i];
      S.categoryPersonaCounts[cats[i].id] = 0;
    }

    // --- Personas ---
    S.personaMap = {};
    S.personaRecipeCounts = {};
    S.totalPersonas = 0;
    var personas = S.data.personas || [];
    for (i = 0; i < personas.length; i++) {
      item = personas[i];
      S.personaMap[item.id] = item;
      S.personaRecipeCounts[item.id] = 0;
      S.totalPersonas++;
      if (item.category_id && S.categoryPersonaCounts[item.category_id] !== undefined) {
        S.categoryPersonaCounts[item.category_id]++;
      }
    }

    // --- Pain points ---
    S.painPointMap = {};
    var pps = S.data.pain_points || [];
    for (i = 0; i < pps.length; i++) S.painPointMap[pps[i].id] = pps[i];

    // --- Messages ---
    S.messageMap = {};
    S.messageRecipeCounts = {};
    S.totalMessages = 0;
    var msgs = S.data.messages || [];
    for (i = 0; i < msgs.length; i++) {
      S.messageMap[msgs[i].id] = msgs[i];
      S.messageRecipeCounts[msgs[i].id] = 0;
      S.totalMessages++;
    }

    // --- Styles ---
    S.styleMap = {};
    S.styleRecipeCounts = {};
    S.totalStyles = 0;
    var stys = S.data.styles || [];
    for (i = 0; i < stys.length; i++) {
      S.styleMap[stys[i].id] = stys[i];
      S.styleRecipeCounts[stys[i].id] = 0;
      S.totalStyles++;
    }

    // --- Visual formats ---
    S.formatMap = {};
    S.formatRecipeCounts = {};
    S.totalFormats = 0;
    var fmts = S.data.visual_formats || [];
    for (i = 0; i < fmts.length; i++) {
      S.formatMap[fmts[i].id] = fmts[i];
      S.formatRecipeCounts[fmts[i].id] = 0;
      S.totalFormats++;
    }

    // --- Funnel stage map ---
    S.funnelStageMap = {};
    S.funnelCounts = {};
    var funnels = (S.meta.settings && S.meta.settings.funnel_stages) || [];
    for (i = 0; i < funnels.length; i++) {
      S.funnelStageMap[funnels[i].id] = funnels[i];
      S.funnelCounts[funnels[i].id] = 0;
    }

    // --- Tags ---
    S.tagMap = {};
    S.tagIndex = {};
    var tags = S.data.tags || [];
    for (i = 0; i < tags.length; i++) S.tagMap[tags[i].id] = tags[i];

    // --- Campaigns ---
    S.campaignMap = {};
    S.campaignStatusCounts = {};
    S.totalCampaigns = 0; S.activeCampaigns = 0;
    for (var csk in CAMPAIGN_STATUSES) S.campaignStatusCounts[csk] = 0;
    var camps = S.data.campaigns || [];
    for (i = 0; i < camps.length; i++) {
      item = camps[i];
      S.campaignMap[item.id] = item;
      S.campaignStatusCounts[item.status] = (S.campaignStatusCounts[item.status] || 0) + 1;
      S.totalCampaigns++;
      if (item.status === 'active' || item.status === 'planning') S.activeCampaigns++;
    }

    // --- Research sessions ---
    S.researchMap = {};
    var sessions = S.data.research_sessions || [];
    for (i = 0; i < sessions.length; i++) S.researchMap[sessions[i].id] = sessions[i];

    // --- Recipes (the big one — updates many cross-counts) ---
    S.recipeMap = {};
    S.recipeStatusCounts = {};
    S.totalRecipes = 0; S.activeRecipes = 0;
    for (var rsk in RECIPE_STATUSES) S.recipeStatusCounts[rsk] = 0;

    var recipes = S.data.recipes || [];
    for (i = 0; i < recipes.length; i++) {
      item = recipes[i];
      S.recipeMap[item.id] = item;
      S.recipeStatusCounts[item.status] = (S.recipeStatusCounts[item.status] || 0) + 1;
      S.totalRecipes++;
      if (ACTIVE_STATUSES.indexOf(item.status) > -1) S.activeRecipes++;

      // Cross-counts
      if (item.persona_id && S.personaRecipeCounts[item.persona_id] !== undefined) S.personaRecipeCounts[item.persona_id]++;
      if (item.message_id && S.messageRecipeCounts[item.message_id] !== undefined) S.messageRecipeCounts[item.message_id]++;
      if (item.style_id && S.styleRecipeCounts[item.style_id] !== undefined) S.styleRecipeCounts[item.style_id]++;
      if (item.visual_format_id && S.formatRecipeCounts[item.visual_format_id] !== undefined) S.formatRecipeCounts[item.visual_format_id]++;

      // Funnel count (via message's funnel stages)
      var msg = S.messageMap[item.message_id];
      if (msg && msg.funnel_stages) {
        for (var fi = 0; fi < msg.funnel_stages.length; fi++) {
          var fsId = msg.funnel_stages[fi];
          if (S.funnelCounts[fsId] !== undefined) S.funnelCounts[fsId]++;
        }
      }

      // Tag index
      var rTags = item.tags || [];
      for (var rti = 0; rti < rTags.length; rti++) {
        S.tagIndex[rTags[rti]] = S.tagIndex[rTags[rti]] || [];
        S.tagIndex[rTags[rti]].push(item.id);
      }
    }

    // Image category map
    S.imageCategoryMap = {};
    var imgCats = (S.meta && S.meta.image_categories) || [];
    for (i = 0; i < imgCats.length; i++) S.imageCategoryMap[imgCats[i].id] = imgCats[i];
  }

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
  }

  // ============================================================
  // SECTION 7: UTILITIES
  // ============================================================

  // --- Formatters ---
  function formatDate(iso) { if (!iso) return ''; var d = new Date(iso); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  function formatDateShort(iso) { if (!iso) return ''; var d = new Date(iso); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
  function formatRelativeTime(iso) {
    if (!iso) return '';
    var diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return formatDate(iso);
  }
  function formatNumber(n) { return (n || 0).toLocaleString(); }

  // --- Text ---
  function esc(text) { if (!text) return ''; var d = document.createElement('div'); d.appendChild(document.createTextNode(text)); return d.innerHTML; }
  function truncate(text, max) { if (!text || text.length <= max) return text || ''; return text.substring(0, max) + '…'; }
  function countWords(text) { return text ? text.trim().split(/\s+/).filter(Boolean).length : 0; }
  function countChars(text) { return text ? text.length : 0; }
  function stripHtml(html) { if (!html) return ''; var tmp = document.createElement('div'); tmp.innerHTML = html; return tmp.textContent || tmp.innerText || ''; }

  // --- Icons (Font Awesome Pro) ---
  function icon(name, className) {
    className = className || '';
    var icons = {
      'search': 'fa-magnifying-glass', 'magnifying-glass': 'fa-magnifying-glass',
      'lightbulb': 'fa-lightbulb', 'file-text': 'fa-file-lines', 'file-lines': 'fa-file-lines',
      'sparkles': 'fa-sparkles', 'wand-sparkles': 'fa-wand-magic-sparkles', 'wand-magic': 'fa-wand-magic-sparkles',
      'edit': 'fa-pen-to-square', 'trash': 'fa-trash', 'copy': 'fa-copy', 'duplicate': 'fa-clone',
      'plus': 'fa-plus', 'minus': 'fa-minus', 'x': 'fa-xmark', 'xmark': 'fa-xmark',
      'chevron-down': 'fa-chevron-down', 'chevron-right': 'fa-chevron-right', 'chevron-up': 'fa-chevron-up', 'chevron-left': 'fa-chevron-left',
      'external-link': 'fa-arrow-up-right-from-square',
      'clock': 'fa-clock', 'clock-rotate-left': 'fa-clock-rotate-left',
      'calendar': 'fa-calendar', 'calendar-check': 'fa-calendar-check',
      'target': 'fa-bullseye', 'bullseye': 'fa-bullseye',
      'bolt': 'fa-bolt', 'play': 'fa-play', 'pause': 'fa-pause', 'signal': 'fa-signal',
      'gear': 'fa-gear', 'settings': 'fa-gear',
      'info': 'fa-circle-info', 'info-circle': 'fa-circle-info',
      'warning': 'fa-triangle-exclamation', 'error': 'fa-circle-xmark',
      'success': 'fa-circle-check', 'circle-check': 'fa-circle-check',
      'star': 'fa-star', 'star-half': 'fa-star-half-stroke',
      'arrow-up': 'fa-arrow-up', 'arrow-down': 'fa-arrow-down', 'arrow-right': 'fa-arrow-right', 'arrow-left': 'fa-arrow-left',
      'arrow-pointer': 'fa-arrow-pointer',
      'video': 'fa-video', 'globe': 'fa-globe', 'archive': 'fa-box-archive', 'box-archive': 'fa-box-archive',
      'link': 'fa-link', 'users': 'fa-users', 'user': 'fa-user', 'user-plus': 'fa-user-plus',
      'chart-line': 'fa-chart-line', 'chart-pie': 'fa-chart-pie', 'bar-chart': 'fa-chart-bar',
      'eye': 'fa-eye', 'eye-off': 'fa-eye-slash',
      'list': 'fa-list', 'list-ol': 'fa-list-ol', 'menu': 'fa-bars', 'layout-grid': 'fa-grid-2', 'grid-2': 'fa-grid-2',
      'image': 'fa-image', 'images': 'fa-images', 'rectangle-ad': 'fa-rectangle-ad',
      'pen-fancy': 'fa-pen-fancy', 'pen': 'fa-pen', 'pencil': 'fa-pencil',
      'align-left': 'fa-align-left', 'align-center': 'fa-align-center',
      'share-nodes': 'fa-share-nodes', 'share': 'fa-share',
      'thumbtack': 'fa-thumbtack', 'bookmark': 'fa-bookmark',
      'rocket': 'fa-rocket', 'paper-plane': 'fa-paper-plane',
      'flask': 'fa-flask', 'flask-vial': 'fa-flask-vial',
      'clipboard-list': 'fa-clipboard-list', 'hammer': 'fa-hammer',
      'tag': 'fa-tag', 'tags': 'fa-tags',
      'hashtag': 'fa-hashtag', 'at': 'fa-at',
      'face-smile': 'fa-face-smile', 'bold': 'fa-bold', 'italic': 'fa-italic',
      'refresh': 'fa-arrows-rotate', 'download': 'fa-download', 'upload': 'fa-upload',
      'key': 'fa-key', 'lock': 'fa-lock', 'shield': 'fa-shield',
      'cube': 'fa-cube', 'shapes': 'fa-shapes', 'briefcase': 'fa-briefcase',
      'layer-group': 'fa-layer-group', 'palette': 'fa-palette',
      'panel-left': 'fa-angles-right', 'panel-left-close': 'fa-angles-left',
      'circle': 'fa-circle', 'check': 'fa-check',
      'grip-vertical': 'fa-grip-vertical', 'ellipsis': 'fa-ellipsis',
      'filter': 'fa-filter', 'sort': 'fa-sort',
      'expand': 'fa-expand', 'compress': 'fa-compress',
      'spinner': 'fa-spinner fa-spin', 'circle-xmark': 'fa-circle-xmark',
      'fingerprint': 'fa-fingerprint', 'sliders': 'fa-sliders',
      'font': 'fa-font', 'swatchbook': 'fa-swatchbook',
      // Campaign Planner specific
      'bullhorn': 'fa-bullhorn', 'comments': 'fa-comments', 'comment-dots': 'fa-comment-dots',
      'clapperboard': 'fa-clapperboard', 'camera': 'fa-camera',
      'mobile': 'fa-mobile-screen', 'pen-ruler': 'fa-pen-ruler', 'film': 'fa-film',
      'anchor': 'fa-anchor', 'cart-shopping': 'fa-cart-shopping', 'heart': 'fa-heart',
      'flag': 'fa-flag', 'flag-checkered': 'fa-flag-checkered', 'folder': 'fa-folder',
      'folder-plus': 'fa-folder-plus', 'trophy': 'fa-trophy',
      'blender': 'fa-blender', 'shuffle': 'fa-shuffle', 'sitemap': 'fa-sitemap',
      'diagram-project': 'fa-diagram-project', 'link-simple': 'fa-link',
      'chart-mixed': 'fa-chart-mixed', 'square-poll-vertical': 'fa-square-poll-vertical',
      // Brand icons (use fab class)
      'youtube': 'fa-youtube', 'instagram': 'fa-instagram', 'facebook': 'fa-facebook',
      'linkedin': 'fa-linkedin', 'tiktok': 'fa-tiktok', 'twitter': 'fa-x-twitter', 'meta': 'fa-meta'
    };
    var brandIcons = { youtube: 1, instagram: 1, facebook: 1, linkedin: 1, tiktok: 1, twitter: 1, meta: 1 };
    var faClass = icons[name] || 'fa-' + name;
    return '<i class="' + (brandIcons[name] ? 'fab' : 'fas') + ' ' + faClass + (className ? ' ' + className : '') + ' cp-icon"></i>';
  }

  // --- Badges ---
  function badge(text, bg, fg) {
    fg = fg || bg;
    return '<span class="cp-badge" style="background:' + bg + '15;color:' + fg + '">' + esc(text) + '</span>';
  }

  function recipeStatusBadge(status) {
    var c = RECIPE_STATUSES[status] || { label: status, color: '#80868b', icon: 'circle' };
    return '<span class="cp-status-badge"><span class="cp-status-dot" style="background:' + c.color + '"></span>' + esc(c.label) + '</span>';
  }

  function campaignStatusBadge(status) {
    var c = CAMPAIGN_STATUSES[status] || { label: status, color: '#80868b' };
    return '<span class="cp-badge" style="background:' + c.color + '15;color:' + c.color + '">' + icon(c.icon) + ' ' + esc(c.label) + '</span>';
  }

  function priorityBadge(p) {
    if (!p) return '';
    var c = PRIORITY_LEVELS[p] || { label: p, color: '#80868b', icon: 'minus' };
    return '<span class="cp-badge" style="background:' + c.color + '15;color:' + c.color + '">' + icon(c.icon) + ' ' + esc(c.label) + '</span>';
  }

  function funnelBadge(stageId) {
    var f = S.funnelStageMap[stageId];
    if (!f) return '';
    return '<span class="cp-badge cp-funnel-badge" style="background:' + f.color + '15;color:' + f.color + '">' + esc(f.short || f.name) + '</span>';
  }

  function dimensionBadge(dimKey, entityId) {
    var dim = DIMENSIONS[dimKey];
    if (!dim) return '';
    var entity = null;
    if (dimKey === 'persona') entity = S.personaMap[entityId];
    else if (dimKey === 'message') entity = S.messageMap[entityId];
    else if (dimKey === 'style') entity = S.styleMap[entityId];
    else if (dimKey === 'format') entity = S.formatMap[entityId];
    var name = entity ? (entity.name || entity.title || '') : '(unset)';
    return '<span class="cp-badge cp-dim-badge" style="background:' + dim.color + '15;color:' + dim.color + '">' + icon(dim.icon) + ' ' + esc(truncate(name, 20)) + '</span>';
  }

  function mediaTypeBadge(mediaType) {
    var mt = MEDIA_TYPES[mediaType] || { label: mediaType || 'Image', icon: 'image', color: '#1a73e8' };
    return '<span class="cp-badge" style="background:' + mt.color + '15;color:' + mt.color + '">' + icon(mt.icon) + ' ' + esc(mt.label) + '</span>';
  }

  function hookTypeBadge(hookType) {
    var ht = HOOK_TYPES[hookType] || { label: hookType || 'Direct', color: '#0891b2' };
    return '<span class="cp-badge" style="background:' + ht.color + '15;color:' + ht.color + '">' + esc(ht.label) + '</span>';
  }

  function progressBar(pct, color) {
    color = color || 'var(--cp-primary)';
    return '<div class="cp-progress-bar"><div class="cp-progress-fill" style="width:' + pct + '%;background:' + color + '"></div></div>';
  }

  // --- IDs ---
  function generateId(prefix) { return prefix + '_' + Math.random().toString(36).substr(2, 8); }

  // --- Entity getters ---
  function getPersona(id) { return S.personaMap[id] || null; }
  function getCategory(id) { return S.categoryMap[id] || null; }
  function getPainPoint(id) { return S.painPointMap[id] || null; }
  function getMessage(id) { return S.messageMap[id] || null; }
  function getStyle(id) { return S.styleMap[id] || null; }
  function getFormat(id) { return S.formatMap[id] || null; }
  function getRecipe(id) { return S.recipeMap[id] || null; }
  function getCampaign(id) { return S.campaignMap[id] || null; }
  function getTag(id) { return S.tagMap[id] || null; }
  function getFunnelStage(id) { return S.funnelStageMap[id] || null; }
  function getResearchSession(id) { return S.researchMap[id] || null; }
  function getImageById(fid) { return S.imageMap[fid] || null; }

  // --- Collection getters ---
  function getAllTags() { return (S.data.tags || []).slice().sort(function(a, b) { return a.name.localeCompare(b.name); }); }
  function getAllPersonas() { return (S.data.personas || []).slice(); }
  function getAllMessages() { return (S.data.messages || []).slice(); }
  function getAllStyles() { return (S.data.styles || []).slice(); }
  function getAllFormats() { return (S.data.visual_formats || []).slice(); }
  function getAllRecipes() { return (S.data.recipes || []).slice(); }
  function getAllCampaigns() { return (S.data.campaigns || []).slice(); }
  function getAllPainPoints() { return (S.data.pain_points || []).slice(); }
  function getAllCategories() { return (S.data.persona_categories || []).slice().sort(function(a, b) { return (a.order || 0) - (b.order || 0); }); }

  function getRecentActivity(n) { return (S.activity || []).slice(-(n || 15)).reverse(); }

  function getPersonasByCategory(catId) {
    return (S.data.personas || []).filter(function(p) { return p.category_id === catId; });
  }

  function getRecipesByCampaign(campId) {
    return (S.data.recipes || []).filter(function(r) { return r.campaign_id === campId; });
  }

  function getRecipesByPersona(personaId) {
    return (S.data.recipes || []).filter(function(r) { return r.persona_id === personaId; });
  }

  function getPersonaPainPoints(persona) {
    if (!persona) return [];
    var points = [];
    // Shared pain points
    var ids = persona.pain_point_ids || [];
    for (var i = 0; i < ids.length; i++) {
      var pp = S.painPointMap[ids[i]];
      if (pp) points.push({ id: pp.id, pain_point: pp.pain_point, solution: pp.solution, shared: true });
    }
    // Custom pain points
    var customs = persona.custom_pain_points || [];
    for (var j = 0; j < customs.length; j++) {
      points.push({ id: customs[j].id, pain_point: customs[j].pain_point, solution: customs[j].solution, shared: false });
    }
    return points;
  }

  function getImages(filters) {
    var imgs = S.images.slice();
    if (!filters) return imgs;
    if (filters.star) imgs = imgs.filter(function(img) { return img.star; });
    if (filters.category) imgs = imgs.filter(function(img) { return img.category === filters.category; });
    if (filters.tag) imgs = imgs.filter(function(img) { return img.tags.indexOf(filters.tag) > -1; });
    if (filters.search) {
      var q = filters.search.toLowerCase();
      imgs = imgs.filter(function(img) {
        return (img.filename || '').toLowerCase().indexOf(q) > -1 ||
               (img.description || '').toLowerCase().indexOf(q) > -1 ||
               (img.tags || []).some(function(t) { return t.toLowerCase().indexOf(q) > -1; });
      });
    }
    if (filters.sort === 'name') imgs.sort(function(a, b) { return (a.filename || '').localeCompare(b.filename || ''); });
    else if (filters.sort === 'most-used') imgs.sort(function(a, b) { return (b.usage || []).length - (a.usage || []).length; });
    return imgs;
  }

  function getAllImageTags() {
    var tags = {};
    S.images.forEach(function(img) { (img.tags || []).forEach(function(t) { tags[t] = (tags[t] || 0) + 1; }); });
    return Object.keys(tags).sort();
  }

  // --- Diversity Score ---
  function calculateDiversityScore() {
    var uniquePairs = {};
    var recipes = S.data.recipes || [];
    for (var i = 0; i < recipes.length; i++) {
      var r = recipes[i];
      if (r.persona_id && r.message_id && r.status !== 'archived') {
        uniquePairs[r.persona_id + '::' + r.message_id] = true;
      }
    }
    var usedPairs = Object.keys(uniquePairs).length;
    var totalPossible = S.totalPersonas * S.totalMessages;
    if (totalPossible === 0) return { score: 0, used: 0, total: 0, remaining: 0 };
    return {
      score: Math.round((usedPairs / totalPossible) * 100),
      used: usedPairs,
      total: totalPossible,
      remaining: totalPossible - usedPairs
    };
  }

  // --- Misc ---
  function debounce(fn, delay) { var t; return function() { var c = this, a = arguments; clearTimeout(t); t = setTimeout(function() { fn.apply(c, a); }, delay); }; }
  function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }
  function isEmpty(obj) { return !obj || (typeof obj === 'object' && Object.keys(obj).length === 0); }
  function isSetupComplete() { return S.meta && S.meta.setup && S.meta.setup.setup_complete; }

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
    html += '<div class="cp-header-logo"><span class="cp-header-logo-accent">Campaign</span> Planner</div>';
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

      for (var key in APP_VIEWS) {
        var v = APP_VIEWS[key];
        if (v.group !== gk) continue;
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
    html += '<div class="cp-sidebar-footer-name">' + esc(ws.name || 'Campaign Planner') + '</div>';
    html += '<div class="cp-sidebar-footer-meta">Meta Ads' + (setup.setup_complete ? ' · Setup ✓' : '') + '</div>';
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

  // ============================================================
  // SECTION 9: SETUP VIEW
  // ============================================================

  function renderSetupView() {
    var brandName = (S.brand && S.brand.identity && S.brand.identity.name) ? S.brand.identity.name : '';

    var html = '<div class="cp-view cp-view-setup">';
    html += '<div class="cp-setup-welcome">';
    html += '<div class="cp-setup-welcome-card">';

    html += '<div class="cp-setup-welcome-icon">' + icon('rocket') + '</div>';
    html += '<h1 class="cp-setup-welcome-title">Welcome to Campaign Planner</h1>';
    if (brandName) {
      html += '<p class="cp-setup-welcome-sub">Setting up for <strong>' + esc(brandName) + '</strong></p>';
    }
    html += '<p class="cp-setup-welcome-desc">Our AI-powered wizard guides you through building your personas, pain points, messages, styles, and first campaign — in about 5–10 minutes.</p>';

    html += '<div class="cp-setup-welcome-features">';
    html += '<div class="cp-setup-welcome-feat">' + icon('users') + ' Personas</div>';
    html += '<div class="cp-setup-welcome-feat">' + icon('crosshair') + ' Pain Points</div>';
    html += '<div class="cp-setup-welcome-feat">' + icon('message-square') + ' Messages</div>';
    html += '<div class="cp-setup-welcome-feat">' + icon('palette') + ' Styles &amp; Formats</div>';
    html += '<div class="cp-setup-welcome-feat">' + icon('sparkles') + ' AI-Generated</div>';
    html += '<div class="cp-setup-welcome-feat">' + icon('flag') + ' First Campaign</div>';
    html += '</div>';

    html += '<button class="cp-btn cp-btn-ai cp-btn-lg" data-action="open-setup-wizard">' + icon('sparkles') + ' Start Setup Wizard</button>';
    html += '<p class="cp-setup-welcome-note">Takes about 5–10 minutes &nbsp;&middot;&nbsp; You can skip any step</p>';

    html += '</div>'; // card
    html += '</div>'; // welcome
    html += '</div>'; // view
    return html;
  }

  function completeSetup() {
    var name = ($('#cpSetupName').val() || '').trim();
    var product = ($('#cpSetupProduct').val() || '').trim();
    var objective = ($('#cpSetupObjective').val() || '').trim();
    var instructions = ($('#cpSetupInstructions').val() || '').trim();

    if (!name) { toast('Please enter a workspace name', 'warning'); $('#cpSetupName').focus(); return; }
    if (!product) { toast('Please enter a product or service', 'warning'); $('#cpSetupProduct').focus(); return; }

    S.meta.workspace.name = name;
    if (!S.meta.workspace.created) S.meta.workspace.created = new Date().toISOString();
    S.meta.setup.product_name = product;
    S.meta.setup.objective = objective;
    S.meta.setup.custom_instructions = instructions;
    S.meta.setup.setup_complete = true;

    logActivity('setup_completed', '', '', name, 'Workspace setup completed: ' + product);
    buildMaps();
    syncToTextarea();

    // Re-render full app shell with sidebar now showing correctly
    $('#cpApp').html(renderAppShell());
    S.currentView = 'dashboard';
    renderCurrentView();
    toast('Workspace setup complete! Start building your creative library.', 'success', 5000);
  }

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
    html += '<div class="cp-view-header"><div class="cp-view-header-left"><h1>' + icon('chart-pie') + ' Dashboard</h1></div>';
    html += '<div class="cp-view-header-right">';
    html += '<button class="cp-btn cp-btn-ai" data-action="open-campaign-wizard">' + icon('wand-magic') + ' New Campaign</button>';
    html += '<button class="cp-btn cp-btn-outline" data-action="go-view" data-view="research">' + icon('flask') + ' Research Lab</button>';
    html += '</div></div>';

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
  // ============================================================
  // SECTION 11: PERSONAS VIEW
  // ============================================================

  function renderPersonasView() {
    var html = '<div class="cp-view cp-view-personas">';

    // View header
    html += '<div class="cp-view-header"><div class="cp-view-header-left">';
    html += '<h1>' + icon('users') + ' Personas</h1>';
    html += '<span class="cp-view-subtitle">' + S.totalPersonas + ' personas in ' + (S.data.persona_categories || []).length + ' categories</span>';
    html += '</div><div class="cp-view-header-right">';
    // Tab toggle
    html += '<div class="cp-tab-toggle">';
    html += '<button class="cp-tab-btn' + (S.personasTab === 'personas' ? ' cp-tab-btn-active' : '') + '" data-action="set-personas-tab" data-tab="personas">' + icon('users') + ' Personas</button>';
    html += '<button class="cp-tab-btn' + (S.personasTab === 'pain_points' ? ' cp-tab-btn-active' : '') + '" data-action="set-personas-tab" data-tab="pain_points">' + icon('bolt') + ' Pain Points</button>';
    html += '</div>';
    html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="new-persona">' + icon('plus') + ' Add Persona</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="new-category">' + icon('folder-plus') + ' Category</button>';
    html += '</div></div>';

    // AI Research Panel placeholder (Part 2B will replace)
    html += '<div class="cp-ai-research-slot" id="cpPersonaResearchSlot">';
    html += renderAIResearchBar('Persona', '#9334e9', 'users', 'personas');
    html += '</div>';

    // Split pane
    html += '<div class="cp-split-pane">';
    if (S.personasTab === 'personas') {
      html += renderPersonasLeftPane();
    } else {
      html += renderPainPointsLeftPane();
    }
    html += '<div class="cp-preview-pane" id="cpPersonaPreview">';
    html += renderPersonaDetailPane();
    html += '</div>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderAIResearchBar(entityType, color, iconName, stateKey) {
    var isOpen = S.aiResearchOpen[stateKey] || false;
    if (isOpen) {
      // Expanded state — use renderer registry if Part 2B registered the panel
      var R = window._cpRenderers || {};
      var html = '<div class="cp-ai-research-panel cp-ai-research-expanded" style="border-color:' + color + '30;background:' + color + '04">' +
        '<div class="cp-ai-research-header">' +
        '<span class="cp-ai-research-icon" style="color:' + color + '">' + icon('sparkles') + '</span>' +
        '<span class="cp-ai-research-title" style="color:' + color + '">AI Research ' + esc(entityType) + 's</span>' +
        '<span class="cp-badge" style="background:' + color + '15;color:' + color + '">Brand context injected</span>' +
        '<div style="flex:1"></div>' +
        '<button class="cp-btn-icon" data-action="toggle-ai-research" data-key="' + stateKey + '">' + icon('chevron-up') + '</button>' +
        '</div>';
      if (R.aiResearchPanel) {
        html += R.aiResearchPanel(entityType, stateKey, color);
      } else {
        html += '<div class="cp-ai-research-body"><p class="cp-text-muted">AI Research panel loading...</p></div>';
      }
      html += '</div>';
      return html;
    }
    return '<div class="cp-ai-research-bar" data-action="toggle-ai-research" data-key="' + stateKey + '" style="border-color:' + color + '25;background:' + color + '06">' +
      '<span class="cp-ai-research-icon" style="color:' + color + '">' + icon('sparkles') + '</span>' +
      '<span class="cp-ai-research-title" style="color:' + color + '">AI Research ' + esc(entityType) + 's</span>' +
      '<span class="cp-text-muted">— Bulk discover & generate using brand context</span>' +
      '<span class="cp-ai-research-arrow">' + icon('chevron-down') + '</span>' +
      '</div>';
  }

  function renderPersonasLeftPane() {
    var categories = getAllCategories();
    var uncategorized = (S.data.personas || []).filter(function(p) { return !p.category_id || !S.categoryMap[p.category_id]; });
    var f = S.personaFilter;

    var html = '<div class="cp-list-pane">';
    // Search
    html += '<div class="cp-list-toolbar"><div class="cp-list-toolbar-row">';
    html += '<div class="cp-search-wrapper">' + icon('search') + '<input type="text" class="cp-input" id="cpPersonaSearch" placeholder="Search personas..." value="' + esc(f.search) + '"></div>';
    html += '</div></div>';

    html += '<div class="cp-persona-tree" id="cpPersonaTree">';

    if (categories.length === 0 && uncategorized.length === 0) {
      html += '<div class="cp-empty-state cp-empty-state--compact"><p>No personas yet.</p>';
      html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="new-persona">' + icon('plus') + ' Create First Persona</button></div>';
    } else {
      // Render each category group
      for (var ci = 0; ci < categories.length; ci++) {
        var cat = categories[ci];
        var catPersonas = getPersonasByCategory(cat.id);
        if (f.search) {
          catPersonas = catPersonas.filter(function(p) {
            return p.name.toLowerCase().indexOf(f.search.toLowerCase()) > -1 ||
                   (p.description || '').toLowerCase().indexOf(f.search.toLowerCase()) > -1;
          });
        }
        var collapsed = S.collapsedGroups['pcat_' + cat.id] || false;

        html += '<div class="cp-persona-category">';
        html += '<div class="cp-persona-cat-header" data-action="toggle-group" data-group="pcat_' + esc(cat.id) + '">';
        html += '<span class="cp-persona-cat-chevron">' + icon(collapsed ? 'chevron-right' : 'chevron-down') + '</span>';
        html += '<span class="cp-persona-cat-name">' + esc(cat.name) + '</span>';
        html += '<span class="cp-nav-badge">' + catPersonas.length + '</span>';
        html += '<button class="cp-btn-icon cp-btn-xs" data-action="edit-category" data-id="' + esc(cat.id) + '" title="Edit">' + icon('edit') + '</button>';
        html += '</div>';

        if (!collapsed) {
          for (var pi = 0; pi < catPersonas.length; pi++) {
            html += renderPersonaListItem(catPersonas[pi]);
          }
        }
        html += '</div>';
      }

      // Uncategorized personas
      if (uncategorized.length > 0) {
        if (f.search) {
          uncategorized = uncategorized.filter(function(p) {
            return p.name.toLowerCase().indexOf(f.search.toLowerCase()) > -1;
          });
        }
        if (uncategorized.length > 0) {
          html += '<div class="cp-persona-category">';
          html += '<div class="cp-persona-cat-header cp-persona-cat-uncat">';
          html += '<span class="cp-persona-cat-chevron">' + icon('chevron-down') + '</span>';
          html += '<span class="cp-persona-cat-name">Uncategorized</span>';
          html += '<span class="cp-nav-badge">' + uncategorized.length + '</span>';
          html += '</div>';
          for (var ui = 0; ui < uncategorized.length; ui++) {
            html += renderPersonaListItem(uncategorized[ui]);
          }
          html += '</div>';
        }
      }
    }

    html += '</div></div>';
    return html;
  }

  function renderPersonaListItem(persona) {
    var sel = S.selectedPersonaId === persona.id ? ' cp-persona-item-selected' : '';
    var ppCount = (persona.pain_point_ids || []).length + (persona.custom_pain_points || []).length;
    var demo = persona.demographics || {};
    var demoStr = [demo.age_range, demo.gender !== 'all' ? demo.gender : '', demo.location].filter(Boolean).join(' · ');
    var recipeCount = S.personaRecipeCounts[persona.id] || 0;

    var html = '<div class="cp-persona-item' + sel + '" data-action="select-persona" data-id="' + esc(persona.id) + '">';
    html += '<div class="cp-persona-item-name">' + esc(persona.name || 'Unnamed Persona') + '</div>';
    if (demoStr) html += '<div class="cp-persona-item-demo">' + esc(demoStr) + '</div>';
    html += '<div class="cp-persona-item-badges">';
    if (ppCount > 0) html += '<span class="cp-badge" style="background:#d9302515;color:#d93025">' + icon('bolt') + ' ' + ppCount + '</span>';
    if (recipeCount > 0) html += '<span class="cp-badge" style="background:#e3740015;color:#e37400">' + icon('bolt') + ' ' + recipeCount + ' recipes</span>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  function renderPainPointsLeftPane() {
    var pps = getAllPainPoints();
    var html = '<div class="cp-list-pane">';
    html += '<div class="cp-list-toolbar"><div class="cp-list-toolbar-row">';
    html += '<div class="cp-search-wrapper">' + icon('search') + '<input type="text" class="cp-input" id="cpPainPointSearch" placeholder="Search pain points..." value=""></div>';
    html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="new-pain-point">' + icon('plus') + ' Add</button>';
    html += '</div></div>';

    html += '<div class="cp-pain-point-list" id="cpPainPointList">';
    if (pps.length === 0) {
      html += '<div class="cp-empty-state cp-empty-state--compact"><p>No shared pain points yet.</p>';
      html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="new-pain-point">' + icon('plus') + ' Create First</button></div>';
    } else {
      for (var i = 0; i < pps.length; i++) {
        var pp = pps[i];
        // Count how many personas reference this pain point
        var usedByCount = (S.data.personas || []).filter(function(p) { return (p.pain_point_ids || []).indexOf(pp.id) > -1; }).length;
        var catLabel = '';
        if (pp.category) {
          var ppcMatch = PAIN_POINT_CATEGORIES.find(function(c) { return c.id === pp.category; });
          catLabel = ppcMatch ? ppcMatch.name : pp.category;
        }

        html += '<div class="cp-pain-point-item" data-action="select-pain-point" data-id="' + esc(pp.id) + '">';
        html += '<div class="cp-pain-point-text">' + esc(truncate(pp.pain_point, 60)) + '</div>';
        html += '<div class="cp-pain-point-meta">';
        if (catLabel) html += '<span class="cp-badge" style="background:#5f636815;color:#5f6368">' + esc(catLabel) + '</span>';
        html += '<span class="cp-text-muted">Used by ' + usedByCount + ' persona' + (usedByCount !== 1 ? 's' : '') + '</span>';
        html += '</div></div>';
      }
    }
    html += '</div></div>';
    return html;
  }

  function renderPersonaDetailPane() {
    if (!S.selectedPersonaId || !S.personaMap[S.selectedPersonaId]) {
      return '<div class="cp-empty-state cp-empty-state--center">' +
        '<div class="cp-empty-state-icon">' + icon('user') + '</div>' +
        '<div class="cp-empty-state-title">Select a persona</div>' +
        '<div class="cp-empty-state-text">Choose a persona from the list, or create a new one.</div>' +
        '<button class="cp-btn cp-btn-primary" data-action="new-persona">' + icon('plus') + ' New Persona</button></div>';
    }

    var p = S.personaMap[S.selectedPersonaId];
    var cat = S.categoryMap[p.category_id];
    var demo = p.demographics || {};
    var psych = p.psychographics || {};
    var painPoints = getPersonaPainPoints(p);
    var recipeCount = S.personaRecipeCounts[p.id] || 0;

    var html = '<div class="cp-persona-detail">';

    // Header
    html += '<div class="cp-persona-detail-header">';
    html += '<div class="cp-persona-detail-icon">' + icon('user') + '</div>';
    html += '<div class="cp-persona-detail-info">';
    html += '<h2>' + esc(p.name || 'Unnamed Persona') + '</h2>';
    html += '<div class="cp-text-muted">';
    if (cat) html += 'Category: ' + esc(cat.name) + ' · ';
    html += 'Used in ' + recipeCount + ' recipe' + (recipeCount !== 1 ? 's' : '');
    html += ' · Created ' + formatDate(p.created);
    html += '</div></div>';
    html += '<div class="cp-persona-detail-actions">';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="edit-persona" data-id="' + esc(p.id) + '">' + icon('edit') + ' Edit</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm cp-btn-danger" data-action="delete-persona" data-id="' + esc(p.id) + '">' + icon('trash') + '</button>';
    html += '</div></div>';

    // Description
    if (p.description) {
      html += '<p class="cp-persona-desc">' + esc(p.description) + '</p>';
    }

    // Demographics
    html += '<div class="cp-card cp-persona-section cp-persona-demographics">';
    html += '<div class="cp-section-header"><h3>' + icon('user') + ' Demographics</h3></div>';
    html += '<div class="cp-detail-grid">';
    var demoFields = [
      ['Age Range', demo.age_range], ['Gender', demo.gender], ['Location', demo.location],
      ['Income Level', demo.income_level], ['Education', demo.education], ['Occupation', demo.occupation]
    ];
    for (var di = 0; di < demoFields.length; di++) {
      if (demoFields[di][1]) {
        html += '<div class="cp-detail-field"><div class="cp-detail-label">' + esc(demoFields[di][0]) + '</div>';
        html += '<div class="cp-detail-value">' + esc(demoFields[di][1]) + '</div></div>';
      }
    }
    if (!demoFields.some(function(f) { return f[1]; })) {
      html += '<p class="cp-text-muted">No demographics defined yet.</p>';
    }
    html += '</div></div>';

    // Psychographics
    html += '<div class="cp-card cp-persona-section cp-persona-psychographics">';
    html += '<div class="cp-section-header"><h3>' + icon('heart') + ' Psychographics</h3></div>';
    html += '<div class="cp-detail-grid cp-detail-grid-2">';
    var psychFields = [
      ['Desires & Motivations', psych.desires], ['Requirements', psych.requirements],
      ['Emotional Triggers', psych.emotional_triggers], ['Motivations', psych.motivations],
      ['Fears', psych.fears], ['Values', psych.values]
    ];
    for (var psi = 0; psi < psychFields.length; psi++) {
      if (psychFields[psi][1]) {
        html += '<div class="cp-detail-field"><div class="cp-detail-label">' + esc(psychFields[psi][0]) + '</div>';
        html += '<div class="cp-detail-value">' + esc(psychFields[psi][1]) + '</div></div>';
      }
    }
    if (!psychFields.some(function(f) { return f[1]; })) {
      html += '<p class="cp-text-muted">No psychographics defined yet.</p>';
    }
    html += '</div></div>';

    // Pain Points
    html += '<div class="cp-card cp-persona-section">';
    html += '<div class="cp-section-header"><h3>' + icon('bolt') + ' Pain Points & Solutions</h3>';
    html += '<button class="cp-btn cp-btn-ai cp-btn-sm" data-action="ai-research-pain-points" data-persona-id="' + esc(p.id) + '">' + icon('sparkles') + ' AI Research</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="add-pain-point-to-persona" data-persona-id="' + esc(p.id) + '">' + icon('plus') + ' Add</button>';
    html += '</div>';

    if (painPoints.length === 0) {
      html += '<div class="cp-empty-state cp-empty-state--compact"><p>No pain points linked yet.</p></div>';
    } else {
      for (var ppi = 0; ppi < painPoints.length; ppi++) {
        var pp = painPoints[ppi];
        html += '<div class="cp-pain-point-card">';
        html += '<div class="cp-pain-point-card-header">';
        html += '<span class="cp-pain-point-icon">' + icon('bolt') + '</span>';
        html += '<span class="cp-pain-point-card-text">' + esc(pp.pain_point) + '</span>';
        html += pp.shared ?
          '<span class="cp-badge" style="background:#1a73e815;color:#1a73e8">Shared</span>' :
          '<span class="cp-badge" style="background:#e3740015;color:#e37400">Custom</span>';
        html += '</div>';
        if (pp.solution) {
          html += '<div class="cp-pain-point-solution">' + icon('lightbulb') + ' ' + esc(pp.solution) + '</div>';
        }
        html += '</div>';
      }
    }
    html += '</div>';

    // Tags
    if ((p.tags || []).length > 0) {
      html += '<div class="cp-persona-tags">';
      for (var ti = 0; ti < p.tags.length; ti++) {
        var tag = S.tagMap[p.tags[ti]];
        if (tag) html += '<span class="cp-badge" style="background:' + tag.color + '15;color:' + tag.color + '">' + icon('tag') + ' ' + esc(tag.name) + '</span>';
      }
      html += '</div>';
    }

    // Notes
    if (p.notes) {
      html += '<div class="cp-card cp-persona-section"><div class="cp-section-header"><h3>' + icon('file-text') + ' Notes</h3></div>';
      html += '<p>' + esc(p.notes) + '</p></div>';
    }

    html += '</div>';
    return html;
  }

  // ============================================================
  // SECTION 12: MESSAGES VIEW
  // ============================================================

  function renderMessagesView() {
    var msgs = getAllMessages();
    var f = S.messageFilter;

    // Apply filters
    var filtered = msgs.slice();
    if (f.search) {
      var q = f.search.toLowerCase();
      filtered = filtered.filter(function(m) {
        return (m.title || '').toLowerCase().indexOf(q) > -1 ||
               (m.body || '').toLowerCase().indexOf(q) > -1 ||
               (m.theme || '').toLowerCase().indexOf(q) > -1;
      });
    }
    if (f.funnel) {
      filtered = filtered.filter(function(m) { return (m.funnel_stages || []).indexOf(f.funnel) > -1; });
    }
    // Sort
    if (f.sortBy === 'title') filtered.sort(function(a, b) { return (a.title || '').localeCompare(b.title || ''); });
    else if (f.sortBy === 'most_used') filtered.sort(function(a, b) { return (S.messageRecipeCounts[b.id] || 0) - (S.messageRecipeCounts[a.id] || 0); });
    else filtered.sort(function(a, b) { return (b.updated || b.created || '') > (a.updated || a.created || '') ? 1 : -1; });

    var funnels = (S.meta.settings && S.meta.settings.funnel_stages) || [];

    var html = '<div class="cp-view cp-view-messages">';

    // Header
    html += '<div class="cp-view-header"><div class="cp-view-header-left">';
    html += '<h1>' + icon('comments') + ' Messages</h1>';
    html += '<span class="cp-view-subtitle">' + filtered.length + ' of ' + msgs.length + ' messages</span>';
    html += '</div><div class="cp-view-header-right">';
    html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="new-message">' + icon('plus') + ' Add Message</button>';
    html += '</div></div>';

    // Toolbar
    html += '<div class="cp-view-toolbar">';
    html += '<div class="cp-search-wrapper">' + icon('search') + '<input type="text" class="cp-input" id="cpMessageSearch" placeholder="Search messages..." value="' + esc(f.search) + '"></div>';
    // Funnel filter
    html += '<select class="cp-select cp-select-sm" id="cpMessageFunnelFilter">';
    html += '<option value="">All Stages</option>';
    for (var fi = 0; fi < funnels.length; fi++) {
      html += '<option value="' + funnels[fi].id + '"' + (f.funnel === funnels[fi].id ? ' selected' : '') + '>' + esc(funnels[fi].short || funnels[fi].name) + '</option>';
    }
    html += '</select>';
    // Sort
    html += '<select class="cp-select cp-select-sm" id="cpMessageSort">';
    html += '<option value="updated"' + (f.sortBy === 'updated' ? ' selected' : '') + '>Newest</option>';
    html += '<option value="title"' + (f.sortBy === 'title' ? ' selected' : '') + '>Alphabetical</option>';
    html += '<option value="most_used"' + (f.sortBy === 'most_used' ? ' selected' : '') + '>Most Used</option>';
    html += '</select>';
    html += '</div>';

    // AI Research Panel
    html += '<div class="cp-ai-research-slot" id="cpMessageResearchSlot">';
    html += renderAIResearchBar('Message', '#1a73e8', 'comments', 'messages');
    html += '</div>';

    // Card grid
    if (filtered.length === 0) {
      html += '<div class="cp-empty-state"><div class="cp-empty-state-icon">' + icon('comments') + '</div>';
      html += '<div class="cp-empty-state-title">No messages' + (f.search || f.funnel ? ' match your filters' : ' yet') + '</div>';
      html += '<div class="cp-empty-state-text">Create messages with funnel stage tags, hooks, and delivery notes.</div>';
      html += '<button class="cp-btn cp-btn-primary" data-action="new-message">' + icon('plus') + ' Create Message</button></div>';
    } else {
      html += '<div class="cp-card-grid">';
      for (var i = 0; i < filtered.length; i++) html += renderMessageCard(filtered[i]);
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  function renderMessageCard(msg) {
    var recipeCount = S.messageRecipeCounts[msg.id] || 0;
    var hookCount = (msg.hooks || []).length;
    var bodyPreview = stripHtml(msg.body || '');

    var html = '<div class="cp-card cp-message-card" data-action="select-message" data-id="' + esc(msg.id) + '">';

    // Title + actions
    html += '<div class="cp-message-card-header">';
    html += '<h3 class="cp-message-card-title">' + esc(msg.title || 'Untitled Message') + '</h3>';
    html += '<div class="cp-message-card-actions">';
    html += '<button class="cp-btn-icon cp-btn-xs" data-action="edit-message" data-id="' + esc(msg.id) + '" title="Edit">' + icon('edit') + '</button>';
    html += '<button class="cp-btn-icon cp-btn-xs" data-action="delete-message" data-id="' + esc(msg.id) + '" title="Delete">' + icon('trash') + '</button>';
    html += '</div></div>';

    // Body preview
    if (bodyPreview) {
      html += '<div class="cp-message-card-body">' + esc(truncate(bodyPreview, 120)) + '</div>';
    }

    // Funnel stages
    var stages = msg.funnel_stages || [];
    if (stages.length > 0) {
      html += '<div class="cp-message-card-stages">';
      for (var si = 0; si < stages.length; si++) {
        html += funnelBadge(stages[si]);
      }
      if (msg.theme) html += '<span class="cp-badge" style="background:#5f636815;color:#5f6368">' + esc(msg.theme) + '</span>';
      html += '</div>';
    }

    // Delivery notes preview
    if (msg.delivery_notes) {
      html += '<div class="cp-message-card-delivery">' + icon('pen-fancy') + ' ' + esc(truncate(msg.delivery_notes, 80)) + '</div>';
    }

    // Footer: hooks + recipe count
    html += '<div class="cp-message-card-footer">';
    if (hookCount > 0) html += '<span class="cp-badge" style="background:#9334e915;color:#9334e9">' + icon('anchor') + ' ' + hookCount + ' hook' + (hookCount !== 1 ? 's' : '') + '</span>';
    html += '<span class="cp-text-muted">Used in <strong>' + recipeCount + '</strong> recipe' + (recipeCount !== 1 ? 's' : '') + '</span>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  // ============================================================
  // SECTION 13: STYLES VIEW
  // ============================================================

  function renderStylesView() {
    var html = '<div class="cp-view cp-view-styles">';

    // Header
    html += '<div class="cp-view-header"><div class="cp-view-header-left">';
    html += '<h1>' + icon('palette') + ' Styles & Tones</h1>';
    html += '<span class="cp-view-subtitle">' + S.totalStyles + ' styles</span>';
    html += '</div><div class="cp-view-header-right">';
    html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="new-style">' + icon('plus') + ' Add Style</button>';
    html += '</div></div>';

    // AI Research Panel
    html += '<div class="cp-ai-research-slot" id="cpStyleResearchSlot">';
    html += renderAIResearchBar('Style', '#e37400', 'palette', 'styles');
    html += '</div>';

    // Content
    html += renderStylesTabContent();

    html += '</div>';
    return html;
  }

  function renderStylesTabContent() {
    var styles = getAllStyles();
    var html = '';

    if (styles.length === 0) {
      html += '<div class="cp-empty-state"><div class="cp-empty-state-icon">' + icon('palette') + '</div>';
      html += '<div class="cp-empty-state-title">No styles yet</div>';
      html += '<div class="cp-empty-state-text">Define creative styles and tones for your ads — like "Friendly", "Professional", or "High-Energy".</div>';
      html += '<button class="cp-btn cp-btn-primary" data-action="new-style">' + icon('plus') + ' Create Style</button></div>';
    } else {
      html += '<div class="cp-card-grid">';
      for (var i = 0; i < styles.length; i++) {
        html += renderStyleCard(styles[i]);
      }
      html += '</div>';
    }
    return html;
  }

  function renderStyleCard(style) {
    var recipeCount = S.styleRecipeCounts[style.id] || 0;

    var html = '<div class="cp-card cp-style-card" data-id="' + esc(style.id) + '">';
    html += '<div class="cp-style-card-header">';
    html += '<h3>' + esc(style.name || 'Untitled Style') + '</h3>';
    html += '<div class="cp-style-card-actions">';
    html += '<button class="cp-btn-icon cp-btn-xs" data-action="edit-style" data-id="' + esc(style.id) + '" title="Edit">' + icon('edit') + '</button>';
    html += '<button class="cp-btn-icon cp-btn-xs" data-action="delete-style" data-id="' + esc(style.id) + '" title="Delete">' + icon('trash') + '</button>';
    html += '</div></div>';

    if (style.description) {
      html += '<div class="cp-style-card-desc">' + esc(truncate(style.description, 120)) + '</div>';
    }

    // Tags
    if ((style.tags || []).length > 0) {
      html += '<div class="cp-style-card-tags">';
      for (var ti = 0; ti < style.tags.length; ti++) {
        var tag = S.tagMap[style.tags[ti]];
        if (tag) html += '<span class="cp-badge" style="background:' + tag.color + '15;color:' + tag.color + '">' + esc(tag.name) + '</span>';
      }
      html += '</div>';
    }

    html += '<div class="cp-style-card-footer">';
    html += '<span class="cp-text-muted">Used in <strong>' + recipeCount + '</strong> recipe' + (recipeCount !== 1 ? 's' : '') + '</span>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  function renderFormatsTabContent() {
    var formats = getAllFormats();
    var html = '';

    if (formats.length === 0) {
      html += '<div class="cp-empty-state"><div class="cp-empty-state-icon">' + icon('clapperboard') + '</div>';
      html += '<div class="cp-empty-state-title">No visual formats yet</div>';
      html += '<div class="cp-empty-state-text">Define content structures — like "Indoor Studio", "UGC Style", "Whiteboard", or "Motion Graphics".</div>';
      html += '<button class="cp-btn cp-btn-primary" data-action="new-format">' + icon('plus') + ' Create Format</button></div>';
    } else {
      html += '<div class="cp-card-grid">';
      for (var i = 0; i < formats.length; i++) {
        html += renderFormatCard(formats[i]);
      }
      html += '</div>';
    }
    return html;
  }

  function renderFormatCard(format) {
    var recipeCount = S.formatRecipeCounts[format.id] || 0;
    var catLabel = '';
    if (format.category) {
      var fcat = FORMAT_CATEGORIES.find(function(c) { return c.id === format.category; });
      catLabel = fcat ? fcat.name : format.category;
    }
    var catColor = '#80868b';
    if (format.category === 'vfc_shoot') catColor = '#1a73e8';
    else if (format.category === 'vfc_ugc') catColor = '#e37400';
    else if (format.category === 'vfc_graphic') catColor = '#9334e9';
    else if (format.category === 'vfc_animation') catColor = '#0891b2';

    var html = '<div class="cp-card cp-format-card" data-id="' + esc(format.id) + '">';
    html += '<div class="cp-format-card-header">';
    html += '<h3>' + esc(format.name || 'Untitled Format') + '</h3>';
    html += '<div class="cp-format-card-actions">';
    html += '<button class="cp-btn-icon cp-btn-xs" data-action="edit-format" data-id="' + esc(format.id) + '" title="Edit">' + icon('edit') + '</button>';
    html += '<button class="cp-btn-icon cp-btn-xs" data-action="delete-format" data-id="' + esc(format.id) + '" title="Delete">' + icon('trash') + '</button>';
    html += '</div></div>';

    if (catLabel) {
      html += '<div class="cp-format-card-cat"><span class="cp-badge" style="background:' + catColor + '15;color:' + catColor + '">' + esc(catLabel) + '</span></div>';
    }

    if (format.description) {
      html += '<div class="cp-format-card-desc">' + esc(truncate(format.description, 120)) + '</div>';
    }

    // Reference image thumbnails
    var refIds = format.reference_image_ids || [];
    if (refIds.length > 0) {
      html += '<div class="cp-format-card-refs">';
      var shown = 0;
      for (var ri = 0; ri < refIds.length && shown < 3; ri++) {
        var img = S.imageMap[refIds[ri]];
        if (img) {
          html += '<div class="cp-format-ref-thumb"><img src="' + esc(img.url) + '" alt="' + esc(img.filename) + '"></div>';
          shown++;
        }
      }
      if (refIds.length > 3) html += '<span class="cp-text-muted">+' + (refIds.length - 3) + ' more</span>';
      html += '</div>';
    }

    // Tags
    if ((format.tags || []).length > 0) {
      html += '<div class="cp-format-card-tags">';
      for (var ti = 0; ti < format.tags.length; ti++) {
        var tag = S.tagMap[format.tags[ti]];
        if (tag) html += '<span class="cp-badge" style="background:' + tag.color + '15;color:' + tag.color + '">' + esc(tag.name) + '</span>';
      }
      html += '</div>';
    }

    html += '<div class="cp-format-card-footer">';
    html += '<span class="cp-text-muted">Used in <strong>' + recipeCount + '</strong> recipe' + (recipeCount !== 1 ? 's' : '') + '</span>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  // ============================================================
  // SECTION 13.5: DEDICATED PAIN POINTS VIEW
  // ============================================================

  function renderPainPointsPageView() {
    var pps = getAllPainPoints();
    var ppFilter = S.painPointFilter || {};

    // Apply filters
    var filtered = pps.slice();
    if (ppFilter.search) {
      var q = ppFilter.search.toLowerCase();
      filtered = filtered.filter(function(pp) {
        return (pp.pain_point || '').toLowerCase().indexOf(q) > -1 || (pp.solution || '').toLowerCase().indexOf(q) > -1;
      });
    }
    if (ppFilter.category) filtered = filtered.filter(function(pp) { return pp.category === ppFilter.category; });

    var html = '<div class="cp-view cp-view-pain-points">';

    // Header
    html += '<div class="cp-view-header"><div class="cp-view-header-left">';
    html += '<h1>' + icon('bolt') + ' Pain Points</h1>';
    html += '<span class="cp-view-subtitle">' + filtered.length + ' of ' + pps.length + ' pain points</span>';
    html += '</div><div class="cp-view-header-right">';
    html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="new-pain-point">' + icon('plus') + ' Add Pain Point</button>';
    html += '</div></div>';

    // AI Research Panel
    html += '<div class="cp-ai-research-slot" id="cpPainPointResearchSlot">';
    html += renderAIResearchBar('Pain Point', '#d93025', 'bolt', 'pain_points');
    html += '</div>';

    // Toolbar
    html += '<div class="cp-view-toolbar">';
    html += '<div class="cp-search-wrapper">' + icon('search') + '<input type="text" class="cp-input" id="cpPainPointPageSearch" placeholder="Search pain points..." value="' + esc(ppFilter.search || '') + '"></div>';
    html += '<select class="cp-select cp-select-sm" id="cpPainPointCatFilter"><option value="">All Categories</option>';
    for (var ci = 0; ci < PAIN_POINT_CATEGORIES.length; ci++) {
      var cat = PAIN_POINT_CATEGORIES[ci];
      html += '<option value="' + esc(cat.id) + '"' + (ppFilter.category === cat.id ? ' selected' : '') + '>' + esc(cat.name) + '</option>';
    }
    html += '</select></div>';

    // Split pane: list + detail
    html += '<div class="cp-split-pane">';

    // Left: list
    html += '<div class="cp-list-pane">';
    if (filtered.length === 0) {
      html += '<div class="cp-empty-state cp-empty-state--compact"><p>No pain points' + (ppFilter.search || ppFilter.category ? ' match your filters' : ' yet') + '.</p>';
      html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="new-pain-point">' + icon('plus') + ' Create First Pain Point</button></div>';
    } else {
      for (var i = 0; i < filtered.length; i++) {
        var pp = filtered[i];
        var usedByCount = (S.data.personas || []).filter(function(p) { return (p.pain_point_ids || []).indexOf(pp.id) > -1; }).length;
        var recipeCount = (S.data.recipes || []).filter(function(r) { return (r.selected_pain_point_ids || []).indexOf(pp.id) > -1; }).length;
        var catLabel = '';
        if (pp.category) { var ppcMatch = PAIN_POINT_CATEGORIES.find(function(c) { return c.id === pp.category; }); catLabel = ppcMatch ? ppcMatch.name : ''; }
        var sel = S.selectedPainPointId === pp.id ? ' cp-list-item-selected' : '';

        html += '<div class="cp-list-item' + sel + '" data-action="select-pain-point-page" data-id="' + esc(pp.id) + '">';
        html += '<div class="cp-list-item-title">' + esc(truncate(pp.pain_point, 55)) + '</div>';
        html += '<div class="cp-list-item-meta">';
        if (catLabel) html += '<span class="cp-badge" style="background:#5f636815;color:#5f6368">' + esc(catLabel) + '</span>';
        html += '<span class="cp-text-muted">' + usedByCount + ' persona' + (usedByCount !== 1 ? 's' : '') + ' · ' + recipeCount + ' recipe' + (recipeCount !== 1 ? 's' : '') + '</span>';
        html += '</div></div>';
      }
    }
    html += '</div>';

    // Right: detail
    html += '<div class="cp-preview-pane">';
    html += renderPainPointDetailPane();
    html += '</div></div>';

    html += '</div>';
    return html;
  }

  function renderPainPointDetailPane() {
    if (!S.selectedPainPointId || !S.painPointMap[S.selectedPainPointId]) {
      return '<div class="cp-empty-state cp-empty-state--center">' +
        '<div class="cp-empty-state-icon">' + icon('bolt') + '</div>' +
        '<div class="cp-empty-state-title">Select a pain point</div>' +
        '<div class="cp-empty-state-text">Choose from the list, or create a new one.</div>' +
        '<button class="cp-btn cp-btn-primary" data-action="new-pain-point">' + icon('plus') + ' New Pain Point</button></div>';
    }
    var pp = S.painPointMap[S.selectedPainPointId];
    var ppCats = PAIN_POINT_CATEGORIES || [];
    var catLabel = '';
    if (pp.category) { var ppcMatch = ppCats.find(function(c) { return c.id === pp.category; }); catLabel = ppcMatch ? ppcMatch.name : ''; }

    // Find linked personas and recipes
    var linkedPersonas = (S.data.personas || []).filter(function(p) { return (p.pain_point_ids || []).indexOf(pp.id) > -1; });
    var unlinkedPersonas = (S.data.personas || []).filter(function(p) { return (p.pain_point_ids || []).indexOf(pp.id) === -1; });
    var linkedRecipes = (S.data.recipes || []).filter(function(r) { return (r.selected_pain_point_ids || []).indexOf(pp.id) > -1; });

    var html = '<div class="cp-detail-header"><div class="cp-detail-header-left">';
    html += '<h2>' + icon('bolt') + ' Pain Point</h2>';
    if (catLabel) html += '<span class="cp-badge" style="background:#d9302515;color:#d93025">' + esc(catLabel) + '</span>';
    html += '</div><div class="cp-detail-header-right">';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="delete-pain-point" data-id="' + esc(pp.id) + '">' + icon('trash') + ' Delete</button>';
    html += '</div></div>';

    // Inline editable pain point + solution
    html += '<div class="cp-card" style="margin-bottom:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('triangle-exclamation') + ' Pain Point</h3></div>';
    html += '<textarea class="cp-textarea cp-pp-inline-field" data-ppfield="pain_point" rows="3">' + esc(pp.pain_point || '') + '</textarea>';
    html += '</div>';

    html += '<div class="cp-card" style="margin-bottom:var(--cp-space-4);border-left:3px solid var(--cp-success)">';
    html += '<div class="cp-section-header"><h3 style="color:var(--cp-success)">' + icon('lightbulb') + ' Solution</h3></div>';
    html += '<textarea class="cp-textarea cp-pp-inline-field" data-ppfield="solution" rows="3" placeholder="How does your product solve this?">' + esc(pp.solution || '') + '</textarea>';
    html += '</div>';

    // Category inline selector
    html += '<div class="cp-card" style="margin-bottom:var(--cp-space-4)">';
    html += '<div class="cp-form-group"><label class="cp-field-label">Category</label>';
    html += '<select class="cp-select cp-pp-inline-field" data-ppfield="category">';
    html += '<option value="">None</option>';
    for (var ci = 0; ci < ppCats.length; ci++) {
      html += '<option value="' + esc(ppCats[ci].id) + '"' + (pp.category === ppCats[ci].id ? ' selected' : '') + '>' + esc(ppCats[ci].name) + '</option>';
    }
    html += '</select></div></div>';

    // Linked Personas with link/unlink actions
    html += '<div class="cp-card" style="margin-bottom:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('users') + ' Linked Personas (' + linkedPersonas.length + ')</h3>';
    if (unlinkedPersonas.length > 0) html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="link-pp-to-personas" data-pp-id="' + esc(pp.id) + '">' + icon('link') + ' Link to Personas</button>';
    html += '</div>';
    if (linkedPersonas.length === 0) {
      html += '<p class="cp-text-muted">Not linked to any personas yet.' + (unlinkedPersonas.length > 0 ? ' Click "Link to Personas" above.' : '') + '</p>';
    } else {
      for (var pi = 0; pi < linkedPersonas.length; pi++) {
        html += '<div class="cp-list-item-inline">';
        html += '<span style="flex:1;cursor:pointer" data-action="go-view" data-view="personas" data-select="' + esc(linkedPersonas[pi].id) + '">' + dimensionBadge('persona', linkedPersonas[pi].id) + '</span>';
        html += '<button class="cp-btn-icon cp-btn-xs" data-action="unlink-pp-from-persona" data-pp-id="' + esc(pp.id) + '" data-persona-id="' + esc(linkedPersonas[pi].id) + '" title="Unlink">' + icon('link-slash') + '</button>';
        html += '</div>';
      }
    }
    html += '</div>';

    // Linked Recipes
    html += '<div class="cp-card">';
    html += '<div class="cp-section-header"><h3>' + icon('shuffle') + ' Used in Recipes (' + linkedRecipes.length + ')</h3></div>';
    if (linkedRecipes.length === 0) {
      html += '<p class="cp-text-muted">Not used in any recipes yet.</p>';
    } else {
      for (var ri = 0; ri < linkedRecipes.length; ri++) {
        var r = linkedRecipes[ri];
        html += '<div class="cp-list-item-inline" style="cursor:pointer" data-action="go-view" data-view="recipes" data-select="' + esc(r.id) + '">';
        html += recipeStatusBadge(r.status) + ' ' + esc(truncate(r.title, 50));
        html += '</div>';
      }
    }
    html += '</div>';

    html += '<div class="cp-detail-footer"><span class="cp-text-muted">Created ' + formatDate(pp.created) + (pp.updated ? ' · Updated ' + formatRelativeTime(pp.updated) : '') + '</span></div>';
    return html;
  }

  // ============================================================
  // SECTION 13.6: DEDICATED FORMATS VIEW
  // ============================================================

  function renderFormatsPageView() {
    var formats = getAllFormats();
    var fmtFilter = S.formatFilter || {};

    // Apply filters
    var filtered = formats.slice();
    if (fmtFilter.search) {
      var q = fmtFilter.search.toLowerCase();
      filtered = filtered.filter(function(f) { return (f.name || '').toLowerCase().indexOf(q) > -1 || (f.description || '').toLowerCase().indexOf(q) > -1; });
    }
    if (fmtFilter.category) filtered = filtered.filter(function(f) { return f.category === fmtFilter.category; });

    var html = '<div class="cp-view cp-view-formats">';

    // Header
    html += '<div class="cp-view-header"><div class="cp-view-header-left">';
    html += '<h1>' + icon('clapperboard') + ' Visual Formats</h1>';
    html += '<span class="cp-view-subtitle">' + filtered.length + ' of ' + formats.length + ' formats</span>';
    html += '</div><div class="cp-view-header-right">';
    html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="new-format">' + icon('plus') + ' Add Format</button>';
    html += '</div></div>';

    // AI Research Panel
    html += '<div class="cp-ai-research-slot" id="cpFormatResearchSlot">';
    html += renderAIResearchBar('Visual Format', '#0891b2', 'clapperboard', 'formats');
    html += '</div>';

    // Toolbar
    html += '<div class="cp-view-toolbar">';
    html += '<div class="cp-search-wrapper">' + icon('search') + '<input type="text" class="cp-input" id="cpFormatPageSearch" placeholder="Search formats..." value="' + esc(fmtFilter.search || '') + '"></div>';
    html += '<select class="cp-select cp-select-sm" id="cpFormatCatFilter"><option value="">All Categories</option>';
    for (var ci = 0; ci < FORMAT_CATEGORIES.length; ci++) {
      var cat = FORMAT_CATEGORIES[ci];
      html += '<option value="' + esc(cat.id) + '"' + (fmtFilter.category === cat.id ? ' selected' : '') + '>' + icon(cat.icon) + ' ' + esc(cat.name) + '</option>';
    }
    html += '</select></div>';

    // Card grid
    if (filtered.length === 0) {
      html += '<div class="cp-empty-state"><div class="cp-empty-state-icon">' + icon('clapperboard') + '</div>';
      html += '<div class="cp-empty-state-title">No formats' + (fmtFilter.search || fmtFilter.category ? ' match your filters' : ' yet') + '</div>';
      html += '<div class="cp-empty-state-text">Define visual format approaches like "Talking Head Studio", "UGC Phone Style", or "Motion Graphics".</div>';
      html += '<button class="cp-btn cp-btn-primary" data-action="new-format">' + icon('plus') + ' Create Format</button></div>';
    } else {
      html += '<div class="cp-card-grid">';
      for (var i = 0; i < filtered.length; i++) html += renderFormatCard(filtered[i]);
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  // ============================================================
  // SECTION 14: RECIPES VIEW (List + Pipeline Shell)
  // ============================================================

  function renderRecipesView() {
    var html = '<div class="cp-view cp-view-recipes"><div class="cp-split-pane">';
    html += renderRecipesLeftPane();
    html += '<div class="cp-preview-pane" id="cpRecipePreview">' + renderRecipeRightPane() + '</div>';
    html += '</div></div>';
    return html;
  }

  function renderRecipesLeftPane() {
    var f = S.recipeFilter;
    var recipes = getFilteredRecipes();
    var totalAll = (S.data.recipes || []).length;

    var html = '<div class="cp-list-pane">';

    // Toolbar
    html += '<div class="cp-list-toolbar">';
    // Search + buttons
    html += '<div class="cp-list-toolbar-row">';
    html += '<div class="cp-search-wrapper">' + icon('search') + '<input type="text" class="cp-input" id="cpRecipeSearch" placeholder="Search recipes..." value="' + esc(f.search) + '"></div>';
    html += '</div>';
    html += '<div class="cp-list-toolbar-row">';
    html += '<button class="cp-btn cp-btn-ai cp-btn-sm" data-action="open-mixer" data-mode="manual">' + icon('bolt') + ' Create</button>';
    html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="open-mixer" data-mode="batch">' + icon('shuffle') + ' Batch</button>';
    html += '</div>';

    // Filters row
    html += '<div class="cp-list-toolbar-row cp-list-filters">';
    html += '<select class="cp-select cp-select-sm" id="cpRecipeStatusFilter"><option value="">All Status</option>';
    for (var sk in RECIPE_STATUSES) {
      html += '<option value="' + sk + '"' + (f.statuses.indexOf(sk) > -1 ? ' selected' : '') + '>' + RECIPE_STATUSES[sk].label + '</option>';
    }
    html += '</select>';
    // Campaign filter
    var camps = getAllCampaigns();
    if (camps.length > 0) {
      html += '<select class="cp-select cp-select-sm" id="cpRecipeCampaignFilter"><option value="">All Campaigns</option>';
      for (var ci = 0; ci < camps.length; ci++) {
        html += '<option value="' + esc(camps[ci].id) + '"' + (f.campaign === camps[ci].id ? ' selected' : '') + '>' + esc(truncate(camps[ci].name, 20)) + '</option>';
      }
      html += '</select>';
    }
    html += '<span class="cp-filter-count">' + recipes.length + ' of ' + totalAll + '</span>';
    html += '</div>';

    // Sort + group
    html += '<div class="cp-list-toolbar-row">';
    html += '<select class="cp-select cp-select-sm" id="cpRecipeSortBy">';
    html += '<option value="updated"' + (f.sortBy === 'updated' ? ' selected' : '') + '>Updated</option>';
    html += '<option value="created"' + (f.sortBy === 'created' ? ' selected' : '') + '>Created</option>';
    html += '<option value="title"' + (f.sortBy === 'title' ? ' selected' : '') + '>Title</option>';
    html += '<option value="priority"' + (f.sortBy === 'priority' ? ' selected' : '') + '>Priority</option>';
    html += '</select>';
    html += '<button class="cp-btn-icon cp-btn-sm" data-action="toggle-recipe-sort-dir" title="Sort direction">' + icon(f.sortDir === 'asc' ? 'arrow-up' : 'arrow-down') + '</button>';
    html += '<div style="flex:1"></div>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="toggle-bulk-mode" title="Bulk select">' + icon('list-check') + (S._bulkMode ? ' On' : '') + '</button>';
    html += '</div>';

    // Bulk action bar (visible when items selected)
    if (S._bulkMode) {
      S._bulkSelected = S._bulkSelected || [];
      var selCount = S._bulkSelected.length;
      html += '<div class="cp-bulk-bar">';
      html += '<label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" data-action="bulk-select-all"' + (selCount === recipes.length && selCount > 0 ? ' checked' : '') + '> All</label>';
      html += '<span class="cp-text-muted" style="flex:1">' + selCount + ' selected</span>';
      if (selCount > 0) {
        html += '<select class="cp-select cp-select-sm" id="cpBulkStatus" style="width:auto"><option value="">Status...</option>';
        for (var bsk in RECIPE_STATUSES) html += '<option value="' + bsk + '">' + RECIPE_STATUSES[bsk].label + '</option>';
        html += '</select>';
        html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="bulk-assign-campaign">' + icon('bullhorn') + '</button>';
        html += '<button class="cp-btn cp-btn-outline cp-btn-sm cp-btn-danger" data-action="bulk-delete">' + icon('trash') + '</button>';
      }
      html += '</div>';
    }

    html += '</div>'; // toolbar

    // Recipe list
    html += '<div class="cp-recipe-list" id="cpRecipeList">';
    if (recipes.length === 0) {
      html += '<div class="cp-empty-state cp-empty-state--compact"><p>No recipes' + (f.search ? ' match your search' : ' yet') + '.</p>';
      html += '<button class="cp-btn cp-btn-ai cp-btn-sm" data-action="open-mixer" data-mode="manual">' + icon('bolt') + ' Create Recipe</button></div>';
    } else {
      for (var ri = 0; ri < recipes.length; ri++) {
        html += renderRecipeListItem(recipes[ri]);
      }
    }
    html += '</div></div>';
    return html;
  }

  function renderRecipeListItem(recipe) {
    var sel = S.selectedRecipeId === recipe.id ? ' cp-recipe-item-selected' : '';
    var stCfg = RECIPE_STATUSES[recipe.status] || { label: recipe.status, color: '#80868b' };
    var priCfg = PRIORITY_LEVELS[recipe.priority] || {};
    var mt = MEDIA_TYPES[recipe.media_type] || MEDIA_TYPES.image;
    var pct = getRecipeCompletionPct(recipe);

    // Health indicators
    var healthClass = '';
    var healthIcon = '';
    if (recipe.due_date && new Date(recipe.due_date) < new Date() && recipe.status !== 'live' && recipe.status !== 'archived') {
      healthClass = ' cp-recipe-item-overdue';
      healthIcon = '<span class="cp-recipe-health" style="color:#d93025" title="Overdue">' + icon('triangle-exclamation') + '</span>';
    } else if (recipe.updated) {
      var daysSinceUpdate = Math.floor((Date.now() - new Date(recipe.updated).getTime()) / 86400000);
      if (daysSinceUpdate > 7 && recipe.status !== 'live' && recipe.status !== 'archived' && recipe.status !== 'approved') {
        healthClass = ' cp-recipe-item-stale';
        healthIcon = '<span class="cp-recipe-health" style="color:#e37400" title="Stale — ' + daysSinceUpdate + ' days since update">' + icon('clock') + '</span>';
      }
    }

    var html = '<div class="cp-recipe-item' + sel + healthClass + '" data-action="select-recipe" data-id="' + esc(recipe.id) + '">';
    // Bulk select checkbox
    if (S._bulkMode) {
      var bulkChecked = (S._bulkSelected || []).indexOf(recipe.id) > -1;
      html += '<div class="cp-recipe-item-bulk"><input type="checkbox" class="cp-bulk-check" data-action="bulk-toggle-item" data-id="' + esc(recipe.id) + '"' + (bulkChecked ? ' checked' : '') + '></div>';
    }
    html += '<div class="cp-recipe-item-left">';
    if (priCfg.color) html += '<span class="cp-priority-dot" style="background:' + priCfg.color + '" title="' + esc(priCfg.label || '') + '"></span>';
    html += '</div>';
    html += '<div class="cp-recipe-item-body">';
    html += '<div class="cp-recipe-item-title">' + esc(recipe.title || 'Untitled Recipe') + healthIcon + '</div>';
    html += '<div class="cp-recipe-item-badges">';
    html += '<span class="cp-status-badge"><span class="cp-status-dot" style="background:' + stCfg.color + '"></span>' + esc(stCfg.label) + '</span>';
    html += '<span class="cp-badge" style="background:' + mt.color + '15;color:' + mt.color + '">' + icon(mt.icon) + '</span>';
    var persona = S.personaMap[recipe.persona_id];
    if (persona) html += '<span class="cp-badge" style="background:#9334e915;color:#9334e9">' + esc(truncate(persona.name, 12)) + '</span>';
    var campaign = S.campaignMap[recipe.campaign_id];
    if (campaign) html += '<span class="cp-badge" style="background:#0891b215;color:#0891b2" title="Campaign: ' + esc(campaign.name) + '">' + icon('bullhorn') + ' ' + esc(truncate(campaign.name, 10)) + '</span>';
    html += '</div>';
    // Mini progress bar
    var pctColor = pct >= 80 ? 'var(--cp-success)' : pct >= 40 ? '#e37400' : 'var(--cp-gray-300)';
    html += '<div class="cp-recipe-progress-mini"><div class="cp-recipe-progress-fill" style="width:' + pct + '%;background:' + pctColor + '"></div></div>';
    html += '</div>';
    html += '<div class="cp-recipe-item-time">' + formatRelativeTime(recipe.updated || recipe.created) + '</div>';
    html += '</div>';
    return html;
  }

  function renderRecipeRightPane() {
    if (!S.selectedRecipeId || !S.recipeMap[S.selectedRecipeId]) {
      return '<div class="cp-empty-state cp-empty-state--center">' +
        '<div class="cp-empty-state-icon">' + icon('bolt') + '</div>' +
        '<div class="cp-empty-state-title">Select a recipe</div>' +
        '<div class="cp-empty-state-text">Choose a recipe from the list, or create a new one with the Mix & Match engine.</div>' +
        '<button class="cp-btn cp-btn-ai" data-action="open-mixer" data-mode="manual">' + icon('bolt') + ' Create Recipe</button></div>';
    }

    var recipe = S.recipeMap[S.selectedRecipeId];
    var R = window._cpRenderers;

    var html = '<div class="cp-recipe-detail" data-recipe-id="' + esc(recipe.id) + '">';

    // Recipe header
    html += renderRecipeDetailHeader(recipe);

    // Pipeline step indicator
    html += renderRecipePipelineIndicator(recipe);

    // Step content — Part 2A overrides via renderer registry
    html += '<div class="cp-step-content">';
    var stepKey = 'step_' + S.currentStep;
    if (R[stepKey]) {
      html += R[stepKey](recipe);
    } else {
      html += renderRecipeStepPlaceholder(recipe);
    }
    html += '</div>';
    html += '</div>';
    return html;
  }

  function renderRecipeDetailHeader(recipe) {
    var stCfg = RECIPE_STATUSES[recipe.status] || { label: recipe.status, color: '#80868b', icon: 'circle' };
    var campaign = S.campaignMap[recipe.campaign_id];
    var pct = getRecipeCompletionPct(recipe);

    var html = '<div class="cp-recipe-detail-header">';
    html += '<div class="cp-recipe-detail-title">' + esc(recipe.title || 'Untitled Recipe') + '</div>';
    html += '<div class="cp-recipe-detail-badges">';
    html += recipeStatusBadge(recipe.status);
    if (recipe.priority) html += priorityBadge(recipe.priority);
    if (campaign) html += '<span class="cp-badge cp-badge-link" style="background:#0891b215;color:#0891b2" data-action="go-to-campaign" data-id="' + esc(campaign.id) + '" title="Go to campaign">' + icon('bullhorn') + ' ' + esc(truncate(campaign.name, 18)) + '</span>';
    html += mediaTypeBadge(recipe.media_type);
    // Progress indicator
    html += '<span class="cp-badge" style="background:' + (pct >= 80 ? 'var(--cp-success-light);color:var(--cp-success)' : pct >= 40 ? '#e3740015;color:#e37400' : 'var(--cp-gray-100);color:var(--cp-text-muted)') + '">' + pct + '% complete</span>';
    html += '</div>';
    html += '<div class="cp-recipe-detail-actions">';
    html += '<button class="cp-btn-icon" data-action="duplicate-recipe" data-id="' + esc(recipe.id) + '" title="Duplicate">' + icon('copy') + '</button>';
    html += '<button class="cp-btn-icon" data-action="move-recipe-campaign" data-id="' + esc(recipe.id) + '" title="Move to campaign">' + icon('arrow-right-arrow-left') + '</button>';
    html += '<button class="cp-btn-icon" data-action="delete-recipe" data-id="' + esc(recipe.id) + '" title="Delete">' + icon('trash') + '</button>';
    html += '</div></div>';
    return html;
  }

  // C2: Recipe completion percentage (lightweight, no Part 2A dependency)
  function getRecipeCompletionPct(recipe) {
    var done = 0, total = 8;
    if (recipe.persona_id) done++;
    if (recipe.message_id) done++;
    if (recipe.style_id) done++;
    if (recipe.visual_format_id) done++;
    var hook = recipe.hook || {};
    if (hook.custom_hook || hook.selected_hook_id) done++;
    var content = recipe.content || {};
    var adCopy = stripHtml ? stripHtml(content.ad_copy || '') : (content.ad_copy || '').replace(/<[^>]*>/g, '');
    if (adCopy.trim().length >= 50) done++;
    if (content.headline && content.headline.trim()) done++;
    if (recipe.media_type === 'image') {
      var brief = recipe.image_brief || {};
      if (brief.creative_brief && brief.creative_brief.trim().length > 20) done++;
      total = 8;
    } else if (recipe.media_type === 'video') {
      var scenes = (recipe.video && recipe.video.blueprint && recipe.video.blueprint.scenes) || [];
      if (scenes.length >= 2) done++;
      total = 8;
    } else {
      total = 7; // No media check for text-only
    }
    return Math.round((done / total) * 100);
  }

  function renderRecipePipelineIndicator(recipe) {
    var steps = PIPELINE_STEPS;
    var currentIdx = -1;
    for (var i = 0; i < steps.length; i++) {
      if (steps[i].key === S.currentStep) { currentIdx = i; break; }
    }
    if (currentIdx < 0) { S.currentStep = 'composition'; currentIdx = 0; }

    var html = '<div class="cp-pipeline-steps">';
    for (var si = 0; si < steps.length; si++) {
      var st = steps[si];
      var isActive = si === currentIdx;
      var isDone = si < currentIdx;
      var stepClass = isActive ? ' cp-step-active' : isDone ? ' cp-step-done' : '';
      html += '<button class="cp-step-item' + stepClass + '" data-action="go-step" data-step="' + st.key + '">';
      html += '<span class="cp-step-dot">' + (isDone ? icon('check') : icon(st.icon)) + '</span>';
      html += '<span class="cp-step-label">' + esc(st.label) + '</span>';
      html += '</button>';
      if (si < steps.length - 1) html += '<div class="cp-step-connector' + (isDone ? ' cp-step-connector-done' : '') + '"></div>';
    }
    html += '</div>';
    return html;
  }

  function renderRecipeStepPlaceholder(recipe) {
    var step = S.currentStep || 'composition';
    var stepCfg = PIPELINE_STEPS.find(function(s) { return s.key === step; }) || PIPELINE_STEPS[0];

    // Basic composition view as fallback (Part 2A will replace all steps)
    if (step === 'composition') {
      return renderRecipeCompositionFallback(recipe);
    }

    return '<div class="cp-step-placeholder">' +
      '<div class="cp-empty-state cp-empty-state--compact">' +
      '<div class="cp-empty-state-icon">' + icon(stepCfg.icon) + '</div>' +
      '<div class="cp-empty-state-title">' + esc(stepCfg.label) + ' Step</div>' +
      '<div class="cp-empty-state-text">This step will be available when the editor module loads.</div>' +
      '</div></div>';
  }

  function renderRecipeCompositionFallback(recipe) {
    var html = '<div class="cp-composition-card">';
    html += '<div class="cp-section-header"><h3>' + icon('shapes') + ' Creative Composition</h3></div>';
    html += '<div class="cp-composition-grid">';

    var dims = [
      { key: 'persona', id: recipe.persona_id },
      { key: 'message', id: recipe.message_id },
      { key: 'style',   id: recipe.style_id },
      { key: 'format',  id: recipe.visual_format_id }
    ];
    for (var di = 0; di < dims.length; di++) {
      var dim = DIMENSIONS[dims[di].key];
      var entity = null;
      if (dims[di].key === 'persona') entity = S.personaMap[dims[di].id];
      else if (dims[di].key === 'message') entity = S.messageMap[dims[di].id];
      else if (dims[di].key === 'style') entity = S.styleMap[dims[di].id];
      else if (dims[di].key === 'format') entity = S.formatMap[dims[di].id];
      var entityName = entity ? (entity.name || entity.title || '') : '(Not set)';
      var entitySub = '';
      if (dims[di].key === 'persona' && entity) {
        var d = entity.demographics || {};
        entitySub = [d.age_range, d.location].filter(Boolean).join(' · ');
      } else if (dims[di].key === 'message' && entity) {
        var fs = (entity.funnel_stages || []).map(function(fid) { var f = S.funnelStageMap[fid]; return f ? f.short : ''; }).filter(Boolean).join(', ');
        entitySub = fs || '';
      }

      html += '<div class="cp-composition-dim" style="border-color:' + dim.color + '25">';
      html += '<div class="cp-composition-dim-icon" style="background:' + dim.color + '12;color:' + dim.color + '">' + icon(dim.icon) + '</div>';
      html += '<div class="cp-composition-dim-body">';
      html += '<div class="cp-composition-dim-label" style="color:' + dim.color + '">' + esc(dim.label) + '</div>';
      html += '<div class="cp-composition-dim-name">' + esc(entityName) + '</div>';
      if (entitySub) html += '<div class="cp-composition-dim-sub">' + esc(entitySub) + '</div>';
      html += '</div>';
      html += '<button class="cp-btn-link cp-btn-sm" data-action="change-dimension" data-dim="' + dims[di].key + '">Change</button>';
      html += '</div>';
    }
    html += '</div></div>';
    return html;
  }

  function getFilteredRecipes() {
    var f = S.recipeFilter;
    var recipes = (S.data.recipes || []).slice();

    if (f.search) {
      var q = f.search.toLowerCase();
      recipes = recipes.filter(function(r) {
        return (r.title || '').toLowerCase().indexOf(q) > -1;
      });
    }
    if (f.statuses && f.statuses.length > 0) recipes = recipes.filter(function(r) { return f.statuses.indexOf(r.status) > -1; });
    if (f.campaign) recipes = recipes.filter(function(r) { return r.campaign_id === f.campaign; });
    if (f.persona) recipes = recipes.filter(function(r) { return r.persona_id === f.persona; });
    if (f.priority) recipes = recipes.filter(function(r) { return r.priority === f.priority; });
    if (f.type) recipes = recipes.filter(function(r) { return r.media_type === f.type; });
    if (f.tag) recipes = recipes.filter(function(r) { return (r.tags || []).indexOf(f.tag) > -1; });

    // Sort
    var dir = f.sortDir === 'asc' ? 1 : -1;
    if (f.sortBy === 'title') recipes.sort(function(a, b) { return dir * (a.title || '').localeCompare(b.title || ''); });
    else if (f.sortBy === 'priority') {
      var priOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      recipes.sort(function(a, b) { return dir * ((priOrder[a.priority] || 2) - (priOrder[b.priority] || 2)); });
    }
    else if (f.sortBy === 'created') recipes.sort(function(a, b) { return dir * ((a.created || '') > (b.created || '') ? 1 : -1); });
    else recipes.sort(function(a, b) { return dir * ((a.updated || a.created || '') > (b.updated || b.created || '') ? 1 : -1); });

    return recipes;
  }

  // ============================================================
  // SECTION 15: CAMPAIGNS VIEW
  // ============================================================

  function renderCampaignsView() {
    var camps = getAllCampaigns();
    var f = S.campaignFilter;

    // Apply filters
    var filtered = camps.slice();
    if (f.search) {
      var q = f.search.toLowerCase();
      filtered = filtered.filter(function(c) { return (c.name || '').toLowerCase().indexOf(q) > -1 || (c.description || '').toLowerCase().indexOf(q) > -1; });
    }
    if (f.status) filtered = filtered.filter(function(c) { return c.status === f.status; });
    filtered.sort(function(a, b) { return (b.updated || b.created || '') > (a.updated || a.created || '') ? 1 : -1; });

    var html = '<div class="cp-view cp-view-campaigns">';
    html += '<div class="cp-view-header"><div class="cp-view-header-left">';
    html += '<h1>' + icon('bullhorn') + ' Campaigns</h1>';
    html += '<span class="cp-view-subtitle">' + filtered.length + ' campaign' + (filtered.length !== 1 ? 's' : '') + '</span>';
    html += '</div><div class="cp-view-header-right">';
    html += '<button class="cp-btn cp-btn-ai" data-action="open-campaign-wizard">' + icon('wand-magic') + ' Campaign Wizard</button>';
    html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="new-campaign">' + icon('plus') + ' Quick Create</button>';
    html += '</div></div>';

    // Split pane
    html += '<div class="cp-split-pane">';

    // Left: campaign list
    html += '<div class="cp-list-pane">';
    html += '<div class="cp-list-toolbar"><div class="cp-list-toolbar-row">';
    html += '<div class="cp-search-wrapper">' + icon('search') + '<input type="text" class="cp-input" id="cpCampaignSearch" placeholder="Search..." value="' + esc(f.search) + '"></div>';
    html += '<select class="cp-select cp-select-sm" id="cpCampaignStatusFilter" style="width:auto;min-width:80px"><option value="">All</option>';
    for (var csk in CAMPAIGN_STATUSES) {
      html += '<option value="' + csk + '"' + (f.status === csk ? ' selected' : '') + '>' + CAMPAIGN_STATUSES[csk].label + '</option>';
    }
    html += '</select>';
    html += '</div></div>';

    if (filtered.length === 0) {
      html += '<div class="cp-empty-state cp-empty-state--compact"><p>No campaigns' + (f.search || f.status ? ' match' : ' yet') + '.</p>';
      html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="open-campaign-wizard">' + icon('wand-magic') + ' Create</button></div>';
    } else {
      for (var i = 0; i < filtered.length; i++) html += renderCampaignListItem(filtered[i]);
    }
    html += '</div>';

    // Right: campaign detail
    html += '<div class="cp-preview-pane">';
    html += renderCampaignDetailPane();
    html += '</div>';

    html += '</div></div>';
    return html;
  }

  function renderCampaignListItem(camp) {
    var cst = CAMPAIGN_STATUSES[camp.status] || { label: camp.status, color: '#80868b', icon: 'circle' };
    var recipes = getRecipesByCampaign(camp.id);
    var sel = S.selectedCampaignId === camp.id ? ' cp-list-item-selected' : '';

    var html = '<div class="cp-list-item' + sel + '" data-action="select-campaign" data-id="' + esc(camp.id) + '">';
    html += '<div class="cp-list-item-title">' + esc(camp.name || 'Untitled') + '</div>';
    html += '<div class="cp-list-item-meta">';
    html += '<span class="cp-badge" style="background:' + cst.color + '15;color:' + cst.color + '">' + esc(cst.label) + '</span>';
    html += '<span class="cp-text-muted">' + recipes.length + ' recipe' + (recipes.length !== 1 ? 's' : '') + '</span>';
    if (camp.date_start) html += '<span class="cp-text-muted">' + formatDateShort(camp.date_start) + '</span>';
    html += '</div></div>';
    return html;
  }

  function renderCampaignDetailPane() {
    if (!S.selectedCampaignId || !S.campaignMap[S.selectedCampaignId]) {
      return '<div class="cp-empty-state cp-empty-state--center">' +
        '<div class="cp-empty-state-icon">' + icon('bullhorn') + '</div>' +
        '<div class="cp-empty-state-title">Select a campaign</div>' +
        '<div class="cp-empty-state-text">Choose from the list, or create a new one with the Campaign Wizard.</div>' +
        '<button class="cp-btn cp-btn-ai" data-action="open-campaign-wizard">' + icon('wand-magic') + ' Campaign Wizard</button></div>';
    }

    var camp = S.campaignMap[S.selectedCampaignId];
    var cst = CAMPAIGN_STATUSES[camp.status] || { label: camp.status, color: '#80868b', icon: 'circle' };
    var objective = CAMPAIGN_OBJECTIVES.find(function(o) { return o.id === camp.objective; });
    var recipes = getRecipesByCampaign(camp.id);
    var tab = S.campaignDetailTab || 'overview';

    var html = '';

    // Header
    html += '<div class="cp-detail-header"><div class="cp-detail-header-left">';
    html += '<h2>' + esc(camp.name) + '</h2>';
    html += '<div style="display:flex;gap:var(--cp-space-2);flex-wrap:wrap;margin-top:4px">';
    html += '<span class="cp-badge" style="background:' + cst.color + '15;color:' + cst.color + '">' + icon(cst.icon) + ' ' + esc(cst.label) + '</span>';
    if (objective) html += '<span class="cp-badge" style="background:#5f636815;color:#5f6368">' + icon(objective.icon) + ' ' + esc(objective.name) + '</span>';
    if (camp.funnel_stage) { var fs = S.funnelStageMap[camp.funnel_stage]; if (fs) html += funnelBadge(camp.funnel_stage); }
    html += '<span class="cp-badge" style="background:var(--cp-gray-50);color:var(--cp-text-muted)">' + recipes.length + ' recipe' + (recipes.length !== 1 ? 's' : '') + '</span>';
    html += '</div>';
    html += '</div><div class="cp-detail-header-right">';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="edit-campaign" data-id="' + esc(camp.id) + '">' + icon('edit') + ' Edit</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="delete-campaign" data-id="' + esc(camp.id) + '">' + icon('trash') + '</button>';
    html += '</div></div>';

    // Tab navigation
    var tabs = [
      { key: 'overview', label: 'Overview', icon: 'chart-pie' },
      { key: 'recipes', label: 'Recipes (' + recipes.length + ')', icon: 'shuffle' },
      { key: 'research', label: 'Research', icon: 'flask' },
      { key: 'brief', label: 'Brief', icon: 'file-lines' }
    ];
    html += '<div class="cp-campaign-tabs">';
    for (var ti = 0; ti < tabs.length; ti++) {
      var t = tabs[ti];
      html += '<button class="cp-campaign-tab' + (tab === t.key ? ' cp-campaign-tab-active' : '') + '" data-action="set-campaign-tab" data-tab="' + t.key + '">' + icon(t.icon) + ' ' + esc(t.label) + '</button>';
    }
    html += '</div>';

    // Tab content
    html += '<div class="cp-campaign-tab-content">';
    switch(tab) {
      case 'overview': html += renderCampaignOverviewTab(camp, recipes); break;
      case 'recipes':  html += renderCampaignRecipesTab(camp, recipes); break;
      case 'research': html += renderCampaignResearchTab(camp); break;
      case 'brief':    html += renderCampaignBriefTab(camp); break;
    }
    html += '</div>';

    html += '<div class="cp-detail-footer"><span class="cp-text-muted">Created ' + formatDate(camp.created) + (camp.updated ? ' · Updated ' + formatRelativeTime(camp.updated) : '') + '</span></div>';
    return html;
  }

  // --- Campaign Overview Tab ---
  function renderCampaignOverviewTab(camp, recipes) {
    var html = '';

    // Progress stats row
    var statusCounts = {};
    recipes.forEach(function(r) { statusCounts[r.status] = (statusCounts[r.status] || 0) + 1; });
    var readyCount = (statusCounts.approved || 0) + (statusCounts.live || 0);
    var inProgressCount = (statusCounts.hook_ready || 0) + (statusCounts.content_ready || 0) + (statusCounts.media_ready || 0) + (statusCounts.in_review || 0);
    var draftCount = statusCounts.draft || 0;
    var progressPct = recipes.length > 0 ? Math.round((readyCount / recipes.length) * 100) : 0;

    html += '<div class="cp-campaign-stats">';
    html += '<div class="cp-campaign-stat"><div class="cp-campaign-stat-value" style="color:var(--cp-primary)">' + progressPct + '%</div><div class="cp-campaign-stat-label">Complete</div></div>';
    html += '<div class="cp-campaign-stat"><div class="cp-campaign-stat-value">' + recipes.length + '</div><div class="cp-campaign-stat-label">Total Recipes</div></div>';
    html += '<div class="cp-campaign-stat"><div class="cp-campaign-stat-value" style="color:#80868b">' + draftCount + '</div><div class="cp-campaign-stat-label">Draft</div></div>';
    html += '<div class="cp-campaign-stat"><div class="cp-campaign-stat-value" style="color:#e37400">' + inProgressCount + '</div><div class="cp-campaign-stat-label">In Progress</div></div>';
    html += '<div class="cp-campaign-stat"><div class="cp-campaign-stat-value" style="color:#0d904f">' + readyCount + '</div><div class="cp-campaign-stat-label">Ready / Live</div></div>';
    html += '</div>';

    // Status progress bar
    if (recipes.length > 0) {
      html += '<div class="cp-campaign-progress-bar">';
      for (var sk in RECIPE_STATUSES) {
        var cnt = statusCounts[sk] || 0;
        if (cnt > 0) {
          var w = (cnt / recipes.length) * 100;
          html += '<div class="cp-campaign-status-segment" style="width:' + w + '%;background:' + RECIPE_STATUSES[sk].color + '" title="' + esc(RECIPE_STATUSES[sk].label) + ': ' + cnt + '"></div>';
        }
      }
      html += '</div>';
    }

    // Description
    if (camp.description) {
      html += '<div class="cp-card" style="margin-bottom:var(--cp-space-4)">';
      html += '<p style="color:var(--cp-text-secondary);line-height:1.6;margin:0">' + esc(camp.description) + '</p>';
      html += '</div>';
    }

    // Info grid
    html += '<div class="cp-detail-grid cp-detail-grid-2" style="margin-bottom:var(--cp-space-4)">';
    if (camp.date_start || camp.date_end) {
      html += '<div class="cp-detail-field"><div class="cp-detail-label">Date Range</div>';
      html += '<div class="cp-detail-value">' + icon('calendar') + ' ' + (camp.date_start ? formatDateShort(camp.date_start) : '?') + ' → ' + (camp.date_end ? formatDateShort(camp.date_end) : '?') + '</div></div>';
    }
    if (camp.budget_notes) {
      html += '<div class="cp-detail-field"><div class="cp-detail-label">Budget</div><div class="cp-detail-value">' + esc(camp.budget_notes) + '</div></div>';
    }
    if (camp.ai_instructions) {
      html += '<div class="cp-detail-field" style="grid-column:1/-1"><div class="cp-detail-label">' + icon('sparkles') + ' AI Instructions</div><div class="cp-detail-value">' + esc(camp.ai_instructions) + '</div></div>';
    }
    html += '</div>';

    // Targeted dimensions
    var dimSections = [
      { key: 'persona_ids', label: 'Personas', icon: 'users', color: '#9334e9', map: S.personaMap },
      { key: 'message_ids', label: 'Messages', icon: 'comments', color: '#1a73e8', map: S.messageMap },
      { key: 'style_ids', label: 'Styles', icon: 'palette', color: '#e37400', map: S.styleMap },
      { key: 'format_ids', label: 'Formats', icon: 'clapperboard', color: '#0891b2', map: S.formatMap }
    ];
    var hasDimensions = dimSections.some(function(ds) { return (camp[ds.key] || []).length > 0; });
    if (hasDimensions) {
      html += '<div class="cp-card" style="margin-bottom:var(--cp-space-4)">';
      html += '<div class="cp-section-header"><h3>' + icon('shapes') + ' Targeted Dimensions</h3></div>';
      html += '<div class="cp-campaign-dim-grid">';
      for (var di = 0; di < dimSections.length; di++) {
        var ds = dimSections[di];
        var ids = camp[ds.key] || [];
        if (ids.length === 0) continue;
        html += '<div><div class="cp-field-label" style="color:' + ds.color + '">' + icon(ds.icon) + ' ' + esc(ds.label) + ' (' + ids.length + ')</div>';
        for (var dii = 0; dii < ids.length; dii++) {
          var ent = ds.map[ids[dii]];
          if (ent) html += '<div class="cp-badge" style="background:' + ds.color + '10;color:' + ds.color + ';margin:2px">' + esc(ent.name || ent.title || '') + '</div>';
        }
        html += '</div>';
      }
      html += '</div></div>';
    }

    // Coverage matrix: persona × message
    var personaIds = camp.persona_ids || [];
    var messageIds = camp.message_ids || [];
    if (personaIds.length > 0 && messageIds.length > 0) {
      html += '<div class="cp-card" style="margin-bottom:var(--cp-space-4)">';
      html += '<div class="cp-section-header"><h3>' + icon('grid') + ' Coverage Matrix</h3>';
      html += '<span class="cp-text-muted" style="font-size:var(--cp-font-size-xs)">Persona × Message recipe coverage</span>';
      html += '</div>';
      html += '<div class="cp-coverage-matrix" style="overflow-x:auto"><table class="cp-coverage-table"><thead><tr><th></th>';
      for (var mi = 0; mi < messageIds.length; mi++) {
        var msg = S.messageMap[messageIds[mi]];
        html += '<th style="color:#1a73e8;font-size:11px;max-width:80px;overflow:hidden;text-overflow:ellipsis">' + esc(msg ? truncate(msg.title, 12) : '?') + '</th>';
      }
      html += '</tr></thead><tbody>';
      for (var pi = 0; pi < personaIds.length; pi++) {
        var per = S.personaMap[personaIds[pi]];
        html += '<tr><td style="color:#9334e9;font-weight:600;font-size:11px;white-space:nowrap">' + esc(per ? truncate(per.name, 14) : '?') + '</td>';
        for (var mj = 0; mj < messageIds.length; mj++) {
          var hasRecipe = recipes.some(function(r) { return r.persona_id === personaIds[pi] && r.message_id === messageIds[mj]; });
          html += '<td style="text-align:center">';
          if (hasRecipe) html += '<span style="color:var(--cp-success)">' + icon('circle-check') + '</span>';
          else html += '<span style="color:var(--cp-border-default);cursor:pointer" data-action="quick-create-recipe" data-persona-id="' + esc(personaIds[pi]) + '" data-message-id="' + esc(messageIds[mj]) + '" data-campaign-id="' + esc(camp.id) + '" title="Create recipe">' + icon('plus-circle') + '</span>';
          html += '</td>';
        }
        html += '</tr>';
      }
      html += '</tbody></table></div></div>';
    }

    // Notes
    if (camp.notes) {
      html += '<div class="cp-card"><div class="cp-section-header"><h3>' + icon('note-sticky') + ' Notes</h3></div>';
      html += '<p style="margin:0">' + esc(camp.notes) + '</p></div>';
    }
    return html;
  }

  // --- Campaign Recipes Tab ---
  function renderCampaignRecipesTab(camp, recipes) {
    var html = '';

    // Actions bar
    html += '<div style="display:flex;gap:var(--cp-space-2);margin-bottom:var(--cp-space-4);flex-wrap:wrap">';
    html += '<button class="cp-btn cp-btn-ai cp-btn-sm" data-action="ai-campaign-recipes" data-campaign-id="' + esc(camp.id) + '">' + icon('sparkles') + ' AI Suggest Recipes</button>';
    html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="add-recipe-to-campaign" data-campaign-id="' + esc(camp.id) + '">' + icon('plus') + ' Add Recipe</button>';
    html += '</div>';

    if (recipes.length === 0) {
      html += '<div class="cp-empty-state cp-empty-state--compact"><p>No recipes in this campaign yet.</p>';
      html += '<p class="cp-text-muted">Use AI to suggest recipe combinations based on your targeted dimensions, or create recipes manually.</p></div>';
      return html;
    }

    // Group by status
    var byStatus = {};
    recipes.forEach(function(r) { byStatus[r.status] = byStatus[r.status] || []; byStatus[r.status].push(r); });
    for (var sk in RECIPE_STATUSES) {
      var group = byStatus[sk];
      if (!group || group.length === 0) continue;
      html += '<div class="cp-campaign-recipe-group">';
      html += '<div class="cp-campaign-recipe-group-header" style="color:' + RECIPE_STATUSES[sk].color + '">' + icon(RECIPE_STATUSES[sk].icon) + ' ' + esc(RECIPE_STATUSES[sk].label) + ' (' + group.length + ')</div>';
      for (var ri = 0; ri < group.length; ri++) {
        var r = group[ri];
        var persona = S.personaMap[r.persona_id];
        var msg = S.messageMap[r.message_id];
        html += '<div class="cp-campaign-recipe-item" data-action="select-recipe" data-id="' + esc(r.id) + '">';
        html += '<span style="flex:1;font-weight:500">' + esc(truncate(r.title, 40)) + '</span>';
        if (persona) html += '<span class="cp-badge" style="background:#9334e910;color:#9334e9;font-size:10px">' + esc(truncate(persona.name, 10)) + '</span>';
        html += mediaTypeBadge(r.media_type);
        if (r.priority && r.priority !== 'medium') html += priorityBadge(r.priority);
        if (r.due_date) html += '<span class="cp-text-muted" style="font-size:11px">' + formatDateShort(r.due_date) + '</span>';
        html += '</div>';
      }
      html += '</div>';
    }

    // Progress bar
    var statusCounts = {};
    recipes.forEach(function(r) { statusCounts[r.status] = (statusCounts[r.status] || 0) + 1; });
    html += '<div class="cp-campaign-progress-bar" style="margin-top:var(--cp-space-3)">';
    for (var sbk in RECIPE_STATUSES) {
      var cnt = statusCounts[sbk] || 0;
      if (cnt > 0) {
        var w = (cnt / recipes.length) * 100;
        html += '<div class="cp-campaign-status-segment" style="width:' + w + '%;background:' + RECIPE_STATUSES[sbk].color + '" title="' + esc(RECIPE_STATUSES[sbk].label) + ': ' + cnt + '"></div>';
      }
    }
    html += '</div>';
    return html;
  }

  // --- Campaign Research Tab ---
  function renderCampaignResearchTab(camp) {
    var html = '';
    html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-3)">AI Research scoped to this campaign\'s targeted dimensions and objective.</p>';

    // Campaign-scoped AI Research Panel
    html += '<div class="cp-ai-research-slot">';
    html += renderAIResearchBar('Campaign Recipe', '#0891b2', 'bullhorn', 'campaign_research');
    html += '</div>';

    // Quick research actions
    html += '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('sparkles') + ' Campaign AI Actions</h3></div>';
    html += '<div style="display:flex;flex-direction:column;gap:var(--cp-space-2)">';
    html += '<button class="cp-btn cp-btn-ai cp-btn-sm" data-action="ai-campaign-recipes" data-campaign-id="' + esc(camp.id) + '" style="justify-content:flex-start">' + icon('shuffle') + ' Suggest recipe combinations for this campaign</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="ai-campaign-gaps" data-campaign-id="' + esc(camp.id) + '" style="justify-content:flex-start">' + icon('magnifying-glass') + ' Analyze coverage gaps</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="ai-campaign-brief" data-campaign-id="' + esc(camp.id) + '" style="justify-content:flex-start">' + icon('file-lines') + ' Generate campaign brief</button>';
    html += '</div></div>';

    // Campaign context preview
    html += '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('plug') + ' AI Context Preview</h3></div>';
    html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-2)">This context is injected into all AI prompts for this campaign:</p>';
    var ctxItems = [];
    if (camp.objective) { var obj = CAMPAIGN_OBJECTIVES.find(function(o) { return o.id === camp.objective; }); if (obj) ctxItems.push(['Objective', obj.name]); }
    if (camp.funnel_stage) { var fs = S.funnelStageMap[camp.funnel_stage]; if (fs) ctxItems.push(['Funnel', fs.name]); }
    if ((camp.persona_ids || []).length) ctxItems.push(['Personas', camp.persona_ids.map(function(id) { var p = S.personaMap[id]; return p ? p.name : '?'; }).join(', ')]);
    if ((camp.message_ids || []).length) ctxItems.push(['Messages', camp.message_ids.map(function(id) { var m = S.messageMap[id]; return m ? m.title : '?'; }).join(', ')]);
    if (camp.ai_instructions) ctxItems.push(['Instructions', camp.ai_instructions]);
    for (var ci = 0; ci < ctxItems.length; ci++) {
      html += '<div class="cp-brand-ctx-item"><span class="cp-brand-ctx-label">' + esc(ctxItems[ci][0]) + '</span><span class="cp-brand-ctx-value">' + esc(ctxItems[ci][1]) + '</span></div>';
    }
    if (ctxItems.length === 0) html += '<p class="cp-text-muted">No campaign context set. <a href="#" data-action="edit-campaign" data-id="' + esc(camp.id) + '" style="color:var(--cp-primary)">Edit campaign</a> to add targeting and AI instructions.</p>';
    html += '</div>';
    return html;
  }

  // --- Campaign Brief Tab ---
  function renderCampaignBriefTab(camp) {
    var html = '';

    // Campaign brief (editable)
    html += '<div class="cp-card" style="margin-bottom:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('file-lines') + ' Creative Brief</h3>';
    html += '<button class="cp-btn cp-btn-ai cp-btn-sm" data-action="ai-campaign-brief" data-campaign-id="' + esc(camp.id) + '">' + icon('sparkles') + ' AI Generate</button>';
    html += '</div>';
    html += '<textarea class="cp-textarea cp-campaign-brief-field" data-campaign-id="' + esc(camp.id) + '" rows="6" placeholder="Write a creative brief for this campaign — target audience, key messaging, visual direction, tone, goals...">' + esc(camp.brief || '') + '</textarea>';
    html += '</div>';

    // Auto-generated audience summary
    var personaIds = camp.persona_ids || [];
    if (personaIds.length > 0) {
      html += '<div class="cp-card" style="margin-bottom:var(--cp-space-4)">';
      html += '<div class="cp-section-header"><h3>' + icon('users') + ' Target Audience Summary</h3></div>';
      for (var pi = 0; pi < personaIds.length; pi++) {
        var per = S.personaMap[personaIds[pi]];
        if (!per) continue;
        html += '<div style="padding:var(--cp-space-2) 0;border-bottom:1px solid var(--cp-border-light)">';
        html += '<div style="font-weight:600;color:#9334e9;margin-bottom:2px">' + esc(per.name) + '</div>';
        if (per.description) html += '<div style="font-size:var(--cp-font-size-sm);color:var(--cp-text-secondary)">' + esc(truncate(per.description, 120)) + '</div>';
        // Show linked pain points
        var ppIds = per.pain_point_ids || [];
        if (ppIds.length > 0) {
          var pains = ppIds.map(function(id) { var pp = S.painPointMap[id]; return pp ? truncate(pp.pain_point, 40) : null; }).filter(Boolean);
          if (pains.length) html += '<div style="font-size:var(--cp-font-size-xs);color:var(--cp-text-muted);margin-top:4px">' + icon('bolt') + ' ' + pains.join(' · ') + '</div>';
        }
        html += '</div>';
      }
      html += '</div>';
    }

    // Key messages summary
    var messageIds = camp.message_ids || [];
    if (messageIds.length > 0) {
      html += '<div class="cp-card" style="margin-bottom:var(--cp-space-4)">';
      html += '<div class="cp-section-header"><h3>' + icon('comments') + ' Key Messages</h3></div>';
      for (var mi = 0; mi < messageIds.length; mi++) {
        var msg = S.messageMap[messageIds[mi]];
        if (!msg) continue;
        html += '<div style="padding:var(--cp-space-2) 0;border-bottom:1px solid var(--cp-border-light)">';
        html += '<div style="font-weight:600;color:#1a73e8">' + esc(msg.title) + '</div>';
        if (msg.funnel_stages && msg.funnel_stages.length) {
          html += '<div style="margin-top:2px">';
          for (var fi = 0; fi < msg.funnel_stages.length; fi++) html += funnelBadge(msg.funnel_stages[fi]);
          html += '</div>';
        }
        if (msg.hooks && msg.hooks.length) {
          html += '<div style="font-size:var(--cp-font-size-xs);color:var(--cp-text-muted);margin-top:4px">' + icon('anchor') + ' ' + msg.hooks.length + ' hook' + (msg.hooks.length !== 1 ? 's' : '') + ': ' + msg.hooks.map(function(h) { return '"' + truncate(h.text, 30) + '"'; }).slice(0, 3).join(', ') + '</div>';
        }
        html += '</div>';
      }
      html += '</div>';
    }

    // Visual direction summary
    var styleIds = camp.style_ids || [];
    var formatIds = camp.format_ids || [];
    if (styleIds.length > 0 || formatIds.length > 0) {
      html += '<div class="cp-card">';
      html += '<div class="cp-section-header"><h3>' + icon('palette') + ' Visual Direction</h3></div>';
      if (styleIds.length > 0) {
        html += '<div class="cp-field-label" style="color:#e37400;margin-bottom:4px">Styles</div>';
        html += '<div style="display:flex;flex-wrap:wrap;gap:var(--cp-space-2);margin-bottom:var(--cp-space-3)">';
        for (var si = 0; si < styleIds.length; si++) {
          var sty = S.styleMap[styleIds[si]];
          if (sty) html += '<span class="cp-badge" style="background:#e3740010;color:#e37400">' + esc(sty.name) + '</span>';
        }
        html += '</div>';
      }
      if (formatIds.length > 0) {
        html += '<div class="cp-field-label" style="color:#0891b2;margin-bottom:4px">Formats</div>';
        html += '<div style="display:flex;flex-wrap:wrap;gap:var(--cp-space-2)">';
        for (var fii = 0; fii < formatIds.length; fii++) {
          var fmt = S.formatMap[formatIds[fii]];
          if (fmt) html += '<span class="cp-badge" style="background:#0891b210;color:#0891b2">' + esc(fmt.name) + '</span>';
        }
        html += '</div>';
      }
      html += '</div>';
    }
    return html;
  }

  // ============================================================
  // SECTION 16: CALENDAR VIEW
  // ============================================================

  function renderCalendarView() {
    var now = new Date();
    if (S.calendarYear === null) S.calendarYear = now.getFullYear();
    if (S.calendarMonth === null) S.calendarMonth = now.getMonth();

    var year = S.calendarYear;
    var month = S.calendarMonth;
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    var mode = S.calendarMode || 'month';
    var calFilter = S.calendarFilters || {};

    // Collect recipes with due dates (apply campaign filter)
    var recipesWithDates = (S.data.recipes || []).filter(function(r) {
      if (!r.due_date) return false;
      if (calFilter.campaign && r.campaign_id !== calFilter.campaign) return false;
      if (calFilter.status && r.status !== calFilter.status) return false;
      return true;
    });
    var recipesByDate = {};
    recipesWithDates.forEach(function(r) {
      recipesByDate[r.due_date] = recipesByDate[r.due_date] || [];
      recipesByDate[r.due_date].push(r);
    });

    // Collect campaigns with date ranges
    var campaignsWithDates = (S.data.campaigns || []).filter(function(c) { return c.date_start && c.date_end; });
    if (calFilter.campaign) campaignsWithDates = campaignsWithDates.filter(function(c) { return c.id === calFilter.campaign; });

    var html = '<div class="cp-view cp-view-calendar">';

    // Header
    html += '<div class="cp-view-header"><div class="cp-view-header-left">';
    html += '<h1>' + icon('calendar') + ' Calendar</h1>';
    html += '</div>';
    html += '<div class="cp-view-header-right">';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="cal-prev">' + icon('chevron-left') + '</button>';
    html += '<span class="cp-cal-title">' + monthNames[month] + ' ' + year + '</span>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="cal-next">' + icon('chevron-right') + '</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="cal-today">Today</button>';
    html += '</div></div>';

    // Filter bar
    html += '<div class="cp-view-toolbar">';
    var camps = getAllCampaigns();
    if (camps.length > 0) {
      html += '<select class="cp-select cp-select-sm" id="cpCalCampaignFilter"><option value="">All Campaigns</option>';
      for (var cfi = 0; cfi < camps.length; cfi++) html += '<option value="' + esc(camps[cfi].id) + '"' + (calFilter.campaign === camps[cfi].id ? ' selected' : '') + '>' + esc(camps[cfi].name) + '</option>';
      html += '</select>';
    }
    html += '<select class="cp-select cp-select-sm" id="cpCalStatusFilter"><option value="">All Statuses</option>';
    for (var csk in RECIPE_STATUSES) html += '<option value="' + csk + '"' + (calFilter.status === csk ? ' selected' : '') + '>' + RECIPE_STATUSES[csk].label + '</option>';
    html += '</select>';
    html += '<span class="cp-text-muted" style="font-size:12px">' + recipesWithDates.length + ' recipe' + (recipesWithDates.length !== 1 ? 's' : '') + ' with due dates</span>';
    html += '</div>';

    // Campaign bars with phase segments
    if (campaignsWithDates.length > 0) {
      html += '<div class="cp-cal-campaign-bars">';
      for (var ci = 0; ci < campaignsWithDates.length; ci++) {
        var camp = campaignsWithDates[ci];
        var cst = CAMPAIGN_STATUSES[camp.status] || { color: '#80868b' };
        html += '<div class="cp-cal-campaign-row" data-action="go-to-campaign" data-id="' + esc(camp.id) + '" style="cursor:pointer">';
        html += '<span class="cp-cal-campaign-name" style="color:' + cst.color + '">' + icon('bullhorn') + ' ' + esc(truncate(camp.name, 16)) + '</span>';
        html += '<div class="cp-cal-campaign-bar-track">';
        var monthStart = new Date(year, month, 1);
        var monthEnd = new Date(year, month + 1, 0);
        var cStart = new Date(camp.date_start);
        var cEnd = new Date(camp.date_end);
        var daysInMonth = monthEnd.getDate();
        var barLeft = Math.max(0, Math.floor(((cStart - monthStart) / (1000 * 60 * 60 * 24)) / daysInMonth * 100));
        var barRight = Math.max(0, 100 - Math.ceil(((cEnd - monthStart) / (1000 * 60 * 60 * 24) + 1) / daysInMonth * 100));
        if (cEnd < monthStart || cStart > monthEnd) { barLeft = 0; barRight = 100; }
        html += '<div class="cp-cal-campaign-bar" style="left:' + barLeft + '%;right:' + barRight + '%;background:' + cst.color + '20;border-color:' + cst.color + '50"></div>';
        // Phase segments
        var phases = camp.phases || [];
        var phColors = ['#9334e9', '#1a73e8', '#0d904f', '#e37400', '#d93025'];
        for (var phi = 0; phi < phases.length; phi++) {
          var ph = phases[phi];
          if (!ph.date_start || !ph.date_end) continue;
          var phStart = new Date(ph.date_start);
          var phEnd = new Date(ph.date_end);
          if (phEnd < monthStart || phStart > monthEnd) continue;
          var phLeft = Math.max(0, Math.floor(((phStart - monthStart) / (1000 * 60 * 60 * 24)) / daysInMonth * 100));
          var phRight = Math.max(0, 100 - Math.ceil(((phEnd - monthStart) / (1000 * 60 * 60 * 24) + 1) / daysInMonth * 100));
          var phColor = phColors[phi % phColors.length];
          html += '<div class="cp-cal-phase-marker" style="left:' + phLeft + '%;right:' + phRight + '%;background:' + phColor + '35;border-bottom:2px solid ' + phColor + '" title="' + esc(ph.name || 'Phase ' + (phi + 1)) + '"></div>';
        }
        html += '</div></div>';
      }
      html += '</div>';
    }

    // Calendar grid
    html += renderCalMonthGrid(year, month, dayNames, recipesByDate, now);

    html += '</div>';
    return html;
  }

  function renderCalMonthGrid(year, month, dayNames, recipesByDate, now) {
    var firstDay = new Date(year, month, 1);
    var startDow = (firstDay.getDay() + 6) % 7;
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var today = now.getDate();
    var todayMonth = now.getMonth();
    var todayYear = now.getFullYear();

    var html = '<div class="cp-calendar-grid">';
    for (var dh = 0; dh < 7; dh++) html += '<div class="cp-cal-header">' + dayNames[dh] + '</div>';

    var totalCells = Math.ceil((startDow + daysInMonth) / 7) * 7;
    for (var c = 0; c < totalCells; c++) {
      var dayNum = c - startDow + 1;
      var isValid = dayNum >= 1 && dayNum <= daysInMonth;
      var isToday = isValid && dayNum === today && month === todayMonth && year === todayYear;
      var dateStr = isValid ? year + '-' + String(month + 1).padStart(2, '0') + '-' + String(dayNum).padStart(2, '0') : '';
      var dayRecipes = isValid && recipesByDate[dateStr] ? recipesByDate[dateStr] : [];

      html += '<div class="cp-cal-day' + (isValid ? '' : ' cp-cal-day-empty') + (isToday ? ' cp-cal-day-today' : '') + '">';
      if (isValid) {
        html += '<div class="cp-cal-day-header"><span class="cp-cal-day-num">' + dayNum + '</span>';
        if (dayRecipes.length > 0) html += '<span class="cp-cal-day-count">' + dayRecipes.length + '</span>';
        html += '</div>';
        for (var dri = 0; dri < Math.min(dayRecipes.length, 3); dri++) {
          var dr = dayRecipes[dri];
          var drSt = RECIPE_STATUSES[dr.status] || { color: '#80868b' };
          html += '<div class="cp-cal-recipe-chip" style="background:' + drSt.color + '15;color:' + drSt.color + '" data-action="select-recipe" data-id="' + esc(dr.id) + '">';
          html += '<span class="cp-cal-chip-title">' + esc(truncate(dr.title, 14)) + '</span>';
          html += '</div>';
        }
        if (dayRecipes.length > 3) html += '<div class="cp-cal-more">+' + (dayRecipes.length - 3) + ' more</div>';
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  // ============================================================
  // SECTION 17: ACTIVITY VIEW
  // ============================================================

  function renderActivityView() {
    var f = S.activityFilter;
    var all = (S.activity || []).slice().reverse();

    // Apply filters
    var filtered = all;
    if (f.search) {
      var q = f.search.toLowerCase();
      filtered = filtered.filter(function(a) {
        return (a.description || '').toLowerCase().indexOf(q) > -1 ||
               (a.entity_title || '').toLowerCase().indexOf(q) > -1 ||
               (a.type || '').toLowerCase().indexOf(q) > -1;
      });
    }
    if (f.type) {
      filtered = filtered.filter(function(a) { return a.type === f.type; });
    }

    var html = '<div class="cp-view cp-view-activity">';
    html += '<div class="cp-view-header"><div class="cp-view-header-left">';
    html += '<h1>' + icon('clock-rotate-left') + ' Activity</h1>';
    html += '<span class="cp-view-subtitle">' + filtered.length + ' entries</span>';
    html += '</div></div>';

    // Toolbar
    html += '<div class="cp-view-toolbar">';
    html += '<div class="cp-search-wrapper">' + icon('search') + '<input type="text" class="cp-input" id="cpActivitySearch" placeholder="Search activity..." value="' + esc(f.search) + '"></div>';
    html += '<select class="cp-select cp-select-sm" id="cpActivityTypeFilter"><option value="">All Types</option>';
    // Group by entity type
    var typeGroups = [
      { label: 'Recipes', types: ['recipe_created', 'recipe_updated', 'recipe_status_changed', 'recipe_deleted', 'recipe_batch_generated'] },
      { label: 'Personas', types: ['persona_created', 'persona_updated', 'persona_deleted', 'category_created', 'category_deleted'] },
      { label: 'Messages', types: ['message_created', 'message_updated', 'message_deleted'] },
      { label: 'Styles/Formats', types: ['style_created', 'style_updated', 'style_deleted', 'format_created', 'format_updated', 'format_deleted'] },
      { label: 'Campaigns', types: ['campaign_created', 'campaign_updated', 'campaign_deleted'] },
      { label: 'AI Actions', types: ['brief_generated', 'hook_generated', 'content_generated', 'media_generated', 'script_generated', 'pain_points_generated', 'messages_suggested', 'personas_researched'] },
      { label: 'Other', types: ['tag_created', 'tag_updated', 'tag_deleted', 'image_uploaded', 'settings_changed', 'data_imported', 'data_exported', 'setup_completed'] }
    ];
    for (var gi = 0; gi < typeGroups.length; gi++) {
      var grp = typeGroups[gi];
      html += '<optgroup label="' + esc(grp.label) + '">';
      for (var ti = 0; ti < grp.types.length; ti++) {
        var tKey = grp.types[ti];
        var tLabel = tKey.replace(/_/g, ' ');
        html += '<option value="' + tKey + '"' + (f.type === tKey ? ' selected' : '') + '>' + esc(tLabel) + '</option>';
      }
      html += '</optgroup>';
    }
    html += '</select>';
    html += '</div>';

    // Activity list
    if (filtered.length === 0) {
      html += '<div class="cp-empty-state"><div class="cp-empty-state-icon">' + icon('clock-rotate-left') + '</div>';
      html += '<div class="cp-empty-state-title">No activity' + (f.search || f.type ? ' matches your filters' : ' yet') + '</div>';
      html += '<div class="cp-empty-state-text">Activity will appear here as you create and edit content.</div></div>';
    } else {
      html += '<div class="cp-card"><div class="cp-activity-list">';
      var maxShow = 100;
      for (var i = 0; i < Math.min(filtered.length, maxShow); i++) {
        html += renderActivityItem(filtered[i]);
      }
      if (filtered.length > maxShow) {
        html += '<div class="cp-activity-more">' + (filtered.length - maxShow) + ' more entries not shown.</div>';
      }
      html += '</div></div>';
    }

    html += '</div>';
    return html;
  }

  // ============================================================
  // SECTION 18: PLACEHOLDER VIEWS (Part 2B)
  // ============================================================

  function renderResearchPlaceholder() {
    var msg = S._part2bTimeout ? 'Research Lab could not load. Please refresh the page.' : 'Loading Research Lab...';
    return '<div class="cp-view cp-view-placeholder">' +
      '<div class="cp-empty-state cp-empty-state--center">' +
      '<div class="cp-empty-state-icon">' + (S._part2bTimeout ? icon('warning') : icon('spinner')) + '</div>' +
      '<div class="cp-empty-state-title">' + esc(msg) + '</div>' +
      '<div class="cp-empty-state-text">The Research Lab, Settings, and Images views require the AI module to load.</div>' +
      '</div></div>';
  }

  function renderImagesPlaceholder() {
    var msg = S._part2bTimeout ? 'Images view could not load. Please refresh the page.' : 'Loading Images...';
    return '<div class="cp-view cp-view-placeholder">' +
      '<div class="cp-empty-state cp-empty-state--center">' +
      '<div class="cp-empty-state-icon">' + (S._part2bTimeout ? icon('warning') : icon('spinner')) + '</div>' +
      '<div class="cp-empty-state-title">' + esc(msg) + '</div>' +
      '</div></div>';
  }

  function renderSettingsPlaceholder() {
    var msg = S._part2bTimeout ? 'Settings view could not load. Please refresh the page.' : 'Loading Settings...';
    return '<div class="cp-view cp-view-placeholder">' +
      '<div class="cp-empty-state cp-empty-state--center">' +
      '<div class="cp-empty-state-icon">' + (S._part2bTimeout ? icon('warning') : icon('spinner')) + '</div>' +
      '<div class="cp-empty-state-title">' + esc(msg) + '</div>' +
      '</div></div>';
  }
  // Part 2A bridge functions — safe to call before Part 2A loads
  function openModal(title, content, options) {
    var P2A = window._cpPart2A;
    if (P2A && P2A.openModal) { P2A.openModal(title, content, options); }
    else { toast('Editor not loaded yet. Please try again.', 'warning'); }
  }
  function closeModal() {
    var P2A = window._cpPart2A;
    if (P2A && P2A.closeModal) P2A.closeModal();
  }
  function openConfirmDialog(opts) {
    var P2A = window._cpPart2A;
    if (P2A && P2A.openConfirmDialog) { P2A.openConfirmDialog(opts); }
    else { toast('Editor not loaded yet. Please try again.', 'warning'); }
  }
  function snapshot(label) {
    var P2A = window._cpPart2A;
    if (P2A && P2A.snapshot) P2A.snapshot(label);
  }

  function setupEventHandlers() {
    console.log('[CP] Setting up core event handlers...');

    // Sidebar navigation
    $(document).off('click.cp-nav').on('click.cp-nav', '.cp-nav-item', function(e) {
      e.preventDefault();
      var viewName = $(this).data('view');
      if (viewName) navigate(viewName);
    });

    // Sidebar toggle
    $(document).off('click.cp-sidebar-toggle').on('click.cp-sidebar-toggle', '#cpSidebarToggle', function() {
      S.sidebarHidden = !S.sidebarHidden;
      $('#cpSidebar').toggleClass('cp-sidebar-hidden', S.sidebarHidden);
    });

    // Setup submit
    $(document).off('click.cp-setup').on('click.cp-setup', '#cpSetupSubmit', function(e) {
      e.preventDefault();
      completeSetup();
    });

    // Go-view buttons (data-action="go-view" data-view="xxx")
    $(document).off('click.cp-go-view').on('click.cp-go-view', '[data-action="go-view"]', function(e) {
      e.preventDefault();
      var v = $(this).data('view');
      if (v) navigate(v);
    });

    // Navigate to campaign from recipe badge
    $(document).off('click.cp-go-campaign').on('click.cp-go-campaign', '[data-action="go-to-campaign"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var campId = $(this).data('id');
      if (campId) {
        S.selectedCampaignId = campId;
        navigate('campaigns');
      }
    });

    // Save button
    $(document).off('click.cp-save').on('click.cp-save', '#cpSaveNodeBtn', function(e) {
      e.preventDefault();
      syncToTextarea();
      if (S.$submitBtn && S.$submitBtn.length) {
        updateSaveStatus('saving');
        S.$submitBtn.click();
      } else {
        toast('Drupal save button not found', 'error');
      }
    });

    // Global search
    $(document).off('input.cp-global-search').on('input.cp-global-search', '#cpGlobalSearchInput', debounce(function() {
      var q = ($(this).val() || '').trim().toLowerCase();
      var $results = $('#cpGlobalSearchResults');
      if (q.length < 2) { $results.hide(); return; }

      var results = [];
      // Search personas
      (S.data.personas || []).forEach(function(p) {
        if ((p.name || '').toLowerCase().indexOf(q) > -1 || (p.description || '').toLowerCase().indexOf(q) > -1) {
          results.push({ type: 'persona', icon: 'users', color: '#9334e9', title: p.name, sub: truncate(p.description || '', 40), id: p.id, view: 'personas' });
        }
      });
      // Search messages
      (S.data.messages || []).forEach(function(m) {
        if ((m.title || '').toLowerCase().indexOf(q) > -1 || (m.theme || '').toLowerCase().indexOf(q) > -1) {
          results.push({ type: 'message', icon: 'comments', color: '#1a73e8', title: m.title, sub: m.theme || '', id: m.id, view: 'messages' });
        }
      });
      // Search recipes
      (S.data.recipes || []).forEach(function(r) {
        if ((r.title || '').toLowerCase().indexOf(q) > -1) {
          results.push({ type: 'recipe', icon: 'shuffle', color: '#e37400', title: r.title, sub: (RECIPE_STATUSES[r.status] || {}).label || '', id: r.id, view: 'recipes' });
        }
      });
      // Search campaigns
      (S.data.campaigns || []).forEach(function(c) {
        if ((c.name || '').toLowerCase().indexOf(q) > -1 || (c.description || '').toLowerCase().indexOf(q) > -1) {
          results.push({ type: 'campaign', icon: 'bullhorn', color: '#0891b2', title: c.name, sub: (CAMPAIGN_STATUSES[c.status] || {}).label || '', id: c.id, view: 'campaigns' });
        }
      });
      // Search pain points
      (S.data.pain_points || []).forEach(function(pp) {
        if ((pp.pain_point || '').toLowerCase().indexOf(q) > -1) {
          results.push({ type: 'pain_point', icon: 'bolt', color: '#d93025', title: truncate(pp.pain_point, 40), sub: pp.category || '', id: pp.id, view: 'pain_points' });
        }
      });
      // Search styles
      (S.data.styles || []).forEach(function(s) {
        if ((s.name || '').toLowerCase().indexOf(q) > -1) {
          results.push({ type: 'style', icon: 'palette', color: '#e37400', title: s.name, sub: '', id: s.id, view: 'styles' });
        }
      });

      if (results.length === 0) {
        $results.html('<div class="cp-global-search-empty">No results for "' + esc(q) + '"</div>').show();
        return;
      }

      var rHtml = '';
      var shownTypes = {};
      for (var ri = 0; ri < Math.min(results.length, 10); ri++) {
        var r = results[ri];
        if (!shownTypes[r.type]) {
          if (ri > 0) rHtml += '<div class="cp-global-search-divider"></div>';
          rHtml += '<div class="cp-global-search-type">' + icon(r.icon) + ' ' + r.type.replace('_', ' ') + 's</div>';
          shownTypes[r.type] = true;
        }
        rHtml += '<div class="cp-global-search-item" data-action="global-search-go" data-view="' + esc(r.view) + '" data-id="' + esc(r.id) + '" data-type="' + esc(r.type) + '">';
        rHtml += '<span style="color:' + r.color + '">' + icon(r.icon) + '</span> ';
        rHtml += '<span style="font-weight:500">' + esc(r.title) + '</span>';
        if (r.sub) rHtml += '<span class="cp-text-muted" style="margin-left:auto;font-size:11px">' + esc(r.sub) + '</span>';
        rHtml += '</div>';
      }
      if (results.length > 10) rHtml += '<div class="cp-global-search-more">' + (results.length - 10) + ' more results...</div>';
      $results.html(rHtml).show();
    }, 200));

    // Global search result click
    $(document).off('click.cp-global-go').on('click.cp-global-go', '[data-action="global-search-go"]', function(e) {
      e.preventDefault();
      var view = $(this).data('view');
      var id = $(this).data('id');
      var type = $(this).data('type');
      $('#cpGlobalSearchInput').val('');
      $('#cpGlobalSearchResults').hide();
      if (type === 'recipe') { S.selectedRecipeId = id; S.currentStep = 'composition'; }
      else if (type === 'campaign') { S.selectedCampaignId = id; }
      else if (type === 'persona') { S.selectedPersonaId = id; }
      else if (type === 'pain_point') { S.selectedPainPointId = id; }
      navigate(view);
    });

    // Close search on click outside
    $(document).off('click.cp-search-close').on('click.cp-search-close', function(e) {
      if (!$(e.target).closest('#cpGlobalSearch').length) {
        $('#cpGlobalSearchResults').hide();
      }
    });

    // Ctrl+K to focus search
    $(document).off('keydown.cp-search-focus').on('keydown.cp-search-focus', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        $('#cpGlobalSearchInput').focus();
      }
    });

    // Toast close
    $(document).off('click.cp-toast-close').on('click.cp-toast-close', '[data-action="close-toast"]', function() {
      $(this).closest('.cp-toast').remove();
    });

    // Personas tab toggle
    $(document).off('click.cp-personas-tab').on('click.cp-personas-tab', '[data-action="set-personas-tab"]', function(e) {
      e.preventDefault();
      var tab = $(this).data('tab');
      if (tab && tab !== S.personasTab) {
        S.personasTab = tab;
        S.selectedPersonaId = null;
        renderCurrentView();
      }
    });

    // Styles tab toggle
    $(document).off('click.cp-styles-tab').on('click.cp-styles-tab', '[data-action="set-styles-tab"]', function(e) {
      e.preventDefault();
      var tab = $(this).data('tab');
      if (tab && tab !== S.stylesTab) {
        S.stylesTab = tab;
        renderCurrentView();
      }
    });

    // Select persona
    $(document).off('click.cp-select-persona').on('click.cp-select-persona', '[data-action="select-persona"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      if (id) {
        S.selectedPersonaId = id;
        renderCurrentView();
      }
    });

    // Toggle category collapse
    $(document).off('click.cp-toggle-group').on('click.cp-toggle-group', '[data-action="toggle-group"]', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var groupKey = $(this).data('group');
      if (groupKey) {
        S.collapsedGroups[groupKey] = !S.collapsedGroups[groupKey];
        renderCurrentView();
      }
    });

    // AI Research bar toggle
    $(document).off('click.cp-ai-toggle').on('click.cp-ai-toggle', '[data-action="toggle-ai-research"]', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var key = $(this).data('key');
      if (key) {
        S.aiResearchOpen[key] = !S.aiResearchOpen[key];
        renderCurrentView();
      }
    });

    // Message search (debounced)
    $(document).off('input.cp-msg-search').on('input.cp-msg-search', '#cpMessageSearch', debounce(function() {
      S.messageFilter.search = $(this).val() || '';
      renderCurrentView();
    }, 250));

    // Message funnel filter
    $(document).off('change.cp-msg-funnel').on('change.cp-msg-funnel', '#cpMessageFunnelFilter', function() {
      S.messageFilter.funnel = $(this).val() || '';
      renderCurrentView();
    });

    // Message sort
    $(document).off('change.cp-msg-sort').on('change.cp-msg-sort', '#cpMessageSort', function() {
      S.messageFilter.sortBy = $(this).val() || 'updated';
      renderCurrentView();
    });

    // Persona search (debounced)
    $(document).off('input.cp-persona-search').on('input.cp-persona-search', '#cpPersonaSearch', debounce(function() {
      S.personaFilter.search = $(this).val() || '';
      renderCurrentView();
      var $el = $('#cpPersonaSearch'); if ($el.length) { var v = $el.val(); $el.focus(); $el[0].setSelectionRange(v.length, v.length); }
    }, 250));

    // Pain Point page search + filter + select
    $(document).off('input.cp-pp-page-search').on('input.cp-pp-page-search', '#cpPainPointPageSearch', debounce(function() {
      S.painPointFilter = S.painPointFilter || {};
      S.painPointFilter.search = $(this).val() || '';
      renderCurrentView();
      var $el = $('#cpPainPointPageSearch'); if ($el.length) { var v = $el.val(); $el.focus(); $el[0].setSelectionRange(v.length, v.length); }
    }, 250));
    $(document).off('change.cp-pp-cat-filter').on('change.cp-pp-cat-filter', '#cpPainPointCatFilter', function() {
      S.painPointFilter = S.painPointFilter || {};
      S.painPointFilter.category = $(this).val() || '';
      renderCurrentView();
    });
    $(document).off('click.cp-select-pp-page').on('click.cp-select-pp-page', '[data-action="select-pain-point-page"]', function(e) {
      e.preventDefault();
      S.selectedPainPointId = $(this).data('id');
      renderCurrentView();
    });

    // Pain point inline editing (blur saves)
    $(document).off('blur.cp-pp-inline').on('blur.cp-pp-inline', '.cp-pp-inline-field', function() {
      var ppId = S.selectedPainPointId;
      if (!ppId) return;
      var field = $(this).data('ppfield');
      var val = $(this).is('select') ? $(this).val() : $(this).val();
      saveEntityField('pain_point', ppId, field, val || '');
    });
    $(document).off('change.cp-pp-inline-sel').on('change.cp-pp-inline-sel', 'select.cp-pp-inline-field', function() {
      var ppId = S.selectedPainPointId;
      if (!ppId) return;
      saveEntityField('pain_point', ppId, $(this).data('ppfield'), $(this).val() || '');
    });

    // Unlink pain point from persona
    $(document).off('click.cp-unlink-pp').on('click.cp-unlink-pp', '[data-action="unlink-pp-from-persona"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var ppId = $(this).data('pp-id');
      var personaId = $(this).data('persona-id');
      if (!ppId || !personaId) return;
      var persona = S.personaMap[personaId];
      if (persona) {
        persona.pain_point_ids = (persona.pain_point_ids || []).filter(function(id) { return id !== ppId; });
        persona.updated = new Date().toISOString();
        buildMaps(); syncToTextarea(); renderCurrentView();
        toast('Unlinked from ' + (persona.name || 'persona'), 'success');
      }
    });

    // Link pain point to personas (opens multi-select modal)
    $(document).off('click.cp-link-pp').on('click.cp-link-pp', '[data-action="link-pp-to-personas"]', function(e) {
      e.preventDefault();
      var ppId = $(this).data('pp-id');
      if (!ppId) return;
      var allPersonas = getAllPersonas();
      var html = '<div class="cp-editor-form">';
      html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-3)">Select personas to link this pain point to:</p>';
      for (var pi = 0; pi < allPersonas.length; pi++) {
        var p = allPersonas[pi];
        var isLinked = (p.pain_point_ids || []).indexOf(ppId) > -1;
        html += '<label style="display:flex;align-items:center;gap:var(--cp-space-2);padding:var(--cp-space-2) 0;border-bottom:1px solid var(--cp-border-light);cursor:pointer">';
        html += '<input type="checkbox" class="cp-pp-link-check" data-persona-id="' + esc(p.id) + '"' + (isLinked ? ' checked' : '') + '>';
        html += '<span style="flex:1">' + esc(p.name) + '</span>';
        if (isLinked) html += '<span class="cp-badge" style="background:var(--cp-success-light);color:var(--cp-success);font-size:10px">' + icon('link') + ' Linked</span>';
        html += '</label>';
      }
      html += '</div>';

      openModal('Link to Personas', html, {
        titleIcon: 'link', size: 'md', saveLabel: 'Update Links',
        onSave: function() {
          snapshot('Link pain point to personas');
          $('.cp-pp-link-check').each(function() {
            var personaId = $(this).data('persona-id');
            var persona = S.personaMap[personaId];
            if (!persona) return;
            persona.pain_point_ids = persona.pain_point_ids || [];
            var idx = persona.pain_point_ids.indexOf(ppId);
            if (this.checked && idx === -1) persona.pain_point_ids.push(ppId);
            else if (!this.checked && idx > -1) persona.pain_point_ids.splice(idx, 1);
            persona.updated = new Date().toISOString();
          });
          buildMaps(); syncToTextarea(); renderCurrentView();
          closeModal();
          toast('Persona links updated', 'success');
        }
      });
    });

    // Format page search + filter
    $(document).off('input.cp-fmt-page-search').on('input.cp-fmt-page-search', '#cpFormatPageSearch', debounce(function() {
      S.formatFilter = S.formatFilter || {};
      S.formatFilter.search = $(this).val() || '';
      renderCurrentView();
    }, 250));
    $(document).off('change.cp-fmt-cat-filter').on('change.cp-fmt-cat-filter', '#cpFormatCatFilter', function() {
      S.formatFilter = S.formatFilter || {};
      S.formatFilter.category = $(this).val() || '';
      renderCurrentView();
    });

    // Select recipe
    $(document).off('click.cp-select-recipe').on('click.cp-select-recipe', '[data-action="select-recipe"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      if (id) {
        S.selectedRecipeId = id;
        S.currentStep = 'composition';
        if (S.currentView !== 'recipes') navigate('recipes');
        else renderCurrentView();
      }
    });

    // Recipe search (debounced)
    $(document).off('input.cp-recipe-search').on('input.cp-recipe-search', '#cpRecipeSearch', debounce(function() {
      S.recipeFilter.search = $(this).val() || '';
      renderCurrentView();
      var $el = $('#cpRecipeSearch'); if ($el.length) { var v = $el.val(); $el.focus(); $el[0].setSelectionRange(v.length, v.length); }
    }, 250));

    // Recipe status filter
    $(document).off('change.cp-recipe-status').on('change.cp-recipe-status', '#cpRecipeStatusFilter', function() {
      var v = $(this).val();
      S.recipeFilter.statuses = v ? [v] : [];
      renderCurrentView();
    });

    // Recipe campaign filter
    $(document).off('change.cp-recipe-camp').on('change.cp-recipe-camp', '#cpRecipeCampaignFilter', function() {
      S.recipeFilter.campaign = $(this).val() || '';
      renderCurrentView();
    });

    // Recipe sort
    $(document).off('change.cp-recipe-sort').on('change.cp-recipe-sort', '#cpRecipeSortBy', function() {
      S.recipeFilter.sortBy = $(this).val() || 'updated';
      renderCurrentView();
    });

    // Recipe sort direction toggle
    $(document).off('click.cp-recipe-sortdir').on('click.cp-recipe-sortdir', '[data-action="toggle-recipe-sort-dir"]', function(e) {
      e.preventDefault();
      S.recipeFilter.sortDir = S.recipeFilter.sortDir === 'asc' ? 'desc' : 'asc';
      renderCurrentView();
    });

    // Bulk mode toggle
    $(document).off('click.cp-bulk-toggle').on('click.cp-bulk-toggle', '[data-action="toggle-bulk-mode"]', function(e) {
      e.preventDefault();
      S._bulkMode = !S._bulkMode;
      S._bulkSelected = [];
      renderCurrentView();
    });
    $(document).off('change.cp-bulk-item').on('change.cp-bulk-item', '[data-action="bulk-toggle-item"]', function(e) {
      e.stopPropagation();
      S._bulkSelected = S._bulkSelected || [];
      var id = $(this).data('id');
      var idx = S._bulkSelected.indexOf(id);
      if (this.checked && idx === -1) S._bulkSelected.push(id);
      else if (!this.checked && idx > -1) S._bulkSelected.splice(idx, 1);
      renderCurrentView();
    });
    $(document).off('change.cp-bulk-all').on('change.cp-bulk-all', '[data-action="bulk-select-all"]', function() {
      var recipes = getFilteredRecipes();
      if (this.checked) {
        S._bulkSelected = recipes.map(function(r) { return r.id; });
      } else {
        S._bulkSelected = [];
      }
      renderCurrentView();
    });
    $(document).off('change.cp-bulk-status').on('change.cp-bulk-status', '#cpBulkStatus', function() {
      var newStatus = $(this).val();
      if (!newStatus || !S._bulkSelected || S._bulkSelected.length === 0) return;
      var count = S._bulkSelected.length;
      snapshot('Bulk status change');
      S._bulkSelected.forEach(function(id) { saveEntityField('recipe', id, 'status', newStatus); });
      logActivity('recipe_batch_updated', 'recipe', '', '', 'Bulk status changed ' + count + ' recipes to ' + newStatus);
      S._bulkSelected = [];
      toast(count + ' recipes updated', 'success');
    });
    $(document).off('click.cp-bulk-assign').on('click.cp-bulk-assign', '[data-action="bulk-assign-campaign"]', function(e) {
      e.preventDefault();
      if (!S._bulkSelected || S._bulkSelected.length === 0) return;
      var camps = getAllCampaigns();
      var html = '<div class="cp-editor-form">';
      html += '<p class="cp-text-muted">Assign ' + S._bulkSelected.length + ' selected recipe(s) to a campaign:</p>';
      html += '<select class="cp-select" id="cpBulkCampaignSelect"><option value="">Unassigned</option>';
      for (var ci = 0; ci < camps.length; ci++) html += '<option value="' + esc(camps[ci].id) + '">' + esc(camps[ci].name) + '</option>';
      html += '</select></div>';
      openModal('Bulk Assign Campaign', html, {
        titleIcon: 'bullhorn', size: 'sm', saveLabel: 'Assign',
        onSave: function() {
          var campId = $('#cpBulkCampaignSelect').val() || '';
          snapshot('Bulk assign campaign');
          S._bulkSelected.forEach(function(id) { saveEntityField('recipe', id, 'campaign_id', campId); });
          logActivity('recipe_batch_updated', 'recipe', '', '', 'Bulk assigned ' + S._bulkSelected.length + ' recipes to campaign');
          S._bulkSelected = [];
          closeModal();
          toast('Recipes assigned', 'success');
        }
      });
    });
    $(document).off('click.cp-bulk-delete').on('click.cp-bulk-delete', '[data-action="bulk-delete"]', function(e) {
      e.preventDefault();
      if (!S._bulkSelected || S._bulkSelected.length === 0) return;
      openConfirmDialog({
        title: 'Delete ' + S._bulkSelected.length + ' Recipes',
        message: 'Are you sure you want to delete ' + S._bulkSelected.length + ' selected recipe(s)? This cannot be undone.',
        confirmLabel: 'Delete All', danger: true,
        onConfirm: function() {
          snapshot('Bulk delete');
          S._bulkSelected.forEach(function(id) { deleteEntity('recipe', id); });
          logActivity('recipe_batch_deleted', 'recipe', '', '', 'Bulk deleted ' + S._bulkSelected.length + ' recipes');
          S._bulkSelected = [];
          S._bulkMode = false;
        }
      });
    });

    // Pipeline step navigation
    $(document).off('click.cp-go-step').on('click.cp-go-step', '[data-action="go-step"]', function(e) {
      e.preventDefault();
      var step = $(this).data('step');
      if (step) {
        S.currentStep = step;
        renderCurrentView();
      }
    });

    // Campaign search (debounced)
    $(document).off('input.cp-campaign-search').on('input.cp-campaign-search', '#cpCampaignSearch', debounce(function() {
      S.campaignFilter.search = $(this).val() || '';
      renderCurrentView();
    }, 250));

    // Campaign status filter
    $(document).off('change.cp-campaign-status').on('change.cp-campaign-status', '#cpCampaignStatusFilter', function() {
      S.campaignFilter.status = $(this).val() || '';
      renderCurrentView();
    });

    // Campaign detail tab switch
    $(document).off('click.cp-campaign-tab').on('click.cp-campaign-tab', '[data-action="set-campaign-tab"]', function(e) {
      e.preventDefault();
      S.campaignDetailTab = $(this).data('tab') || 'overview';
      renderCurrentView();
    });

    // Campaign brief save on blur
    $(document).off('blur.cp-campaign-brief').on('blur.cp-campaign-brief', '.cp-campaign-brief-field', function() {
      var campId = $(this).data('campaign-id');
      if (campId) {
        saveEntityField('campaign', campId, 'brief', $(this).val() || '');
      }
    });

    // Quick-create recipe from coverage matrix
    $(document).off('click.cp-quick-recipe').on('click.cp-quick-recipe', '[data-action="quick-create-recipe"]', function(e) {
      e.preventDefault();
      var personaId = $(this).data('persona-id');
      var messageId = $(this).data('message-id');
      var campId = $(this).data('campaign-id');
      if (!personaId || !messageId || !campId) return;
      snapshot('Quick create recipe');
      var newRecipe = createEntity('recipe', {
        persona_id: personaId, message_id: messageId, campaign_id: campId
      });
      if (newRecipe) {
        buildMaps(); renderCurrentView();
        toast('Recipe created and linked to campaign', 'success');
      }
    });

    // Calendar navigation
    $(document).off('click.cp-cal-prev').on('click.cp-cal-prev', '[data-action="cal-prev"]', function(e) {
      e.preventDefault();
      S.calendarMonth--;
      if (S.calendarMonth < 0) { S.calendarMonth = 11; S.calendarYear--; }
      renderCurrentView();
    });
    $(document).off('click.cp-cal-next').on('click.cp-cal-next', '[data-action="cal-next"]', function(e) {
      e.preventDefault();
      S.calendarMonth++;
      if (S.calendarMonth > 11) { S.calendarMonth = 0; S.calendarYear++; }
      renderCurrentView();
    });
    $(document).off('click.cp-cal-today').on('click.cp-cal-today', '[data-action="cal-today"]', function(e) {
      e.preventDefault();
      var now = new Date();
      S.calendarYear = now.getFullYear();
      S.calendarMonth = now.getMonth();
      renderCurrentView();
    });
    $(document).off('click.cp-cal-mode').on('click.cp-cal-mode', '[data-action="cal-mode"]', function(e) {
      e.preventDefault();
      S.calendarMode = $(this).data('mode') || 'month';
      renderCurrentView();
    });

    // Calendar filters
    $(document).off('change.cp-cal-camp-filter').on('change.cp-cal-camp-filter', '#cpCalCampaignFilter', function() {
      S.calendarFilters = S.calendarFilters || {};
      S.calendarFilters.campaign = $(this).val() || '';
      renderCurrentView();
    });
    $(document).off('change.cp-cal-status-filter').on('change.cp-cal-status-filter', '#cpCalStatusFilter', function() {
      S.calendarFilters = S.calendarFilters || {};
      S.calendarFilters.status = $(this).val() || '';
      renderCurrentView();
    });

    // Activity search (debounced)
    $(document).off('input.cp-activity-search').on('input.cp-activity-search', '#cpActivitySearch', debounce(function() {
      S.activityFilter.search = $(this).val() || '';
      renderCurrentView();
    }, 250));

    // Activity type filter
    $(document).off('change.cp-activity-type').on('change.cp-activity-type', '#cpActivityTypeFilter', function() {
      S.activityFilter.type = $(this).val() || '';
      renderCurrentView();
    });

    // Filter pipeline status from dashboard
    $(document).off('click.cp-filter-pipeline').on('click.cp-filter-pipeline', '[data-action="filter-pipeline-status"]', function(e) {
      e.preventDefault();
      var status = $(this).data('status');
      if (status) {
        S.recipeFilter.statuses = [status];
        navigate('recipes');
      }
    });

    // Select entity from activity
    $(document).off('click.cp-select-entity').on('click.cp-select-entity', '[data-action="select-entity"]', function(e) {
      e.preventDefault();
      var type = $(this).data('type');
      var id = $(this).data('id');
      if (type === 'recipe' && id) { S.selectedRecipeId = id; navigate('recipes'); }
      else if (type === 'persona' && id) { S.selectedPersonaId = id; navigate('personas'); }
      else if (type === 'campaign' && id) { navigate('campaigns'); }
      else if (type === 'message' && id) { navigate('messages'); }
    });

    // Hash change
    $(window).off('hashchange.cp').on('hashchange.cp', function() {
      var h = readHash();
      if (h !== S.currentView) navigate(h, { noHash: true });
    });

    console.log('[CP] Core event handlers ready');
  }

  function setupViewEventHandlers() {
    // Per-render hooks — called after each renderCurrentView()
    var view = S.currentView;

    // Restore scroll position for list panes
    if (view === 'recipes' && S.selectedRecipeId) {
      var $selItem = $('.cp-recipe-item-selected');
      if ($selItem.length) {
        var $list = $selItem.closest('.cp-recipe-list');
        if ($list.length) {
          var itemTop = $selItem.position().top;
          var listH = $list.height();
          if (itemTop > listH - 50 || itemTop < 0) {
            $list.scrollTop($list.scrollTop() + itemTop - listH / 3);
          }
        }
      }
    }

    if (view === 'personas' && S.selectedPersonaId) {
      var $selPersona = $('.cp-persona-item-selected');
      if ($selPersona.length) {
        var $tree = $selPersona.closest('.cp-persona-tree');
        if ($tree.length) {
          var pTop = $selPersona.position().top;
          var treeH = $tree.height();
          if (pTop > treeH - 50 || pTop < 0) {
            $tree.scrollTop($tree.scrollTop() + pTop - treeH / 3);
          }
        }
      }
    }

    // Update sidebar badge counts
    for (var key in APP_VIEWS) {
      var badgeHtml = renderSidebarBadge(key);
      var $navItem = $('.cp-nav-item[data-view="' + key + '"]');
      $navItem.find('.cp-nav-badge').remove();
      if (badgeHtml) $navItem.append(badgeHtml);
    }
  }

  // ============================================================
  // SECTION 19: FILTERING & SORTING HELPERS
  // ============================================================

  // getFilteredRecipes() is in Section 14

  function getFilteredPersonas(search) {
    var personas = (S.data.personas || []).slice();
    if (!search) return personas;
    var q = search.toLowerCase();
    return personas.filter(function(p) {
      return (p.name || '').toLowerCase().indexOf(q) > -1 ||
             (p.description || '').toLowerCase().indexOf(q) > -1 ||
             (p.demographics && p.demographics.occupation || '').toLowerCase().indexOf(q) > -1;
    });
  }

  function getFilteredMessages(filters) {
    var msgs = (S.data.messages || []).slice();
    if (!filters) return msgs;
    if (filters.search) {
      var q = filters.search.toLowerCase();
      msgs = msgs.filter(function(m) {
        return (m.title || '').toLowerCase().indexOf(q) > -1 ||
               (m.body || '').toLowerCase().indexOf(q) > -1 ||
               (m.theme || '').toLowerCase().indexOf(q) > -1;
      });
    }
    if (filters.funnel) {
      msgs = msgs.filter(function(m) { return (m.funnel_stages || []).indexOf(filters.funnel) > -1; });
    }
    if (filters.sortBy === 'title') msgs.sort(function(a, b) { return (a.title || '').localeCompare(b.title || ''); });
    else if (filters.sortBy === 'most_used') msgs.sort(function(a, b) { return (S.messageRecipeCounts[b.id] || 0) - (S.messageRecipeCounts[a.id] || 0); });
    else msgs.sort(function(a, b) { return (b.updated || b.created || '') > (a.updated || a.created || '') ? 1 : -1; });
    return msgs;
  }

  function getGroupedRecipes(groupBy) {
    var recipes = getFilteredRecipes();
    var groups = [];

    if (groupBy === 'status') {
      for (var sk in RECIPE_STATUSES) {
        var stCfg = RECIPE_STATUSES[sk];
        var stRecipes = recipes.filter(function(r) { return r.status === sk; });
        if (stRecipes.length > 0) {
          groups.push({ key: sk, label: stCfg.label, icon: stCfg.icon, color: stCfg.color, recipes: stRecipes });
        }
      }
    } else if (groupBy === 'campaign') {
      var campRecipes = {};
      recipes.forEach(function(r) {
        var ck = r.campaign_id || '_none';
        campRecipes[ck] = campRecipes[ck] || [];
        campRecipes[ck].push(r);
      });
      for (var cid in campRecipes) {
        var camp = S.campaignMap[cid];
        groups.push({
          key: cid, label: camp ? camp.name : 'No Campaign',
          icon: camp ? 'bullhorn' : 'folder',
          color: camp ? (CAMPAIGN_STATUSES[camp.status] || {}).color || '#80868b' : '#80868b',
          recipes: campRecipes[cid]
        });
      }
    } else if (groupBy === 'persona') {
      var perRecipes = {};
      recipes.forEach(function(r) {
        var pk = r.persona_id || '_none';
        perRecipes[pk] = perRecipes[pk] || [];
        perRecipes[pk].push(r);
      });
      for (var pid in perRecipes) {
        var persona = S.personaMap[pid];
        groups.push({ key: pid, label: persona ? persona.name : 'No Persona', icon: 'user', color: '#9334e9', recipes: perRecipes[pid] });
      }
    } else if (groupBy === 'priority') {
      for (var plk in PRIORITY_LEVELS) {
        var plCfg = PRIORITY_LEVELS[plk];
        var plRecipes = recipes.filter(function(r) { return r.priority === plk; });
        if (plRecipes.length > 0) {
          groups.push({ key: plk, label: plCfg.label, icon: plCfg.icon, color: plCfg.color, recipes: plRecipes });
        }
      }
    } else if (groupBy === 'funnel') {
      var funnels = (S.meta.settings && S.meta.settings.funnel_stages) || [];
      funnels.forEach(function(f) {
        var fRecipes = recipes.filter(function(r) {
          var msg = S.messageMap[r.message_id];
          return msg && (msg.funnel_stages || []).indexOf(f.id) > -1;
        });
        if (fRecipes.length > 0) {
          groups.push({ key: f.id, label: f.name, icon: 'filter', color: f.color, recipes: fRecipes });
        }
      });
      var noFunnel = recipes.filter(function(r) {
        var msg = S.messageMap[r.message_id];
        return !msg || !msg.funnel_stages || msg.funnel_stages.length === 0;
      });
      if (noFunnel.length > 0) {
        groups.push({ key: '_none', label: 'No Funnel Stage', icon: 'circle', color: '#80868b', recipes: noFunnel });
      }
    } else if (groupBy === 'tag') {
      var taggedRecipes = {};
      recipes.forEach(function(r) {
        var tags = r.tags || [];
        if (tags.length === 0) {
          taggedRecipes['_none'] = taggedRecipes['_none'] || [];
          taggedRecipes['_none'].push(r);
        } else {
          tags.forEach(function(tid) {
            taggedRecipes[tid] = taggedRecipes[tid] || [];
            taggedRecipes[tid].push(r);
          });
        }
      });
      for (var tid in taggedRecipes) {
        var tag = S.tagMap[tid];
        groups.push({ key: tid, label: tag ? tag.name : 'Untagged', icon: 'tag', color: tag ? tag.color : '#80868b', recipes: taggedRecipes[tid] });
      }
    }

    return groups;
  }

  // ============================================================
  // SECTION 21: CRUD HELPERS
  // ============================================================

  function createEntity(type, data) {
    var now = new Date().toISOString();
    data = data || {};
    var entity;

    switch (type) {
      case 'persona':
        entity = $.extend(true, {
          id: generateId('per'), category_id: '', name: '', description: '',
          demographics: { age_range: '', gender: 'all', location: '', income_level: '', education: '', occupation: '', custom: {} },
          psychographics: { desires: '', requirements: '', emotional_triggers: '', motivations: '', fears: '', values: '', custom: {} },
          pain_point_ids: [], custom_pain_points: [], notes: '', tags: [],
          created: now, updated: now, created_by: S.user.id || ''
        }, data);
        S.data.personas.push(entity);
        logActivity('persona_created', 'persona', entity.id, entity.name, 'Created persona');
        break;

      case 'persona_category':
        entity = $.extend(true, {
          id: generateId('pcat'), name: '', description: '',
          order: (S.data.persona_categories || []).length,
          created: now, updated: now
        }, data);
        S.data.persona_categories.push(entity);
        logActivity('category_created', 'persona_category', entity.id, entity.name, 'Created category');
        break;

      case 'pain_point':
        entity = $.extend(true, {
          id: generateId('pp'), pain_point: '', solution: '', category: '', tags: [],
          created: now, updated: now
        }, data);
        S.data.pain_points.push(entity);
        logActivity('pain_point_created', 'pain_point', entity.id, entity.pain_point, 'Created pain point');
        break;

      case 'message':
        entity = $.extend(true, {
          id: generateId('msg'), title: '', body: '', funnel_stages: [],
          delivery_notes: '', theme: '', hooks: [], tags: [], notes: '',
          created: now, updated: now, created_by: S.user.id || ''
        }, data);
        S.data.messages.push(entity);
        logActivity('message_created', 'message', entity.id, entity.title, 'Created message');
        break;

      case 'style':
        entity = $.extend(true, {
          id: generateId('sty'), name: '', description: '', tags: [],
          created: now, updated: now
        }, data);
        S.data.styles.push(entity);
        logActivity('style_created', 'style', entity.id, entity.name, 'Created style');
        break;

      case 'visual_format':
        entity = $.extend(true, {
          id: generateId('vf'), name: '', description: '', category: '',
          reference_image_ids: [], tags: [],
          created: now, updated: now
        }, data);
        S.data.visual_formats.push(entity);
        logActivity('format_created', 'format', entity.id, entity.name, 'Created visual format');
        break;

      case 'recipe':
        entity = $.extend(true, {
          id: generateId('rec'), title: '', status: 'draft', priority: (S.meta.settings.defaults || {}).priority || 'medium',
          campaign_id: '', persona_id: '', message_id: '', style_id: '', visual_format_id: '',
          selected_pain_point_ids: [], media_type: 'image',
          hook: { selected_hook_id: '', custom_hook: '', hook_type: '' },
          content: { ad_copy: '', headline: '', description: '', cta: '', variants: [], notes: '' },
          image_brief: { creative_brief: '', ai_prompt: '', prompt_params: { aspect_ratio: '1:1', visual_approach: 'photography', mood: '', negative_prompt: '' }, reference_image_ids: [] },
          video: { duration_seconds: 30, format: 'Reel', aspect_ratio: '9:16', concept: '', blueprint: { scenes: [] }, script: { rows: [] } },
          review_notes: '', production_notes: '', assigned_to: '', due_date: '',
          delivery_notes: '', creative_brief: '',
          tags: [], batch_id: '',
          created: now, updated: now, created_by: S.user.id || ''
        }, data);
        // Auto-generate title from dimensions
        if (!entity.title) {
          var parts = [];
          var per = S.personaMap[entity.persona_id]; if (per) parts.push(per.name);
          var msg = S.messageMap[entity.message_id]; if (msg) parts.push(msg.title);
          var sty = S.styleMap[entity.style_id]; if (sty) parts.push(sty.name);
          var vf = S.formatMap[entity.visual_format_id]; if (vf) parts.push(vf.name);
          entity.title = parts.length > 0 ? parts.join(' × ') : 'New Recipe';
        }
        S.data.recipes.push(entity);
        logActivity('recipe_created', 'recipe', entity.id, entity.title, 'Created recipe');
        break;

      case 'campaign':
        entity = $.extend(true, {
          id: generateId('cmp'), name: '', description: '', objective: '',
          funnel_stage: '', date_start: '', date_end: '',
          status: (S.meta.settings.defaults || {}).campaign_status || 'planning',
          budget_notes: '', target_audience_notes: '',
          persona_ids: [], message_ids: [], style_ids: [], format_ids: [],
          ai_instructions: '', phases: [], brief: '',
          tags: [], notes: '',
          created: now, updated: now, created_by: S.user.id || ''
        }, data);
        S.data.campaigns.push(entity);
        logActivity('campaign_created', 'campaign', entity.id, entity.name, 'Created campaign');
        break;

      case 'tag':
        entity = $.extend(true, {
          id: generateId('tag'), name: '', color: '#1a73e8', description: '',
          created: now
        }, data);
        S.data.tags.push(entity);
        logActivity('tag_created', 'tag', entity.id, entity.name, 'Created tag');
        break;

      default:
        console.warn('[CP] Unknown entity type:', type);
        return null;
    }

    buildMaps();
    syncToTextarea();
    renderCurrentView();
    toast(capitalize(type.replace(/_/g, ' ')) + ' created', 'success');
    return entity;
  }

  function deleteEntity(type, id) {
    if (!type || !id) return false;
    var entity, idx;
    var entityTitle = '';

    switch (type) {
      case 'persona':
        entity = S.personaMap[id]; if (!entity) return false;
        entityTitle = entity.name;
        idx = S.data.personas.findIndex(function(p) { return p.id === id; });
        if (idx > -1) S.data.personas.splice(idx, 1);
        (S.data.recipes || []).forEach(function(r) { if (r.persona_id === id) r.persona_id = ''; });
        logActivity('persona_deleted', 'persona', id, entityTitle, 'Deleted persona');
        break;

      case 'persona_category':
        entity = S.categoryMap[id]; if (!entity) return false;
        entityTitle = entity.name;
        idx = S.data.persona_categories.findIndex(function(c) { return c.id === id; });
        if (idx > -1) S.data.persona_categories.splice(idx, 1);
        (S.data.personas || []).forEach(function(p) { if (p.category_id === id) p.category_id = ''; });
        logActivity('category_deleted', 'persona_category', id, entityTitle, 'Deleted category');
        break;

      case 'pain_point':
        entity = S.painPointMap[id]; if (!entity) return false;
        entityTitle = entity.pain_point;
        idx = S.data.pain_points.findIndex(function(pp) { return pp.id === id; });
        if (idx > -1) S.data.pain_points.splice(idx, 1);
        (S.data.personas || []).forEach(function(p) {
          p.pain_point_ids = (p.pain_point_ids || []).filter(function(pid) { return pid !== id; });
        });
        (S.data.recipes || []).forEach(function(r) {
          r.selected_pain_point_ids = (r.selected_pain_point_ids || []).filter(function(pid) { return pid !== id; });
        });
        logActivity('pain_point_deleted', 'pain_point', id, truncate(entityTitle, 40), 'Deleted pain point');
        break;

      case 'message':
        entity = S.messageMap[id]; if (!entity) return false;
        entityTitle = entity.title;
        idx = S.data.messages.findIndex(function(m) { return m.id === id; });
        if (idx > -1) S.data.messages.splice(idx, 1);
        (S.data.recipes || []).forEach(function(r) { if (r.message_id === id) r.message_id = ''; });
        logActivity('message_deleted', 'message', id, entityTitle, 'Deleted message');
        break;

      case 'style':
        entity = S.styleMap[id]; if (!entity) return false;
        entityTitle = entity.name;
        idx = S.data.styles.findIndex(function(s) { return s.id === id; });
        if (idx > -1) S.data.styles.splice(idx, 1);
        (S.data.recipes || []).forEach(function(r) { if (r.style_id === id) r.style_id = ''; });
        logActivity('style_deleted', 'style', id, entityTitle, 'Deleted style');
        break;

      case 'visual_format':
        entity = S.formatMap[id]; if (!entity) return false;
        entityTitle = entity.name;
        idx = S.data.visual_formats.findIndex(function(f) { return f.id === id; });
        if (idx > -1) S.data.visual_formats.splice(idx, 1);
        (S.data.recipes || []).forEach(function(r) { if (r.visual_format_id === id) r.visual_format_id = ''; });
        logActivity('format_deleted', 'format', id, entityTitle, 'Deleted visual format');
        break;

      case 'recipe':
        entity = S.recipeMap[id]; if (!entity) return false;
        entityTitle = entity.title;
        idx = S.data.recipes.findIndex(function(r) { return r.id === id; });
        if (idx > -1) S.data.recipes.splice(idx, 1);
        if (S.selectedRecipeId === id) S.selectedRecipeId = null;
        logActivity('recipe_deleted', 'recipe', id, entityTitle, 'Deleted recipe');
        break;

      case 'campaign':
        entity = S.campaignMap[id]; if (!entity) return false;
        entityTitle = entity.name;
        idx = S.data.campaigns.findIndex(function(c) { return c.id === id; });
        if (idx > -1) S.data.campaigns.splice(idx, 1);
        (S.data.recipes || []).forEach(function(r) { if (r.campaign_id === id) r.campaign_id = ''; });
        logActivity('campaign_deleted', 'campaign', id, entityTitle, 'Deleted campaign');
        break;

      case 'tag':
        entity = S.tagMap[id]; if (!entity) return false;
        entityTitle = entity.name;
        idx = S.data.tags.findIndex(function(t) { return t.id === id; });
        if (idx > -1) S.data.tags.splice(idx, 1);
        var allArrays = [S.data.personas, S.data.messages, S.data.styles, S.data.visual_formats, S.data.recipes, S.data.campaigns];
        allArrays.forEach(function(arr) {
          (arr || []).forEach(function(item) {
            if (item.tags) item.tags = item.tags.filter(function(tid) { return tid !== id; });
          });
        });
        if (S.selectedTagId === id) S.selectedTagId = null;
        logActivity('tag_deleted', 'tag', id, entityTitle, 'Deleted tag');
        break;

      default:
        console.warn('[CP] Unknown entity type for deletion:', type);
        return false;
    }

    buildMaps();
    syncToTextarea();
    renderCurrentView();
    toast(capitalize(type.replace(/_/g, ' ')) + ' deleted', 'success');
    return true;
  }

  function saveEntityField(type, id, field, value) {
    var collections = {
      persona: S.data.personas, message: S.data.messages, style: S.data.styles,
      visual_format: S.data.visual_formats, recipe: S.data.recipes, campaign: S.data.campaigns,
      pain_point: S.data.pain_points, persona_category: S.data.persona_categories, tag: S.data.tags
    };
    var coll = collections[type];
    if (!coll) { console.warn('[CP] Unknown entity type for save:', type); return; }

    var entity = coll.find(function(e) { return e.id === id; });
    if (!entity) { console.warn('[CP] Entity not found:', type, id); return; }

    // Support nested fields: 'demographics.age_range'
    var parts = field.split('.');
    if (parts.length === 1) {
      if (entity[field] === value) return;
      entity[field] = value;
    } else {
      var obj = entity;
      for (var pi = 0; pi < parts.length - 1; pi++) {
        if (!obj[parts[pi]]) obj[parts[pi]] = {};
        obj = obj[parts[pi]];
      }
      var lastKey = parts[parts.length - 1];
      if (obj[lastKey] === value) return;
      obj[lastKey] = value;
    }

    entity.updated = new Date().toISOString();

    // Recipe status change logging
    if (type === 'recipe' && field === 'status') {
      var newLabel = (RECIPE_STATUSES[value] || {}).label || value;
      logActivity('recipe_status_changed', 'recipe', id, entity.title, 'Status changed to ' + newLabel);
    }

    buildMaps();
    syncToTextarea();
    renderCurrentView();
  }

  function duplicateEntity(type, id) {
    var collections = {
      persona: S.data.personas, message: S.data.messages, style: S.data.styles,
      visual_format: S.data.visual_formats, recipe: S.data.recipes, campaign: S.data.campaigns
    };
    var coll = collections[type];
    if (!coll) return null;

    var source = coll.find(function(e) { return e.id === id; });
    if (!source) return null;

    var clone = deepClone(source);
    clone.id = generateId(type.substring(0, 3));
    clone.created = new Date().toISOString();
    clone.updated = clone.created;
    clone.created_by = S.user.id || '';
    if (clone.title) clone.title += ' (copy)';
    if (clone.name) clone.name += ' (copy)';
    if (type === 'recipe') { clone.status = 'draft'; clone.batch_id = ''; clone.review_notes = ''; clone.assigned_to = ''; }

    coll.push(clone);
    logActivity(type + '_created', type, clone.id, clone.title || clone.name, 'Duplicated');
    buildMaps();
    syncToTextarea();
    renderCurrentView();
    toast(capitalize(type.replace(/_/g, ' ')) + ' duplicated', 'success');
    return clone;
  }

  function capitalize(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''; }

  // ============================================================
  // SECTION 22: AUTO-STATUS ENGINE
  // ============================================================

  function evaluateAutoStatus(recipe) {
    if (!recipe) return null;
    var currentIdx = STATUS_ORDER.indexOf(recipe.status);
    if (currentIdx < 0) return null;
    var suggested = recipe.status;

    // draft → hook_ready
    var hook = recipe.hook || {};
    if (STATUS_ORDER.indexOf('hook_ready') > currentIdx) {
      if (hook.selected_hook_id || (hook.custom_hook && hook.custom_hook.trim().length > 10)) {
        suggested = 'hook_ready';
      }
    }

    // hook_ready → content_ready
    var sugIdx = STATUS_ORDER.indexOf(suggested);
    var content = recipe.content || {};
    if (STATUS_ORDER.indexOf('content_ready') > sugIdx) {
      var adCopyText = stripHtml(content.ad_copy || '');
      if (adCopyText.trim().length > 50) {
        suggested = 'content_ready';
      }
    }

    // content_ready → media_ready
    sugIdx = STATUS_ORDER.indexOf(suggested);
    if (STATUS_ORDER.indexOf('media_ready') > sugIdx) {
      if (recipe.media_type === 'image') {
        var brief = recipe.image_brief || {};
        if ((brief.creative_brief && brief.creative_brief.trim().length > 30) ||
            (brief.ai_prompt && brief.ai_prompt.trim().length > 20)) {
          suggested = 'media_ready';
        }
      } else if (recipe.media_type === 'video') {
        var scenes = (recipe.video && recipe.video.blueprint && recipe.video.blueprint.scenes) || [];
        if (scenes.length >= 2) {
          suggested = 'media_ready';
        }
      }
    }

    // in_review, approved, live are manual only
    return suggested === recipe.status ? null : suggested;
  }

  function maybeAdvanceRecipeStatus(recipe, reason) {
    if (!recipe) return false;
    var suggested = evaluateAutoStatus(recipe);
    if (!suggested) return false;
    var currentIdx = STATUS_ORDER.indexOf(recipe.status);
    var suggestedIdx = STATUS_ORDER.indexOf(suggested);
    if (suggestedIdx <= currentIdx) return false;

    var oldLabel = (RECIPE_STATUSES[recipe.status] || {}).label || recipe.status;
    var newLabel = (RECIPE_STATUSES[suggested] || {}).label || suggested;
    recipe.status = suggested;
    recipe.updated = new Date().toISOString();
    logActivity('recipe_status_changed', 'recipe', recipe.id, recipe.title, oldLabel + ' → ' + newLabel + (reason ? ' (' + reason + ')' : ''));
    toast('Auto-advanced to ' + newLabel + (reason ? ' — ' + reason : ''), 'success', 4000);
    return true;
  }
  function syncToTextarea() {
    if (!S.$textarea || !S.$metaTextarea || !S.$activityTextarea) return;
    try {
      S.$textarea.val(JSON.stringify(S.data, null, 2)).trigger('change');
      S.$metaTextarea.val(JSON.stringify(S.meta, null, 2)).trigger('change');
      S.$activityTextarea.val(JSON.stringify(S.activity, null, 2)).trigger('change');
      S.dirty = true;
      updateSaveStatus('unsaved');
    } catch (e) { console.error('[CP] Sync error:', e); }
  }
  function updateSaveStatus(status) {
    var $s = $('#cpSaveStatus');
    if (status === 'saving') $s.text('Saving...').removeClass('cp-saved cp-unsaved cp-synced').addClass('cp-saving');
    else if (status === 'saved') { $s.text('Saved').removeClass('cp-saving cp-unsaved cp-synced').addClass('cp-saved'); S.dirty = false; }
    else if (status === 'synced') { $s.text('Synced — click Save').removeClass('cp-saving cp-saved cp-unsaved').addClass('cp-synced'); }
    else $s.text('Unsaved').removeClass('cp-saving cp-saved cp-synced').addClass('cp-unsaved');
  }
  function startAutoSave() {
    if (S.autoSaveTimer) clearInterval(S.autoSaveTimer);
    S.autoSaveTimer = setInterval(function() { if (S.dirty) { syncToTextarea(); updateSaveStatus('synced'); } }, 30000);
  }
  function toast(msg, type, dur) {
    type = type || 'info'; dur = dur || 3000;
    var $c = $('#cpToasts');
    if (!$c.length) { $c = $('<div id="cpToasts" class="cp-toast-container"></div>'); $('#cpApp').append($c); }
    var id = 'toast_' + Date.now();
    var iconName = type === 'success' ? 'success' : (type === 'error' ? 'error' : (type === 'warning' ? 'warning' : 'info'));
    $c.append('<div class="cp-toast cp-toast-' + type + '" id="' + id + '"><span class="cp-toast-icon">' + icon(iconName) + '</span><span class="cp-toast-message">' + esc(msg) + '</span><button class="cp-toast-close" data-action="close-toast">&times;</button></div>');
    setTimeout(function() { $('#' + id).addClass('cp-toast-show'); }, 10);
    setTimeout(function() { $('#' + id).removeClass('cp-toast-show'); setTimeout(function() { $('#' + id).remove(); }, 300); }, dur);
  }
  var ACTIVITY_LOG_MAX = 500;
  function logActivity(type, entityType, entityId, entityTitle, description) {
    S.activity = S.activity || [];
    S.activity.push({
      id: generateId('act'), type: type,
      entity_type: entityType || '', entity_id: entityId || '', entity_title: entityTitle || '',
      description: description || '',
      timestamp: new Date().toISOString(),
      user_id: S.user.id || '', user_name: S.user.name || ''
    });
    if (S.activity.length > ACTIVITY_LOG_MAX) S.activity = S.activity.slice(-ACTIVITY_LOG_MAX);
  }

  $(window).on('beforeunload', function(e) {
    if (S.autoSaveTimer) clearInterval(S.autoSaveTimer);
    if (S.dirty) { e.preventDefault(); e.returnValue = ''; return ''; }
  });

  // ============================================================
  // SECTION 23: API EXPORTS
  // ============================================================

  window._cpState = S;

  // Core
  window._cpRender = renderCurrentView;
  window._cpRenderAppShell = renderAppShell;
  window._cpNavigate = navigate;
  window._cpToast = toast;
  window._cpGenerateId = generateId;
  window._cpBuildMaps = buildMaps;
  window._cpSyncToTextarea = syncToTextarea;
  window._cpUpdateSaveStatus = updateSaveStatus;
  window._cpLogActivity = logActivity;

  // Formatters
  window._cpFormatDate = formatDate;
  window._cpFormatDateShort = formatDateShort;
  window._cpFormatRelativeTime = formatRelativeTime;
  window._cpFormatNumber = formatNumber;

  // Utilities
  window._cpEsc = esc;
  window._cpIcon = icon;
  window._cpTruncate = truncate;
  window._cpDeepClone = deepClone;
  window._cpDebounce = debounce;
  window._cpIsEmpty = isEmpty;
  window._cpCountWords = countWords;
  window._cpCountChars = countChars;
  window._cpStripHtml = stripHtml;

  // Badges
  window._cpBadge = badge;
  window._cpRecipeStatusBadge = recipeStatusBadge;
  window._cpCampaignStatusBadge = campaignStatusBadge;
  window._cpPriorityBadge = priorityBadge;
  window._cpFunnelBadge = funnelBadge;
  window._cpDimensionBadge = dimensionBadge;
  window._cpMediaTypeBadge = mediaTypeBadge;
  window._cpHookTypeBadge = hookTypeBadge;
  window._cpProgressBar = progressBar;

  // Entity getters
  window._cpGetPersona = getPersona;
  window._cpGetCategory = getCategory;
  window._cpGetPainPoint = getPainPoint;
  window._cpGetMessage = getMessage;
  window._cpGetStyle = getStyle;
  window._cpGetFormat = getFormat;
  window._cpGetRecipe = getRecipe;
  window._cpGetCampaign = getCampaign;
  window._cpGetTag = getTag;
  window._cpGetFunnelStage = getFunnelStage;
  window._cpGetResearchSession = getResearchSession;
  window._cpGetImageById = getImageById;

  // Collection getters
  window._cpGetAllTags = getAllTags;
  window._cpGetAllPersonas = getAllPersonas;
  window._cpGetAllMessages = getAllMessages;
  window._cpGetAllStyles = getAllStyles;
  window._cpGetAllFormats = getAllFormats;
  window._cpGetAllRecipes = getAllRecipes;
  window._cpGetAllCampaigns = getAllCampaigns;
  window._cpGetAllPainPoints = getAllPainPoints;
  window._cpGetAllCategories = getAllCategories;
  window._cpGetRecentActivity = getRecentActivity;
  window._cpGetPersonasByCategory = getPersonasByCategory;
  window._cpGetRecipesByCampaign = getRecipesByCampaign;
  window._cpGetRecipesByPersona = getRecipesByPersona;
  window._cpGetPersonaPainPoints = getPersonaPainPoints;
  window._cpGetImages = getImages;
  window._cpGetAllImageTags = getAllImageTags;
  window._cpCalculateDiversityScore = calculateDiversityScore;
  window._cpIsSetupComplete = isSetupComplete;
  window._cpParseImageField = parseImageField;

  // Constants
  window._cpConstants = {
    APP_VIEWS: APP_VIEWS, SIDEBAR_GROUPS: SIDEBAR_GROUPS, DIMENSIONS: DIMENSIONS,
    RECIPE_STATUSES: RECIPE_STATUSES, STATUS_ORDER: STATUS_ORDER, ACTIVE_STATUSES: ACTIVE_STATUSES,
    CAMPAIGN_STATUSES: CAMPAIGN_STATUSES, FUNNEL_DEFAULTS: FUNNEL_DEFAULTS,
    PIPELINE_STEPS: PIPELINE_STEPS, MEDIA_TYPES: MEDIA_TYPES, HOOK_TYPES: HOOK_TYPES,
    PRIORITY_LEVELS: PRIORITY_LEVELS, CAMPAIGN_OBJECTIVES: CAMPAIGN_OBJECTIVES,
    FORMAT_CATEGORIES: FORMAT_CATEGORIES, PAIN_POINT_CATEGORIES: PAIN_POINT_CATEGORIES,
    ACTIVITY_TYPES: ACTIVITY_TYPES, CARD_DENSITIES: CARD_DENSITIES, GROUPING_OPTIONS: GROUPING_OPTIONS
  };

  // Setup
  window._cpCompleteSetup = completeSetup;

  // Renderers (for re-rendering from Part 2A/2B)
  window._cpRenderActivityItem = renderActivityItem;
  window._cpRenderAIResearchBar = renderAIResearchBar;
  window._cpRenderPersonaDetailPane = renderPersonaDetailPane;
  window._cpRenderPersonaListItem = renderPersonaListItem;
  window._cpRenderMessageCard = renderMessageCard;
  window._cpRenderStyleCard = renderStyleCard;
  window._cpRenderFormatCard = renderFormatCard;
  window._cpRenderRecipeListItem = renderRecipeListItem;
  window._cpRenderCampaignListItem = renderCampaignListItem;
  window._cpGetRecipeCompletionPct = getRecipeCompletionPct;
  window._cpGetFilteredRecipes = getFilteredRecipes;
  window._cpGetFilteredPersonas = getFilteredPersonas;
  window._cpGetFilteredMessages = getFilteredMessages;
  window._cpGetGroupedRecipes = getGroupedRecipes;

  // CRUD
  window._cpCreateEntity = createEntity;
  window._cpDeleteEntity = deleteEntity;
  window._cpSaveEntityField = saveEntityField;
  window._cpDuplicateEntity = duplicateEntity;

  // Auto-status
  window._cpEvaluateAutoStatus = evaluateAutoStatus;
  window._cpMaybeAdvanceRecipeStatus = maybeAdvanceRecipeStatus;

  console.log('[CP] Part 1 loaded');
})(jQuery, Drupal);
