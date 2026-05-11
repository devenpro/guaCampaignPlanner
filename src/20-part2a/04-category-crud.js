  // ============================================================
  // SECTION 4: CATEGORY CRUD
  // ============================================================

  function openCategoryModal(catId) {
    var isEdit = !!catId;
    var cat = isEdit ? getCategory(catId) : null;

    var html = '<div class="cp-editor-form">';
    html += '<div class="cp-form-group"><label>Category Name *</label>';
    html += '<input type="text" class="cp-input" data-field="name" value="' + esc(cat ? cat.name : '') + '" placeholder="e.g., Educator, Student, Professional"></div>';
    html += '<div class="cp-form-group"><label>Description</label>';
    html += '<input type="text" class="cp-input" data-field="description" value="' + esc(cat ? cat.description || '' : '') + '" placeholder="Brief description of this category"></div>';
    html += '</div>';

    openModal(isEdit ? 'Edit Category' : 'New Category', html, {
      titleIcon: 'folder-plus',
      size: 'sm',
      saveLabel: isEdit ? 'Save' : 'Create Category',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.name || !fields.name.trim()) { toast('Category name is required', 'warning'); return; }
        if (isEdit) {
          snapshot('Edit category');
          saveEntityField('persona_category', catId, 'name', fields.name.trim());
          if (fields.description !== undefined) saveEntityField('persona_category', catId, 'description', fields.description || '');
        } else {
          createEntity('persona_category', { name: fields.name.trim(), description: fields.description || '' });
          snapshot('Create category');
        }
        closeModal();
      }
    });
  }

  function confirmDeleteCategory(catId) {
    var cat = getCategory(catId);
    if (!cat) return;
    var personaCount = (S.data.personas || []).filter(function(p) { return p.category_id === catId; }).length;
    openConfirmDialog({
      title: 'Delete Category',
      message: 'Delete "' + cat.name + '"?' + (personaCount > 0 ? ' ' + personaCount + ' persona(s) will become uncategorized.' : ''),
      confirmLabel: 'Delete', danger: true,
      onConfirm: function() {
        snapshot('Delete category');
        deleteEntity('persona_category', catId);
      }
    });
  }

