  // ============================================================
  // SECTION 20: IMAGES VIEW
  // ============================================================

  function renderImagesView() {
    var cats = (S.meta && S.meta.image_categories) || [];
    var imgs = getImages(S.imageFilter);
    var allImgTagsList = getAllImageTags();

    var html = '<div class="cp-view cp-view-images">';
    html += '<div class="cp-view-header"><div class="cp-view-header-left"><h1>' + icon('images') + ' Reference Images</h1>';
    html += '<span class="cp-view-subtitle">' + (S.images || []).length + ' image' + ((S.images || []).length !== 1 ? 's' : '') + '</span></div>';
    html += '<div class="cp-view-header-right">';
    html += '<button class="cp-btn cp-btn-primary" data-action="upload-image">' + icon('upload') + ' Upload</button>';
    html += '</div></div>';

    // Filter bar
    html += '<div class="cp-img-filters">';
    html += '<div class="cp-search-wrapper"><span class="cp-icon">' + icon('search') + '</span>';
    html += '<input type="text" class="cp-input" id="cpImgSearch" placeholder="Search images..." value="' + esc((S.imageFilter && S.imageFilter.search) || '') + '"></div>';
    html += '<select class="cp-select cp-select-sm cp-img-filter" data-filter="category"><option value="">All Categories</option>';
    for (var ci = 0; ci < cats.length; ci++) html += '<option value="' + esc(cats[ci].id) + '"' + ((S.imageFilter && S.imageFilter.category) === cats[ci].id ? ' selected' : '') + '>' + esc(cats[ci].label) + '</option>';
    html += '</select>';
    if (allImgTagsList.length > 0) {
      html += '<select class="cp-select cp-select-sm cp-img-filter" data-filter="tag"><option value="">All Tags</option>';
      for (var ti = 0; ti < allImgTagsList.length; ti++) html += '<option value="' + esc(allImgTagsList[ti]) + '"' + ((S.imageFilter && S.imageFilter.tag) === allImgTagsList[ti] ? ' selected' : '') + '>' + esc(allImgTagsList[ti]) + '</option>';
      html += '</select>';
    }
    html += '<button class="cp-btn cp-btn-sm' + ((S.imageFilter && S.imageFilter.star) ? ' cp-btn-primary' : ' cp-btn-outline') + '" data-action="toggle-img-star-filter">' + icon('star') + ' Starred</button>';
    html += '</div>';

    // Gallery
    if (imgs.length === 0) {
      html += '<div class="cp-empty-state"><div class="cp-empty-state-icon">' + icon('images') + '</div>';
      if (!S.images || S.images.length === 0) {
        if (!S.$imageField || !S.$imageField.length) {
          html += '<div class="cp-empty-state-title">Image field not configured</div>';
          html += '<div class="cp-empty-state-text">To use reference images, add a <strong>field_images</strong> (Image, multi-value) field to your Campaign Planner content type in Drupal. Then upload images on this node.</div>';
          html += '<div class="cp-card" style="margin-top:var(--cp-space-3);padding:var(--cp-space-3);text-align:left;max-width:400px;margin-left:auto;margin-right:auto">';
          html += '<div class="cp-field-label">Drupal Setup Steps</div>';
          html += '<ol style="margin:var(--cp-space-2) 0 0;padding-left:var(--cp-space-4);font-size:var(--cp-font-size-sm);color:var(--cp-text-secondary);line-height:1.8">';
          html += '<li>Go to Admin → Structure → Content types → Campaign Planner → Manage fields</li>';
          html += '<li>Add field: <strong>field_images</strong> (type: Image, cardinality: Unlimited)</li>';
          html += '<li>Save, then reload this page</li>';
          html += '</ol></div>';
        } else {
          html += '<div class="cp-empty-state-title">No reference images yet</div>';
          html += '<div class="cp-empty-state-text">Upload brand reference images to build your visual library. These can be used in recipe creative briefs, AI image prompts, and campaign creative direction.</div>';
          html += '<button class="cp-btn cp-btn-primary" data-action="upload-image">' + icon('upload') + ' Upload First Image</button>';
        }
      } else {
        html += '<div class="cp-empty-state-title">No matches</div>';
        html += '<div class="cp-empty-state-text">Try adjusting your filters.</div>';
      }
      html += '</div>';
    } else {
      html += '<div style="display:flex;gap:var(--cp-space-4)">';
      html += '<div style="flex:1"><div class="cp-img-grid">';
      for (var gi = 0; gi < imgs.length; gi++) html += renderImageCard(imgs[gi]);
      html += '</div></div>';

      // Detail panel
      if (S.selectedImageId) {
        var selImg = S.imageMap[S.selectedImageId];
        if (selImg) {
          var meta = (S.meta.reference_images && S.meta.reference_images[selImg.fid]) || {};
          html += '<div class="cp-img-detail">';
          html += '<div class="cp-img-detail-preview"><img src="' + esc(selImg.url) + '" alt="' + esc(selImg.filename) + '"></div>';
          html += '<h3 style="margin-bottom:var(--cp-space-2)">' + esc(selImg.filename) + '</h3>';
          html += '<div class="cp-form-group"><label class="cp-field-label">Category</label>';
          html += '<select class="cp-select cp-img-meta-field" data-meta-field="category">';
          html += '<option value="">None</option>';
          for (var mci = 0; mci < cats.length; mci++) html += '<option value="' + esc(cats[mci].id) + '"' + (meta.category === cats[mci].id ? ' selected' : '') + '>' + esc(cats[mci].label) + '</option>';
          html += '</select></div>';
          html += '<div class="cp-form-group"><label class="cp-field-label">Description</label>';
          html += '<textarea class="cp-textarea cp-img-meta-field" data-meta-field="description" rows="2" placeholder="Describe this image...">' + esc(meta.description || '') + '</textarea></div>';
          html += '<div class="cp-form-group"><label class="cp-field-label">Tags (comma-separated)</label>';
          html += '<input type="text" class="cp-input cp-img-meta-field" data-meta-field="tags" value="' + esc((meta.tags || []).join(', ')) + '" placeholder="studio, product, lifestyle"></div>';
          html += '<div style="margin-top:var(--cp-space-2)"><label style="display:flex;align-items:center;gap:var(--cp-space-2);cursor:pointer"><input type="checkbox" class="cp-img-meta-field" data-meta-field="star"' + (meta.star ? ' checked' : '') + '> ' + icon('star') + ' Starred</label></div>';

          // Usage tracking — which Ads use this image
          var usedInAds = (S.data.ads || []).filter(function(a) {
            var imgIds = (a.media && a.media.image && a.media.image.reference_image_ids) || [];
            if (imgIds.indexOf(selImg.fid) > -1) return true;
            var cards = (a.media && a.media.carousel_cards) || [];
            for (var ci = 0; ci < cards.length; ci++) {
              if ((cards[ci].reference_image_ids || []).indexOf(selImg.fid) > -1) return true;
            }
            return false;
          });
          if (usedInAds.length > 0) {
            html += '<div style="margin-top:var(--cp-space-3);border-top:1px solid var(--cp-border-light);padding-top:var(--cp-space-2)">';
            html += '<div class="cp-field-label">' + icon('rectangle-ad') + ' Used in ' + usedInAds.length + ' Ad' + (usedInAds.length !== 1 ? 's' : '') + '</div>';
            for (var uai = 0; uai < usedInAds.length; uai++) {
              html += '<div style="font-size:11px;color:var(--cp-text-secondary);padding:2px 0;cursor:pointer" data-action="ws-select-ad" data-id="' + esc(usedInAds[uai].id) + '">' + icon('arrow-right') + ' ' + esc(truncate(usedInAds[uai].name, 25)) + '</div>';
            }
            html += '</div>';
          }

          // Campaign association (Meta v2)
          var campId = (meta && meta.campaign_v2_id) || '';
          var camps = S.data.campaigns_v2 || [];
          if (camps.length > 0) {
            html += '<div class="cp-form-group" style="margin-top:var(--cp-space-3)"><label class="cp-field-label">' + icon('bullhorn') + ' Campaign</label>';
            html += '<select class="cp-select cp-img-meta-field" data-meta-field="campaign_v2_id">';
            html += '<option value="">None</option>';
            for (var cmi = 0; cmi < camps.length; cmi++) {
              html += '<option value="' + esc(camps[cmi].id) + '"' + (campId === camps[cmi].id ? ' selected' : '') + '>' + esc(camps[cmi].name) + '</option>';
            }
            html += '</select></div>';
          }

          html += '<div style="margin-top:var(--cp-space-3)"><button class="cp-btn cp-btn-primary cp-btn-sm" data-action="save-img-meta">' + icon('check') + ' Save</button></div>';
          html += '</div>';
        }
      }
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  function renderImageCard(img) {
    var meta = (S.meta.reference_images && S.meta.reference_images[img.fid]) || {};
    var sel = S.selectedImageId === img.fid ? ' cp-img-card-selected' : '';
    var html = '<div class="cp-img-card' + sel + '" data-action="select-image" data-fid="' + esc(img.fid) + '">';
    html += '<div class="cp-img-card-thumb"><img src="' + esc(img.url) + '" alt="' + esc(img.filename) + '" loading="lazy"></div>';
    html += '<div class="cp-img-card-body">';
    html += '<div class="cp-img-card-name">' + esc(img.filename) + '</div>';
    html += '<div class="cp-img-card-meta">';
    if (meta.star) html += '<span style="color:#f59e0b">' + icon('star') + '</span>';
    if (meta.category) {
      var cat = (S.meta.image_categories || []).find(function(c) { return c.id === meta.category; });
      if (cat) html += '<span>' + esc(cat.label) + '</span>';
    }
    html += '</div></div></div>';
    return html;
  }

  function saveImageMeta() {
    if (!S.selectedImageId) return;
    var fid = S.selectedImageId;
    S.meta.reference_images = S.meta.reference_images || {};
    S.meta.reference_images[fid] = S.meta.reference_images[fid] || {};
    var meta = S.meta.reference_images[fid];
    $('.cp-img-meta-field').each(function() {
      var field = $(this).data('meta-field');
      if (field === 'star') meta[field] = $(this).is(':checked');
      else if (field === 'tags') meta[field] = $(this).val().split(',').map(function(t) { return t.trim(); }).filter(Boolean);
      else meta[field] = $(this).val() || '';
    });
    syncToTextarea(); toast('Image metadata saved', 'success');
  }

  function triggerImageUpload() {
    if (!S.$imageField || !S.$imageField.length) {
      toast('Image field not found on this page. Add a field_images (Image, multi-value) field to this content type.', 'error', 6000);
      return;
    }
    // Temporarily show the hidden Drupal image field widget
    S.$imageField.show();
    // Find the last empty file input slot
    var $fileInputs = S.$imageField.find('input[type="file"]');
    var $emptySlot = $fileInputs.filter(function() { return !$(this).val(); }).last();
    if (!$emptySlot.length) {
      toast('No upload slots available — save the node first to get more slots', 'warning');
      S.$imageField.hide();
      return;
    }
    var _checkCount = 0;
    var _prevCount = (S.images || []).length;
    toast('Drupal upload dialog opened — select your image', 'info');
    $emptySlot.trigger('click');
    // Poll for new image after Drupal AJAX upload completes
    var pollTimer = setInterval(function() {
      _checkCount++;
      parseImageField();
      if ((S.images || []).length > _prevCount) {
        clearInterval(pollTimer);
        S.$imageField.hide();
        var newImg = S.images[S.images.length - 1];
        S.selectedImageId = newImg.fid;
        logActivity('image_uploaded', '', '', 'Uploaded reference image: ' + (newImg.filename || 'image'));
        buildMaps(); render();
        toast('Image uploaded! Add metadata below.', 'success');
      } else if (_checkCount > 120) { // 60 seconds timeout
        clearInterval(pollTimer);
        S.$imageField.hide();
        toast('Upload timed out. If you selected a file, try saving the node first, then re-open.', 'warning');
      }
    }, 500);
  }

  function setupImagesEvents() {
    // Images events handled in setupPart2BEvents
  }

