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

