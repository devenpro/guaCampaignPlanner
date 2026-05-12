  // ============================================================
  // SECTION 5: MAP BUILDERS
  // ============================================================

  function buildMaps() {
    var i, item;

    // --- Persona categories ---
    S.categoryMap = {};
    S.categoryPersonaCounts = {};
    var cats = S.data.persona_categories || [];
    for (i = 0; i < cats.length; i++) {
      S.categoryMap[cats[i].id] = cats[i];
      S.categoryPersonaCounts[cats[i].id] = 0;
    }

    // --- Personas ---
    S.personaMap = {};
    S.personaRecipeCounts = {};
    S.totalPersonas = 0;
    var personas = S.data.personas || [];
    for (i = 0; i < personas.length; i++) {
      item = personas[i];
      S.personaMap[item.id] = item;
      S.personaRecipeCounts[item.id] = 0;
      S.totalPersonas++;
      if (item.category_id && S.categoryPersonaCounts[item.category_id] !== undefined) {
        S.categoryPersonaCounts[item.category_id]++;
      }
    }

    // --- Pain points ---
    S.painPointMap = {};
    var pps = S.data.pain_points || [];
    for (i = 0; i < pps.length; i++) S.painPointMap[pps[i].id] = pps[i];

    // --- Messages ---
    S.messageMap = {};
    S.messageRecipeCounts = {};
    S.totalMessages = 0;
    var msgs = S.data.messages || [];
    for (i = 0; i < msgs.length; i++) {
      S.messageMap[msgs[i].id] = msgs[i];
      S.messageRecipeCounts[msgs[i].id] = 0;
      S.totalMessages++;
    }

    // --- Styles ---
    S.styleMap = {};
    S.styleRecipeCounts = {};
    S.totalStyles = 0;
    var stys = S.data.styles || [];
    for (i = 0; i < stys.length; i++) {
      S.styleMap[stys[i].id] = stys[i];
      S.styleRecipeCounts[stys[i].id] = 0;
      S.totalStyles++;
    }

    // --- Visual formats ---
    S.formatMap = {};
    S.formatRecipeCounts = {};
    S.totalFormats = 0;
    var fmts = S.data.visual_formats || [];
    for (i = 0; i < fmts.length; i++) {
      S.formatMap[fmts[i].id] = fmts[i];
      S.formatRecipeCounts[fmts[i].id] = 0;
      S.totalFormats++;
    }

    // --- Funnel stage map ---
    S.funnelStageMap = {};
    S.funnelCounts = {};
    var funnels = (S.meta.settings && S.meta.settings.funnel_stages) || [];
    for (i = 0; i < funnels.length; i++) {
      S.funnelStageMap[funnels[i].id] = funnels[i];
      S.funnelCounts[funnels[i].id] = 0;
    }

    // --- Tags ---
    S.tagMap = {};
    S.tagIndex = {};
    var tags = S.data.tags || [];
    for (i = 0; i < tags.length; i++) S.tagMap[tags[i].id] = tags[i];

    // --- Campaigns ---
    S.campaignMap = {};
    S.campaignStatusCounts = {};
    S.totalCampaigns = 0; S.activeCampaigns = 0;
    for (var csk in CAMPAIGN_STATUSES) S.campaignStatusCounts[csk] = 0;
    var camps = S.data.campaigns || [];
    for (i = 0; i < camps.length; i++) {
      item = camps[i];
      S.campaignMap[item.id] = item;
      S.campaignStatusCounts[item.status] = (S.campaignStatusCounts[item.status] || 0) + 1;
      S.totalCampaigns++;
      if (item.status === 'active' || item.status === 'planning') S.activeCampaigns++;
    }

    // --- Research sessions ---
    S.researchMap = {};
    var sessions = S.data.research_sessions || [];
    for (i = 0; i < sessions.length; i++) S.researchMap[sessions[i].id] = sessions[i];

    // --- Recipes (the big one — updates many cross-counts) ---
    S.recipeMap = {};
    S.recipeStatusCounts = {};
    S.totalRecipes = 0; S.activeRecipes = 0;
    for (var rsk in RECIPE_STATUSES) S.recipeStatusCounts[rsk] = 0;

    var recipes = S.data.recipes || [];
    for (i = 0; i < recipes.length; i++) {
      item = recipes[i];
      S.recipeMap[item.id] = item;
      S.recipeStatusCounts[item.status] = (S.recipeStatusCounts[item.status] || 0) + 1;
      S.totalRecipes++;
      if (ACTIVE_STATUSES.indexOf(item.status) > -1) S.activeRecipes++;

      // Cross-counts
      if (item.persona_id && S.personaRecipeCounts[item.persona_id] !== undefined) S.personaRecipeCounts[item.persona_id]++;
      if (item.message_id && S.messageRecipeCounts[item.message_id] !== undefined) S.messageRecipeCounts[item.message_id]++;
      if (item.style_id && S.styleRecipeCounts[item.style_id] !== undefined) S.styleRecipeCounts[item.style_id]++;
      if (item.visual_format_id && S.formatRecipeCounts[item.visual_format_id] !== undefined) S.formatRecipeCounts[item.visual_format_id]++;

      // Funnel count (via message's funnel stages)
      var msg = S.messageMap[item.message_id];
      if (msg && msg.funnel_stages) {
        for (var fi = 0; fi < msg.funnel_stages.length; fi++) {
          var fsId = msg.funnel_stages[fi];
          if (S.funnelCounts[fsId] !== undefined) S.funnelCounts[fsId]++;
        }
      }

      // Tag index
      var rTags = item.tags || [];
      for (var rti = 0; rti < rTags.length; rti++) {
        S.tagIndex[rTags[rti]] = S.tagIndex[rTags[rti]] || [];
        S.tagIndex[rTags[rti]].push(item.id);
      }
    }

    // Image category map
    S.imageCategoryMap = {};
    var imgCats = (S.meta && S.meta.image_categories) || [];
    for (i = 0; i < imgCats.length; i++) S.imageCategoryMap[imgCats[i].id] = imgCats[i];

    // --- Meta v2 hierarchy maps ---

    S.campaignV2Map = {};
    S.campaignV2StatusCounts = {};
    S.totalCampaignsV2 = 0; S.activeCampaignsV2 = 0;
    for (var cv2k in META_CAMPAIGN_STATUSES) S.campaignV2StatusCounts[cv2k] = 0;
    var campsV2 = S.data.campaigns_v2 || [];
    for (i = 0; i < campsV2.length; i++) {
      item = campsV2[i];
      S.campaignV2Map[item.id] = item;
      S.campaignV2StatusCounts[item.status] = (S.campaignV2StatusCounts[item.status] || 0) + 1;
      S.totalCampaignsV2++;
      if (item.status === 'ACTIVE' || item.status === 'DRAFT') S.activeCampaignsV2++;
    }

    S.adSetMap = {};
    S.adSetsByCampaign = {};
    S.adSetStatusCounts = {};
    S.totalAdSets = 0;
    for (var asKey in META_AD_SET_STATUSES) S.adSetStatusCounts[asKey] = 0;
    var adSets = S.data.ad_sets || [];
    for (i = 0; i < adSets.length; i++) {
      item = adSets[i];
      S.adSetMap[item.id] = item;
      S.totalAdSets++;
      S.adSetStatusCounts[item.status] = (S.adSetStatusCounts[item.status] || 0) + 1;
      if (item.campaign_id) {
        S.adSetsByCampaign[item.campaign_id] = S.adSetsByCampaign[item.campaign_id] || [];
        S.adSetsByCampaign[item.campaign_id].push(item);
      }
    }

    S.adMap = {};
    S.adsByAdSet = {};
    S.adStatusCounts = {};
    S.totalAds = 0; S.activeAds = 0;
    for (var aKey in META_AD_STATUSES) S.adStatusCounts[aKey] = 0;
    var ads = S.data.ads || [];
    for (i = 0; i < ads.length; i++) {
      item = ads[i];
      S.adMap[item.id] = item;
      S.totalAds++;
      S.adStatusCounts[item.pipeline_status] = (S.adStatusCounts[item.pipeline_status] || 0) + 1;
      if (META_AD_ACTIVE_STATUSES.indexOf(item.pipeline_status) > -1) S.activeAds++;
      if (item.ad_set_id) {
        S.adsByAdSet[item.ad_set_id] = S.adsByAdSet[item.ad_set_id] || [];
        S.adsByAdSet[item.ad_set_id].push(item);
      }
    }
  }

