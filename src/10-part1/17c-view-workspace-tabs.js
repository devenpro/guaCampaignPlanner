  // ============================================================
  // SECTION 15D: WORKSPACE INSPECTOR TABS (v2)
  // ============================================================
  //
  // Tabbed inspector renderers — wraps the read-only renderers in 17b with
  // an editor for the strategic brief (Ad Set) and the creative pipeline
  // (Ad). Tab state lives in S.workspaceInspectorTab.

  // --- Ad Set inspector (tabbed) ---

  function renderInspectorForAdSetTabbed(adSet) {
    var tab = S.workspaceInspectorTab;
    var validTabs = ['overview', 'brief', 'settings'];
    if (validTabs.indexOf(tab) === -1) tab = 'overview';

    var html = '';
    html += renderInspectorTabs([
      { key: 'overview', label: 'Overview', icon: 'eye' },
      { key: 'brief',    label: 'Brief',    icon: 'file-lines' },
      { key: 'settings', label: 'Settings', icon: 'gear' }
    ], tab);

    html += '<div class="cp-workspace-inspector-tab-body">';
    if (tab === 'overview')      html += renderInspectorForAdSet(adSet);
    else if (tab === 'brief')    html += renderAdSetBriefEditor(adSet);
    else if (tab === 'settings') html += renderAdSetSettingsTab(adSet);
    html += '</div>';
    return html;
  }

  function renderAdSetBriefEditor(adSet) {
    var brief = adSet.brief || {};
    var messages = getAllMessages();
    var styles = getAllStyles();
    var formats = getAllFormats();

    var html = '<div class="cp-inspector-editor" data-entity-type="ad_set" data-entity-id="' + esc(adSet.id) + '">';

    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('file-lines') + ' Creative direction</div>';
    html += '<textarea class="cp-textarea cp-v2-inline-field" data-field="brief.creative_direction" data-entity-type="ad_set" data-entity-id="' + esc(adSet.id) + '" rows="3" placeholder="Strategic angle for this Ad Set — what story, tone, and messaging direction.">' + esc(brief.creative_direction || '') + '</textarea>';
    html += '</div>';

    // Messages from library (multi-select chips)
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('comments') + ' Messages from library';
    html += '<span class="cp-text-muted" style="font-weight:400;font-size:11px;margin-left:8px">attached as snapshots when used in Ads</span>';
    html += '</div>';
    if (messages.length === 0) {
      html += '<div class="cp-text-muted">No messages in library. <a href="#" data-action="go-view" data-view="messages">Create some</a> to pull from.</div>';
    } else {
      html += '<div class="cp-chip-grid">';
      var selMsgs = brief.message_ids || [];
      for (var mi = 0; mi < messages.length; mi++) {
        var m = messages[mi];
        var isSel = selMsgs.indexOf(m.id) > -1;
        html += '<label class="cp-chip' + (isSel ? ' cp-chip-active' : '') + '">';
        html += '<input type="checkbox" class="cp-v2-brief-id" data-field="brief.message_ids" data-entity-id="' + esc(adSet.id) + '" data-id="' + esc(m.id) + '"' + (isSel ? ' checked' : '') + ' style="display:none">';
        html += esc(m.title || 'Untitled') + '</label>';
      }
      html += '</div>';
    }
    html += '</div>';

    // Styles
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('palette') + ' Styles to use</div>';
    if (styles.length === 0) {
      html += '<div class="cp-text-muted">No styles in library. <a href="#" data-action="go-view" data-view="styles">Create some</a>.</div>';
    } else {
      html += '<div class="cp-chip-grid">';
      var selStyles = brief.style_ids || [];
      for (var si = 0; si < styles.length; si++) {
        var st = styles[si];
        var stSel = selStyles.indexOf(st.id) > -1;
        html += '<label class="cp-chip' + (stSel ? ' cp-chip-active' : '') + '">';
        html += '<input type="checkbox" class="cp-v2-brief-id" data-field="brief.style_ids" data-entity-id="' + esc(adSet.id) + '" data-id="' + esc(st.id) + '"' + (stSel ? ' checked' : '') + ' style="display:none">';
        html += esc(st.name || 'Untitled') + '</label>';
      }
      html += '</div>';
    }
    html += '</div>';

    // Formats
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('clapperboard') + ' Visual formats</div>';
    if (formats.length === 0) {
      html += '<div class="cp-text-muted">No formats in library. <a href="#" data-action="go-view" data-view="formats">Create some</a>.</div>';
    } else {
      html += '<div class="cp-chip-grid">';
      var selFmts = brief.format_ids || [];
      for (var fi = 0; fi < formats.length; fi++) {
        var f = formats[fi];
        var fSel = selFmts.indexOf(f.id) > -1;
        html += '<label class="cp-chip' + (fSel ? ' cp-chip-active' : '') + '">';
        html += '<input type="checkbox" class="cp-v2-brief-id" data-field="brief.format_ids" data-entity-id="' + esc(adSet.id) + '" data-id="' + esc(f.id) + '"' + (fSel ? ' checked' : '') + ' style="display:none">';
        html += esc(f.name || 'Untitled') + '</label>';
      }
      html += '</div>';
    }
    html += '</div>';

    // Hook angles (free-text list)
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('anchor') + ' Hook angles';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="ws-add-hook-angle" data-id="' + esc(adSet.id) + '" style="margin-left:auto">' + icon('plus') + ' Add</button>';
    html += '</div>';
    var angles = brief.hook_angles || [];
    if (angles.length === 0) {
      html += '<div class="cp-text-muted">No hook angles yet. Add 3-5 distinct creative angles for this Ad Set\'s Ads.</div>';
    } else {
      html += '<div class="cp-hook-angle-list">';
      for (var hai = 0; hai < angles.length; hai++) {
        html += '<div class="cp-hook-angle-row">';
        html += '<input type="text" class="cp-input cp-v2-hook-angle" data-entity-id="' + esc(adSet.id) + '" data-index="' + hai + '" value="' + esc(angles[hai]) + '">';
        html += '<button class="cp-btn-icon cp-btn-icon-sm" data-action="ws-remove-hook-angle" data-id="' + esc(adSet.id) + '" data-index="' + hai + '" title="Remove">' + icon('trash') + '</button>';
        html += '</div>';
      }
      html += '</div>';
    }
    html += '</div>';

    // AI notes
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('sparkles') + ' AI notes</div>';
    html += '<textarea class="cp-textarea cp-v2-inline-field" data-field="brief.ai_notes" data-entity-type="ad_set" data-entity-id="' + esc(adSet.id) + '" rows="2" placeholder="Hints for AI when generating Ads — tone, forbidden words, things to emphasize.">' + esc(brief.ai_notes || '') + '</textarea>';
    html += '</div>';

    html += '<div class="cp-inspector-actions">';
    html += '<button class="cp-btn cp-btn-ai" data-action="ai-generate-ad-set-brief" data-id="' + esc(adSet.id) + '">' + icon('sparkles') + ' AI Generate brief</button>';
    html += '<button class="cp-btn cp-btn-primary" data-action="ws-add-ad" data-ad-set-id="' + esc(adSet.id) + '">' + icon('plus') + ' Add Ad with this brief</button>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderAdSetSettingsTab(adSet) {
    // Read-only view of the targeting/optimization settings + a single
    // "Edit Ad Set" CTA that opens the full modal.
    var html = '';

    // Audience block with divergence indicator
    var persona = S.personaMap[adSet.persona_id];
    var divergence = isPersonaSnapshotStale(adSet);

    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('users') + ' Audience</div>';
    if (persona) {
      html += '<div class="cp-inspector-persona-card">';
      html += '<div class="cp-inspector-persona-name">' + icon('user') + ' ' + esc(persona.name) + '</div>';
      if (persona.description) html += '<div class="cp-inspector-persona-desc">' + esc(truncate(persona.description, 200)) + '</div>';
      html += '</div>';
      if (divergence) {
        html += '<div class="cp-snapshot-divergence-pill">';
        html += icon('warning') + ' Library copy has changed since this Ad Set was created.';
        html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="resync-persona-snapshot" data-id="' + esc(adSet.id) + '" style="margin-left:auto">' + icon('refresh') + ' Re-sync from library</button>';
        html += '</div>';
      }
    } else {
      html += '<div class="cp-text-muted">No persona linked.</div>';
    }
    html += '</div>';

    // Optimization + placements + schedule pulled from the existing overview helper
    html += renderInspectorForAdSet(adSet).replace(/<div class="cp-inspector-header"[\s\S]*?<\/div><\/div>/, '');

    return html;
  }

  // --- Ad inspector (tabbed) ---

  function renderInspectorForAdTabbed(ad) {
    var tab = S.workspaceInspectorTab;
    var validTabs = ['overview', 'hook', 'copy', 'media', 'review'];
    if (validTabs.indexOf(tab) === -1) tab = 'overview';

    var html = '';
    html += renderAdInspectorHeader(ad);
    html += renderAdWorkflowTabs(ad, tab);

    html += '<div class="cp-workspace-inspector-tab-body">';
    if (tab === 'overview')    html += renderInspectorForAd(ad);
    else if (tab === 'hook')   html += renderAdHookStep(ad);
    else if (tab === 'copy')   html += renderAdCopyStep(ad);
    else if (tab === 'media')  html += renderAdMediaStep(ad);
    else if (tab === 'review') html += renderAdReviewStep(ad);
    html += '</div>';
    return html;
  }

  function renderAdHookStep(ad) {
    var hook = ad.hook || {};
    var adSet = S.adSetMap[ad.ad_set_id];
    var briefMsgs = (adSet && adSet.brief && adSet.brief.message_ids) || [];
    var hookAngles = (adSet && adSet.brief && adSet.brief.hook_angles) || [];

    var html = '<div class="cp-inspector-editor" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '">';

    // Brief context (read from parent Ad Set)
    if (hookAngles.length || briefMsgs.length) {
      html += '<div class="cp-inspector-context-banner">';
      html += '<strong>' + icon('file-lines') + ' Brief context:</strong> ';
      if (hookAngles.length) html += hookAngles.slice(0, 3).map(function(a) { return '<em>"' + esc(truncate(a, 60)) + '"</em>'; }).join(' · ');
      html += '</div>';
    }

    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('anchor') + ' Hook text</div>';
    html += '<textarea class="cp-textarea cp-v2-inline-field" data-field="hook.text" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '" rows="3" placeholder="The first thing the viewer sees. Make it count.">' + esc(hook.text || '') + '</textarea>';
    html += '<div class="cp-form-row" style="margin-top:var(--cp-space-2)">';
    html += '<div class="cp-form-half"><label>Type</label>';
    html += '<select class="cp-select cp-v2-inline-field" data-field="hook.type" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '">';
    var hookTypes = ['question','bold','story','data','direct','curiosity','challenge'];
    for (var ht of hookTypes) {
      var htSel = (hook.type === ht) ? ' selected' : '';
      html += '<option value="' + ht + '"' + htSel + '>' + ht.charAt(0).toUpperCase() + ht.slice(1) + '</option>';
    }
    html += '</select></div></div>';
    html += '</div>';

    // Pull from parent Ad Set's library messages
    if (briefMsgs.length) {
      html += '<div class="cp-inspector-section">';
      html += '<div class="cp-inspector-section-title">' + icon('comments') + ' Pull a hook from a library message</div>';
      for (var mi = 0; mi < briefMsgs.length; mi++) {
        var msg = S.messageMap[briefMsgs[mi]];
        if (!msg) continue;
        var hooks = msg.hooks || [];
        html += '<div class="cp-pullable-message">';
        html += '<div class="cp-pullable-message-title">' + esc(msg.title) + '</div>';
        if (hooks.length) {
          html += '<div class="cp-pullable-hooks">';
          for (var hi = 0; hi < hooks.length; hi++) {
            html += '<button class="cp-pullable-hook" data-action="ws-pull-hook" data-ad-id="' + esc(ad.id) + '" data-message-id="' + esc(msg.id) + '" data-hook-id="' + esc(hooks[hi].id) + '">';
            html += '<span class="cp-pullable-hook-type">' + esc(hooks[hi].type || 'direct') + '</span>';
            html += '<span class="cp-pullable-hook-text">' + esc(hooks[hi].text) + '</span>';
            html += '</button>';
          }
          html += '</div>';
        } else {
          html += '<div class="cp-text-muted" style="font-size:12px">No hooks in this message yet.</div>';
        }
        html += '</div>';
      }
      html += '</div>';
    }

    html += '<div class="cp-inspector-actions">';
    html += '<button class="cp-btn cp-btn-ai" data-action="ai-generate-ad-hooks" data-id="' + esc(ad.id) + '">' + icon('sparkles') + ' Generate hooks</button>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderAdCopyStep(ad) {
    var c = ad.creative || {};
    var html = '<div class="cp-inspector-editor" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '">';

    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('pen-fancy') + ' Primary text';
    html += '<span class="cp-text-muted" style="font-weight:400;font-size:11px;margin-left:8px">125 chars recommended · main body copy</span>';
    html += '</div>';
    html += '<textarea class="cp-textarea cp-v2-inline-field" data-field="creative.primary_text" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '" rows="4" placeholder="The body copy above your media.">' + esc(c.primary_text || '') + '</textarea>';
    html += '<div class="cp-char-counter">' + countChars(c.primary_text || '') + ' chars · ' + countWords(c.primary_text || '') + ' words</div>';
    html += '</div>';

    html += '<div class="cp-form-row">';
    html += '<div class="cp-form-half">';
    html += '<div class="cp-inspector-section-title">' + icon('heading') + ' Headline <span class="cp-text-muted" style="font-weight:400;font-size:11px">27 chars</span></div>';
    html += '<input type="text" class="cp-input cp-v2-inline-field" data-field="creative.headline" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '" maxlength="60" value="' + esc(c.headline || '') + '">';
    html += '</div>';
    html += '<div class="cp-form-half">';
    html += '<div class="cp-inspector-section-title">' + icon('align-left') + ' Description <span class="cp-text-muted" style="font-weight:400;font-size:11px">27 chars</span></div>';
    html += '<input type="text" class="cp-input cp-v2-inline-field" data-field="creative.description" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '" maxlength="60" value="' + esc(c.description || '') + '">';
    html += '</div></div>';

    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('link') + ' Destination</div>';
    html += '<div class="cp-form-row">';
    html += '<div class="cp-form-third"><label>CTA</label>';
    html += '<select class="cp-select cp-v2-inline-field" data-field="creative.cta_type" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '">';
    var C = Constants;
    for (var ctk in C.META_CTA_TYPES) {
      var ctSel = (c.cta_type === ctk) ? ' selected' : '';
      html += '<option value="' + ctk + '"' + ctSel + '>' + esc(C.META_CTA_TYPES[ctk].label) + '</option>';
    }
    html += '</select></div>';
    html += '<div class="cp-form-grow"><label>Destination URL</label>';
    html += '<input type="url" class="cp-input cp-v2-inline-field" data-field="creative.cta_link" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '" value="' + esc(c.cta_link || '') + '" placeholder="https://example.com">';
    html += '</div></div>';

    // Display link + tracking params — orphaned fields from the old modal,
    // both relate to destination so they live in the Copy tab now.
    html += '<div class="cp-form-row" style="margin-top:var(--cp-space-2)">';
    html += '<div class="cp-form-half"><label>Display link <span class="cp-text-muted" style="font-weight:400;font-size:11px">optional — shown to viewers if set</span></label>';
    html += '<input type="text" class="cp-input cp-v2-inline-field" data-field="creative.display_link" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '" value="' + esc(c.display_link || '') + '" placeholder="example.com/landing">';
    html += '</div>';
    html += '<div class="cp-form-half"><label>Tracking params <span class="cp-text-muted" style="font-weight:400;font-size:11px">UTM query string</span></label>';
    html += '<input type="text" class="cp-input cp-v2-inline-field" data-field="creative.tracking_params" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '" value="' + esc(c.tracking_params || '') + '" placeholder="utm_source=meta&amp;utm_medium=...">';
    html += '</div></div>';
    html += '</div>';

    html += '<div class="cp-inspector-actions">';
    html += '<button class="cp-btn cp-btn-ai" data-action="ai-write-ad-copy" data-id="' + esc(ad.id) + '">' + icon('sparkles') + ' AI write copy</button>';
    html += '<button class="cp-btn cp-btn-outline" data-action="ai-improve-ad-copy" data-id="' + esc(ad.id) + '">' + icon('wand-magic') + ' Improve</button>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderAdMediaStep(ad) {
    var media = ad.media || {};
    var html = '<div class="cp-inspector-editor" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '">';

    // Creative type is fixed for the Media tab — changing it would invalidate
    // the type-specific editors and any work in progress. Pick / reset from
    // Overview → Configuration.
    var C = Constants;
    var ctype = C.META_AD_CREATIVE_TYPES[ad.creative_type] || { label: ad.creative_type || '—', icon: 'rectangle-ad' };
    html += '<div class="cp-inspector-section cp-inspector-section-compact">';
    html += '<div class="cp-creative-type-locked">';
    html += icon('lock') + ' Editing as <strong>' + esc(ctype.label) + '</strong>';
    html += '<button class="cp-btn cp-btn-text cp-btn-sm" data-action="set-inspector-tab" data-tab="overview">' + icon('arrow-left') + ' Change in Overview</button>';
    html += '</div>';
    html += '</div>';

    // Per-type editor
    if (ad.creative_type === 'single_image') {
      html += renderAdMediaImage(ad);
    } else if (ad.creative_type === 'single_video') {
      html += renderAdMediaVideo(ad);
    } else if (ad.creative_type === 'carousel') {
      html += renderAdMediaCarousel(ad);
    }

    // Structured-brief export — packages hook + copy + media direction
    // into one JSON the user can hand to an image/video tool or an
    // MCP-connected LLM.
    html += '<div class="cp-inspector-section cp-media-brief-actions" style="background:var(--cp-gray-50,#f8f9fa);border-radius:var(--cp-radius-md);padding:var(--cp-space-3);margin-top:var(--cp-space-4)">';
    html += '<div class="cp-inspector-section-title">' + icon('file-code') + ' Media brief — export';
    html += '<span class="cp-text-muted" style="font-weight:400;font-size:11px;margin-left:8px">Packages hook + copy + media direction as one structured JSON for downstream tools</span>';
    html += '</div>';
    html += '<div style="display:flex;gap:var(--cp-space-2);flex-wrap:wrap">';
    html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="preview-media-brief" data-id="' + esc(ad.id) + '">' + icon('eye') + ' Preview &amp; copy</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="copy-media-brief" data-id="' + esc(ad.id) + '">' + icon('copy') + ' Copy JSON</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="copy-media-brief-mcp" data-id="' + esc(ad.id) + '">' + icon('robot') + ' Copy as MCP brief</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="download-media-brief" data-id="' + esc(ad.id) + '">' + icon('download') + ' Download .json</button>';
    html += '</div>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderAdMediaImage(ad) {
    var img = (ad.media && ad.media.image) || {};
    // Single prompt field. Falls back to legacy ai_prompt / brief so existing
    // ads keep displaying their content; new edits write to `prompt`.
    var promptValue = img.prompt || img.ai_prompt || img.brief || '';

    var html = '';
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('image') + ' Image prompt';
    html += '<span class="cp-text-muted" style="font-weight:400;font-size:11px;margin-left:8px">Plain description or a production-grade generator prompt — used in the exported brief.</span>';
    html += '</div>';
    html += '<textarea class="cp-textarea cp-v2-inline-field" data-field="media.image.prompt" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '" rows="5" placeholder="Describe the image you want, or paste a generator prompt. Hand off via Copy JSON / MCP brief / Download below.">' + esc(promptValue) + '</textarea>';
    html += '<div class="cp-form-row" style="margin-top:var(--cp-space-2)">';
    html += '<div class="cp-form-third"><label>Aspect ratio</label>';
    html += '<select class="cp-select cp-v2-inline-field" data-field="media.image.aspect_ratio" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '">';
    var aspects = ['1:1','4:5','9:16','16:9'];
    for (var i = 0; i < aspects.length; i++) {
      var sel = (img.aspect_ratio === aspects[i]) ? ' selected' : '';
      html += '<option value="' + aspects[i] + '"' + sel + '>' + aspects[i] + '</option>';
    }
    html += '</select></div></div>';
    html += '</div>';

    html += '<div class="cp-inspector-actions">';
    html += '<button class="cp-btn cp-btn-ai" data-action="ai-generate-ad-image-prompt" data-id="' + esc(ad.id) + '">' + icon('sparkles') + ' Generate prompt from ad data</button>';
    html += '</div>';
    return html;
  }

  function renderAdMediaVideo(ad) {
    var vid = (ad.media && ad.media.video) || {};
    var sections = getAdVideoScriptSections(vid);

    var html = '';
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('video') + ' Concept</div>';
    html += '<textarea class="cp-textarea cp-v2-inline-field" data-field="media.video.concept" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '" rows="2" placeholder="One-line concept — what the video is about.">' + esc(vid.concept || '') + '</textarea>';
    html += '<div class="cp-form-row" style="margin-top:var(--cp-space-2)">';
    html += '<div class="cp-form-third"><label>Duration (s)</label>';
    html += '<input type="number" class="cp-input cp-v2-inline-field" data-field="media.video.duration_seconds" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '" min="1" max="60" value="' + esc(vid.duration_seconds || 30) + '">';
    html += '</div>';
    html += '<div class="cp-form-third"><label>Aspect ratio</label>';
    html += '<select class="cp-select cp-v2-inline-field" data-field="media.video.aspect_ratio" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '">';
    var aspects = ['9:16','1:1','16:9','4:5'];
    for (var i = 0; i < aspects.length; i++) {
      var sel = (vid.aspect_ratio === aspects[i]) ? ' selected' : '';
      html += '<option value="' + aspects[i] + '"' + sel + '>' + aspects[i] + '</option>';
    }
    html += '</select></div></div></div>';

    // Script sections
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('list-tree') + ' Script';
    html += '<span class="cp-text-muted" style="font-weight:400;font-size:11px;margin-left:8px">Add a section per beat (Hook · Setup · Payoff · CTA). Visual direction lives in your media app.</span>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="ws-ad-add-script-section" data-id="' + esc(ad.id) + '" style="margin-left:auto">' + icon('plus') + ' Add section</button>';
    html += '</div>';
    if (sections.length === 0) {
      html += '<div class="cp-text-muted">No sections yet. Add a section or use AI generate below.</div>';
    } else {
      html += '<div class="cp-v2-script-sections">';
      for (var si = 0; si < sections.length; si++) {
        var sec = sections[si];
        html += '<div class="cp-v2-script-section">';
        html += '<div class="cp-v2-script-section-header">';
        html += '<span class="cp-v2-script-section-num">' + (si + 1) + '</span>';
        html += '<input type="text" class="cp-input cp-v2-script-section-field" data-entity-id="' + esc(ad.id) + '" data-index="' + si + '" data-key="label" value="' + esc(sec.label || '') + '" placeholder="Section name (e.g., Hook)">';
        html += '<div class="cp-v2-script-section-actions">';
        html += '<button class="cp-btn-icon cp-btn-icon-sm" data-action="ws-ad-move-script-section" data-id="' + esc(ad.id) + '" data-index="' + si + '" data-dir="-1" title="Move up"' + (si === 0 ? ' disabled' : '') + '>' + icon('arrow-up') + '</button>';
        html += '<button class="cp-btn-icon cp-btn-icon-sm" data-action="ws-ad-move-script-section" data-id="' + esc(ad.id) + '" data-index="' + si + '" data-dir="1" title="Move down"' + (si === sections.length - 1 ? ' disabled' : '') + '>' + icon('arrow-down') + '</button>';
        html += '<button class="cp-btn-icon cp-btn-icon-sm" data-action="ws-ad-remove-script-section" data-id="' + esc(ad.id) + '" data-index="' + si + '" title="Remove">' + icon('trash') + '</button>';
        html += '</div></div>';
        html += '<textarea class="cp-textarea cp-v2-script-section-field" data-entity-id="' + esc(ad.id) + '" data-index="' + si + '" data-key="script" rows="3" placeholder="Write what is said and any on-screen text for this beat.">' + esc(sec.script || '') + '</textarea>';
        html += '</div>';
      }
      html += '</div>';
    }
    html += '</div>';

    html += '<div class="cp-inspector-actions">';
    html += '<button class="cp-btn cp-btn-ai" data-action="ai-generate-video-script" data-id="' + esc(ad.id) + '">' + icon('sparkles') + ' Generate script</button>';
    html += '</div>';
    return html;
  }

  // Single source of truth for the section list shown in the Video editor and
  // exported in the media brief. New ads carry `script.sections`; legacy ads
  // built with the old time/dialogue/visual rows are folded into a single
  // "Script" section so existing copy isn't lost. The migration is read-only;
  // writes always go to `script.sections`.
  function getAdVideoScriptSections(vid) {
    var script = (vid && vid.script) || {};
    if (script.sections && script.sections.length) return script.sections;
    if (script.rows && script.rows.length) {
      var combined = script.rows.map(function(r) {
        var bits = [];
        if (r.time) bits.push('[' + r.time + ']');
        if (r.dialogue) bits.push(r.dialogue);
        if (r.visual) bits.push('(visual: ' + r.visual + ')');
        return bits.join(' ');
      }).filter(Boolean).join('\n');
      return combined ? [{ label: 'Script', script: combined }] : [];
    }
    return [];
  }

  function renderAdMediaCarousel(ad) {
    var cards = (ad.media && ad.media.carousel_cards) || [];
    var html = '';
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('images') + ' Carousel cards (' + cards.length + ')';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="ws-ad-add-card" data-id="' + esc(ad.id) + '" style="margin-left:auto">' + icon('plus') + ' Add card</button>';
    html += '</div>';
    if (cards.length === 0) {
      html += '<div class="cp-text-muted">No cards yet. Meta carousels need at least 2.</div>';
    } else {
      html += '<div class="cp-v2-carousel-cards">';
      for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        html += '<div class="cp-v2-carousel-card"><div class="cp-v2-carousel-card-num">' + (i + 1) + '</div>';
        html += '<div class="cp-v2-carousel-card-fields">';
        html += '<input type="text" class="cp-input cp-v2-card-field" data-entity-id="' + esc(ad.id) + '" data-index="' + i + '" data-key="headline" value="' + esc(card.headline || '') + '" placeholder="Card headline">';
        html += '<input type="text" class="cp-input cp-v2-card-field" data-entity-id="' + esc(ad.id) + '" data-index="' + i + '" data-key="description" value="' + esc(card.description || '') + '" placeholder="Card description">';
        html += '<input type="url" class="cp-input cp-v2-card-field" data-entity-id="' + esc(ad.id) + '" data-index="' + i + '" data-key="link" value="' + esc(card.link || '') + '" placeholder="https://...">';
        html += '</div>';
        html += '<button class="cp-btn-icon cp-btn-icon-sm" data-action="ws-ad-remove-card" data-id="' + esc(ad.id) + '" data-index="' + i + '">' + icon('trash') + '</button>';
        html += '</div>';
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderAdReviewStep(ad) {
    var html = '<div class="cp-inspector-editor" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '">';

    // Status snapshot — change is in Overview tab's Configuration card.
    var C = Constants;
    var st = C.META_AD_STATUSES[ad.pipeline_status] || { label: ad.pipeline_status || '—', color: '#80868b', icon: 'circle' };
    html += '<div class="cp-inspector-section cp-inspector-section-compact">';
    html += '<div class="cp-inspector-section-title">' + icon('circle-check') + ' Current status</div>';
    html += '<div style="display:flex;align-items:center;gap:var(--cp-space-3);flex-wrap:wrap">';
    html += '<span class="cp-badge" style="background:' + st.color + '15;color:' + st.color + ';font-size:var(--cp-font-size-sm);padding:6px 12px">' + icon(st.icon) + ' ' + esc(st.label) + '</span>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="set-inspector-tab" data-tab="overview">' + icon('arrow-left') + ' Change in Overview</button>';
    html += '</div></div>';

    // Production notes + review notes are the primary purpose of this tab.
    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('note-sticky') + ' Production notes';
    html += '<span class="cp-text-muted" style="font-weight:400;font-size:11px;margin-left:8px">where assets live, who is shooting, asset URLs, etc.</span>';
    html += '</div>';
    html += '<textarea class="cp-textarea cp-v2-inline-field" data-field="production_notes" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '" rows="4" placeholder="Where assets live, who is shooting, etc.">' + esc(ad.production_notes || '') + '</textarea>';
    html += '</div>';

    html += '<div class="cp-inspector-section">';
    html += '<div class="cp-inspector-section-title">' + icon('comments') + ' Review notes';
    html += '<span class="cp-text-muted" style="font-weight:400;font-size:11px;margin-left:8px">feedback from reviewers, change requests, approval comments</span>';
    html += '</div>';
    html += '<textarea class="cp-textarea cp-v2-inline-field" data-field="review_notes" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '" rows="5" placeholder="Feedback from reviewers...">' + esc(ad.review_notes || '') + '</textarea>';
    html += '</div>';

    return html;
  }

  // --- Persistent CP Inspector header (rendered on every Ad tab) ---
  //
  // Lifted from the Overview-only identity block so name, creative-type
  // chip, status, and primary actions stay visible while editing
  // Hook/Copy/Media/Review. The status badge is replaced by a
  // dropdown that lets the user override pipeline_status manually
  // (forward or backward); auto-advance continues to run on field saves
  // via `maybeAdvanceAdStatus`. Items are grouped Workflow / Review so
  // it's clear which stages are normally auto-managed.

  function renderAdInspectorHeader(ad) {
    var C = Constants;
    var adSet = S.adSetMap[ad.ad_set_id];
    var camp  = adSet ? S.campaignV2Map[adSet.campaign_id] : null;
    var ctype = C.META_AD_CREATIVE_TYPES[ad.creative_type] || { label: 'Ad', icon: 'rectangle-ad' };
    var status = C.META_AD_STATUSES[ad.pipeline_status] || { label: ad.pipeline_status || '—', color: '#80868b', icon: 'circle', key: ad.pipeline_status };
    var crumb = (camp ? esc(camp.name) + ' · ' : '') + (adSet ? esc(adSet.name) : '');

    var html = '<div class="cp-inspector-header cp-ad-inspector-header"><div class="cp-ad-inspector-header-main">';
    html += '<div class="cp-inspector-eyebrow">' + icon(ctype.icon) + ' ' + esc(ctype.label) + (crumb ? ' · ' + crumb : '') + '</div>';
    html += '<input type="text" class="cp-inspector-title-input cp-v2-inline-field" data-field="name" data-entity-type="ad" data-entity-id="' + esc(ad.id) + '" value="' + esc(ad.name || '') + '" placeholder="Ad name">';
    html += renderAdReadinessPill(ad);
    html += '</div>';

    html += '<div class="cp-ad-inspector-header-side">';
    html += renderAdStatusDropdown(ad, status);
    html += '<div class="cp-inspector-header-actions">';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="v2-copy-ad-field" data-id="' + esc(ad.id) + '" data-field="all" title="Copy all ad fields">' + icon('copy') + '</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="delete-ad" data-id="' + esc(ad.id) + '" title="Delete ad">' + icon('trash') + '</button>';
    html += '</div>';
    html += '</div></div>';
    return html;
  }

  function renderAdReadinessPill(ad) {
    var steps = [
      { key: 'hook',   label: 'Hook',   done: isAdHookDone(ad) },
      { key: 'copy',   label: 'Copy',   done: isAdCopyDone(ad) },
      { key: 'media',  label: 'Media',  done: isAdMediaDone(ad) },
      { key: 'review', label: 'Review', done: isAdReviewDone(ad) }
    ];
    var html = '<div class="cp-ad-readiness" title="Step completion — drives auto-advance">';
    for (var i = 0; i < steps.length; i++) {
      var s = steps[i];
      var cls = 'cp-ad-readiness-step' + (s.done ? ' cp-ad-readiness-step-done' : '');
      html += '<span class="' + cls + '">' + icon(s.done ? 'circle-check' : 'circle') + ' ' + esc(s.label) + '</span>';
      if (i < steps.length - 1) html += '<span class="cp-ad-readiness-sep">·</span>';
    }
    html += '</div>';
    return html;
  }

  function renderAdStatusDropdown(ad, status) {
    var C = Constants;
    var workflowKeys = ['hook_ready', 'copy_ready', 'media_ready'];
    var reviewKeys   = ['in_review', 'approved', 'live', 'paused', 'archived'];

    function renderItem(key) {
      var st = C.META_AD_STATUSES[key];
      if (!st) return '';
      var active = (ad.pipeline_status === key) ? ' cp-status-dropdown-item-active' : '';
      return '<button type="button" class="cp-status-dropdown-item' + active + '" role="menuitem" data-action="ws-set-ad-status" data-id="' + esc(ad.id) + '" data-status="' + key + '" style="--status-color:' + st.color + '">' +
             '<span class="cp-status-dropdown-item-dot" style="background:' + st.color + '"></span>' +
             icon(st.icon) + '<span class="cp-status-dropdown-item-label">' + esc(st.label) + '</span>' +
             '</button>';
    }

    var html = '<div class="cp-status-dropdown" data-ad-id="' + esc(ad.id) + '">';
    html += '<button type="button" class="cp-status-dropdown-trigger" data-action="ws-status-dropdown-toggle" aria-haspopup="menu" aria-expanded="false" style="--status-color:' + status.color + '">';
    html += '<span class="cp-status-dropdown-dot" style="background:' + status.color + '"></span>';
    html += icon(status.icon) + '<span class="cp-status-dropdown-label">' + esc(status.label) + '</span>';
    html += icon('caret-down') + '</button>';
    html += '<div class="cp-status-dropdown-menu" role="menu">';
    html += '<div class="cp-status-dropdown-group-label">' + icon('robot') + ' Workflow <span class="cp-text-muted" style="font-weight:400">· auto-advances</span></div>';
    for (var i = 0; i < workflowKeys.length; i++) html += renderItem(workflowKeys[i]);
    html += '<div class="cp-status-dropdown-divider"></div>';
    html += '<div class="cp-status-dropdown-group-label">' + icon('user-check') + ' Review</div>';
    for (var j = 0; j < reviewKeys.length; j++) html += renderItem(reviewKeys[j]);
    html += '</div></div>';
    return html;
  }

  // --- Ad workflow tabs (Overview pill + Hook→Copy→Media→Review stepper) ---
  //
  // Replaces the old separate "tab bar + pipeline progress strip" duplication:
  // the tab strip itself now visualizes pipeline progress. Completed steps
  // show a green check marker, the active tab is highlighted, todo steps are
  // dimmed. Connectors between markers reinforce the workflow direction.

  function renderAdWorkflowTabs(ad, activeTab) {
    var steps = Constants.META_AD_PIPELINE_STEPS;
    var done = {
      hook:   isAdHookDone(ad),
      copy:   isAdCopyDone(ad),
      media:  isAdMediaDone(ad),
      review: isAdReviewDone(ad)
    };

    var html = '<div class="cp-ad-workflow-tabs">';

    var overviewCls = 'cp-ad-workflow-overview' + (activeTab === 'overview' ? ' cp-ad-workflow-overview-active' : '');
    html += '<button class="' + overviewCls + '" data-action="set-inspector-tab" data-tab="overview" role="tab" aria-selected="' + (activeTab === 'overview' ? 'true' : 'false') + '">';
    html += icon('eye') + '<span class="cp-ad-workflow-overview-label">Overview</span>';
    html += '</button>';

    html += '<div class="cp-ad-workflow-divider" aria-hidden="true"></div>';

    html += '<div class="cp-ad-workflow-steps" role="tablist">';
    for (var i = 0; i < steps.length; i++) {
      var step = steps[i];
      var isActive = (activeTab === step.key);
      var isDone = !!done[step.key];
      var cls = 'cp-ad-workflow-step';
      if (isDone) cls += ' cp-ad-workflow-step-done';
      if (isActive) cls += ' cp-ad-workflow-step-active';

      html += '<button class="' + cls + '" data-action="set-inspector-tab" data-tab="' + step.key + '" role="tab" aria-selected="' + (isActive ? 'true' : 'false') + '">';
      html += '<span class="cp-ad-workflow-step-marker">' + icon(isDone ? 'circle-check' : step.icon) + '</span>';
      html += '<span class="cp-ad-workflow-step-label">' + esc(step.label) + '</span>';
      html += '</button>';

      if (i < steps.length - 1) {
        html += '<div class="cp-ad-workflow-connector' + (isDone ? ' cp-ad-workflow-connector-done' : '') + '" aria-hidden="true"></div>';
      }
    }
    html += '</div>';

    html += '</div>';
    return html;
  }

  // --- Per-step completion helpers (single source of truth) ---
  //
  // Used by renderAdWorkflowTabs for the visual stepper and by
  // evaluateAdAutoStatus for promoting pipeline_status. Keep these in lockstep.

  function isAdHookDone(ad) {
    var t = (ad && ad.hook && ad.hook.text) || '';
    return t.trim().length >= 3;
  }

  function isAdCopyDone(ad) {
    var c = (ad && ad.creative) || {};
    var hasBody = (c.primary_text || '').trim().length >= 20;
    var hasHeadline = !!(((c.headline || '').trim()) || ((c.description || '').trim()));
    var hasLink = (c.cta_link || '').trim().length > 0;
    return hasBody && hasHeadline && hasLink;
  }

  function isAdMediaDone(ad) {
    if (!ad) return false;
    var media = ad.media || {};
    if (ad.creative_type === 'single_image') {
      var img = media.image || {};
      var p = (img.prompt || img.ai_prompt || img.brief || '').trim();
      return !!(img.asset_id || p.length > 10);
    } else if (ad.creative_type === 'single_video') {
      var vid = media.video || {};
      if (vid.asset_id || (vid.concept || '').trim()) return true;
      var sections = (vid.script && vid.script.sections) || [];
      for (var s = 0; s < sections.length; s++) {
        if ((sections[s].label || '').trim() || (sections[s].script || '').trim()) return true;
      }
      // Back-compat: legacy ads still satisfy "done" via rows or scenes.
      if (vid.script && vid.script.rows && vid.script.rows.length) return true;
      if (vid.blueprint && vid.blueprint.scenes && vid.blueprint.scenes.length) return true;
      return false;
    } else if (ad.creative_type === 'carousel') {
      return !!(media.carousel_cards && media.carousel_cards.length >= 2);
    }
    return false;
  }

  function isAdReviewDone(ad) {
    if (!ad) return false;
    var s = ad.pipeline_status;
    return s === 'in_review' || s === 'approved' || s === 'live' || s === 'paused' || s === 'archived';
  }

  // True iff no media-bearing field has any user content. Used to decide
  // whether the Overview creative-type selector is editable (untouched) or
  // shown locked with a "Reset" CTA (any media content exists).
  function isAdMediaUntouched(ad) {
    if (!ad) return true;
    var m = ad.media || {};
    var img = m.image || {};
    if ((img.prompt || '').trim() || (img.ai_prompt || '').trim() || (img.brief || '').trim() || img.asset_id || (img.negative_prompt || '').trim()) return false;
    var vid = m.video || {};
    if ((vid.concept || '').trim() || vid.asset_id) return false;
    var vidSections = (vid.script && vid.script.sections) || [];
    for (var vsi = 0; vsi < vidSections.length; vsi++) {
      if ((vidSections[vsi].label || '').trim() || (vidSections[vsi].script || '').trim()) return false;
    }
    if (vid.script && vid.script.rows && vid.script.rows.length) return false;
    if (vid.blueprint && vid.blueprint.scenes && vid.blueprint.scenes.length) return false;
    if (m.carousel_cards && m.carousel_cards.length) return false;
    return true;
  }

  // --- Inspector tab bar (shared) ---

  function renderInspectorTabs(tabs, active) {
    var html = '<div class="cp-inspector-tabs">';
    for (var i = 0; i < tabs.length; i++) {
      var t = tabs[i];
      var cls = (active === t.key) ? ' cp-inspector-tab-active' : '';
      html += '<button class="cp-inspector-tab' + cls + '" data-action="set-inspector-tab" data-tab="' + t.key + '">';
      html += icon(t.icon) + ' ' + esc(t.label);
      html += '</button>';
    }
    html += '</div>';
    return html;
  }

  // --- Snapshot divergence helpers (for Stage 3 re-sync UI) ---

  // Returns true if the library persona has been updated since the snapshot
  // was captured on this Ad Set.
  function isPersonaSnapshotStale(adSet) {
    if (!adSet || !adSet.persona_id || !adSet.persona_snapshot) return false;
    var src = S.personaMap[adSet.persona_id];
    if (!src) return false;
    var libUpdated = src.updated || src.created || '';
    var snapWhen = adSet.persona_snapshot.source_updated || '';
    return libUpdated && snapWhen && libUpdated > snapWhen;
  }

  function isMessageSnapshotStale(ad) {
    if (!ad || !ad.message_snapshot || !ad.hook || !ad.hook.source_message_id) return false;
    var src = S.messageMap[ad.hook.source_message_id];
    if (!src) return false;
    var libUpdated = src.updated || src.created || '';
    var snapWhen = ad.message_snapshot.source_updated || '';
    return libUpdated && snapWhen && libUpdated > snapWhen;
  }

  // --- Ad auto-status engine ---

  // Promotes ad.pipeline_status forward only — never backward. Evaluates
  // the fields in order: hook_ready → copy_ready → media_ready. The remaining
  // statuses (in_review/approved/live/paused/archived) are manual transitions.
  function evaluateAdAutoStatus(ad) {
    if (!ad) return null;
    var C = Constants;
    var order = C.META_AD_STATUS_ORDER;
    var currentIdx = order.indexOf(ad.pipeline_status);
    if (currentIdx < 0) return null;

    var suggested = ad.pipeline_status;

    function bump(target) {
      var ti = order.indexOf(target);
      var si = order.indexOf(suggested);
      if (ti > si) suggested = target;
    }

    if (isAdHookDone(ad))  bump('hook_ready');
    if (isAdCopyDone(ad))  bump('copy_ready');
    if (isAdMediaDone(ad)) bump('media_ready');

    return suggested === ad.pipeline_status ? null : suggested;
  }

  function maybeAdvanceAdStatus(ad, reason) {
    if (!ad) return false;
    var suggested = evaluateAdAutoStatus(ad);
    if (!suggested) return false;
    var C = Constants;
    var order = C.META_AD_STATUS_ORDER;
    var ci = order.indexOf(ad.pipeline_status), si = order.indexOf(suggested);
    if (si <= ci) return false;

    var oldLabel = (C.META_AD_STATUSES[ad.pipeline_status] || {}).label || ad.pipeline_status;
    var newLabel = (C.META_AD_STATUSES[suggested] || {}).label || suggested;
    ad.pipeline_status = suggested;
    ad.updated = new Date().toISOString();
    logActivity('ad_status_changed', 'ad', ad.id, ad.name, oldLabel + ' → ' + newLabel + (reason ? ' (' + reason + ')' : ''));
    toast('Auto-advanced to ' + newLabel + (reason ? ' — ' + reason : ''), 'success', 4000);
    return true;
  }
