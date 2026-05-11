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

