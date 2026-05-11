  // ============================================================
  // SECTION 9.4: CAMPAIGN PHASES CRUD
  // ============================================================

  function openCampaignPhasesModal(campId) {
    var camp = getCampaign(campId);
    if (!camp) return;
    var phases = (camp.phases || []).slice();

    function renderPhasesForm() {
      var html = '<div class="cp-editor-form">';
      html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-3)">Define campaign phases (e.g., TOFU Awareness → MOFU Consideration → BOFU Conversion). Each phase can have its own date range.</p>';
      if (phases.length === 0) {
        html += '<div class="cp-empty-state cp-empty-state--compact"><p>No phases yet.</p></div>';
      } else {
        for (var i = 0; i < phases.length; i++) {
          var ph = phases[i];
          html += '<div class="cp-card" style="margin-bottom:var(--cp-space-2);padding:var(--cp-space-3)">';
          html += '<div style="display:flex;align-items:center;gap:var(--cp-space-2);margin-bottom:var(--cp-space-2)">';
          html += '<span class="cp-badge" style="background:var(--cp-primary-subtle);color:var(--cp-primary);font-weight:700">Phase ' + (i + 1) + '</span>';
          html += '<input type="text" class="cp-input cp-phase-field" data-pidx="' + i + '" data-pfield="name" value="' + esc(ph.name || '') + '" placeholder="Phase name..." style="flex:1">';
          html += '<button class="cp-btn-icon cp-btn-xs cp-phase-delete" data-pidx="' + i + '">' + icon('trash') + '</button>';
          html += '</div>';
          html += '<div class="cp-form-row">';
          html += '<div class="cp-form-third"><label class="cp-field-label">Start</label><input type="date" class="cp-input cp-phase-field" data-pidx="' + i + '" data-pfield="date_start" value="' + esc(ph.date_start || '') + '"></div>';
          html += '<div class="cp-form-third"><label class="cp-field-label">End</label><input type="date" class="cp-input cp-phase-field" data-pidx="' + i + '" data-pfield="date_end" value="' + esc(ph.date_end || '') + '"></div>';
          html += '<div class="cp-form-third"><label class="cp-field-label">Focus</label><input type="text" class="cp-input cp-phase-field" data-pidx="' + i + '" data-pfield="funnel_stage" value="' + esc(ph.funnel_stage || '') + '" placeholder="e.g., TOFU"></div>';
          html += '</div></div>';
        }
      }
      html += '<button class="cp-btn cp-btn-outline cp-btn-sm cp-phase-add" style="margin-top:var(--cp-space-2)">' + icon('plus') + ' Add Phase</button>';
      html += '</div>';
      return html;
    }

    openModal('Campaign Phases — ' + camp.name, renderPhasesForm(), {
      titleIcon: 'timeline', size: 'lg',
      saveLabel: 'Save Phases',
      onSave: function() {
        // Collect phase data from fields
        $('.cp-phase-field').each(function() {
          var idx = parseInt($(this).data('pidx'), 10);
          var field = $(this).data('pfield');
          if (phases[idx]) phases[idx][field] = $(this).val() || '';
        });
        snapshot('Update campaign phases');
        saveEntityField('campaign', campId, 'phases', phases);
        closeModal();
        toast('Campaign phases saved', 'success');
      }
    });

    // Live handlers inside modal
    $(document).off('click.cp-phase-add').on('click.cp-phase-add', '.cp-phase-add', function(e) {
      e.preventDefault();
      phases.push({ name: '', date_start: '', date_end: '', funnel_stage: '' });
      $('.cp-modal-body').html(renderPhasesForm());
    });
    $(document).off('click.cp-phase-del').on('click.cp-phase-del', '.cp-phase-delete', function(e) {
      e.preventDefault();
      var idx = parseInt($(this).data('pidx'), 10);
      phases.splice(idx, 1);
      $('.cp-modal-body').html(renderPhasesForm());
    });
  }

