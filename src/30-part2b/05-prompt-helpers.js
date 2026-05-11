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

