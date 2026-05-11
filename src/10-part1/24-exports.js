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
