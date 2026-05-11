  // ============================================================
  // SECTION 4: MIGRATION & DEFAULTS
  // ============================================================

  function getDefaultData() {
    return {
      persona_categories: [], personas: [], pain_points: [],
      messages: [], styles: [], visual_formats: [],
      recipes: [], campaigns: [], tags: [],
      research_sessions: []
    };
  }

  function getDefaultMeta() {
    return {
      workspace: { name: '', description: '', created: new Date().toISOString() },
      setup: { product_name: '', objective: '', custom_instructions: '', setup_complete: false },
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
      image_categories: getDefaultImageCategories()
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

  function migrateMeta() {
    var m = S.meta;
    m.workspace = m.workspace || { name: '', description: '', created: new Date().toISOString() };
    m.setup = m.setup || { product_name: '', objective: '', custom_instructions: '', setup_complete: false };
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

    S.cardDensity = m.settings.card_density;
    S.currentView = readHash();
  }

