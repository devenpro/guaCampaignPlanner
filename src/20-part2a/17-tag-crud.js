  // ============================================================
  // SECTION 10: TAG CRUD
  // ============================================================

  function openTagModal(tagId) {
    var isEdit = !!tagId;
    var t = isEdit ? getTag(tagId) : null;
    var colors = ['#1a73e8', '#7c3aed', '#0d904f', '#e37400', '#d93025', '#0891b2', '#059669', '#be123c'];
    var currentColor = t ? t.color : colors[0];

    var html = '<div class="cp-editor-form">';
    html += '<div class="cp-form-group"><label>Tag Name *</label>';
    html += '<input type="text" class="cp-input" data-field="name" value="' + esc(t ? t.name : '') + '" placeholder="e.g., Q2 Campaign"></div>';
    html += '<div class="cp-form-group"><label>Description</label>';
    html += '<input type="text" class="cp-input" data-field="description" value="' + esc(t ? t.description || '' : '') + '" placeholder="What this tag represents..."></div>';
    html += '<div class="cp-form-group"><label>Color</label><div class="cp-chip-selector">';
    for (var ci = 0; ci < colors.length; ci++) {
      html += '<button type="button" class="cp-color-swatch' + (currentColor === colors[ci] ? ' cp-color-swatch-active' : '') + '" data-action="pick-color" data-color="' + colors[ci] + '" style="width:28px;height:28px;border-radius:50%;border:2px solid ' + (currentColor === colors[ci] ? 'var(--cp-text-primary)' : 'transparent') + ';background:' + colors[ci] + ';cursor:pointer;padding:0"></button>';
    }
    html += '<input type="hidden" data-field="color" value="' + esc(currentColor) + '">';
    html += '</div></div></div>';

    openModal(isEdit ? 'Edit Tag' : 'New Tag', html, {
      titleIcon: 'tag',
      size: 'sm',
      saveLabel: isEdit ? 'Save' : 'Create Tag',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.name || !fields.name.trim()) { toast('Tag name is required', 'warning'); return; }
        if (isEdit) {
          snapshot('Edit tag');
          saveEntityField('tag', tagId, 'name', fields.name.trim());
          saveEntityField('tag', tagId, 'description', fields.description || '');
          saveEntityField('tag', tagId, 'color', fields.color || colors[0]);
        } else {
          createEntity('tag', { name: fields.name.trim(), description: fields.description || '', color: fields.color || colors[0] });
          snapshot('Create tag');
        }
        closeModal();
      }
    });
  }

  function confirmDeleteTag(tagId) {
    var t = getTag(tagId);
    if (!t) return;
    openConfirmDialog({
      title: 'Delete Tag',
      message: 'Delete "' + t.name + '"? It will be removed from all entities.',
      confirmLabel: 'Delete', danger: true,
      onConfirm: function() { snapshot('Delete tag'); deleteEntity('tag', tagId); }
    });
  }

