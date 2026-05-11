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
        var allArrays = [S.data.personas, S.data.messages, S.data.styles, S.data.visual_formats, S.data.recipes, S.data.campaigns];
        allArrays.forEach(function(arr) {
          (arr || []).forEach(function(item) {
            if (item.tags) item.tags = item.tags.filter(function(tid) { return tid !== id; });
          });
        });
        if (S.selectedTagId === id) S.selectedTagId = null;
        logActivity('tag_deleted', 'tag', id, entityTitle, 'Deleted tag');
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
      pain_point: S.data.pain_points, persona_category: S.data.persona_categories, tag: S.data.tags
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

    buildMaps();
    syncToTextarea();
    renderCurrentView();
  }

  function duplicateEntity(type, id) {
    var collections = {
      persona: S.data.personas, message: S.data.messages, style: S.data.styles,
      visual_format: S.data.visual_formats, recipe: S.data.recipes, campaign: S.data.campaigns
    };
    var coll = collections[type];
    if (!coll) return null;

    var source = coll.find(function(e) { return e.id === id; });
    if (!source) return null;

    var clone = deepClone(source);
    clone.id = generateId(type.substring(0, 3));
    clone.created = new Date().toISOString();
    clone.updated = clone.created;
    clone.created_by = S.user.id || '';
    if (clone.title) clone.title += ' (copy)';
    if (clone.name) clone.name += ' (copy)';
    if (type === 'recipe') { clone.status = 'draft'; clone.batch_id = ''; clone.review_notes = ''; clone.assigned_to = ''; }

    coll.push(clone);
    logActivity(type + '_created', type, clone.id, clone.title || clone.name, 'Duplicated');
    buildMaps();
    syncToTextarea();
    renderCurrentView();
    toast(capitalize(type.replace(/_/g, ' ')) + ' duplicated', 'success');
    return clone;
  }

  function capitalize(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''; }

