  // ------------------------------------------------------------------
  // SECTION 9.4b: SETUP WIZARD — STEP RENDERERS (Phase 3: Steps 3 & 4)
  // ------------------------------------------------------------------

  // --- Shared helpers ---

  function _buildSWSkeletonCards(count) {
    var html = '<div class="cp-sw-ai-loading" style="margin-top:var(--cp-space-4)">';
    for (var i = 0; i < count; i++) {
      html += '<div class="cp-sw-skeleton-card">';
      html += '<div class="cp-sw-skeleton-line cp-sw-skeleton-line--title"></div>';
      html += '<div class="cp-sw-skeleton-line"></div>';
      html += '<div class="cp-sw-skeleton-line"></div>';
      html += '<div class="cp-sw-skeleton-line cp-sw-skeleton-line--short"></div>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function _swDetailCell(label, value) {
    return '<div>'
      + '<div class="cp-sw-sel-card-detail-label">' + esc(label) + '</div>'
      + '<div class="cp-sw-sel-card-detail-value">' + esc(value) + '</div>'
      + '</div>';
  }

  // --- Inline diagnostics helpers (shared across Steps 3-7) ---

  function _swAIErrorBanner(stepNum) {
    var err = setupWizardState.aiError;
    if (!err) return '';
    var html = '<div class="cp-sw-ai-error" role="alert">';
    html += '<div class="cp-sw-ai-error-icon">' + icon('triangle-alert') + '</div>';
    html += '<div class="cp-sw-ai-error-body">';
    html += '<div class="cp-sw-ai-error-title">AI generation failed</div>';
    html += '<div class="cp-sw-ai-error-msg">' + esc(String(err)) + '</div>';
    html += '</div>';
    html += '<div class="cp-sw-ai-error-actions">';
    html += '<button class="cp-btn cp-btn-sm cp-btn-outline" data-action="sw-ai-retry-step" data-step="' + stepNum + '">' + icon('rotate') + ' Retry</button>';
    html += '<button class="cp-btn cp-btn-sm cp-btn-ghost" data-action="sw-ai-error-dismiss">' + icon('x') + ' Dismiss</button>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  function _swAIEmptyAfterGenBanner(label, contextStr) {
    var html = '<div class="cp-sw-ai-empty" role="status">';
    html += '<div class="cp-sw-ai-empty-icon">' + icon('search') + '</div>';
    html += '<div class="cp-sw-ai-empty-title">AI returned no ' + esc(label) + '</div>';
    html += '<div class="cp-sw-ai-empty-msg">';
    if (contextStr) html += 'Context used: <em>' + esc(contextStr) + '</em>. ';
    html += 'Try adjusting the instructions above and click Regenerate.';
    html += '</div>';
    html += '</div>';
    return html;
  }

  function _swLastGeneratedLabel(stepNum) {
    var ts = setupWizardState.created && setupWizardState.created.lastGeneratedAt && setupWizardState.created.lastGeneratedAt[stepNum];
    if (!ts) return '';
    return '<div class="cp-sw-last-gen">' + icon('clock') + ' Last generated ' + esc(_swRelTime(ts)) + '</div>';
  }

  function _swGenButton(action, generated, aiLoading) {
    if (aiLoading) {
      return '<button class="cp-btn cp-btn-outline" data-action="sw-ai-cancel">' + icon('x') + ' Cancel</button>';
    }
    return '<button class="cp-btn cp-btn-ai" data-action="' + action + '">'
      + icon('sparkles') + ' ' + (generated ? 'Regenerate' : 'Generate with AI')
      + '</button>';
  }

  // --- Step 3: Personas ---

  function renderSWStep3() {
    var ws       = setupWizardState;
    var personas = ws.personas || [];
    var generated = ws.stepGenerated[3];

    var html = _buildSWStepHeader(
      'Target Personas',
      'Select the audience personas that best represent your ideal customers. AI generates options based on your workspace setup.',
      'b'
    );

    html += _swAIErrorBanner(3);

    // Generation bar
    html += '<div class="cp-sw-gen-bar">';
    html += '<textarea class="cp-textarea" id="swPersonaContext" rows="2"';
    html += ' placeholder="Optional: additional context (e.g., focus on enterprise buyers, include a tech-savvy segment)...">';
    html += esc(ws._personaContext || '');
    html += '</textarea>';
    html += _swGenButton('sw-ai-gen-personas', generated, ws.aiLoading);
    html += '</div>';

    if (ws.aiLoading) {
      html += _buildSWSkeletonCards(4);
    } else if (generated && !personas.length) {
      html += _swAIEmptyAfterGenBanner('personas', ws._personaContext || '');
    } else if (!personas.length) {
      html += '<div class="cp-sw-empty-state">';
      html += '<div class="cp-sw-empty-icon">' + icon('users') + '</div>';
      html += '<p>Click <strong>Generate with AI</strong> to create persona suggestions based on your product and target audience.</p>';
      html += '</div>';
    } else {
      var selCount = personas.filter(function(p) { return p._selected; }).length;
      html += '<div class="cp-sw-card-bottom">';
      html += '<span class="cp-sw-sel-count' + (selCount > 0 ? ' cp-sw-sel-count--ok' : '') + '">';
      html += selCount + ' of ' + personas.length + ' persona' + (personas.length !== 1 ? 's' : '') + ' selected';
      html += '</span>';
      html += _swLastGeneratedLabel(3);
      html += '</div>';
      html += '<div class="cp-sw-card-grid">';
      for (var i = 0; i < personas.length; i++) {
        html += _buildSWPersonaCard(personas[i], i);
      }
      html += '</div>';
    }

    return html;
  }

  function _buildSWPersonaCard(p, idx) {
    var selected = p._selected;
    var expanded = setupWizardState._expandedCards['p_' + idx];
    var demo  = p.demographics  || {};
    var psych = p.psychographics || {};

    var tags = [];
    if (demo.age_range)  tags.push(demo.age_range);
    if (demo.gender && demo.gender !== 'All') tags.push(demo.gender);
    if (demo.location)   tags.push(demo.location);
    if (demo.occupation) tags.push(demo.occupation);

    var html = '<div class="cp-sw-sel-card' + (selected ? ' cp-sw-sel-card--selected' : '') + '" data-idx="' + idx + '" role="button" tabindex="0" aria-pressed="' + (selected ? 'true' : 'false') + '">';
    html += '<div class="cp-sw-sel-card-check">' + (selected ? icon('check') : '') + '</div>';
    html += '<div class="cp-sw-sel-card-title">' + esc(p.name || ('Persona ' + (idx + 1))) + '</div>';
    if (p.description) {
      html += '<div class="cp-sw-sel-card-body">' + esc(truncate(p.description, 130)) + '</div>';
    }
    if (tags.length) {
      html += '<div class="cp-sw-sel-card-tags">';
      for (var t = 0; t < tags.length; t++) {
        html += '<span class="cp-sw-sel-card-tag">' + esc(tags[t]) + '</span>';
      }
      html += '</div>';
    }
    // Always-visible desires / fears mini-row — the most strategic fields
    if (psych.desires || psych.fears) {
      html += '<div class="cp-sw-sel-card-psych">';
      if (psych.desires) {
        html += '<div class="cp-sw-sel-card-psych-row cp-sw-sel-card-psych-row--desire">';
        html += '<span class="cp-sw-sel-card-psych-label">' + icon('heart') + ' Wants</span>';
        html += '<span class="cp-sw-sel-card-psych-value">' + esc(truncate(psych.desires, 90)) + '</span>';
        html += '</div>';
      }
      if (psych.fears) {
        html += '<div class="cp-sw-sel-card-psych-row cp-sw-sel-card-psych-row--fear">';
        html += '<span class="cp-sw-sel-card-psych-label">' + icon('shield') + ' Fears</span>';
        html += '<span class="cp-sw-sel-card-psych-value">' + esc(truncate(psych.fears, 90)) + '</span>';
        html += '</div>';
      }
      html += '</div>';
    }
    html += '<button class="cp-sw-sel-card-expand" data-action="sw-card-expand" data-key="p_' + idx + '">';
    html += icon(expanded ? 'chevron-up' : 'chevron-down') + ' ' + (expanded ? 'Less' : 'More details');
    html += '</button>';

    if (expanded) {
      html += '<div class="cp-sw-sel-card-expanded-body">';
      html += '<div class="cp-sw-sel-card-detail-grid">';
      if (demo.income_level) html += _swDetailCell('Income',     demo.income_level);
      if (demo.education)    html += _swDetailCell('Education',  demo.education);
      if (demo.industry)     html += _swDetailCell('Industry',   demo.industry);
      if (psych.motivations) html += _swDetailCell('Motivations',psych.motivations);
      if (psych.values)      html += _swDetailCell('Values',     psych.values);
      html += '</div>';
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  // --- Step 4: Pain Points ---

  function renderSWStep4() {
    var ws        = setupWizardState;
    var pps       = ws.pain_points || [];
    var selPersonas = (ws.personas || []).filter(function(p) { return p._selected; });
    var generated = ws.stepGenerated[4];

    var html = _buildSWStepHeader(
      'Pain Points',
      'Select the key challenges your personas face. These directly shape your ad messages, hooks, and copy.',
      'b'
    );

    if (!selPersonas.length) {
      html += '<div class="cp-sw-empty-state cp-sw-empty-state--warn">';
      html += icon('triangle-alert') + ' No personas selected from Step 3. Go back and select at least one persona.';
      html += '</div>';
      return html;
    }

    html += _swAIErrorBanner(4);

    // Generation bar
    html += '<div class="cp-sw-gen-bar">';
    html += '<textarea class="cp-textarea" id="swPainPointContext" rows="2"';
    html += ' placeholder="Optional: focus on specific challenges or industries (e.g., focus on time-management struggles)...">';
    html += esc(ws._ppContext || '');
    html += '</textarea>';
    html += _swGenButton('sw-ai-gen-painpoints', generated, ws.aiLoading);
    html += '</div>';

    if (ws.aiLoading) {
      html += _buildSWSkeletonCards(6);
    } else if (generated && !pps.length) {
      html += _swAIEmptyAfterGenBanner('pain points', ws._ppContext || '');
    } else if (!pps.length) {
      html += '<div class="cp-sw-empty-state">';
      html += '<div class="cp-sw-empty-icon">' + icon('crosshair') + '</div>';
      html += '<p>Click <strong>Generate with AI</strong> to create pain point suggestions based on your selected personas.</p>';
      html += '</div>';
    } else {
      // Persona tab bar (only when 2+ personas selected)
      if (selPersonas.length > 1) {
        var activeTab = ws._ppActiveTab || 0;
        html += '<div class="cp-sw-pp-tabs">';
        for (var pi = 0; pi < selPersonas.length; pi++) {
          var personaRealIdx = (ws.personas || []).indexOf(selPersonas[pi]);
          var tabPPCount = pps.filter(function(pp) { return pp._persona_idx === personaRealIdx && pp._selected; }).length;
          html += '<button class="cp-sw-pp-tab' + (activeTab === pi ? ' cp-sw-pp-tab--active' : '') + '" data-action="sw-pp-tab" data-tab="' + pi + '">';
          html += esc(truncate(selPersonas[pi].name || 'Persona', 22));
          if (tabPPCount) html += ' <span class="cp-sw-pp-tab-badge">' + tabPPCount + '</span>';
          html += '</button>';
        }
        html += '</div>';
      }

      // Filter to active persona tab (or show all if single persona)
      var visiblePPs;
      if (selPersonas.length > 1) {
        var activePersona = selPersonas[ws._ppActiveTab || 0];
        var filterIdx = (ws.personas || []).indexOf(activePersona);
        visiblePPs = pps.map(function(pp, i) { return { pp: pp, i: i }; })
                        .filter(function(o) { return o.pp._persona_idx === filterIdx; });
      } else {
        visiblePPs = pps.map(function(pp, i) { return { pp: pp, i: i }; });
      }

      var totalSel = pps.filter(function(pp) { return pp._selected; }).length;
      html += '<div class="cp-sw-card-bottom">';
      html += '<span class="cp-sw-sel-count' + (totalSel > 0 ? ' cp-sw-sel-count--ok' : '') + '">';
      html += totalSel + ' of ' + pps.length + ' pain point' + (pps.length !== 1 ? 's' : '') + ' selected';
      html += '</span>';
      html += _swLastGeneratedLabel(4);
      html += '</div>';

      html += '<div class="cp-sw-card-grid">';
      for (var j = 0; j < visiblePPs.length; j++) {
        html += _buildSWPainPointCard(visiblePPs[j].pp, visiblePPs[j].i);
      }
      html += '</div>';
    }

    return html;
  }

  function _buildSWPainPointCard(pp, idx) {
    var selected = pp._selected;

    var html = '<div class="cp-sw-sel-card' + (selected ? ' cp-sw-sel-card--selected' : '') + '" data-idx="' + idx + '" role="button" tabindex="0" aria-pressed="' + (selected ? 'true' : 'false') + '">';
    html += '<div class="cp-sw-sel-card-check">' + (selected ? icon('check') : '') + '</div>';
    html += '<div class="cp-sw-sel-card-title">' + esc(pp.pain_point || 'Pain Point') + '</div>';
    if (pp.solution) {
      html += '<div class="cp-sw-pp-solution">';
      html += '<span class="cp-sw-pp-solution-label">' + icon('lightbulb') + ' Solution</span>';
      html += '<span class="cp-sw-pp-solution-value">' + esc(truncate(pp.solution, 140)) + '</span>';
      html += '</div>';
    }
    if (pp.category) {
      var catSlug = String(pp.category).toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-+|-+$/g, '');
      html += '<div class="cp-sw-sel-card-tags"><span class="cp-sw-sel-card-tag cp-sw-sel-card-tag--cat cp-sw-sel-card-tag--cat-' + esc(catSlug) + '">' + esc(pp.category) + '</span></div>';
    }
    html += '</div>';
    return html;
  }

