  // ============================================================
  // SECTION 18: TAG INPUT COMPONENT
  // ============================================================

  function renderTagInput(entityTags, entityType, entityId) {
    entityTags = entityTags || [];
    var allTags = getAllTags();

    var html = '<div class="cp-tag-input" data-entity-type="' + esc(entityType || '') + '" data-entity-id="' + esc(entityId || '') + '">';
    html += '<div class="cp-tag-input-current">';
    for (var ti = 0; ti < entityTags.length; ti++) {
      var tag = S.tagMap[entityTags[ti]];
      if (tag) {
        html += '<span class="cp-badge" style="background:' + tag.color + '15;color:' + tag.color + '">' + icon('tag') + ' ' + esc(tag.name);
        html += ' <button class="cp-tag-remove" data-action="remove-entity-tag" data-tag-id="' + esc(tag.id) + '" style="border:none;background:none;cursor:pointer;color:inherit;font-size:10px;padding:0 2px">&times;</button>';
        html += '</span>';
      }
    }
    html += '</div>';

    // Tag picker dropdown
    var availableTags = allTags.filter(function(t) { return entityTags.indexOf(t.id) === -1; });
    if (availableTags.length > 0) {
      html += '<div class="cp-tag-input-add" style="margin-top:var(--cp-space-2);display:flex;gap:var(--cp-space-2);align-items:center">';
      html += '<select class="cp-select cp-select-sm" data-action="add-entity-tag" style="width:auto;min-width:120px">';
      html += '<option value="">+ Add tag...</option>';
      for (var ai = 0; ai < availableTags.length; ai++) {
        html += '<option value="' + esc(availableTags[ai].id) + '">' + esc(availableTags[ai].name) + '</option>';
      }
      html += '</select>';
      html += '</div>';
    } else if (allTags.length === 0) {
      html += '<p class="cp-text-muted" style="margin-top:4px">No tags created yet.</p>';
    }

    html += '</div>';
    return html;
  }

