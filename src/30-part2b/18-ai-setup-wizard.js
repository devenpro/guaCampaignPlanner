  // ============================================================
  // SECTION 15b: SETUP WIZARD AI GENERATORS
  // ============================================================

  // Strict-JSON rules appended to every prompt to discourage prose / markdown.
  var SW_JSON_RULES =
    '\n\nRules: Respond with RAW JSON ONLY. No markdown fences. No preamble. ' +
    'No prose before, after, or between fields. If a value is unknown, return ' +
    'an empty string rather than text like "N/A" or "unknown".';

  function _swState() {
    return window._cpPart2A && window._cpPart2A.setupWizardState;
  }

  function _swRefresh() {
    if (window._cpPart2A && typeof window._cpPart2A.refreshSetupWizard === 'function') {
      window._cpPart2A.refreshSetupWizard();
    }
  }

  // Consistent workspace context block injected into every prompt.
  function _swWorkspaceBlock(ws) {
    var lines = ['Workspace context:'];
    if (ws.name)               lines.push('Workspace: ' + ws.name);
    if (ws.product_name)       lines.push('Product: ' + ws.product_name);
    if (ws.description)        lines.push('Description: ' + ws.description);
    if (ws.target_audience)    lines.push('Target audience: ' + ws.target_audience);
    if (ws.brand_voice)        lines.push('Brand voice: ' + ws.brand_voice);
    if (ws.objective)          lines.push('Objective hint: ' + ws.objective);
    if (ws.custom_instructions) lines.push('Custom instructions: ' + ws.custom_instructions);
    return lines.join('\n') + '\n';
  }

  // The "key" passed in is a string label (personas, painpoints, messages,
  // stylesFormats, campaignIdeas). It's used both for the generation-done
  // flag and the lastGeneratedAt timestamp.
  function _swBeginAI(state, key) {
    state.aiLoading   = true;
    state.aiActionId  = 'sw-ai-config';
    state.aiStartedAt = Date.now();
    state.aiError     = '';
    state.stepGenerated[key] = false;
  }

  function _swEndAISuccess(state, key) {
    state.aiLoading  = false;
    state.aiActionId = '';
    state.aiError    = '';
    state.stepGenerated[key] = true;
    state.created = state.created || {};
    state.created.lastGeneratedAt = state.created.lastGeneratedAt || {};
    state.created.lastGeneratedAt[key] = Date.now();
  }

  function _swEndAIError(state, key, err) {
    state.aiLoading  = false;
    state.aiActionId = '';
    state.aiError    = String(err || 'AI generation failed').substring(0, 240);
    state.stepGenerated[key] = true;
  }

  // After a successful generation, in Full Auto mode we may chain to the
  // next sub-stage (Stage 2: personas → painpoints) or schedule an auto-
  // advance to the next stage. These helpers live on Part 2A; this lets
  // Part 2B fire them without taking a direct reference.
  function _swSignalGenerated(key) {
    if (!window._cpPart2A) return;
    var P2A = window._cpPart2A;
    if (key === 'personas' && typeof P2A._swAfterPersonasGenerated === 'function') {
      P2A._swAfterPersonasGenerated();
    } else if (key === 'painpoints' && typeof P2A._swAfterPainPointsGenerated === 'function') {
      P2A._swAfterPainPointsGenerated();
    } else if (typeof P2A._swAfterStageGenerated === 'function') {
      P2A._swAfterStageGenerated();
    }
  }

  // ----- 1. Personas -----

  function swAIGeneratePersonas() {
    var state = _swState();
    if (!state) { console.warn('[SW] setupWizardState not available'); return; }
    if (state.aiLoading) return;
    if (!LLMService.isConfigured()) { state.aiError = 'AI not configured — check Settings → AI.'; _swRefresh(); return; }

    _swBeginAI(state, 'personas');
    _swRefresh();

    var ws    = state.workspace || {};
    var extra = state._personaContext || '';

    var prompt = 'You are a senior marketing strategist. Create 4-6 DISTINCT buyer persona profiles for the product below. Each persona must be measurably different — different role, different psychographics, different demographics.\n\n';
    prompt += _swWorkspaceBlock(ws);
    if (extra) prompt += 'Additional persona context: ' + extra + '\n';
    prompt += brandSnippet('persona');
    prompt += '\n\nSchema (return ONLY a JSON array of objects matching this shape):\n';
    prompt += '[{ "name": "The [Type] [Role]",\n';
    prompt += '   "description": "1-2 sentence character summary anchored in their job-to-be-done",\n';
    prompt += '   "demographics": {\n';
    prompt += '     "age_range": "NN-NN",\n';
    prompt += '     "gender": "Male|Female|Mixed|Non-binary|All",\n';
    prompt += '     "location": "Region or city archetype",\n';
    prompt += '     "occupation": "Specific job title",\n';
    prompt += '     "income_level": "$X-$Y or qualitative",\n';
    prompt += '     "education": "level",\n';
    prompt += '     "industry": "industry vertical"\n';
    prompt += '   },\n';
    prompt += '   "psychographics": {\n';
    prompt += '     "desires": "1 sentence — what they want most",\n';
    prompt += '     "fears": "1 sentence — what blocks them",\n';
    prompt += '     "motivations": "1 sentence — what drives action",\n';
    prompt += '     "values": "1 sentence — what they believe in"\n';
    prompt += '   } }]';
    prompt += SW_JSON_RULES;

    callAIWithRetry(prompt, function(parsed) {
      var arr = Array.isArray(parsed) ? parsed : (parsed && parsed.personas ? parsed.personas : []);
      var clean = arr
        .filter(function(p) { return p && p.name && p.description; })
        .slice(0, 6)
        .map(function(p) {
          return {
            name:           String(p.name).trim(),
            description:    String(p.description).trim(),
            demographics:   p.demographics  || {},
            psychographics: p.psychographics || {},
            _selected: true
          };
        });
      state.personas = clean;
      _swEndAISuccess(state, 'personas');
      _swRefresh();
      _swSignalGenerated('personas');
    }, function(err) {
      _swEndAIError(state, 'personas', err);
      _swRefresh();
    }, 'sw-ai-config', BrandService.getSystemPrompt('persona'), parseJSON);
  }

  // ----- 2. Pain Points -----

  function swAIGeneratePainPoints() {
    var state = _swState();
    if (!state) { console.warn('[SW] setupWizardState not available'); return; }
    if (state.aiLoading) return;
    if (!LLMService.isConfigured()) { state.aiError = 'AI not configured — check Settings → AI.'; _swRefresh(); return; }

    var selPersonas = (state.personas || []).filter(function(p) { return p._selected; });
    if (!selPersonas.length) {
      state.aiError = 'No personas selected yet. Select at least one persona above before generating pain points.';
      _swRefresh();
      return;
    }

    _swBeginAI(state, 'painpoints');
    _swRefresh();

    var ws    = state.workspace || {};
    var extra = state._ppContext || '';

    var personaLines = selPersonas.map(function(p, i) {
      var d = p.demographics || {};
      var line = i + '. ' + (p.name || 'Persona ' + i) + ' — ' + (p.description || '');
      if (d.occupation) line += ' [' + d.occupation + ']';
      return line;
    }).join('\n');

    var prompt = 'You are a marketing strategist. Generate 3-4 SPECIFIC pain points for EACH persona listed below. Pain points must be concrete (e.g. "spends 6 hrs/week reconciling spreadsheets") rather than abstract ("lacks time").\n\n';
    prompt += _swWorkspaceBlock(ws);
    prompt += '\nSelected personas (use persona_idx to match):\n' + personaLines + '\n';
    if (extra) prompt += '\nAdditional context: ' + extra + '\n';
    prompt += brandSnippet('persona');
    prompt += '\n\nSchema (return ONLY a JSON array):\n';
    prompt += '[{ "pain_point": "specific challenge they face",\n';
    prompt += '   "solution": "1 sentence: how this product solves it",\n';
    prompt += '   "category": "Productivity|Cost / Budget|Knowledge Gap|Competition|Growth",\n';
    prompt += '   "persona_idx": INTEGER (0 to ' + (selPersonas.length - 1) + ') }]';
    prompt += SW_JSON_RULES;

    callAIWithRetry(prompt, function(parsed) {
      var arr = Array.isArray(parsed) ? parsed : (parsed && parsed.pain_points ? parsed.pain_points : []);
      var allowedCats = { 'Productivity':1, 'Cost / Budget':1, 'Knowledge Gap':1, 'Competition':1, 'Growth':1 };
      var clean = arr
        .filter(function(pp) { return pp && pp.pain_point && String(pp.pain_point).trim(); })
        .map(function(pp) {
          // Clamp persona_idx into selPersonas range, then translate to real state.personas index
          var idx = parseInt(pp.persona_idx, 10);
          if (isNaN(idx) || idx < 0 || idx >= selPersonas.length) idx = 0;
          var realIdx = (state.personas || []).indexOf(selPersonas[idx]);
          var cat = pp.category && allowedCats[pp.category] ? pp.category : '';
          return {
            pain_point:   String(pp.pain_point).trim(),
            solution:     String(pp.solution || '').trim(),
            category:     cat,
            _persona_idx: realIdx >= 0 ? realIdx : 0,
            _selected:    true
          };
        });
      state.pain_points = clean;
      _swEndAISuccess(state, 'painpoints');
      _swRefresh();
      _swSignalGenerated('painpoints');
    }, function(err) {
      _swEndAIError(state, 'painpoints', err);
      _swRefresh();
    }, 'sw-ai-config', BrandService.getSystemPrompt('research'), parseJSON);
  }

  // ----- 3. Messages -----

  function swAIGenerateMessages() {
    var state = _swState();
    if (!state) return;
    if (state.aiLoading) return;
    if (!LLMService.isConfigured()) { state.aiError = 'AI not configured — check Settings → AI.'; _swRefresh(); return; }

    _swBeginAI(state, 'messages');
    _swRefresh();

    var ws            = state.workspace || {};
    var selPersonas   = (state.personas    || []).filter(function(p)  { return p._selected; });
    var selPainPoints = (state.pain_points || []).filter(function(pp) { return pp._selected; });
    var extra         = state._messageContext || '';

    var personaLines = selPersonas.slice(0, 4).map(function(p) {
      return '- ' + (p.name || 'Persona') + ': ' + (p.description || '');
    }).join('\n');

    var ppLines = selPainPoints.slice(0, 8).map(function(pp) {
      return '- ' + (pp.pain_point || '');
    }).join('\n');

    var prompt = 'You are a direct-response copywriter. Create 5-6 DISTINCT ad message angles for the product below. Each angle must use a different theme and different hook type. Each message body must be a usable starter for Meta primary text (≤180 chars).\n\n';
    prompt += _swWorkspaceBlock(ws);
    if (personaLines) prompt += '\nTarget personas:\n' + personaLines + '\n';
    if (ppLines)      prompt += '\nKey pain points to leverage:\n' + ppLines + '\n';
    if (extra)        prompt += '\nAdditional context: ' + extra + '\n';
    prompt += brandSnippet('content');
    prompt += '\n\nSchema (return ONLY a JSON array):\n';
    prompt += '[{ "name": "The [Angle Name]",\n';
    prompt += '   "description": "2 sentences: how this angle positions the product",\n';
    prompt += '   "theme": "Transformation|Social Proof|FOMO|Problem-Solution|Authority|Curiosity|Urgency",\n';
    prompt += '   "hook_type": "Bold Claim|Question|Shocking Stat|Story|Challenge|Testimonial",\n';
    prompt += '   "funnel_stage": "top|mid|bot",\n';
    prompt += '   "body": "1-2 sentence ad-ready primary text starter, ≤180 chars" }]';
    prompt += SW_JSON_RULES;

    callAIWithRetry(prompt, function(parsed) {
      var arr = Array.isArray(parsed) ? parsed : (parsed && parsed.messages ? parsed.messages : []);
      var clean = arr
        .filter(function(m) { return m && m.name && (m.description || m.body); })
        .slice(0, 6)
        .map(function(m) {
          return {
            name:         String(m.name).trim(),
            description:  String(m.description || '').trim(),
            theme:        String(m.theme || '').trim(),
            hook_type:    String(m.hook_type || '').trim(),
            funnel_stage: ['top','mid','bot'].indexOf(m.funnel_stage) >= 0 ? m.funnel_stage : 'top',
            body:         String(m.body || '').trim(),
            _selected:    true
          };
        });
      state.messages = clean;
      _swEndAISuccess(state, 'messages');
      _swRefresh();
      _swSignalGenerated('messages');
    }, function(err) {
      _swEndAIError(state, 'messages', err);
      _swRefresh();
    }, 'sw-ai-config', BrandService.getSystemPrompt('content'), parseJSON);
  }

  // ----- 4. Styles & Formats -----

  function swAIGenerateStylesFormats() {
    var state = _swState();
    if (!state) return;
    if (state.aiLoading) return;
    if (!LLMService.isConfigured()) { state.aiError = 'AI not configured — check Settings → AI.'; _swRefresh(); return; }

    _swBeginAI(state, 'stylesFormats');
    _swRefresh();

    var ws    = state.workspace || {};
    var extra = state._styleFormatContext || '';

    var prompt = 'You are a creative director and media strategist. Generate creative styles and ad formats for the product below. Styles describe the visual/tone treatment; formats describe the technical container (aspect ratio, platform).\n\n';
    prompt += _swWorkspaceBlock(ws);
    if (extra) prompt += 'Additional context: ' + extra + '\n';
    prompt += brandSnippet('content');
    prompt += '\n\nSchema (return ONLY a JSON object with two arrays):\n';
    prompt += '{\n';
    prompt += '  "styles":  [ { "name": "Style name", "description": "1-2 sentences: visual + creative direction" } ],\n';
    prompt += '  "formats": [ { "name": "Format name", "description": "1-2 sentences: specs + best use",\n';
    prompt += '                 "category": "Shoot|UGC|Graphic|Animation" } ]\n';
    prompt += '}\n';
    prompt += 'Generate 4-5 styles and 6-8 formats covering Meta Feed, Reels/Stories (9:16), TikTok-native, Square 1:1, and Carousel.';
    prompt += SW_JSON_RULES;

    callAIWithRetry(prompt, function(parsed) {
      var stylesArr  = (parsed && Array.isArray(parsed.styles))  ? parsed.styles  : [];
      var formatsArr = (parsed && Array.isArray(parsed.formats)) ? parsed.formats : [];
      var allowedCats = { 'Shoot':1, 'UGC':1, 'Graphic':1, 'Animation':1 };
      state.styles = stylesArr
        .filter(function(s) { return s && s.name && s.description; })
        .slice(0, 5)
        .map(function(s) {
          return { name: String(s.name).trim(), description: String(s.description).trim(), _selected: true };
        });
      state.formats = formatsArr
        .filter(function(f) { return f && f.name && f.description; })
        .slice(0, 8)
        .map(function(f) {
          var cat = f.category && allowedCats[f.category] ? f.category : '';
          return { name: String(f.name).trim(), description: String(f.description).trim(), category: cat, _selected: true };
        });
      _swEndAISuccess(state, 'stylesFormats');
      _swRefresh();
      _swSignalGenerated('stylesFormats');
    }, function(err) {
      _swEndAIError(state, 'stylesFormats', err);
      _swRefresh();
    }, 'sw-ai-config', BrandService.getSystemPrompt('content'), parseJSON);
  }

  // ----- 5. Campaign Ideas (Stage 5) -----
  //
  // Stage 5 produces a list of campaign IDEAS (just name + objective +
  // brief + target persona + message references). Each idea becomes a draft
  // campaign_v2 on launch — Ad Sets and Ads are built later by the
  // per-campaign wizard from the campaign workspace.

  function swAIGenerateCampaignIdeas() {
    var state = _swState();
    if (!state) return;
    if (state.aiLoading) return;
    if (!LLMService.isConfigured()) { state.aiError = 'AI not configured — check Settings → AI.'; _swRefresh(); return; }

    _swBeginAI(state, 'campaignIdeas');
    _swRefresh();

    var ws            = state.workspace || {};
    var selPersonas   = (state.personas    || []).filter(function(p)  { return p._selected; });
    var selPainPoints = (state.pain_points || []).filter(function(pp) { return pp._selected; });
    var selMessages   = (state.messages    || []).filter(function(m)  { return m._selected; });
    var extra         = state._campaignIdeasContext || '';

    if (!selPersonas.length) {
      _swEndAIError(state, 'campaignIdeas', 'No personas selected. Go back to Stage 2 and select at least one.');
      _swRefresh();
      return;
    }

    var personaLines = selPersonas.map(function(p, i) {
      var d = p.demographics || {};
      return i + '. ' + (p.name || 'Persona ' + i) + ' — ' + truncate(p.description || '', 90) + (d.occupation ? ' [' + d.occupation + ']' : '');
    }).join('\n');

    var ppLines = selPainPoints.slice(0, 8).map(function(pp) {
      return '- ' + truncate(pp.pain_point || '', 100);
    }).join('\n');

    var messageLines = selMessages.map(function(m, i) {
      return i + '. ' + (m.name || 'Message ' + i) + ' [' + (m.theme || '?') + '] — ' + truncate(m.description || m.body || '', 90);
    }).join('\n');

    var objList = Object.keys(Constants.META_OBJECTIVES).join(', ');

    var prompt = 'You are a Meta Ads strategist. Propose 3-5 distinct CAMPAIGN IDEAS for the workspace below.\n\n';
    prompt += _swWorkspaceBlock(ws);
    prompt += '\nSelected personas (use persona_idx, 0-based from this list, or -1 for none):\n' + personaLines + '\n';
    if (ppLines)      prompt += '\nKey pain points:\n' + ppLines + '\n';
    if (messageLines) prompt += '\nSelected messages (use message_idx_list, 0-based):\n' + messageLines + '\n';
    if (extra)        prompt += '\nAdditional direction for the ideas: ' + extra + '\n';
    prompt += brandSnippet('research');
    prompt += '\n\nAvailable Meta objectives: ' + objList + '\n';
    prompt += '\nRules:\n';
    prompt += '- Propose 3-5 campaign ideas. Each idea is ONE campaign — no ad sets or ads yet (those are built per-campaign later).\n';
    prompt += '- Ideas must be DIFFERENT in angle or audience cut, not minor variations.\n';
    prompt += '- Each idea targets ONE primary persona (persona_idx) or leave -1 for cross-persona.\n';
    prompt += '- message_idx_list is a short subset (1-3 ids) of message indices that fit the campaign\'s angle.\n';
    prompt += '- name: ≤50 chars. brief: 2-3 sentences explaining the angle, goal, and "why now".\n';
    prompt += '\nSchema (return ONLY this JSON, no preamble):\n';
    prompt += '{\n';
    prompt += '  "ideas": [{\n';
    prompt += '    "name": "Campaign name (≤50 chars)",\n';
    prompt += '    "objective": "OUTCOME_*",\n';
    prompt += '    "brief": "2-3 sentence brief — angle, goal, why now",\n';
    prompt += '    "persona_idx": INTEGER (0-based, or -1 for cross-persona),\n';
    prompt += '    "message_idx_list": [INTEGER, ...]\n';
    prompt += '  }]\n';
    prompt += '}';
    prompt += SW_JSON_RULES;

    callAIWithRetry(prompt, function(parsed) {
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.ideas)) {
        _swEndAIError(state, 'campaignIdeas', 'AI returned an invalid response. Try regenerating.');
        _swRefresh();
        return;
      }
      var allowedObj = Constants.META_OBJECTIVES;
      var clampIdxList = function(arr, maxN) {
        return (Array.isArray(arr) ? arr : [])
          .map(function(i) { return parseInt(i, 10); })
          .filter(function(i) { return !isNaN(i) && i >= 0 && i < maxN; });
      };

      state.campaign_ideas = (parsed.ideas || []).slice(0, 8).map(function(c) {
        var pi = parseInt(c.persona_idx, 10);
        if (isNaN(pi) || pi < -1 || pi >= selPersonas.length) pi = -1;
        return {
          name:             String(c.name || 'Untitled campaign').trim().substring(0, 80),
          objective:        allowedObj[c.objective] ? c.objective : 'OUTCOME_LEADS',
          brief:            String(c.brief || '').trim(),
          persona_idx:      pi,
          message_idx_list: clampIdxList(c.message_idx_list, selMessages.length),
          _selected:        true
        };
      });

      _swEndAISuccess(state, 'campaignIdeas');
      _swRefresh();
      _swSignalGenerated('campaignIdeas');
    }, function(err) {
      _swEndAIError(state, 'campaignIdeas', err);
      _swRefresh();
    }, 'sw-ai-config', BrandService.getSystemPrompt('research'), parseJSON);
  }
