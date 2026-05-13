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
    S.totalPersonas = 0;
    var personas = S.data.personas || [];
    for (i = 0; i < personas.length; i++) {
      item = personas[i];
      S.personaMap[item.id] = item;
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
    S.totalMessages = 0;
    var msgs = S.data.messages || [];
    for (i = 0; i < msgs.length; i++) {
      S.messageMap[msgs[i].id] = msgs[i];
      S.totalMessages++;
    }

    // --- Styles ---
    S.styleMap = {};
    S.totalStyles = 0;
    var stys = S.data.styles || [];
    for (i = 0; i < stys.length; i++) {
      S.styleMap[stys[i].id] = stys[i];
      S.totalStyles++;
    }

    // --- Visual formats ---
    S.formatMap = {};
    S.totalFormats = 0;
    var fmts = S.data.visual_formats || [];
    for (i = 0; i < fmts.length; i++) {
      S.formatMap[fmts[i].id] = fmts[i];
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

    // --- Research sessions ---
    S.researchMap = {};
    var sessions = S.data.research_sessions || [];
    for (i = 0; i < sessions.length; i++) S.researchMap[sessions[i].id] = sessions[i];

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

