  // ============================================================
  // SECTION 15.5: AI — CAMPAIGN RECIPE SUGGESTIONS
  // ============================================================

  function aiSuggestCampaignRecipes(campaignId) {
    var camp = getCampaign(campaignId); if (!camp) return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    toast('AI analyzing campaign dimensions...', 'info');

    var personas = (camp.persona_ids || []).map(function(id) { var p = S.personaMap[id]; return p ? { name: p.name, description: truncate(p.description || '', 80) } : null; }).filter(Boolean);
    var messages = (camp.message_ids || []).map(function(id) { var m = S.messageMap[id]; return m ? { title: m.title, theme: m.theme || '', funnel: (m.funnel_stages || []).join(',') } : null; }).filter(Boolean);
    var styles = (camp.style_ids || []).map(function(id) { var s = S.styleMap[id]; return s ? { name: s.name } : null; }).filter(Boolean);
    var formats = (camp.format_ids || []).map(function(id) { var f = S.formatMap[id]; return f ? { name: f.name, category: f.category || '' } : null; }).filter(Boolean);

    if (personas.length === 0 && messages.length === 0) {
      toast('Select personas and messages in the campaign targeting first', 'warning');
      return;
    }

    var objective = (Constants.CAMPAIGN_OBJECTIVES || []).find(function(o) { return o.id === camp.objective; });

    var prompt = 'You are a Meta Ads campaign strategist. Analyze the available creative dimensions and suggest the best recipe combinations for this campaign.\n\n';
    prompt += 'Campaign: ' + camp.name + '\n';
    if (objective) prompt += 'Objective: ' + objective.name + '\n';
    if (camp.funnel_stage) { var fs = S.funnelStageMap[camp.funnel_stage]; if (fs) prompt += 'Funnel focus: ' + fs.name + '\n'; }
    if (camp.date_start) prompt += 'Date range: ' + camp.date_start + ' to ' + (camp.date_end || '?') + '\n';
    if (camp.ai_instructions) prompt += 'Special instructions: ' + camp.ai_instructions + '\n';

    prompt += '\nAvailable Personas:\n' + personas.map(function(p, i) { return (i + 1) + '. ' + p.name + ' — ' + p.description; }).join('\n');
    prompt += '\n\nAvailable Messages:\n' + messages.map(function(m, i) { return (i + 1) + '. ' + m.title + (m.theme ? ' [' + m.theme + ']' : '') + (m.funnel ? ' (Funnel: ' + m.funnel + ')' : ''); }).join('\n');
    if (styles.length) prompt += '\n\nAvailable Styles:\n' + styles.map(function(s, i) { return (i + 1) + '. ' + s.name; }).join('\n');
    if (formats.length) prompt += '\n\nAvailable Formats:\n' + formats.map(function(f, i) { return (i + 1) + '. ' + f.name + (f.category ? ' [' + f.category + ']' : ''); }).join('\n');

    prompt += brandSnippet('research');

    prompt += '\n\nRules:\n- Suggest 4-8 specific recipe combinations (persona × message × style × format)\n- For each, explain WHY this combination works for the campaign objective\n- Prioritize diversity — don\'t repeat the same persona or message too often\n- Consider funnel stage matching (TOFU messages with awareness personas, BOFU with conversion personas)\n- Suggest media type (image or video) for each based on format\n- Order from highest priority to lowest\n\nRespond ONLY as JSON: {"suggestions":[{"persona_name":"...","message_title":"...","style_name":"...","format_name":"...","media_type":"image|video","reasoning":"why this combo works...","priority":"high|medium|low"}]}';

    callAIWithRetry(prompt, function(parsed) {
      var suggestions = parsed.suggestions || [];
      if (suggestions.length === 0) { toast('AI returned no suggestions', 'warning'); return; }

      // Map names back to IDs
      var mappedSuggestions = suggestions.map(function(s) {
        var pMatch = (S.data.personas || []).find(function(p) { return p.name === s.persona_name; });
        var mMatch = (S.data.messages || []).find(function(m) { return m.title === s.message_title; });
        var sMatch = (S.data.styles || []).find(function(st) { return st.name === s.style_name; });
        var fMatch = (S.data.visual_formats || []).find(function(f) { return f.name === s.format_name; });
        return {
          persona_id: pMatch ? pMatch.id : '', message_id: mMatch ? mMatch.id : '',
          style_id: sMatch ? sMatch.id : '', visual_format_id: fMatch ? fMatch.id : '',
          media_type: s.media_type || 'image', reasoning: s.reasoning || '', priority: s.priority || 'medium',
          title: (pMatch ? pMatch.name : '?') + ' × ' + (mMatch ? mMatch.title : '?') + ' × ' + (sMatch ? sMatch.name : '?') + ' × ' + (fMatch ? fMatch.name : '?'),
          _selected: true
        };
      });

      // Show results in modal for user to review and select
      var html = '<div style="margin-bottom:var(--cp-space-3)">';
      html += '<p class="cp-text-muted">AI suggested ' + mappedSuggestions.length + ' recipe combinations. Select which ones to create.</p>';
      html += '</div>';

      for (var i = 0; i < mappedSuggestions.length; i++) {
        var ms = mappedSuggestions[i];
        html += '<div class="cp-card" style="margin-bottom:var(--cp-space-2);padding:var(--cp-space-3);cursor:pointer" data-suggestion-idx="' + i + '">';
        html += '<div style="display:flex;align-items:center;gap:var(--cp-space-2);margin-bottom:6px">';
        html += '<input type="checkbox" class="cp-ai-suggestion-check" data-idx="' + i + '" checked>';
        html += '<strong style="flex:1">' + esc(ms.title) + '</strong>';
        html += priorityBadge(ms.priority) + ' ' + mediaTypeBadge(ms.media_type);
        html += '</div>';
        html += '<p style="font-size:var(--cp-font-size-xs);color:var(--cp-text-secondary);margin:0">' + esc(ms.reasoning) + '</p>';
        html += '</div>';
      }

      openModal('AI Recipe Suggestions — ' + camp.name, html, {
        titleIcon: 'sparkles', size: 'lg',
        saveLabel: icon('plus') + ' Create Selected Recipes',
        onSave: function() {
          snapshot('AI campaign recipes');
          var count = 0;
          $('.cp-ai-suggestion-check:checked').each(function() {
            var idx = parseInt($(this).data('idx'), 10);
            var s = mappedSuggestions[idx];
            if (s) {
              createEntity('recipe', {
                persona_id: s.persona_id, message_id: s.message_id,
                style_id: s.style_id, visual_format_id: s.visual_format_id,
                media_type: s.media_type, priority: s.priority, campaign_id: campaignId
              });
              count++;
            }
          });
          logActivity('recipe_batch_generated', 'campaign', campaignId, camp.name, 'AI suggested ' + count + ' recipes for campaign');
          closeModal();
          toast(count + ' AI-suggested recipes created', 'success', 4000);
        }
      });
    }, function(err) { toast('AI Error: ' + err, 'error'); }, 'ai-campaign-recipes', BrandService.getSystemPrompt('research'), parseJSON);
  }

  function aiGenerateCampaignBrief(campaignId) {
    var camp = getCampaign(campaignId); if (!camp) return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    toast('Generating campaign brief...', 'info');

    var personas = (camp.persona_ids || []).map(function(id) { var p = S.personaMap[id]; return p ? p.name + (p.description ? ': ' + truncate(p.description, 60) : '') : null; }).filter(Boolean);
    var messages = (camp.message_ids || []).map(function(id) { var m = S.messageMap[id]; return m ? m.title : null; }).filter(Boolean);
    var styles = (camp.style_ids || []).map(function(id) { var s = S.styleMap[id]; return s ? s.name : null; }).filter(Boolean);
    var objective = (Constants.CAMPAIGN_OBJECTIVES || []).find(function(o) { return o.id === camp.objective; });

    var prompt = 'You are a senior advertising strategist. Write a comprehensive creative brief for this Meta Ads campaign.\n\n';
    prompt += 'Campaign: ' + camp.name + '\n';
    if (objective) prompt += 'Objective: ' + objective.name + '\n';
    if (camp.funnel_stage) { var fs = S.funnelStageMap[camp.funnel_stage]; if (fs) prompt += 'Funnel focus: ' + fs.name + '\n'; }
    if (camp.date_start) prompt += 'Timeline: ' + camp.date_start + ' to ' + (camp.date_end || 'ongoing') + '\n';
    if (camp.budget_notes) prompt += 'Budget: ' + camp.budget_notes + '\n';
    if (personas.length) prompt += '\nTarget Personas:\n' + personas.map(function(p, i) { return (i + 1) + '. ' + p; }).join('\n');
    if (messages.length) prompt += '\nKey Messages: ' + messages.join(', ');
    if (styles.length) prompt += '\nCreative Styles: ' + styles.join(', ');
    if (camp.ai_instructions) prompt += '\nSpecial Instructions: ' + camp.ai_instructions;
    prompt += brandSnippet('content');
    prompt += '\n\nWrite a creative brief covering:\n1. Campaign overview and objective\n2. Target audience insights (from personas)\n3. Key messaging strategy\n4. Creative direction and visual guidelines\n5. Tone of voice\n6. Success metrics and KPIs\n\nWrite in a professional but actionable tone. 200-400 words. Plain text, no markdown.';

    callAIWithRetry(prompt, function(text) {
      // Clean any JSON wrapping
      var clean = text.replace(/^```[\s\S]*?\n/, '').replace(/\n```$/, '').replace(/^\{[\s\S]*?"brief"\s*:\s*"/, '').replace(/"\s*\}$/, '').trim();
      snapshot('AI campaign brief');
      saveEntityField('campaign', campaignId, 'brief', clean);
      S.campaignDetailTab = 'brief';
      buildMaps(); render(); syncToTextarea();
      toast('Campaign brief generated', 'success');
    }, function(err) { toast('AI Error: ' + err, 'error'); }, 'ai-campaign-brief', BrandService.getSystemPrompt('content'), parseJSON);
  }

  function aiAnalyzeCampaignGaps(campaignId) {
    var camp = getCampaign(campaignId); if (!camp) return;
    if (!LLMService.isConfigured()) { toast('No AI providers configured', 'warning'); return; }
    var recipes = (S.data.recipes || []).filter(function(r) { return r.campaign_id === campaignId; });
    toast('Analyzing coverage gaps...', 'info');

    var personaNames = (camp.persona_ids || []).map(function(id) { var p = S.personaMap[id]; return p ? p.name : null; }).filter(Boolean);
    var messageNames = (camp.message_ids || []).map(function(id) { var m = S.messageMap[id]; return m ? m.title : null; }).filter(Boolean);
    var objective = (Constants.CAMPAIGN_OBJECTIVES || []).find(function(o) { return o.id === camp.objective; });

    // Build coverage info
    var existingCombos = recipes.map(function(r) {
      var pn = S.personaMap[r.persona_id] ? S.personaMap[r.persona_id].name : '?';
      var mn = S.messageMap[r.message_id] ? S.messageMap[r.message_id].title : '?';
      return pn + ' × ' + mn;
    });

    var prompt = 'You are a campaign strategist analyzing ad creative coverage for a Meta Ads campaign.\n\n';
    prompt += 'Campaign: ' + camp.name + '\n';
    if (objective) prompt += 'Objective: ' + objective.name + '\n';
    prompt += '\nAvailable Personas: ' + personaNames.join(', ');
    prompt += '\nAvailable Messages: ' + messageNames.join(', ');
    prompt += '\nExisting recipes (persona × message combos):\n' + (existingCombos.length ? existingCombos.join('\n') : 'None');
    prompt += brandSnippet('research');
    prompt += '\n\nAnalyze and provide:\n1. Missing persona×message combinations that should be covered\n2. Over-covered areas (too many recipes for one combo)\n3. Funnel stage gaps (TOFU/MOFU/BOFU balance)\n4. Recommendations for priority additions\n\nKeep it concise and actionable. Plain text, no markdown.';

    callAIWithRetry(prompt, function(text) {
      var clean = text.replace(/^```[\s\S]*?\n/, '').replace(/\n```$/, '').trim();
      openModal('Campaign Gap Analysis — ' + camp.name, '<div style="white-space:pre-wrap;line-height:1.7;font-size:var(--cp-font-size-sm)">' + esc(clean) + '</div>', {
        titleIcon: 'magnifying-glass', size: 'lg', footer: false
      });
    }, function(err) { toast('AI Error: ' + err, 'error'); }, 'ai-campaign-gaps', BrandService.getSystemPrompt('research'), parseJSON);
  }

