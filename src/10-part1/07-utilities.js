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

