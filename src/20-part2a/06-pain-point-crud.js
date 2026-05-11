  // ============================================================
  // SECTION 6: PAIN POINT CRUD
  // ============================================================

  function openPainPointModal(ppId) {
    var isEdit = !!ppId;
    var pp = isEdit ? getPainPoint(ppId) : null;
    var ppCats = Constants.PAIN_POINT_CATEGORIES || [];

    var html = '<div class="cp-editor-form">';
    html += '<div class="cp-form-group"><label>Pain Point *</label>';
    html += '<textarea class="cp-textarea" data-field="pain_point" rows="2" placeholder="Describe the pain point...">' + esc(pp ? pp.pain_point : '') + '</textarea></div>';
    html += '<div class="cp-form-group"><label>Solution</label>';
    html += '<textarea class="cp-textarea" data-field="solution" rows="2" placeholder="How does your product solve this?">' + esc(pp ? pp.solution || '' : '') + '</textarea></div>';
    html += '<div class="cp-form-group"><label>Category</label>';
    html += '<select class="cp-select" data-field="category">';
    html += '<option value="">None</option>';
    for (var i = 0; i < ppCats.length; i++) {
      var sel = (pp && pp.category === ppCats[i].id) ? ' selected' : '';
      html += '<option value="' + esc(ppCats[i].id) + '"' + sel + '>' + esc(ppCats[i].name) + '</option>';
    }
    html += '</select></div>';
    html += '</div>';

    openModal(isEdit ? 'Edit Pain Point' : 'New Pain Point', html, {
      titleIcon: 'bolt',
      size: 'md',
      saveLabel: isEdit ? 'Save' : 'Create Pain Point',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.pain_point || !fields.pain_point.trim()) { toast('Pain point text is required', 'warning'); return; }
        if (isEdit) {
          snapshot('Edit pain point');
          saveEntityField('pain_point', ppId, 'pain_point', fields.pain_point.trim());
          saveEntityField('pain_point', ppId, 'solution', fields.solution || '');
          saveEntityField('pain_point', ppId, 'category', fields.category || '');
        } else {
          createEntity('pain_point', { pain_point: fields.pain_point.trim(), solution: fields.solution || '', category: fields.category || '' });
          snapshot('Create pain point');
        }
        closeModal();
      }
    });
  }

  function confirmDeletePainPoint(ppId) {
    var pp = getPainPoint(ppId);
    if (!pp) return;
    openConfirmDialog({
      title: 'Delete Pain Point',
      message: 'Delete this pain point? It will be unlinked from all personas and recipes.',
      confirmLabel: 'Delete', danger: true,
      onConfirm: function() {
        snapshot('Delete pain point');
        deleteEntity('pain_point', ppId);
      }
    });
  }

