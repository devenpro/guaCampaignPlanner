  // ============================================================
  // SECTION 22: AUTO-STATUS ENGINE
  // ============================================================

  function evaluateAutoStatus(recipe) {
    if (!recipe) return null;
    var currentIdx = STATUS_ORDER.indexOf(recipe.status);
    if (currentIdx < 0) return null;
    var suggested = recipe.status;

    // draft → hook_ready
    var hook = recipe.hook || {};
    if (STATUS_ORDER.indexOf('hook_ready') > currentIdx) {
      if (hook.selected_hook_id || (hook.custom_hook && hook.custom_hook.trim().length > 10)) {
        suggested = 'hook_ready';
      }
    }

    // hook_ready → content_ready
    var sugIdx = STATUS_ORDER.indexOf(suggested);
    var content = recipe.content || {};
    if (STATUS_ORDER.indexOf('content_ready') > sugIdx) {
      var adCopyText = stripHtml(content.ad_copy || '');
      if (adCopyText.trim().length > 50) {
        suggested = 'content_ready';
      }
    }

    // content_ready → media_ready
    // Media production now happens in dedicated apps (image_production,
    // carousel_production, video_production). The recipe is considered
    // production-ready as soon as a media type is chosen for handoff and
    // ad copy is in place — the actual creative is built downstream.
    // A production node attached to the recipe is the strongest possible
    // signal and advances us regardless of intermediate state.
    sugIdx = STATUS_ORDER.indexOf(suggested);
    if (STATUS_ORDER.indexOf('media_ready') > sugIdx) {
      var hasProd = typeof getRecipeProduction === 'function' && !!getRecipeProduction(recipe);
      if (hasProd) {
        suggested = 'media_ready';
      } else if (recipe.media_type && suggested === 'content_ready') {
        suggested = 'media_ready';
      }
    }

    // in_review, approved, live are manual only
    return suggested === recipe.status ? null : suggested;
  }

  function maybeAdvanceRecipeStatus(recipe, reason) {
    if (!recipe) return false;
    var suggested = evaluateAutoStatus(recipe);
    if (!suggested) return false;
    var currentIdx = STATUS_ORDER.indexOf(recipe.status);
    var suggestedIdx = STATUS_ORDER.indexOf(suggested);
    if (suggestedIdx <= currentIdx) return false;

    var oldLabel = (RECIPE_STATUSES[recipe.status] || {}).label || recipe.status;
    var newLabel = (RECIPE_STATUSES[suggested] || {}).label || suggested;
    recipe.status = suggested;
    recipe.updated = new Date().toISOString();
    logActivity('recipe_status_changed', 'recipe', recipe.id, recipe.title, oldLabel + ' → ' + newLabel + (reason ? ' (' + reason + ')' : ''));
    toast('Auto-advanced to ' + newLabel + (reason ? ' — ' + reason : ''), 'success', 4000);
    return true;
  }
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

