  // ============================================================
  // SECTION 1: INIT & IMPORTS
  // ============================================================

  var S, render, navigate, toast, generateId, buildMaps, syncToTextarea;
  var updateSaveStatus, esc, deepClone, icon, formatDate, formatRelativeTime;
  var truncate, formatNumber, stripHtml, countWords, countChars;
  var badge, recipeStatusBadge, campaignStatusBadge, priorityBadge;
  var funnelBadge, dimensionBadge, mediaTypeBadge, hookTypeBadge, progressBar;
  var logActivity, maybeAdvanceRecipeStatus;
  var createEntity, deleteEntity, saveEntityField, duplicateEntity;
  var getAllPersonas, getAllMessages, getAllStyles, getAllFormats;
  var getAllCategories, getAllPainPoints, getAllCampaigns, getAllTags;
  var getPersonaPainPoints, getPersona, getMessage, getStyle, getFormat;
  var getCategory, getCampaign, getTag, getPainPoint, getFunnelStage;
  var getFilteredRecipes, getRecipe;
  var getRecipeProduction, getProductionStatusStyle, parseProductionData;
  var Constants;
  // Meta v2 imports
  var getCampaignV2, getAdSet, getAd;
  var getAllCampaignsV2, getAllAdSets, getAllAds;
  var getAdSetsByCampaign, getAdsByAdSet, getAdsByCampaign;
  var isMetaV2Enabled;
  var metaObjective, metaOptimizationGoal, metaBillingEvent, metaPlacement;
  var metaCTA, metaCampaignStatus, metaAdSetStatus, metaAdStatus;
  var metaOptimizationGoalsForObjective;

  console.log('[CP] Part 2A script loaded');

  var _checkCount = 0;
  var checkInterval = setInterval(function() {
    _checkCount++;
    if (window._cpState && window._cpState.initialized) {
      clearInterval(checkInterval);
      console.log('[CP] Part 2A: Part 1 ready after ' + (_checkCount * 100) + 'ms — calling initPart2A()');
      try { initPart2A(); } catch(e) { console.error('[CP] Part 2A init CRASHED:', e.message, e.stack); }
    }
    else if (_checkCount > 100) {
      clearInterval(checkInterval);
      console.error('[CP] Part 2A: Timed out. _cpState=' + !!window._cpState + ', initialized=' + !!(window._cpState && window._cpState.initialized));
    }
    else if (_checkCount === 20) {
      console.log('[CP] Part 2A: Still waiting (2s). _cpState=' + !!window._cpState + ', initialized=' + !!(window._cpState && window._cpState.initialized));
    }
  }, 100);

  function initPart2A() {
    console.log('[CP] Initializing Part 2A...');

    // Import Part 1 exports
    S = window._cpState;
    render = window._cpRender; navigate = window._cpNavigate; toast = window._cpToast;
    generateId = window._cpGenerateId; buildMaps = window._cpBuildMaps;
    syncToTextarea = window._cpSyncToTextarea; updateSaveStatus = window._cpUpdateSaveStatus;
    esc = window._cpEsc; deepClone = window._cpDeepClone; icon = window._cpIcon;
    formatDate = window._cpFormatDate; formatRelativeTime = window._cpFormatRelativeTime;
    truncate = window._cpTruncate; formatNumber = window._cpFormatNumber;
    stripHtml = window._cpStripHtml; countWords = window._cpCountWords; countChars = window._cpCountChars;
    badge = window._cpBadge;
    recipeStatusBadge = window._cpRecipeStatusBadge; campaignStatusBadge = window._cpCampaignStatusBadge;
    priorityBadge = window._cpPriorityBadge; funnelBadge = window._cpFunnelBadge;
    dimensionBadge = window._cpDimensionBadge; mediaTypeBadge = window._cpMediaTypeBadge;
    hookTypeBadge = window._cpHookTypeBadge;
    progressBar = window._cpProgressBar;
    logActivity = window._cpLogActivity; maybeAdvanceRecipeStatus = window._cpMaybeAdvanceRecipeStatus;
    createEntity = window._cpCreateEntity; deleteEntity = window._cpDeleteEntity;
    saveEntityField = window._cpSaveEntityField; duplicateEntity = window._cpDuplicateEntity;
    getAllPersonas = window._cpGetAllPersonas; getAllMessages = window._cpGetAllMessages;
    getAllStyles = window._cpGetAllStyles; getAllFormats = window._cpGetAllFormats;
    getAllCategories = window._cpGetAllCategories; getAllPainPoints = window._cpGetAllPainPoints;
    getAllCampaigns = window._cpGetAllCampaigns; getAllTags = window._cpGetAllTags;
    getPersonaPainPoints = window._cpGetPersonaPainPoints;
    getPersona = window._cpGetPersona; getMessage = window._cpGetMessage;
    getStyle = window._cpGetStyle; getFormat = window._cpGetFormat;
    getCategory = window._cpGetCategory; getCampaign = window._cpGetCampaign;
    getTag = window._cpGetTag; getPainPoint = window._cpGetPainPoint;
    getFunnelStage = window._cpGetFunnelStage;
    getFilteredRecipes = window._cpGetFilteredRecipes; getRecipe = window._cpGetRecipe;
    getRecipeProduction = window._cpGetRecipeProduction;
    getProductionStatusStyle = window._cpGetProductionStatusStyle;
    parseProductionData = window._cpParseProductionData;
    Constants = window._cpConstants;
    // Meta v2 helpers
    getCampaignV2 = window._cpGetCampaignV2; getAdSet = window._cpGetAdSet; getAd = window._cpGetAd;
    getAllCampaignsV2 = window._cpGetAllCampaignsV2; getAllAdSets = window._cpGetAllAdSets; getAllAds = window._cpGetAllAds;
    getAdSetsByCampaign = window._cpGetAdSetsByCampaign; getAdsByAdSet = window._cpGetAdsByAdSet; getAdsByCampaign = window._cpGetAdsByCampaign;
    isMetaV2Enabled = window._cpIsMetaV2Enabled;
    metaObjective = window._cpMetaObjective; metaOptimizationGoal = window._cpMetaOptimizationGoal;
    metaBillingEvent = window._cpMetaBillingEvent; metaPlacement = window._cpMetaPlacement;
    metaCTA = window._cpMetaCTA; metaCampaignStatus = window._cpMetaCampaignStatus;
    metaAdSetStatus = window._cpMetaAdSetStatus; metaAdStatus = window._cpMetaAdStatus;
    metaOptimizationGoalsForObjective = window._cpMetaOptimizationGoalsForObjective;

    // AI picker helper — lazy evaluation (Part 2B may not be loaded yet)
    window._cpAiSel = function(actionId) {
      if (window._cpPart2B && window._cpPart2B.renderInlinePicker) {
        return window._cpPart2B.renderInlinePicker(actionId);
      }
      // Show loading placeholder; will be replaced once Part 2B loads.
      if (S && S._part2bTimeout) {
        return '<span class="cp-ai-picker-loading" data-pending-action="' + esc(actionId) + '" title="AI module failed to load">' + icon('warning') + ' AI unavailable</span>';
      }
      return '<span class="cp-ai-picker-loading" data-pending-action="' + esc(actionId) + '">' + icon('spinner') + ' Loading…</span>';
    };

    // Replace any AI picker placeholders in the DOM with rendered pickers.
    // Called after every render so newly rendered views get live pickers.
    window._cpReplaceAiPickers = function() {
      if (!window._cpPart2B || !window._cpPart2B.renderInlinePicker) return;
      $('.cp-ai-picker-loading').each(function() {
        var actionId = $(this).data('pending-action');
        if (!actionId) return;
        try { $(this).replaceWith(window._cpPart2B.renderInlinePicker(actionId)); }
        catch (e) { console.warn('[CP] AI picker placeholder replace failed:', e); }
      });
    };

    // Register step renderers
    var R = window._cpRenderers = window._cpRenderers || {};
    R.step_composition = renderCompositionStep;
    R.step_hook = renderHookStep;
    R.step_content = renderContentStep;
    R.step_media = renderMediaStep;
    R.step_review = renderReviewStep;
    R.tagInput = renderTagInput;

    setupPart2AEvents();
    try { snapshot('Initial state'); } catch(snapErr) { console.warn('[CP] Part 2A: snapshot failed (non-fatal):', snapErr.message); }
    if (render) render();
    console.log('[CP] Part 2A initialized — ' + Object.keys(window._cpPart2A || {}).length + ' exports');
  }

