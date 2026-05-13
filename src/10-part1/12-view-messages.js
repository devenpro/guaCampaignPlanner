  // ============================================================
  // SECTION 12: MESSAGES VIEW
  // ============================================================

  function renderMessagesView() {
    var msgs = getAllMessages();
    var f = S.messageFilter;

    // Apply filters
    var filtered = msgs.slice();
    if (f.search) {
      var q = f.search.toLowerCase();
      filtered = filtered.filter(function(m) {
        return (m.title || '').toLowerCase().indexOf(q) > -1 ||
               (m.body || '').toLowerCase().indexOf(q) > -1 ||
               (m.theme || '').toLowerCase().indexOf(q) > -1;
      });
    }
    if (f.funnel) {
      filtered = filtered.filter(function(m) { return (m.funnel_stages || []).indexOf(f.funnel) > -1; });
    }
    // Sort
    if (f.sortBy === 'title') filtered.sort(function(a, b) { return (a.title || '').localeCompare(b.title || ''); });
    else filtered.sort(function(a, b) { return (b.updated || b.created || '') > (a.updated || a.created || '') ? 1 : -1; });

    var funnels = (S.meta.settings && S.meta.settings.funnel_stages) || [];

    var html = '<div class="cp-view cp-view-messages">';

    // Header
    html += '<div class="cp-view-header"><div class="cp-view-header-left">';
    html += '<h1>' + icon('comments') + ' Messages</h1>';
    html += '<span class="cp-view-subtitle">' + filtered.length + ' of ' + msgs.length + ' messages</span>';
    html += '</div><div class="cp-view-header-right">';
    html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="new-message">' + icon('plus') + ' Add Message</button>';
    html += '</div></div>';

    // Toolbar
    html += '<div class="cp-view-toolbar">';
    html += '<div class="cp-search-wrapper">' + icon('search') + '<input type="text" class="cp-input" id="cpMessageSearch" placeholder="Search messages..." value="' + esc(f.search) + '"></div>';
    // Funnel filter
    html += '<select class="cp-select cp-select-sm" id="cpMessageFunnelFilter">';
    html += '<option value="">All Stages</option>';
    for (var fi = 0; fi < funnels.length; fi++) {
      html += '<option value="' + funnels[fi].id + '"' + (f.funnel === funnels[fi].id ? ' selected' : '') + '>' + esc(funnels[fi].short || funnels[fi].name) + '</option>';
    }
    html += '</select>';
    // Sort
    html += '<select class="cp-select cp-select-sm" id="cpMessageSort">';
    html += '<option value="updated"' + (f.sortBy === 'updated' ? ' selected' : '') + '>Newest</option>';
    html += '<option value="title"' + (f.sortBy === 'title' ? ' selected' : '') + '>Alphabetical</option>';
    html += '</select>';
    html += '</div>';

    // AI Research Panel
    html += '<div class="cp-ai-research-slot" id="cpMessageResearchSlot">';
    html += renderAIResearchBar('Message', '#1a73e8', 'comments', 'messages');
    html += '</div>';

    // Card grid
    if (filtered.length === 0) {
      html += '<div class="cp-empty-state"><div class="cp-empty-state-icon">' + icon('comments') + '</div>';
      html += '<div class="cp-empty-state-title">No messages' + (f.search || f.funnel ? ' match your filters' : ' yet') + '</div>';
      html += '<div class="cp-empty-state-text">Create messages with funnel stage tags, hooks, and delivery notes.</div>';
      html += '<button class="cp-btn cp-btn-primary" data-action="new-message">' + icon('plus') + ' Create Message</button></div>';
    } else {
      html += '<div class="cp-card-grid">';
      for (var i = 0; i < filtered.length; i++) html += renderMessageCard(filtered[i]);
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  function renderMessageCard(msg) {
    var hookCount = (msg.hooks || []).length;
    var bodyPreview = stripHtml(msg.body || '');

    var html = '<div class="cp-card cp-message-card" data-action="select-message" data-id="' + esc(msg.id) + '">';

    // Title + actions
    html += '<div class="cp-message-card-header">';
    html += '<h3 class="cp-message-card-title">' + esc(msg.title || 'Untitled Message') + '</h3>';
    html += '<div class="cp-message-card-actions">';
    html += '<button class="cp-btn-icon cp-btn-xs" data-action="edit-message" data-id="' + esc(msg.id) + '" title="Edit">' + icon('edit') + '</button>';
    html += '<button class="cp-btn-icon cp-btn-xs" data-action="delete-message" data-id="' + esc(msg.id) + '" title="Delete">' + icon('trash') + '</button>';
    html += '</div></div>';

    // Body preview
    if (bodyPreview) {
      html += '<div class="cp-message-card-body">' + esc(truncate(bodyPreview, 120)) + '</div>';
    }

    // Funnel stages
    var stages = msg.funnel_stages || [];
    if (stages.length > 0) {
      html += '<div class="cp-message-card-stages">';
      for (var si = 0; si < stages.length; si++) {
        html += funnelBadge(stages[si]);
      }
      if (msg.theme) html += '<span class="cp-badge" style="background:#5f636815;color:#5f6368">' + esc(msg.theme) + '</span>';
      html += '</div>';
    }

    // Delivery notes preview
    if (msg.delivery_notes) {
      html += '<div class="cp-message-card-delivery">' + icon('pen-fancy') + ' ' + esc(truncate(msg.delivery_notes, 80)) + '</div>';
    }

    // Footer: hooks
    html += '<div class="cp-message-card-footer">';
    if (hookCount > 0) html += '<span class="cp-badge" style="background:#9334e915;color:#9334e9">' + icon('anchor') + ' ' + hookCount + ' hook' + (hookCount !== 1 ? 's' : '') + '</span>';
    html += '</div>';

    html += '</div>';
    return html;
  }

