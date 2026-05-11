  // ============================================================
  // SECTION 18: CONFIG CRUD & SETTINGS SAVE
  // ============================================================

  function saveAllSettings() {
    // Collect all settings fields
    $('.cp-settings-field').each(function() {
      var path = $(this).data('path'); var val = $(this).is(':checkbox') ? $(this).is(':checked') : $(this).val();
      if (!path) return;
      var parts = path.split('.'); var obj = S.meta;
      for (var i = 0; i < parts.length - 1; i++) { obj[parts[i]] = obj[parts[i]] || {}; obj = obj[parts[i]]; }
      obj[parts[parts.length - 1]] = val;
    });
    // Save brand colors
    $('.cp-brand-color-text').each(function() {
      var key = $(this).data('color-key'); var val = $(this).val();
      S.meta.settings = S.meta.settings || {};
      S.meta.settings.brand_design = S.meta.settings.brand_design || {};
      S.meta.settings.brand_design.colors = S.meta.settings.brand_design.colors || {};
      S.meta.settings.brand_design.colors[key] = val;
    });
    // Save AI default
    var $defProv = $('.cp-ai-provider-select[data-action-id="app-default"]');
    if ($defProv.length) {
      S.meta.aiPreferences = S.meta.aiPreferences || {};
      S.meta.aiPreferences.appDefault = { provider: $defProv.val(), model: $('.cp-ai-model-select[data-action-id="app-default"]').val() };
    }
    logActivity('settings_changed', '', '', 'Settings updated');
    snapshot('Save settings'); syncToTextarea(); render();
    toast('Settings saved', 'success');
  }

  function addFunnelStage() {
    var html = '<div class="cp-editor-form">';
    html += '<div class="cp-form-group"><label>Stage Name *</label><input type="text" class="cp-input" data-field="name" placeholder="e.g., Retargeting"></div>';
    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Short Label *</label><input type="text" class="cp-input" data-field="short" placeholder="e.g., RET" maxlength="6"></div>';
    html += '<div class="cp-form-half"><label>Color</label><input type="color" data-field="color" value="#1a73e8" style="width:40px;height:32px;cursor:pointer"></div></div>';
    html += '</div>';
    openModal('New Funnel Stage', html, {
      titleIcon: 'filter', size: 'sm', saveLabel: 'Add Stage',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.name || !fields.name.trim()) { toast('Name required', 'warning'); return; }
        S.meta.settings.funnel_stages = S.meta.settings.funnel_stages || [];
        S.meta.settings.funnel_stages.push({
          id: generateId('fs'), name: fields.name.trim(), short: (fields.short || '').trim().toUpperCase() || fields.name.trim().substring(0, 4).toUpperCase(),
          color: fields.color || '#1a73e8', order: S.meta.settings.funnel_stages.length, system: false
        });
        snapshot('Add funnel stage'); buildMaps(); syncToTextarea(); closeModal(); render();
        toast('Funnel stage added', 'success');
      }
    });
  }

  function deleteFunnelStage(index) {
    var funnels = (S.meta.settings && S.meta.settings.funnel_stages) || [];
    if (!funnels[index] || funnels[index].system) { toast('System stages cannot be deleted', 'warning'); return; }
    var name = funnels[index].name;
    openConfirmDialog({
      title: 'Delete Funnel Stage', message: 'Delete "' + name + '"?', confirmLabel: 'Delete', danger: true,
      onConfirm: function() {
        funnels.splice(index, 1);
        snapshot('Delete funnel stage'); buildMaps(); syncToTextarea(); render();
        toast('Stage deleted', 'success');
      }
    });
  }

