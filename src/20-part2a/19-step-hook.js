  // ============================================================
  // SECTION 12: HOOK STEP RENDERER
  // ============================================================

  function renderHookStep(recipe) {
    var msg = S.messageMap[recipe.message_id];
    var hook = recipe.hook || {};
    var html = '<div class="cp-step-hook" data-recipe-id="' + esc(recipe.id) + '">';

    // Inherited hooks from message
    if (msg && (msg.hooks || []).length > 0) {
      html += '<div class="cp-card cp-hook-inherited">';
      html += '<div class="cp-hook-inherited-header">';
      html += '<h3>' + icon('anchor') + ' Message Hooks</h3>';
      html += '<span class="cp-text-muted">Inherited from: ' + esc(msg.title) + '</span>';
      html += '</div>';
      html += '<p class="cp-text-muted" style="margin-bottom:12px">Select a hook to open this recipe, or write a custom override below.</p>';

      html += '<div class="cp-hook-radio-list">';
      for (var hi = 0; hi < msg.hooks.length; hi++) {
        var h = msg.hooks[hi];
        var isSelected = hook.selected_hook_id === h.id;
        var htCfg = Constants.HOOK_TYPES[h.type] || { label: h.type, color: '#80868b' };

        html += '<label class="cp-hook-radio-item' + (isSelected ? ' cp-hook-radio-item-selected' : '') + '">';
        html += '<input type="radio" name="hook_select" value="' + esc(h.id) + '"' + (isSelected ? ' checked' : '') + ' data-action="select-hook" style="margin:3px 0 0;flex-shrink:0;cursor:pointer">';
        html += '<div style="flex:1"><div style="font-weight:600;font-size:13px">' + esc(h.text) + '</div>';
        html += '<div style="margin-top:4px">' + hookTypeBadge(h.type) + '</div>';
        html += '</div></label>';
      }
      html += '</div></div>';
    } else {
      html += '<div class="cp-card">';
      html += '<div class="cp-empty-state cp-empty-state--compact">';
      html += '<p>' + icon('info') + (msg ? ' No hooks defined on message "' + esc(msg.title) + '".' : ' No message linked to this recipe.') + '</p>';
      html += '</div></div>';
    }

    // Custom hook override
    html += '<div class="cp-card cp-hook-override" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('pen-fancy') + ' Custom Hook Override</h3>';
    html += renderRecipeAIBar('ai-generate-hook', recipe.id, 'AI Suggest', 'sparkles');
    html += '</div>';
    html += '<p class="cp-text-muted" style="margin-bottom:8px">Write a custom hook to override the inherited one. Leave empty to use the selected hook above.</p>';
    html += '<textarea class="cp-textarea" data-action="save-recipe-hook-custom" rows="3" placeholder="Write a custom opening hook...">' + esc(hook.custom_hook || '') + '</textarea>';

    // Hook type for custom
    if (hook.custom_hook) {
      html += '<div style="margin-top:8px"><label class="cp-field-label">Hook Type</label>';
      html += '<select class="cp-select cp-select-sm" data-action="save-recipe-hook-type" style="width:auto">';
      for (var tk in Constants.HOOK_TYPES) {
        html += '<option value="' + tk + '"' + (hook.hook_type === tk ? ' selected' : '') + '>' + esc(Constants.HOOK_TYPES[tk].label) + '</option>';
      }
      html += '</select></div>';
    }
    html += '</div>';

    // Effective hook summary
    var effectiveHook = getEffectiveHook(recipe);
    if (effectiveHook) {
      html += '<div class="cp-card" style="margin-top:var(--cp-space-4);background:var(--cp-success-light);border-color:rgba(13,144,79,0.15)">';
      html += '<div class="cp-section-header"><h3 style="color:var(--cp-success)">' + icon('check') + ' Active Hook</h3></div>';
      html += '<p style="font-weight:600;font-size:var(--cp-font-size-md);margin-bottom:4px">"' + esc(effectiveHook.text) + '"</p>';
      html += hookTypeBadge(effectiveHook.type);
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  function getEffectiveHook(recipe) {
    var hook = recipe.hook || {};
    // Custom override takes priority
    if (hook.custom_hook && hook.custom_hook.trim()) {
      return { text: hook.custom_hook.trim(), type: hook.hook_type || 'direct' };
    }
    // Selected inherited hook
    if (hook.selected_hook_id) {
      var msg = S.messageMap[recipe.message_id];
      if (msg) {
        var found = (msg.hooks || []).find(function(h) { return h.id === hook.selected_hook_id; });
        if (found) return { text: found.text, type: found.type };
      }
    }
    return null;
  }

