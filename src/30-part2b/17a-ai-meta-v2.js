  // ============================================================
  // SECTION 17A: AI — META v2 (Campaign Tree + per-level assists)
  // ============================================================
  //
  // Stage 4 of the restructure. All functions follow the existing pattern:
  //   callAIWithRetry(prompt, onSuccess, onError, actionId, systemPrompt, parseJSON)
  // and use BrandService.getSystemPrompt + brandSnippet for brand context.
  //
  // For alternatives-style outputs (hook ideas, copy variants) we save the
  // options directly onto the ad (ad.hook.ai_ideas, ad.creative.ai_copy_variants)
  // and let the inspector tabs render them inline. For single-result outputs
  // (image prompt, video script) we save directly and toast.

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

  // --- 1. Suggest Ad Sets for an existing Campaign ---
  // Note: brief-to-tree generation now lives entirely inside the New Campaign
  // Wizard (Part 2A `16a-new-campaign-wizard.js` + Part 2B
  // `17b-ai-new-campaign-wizard.js`). The flagship one-shot mega-prompt was
  // removed in favour of staged AI calls — see ncwAIDraftCampaign,
  // ncwAISuggestAdSets, and ncwAISuggestAds.

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

  // Open the AI runner modal for the Hook tab's Generate / Regenerate button.
  // Captures an optional steering instruction + provider/model selection,
  // then kicks off `aiGenerateAdHooks` with that context.
  function openHookGenerationModal(adId) {
    if (!aiV2_assertConfigured()) return;
    var ad = getAd(adId); if (!ad) return;
    var lastInstruction = (ad.hook && ad.hook.last_idea_instruction) || '';
    var hasIdeas = !!(ad.hook && ad.hook.ai_ideas && ad.hook.ai_ideas.length);
    openAiRunnerModal({
      title: hasIdeas ? 'Regenerate hook ideas' : 'Generate hook ideas',
      subtitle: hasIdeas ? 'Replaces the current list of ideas.' : 'AI will draft three distinct hook angles for this ad.',
      actionId: 'ai-generate-ad-hooks',
      instructionLabel: 'Angle or steer',
      instructionPlaceholder: 'e.g. lean on social proof · keep them under 8 words · ask a question',
      instructionInitial: lastInstruction,
      instructionRequired: false,
      confirmLabel: hasIdeas ? 'Regenerate' : 'Generate',
      busyLabel: 'Generating…',
      onConfirm: function(ctx, done) {
        aiGenerateAdHooks(adId, ctx.instruction, function(err) { done(err); });
      }
    });
  }

  function aiGenerateAdHooks(adId, instruction, onDone) {
    if (!aiV2_assertConfigured()) { if (onDone) onDone('not configured'); return; }
    var ad = getAd(adId); if (!ad) { if (onDone) onDone('ad not found'); return; }
    var adSet = getAdSet(ad.ad_set_id);
    var camp = adSet ? getCampaignV2(adSet.campaign_id) : null;
    instruction = (instruction || '').trim();

    var prompt = 'Write 3 distinct hook options for this Meta Ad. Each: 1 sentence, max 100 chars, a different angle. Rate each with a single 0-100 score (overall scroll-stopping potential) and a one-sentence "why this works" line.\n\n';
    if (instruction) prompt += 'Extra steer from the user: ' + instruction + '\n\n';
    if (camp) prompt += aiV2_campaignContext(camp) + '\n';
    if (adSet) prompt += aiV2_adSetContext(adSet) + '\n';
    if (ad.creative && ad.creative.primary_text) prompt += 'Current primary text: ' + ad.creative.primary_text + '\n';
    prompt += '\n' + brandSnippet('content');
    prompt += '\n\nHook types: question, bold, story, data, direct, curiosity, challenge.\n';
    prompt += 'Respond JSON only: {"hooks":[{"text":"","type":"","score":0,"psychology":""}]}';

    toast('AI writing hooks...', 'info');
    callAIWithRetry(prompt, function(parsed) {
      var hooks = (parsed && parsed.hooks) || [];
      if (hooks.length === 0) { toast('AI returned no hooks', 'warning'); if (onDone) onDone('empty'); return; }
      var ideas = hooks.map(function(h) {
        var s = h.scores || {};
        var derived = (h.score != null) ? h.score : (s.conversion != null ? s.conversion : (s.readability != null ? s.readability : s.connection));
        return {
          id: generateId('hki'),
          text: String(h.text || '').trim(),
          type: String(h.type || 'direct').trim(),
          score: clamp100(derived),
          psychology: String(h.psychology || '').trim(),
          instruction: instruction,
          generated_at: new Date().toISOString()
        };
      }).filter(function(i) { return i.text; });
      if (ideas.length === 0) { toast('AI returned no usable hooks', 'warning'); if (onDone) onDone('empty'); return; }

      snapshot('AI hook ideas');
      ad.hook = ad.hook || { source_message_id: '', selected_hook_id: '', text: '', type: 'direct' };
      ad.hook.ai_ideas = ideas;
      ad.hook.active_idea_id = '';
      ad.hook.last_idea_instruction = instruction;
      ad.updated = new Date().toISOString();
      buildMaps(); syncToTextarea(); render();
      logActivity('hook_generated', 'ad', adId, ad.name, 'AI generated ' + ideas.length + ' hook ideas' + (instruction ? ' (with steer)' : ''));
      toast('Got ' + ideas.length + ' hook ideas — pick one in the Hook tab', 'success');
      if (onDone) onDone();
    }, function(err) {
      toast('AI error: ' + err, 'error');
      if (onDone) onDone(err);
    }, 'ai-generate-ad-hooks', BrandService.getSystemPrompt('content'), parseJSON);
  }

  function clamp100(n) {
    n = Number(n);
    if (!isFinite(n)) return 0;
    if (n < 0) return 0;
    if (n > 100) return 100;
    return Math.round(n);
  }

  // --- 6. Write Ad Copy — single primary_text variant + AI runner modal ---

  function openCopyWriteModal(adId) {
    if (!aiV2_assertConfigured()) return;
    var ad = getAd(adId); if (!ad) return;
    var lastInstruction = (ad.creative && ad.creative.last_write_instruction) || '';
    openAiRunnerModal({
      title: 'AI write copy',
      subtitle: 'Drafts one primary-text variant for this ad. You can compare it before applying.',
      actionId: 'ai-write-ad-copy',
      instructionLabel: 'Angle or notes',
      instructionPlaceholder: 'e.g. lean on social proof · emphasise outcome · keep it under 100 chars',
      instructionInitial: lastInstruction,
      instructionRequired: false,
      confirmLabel: 'Write',
      busyLabel: 'Writing…',
      onConfirm: function(ctx, done) {
        aiWriteAdCopy(adId, ctx.instruction, function(err) { done(err); });
      }
    });
  }

  function aiWriteAdCopy(adId, instruction, onDone) {
    if (!aiV2_assertConfigured()) { if (onDone) onDone('not configured'); return; }
    var ad = getAd(adId); if (!ad) { if (onDone) onDone('ad not found'); return; }
    var adSet = getAdSet(ad.ad_set_id);
    var camp = adSet ? getCampaignV2(adSet.campaign_id) : null;
    var activeHook = (ad.hook && ad.hook.text) || '';
    instruction = (instruction || '').trim();

    var prompt = 'Write ONE primary-text option for this Meta Ad — the body copy that sits above the media. Aim for 90-140 chars, scroll-stopping, written in the brand voice. Headline and description are out of scope; return primary_text only.\n\n';
    if (instruction) prompt += 'Extra steer from the user: ' + instruction + '\n\n';
    if (camp) prompt += aiV2_campaignContext(camp) + '\n';
    if (adSet) prompt += aiV2_adSetContext(adSet) + '\n';
    if (activeHook) prompt += 'Selected hook (extend this thought — do not repeat verbatim): ' + activeHook + '\n';
    prompt += '\n' + brandSnippet('content');
    prompt += '\nRespond JSON only: {"primary_text":""}';

    toast('AI writing copy...', 'info');
    callAIWithRetry(prompt, function(parsed) {
      var text = String((parsed && parsed.primary_text) || '').trim();
      if (!text) { toast('AI returned no copy', 'warning'); if (onDone) onDone('empty'); return; }
      snapshot('AI copy variant');
      ad.creative = ad.creative || {};
      ad.creative.ai_copy_variants = [{
        id: generateId('cpv'),
        text: text,
        source: 'write',
        instruction: instruction,
        generated_at: new Date().toISOString()
      }];
      ad.creative.last_write_instruction = instruction;
      ad.updated = new Date().toISOString();
      buildMaps(); syncToTextarea(); render();
      logActivity('content_generated', 'ad', adId, ad.name, 'AI wrote primary text' + (instruction ? ' (with steer)' : ''));
      toast('Copy draft ready — compare in the Copy tab', 'success');
      if (onDone) onDone();
    }, function(err) {
      toast('AI error: ' + err, 'error');
      if (onDone) onDone(err);
    }, 'ai-write-ad-copy', BrandService.getSystemPrompt('content'), parseJSON);
  }

  // --- 7. Improve Ad Copy — required instruction + AI runner modal ---

  function openCopyImproveModal(adId) {
    if (!aiV2_assertConfigured()) return;
    var ad = getAd(adId); if (!ad) return;
    var c = ad.creative || {};
    if (!(c.primary_text || '').trim()) { toast('Write some primary text first, then AI can improve it', 'info'); return; }
    openAiRunnerModal({
      title: 'Improve primary text',
      subtitle: 'Tell the AI what to change. The original stays in the textarea until you apply the improvement.',
      actionId: 'ai-improve-ad-copy',
      instructionLabel: 'What should change?',
      instructionPlaceholder: 'e.g. shorter · more emotional · remove jargon · swap "we" for "you"',
      instructionInitial: '',
      instructionRequired: true,
      confirmLabel: 'Improve',
      busyLabel: 'Improving…',
      onConfirm: function(ctx, done) {
        aiImproveAdCopy(adId, ctx.instruction, function(err) { done(err); });
      }
    });
  }

  function aiImproveAdCopy(adId, instruction, onDone) {
    if (!aiV2_assertConfigured()) { if (onDone) onDone('not configured'); return; }
    var ad = getAd(adId); if (!ad) { if (onDone) onDone('ad not found'); return; }
    var c = ad.creative || {};
    if (!(c.primary_text || '').trim()) {
      toast('Write some primary text first, then AI can improve it', 'info');
      if (onDone) onDone('empty source');
      return;
    }
    instruction = (instruction || '').trim();

    var prompt = 'Rewrite this Meta Ad primary text per the user\'s instruction. Keep the same intent and approximate length unless the instruction asks otherwise. Return primary_text only.\n\n';
    prompt += 'User instruction: ' + (instruction || '(make it sharper)') + '\n\n';
    prompt += 'Current primary text:\n' + c.primary_text + '\n\n';
    if (ad.hook && ad.hook.text) prompt += 'Selected hook context: ' + ad.hook.text + '\n\n';
    prompt += brandSnippet('content');
    prompt += '\n\nRespond JSON only: {"primary_text":""}';

    toast('AI improving copy...', 'info');
    callAIWithRetry(prompt, function(parsed) {
      var improved = String((parsed && parsed.primary_text) || '').trim();
      if (!improved) { toast('AI returned nothing', 'warning'); if (onDone) onDone('empty'); return; }
      snapshot('AI improved copy');
      ad.creative = ad.creative || {};
      ad.creative.ai_copy_variants = [{
        id: generateId('cpv'),
        text: improved,
        source: 'improve',
        instruction: instruction,
        generated_at: new Date().toISOString()
      }];
      ad.updated = new Date().toISOString();
      buildMaps(); syncToTextarea(); render();
      logActivity('content_generated', 'ad', adId, ad.name, 'AI improved primary text: ' + (instruction || '(no steer)'));
      toast('Improved copy ready — compare in the Copy tab', 'success');
      if (onDone) onDone();
    }, function(err) {
      toast('AI error: ' + err, 'error');
      if (onDone) onDone(err);
    }, 'ai-improve-ad-copy', BrandService.getSystemPrompt('content'), parseJSON);
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
