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

