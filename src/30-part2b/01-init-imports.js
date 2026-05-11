  // ============================================================
  // SECTION 1: INIT & IMPORTS
  // ============================================================

  var S, render, navigate, toast, generateId, buildMaps, syncToTextarea, esc, deepClone, icon;
  var formatDate, formatRelativeTime, formatNumber, truncate, logActivity;
  var stripHtml, countWords, countChars;
  var badge, recipeStatusBadge, campaignStatusBadge, priorityBadge;
  var funnelBadge, dimensionBadge, mediaTypeBadge, hookTypeBadge, progressBar;
  var createEntity, deleteEntity, saveEntityField, duplicateEntity;
  var maybeAdvanceRecipeStatus;
  var getAllPersonas, getAllMessages, getAllStyles, getAllFormats;
  var getAllCategories, getAllPainPoints, getAllCampaigns, getAllTags;
  var getPersonaPainPoints, getPersona, getMessage, getStyle, getFormat;
  var getCategory, getCampaign, getTag, getPainPoint, getFunnelStage;
  var getRecipe, getImages, getAllImageTags, parseImageField, isSetupComplete;
  var Constants;
  var snapshot, openModal, closeModal, openConfirmDialog, closeConfirmDialog, collectModalFields;
  var collectFunnelChips, getSelectedRecipe, getEffectiveHook, renderTagInput;

  console.log('[CP] Part 2B script loaded');

  var _checkCount = 0;
  var checkInterval = setInterval(function() {
    _checkCount++;
    if (window._cpPart2A && window._cpState && window._cpState.initialized) {
      clearInterval(checkInterval);
      console.log('[CP] Part 2B: Dependencies ready after ' + (_checkCount * 100) + 'ms — calling initPart2B()');
      try { initPart2B(); } catch(e) { console.error('[CP] Part 2B init CRASHED:', e.message, e.stack); }
    } else if (_checkCount > 150) {
      clearInterval(checkInterval);
      var diag = [];
      if (!window._cpState) diag.push('_cpState missing (Part 1 JS not loaded — check Asset Injector)');
      else if (!window._cpState.initialized) diag.push('Part 1 loaded but init() never ran (check body class: need node--type-campaign-planner)');
      if (!window._cpPart2AScript) diag.push('Part 2A JS file not loaded (check Asset Injector order)');
      else if (!window._cpPart2A) diag.push('Part 2A JS loaded but exports missing');
      console.error('[CP] Part 2B: Timed out. ' + diag.join('; '));
      console.error('[CP] Debug state: _cpState=' + !!window._cpState + ' initialized=' + !!(window._cpState && window._cpState.initialized) + ' _cpPart2AScript=' + !!window._cpPart2AScript + ' _cpPart2A=' + !!window._cpPart2A);
    }
    else if (_checkCount === 30) {
      console.log('[CP] Part 2B: Still waiting (3s). _cpState=' + !!window._cpState + ' initialized=' + !!(window._cpState && window._cpState.initialized) + ' _cpPart2A=' + !!window._cpPart2A);
    }
  }, 100);

  function initPart2B() {
    try {
    console.log('[CP] Initializing Part 2B...');

    // Part 1 imports
    S = window._cpState; render = window._cpRender; navigate = window._cpNavigate;
    toast = window._cpToast; generateId = window._cpGenerateId; buildMaps = window._cpBuildMaps;
    syncToTextarea = window._cpSyncToTextarea; esc = window._cpEsc; deepClone = window._cpDeepClone;
    icon = window._cpIcon; formatDate = window._cpFormatDate; formatRelativeTime = window._cpFormatRelativeTime;
    formatNumber = window._cpFormatNumber; truncate = window._cpTruncate; logActivity = window._cpLogActivity;
    stripHtml = window._cpStripHtml; countWords = window._cpCountWords; countChars = window._cpCountChars;
    badge = window._cpBadge; recipeStatusBadge = window._cpRecipeStatusBadge;
    campaignStatusBadge = window._cpCampaignStatusBadge; priorityBadge = window._cpPriorityBadge;
    funnelBadge = window._cpFunnelBadge; dimensionBadge = window._cpDimensionBadge;
    mediaTypeBadge = window._cpMediaTypeBadge; hookTypeBadge = window._cpHookTypeBadge;
    progressBar = window._cpProgressBar; Constants = window._cpConstants;
    createEntity = window._cpCreateEntity; deleteEntity = window._cpDeleteEntity;
    saveEntityField = window._cpSaveEntityField; duplicateEntity = window._cpDuplicateEntity;
    maybeAdvanceRecipeStatus = window._cpMaybeAdvanceRecipeStatus;
    getAllPersonas = window._cpGetAllPersonas; getAllMessages = window._cpGetAllMessages;
    getAllStyles = window._cpGetAllStyles; getAllFormats = window._cpGetAllFormats;
    getAllCategories = window._cpGetAllCategories; getAllPainPoints = window._cpGetAllPainPoints;
    getAllCampaigns = window._cpGetAllCampaigns; getAllTags = window._cpGetAllTags;
    getPersonaPainPoints = window._cpGetPersonaPainPoints;
    getPersona = window._cpGetPersona; getMessage = window._cpGetMessage;
    getStyle = window._cpGetStyle; getFormat = window._cpGetFormat;
    getCategory = window._cpGetCategory; getCampaign = window._cpGetCampaign;
    getTag = window._cpGetTag; getPainPoint = window._cpGetPainPoint;
    getFunnelStage = window._cpGetFunnelStage; getRecipe = window._cpGetRecipe;
    getImages = window._cpGetImages; getAllImageTags = window._cpGetAllImageTags;
    parseImageField = window._cpParseImageField; isSetupComplete = window._cpIsSetupComplete;

    if (!S) { console.error('[CP] Part 2B: State not available'); return; }
    if (!render) { console.error('[CP] Part 2B: render not available'); return; }

    // Part 2A imports
    var P2A = window._cpPart2A;
    if (!P2A) { console.error('[CP] Part 2B: Part 2A exports not found'); return; }
    snapshot = P2A.snapshot; openModal = P2A.openModal; closeModal = P2A.closeModal;
    openConfirmDialog = P2A.openConfirmDialog; closeConfirmDialog = P2A.closeConfirmDialog;
    collectModalFields = P2A.collectModalFields; collectFunnelChips = P2A.collectFunnelChips;
    getSelectedRecipe = P2A.getSelectedRecipe; getEffectiveHook = P2A.getEffectiveHook;
    renderTagInput = P2A.renderTagInput;

    // Register view renderers
    var R = window._cpRenderers = window._cpRenderers || {};
    R.researchView = renderResearchView;
    R.setupResearchEvents = setupResearchEvents;
    R.settingsView = renderSettingsView;
    R.setupSettingsEvents = setupSettingsEvents;
    R.imagesView = renderImagesView;
    R.setupImagesEvents = setupImagesEvents;
    R.imagePicker = renderImagePicker;
    R.aiResearchPanel = renderAIResearchPanelBody;
    // Setup Wizard AI generators
    R.swAIGeneratePersonas      = swAIGeneratePersonas;
    R.swAIGeneratePainPoints    = swAIGeneratePainPoints;
    R.swAIGenerateMessages      = swAIGenerateMessages;
    R.swAIGenerateStylesFormats = swAIGenerateStylesFormats;
    // Setup Wizard finalize
    R.finalizeSetupWizard       = finalizeSetupWizard;

    setupPart2BEvents(); setupKeyboardShortcuts();
    LLMService.init();
    try { BrandService.init(); BrandService.autoPopulateBrandDesign(); } catch(e) { console.error('[CP] BrandService init error:', e); }

    // Replace AI picker loading placeholders (uses Part 2A helper if available).
    if (typeof window._cpReplaceAiPickers === 'function') {
      window._cpReplaceAiPickers();
    } else {
      $('.cp-ai-picker-loading').each(function() {
        var actionId = $(this).data('pending-action');
        if (actionId) $(this).replaceWith(LLMService.renderInlinePicker(actionId));
      });
    }

    updateAIStatusIndicator();
    S._part2bTimeout = false;

    if (render) render();
    console.log('[CP] Part 2B initialized — renderers: research, settings, images');
    } catch(e) {
      console.error('[CP] Part 2B init FAILED:', e.message, e.stack);
      if (window._cpToast) window._cpToast('Part 2B init error: ' + e.message, 'error');
    }
  }

