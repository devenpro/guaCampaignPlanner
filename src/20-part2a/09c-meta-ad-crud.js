  // ============================================================
  // SECTION 9C: META AD CRUD
  // ============================================================
  //
  // Two flows:
  //   * Create — quick modal asks for just name + creative_type, then
  //     navigates to the workspace inspector where the user fills out
  //     hook / copy / media / review inline.
  //   * Edit — no modal at all; the edit-ad action navigates to the
  //     workspace inspector. This function only runs as a legacy
  //     fallback if the inspector context isn't available.

  function openMetaAdQuickCreate(adSetId) {
    var C = Constants;
    var adSet = getAdSet(adSetId);
    if (!adSet) { toast('Parent ad set not found', 'error'); return; }
    var camp = getCampaignV2(adSet.campaign_id);
    var existingCount = (getAdsByAdSet ? getAdsByAdSet(adSetId).length : 0);
    var defaultName = adSet.name + ' — Ad ' + (existingCount + 1);

    var html = '<div class="cp-editor-form">';
    html += '<div class="cp-modal-context">';
    if (camp) html += icon('bullhorn') + ' ' + esc(camp.name) + ' · ';
    html += icon('crosshairs') + ' ' + esc(adSet.name) + '</div>';
    html += '<div class="cp-form-group"><label>Ad Name <span class="cp-required">*</span></label>';
    html += '<input type="text" class="cp-input" data-field="name" value="' + esc(defaultName) + '" autocomplete="off">';
    html += '</div>';
    html += '<div class="cp-form-group"><label>Creative type</label>';
    html += '<div class="cp-segmented">';
    for (var ctk in C.META_AD_CREATIVE_TYPES) {
      var ct = C.META_AD_CREATIVE_TYPES[ctk];
      var ctSel = (ctk === 'single_image') ? ' cp-segmented-active' : '';
      html += '<label class="cp-segmented-option' + ctSel + '">';
      html += '<input type="radio" name="cp-v2-ad-qc-creative-type" data-field="creative_type" value="' + ctk + '"' + (ctSel ? ' checked' : '') + ' style="display:none">';
      html += icon(ct.icon) + ' ' + esc(ct.label);
      html += '</label>';
    }
    html += '</div></div>';
    html += '<p class="cp-form-help">After create, you\'ll be taken to the Ad\'s workspace where Hook, Copy, Media, and Review are inline-editable.</p>';
    html += '</div>';

    openModal('New Ad', html, {
      titleIcon: 'rectangle-ad', size: 'sm', saveLabel: 'Create & open',
      onSave: function() {
        var fields = collectModalFields();
        var name = (fields.name || '').trim();
        if (!name) { toast('Ad name is required', 'warning'); return; }
        var creativeType = $('input[name="cp-v2-ad-qc-creative-type"]:checked').val() || 'single_image';
        snapshot('Create Ad');
        var created = createEntity('ad', { ad_set_id: adSetId, name: name, creative_type: creativeType });
        closeModal();
        if (created) {
          S.selectedCampaignV2Id = adSet.campaign_id;
          S.selectedAdSetId = adSetId;
          S.selectedAdId = created.id;
          S.workspaceInspectorTab = 'hook';
          navigate('campaign_workspace', { hash: 'campaign/' + adSet.campaign_id + '/ad_set/' + adSetId + '/ad/' + created.id });
        }
      }
    });
  }

  // Legacy full-form edit modal — kept as a fallback only. The inline
  // workspace inspector is the primary editing surface.
  function openMetaAdModal(adIdOrAdSetId, opts) {
    opts = opts || {};
    // Quick-create branch
    if (opts.create) { openMetaAdQuickCreate(adIdOrAdSetId); return; }
    var C = Constants;
    var ad = getAd(adIdOrAdSetId);
    var adSetId = ad && ad.ad_set_id;
    var adSet = getAdSet(adSetId);

    if (!adSet) { toast('Parent ad set not found', 'error'); return; }
    var camp = getCampaignV2(adSet.campaign_id);
    var isEdit = true;

    var a = ad || {};
    var creative = a.creative || {};
    var hook = a.hook || {};
    var media = a.media || {};
    var img = media.image || {};
    var vid = media.video || {};

    var html = '<div class="cp-editor-form">';

    // Context banner
    html += '<div class="cp-modal-context">';
    if (camp) html += icon('bullhorn') + ' ' + esc(camp.name) + ' · ';
    html += icon('crosshairs') + ' ' + esc(adSet.name) + '</div>';

    // --- Section: Basics ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('clipboard-list') + ' Basics</div>';
    html += '<div class="cp-form-row"><div class="cp-form-grow"><label>Ad Name <span class="cp-required">*</span></label>';
    html += '<input type="text" class="cp-input" data-field="name" value="' + esc(a.name || '') + '" placeholder="e.g., Lookalike — Bold ROI hook">';
    html += '</div><div class="cp-form-third"><label>Pipeline status</label>';
    html += '<select class="cp-select" data-field="pipeline_status">';
    for (var stk in C.META_AD_STATUSES) {
      var stSel = (a.pipeline_status === stk) || (!isEdit && stk === 'hook_ready') ? ' selected' : '';
      html += '<option value="' + stk + '"' + stSel + '>' + esc(C.META_AD_STATUSES[stk].label) + '</option>';
    }
    html += '</select></div></div>';

    html += '<div class="cp-form-group"><label>Creative type</label>';
    html += '<div class="cp-segmented">';
    for (var ctk in C.META_AD_CREATIVE_TYPES) {
      var ct = C.META_AD_CREATIVE_TYPES[ctk];
      var ctSel = (a.creative_type === ctk) || (!isEdit && ctk === 'single_image') ? ' cp-segmented-active' : '';
      html += '<label class="cp-segmented-option' + ctSel + '">';
      html += '<input type="radio" name="cp-v2-ad-creative-type" data-field="creative_type" value="' + ctk + '"' + (ctSel ? ' checked' : '') + ' style="display:none">';
      html += icon(ct.icon) + ' ' + esc(ct.label);
      html += '</label>';
    }
    html += '</div></div></div>';

    // --- Section: Hook ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('anchor') + ' Hook';
    html += '<span class="cp-text-muted" style="font-weight:400;font-size:11px;margin-left:8px">Polish layer — first 3 words decide everything</span>';
    html += '</div>';
    html += '<div class="cp-form-row"><div class="cp-form-grow"><label>Hook text</label>';
    html += '<textarea class="cp-textarea" data-field="hook.text" rows="2" placeholder="e.g., Stop wasting 40% of your ad spend on the wrong audience.">' + esc(hook.text || '') + '</textarea>';
    html += '</div><div class="cp-form-third"><label>Hook type</label>';
    html += '<select class="cp-select" data-field="hook.type">';
    var hookTypes = ['question','bold','story','data','direct','curiosity','challenge'];
    for (var hti = 0; hti < hookTypes.length; hti++) {
      var ht = hookTypes[hti];
      var htSel = (hook.type === ht) || (!isEdit && ht === 'direct') ? ' selected' : '';
      html += '<option value="' + ht + '"' + htSel + '>' + esc(ht.charAt(0).toUpperCase() + ht.slice(1)) + '</option>';
    }
    html += '</select></div></div></div>';

    // --- Section: Copy ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('pen-fancy') + ' Copy</div>';
    html += '<div class="cp-form-group"><label>Primary text <span class="cp-text-muted" style="font-weight:400">(125 chars recommended)</span></label>';
    html += '<textarea class="cp-textarea" data-field="creative.primary_text" rows="3" placeholder="The main body copy that appears above your media.">' + esc(creative.primary_text || '') + '</textarea></div>';
    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Headline <span class="cp-text-muted" style="font-weight:400">(27 chars)</span></label>';
    html += '<input type="text" class="cp-input" data-field="creative.headline" value="' + esc(creative.headline || '') + '" maxlength="60">';
    html += '</div><div class="cp-form-half"><label>Description <span class="cp-text-muted" style="font-weight:400">(27 chars)</span></label>';
    html += '<input type="text" class="cp-input" data-field="creative.description" value="' + esc(creative.description || '') + '" maxlength="60">';
    html += '</div></div></div>';

    // --- Section: Destination ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('link') + ' Destination</div>';
    html += '<div class="cp-form-row"><div class="cp-form-third"><label>Call to action</label>';
    html += '<select class="cp-select" data-field="creative.cta_type">';
    for (var ctak in C.META_CTA_TYPES) {
      var ctaSel = (creative.cta_type === ctak) || (!isEdit && ctak === 'LEARN_MORE') ? ' selected' : '';
      html += '<option value="' + ctak + '"' + ctaSel + '>' + esc(C.META_CTA_TYPES[ctak].label) + '</option>';
    }
    html += '</select></div><div class="cp-form-grow"><label>Destination link</label>';
    html += '<input type="url" class="cp-input" data-field="creative.cta_link" value="' + esc(creative.cta_link || '') + '" placeholder="https://example.com/landing">';
    html += '</div></div>';
    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Display link <span class="cp-text-muted" style="font-weight:400">(optional)</span></label>';
    html += '<input type="text" class="cp-input" data-field="creative.display_link" value="' + esc(creative.display_link || '') + '" placeholder="example.com/sale">';
    html += '</div><div class="cp-form-half"><label>Tracking params <span class="cp-text-muted" style="font-weight:400">(utm_*)</span></label>';
    html += '<input type="text" class="cp-input" data-field="creative.tracking_params" value="' + esc(creative.tracking_params || '') + '" placeholder="utm_source=meta&utm_campaign=...">';
    html += '</div></div></div>';

    // --- Section: Media brief (basic — full editor in Stage 2) ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('image') + ' Media brief';
    html += '<span class="cp-text-muted" style="font-weight:400;font-size:11px;margin-left:8px">Detailed editor lands in Stage 2</span>';
    html += '</div>';

    // Single image fields
    html += '<div class="cp-v2-media-image" data-show-for="single_image">';
    html += '<div class="cp-form-group"><label>Image brief</label>';
    html += '<textarea class="cp-textarea" data-field="media.image.brief" rows="2" placeholder="What should the image show? Mood, subject, composition...">' + esc(img.brief || '') + '</textarea></div>';
    html += '<div class="cp-form-row"><div class="cp-form-grow"><label>AI image prompt</label>';
    html += '<textarea class="cp-textarea" data-field="media.image.ai_prompt" rows="2" placeholder="Auto-generated or hand-crafted Midjourney / SDXL / Imagen prompt.">' + esc(img.ai_prompt || '') + '</textarea>';
    html += '</div><div class="cp-form-third"><label>Aspect ratio</label>';
    html += '<select class="cp-select" data-field="media.image.aspect_ratio">';
    var imgAspects = ['1:1','4:5','9:16','16:9'];
    for (var iai = 0; iai < imgAspects.length; iai++) {
      var ia = imgAspects[iai];
      var iaSel = (img.aspect_ratio === ia) || (!isEdit && ia === '1:1') ? ' selected' : '';
      html += '<option value="' + ia + '"' + iaSel + '>' + ia + '</option>';
    }
    html += '</select></div></div></div>';

    // Single video fields
    html += '<div class="cp-v2-media-video" data-show-for="single_video" style="display:none">';
    html += '<div class="cp-form-group"><label>Video concept</label>';
    html += '<textarea class="cp-textarea" data-field="media.video.concept" rows="2" placeholder="One-line concept — what happens in the video.">' + esc(vid.concept || '') + '</textarea></div>';
    html += '<div class="cp-form-row"><div class="cp-form-third"><label>Duration (s)</label>';
    html += '<input type="number" class="cp-input" data-field="media.video.duration_seconds" min="1" max="60" value="' + esc(vid.duration_seconds || 30) + '">';
    html += '</div><div class="cp-form-third"><label>Aspect ratio</label>';
    html += '<select class="cp-select" data-field="media.video.aspect_ratio">';
    var vidAspects = ['9:16','1:1','16:9','4:5'];
    for (var vai = 0; vai < vidAspects.length; vai++) {
      var va = vidAspects[vai];
      var vaSel = (vid.aspect_ratio === va) || (!isEdit && va === '9:16') ? ' selected' : '';
      html += '<option value="' + va + '"' + vaSel + '>' + va + '</option>';
    }
    html += '</select></div></div></div>';

    // Carousel — Stage 2 will build proper cards editor
    html += '<div class="cp-v2-media-carousel" data-show-for="carousel" style="display:none">';
    html += '<div class="cp-form-hint">Carousel cards editor lands in Stage 2. For now, save this Ad and the cards array will initialise empty.</div>';
    html += '</div>';

    html += '</div>';

    // --- Section: Review & production ---
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('clipboard-list') + ' Review & production</div>';
    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Assigned to</label>';
    html += '<input type="text" class="cp-input" data-field="assigned_to" value="' + esc(a.assigned_to || '') + '" placeholder="Teammate name or email">';
    html += '</div><div class="cp-form-half"><label>Due date</label>';
    html += '<input type="date" class="cp-input" data-field="due_date" value="' + esc(a.due_date || '') + '">';
    html += '</div></div>';
    html += '<div class="cp-form-group"><label>Production notes</label>';
    html += '<textarea class="cp-textarea" data-field="production_notes" rows="2" placeholder="Where assets live, who is shooting, etc.">' + esc(a.production_notes || '') + '</textarea></div>';
    html += '<div class="cp-form-group"><label>Review notes</label>';
    html += '<textarea class="cp-textarea" data-field="review_notes" rows="2" placeholder="Feedback from reviewers...">' + esc(a.review_notes || '') + '</textarea></div>';
    html += '</div>';

    html += '</div>';

    openModal(isEdit ? 'Edit Ad' : 'New Ad', html, {
      titleIcon: 'rectangle-ad',
      size: 'lg',
      saveLabel: isEdit ? 'Save Ad' : 'Create Ad',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.name || !fields.name.trim()) { toast('Ad name is required', 'warning'); return; }
        // creative_type is a radio — pick the checked one
        var creativeType = $('input[name="cp-v2-ad-creative-type"]:checked').val() || 'single_image';

        var payload = {
          ad_set_id: adSetId,
          name: fields.name.trim(),
          pipeline_status: fields.pipeline_status || 'hook_ready',
          creative_type: creativeType,
          creative: {
            primary_text: fields['creative.primary_text'] || '',
            headline: fields['creative.headline'] || '',
            description: fields['creative.description'] || '',
            cta_type: fields['creative.cta_type'] || 'LEARN_MORE',
            cta_link: fields['creative.cta_link'] || '',
            display_link: fields['creative.display_link'] || '',
            tracking_params: fields['creative.tracking_params'] || ''
          },
          hook: {
            source_message_id: hook.source_message_id || '',
            selected_hook_id: hook.selected_hook_id || '',
            text: fields['hook.text'] || '',
            type: fields['hook.type'] || 'direct'
          },
          media: {
            image: $.extend({}, img, {
              brief: fields['media.image.brief'] || '',
              ai_prompt: fields['media.image.ai_prompt'] || '',
              aspect_ratio: fields['media.image.aspect_ratio'] || '1:1'
            }),
            video: $.extend({}, vid, {
              concept: fields['media.video.concept'] || '',
              duration_seconds: fields['media.video.duration_seconds'] !== '' ? Number(fields['media.video.duration_seconds']) : 30,
              aspect_ratio: fields['media.video.aspect_ratio'] || '9:16'
            }),
            carousel_cards: media.carousel_cards || []
          },
          assigned_to: fields.assigned_to || '',
          due_date: fields.due_date || '',
          production_notes: fields.production_notes || '',
          review_notes: fields.review_notes || ''
        };

        if (isEdit) {
          snapshot('Edit Ad');
          for (var k in payload) saveEntityField('ad', adIdOrAdSetId, k, payload[k]);
          toast('Ad saved', 'success');
        } else {
          snapshot('Create Ad');
          var created = createEntity('ad', payload);
          if (created) {
            S.selectedCampaignV2Id = adSet.campaign_id;
            S.selectedAdSetId = adSetId;
            S.selectedAdId = created.id;
            navigate('campaign_workspace', { hash: 'campaign/' + adSet.campaign_id + '/ad_set/' + adSetId + '/ad/' + created.id });
          }
        }
        closeModal();
      }
    });

    // Wire up creative-type toggling (show/hide media sub-sections)
    $(document).off('change.cp-v2-ad-ctype').on('change.cp-v2-ad-ctype', 'input[name="cp-v2-ad-creative-type"]', function() {
      var v = $(this).val();
      $('.cp-segmented-option').removeClass('cp-segmented-active');
      $(this).closest('.cp-segmented-option').addClass('cp-segmented-active');
      $('[data-show-for]').each(function() {
        $(this).toggle($(this).data('show-for') === v);
      });
    });
  }

  function confirmDeleteMetaAd(adId) {
    var a = getAd(adId);
    if (!a) return;
    openConfirmDialog({
      title: 'Delete Ad',
      message: 'Delete "' + a.name + '"?',
      confirmLabel: 'Delete', danger: true,
      onConfirm: function() {
        snapshot('Delete Ad');
        var setId = a.ad_set_id;
        var adSet = getAdSet(setId);
        deleteEntity('ad', adId);
        if (S.currentView === 'campaign_workspace' && adSet) {
          navigate('campaign_workspace', { hash: 'campaign/' + adSet.campaign_id + '/ad_set/' + setId });
        }
      }
    });
  }
