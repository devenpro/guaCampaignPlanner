  // ============================================================
  // SECTION 8: STYLE & FORMAT CRUD
  // ============================================================

  function openStyleModal(styleId) {
    var isEdit = !!styleId;
    var s = isEdit ? getStyle(styleId) : null;

    var html = '<div class="cp-editor-form">';
    html += '<div class="cp-form-group"><label>Style Name *</label>';
    html += '<input type="text" class="cp-input" data-field="name" value="' + esc(s ? s.name : '') + '" placeholder="e.g., Friendly & Relatable"></div>';
    html += '<div class="cp-form-group"><label>Description</label>';
    html += '<textarea class="cp-textarea" data-field="description" rows="3" placeholder="Describe the tone, approach, and feel of this style...">' + esc(s ? s.description || '' : '') + '</textarea></div>';
    html += '</div>';

    openModal(isEdit ? 'Edit Style' : 'New Style', html, {
      titleIcon: 'palette',
      size: 'md',
      saveLabel: isEdit ? 'Save' : 'Create Style',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.name || !fields.name.trim()) { toast('Style name is required', 'warning'); return; }
        if (isEdit) {
          snapshot('Edit style');
          saveEntityField('style', styleId, 'name', fields.name.trim());
          saveEntityField('style', styleId, 'description', fields.description || '');
        } else {
          createEntity('style', { name: fields.name.trim(), description: fields.description || '' });
          snapshot('Create style');
        }
        closeModal();
      }
    });
  }

  function confirmDeleteStyle(styleId) {
    var s = getStyle(styleId);
    if (!s) return;
    openConfirmDialog({
      title: 'Delete Style',
      message: 'Delete "' + s.name + '"?',
      confirmLabel: 'Delete', danger: true,
      onConfirm: function() { snapshot('Delete style'); deleteEntity('style', styleId); }
    });
  }

  function openFormatModal(formatId) {
    var isEdit = !!formatId;
    var f = isEdit ? getFormat(formatId) : null;
    var formatCats = Constants.FORMAT_CATEGORIES || [];

    var html = '<div class="cp-editor-form">';
    html += '<div class="cp-form-row"><div class="cp-form-half">';
    html += '<label>Format Name *</label>';
    html += '<input type="text" class="cp-input" data-field="name" value="' + esc(f ? f.name : '') + '" placeholder="e.g., Indoor Studio Shoot"></div>';
    html += '<div class="cp-form-half"><label>Category</label>';
    html += '<select class="cp-select" data-field="category">';
    html += '<option value="">None</option>';
    for (var ci = 0; ci < formatCats.length; ci++) {
      var sel = (f && f.category === formatCats[ci].id) ? ' selected' : '';
      html += '<option value="' + esc(formatCats[ci].id) + '"' + sel + '>' + esc(formatCats[ci].name) + '</option>';
    }
    html += '</select></div></div>';
    html += '<div class="cp-form-group"><label>Description</label>';
    html += '<textarea class="cp-textarea" data-field="description" rows="3" placeholder="Describe the visual approach, setting, and feel...">' + esc(f ? f.description || '' : '') + '</textarea></div>';
    html += '</div>';

    openModal(isEdit ? 'Edit Visual Format' : 'New Visual Format', html, {
      titleIcon: 'clapperboard',
      size: 'md',
      saveLabel: isEdit ? 'Save' : 'Create Format',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.name || !fields.name.trim()) { toast('Format name is required', 'warning'); return; }
        if (isEdit) {
          snapshot('Edit format');
          saveEntityField('visual_format', formatId, 'name', fields.name.trim());
          saveEntityField('visual_format', formatId, 'description', fields.description || '');
          saveEntityField('visual_format', formatId, 'category', fields.category || '');
        } else {
          createEntity('visual_format', { name: fields.name.trim(), description: fields.description || '', category: fields.category || '' });
          snapshot('Create format');
        }
        closeModal();
      }
    });
  }

  function confirmDeleteFormat(formatId) {
    var f = getFormat(formatId);
    if (!f) return;
    openConfirmDialog({
      title: 'Delete Visual Format',
      message: 'Delete "' + f.name + '"?',
      confirmLabel: 'Delete', danger: true,
      onConfirm: function() { snapshot('Delete format'); deleteEntity('visual_format', formatId); }
    });
  }

