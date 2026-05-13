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
      reference_images: {},
      image_categories: getDefaultImageCategories(),
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
      vf.reference_image_ids = vf.reference_image_ids || [];
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
      a.media.image = a.media.image || { asset_id: '', prompt: '', aspect_ratio: '1:1', reference_image_ids: [] };
      a.media.image.reference_image_ids = a.media.image.reference_image_ids || [];
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
    m.reference_images = m.reference_images || {};
    m.image_categories = m.image_categories || getDefaultImageCategories();

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

