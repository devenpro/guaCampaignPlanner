  // ------------------------------------------------------------------
  // SECTION 9.4d: SETUP WIZARD — STAGE 5 (Campaign Ideas) + STAGE 6 (Review)
  // ------------------------------------------------------------------
  //
  // Stage 5 is "Campaign Ideas" — a list of named campaign ideas the wizard
  // proposes. The user picks which to create. Each idea becomes a draft
  // campaign_v2 on launch. Ad Sets + Ads are built later from inside the
  // per-campaign workspace (the "Run AI setup" CTA there).
  //
  // Stage 6 is the final review and launch.

  // --- Stage 5: Campaign Ideas ---

  function renderSWStep5() {
    var ws        = setupWizardState;
    var generated = ws.stepGenerated.campaignIdeas;
    var aiLoading = ws.aiLoading;
    var ideas     = ws.campaign_ideas || [];

    var html = _buildSWStepHeader(
      'Campaign Ideas',
      'AI proposes a few campaign ideas based on your library. Pick which ones to start. Each becomes a draft Campaign you can build out (Ad Sets + Ads) from its workspace.',
      'c'
    );

    html += _swAIErrorBanner(5);

    html += '<div class="cp-sw-gen-bar">';
    html += '<textarea class="cp-textarea" id="swCampaignIdeasContext" rows="2"';
    html += ' placeholder="Optional: direction for the ideas (e.g. \'lean into the &quot;ship in days not weeks&quot; angle, mix lead-gen and brand campaigns, target enterprise + startup segments\')...">';
    html += esc(ws._campaignIdeasContext || '');
    html += '</textarea>';
    html += _swGenButton('sw-ai-gen-campaign-ideas', generated, aiLoading);
    html += '</div>';

    if (aiLoading) {
      html += _buildSWIdeasSkeleton();
      return html;
    }

    var selPersonas = (ws.personas || []).filter(function(p) { return p._selected; });
    var selMessages = (ws.messages || []).filter(function(m) { return m._selected; });

    if (!ideas.length) {
      if (generated) {
        html += _swAIEmptyAfterGenBanner('campaign ideas', ws._campaignIdeasContext || '');
      } else {
        html += '<div class="cp-sw-empty-state">';
        html += '<div class="cp-sw-empty-icon">' + icon('lightbulb') + '</div>';
        html += '<p>Click <strong>Generate with AI</strong> to draft 3-5 campaign ideas from your selected library. You can edit or remove any of them before launch.</p>';
        html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="sw-idea-add-manual" style="margin-top:var(--cp-space-3)">' + icon('plus') + ' Add manually</button>';
        html += '</div>';
      }
      return html;
    }

    var selCount = ideas.filter(function(c) { return c._selected; }).length;
    html += '<div class="cp-sw-card-bottom">';
    html += '<span class="cp-sw-sel-count' + (selCount > 0 ? ' cp-sw-sel-count--ok' : '') + '">';
    html += 'Will create ' + selCount + ' Campaign' + (selCount !== 1 ? 's' : '');
    html += '</span>';
    html += _swLastGeneratedLabel('campaignIdeas');
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="sw-idea-add-manual" style="margin-left:auto">' + icon('plus') + ' Add idea</button>';
    html += '</div>';

    html += '<div class="cp-sw-ideas">';
    for (var i = 0; i < ideas.length; i++) {
      html += _buildSWCampaignIdeaCard(ideas[i], i, selPersonas, selMessages);
    }
    html += '</div>';

    return html;
  }

  function _buildSWIdeasSkeleton() {
    var html = '<div class="cp-sw-tree-skeleton">';
    for (var i = 0; i < 3; i++) {
      html += '<div class="cp-sw-tree-set cp-sw-skeleton-card">';
      html += '<div class="cp-sw-skeleton-line cp-sw-skeleton-line--title"></div>';
      html += '<div class="cp-sw-skeleton-line"></div>';
      html += '<div class="cp-sw-skeleton-line cp-sw-skeleton-line--short"></div>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function _buildSWCampaignIdeaCard(idea, idx, selPersonas, selMessages) {
    var selected = idea._selected;
    var key = 'idea_' + idx;
    var expanded = setupWizardState._expandedCards[key];
    var C = Constants;
    var objLabel = (C.META_OBJECTIVES[idea.objective] || {}).label || idea.objective || '';
    var persona = (selPersonas || [])[idea.persona_idx] || null;

    var html = '<div class="cp-sw-tree-set' + (selected ? ' cp-sw-tree-set--selected' : '') + '">';

    html += '<div class="cp-sw-tree-set-header">';
    html += '<button class="cp-sw-tree-check' + (selected ? ' cp-sw-tree-check--on' : '') + '" data-action="sw-idea-toggle" data-idea-idx="' + idx + '" aria-label="Toggle Campaign idea">';
    html += selected ? icon('check') : '';
    html += '</button>';
    html += '<div class="cp-sw-tree-set-title" style="flex:1">';
    html += '<input type="text" class="cp-input cp-input-sm" data-sw-idea-field="name" data-idea-idx="' + idx + '" value="' + esc(idea.name || '') + '" placeholder="Campaign name">';
    html += '<div class="cp-sw-tree-set-meta">';
    if (objLabel) html += '<span class="cp-sw-tree-set-tag">' + icon('bullseye') + ' ' + esc(objLabel) + '</span>';
    if (persona)  html += '<span class="cp-sw-tree-set-tag">' + icon('user') + ' ' + esc(truncate(persona.name || '', 28)) + '</span>';
    html += '</div>';
    html += '</div>';
    html += '<button class="cp-sw-tree-expand" data-action="sw-tree-expand" data-key="' + key + '">';
    html += icon(expanded ? 'chevron-up' : 'chevron-down') + ' ' + (expanded ? 'Hide' : 'Details');
    html += '</button>';
    html += '<button class="cp-btn-icon cp-btn-icon-sm" data-action="sw-idea-delete" data-idea-idx="' + idx + '" title="Remove idea" style="margin-left:var(--cp-space-1)">' + icon('trash') + '</button>';
    html += '</div>';

    if (expanded) {
      html += '<div class="cp-sw-tree-set-brief">';

      html += '<div class="cp-sw-tree-brief-row">';
      html += '<span class="cp-sw-tree-brief-label">Objective</span>';
      html += '<select class="cp-select cp-select-sm" data-sw-idea-field="objective" data-idea-idx="' + idx + '">';
      for (var ok in C.META_OBJECTIVES) {
        html += '<option value="' + esc(ok) + '"' + (idea.objective === ok ? ' selected' : '') + '>' + esc(C.META_OBJECTIVES[ok].label) + '</option>';
      }
      html += '</select>';
      html += '</div>';

      html += '<div class="cp-sw-tree-brief-row">';
      html += '<span class="cp-sw-tree-brief-label">Target persona</span>';
      html += '<select class="cp-select cp-select-sm" data-sw-idea-field="persona_idx" data-idea-idx="' + idx + '">';
      html += '<option value="-1"' + (idea.persona_idx == null || idea.persona_idx < 0 ? ' selected' : '') + '>(no specific persona)</option>';
      for (var pi = 0; pi < selPersonas.length; pi++) {
        html += '<option value="' + pi + '"' + (idea.persona_idx === pi ? ' selected' : '') + '>' + esc(selPersonas[pi].name || ('Persona ' + (pi + 1))) + '</option>';
      }
      html += '</select>';
      html += '</div>';

      html += '<div class="cp-sw-tree-brief-row">';
      html += '<span class="cp-sw-tree-brief-label">Brief</span>';
      html += '<textarea class="cp-textarea" data-sw-idea-field="brief" data-idea-idx="' + idx + '" rows="2" placeholder="2-3 sentence direction for this campaign — context for the creative team and the per-campaign wizard.">';
      html += esc(idea.brief || '');
      html += '</textarea>';
      html += '</div>';

      if (selMessages && selMessages.length) {
        html += '<div class="cp-sw-tree-brief-row">';
        html += '<span class="cp-sw-tree-brief-label">Key messages</span>';
        html += '<div class="cp-sw-idea-chips">';
        var mil = idea.message_idx_list || [];
        for (var mi = 0; mi < selMessages.length; mi++) {
          var active = mil.indexOf(mi) !== -1;
          html += '<button type="button" class="cp-chip cp-chip-sm' + (active ? ' cp-chip-active' : '') + '" data-action="sw-idea-toggle-message" data-idea-idx="' + idx + '" data-msg-idx="' + mi + '">';
          html += esc(truncate(selMessages[mi].name || '', 28));
          html += '</button>';
        }
        html += '</div>';
        html += '</div>';
      }

      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  // --- Stage 6: Review & Launch ---

  function renderSWStep6() {
    var ws         = setupWizardState;
    var selPersonas = (ws.personas    || []).filter(function(p) { return p._selected; });
    var selPPs      = (ws.pain_points || []).filter(function(p) { return p._selected; });
    var selMessages = (ws.messages    || []).filter(function(m) { return m._selected; });
    var selStyles   = (ws.styles      || []).filter(function(s) { return s._selected; });
    var selFormats  = (ws.formats     || []).filter(function(f) { return f._selected; });
    var selIdeas    = (ws.campaign_ideas || []).filter(function(c) { return c._selected; });

    var html = _buildSWStepHeader(
      'Review &amp; Launch',
      'Final check before we create your library and campaign ideas. Everything below will be created on Launch.',
      'c'
    );

    if (ws.finalizing) {
      html += '<div class="cp-sw-finalize-progress">';
      html += '<div class="cp-sw-finalize-spinner">' + icon('loader') + '</div>';
      html += '<p class="cp-sw-finalize-msg">' + esc(ws.finalizeMsg || 'Setting up your workspace…') + '</p>';
      html += '</div>';
      return html;
    }

    html += '<div class="cp-sw-review-grid">';
    html += _buildSWReviewBox('users',         'Personas',    selPersonas.length, selPersonas.map(function(p) { return p.name; }));
    html += _buildSWReviewBox('crosshair',     'Pain Points', selPPs.length,      selPPs.map(function(p) { return p.pain_point; }));
    html += _buildSWReviewBox('message-square','Messages',    selMessages.length, selMessages.map(function(m) { return m.name; }));
    html += _buildSWReviewBox('palette',       'Styles',      selStyles.length,   selStyles.map(function(s) { return s.name; }));
    html += _buildSWReviewBox('clapperboard',  'Formats',     selFormats.length,  selFormats.map(function(f) { return f.name; }));
    html += _buildSWReviewBox('bullhorn',      'Campaigns',   selIdeas.length,    selIdeas.map(function(c) { return c.name; }));
    html += '</div>';

    if (selIdeas.length) {
      html += '<div class="cp-sw-info-box cp-sw-info-box--success" style="margin-top:var(--cp-space-4)">';
      html += icon('bullhorn') + ' <strong>' + selIdeas.length + ' Campaign idea' + (selIdeas.length !== 1 ? 's' : '') + '</strong> will be created as drafts. You can build out Ad Sets and Ads from each campaign\'s workspace using the per-campaign wizard.';
      html += '</div>';
    }

    html += '<p class="cp-sw-finalize-note" style="margin-top:var(--cp-space-5);text-align:center">';
    html += 'Hit <strong>Launch Workspace</strong> below to create your library and ' + selIdeas.length + ' Campaign' + (selIdeas.length !== 1 ? 's' : '') + '.';
    html += '</p>';

    return html;
  }

  function _buildSWReviewBox(iconName, label, count, names) {
    var html = '<div class="cp-sw-review-box">';
    html += '<div class="cp-sw-review-box-icon">' + icon(iconName) + '</div>';
    html += '<div class="cp-sw-review-box-count">' + count + '</div>';
    html += '<div class="cp-sw-review-box-label">' + esc(label) + '</div>';
    if (names && names.length) {
      html += '<div class="cp-sw-review-box-names">';
      var show = names.slice(0, 3);
      for (var i = 0; i < show.length; i++) {
        html += '<span>' + esc(truncate(show[i] || '', 30)) + '</span>';
      }
      if (names.length > 3) html += '<span>+' + (names.length - 3) + ' more</span>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }
