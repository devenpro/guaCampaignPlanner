  // ============================================================
  // SECTION 19: IMPORT/EXPORT
  // ============================================================

  function exportJSON(mode) {
    mode = mode || 'combined';
    var name = ((S.meta.workspace && S.meta.workspace.name) || 'cp').toLowerCase().replace(/\s+/g, '-');
    var date = new Date().toISOString().split('T')[0];
    var json, fileName;
    if (mode === 'meta-only') { json = JSON.stringify(S.meta, null, 2); fileName = name + '-meta-' + date + '.json'; }
    else if (mode === 'data-only') { json = JSON.stringify(S.data, null, 2); fileName = name + '-data-' + date + '.json'; }
    else { json = JSON.stringify({ _format: 'cp-combined', _version: '1.0', meta: S.meta, data: S.data, activity: S.activity }, null, 2); fileName = name + '-export-' + date + '.json'; }
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob); var a = document.createElement('a');
    a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    toast('Exported: ' + fileName, 'success');
  }

  function validateImportData(data, type) {
    // type: 'combined', 'meta', 'data'
    if (!data || typeof data !== 'object') return 'Import file does not contain a valid JSON object.';
    if (type === 'combined') {
      if (!data.meta || typeof data.meta !== 'object') return 'Combined import is missing "meta" object.';
      if (!data.data || typeof data.data !== 'object') return 'Combined import is missing "data" object.';
    }
    if (type === 'meta' || type === 'combined') {
      var meta = type === 'combined' ? data.meta : data;
      if (!meta.workspace && !meta.settings) return 'Meta import is missing "workspace" or "settings".';
    }
    if (type === 'data' || type === 'combined') {
      var d = type === 'combined' ? data.data : data;
      if (!Array.isArray(d.personas) && !Array.isArray(d.messages) && !Array.isArray(d.recipes)) {
        return 'Data import must contain at least one entity array (personas, messages, or recipes).';
      }
    }
    return null; // valid
  }

  function importJSON() {
    var $input = $('#cpImportFile');
    if (!$input.length) { $input = $('<input type="file" id="cpImportFile" accept=".json" style="display:none">'); $('body').append($input); }
    $input.off('change').on('change', function(e) {
      var file = e.target.files[0]; if (!file) return;
      if (file.size > 10 * 1024 * 1024) { toast('File too large (max 10 MB)', 'error'); $input.val(''); return; }
      var reader = new FileReader();
      reader.onload = function(evt) {
        try {
          var imported = JSON.parse(evt.target.result);
          // Determine import type and validate
          var importType, validationError;
          if (imported._format === 'cp-combined' && imported.meta && imported.data) {
            importType = 'combined';
          } else if (imported.workspace || imported.settings) {
            importType = 'meta';
          } else {
            importType = 'data';
          }
          validationError = validateImportData(imported, importType);
          if (validationError) { toast(validationError, 'error'); $input.val(''); return; }

          var detailMsg = importType === 'combined' ? 'This will replace ALL data and settings.' :
            importType === 'meta' ? 'This will replace settings/config only.' : 'This will replace entity data only.';
          openConfirmDialog({ title: 'Import Data', message: 'Replace current data? ' + detailMsg + ' Current data will be lost.', confirmLabel: 'Import', danger: true,
            onConfirm: function() {
              // Snapshot before import for rollback via undo
              snapshot('Before import');
              if (importType === 'combined') {
                S.meta = imported.meta; S.data = imported.data; S.activity = imported.activity || [];
              } else if (importType === 'meta') { S.meta = imported; }
              else {
                // Preserve essential arrays that might be missing in partial imports
                S.data.personas = imported.personas || S.data.personas || [];
                S.data.persona_categories = imported.persona_categories || S.data.persona_categories || [];
                S.data.pain_points = imported.pain_points || S.data.pain_points || [];
                S.data.messages = imported.messages || S.data.messages || [];
                S.data.styles = imported.styles || S.data.styles || [];
                S.data.visual_formats = imported.visual_formats || S.data.visual_formats || [];
                S.data.recipes = imported.recipes || S.data.recipes || [];
                S.data.campaigns = imported.campaigns || S.data.campaigns || [];
                S.data.tags = imported.tags || S.data.tags || [];
              }
              logActivity('data_imported', '', '', 'Data imported from file (' + importType + ')');
              snapshot('Import'); buildMaps(); render(); syncToTextarea(); toast('Imported successfully', 'success');
            }
          });
        } catch(err) { toast('Invalid JSON file: ' + err.message, 'error'); }
      };
      reader.readAsText(file); $input.val('');
    });
    $input.click();
  }

