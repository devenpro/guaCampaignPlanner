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

    // Replace AI picker loading placeholders
    $('.cp-ai-picker-loading').each(function() {
      var actionId = $(this).data('pending-action');
      if (actionId) $(this).replaceWith(LLMService.renderInlinePicker(actionId));
    });

    updateAIStatusIndicator();
    S._part2bTimeout = false;

    if (render) render();
    console.log('[CP] Part 2B initialized — renderers: research, settings, images');
    } catch(e) {
      console.error('[CP] Part 2B init FAILED:', e.message, e.stack);
      if (window._cpToast) window._cpToast('Part 2B init error: ' + e.message, 'error');
    }
  }

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
