  // ============================================================
  // SECTION 9D: LIBRARY ↔ WORKSPACE PICKERS (v2 Stage 3)
  // ============================================================
  //
  // Two small picker modals that bridge from a library entity detail
  // pane into the Meta v2 workspace:
  //   - Pick which Campaign to create an Ad Set under (when a Persona
  //     "Create Ad Set" action fires and >1 campaigns exist)
  //   - Pick which Ad Set's brief to attach a Message/Style/Format to

  function openMetaAdSetModalWithPersona(campaignId, personaId) {
    // Open the Ad Set modal pre-populated with a persona link. We do this
    // by stashing the desired persona on a global and intercepting in the
    // modal — simpler than threading another argument through.
    window._cpV2PendingPersonaId = personaId;
    openMetaAdSetModal(campaignId, { create: true });
    // The modal reads from `s.persona_id` which is empty for new sets.
    // Pre-select after a tick.
    setTimeout(function() {
      var $sel = $('.cp-modal-body select[data-field="persona_id"]');
      if ($sel.length && personaId) {
        $sel.val(personaId).trigger('change');
      }
      window._cpV2PendingPersonaId = null;
    }, 50);
  }

  function openCampaignPickerForAdSet(personaId) {
    var camps = getAllCampaignsV2();
    var persona = getPersona(personaId);

    var html = '<div class="cp-editor-form">';
    html += '<p>Pick a campaign to add an Ad Set targeting <strong>' + esc(persona ? persona.name : 'this persona') + '</strong> to:</p>';
    html += '<div class="cp-picker-list">';
    for (var i = 0; i < camps.length; i++) {
      var c = camps[i];
      var sets = getAdSetsByCampaign(c.id).length;
      var obj = metaObjective(c.objective);
      html += '<button class="cp-picker-item" data-pick-id="' + esc(c.id) + '">';
      html += '<div class="cp-picker-item-title">' + icon('bullhorn') + ' ' + esc(c.name || 'Untitled') + '</div>';
      html += '<div class="cp-picker-item-meta">' + (obj ? esc(obj.label) + ' · ' : '') + sets + ' Ad Set' + (sets !== 1 ? 's' : '') + '</div>';
      html += '</button>';
    }
    html += '</div></div>';

    openModal('Create Ad Set under...', html, {
      titleIcon: 'crosshairs', size: 'md', footer: false
    });

    $(document).off('click.cpv2-picker').on('click.cpv2-picker', '.cp-picker-item', function() {
      var campaignId = $(this).data('pick-id');
      if (!campaignId) return;
      closeModal();
      openMetaAdSetModalWithPersona(campaignId, personaId);
    });
  }

  function openAdSetBriefAttachPicker(type, libraryEntityId) {
    var allSets = getAllAdSets();
    var typeLabel = type === 'visual_format' ? 'Format' : (type.charAt(0).toUpperCase() + type.slice(1));
    var fieldKey = type === 'visual_format' ? 'format_ids' : (type + '_ids');

    if (allSets.length === 0) {
      toast('No Ad Sets to attach to. Create a Campaign + Ad Set first.', 'info');
      navigate('meta_campaigns');
      return;
    }

    // Get the library entity for the title
    var libEntity = null;
    if (type === 'message') libEntity = getMessage(libraryEntityId);
    else if (type === 'style') libEntity = getStyle(libraryEntityId);
    else if (type === 'visual_format') libEntity = getFormat(libraryEntityId);
    var libName = libEntity ? (libEntity.title || libEntity.name) : 'this item';

    var html = '<div class="cp-editor-form">';
    html += '<p>Attach ' + esc(typeLabel) + ' "<strong>' + esc(libName) + '</strong>" to one or more Ad Set briefs:</p>';
    html += '<div class="cp-picker-list" style="max-height:60vh;overflow-y:auto">';
    for (var i = 0; i < allSets.length; i++) {
      var s = allSets[i];
      var c = S.campaignV2Map[s.campaign_id];
      var already = (s.brief && (s.brief[fieldKey] || []).indexOf(libraryEntityId) > -1);
      html += '<label class="cp-picker-item' + (already ? ' cp-picker-item-active' : '') + '">';
      html += '<input type="checkbox" class="cp-v2-attach-target" data-set-id="' + esc(s.id) + '"' + (already ? ' checked' : '') + ' style="margin-right:8px">';
      html += '<div style="flex:1">';
      html += '<div class="cp-picker-item-title">' + icon('crosshairs') + ' ' + esc(s.name) + '</div>';
      html += '<div class="cp-picker-item-meta">' + (c ? esc(c.name) : 'No campaign') + '</div>';
      html += '</div></label>';
    }
    html += '</div></div>';

    openModal('Attach to Ad Set brief', html, {
      titleIcon: 'plus', size: 'md',
      saveLabel: 'Apply',
      onSave: function() {
        var targetIds = [];
        $('.cp-v2-attach-target:checked').each(function() { targetIds.push($(this).data('set-id')); });
        snapshot('Attach ' + typeLabel + ' to Ad Set briefs');
        var added = 0, removed = 0;
        // Apply: for each Ad Set, ensure libraryEntityId is in field iff selected
        allSets.forEach(function(s) {
          var isSelected = targetIds.indexOf(s.id) > -1;
          s.brief = s.brief || {};
          var arr = s.brief[fieldKey] || [];
          var hasIt = arr.indexOf(libraryEntityId) > -1;
          if (isSelected && !hasIt)  { arr.push(libraryEntityId); s.brief[fieldKey] = arr; s.updated = new Date().toISOString(); added++; }
          if (!isSelected && hasIt)  { arr = arr.filter(function(id) { return id !== libraryEntityId; }); s.brief[fieldKey] = arr; s.updated = new Date().toISOString(); removed++; }
        });
        buildMaps(); syncToTextarea(); render();
        if (added || removed) toast('Updated ' + (added + removed) + ' Ad Set' + ((added + removed) !== 1 ? 's' : ''), 'success');
        closeModal();
      }
    });
  }
