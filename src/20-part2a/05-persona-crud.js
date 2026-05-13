  // ============================================================
  // SECTION 5: PERSONA CRUD
  // ============================================================

  function openPersonaModal(personaId) {
    var isEdit = !!personaId;
    var p = isEdit ? getPersona(personaId) : null;
    var demo = p ? (p.demographics || {}) : {};
    var psych = p ? (p.psychographics || {}) : {};
    var categories = getAllCategories();
    var painPoints = getAllPainPoints();
    var linkedPPs = p ? (p.pain_point_ids || []) : [];

    var html = '<div class="cp-editor-form">';

    // Basic fields
    html += '<div class="cp-form-row"><div class="cp-form-half">';
    html += '<label>Persona Name *</label>';
    html += '<input type="text" class="cp-input" data-field="name" value="' + esc(p ? p.name : '') + '" placeholder="e.g., YouTuber Educator">';
    html += '</div><div class="cp-form-half">';
    html += '<label>Category</label>';
    html += '<select class="cp-select" data-field="category_id">';
    html += '<option value="">Uncategorized</option>';
    for (var ci = 0; ci < categories.length; ci++) {
      var sel = (p && p.category_id === categories[ci].id) ? ' selected' : '';
      html += '<option value="' + esc(categories[ci].id) + '"' + sel + '>' + esc(categories[ci].name) + '</option>';
    }
    html += '</select></div></div>';

    html += '<div class="cp-form-group"><label>Description</label>';
    html += '<textarea class="cp-textarea" data-field="description" rows="2" placeholder="Brief description of this persona...">' + esc(p ? p.description || '' : '') + '</textarea></div>';

    // Demographics
    html += '<div class="cp-card cp-persona-demographics" style="margin-bottom:12px">';
    html += '<h3 style="margin-bottom:12px">' + icon('user') + ' Demographics</h3>';
    html += '<div class="cp-demo-grid">';
    var demoFields = [
      ['age_range', 'Age Range', 'e.g., 20-35'],
      ['gender', 'Gender', 'e.g., Male, Female, All'],
      ['location', 'Location', 'e.g., Tier 1/2 Cities'],
      ['income_level', 'Income Level', 'e.g., Middle, Upper'],
      ['education', 'Education', 'e.g., Graduate'],
      ['occupation', 'Occupation', 'e.g., Content Creator']
    ];
    for (var di = 0; di < demoFields.length; di++) {
      html += '<div class="cp-form-group"><label>' + esc(demoFields[di][1]) + '</label>';
      html += '<input type="text" class="cp-input" data-field="demo_' + demoFields[di][0] + '" value="' + esc(demo[demoFields[di][0]] || '') + '" placeholder="' + esc(demoFields[di][2]) + '"></div>';
    }
    html += '</div></div>';

    // Psychographics
    html += '<div class="cp-card cp-persona-psychographics" style="margin-bottom:12px">';
    html += '<h3 style="margin-bottom:12px">' + icon('heart') + ' Psychographics</h3>';
    html += '<div class="cp-psych-grid">';
    var psychFields = [
      ['desires', 'Desires & Motivations', 'What they want to achieve...'],
      ['requirements', 'Requirements', 'What they need in a solution...'],
      ['emotional_triggers', 'Emotional Triggers', 'What drives their decisions...'],
      ['motivations', 'Motivations', 'Deeper motivations...'],
      ['fears', 'Fears & Obstacles', 'What holds them back...'],
      ['values', 'Values', 'What they believe in...']
    ];
    for (var psi = 0; psi < psychFields.length; psi++) {
      html += '<div class="cp-form-group"><label>' + esc(psychFields[psi][1]) + '</label>';
      html += '<textarea class="cp-textarea" data-field="psych_' + psychFields[psi][0] + '" rows="2" placeholder="' + esc(psychFields[psi][2]) + '">' + esc(psych[psychFields[psi][0]] || '') + '</textarea></div>';
    }
    html += '</div></div>';

    // Pain Points (shared library picker)
    if (painPoints.length > 0) {
      html += '<div class="cp-card" style="margin-bottom:12px">';
      html += '<h3 style="margin-bottom:12px">' + icon('bolt') + ' Link Pain Points</h3>';
      html += '<div class="cp-pain-point-picker-list">';
      for (var ppi = 0; ppi < painPoints.length; ppi++) {
        var pp = painPoints[ppi];
        var isLinked = linkedPPs.indexOf(pp.id) > -1;
        html += '<label class="cp-pain-point-picker-item' + (isLinked ? ' cp-pain-point-picker-item-selected' : '') + '">';
        html += '<input type="checkbox" data-pp-id="' + esc(pp.id) + '"' + (isLinked ? ' checked' : '') + '>';
        html += '<div><div style="font-weight:600;font-size:13px">' + esc(truncate(pp.pain_point, 60)) + '</div>';
        if (pp.solution) html += '<div style="font-size:11px;color:var(--cp-success);margin-top:2px">' + icon('lightbulb') + ' ' + esc(truncate(pp.solution, 50)) + '</div>';
        html += '</div></label>';
      }
      html += '</div></div>';
    }

    // Notes
    html += '<div class="cp-form-group"><label>Notes</label>';
    html += '<textarea class="cp-textarea" data-field="notes" rows="2" placeholder="Any additional notes...">' + esc(p ? p.notes || '' : '') + '</textarea></div>';

    html += '</div>';

    openModal(isEdit ? 'Edit Persona' : 'New Persona', html, {
      titleIcon: 'user',
      size: 'lg',
      saveLabel: isEdit ? 'Save Persona' : 'Create Persona',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.name || !fields.name.trim()) { toast('Persona name is required', 'warning'); return; }

        // Collect pain point selections
        var selectedPPs = [];
        $('.cp-modal-body input[data-pp-id]:checked').each(function() {
          selectedPPs.push($(this).data('pp-id'));
        });

        // Build demographics object
        var demographics = {
          age_range: fields.demo_age_range || '', gender: fields.demo_gender || '',
          location: fields.demo_location || '', income_level: fields.demo_income_level || '',
          education: fields.demo_education || '', occupation: fields.demo_occupation || '', custom: {}
        };

        // Build psychographics object
        var psychographics = {
          desires: fields.psych_desires || '', requirements: fields.psych_requirements || '',
          emotional_triggers: fields.psych_emotional_triggers || '', motivations: fields.psych_motivations || '',
          fears: fields.psych_fears || '', values: fields.psych_values || '', custom: {}
        };

        if (isEdit) {
          snapshot('Edit persona');
          saveEntityField('persona', personaId, 'name', fields.name.trim());
          saveEntityField('persona', personaId, 'category_id', fields.category_id || '');
          saveEntityField('persona', personaId, 'description', fields.description || '');
          saveEntityField('persona', personaId, 'demographics', demographics);
          saveEntityField('persona', personaId, 'psychographics', psychographics);
          saveEntityField('persona', personaId, 'pain_point_ids', selectedPPs);
          saveEntityField('persona', personaId, 'notes', fields.notes || '');
        } else {
          var newPersona = createEntity('persona', {
            name: fields.name.trim(), category_id: fields.category_id || '',
            description: fields.description || '', demographics: demographics,
            psychographics: psychographics, pain_point_ids: selectedPPs,
            notes: fields.notes || ''
          });
          if (newPersona) { S.selectedPersonaId = newPersona.id; snapshot('Create persona'); }
        }
        closeModal();
      }
    });
  }

  function confirmDeletePersona(personaId) {
    var p = getPersona(personaId);
    if (!p) return;
    openConfirmDialog({
      title: 'Delete Persona',
      message: 'Delete "' + p.name + '"?',
      confirmLabel: 'Delete', danger: true,
      onConfirm: function() {
        snapshot('Delete persona');
        deleteEntity('persona', personaId);
        if (S.selectedPersonaId === personaId) S.selectedPersonaId = null;
      }
    });
  }

