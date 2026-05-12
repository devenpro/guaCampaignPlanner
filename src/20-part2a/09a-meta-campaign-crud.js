  // ============================================================
  // SECTION 9A: META CAMPAIGN (v2) CRUD
  // ============================================================
  //
  // Modal for creating/editing a Meta-shaped Campaign. Storage uses Meta API
  // enum values; UI shows friendly labels via the META_* constants.

  function openMetaCampaignModal(campId) {
    var C = Constants;
    var isEdit = !!campId;
    var c = isEdit ? getCampaignV2(campId) : null;

    var html = '<div class="cp-editor-form">';

    // --- Section: Basics ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('clipboard-list') + ' Basics</div>';
    html += '<div class="cp-form-row"><div class="cp-form-grow">';
    html += '<label>Campaign Name <span class="cp-required">*</span></label>';
    html += '<input type="text" class="cp-input" data-field="name" value="' + esc(c ? c.name : '') + '" placeholder="e.g., Q3 SaaS Lead Generation">';
    html += '</div><div class="cp-form-third"><label>Status</label>';
    html += '<select class="cp-select" data-field="status">';
    for (var sk in C.META_CAMPAIGN_STATUSES) {
      var sSel = (c ? c.status === sk : sk === 'DRAFT') ? ' selected' : '';
      html += '<option value="' + sk + '"' + sSel + '>' + esc(C.META_CAMPAIGN_STATUSES[sk].label) + '</option>';
    }
    html += '</select></div></div>';

    html += '<div class="cp-form-group"><label>Description</label>';
    html += '<textarea class="cp-textarea" data-field="description" rows="2" placeholder="What is this campaign about?">' + esc(c ? c.description || '' : '') + '</textarea></div>';
    html += '</div>';

    // --- Section: Objective & Buying ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('bullseye-arrow') + ' Objective & buying</div>';
    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Objective <span class="cp-required">*</span></label>';
    html += '<select class="cp-select" data-field="objective" id="cpV2CampObjective">';
    for (var ok in C.META_OBJECTIVES) {
      var oSel = (c && c.objective === ok) ? ' selected' :
                 (!c && ok === C.META_CAMPAIGN_DEFAULTS.objective) ? ' selected' : '';
      html += '<option value="' + ok + '"' + oSel + '>' + esc(C.META_OBJECTIVES[ok].label) + '</option>';
    }
    html += '</select>';
    var oCurrent = (c && C.META_OBJECTIVES[c.objective]) || C.META_OBJECTIVES[C.META_CAMPAIGN_DEFAULTS.objective];
    html += '<div class="cp-form-help">' + esc(oCurrent.description) + '</div>';
    html += '</div><div class="cp-form-half"><label>Buying type</label>';
    html += '<select class="cp-select" data-field="buying_type">';
    for (var bk in C.META_BUYING_TYPES) {
      var bSel = (c ? c.buying_type === bk : bk === 'AUCTION') ? ' selected' : '';
      html += '<option value="' + bk + '"' + bSel + '>' + esc(C.META_BUYING_TYPES[bk].label) + '</option>';
    }
    html += '</select></div></div></div>';

    // --- Section: Budget & bidding ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('dollar-sign') + ' Budget & bidding</div>';
    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Budget mode</label>';
    html += '<select class="cp-select" data-field="budget_mode">';
    for (var bmk in C.META_BUDGET_MODES) {
      var bmSel = (c ? c.budget_mode === bmk : bmk === 'CBO') ? ' selected' : '';
      html += '<option value="' + bmk + '"' + bmSel + '>' + esc(C.META_BUDGET_MODES[bmk].label) + ' (' + C.META_BUDGET_MODES[bmk].short + ')</option>';
    }
    html += '</select>';
    html += '<div class="cp-form-help">' + esc(C.META_BUDGET_MODES[c ? c.budget_mode : 'CBO'].description) + '</div>';
    html += '</div><div class="cp-form-half"><label>Bid strategy</label>';
    html += '<select class="cp-select" data-field="bid_strategy">';
    for (var bsk in C.META_BID_STRATEGIES) {
      var bsSel = (c ? c.bid_strategy === bsk : bsk === 'LOWEST_COST_WITHOUT_CAP') ? ' selected' : '';
      html += '<option value="' + bsk + '"' + bsSel + '>' + esc(C.META_BID_STRATEGIES[bsk].label) + '</option>';
    }
    html += '</select></div></div>';

    html += '<div class="cp-form-row"><div class="cp-form-third"><label>Daily budget</label>';
    html += '<input type="number" class="cp-input" data-field="daily_budget" min="0" step="1" value="' + esc((c && c.daily_budget != null) ? c.daily_budget : '') + '" placeholder="0">';
    html += '</div><div class="cp-form-third"><label>Lifetime budget</label>';
    html += '<input type="number" class="cp-input" data-field="lifetime_budget" min="0" step="1" value="' + esc((c && c.lifetime_budget != null) ? c.lifetime_budget : '') + '" placeholder="0">';
    html += '</div><div class="cp-form-third"><label>Spend cap</label>';
    html += '<input type="number" class="cp-input" data-field="spend_cap" min="0" step="1" value="' + esc((c && c.spend_cap != null) ? c.spend_cap : '') + '" placeholder="0">';
    html += '</div></div>';
    html += '<div class="cp-form-hint">' + icon('info') + ' For CBO, set budget here. For ABO, set it on each Ad Set.</div>';
    html += '</div>';

    // --- Section: Schedule ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('calendar') + ' Schedule</div>';
    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Start time</label>';
    html += '<input type="datetime-local" class="cp-input" data-field="start_time" value="' + esc(isoToDatetimeLocal(c ? c.start_time : '')) + '">';
    html += '</div><div class="cp-form-half"><label>Stop time</label>';
    html += '<input type="datetime-local" class="cp-input" data-field="stop_time" value="' + esc(isoToDatetimeLocal(c ? c.stop_time : '')) + '">';
    html += '</div></div>';
    html += '<div class="cp-form-hint">Leave blank for always-on.</div>';
    html += '</div>';

    // --- Section: Special Ad Categories ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('shield') + ' Special ad categories</div>';
    html += '<div class="cp-form-hint" style="margin-bottom:8px">Required by Meta for credit, employment, housing, and social issue ads. Most campaigns: None.</div>';
    html += '<div class="cp-chip-grid">';
    var selCats = (c && c.special_ad_categories) ? c.special_ad_categories : ['NONE'];
    for (var sak in C.META_SPECIAL_AD_CATEGORIES) {
      var sa = C.META_SPECIAL_AD_CATEGORIES[sak];
      var isSel = selCats.indexOf(sak) > -1;
      html += '<label class="cp-chip' + (isSel ? ' cp-chip-active' : '') + '">';
      html += '<input type="checkbox" class="cp-v2-special-cat" data-key="' + sak + '"' + (isSel ? ' checked' : '') + ' style="display:none">';
      html += esc(sa.label) + '</label>';
    }
    html += '</div></div>';

    // --- Section: Brief & AI instructions ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('file-lines') + ' Brief & AI</div>';
    html += '<div class="cp-form-group"><label>Campaign brief</label>';
    html += '<textarea class="cp-textarea" data-field="brief" rows="3" placeholder="Strategic context — target outcome, key messaging, why now...">' + esc(c ? c.brief || '' : '') + '</textarea></div>';
    html += '<div class="cp-form-group"><label>' + icon('sparkles') + ' AI instructions</label>';
    html += '<textarea class="cp-textarea" data-field="ai_instructions" rows="2" placeholder="Special instructions for AI when generating Ad Sets and Ads for this campaign...">' + esc(c ? c.ai_instructions || '' : '') + '</textarea></div>';
    html += '</div>';

    // --- Section: Notes ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('note-sticky') + ' Notes</div>';
    html += '<div class="cp-form-group">';
    html += '<textarea class="cp-textarea" data-field="notes" rows="2" placeholder="Internal notes...">' + esc(c ? c.notes || '' : '') + '</textarea></div>';
    html += '</div>';

    html += '</div>';

    openModal(isEdit ? 'Edit Campaign' : 'New Campaign', html, {
      titleIcon: 'bullhorn',
      size: 'lg',
      saveLabel: isEdit ? 'Save Campaign' : 'Create Campaign',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.name || !fields.name.trim()) { toast('Campaign name is required', 'warning'); return; }

        var cats = [];
        $('.cp-v2-special-cat:checked').each(function() { cats.push($(this).data('key')); });
        if (cats.length === 0) cats = ['NONE'];
        // If NONE is mixed with others, drop NONE
        if (cats.length > 1 && cats.indexOf('NONE') > -1) cats = cats.filter(function(k) { return k !== 'NONE'; });

        var payload = {
          name: fields.name.trim(),
          description: fields.description || '',
          objective: fields.objective || Constants.META_CAMPAIGN_DEFAULTS.objective,
          buying_type: fields.buying_type || 'AUCTION',
          budget_mode: fields.budget_mode || 'CBO',
          daily_budget: fields.daily_budget !== '' ? Number(fields.daily_budget) : null,
          lifetime_budget: fields.lifetime_budget !== '' ? Number(fields.lifetime_budget) : null,
          spend_cap: fields.spend_cap !== '' ? Number(fields.spend_cap) : null,
          bid_strategy: fields.bid_strategy || 'LOWEST_COST_WITHOUT_CAP',
          start_time: datetimeLocalToIso(fields.start_time),
          stop_time: datetimeLocalToIso(fields.stop_time),
          status: fields.status || 'DRAFT',
          special_ad_categories: cats,
          brief: fields.brief || '',
          ai_instructions: fields.ai_instructions || '',
          notes: fields.notes || ''
        };

        if (isEdit) {
          snapshot('Edit Meta campaign');
          for (var k in payload) saveEntityField('campaign_v2', campId, k, payload[k]);
          toast('Campaign saved', 'success');
        } else {
          snapshot('Create Meta campaign');
          var created = createEntity('campaign_v2', payload);
          if (created) {
            S.selectedCampaignV2Id = created.id; S.selectedAdSetId = null; S.selectedAdId = null;
            navigate('campaign_workspace', { hash: 'campaign/' + created.id });
          }
        }
        closeModal();
      }
    });
  }

  function confirmDeleteMetaCampaign(campId) {
    var c = getCampaignV2(campId);
    if (!c) return;
    var sets = getAdSetsByCampaign(campId).length;
    var ads = getAdsByCampaign(campId).length;
    var msg = 'Delete "' + c.name + '"?';
    if (sets || ads) msg += ' This will also remove ' + sets + ' ad set' + (sets !== 1 ? 's' : '') + ' and ' + ads + ' ad' + (ads !== 1 ? 's' : '') + '.';
    openConfirmDialog({
      title: 'Delete Campaign',
      message: msg,
      confirmLabel: 'Delete', danger: true,
      onConfirm: function() {
        snapshot('Delete Meta campaign');
        deleteEntity('campaign_v2', campId);
        if (S.currentView === 'campaign_workspace') navigate('meta_campaigns');
      }
    });
  }

  // ---- Datetime helpers (Meta wants ISO 8601; HTML input wants local) ----

  function isoToDatetimeLocal(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    // YYYY-MM-DDTHH:mm
    var pad = function(n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
           'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function datetimeLocalToIso(localStr) {
    if (!localStr) return '';
    var d = new Date(localStr);
    return isNaN(d.getTime()) ? '' : d.toISOString();
  }
