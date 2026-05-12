/* Campaign Planner — built from 88 source files (see src/) */

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
    'personas':          { order: 2,  label: 'Personas',          icon: 'users',              group: 'library', description: 'Audience personas' },
    'pain_points':       { order: 3,  label: 'Pain Points',       icon: 'bolt',               group: 'library', description: 'Pain points & solutions' },
    'messages':          { order: 4,  label: 'Messages',          icon: 'comments',           group: 'library', description: 'Message library' },
    'styles':            { order: 5,  label: 'Styles',            icon: 'palette',            group: 'library', description: 'Creative styles' },
    'formats':           { order: 6,  label: 'Formats',           icon: 'clapperboard',       group: 'library', description: 'Visual formats' },
    'recipes':           { order: 7,  label: 'Recipes',           icon: 'shuffle',            group: 'core',    description: 'Creative recipes (legacy)', legacy: true },
    'campaigns':         { order: 8,  label: 'Campaigns (v1)',    icon: 'bullhorn',           group: 'core',    description: 'Legacy campaigns',          legacy: true },
    // Meta v2 — the new working surface. Sidebar shows these when
    // S.meta.setup.meta_v2 === true.
    'meta_campaigns':    { order: 7,  label: 'Campaigns',         icon: 'bullhorn',           group: 'core',    description: 'Meta Campaigns',            metaV2: true },
    'campaign_workspace':{ order: 8,  label: 'Campaign Workspace',icon: 'sitemap',            group: 'core',    description: 'Campaign → Ad Set → Ad',    metaV2: true, hidden: true },
    'calendar':          { order: 9,  label: 'Calendar',          icon: 'calendar',           group: 'core',    description: 'Timeline view' },
    'research':          { order: 10, label: 'Research Lab',      icon: 'flask',              group: 'tools',   description: 'AI research hub' },
    'images':            { order: 11, label: 'Images',            icon: 'images',             group: 'tools',   description: 'Reference images' },
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
    { key: 'composition', label: 'Composition', icon: 'shapes',        order: 0 },
    { key: 'hook',        label: 'Hook',        icon: 'anchor',        order: 1 },
    { key: 'content',     label: 'Content',     icon: 'pen-fancy',     order: 2 },
    { key: 'media',       label: 'Production',  icon: 'rocket',        order: 3 },
    { key: 'review',      label: 'Review',      icon: 'eye',           order: 4 }
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


/* ===== src/10-part1/02-state.js ===== */
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


