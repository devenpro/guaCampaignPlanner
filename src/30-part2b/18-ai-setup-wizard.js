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

  function _swBeginAI(state, n) {
    state.aiLoading   = true;
    state.aiActionId  = 'sw-ai-config';
    state.aiStartedAt = Date.now();
    state.aiError     = '';
    state.stepGenerated[n] = false;
  }

  function _swEndAISuccess(state, n) {
    state.aiLoading  = false;
    state.aiActionId = '';
    state.aiError    = '';
    state.stepGenerated[n] = true;
    state.created = state.created || {};
    state.created.lastGeneratedAt = state.created.lastGeneratedAt || {};
    state.created.lastGeneratedAt[n] = Date.now();
  }

  function _swEndAIError(state, n, err) {
    state.aiLoading  = false;
    state.aiActionId = '';
    state.aiError    = String(err || 'AI generation failed').substring(0, 240);
    state.stepGenerated[n] = true;
  }

  // ----- 1. Personas -----

  function swAIGeneratePersonas() {
    var state = _swState();
    if (!state) { console.warn('[SW] setupWizardState not available'); return; }
    if (state.aiLoading) return;
    if (!LLMService.isConfigured()) { state.aiError = 'AI not configured — check Settings → AI.'; _swRefresh(); return; }

    _swBeginAI(state, 3);
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
      _swEndAISuccess(state, 3);
      _swRefresh();
    }, function(err) {
      _swEndAIError(state, 3, err);
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
      state.aiError = 'No personas selected. Go back to Step 3 and select at least one.';
      _swRefresh();
      return;
    }

    _swBeginAI(state, 4);
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
      _swEndAISuccess(state, 4);
      _swRefresh();
    }, function(err) {
      _swEndAIError(state, 4, err);
      _swRefresh();
    }, 'sw-ai-config', BrandService.getSystemPrompt('research'), parseJSON);
  }

  // ----- 3. Messages -----

  function swAIGenerateMessages() {
    var state = _swState();
    if (!state) return;
    if (state.aiLoading) return;
    if (!LLMService.isConfigured()) { state.aiError = 'AI not configured — check Settings → AI.'; _swRefresh(); return; }

    _swBeginAI(state, 5);
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
      _swEndAISuccess(state, 5);
      _swRefresh();
    }, function(err) {
      _swEndAIError(state, 5, err);
      _swRefresh();
    }, 'sw-ai-config', BrandService.getSystemPrompt('content'), parseJSON);
  }

  // ----- 4. Styles & Formats -----

  function swAIGenerateStylesFormats() {
    var state = _swState();
    if (!state) return;
    if (state.aiLoading) return;
    if (!LLMService.isConfigured()) { state.aiError = 'AI not configured — check Settings → AI.'; _swRefresh(); return; }

    _swBeginAI(state, 6);
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
      _swEndAISuccess(state, 6);
      _swRefresh();
    }, function(err) {
      _swEndAIError(state, 6, err);
      _swRefresh();
    }, 'sw-ai-config', BrandService.getSystemPrompt('content'), parseJSON);
  }

  // ----- 5. Campaign Tree (Step 7) -----

  function swAIGenerateCampaignTree() {
    var state = _swState();
    if (!state) return;
    if (state.aiLoading) return;
    if (!LLMService.isConfigured()) { state.aiError = 'AI not configured — check Settings → AI.'; _swRefresh(); return; }

    _swBeginAI(state, 7);
    _swRefresh();

    var ws            = state.workspace || {};
    var selPersonas   = (state.personas    || []).filter(function(p)  { return p._selected; });
    var selPainPoints = (state.pain_points || []).filter(function(pp) { return pp._selected; });
    var selMessages   = (state.messages    || []).filter(function(m)  { return m._selected; });
    var selStyles     = (state.styles      || []).filter(function(s)  { return s._selected; });
    var selFormats    = (state.formats     || []).filter(function(f)  { return f._selected; });
    var extra         = state._campaignTreeContext || '';

    if (!selPersonas.length) {
      _swEndAIError(state, 7, 'No personas selected. Go back to Step 3.');
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

    var styleLines = selStyles.map(function(s, i) {
      return i + '. ' + (s.name || 'Style ' + i) + ' — ' + truncate(s.description || '', 90);
    }).join('\n');

    var formatLines = selFormats.map(function(f, i) {
      return i + '. ' + (f.name || 'Format ' + i) + ' [' + (f.category || '?') + '] — ' + truncate(f.description || '', 90);
    }).join('\n');

    var objList = Object.keys(Constants.META_OBJECTIVES).join(', ');
    var goalList = Object.keys(Constants.META_OPTIMIZATION_GOALS).join(', ');
    var ctaList = Object.keys(Constants.META_CTA_TYPES).slice(0, 14).join(', ');

    var prompt = 'You are a Meta Ads strategist. Build a complete Campaign tree for the workspace below.\n\n';
    prompt += _swWorkspaceBlock(ws);
    prompt += '\nSelected personas (use persona_idx, 0-based from this list):\n' + personaLines + '\n';
    if (ppLines)     prompt += '\nKey pain points:\n' + ppLines + '\n';
    if (messageLines) prompt += '\nSelected messages (use message_idx_list):\n' + messageLines + '\n';
    if (styleLines)  prompt += '\nSelected styles (use style_idx_list):\n' + styleLines + '\n';
    if (formatLines) prompt += '\nSelected formats (use format_idx_list):\n' + formatLines + '\n';
    if (extra)       prompt += '\nAdditional campaign direction: ' + extra + '\n';
    prompt += brandSnippet('research');
    prompt += '\n\nAvailable Meta enums:\n';
    prompt += '- objective: ' + objList + '\n';
    prompt += '- optimization_goal: ' + goalList + '\n';
    prompt += '- cta_type: ' + ctaList + '\n';
    prompt += '\nRules:\n';
    prompt += '- 1 Campaign. 2-3 Ad Sets. 2-3 Ads per Ad Set.\n';
    prompt += '- Each Ad Set must target a DIFFERENT persona angle / audience cut.\n';
    prompt += '- Each Ad inside an Ad Set must use a DIFFERENT hook angle.\n';
    prompt += '- Primary text: 90-140 chars. Headline: ≤27 chars. Description: ≤27 chars.\n';
    prompt += '- optimization_goal must be valid for the chosen objective.\n';
    prompt += '- persona_idx, message_idx_list, style_idx_list, format_idx_list are 0-based indices into the lists above (drop any that don\'t map).\n';
    prompt += '\nSchema (return ONLY this JSON):\n';
    prompt += '{\n';
    prompt += '  "campaign": {\n';
    prompt += '    "name": "Short campaign name (≤50 chars)",\n';
    prompt += '    "description": "1-2 sentence rationale",\n';
    prompt += '    "objective": "OUTCOME_*",\n';
    prompt += '    "budget_mode": "CBO|ABO",\n';
    prompt += '    "daily_budget": NUMBER or null,\n';
    prompt += '    "bid_strategy": "LOWEST_COST_WITHOUT_CAP|LOWEST_COST_WITH_BID_CAP|COST_CAP|LOWEST_COST_WITH_MIN_ROAS",\n';
    prompt += '    "brief": "2-3 sentence campaign brief"\n';
    prompt += '  },\n';
    prompt += '  "ad_sets": [{\n';
    prompt += '    "name": "Ad Set name",\n';
    prompt += '    "persona_idx": INTEGER,\n';
    prompt += '    "audience_overrides": "free-text audience tweaks (locales, behaviours)",\n';
    prompt += '    "optimization_goal": "...",\n';
    prompt += '    "billing_event": "IMPRESSIONS|LINK_CLICKS|THRUPLAY|APP_INSTALLS",\n';
    prompt += '    "attribution_setting": "1d_view|1d_click|7d_click|1d_view_1d_click|1d_view_7d_click",\n';
    prompt += '    "brief": {\n';
    prompt += '      "creative_direction": "2-3 sentences",\n';
    prompt += '      "hook_angles": ["Angle 1", "Angle 2", "Angle 3"],\n';
    prompt += '      "message_idx_list": [INTEGER, ...],\n';
    prompt += '      "style_idx_list": [INTEGER, ...],\n';
    prompt += '      "format_idx_list": [INTEGER, ...],\n';
    prompt += '      "ai_notes": "production notes for the creative team"\n';
    prompt += '    },\n';
    prompt += '    "ads": [{\n';
    prompt += '      "name": "Ad name",\n';
    prompt += '      "creative_type": "single_image|single_video|carousel",\n';
    prompt += '      "hook": { "text": "1 sentence hook", "type": "question|bold|story|data|direct|curiosity|challenge" },\n';
    prompt += '      "creative": {\n';
    prompt += '        "primary_text": "90-140 chars",\n';
    prompt += '        "headline": "≤27 chars",\n';
    prompt += '        "description": "≤27 chars",\n';
    prompt += '        "cta_type": "LEARN_MORE|SHOP_NOW|...",\n';
    prompt += '        "cta_link": ""\n';
    prompt += '      },\n';
    prompt += '      "media": {\n';
    prompt += '        "image_brief": "1-2 sentence brief for image ads",\n';
    prompt += '        "image_prompt": "production-ready AI image prompt for image ads",\n';
    prompt += '        "video_concept": "1-2 sentence concept for video ads"\n';
    prompt += '      }\n';
    prompt += '    }]\n';
    prompt += '  }]\n';
    prompt += '}';
    prompt += SW_JSON_RULES;

    callAIWithRetry(prompt, function(parsed) {
      if (!parsed || typeof parsed !== 'object' || !parsed.campaign || !Array.isArray(parsed.ad_sets)) {
        _swEndAIError(state, 7, 'AI returned an invalid tree structure. Try regenerating.');
        _swRefresh();
        return;
      }
      var c = parsed.campaign || {};
      var allowedObj = Constants.META_OBJECTIVES;
      var allowedGoals = Constants.META_OPTIMIZATION_GOALS;
      var allowedCTAs = Constants.META_CTA_TYPES;
      var allowedCreative = Constants.META_AD_CREATIVE_TYPES;
      var allowedHook = { question:1, bold:1, story:1, data:1, direct:1, curiosity:1, challenge:1 };

      state.campaign = {
        name:         String(c.name || ws.product_name + ' Launch').trim().substring(0, 80),
        description:  String(c.description || '').trim(),
        objective:    allowedObj[c.objective] ? c.objective : 'OUTCOME_LEADS',
        budget_mode:  (c.budget_mode === 'ABO' || c.budget_mode === 'CBO') ? c.budget_mode : 'CBO',
        daily_budget: (c.daily_budget == null || c.daily_budget === '') ? '' : Number(c.daily_budget),
        lifetime_budget: '',
        bid_strategy: c.bid_strategy || 'LOWEST_COST_WITHOUT_CAP',
        start_time:   '',
        stop_time:    '',
        brief:        String(c.brief || '').trim(),
        ai_instructions: ''
      };

      state.ad_sets = (parsed.ad_sets || []).slice(0, 5).map(function(s) {
        var b = s.brief || {};
        var clampedPI = parseInt(s.persona_idx, 10);
        if (isNaN(clampedPI) || clampedPI < 0 || clampedPI >= selPersonas.length) clampedPI = 0;
        var clampIdxList = function(arr, maxN) {
          return (Array.isArray(arr) ? arr : [])
            .map(function(i) { return parseInt(i, 10); })
            .filter(function(i) { return !isNaN(i) && i >= 0 && i < maxN; });
        };
        return {
          name:               String(s.name || 'Ad Set').trim().substring(0, 80),
          persona_idx:        clampedPI,
          audience_overrides: String(s.audience_overrides || '').trim(),
          optimization_goal:  allowedGoals[s.optimization_goal] ? s.optimization_goal : 'OFFSITE_CONVERSIONS',
          billing_event:      s.billing_event || 'IMPRESSIONS',
          attribution_setting: s.attribution_setting || '7d_click',
          brief: {
            creative_direction: String(b.creative_direction || '').trim(),
            hook_angles:        Array.isArray(b.hook_angles) ? b.hook_angles.filter(Boolean).slice(0, 5) : [],
            message_idx_list:   clampIdxList(b.message_idx_list, selMessages.length),
            style_idx_list:     clampIdxList(b.style_idx_list,   selStyles.length),
            format_idx_list:    clampIdxList(b.format_idx_list,  selFormats.length),
            ai_notes:           String(b.ai_notes || '').trim()
          },
          ads: (s.ads || []).slice(0, 4).map(function(a) {
            var h = a.hook || {}; var cr = a.creative || {}; var md = a.media || {};
            return {
              name:          String(a.name || 'Ad').trim().substring(0, 80),
              creative_type: allowedCreative[a.creative_type] ? a.creative_type : 'single_image',
              hook: {
                text: String(h.text || '').trim(),
                type: allowedHook[h.type] ? h.type : 'direct'
              },
              creative: {
                primary_text: String(cr.primary_text || '').trim(),
                headline:     String(cr.headline     || '').trim(),
                description:  String(cr.description  || '').trim(),
                cta_type:     allowedCTAs[cr.cta_type] ? cr.cta_type : 'LEARN_MORE',
                cta_link:     String(cr.cta_link     || '').trim()
              },
              media: {
                image_brief:   String(md.image_brief   || '').trim(),
                image_prompt:  String(md.image_prompt  || '').trim(),
                video_concept: String(md.video_concept || '').trim()
              },
              _selected: true
            };
          }),
          _selected: true
        };
      });

      _swEndAISuccess(state, 7);
      _swRefresh();
    }, function(err) {
      _swEndAIError(state, 7, err);
      _swRefresh();
    }, 'sw-ai-config', BrandService.getSystemPrompt('research'), parseJSON);
  }
