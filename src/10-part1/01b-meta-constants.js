  // ============================================================
  // SECTION 1B: META CONSTANTS (Campaign → Ad Set → Ad)
  // ============================================================
  //
  // Storage uses Meta API enum values (e.g. OUTCOME_LEADS). UI surfaces
  // friendly labels via the `label` property. Keep values stable: they are
  // the same strings Meta's Marketing API and bulk-upload CSV expect.

  // --- Campaign-level constants ---

  var META_OBJECTIVES = {
    'OUTCOME_AWARENESS':     { key: 'OUTCOME_AWARENESS',     label: 'Awareness',     icon: 'eye',           color: '#9334e9', description: 'Show ads to people most likely to remember them' },
    'OUTCOME_TRAFFIC':       { key: 'OUTCOME_TRAFFIC',       label: 'Traffic',       icon: 'arrow-pointer', color: '#1a73e8', description: 'Send people to a destination (website, app, Messenger, WhatsApp)' },
    'OUTCOME_ENGAGEMENT':    { key: 'OUTCOME_ENGAGEMENT',    label: 'Engagement',    icon: 'heart',         color: '#e37400', description: 'Get more messages, video views, post engagement, page likes, or event responses' },
    'OUTCOME_LEADS':         { key: 'OUTCOME_LEADS',         label: 'Leads',         icon: 'user-plus',     color: '#0d904f', description: 'Collect leads for your business via forms, calls, sign-ups, or messages' },
    'OUTCOME_APP_PROMOTION': { key: 'OUTCOME_APP_PROMOTION', label: 'App promotion', icon: 'mobile',        color: '#0891b2', description: 'Find new users for your app, or get existing users to take actions' },
    'OUTCOME_SALES':         { key: 'OUTCOME_SALES',         label: 'Sales',         icon: 'cart-shopping', color: '#be123c', description: 'Find people likely to purchase your product or service' }
  };

  var META_BUYING_TYPES = {
    'AUCTION':  { key: 'AUCTION',  label: 'Auction',                description: 'Standard ad auction. Best for most advertisers.' },
    'RESERVED': { key: 'RESERVED', label: 'Reach and Frequency',    description: 'Predictable reach and frequency at a fixed CPM. Requires Meta approval.' }
  };

  var META_BUDGET_MODES = {
    'CBO': { key: 'CBO', label: 'Advantage Campaign Budget',  short: 'CBO', description: 'Meta distributes your budget across Ad Sets to get the best results' },
    'ABO': { key: 'ABO', label: 'Ad Set Budget',              short: 'ABO', description: 'Set a separate budget for each Ad Set' }
  };

  var META_BID_STRATEGIES = {
    'LOWEST_COST_WITHOUT_CAP':   { key: 'LOWEST_COST_WITHOUT_CAP',   label: 'Highest volume',   description: 'Get the most results for your budget (default)' },
    'LOWEST_COST_WITH_BID_CAP':  { key: 'LOWEST_COST_WITH_BID_CAP',  label: 'Bid cap',          description: 'Cap the maximum bid per auction' },
    'COST_CAP':                  { key: 'COST_CAP',                  label: 'Cost per result',  description: 'Average cost per result close to your target' },
    'LOWEST_COST_WITH_MIN_ROAS': { key: 'LOWEST_COST_WITH_MIN_ROAS', label: 'ROAS goal',        description: 'Maintain a minimum return on ad spend' }
  };

  var META_SPECIAL_AD_CATEGORIES = {
    'NONE':                      { key: 'NONE',                      label: 'None',                          description: 'No special category applies' },
    'CREDIT':                    { key: 'CREDIT',                    label: 'Credit',                        description: 'Credit cards, loans, long-term financing' },
    'EMPLOYMENT':                { key: 'EMPLOYMENT',                label: 'Employment',                    description: 'Job listings, internships, work programs' },
    'HOUSING':                   { key: 'HOUSING',                   label: 'Housing',                       description: 'Sales/rentals of homes, mortgages, insurance' },
    'ISSUES_ELECTIONS_POLITICS': { key: 'ISSUES_ELECTIONS_POLITICS', label: 'Social, elections or politics', description: 'Political ads or ads about social issues' }
  };

  // Meta-shaped campaign statuses (replaces v1's planning/active/paused/completed/archived)
  var META_CAMPAIGN_STATUSES = {
    'DRAFT':    { key: 'DRAFT',    label: 'Draft',    icon: 'pencil',         color: '#80868b', order: 0 },
    'ACTIVE':   { key: 'ACTIVE',   label: 'Active',   icon: 'bolt',           color: '#0d904f', order: 1 },
    'PAUSED':   { key: 'PAUSED',   label: 'Paused',   icon: 'pause',          color: '#be123c', order: 2 },
    'ARCHIVED': { key: 'ARCHIVED', label: 'Archived', icon: 'box-archive',    color: '#80868b', order: 3 },
    'DELETED':  { key: 'DELETED',  label: 'Deleted',  icon: 'trash',          color: '#d93025', order: 4 }
  };

  // --- Ad Set-level constants ---

  // Optimization goals — superset across all objectives. The UI filters by
  // parent objective via META_OBJECTIVE_OPTIMIZATION_GOALS below.
  var META_OPTIMIZATION_GOALS = {
    'REACH':              { key: 'REACH',              label: 'Reach',                  description: 'Show ads to the maximum number of people' },
    'IMPRESSIONS':        { key: 'IMPRESSIONS',        label: 'Impressions',            description: 'Show ads as many times as possible' },
    'AD_RECALL_LIFT':     { key: 'AD_RECALL_LIFT',     label: 'Ad recall lift',         description: 'Maximise people likely to remember your ad' },
    'LINK_CLICKS':        { key: 'LINK_CLICKS',        label: 'Link clicks',            description: 'Drive clicks to your destination' },
    'LANDING_PAGE_VIEWS': { key: 'LANDING_PAGE_VIEWS', label: 'Landing page views',     description: 'People who click and load your landing page' },
    'POST_ENGAGEMENT':    { key: 'POST_ENGAGEMENT',    label: 'Post engagement',        description: 'Reactions, comments, shares, saves' },
    'PAGE_LIKES':         { key: 'PAGE_LIKES',         label: 'Page likes',             description: 'Grow your Page audience' },
    'EVENT_RESPONSES':    { key: 'EVENT_RESPONSES',    label: 'Event responses',        description: 'Maximise RSVPs to an event' },
    'THRUPLAY':           { key: 'THRUPLAY',           label: 'ThruPlay',               description: 'Video views to completion (or 15s, whichever first)' },
    'VIDEO_VIEWS':        { key: 'VIDEO_VIEWS',        label: 'Video views (2s)',       description: 'At least 2 seconds of continuous viewing' },
    'LEAD_GENERATION':    { key: 'LEAD_GENERATION',    label: 'Leads',                  description: 'Submitted Meta lead forms' },
    'QUALITY_LEAD':       { key: 'QUALITY_LEAD',       label: 'Conversion leads',       description: 'Optimise for leads that convert downstream (CRM integration required)' },
    'QUALITY_CALL':       { key: 'QUALITY_CALL',       label: 'Quality calls',          description: 'Call-tracked leads that meet a quality threshold' },
    'OFFSITE_CONVERSIONS':{ key: 'OFFSITE_CONVERSIONS',label: 'Conversions',            description: 'Pixel/CAPI events on your site or app' },
    'CONVERSATIONS':      { key: 'CONVERSATIONS',      label: 'Conversations',          description: 'Messenger / WhatsApp / Instagram message threads' },
    'MESSAGING_PURCHASE_CONVERSION': { key: 'MESSAGING_PURCHASE_CONVERSION', label: 'Purchases in messaging', description: 'Purchases that complete inside a message thread' },
    'APP_INSTALLS':       { key: 'APP_INSTALLS',       label: 'App installs',           description: 'Drive new installs of your app' },
    'APP_INSTALLS_AND_OFFSITE_CONVERSIONS': { key: 'APP_INSTALLS_AND_OFFSITE_CONVERSIONS', label: 'App installs + events', description: 'Optimise for installs + a chosen in-app event' },
    'VALUE':              { key: 'VALUE',              label: 'Value',                  description: 'Maximise total purchase value (requires value optimisation setup)' }
  };

  // Which optimization goals are allowed under each objective (UI guidance)
  var META_OBJECTIVE_OPTIMIZATION_GOALS = {
    'OUTCOME_AWARENESS':     ['REACH', 'IMPRESSIONS', 'AD_RECALL_LIFT', 'THRUPLAY', 'VIDEO_VIEWS'],
    'OUTCOME_TRAFFIC':       ['LINK_CLICKS', 'LANDING_PAGE_VIEWS', 'REACH', 'IMPRESSIONS', 'CONVERSATIONS'],
    'OUTCOME_ENGAGEMENT':    ['POST_ENGAGEMENT', 'PAGE_LIKES', 'EVENT_RESPONSES', 'THRUPLAY', 'VIDEO_VIEWS', 'CONVERSATIONS', 'REACH', 'IMPRESSIONS'],
    'OUTCOME_LEADS':         ['LEAD_GENERATION', 'QUALITY_LEAD', 'OFFSITE_CONVERSIONS', 'CONVERSATIONS', 'QUALITY_CALL'],
    'OUTCOME_APP_PROMOTION': ['APP_INSTALLS', 'APP_INSTALLS_AND_OFFSITE_CONVERSIONS', 'OFFSITE_CONVERSIONS'],
    'OUTCOME_SALES':         ['OFFSITE_CONVERSIONS', 'VALUE', 'CONVERSATIONS', 'LANDING_PAGE_VIEWS', 'LINK_CLICKS']
  };

  var META_BILLING_EVENTS = {
    'IMPRESSIONS':  { key: 'IMPRESSIONS',  label: 'Impressions',   description: 'Billed when your ad is shown' },
    'LINK_CLICKS':  { key: 'LINK_CLICKS',  label: 'Link clicks',   description: 'Billed for clicks on your destination link' },
    'THRUPLAY':     { key: 'THRUPLAY',     label: 'ThruPlay',      description: 'Billed for video completes (or 15s)' },
    'APP_INSTALLS': { key: 'APP_INSTALLS', label: 'App installs',  description: 'Billed for tracked app installs' }
  };

  var META_ATTRIBUTION_SETTINGS = {
    '1d_view':         { key: '1d_view',         label: '1-day view',                  short: '1V' },
    '1d_click':        { key: '1d_click',        label: '1-day click',                 short: '1C' },
    '7d_click':        { key: '7d_click',        label: '7-day click',                 short: '7C' },
    '1d_view_1d_click':{ key: '1d_view_1d_click',label: '1-day view + 1-day click',    short: '1V/1C' },
    '1d_view_7d_click':{ key: '1d_view_7d_click',label: '1-day view + 7-day click',    short: '1V/7C' }
  };

  // Curated placement list. Each entry maps to Meta's `publisher_platform` +
  // `facebook_positions` / `instagram_positions` / etc. on export.
  var META_PLACEMENTS = {
    'FACEBOOK_FEED':          { key: 'FACEBOOK_FEED',          label: 'Facebook Feed',           platform: 'facebook',  position: 'feed' },
    'FACEBOOK_MARKETPLACE':   { key: 'FACEBOOK_MARKETPLACE',   label: 'Facebook Marketplace',    platform: 'facebook',  position: 'marketplace' },
    'FACEBOOK_VIDEO_FEEDS':   { key: 'FACEBOOK_VIDEO_FEEDS',   label: 'Facebook Video Feeds',    platform: 'facebook',  position: 'video_feeds' },
    'FACEBOOK_RIGHT_COLUMN':  { key: 'FACEBOOK_RIGHT_COLUMN',  label: 'Facebook Right Column',   platform: 'facebook',  position: 'right_hand_column' },
    'FACEBOOK_STORIES':       { key: 'FACEBOOK_STORIES',       label: 'Facebook Stories',        platform: 'facebook',  position: 'story' },
    'FACEBOOK_REELS':         { key: 'FACEBOOK_REELS',         label: 'Facebook Reels',          platform: 'facebook',  position: 'facebook_reels' },
    'FACEBOOK_SEARCH':        { key: 'FACEBOOK_SEARCH',        label: 'Facebook Search',         platform: 'facebook',  position: 'search' },
    'INSTAGRAM_FEED':         { key: 'INSTAGRAM_FEED',         label: 'Instagram Feed',          platform: 'instagram', position: 'stream' },
    'INSTAGRAM_STORIES':      { key: 'INSTAGRAM_STORIES',      label: 'Instagram Stories',       platform: 'instagram', position: 'story' },
    'INSTAGRAM_EXPLORE':      { key: 'INSTAGRAM_EXPLORE',      label: 'Instagram Explore',       platform: 'instagram', position: 'explore' },
    'INSTAGRAM_REELS':        { key: 'INSTAGRAM_REELS',        label: 'Instagram Reels',         platform: 'instagram', position: 'reels' },
    'INSTAGRAM_SEARCH':       { key: 'INSTAGRAM_SEARCH',       label: 'Instagram Search',        platform: 'instagram', position: 'ig_search' },
    'INSTAGRAM_PROFILE_FEED': { key: 'INSTAGRAM_PROFILE_FEED', label: 'Instagram Profile Feed',  platform: 'instagram', position: 'profile_feed' },
    'MESSENGER_INBOX':        { key: 'MESSENGER_INBOX',        label: 'Messenger Inbox',         platform: 'messenger', position: 'messenger_home' },
    'MESSENGER_STORIES':      { key: 'MESSENGER_STORIES',      label: 'Messenger Stories',       platform: 'messenger', position: 'story' },
    'AUDIENCE_NETWORK':       { key: 'AUDIENCE_NETWORK',       label: 'Audience Network',        platform: 'audience_network', position: 'classic' },
    'AUDIENCE_NETWORK_REWARDED_VIDEO': { key: 'AUDIENCE_NETWORK_REWARDED_VIDEO', label: 'Audience Network Rewarded Video', platform: 'audience_network', position: 'rewarded_video' }
  };

  var META_AD_SET_STATUSES = {
    'DRAFT':    { key: 'DRAFT',    label: 'Draft',    icon: 'pencil',      color: '#80868b', order: 0 },
    'ACTIVE':   { key: 'ACTIVE',   label: 'Active',   icon: 'bolt',        color: '#0d904f', order: 1 },
    'PAUSED':   { key: 'PAUSED',   label: 'Paused',   icon: 'pause',       color: '#be123c', order: 2 },
    'ARCHIVED': { key: 'ARCHIVED', label: 'Archived', icon: 'box-archive', color: '#80868b', order: 3 },
    'DELETED':  { key: 'DELETED',  label: 'Deleted',  icon: 'trash',       color: '#d93025', order: 4 }
  };

  // --- Ad-level constants ---

  var META_AD_CREATIVE_TYPES = {
    'single_image': { key: 'single_image', label: 'Single Image', icon: 'image',        color: '#1a73e8' },
    'single_video': { key: 'single_video', label: 'Single Video', icon: 'video',        color: '#d93025' },
    'carousel':     { key: 'carousel',     label: 'Carousel',     icon: 'images',       color: '#7c3aed' }
  };

  var META_CTA_TYPES = {
    'NO_BUTTON':      { key: 'NO_BUTTON',      label: 'No button' },
    'LEARN_MORE':     { key: 'LEARN_MORE',     label: 'Learn More' },
    'SHOP_NOW':       { key: 'SHOP_NOW',       label: 'Shop Now' },
    'SIGN_UP':        { key: 'SIGN_UP',        label: 'Sign Up' },
    'SUBSCRIBE':      { key: 'SUBSCRIBE',      label: 'Subscribe' },
    'GET_OFFER':      { key: 'GET_OFFER',      label: 'Get Offer' },
    'DOWNLOAD':       { key: 'DOWNLOAD',       label: 'Download' },
    'BOOK_TRAVEL':    { key: 'BOOK_TRAVEL',    label: 'Book Now' },
    'CONTACT_US':     { key: 'CONTACT_US',     label: 'Contact Us' },
    'APPLY_NOW':      { key: 'APPLY_NOW',      label: 'Apply Now' },
    'GET_QUOTE':      { key: 'GET_QUOTE',      label: 'Get Quote' },
    'MESSAGE_PAGE':   { key: 'MESSAGE_PAGE',   label: 'Send Message' },
    'INSTALL_MOBILE_APP': { key: 'INSTALL_MOBILE_APP', label: 'Install Now' },
    'USE_APP':        { key: 'USE_APP',        label: 'Use App' },
    'WATCH_MORE':     { key: 'WATCH_MORE',     label: 'Watch More' },
    'SEE_MENU':       { key: 'SEE_MENU',       label: 'See Menu' },
    'DONATE_NOW':     { key: 'DONATE_NOW',     label: 'Donate' },
    'GET_DIRECTIONS': { key: 'GET_DIRECTIONS', label: 'Get Directions' },
    'CALL_NOW':       { key: 'CALL_NOW',       label: 'Call Now' },
    'WHATSAPP_MESSAGE':{ key: 'WHATSAPP_MESSAGE', label: 'Send WhatsApp message' },
    'PLAY_GAME':      { key: 'PLAY_GAME',      label: 'Play Game' }
  };

  // Ad-level creative pipeline (Hook → Copy → Media → Review). Composition is
  // dropped here because it now lives at the Ad Set (brief tab).
  var META_AD_PIPELINE_STEPS = [
    { key: 'hook',   label: 'Hook',   icon: 'anchor',    order: 0 },
    { key: 'copy',   label: 'Copy',   icon: 'pen-fancy', order: 1 },
    { key: 'media',  label: 'Media',  icon: 'wand-magic',order: 2 },
    { key: 'review', label: 'Review', icon: 'eye',       order: 3 }
  ];

  // Ad pipeline statuses — distinct from Meta's delivery statuses so the
  // creative team can track production progress before the ad goes live.
  var META_AD_STATUSES = {
    'hook_ready':    { key: 'hook_ready',    label: 'Hook Ready',    icon: 'anchor',           color: '#9334e9', order: 0 },
    'copy_ready':    { key: 'copy_ready',    label: 'Copy Ready',    icon: 'pen-fancy',        color: '#1a73e8', order: 1 },
    'media_ready':   { key: 'media_ready',   label: 'Media Ready',   icon: 'wand-magic',       color: '#7c3aed', order: 2 },
    'in_review':     { key: 'in_review',     label: 'In Review',     icon: 'magnifying-glass', color: '#e37400', order: 3 },
    'approved':      { key: 'approved',      label: 'Approved',      icon: 'circle-check',     color: '#0d904f', order: 4 },
    'live':          { key: 'live',          label: 'Live',          icon: 'signal',           color: '#0891b2', order: 5 },
    'paused':        { key: 'paused',        label: 'Paused',        icon: 'pause',            color: '#be123c', order: 6 },
    'archived':      { key: 'archived',      label: 'Archived',      icon: 'box-archive',      color: '#bdc1c6', order: 7 }
  };

  var META_AD_STATUS_ORDER = ['hook_ready', 'copy_ready', 'media_ready', 'in_review', 'approved', 'live', 'paused', 'archived'];
  var META_AD_ACTIVE_STATUSES = ['hook_ready', 'copy_ready', 'media_ready', 'in_review', 'approved', 'live'];

  // --- A/B test constants ---

  var META_AB_ROLES = {
    'CONTROL':   { key: 'CONTROL',   label: 'Control',   color: '#1a73e8' },
    'VARIANT_A': { key: 'VARIANT_A', label: 'Variant A', color: '#e37400' },
    'VARIANT_B': { key: 'VARIANT_B', label: 'Variant B', color: '#9334e9' }
  };

  var META_AB_METRICS = {
    'COST_PER_RESULT':     { key: 'COST_PER_RESULT',     label: 'Cost per result' },
    'COST_PER_LEAD':       { key: 'COST_PER_LEAD',       label: 'Cost per lead' },
    'COST_PER_CONVERSION': { key: 'COST_PER_CONVERSION', label: 'Cost per conversion' },
    'COST_PER_LINK_CLICK': { key: 'COST_PER_LINK_CLICK', label: 'Cost per link click' },
    'CTR':                 { key: 'CTR',                 label: 'Click-through rate' },
    'ROAS':                { key: 'ROAS',                label: 'Return on ad spend' },
    'CPM':                 { key: 'CPM',                 label: 'Cost per 1,000 impressions' }
  };

  // --- Misc ---

  // Default placement set: Advantage Placements (let Meta optimise across all)
  var META_DEFAULT_PLACEMENT_MODE = 'advantage';

  // Default new-Campaign skeleton — used by createEntity('campaign_v2')
  var META_CAMPAIGN_DEFAULTS = {
    objective: 'OUTCOME_LEADS',
    buying_type: 'AUCTION',
    budget_mode: 'CBO',
    bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
    special_ad_categories: ['NONE'],
    status: 'DRAFT'
  };

  var META_AD_SET_DEFAULTS = {
    optimization_goal: 'OFFSITE_CONVERSIONS',
    billing_event: 'IMPRESSIONS',
    attribution_setting: '7d_click',
    placements: { advantage_enabled: true, custom_placements: [] },
    status: 'DRAFT'
  };

  var META_AD_DEFAULTS = {
    creative_type: 'single_image',
    pipeline_status: 'hook_ready'
  };

  // --- Helper: lookup with fallback ---

  function metaObjective(key)        { return META_OBJECTIVES[key] || null; }
  function metaOptimizationGoal(key) { return META_OPTIMIZATION_GOALS[key] || null; }
  function metaBillingEvent(key)     { return META_BILLING_EVENTS[key] || null; }
  function metaPlacement(key)        { return META_PLACEMENTS[key] || null; }
  function metaCTA(key)              { return META_CTA_TYPES[key] || null; }
  function metaCampaignStatus(key)   { return META_CAMPAIGN_STATUSES[key] || { label: key, color: '#80868b', icon: 'circle' }; }
  function metaAdSetStatus(key)      { return META_AD_SET_STATUSES[key] || { label: key, color: '#80868b', icon: 'circle' }; }
  function metaAdStatus(key)         { return META_AD_STATUSES[key] || { label: key, color: '#80868b', icon: 'circle' }; }

  // Get allowed optimization goals for a given objective
  function metaOptimizationGoalsForObjective(objectiveKey) {
    var allowed = META_OBJECTIVE_OPTIMIZATION_GOALS[objectiveKey] || [];
    return allowed.map(function(k) { return META_OPTIMIZATION_GOALS[k]; }).filter(Boolean);
  }

  // Constants namespace alias for code inside Part 1 that does
  // `var C = Constants;` / `Constants.META_*`. Part 2A imports the same
  // shape from window._cpConstants, so use that as a single source of
  // truth and mirror it here for Part 1 callers (e.g. inspector tab
  // renderers in 17c-view-workspace-tabs.js). Declared after every
  // META_* constant so the literal references resolve at parse time.
  var Constants = {
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
    META_AD_DEFAULTS: META_AD_DEFAULTS,
    // Non-Meta constants used by some renderers
    FUNNEL_DEFAULTS: FUNNEL_DEFAULTS,
    FORMAT_CATEGORIES: FORMAT_CATEGORIES,
    PAIN_POINT_CATEGORIES: PAIN_POINT_CATEGORIES,
    DIMENSIONS: DIMENSIONS,
    MEDIA_TYPES: MEDIA_TYPES,
    HOOK_TYPES: HOOK_TYPES,
    PRIORITY_LEVELS: PRIORITY_LEVELS,
    PRODUCTION_STATUSES: PRODUCTION_STATUSES
  };

