  // ============================================================
  // SECTION 23: LIBRARY ↔ WORKSPACE INTEGRATION (v2)
  // ============================================================
  //
  // Reverse-lookup helpers + "Used in workspace" widget injected into
  // library entity detail panes. Only renders when meta_v2 is enabled.

  // --- Reverse-lookup helpers ---

  function findAdSetsUsingPersona(personaId) {
    if (!personaId) return [];
    return (S.data.ad_sets || []).filter(function(s) { return s.persona_id === personaId; });
  }
  function findAdSetsUsingMessage(messageId) {
    if (!messageId) return [];
    return (S.data.ad_sets || []).filter(function(s) {
      return s.brief && (s.brief.message_ids || []).indexOf(messageId) > -1;
    });
  }
  function findAdSetsUsingStyle(styleId) {
    if (!styleId) return [];
    return (S.data.ad_sets || []).filter(function(s) {
      return s.brief && (s.brief.style_ids || []).indexOf(styleId) > -1;
    });
  }
  function findAdSetsUsingFormat(formatId) {
    if (!formatId) return [];
    return (S.data.ad_sets || []).filter(function(s) {
      return s.brief && (s.brief.format_ids || []).indexOf(formatId) > -1;
    });
  }
  function findAdsUsingMessage(messageId) {
    if (!messageId) return [];
    return (S.data.ads || []).filter(function(a) {
      return (a.hook && a.hook.source_message_id === messageId) ||
             (a.message_snapshot && a.message_snapshot.source_id === messageId);
    });
  }
  function findAdSetsUsingPainPoint(painPointId) {
    if (!painPointId) return [];
    // Pain points are attached to personas via persona.pain_point_ids.
    // Forward to the persona-level lookup for each persona that has this pain.
    var personasUsingPain = (S.data.personas || []).filter(function(p) {
      return (p.pain_point_ids || []).indexOf(painPointId) > -1;
    });
    var sets = [];
    personasUsingPain.forEach(function(p) {
      findAdSetsUsingPersona(p.id).forEach(function(s) {
        if (sets.indexOf(s) === -1) sets.push(s);
      });
    });
    return sets;
  }

  // --- "Used in workspace" widget ---
  //
  // Returns an HTML block to inject at the bottom of a library entity
  // detail pane. Empty string if meta_v2 is off (no clutter for legacy
  // users). Shows: count of Ad Sets / Ads using this entity, list with
  // links into the workspace, and a "Use in new Ad Set" / "Pull into
  // an Ad" action depending on entity type.
  function renderLibraryWorkspaceUsage(type, entityId) {
    if (!isMetaV2Enabled()) return '';
    if (!entityId) return '';

    var html = '<div class="cp-card cp-library-workspace-usage">';
    html += '<div class="cp-section-header"><h3>' + icon('sitemap') + ' Used in workspace</h3>';

    // Type-specific CTA in the header
    if (type === 'persona') {
      html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="lib-create-ad-set-from-persona" data-id="' + esc(entityId) + '">' + icon('plus') + ' Create Ad Set</button>';
    } else if (type === 'message' || type === 'style' || type === 'visual_format') {
      html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="lib-attach-to-ad-set-brief" data-type="' + type + '" data-id="' + esc(entityId) + '">' + icon('plus') + ' Attach to Ad Set brief</button>';
    }
    html += '</div>';

    var sets = [];
    var ads = [];
    switch (type) {
      case 'persona':       sets = findAdSetsUsingPersona(entityId); break;
      case 'message':       sets = findAdSetsUsingMessage(entityId); ads = findAdsUsingMessage(entityId); break;
      case 'style':         sets = findAdSetsUsingStyle(entityId); break;
      case 'visual_format': sets = findAdSetsUsingFormat(entityId); break;
      case 'pain_point':    sets = findAdSetsUsingPainPoint(entityId); break;
    }

    if (sets.length === 0 && ads.length === 0) {
      html += '<p class="cp-text-muted">Not used in any Ad Set or Ad yet.</p>';
    } else {
      if (sets.length > 0) {
        html += '<div class="cp-library-usage-subhead">' + icon('crosshairs') + ' ' + sets.length + ' Ad Set' + (sets.length !== 1 ? 's' : '') + '</div>';
        html += '<div class="cp-library-usage-list">';
        for (var i = 0; i < sets.length; i++) {
          var s = sets[i];
          var camp = S.campaignV2Map[s.campaign_id];
          html += '<a class="cp-library-usage-item" data-action="lib-open-ad-set" data-id="' + esc(s.id) + '" data-campaign-id="' + esc(s.campaign_id) + '">';
          html += '<span class="cp-library-usage-icon">' + icon('crosshairs') + '</span>';
          html += '<span class="cp-library-usage-text">' + esc(s.name) + (camp ? '<span class="cp-text-muted"> · ' + esc(camp.name) + '</span>' : '') + '</span>';
          html += '<span class="cp-library-usage-arrow">' + icon('arrow-right') + '</span>';
          html += '</a>';
        }
        html += '</div>';
      }
      if (ads.length > 0) {
        html += '<div class="cp-library-usage-subhead">' + icon('rectangle-ad') + ' ' + ads.length + ' Ad' + (ads.length !== 1 ? 's' : '') + '</div>';
        html += '<div class="cp-library-usage-list">';
        for (var j = 0; j < ads.length; j++) {
          var a = ads[j];
          var adSet = S.adSetMap[a.ad_set_id];
          html += '<a class="cp-library-usage-item" data-action="lib-open-ad" data-id="' + esc(a.id) + '">';
          html += '<span class="cp-library-usage-icon">' + icon('rectangle-ad') + '</span>';
          html += '<span class="cp-library-usage-text">' + esc(a.name) + (adSet ? '<span class="cp-text-muted"> · ' + esc(adSet.name) + '</span>' : '') + '</span>';
          html += '<span class="cp-library-usage-arrow">' + icon('arrow-right') + '</span>';
          html += '</a>';
        }
        html += '</div>';
      }
    }

    html += '</div>';
    return html;
  }
