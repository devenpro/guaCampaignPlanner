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

