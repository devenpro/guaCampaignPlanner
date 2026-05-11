  // ============================================================
  // SECTION 7: MESSAGE CRUD (with hooks)
  // ============================================================

  function openMessageModal(msgId) {
    var isEdit = !!msgId;
    var m = isEdit ? getMessage(msgId) : null;
    var funnels = (S.meta.settings && S.meta.settings.funnel_stages) || [];
    var existingStages = m ? (m.funnel_stages || []) : [];
    var existingHooks = m ? (m.hooks || []) : [];

    var html = '<div class="cp-editor-form">';

    // Title
    html += '<div class="cp-form-group"><label>Message Title *</label>';
    html += '<input type="text" class="cp-input" data-field="title" value="' + esc(m ? m.title : '') + '" placeholder="e.g., Time Freedom Angle"></div>';

    // Body
    html += '<div class="cp-form-group"><label>Message Body</label>';
    html += '<textarea class="cp-textarea" data-field="body" rows="4" placeholder="The core message text...">' + esc(m ? m.body || '' : '') + '</textarea></div>';

    // Funnel stages (chips)
    html += '<div class="cp-form-group"><label>Funnel Stages</label>';
    html += '<div class="cp-funnel-chip-selector">';
    for (var fi = 0; fi < funnels.length; fi++) {
      var f = funnels[fi];
      var isActive = existingStages.indexOf(f.id) > -1;
      html += '<button type="button" class="cp-funnel-chip' + (isActive ? ' cp-funnel-chip-active' : '') + '" data-action="toggle-funnel-chip" data-stage-id="' + esc(f.id) + '" style="--opt-color:' + f.color + ';' + (isActive ? 'background:' + f.color + ';border-color:' + f.color + ';color:#fff' : 'border-color:' + f.color + '40;color:' + f.color) + '">' + esc(f.short || f.name) + '</button>';
    }
    html += '</div></div>';

    // Delivery notes
    html += '<div class="cp-form-group"><label>Delivery & Narrative Notes</label>';
    html += '<textarea class="cp-textarea" data-field="delivery_notes" rows="3" placeholder="How should this message be delivered? Emotional direction, acting notes...">' + esc(m ? m.delivery_notes || '' : '') + '</textarea></div>';

    // Theme
    html += '<div class="cp-form-row"><div class="cp-form-half">';
    html += '<label>Theme / Topic</label>';
    html += '<input type="text" class="cp-input" data-field="theme" value="' + esc(m ? m.theme || '' : '') + '" placeholder="e.g., Productivity, Social Proof">';
    html += '</div><div class="cp-form-half">';
    html += '<label>Notes</label>';
    html += '<input type="text" class="cp-input" data-field="notes" value="' + esc(m ? m.notes || '' : '') + '" placeholder="Internal notes...">';
    html += '</div></div>';

    // Hooks sub-section
    html += '<div class="cp-card" style="margin-top:12px">';
    html += '<h3 style="margin-bottom:8px">' + icon('anchor') + ' Hooks</h3>';
    html += '<p class="cp-text-muted" style="margin-bottom:8px">Opening hooks for this message. Recipes can inherit or override these.</p>';
    html += '<div class="cp-hook-list" id="cpModalHookList">';
    for (var hi = 0; hi < existingHooks.length; hi++) {
      html += renderHookEditRow(existingHooks[hi], hi);
    }
    html += '</div>';
    html += '<div class="cp-hook-add" style="margin-top:8px">';
    html += '<button type="button" class="cp-btn cp-btn-outline cp-btn-sm" data-action="add-hook-row">' + icon('plus') + ' Add Hook</button>';
    html += '</div></div>';

    html += '</div>';

    openModal(isEdit ? 'Edit Message' : 'New Message', html, {
      titleIcon: 'comment-dots',
      size: 'lg',
      saveLabel: isEdit ? 'Save Message' : 'Create Message',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.title || !fields.title.trim()) { toast('Message title is required', 'warning'); return; }

        var funnelStages = collectFunnelChips();

        // Collect hooks from the hook list
        var hooks = [];
        $('#cpModalHookList .cp-hook-edit-row').each(function() {
          var text = $(this).find('[data-hook-field="text"]').val() || '';
          var type = $(this).find('[data-hook-field="type"]').val() || 'direct';
          var id = $(this).data('hook-id') || generateId('hk');
          if (text.trim()) {
            hooks.push({ id: id, text: text.trim(), type: type });
          }
        });

        if (isEdit) {
          snapshot('Edit message');
          saveEntityField('message', msgId, 'title', fields.title.trim());
          saveEntityField('message', msgId, 'body', fields.body || '');
          saveEntityField('message', msgId, 'funnel_stages', funnelStages);
          saveEntityField('message', msgId, 'delivery_notes', fields.delivery_notes || '');
          saveEntityField('message', msgId, 'theme', fields.theme || '');
          saveEntityField('message', msgId, 'notes', fields.notes || '');
          saveEntityField('message', msgId, 'hooks', hooks);
        } else {
          var newMsg = createEntity('message', {
            title: fields.title.trim(), body: fields.body || '',
            funnel_stages: funnelStages, delivery_notes: fields.delivery_notes || '',
            theme: fields.theme || '', notes: fields.notes || '', hooks: hooks
          });
          snapshot('Create message');
        }
        closeModal();
      }
    });
  }

  function renderHookEditRow(hook, index) {
    var hookTypes = Constants.HOOK_TYPES || {};
    var html = '<div class="cp-hook-edit-row" data-hook-id="' + esc(hook.id || '') + '" data-hook-index="' + index + '">';
    html += '<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:4px">';
    html += '<input type="text" class="cp-input" data-hook-field="text" value="' + esc(hook.text || '') + '" placeholder="Hook text..." style="flex:1">';
    html += '<select class="cp-select cp-select-sm" data-hook-field="type" style="width:auto;min-width:100px">';
    for (var tk in hookTypes) {
      var sel = (hook.type === tk) ? ' selected' : '';
      html += '<option value="' + tk + '"' + sel + '>' + esc(hookTypes[tk].label) + '</option>';
    }
    html += '</select>';
    html += '<button type="button" class="cp-btn-icon cp-btn-xs" data-action="remove-hook-row" data-hook-index="' + index + '" title="Remove">' + icon('trash') + '</button>';
    html += '</div></div>';
    return html;
  }

  function addHookRow() {
    var $list = $('#cpModalHookList');
    var idx = $list.find('.cp-hook-edit-row').length;
    $list.append(renderHookEditRow({ id: generateId('hk'), text: '', type: 'direct' }, idx));
    $list.find('.cp-hook-edit-row:last input').first().focus();
  }

  function removeHookRow(index) {
    $('#cpModalHookList .cp-hook-edit-row').eq(index).remove();
  }

  function confirmDeleteMessage(msgId) {
    var m = getMessage(msgId);
    if (!m) return;
    var recipeCount = (S.messageRecipeCounts || {})[msgId] || 0;
    openConfirmDialog({
      title: 'Delete Message',
      message: 'Delete "' + m.title + '"?' + (recipeCount > 0 ? ' ' + recipeCount + ' recipe(s) will lose their message reference.' : ''),
      confirmLabel: 'Delete', danger: true,
      onConfirm: function() {
        snapshot('Delete message');
        deleteEntity('message', msgId);
      }
    });
  }

