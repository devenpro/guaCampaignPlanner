  // ============================================================
  // SECTION 17: ACTIVITY VIEW
  // ============================================================

  function renderActivityView() {
    var f = S.activityFilter;
    var all = (S.activity || []).slice().reverse();

    // Apply filters
    var filtered = all;
    if (f.search) {
      var q = f.search.toLowerCase();
      filtered = filtered.filter(function(a) {
        return (a.description || '').toLowerCase().indexOf(q) > -1 ||
               (a.entity_title || '').toLowerCase().indexOf(q) > -1 ||
               (a.type || '').toLowerCase().indexOf(q) > -1;
      });
    }
    if (f.type) {
      filtered = filtered.filter(function(a) { return a.type === f.type; });
    }

    var html = '<div class="cp-view cp-view-activity">';
    html += '<div class="cp-view-header"><div class="cp-view-header-left">';
    html += '<h1>' + icon('clock-rotate-left') + ' Activity</h1>';
    html += '<span class="cp-view-subtitle">' + filtered.length + ' entries</span>';
    html += '</div></div>';

    // Toolbar
    html += '<div class="cp-view-toolbar">';
    html += '<div class="cp-search-wrapper">' + icon('search') + '<input type="text" class="cp-input" id="cpActivitySearch" placeholder="Search activity..." value="' + esc(f.search) + '"></div>';
    html += '<select class="cp-select cp-select-sm" id="cpActivityTypeFilter"><option value="">All Types</option>';
    // Group by entity type
    var typeGroups = [
      { label: 'Recipes', types: ['recipe_created', 'recipe_updated', 'recipe_status_changed', 'recipe_deleted', 'recipe_batch_generated'] },
      { label: 'Personas', types: ['persona_created', 'persona_updated', 'persona_deleted', 'category_created', 'category_deleted'] },
      { label: 'Messages', types: ['message_created', 'message_updated', 'message_deleted'] },
      { label: 'Styles/Formats', types: ['style_created', 'style_updated', 'style_deleted', 'format_created', 'format_updated', 'format_deleted'] },
      { label: 'Campaigns', types: ['campaign_created', 'campaign_updated', 'campaign_deleted'] },
      { label: 'AI Actions', types: ['brief_generated', 'hook_generated', 'content_generated', 'media_generated', 'script_generated', 'pain_points_generated', 'messages_suggested', 'personas_researched'] },
      { label: 'Other', types: ['tag_created', 'tag_updated', 'tag_deleted', 'image_uploaded', 'settings_changed', 'data_imported', 'data_exported', 'setup_completed'] }
    ];
    for (var gi = 0; gi < typeGroups.length; gi++) {
      var grp = typeGroups[gi];
      html += '<optgroup label="' + esc(grp.label) + '">';
      for (var ti = 0; ti < grp.types.length; ti++) {
        var tKey = grp.types[ti];
        var tLabel = tKey.replace(/_/g, ' ');
        html += '<option value="' + tKey + '"' + (f.type === tKey ? ' selected' : '') + '>' + esc(tLabel) + '</option>';
      }
      html += '</optgroup>';
    }
    html += '</select>';
    html += '</div>';

    // Activity list
    if (filtered.length === 0) {
      html += '<div class="cp-empty-state"><div class="cp-empty-state-icon">' + icon('clock-rotate-left') + '</div>';
      html += '<div class="cp-empty-state-title">No activity' + (f.search || f.type ? ' matches your filters' : ' yet') + '</div>';
      html += '<div class="cp-empty-state-text">Activity will appear here as you create and edit content.</div></div>';
    } else {
      html += '<div class="cp-card"><div class="cp-activity-list">';
      var maxShow = 100;
      for (var i = 0; i < Math.min(filtered.length, maxShow); i++) {
        html += renderActivityItem(filtered[i]);
      }
      if (filtered.length > maxShow) {
        html += '<div class="cp-activity-more">' + (filtered.length - maxShow) + ' more entries not shown.</div>';
      }
      html += '</div></div>';
    }

    html += '</div>';
    return html;
  }