/* ===== src/10-part1/03-init.js ===== */
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

    // Parse production-node list from the Drupal media-productions view block
    parseProductionData();
  }

  // Build S.productionMap from the Drupal view-media-productions block
  // and mirror new entries into recipe.production (append-only — never
  // overwrites or removes existing recipe.production records).
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
    // Mirror into recipe.production for any recipes that don't yet have a
    // cached production. Append-only: existing recipe.production is kept
    // as-is even if the view's snapshot has changed. For each newly-seeded
    // recipe, log a "production attached" activity entry and try to
    // auto-advance the recipe status (typically to media_ready).
    var seeded = 0;
    var advanced = 0;
    var recipes = (S.data && S.data.recipes) || [];
    for (var i = 0; i < recipes.length; i++) {
      var r = recipes[i];
      var live = S.productionMap[r.id];
      if (!live) continue;
      if (r.production && r.production.node_id) continue;
      r.production = $.extend(true, {}, live);
      seeded++;
      // First-time discovery → activity log entry
      if (typeof logActivity === 'function') {
        var prodType = live.media_type || live.type || 'production';
        var prodLabel = live.title || ('node ' + (live.node_id || '?'));
        logActivity('production_attached', 'recipe', r.id, r.title,
          'Production node attached: ' + prodLabel + ' (' + prodType + ')');
      }
      // Production existence is a strong signal — try to advance status.
      if (typeof maybeAdvanceRecipeStatus === 'function') {
        if (maybeAdvanceRecipeStatus(r, 'production node detected')) advanced++;
      }
    }
    console.log('[CP] Parsed ' + Object.keys(S.productionMap).length +
      ' production node(s)' +
      (seeded   ? ', seeded ' + seeded + ' recipe.production cache entries' : '') +
      (advanced ? ', advanced ' + advanced + ' recipe status to media_ready'  : ''));
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
        // Meta v2 gate: false = old recipe-centric UI; true = new Workspace.
        // Flipped by the Stage 6 migration wizard.
        meta_v2: false,
        migrated_to_v2: false
      },
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
      image_categories: getDefaultImageCategories(),
      // Meta v2 workspace-level defaults (Page, Pixel, attribution, currency etc.)
      meta_defaults: getDefaultMetaDefaults(),
      // Legacy backup populated by the migration importer (Stage 6) so users
      // can recover their pre-v2 data until they explicitly discard it.
      legacy_backup: null
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
      a.media.image = a.media.image || { asset_id: '', ai_prompt: '', brief: '', aspect_ratio: '1:1', negative_prompt: '', reference_image_ids: [] };
      a.media.image.reference_image_ids = a.media.image.reference_image_ids || [];
      a.media.video = a.media.video || { asset_id: '', duration_seconds: 30, aspect_ratio: '9:16', concept: '', blueprint: { scenes: [] }, script: { rows: [] } };
      a.media.video.blueprint = a.media.video.blueprint || { scenes: [] };
      a.media.video.script = a.media.video.script || { rows: [] };
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
    // Meta v2 setup flags (idempotent — don't clobber existing values)
    if (typeof m.setup.meta_v2 !== 'boolean') m.setup.meta_v2 = false;
    if (typeof m.setup.migrated_to_v2 !== 'boolean') m.setup.migrated_to_v2 = false;
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

    // Meta v2: workspace-level Page / Pixel / attribution / currency defaults
    m.meta_defaults = m.meta_defaults || {};
    var defaults = getDefaultMetaDefaults();
    for (var dk in defaults) {
      if (m.meta_defaults[dk] === undefined) m.meta_defaults[dk] = defaults[dk];
    }
    // Legacy backup (populated by Stage 6 importer; null until then)
    if (m.legacy_backup === undefined) m.legacy_backup = null;

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
      case 'meta_campaigns':     html = renderMetaCampaignsView(); break;
      case 'campaign_workspace': html = renderCampaignWorkspaceView(); break;
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

    // Replace any AI picker placeholders left in the DOM (Part 2B loads async).
    if (typeof window._cpReplaceAiPickers === 'function') window._cpReplaceAiPickers();
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

  // --- Meta v2 entity getters ---
  function getCampaignV2(id) { return S.campaignV2Map[id] || null; }
  function getAdSet(id)      { return S.adSetMap[id] || null; }
  function getAd(id)         { return S.adMap[id] || null; }
  function isMetaV2Enabled() { return !!(S.meta && S.meta.setup && S.meta.setup.meta_v2); }

  // Returns the production node info for a recipe, preferring the live
  // snapshot from S.productionMap (rebuilt on each page load from the view
  // block) and falling back to the persistent recipe.production cache.
  // Returns null if neither has a record.
  function getRecipeProduction(recipeIdOrRecipe) {
    if (!recipeIdOrRecipe) return null;
    var recipe = typeof recipeIdOrRecipe === 'string' ? S.recipeMap[recipeIdOrRecipe] : recipeIdOrRecipe;
    var live = (S.productionMap || {})[recipe ? recipe.id : recipeIdOrRecipe];
    if (live && live.node_id) return live;
    if (recipe && recipe.production && recipe.production.node_id) return recipe.production;
    return null;
  }

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
  function getAllRecipes() { return (S.data.recipes || []).slice(); }
  function getAllCampaigns() { return (S.data.campaigns || []).slice(); }
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
      '<div class="cp-body">' + renderSidebar() +
      '<div class="cp-main"><div class="cp-content" id="cpContent"></div></div></div>' +
      '<div id="cpToasts" class="cp-toast-container"></div>';
  }

  function renderHeader() {
    var ws = (S.meta && S.meta.workspace) || {};
    var setup = (S.meta && S.meta.setup) || {};
    var html = '<div class="cp-header"><div class="cp-header-left">';
    html += '<button class="cp-btn-icon cp-sidebar-toggle" id="cpSidebarToggle">' + icon('menu') + '</button>';
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
    var html = '<div class="cp-sidebar' + (S.sidebarHidden ? ' cp-sidebar-hidden' : '') + '" id="cpSidebar"><div class="cp-sidebar-overlay"></div><div class="cp-sidebar-inner"><nav class="cp-nav">';

    // Grouped sidebar
    var groupOrder = ['main', 'library', 'core', 'tools'];
    for (var gi = 0; gi < groupOrder.length; gi++) {
      var gk = groupOrder[gi];
      var grp = SIDEBAR_GROUPS[gk];
      html += '<div class="cp-nav-group">';
      html += '<div class="cp-nav-group-label">' + esc(grp.label) + '</div>';

      var metaV2 = !!(S.meta && S.meta.setup && S.meta.setup.meta_v2);
      for (var key in APP_VIEWS) {
        var v = APP_VIEWS[key];
        if (v.group !== gk) continue;
        if (v.hidden) continue;                       // never in sidebar (e.g. campaign_workspace)
        if (v.metaV2 && !metaV2) continue;            // gated to v2-enabled workspaces
        if (v.legacy && metaV2) continue;             // hide legacy entries once v2 is on
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
      case 'meta_campaigns': count = S.activeCampaignsV2; break;
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


/* ===== src/10-part1/10-view-dashboard.js ===== */
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

/* ===== src/10-part1/11-view-personas.js ===== */
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


/* ===== src/10-part1/14-view-pain-points.js ===== */
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

    // Group mode: 'category' (default) | 'flat'
    var groupBy = ppFilter.groupBy || 'category';

    var html = '<div class="cp-view cp-view-pain-points">';

    // Header
    html += '<div class="cp-view-header"><div class="cp-view-header-left">';
    html += '<h1>' + icon('bolt') + ' Pain Points</h1>';
    html += '<span class="cp-view-subtitle">' + filtered.length + ' of ' + pps.length + '</span>';
    html += '</div><div class="cp-view-header-right">';
    html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="new-pain-point">' + icon('plus') + ' Add Pain Point</button>';
    html += '</div></div>';

    // AI Research Panel
    html += '<div class="cp-ai-research-slot" id="cpPainPointResearchSlot">';
    html += renderAIResearchBar('Pain Point', '#d93025', 'bolt', 'pain_points');
    html += '</div>';

    // Toolbar — single compact row
    html += '<div class="cp-view-toolbar cp-pp-toolbar">';
    html += '<div class="cp-search-wrapper">' + icon('search') + '<input type="text" class="cp-input" id="cpPainPointPageSearch" placeholder="Search pain points & solutions…" value="' + esc(ppFilter.search || '') + '"></div>';
    html += '<select class="cp-select cp-select-sm" id="cpPainPointCatFilter"><option value="">All Categories</option>';
    for (var ci = 0; ci < PAIN_POINT_CATEGORIES.length; ci++) {
      var cat = PAIN_POINT_CATEGORIES[ci];
      html += '<option value="' + esc(cat.id) + '"' + (ppFilter.category === cat.id ? ' selected' : '') + '>' + esc(cat.name) + '</option>';
    }
    html += '</select>';
    html += '<select class="cp-select cp-select-sm" id="cpPainPointGroupBy">';
    html += '<option value="category"' + (groupBy === 'category' ? ' selected' : '') + '>Group: Category</option>';
    html += '<option value="flat"' + (groupBy === 'flat' ? ' selected' : '') + '>Group: None</option>';
    html += '</select>';
    html += '</div>';

    // Split pane: list + detail
    html += '<div class="cp-split-pane">';

    // Left: list
    html += '<div class="cp-list-pane cp-pp-list-pane">';
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

    // Right: detail
    html += '<div class="cp-preview-pane">';
    html += renderPainPointDetailPane();
    html += '</div></div>';

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
    var recipeCount = (S.data.recipes || []).filter(function(r) { return (r.selected_pain_point_ids || []).indexOf(pp.id) > -1; }).length;
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
    if (recipeCount > 0) html += '<span class="cp-pp-mini-stat" title="Used in recipes">' + icon('shuffle') + ' ' + recipeCount + '</span>';
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
    html += '<div class="cp-card cp-pp-detail-card">';
    html += '<div class="cp-section-header"><h3>' + icon('triangle-exclamation') + ' Pain Point</h3></div>';
    html += '<textarea class="cp-textarea cp-pp-inline-field" data-ppfield="pain_point" rows="3">' + esc(pp.pain_point || '') + '</textarea>';
    html += '</div>';

    html += '<div class="cp-card cp-pp-detail-card cp-pp-detail-solution">';
    html += '<div class="cp-section-header"><h3 style="color:var(--cp-success)">' + icon('lightbulb') + ' Solution</h3></div>';
    html += '<textarea class="cp-textarea cp-pp-inline-field" data-ppfield="solution" rows="3" placeholder="How does your product solve this?">' + esc(pp.solution || '') + '</textarea>';
    html += '</div>';

    // Category inline selector
    html += '<div class="cp-card cp-pp-detail-card">';
    html += '<div class="cp-form-group"><label class="cp-field-label">Category</label>';
    html += '<select class="cp-select cp-pp-inline-field" data-ppfield="category">';
    html += '<option value="">None</option>';
    for (var ci = 0; ci < ppCats.length; ci++) {
      html += '<option value="' + esc(ppCats[ci].id) + '"' + (pp.category === ppCats[ci].id ? ' selected' : '') + '>' + esc(ppCats[ci].name) + '</option>';
    }
    html += '</select></div></div>';

    // Linked Personas with link/unlink actions
    html += '<div class="cp-card cp-pp-detail-card">';
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
    html += '<div class="cp-card cp-pp-detail-card">';
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


/* ===== src/10-part1/16-view-recipes.js ===== */
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
    // Production filter (has / missing production node)
    html += '<select class="cp-select cp-select-sm" id="cpRecipeProductionFilter" title="Production node status">';
    html += '<option value=""' + (!f.production ? ' selected' : '') + '>All Production</option>';
    html += '<option value="has"' + (f.production === 'has' ? ' selected' : '') + '>With Production</option>';
    html += '<option value="missing"' + (f.production === 'missing' ? ' selected' : '') + '>Missing Production</option>';
    html += '</select>';
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
    var rProd = getRecipeProduction(recipe);
    if (rProd) {
      var prodStatusStyle = getProductionStatusStyle(rProd.status);
      var prodTitle = 'Production: ' + (rProd.title || 'connected') + (rProd.status ? ' • ' + rProd.status : '');
      html += '<span class="cp-badge cp-recipe-item-prod-badge" style="background:' + prodStatusStyle.color + '15;color:' + prodStatusStyle.color + '" title="' + esc(prodTitle) + '">' + icon('rocket') + '</span>';
    }
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
  // Counts the primary fields: persona, message, hook, ad copy, headline,
  // CTA, and a chosen media type for the production handoff.
  function getRecipeCompletionPct(recipe) {
    var done = 0, total = 7;
    if (recipe.persona_id) done++;
    if (recipe.message_id) done++;
    var hook = recipe.hook || {};
    if (hook.custom_hook || hook.selected_hook_id) done++;
    var content = recipe.content || {};
    var adCopy = stripHtml ? stripHtml(content.ad_copy || '') : (content.ad_copy || '').replace(/<[^>]*>/g, '');
    if (adCopy.trim().length >= 50) done++;
    if (content.headline && content.headline.trim()) done++;
    if (content.cta && content.cta.trim()) done++;
    if (recipe.media_type) done++;
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
    if (f.production === 'has') recipes = recipes.filter(function(r) { return !!getRecipeProduction(r); });
    else if (f.production === 'missing') recipes = recipes.filter(function(r) { return !getRecipeProduction(r); });

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


/* ===== src/10-part1/17-view-campaigns.js ===== */
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
    html += '<button class="cp-btn cp-btn-ai" data-action="ai-generate-campaign-tree">' + icon('wand-magic') + ' Generate from brief</button>';
    html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="new-campaign-v2">' + icon('plus') + ' New Campaign</button>';
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
        html += '<div class="cp-empty-state-text">Start with the AI brief-to-tree generator, or create one manually.</div>';
        html += '<div style="display:flex;gap:var(--cp-space-2);justify-content:center;margin-top:var(--cp-space-3)">';
        html += '<button class="cp-btn cp-btn-ai" data-action="ai-generate-campaign-tree">' + icon('wand-magic') + ' Generate from brief</button>';
        html += '<button class="cp-btn cp-btn-primary" data-action="new-campaign-v2">' + icon('plus') + ' New Campaign</button>';
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
    if (S.selectedAdId)    return renderInspectorForAd(S.adMap[S.selectedAdId]);
    if (S.selectedAdSetId) return renderInspectorForAdSet(S.adSetMap[S.selectedAdSetId]);
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

    // Quick actions
    html += '<div class="cp-inspector-actions">';
    html += '<button class="cp-btn cp-btn-primary" data-action="ws-add-ad-set" data-campaign-id="' + esc(camp.id) + '">' + icon('plus') + ' Add Ad Set</button>';
    html += '<button class="cp-btn cp-btn-ai" data-action="ai-suggest-ad-sets" data-campaign-id="' + esc(camp.id) + '">' + icon('sparkles') + ' Suggest Ad Sets</button>';
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

  function renderInspectorForAd(ad) {
    var adSet = S.adSetMap[ad.ad_set_id];
    var camp = adSet ? S.campaignV2Map[adSet.campaign_id] : null;
    var status = metaAdStatus(ad.pipeline_status);
    var ctype = META_AD_CREATIVE_TYPES[ad.creative_type] || { label: 'Ad', icon: 'rectangle-ad' };
    var cta = metaCTA((ad.creative || {}).cta_type);

    var html = '';
    html += '<div class="cp-inspector-header"><div>';
    var crumb = (camp ? esc(camp.name) + ' · ' : '') + (adSet ? esc(adSet.name) : '');
    html += '<div class="cp-inspector-eyebrow">' + icon(ctype.icon) + ' ' + esc(ctype.label) + (crumb ? ' · ' + crumb : '') + '</div>';
    html += '<h2 class="cp-inspector-title">' + esc(ad.name) + '</h2>';
    html += '<div style="display:flex;gap:var(--cp-space-2);flex-wrap:wrap;margin-top:6px">';
    html += '<span class="cp-badge" style="background:' + status.color + '15;color:' + status.color + '">' + icon(status.icon) + ' ' + esc(status.label) + '</span>';
    html += '</div></div><div class="cp-inspector-header-actions">';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="edit-ad" data-id="' + esc(ad.id) + '">' + icon('edit') + ' Edit</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="delete-ad" data-id="' + esc(ad.id) + '">' + icon('trash') + '</button>';
    html += '</div></div>';

    // Hook
    var hook = ad.hook || {};
    if (hook.text) {
      html += '<div class="cp-inspector-section">';
      html += '<div class="cp-inspector-section-title">' + icon('anchor') + ' Hook</div>';
      html += '<blockquote class="cp-ad-hook">' + esc(hook.text) + '</blockquote>';
      html += '</div>';
    }

    // Creative — primary text / headline / description / CTA / link
    var creative = ad.creative || {};
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('pen-fancy') + ' Creative</div>';
    html += '<div class="cp-inspector-grid cp-inspector-grid-1">';
    html += inspectorField('Primary text', creative.primary_text || '—', true);
    html += inspectorField('Headline',     creative.headline     || '—');
    html += inspectorField('Description',  creative.description  || '—');
    html += inspectorField('CTA',          cta ? cta.label : (creative.cta_type || '—'));
    html += inspectorField('Link',         creative.cta_link     || '—');
    html += inspectorField('Display link', creative.display_link || '—');
    html += '</div></div>';

    // Media (preview only — full editor in Stage 2)
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('image') + ' Media';
    html += '<span class="cp-text-muted" style="font-weight:400;font-size:11px;margin-left:8px">' + esc(ctype.label) + '</span>';
    html += '</div>';
    var media = ad.media || {};
    if (ad.creative_type === 'single_image') {
      if (media.image && (media.image.brief || media.image.ai_prompt)) {
        if (media.image.brief)     html += '<p><strong>Brief:</strong> ' + esc(media.image.brief) + '</p>';
        if (media.image.ai_prompt) html += '<p><strong>Prompt:</strong> ' + esc(media.image.ai_prompt) + '</p>';
      } else html += '<div class="cp-text-muted">No image brief yet.</div>';
    } else if (ad.creative_type === 'single_video') {
      if (media.video && (media.video.concept || (media.video.script && media.video.script.rows && media.video.script.rows.length))) {
        if (media.video.concept) html += '<p><strong>Concept:</strong> ' + esc(media.video.concept) + '</p>';
        if (media.video.script && media.video.script.rows && media.video.script.rows.length) {
          html += '<p>' + media.video.script.rows.length + ' script rows · ' + (media.video.duration_seconds || '?') + 's · ' + (media.video.aspect_ratio || '') + '</p>';
        }
      } else html += '<div class="cp-text-muted">No video brief yet.</div>';
    } else if (ad.creative_type === 'carousel') {
      var cards = media.carousel_cards || [];
      html += '<div>' + cards.length + ' card' + (cards.length !== 1 ? 's' : '') + '</div>';
    }
    html += '</div>';

    // Review/production
    if (ad.review_notes || ad.production_notes || ad.assigned_to || ad.due_date) {
      html += '<div class="cp-inspector-section">';
      html += '<div class="cp-inspector-section-title">' + icon('clipboard-list') + ' Review & production</div>';
      html += '<div class="cp-inspector-grid">';
      html += inspectorField('Assigned to',     ad.assigned_to     || '—');
      html += inspectorField('Due date',        ad.due_date        || '—');
      html += inspectorField('Review notes',    ad.review_notes    || '—');
      html += inspectorField('Production notes',ad.production_notes|| '—');
      html += '</div></div>';
    }

    return html;
  }

  // --- Small helpers ---

  function inspectorField(label, value, wide) {
    var cls = wide ? ' cp-inspector-field-wide' : '';
    return '<div class="cp-inspector-field' + cls + '"><div class="cp-inspector-field-label">' + esc(label) + '</div><div class="cp-inspector-field-value">' + (typeof value === 'string' ? esc(value) : (value || '')) + '</div></div>';
  }

  function renderScheduleSummary(start, end) {
    if (!start && !end) return 'Always-on';
    return (start ? formatDateShort(start) : 'Now') + ' → ' + (end ? formatDateShort(end) : 'Ongoing');
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

    // Recipe production-presence filter (has / missing production node)
    $(document).off('change.cp-recipe-prod').on('change.cp-recipe-prod', '#cpRecipeProductionFilter', function() {
      S.recipeFilter.production = $(this).val() || '';
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


/* ===== src/10-part1/21-filter-sort.js ===== */
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
          // Production node attached to this recipe (one per recipe, by media type).
          // Populated by parseProductionData() when the Drupal view block lists it.
          production: null,
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
            image: { asset_id: '', ai_prompt: '', brief: '', aspect_ratio: '1:1', negative_prompt: '', reference_image_ids: [] },
            video: { asset_id: '', duration_seconds: 30, aspect_ratio: '9:16', concept: '', blueprint: { scenes: [] }, script: { rows: [] } },
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
        var allArrays = [S.data.personas, S.data.messages, S.data.styles, S.data.visual_formats, S.data.recipes, S.data.campaigns, S.data.campaigns_v2, S.data.ads];
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
      visual_format: S.data.visual_formats, recipe: S.data.recipes, campaign: S.data.campaigns,
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

    // Recipe status change logging
    if (type === 'recipe' && field === 'status') {
      var newLabel = (RECIPE_STATUSES[value] || {}).label || value;
      logActivity('recipe_status_changed', 'recipe', id, entity.title, 'Status changed to ' + newLabel);
    }
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
      visual_format: S.data.visual_formats, recipe: S.data.recipes, campaign: S.data.campaigns,
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
    if (type === 'recipe') { clone.status = 'draft'; clone.batch_id = ''; clone.review_notes = ''; clone.assigned_to = ''; }
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
    // Media production now happens in dedicated apps (image_production,
    // carousel_production, video_production). The recipe is considered
    // production-ready as soon as a media type is chosen for handoff and
    // ad copy is in place — the actual creative is built downstream.
    // A production node attached to the recipe is the strongest possible
    // signal and advances us regardless of intermediate state.
    sugIdx = STATUS_ORDER.indexOf(suggested);
    if (STATUS_ORDER.indexOf('media_ready') > sugIdx) {
      var hasProd = typeof getRecipeProduction === 'function' && !!getRecipeProduction(recipe);
      if (hasProd) {
        suggested = 'media_ready';
      } else if (recipe.media_type && suggested === 'content_ready') {
        suggested = 'media_ready';
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
  window._cpGetRecipeProduction = getRecipeProduction;
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
  window._cpGetAllRecipes = getAllRecipes;
  window._cpGetAllCampaigns = getAllCampaigns;
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
    var recipeCount = (S.personaRecipeCounts || {})[personaId] || 0;
    openConfirmDialog({
      title: 'Delete Persona',
      message: 'Delete "' + p.name + '"?' + (recipeCount > 0 ? ' ' + recipeCount + ' recipe(s) will lose their persona reference.' : ''),
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
    var recipeCount = (S.messageRecipeCounts || {})[msgId] || 0;
    openConfirmDialog({
      title: 'Delete Message',
      message: 'Delete "' + m.title + '"?' + (recipeCount > 0 ? ' ' + recipeCount + ' recipe(s) will lose their message reference.' : ''),
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
    var recipeCount = (S.styleRecipeCounts || {})[styleId] || 0;
    openConfirmDialog({
      title: 'Delete Style',
      message: 'Delete "' + s.name + '"?' + (recipeCount > 0 ? ' ' + recipeCount + ' recipe(s) will lose their style reference.' : ''),
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
    var recipeCount = (S.formatRecipeCounts || {})[formatId] || 0;
    openConfirmDialog({
      title: 'Delete Visual Format',
      message: 'Delete "' + f.name + '"?' + (recipeCount > 0 ? ' ' + recipeCount + ' recipe(s) will lose their format reference.' : ''),
      confirmLabel: 'Delete', danger: true,
      onConfirm: function() { snapshot('Delete format'); deleteEntity('visual_format', formatId); }
    });
  }


/* ===== src/20-part2a/09-campaign-crud.js ===== */
  // ============================================================
  // SECTION 9: CAMPAIGN CRUD
  // ============================================================

  function openCampaignModal(campId) {
    var isEdit = !!campId;
    var c = isEdit ? getCampaign(campId) : null;
    var objectives = Constants.CAMPAIGN_OBJECTIVES || [];
    var funnels = (S.meta.settings && S.meta.settings.funnel_stages) || [];
    var campStatuses = Constants.CAMPAIGN_STATUSES || {};

    // Pre-fill dimension selections for edit
    var selPersonas = (c && c.persona_ids) ? c.persona_ids.slice() : [];
    var selMessages = (c && c.message_ids) ? c.message_ids.slice() : [];
    var selStyles = (c && c.style_ids) ? c.style_ids.slice() : [];
    var selFormats = (c && c.format_ids) ? c.format_ids.slice() : [];

    var html = '<div class="cp-editor-form">';

    // Name + status
    html += '<div class="cp-form-row"><div class="cp-form-half">';
    html += '<label>Campaign Name *</label>';
    html += '<input type="text" class="cp-input" data-field="name" value="' + esc(c ? c.name : '') + '" placeholder="e.g., Q2 Lead Generation">';
    html += '</div><div class="cp-form-half">';
    html += '<label>Status</label>';
    html += '<select class="cp-select" data-field="status">';
    for (var sk in campStatuses) {
      var sel = (c && c.status === sk) ? ' selected' : '';
      if (!c && sk === 'planning') sel = ' selected';
      html += '<option value="' + sk + '"' + sel + '>' + esc(campStatuses[sk].label) + '</option>';
    }
    html += '</select></div></div>';

    // Description
    html += '<div class="cp-form-group"><label>Description</label>';
    html += '<textarea class="cp-textarea" data-field="description" rows="2" placeholder="Campaign description...">' + esc(c ? c.description || '' : '') + '</textarea></div>';

    // Objective + Funnel
    html += '<div class="cp-form-row"><div class="cp-form-half">';
    html += '<label>Objective</label>';
    html += '<select class="cp-select" data-field="objective">';
    html += '<option value="">Select...</option>';
    for (var oi = 0; oi < objectives.length; oi++) {
      var oSel = (c && c.objective === objectives[oi].id) ? ' selected' : '';
      html += '<option value="' + esc(objectives[oi].id) + '"' + oSel + '>' + esc(objectives[oi].name) + '</option>';
    }
    html += '</select></div><div class="cp-form-half">';
    html += '<label>Funnel Stage</label>';
    html += '<select class="cp-select" data-field="funnel_stage">';
    html += '<option value="">All stages</option>';
    for (var fi = 0; fi < funnels.length; fi++) {
      var fSel = (c && c.funnel_stage === funnels[fi].id) ? ' selected' : '';
      html += '<option value="' + esc(funnels[fi].id) + '"' + fSel + '>' + esc(funnels[fi].short || funnels[fi].name) + '</option>';
    }
    html += '</select></div></div>';

    // Date range
    html += '<div class="cp-form-row"><div class="cp-form-half">';
    html += '<label>Start Date</label>';
    html += '<input type="date" class="cp-input" data-field="date_start" value="' + esc(c ? c.date_start || '' : '') + '">';
    html += '</div><div class="cp-form-half">';
    html += '<label>End Date</label>';
    html += '<input type="date" class="cp-input" data-field="date_end" value="' + esc(c ? c.date_end || '' : '') + '">';
    html += '</div></div>';

    // Budget notes
    html += '<div class="cp-form-group"><label>Budget / Target Notes</label>';
    html += '<textarea class="cp-textarea" data-field="budget_notes" rows="2" placeholder="Budget range, target CPL, etc...">' + esc(c ? c.budget_notes || '' : '') + '</textarea></div>';

    // Dimension targeting — multi-select checkboxes
    var dims = [
      { key: 'persona_ids', label: 'Target Personas', icon: 'users', color: '#9334e9', items: getAllPersonas(), nameKey: 'name', selected: selPersonas },
      { key: 'message_ids', label: 'Messages', icon: 'comments', color: '#1a73e8', items: getAllMessages(), nameKey: 'title', selected: selMessages },
      { key: 'style_ids', label: 'Styles', icon: 'palette', color: '#e37400', items: getAllStyles(), nameKey: 'name', selected: selStyles },
      { key: 'format_ids', label: 'Formats', icon: 'clapperboard', color: '#0891b2', items: getAllFormats(), nameKey: 'name', selected: selFormats }
    ];

    html += '<div style="border-top:1px solid var(--cp-border-light);padding-top:var(--cp-space-3);margin-top:var(--cp-space-3)">';
    html += '<label style="font-weight:600;margin-bottom:var(--cp-space-2);display:block">' + icon('crosshairs') + ' Dimension Targeting</label>';
    html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-3)">Select which dimensions this campaign will use for recipe generation.</p>';

    for (var di = 0; di < dims.length; di++) {
      var dim = dims[di];
      if (dim.items.length === 0) continue;
      html += '<div class="cp-form-group" style="margin-bottom:var(--cp-space-2)">';
      html += '<label style="color:' + dim.color + '">' + icon(dim.icon) + ' ' + esc(dim.label) + '</label>';
      html += '<div class="cp-wizard-dim-list">';
      for (var ii = 0; ii < dim.items.length; ii++) {
        var item = dim.items[ii];
        var isSel = dim.selected.indexOf(item.id) > -1;
        html += '<label class="cp-wizard-dim-chip' + (isSel ? ' cp-wizard-dim-chip-selected' : '') + '" style="' + (isSel ? 'background:' + dim.color + '12;color:' + dim.color + ';border-color:' + dim.color : '') + '">';
        html += '<input type="checkbox" class="cp-camp-dim-check" data-dim="' + dim.key + '" data-id="' + esc(item.id) + '"' + (isSel ? ' checked' : '') + ' style="display:none">';
        html += esc(item[dim.nameKey] || 'Untitled');
        html += '</label>';
      }
      html += '</div></div>';
    }
    html += '</div>';

    // AI Instructions
    html += '<div class="cp-form-group"><label>' + icon('sparkles') + ' Campaign AI Instructions</label>';
    html += '<textarea class="cp-textarea" data-field="ai_instructions" rows="2" placeholder="Special instructions for AI when generating content for this campaign...">' + esc(c ? c.ai_instructions || '' : '') + '</textarea></div>';

    // General notes
    html += '<div class="cp-form-group"><label>Notes</label>';
    html += '<textarea class="cp-textarea" data-field="notes" rows="2" placeholder="Internal notes...">' + esc(c ? c.notes || '' : '') + '</textarea></div>';

    html += '</div>';

    openModal(isEdit ? 'Edit Campaign' : 'New Campaign', html, {
      titleIcon: 'bullhorn',
      size: 'lg',
      saveLabel: isEdit ? 'Save Campaign' : 'Create Campaign',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.name || !fields.name.trim()) { toast('Campaign name is required', 'warning'); return; }

        // Collect dimension selections from checkboxes
        var dimData = { persona_ids: [], message_ids: [], style_ids: [], format_ids: [] };
        $('.cp-camp-dim-check:checked').each(function() {
          var dimKey = $(this).data('dim');
          var itemId = $(this).data('id');
          if (dimData[dimKey] && itemId) dimData[dimKey].push(itemId);
        });

        if (isEdit) {
          saveEntityField('campaign', campId, 'name', fields.name.trim());
          saveEntityField('campaign', campId, 'description', fields.description || '');
          saveEntityField('campaign', campId, 'objective', fields.objective || '');
          snapshot('Edit campaign');
          saveEntityField('campaign', campId, 'funnel_stage', fields.funnel_stage || '');
          saveEntityField('campaign', campId, 'date_start', fields.date_start || '');
          saveEntityField('campaign', campId, 'date_end', fields.date_end || '');
          saveEntityField('campaign', campId, 'status', fields.status || 'planning');
          saveEntityField('campaign', campId, 'budget_notes', fields.budget_notes || '');
          saveEntityField('campaign', campId, 'ai_instructions', fields.ai_instructions || '');
          saveEntityField('campaign', campId, 'notes', fields.notes || '');
          saveEntityField('campaign', campId, 'persona_ids', dimData.persona_ids);
          saveEntityField('campaign', campId, 'message_ids', dimData.message_ids);
          saveEntityField('campaign', campId, 'style_ids', dimData.style_ids);
          saveEntityField('campaign', campId, 'format_ids', dimData.format_ids);
        } else {
          createEntity('campaign', {
            name: fields.name.trim(), description: fields.description || '',
            objective: fields.objective || '', funnel_stage: fields.funnel_stage || '',
            date_start: fields.date_start || '', date_end: fields.date_end || '',
            status: fields.status || 'planning', budget_notes: fields.budget_notes || '',
            ai_instructions: fields.ai_instructions || '', notes: fields.notes || '',
            persona_ids: dimData.persona_ids, message_ids: dimData.message_ids,
            style_ids: dimData.style_ids, format_ids: dimData.format_ids
          });
          snapshot('Create campaign');
        }
        closeModal();
      }
    });
  }

  function confirmDeleteCampaign(campId) {
    var c = getCampaign(campId);
    if (!c) return;
    var recipeCount = (S.data.recipes || []).filter(function(r) { return r.campaign_id === campId; }).length;
    openConfirmDialog({
      title: 'Delete Campaign',
      message: 'Delete "' + c.name + '"?' + (recipeCount > 0 ? ' ' + recipeCount + ' recipe(s) will become ungrouped.' : ''),
      confirmLabel: 'Delete', danger: true,
      onConfirm: function() { snapshot('Delete campaign'); deleteEntity('campaign', campId); }
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
  // Modal for creating/editing an Ad. Stage 1 covers the basics (name,
  // creative type, primary text, headline, description, CTA, link, hook).
  // The fuller pipeline editor (Hook → Copy → Media → Review with rich
  // editors per step) lands in Stage 2.

  function openMetaAdModal(adIdOrAdSetId, opts) {
    opts = opts || {};
    var C = Constants;
    // Two call shapes:
    //   openMetaAdModal('ad_xxx')                     -> edit existing
    //   openMetaAdModal('adset_xxx', { create: true }) -> create under ad set
    var isEdit = !opts.create;
    var ad = isEdit ? getAd(adIdOrAdSetId) : null;
    var adSetId = isEdit ? (ad && ad.ad_set_id) : adIdOrAdSetId;
    var adSet = getAdSet(adSetId);

    if (!adSet) { toast('Parent ad set not found', 'error'); return; }
    var camp = getCampaignV2(adSet.campaign_id);

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
    html += '<div class="cp-form-group"><label>Image brief</label>';
    html += '<textarea class="cp-textarea" data-field="media.image.brief" rows="2" placeholder="What should the image show? Mood, subject, composition...">' + esc(img.brief || '') + '</textarea></div>';
    html += '<div class="cp-form-row"><div class="cp-form-grow"><label>AI image prompt</label>';
    html += '<textarea class="cp-textarea" data-field="media.image.ai_prompt" rows="2" placeholder="Auto-generated or hand-crafted Midjourney / SDXL / Imagen prompt.">' + esc(img.ai_prompt || '') + '</textarea>';
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
              brief: fields['media.image.brief'] || '',
              ai_prompt: fields['media.image.ai_prompt'] || '',
              aspect_ratio: fields['media.image.aspect_ratio'] || '1:1'
            }),
            video: $.extend({}, vid, {
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

/* ===== src/20-part2a/10-campaign-phases-crud.js ===== */
  // ============================================================
  // SECTION 9.4: CAMPAIGN PHASES CRUD
  // ============================================================

  function openCampaignPhasesModal(campId) {
    var camp = getCampaign(campId);
    if (!camp) return;
    var phases = (camp.phases || []).slice();

    function renderPhasesForm() {
      var html = '<div class="cp-editor-form">';
      html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-3)">Define campaign phases (e.g., TOFU Awareness → MOFU Consideration → BOFU Conversion). Each phase can have its own date range.</p>';
      if (phases.length === 0) {
        html += '<div class="cp-empty-state cp-empty-state--compact"><p>No phases yet.</p></div>';
      } else {
        for (var i = 0; i < phases.length; i++) {
          var ph = phases[i];
          html += '<div class="cp-card" style="margin-bottom:var(--cp-space-2);padding:var(--cp-space-3)">';
          html += '<div style="display:flex;align-items:center;gap:var(--cp-space-2);margin-bottom:var(--cp-space-2)">';
          html += '<span class="cp-badge" style="background:var(--cp-primary-subtle);color:var(--cp-primary);font-weight:700">Phase ' + (i + 1) + '</span>';
          html += '<input type="text" class="cp-input cp-phase-field" data-pidx="' + i + '" data-pfield="name" value="' + esc(ph.name || '') + '" placeholder="Phase name..." style="flex:1">';
          html += '<button class="cp-btn-icon cp-btn-xs cp-phase-delete" data-pidx="' + i + '">' + icon('trash') + '</button>';
          html += '</div>';
          html += '<div class="cp-form-row">';
          html += '<div class="cp-form-third"><label class="cp-field-label">Start</label><input type="date" class="cp-input cp-phase-field" data-pidx="' + i + '" data-pfield="date_start" value="' + esc(ph.date_start || '') + '"></div>';
          html += '<div class="cp-form-third"><label class="cp-field-label">End</label><input type="date" class="cp-input cp-phase-field" data-pidx="' + i + '" data-pfield="date_end" value="' + esc(ph.date_end || '') + '"></div>';
          html += '<div class="cp-form-third"><label class="cp-field-label">Focus</label><input type="text" class="cp-input cp-phase-field" data-pidx="' + i + '" data-pfield="funnel_stage" value="' + esc(ph.funnel_stage || '') + '" placeholder="e.g., TOFU"></div>';
          html += '</div></div>';
        }
      }
      html += '<button class="cp-btn cp-btn-outline cp-btn-sm cp-phase-add" style="margin-top:var(--cp-space-2)">' + icon('plus') + ' Add Phase</button>';
      html += '</div>';
      return html;
    }

    openModal('Campaign Phases — ' + camp.name, renderPhasesForm(), {
      titleIcon: 'timeline', size: 'lg',
      saveLabel: 'Save Phases',
      onSave: function() {
        // Collect phase data from fields
        $('.cp-phase-field').each(function() {
          var idx = parseInt($(this).data('pidx'), 10);
          var field = $(this).data('pfield');
          if (phases[idx]) phases[idx][field] = $(this).val() || '';
        });
        snapshot('Update campaign phases');
        saveEntityField('campaign', campId, 'phases', phases);
        closeModal();
        toast('Campaign phases saved', 'success');
      }
    });

    // Live handlers inside modal
    $(document).off('click.cp-phase-add').on('click.cp-phase-add', '.cp-phase-add', function(e) {
      e.preventDefault();
      phases.push({ name: '', date_start: '', date_end: '', funnel_stage: '' });
      $('.cp-modal-body').html(renderPhasesForm());
    });
    $(document).off('click.cp-phase-del').on('click.cp-phase-del', '.cp-phase-delete', function(e) {
      e.preventDefault();
      var idx = parseInt($(this).data('pidx'), 10);
      phases.splice(idx, 1);
      $('.cp-modal-body').html(renderPhasesForm());
    });
  }


/* ===== src/20-part2a/11-setup-wizard.js ===== */
  // ============================================================
  // SECTION 9.4: SETUP WIZARD (First-Run Guided Setup)
  // ============================================================

  // --- State ---
  var setupWizardState = {
    step: 1,
    aiLoading: false,
    stepGenerated: {},   // { 3: true } — AI has been triggered for this step
    stepSkipped: {},     // { 4: true } — user explicitly skipped
    _expandedCards: {},  // { 'persona_2': true } — expanded detail cards
    _ppActiveTab: 0,     // active persona tab on Step 4

    workspace: { name: '', description: '', product_name: '', objective: '',
                 brand_voice: '', target_audience: '', custom_instructions: '' },
    aiConfig: { provider: '', model: '', tested: false },

    personas:    [],  // [{ name, description, demographics:{}, psychographics:{}, _selected }]
    pain_points: [],  // [{ pain_point, solution, category, _persona_idx, _selected }]
    messages:    [],  // [{ title, body, theme, funnel_stages:[], hooks:[], _selected }]
    styles:      [],  // [{ name, description, _selected }]
    formats:     [],  // [{ name, description, category, _selected }]

    campaign: { name: '', objective: '', date_start: '', date_end: '',
                budget_notes: '', ai_instructions: '', default_media_type: 'image', default_priority: 'normal' },
    combos: [],         // [{ p_idx, m_idx, s_idx, f_idx, title, selected }]

    created: { personaIds: [], painPointIds: [], messageIds: [],
               styleIds: [], formatIds: [], campaignId: '', recipeIds: [] },
    finalizing: false
  };

  var SW_STEPS = [
    { num: 1, label: 'Workspace',       sublabel: 'Brand & product',      phase: 'a', icon: 'building' },
    { num: 2, label: 'AI Setup',        sublabel: 'Configure provider',   phase: 'a', icon: 'robot' },
    { num: 3, label: 'Personas',        sublabel: 'Target audiences',     phase: 'b', icon: 'users' },
    { num: 4, label: 'Pain Points',     sublabel: 'Audience challenges',  phase: 'b', icon: 'bolt' },
    { num: 5, label: 'Messages',        sublabel: 'Ad angles & hooks',    phase: 'b', icon: 'comment-dots' },
    { num: 6, label: 'Styles & Formats', sublabel: 'Creative approach',   phase: 'b', icon: 'palette' },
    { num: 7, label: 'First Campaign',  sublabel: 'Campaign + recipes',   phase: 'c', icon: 'bullseye' },
    { num: 8, label: 'Review',          sublabel: 'Launch your planner',  phase: 'c', icon: 'rocket' }
  ];

  var SW_PHASE_LABELS = { a: 'Phase A — Foundation', b: 'Phase B — Library', c: 'Phase C — Campaign' };

  // --- State persistence (session storage) ---
  function swSaveSession() {
    try { sessionStorage.setItem('cp_sw_state', JSON.stringify(setupWizardState)); } catch(e) {}
  }
  function swLoadSession() {
    try {
      var saved = sessionStorage.getItem('cp_sw_state');
      if (saved) { var parsed = JSON.parse(saved); if (parsed && parsed.step) return parsed; }
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

  // --- Collect all data-sw-field inputs from current step ---
  function swCollectFields() {
    $('.cp-sw-content-inner [data-sw-field]').each(function() {
      var path = $(this).data('sw-field');
      if (!path) return;
      var val = $(this).is(':checkbox') ? $(this).is(':checked') : $(this).val();
      swSetPath(path, val || '');
    });
    // Step 2: capture AI picker provider/model (rendered by LLMService, no data-sw-field)
    if (setupWizardState.step === 2) {
      var $prov = $('.cp-ai-provider-select[data-action-id="sw-ai-config"]');
      var $mod  = $('.cp-ai-model-select[data-action-id="sw-ai-config"]');
      if ($prov.length) setupWizardState.aiConfig.provider = $prov.val();
      if ($mod.length)  setupWizardState.aiConfig.model    = $mod.val();
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
          message: 'You have an incomplete setup from a previous session (Step ' + saved.step + ' of 8). Would you like to continue where you left off?',
          confirmLabel: 'Resume',
          cancelLabel: 'Start Over',
          onConfirm: function() { setupWizardState = saved; _renderSetupWizardDOM(); },
          onCancel:  function() { swClearSession(); _initFreshWizard(); }
        });
        return;
      }
    }
    _initFreshWizard();
  }

  function _initFreshWizard() {
    setupWizardState = {
      step: 1, aiLoading: false, stepGenerated: {}, stepSkipped: {},
      _expandedCards: {}, _ppActiveTab: 0,
      workspace: { name: '', description: '', product_name: '', objective: '',
                   brand_voice: '', target_audience: '', custom_instructions: '' },
      aiConfig: { provider: '', model: '', tested: false },
      personas: [], pain_points: [], messages: [], styles: [], formats: [],
      campaign: { name: '', objective: '', date_start: '', date_end: '',
                  budget_notes: '', ai_instructions: '',
                  default_media_type: 'image', default_priority: 'normal' },
      combos: [],
      created: { personaIds: [], painPointIds: [], messageIds: [],
                 styleIds: [], formatIds: [], campaignId: '', recipeIds: [] },
      finalizing: false
    };
    _renderSetupWizardDOM();
  }

  function _renderSetupWizardDOM() {
    // Remove any existing wizard overlay
    $('.cp-setup-wizard').remove();
    // Build and append overlay to #cpApp with ARIA dialog role
    var $wizard = $('<div class="cp-setup-wizard" id="cpSetupWizard" role="dialog" aria-modal="true" aria-label="Campaign Planner Setup Wizard"></div>');
    $('#cpApp').append($wizard);
    renderSetupWizard();
  }

  // --- Main render (full wizard shell) ---
  function renderSetupWizard() {
    var html = _buildSWProgressBar();
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
    // Focus first focusable element in new step
    setTimeout(function() {
      var $first = $('#cpSetupWizard .cp-sw-content-inner input:not([type=hidden]), #cpSetupWizard .cp-sw-content-inner textarea, #cpSetupWizard .cp-sw-content-inner select');
      if ($first.length) $first.first().focus();
    }, 50);
  }

  // --- Build: top progress bar ---
  function _buildSWProgressBar() {
    return '<div class="cp-sw-progress-bar"><div class="cp-sw-progress-fill" style="width:' + _swProgressPct() + '%"></div></div>';
  }
  function _swProgressPct() {
    return Math.round(((setupWizardState.step - 1) / 8) * 100);
  }

  // --- Build: left rail ---
  function _buildSWRail() {
    var html = '<div class="cp-sw-rail">';
    html += '<div class="cp-sw-rail-header">';
    html += '<div class="cp-sw-rail-logo">Campaign<span class="cp-sw-rail-logo-accent">Planner</span></div>';
    html += '<div class="cp-sw-rail-subtitle">Setup Wizard</div>';
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
    // Count map: how many items are selected per step (for done badge)
    var stepCounts = {
      3: (ws.personas    || []).filter(function(p) { return p._selected; }).length,
      4: (ws.pain_points || []).filter(function(p) { return p._selected; }).length,
      5: (ws.messages    || []).filter(function(m) { return m._selected; }).length,
      6: (ws.styles      || []).filter(function(s) { return s._selected; }).length +
         (ws.formats     || []).filter(function(f) { return f._selected; }).length,
      7: (ws.combos      || []).filter(function(c) { return c.selected; }).length
    };
    var html = '';
    var lastPhase = '';
    for (var i = 0; i < SW_STEPS.length; i++) {
      var st = SW_STEPS[i];
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
      if (i < SW_STEPS.length - 1) {
        html += '<div class="cp-sw-step-connector' + (isDone ? ' cp-sw-step-connector--done' : '') + '"></div>';
      }
      html += '</div>';

      html += '<div class="cp-sw-step-text">';
      html += '<div class="cp-sw-step-label">' + esc(st.label);
      // Selection count badge for done steps with counted items
      if (isDone && stepCounts[st.num] > 0) {
        html += '<span class="cp-sw-step-badge">' + stepCounts[st.num] + '</span>';
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

  // --- Step content router ---
  function _buildSWStepContent() {
    var n = setupWizardState.step;
    // Delegate to registered step renderers (added in later phases)
    if (typeof renderSWStep1 === 'function' && n === 1) return renderSWStep1();
    if (typeof renderSWStep2 === 'function' && n === 2) return renderSWStep2();
    if (typeof renderSWStep3 === 'function' && n === 3) return renderSWStep3();
    if (typeof renderSWStep4 === 'function' && n === 4) return renderSWStep4();
    if (typeof renderSWStep5 === 'function' && n === 5) return renderSWStep5();
    if (typeof renderSWStep6 === 'function' && n === 6) return renderSWStep6();
    if (typeof renderSWStep7 === 'function' && n === 7) return renderSWStep7();
    if (typeof renderSWStep8 === 'function' && n === 8) return renderSWStep8();
    return _buildSWStepPlaceholder(n);
  }

  function _buildSWStepPlaceholder(n) {
    var st = SW_STEPS[n - 1] || {};
    var phaseKey = st.phase || 'a';
    var html = _buildSWStepHeader(st.label || 'Step ' + n, 'This step is coming soon.', phaseKey);
    html += '<div class="cp-sw-placeholder-body">';
    html += '<div class="cp-sw-placeholder-icon">' + icon(st.icon || 'circle') + '</div>';
    html += '<p>' + esc('Step ' + n + ': ' + (st.label || '')) + ' — content will be added in a later phase.</p>';
    html += '</div>';
    return html;
  }

  // --- Reusable step header builder ---
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
    var isLast  = n === 8;
    var html = '';

    // Left: Back button
    html += '<div class="cp-sw-footer-left">';
    if (!isFirst) {
      html += '<button class="cp-btn cp-btn-outline" data-action="sw-back">' + icon('arrow-left') + ' Back</button>';
    } else {
      html += '<span></span>';
    }
    html += '</div>';

    // Center: step counter + skip link
    html += '<div class="cp-sw-footer-center">';
    html += '<div class="cp-sw-step-counter">Step ' + n + ' of 8</div>';
    if (!isFirst && !isLast && n !== 1) {
      html += '<button class="cp-sw-skip-link" data-action="sw-skip">Skip this step</button>';
    }
    html += '</div>';

    // Right: Next / Launch button
    html += '<div class="cp-sw-footer-right">';
    if (!isLast) {
      html += '<button class="cp-btn cp-btn-primary" data-action="sw-next">Next ' + icon('arrow-right') + '</button>';
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
    }
    if (n === 3) {
      if (ws.personas.filter(function(p) { return p._selected; }).length === 0) {
        return { valid: false, message: 'Please select at least one persona to continue.' };
      }
    }
    if (n === 5) {
      if (ws.messages.filter(function(m) { return m._selected; }).length === 0) {
        return { valid: false, message: 'Please select at least one message to continue.' };
      }
    }
    if (n === 6) {
      var noStyle  = ws.styles.filter(function(s) { return s._selected; }).length === 0;
      var noFormat = ws.formats.filter(function(f) { return f._selected; }).length === 0;
      if (noStyle || noFormat) {
        return { valid: false, message: 'Please select at least one style and one format to continue.' };
      }
    }
    if (n === 7) {
      if (!ws.campaign.name.trim()) return { valid: false, message: 'Please enter a campaign name.' };
      if (ws.combos.filter(function(c) { return c.selected; }).length === 0) {
        return { valid: false, message: 'Please select at least one recipe combination.' };
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

  // --- Navigation ---
  function swGoNext() {
    swCollectFields();
    var n = setupWizardState.step;
    var v = validateSWStep(n);
    if (!v.valid) { _showSWValidation(v.message); return; }
    if (n < 8) {
      setupWizardState.step = n + 1;
      refreshSetupWizard();
      // Trigger AI auto-generation for the new step if applicable
      _swAutoTriggerAI(setupWizardState.step);
    }
  }

  function swGoBack() {
    swCollectFields();
    if (setupWizardState.step > 1) {
      setupWizardState.step--;
      refreshSetupWizard();
    }
  }

  function swSkipStep() {
    var n = setupWizardState.step;
    setupWizardState.stepSkipped[n] = true;
    if (n < 8) {
      setupWizardState.step = n + 1;
      refreshSetupWizard();
      _swAutoTriggerAI(setupWizardState.step);
    }
  }

  function swGotoStep(n) {
    // Only allow navigating to already-completed steps
    if (n < setupWizardState.step) {
      swCollectFields();
      setupWizardState.step = n;
      refreshSetupWizard();
    }
  }

  // --- Auto-trigger AI for steps that support it ---
  function _swAutoTriggerAI(n) {
    var R   = window._cpRenderers || {};
    var cfg = setupWizardState.aiConfig;
    // Always persist the wizard AI picker selection first so Part 2B resolves it correctly
    if (cfg.provider && cfg.model && window._cpPart2B && window._cpPart2B.LLMService) {
      window._cpPart2B.LLMService.savePreference('sw-ai-config', cfg.provider, cfg.model);
    }
    // Step 7: auto-generate combos algorithmically (no AI — always refresh on entry)
    if (n === 7) { _swAutoGenerateCombos(); return; }
    // All other AI steps: only generate once per wizard session
    if (setupWizardState.stepGenerated[n]) return;
    if (n === 3 && typeof R.swAIGeneratePersonas === 'function')       R.swAIGeneratePersonas();
    if (n === 4 && typeof R.swAIGeneratePainPoints === 'function')     R.swAIGeneratePainPoints();
    if (n === 5 && typeof R.swAIGenerateMessages === 'function')       R.swAIGenerateMessages();
    if (n === 6 && typeof R.swAIGenerateStylesFormats === 'function')  R.swAIGenerateStylesFormats();
  }

  // --- Algorithmically generate recipe combos for Step 7 (no AI) ---
  function _swAutoGenerateCombos() {
    var state = setupWizardState;
    // Auto-fill campaign name from product name if still blank
    if (!state.campaign.name && state.workspace.product_name) {
      state.campaign.name = state.workspace.product_name + ' Campaign';
    }
    var selPersonas = (state.personas   || []).filter(function(p) { return p._selected; });
    var selMessages = (state.messages   || []).filter(function(m) { return m._selected; });
    var selStyles   = (state.styles     || []).filter(function(s) { return s._selected; });
    var selFormats  = (state.formats    || []).filter(function(f) { return f._selected; });

    if (!selPersonas.length && !selMessages.length) {
      state.combos = [];
      refreshSetupWizard();
      return;
    }

    var personasToUse = selPersonas.length ? selPersonas : [null];
    var messagesToUse = selMessages.length ? selMessages : [null];
    var stylesToUse   = selStyles.length   ? selStyles   : [null];
    var formatsToUse  = selFormats.length  ? selFormats  : [null];

    var combos    = [];
    var styleIdx  = 0;
    var formatIdx = 0;

    outer:
    for (var pi = 0; pi < personasToUse.length; pi++) {
      var msgSlice = messagesToUse.slice(0, 2); // up to 2 messages per persona
      for (var mi = 0; mi < msgSlice.length; mi++) {
        combos.push({
          persona:  personasToUse[pi],
          message:  msgSlice[mi],
          style:    stylesToUse[styleIdx  % stylesToUse.length],
          format:   formatsToUse[formatIdx % formatsToUse.length],
          selected: true
        });
        styleIdx++;
        formatIdx++;
        if (combos.length >= 8) break outer;
      }
    }

    state.combos = combos;
    refreshSetupWizard();
  }


/* ===== src/20-part2a/12-setup-wizard-steps-1-2.js ===== */
  // ------------------------------------------------------------------
  // SECTION 9.4a: SETUP WIZARD — STEP RENDERERS (Phase 2: Steps 1 & 2)
  // ------------------------------------------------------------------

  function renderSWStep1() {
    var ws  = setupWizardState.workspace;
    var objectives = Constants.CAMPAIGN_OBJECTIVES || [];

    var html = _buildSWStepHeader(
      'Workspace Setup',
      'Tell us about your brand and what you\'re advertising. This context shapes every AI output throughout the wizard.',
      'a'
    );

    html += '<div class="cp-sw-form">';

    // Workspace Name
    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Workspace Name <span class="cp-required">*</span></label>';
    html += '<input type="text" class="cp-input" data-sw-field="workspace.name"';
    html += ' placeholder="e.g., Brand Q2 2026 Campaigns" value="' + esc(ws.name || '') + '" autocomplete="off">';
    html += '<p class="cp-field-hint">Names your Campaign Planner workspace — visible in the header.</p>';
    html += '</div>';

    // Product / Service
    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Product / Service <span class="cp-required">*</span></label>';
    html += '<input type="text" class="cp-input" data-sw-field="workspace.product_name"';
    html += ' placeholder="What are you advertising?" value="' + esc(ws.product_name || '') + '" autocomplete="off">';
    html += '<p class="cp-field-hint">Be specific — e.g., "SaaS project management tool for remote teams".</p>';
    html += '</div>';

    // Primary Objective
    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Primary Campaign Objective</label>';
    html += '<select class="cp-select" data-sw-field="workspace.objective">';
    html += '<option value="">Select objective...</option>';
    for (var i = 0; i < objectives.length; i++) {
      var obj = objectives[i];
      html += '<option value="' + esc(obj.id) + '"' + (ws.objective === obj.id ? ' selected' : '') + '>' + esc(obj.name) + '</option>';
    }
    html += '</select>';
    html += '</div>';

    // Product Description & Brand Voice
    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Product Description &amp; Brand Voice</label>';
    html += '<textarea class="cp-textarea" data-sw-field="workspace.description" rows="3"';
    html += ' placeholder="Describe what makes your product unique, your brand tone, key differentiators...">' + esc(ws.description || '') + '</textarea>';
    html += '<p class="cp-field-hint">The more detail here, the better your AI-generated personas, messages, and hooks will be.</p>';
    html += '</div>';

    // Target Audience Overview
    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Target Audience Overview</label>';
    html += '<textarea class="cp-textarea" data-sw-field="workspace.target_audience" rows="2"';
    html += ' placeholder="Who are your ideal customers? e.g., small business owners aged 30–50 in the US...">' + esc(ws.target_audience || '') + '</textarea>';
    html += '</div>';

    // Custom AI Instructions
    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Custom AI Instructions</label>';
    html += '<textarea class="cp-textarea" data-sw-field="workspace.custom_instructions" rows="2"';
    html += ' placeholder="Any rules for AI: tone, things to avoid, mandatory phrases...">' + esc(ws.custom_instructions || '') + '</textarea>';
    html += '</div>';

    // Brand context callout
    if (S.brand && S.brand.configured) {
      var brandName = (S.brand.identity && S.brand.identity.name) || 'Your brand';
      html += '<div class="cp-sw-info-box cp-sw-info-box--success">';
      html += icon('link') + ' <strong>Brand context connected</strong> — ' + esc(brandName) + ' data will be automatically injected into all AI prompts.';
      html += '</div>';
    } else {
      html += '<div class="cp-sw-info-box">';
      html += icon('info') + ' No brand profile connected. AI will use the information you enter above.';
      html += '</div>';
    }

    html += '</div>'; // .cp-sw-form
    return html;
  }

  function renderSWStep2() {
    var cfg   = setupWizardState.aiConfig;
    var p2b   = window._cpPart2B;
    var aiOk  = p2b && p2b.LLMService && p2b.LLMService.isConfigured();

    var html = _buildSWStepHeader(
      'AI Configuration',
      'Select the AI provider and model that will power all generation steps. API keys are managed in your Drupal LLM settings.',
      'a'
    );

    if (!aiOk) {
      html += '<div class="cp-sw-info-box cp-sw-info-box--warn">';
      html += icon('triangle-alert') + ' <div><strong>No AI providers configured.</strong> ';
      html += 'AI generation requires API keys set up in your Drupal LLM settings. ';
      html += 'You can continue through the wizard and fill in content manually.</div>';
      html += '</div>';
      html += '<p class="cp-sw-ai-skip-note">Skip this step to continue without AI assistance. You can configure AI in Settings &rarr; AI at any time.</p>';
      return html;
    }

    html += '<div class="cp-sw-form">';

    // Provider + model picker
    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">AI Provider &amp; Model</label>';
    html += '<div class="cp-sw-ai-picker-wrap" id="swAiPickerWrap">';
    html += window._cpAiSel('sw-ai-config');
    html += '</div>';
    html += '<p class="cp-field-hint">This selection will be used for all AI generation steps in this wizard.</p>';
    html += '</div>';

    // Test connection row
    html += '<div class="cp-sw-ai-test-row">';
    html += '<button class="cp-btn cp-btn-secondary" data-action="sw-test-ai" id="swTestAiBtn">' + icon('zap') + ' Test Connection</button>';
    html += '<span class="cp-sw-ai-test-status" id="swAiTestStatus">';
    if (cfg.tested === true) {
      html += '<span class="cp-sw-test-ok">' + icon('circle-check') + ' Connection verified</span>';
    } else if (cfg.tested === 'fail') {
      html += '<span class="cp-sw-test-fail">' + icon('circle-x') + ' Test failed — check your API key</span>';
    } else {
      html += '<span class="cp-sw-test-idle">Not tested yet &mdash; you can still continue</span>';
    }
    html += '</span>';
    html += '</div>';

    html += '<div class="cp-sw-info-box" style="margin-top:var(--cp-space-2)">';
    html += icon('info') + ' Skipping the test is fine — the wizard will let you know if AI calls fail during generation.';
    html += '</div>';

    html += '</div>'; // .cp-sw-form
    return html;
  }

  // Inline AI connection test for the wizard Step 2
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
        $btn.prop('disabled', false).html(icon('zap') + ' Test Connection');
        setupWizardState.aiConfig.tested = true;
        $status.html('<span class="cp-sw-test-ok">' + icon('circle-check') + ' Connection verified</span>');
      },
      function(err) {
        $btn.prop('disabled', false).html(icon('zap') + ' Test Connection');
        setupWizardState.aiConfig.tested = 'fail';
        $status.html('<span class="cp-sw-test-fail">' + icon('circle-x') + ' Test failed — ' + esc(String(err).substring(0, 80)) + '</span>');
      },
      'sw-ai-config'
    );
  }


/* ===== src/20-part2a/13-setup-wizard-steps-3-4.js ===== */
  // ------------------------------------------------------------------
  // SECTION 9.4b: SETUP WIZARD — STEP RENDERERS (Phase 3: Steps 3 & 4)
  // ------------------------------------------------------------------

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

  // --- Step 3: Personas ---

  function renderSWStep3() {
    var ws       = setupWizardState;
    var personas = ws.personas || [];
    var generated = ws.stepGenerated[3];

    var html = _buildSWStepHeader(
      'Target Personas',
      'Select the audience personas that best represent your ideal customers. AI will generate options based on your workspace setup.',
      'b'
    );

    // Generation bar
    html += '<div class="cp-sw-gen-bar">';
    html += '<textarea class="cp-textarea" id="swPersonaContext" rows="2"';
    html += ' placeholder="Optional: additional context for persona generation (e.g., focus on enterprise buyers, include a tech-savvy segment)...">';
    html += esc(ws._personaContext || '');
    html += '</textarea>';
    html += '<button class="cp-btn cp-btn-ai" data-action="sw-ai-gen-personas"' + (ws.aiLoading ? ' disabled' : '') + '>';
    html += icon('sparkles') + ' ' + (generated ? 'Regenerate' : 'Generate with AI');
    html += '</button>';
    html += '</div>';

    if (ws.aiLoading) {
      html += _buildSWSkeletonCards(4);
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
      html += '</div>';
      html += '<div class="cp-sw-card-grid">';
      for (var i = 0; i < personas.length; i++) {
        html += _buildSWPersonaCard(personas[i], i);
      }
      html += '</div>';
    }

    return html;
  }

  function _buildSWPersonaCard(p, idx) {
    var selected = p._selected;
    var expanded = setupWizardState._expandedCards['p_' + idx];
    var demo  = p.demographics  || {};
    var psych = p.psychographics || {};

    var tags = [];
    if (demo.age_range)  tags.push(demo.age_range);
    if (demo.location)   tags.push(demo.location);
    if (demo.occupation) tags.push(demo.occupation);

    var html = '<div class="cp-sw-sel-card' + (selected ? ' cp-sw-sel-card--selected' : '') + '" data-idx="' + idx + '" role="button" tabindex="0" aria-pressed="' + (selected ? 'true' : 'false') + '">';
    html += '<div class="cp-sw-sel-card-check">' + (selected ? icon('check') : '') + '</div>';
    html += '<div class="cp-sw-sel-card-title">' + esc(p.name || ('Persona ' + (idx + 1))) + '</div>';
    if (p.description) {
      html += '<div class="cp-sw-sel-card-body">' + esc(truncate(p.description, 110)) + '</div>';
    }
    if (tags.length) {
      html += '<div class="cp-sw-sel-card-tags">';
      for (var t = 0; t < tags.length; t++) {
        html += '<span class="cp-sw-sel-card-tag">' + esc(tags[t]) + '</span>';
      }
      html += '</div>';
    }
    html += '<button class="cp-sw-sel-card-expand" data-action="sw-card-expand" data-key="p_' + idx + '">';
    html += icon(expanded ? 'chevron-up' : 'chevron-down') + ' ' + (expanded ? 'Less' : 'Details');
    html += '</button>';

    if (expanded) {
      html += '<div class="cp-sw-sel-card-expanded-body">';
      html += '<div class="cp-sw-sel-card-detail-grid">';
      if (demo.gender)       html += _swDetailCell('Gender',     demo.gender);
      if (demo.income_level) html += _swDetailCell('Income',     demo.income_level);
      if (demo.education)    html += _swDetailCell('Education',  demo.education);
      if (demo.industry)     html += _swDetailCell('Industry',   demo.industry);
      if (psych.desires)     html += _swDetailCell('Desires',    psych.desires);
      if (psych.fears)       html += _swDetailCell('Fears',      psych.fears);
      if (psych.motivations) html += _swDetailCell('Motivations',psych.motivations);
      if (psych.values)      html += _swDetailCell('Values',     psych.values);
      html += '</div>';
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  // --- Step 4: Pain Points ---

  function renderSWStep4() {
    var ws        = setupWizardState;
    var pps       = ws.pain_points || [];
    var selPersonas = (ws.personas || []).filter(function(p) { return p._selected; });
    var generated = ws.stepGenerated[4];

    var html = _buildSWStepHeader(
      'Pain Points',
      'Select the key challenges your personas face. These directly shape your ad messages, hooks, and copy.',
      'b'
    );

    if (!selPersonas.length) {
      html += '<div class="cp-sw-empty-state cp-sw-empty-state--warn">';
      html += icon('triangle-alert') + ' No personas selected from Step 3. Go back and select at least one persona.';
      html += '</div>';
      return html;
    }

    // Generation bar
    html += '<div class="cp-sw-gen-bar">';
    html += '<textarea class="cp-textarea" id="swPainPointContext" rows="2"';
    html += ' placeholder="Optional: focus on specific challenges or industries (e.g., focus on time management struggles)...">';
    html += esc(ws._ppContext || '');
    html += '</textarea>';
    html += '<button class="cp-btn cp-btn-ai" data-action="sw-ai-gen-painpoints"' + (ws.aiLoading ? ' disabled' : '') + '>';
    html += icon('sparkles') + ' ' + (generated ? 'Regenerate' : 'Generate with AI');
    html += '</button>';
    html += '</div>';

    if (ws.aiLoading) {
      html += _buildSWSkeletonCards(6);
    } else if (!pps.length) {
      html += '<div class="cp-sw-empty-state">';
      html += '<div class="cp-sw-empty-icon">' + icon('crosshair') + '</div>';
      html += '<p>Click <strong>Generate with AI</strong> to create pain point suggestions based on your selected personas.</p>';
      html += '</div>';
    } else {
      // Persona tab bar (only when 2+ personas selected)
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

      // Filter to active persona tab (or show all if single persona)
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
      html += '</div>';

      html += '<div class="cp-sw-card-grid">';
      for (var j = 0; j < visiblePPs.length; j++) {
        html += _buildSWPainPointCard(visiblePPs[j].pp, visiblePPs[j].i);
      }
      html += '</div>';
    }

    return html;
  }

  function _buildSWPainPointCard(pp, idx) {
    var selected = pp._selected;
    var expanded = setupWizardState._expandedCards['pp_' + idx];

    var html = '<div class="cp-sw-sel-card' + (selected ? ' cp-sw-sel-card--selected' : '') + '" data-idx="' + idx + '" role="button" tabindex="0" aria-pressed="' + (selected ? 'true' : 'false') + '">';
    html += '<div class="cp-sw-sel-card-check">' + (selected ? icon('check') : '') + '</div>';
    html += '<div class="cp-sw-sel-card-title">' + esc(truncate(pp.pain_point || 'Pain Point', 90)) + '</div>';
    if (pp.category) {
      html += '<div class="cp-sw-sel-card-tags"><span class="cp-sw-sel-card-tag">' + esc(pp.category) + '</span></div>';
    }
    if (pp.solution) {
      html += '<button class="cp-sw-sel-card-expand" data-action="sw-card-expand" data-key="pp_' + idx + '">';
      html += icon(expanded ? 'chevron-up' : 'chevron-down') + ' ' + (expanded ? 'Hide solution' : 'View solution');
      html += '</button>';
      if (expanded) {
        html += '<div class="cp-sw-sel-card-expanded-body">';
        html += '<div class="cp-sw-sel-card-detail-label">Solution / Product angle</div>';
        html += '<div class="cp-sw-sel-card-detail-value">' + esc(pp.solution) + '</div>';
        html += '</div>';
      }
    }
    html += '</div>';
    return html;
  }


/* ===== src/20-part2a/14-setup-wizard-steps-5-6.js ===== */
  // ------------------------------------------------------------------
  // SECTION 9.4c: SETUP WIZARD — STEP RENDERERS (Phase 4: Steps 5 & 6)
  // ------------------------------------------------------------------

  // --- Step 5: Messages ---

  function renderSWStep5() {
    var ws       = setupWizardState;
    var messages = ws.messages || [];
    var generated = ws.stepGenerated[5];

    var html = _buildSWStepHeader(
      'Ad Messages',
      'Select the message angles and hooks that will shape your ads. AI generates options based on your personas and pain points.',
      'b'
    );

    // Generation bar
    html += '<div class="cp-sw-gen-bar">';
    html += '<textarea class="cp-textarea" id="swMessageContext" rows="2"';
    html += ' placeholder="Optional: focus on specific angles (e.g., emphasise ROI, use testimonial hooks)...">';
    html += esc(ws._messageContext || '');
    html += '</textarea>';
    html += '<button class="cp-btn cp-btn-ai" data-action="sw-ai-gen-messages"' + (ws.aiLoading ? ' disabled' : '') + '>';
    html += icon('sparkles') + ' ' + (generated ? 'Regenerate' : 'Generate with AI');
    html += '</button>';
    html += '</div>';

    if (ws.aiLoading) {
      html += _buildSWSkeletonCards(4);
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

    var html = '<div class="cp-sw-sel-card' + (selected ? ' cp-sw-sel-card--selected' : '') + '" data-idx="' + idx + '" role="button" tabindex="0" aria-pressed="' + (selected ? 'true' : 'false') + '">';
    html += '<div class="cp-sw-sel-card-check">' + (selected ? icon('check') : '') + '</div>';
    html += '<div class="cp-sw-sel-card-title">' + esc(msg.name || ('Message ' + (idx + 1))) + '</div>';
    if (msg.description) {
      html += '<div class="cp-sw-sel-card-body">' + esc(truncate(msg.description, 100)) + '</div>';
    }
    var tags = [];
    if (msg.theme)      tags.push(msg.theme);
    if (msg.hook_type)  tags.push(msg.hook_type);
    if (stageLabel)     tags.push(stageLabel);
    if (tags.length) {
      html += '<div class="cp-sw-sel-card-tags">';
      for (var t = 0; t < tags.length; t++) {
        html += '<span class="cp-sw-sel-card-tag">' + esc(tags[t]) + '</span>';
      }
      html += '</div>';
    }
    if (msg.body) {
      html += '<button class="cp-sw-sel-card-expand" data-action="sw-card-expand" data-key="m_' + idx + '">';
      html += icon(expanded ? 'chevron-up' : 'chevron-down') + ' ' + (expanded ? 'Hide copy' : 'View copy angle');
      html += '</button>';
      if (expanded) {
        html += '<div class="cp-sw-sel-card-expanded-body">';
        html += '<div class="cp-sw-sel-card-detail-label">Copy angle</div>';
        html += '<div class="cp-sw-sel-card-detail-value" style="white-space:pre-line">' + esc(msg.body) + '</div>';
        html += '</div>';
      }
    }
    html += '</div>';
    return html;
  }

  // --- Step 6: Styles & Formats ---

  function renderSWStep6() {
    var ws       = setupWizardState;
    var styles   = ws.styles  || [];
    var formats  = ws.formats || [];
    var generated = ws.stepGenerated[6];
    var bothEmpty = !styles.length && !formats.length;

    var html = _buildSWStepHeader(
      'Styles &amp; Formats',
      'Select the creative styles and ad formats that fit your brand. These define how your ads will look and where they\'ll run.',
      'b'
    );

    // Single generation bar for both styles and formats
    html += '<div class="cp-sw-gen-bar">';
    html += '<textarea class="cp-textarea" id="swStyleFormatContext" rows="2"';
    html += ' placeholder="Optional: specify platforms, formats or style direction (e.g., focus on TikTok-native, minimalist aesthetic)...">';
    html += esc(ws._styleFormatContext || '');
    html += '</textarea>';
    html += '<button class="cp-btn cp-btn-ai" data-action="sw-ai-gen-styles-formats"' + (ws.aiLoading ? ' disabled' : '') + '>';
    html += icon('sparkles') + ' ' + (generated ? 'Regenerate All' : 'Generate with AI');
    html += '</button>';
    html += '</div>';

    if (ws.aiLoading) {
      // Loading — show skeleton for both sections
      html += _buildSWSubSection('Styles', 0, 0);
      html += _buildSWSkeletonCards(3);
      html += _buildSWSubSection('Formats', 0, 0);
      html += _buildSWSkeletonCards(4);
    } else if (bothEmpty && !generated) {
      html += '<div class="cp-sw-empty-state">';
      html += '<div class="cp-sw-empty-icon">' + icon('palette') + '</div>';
      html += '<p>Click <strong>Generate with AI</strong> to create creative style and ad format suggestions tailored to your product and objectives.</p>';
      html += '</div>';
    } else {
      // Styles section
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

      // Formats section
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
  // SECTION 9.4d: SETUP WIZARD — STEP RENDERERS (Phase 5: Steps 7 & 8)
  // ------------------------------------------------------------------

  // --- Step 7: Campaign Setup + Recipe Combos ---

  function renderSWStep7() {
    var ws     = setupWizardState;
    var cam    = ws.campaign || {};
    var combos = ws.combos   || [];

    var html = _buildSWStepHeader(
      'Campaign Setup',
      'Name your campaign, set dates, and choose which persona-message-style combinations to build as ad recipes.',
      'c'
    );

    // --- Campaign form ---
    html += '<div class="cp-sw-form">';

    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Campaign Name <span class="cp-required">*</span></label>';
    html += '<input type="text" class="cp-input" data-sw-field="campaign.name"';
    html += ' placeholder="e.g., Q3 Growth Campaign" value="' + esc(cam.name || '') + '" autocomplete="off">';
    html += '</div>';

    html += '<div class="cp-sw-field-row">';
    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Start Date</label>';
    html += '<input type="date" class="cp-input" data-sw-field="campaign.date_start"';
    html += ' value="' + esc(cam.date_start || '') + '">';
    html += '</div>';
    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">End Date</label>';
    html += '<input type="date" class="cp-input" data-sw-field="campaign.date_end"';
    html += ' value="' + esc(cam.date_end || '') + '">';
    html += '</div>';
    html += '</div>';

    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Budget Notes</label>';
    html += '<input type="text" class="cp-input" data-sw-field="campaign.budget_notes"';
    html += ' placeholder="e.g., $5,000/month" value="' + esc(cam.budget_notes || '') + '">';
    html += '</div>';

    html += '</div>'; // end .cp-sw-form

    // --- Recipe combos section ---
    var selCount = combos.filter(function(c) { return c.selected; }).length;

    html += _buildSWSubSection('Ad Recipe Combinations', selCount, combos.length);

    if (!combos.length) {
      html += '<div class="cp-sw-empty-state">';
      html += '<div class="cp-sw-empty-icon">' + icon('shuffle') + '</div>';
      html += '<p>No combinations could be generated. Go back to earlier steps and select at least one persona and one message.</p>';
      html += '</div>';
    } else {
      html += '<div class="cp-sw-card-bottom">';
      html += '<span class="cp-sw-sel-count' + (selCount > 0 ? ' cp-sw-sel-count--ok' : '') + '">';
      html += selCount + ' of ' + combos.length + ' combo' + (combos.length !== 1 ? 's' : '') + ' selected';
      html += '</span>';
      html += '<button class="cp-btn cp-btn-sm cp-btn-outline" data-action="sw-regen-combos">';
      html += icon('refresh-cw') + ' Regenerate';
      html += '</button>';
      html += '</div>';

      html += '<div class="cp-sw-card-grid">';
      for (var i = 0; i < combos.length; i++) {
        html += _buildSWComboCard(combos[i], i);
      }
      html += '</div>';
    }

    return html;
  }

  function _buildSWComboCard(combo, idx) {
    var selected = combo.selected;
    var html = '<div class="cp-sw-combo-card' + (selected ? ' cp-sw-combo-card--selected' : '') + '" data-action="sw-combo-toggle" data-idx="' + idx + '" role="button" tabindex="0" aria-pressed="' + (selected ? 'true' : 'false') + '">';
    html += '<div class="cp-sw-combo-card-header">';
    html += '<div class="cp-sw-combo-card-check">' + (selected ? icon('check') : '') + '</div>';
    html += '<div class="cp-sw-combo-card-title">Recipe ' + (idx + 1) + '</div>';
    html += '</div>';
    html += '<div class="cp-sw-combo-parts">';
    if (combo.persona) html += _swComboPart('Persona', combo.persona.name  || 'Persona');
    if (combo.message) html += _swComboPart('Message', combo.message.name  || 'Message');
    if (combo.style)   html += _swComboPart('Style',   combo.style.name    || 'Style');
    if (combo.format)  html += _swComboPart('Format',  combo.format.name   || 'Format');
    html += '</div>';
    html += '</div>';
    return html;
  }

  function _swComboPart(label, value) {
    var html = '<div class="cp-sw-combo-part">';
    html += '<span class="cp-sw-combo-part-label">' + esc(label) + '</span>';
    html += '<span class="cp-sw-combo-part-value">' + esc(truncate(value, 60)) + '</span>';
    html += '</div>';
    return html;
  }

  // --- Step 8: Review & Launch ---

  function renderSWStep8() {
    var ws         = setupWizardState;
    var selPersonas = (ws.personas    || []).filter(function(p) { return p._selected; });
    var selPPs      = (ws.pain_points  || []).filter(function(p) { return p._selected; });
    var selMessages = (ws.messages    || []).filter(function(m) { return m._selected; });
    var selStyles   = (ws.styles      || []).filter(function(s) { return s._selected; });
    var selFormats  = (ws.formats     || []).filter(function(f) { return f._selected; });
    var selCombos   = (ws.combos      || []).filter(function(c) { return c.selected; });

    var html = _buildSWStepHeader(
      'Review &amp; Launch',
      'Everything looks good! Review your selections below then launch to build your workspace.',
      'c'
    );

    // Finalizing progress state
    if (ws.finalizing) {
      html += '<div class="cp-sw-finalize-progress">';
      html += '<div class="cp-sw-finalize-spinner">' + icon('loader') + '</div>';
      html += '<p class="cp-sw-finalize-msg">' + esc(ws.finalizeMsg || 'Setting up your workspace…') + '</p>';
      html += '</div>';
      return html;
    }

    // Summary stats grid
    html += '<div class="cp-sw-review-grid">';
    html += _buildSWReviewBox('users',         'Personas',    selPersonas.length,  selPersonas.map(function(p) { return p.name; }));
    html += _buildSWReviewBox('crosshair',     'Pain Points', selPPs.length,       selPPs.map(function(p) { return p.pain_point; }));
    html += _buildSWReviewBox('message-square','Messages',    selMessages.length,  selMessages.map(function(m) { return m.name; }));
    html += _buildSWReviewBox('palette',       'Styles',      selStyles.length,    selStyles.map(function(s) { return s.name; }));
    html += _buildSWReviewBox('clapperboard',  'Formats',     selFormats.length,   selFormats.map(function(f) { return f.name; }));
    html += _buildSWReviewBox('shuffle',       'Recipes',     selCombos.length,    selCombos.map(function(c, i) { return 'Recipe ' + (i + 1); }));
    html += '</div>';

    // Campaign info box (if campaign name set)
    var cam = ws.campaign || {};
    if (cam.name) {
      html += '<div class="cp-sw-info-box cp-sw-info-box--success" style="margin-top:var(--cp-space-4)">';
      html += icon('briefcase') + ' Campaign: <strong>' + esc(cam.name) + '</strong>';
      if (cam.date_start && cam.date_end) {
        html += ' &nbsp;&middot;&nbsp; ' + esc(cam.date_start) + ' &rarr; ' + esc(cam.date_end);
      }
      if (cam.budget_notes) {
        html += ' &nbsp;&middot;&nbsp; ' + esc(cam.budget_notes);
      }
      html += '</div>';
    }

    // Launch note (button is in the footer)
    html += '<p class="cp-sw-finalize-note" style="margin-top:var(--cp-space-5);text-align:center">';
    html += 'Hit <strong>Launch Workspace</strong> below to create ' + selCombos.length + ' ad recipe' + (selCombos.length !== 1 ? 's' : '') + ' and start your campaign.';
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


/* ===== src/20-part2a/16-campaign-wizard.js ===== */
  // ============================================================
  // SECTION 9.5: CAMPAIGN WIZARD (Multi-Step)
  // ============================================================

  var wizardState = { step: 1, data: {}, selections: { personas: [], messages: [], styles: [], formats: [] }, recipes: [], allSelected: false };

  function openCampaignWizard() {
    wizardState = {
      step: 1, data: { name: '', description: '', objective: '', funnel_stage: '', date_start: '', date_end: '', budget_notes: '', ai_instructions: '' },
      selections: { personas: [], messages: [], styles: [], formats: [] },
      recipes: [], allSelected: false
    };
    renderWizardModal();
  }

  function renderWizardModal() {
    var step = wizardState.step;
    var steps = [
      { num: 1, label: 'Basics', icon: 'clipboard-list' },
      { num: 2, label: 'Targeting', icon: 'crosshairs' },
      { num: 3, label: 'Recipes', icon: 'shuffle' },
      { num: 4, label: 'Review', icon: 'check' }
    ];

    var html = '<div class="cp-wizard">';
    // Step indicator
    html += '<div class="cp-wizard-steps">';
    for (var si = 0; si < steps.length; si++) {
      var st = steps[si];
      var cls = step === st.num ? ' cp-wizard-step-active' : (step > st.num ? ' cp-wizard-step-done' : '');
      html += '<div class="cp-wizard-step' + cls + '" data-action="wizard-go-step" data-step="' + st.num + '">';
      html += (step > st.num ? icon('circle-check') + ' ' : '') + icon(st.icon) + ' ' + esc(st.label);
      html += '</div>';
    }
    html += '</div>';

    // Body
    html += '<div class="cp-wizard-body">';
    switch(step) {
      case 1: html += renderWizardStep1(); break;
      case 2: html += renderWizardStep2(); break;
      case 3: html += renderWizardStep3(); break;
      case 4: html += renderWizardStep4(); break;
    }
    html += '</div>';

    // Footer
    html += '<div class="cp-wizard-footer">';
    if (step > 1) html += '<button class="cp-btn cp-btn-outline" data-action="wizard-prev">' + icon('arrow-left') + ' Back</button>';
    else html += '<span></span>';
    if (step < 4) html += '<button class="cp-btn cp-btn-primary" data-action="wizard-next">Next ' + icon('arrow-right') + '</button>';
    else html += '<button class="cp-btn cp-btn-ai" data-action="wizard-create">' + icon('bolt') + ' Create Campaign</button>';
    html += '</div></div>';

    openModal('Campaign Wizard', html, { titleIcon: 'wand-magic', size: 'xl', footer: false });
  }

  function renderWizardStep1() {
    var d = wizardState.data;
    var objectives = Constants.CAMPAIGN_OBJECTIVES || [];
    var funnels = (S.meta.settings && S.meta.settings.funnel_stages) || [];
    var html = '<h3 style="margin-bottom:var(--cp-space-4)">' + icon('clipboard-list') + ' Campaign Basics</h3>';
    html += '<div class="cp-form-group"><label>Campaign Name *</label>';
    html += '<input type="text" class="cp-input cp-wizard-field" data-wfield="name" value="' + esc(d.name) + '" placeholder="e.g., Q3 Creator Growth Campaign"></div>';
    html += '<div class="cp-form-group"><label>Description</label>';
    html += '<textarea class="cp-textarea cp-wizard-field" data-wfield="description" rows="2" placeholder="What is this campaign about?">' + esc(d.description) + '</textarea></div>';
    html += '<div class="cp-form-row"><div class="cp-form-third"><label>Objective</label>';
    html += '<select class="cp-select cp-wizard-field" data-wfield="objective"><option value="">Select...</option>';
    for (var oi = 0; oi < objectives.length; oi++) html += '<option value="' + esc(objectives[oi].id) + '"' + (d.objective === objectives[oi].id ? ' selected' : '') + '>' + esc(objectives[oi].name) + '</option>';
    html += '</select></div><div class="cp-form-third"><label>Start Date</label>';
    html += '<input type="date" class="cp-input cp-wizard-field" data-wfield="date_start" value="' + esc(d.date_start) + '"></div>';
    html += '<div class="cp-form-third"><label>End Date</label>';
    html += '<input type="date" class="cp-input cp-wizard-field" data-wfield="date_end" value="' + esc(d.date_end) + '"></div></div>';
    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Funnel Focus</label>';
    html += '<select class="cp-select cp-wizard-field" data-wfield="funnel_stage"><option value="">All stages</option>';
    for (var fi = 0; fi < funnels.length; fi++) html += '<option value="' + esc(funnels[fi].id) + '"' + (d.funnel_stage === funnels[fi].id ? ' selected' : '') + '>' + esc(funnels[fi].name) + '</option>';
    html += '</select></div><div class="cp-form-half"><label>Budget Notes</label>';
    html += '<input type="text" class="cp-input cp-wizard-field" data-wfield="budget_notes" value="' + esc(d.budget_notes) + '" placeholder="e.g., ₹2L/month"></div></div>';
    html += '<div class="cp-form-group"><label>AI Instructions for this Campaign</label>';
    html += '<textarea class="cp-textarea cp-wizard-field" data-wfield="ai_instructions" rows="2" placeholder="Special instructions for AI when generating recipes for this campaign...">' + esc(d.ai_instructions) + '</textarea></div>';
    return html;
  }

  function renderWizardStep2() {
    var sel = wizardState.selections;
    var dims = [
      { key: 'personas', label: 'Personas', icon: 'users', color: '#9334e9', items: getAllPersonas(), nameKey: 'name' },
      { key: 'messages', label: 'Messages', icon: 'comments', color: '#1a73e8', items: getAllMessages(), nameKey: 'title' },
      { key: 'styles', label: 'Styles', icon: 'palette', color: '#e37400', items: getAllStyles(), nameKey: 'name' },
      { key: 'formats', label: 'Formats', icon: 'clapperboard', color: '#0891b2', items: getAllFormats(), nameKey: 'name' }
    ];
    var html = '<h3 style="margin-bottom:var(--cp-space-4)">' + icon('crosshairs') + ' Select Dimensions</h3>';
    html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-4)">Choose which personas, messages, styles, and formats this campaign will use. Selected dimensions will be used for recipe generation.</p>';
    for (var di = 0; di < dims.length; di++) {
      var dim = dims[di];
      html += '<div class="cp-wizard-dim-section">';
      html += '<div class="cp-wizard-dim-header" style="color:' + dim.color + '">' + icon(dim.icon) + ' ' + esc(dim.label) + ' <span class="cp-text-muted" style="font-weight:400">(' + sel[dim.key].length + '/' + dim.items.length + ' selected)</span></div>';
      html += '<div class="cp-wizard-dim-list">';
      if (dim.items.length === 0) {
        html += '<span class="cp-text-muted">No ' + dim.label.toLowerCase() + ' in library. <a href="#" data-action="close-modal" style="color:var(--cp-primary)">Create some first.</a></span>';
      } else {
        for (var ii = 0; ii < dim.items.length; ii++) {
          var item = dim.items[ii];
          var isSel = sel[dim.key].indexOf(item.id) > -1;
          html += '<label class="cp-wizard-dim-chip' + (isSel ? ' cp-wizard-dim-chip-selected' : '') + '" style="' + (isSel ? 'background:' + dim.color + '12;color:' + dim.color + ';border-color:' + dim.color : '') + '">';
          html += '<input type="checkbox" data-action="wizard-toggle-dim" data-dim="' + dim.key + '" data-id="' + esc(item.id) + '"' + (isSel ? ' checked' : '') + ' style="display:none">';
          html += esc(item[dim.nameKey] || item.name || item.title || 'Untitled');
          html += '</label>';
        }
      }
      html += '</div></div>';
    }
    return html;
  }

  function renderWizardStep3() {
    var sel = wizardState.selections;
    var personas = sel.personas.length > 0 ? sel.personas : [''];
    var messages = sel.messages.length > 0 ? sel.messages : [''];
    var styles = sel.styles.length > 0 ? sel.styles : [''];
    var formats = sel.formats.length > 0 ? sel.formats : [''];
    var totalCombos = Math.max(1, personas.length) * Math.max(1, messages.length) * Math.max(1, styles.length) * Math.max(1, formats.length);
    var hasSel = sel.personas.length + sel.messages.length + sel.styles.length + sel.formats.length > 0;

    var html = '<h3 style="margin-bottom:var(--cp-space-3)">' + icon('shuffle') + ' Recipe Combinations</h3>';

    if (!hasSel) {
      html += '<div class="cp-empty-state cp-empty-state--compact"><p>Go back to Step 2 and select dimensions to generate recipe combinations.</p></div>';
      return html;
    }

    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--cp-space-4)">';
    html += '<p class="cp-text-muted">' + totalCombos + ' possible combination' + (totalCombos !== 1 ? 's' : '') + '. Select which ones to create.</p>';
    html += '<div style="display:flex;gap:var(--cp-space-2)">';
    html += '<button class="cp-btn cp-btn-ai cp-btn-sm" data-action="wizard-ai-suggest">' + icon('sparkles') + ' AI Suggest Best</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="wizard-select-all">' + (wizardState.allSelected ? 'Deselect All' : 'Select All') + '</button>';
    html += '</div></div>';

    // Generate recipe preview cards — preserve prior selections
    var prevSelections = {};
    for (var ps = 0; ps < wizardState.recipes.length; ps++) {
      var pr = wizardState.recipes[ps];
      prevSelections[pr.persona_id + '|' + pr.message_id + '|' + pr.style_id + '|' + pr.visual_format_id] = pr.selected;
    }
    var hadPrevRecipes = wizardState.recipes.length > 0;
    wizardState.recipes = [];
    var idx = 0;
    for (var pi = 0; pi < personas.length; pi++) {
      for (var mi = 0; mi < messages.length; mi++) {
        for (var si = 0; si < styles.length; si++) {
          for (var fi = 0; fi < formats.length; fi++) {
            if (idx >= 50) break; // Cap at 50 preview cards
            var pName = personas[pi] ? (S.personaMap[personas[pi]] || {}).name || '?' : '—';
            var mName = messages[mi] ? (S.messageMap[messages[mi]] || {}).title || '?' : '—';
            var sName = styles[si] ? (S.styleMap[styles[si]] || {}).name || '?' : '—';
            var fName = formats[fi] ? (S.formatMap[formats[fi]] || {}).name || '?' : '—';
            var comboKey = personas[pi] + '|' + messages[mi] + '|' + styles[si] + '|' + formats[fi];
            var isSelected = hadPrevRecipes ? (prevSelections[comboKey] !== undefined ? prevSelections[comboKey] : wizardState.allSelected || false) : (wizardState.allSelected || false);
            wizardState.recipes.push({
              idx: idx, persona_id: personas[pi], message_id: messages[mi],
              style_id: styles[si], visual_format_id: formats[fi],
              title: pName + ' × ' + mName + ' × ' + sName + ' × ' + fName,
              selected: isSelected
            });
            idx++;
          }
        }
      }
    }

    html += '<div class="cp-wizard-recipe-preview">';
    for (var ri = 0; ri < wizardState.recipes.length; ri++) {
      var r = wizardState.recipes[ri];
      html += '<div class="cp-wizard-recipe-card' + (r.selected ? ' cp-wizard-recipe-card-selected' : '') + '" data-action="wizard-toggle-recipe" data-ridx="' + ri + '">';
      html += '<div style="font-weight:600;font-size:12px;margin-bottom:6px">#' + (ri + 1) + '</div>';
      if (r.persona_id) html += '<div>' + dimensionBadge('persona', (S.personaMap[r.persona_id] || {}).name || '?') + '</div>';
      if (r.message_id) html += '<div>' + dimensionBadge('message', (S.messageMap[r.message_id] || {}).title || '?') + '</div>';
      if (r.style_id) html += '<div>' + dimensionBadge('style', (S.styleMap[r.style_id] || {}).name || '?') + '</div>';
      if (r.visual_format_id) html += '<div>' + dimensionBadge('format', (S.formatMap[r.visual_format_id] || {}).name || '?') + '</div>';
      html += '</div>';
    }
    html += '</div>';

    var selCount = wizardState.recipes.filter(function(r) { return r.selected; }).length;
    html += '<div style="margin-top:var(--cp-space-3)"><strong>' + selCount + '</strong> recipe' + (selCount !== 1 ? 's' : '') + ' selected for creation</div>';
    return html;
  }

  function renderWizardStep4() {
    var d = wizardState.data;
    var sel = wizardState.selections;
    var selRecipes = wizardState.recipes.filter(function(r) { return r.selected; });
    var objective = (Constants.CAMPAIGN_OBJECTIVES || []).find(function(o) { return o.id === d.objective; });

    var html = '<h3 style="margin-bottom:var(--cp-space-4)">' + icon('check') + ' Review & Create</h3>';
    html += '<div class="cp-card" style="margin-bottom:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('bullhorn') + ' Campaign Summary</h3></div>';
    html += '<div class="cp-detail-grid cp-detail-grid-2">';
    html += '<div class="cp-detail-field"><div class="cp-detail-label">Name</div><div class="cp-detail-value">' + esc(d.name || 'Untitled') + '</div></div>';
    if (objective) html += '<div class="cp-detail-field"><div class="cp-detail-label">Objective</div><div class="cp-detail-value">' + icon(objective.icon) + ' ' + esc(objective.name) + '</div></div>';
    if (d.date_start || d.date_end) html += '<div class="cp-detail-field"><div class="cp-detail-label">Dates</div><div class="cp-detail-value">' + esc(d.date_start || '?') + ' → ' + esc(d.date_end || '?') + '</div></div>';
    if (d.budget_notes) html += '<div class="cp-detail-field"><div class="cp-detail-label">Budget</div><div class="cp-detail-value">' + esc(d.budget_notes) + '</div></div>';
    html += '<div class="cp-detail-field"><div class="cp-detail-label">Dimensions</div><div class="cp-detail-value">';
    html += sel.personas.length + ' personas · ' + sel.messages.length + ' messages · ' + sel.styles.length + ' styles · ' + sel.formats.length + ' formats';
    html += '</div></div>';
    html += '<div class="cp-detail-field"><div class="cp-detail-label">Recipes to Create</div><div class="cp-detail-value" style="font-size:var(--cp-font-size-xl);font-weight:700;color:var(--cp-primary)">' + selRecipes.length + '</div></div>';
    html += '</div></div>';

    if (d.description) {
      html += '<div class="cp-card" style="margin-bottom:var(--cp-space-4)"><div class="cp-section-header"><h3>Description</h3></div>';
      html += '<p>' + esc(d.description) + '</p></div>';
    }

    if (selRecipes.length > 0) {
      html += '<div class="cp-card"><div class="cp-section-header"><h3>' + icon('shuffle') + ' Recipes (' + selRecipes.length + ')</h3></div>';
      for (var ri = 0; ri < Math.min(selRecipes.length, 15); ri++) {
        html += '<div style="padding:4px 0;border-bottom:1px solid var(--cp-border-light);font-size:var(--cp-font-size-sm)">' + esc(selRecipes[ri].title) + '</div>';
      }
      if (selRecipes.length > 15) html += '<p class="cp-text-muted" style="margin-top:4px">...and ' + (selRecipes.length - 15) + ' more</p>';
      html += '</div>';
    }
    return html;
  }

  function collectWizardFields() {
    $('.cp-wizard-field').each(function() {
      var key = $(this).data('wfield');
      if (key) wizardState.data[key] = $(this).is(':checkbox') ? $(this).is(':checked') : $(this).val() || '';
    });
  }

  function executeWizardCreate() {
    collectWizardFields();
    var d = wizardState.data;
    if (!d.name || !d.name.trim()) { toast('Campaign name is required', 'warning'); return; }

    snapshot('Campaign wizard');
    var camp = createEntity('campaign', {
      name: d.name.trim(), description: d.description || '',
      objective: d.objective || '', funnel_stage: d.funnel_stage || '',
      date_start: d.date_start || '', date_end: d.date_end || '',
      budget_notes: d.budget_notes || '', ai_instructions: d.ai_instructions || '',
      persona_ids: wizardState.selections.personas.slice(),
      message_ids: wizardState.selections.messages.slice(),
      style_ids: wizardState.selections.styles.slice(),
      format_ids: wizardState.selections.formats.slice()
    });

    if (!camp) { toast('Failed to create campaign', 'error'); return; }

    // Create selected recipes
    var selRecipes = wizardState.recipes.filter(function(r) { return r.selected; });
    for (var i = 0; i < selRecipes.length; i++) {
      var sr = selRecipes[i];
      createEntity('recipe', {
        persona_id: sr.persona_id || '', message_id: sr.message_id || '',
        style_id: sr.style_id || '', visual_format_id: sr.visual_format_id || '',
        campaign_id: camp.id
      });
    }

    logActivity('campaign_created', 'campaign', camp.id, camp.name, 'Campaign wizard: created with ' + selRecipes.length + ' recipes');
    S.selectedCampaignId = camp.id;
    closeModal();
    navigate('campaigns');
    toast('Campaign "' + d.name + '" created with ' + selRecipes.length + ' recipes', 'success', 5000);
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


/* ===== src/20-part2a/18-step-composition.js ===== */
  // ============================================================
  // SECTION 11: COMPOSITION STEP RENDERER
  // ============================================================

  function renderCompositionStep(recipe) {
    var html = '<div class="cp-step-composition" data-recipe-id="' + esc(recipe.id) + '">';

    // ── PRIMARY ROW: Persona + Message (large, dominant)
    html += '<div class="cp-card cp-composition-primary">';
    html += '<div class="cp-section-header"><h3>' + icon('shapes') + ' Core Composition</h3>';
    html += '<span class="cp-text-muted">Persona &amp; message angle drive every creative decision.</span></div>';
    html += '<div class="cp-composition-primary-grid">';
    html += renderCompositionPrimaryCard('persona', recipe.persona_id, 'persona_id', recipe);
    html += renderCompositionPrimaryCard('message', recipe.message_id, 'message_id', recipe);
    html += '</div></div>';

    // ── SECONDARY ROW: Style + Visual Format (compact chips)
    html += '<div class="cp-card cp-composition-secondary">';
    html += '<div class="cp-composition-secondary-header">';
    html += '<span class="cp-composition-secondary-label">' + icon('sliders') + ' Style &amp; Visual Format <span class="cp-text-muted">(optional refinements)</span></span>';
    html += '</div>';
    html += '<div class="cp-composition-secondary-grid">';
    html += renderCompositionChip('style', recipe.style_id, recipe);
    html += renderCompositionChip('format', recipe.visual_format_id, recipe);
    html += '</div></div>';

    // ── Media type toggle (used downstream to pick production app)
    // Once a production node exists for this recipe, the media type is locked
    // to whatever that production was created as. To switch types, the user
    // has to delete the production node in Drupal first.
    var compProd = getRecipeProduction(recipe);
    var mtLocked = !!compProd;
    var lockedMtKey = compProd ? (compProd.media_type || recipe.media_type) : '';
    html += '<div class="cp-card' + (mtLocked ? ' cp-media-type-card-locked' : '') + '" style="margin-top:var(--cp-space-3)">';
    html += '<div class="cp-section-header"><h3>' + icon('image') + ' Media Type' + (mtLocked ? ' <span class="cp-media-type-lock-icon" title="Locked — production node exists">' + icon('lock') + '</span>' : '') + '</h3>';
    if (mtLocked) {
      html += '<span class="cp-text-muted">Locked — a production node exists for this recipe. <a href="#" data-action="go-step" data-step="media">View it →</a></span></div>';
    } else {
      html += '<span class="cp-text-muted">Determines which production app handles delivery.</span></div>';
    }
    html += '<div class="cp-media-type-toggle' + (mtLocked ? ' cp-media-type-toggle-locked' : '') + '">';
    var mediaTypes = (typeof Constants !== 'undefined' && Constants.MEDIA_TYPES) || {};
    for (var mtk in mediaTypes) {
      var mt = mediaTypes[mtk];
      var mtActive = (mtLocked ? lockedMtKey : recipe.media_type) === mtk ? ' cp-media-type-active' : '';
      if (mtLocked) {
        html += '<button class="cp-media-type-btn cp-media-type-btn-locked' + mtActive + '" type="button" disabled aria-disabled="true" title="Locked — production node exists">' + icon(mt.icon) + ' ' + esc(mt.label) + '</button>';
      } else {
        html += '<button class="cp-media-type-btn' + mtActive + '" data-action="set-media-type" data-type="' + mtk + '">' + icon(mt.icon) + ' ' + esc(mt.label) + '</button>';
      }
    }
    html += '</div></div>';

    // ── Pain point selector (grouped + searchable)
    html += renderPainPointSelector(recipe);

    // ── Title editor
    html += '<div class="cp-card" style="margin-top:var(--cp-space-3)">';
    html += '<div class="cp-section-header"><h3>' + icon('edit') + ' Recipe Title</h3></div>';
    html += '<input type="text" class="cp-input" data-action="save-recipe-title" value="' + esc(recipe.title || '') + '" placeholder="Recipe title...">';
    html += '</div>';

    // ── Priority + Campaign + Due date
    html += '<div class="cp-card" style="margin-top:var(--cp-space-3)">';
    html += '<div class="cp-section-header"><h3>' + icon('sliders') + ' Details</h3></div>';
    var camps = getAllCampaigns();
    html += '<div class="cp-recipe-details-grid">';
    html += '<div class="cp-form-group"><label class="cp-field-label">Priority</label>';
    html += '<select class="cp-select" data-action="save-recipe-field" data-rfield="priority">';
    for (var pk in Constants.PRIORITY_LEVELS) {
      html += '<option value="' + pk + '"' + (recipe.priority === pk ? ' selected' : '') + '>' + esc(Constants.PRIORITY_LEVELS[pk].label) + '</option>';
    }
    html += '</select></div>';
    html += '<div class="cp-form-group"><label class="cp-field-label">Campaign</label>';
    html += '<select class="cp-select" data-action="save-recipe-field" data-rfield="campaign_id">';
    html += '<option value="">None</option>';
    for (var ci = 0; ci < camps.length; ci++) {
      html += '<option value="' + esc(camps[ci].id) + '"' + (recipe.campaign_id === camps[ci].id ? ' selected' : '') + '>' + esc(truncate(camps[ci].name, 25)) + '</option>';
    }
    html += '</select></div>';
    html += '<div class="cp-form-group"><label class="cp-field-label">Due Date</label>';
    html += '<input type="date" class="cp-input" data-action="save-recipe-field" data-rfield="due_date" value="' + esc(recipe.due_date || '') + '"></div>';
    html += '</div></div>';

    // ── Templates
    html += '<div class="cp-card" style="margin-top:var(--cp-space-3)">';
    html += '<div class="cp-section-header"><h3>' + icon('bookmark') + ' Templates</h3></div>';
    html += '<div style="display:flex;gap:var(--cp-space-2);flex-wrap:wrap">';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="save-recipe-template" data-recipe-id="' + esc(recipe.id) + '">' + icon('floppy-disk') + ' Save as Template</button>';
    var templates = (S.meta && S.meta.recipe_templates) || [];
    if (templates.length > 0) {
      html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="apply-recipe-template" data-recipe-id="' + esc(recipe.id) + '">' + icon('file-import') + ' Apply Template (' + templates.length + ')</button>';
    }
    html += '</div></div>';

    html += '</div>';
    return html;
  }

  function renderCompositionPrimaryCard(dimKey, currentId, fieldKey, recipe) {
    var dim = Constants.DIMENSIONS[dimKey];
    var entity = getEntityForDim(dimKey, currentId);
    var entityName = entity ? (entity.name || entity.title || '') : '';
    var entitySub = getEntitySubtext(dimKey, entity);
    var entityDesc = entity ? (entity.description || entity.body || '') : '';
    var isEmpty = !entity;

    var html = '<div class="cp-comp-primary-card' + (isEmpty ? ' cp-comp-primary-card-empty' : '') + '" style="--dim-color:' + dim.color + '">';
    html += '<div class="cp-comp-primary-icon" style="background:' + dim.color + '15;color:' + dim.color + '">' + icon(dim.icon) + '</div>';
    html += '<div class="cp-comp-primary-body">';
    html += '<div class="cp-comp-primary-label" style="color:' + dim.color + '">' + esc(dim.label) + (dimKey === 'message' ? ' Angle' : '') + '</div>';
    if (isEmpty) {
      html += '<div class="cp-comp-primary-empty">Not set</div>';
    } else {
      html += '<div class="cp-comp-primary-name">' + esc(entityName) + '</div>';
      if (entitySub) html += '<div class="cp-comp-primary-sub">' + esc(entitySub) + '</div>';
      if (entityDesc) html += '<div class="cp-comp-primary-desc">' + esc(truncate(entityDesc, 140)) + '</div>';
    }
    html += '</div>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="change-dimension" data-dim="' + dimKey + '" data-recipe-id="' + esc(recipe.id) + '">' + (isEmpty ? icon('plus') + ' Set' : icon('refresh') + ' Change') + '</button>';
    html += '</div>';
    return html;
  }

  function renderCompositionChip(dimKey, currentId, recipe) {
    var dim = Constants.DIMENSIONS[dimKey];
    var entity = getEntityForDim(dimKey, currentId);
    var entityName = entity ? (entity.name || entity.title || '') : '';
    var isEmpty = !entity;

    var html = '<button class="cp-comp-chip' + (isEmpty ? ' cp-comp-chip-empty' : '') + '" data-action="change-dimension" data-dim="' + dimKey + '" data-recipe-id="' + esc(recipe.id) + '" style="--dim-color:' + dim.color + '">';
    html += '<span class="cp-comp-chip-icon" style="color:' + dim.color + '">' + icon(dim.icon) + '</span>';
    html += '<span class="cp-comp-chip-label">' + esc(dim.label) + ':</span>';
    html += '<span class="cp-comp-chip-value">' + (isEmpty ? '<span class="cp-text-muted">Not set</span>' : esc(entityName)) + '</span>';
    html += '<span class="cp-comp-chip-edit">' + icon(isEmpty ? 'plus' : 'edit') + '</span>';
    html += '</button>';
    return html;
  }

  function renderPainPointSelector(recipe) {
    var persona = S.personaMap[recipe.persona_id];
    var personaPainPoints = persona ? getPersonaPainPoints(persona) : [];
    var allPainPoints = getAllPainPoints();
    if (allPainPoints.length === 0) return '';

    var selected = recipe.selected_pain_point_ids || [];
    S._compPainFilter = S._compPainFilter || { search: '', scope: 'persona', category: '' };
    var f = S._compPainFilter;

    // Scope: 'persona' (default if persona has points) | 'all'
    if (personaPainPoints.length === 0 && f.scope === 'persona') f.scope = 'all';
    var basePool = f.scope === 'persona' ? personaPainPoints : allPainPoints;

    // Apply filters
    var pool = basePool.slice();
    if (f.search) {
      var q = f.search.toLowerCase();
      pool = pool.filter(function(pp) {
        return (pp.pain_point || '').toLowerCase().indexOf(q) > -1 ||
               (pp.solution || '').toLowerCase().indexOf(q) > -1;
      });
    }
    if (f.category) pool = pool.filter(function(pp) { return pp.category === f.category; });

    var html = '<div class="cp-card cp-pain-picker-card" style="margin-top:var(--cp-space-3)">';
    html += '<div class="cp-section-header"><h3>' + icon('bolt') + ' Pain Points to Address</h3>';
    html += '<span class="cp-text-muted">' + selected.length + ' selected · ' + pool.length + ' shown</span></div>';

    // Toolbar
    html += '<div class="cp-pain-picker-toolbar">';
    html += '<div class="cp-search-wrapper cp-search-wrapper-sm">' + icon('search') + '<input type="text" class="cp-input cp-input-sm" id="cpRecipePainSearch" placeholder="Search pain points…" value="' + esc(f.search || '') + '"></div>';
    html += '<select class="cp-select cp-select-sm" id="cpRecipePainCategory"><option value="">All categories</option>';
    var ppCats = Constants.PAIN_POINT_CATEGORIES || [];
    for (var ci = 0; ci < ppCats.length; ci++) {
      html += '<option value="' + esc(ppCats[ci].id) + '"' + (f.category === ppCats[ci].id ? ' selected' : '') + '>' + esc(ppCats[ci].name) + '</option>';
    }
    html += '</select>';
    if (personaPainPoints.length > 0) {
      html += '<div class="cp-pain-scope-toggle">';
      html += '<button class="cp-pain-scope-btn' + (f.scope === 'persona' ? ' cp-pain-scope-active' : '') + '" data-action="set-pain-scope" data-scope="persona" title="Pain points linked to this recipe’s persona">' + icon('user') + ' Persona (' + personaPainPoints.length + ')</button>';
      html += '<button class="cp-pain-scope-btn' + (f.scope === 'all' ? ' cp-pain-scope-active' : '') + '" data-action="set-pain-scope" data-scope="all" title="Browse every pain point in the library">' + icon('list') + ' All (' + allPainPoints.length + ')</button>';
      html += '</div>';
    }
    html += '</div>';

    // List — grouped by category
    if (pool.length === 0) {
      html += '<p class="cp-text-muted" style="padding:var(--cp-space-3) 0">No pain points match the filters.</p>';
    } else {
      var groups = groupPainPointsByCategory(pool);
      html += '<div class="cp-pain-picker-list">';
      for (var gi = 0; gi < groups.length; gi++) {
        var g = groups[gi];
        if (groups.length > 1) {
          html += '<div class="cp-pain-picker-group-label">' + esc(g.label) + ' <span class="cp-text-muted">(' + g.items.length + ')</span></div>';
        }
        for (var pi = 0; pi < g.items.length; pi++) {
          var pp = g.items[pi];
          var isSelected = selected.indexOf(pp.id) > -1;
          html += '<label class="cp-pain-point-picker-item' + (isSelected ? ' cp-pain-point-picker-item-selected' : '') + '">';
          html += '<input type="checkbox" data-action="toggle-recipe-pp" data-pp-id="' + esc(pp.id) + '"' + (isSelected ? ' checked' : '') + '>';
          html += '<div style="flex:1;min-width:0">';
          html += '<div style="font-weight:600;font-size:13px;line-height:1.4">' + esc(truncate(pp.pain_point, 110)) + '</div>';
          if (pp.solution) html += '<div style="font-size:11px;color:var(--cp-success);margin-top:2px;line-height:1.4"><i class="fa-solid fa-lightbulb" style="margin-right:3px"></i>' + esc(truncate(pp.solution, 100)) + '</div>';
          html += '</div></label>';
        }
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  // Debounced search handler — exported for event handler registration
  var _cpPainSearchTimer = null;
  function _cpDebouncePainSearch() {
    var val = $(this).val() || '';
    if (_cpPainSearchTimer) clearTimeout(_cpPainSearchTimer);
    _cpPainSearchTimer = setTimeout(function() {
      S._compPainFilter = S._compPainFilter || {};
      S._compPainFilter.search = val;
      render();
      // Restore focus + caret after re-render
      var $el = $('#cpRecipePainSearch');
      if ($el.length) { var v = $el.val(); $el.focus(); try { $el[0].setSelectionRange(v.length, v.length); } catch(e) {} }
    }, 250);
  }

  function groupPainPointsByCategory(items) {
    var ppCats = Constants.PAIN_POINT_CATEGORIES || [];
    var grouped = {};
    for (var i = 0; i < items.length; i++) {
      var k = items[i].category || '__uncat__';
      (grouped[k] = grouped[k] || []).push(items[i]);
    }
    var result = [];
    for (var ci = 0; ci < ppCats.length; ci++) {
      if (grouped[ppCats[ci].id]) result.push({ id: ppCats[ci].id, label: ppCats[ci].name, items: grouped[ppCats[ci].id] });
    }
    if (grouped.__uncat__) result.push({ id: '', label: 'Uncategorized', items: grouped.__uncat__ });
    return result;
  }

  function getEntityForDim(dimKey, id) {
    if (!id) return null;
    if (dimKey === 'persona') return S.personaMap[id];
    if (dimKey === 'message') return S.messageMap[id];
    if (dimKey === 'style') return S.styleMap[id];
    if (dimKey === 'format') return S.formatMap[id];
    return null;
  }

  function getEntitySubtext(dimKey, entity) {
    if (!entity) return '';
    if (dimKey === 'persona') {
      var d = entity.demographics || {};
      return [d.age_range, d.location].filter(Boolean).join(' · ');
    }
    if (dimKey === 'message') {
      return (entity.funnel_stages || []).map(function(fid) {
        var f = S.funnelStageMap[fid]; return f ? f.short : '';
      }).filter(Boolean).join(', ');
    }
    if (dimKey === 'format' && entity.category) {
      var cat = (Constants.FORMAT_CATEGORIES || []).find(function(c) { return c.id === entity.category; });
      return cat ? cat.name : '';
    }
    return entity.description ? truncate(entity.description, 40) : '';
  }

  function openDimensionPicker(dimKey, recipeId) {
    var recipe = getRecipe(recipeId);
    if (!recipe) return;
    var dim = Constants.DIMENSIONS[dimKey];
    var items = [];
    var currentId = '';

    if (dimKey === 'persona') { items = getAllPersonas(); currentId = recipe.persona_id; }
    else if (dimKey === 'message') { items = getAllMessages(); currentId = recipe.message_id; }
    else if (dimKey === 'style') { items = getAllStyles(); currentId = recipe.style_id; }
    else if (dimKey === 'format') { items = getAllFormats(); currentId = recipe.visual_format_id; }

    // Reset/use per-dim picker filter state
    S._dimPickerFilter = S._dimPickerFilter || {};
    var fState = S._dimPickerFilter[dimKey] = S._dimPickerFilter[dimKey] || { search: '', groupBy: getDefaultPickerGroup(dimKey) };

    var html = renderDimensionPickerBody(dimKey, items, currentId, fState);

    openModal('Select ' + dim.label, html, {
      titleIcon: dim.icon,
      size: 'lg',
      saveLabel: 'Select',
      onSave: function() {
        var selected = $('.cp-modal-body input[name="dim_pick"]:checked').val() || '';
        var fieldMap = { persona: 'persona_id', message: 'message_id', style: 'style_id', format: 'visual_format_id' };
        saveEntityField('recipe', recipeId, fieldMap[dimKey], selected);
        autoUpdateRecipeTitle(recipeId);
        snapshot('Change ' + dim.label);
        closeModal();
      }
    });

    // Wire up filter/group within the modal (delegated handlers, no re-render of modal)
    $(document).off('input.cp-dim-pick-search').on('input.cp-dim-pick-search', '.cp-dim-picker-search', function() {
      var v = ($(this).val() || '').toLowerCase();
      $('.cp-dim-picker-item').each(function() {
        var $it = $(this);
        var hay = ($it.data('search-text') || '').toLowerCase();
        $it.toggle(!v || hay.indexOf(v) > -1);
      });
      // Hide empty groups
      $('.cp-dim-picker-group').each(function() {
        var $g = $(this);
        $g.toggle($g.find('.cp-dim-picker-item:visible').length > 0);
      });
    });
    $(document).off('change.cp-dim-pick-group').on('change.cp-dim-pick-group', '.cp-dim-picker-group-select', function() {
      fState.groupBy = $(this).val() || '';
      // Re-render body
      $('.cp-dim-picker-body').html(renderDimensionPickerBodyInner(dimKey, items, currentId, fState));
    });
  }

  function getDefaultPickerGroup(dimKey) {
    if (dimKey === 'persona') return 'category';
    if (dimKey === 'message') return 'funnel';
    if (dimKey === 'format')  return 'category';
    return '';
  }

  function renderDimensionPickerBody(dimKey, items, currentId, fState) {
    var dim = Constants.DIMENSIONS[dimKey];
    var html = '<div class="cp-editor-form cp-dim-picker">';

    // Toolbar
    if (items.length > 0) {
      html += '<div class="cp-dim-picker-toolbar">';
      html += '<div class="cp-search-wrapper cp-search-wrapper-sm">' + icon('search') + '<input type="text" class="cp-input cp-input-sm cp-dim-picker-search" placeholder="Search ' + esc(dim.label.toLowerCase()) + 's…"></div>';

      var groupOptions = getDimGroupOptions(dimKey);
      if (groupOptions.length > 1) {
        html += '<select class="cp-select cp-select-sm cp-dim-picker-group-select">';
        for (var gi = 0; gi < groupOptions.length; gi++) {
          html += '<option value="' + esc(groupOptions[gi].key) + '"' + (fState.groupBy === groupOptions[gi].key ? ' selected' : '') + '>Group: ' + esc(groupOptions[gi].label) + '</option>';
        }
        html += '</select>';
      }
      html += '<span class="cp-text-muted cp-dim-picker-count">' + items.length + ' total</span>';
      html += '</div>';
    }

    html += '<div class="cp-dim-picker-body">';
    html += renderDimensionPickerBodyInner(dimKey, items, currentId, fState);
    html += '</div></div>';
    return html;
  }

  function getDimGroupOptions(dimKey) {
    var common = [{ key: '', label: 'None' }];
    if (dimKey === 'persona') return common.concat([{ key: 'category', label: 'Category' }]);
    if (dimKey === 'message') return common.concat([{ key: 'funnel', label: 'Funnel Stage' }]);
    if (dimKey === 'format')  return common.concat([{ key: 'category', label: 'Category' }]);
    return common;
  }

  function renderDimensionPickerBodyInner(dimKey, items, currentId, fState) {
    var dim = Constants.DIMENSIONS[dimKey];
    if (items.length === 0) {
      return '<div class="cp-empty-state cp-empty-state--compact"><p>No ' + esc(dim.label.toLowerCase()) + 's created yet.</p>' +
        '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="new-' + dimKey + '">' + icon('plus') + ' Create ' + esc(dim.label) + '</button></div>';
    }

    var groups = groupDimensionItems(dimKey, items, fState.groupBy);
    var html = '<div class="cp-dim-picker-list">';
    for (var gi = 0; gi < groups.length; gi++) {
      var g = groups[gi];
      if (groups.length > 1 || g.label) {
        html += '<div class="cp-dim-picker-group">';
        html += '<div class="cp-dim-picker-group-label">' + esc(g.label) + ' <span class="cp-text-muted">(' + g.items.length + ')</span></div>';
      } else {
        html += '<div class="cp-dim-picker-group">';
      }
      for (var ii = 0; ii < g.items.length; ii++) {
        var item = g.items[ii];
        var iid = item.id;
        var iname = item.name || item.title || 'Untitled';
        var isSelected = iid === currentId;
        var sub = getEntitySubtext(dimKey, item);
        var desc = item.description || item.body || '';
        var searchText = (iname + ' ' + (sub || '') + ' ' + (desc || '')).trim();

        html += '<label class="cp-dim-picker-item cp-hook-radio-item' + (isSelected ? ' cp-hook-radio-item-selected' : '') + '" data-search-text="' + esc(searchText) + '">';
        html += '<input type="radio" name="dim_pick" value="' + esc(iid) + '"' + (isSelected ? ' checked' : '') + '>';
        html += '<div style="flex:1;min-width:0">';
        html += '<div style="font-weight:600;font-size:13px;line-height:1.4">' + esc(iname) + '</div>';
        if (sub) html += '<div style="font-size:11px;color:var(--cp-text-muted);margin-top:2px">' + esc(sub) + '</div>';
        if (desc) html += '<div style="font-size:11px;color:var(--cp-text-secondary);margin-top:4px;line-height:1.5">' + esc(truncate(desc, 160)) + '</div>';
        html += '</div></label>';
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function groupDimensionItems(dimKey, items, groupBy) {
    if (!groupBy) return [{ id: '', label: '', items: items }];

    if (dimKey === 'persona' && groupBy === 'category') {
      var pcats = getAllCategories();
      var byCat = {}; var uncat = [];
      for (var i = 0; i < items.length; i++) {
        var cid = items[i].category_id;
        if (cid && S.categoryMap[cid]) (byCat[cid] = byCat[cid] || []).push(items[i]);
        else uncat.push(items[i]);
      }
      var groups = [];
      for (var pi = 0; pi < pcats.length; pi++) {
        if (byCat[pcats[pi].id]) groups.push({ id: pcats[pi].id, label: pcats[pi].name, items: byCat[pcats[pi].id] });
      }
      if (uncat.length) groups.push({ id: '', label: 'Uncategorized', items: uncat });
      return groups;
    }

    if (dimKey === 'message' && groupBy === 'funnel') {
      var funnels = (S.meta.settings && S.meta.settings.funnel_stages) || [];
      var byFun = {}; var unas = [];
      for (var mi = 0; mi < items.length; mi++) {
        var stages = items[mi].funnel_stages || [];
        if (stages.length === 0) { unas.push(items[mi]); continue; }
        for (var si = 0; si < stages.length; si++) {
          (byFun[stages[si]] = byFun[stages[si]] || []).push(items[mi]);
        }
      }
      var mGroups = [];
      for (var fi = 0; fi < funnels.length; fi++) {
        if (byFun[funnels[fi].id]) mGroups.push({ id: funnels[fi].id, label: funnels[fi].name, items: byFun[funnels[fi].id] });
      }
      if (unas.length) mGroups.push({ id: '', label: 'Unassigned', items: unas });
      return mGroups;
    }

    if (dimKey === 'format' && groupBy === 'category') {
      var fcats = Constants.FORMAT_CATEGORIES || [];
      var byFc = {}; var unFc = [];
      for (var ji = 0; ji < items.length; ji++) {
        var c = items[ji].category;
        if (c) (byFc[c] = byFc[c] || []).push(items[ji]); else unFc.push(items[ji]);
      }
      var fGroups = [];
      for (var fci = 0; fci < fcats.length; fci++) {
        if (byFc[fcats[fci].id]) fGroups.push({ id: fcats[fci].id, label: fcats[fci].name, items: byFc[fcats[fci].id] });
      }
      if (unFc.length) fGroups.push({ id: '', label: 'Uncategorized', items: unFc });
      return fGroups;
    }

    return [{ id: '', label: '', items: items }];
  }

  function autoUpdateRecipeTitle(recipeId) {
    var recipe = getRecipe(recipeId);
    if (!recipe) return;
    // Only auto-update if title is empty or was auto-generated (contains ×)
    if (recipe.title && recipe.title.indexOf(' × ') === -1 && recipe.title !== 'New Recipe') return;
    var parts = [];
    var per = S.personaMap[recipe.persona_id]; if (per) parts.push(per.name);
    var msg = S.messageMap[recipe.message_id]; if (msg) parts.push(msg.title);
    var sty = S.styleMap[recipe.style_id]; if (sty) parts.push(sty.name);
    var vf = S.formatMap[recipe.visual_format_id]; if (vf) parts.push(vf.name);
    if (parts.length > 0) saveEntityField('recipe', recipeId, 'title', parts.join(' × '));
  }


/* ===== src/20-part2a/19-step-hook.js ===== */
  // ============================================================
  // SECTION 12: HOOK STEP RENDERER
  // ============================================================

  function renderHookStep(recipe) {
    var msg = S.messageMap[recipe.message_id];
    var hook = recipe.hook || {};
    var html = '<div class="cp-step-hook" data-recipe-id="' + esc(recipe.id) + '">';

    // Inherited hooks from message
    if (msg && (msg.hooks || []).length > 0) {
      html += '<div class="cp-card cp-hook-inherited">';
      html += '<div class="cp-hook-inherited-header">';
      html += '<h3>' + icon('anchor') + ' Message Hooks</h3>';
      html += '<span class="cp-text-muted">Inherited from: ' + esc(msg.title) + '</span>';
      html += '</div>';
      html += '<p class="cp-text-muted" style="margin-bottom:12px">Select a hook to open this recipe, or write a custom override below.</p>';

      html += '<div class="cp-hook-radio-list">';
      for (var hi = 0; hi < msg.hooks.length; hi++) {
        var h = msg.hooks[hi];
        var isSelected = hook.selected_hook_id === h.id;
        var htCfg = Constants.HOOK_TYPES[h.type] || { label: h.type, color: '#80868b' };

        html += '<label class="cp-hook-radio-item' + (isSelected ? ' cp-hook-radio-item-selected' : '') + '">';
        html += '<input type="radio" name="hook_select" value="' + esc(h.id) + '"' + (isSelected ? ' checked' : '') + ' data-action="select-hook" style="margin:3px 0 0;flex-shrink:0;cursor:pointer">';
        html += '<div style="flex:1"><div style="font-weight:600;font-size:13px">' + esc(h.text) + '</div>';
        html += '<div style="margin-top:4px">' + hookTypeBadge(h.type) + '</div>';
        html += '</div></label>';
      }
      html += '</div></div>';
    } else {
      html += '<div class="cp-card">';
      html += '<div class="cp-empty-state cp-empty-state--compact">';
      html += '<p>' + icon('info') + (msg ? ' No hooks defined on message "' + esc(msg.title) + '".' : ' No message linked to this recipe.') + '</p>';
      html += '</div></div>';
    }

    // Custom hook override
    html += '<div class="cp-card cp-hook-override" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('pen-fancy') + ' Custom Hook Override</h3>';
    html += renderRecipeAIBar('ai-generate-hook', recipe.id, 'AI Suggest', 'sparkles');
    html += '</div>';
    html += '<p class="cp-text-muted" style="margin-bottom:8px">Write a custom hook to override the inherited one. Leave empty to use the selected hook above.</p>';
    html += '<textarea class="cp-textarea" data-action="save-recipe-hook-custom" rows="3" placeholder="Write a custom opening hook...">' + esc(hook.custom_hook || '') + '</textarea>';

    // Hook type for custom
    if (hook.custom_hook) {
      html += '<div style="margin-top:8px"><label class="cp-field-label">Hook Type</label>';
      html += '<select class="cp-select cp-select-sm" data-action="save-recipe-hook-type" style="width:auto">';
      for (var tk in Constants.HOOK_TYPES) {
        html += '<option value="' + tk + '"' + (hook.hook_type === tk ? ' selected' : '') + '>' + esc(Constants.HOOK_TYPES[tk].label) + '</option>';
      }
      html += '</select></div>';
    }
    html += '</div>';

    // Effective hook summary
    var effectiveHook = getEffectiveHook(recipe);
    if (effectiveHook) {
      html += '<div class="cp-card" style="margin-top:var(--cp-space-4);background:var(--cp-success-light);border-color:rgba(13,144,79,0.15)">';
      html += '<div class="cp-section-header"><h3 style="color:var(--cp-success)">' + icon('check') + ' Active Hook</h3></div>';
      html += '<p style="font-weight:600;font-size:var(--cp-font-size-md);margin-bottom:4px">"' + esc(effectiveHook.text) + '"</p>';
      html += hookTypeBadge(effectiveHook.type);
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  function getEffectiveHook(recipe) {
    var hook = recipe.hook || {};
    // Custom override takes priority
    if (hook.custom_hook && hook.custom_hook.trim()) {
      return { text: hook.custom_hook.trim(), type: hook.hook_type || 'direct' };
    }
    // Selected inherited hook
    if (hook.selected_hook_id) {
      var msg = S.messageMap[recipe.message_id];
      if (msg) {
        var found = (msg.hooks || []).find(function(h) { return h.id === hook.selected_hook_id; });
        if (found) return { text: found.text, type: found.type };
      }
    }
    return null;
  }


/* ===== src/20-part2a/20-step-content.js ===== */
  // ============================================================
  // SECTION 13: CONTENT STEP RENDERER
  // ============================================================

  function renderContentStep(recipe) {
    var content = recipe.content || {};
    var html = '<div class="cp-step-content" data-recipe-id="' + esc(recipe.id) + '">';

    // Ad copy (Quill editor)
    html += '<div class="cp-card cp-ad-copy-editor">';
    html += '<div class="cp-section-header"><h3>' + icon('pen-fancy') + ' Ad Copy / Primary Text</h3>';
    html += renderRecipeAIBar('ai-generate-content', recipe.id, 'AI Write', 'sparkles');
    html += renderRecipeAIBar('ai-improve-content', recipe.id, 'AI Improve', 'wand-magic');
    html += '</div>';
    html += '<div id="cpQuillEditor" class="cp-quill-container"></div>';
    html += '<input type="hidden" id="cpQuillContent" value="' + esc(content.ad_copy || '') + '">';
    html += '</div>';

    // Headline, Description, CTA
    html += '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('heading') + ' Headline & CTA</h3></div>';
    html += '<div class="cp-cta-fields">';
    html += '<div class="cp-form-group"><label class="cp-field-label">Headline</label>';
    html += '<input type="text" class="cp-input" data-action="save-content-field" data-cfield="headline" value="' + esc(content.headline || '') + '" placeholder="Short attention-grabbing headline"></div>';
    html += '<div class="cp-form-group"><label class="cp-field-label">Description</label>';
    html += '<input type="text" class="cp-input" data-action="save-content-field" data-cfield="description" value="' + esc(content.description || '') + '" placeholder="Supporting description text"></div>';
    html += '<div class="cp-form-group"><label class="cp-field-label">Call to Action</label>';
    html += '<input type="text" class="cp-input" data-action="save-content-field" data-cfield="cta" value="' + esc(content.cta || '') + '" placeholder="e.g., Book a Free Demo"></div>';
    html += '</div></div>';

    // Variants
    html += '<div class="cp-card cp-variant-panel" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('copy') + ' Variants</h3>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="add-variant">' + icon('plus') + ' Add Variant</button></div>';
    var variants = content.variants || [];
    if (variants.length === 0) {
      html += '<p class="cp-text-muted">No variants yet. Add variations of your ad copy for A/B testing.</p>';
    } else {
      for (var vi = 0; vi < variants.length; vi++) {
        html += '<div class="cp-variant-item" data-variant-index="' + vi + '">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">';
        html += '<span class="cp-field-label">Variant ' + (vi + 1) + '</span>';
        html += '<button class="cp-btn-icon cp-btn-xs" data-action="remove-variant" data-variant-index="' + vi + '">' + icon('trash') + '</button>';
        html += '</div>';
        html += '<textarea class="cp-textarea" data-action="save-variant" data-variant-index="' + vi + '" rows="3" placeholder="Variant copy...">' + esc(variants[vi].text || '') + '</textarea>';
        html += '</div>';
      }
    }
    html += '</div>';

    // Notes
    html += '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('file-text') + ' Content Notes</h3></div>';
    html += '<textarea class="cp-textarea" data-action="save-content-field" data-cfield="notes" rows="2" placeholder="Internal notes about this content...">' + esc(content.notes || '') + '</textarea>';
    html += '</div>';

    html += '</div>';

    // Init Quill after render
    setTimeout(function() { initQuillForRecipe(recipe.id); }, 50);

    return html;
  }

  var currentQuill = null;
  var currentQuillSaveTimeout = null;
  function destroyQuill() {
    if (currentQuillSaveTimeout) { clearTimeout(currentQuillSaveTimeout); currentQuillSaveTimeout = null; }
    if (currentQuill) {
      try { currentQuill.off('text-change'); } catch(e) {}
      currentQuill = null;
    }
    $('#cpQuillEditor').html('');
  }
  function initQuillForRecipe(recipeId) {
    if (typeof Quill === 'undefined') {
      console.warn('[CP] Quill not loaded');
      return;
    }
    var $container = $('#cpQuillEditor');
    if (!$container.length) return;
    destroyQuill();

    currentQuill = new Quill('#cpQuillEditor', {
      theme: 'snow',
      placeholder: 'Write your ad copy here...',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          ['link'],
          ['clean']
        ]
      }
    });

    // Load existing content
    var existing = $('#cpQuillContent').val() || '';
    if (existing) {
      try { currentQuill.root.innerHTML = existing; } catch(e) { currentQuill.setText(existing); }
    }

    // Save on change (debounced)
    currentQuill.on('text-change', function() {
      clearTimeout(currentQuillSaveTimeout);
      currentQuillSaveTimeout = setTimeout(function() {
        // Guard: only save if this Quill instance is still the active one for this recipe
        if (!currentQuill || recipeId !== S.selectedRecipeId) return;
        var recipe = getRecipe(recipeId);
        if (!recipe) return;
        recipe.content = recipe.content || {};
        recipe.content.ad_copy = currentQuill.root.innerHTML;
        recipe.updated = new Date().toISOString();
        syncToTextarea();
        if (maybeAdvanceRecipeStatus) maybeAdvanceRecipeStatus(recipe, 'content updated');
        buildMaps();
      }, 500);
    });
  }


/* ===== src/20-part2a/21-step-media.js ===== */
  // ============================================================
  // SECTION 14: PRODUCTION STEP RENDERER
  // ============================================================
  // Hands off recipe to the matching media-production Drupal app
  // (image_production / carousel_production / video_production).
  // Pre-fills title, brand, planner hub, planner id via query params.
  // ============================================================

  function renderMediaStep(recipe) {
    var prod = getRecipeProduction(recipe);
    var html = '<div class="cp-step-production" data-recipe-id="' + esc(recipe.id) + '">';

    if (prod) {
      // A production node already exists for this recipe — show the
      // connected-production card instead of the create-handoff UI.
      html += renderProductionExistsCard(recipe, prod);
    } else {
      // Header / context
      html += '<div class="cp-card cp-production-header-card">';
      html += '<div class="cp-section-header"><h3>' + icon('rocket') + ' Production Handoff</h3>';
      html += '<span class="cp-text-muted">Send this recipe to the matching media production app.</span></div>';
      html += '<p class="cp-production-intro">';
      html += 'Choose the media type, then open the production node-add form pre-filled with this recipe’s title, brand, and planner IDs. ';
      html += 'You will craft the actual creative — image prompts, carousel slides, or video script — inside the production app.';
      html += '</p>';
      html += '</div>';

      // Media-type selector
      html += '<div class="cp-card cp-production-type-card">';
      html += '<div class="cp-section-header"><h3>' + icon('layer-group') + ' Media Type</h3></div>';
      html += '<div class="cp-production-type-grid">';
      var types = (typeof Constants !== 'undefined' && Constants.MEDIA_TYPES) || {};
      for (var key in types) {
        var mt = types[key];
        var active = recipe.media_type === key;
        html += '<button class="cp-production-type-card-btn' + (active ? ' cp-production-type-active' : '') + '" data-action="set-media-type" data-type="' + esc(key) + '" style="--mt-color:' + mt.color + '">';
        html += '<span class="cp-production-type-icon" style="background:' + mt.color + '15;color:' + mt.color + '">' + icon(mt.icon) + '</span>';
        html += '<span class="cp-production-type-label">' + esc(mt.label) + '</span>';
        html += '<span class="cp-production-type-sub">/node/add/' + esc(mt.node_type) + '</span>';
        if (active) html += '<span class="cp-production-type-selected">' + icon('circle-check') + ' Selected</span>';
        html += '</button>';
      }
      html += '</div></div>';

      // Production handoff panel for the selected type
      html += renderProductionHandoff(recipe);
    }

    // Production / delivery notes (kept from before — used by reviewer)
    html += '<div class="cp-card" style="margin-top:var(--cp-space-3)">';
    html += '<div class="cp-section-header"><h3>' + icon('clipboard-list') + ' Production Notes</h3>';
    html += '<span class="cp-text-muted">Optional — passed along as context for the production team.</span></div>';
    html += '<textarea class="cp-textarea" data-action="save-production-notes" rows="3" placeholder="Anything the production team should know — references, constraints, tone reminders…">' + esc(recipe.production_notes || '') + '</textarea>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  // Renders the "production node is connected" card. Shown in place of the
  // media-type selector + handoff panel once a node exists for the recipe.
  function renderProductionExistsCard(recipe, prod) {
    var mediaTypes = (typeof Constants !== 'undefined' && Constants.MEDIA_TYPES) || {};
    var mtKey = prod.media_type || recipe.media_type || 'image';
    var mt = mediaTypes[mtKey] || mediaTypes.image || { color: '#1a73e8', icon: 'image', label: 'Production' };
    var statusStyle = getProductionStatusStyle(prod.status);

    var prodTitle = prod.title || recipe.title || 'Untitled production';
    var prodUrl   = prod.url || (prod.node_id ? '/node/' + prod.node_id : '');
    var editUrl   = prod.node_id ? '/node/' + prod.node_id + '/edit' : prodUrl;

    var html = '<div class="cp-card cp-production-exists-card" style="--mt-color:' + mt.color + '">';

    // Header strip
    html += '<div class="cp-production-exists-header">';
    html += '<div class="cp-production-exists-icon" style="background:' + mt.color + '15;color:' + mt.color + '">' + icon(mt.icon) + '</div>';
    html += '<div class="cp-production-exists-headings">';
    html += '<div class="cp-production-exists-eyebrow">' + icon('circle-check') + ' Production node connected</div>';
    if (prodUrl) {
      html += '<h3 class="cp-production-exists-title"><a href="' + esc(prodUrl) + '" target="_blank" rel="noopener">' + esc(prodTitle) + '</a></h3>';
    } else {
      html += '<h3 class="cp-production-exists-title">' + esc(prodTitle) + '</h3>';
    }
    html += '<div class="cp-production-exists-badges">';
    html += '<span class="cp-production-exists-type-badge" style="background:' + mt.color + '15;color:' + mt.color + '">' + icon(mt.icon) + ' ' + esc(mt.label) + '</span>';
    if (statusStyle.label || prod.status) {
      var statusText = statusStyle.label || prod.status;
      html += '<span class="cp-production-exists-status-badge" style="background:' + statusStyle.color + '15;color:' + statusStyle.color + ';border-color:' + statusStyle.color + '40">' + esc(statusText) + '</span>';
    }
    if (prod.node_id) {
      html += '<span class="cp-production-exists-id"><code>node/' + esc(prod.node_id) + '</code></span>';
    }
    html += '</div>';
    html += '</div>';
    html += '</div>';

    // Metadata grid
    var metaRows = [];
    if (prod.director) metaRows.push(['Director', esc(prod.director)]);
    if (prod.created)  metaRows.push(['Created', _formatProdDate(prod.created)]);
    if (prod.updated)  metaRows.push(['Last updated', _formatProdDate(prod.updated)]);
    if (metaRows.length) {
      html += '<div class="cp-production-exists-meta">';
      for (var i = 0; i < metaRows.length; i++) {
        html += '<div class="cp-production-exists-meta-row"><span class="cp-production-exists-meta-label">' + metaRows[i][0] + '</span><span class="cp-production-exists-meta-value">' + metaRows[i][1] + '</span></div>';
      }
      html += '</div>';
    }

    // Actions
    html += '<div class="cp-production-exists-actions">';
    if (editUrl) {
      html += '<a class="cp-btn cp-btn-primary cp-btn-lg" href="' + esc(editUrl) + '" target="_blank" rel="noopener">' + icon('external-link') + ' Open Production</a>';
    }
    html += '<button class="cp-btn cp-btn-outline" data-action="refresh-production">' + icon('refresh') + ' Refresh from page</button>';
    if (prodUrl && prodUrl !== editUrl) {
      html += '<a class="cp-btn cp-btn-outline" href="' + esc(prodUrl) + '" target="_blank" rel="noopener">' + icon('eye') + ' View</a>';
    }
    if (prodUrl) {
      html += '<button class="cp-btn cp-btn-outline" data-action="copy-production-url" data-url="' + esc(prodUrl) + '">' + icon('copy') + ' Copy URL</button>';
    }
    html += '</div>';

    // Lock note
    html += '<div class="cp-production-exists-lock-note">' + icon('lock') + ' Media type is locked while a production node exists for this recipe. To switch types, delete the production node in Drupal first.</div>';

    html += '</div>';
    return html;
  }

  function _formatProdDate(value) {
    if (!value) return '';
    var d = new Date(value);
    if (isNaN(d.getTime())) return esc(String(value));
    if (typeof window._cpFormatRelativeTime === 'function') {
      return window._cpFormatRelativeTime(d.toISOString());
    }
    return d.toLocaleDateString();
  }

  function renderProductionHandoff(recipe) {
    var mtKey = recipe.media_type || 'image';
    var mt = (Constants.MEDIA_TYPES || {})[mtKey] || Constants.MEDIA_TYPES.image;
    var url = buildProductionNodeAddUrl(recipe, mt);
    var brand = (S.brand && S.brand.identity) || {};
    var brandName = (S.brand && S.brand.core && S.brand.core.brand_name) || brand.name || '';
    var brandId = brand.id || '';
    var plannerHubId = getPlannerHubId();
    var plannerId = recipe.id;

    var html = '<div class="cp-card cp-production-handoff" style="margin-top:var(--cp-space-3);--mt-color:' + mt.color + '">';
    html += '<div class="cp-section-header"><h3 style="color:' + mt.color + '">' + icon(mt.icon) + ' ' + esc(mt.label) + ' Production</h3></div>';

    html += '<div class="cp-production-summary">';
    html += '<div class="cp-production-summary-row"><span class="cp-production-summary-label">Title</span><span class="cp-production-summary-value">' + esc(recipe.title || '(Untitled)') + '</span></div>';
    html += '<div class="cp-production-summary-row"><span class="cp-production-summary-label">Brand</span><span class="cp-production-summary-value">' + (brandName ? esc(brandName) : '<span class="cp-text-muted">(not detected)</span>') + (brandId ? ' <span class="cp-text-muted">(#' + esc(brandId) + ')</span>' : '') + '</span></div>';
    html += '<div class="cp-production-summary-row"><span class="cp-production-summary-label">Planner Hub</span><span class="cp-production-summary-value">' + (plannerHubId ? esc(plannerHubId) : '<span class="cp-text-muted">(not detected)</span>') + '</span></div>';
    html += '<div class="cp-production-summary-row"><span class="cp-production-summary-label">Planner ID</span><span class="cp-production-summary-value"><code>' + esc(plannerId) + '</code></span></div>';
    html += '</div>';

    // Validation warnings
    var warnings = [];
    if (!brandId) warnings.push('No brand ID detected from page (<code>.brand-id</code> inside <code>.brand-data</code>).');
    if (!plannerHubId) warnings.push('No planner hub ID detected. Production node will be created without the hub reference.');
    if (warnings.length > 0) {
      html += '<div class="cp-production-warning">' + icon('triangle-exclamation') + ' <div>';
      for (var wi = 0; wi < warnings.length; wi++) html += '<div>' + warnings[wi] + '</div>';
      html += '</div></div>';
    }

    // Open button
    html += '<div class="cp-production-actions">';
    html += '<a class="cp-btn cp-btn-primary cp-btn-lg cp-production-open-btn" href="' + esc(url) + '" target="_blank" rel="noopener">' + icon('external-link') + ' Create ' + esc(mt.label) + ' Production Node</a>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="copy-production-url" data-url="' + esc(url) + '">' + icon('copy') + ' Copy URL</button>';
    html += '</div>';

    // URL preview (collapsed)
    html += '<details class="cp-production-url-details">';
    html += '<summary>' + icon('link') + ' URL preview</summary>';
    html += '<code class="cp-production-url-preview">' + esc(url) + '</code>';
    html += '</details>';

    html += '</div>';
    return html;
  }

  function buildProductionNodeAddUrl(recipe, mt) {
    var origin = window.location.origin;
    var path = '/node/add/' + mt.node_type;
    var brand = (S.brand && S.brand.identity) || {};
    var brandId = brand.id || '';
    var plannerHubId = getPlannerHubId();
    var title = recipe.title || '';

    // Drupal nested-array query format: edit[field][widget][0][value|target_id]
    var params = [];
    if (title) params.push(_qpair('edit[title][widget][0][value]', title));
    if (brandId) params.push(_qpair('edit[field_brand][widget][0][target_id]', brandId));
    if (plannerHubId) params.push(_qpair('edit[field_planner_hub][widget][0][target_id]', plannerHubId));
    params.push(_qpair('edit[field_planner_id][widget][0][value]', recipe.id));

    return origin + path + (params.length ? '?' + params.join('&') : '');
  }

  function _qpair(key, val) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(val);
  }

  // Reads the current planner hub (campaign planner node) ID — the node we're
  // currently editing inside. We try several signals; first available wins.
  function getPlannerHubId() {
    // 1) Drupal data attribute on body (common in node-edit forms)
    var nid = $('body').attr('data-node-id') || $('body').attr('data-nid');
    if (nid) return String(nid).trim();

    // 2) Hidden Drupal field
    var $nid = $('input[name="nid"]').first();
    if ($nid.length && $nid.val()) return String($nid.val()).trim();

    // 3) Drupal settings (if exposed)
    if (window.drupalSettings && window.drupalSettings.path && window.drupalSettings.path.currentPath) {
      var m = String(window.drupalSettings.path.currentPath).match(/^node\/(\d+)/);
      if (m) return m[1];
    }

    // 4) Body class node-XXX
    var cls = $('body').attr('class') || '';
    var bm = cls.match(/\bnode-(\d+)\b/);
    if (bm) return bm[1];

    // 5) Page URL /node/123/edit or /node/123
    var um = String(window.location.pathname).match(/\/node\/(\d+)(\b|\/)/);
    if (um) return um[1];

    // 6) Configured in workspace meta
    if (S.meta && S.meta.workspace && S.meta.workspace.planner_hub_id) return String(S.meta.workspace.planner_hub_id);

    return '';
  }


/* ===== src/20-part2a/22-step-review.js ===== */
  // ============================================================
  // SECTION 15: REVIEW STEP RENDERER
  // ============================================================

  function renderReviewStep(recipe) {
    var html = '<div class="cp-step-review" data-recipe-id="' + esc(recipe.id) + '">';

    // Completion checklist
    html += '<div class="cp-card cp-review-checklist">';
    html += '<div class="cp-section-header"><h3>' + icon('clipboard-check') + ' Completion Checklist</h3></div>';

    var checks = buildCompletionChecks(recipe);
    var doneCount = checks.filter(function(c) { return c.done; }).length;
    var totalChecks = checks.length;

    html += progressBar(Math.round(doneCount / totalChecks * 100), doneCount === totalChecks ? 'var(--cp-success)' : 'var(--cp-primary)');
    html += '<span class="cp-text-muted" style="display:block;margin:6px 0 12px">' + doneCount + ' of ' + totalChecks + ' complete</span>';

    for (var ci = 0; ci < checks.length; ci++) {
      var chk = checks[ci];
      html += '<div class="cp-review-check-item">';
      html += '<div class="cp-review-check-icon' + (chk.done ? ' cp-review-check-done' : ' cp-review-check-pending') + '">' + (chk.done ? icon('check') : '') + '</div>';
      html += '<span style="flex:1;font-size:var(--cp-font-size-sm);' + (chk.done ? 'color:var(--cp-success)' : '') + '">' + esc(chk.label) + '</span>';
      if (chk.action) html += '<button class="cp-btn-link cp-btn-sm" data-action="go-step" data-step="' + esc(chk.step) + '">' + icon('arrow-right') + ' Go</button>';
      html += '</div>';
    }
    html += '</div>';

    // Status management
    html += '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('signal') + ' Status</h3></div>';
    html += '<div style="margin-bottom:12px">';
    html += '<span class="cp-text-muted">Current: </span>' + recipeStatusBadge(recipe.status);
    html += '</div>';

    var stIdx = Constants.STATUS_ORDER.indexOf(recipe.status);
    // Manual status actions
    html += '<div class="cp-review-actions">';
    if (stIdx < Constants.STATUS_ORDER.indexOf('in_review') && stIdx >= Constants.STATUS_ORDER.indexOf('media_ready')) {
      html += '<button class="cp-btn cp-btn-primary" data-action="set-recipe-status" data-status="in_review">' + icon('magnifying-glass') + ' Submit for Review</button>';
    }
    if (recipe.status === 'in_review') {
      html += '<button class="cp-btn cp-btn-primary" data-action="set-recipe-status" data-status="approved">' + icon('circle-check') + ' Approve</button>';
      html += '<button class="cp-btn cp-btn-outline" data-action="set-recipe-status" data-status="content_ready">' + icon('arrow-left') + ' Request Changes</button>';
    }
    if (recipe.status === 'approved') {
      html += '<button class="cp-btn cp-btn-primary" data-action="set-recipe-status" data-status="live">' + icon('signal') + ' Mark as Live</button>';
    }
    if (recipe.status === 'live') {
      html += '<button class="cp-btn cp-btn-outline" data-action="set-recipe-status" data-status="paused">' + icon('pause') + ' Pause</button>';
    }
    if (recipe.status === 'paused') {
      html += '<button class="cp-btn cp-btn-primary" data-action="set-recipe-status" data-status="live">' + icon('signal') + ' Resume</button>';
    }
    if (recipe.status !== 'archived') {
      html += '<button class="cp-btn cp-btn-outline cp-btn-danger" data-action="set-recipe-status" data-status="archived">' + icon('box-archive') + ' Archive</button>';
    }
    html += '</div></div>';

    // Review notes
    html += '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('file-text') + ' Review Notes</h3></div>';
    html += '<textarea class="cp-textarea" data-action="save-review-notes" rows="3" placeholder="Feedback, approval notes, change requests...">' + esc(recipe.review_notes || '') + '</textarea>';
    html += '</div>';

    // Production notes
    html += '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('clipboard-list') + ' Production Notes</h3></div>';
    html += '<textarea class="cp-textarea" data-action="save-production-notes" rows="2" placeholder="Instructions for production team...">' + esc(recipe.production_notes || '') + '</textarea>';
    html += '</div>';

    // Export actions
    html += '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('share-nodes') + ' Export & Share</h3></div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:var(--cp-space-2)">';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="copy-recipe-content" data-recipe-id="' + esc(recipe.id) + '">' + icon('copy') + ' Copy Ad Copy</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="copy-recipe-brief" data-recipe-id="' + esc(recipe.id) + '">' + icon('clipboard') + ' Copy Creative Brief</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="export-recipe-json" data-recipe-id="' + esc(recipe.id) + '">' + icon('download') + ' Export JSON</button>';
    html += '</div></div>';

    html += '</div>';
    return html;
  }

  function buildCompletionChecks(recipe) {
    var content = recipe.content || {};
    var hook = recipe.hook || {};
    var effectiveHook = getEffectiveHook(recipe);
    var adCopyText = stripHtml(content.ad_copy || '');

    var checks = [
      { label: 'Persona assigned', done: !!recipe.persona_id, step: 'composition', action: true },
      { label: 'Message angle assigned', done: !!recipe.message_id, step: 'composition', action: true },
      { label: 'Hook selected or written', done: !!effectiveHook, step: 'hook', action: true },
      { label: 'Ad copy written (50+ chars)', done: adCopyText.trim().length >= 50, step: 'content', action: true },
      { label: 'Headline written', done: !!(content.headline && content.headline.trim()), step: 'content', action: true },
      { label: 'CTA defined', done: !!(content.cta && content.cta.trim()), step: 'content', action: true },
      { label: 'Media type selected for production', done: !!recipe.media_type, step: 'media', action: true }
    ];

    // Optional refinement checks (secondary)
    if (recipe.style_id) checks.push({ label: 'Style selected (optional)', done: true, step: 'composition', action: true });
    if (recipe.visual_format_id) checks.push({ label: 'Visual format selected (optional)', done: true, step: 'composition', action: true });

    return checks;
  }


/* ===== src/20-part2a/23-recipe-ai-action-bar.js ===== */
  // ============================================================
  // SECTION 15.5: RECIPE AI ACTION BAR (Expandable Picker)
  // ============================================================

  function renderRecipeAIBar(actionId, recipeId, label, iconName) {
    iconName = iconName || 'sparkles';
    var panelId = actionId.replace(/[^a-zA-Z0-9]/g, '_') + '_' + recipeId.substring(0, 6);
    var html = '<div class="cp-ai-action-bar" data-panel-id="' + esc(panelId) + '">';
    html += '<button class="cp-btn cp-btn-ai cp-btn-sm" data-action="expand-ai-action" data-panel-id="' + esc(panelId) + '">' + icon(iconName) + ' ' + esc(label) + '</button>';

    // Expandable panel (hidden by default)
    html += '<div class="cp-ai-action-expanded" id="cpAIPanel_' + esc(panelId) + '" style="display:none">';
    html += '<div class="cp-ai-action-row">';
    // AI Picker
    html += '<div class="cp-ai-action-picker">';
    html += (window._cpAiSel ? window._cpAiSel(actionId) : '');
    html += '</div>';
    html += '</div>';
    // Custom instructions
    html += '<div class="cp-form-group" style="margin:var(--cp-space-2) 0">';
    html += '<textarea class="cp-textarea cp-ai-custom-instructions" data-panel-id="' + esc(panelId) + '" rows="2" placeholder="Custom instructions for this AI action (optional)..."></textarea>';
    html += '</div>';
    // Generate button
    html += '<div class="cp-ai-action-footer">';
    html += '<button class="cp-btn cp-btn-ai cp-btn-sm" data-action="' + esc(actionId) + '" data-recipe-id="' + esc(recipeId) + '" data-panel-id="' + esc(panelId) + '">' + icon('sparkles') + ' Generate</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="collapse-ai-action" data-panel-id="' + esc(panelId) + '">Cancel</button>';
    html += '</div></div>';
    html += '</div>';
    return html;
  }


/* ===== src/20-part2a/24-save-helpers.js ===== */
  // ============================================================
  // SECTION 16: SAVE HELPERS (Pipeline-specific)
  // ============================================================

  function getSelectedRecipe() {
    return S.selectedRecipeId ? S.recipeMap[S.selectedRecipeId] : null;
  }

  function saveRecipeSimpleField(recipeId, field, value) {
    saveEntityField('recipe', recipeId, field, value);
  }

  function saveContentField(cfield, value) {
    var recipe = getSelectedRecipe();
    if (!recipe) return;
    recipe.content = recipe.content || {};
    recipe.content[cfield] = value;
    recipe.updated = new Date().toISOString();
    syncToTextarea();
    if (maybeAdvanceRecipeStatus) maybeAdvanceRecipeStatus(recipe, 'content updated');
    buildMaps();
  }

  function saveBriefField(bfield, value) {
    var recipe = getSelectedRecipe();
    if (!recipe) return;
    recipe.image_brief = recipe.image_brief || {};
    recipe.image_brief[bfield] = value;
    recipe.updated = new Date().toISOString();
    syncToTextarea();
    if (maybeAdvanceRecipeStatus) maybeAdvanceRecipeStatus(recipe, 'brief updated');
    buildMaps();
  }

  function savePromptParam(param, value) {
    var recipe = getSelectedRecipe();
    if (!recipe) return;
    recipe.image_brief = recipe.image_brief || {};
    recipe.image_brief.prompt_params = recipe.image_brief.prompt_params || {};
    recipe.image_brief.prompt_params[param] = value;
    recipe.updated = new Date().toISOString();
    syncToTextarea();
  }

  function saveVideoField(vfield, value) {
    var recipe = getSelectedRecipe();
    if (!recipe) return;
    recipe.video = recipe.video || {};
    recipe.video[vfield] = value;
    recipe.updated = new Date().toISOString();
    syncToTextarea();
    if (maybeAdvanceRecipeStatus) maybeAdvanceRecipeStatus(recipe, 'video updated');
    buildMaps();
  }

  function saveSceneField(sceneIndex, sfield, value) {
    var recipe = getSelectedRecipe();
    if (!recipe) return;
    recipe.video = recipe.video || {};
    recipe.video.blueprint = recipe.video.blueprint || {};
    recipe.video.blueprint.scenes = recipe.video.blueprint.scenes || [];
    var scene = recipe.video.blueprint.scenes[sceneIndex];
    if (!scene) return;
    scene[sfield] = value;
    recipe.updated = new Date().toISOString();
    syncToTextarea();
    if (maybeAdvanceRecipeStatus) maybeAdvanceRecipeStatus(recipe, 'scene updated');
    buildMaps();
  }

  function addScene() {
    var recipe = getSelectedRecipe();
    if (!recipe) return;
    recipe.video = recipe.video || {};
    recipe.video.blueprint = recipe.video.blueprint || {};
    recipe.video.blueprint.scenes = recipe.video.blueprint.scenes || [];
    var idx = recipe.video.blueprint.scenes.length;
    recipe.video.blueprint.scenes.push({ name: 'Scene ' + (idx + 1), description: '', timestamp: '', duration: '' });
    recipe.updated = new Date().toISOString();
    snapshot('Add scene');
    buildMaps(); syncToTextarea(); render();
  }

  function deleteScene(sceneIndex) {
    var recipe = getSelectedRecipe();
    if (!recipe || !recipe.video || !recipe.video.blueprint) return;
    recipe.video.blueprint.scenes.splice(sceneIndex, 1);
    recipe.updated = new Date().toISOString();
    snapshot('Delete scene');
    buildMaps(); syncToTextarea(); render();
  }

  function saveScriptField(rowIndex, srfield, value) {
    var recipe = getSelectedRecipe();
    if (!recipe) return;
    recipe.video = recipe.video || {};
    recipe.video.script = recipe.video.script || {};
    recipe.video.script.rows = recipe.video.script.rows || [];
    var row = recipe.video.script.rows[rowIndex];
    if (!row) return;
    row[srfield] = value;
    recipe.updated = new Date().toISOString();
    syncToTextarea();
  }

  function addScriptRow() {
    var recipe = getSelectedRecipe();
    if (!recipe) return;
    recipe.video = recipe.video || {};
    recipe.video.script = recipe.video.script || {};
    recipe.video.script.rows = recipe.video.script.rows || [];
    recipe.video.script.rows.push({ time: '', dialogue: '', visual: '', camera: '', audio: '' });
    recipe.updated = new Date().toISOString();
    snapshot('Add script row');
    buildMaps(); syncToTextarea(); render();
  }

  function addVariant() {
    var recipe = getSelectedRecipe();
    if (!recipe) return;
    recipe.content = recipe.content || {};
    recipe.content.variants = recipe.content.variants || [];
    recipe.content.variants.push({ text: '', label: 'Variant ' + (recipe.content.variants.length + 1) });
    recipe.updated = new Date().toISOString();
    snapshot('Add variant');
    buildMaps(); syncToTextarea(); render();
  }

  function removeVariant(idx) {
    var recipe = getSelectedRecipe();
    if (!recipe || !recipe.content) return;
    recipe.content.variants = recipe.content.variants || [];
    recipe.content.variants.splice(idx, 1);
    recipe.updated = new Date().toISOString();
    snapshot('Remove variant');
    buildMaps(); syncToTextarea(); render();
  }

  function setRecipeStatus(recipeId, status) {
    var recipe = getRecipe(recipeId);
    if (!recipe) return;
    var oldLabel = (Constants.RECIPE_STATUSES[recipe.status] || {}).label || recipe.status;
    var newLabel = (Constants.RECIPE_STATUSES[status] || {}).label || status;
    recipe.status = status;
    recipe.updated = new Date().toISOString();
    logActivity('recipe_status_changed', 'recipe', recipeId, recipe.title, oldLabel + ' → ' + newLabel);
    snapshot('Status change');
    buildMaps(); syncToTextarea(); render();
    toast('Status changed to ' + newLabel, 'success');
  }


/* ===== src/20-part2a/25-mix-match-engine.js ===== */
  // ============================================================
  // SECTION 17: MIX & MATCH ENGINE
  // ============================================================

  var mixerState = { mode: 'manual', selections: { persona: [], message: [], style: [], format: [] } };

  function openMixerModal(mode) {
    mixerState.mode = mode || 'manual';
    mixerState.selections = { persona: [], message: [], style: [], format: [] };

    var isManual = mixerState.mode === 'manual';
    var title = isManual ? 'Create Recipe' : 'Batch Generate Recipes';
    var titleIcon = isManual ? 'bolt' : 'shuffle';

    var html = '<div class="cp-mixer" data-mode="' + esc(mixerState.mode) + '">';

    // Mode description
    html += '<div style="margin-bottom:var(--cp-space-4)">';
    if (isManual) {
      html += '<p class="cp-text-muted">' + icon('info') + ' Select one from each dimension to create a single recipe.</p>';
    } else {
      html += '<p class="cp-text-muted">' + icon('info') + ' Select multiple from each dimension. All permutations will be generated as recipes.</p>';
    }
    html += '</div>';

    // Batch counter (batch mode only)
    if (!isManual) {
      html += '<div class="cp-mixer-batch-counter" id="cpMixerCounter" style="background:var(--cp-primary-light);margin-bottom:var(--cp-space-3)">';
      html += '<span class="cp-mixer-batch-count" id="cpMixerCountNum">0</span>';
      html += '<span class="cp-mixer-batch-label">recipes will be created</span>';
      html += '</div>';
    }

    // 4 columns
    html += '<div class="cp-mixer-columns">';
    var dimKeys = ['persona', 'message', 'style', 'format'];
    for (var di = 0; di < dimKeys.length; di++) {
      html += renderMixerColumn(dimKeys[di], isManual);
    }
    html += '</div>';

    // Warning zone for batch
    if (!isManual) {
      html += '<div id="cpMixerWarning" style="display:none"></div>';
    }

    html += '</div>';

    openModal(title, html, {
      titleIcon: titleIcon,
      size: 'xl',
      saveLabel: isManual ? icon('plus') + ' Create Recipe' : icon('shuffle') + ' Generate All',
      ai: !isManual,
      onSave: function() {
        if (isManual) {
          createRecipeFromMixer();
        } else {
          batchGenerateRecipes();
        }
      }
    });

    // Wire up mixer events after modal renders
    setTimeout(setupMixerEvents, 50);
  }

  function renderMixerColumn(dimKey, isManual) {
    var dim = Constants.DIMENSIONS[dimKey];
    var items = [];
    if (dimKey === 'persona') items = getAllPersonas();
    else if (dimKey === 'message') items = getAllMessages();
    else if (dimKey === 'style') items = getAllStyles();
    else if (dimKey === 'format') items = getAllFormats();

    var html = '<div class="cp-mixer-column" data-dim="' + dimKey + '">';
    html += '<div class="cp-mixer-column-header" style="background:' + dim.color + '10">';
    html += '<span class="cp-mixer-column-icon" style="color:' + dim.color + '">' + icon(dim.icon) + '</span>';
    html += '<span class="cp-mixer-column-title">' + esc(dim.label) + '</span>';
    html += '<span class="cp-mixer-column-count cp-nav-badge">' + items.length + '</span>';
    html += '</div>';

    html += '<div class="cp-mixer-list">';
    if (items.length === 0) {
      html += '<div class="cp-empty-state cp-empty-state--compact"><p>No ' + esc(dim.label.toLowerCase()) + 's yet.</p>';
      html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="new-' + dimKey + '">' + icon('plus') + ' Create</button></div>';
    } else {
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var iname = item.name || item.title || 'Untitled';
        var sub = getEntitySubtext(dimKey, item);
        var inputType = isManual ? 'radio' : 'checkbox';

        html += '<label class="cp-mixer-item" data-id="' + esc(item.id) + '" data-dim="' + dimKey + '">';
        html += '<input type="' + inputType + '" name="mixer_' + dimKey + '" value="' + esc(item.id) + '" class="cp-mixer-input" data-dim="' + dimKey + '" style="margin:3px 0 0;flex-shrink:0;cursor:pointer">';
        html += '<div style="flex:1;min-width:0">';
        html += '<div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(iname) + '</div>';
        if (sub) html += '<div style="font-size:11px;color:var(--cp-text-muted);margin-top:1px">' + esc(sub) + '</div>';
        html += '</div></label>';
      }
    }
    html += '</div></div>';
    return html;
  }

  function setupMixerEvents() {
    // Manual mode: radio selection highlight
    $('.cp-mixer-input[type="radio"]').off('change.mixer').on('change.mixer', function() {
      var dim = $(this).data('dim');
      $('.cp-mixer-item[data-dim="' + dim + '"]').removeClass('cp-mixer-item-selected');
      $(this).closest('.cp-mixer-item').addClass('cp-mixer-item-selected');
      mixerState.selections[dim] = [$(this).val()];
    });

    // Batch mode: checkbox selection + permutation counter
    $('.cp-mixer-input[type="checkbox"]').off('change.mixer').on('change.mixer', function() {
      var dim = $(this).data('dim');
      $(this).closest('.cp-mixer-item').toggleClass('cp-mixer-item-selected', this.checked);
      // Rebuild selection array
      mixerState.selections[dim] = [];
      $('.cp-mixer-input[data-dim="' + dim + '"]:checked').each(function() {
        mixerState.selections[dim].push($(this).val());
      });
      updatePermutationCount();
    });
  }

  function updatePermutationCount() {
    var sel = mixerState.selections;
    var counts = [
      Math.max(sel.persona.length, 0),
      Math.max(sel.message.length, 0),
      Math.max(sel.style.length, 0),
      Math.max(sel.format.length, 0)
    ];
    // Only count dimensions with selections; empty dims = 1 (will be left blank)
    var total = 1;
    var hasSel = false;
    for (var i = 0; i < counts.length; i++) {
      if (counts[i] > 0) { total *= counts[i]; hasSel = true; }
    }
    if (!hasSel) total = 0;

    $('#cpMixerCountNum').text(total);

    var $warn = $('#cpMixerWarning');
    if (total > 50) {
      $warn.show().html('<div class="cp-mixer-warning">' + icon('warning') + ' <strong>' + total + ' recipes</strong> is a lot! Consider narrowing your selection. Max 100 per batch.</div>');
    } else if (total > 20) {
      $warn.show().html('<div class="cp-mixer-warning" style="background:var(--cp-accent-light);border-color:rgba(227,116,0,0.2);color:#92400e">' + icon('circle-info') + ' ' + total + ' recipes will be generated.</div>');
    } else {
      $warn.hide();
    }
  }

  function createRecipeFromMixer() {
    var sel = mixerState.selections;
    var personaId = (sel.persona && sel.persona[0]) || '';
    var messageId = (sel.message && sel.message[0]) || '';
    var styleId = (sel.style && sel.style[0]) || '';
    var formatId = (sel.format && sel.format[0]) || '';

    if (!personaId && !messageId && !styleId && !formatId) {
      toast('Select at least one dimension', 'warning');
      return;
    }

    snapshot('Create recipe (mixer)');
    var newRecipe = createEntity('recipe', {
      persona_id: personaId, message_id: messageId,
      style_id: styleId, visual_format_id: formatId,
      campaign_id: S._pendingCampaignId || ''
    });

    if (newRecipe) {
      S.selectedRecipeId = newRecipe.id;
      S.currentStep = 'composition';
      S._pendingCampaignId = null;
      closeModal();
      navigate('recipes');
      toast('Recipe created', 'success');
    }
  }

  function batchGenerateRecipes() {
    var sel = mixerState.selections;
    var personas = sel.persona.length > 0 ? sel.persona : [''];
    var messages = sel.message.length > 0 ? sel.message : [''];
    var styles = sel.style.length > 0 ? sel.style : [''];
    var formats = sel.format.length > 0 ? sel.format : [''];

    var total = personas.length * messages.length * styles.length * formats.length;
    if (total === 0) { toast('Select at least one item from any dimension', 'warning'); return; }
    if (total > 100) { toast('Maximum 100 recipes per batch. Narrow your selection.', 'error'); return; }

    snapshot('Batch generate ' + total + ' recipes');
    var batchId = generateId('batch');
    var count = 0;

    for (var pi = 0; pi < personas.length; pi++) {
      for (var mi = 0; mi < messages.length; mi++) {
        for (var si = 0; si < styles.length; si++) {
          for (var fi = 0; fi < formats.length; fi++) {
            createEntity('recipe', {
              persona_id: personas[pi], message_id: messages[mi],
              style_id: styles[si], visual_format_id: formats[fi],
              batch_id: batchId, campaign_id: S._pendingCampaignId || ''
            });
            count++;
          }
        }
      }
    }

    logActivity('recipe_batch_generated', 'recipe', batchId, '', 'Batch generated ' + count + ' recipes');
    S._pendingCampaignId = null;
    closeModal();
    navigate('recipes');
    toast(count + ' recipes generated', 'success', 5000);
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

  function setupPart2AEvents() {
    console.log('[CP] Setting up Part 2A event handlers...');

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

    // --- Campaign CRUD ---
    $(document).off('click.cp2a-new-camp').on('click.cp2a-new-camp', '[data-action="new-campaign"]', function(e) {
      e.preventDefault(); openCampaignModal();
    });
    $(document).off('click.cp2a-edit-camp').on('click.cp2a-edit-camp', '[data-action="edit-campaign"]', function(e) {
      e.preventDefault(); e.stopPropagation(); openCampaignModal($(this).data('id'));
    });
    $(document).off('click.cp2a-delete-camp').on('click.cp2a-delete-camp', '[data-action="delete-campaign"]', function(e) {
      e.preventDefault(); e.stopPropagation(); confirmDeleteCampaign($(this).data('id'));
    });
    $(document).off('click.cp2a-select-camp').on('click.cp2a-select-camp', '[data-action="select-campaign"]', function(e) {
      e.preventDefault();
      S.selectedCampaignId = $(this).data('id');
      render();
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

    // --- Recipe delete ---
    $(document).off('click.cp2a-delete-recipe').on('click.cp2a-delete-recipe', '[data-action="delete-recipe"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      var r = getRecipe(id);
      if (!r) return;
      openConfirmDialog({
        title: 'Delete Recipe',
        message: 'Delete "' + (r.title || 'Untitled') + '"?',
        confirmLabel: 'Delete', danger: true,
        onConfirm: function() {
          snapshot('Delete recipe'); deleteEntity('recipe', id);
          if (S.selectedRecipeId === id) { S.selectedRecipeId = null; S.currentStep = null; }
        }
      });
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

    // --- Pipeline Step Events ---

    // Change dimension (opens picker modal)
    $(document).off('click.cp2a-change-dim').on('click.cp2a-change-dim', '[data-action="change-dimension"]', function(e) {
      e.preventDefault();
      var dim = $(this).data('dim');
      var recipeId = $(this).data('recipe-id') || (getSelectedRecipe() ? getSelectedRecipe().id : '');
      if (dim && recipeId) openDimensionPicker(dim, recipeId);
    });

    // Set media type
    $(document).off('click.cp2a-media-type').on('click.cp2a-media-type', '[data-action="set-media-type"]', function(e) {
      e.preventDefault();
      var type = $(this).data('type');
      var recipe = getSelectedRecipe();
      if (!recipe || !type) return;
      // Guard: media type is locked once a production node exists for the recipe.
      if (typeof getRecipeProduction === 'function' && getRecipeProduction(recipe)) {
        toast('Media type is locked — a production node exists for this recipe', 'warning');
        return;
      }
      saveEntityField('recipe', recipe.id, 'media_type', type);
      snapshot('Change media type');
    });

    // Refresh production data from the page (re-parse view-media-productions
    // block, then re-render). Used by the "Refresh from page" button on the
    // production-exists card.
    $(document).off('click.cp2a-refresh-prod').on('click.cp2a-refresh-prod', '[data-action="refresh-production"]', function(e) {
      e.preventDefault();
      if (typeof parseProductionData !== 'function') { toast('Refresh unavailable', 'warning'); return; }
      parseProductionData();
      toast('Production data refreshed', 'success');
      if (typeof window._cpRender === 'function') window._cpRender();
    });

    // Save recipe title
    $(document).off('blur.cp2a-recipe-title').on('blur.cp2a-recipe-title', '[data-action="save-recipe-title"]', function() {
      var recipe = getSelectedRecipe();
      if (recipe) saveEntityField('recipe', recipe.id, 'title', $(this).val() || '');
    });

    // Save recipe simple fields (priority, campaign, due_date)
    $(document).off('change.cp2a-recipe-field').on('change.cp2a-recipe-field', '[data-action="save-recipe-field"]', function() {
      var recipe = getSelectedRecipe();
      var field = $(this).data('rfield');
      if (recipe && field) saveEntityField('recipe', recipe.id, field, $(this).val() || '');
    });

    // Toggle recipe pain point
    $(document).off('change.cp2a-recipe-pp').on('change.cp2a-recipe-pp', '[data-action="toggle-recipe-pp"]', function() {
      var recipe = getSelectedRecipe();
      if (!recipe) return;
      var ppId = $(this).data('pp-id');
      var pps = recipe.selected_pain_point_ids || [];
      if (this.checked) { if (pps.indexOf(ppId) === -1) pps.push(ppId); }
      else { pps = pps.filter(function(id) { return id !== ppId; }); }
      saveEntityField('recipe', recipe.id, 'selected_pain_point_ids', pps);
      $(this).closest('.cp-pain-point-picker-item').toggleClass('cp-pain-point-picker-item-selected', this.checked);
    });

    // Composition pain point filter + scope toggle (in-step picker)
    $(document).off('input.cp2a-comp-pain-search').on('input.cp2a-comp-pain-search', '#cpRecipePainSearch', _cpDebouncePainSearch);
    $(document).off('change.cp2a-comp-pain-cat').on('change.cp2a-comp-pain-cat', '#cpRecipePainCategory', function() {
      S._compPainFilter = S._compPainFilter || {};
      S._compPainFilter.category = $(this).val() || '';
      render();
    });
    $(document).off('click.cp2a-comp-pain-scope').on('click.cp2a-comp-pain-scope', '[data-action="set-pain-scope"]', function(e) {
      e.preventDefault();
      S._compPainFilter = S._compPainFilter || {};
      S._compPainFilter.scope = $(this).data('scope') || 'persona';
      render();
    });

    // Hook selection (radio)
    $(document).off('change.cp2a-select-hook').on('change.cp2a-select-hook', '[data-action="select-hook"]', function() {
      var recipe = getSelectedRecipe();
      if (!recipe) return;
      recipe.hook = recipe.hook || {};
      recipe.hook.selected_hook_id = $(this).val() || '';
      recipe.updated = new Date().toISOString();
      syncToTextarea();
      if (maybeAdvanceRecipeStatus) maybeAdvanceRecipeStatus(recipe, 'hook selected');
      buildMaps(); render();
    });

    // Save custom hook
    $(document).off('blur.cp2a-hook-custom').on('blur.cp2a-hook-custom', '[data-action="save-recipe-hook-custom"]', function() {
      var recipe = getSelectedRecipe();
      if (!recipe) return;
      recipe.hook = recipe.hook || {};
      recipe.hook.custom_hook = $(this).val() || '';
      recipe.updated = new Date().toISOString();
      syncToTextarea();
      if (maybeAdvanceRecipeStatus) maybeAdvanceRecipeStatus(recipe, 'custom hook written');
      buildMaps();
    });

    // Save hook type
    $(document).off('change.cp2a-hook-type').on('change.cp2a-hook-type', '[data-action="save-recipe-hook-type"]', function() {
      var recipe = getSelectedRecipe();
      if (!recipe) return;
      recipe.hook = recipe.hook || {};
      recipe.hook.hook_type = $(this).val() || '';
      recipe.updated = new Date().toISOString();
      syncToTextarea();
    });

    // Save content fields (headline, description, cta, notes)
    $(document).off('blur.cp2a-content-field').on('blur.cp2a-content-field', '[data-action="save-content-field"]', function() {
      var field = $(this).data('cfield');
      if (field) saveContentField(field, $(this).val() || '');
    });

    // Save brief fields
    $(document).off('blur.cp2a-brief-field').on('blur.cp2a-brief-field', '[data-action="save-brief-field"]', function() {
      var field = $(this).data('bfield');
      if (field) saveBriefField(field, $(this).val() || '');
    });

    // Save prompt params
    $(document).off('change.cp2a-prompt-param blur.cp2a-prompt-param').on('change.cp2a-prompt-param blur.cp2a-prompt-param', '[data-action="save-prompt-param"]', function() {
      var param = $(this).data('param');
      if (param) savePromptParam(param, $(this).val() || '');
    });

    // Save video fields
    $(document).off('change.cp2a-video-field blur.cp2a-video-field').on('change.cp2a-video-field blur.cp2a-video-field', '[data-action="save-video-field"]', function() {
      var field = $(this).data('vfield');
      if (field) saveVideoField(field, $(this).val() || '');
    });

    // Save scene fields
    $(document).off('blur.cp2a-scene-field').on('blur.cp2a-scene-field', '[data-action="save-scene-field"]', function() {
      var idx = parseInt($(this).data('scene-index'), 10);
      var field = $(this).data('sfield');
      if (!isNaN(idx) && field) saveSceneField(idx, field, $(this).val() || '');
    });

    // Add/delete scene
    $(document).off('click.cp2a-add-scene').on('click.cp2a-add-scene', '[data-action="add-scene"]', function(e) { e.preventDefault(); addScene(); });
    $(document).off('click.cp2a-del-scene').on('click.cp2a-del-scene', '[data-action="delete-scene"]', function(e) {
      e.preventDefault();
      deleteScene(parseInt($(this).data('scene-index'), 10));
    });

    // Save script fields
    $(document).off('blur.cp2a-script-field').on('blur.cp2a-script-field', '[data-action="save-script-field"]', function() {
      var idx = parseInt($(this).data('row-index'), 10);
      var field = $(this).data('srfield');
      if (!isNaN(idx) && field) saveScriptField(idx, field, $(this).val() || '');
    });

    // Add script row
    $(document).off('click.cp2a-add-script-row').on('click.cp2a-add-script-row', '[data-action="add-script-row"]', function(e) { e.preventDefault(); addScriptRow(); });

    // Add/remove variants
    $(document).off('click.cp2a-add-variant').on('click.cp2a-add-variant', '[data-action="add-variant"]', function(e) { e.preventDefault(); addVariant(); });
    $(document).off('click.cp2a-rm-variant').on('click.cp2a-rm-variant', '[data-action="remove-variant"]', function(e) {
      e.preventDefault(); removeVariant(parseInt($(this).data('variant-index'), 10));
    });

    // Save variant text
    $(document).off('blur.cp2a-save-variant').on('blur.cp2a-save-variant', '[data-action="save-variant"]', function() {
      var recipe = getSelectedRecipe();
      if (!recipe) return;
      var idx = parseInt($(this).data('variant-index'), 10);
      recipe.content = recipe.content || {};
      recipe.content.variants = recipe.content.variants || [];
      if (recipe.content.variants[idx]) {
        recipe.content.variants[idx].text = $(this).val() || '';
        recipe.updated = new Date().toISOString();
        syncToTextarea();
      }
    });

    // Set recipe status (review step)
    $(document).off('click.cp2a-set-status').on('click.cp2a-set-status', '[data-action="set-recipe-status"]', function(e) {
      e.preventDefault();
      var status = $(this).data('status');
      var recipe = getSelectedRecipe();
      if (recipe && status) setRecipeStatus(recipe.id, status);
    });

    // Save review notes
    $(document).off('blur.cp2a-review-notes').on('blur.cp2a-review-notes', '[data-action="save-review-notes"]', function() {
      var recipe = getSelectedRecipe();
      if (recipe) saveEntityField('recipe', recipe.id, 'review_notes', $(this).val() || '');
    });

    // Save production notes
    $(document).off('blur.cp2a-prod-notes').on('blur.cp2a-prod-notes', '[data-action="save-production-notes"]', function() {
      var recipe = getSelectedRecipe();
      if (recipe) saveEntityField('recipe', recipe.id, 'production_notes', $(this).val() || '');
    });

    // Copy production handoff URL to clipboard
    $(document).off('click.cp2a-copy-prod-url').on('click.cp2a-copy-prod-url', '[data-action="copy-production-url"]', function(e) {
      e.preventDefault();
      var url = $(this).data('url') || '';
      if (!url) { toast('No production URL available', 'warning'); return; }
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function() { toast('Production URL copied', 'success'); });
        } else {
          var ta = document.createElement('textarea');
          ta.value = url; document.body.appendChild(ta); ta.select();
          document.execCommand('copy'); document.body.removeChild(ta);
          toast('Production URL copied', 'success');
        }
      } catch(ex) { toast('Copy failed: ' + ex.message, 'error'); }
    });

    // --- Mix & Match Engine ---
    $(document).off('click.cp2a-open-mixer').on('click.cp2a-open-mixer', '[data-action="open-mixer"]', function(e) {
      e.preventDefault();
      var mode = $(this).data('mode') || 'manual';
      openMixerModal(mode);
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
        visual_format: S.data.visual_formats, recipe: S.data.recipes, campaign: S.data.campaigns
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
        visual_format: S.data.visual_formats, recipe: S.data.recipes, campaign: S.data.campaigns
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

    // --- Campaign Wizard ---
    $(document).off('click.cp2a-open-wizard').on('click.cp2a-open-wizard', '[data-action="open-campaign-wizard"]', function(e) {
      e.preventDefault(); openCampaignWizard();
    });
    $(document).off('click.cp2a-wizard-next').on('click.cp2a-wizard-next', '[data-action="wizard-next"]', function(e) {
      e.preventDefault();
      collectWizardFields();
      if (wizardState.step === 1 && (!wizardState.data.name || !wizardState.data.name.trim())) { toast('Campaign name is required', 'warning'); return; }
      if (wizardState.step < 4) { wizardState.step++; renderWizardModal(); }
    });
    $(document).off('click.cp2a-wizard-prev').on('click.cp2a-wizard-prev', '[data-action="wizard-prev"]', function(e) {
      e.preventDefault();
      collectWizardFields();
      if (wizardState.step > 1) { wizardState.step--; renderWizardModal(); }
    });
    $(document).off('click.cp2a-wizard-step').on('click.cp2a-wizard-step', '[data-action="wizard-go-step"]', function(e) {
      e.preventDefault();
      collectWizardFields();
      var targetStep = parseInt($(this).data('step'), 10);
      if (targetStep <= wizardState.step || targetStep === wizardState.step + 1) {
        wizardState.step = targetStep;
        renderWizardModal();
      }
    });
    $(document).off('change.cp2a-wizard-dim').on('change.cp2a-wizard-dim', '[data-action="wizard-toggle-dim"]', function() {
      var dim = $(this).data('dim');
      var id = $(this).data('id');
      var sel = wizardState.selections[dim];
      if (!sel) return;
      var idx = sel.indexOf(id);
      if (this.checked && idx === -1) sel.push(id);
      else if (!this.checked && idx > -1) sel.splice(idx, 1);
      collectWizardFields();
      renderWizardModal();
    });
    $(document).off('click.cp2a-wizard-recipe').on('click.cp2a-wizard-recipe', '[data-action="wizard-toggle-recipe"]', function(e) {
      e.preventDefault();
      var ridx = parseInt($(this).data('ridx'), 10);
      if (wizardState.recipes[ridx]) {
        wizardState.recipes[ridx].selected = !wizardState.recipes[ridx].selected;
        renderWizardModal();
      }
    });
    $(document).off('click.cp2a-wizard-selall').on('click.cp2a-wizard-selall', '[data-action="wizard-select-all"]', function(e) {
      e.preventDefault();
      wizardState.allSelected = !wizardState.allSelected;
      wizardState.recipes.forEach(function(r) { r.selected = wizardState.allSelected; });
      renderWizardModal();
    });
    $(document).off('click.cp2a-wizard-create').on('click.cp2a-wizard-create', '[data-action="wizard-create"]', function(e) {
      e.preventDefault(); executeWizardCreate();
    });
    // Add recipe to campaign (from detail view) — pre-link to campaign
    $(document).off('click.cp2a-add-recipe-camp').on('click.cp2a-add-recipe-camp', '[data-action="add-recipe-to-campaign"]', function(e) {
      e.preventDefault();
      var campId = $(this).data('campaign-id');
      if (!campId) return;
      S._pendingCampaignId = campId;
      openMixerModal('manual');
    });

    // Quick create recipe from campaign (uses first available dimension from each)
    $(document).off('click.cp2a-camp-quick').on('click.cp2a-camp-quick', '[data-action="camp-quick-recipe"]', function(e) {
      e.preventDefault();
      var campId = $(this).data('campaign-id');
      var camp = getCampaign(campId);
      if (!camp) return;
      snapshot('Quick recipe from campaign');
      var newRecipe = createEntity('recipe', {
        persona_id: (camp.persona_ids || [])[0] || '',
        message_id: (camp.message_ids || [])[0] || '',
        style_id: (camp.style_ids || [])[0] || '',
        visual_format_id: (camp.format_ids || [])[0] || '',
        campaign_id: campId
      });
      if (newRecipe) {
        S.selectedRecipeId = newRecipe.id;
        S.currentStep = 'composition';
        navigate('recipes');
        toast('Recipe created — edit its dimensions in the Composition step', 'success');
      }
    });

    // Move recipe to a different campaign
    $(document).off('click.cp2a-move-recipe-camp').on('click.cp2a-move-recipe-camp', '[data-action="move-recipe-campaign"]', function(e) {
      e.preventDefault();
      var recipeId = $(this).data('id');
      var recipe = getRecipe(recipeId);
      if (!recipe) return;
      var camps = getAllCampaigns();
      var html = '<div class="cp-editor-form">';
      html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-3)">Select a campaign to assign this recipe to:</p>';
      html += '<label style="display:flex;align-items:center;gap:var(--cp-space-2);padding:var(--cp-space-2) 0;border-bottom:1px solid var(--cp-border-light);cursor:pointer">';
      html += '<input type="radio" name="cp-move-camp" value="" ' + (!recipe.campaign_id ? 'checked' : '') + '>';
      html += '<span style="color:var(--cp-text-muted)">No campaign (unassigned)</span></label>';
      for (var ci = 0; ci < camps.length; ci++) {
        var c = camps[ci];
        html += '<label style="display:flex;align-items:center;gap:var(--cp-space-2);padding:var(--cp-space-2) 0;border-bottom:1px solid var(--cp-border-light);cursor:pointer">';
        html += '<input type="radio" name="cp-move-camp" value="' + esc(c.id) + '" ' + (recipe.campaign_id === c.id ? 'checked' : '') + '>';
        html += '<span>' + icon('bullhorn') + ' ' + esc(c.name) + '</span></label>';
      }
      html += '</div>';
      openModal('Move Recipe to Campaign', html, {
        titleIcon: 'arrow-right-arrow-left', size: 'md',
        saveLabel: 'Move',
        onSave: function() {
          var newCampId = $('input[name="cp-move-camp"]:checked').val() || '';
          snapshot('Move recipe to campaign');
          saveEntityField('recipe', recipeId, 'campaign_id', newCampId);
          closeModal();
          toast(newCampId ? 'Recipe moved to ' + (S.campaignMap[newCampId] ? S.campaignMap[newCampId].name : 'campaign') : 'Recipe unassigned from campaign', 'success');
        }
      });
    });

    // Create recipe from coverage matrix cell (persona × message pre-set)
    $(document).off('click.cp2a-camp-combo').on('click.cp2a-camp-combo', '[data-action="camp-create-combo"]', function(e) {
      e.preventDefault();
      var campId = $(this).data('campaign-id');
      var personaId = $(this).data('persona-id');
      var messageId = $(this).data('message-id');
      var camp = getCampaign(campId);
      if (!camp) return;
      snapshot('Recipe from coverage matrix');
      var newRecipe = createEntity('recipe', {
        persona_id: personaId || '',
        message_id: messageId || '',
        style_id: (camp.style_ids || [])[0] || '',
        visual_format_id: (camp.format_ids || [])[0] || '',
        campaign_id: campId
      });
      if (newRecipe) {
        S.selectedRecipeId = newRecipe.id;
        S.currentStep = 'composition';
        navigate('recipes');
        toast('Recipe created from coverage matrix', 'success');
      }
    });

    // Manage campaign phases
    $(document).off('click.cp2a-camp-phases').on('click.cp2a-camp-phases', '[data-action="manage-campaign-phases"]', function(e) {
      e.preventDefault();
      var campId = $(this).data('campaign-id');
      var camp = getCampaign(campId);
      if (!camp) return;
      openCampaignPhasesModal(campId);
    });

    // --- Recipe Templates ---
    $(document).off('click.cp2a-save-template').on('click.cp2a-save-template', '[data-action="save-recipe-template"]', function(e) {
      e.preventDefault();
      var recipeId = $(this).data('recipe-id');
      var recipe = getRecipe(recipeId);
      if (!recipe) return;
      var pName = S.personaMap[recipe.persona_id] ? S.personaMap[recipe.persona_id].name : '';
      var mName = S.messageMap[recipe.message_id] ? S.messageMap[recipe.message_id].title : '';
      var sName = S.styleMap[recipe.style_id] ? S.styleMap[recipe.style_id].name : '';
      var fName = S.formatMap[recipe.visual_format_id] ? S.formatMap[recipe.visual_format_id].name : '';
      var defaultName = [pName, mName, sName, fName].filter(Boolean).join(' × ') || 'Recipe Template';

      var html = '<div class="cp-editor-form">';
      html += '<div class="cp-form-group"><label>Template Name</label>';
      html += '<input type="text" class="cp-input" data-field="name" value="' + esc(defaultName) + '"></div>';
      html += '<p class="cp-text-muted">Saves the recipe\'s composition (persona, message, style, format, media type) as a reusable template.</p>';
      html += '</div>';

      openModal('Save Recipe Template', html, {
        titleIcon: 'bookmark', size: 'md', saveLabel: 'Save Template',
        onSave: function() {
          var name = collectModalFields().name || defaultName;
          S.meta.recipe_templates = S.meta.recipe_templates || [];
          S.meta.recipe_templates.push({
            id: 'tpl_' + Date.now(),
            name: name,
            persona_id: recipe.persona_id || '',
            message_id: recipe.message_id || '',
            style_id: recipe.style_id || '',
            visual_format_id: recipe.visual_format_id || '',
            media_type: recipe.media_type || 'image',
            created: new Date().toISOString()
          });
          syncToTextarea();
          closeModal();
          toast('Template "' + name + '" saved', 'success');
        }
      });
    });

    $(document).off('click.cp2a-apply-template').on('click.cp2a-apply-template', '[data-action="apply-recipe-template"]', function(e) {
      e.preventDefault();
      var recipeId = $(this).data('recipe-id');
      var recipe = getRecipe(recipeId);
      if (!recipe) return;
      var templates = (S.meta && S.meta.recipe_templates) || [];
      if (templates.length === 0) { toast('No templates saved yet', 'info'); return; }

      var html = '<div class="cp-editor-form">';
      html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-3)">Apply a template to set this recipe\'s dimensions:</p>';
      for (var ti = 0; ti < templates.length; ti++) {
        var t = templates[ti];
        html += '<label style="display:flex;align-items:center;gap:var(--cp-space-2);padding:var(--cp-space-2) 0;border-bottom:1px solid var(--cp-border-light);cursor:pointer">';
        html += '<input type="radio" name="cp-tpl" value="' + ti + '"' + (ti === 0 ? ' checked' : '') + '>';
        html += '<div style="flex:1"><strong>' + esc(t.name) + '</strong>';
        html += '<div style="font-size:11px;color:var(--cp-text-muted)">';
        var parts = [];
        if (t.persona_id && S.personaMap[t.persona_id]) parts.push(S.personaMap[t.persona_id].name);
        if (t.message_id && S.messageMap[t.message_id]) parts.push(S.messageMap[t.message_id].title);
        if (t.style_id && S.styleMap[t.style_id]) parts.push(S.styleMap[t.style_id].name);
        if (t.visual_format_id && S.formatMap[t.visual_format_id]) parts.push(S.formatMap[t.visual_format_id].name);
        html += parts.join(' × ') + ' · ' + (t.media_type || 'image');
        html += '</div></div>';
        html += '<button class="cp-btn-icon cp-btn-xs" data-action="delete-template" data-tidx="' + ti + '" title="Delete">' + icon('trash') + '</button>';
        html += '</label>';
      }
      html += '</div>';

      openModal('Apply Template', html, {
        titleIcon: 'file-import', size: 'md', saveLabel: 'Apply',
        onSave: function() {
          var idx = parseInt($('input[name="cp-tpl"]:checked').val(), 10);
          var t = templates[idx];
          if (!t) return;
          snapshot('Apply recipe template');
          if (t.persona_id) saveEntityField('recipe', recipeId, 'persona_id', t.persona_id);
          if (t.message_id) saveEntityField('recipe', recipeId, 'message_id', t.message_id);
          if (t.style_id) saveEntityField('recipe', recipeId, 'style_id', t.style_id);
          if (t.visual_format_id) saveEntityField('recipe', recipeId, 'visual_format_id', t.visual_format_id);
          if (t.media_type) saveEntityField('recipe', recipeId, 'media_type', t.media_type);
          closeModal();
          toast('Template applied', 'success');
        }
      });
    });

    // Delete template (from within apply modal)
    $(document).off('click.cp2a-del-tpl').on('click.cp2a-del-tpl', '[data-action="delete-template"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var idx = parseInt($(this).data('tidx'), 10);
      S.meta.recipe_templates = S.meta.recipe_templates || [];
      if (S.meta.recipe_templates[idx]) {
        S.meta.recipe_templates.splice(idx, 1);
        syncToTextarea();
        toast('Template deleted', 'success');
        closeModal();
      }
    });

    // --- Duplicate recipe ---
    $(document).off('click.cp2a-dup-recipe').on('click.cp2a-dup-recipe', '[data-action="duplicate-recipe"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id') || (getSelectedRecipe() ? getSelectedRecipe().id : '');
      if (id) {
        snapshot('Duplicate recipe');
        var clone = duplicateEntity('recipe', id);
        if (clone) { S.selectedRecipeId = clone.id; S.currentStep = 'composition'; }
      }
    });

    // --- Setup Wizard ---
    $(document).off('click.cp2a-sw-open').on('click.cp2a-sw-open', '[data-action="open-setup-wizard"]', function(e) {
      e.preventDefault();
      var forceReset = $(this).data('force-reset') === true || $(this).data('forceReset') === true;
      openSetupWizard(forceReset);
    });
    $(document).off('click.cp2a-sw-close').on('click.cp2a-sw-close', '[data-action="sw-close"]', function(e) {
      e.preventDefault();
      swSaveSession();
      openConfirmDialog(
        'Close Setup Wizard?',
        'Your progress has been saved. You can resume from where you left off.',
        function() { $('.cp-setup-wizard').remove(); }
      );
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
      var step = setupWizardState.step;
      var listKey;
      if (step === 6) {
        // Step 6 hosts both styles and formats — distinguish by data-card-type
        listKey = $(this).data('card-type') === 'format' ? 'formats' : 'styles';
      } else {
        listKey = { 3: 'personas', 4: 'pain_points', 5: 'messages' }[step];
      }
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
    $(document).off('click.cp2a-sw-combo-toggle').on('click.cp2a-sw-combo-toggle', '[data-action="sw-combo-toggle"]', function(e) {
      e.preventDefault();
      var idx = parseInt($(this).data('idx'), 10);
      var combos = setupWizardState.combos;
      if (!combos || isNaN(idx) || !combos[idx]) return;
      combos[idx].selected = !combos[idx].selected;
      refreshSetupWizard();
    });
    $(document).off('click.cp2a-sw-regen-combos').on('click.cp2a-sw-regen-combos', '[data-action="sw-regen-combos"]', function(e) {
      e.preventDefault();
      _swAutoGenerateCombos();
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
    // Update wizard AI model dropdown when provider changes (Step 2)
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

    // --- Meta v2 actions (Campaign Workspace, Meta Campaigns list, modals) ---
    setupMetaV2EventHandlers();

    console.log('[CP] Part 2A event handlers ready');
  }

  function setupMetaV2EventHandlers() {
    // List view + workspace navigation
    $(document).off('click.cpv2-new-campaign').on('click.cpv2-new-campaign', '[data-action="new-campaign-v2"]', function(e) {
      e.preventDefault(); openMetaCampaignModal();
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
    $(document).off('click.cpv2-edit-ad').on('click.cpv2-edit-ad', '[data-action="edit-ad"]', function(e) {
      e.preventDefault(); e.stopPropagation(); openMetaAdModal($(this).data('id'));
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

    // Stub stage-4 AI buttons — wire to a real handler later, just toast for now
    $(document).off('click.cpv2-ai-tree').on('click.cpv2-ai-tree', '[data-action="ai-generate-campaign-tree"]', function(e) {
      e.preventDefault(); toast('AI Campaign Tree generator arrives in Stage 4', 'info');
    });
    $(document).off('click.cpv2-ai-sug-sets').on('click.cpv2-ai-sug-sets', '[data-action="ai-suggest-ad-sets"]', function(e) {
      e.preventDefault(); toast('AI Ad Set suggestions arrive in Stage 4', 'info');
    });
    $(document).off('click.cpv2-ai-sug-ads').on('click.cpv2-ai-sug-ads', '[data-action="ai-suggest-ads"]', function(e) {
      e.preventDefault(); toast('AI Ad suggestions arrive in Stage 4', 'info');
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

    // Campaign CRUD
    openCampaignModal: openCampaignModal, confirmDeleteCampaign: confirmDeleteCampaign,

    // Meta v2 CRUD
    openMetaCampaignModal: openMetaCampaignModal, confirmDeleteMetaCampaign: confirmDeleteMetaCampaign,
    openMetaAdSetModal: openMetaAdSetModal, confirmDeleteMetaAdSet: confirmDeleteMetaAdSet,
    openMetaAdModal: openMetaAdModal, confirmDeleteMetaAd: confirmDeleteMetaAd,
    buildPersonaSnapshot: buildPersonaSnapshot,

    // Tag CRUD
    openTagModal: openTagModal, confirmDeleteTag: confirmDeleteTag,

    // Render helpers (for Part 2B to use)
    renderHookEditRow: renderHookEditRow,

    // Pipeline step helpers
    getEffectiveHook: getEffectiveHook,
    buildCompletionChecks: buildCompletionChecks,
    openDimensionPicker: openDimensionPicker,
    autoUpdateRecipeTitle: autoUpdateRecipeTitle,
    setRecipeStatus: setRecipeStatus,
    addScene: addScene, deleteScene: deleteScene,
    addScriptRow: addScriptRow,
    addVariant: addVariant, removeVariant: removeVariant,
    getSelectedRecipe: getSelectedRecipe,

    // Mix & Match
    openMixerModal: openMixerModal,
    createRecipeFromMixer: createRecipeFromMixer,
    batchGenerateRecipes: batchGenerateRecipes,

    // Tag Input
    renderTagInput: renderTagInput,

    // AI Action Bar
    renderRecipeAIBar: renderRecipeAIBar,

    // Campaign Wizard
    openCampaignWizard: openCampaignWizard, wizardState: wizardState,

    // Setup Wizard
    openSetupWizard: openSetupWizard,
    refreshSetupWizard: refreshSetupWizard,
    setupWizardState: setupWizardState,
    swClearSession: swClearSession
  };

  console.log('[CP] Part 2A loaded');

})(jQuery, Drupal);

/* ===== src/30-part2b/00-header.js ===== */
/**
 * Campaign Planner v1.0 - Part 2B: AI & Advanced Features
 *
 * Multi-provider AI (LLMService), brand context (BrandService),
 * AI research panel component, inline AI assist, 11 AI action functions,
 * Research Lab view, Settings view (6 tabs), Images view, Import/Export.
 *
 * Registry: researchView, settingsView, imagesView, imagePicker,
 *   setupResearchEvents, setupSettingsEvents, setupImagesEvents
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
 * 20. Images view
 * 21. Image picker (reusable modal)
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
  var badge, recipeStatusBadge, campaignStatusBadge, priorityBadge;
  var funnelBadge, dimensionBadge, mediaTypeBadge, hookTypeBadge, progressBar;
  var createEntity, deleteEntity, saveEntityField, duplicateEntity;
  var maybeAdvanceRecipeStatus;
  var getAllPersonas, getAllMessages, getAllStyles, getAllFormats;
  var getAllCategories, getAllPainPoints, getAllCampaigns, getAllTags;
  var getPersonaPainPoints, getPersona, getMessage, getStyle, getFormat;
  var getCategory, getCampaign, getTag, getPainPoint, getFunnelStage;
  var getRecipe, getImages, getAllImageTags, parseImageField, isSetupComplete;
  var getRecipeProduction, getProductionStatusStyle, parseProductionData;
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
    getRecipeProduction = window._cpGetRecipeProduction;
    getProductionStatusStyle = window._cpGetProductionStatusStyle;
    parseProductionData = window._cpParseProductionData;
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
      if (appDef && appDef.provider && appDef.model) { var ma = _getModelObj(appDef.provider, appDef.model); if (ma) return _buildSel(appDef.provider, ma); }
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

    return { init: init, isConfigured: isConfigured, getActiveProviders: getActiveProviders, getActiveModels: getActiveModels, getDefault: getDefault, resolveSelection: resolveSelection, savePreference: savePreference, renderInlinePicker: renderInlinePicker, callAI: callAI };
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

  function recipeContextSnippet(recipe) {
    if (!recipe) return '';
    var parts = [];
    var persona = S.personaMap[recipe.persona_id];
    var msg = S.messageMap[recipe.message_id];
    var style = S.styleMap[recipe.style_id];
    var format = S.formatMap[recipe.visual_format_id];

    if (persona) {
      parts.push('Persona: ' + persona.name);
      var demo = persona.demographics || {};
      var demoStr = [demo.age_range, demo.gender !== 'all' ? demo.gender : '', demo.location, demo.occupation].filter(Boolean).join(', ');
      if (demoStr) parts.push('Demographics: ' + demoStr);
      var psych = persona.psychographics || {};
      if (psych.desires) parts.push('Desires: ' + psych.desires);
      if (psych.fears) parts.push('Fears: ' + psych.fears);
      if (psych.emotional_triggers) parts.push('Emotional triggers: ' + psych.emotional_triggers);
    }
    if (msg) {
      parts.push('Message: ' + msg.title);
      if (msg.body) parts.push('Message body: ' + truncate(stripHtml(msg.body), 200));
      if (msg.delivery_notes) parts.push('Delivery: ' + truncate(msg.delivery_notes, 100));
      var funnelLabels = (msg.funnel_stages || []).map(function(fid) { var f = S.funnelStageMap[fid]; return f ? f.name : ''; }).filter(Boolean);
      if (funnelLabels.length) parts.push('Funnel: ' + funnelLabels.join(', '));
    }
    if (style) parts.push('Style: ' + style.name + (style.description ? ' — ' + truncate(style.description, 80) : ''));
    if (format) parts.push('Visual format: ' + format.name + (format.description ? ' — ' + truncate(format.description, 80) : ''));

    // Selected pain points
    var pps = recipe.selected_pain_point_ids || [];
    if (pps.length > 0) {
      var ppTexts = pps.map(function(ppId) { var pp = S.painPointMap[ppId]; return pp ? pp.pain_point : ''; }).filter(Boolean);
      if (ppTexts.length) parts.push('Pain points addressed: ' + ppTexts.join('; '));
    }

    // Existing hook
    var hook = getEffectiveHook ? getEffectiveHook(recipe) : null;
    if (hook) parts.push('Hook: "' + hook.text + '" (' + hook.type + ')');

    // Media type
    parts.push('Media type: ' + recipe.media_type);

    return parts.length ? '\n\nRecipe context:\n' + parts.join('\n') : '';
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


/* ===== src/30-part2b/15-ai-recipe-content.js ===== */
  // ============================================================
  // SECTION 14: AI — RECIPE CONTENT
  // ============================================================

  function aiGenerateHook(recipeId, customInstructions) {
    var recipe = getRecipe(recipeId); if (!recipe) return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    toast('Generating hooks...', 'info');

    var prompt = 'You are a copywriting expert specializing in scroll-stopping Meta Ads hooks. Generate 5 opening hooks for this ad.\n';
    prompt += recipeContextSnippet(recipe);
    prompt += brandSnippet('hooks');
    if (customInstructions) prompt += '\n\nAdditional instructions: ' + customInstructions;
    prompt += '\n\nRules:\n- Each hook MUST stop the scroll in under 2 seconds\n- Use different hook psychology types:\n  1. Question hook (provocative question)\n  2. Bold claim / contrarian statement\n  3. Story/curiosity hook ("I was wrong about...")\n  4. Data/statistic hook (specific number)\n  5. Direct address ("If you [specific situation]...")\n- Keep each hook under 15 words\n- Tailor to the specific persona and their pain points\n- No generic openers like "In today\'s world"\n\nRespond ONLY as JSON: {"hooks":[{"text":"hook text...","type":"question|bold|story|data|direct"}]}';

    callAIWithRetry(prompt, function(parsed) {
      var hooks = parsed.hooks || [];
      if (hooks.length === 0) { toast('AI returned no hooks — try again', 'warning'); return; }

      // Add hooks to linked message if it exists
      var msg = S.messageMap[recipe.message_id];
      if (msg) {
        msg.hooks = msg.hooks || [];
        hooks.forEach(function(h) {
          msg.hooks.push({ id: generateId('hk'), text: h.text || '', type: h.type || 'direct' });
        });
        msg.updated = new Date().toISOString();
        // Select the first new hook
        recipe.hook = recipe.hook || {};
        recipe.hook.selected_hook_id = msg.hooks[msg.hooks.length - hooks.length].id;
      } else {
        // No message linked — store the best hook as custom_hook
        recipe.hook = recipe.hook || {};
        recipe.hook.custom_hook = hooks[0].text || '';
        recipe.hook.hook_type = hooks[0].type || 'direct';
        // Log the others so the user can see them
        if (hooks.length > 1) {
          recipe.hook._ai_suggestions = hooks.map(function(h) { return { text: h.text || '', type: h.type || '' }; });
        }
        toast('No message linked — saved best hook as custom hook. Link a message to store all hooks.', 'info', 5000);
      }
      recipe.updated = new Date().toISOString();
      logActivity('hook_generated', 'recipe', recipeId, recipe.title, (parsed.hooks || []).length + ' hooks generated');
      snapshot('AI hooks'); if (maybeAdvanceRecipeStatus) maybeAdvanceRecipeStatus(recipe, 'hooks generated');
      buildMaps(); render(); syncToTextarea();
      toast('Generated ' + (parsed.hooks || []).length + ' hooks', 'success');
    }, function(err) { toast('AI Error: ' + err, 'error'); }, 'ai-generate-hook', BrandService.getSystemPrompt('content'), parseJSON);
  }

  function aiWriteContent(recipeId, customInstructions) {
    var recipe = getRecipe(recipeId); if (!recipe) return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    toast('Writing ad copy alternatives...', 'info');

    var hook = getEffectiveHook ? getEffectiveHook(recipe) : null;
    var prompt = 'You are a top-performing Meta Ads copywriter. Write 2 compelling ad copy ALTERNATIVES for this creative. Each should take a different angle or tone.\n';
    prompt += recipeContextSnippet(recipe);
    prompt += brandSnippet('content');
    if (customInstructions) prompt += '\n\nAdditional instructions: ' + customInstructions;
    prompt += '\n\nRules:\n- Start with the hook' + (hook ? ': "' + hook.text + '"' : '') + '\n- Write for Meta Ads: concise, punchy, action-oriented\n- Each alternative should be DISTINCT in approach\n- Include headline (under 10 words) and CTA button text per alternative\n- Alternative 1: more emotional/story-driven\n- Alternative 2: more direct/benefits-focused\n\nRespond ONLY as JSON: {"alternatives":[{"label":"approach name","ad_copy":"primary text with \\n for line breaks","headline":"short headline","description":"supporting description","cta":"CTA button text"}]}';

    callAIWithRetry(prompt, function(parsed) {
      var alts = parsed.alternatives || [];
      if (alts.length === 0) { toast('AI returned no content', 'warning'); return; }

      // Show preview modal
      var previewAlts = alts.map(function(a) {
        return {
          label: a.label || '',
          sections: [
            { label: 'Ad Copy', value: (a.ad_copy || '').replace(/\\n/g, '\n') },
            { label: 'Headline', value: a.headline || '' },
            { label: 'Description', value: a.description || '' },
            { label: 'CTA', value: a.cta || '' }
          ],
          _data: a
        };
      });

      showAIPreview('Choose Ad Copy — ' + truncate(recipe.title, 30), previewAlts, function(idx) {
        var chosen = alts[idx];
        recipe.content = recipe.content || {};
        var paragraphs = (chosen.ad_copy || '').split(/\\n|\n/).filter(function(p) { return p.trim(); });
        recipe.content.ad_copy = paragraphs.length > 0 ? '<p>' + paragraphs.join('</p><p>') + '</p>' : '<p>' + (chosen.ad_copy || '') + '</p>';
        if (chosen.headline) recipe.content.headline = chosen.headline;
        if (chosen.description) recipe.content.description = chosen.description;
        if (chosen.cta) recipe.content.cta = chosen.cta;
        recipe.updated = new Date().toISOString();
        logActivity('content_generated', 'recipe', recipeId, recipe.title, 'Ad copy selected from AI alternatives');
        snapshot('AI content'); if (maybeAdvanceRecipeStatus) maybeAdvanceRecipeStatus(recipe, 'content written');
        buildMaps(); render(); syncToTextarea();
        closeModal();
        toast('Ad copy applied', 'success');
      }, {
        onRegenerate: function(instructions) { aiWriteContent(recipeId, instructions); }
      });
    }, function(err) { toast('AI Error: ' + err, 'error'); }, 'ai-generate-content', BrandService.getSystemPrompt('content'), parseJSON);
  }


/* ===== src/30-part2b/16-ai-recipe-media.js ===== */
  // ============================================================
  // SECTION 15: AI — RECIPE MEDIA
  // ============================================================

  function aiImproveContent(recipeId, customInstructions) {
    var recipe = getRecipe(recipeId); if (!recipe) return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    var existing = stripHtml(recipe.content && recipe.content.ad_copy || '');
    if (!existing || existing.trim().length < 20) { toast('Write some ad copy first — then improve it', 'warning'); return; }
    toast('Improving ad copy...', 'info');

    var prompt = 'You are a Meta Ads copywriting expert. Improve the following ad copy. Make it more compelling, specific, and action-oriented while keeping the core message.\n\n';
    prompt += 'CURRENT AD COPY:\n' + existing + '\n';
    if (recipe.content.headline) prompt += 'CURRENT HEADLINE: ' + recipe.content.headline + '\n';
    if (recipe.content.cta) prompt += 'CURRENT CTA: ' + recipe.content.cta + '\n';
    prompt += recipeContextSnippet(recipe);
    prompt += brandSnippet('content');
    if (customInstructions) prompt += '\n\nSpecific improvement direction: ' + customInstructions;
    prompt += '\n\nRules:\n- Keep the same overall message and structure\n- Sharpen the language — remove filler words, strengthen verbs\n- Make the hook more scroll-stopping\n- Improve the CTA urgency\n- Keep the brand voice consistent\n\nRespond ONLY as JSON: {"ad_copy":"improved text with \\n for line breaks","headline":"improved headline","cta":"improved CTA","changes":"brief summary of what you changed and why"}';

    callAIWithRetry(prompt, function(parsed) {
      var improved = parsed.ad_copy || '';
      if (!improved) { toast('AI returned empty content', 'warning'); return; }

      // Show preview: original vs improved
      var previewAlts = [
        { label: 'Original (Current)', sections: [
          { label: 'Ad Copy', value: existing },
          { label: 'Headline', value: recipe.content.headline || '' },
          { label: 'CTA', value: recipe.content.cta || '' }
        ] },
        { label: 'Improved' + (parsed.changes ? ' — ' + truncate(parsed.changes, 40) : ''), sections: [
          { label: 'Ad Copy', value: improved.replace(/\\n/g, '\n') },
          { label: 'Headline', value: parsed.headline || recipe.content.headline || '' },
          { label: 'CTA', value: parsed.cta || recipe.content.cta || '' }
        ], _data: parsed }
      ];

      showAIPreview('Improve Ad Copy — ' + truncate(recipe.title, 30), previewAlts, function(idx) {
        if (idx === 0) { closeModal(); toast('Kept original', 'info'); return; }
        var paragraphs = improved.split(/\\n|\n/).filter(function(p) { return p.trim(); });
        recipe.content.ad_copy = '<p>' + paragraphs.join('</p><p>') + '</p>';
        if (parsed.headline) recipe.content.headline = parsed.headline;
        if (parsed.cta) recipe.content.cta = parsed.cta;
        recipe.updated = new Date().toISOString();
        logActivity('content_generated', 'recipe', recipeId, recipe.title, 'Ad copy improved via AI');
        snapshot('AI improve'); buildMaps(); render(); syncToTextarea();
        closeModal();
        toast('Improved ad copy applied', 'success');
      }, {
        onRegenerate: function(instructions) { aiImproveContent(recipeId, instructions); }
      });
    }, function(err) { toast('AI Error: ' + err, 'error'); }, 'ai-improve-content', BrandService.getSystemPrompt('content'), parseJSON);
  }

  function aiGenerateBrief(recipeId, customInstructions) {
    var recipe = getRecipe(recipeId); if (!recipe) return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    toast('Generating creative brief alternatives...', 'info');

    var prompt = 'You are a creative director writing creative briefs for Meta Ads images. Generate 2 DIFFERENT brief alternatives — each with a distinct visual approach.\n';
    prompt += recipeContextSnippet(recipe);
    prompt += brandSnippet('media');
    if (customInstructions) prompt += '\n\nAdditional instructions: ' + customInstructions;
    prompt += '\n\nRules:\n- Each brief must describe a DIFFERENT visual direction\n- Alternative 1: more lifestyle/emotional approach\n- Alternative 2: more product-focused/direct approach\n- Include: setting, subjects, composition, lighting, mood, key visual elements\n- Reference the persona and what resonates with them\n- Consider the visual format: ' + (S.formatMap[recipe.visual_format_id] ? S.formatMap[recipe.visual_format_id].name : 'not specified') + '\n\nRespond ONLY as JSON: {"alternatives":[{"label":"approach name","creative_brief":"detailed visual description (3-5 sentences)"}]}';

    callAIWithRetry(prompt, function(parsed) {
      var alts = parsed.alternatives || [];
      if (alts.length === 0) { toast('AI returned no briefs', 'warning'); return; }

      var previewAlts = alts.map(function(a) {
        return { label: a.label || '', text: a.creative_brief || '', _data: a };
      });

      showAIPreview('Choose Creative Brief — ' + truncate(recipe.title, 30), previewAlts, function(idx) {
        var chosen = alts[idx];
        recipe.image_brief = recipe.image_brief || {};
        recipe.image_brief.creative_brief = chosen.creative_brief || '';
        recipe.updated = new Date().toISOString();
        logActivity('brief_generated', 'recipe', recipeId, recipe.title, 'Creative brief selected from alternatives');
        snapshot('AI brief'); if (maybeAdvanceRecipeStatus) maybeAdvanceRecipeStatus(recipe, 'brief generated');
        buildMaps(); render(); syncToTextarea();
        closeModal();
        toast('Creative brief applied', 'success');
      }, {
        onRegenerate: function(instructions) { aiGenerateBrief(recipeId, instructions); }
      });
    }, function(err) { toast('AI Error: ' + err, 'error'); }, 'ai-generate-brief', BrandService.getSystemPrompt('media'), parseJSON);
  }

  function aiGenerateImagePrompt(recipeId, customInstructions) {
    var recipe = getRecipe(recipeId); if (!recipe) return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    toast('Generating AI image prompt...', 'info');

    var brief = (recipe.image_brief && recipe.image_brief.creative_brief) || '';
    var params = (recipe.image_brief && recipe.image_brief.prompt_params) || {};

    var prompt = 'You are an expert at writing AI image generation prompts (for Midjourney, DALL-E, or Flux).\n';
    if (brief) prompt += '\nCreative brief: ' + brief;
    prompt += recipeContextSnippet(recipe);
    prompt += brandSnippet('media');
    if (customInstructions) prompt += '\n\nAdditional instructions: ' + customInstructions;
    prompt += '\n\nRules:\n- Write a detailed, specific image generation prompt\n- Include: subject, setting, composition, lighting, camera angle, mood, color palette\n- Visual approach: ' + (params.visual_approach || 'photography') + '\n- Aspect ratio: ' + (params.aspect_ratio || '1:1') + '\n' + (params.mood ? '- Mood: ' + params.mood + '\n' : '') + '- Do NOT include text/typography in the image prompt (text overlays are added separately)\n- Write a negative prompt to exclude unwanted elements\n\nRespond ONLY as JSON: {"ai_prompt":"detailed image generation prompt...","negative_prompt":"elements to exclude..."}';

    callAIWithRetry(prompt, function(parsed) {
      recipe.image_brief = recipe.image_brief || {};
      recipe.image_brief.ai_prompt = parsed.ai_prompt || '';
      recipe.image_brief.prompt_params = recipe.image_brief.prompt_params || {};
      if (parsed.negative_prompt) recipe.image_brief.prompt_params.negative_prompt = parsed.negative_prompt;
      recipe.updated = new Date().toISOString();
      logActivity('media_generated', 'recipe', recipeId, recipe.title, 'AI image prompt generated');
      snapshot('AI prompt'); if (maybeAdvanceRecipeStatus) maybeAdvanceRecipeStatus(recipe, 'image prompt generated');
      buildMaps(); render(); syncToTextarea();
      toast('AI image prompt generated', 'success');
    }, function(err) { toast('AI Error: ' + err, 'error'); }, 'ai-generate-prompt', BrandService.getSystemPrompt('media'), parseJSON);
  }

  function aiGenerateBlueprint(recipeId, customInstructions) {
    var recipe = getRecipe(recipeId); if (!recipe) return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    toast('Generating video blueprint...', 'info');

    var vid = recipe.video || {};
    var duration = vid.duration_seconds || 30;
    var format = vid.format || 'Reel';

    var prompt = 'You are a video production expert creating a scene-by-scene blueprint for a Meta Ads video.\n';
    prompt += recipeContextSnippet(recipe);
    prompt += brandSnippet('content');
    if (customInstructions) prompt += '\n\nAdditional instructions: ' + customInstructions;
    prompt += '\n\nVideo specs:\n- Duration: ' + duration + ' seconds\n- Format: ' + format + '\n- Aspect ratio: ' + (vid.aspect_ratio || '9:16') + '\n' + (vid.concept ? '- Concept: ' + vid.concept + '\n' : '');
    prompt += '\n\nRules:\n- Break the video into 4-6 distinct scenes\n- Each scene should have a clear purpose in the narrative arc\n- First scene = HOOK (must grab attention in first 2 seconds)\n- Last scene = CTA / brand moment\n- Include timestamp for each scene (e.g., "0:00-0:05")\n- Scene descriptions should be actionable for a production team\n- Total scene durations must add up to approximately ' + duration + ' seconds\n\nRespond ONLY as JSON: {"scenes":[{"name":"scene name","description":"what happens, visuals, action...","timestamp":"0:00-0:05","duration":"5s"}]}';

    callAIWithRetry(prompt, function(parsed) {
      recipe.video = recipe.video || {};
      recipe.video.blueprint = recipe.video.blueprint || {};
      recipe.video.blueprint.scenes = (parsed.scenes || []).map(function(s) {
        return { name: s.name || '', description: s.description || '', timestamp: s.timestamp || '', duration: s.duration || '' };
      });
      recipe.updated = new Date().toISOString();
      logActivity('media_generated', 'recipe', recipeId, recipe.title, (parsed.scenes || []).length + ' video scenes generated');
      snapshot('AI blueprint'); if (maybeAdvanceRecipeStatus) maybeAdvanceRecipeStatus(recipe, 'blueprint generated');
      buildMaps(); render(); syncToTextarea();
      toast('Generated ' + (parsed.scenes || []).length + ' scene blueprint', 'success');
    }, function(err) { toast('AI Error: ' + err, 'error'); }, 'ai-generate-blueprint', BrandService.getSystemPrompt('content'), parseJSON);
  }

  function aiGenerateScript(recipeId, customInstructions) {
    var recipe = getRecipe(recipeId); if (!recipe) return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }

    var scenes = (recipe.video && recipe.video.blueprint && recipe.video.blueprint.scenes) || [];
    if (scenes.length === 0) { toast('Generate a blueprint first — the script is built from scenes', 'warning'); return; }
    toast('Generating detailed script...', 'info');

    var sceneSummary = scenes.map(function(s, i) { return 'Scene ' + (i + 1) + ' (' + (s.timestamp || '?') + '): ' + (s.name || '') + ' — ' + truncate(s.description || '', 60); }).join('\n');

    var prompt = 'You are a video production scriptwriter. Create a detailed production script based on the scene blueprint below.\n';
    prompt += recipeContextSnippet(recipe);
    prompt += '\n\nScene blueprint:\n' + sceneSummary;
    prompt += brandSnippet('content');
    if (customInstructions) prompt += '\n\nAdditional instructions: ' + customInstructions;
    prompt += '\n\nRules:\n- Create one row per scene (or split longer scenes into 2 rows)\n- Each row needs: time (timestamp), dialogue (what talent says), visual (what viewer sees), camera (camera angle/movement), audio (music/SFX)\n- Dialogue should match the brand voice and style\n- Camera directions should be specific: "close-up face", "wide establishing shot", "product detail B-roll"\n- Audio should enhance the emotional arc\n\nRespond ONLY as JSON: {"rows":[{"time":"0:00","dialogue":"what is said...","visual":"what is shown...","camera":"camera direction...","audio":"music/sfx note..."}]}';

    callAIWithRetry(prompt, function(parsed) {
      recipe.video = recipe.video || {};
      recipe.video.script = recipe.video.script || {};
      recipe.video.script.rows = (parsed.rows || []).map(function(r) {
        return { time: r.time || '', dialogue: r.dialogue || '', visual: r.visual || '', camera: r.camera || '', audio: r.audio || '' };
      });
      recipe.updated = new Date().toISOString();
      logActivity('script_generated', 'recipe', recipeId, recipe.title, (parsed.rows || []).length + ' script rows generated');
      snapshot('AI script'); buildMaps(); render(); syncToTextarea();
      toast('Generated ' + (parsed.rows || []).length + '-row script', 'success');
    }, function(err) { toast('AI Error: ' + err, 'error'); }, 'ai-generate-script', BrandService.getSystemPrompt('content'), parseJSON);
  }


/* ===== src/30-part2b/17-ai-campaign-suggestions.js ===== */
  // ============================================================
  // SECTION 15.5: AI — CAMPAIGN RECIPE SUGGESTIONS
  // ============================================================

  function aiSuggestCampaignRecipes(campaignId) {
    var camp = getCampaign(campaignId); if (!camp) return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    toast('AI analyzing campaign dimensions...', 'info');

    var personas = (camp.persona_ids || []).map(function(id) { var p = S.personaMap[id]; return p ? { name: p.name, description: truncate(p.description || '', 80) } : null; }).filter(Boolean);
    var messages = (camp.message_ids || []).map(function(id) { var m = S.messageMap[id]; return m ? { title: m.title, theme: m.theme || '', funnel: (m.funnel_stages || []).join(',') } : null; }).filter(Boolean);
    var styles = (camp.style_ids || []).map(function(id) { var s = S.styleMap[id]; return s ? { name: s.name } : null; }).filter(Boolean);
    var formats = (camp.format_ids || []).map(function(id) { var f = S.formatMap[id]; return f ? { name: f.name, category: f.category || '' } : null; }).filter(Boolean);

    if (personas.length === 0 && messages.length === 0) {
      toast('Select personas and messages in the campaign targeting first', 'warning');
      return;
    }

    var objective = (Constants.CAMPAIGN_OBJECTIVES || []).find(function(o) { return o.id === camp.objective; });

    var prompt = 'You are a Meta Ads campaign strategist. Analyze the available creative dimensions and suggest the best recipe combinations for this campaign.\n\n';
    prompt += 'Campaign: ' + camp.name + '\n';
    if (objective) prompt += 'Objective: ' + objective.name + '\n';
    if (camp.funnel_stage) { var fs = S.funnelStageMap[camp.funnel_stage]; if (fs) prompt += 'Funnel focus: ' + fs.name + '\n'; }
    if (camp.date_start) prompt += 'Date range: ' + camp.date_start + ' to ' + (camp.date_end || '?') + '\n';
    if (camp.ai_instructions) prompt += 'Special instructions: ' + camp.ai_instructions + '\n';

    prompt += '\nAvailable Personas:\n' + personas.map(function(p, i) { return (i + 1) + '. ' + p.name + ' — ' + p.description; }).join('\n');
    prompt += '\n\nAvailable Messages:\n' + messages.map(function(m, i) { return (i + 1) + '. ' + m.title + (m.theme ? ' [' + m.theme + ']' : '') + (m.funnel ? ' (Funnel: ' + m.funnel + ')' : ''); }).join('\n');
    if (styles.length) prompt += '\n\nAvailable Styles:\n' + styles.map(function(s, i) { return (i + 1) + '. ' + s.name; }).join('\n');
    if (formats.length) prompt += '\n\nAvailable Formats:\n' + formats.map(function(f, i) { return (i + 1) + '. ' + f.name + (f.category ? ' [' + f.category + ']' : ''); }).join('\n');

    prompt += brandSnippet('research');

    prompt += '\n\nRules:\n- Suggest 4-8 specific recipe combinations (persona × message × style × format)\n- For each, explain WHY this combination works for the campaign objective\n- Prioritize diversity — don\'t repeat the same persona or message too often\n- Consider funnel stage matching (TOFU messages with awareness personas, BOFU with conversion personas)\n- Suggest media type (image or video) for each based on format\n- Order from highest priority to lowest\n\nRespond ONLY as JSON: {"suggestions":[{"persona_name":"...","message_title":"...","style_name":"...","format_name":"...","media_type":"image|video","reasoning":"why this combo works...","priority":"high|medium|low"}]}';

    callAIWithRetry(prompt, function(parsed) {
      var suggestions = parsed.suggestions || [];
      if (suggestions.length === 0) { toast('AI returned no suggestions', 'warning'); return; }

      // Map names back to IDs
      var mappedSuggestions = suggestions.map(function(s) {
        var pMatch = (S.data.personas || []).find(function(p) { return p.name === s.persona_name; });
        var mMatch = (S.data.messages || []).find(function(m) { return m.title === s.message_title; });
        var sMatch = (S.data.styles || []).find(function(st) { return st.name === s.style_name; });
        var fMatch = (S.data.visual_formats || []).find(function(f) { return f.name === s.format_name; });
        return {
          persona_id: pMatch ? pMatch.id : '', message_id: mMatch ? mMatch.id : '',
          style_id: sMatch ? sMatch.id : '', visual_format_id: fMatch ? fMatch.id : '',
          media_type: s.media_type || 'image', reasoning: s.reasoning || '', priority: s.priority || 'medium',
          title: (pMatch ? pMatch.name : '?') + ' × ' + (mMatch ? mMatch.title : '?') + ' × ' + (sMatch ? sMatch.name : '?') + ' × ' + (fMatch ? fMatch.name : '?'),
          _selected: true
        };
      });

      // Show results in modal for user to review and select
      var html = '<div style="margin-bottom:var(--cp-space-3)">';
      html += '<p class="cp-text-muted">AI suggested ' + mappedSuggestions.length + ' recipe combinations. Select which ones to create.</p>';
      html += '</div>';

      for (var i = 0; i < mappedSuggestions.length; i++) {
        var ms = mappedSuggestions[i];
        html += '<div class="cp-card" style="margin-bottom:var(--cp-space-2);padding:var(--cp-space-3);cursor:pointer" data-suggestion-idx="' + i + '">';
        html += '<div style="display:flex;align-items:center;gap:var(--cp-space-2);margin-bottom:6px">';
        html += '<input type="checkbox" class="cp-ai-suggestion-check" data-idx="' + i + '" checked>';
        html += '<strong style="flex:1">' + esc(ms.title) + '</strong>';
        html += priorityBadge(ms.priority) + ' ' + mediaTypeBadge(ms.media_type);
        html += '</div>';
        html += '<p style="font-size:var(--cp-font-size-xs);color:var(--cp-text-secondary);margin:0">' + esc(ms.reasoning) + '</p>';
        html += '</div>';
      }

      openModal('AI Recipe Suggestions — ' + camp.name, html, {
        titleIcon: 'sparkles', size: 'lg',
        saveLabel: icon('plus') + ' Create Selected Recipes',
        onSave: function() {
          snapshot('AI campaign recipes');
          var count = 0;
          $('.cp-ai-suggestion-check:checked').each(function() {
            var idx = parseInt($(this).data('idx'), 10);
            var s = mappedSuggestions[idx];
            if (s) {
              createEntity('recipe', {
                persona_id: s.persona_id, message_id: s.message_id,
                style_id: s.style_id, visual_format_id: s.visual_format_id,
                media_type: s.media_type, priority: s.priority, campaign_id: campaignId
              });
              count++;
            }
          });
          logActivity('recipe_batch_generated', 'campaign', campaignId, camp.name, 'AI suggested ' + count + ' recipes for campaign');
          closeModal();
          toast(count + ' AI-suggested recipes created', 'success', 4000);
        }
      });
    }, function(err) { toast('AI Error: ' + err, 'error'); }, 'ai-campaign-recipes', BrandService.getSystemPrompt('research'), parseJSON);
  }

  function aiGenerateCampaignBrief(campaignId) {
    var camp = getCampaign(campaignId); if (!camp) return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    toast('Generating campaign brief...', 'info');

    var personas = (camp.persona_ids || []).map(function(id) { var p = S.personaMap[id]; return p ? p.name + (p.description ? ': ' + truncate(p.description, 60) : '') : null; }).filter(Boolean);
    var messages = (camp.message_ids || []).map(function(id) { var m = S.messageMap[id]; return m ? m.title : null; }).filter(Boolean);
    var styles = (camp.style_ids || []).map(function(id) { var s = S.styleMap[id]; return s ? s.name : null; }).filter(Boolean);
    var objective = (Constants.CAMPAIGN_OBJECTIVES || []).find(function(o) { return o.id === camp.objective; });

    var prompt = 'You are a senior advertising strategist. Write a comprehensive creative brief for this Meta Ads campaign.\n\n';
    prompt += 'Campaign: ' + camp.name + '\n';
    if (objective) prompt += 'Objective: ' + objective.name + '\n';
    if (camp.funnel_stage) { var fs = S.funnelStageMap[camp.funnel_stage]; if (fs) prompt += 'Funnel focus: ' + fs.name + '\n'; }
    if (camp.date_start) prompt += 'Timeline: ' + camp.date_start + ' to ' + (camp.date_end || 'ongoing') + '\n';
    if (camp.budget_notes) prompt += 'Budget: ' + camp.budget_notes + '\n';
    if (personas.length) prompt += '\nTarget Personas:\n' + personas.map(function(p, i) { return (i + 1) + '. ' + p; }).join('\n');
    if (messages.length) prompt += '\nKey Messages: ' + messages.join(', ');
    if (styles.length) prompt += '\nCreative Styles: ' + styles.join(', ');
    if (camp.ai_instructions) prompt += '\nSpecial Instructions: ' + camp.ai_instructions;
    prompt += brandSnippet('content');
    prompt += '\n\nWrite a creative brief covering:\n1. Campaign overview and objective\n2. Target audience insights (from personas)\n3. Key messaging strategy\n4. Creative direction and visual guidelines\n5. Tone of voice\n6. Success metrics and KPIs\n\nWrite in a professional but actionable tone. 200-400 words. Plain text, no markdown.';

    callAIWithRetry(prompt, function(text) {
      // Clean any JSON wrapping
      var clean = text.replace(/^```[\s\S]*?\n/, '').replace(/\n```$/, '').replace(/^\{[\s\S]*?"brief"\s*:\s*"/, '').replace(/"\s*\}$/, '').trim();
      snapshot('AI campaign brief');
      saveEntityField('campaign', campaignId, 'brief', clean);
      S.campaignDetailTab = 'brief';
      buildMaps(); render(); syncToTextarea();
      toast('Campaign brief generated', 'success');
    }, function(err) { toast('AI Error: ' + err, 'error'); }, 'ai-campaign-brief', BrandService.getSystemPrompt('content'), parseJSON);
  }

  function aiAnalyzeCampaignGaps(campaignId) {
    var camp = getCampaign(campaignId); if (!camp) return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    var recipes = (S.data.recipes || []).filter(function(r) { return r.campaign_id === campaignId; });
    toast('Analyzing coverage gaps...', 'info');

    var personaNames = (camp.persona_ids || []).map(function(id) { var p = S.personaMap[id]; return p ? p.name : null; }).filter(Boolean);
    var messageNames = (camp.message_ids || []).map(function(id) { var m = S.messageMap[id]; return m ? m.title : null; }).filter(Boolean);
    var objective = (Constants.CAMPAIGN_OBJECTIVES || []).find(function(o) { return o.id === camp.objective; });

    // Build coverage info
    var existingCombos = recipes.map(function(r) {
      var pn = S.personaMap[r.persona_id] ? S.personaMap[r.persona_id].name : '?';
      var mn = S.messageMap[r.message_id] ? S.messageMap[r.message_id].title : '?';
      return pn + ' × ' + mn;
    });

    var prompt = 'You are a campaign strategist analyzing ad creative coverage for a Meta Ads campaign.\n\n';
    prompt += 'Campaign: ' + camp.name + '\n';
    if (objective) prompt += 'Objective: ' + objective.name + '\n';
    prompt += '\nAvailable Personas: ' + personaNames.join(', ');
    prompt += '\nAvailable Messages: ' + messageNames.join(', ');
    prompt += '\nExisting recipes (persona × message combos):\n' + (existingCombos.length ? existingCombos.join('\n') : 'None');
    prompt += brandSnippet('research');
    prompt += '\n\nAnalyze and provide:\n1. Missing persona×message combinations that should be covered\n2. Over-covered areas (too many recipes for one combo)\n3. Funnel stage gaps (TOFU/MOFU/BOFU balance)\n4. Recommendations for priority additions\n\nKeep it concise and actionable. Plain text, no markdown.';

    callAIWithRetry(prompt, function(text) {
      var clean = text.replace(/^```[\s\S]*?\n/, '').replace(/\n```$/, '').trim();
      openModal('Campaign Gap Analysis — ' + camp.name, '<div style="white-space:pre-wrap;line-height:1.7;font-size:var(--cp-font-size-sm)">' + esc(clean) + '</div>', {
        titleIcon: 'magnifying-glass', size: 'lg', footer: false
      });
    }, function(err) { toast('AI Error: ' + err, 'error'); }, 'ai-campaign-gaps', BrandService.getSystemPrompt('research'), parseJSON);
  }


/* ===== src/30-part2b/18-ai-setup-wizard.js ===== */
  // ============================================================
  // SECTION 15b: SETUP WIZARD AI GENERATORS
  // ============================================================

  function _swState() {
    return window._cpPart2A && window._cpPart2A.setupWizardState;
  }

  function _swRefresh() {
    if (window._cpPart2A && typeof window._cpPart2A.refreshSetupWizard === 'function') {
      window._cpPart2A.refreshSetupWizard();
    }
  }

  function swAIGeneratePersonas() {
    var state = _swState();
    if (!state) { console.warn('[SW] setupWizardState not available'); return; }
    if (state.aiLoading) return;
    if (!LLMService.isConfigured()) { toast('AI not configured — check Settings → AI.', 'warning'); return; }

    state.aiLoading = true;
    _swRefresh();

    var ws      = state.workspace || {};
    var extra   = state._personaContext || '';

    var prompt  = 'You are a senior marketing strategist. Create 4 distinct buyer persona profiles for the following product.\n\n';
    prompt += 'Product: ' + (ws.product_name || 'Unknown product') + '\n';
    if (ws.description)      prompt += 'Description: ' + ws.description + '\n';
    if (ws.target_audience)  prompt += 'Target audience: ' + ws.target_audience + '\n';
    if (ws.objective)        prompt += 'Campaign objective: ' + ws.objective + '\n';
    if (extra)               prompt += 'Additional context: ' + extra + '\n';
    prompt += brandSnippet('persona');
    prompt += '\n\nReturn ONLY a valid JSON array. Each element must have:\n';
    prompt += '{ "name": "The [Type] [Role]", "description": "1-2 sentence character summary", ';
    prompt += '"demographics": { "age_range": "28-40", "gender": "Female", "location": "Urban US", "occupation": "Marketing Manager", "income_level": "$70k-$100k" }, ';
    prompt += '"psychographics": { "desires": "...", "fears": "...", "motivations": "...", "values": "..." } }\n';
    prompt += 'No markdown, no explanation. Valid JSON array only.';

    callAIWithRetry(
      prompt,
      function(parsed) {
        state.aiLoading = false;
        state.stepGenerated[3] = true;
        var arr = Array.isArray(parsed) ? parsed : (parsed && parsed.personas ? parsed.personas : []);
        state.personas = arr.slice(0, 8).map(function(p) {
          return {
            name:          p.name         || 'Persona',
            description:   p.description  || '',
            demographics:  p.demographics  || {},
            psychographics: p.psychographics || {},
            _selected: true
          };
        });
        _swRefresh();
      },
      function(err) {
        state.aiLoading = false;
        state.stepGenerated[3] = true;
        toast('Persona generation failed: ' + err, 'error');
        _swRefresh();
      },
      'sw-ai-config',
      BrandService.getSystemPrompt('persona'),
      parseJSON
    );
  }

  function swAIGeneratePainPoints() {
    var state = _swState();
    if (!state) { console.warn('[SW] setupWizardState not available'); return; }
    if (state.aiLoading) return;
    if (!LLMService.isConfigured()) { toast('AI not configured — check Settings → AI.', 'warning'); return; }

    var selPersonas = (state.personas || []).filter(function(p) { return p._selected; });
    if (!selPersonas.length) { toast('No personas selected — go back to Step 3.', 'warning'); return; }

    state.aiLoading = true;
    _swRefresh();

    var ws    = state.workspace || {};
    var extra = state._ppContext || '';

    // Build numbered persona list with index tracking
    var personaLines = selPersonas.map(function(p, i) {
      var d = p.demographics || {};
      var line = i + '. ' + (p.name || 'Persona ' + i) + ': ' + (p.description || '');
      if (d.occupation) line += ' (' + d.occupation + ')';
      return line;
    }).join('\n');

    var prompt  = 'You are a marketing strategist. Generate pain points for each buyer persona listed below.\n\n';
    prompt += 'Product: ' + (ws.product_name || 'Unknown product') + '\n';
    if (ws.description) prompt += 'Description: ' + ws.description + '\n';
    prompt += '\nPersonas:\n' + personaLines + '\n';
    if (extra) prompt += '\nAdditional context: ' + extra + '\n';
    prompt += brandSnippet('persona');
    prompt += '\n\nReturn ONLY a valid JSON array. Each element must have:\n';
    prompt += '{ "pain_point": "specific challenge they face", "solution": "how this product solves it (1 sentence)", ';
    prompt += '"category": "one of: Productivity | Cost / Budget | Knowledge Gap | Competition | Growth", ';
    prompt += '"persona_idx": 0 }\n';
    prompt += 'Generate 3-4 pain points per persona. Use persona_idx to match the 0-based index above.\n';
    prompt += 'No markdown, no explanation. Valid JSON array only.';

    callAIWithRetry(
      prompt,
      function(parsed) {
        state.aiLoading = false;
        state.stepGenerated[4] = true;
        var arr = Array.isArray(parsed) ? parsed : (parsed && parsed.pain_points ? parsed.pain_points : []);
        state.pain_points = arr.map(function(pp) {
          return {
            pain_point:   pp.pain_point  || '',
            solution:     pp.solution    || '',
            category:     pp.category    || '',
            _persona_idx: typeof pp.persona_idx === 'number' ? pp.persona_idx : 0,
            _selected:    true
          };
        });
        _swRefresh();
      },
      function(err) {
        state.aiLoading = false;
        state.stepGenerated[4] = true;
        toast('Pain point generation failed: ' + err, 'error');
        _swRefresh();
      },
      'sw-ai-config',
      BrandService.getSystemPrompt('research'),
      parseJSON
    );
  }

  function swAIGenerateMessages() {
    var state = _swState();
    if (!state) return;
    if (state.aiLoading) return;
    if (!LLMService.isConfigured()) { toast('AI not configured — check Settings → AI.', 'warning'); return; }

    state.aiLoading = true;
    _swRefresh();

    var ws           = state.workspace || {};
    var selPersonas  = (state.personas    || []).filter(function(p)  { return p._selected; });
    var selPainPoints= (state.pain_points || []).filter(function(pp) { return pp._selected; });
    var extra        = state._messageContext || '';

    var personaLines = selPersonas.slice(0, 4).map(function(p) {
      return '- ' + (p.name || 'Persona') + ': ' + (p.description || '');
    }).join('\n');

    var ppLines = selPainPoints.slice(0, 6).map(function(pp) {
      return '- ' + (pp.pain_point || '');
    }).join('\n');

    var prompt  = 'You are a direct-response copywriter. Create 5 distinct ad message angles for the following product.\n\n';
    prompt += 'Product: ' + (ws.product_name || 'Unknown') + '\n';
    if (ws.description)  prompt += 'Description: ' + ws.description + '\n';
    if (personaLines)    prompt += '\nTarget personas:\n' + personaLines + '\n';
    if (ppLines)         prompt += '\nKey pain points:\n' + ppLines + '\n';
    if (ws.objective)    prompt += '\nObjective: ' + ws.objective + '\n';
    if (extra)           prompt += '\nAdditional context: ' + extra + '\n';
    prompt += brandSnippet('content');
    prompt += '\n\nReturn ONLY a valid JSON array. Each element must have:\n';
    prompt += '{ "name": "The [Angle Name]", ';
    prompt += '"description": "How this angle positions the product to the audience (2 sentences)", ';
    prompt += '"theme": "Transformation | Social Proof | FOMO | Problem-Solution | Authority | Curiosity | Urgency", ';
    prompt += '"hook_type": "Bold Claim | Question | Shocking Stat | Story | Challenge | Testimonial", ';
    prompt += '"funnel_stage": "top | mid | bot", ';
    prompt += '"body": "1-2 sentence copy direction or sample hook line" }\n';
    prompt += 'No markdown, no explanation. Valid JSON array only.';

    callAIWithRetry(
      prompt,
      function(parsed) {
        state.aiLoading = false;
        state.stepGenerated[5] = true;
        var arr = Array.isArray(parsed) ? parsed : (parsed && parsed.messages ? parsed.messages : []);
        state.messages = arr.slice(0, 8).map(function(m) {
          return {
            name:         m.name         || 'Message',
            description:  m.description  || '',
            theme:        m.theme        || '',
            hook_type:    m.hook_type    || '',
            funnel_stage: m.funnel_stage || 'top',
            body:         m.body         || '',
            _selected:    true
          };
        });
        _swRefresh();
      },
      function(err) {
        state.aiLoading = false;
        state.stepGenerated[5] = true;
        toast('Message generation failed: ' + err, 'error');
        _swRefresh();
      },
      'sw-ai-config',
      BrandService.getSystemPrompt('content'),
      parseJSON
    );
  }

  function swAIGenerateStylesFormats() {
    var state = _swState();
    if (!state) return;
    if (state.aiLoading) return;
    if (!LLMService.isConfigured()) { toast('AI not configured — check Settings → AI.', 'warning'); return; }

    state.aiLoading = true;
    _swRefresh();

    var ws    = state.workspace || {};
    var extra = state._styleFormatContext || '';

    var prompt  = 'You are a creative director and media strategist. Generate creative styles and ad formats for the following product.\n\n';
    prompt += 'Product: ' + (ws.product_name || 'Unknown') + '\n';
    if (ws.description)  prompt += 'Description: ' + ws.description + '\n';
    if (ws.objective)    prompt += 'Objective: ' + ws.objective + '\n';
    if (extra)           prompt += 'Additional context: ' + extra + '\n';
    prompt += brandSnippet('content');
    prompt += '\n\nReturn ONLY a valid JSON object with two arrays:\n';
    prompt += '{\n';
    prompt += '  "styles": [ { "name": "...", "description": "Visual and creative direction in 1-2 sentences" } ],\n';
    prompt += '  "formats": [ { "name": "...", "description": "Format specs and use-case in 1-2 sentences", "category": "Shoot | UGC | Graphic | Animation" } ]\n';
    prompt += '}\n';
    prompt += 'Generate 4 styles and 6 formats. Formats should cover different aspect ratios and platforms (TikTok, Meta, YouTube, etc.).\n';
    prompt += 'No markdown, no explanation. Valid JSON object only.';

    callAIWithRetry(
      prompt,
      function(parsed) {
        state.aiLoading = false;
        state.stepGenerated[6] = true;
        var stylesArr  = (parsed && Array.isArray(parsed.styles))  ? parsed.styles  : [];
        var formatsArr = (parsed && Array.isArray(parsed.formats)) ? parsed.formats : [];
        state.styles = stylesArr.slice(0, 8).map(function(s) {
          return { name: s.name || 'Style', description: s.description || '', _selected: true };
        });
        state.formats = formatsArr.slice(0, 10).map(function(f) {
          return { name: f.name || 'Format', description: f.description || '', category: f.category || '', _selected: true };
        });
        _swRefresh();
      },
      function(err) {
        state.aiLoading = false;
        state.stepGenerated[6] = true;
        toast('Styles & formats generation failed: ' + err, 'error');
        _swRefresh();
      },
      'sw-ai-config',
      BrandService.getSystemPrompt('content'),
      parseJSON
    );
  }


/* ===== src/30-part2b/19-ai-setup-finalize.js ===== */
  // ============================================================
  // SECTION 15c: SETUP WIZARD — FINALIZE
  // ============================================================

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
    if (ws.name)                S.meta.workspace.name                  = ws.name;
    if (!S.meta.workspace.created) S.meta.workspace.created            = new Date().toISOString();
    if (ws.product_name)        S.meta.setup.product_name              = ws.product_name;
    if (ws.objective)           S.meta.setup.objective                 = ws.objective;
    if (ws.custom_instructions) S.meta.setup.custom_instructions       = ws.custom_instructions;

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

    buildMaps(); // rebuild so IDs are resolvable

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

    buildMaps(); // rebuild again before campaign + recipe creation

    // ---- 7. Campaign ----
    setMsg('Creating campaign…');
    var cam = state.campaign || {};
    var campEnt = createEntity('campaign', {
      name:         cam.name         || ws.product_name || 'My Campaign',
      objective:    cam.objective    || ws.objective    || '',
      date_start:   cam.date_start   || '',
      date_end:     cam.date_end     || '',
      budget_notes: cam.budget_notes || '',
      persona_ids:  state.created.personaIds.slice(),
      message_ids:  state.created.messageIds.slice(),
      style_ids:    state.created.styleIds.slice(),
      format_ids:   state.created.formatIds.slice()
    });
    state.created.campaignId = campEnt.id;

    // ---- 8. Recipes (selected combos) ----
    setMsg('Creating ad recipes…');
    var selCombos = (state.combos || []).filter(function(c) { return c.selected; });
    for (var ci = 0; ci < selCombos.length; ci++) {
      var combo  = selCombos[ci];
      var pOri   = combo.persona ? (state.personas || []).indexOf(combo.persona) : -1;
      var mOri   = combo.message ? (state.messages || []).indexOf(combo.message) : -1;
      var sOri   = combo.style   ? (state.styles   || []).indexOf(combo.style)   : -1;
      var fOri   = combo.format  ? (state.formats  || []).indexOf(combo.format)  : -1;
      var rEnt   = createEntity('recipe', {
        campaign_id:      campEnt.id,
        persona_id:       personaIdxToId[pOri]  || '',
        message_id:       messageIdxToId[mOri]  || '',
        style_id:         styleIdxToId[sOri]    || '',
        visual_format_id: formatIdxToId[fOri]   || ''
      });
      state.created.recipeIds.push(rEnt.id);
    }

    // ---- 9. Mark setup complete ----
    setMsg('Finishing up…');
    S.meta.setup.setup_complete = true;
    logActivity('setup_completed', '', '', ws.name || 'Workspace', 'Setup wizard completed');
    buildMaps();
    syncToTextarea();

    // ---- 10. Clear session & close wizard ----
    if (window._cpPart2A && typeof window._cpPart2A.swClearSession === 'function') {
      window._cpPart2A.swClearSession();
    }
    $('.cp-setup-wizard').remove();

    // ---- 11. Re-render app shell & navigate to campaigns ----
    if (window._cpRenderAppShell) {
      $('#cpApp').html(window._cpRenderAppShell());
      // Re-attach AI picker placeholders and status indicator into new shell
      $('.cp-ai-picker-loading').each(function() {
        var actionId = $(this).data('pending-action');
        if (actionId) $(this).replaceWith(LLMService.renderInlinePicker(actionId));
      });
      updateAIStatusIndicator();
    }
    navigate('campaigns');

    var rCount = state.created.recipeIds.length;
    toast(
      'Workspace ready! Created ' + state.created.personaIds.length + ' personas, ' +
      state.created.messageIds.length + ' messages, and ' + rCount + ' recipe' + (rCount !== 1 ? 's' : '') + '.',
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
    var objectives = Constants.CAMPAIGN_OBJECTIVES || [];
    var html = '<div class="cp-settings-panel">';
    html += '<div class="cp-settings-section"><h3>' + icon('bolt') + ' Pain Point Categories</h3>';
    html += '<div class="cp-config-list">';
    for (var pi = 0; pi < ppCats.length; pi++) html += '<div class="cp-config-item"><span class="cp-config-item-name">' + esc(ppCats[pi].name) + '</span><span class="cp-text-muted">' + esc(ppCats[pi].id) + '</span></div>';
    html += '</div></div>';
    html += '<div class="cp-settings-section"><h3>' + icon('clapperboard') + ' Visual Format Categories</h3>';
    html += '<div class="cp-config-list">';
    for (var fi = 0; fi < fmtCats.length; fi++) html += '<div class="cp-config-item"><span class="cp-config-item-name">' + esc(fmtCats[fi].name) + '</span><span class="cp-text-muted">' + icon(fmtCats[fi].icon) + '</span></div>';
    html += '</div></div>';
    html += '<div class="cp-settings-section"><h3>' + icon('bullseye') + ' Campaign Objectives</h3>';
    html += '<div class="cp-config-list">';
    for (var oi = 0; oi < objectives.length; oi++) html += '<div class="cp-config-item"><span class="cp-config-item-name">' + esc(objectives[oi].name) + '</span><span class="cp-text-muted">' + icon(objectives[oi].icon) + '</span></div>';
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
      if (!Array.isArray(d.personas) && !Array.isArray(d.messages) && !Array.isArray(d.recipes)) {
        return 'Data import must contain at least one entity array (personas, messages, or recipes).';
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
                S.meta = imported.meta; S.data = imported.data; S.activity = imported.activity || [];
              } else if (importType === 'meta') { S.meta = imported; }
              else {
                // Preserve essential arrays that might be missing in partial imports
                S.data.personas = imported.personas || S.data.personas || [];
                S.data.persona_categories = imported.persona_categories || S.data.persona_categories || [];
                S.data.pain_points = imported.pain_points || S.data.pain_points || [];
                S.data.messages = imported.messages || S.data.messages || [];
                S.data.styles = imported.styles || S.data.styles || [];
                S.data.visual_formats = imported.visual_formats || S.data.visual_formats || [];
                S.data.recipes = imported.recipes || S.data.recipes || [];
                S.data.campaigns = imported.campaigns || S.data.campaigns || [];
                S.data.tags = imported.tags || S.data.tags || [];
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


/* ===== src/30-part2b/24-view-images.js ===== */
  // ============================================================
  // SECTION 20: IMAGES VIEW
  // ============================================================

  function renderImagesView() {
    var cats = (S.meta && S.meta.image_categories) || [];
    var imgs = getImages(S.imageFilter);
    var allImgTagsList = getAllImageTags();

    var html = '<div class="cp-view cp-view-images">';
    html += '<div class="cp-view-header"><div class="cp-view-header-left"><h1>' + icon('images') + ' Reference Images</h1>';
    html += '<span class="cp-view-subtitle">' + (S.images || []).length + ' image' + ((S.images || []).length !== 1 ? 's' : '') + '</span></div>';
    html += '<div class="cp-view-header-right">';
    html += '<button class="cp-btn cp-btn-primary" data-action="upload-image">' + icon('upload') + ' Upload</button>';
    html += '</div></div>';

    // Filter bar
    html += '<div class="cp-img-filters">';
    html += '<div class="cp-search-wrapper"><span class="cp-icon">' + icon('search') + '</span>';
    html += '<input type="text" class="cp-input" id="cpImgSearch" placeholder="Search images..." value="' + esc((S.imageFilter && S.imageFilter.search) || '') + '"></div>';
    html += '<select class="cp-select cp-select-sm cp-img-filter" data-filter="category"><option value="">All Categories</option>';
    for (var ci = 0; ci < cats.length; ci++) html += '<option value="' + esc(cats[ci].id) + '"' + ((S.imageFilter && S.imageFilter.category) === cats[ci].id ? ' selected' : '') + '>' + esc(cats[ci].label) + '</option>';
    html += '</select>';
    if (allImgTagsList.length > 0) {
      html += '<select class="cp-select cp-select-sm cp-img-filter" data-filter="tag"><option value="">All Tags</option>';
      for (var ti = 0; ti < allImgTagsList.length; ti++) html += '<option value="' + esc(allImgTagsList[ti]) + '"' + ((S.imageFilter && S.imageFilter.tag) === allImgTagsList[ti] ? ' selected' : '') + '>' + esc(allImgTagsList[ti]) + '</option>';
      html += '</select>';
    }
    html += '<button class="cp-btn cp-btn-sm' + ((S.imageFilter && S.imageFilter.star) ? ' cp-btn-primary' : ' cp-btn-outline') + '" data-action="toggle-img-star-filter">' + icon('star') + ' Starred</button>';
    html += '</div>';

    // Gallery
    if (imgs.length === 0) {
      html += '<div class="cp-empty-state"><div class="cp-empty-state-icon">' + icon('images') + '</div>';
      if (!S.images || S.images.length === 0) {
        if (!S.$imageField || !S.$imageField.length) {
          html += '<div class="cp-empty-state-title">Image field not configured</div>';
          html += '<div class="cp-empty-state-text">To use reference images, add a <strong>field_images</strong> (Image, multi-value) field to your Campaign Planner content type in Drupal. Then upload images on this node.</div>';
          html += '<div class="cp-card" style="margin-top:var(--cp-space-3);padding:var(--cp-space-3);text-align:left;max-width:400px;margin-left:auto;margin-right:auto">';
          html += '<div class="cp-field-label">Drupal Setup Steps</div>';
          html += '<ol style="margin:var(--cp-space-2) 0 0;padding-left:var(--cp-space-4);font-size:var(--cp-font-size-sm);color:var(--cp-text-secondary);line-height:1.8">';
          html += '<li>Go to Admin → Structure → Content types → Campaign Planner → Manage fields</li>';
          html += '<li>Add field: <strong>field_images</strong> (type: Image, cardinality: Unlimited)</li>';
          html += '<li>Save, then reload this page</li>';
          html += '</ol></div>';
        } else {
          html += '<div class="cp-empty-state-title">No reference images yet</div>';
          html += '<div class="cp-empty-state-text">Upload brand reference images to build your visual library. These can be used in recipe creative briefs, AI image prompts, and campaign creative direction.</div>';
          html += '<button class="cp-btn cp-btn-primary" data-action="upload-image">' + icon('upload') + ' Upload First Image</button>';
        }
      } else {
        html += '<div class="cp-empty-state-title">No matches</div>';
        html += '<div class="cp-empty-state-text">Try adjusting your filters.</div>';
      }
      html += '</div>';
    } else {
      html += '<div style="display:flex;gap:var(--cp-space-4)">';
      html += '<div style="flex:1"><div class="cp-img-grid">';
      for (var gi = 0; gi < imgs.length; gi++) html += renderImageCard(imgs[gi]);
      html += '</div></div>';

      // Detail panel
      if (S.selectedImageId) {
        var selImg = S.imageMap[S.selectedImageId];
        if (selImg) {
          var meta = (S.meta.reference_images && S.meta.reference_images[selImg.fid]) || {};
          html += '<div class="cp-img-detail">';
          html += '<div class="cp-img-detail-preview"><img src="' + esc(selImg.url) + '" alt="' + esc(selImg.filename) + '"></div>';
          html += '<h3 style="margin-bottom:var(--cp-space-2)">' + esc(selImg.filename) + '</h3>';
          html += '<div class="cp-form-group"><label class="cp-field-label">Category</label>';
          html += '<select class="cp-select cp-img-meta-field" data-meta-field="category">';
          html += '<option value="">None</option>';
          for (var mci = 0; mci < cats.length; mci++) html += '<option value="' + esc(cats[mci].id) + '"' + (meta.category === cats[mci].id ? ' selected' : '') + '>' + esc(cats[mci].label) + '</option>';
          html += '</select></div>';
          html += '<div class="cp-form-group"><label class="cp-field-label">Description</label>';
          html += '<textarea class="cp-textarea cp-img-meta-field" data-meta-field="description" rows="2" placeholder="Describe this image...">' + esc(meta.description || '') + '</textarea></div>';
          html += '<div class="cp-form-group"><label class="cp-field-label">Tags (comma-separated)</label>';
          html += '<input type="text" class="cp-input cp-img-meta-field" data-meta-field="tags" value="' + esc((meta.tags || []).join(', ')) + '" placeholder="studio, product, lifestyle"></div>';
          html += '<div style="margin-top:var(--cp-space-2)"><label style="display:flex;align-items:center;gap:var(--cp-space-2);cursor:pointer"><input type="checkbox" class="cp-img-meta-field" data-meta-field="star"' + (meta.star ? ' checked' : '') + '> ' + icon('star') + ' Starred</label></div>';

          // Usage tracking — which recipes use this image
          var usedInRecipes = (S.data.recipes || []).filter(function(r) {
            return (r.image_brief && r.image_brief.reference_image_ids || []).indexOf(selImg.fid) > -1;
          });
          if (usedInRecipes.length > 0) {
            html += '<div style="margin-top:var(--cp-space-3);border-top:1px solid var(--cp-border-light);padding-top:var(--cp-space-2)">';
            html += '<div class="cp-field-label">' + icon('shuffle') + ' Used in ' + usedInRecipes.length + ' recipe' + (usedInRecipes.length !== 1 ? 's' : '') + '</div>';
            for (var uri = 0; uri < usedInRecipes.length; uri++) {
              html += '<div style="font-size:11px;color:var(--cp-text-secondary);padding:2px 0;cursor:pointer" data-action="select-recipe" data-id="' + esc(usedInRecipes[uri].id) + '">' + icon('arrow-right') + ' ' + esc(truncate(usedInRecipes[uri].title, 25)) + '</div>';
            }
            html += '</div>';
          }

          // Campaign association
          var campId = (meta && meta.campaign_id) || '';
          var camps = S.data.campaigns || [];
          if (camps.length > 0) {
            html += '<div class="cp-form-group" style="margin-top:var(--cp-space-3)"><label class="cp-field-label">' + icon('bullhorn') + ' Campaign</label>';
            html += '<select class="cp-select cp-img-meta-field" data-meta-field="campaign_id">';
            html += '<option value="">None</option>';
            for (var cmi = 0; cmi < camps.length; cmi++) {
              html += '<option value="' + esc(camps[cmi].id) + '"' + (campId === camps[cmi].id ? ' selected' : '') + '>' + esc(camps[cmi].name) + '</option>';
            }
            html += '</select></div>';
          }

          html += '<div style="margin-top:var(--cp-space-3)"><button class="cp-btn cp-btn-primary cp-btn-sm" data-action="save-img-meta">' + icon('check') + ' Save</button></div>';
          html += '</div>';
        }
      }
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  function renderImageCard(img) {
    var meta = (S.meta.reference_images && S.meta.reference_images[img.fid]) || {};
    var sel = S.selectedImageId === img.fid ? ' cp-img-card-selected' : '';
    var html = '<div class="cp-img-card' + sel + '" data-action="select-image" data-fid="' + esc(img.fid) + '">';
    html += '<div class="cp-img-card-thumb"><img src="' + esc(img.url) + '" alt="' + esc(img.filename) + '" loading="lazy"></div>';
    html += '<div class="cp-img-card-body">';
    html += '<div class="cp-img-card-name">' + esc(img.filename) + '</div>';
    html += '<div class="cp-img-card-meta">';
    if (meta.star) html += '<span style="color:#f59e0b">' + icon('star') + '</span>';
    if (meta.category) {
      var cat = (S.meta.image_categories || []).find(function(c) { return c.id === meta.category; });
      if (cat) html += '<span>' + esc(cat.label) + '</span>';
    }
    html += '</div></div></div>';
    return html;
  }

  function saveImageMeta() {
    if (!S.selectedImageId) return;
    var fid = S.selectedImageId;
    S.meta.reference_images = S.meta.reference_images || {};
    S.meta.reference_images[fid] = S.meta.reference_images[fid] || {};
    var meta = S.meta.reference_images[fid];
    $('.cp-img-meta-field').each(function() {
      var field = $(this).data('meta-field');
      if (field === 'star') meta[field] = $(this).is(':checked');
      else if (field === 'tags') meta[field] = $(this).val().split(',').map(function(t) { return t.trim(); }).filter(Boolean);
      else meta[field] = $(this).val() || '';
    });
    syncToTextarea(); toast('Image metadata saved', 'success');
  }

  function triggerImageUpload() {
    if (!S.$imageField || !S.$imageField.length) {
      toast('Image field not found on this page. Add a field_images (Image, multi-value) field to this content type.', 'error', 6000);
      return;
    }
    // Temporarily show the hidden Drupal image field widget
    S.$imageField.show();
    // Find the last empty file input slot
    var $fileInputs = S.$imageField.find('input[type="file"]');
    var $emptySlot = $fileInputs.filter(function() { return !$(this).val(); }).last();
    if (!$emptySlot.length) {
      toast('No upload slots available — save the node first to get more slots', 'warning');
      S.$imageField.hide();
      return;
    }
    var _checkCount = 0;
    var _prevCount = (S.images || []).length;
    toast('Drupal upload dialog opened — select your image', 'info');
    $emptySlot.trigger('click');
    // Poll for new image after Drupal AJAX upload completes
    var pollTimer = setInterval(function() {
      _checkCount++;
      parseImageField();
      if ((S.images || []).length > _prevCount) {
        clearInterval(pollTimer);
        S.$imageField.hide();
        var newImg = S.images[S.images.length - 1];
        S.selectedImageId = newImg.fid;
        logActivity('image_uploaded', '', '', 'Uploaded reference image: ' + (newImg.filename || 'image'));
        buildMaps(); render();
        toast('Image uploaded! Add metadata below.', 'success');
      } else if (_checkCount > 120) { // 60 seconds timeout
        clearInterval(pollTimer);
        S.$imageField.hide();
        toast('Upload timed out. If you selected a file, try saving the node first, then re-open.', 'warning');
      }
    }, 500);
  }

  function setupImagesEvents() {
    // Images events handled in setupPart2BEvents
  }


/* ===== src/30-part2b/25-image-picker.js ===== */
  // ============================================================
  // SECTION 21: IMAGE PICKER (Reusable Modal)
  // ============================================================

  function renderImagePicker(selectedIds, onSelect) {
    selectedIds = selectedIds || [];
    var imgs = S.images || [];
    if (imgs.length === 0) {
      openModal('Select Images', '<div class="cp-empty-state cp-empty-state--compact"><p>No reference images available.</p><button class="cp-btn cp-btn-primary cp-btn-sm" data-action="upload-image">' + icon('upload') + ' Upload Images</button></div>', { footer: false, size: 'md' });
      return;
    }

    var html = '<div class="cp-img-picker">';
    html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-3)">Click images to select. Selected images will be used as visual references for this recipe\'s creative brief and AI prompts.</p>';
    html += '<div class="cp-img-picker-grid">';
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      var isSel = selectedIds.indexOf(img.fid) > -1;
      var meta = (S.meta.reference_images && S.meta.reference_images[img.fid]) || {};
      html += '<div class="cp-img-picker-item' + (isSel ? ' cp-img-picker-item-selected' : '') + '" data-fid="' + esc(img.fid) + '">';
      html += '<input type="checkbox" data-fid="' + esc(img.fid) + '"' + (isSel ? ' checked' : '') + ' style="position:absolute;top:6px;left:6px;z-index:1">';
      html += '<img src="' + esc(img.url) + '" alt="' + esc(img.filename) + '">';
      html += '<div class="cp-img-picker-label">';
      if (meta.star) html += '<span style="color:#f59e0b">' + icon('star') + '</span> ';
      html += esc(truncate(img.filename, 16));
      if (meta.category) {
        var cat = (S.meta.image_categories || []).find(function(c) { return c.id === meta.category; });
        if (cat) html += '<div style="font-size:10px;color:var(--cp-text-muted)">' + esc(cat.label) + '</div>';
      }
      html += '</div>';
      html += '</div>';
    }
    html += '</div></div>';

    openModal('Select Reference Images', html, {
      size: 'lg', saveLabel: 'Select',
      onSave: function() {
        var selected = [];
        $('.cp-img-picker-item input:checked').each(function() { selected.push($(this).data('fid')); });
        if (onSelect) onSelect(selected);
        closeModal();
      }
    });

    // Toggle selection on click
    setTimeout(function() {
      $('.cp-img-picker-item').off('click.picker').on('click.picker', function(e) {
        if ($(e.target).is('input')) return;
        var $cb = $(this).find('input');
        $cb.prop('checked', !$cb.prop('checked'));
        $(this).toggleClass('cp-img-picker-item-selected', $cb.prop('checked'));
      });
    }, 50);
  }


/* ===== src/30-part2b/26-events-keyboard.js ===== */
  // ============================================================
  // SECTION 22: EVENTS & KEYBOARD SHORTCUTS
  // ============================================================

  function setupPart2BEvents() {
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

    // AI Improve content
    $(document).off('click.cp2b-ai-improve').on('click.cp2b-ai-improve', '[data-action="ai-improve-content"]', function(e) {
      e.preventDefault(); aiImproveContent($(this).data('recipe-id'), _getAICustomInstructions(this));
    });

    // Export — copy ad copy to clipboard
    $(document).off('click.cp2b-copy-content').on('click.cp2b-copy-content', '[data-action="copy-recipe-content"]', function(e) {
      e.preventDefault();
      var recipe = getRecipe($(this).data('recipe-id'));
      if (!recipe) return;
      var content = recipe.content || {};
      var text = '';
      if (content.headline) text += content.headline + '\n\n';
      text += stripHtml(content.ad_copy || '');
      if (content.cta) text += '\n\n[CTA: ' + content.cta + ']';
      copyToClipboard(text, 'Ad copy copied to clipboard');
    });
    $(document).off('click.cp2b-copy-brief').on('click.cp2b-copy-brief', '[data-action="copy-recipe-brief"]', function(e) {
      e.preventDefault();
      var recipe = getRecipe($(this).data('recipe-id'));
      if (!recipe) return;
      var brief = (recipe.image_brief && recipe.image_brief.creative_brief) || '';
      var prompt = (recipe.image_brief && recipe.image_brief.ai_prompt) || '';
      var text = 'Creative Brief:\n' + brief;
      if (prompt) text += '\n\nAI Prompt:\n' + prompt;
      copyToClipboard(text, 'Creative brief copied to clipboard');
    });
    $(document).off('click.cp2b-export-json').on('click.cp2b-export-json', '[data-action="export-recipe-json"]', function(e) {
      e.preventDefault();
      var recipe = getRecipe($(this).data('recipe-id'));
      if (!recipe) return;
      var json = JSON.stringify(recipe, null, 2);
      var blob = new Blob([json], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = (recipe.title || 'recipe').replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.json';
      a.click();
      URL.revokeObjectURL(url);
      toast('Recipe exported as JSON', 'success');
    });

    function copyToClipboard(text, msg) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() { toast(msg || 'Copied!', 'success'); }).catch(function() { fallbackCopy(text, msg); });
      } else { fallbackCopy(text, msg); }
    }
    function fallbackCopy(text, msg) {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast(msg || 'Copied!', 'success'); } catch(e) { toast('Copy failed — select and copy manually', 'warning'); }
      document.body.removeChild(ta);
    }
    $(document).off('click.cp2b-ai-hook').on('click.cp2b-ai-hook', '[data-action="ai-generate-hook"]', function(e) {
      e.preventDefault(); aiGenerateHook($(this).data('recipe-id'), _getAICustomInstructions(this));
    });
    $(document).off('click.cp2b-ai-content').on('click.cp2b-ai-content', '[data-action="ai-generate-content"]', function(e) {
      e.preventDefault(); aiWriteContent($(this).data('recipe-id'), _getAICustomInstructions(this));
    });
    $(document).off('click.cp2b-ai-brief').on('click.cp2b-ai-brief', '[data-action="ai-generate-brief"]', function(e) {
      e.preventDefault(); aiGenerateBrief($(this).data('recipe-id'), _getAICustomInstructions(this));
    });
    $(document).off('click.cp2b-ai-prompt').on('click.cp2b-ai-prompt', '[data-action="ai-generate-prompt"]', function(e) {
      e.preventDefault(); aiGenerateImagePrompt($(this).data('recipe-id'), _getAICustomInstructions(this));
    });
    $(document).off('click.cp2b-ai-blueprint').on('click.cp2b-ai-blueprint', '[data-action="ai-generate-blueprint"]', function(e) {
      e.preventDefault(); aiGenerateBlueprint($(this).data('recipe-id'), _getAICustomInstructions(this));
    });
    $(document).off('click.cp2b-ai-script').on('click.cp2b-ai-script', '[data-action="ai-generate-script"]', function(e) {
      e.preventDefault(); aiGenerateScript($(this).data('recipe-id'), _getAICustomInstructions(this));
    });

    // AI research pain points (from persona detail)
    $(document).off('click.cp2b-ai-pp').on('click.cp2b-ai-pp', '[data-action="ai-research-pain-points"]', function(e) {
      e.preventDefault();
      aiResearchPainPoints($(this).data('persona-id'));
    });

    // AI campaign recipe suggestions
    $(document).off('click.cp2b-ai-camp').on('click.cp2b-ai-camp', '[data-action="ai-campaign-recipes"]', function(e) {
      e.preventDefault();
      aiSuggestCampaignRecipes($(this).data('campaign-id'));
    });

    // AI campaign brief generation
    $(document).off('click.cp2b-ai-camp-brief').on('click.cp2b-ai-camp-brief', '[data-action="ai-campaign-brief"]', function(e) {
      e.preventDefault();
      aiGenerateCampaignBrief($(this).data('campaign-id'));
    });

    // AI campaign gap analysis
    $(document).off('click.cp2b-ai-camp-gaps').on('click.cp2b-ai-camp-gaps', '[data-action="ai-campaign-gaps"]', function(e) {
      e.preventDefault();
      aiAnalyzeCampaignGaps($(this).data('campaign-id'));
    });

    // Wizard AI suggest (from wizard step 3)
    $(document).off('click.cp2b-wizard-ai').on('click.cp2b-wizard-ai', '[data-action="wizard-ai-suggest"]', function(e) {
      e.preventDefault();
      // Use the wizard's selected dimensions to run campaign AI suggestion
      var P2A = window._cpPart2A;
      if (!P2A || !P2A.wizardState) return;
      var ws = P2A.wizardState;
      if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
      toast('AI analyzing combinations...', 'info');

      // Build a lightweight prompt for prioritizing combos
      var personas = ws.selections.personas.map(function(id) { var p = S.personaMap[id]; return p ? p.name : ''; }).filter(Boolean);
      var messages = ws.selections.messages.map(function(id) { var m = S.messageMap[id]; return m ? m.title : ''; }).filter(Boolean);
      var styles = ws.selections.styles.map(function(id) { var s = S.styleMap[id]; return s ? s.name : ''; }).filter(Boolean);
      var formats = ws.selections.formats.map(function(id) { var f = S.formatMap[id]; return f ? f.name : ''; }).filter(Boolean);

      var prompt = 'You are a campaign strategist. Given these dimensions, identify the top 6-8 best recipe combinations (persona × message × style × format). Rank by expected performance.\n\n';
      prompt += 'Personas: ' + personas.join(', ') + '\n';
      prompt += 'Messages: ' + messages.join(', ') + '\n';
      prompt += 'Styles: ' + styles.join(', ') + '\n';
      prompt += 'Formats: ' + formats.join(', ') + '\n';
      if (ws.data.objective) { var obj = (Constants.CAMPAIGN_OBJECTIVES || []).find(function(o) { return o.id === ws.data.objective; }); if (obj) prompt += 'Objective: ' + obj.name + '\n'; }
      prompt += brandSnippet('research');
      prompt += '\n\nRespond ONLY as JSON: {"best":[{"persona":"name","message":"name","style":"name","format":"name"}]}';

      callAIWithRetry(prompt, function(text) {
        var parsed = parseJSON(text);
        var best = parsed.best || [];
        // Mark matching wizard recipes as selected
        ws.recipes.forEach(function(r) { r.selected = false; });
        best.forEach(function(b) {
          var match = ws.recipes.find(function(r) {
            var pOk = !b.persona || (S.personaMap[r.persona_id] && S.personaMap[r.persona_id].name === b.persona);
            var mOk = !b.message || (S.messageMap[r.message_id] && S.messageMap[r.message_id].title === b.message);
            var sOk = !b.style || (S.styleMap[r.style_id] && S.styleMap[r.style_id].name === b.style);
            var fOk = !b.format || (S.formatMap[r.visual_format_id] && S.formatMap[r.visual_format_id].name === b.format);
            return pOk && mOk && sOk && fOk && !r.selected;
          });
          if (match) match.selected = true;
        });
        P2A.openCampaignWizard ? renderWizardRefresh() : null;
        toast('AI selected ' + best.length + ' best combinations', 'success');

        function renderWizardRefresh() {
          // Re-render the wizard modal to show updated selections
          if (P2A.wizardState && P2A.wizardState.step === 3) {
            // Close and reopen to refresh
            closeModal();
            setTimeout(function() {
              P2A.wizardState.step = 3;
              if (typeof P2A.openCampaignWizard === 'function') {
                // Trigger re-render by opening step 3
                openModal('Campaign Wizard', '', { size: 'xl' });
                closeModal();
                P2A.openCampaignWizard.__renderStep3 ? P2A.openCampaignWizard.__renderStep3() : null;
              }
              render();
            }, 100);
          }
        }
      }, function(err) { toast('AI Error: ' + err, 'error'); }, 'ai-wizard-suggest', BrandService.getSystemPrompt('research'), parseJSON);
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

    // --- Images View ---
    $(document).off('click.cp2b-select-img').on('click.cp2b-select-img', '[data-action="select-image"]', function(e) {
      e.preventDefault();
      S.selectedImageId = $(this).data('fid');
      render();
    });
    $(document).off('click.cp2b-save-img-meta').on('click.cp2b-save-img-meta', '[data-action="save-img-meta"]', function(e) {
      e.preventDefault(); saveImageMeta();
    });
    $(document).off('input.cp2b-img-search').on('input.cp2b-img-search', '#cpImgSearch', function() {
      S.imageFilter = S.imageFilter || {};
      S.imageFilter.search = $(this).val() || '';
      render();
    });
    $(document).off('change.cp2b-img-filter').on('change.cp2b-img-filter', '.cp-img-filter', function() {
      var filterKey = $(this).data('filter');
      S.imageFilter = S.imageFilter || {};
      S.imageFilter[filterKey] = $(this).val() || '';
      render();
    });
    $(document).off('click.cp2b-img-star-filter').on('click.cp2b-img-star-filter', '[data-action="toggle-img-star-filter"]', function(e) {
      e.preventDefault();
      S.imageFilter = S.imageFilter || {};
      S.imageFilter.star = !S.imageFilter.star;
      render();
    });
    $(document).off('click.cp2b-upload-img').on('click.cp2b-upload-img', '[data-action="upload-image"]', function(e) {
      e.preventDefault();
      triggerImageUpload();
    });
    // Pick ref images (from recipe media step)
    $(document).off('click.cp2b-pick-refs').on('click.cp2b-pick-refs', '[data-action="pick-ref-images"]', function(e) {
      e.preventDefault();
      var recipeId = $(this).data('recipe-id');
      var recipe = getRecipe(recipeId);
      if (!recipe) return;
      var current = (recipe.image_brief && recipe.image_brief.reference_image_ids) || [];
      renderImagePicker(current, function(selected) {
        recipe.image_brief = recipe.image_brief || {};
        recipe.image_brief.reference_image_ids = selected;
        recipe.updated = new Date().toISOString();
        syncToTextarea(); buildMaps(); render();
        toast('Reference images updated', 'success');
      });
    });

    // Remove individual reference image from recipe
    $(document).off('click.cp2b-remove-ref').on('click.cp2b-remove-ref', '[data-action="remove-ref-image"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var recipeId = $(this).data('recipe-id');
      var fid = $(this).data('fid');
      var recipe = getRecipe(recipeId);
      if (!recipe || !fid) return;
      recipe.image_brief = recipe.image_brief || {};
      recipe.image_brief.reference_image_ids = (recipe.image_brief.reference_image_ids || []).filter(function(id) { return id !== fid; });
      recipe.updated = new Date().toISOString();
      syncToTextarea(); buildMaps(); render();
      toast('Reference image removed', 'success');
    });

    console.log('[CP] Part 2B event handlers ready');
  }

  function setupKeyboardShortcuts() {
    var viewKeys = { '1': 'dashboard', '2': 'personas', '3': 'pain_points', '4': 'messages', '5': 'styles', '6': 'formats', '7': 'recipes', '8': 'campaigns', '9': 'research', '0': 'settings' };

    $(document).off('keydown.cp2b-shortcuts').on('keydown.cp2b-shortcuts', function(e) {
      // Skip if inside input/textarea or modal open
      if ($(e.target).is('input, textarea, select, [contenteditable]')) return;
      if ($('.cp-modal-backdrop').length || $('.cp-confirm-backdrop').length) return;

      // Number keys → navigate
      if (viewKeys[e.key]) { e.preventDefault(); navigate(viewKeys[e.key]); return; }
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
        if (view === 'personas') P2A.openPersonaModal();
        else if (view === 'pain_points') P2A.openPainPointModal();
        else if (view === 'messages') P2A.openMessageModal();
        else if (view === 'styles') P2A.openStyleModal();
        else if (view === 'formats') P2A.openFormatModal();
        else if (view === 'campaigns') P2A.openCampaignModal();
        else if (view === 'recipes') P2A.openMixerModal('manual');
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
    brandSnippet: brandSnippet, recipeContextSnippet: recipeContextSnippet,
    entityContextSnippet: entityContextSnippet,

    // Components
    renderAIResearchPanelBody: renderAIResearchPanelBody,
    renderInlineAIAssist: renderInlineAIAssist,
    renderInlinePicker: LLMService.renderInlinePicker,

    // AI actions
    aiResearchPersonas: aiResearchPersonas, aiResearchPainPoints: aiResearchPainPoints,
    aiResearchMessages: aiResearchMessages, aiResearchStyles: aiResearchStyles,
    aiResearchFormats: aiResearchFormats,
    aiGenerateHook: aiGenerateHook, aiWriteContent: aiWriteContent,
    aiGenerateBrief: aiGenerateBrief, aiGenerateImagePrompt: aiGenerateImagePrompt,
    aiGenerateBlueprint: aiGenerateBlueprint, aiGenerateScript: aiGenerateScript,
    aiSuggestCampaignRecipes: aiSuggestCampaignRecipes,
    aiGenerateCampaignBrief: aiGenerateCampaignBrief,
    aiAnalyzeCampaignGaps: aiAnalyzeCampaignGaps,
    aiImproveContent: aiImproveContent,
    showAIPreview: showAIPreview,

    // Setup Wizard AI generators + finalize
    swAIGeneratePersonas: swAIGeneratePersonas, swAIGeneratePainPoints: swAIGeneratePainPoints,
    swAIGenerateMessages: swAIGenerateMessages, swAIGenerateStylesFormats: swAIGenerateStylesFormats,
    finalizeSetupWizard: finalizeSetupWizard,

    // Status
    updateAIStatusIndicator: updateAIStatusIndicator, testAIConnection: testAIConnection,

    // Settings & Config
    saveAllSettings: saveAllSettings, addFunnelStage: addFunnelStage,
    exportJSON: exportJSON, importJSON: importJSON,

    // Images
    renderImagePicker: renderImagePicker, saveImageMeta: saveImageMeta,
    triggerImageUpload: triggerImageUpload
  };

  console.log('[CP] Part 2B loaded');

})(jQuery, Drupal);
