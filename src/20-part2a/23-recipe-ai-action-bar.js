  // ============================================================
  // SECTION 15.5: RECIPE AI ACTION BAR (Expandable Picker)
  // ============================================================

  function renderRecipeAIBar(actionId, recipeId, label, iconName) {
    iconName = iconName || 'sparkles';
    var panelId = actionId.replace(/[^a-zA-Z0-9]/g, '_') + '_' + recipeId.substring(0, 6);
    var html = '<div class="cp-ai-action-bar" data-panel-id="' + esc(panelId) + '">';
    html += '<button class="cp-btn cp-btn-ai cp-btn-sm" data-action="expand-ai-action" data-panel-id="' + esc(panelId) + '">' + icon(iconName) + ' ' + esc(label) + '</button>';

    // Expandable panel (hidden by default)
    html += '<div class="cp-ai-action-expanded" id="cpAIPanel_' + esc(panelId) + '" style="display:none">';
    html += '<div class="cp-ai-action-row">';
    // AI Picker
    html += '<div class="cp-ai-action-picker">';
    html += (window._cpAiSel ? window._cpAiSel(actionId) : '');
    html += '</div>';
    html += '</div>';
    // Custom instructions
    html += '<div class="cp-form-group" style="margin:var(--cp-space-2) 0">';
    html += '<textarea class="cp-textarea cp-ai-custom-instructions" data-panel-id="' + esc(panelId) + '" rows="2" placeholder="Custom instructions for this AI action (optional)..."></textarea>';
    html += '</div>';
    // Generate button
    html += '<div class="cp-ai-action-footer">';
    html += '<button class="cp-btn cp-btn-ai cp-btn-sm" data-action="' + esc(actionId) + '" data-recipe-id="' + esc(recipeId) + '" data-panel-id="' + esc(panelId) + '">' + icon('sparkles') + ' Generate</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="collapse-ai-action" data-panel-id="' + esc(panelId) + '">Cancel</button>';
    html += '</div></div>';
    html += '</div>';
    return html;
  }

