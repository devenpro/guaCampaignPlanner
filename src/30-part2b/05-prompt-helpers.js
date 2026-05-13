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

