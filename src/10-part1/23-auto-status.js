  // ============================================================
  // SECTION 22: PERSISTENCE + LOGGING HELPERS
  // ============================================================

  function syncToTextarea() {
    if (!S.$textarea || !S.$metaTextarea || !S.$activityTextarea) return;
    try {
      S.$textarea.val(JSON.stringify(S.data, null, 2)).trigger('change');
      S.$metaTextarea.val(JSON.stringify(S.meta, null, 2)).trigger('change');
      S.$activityTextarea.val(JSON.stringify(S.activity, null, 2)).trigger('change');
      S.dirty = true;
      updateSaveStatus('unsaved');
    } catch (e) { console.error('[CP] Sync error:', e); }
  }
  function updateSaveStatus(status) {
    var $s = $('#cpSaveStatus');
    if (status === 'saving') $s.text('Saving...').removeClass('cp-saved cp-unsaved cp-synced').addClass('cp-saving');
    else if (status === 'saved') { $s.text('Saved').removeClass('cp-saving cp-unsaved cp-synced').addClass('cp-saved'); S.dirty = false; }
    else if (status === 'synced') { $s.text('Synced — click Save').removeClass('cp-saving cp-saved cp-unsaved').addClass('cp-synced'); }
    else $s.text('Unsaved').removeClass('cp-saving cp-saved cp-synced').addClass('cp-unsaved');
  }
  function startAutoSave() {
    if (S.autoSaveTimer) clearInterval(S.autoSaveTimer);
    S.autoSaveTimer = setInterval(function() { if (S.dirty) { syncToTextarea(); updateSaveStatus('synced'); } }, 30000);
  }
  function toast(msg, type, dur) {
    type = type || 'info'; dur = dur || 3000;
    var $c = $('#cpToasts');
    if (!$c.length) { $c = $('<div id="cpToasts" class="cp-toast-container"></div>'); $('#cpApp').append($c); }
    var id = 'toast_' + Date.now();
    var iconName = type === 'success' ? 'success' : (type === 'error' ? 'error' : (type === 'warning' ? 'warning' : 'info'));
    $c.append('<div class="cp-toast cp-toast-' + type + '" id="' + id + '"><span class="cp-toast-icon">' + icon(iconName) + '</span><span class="cp-toast-message">' + esc(msg) + '</span><button class="cp-toast-close" data-action="close-toast">&times;</button></div>');
    setTimeout(function() { $('#' + id).addClass('cp-toast-show'); }, 10);
    setTimeout(function() { $('#' + id).removeClass('cp-toast-show'); setTimeout(function() { $('#' + id).remove(); }, 300); }, dur);
  }
  var ACTIVITY_LOG_MAX = 500;
  function logActivity(type, entityType, entityId, entityTitle, description) {
    S.activity = S.activity || [];
    S.activity.push({
      id: generateId('act'), type: type,
      entity_type: entityType || '', entity_id: entityId || '', entity_title: entityTitle || '',
      description: description || '',
      timestamp: new Date().toISOString(),
      user_id: S.user.id || '', user_name: S.user.name || ''
    });
    if (S.activity.length > ACTIVITY_LOG_MAX) S.activity = S.activity.slice(-ACTIVITY_LOG_MAX);
  }

  $(window).on('beforeunload', function(e) {
    if (S.autoSaveTimer) clearInterval(S.autoSaveTimer);
    if (S.dirty) { e.preventDefault(); e.returnValue = ''; return ''; }
  });

