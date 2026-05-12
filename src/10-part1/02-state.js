  // ============================================================
  // SECTION 2: STATE OBJECT
  // ============================================================

  var S = {
    // Data (from JSON fields)
    data: { persona_categories: [], personas: [], pain_points: [], messages: [], styles: [], visual_formats: [], recipes: [], campaigns: [], tags: [], research_sessions: [], campaigns_v2: [], ad_sets: [], ads: [] },
    meta: { workspace: {}, setup: {}, settings: {}, aiPreferences: {}, meta_defaults: {}, legacy_backup: null },
    activity: [],
    user: { id: '', name: '', email: '', fullName: '', timezone: '', roles: '' },
    brand: { configured: false, identity: {}, core: null, video: null, content: null, seo: null, social: null },

    // Lookup maps (rebuilt by buildMaps)
    personaMap: {}, categoryMap: {}, painPointMap: {},
    messageMap: {}, styleMap: {}, formatMap: {},
    recipeMap: {}, campaignMap: {}, tagMap: {},
    funnelStageMap: {}, researchMap: {},

    // Meta v2 hierarchy maps
    campaignV2Map: {}, adSetMap: {}, adMap: {},
    adSetsByCampaign: {}, adsByAdSet: {},
    campaignV2StatusCounts: {}, adSetStatusCounts: {}, adStatusCounts: {},
    totalCampaignsV2: 0, activeCampaignsV2: 0,
    totalAdSets: 0, totalAds: 0, activeAds: 0,

    // Production node snapshot, keyed by `data-planner-id` (= recipe.id).
    // Rebuilt on every page load from the Drupal `view-media-productions`
    // block. Persistent copy lives in `recipe.production` (append-only).
    productionMap: {},

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
    recipeFilter: { search: '', statuses: [], campaign: '', persona: '', funnel: '', priority: '', type: '', tag: '', production: '', sortBy: 'updated', sortDir: 'desc' },
    collapsedGroups: {},

    // Persona search
    personaFilter: { search: '' },
    // Message filter
    messageFilter: { search: '', funnel: '', sortBy: 'updated' },
    // Campaign filter
    campaignFilter: { search: '', status: '' },
    selectedCampaignId: null,
    campaignDetailTab: 'overview',

    // Meta v2 UI state (Campaign Workspace)
    selectedCampaignV2Id: null,
    selectedAdSetId: null,
    selectedAdId: null,
    campaignV2Filter: { search: '', status: '', objective: '' },
    workspaceInspectorTab: 'overview',  // overview | brief | pipeline | settings
    workspaceTreeCollapsed: {},          // { 'cmpv2_xxx': true, 'adset_xxx': false }
    currentAdPipelineStep: 'hook',
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

