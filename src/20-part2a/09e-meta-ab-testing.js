  // ============================================================
  // SECTION 9E: META v2 — A/B TESTING (Stage 5)
  // ============================================================
  //
  // A/B tests are scoped to a Campaign. The campaign.ab_test object stores
  // { enabled, primary_metric, variants: [{ ad_set_id, role, winner }] }.
  // Each participating Ad Set's ab_role is mirrored on the Ad Set itself
  // (CONTROL / VARIANT_A / VARIANT_B).

  function openABTestConfigModal(campaignId) {
    var camp = getCampaignV2(campaignId);
    if (!camp) return;
    var sets = getAdSetsByCampaign(campaignId);
    if (sets.length < 2) {
      toast('Need at least 2 Ad Sets in this Campaign before setting up an A/B test', 'warning');
      return;
    }

    var ab = camp.ab_test || { enabled: false, primary_metric: '', variants: [] };
    var C = Constants;
    var existingVariants = {};
    (ab.variants || []).forEach(function(v) { existingVariants[v.ad_set_id] = v; });

    var html = '<div class="cp-editor-form">';

    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('flask') + ' A/B test configuration</div>';

    html += '<label class="cp-form-toggle">';
    html += '<input type="checkbox" id="cpV2ABEnable"' + (ab.enabled ? ' checked' : '') + '>';
    html += '<span>Enable A/B test for this campaign</span></label>';

    html += '<div class="cp-form-group" style="margin-top:var(--cp-space-3)"><label>Primary metric</label>';
    html += '<select class="cp-select" id="cpV2ABMetric">';
    html += '<option value="">— Pick a metric —</option>';
    for (var mk in C.META_AB_METRICS) {
      var mSel = (ab.primary_metric === mk) ? ' selected' : '';
      html += '<option value="' + mk + '"' + mSel + '>' + esc(C.META_AB_METRICS[mk].label) + '</option>';
    }
    html += '</select>';
    html += '<div class="cp-form-help">The metric the test will be judged on. You\'ll mark a winner after the test ends.</div>';
    html += '</div></div>';

    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('crosshairs') + ' Assign Ad Sets to variants</div>';
    html += '<div class="cp-form-help" style="margin-bottom:8px">Each Ad Set can be Control, Variant A, Variant B, or excluded from the test.</div>';

    for (var i = 0; i < sets.length; i++) {
      var s = sets[i];
      var currentRole = existingVariants[s.id] ? existingVariants[s.id].role : (s.ab_role || '');
      html += '<div class="cp-v2-ab-row">';
      html += '<div class="cp-v2-ab-row-name">' + icon('crosshairs') + ' ' + esc(s.name) + '</div>';
      html += '<div class="cp-v2-ab-row-roles">';
      var roles = ['', 'CONTROL', 'VARIANT_A', 'VARIANT_B'];
      var roleLabels = ['Exclude', 'Control', 'Variant A', 'Variant B'];
      for (var ri = 0; ri < roles.length; ri++) {
        var r = roles[ri];
        var rSel = (currentRole === r) || (!currentRole && r === '') ? ' cp-v2-ab-role-selected' : '';
        var rColor = r ? (C.META_AB_ROLES[r] || {}).color : '#80868b';
        html += '<label class="cp-v2-ab-role' + rSel + '" style="--ab-color:' + rColor + '">';
        html += '<input type="radio" name="cp-v2-ab-role-' + esc(s.id) + '" data-set-id="' + esc(s.id) + '" value="' + r + '"' + (rSel ? ' checked' : '') + ' style="display:none">';
        html += esc(roleLabels[ri]);
        html += '</label>';
      }
      html += '</div></div>';
    }
    html += '</div>';
    html += '</div>';

    openModal('A/B Test setup', html, {
      titleIcon: 'flask', size: 'lg',
      saveLabel: 'Save A/B test',
      onSave: function() {
        var enabled = $('#cpV2ABEnable').is(':checked');
        var metric = $('#cpV2ABMetric').val();

        // Collect role per Ad Set
        var variants = [];
        var rolesBySet = {};
        sets.forEach(function(s) {
          var role = $('input[name="cp-v2-ab-role-' + s.id + '"]:checked').val() || '';
          rolesBySet[s.id] = role;
          if (role) variants.push({ ad_set_id: s.id, role: role, winner: !!(existingVariants[s.id] && existingVariants[s.id].winner) });
        });

        if (enabled && variants.length < 2) {
          toast('Pick at least 2 Ad Sets (e.g., Control + Variant A)', 'warning'); return;
        }

        snapshot('A/B test setup');
        // Update campaign
        camp.ab_test = { enabled: enabled, primary_metric: metric || '', variants: variants };
        camp.updated = new Date().toISOString();
        // Update per-Ad-Set ab_role to keep tree badges in sync
        sets.forEach(function(s) {
          var newRole = enabled ? (rolesBySet[s.id] || null) : null;
          if (s.ab_role !== newRole) {
            s.ab_role = newRole;
            s.updated = new Date().toISOString();
          }
        });
        buildMaps(); syncToTextarea(); render();
        logActivity('campaign_v2_updated', 'campaign_v2', camp.id, camp.name, enabled ? 'A/B test enabled (' + variants.length + ' variants)' : 'A/B test disabled');
        toast(enabled ? 'A/B test saved' : 'A/B test disabled', 'success');
        closeModal();
      }
    });

    // Role-selector click → set radio checked + visual state
    $(document).off('click.cpv2-ab-role').on('click.cpv2-ab-role', '.cp-v2-ab-role', function() {
      var $radio = $(this).find('input[type="radio"]');
      $radio.prop('checked', true);
      $(this).siblings('.cp-v2-ab-role').removeClass('cp-v2-ab-role-selected');
      $(this).addClass('cp-v2-ab-role-selected');
    });
  }

  // --- Compare Variants modal ---

  function openCompareVariantsModal(campaignId) {
    var camp = getCampaignV2(campaignId);
    if (!camp || !camp.ab_test || !camp.ab_test.enabled) {
      toast('No A/B test set up for this campaign', 'info'); return;
    }
    var variants = camp.ab_test.variants || [];
    if (variants.length === 0) { toast('No variants assigned', 'warning'); return; }
    var C = Constants;
    var metricLabel = (C.META_AB_METRICS[camp.ab_test.primary_metric] || {}).label || '—';

    var html = '<div class="cp-editor-form">';
    html += '<p class="cp-text-muted">Primary metric: <strong>' + esc(metricLabel) + '</strong>. Mark the winner once your test concludes.</p>';

    html += '<div class="cp-v2-ab-compare-grid">';
    for (var i = 0; i < variants.length; i++) {
      var v = variants[i];
      var s = S.adSetMap[v.ad_set_id];
      if (!s) continue;
      var roleInfo = C.META_AB_ROLES[v.role] || { label: v.role, color: '#80868b' };
      var persona = S.personaMap[s.persona_id];
      var ads = getAdsByAdSet(s.id);
      var brief = s.brief || {};
      var goal = (C.META_OPTIMIZATION_GOALS[s.optimization_goal] || {}).label || s.optimization_goal;

      html += '<div class="cp-v2-ab-variant-card' + (v.winner ? ' cp-v2-ab-variant-winner' : '') + '" style="--variant-color:' + roleInfo.color + '">';
      html += '<div class="cp-v2-ab-variant-header">';
      html += '<span class="cp-v2-ab-variant-role">' + icon('flask') + ' ' + esc(roleInfo.label) + '</span>';
      if (v.winner) html += '<span class="cp-v2-ab-variant-winner-badge">' + icon('trophy') + ' Winner</span>';
      html += '</div>';

      html += '<h3>' + icon('crosshairs') + ' ' + esc(s.name) + '</h3>';
      html += '<div class="cp-v2-ab-variant-meta">';
      if (persona) html += '<div>' + icon('user') + ' ' + esc(persona.name) + '</div>';
      if (goal) html += '<div>' + icon('bullseye-arrow') + ' ' + esc(goal) + '</div>';
      html += '<div>' + icon('rectangle-ad') + ' ' + ads.length + ' Ad' + (ads.length !== 1 ? 's' : '') + '</div>';
      html += '</div>';

      if (brief.creative_direction) {
        html += '<div class="cp-v2-ab-variant-section"><div class="cp-v2-ab-variant-section-title">Creative direction</div>';
        html += '<p>' + esc(truncate(brief.creative_direction, 220)) + '</p></div>';
      }
      if ((brief.hook_angles || []).length) {
        html += '<div class="cp-v2-ab-variant-section"><div class="cp-v2-ab-variant-section-title">Hook angles</div>';
        html += '<ul>' + brief.hook_angles.slice(0, 3).map(function(a) { return '<li>' + esc(truncate(a, 80)) + '</li>'; }).join('') + '</ul></div>';
      }

      // Top ads
      if (ads.length) {
        html += '<div class="cp-v2-ab-variant-section"><div class="cp-v2-ab-variant-section-title">Ads</div>';
        for (var ai = 0; ai < Math.min(ads.length, 3); ai++) {
          var ad = ads[ai];
          html += '<div class="cp-v2-ab-variant-ad">';
          html += '<div class="cp-v2-ab-variant-ad-name">' + esc(ad.name) + '</div>';
          if (ad.hook && ad.hook.text) html += '<div class="cp-v2-ab-variant-ad-hook">"' + esc(truncate(ad.hook.text, 80)) + '"</div>';
          html += '</div>';
        }
        if (ads.length > 3) html += '<div class="cp-text-muted" style="font-size:11px">+ ' + (ads.length - 3) + ' more</div>';
        html += '</div>';
      }

      // Mark winner button
      html += '<div class="cp-v2-ab-variant-footer">';
      if (!v.winner) {
        html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="ws-mark-ab-winner" data-campaign-id="' + esc(camp.id) + '" data-set-id="' + esc(s.id) + '">' + icon('trophy') + ' Mark as winner</button>';
      } else {
        html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="ws-clear-ab-winner" data-campaign-id="' + esc(camp.id) + '" data-set-id="' + esc(s.id) + '">' + icon('refresh') + ' Clear winner</button>';
      }
      html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="lib-open-ad-set" data-id="' + esc(s.id) + '" data-campaign-id="' + esc(camp.id) + '">' + icon('arrow-right') + ' Open</button>';
      html += '</div>';

      html += '</div>';
    }
    html += '</div></div>';

    openModal('Compare variants — ' + camp.name, html, {
      titleIcon: 'flask', size: 'xl', footer: false
    });
  }

  // Winner mark/clear
  function setABWinner(campaignId, adSetId, isWinner) {
    var camp = getCampaignV2(campaignId);
    if (!camp || !camp.ab_test) return;
    snapshot(isWinner ? 'Mark A/B winner' : 'Clear A/B winner');
    (camp.ab_test.variants || []).forEach(function(v) {
      v.winner = isWinner && v.ad_set_id === adSetId;
    });
    camp.updated = new Date().toISOString();
    buildMaps(); syncToTextarea(); render();
    var s = S.adSetMap[adSetId];
    logActivity('campaign_v2_updated', 'campaign_v2', camp.id, camp.name, isWinner ? ('Marked "' + (s ? s.name : '') + '" as A/B winner') : 'Cleared A/B winner');
    toast(isWinner ? 'Winner marked' : 'Winner cleared', 'success');
    // Re-open the compare modal with fresh state
    closeModal();
    setTimeout(function() { openCompareVariantsModal(campaignId); }, 100);
  }
