  // ============================================================
  // SECTION 9B: META AD SET CRUD
  // ============================================================
  //
  // Modal for creating/editing an Ad Set under a Campaign. Audience model
  // for v1 = Persona link + audience_overrides notes. When a persona is
  // attached, a snapshot is frozen so library edits don't silently change
  // the campaign plan (Stage 3 surfaces divergence + re-sync UI).

  function openMetaAdSetModal(adSetIdOrCampId, opts) {
    opts = opts || {};
    var C = Constants;
    // Two call shapes:
    //   openMetaAdSetModal('adset_xxx')                  -> edit existing
    //   openMetaAdSetModal('cmpv2_xxx', { create: true }) -> create under campaign
    var isEdit = !opts.create;
    var adSet = isEdit ? getAdSet(adSetIdOrCampId) : null;
    var campaignId = isEdit ? (adSet && adSet.campaign_id) : adSetIdOrCampId;
    var camp = getCampaignV2(campaignId);

    if (!camp) { toast('Parent campaign not found', 'error'); return; }

    var s = adSet || {};
    var brief = s.brief || {};
    var placements = s.placements || { advantage_enabled: true, custom_placements: [] };
    var personas = getAllPersonas();

    var html = '<div class="cp-editor-form">';

    // Context banner
    html += '<div class="cp-modal-context">' + icon('bullhorn') + ' Under campaign: <strong>' + esc(camp.name || 'Untitled') + '</strong></div>';

    // --- Section: Basics ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('clipboard-list') + ' Basics</div>';
    html += '<div class="cp-form-row"><div class="cp-form-grow">';
    html += '<label>Ad Set Name <span class="cp-required">*</span></label>';
    html += '<input type="text" class="cp-input" data-field="name" value="' + esc(s.name || '') + '" placeholder="e.g., SaaS Marketers — Lookalike">';
    html += '</div><div class="cp-form-third"><label>Status</label>';
    html += '<select class="cp-select" data-field="status">';
    for (var stk in C.META_AD_SET_STATUSES) {
      var stSel = (s.status === stk) || (!isEdit && stk === 'DRAFT') ? ' selected' : '';
      html += '<option value="' + stk + '"' + stSel + '>' + esc(C.META_AD_SET_STATUSES[stk].label) + '</option>';
    }
    html += '</select></div></div></div>';

    // --- Section: Audience ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('users') + ' Audience</div>';
    html += '<div class="cp-form-group"><label>Persona <span class="cp-required">*</span></label>';
    html += '<select class="cp-select" data-field="persona_id">';
    html += '<option value="">— Select a persona —</option>';
    for (var pi = 0; pi < personas.length; pi++) {
      var p = personas[pi];
      var pSel = (s.persona_id === p.id) ? ' selected' : '';
      html += '<option value="' + esc(p.id) + '"' + pSel + '>' + esc(p.name || 'Untitled') + '</option>';
    }
    html += '</select>';
    html += '<div class="cp-form-help">Personas live in your library. A snapshot is frozen on attach so library edits don\'t silently change this plan.</div>';
    html += '</div>';

    html += '<div class="cp-form-group"><label>Audience overrides / targeting notes</label>';
    html += '<textarea class="cp-textarea" data-field="audience_overrides" rows="2" placeholder="e.g., Exclude existing customers; add Mumbai+Bangalore only; min income ₹15L">' + esc(s.audience_overrides || '') + '</textarea>';
    html += '<div class="cp-form-help">Free text for v1. Detailed Meta targeting (interests, behaviors, custom audiences, lookalikes) lands in a later phase.</div>';
    html += '</div></div>';

    // --- Section: Placements ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('object-group') + ' Placements</div>';
    html += '<label class="cp-form-toggle">';
    html += '<input type="checkbox" class="cp-v2-placements-advantage"' + (placements.advantage_enabled !== false ? ' checked' : '') + '>';
    html += '<span>' + icon('sparkles') + ' Use <strong>Advantage Placements</strong> (Meta picks the best mix)</span>';
    html += '</label>';

    html += '<div class="cp-v2-custom-placements" style="' + (placements.advantage_enabled !== false ? 'display:none;' : '') + 'margin-top:var(--cp-space-2)">';
    html += '<div class="cp-form-help">Choose specific placements:</div>';
    html += '<div class="cp-chip-grid">';
    var customSel = placements.custom_placements || [];
    for (var pk in C.META_PLACEMENTS) {
      var pl = C.META_PLACEMENTS[pk];
      var isPSel = customSel.indexOf(pk) > -1;
      html += '<label class="cp-chip' + (isPSel ? ' cp-chip-active' : '') + '">';
      html += '<input type="checkbox" class="cp-v2-placement" data-key="' + pk + '"' + (isPSel ? ' checked' : '') + ' style="display:none">';
      html += esc(pl.label) + '</label>';
    }
    html += '</div></div></div>';

    // --- Section: Optimization & Delivery ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('bullseye-arrow') + ' Optimization & delivery</div>';

    var allowed = metaOptimizationGoalsForObjective(camp.objective);
    if (allowed.length === 0) {
      // Fallback: show all
      for (var ogk in C.META_OPTIMIZATION_GOALS) allowed.push(C.META_OPTIMIZATION_GOALS[ogk]);
    }

    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Optimization goal</label>';
    html += '<select class="cp-select" data-field="optimization_goal">';
    for (var ogi = 0; ogi < allowed.length; ogi++) {
      var og = allowed[ogi];
      var ogSel = (s.optimization_goal === og.key) ? ' selected' :
                  (!isEdit && og.key === C.META_AD_SET_DEFAULTS.optimization_goal) ? ' selected' : '';
      html += '<option value="' + og.key + '"' + ogSel + '>' + esc(og.label) + '</option>';
    }
    html += '</select>';
    html += '<div class="cp-form-help">Filtered to goals valid under <strong>' + esc((C.META_OBJECTIVES[camp.objective] || {}).label || camp.objective) + '</strong>.</div>';
    html += '</div><div class="cp-form-half"><label>Billing event</label>';
    html += '<select class="cp-select" data-field="billing_event">';
    for (var bek in C.META_BILLING_EVENTS) {
      var beSel = (s.billing_event === bek) ? ' selected' :
                  (!isEdit && bek === C.META_AD_SET_DEFAULTS.billing_event) ? ' selected' : '';
      html += '<option value="' + bek + '"' + beSel + '>' + esc(C.META_BILLING_EVENTS[bek].label) + '</option>';
    }
    html += '</select></div></div>';

    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Attribution setting</label>';
    html += '<select class="cp-select" data-field="attribution_setting">';
    for (var ask in C.META_ATTRIBUTION_SETTINGS) {
      var asSel = (s.attribution_setting === ask) ? ' selected' :
                  (!isEdit && ask === C.META_AD_SET_DEFAULTS.attribution_setting) ? ' selected' : '';
      html += '<option value="' + ask + '"' + asSel + '>' + esc(C.META_ATTRIBUTION_SETTINGS[ask].label) + '</option>';
    }
    html += '</select></div><div class="cp-form-half"><label>Bid amount</label>';
    html += '<input type="number" class="cp-input" data-field="bid_amount" min="0" step="0.01" value="' + esc((s.bid_amount != null) ? s.bid_amount : '') + '" placeholder="Auto (leave blank)">';
    html += '<div class="cp-form-help">Used by Bid Cap / Cost Cap strategies. Optional otherwise.</div>';
    html += '</div></div></div>';

    // --- Section: Budget (ABO only — but always show, hint about CBO) ---
    var isABO = camp.budget_mode === 'ABO';
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('dollar-sign') + ' Budget';
    if (!isABO) html += '<span class="cp-text-muted" style="font-weight:400;font-size:11px;margin-left:8px">(Campaign is CBO — budget lives on the campaign)</span>';
    html += '</div>';
    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Daily budget</label>';
    html += '<input type="number" class="cp-input" data-field="daily_budget" min="0" step="1" value="' + esc((s.daily_budget != null) ? s.daily_budget : '') + '" placeholder="0"' + (isABO ? '' : ' disabled') + '>';
    html += '</div><div class="cp-form-half"><label>Lifetime budget</label>';
    html += '<input type="number" class="cp-input" data-field="lifetime_budget" min="0" step="1" value="' + esc((s.lifetime_budget != null) ? s.lifetime_budget : '') + '" placeholder="0"' + (isABO ? '' : ' disabled') + '>';
    html += '</div></div></div>';

    // --- Section: Schedule ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('calendar') + ' Schedule</div>';
    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Start time</label>';
    html += '<input type="datetime-local" class="cp-input" data-field="start_time" value="' + esc(isoToDatetimeLocal(s.start_time)) + '">';
    html += '</div><div class="cp-form-half"><label>Stop time</label>';
    html += '<input type="datetime-local" class="cp-input" data-field="stop_time" value="' + esc(isoToDatetimeLocal(s.stop_time)) + '">';
    html += '</div></div>';
    html += '<div class="cp-form-hint">Leave blank to inherit from campaign.</div>';
    html += '</div>';

    // --- Section: Notes ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('note-sticky') + ' Notes</div>';
    html += '<textarea class="cp-textarea" data-field="notes" rows="2" placeholder="Internal notes...">' + esc(s.notes || '') + '</textarea>';
    html += '</div>';

    html += '</div>';

    openModal(isEdit ? 'Edit Ad Set' : 'New Ad Set', html, {
      titleIcon: 'crosshairs',
      size: 'lg',
      saveLabel: isEdit ? 'Save Ad Set' : 'Create Ad Set',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.name || !fields.name.trim()) { toast('Ad Set name is required', 'warning'); return; }
        if (!fields.persona_id) { toast('Pick a persona for this Ad Set', 'warning'); return; }

        var advAdv = $('.cp-v2-placements-advantage').is(':checked');
        var customP = [];
        $('.cp-v2-placement:checked').each(function() { customP.push($(this).data('key')); });

        // Build persona snapshot
        var persona = getPersona(fields.persona_id);
        var newSnap = persona ? buildPersonaSnapshot(persona) : null;

        var payload = {
          campaign_id: campaignId,
          name: fields.name.trim(),
          persona_id: fields.persona_id || '',
          // Keep existing snapshot unless persona changed
          persona_snapshot: (isEdit && s.persona_id === fields.persona_id) ? (s.persona_snapshot || newSnap) : newSnap,
          audience_overrides: fields.audience_overrides || '',
          placements: { advantage_enabled: advAdv, custom_placements: customP },
          optimization_goal: fields.optimization_goal || Constants.META_AD_SET_DEFAULTS.optimization_goal,
          billing_event: fields.billing_event || 'IMPRESSIONS',
          attribution_setting: fields.attribution_setting || '7d_click',
          bid_amount: fields.bid_amount !== '' ? Number(fields.bid_amount) : null,
          daily_budget: fields.daily_budget !== '' ? Number(fields.daily_budget) : null,
          lifetime_budget: fields.lifetime_budget !== '' ? Number(fields.lifetime_budget) : null,
          start_time: datetimeLocalToIso(fields.start_time),
          stop_time: datetimeLocalToIso(fields.stop_time),
          status: fields.status || 'DRAFT',
          notes: fields.notes || ''
        };

        if (isEdit) {
          snapshot('Edit Ad Set');
          for (var k in payload) saveEntityField('ad_set', adSetIdOrCampId, k, payload[k]);
          toast('Ad Set saved', 'success');
        } else {
          snapshot('Create Ad Set');
          var created = createEntity('ad_set', payload);
          if (created) {
            S.selectedCampaignV2Id = campaignId;
            S.selectedAdSetId = created.id;
            S.selectedAdId = null;
            navigate('campaign_workspace', { hash: 'campaign/' + campaignId + '/ad_set/' + created.id });
          }
        }
        closeModal();
      }
    });
  }

  // Build a snapshot of a Persona at the moment it's attached to an Ad Set.
  // Stores only fields useful for audience reasoning. captured_at lets us
  // detect divergence later (Stage 3) without diffing the entire object.
  function buildPersonaSnapshot(persona) {
    if (!persona) return null;
    return {
      captured_at: new Date().toISOString(),
      source_id: persona.id,
      source_updated: persona.updated || persona.created || '',
      name: persona.name || '',
      description: persona.description || '',
      demographics: deepClone(persona.demographics || {}),
      psychographics: deepClone(persona.psychographics || {}),
      pain_point_ids: (persona.pain_point_ids || []).slice()
    };
  }

  function confirmDeleteMetaAdSet(adSetId) {
    var s = getAdSet(adSetId);
    if (!s) return;
    var ads = getAdsByAdSet(adSetId).length;
    var msg = 'Delete "' + s.name + '"?';
    if (ads) msg += ' This will also remove ' + ads + ' ad' + (ads !== 1 ? 's' : '') + '.';
    openConfirmDialog({
      title: 'Delete Ad Set',
      message: msg,
      confirmLabel: 'Delete', danger: true,
      onConfirm: function() {
        snapshot('Delete Ad Set');
        var camp = s.campaign_id;
        deleteEntity('ad_set', adSetId);
        if (S.currentView === 'campaign_workspace' && camp) {
          navigate('campaign_workspace', { hash: 'campaign/' + camp });
        }
      }
    });
  }
