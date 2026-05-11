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

