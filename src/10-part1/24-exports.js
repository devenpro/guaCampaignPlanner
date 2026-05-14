  // ============================================================
  // SECTION 23: API EXPORTS
  // ============================================================

  window._cpState = S;

  // Core
  window._cpRender = renderCurrentView;
  window._cpRenderAppShell = renderAppShell;
  window._cpNavigate = navigate;
  window._cpNavigateToCampaignV2 = navigateToCampaignV2;
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
  window._cpGetTag = getTag;
  window._cpGetFunnelStage = getFunnelStage;
  window._cpGetResearchSession = getResearchSession;
  window._cpGetProductionStatusStyle = getProductionStatusStyle;
  window._cpParseProductionData = parseProductionData;

  // Meta v2 entity getters
  window._cpGetCampaignV2 = getCampaignV2;
  window._cpGetAdSet = getAdSet;
  window._cpGetAd = getAd;
  window._cpIsMetaV2Enabled = isMetaV2Enabled;

  // Collection getters
  window._cpGetAllTags = getAllTags;
  window._cpGetAllPersonas = getAllPersonas;
  window._cpGetAllMessages = getAllMessages;
  window._cpGetAllStyles = getAllStyles;
  window._cpGetAllFormats = getAllFormats;
  window._cpGetAllPainPoints = getAllPainPoints;
  window._cpGetAllCategories = getAllCategories;

  // Meta v2 collection getters
  window._cpGetAllCampaignsV2 = getAllCampaignsV2;
  window._cpGetAllAdSets = getAllAdSets;
  window._cpGetAllAds = getAllAds;
  window._cpGetAdSetsByCampaign = getAdSetsByCampaign;
  window._cpGetAdsByAdSet = getAdsByAdSet;
  window._cpGetAdsByCampaign = getAdsByCampaign;
  window._cpGetRecentActivity = getRecentActivity;
  window._cpGetPersonasByCategory = getPersonasByCategory;
  window._cpGetPersonaPainPoints = getPersonaPainPoints;
  window._cpIsSetupComplete = isSetupComplete;

  // Constants
  window._cpConstants = {
    APP_VIEWS: APP_VIEWS, SIDEBAR_GROUPS: SIDEBAR_GROUPS, DIMENSIONS: DIMENSIONS,
    FUNNEL_DEFAULTS: FUNNEL_DEFAULTS,
    MEDIA_TYPES: MEDIA_TYPES, HOOK_TYPES: HOOK_TYPES,
    PRIORITY_LEVELS: PRIORITY_LEVELS,
    FORMAT_CATEGORIES: FORMAT_CATEGORIES, PAIN_POINT_CATEGORIES: PAIN_POINT_CATEGORIES,
    ACTIVITY_TYPES: ACTIVITY_TYPES, CARD_DENSITIES: CARD_DENSITIES, GROUPING_OPTIONS: GROUPING_OPTIONS,
    PRODUCTION_STATUSES: PRODUCTION_STATUSES, PRODUCTION_STATUS_DEFAULT: PRODUCTION_STATUS_DEFAULT,
    PRODUCTION_TYPE_TO_MEDIA: PRODUCTION_TYPE_TO_MEDIA,
    // Meta v2 constants
    META_OBJECTIVES: META_OBJECTIVES,
    META_BUYING_TYPES: META_BUYING_TYPES,
    META_BUDGET_MODES: META_BUDGET_MODES,
    META_BID_STRATEGIES: META_BID_STRATEGIES,
    META_SPECIAL_AD_CATEGORIES: META_SPECIAL_AD_CATEGORIES,
    META_CAMPAIGN_STATUSES: META_CAMPAIGN_STATUSES,
    META_OPTIMIZATION_GOALS: META_OPTIMIZATION_GOALS,
    META_OBJECTIVE_OPTIMIZATION_GOALS: META_OBJECTIVE_OPTIMIZATION_GOALS,
    META_BILLING_EVENTS: META_BILLING_EVENTS,
    META_ATTRIBUTION_SETTINGS: META_ATTRIBUTION_SETTINGS,
    META_PLACEMENTS: META_PLACEMENTS,
    META_AD_SET_STATUSES: META_AD_SET_STATUSES,
    META_AD_CREATIVE_TYPES: META_AD_CREATIVE_TYPES,
    META_CTA_TYPES: META_CTA_TYPES,
    META_AD_PIPELINE_STEPS: META_AD_PIPELINE_STEPS,
    META_AD_STATUSES: META_AD_STATUSES,
    META_AD_STATUS_ORDER: META_AD_STATUS_ORDER,
    META_AD_ACTIVE_STATUSES: META_AD_ACTIVE_STATUSES,
    META_AB_ROLES: META_AB_ROLES,
    META_AB_METRICS: META_AB_METRICS,
    META_DEFAULT_PLACEMENT_MODE: META_DEFAULT_PLACEMENT_MODE,
    META_CAMPAIGN_DEFAULTS: META_CAMPAIGN_DEFAULTS,
    META_AD_SET_DEFAULTS: META_AD_SET_DEFAULTS,
    META_AD_DEFAULTS: META_AD_DEFAULTS
  };

  // Meta v2 lookup helpers
  window._cpMetaObjective = metaObjective;
  window._cpMetaOptimizationGoal = metaOptimizationGoal;
  window._cpMetaBillingEvent = metaBillingEvent;
  window._cpMetaPlacement = metaPlacement;
  window._cpMetaCTA = metaCTA;
  window._cpMetaCampaignStatus = metaCampaignStatus;
  window._cpMetaAdSetStatus = metaAdSetStatus;
  window._cpMetaAdStatus = metaAdStatus;
  window._cpMetaOptimizationGoalsForObjective = metaOptimizationGoalsForObjective;

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
  window._cpGetFilteredPersonas = getFilteredPersonas;
  window._cpGetFilteredMessages = getFilteredMessages;

  // CRUD
  window._cpCreateEntity = createEntity;
  window._cpDeleteEntity = deleteEntity;
  window._cpSaveEntityField = saveEntityField;
  window._cpDuplicateEntity = duplicateEntity;

  // Meta v2 snapshot + auto-status (Stage 2)
  window._cpIsPersonaSnapshotStale = isPersonaSnapshotStale;
  window._cpIsMessageSnapshotStale = isMessageSnapshotStale;
  window._cpEvaluateAdAutoStatus = evaluateAdAutoStatus;
  window._cpMaybeAdvanceAdStatus = maybeAdvanceAdStatus;

  // Library ↔ Workspace integration (Stage 3)
  window._cpFindAdSetsUsingPersona = findAdSetsUsingPersona;
  window._cpFindAdSetsUsingMessage = findAdSetsUsingMessage;
  window._cpFindAdSetsUsingStyle = findAdSetsUsingStyle;
  window._cpFindAdSetsUsingFormat = findAdSetsUsingFormat;
  window._cpFindAdsUsingMessage = findAdsUsingMessage;
  window._cpFindAdSetsUsingPainPoint = findAdSetsUsingPainPoint;
  window._cpRenderLibraryWorkspaceUsage = renderLibraryWorkspaceUsage;

  console.log('[CP] Part 1 loaded');
})(jQuery, Drupal);
