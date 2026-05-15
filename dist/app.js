/* Campaign Planner v1.0.7 · built 2026-05-15T06:19:06.099Z · 81 source files (see src/) */
window.CP_VERSION = "1.0.7";
window.CP_BUILD_TIME = "2026-05-15T06:19:06.099Z";

/* ===== src/10-part1/00-header.js ===== */
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


/* ===== src/10-part1/01-constants.js ===== */
  // ============================================================
  // SECTION 1: CONSTANTS
  // ============================================================

  var APP_VIEWS = {
    'dashboard':         { order: 1,  label: 'Dashboard',         icon: 'chart-pie',          group: 'main',    description: 'Overview & stats' },
    'personas':          { order: 2,  label: 'Personas',          icon: 'users',              group: 'library', description: 'Audience personas & pain points' },
    'messages':          { order: 4,  label: 'Messages',          icon: 'comments',           group: 'library', description: 'Message library' },
    'styles':            { order: 5,  label: 'Styles',            icon: 'palette',            group: 'library', description: 'Creative styles' },
    'formats':           { order: 6,  label: 'Formats',           icon: 'clapperboard',       group: 'library', description: 'Visual formats' },
    // Meta v2 — the only working surface.
    'meta_campaigns':    { order: 7,  label: 'Campaigns',         icon: 'bullhorn',           group: 'core',    description: 'Meta Campaigns' },
    'campaign_workspace':{ order: 8,  label: 'Campaign Workspace',icon: 'sitemap',            group: 'core',    description: 'Campaign → Ad Set → Ad',    hidden: true },
    'calendar':          { order: 9,  label: 'Calendar',          icon: 'calendar',           group: 'core',    description: 'Timeline view' },
    'research':          { order: 10, label: 'Research Lab',      icon: 'flask',              group: 'tools',   description: 'AI research hub' },
    'activity':          { order: 12, label: 'Activity',          icon: 'clock-rotate-left',  group: 'tools',   description: 'Activity log' },
    'settings':          { order: 13, label: 'Settings',          icon: 'gear',               group: 'tools',   description: 'Workspace config' }
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

  var FUNNEL_DEFAULTS = [
    { id: 'fs_top', name: 'Top of Funnel',    short: 'TOFU', color: '#1a73e8', order: 0, system: true },
    { id: 'fs_mid', name: 'Middle of Funnel',  short: 'MOFU', color: '#e37400', order: 1, system: true },
    { id: 'fs_bot', name: 'Bottom of Funnel',  short: 'BOFU', color: '#0d904f', order: 2, system: true }
  ];

  var MEDIA_TYPES = {
    'image':    { key: 'image',    label: 'Image',    icon: 'image',        color: '#1a73e8', node_type: 'image_production' },
    'carousel': { key: 'carousel', label: 'Carousel', icon: 'images',       color: '#7c3aed', node_type: 'carousel_production' },
    'video':    { key: 'video',    label: 'Video',    icon: 'video',        color: '#d93025', node_type: 'video_production' }
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

  // Status palette for production nodes returned by the Drupal media-productions view.
  // The view's `.mp-status` value is matched case-insensitively against these keys;
  // unknown values fall back to PRODUCTION_STATUS_DEFAULT (neutral gray).
  var PRODUCTION_STATUSES = {
    'draft':            { label: 'Draft',           color: '#80868b' },
    'pending':          { label: 'Pending',         color: '#80868b' },
    'queued':           { label: 'Queued',          color: '#80868b' },
    'in_progress':      { label: 'In Progress',     color: '#1a73e8' },
    'in-progress':      { label: 'In Progress',     color: '#1a73e8' },
    'working':          { label: 'Working',         color: '#1a73e8' },
    'review':           { label: 'In Review',       color: '#e37400' },
    'in_review':        { label: 'In Review',       color: '#e37400' },
    'pending_review':   { label: 'Pending Review',  color: '#e37400' },
    'approved':         { label: 'Approved',        color: '#0d904f' },
    'published':        { label: 'Published',       color: '#0d904f' },
    'live':             { label: 'Live',            color: '#0d904f' },
    'completed':        { label: 'Completed',       color: '#0d904f' },
    'rejected':         { label: 'Rejected',        color: '#d93025' },
    'cancelled':        { label: 'Cancelled',       color: '#d93025' },
    'canceled':         { label: 'Cancelled',       color: '#d93025' }
  };
  var PRODUCTION_STATUS_DEFAULT = { label: '', color: '#80868b' };

  // Map a production content type (image_production, carousel_production,
  // video_production) to the matching MEDIA_TYPES key.
  var PRODUCTION_TYPE_TO_MEDIA = {
    'image_production':    'image',
    'carousel_production': 'carousel',
    'video_production':    'video'
  };

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
    'setup_completed':           { icon: 'circle-check',   color: '#0d904f' },
    // --- Meta v2 hierarchy (Campaign → Ad Set → Ad) ---
    'campaign_v2_created':       { icon: 'bullhorn',       color: '#0891b2' },
    'campaign_v2_updated':       { icon: 'bullhorn',       color: '#0891b2' },
    'campaign_v2_deleted':       { icon: 'trash',          color: '#d93025' },
    'ad_set_created':            { icon: 'crosshairs',     color: '#9334e9' },
    'ad_set_updated':            { icon: 'crosshairs',     color: '#9334e9' },
    'ad_set_deleted':            { icon: 'trash',          color: '#d93025' },
    'ad_created':                { icon: 'rectangle-ad',   color: '#1a73e8' },
    'ad_updated':                { icon: 'rectangle-ad',   color: '#1a73e8' },
    'ad_deleted':                { icon: 'trash',          color: '#d93025' },
    'ad_status_changed':         { icon: 'refresh',        color: '#1a73e8' },
    'snapshot_resynced':         { icon: 'refresh',        color: '#0d904f' },
    'campaign_tree_generated':   { icon: 'sparkles',       color: '#7c3aed' },
    'legacy_migrated':           { icon: 'circle-check',   color: '#0d904f' },
    'meta_csv_exported':         { icon: 'download',       color: '#1a73e8' }
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


/* ===== src/10-part1/01b-meta-constants.js ===== */
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


/* ===== src/10-part1/02-state.js ===== */
  // ============================================================
  // SECTION 2: STATE OBJECT
  // ============================================================

  var S = {
    // Data (from JSON fields)
    data: { persona_categories: [], personas: [], pain_points: [], messages: [], styles: [], visual_formats: [], tags: [], research_sessions: [], campaigns_v2: [], ad_sets: [], ads: [] },
    meta: { workspace: {}, setup: {}, settings: {}, aiPreferences: {}, meta_defaults: {} },
    activity: [],
    user: { id: '', name: '', email: '', fullName: '', timezone: '', roles: '' },
    brand: { configured: false, identity: {}, core: null, video: null, content: null, seo: null, social: null },

    // Lookup maps (rebuilt by buildMaps)
    personaMap: {}, categoryMap: {}, painPointMap: {},
    messageMap: {}, styleMap: {}, formatMap: {},
    tagMap: {},
    funnelStageMap: {}, researchMap: {},

    // Meta v2 hierarchy maps
    campaignV2Map: {}, adSetMap: {}, adMap: {},
    adSetsByCampaign: {}, adsByAdSet: {},
    campaignV2StatusCounts: {}, adSetStatusCounts: {}, adStatusCounts: {},
    totalCampaignsV2: 0, activeCampaignsV2: 0,
    totalAdSets: 0, totalAds: 0, activeAds: 0,

    // Production node snapshot, keyed by `data-planner-id` (= ad.id).
    // Rebuilt on every page load from the Drupal `view-media-productions` block.
    productionMap: {},

    // Aggregated counts
    funnelCounts: {},
    categoryPersonaCounts: {},
    tagIndex: {},
    totalPersonas: 0, totalMessages: 0, totalStyles: 0, totalFormats: 0,

    // UI state
    currentView: 'dashboard', previousView: null,
    selectedPersonaId: null, selectedCategoryId: null,
    selectedMessageId: null,
    selectedTagId: null,
    personasTab: 'personas',  // 'personas' or 'pain_points'
    stylesTab: 'styles',      // 'styles' or 'formats'
    settingsTab: 'workspace',
    cardDensity: 'normal',
    sidebarMobileOpen: false,
    collapsedGroups: {},

    // Persona search
    personaFilter: { search: '' },
    // Message filter
    messageFilter: { search: '', funnel: '', sortBy: 'updated' },

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
    calendarFilters: { campaign: '', status: '' },
    calendarPopover: null,

    // Activity filter
    activityFilter: { search: '', type: '' },

    // AI Research panel state (per view)
    aiResearchOpen: { personas: false, pain_points: false, messages: false, styles: false, formats: false, campaign_research: false },

    // Drupal refs + flags
    $textarea: null, $metaTextarea: null, $activityTextarea: null, $form: null, $submitBtn: null,
    _initializing: false, initialized: false, _part2bTimeout: false,
    dirty: false, autoSaveTimer: null, lastSaved: null
  };


/* ===== src/10-part1/03-init.js ===== */
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


/* ===== src/10-part1/04-migration.js ===== */
  // ============================================================
  // SECTION 4: MIGRATION & DEFAULTS
  // ============================================================

  function getDefaultData() {
    return {
      persona_categories: [], personas: [], pain_points: [],
      messages: [], styles: [], visual_formats: [],
      recipes: [], campaigns: [], tags: [],
      research_sessions: [],
      // Meta v2 hierarchy. Empty until the user creates them through the
      // new Workspace, or until the migration importer runs.
      campaigns_v2: [], ad_sets: [], ads: []
    };
  }

  function getDefaultMetaDefaults() {
    return {
      page_id: '',
      instagram_actor_id: '',
      pixel_id: '',
      attribution_window: '7d_click',
      currency: 'USD',
      time_zone: 'UTC',
      business_manager_id: ''
    };
  }

  function getDefaultMeta() {
    return {
      workspace: { name: '', description: '', created: new Date().toISOString() },
      setup: {
        product_name: '', objective: '', custom_instructions: '', setup_complete: false,
        // Meta v2 is the only supported surface.
        meta_v2: true
      },
      settings: {
        timezone: 'Asia/Kolkata',
        default_view: 'dashboard',
        card_density: 'normal',
        funnel_stages: deepClone(FUNNEL_DEFAULTS),
        visual_format_categories: deepClone(FORMAT_CATEGORIES),
        pain_point_categories: deepClone(PAIN_POINT_CATEGORIES),
        defaults: { priority: 'medium', funnel_stage: 'fs_top' },
        brand_design: getDefaultBrandDesign()
      },
      aiPreferences: { appDefault: { provider: '', model: '' }, perAction: {}, lastProvider: '', lastModel: '' },
      // Meta v2 workspace-level defaults (Page, Pixel, attribution, currency etc.)
      meta_defaults: getDefaultMetaDefaults()
    };
  }

  function getDefaultBrandDesign() {
    return {
      colors: { primary: '', secondary: '', accent: '', background: '#ffffff', text: '#202124', palette_description: '' },
      typography: { heading_style: '', body_style: '', text_treatment: '' },
      visual_style: { overall_aesthetic: '', photography_style: '', illustration_style: '', icon_style: '', pattern_usage: '', mood: '' },
      layout_rules: { image_composition: '', ad_format_notes: '', border_radius: '', spacing: '' },
      brand_prompt_prefix: ''
    };
  }

  function migrateData() {
    var d = S.data;
    d.persona_categories = d.persona_categories || [];
    d.personas = d.personas || [];
    d.pain_points = d.pain_points || [];
    d.messages = d.messages || [];
    d.styles = d.styles || [];
    d.visual_formats = d.visual_formats || [];
    d.tags = d.tags || [];
    d.research_sessions = d.research_sessions || [];
    // Drop any legacy v1 collections silently — Meta v2 is the only path.
    delete d.recipes;
    delete d.campaigns;
    // Meta v2 hierarchy
    d.campaigns_v2 = d.campaigns_v2 || [];
    d.ad_sets = d.ad_sets || [];
    d.ads = d.ads || [];

    // Field-level fillers for Meta v2 entities (idempotent)
    migrateCampaignsV2(d.campaigns_v2);
    migrateAdSets(d.ad_sets);
    migrateAds(d.ads);

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
      vf.tags = vf.tags || [];
      vf.created = vf.created || new Date().toISOString();
      vf.updated = vf.updated || vf.created;
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

  // ---- Meta v2 entity migrations (idempotent field fillers) ----

  function migrateCampaignsV2(arr) {
    for (var i = 0; i < arr.length; i++) {
      var c = arr[i];
      c.name = c.name || '';
      c.description = c.description || '';
      c.objective = c.objective || META_CAMPAIGN_DEFAULTS.objective;
      c.buying_type = c.buying_type || META_CAMPAIGN_DEFAULTS.buying_type;
      c.budget_mode = c.budget_mode || META_CAMPAIGN_DEFAULTS.budget_mode;
      c.daily_budget = (c.daily_budget == null) ? null : c.daily_budget;
      c.lifetime_budget = (c.lifetime_budget == null) ? null : c.lifetime_budget;
      c.spend_cap = (c.spend_cap == null) ? null : c.spend_cap;
      c.bid_strategy = c.bid_strategy || META_CAMPAIGN_DEFAULTS.bid_strategy;
      c.special_ad_categories = c.special_ad_categories || META_CAMPAIGN_DEFAULTS.special_ad_categories.slice();
      c.start_time = c.start_time || '';
      c.stop_time = c.stop_time || '';
      c.status = c.status || META_CAMPAIGN_DEFAULTS.status;
      c.ab_test = c.ab_test || { enabled: false, primary_metric: '', variants: [] };
      c.ab_test.variants = c.ab_test.variants || [];
      c.ai_instructions = c.ai_instructions || '';
      c.brief = c.brief || '';
      c.tags = c.tags || [];
      c.notes = c.notes || '';
      c.created = c.created || new Date().toISOString();
      c.updated = c.updated || c.created;
      c.created_by = c.created_by || '';
    }
  }

  function migrateAdSets(arr) {
    for (var i = 0; i < arr.length; i++) {
      var s = arr[i];
      s.campaign_id = s.campaign_id || '';
      s.name = s.name || '';
      // Audience (v1: persona link + override notes)
      s.persona_id = s.persona_id || '';
      s.persona_snapshot = s.persona_snapshot || null;
      s.audience_overrides = s.audience_overrides || '';
      // Placements
      s.placements = s.placements || { advantage_enabled: true, custom_placements: [] };
      s.placements.advantage_enabled = (s.placements.advantage_enabled !== false);
      s.placements.custom_placements = s.placements.custom_placements || [];
      // Optimization
      s.optimization_goal = s.optimization_goal || META_AD_SET_DEFAULTS.optimization_goal;
      s.billing_event = s.billing_event || META_AD_SET_DEFAULTS.billing_event;
      s.attribution_setting = s.attribution_setting || META_AD_SET_DEFAULTS.attribution_setting;
      s.bid_amount = (s.bid_amount == null) ? null : s.bid_amount;
      // Budget (ABO)
      s.daily_budget = (s.daily_budget == null) ? null : s.daily_budget;
      s.lifetime_budget = (s.lifetime_budget == null) ? null : s.lifetime_budget;
      // Schedule
      s.start_time = s.start_time || '';
      s.stop_time = s.stop_time || '';
      s.dayparting = s.dayparting || null;
      // Strategic brief (Ad Set tier of the two-tier workflow)
      s.brief = s.brief || { creative_direction: '', message_ids: [], style_ids: [], format_ids: [], hook_angles: [], ai_notes: '' };
      s.brief.creative_direction = s.brief.creative_direction || '';
      s.brief.message_ids = s.brief.message_ids || [];
      s.brief.style_ids = s.brief.style_ids || [];
      s.brief.format_ids = s.brief.format_ids || [];
      s.brief.hook_angles = s.brief.hook_angles || [];
      s.brief.ai_notes = s.brief.ai_notes || '';
      // A/B
      s.ab_role = s.ab_role || null;
      // Status + misc
      s.status = s.status || META_AD_SET_DEFAULTS.status;
      s.notes = s.notes || '';
      s.created = s.created || new Date().toISOString();
      s.updated = s.updated || s.created;
      s.created_by = s.created_by || '';
    }
  }

  function migrateAds(arr) {
    for (var i = 0; i < arr.length; i++) {
      var a = arr[i];
      a.ad_set_id = a.ad_set_id || '';
      a.name = a.name || '';
      a.creative_type = a.creative_type || META_AD_DEFAULTS.creative_type;
      a.creative = a.creative || { primary_text: '', headline: '', description: '', cta_type: 'LEARN_MORE', cta_link: '', display_link: '', tracking_params: '' };
      a.creative.primary_text = a.creative.primary_text || '';
      a.creative.headline = a.creative.headline || '';
      a.creative.description = a.creative.description || '';
      a.creative.cta_type = a.creative.cta_type || 'LEARN_MORE';
      a.creative.cta_link = a.creative.cta_link || '';
      a.creative.display_link = a.creative.display_link || '';
      a.creative.tracking_params = a.creative.tracking_params || '';
      a.hook = a.hook || { source_message_id: '', selected_hook_id: '', text: '', type: 'direct' };
      a.hook.source_message_id = a.hook.source_message_id || '';
      a.hook.selected_hook_id = a.hook.selected_hook_id || '';
      a.hook.text = a.hook.text || '';
      a.hook.type = a.hook.type || 'direct';
      a.media = a.media || {};
      a.media.image = a.media.image || { asset_id: '', prompt: '', aspect_ratio: '1:1' };
      a.media.video = a.media.video || { asset_id: '', duration_seconds: 30, aspect_ratio: '9:16', concept: '', script: { sections: [] } };
      a.media.video.script = a.media.video.script || { sections: [] };
      a.media.carousel_cards = a.media.carousel_cards || [];
      // Snapshots
      a.message_snapshot = a.message_snapshot || null;
      a.style_snapshot = a.style_snapshot || null;
      a.format_snapshot = a.format_snapshot || null;
      // Pipeline
      a.pipeline_status = a.pipeline_status || META_AD_DEFAULTS.pipeline_status;
      a.review_notes = a.review_notes || '';
      a.production_notes = a.production_notes || '';
      a.assigned_to = a.assigned_to || '';
      a.due_date = a.due_date || '';
      a.tags = a.tags || [];
      a.created = a.created || new Date().toISOString();
      a.updated = a.updated || a.created;
      a.created_by = a.created_by || '';
    }
  }

  function migrateMeta() {
    var m = S.meta;
    m.workspace = m.workspace || { name: '', description: '', created: new Date().toISOString() };
    m.setup = m.setup || { product_name: '', objective: '', custom_instructions: '', setup_complete: false };
    // Meta v2 is the only supported surface.
    m.setup.meta_v2 = true;
    delete m.setup.migrated_to_v2;
    m.settings = m.settings || {};
    m.settings.timezone = m.settings.timezone || 'Asia/Kolkata';
    m.settings.default_view = m.settings.default_view || 'dashboard';
    m.settings.card_density = m.settings.card_density || 'normal';
    m.settings.funnel_stages = m.settings.funnel_stages || deepClone(FUNNEL_DEFAULTS);
    m.settings.visual_format_categories = m.settings.visual_format_categories || deepClone(FORMAT_CATEGORIES);
    m.settings.pain_point_categories = m.settings.pain_point_categories || deepClone(PAIN_POINT_CATEGORIES);
    m.settings.defaults = m.settings.defaults || { priority: 'medium', funnel_stage: 'fs_top' };
    m.settings.brand_design = m.settings.brand_design || getDefaultBrandDesign();
    m.aiPreferences = m.aiPreferences || {};
    m.aiPreferences.appDefault = m.aiPreferences.appDefault || { provider: '', model: '' };
    m.aiPreferences.perAction = m.aiPreferences.perAction || {};
    m.aiPreferences.lastProvider = m.aiPreferences.lastProvider || '';
    m.aiPreferences.lastModel = m.aiPreferences.lastModel || '';

    // Meta v2: workspace-level Page / Pixel / attribution / currency defaults
    m.meta_defaults = m.meta_defaults || {};
    var defaults = getDefaultMetaDefaults();
    for (var dk in defaults) {
      if (m.meta_defaults[dk] === undefined) m.meta_defaults[dk] = defaults[dk];
    }
    // Drop any leftover legacy backup payload
    delete m.legacy_backup;
    delete m.settings.campaign_objectives;
    delete m.recipe_templates;

    S.cardDensity = m.settings.card_density;
    S.currentView = readHash();
  }


/* ===== src/10-part1/05-map-builders.js ===== */
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
    S.totalPersonas = 0;
    var personas = S.data.personas || [];
    for (i = 0; i < personas.length; i++) {
      item = personas[i];
      S.personaMap[item.id] = item;
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
    S.totalMessages = 0;
    var msgs = S.data.messages || [];
    for (i = 0; i < msgs.length; i++) {
      S.messageMap[msgs[i].id] = msgs[i];
      S.totalMessages++;
    }

    // --- Styles ---
    S.styleMap = {};
    S.totalStyles = 0;
    var stys = S.data.styles || [];
    for (i = 0; i < stys.length; i++) {
      S.styleMap[stys[i].id] = stys[i];
      S.totalStyles++;
    }

    // --- Visual formats ---
    S.formatMap = {};
    S.totalFormats = 0;
    var fmts = S.data.visual_formats || [];
    for (i = 0; i < fmts.length; i++) {
      S.formatMap[fmts[i].id] = fmts[i];
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

    // --- Research sessions ---
    S.researchMap = {};
    var sessions = S.data.research_sessions || [];
    for (i = 0; i < sessions.length; i++) S.researchMap[sessions[i].id] = sessions[i];

    // --- Meta v2 hierarchy maps ---

    S.campaignV2Map = {};
    S.campaignV2StatusCounts = {};
    S.totalCampaignsV2 = 0; S.activeCampaignsV2 = 0;
    for (var cv2k in META_CAMPAIGN_STATUSES) S.campaignV2StatusCounts[cv2k] = 0;
    var campsV2 = S.data.campaigns_v2 || [];
    for (i = 0; i < campsV2.length; i++) {
      item = campsV2[i];
      S.campaignV2Map[item.id] = item;
      S.campaignV2StatusCounts[item.status] = (S.campaignV2StatusCounts[item.status] || 0) + 1;
      S.totalCampaignsV2++;
      if (item.status === 'ACTIVE' || item.status === 'DRAFT') S.activeCampaignsV2++;
    }

    S.adSetMap = {};
    S.adSetsByCampaign = {};
    S.adSetStatusCounts = {};
    S.totalAdSets = 0;
    for (var asKey in META_AD_SET_STATUSES) S.adSetStatusCounts[asKey] = 0;
    var adSets = S.data.ad_sets || [];
    for (i = 0; i < adSets.length; i++) {
      item = adSets[i];
      S.adSetMap[item.id] = item;
      S.totalAdSets++;
      S.adSetStatusCounts[item.status] = (S.adSetStatusCounts[item.status] || 0) + 1;
      if (item.campaign_id) {
        S.adSetsByCampaign[item.campaign_id] = S.adSetsByCampaign[item.campaign_id] || [];
        S.adSetsByCampaign[item.campaign_id].push(item);
      }
    }

    S.adMap = {};
    S.adsByAdSet = {};
    S.adStatusCounts = {};
    S.totalAds = 0; S.activeAds = 0;
    for (var aKey in META_AD_STATUSES) S.adStatusCounts[aKey] = 0;
    var ads = S.data.ads || [];
    for (i = 0; i < ads.length; i++) {
      item = ads[i];
      S.adMap[item.id] = item;
      S.totalAds++;
      S.adStatusCounts[item.pipeline_status] = (S.adStatusCounts[item.pipeline_status] || 0) + 1;
      if (META_AD_ACTIVE_STATUSES.indexOf(item.pipeline_status) > -1) S.activeAds++;
      if (item.ad_set_id) {
        S.adsByAdSet[item.ad_set_id] = S.adsByAdSet[item.ad_set_id] || [];
        S.adsByAdSet[item.ad_set_id].push(item);
      }
    }
  }


/* ===== src/10-part1/06-navigation.js ===== */
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
    if (!options.noHash) updateHash(options.hash || viewName);
    if (options.scrollTop !== false) $('#cpContent').scrollTop(0);
  }

  // Convenience: jump to the Campaign Workspace focused on a Campaign,
  // and optionally select an Ad Set / Ad within it.
  function navigateToCampaignV2(campaignId, adSetId, adId) {
    if (campaignId) S.selectedCampaignV2Id = campaignId;
    S.selectedAdSetId = adSetId || null;
    S.selectedAdId = adId || null;
    var h = 'campaign/' + campaignId;
    if (adSetId) h += '/ad_set/' + adSetId;
    if (adId)    h += '/ad/' + adId;
    navigate('campaign_workspace', { hash: h });
  }

  function updateHash(v) {
    if (history.replaceState) history.replaceState(null, null, '#' + v);
    else window.location.hash = v;
  }

  // Parse a hash like `campaign/cmpv2_x/ad_set/adset_y/ad/ad_z` and update
  // S.selectedCampaignV2Id / selectedAdSetId / selectedAdId. Returns the
  // resolved view name.
  function parseWorkspaceHash(h) {
    if (!h || h.indexOf('campaign/') !== 0) return null;
    var parts = h.split('/');
    // parts: ['campaign', '<id>', 'ad_set'?, '<id>'?, 'ad'?, '<id>'?]
    S.selectedCampaignV2Id = parts[1] || null;
    S.selectedAdSetId = (parts[2] === 'ad_set') ? (parts[3] || null) : null;
    S.selectedAdId    = (parts[4] === 'ad')     ? (parts[5] || null) : null;
    return 'campaign_workspace';
  }

  function readHash() {
    var h = window.location.hash.replace('#', '');
    // Nested workspace routes
    if (h.indexOf('campaign/') === 0) {
      var w = parseWorkspaceHash(h);
      if (w) return w;
    }
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
      try {
        html = renderSetupView();
        $('#cpContent').html(html);
        setupViewEventHandlers();
      } catch (e) {
        console.error('[CP] renderSetupView crashed:', e);
        $('#cpContent').html(renderViewCrashCard('setup', e));
      }
      return;
    }

    // Legacy 'pain_points' view was merged into Personas. Redirect any
    // bookmarks / hash routes to the Personas view with the Pain Points tab
    // pre-selected.
    if (S.currentView === 'pain_points') {
      S.currentView = 'personas';
      S.personasTab = 'pain_points';
    }

    // Error boundary — if any single view renderer throws, the user sees a
    // diagnostic card instead of a blank #cpContent (silent failure).
    try {
      switch (S.currentView) {
        case 'dashboard':    html = renderDashboardView(); break;
        case 'personas':     html = renderPersonasView(); break;
        case 'messages':     html = renderMessagesView(); break;
        case 'styles':       html = renderStylesView(); break;
        case 'formats':      html = renderFormatsPageView(); break;
        case 'meta_campaigns':     html = renderMetaCampaignsView(); break;
        case 'campaign_workspace': html = renderCampaignWorkspaceView(); break;
        case 'calendar':   html = renderCalendarView(); break;
        case 'research':   html = (R.researchView) ? R.researchView() : renderResearchPlaceholder(); break;
        case 'activity':   html = renderActivityView(); break;
        case 'settings':   html = (R.settingsView) ? R.settingsView() : renderSettingsPlaceholder(); break;
        default:           html = renderDashboardView();
      }
      $('#cpContent').html(html);
      setupViewEventHandlers();

      // Trigger Part 2A/2B view-specific event setup
      if (R.setupResearchEvents && S.currentView === 'research') R.setupResearchEvents();
      if (R.setupSettingsEvents && S.currentView === 'settings') R.setupSettingsEvents();

      // Replace any AI picker placeholders left in the DOM (Part 2B loads async).
      if (typeof window._cpReplaceAiPickers === 'function') window._cpReplaceAiPickers();
    } catch (e) {
      console.error('[CP] renderCurrentView crashed for view "' + S.currentView + '":', e);
      $('#cpContent').html(renderViewCrashCard(S.currentView, e));
    }
  }

  // Diagnostic card shown when a view renderer throws. Replaces the blank
  // #cpContent silent-failure mode with something the user can act on.
  function renderViewCrashCard(viewName, err) {
    var msg = (err && err.message) ? String(err.message) : String(err);
    var stack = (err && err.stack) ? String(err.stack) : '';
    var html = '';
    html += '<div class="cp-view-crash">';
    html += '<div class="cp-view-crash-inner">';
    html += '<div class="cp-view-crash-icon">' + icon('triangle-exclamation') + '</div>';
    html += '<h2 class="cp-view-crash-title">Something went wrong rendering this view.</h2>';
    html += '<p class="cp-view-crash-view">View: <code>' + esc(viewName || '(unknown)') + '</code></p>';
    html += '<pre class="cp-view-crash-msg">' + esc(msg) + '</pre>';
    if (stack) {
      html += '<details class="cp-view-crash-stack"><summary>Stack trace</summary><pre>' + esc(stack) + '</pre></details>';
    }
    html += '<div class="cp-view-crash-actions">';
    html += '<button class="cp-btn cp-btn-primary" data-action="crash-reload">' + icon('rotate') + ' Reload page</button>';
    html += '<button class="cp-btn cp-btn-outline" data-action="crash-go-dashboard">' + icon('chart-pie') + ' Back to Dashboard</button>';
    html += '</div>';
    html += '<p class="cp-text-muted" style="margin-top:var(--cp-space-3);font-size:var(--cp-font-size-xs)">Copy the stack trace above and share it with your developer for a fix.</p>';
    html += '</div>';
    html += '</div>';
    return html;
  }


/* ===== src/10-part1/07-utilities.js ===== */
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
  function truncate(text, max) { text = String(text == null ? '' : text); if (text.length <= max) return text; return text.substring(0, max) + '…'; }
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
      'crosshairs': 'fa-crosshairs', 'bullseye-arrow': 'fa-bullseye-arrow',
      'people-group': 'fa-people-group', 'circle-dot': 'fa-circle-dot',
      'plus-circle': 'fa-circle-plus', 'minus-circle': 'fa-circle-minus',
      'magnifying-glass-chart': 'fa-magnifying-glass-chart',
      'arrows-up-down-left-right': 'fa-arrows-up-down-left-right',
      'note-sticky': 'fa-note-sticky', 'rectangle-list': 'fa-rectangle-list',
      'list-tree': 'fa-list-tree', 'object-group': 'fa-object-group',
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
  function getTag(id) { return S.tagMap[id] || null; }
  function getFunnelStage(id) { return S.funnelStageMap[id] || null; }
  function getResearchSession(id) { return S.researchMap[id] || null; }

  // --- Meta v2 entity getters ---
  function getCampaignV2(id) { return S.campaignV2Map[id] || null; }
  function getAdSet(id)      { return S.adSetMap[id] || null; }
  function getAd(id)         { return S.adMap[id] || null; }
  function isMetaV2Enabled() { return !!(S.meta && S.meta.setup && S.meta.setup.meta_v2); }

  // Looks up the visual style for a production node's status string.
  // Case-insensitive; unknown values get the neutral default.
  function getProductionStatusStyle(status) {
    if (!status) return PRODUCTION_STATUS_DEFAULT;
    var key = String(status).toLowerCase().trim().replace(/\s+/g, '_');
    return PRODUCTION_STATUSES[key] || $.extend({}, PRODUCTION_STATUS_DEFAULT, { label: status });
  }

  // --- Collection getters ---
  function getAllTags() { return (S.data.tags || []).slice().sort(function(a, b) { return a.name.localeCompare(b.name); }); }
  function getAllPersonas() { return (S.data.personas || []).slice(); }
  function getAllMessages() { return (S.data.messages || []).slice(); }
  function getAllStyles() { return (S.data.styles || []).slice(); }
  function getAllFormats() { return (S.data.visual_formats || []).slice(); }
  function getAllPainPoints() { return (S.data.pain_points || []).slice(); }
  function getAllCategories() { return (S.data.persona_categories || []).slice().sort(function(a, b) { return (a.order || 0) - (b.order || 0); }); }

  // --- Meta v2 collection getters ---
  function getAllCampaignsV2() { return (S.data.campaigns_v2 || []).slice(); }
  function getAllAdSets()      { return (S.data.ad_sets || []).slice(); }
  function getAllAds()         { return (S.data.ads || []).slice(); }
  function getAdSetsByCampaign(campaignId) { return (S.adSetsByCampaign[campaignId] || []).slice(); }
  function getAdsByAdSet(adSetId)          { return (S.adsByAdSet[adSetId] || []).slice(); }
  function getAdsByCampaign(campaignId) {
    var sets = S.adSetsByCampaign[campaignId] || [];
    var out = [];
    for (var i = 0; i < sets.length; i++) {
      var ads = S.adsByAdSet[sets[i].id] || [];
      for (var j = 0; j < ads.length; j++) out.push(ads[j]);
    }
    return out;
  }

  function getRecentActivity(n) { return (S.activity || []).slice(-(n || 15)).reverse(); }

  function getPersonasByCategory(catId) {
    return (S.data.personas || []).filter(function(p) { return p.category_id === catId; });
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

  // --- Viewport helpers ---
  function cpIsPhone()  { return window.matchMedia('(max-width: 768px)').matches; }
  function cpIsTablet() { return window.matchMedia('(max-width: 992px)').matches; }

  // Re-render the current view when the phone breakpoint flips (rotation / resize).
  function setupResponsiveRerender() {
    if (window._cpResponsiveBound) return;
    window._cpResponsiveBound = true;
    var mq = window.matchMedia('(max-width: 768px)');
    var rerender = debounce(function() { if (typeof renderCurrentView === 'function') renderCurrentView(); }, 150);
    if (mq.addEventListener) mq.addEventListener('change', rerender);
    else if (mq.addListener) mq.addListener(rerender);
  }

  // --- Misc ---
  function debounce(fn, delay) { var t; return function() { var c = this, a = arguments; clearTimeout(t); t = setTimeout(function() { fn.apply(c, a); }, delay); }; }
  function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }
  function isEmpty(obj) { return !obj || (typeof obj === 'object' && Object.keys(obj).length === 0); }
  function isSetupComplete() { return S.meta && S.meta.setup && S.meta.setup.setup_complete; }


/* ===== src/10-part1/08-shell.js ===== */
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
      '<div id="cpSidebarBackdrop" class="cp-sidebar-backdrop" aria-hidden="true"></div>' +
      '<div class="cp-body">' + renderSidebar() +
      '<div class="cp-main"><div class="cp-content" id="cpContent"></div></div></div>' +
      '<div id="cpToasts" class="cp-toast-container"></div>';
  }

  function renderHeader() {
    var ws = (S.meta && S.meta.workspace) || {};
    var setup = (S.meta && S.meta.setup) || {};
    var html = '<div class="cp-header"><div class="cp-header-left">';
    html += '<button class="cp-btn-icon cp-sidebar-toggle" id="cpSidebarToggle" aria-label="Toggle navigation" aria-expanded="false" aria-controls="cpSidebar">' + icon('menu') + '</button>';
    html += '<div class="cp-header-logo"><span class="cp-header-logo-accent">Meta</span> Campaign Planner</div>';
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
    var html = '<aside class="cp-sidebar' + (S.sidebarMobileOpen ? ' cp-sidebar-open' : '') + '" id="cpSidebar"><div class="cp-sidebar-inner"><nav class="cp-nav">';

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
        if (v.hidden) continue;                       // never in sidebar (e.g. campaign_workspace)
        if (v.legacy) continue;                       // legacy v1 surfaces are gone — always hide
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
    html += '<div class="cp-sidebar-footer-name">' + esc(ws.name || 'Meta Campaign Planner') + '</div>';
    html += '<div class="cp-sidebar-footer-meta">Meta Ads' + (setup.setup_complete ? ' · Setup ✓' : '') + (setup.meta_v2 ? ' · v2' : '') + '</div>';
    var v = window.CP_VERSION || '';
    var bt = window.CP_BUILD_TIME || '';
    var chipHref = v
      ? 'https://github.com/devenpro/guaCampaignPlanner/releases/tag/v' + esc(v)
      : 'https://github.com/devenpro/guaCampaignPlanner';
    html += '<a class="cp-version-chip" href="' + chipHref + '" target="_blank" rel="noopener" title="' + esc(bt ? 'Built ' + bt : 'dev build') + '">v' + esc(v || 'dev') + '</a>';
    html += '</div>';

    html += '</div></aside>';
    return html;
  }

  function renderSidebarBadge(viewKey) {
    var count = 0;
    switch (viewKey) {
      case 'personas': count = S.totalPersonas; break;
      case 'messages': count = S.totalMessages; break;
      case 'styles': count = S.totalStyles + S.totalFormats; break;
      case 'meta_campaigns': count = S.activeCampaignsV2; break;
      case 'activity':
        var recent24h = (S.activity || []).filter(function(a) {
          return a.timestamp && (Date.now() - new Date(a.timestamp).getTime()) < 86400000;
        }).length;
        count = recent24h; break;
      default: count = 0;
    }
    return count > 0 ? '<span class="cp-nav-badge">' + count + '</span>' : '';
  }


/* ===== src/10-part1/09-view-setup.js ===== */
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
    html += '<p class="cp-setup-welcome-desc">The Setup Wizard should already be open. If you don\'t see it, refresh the page — or open <strong>Settings → Workspace → Setup wizard</strong> to re-run it.</p>';

    html += '<div class="cp-setup-welcome-features">';
    html += '<div class="cp-setup-welcome-feat">' + icon('users') + ' Personas</div>';
    html += '<div class="cp-setup-welcome-feat">' + icon('crosshair') + ' Pain Points</div>';
    html += '<div class="cp-setup-welcome-feat">' + icon('message-square') + ' Messages</div>';
    html += '<div class="cp-setup-welcome-feat">' + icon('palette') + ' Styles &amp; Formats</div>';
    html += '<div class="cp-setup-welcome-feat">' + icon('sparkles') + ' AI-Generated</div>';
    html += '<div class="cp-setup-welcome-feat">' + icon('flag') + ' First Campaign</div>';
    html += '</div>';

    html += '</div>'; // card
    html += '</div>'; // welcome
    html += '</div>'; // view
    return html;
  }


/* ===== src/10-part1/10-view-dashboard.js ===== */
  // ============================================================
  // SECTION 10: DASHBOARD VIEW
  // ============================================================

  function renderDashboardView() {
    var html = '<div class="cp-view cp-view-dashboard">';

    var camps = getAllCampaignsV2 ? getAllCampaignsV2() : [];
    var libraryEmpty = S.totalPersonas === 0 && S.totalMessages === 0;
    if (libraryEmpty && camps.length === 0) {
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
    html += '<h1>Build Your Meta Campaign Library</h1>';
    html += '<p>Your workspace is empty — the Setup Wizard will open automatically. Or jump straight in:</p>';
    html += '</div>';

    // 2-step shortcut for users who close the auto-launched wizard
    html += '<div class="cp-dash-steps">';
    var steps = [
      { num: '1', label: 'New Campaign',      desc: 'Skip setup — go straight to the Campaign Wizard',            action: 'new-campaign-v2',     icon: 'bullhorn',    color: '#1a73e8' },
      { num: '2', label: 'Open Research Lab', desc: 'Browse and refine library entities individually',           action: 'go-view',             view:  'research',   icon: 'flask',       color: '#0d904f' }
    ];
    for (var i = 0; i < steps.length; i++) {
      var st = steps[i];
      html += '<div class="cp-dash-step-card" data-action="' + esc(st.action) + '"' + (st.view ? ' data-view="' + esc(st.view) + '"' : '') + '>';
      html += '<div class="cp-dash-step-num" style="background:' + st.color + '15;color:' + st.color + '">' + icon(st.icon) + '</div>';
      html += '<div class="cp-dash-step-label">' + esc(st.label) + '</div>';
      html += '<div class="cp-dash-step-desc">' + esc(st.desc) + '</div>';
      html += '</div>';
    }
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderDashPopulated() {
    var html = '';

    // View header — Meta v2 is the only mode
    html += '<div class="cp-view-header"><div class="cp-view-header-left"><h1>' + icon('chart-pie') + ' Dashboard</h1></div>';
    html += '<div class="cp-view-header-right">';
    html += '<button class="cp-btn cp-btn-ai" data-action="new-campaign-v2">' + icon('wand-magic') + ' New Campaign</button>';
    html += '<button class="cp-btn cp-btn-outline" data-action="go-view" data-view="research">' + icon('flask') + ' Research Lab</button>';
    html += '</div></div>';

    // Meta v2 widget (Campaigns / Ad Sets / Ads rollups)
    html += renderDashMetaV2Widget();

    // Continue working card (last edited Ad)
    var lastAd = (S.data.ads || []).slice().sort(function(a, b) { return (b.updated || '') > (a.updated || '') ? 1 : -1; })[0];
    if (lastAd && lastAd.updated) {
      var lastSet = S.adSetMap[lastAd.ad_set_id];
      var lastCamp = lastSet && S.campaignV2Map[lastSet.campaign_id];
      var statusCfg = (typeof metaAdStatus === 'function') ? metaAdStatus(lastAd.pipeline_status) : { label: lastAd.pipeline_status || '', color: '#80868b' };
      html += '<div class="cp-card cp-dash-continue" data-action="ws-select-ad" data-id="' + esc(lastAd.id) + '">';
      html += '<div style="display:flex;align-items:center;gap:var(--cp-space-3)">';
      html += '<div style="flex:1"><span class="cp-text-muted" style="font-size:var(--cp-font-size-xs)">Continue where you left off</span>';
      html += '<div style="font-weight:600">' + esc(lastAd.name || 'Untitled Ad') + '</div>';
      html += '<div style="display:flex;gap:var(--cp-space-2);margin-top:4px"><span class="cp-badge" style="background:' + statusCfg.color + '15;color:' + statusCfg.color + '">' + esc(statusCfg.label) + '</span>';
      if (lastCamp) html += '<span class="cp-badge" style="background:#0891b215;color:#0891b2">' + icon('bullhorn') + ' ' + esc(truncate(lastCamp.name, 14)) + '</span>';
      html += '</div></div>';
      html += '<span class="cp-text-muted">' + formatRelativeTime(lastAd.updated) + ' ' + icon('arrow-right') + '</span>';
      html += '</div></div>';
    }

    // Stat cards row
    html += renderDashStats();

    // Two-column grid
    html += '<div class="cp-dash-grid">';
    html += '<div class="cp-dash-col-left">';
    html += renderDashFunnelBar();
    html += '</div>';
    html += '<div class="cp-dash-col-right">';
    html += renderDashQuickActions();
    html += renderDashRecentAds();
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

    // Campaigns (Meta v2)
    html += renderStatCard(icon('bullhorn'), 'Campaigns', S.totalCampaignsV2, S.activeCampaignsV2 + ' active', '#0891b2');

    // Ads (Meta v2)
    html += renderStatCard(icon('rectangle-ad'), 'Ads', S.totalAds, S.activeAds + ' active', '#e37400');

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
      html += '<div class="cp-empty-state cp-empty-state--compact"><p>No messages tagged with funnel stages yet.</p></div>';
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

  function renderDashQuickActions() {
    var html = '<div class="cp-section"><div class="cp-section-header"><h2>' + icon('bolt') + ' Quick Actions</h2></div>';
    html += '<div class="cp-dash-actions">';
    html += '<button class="cp-btn cp-btn-ai cp-dash-action-btn" data-action="new-campaign-v2">' + icon('wand-magic') + ' New Campaign</button>';
    html += '<button class="cp-btn cp-btn-primary cp-dash-action-btn" data-action="go-view" data-view="meta_campaigns">' + icon('bullhorn') + ' Campaigns</button>';
    html += '<button class="cp-btn cp-btn-outline cp-dash-action-btn" data-action="go-view" data-view="research">' + icon('flask') + ' Research Lab</button>';
    html += '</div></div>';
    return html;
  }

  function renderDashRecentAds() {
    var recent = (S.data.ads || []).slice().sort(function(a, b) {
      return (b.updated || b.created || '') > (a.updated || a.created || '') ? 1 : -1;
    }).slice(0, 5);

    var html = '<div class="cp-section"><div class="cp-section-header"><h2>' + icon('rectangle-ad') + ' Recent Ads</h2>';
    if (S.totalAds > 0) html += '<a href="#" class="cp-btn-link" data-action="go-view" data-view="meta_campaigns">View all ' + icon('arrow-right') + '</a>';
    html += '</div>';

    if (recent.length === 0) {
      html += '<div class="cp-empty-state cp-empty-state--compact"><p>No ads yet. Create a Campaign to get started.</p></div>';
    } else {
      html += '<div class="cp-dash-recipe-list">';
      for (var i = 0; i < recent.length; i++) {
        var r = recent[i];
        var stCfg = (typeof metaAdStatus === 'function') ? metaAdStatus(r.pipeline_status) : { label: r.pipeline_status || '', color: '#80868b' };
        html += '<div class="cp-dash-recipe-item" data-action="ws-select-ad" data-id="' + esc(r.id) + '">';
        html += '<span class="cp-status-dot" style="background:' + stCfg.color + '"></span>';
        html += '<span class="cp-dash-recipe-title">' + esc(truncate(r.name || 'Untitled Ad', 45)) + '</span>';
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

/* ===== src/10-part1/10a-view-dashboard-meta-v2.js ===== */
  // ============================================================
  // SECTION 10A: DASHBOARD — META v2 WIDGET (Stage 8)
  // ============================================================
  //
  // Replaces the legacy "Active campaigns" card with a Meta v2 summary
  // when S.meta.setup.meta_v2 is true. Surfaces:
  //   - Active campaigns count
  //   - Ad Set status rollup (active / paused / draft)
  //   - Ads pipeline rollup (live / approved / in_review / draft+wip)
  //   - Snapshot divergence count (library updated since attach)
  //   - "Continue working" list (3 most recently updated Ads)

  function renderDashMetaV2Widget() {
    if (!isMetaV2Enabled()) return '';

    var camps = getAllCampaignsV2();
    var sets = getAllAdSets();
    var ads = getAllAds();
    var active = camps.filter(function(c) { return c.status === 'ACTIVE'; }).length;
    var drafts = camps.filter(function(c) { return c.status === 'DRAFT'; }).length;

    // Ads pipeline rollup
    var liveAds = ads.filter(function(a) { return a.pipeline_status === 'live'; }).length;
    var approvedAds = ads.filter(function(a) { return a.pipeline_status === 'approved'; }).length;
    var reviewAds = ads.filter(function(a) { return a.pipeline_status === 'in_review'; }).length;
    var wipAds = ads.filter(function(a) {
      return ['hook_ready', 'copy_ready', 'media_ready'].indexOf(a.pipeline_status) > -1;
    }).length;

    // Snapshot divergence count (Ad Sets whose persona has moved on)
    var divergent = 0;
    sets.forEach(function(s) { if (isPersonaSnapshotStale(s)) divergent++; });

    // Continue working: most recently updated ads, top 3
    var recentAds = ads.slice().sort(function(a, b) {
      return (b.updated || b.created || '') > (a.updated || a.created || '') ? 1 : -1;
    }).slice(0, 3);

    var html = '<div class="cp-dash-v2-card">';
    html += '<div class="cp-dash-v2-card-header">';
    html += '<h2>' + icon('bullhorn') + ' Meta Campaigns</h2>';
    html += '<div style="display:flex;gap:6px">';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="go-view" data-view="meta_campaigns">View all</button>';
    html += '<button class="cp-btn cp-btn-ai cp-btn-sm" data-action="new-campaign-v2">' + icon('wand-magic') + ' New Campaign</button>';
    html += '</div></div>';

    // Top stats row
    html += '<div class="cp-dash-v2-stats">';
    html += '<div class="cp-dash-v2-stat"><div class="cp-dash-v2-stat-val">' + camps.length + '</div><div class="cp-dash-v2-stat-lbl">Campaigns</div><div class="cp-dash-v2-stat-sub">' + active + ' active · ' + drafts + ' draft</div></div>';
    html += '<div class="cp-dash-v2-stat"><div class="cp-dash-v2-stat-val">' + sets.length + '</div><div class="cp-dash-v2-stat-lbl">Ad Sets</div></div>';
    html += '<div class="cp-dash-v2-stat"><div class="cp-dash-v2-stat-val">' + ads.length + '</div><div class="cp-dash-v2-stat-lbl">Ads</div><div class="cp-dash-v2-stat-sub">' + liveAds + ' live · ' + approvedAds + ' ready</div></div>';
    html += '<div class="cp-dash-v2-stat"><div class="cp-dash-v2-stat-val" style="color:' + (divergent > 0 ? 'var(--cp-accent)' : 'var(--cp-success)') + '">' + divergent + '</div><div class="cp-dash-v2-stat-lbl">Diverged</div><div class="cp-dash-v2-stat-sub">snapshots</div></div>';
    html += '</div>';

    // Pipeline progress bar
    if (ads.length > 0) {
      html += '<div class="cp-dash-v2-pipeline">';
      var segments = [
        { count: wipAds,      color: '#1a73e8', label: 'In progress' },
        { count: reviewAds,   color: '#e37400', label: 'In review' },
        { count: approvedAds, color: '#0d904f', label: 'Approved' },
        { count: liveAds,     color: '#0891b2', label: 'Live' }
      ];
      var totalWithStatus = wipAds + reviewAds + approvedAds + liveAds;
      var remaining = ads.length - totalWithStatus;
      if (remaining > 0) segments.unshift({ count: remaining, color: '#bdc1c6', label: 'Other' });

      html += '<div class="cp-dash-v2-pipeline-bar">';
      segments.forEach(function(seg) {
        if (seg.count === 0) return;
        var pct = (seg.count / ads.length) * 100;
        html += '<div class="cp-dash-v2-pipeline-seg" style="width:' + pct + '%;background:' + seg.color + '" title="' + esc(seg.label) + ': ' + seg.count + '"></div>';
      });
      html += '</div>';
      html += '<div class="cp-dash-v2-pipeline-legend">';
      segments.forEach(function(seg) {
        if (seg.count === 0) return;
        html += '<span><span class="cp-dash-v2-legend-dot" style="background:' + seg.color + '"></span> ' + esc(seg.label) + ' (' + seg.count + ')</span>';
      });
      html += '</div></div>';
    }

    // Continue working
    if (recentAds.length > 0) {
      html += '<div class="cp-dash-v2-section-title">' + icon('pen-fancy') + ' Continue working</div>';
      html += '<div class="cp-dash-v2-continue-list">';
      for (var i = 0; i < recentAds.length; i++) {
        var a = recentAds[i];
        var status = metaAdStatus(a.pipeline_status);
        var adSet = S.adSetMap[a.ad_set_id];
        var campId = adSet ? adSet.campaign_id : '';
        html += '<div class="cp-dash-v2-continue-item" data-action="lib-open-ad" data-id="' + esc(a.id) + '">';
        html += '<span class="cp-tree-status-dot" style="background:' + status.color + '"></span>';
        html += '<span class="cp-dash-v2-continue-name">' + esc(a.name) + '</span>';
        if (adSet) html += '<span class="cp-text-muted">' + esc(adSet.name) + '</span>';
        html += '<span class="cp-text-muted" style="font-size:11px">' + formatRelativeTime(a.updated || a.created) + '</span>';
        html += '</div>';
      }
      html += '</div>';
    }

    // Empty state CTA
    if (camps.length === 0) {
      html += '<div class="cp-dash-v2-empty">';
      html += '<p>No Meta Campaigns yet. The New Campaign wizard takes a brief and drafts Ad Sets and Ads with AI — step by step.</p>';
      html += '<div style="display:flex;gap:8px;margin-top:var(--cp-space-2)">';
      html += '<button class="cp-btn cp-btn-ai" data-action="new-campaign-v2">' + icon('wand-magic') + ' New Campaign</button>';
      html += '</div></div>';
    }

    html += '</div>';
    return html;
  }

/* ===== src/10-part1/11-view-personas.js ===== */
  // ============================================================
  // SECTION 11: PERSONAS VIEW
  // ============================================================

  function renderPersonasView() {
    var isPP = S.personasTab === 'pain_points';
    var html = '<div class="cp-view cp-view-personas' + (isPP ? ' cp-view-personas--pp' : '') + '">';

    // View header
    html += '<div class="cp-view-header"><div class="cp-view-header-left">';
    if (isPP) {
      var pps = getAllPainPoints();
      html += '<h1>' + icon('bolt') + ' Pain Points</h1>';
      html += '<span class="cp-view-subtitle">' + pps.length + ' shared pain point' + (pps.length !== 1 ? 's' : '') + ', linked to personas</span>';
    } else {
      html += '<h1>' + icon('users') + ' Personas</h1>';
      html += '<span class="cp-view-subtitle">' + S.totalPersonas + ' personas in ' + (S.data.persona_categories || []).length + ' categories</span>';
    }
    html += '</div><div class="cp-view-header-right">';
    // Tab toggle — Personas / Pain Points
    html += '<div class="cp-tab-toggle">';
    html += '<button class="cp-tab-btn' + (!isPP ? ' cp-tab-btn-active' : '') + '" data-action="set-personas-tab" data-tab="personas">' + icon('users') + ' Personas</button>';
    html += '<button class="cp-tab-btn' + (isPP ? ' cp-tab-btn-active' : '') + '" data-action="set-personas-tab" data-tab="pain_points">' + icon('bolt') + ' Pain Points</button>';
    html += '</div>';
    if (isPP) {
      html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="new-pain-point">' + icon('plus') + ' Add Pain Point</button>';
    } else {
      html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="new-persona">' + icon('plus') + ' Add Persona</button>';
      html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="new-category">' + icon('folder-plus') + ' Category</button>';
    }
    html += '</div></div>';

    // AI Research Panel — switches stateKey based on tab so each tab has
    // its own research workflow.
    html += '<div class="cp-ai-research-slot" id="cpPersonaResearchSlot">';
    if (isPP) {
      html += renderAIResearchBar('Pain Point', '#d93025', 'bolt', 'pain_points');
    } else {
      html += renderAIResearchBar('Persona', '#9334e9', 'users', 'personas');
    }
    html += '</div>';

    if (isPP) {
      // Pain Points tab — full toolbar + grouped list + dedicated detail pane.
      var ppFilter = S.painPointFilter || {};
      html += '<div class="cp-view-toolbar cp-pp-toolbar">';
      html += '<div class="cp-search-wrapper">' + icon('search') + '<input type="text" class="cp-input" id="cpPainPointPageSearch" placeholder="Search pain points & solutions…" value="' + esc(ppFilter.search || '') + '"></div>';
      html += '<select class="cp-select cp-select-sm" id="cpPainPointCatFilter"><option value="">All Categories</option>';
      for (var ci = 0; ci < PAIN_POINT_CATEGORIES.length; ci++) {
        var pcat = PAIN_POINT_CATEGORIES[ci];
        html += '<option value="' + esc(pcat.id) + '"' + (ppFilter.category === pcat.id ? ' selected' : '') + '>' + esc(pcat.name) + '</option>';
      }
      html += '</select>';
      var groupBy = ppFilter.groupBy || 'category';
      html += '<select class="cp-select cp-select-sm" id="cpPainPointGroupBy">';
      html += '<option value="category"' + (groupBy === 'category' ? ' selected' : '') + '>Group: Category</option>';
      html += '<option value="flat"' + (groupBy === 'flat' ? ' selected' : '') + '>Group: None</option>';
      html += '</select>';
      html += '</div>';
    }

    // Split pane
    html += '<div class="cp-split-pane">';
    if (isPP) {
      html += renderPainPointsPaneLeft();
      html += '<div class="cp-preview-pane">';
      html += renderPainPointDetailPane();
      html += '</div>';
    } else {
      html += renderPersonasLeftPane();
      html += '<div class="cp-preview-pane" id="cpPersonaPreview">';
      html += renderPersonaDetailPane();
      html += '</div>';
    }
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
        var collapsed = (S.collapsedGroups || {})['pcat_' + cat.id] || false;

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

    var html = '<div class="cp-persona-item' + sel + '" data-action="select-persona" data-id="' + esc(persona.id) + '">';
    html += '<div class="cp-persona-item-name">' + esc(persona.name || 'Unnamed Persona') + '</div>';
    if (demoStr) html += '<div class="cp-persona-item-demo">' + esc(demoStr) + '</div>';
    html += '<div class="cp-persona-item-badges">';
    if (ppCount > 0) html += '<span class="cp-badge" style="background:#d9302515;color:#d93025">' + icon('bolt') + ' ' + ppCount + '</span>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  // Pain Points pane (used inside the Personas view's Pain Points tab).
  // Mirrors the rich behaviour of the former standalone Pain Points page:
  // search + category filter + group-by toggle, list grouped by category
  // (collapsible) or flat, with persona count badges and inline solution
  // previews.
  function renderPainPointsPaneLeft() {
    var pps = getAllPainPoints();
    var ppFilter = S.painPointFilter || {};
    var filtered = pps.slice();
    if (ppFilter.search) {
      var q = ppFilter.search.toLowerCase();
      filtered = filtered.filter(function(pp) {
        return (pp.pain_point || '').toLowerCase().indexOf(q) > -1 || (pp.solution || '').toLowerCase().indexOf(q) > -1;
      });
    }
    if (ppFilter.category) filtered = filtered.filter(function(pp) { return pp.category === ppFilter.category; });
    var groupBy = ppFilter.groupBy || 'category';

    var html = '<div class="cp-list-pane cp-pp-list-pane">';
    if (filtered.length === 0) {
      html += '<div class="cp-empty-state cp-empty-state--compact"><p>No pain points' + (ppFilter.search || ppFilter.category ? ' match your filters' : ' yet') + '.</p>';
      html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="new-pain-point">' + icon('plus') + ' Create First Pain Point</button></div>';
    } else if (groupBy === 'category') {
      html += renderPainPointListGroupedByCategory(filtered);
    } else {
      html += '<div class="cp-pp-list">';
      for (var i = 0; i < filtered.length; i++) html += renderPainPointListItem(filtered[i]);
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderPainPointListGroupedByCategory(filtered) {
    var grouped = {};
    var uncatId = '__uncat__';
    for (var i = 0; i < filtered.length; i++) {
      var key = filtered[i].category || uncatId;
      (grouped[key] = grouped[key] || []).push(filtered[i]);
    }
    var order = (PAIN_POINT_CATEGORIES || []).map(function(c) { return c.id; });
    order.push(uncatId);

    var html = '';
    for (var oi = 0; oi < order.length; oi++) {
      var catId = order[oi];
      var items = grouped[catId];
      if (!items || items.length === 0) continue;
      var cat = (PAIN_POINT_CATEGORIES || []).find(function(c) { return c.id === catId; });
      var label = cat ? cat.name : 'Uncategorized';
      var collapsed = !!(S.collapsedGroups && S.collapsedGroups['ppcat_' + catId]);

      html += '<div class="cp-pp-group">';
      html += '<div class="cp-pp-group-header" data-action="toggle-pp-group" data-cat-id="' + esc(catId) + '">';
      html += icon(collapsed ? 'chevron-right' : 'chevron-down');
      html += '<span class="cp-pp-group-name">' + esc(label) + '</span>';
      html += '<span class="cp-pp-group-count">' + items.length + '</span>';
      html += '</div>';
      if (!collapsed) {
        html += '<div class="cp-pp-list">';
        for (var k = 0; k < items.length; k++) html += renderPainPointListItem(items[k]);
        html += '</div>';
      }
      html += '</div>';
    }
    return html;
  }

  function renderPainPointListItem(pp) {
    var personaCount = (S.data.personas || []).filter(function(p) { return (p.pain_point_ids || []).indexOf(pp.id) > -1; }).length;
    var sel = S.selectedPainPointId === pp.id ? ' cp-pp-item-selected' : '';
    var hasSolution = !!(pp.solution && pp.solution.trim());

    var html = '<div class="cp-pp-item' + sel + '" data-action="select-pain-point-page" data-id="' + esc(pp.id) + '">';
    html += '<div class="cp-pp-item-main">';
    html += '<div class="cp-pp-item-title">' + esc(truncate(pp.pain_point || '(Empty)', 90)) + '</div>';
    if (hasSolution) {
      html += '<div class="cp-pp-item-solution" title="Solution"><span class="cp-pp-item-solution-icon">' + icon('lightbulb') + '</span>' + esc(truncate(pp.solution, 90)) + '</div>';
    }
    html += '</div>';
    html += '<div class="cp-pp-item-meta">';
    if (personaCount > 0) html += '<span class="cp-pp-mini-stat" title="Linked personas">' + icon('users') + ' ' + personaCount + '</span>';
    if (!hasSolution) html += '<span class="cp-pp-mini-stat cp-pp-mini-warn" title="No solution defined">' + icon('triangle-exclamation') + '</span>';
    html += '</div>';
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

    var linkedPersonas = (S.data.personas || []).filter(function(p) { return (p.pain_point_ids || []).indexOf(pp.id) > -1; });
    var unlinkedPersonas = (S.data.personas || []).filter(function(p) { return (p.pain_point_ids || []).indexOf(pp.id) === -1; });

    var html = '<div class="cp-detail-header"><div class="cp-detail-header-left">';
    html += '<h2>' + icon('bolt') + ' Pain Point</h2>';
    if (catLabel) html += '<span class="cp-badge" style="background:#d9302515;color:#d93025">' + esc(catLabel) + '</span>';
    html += '</div><div class="cp-detail-header-right">';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="delete-pain-point" data-id="' + esc(pp.id) + '">' + icon('trash') + ' Delete</button>';
    html += '</div></div>';

    html += '<div class="cp-card cp-pp-detail-card">';
    html += '<div class="cp-section-header"><h3>' + icon('triangle-exclamation') + ' Pain Point</h3></div>';
    html += '<textarea class="cp-textarea cp-pp-inline-field" data-ppfield="pain_point" rows="3">' + esc(pp.pain_point || '') + '</textarea>';
    html += '</div>';

    html += '<div class="cp-card cp-pp-detail-card cp-pp-detail-solution">';
    html += '<div class="cp-section-header"><h3 style="color:var(--cp-success)">' + icon('lightbulb') + ' Solution</h3></div>';
    html += '<textarea class="cp-textarea cp-pp-inline-field" data-ppfield="solution" rows="3" placeholder="How does your product solve this?">' + esc(pp.solution || '') + '</textarea>';
    html += '</div>';

    html += '<div class="cp-card cp-pp-detail-card">';
    html += '<div class="cp-form-group"><label class="cp-field-label">Category</label>';
    html += '<select class="cp-select cp-pp-inline-field" data-ppfield="category">';
    html += '<option value="">None</option>';
    for (var ci = 0; ci < ppCats.length; ci++) {
      html += '<option value="' + esc(ppCats[ci].id) + '"' + (pp.category === ppCats[ci].id ? ' selected' : '') + '>' + esc(ppCats[ci].name) + '</option>';
    }
    html += '</select></div></div>';

    // Linked Personas
    html += '<div class="cp-card cp-pp-detail-card">';
    html += '<div class="cp-section-header"><h3>' + icon('users') + ' Linked Personas (' + linkedPersonas.length + ')</h3>';
    if (unlinkedPersonas.length > 0) html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="link-pp-to-personas" data-pp-id="' + esc(pp.id) + '">' + icon('link') + ' Link to Personas</button>';
    html += '</div>';
    if (linkedPersonas.length === 0) {
      html += '<p class="cp-text-muted">Not linked to any personas yet.' + (unlinkedPersonas.length > 0 ? ' Click "Link to Personas" above.' : '') + '</p>';
    } else {
      for (var pi = 0; pi < linkedPersonas.length; pi++) {
        html += '<div class="cp-list-item-inline">';
        html += '<span style="flex:1;cursor:pointer" data-action="select-persona-from-pp" data-persona-id="' + esc(linkedPersonas[pi].id) + '">' + dimensionBadge('persona', linkedPersonas[pi].id) + '</span>';
        html += '<button class="cp-btn-icon cp-btn-xs" data-action="unlink-pp-from-persona" data-pp-id="' + esc(pp.id) + '" data-persona-id="' + esc(linkedPersonas[pi].id) + '" title="Unlink">' + icon('link-slash') + '</button>';
        html += '</div>';
      }
    }
    html += '</div>';

    // Workspace usage (meta_v2)
    if (typeof renderLibraryWorkspaceUsage === 'function') {
      html += renderLibraryWorkspaceUsage('pain_point', pp.id);
    }

    html += '<div class="cp-detail-footer"><span class="cp-text-muted">Created ' + formatDate(pp.created) + (pp.updated ? ' · Updated ' + formatRelativeTime(pp.updated) : '') + '</span></div>';
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

    var html = '<div class="cp-persona-detail">';

    // Header
    html += '<div class="cp-persona-detail-header">';
    html += '<div class="cp-persona-detail-icon">' + icon('user') + '</div>';
    html += '<div class="cp-persona-detail-info">';
    html += '<h2>' + esc(p.name || 'Unnamed Persona') + '</h2>';
    html += '<div class="cp-text-muted">';
    if (cat) html += 'Category: ' + esc(cat.name) + ' · ';
    html += 'Created ' + formatDate(p.created);
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

    // Workspace usage (only when meta_v2 is on)
    html += renderLibraryWorkspaceUsage('persona', p.id);

    html += '</div>';
    return html;
  }


/* ===== src/10-part1/12-view-messages.js ===== */
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

    // Footer: hooks
    html += '<div class="cp-message-card-footer">';
    if (hookCount > 0) html += '<span class="cp-badge" style="background:#9334e915;color:#9334e9">' + icon('anchor') + ' ' + hookCount + ' hook' + (hookCount !== 1 ? 's' : '') + '</span>';
    html += '</div>';

    html += '</div>';
    return html;
  }


/* ===== src/10-part1/13-view-styles.js ===== */
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

    // Tags
    if ((format.tags || []).length > 0) {
      html += '<div class="cp-format-card-tags">';
      for (var ti = 0; ti < format.tags.length; ti++) {
        var tag = S.tagMap[format.tags[ti]];
        if (tag) html += '<span class="cp-badge" style="background:' + tag.color + '15;color:' + tag.color + '">' + esc(tag.name) + '</span>';
      }
      html += '</div>';
    }

    html += '</div>';
    return html;
  }


/* ===== src/10-part1/15-view-formats.js ===== */
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


/* ===== src/10-part1/17a-view-meta-campaigns.js ===== */
  // ============================================================
  // SECTION 15B: META CAMPAIGNS LIST VIEW (v2)
  // ============================================================
  //
  // Lists campaigns_v2[] in a card grid. Each card is a click-target into
  // the Campaign Workspace. Visible when S.meta.setup.meta_v2 === true.

  function renderMetaCampaignsView() {
    var camps = getAllCampaignsV2();
    var f = S.campaignV2Filter || (S.campaignV2Filter = { search: '', status: '', objective: '' });

    var filtered = camps.slice();
    if (f.search) {
      var q = f.search.toLowerCase();
      filtered = filtered.filter(function(c) {
        return (c.name || '').toLowerCase().indexOf(q) > -1 ||
               (c.description || '').toLowerCase().indexOf(q) > -1;
      });
    }
    if (f.status)    filtered = filtered.filter(function(c) { return c.status === f.status; });
    if (f.objective) filtered = filtered.filter(function(c) { return c.objective === f.objective; });
    filtered.sort(function(a, b) { return (b.updated || b.created || '') > (a.updated || a.created || '') ? 1 : -1; });

    var html = '<div class="cp-view cp-view-meta-campaigns">';
    html += '<div class="cp-view-header"><div class="cp-view-header-left">';
    html += '<h1>' + icon('bullhorn') + ' Campaigns</h1>';
    html += '<span class="cp-view-subtitle">' + filtered.length + ' campaign' + (filtered.length !== 1 ? 's' : '') + ' · Meta-native structure</span>';
    html += '</div><div class="cp-view-header-right">';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="v2-export-open">' + icon('download') + ' Export all</button>';
    html += '<button class="cp-btn cp-btn-ai cp-btn-sm" data-action="new-campaign-v2">' + icon('wand-magic') + ' New Campaign</button>';
    html += '</div></div>';

    // Toolbar
    html += '<div class="cp-list-toolbar"><div class="cp-list-toolbar-row">';
    html += '<div class="cp-search-wrapper">' + icon('search') + '<input type="text" class="cp-input" id="cpCampaignV2Search" placeholder="Search campaigns..." value="' + esc(f.search) + '"></div>';
    html += '<select class="cp-select cp-select-sm" id="cpCampaignV2StatusFilter" style="width:auto;min-width:110px"><option value="">All statuses</option>';
    for (var sk in META_CAMPAIGN_STATUSES) {
      html += '<option value="' + sk + '"' + (f.status === sk ? ' selected' : '') + '>' + META_CAMPAIGN_STATUSES[sk].label + '</option>';
    }
    html += '</select>';
    html += '<select class="cp-select cp-select-sm" id="cpCampaignV2ObjectiveFilter" style="width:auto;min-width:140px"><option value="">All objectives</option>';
    for (var ok in META_OBJECTIVES) {
      html += '<option value="' + ok + '"' + (f.objective === ok ? ' selected' : '') + '>' + META_OBJECTIVES[ok].label + '</option>';
    }
    html += '</select>';
    html += '</div></div>';

    if (filtered.length === 0) {
      html += '<div class="cp-empty-state">';
      html += '<div class="cp-empty-state-icon">' + icon('bullhorn') + '</div>';
      if (camps.length === 0) {
        html += '<div class="cp-empty-state-title">No campaigns yet</div>';
        html += '<div class="cp-empty-state-text">Open the New Campaign wizard — write a brief, let AI draft the basics, then select Ad Sets and Ads.</div>';
        html += '<div style="display:flex;gap:var(--cp-space-2);justify-content:center;margin-top:var(--cp-space-3)">';
        html += '<button class="cp-btn cp-btn-ai" data-action="new-campaign-v2">' + icon('wand-magic') + ' New Campaign</button>';
        html += '</div>';
      } else {
        html += '<div class="cp-empty-state-title">No campaigns match</div>';
        html += '<div class="cp-empty-state-text">Try clearing your filters.</div>';
      }
      html += '</div></div>';
      return html;
    }

    // Card grid
    html += '<div class="cp-meta-camp-grid">';
    for (var i = 0; i < filtered.length; i++) html += renderMetaCampaignCard(filtered[i]);
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderMetaCampaignCard(camp) {
    var status = metaCampaignStatus(camp.status);
    var objective = metaObjective(camp.objective);
    var sets = getAdSetsByCampaign(camp.id);
    var ads = getAdsByCampaign(camp.id);

    // Per-status counts across ads in this campaign
    var statusCounts = {};
    ads.forEach(function(a) { statusCounts[a.pipeline_status] = (statusCounts[a.pipeline_status] || 0) + 1; });
    var readyCount = (statusCounts.approved || 0) + (statusCounts.live || 0);
    var progressPct = ads.length > 0 ? Math.round((readyCount / ads.length) * 100) : 0;

    var html = '<div class="cp-meta-camp-card" data-action="open-campaign-v2" data-id="' + esc(camp.id) + '">';

    // Header row
    html += '<div class="cp-meta-camp-card-header">';
    html += '<div class="cp-meta-camp-card-title">' + esc(camp.name || 'Untitled') + '</div>';
    html += '<span class="cp-badge" style="background:' + status.color + '15;color:' + status.color + '">' + icon(status.icon) + ' ' + esc(status.label) + '</span>';
    html += '</div>';

    // Description
    if (camp.description) {
      html += '<div class="cp-meta-camp-card-desc">' + esc(truncate(camp.description, 140)) + '</div>';
    }

    // Meta row
    html += '<div class="cp-meta-camp-card-meta">';
    if (objective) html += '<span class="cp-meta-camp-tag">' + icon(objective.icon) + ' ' + esc(objective.label) + '</span>';
    var bm = META_BUDGET_MODES[camp.budget_mode];
    if (bm) html += '<span class="cp-meta-camp-tag">' + icon('dollar-sign') + ' ' + esc(bm.short) + '</span>';
    if (camp.daily_budget)    html += '<span class="cp-meta-camp-tag">' + formatCurrency(camp.daily_budget) + '/d</span>';
    if (camp.lifetime_budget) html += '<span class="cp-meta-camp-tag">' + formatCurrency(camp.lifetime_budget) + ' lifetime</span>';
    if (camp.ab_test && camp.ab_test.enabled) html += '<span class="cp-meta-camp-tag cp-meta-camp-tag-ab">' + icon('flask') + ' A/B</span>';
    html += '</div>';

    // Children summary
    html += '<div class="cp-meta-camp-card-children">';
    html += '<div class="cp-meta-camp-card-stat"><span class="cp-meta-camp-card-stat-value">' + sets.length + '</span> <span class="cp-meta-camp-card-stat-label">Ad Set' + (sets.length !== 1 ? 's' : '') + '</span></div>';
    html += '<div class="cp-meta-camp-card-stat"><span class="cp-meta-camp-card-stat-value">' + ads.length + '</span> <span class="cp-meta-camp-card-stat-label">Ad' + (ads.length !== 1 ? 's' : '') + '</span></div>';
    if (ads.length > 0) html += '<div class="cp-meta-camp-card-stat"><span class="cp-meta-camp-card-stat-value" style="color:var(--cp-success)">' + progressPct + '%</span> <span class="cp-meta-camp-card-stat-label">Approved</span></div>';
    html += '</div>';

    // Footer
    html += '<div class="cp-meta-camp-card-footer">';
    html += '<span class="cp-text-muted">Updated ' + formatRelativeTime(camp.updated || camp.created) + '</span>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="open-campaign-v2" data-id="' + esc(camp.id) + '">Open ' + icon('arrow-right') + '</button>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  // Minimal currency formatter; respects S.meta.meta_defaults.currency.
  function formatCurrency(amount) {
    if (amount == null || amount === '') return '';
    var ccy = (S.meta && S.meta.meta_defaults && S.meta.meta_defaults.currency) || 'USD';
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: ccy, maximumFractionDigits: 0 }).format(Number(amount));
    } catch (_) {
      return ccy + ' ' + amount;
    }
  }

/* ===== src/10-part1/17b-view-campaign-workspace.js ===== */
  // ============================================================
  // SECTION 15C: CAMPAIGN WORKSPACE VIEW (v2)
  // ============================================================
  //
  // Two-pane layout: left = Campaign tree (Campaign → Ad Sets → Ads),
  // right = inspector for the currently-selected node. Selection is driven
  // by S.selectedCampaignV2Id, S.selectedAdSetId, S.selectedAdId.

  function renderCampaignWorkspaceView() {
    var camp = S.campaignV2Map[S.selectedCampaignV2Id];

    // Fallback: if no campaign selected, redirect to list view
    if (!camp) {
      return '<div class="cp-view cp-view-workspace">' +
        '<div class="cp-empty-state cp-empty-state--center">' +
        '<div class="cp-empty-state-icon">' + icon('bullhorn') + '</div>' +
        '<div class="cp-empty-state-title">Pick a campaign to start</div>' +
        '<div class="cp-empty-state-text">Open the Campaigns list and select one, or create a new campaign.</div>' +
        '<div style="display:flex;gap:var(--cp-space-2);justify-content:center;margin-top:var(--cp-space-3)">' +
        '<button class="cp-btn cp-btn-outline" data-action="go-view" data-view="meta_campaigns">' + icon('arrow-left') + ' Campaigns</button>' +
        '<button class="cp-btn cp-btn-primary" data-action="new-campaign-v2">' + icon('plus') + ' New Campaign</button>' +
        '</div></div></div>';
    }

    var html = '<div class="cp-view cp-view-workspace">';

    // Workspace header — breadcrumbs + actions
    html += renderWorkspaceBreadcrumbs(camp);

    // Two-pane body
    html += '<div class="cp-workspace-body">';
    html += '<div class="cp-workspace-tree-pane">' + renderWorkspaceTree(camp) + '</div>';
    html += '<div class="cp-workspace-inspector-pane">' + renderWorkspaceInspector(camp) + '</div>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderWorkspaceBreadcrumbs(camp) {
    var adSet = S.adSetMap[S.selectedAdSetId];
    var ad = S.adMap[S.selectedAdId];

    var html = '<div class="cp-workspace-breadcrumbs">';
    html += '<a class="cp-workspace-breadcrumb" data-action="go-view" data-view="meta_campaigns" href="#meta_campaigns">' + icon('bullhorn') + ' Campaigns</a>';
    html += '<span class="cp-workspace-breadcrumb-sep">' + icon('chevron-right') + '</span>';
    html += '<a class="cp-workspace-breadcrumb cp-workspace-breadcrumb-current" data-action="ws-select-campaign" data-id="' + esc(camp.id) + '">' + esc(camp.name || 'Untitled') + '</a>';
    if (adSet) {
      html += '<span class="cp-workspace-breadcrumb-sep">' + icon('chevron-right') + '</span>';
      html += '<a class="cp-workspace-breadcrumb' + (!ad ? ' cp-workspace-breadcrumb-current' : '') + '" data-action="ws-select-ad-set" data-id="' + esc(adSet.id) + '">' + esc(adSet.name || 'Ad Set') + '</a>';
    }
    if (ad) {
      html += '<span class="cp-workspace-breadcrumb-sep">' + icon('chevron-right') + '</span>';
      html += '<span class="cp-workspace-breadcrumb cp-workspace-breadcrumb-current">' + esc(ad.name || 'Ad') + '</span>';
    }
    html += '</div>';
    return html;
  }

  function renderWorkspaceTree(camp) {
    var html = '';
    var sets = getAdSetsByCampaign(camp.id);
    var collapsed = S.workspaceTreeCollapsed || (S.workspaceTreeCollapsed = {});

    // Tree toolbar
    html += '<div class="cp-tree-toolbar">';
    html += '<div class="cp-tree-toolbar-title">' + icon('sitemap') + ' Tree</div>';
    html += '<button class="cp-btn-icon cp-btn-icon-sm" data-action="ws-add-ad-set" data-campaign-id="' + esc(camp.id) + '" title="Add Ad Set">' + icon('plus') + '</button>';
    html += '</div>';

    // Campaign node (root)
    var campSelected = (!S.selectedAdSetId && !S.selectedAdId);
    var campStatus = metaCampaignStatus(camp.status);
    html += '<div class="cp-tree-node cp-tree-node-campaign' + (campSelected ? ' cp-tree-node-selected' : '') + '" data-action="ws-select-campaign" data-id="' + esc(camp.id) + '">';
    html += '<span class="cp-tree-node-icon">' + icon('bullhorn') + '</span>';
    html += '<span class="cp-tree-node-label">' + esc(camp.name || 'Untitled') + '</span>';
    html += '<span class="cp-tree-node-meta">';
    html += '<span class="cp-tree-status-dot" style="background:' + campStatus.color + '" title="' + esc(campStatus.label) + '"></span>';
    html += '<span class="cp-tree-node-count">' + sets.length + '</span>';
    html += '</span>';
    html += '</div>';

    // Ad Set nodes
    if (sets.length === 0) {
      html += '<div class="cp-tree-empty-hint">';
      html += icon('arrow-down') + ' No Ad Sets yet. ';
      html += '<a href="#" data-action="ws-add-ad-set" data-campaign-id="' + esc(camp.id) + '">Add one</a>';
      html += '</div>';
    } else {
      for (var i = 0; i < sets.length; i++) html += renderTreeAdSetNode(sets[i], collapsed);
    }

    return html;
  }

  function renderTreeAdSetNode(adSet, collapsed) {
    var ads = getAdsByAdSet(adSet.id);
    var isCollapsed = !!collapsed[adSet.id];
    var setSelected = (S.selectedAdSetId === adSet.id && !S.selectedAdId);
    var setStatus = metaAdSetStatus(adSet.status);
    var persona = S.personaMap[adSet.persona_id];

    var html = '<div class="cp-tree-branch">';

    html += '<div class="cp-tree-node cp-tree-node-ad-set' + (setSelected ? ' cp-tree-node-selected' : '') + '" data-action="ws-select-ad-set" data-id="' + esc(adSet.id) + '">';
    html += '<button class="cp-tree-toggle' + (isCollapsed ? ' cp-tree-toggle-collapsed' : '') + '" data-action="ws-toggle-tree" data-id="' + esc(adSet.id) + '">' + icon(isCollapsed ? 'chevron-right' : 'chevron-down') + '</button>';
    html += '<span class="cp-tree-node-icon">' + icon('crosshairs') + '</span>';
    html += '<span class="cp-tree-node-label">' + esc(adSet.name || 'Ad Set') + '</span>';
    if (adSet.ab_role) {
      var ab = META_AB_ROLES[adSet.ab_role];
      if (ab) html += '<span class="cp-tree-ab-pill" style="background:' + ab.color + '15;color:' + ab.color + '">' + esc(ab.label) + '</span>';
    }
    html += '<span class="cp-tree-node-meta">';
    if (persona) html += '<span class="cp-tree-node-sub" title="Persona">' + icon('user') + ' ' + esc(truncate(persona.name, 14)) + '</span>';
    html += '<span class="cp-tree-status-dot" style="background:' + setStatus.color + '" title="' + esc(setStatus.label) + '"></span>';
    html += '<span class="cp-tree-node-count">' + ads.length + '</span>';
    html += '</span>';
    html += '</div>';

    // Children (ads)
    if (!isCollapsed) {
      html += '<div class="cp-tree-children">';
      for (var i = 0; i < ads.length; i++) html += renderTreeAdNode(ads[i]);
      html += '<button class="cp-tree-add-child" data-action="ws-add-ad" data-ad-set-id="' + esc(adSet.id) + '">' + icon('plus') + ' Add Ad</button>';
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  function renderTreeAdNode(ad) {
    var selected = (S.selectedAdId === ad.id);
    var status = metaAdStatus(ad.pipeline_status);
    var ctype = META_AD_CREATIVE_TYPES[ad.creative_type] || { icon: 'rectangle-ad' };

    var html = '<div class="cp-tree-node cp-tree-node-ad' + (selected ? ' cp-tree-node-selected' : '') + '" data-action="ws-select-ad" data-id="' + esc(ad.id) + '">';
    html += '<span class="cp-tree-node-icon">' + icon(ctype.icon) + '</span>';
    html += '<span class="cp-tree-node-label">' + esc(ad.name || 'Ad') + '</span>';
    html += '<span class="cp-tree-node-meta">';
    html += '<span class="cp-tree-status-dot" style="background:' + status.color + '" title="' + esc(status.label) + '"></span>';
    html += '</span>';
    html += '</div>';
    return html;
  }

  // --- Inspector ---

  function renderWorkspaceInspector(camp) {
    if (S.selectedAdId) {
      var ad = S.adMap[S.selectedAdId];
      if (ad) return renderInspectorForAdTabbed(ad);
    }
    if (S.selectedAdSetId) {
      var adSet = S.adSetMap[S.selectedAdSetId];
      if (adSet) return renderInspectorForAdSetTabbed(adSet);
    }
    return renderInspectorForCampaign(camp);
  }

  function renderInspectorForCampaign(camp) {
    var status = metaCampaignStatus(camp.status);
    var objective = metaObjective(camp.objective) || { label: '—' };
    var buying = META_BUYING_TYPES[camp.buying_type] || { label: '—' };
    var budgetMode = META_BUDGET_MODES[camp.budget_mode] || { label: '—' };
    var bid = META_BID_STRATEGIES[camp.bid_strategy] || { label: '—' };
    var sets = getAdSetsByCampaign(camp.id);
    var ads = getAdsByCampaign(camp.id);

    var html = '';
    html += '<div class="cp-inspector-header"><div>';
    html += '<div class="cp-inspector-eyebrow">' + icon('bullhorn') + ' Campaign</div>';
    html += '<h2 class="cp-inspector-title">' + esc(camp.name) + '</h2>';
    html += '<div style="display:flex;gap:var(--cp-space-2);flex-wrap:wrap;margin-top:6px">';
    html += '<span class="cp-badge" style="background:' + status.color + '15;color:' + status.color + '">' + icon(status.icon) + ' ' + esc(status.label) + '</span>';
    html += '<span class="cp-badge" style="background:#1a73e815;color:#1a73e8">' + esc(objective.label) + '</span>';
    if (camp.ab_test && camp.ab_test.enabled) html += '<span class="cp-badge" style="background:#9334e915;color:#9334e9">' + icon('flask') + ' A/B</span>';
    html += '</div>';
    html += '</div><div class="cp-inspector-header-actions">';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="edit-campaign-v2" data-id="' + esc(camp.id) + '">' + icon('edit') + ' Edit</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="delete-campaign-v2" data-id="' + esc(camp.id) + '">' + icon('trash') + '</button>';
    html += '</div></div>';

    // Stats strip
    html += '<div class="cp-inspector-stats">';
    html += '<div class="cp-inspector-stat"><div class="cp-inspector-stat-value">' + sets.length + '</div><div class="cp-inspector-stat-label">Ad Sets</div></div>';
    html += '<div class="cp-inspector-stat"><div class="cp-inspector-stat-value">' + ads.length + '</div><div class="cp-inspector-stat-label">Ads</div></div>';
    var live = ads.filter(function(a) { return a.pipeline_status === 'live'; }).length;
    var approved = ads.filter(function(a) { return a.pipeline_status === 'approved'; }).length;
    html += '<div class="cp-inspector-stat"><div class="cp-inspector-stat-value" style="color:var(--cp-success)">' + approved + '</div><div class="cp-inspector-stat-label">Approved</div></div>';
    html += '<div class="cp-inspector-stat"><div class="cp-inspector-stat-value" style="color:#0891b2">' + live + '</div><div class="cp-inspector-stat-label">Live</div></div>';
    html += '</div>';

    // Empty-campaign CTA — campaigns created from the setup wizard start empty
    // (no Ad Sets, no Ads). The per-campaign wizard fills them out.
    if (sets.length === 0) {
      html += '<div class="cp-inspector-section cp-empty-campaign-cta" style="background:linear-gradient(135deg,#f0f7ff 0%,#fff7e6 100%);border:1px dashed var(--cp-primary,#1a73e8);border-radius:var(--cp-radius-md);padding:var(--cp-space-4);margin-top:var(--cp-space-3)">';
      html += '<div style="display:flex;align-items:flex-start;gap:var(--cp-space-3)">';
      html += '<div style="font-size:32px;line-height:1">' + icon('rocket') + '</div>';
      html += '<div style="flex:1">';
      html += '<div style="font-weight:600;font-size:var(--cp-font-size-base);margin-bottom:var(--cp-space-1)">This campaign is empty.</div>';
      html += '<div class="cp-text-muted" style="font-size:var(--cp-font-size-sm);margin-bottom:var(--cp-space-3)">Run the AI setup for this campaign to generate Ad Sets and Ads from your brief, or add them manually.</div>';
      html += '<div style="display:flex;gap:var(--cp-space-2);flex-wrap:wrap">';
      html += '<button class="cp-btn cp-btn-ai" data-action="ai-suggest-ad-sets" data-campaign-id="' + esc(camp.id) + '">' + icon('sparkles') + ' AI Setup for this campaign</button>';
      html += '<button class="cp-btn cp-btn-outline" data-action="ws-add-ad-set" data-campaign-id="' + esc(camp.id) + '">' + icon('plus') + ' Add Ad Set manually</button>';
      html += '</div>';
      html += '</div></div></div>';
    }

    // Description
    if (camp.description) {
      html += '<div class="cp-inspector-section"><p>' + esc(camp.description) + '</p></div>';
    }

    // Meta-shaped settings grid
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('gear') + ' Campaign settings</div>';
    html += '<div class="cp-inspector-grid">';
    html += inspectorField('Objective', objective.label);
    html += inspectorField('Buying type', buying.label);
    html += inspectorField('Budget mode', budgetMode.label);
    html += inspectorField('Bid strategy', bid.label);
    html += inspectorField('Daily budget', camp.daily_budget ? formatCurrency(camp.daily_budget) : '—');
    html += inspectorField('Lifetime budget', camp.lifetime_budget ? formatCurrency(camp.lifetime_budget) : '—');
    html += inspectorField('Spend cap', camp.spend_cap ? formatCurrency(camp.spend_cap) : '—');
    html += inspectorField('Schedule', renderScheduleSummary(camp.start_time, camp.stop_time));
    var cats = (camp.special_ad_categories || []).filter(function(c) { return c && c !== 'NONE'; });
    html += inspectorField('Special ad categories', cats.length ? cats.map(function(k) { return (META_SPECIAL_AD_CATEGORIES[k] || {}).label || k; }).join(', ') : 'None');
    html += '</div></div>';

    // Brief
    if (camp.brief || camp.ai_instructions) {
      html += '<div class="cp-inspector-section">';
      if (camp.brief) {
        html += '<div class="cp-inspector-section-title">' + icon('file-lines') + ' Brief</div>';
        html += '<p>' + esc(camp.brief) + '</p>';
      }
      if (camp.ai_instructions) {
        html += '<div class="cp-inspector-section-title" style="margin-top:var(--cp-space-3)">' + icon('sparkles') + ' AI instructions</div>';
        html += '<p>' + esc(camp.ai_instructions) + '</p>';
      }
      html += '</div>';
    }

    // A/B test summary section
    html += renderCampaignABSection(camp);

    // Quick actions
    html += '<div class="cp-inspector-actions">';
    html += '<button class="cp-btn cp-btn-primary" data-action="ws-add-ad-set" data-campaign-id="' + esc(camp.id) + '">' + icon('plus') + ' Add Ad Set</button>';
    html += '<button class="cp-btn cp-btn-ai" data-action="ai-suggest-ad-sets" data-campaign-id="' + esc(camp.id) + '">' + icon('sparkles') + ' Suggest Ad Sets</button>';
    html += '<button class="cp-btn cp-btn-outline" data-action="ws-ab-config" data-id="' + esc(camp.id) + '">' + icon('flask') + ' A/B test setup</button>';
    html += '<button class="cp-btn cp-btn-outline" data-action="v2-export-open" data-campaign-id="' + esc(camp.id) + '">' + icon('download') + ' Export</button>';
    html += '</div>';

    return html;
  }

  function renderCampaignABSection(camp) {
    var ab = camp.ab_test || {};
    if (!ab.enabled || !(ab.variants || []).length) return '';
    var metric = (Constants.META_AB_METRICS[ab.primary_metric] || {}).label || '—';
    var winner = (ab.variants || []).find(function(v) { return v.winner; });
    var winnerSet = winner ? S.adSetMap[winner.ad_set_id] : null;

    var html = '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('flask') + ' A/B test';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="ws-ab-compare" data-id="' + esc(camp.id) + '" style="margin-left:auto">' + icon('arrows-up-down-left-right') + ' Compare variants</button>';
    html += '</div>';
    html += '<div class="cp-inspector-grid">';
    html += inspectorField('Primary metric', metric);
    html += inspectorField('Variants', String((ab.variants || []).length));
    if (winnerSet) html += inspectorField('Winner', winnerSet.name);
    html += '</div>';
    html += '</div>';
    return html;
  }

  function renderInspectorForAdSet(adSet) {
    var camp = S.campaignV2Map[adSet.campaign_id];
    var status = metaAdSetStatus(adSet.status);
    var goal = metaOptimizationGoal(adSet.optimization_goal) || { label: '—' };
    var billing = metaBillingEvent(adSet.billing_event) || { label: '—' };
    var persona = S.personaMap[adSet.persona_id];
    var ads = getAdsByAdSet(adSet.id);

    var html = '';
    html += '<div class="cp-inspector-header"><div>';
    html += '<div class="cp-inspector-eyebrow">' + icon('crosshairs') + ' Ad Set' + (camp ? ' · ' + esc(camp.name) : '') + '</div>';
    html += '<h2 class="cp-inspector-title">' + esc(adSet.name) + '</h2>';
    html += '<div style="display:flex;gap:var(--cp-space-2);flex-wrap:wrap;margin-top:6px">';
    html += '<span class="cp-badge" style="background:' + status.color + '15;color:' + status.color + '">' + icon(status.icon) + ' ' + esc(status.label) + '</span>';
    if (adSet.ab_role) {
      var ab = META_AB_ROLES[adSet.ab_role];
      if (ab) html += '<span class="cp-badge" style="background:' + ab.color + '15;color:' + ab.color + '">' + icon('flask') + ' ' + esc(ab.label) + '</span>';
    }
    html += '</div></div><div class="cp-inspector-header-actions">';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="edit-ad-set" data-id="' + esc(adSet.id) + '">' + icon('edit') + ' Edit</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="delete-ad-set" data-id="' + esc(adSet.id) + '">' + icon('trash') + '</button>';
    html += '</div></div>';

    // Stats
    html += '<div class="cp-inspector-stats">';
    html += '<div class="cp-inspector-stat"><div class="cp-inspector-stat-value">' + ads.length + '</div><div class="cp-inspector-stat-label">Ads</div></div>';
    var approved = ads.filter(function(a) { return a.pipeline_status === 'approved' || a.pipeline_status === 'live'; }).length;
    html += '<div class="cp-inspector-stat"><div class="cp-inspector-stat-value" style="color:var(--cp-success)">' + approved + '</div><div class="cp-inspector-stat-label">Approved+Live</div></div>';
    html += '</div>';

    // Audience
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('users') + ' Audience</div>';
    if (persona) {
      html += '<div class="cp-inspector-persona-card">';
      html += '<div class="cp-inspector-persona-name">' + icon('user') + ' ' + esc(persona.name) + '</div>';
      if (persona.description) html += '<div class="cp-inspector-persona-desc">' + esc(truncate(persona.description, 200)) + '</div>';
      html += '</div>';
    } else {
      html += '<div class="cp-text-muted">No persona linked. <a href="#" data-action="edit-ad-set" data-id="' + esc(adSet.id) + '">Add one</a>.</div>';
    }
    if (adSet.audience_overrides) {
      html += '<div class="cp-inspector-grid" style="margin-top:var(--cp-space-2)">';
      html += inspectorField('Audience overrides', adSet.audience_overrides);
      html += '</div>';
    }
    html += '</div>';

    // Placements
    var placements = adSet.placements || { advantage_enabled: true, custom_placements: [] };
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('object-group') + ' Placements</div>';
    if (placements.advantage_enabled) {
      html += '<span class="cp-badge" style="background:#9334e915;color:#9334e9">' + icon('sparkles') + ' Advantage Placements (auto)</span>';
    } else if ((placements.custom_placements || []).length) {
      html += '<div style="display:flex;flex-wrap:wrap;gap:6px">';
      placements.custom_placements.forEach(function(pk) {
        var p = META_PLACEMENTS[pk];
        if (p) html += '<span class="cp-badge">' + esc(p.label) + '</span>';
      });
      html += '</div>';
    } else {
      html += '<span class="cp-text-muted">No placements selected.</span>';
    }
    html += '</div>';

    // Optimization
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('bullseye-arrow') + ' Optimization & delivery</div>';
    html += '<div class="cp-inspector-grid">';
    html += inspectorField('Optimization goal', goal.label);
    html += inspectorField('Billing event', billing.label);
    var attr = META_ATTRIBUTION_SETTINGS[adSet.attribution_setting];
    html += inspectorField('Attribution', attr ? attr.label : '—');
    html += inspectorField('Bid amount', adSet.bid_amount ? formatCurrency(adSet.bid_amount) : '—');
    html += inspectorField('Daily budget',    adSet.daily_budget    ? formatCurrency(adSet.daily_budget)    : '— (CBO)');
    html += inspectorField('Lifetime budget', adSet.lifetime_budget ? formatCurrency(adSet.lifetime_budget) : '—');
    html += inspectorField('Schedule', renderScheduleSummary(adSet.start_time, adSet.stop_time));
    html += '</div></div>';

    // Brief preview (Stage 2 builds the editor)
    var brief = adSet.brief || {};
    var hasBrief = brief.creative_direction || (brief.message_ids || []).length || (brief.style_ids || []).length || (brief.format_ids || []).length || (brief.hook_angles || []).length;
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('file-lines') + ' Creative brief';
    html += '<span class="cp-text-muted" style="font-weight:400;font-size:11px;margin-left:8px">strategic layer</span>';
    html += '</div>';
    if (hasBrief) {
      if (brief.creative_direction) html += '<p>' + esc(brief.creative_direction) + '</p>';
      if ((brief.message_ids || []).length) {
        html += '<div class="cp-inspector-chip-row"><span class="cp-inspector-chip-label">Messages</span>';
        brief.message_ids.forEach(function(id) { var m = S.messageMap[id]; if (m) html += '<span class="cp-badge">' + esc(m.title) + '</span>'; });
        html += '</div>';
      }
      if ((brief.hook_angles || []).length) {
        html += '<div class="cp-inspector-chip-row"><span class="cp-inspector-chip-label">Hook angles</span>';
        brief.hook_angles.forEach(function(t) { html += '<span class="cp-badge">' + esc(t) + '</span>'; });
        html += '</div>';
      }
    } else {
      html += '<div class="cp-text-muted">No brief yet. Brief editor lands in Stage 2.</div>';
    }
    html += '</div>';

    // Quick actions
    html += '<div class="cp-inspector-actions">';
    html += '<button class="cp-btn cp-btn-primary" data-action="ws-add-ad" data-ad-set-id="' + esc(adSet.id) + '">' + icon('plus') + ' Add Ad</button>';
    html += '<button class="cp-btn cp-btn-ai" data-action="ai-suggest-ads" data-ad-set-id="' + esc(adSet.id) + '">' + icon('sparkles') + ' Suggest Ads</button>';
    html += '</div>';

    return html;
  }

  // --- Ad Overview tab ---
  //
  // Layout intent: this Overview is a CONFIGURATION + WALKTHROUGH panel
  // for the ad's production pipeline. It is NOT a static read-only dump.
  //
  // Inline-editable here:
  //   - name, creative_type, pipeline_status, assigned_to, due_date, tags
  // Read-only "summary card" here, edited in the matching tab:
  //   - Hook content (→ Hook tab)
  //   - Copy content (→ Copy tab)
  //   - Media direction (→ Media tab)
  //   - Review notes / production notes (→ Review tab)
  //
  // Each summary card carries a status pill (filled / partial / empty)
  // and a CTA that switches the inspector to the matching tab via
  // data-action="set-inspector-tab" data-tab="<key>" (existing handler
  // at src/20-part2a/27-event-handlers.js:723-727).

  function renderInspectorForAd(ad) {
    // Identity (name, type, status, actions) renders persistently in
    // `renderAdInspectorHeader` above the workflow tabs — no duplicate here.
    var adSet = S.adSetMap[ad.ad_set_id];
    var camp = adSet ? S.campaignV2Map[adSet.campaign_id] : null;
    var ctype = META_AD_CREATIVE_TYPES[ad.creative_type] || { label: 'Ad', icon: 'rectangle-ad' };

    var html = '';
    html += _renderAdOverviewConfig(ad);
    html += _renderAdOverviewHeadlineDestination(ad);
    html += _renderAdSummaryHook(ad);
    html += _renderAdSummaryMedia(ad, ctype);
    html += _renderAdOverviewAssignment(ad);
    html += _renderAdSummaryReview(ad);
    html += _renderAdOverviewFooter(ad);
    return html;
  }

  // Editable supporting copy fields. These used to live in the Copy tab but
  // the Copy tab is now scoped to the primary text only — headline,
  // description, CTA, destination URL, display link, and tracking params live
  // here in Overview where they sit alongside the other ad configuration.
  function _renderAdOverviewHeadlineDestination(ad) {
    var c = ad.creative || {};
    var html = '<div class="cp-inspector-section cp-inspector-config">';
    html += '<div class="cp-inspector-section-title">' + icon('link') + ' Headline &amp; destination</div>';

    html += '<div class="cp-form-row">';
    html += '<div class="cp-form-half"><label>Headline <span class="cp-text-muted" style="font-weight:400;font-size:11px">27 chars</span></label>';
    html += '<input type="text" class="cp-input cp-v2-inline-field" data-field="creative.headline" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '" maxlength="60" value="' + esc(c.headline || '') + '">';
    html += '</div>';
    html += '<div class="cp-form-half"><label>Description <span class="cp-text-muted" style="font-weight:400;font-size:11px">27 chars</span></label>';
    html += '<input type="text" class="cp-input cp-v2-inline-field" data-field="creative.description" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '" maxlength="60" value="' + esc(c.description || '') + '">';
    html += '</div></div>';

    html += '<div class="cp-form-row" style="margin-top:var(--cp-space-2)">';
    html += '<div class="cp-form-third"><label>CTA</label>';
    html += '<select class="cp-select cp-v2-inline-field" data-field="creative.cta_type" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '">';
    for (var ctk in META_CTA_TYPES) {
      var ctSel = (c.cta_type === ctk) ? ' selected' : '';
      html += '<option value="' + ctk + '"' + ctSel + '>' + esc(META_CTA_TYPES[ctk].label) + '</option>';
    }
    html += '</select></div>';
    html += '<div class="cp-form-grow"><label>Destination URL</label>';
    html += '<input type="url" class="cp-input cp-v2-inline-field" data-field="creative.cta_link" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '" value="' + esc(c.cta_link || '') + '" placeholder="https://example.com">';
    html += '</div></div>';

    html += '<div class="cp-form-row" style="margin-top:var(--cp-space-2)">';
    html += '<div class="cp-form-half"><label>Display link <span class="cp-text-muted" style="font-weight:400;font-size:11px">optional</span></label>';
    html += '<input type="text" class="cp-input cp-v2-inline-field" data-field="creative.display_link" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '" value="' + esc(c.display_link || '') + '" placeholder="example.com/landing">';
    html += '</div>';
    html += '<div class="cp-form-half"><label>Tracking params <span class="cp-text-muted" style="font-weight:400;font-size:11px">UTM query string</span></label>';
    html += '<input type="text" class="cp-input cp-v2-inline-field" data-field="creative.tracking_params" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '" value="' + esc(c.tracking_params || '') + '" placeholder="utm_source=meta&amp;utm_medium=...">';
    html += '</div></div>';

    html += '</div>';
    return html;
  }

  // --- Ad overview helpers ---

  function _renderAdOverviewConfig(ad) {
    var html = '<div class="cp-inspector-section cp-inspector-config">';
    html += '<div class="cp-inspector-section-title">' + icon('gear') + ' Configuration</div>';

    // Creative type — editable while no media work exists, locked once media
    // content has been entered (changing it would invalidate the type-specific
    // editor). Reset button wipes ad.media and unlocks.
    html += '<div class="cp-config-row">';
    html += '<div class="cp-config-label">Creative type</div>';
    if (typeof isAdMediaUntouched === 'function' && !isAdMediaUntouched(ad)) {
      var currentCtype = META_AD_CREATIVE_TYPES[ad.creative_type] || { label: ad.creative_type || '—', icon: 'rectangle-ad' };
      html += '<div class="cp-config-control cp-creative-type-locked">';
      html += '<span class="cp-creative-type-locked-chip">' + icon('lock') + ' ' + icon(currentCtype.icon) + ' ' + esc(currentCtype.label) + '</span>';
      html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="ws-ad-reset-creative-type" data-id="' + esc(ad.id) + '">' + icon('rotate') + ' Reset (clears media)</button>';
      html += '<span class="cp-text-muted" style="font-size:11px">Locked once media work exists.</span>';
      html += '</div>';
    } else {
      html += '<div class="cp-segmented">';
      for (var ctk in META_AD_CREATIVE_TYPES) {
        var ct = META_AD_CREATIVE_TYPES[ctk];
        var ctSel = (ad.creative_type === ctk) ? ' cp-segmented-active' : '';
        html += '<label class="cp-segmented-option' + ctSel + '">';
        html += '<input type="radio" name="cp-ov-ad-ct-' + esc(ad.id) + '" class="cp-v2-media-type-switch" data-entity-id="' + esc(ad.id) + '" value="' + ctk + '"' + (ctSel ? ' checked' : '') + ' style="display:none">';
        html += icon(ct.icon) + ' ' + esc(ct.label);
        html += '</label>';
      }
      html += '</div>';
    }
    html += '</div>';

    // Tags (uses the Part 2A renderTagInput component if loaded).
    html += '<div class="cp-config-row">';
    html += '<div class="cp-config-label">Tags</div>';
    var R = window._cpRenderers || {};
    if (typeof R.tagInput === 'function') {
      html += '<div class="cp-config-control">' + R.tagInput(ad.tags || [], 'ad', ad.id) + '</div>';
    } else {
      html += '<div class="cp-config-control"><span class="cp-text-muted">Tags loading…</span></div>';
    }
    html += '</div>';

    html += '</div>';
    return html;
  }

  function _renderAdSummaryHook(ad) {
    var hook = ad.hook || {};
    var hasHook = !!(hook.text && hook.text.trim());
    var pill = hasHook
      ? '<span class="cp-inspector-status-pill cp-inspector-status-pill-filled">' + icon('circle-check') + ' Filled</span>'
      : '<span class="cp-inspector-status-pill cp-inspector-status-pill-empty">' + icon('circle') + ' Not set</span>';

    var body = hasHook
      ? '<blockquote class="cp-ad-hook">' + esc(truncate(hook.text, 220)) + '</blockquote>' +
        (hook.type ? '<div class="cp-text-muted" style="font-size:11px;margin-top:4px">Type: <strong>' + esc(hook.type) + '</strong></div>' : '')
      : '<div class="cp-text-muted">No hook yet. Open the Hook tab to add one.</div>';

    return _renderAdSummaryCard('anchor', 'Hook', 'hook', pill, body);
  }

  function _renderAdSummaryMedia(ad, ctype) {
    var media = ad.media || {};
    var pill;
    var body;
    var title = 'Media · ' + (ctype.label || 'Ad');

    if (ad.creative_type === 'single_image') {
      var img = media.image || {};
      var imgPrompt = img.prompt || img.ai_prompt || img.brief || '';
      var imgFilled = !!imgPrompt;
      pill = imgFilled
        ? '<span class="cp-inspector-status-pill cp-inspector-status-pill-filled">' + icon('circle-check') + ' Filled</span>'
        : '<span class="cp-inspector-status-pill cp-inspector-status-pill-empty">' + icon('circle') + ' Not set</span>';
      if (imgFilled) {
        body = '<div class="cp-inspector-field"><div class="cp-inspector-field-label">Prompt</div><div class="cp-inspector-field-value">' + esc(truncate(imgPrompt, 240)) + '</div></div>';
        body += '<div class="cp-text-muted" style="font-size:11px;margin-top:4px">Aspect: ' + esc(img.aspect_ratio || '1:1') + '</div>';
      } else {
        body = '<div class="cp-text-muted">No image prompt yet. Open the Media tab to add one.</div>';
      }
    } else if (ad.creative_type === 'single_video') {
      var vid = media.video || {};
      var sections = (vid.script && vid.script.sections) || [];
      var legacyRows = (vid.script && vid.script.rows) || [];
      var sectionCount = sections.length || (legacyRows.length ? 1 : 0);
      var vidFilled = !!(vid.concept || sectionCount);
      pill = vidFilled
        ? '<span class="cp-inspector-status-pill cp-inspector-status-pill-filled">' + icon('circle-check') + ' Filled</span>'
        : '<span class="cp-inspector-status-pill cp-inspector-status-pill-empty">' + icon('circle') + ' Not set</span>';
      if (vidFilled) {
        body = '';
        if (vid.concept) body += '<div class="cp-inspector-field"><div class="cp-inspector-field-label">Concept</div><div class="cp-inspector-field-value">' + esc(truncate(vid.concept, 200)) + '</div></div>';
        body += '<div class="cp-text-muted" style="font-size:11px;margin-top:4px">' + (vid.duration_seconds || '?') + 's · ' + esc(vid.aspect_ratio || '9:16') + ' · ' + sectionCount + ' script section' + (sectionCount !== 1 ? 's' : '') + '</div>';
      } else {
        body = '<div class="cp-text-muted">No video brief yet. Open the Media tab to add concept and script sections.</div>';
      }
    } else if (ad.creative_type === 'carousel') {
      var cards = media.carousel_cards || [];
      pill = cards.length >= 2
        ? '<span class="cp-inspector-status-pill cp-inspector-status-pill-filled">' + icon('circle-check') + ' ' + cards.length + ' cards</span>'
        : (cards.length === 1
            ? '<span class="cp-inspector-status-pill cp-inspector-status-pill-partial">' + icon('circle-half-stroke') + ' Needs 2+ cards</span>'
            : '<span class="cp-inspector-status-pill cp-inspector-status-pill-empty">' + icon('circle') + ' No cards yet</span>');
      if (cards.length) {
        body = '<div class="cp-text-muted">' + cards.length + ' card' + (cards.length !== 1 ? 's' : '') + ' · Open Media tab to edit.</div>';
      } else {
        body = '<div class="cp-text-muted">No carousel cards yet. Open the Media tab to add them.</div>';
      }
    } else {
      pill = '<span class="cp-inspector-status-pill cp-inspector-status-pill-empty">' + icon('circle') + ' —</span>';
      body = '<div class="cp-text-muted">Pick a creative type above.</div>';
    }

    return _renderAdSummaryCard('wand-magic', title, 'media', pill, body);
  }

  function _renderAdOverviewAssignment(ad) {
    var html = '<div class="cp-inspector-section cp-inspector-config">';
    html += '<div class="cp-inspector-section-title">' + icon('user-clock') + ' Production &amp; assignment</div>';
    html += '<div class="cp-form-row">';
    html += '<div class="cp-form-half">';
    html += '<label class="cp-config-label">Assigned to</label>';
    html += '<input type="text" class="cp-input cp-v2-inline-field" data-field="assigned_to" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '" value="' + esc(ad.assigned_to || '') + '" placeholder="Teammate name or email">';
    html += '</div>';
    html += '<div class="cp-form-half">';
    html += '<label class="cp-config-label">Due date</label>';
    html += '<input type="date" class="cp-input cp-v2-inline-field" data-field="due_date" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '" value="' + esc(ad.due_date || '') + '">';
    html += '</div></div>';
    html += '</div>';
    return html;
  }

  function _renderAdSummaryReview(ad) {
    var hasNotes = !!(ad.review_notes || ad.production_notes);
    var pill = hasNotes
      ? '<span class="cp-inspector-status-pill cp-inspector-status-pill-filled">' + icon('circle-check') + ' Notes added</span>'
      : '<span class="cp-inspector-status-pill cp-inspector-status-pill-empty">' + icon('circle') + ' No notes</span>';

    var body = '';
    if (hasNotes) {
      body += '<div class="cp-inspector-grid cp-inspector-grid-1">';
      if (ad.production_notes) body += '<div class="cp-inspector-field"><div class="cp-inspector-field-label">Production</div><div class="cp-inspector-field-value">' + esc(truncate(ad.production_notes, 200)) + '</div></div>';
      if (ad.review_notes)     body += '<div class="cp-inspector-field"><div class="cp-inspector-field-label">Review</div><div class="cp-inspector-field-value">' + esc(truncate(ad.review_notes, 200)) + '</div></div>';
      body += '</div>';
    } else {
      body = '<div class="cp-text-muted">No notes yet. Open the Review tab to add production or review notes.</div>';
    }

    return _renderAdSummaryCard('clipboard-list', 'Review notes', 'review', pill, body);
  }

  function _renderAdOverviewFooter(ad) {
    var html = '<div class="cp-inspector-footer cp-text-muted" style="margin-top:var(--cp-space-3);font-size:11px;padding-top:var(--cp-space-3);border-top:1px solid var(--cp-border-light)">';
    var parts = [];
    if (ad.created) parts.push('Created ' + formatDate(ad.created));
    if (ad.updated) parts.push('Updated ' + formatRelativeTime(ad.updated));
    if (ad.created_by) parts.push('by ' + esc(ad.created_by));
    html += parts.join(' · ');
    html += '</div>';
    return html;
  }

  // Shared shell for the read-only summary cards. Card header has icon,
  // title, status pill on the right, then an "Open <tab> tab" CTA. The
  // explicit button is the click target — keeps activation predictable
  // (the whole-card click would otherwise also fire on the button via
  // bubble and double-trigger render()).
  function _renderAdSummaryCard(iconName, title, tabKey, pillHtml, bodyHtml) {
    var html = '<div class="cp-inspector-summary-card">';
    html += '<div class="cp-inspector-summary-card-header">';
    html += '<span class="cp-inspector-summary-card-icon">' + icon(iconName) + '</span>';
    html += '<span class="cp-inspector-summary-card-title">' + esc(title) + '</span>';
    html += pillHtml;
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm cp-inspector-summary-card-open" data-action="set-inspector-tab" data-tab="' + esc(tabKey) + '">' + icon('arrow-right') + ' Open tab</button>';
    html += '</div>';
    html += '<div class="cp-inspector-summary-card-body">' + bodyHtml + '</div>';
    html += '</div>';
    return html;
  }

  // --- Small helpers ---

  function inspectorField(label, value, wide) {
    var cls = wide ? ' cp-inspector-field-wide' : '';
    return '<div class="cp-inspector-field' + cls + '"><div class="cp-inspector-field-label">' + esc(label) + '</div><div class="cp-inspector-field-value">' + (typeof value === 'string' ? esc(value) : (value || '')) + '</div></div>';
  }

  // Same as inspectorField but with a small copy-to-clipboard button.
  function inspectorFieldCopy(label, value, adId, field, wide) {
    var cls = wide ? ' cp-inspector-field-wide' : '';
    var hasValue = value && value !== '—';
    var copyBtn = hasValue ? '<button class="cp-btn-icon cp-btn-icon-sm cp-inspector-field-copy" data-action="v2-copy-ad-field" data-id="' + esc(adId) + '" data-field="' + esc(field) + '" title="Copy ' + esc(label) + '">' + icon('copy') + '</button>' : '';
    return '<div class="cp-inspector-field cp-inspector-field-with-copy' + cls + '"><div class="cp-inspector-field-label">' + esc(label) + copyBtn + '</div><div class="cp-inspector-field-value">' + (typeof value === 'string' ? esc(value) : (value || '')) + '</div></div>';
  }

  function renderScheduleSummary(start, end) {
    if (!start && !end) return 'Always-on';
    return (start ? formatDateShort(start) : 'Now') + ' → ' + (end ? formatDateShort(end) : 'Ongoing');
  }

/* ===== src/10-part1/17c-view-workspace-tabs.js ===== */
  // ============================================================
  // SECTION 15D: WORKSPACE INSPECTOR TABS (v2)
  // ============================================================
  //
  // Tabbed inspector renderers — wraps the read-only renderers in 17b with
  // an editor for the strategic brief (Ad Set) and the creative pipeline
  // (Ad). Tab state lives in S.workspaceInspectorTab.

  // --- Ad Set inspector (tabbed) ---

  function renderInspectorForAdSetTabbed(adSet) {
    var tab = S.workspaceInspectorTab;
    var validTabs = ['overview', 'brief', 'settings'];
    if (validTabs.indexOf(tab) === -1) tab = 'overview';

    var html = '';
    html += renderInspectorTabs([
      { key: 'overview', label: 'Overview', icon: 'eye' },
      { key: 'brief',    label: 'Brief',    icon: 'file-lines' },
      { key: 'settings', label: 'Settings', icon: 'gear' }
    ], tab);

    html += '<div class="cp-workspace-inspector-tab-body">';
    if (tab === 'overview')      html += renderInspectorForAdSet(adSet);
    else if (tab === 'brief')    html += renderAdSetBriefEditor(adSet);
    else if (tab === 'settings') html += renderAdSetSettingsTab(adSet);
    html += '</div>';
    return html;
  }

  function renderAdSetBriefEditor(adSet) {
    var brief = adSet.brief || {};
    var messages = getAllMessages();
    var styles = getAllStyles();
    var formats = getAllFormats();

    var html = '<div class="cp-inspector-editor" data-entity-type="ad_set" data-entity-id="' + esc(adSet.id) + '">';

    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('file-lines') + ' Creative direction</div>';
    html += '<textarea class="cp-textarea cp-v2-inline-field" data-field="brief.creative_direction" data-entity-type="ad_set" data-entity-id="' + esc(adSet.id) + '" rows="3" placeholder="Strategic angle for this Ad Set — what story, tone, and messaging direction.">' + esc(brief.creative_direction || '') + '</textarea>';
    html += '</div>';

    // Messages from library (multi-select chips)
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('comments') + ' Messages from library';
    html += '<span class="cp-text-muted" style="font-weight:400;font-size:11px;margin-left:8px">attached as snapshots when used in Ads</span>';
    html += '</div>';
    if (messages.length === 0) {
      html += '<div class="cp-text-muted">No messages in library. <a href="#" data-action="go-view" data-view="messages">Create some</a> to pull from.</div>';
    } else {
      html += '<div class="cp-chip-grid">';
      var selMsgs = brief.message_ids || [];
      for (var mi = 0; mi < messages.length; mi++) {
        var m = messages[mi];
        var isSel = selMsgs.indexOf(m.id) > -1;
        html += '<label class="cp-chip' + (isSel ? ' cp-chip-active' : '') + '">';
        html += '<input type="checkbox" class="cp-v2-brief-id" data-field="brief.message_ids" data-entity-id="' + esc(adSet.id) + '" data-id="' + esc(m.id) + '"' + (isSel ? ' checked' : '') + ' style="display:none">';
        html += esc(m.title || 'Untitled') + '</label>';
      }
      html += '</div>';
    }
    html += '</div>';

    // Styles
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('palette') + ' Styles to use</div>';
    if (styles.length === 0) {
      html += '<div class="cp-text-muted">No styles in library. <a href="#" data-action="go-view" data-view="styles">Create some</a>.</div>';
    } else {
      html += '<div class="cp-chip-grid">';
      var selStyles = brief.style_ids || [];
      for (var si = 0; si < styles.length; si++) {
        var st = styles[si];
        var stSel = selStyles.indexOf(st.id) > -1;
        html += '<label class="cp-chip' + (stSel ? ' cp-chip-active' : '') + '">';
        html += '<input type="checkbox" class="cp-v2-brief-id" data-field="brief.style_ids" data-entity-id="' + esc(adSet.id) + '" data-id="' + esc(st.id) + '"' + (stSel ? ' checked' : '') + ' style="display:none">';
        html += esc(st.name || 'Untitled') + '</label>';
      }
      html += '</div>';
    }
    html += '</div>';

    // Formats
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('clapperboard') + ' Visual formats</div>';
    if (formats.length === 0) {
      html += '<div class="cp-text-muted">No formats in library. <a href="#" data-action="go-view" data-view="formats">Create some</a>.</div>';
    } else {
      html += '<div class="cp-chip-grid">';
      var selFmts = brief.format_ids || [];
      for (var fi = 0; fi < formats.length; fi++) {
        var f = formats[fi];
        var fSel = selFmts.indexOf(f.id) > -1;
        html += '<label class="cp-chip' + (fSel ? ' cp-chip-active' : '') + '">';
        html += '<input type="checkbox" class="cp-v2-brief-id" data-field="brief.format_ids" data-entity-id="' + esc(adSet.id) + '" data-id="' + esc(f.id) + '"' + (fSel ? ' checked' : '') + ' style="display:none">';
        html += esc(f.name || 'Untitled') + '</label>';
      }
      html += '</div>';
    }
    html += '</div>';

    // Hook angles (free-text list)
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('anchor') + ' Hook angles';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="ws-add-hook-angle" data-id="' + esc(adSet.id) + '" style="margin-left:auto">' + icon('plus') + ' Add</button>';
    html += '</div>';
    var angles = brief.hook_angles || [];
    if (angles.length === 0) {
      html += '<div class="cp-text-muted">No hook angles yet. Add 3-5 distinct creative angles for this Ad Set\'s Ads.</div>';
    } else {
      html += '<div class="cp-hook-angle-list">';
      for (var hai = 0; hai < angles.length; hai++) {
        html += '<div class="cp-hook-angle-row">';
        html += '<input type="text" class="cp-input cp-v2-hook-angle" data-entity-id="' + esc(adSet.id) + '" data-index="' + hai + '" value="' + esc(angles[hai]) + '">';
        html += '<button class="cp-btn-icon cp-btn-icon-sm" data-action="ws-remove-hook-angle" data-id="' + esc(adSet.id) + '" data-index="' + hai + '" title="Remove">' + icon('trash') + '</button>';
        html += '</div>';
      }
      html += '</div>';
    }
    html += '</div>';

    // AI notes
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('sparkles') + ' AI notes</div>';
    html += '<textarea class="cp-textarea cp-v2-inline-field" data-field="brief.ai_notes" data-entity-type="ad_set" data-entity-id="' + esc(adSet.id) + '" rows="2" placeholder="Hints for AI when generating Ads — tone, forbidden words, things to emphasize.">' + esc(brief.ai_notes || '') + '</textarea>';
    html += '</div>';

    html += '<div class="cp-inspector-actions">';
    html += '<button class="cp-btn cp-btn-ai" data-action="ai-generate-ad-set-brief" data-id="' + esc(adSet.id) + '">' + icon('sparkles') + ' AI Generate brief</button>';
    html += '<button class="cp-btn cp-btn-primary" data-action="ws-add-ad" data-ad-set-id="' + esc(adSet.id) + '">' + icon('plus') + ' Add Ad with this brief</button>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderAdSetSettingsTab(adSet) {
    // Read-only view of the targeting/optimization settings + a single
    // "Edit Ad Set" CTA that opens the full modal.
    var html = '';

    // Audience block with divergence indicator
    var persona = S.personaMap[adSet.persona_id];
    var divergence = isPersonaSnapshotStale(adSet);

    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('users') + ' Audience</div>';
    if (persona) {
      html += '<div class="cp-inspector-persona-card">';
      html += '<div class="cp-inspector-persona-name">' + icon('user') + ' ' + esc(persona.name) + '</div>';
      if (persona.description) html += '<div class="cp-inspector-persona-desc">' + esc(truncate(persona.description, 200)) + '</div>';
      html += '</div>';
      if (divergence) {
        html += '<div class="cp-snapshot-divergence-pill">';
        html += icon('warning') + ' Library copy has changed since this Ad Set was created.';
        html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="resync-persona-snapshot" data-id="' + esc(adSet.id) + '" style="margin-left:auto">' + icon('refresh') + ' Re-sync from library</button>';
        html += '</div>';
      }
    } else {
      html += '<div class="cp-text-muted">No persona linked.</div>';
    }
    html += '</div>';

    // Optimization + placements + schedule pulled from the existing overview helper
    html += renderInspectorForAdSet(adSet).replace(/<div class="cp-inspector-header"[\s\S]*?<\/div><\/div>/, '');

    return html;
  }

  // --- Ad inspector (tabbed) ---

  function renderInspectorForAdTabbed(ad) {
    var tab = S.workspaceInspectorTab;
    var validTabs = ['overview', 'hook', 'copy', 'media', 'review'];
    if (validTabs.indexOf(tab) === -1) tab = 'overview';

    var html = '';
    html += renderAdInspectorHeader(ad);
    html += renderAdWorkflowTabs(ad, tab);

    html += '<div class="cp-workspace-inspector-tab-body">';
    if (tab === 'overview')    html += renderInspectorForAd(ad);
    else if (tab === 'hook')   html += renderAdHookStep(ad);
    else if (tab === 'copy')   html += renderAdCopyStep(ad);
    else if (tab === 'media')  html += renderAdMediaStep(ad);
    else if (tab === 'review') html += renderAdReviewStep(ad);
    html += '</div>';
    return html;
  }

  function renderAdHookStep(ad) {
    var hook = ad.hook || {};
    var adSet = S.adSetMap[ad.ad_set_id];
    var briefMsgs = (adSet && adSet.brief && adSet.brief.message_ids) || [];
    var hookAngles = (adSet && adSet.brief && adSet.brief.hook_angles) || [];

    var html = '<div class="cp-inspector-editor" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '">';

    // Brief context (read from parent Ad Set)
    if (hookAngles.length || briefMsgs.length) {
      html += '<div class="cp-inspector-context-banner">';
      html += '<strong>' + icon('file-lines') + ' Brief context:</strong> ';
      if (hookAngles.length) html += hookAngles.slice(0, 3).map(function(a) { return '<em>"' + esc(truncate(a, 60)) + '"</em>'; }).join(' · ');
      html += '</div>';
    }

    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('anchor') + ' Hook text</div>';
    html += '<textarea class="cp-textarea cp-v2-inline-field" data-field="hook.text" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '" rows="3" placeholder="The first thing the viewer sees. Make it count.">' + esc(hook.text || '') + '</textarea>';
    html += '<div class="cp-form-row" style="margin-top:var(--cp-space-2)">';
    html += '<div class="cp-form-half"><label>Type</label>';
    html += '<select class="cp-select cp-v2-inline-field" data-field="hook.type" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '">';
    var hookTypes = ['question','bold','story','data','direct','curiosity','challenge'];
    for (var ht of hookTypes) {
      var htSel = (hook.type === ht) ? ' selected' : '';
      html += '<option value="' + ht + '"' + htSel + '>' + ht.charAt(0).toUpperCase() + ht.slice(1) + '</option>';
    }
    html += '</select></div></div>';
    html += '</div>';

    // Inline AI hook ideas (scored, with psychology) — replaces the old AI
    // preview modal so options stay around until the user picks one.
    html += renderAdHookIdeas(ad);

    // Pull from parent Ad Set's library messages
    if (briefMsgs.length) {
      html += '<div class="cp-inspector-section">';
      html += '<div class="cp-inspector-section-title">' + icon('comments') + ' Pull a hook from a library message</div>';
      for (var mi = 0; mi < briefMsgs.length; mi++) {
        var msg = S.messageMap[briefMsgs[mi]];
        if (!msg) continue;
        var hooks = msg.hooks || [];
        html += '<div class="cp-pullable-message">';
        html += '<div class="cp-pullable-message-title">' + esc(msg.title) + '</div>';
        if (hooks.length) {
          html += '<div class="cp-pullable-hooks">';
          for (var hi = 0; hi < hooks.length; hi++) {
            html += '<button class="cp-pullable-hook" data-action="ws-pull-hook" data-ad-id="' + esc(ad.id) + '" data-message-id="' + esc(msg.id) + '" data-hook-id="' + esc(hooks[hi].id) + '">';
            html += '<span class="cp-pullable-hook-type">' + esc(hooks[hi].type || 'direct') + '</span>';
            html += '<span class="cp-pullable-hook-text">' + esc(hooks[hi].text) + '</span>';
            html += '</button>';
          }
          html += '</div>';
        } else {
          html += '<div class="cp-text-muted" style="font-size:12px">No hooks in this message yet.</div>';
        }
        html += '</div>';
      }
      html += '</div>';
    }

    html += '<div class="cp-inspector-actions">';
    html += '<button class="cp-btn cp-btn-ai" data-action="ws-open-hook-gen-modal" data-id="' + esc(ad.id) + '">' + icon('sparkles') + ' Generate hooks</button>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  // --- AI hook ideas — inline options on the Hook tab ---
  //
  // After "Generate hooks" (or Regenerate) runs, options live on
  // `ad.hook.ai_ideas`. The active selection is tracked by
  // `ad.hook.active_idea_id`: that card pins to the top, others collapse to
  // a one-line summary. Each option shows a single 0–100 score chip and a
  // one-sentence "why this works" line.

  function renderAdHookIdeas(ad) {
    var hook = ad.hook || {};
    var ideas = hook.ai_ideas || [];
    if (!ideas.length) return '';

    var activeId = hook.active_idea_id || '';
    var ordered = ideas.slice();
    if (activeId) {
      var i = -1;
      for (var k = 0; k < ordered.length; k++) { if (ordered[k].id === activeId) { i = k; break; } }
      if (i > 0) {
        var pinned = ordered.splice(i, 1)[0];
        ordered.unshift(pinned);
      }
    }

    var html = '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('sparkles') + ' AI hook ideas';
    html += '<span class="cp-text-muted" style="font-weight:400;font-size:11px;margin-left:8px">' + ideas.length + ' option' + (ideas.length !== 1 ? 's' : '') + '</span>';
    html += '<div class="cp-hook-ideas-actions" style="margin-left:auto;display:inline-flex;gap:6px">';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="ws-open-hook-gen-modal" data-id="' + esc(ad.id) + '" title="Regenerate (opens modal — replaces these ideas)">' + icon('rotate') + ' Regenerate</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="ws-clear-ad-hook-ideas" data-id="' + esc(ad.id) + '" title="Clear all ideas">' + icon('trash') + '</button>';
    html += '</div>';
    html += '</div>';

    html += '<div class="cp-hook-ideas">';
    for (var n = 0; n < ordered.length; n++) {
      var idea = ordered[n];
      var origIdx = -1;
      for (var m = 0; m < ideas.length; m++) { if (ideas[m].id === idea.id) { origIdx = m; break; } }
      var isActive = activeId && idea.id === activeId;
      var collapsed = !!activeId && !isActive;
      html += renderAdHookIdeaCard(ad, idea, origIdx, isActive, collapsed);
    }
    html += '</div>';
    html += '</div>';
    return html;
  }

  // Read the score off the new shape (`idea.score`) with a back-compat
  // fallback to the legacy three-score map used before this refactor.
  function getAdHookIdeaScore(idea) {
    if (!idea) return 0;
    if (idea.score != null) return Math.max(0, Math.min(100, Math.round(Number(idea.score) || 0)));
    var s = idea.scores || {};
    var legacy = (s.conversion != null) ? s.conversion : (s.readability != null ? s.readability : s.connection);
    return Math.max(0, Math.min(100, Math.round(Number(legacy) || 0)));
  }

  function renderAdHookIdeaCard(ad, idea, idx, isActive, collapsed) {
    var cls = 'cp-hook-idea-card';
    if (isActive) cls += ' cp-hook-idea-card-active';
    if (collapsed) cls += ' cp-hook-idea-card-collapsed';

    var score = getAdHookIdeaScore(idea);
    var tone = score >= 75 ? 'good' : (score >= 50 ? 'ok' : 'low');

    var html = '<div class="' + cls + '" data-idea-id="' + esc(idea.id) + '">';

    if (collapsed) {
      // Compact row: type · text (truncated) · score · use · expand
      html += '<div class="cp-hook-idea-head">';
      html += '<span class="cp-pullable-hook-type">' + esc(idea.type || 'direct') + '</span>';
      html += '<div class="cp-hook-idea-text cp-hook-idea-text-clamp">' + esc(idea.text) + '</div>';
      html += '<span class="cp-hook-idea-score-chip cp-hook-idea-score-chip-' + tone + '" title="Score">' + score + '</span>';
      html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="ws-use-ad-hook-idea" data-id="' + esc(ad.id) + '" data-idx="' + idx + '" title="Use this hook">' + icon('check') + '</button>';
      html += '<button class="cp-btn-icon cp-btn-icon-sm" data-action="ws-toggle-hook-idea-expanded" data-id="' + esc(ad.id) + '" data-idea-id="' + esc(idea.id) + '" title="Expand">' + icon('chevron-down') + '</button>';
      html += '</div>';
    } else {
      // Expanded card: header row, hook text, psychology, actions
      html += '<div class="cp-hook-idea-head">';
      html += '<span class="cp-pullable-hook-type">' + esc(idea.type || 'direct') + '</span>';
      if (isActive) html += '<span class="cp-hook-idea-active-badge">' + icon('circle-check') + ' Active</span>';
      html += '<span class="cp-hook-idea-score-chip cp-hook-idea-score-chip-' + tone + '" title="Overall scroll-stopping score">' + score + '<span class="cp-hook-idea-score-chip-suffix">/100</span></span>';
      html += '</div>';

      html += '<div class="cp-hook-idea-text">' + esc(idea.text) + '</div>';

      if (idea.psychology) {
        html += '<div class="cp-hook-idea-psychology">';
        html += '<span class="cp-hook-idea-psychology-label">' + icon('lightbulb') + ' Why this works</span>';
        html += '<em>' + esc(idea.psychology) + '</em>';
        html += '</div>';
      }

      html += '<div class="cp-hook-idea-actions">';
      if (isActive) {
        html += '<span class="cp-text-muted" style="font-size:11px;flex:1">This hook is applied to the ad above.</span>';
      } else {
        html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="ws-use-ad-hook-idea" data-id="' + esc(ad.id) + '" data-idx="' + idx + '">' + icon('check') + ' Use this hook</button>';
      }
      html += '<button class="cp-btn-icon cp-btn-icon-sm" data-action="ws-remove-ad-hook-idea" data-id="' + esc(ad.id) + '" data-idx="' + idx + '" title="Discard">' + icon('trash') + '</button>';
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  function renderAdCopyStep(ad) {
    var c = ad.creative || {};
    var html = '<div class="cp-inspector-editor" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '">';

    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('pen-fancy') + ' Primary text';
    html += '<span class="cp-text-muted" style="font-weight:400;font-size:11px;margin-left:8px">Body copy above the media · 125 chars recommended. Headline, description, and destination live in Overview.</span>';
    html += '</div>';
    html += '<textarea class="cp-textarea cp-v2-inline-field" data-field="creative.primary_text" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '" rows="6" placeholder="The body copy above your media.">' + esc(c.primary_text || '') + '</textarea>';
    html += '<div class="cp-char-counter">' + countChars(c.primary_text || '') + ' chars · ' + countWords(c.primary_text || '') + ' words</div>';
    html += '</div>';

    // Inline AI copy variants — populated by aiWriteAdCopy / aiImproveAdCopy.
    html += renderAdCopyVariants(ad);

    html += '<div class="cp-inspector-actions">';
    html += '<button class="cp-btn cp-btn-ai" data-action="ws-open-copy-write-modal" data-id="' + esc(ad.id) + '">' + icon('sparkles') + ' AI write copy</button>';
    html += '<button class="cp-btn cp-btn-outline" data-action="ws-open-copy-improve-modal" data-id="' + esc(ad.id) + '">' + icon('wand-magic') + ' Improve</button>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  // --- AI copy variants — single inline draft on the Copy tab ---
  //
  // Stored on `ad.creative.ai_copy_variants`. The list usually holds one
  // record: the most recent AI Write or AI Improve output. The user picks
  // **Use this** to overwrite `creative.primary_text`, or **Discard** to
  // throw it away. Each record: `{ id, text, source, instruction,
  // generated_at }`.

  function renderAdCopyVariants(ad) {
    var variants = (ad.creative && ad.creative.ai_copy_variants) || [];
    if (!variants.length) return '';

    var html = '<div class="cp-inspector-section">';
    html += '<div class="cp-copy-variants">';
    for (var i = 0; i < variants.length; i++) {
      html += renderAdCopyVariantCard(ad, variants[i], i);
    }
    html += '</div>';
    html += '</div>';
    return html;
  }

  function renderAdCopyVariantCard(ad, v, idx) {
    var isImprove = (v.source === 'improve');
    var sourceLabel = isImprove ? 'AI improvement' : 'AI draft';
    var sourceIcon  = isImprove ? 'wand-magic' : 'sparkles';

    var html = '<div class="cp-copy-variant-card" data-variant-id="' + esc(v.id) + '">';
    html += '<div class="cp-copy-variant-head">';
    html += '<span class="cp-copy-variant-source">' + icon(sourceIcon) + ' ' + esc(sourceLabel) + '</span>';
    html += '<span class="cp-text-muted cp-copy-variant-meta">' + countChars(v.text || '') + ' chars · ' + countWords(v.text || '') + ' words</span>';
    html += '</div>';
    if (v.instruction) {
      html += '<div class="cp-copy-variant-instruction">' + icon('quote-left') + ' <em>' + esc(v.instruction) + '</em></div>';
    }
    html += '<div class="cp-copy-variant-text">' + esc(v.text || '') + '</div>';
    html += '<div class="cp-copy-variant-actions">';
    html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="ws-use-ad-copy-variant" data-id="' + esc(ad.id) + '" data-idx="' + idx + '">' + icon('check') + ' Use this' + (isImprove ? ' improvement' : ' draft') + '</button>';
    html += '<button class="cp-btn-icon cp-btn-icon-sm" data-action="ws-remove-ad-copy-variant" data-id="' + esc(ad.id) + '" data-idx="' + idx + '" title="Discard">' + icon('trash') + '</button>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  function renderAdMediaStep(ad) {
    var media = ad.media || {};
    var html = '<div class="cp-inspector-editor" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '">';

    // Creative type is fixed for the Media tab — changing it would invalidate
    // the type-specific editors and any work in progress. Pick / reset from
    // Overview → Configuration.
    var C = Constants;
    var ctype = C.META_AD_CREATIVE_TYPES[ad.creative_type] || { label: ad.creative_type || '—', icon: 'rectangle-ad' };
    html += '<div class="cp-inspector-section cp-inspector-section-compact">';
    html += '<div class="cp-creative-type-locked">';
    html += icon('lock') + ' Editing as <strong>' + esc(ctype.label) + '</strong>';
    html += '<button class="cp-btn-link" data-action="set-inspector-tab" data-tab="overview">' + icon('arrow-left') + ' Change in Overview</button>';
    html += '</div>';
    html += '</div>';

    // Per-type editor
    if (ad.creative_type === 'single_image') {
      html += renderAdMediaImage(ad);
    } else if (ad.creative_type === 'single_video') {
      html += renderAdMediaVideo(ad);
    } else if (ad.creative_type === 'carousel') {
      html += renderAdMediaCarousel(ad);
    }

    // Structured-brief export — packages hook + copy + media direction
    // into one JSON the user can hand to an image/video tool or an
    // MCP-connected LLM.
    html += '<div class="cp-inspector-section cp-media-brief-actions" style="background:var(--cp-gray-50,#f8f9fa);border-radius:var(--cp-radius-md);padding:var(--cp-space-3);margin-top:var(--cp-space-4)">';
    html += '<div class="cp-inspector-section-title">' + icon('file-code') + ' Media brief — export';
    html += '<span class="cp-text-muted" style="font-weight:400;font-size:11px;margin-left:8px">Packages hook + copy + media direction as one structured JSON for downstream tools</span>';
    html += '</div>';
    html += '<div style="display:flex;gap:var(--cp-space-2);flex-wrap:wrap">';
    html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="preview-media-brief" data-id="' + esc(ad.id) + '">' + icon('eye') + ' Preview &amp; copy</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="copy-media-brief" data-id="' + esc(ad.id) + '">' + icon('copy') + ' Copy JSON</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="copy-media-brief-mcp" data-id="' + esc(ad.id) + '">' + icon('robot') + ' Copy as MCP brief</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="download-media-brief" data-id="' + esc(ad.id) + '">' + icon('download') + ' Download .json</button>';
    html += '</div>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderAdMediaImage(ad) {
    var img = (ad.media && ad.media.image) || {};
    // Single prompt field. Falls back to legacy ai_prompt / brief so existing
    // ads keep displaying their content; new edits write to `prompt`.
    var promptValue = img.prompt || img.ai_prompt || img.brief || '';

    var html = '';
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('image') + ' Image prompt';
    html += '<span class="cp-text-muted" style="font-weight:400;font-size:11px;margin-left:8px">Plain description or a production-grade generator prompt — used in the exported brief.</span>';
    html += '</div>';
    html += '<textarea class="cp-textarea cp-v2-inline-field" data-field="media.image.prompt" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '" rows="5" placeholder="Describe the image you want, or paste a generator prompt. Hand off via Copy JSON / MCP brief / Download below.">' + esc(promptValue) + '</textarea>';
    html += '<div class="cp-form-row" style="margin-top:var(--cp-space-2)">';
    html += '<div class="cp-form-third"><label>Aspect ratio</label>';
    html += '<select class="cp-select cp-v2-inline-field" data-field="media.image.aspect_ratio" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '">';
    var aspects = ['1:1','4:5','9:16','16:9'];
    for (var i = 0; i < aspects.length; i++) {
      var sel = (img.aspect_ratio === aspects[i]) ? ' selected' : '';
      html += '<option value="' + aspects[i] + '"' + sel + '>' + aspects[i] + '</option>';
    }
    html += '</select></div></div>';
    html += '</div>';

    html += '<div class="cp-inspector-actions">';
    html += '<button class="cp-btn cp-btn-ai" data-action="ai-generate-ad-image-prompt" data-id="' + esc(ad.id) + '">' + icon('sparkles') + ' Generate prompt from ad data</button>';
    html += '</div>';
    return html;
  }

  function renderAdMediaVideo(ad) {
    var vid = (ad.media && ad.media.video) || {};
    var sections = getAdVideoScriptSections(vid);

    var html = '';
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('video') + ' Concept</div>';
    html += '<textarea class="cp-textarea cp-v2-inline-field" data-field="media.video.concept" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '" rows="2" placeholder="One-line concept — what the video is about.">' + esc(vid.concept || '') + '</textarea>';
    html += '<div class="cp-form-row" style="margin-top:var(--cp-space-2)">';
    html += '<div class="cp-form-third"><label>Duration (s)</label>';
    html += '<input type="number" class="cp-input cp-v2-inline-field" data-field="media.video.duration_seconds" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '" min="1" max="60" value="' + esc(vid.duration_seconds || 30) + '">';
    html += '</div>';
    html += '<div class="cp-form-third"><label>Aspect ratio</label>';
    html += '<select class="cp-select cp-v2-inline-field" data-field="media.video.aspect_ratio" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '">';
    var aspects = ['9:16','1:1','16:9','4:5'];
    for (var i = 0; i < aspects.length; i++) {
      var sel = (vid.aspect_ratio === aspects[i]) ? ' selected' : '';
      html += '<option value="' + aspects[i] + '"' + sel + '>' + aspects[i] + '</option>';
    }
    html += '</select></div></div></div>';

    // Script sections
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('list-tree') + ' Script';
    html += '<span class="cp-text-muted" style="font-weight:400;font-size:11px;margin-left:8px">Add a section per beat (Hook · Setup · Payoff · CTA). Visual direction lives in your media app.</span>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="ws-ad-add-script-section" data-id="' + esc(ad.id) + '" style="margin-left:auto">' + icon('plus') + ' Add section</button>';
    html += '</div>';
    if (sections.length === 0) {
      html += '<div class="cp-text-muted">No sections yet. Add a section or use AI generate below.</div>';
    } else {
      html += '<div class="cp-v2-script-sections">';
      for (var si = 0; si < sections.length; si++) {
        var sec = sections[si];
        html += '<div class="cp-v2-script-section">';
        html += '<div class="cp-v2-script-section-header">';
        html += '<span class="cp-v2-script-section-num">' + (si + 1) + '</span>';
        html += '<input type="text" class="cp-input cp-v2-script-section-field" data-entity-id="' + esc(ad.id) + '" data-index="' + si + '" data-key="label" value="' + esc(sec.label || '') + '" placeholder="Section name (e.g., Hook)">';
        html += '<div class="cp-v2-script-section-actions">';
        html += '<button class="cp-btn-icon cp-btn-icon-sm" data-action="ws-ad-move-script-section" data-id="' + esc(ad.id) + '" data-index="' + si + '" data-dir="-1" title="Move up"' + (si === 0 ? ' disabled' : '') + '>' + icon('arrow-up') + '</button>';
        html += '<button class="cp-btn-icon cp-btn-icon-sm" data-action="ws-ad-move-script-section" data-id="' + esc(ad.id) + '" data-index="' + si + '" data-dir="1" title="Move down"' + (si === sections.length - 1 ? ' disabled' : '') + '>' + icon('arrow-down') + '</button>';
        html += '<button class="cp-btn-icon cp-btn-icon-sm" data-action="ws-ad-remove-script-section" data-id="' + esc(ad.id) + '" data-index="' + si + '" title="Remove">' + icon('trash') + '</button>';
        html += '</div></div>';
        html += '<textarea class="cp-textarea cp-v2-script-section-field" data-entity-id="' + esc(ad.id) + '" data-index="' + si + '" data-key="script" rows="3" placeholder="Write what is said and any on-screen text for this beat.">' + esc(sec.script || '') + '</textarea>';
        html += '</div>';
      }
      html += '</div>';
    }
    html += '</div>';

    html += '<div class="cp-inspector-actions">';
    html += '<button class="cp-btn cp-btn-ai" data-action="ai-generate-video-script" data-id="' + esc(ad.id) + '">' + icon('sparkles') + ' Generate script</button>';
    html += '</div>';
    return html;
  }

  // Single source of truth for the section list shown in the Video editor and
  // exported in the media brief. New ads carry `script.sections`; legacy ads
  // built with the old time/dialogue/visual rows are folded into a single
  // "Script" section so existing copy isn't lost. The migration is read-only;
  // writes always go to `script.sections`.
  function getAdVideoScriptSections(vid) {
    var script = (vid && vid.script) || {};
    if (script.sections && script.sections.length) return script.sections;
    if (script.rows && script.rows.length) {
      var combined = script.rows.map(function(r) {
        var bits = [];
        if (r.time) bits.push('[' + r.time + ']');
        if (r.dialogue) bits.push(r.dialogue);
        if (r.visual) bits.push('(visual: ' + r.visual + ')');
        return bits.join(' ');
      }).filter(Boolean).join('\n');
      return combined ? [{ label: 'Script', script: combined }] : [];
    }
    return [];
  }

  function renderAdMediaCarousel(ad) {
    var cards = (ad.media && ad.media.carousel_cards) || [];
    var html = '';
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('images') + ' Carousel cards (' + cards.length + ')';
    html += '<span class="cp-text-muted" style="font-weight:400;font-size:11px;margin-left:8px">One image prompt + caption per card. Hand off the brief to your media app to produce the images.</span>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="ws-ad-add-card" data-id="' + esc(ad.id) + '" style="margin-left:auto">' + icon('plus') + ' Add card</button>';
    html += '</div>';
    if (cards.length === 0) {
      html += '<div class="cp-text-muted">No cards yet. Meta carousels need at least 2.</div>';
    } else {
      html += '<div class="cp-v2-carousel-cards">';
      for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        var cardPrompt = card.prompt || card.headline || '';
        var cardCaption = card.caption || card.description || '';
        html += '<div class="cp-v2-carousel-card"><div class="cp-v2-carousel-card-num">' + (i + 1) + '</div>';
        html += '<div class="cp-v2-carousel-card-fields">';
        html += '<textarea class="cp-textarea cp-v2-card-field" data-entity-id="' + esc(ad.id) + '" data-index="' + i + '" data-key="prompt" rows="3" placeholder="Image prompt for this card — describe what should be shown.">' + esc(cardPrompt) + '</textarea>';
        html += '<input type="text" class="cp-input cp-v2-card-field" data-entity-id="' + esc(ad.id) + '" data-index="' + i + '" data-key="caption" value="' + esc(cardCaption) + '" placeholder="Card caption / on-image text">';
        html += '</div>';
        html += '<button class="cp-btn-icon cp-btn-icon-sm" data-action="ws-ad-remove-card" data-id="' + esc(ad.id) + '" data-index="' + i + '">' + icon('trash') + '</button>';
        html += '</div>';
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderAdReviewStep(ad) {
    var html = '<div class="cp-inspector-editor" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '">';

    // Status snapshot — change is in Overview tab's Configuration card.
    var C = Constants;
    var st = C.META_AD_STATUSES[ad.pipeline_status] || { label: ad.pipeline_status || '—', color: '#80868b', icon: 'circle' };
    html += '<div class="cp-inspector-section cp-inspector-section-compact">';
    html += '<div class="cp-inspector-section-title">' + icon('circle-check') + ' Current status</div>';
    html += '<div style="display:flex;align-items:center;gap:var(--cp-space-3);flex-wrap:wrap">';
    html += '<span class="cp-badge" style="background:' + st.color + '15;color:' + st.color + ';font-size:var(--cp-font-size-sm);padding:6px 12px">' + icon(st.icon) + ' ' + esc(st.label) + '</span>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="set-inspector-tab" data-tab="overview">' + icon('arrow-left') + ' Change in Overview</button>';
    html += '</div></div>';

    // Production notes + review notes are the primary purpose of this tab.
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('note-sticky') + ' Production notes';
    html += '<span class="cp-text-muted" style="font-weight:400;font-size:11px;margin-left:8px">where assets live, who is shooting, asset URLs, etc.</span>';
    html += '</div>';
    html += '<textarea class="cp-textarea cp-v2-inline-field" data-field="production_notes" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '" rows="4" placeholder="Where assets live, who is shooting, etc.">' + esc(ad.production_notes || '') + '</textarea>';
    html += '</div>';

    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('comments') + ' Review notes';
    html += '<span class="cp-text-muted" style="font-weight:400;font-size:11px;margin-left:8px">feedback from reviewers, change requests, approval comments</span>';
    html += '</div>';
    html += '<textarea class="cp-textarea cp-v2-inline-field" data-field="review_notes" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '" rows="5" placeholder="Feedback from reviewers...">' + esc(ad.review_notes || '') + '</textarea>';
    html += '</div>';

    return html;
  }

  // --- Persistent CP Inspector header (rendered on every Ad tab) ---
  //
  // Lifted from the Overview-only identity block so name, creative-type
  // chip, status, and primary actions stay visible while editing
  // Hook/Copy/Media/Review. The status badge is replaced by a
  // dropdown that lets the user override pipeline_status manually
  // (forward or backward); auto-advance continues to run on field saves
  // via `maybeAdvanceAdStatus`. Items are grouped Workflow / Review so
  // it's clear which stages are normally auto-managed.

  function renderAdInspectorHeader(ad) {
    var C = Constants;
    var adSet = S.adSetMap[ad.ad_set_id];
    var camp  = adSet ? S.campaignV2Map[adSet.campaign_id] : null;
    var ctype = C.META_AD_CREATIVE_TYPES[ad.creative_type] || { label: 'Ad', icon: 'rectangle-ad' };
    var status = C.META_AD_STATUSES[ad.pipeline_status] || { label: ad.pipeline_status || '—', color: '#80868b', icon: 'circle', key: ad.pipeline_status };
    var crumb = (camp ? esc(camp.name) + ' · ' : '') + (adSet ? esc(adSet.name) : '');

    var html = '<div class="cp-inspector-header cp-ad-inspector-header"><div class="cp-ad-inspector-header-main">';
    html += '<div class="cp-inspector-eyebrow">' + icon(ctype.icon) + ' ' + esc(ctype.label) + (crumb ? ' · ' + crumb : '') + '</div>';
    html += '<input type="text" class="cp-inspector-title-input cp-v2-inline-field" data-field="name" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '" value="' + esc(ad.name || '') + '" placeholder="Ad name">';
    html += renderAdReadinessPill(ad);
    html += '</div>';

    html += '<div class="cp-ad-inspector-header-side">';
    html += renderAdStatusDropdown(ad, status);
    html += '<div class="cp-inspector-header-actions">';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="v2-copy-ad-field" data-id="' + esc(ad.id) + '" data-field="all" title="Copy all ad fields">' + icon('copy') + '</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="delete-ad" data-id="' + esc(ad.id) + '" title="Delete ad">' + icon('trash') + '</button>';
    html += '</div>';
    html += '</div></div>';
    return html;
  }

  function renderAdReadinessPill(ad) {
    var steps = [
      { key: 'hook',   label: 'Hook',   done: isAdHookDone(ad) },
      { key: 'copy',   label: 'Copy',   done: isAdCopyDone(ad) },
      { key: 'media',  label: 'Media',  done: isAdMediaDone(ad) },
      { key: 'review', label: 'Review', done: isAdReviewDone(ad) }
    ];
    var html = '<div class="cp-ad-readiness" title="Step completion — drives auto-advance">';
    for (var i = 0; i < steps.length; i++) {
      var s = steps[i];
      var cls = 'cp-ad-readiness-step' + (s.done ? ' cp-ad-readiness-step-done' : '');
      html += '<span class="' + cls + '">' + icon(s.done ? 'circle-check' : 'circle') + ' ' + esc(s.label) + '</span>';
      if (i < steps.length - 1) html += '<span class="cp-ad-readiness-sep">·</span>';
    }
    html += '</div>';
    return html;
  }

  function renderAdStatusDropdown(ad, status) {
    var C = Constants;
    var workflowKeys = ['hook_ready', 'copy_ready', 'media_ready'];
    var reviewKeys   = ['in_review', 'approved', 'live', 'paused', 'archived'];

    function renderItem(key) {
      var st = C.META_AD_STATUSES[key];
      if (!st) return '';
      var active = (ad.pipeline_status === key) ? ' cp-status-dropdown-item-active' : '';
      return '<button type="button" class="cp-status-dropdown-item' + active + '" role="menuitem" data-action="ws-set-ad-status" data-id="' + esc(ad.id) + '" data-status="' + key + '" style="--status-color:' + st.color + '">' +
             '<span class="cp-status-dropdown-item-dot" style="background:' + st.color + '"></span>' +
             icon(st.icon) + '<span class="cp-status-dropdown-item-label">' + esc(st.label) + '</span>' +
             '</button>';
    }

    var html = '<div class="cp-status-dropdown" data-ad-id="' + esc(ad.id) + '">';
    html += '<button type="button" class="cp-status-dropdown-trigger" data-action="ws-status-dropdown-toggle" aria-haspopup="menu" aria-expanded="false" style="--status-color:' + status.color + '">';
    html += '<span class="cp-status-dropdown-dot" style="background:' + status.color + '"></span>';
    html += icon(status.icon) + '<span class="cp-status-dropdown-label">' + esc(status.label) + '</span>';
    html += icon('caret-down') + '</button>';
    html += '<div class="cp-status-dropdown-menu" role="menu">';
    html += '<div class="cp-status-dropdown-group-label">' + icon('robot') + ' Workflow <span class="cp-text-muted" style="font-weight:400">· auto-advances</span></div>';
    for (var i = 0; i < workflowKeys.length; i++) html += renderItem(workflowKeys[i]);
    html += '<div class="cp-status-dropdown-divider"></div>';
    html += '<div class="cp-status-dropdown-group-label">' + icon('user-check') + ' Review</div>';
    for (var j = 0; j < reviewKeys.length; j++) html += renderItem(reviewKeys[j]);
    html += '</div></div>';
    return html;
  }

  // --- Ad workflow tabs (Overview pill + Hook→Copy→Media→Review stepper) ---
  //
  // Replaces the old separate "tab bar + pipeline progress strip" duplication:
  // the tab strip itself now visualizes pipeline progress. Completed steps
  // show a green check marker, the active tab is highlighted, todo steps are
  // dimmed. Connectors between markers reinforce the workflow direction.

  function renderAdWorkflowTabs(ad, activeTab) {
    var steps = Constants.META_AD_PIPELINE_STEPS;
    var done = {
      hook:   isAdHookDone(ad),
      copy:   isAdCopyDone(ad),
      media:  isAdMediaDone(ad),
      review: isAdReviewDone(ad)
    };

    var html = '<div class="cp-ad-workflow-tabs">';

    var overviewCls = 'cp-ad-workflow-overview' + (activeTab === 'overview' ? ' cp-ad-workflow-overview-active' : '');
    html += '<button class="' + overviewCls + '" data-action="set-inspector-tab" data-tab="overview" role="tab" aria-selected="' + (activeTab === 'overview' ? 'true' : 'false') + '">';
    html += icon('eye') + '<span class="cp-ad-workflow-overview-label">Overview</span>';
    html += '</button>';

    html += '<div class="cp-ad-workflow-divider" aria-hidden="true"></div>';

    html += '<div class="cp-ad-workflow-steps" role="tablist">';
    for (var i = 0; i < steps.length; i++) {
      var step = steps[i];
      var isActive = (activeTab === step.key);
      var isDone = !!done[step.key];
      var cls = 'cp-ad-workflow-step';
      if (isDone) cls += ' cp-ad-workflow-step-done';
      if (isActive) cls += ' cp-ad-workflow-step-active';

      html += '<button class="' + cls + '" data-action="set-inspector-tab" data-tab="' + step.key + '" role="tab" aria-selected="' + (isActive ? 'true' : 'false') + '">';
      html += '<span class="cp-ad-workflow-step-marker">' + icon(isDone ? 'circle-check' : step.icon) + '</span>';
      html += '<span class="cp-ad-workflow-step-label">' + esc(step.label) + '</span>';
      html += '</button>';

      if (i < steps.length - 1) {
        html += '<div class="cp-ad-workflow-connector' + (isDone ? ' cp-ad-workflow-connector-done' : '') + '" aria-hidden="true"></div>';
      }
    }
    html += '</div>';

    html += '</div>';
    return html;
  }

  // --- Per-step completion helpers (single source of truth) ---
  //
  // Used by renderAdWorkflowTabs for the visual stepper and by
  // evaluateAdAutoStatus for promoting pipeline_status. Keep these in lockstep.

  function isAdHookDone(ad) {
    var t = (ad && ad.hook && ad.hook.text) || '';
    return t.trim().length >= 3;
  }

  function isAdCopyDone(ad) {
    // Copy step now scopes to primary_text only — headline / description /
    // destination live in Overview and are validated at export time.
    var c = (ad && ad.creative) || {};
    return (c.primary_text || '').trim().length >= 20;
  }

  function isAdMediaDone(ad) {
    if (!ad) return false;
    var media = ad.media || {};
    if (ad.creative_type === 'single_image') {
      var img = media.image || {};
      var p = (img.prompt || img.ai_prompt || img.brief || '').trim();
      return !!(img.asset_id || p.length > 10);
    } else if (ad.creative_type === 'single_video') {
      var vid = media.video || {};
      if (vid.asset_id || (vid.concept || '').trim()) return true;
      var sections = (vid.script && vid.script.sections) || [];
      for (var s = 0; s < sections.length; s++) {
        if ((sections[s].label || '').trim() || (sections[s].script || '').trim()) return true;
      }
      // Back-compat: legacy ads still satisfy "done" via rows or scenes.
      if (vid.script && vid.script.rows && vid.script.rows.length) return true;
      if (vid.blueprint && vid.blueprint.scenes && vid.blueprint.scenes.length) return true;
      return false;
    } else if (ad.creative_type === 'carousel') {
      return !!(media.carousel_cards && media.carousel_cards.length >= 2);
    }
    return false;
  }

  function isAdReviewDone(ad) {
    if (!ad) return false;
    var s = ad.pipeline_status;
    return s === 'in_review' || s === 'approved' || s === 'live' || s === 'paused' || s === 'archived';
  }

  // True iff no media-bearing field has any user content. Used to decide
  // whether the Overview creative-type selector is editable (untouched) or
  // shown locked with a "Reset" CTA (any media content exists).
  function isAdMediaUntouched(ad) {
    if (!ad) return true;
    var m = ad.media || {};
    var img = m.image || {};
    if ((img.prompt || '').trim() || (img.ai_prompt || '').trim() || (img.brief || '').trim() || img.asset_id || (img.negative_prompt || '').trim()) return false;
    var vid = m.video || {};
    if ((vid.concept || '').trim() || vid.asset_id) return false;
    var vidSections = (vid.script && vid.script.sections) || [];
    for (var vsi = 0; vsi < vidSections.length; vsi++) {
      if ((vidSections[vsi].label || '').trim() || (vidSections[vsi].script || '').trim()) return false;
    }
    if (vid.script && vid.script.rows && vid.script.rows.length) return false;
    if (vid.blueprint && vid.blueprint.scenes && vid.blueprint.scenes.length) return false;
    if (m.carousel_cards && m.carousel_cards.length) return false;
    return true;
  }

  // --- Inspector tab bar (shared) ---

  function renderInspectorTabs(tabs, active) {
    var html = '<div class="cp-inspector-tabs">';
    for (var i = 0; i < tabs.length; i++) {
      var t = tabs[i];
      var cls = (active === t.key) ? ' cp-inspector-tab-active' : '';
      html += '<button class="cp-inspector-tab' + cls + '" data-action="set-inspector-tab" data-tab="' + t.key + '">';
      html += icon(t.icon) + ' ' + esc(t.label);
      html += '</button>';
    }
    html += '</div>';
    return html;
  }

  // --- Snapshot divergence helpers (for Stage 3 re-sync UI) ---

  // Returns true if the library persona has been updated since the snapshot
  // was captured on this Ad Set.
  function isPersonaSnapshotStale(adSet) {
    if (!adSet || !adSet.persona_id || !adSet.persona_snapshot) return false;
    var src = S.personaMap[adSet.persona_id];
    if (!src) return false;
    var libUpdated = src.updated || src.created || '';
    var snapWhen = adSet.persona_snapshot.source_updated || '';
    return libUpdated && snapWhen && libUpdated > snapWhen;
  }

  function isMessageSnapshotStale(ad) {
    if (!ad || !ad.message_snapshot || !ad.hook || !ad.hook.source_message_id) return false;
    var src = S.messageMap[ad.hook.source_message_id];
    if (!src) return false;
    var libUpdated = src.updated || src.created || '';
    var snapWhen = ad.message_snapshot.source_updated || '';
    return libUpdated && snapWhen && libUpdated > snapWhen;
  }

  // --- Ad auto-status engine ---

  // Promotes ad.pipeline_status forward only — never backward. Evaluates
  // the fields in order: hook_ready → copy_ready → media_ready. The remaining
  // statuses (in_review/approved/live/paused/archived) are manual transitions.
  function evaluateAdAutoStatus(ad) {
    if (!ad) return null;
    var C = Constants;
    var order = C.META_AD_STATUS_ORDER;
    var currentIdx = order.indexOf(ad.pipeline_status);
    if (currentIdx < 0) return null;

    var suggested = ad.pipeline_status;

    function bump(target) {
      var ti = order.indexOf(target);
      var si = order.indexOf(suggested);
      if (ti > si) suggested = target;
    }

    if (isAdHookDone(ad))  bump('hook_ready');
    if (isAdCopyDone(ad))  bump('copy_ready');
    if (isAdMediaDone(ad)) bump('media_ready');

    return suggested === ad.pipeline_status ? null : suggested;
  }

  function maybeAdvanceAdStatus(ad, reason) {
    if (!ad) return false;
    var suggested = evaluateAdAutoStatus(ad);
    if (!suggested) return false;
    var C = Constants;
    var order = C.META_AD_STATUS_ORDER;
    var ci = order.indexOf(ad.pipeline_status), si = order.indexOf(suggested);
    if (si <= ci) return false;

    var oldLabel = (C.META_AD_STATUSES[ad.pipeline_status] || {}).label || ad.pipeline_status;
    var newLabel = (C.META_AD_STATUSES[suggested] || {}).label || suggested;
    ad.pipeline_status = suggested;
    ad.updated = new Date().toISOString();
    logActivity('ad_status_changed', 'ad', ad.id, ad.name, oldLabel + ' → ' + newLabel + (reason ? ' (' + reason + ')' : ''));
    toast('Auto-advanced to ' + newLabel + (reason ? ' — ' + reason : ''), 'success', 4000);
    return true;
  }

/* ===== src/10-part1/18-view-calendar.js ===== */
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
    var calFilter = S.calendarFilters || {};

    // Collect Ads with due dates (apply campaign + pipeline status filter)
    var ads = (S.data.ads || []).filter(function(a) {
      if (!a.due_date) return false;
      if (calFilter.status && a.pipeline_status !== calFilter.status) return false;
      if (calFilter.campaign) {
        var aSet = S.adSetMap[a.ad_set_id];
        if (!aSet || aSet.campaign_id !== calFilter.campaign) return false;
      }
      return true;
    });
    var adsByDate = {};
    ads.forEach(function(a) {
      adsByDate[a.due_date] = adsByDate[a.due_date] || [];
      adsByDate[a.due_date].push(a);
    });

    // Collect Meta v2 campaigns with date ranges
    var camps = (S.data.campaigns_v2 || []).filter(function(c) { return c.start_time && c.stop_time; });
    if (calFilter.campaign) camps = camps.filter(function(c) { return c.id === calFilter.campaign; });

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
    var allCamps = getAllCampaignsV2 ? getAllCampaignsV2() : [];
    if (allCamps.length > 0) {
      html += '<select class="cp-select cp-select-sm" id="cpCalCampaignFilter"><option value="">All Campaigns</option>';
      for (var cfi = 0; cfi < allCamps.length; cfi++) html += '<option value="' + esc(allCamps[cfi].id) + '"' + (calFilter.campaign === allCamps[cfi].id ? ' selected' : '') + '>' + esc(allCamps[cfi].name) + '</option>';
      html += '</select>';
    }
    html += '<select class="cp-select cp-select-sm" id="cpCalStatusFilter"><option value="">All Statuses</option>';
    for (var csk in META_AD_STATUSES) html += '<option value="' + csk + '"' + (calFilter.status === csk ? ' selected' : '') + '>' + META_AD_STATUSES[csk].label + '</option>';
    html += '</select>';
    html += '<span class="cp-text-muted" style="font-size:12px">' + ads.length + ' ad' + (ads.length !== 1 ? 's' : '') + ' with due dates</span>';
    html += '</div>';

    if (cpIsPhone()) {
      // Mobile: vertical day-list — chronological cards for days with ads or
      // inside any campaign's range.
      html += renderCalMobileList(year, month, adsByDate, camps, now);
    } else {
      // Campaign bars (Meta v2)
      if (camps.length > 0) {
        html += '<div class="cp-cal-campaign-bars">';
        for (var ci = 0; ci < camps.length; ci++) {
          var camp = camps[ci];
          var cst = META_CAMPAIGN_STATUSES[camp.status] || { color: '#80868b' };
          html += '<div class="cp-cal-campaign-row" data-action="go-to-campaign" data-id="' + esc(camp.id) + '" style="cursor:pointer">';
          html += '<span class="cp-cal-campaign-name" style="color:' + cst.color + '">' + icon('bullhorn') + ' ' + esc(truncate(camp.name, 16)) + '</span>';
          html += '<div class="cp-cal-campaign-bar-track">';
          var monthStart = new Date(year, month, 1);
          var monthEnd = new Date(year, month + 1, 0);
          var cStart = new Date(camp.start_time);
          var cEnd = new Date(camp.stop_time);
          var daysInMonth = monthEnd.getDate();
          var barLeft = Math.max(0, Math.floor(((cStart - monthStart) / (1000 * 60 * 60 * 24)) / daysInMonth * 100));
          var barRight = Math.max(0, 100 - Math.ceil(((cEnd - monthStart) / (1000 * 60 * 60 * 24) + 1) / daysInMonth * 100));
          if (cEnd < monthStart || cStart > monthEnd) { barLeft = 0; barRight = 100; }
          html += '<div class="cp-cal-campaign-bar" style="left:' + barLeft + '%;right:' + barRight + '%;background:' + cst.color + '20;border-color:' + cst.color + '50"></div>';
          html += '</div></div>';
        }
        html += '</div>';
      }

      // Calendar grid
      html += renderCalMonthGrid(year, month, dayNames, adsByDate, now);
    }

    html += '</div>';
    return html;
  }

  function renderCalMobileList(year, month, adsByDate, camps, now) {
    var monthStart = new Date(year, month, 1);
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var today = now.getDate();
    var todayMonth = now.getMonth();
    var todayYear = now.getFullYear();
    var dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Active campaigns per day
    function campsOnDay(d) {
      var out = [];
      var dayDate = new Date(year, month, d);
      for (var i = 0; i < camps.length; i++) {
        var c = camps[i];
        var cs = new Date(c.start_time);
        var ce = new Date(c.stop_time);
        cs.setHours(0, 0, 0, 0); ce.setHours(23, 59, 59, 999);
        if (dayDate >= cs && dayDate <= ce) out.push(c);
      }
      return out;
    }

    var html = '<div class="cp-cal-list">';
    var hasAny = false;
    for (var d = 1; d <= daysInMonth; d++) {
      var dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
      var dayAds = adsByDate[dateStr] || [];
      var dayCamps = camps.length > 0 ? campsOnDay(d) : [];
      if (dayAds.length === 0 && dayCamps.length === 0) continue;
      hasAny = true;
      var isToday = d === today && month === todayMonth && year === todayYear;
      var dateObj = new Date(year, month, d);
      html += '<div class="cp-cal-list-day' + (isToday ? ' cp-cal-list-day-today' : '') + '">';
      html += '<div class="cp-cal-list-day-header">';
      html += '<div class="cp-cal-list-day-num">' + d + '</div>';
      html += '<div class="cp-cal-list-day-meta"><div class="cp-cal-list-day-name">' + dayLabels[dateObj.getDay()] + '</div>';
      if (isToday) html += '<div class="cp-cal-list-day-today-pill">Today</div>';
      html += '</div></div>';

      if (dayCamps.length > 0) {
        html += '<div class="cp-cal-list-camps">';
        for (var ci = 0; ci < dayCamps.length; ci++) {
          var dc = dayCamps[ci];
          var dcst = META_CAMPAIGN_STATUSES[dc.status] || { color: '#80868b' };
          html += '<span class="cp-cal-list-camp-chip" style="background:' + dcst.color + '15;color:' + dcst.color + '" data-action="go-to-campaign" data-id="' + esc(dc.id) + '">' + icon('bullhorn') + ' ' + esc(truncate(dc.name, 24)) + '</span>';
        }
        html += '</div>';
      }

      if (dayAds.length > 0) {
        html += '<div class="cp-cal-list-ads">';
        for (var ai = 0; ai < dayAds.length; ai++) {
          var ad = dayAds[ai];
          var aSt = META_AD_STATUSES[ad.pipeline_status] || { color: '#80868b', label: ad.pipeline_status || '' };
          html += '<button class="cp-cal-list-ad" data-action="ws-select-ad" data-id="' + esc(ad.id) + '">';
          html += '<span class="cp-cal-list-ad-dot" style="background:' + aSt.color + '"></span>';
          html += '<span class="cp-cal-list-ad-name">' + esc(ad.name || 'Untitled') + '</span>';
          if (aSt.label) html += '<span class="cp-cal-list-ad-status" style="color:' + aSt.color + '">' + esc(aSt.label) + '</span>';
          html += '</button>';
        }
        html += '</div>';
      }

      html += '</div>';
    }
    if (!hasAny) {
      html += '<div class="cp-cal-list-empty">' + icon('calendar') + ' Nothing scheduled this month.</div>';
    }
    html += '</div>';
    return html;
  }

  function renderCalMonthGrid(year, month, dayNames, adsByDate, now) {
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
      var dayAds = isValid && adsByDate[dateStr] ? adsByDate[dateStr] : [];

      html += '<div class="cp-cal-day' + (isValid ? '' : ' cp-cal-day-empty') + (isToday ? ' cp-cal-day-today' : '') + '">';
      if (isValid) {
        html += '<div class="cp-cal-day-header"><span class="cp-cal-day-num">' + dayNum + '</span>';
        if (dayAds.length > 0) html += '<span class="cp-cal-day-count">' + dayAds.length + '</span>';
        html += '</div>';
        for (var dai = 0; dai < Math.min(dayAds.length, 3); dai++) {
          var ad = dayAds[dai];
          var aSt = META_AD_STATUSES[ad.pipeline_status] || { color: '#80868b' };
          html += '<div class="cp-cal-recipe-chip" style="background:' + aSt.color + '15;color:' + aSt.color + '" data-action="ws-select-ad" data-id="' + esc(ad.id) + '">';
          html += '<span class="cp-cal-chip-title">' + esc(truncate(ad.name || 'Untitled', 14)) + '</span>';
          html += '</div>';
        }
        if (dayAds.length > 3) html += '<div class="cp-cal-more">+' + (dayAds.length - 3) + ' more</div>';
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }


/* ===== src/10-part1/19-view-activity.js ===== */
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
      { label: 'Personas', types: ['persona_created', 'persona_updated', 'persona_deleted', 'category_created', 'category_deleted'] },
      { label: 'Messages', types: ['message_created', 'message_updated', 'message_deleted'] },
      { label: 'Styles/Formats', types: ['style_created', 'style_updated', 'style_deleted', 'format_created', 'format_updated', 'format_deleted'] },
      { label: 'Campaigns (v2)', types: ['campaign_v2_created', 'campaign_v2_updated', 'campaign_v2_deleted', 'ad_set_created', 'ad_set_updated', 'ad_set_deleted', 'ad_created', 'ad_updated', 'ad_deleted', 'ad_status_changed', 'campaign_tree_generated', 'snapshot_resynced'] },
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


/* ===== src/10-part1/20-view-placeholders.js ===== */
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

  // ---- Mobile sidebar drawer helpers ----
  function openMobileSidebar() {
    S.sidebarMobileOpen = true;
    $('#cpSidebar').addClass('cp-sidebar-open');
    $('#cpSidebarBackdrop').addClass('cp-sidebar-backdrop-visible').attr('aria-hidden', 'false');
    $('#cpSidebarToggle').attr('aria-expanded', 'true');
  }
  function closeMobileSidebar() {
    S.sidebarMobileOpen = false;
    $('#cpSidebar').removeClass('cp-sidebar-open');
    $('#cpSidebarBackdrop').removeClass('cp-sidebar-backdrop-visible').attr('aria-hidden', 'true');
    $('#cpSidebarToggle').attr('aria-expanded', 'false');
  }
  // Edge-swipe to open / swipe-left on sidebar to close. Bound once at init.
  function setupSidebarSwipe() {
    if (window._cpSwipeBound) return;
    window._cpSwipeBound = true;
    var startX = 0, startY = 0, startT = 0, startedOnSidebar = false;
    var EDGE = 24, MIN_DX = 60, MAX_DY = 40, MAX_T = 400;
    document.addEventListener('touchstart', function(e) {
      if (!window.matchMedia('(max-width: 992px)').matches) return;
      var t = e.touches[0];
      startX = t.clientX; startY = t.clientY; startT = Date.now();
      startedOnSidebar = !!(e.target && e.target.closest && e.target.closest('#cpSidebar'));
    }, { passive: true });
    document.addEventListener('touchend', function(e) {
      if (!window.matchMedia('(max-width: 992px)').matches) return;
      var t = (e.changedTouches && e.changedTouches[0]) || null;
      if (!t) return;
      var dx = t.clientX - startX;
      var dy = Math.abs(t.clientY - startY);
      var dt = Date.now() - startT;
      if (dy > MAX_DY || dt > MAX_T) return;
      // Open: swipe right from left edge while drawer closed
      if (!S.sidebarMobileOpen && startX <= EDGE && dx >= MIN_DX) openMobileSidebar();
      // Close: swipe left while drawer open
      else if (S.sidebarMobileOpen && startedOnSidebar && dx <= -MIN_DX) closeMobileSidebar();
    }, { passive: true });
  }

  function setupEventHandlers() {
    console.log('[CP] Setting up core event handlers...');

    // Sidebar navigation
    $(document).off('click.cp-nav').on('click.cp-nav', '.cp-nav-item', function(e) {
      e.preventDefault();
      var viewName = $(this).data('view');
      if (viewName) navigate(viewName);
      // Auto-close mobile drawer after picking a destination
      if (S.sidebarMobileOpen && window.matchMedia('(max-width: 992px)').matches) {
        closeMobileSidebar();
      }
    });

    // View-crash card actions
    $(document).off('click.cp-crash-reload').on('click.cp-crash-reload', '[data-action="crash-reload"]', function(e) {
      e.preventDefault(); location.reload();
    });
    $(document).off('click.cp-crash-dash').on('click.cp-crash-dash', '[data-action="crash-go-dashboard"]', function(e) {
      e.preventDefault(); navigate('dashboard');
    });

    // Mobile sidebar drawer: toggle, backdrop click, escape, swipe
    $(document).off('click.cp-sidebar-toggle').on('click.cp-sidebar-toggle', '#cpSidebarToggle', function(e) {
      e.preventDefault();
      if (S.sidebarMobileOpen) closeMobileSidebar(); else openMobileSidebar();
    });
    $(document).off('click.cp-sidebar-backdrop').on('click.cp-sidebar-backdrop', '#cpSidebarBackdrop', function() {
      closeMobileSidebar();
    });
    $(document).off('keydown.cp-sidebar-esc').on('keydown.cp-sidebar-esc', function(e) {
      if (e.key === 'Escape' && S.sidebarMobileOpen) closeMobileSidebar();
    });
    setupSidebarSwipe();
    setupResponsiveRerender();

    // Setup submit
    $(document).off('click.cp-setup').on('click.cp-setup', '#cpSetupSubmit', function(e) {
      e.preventDefault();
      completeSetup();
    });

    // Go-view buttons (data-action="go-view" data-view="xxx")
    // Optional data-tab="..." can set a sub-tab (currently only Personas
    // view uses this — for the Pain Points tab).
    $(document).off('click.cp-go-view').on('click.cp-go-view', '[data-action="go-view"]', function(e) {
      e.preventDefault();
      var v = $(this).data('view');
      var tab = $(this).data('tab');
      if (!v) return;
      if (v === 'personas' && tab) S.personasTab = tab;
      navigate(v);
    });

    // Navigate to a Meta v2 Campaign in the Workspace
    $(document).off('click.cp-go-campaign').on('click.cp-go-campaign', '[data-action="go-to-campaign"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var campId = $(this).data('id');
      if (campId && typeof window._cpNavigateToCampaignV2 === 'function') {
        window._cpNavigateToCampaignV2(campId);
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
      // Search Meta v2 Campaigns + Ads
      (S.data.campaigns_v2 || []).forEach(function(c) {
        if ((c.name || '').toLowerCase().indexOf(q) > -1 || (c.objective || '').toLowerCase().indexOf(q) > -1) {
          var st = (META_CAMPAIGN_STATUSES && META_CAMPAIGN_STATUSES[c.status]) || {};
          results.push({ type: 'campaign_v2', icon: 'bullhorn', color: '#0891b2', title: c.name, sub: st.label || c.status || '', id: c.id, view: 'campaign_workspace' });
        }
      });
      (S.data.ads || []).forEach(function(a) {
        if ((a.name || '').toLowerCase().indexOf(q) > -1) {
          var st2 = (META_AD_STATUSES && META_AD_STATUSES[a.pipeline_status]) || {};
          results.push({ type: 'ad', icon: 'rectangle-ad', color: '#e37400', title: a.name, sub: st2.label || a.pipeline_status || '', id: a.id, view: 'campaign_workspace' });
        }
      });
      // Search pain points
      (S.data.pain_points || []).forEach(function(pp) {
        if ((pp.pain_point || '').toLowerCase().indexOf(q) > -1) {
          results.push({ type: 'pain_point', icon: 'bolt', color: '#d93025', title: truncate(pp.pain_point, 40), sub: pp.category || '', id: pp.id, view: 'personas', tab: 'pain_points' });
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
        rHtml += '<div class="cp-global-search-item" data-action="global-search-go" data-view="' + esc(r.view) + '" data-id="' + esc(r.id) + '" data-type="' + esc(r.type) + '"' + (r.tab ? ' data-tab="' + esc(r.tab) + '"' : '') + '">';
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
      var tab = $(this).data('tab');
      $('#cpGlobalSearchInput').val('');
      $('#cpGlobalSearchResults').hide();
      if (type === 'persona') S.selectedPersonaId = id;
      else if (type === 'pain_point') { S.selectedPainPointId = id; if (view === 'personas') S.personasTab = tab || 'pain_points'; }
      else if (type === 'campaign_v2') { if (typeof window._cpNavigateToCampaignV2 === 'function') return window._cpNavigateToCampaignV2(id); }
      else if (type === 'ad') {
        var ad = S.adMap[id];
        if (ad && typeof window._cpNavigateToCampaignV2 === 'function') {
          var set = S.adSetMap[ad.ad_set_id];
          return window._cpNavigateToCampaignV2(set ? set.campaign_id : null, ad.ad_set_id, ad.id);
        }
      }
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

    // From a Pain Point's "Linked personas" list — jump to that persona
    // (switch the Personas-view tab back to "personas" too).
    $(document).off('click.cp-sel-persona-pp').on('click.cp-sel-persona-pp', '[data-action="select-persona-from-pp"]', function(e) {
      e.preventDefault();
      var id = $(this).data('persona-id');
      if (!id) return;
      S.selectedPersonaId = id;
      S.personasTab = 'personas';
      renderCurrentView();
    });

    // Toggle category collapse
    $(document).off('click.cp-toggle-group').on('click.cp-toggle-group', '[data-action="toggle-group"]', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var groupKey = $(this).data('group');
      if (groupKey) {
        S.collapsedGroups = S.collapsedGroups || {};
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
    $(document).off('change.cp-pp-group-by').on('change.cp-pp-group-by', '#cpPainPointGroupBy', function() {
      S.painPointFilter = S.painPointFilter || {};
      S.painPointFilter.groupBy = $(this).val() || 'category';
      renderCurrentView();
    });
    $(document).off('click.cp-pp-group-toggle').on('click.cp-pp-group-toggle', '[data-action="toggle-pp-group"]', function(e) {
      e.preventDefault();
      var catId = $(this).data('cat-id');
      if (!catId) return;
      S.collapsedGroups = S.collapsedGroups || {};
      var key = 'ppcat_' + catId;
      S.collapsedGroups[key] = !S.collapsedGroups[key];
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

    // Select entity from activity
    $(document).off('click.cp-select-entity').on('click.cp-select-entity', '[data-action="select-entity"]', function(e) {
      e.preventDefault();
      var type = $(this).data('type');
      var id = $(this).data('id');
      if (type === 'persona' && id) { S.selectedPersonaId = id; navigate('personas'); }
      else if (type === 'message' && id) { navigate('messages'); }
      else if (type === 'campaign_v2' && id) { if (typeof window._cpNavigateToCampaignV2 === 'function') window._cpNavigateToCampaignV2(id); }
      else if (type === 'ad' && id) {
        var ad = S.adMap[id];
        if (ad && typeof window._cpNavigateToCampaignV2 === 'function') {
          var set = S.adSetMap[ad.ad_set_id];
          window._cpNavigateToCampaignV2(set ? set.campaign_id : null, ad.ad_set_id, ad.id);
        }
      }
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


/* ===== src/10-part1/21-filter-sort.js ===== */
  // ============================================================
  // SECTION 19: FILTERING & SORTING HELPERS
  // ============================================================

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
    else msgs.sort(function(a, b) { return (b.updated || b.created || '') > (a.updated || a.created || '') ? 1 : -1; });
    return msgs;
  }

/* ===== src/10-part1/22-crud-helpers.js ===== */
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
          tags: [],
          created: now, updated: now
        }, data);
        S.data.visual_formats.push(entity);
        logActivity('format_created', 'format', entity.id, entity.name, 'Created visual format');
        break;

      case 'tag':
        entity = $.extend(true, {
          id: generateId('tag'), name: '', color: '#1a73e8', description: '',
          created: now
        }, data);
        S.data.tags.push(entity);
        logActivity('tag_created', 'tag', entity.id, entity.name, 'Created tag');
        break;

      // --- Meta v2 hierarchy ---

      case 'campaign_v2':
        entity = $.extend(true, {
          id: generateId('cmpv2'),
          name: '', description: '',
          objective: META_CAMPAIGN_DEFAULTS.objective,
          buying_type: META_CAMPAIGN_DEFAULTS.buying_type,
          budget_mode: META_CAMPAIGN_DEFAULTS.budget_mode,
          daily_budget: null, lifetime_budget: null, spend_cap: null,
          bid_strategy: META_CAMPAIGN_DEFAULTS.bid_strategy,
          special_ad_categories: META_CAMPAIGN_DEFAULTS.special_ad_categories.slice(),
          start_time: '', stop_time: '',
          status: META_CAMPAIGN_DEFAULTS.status,
          ab_test: { enabled: false, primary_metric: '', variants: [] },
          ai_instructions: '', brief: '',
          tags: [], notes: '',
          created: now, updated: now, created_by: S.user.id || ''
        }, data);
        S.data.campaigns_v2.push(entity);
        logActivity('campaign_v2_created', 'campaign_v2', entity.id, entity.name, 'Created campaign');
        break;

      case 'ad_set':
        entity = $.extend(true, {
          id: generateId('adset'),
          campaign_id: '', name: '',
          persona_id: '', persona_snapshot: null, audience_overrides: '',
          placements: { advantage_enabled: true, custom_placements: [] },
          optimization_goal: META_AD_SET_DEFAULTS.optimization_goal,
          billing_event: META_AD_SET_DEFAULTS.billing_event,
          attribution_setting: META_AD_SET_DEFAULTS.attribution_setting,
          bid_amount: null,
          daily_budget: null, lifetime_budget: null,
          start_time: '', stop_time: '', dayparting: null,
          brief: { creative_direction: '', message_ids: [], style_ids: [], format_ids: [], hook_angles: [], ai_notes: '' },
          ab_role: null,
          status: META_AD_SET_DEFAULTS.status,
          notes: '',
          created: now, updated: now, created_by: S.user.id || ''
        }, data);
        if (!entity.name) {
          var camp = S.campaignV2Map[entity.campaign_id];
          var persona = S.personaMap[entity.persona_id];
          entity.name = (camp ? camp.name + ' — ' : '') + (persona ? persona.name : 'New Ad Set');
        }
        S.data.ad_sets.push(entity);
        logActivity('ad_set_created', 'ad_set', entity.id, entity.name, 'Created ad set');
        break;

      case 'ad':
        entity = $.extend(true, {
          id: generateId('ad'),
          ad_set_id: '', name: '',
          creative_type: META_AD_DEFAULTS.creative_type,
          creative: { primary_text: '', headline: '', description: '', cta_type: 'LEARN_MORE', cta_link: '', display_link: '', tracking_params: '' },
          hook: { source_message_id: '', selected_hook_id: '', text: '', type: 'direct' },
          media: {
            image: { asset_id: '', prompt: '', aspect_ratio: '1:1' },
            video: { asset_id: '', duration_seconds: 30, aspect_ratio: '9:16', concept: '', script: { sections: [] } },
            carousel_cards: []
          },
          message_snapshot: null, style_snapshot: null, format_snapshot: null,
          pipeline_status: META_AD_DEFAULTS.pipeline_status,
          review_notes: '', production_notes: '', assigned_to: '', due_date: '',
          tags: [],
          created: now, updated: now, created_by: S.user.id || ''
        }, data);
        if (!entity.name) {
          var adSet = S.adSetMap[entity.ad_set_id];
          var existing = (S.adsByAdSet[entity.ad_set_id] || []).length;
          entity.name = (adSet ? adSet.name + ' — Ad ' : 'Ad ') + (existing + 1);
        }
        S.data.ads.push(entity);
        logActivity('ad_created', 'ad', entity.id, entity.name, 'Created ad');
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
        logActivity('pain_point_deleted', 'pain_point', id, truncate(entityTitle, 40), 'Deleted pain point');
        break;

      case 'message':
        entity = S.messageMap[id]; if (!entity) return false;
        entityTitle = entity.title;
        idx = S.data.messages.findIndex(function(m) { return m.id === id; });
        if (idx > -1) S.data.messages.splice(idx, 1);
        logActivity('message_deleted', 'message', id, entityTitle, 'Deleted message');
        break;

      case 'style':
        entity = S.styleMap[id]; if (!entity) return false;
        entityTitle = entity.name;
        idx = S.data.styles.findIndex(function(s) { return s.id === id; });
        if (idx > -1) S.data.styles.splice(idx, 1);
        logActivity('style_deleted', 'style', id, entityTitle, 'Deleted style');
        break;

      case 'visual_format':
        entity = S.formatMap[id]; if (!entity) return false;
        entityTitle = entity.name;
        idx = S.data.visual_formats.findIndex(function(f) { return f.id === id; });
        if (idx > -1) S.data.visual_formats.splice(idx, 1);
        logActivity('format_deleted', 'format', id, entityTitle, 'Deleted visual format');
        break;

      case 'tag':
        entity = S.tagMap[id]; if (!entity) return false;
        entityTitle = entity.name;
        idx = S.data.tags.findIndex(function(t) { return t.id === id; });
        if (idx > -1) S.data.tags.splice(idx, 1);
        var allArrays = [S.data.personas, S.data.messages, S.data.styles, S.data.visual_formats, S.data.campaigns_v2, S.data.ad_sets, S.data.ads];
        allArrays.forEach(function(arr) {
          (arr || []).forEach(function(item) {
            if (item.tags) item.tags = item.tags.filter(function(tid) { return tid !== id; });
          });
        });
        if (S.selectedTagId === id) S.selectedTagId = null;
        logActivity('tag_deleted', 'tag', id, entityTitle, 'Deleted tag');
        break;

      case 'campaign_v2':
        entity = S.campaignV2Map[id]; if (!entity) return false;
        entityTitle = entity.name;
        idx = S.data.campaigns_v2.findIndex(function(c) { return c.id === id; });
        if (idx > -1) S.data.campaigns_v2.splice(idx, 1);
        // Cascade: delete all Ad Sets + Ads under this campaign
        var orphanSets = (S.data.ad_sets || []).filter(function(s) { return s.campaign_id === id; });
        var orphanSetIds = orphanSets.map(function(s) { return s.id; });
        S.data.ad_sets = (S.data.ad_sets || []).filter(function(s) { return s.campaign_id !== id; });
        S.data.ads = (S.data.ads || []).filter(function(a) { return orphanSetIds.indexOf(a.ad_set_id) === -1; });
        if (S.selectedCampaignV2Id === id) { S.selectedCampaignV2Id = null; S.selectedAdSetId = null; S.selectedAdId = null; }
        logActivity('campaign_v2_deleted', 'campaign_v2', id, entityTitle, 'Deleted campaign and ' + orphanSets.length + ' ad set(s)');
        break;

      case 'ad_set':
        entity = S.adSetMap[id]; if (!entity) return false;
        entityTitle = entity.name;
        idx = S.data.ad_sets.findIndex(function(s) { return s.id === id; });
        if (idx > -1) S.data.ad_sets.splice(idx, 1);
        // Cascade: delete all Ads under this Ad Set
        var orphanAds = (S.data.ads || []).filter(function(a) { return a.ad_set_id === id; });
        S.data.ads = (S.data.ads || []).filter(function(a) { return a.ad_set_id !== id; });
        // Remove from parent campaign's A/B variants list if present
        (S.data.campaigns_v2 || []).forEach(function(c) {
          if (c.ab_test && Array.isArray(c.ab_test.variants)) {
            c.ab_test.variants = c.ab_test.variants.filter(function(v) { return v.ad_set_id !== id; });
          }
        });
        if (S.selectedAdSetId === id) { S.selectedAdSetId = null; S.selectedAdId = null; }
        logActivity('ad_set_deleted', 'ad_set', id, entityTitle, 'Deleted ad set and ' + orphanAds.length + ' ad(s)');
        break;

      case 'ad':
        entity = S.adMap[id]; if (!entity) return false;
        entityTitle = entity.name;
        idx = S.data.ads.findIndex(function(a) { return a.id === id; });
        if (idx > -1) S.data.ads.splice(idx, 1);
        if (S.selectedAdId === id) S.selectedAdId = null;
        logActivity('ad_deleted', 'ad', id, entityTitle, 'Deleted ad');
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
      visual_format: S.data.visual_formats,
      pain_point: S.data.pain_points, persona_category: S.data.persona_categories, tag: S.data.tags,
      campaign_v2: S.data.campaigns_v2, ad_set: S.data.ad_sets, ad: S.data.ads
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

    // Ad pipeline status change logging
    if (type === 'ad' && field === 'pipeline_status') {
      var adLabel = (META_AD_STATUSES[value] || {}).label || value;
      logActivity('ad_status_changed', 'ad', id, entity.name, 'Pipeline status → ' + adLabel);
    }
    // Touch parent updated timestamps for Meta v2 entities so the workspace
    // reflects recent activity at any level
    if (type === 'ad' && entity.ad_set_id) {
      var pSet = S.adSetMap[entity.ad_set_id];
      if (pSet) pSet.updated = new Date().toISOString();
    }
    if (type === 'ad_set' && entity.campaign_id) {
      var pCamp = S.campaignV2Map[entity.campaign_id];
      if (pCamp) pCamp.updated = new Date().toISOString();
    }

    buildMaps();
    syncToTextarea();
    renderCurrentView();
  }

  function duplicateEntity(type, id) {
    var collections = {
      persona: S.data.personas, message: S.data.messages, style: S.data.styles,
      visual_format: S.data.visual_formats,
      campaign_v2: S.data.campaigns_v2, ad_set: S.data.ad_sets, ad: S.data.ads
    };
    var coll = collections[type];
    if (!coll) return null;

    var source = coll.find(function(e) { return e.id === id; });
    if (!source) return null;

    var idPrefixes = { campaign_v2: 'cmpv2', ad_set: 'adset', ad: 'ad' };
    var clone = deepClone(source);
    clone.id = generateId(idPrefixes[type] || type.substring(0, 3));
    clone.created = new Date().toISOString();
    clone.updated = clone.created;
    clone.created_by = S.user.id || '';
    if (clone.title) clone.title += ' (copy)';
    if (clone.name) clone.name += ' (copy)';
    if (type === 'campaign_v2') { clone.status = 'DRAFT'; clone.ab_test = { enabled: false, primary_metric: '', variants: [] }; }
    if (type === 'ad_set')      { clone.status = 'DRAFT'; clone.ab_role = null; }
    if (type === 'ad')          { clone.pipeline_status = 'hook_ready'; clone.review_notes = ''; clone.assigned_to = ''; }

    coll.push(clone);
    logActivity(type + '_created', type, clone.id, clone.title || clone.name, 'Duplicated');
    buildMaps();
    syncToTextarea();
    renderCurrentView();
    toast(capitalize(type.replace(/_/g, ' ')) + ' duplicated', 'success');
    return clone;
  }

  function capitalize(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''; }


/* ===== src/10-part1/23-auto-status.js ===== */
  // ============================================================
  // SECTION 22: PERSISTENCE + LOGGING HELPERS
  // ============================================================

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


/* ===== src/10-part1/23a-library-workspace-integration.js ===== */
  // ============================================================
  // SECTION 23: LIBRARY ↔ WORKSPACE INTEGRATION (v2)
  // ============================================================
  //
  // Reverse-lookup helpers + "Used in workspace" widget injected into
  // library entity detail panes. Only renders when meta_v2 is enabled.

  // --- Reverse-lookup helpers ---

  function findAdSetsUsingPersona(personaId) {
    if (!personaId) return [];
    return (S.data.ad_sets || []).filter(function(s) { return s.persona_id === personaId; });
  }
  function findAdSetsUsingMessage(messageId) {
    if (!messageId) return [];
    return (S.data.ad_sets || []).filter(function(s) {
      return s.brief && (s.brief.message_ids || []).indexOf(messageId) > -1;
    });
  }
  function findAdSetsUsingStyle(styleId) {
    if (!styleId) return [];
    return (S.data.ad_sets || []).filter(function(s) {
      return s.brief && (s.brief.style_ids || []).indexOf(styleId) > -1;
    });
  }
  function findAdSetsUsingFormat(formatId) {
    if (!formatId) return [];
    return (S.data.ad_sets || []).filter(function(s) {
      return s.brief && (s.brief.format_ids || []).indexOf(formatId) > -1;
    });
  }
  function findAdsUsingMessage(messageId) {
    if (!messageId) return [];
    return (S.data.ads || []).filter(function(a) {
      return (a.hook && a.hook.source_message_id === messageId) ||
             (a.message_snapshot && a.message_snapshot.source_id === messageId);
    });
  }
  function findAdSetsUsingPainPoint(painPointId) {
    if (!painPointId) return [];
    // Pain points are attached to personas via persona.pain_point_ids.
    // Forward to the persona-level lookup for each persona that has this pain.
    var personasUsingPain = (S.data.personas || []).filter(function(p) {
      return (p.pain_point_ids || []).indexOf(painPointId) > -1;
    });
    var sets = [];
    personasUsingPain.forEach(function(p) {
      findAdSetsUsingPersona(p.id).forEach(function(s) {
        if (sets.indexOf(s) === -1) sets.push(s);
      });
    });
    return sets;
  }

  // --- "Used in workspace" widget ---
  //
  // Returns an HTML block to inject at the bottom of a library entity
  // detail pane. Empty string if meta_v2 is off (no clutter for legacy
  // users). Shows: count of Ad Sets / Ads using this entity, list with
  // links into the workspace, and a "Use in new Ad Set" / "Pull into
  // an Ad" action depending on entity type.
  function renderLibraryWorkspaceUsage(type, entityId) {
    if (!isMetaV2Enabled()) return '';
    if (!entityId) return '';

    var html = '<div class="cp-card cp-library-workspace-usage">';
    html += '<div class="cp-section-header"><h3>' + icon('sitemap') + ' Used in workspace</h3>';

    // Type-specific CTA in the header
    if (type === 'persona') {
      html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="lib-create-ad-set-from-persona" data-id="' + esc(entityId) + '">' + icon('plus') + ' Create Ad Set</button>';
    } else if (type === 'message' || type === 'style' || type === 'visual_format') {
      html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="lib-attach-to-ad-set-brief" data-type="' + type + '" data-id="' + esc(entityId) + '">' + icon('plus') + ' Attach to Ad Set brief</button>';
    }
    html += '</div>';

    var sets = [];
    var ads = [];
    switch (type) {
      case 'persona':       sets = findAdSetsUsingPersona(entityId); break;
      case 'message':       sets = findAdSetsUsingMessage(entityId); ads = findAdsUsingMessage(entityId); break;
      case 'style':         sets = findAdSetsUsingStyle(entityId); break;
      case 'visual_format': sets = findAdSetsUsingFormat(entityId); break;
      case 'pain_point':    sets = findAdSetsUsingPainPoint(entityId); break;
    }

    if (sets.length === 0 && ads.length === 0) {
      html += '<p class="cp-text-muted">Not used in any Ad Set or Ad yet.</p>';
    } else {
      if (sets.length > 0) {
        html += '<div class="cp-library-usage-subhead">' + icon('crosshairs') + ' ' + sets.length + ' Ad Set' + (sets.length !== 1 ? 's' : '') + '</div>';
        html += '<div class="cp-library-usage-list">';
        for (var i = 0; i < sets.length; i++) {
          var s = sets[i];
          var camp = S.campaignV2Map[s.campaign_id];
          html += '<a class="cp-library-usage-item" data-action="lib-open-ad-set" data-id="' + esc(s.id) + '" data-campaign-id="' + esc(s.campaign_id) + '">';
          html += '<span class="cp-library-usage-icon">' + icon('crosshairs') + '</span>';
          html += '<span class="cp-library-usage-text">' + esc(s.name) + (camp ? '<span class="cp-text-muted"> · ' + esc(camp.name) + '</span>' : '') + '</span>';
          html += '<span class="cp-library-usage-arrow">' + icon('arrow-right') + '</span>';
          html += '</a>';
        }
        html += '</div>';
      }
      if (ads.length > 0) {
        html += '<div class="cp-library-usage-subhead">' + icon('rectangle-ad') + ' ' + ads.length + ' Ad' + (ads.length !== 1 ? 's' : '') + '</div>';
        html += '<div class="cp-library-usage-list">';
        for (var j = 0; j < ads.length; j++) {
          var a = ads[j];
          var adSet = S.adSetMap[a.ad_set_id];
          html += '<a class="cp-library-usage-item" data-action="lib-open-ad" data-id="' + esc(a.id) + '">';
          html += '<span class="cp-library-usage-icon">' + icon('rectangle-ad') + '</span>';
          html += '<span class="cp-library-usage-text">' + esc(a.name) + (adSet ? '<span class="cp-text-muted"> · ' + esc(adSet.name) + '</span>' : '') + '</span>';
          html += '<span class="cp-library-usage-arrow">' + icon('arrow-right') + '</span>';
          html += '</a>';
        }
        html += '</div>';
      }
    }

    html += '</div>';
    return html;
  }

/* ===== src/10-part1/24-exports.js ===== */
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

/* ===== src/20-part2a/00-header.js ===== */
/**
 * Campaign Planner v1.0 - Part 2A: CRUD, Pipeline Editor & Mix/Match
 *
 * Modals, undo/redo, 9 entity CRUDs, 5 pipeline step renderers,
 * Mix & Match Engine, tag input component, event handlers.
 *
 * Registry: step_composition, step_hook, step_content, step_media,
 *   step_review, tagInput
 *
 * Sections:
 *  1. Init & imports
 *  2. Modal system
 *  3. Undo/redo
 *  4. Category CRUD
 *  5. Persona CRUD
 *  6. Pain Point CRUD
 *  7. Message CRUD (with hooks)
 *  8. Style & Format CRUD
 *  9. Campaign CRUD
 * 10. Tag CRUD
 * 11. Composition step renderer
 * 12. Hook step renderer
 * 13. Content step renderer
 * 14. Media step renderer (image + video)
 * 15. Review step renderer
 * 16. Save helpers (pipeline-specific)
 * 17. Mix & Match Engine
 * 18. Tag input component
 * 19. Event handlers
 * 20. API exports
 *
 * @version 1.0.0
 */
(function($, Drupal) {
  'use strict';

  // Early load flag — set immediately so Part 2B knows this file loaded
  window._cpPart2AScript = true;


/* ===== src/20-part2a/01-init-imports.js ===== */
  // ============================================================
  // SECTION 1: INIT & IMPORTS
  // ============================================================

  var S, render, navigate, toast, generateId, buildMaps, syncToTextarea;
  var updateSaveStatus, esc, deepClone, icon, formatDate, formatRelativeTime;
  var truncate, formatNumber, stripHtml, countWords, countChars;
  var badge, priorityBadge;
  var funnelBadge, dimensionBadge, mediaTypeBadge, hookTypeBadge, progressBar;
  var logActivity;
  var debounce;
  var createEntity, deleteEntity, saveEntityField, duplicateEntity;
  var getAllPersonas, getAllMessages, getAllStyles, getAllFormats;
  var getAllCategories, getAllPainPoints, getAllTags;
  var getPersonaPainPoints, getPersona, getMessage, getStyle, getFormat;
  var getCategory, getTag, getPainPoint, getFunnelStage;
  var getProductionStatusStyle, parseProductionData;
  var Constants;
  // Meta v2 imports
  var getCampaignV2, getAdSet, getAd;
  var getAllCampaignsV2, getAllAdSets, getAllAds;
  var getAdSetsByCampaign, getAdsByAdSet, getAdsByCampaign;
  var isMetaV2Enabled;
  var metaObjective, metaOptimizationGoal, metaBillingEvent, metaPlacement;
  var metaCTA, metaCampaignStatus, metaAdSetStatus, metaAdStatus;
  var metaOptimizationGoalsForObjective;
  var isPersonaSnapshotStale, isMessageSnapshotStale;
  var evaluateAdAutoStatus, maybeAdvanceAdStatus;

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
    priorityBadge = window._cpPriorityBadge; funnelBadge = window._cpFunnelBadge;
    dimensionBadge = window._cpDimensionBadge; mediaTypeBadge = window._cpMediaTypeBadge;
    hookTypeBadge = window._cpHookTypeBadge;
    progressBar = window._cpProgressBar;
    logActivity = window._cpLogActivity;
    debounce = window._cpDebounce;
    createEntity = window._cpCreateEntity; deleteEntity = window._cpDeleteEntity;
    saveEntityField = window._cpSaveEntityField; duplicateEntity = window._cpDuplicateEntity;
    getAllPersonas = window._cpGetAllPersonas; getAllMessages = window._cpGetAllMessages;
    getAllStyles = window._cpGetAllStyles; getAllFormats = window._cpGetAllFormats;
    getAllCategories = window._cpGetAllCategories; getAllPainPoints = window._cpGetAllPainPoints;
    getAllTags = window._cpGetAllTags;
    getPersonaPainPoints = window._cpGetPersonaPainPoints;
    getPersona = window._cpGetPersona; getMessage = window._cpGetMessage;
    getStyle = window._cpGetStyle; getFormat = window._cpGetFormat;
    getCategory = window._cpGetCategory;
    getTag = window._cpGetTag; getPainPoint = window._cpGetPainPoint;
    getFunnelStage = window._cpGetFunnelStage;
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
    isPersonaSnapshotStale = window._cpIsPersonaSnapshotStale;
    isMessageSnapshotStale = window._cpIsMessageSnapshotStale;
    evaluateAdAutoStatus = window._cpEvaluateAdAutoStatus;
    maybeAdvanceAdStatus = window._cpMaybeAdvanceAdStatus;

    // AI picker helper — lazy evaluation (Part 2B may not be loaded yet)
    window._cpAiSel = function(actionId) {
      if (window._cpPart2B && window._cpPart2B.renderInlinePicker) {
        return window._cpPart2B.renderInlinePicker(actionId);
      }
      if (S && S._part2bTimeout) {
        return '<span class="cp-ai-picker-loading" data-pending-action="' + esc(actionId) + '" title="AI module failed to load">' + icon('warning') + ' AI unavailable</span>';
      }
      return '<span class="cp-ai-picker-loading" data-pending-action="' + esc(actionId) + '">' + icon('spinner') + ' Loading…</span>';
    };

    window._cpReplaceAiPickers = function() {
      if (!window._cpPart2B || !window._cpPart2B.renderInlinePicker) return;
      $('.cp-ai-picker-loading').each(function() {
        var actionId = $(this).data('pending-action');
        if (!actionId) return;
        try { $(this).replaceWith(window._cpPart2B.renderInlinePicker(actionId)); }
        catch (e) { console.warn('[CP] AI picker placeholder replace failed:', e); }
      });
    };

    var R = window._cpRenderers = window._cpRenderers || {};
    R.tagInput = renderTagInput;

    setupPart2AEvents();
    try { snapshot('Initial state'); } catch(snapErr) { console.warn('[CP] Part 2A: snapshot failed (non-fatal):', snapErr.message); }
    if (render) render();
    console.log('[CP] Part 2A initialized — ' + Object.keys(window._cpPart2A || {}).length + ' exports');
  }


/* ===== src/20-part2a/02-modal-system.js ===== */
  // ============================================================
  // SECTION 2: MODAL SYSTEM
  // ============================================================

  var currentModal = null;

  function openModal(title, content, options) {
    options = options || {};
    closeModal();
    var size = options.size || 'md';
    var html = '<div class="cp-modal-backdrop"><div class="cp-modal cp-modal-' + size + '">';
    html += '<div class="cp-modal-header"><h3>' + (options.titleIcon ? icon(options.titleIcon) + ' ' : '') + esc(title) + '</h3>';
    html += '<button class="cp-btn-icon cp-modal-close" data-action="close-modal">' + icon('x') + '</button></div>';
    html += '<div class="cp-modal-body">' + content + '</div>';
    if (options.footer !== false) {
      html += '<div class="cp-modal-footer">';
      html += '<button class="cp-btn cp-btn-outline" data-action="close-modal">Cancel</button>';
      html += '<button class="cp-btn ' + (options.danger ? 'cp-btn-danger' : options.ai ? 'cp-btn-ai' : 'cp-btn-primary') + '" data-action="modal-save">' + (options.saveLabel || 'Save') + '</button>';
      html += '</div>';
    }
    html += '</div></div>';
    $('body').append(html);
    currentModal = options;
    setTimeout(function() { $('.cp-modal-backdrop').addClass('cp-modal-visible'); }, 10);
    // Replace any AI picker loading placeholders that landed in the modal
    if (typeof window._cpReplaceAiPickers === 'function') window._cpReplaceAiPickers();
    // Focus first input
    setTimeout(function() { $('.cp-modal-body input:visible, .cp-modal-body textarea:visible').first().focus(); }, 100);
  }

  function closeModal() {
    $('.cp-modal-backdrop').remove();
    currentModal = null;
  }

  function openConfirmDialog(opts) {
    var html = '<div class="cp-confirm-backdrop"><div class="cp-confirm-dialog">';
    html += '<h3>' + esc(opts.title || 'Confirm') + '</h3>';
    html += '<p>' + esc(opts.message || 'Are you sure?') + '</p>';
    html += '<div class="cp-confirm-actions">';
    html += '<button class="cp-btn cp-btn-outline" data-action="confirm-cancel">Cancel</button>';
    html += '<button class="cp-btn ' + (opts.danger ? 'cp-btn-danger' : 'cp-btn-primary') + '" data-action="confirm-ok">' + esc(opts.confirmLabel || 'Confirm') + '</button>';
    html += '</div></div></div>';
    $('body').append(html);
    $(document).off('click.cp2a-cok').on('click.cp2a-cok', '[data-action="confirm-ok"]', function() {
      closeConfirmDialog();
      if (opts.onConfirm) opts.onConfirm();
    });
    $(document).off('click.cp2a-ccn').on('click.cp2a-ccn', '[data-action="confirm-cancel"]', function() {
      closeConfirmDialog();
    });
  }

  function closeConfirmDialog() {
    $('.cp-confirm-backdrop').remove();
    $(document).off('click.cp2a-cok click.cp2a-ccn');
  }

  function collectModalFields() {
    var data = {};
    $('.cp-modal-body [data-field]').each(function() {
      var $f = $(this);
      var field = $f.data('field');
      if ($f.is(':checkbox')) {
        data[field] = $f.is(':checked');
      } else if ($f.is('select[multiple]')) {
        data[field] = $f.val() || [];
      } else {
        data[field] = $f.val();
      }
    });
    return data;
  }

  // Collect funnel stage chip selections
  function collectFunnelChips() {
    var selected = [];
    $('.cp-modal-body .cp-funnel-chip-active').each(function() {
      selected.push($(this).data('stage-id'));
    });
    return selected;
  }


/* ===== src/20-part2a/03-undo-redo.js ===== */
  // ============================================================
  // SECTION 3: UNDO/REDO
  // ============================================================

  function snapshot(label) {
    S.undoStack = S.undoStack || [];
    S.undoStack.push({
      label: label || '',
      data: deepClone(S.data),
      meta: deepClone(S.meta),
      activity: deepClone(S.activity)
    });
    if (S.undoStack.length > 50) S.undoStack.shift();
    S.redoStack = [];
  }

  function undo() {
    if (!S.undoStack || S.undoStack.length <= 1) { toast('Nothing to undo', 'info'); return; }
    S.redoStack = S.redoStack || [];
    S.redoStack.push(S.undoStack.pop());
    var prev = S.undoStack[S.undoStack.length - 1];
    S.data = deepClone(prev.data);
    if (prev.meta) S.meta = deepClone(prev.meta);
    if (prev.activity) S.activity = deepClone(prev.activity);
    buildMaps(); render(); syncToTextarea();
    toast('Undone', 'info');
  }

  function redo() {
    if (!S.redoStack || S.redoStack.length === 0) { toast('Nothing to redo', 'info'); return; }
    var next = S.redoStack.pop();
    S.undoStack.push(next);
    S.data = deepClone(next.data);
    if (next.meta) S.meta = deepClone(next.meta);
    if (next.activity) S.activity = deepClone(next.activity);
    buildMaps(); render(); syncToTextarea();
    toast('Redone', 'info');
  }


/* ===== src/20-part2a/04-category-crud.js ===== */
  // ============================================================
  // SECTION 4: CATEGORY CRUD
  // ============================================================

  function openCategoryModal(catId) {
    var isEdit = !!catId;
    var cat = isEdit ? getCategory(catId) : null;

    var html = '<div class="cp-editor-form">';
    html += '<div class="cp-form-group"><label>Category Name *</label>';
    html += '<input type="text" class="cp-input" data-field="name" value="' + esc(cat ? cat.name : '') + '" placeholder="e.g., Educator, Student, Professional"></div>';
    html += '<div class="cp-form-group"><label>Description</label>';
    html += '<input type="text" class="cp-input" data-field="description" value="' + esc(cat ? cat.description || '' : '') + '" placeholder="Brief description of this category"></div>';
    html += '</div>';

    openModal(isEdit ? 'Edit Category' : 'New Category', html, {
      titleIcon: 'folder-plus',
      size: 'sm',
      saveLabel: isEdit ? 'Save' : 'Create Category',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.name || !fields.name.trim()) { toast('Category name is required', 'warning'); return; }
        if (isEdit) {
          snapshot('Edit category');
          saveEntityField('persona_category', catId, 'name', fields.name.trim());
          if (fields.description !== undefined) saveEntityField('persona_category', catId, 'description', fields.description || '');
        } else {
          createEntity('persona_category', { name: fields.name.trim(), description: fields.description || '' });
          snapshot('Create category');
        }
        closeModal();
      }
    });
  }

  function confirmDeleteCategory(catId) {
    var cat = getCategory(catId);
    if (!cat) return;
    var personaCount = (S.data.personas || []).filter(function(p) { return p.category_id === catId; }).length;
    openConfirmDialog({
      title: 'Delete Category',
      message: 'Delete "' + cat.name + '"?' + (personaCount > 0 ? ' ' + personaCount + ' persona(s) will become uncategorized.' : ''),
      confirmLabel: 'Delete', danger: true,
      onConfirm: function() {
        snapshot('Delete category');
        deleteEntity('persona_category', catId);
      }
    });
  }


/* ===== src/20-part2a/05-persona-crud.js ===== */
  // ============================================================
  // SECTION 5: PERSONA CRUD
  // ============================================================

  function openPersonaModal(personaId) {
    var isEdit = !!personaId;
    var p = isEdit ? getPersona(personaId) : null;
    var demo = p ? (p.demographics || {}) : {};
    var psych = p ? (p.psychographics || {}) : {};
    var categories = getAllCategories();
    var painPoints = getAllPainPoints();
    var linkedPPs = p ? (p.pain_point_ids || []) : [];

    var html = '<div class="cp-editor-form">';

    // Basic fields
    html += '<div class="cp-form-row"><div class="cp-form-half">';
    html += '<label>Persona Name *</label>';
    html += '<input type="text" class="cp-input" data-field="name" value="' + esc(p ? p.name : '') + '" placeholder="e.g., YouTuber Educator">';
    html += '</div><div class="cp-form-half">';
    html += '<label>Category</label>';
    html += '<select class="cp-select" data-field="category_id">';
    html += '<option value="">Uncategorized</option>';
    for (var ci = 0; ci < categories.length; ci++) {
      var sel = (p && p.category_id === categories[ci].id) ? ' selected' : '';
      html += '<option value="' + esc(categories[ci].id) + '"' + sel + '>' + esc(categories[ci].name) + '</option>';
    }
    html += '</select></div></div>';

    html += '<div class="cp-form-group"><label>Description</label>';
    html += '<textarea class="cp-textarea" data-field="description" rows="2" placeholder="Brief description of this persona...">' + esc(p ? p.description || '' : '') + '</textarea></div>';

    // Demographics
    html += '<div class="cp-card cp-persona-demographics" style="margin-bottom:12px">';
    html += '<h3 style="margin-bottom:12px">' + icon('user') + ' Demographics</h3>';
    html += '<div class="cp-demo-grid">';
    var demoFields = [
      ['age_range', 'Age Range', 'e.g., 20-35'],
      ['gender', 'Gender', 'e.g., Male, Female, All'],
      ['location', 'Location', 'e.g., Tier 1/2 Cities'],
      ['income_level', 'Income Level', 'e.g., Middle, Upper'],
      ['education', 'Education', 'e.g., Graduate'],
      ['occupation', 'Occupation', 'e.g., Content Creator']
    ];
    for (var di = 0; di < demoFields.length; di++) {
      html += '<div class="cp-form-group"><label>' + esc(demoFields[di][1]) + '</label>';
      html += '<input type="text" class="cp-input" data-field="demo_' + demoFields[di][0] + '" value="' + esc(demo[demoFields[di][0]] || '') + '" placeholder="' + esc(demoFields[di][2]) + '"></div>';
    }
    html += '</div></div>';

    // Psychographics
    html += '<div class="cp-card cp-persona-psychographics" style="margin-bottom:12px">';
    html += '<h3 style="margin-bottom:12px">' + icon('heart') + ' Psychographics</h3>';
    html += '<div class="cp-psych-grid">';
    var psychFields = [
      ['desires', 'Desires & Motivations', 'What they want to achieve...'],
      ['requirements', 'Requirements', 'What they need in a solution...'],
      ['emotional_triggers', 'Emotional Triggers', 'What drives their decisions...'],
      ['motivations', 'Motivations', 'Deeper motivations...'],
      ['fears', 'Fears & Obstacles', 'What holds them back...'],
      ['values', 'Values', 'What they believe in...']
    ];
    for (var psi = 0; psi < psychFields.length; psi++) {
      html += '<div class="cp-form-group"><label>' + esc(psychFields[psi][1]) + '</label>';
      html += '<textarea class="cp-textarea" data-field="psych_' + psychFields[psi][0] + '" rows="2" placeholder="' + esc(psychFields[psi][2]) + '">' + esc(psych[psychFields[psi][0]] || '') + '</textarea></div>';
    }
    html += '</div></div>';

    // Pain Points (shared library picker)
    if (painPoints.length > 0) {
      html += '<div class="cp-card" style="margin-bottom:12px">';
      html += '<h3 style="margin-bottom:12px">' + icon('bolt') + ' Link Pain Points</h3>';
      html += '<div class="cp-pain-point-picker-list">';
      for (var ppi = 0; ppi < painPoints.length; ppi++) {
        var pp = painPoints[ppi];
        var isLinked = linkedPPs.indexOf(pp.id) > -1;
        html += '<label class="cp-pain-point-picker-item' + (isLinked ? ' cp-pain-point-picker-item-selected' : '') + '">';
        html += '<input type="checkbox" data-pp-id="' + esc(pp.id) + '"' + (isLinked ? ' checked' : '') + '>';
        html += '<div><div style="font-weight:600;font-size:13px">' + esc(truncate(pp.pain_point, 60)) + '</div>';
        if (pp.solution) html += '<div style="font-size:11px;color:var(--cp-success);margin-top:2px">' + icon('lightbulb') + ' ' + esc(truncate(pp.solution, 50)) + '</div>';
        html += '</div></label>';
      }
      html += '</div></div>';
    }

    // Notes
    html += '<div class="cp-form-group"><label>Notes</label>';
    html += '<textarea class="cp-textarea" data-field="notes" rows="2" placeholder="Any additional notes...">' + esc(p ? p.notes || '' : '') + '</textarea></div>';

    html += '</div>';

    openModal(isEdit ? 'Edit Persona' : 'New Persona', html, {
      titleIcon: 'user',
      size: 'lg',
      saveLabel: isEdit ? 'Save Persona' : 'Create Persona',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.name || !fields.name.trim()) { toast('Persona name is required', 'warning'); return; }

        // Collect pain point selections
        var selectedPPs = [];
        $('.cp-modal-body input[data-pp-id]:checked').each(function() {
          selectedPPs.push($(this).data('pp-id'));
        });

        // Build demographics object
        var demographics = {
          age_range: fields.demo_age_range || '', gender: fields.demo_gender || '',
          location: fields.demo_location || '', income_level: fields.demo_income_level || '',
          education: fields.demo_education || '', occupation: fields.demo_occupation || '', custom: {}
        };

        // Build psychographics object
        var psychographics = {
          desires: fields.psych_desires || '', requirements: fields.psych_requirements || '',
          emotional_triggers: fields.psych_emotional_triggers || '', motivations: fields.psych_motivations || '',
          fears: fields.psych_fears || '', values: fields.psych_values || '', custom: {}
        };

        if (isEdit) {
          snapshot('Edit persona');
          saveEntityField('persona', personaId, 'name', fields.name.trim());
          saveEntityField('persona', personaId, 'category_id', fields.category_id || '');
          saveEntityField('persona', personaId, 'description', fields.description || '');
          saveEntityField('persona', personaId, 'demographics', demographics);
          saveEntityField('persona', personaId, 'psychographics', psychographics);
          saveEntityField('persona', personaId, 'pain_point_ids', selectedPPs);
          saveEntityField('persona', personaId, 'notes', fields.notes || '');
        } else {
          var newPersona = createEntity('persona', {
            name: fields.name.trim(), category_id: fields.category_id || '',
            description: fields.description || '', demographics: demographics,
            psychographics: psychographics, pain_point_ids: selectedPPs,
            notes: fields.notes || ''
          });
          if (newPersona) { S.selectedPersonaId = newPersona.id; snapshot('Create persona'); }
        }
        closeModal();
      }
    });
  }

  function confirmDeletePersona(personaId) {
    var p = getPersona(personaId);
    if (!p) return;
    openConfirmDialog({
      title: 'Delete Persona',
      message: 'Delete "' + p.name + '"?',
      confirmLabel: 'Delete', danger: true,
      onConfirm: function() {
        snapshot('Delete persona');
        deleteEntity('persona', personaId);
        if (S.selectedPersonaId === personaId) S.selectedPersonaId = null;
      }
    });
  }


/* ===== src/20-part2a/06-pain-point-crud.js ===== */
  // ============================================================
  // SECTION 6: PAIN POINT CRUD
  // ============================================================

  function openPainPointModal(ppId) {
    var isEdit = !!ppId;
    var pp = isEdit ? getPainPoint(ppId) : null;
    var ppCats = Constants.PAIN_POINT_CATEGORIES || [];

    var html = '<div class="cp-editor-form">';
    html += '<div class="cp-form-group"><label>Pain Point *</label>';
    html += '<textarea class="cp-textarea" data-field="pain_point" rows="2" placeholder="Describe the pain point...">' + esc(pp ? pp.pain_point : '') + '</textarea></div>';
    html += '<div class="cp-form-group"><label>Solution</label>';
    html += '<textarea class="cp-textarea" data-field="solution" rows="2" placeholder="How does your product solve this?">' + esc(pp ? pp.solution || '' : '') + '</textarea></div>';
    html += '<div class="cp-form-group"><label>Category</label>';
    html += '<select class="cp-select" data-field="category">';
    html += '<option value="">None</option>';
    for (var i = 0; i < ppCats.length; i++) {
      var sel = (pp && pp.category === ppCats[i].id) ? ' selected' : '';
      html += '<option value="' + esc(ppCats[i].id) + '"' + sel + '>' + esc(ppCats[i].name) + '</option>';
    }
    html += '</select></div>';
    html += '</div>';

    openModal(isEdit ? 'Edit Pain Point' : 'New Pain Point', html, {
      titleIcon: 'bolt',
      size: 'md',
      saveLabel: isEdit ? 'Save' : 'Create Pain Point',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.pain_point || !fields.pain_point.trim()) { toast('Pain point text is required', 'warning'); return; }
        if (isEdit) {
          snapshot('Edit pain point');
          saveEntityField('pain_point', ppId, 'pain_point', fields.pain_point.trim());
          saveEntityField('pain_point', ppId, 'solution', fields.solution || '');
          saveEntityField('pain_point', ppId, 'category', fields.category || '');
        } else {
          createEntity('pain_point', { pain_point: fields.pain_point.trim(), solution: fields.solution || '', category: fields.category || '' });
          snapshot('Create pain point');
        }
        closeModal();
      }
    });
  }

  function confirmDeletePainPoint(ppId) {
    var pp = getPainPoint(ppId);
    if (!pp) return;
    openConfirmDialog({
      title: 'Delete Pain Point',
      message: 'Delete this pain point? It will be unlinked from all personas and recipes.',
      confirmLabel: 'Delete', danger: true,
      onConfirm: function() {
        snapshot('Delete pain point');
        deleteEntity('pain_point', ppId);
      }
    });
  }


/* ===== src/20-part2a/07-message-crud.js ===== */
  // ============================================================
  // SECTION 7: MESSAGE CRUD (with hooks)
  // ============================================================

  function openMessageModal(msgId) {
    var isEdit = !!msgId;
    var m = isEdit ? getMessage(msgId) : null;
    var funnels = (S.meta.settings && S.meta.settings.funnel_stages) || [];
    var existingStages = m ? (m.funnel_stages || []) : [];
    var existingHooks = m ? (m.hooks || []) : [];

    var html = '<div class="cp-editor-form">';

    // Title
    html += '<div class="cp-form-group"><label>Message Title *</label>';
    html += '<input type="text" class="cp-input" data-field="title" value="' + esc(m ? m.title : '') + '" placeholder="e.g., Time Freedom Angle"></div>';

    // Body
    html += '<div class="cp-form-group"><label>Message Body</label>';
    html += '<textarea class="cp-textarea" data-field="body" rows="4" placeholder="The core message text...">' + esc(m ? m.body || '' : '') + '</textarea></div>';

    // Funnel stages (chips)
    html += '<div class="cp-form-group"><label>Funnel Stages</label>';
    html += '<div class="cp-funnel-chip-selector">';
    for (var fi = 0; fi < funnels.length; fi++) {
      var f = funnels[fi];
      var isActive = existingStages.indexOf(f.id) > -1;
      html += '<button type="button" class="cp-funnel-chip' + (isActive ? ' cp-funnel-chip-active' : '') + '" data-action="toggle-funnel-chip" data-stage-id="' + esc(f.id) + '" style="--opt-color:' + f.color + ';' + (isActive ? 'background:' + f.color + ';border-color:' + f.color + ';color:#fff' : 'border-color:' + f.color + '40;color:' + f.color) + '">' + esc(f.short || f.name) + '</button>';
    }
    html += '</div></div>';

    // Delivery notes
    html += '<div class="cp-form-group"><label>Delivery & Narrative Notes</label>';
    html += '<textarea class="cp-textarea" data-field="delivery_notes" rows="3" placeholder="How should this message be delivered? Emotional direction, acting notes...">' + esc(m ? m.delivery_notes || '' : '') + '</textarea></div>';

    // Theme
    html += '<div class="cp-form-row"><div class="cp-form-half">';
    html += '<label>Theme / Topic</label>';
    html += '<input type="text" class="cp-input" data-field="theme" value="' + esc(m ? m.theme || '' : '') + '" placeholder="e.g., Productivity, Social Proof">';
    html += '</div><div class="cp-form-half">';
    html += '<label>Notes</label>';
    html += '<input type="text" class="cp-input" data-field="notes" value="' + esc(m ? m.notes || '' : '') + '" placeholder="Internal notes...">';
    html += '</div></div>';

    // Hooks sub-section
    html += '<div class="cp-card" style="margin-top:12px">';
    html += '<h3 style="margin-bottom:8px">' + icon('anchor') + ' Hooks</h3>';
    html += '<p class="cp-text-muted" style="margin-bottom:8px">Opening hooks for this message. Recipes can inherit or override these.</p>';
    html += '<div class="cp-hook-list" id="cpModalHookList">';
    for (var hi = 0; hi < existingHooks.length; hi++) {
      html += renderHookEditRow(existingHooks[hi], hi);
    }
    html += '</div>';
    html += '<div class="cp-hook-add" style="margin-top:8px">';
    html += '<button type="button" class="cp-btn cp-btn-outline cp-btn-sm" data-action="add-hook-row">' + icon('plus') + ' Add Hook</button>';
    html += '</div></div>';

    html += '</div>';

    openModal(isEdit ? 'Edit Message' : 'New Message', html, {
      titleIcon: 'comment-dots',
      size: 'lg',
      saveLabel: isEdit ? 'Save Message' : 'Create Message',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.title || !fields.title.trim()) { toast('Message title is required', 'warning'); return; }

        var funnelStages = collectFunnelChips();

        // Collect hooks from the hook list
        var hooks = [];
        $('#cpModalHookList .cp-hook-edit-row').each(function() {
          var text = $(this).find('[data-hook-field="text"]').val() || '';
          var type = $(this).find('[data-hook-field="type"]').val() || 'direct';
          var id = $(this).data('hook-id') || generateId('hk');
          if (text.trim()) {
            hooks.push({ id: id, text: text.trim(), type: type });
          }
        });

        if (isEdit) {
          snapshot('Edit message');
          saveEntityField('message', msgId, 'title', fields.title.trim());
          saveEntityField('message', msgId, 'body', fields.body || '');
          saveEntityField('message', msgId, 'funnel_stages', funnelStages);
          saveEntityField('message', msgId, 'delivery_notes', fields.delivery_notes || '');
          saveEntityField('message', msgId, 'theme', fields.theme || '');
          saveEntityField('message', msgId, 'notes', fields.notes || '');
          saveEntityField('message', msgId, 'hooks', hooks);
        } else {
          var newMsg = createEntity('message', {
            title: fields.title.trim(), body: fields.body || '',
            funnel_stages: funnelStages, delivery_notes: fields.delivery_notes || '',
            theme: fields.theme || '', notes: fields.notes || '', hooks: hooks
          });
          snapshot('Create message');
        }
        closeModal();
      }
    });
  }

  function renderHookEditRow(hook, index) {
    var hookTypes = Constants.HOOK_TYPES || {};
    var html = '<div class="cp-hook-edit-row" data-hook-id="' + esc(hook.id || '') + '" data-hook-index="' + index + '">';
    html += '<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:4px">';
    html += '<input type="text" class="cp-input" data-hook-field="text" value="' + esc(hook.text || '') + '" placeholder="Hook text..." style="flex:1">';
    html += '<select class="cp-select cp-select-sm" data-hook-field="type" style="width:auto;min-width:100px">';
    for (var tk in hookTypes) {
      var sel = (hook.type === tk) ? ' selected' : '';
      html += '<option value="' + tk + '"' + sel + '>' + esc(hookTypes[tk].label) + '</option>';
    }
    html += '</select>';
    html += '<button type="button" class="cp-btn-icon cp-btn-xs" data-action="remove-hook-row" data-hook-index="' + index + '" title="Remove">' + icon('trash') + '</button>';
    html += '</div></div>';
    return html;
  }

  function addHookRow() {
    var $list = $('#cpModalHookList');
    var idx = $list.find('.cp-hook-edit-row').length;
    $list.append(renderHookEditRow({ id: generateId('hk'), text: '', type: 'direct' }, idx));
    $list.find('.cp-hook-edit-row:last input').first().focus();
  }

  function removeHookRow(index) {
    $('#cpModalHookList .cp-hook-edit-row').eq(index).remove();
  }

  function confirmDeleteMessage(msgId) {
    var m = getMessage(msgId);
    if (!m) return;
    openConfirmDialog({
      title: 'Delete Message',
      message: 'Delete "' + m.title + '"?',
      confirmLabel: 'Delete', danger: true,
      onConfirm: function() {
        snapshot('Delete message');
        deleteEntity('message', msgId);
      }
    });
  }


/* ===== src/20-part2a/08-style-format-crud.js ===== */
  // ============================================================
  // SECTION 8: STYLE & FORMAT CRUD
  // ============================================================

  function openStyleModal(styleId) {
    var isEdit = !!styleId;
    var s = isEdit ? getStyle(styleId) : null;

    var html = '<div class="cp-editor-form">';
    html += '<div class="cp-form-group"><label>Style Name *</label>';
    html += '<input type="text" class="cp-input" data-field="name" value="' + esc(s ? s.name : '') + '" placeholder="e.g., Friendly & Relatable"></div>';
    html += '<div class="cp-form-group"><label>Description</label>';
    html += '<textarea class="cp-textarea" data-field="description" rows="3" placeholder="Describe the tone, approach, and feel of this style...">' + esc(s ? s.description || '' : '') + '</textarea></div>';
    html += '</div>';

    openModal(isEdit ? 'Edit Style' : 'New Style', html, {
      titleIcon: 'palette',
      size: 'md',
      saveLabel: isEdit ? 'Save' : 'Create Style',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.name || !fields.name.trim()) { toast('Style name is required', 'warning'); return; }
        if (isEdit) {
          snapshot('Edit style');
          saveEntityField('style', styleId, 'name', fields.name.trim());
          saveEntityField('style', styleId, 'description', fields.description || '');
        } else {
          createEntity('style', { name: fields.name.trim(), description: fields.description || '' });
          snapshot('Create style');
        }
        closeModal();
      }
    });
  }

  function confirmDeleteStyle(styleId) {
    var s = getStyle(styleId);
    if (!s) return;
    openConfirmDialog({
      title: 'Delete Style',
      message: 'Delete "' + s.name + '"?',
      confirmLabel: 'Delete', danger: true,
      onConfirm: function() { snapshot('Delete style'); deleteEntity('style', styleId); }
    });
  }

  function openFormatModal(formatId) {
    var isEdit = !!formatId;
    var f = isEdit ? getFormat(formatId) : null;
    var formatCats = Constants.FORMAT_CATEGORIES || [];

    var html = '<div class="cp-editor-form">';
    html += '<div class="cp-form-row"><div class="cp-form-half">';
    html += '<label>Format Name *</label>';
    html += '<input type="text" class="cp-input" data-field="name" value="' + esc(f ? f.name : '') + '" placeholder="e.g., Indoor Studio Shoot"></div>';
    html += '<div class="cp-form-half"><label>Category</label>';
    html += '<select class="cp-select" data-field="category">';
    html += '<option value="">None</option>';
    for (var ci = 0; ci < formatCats.length; ci++) {
      var sel = (f && f.category === formatCats[ci].id) ? ' selected' : '';
      html += '<option value="' + esc(formatCats[ci].id) + '"' + sel + '>' + esc(formatCats[ci].name) + '</option>';
    }
    html += '</select></div></div>';
    html += '<div class="cp-form-group"><label>Description</label>';
    html += '<textarea class="cp-textarea" data-field="description" rows="3" placeholder="Describe the visual approach, setting, and feel...">' + esc(f ? f.description || '' : '') + '</textarea></div>';
    html += '</div>';

    openModal(isEdit ? 'Edit Visual Format' : 'New Visual Format', html, {
      titleIcon: 'clapperboard',
      size: 'md',
      saveLabel: isEdit ? 'Save' : 'Create Format',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.name || !fields.name.trim()) { toast('Format name is required', 'warning'); return; }
        if (isEdit) {
          snapshot('Edit format');
          saveEntityField('visual_format', formatId, 'name', fields.name.trim());
          saveEntityField('visual_format', formatId, 'description', fields.description || '');
          saveEntityField('visual_format', formatId, 'category', fields.category || '');
        } else {
          createEntity('visual_format', { name: fields.name.trim(), description: fields.description || '', category: fields.category || '' });
          snapshot('Create format');
        }
        closeModal();
      }
    });
  }

  function confirmDeleteFormat(formatId) {
    var f = getFormat(formatId);
    if (!f) return;
    openConfirmDialog({
      title: 'Delete Visual Format',
      message: 'Delete "' + f.name + '"?',
      confirmLabel: 'Delete', danger: true,
      onConfirm: function() { snapshot('Delete format'); deleteEntity('visual_format', formatId); }
    });
  }


/* ===== src/20-part2a/09a-meta-campaign-crud.js ===== */
  // ============================================================
  // SECTION 9A: META CAMPAIGN (v2) CRUD
  // ============================================================
  //
  // Modal for creating/editing a Meta-shaped Campaign. Storage uses Meta API
  // enum values; UI shows friendly labels via the META_* constants.

  function openMetaCampaignModal(campId) {
    var C = Constants;
    var isEdit = !!campId;
    var c = isEdit ? getCampaignV2(campId) : null;

    var html = '<div class="cp-editor-form">';

    // --- Section: Basics ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('clipboard-list') + ' Basics</div>';
    html += '<div class="cp-form-row"><div class="cp-form-grow">';
    html += '<label>Campaign Name <span class="cp-required">*</span></label>';
    html += '<input type="text" class="cp-input" data-field="name" value="' + esc(c ? c.name : '') + '" placeholder="e.g., Q3 SaaS Lead Generation">';
    html += '</div><div class="cp-form-third"><label>Status</label>';
    html += '<select class="cp-select" data-field="status">';
    for (var sk in C.META_CAMPAIGN_STATUSES) {
      var sSel = (c ? c.status === sk : sk === 'DRAFT') ? ' selected' : '';
      html += '<option value="' + sk + '"' + sSel + '>' + esc(C.META_CAMPAIGN_STATUSES[sk].label) + '</option>';
    }
    html += '</select></div></div>';

    html += '<div class="cp-form-group"><label>Description</label>';
    html += '<textarea class="cp-textarea" data-field="description" rows="2" placeholder="What is this campaign about?">' + esc(c ? c.description || '' : '') + '</textarea></div>';
    html += '</div>';

    // --- Section: Objective & Buying ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('bullseye-arrow') + ' Objective & buying</div>';
    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Objective <span class="cp-required">*</span></label>';
    html += '<select class="cp-select" data-field="objective" id="cpV2CampObjective">';
    for (var ok in C.META_OBJECTIVES) {
      var oSel = (c && c.objective === ok) ? ' selected' :
                 (!c && ok === C.META_CAMPAIGN_DEFAULTS.objective) ? ' selected' : '';
      html += '<option value="' + ok + '"' + oSel + '>' + esc(C.META_OBJECTIVES[ok].label) + '</option>';
    }
    html += '</select>';
    var oCurrent = (c && C.META_OBJECTIVES[c.objective]) || C.META_OBJECTIVES[C.META_CAMPAIGN_DEFAULTS.objective];
    html += '<div class="cp-form-help">' + esc(oCurrent.description) + '</div>';
    html += '</div><div class="cp-form-half"><label>Buying type</label>';
    html += '<select class="cp-select" data-field="buying_type">';
    for (var bk in C.META_BUYING_TYPES) {
      var bSel = (c ? c.buying_type === bk : bk === 'AUCTION') ? ' selected' : '';
      html += '<option value="' + bk + '"' + bSel + '>' + esc(C.META_BUYING_TYPES[bk].label) + '</option>';
    }
    html += '</select></div></div></div>';

    // --- Section: Budget & bidding ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('dollar-sign') + ' Budget & bidding</div>';
    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Budget mode</label>';
    html += '<select class="cp-select" data-field="budget_mode">';
    for (var bmk in C.META_BUDGET_MODES) {
      var bmSel = (c ? c.budget_mode === bmk : bmk === 'CBO') ? ' selected' : '';
      html += '<option value="' + bmk + '"' + bmSel + '>' + esc(C.META_BUDGET_MODES[bmk].label) + ' (' + C.META_BUDGET_MODES[bmk].short + ')</option>';
    }
    html += '</select>';
    html += '<div class="cp-form-help">' + esc(C.META_BUDGET_MODES[c ? c.budget_mode : 'CBO'].description) + '</div>';
    html += '</div><div class="cp-form-half"><label>Bid strategy</label>';
    html += '<select class="cp-select" data-field="bid_strategy">';
    for (var bsk in C.META_BID_STRATEGIES) {
      var bsSel = (c ? c.bid_strategy === bsk : bsk === 'LOWEST_COST_WITHOUT_CAP') ? ' selected' : '';
      html += '<option value="' + bsk + '"' + bsSel + '>' + esc(C.META_BID_STRATEGIES[bsk].label) + '</option>';
    }
    html += '</select></div></div>';

    html += '<div class="cp-form-row"><div class="cp-form-third"><label>Daily budget</label>';
    html += '<input type="number" class="cp-input" data-field="daily_budget" min="0" step="1" value="' + esc((c && c.daily_budget != null) ? c.daily_budget : '') + '" placeholder="0">';
    html += '</div><div class="cp-form-third"><label>Lifetime budget</label>';
    html += '<input type="number" class="cp-input" data-field="lifetime_budget" min="0" step="1" value="' + esc((c && c.lifetime_budget != null) ? c.lifetime_budget : '') + '" placeholder="0">';
    html += '</div><div class="cp-form-third"><label>Spend cap</label>';
    html += '<input type="number" class="cp-input" data-field="spend_cap" min="0" step="1" value="' + esc((c && c.spend_cap != null) ? c.spend_cap : '') + '" placeholder="0">';
    html += '</div></div>';
    html += '<div class="cp-form-hint">' + icon('info') + ' For CBO, set budget here. For ABO, set it on each Ad Set.</div>';
    html += '</div>';

    // --- Section: Schedule ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('calendar') + ' Schedule</div>';
    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Start time</label>';
    html += '<input type="datetime-local" class="cp-input" data-field="start_time" value="' + esc(isoToDatetimeLocal(c ? c.start_time : '')) + '">';
    html += '</div><div class="cp-form-half"><label>Stop time</label>';
    html += '<input type="datetime-local" class="cp-input" data-field="stop_time" value="' + esc(isoToDatetimeLocal(c ? c.stop_time : '')) + '">';
    html += '</div></div>';
    html += '<div class="cp-form-hint">Leave blank for always-on.</div>';
    html += '</div>';

    // --- Section: Special Ad Categories ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('shield') + ' Special ad categories</div>';
    html += '<div class="cp-form-hint" style="margin-bottom:8px">Required by Meta for credit, employment, housing, and social issue ads. Most campaigns: None.</div>';
    html += '<div class="cp-chip-grid">';
    var selCats = (c && c.special_ad_categories) ? c.special_ad_categories : ['NONE'];
    for (var sak in C.META_SPECIAL_AD_CATEGORIES) {
      var sa = C.META_SPECIAL_AD_CATEGORIES[sak];
      var isSel = selCats.indexOf(sak) > -1;
      html += '<label class="cp-chip' + (isSel ? ' cp-chip-active' : '') + '">';
      html += '<input type="checkbox" class="cp-v2-special-cat" data-key="' + sak + '"' + (isSel ? ' checked' : '') + ' style="display:none">';
      html += esc(sa.label) + '</label>';
    }
    html += '</div></div>';

    // --- Section: Brief & AI instructions ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('file-lines') + ' Brief & AI</div>';
    html += '<div class="cp-form-group"><label>Campaign brief</label>';
    html += '<textarea class="cp-textarea" data-field="brief" rows="3" placeholder="Strategic context — target outcome, key messaging, why now...">' + esc(c ? c.brief || '' : '') + '</textarea></div>';
    html += '<div class="cp-form-group"><label>' + icon('sparkles') + ' AI instructions</label>';
    html += '<textarea class="cp-textarea" data-field="ai_instructions" rows="2" placeholder="Special instructions for AI when generating Ad Sets and Ads for this campaign...">' + esc(c ? c.ai_instructions || '' : '') + '</textarea></div>';
    html += '</div>';

    // --- Section: Notes ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('note-sticky') + ' Notes</div>';
    html += '<div class="cp-form-group">';
    html += '<textarea class="cp-textarea" data-field="notes" rows="2" placeholder="Internal notes...">' + esc(c ? c.notes || '' : '') + '</textarea></div>';
    html += '</div>';

    html += '</div>';

    openModal(isEdit ? 'Edit Campaign' : 'New Campaign', html, {
      titleIcon: 'bullhorn',
      size: 'lg',
      saveLabel: isEdit ? 'Save Campaign' : 'Create Campaign',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.name || !fields.name.trim()) { toast('Campaign name is required', 'warning'); return; }

        var cats = [];
        $('.cp-v2-special-cat:checked').each(function() { cats.push($(this).data('key')); });
        if (cats.length === 0) cats = ['NONE'];
        // If NONE is mixed with others, drop NONE
        if (cats.length > 1 && cats.indexOf('NONE') > -1) cats = cats.filter(function(k) { return k !== 'NONE'; });

        var payload = {
          name: fields.name.trim(),
          description: fields.description || '',
          objective: fields.objective || Constants.META_CAMPAIGN_DEFAULTS.objective,
          buying_type: fields.buying_type || 'AUCTION',
          budget_mode: fields.budget_mode || 'CBO',
          daily_budget: fields.daily_budget !== '' ? Number(fields.daily_budget) : null,
          lifetime_budget: fields.lifetime_budget !== '' ? Number(fields.lifetime_budget) : null,
          spend_cap: fields.spend_cap !== '' ? Number(fields.spend_cap) : null,
          bid_strategy: fields.bid_strategy || 'LOWEST_COST_WITHOUT_CAP',
          start_time: datetimeLocalToIso(fields.start_time),
          stop_time: datetimeLocalToIso(fields.stop_time),
          status: fields.status || 'DRAFT',
          special_ad_categories: cats,
          brief: fields.brief || '',
          ai_instructions: fields.ai_instructions || '',
          notes: fields.notes || ''
        };

        if (isEdit) {
          snapshot('Edit Meta campaign');
          for (var k in payload) saveEntityField('campaign_v2', campId, k, payload[k]);
          toast('Campaign saved', 'success');
        } else {
          snapshot('Create Meta campaign');
          var created = createEntity('campaign_v2', payload);
          if (created) {
            S.selectedCampaignV2Id = created.id; S.selectedAdSetId = null; S.selectedAdId = null;
            navigate('campaign_workspace', { hash: 'campaign/' + created.id });
          }
        }
        closeModal();
      }
    });
  }

  function confirmDeleteMetaCampaign(campId) {
    var c = getCampaignV2(campId);
    if (!c) return;
    var sets = getAdSetsByCampaign(campId).length;
    var ads = getAdsByCampaign(campId).length;
    var msg = 'Delete "' + c.name + '"?';
    if (sets || ads) msg += ' This will also remove ' + sets + ' ad set' + (sets !== 1 ? 's' : '') + ' and ' + ads + ' ad' + (ads !== 1 ? 's' : '') + '.';
    openConfirmDialog({
      title: 'Delete Campaign',
      message: msg,
      confirmLabel: 'Delete', danger: true,
      onConfirm: function() {
        snapshot('Delete Meta campaign');
        deleteEntity('campaign_v2', campId);
        if (S.currentView === 'campaign_workspace') navigate('meta_campaigns');
      }
    });
  }

  // ---- Datetime helpers (Meta wants ISO 8601; HTML input wants local) ----

  function isoToDatetimeLocal(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    // YYYY-MM-DDTHH:mm
    var pad = function(n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
           'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function datetimeLocalToIso(localStr) {
    if (!localStr) return '';
    var d = new Date(localStr);
    return isNaN(d.getTime()) ? '' : d.toISOString();
  }

/* ===== src/20-part2a/09b-meta-ad-set-crud.js ===== */
  // ============================================================
  // SECTION 9B: META AD SET CRUD
  // ============================================================
  //
  // Modal for creating/editing an Ad Set under a Campaign. Audience model
  // for v1 = Persona link + audience_overrides notes. When a persona is
  // attached, a snapshot is frozen so library edits don't silently change
  // the campaign plan (Stage 3 surfaces divergence + re-sync UI).

  function openMetaAdSetModal(adSetIdOrCampId, opts) {
    opts = opts || {};
    var C = Constants;
    // Two call shapes:
    //   openMetaAdSetModal('adset_xxx')                  -> edit existing
    //   openMetaAdSetModal('cmpv2_xxx', { create: true }) -> create under campaign
    var isEdit = !opts.create;
    var adSet = isEdit ? getAdSet(adSetIdOrCampId) : null;
    var campaignId = isEdit ? (adSet && adSet.campaign_id) : adSetIdOrCampId;
    var camp = getCampaignV2(campaignId);

    if (!camp) { toast('Parent campaign not found', 'error'); return; }

    var s = adSet || {};
    var brief = s.brief || {};
    var placements = s.placements || { advantage_enabled: true, custom_placements: [] };
    var personas = getAllPersonas();

    var html = '<div class="cp-editor-form">';

    // Context banner
    html += '<div class="cp-modal-context">' + icon('bullhorn') + ' Under campaign: <strong>' + esc(camp.name || 'Untitled') + '</strong></div>';

    // --- Section: Basics ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('clipboard-list') + ' Basics</div>';
    html += '<div class="cp-form-row"><div class="cp-form-grow">';
    html += '<label>Ad Set Name <span class="cp-required">*</span></label>';
    html += '<input type="text" class="cp-input" data-field="name" value="' + esc(s.name || '') + '" placeholder="e.g., SaaS Marketers — Lookalike">';
    html += '</div><div class="cp-form-third"><label>Status</label>';
    html += '<select class="cp-select" data-field="status">';
    for (var stk in C.META_AD_SET_STATUSES) {
      var stSel = (s.status === stk) || (!isEdit && stk === 'DRAFT') ? ' selected' : '';
      html += '<option value="' + stk + '"' + stSel + '>' + esc(C.META_AD_SET_STATUSES[stk].label) + '</option>';
    }
    html += '</select></div></div></div>';

    // --- Section: Audience ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('users') + ' Audience</div>';
    html += '<div class="cp-form-group"><label>Persona <span class="cp-required">*</span></label>';
    html += '<select class="cp-select" data-field="persona_id">';
    html += '<option value="">— Select a persona —</option>';
    for (var pi = 0; pi < personas.length; pi++) {
      var p = personas[pi];
      var pSel = (s.persona_id === p.id) ? ' selected' : '';
      html += '<option value="' + esc(p.id) + '"' + pSel + '>' + esc(p.name || 'Untitled') + '</option>';
    }
    html += '</select>';
    html += '<div class="cp-form-help">Personas live in your library. A snapshot is frozen on attach so library edits don\'t silently change this plan.</div>';
    html += '</div>';

    html += '<div class="cp-form-group"><label>Audience overrides / targeting notes</label>';
    html += '<textarea class="cp-textarea" data-field="audience_overrides" rows="2" placeholder="e.g., Exclude existing customers; add Mumbai+Bangalore only; min income ₹15L">' + esc(s.audience_overrides || '') + '</textarea>';
    html += '<div class="cp-form-help">Free text for v1. Detailed Meta targeting (interests, behaviors, custom audiences, lookalikes) lands in a later phase.</div>';
    html += '</div></div>';

    // --- Section: Placements ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('object-group') + ' Placements</div>';
    html += '<label class="cp-form-toggle">';
    html += '<input type="checkbox" class="cp-v2-placements-advantage"' + (placements.advantage_enabled !== false ? ' checked' : '') + '>';
    html += '<span>' + icon('sparkles') + ' Use <strong>Advantage Placements</strong> (Meta picks the best mix)</span>';
    html += '</label>';

    html += '<div class="cp-v2-custom-placements" style="' + (placements.advantage_enabled !== false ? 'display:none;' : '') + 'margin-top:var(--cp-space-2)">';
    html += '<div class="cp-form-help">Choose specific placements:</div>';
    html += '<div class="cp-chip-grid">';
    var customSel = placements.custom_placements || [];
    for (var pk in C.META_PLACEMENTS) {
      var pl = C.META_PLACEMENTS[pk];
      var isPSel = customSel.indexOf(pk) > -1;
      html += '<label class="cp-chip' + (isPSel ? ' cp-chip-active' : '') + '">';
      html += '<input type="checkbox" class="cp-v2-placement" data-key="' + pk + '"' + (isPSel ? ' checked' : '') + ' style="display:none">';
      html += esc(pl.label) + '</label>';
    }
    html += '</div></div></div>';

    // --- Section: Optimization & Delivery ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('bullseye-arrow') + ' Optimization & delivery</div>';

    var allowed = metaOptimizationGoalsForObjective(camp.objective);
    if (allowed.length === 0) {
      // Fallback: show all
      for (var ogk in C.META_OPTIMIZATION_GOALS) allowed.push(C.META_OPTIMIZATION_GOALS[ogk]);
    }

    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Optimization goal</label>';
    html += '<select class="cp-select" data-field="optimization_goal">';
    for (var ogi = 0; ogi < allowed.length; ogi++) {
      var og = allowed[ogi];
      var ogSel = (s.optimization_goal === og.key) ? ' selected' :
                  (!isEdit && og.key === C.META_AD_SET_DEFAULTS.optimization_goal) ? ' selected' : '';
      html += '<option value="' + og.key + '"' + ogSel + '>' + esc(og.label) + '</option>';
    }
    html += '</select>';
    html += '<div class="cp-form-help">Filtered to goals valid under <strong>' + esc((C.META_OBJECTIVES[camp.objective] || {}).label || camp.objective) + '</strong>.</div>';
    html += '</div><div class="cp-form-half"><label>Billing event</label>';
    html += '<select class="cp-select" data-field="billing_event">';
    for (var bek in C.META_BILLING_EVENTS) {
      var beSel = (s.billing_event === bek) ? ' selected' :
                  (!isEdit && bek === C.META_AD_SET_DEFAULTS.billing_event) ? ' selected' : '';
      html += '<option value="' + bek + '"' + beSel + '>' + esc(C.META_BILLING_EVENTS[bek].label) + '</option>';
    }
    html += '</select></div></div>';

    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Attribution setting</label>';
    html += '<select class="cp-select" data-field="attribution_setting">';
    for (var ask in C.META_ATTRIBUTION_SETTINGS) {
      var asSel = (s.attribution_setting === ask) ? ' selected' :
                  (!isEdit && ask === C.META_AD_SET_DEFAULTS.attribution_setting) ? ' selected' : '';
      html += '<option value="' + ask + '"' + asSel + '>' + esc(C.META_ATTRIBUTION_SETTINGS[ask].label) + '</option>';
    }
    html += '</select></div><div class="cp-form-half"><label>Bid amount</label>';
    html += '<input type="number" class="cp-input" data-field="bid_amount" min="0" step="0.01" value="' + esc((s.bid_amount != null) ? s.bid_amount : '') + '" placeholder="Auto (leave blank)">';
    html += '<div class="cp-form-help">Used by Bid Cap / Cost Cap strategies. Optional otherwise.</div>';
    html += '</div></div></div>';

    // --- Section: Budget (ABO only — but always show, hint about CBO) ---
    var isABO = camp.budget_mode === 'ABO';
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('dollar-sign') + ' Budget';
    if (!isABO) html += '<span class="cp-text-muted" style="font-weight:400;font-size:11px;margin-left:8px">(Campaign is CBO — budget lives on the campaign)</span>';
    html += '</div>';
    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Daily budget</label>';
    html += '<input type="number" class="cp-input" data-field="daily_budget" min="0" step="1" value="' + esc((s.daily_budget != null) ? s.daily_budget : '') + '" placeholder="0"' + (isABO ? '' : ' disabled') + '>';
    html += '</div><div class="cp-form-half"><label>Lifetime budget</label>';
    html += '<input type="number" class="cp-input" data-field="lifetime_budget" min="0" step="1" value="' + esc((s.lifetime_budget != null) ? s.lifetime_budget : '') + '" placeholder="0"' + (isABO ? '' : ' disabled') + '>';
    html += '</div></div></div>';

    // --- Section: Schedule ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('calendar') + ' Schedule</div>';
    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Start time</label>';
    html += '<input type="datetime-local" class="cp-input" data-field="start_time" value="' + esc(isoToDatetimeLocal(s.start_time)) + '">';
    html += '</div><div class="cp-form-half"><label>Stop time</label>';
    html += '<input type="datetime-local" class="cp-input" data-field="stop_time" value="' + esc(isoToDatetimeLocal(s.stop_time)) + '">';
    html += '</div></div>';
    html += '<div class="cp-form-hint">Leave blank to inherit from campaign.</div>';
    html += '</div>';

    // --- Section: Notes ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('note-sticky') + ' Notes</div>';
    html += '<textarea class="cp-textarea" data-field="notes" rows="2" placeholder="Internal notes...">' + esc(s.notes || '') + '</textarea>';
    html += '</div>';

    html += '</div>';

    openModal(isEdit ? 'Edit Ad Set' : 'New Ad Set', html, {
      titleIcon: 'crosshairs',
      size: 'lg',
      saveLabel: isEdit ? 'Save Ad Set' : 'Create Ad Set',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.name || !fields.name.trim()) { toast('Ad Set name is required', 'warning'); return; }
        if (!fields.persona_id) { toast('Pick a persona for this Ad Set', 'warning'); return; }

        var advAdv = $('.cp-v2-placements-advantage').is(':checked');
        var customP = [];
        $('.cp-v2-placement:checked').each(function() { customP.push($(this).data('key')); });

        // Build persona snapshot
        var persona = getPersona(fields.persona_id);
        var newSnap = persona ? buildPersonaSnapshot(persona) : null;

        var payload = {
          campaign_id: campaignId,
          name: fields.name.trim(),
          persona_id: fields.persona_id || '',
          // Keep existing snapshot unless persona changed
          persona_snapshot: (isEdit && s.persona_id === fields.persona_id) ? (s.persona_snapshot || newSnap) : newSnap,
          audience_overrides: fields.audience_overrides || '',
          placements: { advantage_enabled: advAdv, custom_placements: customP },
          optimization_goal: fields.optimization_goal || Constants.META_AD_SET_DEFAULTS.optimization_goal,
          billing_event: fields.billing_event || 'IMPRESSIONS',
          attribution_setting: fields.attribution_setting || '7d_click',
          bid_amount: fields.bid_amount !== '' ? Number(fields.bid_amount) : null,
          daily_budget: fields.daily_budget !== '' ? Number(fields.daily_budget) : null,
          lifetime_budget: fields.lifetime_budget !== '' ? Number(fields.lifetime_budget) : null,
          start_time: datetimeLocalToIso(fields.start_time),
          stop_time: datetimeLocalToIso(fields.stop_time),
          status: fields.status || 'DRAFT',
          notes: fields.notes || ''
        };

        if (isEdit) {
          snapshot('Edit Ad Set');
          for (var k in payload) saveEntityField('ad_set', adSetIdOrCampId, k, payload[k]);
          toast('Ad Set saved', 'success');
        } else {
          snapshot('Create Ad Set');
          var created = createEntity('ad_set', payload);
          if (created) {
            S.selectedCampaignV2Id = campaignId;
            S.selectedAdSetId = created.id;
            S.selectedAdId = null;
            navigate('campaign_workspace', { hash: 'campaign/' + campaignId + '/ad_set/' + created.id });
          }
        }
        closeModal();
      }
    });
  }

  // Build a snapshot of a Persona at the moment it's attached to an Ad Set.
  // Stores only fields useful for audience reasoning. captured_at lets us
  // detect divergence later (Stage 3) without diffing the entire object.
  function buildPersonaSnapshot(persona) {
    if (!persona) return null;
    return {
      captured_at: new Date().toISOString(),
      source_id: persona.id,
      source_updated: persona.updated || persona.created || '',
      name: persona.name || '',
      description: persona.description || '',
      demographics: deepClone(persona.demographics || {}),
      psychographics: deepClone(persona.psychographics || {}),
      pain_point_ids: (persona.pain_point_ids || []).slice()
    };
  }

  function confirmDeleteMetaAdSet(adSetId) {
    var s = getAdSet(adSetId);
    if (!s) return;
    var ads = getAdsByAdSet(adSetId).length;
    var msg = 'Delete "' + s.name + '"?';
    if (ads) msg += ' This will also remove ' + ads + ' ad' + (ads !== 1 ? 's' : '') + '.';
    openConfirmDialog({
      title: 'Delete Ad Set',
      message: msg,
      confirmLabel: 'Delete', danger: true,
      onConfirm: function() {
        snapshot('Delete Ad Set');
        var camp = s.campaign_id;
        deleteEntity('ad_set', adSetId);
        if (S.currentView === 'campaign_workspace' && camp) {
          navigate('campaign_workspace', { hash: 'campaign/' + camp });
        }
      }
    });
  }

/* ===== src/20-part2a/09c-meta-ad-crud.js ===== */
  // ============================================================
  // SECTION 9C: META AD CRUD
  // ============================================================
  //
  // Two flows:
  //   * Create — quick modal asks for just name + creative_type, then
  //     navigates to the workspace inspector where the user fills out
  //     hook / copy / media / review inline.
  //   * Edit — no modal at all; the edit-ad action navigates to the
  //     workspace inspector. This function only runs as a legacy
  //     fallback if the inspector context isn't available.

  function openMetaAdQuickCreate(adSetId) {
    var C = Constants;
    var adSet = getAdSet(adSetId);
    if (!adSet) { toast('Parent ad set not found', 'error'); return; }
    var camp = getCampaignV2(adSet.campaign_id);
    var existingCount = (getAdsByAdSet ? getAdsByAdSet(adSetId).length : 0);
    var defaultName = adSet.name + ' — Ad ' + (existingCount + 1);

    var html = '<div class="cp-editor-form">';
    html += '<div class="cp-modal-context">';
    if (camp) html += icon('bullhorn') + ' ' + esc(camp.name) + ' · ';
    html += icon('crosshairs') + ' ' + esc(adSet.name) + '</div>';
    html += '<div class="cp-form-group"><label>Ad Name <span class="cp-required">*</span></label>';
    html += '<input type="text" class="cp-input" data-field="name" value="' + esc(defaultName) + '" autocomplete="off">';
    html += '</div>';
    html += '<div class="cp-form-group"><label>Creative type</label>';
    html += '<div class="cp-segmented">';
    for (var ctk in C.META_AD_CREATIVE_TYPES) {
      var ct = C.META_AD_CREATIVE_TYPES[ctk];
      var ctSel = (ctk === 'single_image') ? ' cp-segmented-active' : '';
      html += '<label class="cp-segmented-option' + ctSel + '">';
      html += '<input type="radio" name="cp-v2-ad-qc-creative-type" data-field="creative_type" value="' + ctk + '"' + (ctSel ? ' checked' : '') + ' style="display:none">';
      html += icon(ct.icon) + ' ' + esc(ct.label);
      html += '</label>';
    }
    html += '</div></div>';
    html += '<p class="cp-form-help">After create, you\'ll be taken to the Ad\'s workspace where Hook, Copy, Media, and Review are inline-editable.</p>';
    html += '</div>';

    openModal('New Ad', html, {
      titleIcon: 'rectangle-ad', size: 'sm', saveLabel: 'Create & open',
      onSave: function() {
        var fields = collectModalFields();
        var name = (fields.name || '').trim();
        if (!name) { toast('Ad name is required', 'warning'); return; }
        var creativeType = $('input[name="cp-v2-ad-qc-creative-type"]:checked').val() || 'single_image';
        snapshot('Create Ad');
        var created = createEntity('ad', { ad_set_id: adSetId, name: name, creative_type: creativeType });
        closeModal();
        if (created) {
          S.selectedCampaignV2Id = adSet.campaign_id;
          S.selectedAdSetId = adSetId;
          S.selectedAdId = created.id;
          S.workspaceInspectorTab = 'hook';
          navigate('campaign_workspace', { hash: 'campaign/' + adSet.campaign_id + '/ad_set/' + adSetId + '/ad/' + created.id });
        }
      }
    });
  }

  // Legacy full-form edit modal — kept as a fallback only. The inline
  // workspace inspector is the primary editing surface.
  function openMetaAdModal(adIdOrAdSetId, opts) {
    opts = opts || {};
    // Quick-create branch
    if (opts.create) { openMetaAdQuickCreate(adIdOrAdSetId); return; }
    var C = Constants;
    var ad = getAd(adIdOrAdSetId);
    var adSetId = ad && ad.ad_set_id;
    var adSet = getAdSet(adSetId);

    if (!adSet) { toast('Parent ad set not found', 'error'); return; }
    var camp = getCampaignV2(adSet.campaign_id);
    var isEdit = true;

    var a = ad || {};
    var creative = a.creative || {};
    var hook = a.hook || {};
    var media = a.media || {};
    var img = media.image || {};
    var vid = media.video || {};

    var html = '<div class="cp-editor-form">';

    // Context banner
    html += '<div class="cp-modal-context">';
    if (camp) html += icon('bullhorn') + ' ' + esc(camp.name) + ' · ';
    html += icon('crosshairs') + ' ' + esc(adSet.name) + '</div>';

    // --- Section: Basics ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('clipboard-list') + ' Basics</div>';
    html += '<div class="cp-form-row"><div class="cp-form-grow"><label>Ad Name <span class="cp-required">*</span></label>';
    html += '<input type="text" class="cp-input" data-field="name" value="' + esc(a.name || '') + '" placeholder="e.g., Lookalike — Bold ROI hook">';
    html += '</div><div class="cp-form-third"><label>Pipeline status</label>';
    html += '<select class="cp-select" data-field="pipeline_status">';
    for (var stk in C.META_AD_STATUSES) {
      var stSel = (a.pipeline_status === stk) || (!isEdit && stk === 'hook_ready') ? ' selected' : '';
      html += '<option value="' + stk + '"' + stSel + '>' + esc(C.META_AD_STATUSES[stk].label) + '</option>';
    }
    html += '</select></div></div>';

    html += '<div class="cp-form-group"><label>Creative type</label>';
    html += '<div class="cp-segmented">';
    for (var ctk in C.META_AD_CREATIVE_TYPES) {
      var ct = C.META_AD_CREATIVE_TYPES[ctk];
      var ctSel = (a.creative_type === ctk) || (!isEdit && ctk === 'single_image') ? ' cp-segmented-active' : '';
      html += '<label class="cp-segmented-option' + ctSel + '">';
      html += '<input type="radio" name="cp-v2-ad-creative-type" data-field="creative_type" value="' + ctk + '"' + (ctSel ? ' checked' : '') + ' style="display:none">';
      html += icon(ct.icon) + ' ' + esc(ct.label);
      html += '</label>';
    }
    html += '</div></div></div>';

    // --- Section: Hook ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('anchor') + ' Hook';
    html += '<span class="cp-text-muted" style="font-weight:400;font-size:11px;margin-left:8px">Polish layer — first 3 words decide everything</span>';
    html += '</div>';
    html += '<div class="cp-form-row"><div class="cp-form-grow"><label>Hook text</label>';
    html += '<textarea class="cp-textarea" data-field="hook.text" rows="2" placeholder="e.g., Stop wasting 40% of your ad spend on the wrong audience.">' + esc(hook.text || '') + '</textarea>';
    html += '</div><div class="cp-form-third"><label>Hook type</label>';
    html += '<select class="cp-select" data-field="hook.type">';
    var hookTypes = ['question','bold','story','data','direct','curiosity','challenge'];
    for (var hti = 0; hti < hookTypes.length; hti++) {
      var ht = hookTypes[hti];
      var htSel = (hook.type === ht) || (!isEdit && ht === 'direct') ? ' selected' : '';
      html += '<option value="' + ht + '"' + htSel + '>' + esc(ht.charAt(0).toUpperCase() + ht.slice(1)) + '</option>';
    }
    html += '</select></div></div></div>';

    // --- Section: Copy ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('pen-fancy') + ' Copy</div>';
    html += '<div class="cp-form-group"><label>Primary text <span class="cp-text-muted" style="font-weight:400">(125 chars recommended)</span></label>';
    html += '<textarea class="cp-textarea" data-field="creative.primary_text" rows="3" placeholder="The main body copy that appears above your media.">' + esc(creative.primary_text || '') + '</textarea></div>';
    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Headline <span class="cp-text-muted" style="font-weight:400">(27 chars)</span></label>';
    html += '<input type="text" class="cp-input" data-field="creative.headline" value="' + esc(creative.headline || '') + '" maxlength="60">';
    html += '</div><div class="cp-form-half"><label>Description <span class="cp-text-muted" style="font-weight:400">(27 chars)</span></label>';
    html += '<input type="text" class="cp-input" data-field="creative.description" value="' + esc(creative.description || '') + '" maxlength="60">';
    html += '</div></div></div>';

    // --- Section: Destination ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('link') + ' Destination</div>';
    html += '<div class="cp-form-row"><div class="cp-form-third"><label>Call to action</label>';
    html += '<select class="cp-select" data-field="creative.cta_type">';
    for (var ctak in C.META_CTA_TYPES) {
      var ctaSel = (creative.cta_type === ctak) || (!isEdit && ctak === 'LEARN_MORE') ? ' selected' : '';
      html += '<option value="' + ctak + '"' + ctaSel + '>' + esc(C.META_CTA_TYPES[ctak].label) + '</option>';
    }
    html += '</select></div><div class="cp-form-grow"><label>Destination link</label>';
    html += '<input type="url" class="cp-input" data-field="creative.cta_link" value="' + esc(creative.cta_link || '') + '" placeholder="https://example.com/landing">';
    html += '</div></div>';
    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Display link <span class="cp-text-muted" style="font-weight:400">(optional)</span></label>';
    html += '<input type="text" class="cp-input" data-field="creative.display_link" value="' + esc(creative.display_link || '') + '" placeholder="example.com/sale">';
    html += '</div><div class="cp-form-half"><label>Tracking params <span class="cp-text-muted" style="font-weight:400">(utm_*)</span></label>';
    html += '<input type="text" class="cp-input" data-field="creative.tracking_params" value="' + esc(creative.tracking_params || '') + '" placeholder="utm_source=meta&utm_campaign=...">';
    html += '</div></div></div>';

    // --- Section: Media brief (basic — full editor in Stage 2) ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('image') + ' Media brief';
    html += '<span class="cp-text-muted" style="font-weight:400;font-size:11px;margin-left:8px">Detailed editor lands in Stage 2</span>';
    html += '</div>';

    // Single image fields
    html += '<div class="cp-v2-media-image" data-show-for="single_image">';
    html += '<div class="cp-form-row"><div class="cp-form-grow"><label>Image prompt</label>';
    html += '<textarea class="cp-textarea" data-field="media.image.prompt" rows="3" placeholder="Describe the image you want, or paste a generator prompt — hand off via the media brief export.">' + esc(img.prompt || img.ai_prompt || img.brief || '') + '</textarea>';
    html += '</div><div class="cp-form-third"><label>Aspect ratio</label>';
    html += '<select class="cp-select" data-field="media.image.aspect_ratio">';
    var imgAspects = ['1:1','4:5','9:16','16:9'];
    for (var iai = 0; iai < imgAspects.length; iai++) {
      var ia = imgAspects[iai];
      var iaSel = (img.aspect_ratio === ia) || (!isEdit && ia === '1:1') ? ' selected' : '';
      html += '<option value="' + ia + '"' + iaSel + '>' + ia + '</option>';
    }
    html += '</select></div></div></div>';

    // Single video fields
    html += '<div class="cp-v2-media-video" data-show-for="single_video" style="display:none">';
    html += '<div class="cp-form-group"><label>Video concept</label>';
    html += '<textarea class="cp-textarea" data-field="media.video.concept" rows="2" placeholder="One-line concept — what happens in the video.">' + esc(vid.concept || '') + '</textarea></div>';
    html += '<div class="cp-form-row"><div class="cp-form-third"><label>Duration (s)</label>';
    html += '<input type="number" class="cp-input" data-field="media.video.duration_seconds" min="1" max="60" value="' + esc(vid.duration_seconds || 30) + '">';
    html += '</div><div class="cp-form-third"><label>Aspect ratio</label>';
    html += '<select class="cp-select" data-field="media.video.aspect_ratio">';
    var vidAspects = ['9:16','1:1','16:9','4:5'];
    for (var vai = 0; vai < vidAspects.length; vai++) {
      var va = vidAspects[vai];
      var vaSel = (vid.aspect_ratio === va) || (!isEdit && va === '9:16') ? ' selected' : '';
      html += '<option value="' + va + '"' + vaSel + '>' + va + '</option>';
    }
    html += '</select></div></div></div>';

    // Carousel — Stage 2 will build proper cards editor
    html += '<div class="cp-v2-media-carousel" data-show-for="carousel" style="display:none">';
    html += '<div class="cp-form-hint">Carousel cards editor lands in Stage 2. For now, save this Ad and the cards array will initialise empty.</div>';
    html += '</div>';

    html += '</div>';

    // --- Section: Review & production ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('clipboard-list') + ' Review & production</div>';
    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Assigned to</label>';
    html += '<input type="text" class="cp-input" data-field="assigned_to" value="' + esc(a.assigned_to || '') + '" placeholder="Teammate name or email">';
    html += '</div><div class="cp-form-half"><label>Due date</label>';
    html += '<input type="date" class="cp-input" data-field="due_date" value="' + esc(a.due_date || '') + '">';
    html += '</div></div>';
    html += '<div class="cp-form-group"><label>Production notes</label>';
    html += '<textarea class="cp-textarea" data-field="production_notes" rows="2" placeholder="Where assets live, who is shooting, etc.">' + esc(a.production_notes || '') + '</textarea></div>';
    html += '<div class="cp-form-group"><label>Review notes</label>';
    html += '<textarea class="cp-textarea" data-field="review_notes" rows="2" placeholder="Feedback from reviewers...">' + esc(a.review_notes || '') + '</textarea></div>';
    html += '</div>';

    html += '</div>';

    openModal(isEdit ? 'Edit Ad' : 'New Ad', html, {
      titleIcon: 'rectangle-ad',
      size: 'lg',
      saveLabel: isEdit ? 'Save Ad' : 'Create Ad',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.name || !fields.name.trim()) { toast('Ad name is required', 'warning'); return; }
        // creative_type is a radio — pick the checked one
        var creativeType = $('input[name="cp-v2-ad-creative-type"]:checked').val() || 'single_image';

        var payload = {
          ad_set_id: adSetId,
          name: fields.name.trim(),
          pipeline_status: fields.pipeline_status || 'hook_ready',
          creative_type: creativeType,
          creative: {
            primary_text: fields['creative.primary_text'] || '',
            headline: fields['creative.headline'] || '',
            description: fields['creative.description'] || '',
            cta_type: fields['creative.cta_type'] || 'LEARN_MORE',
            cta_link: fields['creative.cta_link'] || '',
            display_link: fields['creative.display_link'] || '',
            tracking_params: fields['creative.tracking_params'] || ''
          },
          hook: {
            source_message_id: hook.source_message_id || '',
            selected_hook_id: hook.selected_hook_id || '',
            text: fields['hook.text'] || '',
            type: fields['hook.type'] || 'direct'
          },
          media: {
            image: $.extend({}, img, {
              prompt: fields['media.image.prompt'] || '',
              aspect_ratio: fields['media.image.aspect_ratio'] || '1:1'
            }),
            video: $.extend({ script: { sections: [] } }, vid, {
              concept: fields['media.video.concept'] || '',
              duration_seconds: fields['media.video.duration_seconds'] !== '' ? Number(fields['media.video.duration_seconds']) : 30,
              aspect_ratio: fields['media.video.aspect_ratio'] || '9:16'
            }),
            carousel_cards: media.carousel_cards || []
          },
          assigned_to: fields.assigned_to || '',
          due_date: fields.due_date || '',
          production_notes: fields.production_notes || '',
          review_notes: fields.review_notes || ''
        };

        if (isEdit) {
          snapshot('Edit Ad');
          for (var k in payload) saveEntityField('ad', adIdOrAdSetId, k, payload[k]);
          toast('Ad saved', 'success');
        } else {
          snapshot('Create Ad');
          var created = createEntity('ad', payload);
          if (created) {
            S.selectedCampaignV2Id = adSet.campaign_id;
            S.selectedAdSetId = adSetId;
            S.selectedAdId = created.id;
            navigate('campaign_workspace', { hash: 'campaign/' + adSet.campaign_id + '/ad_set/' + adSetId + '/ad/' + created.id });
          }
        }
        closeModal();
      }
    });

    // Wire up creative-type toggling (show/hide media sub-sections)
    $(document).off('change.cp-v2-ad-ctype').on('change.cp-v2-ad-ctype', 'input[name="cp-v2-ad-creative-type"]', function() {
      var v = $(this).val();
      $('.cp-segmented-option').removeClass('cp-segmented-active');
      $(this).closest('.cp-segmented-option').addClass('cp-segmented-active');
      $('[data-show-for]').each(function() {
        $(this).toggle($(this).data('show-for') === v);
      });
    });
  }

  function confirmDeleteMetaAd(adId) {
    var a = getAd(adId);
    if (!a) return;
    openConfirmDialog({
      title: 'Delete Ad',
      message: 'Delete "' + a.name + '"?',
      confirmLabel: 'Delete', danger: true,
      onConfirm: function() {
        snapshot('Delete Ad');
        var setId = a.ad_set_id;
        var adSet = getAdSet(setId);
        deleteEntity('ad', adId);
        if (S.currentView === 'campaign_workspace' && adSet) {
          navigate('campaign_workspace', { hash: 'campaign/' + adSet.campaign_id + '/ad_set/' + setId });
        }
      }
    });
  }

/* ===== src/20-part2a/09d-library-integration-pickers.js ===== */
  // ============================================================
  // SECTION 9D: LIBRARY ↔ WORKSPACE PICKERS (v2 Stage 3)
  // ============================================================
  //
  // Two small picker modals that bridge from a library entity detail
  // pane into the Meta v2 workspace:
  //   - Pick which Campaign to create an Ad Set under (when a Persona
  //     "Create Ad Set" action fires and >1 campaigns exist)
  //   - Pick which Ad Set's brief to attach a Message/Style/Format to

  function openMetaAdSetModalWithPersona(campaignId, personaId) {
    // Open the Ad Set modal pre-populated with a persona link. We do this
    // by stashing the desired persona on a global and intercepting in the
    // modal — simpler than threading another argument through.
    window._cpV2PendingPersonaId = personaId;
    openMetaAdSetModal(campaignId, { create: true });
    // The modal reads from `s.persona_id` which is empty for new sets.
    // Pre-select after a tick.
    setTimeout(function() {
      var $sel = $('.cp-modal-body select[data-field="persona_id"]');
      if ($sel.length && personaId) {
        $sel.val(personaId).trigger('change');
      }
      window._cpV2PendingPersonaId = null;
    }, 50);
  }

  function openCampaignPickerForAdSet(personaId) {
    var camps = getAllCampaignsV2();
    var persona = getPersona(personaId);

    var html = '<div class="cp-editor-form">';
    html += '<p>Pick a campaign to add an Ad Set targeting <strong>' + esc(persona ? persona.name : 'this persona') + '</strong> to:</p>';
    html += '<div class="cp-picker-list">';
    for (var i = 0; i < camps.length; i++) {
      var c = camps[i];
      var sets = getAdSetsByCampaign(c.id).length;
      var obj = metaObjective(c.objective);
      html += '<button class="cp-picker-item" data-pick-id="' + esc(c.id) + '">';
      html += '<div class="cp-picker-item-title">' + icon('bullhorn') + ' ' + esc(c.name || 'Untitled') + '</div>';
      html += '<div class="cp-picker-item-meta">' + (obj ? esc(obj.label) + ' · ' : '') + sets + ' Ad Set' + (sets !== 1 ? 's' : '') + '</div>';
      html += '</button>';
    }
    html += '</div></div>';

    openModal('Create Ad Set under...', html, {
      titleIcon: 'crosshairs', size: 'md', footer: false
    });

    $(document).off('click.cpv2-picker').on('click.cpv2-picker', '.cp-picker-item', function() {
      var campaignId = $(this).data('pick-id');
      if (!campaignId) return;
      closeModal();
      openMetaAdSetModalWithPersona(campaignId, personaId);
    });
  }

  function openAdSetBriefAttachPicker(type, libraryEntityId) {
    var allSets = getAllAdSets();
    var typeLabel = type === 'visual_format' ? 'Format' : (type.charAt(0).toUpperCase() + type.slice(1));
    var fieldKey = type === 'visual_format' ? 'format_ids' : (type + '_ids');

    if (allSets.length === 0) {
      toast('No Ad Sets to attach to. Create a Campaign + Ad Set first.', 'info');
      navigate('meta_campaigns');
      return;
    }

    // Get the library entity for the title
    var libEntity = null;
    if (type === 'message') libEntity = getMessage(libraryEntityId);
    else if (type === 'style') libEntity = getStyle(libraryEntityId);
    else if (type === 'visual_format') libEntity = getFormat(libraryEntityId);
    var libName = libEntity ? (libEntity.title || libEntity.name) : 'this item';

    var html = '<div class="cp-editor-form">';
    html += '<p>Attach ' + esc(typeLabel) + ' "<strong>' + esc(libName) + '</strong>" to one or more Ad Set briefs:</p>';
    html += '<div class="cp-picker-list" style="max-height:60vh;overflow-y:auto">';
    for (var i = 0; i < allSets.length; i++) {
      var s = allSets[i];
      var c = S.campaignV2Map[s.campaign_id];
      var already = (s.brief && (s.brief[fieldKey] || []).indexOf(libraryEntityId) > -1);
      html += '<label class="cp-picker-item' + (already ? ' cp-picker-item-active' : '') + '">';
      html += '<input type="checkbox" class="cp-v2-attach-target" data-set-id="' + esc(s.id) + '"' + (already ? ' checked' : '') + ' style="margin-right:8px">';
      html += '<div style="flex:1">';
      html += '<div class="cp-picker-item-title">' + icon('crosshairs') + ' ' + esc(s.name) + '</div>';
      html += '<div class="cp-picker-item-meta">' + (c ? esc(c.name) : 'No campaign') + '</div>';
      html += '</div></label>';
    }
    html += '</div></div>';

    openModal('Attach to Ad Set brief', html, {
      titleIcon: 'plus', size: 'md',
      saveLabel: 'Apply',
      onSave: function() {
        var targetIds = [];
        $('.cp-v2-attach-target:checked').each(function() { targetIds.push($(this).data('set-id')); });
        snapshot('Attach ' + typeLabel + ' to Ad Set briefs');
        var added = 0, removed = 0;
        // Apply: for each Ad Set, ensure libraryEntityId is in field iff selected
        allSets.forEach(function(s) {
          var isSelected = targetIds.indexOf(s.id) > -1;
          s.brief = s.brief || {};
          var arr = s.brief[fieldKey] || [];
          var hasIt = arr.indexOf(libraryEntityId) > -1;
          if (isSelected && !hasIt)  { arr.push(libraryEntityId); s.brief[fieldKey] = arr; s.updated = new Date().toISOString(); added++; }
          if (!isSelected && hasIt)  { arr = arr.filter(function(id) { return id !== libraryEntityId; }); s.brief[fieldKey] = arr; s.updated = new Date().toISOString(); removed++; }
        });
        buildMaps(); syncToTextarea(); render();
        if (added || removed) toast('Updated ' + (added + removed) + ' Ad Set' + ((added + removed) !== 1 ? 's' : ''), 'success');
        closeModal();
      }
    });
  }

/* ===== src/20-part2a/09e-meta-ab-testing.js ===== */
  // ============================================================
  // SECTION 9E: META v2 — A/B TESTING (Stage 5)
  // ============================================================
  //
  // A/B tests are scoped to a Campaign. The campaign.ab_test object stores
  // { enabled, primary_metric, variants: [{ ad_set_id, role, winner }] }.
  // Each participating Ad Set's ab_role is mirrored on the Ad Set itself
  // (CONTROL / VARIANT_A / VARIANT_B).

  function openABTestConfigModal(campaignId) {
    var camp = getCampaignV2(campaignId);
    if (!camp) return;
    var sets = getAdSetsByCampaign(campaignId);
    if (sets.length < 2) {
      toast('Need at least 2 Ad Sets in this Campaign before setting up an A/B test', 'warning');
      return;
    }

    var ab = camp.ab_test || { enabled: false, primary_metric: '', variants: [] };
    var C = Constants;
    var existingVariants = {};
    (ab.variants || []).forEach(function(v) { existingVariants[v.ad_set_id] = v; });

    var html = '<div class="cp-editor-form">';

    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('flask') + ' A/B test configuration</div>';

    html += '<label class="cp-form-toggle">';
    html += '<input type="checkbox" id="cpV2ABEnable"' + (ab.enabled ? ' checked' : '') + '>';
    html += '<span>Enable A/B test for this campaign</span></label>';

    html += '<div class="cp-form-group" style="margin-top:var(--cp-space-3)"><label>Primary metric</label>';
    html += '<select class="cp-select" id="cpV2ABMetric">';
    html += '<option value="">— Pick a metric —</option>';
    for (var mk in C.META_AB_METRICS) {
      var mSel = (ab.primary_metric === mk) ? ' selected' : '';
      html += '<option value="' + mk + '"' + mSel + '>' + esc(C.META_AB_METRICS[mk].label) + '</option>';
    }
    html += '</select>';
    html += '<div class="cp-form-help">The metric the test will be judged on. You\'ll mark a winner after the test ends.</div>';
    html += '</div></div>';

    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('crosshairs') + ' Assign Ad Sets to variants</div>';
    html += '<div class="cp-form-help" style="margin-bottom:8px">Each Ad Set can be Control, Variant A, Variant B, or excluded from the test.</div>';

    for (var i = 0; i < sets.length; i++) {
      var s = sets[i];
      var currentRole = existingVariants[s.id] ? existingVariants[s.id].role : (s.ab_role || '');
      html += '<div class="cp-v2-ab-row">';
      html += '<div class="cp-v2-ab-row-name">' + icon('crosshairs') + ' ' + esc(s.name) + '</div>';
      html += '<div class="cp-v2-ab-row-roles">';
      var roles = ['', 'CONTROL', 'VARIANT_A', 'VARIANT_B'];
      var roleLabels = ['Exclude', 'Control', 'Variant A', 'Variant B'];
      for (var ri = 0; ri < roles.length; ri++) {
        var r = roles[ri];
        var rSel = (currentRole === r) || (!currentRole && r === '') ? ' cp-v2-ab-role-selected' : '';
        var rColor = r ? (C.META_AB_ROLES[r] || {}).color : '#80868b';
        html += '<label class="cp-v2-ab-role' + rSel + '" style="--ab-color:' + rColor + '">';
        html += '<input type="radio" name="cp-v2-ab-role-' + esc(s.id) + '" data-set-id="' + esc(s.id) + '" value="' + r + '"' + (rSel ? ' checked' : '') + ' style="display:none">';
        html += esc(roleLabels[ri]);
        html += '</label>';
      }
      html += '</div></div>';
    }
    html += '</div>';
    html += '</div>';

    openModal('A/B Test setup', html, {
      titleIcon: 'flask', size: 'lg',
      saveLabel: 'Save A/B test',
      onSave: function() {
        var enabled = $('#cpV2ABEnable').is(':checked');
        var metric = $('#cpV2ABMetric').val();

        // Collect role per Ad Set
        var variants = [];
        var rolesBySet = {};
        sets.forEach(function(s) {
          var role = $('input[name="cp-v2-ab-role-' + s.id + '"]:checked').val() || '';
          rolesBySet[s.id] = role;
          if (role) variants.push({ ad_set_id: s.id, role: role, winner: !!(existingVariants[s.id] && existingVariants[s.id].winner) });
        });

        if (enabled && variants.length < 2) {
          toast('Pick at least 2 Ad Sets (e.g., Control + Variant A)', 'warning'); return;
        }

        snapshot('A/B test setup');
        // Update campaign
        camp.ab_test = { enabled: enabled, primary_metric: metric || '', variants: variants };
        camp.updated = new Date().toISOString();
        // Update per-Ad-Set ab_role to keep tree badges in sync
        sets.forEach(function(s) {
          var newRole = enabled ? (rolesBySet[s.id] || null) : null;
          if (s.ab_role !== newRole) {
            s.ab_role = newRole;
            s.updated = new Date().toISOString();
          }
        });
        buildMaps(); syncToTextarea(); render();
        logActivity('campaign_v2_updated', 'campaign_v2', camp.id, camp.name, enabled ? 'A/B test enabled (' + variants.length + ' variants)' : 'A/B test disabled');
        toast(enabled ? 'A/B test saved' : 'A/B test disabled', 'success');
        closeModal();
      }
    });

    // Role-selector click → set radio checked + visual state
    $(document).off('click.cpv2-ab-role').on('click.cpv2-ab-role', '.cp-v2-ab-role', function() {
      var $radio = $(this).find('input[type="radio"]');
      $radio.prop('checked', true);
      $(this).siblings('.cp-v2-ab-role').removeClass('cp-v2-ab-role-selected');
      $(this).addClass('cp-v2-ab-role-selected');
    });
  }

  // --- Compare Variants modal ---

  function openCompareVariantsModal(campaignId) {
    var camp = getCampaignV2(campaignId);
    if (!camp || !camp.ab_test || !camp.ab_test.enabled) {
      toast('No A/B test set up for this campaign', 'info'); return;
    }
    var variants = camp.ab_test.variants || [];
    if (variants.length === 0) { toast('No variants assigned', 'warning'); return; }
    var C = Constants;
    var metricLabel = (C.META_AB_METRICS[camp.ab_test.primary_metric] || {}).label || '—';

    var html = '<div class="cp-editor-form">';
    html += '<p class="cp-text-muted">Primary metric: <strong>' + esc(metricLabel) + '</strong>. Mark the winner once your test concludes.</p>';

    html += '<div class="cp-v2-ab-compare-grid">';
    for (var i = 0; i < variants.length; i++) {
      var v = variants[i];
      var s = S.adSetMap[v.ad_set_id];
      if (!s) continue;
      var roleInfo = C.META_AB_ROLES[v.role] || { label: v.role, color: '#80868b' };
      var persona = S.personaMap[s.persona_id];
      var ads = getAdsByAdSet(s.id);
      var brief = s.brief || {};
      var goal = (C.META_OPTIMIZATION_GOALS[s.optimization_goal] || {}).label || s.optimization_goal;

      html += '<div class="cp-v2-ab-variant-card' + (v.winner ? ' cp-v2-ab-variant-winner' : '') + '" style="--variant-color:' + roleInfo.color + '">';
      html += '<div class="cp-v2-ab-variant-header">';
      html += '<span class="cp-v2-ab-variant-role">' + icon('flask') + ' ' + esc(roleInfo.label) + '</span>';
      if (v.winner) html += '<span class="cp-v2-ab-variant-winner-badge">' + icon('trophy') + ' Winner</span>';
      html += '</div>';

      html += '<h3>' + icon('crosshairs') + ' ' + esc(s.name) + '</h3>';
      html += '<div class="cp-v2-ab-variant-meta">';
      if (persona) html += '<div>' + icon('user') + ' ' + esc(persona.name) + '</div>';
      if (goal) html += '<div>' + icon('bullseye-arrow') + ' ' + esc(goal) + '</div>';
      html += '<div>' + icon('rectangle-ad') + ' ' + ads.length + ' Ad' + (ads.length !== 1 ? 's' : '') + '</div>';
      html += '</div>';

      if (brief.creative_direction) {
        html += '<div class="cp-v2-ab-variant-section"><div class="cp-v2-ab-variant-section-title">Creative direction</div>';
        html += '<p>' + esc(truncate(brief.creative_direction, 220)) + '</p></div>';
      }
      if ((brief.hook_angles || []).length) {
        html += '<div class="cp-v2-ab-variant-section"><div class="cp-v2-ab-variant-section-title">Hook angles</div>';
        html += '<ul>' + brief.hook_angles.slice(0, 3).map(function(a) { return '<li>' + esc(truncate(a, 80)) + '</li>'; }).join('') + '</ul></div>';
      }

      // Top ads
      if (ads.length) {
        html += '<div class="cp-v2-ab-variant-section"><div class="cp-v2-ab-variant-section-title">Ads</div>';
        for (var ai = 0; ai < Math.min(ads.length, 3); ai++) {
          var ad = ads[ai];
          html += '<div class="cp-v2-ab-variant-ad">';
          html += '<div class="cp-v2-ab-variant-ad-name">' + esc(ad.name) + '</div>';
          if (ad.hook && ad.hook.text) html += '<div class="cp-v2-ab-variant-ad-hook">"' + esc(truncate(ad.hook.text, 80)) + '"</div>';
          html += '</div>';
        }
        if (ads.length > 3) html += '<div class="cp-text-muted" style="font-size:11px">+ ' + (ads.length - 3) + ' more</div>';
        html += '</div>';
      }

      // Mark winner button
      html += '<div class="cp-v2-ab-variant-footer">';
      if (!v.winner) {
        html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="ws-mark-ab-winner" data-campaign-id="' + esc(camp.id) + '" data-set-id="' + esc(s.id) + '">' + icon('trophy') + ' Mark as winner</button>';
      } else {
        html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="ws-clear-ab-winner" data-campaign-id="' + esc(camp.id) + '" data-set-id="' + esc(s.id) + '">' + icon('refresh') + ' Clear winner</button>';
      }
      html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="lib-open-ad-set" data-id="' + esc(s.id) + '" data-campaign-id="' + esc(camp.id) + '">' + icon('arrow-right') + ' Open</button>';
      html += '</div>';

      html += '</div>';
    }
    html += '</div></div>';

    openModal('Compare variants — ' + camp.name, html, {
      titleIcon: 'flask', size: 'xl', footer: false
    });
  }

  // Winner mark/clear
  function setABWinner(campaignId, adSetId, isWinner) {
    var camp = getCampaignV2(campaignId);
    if (!camp || !camp.ab_test) return;
    snapshot(isWinner ? 'Mark A/B winner' : 'Clear A/B winner');
    (camp.ab_test.variants || []).forEach(function(v) {
      v.winner = isWinner && v.ad_set_id === adSetId;
    });
    camp.updated = new Date().toISOString();
    buildMaps(); syncToTextarea(); render();
    var s = S.adSetMap[adSetId];
    logActivity('campaign_v2_updated', 'campaign_v2', camp.id, camp.name, isWinner ? ('Marked "' + (s ? s.name : '') + '" as A/B winner') : 'Cleared A/B winner');
    toast(isWinner ? 'Winner marked' : 'Winner cleared', 'success');
    // Re-open the compare modal with fresh state
    closeModal();
    setTimeout(function() { openCompareVariantsModal(campaignId); }, 100);
  }

/* ===== src/20-part2a/11-setup-wizard.js ===== */
  // ============================================================
  // SECTION 9.4: SETUP WIZARD (First-Run Guided Setup)
  // ============================================================
  //
  // Six-stage flow:
  //   1. Brand & AI   — brand context + AI provider/model + custom instructions
  //                     + mode picker (Manual vs Full Auto)
  //   2. Personas & Pain Points (merged)
  //   3. Messages
  //   4. Styles & Formats
  //   5. Campaign Ideas
  //   6. Review & Launch
  //
  // Auto-launches on empty state. The close (X) button is gated and only
  // appears after Stage 1 is complete (AI configured + mode chosen).

  // --- State ---
  // Singleton object. NEVER reassign — always mutate via _swReplaceState() so the
  // exported reference in window._cpPart2A.setupWizardState stays in sync with
  // Part 2B's AI generators (which read it as a snapshot).
  var setupWizardState = {};

  var SW_STAGES = [
    { num: 1, label: 'Brand & AI',           sublabel: 'Context + provider',     phase: 'a', icon: 'sparkles',     genKey: null },
    { num: 2, label: 'Personas & Pain',      sublabel: 'Who & their challenges', phase: 'b', icon: 'users',        genKey: 'personas' },
    { num: 3, label: 'Messages',             sublabel: 'Ad angles & hooks',      phase: 'b', icon: 'comment-dots', genKey: 'messages' },
    { num: 4, label: 'Styles & Formats',     sublabel: 'Creative approach',      phase: 'b', icon: 'palette',      genKey: 'stylesFormats' },
    { num: 5, label: 'Campaign Ideas',       sublabel: 'Pick campaigns to plan', phase: 'c', icon: 'lightbulb',    genKey: 'campaignIdeas' },
    { num: 6, label: 'Review',               sublabel: 'Launch your workspace',  phase: 'c', icon: 'rocket',       genKey: null }
  ];
  var SW_STAGE_COUNT = SW_STAGES.length;

  var SW_PHASE_LABELS = { a: 'Foundation', b: 'Library', c: 'Campaigns' };

  // Auto-advance delay (ms) shown to the user as a result preview between
  // stages in Full Auto mode. Long enough to read the headline, short enough
  // to feel like a chained run. User can hit Pause to freeze.
  var SW_AUTO_ADVANCE_MS = 2500;

  // Volatile keys excluded from session persistence (re-derived each run)
  var SW_VOLATILE_KEYS = ['aiLoading', 'aiActionId', 'aiStartedAt', 'aiError',
                          '_autoAdvanceTimer', '_autoAdvanceUntil', 'paused'];

  // --- State persistence (session storage) ---
  function swSaveSession() {
    try {
      var clone = $.extend(true, {}, setupWizardState);
      for (var i = 0; i < SW_VOLATILE_KEYS.length; i++) delete clone[SW_VOLATILE_KEYS[i]];
      sessionStorage.setItem('cp_sw_state', JSON.stringify(clone));
    } catch(e) {}
  }
  function swLoadSession() {
    try {
      var saved = sessionStorage.getItem('cp_sw_state');
      if (saved) {
        var parsed = JSON.parse(saved);
        if (parsed && parsed.step) {
          // Merge over fresh defaults so older sessions get any new fields
          var merged = $.extend(true, _swFreshState(), parsed);
          merged.aiLoading = false; merged.aiActionId = ''; merged.aiStartedAt = 0;
          merged.paused = false; merged._autoAdvanceTimer = null;
          return merged;
        }
      }
    } catch(e) {}
    return null;
  }
  function swClearSession() {
    try { sessionStorage.removeItem('cp_sw_state'); } catch(e) {}
  }

  // --- Dot-path helpers for field collection ---
  function swSetPath(path, val) {
    var parts = path.split('.');
    var obj = setupWizardState;
    for (var i = 0; i < parts.length - 1; i++) { obj = obj[parts[i]] = obj[parts[i]] || {}; }
    obj[parts[parts.length - 1]] = val;
  }
  function swGetPath(path) {
    var parts = path.split('.');
    var obj = setupWizardState;
    for (var i = 0; i < parts.length; i++) { if (obj == null) return ''; obj = obj[parts[i]]; }
    return obj == null ? '' : obj;
  }

  // --- Collect all data-sw-field inputs from current stage ---
  function swCollectFields() {
    $('.cp-sw-content-inner [data-sw-field]').each(function() {
      var path = $(this).data('sw-field');
      if (!path) return;
      var val = $(this).is(':checkbox') ? $(this).is(':checked') : $(this).val();
      swSetPath(path, val || '');
    });
    // Stage 1: capture AI picker provider/model (rendered by LLMService, no data-sw-field)
    if (setupWizardState.step === 1) {
      var $prov = $('.cp-ai-provider-select[data-action-id="sw-ai-config"]');
      var $mod  = $('.cp-ai-model-select[data-action-id="sw-ai-config"]');
      if ($prov.length) setupWizardState.aiConfig.provider = $prov.val();
      if ($mod.length)  setupWizardState.aiConfig.model    = $mod.val();
    }
  }

  // Replace properties on the singleton `setupWizardState` object instead of
  // reassigning the variable. The exported reference in window._cpPart2A.setupWizardState
  // is captured at module load time, so reassigning the IIFE-local variable
  // would silently desync Part 2B (AI generators) from Part 2A (renderers).
  function _swReplaceState(newState) {
    var keys = Object.keys(setupWizardState);
    for (var i = 0; i < keys.length; i++) delete setupWizardState[keys[i]];
    var nkeys = Object.keys(newState);
    for (var j = 0; j < nkeys.length; j++) setupWizardState[nkeys[j]] = newState[nkeys[j]];
  }

  // Forward-declared call at end of file initializes the singleton shape.
  function _swFreshState() {
    return {
      step: 1,
      mode: '',  // '' until user picks; then 'manual' or 'auto'
      paused: false,
      _autoAdvanceTimer: null,
      _autoAdvanceUntil: 0,
      aiLoading: false, aiActionId: '', aiStartedAt: 0, aiError: '',
      // Generation tracking — string keys per stage (stage 2 has two: personas, painpoints)
      stepGenerated: {},   // { personas, painpoints, messages, stylesFormats, campaignIdeas }
      stepSkipped: {},
      _expandedCards: {}, _ppActiveTab: 0,
      // Pre-filled from brand context at wizard open (read-only display + AI hand-off)
      brandContext: {},
      workspace: { name: '', description: '', product_name: '', objective: '',
                   brand_voice: '', target_audience: '', custom_instructions: '' },
      aiConfig: { provider: '', model: '', tested: false },
      // Library entities — populated during stages 2-4
      personas:    [],
      pain_points: [],
      messages:    [],
      styles:      [],
      formats:     [],
      // Stage 5 produces a list of named campaign ideas. Each idea becomes a
      // draft campaign_v2 on launch. Ad Sets + Ads are built later by the
      // per-campaign wizard from inside the campaign workspace.
      campaign_ideas: [],
      _campaignIdeasContext: '',
      created: {
        personaIds: [], painPointIds: [], messageIds: [],
        styleIds: [], formatIds: [],
        campaignV2Ids: [],
        lastGeneratedAt: {}
      },
      finalizing: false, finalizeMsg: ''
    };
  }

  // --- Pre-fill workspace fields from brand context when available ---
  // Brand JSON fields are heterogeneous: `audience` is an object
  // ({primary, pain_points, desires}), `forbidden_words`/`dos`/`donts`/
  // `content_pillars` are arrays, the rest are strings. Mirror the same
  // coercion conventions BrandService.getSystemPrompt() uses so the
  // brand-context card always receives strings.
  function _swPrefillFromBrand(state) {
    if (!(S.brand && S.brand.configured)) return;
    var core    = S.brand.core    || {};
    var content = S.brand.content || {};
    var video   = S.brand.video   || {};
    var ident   = S.brand.identity || {};

    function joinList(v, sep, cap) {
      if (Array.isArray(v)) return (cap ? v.slice(0, cap) : v).join(sep);
      return (v == null ? '' : String(v));
    }
    function audienceSummary(aud) {
      if (!aud) return '';
      if (typeof aud === 'string') return aud;
      // Mirrors BrandService: prefer `primary`, fall back to a one-line summary.
      if (aud.primary) return String(aud.primary);
      var bits = [];
      if (Array.isArray(aud.pain_points) && aud.pain_points.length) bits.push('Pain: ' + aud.pain_points.slice(0, 3).join('; '));
      if (Array.isArray(aud.desires)     && aud.desires.length)     bits.push('Wants: ' + aud.desires.slice(0, 3).join('; '));
      return bits.join(' · ');
    }

    state.brandContext = {
      name:      ident.name || core.brand_name || '',
      tagline:   core.tagline || '',
      voice:     core.brand_voice || content.writing_style || '',
      audience:  audienceSummary(core.audience) || (core.target_audience == null ? '' : String(core.target_audience)),
      forbidden: joinList(core.forbidden_words, ', '),
      dos:       joinList(core.dos,   '; ', 6),
      donts:     joinList(core.donts, '; ', 6),
      pillars:   joinList(video.content_pillars, ', '),
      cta:       content.cta_style || ''
    };
    // Seed workspace fields the wizard uses for AI prompts. User can still edit.
    if (!state.workspace.name && state.brandContext.name) {
      state.workspace.name = state.brandContext.name + ' Campaigns';
    }
    if (!state.workspace.product_name && state.brandContext.name) {
      state.workspace.product_name = state.brandContext.name;
    }
    if (!state.workspace.brand_voice && state.brandContext.voice) {
      state.workspace.brand_voice = state.brandContext.voice;
    }
    if (!state.workspace.target_audience && state.brandContext.audience) {
      state.workspace.target_audience = state.brandContext.audience;
    }
  }

  // --- Open wizard (entry point) ---
  function openSetupWizard(forceReset) {
    // Try to resume session unless forced reset
    if (!forceReset) {
      var saved = swLoadSession();
      if (saved && !saved.finalizing) {
        // Ask user to resume or restart
        openConfirmDialog({
          title: 'Resume Setup?',
          message: 'You have an incomplete setup from a previous session (Stage ' + saved.step + ' of ' + SW_STAGE_COUNT + '). Would you like to continue where you left off?',
          confirmLabel: 'Resume',
          cancelLabel: 'Start Over',
          onConfirm: function() {
            try { _swReplaceState(saved); _renderSetupWizardDOM(); }
            catch (e) { _swHandleOpenFailure(e); }
          },
          onCancel:  function() { swClearSession(); _initFreshWizard(); }
        });
        return;
      }
    }
    _initFreshWizard();
  }

  // Recovery path when prefill or render throws. Tear down the
  // partially-built overlay so the user doesn't see a blank fixed
  // background on top of the app, surface a toast, and log the stack.
  function _swHandleOpenFailure(err) {
    try { $('.cp-setup-wizard').remove(); } catch (e2) {}
    try {
      if (typeof toast === 'function') {
        toast('Setup wizard failed to open — see console for details.', 'error', 6000);
      }
    } catch (e3) {}
    console.error('[CP] Setup wizard open/render failed:', (err && err.stack) || err);
  }

  // Auto-launch the wizard on an empty workspace. Returns true if launched.
  // Caller (init) should also check S.meta.setup.setup_complete is falsey.
  function maybeAutoLaunchSetupWizard() {
    if (!S || !S.meta || !S.data) { console.log('[CP] Setup wizard auto-launch: S not ready, skipping'); return false; }
    var setup = S.meta.setup || {};
    var hasPersonas  = Object.keys(S.data.personas       || {}).length > 0;
    var hasMessages  = Object.keys(S.data.messages       || {}).length > 0;
    var hasCampaigns = Object.keys(S.data.campaigns_v2   || {}).length > 0;
    var brandConfigured = !!(S.brand && S.brand.configured);
    console.log('[CP] Setup wizard auto-launch check:', { setup_complete: !!setup.setup_complete, hasPersonas: hasPersonas, hasMessages: hasMessages, hasCampaigns: hasCampaigns, brandConfigured: brandConfigured });
    if (setup.setup_complete) return false;
    if (hasPersonas || hasMessages || hasCampaigns) return false;
    // Only bail if the wizard is actually visible -- a stale orphan node from
    // a previous failed render would otherwise silently block auto-launch.
    var $existing = $('.cp-setup-wizard');
    if ($existing.length) {
      if ($existing.is(':visible')) return false;
      $existing.remove();
    }
    openSetupWizard(false);
    return true;
  }

  function _initFreshWizard() {
    try {
      var fresh = _swFreshState();
      _swPrefillFromBrand(fresh);
      _swReplaceState(fresh);
      _renderSetupWizardDOM();
    } catch (e) {
      _swHandleOpenFailure(e);
    }
  }

  function _renderSetupWizardDOM() {
    // Remove any existing wizard overlay
    $('.cp-setup-wizard').remove();
    // Build and append overlay to #cpApp with ARIA dialog role
    var $wizard = $('<div class="cp-setup-wizard" id="cpSetupWizard" role="dialog" aria-modal="true" aria-label="Campaign Planner Setup Wizard"></div>');
    var $app = $('#cpApp');
    if ($app.length) $app.append($wizard); else $('body').append($wizard);
    renderSetupWizard();
  }

  // --- Main render (full wizard shell) ---
  function renderSetupWizard() {
    var html = _buildSWProgressBar();
    html += _buildSWCloseButton();
    html += '<div class="cp-sw-layout">';
    html += _buildSWRail();
    html += _buildSWContentArea();
    html += '</div>';
    $('#cpSetupWizard').html(html);
    // Focus first input in the content area
    setTimeout(function() {
      var $first = $('#cpSetupWizard .cp-sw-content-inner input, #cpSetupWizard .cp-sw-content-inner textarea, #cpSetupWizard .cp-sw-content-inner select');
      if ($first.length) $first.first().focus();
    }, 50);
  }

  // --- Partial refresh (rail + content only — avoids full re-render) ---
  function refreshSetupWizard() {
    swSaveSession();
    $('#cpSetupWizard .cp-sw-progress-fill').css('width', _swProgressPct() + '%');
    $('#cpSetupWizard .cp-sw-rail-steps').html(_buildSWRailSteps());
    $('#cpSetupWizard .cp-sw-content-inner').html(_buildSWStepContent());
    $('#cpSetupWizard .cp-sw-footer').html(_buildSWFooter());
    // Re-render close button to reflect gating state
    var $close = $('#cpSetupWizard .cp-sw-close');
    if (_swStage1Complete() && !$close.length) {
      $('#cpSetupWizard').prepend(_buildSWCloseButton());
    } else if (!_swStage1Complete() && $close.length) {
      $close.remove();
    }
    // Focus first focusable element in new stage
    setTimeout(function() {
      var $first = $('#cpSetupWizard .cp-sw-content-inner input:not([type=hidden]), #cpSetupWizard .cp-sw-content-inner textarea, #cpSetupWizard .cp-sw-content-inner select');
      if ($first.length) $first.first().focus();
    }, 50);
  }

  // True when AI provider/model is selected and a mode has been chosen.
  // Gates the close button — until then, the user must engage with Stage 1.
  // Escape hatch: if no AI providers are configured at all, the user has
  // nothing to pick here, so allow close so they can go set up Settings → AI.
  function _swStage1Complete() {
    var cfg = setupWizardState.aiConfig || {};
    var hasAI = !!(cfg.provider && cfg.model);
    var hasMode = setupWizardState.mode === 'auto' || setupWizardState.mode === 'manual';
    var pastStage1 = (setupWizardState.step || 1) > 1;
    var p2b = window._cpPart2B;
    var aiUnavailable = !(p2b && p2b.LLMService && p2b.LLMService.isConfigured());
    return (hasAI && hasMode) || pastStage1 || aiUnavailable;
  }

  // --- Build: top progress bar ---
  function _buildSWProgressBar() {
    return '<div class="cp-sw-progress-bar"><div class="cp-sw-progress-fill" style="width:' + _swProgressPct() + '%"></div></div>';
  }
  function _swProgressPct() {
    return Math.round(((setupWizardState.step - 1) / SW_STAGE_COUNT) * 100);
  }

  // --- Build: gated close button (appears only after Stage 1 complete) ---
  function _buildSWCloseButton() {
    if (!_swStage1Complete()) return '';
    return '<button class="cp-sw-close" data-action="sw-close" aria-label="Close setup wizard">' + icon('x') + '</button>';
  }

  // --- Build: left rail ---
  function _buildSWRail() {
    var html = '<div class="cp-sw-rail">';
    html += '<div class="cp-sw-rail-header">';
    html += '<div class="cp-sw-rail-logo">Campaign<span class="cp-sw-rail-logo-accent">Planner</span></div>';
    html += '<div class="cp-sw-rail-subtitle">Setup Wizard</div>';
    if (setupWizardState.mode) {
      var modeLabel = setupWizardState.mode === 'auto' ? 'Full Auto' : 'Manual';
      var modeCls = setupWizardState.mode === 'auto' ? ' cp-sw-rail-mode--auto' : '';
      html += '<div class="cp-sw-rail-mode' + modeCls + '">' + icon(setupWizardState.mode === 'auto' ? 'zap' : 'hand') + ' ' + esc(modeLabel) + ' mode</div>';
    }
    html += '</div>';
    html += '<div class="cp-sw-rail-steps">' + _buildSWRailSteps() + '</div>';
    // Footer — brand connection status
    html += '<div class="cp-sw-rail-footer">';
    var brandOn = S && S.brand && S.brand.configured;
    html += '<div class="cp-sw-rail-brand">';
    html += '<div class="cp-sw-rail-brand-dot' + (brandOn ? '' : ' cp-sw-rail-brand-dot--off') + '"></div>';
    html += '<span>' + (brandOn ? 'Brand profile connected' : 'No brand profile') + '</span>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  function _buildSWRailSteps() {
    var ws          = setupWizardState;
    var currentStep = ws.step;
    // Count map: how many items are selected per stage (for done badge)
    var stage2Count = (ws.personas    || []).filter(function(p) { return p._selected; }).length +
                      (ws.pain_points || []).filter(function(p) { return p._selected; }).length;
    var stage5Count = (ws.campaign_ideas || []).filter(function(c) { return c._selected; }).length;
    var stageCounts = {
      2: stage2Count,
      3: (ws.messages || []).filter(function(m) { return m._selected; }).length,
      4: (ws.styles   || []).filter(function(s) { return s._selected; }).length +
         (ws.formats  || []).filter(function(f) { return f._selected; }).length,
      5: stage5Count
    };
    var html = '';
    var lastPhase = '';
    for (var i = 0; i < SW_STAGES.length; i++) {
      var st = SW_STAGES[i];
      if (st.phase !== lastPhase) {
        html += '<div class="cp-sw-phase-label">' + esc(SW_PHASE_LABELS[st.phase]) + '</div>';
        lastPhase = st.phase;
      }
      var isDone      = st.num < currentStep;
      var isActive    = st.num === currentStep;
      var isLocked    = st.num > currentStep;
      var isClickable = isDone;
      var cls = 'cp-sw-step-item';
      if (isActive)    cls += ' cp-sw-step-item--active';
      if (isDone)      cls += ' cp-sw-step-item--done';
      if (isLocked)    cls += ' cp-sw-step-item--locked';
      if (isClickable) cls += ' cp-sw-step-item--clickable';

      html += '<div class="' + cls + '"';
      if (isClickable) html += ' data-action="sw-goto-step" data-step="' + st.num + '"';
      html += ' role="' + (isClickable ? 'button' : 'listitem') + '"';
      if (isClickable) html += ' tabindex="0"';
      if (isActive)    html += ' aria-current="step"';
      html += '>';

      html += '<div class="cp-sw-step-left">';
      html += '<div class="cp-sw-step-circle">';
      if (isDone) html += icon('check');
      else html += st.num;
      html += '</div>';
      if (i < SW_STAGES.length - 1) {
        html += '<div class="cp-sw-step-connector' + (isDone ? ' cp-sw-step-connector--done' : '') + '"></div>';
      }
      html += '</div>';

      html += '<div class="cp-sw-step-text">';
      html += '<div class="cp-sw-step-label">' + esc(st.label);
      // Selection count badge for done stages with counted items
      if (isDone && stageCounts[st.num] > 0) {
        html += '<span class="cp-sw-step-badge">' + stageCounts[st.num] + '</span>';
      }
      html += '</div>';
      html += '<div class="cp-sw-step-sublabel">' + esc(st.sublabel) + '</div>';
      html += '</div>';
      html += '</div>';
    }
    return html;
  }

  // --- Build: right content area ---
  function _buildSWContentArea() {
    var html = '<div class="cp-sw-content">';
    html += '<div class="cp-sw-content-scroll"><div class="cp-sw-content-inner">';
    html += _buildSWStepContent();
    html += '</div></div>';
    html += '<div class="cp-sw-footer">' + _buildSWFooter() + '</div>';
    html += '</div>';
    return html;
  }

  // --- Stage content router ---
  function _buildSWStepContent() {
    var n = setupWizardState.step;
    if (typeof renderSWStep1 === 'function' && n === 1) return renderSWStep1();
    if (typeof renderSWStep2 === 'function' && n === 2) return renderSWStep2();
    if (typeof renderSWStep3 === 'function' && n === 3) return renderSWStep3();
    if (typeof renderSWStep4 === 'function' && n === 4) return renderSWStep4();
    if (typeof renderSWStep5 === 'function' && n === 5) return renderSWStep5();
    if (typeof renderSWStep6 === 'function' && n === 6) return renderSWStep6();
    return _buildSWStepPlaceholder(n);
  }

  function _buildSWStepPlaceholder(n) {
    var st = SW_STAGES[n - 1] || {};
    var phaseKey = st.phase || 'a';
    var html = _buildSWStepHeader(st.label || 'Stage ' + n, 'This stage is coming soon.', phaseKey);
    html += '<div class="cp-sw-placeholder-body">';
    html += '<div class="cp-sw-placeholder-icon">' + icon(st.icon || 'circle') + '</div>';
    html += '<p>' + esc('Stage ' + n + ': ' + (st.label || '')) + ' — content will be added in a later phase.</p>';
    html += '</div>';
    return html;
  }

  // --- Reusable stage header builder ---
  function _buildSWStepHeader(title, subtitle, phase) {
    var phaseCls = { a: 'cp-sw-phase-badge--a', b: 'cp-sw-phase-badge--b', c: 'cp-sw-phase-badge--c' };
    var html = '<div class="cp-sw-step-header">';
    html += '<div class="cp-sw-phase-badge ' + (phaseCls[phase] || phaseCls.a) + '">' + esc(SW_PHASE_LABELS[phase] || '') + '</div>';
    html += '<h2 class="cp-sw-step-title">' + esc(title) + '</h2>';
    html += '<p class="cp-sw-step-subtitle">' + esc(subtitle) + '</p>';
    html += '</div>';
    return html;
  }

  // --- Build: footer navigation ---
  function _buildSWFooter() {
    var n = setupWizardState.step;
    var isFirst = n === 1;
    var isLast  = n === SW_STAGE_COUNT;
    var html = '';

    // Auto-advance preview bar takes over the whole footer in Full Auto mode
    // between stages — the user sees "Auto-advancing… Pause".
    if (setupWizardState._autoAdvanceTimer && !setupWizardState.paused) {
      html += '<div class="cp-sw-footer-auto">';
      html += '<div class="cp-sw-footer-auto-msg">' + icon('zap') + ' Reviewing this stage — auto-advancing in a moment…</div>';
      html += '<button class="cp-btn cp-btn-outline" data-action="sw-pause-auto">' + icon('pause') + ' Pause</button>';
      html += '</div>';
      return html;
    }
    if (setupWizardState.paused) {
      html += '<div class="cp-sw-footer-auto cp-sw-footer-auto--paused">';
      html += '<div class="cp-sw-footer-auto-msg">' + icon('pause') + ' Auto run paused. Edit anything you want, then resume.</div>';
      html += '<button class="cp-btn cp-btn-outline" data-action="sw-resume-auto">' + icon('zap') + ' Resume auto</button>';
      if (!isLast) {
        html += '<button class="cp-btn cp-btn-primary" data-action="sw-next">Continue manually ' + icon('arrow-right') + '</button>';
      }
      return html + '</div>';
    }

    // Left: Back button
    html += '<div class="cp-sw-footer-left">';
    if (!isFirst) {
      html += '<button class="cp-btn cp-btn-outline" data-action="sw-back">' + icon('arrow-left') + ' Back</button>';
    } else {
      html += '<span></span>';
    }
    html += '</div>';

    // Center: stage counter + skip link
    html += '<div class="cp-sw-footer-center">';
    html += '<div class="cp-sw-step-counter">Stage ' + n + ' of ' + SW_STAGE_COUNT + '</div>';
    if (!isFirst && !isLast) {
      html += '<button class="cp-sw-skip-link" data-action="sw-skip">Skip this stage</button>';
    }
    html += '</div>';

    // Right: Next / Launch button — except on Stage 1, where mode pickers replace it
    html += '<div class="cp-sw-footer-right">';
    if (isFirst) {
      // Stage 1 has its own mode-pick buttons inline. Hide footer-right.
      html += '<span class="cp-sw-footer-hint">Pick a mode above to continue</span>';
    } else if (!isLast) {
      var label = setupWizardState.mode === 'auto' ? 'Approve & auto-continue' : 'Approve & continue';
      html += '<button class="cp-btn cp-btn-primary" data-action="sw-next">' + esc(label) + ' ' + icon('arrow-right') + '</button>';
    } else {
      html += '<button class="cp-btn cp-btn-ai" data-action="sw-launch">' + icon('rocket') + ' Launch Workspace</button>';
    }
    html += '</div>';

    return html;
  }

  // --- Validation ---
  function validateSWStep(n) {
    var ws = setupWizardState;
    if (n === 1) {
      if (!ws.workspace.name.trim())         return { valid: false, message: 'Please enter a workspace name to continue.' };
      if (!ws.workspace.product_name.trim()) return { valid: false, message: 'Please enter your product or service name.' };
      if (!ws.aiConfig.provider || !ws.aiConfig.model) {
        return { valid: false, message: 'Pick an AI provider and model to continue.' };
      }
      if (!ws.mode) {
        return { valid: false, message: 'Choose Manual or Full Auto to start.' };
      }
    }
    if (n === 2) {
      if (ws.personas.filter(function(p) { return p._selected; }).length === 0) {
        return { valid: false, message: 'Please select at least one persona to continue.' };
      }
    }
    if (n === 3) {
      if (ws.messages.filter(function(m) { return m._selected; }).length === 0) {
        return { valid: false, message: 'Please select at least one message to continue.' };
      }
    }
    if (n === 4) {
      var noStyle  = ws.styles.filter(function(s) { return s._selected; }).length === 0;
      var noFormat = ws.formats.filter(function(f) { return f._selected; }).length === 0;
      if (noStyle || noFormat) {
        return { valid: false, message: 'Please select at least one style and one format to continue.' };
      }
    }
    if (n === 5) {
      var ideas = (ws.campaign_ideas || []).filter(function(c) { return c._selected; });
      if (ideas.length === 0) {
        return { valid: false, message: 'Please select at least one campaign idea to continue.' };
      }
      for (var i = 0; i < ideas.length; i++) {
        if (!(ideas[i].name && ideas[i].name.trim())) {
          return { valid: false, message: 'Each selected campaign idea needs a name.' };
        }
      }
    }
    return { valid: true };
  }

  // --- Show inline validation message ---
  function _showSWValidation(message) {
    $('.cp-sw-validation').remove();
    var $msg = $('<div class="cp-sw-validation">' + icon('warning') + ' <span>' + esc(message) + '</span></div>');
    $('.cp-sw-footer').prepend($msg);
    setTimeout(function() { $msg.fadeOut(300, function() { $msg.remove(); }); }, 4000);
  }

  // --- Cancel any pending auto-advance timer ---
  function _swClearAutoAdvance() {
    if (setupWizardState._autoAdvanceTimer) {
      clearTimeout(setupWizardState._autoAdvanceTimer);
      setupWizardState._autoAdvanceTimer = null;
      setupWizardState._autoAdvanceUntil = 0;
    }
  }

  // --- Schedule auto-advance in Full Auto mode (called after AI completes) ---
  function _swScheduleAutoAdvance() {
    if (setupWizardState.mode !== 'auto') return;
    if (setupWizardState.paused) return;
    if (setupWizardState.aiError) return;
    if (setupWizardState.step >= SW_STAGE_COUNT) return;
    _swClearAutoAdvance();
    setupWizardState._autoAdvanceUntil = Date.now() + SW_AUTO_ADVANCE_MS;
    setupWizardState._autoAdvanceTimer = setTimeout(function() {
      setupWizardState._autoAdvanceTimer = null;
      // Validate current stage before auto-advancing; on failure, fall back to manual.
      var v = validateSWStep(setupWizardState.step);
      if (!v.valid) {
        setupWizardState.paused = true;
        refreshSetupWizard();
        return;
      }
      if (setupWizardState.step < SW_STAGE_COUNT) {
        setupWizardState.step++;
        refreshSetupWizard();
        _swAutoTriggerAI(setupWizardState.step);
      }
    }, SW_AUTO_ADVANCE_MS);
    // Refresh footer to show the auto-advance bar
    $('#cpSetupWizard .cp-sw-footer').html(_buildSWFooter());
  }

  // --- Mode picker (Stage 1) ---
  function swStartMode(mode) {
    swCollectFields();
    var v = validateSWStep(1);
    if (!v.valid) { _showSWValidation(v.message); return; }
    setupWizardState.mode = mode === 'auto' ? 'auto' : 'manual';
    setupWizardState.paused = false;
    // Persist AI picker selection so resolveSelection() picks it up downstream
    var p2b = window._cpPart2B;
    if (p2b && p2b.LLMService && setupWizardState.aiConfig.provider && setupWizardState.aiConfig.model) {
      p2b.LLMService.savePreference('sw-ai-config', setupWizardState.aiConfig.provider, setupWizardState.aiConfig.model);
    }
    setupWizardState.step = 2;
    refreshSetupWizard();
    _swAutoTriggerAI(2);
  }

  // --- Pause / resume Full Auto run ---
  function swPauseAutoRun() {
    _swClearAutoAdvance();
    setupWizardState.paused = true;
    refreshSetupWizard();
  }
  function swResumeAutoRun() {
    setupWizardState.paused = false;
    refreshSetupWizard();
    // If the current stage already has its generation done, resume the chain.
    var st = SW_STAGES[setupWizardState.step - 1];
    if (st && st.genKey) {
      if (setupWizardState.stepGenerated[st.genKey]) {
        _swScheduleAutoAdvance();
      } else if (!setupWizardState.aiLoading) {
        _swAutoTriggerAI(setupWizardState.step);
      }
    }
  }

  // --- Navigation ---
  function swGoNext() {
    swCollectFields();
    var n = setupWizardState.step;
    var v = validateSWStep(n);
    if (!v.valid) { _showSWValidation(v.message); return; }
    _swClearAutoAdvance();
    setupWizardState.paused = false;
    if (n < SW_STAGE_COUNT) {
      setupWizardState.step = n + 1;
      refreshSetupWizard();
      _swAutoTriggerAI(setupWizardState.step);
    }
  }

  function swGoBack() {
    swCollectFields();
    _swClearAutoAdvance();
    setupWizardState.paused = true;  // pause auto when going back manually
    if (setupWizardState.step > 1) {
      setupWizardState.step--;
      refreshSetupWizard();
    }
  }

  function swSkipStep() {
    var n = setupWizardState.step;
    _swClearAutoAdvance();
    setupWizardState.stepSkipped[n] = true;
    if (n < SW_STAGE_COUNT) {
      setupWizardState.step = n + 1;
      refreshSetupWizard();
      _swAutoTriggerAI(setupWizardState.step);
    }
  }

  function swGotoStep(n) {
    // Only allow navigating to already-completed stages
    if (n < setupWizardState.step) {
      swCollectFields();
      _swClearAutoAdvance();
      setupWizardState.paused = true;
      setupWizardState.step = n;
      refreshSetupWizard();
    }
  }

  // --- Auto-trigger AI for stages that support it ---
  function _swAutoTriggerAI(n) {
    var R    = window._cpRenderers || {};
    var p2b  = window._cpPart2B;
    var cfg  = setupWizardState.aiConfig;
    var LLM  = p2b && p2b.LLMService;

    if (cfg.provider && cfg.model && LLM) {
      LLM.savePreference('sw-ai-config', cfg.provider, cfg.model);
    }

    if (n >= 2 && n <= 5 && LLM && !LLM.isConfigured()) {
      setupWizardState.aiError = 'AI not configured. Go back to Stage 1 to pick a provider, or set one up in Settings → AI.';
      refreshSetupWizard();
      return;
    }

    if (n === 2) {
      // Stage 2 = personas + pain points. Generate personas first; pain points
      // are auto-triggered once personas land (handled by the generator's
      // success callback via _swAfterPersonasGenerated()).
      if (!setupWizardState.stepGenerated.personas && typeof R.swAIGeneratePersonas === 'function') {
        R.swAIGeneratePersonas();
      } else if (setupWizardState.stepGenerated.personas && !setupWizardState.stepGenerated.painpoints && typeof R.swAIGeneratePainPoints === 'function') {
        R.swAIGeneratePainPoints();
      } else if (setupWizardState.stepGenerated.personas && setupWizardState.stepGenerated.painpoints) {
        // Both done — schedule auto-advance if in auto mode
        _swScheduleAutoAdvance();
      }
      return;
    }
    if (n === 3 && !setupWizardState.stepGenerated.messages && typeof R.swAIGenerateMessages === 'function') {
      R.swAIGenerateMessages(); return;
    }
    if (n === 4 && !setupWizardState.stepGenerated.stylesFormats && typeof R.swAIGenerateStylesFormats === 'function') {
      R.swAIGenerateStylesFormats(); return;
    }
    if (n === 5 && !setupWizardState.stepGenerated.campaignIdeas && typeof R.swAIGenerateCampaignIdeas === 'function') {
      R.swAIGenerateCampaignIdeas(); return;
    }
    // Already generated — if in auto mode, advance
    if (n >= 2 && n <= 5) _swScheduleAutoAdvance();
  }

  // Called by the personas generator after a successful run. In Full Auto
  // mode this chains immediately into pain points. In Manual mode the user
  // sees the personas and may edit them before the wizard fires pain points.
  function _swAfterPersonasGenerated() {
    if (setupWizardState.step !== 2) return;
    if (setupWizardState.mode === 'auto' && !setupWizardState.paused) {
      var R = window._cpRenderers || {};
      if (typeof R.swAIGeneratePainPoints === 'function') {
        R.swAIGeneratePainPoints();
      }
    }
  }

  // Called by the pain-points generator after a successful run within Stage 2.
  function _swAfterPainPointsGenerated() {
    if (setupWizardState.step !== 2) return;
    if (setupWizardState.mode === 'auto' && !setupWizardState.paused) {
      _swScheduleAutoAdvance();
    }
  }

  // Called by stages 3-5's generators after success — picks up auto-advance.
  function _swAfterStageGenerated() {
    if (setupWizardState.mode === 'auto' && !setupWizardState.paused) {
      _swScheduleAutoAdvance();
    }
  }

  // --- Cancel any in-flight wizard AI generation ---
  function swCancelAIGeneration() {
    var state = setupWizardState;
    var aid   = state.aiActionId || 'sw-ai-config';
    if (window._cpPart2B && window._cpPart2B.LLMService && typeof window._cpPart2B.LLMService.abortAction === 'function') {
      window._cpPart2B.LLMService.abortAction(aid);
    }
    state.aiLoading = false;
    state.aiActionId = '';
    state.aiError = 'Generation cancelled.';
    _swClearAutoAdvance();
    state.paused = true;
    refreshSetupWizard();
  }

  // --- Retry a stage's AI generation ---
  function swRetryStep(n) {
    // n is the stage number; clear the relevant generation flag(s)
    if (n === 2) {
      setupWizardState.stepGenerated.personas = false;
      setupWizardState.stepGenerated.painpoints = false;
    } else if (n === 3) {
      setupWizardState.stepGenerated.messages = false;
    } else if (n === 4) {
      setupWizardState.stepGenerated.stylesFormats = false;
    } else if (n === 5) {
      setupWizardState.stepGenerated.campaignIdeas = false;
    }
    setupWizardState.aiError = '';
    refreshSetupWizard();
    _swAutoTriggerAI(n);
  }

  // --- Format relative time for "Last generated" badges ---
  function _swRelTime(ts) {
    if (!ts) return '';
    var diff = Date.now() - ts;
    if (diff < 5000)      return 'just now';
    if (diff < 60000)     return Math.round(diff / 1000) + 's ago';
    if (diff < 3600000)   return Math.round(diff / 60000) + 'm ago';
    if (diff < 86400000)  return Math.round(diff / 3600000) + 'h ago';
    return new Date(ts).toLocaleString();
  }

  // Initialize singleton with fresh state shape so anything reading it before
  // openSetupWizard runs gets a sensible object (rather than `{}`).
  _swReplaceState(_swFreshState());


/* ===== src/20-part2a/12-setup-wizard-steps-1-2.js ===== */
  // ------------------------------------------------------------------
  // SECTION 9.4a: SETUP WIZARD — STAGE 1 (Brand + AI + Mode picker)
  // ------------------------------------------------------------------
  //
  // Stage 1 is the single combined "Setup" stage:
  //   - Brand context summary (read-only, pulled from .brand-data DOM)
  //   - Workspace name + product + objective (editable)
  //   - Custom AI instructions
  //   - AI provider + model picker
  //   - Two Start buttons: Full Auto vs Stage-by-Stage (Manual)
  //
  // Picking a mode validates the form, persists the AI selection, and jumps
  // straight to Stage 2 (Personas & Pain Points) — kicking off the chain.

  function renderSWStep1() {
    var ws    = setupWizardState.workspace;
    var bc    = setupWizardState.brandContext || {};
    var cfg   = setupWizardState.aiConfig;
    var p2b   = window._cpPart2B;
    var aiOk  = p2b && p2b.LLMService && p2b.LLMService.isConfigured();
    var brandOn = S && S.brand && S.brand.configured;

    var objMap = Constants.META_OBJECTIVES || {};
    var objectives = Object.keys(objMap).map(function(k) { return { id: k, name: objMap[k].label || k }; });

    var html = _buildSWStepHeader(
      'Brand Context & AI Setup',
      'We\'ll use your brand data plus the instructions below to generate every stage. Choose a mode at the bottom to start.',
      'a'
    );

    html += '<div class="cp-sw-form">';

    // ---- Brand context summary card ----
    html += '<section class="cp-sw-brand-card' + (brandOn ? '' : ' cp-sw-brand-card--empty') + '">';
    html += '<header class="cp-sw-brand-card-header">';
    html += '<span class="cp-sw-brand-card-icon">' + icon(brandOn ? 'link' : 'info') + '</span>';
    html += '<div>';
    html += '<div class="cp-sw-brand-card-title">' + (brandOn ? esc(bc.name || 'Connected brand') : 'No brand profile connected') + '</div>';
    html += '<div class="cp-sw-brand-card-sub">' + (brandOn
      ? 'Your brand context will be injected into every AI prompt automatically.'
      : 'AI will use only the information you enter below.') + '</div>';
    html += '</div></header>';
    if (brandOn) {
      html += '<dl class="cp-sw-brand-card-grid">';
      if (bc.tagline)   html += '<dt>Tagline</dt><dd>' + esc(bc.tagline) + '</dd>';
      if (bc.voice)     html += '<dt>Brand voice</dt><dd>' + esc(truncate(bc.voice, 180)) + '</dd>';
      if (bc.audience)  html += '<dt>Audience</dt><dd>' + esc(truncate(bc.audience, 180)) + '</dd>';
      if (bc.pillars)   html += '<dt>Content pillars</dt><dd>' + esc(truncate(bc.pillars, 180)) + '</dd>';
      if (bc.dos)       html += '<dt>Do</dt><dd>' + esc(truncate(bc.dos, 180)) + '</dd>';
      if (bc.donts)     html += '<dt>Don\'t</dt><dd>' + esc(truncate(bc.donts, 180)) + '</dd>';
      if (bc.forbidden) html += '<dt>Forbidden</dt><dd>' + esc(truncate(bc.forbidden, 140)) + '</dd>';
      if (bc.cta)       html += '<dt>CTA style</dt><dd>' + esc(truncate(bc.cta, 140)) + '</dd>';
      html += '</dl>';
    }
    html += '</section>';

    // ---- Workspace basics ----
    html += '<section class="cp-sw-section">';
    html += '<h3 class="cp-sw-section-title">Workspace basics</h3>';

    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Workspace name <span class="cp-required">*</span></label>';
    html += '<input type="text" class="cp-input" data-sw-field="workspace.name"';
    html += ' placeholder="e.g., Brand Q2 2026 Campaigns" value="' + esc(ws.name || '') + '" autocomplete="off">';
    html += '</div>';

    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Product / Service <span class="cp-required">*</span></label>';
    html += '<input type="text" class="cp-input" data-sw-field="workspace.product_name"';
    html += ' placeholder="What are you advertising?" value="' + esc(ws.product_name || '') + '" autocomplete="off">';
    html += '</div>';

    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Primary campaign objective</label>';
    html += '<select class="cp-select" data-sw-field="workspace.objective">';
    html += '<option value="">Select objective...</option>';
    for (var i = 0; i < objectives.length; i++) {
      var obj = objectives[i];
      html += '<option value="' + esc(obj.id) + '"' + (ws.objective === obj.id ? ' selected' : '') + '>' + esc(obj.name) + '</option>';
    }
    html += '</select>';
    html += '</div>';

    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Custom AI instructions</label>';
    html += '<textarea class="cp-textarea" data-sw-field="workspace.custom_instructions" rows="3"';
    html += ' placeholder="Optional: tone, things to avoid, mandatory phrases, angle preferences...">' + esc(ws.custom_instructions || '') + '</textarea>';
    html += '<p class="cp-field-hint">These instructions are added on top of your brand context for every AI run in the wizard.</p>';
    html += '</div>';
    html += '</section>';

    // ---- AI provider + model picker ----
    html += '<section class="cp-sw-section">';
    html += '<h3 class="cp-sw-section-title">AI provider</h3>';
    if (!aiOk) {
      html += '<div class="cp-sw-info-box cp-sw-info-box--warn">';
      html += icon('triangle-alert') + ' <div><strong>No AI providers configured.</strong> ';
      html += 'Set up API keys in Settings → AI, then return here. You can still complete the wizard manually after configuring providers.</div>';
      html += '</div>';
    } else {
      html += '<div class="cp-field">';
      html += '<label class="cp-field-label">Provider &amp; model <span class="cp-required">*</span></label>';
      html += '<div class="cp-sw-ai-picker-wrap" id="swAiPickerWrap">';
      // _cpAiSel is defined inside Part 2A's init-imports IIFE; the wizard can
      // auto-launch before Part 2B (and the full picker hookup) is ready, so
      // emit a placeholder that _cpReplaceAiPickers() rehydrates on Part 2B init.
      if (typeof window._cpAiSel === 'function') {
        html += window._cpAiSel('sw-ai-config');
      } else {
        html += '<span class="cp-ai-picker-loading" data-pending-action="sw-ai-config">' + icon('spinner') + ' Loading AI options…</span>';
      }
      html += '</div>';
      html += '<p class="cp-field-hint">This selection is used for every AI run during setup.</p>';
      html += '</div>';

      html += '<div class="cp-sw-ai-test-row">';
      html += '<button class="cp-btn cp-btn-secondary" data-action="sw-test-ai" id="swTestAiBtn">' + icon('zap') + ' Test connection</button>';
      html += '<span class="cp-sw-ai-test-status" id="swAiTestStatus">';
      if (cfg.tested === true) {
        html += '<span class="cp-sw-test-ok">' + icon('circle-check') + ' Connection verified</span>';
      } else if (cfg.tested === 'fail') {
        html += '<span class="cp-sw-test-fail">' + icon('circle-x') + ' Test failed — check your API key</span>';
      } else {
        html += '<span class="cp-sw-test-idle">Not tested yet — you can still continue</span>';
      }
      html += '</span>';
      html += '</div>';
    }
    html += '</section>';

    // ---- Mode picker (two big Start buttons) ----
    html += '<section class="cp-sw-section cp-sw-section--start">';
    html += '<h3 class="cp-sw-section-title">How should the AI run?</h3>';
    if (!aiOk) {
      html += '<div class="cp-sw-info-box">';
      html += icon('info') + ' Configure at least one AI provider in <strong>Settings → AI</strong>, then come back to pick a mode. Use the close button (top-right) to set that up now.';
      html += '</div>';
    } else {
      html += '<div class="cp-sw-mode-row">';

      html += '<button class="cp-sw-mode-card cp-sw-mode-card--manual" data-action="sw-start-manual">';
      html += '<div class="cp-sw-mode-card-icon">' + icon('hand') + '</div>';
      html += '<div class="cp-sw-mode-card-title">Stage-by-stage <span class="cp-sw-mode-card-tag">Recommended</span></div>';
      html += '<div class="cp-sw-mode-card-body">AI generates each stage automatically, then waits for you to review and approve before moving on. Edit anything between stages.</div>';
      html += '<div class="cp-sw-mode-card-cta">' + icon('arrow-right') + ' Start with my approval at each stage</div>';
      html += '</button>';

      html += '<button class="cp-sw-mode-card cp-sw-mode-card--auto" data-action="sw-start-auto">';
      html += '<div class="cp-sw-mode-card-icon">' + icon('zap') + '</div>';
      html += '<div class="cp-sw-mode-card-title">Full Auto</div>';
      html += '<div class="cp-sw-mode-card-body">AI runs every stage end-to-end without pausing. You can hit Pause at any point to step in and edit.</div>';
      html += '<div class="cp-sw-mode-card-cta">' + icon('arrow-right') + ' Run everything automatically</div>';
      html += '</button>';

      html += '</div>';
      html += '<p class="cp-sw-mode-hint">' + icon('info') + ' You can always switch by hitting Pause / Continue manually during the run.</p>';
    }
    html += '</section>';

    html += '</div>'; // .cp-sw-form
    return html;
  }

  // Inline AI connection test for Stage 1
  function _swTestAIConnection() {
    var p2b = window._cpPart2B;
    if (!p2b || !p2b.LLMService || !p2b.LLMService.isConfigured()) {
      toast('No AI provider configured — check Settings → AI.', 'warning');
      return;
    }
    var $btn    = $('#swTestAiBtn');
    var $status = $('#swAiTestStatus');
    $btn.prop('disabled', true).html(icon('spinner') + ' Testing...');
    $status.html('<span class="cp-sw-test-idle">Sending test request...</span>');

    // Capture current picker selection into state before testing
    var $prov = $('.cp-ai-provider-select[data-action-id="sw-ai-config"]');
    var $mod  = $('.cp-ai-model-select[data-action-id="sw-ai-config"]');
    if ($prov.length) setupWizardState.aiConfig.provider = $prov.val();
    if ($mod.length)  setupWizardState.aiConfig.model    = $mod.val();

    p2b.callAIWithRetry(
      'Reply with exactly one word: OK',
      function() {
        $btn.prop('disabled', false).html(icon('zap') + ' Test connection');
        setupWizardState.aiConfig.tested = true;
        $status.html('<span class="cp-sw-test-ok">' + icon('circle-check') + ' Connection verified</span>');
      },
      function(err) {
        $btn.prop('disabled', false).html(icon('zap') + ' Test connection');
        setupWizardState.aiConfig.tested = 'fail';
        $status.html('<span class="cp-sw-test-fail">' + icon('circle-x') + ' Test failed — ' + esc(String(err).substring(0, 80)) + '</span>');
      },
      'sw-ai-config'
    );
  }


/* ===== src/20-part2a/13-setup-wizard-steps-3-4.js ===== */
  // ------------------------------------------------------------------
  // SECTION 9.4b: SETUP WIZARD — STAGE 2 (Personas & Pain Points, merged)
  // ------------------------------------------------------------------
  //
  // Single screen that owns both persona and pain-point generation. AI fires
  // personas first; once landed (and at least one is selected) AI generates
  // pain points keyed back to those personas.

  // --- Shared helpers ---

  function _buildSWSkeletonCards(count) {
    var html = '<div class="cp-sw-ai-loading" style="margin-top:var(--cp-space-4)">';
    for (var i = 0; i < count; i++) {
      html += '<div class="cp-sw-skeleton-card">';
      html += '<div class="cp-sw-skeleton-line cp-sw-skeleton-line--title"></div>';
      html += '<div class="cp-sw-skeleton-line"></div>';
      html += '<div class="cp-sw-skeleton-line"></div>';
      html += '<div class="cp-sw-skeleton-line cp-sw-skeleton-line--short"></div>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function _swDetailCell(label, value) {
    return '<div>'
      + '<div class="cp-sw-sel-card-detail-label">' + esc(label) + '</div>'
      + '<div class="cp-sw-sel-card-detail-value">' + esc(value) + '</div>'
      + '</div>';
  }

  // --- Inline diagnostics helpers (shared across Stages 2-5) ---

  function _swAIErrorBanner(stageNum) {
    var err = setupWizardState.aiError;
    if (!err) return '';
    var html = '<div class="cp-sw-ai-error" role="alert">';
    html += '<div class="cp-sw-ai-error-icon">' + icon('triangle-alert') + '</div>';
    html += '<div class="cp-sw-ai-error-body">';
    html += '<div class="cp-sw-ai-error-title">AI generation failed</div>';
    html += '<div class="cp-sw-ai-error-msg">' + esc(String(err)) + '</div>';
    html += '</div>';
    html += '<div class="cp-sw-ai-error-actions">';
    html += '<button class="cp-btn cp-btn-sm cp-btn-outline" data-action="sw-ai-retry-step" data-step="' + stageNum + '">' + icon('rotate') + ' Retry</button>';
    html += '<button class="cp-btn cp-btn-sm cp-btn-ghost" data-action="sw-ai-error-dismiss">' + icon('x') + ' Dismiss</button>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  function _swAIEmptyAfterGenBanner(label, contextStr) {
    var html = '<div class="cp-sw-ai-empty" role="status">';
    html += '<div class="cp-sw-ai-empty-icon">' + icon('search') + '</div>';
    html += '<div class="cp-sw-ai-empty-title">AI returned no ' + esc(label) + '</div>';
    html += '<div class="cp-sw-ai-empty-msg">';
    if (contextStr) html += 'Context used: <em>' + esc(contextStr) + '</em>. ';
    html += 'Try adjusting the instructions above and click Regenerate.';
    html += '</div>';
    html += '</div>';
    return html;
  }

  function _swLastGeneratedLabel(genKey) {
    var ts = setupWizardState.created && setupWizardState.created.lastGeneratedAt && setupWizardState.created.lastGeneratedAt[genKey];
    if (!ts) return '';
    return '<div class="cp-sw-last-gen">' + icon('clock') + ' Last generated ' + esc(_swRelTime(ts)) + '</div>';
  }

  function _swGenButton(action, generated, aiLoading) {
    if (aiLoading) {
      return '<button class="cp-btn cp-btn-outline" data-action="sw-ai-cancel">' + icon('x') + ' Cancel</button>';
    }
    return '<button class="cp-btn cp-btn-ai" data-action="' + action + '">'
      + icon('sparkles') + ' ' + (generated ? 'Regenerate' : 'Generate with AI')
      + '</button>';
  }

  // --- Stage 2: Personas + Pain Points (merged) ---

  function renderSWStep2() {
    var ws = setupWizardState;

    var html = _buildSWStepHeader(
      'Personas & Pain Points',
      'AI generates target personas first, then specific pain points for each. Select what represents your real customers — you can edit any of it.',
      'b'
    );

    html += _swAIErrorBanner(2);
    html += _renderSWPersonasBlock();

    // Pain points block only appears once at least one persona is selected.
    var selPersonas = (ws.personas || []).filter(function(p) { return p._selected; });
    if (selPersonas.length) {
      html += '<div class="cp-sw-section-divider"><span class="cp-sw-section-divider-title">Pain points</span><span class="cp-sw-section-divider-line"></span></div>';
      html += _renderSWPainPointsBlock(selPersonas);
    } else if (ws.personas && ws.personas.length) {
      html += '<div class="cp-sw-info-box" style="margin-top:var(--cp-space-4)">';
      html += icon('info') + ' Select at least one persona above to unlock pain-point generation.';
      html += '</div>';
    }

    return html;
  }

  function _renderSWPersonasBlock() {
    var ws       = setupWizardState;
    var personas = ws.personas || [];
    var generated = ws.stepGenerated.personas;

    var html = '<div class="cp-sw-substage">';
    html += '<div class="cp-sw-substage-header">';
    html += '<h3 class="cp-sw-substage-title">' + icon('users') + ' Personas</h3>';
    html += '</div>';

    html += '<div class="cp-sw-gen-bar">';
    html += '<textarea class="cp-textarea" id="swPersonaContext" rows="2"';
    html += ' placeholder="Optional: additional persona direction (e.g., focus on enterprise buyers, include a tech-savvy segment)...">';
    html += esc(ws._personaContext || '');
    html += '</textarea>';
    html += _swGenButton('sw-ai-gen-personas', generated, ws.aiLoading && !ws.stepGenerated.personas);
    html += '</div>';

    if (ws.aiLoading && !ws.stepGenerated.personas) {
      html += _buildSWSkeletonCards(4);
    } else if (generated && !personas.length) {
      html += _swAIEmptyAfterGenBanner('personas', ws._personaContext || '');
    } else if (!personas.length) {
      html += '<div class="cp-sw-empty-state">';
      html += '<div class="cp-sw-empty-icon">' + icon('users') + '</div>';
      html += '<p>Click <strong>Generate with AI</strong> to create persona suggestions based on your product and target audience.</p>';
      html += '</div>';
    } else {
      var selCount = personas.filter(function(p) { return p._selected; }).length;
      html += '<div class="cp-sw-card-bottom">';
      html += '<span class="cp-sw-sel-count' + (selCount > 0 ? ' cp-sw-sel-count--ok' : '') + '">';
      html += selCount + ' of ' + personas.length + ' persona' + (personas.length !== 1 ? 's' : '') + ' selected';
      html += '</span>';
      html += _swLastGeneratedLabel('personas');
      html += '</div>';
      html += '<div class="cp-sw-card-grid">';
      for (var i = 0; i < personas.length; i++) {
        html += _buildSWPersonaCard(personas[i], i);
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function _renderSWPainPointsBlock(selPersonas) {
    var ws        = setupWizardState;
    var pps       = ws.pain_points || [];
    var generated = ws.stepGenerated.painpoints;
    var personasGen = ws.stepGenerated.personas;

    var html = '<div class="cp-sw-substage">';
    html += '<div class="cp-sw-substage-header">';
    html += '<h3 class="cp-sw-substage-title">' + icon('crosshair') + ' Pain points</h3>';
    html += '</div>';

    html += '<div class="cp-sw-gen-bar">';
    html += '<textarea class="cp-textarea" id="swPainPointContext" rows="2"';
    html += ' placeholder="Optional: focus on specific challenges (e.g., emphasise time-management struggles)...">';
    html += esc(ws._ppContext || '');
    html += '</textarea>';
    html += _swGenButton('sw-ai-gen-painpoints', generated, ws.aiLoading && personasGen);
    html += '</div>';

    if (ws.aiLoading && personasGen && !generated) {
      html += _buildSWSkeletonCards(6);
    } else if (generated && !pps.length) {
      html += _swAIEmptyAfterGenBanner('pain points', ws._ppContext || '');
    } else if (!pps.length) {
      html += '<div class="cp-sw-empty-state">';
      html += '<div class="cp-sw-empty-icon">' + icon('crosshair') + '</div>';
      html += '<p>Click <strong>Generate with AI</strong> to create pain-point suggestions based on your selected personas.</p>';
      html += '</div>';
    } else {
      if (selPersonas.length > 1) {
        var activeTab = ws._ppActiveTab || 0;
        html += '<div class="cp-sw-pp-tabs">';
        for (var pi = 0; pi < selPersonas.length; pi++) {
          var personaRealIdx = (ws.personas || []).indexOf(selPersonas[pi]);
          var tabPPCount = pps.filter(function(pp) { return pp._persona_idx === personaRealIdx && pp._selected; }).length;
          html += '<button class="cp-sw-pp-tab' + (activeTab === pi ? ' cp-sw-pp-tab--active' : '') + '" data-action="sw-pp-tab" data-tab="' + pi + '">';
          html += esc(truncate(selPersonas[pi].name || 'Persona', 22));
          if (tabPPCount) html += ' <span class="cp-sw-pp-tab-badge">' + tabPPCount + '</span>';
          html += '</button>';
        }
        html += '</div>';
      }

      var visiblePPs;
      if (selPersonas.length > 1) {
        var activePersona = selPersonas[ws._ppActiveTab || 0];
        var filterIdx = (ws.personas || []).indexOf(activePersona);
        visiblePPs = pps.map(function(pp, i) { return { pp: pp, i: i }; })
                        .filter(function(o) { return o.pp._persona_idx === filterIdx; });
      } else {
        visiblePPs = pps.map(function(pp, i) { return { pp: pp, i: i }; });
      }

      var totalSel = pps.filter(function(pp) { return pp._selected; }).length;
      html += '<div class="cp-sw-card-bottom">';
      html += '<span class="cp-sw-sel-count' + (totalSel > 0 ? ' cp-sw-sel-count--ok' : '') + '">';
      html += totalSel + ' of ' + pps.length + ' pain point' + (pps.length !== 1 ? 's' : '') + ' selected';
      html += '</span>';
      html += _swLastGeneratedLabel('painpoints');
      html += '</div>';

      html += '<div class="cp-sw-card-grid">';
      for (var j = 0; j < visiblePPs.length; j++) {
        html += _buildSWPainPointCard(visiblePPs[j].pp, visiblePPs[j].i);
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function _buildSWPersonaCard(p, idx) {
    var selected = p._selected;
    var expanded = setupWizardState._expandedCards['p_' + idx];
    var demo  = p.demographics  || {};
    var psych = p.psychographics || {};

    var tags = [];
    if (demo.age_range)  tags.push(demo.age_range);
    if (demo.gender && demo.gender !== 'All') tags.push(demo.gender);
    if (demo.location)   tags.push(demo.location);
    if (demo.occupation) tags.push(demo.occupation);

    var html = '<div class="cp-sw-sel-card' + (selected ? ' cp-sw-sel-card--selected' : '') + '" data-idx="' + idx + '" data-card-type="persona" role="button" tabindex="0" aria-pressed="' + (selected ? 'true' : 'false') + '">';
    html += '<div class="cp-sw-sel-card-check">' + (selected ? icon('check') : '') + '</div>';
    html += '<div class="cp-sw-sel-card-title">' + esc(p.name || ('Persona ' + (idx + 1))) + '</div>';
    if (p.description) {
      html += '<div class="cp-sw-sel-card-body">' + esc(truncate(p.description, 130)) + '</div>';
    }
    if (tags.length) {
      html += '<div class="cp-sw-sel-card-tags">';
      for (var t = 0; t < tags.length; t++) {
        html += '<span class="cp-sw-sel-card-tag">' + esc(tags[t]) + '</span>';
      }
      html += '</div>';
    }
    if (psych.desires || psych.fears) {
      html += '<div class="cp-sw-sel-card-psych">';
      if (psych.desires) {
        html += '<div class="cp-sw-sel-card-psych-row cp-sw-sel-card-psych-row--desire">';
        html += '<span class="cp-sw-sel-card-psych-label">' + icon('heart') + ' Wants</span>';
        html += '<span class="cp-sw-sel-card-psych-value">' + esc(truncate(psych.desires, 90)) + '</span>';
        html += '</div>';
      }
      if (psych.fears) {
        html += '<div class="cp-sw-sel-card-psych-row cp-sw-sel-card-psych-row--fear">';
        html += '<span class="cp-sw-sel-card-psych-label">' + icon('shield') + ' Fears</span>';
        html += '<span class="cp-sw-sel-card-psych-value">' + esc(truncate(psych.fears, 90)) + '</span>';
        html += '</div>';
      }
      html += '</div>';
    }
    html += '<button class="cp-sw-sel-card-expand" data-action="sw-card-expand" data-key="p_' + idx + '">';
    html += icon(expanded ? 'chevron-up' : 'chevron-down') + ' ' + (expanded ? 'Less' : 'More details');
    html += '</button>';

    if (expanded) {
      html += '<div class="cp-sw-sel-card-expanded-body">';
      html += '<div class="cp-sw-sel-card-detail-grid">';
      if (demo.income_level) html += _swDetailCell('Income',     demo.income_level);
      if (demo.education)    html += _swDetailCell('Education',  demo.education);
      if (demo.industry)     html += _swDetailCell('Industry',   demo.industry);
      if (psych.motivations) html += _swDetailCell('Motivations',psych.motivations);
      if (psych.values)      html += _swDetailCell('Values',     psych.values);
      html += '</div>';
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  function _buildSWPainPointCard(pp, idx) {
    var selected = pp._selected;

    var html = '<div class="cp-sw-sel-card' + (selected ? ' cp-sw-sel-card--selected' : '') + '" data-idx="' + idx + '" data-card-type="painpoint" role="button" tabindex="0" aria-pressed="' + (selected ? 'true' : 'false') + '">';
    html += '<div class="cp-sw-sel-card-check">' + (selected ? icon('check') : '') + '</div>';
    html += '<div class="cp-sw-sel-card-title">' + esc(pp.pain_point || 'Pain Point') + '</div>';
    if (pp.solution) {
      html += '<div class="cp-sw-pp-solution">';
      html += '<span class="cp-sw-pp-solution-label">' + icon('lightbulb') + ' Solution</span>';
      html += '<span class="cp-sw-pp-solution-value">' + esc(truncate(pp.solution, 140)) + '</span>';
      html += '</div>';
    }
    if (pp.category) {
      var catSlug = String(pp.category).toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-+|-+$/g, '');
      html += '<div class="cp-sw-sel-card-tags"><span class="cp-sw-sel-card-tag cp-sw-sel-card-tag--cat cp-sw-sel-card-tag--cat-' + esc(catSlug) + '">' + esc(pp.category) + '</span></div>';
    }
    html += '</div>';
    return html;
  }


/* ===== src/20-part2a/14-setup-wizard-steps-5-6.js ===== */
  // ------------------------------------------------------------------
  // SECTION 9.4c: SETUP WIZARD — STAGE 3 (Messages) + STAGE 4 (Styles & Formats)
  // ------------------------------------------------------------------

  // --- Stage 3: Messages ---

  function renderSWStep3() {
    var ws       = setupWizardState;
    var messages = ws.messages || [];
    var generated = ws.stepGenerated.messages;

    var html = _buildSWStepHeader(
      'Ad Messages',
      'Select the message angles and hooks that will shape your ads. AI generates options based on your personas and pain points.',
      'b'
    );

    html += _swAIErrorBanner(3);

    html += '<div class="cp-sw-gen-bar">';
    html += '<textarea class="cp-textarea" id="swMessageContext" rows="2"';
    html += ' placeholder="Optional: focus on specific angles (e.g., emphasise ROI, use testimonial hooks)...">';
    html += esc(ws._messageContext || '');
    html += '</textarea>';
    html += _swGenButton('sw-ai-gen-messages', generated, ws.aiLoading);
    html += '</div>';

    if (ws.aiLoading) {
      html += _buildSWSkeletonCards(4);
    } else if (generated && !messages.length) {
      html += _swAIEmptyAfterGenBanner('messages', ws._messageContext || '');
    } else if (!messages.length) {
      html += '<div class="cp-sw-empty-state">';
      html += '<div class="cp-sw-empty-icon">' + icon('message-square') + '</div>';
      html += '<p>Click <strong>Generate with AI</strong> to create message angle suggestions based on your personas and pain points.</p>';
      html += '</div>';
    } else {
      var selCount = messages.filter(function(m) { return m._selected; }).length;
      html += '<div class="cp-sw-card-bottom">';
      html += '<span class="cp-sw-sel-count' + (selCount > 0 ? ' cp-sw-sel-count--ok' : '') + '">';
      html += selCount + ' of ' + messages.length + ' message' + (messages.length !== 1 ? 's' : '') + ' selected';
      html += '</span>';
      html += _swLastGeneratedLabel('messages');
      html += '</div>';
      html += '<div class="cp-sw-card-grid">';
      for (var i = 0; i < messages.length; i++) {
        html += _buildSWMessageCard(messages[i], i);
      }
      html += '</div>';
    }

    return html;
  }

  function _buildSWMessageCard(msg, idx) {
    var selected = msg._selected;
    var expanded = setupWizardState._expandedCards['m_' + idx];

    var stageLabel = { top: 'TOFU', mid: 'MOFU', bot: 'BOFU' }[msg.funnel_stage] || msg.funnel_stage || '';
    var funnelSlug = msg.funnel_stage ? ('--funnel-' + esc(msg.funnel_stage)) : '';

    var html = '<div class="cp-sw-sel-card' + (selected ? ' cp-sw-sel-card--selected' : '') + '" data-idx="' + idx + '" data-card-type="message" role="button" tabindex="0" aria-pressed="' + (selected ? 'true' : 'false') + '">';
    html += '<div class="cp-sw-sel-card-check">' + (selected ? icon('check') : '') + '</div>';
    html += '<div class="cp-sw-sel-card-title">' + esc(msg.name || ('Message ' + (idx + 1))) + '</div>';
    if (msg.description) {
      html += '<div class="cp-sw-sel-card-body">' + esc(truncate(msg.description, 100)) + '</div>';
    }
    if (msg.body) {
      html += '<blockquote class="cp-sw-msg-body">' + esc(truncate(msg.body, 160)) + '</blockquote>';
    }
    var tags = [];
    if (msg.theme)      tags.push({ label: msg.theme,     cls: 'cp-sw-sel-card-tag--theme' });
    if (msg.hook_type)  tags.push({ label: msg.hook_type, cls: 'cp-sw-sel-card-tag--hook' });
    if (stageLabel)     tags.push({ label: stageLabel,    cls: 'cp-sw-sel-card-tag--funnel cp-sw-sel-card-tag' + funnelSlug });
    if (tags.length) {
      html += '<div class="cp-sw-sel-card-tags">';
      for (var t = 0; t < tags.length; t++) {
        html += '<span class="cp-sw-sel-card-tag ' + esc(tags[t].cls) + '">' + esc(tags[t].label) + '</span>';
      }
      html += '</div>';
    }
    if (msg.body && msg.body.length > 160) {
      html += '<button class="cp-sw-sel-card-expand" data-action="sw-card-expand" data-key="m_' + idx + '">';
      html += icon(expanded ? 'chevron-up' : 'chevron-down') + ' ' + (expanded ? 'Hide full copy' : 'Show full copy');
      html += '</button>';
      if (expanded) {
        html += '<div class="cp-sw-sel-card-expanded-body">';
        html += '<div class="cp-sw-sel-card-detail-label">Full copy angle</div>';
        html += '<div class="cp-sw-sel-card-detail-value" style="white-space:pre-line">' + esc(msg.body) + '</div>';
        html += '</div>';
      }
    }
    html += '</div>';
    return html;
  }

  // --- Stage 4: Styles & Formats ---

  function renderSWStep4() {
    var ws       = setupWizardState;
    var styles   = ws.styles  || [];
    var formats  = ws.formats || [];
    var generated = ws.stepGenerated.stylesFormats;
    var bothEmpty = !styles.length && !formats.length;

    var html = _buildSWStepHeader(
      'Styles &amp; Formats',
      'Select the creative styles and ad formats that fit your brand. These define how your ads will look and where they\'ll run.',
      'b'
    );

    html += _swAIErrorBanner(4);

    html += '<div class="cp-sw-gen-bar">';
    html += '<textarea class="cp-textarea" id="swStyleFormatContext" rows="2"';
    html += ' placeholder="Optional: specify platforms, formats or style direction (e.g., focus on TikTok-native, minimalist aesthetic)...">';
    html += esc(ws._styleFormatContext || '');
    html += '</textarea>';
    html += _swGenButton('sw-ai-gen-styles-formats', generated, ws.aiLoading);
    html += '</div>';

    if (ws.aiLoading) {
      html += _buildSWSubSection('Styles', 0, 0);
      html += _buildSWSkeletonCards(3);
      html += _buildSWSubSection('Formats', 0, 0);
      html += _buildSWSkeletonCards(4);
    } else if (generated && bothEmpty) {
      html += _swAIEmptyAfterGenBanner('styles or formats', ws._styleFormatContext || '');
    } else if (bothEmpty && !generated) {
      html += '<div class="cp-sw-empty-state">';
      html += '<div class="cp-sw-empty-icon">' + icon('palette') + '</div>';
      html += '<p>Click <strong>Generate with AI</strong> to create creative style and ad format suggestions tailored to your product and objectives.</p>';
      html += '</div>';
    } else {
      var selStyles  = styles.filter(function(s) { return s._selected; }).length;
      var selFormats = formats.filter(function(f) { return f._selected; }).length;

      html += _buildSWSubSection('Styles', selStyles, styles.length);
      if (styles.length) {
        html += '<div class="cp-sw-card-grid">';
        for (var i = 0; i < styles.length; i++) html += _buildSWStyleCard(styles[i], i);
        html += '</div>';
      } else {
        html += '<div class="cp-sw-empty-state" style="padding:var(--cp-space-4) 0"><p>No styles generated — try regenerating above.</p></div>';
      }

      html += _buildSWSubSection('Formats', selFormats, formats.length);
      if (formats.length) {
        html += '<div class="cp-sw-card-grid">';
        for (var j = 0; j < formats.length; j++) html += _buildSWFormatCard(formats[j], j);
        html += '</div>';
      } else {
        html += '<div class="cp-sw-empty-state" style="padding:var(--cp-space-4) 0"><p>No formats generated — try regenerating above.</p></div>';
      }
    }

    return html;
  }

  function _buildSWSubSection(title, selCount, total) {
    var html = '<div class="cp-sw-section-divider">';
    html += '<span class="cp-sw-section-divider-title">' + esc(title) + '</span>';
    if (total > 0) {
      html += '<span class="cp-sw-section-divider-count">' + selCount + ' / ' + total + ' selected</span>';
    }
    html += '<span class="cp-sw-section-divider-line"></span>';
    html += '</div>';
    return html;
  }

  function _buildSWStyleCard(style, idx) {
    var selected = style._selected;
    var html = '<div class="cp-sw-sel-card' + (selected ? ' cp-sw-sel-card--selected' : '') + '" data-idx="' + idx + '" data-card-type="style" role="button" tabindex="0" aria-pressed="' + (selected ? 'true' : 'false') + '">';
    html += '<div class="cp-sw-sel-card-check">' + (selected ? icon('check') : '') + '</div>';
    html += '<div class="cp-sw-sel-card-title">' + esc(style.name || ('Style ' + (idx + 1))) + '</div>';
    if (style.description) {
      html += '<div class="cp-sw-sel-card-body">' + esc(truncate(style.description, 120)) + '</div>';
    }
    html += '</div>';
    return html;
  }

  function _buildSWFormatCard(format, idx) {
    var selected = format._selected;
    var html = '<div class="cp-sw-sel-card' + (selected ? ' cp-sw-sel-card--selected' : '') + '" data-idx="' + idx + '" data-card-type="format" role="button" tabindex="0" aria-pressed="' + (selected ? 'true' : 'false') + '">';
    html += '<div class="cp-sw-sel-card-check">' + (selected ? icon('check') : '') + '</div>';
    html += '<div class="cp-sw-sel-card-title">' + esc(format.name || ('Format ' + (idx + 1))) + '</div>';
    if (format.description) {
      html += '<div class="cp-sw-sel-card-body">' + esc(truncate(format.description, 100)) + '</div>';
    }
    if (format.category) {
      html += '<div class="cp-sw-sel-card-tags"><span class="cp-sw-sel-card-tag">' + esc(format.category) + '</span></div>';
    }
    html += '</div>';
    return html;
  }


/* ===== src/20-part2a/15-setup-wizard-steps-7-8.js ===== */
  // ------------------------------------------------------------------
  // SECTION 9.4d: SETUP WIZARD — STAGE 5 (Campaign Ideas) + STAGE 6 (Review)
  // ------------------------------------------------------------------
  //
  // Stage 5 is "Campaign Ideas" — a list of named campaign ideas the wizard
  // proposes. The user picks which to create. Each idea becomes a draft
  // campaign_v2 on launch. Ad Sets + Ads are built later from inside the
  // per-campaign workspace (the "Run AI setup" CTA there).
  //
  // Stage 6 is the final review and launch.

  // --- Stage 5: Campaign Ideas ---

  function renderSWStep5() {
    var ws        = setupWizardState;
    var generated = ws.stepGenerated.campaignIdeas;
    var aiLoading = ws.aiLoading;
    var ideas     = ws.campaign_ideas || [];

    var html = _buildSWStepHeader(
      'Campaign Ideas',
      'AI proposes a few campaign ideas based on your library. Pick which ones to start. Each becomes a draft Campaign you can build out (Ad Sets + Ads) from its workspace.',
      'c'
    );

    html += _swAIErrorBanner(5);

    html += '<div class="cp-sw-gen-bar">';
    html += '<textarea class="cp-textarea" id="swCampaignIdeasContext" rows="2"';
    html += ' placeholder="Optional: direction for the ideas (e.g. \'lean into the &quot;ship in days not weeks&quot; angle, mix lead-gen and brand campaigns, target enterprise + startup segments\')...">';
    html += esc(ws._campaignIdeasContext || '');
    html += '</textarea>';
    html += _swGenButton('sw-ai-gen-campaign-ideas', generated, aiLoading);
    html += '</div>';

    if (aiLoading) {
      html += _buildSWIdeasSkeleton();
      return html;
    }

    var selPersonas = (ws.personas || []).filter(function(p) { return p._selected; });
    var selMessages = (ws.messages || []).filter(function(m) { return m._selected; });

    if (!ideas.length) {
      if (generated) {
        html += _swAIEmptyAfterGenBanner('campaign ideas', ws._campaignIdeasContext || '');
      } else {
        html += '<div class="cp-sw-empty-state">';
        html += '<div class="cp-sw-empty-icon">' + icon('lightbulb') + '</div>';
        html += '<p>Click <strong>Generate with AI</strong> to draft 3-5 campaign ideas from your selected library. You can edit or remove any of them before launch.</p>';
        html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="sw-idea-add-manual" style="margin-top:var(--cp-space-3)">' + icon('plus') + ' Add manually</button>';
        html += '</div>';
      }
      return html;
    }

    var selCount = ideas.filter(function(c) { return c._selected; }).length;
    html += '<div class="cp-sw-card-bottom">';
    html += '<span class="cp-sw-sel-count' + (selCount > 0 ? ' cp-sw-sel-count--ok' : '') + '">';
    html += 'Will create ' + selCount + ' Campaign' + (selCount !== 1 ? 's' : '');
    html += '</span>';
    html += _swLastGeneratedLabel('campaignIdeas');
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="sw-idea-add-manual" style="margin-left:auto">' + icon('plus') + ' Add idea</button>';
    html += '</div>';

    html += '<div class="cp-sw-ideas">';
    for (var i = 0; i < ideas.length; i++) {
      html += _buildSWCampaignIdeaCard(ideas[i], i, selPersonas, selMessages);
    }
    html += '</div>';

    return html;
  }

  function _buildSWIdeasSkeleton() {
    var html = '<div class="cp-sw-tree-skeleton">';
    for (var i = 0; i < 3; i++) {
      html += '<div class="cp-sw-tree-set cp-sw-skeleton-card">';
      html += '<div class="cp-sw-skeleton-line cp-sw-skeleton-line--title"></div>';
      html += '<div class="cp-sw-skeleton-line"></div>';
      html += '<div class="cp-sw-skeleton-line cp-sw-skeleton-line--short"></div>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function _buildSWCampaignIdeaCard(idea, idx, selPersonas, selMessages) {
    var selected = idea._selected;
    var key = 'idea_' + idx;
    var expanded = setupWizardState._expandedCards[key];
    var C = Constants;
    var objLabel = (C.META_OBJECTIVES[idea.objective] || {}).label || idea.objective || '';
    var persona = (selPersonas || [])[idea.persona_idx] || null;

    var html = '<div class="cp-sw-tree-set' + (selected ? ' cp-sw-tree-set--selected' : '') + '">';

    html += '<div class="cp-sw-tree-set-header">';
    html += '<button class="cp-sw-tree-check' + (selected ? ' cp-sw-tree-check--on' : '') + '" data-action="sw-idea-toggle" data-idea-idx="' + idx + '" aria-label="Toggle Campaign idea">';
    html += selected ? icon('check') : '';
    html += '</button>';
    html += '<div class="cp-sw-tree-set-title" style="flex:1">';
    html += '<input type="text" class="cp-input cp-input-sm" data-sw-idea-field="name" data-idea-idx="' + idx + '" value="' + esc(idea.name || '') + '" placeholder="Campaign name">';
    html += '<div class="cp-sw-tree-set-meta">';
    if (objLabel) html += '<span class="cp-sw-tree-set-tag">' + icon('bullseye') + ' ' + esc(objLabel) + '</span>';
    if (persona)  html += '<span class="cp-sw-tree-set-tag">' + icon('user') + ' ' + esc(truncate(persona.name || '', 28)) + '</span>';
    html += '</div>';
    html += '</div>';
    html += '<button class="cp-sw-tree-expand" data-action="sw-tree-expand" data-key="' + key + '">';
    html += icon(expanded ? 'chevron-up' : 'chevron-down') + ' ' + (expanded ? 'Hide' : 'Details');
    html += '</button>';
    html += '<button class="cp-btn-icon cp-btn-icon-sm" data-action="sw-idea-delete" data-idea-idx="' + idx + '" title="Remove idea" style="margin-left:var(--cp-space-1)">' + icon('trash') + '</button>';
    html += '</div>';

    if (expanded) {
      html += '<div class="cp-sw-tree-set-brief">';

      html += '<div class="cp-sw-tree-brief-row">';
      html += '<span class="cp-sw-tree-brief-label">Objective</span>';
      html += '<select class="cp-select cp-select-sm" data-sw-idea-field="objective" data-idea-idx="' + idx + '">';
      for (var ok in C.META_OBJECTIVES) {
        html += '<option value="' + esc(ok) + '"' + (idea.objective === ok ? ' selected' : '') + '>' + esc(C.META_OBJECTIVES[ok].label) + '</option>';
      }
      html += '</select>';
      html += '</div>';

      html += '<div class="cp-sw-tree-brief-row">';
      html += '<span class="cp-sw-tree-brief-label">Target persona</span>';
      html += '<select class="cp-select cp-select-sm" data-sw-idea-field="persona_idx" data-idea-idx="' + idx + '">';
      html += '<option value="-1"' + (idea.persona_idx == null || idea.persona_idx < 0 ? ' selected' : '') + '>(no specific persona)</option>';
      for (var pi = 0; pi < selPersonas.length; pi++) {
        html += '<option value="' + pi + '"' + (idea.persona_idx === pi ? ' selected' : '') + '>' + esc(selPersonas[pi].name || ('Persona ' + (pi + 1))) + '</option>';
      }
      html += '</select>';
      html += '</div>';

      html += '<div class="cp-sw-tree-brief-row">';
      html += '<span class="cp-sw-tree-brief-label">Brief</span>';
      html += '<textarea class="cp-textarea" data-sw-idea-field="brief" data-idea-idx="' + idx + '" rows="2" placeholder="2-3 sentence direction for this campaign — context for the creative team and the per-campaign wizard.">';
      html += esc(idea.brief || '');
      html += '</textarea>';
      html += '</div>';

      if (selMessages && selMessages.length) {
        html += '<div class="cp-sw-tree-brief-row">';
        html += '<span class="cp-sw-tree-brief-label">Key messages</span>';
        html += '<div class="cp-sw-idea-chips">';
        var mil = idea.message_idx_list || [];
        for (var mi = 0; mi < selMessages.length; mi++) {
          var active = mil.indexOf(mi) !== -1;
          html += '<button type="button" class="cp-chip cp-chip-sm' + (active ? ' cp-chip-active' : '') + '" data-action="sw-idea-toggle-message" data-idea-idx="' + idx + '" data-msg-idx="' + mi + '">';
          html += esc(truncate(selMessages[mi].name || '', 28));
          html += '</button>';
        }
        html += '</div>';
        html += '</div>';
      }

      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  // --- Stage 6: Review & Launch ---

  function renderSWStep6() {
    var ws         = setupWizardState;
    var selPersonas = (ws.personas    || []).filter(function(p) { return p._selected; });
    var selPPs      = (ws.pain_points || []).filter(function(p) { return p._selected; });
    var selMessages = (ws.messages    || []).filter(function(m) { return m._selected; });
    var selStyles   = (ws.styles      || []).filter(function(s) { return s._selected; });
    var selFormats  = (ws.formats     || []).filter(function(f) { return f._selected; });
    var selIdeas    = (ws.campaign_ideas || []).filter(function(c) { return c._selected; });

    var html = _buildSWStepHeader(
      'Review &amp; Launch',
      'Final check before we create your library and campaign ideas. Everything below will be created on Launch.',
      'c'
    );

    if (ws.finalizing) {
      html += '<div class="cp-sw-finalize-progress">';
      html += '<div class="cp-sw-finalize-spinner">' + icon('loader') + '</div>';
      html += '<p class="cp-sw-finalize-msg">' + esc(ws.finalizeMsg || 'Setting up your workspace…') + '</p>';
      html += '</div>';
      return html;
    }

    html += '<div class="cp-sw-review-grid">';
    html += _buildSWReviewBox('users',         'Personas',    selPersonas.length, selPersonas.map(function(p) { return p.name; }));
    html += _buildSWReviewBox('crosshair',     'Pain Points', selPPs.length,      selPPs.map(function(p) { return p.pain_point; }));
    html += _buildSWReviewBox('message-square','Messages',    selMessages.length, selMessages.map(function(m) { return m.name; }));
    html += _buildSWReviewBox('palette',       'Styles',      selStyles.length,   selStyles.map(function(s) { return s.name; }));
    html += _buildSWReviewBox('clapperboard',  'Formats',     selFormats.length,  selFormats.map(function(f) { return f.name; }));
    html += _buildSWReviewBox('bullhorn',      'Campaigns',   selIdeas.length,    selIdeas.map(function(c) { return c.name; }));
    html += '</div>';

    if (selIdeas.length) {
      html += '<div class="cp-sw-info-box cp-sw-info-box--success" style="margin-top:var(--cp-space-4)">';
      html += icon('bullhorn') + ' <strong>' + selIdeas.length + ' Campaign idea' + (selIdeas.length !== 1 ? 's' : '') + '</strong> will be created as drafts. You can build out Ad Sets and Ads from each campaign\'s workspace using the per-campaign wizard.';
      html += '</div>';
    }

    html += '<p class="cp-sw-finalize-note" style="margin-top:var(--cp-space-5);text-align:center">';
    html += 'Hit <strong>Launch Workspace</strong> below to create your library and ' + selIdeas.length + ' Campaign' + (selIdeas.length !== 1 ? 's' : '') + '.';
    html += '</p>';

    return html;
  }

  function _buildSWReviewBox(iconName, label, count, names) {
    var html = '<div class="cp-sw-review-box">';
    html += '<div class="cp-sw-review-box-icon">' + icon(iconName) + '</div>';
    html += '<div class="cp-sw-review-box-count">' + count + '</div>';
    html += '<div class="cp-sw-review-box-label">' + esc(label) + '</div>';
    if (names && names.length) {
      html += '<div class="cp-sw-review-box-names">';
      var show = names.slice(0, 3);
      for (var i = 0; i < show.length; i++) {
        html += '<span>' + esc(truncate(show[i] || '', 30)) + '</span>';
      }
      if (names.length > 3) html += '<span>+' + (names.length - 3) + ' more</span>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

/* ===== src/20-part2a/16a-new-campaign-wizard.js ===== */
  // ============================================================
  // SECTION 9.6: NEW CAMPAIGN WIZARD (per-campaign, Meta v2 native)
  // ============================================================
  //
  // Multi-step flow for creating a new Campaign once the workspace is set up.
  // Step 1: Basics (name, objective, budget, brief)
  // Step 2: Ad Sets (AI-suggest + manual edits, selection)
  // Step 3: Ads per Ad Set (tabbed AI-suggest, selection)
  // Step 4: Review + Launch
  //
  // Mirrors the singleton-state pattern of the setup wizard: never reassign
  // `ncwState`, always mutate. Part 2B reads it via window._cpPart2A.ncwState.

  var ncwState = {};

  var NCW_STEPS = [
    { num: 1, label: 'Basics',   icon: 'clipboard-list' },
    { num: 2, label: 'Ad Sets',  icon: 'crosshairs' },
    { num: 3, label: 'Ads',      icon: 'rectangle-ad' },
    { num: 4, label: 'Review',   icon: 'check' }
  ];

  function _ncwReplaceState(newState) {
    var keys = Object.keys(ncwState);
    for (var i = 0; i < keys.length; i++) delete ncwState[keys[i]];
    var nk = Object.keys(newState);
    for (var j = 0; j < nk.length; j++) ncwState[nk[j]] = newState[nk[j]];
  }

  function _ncwFreshState() {
    return {
      step: 1,
      aiLoading: false, aiActionId: '', aiError: '',
      _expandedCards: {}, _activeAdSetTab: 0,
      campaign: {
        name: '', description: '',
        objective: 'OUTCOME_LEADS',
        budget_mode: 'CBO', bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
        daily_budget: '', lifetime_budget: '',
        start_time: '', stop_time: '',
        brief: '', ai_instructions: ''
      },
      ad_sets: [],
      _adsContext: {},        // { setIdx: contextString }
      stepGenerated: { 1: false, 2: false, 3: {} },
      created: { campaignV2Id: '', adSetIds: [], adIds: [] }
    };
  }

  function openNewCampaignWizard() {
    _ncwReplaceState(_ncwFreshState());
    _renderNCWDOM();
  }

  function _renderNCWDOM() {
    $('.cp-ncw').remove();
    var $w = $('<div class="cp-ncw" id="cpNCW" role="dialog" aria-modal="true" aria-label="New Campaign Wizard"></div>');
    $('#cpApp').append($w);
    renderNCW();
  }

  function renderNCW() {
    var html = '';
    html += '<div class="cp-ncw-progress-bar"><div class="cp-ncw-progress-fill" style="width:' + _ncwPct() + '%"></div></div>';
    html += '<div class="cp-ncw-layout">';
    html += _ncwBuildRail();
    html += _ncwBuildContent();
    html += '</div>';
    $('#cpNCW').html(html);
    setTimeout(function() {
      var $first = $('#cpNCW .cp-ncw-content-inner input, #cpNCW .cp-ncw-content-inner textarea, #cpNCW .cp-ncw-content-inner select');
      if ($first.length) $first.first().focus();
    }, 50);
  }

  function refreshNCW() {
    $('#cpNCW .cp-ncw-progress-fill').css('width', _ncwPct() + '%');
    $('#cpNCW .cp-ncw-rail-steps').html(_ncwBuildRailSteps());
    $('#cpNCW .cp-ncw-content-inner').html(_ncwBuildStepContent());
    $('#cpNCW .cp-ncw-footer').html(_ncwBuildFooter());
  }

  function _ncwPct() { return Math.round(((ncwState.step - 1) / 4) * 100); }

  function _ncwBuildRail() {
    var html = '<div class="cp-ncw-rail">';
    html += '<div class="cp-ncw-rail-header">';
    html += '<div class="cp-ncw-rail-logo">New<span class="cp-ncw-rail-logo-accent">Campaign</span></div>';
    html += '<div class="cp-ncw-rail-subtitle">Wizard</div>';
    html += '</div>';
    html += '<div class="cp-ncw-rail-steps">' + _ncwBuildRailSteps() + '</div>';
    html += '<div class="cp-ncw-rail-close"><button class="cp-btn cp-btn-ghost cp-btn-sm" data-action="ncw-close">' + icon('x') + ' Cancel</button></div>';
    html += '</div>';
    return html;
  }

  function _ncwBuildRailSteps() {
    var current = ncwState.step;
    var html = '';
    for (var i = 0; i < NCW_STEPS.length; i++) {
      var st = NCW_STEPS[i];
      var isDone = st.num < current;
      var isActive = st.num === current;
      var isLocked = st.num > current;
      var cls = 'cp-ncw-step';
      if (isActive) cls += ' cp-ncw-step--active';
      if (isDone)   cls += ' cp-ncw-step--done';
      if (isLocked) cls += ' cp-ncw-step--locked';
      var clickable = isDone;
      html += '<div class="' + cls + (clickable ? ' cp-ncw-step--clickable' : '') + '"';
      if (clickable) html += ' data-action="ncw-goto" data-step="' + st.num + '" role="button" tabindex="0"';
      html += '>';
      html += '<div class="cp-ncw-step-circle">' + (isDone ? icon('check') : st.num) + '</div>';
      html += '<div class="cp-ncw-step-label">' + esc(st.label) + '</div>';
      html += '</div>';
    }
    return html;
  }

  function _ncwBuildContent() {
    var html = '<div class="cp-ncw-content">';
    html += '<div class="cp-ncw-content-scroll"><div class="cp-ncw-content-inner">';
    html += _ncwBuildStepContent();
    html += '</div></div>';
    html += '<div class="cp-ncw-footer">' + _ncwBuildFooter() + '</div>';
    html += '</div>';
    return html;
  }

  function _ncwBuildStepContent() {
    switch (ncwState.step) {
      case 1: return _ncwRenderStep1();
      case 2: return _ncwRenderStep2();
      case 3: return _ncwRenderStep3();
      case 4: return _ncwRenderStep4();
    }
    return '';
  }

  function _ncwBuildFooter() {
    var n = ncwState.step;
    var html = '';
    html += '<div class="cp-ncw-footer-left">';
    if (n > 1) html += '<button class="cp-btn cp-btn-outline" data-action="ncw-back">' + icon('arrow-left') + ' Back</button>';
    else       html += '<span></span>';
    html += '</div>';
    html += '<div class="cp-ncw-footer-center"><div class="cp-ncw-step-counter">Step ' + n + ' of 4</div></div>';
    html += '<div class="cp-ncw-footer-right">';
    if (n < 4) html += '<button class="cp-btn cp-btn-primary" data-action="ncw-next">Next ' + icon('arrow-right') + '</button>';
    else       html += '<button class="cp-btn cp-btn-ai" data-action="ncw-launch">' + icon('rocket') + ' Create Campaign</button>';
    html += '</div>';
    return html;
  }

  function _ncwHeader(title, subtitle) {
    return '<div class="cp-ncw-step-header"><h2 class="cp-ncw-step-title">' + esc(title) + '</h2>' +
           '<p class="cp-ncw-step-subtitle">' + esc(subtitle) + '</p></div>';
  }

  // ----- Step 1: Basics -----
  function _ncwRenderStep1() {
    var st = ncwState;
    var cam = st.campaign || {};
    var C = Constants;
    var html = _ncwHeader('Campaign Basics', 'Write a brief and let AI draft the basics, or fill the fields manually. The brief carries forward to Step 2 (Ad Sets) and Step 3 (Ads).');

    html += _ncwErrorBanner();

    html += '<div class="cp-ncw-form">';

    html += '<div class="cp-field"><label class="cp-field-label">Brief <span class="cp-text-muted">— context for AI</span></label>';
    html += '<textarea class="cp-textarea" data-ncw-field="campaign.brief" rows="4" placeholder="Describe what you\'re selling, who you\'re targeting, what success looks like, any constraints...">';
    html += esc(cam.brief || '');
    html += '</textarea></div>';

    html += '<div class="cp-ncw-gen-bar">';
    html += '<button class="cp-btn cp-btn-ai"' + (st.aiLoading ? ' disabled' : '') + ' data-action="ncw-ai-draft-campaign">';
    html += icon('sparkles') + ' ' + (st.stepGenerated[1] ? 'Redraft with AI' : 'Draft with AI');
    html += '</button>';
    if (st.aiLoading) {
      html += '<button class="cp-btn cp-btn-ghost" data-action="ncw-ai-cancel">' + icon('x') + ' Cancel</button>';
    }
    html += '<span class="cp-text-muted cp-ncw-gen-hint">AI fills name, objective, budget mode and bid strategy from your brief. You can edit anything below.</span>';
    html += '</div>';

    if (st.aiLoading) {
      html += '<div class="cp-sw-skeleton-card" style="margin-top:var(--cp-space-3)">';
      html += '<div class="cp-sw-skeleton-line cp-sw-skeleton-line--title"></div>';
      html += '<div class="cp-sw-skeleton-line"></div><div class="cp-sw-skeleton-line"></div>';
      html += '<div class="cp-sw-skeleton-line cp-sw-skeleton-line--short"></div>';
      html += '</div>';
      html += '</div>';
      return html;
    }

    html += '<div class="cp-field"><label class="cp-field-label">Campaign Name <span class="cp-required">*</span></label>';
    html += '<input type="text" class="cp-input" data-ncw-field="campaign.name" value="' + esc(cam.name || '') + '" placeholder="e.g., Q3 SaaS Lead Gen" autocomplete="off"></div>';

    html += '<div class="cp-field"><label class="cp-field-label">Description</label>';
    html += '<input type="text" class="cp-input" data-ncw-field="campaign.description" value="' + esc(cam.description || '') + '" placeholder="One-line description of the campaign goal"></div>';

    html += '<div class="cp-ncw-field-row">';
    html += '<div class="cp-field"><label class="cp-field-label">Objective</label>';
    html += '<select class="cp-select" data-ncw-field="campaign.objective">';
    for (var ok in C.META_OBJECTIVES) {
      html += '<option value="' + esc(ok) + '"' + (cam.objective === ok ? ' selected' : '') + '>' + esc(C.META_OBJECTIVES[ok].label) + '</option>';
    }
    html += '</select></div>';
    html += '<div class="cp-field"><label class="cp-field-label">Budget mode</label>';
    html += '<select class="cp-select" data-ncw-field="campaign.budget_mode">';
    for (var bmk in C.META_BUDGET_MODES) {
      html += '<option value="' + esc(bmk) + '"' + (cam.budget_mode === bmk ? ' selected' : '') + '>' + esc(C.META_BUDGET_MODES[bmk].short) + '</option>';
    }
    html += '</select></div>';
    html += '<div class="cp-field"><label class="cp-field-label">Daily budget</label>';
    html += '<input type="number" class="cp-input" data-ncw-field="campaign.daily_budget" min="0" step="1" value="' + esc(cam.daily_budget != null ? cam.daily_budget : '') + '"></div>';
    html += '</div>';

    html += '<div class="cp-ncw-field-row">';
    html += '<div class="cp-field"><label class="cp-field-label">Start date</label>';
    html += '<input type="date" class="cp-input" data-ncw-field="campaign.start_time" value="' + esc(cam.start_time || '') + '"></div>';
    html += '<div class="cp-field"><label class="cp-field-label">End date</label>';
    html += '<input type="date" class="cp-input" data-ncw-field="campaign.stop_time" value="' + esc(cam.stop_time || '') + '"></div>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  // ----- Step 2: Ad Sets -----
  function _ncwRenderStep2() {
    var st = ncwState;
    var sets = st.ad_sets || [];
    var html = _ncwHeader('Ad Sets', 'Each Ad Set targets one persona or audience cut. AI will suggest 2-3 Ad Sets from your campaign brief.');

    html += _ncwErrorBanner();

    html += '<div class="cp-ncw-gen-bar">';
    html += '<button class="cp-btn cp-btn-ai"' + (st.aiLoading ? ' disabled' : '') + ' data-action="ncw-ai-suggest-sets">';
    html += icon('sparkles') + ' ' + (st.stepGenerated[2] ? 'Regenerate with AI' : 'Suggest with AI');
    html += '</button>';
    html += '<button class="cp-btn cp-btn-outline" data-action="ncw-add-ad-set">' + icon('plus') + ' Add Ad Set manually</button>';
    if (st.aiLoading) {
      html += '<button class="cp-btn cp-btn-ghost" data-action="ncw-ai-cancel">' + icon('x') + ' Cancel</button>';
    }
    html += '</div>';

    if (st.aiLoading) {
      html += _ncwBuildSetSkeleton(3);
      return html;
    }

    if (!sets.length) {
      html += '<div class="cp-ncw-empty">';
      html += '<div class="cp-ncw-empty-icon">' + icon('crosshairs') + '</div>';
      html += '<p>No Ad Sets yet. Use <strong>Suggest with AI</strong> to draft 2-3 based on your brief, or <strong>Add manually</strong>.</p>';
      html += '</div>';
      return html;
    }

    var selCount = sets.filter(function(s) { return s._selected; }).length;
    html += '<div class="cp-ncw-bar">';
    html += '<span class="cp-ncw-sel-count' + (selCount > 0 ? ' cp-ncw-sel-count--ok' : '') + '">';
    html += selCount + ' of ' + sets.length + ' Ad Set' + (sets.length !== 1 ? 's' : '') + ' selected';
    html += '</span>';
    html += '</div>';

    html += '<div class="cp-ncw-set-grid">';
    for (var i = 0; i < sets.length; i++) {
      html += _ncwBuildSetCard(sets[i], i);
    }
    html += '</div>';
    return html;
  }

  function _ncwBuildSetSkeleton(n) {
    var html = '<div class="cp-ncw-set-grid">';
    for (var i = 0; i < n; i++) {
      html += '<div class="cp-sw-skeleton-card">';
      html += '<div class="cp-sw-skeleton-line cp-sw-skeleton-line--title"></div>';
      html += '<div class="cp-sw-skeleton-line"></div><div class="cp-sw-skeleton-line"></div>';
      html += '<div class="cp-sw-skeleton-line cp-sw-skeleton-line--short"></div>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function _ncwBuildSetCard(adSet, idx) {
    var selected = adSet._selected;
    var personas = getAllPersonas ? getAllPersonas() : (S.data.personas || []);
    var goalLabel = (Constants.META_OPTIMIZATION_GOALS[adSet.optimization_goal] || {}).label || adSet.optimization_goal || '';
    var brief = adSet.brief || {};

    var html = '<div class="cp-ncw-set-card' + (selected ? ' cp-ncw-set-card--selected' : '') + '">';

    html += '<div class="cp-ncw-set-card-header">';
    html += '<button class="cp-sw-tree-check' + (selected ? ' cp-sw-tree-check--on' : '') + '" data-action="ncw-set-toggle" data-set-idx="' + idx + '">';
    html += selected ? icon('check') : '';
    html += '</button>';
    html += '<input type="text" class="cp-input cp-input-sm cp-ncw-set-name" data-ncw-set-field="name" data-set-idx="' + idx + '" value="' + esc(adSet.name || '') + '" placeholder="Ad Set name">';
    html += '<button class="cp-btn-icon cp-btn-icon-sm" data-action="ncw-set-delete" data-set-idx="' + idx + '" title="Delete">' + icon('trash') + '</button>';
    html += '</div>';

    html += '<div class="cp-ncw-set-card-fields">';
    html += '<div class="cp-field cp-field-inline"><label>Persona</label>';
    html += '<select class="cp-select cp-select-sm" data-ncw-set-field="persona_id" data-set-idx="' + idx + '">';
    html += '<option value="">(no persona)</option>';
    for (var p = 0; p < personas.length; p++) {
      html += '<option value="' + esc(personas[p].id) + '"' + (adSet.persona_id === personas[p].id ? ' selected' : '') + '>' + esc(personas[p].name) + '</option>';
    }
    html += '</select></div>';
    html += '<div class="cp-field cp-field-inline"><label>Optimization</label>';
    html += '<select class="cp-select cp-select-sm" data-ncw-set-field="optimization_goal" data-set-idx="' + idx + '">';
    for (var gk in Constants.META_OPTIMIZATION_GOALS) {
      html += '<option value="' + esc(gk) + '"' + (adSet.optimization_goal === gk ? ' selected' : '') + '>' + esc(Constants.META_OPTIMIZATION_GOALS[gk].label) + '</option>';
    }
    html += '</select></div>';
    html += '</div>';

    if (brief.creative_direction) {
      html += '<div class="cp-ncw-set-brief"><strong>Direction:</strong> ' + esc(brief.creative_direction) + '</div>';
    }
    if (brief.hook_angles && brief.hook_angles.length) {
      html += '<div class="cp-ncw-set-hooks"><strong>Hook angles:</strong> ';
      html += brief.hook_angles.map(function(h) { return '<span class="cp-badge">' + esc(h) + '</span>'; }).join('');
      html += '</div>';
    }

    var adCount = (adSet.ads || []).length;
    html += '<div class="cp-ncw-set-footer">';
    html += '<span class="cp-text-muted">' + adCount + ' Ad' + (adCount !== 1 ? 's' : '') + ' drafted</span>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  // ----- Step 3: Ads per Ad Set (tabs) -----
  function _ncwRenderStep3() {
    var st = ncwState;
    var sets = (st.ad_sets || []).filter(function(s) { return s._selected; });
    var html = _ncwHeader('Ads', 'Each Ad Set needs at least one Ad. Use AI to suggest 2-3 Ads per Ad Set, each with a distinct hook angle.');

    html += _ncwErrorBanner();

    if (!sets.length) {
      html += '<div class="cp-ncw-empty">';
      html += '<div class="cp-ncw-empty-icon">' + icon('rectangle-ad') + '</div>';
      html += '<p>No selected Ad Sets. Go back to Step 2 and select at least one.</p>';
      html += '</div>';
      return html;
    }

    var activeTab = st._activeAdSetTab || 0;
    if (activeTab >= sets.length) activeTab = 0;

    // Tab bar
    html += '<div class="cp-sw-pp-tabs">';
    for (var ti = 0; ti < sets.length; ti++) {
      var s = sets[ti];
      var adsSel = (s.ads || []).filter(function(a) { return a._selected; }).length;
      html += '<button class="cp-sw-pp-tab' + (ti === activeTab ? ' cp-sw-pp-tab--active' : '') + '" data-action="ncw-tab" data-tab="' + ti + '">';
      html += esc(truncate(s.name || ('Ad Set ' + (ti + 1)), 26));
      if (adsSel) html += ' <span class="cp-sw-pp-tab-badge">' + adsSel + '</span>';
      html += '</button>';
    }
    html += '</div>';

    var current = sets[activeTab];
    var setRealIdx = (st.ad_sets || []).indexOf(current);
    var ads = current.ads || [];
    var ctx = (st._adsContext || {})[setRealIdx] || '';
    var generated = (st.stepGenerated[3] || {})[setRealIdx];

    html += '<div class="cp-ncw-gen-bar">';
    html += '<textarea class="cp-textarea" id="ncwAdsContext" rows="2" placeholder="Optional: ad direction for this Ad Set...">' + esc(ctx) + '</textarea>';
    html += '<button class="cp-btn cp-btn-ai"' + (st.aiLoading ? ' disabled' : '') + ' data-action="ncw-ai-suggest-ads" data-set-idx="' + setRealIdx + '">';
    html += icon('sparkles') + ' ' + (generated ? 'Regenerate' : 'Suggest Ads');
    html += '</button>';
    html += '<button class="cp-btn cp-btn-outline" data-action="ncw-add-ad" data-set-idx="' + setRealIdx + '">' + icon('plus') + ' Add manually</button>';
    if (st.aiLoading) {
      html += '<button class="cp-btn cp-btn-ghost" data-action="ncw-ai-cancel">' + icon('x') + ' Cancel</button>';
    }
    html += '</div>';

    if (st.aiLoading) {
      html += _ncwBuildSetSkeleton(3);
      return html;
    }

    if (!ads.length) {
      html += '<div class="cp-ncw-empty">';
      html += '<div class="cp-ncw-empty-icon">' + icon('rectangle-ad') + '</div>';
      html += '<p>No Ads yet for this Ad Set. Use <strong>Suggest Ads</strong> or add one manually.</p>';
      html += '</div>';
      return html;
    }

    html += '<div class="cp-ncw-ad-grid">';
    for (var j = 0; j < ads.length; j++) {
      html += _ncwBuildAdCard(ads[j], setRealIdx, j);
    }
    html += '</div>';
    return html;
  }

  function _ncwBuildAdCard(ad, setIdx, adIdx) {
    var selected = ad._selected;
    var creative = ad.creative || {};
    var hook = ad.hook || {};
    var ctype = Constants.META_AD_CREATIVE_TYPES[ad.creative_type] || { label: 'Ad', icon: 'rectangle-ad' };
    var cta = Constants.META_CTA_TYPES[creative.cta_type];

    var html = '<div class="cp-ncw-ad-card' + (selected ? ' cp-ncw-ad-card--selected' : '') + '">';
    html += '<div class="cp-ncw-ad-card-header">';
    html += '<button class="cp-sw-tree-check cp-sw-tree-check--sm' + (selected ? ' cp-sw-tree-check--on' : '') + '" data-action="ncw-ad-toggle" data-set-idx="' + setIdx + '" data-ad-idx="' + adIdx + '">';
    html += selected ? icon('check') : '';
    html += '</button>';
    html += '<div class="cp-ncw-ad-card-title">' + icon(ctype.icon) + ' ' + esc(ad.name || ('Ad ' + (adIdx + 1))) + '</div>';
    html += '<button class="cp-btn-icon cp-btn-icon-sm" data-action="ncw-ad-delete" data-set-idx="' + setIdx + '" data-ad-idx="' + adIdx + '" title="Delete">' + icon('trash') + '</button>';
    html += '</div>';

    if (hook.text)             html += '<blockquote class="cp-sw-tree-ad-hook">' + esc(hook.text) + '</blockquote>';
    if (creative.primary_text) html += '<div class="cp-sw-tree-ad-text">' + esc(truncate(creative.primary_text, 160)) + '</div>';

    var meta = [];
    if (creative.headline)    meta.push('<strong>H:</strong> ' + esc(creative.headline));
    if (creative.description) meta.push('<strong>D:</strong> ' + esc(creative.description));
    if (cta)                  meta.push('<span class="cp-sw-tree-ad-cta">' + esc(cta.label) + '</span>');
    if (meta.length) html += '<div class="cp-sw-tree-ad-meta">' + meta.join(' · ') + '</div>';

    html += '</div>';
    return html;
  }

  // ----- Step 4: Review -----
  function _ncwRenderStep4() {
    var st = ncwState;
    var cam = st.campaign || {};
    var sets = (st.ad_sets || []).filter(function(s) { return s._selected; });
    var adCount = 0;
    sets.forEach(function(s) { adCount += (s.ads || []).filter(function(a) { return a._selected; }).length; });

    var html = _ncwHeader('Review & Launch', 'Final check. On Launch we create the Campaign + selected Ad Sets + selected Ads.');

    if (st.finalizing) {
      html += '<div class="cp-sw-finalize-progress"><div class="cp-sw-finalize-spinner">' + icon('loader') + '</div>';
      html += '<p class="cp-sw-finalize-msg">' + esc(st.finalizeMsg || 'Creating Campaign…') + '</p></div>';
      return html;
    }

    html += '<div class="cp-sw-review-grid">';
    html += '<div class="cp-sw-review-box"><div class="cp-sw-review-box-icon">' + icon('bullhorn') + '</div>';
    html += '<div class="cp-sw-review-box-count">1</div><div class="cp-sw-review-box-label">Campaign</div>';
    html += '<div class="cp-sw-review-box-names"><span>' + esc(cam.name || '(untitled)') + '</span></div></div>';

    html += '<div class="cp-sw-review-box"><div class="cp-sw-review-box-icon">' + icon('crosshairs') + '</div>';
    html += '<div class="cp-sw-review-box-count">' + sets.length + '</div><div class="cp-sw-review-box-label">Ad Sets</div>';
    html += '<div class="cp-sw-review-box-names">';
    sets.slice(0, 3).forEach(function(s) { html += '<span>' + esc(truncate(s.name || '', 30)) + '</span>'; });
    if (sets.length > 3) html += '<span>+' + (sets.length - 3) + ' more</span>';
    html += '</div></div>';

    html += '<div class="cp-sw-review-box"><div class="cp-sw-review-box-icon">' + icon('rectangle-ad') + '</div>';
    html += '<div class="cp-sw-review-box-count">' + adCount + '</div><div class="cp-sw-review-box-label">Ads</div></div>';
    html += '</div>';

    var objLabel = (Constants.META_OBJECTIVES[cam.objective] || {}).label || cam.objective || '';
    html += '<div class="cp-sw-info-box cp-sw-info-box--success" style="margin-top:var(--cp-space-4)">';
    html += icon('bullhorn') + ' <strong>' + esc(cam.name || '(untitled)') + '</strong>';
    if (objLabel) html += ' · ' + esc(objLabel);
    if (cam.daily_budget) html += ' · ' + esc(String(cam.daily_budget)) + '/day';
    html += '</div>';

    return html;
  }

  function _ncwErrorBanner() {
    if (!ncwState.aiError) return '';
    var html = '<div class="cp-sw-ai-error" role="alert">';
    html += '<div class="cp-sw-ai-error-icon">' + icon('triangle-alert') + '</div>';
    html += '<div class="cp-sw-ai-error-body">';
    html += '<div class="cp-sw-ai-error-title">AI failed</div>';
    html += '<div class="cp-sw-ai-error-msg">' + esc(ncwState.aiError) + '</div>';
    html += '</div>';
    html += '<button class="cp-btn cp-btn-sm cp-btn-ghost" data-action="ncw-error-dismiss">' + icon('x') + ' Dismiss</button>';
    html += '</div>';
    return html;
  }

  // ----- Field collection / navigation -----
  function _ncwCollectFields() {
    $('#cpNCW [data-ncw-field]').each(function() {
      var path = $(this).data('ncw-field'); if (!path) return;
      var parts = String(path).split('.');
      var obj = ncwState;
      for (var i = 0; i < parts.length - 1; i++) { obj = obj[parts[i]] = obj[parts[i]] || {}; }
      var val = $(this).val();
      obj[parts[parts.length - 1]] = val == null ? '' : val;
    });
  }

  function _ncwValidate(n) {
    if (n === 1) {
      if (!ncwState.campaign.name || !ncwState.campaign.name.trim()) {
        return { valid: false, message: 'Please enter a campaign name.' };
      }
    }
    if (n === 2) {
      var sets = (ncwState.ad_sets || []).filter(function(s) { return s._selected; });
      if (!sets.length) return { valid: false, message: 'Select at least one Ad Set.' };
    }
    if (n === 3) {
      var sels = (ncwState.ad_sets || []).filter(function(s) { return s._selected; });
      var anyAd = false;
      for (var i = 0; i < sels.length; i++) {
        if ((sels[i].ads || []).some(function(a) { return a._selected; })) { anyAd = true; break; }
      }
      if (!anyAd) return { valid: false, message: 'Each selected Ad Set needs at least one selected Ad.' };
    }
    return { valid: true };
  }

  function ncwGoNext() {
    _ncwCollectFields();
    var v = _ncwValidate(ncwState.step);
    if (!v.valid) { toast(v.message, 'warning'); return; }
    if (ncwState.step < 4) {
      ncwState.step++;
      refreshNCW();
    }
  }
  function ncwGoBack() { _ncwCollectFields(); if (ncwState.step > 1) { ncwState.step--; refreshNCW(); } }
  function ncwGotoStep(n) { if (n < ncwState.step) { _ncwCollectFields(); ncwState.step = n; refreshNCW(); } }
  function ncwClose() {
    openConfirmDialog(
      'Close New Campaign Wizard?',
      'Your in-progress draft will be lost.',
      function() { $('.cp-ncw').remove(); }
    );
  }

  function ncwAddAdSetManual() {
    var sets = ncwState.ad_sets || (ncwState.ad_sets = []);
    sets.push({
      name: 'Ad Set ' + (sets.length + 1),
      persona_id: '',
      audience_overrides: '',
      optimization_goal: 'OFFSITE_CONVERSIONS',
      billing_event: 'IMPRESSIONS',
      attribution_setting: '7d_click',
      brief: { creative_direction: '', message_ids: [], style_ids: [], format_ids: [], hook_angles: [], ai_notes: '' },
      ads: [],
      _selected: true
    });
    refreshNCW();
  }

  function ncwAddAdManual(setIdx) {
    var s = (ncwState.ad_sets || [])[setIdx]; if (!s) return;
    s.ads = s.ads || [];
    s.ads.push({
      name: 'Ad ' + (s.ads.length + 1), creative_type: 'single_image',
      hook: { text: '', type: 'direct' },
      creative: { primary_text: '', headline: '', description: '', cta_type: 'LEARN_MORE', cta_link: '' },
      media: { image_brief: '', image_prompt: '', video_concept: '' },
      _selected: true
    });
    refreshNCW();
  }

  function ncwLaunch() {
    if (typeof window._cpRenderers.finalizeNewCampaignWizard === 'function') {
      window._cpRenderers.finalizeNewCampaignWizard();
    } else {
      toast('Wizard finalize not loaded.', 'error');
    }
  }

/* ===== src/20-part2a/17-tag-crud.js ===== */
  // ============================================================
  // SECTION 10: TAG CRUD
  // ============================================================

  function openTagModal(tagId) {
    var isEdit = !!tagId;
    var t = isEdit ? getTag(tagId) : null;
    var colors = ['#1a73e8', '#7c3aed', '#0d904f', '#e37400', '#d93025', '#0891b2', '#059669', '#be123c'];
    var currentColor = t ? t.color : colors[0];

    var html = '<div class="cp-editor-form">';
    html += '<div class="cp-form-group"><label>Tag Name *</label>';
    html += '<input type="text" class="cp-input" data-field="name" value="' + esc(t ? t.name : '') + '" placeholder="e.g., Q2 Campaign"></div>';
    html += '<div class="cp-form-group"><label>Description</label>';
    html += '<input type="text" class="cp-input" data-field="description" value="' + esc(t ? t.description || '' : '') + '" placeholder="What this tag represents..."></div>';
    html += '<div class="cp-form-group"><label>Color</label><div class="cp-chip-selector">';
    for (var ci = 0; ci < colors.length; ci++) {
      html += '<button type="button" class="cp-color-swatch' + (currentColor === colors[ci] ? ' cp-color-swatch-active' : '') + '" data-action="pick-color" data-color="' + colors[ci] + '" style="width:28px;height:28px;border-radius:50%;border:2px solid ' + (currentColor === colors[ci] ? 'var(--cp-text-primary)' : 'transparent') + ';background:' + colors[ci] + ';cursor:pointer;padding:0"></button>';
    }
    html += '<input type="hidden" data-field="color" value="' + esc(currentColor) + '">';
    html += '</div></div></div>';

    openModal(isEdit ? 'Edit Tag' : 'New Tag', html, {
      titleIcon: 'tag',
      size: 'sm',
      saveLabel: isEdit ? 'Save' : 'Create Tag',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.name || !fields.name.trim()) { toast('Tag name is required', 'warning'); return; }
        if (isEdit) {
          snapshot('Edit tag');
          saveEntityField('tag', tagId, 'name', fields.name.trim());
          saveEntityField('tag', tagId, 'description', fields.description || '');
          saveEntityField('tag', tagId, 'color', fields.color || colors[0]);
        } else {
          createEntity('tag', { name: fields.name.trim(), description: fields.description || '', color: fields.color || colors[0] });
          snapshot('Create tag');
        }
        closeModal();
      }
    });
  }

  function confirmDeleteTag(tagId) {
    var t = getTag(tagId);
    if (!t) return;
    openConfirmDialog({
      title: 'Delete Tag',
      message: 'Delete "' + t.name + '"? It will be removed from all entities.',
      confirmLabel: 'Delete', danger: true,
      onConfirm: function() { snapshot('Delete tag'); deleteEntity('tag', tagId); }
    });
  }


/* ===== src/20-part2a/26-tag-input.js ===== */
  // ============================================================
  // SECTION 18: TAG INPUT COMPONENT
  // ============================================================

  function renderTagInput(entityTags, entityType, entityId) {
    entityTags = entityTags || [];
    var allTags = getAllTags();

    var html = '<div class="cp-tag-input" data-entity-type="' + esc(entityType || '') + '" data-entity-id="' + esc(entityId || '') + '">';
    html += '<div class="cp-tag-input-current">';
    for (var ti = 0; ti < entityTags.length; ti++) {
      var tag = S.tagMap[entityTags[ti]];
      if (tag) {
        html += '<span class="cp-badge" style="background:' + tag.color + '15;color:' + tag.color + '">' + icon('tag') + ' ' + esc(tag.name);
        html += ' <button class="cp-tag-remove" data-action="remove-entity-tag" data-tag-id="' + esc(tag.id) + '" style="border:none;background:none;cursor:pointer;color:inherit;font-size:10px;padding:0 2px">&times;</button>';
        html += '</span>';
      }
    }
    html += '</div>';

    // Tag picker dropdown
    var availableTags = allTags.filter(function(t) { return entityTags.indexOf(t.id) === -1; });
    if (availableTags.length > 0) {
      html += '<div class="cp-tag-input-add" style="margin-top:var(--cp-space-2);display:flex;gap:var(--cp-space-2);align-items:center">';
      html += '<select class="cp-select cp-select-sm" data-action="add-entity-tag" style="width:auto;min-width:120px">';
      html += '<option value="">+ Add tag...</option>';
      for (var ai = 0; ai < availableTags.length; ai++) {
        html += '<option value="' + esc(availableTags[ai].id) + '">' + esc(availableTags[ai].name) + '</option>';
      }
      html += '</select>';
      html += '</div>';
    } else if (allTags.length === 0) {
      html += '<p class="cp-text-muted" style="margin-top:4px">No tags created yet.</p>';
    }

    html += '</div>';
    return html;
  }


/* ===== src/20-part2a/27-event-handlers.js ===== */
  // ============================================================
  // SECTION 19: EVENT HANDLERS
  // ============================================================

  // Wraps a block of handler registrations so an error in one block
  // doesn't suppress the rest. Use for each logical "island" of handlers.
  function _safeHandlerBlock(label, fn) {
    try { fn(); }
    catch (e) {
      console.error('[CP] Handler block "' + label + '" failed:', e);
      if (typeof toast === 'function') toast('Some controls in "' + label + '" may not work — see console.', 'warning', 5000);
    }
  }

  function setupPart2AEvents() {
    console.log('[CP] Setting up Part 2A event handlers...');

    _safeHandlerBlock('Part 2A: core', function() {
    // --- Modal events ---
    $(document).off('click.cp2a-modal-close').on('click.cp2a-modal-close', '[data-action="close-modal"]', function(e) {
      e.preventDefault(); closeModal();
    });
    $(document).off('click.cp2a-modal-save').on('click.cp2a-modal-save', '[data-action="modal-save"]', function(e) {
      e.preventDefault();
      if (currentModal && currentModal.onSave) currentModal.onSave();
    });
    $(document).off('click.cp2a-modal-bg').on('click.cp2a-modal-bg', '.cp-modal-backdrop', function(e) {
      if ($(e.target).hasClass('cp-modal-backdrop')) closeModal();
    });

    // --- Category CRUD ---
    $(document).off('click.cp2a-new-cat').on('click.cp2a-new-cat', '[data-action="new-category"]', function(e) {
      e.preventDefault(); openCategoryModal();
    });
    $(document).off('click.cp2a-edit-cat').on('click.cp2a-edit-cat', '[data-action="edit-category"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      openCategoryModal($(this).data('id'));
    });
    $(document).off('click.cp2a-delete-cat').on('click.cp2a-delete-cat', '[data-action="delete-category"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      confirmDeleteCategory($(this).data('id'));
    });

    // --- Persona CRUD ---
    $(document).off('click.cp2a-new-persona').on('click.cp2a-new-persona', '[data-action="new-persona"]', function(e) {
      e.preventDefault(); openPersonaModal();
    });
    $(document).off('click.cp2a-edit-persona').on('click.cp2a-edit-persona', '[data-action="edit-persona"]', function(e) {
      e.preventDefault(); openPersonaModal($(this).data('id'));
    });
    $(document).off('click.cp2a-delete-persona').on('click.cp2a-delete-persona', '[data-action="delete-persona"]', function(e) {
      e.preventDefault(); confirmDeletePersona($(this).data('id'));
    });
    $(document).off('click.cp2a-add-pp-persona').on('click.cp2a-add-pp-persona', '[data-action="add-pain-point-to-persona"]', function(e) {
      e.preventDefault();
      var personaId = $(this).data('persona-id');
      if (!personaId) return;
      openPainPointModal(); // Opens new pain point modal; user can link it to persona after creation
    });

    // --- Pain Point CRUD ---
    $(document).off('click.cp2a-new-pp').on('click.cp2a-new-pp', '[data-action="new-pain-point"]', function(e) {
      e.preventDefault(); openPainPointModal();
    });
    $(document).off('click.cp2a-select-pp').on('click.cp2a-select-pp', '[data-action="select-pain-point"]', function(e) {
      e.preventDefault(); openPainPointModal($(this).data('id'));
    });
    $(document).off('click.cp2a-delete-pp').on('click.cp2a-delete-pp', '[data-action="delete-pain-point"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      confirmDeletePainPoint($(this).data('id'));
    });

    // --- Message CRUD ---
    $(document).off('click.cp2a-new-msg').on('click.cp2a-new-msg', '[data-action="new-message"]', function(e) {
      e.preventDefault(); openMessageModal();
    });
    $(document).off('click.cp2a-edit-msg').on('click.cp2a-edit-msg', '[data-action="edit-message"]', function(e) {
      e.preventDefault(); e.stopPropagation(); openMessageModal($(this).data('id'));
    });
    $(document).off('click.cp2a-delete-msg').on('click.cp2a-delete-msg', '[data-action="delete-message"]', function(e) {
      e.preventDefault(); e.stopPropagation(); confirmDeleteMessage($(this).data('id'));
    });
    $(document).off('click.cp2a-select-msg').on('click.cp2a-select-msg', '[data-action="select-message"]', function(e) {
      e.preventDefault(); openMessageModal($(this).data('id'));
    });

    // --- Style CRUD ---
    $(document).off('click.cp2a-new-style').on('click.cp2a-new-style', '[data-action="new-style"]', function(e) {
      e.preventDefault(); openStyleModal();
    });
    $(document).off('click.cp2a-edit-style').on('click.cp2a-edit-style', '[data-action="edit-style"]', function(e) {
      e.preventDefault(); e.stopPropagation(); openStyleModal($(this).data('id'));
    });
    $(document).off('click.cp2a-delete-style').on('click.cp2a-delete-style', '[data-action="delete-style"]', function(e) {
      e.preventDefault(); e.stopPropagation(); confirmDeleteStyle($(this).data('id'));
    });

    // --- Format CRUD ---
    $(document).off('click.cp2a-new-format').on('click.cp2a-new-format', '[data-action="new-format"]', function(e) {
      e.preventDefault(); openFormatModal();
    });
    $(document).off('click.cp2a-edit-format').on('click.cp2a-edit-format', '[data-action="edit-format"]', function(e) {
      e.preventDefault(); e.stopPropagation(); openFormatModal($(this).data('id'));
    });
    $(document).off('click.cp2a-delete-format').on('click.cp2a-delete-format', '[data-action="delete-format"]', function(e) {
      e.preventDefault(); e.stopPropagation(); confirmDeleteFormat($(this).data('id'));
    });

    // --- Tag CRUD ---
    $(document).off('click.cp2a-new-tag').on('click.cp2a-new-tag', '[data-action="new-tag"]', function(e) {
      e.preventDefault(); openTagModal();
    });
    $(document).off('click.cp2a-edit-tag').on('click.cp2a-edit-tag', '[data-action="edit-tag"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      openTagModal($(this).data('id'));
    });
    $(document).off('click.cp2a-delete-tag').on('click.cp2a-delete-tag', '[data-action="delete-tag"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      confirmDeleteTag($(this).data('id'));
    });

    // --- Modal-specific interactions ---
    // Funnel chip toggle in modals
    $(document).off('click.cp2a-funnel-chip').on('click.cp2a-funnel-chip', '[data-action="toggle-funnel-chip"]', function(e) {
      e.preventDefault();
      var $chip = $(this);
      var stageId = $chip.data('stage-id');
      var f = getFunnelStage(stageId);
      if (!f) return;
      var isActive = $chip.hasClass('cp-funnel-chip-active');
      if (isActive) {
        $chip.removeClass('cp-funnel-chip-active').css({ background: '', borderColor: f.color + '40', color: f.color });
      } else {
        $chip.addClass('cp-funnel-chip-active').css({ background: f.color, borderColor: f.color, color: '#fff' });
      }
    });

    // Color swatch picker
    $(document).off('click.cp2a-color').on('click.cp2a-color', '[data-action="pick-color"]', function(e) {
      e.preventDefault();
      var color = $(this).data('color');
      $(this).closest('.cp-chip-selector').find('.cp-color-swatch').css('border-color', 'transparent').removeClass('cp-color-swatch-active');
      $(this).css('border-color', 'var(--cp-text-primary)').addClass('cp-color-swatch-active');
      $(this).closest('.cp-form-group').find('input[data-field="color"]').val(color);
    });

    // Add/remove hook rows in message modal
    $(document).off('click.cp2a-add-hook').on('click.cp2a-add-hook', '[data-action="add-hook-row"]', function(e) {
      e.preventDefault(); addHookRow();
    });
    $(document).off('click.cp2a-rm-hook').on('click.cp2a-rm-hook', '[data-action="remove-hook-row"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      removeHookRow(parseInt($(this).data('hook-index'), 10));
    });

    // Pain point picker checkbox toggle in persona modal
    $(document).off('change.cp2a-pp-check').on('change.cp2a-pp-check', '.cp-pain-point-picker-item input[type="checkbox"]', function() {
      $(this).closest('.cp-pain-point-picker-item').toggleClass('cp-pain-point-picker-item-selected', this.checked);
    });


    // --- Tag Input Component ---
    $(document).off('change.cp2a-add-tag').on('change.cp2a-add-tag', '[data-action="add-entity-tag"]', function() {
      var tagId = $(this).val();
      if (!tagId) return;
      var $container = $(this).closest('.cp-tag-input');
      var entityType = $container.data('entity-type');
      var entityId = $container.data('entity-id');
      if (!entityType || !entityId) return;
      var collections = {
        persona: S.data.personas, message: S.data.messages, style: S.data.styles,
        visual_format: S.data.visual_formats, pain_point: S.data.pain_points,
        campaign_v2: S.data.campaigns_v2, ad_set: S.data.ad_sets, ad: S.data.ads
      };
      var coll = collections[entityType];
      if (!coll) return;
      var entity = coll.find(function(e) { return e.id === entityId; });
      if (!entity) return;
      entity.tags = entity.tags || [];
      if (entity.tags.indexOf(tagId) === -1) {
        entity.tags.push(tagId);
        entity.updated = new Date().toISOString();
        syncToTextarea(); buildMaps(); render();
      }
    });

    $(document).off('click.cp2a-rm-tag').on('click.cp2a-rm-tag', '[data-action="remove-entity-tag"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var tagId = $(this).data('tag-id');
      if (!tagId) return;
      var $container = $(this).closest('.cp-tag-input');
      var entityType = $container.data('entity-type');
      var entityId = $container.data('entity-id');
      if (!entityType || !entityId) return;
      var collections = {
        persona: S.data.personas, message: S.data.messages, style: S.data.styles,
        visual_format: S.data.visual_formats, pain_point: S.data.pain_points,
        campaign_v2: S.data.campaigns_v2, ad_set: S.data.ad_sets, ad: S.data.ads
      };
      var coll = collections[entityType];
      if (!coll) return;
      var entity = coll.find(function(e) { return e.id === entityId; });
      if (!entity || !entity.tags) return;
      entity.tags = entity.tags.filter(function(tid) { return tid !== tagId; });
      entity.updated = new Date().toISOString();
      syncToTextarea(); buildMaps(); render();
    });

    // --- AI Action Bar expand/collapse ---
    $(document).off('click.cp2a-expand-ai').on('click.cp2a-expand-ai', '[data-action="expand-ai-action"]', function(e) {
      e.preventDefault();
      var panelId = $(this).data('panel-id');
      var $panel = $('#cpAIPanel_' + panelId);
      $('.cp-ai-action-expanded:visible').not($panel).slideUp(150);
      $panel.slideToggle(200);
    });
    $(document).off('click.cp2a-collapse-ai').on('click.cp2a-collapse-ai', '[data-action="collapse-ai-action"]', function(e) {
      e.preventDefault();
      var panelId = $(this).data('panel-id');
      $('#cpAIPanel_' + panelId).slideUp(150);
    });

    // --- Setup Wizard ---
    $(document).off('click.cp2a-sw-open').on('click.cp2a-sw-open', '[data-action="open-setup-wizard"]', function(e) {
      e.preventDefault();
      var forceReset = $(this).data('force-reset') === true || $(this).data('forceReset') === true;
      try {
        openSetupWizard(forceReset);
      } catch (err) {
        // Defence-in-depth: openSetupWizard's internal try/catch should already
        // recover, but a sync throw before it would otherwise surface as a
        // blank screen. Tear down any partial overlay and toast.
        try { $('.cp-setup-wizard').remove(); } catch (e2) {}
        if (typeof toast === 'function') toast('Setup wizard failed to open — see console for details.', 'error', 6000);
        console.error('[CP] Setup wizard click handler failed:', (err && err.stack) || err);
      }
    });

    // --- Settings: re-run the wizard, keeping all generated entities ---
    $(document).off('click.cp2a-sw-restart-keep').on('click.cp2a-sw-restart-keep', '[data-action="sw-restart-keep-data"]', function(e) {
      e.preventDefault();
      openConfirmDialog({
        title: 'Re-run setup wizard?',
        message: 'Re-open the setup wizard? Your existing personas, pain points, messages, styles, formats, and campaigns will be kept. The wizard will start fresh from Stage 1.',
        confirmLabel: 'Re-run wizard',
        onConfirm: function() {
          try {
            if (S.meta && S.meta.setup) S.meta.setup.setup_complete = false;
            if (typeof swClearSession === 'function') swClearSession();
            syncToTextarea();
            openSetupWizard(true);
          } catch (err) {
            console.error('[CP] sw-restart-keep-data failed:', (err && err.stack) || err);
            toast('Could not re-open setup wizard — see console.', 'error', 6000);
          }
        }
      });
    });

    // --- Settings: full wipe of generated entities + re-run wizard ---
    $(document).off('click.cp2a-sw-reset-wipe').on('click.cp2a-sw-reset-wipe', '[data-action="sw-reset-wipe-data"]', function(e) {
      e.preventDefault();
      var personas  = Object.keys((S.data && S.data.personas)     || {}).length;
      var messages  = Object.keys((S.data && S.data.messages)     || {}).length;
      var campaigns = Object.keys((S.data && S.data.campaigns_v2) || {}).length;
      openConfirmDialog({
        title: 'Reset everything from scratch?',
        message: 'Delete ' + personas + ' persona(s), ' + messages + ' message(s), ' + campaigns + ' campaign(s), plus all pain points, styles, formats, ad sets, and ads — and re-open the setup wizard? This cannot be undone.',
        confirmLabel: 'Delete everything & restart',
        danger: true,
        onConfirm: function() {
          try {
            var keys = ['personas', 'pain_points', 'messages', 'styles', 'visual_formats', 'campaigns_v2', 'ad_sets', 'ads'];
            for (var i = 0; i < keys.length; i++) {
              if (S.data) S.data[keys[i]] = {};
            }
            if (S.meta && S.meta.setup) S.meta.setup.setup_complete = false;
            if (typeof swClearSession === 'function') swClearSession();
            if (typeof buildMaps === 'function') buildMaps();
            syncToTextarea();
            openSetupWizard(true);
          } catch (err) {
            console.error('[CP] sw-reset-wipe-data failed:', (err && err.stack) || err);
            toast('Reset failed — see console.', 'error', 6000);
          }
        }
      });
    });
    $(document).off('click.cp2a-sw-close').on('click.cp2a-sw-close', '[data-action="sw-close"]', function(e) {
      e.preventDefault();
      // Gate: don't allow closing before Stage 1 is complete
      if (typeof _swStage1Complete === 'function' && !_swStage1Complete()) {
        toast('Pick an AI provider and a run mode first — then you can close and explore the app.', 'warning');
        return;
      }
      swSaveSession();
      openConfirmDialog(
        'Close Setup Wizard?',
        'Your progress has been saved. You can resume it from the Setup page anytime.',
        function() { $('.cp-setup-wizard').remove(); }
      );
    });
    // --- Stage 1 mode-pick buttons (Manual / Full Auto) ---
    $(document).off('click.cp2a-sw-start-manual').on('click.cp2a-sw-start-manual', '[data-action="sw-start-manual"]', function(e) {
      e.preventDefault(); swStartMode('manual');
    });
    $(document).off('click.cp2a-sw-start-auto').on('click.cp2a-sw-start-auto', '[data-action="sw-start-auto"]', function(e) {
      e.preventDefault(); swStartMode('auto');
    });
    // --- Pause / resume Full Auto run ---
    $(document).off('click.cp2a-sw-pause').on('click.cp2a-sw-pause', '[data-action="sw-pause-auto"]', function(e) {
      e.preventDefault(); swPauseAutoRun();
    });
    $(document).off('click.cp2a-sw-resume').on('click.cp2a-sw-resume', '[data-action="sw-resume-auto"]', function(e) {
      e.preventDefault(); swResumeAutoRun();
    });
    $(document).off('click.cp2a-sw-next').on('click.cp2a-sw-next', '[data-action="sw-next"]', function(e) {
      e.preventDefault(); swGoNext();
    });
    $(document).off('click.cp2a-sw-back').on('click.cp2a-sw-back', '[data-action="sw-back"]', function(e) {
      e.preventDefault(); swGoBack();
    });
    $(document).off('click.cp2a-sw-skip').on('click.cp2a-sw-skip', '[data-action="sw-skip"]', function(e) {
      e.preventDefault(); swSkipStep();
    });
    $(document).off('click.cp2a-sw-goto').on('click.cp2a-sw-goto', '[data-action="sw-goto-step"]', function(e) {
      e.preventDefault();
      var n = parseInt($(this).data('step'), 10);
      if (!isNaN(n)) swGotoStep(n);
    });
    $(document).off('click.cp2a-sw-card').on('click.cp2a-sw-card', '.cp-sw-sel-card', function(e) {
      // Ignore clicks that originate on the expand button
      if ($(e.target).closest('[data-action="sw-card-expand"]').length) return;
      e.preventDefault();
      var idx = parseInt($(this).data('idx'), 10);
      var cardType = $(this).data('card-type');
      var step = setupWizardState.step;
      // Prefer data-card-type when present (Stage 2 hosts both persona + painpoint;
      // Stage 4 hosts both style + format). Fall back to stage-number mapping for stages
      // where every card on screen is one type.
      var typeToList = { persona: 'personas', painpoint: 'pain_points',
                          message: 'messages', style: 'styles', format: 'formats' };
      var listKey = typeToList[cardType] || { 3: 'messages' }[step];
      if (!listKey) return;
      var items = setupWizardState[listKey];
      if (!items || isNaN(idx) || !items[idx]) return;
      items[idx]._selected = !items[idx]._selected;
      refreshSetupWizard();
    });
    $(document).off('click.cp2a-sw-expand').on('click.cp2a-sw-expand', '[data-action="sw-card-expand"]', function(e) {
      e.preventDefault();
      var key = $(this).data('key');
      if (key) {
        setupWizardState._expandedCards[key] = !setupWizardState._expandedCards[key];
        refreshSetupWizard();
      }
    });
    $(document).off('click.cp2a-sw-gen-p').on('click.cp2a-sw-gen-p', '[data-action="sw-ai-gen-personas"]', function(e) {
      e.preventDefault();
      if (setupWizardState.aiLoading) return;
      setupWizardState._personaContext = $('#swPersonaContext').val() || '';
      var R = window._cpRenderers || {};
      if (typeof R.swAIGeneratePersonas === 'function') R.swAIGeneratePersonas();
      else toast('AI not ready — please wait for the page to fully load.', 'warning');
    });
    $(document).off('click.cp2a-sw-gen-pp').on('click.cp2a-sw-gen-pp', '[data-action="sw-ai-gen-painpoints"]', function(e) {
      e.preventDefault();
      if (setupWizardState.aiLoading) return;
      setupWizardState._ppContext = $('#swPainPointContext').val() || '';
      var R = window._cpRenderers || {};
      if (typeof R.swAIGeneratePainPoints === 'function') R.swAIGeneratePainPoints();
      else toast('AI not ready — please wait for the page to fully load.', 'warning');
    });
    $(document).off('click.cp2a-sw-pp-tab').on('click.cp2a-sw-pp-tab', '[data-action="sw-pp-tab"]', function(e) {
      e.preventDefault();
      var tab = parseInt($(this).data('tab'), 10);
      if (!isNaN(tab)) { setupWizardState._ppActiveTab = tab; refreshSetupWizard(); }
    });
    $(document).off('click.cp2a-sw-gen-msg').on('click.cp2a-sw-gen-msg', '[data-action="sw-ai-gen-messages"]', function(e) {
      e.preventDefault();
      if (setupWizardState.aiLoading) return;
      setupWizardState._messageContext = $('#swMessageContext').val() || '';
      var R = window._cpRenderers || {};
      if (typeof R.swAIGenerateMessages === 'function') R.swAIGenerateMessages();
      else toast('AI not ready — please wait for the page to fully load.', 'warning');
    });
    $(document).off('click.cp2a-sw-gen-sf').on('click.cp2a-sw-gen-sf', '[data-action="sw-ai-gen-styles-formats"]', function(e) {
      e.preventDefault();
      if (setupWizardState.aiLoading) return;
      setupWizardState._styleFormatContext = $('#swStyleFormatContext').val() || '';
      var R = window._cpRenderers || {};
      if (typeof R.swAIGenerateStylesFormats === 'function') R.swAIGenerateStylesFormats();
      else toast('AI not ready — please wait for the page to fully load.', 'warning');
    });
    $(document).off('click.cp2a-sw-gen-ideas').on('click.cp2a-sw-gen-ideas', '[data-action="sw-ai-gen-campaign-ideas"]', function(e) {
      e.preventDefault();
      if (setupWizardState.aiLoading) return;
      setupWizardState._campaignIdeasContext = $('#swCampaignIdeasContext').val() || '';
      swCollectFields();
      setupWizardState.stepGenerated.campaignIdeas = false;
      var R = window._cpRenderers || {};
      if (typeof R.swAIGenerateCampaignIdeas === 'function') R.swAIGenerateCampaignIdeas();
      else toast('AI not ready — please wait for the page to fully load.', 'warning');
    });
    $(document).off('click.cp2a-sw-ai-cancel').on('click.cp2a-sw-ai-cancel', '[data-action="sw-ai-cancel"]', function(e) {
      e.preventDefault();
      swCancelAIGeneration();
    });
    $(document).off('click.cp2a-sw-ai-error-dismiss').on('click.cp2a-sw-ai-error-dismiss', '[data-action="sw-ai-error-dismiss"]', function(e) {
      e.preventDefault();
      setupWizardState.aiError = '';
      refreshSetupWizard();
    });
    $(document).off('click.cp2a-sw-ai-retry').on('click.cp2a-sw-ai-retry', '[data-action="sw-ai-retry-step"]', function(e) {
      e.preventDefault();
      var n = parseInt($(this).data('step'), 10);
      if (!isNaN(n)) swRetryStep(n);
    });
    // --- Stage 5 campaign-idea handlers ---
    $(document).off('click.cp2a-sw-tree-expand').on('click.cp2a-sw-tree-expand', '[data-action="sw-tree-expand"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var key = $(this).data('key');
      if (!key) return;
      setupWizardState._expandedCards[key] = !setupWizardState._expandedCards[key];
      refreshSetupWizard();
    });
    $(document).off('click.cp2a-sw-idea-toggle').on('click.cp2a-sw-idea-toggle', '[data-action="sw-idea-toggle"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var i = parseInt($(this).data('idea-idx'), 10);
      var ideas = setupWizardState.campaign_ideas || [];
      if (isNaN(i) || !ideas[i]) return;
      ideas[i]._selected = !ideas[i]._selected;
      refreshSetupWizard();
    });
    $(document).off('click.cp2a-sw-idea-delete').on('click.cp2a-sw-idea-delete', '[data-action="sw-idea-delete"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var i = parseInt($(this).data('idea-idx'), 10);
      var ideas = setupWizardState.campaign_ideas || [];
      if (isNaN(i) || !ideas[i]) return;
      ideas.splice(i, 1);
      refreshSetupWizard();
    });
    $(document).off('click.cp2a-sw-idea-add').on('click.cp2a-sw-idea-add', '[data-action="sw-idea-add-manual"]', function(e) {
      e.preventDefault();
      setupWizardState.campaign_ideas = setupWizardState.campaign_ideas || [];
      var n = setupWizardState.campaign_ideas.length + 1;
      setupWizardState.campaign_ideas.push({
        name: 'Campaign ' + n,
        objective: 'OUTCOME_LEADS',
        brief: '',
        persona_idx: -1,
        message_idx_list: [],
        _selected: true
      });
      setupWizardState._expandedCards['idea_' + (setupWizardState.campaign_ideas.length - 1)] = true;
      refreshSetupWizard();
    });
    $(document).off('change.cp2a-sw-idea-field input.cp2a-sw-idea-field').on('change.cp2a-sw-idea-field input.cp2a-sw-idea-field', '[data-sw-idea-field]', function() {
      var i = parseInt($(this).data('idea-idx'), 10);
      var field = $(this).data('sw-idea-field');
      var ideas = setupWizardState.campaign_ideas || [];
      if (isNaN(i) || !ideas[i] || !field) return;
      var val = $(this).val();
      if (field === 'persona_idx') val = parseInt(val, 10);
      ideas[i][field] = val;
    });
    $(document).off('click.cp2a-sw-idea-msg').on('click.cp2a-sw-idea-msg', '[data-action="sw-idea-toggle-message"]', function(e) {
      e.preventDefault();
      var i = parseInt($(this).data('idea-idx'), 10);
      var mi = parseInt($(this).data('msg-idx'), 10);
      var ideas = setupWizardState.campaign_ideas || [];
      if (isNaN(i) || isNaN(mi) || !ideas[i]) return;
      ideas[i].message_idx_list = ideas[i].message_idx_list || [];
      var pos = ideas[i].message_idx_list.indexOf(mi);
      if (pos === -1) ideas[i].message_idx_list.push(mi);
      else ideas[i].message_idx_list.splice(pos, 1);
      refreshSetupWizard();
    });
    $(document).off('click.cp2a-sw-launch').on('click.cp2a-sw-launch', '[data-action="sw-launch"]', function(e) {
      e.preventDefault();
      if (typeof window._cpRenderers.finalizeSetupWizard === 'function') {
        window._cpRenderers.finalizeSetupWizard();
      }
    });
    $(document).off('click.cp2a-sw-test-ai').on('click.cp2a-sw-test-ai', '[data-action="sw-test-ai"]', function(e) {
      e.preventDefault(); _swTestAIConnection();
    });
    // Update wizard AI model dropdown when provider changes (Stage 1 picker)
    $(document).off('change.cp2a-sw-ai-prov').on('change.cp2a-sw-ai-prov', '.cp-sw-ai-picker-wrap .cp-ai-provider-select', function() {
      setupWizardState.aiConfig.tested = false; // reset test status on provider change
      var $prov = $(this);
      var pid = $prov.val();
      var $modelSel = $prov.closest('.cp-ai-picker').find('.cp-ai-model-select');
      if (!$modelSel.length) return;
      var p2b = window._cpPart2B;
      if (!p2b || !p2b.LLMService) return;
      var models = p2b.LLMService.getActiveModels(pid);
      var opts = '';
      for (var i = 0; i < models.length; i++) {
        opts += '<option value="' + esc(models[i].id) + '">' + esc(models[i].label || models[i].id) + '</option>';
      }
      $modelSel.html(opts);
      // Reset test status display
      $('#swAiTestStatus').html('<span class="cp-sw-test-idle">Not tested yet &mdash; you can still continue</span>');
    });

    // Escape key closes modal / wizard
    // Enter / Space activates selection cards and combo cards (accessibility)
    $(document).off('keydown.cp2a-sw-cards').on('keydown.cp2a-sw-cards', function(e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var $target = $(e.target);

      // Selection cards (personas / pain points / messages / styles / formats)
      if ($target.hasClass('cp-sw-sel-card')) {
        e.preventDefault();
        $target.trigger('click');
        return;
      }
      // Combo cards
      if ($target.hasClass('cp-sw-combo-card')) {
        e.preventDefault();
        $target.trigger('click');
        return;
      }
      // Clickable rail steps
      if ($target.hasClass('cp-sw-step-item--clickable')) {
        e.preventDefault();
        $target.trigger('click');
      }
    });

    // Tab focus trap — keep focus inside wizard overlay when it is open
    $(document).off('keydown.cp2a-sw-trap').on('keydown.cp2a-sw-trap', function(e) {
      if (e.key !== 'Tab') return;
      var $wiz = $('#cpSetupWizard');
      if (!$wiz.length) return;
      var focusable = $wiz.find(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), ' +
        'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ).filter(':visible');
      if (!focusable.length) return;
      var first = focusable.first()[0];
      var last  = focusable.last()[0];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    });

    $(document).off('keydown.cp2a-esc').on('keydown.cp2a-esc', function(e) {
      if (e.key === 'Escape') {
        if ($('.cp-confirm-backdrop').length) closeConfirmDialog();
        else if ($('.cp-modal-backdrop').length) closeModal();
        else if ($('.cp-setup-wizard').length && !setupWizardState.finalizing) {
          // Don't allow Escape to close before Stage 1 is complete
          if (typeof _swStage1Complete === 'function' && !_swStage1Complete()) {
            toast('Pick an AI provider and a run mode first — then you can close and explore the app.', 'warning');
            return;
          }
          swSaveSession();
          openConfirmDialog(
            'Close Setup Wizard?',
            'Your progress has been saved. You can resume from the Setup page.',
            function() { $('.cp-setup-wizard').remove(); }
          );
        }
      }
    });

    // Undo/redo keyboard shortcuts
    $(document).off('keydown.cp2a-undo').on('keydown.cp2a-undo', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        if (!$(e.target).is('input, textarea, [contenteditable]')) { e.preventDefault(); undo(); }
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        if (!$(e.target).is('input, textarea, [contenteditable]')) { e.preventDefault(); redo(); }
      }
    });
    });  // _safeHandlerBlock('Part 2A: core')

    // --- Meta v2 actions (Campaign Workspace, Meta Campaigns list, modals) ---
    _safeHandlerBlock('Part 2A: Meta v2', function() { setupMetaV2EventHandlers(); });

    console.log('[CP] Part 2A event handlers ready');
  }

  function setupMetaV2EventHandlers() {
    // List view + workspace navigation
    $(document).off('click.cpv2-new-campaign').on('click.cpv2-new-campaign', '[data-action="new-campaign-v2"]', function(e) {
      e.preventDefault();
      // Open the multi-step New Campaign Wizard instead of the legacy modal
      if (typeof openNewCampaignWizard === 'function') openNewCampaignWizard();
      else openMetaCampaignModal();
    });

    // --- New Campaign Wizard event wiring ---
    $(document).off('click.ncw-next').on('click.ncw-next', '[data-action="ncw-next"]', function(e) { e.preventDefault(); ncwGoNext(); });
    $(document).off('click.ncw-back').on('click.ncw-back', '[data-action="ncw-back"]', function(e) { e.preventDefault(); ncwGoBack(); });
    $(document).off('click.ncw-goto').on('click.ncw-goto', '[data-action="ncw-goto"]', function(e) {
      e.preventDefault();
      var n = parseInt($(this).data('step'), 10);
      if (!isNaN(n)) ncwGotoStep(n);
    });
    $(document).off('click.ncw-close').on('click.ncw-close', '[data-action="ncw-close"]', function(e) { e.preventDefault(); ncwClose(); });
    $(document).off('click.ncw-launch').on('click.ncw-launch', '[data-action="ncw-launch"]', function(e) { e.preventDefault(); ncwLaunch(); });
    $(document).off('click.ncw-error-dismiss').on('click.ncw-error-dismiss', '[data-action="ncw-error-dismiss"]', function(e) {
      e.preventDefault(); ncwState.aiError = ''; refreshNCW();
    });
    $(document).off('click.ncw-ai-cancel').on('click.ncw-ai-cancel', '[data-action="ncw-ai-cancel"]', function(e) {
      e.preventDefault();
      var p2b = window._cpPart2B;
      if (p2b && p2b.LLMService && typeof p2b.LLMService.abortAction === 'function') p2b.LLMService.abortAction(ncwState.aiActionId || 'ncw-ai');
      ncwState.aiLoading = false; ncwState.aiActionId = ''; ncwState.aiError = 'Generation cancelled.';
      refreshNCW();
    });
    $(document).off('click.ncw-draft-camp').on('click.ncw-draft-camp', '[data-action="ncw-ai-draft-campaign"]', function(e) {
      e.preventDefault();
      var R = window._cpRenderers || {};
      if (typeof R.ncwAIDraftCampaign === 'function') R.ncwAIDraftCampaign();
    });
    $(document).off('click.ncw-suggest-sets').on('click.ncw-suggest-sets', '[data-action="ncw-ai-suggest-sets"]', function(e) {
      e.preventDefault();
      var R = window._cpRenderers || {};
      if (typeof R.ncwAISuggestAdSets === 'function') R.ncwAISuggestAdSets();
    });
    $(document).off('click.ncw-suggest-ads').on('click.ncw-suggest-ads', '[data-action="ncw-ai-suggest-ads"]', function(e) {
      e.preventDefault();
      var i = parseInt($(this).data('set-idx'), 10);
      var R = window._cpRenderers || {};
      if (typeof R.ncwAISuggestAds === 'function' && !isNaN(i)) R.ncwAISuggestAds(i);
    });
    $(document).off('click.ncw-add-set').on('click.ncw-add-set', '[data-action="ncw-add-ad-set"]', function(e) { e.preventDefault(); ncwAddAdSetManual(); });
    $(document).off('click.ncw-add-ad').on('click.ncw-add-ad', '[data-action="ncw-add-ad"]', function(e) {
      e.preventDefault();
      var i = parseInt($(this).data('set-idx'), 10);
      if (!isNaN(i)) ncwAddAdManual(i);
    });
    $(document).off('click.ncw-set-toggle').on('click.ncw-set-toggle', '[data-action="ncw-set-toggle"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var i = parseInt($(this).data('set-idx'), 10);
      var s = (ncwState.ad_sets || [])[i]; if (!s) return;
      s._selected = !s._selected;
      refreshNCW();
    });
    $(document).off('click.ncw-set-delete').on('click.ncw-set-delete', '[data-action="ncw-set-delete"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var i = parseInt($(this).data('set-idx'), 10);
      if (!isNaN(i) && ncwState.ad_sets) {
        ncwState.ad_sets.splice(i, 1);
        refreshNCW();
      }
    });
    $(document).off('click.ncw-ad-toggle').on('click.ncw-ad-toggle', '[data-action="ncw-ad-toggle"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var i = parseInt($(this).data('set-idx'), 10);
      var j = parseInt($(this).data('ad-idx'), 10);
      var s = (ncwState.ad_sets || [])[i]; if (!s || !s.ads || !s.ads[j]) return;
      s.ads[j]._selected = !s.ads[j]._selected;
      refreshNCW();
    });
    $(document).off('click.ncw-ad-delete').on('click.ncw-ad-delete', '[data-action="ncw-ad-delete"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var i = parseInt($(this).data('set-idx'), 10);
      var j = parseInt($(this).data('ad-idx'), 10);
      var s = (ncwState.ad_sets || [])[i]; if (!s || !s.ads) return;
      s.ads.splice(j, 1);
      refreshNCW();
    });
    $(document).off('click.ncw-tab').on('click.ncw-tab', '[data-action="ncw-tab"]', function(e) {
      e.preventDefault();
      var t = parseInt($(this).data('tab'), 10);
      if (!isNaN(t)) { ncwState._activeAdSetTab = t; refreshNCW(); }
    });
    $(document).off('change.ncw-set-field').on('change.ncw-set-field', '[data-ncw-set-field]', function() {
      var i = parseInt($(this).data('set-idx'), 10);
      var field = $(this).data('ncw-set-field');
      var s = (ncwState.ad_sets || [])[i]; if (!s || !field) return;
      s[field] = $(this).val();
    });
    $(document).off('click.cpv2-open-campaign').on('click.cpv2-open-campaign', '[data-action="open-campaign-v2"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var id = $(this).data('id');
      if (id && window._cpNavigateToCampaignV2) window._cpNavigateToCampaignV2(id);
    });
    $(document).off('click.cpv2-edit-campaign').on('click.cpv2-edit-campaign', '[data-action="edit-campaign-v2"]', function(e) {
      e.preventDefault(); e.stopPropagation(); openMetaCampaignModal($(this).data('id'));
    });
    $(document).off('click.cpv2-delete-campaign').on('click.cpv2-delete-campaign', '[data-action="delete-campaign-v2"]', function(e) {
      e.preventDefault(); e.stopPropagation(); confirmDeleteMetaCampaign($(this).data('id'));
    });

    // Ad Set CRUD
    $(document).off('click.cpv2-add-adset').on('click.cpv2-add-adset', '[data-action="ws-add-ad-set"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var campId = $(this).data('campaign-id') || S.selectedCampaignV2Id;
      if (campId) openMetaAdSetModal(campId, { create: true });
    });
    $(document).off('click.cpv2-edit-adset').on('click.cpv2-edit-adset', '[data-action="edit-ad-set"]', function(e) {
      e.preventDefault(); e.stopPropagation(); openMetaAdSetModal($(this).data('id'));
    });
    $(document).off('click.cpv2-delete-adset').on('click.cpv2-delete-adset', '[data-action="delete-ad-set"]', function(e) {
      e.preventDefault(); e.stopPropagation(); confirmDeleteMetaAdSet($(this).data('id'));
    });

    // Ad CRUD
    $(document).off('click.cpv2-add-ad').on('click.cpv2-add-ad', '[data-action="ws-add-ad"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var setId = $(this).data('ad-set-id') || S.selectedAdSetId;
      if (setId) openMetaAdModal(setId, { create: true });
    });
    // "Edit ad" — open the Ad inline in the workspace inspector instead of
    // a modal. The inspector tabs (Hook / Copy / Media / Review) are all
    // inline-editable; the Overview tab is read-only summary.
    $(document).off('click.cpv2-edit-ad').on('click.cpv2-edit-ad', '[data-action="edit-ad"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var adId = $(this).data('id');
      var ad = adId ? getAd(adId) : null;
      var setId = ad ? ad.ad_set_id : null;
      var set = setId ? getAdSet(setId) : null;
      if (ad && set && typeof window._cpNavigateToCampaignV2 === 'function') {
        S.workspaceInspectorTab = 'hook';
        window._cpNavigateToCampaignV2(set.campaign_id, set.id, ad.id);
      } else {
        // Fallback only if navigation context is missing
        if (adId) openMetaAdModal(adId);
      }
    });
    $(document).off('click.cpv2-delete-ad').on('click.cpv2-delete-ad', '[data-action="delete-ad"]', function(e) {
      e.preventDefault(); e.stopPropagation(); confirmDeleteMetaAd($(this).data('id'));
    });

    // Workspace tree selection
    $(document).off('click.cpv2-sel-camp').on('click.cpv2-sel-camp', '[data-action="ws-select-campaign"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id') || S.selectedCampaignV2Id;
      if (!id) return;
      S.selectedAdSetId = null; S.selectedAdId = null;
      navigate('campaign_workspace', { hash: 'campaign/' + id });
    });
    $(document).off('click.cpv2-sel-set').on('click.cpv2-sel-set', '[data-action="ws-select-ad-set"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      var set = id ? getAdSet(id) : null;
      if (!set) return;
      S.selectedAdSetId = id; S.selectedAdId = null;
      navigate('campaign_workspace', { hash: 'campaign/' + set.campaign_id + '/ad_set/' + id });
    });
    $(document).off('click.cpv2-sel-ad').on('click.cpv2-sel-ad', '[data-action="ws-select-ad"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      var ad = id ? getAd(id) : null;
      if (!ad) return;
      var set = getAdSet(ad.ad_set_id);
      S.selectedAdSetId = ad.ad_set_id; S.selectedAdId = id;
      navigate('campaign_workspace', { hash: 'campaign/' + (set ? set.campaign_id : '') + '/ad_set/' + ad.ad_set_id + '/ad/' + id });
    });

    // Tree branch collapse toggle
    $(document).off('click.cpv2-tree-toggle').on('click.cpv2-tree-toggle', '[data-action="ws-toggle-tree"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var id = $(this).data('id');
      if (!id) return;
      S.workspaceTreeCollapsed = S.workspaceTreeCollapsed || {};
      S.workspaceTreeCollapsed[id] = !S.workspaceTreeCollapsed[id];
      render();
    });

    // Meta Campaigns list filters
    $(document).off('input.cpv2-camp-search').on('input.cpv2-camp-search', '#cpCampaignV2Search', debounce(function() {
      S.campaignV2Filter = S.campaignV2Filter || {};
      S.campaignV2Filter.search = $(this).val() || '';
      render();
    }, 250));
    $(document).off('change.cpv2-camp-status').on('change.cpv2-camp-status', '#cpCampaignV2StatusFilter', function() {
      S.campaignV2Filter = S.campaignV2Filter || {};
      S.campaignV2Filter.status = $(this).val();
      render();
    });
    $(document).off('change.cpv2-camp-obj').on('change.cpv2-camp-obj', '#cpCampaignV2ObjectiveFilter', function() {
      S.campaignV2Filter = S.campaignV2Filter || {};
      S.campaignV2Filter.objective = $(this).val();
      render();
    });

    // Modal: chip toggles for Special Ad Categories + placements
    $(document).off('change.cpv2-chip').on('change.cpv2-chip', '.cp-modal-body .cp-chip input[type="checkbox"]', function() {
      var $label = $(this).closest('.cp-chip');
      $label.toggleClass('cp-chip-active', this.checked);
      // Special-case: if "NONE" is being toggled on, clear other categories
      if (this.checked && $(this).hasClass('cp-v2-special-cat') && $(this).data('key') === 'NONE') {
        $('.cp-v2-special-cat').not(this).each(function() {
          this.checked = false; $(this).closest('.cp-chip').removeClass('cp-chip-active');
        });
      }
      // If toggling a non-NONE category on, deselect NONE
      else if (this.checked && $(this).hasClass('cp-v2-special-cat') && $(this).data('key') !== 'NONE') {
        var $none = $('.cp-v2-special-cat[data-key="NONE"]');
        if ($none.is(':checked')) { $none.prop('checked', false); $none.closest('.cp-chip').removeClass('cp-chip-active'); }
      }
    });
    // Ad Set: Advantage Placements toggle hides/shows custom-placements section
    $(document).off('change.cpv2-adv-pl').on('change.cpv2-adv-pl', '.cp-v2-placements-advantage', function() {
      $('.cp-v2-custom-placements').toggle(!this.checked);
    });

    // (Stage 4: AI buttons are now handled in Part 2B — no Part 2A stubs needed.)

    // --- Stage 5: A/B testing ---
    $(document).off('click.cpv2-ab-config').on('click.cpv2-ab-config', '[data-action="ws-ab-config"]', function(e) {
      e.preventDefault(); openABTestConfigModal($(this).data('id'));
    });
    $(document).off('click.cpv2-ab-compare').on('click.cpv2-ab-compare', '[data-action="ws-ab-compare"]', function(e) {
      e.preventDefault(); openCompareVariantsModal($(this).data('id'));
    });
    $(document).off('click.cpv2-ab-mark').on('click.cpv2-ab-mark', '[data-action="ws-mark-ab-winner"]', function(e) {
      e.preventDefault(); setABWinner($(this).data('campaign-id'), $(this).data('set-id'), true);
    });
    $(document).off('click.cpv2-ab-clear').on('click.cpv2-ab-clear', '[data-action="ws-clear-ab-winner"]', function(e) {
      e.preventDefault(); setABWinner($(this).data('campaign-id'), $(this).data('set-id'), false);
    });

    // Stage 2: inspector tab switching
    $(document).off('click.cpv2-set-tab').on('click.cpv2-set-tab', '[data-action="set-inspector-tab"]', function(e) {
      e.preventDefault();
      S.workspaceInspectorTab = $(this).data('tab') || 'overview';
      render();
    });

    // Inline field save (blur for text/textarea; change for select/date)
    $(document).off('blur.cpv2-inline change.cpv2-inline').on('blur.cpv2-inline change.cpv2-inline', '.cp-v2-inline-field', function() {
      var $f = $(this);
      var entityType = $f.data('entity-type');
      var entityId = $f.data('entity-id');
      var field = $f.data('field');
      if (!entityType || !entityId || !field) return;
      var value = $f.val();
      if ($f.attr('type') === 'number') value = (value === '' ? null : Number(value));
      saveEntityField(entityType, entityId, field, value);
      // Auto-status for ads
      if (entityType === 'ad') {
        var ad = getAd(entityId);
        if (ad && typeof maybeAdvanceAdStatus === 'function') maybeAdvanceAdStatus(ad, 'edit');
      }
    });

    // Brief chip toggles (Ad Set message_ids / style_ids / format_ids)
    $(document).off('change.cpv2-brief-id').on('change.cpv2-brief-id', '.cp-v2-brief-id', function() {
      var $f = $(this);
      var field = $f.data('field');               // e.g. 'brief.message_ids'
      var entityId = $f.data('entity-id');
      var itemId = $f.data('id');
      var adSet = getAdSet(entityId);
      if (!adSet || !field) return;
      adSet.brief = adSet.brief || {};
      // Get the array via nested path
      var pathParts = field.split('.');
      var arr = adSet[pathParts[0]][pathParts[1]] || [];
      var idx = arr.indexOf(itemId);
      if (this.checked && idx === -1) arr.push(itemId);
      if (!this.checked && idx > -1)  arr.splice(idx, 1);
      saveEntityField('ad_set', entityId, field, arr);
      // Toggle visual state
      $(this).closest('.cp-chip').toggleClass('cp-chip-active', this.checked);
    });

    // Hook angles add/remove + edit (blur on the input)
    $(document).off('click.cpv2-add-angle').on('click.cpv2-add-angle', '[data-action="ws-add-hook-angle"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      var adSet = getAdSet(id);
      if (!adSet) return;
      adSet.brief = adSet.brief || {};
      adSet.brief.hook_angles = (adSet.brief.hook_angles || []).concat(['']);
      snapshot('Add hook angle');
      saveEntityField('ad_set', id, 'brief.hook_angles', adSet.brief.hook_angles);
    });
    $(document).off('click.cpv2-rm-angle').on('click.cpv2-rm-angle', '[data-action="ws-remove-hook-angle"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id'); var idx = $(this).data('index');
      var adSet = getAdSet(id);
      if (!adSet || !adSet.brief) return;
      adSet.brief.hook_angles = (adSet.brief.hook_angles || []).filter(function(_, i) { return i !== idx; });
      snapshot('Remove hook angle');
      saveEntityField('ad_set', id, 'brief.hook_angles', adSet.brief.hook_angles);
    });
    $(document).off('blur.cpv2-edit-angle').on('blur.cpv2-edit-angle', '.cp-v2-hook-angle', function() {
      var $f = $(this);
      var id = $f.data('entity-id'); var idx = $f.data('index');
      var adSet = getAdSet(id);
      if (!adSet || !adSet.brief) return;
      var angles = adSet.brief.hook_angles || [];
      if (angles[idx] === $f.val()) return;
      angles[idx] = $f.val();
      saveEntityField('ad_set', id, 'brief.hook_angles', angles);
    });

    // AI hook ideas — pick / discard / clear / expand. Lives on
    // `ad.hook.ai_ideas` and is populated by `aiGenerateAdHooks`. Active
    // selection tracked by `ad.hook.active_idea_id`.
    //
    // saveEntityField('ad', id, 'hook', ad.hook) used to short-circuit here
    // because `ad === entity` so the same object reference is passed as
    // value — saveEntityField's identity check (`entity[field] === value`)
    // returned early and never re-rendered, leaving the hook text textarea
    // stale. Mutate directly and call the same buildMaps/sync/render trio
    // that aiGenerateAdHooks uses for its own writes.
    $(document).off('click.cpv2-use-hook-idea').on('click.cpv2-use-hook-idea', '[data-action="ws-use-ad-hook-idea"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      var idx = parseInt($(this).data('idx'), 10);
      var ad = getAd(id); if (!ad || !ad.hook) return;
      var ideas = ad.hook.ai_ideas || [];
      var idea = ideas[idx]; if (!idea) return;
      snapshot('Use AI hook idea');
      ad.hook.text = idea.text;
      ad.hook.type = idea.type || 'direct';
      ad.hook.active_idea_id = idea.id;
      ad.hook.source_message_id = '';
      ad.hook.selected_hook_id = '';
      ad.updated = new Date().toISOString();
      buildMaps(); syncToTextarea(); render();
      if (typeof maybeAdvanceAdStatus === 'function') maybeAdvanceAdStatus(ad, 'AI hook idea');
      logActivity('hook_selected', 'ad', id, ad.name, 'Applied AI hook idea (' + (idea.type || 'direct') + ')');
      toast('Hook applied', 'success');
    });

    $(document).off('click.cpv2-rm-hook-idea').on('click.cpv2-rm-hook-idea', '[data-action="ws-remove-ad-hook-idea"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      var idx = parseInt($(this).data('idx'), 10);
      var ad = getAd(id); if (!ad || !ad.hook) return;
      var ideas = ad.hook.ai_ideas || [];
      var removed = ideas[idx]; if (!removed) return;
      ideas.splice(idx, 1);
      if (ad.hook.active_idea_id === removed.id) ad.hook.active_idea_id = '';
      ad.updated = new Date().toISOString();
      snapshot('Discard hook idea');
      buildMaps(); syncToTextarea(); render();
    });

    $(document).off('click.cpv2-clear-hook-ideas').on('click.cpv2-clear-hook-ideas', '[data-action="ws-clear-ad-hook-ideas"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      var ad = getAd(id); if (!ad || !ad.hook) return;
      if (!(ad.hook.ai_ideas && ad.hook.ai_ideas.length)) return;
      snapshot('Clear hook ideas');
      ad.hook.ai_ideas = [];
      ad.hook.active_idea_id = '';
      ad.updated = new Date().toISOString();
      buildMaps(); syncToTextarea(); render();
    });


    // Expand a collapsed hook idea card without re-rendering — same pattern
    // as the status dropdown toggle, so adjacent inline fields keep focus.
    $(document).off('click.cpv2-toggle-hook-idea').on('click.cpv2-toggle-hook-idea', '[data-action="ws-toggle-hook-idea-expanded"]', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var ideaId = $(this).data('idea-id');
      var $card = $(this).closest('.cp-hook-idea-card[data-idea-id="' + ideaId + '"]');
      if (!$card.length) return;
      $card.removeClass('cp-hook-idea-card-collapsed');
    });

    // AI copy variants — pick / discard. Stored on
    // `ad.creative.ai_copy_variants`; populated by `aiWriteAdCopy` (single
    // draft) or `aiImproveAdCopy` (single refinement). Same bug as the
    // hook handlers: passing `ad.creative` to `saveEntityField` was a
    // no-op because of the identity short-circuit, so the primary_text
    // textarea never refreshed after Use. Mutate + sync + render.
    $(document).off('click.cpv2-use-copy-variant').on('click.cpv2-use-copy-variant', '[data-action="ws-use-ad-copy-variant"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      var idx = parseInt($(this).data('idx'), 10);
      var ad = getAd(id); if (!ad || !ad.creative) return;
      var variants = ad.creative.ai_copy_variants || [];
      var v = variants[idx]; if (!v) return;
      snapshot('Apply AI copy variant');
      ad.creative.primary_text = v.text;
      ad.creative.ai_copy_variants = [];
      ad.updated = new Date().toISOString();
      buildMaps(); syncToTextarea(); render();
      if (typeof maybeAdvanceAdStatus === 'function') maybeAdvanceAdStatus(ad, 'AI copy variant');
      logActivity('content_applied', 'ad', id, ad.name, 'Applied AI ' + (v.source || 'write') + ' variant to primary text');
      toast('Copy applied', 'success');
    });

    $(document).off('click.cpv2-rm-copy-variant').on('click.cpv2-rm-copy-variant', '[data-action="ws-remove-ad-copy-variant"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      var idx = parseInt($(this).data('idx'), 10);
      var ad = getAd(id); if (!ad || !ad.creative) return;
      var variants = ad.creative.ai_copy_variants || [];
      if (idx < 0 || idx >= variants.length) return;
      variants.splice(idx, 1);
      ad.updated = new Date().toISOString();
      snapshot('Discard copy variant');
      buildMaps(); syncToTextarea(); render();
    });

    // Pull a hook from a library message into an Ad (also captures snapshot)
    $(document).off('click.cpv2-pull-hook').on('click.cpv2-pull-hook', '[data-action="ws-pull-hook"]', function(e) {
      e.preventDefault();
      var adId = $(this).data('ad-id');
      var msgId = $(this).data('message-id');
      var hookId = $(this).data('hook-id');
      var ad = getAd(adId);
      var msg = getMessage(msgId);
      if (!ad || !msg) return;
      var hook = (msg.hooks || []).find(function(h) { return h.id === hookId; });
      if (!hook) return;
      snapshot('Pull hook from message');
      ad.hook = ad.hook || {};
      ad.hook.text = hook.text;
      ad.hook.type = hook.type || 'direct';
      ad.hook.source_message_id = msg.id;
      ad.hook.selected_hook_id = hook.id;
      // Capture message snapshot
      ad.message_snapshot = {
        captured_at: new Date().toISOString(),
        source_id: msg.id,
        source_updated: msg.updated || msg.created || '',
        title: msg.title || '',
        body: msg.body || '',
        funnel_stages: (msg.funnel_stages || []).slice(),
        hook_snapshot: { id: hook.id, text: hook.text, type: hook.type || 'direct' }
      };
      ad.updated = new Date().toISOString();
      if (typeof maybeAdvanceAdStatus === 'function') maybeAdvanceAdStatus(ad, 'hook pulled');
      buildMaps(); syncToTextarea(); render();
      toast('Hook pulled from "' + msg.title + '"', 'success');
    });

    // Re-sync persona snapshot (stage 3 surfaces the button)
    $(document).off('click.cpv2-resync-persona').on('click.cpv2-resync-persona', '[data-action="resync-persona-snapshot"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      var adSet = getAdSet(id);
      if (!adSet || !adSet.persona_id) return;
      var persona = getPersona(adSet.persona_id);
      if (!persona) return;
      snapshot('Re-sync persona snapshot');
      adSet.persona_snapshot = buildPersonaSnapshot(persona);
      adSet.updated = new Date().toISOString();
      logActivity('snapshot_resynced', 'ad_set', adSet.id, adSet.name, 'Re-synced persona snapshot from library');
      buildMaps(); syncToTextarea(); render();
      toast('Persona snapshot re-synced', 'success');
    });

    // Ad creative-type switch (media tab segmented control)
    $(document).off('change.cpv2-mediatype').on('change.cpv2-mediatype', '.cp-v2-media-type-switch', function() {
      var id = $(this).data('entity-id');
      var val = $(this).val();
      saveEntityField('ad', id, 'creative_type', val);
    });

    // Reset ad.media so the creative-type selector unlocks. Wipes all
    // image / video / carousel content for the ad. Triggered from the
    // Overview Configuration card's "Reset" button when media is touched.
    $(document).off('click.cpv2-reset-ctype').on('click.cpv2-reset-ctype', '[data-action="ws-ad-reset-creative-type"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      openConfirmDialog({
        title: 'Reset creative type',
        message: 'This clears all media work on this ad (image prompt, video script, carousel cards) so you can switch creative type. Continue?',
        confirmLabel: 'Clear media',
        danger: true,
        onConfirm: function() {
          var ad = getAd(id); if (!ad) return;
          var prevType = ad.creative_type;
          snapshot('Reset creative type');
          ad.media = {};
          saveEntityField('ad', id, 'media', {});
          if (typeof logActivity === 'function') {
            logActivity('media_reset', 'ad', id, ad.name, 'Cleared media for ' + (prevType || 'ad') + ' to switch creative type');
          }
        }
      });
    });

    // Ad pipeline status setter — dropdown items in the persistent inspector
    // header. Manual override; can move forward or backward. Activity log is
    // written by saveEntityField (status changes are tracked in 22-crud-helpers).
    $(document).off('click.cpv2-set-ad-status').on('click.cpv2-set-ad-status', '[data-action="ws-set-ad-status"]', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var id = $(this).data('id');
      var status = $(this).data('status');
      saveEntityField('ad', id, 'pipeline_status', status);
    });

    // Inspector header status dropdown — show/hide without re-rendering so we
    // don't blow away focus on the inline name input next to it.
    $(document).off('click.cpv2-status-dd-toggle').on('click.cpv2-status-dd-toggle', '[data-action="ws-status-dropdown-toggle"]', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var $dd = $(this).closest('.cp-status-dropdown');
      var willOpen = !$dd.hasClass('cp-status-dropdown-open');
      $('.cp-status-dropdown.cp-status-dropdown-open').not($dd).removeClass('cp-status-dropdown-open');
      $dd.toggleClass('cp-status-dropdown-open', willOpen);
      $(this).attr('aria-expanded', willOpen ? 'true' : 'false');
    });

    // Close any open status dropdown when clicking outside it.
    $(document).off('click.cpv2-status-dd-outside').on('click.cpv2-status-dd-outside', function(e) {
      if ($(e.target).closest('.cp-status-dropdown').length) return;
      $('.cp-status-dropdown.cp-status-dropdown-open').removeClass('cp-status-dropdown-open')
        .find('[data-action="ws-status-dropdown-toggle"]').attr('aria-expanded', 'false');
    });

    // Video script sections — each section is a { label, script } block. Old
    // ads with `script.rows` are auto-folded into a single section on first
    // edit (the renderer materialises them; writes always target `sections`).
    function _ensureScriptSections(ad) {
      ad.media = ad.media || {};
      ad.media.video = ad.media.video || {};
      ad.media.video.script = ad.media.video.script || {};
      if (!ad.media.video.script.sections) {
        var derived = (typeof getAdVideoScriptSections === 'function')
          ? getAdVideoScriptSections(ad.media.video).map(function(s) { return { label: s.label || '', script: s.script || '' }; })
          : [];
        ad.media.video.script.sections = derived;
      }
      return ad.media.video.script.sections;
    }

    $(document).off('click.cpv2-add-section').on('click.cpv2-add-section', '[data-action="ws-ad-add-script-section"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      var ad = getAd(id); if (!ad) return;
      var sections = _ensureScriptSections(ad);
      sections.push({ label: '', script: '' });
      snapshot('Add script section');
      saveEntityField('ad', id, 'media.video.script.sections', sections);
    });
    $(document).off('click.cpv2-rm-section').on('click.cpv2-rm-section', '[data-action="ws-ad-remove-script-section"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id'); var idx = parseInt($(this).data('index'), 10);
      var ad = getAd(id); if (!ad) return;
      var sections = _ensureScriptSections(ad);
      if (idx < 0 || idx >= sections.length) return;
      sections.splice(idx, 1);
      snapshot('Remove script section');
      saveEntityField('ad', id, 'media.video.script.sections', sections);
    });
    $(document).off('click.cpv2-mv-section').on('click.cpv2-mv-section', '[data-action="ws-ad-move-script-section"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id'); var idx = parseInt($(this).data('index'), 10); var dir = parseInt($(this).data('dir'), 10);
      var ad = getAd(id); if (!ad) return;
      var sections = _ensureScriptSections(ad);
      var newIdx = idx + dir;
      if (idx < 0 || idx >= sections.length || newIdx < 0 || newIdx >= sections.length) return;
      var moved = sections.splice(idx, 1)[0];
      sections.splice(newIdx, 0, moved);
      snapshot('Reorder script section');
      saveEntityField('ad', id, 'media.video.script.sections', sections);
    });
    $(document).off('blur.cpv2-section-field change.cpv2-section-field').on('blur.cpv2-section-field change.cpv2-section-field', '.cp-v2-script-section-field', function() {
      var $f = $(this);
      var id = $f.data('entity-id'); var idx = parseInt($f.data('index'), 10); var key = $f.data('key');
      var ad = getAd(id); if (!ad) return;
      var sections = _ensureScriptSections(ad);
      if (!sections[idx]) return;
      if (sections[idx][key] === $f.val()) return;
      sections[idx][key] = $f.val();
      saveEntityField('ad', id, 'media.video.script.sections', sections);
    });

    // --- Stage 3: Library ↔ Workspace integration ---

    // Open an Ad Set in the workspace (from a library usage row)
    $(document).off('click.cpv2-lib-open-set').on('click.cpv2-lib-open-set', '[data-action="lib-open-ad-set"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      var campaignId = $(this).data('campaign-id');
      if (!id || !campaignId) return;
      window._cpNavigateToCampaignV2(campaignId, id);
    });
    // Open an Ad in the workspace
    $(document).off('click.cpv2-lib-open-ad').on('click.cpv2-lib-open-ad', '[data-action="lib-open-ad"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      var ad = id ? getAd(id) : null;
      if (!ad) return;
      var set = getAdSet(ad.ad_set_id);
      if (!set) return;
      window._cpNavigateToCampaignV2(set.campaign_id, set.id, ad.id);
    });

    // Create Ad Set from a library Persona. Opens a chooser if multiple
    // campaigns exist; otherwise opens the modal pre-populated.
    $(document).off('click.cpv2-lib-create-set').on('click.cpv2-lib-create-set', '[data-action="lib-create-ad-set-from-persona"]', function(e) {
      e.preventDefault();
      var personaId = $(this).data('id');
      var camps = getAllCampaignsV2();
      if (camps.length === 0) {
        // No campaigns yet — prompt to create one first
        toast('Create a Campaign first, then add Ad Sets to it', 'info');
        navigate('meta_campaigns');
        return;
      }
      if (camps.length === 1) {
        // Single campaign: open Ad Set modal under it, pre-pop persona
        openMetaAdSetModalWithPersona(camps[0].id, personaId);
        return;
      }
      // Multiple campaigns: show a quick picker
      openCampaignPickerForAdSet(personaId);
    });

    // Attach a library Message / Style / Format to an Ad Set's brief.
    // Opens a picker showing all Ad Sets across all campaigns.
    $(document).off('click.cpv2-lib-attach').on('click.cpv2-lib-attach', '[data-action="lib-attach-to-ad-set-brief"]', function(e) {
      e.preventDefault();
      var type = $(this).data('type');  // 'message' | 'style' | 'visual_format'
      var id = $(this).data('id');
      openAdSetBriefAttachPicker(type, id);
    });

    // Carousel cards
    $(document).off('click.cpv2-add-card').on('click.cpv2-add-card', '[data-action="ws-ad-add-card"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      var ad = getAd(id); if (!ad) return;
      ad.media = ad.media || {};
      ad.media.carousel_cards = ad.media.carousel_cards || [];
      ad.media.carousel_cards.push({ image_asset_id: '', prompt: '', caption: '' });
      snapshot('Add carousel card');
      saveEntityField('ad', id, 'media.carousel_cards', ad.media.carousel_cards);
    });
    $(document).off('click.cpv2-rm-card').on('click.cpv2-rm-card', '[data-action="ws-ad-remove-card"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id'); var idx = $(this).data('index');
      var ad = getAd(id); if (!ad) return;
      var arr = ad.media.carousel_cards || [];
      arr.splice(idx, 1);
      snapshot('Remove carousel card');
      saveEntityField('ad', id, 'media.carousel_cards', arr);
    });
    $(document).off('blur.cpv2-card-field').on('blur.cpv2-card-field', '.cp-v2-card-field', function() {
      var $f = $(this);
      var id = $f.data('entity-id'); var idx = $f.data('index'); var key = $f.data('key');
      var ad = getAd(id); if (!ad || !ad.media) return;
      var arr = ad.media.carousel_cards || [];
      if (!arr[idx]) return;
      if (arr[idx][key] === $f.val()) return;
      arr[idx][key] = $f.val();
      saveEntityField('ad', id, 'media.carousel_cards', arr);
    });
  }


/* ===== src/20-part2a/28-exports.js ===== */
  // ============================================================
  // SECTION 20: API EXPORTS
  // ============================================================

  window._cpPart2A = {
    // Modal system
    snapshot: snapshot, undo: undo, redo: redo,
    openModal: openModal, closeModal: closeModal,
    openConfirmDialog: openConfirmDialog, closeConfirmDialog: closeConfirmDialog,
    collectModalFields: collectModalFields, collectFunnelChips: collectFunnelChips,

    // Category CRUD
    openCategoryModal: openCategoryModal, confirmDeleteCategory: confirmDeleteCategory,

    // Persona CRUD
    openPersonaModal: openPersonaModal, confirmDeletePersona: confirmDeletePersona,

    // Pain Point CRUD
    openPainPointModal: openPainPointModal, confirmDeletePainPoint: confirmDeletePainPoint,

    // Message CRUD
    openMessageModal: openMessageModal, confirmDeleteMessage: confirmDeleteMessage,
    addHookRow: addHookRow, removeHookRow: removeHookRow,

    // Style & Format CRUD
    openStyleModal: openStyleModal, confirmDeleteStyle: confirmDeleteStyle,
    openFormatModal: openFormatModal, confirmDeleteFormat: confirmDeleteFormat,

    // Meta v2 CRUD
    openMetaCampaignModal: openMetaCampaignModal, confirmDeleteMetaCampaign: confirmDeleteMetaCampaign,
    openMetaAdSetModal: openMetaAdSetModal, confirmDeleteMetaAdSet: confirmDeleteMetaAdSet,
    openMetaAdModal: openMetaAdModal, openMetaAdQuickCreate: openMetaAdQuickCreate, confirmDeleteMetaAd: confirmDeleteMetaAd,
    buildPersonaSnapshot: buildPersonaSnapshot,
    // A/B testing
    openABTestConfigModal: openABTestConfigModal,
    openCompareVariantsModal: openCompareVariantsModal,
    setABWinner: setABWinner,

    // Tag CRUD
    openTagModal: openTagModal, confirmDeleteTag: confirmDeleteTag,

    // Tag Input
    renderTagInput: renderTagInput,

    // Setup Wizard
    openSetupWizard: openSetupWizard,
    maybeAutoLaunchSetupWizard: maybeAutoLaunchSetupWizard,
    refreshSetupWizard: refreshSetupWizard,
    setupWizardState: setupWizardState,
    swClearSession: swClearSession,
    swCancelAIGeneration: swCancelAIGeneration,
    swRetryStep: swRetryStep,
    swRelTime: _swRelTime,
    // Chaining signals used by Part 2B after each generator success
    _swAfterPersonasGenerated:   _swAfterPersonasGenerated,
    _swAfterPainPointsGenerated: _swAfterPainPointsGenerated,
    _swAfterStageGenerated:      _swAfterStageGenerated,

    // New Campaign Wizard
    openNewCampaignWizard: openNewCampaignWizard,
    refreshNCW: refreshNCW,
    ncwState: ncwState
  };

  console.log('[CP] Part 2A loaded');

})(jQuery, Drupal);

/* ===== src/30-part2b/00-header.js ===== */
/**
 * Campaign Planner v1.0 - Part 2B: AI & Advanced Features
 *
 * Multi-provider AI (LLMService), brand context (BrandService),
 * AI research panel component, inline AI assist, 11 AI action functions,
 * Research Lab view, Settings view (6 tabs), Import/Export.
 *
 * Registry: researchView, settingsView,
 *   setupResearchEvents, setupSettingsEvents
 *
 * Sections:
 *  1. Init & imports
 *  2. LLMService (multi-provider AI)
 *  3. BrandService (brand context from Drupal)
 *  4. AI response parsing
 *  5. Brand & recipe prompt helpers
 *  6. AI retry wrapper
 *  7. AI Research Panel component
 *  8. Inline AI Assist component
 *  9. AI Status Indicator
 * 10. AI — Persona research
 * 11. AI — Pain point research
 * 12. AI — Message research
 * 13. AI — Style & format research
 * 14. AI — Recipe content
 * 15. AI — Recipe media
 * 16. Research Lab view
 * 17. Settings view (6 tabs)
 * 18. Config CRUD & settings save
 * 19. Import/Export
 * 22. Events & keyboard shortcuts
 * 23. API exports
 *
 * @version 1.0.0
 */
(function($, Drupal) {
  'use strict';


/* ===== src/30-part2b/01-init-imports.js ===== */
  // ============================================================
  // SECTION 1: INIT & IMPORTS
  // ============================================================

  var S, render, navigate, toast, generateId, buildMaps, syncToTextarea, esc, deepClone, icon;
  var formatDate, formatRelativeTime, formatNumber, truncate, logActivity;
  var stripHtml, countWords, countChars;
  var badge, priorityBadge;
  var funnelBadge, dimensionBadge, mediaTypeBadge, hookTypeBadge, progressBar;
  var createEntity, deleteEntity, saveEntityField, duplicateEntity;
  var getAllPersonas, getAllMessages, getAllStyles, getAllFormats;
  var getAllCategories, getAllPainPoints, getAllTags;
  var getPersonaPainPoints, getPersona, getMessage, getStyle, getFormat;
  var getCategory, getTag, getPainPoint, getFunnelStage;
  var isSetupComplete;
  var getProductionStatusStyle, parseProductionData;
  var Constants;
  var snapshot, openModal, closeModal, openConfirmDialog, closeConfirmDialog, collectModalFields;
  var collectFunnelChips, renderTagInput;
  // Meta v2 (Stage 4 imports)
  var getCampaignV2, getAdSet, getAd;
  var getAllCampaignsV2, getAllAdSets, getAllAds;
  var getAdSetsByCampaign, getAdsByAdSet, getAdsByCampaign;
  var buildPersonaSnapshot, maybeAdvanceAdStatus;

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
    badge = window._cpBadge;
    priorityBadge = window._cpPriorityBadge;
    funnelBadge = window._cpFunnelBadge; dimensionBadge = window._cpDimensionBadge;
    mediaTypeBadge = window._cpMediaTypeBadge; hookTypeBadge = window._cpHookTypeBadge;
    progressBar = window._cpProgressBar; Constants = window._cpConstants;
    createEntity = window._cpCreateEntity; deleteEntity = window._cpDeleteEntity;
    saveEntityField = window._cpSaveEntityField; duplicateEntity = window._cpDuplicateEntity;
    getAllPersonas = window._cpGetAllPersonas; getAllMessages = window._cpGetAllMessages;
    getAllStyles = window._cpGetAllStyles; getAllFormats = window._cpGetAllFormats;
    getAllCategories = window._cpGetAllCategories; getAllPainPoints = window._cpGetAllPainPoints;
    getAllTags = window._cpGetAllTags;
    getPersonaPainPoints = window._cpGetPersonaPainPoints;
    getPersona = window._cpGetPersona; getMessage = window._cpGetMessage;
    getStyle = window._cpGetStyle; getFormat = window._cpGetFormat;
    getCategory = window._cpGetCategory;
    getTag = window._cpGetTag; getPainPoint = window._cpGetPainPoint;
    getFunnelStage = window._cpGetFunnelStage;
    getProductionStatusStyle = window._cpGetProductionStatusStyle;
    parseProductionData = window._cpParseProductionData;
    isSetupComplete = window._cpIsSetupComplete;

    if (!S) { console.error('[CP] Part 2B: State not available'); return; }
    if (!render) { console.error('[CP] Part 2B: render not available'); return; }

    // Part 2A imports
    var P2A = window._cpPart2A;
    if (!P2A) { console.error('[CP] Part 2B: Part 2A exports not found'); return; }
    snapshot = P2A.snapshot; openModal = P2A.openModal; closeModal = P2A.closeModal;
    openConfirmDialog = P2A.openConfirmDialog; closeConfirmDialog = P2A.closeConfirmDialog;
    collectModalFields = P2A.collectModalFields; collectFunnelChips = P2A.collectFunnelChips;
    renderTagInput = P2A.renderTagInput;
    buildPersonaSnapshot = P2A.buildPersonaSnapshot;
    // Meta v2 helpers from Part 1
    getCampaignV2 = window._cpGetCampaignV2; getAdSet = window._cpGetAdSet; getAd = window._cpGetAd;
    getAllCampaignsV2 = window._cpGetAllCampaignsV2; getAllAdSets = window._cpGetAllAdSets; getAllAds = window._cpGetAllAds;
    getAdSetsByCampaign = window._cpGetAdSetsByCampaign; getAdsByAdSet = window._cpGetAdsByAdSet; getAdsByCampaign = window._cpGetAdsByCampaign;
    maybeAdvanceAdStatus = window._cpMaybeAdvanceAdStatus;

    // Register view renderers
    var R = window._cpRenderers = window._cpRenderers || {};
    R.researchView = renderResearchView;
    R.setupResearchEvents = setupResearchEvents;
    R.settingsView = renderSettingsView;
    R.setupSettingsEvents = setupSettingsEvents;
    R.aiResearchPanel = renderAIResearchPanelBody;
    // Setup Wizard AI generators
    R.swAIGeneratePersonas       = swAIGeneratePersonas;
    R.swAIGeneratePainPoints     = swAIGeneratePainPoints;
    R.swAIGenerateMessages       = swAIGenerateMessages;
    R.swAIGenerateStylesFormats  = swAIGenerateStylesFormats;
    R.swAIGenerateCampaignIdeas  = swAIGenerateCampaignIdeas;
    // Setup Wizard finalize
    R.finalizeSetupWizard        = finalizeSetupWizard;
    // New Campaign Wizard AI + finalize
    R.ncwAIDraftCampaign         = ncwAIDraftCampaign;
    R.ncwAISuggestAdSets         = ncwAISuggestAdSets;
    R.ncwAISuggestAds            = ncwAISuggestAds;
    R.finalizeNewCampaignWizard  = finalizeNewCampaignWizard;

    try { setupPart2BEvents(); } catch(e) { console.error('[CP] setupPart2BEvents crashed:', e); }
    try { setupKeyboardShortcuts(); } catch(e) { console.error('[CP] setupKeyboardShortcuts crashed:', e); }
    try { LLMService.init(); } catch(e) { console.error('[CP] LLMService.init crashed:', e); }
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
    console.log('[CP] Part 2B initialized — renderers: research, settings');
    } catch(e) {
      console.error('[CP] Part 2B init FAILED:', e.message, e.stack);
      if (window._cpToast) window._cpToast('Part 2B init error: ' + e.message, 'error');
    }
  }


/* ===== src/30-part2b/02-llm-service.js ===== */
  // ============================================================
  // SECTION 2: LLMService
  // ============================================================

  var AI_ENDPOINTS = {
    'gemini': 'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent',
    'claude': 'https://api.anthropic.com/v1/messages',
    'openai': 'https://api.openai.com/v1/chat/completions',
    'grok': 'https://api.x.ai/v1/chat/completions',
    'groq': 'https://api.groq.com/openai/v1/chat/completions',
    'nvidia': 'https://integrate.api.nvidia.com/v1/chat/completions',
    'huggingface': 'https://router.huggingface.co/v1/chat/completions',
    'openrouter': 'https://openrouter.ai/api/v1/chat/completions'
  };

  var LLMService = (function() {
    var _config = null, _providerMap = {}, _initialized = false;

    function init() {
      _config = null; _providerMap = {};
      var $brand = $('.llm-brand-config-data'), $user = $('.llm-config-data'), raw = null;
      if ($brand.length) {
        console.log('[CP] LLMService: .llm-brand-config-data found');
        try { raw = JSON.parse($brand.text().trim()); } catch(e) { console.warn('[CP] LLMService: Brand config parse failed:', e.message); }
      }
      if (!raw && $user.length) {
        console.log('[CP] LLMService: .llm-config-data found');
        try { raw = JSON.parse($user.text().trim()); } catch(e) { console.warn('[CP] LLMService: User config parse failed:', e.message); }
      }
      if (!raw) console.warn('[CP] LLMService: No LLM config found — AI unavailable');
      _config = raw;
      if (_config && _config.providers) {
        for (var i = 0; i < _config.providers.length; i++) {
          var p = _config.providers[i];
          if (!p.active) continue;
          var activeModels = (p.models || []).filter(function(m) { return m.active; });
          if (!activeModels.length) continue;
          _providerMap[p.id] = { id: p.id, label: p.label || p.id, api_key: p.api_key || '', activeModels: activeModels };
          console.log('[CP] LLMService: Provider "' + p.label + '" → ' + activeModels.length + ' model(s)');
        }
      }
      _initialized = true;
      var pids = Object.keys(_providerMap);
      if (pids.length > 0) {
        var def = getDefault();
        console.log('[CP] LLMService: ' + pids.length + ' active provider(s). Default: ' + (def ? def.provider + '/' + def.model : 'none'));
      } else {
        console.warn('[CP] LLMService: No active providers');
      }
    }

    function isConfigured() { return Object.keys(_providerMap).length > 0; }
    function getActiveProviders() { return Object.keys(_providerMap).map(function(id) { return _providerMap[id]; }); }
    function getActiveModels(providerId) { var p = _providerMap[providerId]; return p ? p.activeModels : []; }

    function _getModelObj(pid, mid) { var p = _providerMap[pid]; if (!p) return null; for (var i = 0; i < p.activeModels.length; i++) { if (p.activeModels[i].id === mid) return p.activeModels[i]; } return null; }
    function _buildSel(pid, model) { return { provider: pid, model: model.id, temperature: model.temperature !== undefined ? model.temperature : 1.0, max_tokens: model.max_tokens || 8192, top_p: model.top_p !== undefined ? model.top_p : 0.95, api_key: _providerMap[pid] ? _providerMap[pid].api_key : '' }; }

    function getDefault() {
      var provs = getActiveProviders(); if (!provs.length) return null;
      var appDef = S && S.meta && S.meta.aiPreferences && S.meta.aiPreferences.appDefault;
      if (appDef && appDef.provider && appDef.model) {
        var ma = _getModelObj(appDef.provider, appDef.model);
        if (ma) return _buildSel(appDef.provider, ma);
        // Graceful degradation: user picked a provider but the exact model is no
        // longer active (renamed / deactivated). Keep the provider, fall back
        // to its first active model — don't silently jump to a different provider.
        var pSame = _providerMap[appDef.provider];
        if (pSame && pSame.activeModels.length) {
          console.warn('[CP] LLMService: saved default model "' + appDef.model + '" is not active for provider "' + appDef.provider + '". Using first active model for that provider.');
          return _buildSel(appDef.provider, pSame.activeModels[0]);
        }
        console.warn('[CP] LLMService: saved default provider "' + appDef.provider + '" is no longer active. Using config or first provider.');
      }
      if (_config && _config.default_provider && _config.default_model) { var m = _getModelObj(_config.default_provider, _config.default_model); if (m) return _buildSel(_config.default_provider, m); }
      var p = provs[0]; var defM = null;
      for (var i = 0; i < p.activeModels.length; i++) { if (p.activeModels[i].is_default) { defM = p.activeModels[i]; break; } }
      return _buildSel(p.id, defM || p.activeModels[0]);
    }

    function resolveSelection(actionId) {
      var prefs = S.meta.aiPreferences || {};
      var pa = (prefs.perAction || {})[actionId || ''];
      if (pa && pa.provider && pa.model) { var m = _getModelObj(pa.provider, pa.model); if (m) return _buildSel(pa.provider, m); }
      if (prefs.lastProvider && prefs.lastModel) { var m2 = _getModelObj(prefs.lastProvider, prefs.lastModel); if (m2) return _buildSel(prefs.lastProvider, m2); }
      return getDefault();
    }

    function savePreference(actionId, pid, mid) {
      S.meta.aiPreferences = S.meta.aiPreferences || {};
      S.meta.aiPreferences.perAction = S.meta.aiPreferences.perAction || {};
      S.meta.aiPreferences.lastProvider = pid; S.meta.aiPreferences.lastModel = mid;
      if (actionId) S.meta.aiPreferences.perAction[actionId] = { provider: pid, model: mid };
      syncToTextarea();
    }

    function renderInlinePicker(actionId) {
      if (!isConfigured()) return '<span class="cp-ai-not-configured" title="Configure AI in your user profile">' + icon('warning') + ' <a href="#" data-action="go-view" data-view="settings" class="cp-ai-config-link">Configure AI</a></span>';
      var sel = resolveSelection(actionId); var provs = getActiveProviders();
      var html = '<span class="cp-ai-picker" data-action-id="' + esc(actionId) + '">';
      html += '<select class="cp-select cp-select-sm cp-ai-provider-select" data-action-id="' + esc(actionId) + '">';
      for (var i = 0; i < provs.length; i++) html += '<option value="' + esc(provs[i].id) + '"' + (sel && sel.provider === provs[i].id ? ' selected' : '') + '>' + esc(provs[i].label) + '</option>';
      html += '</select>';
      var curProv = sel ? _providerMap[sel.provider] : provs[0]; var models = curProv ? curProv.activeModels : [];
      html += '<select class="cp-select cp-select-sm cp-ai-model-select" data-action-id="' + esc(actionId) + '">';
      for (var j = 0; j < models.length; j++) html += '<option value="' + esc(models[j].id) + '"' + (sel && sel.model === models[j].id ? ' selected' : '') + ' data-temp="' + (models[j].temperature !== undefined ? models[j].temperature : 1.0) + '" data-tokens="' + (models[j].max_tokens || 8192) + '">' + esc(models[j].label) + '</option>';
      html += '</select></span>';
      return html;
    }

    function _getPickerSel(actionId) {
      var $p = $('.cp-ai-provider-select[data-action-id="' + actionId + '"]');
      if (!$p.length) return resolveSelection(actionId);
      var pid = $p.val(), mid = $('.cp-ai-model-select[data-action-id="' + actionId + '"]').val();
      var $opt = $('.cp-ai-model-select[data-action-id="' + actionId + '"] option:selected');
      return { provider: pid, model: mid, temperature: parseFloat($opt.data('temp')) || 1.0, max_tokens: parseInt($opt.data('tokens'), 10) || 8192, top_p: 0.95, api_key: _providerMap[pid] ? _providerMap[pid].api_key : '' };
    }

    var _inFlight = {}; // actionId -> AbortController
    var AI_TIMEOUT_MS = 60000;

    function callAI(prompt, onSuccess, onError, actionId, systemPrompt) {
      var cfg = _getPickerSel(actionId || '');
      if (!cfg || !cfg.api_key) { if (onError) onError('No AI providers configured.'); return; }

      // Throttle: cancel any in-flight request for this actionId before starting a new one
      if (actionId && _inFlight[actionId]) {
        try { _inFlight[actionId].abort(); } catch(e) {}
        delete _inFlight[actionId];
      }

      var provider = cfg.provider, model = cfg.model, apiKey = cfg.api_key;
      var endpoint = AI_ENDPOINTS[provider]; if (!endpoint) { if (onError) onError('Unknown provider'); return; }
      systemPrompt = systemPrompt || '';
      var body, headers;
      switch (provider) {
        case 'gemini':
          endpoint = endpoint.replace('{MODEL}', model) + '?key=' + apiKey;
          headers = { 'Content-Type': 'application/json' };
          body = { contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: cfg.max_tokens, temperature: cfg.temperature, topP: cfg.top_p, responseMimeType: 'application/json' } };
          if (systemPrompt) body.system_instruction = { parts: [{ text: systemPrompt }] };
          break;
        case 'claude':
          headers = { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' };
          body = { model: model, max_tokens: cfg.max_tokens, messages: [{ role: 'user', content: prompt }] };
          if (cfg.temperature !== undefined) body.temperature = cfg.temperature;
          if (systemPrompt) body.system = systemPrompt;
          break;
        default:
          headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey };
          if (provider === 'openrouter') { headers['HTTP-Referer'] = window.location.origin; headers['X-Title'] = 'Campaign Planner'; }
          body = { model: model, max_tokens: cfg.max_tokens, messages: [{ role: 'user', content: prompt }], temperature: cfg.temperature };
          if (systemPrompt) body.messages = [{ role: 'system', content: systemPrompt }].concat(body.messages);
          if (provider === 'groq' && body.temperature === 0) body.temperature = 0.01;
      }

      // Abort controller for timeout + cancellation
      var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      if (actionId && controller) _inFlight[actionId] = controller;
      var timeoutId = controller ? setTimeout(function() {
        controller.abort();
        if (actionId) delete _inFlight[actionId];
        if (onError) onError('Request timed out after ' + (AI_TIMEOUT_MS / 1000) + ' seconds. Please try again.');
      }, AI_TIMEOUT_MS) : null;

      var fetchOpts = { method: 'POST', headers: headers, body: JSON.stringify(body) };
      if (controller) fetchOpts.signal = controller.signal;

      fetch(endpoint, fetchOpts)
        .then(function(res) { if (!res.ok) return res.text().then(function(t) { var m = 'API ' + res.status; try { m = JSON.parse(t).error.message || m; } catch(e) {} throw new Error(m); }); return res.json(); })
        .then(function(data) {
          if (timeoutId) clearTimeout(timeoutId);
          if (actionId) delete _inFlight[actionId];
          var text = _extractText(provider, data);
          console.log('[CP] AI (' + provider + '/' + model + '):', text.substring(0, 200));
          if (actionId) savePreference(actionId, provider, model);
          if (onSuccess) onSuccess(text);
        })
        .catch(function(err) {
          if (timeoutId) clearTimeout(timeoutId);
          if (actionId) delete _inFlight[actionId];
          if (err && err.name === 'AbortError') return; // timeout or user-cancelled — already handled
          console.error('[CP] AI error:', err);
          if (onError) onError(err.message || 'Request failed');
        });
    }

    function _extractText(provider, data) {
      try {
        if (provider === 'gemini') { return data.candidates && data.candidates[0] && data.candidates[0].content ? data.candidates[0].content.parts.map(function(p) { return p.text || ''; }).join('') : JSON.stringify(data); }
        if (provider === 'claude') return data.content ? data.content.filter(function(c) { return c.type === 'text'; }).map(function(c) { return c.text; }).join('') : '';
        return (data.choices && data.choices[0] && data.choices[0].message) ? data.choices[0].message.content || '' : '';
      } catch(e) { return JSON.stringify(data); }
    }

    function abortAction(actionId) {
      if (!actionId || !_inFlight[actionId]) return false;
      try { _inFlight[actionId].abort(); } catch(e) {}
      delete _inFlight[actionId];
      return true;
    }

    return { init: init, isConfigured: isConfigured, getActiveProviders: getActiveProviders, getActiveModels: getActiveModels, getDefault: getDefault, resolveSelection: resolveSelection, savePreference: savePreference, renderInlinePicker: renderInlinePicker, callAI: callAI, abortAction: abortAction };
  })();


/* ===== src/30-part2b/03-brand-service.js ===== */
  // ============================================================
  // SECTION 3: BrandService
  // ============================================================

  var BrandService = (function() {
    var _parsed = {}, _identity = { name: '', id: '', logoUrl: '' }, _raw = {};
    var CONTEXT_DIVS = { core: '.brand-core-data', video: '.brand-video-data', content: '.brand-content-data', seo: '.brand-seo-data', social: '.brand-social-data' };

    function init() {
      _parsed = {}; _raw = {};
      var $wrap = $('.brand-data');
      if ($wrap.length) {
        _identity = { name: ($wrap.find('.brand-name').text() || '').trim(), id: ($wrap.find('.brand-id').text() || '').trim(), logoUrl: ($wrap.find('.brand-logo-url').text() || '').trim() };
      }
      for (var type in CONTEXT_DIVS) {
        var $div = $(CONTEXT_DIVS[type]);
        if ($div.length) { var text = $div.text().trim(); if (text) { _raw[type] = text; try { _parsed[type] = JSON.parse(text); } catch(e) { _parsed[type] = null; } } }
      }
      S.brand = { configured: Object.keys(_parsed).filter(function(k) { return _parsed[k]; }).length > 0, identity: _identity, core: _parsed.core || null, video: _parsed.video || null, content: _parsed.content || null, seo: _parsed.seo || null, social: _parsed.social || null };
      console.log('[CP] BrandService: ' + (_identity.name || 'none') + ', contexts: ' + Object.keys(_parsed).filter(function(k) { return _parsed[k]; }).join(', '));
    }

    function isConfigured() { return S.brand && S.brand.configured; }
    function getCore() { return _parsed.core || {}; }
    function getContent() { return _parsed.content || {}; }
    function getSeo() { return _parsed.seo || {}; }
    function getVideo() { return _parsed.video || {}; }
    function getAudience() { return (_parsed.core || {}).audience || {}; }
    function getForbiddenWords() { return (_parsed.core || {}).forbidden_words || []; }
    function getDos() { return (_parsed.core || {}).dos || []; }
    function getDonts() { return (_parsed.core || {}).donts || []; }

    function getSystemPrompt(contextType) {
      if (!isConfigured()) return getSetupOnlyPrompt();
      var core = _parsed.core || {}; var parts = [];
      var brandName = core.brand_name || _identity.name || 'this brand';
      parts.push('You are an expert Meta Ads creative strategist for ' + brandName + '. Every output must embody this brand perfectly.');
      if (core.tagline) parts.push('Brand tagline: ' + core.tagline);
      if (core.brand_voice) parts.push('Brand voice & personality: ' + core.brand_voice);
      // Audience
      if (core.audience) {
        var aud = core.audience;
        if (aud.primary) parts.push('Primary audience: ' + aud.primary);
        if (aud.pain_points) parts.push('Pain points: ' + (Array.isArray(aud.pain_points) ? aud.pain_points.join('; ') : aud.pain_points));
        if (aud.desires) parts.push('Desires: ' + (Array.isArray(aud.desires) ? aud.desires.join('; ') : aud.desires));
      }
      if (core.forbidden_words && core.forbidden_words.length) parts.push('FORBIDDEN WORDS (never use these): ' + core.forbidden_words.join(', '));
      // Content style
      if ((contextType === 'content' || contextType === 'recipe') && _parsed.content) {
        var cnt = _parsed.content;
        if (cnt.writing_style) parts.push('Writing style: ' + cnt.writing_style);
        if (cnt.sentence_rules) parts.push('Sentence rules: ' + (Array.isArray(cnt.sentence_rules) ? cnt.sentence_rules.join('; ') : cnt.sentence_rules));
        if (cnt.cta_style) parts.push('CTA style: ' + cnt.cta_style);
      }
      // Content pillars
      if (_parsed.video && _parsed.video.content_pillars && _parsed.video.content_pillars.length) {
        parts.push('Content pillars: ' + _parsed.video.content_pillars.join(', '));
      }
      // DOs and DON'Ts
      if (core.dos && core.dos.length) parts.push('ALWAYS: ' + core.dos.slice(0, 6).join('; '));
      if (core.donts && core.donts.length) parts.push('NEVER: ' + core.donts.slice(0, 6).join('; '));
      // CP-specific: setup context
      parts.push(getSetupContext());
      return parts.filter(Boolean).join('\n');
    }

    function getSetupOnlyPrompt() {
      var ctx = getSetupContext();
      return ctx ? 'You are an expert Meta Ads creative strategist.\n' + ctx : '';
    }

    function getSetupContext() {
      var setup = (S.meta && S.meta.setup) || {};
      var parts = [];
      if (setup.product_name) parts.push('Product/service: ' + setup.product_name);
      if (setup.objective) parts.push('Business objective: ' + setup.objective);
      // Funnel stages
      var funnels = (S.meta && S.meta.settings && S.meta.settings.funnel_stages) || [];
      if (funnels.length) parts.push('Funnel stages: ' + funnels.map(function(f) { return f.name; }).join(' → '));
      if (setup.custom_instructions) parts.push('Custom instructions: ' + setup.custom_instructions);
      return parts.length ? parts.join('\n') : '';
    }

    function getBrandDesignPrompt() {
      var bd = (S.meta && S.meta.settings && S.meta.settings.brand_design) || {};
      if (bd.brand_prompt_prefix && bd.brand_prompt_prefix.trim()) return bd.brand_prompt_prefix;
      return buildBrandDesignText(bd);
    }

    function buildBrandDesignText(bd) {
      if (!bd) return '';
      var lines = ['BRAND VISUAL IDENTITY:'];
      var c = bd.colors || {};
      if (c.primary || c.secondary || c.accent) {
        var cp = [];
        if (c.primary) cp.push('Primary ' + c.primary);
        if (c.secondary) cp.push('Secondary ' + c.secondary);
        if (c.accent) cp.push('Accent ' + c.accent);
        lines.push('Colors: ' + cp.join(', ') + '.');
        if (c.background) lines.push('Background: ' + c.background + '. Text: ' + (c.text || '#202124') + '.');
      }
      var t = bd.typography || {};
      if (t.heading_style || t.body_style) {
        var tp = [];
        if (t.heading_style) tp.push('Headings: ' + t.heading_style);
        if (t.body_style) tp.push('Body: ' + t.body_style);
        lines.push('Typography: ' + tp.join('. ') + '.');
      }
      if (bd.visual_style) lines.push('Visual style: ' + bd.visual_style);
      if (bd.layout_rules) lines.push('Layout: ' + bd.layout_rules);
      return lines.length > 1 ? lines.join('\n') : '';
    }

    function autoPopulateBrandDesign() {
      if (!isConfigured()) return;
      var bd = (S.meta && S.meta.settings && S.meta.settings.brand_design) || {};
      if (bd.colors && bd.colors.primary) return; // Already populated
      var core = _parsed.core || {};
      if (core.brand_colors) {
        bd.colors = bd.colors || {};
        if (core.brand_colors.primary && !bd.colors.primary) bd.colors.primary = core.brand_colors.primary;
        if (core.brand_colors.secondary && !bd.colors.secondary) bd.colors.secondary = core.brand_colors.secondary;
        if (core.brand_colors.accent && !bd.colors.accent) bd.colors.accent = core.brand_colors.accent;
        S.meta.settings.brand_design = bd;
        syncToTextarea();
      }
    }

    return { init: init, isConfigured: isConfigured, getCore: getCore, getContent: getContent, getSeo: getSeo, getVideo: getVideo, getAudience: getAudience, getForbiddenWords: getForbiddenWords, getDos: getDos, getDonts: getDonts, getSystemPrompt: getSystemPrompt, getBrandDesignPrompt: getBrandDesignPrompt, buildBrandDesignText: buildBrandDesignText, autoPopulateBrandDesign: autoPopulateBrandDesign, getSetupContext: getSetupContext };
  })();


/* ===== src/30-part2b/04-ai-parsing.js ===== */
  // ============================================================
  // SECTION 4: AI RESPONSE PARSING
  // ============================================================

  function parseJSON(text) {
    if (!text || !text.trim()) throw new Error('Empty AI response');
    try { return JSON.parse(text); } catch(e) {}
    var cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    try { return JSON.parse(cleaned); } catch(e) {}
    var objStr = extractBraceBlock(cleaned, '{', '}');
    if (objStr) { try { return JSON.parse(objStr); } catch(e) {} }
    var arrStr = extractBraceBlock(cleaned, '[', ']');
    if (arrStr) { try { return JSON.parse(arrStr); } catch(e) {} }
    if (objStr) { var relaxed = objStr.replace(/,\s*([}\]])/g, '$1'); try { return JSON.parse(relaxed); } catch(e) {} }
    throw new Error('Could not parse AI response as JSON');
  }

  function extractBraceBlock(text, openChar, closeChar) {
    var start = text.indexOf(openChar); if (start === -1) return null;
    var depth = 0, inStr = false, escaped = false;
    for (var i = start; i < text.length; i++) {
      var ch = text[i];
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (ch === openChar) depth++;
      if (ch === closeChar) { depth--; if (depth === 0) return text.substring(start, i + 1); }
    }
    return null;
  }


/* ===== src/30-part2b/05-prompt-helpers.js ===== */
  // ============================================================
  // SECTION 5: BRAND & RECIPE PROMPT HELPERS
  // ============================================================

  function brandSnippet(type) {
    if (!BrandService.isConfigured()) {
      var setupCtx = BrandService.getSetupContext();
      return setupCtx ? '\n\nContext:\n' + setupCtx : '';
    }
    var lines = [], core = BrandService.getCore(), aud = BrandService.getAudience();
    if (type === 'research' || type === 'persona') {
      if (aud.primary) lines.push('Target audience: ' + aud.primary);
      if (aud.pain_points) lines.push('Their pain points: ' + (Array.isArray(aud.pain_points) ? aud.pain_points.join('; ') : aud.pain_points));
      if (core.brand_voice) lines.push('Brand voice: ' + core.brand_voice);
      var seo = BrandService.getSeo();
      if (seo.content_gaps) lines.push('Content gaps: ' + (Array.isArray(seo.content_gaps) ? seo.content_gaps.join(', ') : seo.content_gaps));
    }
    if (type === 'hooks' || type === 'content') {
      if (core.brand_voice) lines.push('Voice: ' + core.brand_voice);
      var cnt = BrandService.getContent();
      if (cnt.writing_style) lines.push('Writing style: ' + cnt.writing_style);
      if (cnt.cta_style) lines.push('CTA style: ' + cnt.cta_style);
      var fw = BrandService.getForbiddenWords();
      if (fw.length) lines.push('NEVER use: ' + fw.join(', '));
    }
    if (type === 'media') {
      var bdPrompt = BrandService.getBrandDesignPrompt();
      if (bdPrompt) return '\n\n' + bdPrompt;
      if (core.brand_name) lines.push('Brand: ' + core.brand_name);
    }
    // Always append setup context
    var setupCtx2 = BrandService.getSetupContext();
    if (setupCtx2) lines.push(setupCtx2);
    return lines.length ? '\n\nBrand context:\n' + lines.join('\n') : '';
  }

  function entityContextSnippet(entityType, entity) {
    if (!entity) return '';
    var parts = ['Existing ' + entityType + ': ' + (entity.name || entity.title || '')];
    if (entity.description) parts.push('Description: ' + truncate(entity.description, 150));
    if (entityType === 'persona' && entity.demographics) {
      var d = entity.demographics;
      var dStr = [d.age_range, d.location, d.occupation].filter(Boolean).join(', ');
      if (dStr) parts.push('Demographics: ' + dStr);
    }
    return parts.join('\n');
  }


/* ===== src/30-part2b/06-ai-retry.js ===== */
  // ============================================================
  // SECTION 6: AI RETRY WRAPPER
  // ============================================================

  // callAIWithRetry: separates JSON parsing from business logic side-effects.
  // onSuccess(parsed) receives the already-parsed object/string.
  // parseResponse(text) is optional; if provided, it parses the raw text and throws on failure (triggering retry).
  // If no parseResponse is given, onSuccess receives raw text and errors are NOT retried.
  function callAIWithRetry(prompt, onSuccess, onError, actionId, systemPrompt, parseResponse) {
    LLMService.callAI(prompt, function(text) {
      var parsed;
      if (parseResponse) {
        try { parsed = parseResponse(text); }
        catch(parseErr) {
          console.warn('[CP] AI parse failed, retrying:', parseErr.message);
          var retryPrompt = prompt + '\n\nCRITICAL: Your previous response was not valid JSON. Respond with ONLY valid JSON. No markdown, no code fences, no text before or after.';
          toast('Retrying with stricter instructions...', 'info');
          LLMService.callAI(retryPrompt, function(text2) {
            var parsed2;
            try { parsed2 = parseResponse(text2); }
            catch(parseErr2) {
              console.error('[CP] AI retry parse also failed:', parseErr2.message);
              toast('AI response format error. Try a different model.', 'error');
              if (onError) onError('Parse error after retry: ' + parseErr2.message);
              return;
            }
            // Parse succeeded — run business logic outside try/catch
            onSuccess(parsed2);
          }, function(err) { if (onError) onError(err); }, actionId, systemPrompt);
          return;
        }
        // Parse succeeded — run business logic outside try/catch
        onSuccess(parsed);
      } else {
        // No parser provided — pass raw text, no retry on error
        onSuccess(text);
      }
    }, function(err) { if (onError) onError(err); }, actionId, systemPrompt);
  }


/* ===== src/30-part2b/07-research-panel.js ===== */
  // ============================================================
  // SECTION 7: AI RESEARCH PANEL COMPONENT
  // ============================================================

  function renderAIResearchPanelBody(entityType, stateKey, color) {
    var html = '<div class="cp-ai-research-body" data-entity-type="' + esc(entityType) + '" data-state-key="' + esc(stateKey) + '">';

    // Input area
    html += '<div class="cp-ai-research-input">';
    html += '<textarea class="cp-textarea" id="cpResearchInput_' + esc(stateKey) + '" rows="2" placeholder="Optional: specific direction for AI research..."></textarea>';
    html += '<button class="cp-btn cp-btn-ai cp-btn-sm" data-action="ai-research-generate" data-entity-type="' + esc(entityType) + '" data-state-key="' + esc(stateKey) + '">' + icon('sparkles') + ' Generate</button>';
    html += '</div>';

    // AI picker
    html += '<div style="margin-bottom:var(--cp-space-3)">';
    html += (window._cpAiSel ? window._cpAiSel('ai-research-' + stateKey) : '');
    html += '</div>';

    // Results area
    var results = S._aiResearchResults && S._aiResearchResults[stateKey];
    if (results && results.length > 0) {
      html += '<div class="cp-ai-research-results" id="cpResearchResults_' + esc(stateKey) + '">';
      for (var ri = 0; ri < results.length; ri++) {
        var r = results[ri];
        var isChecked = r._selected ? ' cp-ai-research-result-selected' : '';
        html += '<div class="cp-ai-research-result' + isChecked + '" data-result-index="' + ri + '" data-state-key="' + esc(stateKey) + '">';
        html += '<div class="cp-ai-research-result-check" style="' + (r._selected ? 'background:' + color + ';border-color:' + color : 'border-color:var(--cp-border-default)') + '">';
        if (r._selected) html += icon('check');
        html += '</div>';
        html += '<div class="cp-ai-research-result-body">';
        html += '<div class="cp-ai-research-result-title">' + esc(r.name || r.title || r.pain_point || 'Result ' + (ri + 1)) + '</div>';
        if (r.description || r.body || r.solution) {
          html += '<div class="cp-ai-research-result-desc">' + esc(truncate(r.description || r.body || r.solution || '', 150)) + '</div>';
        }
        if (r._tags && r._tags.length) {
          html += '<div class="cp-ai-research-result-tags">';
          for (var ti = 0; ti < r._tags.length; ti++) html += '<span class="cp-badge" style="background:' + color + '15;color:' + color + '">' + esc(r._tags[ti]) + '</span>';
          html += '</div>';
        }
        html += '</div></div>';
      }
      html += '</div>';

      // Footer: add selected
      var selCount = results.filter(function(r) { return r._selected; }).length;
      html += '<div class="cp-ai-research-footer">';
      html += '<span class="cp-text-muted">' + selCount + ' of ' + results.length + ' selected</span>';
      html += '<div style="flex:1"></div>';
      html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="ai-research-select-all" data-state-key="' + esc(stateKey) + '">Select All</button>';
      html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="ai-research-add-selected" data-entity-type="' + esc(entityType) + '" data-state-key="' + esc(stateKey) + '"' + (selCount === 0 ? ' disabled' : '') + '>' + icon('plus') + ' Add ' + selCount + ' to Library</button>';
      html += '</div>';
    } else {
      html += '<div id="cpResearchResults_' + esc(stateKey) + '"></div>';
    }

    // Loading indicator
    html += '<div id="cpResearchLoading_' + esc(stateKey) + '" style="display:none;text-align:center;padding:var(--cp-space-4)">';
    html += icon('spinner') + ' <span class="cp-text-muted">Researching ' + esc(entityType.toLowerCase()) + 's...</span>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function toggleResearchResultSelection(stateKey, index) {
    S._aiResearchResults = S._aiResearchResults || {};
    var results = S._aiResearchResults[stateKey] || [];
    if (results[index]) {
      results[index]._selected = !results[index]._selected;
      render();
    }
  }

  function selectAllResearchResults(stateKey) {
    var results = (S._aiResearchResults || {})[stateKey] || [];
    var allSelected = results.every(function(r) { return r._selected; });
    results.forEach(function(r) { r._selected = !allSelected; });
    render();
  }

  function addSelectedToLibrary(entityType, stateKey) {
    var results = (S._aiResearchResults || {})[stateKey] || [];
    var selected = results.filter(function(r) { return r._selected; });
    if (selected.length === 0) { toast('No items selected', 'warning'); return; }

    snapshot('Add ' + selected.length + ' ' + entityType + 's from research');
    var typeMap = { 'Persona': 'persona', 'Message': 'message', 'Style': 'style', 'Visual Format': 'visual_format', 'Pain Point': 'pain_point' };
    var crudType = typeMap[entityType] || entityType.toLowerCase();

    for (var i = 0; i < selected.length; i++) {
      var r = selected[i];
      var data = {};
      if (crudType === 'persona') {
        data = { name: r.name || '', description: r.description || '', demographics: r.demographics || {}, psychographics: r.psychographics || {} };
      } else if (crudType === 'message') {
        data = { title: r.title || r.name || '', body: r.body || '', funnel_stages: r.funnel_stages || [], delivery_notes: r.delivery_notes || '', hooks: r.hooks || [] };
      } else if (crudType === 'style') {
        data = { name: r.name || '', description: r.description || '' };
      } else if (crudType === 'visual_format') {
        data = { name: r.name || '', description: r.description || '', category: r.category || '' };
      } else if (crudType === 'pain_point') {
        data = { pain_point: r.pain_point || r.name || '', solution: r.solution || '', category: r.category || '' };
      }
      createEntity(crudType, data);
    }

    // Clear results
    S._aiResearchResults[stateKey] = [];
    toast(selected.length + ' ' + entityType.toLowerCase() + (selected.length > 1 ? 's' : '') + ' added to library', 'success');
  }


/* ===== src/30-part2b/08-inline-ai-assist.js ===== */
  // ============================================================
  // SECTION 8: INLINE AI ASSIST COMPONENT
  // ============================================================

  function renderInlineAIAssist(fieldId, entityType, entityId) {
    return '<div class="cp-ai-assist" data-field-id="' + esc(fieldId) + '" data-entity-type="' + esc(entityType || '') + '" data-entity-id="' + esc(entityId || '') + '">' +
      '<button class="cp-ai-assist-btn cp-ai-assist-suggest" data-action="ai-assist" data-mode="suggest" data-field-id="' + esc(fieldId) + '">' + icon('sparkles') + ' Suggest</button>' +
      '<button class="cp-ai-assist-btn cp-ai-assist-improve" data-action="ai-assist" data-mode="improve" data-field-id="' + esc(fieldId) + '">' + icon('wand-magic') + ' Improve</button>' +
      '</div>';
  }

  function handleInlineAssist(fieldId, mode) {
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    var $field = $('[data-field="' + fieldId + '"], [data-action-field="' + fieldId + '"]').first();
    if (!$field.length) $field = $('#' + fieldId);
    if (!$field.length) { toast('Field not found', 'error'); return; }

    var currentVal = $field.val() || '';
    var fieldLabel = $field.closest('.cp-form-group').find('label').text() || fieldId;
    var setupCtx = BrandService.getSetupContext();

    var prompt = '';
    if (mode === 'suggest') {
      prompt = 'Generate a concise, high-quality suggestion for the field "' + fieldLabel + '".\n';
      if (setupCtx) prompt += '\nContext:\n' + setupCtx;
      prompt += '\n\nRespond with ONLY the text content — no JSON, no labels, no quotes. Just the field value.';
    } else {
      prompt = 'Improve the following text for the field "' + fieldLabel + '":\n\n"' + currentVal + '"\n';
      if (setupCtx) prompt += '\nContext:\n' + setupCtx;
      prompt += '\n\nMake it more compelling, specific, and professional. Respond with ONLY the improved text — no JSON, no labels, no quotes.';
    }

    var $btn = $('[data-action="ai-assist"][data-mode="' + mode + '"][data-field-id="' + fieldId + '"]');
    $btn.prop('disabled', true).html(icon('spinner'));

    LLMService.callAI(prompt, function(text) {
      var cleanText = text.replace(/^["']|["']$/g, '').trim();
      $field.val(cleanText).trigger('change').trigger('blur');
      $btn.prop('disabled', false).html(icon(mode === 'suggest' ? 'sparkles' : 'wand-magic') + ' ' + (mode === 'suggest' ? 'Suggest' : 'Improve'));
      toast('AI ' + mode + ' applied', 'success');
    }, function(err) {
      $btn.prop('disabled', false).html(icon(mode === 'suggest' ? 'sparkles' : 'wand-magic') + ' ' + (mode === 'suggest' ? 'Suggest' : 'Improve'));
      toast('AI error: ' + err, 'error');
    }, 'ai-assist-' + fieldId, BrandService.getSystemPrompt('content'), parseJSON);
  }


/* ===== src/30-part2b/09-ai-status-indicator.js ===== */
  // ============================================================
  // SECTION 9: AI STATUS INDICATOR
  // ============================================================

  function updateAIStatusIndicator() {
    var $el = $('#cpAIStatus');
    if (!$el.length) return;
    if (LLMService.isConfigured()) {
      var def = LLMService.getDefault();
      var label = def ? (def.provider + '/' + def.model).substring(0, 28) : 'Ready';
      $el.html('<span class="cp-ai-status-dot cp-ai-status-ok"></span><span class="cp-ai-status-label">' + esc(label) + '</span>');
      $el.attr('title', 'AI active — click to switch');
    } else {
      $el.html('<span class="cp-ai-status-dot cp-ai-status-off"></span><span class="cp-ai-status-label">No AI</span>');
      $el.attr('title', 'AI not configured');
    }
  }

  function testAIConnection() {
    if (!LLMService.isConfigured()) { toast('No AI providers configured.', 'warning'); return; }
    toast('Testing AI connection...', 'info');
    var $btn = $('[data-action="test-ai-connection"]');
    $btn.prop('disabled', true).html(icon('spinner') + ' Testing...');
    LLMService.callAI('Respond with exactly: {"status":"ok"}', function(text) {
      $btn.prop('disabled', false).html(icon('bolt') + ' Test Connection');
      toast('AI connection successful!', 'success');
      $btn.after('<span class="cp-ai-test-result cp-ai-test-ok" style="margin-left:8px">' + icon('circle-check') + ' Connected</span>');
      setTimeout(function() { $('.cp-ai-test-result').fadeOut(400, function() { $(this).remove(); }); }, 4000);
    }, function(err) {
      $btn.prop('disabled', false).html(icon('bolt') + ' Test Connection');
      toast('AI connection failed: ' + err, 'error');
      $btn.after('<span class="cp-ai-test-result cp-ai-test-fail" style="margin-left:8px">' + icon('circle-xmark') + ' Failed</span>');
      setTimeout(function() { $('.cp-ai-test-result').fadeOut(400, function() { $(this).remove(); }); }, 6000);
    }, 'test-connection');
  }


/* ===== src/30-part2b/10-ai-preview-modal.js ===== */
  // ============================================================
  // SECTION 9.5: AI PREVIEW MODAL (Alternatives Selector)
  // ============================================================

  function showAIPreview(title, alternatives, onSelect, opts) {
    opts = opts || {};
    var html = '<div class="cp-ai-preview">';
    html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-3)">' + icon('sparkles') + ' ' + alternatives.length + ' alternative' + (alternatives.length !== 1 ? 's' : '') + ' generated. Select the one you prefer.</p>';

    for (var i = 0; i < alternatives.length; i++) {
      var alt = alternatives[i];
      html += '<div class="cp-ai-preview-card" data-alt-idx="' + i + '">';
      html += '<div class="cp-ai-preview-header">';
      html += '<span class="cp-ai-preview-num">' + (i + 1) + '</span>';
      if (alt.label) html += '<span class="cp-ai-preview-label">' + esc(alt.label) + '</span>';
      html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="ai-preview-select" data-idx="' + i + '">' + icon('check') + ' Use This</button>';
      html += '</div>';

      // Render content based on type
      if (alt.sections) {
        // Multi-field (content: ad_copy + headline + cta)
        for (var si = 0; si < alt.sections.length; si++) {
          var sec = alt.sections[si];
          html += '<div class="cp-ai-preview-section">';
          html += '<div class="cp-ai-preview-section-label">' + esc(sec.label) + '</div>';
          html += '<div class="cp-ai-preview-section-value">' + esc(sec.value) + '</div>';
          html += '</div>';
        }
      } else if (alt.text) {
        // Single text block
        html += '<div class="cp-ai-preview-text">' + esc(alt.text) + '</div>';
      }
      html += '</div>';
    }

    // Regenerate option
    html += '<div class="cp-ai-preview-footer">';
    html += '<div class="cp-form-group" style="margin-bottom:var(--cp-space-2)">';
    html += '<textarea class="cp-textarea" id="cpAIPreviewInstructions" rows="2" placeholder="Adjust instructions and regenerate..."></textarea>';
    html += '</div>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="ai-preview-regenerate">' + icon('rotate') + ' Regenerate</button>';
    html += '</div>';

    html += '</div>';

    // Store callback and alternatives for event handlers
    S._aiPreview = { alternatives: alternatives, onSelect: onSelect, regenerate: opts.onRegenerate || null };

    openModal(title, html, { titleIcon: 'sparkles', size: 'lg', footer: false });
  }


/* ===== src/30-part2b/11-ai-persona-research.js ===== */
  // ============================================================
  // SECTION 10: AI — PERSONA RESEARCH
  // ============================================================

  function aiResearchPersonas(customInput) {
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    toast('Researching personas...', 'info');
    var stateKey = 'personas';
    $('#cpResearchLoading_' + stateKey).show();

    // Build existing personas list for deduplication
    var existing = getAllPersonas().map(function(p) { return p.name; });
    var existingStr = existing.length ? '\n\nExisting personas (do NOT duplicate these): ' + existing.join(', ') : '';

    var prompt = 'You are a senior Meta Ads strategist specializing in audience segmentation for paid campaigns. Generate 4 distinct target persona profiles.\n';
    prompt += brandSnippet('persona');
    prompt += existingStr;
    if (customInput) prompt += '\n\nUser direction: ' + customInput;
    prompt += '\n\nRules:\n- Each persona must be DISTINCT — different demographics, motivations, and buying triggers\n- Think about who would respond to Meta Ads for this product\n- Consider different funnel stages and awareness levels\n- Include actionable psychographic details that inform ad creative\n\nFor each persona provide:\n- name: short memorable name (2-4 words, e.g. "Aspiring Creator", "Budget-Conscious Parent")\n- description: 2-3 sentences summarizing this persona\n- demographics: {age_range, gender, location, income_level, education, occupation}\n- psychographics: {desires, requirements, emotional_triggers, motivations, fears, values}\n\nRespond ONLY as JSON: {"personas":[{...}]}';

    callAIWithRetry(prompt, function(parsed) {
      S._aiResearchResults = S._aiResearchResults || {};
      S._aiResearchResults[stateKey] = (parsed.personas || []).map(function(p) {
        p._selected = false;
        p._tags = [p.demographics && p.demographics.age_range, p.demographics && p.demographics.occupation].filter(Boolean);
        return p;
      });
      $('#cpResearchLoading_' + stateKey).hide();
      logActivity('personas_researched', '', '', (parsed.personas || []).length + ' personas generated');
      snapshot('AI persona research'); render();
      toast('Generated ' + (parsed.personas || []).length + ' persona suggestions', 'success');
    }, function(err) {
      $('#cpResearchLoading_' + stateKey).hide();
      toast('AI Error: ' + err, 'error');
    }, 'ai-research-personas', BrandService.getSystemPrompt('research'), parseJSON);
  }


/* ===== src/30-part2b/11-ai-runner-modal.js ===== */
  // ============================================================
  // SECTION 9.6: AI RUNNER MODAL (per-call instruction + model picker)
  // ============================================================
  //
  // Generic modal that captures a free-form instruction from the user and
  // lets them pick the AI provider/model for a single call, then invokes
  // `opts.onConfirm({ instruction }, done)`. The picker lives inside the
  // modal with `data-action-id="<actionId>"` so `LLMService.callAI(...,
  // actionId, ...)` reads the user's choice via the existing `_getPickerSel`
  // lookup; the call inside `callAI` also persists the selection via
  // `savePreference(actionId, ...)` so the next open of the same modal
  // defaults to the user's last choice.
  //
  // The modal stays mounted while the AI request is in flight — the Run
  // button is disabled and shows a busy label. The handler closes the
  // modal on success or re-enables the button on error.

  function openAiRunnerModal(opts) {
    closeAiRunnerModal();
    opts = opts || {};
    var actionId = opts.actionId || 'ai-runner';
    var instructionLabel = opts.instructionLabel || 'Instructions';
    var instructionPlaceholder = opts.instructionPlaceholder || '';
    var instructionInitial = opts.instructionInitial || '';
    var instructionRequired = !!opts.instructionRequired;
    var confirmLabel = opts.confirmLabel || 'Run';
    var busyLabel = opts.busyLabel || 'Running…';
    var subtitle = opts.subtitle || '';

    var html = '<div class="cp-ai-runner-backdrop">';
    html += '<div class="cp-ai-runner-dialog">';
    html += '<div class="cp-ai-runner-header">';
    html += '<h3 class="cp-ai-runner-title">' + icon('sparkles') + ' ' + esc(opts.title || 'Run AI') + '</h3>';
    if (subtitle) html += '<p class="cp-ai-runner-subtitle">' + esc(subtitle) + '</p>';
    html += '</div>';
    html += '<div class="cp-ai-runner-body">';
    html += '<div class="cp-ai-runner-field">';
    html += '<label class="cp-ai-runner-label">' + esc(instructionLabel);
    html += ' <span class="cp-text-muted" style="font-weight:400;font-size:11px">' + (instructionRequired ? 'required' : 'optional') + '</span>';
    html += '</label>';
    html += '<textarea class="cp-textarea cp-ai-runner-instruction" rows="4" placeholder="' + esc(instructionPlaceholder) + '">' + esc(instructionInitial) + '</textarea>';
    html += '</div>';
    html += '<div class="cp-ai-runner-field cp-ai-runner-picker-row">';
    html += '<label class="cp-ai-runner-label">' + icon('robot') + ' AI model</label>';
    html += LLMService.renderInlinePicker(actionId);
    html += '</div>';
    html += '</div>';
    html += '<div class="cp-ai-runner-actions">';
    html += '<button class="cp-btn cp-btn-outline" data-action="ai-runner-cancel">Cancel</button>';
    html += '<button class="cp-btn cp-btn-primary cp-ai-runner-run" data-action="ai-runner-run">' + icon('sparkles') + ' ' + esc(confirmLabel) + '</button>';
    html += '</div>';
    html += '</div></div>';

    $('body').append(html);

    $(document).off('click.cp-air-cancel').on('click.cp-air-cancel', '[data-action="ai-runner-cancel"]', function(e) {
      e.preventDefault();
      closeAiRunnerModal();
    });

    $(document).off('click.cp-air-run').on('click.cp-air-run', '[data-action="ai-runner-run"]', function(e) {
      e.preventDefault();
      var $btn = $(this);
      if ($btn.prop('disabled')) return;
      var instruction = ($('.cp-ai-runner-instruction').val() || '').trim();
      if (instructionRequired && !instruction) {
        toast(instructionLabel + ' is required', 'warning');
        $('.cp-ai-runner-instruction').focus();
        return;
      }
      var originalHtml = $btn.html();
      $btn.prop('disabled', true).html(icon('rotate') + ' ' + esc(busyLabel));
      if (typeof opts.onConfirm !== 'function') {
        closeAiRunnerModal();
        return;
      }
      opts.onConfirm({ instruction: instruction }, function done(err) {
        if (err) {
          if ($('.cp-ai-runner-backdrop').length) {
            $('.cp-ai-runner-run').prop('disabled', false).html(originalHtml);
          }
          return;
        }
        closeAiRunnerModal();
      });
    });

    setTimeout(function() { $('.cp-ai-runner-instruction').focus(); }, 50);
  }

  function closeAiRunnerModal() {
    $('.cp-ai-runner-backdrop').remove();
    $(document).off('click.cp-air-cancel click.cp-air-run');
  }


/* ===== src/30-part2b/12-ai-pain-research.js ===== */
  // ============================================================
  // SECTION 11: AI — PAIN POINT RESEARCH
  // ============================================================

  function aiResearchPainPoints(personaId, customInput) {
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    toast('Researching pain points...', 'info');

    var persona = personaId ? getPersona(personaId) : null;
    var personaCtx = persona ? '\nTarget persona: ' + persona.name : '';
    if (persona) {
      var d = persona.demographics || {};
      var p = persona.psychographics || {};
      if (d.occupation) personaCtx += ' (' + d.occupation + ')';
      if (p.fears) personaCtx += '\nFears: ' + p.fears;
      if (p.desires) personaCtx += '\nDesires: ' + p.desires;
    }

    // Existing pain points for dedup
    var existing = getAllPainPoints().map(function(pp) { return truncate(pp.pain_point, 40); });
    var existingStr = existing.length ? '\n\nExisting pain points (avoid duplicates): ' + existing.join('; ') : '';

    var prompt = 'You are an expert at identifying customer pain points for Meta Ads targeting. Generate 5 specific, actionable pain points with solutions.\n';
    prompt += brandSnippet('research');
    prompt += personaCtx + existingStr;
    if (customInput) prompt += '\n\nUser direction: ' + customInput;
    prompt += '\n\nRules:\n- Pain points must be SPECIFIC and emotionally resonant — not generic\n- Each must directly relate to a problem the product/service solves\n- Solutions should connect to the product value proposition\n- Think about what keeps this audience up at night\n- Consider both functional and emotional pain points\n\nRespond ONLY as JSON: {"pain_points":[{"pain_point":"specific pain...","solution":"how product solves it...","category":"productivity|cost|knowledge|competition|growth"}]}';

    var stateKey = personaId ? 'pain_points_' + personaId : 'pain_points';
    callAIWithRetry(prompt, function(parsed) {
      if (personaId) {
        // Add directly to persona's pain points
        var results = parsed.pain_points || [];
        snapshot('AI pain point research');
        for (var i = 0; i < results.length; i++) {
          var pp = createEntity('pain_point', { pain_point: results[i].pain_point, solution: results[i].solution || '', category: results[i].category || '' });
          if (pp && persona) {
            persona.pain_point_ids = persona.pain_point_ids || [];
            if (persona.pain_point_ids.indexOf(pp.id) === -1) persona.pain_point_ids.push(pp.id);
          }
        }
        syncToTextarea(); buildMaps(); render();
        logActivity('pain_points_generated', 'persona', personaId, persona ? persona.name : '', results.length + ' pain points generated');
        toast('Generated ' + results.length + ' pain points', 'success');
      } else {
        // Store as research results for selection
        S._aiResearchResults = S._aiResearchResults || {};
        S._aiResearchResults.pain_points = (parsed.pain_points || []).map(function(pp) {
          pp._selected = false; pp.name = truncate(pp.pain_point, 50);
          pp._tags = [pp.category].filter(Boolean);
          return pp;
        });
        render();
        toast('Generated ' + (parsed.pain_points || []).length + ' pain point suggestions', 'success');
      }
    }, function(err) { toast('AI Error: ' + err, 'error'); }, 'ai-research-pain-points', BrandService.getSystemPrompt('research'), parseJSON);
  }


/* ===== src/30-part2b/13-ai-message-research.js ===== */
  // ============================================================
  // SECTION 12: AI — MESSAGE RESEARCH
  // ============================================================

  function aiResearchMessages(customInput) {
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    toast('Researching messages...', 'info');
    var stateKey = 'messages';
    $('#cpResearchLoading_' + stateKey).show();

    var existing = getAllMessages().map(function(m) { return m.title; });
    var existingStr = existing.length ? '\n\nExisting messages (avoid duplicates): ' + existing.join(', ') : '';
    var funnels = (S.meta.settings && S.meta.settings.funnel_stages) || [];
    var funnelStr = funnels.length ? '\nFunnel stages available: ' + funnels.map(function(f) { return f.id + ' (' + f.name + ')'; }).join(', ') : '';

    var prompt = 'You are a Meta Ads copywriting expert. Generate 4 distinct message angles for ad campaigns.\n';
    prompt += brandSnippet('content');
    prompt += existingStr + funnelStr;
    if (customInput) prompt += '\n\nUser direction: ' + customInput;
    prompt += '\n\nRules:\n- Each message must target a different emotional trigger or value proposition\n- Include specific delivery guidance (tone, pacing, acting direction for video)\n- Include 2 opening hooks per message\n- Tag each message with appropriate funnel stage(s)\n- Messages should be adaptable to both image and video formats\n\nRespond ONLY as JSON: {"messages":[{"title":"short name","body":"core message text (2-3 sentences)","funnel_stages":["' + (funnels[0] ? funnels[0].id : 'fs_top') + '"],"delivery_notes":"how to deliver this message...","theme":"topic/angle","hooks":[{"text":"hook text...","type":"question|bold|story|data|direct"}]}]}';

    callAIWithRetry(prompt, function(parsed) {
      S._aiResearchResults = S._aiResearchResults || {};
      S._aiResearchResults[stateKey] = (parsed.messages || []).map(function(m) {
        m._selected = false;
        m.name = m.title; // For display in research panel
        var fLabels = (m.funnel_stages || []).map(function(fid) { var f = S.funnelStageMap[fid]; return f ? f.short : ''; }).filter(Boolean);
        m._tags = fLabels.concat(m.theme ? [m.theme] : []);
        return m;
      });
      $('#cpResearchLoading_' + stateKey).hide();
      logActivity('messages_suggested', '', '', (parsed.messages || []).length + ' messages generated');
      snapshot('AI message research'); render();
      toast('Generated ' + (parsed.messages || []).length + ' message suggestions', 'success');
    }, function(err) {
      $('#cpResearchLoading_' + stateKey).hide();
      toast('AI Error: ' + err, 'error');
    }, 'ai-research-messages', BrandService.getSystemPrompt('content'), parseJSON);
  }


/* ===== src/30-part2b/14-ai-style-format-research.js ===== */
  // ============================================================
  // SECTION 13: AI — STYLE & FORMAT RESEARCH
  // ============================================================

  function aiResearchStyles(customInput) {
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    toast('Researching styles...', 'info');
    var stateKey = 'styles';
    $('#cpResearchLoading_' + stateKey).show();

    var existing = getAllStyles().map(function(s) { return s.name; });
    var existingStr = existing.length ? '\n\nExisting styles (avoid duplicates): ' + existing.join(', ') : '';

    var prompt = 'You are a creative director specializing in Meta Ads. Generate 4 distinct creative styles/tones for ad campaigns.\n';
    prompt += brandSnippet('content');
    prompt += existingStr;
    if (customInput) prompt += '\n\nUser direction: ' + customInput;
    prompt += '\n\nRules:\n- Each style must be DISTINCT — different emotional register, visual energy, and audience appeal\n- Consider styles that work well for Meta Ads (attention-grabbing, scroll-stopping)\n- Include specific guidance on how the style manifests in copy and visual\n- Think about: humor, authority, empathy, urgency, aspirational, educational\n\nRespond ONLY as JSON: {"styles":[{"name":"style name","description":"2-3 sentences describing the tone, approach, and how it manifests in ads"}]}';

    callAIWithRetry(prompt, function(parsed) {
      S._aiResearchResults = S._aiResearchResults || {};
      S._aiResearchResults[stateKey] = (parsed.styles || []).map(function(s) {
        s._selected = false; s._tags = [];
        return s;
      });
      $('#cpResearchLoading_' + stateKey).hide();
      logActivity('styles_researched', '', '', (parsed.styles || []).length + ' styles generated');
      snapshot('AI style research'); render();
      toast('Generated ' + (parsed.styles || []).length + ' style suggestions', 'success');
    }, function(err) {
      $('#cpResearchLoading_' + stateKey).hide();
      toast('AI Error: ' + err, 'error');
    }, 'ai-research-styles', BrandService.getSystemPrompt('content'), parseJSON);
  }

  function aiResearchFormats(customInput) {
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    toast('Researching visual formats...', 'info');
    var stateKey = 'formats';
    $('#cpResearchLoading_' + stateKey).show();

    var existing = getAllFormats().map(function(f) { return f.name; });
    var existingStr = existing.length ? '\n\nExisting formats (avoid duplicates): ' + existing.join(', ') : '';
    var cats = Constants.FORMAT_CATEGORIES || [];
    var catStr = cats.length ? '\nAvailable categories: ' + cats.map(function(c) { return c.id + ' (' + c.name + ')'; }).join(', ') : '';

    var prompt = 'You are a video/photo production expert for Meta Ads. Generate 4 distinct visual format ideas for ad creative production.\n';
    prompt += brandSnippet('media');
    prompt += existingStr + catStr;
    if (customInput) prompt += '\n\nUser direction: ' + customInput;
    prompt += '\n\nRules:\n- Each format must describe a distinct production approach (e.g., studio shoot, UGC style, motion graphics, whiteboard)\n- Include specific visual details: setting, camera approach, editing style\n- Consider what performs well on Meta Ads (Reels, Feed, Stories)\n- Assign appropriate category from the available list\n\nRespond ONLY as JSON: {"formats":[{"name":"format name","description":"2-3 sentences describing the visual approach, setting, and production style","category":"' + (cats[0] ? cats[0].id : 'vfc_shoot') + '"}]}';

    callAIWithRetry(prompt, function(parsed) {
      S._aiResearchResults = S._aiResearchResults || {};
      S._aiResearchResults[stateKey] = (parsed.formats || []).map(function(f) {
        f._selected = false;
        var catMatch = cats.find(function(c) { return c.id === f.category; });
        f._tags = catMatch ? [catMatch.name] : [];
        return f;
      });
      $('#cpResearchLoading_' + stateKey).hide();
      logActivity('formats_researched', '', '', (parsed.formats || []).length + ' formats generated');
      snapshot('AI format research'); render();
      toast('Generated ' + (parsed.formats || []).length + ' format suggestions', 'success');
    }, function(err) {
      $('#cpResearchLoading_' + stateKey).hide();
      toast('AI Error: ' + err, 'error');
    }, 'ai-research-formats', BrandService.getSystemPrompt('content'), parseJSON);
  }


/* ===== src/30-part2b/17a-ai-meta-v2.js ===== */
  // ============================================================
  // SECTION 17A: AI — META v2 (Campaign Tree + per-level assists)
  // ============================================================
  //
  // Stage 4 of the restructure. All functions follow the existing pattern:
  //   callAIWithRetry(prompt, onSuccess, onError, actionId, systemPrompt, parseJSON)
  // and use BrandService.getSystemPrompt + brandSnippet for brand context.
  //
  // For alternatives-style outputs (hook ideas, copy variants) we save the
  // options directly onto the ad (ad.hook.ai_ideas, ad.creative.ai_copy_variants)
  // and let the inspector tabs render them inline. For single-result outputs
  // (image prompt, video script) we save directly and toast.

  // --- Small helpers ---

  function aiV2_assertConfigured() {
    if (!LLMService.isConfigured()) {
      toast('No AI providers configured — open Settings → AI', 'warning');
      return false;
    }
    return true;
  }

  function aiV2_campaignContext(camp) {
    if (!camp) return '';
    var obj = (Constants.META_OBJECTIVES[camp.objective] || {}).label || camp.objective || '';
    var lines = ['Campaign: ' + (camp.name || 'Untitled')];
    if (obj) lines.push('Objective: ' + obj);
    if (camp.budget_mode) lines.push('Budget mode: ' + camp.budget_mode);
    if (camp.daily_budget) lines.push('Daily budget: ' + camp.daily_budget);
    if (camp.lifetime_budget) lines.push('Lifetime budget: ' + camp.lifetime_budget);
    if (camp.brief) lines.push('Brief: ' + camp.brief);
    if (camp.ai_instructions) lines.push('Special instructions: ' + camp.ai_instructions);
    return lines.join('\n');
  }

  function aiV2_adSetContext(adSet) {
    if (!adSet) return '';
    var p = S.personaMap[adSet.persona_id];
    var goal = (Constants.META_OPTIMIZATION_GOALS[adSet.optimization_goal] || {}).label || adSet.optimization_goal || '';
    var brief = adSet.brief || {};
    var lines = ['Ad Set: ' + (adSet.name || 'Untitled')];
    if (goal) lines.push('Optimization goal: ' + goal);
    if (p) lines.push('Persona: ' + p.name + (p.description ? ' — ' + truncate(p.description, 120) : ''));
    if (adSet.audience_overrides) lines.push('Audience overrides: ' + adSet.audience_overrides);
    if (brief.creative_direction) lines.push('Creative direction: ' + brief.creative_direction);
    if ((brief.hook_angles || []).length) lines.push('Hook angles: ' + brief.hook_angles.join(' | '));
    if (brief.ai_notes) lines.push('AI notes: ' + brief.ai_notes);
    // Library context
    var msgs = (brief.message_ids || []).map(function(id) { var m = S.messageMap[id]; return m ? m.title + (m.body ? ' — ' + truncate(stripHtml(m.body), 80) : '') : null; }).filter(Boolean);
    if (msgs.length) lines.push('Attached messages: ' + msgs.join(' | '));
    var styles = (brief.style_ids || []).map(function(id) { var s = S.styleMap[id]; return s ? s.name : null; }).filter(Boolean);
    if (styles.length) lines.push('Attached styles: ' + styles.join(', '));
    return lines.join('\n');
  }

  // --- 1. Suggest Ad Sets for an existing Campaign ---
  // Note: brief-to-tree generation now lives entirely inside the New Campaign
  // Wizard (Part 2A `16a-new-campaign-wizard.js` + Part 2B
  // `17b-ai-new-campaign-wizard.js`). The flagship one-shot mega-prompt was
  // removed in favour of staged AI calls — see ncwAIDraftCampaign,
  // ncwAISuggestAdSets, and ncwAISuggestAds.

  function aiSuggestAdSets(campaignId) {
    if (!aiV2_assertConfigured()) return;
    var camp = getCampaignV2(campaignId); if (!camp) return;

    var prompt = 'You are a Meta Ads strategist. Suggest 3 distinct Ad Sets for this Campaign.\n\n';
    prompt += aiV2_campaignContext(camp) + '\n\n';
    var personas = (S.data.personas || []).map(function(p) { return { id: p.id, name: p.name }; });
    if (personas.length) prompt += 'Library personas (use id if matching): ' + personas.map(function(p) { return p.id + '=' + p.name; }).join(', ') + '\n\n';
    prompt += brandSnippet('research');
    prompt += '\n\nRespond JSON only: {"ad_sets":[{"name":"","persona_id":"","audience_overrides":"","optimization_goal":"","brief":{"creative_direction":"","hook_angles":["","",""]}}]}';

    toast('AI suggesting Ad Sets...', 'info');
    callAIWithRetry(prompt, function(parsed) {
      var sets = parsed.ad_sets || [];
      if (sets.length === 0) { toast('AI returned no Ad Sets', 'warning'); return; }
      // Render preview with checkboxes
      var html = '<div class="cp-tree-preview">';
      for (var i = 0; i < sets.length; i++) {
        var s = sets[i];
        var personaName = s.persona_id ? ((S.personaMap[s.persona_id] || {}).name || '?') : '(no persona)';
        var goalLabel = (Constants.META_OPTIMIZATION_GOALS[s.optimization_goal] || {}).label || s.optimization_goal;
        html += '<label class="cp-tree-preview-row"><input type="checkbox" class="cp-tp-set-check" data-set-idx="' + i + '" checked>';
        html += '<div><div class="cp-tree-preview-title">' + icon('crosshairs') + ' ' + esc(s.name) + '</div>';
        html += '<div class="cp-tree-preview-meta">' + icon('user') + ' ' + esc(personaName) + ' · ' + esc(goalLabel || '') + '</div>';
        if (s.brief && s.brief.creative_direction) html += '<div class="cp-tree-preview-desc">' + esc(s.brief.creative_direction) + '</div>';
        html += '</div></label>';
      }
      html += '</div>';

      openModal('AI suggested Ad Sets — review', html, {
        titleIcon: 'sparkles', size: 'lg', saveLabel: icon('plus') + ' Create selected',
        onSave: function() {
          // Snapshot selected indices BEFORE createEntity triggers any re-render
          // (createEntity → renderCurrentView can detach jQuery refs mid-loop).
          var selectedIdx = [];
          $('.cp-tp-set-check:checked').each(function() {
            var i = parseInt(this.getAttribute('data-set-idx'), 10);
            if (!isNaN(i)) selectedIdx.push(i);
          });
          if (selectedIdx.length === 0) { closeModal(); return; }
          closeModal();
          snapshot('AI suggest Ad Sets');
          var created = 0;
          for (var k = 0; k < selectedIdx.length; k++) {
            var sData = sets[selectedIdx[k]]; if (!sData) continue;
            var persona = sData.persona_id ? getPersona(sData.persona_id) : null;
            createEntity('ad_set', {
              campaign_id: campaignId,
              name: sData.name || 'Ad Set',
              persona_id: persona ? persona.id : '',
              persona_snapshot: persona ? buildPersonaSnapshot(persona) : null,
              audience_overrides: sData.audience_overrides || '',
              optimization_goal: sData.optimization_goal || Constants.META_AD_SET_DEFAULTS.optimization_goal,
              brief: $.extend({ creative_direction: '', message_ids: [], style_ids: [], format_ids: [], hook_angles: [], ai_notes: '' }, sData.brief || {})
            });
            created++;
          }
          toast('Created ' + created + ' Ad Set' + (created !== 1 ? 's' : ''), 'success');
        }
      });
    }, function(err) { toast('AI error: ' + err, 'error'); },
       'ai-suggest-ad-sets', BrandService.getSystemPrompt('research'), parseJSON);
  }

  // --- 3. Suggest Ads for an Ad Set ---

  function aiSuggestAds(adSetId) {
    if (!aiV2_assertConfigured()) return;
    var adSet = getAdSet(adSetId); if (!adSet) return;
    var camp = getCampaignV2(adSet.campaign_id);

    var prompt = 'You are a Meta Ads creative director. Generate 3-4 Ads for this Ad Set.\n\n';
    if (camp) prompt += aiV2_campaignContext(camp) + '\n';
    prompt += aiV2_adSetContext(adSet) + '\n\n';
    prompt += brandSnippet('content');
    prompt += '\n\nRules: each Ad has a distinct hook angle. Primary text 90-140 chars, headline ≤27 chars, description ≤27 chars.\n';
    prompt += 'Respond JSON only: {"ads":[{"name":"","creative_type":"single_image","hook":{"text":"","type":"direct"},"creative":{"primary_text":"","headline":"","description":"","cta_type":"LEARN_MORE","cta_link":""}}]}';

    toast('AI suggesting Ads...', 'info');
    callAIWithRetry(prompt, function(parsed) {
      var ads = parsed.ads || [];
      if (ads.length === 0) { toast('AI returned no Ads', 'warning'); return; }
      var html = '<div class="cp-tree-preview">';
      for (var i = 0; i < ads.length; i++) {
        var a = ads[i];
        html += '<label class="cp-tree-preview-row"><input type="checkbox" class="cp-tp-ad-check" data-ad-idx="' + i + '" checked>';
        var ctype = (Constants.META_AD_CREATIVE_TYPES[a.creative_type] || { icon: 'rectangle-ad' });
        html += '<div><div class="cp-tree-preview-title">' + icon(ctype.icon) + ' ' + esc(a.name) + '</div>';
        if (a.hook && a.hook.text) html += '<div class="cp-tree-preview-hook">"' + esc(a.hook.text) + '"</div>';
        if (a.creative && a.creative.primary_text) html += '<div class="cp-tree-preview-desc">' + esc(truncate(a.creative.primary_text, 140)) + '</div>';
        html += '</div></label>';
      }
      html += '</div>';
      openModal('AI suggested Ads — review', html, {
        titleIcon: 'sparkles', size: 'lg', saveLabel: icon('plus') + ' Create selected',
        onSave: function() {
          // Snapshot selected indices BEFORE createEntity triggers any re-render.
          // jQuery refs to checkboxes can be detached mid-loop if the surrounding
          // view re-renders, which made only the first selection actually persist.
          var selectedIdx = [];
          $('.cp-tp-ad-check:checked').each(function() {
            var i = parseInt(this.getAttribute('data-ad-idx'), 10);
            if (!isNaN(i)) selectedIdx.push(i);
          });
          if (selectedIdx.length === 0) { closeModal(); return; }
          closeModal();
          snapshot('AI suggest Ads');
          var created = 0;
          for (var k = 0; k < selectedIdx.length; k++) {
            var aData = ads[selectedIdx[k]]; if (!aData) continue;
            var ad = createEntity('ad', {
              ad_set_id: adSetId,
              name: aData.name || 'Ad',
              creative_type: aData.creative_type || 'single_image',
              hook: $.extend({ text: '', type: 'direct', source_message_id: '', selected_hook_id: '' }, aData.hook || {}),
              creative: $.extend({ primary_text: '', headline: '', description: '', cta_type: 'LEARN_MORE', cta_link: '', display_link: '', tracking_params: '' }, aData.creative || {})
            });
            if (ad) { created++; if (typeof maybeAdvanceAdStatus === 'function') maybeAdvanceAdStatus(ad, 'AI suggested'); }
          }
          toast('Created ' + created + ' Ad' + (created !== 1 ? 's' : ''), 'success');
        }
      });
    }, function(err) { toast('AI error: ' + err, 'error'); },
       'ai-suggest-ads', BrandService.getSystemPrompt('content'), parseJSON);
  }

  // --- 4. Generate Ad Set Brief ---

  function aiGenerateAdSetBrief(adSetId) {
    if (!aiV2_assertConfigured()) return;
    var adSet = getAdSet(adSetId); if (!adSet) return;
    var camp = getCampaignV2(adSet.campaign_id);

    var prompt = 'Generate a strategic Brief for this Ad Set.\n';
    if (camp) prompt += aiV2_campaignContext(camp) + '\n';
    prompt += aiV2_adSetContext(adSet) + '\n\n';
    prompt += brandSnippet('research');
    prompt += '\n\nRespond JSON only: {"creative_direction":"","hook_angles":["","",""],"ai_notes":""}';

    toast('AI drafting brief...', 'info');
    callAIWithRetry(prompt, function(parsed) {
      if (!parsed) { toast('AI returned no brief', 'warning'); return; }
      snapshot('AI Ad Set brief');
      var brief = adSet.brief || {};
      brief.creative_direction = parsed.creative_direction || brief.creative_direction;
      brief.hook_angles = parsed.hook_angles && parsed.hook_angles.length ? parsed.hook_angles : brief.hook_angles;
      brief.ai_notes = parsed.ai_notes || brief.ai_notes;
      saveEntityField('ad_set', adSetId, 'brief', brief);
      logActivity('brief_generated', 'ad_set', adSetId, adSet.name, 'AI generated brief');
      toast('Brief generated', 'success');
    }, function(err) { toast('AI error: ' + err, 'error'); },
       'ai-generate-ad-set-brief', BrandService.getSystemPrompt('research'), parseJSON);
  }

  // --- 5. Generate Ad Hooks (alternatives) ---

  // Open the AI runner modal for the Hook tab's Generate / Regenerate button.
  // Captures an optional steering instruction + provider/model selection,
  // then kicks off `aiGenerateAdHooks` with that context.
  function openHookGenerationModal(adId) {
    if (!aiV2_assertConfigured()) return;
    var ad = getAd(adId); if (!ad) return;
    var lastInstruction = (ad.hook && ad.hook.last_idea_instruction) || '';
    var hasIdeas = !!(ad.hook && ad.hook.ai_ideas && ad.hook.ai_ideas.length);
    openAiRunnerModal({
      title: hasIdeas ? 'Regenerate hook ideas' : 'Generate hook ideas',
      subtitle: hasIdeas ? 'Replaces the current list of ideas.' : 'AI will draft three distinct hook angles for this ad.',
      actionId: 'ai-generate-ad-hooks',
      instructionLabel: 'Angle or steer',
      instructionPlaceholder: 'e.g. lean on social proof · keep them under 8 words · ask a question',
      instructionInitial: lastInstruction,
      instructionRequired: false,
      confirmLabel: hasIdeas ? 'Regenerate' : 'Generate',
      busyLabel: 'Generating…',
      onConfirm: function(ctx, done) {
        aiGenerateAdHooks(adId, ctx.instruction, function(err) { done(err); });
      }
    });
  }

  function aiGenerateAdHooks(adId, instruction, onDone) {
    if (!aiV2_assertConfigured()) { if (onDone) onDone('not configured'); return; }
    var ad = getAd(adId); if (!ad) { if (onDone) onDone('ad not found'); return; }
    var adSet = getAdSet(ad.ad_set_id);
    var camp = adSet ? getCampaignV2(adSet.campaign_id) : null;
    instruction = (instruction || '').trim();

    var prompt = 'Write 3 distinct hook options for this Meta Ad. Each: 1 sentence, max 100 chars, a different angle. Rate each with a single 0-100 score (overall scroll-stopping potential) and a one-sentence "why this works" line.\n\n';
    if (instruction) prompt += 'Extra steer from the user: ' + instruction + '\n\n';
    if (camp) prompt += aiV2_campaignContext(camp) + '\n';
    if (adSet) prompt += aiV2_adSetContext(adSet) + '\n';
    if (ad.creative && ad.creative.primary_text) prompt += 'Current primary text: ' + ad.creative.primary_text + '\n';
    prompt += '\n' + brandSnippet('content');
    prompt += '\n\nHook types: question, bold, story, data, direct, curiosity, challenge.\n';
    prompt += 'Respond JSON only: {"hooks":[{"text":"","type":"","score":0,"psychology":""}]}';

    toast('AI writing hooks...', 'info');
    callAIWithRetry(prompt, function(parsed) {
      var hooks = (parsed && parsed.hooks) || [];
      if (hooks.length === 0) { toast('AI returned no hooks', 'warning'); if (onDone) onDone('empty'); return; }
      var ideas = hooks.map(function(h) {
        var s = h.scores || {};
        var derived = (h.score != null) ? h.score : (s.conversion != null ? s.conversion : (s.readability != null ? s.readability : s.connection));
        return {
          id: generateId('hki'),
          text: String(h.text || '').trim(),
          type: String(h.type || 'direct').trim(),
          score: clamp100(derived),
          psychology: String(h.psychology || '').trim(),
          instruction: instruction,
          generated_at: new Date().toISOString()
        };
      }).filter(function(i) { return i.text; });
      if (ideas.length === 0) { toast('AI returned no usable hooks', 'warning'); if (onDone) onDone('empty'); return; }

      snapshot('AI hook ideas');
      ad.hook = ad.hook || { source_message_id: '', selected_hook_id: '', text: '', type: 'direct' };
      ad.hook.ai_ideas = ideas;
      ad.hook.active_idea_id = '';
      ad.hook.last_idea_instruction = instruction;
      ad.updated = new Date().toISOString();
      buildMaps(); syncToTextarea(); render();
      logActivity('hook_generated', 'ad', adId, ad.name, 'AI generated ' + ideas.length + ' hook ideas' + (instruction ? ' (with steer)' : ''));
      toast('Got ' + ideas.length + ' hook ideas — pick one in the Hook tab', 'success');
      if (onDone) onDone();
    }, function(err) {
      toast('AI error: ' + err, 'error');
      if (onDone) onDone(err);
    }, 'ai-generate-ad-hooks', BrandService.getSystemPrompt('content'), parseJSON);
  }

  function clamp100(n) {
    n = Number(n);
    if (!isFinite(n)) return 0;
    if (n < 0) return 0;
    if (n > 100) return 100;
    return Math.round(n);
  }

  // --- 6. Write Ad Copy — single primary_text variant + AI runner modal ---

  function openCopyWriteModal(adId) {
    if (!aiV2_assertConfigured()) return;
    var ad = getAd(adId); if (!ad) return;
    var lastInstruction = (ad.creative && ad.creative.last_write_instruction) || '';
    openAiRunnerModal({
      title: 'AI write copy',
      subtitle: 'Drafts one primary-text variant for this ad. You can compare it before applying.',
      actionId: 'ai-write-ad-copy',
      instructionLabel: 'Angle or notes',
      instructionPlaceholder: 'e.g. lean on social proof · emphasise outcome · keep it under 100 chars',
      instructionInitial: lastInstruction,
      instructionRequired: false,
      confirmLabel: 'Write',
      busyLabel: 'Writing…',
      onConfirm: function(ctx, done) {
        aiWriteAdCopy(adId, ctx.instruction, function(err) { done(err); });
      }
    });
  }

  function aiWriteAdCopy(adId, instruction, onDone) {
    if (!aiV2_assertConfigured()) { if (onDone) onDone('not configured'); return; }
    var ad = getAd(adId); if (!ad) { if (onDone) onDone('ad not found'); return; }
    var adSet = getAdSet(ad.ad_set_id);
    var camp = adSet ? getCampaignV2(adSet.campaign_id) : null;
    var activeHook = (ad.hook && ad.hook.text) || '';
    instruction = (instruction || '').trim();

    var prompt = 'Write ONE primary-text option for this Meta Ad — the body copy that sits above the media. Aim for 90-140 chars, scroll-stopping, written in the brand voice. Headline and description are out of scope; return primary_text only.\n\n';
    if (instruction) prompt += 'Extra steer from the user: ' + instruction + '\n\n';
    if (camp) prompt += aiV2_campaignContext(camp) + '\n';
    if (adSet) prompt += aiV2_adSetContext(adSet) + '\n';
    if (activeHook) prompt += 'Selected hook (extend this thought — do not repeat verbatim): ' + activeHook + '\n';
    prompt += '\n' + brandSnippet('content');
    prompt += '\nRespond JSON only: {"primary_text":""}';

    toast('AI writing copy...', 'info');
    callAIWithRetry(prompt, function(parsed) {
      var text = String((parsed && parsed.primary_text) || '').trim();
      if (!text) { toast('AI returned no copy', 'warning'); if (onDone) onDone('empty'); return; }
      snapshot('AI copy variant');
      ad.creative = ad.creative || {};
      ad.creative.ai_copy_variants = [{
        id: generateId('cpv'),
        text: text,
        source: 'write',
        instruction: instruction,
        generated_at: new Date().toISOString()
      }];
      ad.creative.last_write_instruction = instruction;
      ad.updated = new Date().toISOString();
      buildMaps(); syncToTextarea(); render();
      logActivity('content_generated', 'ad', adId, ad.name, 'AI wrote primary text' + (instruction ? ' (with steer)' : ''));
      toast('Copy draft ready — compare in the Copy tab', 'success');
      if (onDone) onDone();
    }, function(err) {
      toast('AI error: ' + err, 'error');
      if (onDone) onDone(err);
    }, 'ai-write-ad-copy', BrandService.getSystemPrompt('content'), parseJSON);
  }

  // --- 7. Improve Ad Copy — required instruction + AI runner modal ---

  function openCopyImproveModal(adId) {
    if (!aiV2_assertConfigured()) return;
    var ad = getAd(adId); if (!ad) return;
    var c = ad.creative || {};
    if (!(c.primary_text || '').trim()) { toast('Write some primary text first, then AI can improve it', 'info'); return; }
    openAiRunnerModal({
      title: 'Improve primary text',
      subtitle: 'Tell the AI what to change. The original stays in the textarea until you apply the improvement.',
      actionId: 'ai-improve-ad-copy',
      instructionLabel: 'What should change?',
      instructionPlaceholder: 'e.g. shorter · more emotional · remove jargon · swap "we" for "you"',
      instructionInitial: '',
      instructionRequired: true,
      confirmLabel: 'Improve',
      busyLabel: 'Improving…',
      onConfirm: function(ctx, done) {
        aiImproveAdCopy(adId, ctx.instruction, function(err) { done(err); });
      }
    });
  }

  function aiImproveAdCopy(adId, instruction, onDone) {
    if (!aiV2_assertConfigured()) { if (onDone) onDone('not configured'); return; }
    var ad = getAd(adId); if (!ad) { if (onDone) onDone('ad not found'); return; }
    var c = ad.creative || {};
    if (!(c.primary_text || '').trim()) {
      toast('Write some primary text first, then AI can improve it', 'info');
      if (onDone) onDone('empty source');
      return;
    }
    instruction = (instruction || '').trim();

    var prompt = 'Rewrite this Meta Ad primary text per the user\'s instruction. Keep the same intent and approximate length unless the instruction asks otherwise. Return primary_text only.\n\n';
    prompt += 'User instruction: ' + (instruction || '(make it sharper)') + '\n\n';
    prompt += 'Current primary text:\n' + c.primary_text + '\n\n';
    if (ad.hook && ad.hook.text) prompt += 'Selected hook context: ' + ad.hook.text + '\n\n';
    prompt += brandSnippet('content');
    prompt += '\n\nRespond JSON only: {"primary_text":""}';

    toast('AI improving copy...', 'info');
    callAIWithRetry(prompt, function(parsed) {
      var improved = String((parsed && parsed.primary_text) || '').trim();
      if (!improved) { toast('AI returned nothing', 'warning'); if (onDone) onDone('empty'); return; }
      snapshot('AI improved copy');
      ad.creative = ad.creative || {};
      ad.creative.ai_copy_variants = [{
        id: generateId('cpv'),
        text: improved,
        source: 'improve',
        instruction: instruction,
        generated_at: new Date().toISOString()
      }];
      ad.updated = new Date().toISOString();
      buildMaps(); syncToTextarea(); render();
      logActivity('content_generated', 'ad', adId, ad.name, 'AI improved primary text: ' + (instruction || '(no steer)'));
      toast('Improved copy ready — compare in the Copy tab', 'success');
      if (onDone) onDone();
    }, function(err) {
      toast('AI error: ' + err, 'error');
      if (onDone) onDone(err);
    }, 'ai-improve-ad-copy', BrandService.getSystemPrompt('content'), parseJSON);
  }

  // --- 8. Generate Image Prompt ---

  function aiGenerateAdImagePrompt(adId) {
    if (!aiV2_assertConfigured()) return;
    var ad = getAd(adId); if (!ad) return;
    var img = (ad.media && ad.media.image) || {};
    var adSet = getAdSet(ad.ad_set_id);
    var camp = adSet ? getCampaignV2(adSet.campaign_id) : null;

    var prompt = 'Generate a production-ready AI image prompt for this Meta Ad.\n';
    prompt += 'Aspect ratio: ' + (img.aspect_ratio || '1:1') + '. Style: photorealistic unless brand says otherwise.\n\n';
    if (camp) prompt += aiV2_campaignContext(camp) + '\n';
    if (adSet) prompt += aiV2_adSetContext(adSet) + '\n';
    if (ad.creative && ad.creative.primary_text) prompt += 'Ad copy: ' + ad.creative.primary_text + '\n';
    var existingImagePrompt = img.prompt || img.ai_prompt || img.brief;
    if (existingImagePrompt) prompt += 'Existing image direction (refine this): ' + existingImagePrompt + '\n';
    prompt += '\n' + BrandService.getBrandDesignPrompt();
    prompt += '\n\nReturn JSON only: {"prompt":""}';

    toast('AI generating prompt...', 'info');
    callAIWithRetry(prompt, function(parsed) {
      if (!parsed || !parsed.prompt) { toast('AI returned no prompt', 'warning'); return; }
      snapshot('AI image prompt');
      ad.media = ad.media || {}; ad.media.image = ad.media.image || {};
      ad.media.image.prompt = parsed.prompt;
      ad.updated = new Date().toISOString();
      if (typeof maybeAdvanceAdStatus === 'function') maybeAdvanceAdStatus(ad, 'image prompt');
      buildMaps(); syncToTextarea(); render();
      logActivity('media_generated', 'ad', adId, ad.name, 'AI image prompt');
      toast('Image prompt applied', 'success');
    }, function(err) { toast('AI error: ' + err, 'error'); },
       'ai-generate-ad-image-prompt', BrandService.getSystemPrompt('research'), parseJSON);
  }

  // --- 9. Generate Video Blueprint (scenes) ---

  // --- 10. Generate Video Script (sectioned) ---

  function aiGenerateVideoScript(adId) {
    if (!aiV2_assertConfigured()) return;
    var ad = getAd(adId); if (!ad) return;
    var vid = (ad.media && ad.media.video) || {};
    var adSet = getAdSet(ad.ad_set_id);

    var prompt = 'Write a script for this Meta video Ad as labelled sections (e.g., Hook, Setup, Payoff, CTA). Target duration: ' + (vid.duration_seconds || 30) + 's. Aspect: ' + (vid.aspect_ratio || '9:16') + '.\n\n';
    if (adSet) prompt += aiV2_adSetContext(adSet) + '\n';
    if (vid.concept) prompt += 'Concept: ' + vid.concept + '\n';
    if (ad.hook && ad.hook.text) prompt += 'Hook: ' + ad.hook.text + '\n';
    if (ad.creative && ad.creative.cta_type) prompt += 'CTA: ' + (Constants.META_CTA_TYPES[ad.creative.cta_type] || {}).label + '\n';
    prompt += '\nVisual direction is out of scope here — only write the spoken / on-screen script per section.\n';
    prompt += '\n' + brandSnippet('content');
    prompt += '\n\nReturn 3-6 sections. JSON only: {"sections":[{"label":"Hook","script":""}]}';

    toast('AI writing script...', 'info');
    callAIWithRetry(prompt, function(parsed) {
      var sections = (parsed && parsed.sections) || [];
      if (sections.length === 0) { toast('AI returned no script', 'warning'); return; }
      var normalised = sections.map(function(s) { return { label: String(s.label || '').trim(), script: String(s.script || '').trim() }; })
                               .filter(function(s) { return s.label || s.script; });
      if (normalised.length === 0) { toast('AI returned no script', 'warning'); return; }
      snapshot('AI video script');
      ad.media = ad.media || {}; ad.media.video = ad.media.video || {};
      ad.media.video.script = { sections: normalised };
      ad.updated = new Date().toISOString();
      if (typeof maybeAdvanceAdStatus === 'function') maybeAdvanceAdStatus(ad, 'video script');
      buildMaps(); syncToTextarea(); render();
      logActivity('script_generated', 'ad', adId, ad.name, 'AI script (' + normalised.length + ' sections)');
      toast('Script generated', 'success');
    }, function(err) { toast('AI error: ' + err, 'error'); },
       'ai-generate-video-script', BrandService.getSystemPrompt('content'), parseJSON);
  }

/* ===== src/30-part2b/17b-ai-new-campaign-wizard.js ===== */
  // ============================================================
  // SECTION 17B: AI — NEW CAMPAIGN WIZARD (per-campaign)
  // ============================================================

  function _ncwState() {
    return window._cpPart2A && window._cpPart2A.ncwState;
  }
  function _ncwRefresh() {
    if (window._cpPart2A && typeof window._cpPart2A.refreshNCW === 'function') {
      window._cpPart2A.refreshNCW();
    }
  }
  function _ncwBegin(state)   { state.aiLoading = true;  state.aiActionId = 'ncw-ai'; state.aiError = ''; _ncwRefresh(); }
  function _ncwEndOk(state)   { state.aiLoading = false; state.aiActionId = ''; state.aiError = ''; }
  function _ncwEndErr(state, err) { state.aiLoading = false; state.aiActionId = ''; state.aiError = String(err || 'AI failed').substring(0, 240); }

  // ----- Draft Campaign basics from a brief -----
  // Reads state.campaign.brief, asks AI to fill name/description/objective/
  // budget_mode/bid_strategy/daily_budget. Overwrites the campaign fields on
  // success so the user sees the AI draft and can edit before moving on.
  function ncwAIDraftCampaign() {
    var state = _ncwState(); if (!state) return;
    if (state.aiLoading) return;
    if (!LLMService.isConfigured()) { state.aiError = 'AI not configured — open Settings → AI.'; _ncwRefresh(); return; }

    // Pull the latest brief from the DOM in case the user hasn't tabbed out.
    var $brief = $('#cpNCW [data-ncw-field="campaign.brief"]');
    if ($brief.length) state.campaign.brief = ($brief.val() || '').trim();
    var brief = (state.campaign.brief || '').trim();
    if (!brief) { state.aiError = 'Write a brief first — describe what you\'re selling, who you\'re targeting, and what success looks like.'; _ncwRefresh(); return; }

    _ncwBegin(state);

    var objectives = Object.keys(Constants.META_OBJECTIVES).map(function(k) {
      return '- ' + k + ': ' + Constants.META_OBJECTIVES[k].label + ' — ' + Constants.META_OBJECTIVES[k].description;
    }).join('\n');
    var bidStrategies = Object.keys(Constants.META_BID_STRATEGIES).map(function(k) {
      return '- ' + k + ': ' + Constants.META_BID_STRATEGIES[k].label;
    }).join('\n');

    var prompt = 'You are a Meta Ads strategist. Draft the top-level Campaign settings from the brief below.\n\n';
    prompt += 'Brief:\n' + brief + '\n\n';
    prompt += 'Valid objectives (pick exactly ONE by key):\n' + objectives + '\n\n';
    prompt += 'Valid bid strategies (pick exactly ONE by key):\n' + bidStrategies + '\n\n';
    prompt += 'Budget modes: CBO (Meta allocates across Ad Sets — default for most cases), ABO (per-Ad-Set budgets — pick when ad sets need fixed splits).\n';
    prompt += brandSnippet('research');
    prompt += '\n\nRules:\n';
    prompt += '- name: ≤60 chars, specific and product-oriented (no generic "Q3 Campaign").\n';
    prompt += '- description: ≤200 chars, plain prose explaining the goal.\n';
    prompt += '- objective: must be a key from the list above.\n';
    prompt += '- bid_strategy: must be a key from the list above (default LOWEST_COST_WITHOUT_CAP).\n';
    prompt += '- daily_budget: integer in the brief\'s currency if a budget is stated or strongly implied; otherwise null. Do NOT invent budgets.\n';
    prompt += '- Output strict JSON only, no preamble, no markdown:\n';
    prompt += '{"name":"","description":"","objective":"OUTCOME_...","budget_mode":"CBO|ABO","bid_strategy":"LOWEST_COST_WITHOUT_CAP","daily_budget":NUMBER_OR_NULL}';

    callAIWithRetry(prompt, function(parsed) {
      if (!parsed || typeof parsed !== 'object') { _ncwEndErr(state, 'AI returned no campaign basics'); _ncwRefresh(); return; }
      var cam = state.campaign;
      cam.name        = String(parsed.name || '').trim().substring(0, 80) || cam.name;
      cam.description = String(parsed.description || '').trim().substring(0, 240);
      cam.objective   = Constants.META_OBJECTIVES[parsed.objective] ? parsed.objective : (cam.objective || 'OUTCOME_LEADS');
      cam.budget_mode = parsed.budget_mode === 'ABO' ? 'ABO' : 'CBO';
      cam.bid_strategy = Constants.META_BID_STRATEGIES[parsed.bid_strategy] ? parsed.bid_strategy : 'LOWEST_COST_WITHOUT_CAP';
      var db = parsed.daily_budget;
      cam.daily_budget = (db != null && db !== '' && !isNaN(Number(db)) && Number(db) > 0) ? Number(db) : (cam.daily_budget || '');
      state.stepGenerated[1] = true;
      _ncwEndOk(state);
      _ncwRefresh();
    }, function(err) {
      _ncwEndErr(state, err);
      _ncwRefresh();
    }, 'ncw-ai', BrandService.getSystemPrompt('research'), parseJSON);
  }

  // ----- Suggest Ad Sets from the Campaign brief -----
  function ncwAISuggestAdSets() {
    var state = _ncwState(); if (!state) return;
    if (state.aiLoading) return;
    if (!LLMService.isConfigured()) { state.aiError = 'AI not configured — open Settings → AI.'; _ncwRefresh(); return; }

    _ncwBegin(state);

    var cam = state.campaign || {};
    var personas = (S.data.personas || []).slice(0, 24).map(function(p) {
      return { id: p.id, name: p.name, description: truncate(p.description || '', 100) };
    });
    var objList = Object.keys(Constants.META_OBJECTIVES).join(', ');
    var goalList = Object.keys(Constants.META_OPTIMIZATION_GOALS).join(', ');

    var prompt = 'You are a Meta Ads strategist. Suggest 3 distinct Ad Sets for this Campaign.\n\n';
    prompt += 'Campaign: ' + (cam.name || '(untitled)') + '\n';
    if (cam.description) prompt += 'Description: ' + cam.description + '\n';
    if (cam.objective) prompt += 'Objective: ' + cam.objective + '\n';
    if (cam.budget_mode) prompt += 'Budget mode: ' + cam.budget_mode + '\n';
    if (cam.daily_budget) prompt += 'Daily budget: ' + cam.daily_budget + '\n';
    if (cam.brief) prompt += '\nBrief: ' + cam.brief + '\n';
    if (personas.length) {
      prompt += '\nAvailable personas (use persona_id if a match — exact id, otherwise empty string):\n';
      prompt += personas.map(function(p) { return '- ' + p.id + ': ' + p.name + (p.description ? ' — ' + p.description : ''); }).join('\n') + '\n';
    }
    prompt += brandSnippet('research');
    prompt += '\n\nValid optimization goals (pick one key per Ad Set): ' + goalList;
    prompt += '\nValid objectives: ' + objList;
    prompt += '\n\nRules:';
    prompt += '\n- Generate exactly 3 Ad Sets. Each targets a DIFFERENT angle / audience cut (e.g. pain-point split, life-stage split, intent level).';
    prompt += '\n- Ad Set name ≤60 chars, descriptive (e.g. "Founders — Time-poor"), not generic.';
    prompt += '\n- optimization_goal must be valid for the campaign objective (e.g. OFFSITE_CONVERSIONS for OUTCOME_LEADS/SALES, LINK_CLICKS for OUTCOME_TRAFFIC).';
    prompt += '\n- creative_direction: 1-2 sentences describing the angle and tone for this Ad Set.';
    prompt += '\n- hook_angles: 3 short, distinct hook angles (e.g. "regret of waiting", "shipping speed", "social proof"). 2-6 words each.';
    prompt += '\n- ai_notes: short steer for the ad-writer (constraints, do/don\'ts). Empty string if nothing to add.';
    prompt += '\n- Output strict JSON only, no preamble, no markdown:\n';
    prompt += '{"ad_sets":[{"name":"","persona_id":"","audience_overrides":"","optimization_goal":"","brief":{"creative_direction":"","hook_angles":["","",""],"ai_notes":""}}]}';

    callAIWithRetry(prompt, function(parsed) {
      var sets = (parsed && Array.isArray(parsed.ad_sets)) ? parsed.ad_sets : [];
      var allowedGoals = Constants.META_OPTIMIZATION_GOALS;
      state.ad_sets = sets.slice(0, 4).map(function(s, i) {
        var b = s.brief || {};
        var personaId = (s.persona_id && S.personaMap && S.personaMap[s.persona_id]) ? s.persona_id : '';
        return {
          name: String(s.name || 'Ad Set ' + (i + 1)).trim().substring(0, 80),
          persona_id: personaId,
          audience_overrides: String(s.audience_overrides || '').trim(),
          optimization_goal: allowedGoals[s.optimization_goal] ? s.optimization_goal : 'OFFSITE_CONVERSIONS',
          billing_event: 'IMPRESSIONS',
          attribution_setting: '7d_click',
          brief: {
            creative_direction: String(b.creative_direction || '').trim(),
            message_ids: [],
            style_ids: [],
            format_ids: [],
            hook_angles: Array.isArray(b.hook_angles) ? b.hook_angles.filter(Boolean).slice(0, 5) : [],
            ai_notes: String(b.ai_notes || '').trim()
          },
          ads: [],
          _selected: true
        };
      });
      state.stepGenerated[2] = true;
      _ncwEndOk(state);
      _ncwRefresh();
    }, function(err) {
      _ncwEndErr(state, err);
      _ncwRefresh();
    }, 'ncw-ai', BrandService.getSystemPrompt('research'), parseJSON);
  }

  // ----- Suggest Ads for one Ad Set -----
  function ncwAISuggestAds(setIdx) {
    var state = _ncwState(); if (!state) return;
    if (state.aiLoading) return;
    if (!LLMService.isConfigured()) { state.aiError = 'AI not configured — open Settings → AI.'; _ncwRefresh(); return; }

    var adSet = (state.ad_sets || [])[setIdx]; if (!adSet) return;
    var cam = state.campaign || {};

    state._adsContext = state._adsContext || {};
    state._adsContext[setIdx] = $('#ncwAdsContext').val() || state._adsContext[setIdx] || '';

    _ncwBegin(state);

    var persona = adSet.persona_id ? S.personaMap[adSet.persona_id] : null;
    var ctaList = Object.keys(Constants.META_CTA_TYPES).slice(0, 16).join(', ');

    var prompt = 'You are a Meta Ads creative director. Generate 3 distinct Ads for the Ad Set below.\n\n';
    prompt += 'Campaign: ' + (cam.name || '(untitled)') + '\n';
    if (cam.objective) prompt += 'Objective: ' + cam.objective + '\n';
    if (cam.brief)     prompt += 'Campaign brief: ' + cam.brief + '\n';
    prompt += '\nAd Set: ' + (adSet.name || '') + '\n';
    if (persona)       prompt += 'Persona: ' + persona.name + ' — ' + truncate(persona.description || '', 140) + '\n';
    var brief = adSet.brief || {};
    if (brief.creative_direction) prompt += 'Creative direction: ' + brief.creative_direction + '\n';
    if (brief.hook_angles && brief.hook_angles.length) prompt += 'Hook angles to consider: ' + brief.hook_angles.join(' | ') + '\n';
    if (brief.ai_notes) prompt += 'Writer notes: ' + brief.ai_notes + '\n';
    if (state._adsContext[setIdx]) prompt += '\nAdditional ad direction: ' + state._adsContext[setIdx] + '\n';
    prompt += brandSnippet('content');
    prompt += '\n\nValid CTA keys: ' + ctaList;
    prompt += '\n\nRules:';
    prompt += '\n- Generate exactly 3 Ads. Each uses a DIFFERENT hook angle and hook type — no two Ads should feel interchangeable.';
    prompt += '\n- name ≤60 chars, descriptive (e.g. "Regret hook — testimonial").';
    prompt += '\n- hook.text: the opening line/headline that makes someone stop scrolling. ≤90 chars.';
    prompt += '\n- hook.type: one of question|bold|story|data|direct|curiosity|challenge.';
    prompt += '\n- primary_text: 90-140 chars, conversational, expands on the hook with a single concrete payoff.';
    prompt += '\n- headline: ≤27 chars. description: ≤27 chars. Both must be specific, not generic.';
    prompt += '\n- cta_type: pick from the CTA keys above that fits the objective.';
    prompt += '\n- cta_link: empty string (user fills landing URL later).';
    prompt += '\n- creative_type: pick single_image, single_video, or carousel based on what the hook needs.';
    prompt += '\n- Output strict JSON only, no preamble, no markdown:\n';
    prompt += '{"ads":[{"name":"","creative_type":"single_image","hook":{"text":"","type":"direct"},"creative":{"primary_text":"","headline":"","description":"","cta_type":"LEARN_MORE","cta_link":""}}]}';

    callAIWithRetry(prompt, function(parsed) {
      var ads = (parsed && Array.isArray(parsed.ads)) ? parsed.ads : [];
      var allowedCTAs = Constants.META_CTA_TYPES;
      var allowedTypes = Constants.META_AD_CREATIVE_TYPES;
      var allowedHook = { question:1, bold:1, story:1, data:1, direct:1, curiosity:1, challenge:1 };
      adSet.ads = ads.slice(0, 4).map(function(a, i) {
        var h = a.hook || {}; var cr = a.creative || {};
        return {
          name: String(a.name || 'Ad ' + (i + 1)).trim().substring(0, 80),
          creative_type: allowedTypes[a.creative_type] ? a.creative_type : 'single_image',
          hook: {
            text: String(h.text || '').trim(),
            type: allowedHook[h.type] ? h.type : 'direct'
          },
          creative: {
            primary_text: String(cr.primary_text || '').trim(),
            headline:     String(cr.headline     || '').trim(),
            description:  String(cr.description  || '').trim(),
            cta_type:     allowedCTAs[cr.cta_type] ? cr.cta_type : 'LEARN_MORE',
            cta_link:     String(cr.cta_link     || '').trim()
          },
          media: { image_brief: '', image_prompt: '', video_concept: '' },
          _selected: true
        };
      });
      state.stepGenerated[3] = state.stepGenerated[3] || {};
      state.stepGenerated[3][setIdx] = true;
      _ncwEndOk(state);
      _ncwRefresh();
    }, function(err) {
      _ncwEndErr(state, err);
      _ncwRefresh();
    }, 'ncw-ai', BrandService.getSystemPrompt('content'), parseJSON);
  }

  // ----- Finalize: create Campaign + Ad Sets + Ads -----
  function finalizeNewCampaignWizard() {
    var state = _ncwState(); if (!state) { toast('Wizard state not available.', 'error'); return; }
    state.finalizing = true;
    state.finalizeMsg = 'Creating Campaign…';
    _ncwRefresh();

    setTimeout(function() {
      try { _runNCWFinalize(state); }
      catch(e) {
        console.error('[NCW] Finalize error:', e);
        state.finalizing = false;
        _ncwRefresh();
        toast('Create failed: ' + (e.message || String(e)), 'error');
      }
    }, 150);
  }

  function _runNCWFinalize(state) {
    var C = Constants;
    var cam = state.campaign || {};

    function setMsg(msg) { state.finalizeMsg = msg; _ncwRefresh(); }

    setMsg('Creating Campaign…');
    var campEnt = createEntity('campaign_v2', $.extend({}, C.META_CAMPAIGN_DEFAULTS, {
      name: cam.name || 'Untitled Campaign',
      description: cam.description || '',
      objective: C.META_OBJECTIVES[cam.objective] ? cam.objective : C.META_CAMPAIGN_DEFAULTS.objective,
      budget_mode: cam.budget_mode === 'ABO' ? 'ABO' : 'CBO',
      daily_budget: cam.daily_budget !== '' && cam.daily_budget != null ? Number(cam.daily_budget) : null,
      lifetime_budget: cam.lifetime_budget !== '' && cam.lifetime_budget != null ? Number(cam.lifetime_budget) : null,
      bid_strategy: cam.bid_strategy || C.META_CAMPAIGN_DEFAULTS.bid_strategy,
      start_time: cam.start_time || '',
      stop_time: cam.stop_time || '',
      brief: cam.brief || '',
      ai_instructions: cam.ai_instructions || '',
      status: 'DRAFT'
    }));
    if (!campEnt) throw new Error('Failed to create Campaign');
    state.created.campaignV2Id = campEnt.id;

    var buildPS = (window._cpPart2A && window._cpPart2A.buildPersonaSnapshot) ? window._cpPart2A.buildPersonaSnapshot : null;
    var selSets = (state.ad_sets || []).filter(function(s) { return s._selected; });
    var adSetCount = 0, adCount = 0;

    setMsg('Creating Ad Sets and Ads…');
    for (var i = 0; i < selSets.length; i++) {
      var s = selSets[i];
      var personaEnt = s.persona_id ? getPersona(s.persona_id) : null;
      var brief = s.brief || {};
      var setEnt = createEntity('ad_set', {
        campaign_id: campEnt.id,
        name: s.name || ('Ad Set ' + (i + 1)),
        persona_id: personaEnt ? personaEnt.id : '',
        persona_snapshot: (personaEnt && buildPS) ? buildPS(personaEnt) : null,
        audience_overrides: s.audience_overrides || '',
        optimization_goal: C.META_OPTIMIZATION_GOALS[s.optimization_goal] ? s.optimization_goal : C.META_AD_SET_DEFAULTS.optimization_goal,
        billing_event: s.billing_event || C.META_AD_SET_DEFAULTS.billing_event,
        attribution_setting: s.attribution_setting || C.META_AD_SET_DEFAULTS.attribution_setting,
        brief: {
          creative_direction: brief.creative_direction || '',
          message_ids: brief.message_ids || [],
          style_ids: brief.style_ids || [],
          format_ids: brief.format_ids || [],
          hook_angles: brief.hook_angles || [],
          ai_notes: brief.ai_notes || ''
        }
      });
      if (!setEnt) continue;
      state.created.adSetIds.push(setEnt.id);
      adSetCount++;

      var selAds = (s.ads || []).filter(function(a) { return a._selected; });
      for (var j = 0; j < selAds.length; j++) {
        var ad = selAds[j];
        var cr = ad.creative || {}; var h = ad.hook || {}; var m = ad.media || {};
        var adEnt = createEntity('ad', {
          ad_set_id: setEnt.id,
          name: ad.name || ((setEnt.name || 'Ad Set') + ' — Ad ' + (j + 1)),
          creative_type: C.META_AD_CREATIVE_TYPES[ad.creative_type] ? ad.creative_type : 'single_image',
          hook: { text: h.text || '', type: h.type || 'direct', source_message_id: '', selected_hook_id: '' },
          creative: {
            primary_text: cr.primary_text || '',
            headline:     cr.headline     || '',
            description:  cr.description  || '',
            cta_type:     C.META_CTA_TYPES[cr.cta_type] ? cr.cta_type : 'LEARN_MORE',
            cta_link:     cr.cta_link     || '',
            display_link: '', tracking_params: ''
          },
          media: {
            image: { asset_id: '', prompt: m.image_prompt || m.image_brief || '', aspect_ratio: '1:1' },
            video: { asset_id: '', duration_seconds: 30, aspect_ratio: '9:16', concept: m.video_concept || '', script: { sections: [] } },
            carousel_cards: []
          }
        });
        if (adEnt) {
          state.created.adIds.push(adEnt.id);
          adCount++;
          if (typeof window._cpMaybeAdvanceAdStatus === 'function') window._cpMaybeAdvanceAdStatus(adEnt, 'new campaign wizard');
        }
      }
    }

    setMsg('Finishing up…');
    logActivity('campaign_v2_created', 'campaign_v2', campEnt.id, campEnt.name,
      'New Campaign wizard: ' + adSetCount + ' Ad Set(s), ' + adCount + ' Ad(s)');
    buildMaps();
    syncToTextarea();

    $('.cp-ncw').remove();

    S.selectedCampaignV2Id = campEnt.id;
    S.selectedAdSetId = null; S.selectedAdId = null;
    navigate('campaign_workspace', { hash: 'campaign/' + campEnt.id });

    toast(
      'Campaign created with ' + adSetCount + ' Ad Set' + (adSetCount !== 1 ? 's' : '') +
      ' and ' + adCount + ' Ad' + (adCount !== 1 ? 's' : '') + '.',
      'success', 5000
    );
  }

/* ===== src/30-part2b/18-ai-setup-wizard.js ===== */
  // ============================================================
  // SECTION 15b: SETUP WIZARD AI GENERATORS
  // ============================================================

  // Strict-JSON rules appended to every prompt to discourage prose / markdown.
  var SW_JSON_RULES =
    '\n\nRules: Respond with RAW JSON ONLY. No markdown fences. No preamble. ' +
    'No prose before, after, or between fields. If a value is unknown, return ' +
    'an empty string rather than text like "N/A" or "unknown".';

  function _swState() {
    return window._cpPart2A && window._cpPart2A.setupWizardState;
  }

  function _swRefresh() {
    if (window._cpPart2A && typeof window._cpPart2A.refreshSetupWizard === 'function') {
      window._cpPart2A.refreshSetupWizard();
    }
  }

  // Consistent workspace context block injected into every prompt.
  function _swWorkspaceBlock(ws) {
    var lines = ['Workspace context:'];
    if (ws.name)               lines.push('Workspace: ' + ws.name);
    if (ws.product_name)       lines.push('Product: ' + ws.product_name);
    if (ws.description)        lines.push('Description: ' + ws.description);
    if (ws.target_audience)    lines.push('Target audience: ' + ws.target_audience);
    if (ws.brand_voice)        lines.push('Brand voice: ' + ws.brand_voice);
    if (ws.objective)          lines.push('Objective hint: ' + ws.objective);
    if (ws.custom_instructions) lines.push('Custom instructions: ' + ws.custom_instructions);
    return lines.join('\n') + '\n';
  }

  // The "key" passed in is a string label (personas, painpoints, messages,
  // stylesFormats, campaignIdeas). It's used both for the generation-done
  // flag and the lastGeneratedAt timestamp.
  function _swBeginAI(state, key) {
    state.aiLoading   = true;
    state.aiActionId  = 'sw-ai-config';
    state.aiStartedAt = Date.now();
    state.aiError     = '';
    state.stepGenerated[key] = false;
  }

  function _swEndAISuccess(state, key) {
    state.aiLoading  = false;
    state.aiActionId = '';
    state.aiError    = '';
    state.stepGenerated[key] = true;
    state.created = state.created || {};
    state.created.lastGeneratedAt = state.created.lastGeneratedAt || {};
    state.created.lastGeneratedAt[key] = Date.now();
  }

  function _swEndAIError(state, key, err) {
    state.aiLoading  = false;
    state.aiActionId = '';
    state.aiError    = String(err || 'AI generation failed').substring(0, 240);
    state.stepGenerated[key] = true;
  }

  // After a successful generation, in Full Auto mode we may chain to the
  // next sub-stage (Stage 2: personas → painpoints) or schedule an auto-
  // advance to the next stage. These helpers live on Part 2A; this lets
  // Part 2B fire them without taking a direct reference.
  function _swSignalGenerated(key) {
    if (!window._cpPart2A) return;
    var P2A = window._cpPart2A;
    if (key === 'personas' && typeof P2A._swAfterPersonasGenerated === 'function') {
      P2A._swAfterPersonasGenerated();
    } else if (key === 'painpoints' && typeof P2A._swAfterPainPointsGenerated === 'function') {
      P2A._swAfterPainPointsGenerated();
    } else if (typeof P2A._swAfterStageGenerated === 'function') {
      P2A._swAfterStageGenerated();
    }
  }

  // ----- 1. Personas -----

  function swAIGeneratePersonas() {
    var state = _swState();
    if (!state) { console.warn('[SW] setupWizardState not available'); return; }
    if (state.aiLoading) return;
    if (!LLMService.isConfigured()) { state.aiError = 'AI not configured — check Settings → AI.'; _swRefresh(); return; }

    _swBeginAI(state, 'personas');
    _swRefresh();

    var ws    = state.workspace || {};
    var extra = state._personaContext || '';

    var prompt = 'You are a senior marketing strategist. Create 4-6 DISTINCT buyer persona profiles for the product below. Each persona must be measurably different — different role, different psychographics, different demographics.\n\n';
    prompt += _swWorkspaceBlock(ws);
    if (extra) prompt += 'Additional persona context: ' + extra + '\n';
    prompt += brandSnippet('persona');
    prompt += '\n\nSchema (return ONLY a JSON array of objects matching this shape):\n';
    prompt += '[{ "name": "The [Type] [Role]",\n';
    prompt += '   "description": "1-2 sentence character summary anchored in their job-to-be-done",\n';
    prompt += '   "demographics": {\n';
    prompt += '     "age_range": "NN-NN",\n';
    prompt += '     "gender": "Male|Female|Mixed|Non-binary|All",\n';
    prompt += '     "location": "Region or city archetype",\n';
    prompt += '     "occupation": "Specific job title",\n';
    prompt += '     "income_level": "$X-$Y or qualitative",\n';
    prompt += '     "education": "level",\n';
    prompt += '     "industry": "industry vertical"\n';
    prompt += '   },\n';
    prompt += '   "psychographics": {\n';
    prompt += '     "desires": "1 sentence — what they want most",\n';
    prompt += '     "fears": "1 sentence — what blocks them",\n';
    prompt += '     "motivations": "1 sentence — what drives action",\n';
    prompt += '     "values": "1 sentence — what they believe in"\n';
    prompt += '   } }]';
    prompt += SW_JSON_RULES;

    callAIWithRetry(prompt, function(parsed) {
      var arr = Array.isArray(parsed) ? parsed : (parsed && parsed.personas ? parsed.personas : []);
      var clean = arr
        .filter(function(p) { return p && p.name && p.description; })
        .slice(0, 6)
        .map(function(p) {
          return {
            name:           String(p.name).trim(),
            description:    String(p.description).trim(),
            demographics:   p.demographics  || {},
            psychographics: p.psychographics || {},
            _selected: true
          };
        });
      state.personas = clean;
      _swEndAISuccess(state, 'personas');
      _swRefresh();
      _swSignalGenerated('personas');
    }, function(err) {
      _swEndAIError(state, 'personas', err);
      _swRefresh();
    }, 'sw-ai-config', BrandService.getSystemPrompt('persona'), parseJSON);
  }

  // ----- 2. Pain Points -----

  function swAIGeneratePainPoints() {
    var state = _swState();
    if (!state) { console.warn('[SW] setupWizardState not available'); return; }
    if (state.aiLoading) return;
    if (!LLMService.isConfigured()) { state.aiError = 'AI not configured — check Settings → AI.'; _swRefresh(); return; }

    var selPersonas = (state.personas || []).filter(function(p) { return p._selected; });
    if (!selPersonas.length) {
      state.aiError = 'No personas selected yet. Select at least one persona above before generating pain points.';
      _swRefresh();
      return;
    }

    _swBeginAI(state, 'painpoints');
    _swRefresh();

    var ws    = state.workspace || {};
    var extra = state._ppContext || '';

    var personaLines = selPersonas.map(function(p, i) {
      var d = p.demographics || {};
      var line = i + '. ' + (p.name || 'Persona ' + i) + ' — ' + (p.description || '');
      if (d.occupation) line += ' [' + d.occupation + ']';
      return line;
    }).join('\n');

    var prompt = 'You are a marketing strategist. Generate 3-4 SPECIFIC pain points for EACH persona listed below. Pain points must be concrete (e.g. "spends 6 hrs/week reconciling spreadsheets") rather than abstract ("lacks time").\n\n';
    prompt += _swWorkspaceBlock(ws);
    prompt += '\nSelected personas (use persona_idx to match):\n' + personaLines + '\n';
    if (extra) prompt += '\nAdditional context: ' + extra + '\n';
    prompt += brandSnippet('persona');
    prompt += '\n\nSchema (return ONLY a JSON array):\n';
    prompt += '[{ "pain_point": "specific challenge they face",\n';
    prompt += '   "solution": "1 sentence: how this product solves it",\n';
    prompt += '   "category": "Productivity|Cost / Budget|Knowledge Gap|Competition|Growth",\n';
    prompt += '   "persona_idx": INTEGER (0 to ' + (selPersonas.length - 1) + ') }]';
    prompt += SW_JSON_RULES;

    callAIWithRetry(prompt, function(parsed) {
      var arr = Array.isArray(parsed) ? parsed : (parsed && parsed.pain_points ? parsed.pain_points : []);
      var allowedCats = { 'Productivity':1, 'Cost / Budget':1, 'Knowledge Gap':1, 'Competition':1, 'Growth':1 };
      var clean = arr
        .filter(function(pp) { return pp && pp.pain_point && String(pp.pain_point).trim(); })
        .map(function(pp) {
          // Clamp persona_idx into selPersonas range, then translate to real state.personas index
          var idx = parseInt(pp.persona_idx, 10);
          if (isNaN(idx) || idx < 0 || idx >= selPersonas.length) idx = 0;
          var realIdx = (state.personas || []).indexOf(selPersonas[idx]);
          var cat = pp.category && allowedCats[pp.category] ? pp.category : '';
          return {
            pain_point:   String(pp.pain_point).trim(),
            solution:     String(pp.solution || '').trim(),
            category:     cat,
            _persona_idx: realIdx >= 0 ? realIdx : 0,
            _selected:    true
          };
        });
      state.pain_points = clean;
      _swEndAISuccess(state, 'painpoints');
      _swRefresh();
      _swSignalGenerated('painpoints');
    }, function(err) {
      _swEndAIError(state, 'painpoints', err);
      _swRefresh();
    }, 'sw-ai-config', BrandService.getSystemPrompt('research'), parseJSON);
  }

  // ----- 3. Messages -----

  function swAIGenerateMessages() {
    var state = _swState();
    if (!state) return;
    if (state.aiLoading) return;
    if (!LLMService.isConfigured()) { state.aiError = 'AI not configured — check Settings → AI.'; _swRefresh(); return; }

    _swBeginAI(state, 'messages');
    _swRefresh();

    var ws            = state.workspace || {};
    var selPersonas   = (state.personas    || []).filter(function(p)  { return p._selected; });
    var selPainPoints = (state.pain_points || []).filter(function(pp) { return pp._selected; });
    var extra         = state._messageContext || '';

    var personaLines = selPersonas.slice(0, 4).map(function(p) {
      return '- ' + (p.name || 'Persona') + ': ' + (p.description || '');
    }).join('\n');

    var ppLines = selPainPoints.slice(0, 8).map(function(pp) {
      return '- ' + (pp.pain_point || '');
    }).join('\n');

    var prompt = 'You are a direct-response copywriter. Create 5-6 DISTINCT ad message angles for the product below. Each angle must use a different theme and different hook type. Each message body must be a usable starter for Meta primary text (≤180 chars).\n\n';
    prompt += _swWorkspaceBlock(ws);
    if (personaLines) prompt += '\nTarget personas:\n' + personaLines + '\n';
    if (ppLines)      prompt += '\nKey pain points to leverage:\n' + ppLines + '\n';
    if (extra)        prompt += '\nAdditional context: ' + extra + '\n';
    prompt += brandSnippet('content');
    prompt += '\n\nSchema (return ONLY a JSON array):\n';
    prompt += '[{ "name": "The [Angle Name]",\n';
    prompt += '   "description": "2 sentences: how this angle positions the product",\n';
    prompt += '   "theme": "Transformation|Social Proof|FOMO|Problem-Solution|Authority|Curiosity|Urgency",\n';
    prompt += '   "hook_type": "Bold Claim|Question|Shocking Stat|Story|Challenge|Testimonial",\n';
    prompt += '   "funnel_stage": "top|mid|bot",\n';
    prompt += '   "body": "1-2 sentence ad-ready primary text starter, ≤180 chars" }]';
    prompt += SW_JSON_RULES;

    callAIWithRetry(prompt, function(parsed) {
      var arr = Array.isArray(parsed) ? parsed : (parsed && parsed.messages ? parsed.messages : []);
      var clean = arr
        .filter(function(m) { return m && m.name && (m.description || m.body); })
        .slice(0, 6)
        .map(function(m) {
          return {
            name:         String(m.name).trim(),
            description:  String(m.description || '').trim(),
            theme:        String(m.theme || '').trim(),
            hook_type:    String(m.hook_type || '').trim(),
            funnel_stage: ['top','mid','bot'].indexOf(m.funnel_stage) >= 0 ? m.funnel_stage : 'top',
            body:         String(m.body || '').trim(),
            _selected:    true
          };
        });
      state.messages = clean;
      _swEndAISuccess(state, 'messages');
      _swRefresh();
      _swSignalGenerated('messages');
    }, function(err) {
      _swEndAIError(state, 'messages', err);
      _swRefresh();
    }, 'sw-ai-config', BrandService.getSystemPrompt('content'), parseJSON);
  }

  // ----- 4. Styles & Formats -----

  function swAIGenerateStylesFormats() {
    var state = _swState();
    if (!state) return;
    if (state.aiLoading) return;
    if (!LLMService.isConfigured()) { state.aiError = 'AI not configured — check Settings → AI.'; _swRefresh(); return; }

    _swBeginAI(state, 'stylesFormats');
    _swRefresh();

    var ws    = state.workspace || {};
    var extra = state._styleFormatContext || '';

    var prompt = 'You are a creative director and media strategist. Generate creative styles and ad formats for the product below. Styles describe the visual/tone treatment; formats describe the technical container (aspect ratio, platform).\n\n';
    prompt += _swWorkspaceBlock(ws);
    if (extra) prompt += 'Additional context: ' + extra + '\n';
    prompt += brandSnippet('content');
    prompt += '\n\nSchema (return ONLY a JSON object with two arrays):\n';
    prompt += '{\n';
    prompt += '  "styles":  [ { "name": "Style name", "description": "1-2 sentences: visual + creative direction" } ],\n';
    prompt += '  "formats": [ { "name": "Format name", "description": "1-2 sentences: specs + best use",\n';
    prompt += '                 "category": "Shoot|UGC|Graphic|Animation" } ]\n';
    prompt += '}\n';
    prompt += 'Generate 4-5 styles and 6-8 formats covering Meta Feed, Reels/Stories (9:16), TikTok-native, Square 1:1, and Carousel.';
    prompt += SW_JSON_RULES;

    callAIWithRetry(prompt, function(parsed) {
      var stylesArr  = (parsed && Array.isArray(parsed.styles))  ? parsed.styles  : [];
      var formatsArr = (parsed && Array.isArray(parsed.formats)) ? parsed.formats : [];
      var allowedCats = { 'Shoot':1, 'UGC':1, 'Graphic':1, 'Animation':1 };
      state.styles = stylesArr
        .filter(function(s) { return s && s.name && s.description; })
        .slice(0, 5)
        .map(function(s) {
          return { name: String(s.name).trim(), description: String(s.description).trim(), _selected: true };
        });
      state.formats = formatsArr
        .filter(function(f) { return f && f.name && f.description; })
        .slice(0, 8)
        .map(function(f) {
          var cat = f.category && allowedCats[f.category] ? f.category : '';
          return { name: String(f.name).trim(), description: String(f.description).trim(), category: cat, _selected: true };
        });
      _swEndAISuccess(state, 'stylesFormats');
      _swRefresh();
      _swSignalGenerated('stylesFormats');
    }, function(err) {
      _swEndAIError(state, 'stylesFormats', err);
      _swRefresh();
    }, 'sw-ai-config', BrandService.getSystemPrompt('content'), parseJSON);
  }

  // ----- 5. Campaign Ideas (Stage 5) -----
  //
  // Stage 5 produces a list of campaign IDEAS (just name + objective +
  // brief + target persona + message references). Each idea becomes a draft
  // campaign_v2 on launch — Ad Sets and Ads are built later by the
  // per-campaign wizard from the campaign workspace.

  function swAIGenerateCampaignIdeas() {
    var state = _swState();
    if (!state) return;
    if (state.aiLoading) return;
    if (!LLMService.isConfigured()) { state.aiError = 'AI not configured — check Settings → AI.'; _swRefresh(); return; }

    _swBeginAI(state, 'campaignIdeas');
    _swRefresh();

    var ws            = state.workspace || {};
    var selPersonas   = (state.personas    || []).filter(function(p)  { return p._selected; });
    var selPainPoints = (state.pain_points || []).filter(function(pp) { return pp._selected; });
    var selMessages   = (state.messages    || []).filter(function(m)  { return m._selected; });
    var extra         = state._campaignIdeasContext || '';

    if (!selPersonas.length) {
      _swEndAIError(state, 'campaignIdeas', 'No personas selected. Go back to Stage 2 and select at least one.');
      _swRefresh();
      return;
    }

    var personaLines = selPersonas.map(function(p, i) {
      var d = p.demographics || {};
      return i + '. ' + (p.name || 'Persona ' + i) + ' — ' + truncate(p.description || '', 90) + (d.occupation ? ' [' + d.occupation + ']' : '');
    }).join('\n');

    var ppLines = selPainPoints.slice(0, 8).map(function(pp) {
      return '- ' + truncate(pp.pain_point || '', 100);
    }).join('\n');

    var messageLines = selMessages.map(function(m, i) {
      return i + '. ' + (m.name || 'Message ' + i) + ' [' + (m.theme || '?') + '] — ' + truncate(m.description || m.body || '', 90);
    }).join('\n');

    var objList = Object.keys(Constants.META_OBJECTIVES).join(', ');

    var prompt = 'You are a Meta Ads strategist. Propose 3-5 distinct CAMPAIGN IDEAS for the workspace below.\n\n';
    prompt += _swWorkspaceBlock(ws);
    prompt += '\nSelected personas (use persona_idx, 0-based from this list, or -1 for none):\n' + personaLines + '\n';
    if (ppLines)      prompt += '\nKey pain points:\n' + ppLines + '\n';
    if (messageLines) prompt += '\nSelected messages (use message_idx_list, 0-based):\n' + messageLines + '\n';
    if (extra)        prompt += '\nAdditional direction for the ideas: ' + extra + '\n';
    prompt += brandSnippet('research');
    prompt += '\n\nAvailable Meta objectives: ' + objList + '\n';
    prompt += '\nRules:\n';
    prompt += '- Propose 3-5 campaign ideas. Each idea is ONE campaign — no ad sets or ads yet (those are built per-campaign later).\n';
    prompt += '- Ideas must be DIFFERENT in angle or audience cut, not minor variations.\n';
    prompt += '- Each idea targets ONE primary persona (persona_idx) or leave -1 for cross-persona.\n';
    prompt += '- message_idx_list is a short subset (1-3 ids) of message indices that fit the campaign\'s angle.\n';
    prompt += '- name: ≤50 chars. brief: 2-3 sentences explaining the angle, goal, and "why now".\n';
    prompt += '\nSchema (return ONLY this JSON, no preamble):\n';
    prompt += '{\n';
    prompt += '  "ideas": [{\n';
    prompt += '    "name": "Campaign name (≤50 chars)",\n';
    prompt += '    "objective": "OUTCOME_*",\n';
    prompt += '    "brief": "2-3 sentence brief — angle, goal, why now",\n';
    prompt += '    "persona_idx": INTEGER (0-based, or -1 for cross-persona),\n';
    prompt += '    "message_idx_list": [INTEGER, ...]\n';
    prompt += '  }]\n';
    prompt += '}';
    prompt += SW_JSON_RULES;

    callAIWithRetry(prompt, function(parsed) {
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.ideas)) {
        _swEndAIError(state, 'campaignIdeas', 'AI returned an invalid response. Try regenerating.');
        _swRefresh();
        return;
      }
      var allowedObj = Constants.META_OBJECTIVES;
      var clampIdxList = function(arr, maxN) {
        return (Array.isArray(arr) ? arr : [])
          .map(function(i) { return parseInt(i, 10); })
          .filter(function(i) { return !isNaN(i) && i >= 0 && i < maxN; });
      };

      state.campaign_ideas = (parsed.ideas || []).slice(0, 8).map(function(c) {
        var pi = parseInt(c.persona_idx, 10);
        if (isNaN(pi) || pi < -1 || pi >= selPersonas.length) pi = -1;
        return {
          name:             String(c.name || 'Untitled campaign').trim().substring(0, 80),
          objective:        allowedObj[c.objective] ? c.objective : 'OUTCOME_LEADS',
          brief:            String(c.brief || '').trim(),
          persona_idx:      pi,
          message_idx_list: clampIdxList(c.message_idx_list, selMessages.length),
          _selected:        true
        };
      });

      _swEndAISuccess(state, 'campaignIdeas');
      _swRefresh();
      _swSignalGenerated('campaignIdeas');
    }, function(err) {
      _swEndAIError(state, 'campaignIdeas', err);
      _swRefresh();
    }, 'sw-ai-config', BrandService.getSystemPrompt('research'), parseJSON);
  }

/* ===== src/30-part2b/19-ai-setup-finalize.js ===== */
  // ============================================================
  // SECTION 15c: SETUP WIZARD — FINALIZE (Meta v2, ideas only)
  // ============================================================
  //
  // Creates library entities (personas / pain points / messages / styles /
  // formats), then one DRAFT campaign_v2 per selected campaign idea.
  // Ad Sets and Ads are NOT built here — the user runs the per-campaign
  // wizard from inside the campaign workspace to build those out.

  function finalizeSetupWizard() {
    var state = _swState();
    if (!state) { toast('Wizard state not available.', 'error'); return; }

    state.finalizing  = true;
    state.finalizeMsg = 'Preparing your workspace…';
    _swRefresh();

    setTimeout(function() {
      try {
        _runFinalizeSetup(state);
      } catch(e) {
        console.error('[SW] Finalize error:', e);
        state.finalizing = false;
        _swRefresh();
        toast('Setup failed: ' + (e.message || String(e)), 'error');
      }
    }, 200);
  }

  function _runFinalizeSetup(state) {
    var ws = state.workspace || {};
    var C  = Constants;

    // --- Category maps ---
    var ppCatMap = {
      'Productivity':  'ppc_productivity',
      'Cost / Budget': 'ppc_cost',
      'Knowledge Gap': 'ppc_knowledge',
      'Competition':   'ppc_competition',
      'Growth':        'ppc_growth'
    };
    var vfCatMap = {
      'Shoot':     'vfc_shoot',
      'UGC':       'vfc_ugc',
      'Graphic':   'vfc_graphic',
      'Animation': 'vfc_animation'
    };
    var funnelMap = { 'top': 'fs_top', 'mid': 'fs_mid', 'bot': 'fs_bot' };

    function setMsg(msg) {
      state.finalizeMsg = msg;
      _swRefresh();
    }

    // ---- 1. Workspace settings ----
    setMsg('Saving workspace settings…');
    if (ws.name)                S.meta.workspace.name           = ws.name;
    if (!S.meta.workspace.created) S.meta.workspace.created     = new Date().toISOString();
    if (ws.product_name)        S.meta.setup.product_name       = ws.product_name;
    if (ws.objective)           S.meta.setup.objective          = ws.objective;
    if (ws.custom_instructions) S.meta.setup.custom_instructions = ws.custom_instructions;
    // Mark Meta v2 enabled — there is no legacy path
    S.meta.setup.meta_v2 = true;

    // ---- 2. Personas ----
    setMsg('Creating personas…');
    var personaIdxToId = {};
    var selPersonas = (state.personas || []).filter(function(p) { return p._selected; });
    for (var pi = 0; pi < selPersonas.length; pi++) {
      var p   = selPersonas[pi];
      var oi  = (state.personas || []).indexOf(p);
      var dem = p.demographics   || {};
      var psy = p.psychographics || {};
      var pEnt = createEntity('persona', {
        name: p.name || ('Persona ' + (pi + 1)), description: p.description || '',
        demographics: {
          age_range:    dem.age_range    || '', gender:       dem.gender       || 'all',
          location:     dem.location     || '', income_level: dem.income_level || '',
          education:    dem.education    || '', occupation:   dem.occupation   || ''
        },
        psychographics: {
          desires:     psy.desires     || '', fears:       psy.fears       || '',
          motivations: psy.motivations || '', values:      psy.values      || ''
        }
      });
      personaIdxToId[oi] = pEnt.id;
      state.created.personaIds.push(pEnt.id);
    }

    // ---- 3. Pain Points ----
    setMsg('Creating pain points…');
    var selPPs = (state.pain_points || []).filter(function(pp) { return pp._selected; });
    for (var ppi = 0; ppi < selPPs.length; ppi++) {
      var pp    = selPPs[ppi];
      var ppEnt = createEntity('pain_point', {
        pain_point: pp.pain_point || '',
        solution:   pp.solution   || '',
        category:   ppCatMap[pp.category] || pp.category || ''
      });
      state.created.painPointIds.push(ppEnt.id);
    }

    buildMaps();

    // ---- 4. Messages ----
    setMsg('Creating messages…');
    var messageIdxToId = {};
    var selMessages = (state.messages || []).filter(function(m) { return m._selected; });
    for (var mi = 0; mi < selMessages.length; mi++) {
      var m    = selMessages[mi];
      var omi  = (state.messages || []).indexOf(m);
      var fStg = funnelMap[m.funnel_stage] || '';
      var mEnt = createEntity('message', {
        title:         m.name        || ('Message ' + (mi + 1)),
        body:          m.body        || m.description || '',
        theme:         m.theme       || '',
        funnel_stages: fStg ? [fStg] : [],
        hooks:         m.hook_type ? [{ id: generateId('hk'), hook_type: m.hook_type, text: '' }] : []
      });
      messageIdxToId[omi] = mEnt.id;
      state.created.messageIds.push(mEnt.id);
    }

    // ---- 5. Styles ----
    setMsg('Creating styles…');
    var styleIdxToId = {};
    var selStyles = (state.styles || []).filter(function(s) { return s._selected; });
    for (var si = 0; si < selStyles.length; si++) {
      var sty  = selStyles[si];
      var osi  = (state.styles || []).indexOf(sty);
      var sEnt = createEntity('style', {
        name: sty.name || ('Style ' + (si + 1)), description: sty.description || ''
      });
      styleIdxToId[osi] = sEnt.id;
      state.created.styleIds.push(sEnt.id);
    }

    // ---- 6. Formats ----
    setMsg('Creating formats…');
    var formatIdxToId = {};
    var selFormats = (state.formats || []).filter(function(f) { return f._selected; });
    for (var fi = 0; fi < selFormats.length; fi++) {
      var fmt  = selFormats[fi];
      var ofi  = (state.formats || []).indexOf(fmt);
      var fEnt = createEntity('visual_format', {
        name:        fmt.name        || ('Format ' + (fi + 1)),
        description: fmt.description || '',
        category:    vfCatMap[fmt.category] || fmt.category || ''
      });
      formatIdxToId[ofi] = fEnt.id;
      state.created.formatIds.push(fEnt.id);
    }

    buildMaps();

    // ---- 7. Campaign ideas → draft campaign_v2 entities ----
    setMsg('Creating Campaigns…');
    var selIdeas = (state.campaign_ideas || []).filter(function(c) { return c._selected; });
    var campaignCount = 0;
    var firstCampaignId = '';

    for (var ii = 0; ii < selIdeas.length; ii++) {
      var idea = selIdeas[ii];

      // Map wizard message indices → real entity ids
      var ideaMsgIds = (idea.message_idx_list || []).map(function(i) {
        var realI = selMessages[i] ? (state.messages || []).indexOf(selMessages[i]) : -1;
        return realI >= 0 ? messageIdxToId[realI] : null;
      }).filter(Boolean);

      // Map persona idx → real entity id (or empty)
      var ideaPersonaEntId = '';
      if (idea.persona_idx != null && idea.persona_idx >= 0) {
        var personaWizard = selPersonas[idea.persona_idx];
        var personaRealIdx = personaWizard ? (state.personas || []).indexOf(personaWizard) : -1;
        if (personaRealIdx >= 0) ideaPersonaEntId = personaIdxToId[personaRealIdx] || '';
      }

      // Compose a brief that captures the linked persona so the per-campaign
      // wizard has full context to pick up.
      var briefText = idea.brief || '';
      if (ideaPersonaEntId) {
        var pEnt = getPersona(ideaPersonaEntId);
        if (pEnt && pEnt.name) {
          briefText = (briefText ? briefText + '\n\n' : '') + 'Target persona: ' + pEnt.name;
        }
      }

      var campEnt = createEntity('campaign_v2', $.extend({}, C.META_CAMPAIGN_DEFAULTS, {
        name:        idea.name || 'Untitled campaign',
        description: '',
        objective:   C.META_OBJECTIVES[idea.objective] ? idea.objective : C.META_CAMPAIGN_DEFAULTS.objective,
        brief:       briefText,
        ai_instructions: ideaMsgIds.length ? 'Linked message ids: ' + ideaMsgIds.join(',') : '',
        status:      'DRAFT'
      }));
      if (!campEnt) continue;
      state.created.campaignV2Ids.push(campEnt.id);
      if (!firstCampaignId) firstCampaignId = campEnt.id;
      campaignCount++;
    }

    // ---- 8. Mark setup complete + log ----
    setMsg('Finishing up…');
    S.meta.setup.setup_complete = true;
    logActivity(
      'setup_completed', '', '', ws.name || 'Workspace',
      'Setup wizard: created ' + campaignCount + ' Campaign idea' + (campaignCount !== 1 ? 's' : '')
    );
    buildMaps();
    syncToTextarea();

    // ---- 9. Clear session & close wizard ----
    if (window._cpPart2A && typeof window._cpPart2A.swClearSession === 'function') {
      window._cpPart2A.swClearSession();
    }
    $('.cp-setup-wizard').remove();

    // ---- 10. Re-render app shell & navigate to Campaigns list ----
    if (window._cpRenderAppShell) {
      $('#cpApp').html(window._cpRenderAppShell());
      $('.cp-ai-picker-loading').each(function() {
        var actionId = $(this).data('pending-action');
        if (actionId) $(this).replaceWith(LLMService.renderInlinePicker(actionId));
      });
      updateAIStatusIndicator();
    }
    S.selectedCampaignV2Id = null;
    S.selectedAdSetId = null;
    S.selectedAdId = null;
    navigate('meta_campaigns');

    toast(
      'Workspace ready! Created ' + campaignCount + ' Campaign idea' + (campaignCount !== 1 ? 's' : '') +
      '. Open one and run "AI Setup for this Campaign" to build out Ad Sets and Ads.',
      'success', 6000
    );
  }

/* ===== src/30-part2b/20-view-research-lab.js ===== */
  // ============================================================
  // SECTION 16: RESEARCH LAB VIEW
  // ============================================================

  function renderResearchView() {
    var researchTab = S._researchTab || 'personas';
    var tabs = [
      { key: 'personas',    label: 'Personas',     icon: 'users',       color: '#9334e9', entityType: 'Persona' },
      { key: 'pain_points', label: 'Pain Points',  icon: 'bolt',        color: '#d93025', entityType: 'Pain Point' },
      { key: 'messages',    label: 'Messages',      icon: 'comment-dots', color: '#1a73e8', entityType: 'Message' },
      { key: 'styles',      label: 'Styles',        icon: 'palette',     color: '#e37400', entityType: 'Style' },
      { key: 'formats',     label: 'Formats',       icon: 'clapperboard', color: '#0891b2', entityType: 'Visual Format' }
    ];
    var activeTab = tabs.find(function(t) { return t.key === researchTab; }) || tabs[0];

    var html = '<div class="cp-view cp-view-research">';
    html += '<div class="cp-view-header"><div class="cp-view-header-left">';
    html += '<h1>' + icon('flask') + ' Research Lab</h1>';
    html += '<span class="cp-view-subtitle">AI-powered bulk discovery for all dimensions</span>';
    html += '</div></div>';

    // Library stats
    html += '<div class="cp-dash-stats" style="margin-bottom:var(--cp-space-4)">';
    for (var si = 0; si < tabs.length; si++) {
      var t = tabs[si];
      var count = 0;
      if (t.key === 'personas') count = (S.data.personas || []).length;
      else if (t.key === 'pain_points') count = (S.data.pain_points || []).length;
      else if (t.key === 'messages') count = (S.data.messages || []).length;
      else if (t.key === 'styles') count = (S.data.styles || []).length;
      else if (t.key === 'formats') count = (S.data.visual_formats || []).length;
      html += '<div class="cp-stat-card" style="cursor:pointer" data-action="research-tab" data-tab="' + t.key + '">';
      html += '<span class="cp-stat-icon" style="color:' + t.color + '">' + icon(t.icon) + '</span>';
      html += '<div class="cp-stat-body"><div class="cp-stat-value" style="color:' + t.color + '">' + count + '</div>';
      html += '<div class="cp-stat-label">' + esc(t.label) + '</div></div></div>';
    }
    html += '</div>';

    // Tab selector
    html += '<div class="cp-settings-tabs" style="margin-bottom:var(--cp-space-4)">';
    for (var ti = 0; ti < tabs.length; ti++) {
      var tab = tabs[ti];
      html += '<button class="cp-settings-tab' + (researchTab === tab.key ? ' cp-settings-tab-active' : '') + '" data-action="research-tab" data-tab="' + tab.key + '" style="' + (researchTab === tab.key ? 'color:' + tab.color + ';border-bottom-color:' + tab.color : '') + '">' + icon(tab.icon) + ' ' + esc(tab.label) + '</button>';
    }
    html += '</div>';

    // Active research panel
    html += '<div class="cp-card" style="padding:var(--cp-space-5)">';
    html += '<div class="cp-section-header"><h3 style="color:' + activeTab.color + '">' + icon(activeTab.icon) + ' Research ' + esc(activeTab.label) + '</h3></div>';
    html += renderAIResearchPanelBody(activeTab.entityType, activeTab.key, activeTab.color);
    html += '</div>';

    // Session history
    var sessions = (S.data.research && S.data.research.sessions) || [];
    if (sessions.length > 0) {
      html += '<div class="cp-section" style="margin-top:var(--cp-space-5)"><div class="cp-section-header"><h2>' + icon('clock-rotate-left') + ' Past Sessions</h2></div>';
      for (var ri = Math.max(0, sessions.length - 5); ri < sessions.length; ri++) {
        var ses = sessions[ri];
        html += '<div class="cp-card" style="margin-bottom:var(--cp-space-3)">';
        html += '<div class="cp-flex-between"><strong>' + esc(ses.topic || ses.title || 'Research Session') + '</strong>';
        html += '<span class="cp-text-muted">' + (ses.results || []).length + ' results · ' + formatDate(ses.created) + '</span></div>';
        html += '</div>';
      }
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  function setupResearchEvents() {
    // Research tab handled in setupPart2BEvents
  }


/* ===== src/30-part2b/21-view-settings.js ===== */
  // ============================================================
  // SECTION 17: SETTINGS VIEW (6 tabs)
  // ============================================================

  function renderSettingsView() {
    var tab = S.settingsTab || 'workspace';
    var tabs = [
      { key: 'workspace',    label: 'Workspace',    icon: 'briefcase' },
      { key: 'funnel',       label: 'Funnel Stages', icon: 'filter' },
      { key: 'categories',   label: 'Categories',   icon: 'folder' },
      { key: 'ai',           label: 'AI',           icon: 'sparkles' },
      { key: 'brand_design', label: 'Brand Design', icon: 'palette' },
      { key: 'meta_v2',      label: 'Meta v2',      icon: 'bullhorn' },
      { key: 'import_export', label: 'Import/Export', icon: 'download' }
    ];
    var html = '<div class="cp-view cp-view-settings">';
    html += '<div class="cp-view-header"><h1>' + icon('gear') + ' Settings</h1></div>';
    html += '<div class="cp-settings-tabs">';
    for (var i = 0; i < tabs.length; i++) {
      var t = tabs[i];
      html += '<button class="cp-settings-tab' + (tab === t.key ? ' cp-settings-tab-active' : '') + '" data-action="settings-tab" data-tab="' + t.key + '">' + icon(t.icon) + ' ' + esc(t.label) + '</button>';
    }
    html += '</div>';
    html += '<div class="cp-settings-body">';
    switch(tab) {
      case 'workspace':     html += renderWorkspaceSettings(); break;
      case 'funnel':        html += renderFunnelSettings(); break;
      case 'categories':    html += renderCategorySettings(); break;
      case 'ai':            html += renderAISettings(); break;
      case 'brand_design':  html += renderBrandDesignSettings(); break;
      case 'meta_v2':       html += renderMetaV2Settings(); break;
      case 'import_export': html += renderImportExportSettings(); break;
    }
    html += '</div></div>';
    return html;
  }

  function renderWorkspaceSettings() {
    var ws = (S.meta && S.meta.workspace) || {};
    var setup = (S.meta && S.meta.setup) || {};
    var stg = (S.meta && S.meta.settings) || {};
    var html = '<div class="cp-settings-panel">';
    html += '<div class="cp-settings-section"><h3>' + icon('briefcase') + ' Workspace</h3>';
    html += '<div class="cp-form-group"><label>Workspace Name</label><input type="text" class="cp-input cp-settings-field" data-path="workspace.name" value="' + esc(ws.name || '') + '"></div>';
    html += '<div class="cp-form-group"><label>Description</label><textarea class="cp-textarea cp-settings-field" data-path="workspace.description" rows="2">' + esc(ws.description || '') + '</textarea></div>';
    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Timezone</label><select class="cp-select cp-settings-field" data-path="settings.timezone">';
    ['UTC', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Kolkata'].forEach(function(tz) { html += '<option value="' + tz + '"' + (stg.timezone === tz ? ' selected' : '') + '>' + tz + '</option>'; });
    html += '</select></div><div class="cp-form-half"><label>Default View</label><select class="cp-select cp-settings-field" data-path="settings.default_view">';
    for (var v in Constants.APP_VIEWS) html += '<option value="' + v + '"' + (stg.default_view === v ? ' selected' : '') + '>' + Constants.APP_VIEWS[v].label + '</option>';
    html += '</select></div></div></div>';

    // Setup context (editable)
    html += '<div class="cp-settings-section"><h3>' + icon('bullseye') + ' Product & Objective</h3>';
    html += '<div class="cp-form-group"><label>Product / Service Name</label><input type="text" class="cp-input cp-settings-field" data-path="setup.product_name" value="' + esc(setup.product_name || '') + '"></div>';
    html += '<div class="cp-form-group"><label>Business Objective</label><input type="text" class="cp-input cp-settings-field" data-path="setup.objective" value="' + esc(setup.objective || '') + '"></div>';
    html += '<div class="cp-form-group"><label>Custom AI Instructions</label><textarea class="cp-textarea cp-settings-field" data-path="setup.custom_instructions" rows="3" placeholder="Special instructions included in all AI prompts...">' + esc(setup.custom_instructions || '') + '</textarea></div>';
    html += '</div>';

    // Setup wizard — re-run or full reset. Auto-launch only fires on empty
    // workspaces, so this is the only manual entry-point after onboarding.
    html += '<div class="cp-settings-section"><h3>' + icon('wand-magic') + ' Setup wizard</h3>';
    html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-3)">The wizard auto-launches on empty workspaces. Use these to re-run it later, or to wipe everything and start over.</p>';
    html += '<div class="cp-settings-actions">';
    html += '<button class="cp-btn cp-btn-outline" data-action="sw-restart-keep-data">' + icon('wand-magic') + ' Re-run setup wizard</button> ';
    html += '<button class="cp-btn cp-btn-danger" data-action="sw-reset-wipe-data">' + icon('trash') + ' Reset everything from scratch</button>';
    html += '</div>';
    html += '</div>';

    html += '<div class="cp-settings-actions"><button class="cp-btn cp-btn-primary" data-action="save-settings">' + icon('check') + ' Save</button></div>';
    html += '</div>';
    return html;
  }

  function renderFunnelSettings() {
    var funnels = (S.meta.settings && S.meta.settings.funnel_stages) || [];
    var html = '<div class="cp-settings-panel">';
    html += '<div class="cp-settings-section"><div class="cp-flex-between"><h3>' + icon('filter') + ' Funnel Stages</h3>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="add-funnel-stage">' + icon('plus') + ' Add Stage</button></div>';
    html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-3)">Define your advertising funnel stages. System defaults (TOFU/MOFU/BOFU) cannot be deleted.</p>';
    for (var fi = 0; fi < funnels.length; fi++) {
      var f = funnels[fi];
      html += '<div class="cp-funnel-stage-item" data-stage-index="' + fi + '">';
      html += '<span class="cp-funnel-stage-dot" style="background:' + f.color + '"></span>';
      html += '<span class="cp-funnel-stage-name">' + esc(f.name) + '</span>';
      html += '<span class="cp-funnel-stage-short">' + esc(f.short || '') + '</span>';
      if (f.system) html += '<span class="cp-funnel-stage-system">System</span>';
      else html += '<button class="cp-btn-icon cp-btn-xs" data-action="delete-funnel-stage" data-stage-index="' + fi + '">' + icon('trash') + '</button>';
      html += '</div>';
    }
    html += '</div>';
    html += '<div class="cp-settings-actions"><button class="cp-btn cp-btn-primary" data-action="save-settings">' + icon('check') + ' Save</button></div>';
    html += '</div>';
    return html;
  }

  function renderCategorySettings() {
    var ppCats = Constants.PAIN_POINT_CATEGORIES || [];
    var fmtCats = Constants.FORMAT_CATEGORIES || [];
    var metaObjMap = Constants.META_OBJECTIVES || {};
    var html = '<div class="cp-settings-panel">';
    html += '<div class="cp-settings-section"><h3>' + icon('bolt') + ' Pain Point Categories</h3>';
    html += '<div class="cp-config-list">';
    for (var pi = 0; pi < ppCats.length; pi++) html += '<div class="cp-config-item"><span class="cp-config-item-name">' + esc(ppCats[pi].name) + '</span><span class="cp-text-muted">' + esc(ppCats[pi].id) + '</span></div>';
    html += '</div></div>';
    html += '<div class="cp-settings-section"><h3>' + icon('clapperboard') + ' Visual Format Categories</h3>';
    html += '<div class="cp-config-list">';
    for (var fi = 0; fi < fmtCats.length; fi++) html += '<div class="cp-config-item"><span class="cp-config-item-name">' + esc(fmtCats[fi].name) + '</span><span class="cp-text-muted">' + icon(fmtCats[fi].icon) + '</span></div>';
    html += '</div></div>';
    html += '<div class="cp-settings-section"><h3>' + icon('bullseye') + ' Meta Campaign Objectives</h3>';
    html += '<div class="cp-config-list">';
    for (var ok in metaObjMap) {
      var mo = metaObjMap[ok];
      html += '<div class="cp-config-item"><span class="cp-config-item-name">' + esc(mo.label || ok) + '</span><span class="cp-text-muted">' + esc(ok) + '</span></div>';
    }
    html += '</div></div>';
    html += '<p class="cp-text-muted">These categories are system defaults. Custom category management will be available in a future update.</p>';
    html += '</div>';
    return html;
  }

  function renderAISettings() {
    var prefs = S.meta.aiPreferences || {};
    var html = '<div class="cp-settings-panel">';
    // AI Status
    html += '<div class="cp-settings-section"><h3>' + icon('bolt') + ' AI Status</h3>';
    if (LLMService.isConfigured()) {
      var provs = LLMService.getActiveProviders();
      var def = LLMService.getDefault();
      html += '<div class="cp-ai-status-summary" style="background:var(--cp-success-light);color:var(--cp-success);border:1px solid rgba(13,144,79,0.2)">';
      html += icon('circle-check') + ' <strong>' + provs.length + ' provider' + (provs.length > 1 ? 's' : '') + ' active</strong>';
      if (def) html += ' — Default: ' + esc(def.provider) + ' / ' + esc(def.model);
      html += '</div>';
      // Surface a hint when the saved app-default doesn't resolve cleanly
      // (provider deactivated or model no longer active). Helps the user
      // understand why the displayed default may differ from what they saved.
      var savedDef = prefs.appDefault;
      if (def && savedDef && savedDef.provider && savedDef.model &&
          (savedDef.provider !== def.provider || savedDef.model !== def.model)) {
        html += '<div class="cp-ai-status-warning" style="margin-top:var(--cp-space-2);padding:var(--cp-space-2) var(--cp-space-3);background:var(--cp-warning-light,#fff8e1);color:var(--cp-warning,#946200);border:1px solid rgba(180,144,0,0.2);border-radius:var(--cp-radius-sm);font-size:var(--cp-font-size-sm)">';
        html += icon('warning') + ' Your saved default <strong>' + esc(savedDef.provider) + ' / ' + esc(savedDef.model) + '</strong> isn\'t active. Falling back to <strong>' + esc(def.provider) + ' / ' + esc(def.model) + '</strong>. Pick a new default below and save.';
        html += '</div>';
      }
      html += '<div style="margin-top:var(--cp-space-3)"><button class="cp-btn cp-btn-outline cp-btn-sm" data-action="test-ai-connection">' + icon('bolt') + ' Test Connection</button></div>';
    } else {
      html += '<div class="cp-ai-status-summary" style="background:var(--cp-error-light);color:var(--cp-error);border:1px solid rgba(217,48,37,0.2)">';
      html += icon('warning') + ' <strong>No AI providers found</strong></div>';
      html += '<div class="cp-ai-setup-guide" style="margin-top:var(--cp-space-3);padding:var(--cp-space-4);background:var(--cp-gray-50);border-radius:var(--cp-radius-md)">';
      html += '<p style="font-size:var(--cp-font-size-sm);margin-bottom:var(--cp-space-2)">To enable AI features:</p>';
      html += '<ol style="margin:0;padding-left:var(--cp-space-5);font-size:var(--cp-font-size-sm);color:var(--cp-text-secondary);line-height:1.8">';
      html += '<li>Go to your <strong>user profile</strong> edit page</li>';
      html += '<li>Find the <strong>LLM Config</strong> field</li>';
      html += '<li>Add API keys and model configuration</li>';
      html += '<li>Expose the config via <strong>Drupal Views</strong> on this page</li></ol>';
      html += '<p style="font-size:var(--cp-font-size-xs);color:var(--cp-text-muted);margin:var(--cp-space-2) 0 0">Looks for <code style="background:var(--cp-gray-100);padding:1px 4px;border-radius:3px">.llm-config-data</code> or <code style="background:var(--cp-gray-100);padding:1px 4px;border-radius:3px">.llm-brand-config-data</code></p>';
      html += '</div>';
    }
    html += '</div>';
    // Default provider
    if (LLMService.isConfigured()) {
      html += '<div class="cp-settings-section"><h3>Default Provider</h3>';
      html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-3)">Default AI provider and model for all actions.</p>';
      html += '<div style="display:flex;gap:var(--cp-space-2)">' + LLMService.renderInlinePicker('app-default') + '</div>';
      html += '</div>';
    }
    html += '<div class="cp-settings-actions"><button class="cp-btn cp-btn-primary" data-action="save-settings">' + icon('check') + ' Save</button></div>';
    html += '</div>';
    return html;
  }

  function renderBrandDesignSettings() {
    var bd = (S.meta.settings && S.meta.settings.brand_design) || {};
    var colors = bd.colors || {};
    var typo = bd.typography || {};
    var html = '<div class="cp-settings-panel cp-brand-design-panel">';
    html += '<div class="cp-settings-section"><h3>' + icon('palette') + ' Brand Colors</h3>';
    html += '<div class="cp-brand-color-row">';
    var colorFields = [['primary', 'Primary'], ['secondary', 'Secondary'], ['accent', 'Accent'], ['background', 'Background'], ['text', 'Text']];
    for (var ci = 0; ci < colorFields.length; ci++) {
      var cf = colorFields[ci];
      html += '<div class="cp-brand-color-field"><label>' + cf[1] + '</label>';
      html += '<div class="cp-color-input-wrap"><input type="color" class="cp-brand-color" data-color-key="' + cf[0] + '" value="' + esc(colors[cf[0]] || '#ffffff') + '">';
      html += '<input type="text" class="cp-input cp-brand-color-text" data-color-key="' + cf[0] + '" value="' + esc(colors[cf[0]] || '') + '" placeholder="#hex"></div></div>';
    }
    html += '</div></div>';
    html += '<div class="cp-settings-section"><h3>' + icon('font') + ' Typography</h3>';
    html += '<div class="cp-form-group"><label>Heading Style</label><input type="text" class="cp-input cp-settings-field" data-path="settings.brand_design.typography.heading_style" value="' + esc(typo.heading_style || '') + '" placeholder="e.g., Bold Sans-Serif, Uppercase"></div>';
    html += '<div class="cp-form-group"><label>Body Style</label><input type="text" class="cp-input cp-settings-field" data-path="settings.brand_design.typography.body_style" value="' + esc(typo.body_style || '') + '" placeholder="e.g., Clean readable sans-serif"></div>';
    html += '</div>';
    html += '<div class="cp-settings-section"><h3>' + icon('image') + ' Visual Style</h3>';
    html += '<div class="cp-form-group"><label>Visual Style Description</label><textarea class="cp-textarea cp-settings-field" data-path="settings.brand_design.visual_style" rows="3" placeholder="Describe the overall visual aesthetic...">' + esc(bd.visual_style || '') + '</textarea></div>';
    html += '<div class="cp-form-group"><label>Layout Rules</label><textarea class="cp-textarea cp-settings-field" data-path="settings.brand_design.layout_rules" rows="2" placeholder="Composition guidelines...">' + esc(bd.layout_rules || '') + '</textarea></div>';
    html += '</div>';
    // Brand prompt preview
    var preview = BrandService.buildBrandDesignText(bd);
    if (preview) {
      html += '<div class="cp-settings-section"><h3>' + icon('eye') + ' Generated Prompt Preview</h3>';
      html += '<div style="padding:var(--cp-space-3);background:var(--cp-gray-50);border-radius:var(--cp-radius-md);font-family:var(--cp-font-mono);font-size:var(--cp-font-size-xs);line-height:1.7;white-space:pre-wrap;color:var(--cp-text-secondary)">' + esc(preview) + '</div></div>';
    }
    html += '<div class="cp-settings-actions"><button class="cp-btn cp-btn-primary" data-action="save-settings">' + icon('check') + ' Save</button></div>';
    html += '</div>';
    return html;
  }

  function renderImportExportSettings() {
    var html = '<div class="cp-settings-panel">';
    html += '<div class="cp-settings-section"><h3>' + icon('download') + ' Export</h3>';
    html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-3)">Download your data as JSON for backup or migration.</p>';
    html += '<div style="display:flex;gap:var(--cp-space-2);flex-wrap:wrap">';
    html += '<button class="cp-btn cp-btn-outline" data-action="export-json" data-mode="combined">' + icon('download') + ' Export All</button>';
    html += '<button class="cp-btn cp-btn-outline" data-action="export-json" data-mode="data-only">' + icon('database') + ' Data Only</button>';
    html += '<button class="cp-btn cp-btn-outline" data-action="export-json" data-mode="meta-only">' + icon('gear') + ' Settings Only</button>';
    html += '</div></div>';
    html += '<div class="cp-settings-section"><h3>' + icon('upload') + ' Import</h3>';
    html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-3)">Import a previously exported JSON file. This will <strong>replace</strong> your current data.</p>';
    html += '<button class="cp-btn cp-btn-outline" data-action="import-json">' + icon('upload') + ' Import JSON File</button>';
    html += '<input type="file" id="cpImportFile" accept=".json" style="display:none">';
    html += '</div></div>';
    return html;
  }

  function setupSettingsEvents() {
    // Settings events handled in setupPart2BEvents
  }


/* ===== src/30-part2b/21a-view-settings-meta-v2.js ===== */
  // ============================================================
  // SECTION 21A: SETTINGS — META v2 TAB
  // ============================================================
  //
  // Workspace-level Meta defaults (Page, Pixel, attribution, currency, etc.).

  function renderMetaV2Settings() {
    var defaults = (S.meta && S.meta.meta_defaults) || {};

    var html = '<div class="cp-settings-panel">';

    // --- Meta defaults ---
    html += '<div class="cp-settings-section">';
    html += '<h3>' + icon('gear') + ' Workspace Meta defaults</h3>';
    html += '<p class="cp-text-muted">Used as defaults for new Campaigns / Ad Sets / Ads and on export.</p>';
    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Facebook Page ID</label>';
    html += '<input type="text" class="cp-input cp-v2-defaults-field" data-key="page_id" value="' + esc(defaults.page_id || '') + '" placeholder="123456789012345">';
    html += '</div><div class="cp-form-half"><label>Instagram Actor ID</label>';
    html += '<input type="text" class="cp-input cp-v2-defaults-field" data-key="instagram_actor_id" value="' + esc(defaults.instagram_actor_id || '') + '" placeholder="17841...">';
    html += '</div></div>';
    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Pixel ID</label>';
    html += '<input type="text" class="cp-input cp-v2-defaults-field" data-key="pixel_id" value="' + esc(defaults.pixel_id || '') + '" placeholder="123456789">';
    html += '</div><div class="cp-form-half"><label>Business Manager ID</label>';
    html += '<input type="text" class="cp-input cp-v2-defaults-field" data-key="business_manager_id" value="' + esc(defaults.business_manager_id || '') + '" placeholder="987654321">';
    html += '</div></div>';
    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Attribution window</label>';
    html += '<select class="cp-select cp-v2-defaults-field" data-key="attribution_window">';
    for (var ak in Constants.META_ATTRIBUTION_SETTINGS) {
      html += '<option value="' + ak + '"' + (defaults.attribution_window === ak ? ' selected' : '') + '>' + esc(Constants.META_ATTRIBUTION_SETTINGS[ak].label) + '</option>';
    }
    html += '</select></div><div class="cp-form-half"><label>Currency</label>';
    html += '<select class="cp-select cp-v2-defaults-field" data-key="currency">';
    ['USD','EUR','GBP','INR','AUD','CAD','SGD','AED','JPY'].forEach(function(cc) {
      html += '<option value="' + cc + '"' + (defaults.currency === cc ? ' selected' : '') + '>' + cc + '</option>';
    });
    html += '</select></div></div>';

    html += '<div class="cp-form-row" style="margin-top:8px"><div class="cp-form-grow"><label>Time zone</label>';
    html += '<select class="cp-select cp-v2-defaults-field" data-key="time_zone">';
    ['UTC','America/New_York','America/Chicago','America/Los_Angeles','Europe/London','Europe/Paris','Asia/Tokyo','Asia/Kolkata','Asia/Dubai','Asia/Singapore'].forEach(function(tz) {
      html += '<option value="' + tz + '"' + (defaults.time_zone === tz ? ' selected' : '') + '>' + tz + '</option>';
    });
    html += '</select></div></div>';
    html += '</div>';

    html += '</div>';
    return html;
  }

/* ===== src/30-part2b/22-config-crud.js ===== */
  // ============================================================
  // SECTION 18: CONFIG CRUD & SETTINGS SAVE
  // ============================================================

  function saveAllSettings() {
    // Collect all settings fields
    $('.cp-settings-field').each(function() {
      var path = $(this).data('path'); var val = $(this).is(':checkbox') ? $(this).is(':checked') : $(this).val();
      if (!path) return;
      var parts = path.split('.'); var obj = S.meta;
      for (var i = 0; i < parts.length - 1; i++) { obj[parts[i]] = obj[parts[i]] || {}; obj = obj[parts[i]]; }
      obj[parts[parts.length - 1]] = val;
    });
    // Save brand colors
    $('.cp-brand-color-text').each(function() {
      var key = $(this).data('color-key'); var val = $(this).val();
      S.meta.settings = S.meta.settings || {};
      S.meta.settings.brand_design = S.meta.settings.brand_design || {};
      S.meta.settings.brand_design.colors = S.meta.settings.brand_design.colors || {};
      S.meta.settings.brand_design.colors[key] = val;
    });
    // Save AI default
    var $defProv = $('.cp-ai-provider-select[data-action-id="app-default"]');
    if ($defProv.length) {
      S.meta.aiPreferences = S.meta.aiPreferences || {};
      S.meta.aiPreferences.appDefault = { provider: $defProv.val(), model: $('.cp-ai-model-select[data-action-id="app-default"]').val() };
    }
    logActivity('settings_changed', '', '', 'Settings updated');
    snapshot('Save settings'); syncToTextarea(); render();
    // Refresh the header AI badge so it reflects the new default immediately
    if (typeof updateAIStatusIndicator === 'function') updateAIStatusIndicator();
    toast('Settings saved', 'success');
  }

  function addFunnelStage() {
    var html = '<div class="cp-editor-form">';
    html += '<div class="cp-form-group"><label>Stage Name *</label><input type="text" class="cp-input" data-field="name" placeholder="e.g., Retargeting"></div>';
    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Short Label *</label><input type="text" class="cp-input" data-field="short" placeholder="e.g., RET" maxlength="6"></div>';
    html += '<div class="cp-form-half"><label>Color</label><input type="color" data-field="color" value="#1a73e8" style="width:40px;height:32px;cursor:pointer"></div></div>';
    html += '</div>';
    openModal('New Funnel Stage', html, {
      titleIcon: 'filter', size: 'sm', saveLabel: 'Add Stage',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.name || !fields.name.trim()) { toast('Name required', 'warning'); return; }
        S.meta.settings.funnel_stages = S.meta.settings.funnel_stages || [];
        S.meta.settings.funnel_stages.push({
          id: generateId('fs'), name: fields.name.trim(), short: (fields.short || '').trim().toUpperCase() || fields.name.trim().substring(0, 4).toUpperCase(),
          color: fields.color || '#1a73e8', order: S.meta.settings.funnel_stages.length, system: false
        });
        snapshot('Add funnel stage'); buildMaps(); syncToTextarea(); closeModal(); render();
        toast('Funnel stage added', 'success');
      }
    });
  }

  function deleteFunnelStage(index) {
    var funnels = (S.meta.settings && S.meta.settings.funnel_stages) || [];
    if (!funnels[index] || funnels[index].system) { toast('System stages cannot be deleted', 'warning'); return; }
    var name = funnels[index].name;
    openConfirmDialog({
      title: 'Delete Funnel Stage', message: 'Delete "' + name + '"?', confirmLabel: 'Delete', danger: true,
      onConfirm: function() {
        funnels.splice(index, 1);
        snapshot('Delete funnel stage'); buildMaps(); syncToTextarea(); render();
        toast('Stage deleted', 'success');
      }
    });
  }


/* ===== src/30-part2b/23-import-export.js ===== */
  // ============================================================
  // SECTION 19: IMPORT/EXPORT
  // ============================================================

  function exportJSON(mode) {
    mode = mode || 'combined';
    var name = ((S.meta.workspace && S.meta.workspace.name) || 'cp').toLowerCase().replace(/\s+/g, '-');
    var date = new Date().toISOString().split('T')[0];
    var json, fileName;
    if (mode === 'meta-only') { json = JSON.stringify(S.meta, null, 2); fileName = name + '-meta-' + date + '.json'; }
    else if (mode === 'data-only') { json = JSON.stringify(S.data, null, 2); fileName = name + '-data-' + date + '.json'; }
    else { json = JSON.stringify({ _format: 'cp-combined', _version: '1.0', meta: S.meta, data: S.data, activity: S.activity }, null, 2); fileName = name + '-export-' + date + '.json'; }
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob); var a = document.createElement('a');
    a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    toast('Exported: ' + fileName, 'success');
  }

  function validateImportData(data, type) {
    // type: 'combined', 'meta', 'data'
    if (!data || typeof data !== 'object') return 'Import file does not contain a valid JSON object.';
    if (type === 'combined') {
      if (!data.meta || typeof data.meta !== 'object') return 'Combined import is missing "meta" object.';
      if (!data.data || typeof data.data !== 'object') return 'Combined import is missing "data" object.';
    }
    if (type === 'meta' || type === 'combined') {
      var meta = type === 'combined' ? data.meta : data;
      if (!meta.workspace && !meta.settings) return 'Meta import is missing "workspace" or "settings".';
    }
    if (type === 'data' || type === 'combined') {
      var d = type === 'combined' ? data.data : data;
      if (!Array.isArray(d.personas) && !Array.isArray(d.messages) && !Array.isArray(d.campaigns_v2)) {
        return 'Data import must contain at least one entity array (personas, messages, or campaigns_v2).';
      }
    }
    return null; // valid
  }

  function importJSON() {
    var $input = $('#cpImportFile');
    if (!$input.length) { $input = $('<input type="file" id="cpImportFile" accept=".json" style="display:none">'); $('body').append($input); }
    $input.off('change').on('change', function(e) {
      var file = e.target.files[0]; if (!file) return;
      if (file.size > 10 * 1024 * 1024) { toast('File too large (max 10 MB)', 'error'); $input.val(''); return; }
      var reader = new FileReader();
      reader.onload = function(evt) {
        try {
          var imported = JSON.parse(evt.target.result);
          // Determine import type and validate
          var importType, validationError;
          if (imported._format === 'cp-combined' && imported.meta && imported.data) {
            importType = 'combined';
          } else if (imported.workspace || imported.settings) {
            importType = 'meta';
          } else {
            importType = 'data';
          }
          validationError = validateImportData(imported, importType);
          if (validationError) { toast(validationError, 'error'); $input.val(''); return; }

          var detailMsg = importType === 'combined' ? 'This will replace ALL data and settings.' :
            importType === 'meta' ? 'This will replace settings/config only.' : 'This will replace entity data only.';
          openConfirmDialog({ title: 'Import Data', message: 'Replace current data? ' + detailMsg + ' Current data will be lost.', confirmLabel: 'Import', danger: true,
            onConfirm: function() {
              // Snapshot before import for rollback via undo
              snapshot('Before import');
              if (importType === 'combined') {
                S.meta = imported.meta;
                S.data = imported.data;
                // Drop any legacy v1 collections; they're not supported anymore.
                delete S.data.recipes;
                delete S.data.campaigns;
                S.activity = imported.activity || [];
              } else if (importType === 'meta') {
                S.meta = imported;
              }
              else {
                // Preserve essential arrays that might be missing in partial imports
                S.data.personas = imported.personas || S.data.personas || [];
                S.data.persona_categories = imported.persona_categories || S.data.persona_categories || [];
                S.data.pain_points = imported.pain_points || S.data.pain_points || [];
                S.data.messages = imported.messages || S.data.messages || [];
                S.data.styles = imported.styles || S.data.styles || [];
                S.data.visual_formats = imported.visual_formats || S.data.visual_formats || [];
                S.data.tags = imported.tags || S.data.tags || [];
                // Meta v2 entities (if present in the import)
                if (Array.isArray(imported.campaigns_v2)) S.data.campaigns_v2 = imported.campaigns_v2;
                if (Array.isArray(imported.ad_sets))      S.data.ad_sets      = imported.ad_sets;
                if (Array.isArray(imported.ads))          S.data.ads          = imported.ads;
              }
              logActivity('data_imported', '', '', 'Data imported from file (' + importType + ')');
              snapshot('Import'); buildMaps(); render(); syncToTextarea(); toast('Imported successfully', 'success');
            }
          });
        } catch(err) { toast('Invalid JSON file: ' + err.message, 'error'); }
      };
      reader.readAsText(file); $input.val('');
    });
    $input.click();
  }


/* ===== src/30-part2b/23a-meta-v2-export.js ===== */
  // ============================================================
  // SECTION 23A: META v2 EXPORT (Stage 7)
  // ============================================================
  //
  // Two export formats:
  //   1. JSON — full Campaign tree (Campaign + Ad Sets + Ads embedded)
  //   2. Meta bulk-upload CSV — 3 CSV files (campaigns / ad sets / ads)
  //      matching Meta Ads Manager's bulk import column layout.
  //
  // Pre-flight validation runs before either export and flags missing /
  // invalid fields that would cause Meta to reject the upload.

  // --- Entry: Export modal launched from Campaign workspace or list ---

  function openExportModal(campaignId) {
    var camp = campaignId ? getCampaignV2(campaignId) : null;
    var camps = camp ? [camp] : getAllCampaignsV2();
    if (camps.length === 0) { toast('No campaigns to export', 'info'); return; }

    var validation = validateForExport(camps);

    var html = '<div class="cp-editor-form">';
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('download') + ' Export ' + esc(camp ? '"' + camp.name + '"' : 'all campaigns') + '</div>';
    html += '<p>' + camps.length + ' Campaign' + (camps.length !== 1 ? 's' : '') + ', ' +
            countAdSets(camps) + ' Ad Set' + (countAdSets(camps) !== 1 ? 's' : '') + ', ' +
            countAds(camps) + ' Ad' + (countAds(camps) !== 1 ? 's' : '') + '.</p>';
    html += '</div>';

    // Validation report
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('shield') + ' Pre-flight check</div>';
    if (validation.errors.length === 0 && validation.warnings.length === 0) {
      html += '<div class="cp-v2-export-validation-ok">' + icon('circle-check') + ' Ready to export — no issues found.</div>';
    } else {
      if (validation.errors.length) {
        html += '<div class="cp-v2-export-validation-errors">';
        html += '<div class="cp-v2-export-validation-title">' + icon('warning') + ' ' + validation.errors.length + ' error(s) — fix before exporting</div>';
        html += '<ul>';
        validation.errors.slice(0, 12).forEach(function(e) { html += '<li>' + esc(e) + '</li>'; });
        if (validation.errors.length > 12) html += '<li class="cp-text-muted">+ ' + (validation.errors.length - 12) + ' more</li>';
        html += '</ul></div>';
      }
      if (validation.warnings.length) {
        html += '<div class="cp-v2-export-validation-warnings">';
        html += '<div class="cp-v2-export-validation-title">' + icon('info') + ' ' + validation.warnings.length + ' warning(s) — review</div>';
        html += '<ul>';
        validation.warnings.slice(0, 12).forEach(function(w) { html += '<li>' + esc(w) + '</li>'; });
        if (validation.warnings.length > 12) html += '<li class="cp-text-muted">+ ' + (validation.warnings.length - 12) + ' more</li>';
        html += '</ul></div>';
      }
    }
    html += '</div>';

    // Choices
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('file-lines') + ' Format</div>';
    html += '<div class="cp-v2-export-choices">';
    html += '<button class="cp-btn cp-btn-primary" data-action="v2-export-json" data-campaign-id="' + esc(camp ? camp.id : '') + '">' + icon('file-text') + ' Download JSON tree</button>';
    var blocked = validation.errors.length > 0;
    html += '<button class="cp-btn ' + (blocked ? 'cp-btn-outline' : 'cp-btn-primary') + '" data-action="v2-export-csv" data-campaign-id="' + esc(camp ? camp.id : '') + '"' + (blocked ? ' disabled' : '') + '>' + icon('rectangle-list') + ' Download Meta CSVs</button>';
    html += '</div>';
    html += '<div class="cp-form-help">JSON exports always. CSV is blocked until errors are fixed (Meta will reject otherwise).</div>';
    html += '</div>';

    html += '</div>';

    openModal('Export to Meta', html, {
      titleIcon: 'download', size: 'lg', footer: false
    });
  }

  function countAdSets(camps) { var n = 0; camps.forEach(function(c) { n += getAdSetsByCampaign(c.id).length; }); return n; }
  function countAds(camps)    { var n = 0; camps.forEach(function(c) { n += getAdsByCampaign(c.id).length; }); return n; }

  // --- Validation ---

  function validateForExport(camps) {
    var errors = [];
    var warnings = [];

    camps.forEach(function(c) {
      // Campaign-level
      if (!c.name) errors.push('Campaign has no name (id ' + c.id + ')');
      if (!c.objective) errors.push('Campaign "' + (c.name || '?') + '" has no objective');
      if (c.budget_mode === 'CBO' && !c.daily_budget && !c.lifetime_budget) {
        warnings.push('Campaign "' + c.name + '" is CBO but has no daily/lifetime budget');
      }

      var sets = getAdSetsByCampaign(c.id);
      if (sets.length === 0) warnings.push('Campaign "' + c.name + '" has no Ad Sets');

      sets.forEach(function(s) {
        if (!s.name) errors.push('Ad Set in "' + c.name + '" has no name');
        if (!s.persona_id) warnings.push('Ad Set "' + s.name + '" has no persona linked');
        if (!s.optimization_goal) errors.push('Ad Set "' + s.name + '" has no optimization goal');
        if (!s.billing_event) errors.push('Ad Set "' + s.name + '" has no billing event');
        if (c.budget_mode === 'ABO' && !s.daily_budget && !s.lifetime_budget) {
          errors.push('Ad Set "' + s.name + '" is ABO but has no budget');
        }
        if (c.budget_mode === 'CBO' && (s.daily_budget || s.lifetime_budget)) {
          warnings.push('Ad Set "' + s.name + '" has a budget but Campaign is CBO — budget will be ignored');
        }

        var ads = getAdsByAdSet(s.id);
        if (ads.length === 0) warnings.push('Ad Set "' + s.name + '" has no Ads');

        ads.forEach(function(a) {
          if (!a.name) errors.push('Ad in "' + s.name + '" has no name');
          var cr = a.creative || {};
          if (!cr.primary_text) warnings.push('Ad "' + a.name + '" has no primary text');
          if (!cr.cta_link) warnings.push('Ad "' + a.name + '" has no destination URL');
          else if (!/^https?:\/\//i.test(cr.cta_link)) errors.push('Ad "' + a.name + '" cta_link is not a valid URL');
          if (a.creative_type === 'single_image') {
            var img = (a.media && a.media.image) || {};
            if (!img.asset_id && !img.prompt && !img.ai_prompt && !img.brief) warnings.push('Ad "' + a.name + '" (single_image) has no image asset or prompt');
          }
          if (a.creative_type === 'carousel') {
            var cards = (a.media && a.media.carousel_cards) || [];
            if (cards.length < 2) errors.push('Ad "' + a.name + '" (carousel) needs at least 2 cards');
          }
        });
      });
    });

    return { errors: errors, warnings: warnings };
  }

  // --- JSON export ---

  function exportV2JSON(campaignId) {
    var camps = campaignId ? [getCampaignV2(campaignId)].filter(Boolean) : getAllCampaignsV2();
    if (camps.length === 0) { toast('Nothing to export', 'warning'); return; }

    var tree = camps.map(function(c) {
      return $.extend({}, c, {
        ad_sets: getAdSetsByCampaign(c.id).map(function(s) {
          return $.extend({}, s, { ads: getAdsByAdSet(s.id) });
        })
      });
    });

    var payload = {
      exported_at: new Date().toISOString(),
      app: 'meta-campaign-planner',
      version: 'v2',
      workspace: ((S.meta && S.meta.workspace && S.meta.workspace.name) || ''),
      campaigns: tree
    };

    var filename = 'meta-campaign-tree' + (campaignId ? '-' + (camps[0].name || 'export').replace(/[^a-z0-9-]+/gi, '-').toLowerCase() : '-all') + '-' + new Date().toISOString().split('T')[0] + '.json';
    downloadBlob(JSON.stringify(payload, null, 2), filename, 'application/json');
    logActivity('data_exported', 'workspace', '', filename, 'Exported v2 JSON');
    toast('JSON tree downloaded', 'success');
    closeModal();
  }

  // --- CSV export (3 files: campaigns, ad sets, ads) ---

  function exportV2CSV(campaignId) {
    var camps = campaignId ? [getCampaignV2(campaignId)].filter(Boolean) : getAllCampaignsV2();
    if (camps.length === 0) { toast('Nothing to export', 'warning'); return; }

    var validation = validateForExport(camps);
    if (validation.errors.length > 0) {
      toast('Fix ' + validation.errors.length + ' validation error(s) first', 'error'); return;
    }

    var dateStr = new Date().toISOString().split('T')[0];

    // Campaigns sheet
    var campRows = camps.map(function(c) {
      return {
        'Campaign Name': c.name || '',
        'Campaign ID (planner)': c.id,
        'Campaign Objective': c.objective || '',
        'Campaign Status': c.status || 'DRAFT',
        'Buying Type': c.buying_type || 'AUCTION',
        'Budget Mode': c.budget_mode || 'CBO',
        'Daily Budget': c.daily_budget != null ? c.daily_budget : '',
        'Lifetime Budget': c.lifetime_budget != null ? c.lifetime_budget : '',
        'Spend Cap': c.spend_cap != null ? c.spend_cap : '',
        'Bid Strategy': c.bid_strategy || '',
        'Start Time': c.start_time || '',
        'Stop Time': c.stop_time || '',
        'Special Ad Categories': (c.special_ad_categories || []).join(';'),
        'A/B Test Enabled': (c.ab_test && c.ab_test.enabled) ? 'TRUE' : 'FALSE',
        'A/B Primary Metric': (c.ab_test && c.ab_test.primary_metric) || '',
        'Description': c.description || ''
      };
    });

    // Ad Sets sheet
    var adSetRows = [];
    camps.forEach(function(c) {
      getAdSetsByCampaign(c.id).forEach(function(s) {
        var placements = s.placements || {};
        var placementValues = placements.advantage_enabled ? 'ADVANTAGE_PLACEMENTS' : (placements.custom_placements || []).join(';');
        var brief = s.brief || {};
        var persona = S.personaMap[s.persona_id];
        adSetRows.push({
          'Campaign Name': c.name || '',
          'Ad Set Name': s.name || '',
          'Ad Set ID (planner)': s.id,
          'Ad Set Status': s.status || 'DRAFT',
          'Optimization Goal': s.optimization_goal || '',
          'Billing Event': s.billing_event || '',
          'Attribution Setting': s.attribution_setting || '',
          'Bid Amount': s.bid_amount != null ? s.bid_amount : '',
          'Daily Budget': s.daily_budget != null ? s.daily_budget : '',
          'Lifetime Budget': s.lifetime_budget != null ? s.lifetime_budget : '',
          'Start Time': s.start_time || '',
          'Stop Time': s.stop_time || '',
          'Placements': placementValues,
          'Persona Name (planner)': persona ? persona.name : '',
          'Audience Notes': s.audience_overrides || '',
          'AB Role': s.ab_role || '',
          'Creative Direction (brief)': brief.creative_direction || '',
          'Hook Angles': (brief.hook_angles || []).join(' | ')
        });
      });
    });

    // Ads sheet
    var adRows = [];
    camps.forEach(function(c) {
      getAdsByCampaign(c.id).forEach(function(a) {
        var s = getAdSet(a.ad_set_id);
        var cr = a.creative || {};
        var m = a.media || {};
        adRows.push({
          'Campaign Name': c.name || '',
          'Ad Set Name': s ? s.name : '',
          'Ad Name': a.name || '',
          'Ad ID (planner)': a.id,
          'Ad Status (planner)': a.pipeline_status || '',
          'Creative Type': a.creative_type || 'single_image',
          'Primary Text': cr.primary_text || '',
          'Headline': cr.headline || '',
          'Description': cr.description || '',
          'Call To Action': cr.cta_type || '',
          'Destination URL': cr.cta_link || '',
          'Display Link': cr.display_link || '',
          'URL Parameters': cr.tracking_params || '',
          'Hook Text': (a.hook && a.hook.text) || '',
          'Hook Type': (a.hook && a.hook.type) || '',
          'Image Asset ID': (m.image && m.image.asset_id) || '',
          'Image Aspect Ratio': (m.image && m.image.aspect_ratio) || '',
          'Image Prompt': (m.image && (m.image.prompt || m.image.ai_prompt || m.image.brief)) || '',
          'Video Asset ID': (m.video && m.video.asset_id) || '',
          'Video Duration (s)': (m.video && m.video.duration_seconds) || '',
          'Video Aspect Ratio': (m.video && m.video.aspect_ratio) || '',
          'Video Concept': (m.video && m.video.concept) || '',
          'Carousel Card Count': ((m.carousel_cards || []).length) || '',
          'Assigned To': a.assigned_to || '',
          'Due Date': a.due_date || ''
        });
      });
    });

    var slug = campaignId ? '-' + (camps[0].name || 'export').replace(/[^a-z0-9-]+/gi, '-').toLowerCase() : '-all';
    downloadBlob(toCSV(campRows), 'meta-campaigns' + slug + '-' + dateStr + '.csv', 'text/csv');
    setTimeout(function() {
      downloadBlob(toCSV(adSetRows), 'meta-ad-sets' + slug + '-' + dateStr + '.csv', 'text/csv');
    }, 350);
    setTimeout(function() {
      downloadBlob(toCSV(adRows), 'meta-ads' + slug + '-' + dateStr + '.csv', 'text/csv');
    }, 700);

    logActivity('meta_csv_exported', 'workspace', '', '', campRows.length + ' campaigns / ' + adSetRows.length + ' ad sets / ' + adRows.length + ' ads');
    toast('3 CSV files downloaded', 'success');
    closeModal();
  }

  // --- CSV serialization (RFC 4180) ---

  function toCSV(rows) {
    if (!rows || !rows.length) return '';
    var headers = Object.keys(rows[0]);
    var escCell = function(v) {
      if (v == null) return '';
      var s = String(v);
      if (/[",\r\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    };
    var lines = [headers.map(escCell).join(',')];
    rows.forEach(function(r) {
      lines.push(headers.map(function(h) { return escCell(r[h]); }).join(','));
    });
    return lines.join('\r\n');
  }

  // --- Download trigger ---

  function downloadBlob(content, filename, mime) {
    var blob = new Blob([content], { type: mime + ';charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var $a = $('<a></a>').attr({ href: url, download: filename }).css('display', 'none');
    $('body').append($a);
    $a[0].click();
    setTimeout(function() { $a.remove(); URL.revokeObjectURL(url); }, 500);
  }

  // --- Field-level copy helpers ---

  function copyAdField(adId, field) {
    var ad = getAd(adId); if (!ad) return;
    var value = '';
    switch (field) {
      case 'primary_text': value = (ad.creative || {}).primary_text || ''; break;
      case 'headline':     value = (ad.creative || {}).headline || ''; break;
      case 'description':  value = (ad.creative || {}).description || ''; break;
      case 'cta_link':     value = (ad.creative || {}).cta_link || ''; break;
      case 'cta_type':     value = (ad.creative || {}).cta_type || ''; break;
      case 'hook':         value = (ad.hook || {}).text || ''; break;
      case 'image_prompt': var img = ((ad.media || {}).image || {}); value = img.prompt || img.ai_prompt || img.brief || ''; break;
      case 'all':
        var c = ad.creative || {};
        value = 'Primary text:\n' + (c.primary_text || '') + '\n\nHeadline:\n' + (c.headline || '') + '\n\nDescription:\n' + (c.description || '') + '\n\nCTA: ' + (c.cta_type || '') + '\nLink: ' + (c.cta_link || '');
        break;
    }
    if (!value) { toast('Nothing to copy', 'info'); return; }
    copyToClipboard(value);
    toast('Copied ' + field.replace(/_/g, ' '), 'success');
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function() { fallbackCopy(text); });
    } else {
      fallbackCopy(text);
    }
  }
  function fallbackCopy(text) {
    var $ta = $('<textarea></textarea>').val(text).css({ position: 'fixed', left: '-9999px' });
    $('body').append($ta);
    $ta[0].select();
    try { document.execCommand('copy'); } catch (_) {}
    $ta.remove();
  }

/* ===== src/30-part2b/23b-media-brief-export.js ===== */
  // ============================================================
  // SECTION 23B: AD MEDIA BRIEF — Structured JSON export
  // ============================================================
  //
  // The Campaign Planner does NOT generate media (image/video/carousel)
  // itself. Instead, it assembles a structured JSON brief that downstream
  // tools (Midjourney / SDXL / Sora / Runway, or an MCP-connected LLM
  // like Claude) can consume to produce the actual assets.
  //
  // The brief packages everything the downstream tool needs: full ad
  // context (campaign + ad set + persona + brand), the hook + copy + CTA,
  // and the media direction (image brief + AI prompt, video scenes +
  // script, or carousel cards) in one self-contained document.

  var MEDIA_BRIEF_SCHEMA_VERSION = '1.1';

  function buildAdMediaBrief(adId, opts) {
    opts = opts || {};
    var ad = getAd(adId);
    if (!ad) return null;
    var adSet = getAdSet(ad.ad_set_id) || null;
    var camp = adSet ? getCampaignV2(adSet.campaign_id) : null;
    var persona = adSet && adSet.persona_id ? getPersona(adSet.persona_id) : null;
    var painPoints = (persona && persona.pain_point_ids ? persona.pain_point_ids : [])
      .map(function(ppId) { return S.painPointMap[ppId]; })
      .filter(Boolean)
      .slice(0, 8);

    var brand = (S.brand && S.brand.identity) ? S.brand.identity : {};
    var voice = (S.brand && S.brand.voice)    ? S.brand.voice    : {};
    var design = (S.meta && S.meta.settings && S.meta.settings.brand_design) || {};

    var creative = ad.creative || {};
    var hook = ad.hook || {};
    var media = ad.media || {};
    var ctype = ad.creative_type || 'single_image';

    var brief = {
      schema_version: MEDIA_BRIEF_SCHEMA_VERSION,
      ad: {
        id: ad.id,
        name: ad.name || '',
        creative_type: ctype,
        pipeline_status: ad.pipeline_status || '',
        objective: camp ? (camp.objective || '') : '',
        campaign_name: camp ? (camp.name || '') : '',
        ad_set_name: adSet ? (adSet.name || '') : '',
        audience: persona ? {
          persona_id: persona.id,
          persona_name: persona.name || '',
          persona_description: persona.description || '',
          demographics: persona.demographics || {},
          psychographics: persona.psychographics || {},
          pain_points: painPoints.map(function(pp) {
            return { pain: pp.pain_point || '', solution: pp.solution || '', category: pp.category || '' };
          })
        } : null,
        brand: {
          name: brand.name || '',
          tagline: brand.tagline || '',
          description: brand.description || '',
          voice: voice.tone || '',
          guidelines: voice.guidelines || '',
          design: {
            colors: design.colors || {},
            typography: design.typography || {}
          }
        },
        hook: {
          text: hook.text || '',
          type: hook.type || 'direct'
        },
        copy: {
          primary_text: creative.primary_text || '',
          headline: creative.headline || '',
          description: creative.description || '',
          cta_type: creative.cta_type || '',
          cta_link: creative.cta_link || '',
          display_link: creative.display_link || ''
        },
        brief_context: {
          campaign_brief: camp ? (camp.brief || '') : '',
          ad_set_creative_direction: (adSet && adSet.brief) ? (adSet.brief.creative_direction || '') : '',
          ad_set_hook_angles: (adSet && adSet.brief) ? (adSet.brief.hook_angles || []) : [],
          ad_set_ai_notes: (adSet && adSet.brief) ? (adSet.brief.ai_notes || '') : ''
        }
      },
      media: _buildMediaBlock(ctype, media),
      production: {
        deliverables: _suggestedDeliverables(ctype, media),
        assigned_to: ad.assigned_to || '',
        due_date: ad.due_date || '',
        production_notes: ad.production_notes || '',
        review_notes: ad.review_notes || ''
      },
      source: {
        campaign_id: camp ? camp.id : '',
        ad_set_id: adSet ? adSet.id : '',
        ad_id: ad.id,
        exported_at: new Date().toISOString(),
        tool: 'guaCampaignPlanner',
        format: 'media-brief'
      }
    };

    if (opts.mcp) {
      brief.mcp_instructions = _mcpInstructions(ctype);
    }

    return brief;
  }

  function _buildMediaBlock(ctype, media) {
    if (ctype === 'single_image') {
      var img = media.image || {};
      return {
        type: 'image',
        image: {
          prompt: img.prompt || img.ai_prompt || img.brief || '',
          aspect_ratio: img.aspect_ratio || '1:1'
        }
      };
    }
    if (ctype === 'single_video') {
      var vid = media.video || {};
      // Sections are the new structure; legacy `script.rows` is folded into a
      // single section so downstream tools still see content.
      var sections = (vid.script && vid.script.sections) || [];
      if (sections.length === 0 && vid.script && vid.script.rows && vid.script.rows.length) {
        var combined = vid.script.rows.map(function(r) {
          var bits = [];
          if (r.time) bits.push('[' + r.time + ']');
          if (r.dialogue) bits.push(r.dialogue);
          if (r.visual) bits.push('(visual: ' + r.visual + ')');
          return bits.join(' ');
        }).filter(Boolean).join('\n');
        if (combined) sections = [{ label: 'Script', script: combined }];
      }
      return {
        type: 'video',
        video: {
          concept: vid.concept || '',
          duration_seconds: vid.duration_seconds || 30,
          aspect_ratio: vid.aspect_ratio || '9:16',
          script: {
            sections: sections.map(function(s, i) {
              return { index: i, label: s.label || '', script: s.script || '' };
            })
          }
        }
      };
    }
    if (ctype === 'carousel') {
      return {
        type: 'carousel',
        carousel: {
          cards: (media.carousel_cards || []).map(function(c, i) {
            return {
              index: i,
              prompt:  c.prompt  || c.headline    || '',
              caption: c.caption || c.description || ''
            };
          })
        }
      };
    }
    return { type: ctype };
  }

  function _suggestedDeliverables(ctype, media) {
    if (ctype === 'single_image') {
      var img = media.image || {};
      var ar = img.aspect_ratio || '1:1';
      return [ ar + ' image (JPG / PNG, sRGB, ≥1080px on the short edge)' ];
    }
    if (ctype === 'single_video') {
      var vid = media.video || {};
      var ar = vid.aspect_ratio || '9:16';
      var dur = vid.duration_seconds || 30;
      return [
        ar + ' video, ' + dur + 's, MP4 H.264, ≥1080p, ≤30Mbps',
        'Caption SRT / VTT file (sound-off optimisation)'
      ];
    }
    if (ctype === 'carousel') {
      var cards = (media.carousel_cards || []).length;
      return [ cards + ' 1:1 (or 4:5) image' + (cards !== 1 ? 's' : '') + ', one per card' ];
    }
    return [];
  }

  function _mcpInstructions(ctype) {
    var common = 'This is a Meta Ads creative brief. Use the fields under `ad` (hook, copy, audience, brand) as creative direction. The `media` block tells you what kind of asset to produce and how. Match brand voice from `ad.brand.voice` and design tokens from `ad.brand.design`. Aim for the aspect_ratio and duration specified. Keep dialogue/headlines under the character limits the brief implies.';
    if (ctype === 'single_image') {
      return common + ' For image: pass `media.image.prompt` to your image-generation tool. Aspect ratio is in `media.image.aspect_ratio`.';
    }
    if (ctype === 'single_video') {
      return common + ' For video: `media.video.script.sections` is the script broken into labelled beats (Hook, Setup, Payoff, CTA, etc.) — write one shot or clip per section that delivers the script for that beat at the implied duration, then concat. Visual direction is intentionally out of scope here; treat the script and brand voice as the source of truth. Aspect ratio is in `media.video.aspect_ratio`.';
    }
    if (ctype === 'carousel') {
      return common + ' For carousel: generate one image per entry in `media.carousel.cards` using its `prompt`. The `caption` is the on-image / under-image text the user will see. Keep visual style consistent across cards.';
    }
    return common;
  }

  function exportAdMediaBriefJSON(adId, opts) {
    var brief = buildAdMediaBrief(adId, opts || {});
    if (!brief) { toast('Could not build brief — ad not found', 'error'); return; }
    var json = JSON.stringify(brief, null, 2);
    var ad = getAd(adId);
    var safeName = (ad && ad.name ? ad.name : 'ad').replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'media-brief-' + safeName + '.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function() { URL.revokeObjectURL(url); }, 250);
    logActivity('media_brief_exported', 'ad', adId, ad ? ad.name : '', 'Downloaded media brief JSON');
    toast('Media brief downloaded', 'success');
  }

  function copyAdMediaBriefJSON(adId, opts) {
    var brief = buildAdMediaBrief(adId, opts || {});
    if (!brief) { toast('Could not build brief — ad not found', 'error'); return; }
    var json = JSON.stringify(brief, null, 2);
    var done = function(ok) {
      if (ok) {
        var ad = getAd(adId);
        logActivity('media_brief_exported', 'ad', adId, ad ? ad.name : '', 'Copied media brief JSON to clipboard');
        toast(opts && opts.mcp ? 'MCP-ready brief copied to clipboard' : 'Media brief copied to clipboard', 'success');
      } else {
        toast('Copy failed — your browser blocked clipboard access', 'error');
      }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(json).then(function() { done(true); }, function() { done(false); });
    } else {
      // Fallback for older browsers
      var ta = document.createElement('textarea');
      ta.value = json; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { done(document.execCommand('copy')); } catch (e) { done(false); }
      document.body.removeChild(ta);
    }
  }

  // Open a preview modal so the user can inspect the brief before exporting.
  function openMediaBriefPreview(adId) {
    var brief = buildAdMediaBrief(adId);
    if (!brief) { toast('Could not build brief — ad not found', 'error'); return; }
    var json = JSON.stringify(brief, null, 2);
    var html = '';
    html += '<div class="cp-editor-form">';
    html += '<p class="cp-form-help">' + icon('info') + ' This JSON brief contains everything a downstream image / video / carousel tool needs to produce the creative. Copy or download to use it in Midjourney, Sora, Runway, an MCP-connected LLM, or any other production tool.</p>';
    html += '<div style="display:flex;gap:var(--cp-space-2);margin-bottom:var(--cp-space-3);flex-wrap:wrap">';
    html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="copy-media-brief" data-id="' + esc(adId) + '">' + icon('copy') + ' Copy JSON</button>';
    html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="copy-media-brief-mcp" data-id="' + esc(adId) + '">' + icon('robot') + ' Copy as MCP brief</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="download-media-brief" data-id="' + esc(adId) + '">' + icon('download') + ' Download .json</button>';
    html += '</div>';
    html += '<pre class="cp-media-brief-preview" style="max-height:55vh;overflow:auto;background:var(--cp-gray-50,#f8f9fa);padding:var(--cp-space-3);border-radius:var(--cp-radius-md);font-size:var(--cp-font-size-xs);line-height:1.5;white-space:pre">' + esc(json) + '</pre>';
    html += '</div>';
    openModal('Media brief — preview', html, {
      titleIcon: 'file-code', size: 'lg', footer: false
    });
  }

/* ===== src/30-part2b/26-events-keyboard.js ===== */
  // ============================================================
  // SECTION 22: EVENTS & KEYBOARD SHORTCUTS
  // ============================================================

  // Wraps a block of handler registrations so an error in one block
  // doesn't suppress the rest. Mirrors Part 2A's _safeHandlerBlock.
  function _safeHandlerBlockB(label, fn) {
    try { fn(); }
    catch (e) {
      console.error('[CP] Handler block "' + label + '" failed:', e);
      if (typeof toast === 'function') toast('Some controls in "' + label + '" may not work — see console.', 'warning', 5000);
    }
  }

  function setupPart2BEvents() {
    _safeHandlerBlockB('Part 2B: core', function() {
    // AI Research Panel interactions
    $(document).off('click.cp2b-research-gen').on('click.cp2b-research-gen', '[data-action="ai-research-generate"]', function(e) {
      e.preventDefault();
      var entityType = $(this).data('entity-type');
      var stateKey = $(this).data('state-key');
      var customInput = $('#cpResearchInput_' + stateKey).val() || '';
      // Route to appropriate AI function
      if (entityType === 'Persona') aiResearchPersonas(customInput);
      else if (entityType === 'Message') aiResearchMessages(customInput);
      else if (entityType === 'Style') aiResearchStyles(customInput);
      else if (entityType === 'Visual Format') aiResearchFormats(customInput);
      else if (entityType === 'Pain Point') aiResearchPainPoints(null, customInput);
    });

    // Toggle research result selection
    $(document).off('click.cp2b-research-toggle').on('click.cp2b-research-toggle', '.cp-ai-research-result', function(e) {
      e.preventDefault();
      var stateKey = $(this).data('state-key');
      var index = parseInt($(this).data('result-index'), 10);
      if (!isNaN(index) && stateKey) toggleResearchResultSelection(stateKey, index);
    });

    // Select all research results
    $(document).off('click.cp2b-research-selall').on('click.cp2b-research-selall', '[data-action="ai-research-select-all"]', function(e) {
      e.preventDefault();
      selectAllResearchResults($(this).data('state-key'));
    });

    // Add selected to library
    $(document).off('click.cp2b-research-add').on('click.cp2b-research-add', '[data-action="ai-research-add-selected"]', function(e) {
      e.preventDefault();
      addSelectedToLibrary($(this).data('entity-type'), $(this).data('state-key'));
    });

    // Inline AI assist
    $(document).off('click.cp2b-ai-assist').on('click.cp2b-ai-assist', '[data-action="ai-assist"]', function(e) {
      e.preventDefault();
      handleInlineAssist($(this).data('field-id'), $(this).data('mode'));
    });

    // AI action buttons from Part 2A pipeline steps (read custom instructions from expandable panel)
    function _getAICustomInstructions(btn) {
      var panelId = $(btn).data('panel-id');
      if (panelId) return ($('.cp-ai-custom-instructions[data-panel-id="' + panelId + '"]').val() || '').trim();
      return '';
    }

    // AI Preview modal interactions
    $(document).off('click.cp2b-ai-preview-sel').on('click.cp2b-ai-preview-sel', '[data-action="ai-preview-select"]', function(e) {
      e.preventDefault();
      var idx = parseInt($(this).data('idx'), 10);
      if (S._aiPreview && S._aiPreview.onSelect) S._aiPreview.onSelect(idx);
    });
    $(document).off('click.cp2b-ai-preview-regen').on('click.cp2b-ai-preview-regen', '[data-action="ai-preview-regenerate"]', function(e) {
      e.preventDefault();
      var instructions = ($('#cpAIPreviewInstructions').val() || '').trim();
      if (S._aiPreview && S._aiPreview.regenerate) {
        closeModal();
        S._aiPreview.regenerate(instructions);
      }
    });

    // AI research pain points (from persona detail)
    $(document).off('click.cp2b-ai-pp').on('click.cp2b-ai-pp', '[data-action="ai-research-pain-points"]', function(e) {
      e.preventDefault();
      aiResearchPainPoints($(this).data('persona-id'));
    });

    // AI provider picker dynamic model update
    $(document).off('change.cp2b-aip').on('change.cp2b-aip', '.cp-ai-provider-select', function() {
      var actionId = $(this).data('action-id'); var pid = $(this).val();
      var models = LLMService.getActiveModels(pid);
      var $mSel = $('.cp-ai-model-select[data-action-id="' + actionId + '"]');
      $mSel.empty();
      for (var i = 0; i < models.length; i++) {
        $mSel.append('<option value="' + esc(models[i].id) + '" data-temp="' + (models[i].temperature !== undefined ? models[i].temperature : 1.0) + '" data-tokens="' + (models[i].max_tokens || 8192) + '">' + esc(models[i].label) + '</option>');
      }
    });

    // AI status indicator click → navigate to settings
    $(document).off('click.cp2b-ai-status').on('click.cp2b-ai-status', '#cpAIStatus', function(e) {
      e.preventDefault();
      S.settingsTab = 'ai';
      navigate('settings');
    });

    // Test AI connection
    $(document).off('click.cp2b-test-ai').on('click.cp2b-test-ai', '[data-action="test-ai-connection"]', function(e) {
      e.preventDefault(); testAIConnection();
    });

    // --- Settings View ---
    $(document).off('click.cp2b-stab').on('click.cp2b-stab', '[data-action="settings-tab"]', function(e) {
      e.preventDefault(); S.settingsTab = $(this).data('tab'); render();
    });
    $(document).off('click.cp2b-save-settings').on('click.cp2b-save-settings', '[data-action="save-settings"]', function(e) {
      e.preventDefault(); saveAllSettings();
    });
    // Brand color picker sync
    $(document).off('input.cp2b-brand-color').on('input.cp2b-brand-color', '.cp-brand-color', function() {
      var key = $(this).data('color-key');
      $(this).closest('.cp-brand-color-field').find('.cp-brand-color-text').val($(this).val());
    });
    $(document).off('change.cp2b-brand-color-text').on('change.cp2b-brand-color-text', '.cp-brand-color-text', function() {
      var key = $(this).data('color-key'); var val = $(this).val();
      if (/^#[0-9a-fA-F]{6}$/.test(val)) $(this).closest('.cp-brand-color-field').find('.cp-brand-color').val(val);
    });
    // Funnel stage management
    $(document).off('click.cp2b-add-funnel').on('click.cp2b-add-funnel', '[data-action="add-funnel-stage"]', function(e) {
      e.preventDefault(); addFunnelStage();
    });
    $(document).off('click.cp2b-del-funnel').on('click.cp2b-del-funnel', '[data-action="delete-funnel-stage"]', function(e) {
      e.preventDefault(); deleteFunnelStage(parseInt($(this).data('stage-index'), 10));
    });

    // --- Import/Export ---
    $(document).off('click.cp2b-export').on('click.cp2b-export', '[data-action="export-json"]', function(e) {
      e.preventDefault(); exportJSON($(this).data('mode') || 'combined');
    });
    $(document).off('click.cp2b-import').on('click.cp2b-import', '[data-action="import-json"]', function(e) {
      e.preventDefault(); importJSON();
    });

    // --- Research Lab ---
    $(document).off('click.cp2b-research-tab').on('click.cp2b-research-tab', '[data-action="research-tab"]', function(e) {
      e.preventDefault(); S._researchTab = $(this).data('tab'); render();
    });

    // --- Stage 4: Meta v2 AI buttons (replace Stage 1/2 stubs) ---
    $(document).off('click.cp2b-ai-sug-sets').on('click.cp2b-ai-sug-sets', '[data-action="ai-suggest-ad-sets"]', function(e) {
      e.preventDefault(); aiSuggestAdSets($(this).data('campaign-id'));
    });
    $(document).off('click.cp2b-ai-sug-ads').on('click.cp2b-ai-sug-ads', '[data-action="ai-suggest-ads"]', function(e) {
      e.preventDefault(); aiSuggestAds($(this).data('ad-set-id'));
    });
    $(document).off('click.cp2b-ai-set-brief').on('click.cp2b-ai-set-brief', '[data-action="ai-generate-ad-set-brief"]', function(e) {
      e.preventDefault(); aiGenerateAdSetBrief($(this).data('id'));
    });
    // Hook tab Generate / Regenerate → opens the AI runner modal which
    // captures an optional steer + provider/model and then runs the
    // generator. The legacy `ai-generate-ad-hooks` action stays bound (in
    // case anything else dispatches it) but now goes through the modal too.
    $(document).off('click.cp2b-open-hook-gen').on('click.cp2b-open-hook-gen', '[data-action="ws-open-hook-gen-modal"]', function(e) {
      e.preventDefault(); openHookGenerationModal($(this).data('id'));
    });
    $(document).off('click.cp2b-ai-hooks').on('click.cp2b-ai-hooks', '[data-action="ai-generate-ad-hooks"]', function(e) {
      e.preventDefault(); openHookGenerationModal($(this).data('id'));
    });
    // Copy tab Write / Improve — open the AI runner modal which captures the
    // user's instructions + provider/model before running. Legacy direct
    // actions are kept and routed through the modal too.
    $(document).off('click.cp2b-open-copy-write').on('click.cp2b-open-copy-write', '[data-action="ws-open-copy-write-modal"]', function(e) {
      e.preventDefault(); openCopyWriteModal($(this).data('id'));
    });
    $(document).off('click.cp2b-open-copy-improve').on('click.cp2b-open-copy-improve', '[data-action="ws-open-copy-improve-modal"]', function(e) {
      e.preventDefault(); openCopyImproveModal($(this).data('id'));
    });
    $(document).off('click.cp2b-ai-copy').on('click.cp2b-ai-copy', '[data-action="ai-write-ad-copy"]', function(e) {
      e.preventDefault(); openCopyWriteModal($(this).data('id'));
    });
    $(document).off('click.cp2b-ai-improve').on('click.cp2b-ai-improve', '[data-action="ai-improve-ad-copy"]', function(e) {
      e.preventDefault(); openCopyImproveModal($(this).data('id'));
    });
    $(document).off('click.cp2b-ai-img-prompt').on('click.cp2b-ai-img-prompt', '[data-action="ai-generate-ad-image-prompt"]', function(e) {
      e.preventDefault(); aiGenerateAdImagePrompt($(this).data('id'));
    });
    $(document).off('click.cp2b-ai-video-scr').on('click.cp2b-ai-video-scr', '[data-action="ai-generate-video-script"]', function(e) {
      e.preventDefault(); aiGenerateVideoScript($(this).data('id'));
    });

    // --- Meta v2 workspace defaults ---
    $(document).off('change.cp2b-v2-def').on('change.cp2b-v2-def', '.cp-v2-defaults-field', function() {
      var key = $(this).data('key');
      var val = $(this).val();
      S.meta.meta_defaults = S.meta.meta_defaults || {};
      S.meta.meta_defaults[key] = val;
      syncToTextarea();
    });

    // --- Stage 7: Export + per-field copy ---
    $(document).off('click.cp2b-v2-exp-open').on('click.cp2b-v2-exp-open', '[data-action="v2-export-open"]', function(e) {
      e.preventDefault(); openExportModal($(this).data('campaign-id') || null);
    });
    $(document).off('click.cp2b-v2-exp-json').on('click.cp2b-v2-exp-json', '[data-action="v2-export-json"]', function(e) {
      e.preventDefault(); exportV2JSON($(this).data('campaign-id') || null);
    });
    $(document).off('click.cp2b-v2-exp-csv').on('click.cp2b-v2-exp-csv', '[data-action="v2-export-csv"]', function(e) {
      e.preventDefault(); exportV2CSV($(this).data('campaign-id') || null);
    });
    $(document).off('click.cp2b-v2-copy').on('click.cp2b-v2-copy', '[data-action="v2-copy-ad-field"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      copyAdField($(this).data('id'), $(this).data('field'));
    });

    // --- Stage 7b: Per-ad structured media brief (Phase 5 of the audit) ---
    $(document).off('click.cp2b-brief-preview').on('click.cp2b-brief-preview', '[data-action="preview-media-brief"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      openMediaBriefPreview($(this).data('id'));
    });
    $(document).off('click.cp2b-brief-copy').on('click.cp2b-brief-copy', '[data-action="copy-media-brief"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      copyAdMediaBriefJSON($(this).data('id'));
    });
    $(document).off('click.cp2b-brief-copy-mcp').on('click.cp2b-brief-copy-mcp', '[data-action="copy-media-brief-mcp"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      copyAdMediaBriefJSON($(this).data('id'), { mcp: true });
    });
    $(document).off('click.cp2b-brief-dl').on('click.cp2b-brief-dl', '[data-action="download-media-brief"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      exportAdMediaBriefJSON($(this).data('id'));
    });
    });  // _safeHandlerBlockB('Part 2B: core')

    console.log('[CP] Part 2B event handlers ready');
  }

  function setupKeyboardShortcuts() {
    // Key '3' (formerly Pain Points) now opens the Personas view's Pain Points tab.
    var viewKeys = { '1': 'dashboard', '2': 'personas', '3': 'personas_pp', '4': 'messages', '5': 'styles', '6': 'formats', '7': 'meta_campaigns', '8': 'calendar', '9': 'research', '0': 'settings' };

    $(document).off('keydown.cp2b-shortcuts').on('keydown.cp2b-shortcuts', function(e) {
      // Skip if inside input/textarea or modal open
      if ($(e.target).is('input, textarea, select, [contenteditable]')) return;
      if ($('.cp-modal-backdrop').length || $('.cp-confirm-backdrop').length) return;

      // Number keys → navigate. 'personas_pp' is a synthetic key that means
      // "open Personas view with the Pain Points tab active".
      if (viewKeys[e.key]) {
        e.preventDefault();
        var target = viewKeys[e.key];
        if (target === 'personas_pp') {
          S.personasTab = 'pain_points';
          navigate('personas');
        } else {
          if (target === 'personas') S.personasTab = 'personas';
          navigate(target);
        }
        return;
      }
      // / → focus search
      if (e.key === '/') {
        e.preventDefault();
        var $search = $('.cp-search-wrapper .cp-input:visible').first();
        if ($search.length) $search.focus();
        return;
      }
      // n → new entity (context-sensitive)
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        var P2A = window._cpPart2A;
        if (!P2A) return;
        var view = S.currentView;
        if (view === 'personas') {
          // Personas view has two tabs — open the matching modal
          if (S.personasTab === 'pain_points') P2A.openPainPointModal();
          else P2A.openPersonaModal();
        }
        else if (view === 'messages') P2A.openMessageModal();
        else if (view === 'styles') P2A.openStyleModal();
        else if (view === 'formats') P2A.openFormatModal();
        else if (view === 'meta_campaigns' || view === 'campaign_workspace') {
          if (P2A.openNewCampaignWizard) P2A.openNewCampaignWizard();
        }
        return;
      }
    });
  }


/* ===== src/30-part2b/27-exports.js ===== */
  // ============================================================
  // SECTION 23: API EXPORTS
  // ============================================================

  window._cpPart2B = {
    // Services
    LLMService: LLMService, BrandService: BrandService,

    // AI utilities
    parseJSON: parseJSON, callAIWithRetry: callAIWithRetry,
    brandSnippet: brandSnippet,
    entityContextSnippet: entityContextSnippet,

    // Components
    renderAIResearchPanelBody: renderAIResearchPanelBody,
    renderInlineAIAssist: renderInlineAIAssist,
    renderInlinePicker: LLMService.renderInlinePicker,

    // AI library research actions
    aiResearchPersonas: aiResearchPersonas, aiResearchPainPoints: aiResearchPainPoints,
    aiResearchMessages: aiResearchMessages, aiResearchStyles: aiResearchStyles,
    aiResearchFormats: aiResearchFormats,
    showAIPreview: showAIPreview,

    // Meta v2 — export
    openExportModal: openExportModal,
    exportV2JSON: exportV2JSON, exportV2CSV: exportV2CSV,
    validateForExport: validateForExport,
    copyAdField: copyAdField,
    // Per-ad media brief (structured JSON for downstream tools / MCP)
    buildAdMediaBrief: buildAdMediaBrief,
    exportAdMediaBriefJSON: exportAdMediaBriefJSON,
    copyAdMediaBriefJSON: copyAdMediaBriefJSON,
    openMediaBriefPreview: openMediaBriefPreview,

    // Meta v2 AI
    aiSuggestAdSets: aiSuggestAdSets, aiSuggestAds: aiSuggestAds,
    aiGenerateAdSetBrief: aiGenerateAdSetBrief,
    aiGenerateAdHooks: aiGenerateAdHooks,
    aiWriteAdCopy: aiWriteAdCopy, aiImproveAdCopy: aiImproveAdCopy,
    openHookGenerationModal: openHookGenerationModal,
    openCopyWriteModal: openCopyWriteModal,
    openCopyImproveModal: openCopyImproveModal,
    openAiRunnerModal: openAiRunnerModal,
    aiGenerateAdImagePrompt: aiGenerateAdImagePrompt,
    aiGenerateVideoScript: aiGenerateVideoScript,

    // Setup Wizard AI generators + finalize
    swAIGeneratePersonas: swAIGeneratePersonas, swAIGeneratePainPoints: swAIGeneratePainPoints,
    swAIGenerateMessages: swAIGenerateMessages, swAIGenerateStylesFormats: swAIGenerateStylesFormats,
    swAIGenerateCampaignIdeas: swAIGenerateCampaignIdeas,
    finalizeSetupWizard: finalizeSetupWizard,

    // New Campaign Wizard AI + finalize
    ncwAISuggestAdSets: ncwAISuggestAdSets,
    ncwAISuggestAds: ncwAISuggestAds,
    finalizeNewCampaignWizard: finalizeNewCampaignWizard,

    // Status
    updateAIStatusIndicator: updateAIStatusIndicator, testAIConnection: testAIConnection,

    // Settings & Config
    saveAllSettings: saveAllSettings, addFunnelStage: addFunnelStage,
    exportJSON: exportJSON, importJSON: importJSON
  };

  console.log('[CP] Part 2B loaded');

})(jQuery, Drupal);
