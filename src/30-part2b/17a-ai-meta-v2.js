  // ============================================================
  // SECTION 17A: AI — META v2 (Campaign Tree + per-level assists)
  // ============================================================
  //
  // Stage 4 of the restructure. All functions follow the existing pattern:
  //   callAIWithRetry(prompt, onSuccess, onError, actionId, systemPrompt, parseJSON)
  // and use BrandService.getSystemPrompt + brandSnippet for brand context.
  //
  // For alternatives-style outputs (hooks, copy variants) we surface them
  // through showAIPreview. For single-result outputs (image prompt, video
  // script) we save directly and toast.

  // --- Small helpers ---

  function aiV2_assertConfigured() {
    if (!LLMService.isConfigured()) {
      toast('No AI providers configured — open Settings → AI', 'warning');
      return false;
    }
    return true;
  }

  function aiV2_campaignContext(camp) {
    if (!camp) return '';
    var obj = (Constants.META_OBJECTIVES[camp.objective] || {}).label || camp.objective || '';
    var lines = ['Campaign: ' + (camp.name || 'Untitled')];
    if (obj) lines.push('Objective: ' + obj);
    if (camp.budget_mode) lines.push('Budget mode: ' + camp.budget_mode);
    if (camp.daily_budget) lines.push('Daily budget: ' + camp.daily_budget);
    if (camp.lifetime_budget) lines.push('Lifetime budget: ' + camp.lifetime_budget);
    if (camp.brief) lines.push('Brief: ' + camp.brief);
    if (camp.ai_instructions) lines.push('Special instructions: ' + camp.ai_instructions);
    return lines.join('\n');
  }

  function aiV2_adSetContext(adSet) {
    if (!adSet) return '';
    var p = S.personaMap[adSet.persona_id];
    var goal = (Constants.META_OPTIMIZATION_GOALS[adSet.optimization_goal] || {}).label || adSet.optimization_goal || '';
    var brief = adSet.brief || {};
    var lines = ['Ad Set: ' + (adSet.name || 'Untitled')];
    if (goal) lines.push('Optimization goal: ' + goal);
    if (p) lines.push('Persona: ' + p.name + (p.description ? ' — ' + truncate(p.description, 120) : ''));
    if (adSet.audience_overrides) lines.push('Audience overrides: ' + adSet.audience_overrides);
    if (brief.creative_direction) lines.push('Creative direction: ' + brief.creative_direction);
    if ((brief.hook_angles || []).length) lines.push('Hook angles: ' + brief.hook_angles.join(' | '));
    if (brief.ai_notes) lines.push('AI notes: ' + brief.ai_notes);
    // Library context
    var msgs = (brief.message_ids || []).map(function(id) { var m = S.messageMap[id]; return m ? m.title + (m.body ? ' — ' + truncate(stripHtml(m.body), 80) : '') : null; }).filter(Boolean);
    if (msgs.length) lines.push('Attached messages: ' + msgs.join(' | '));
    var styles = (brief.style_ids || []).map(function(id) { var s = S.styleMap[id]; return s ? s.name : null; }).filter(Boolean);
    if (styles.length) lines.push('Attached styles: ' + styles.join(', '));
    return lines.join('\n');
  }

  // --- 1. Generate Campaign Tree (flagship: brief → full Campaign/AdSets/Ads) ---

  function aiGenerateCampaignTree() {
    if (!aiV2_assertConfigured()) return;
    openCampaignTreeBriefModal();
  }

  function openCampaignTreeBriefModal() {
    var html = '<div class="cp-editor-form">';
    html += '<p>Describe the campaign you want — what you\'re selling, who you want to reach, what success looks like, any constraints.</p>';
    html += '<textarea class="cp-textarea" id="cpV2TreeBrief" rows="6" placeholder="e.g., Lead-gen campaign for our project management SaaS targeting growth marketers in India. Budget ~₹2L/month. Push the &quot;ship in days, not weeks&quot; angle. Avoid corporate-stock imagery."></textarea>';
    html += '<div class="cp-form-help">AI will draft 1 Campaign, 2-3 Ad Sets, and 2-3 Ads per Ad Set. You can edit before accepting.</div>';
    html += '</div>';

    openModal('Generate Campaign tree from brief', html, {
      titleIcon: 'wand-magic', size: 'md', saveLabel: icon('sparkles') + ' Generate',
      onSave: function() {
        var brief = ($('#cpV2TreeBrief').val() || '').trim();
        if (!brief) { toast('Write a brief first', 'warning'); return; }
        closeModal();
        aiV2_runCampaignTree(brief);
      }
    });
  }

  function aiV2_runCampaignTree(brief) {
    var availablePersonas = (S.data.personas || []).map(function(p) { return { id: p.id, name: p.name, description: truncate(p.description || '', 100) }; });
    var availableMessages = (S.data.messages || []).map(function(m) { return { id: m.id, title: m.title }; });

    var objList = Object.keys(Constants.META_OBJECTIVES).map(function(k) { return k + ' (' + Constants.META_OBJECTIVES[k].label + ')'; }).join(', ');
    var goalList = Object.keys(Constants.META_OPTIMIZATION_GOALS).join(', ');
    var ctaList = Object.keys(Constants.META_CTA_TYPES).slice(0, 12).join(', ');

    var prompt = 'You are a Meta Ads strategist. Generate a complete campaign tree from this brief.\n\n';
    prompt += 'Brief:\n' + brief + '\n\n';

    prompt += 'Available Meta Objectives: ' + objList + '\n';
    prompt += 'Available Optimization Goals: ' + goalList + '\n';
    prompt += 'Available CTAs: ' + ctaList + '\n\n';

    if (availablePersonas.length) {
      prompt += 'Existing Personas in library (use their id if matching):\n';
      prompt += availablePersonas.slice(0, 20).map(function(p) { return '- ' + p.id + ': ' + p.name + (p.description ? ' (' + p.description + ')' : ''); }).join('\n') + '\n\n';
    }

    prompt += brandSnippet('research');

    prompt += '\n\nRules:\n';
    prompt += '- Pick exactly ONE objective for the Campaign.\n';
    prompt += '- Generate 2-3 Ad Sets, each targeting a distinct angle/audience cut.\n';
    prompt += '- For each Ad Set, set persona_id to a matching library persona id if there\'s a strong match; otherwise leave empty.\n';
    prompt += '- Optimization goal must be valid under the chosen Objective.\n';
    prompt += '- Generate 2-3 Ads per Ad Set, each with a distinct hook angle.\n';
    prompt += '- Primary text: 90-140 chars. Headline: ≤27 chars. Description: ≤27 chars.\n';
    prompt += '- Output strict JSON ONLY, no preamble:\n';
    prompt += '{"campaign":{"name":"","description":"","objective":"OUTCOME_...","budget_mode":"CBO|ABO","bid_strategy":"LOWEST_COST_WITHOUT_CAP|...","daily_budget":NUMBER_OR_NULL,"brief":""},';
    prompt += '"ad_sets":[{"name":"","persona_id":"","audience_overrides":"","optimization_goal":"...","billing_event":"IMPRESSIONS","attribution_setting":"7d_click",';
    prompt += '"brief":{"creative_direction":"","hook_angles":["","",""],"ai_notes":""},';
    prompt += '"ads":[{"name":"","creative_type":"single_image|single_video|carousel","hook":{"text":"","type":"question|bold|story|data|direct|curiosity|challenge"},';
    prompt += '"creative":{"primary_text":"","headline":"","description":"","cta_type":"LEARN_MORE","cta_link":""},';
    prompt += '"media":{"image_brief":"","image_prompt":"","video_concept":""}}]}]}';

    toast('AI drafting your Campaign tree (15-30s)...', 'info', 5000);

    callAIWithRetry(prompt, function(parsed) {
      if (!parsed || !parsed.campaign || !Array.isArray(parsed.ad_sets)) {
        toast('AI returned an invalid tree', 'error'); return;
      }
      openCampaignTreePreviewModal(parsed);
    }, function(err) { toast('AI error: ' + err, 'error'); },
       'ai-generate-campaign-tree', BrandService.getSystemPrompt('research'), parseJSON);
  }

  // Preview the proposed tree with checkboxes; accept the user's selection.
  function openCampaignTreePreviewModal(tree) {
    var camp = tree.campaign;
    var sets = tree.ad_sets || [];

    var html = '<div class="cp-tree-preview">';

    // Campaign
    var objLabel = (Constants.META_OBJECTIVES[camp.objective] || {}).label || camp.objective;
    html += '<div class="cp-tree-preview-campaign">';
    html += '<label class="cp-tree-preview-row"><input type="checkbox" class="cp-tp-camp-check" checked>';
    html += '<div><div class="cp-tree-preview-title">' + icon('bullhorn') + ' ' + esc(camp.name || 'Untitled') + '</div>';
    html += '<div class="cp-tree-preview-meta">' + esc(objLabel || '') + ' · ' + esc(camp.budget_mode || '') + (camp.daily_budget ? ' · ' + camp.daily_budget + '/d' : '') + '</div>';
    if (camp.description) html += '<div class="cp-tree-preview-desc">' + esc(camp.description) + '</div>';
    html += '</div></label>';
    html += '</div>';

    // Ad sets + ads
    for (var i = 0; i < sets.length; i++) {
      var s = sets[i];
      var ads = s.ads || [];
      var personaName = s.persona_id ? ((S.personaMap[s.persona_id] || {}).name || 'unknown') : '(no persona)';
      var goalLabel = (Constants.META_OPTIMIZATION_GOALS[s.optimization_goal] || {}).label || s.optimization_goal;
      html += '<div class="cp-tree-preview-ad-set">';
      html += '<label class="cp-tree-preview-row"><input type="checkbox" class="cp-tp-set-check" data-set-idx="' + i + '" checked>';
      html += '<div><div class="cp-tree-preview-title">' + icon('crosshairs') + ' ' + esc(s.name || 'Ad Set ' + (i+1)) + '</div>';
      html += '<div class="cp-tree-preview-meta">' + icon('user') + ' ' + esc(personaName) + ' · ' + esc(goalLabel || '') + '</div>';
      if (s.brief && s.brief.creative_direction) html += '<div class="cp-tree-preview-desc">' + esc(s.brief.creative_direction) + '</div>';
      html += '</div></label>';

      for (var j = 0; j < ads.length; j++) {
        var a = ads[j];
        html += '<label class="cp-tree-preview-row cp-tree-preview-row-ad">';
        html += '<input type="checkbox" class="cp-tp-ad-check" data-set-idx="' + i + '" data-ad-idx="' + j + '" checked>';
        var ctype = (Constants.META_AD_CREATIVE_TYPES[a.creative_type] || { icon: 'rectangle-ad', label: 'Ad' });
        html += '<div><div class="cp-tree-preview-title">' + icon(ctype.icon) + ' ' + esc(a.name || 'Ad ' + (j+1)) + '</div>';
        if (a.hook && a.hook.text) html += '<div class="cp-tree-preview-hook">"' + esc(a.hook.text) + '"</div>';
        if (a.creative && a.creative.primary_text) html += '<div class="cp-tree-preview-desc">' + esc(truncate(a.creative.primary_text, 140)) + '</div>';
        html += '</div></label>';
      }
      html += '</div>';
    }

    html += '</div>';

    openModal('AI Campaign Tree — review & accept', html, {
      titleIcon: 'sparkles', size: 'xl', saveLabel: icon('check') + ' Create selected',
      onSave: function() {
        if (!$('.cp-tp-camp-check').is(':checked')) { toast('Campaign must be selected to create the tree', 'warning'); return; }
        closeModal();
        applyCampaignTree(tree);
      }
    });
  }

  function applyCampaignTree(tree) {
    snapshot('AI Campaign tree');
    var camp = createEntity('campaign_v2', $.extend({}, Constants.META_CAMPAIGN_DEFAULTS, {
      name: tree.campaign.name || 'Untitled',
      description: tree.campaign.description || '',
      objective: tree.campaign.objective || Constants.META_CAMPAIGN_DEFAULTS.objective,
      budget_mode: tree.campaign.budget_mode || 'CBO',
      bid_strategy: tree.campaign.bid_strategy || 'LOWEST_COST_WITHOUT_CAP',
      daily_budget: tree.campaign.daily_budget || null,
      brief: tree.campaign.brief || ''
    }));
    if (!camp) { toast('Failed to create Campaign', 'error'); return; }

    var counts = { sets: 0, ads: 0 };
    // Collect ALL selected indices upfront — createEntity below triggers
    // renderCurrentView, which can detach the checkboxes from the DOM.
    var setSelections = []; // [{ setIdx, adIdxs: [] }]
    $('.cp-tp-set-check:checked').each(function() {
      var setIdx = parseInt(this.getAttribute('data-set-idx'), 10);
      if (isNaN(setIdx)) return;
      var adIdxs = [];
      $('.cp-tp-ad-check[data-set-idx="' + setIdx + '"]:checked').each(function() {
        var ai = parseInt(this.getAttribute('data-ad-idx'), 10);
        if (!isNaN(ai)) adIdxs.push(ai);
      });
      setSelections.push({ setIdx: setIdx, adIdxs: adIdxs });
    });

    setSelections.forEach(function(sel) {
      var idx = sel.setIdx;
      var sData = (tree.ad_sets || [])[idx]; if (!sData) return;

      var persona = sData.persona_id ? getPersona(sData.persona_id) : null;
      var personaSnap = persona ? buildPersonaSnapshot(persona) : null;

      var set = createEntity('ad_set', {
        campaign_id: camp.id,
        name: sData.name || 'Ad Set ' + (idx + 1),
        persona_id: persona ? persona.id : '',
        persona_snapshot: personaSnap,
        audience_overrides: sData.audience_overrides || '',
        optimization_goal: sData.optimization_goal || Constants.META_AD_SET_DEFAULTS.optimization_goal,
        billing_event: sData.billing_event || 'IMPRESSIONS',
        attribution_setting: sData.attribution_setting || '7d_click',
        brief: $.extend({ creative_direction: '', message_ids: [], style_ids: [], format_ids: [], hook_angles: [], ai_notes: '' }, sData.brief || {})
      });
      if (!set) return;
      counts.sets++;

      // Ads under this Ad Set — iterate the captured indices array
      sel.adIdxs.forEach(function(adIdx) {
        var aData = (sData.ads || [])[adIdx]; if (!aData) return;
        var ad = createEntity('ad', {
          ad_set_id: set.id,
          name: aData.name || 'Ad ' + (adIdx + 1),
          creative_type: aData.creative_type || 'single_image',
          hook: { text: (aData.hook && aData.hook.text) || '', type: (aData.hook && aData.hook.type) || 'direct', source_message_id: '', selected_hook_id: '' },
          creative: $.extend({ primary_text: '', headline: '', description: '', cta_type: 'LEARN_MORE', cta_link: '', display_link: '', tracking_params: '' }, aData.creative || {}),
          media: {
            image: { asset_id: '', prompt: (aData.media && (aData.media.image_prompt || aData.media.image_brief)) || '', aspect_ratio: '1:1', reference_image_ids: [] },
            video: { asset_id: '', duration_seconds: 30, aspect_ratio: '9:16', concept: (aData.media && aData.media.video_concept) || '', script: { sections: [] } },
            carousel_cards: []
          }
        });
        if (ad) { counts.ads++; if (typeof maybeAdvanceAdStatus === 'function') maybeAdvanceAdStatus(ad, 'AI tree'); }
      });
    });

    logActivity('campaign_tree_generated', 'campaign_v2', camp.id, camp.name, 'AI tree: ' + counts.sets + ' Ad Set(s), ' + counts.ads + ' Ad(s)');
    toast('Created Campaign + ' + counts.sets + ' Ad Sets + ' + counts.ads + ' Ads', 'success', 5000);

    // Jump to the new campaign in the workspace
    S.selectedCampaignV2Id = camp.id; S.selectedAdSetId = null; S.selectedAdId = null;
    navigate('campaign_workspace', { hash: 'campaign/' + camp.id });
  }

  // --- 2. Suggest Ad Sets for an existing Campaign ---

  function aiSuggestAdSets(campaignId) {
    if (!aiV2_assertConfigured()) return;
    var camp = getCampaignV2(campaignId); if (!camp) return;

    var prompt = 'You are a Meta Ads strategist. Suggest 3 distinct Ad Sets for this Campaign.\n\n';
    prompt += aiV2_campaignContext(camp) + '\n\n';
    var personas = (S.data.personas || []).map(function(p) { return { id: p.id, name: p.name }; });
    if (personas.length) prompt += 'Library personas (use id if matching): ' + personas.map(function(p) { return p.id + '=' + p.name; }).join(', ') + '\n\n';
    prompt += brandSnippet('research');
    prompt += '\n\nRespond JSON only: {"ad_sets":[{"name":"","persona_id":"","audience_overrides":"","optimization_goal":"","brief":{"creative_direction":"","hook_angles":["","",""]}}]}';

    toast('AI suggesting Ad Sets...', 'info');
    callAIWithRetry(prompt, function(parsed) {
      var sets = parsed.ad_sets || [];
      if (sets.length === 0) { toast('AI returned no Ad Sets', 'warning'); return; }
      // Render preview with checkboxes
      var html = '<div class="cp-tree-preview">';
      for (var i = 0; i < sets.length; i++) {
        var s = sets[i];
        var personaName = s.persona_id ? ((S.personaMap[s.persona_id] || {}).name || '?') : '(no persona)';
        var goalLabel = (Constants.META_OPTIMIZATION_GOALS[s.optimization_goal] || {}).label || s.optimization_goal;
        html += '<label class="cp-tree-preview-row"><input type="checkbox" class="cp-tp-set-check" data-set-idx="' + i + '" checked>';
        html += '<div><div class="cp-tree-preview-title">' + icon('crosshairs') + ' ' + esc(s.name) + '</div>';
        html += '<div class="cp-tree-preview-meta">' + icon('user') + ' ' + esc(personaName) + ' · ' + esc(goalLabel || '') + '</div>';
        if (s.brief && s.brief.creative_direction) html += '<div class="cp-tree-preview-desc">' + esc(s.brief.creative_direction) + '</div>';
        html += '</div></label>';
      }
      html += '</div>';

      openModal('AI suggested Ad Sets — review', html, {
        titleIcon: 'sparkles', size: 'lg', saveLabel: icon('plus') + ' Create selected',
        onSave: function() {
          // Snapshot selected indices BEFORE createEntity triggers any re-render
          // (createEntity → renderCurrentView can detach jQuery refs mid-loop).
          var selectedIdx = [];
          $('.cp-tp-set-check:checked').each(function() {
            var i = parseInt(this.getAttribute('data-set-idx'), 10);
            if (!isNaN(i)) selectedIdx.push(i);
          });
          if (selectedIdx.length === 0) { closeModal(); return; }
          closeModal();
          snapshot('AI suggest Ad Sets');
          var created = 0;
          for (var k = 0; k < selectedIdx.length; k++) {
            var sData = sets[selectedIdx[k]]; if (!sData) continue;
            var persona = sData.persona_id ? getPersona(sData.persona_id) : null;
            createEntity('ad_set', {
              campaign_id: campaignId,
              name: sData.name || 'Ad Set',
              persona_id: persona ? persona.id : '',
              persona_snapshot: persona ? buildPersonaSnapshot(persona) : null,
              audience_overrides: sData.audience_overrides || '',
              optimization_goal: sData.optimization_goal || Constants.META_AD_SET_DEFAULTS.optimization_goal,
              brief: $.extend({ creative_direction: '', message_ids: [], style_ids: [], format_ids: [], hook_angles: [], ai_notes: '' }, sData.brief || {})
            });
            created++;
          }
          toast('Created ' + created + ' Ad Set' + (created !== 1 ? 's' : ''), 'success');
        }
      });
    }, function(err) { toast('AI error: ' + err, 'error'); },
       'ai-suggest-ad-sets', BrandService.getSystemPrompt('research'), parseJSON);
  }

  // --- 3. Suggest Ads for an Ad Set ---

  function aiSuggestAds(adSetId) {
    if (!aiV2_assertConfigured()) return;
    var adSet = getAdSet(adSetId); if (!adSet) return;
    var camp = getCampaignV2(adSet.campaign_id);

    var prompt = 'You are a Meta Ads creative director. Generate 3-4 Ads for this Ad Set.\n\n';
    if (camp) prompt += aiV2_campaignContext(camp) + '\n';
    prompt += aiV2_adSetContext(adSet) + '\n\n';
    prompt += brandSnippet('content');
    prompt += '\n\nRules: each Ad has a distinct hook angle. Primary text 90-140 chars, headline ≤27 chars, description ≤27 chars.\n';
    prompt += 'Respond JSON only: {"ads":[{"name":"","creative_type":"single_image","hook":{"text":"","type":"direct"},"creative":{"primary_text":"","headline":"","description":"","cta_type":"LEARN_MORE","cta_link":""}}]}';

    toast('AI suggesting Ads...', 'info');
    callAIWithRetry(prompt, function(parsed) {
      var ads = parsed.ads || [];
      if (ads.length === 0) { toast('AI returned no Ads', 'warning'); return; }
      var html = '<div class="cp-tree-preview">';
      for (var i = 0; i < ads.length; i++) {
        var a = ads[i];
        html += '<label class="cp-tree-preview-row"><input type="checkbox" class="cp-tp-ad-check" data-ad-idx="' + i + '" checked>';
        var ctype = (Constants.META_AD_CREATIVE_TYPES[a.creative_type] || { icon: 'rectangle-ad' });
        html += '<div><div class="cp-tree-preview-title">' + icon(ctype.icon) + ' ' + esc(a.name) + '</div>';
        if (a.hook && a.hook.text) html += '<div class="cp-tree-preview-hook">"' + esc(a.hook.text) + '"</div>';
        if (a.creative && a.creative.primary_text) html += '<div class="cp-tree-preview-desc">' + esc(truncate(a.creative.primary_text, 140)) + '</div>';
        html += '</div></label>';
      }
      html += '</div>';
      openModal('AI suggested Ads — review', html, {
        titleIcon: 'sparkles', size: 'lg', saveLabel: icon('plus') + ' Create selected',
        onSave: function() {
          // Snapshot selected indices BEFORE createEntity triggers any re-render.
          // jQuery refs to checkboxes can be detached mid-loop if the surrounding
          // view re-renders, which made only the first selection actually persist.
          var selectedIdx = [];
          $('.cp-tp-ad-check:checked').each(function() {
            var i = parseInt(this.getAttribute('data-ad-idx'), 10);
            if (!isNaN(i)) selectedIdx.push(i);
          });
          if (selectedIdx.length === 0) { closeModal(); return; }
          closeModal();
          snapshot('AI suggest Ads');
          var created = 0;
          for (var k = 0; k < selectedIdx.length; k++) {
            var aData = ads[selectedIdx[k]]; if (!aData) continue;
            var ad = createEntity('ad', {
              ad_set_id: adSetId,
              name: aData.name || 'Ad',
              creative_type: aData.creative_type || 'single_image',
              hook: $.extend({ text: '', type: 'direct', source_message_id: '', selected_hook_id: '' }, aData.hook || {}),
              creative: $.extend({ primary_text: '', headline: '', description: '', cta_type: 'LEARN_MORE', cta_link: '', display_link: '', tracking_params: '' }, aData.creative || {})
            });
            if (ad) { created++; if (typeof maybeAdvanceAdStatus === 'function') maybeAdvanceAdStatus(ad, 'AI suggested'); }
          }
          toast('Created ' + created + ' Ad' + (created !== 1 ? 's' : ''), 'success');
        }
      });
    }, function(err) { toast('AI error: ' + err, 'error'); },
       'ai-suggest-ads', BrandService.getSystemPrompt('content'), parseJSON);
  }

  // --- 4. Generate Ad Set Brief ---

  function aiGenerateAdSetBrief(adSetId) {
    if (!aiV2_assertConfigured()) return;
    var adSet = getAdSet(adSetId); if (!adSet) return;
    var camp = getCampaignV2(adSet.campaign_id);

    var prompt = 'Generate a strategic Brief for this Ad Set.\n';
    if (camp) prompt += aiV2_campaignContext(camp) + '\n';
    prompt += aiV2_adSetContext(adSet) + '\n\n';
    prompt += brandSnippet('research');
    prompt += '\n\nRespond JSON only: {"creative_direction":"","hook_angles":["","",""],"ai_notes":""}';

    toast('AI drafting brief...', 'info');
    callAIWithRetry(prompt, function(parsed) {
      if (!parsed) { toast('AI returned no brief', 'warning'); return; }
      snapshot('AI Ad Set brief');
      var brief = adSet.brief || {};
      brief.creative_direction = parsed.creative_direction || brief.creative_direction;
      brief.hook_angles = parsed.hook_angles && parsed.hook_angles.length ? parsed.hook_angles : brief.hook_angles;
      brief.ai_notes = parsed.ai_notes || brief.ai_notes;
      saveEntityField('ad_set', adSetId, 'brief', brief);
      logActivity('brief_generated', 'ad_set', adSetId, adSet.name, 'AI generated brief');
      toast('Brief generated', 'success');
    }, function(err) { toast('AI error: ' + err, 'error'); },
       'ai-generate-ad-set-brief', BrandService.getSystemPrompt('research'), parseJSON);
  }

  // --- 5. Generate Ad Hooks (alternatives) ---

  function aiGenerateAdHooks(adId) {
    if (!aiV2_assertConfigured()) return;
    var ad = getAd(adId); if (!ad) return;
    var adSet = getAdSet(ad.ad_set_id);
    var camp = adSet ? getCampaignV2(adSet.campaign_id) : null;

    var prompt = 'Write 3 distinct hook options for this Meta Ad. Each should be 1 sentence, max 100 chars, with a different angle. For each, also rate it on three 0-100 scores and explain the psychology.\n\n';
    if (camp) prompt += aiV2_campaignContext(camp) + '\n';
    if (adSet) prompt += aiV2_adSetContext(adSet) + '\n';
    if (ad.creative && ad.creative.primary_text) prompt += 'Current primary text: ' + ad.creative.primary_text + '\n';
    prompt += '\n' + brandSnippet('content');
    prompt += '\n\nHook types: question, bold, story, data, direct, curiosity, challenge.\n';
    prompt += 'scores.conversion = how likely this hook moves a cold viewer toward the CTA (0-100).\n';
    prompt += 'scores.readability = how easy it is to read at a glance — short words, low cognitive load (0-100).\n';
    prompt += 'scores.connection = how strongly it speaks to the audience\'s pain / desire (0-100).\n';
    prompt += 'psychology = 1-2 sentences explaining why this hook works for this audience.\n';
    prompt += 'Respond JSON only: {"hooks":[{"text":"","type":"","scores":{"conversion":0,"readability":0,"connection":0},"psychology":""}]}';

    toast('AI writing hooks...', 'info');
    callAIWithRetry(prompt, function(parsed) {
      var hooks = (parsed && parsed.hooks) || [];
      if (hooks.length === 0) { toast('AI returned no hooks', 'warning'); return; }
      var ideas = hooks.map(function(h) {
        var s = h.scores || {};
        return {
          id: generateId('hki'),
          text: String(h.text || '').trim(),
          type: String(h.type || 'direct').trim(),
          scores: {
            conversion:  clamp100(s.conversion),
            readability: clamp100(s.readability),
            connection:  clamp100(s.connection)
          },
          psychology: String(h.psychology || '').trim(),
          generated_at: new Date().toISOString()
        };
      }).filter(function(i) { return i.text; });
      if (ideas.length === 0) { toast('AI returned no usable hooks', 'warning'); return; }

      snapshot('AI hook ideas');
      ad.hook = ad.hook || { source_message_id: '', selected_hook_id: '', text: '', type: 'direct' };
      ad.hook.ai_ideas = ideas;
      ad.hook.active_idea_id = '';
      ad.updated = new Date().toISOString();
      buildMaps(); syncToTextarea(); render();
      logActivity('hook_generated', 'ad', adId, ad.name, 'AI generated ' + ideas.length + ' hook ideas');
      toast('Got ' + ideas.length + ' hook ideas — pick one in the Hook tab', 'success');
    }, function(err) { toast('AI error: ' + err, 'error'); },
       'ai-generate-ad-hooks', BrandService.getSystemPrompt('content'), parseJSON);
  }

  function clamp100(n) {
    n = Number(n);
    if (!isFinite(n)) return 0;
    if (n < 0) return 0;
    if (n > 100) return 100;
    return Math.round(n);
  }

  // --- 6. Write Ad Copy (alternatives bundle: primary text + headline + description) ---

  function aiWriteAdCopy(adId) {
    if (!aiV2_assertConfigured()) return;
    var ad = getAd(adId); if (!ad) return;
    var adSet = getAdSet(ad.ad_set_id);
    var camp = adSet ? getCampaignV2(adSet.campaign_id) : null;

    var prompt = 'Write 3 distinct copy options for this Ad. Each option = {primary_text, headline, description}.\n';
    prompt += 'Primary text 90-140 chars. Headline ≤27 chars (sales-y, scroll-stopping). Description ≤27 chars (supports the headline).\n\n';
    if (camp) prompt += aiV2_campaignContext(camp) + '\n';
    if (adSet) prompt += aiV2_adSetContext(adSet) + '\n';
    if (ad.hook && ad.hook.text) prompt += 'Hook: ' + ad.hook.text + '\n';
    prompt += '\n' + brandSnippet('content');
    prompt += '\nRespond JSON only: {"options":[{"primary_text":"","headline":"","description":""}]}';

    toast('AI writing copy...', 'info');
    callAIWithRetry(prompt, function(parsed) {
      var options = parsed.options || [];
      if (options.length === 0) { toast('AI returned no copy', 'warning'); return; }
      showAIPreview('Pick a copy variant', options.map(function(o, i) { return { label: 'Variant ' + (i+1), content: o.primary_text, _copy: o }; }), function(selected) {
        snapshot('AI copy');
        ad.creative = ad.creative || {};
        ad.creative.primary_text = selected._copy.primary_text || ad.creative.primary_text;
        ad.creative.headline     = selected._copy.headline     || ad.creative.headline;
        ad.creative.description  = selected._copy.description  || ad.creative.description;
        ad.updated = new Date().toISOString();
        if (typeof maybeAdvanceAdStatus === 'function') maybeAdvanceAdStatus(ad, 'AI copy');
        buildMaps(); syncToTextarea(); render();
        logActivity('content_generated', 'ad', adId, ad.name, 'AI wrote copy');
        toast('Copy applied', 'success');
      }, { formatItem: function(opt) {
        return '<div><p><strong>' + esc(opt._copy.headline) + '</strong></p><p>' + esc(opt.content) + '</p><p class="cp-text-muted">' + esc(opt._copy.description) + '</p></div>';
      } });
    }, function(err) { toast('AI error: ' + err, 'error'); },
       'ai-write-ad-copy', BrandService.getSystemPrompt('content'), parseJSON);
  }

  // --- 7. Improve Ad Copy (refinement) ---

  function aiImproveAdCopy(adId) {
    if (!aiV2_assertConfigured()) return;
    var ad = getAd(adId); if (!ad) return;
    var c = ad.creative || {};
    if (!(c.primary_text || c.headline)) { toast('Write some copy first, then AI can improve it', 'info'); return; }

    var prompt = 'Improve this Meta Ad copy. Make it more specific, more emotional, more scroll-stopping. Keep same intent.\n\n';
    prompt += 'Current copy:\nPrimary text: ' + (c.primary_text || '') + '\nHeadline: ' + (c.headline || '') + '\nDescription: ' + (c.description || '') + '\n\n';
    prompt += brandSnippet('content');
    prompt += '\n\nRespond JSON only: {"primary_text":"","headline":"","description":""}';

    toast('AI improving copy...', 'info');
    callAIWithRetry(prompt, function(parsed) {
      if (!parsed) { toast('AI returned nothing', 'warning'); return; }
      showAIPreview('Compare improved copy', [
        { label: 'Original',  content: c.primary_text, _copy: { primary_text: c.primary_text, headline: c.headline, description: c.description } },
        { label: 'Improved',  content: parsed.primary_text, _copy: parsed }
      ], function(selected) {
        snapshot('AI improved copy');
        ad.creative = ad.creative || {};
        ad.creative.primary_text = selected._copy.primary_text || ad.creative.primary_text;
        ad.creative.headline     = selected._copy.headline     || ad.creative.headline;
        ad.creative.description  = selected._copy.description  || ad.creative.description;
        ad.updated = new Date().toISOString();
        if (typeof maybeAdvanceAdStatus === 'function') maybeAdvanceAdStatus(ad, 'AI improved');
        buildMaps(); syncToTextarea(); render();
        toast('Applied', 'success');
      }, { formatItem: function(opt) {
        return '<div><p><strong>' + esc(opt._copy.headline) + '</strong></p><p>' + esc(opt.content) + '</p><p class="cp-text-muted">' + esc(opt._copy.description) + '</p></div>';
      } });
    }, function(err) { toast('AI error: ' + err, 'error'); },
       'ai-improve-ad-copy', BrandService.getSystemPrompt('content'), parseJSON);
  }

  // --- 8. Generate Image Prompt ---

  function aiGenerateAdImagePrompt(adId) {
    if (!aiV2_assertConfigured()) return;
    var ad = getAd(adId); if (!ad) return;
    var img = (ad.media && ad.media.image) || {};
    var adSet = getAdSet(ad.ad_set_id);
    var camp = adSet ? getCampaignV2(adSet.campaign_id) : null;

    var prompt = 'Generate a production-ready AI image prompt for this Meta Ad.\n';
    prompt += 'Aspect ratio: ' + (img.aspect_ratio || '1:1') + '. Style: photorealistic unless brand says otherwise.\n\n';
    if (camp) prompt += aiV2_campaignContext(camp) + '\n';
    if (adSet) prompt += aiV2_adSetContext(adSet) + '\n';
    if (ad.creative && ad.creative.primary_text) prompt += 'Ad copy: ' + ad.creative.primary_text + '\n';
    var existingImagePrompt = img.prompt || img.ai_prompt || img.brief;
    if (existingImagePrompt) prompt += 'Existing image direction (refine this): ' + existingImagePrompt + '\n';
    prompt += '\n' + BrandService.getBrandDesignPrompt();
    prompt += '\n\nReturn JSON only: {"prompt":""}';

    toast('AI generating prompt...', 'info');
    callAIWithRetry(prompt, function(parsed) {
      if (!parsed || !parsed.prompt) { toast('AI returned no prompt', 'warning'); return; }
      snapshot('AI image prompt');
      ad.media = ad.media || {}; ad.media.image = ad.media.image || {};
      ad.media.image.prompt = parsed.prompt;
      ad.updated = new Date().toISOString();
      if (typeof maybeAdvanceAdStatus === 'function') maybeAdvanceAdStatus(ad, 'image prompt');
      buildMaps(); syncToTextarea(); render();
      logActivity('media_generated', 'ad', adId, ad.name, 'AI image prompt');
      toast('Image prompt applied', 'success');
    }, function(err) { toast('AI error: ' + err, 'error'); },
       'ai-generate-ad-image-prompt', BrandService.getSystemPrompt('research'), parseJSON);
  }

  // --- 9. Generate Video Blueprint (scenes) ---

  // --- 10. Generate Video Script (sectioned) ---

  function aiGenerateVideoScript(adId) {
    if (!aiV2_assertConfigured()) return;
    var ad = getAd(adId); if (!ad) return;
    var vid = (ad.media && ad.media.video) || {};
    var adSet = getAdSet(ad.ad_set_id);

    var prompt = 'Write a script for this Meta video Ad as labelled sections (e.g., Hook, Setup, Payoff, CTA). Target duration: ' + (vid.duration_seconds || 30) + 's. Aspect: ' + (vid.aspect_ratio || '9:16') + '.\n\n';
    if (adSet) prompt += aiV2_adSetContext(adSet) + '\n';
    if (vid.concept) prompt += 'Concept: ' + vid.concept + '\n';
    if (ad.hook && ad.hook.text) prompt += 'Hook: ' + ad.hook.text + '\n';
    if (ad.creative && ad.creative.cta_type) prompt += 'CTA: ' + (Constants.META_CTA_TYPES[ad.creative.cta_type] || {}).label + '\n';
    prompt += '\nVisual direction is out of scope here — only write the spoken / on-screen script per section.\n';
    prompt += '\n' + brandSnippet('content');
    prompt += '\n\nReturn 3-6 sections. JSON only: {"sections":[{"label":"Hook","script":""}]}';

    toast('AI writing script...', 'info');
    callAIWithRetry(prompt, function(parsed) {
      var sections = (parsed && parsed.sections) || [];
      if (sections.length === 0) { toast('AI returned no script', 'warning'); return; }
      var normalised = sections.map(function(s) { return { label: String(s.label || '').trim(), script: String(s.script || '').trim() }; })
                               .filter(function(s) { return s.label || s.script; });
      if (normalised.length === 0) { toast('AI returned no script', 'warning'); return; }
      snapshot('AI video script');
      ad.media = ad.media || {}; ad.media.video = ad.media.video || {};
      ad.media.video.script = { sections: normalised };
      ad.updated = new Date().toISOString();
      if (typeof maybeAdvanceAdStatus === 'function') maybeAdvanceAdStatus(ad, 'video script');
      buildMaps(); syncToTextarea(); render();
      logActivity('script_generated', 'ad', adId, ad.name, 'AI script (' + normalised.length + ' sections)');
      toast('Script generated', 'success');
    }, function(err) { toast('AI error: ' + err, 'error'); },
       'ai-generate-video-script', BrandService.getSystemPrompt('content'), parseJSON);
  }
