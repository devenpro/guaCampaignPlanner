  // ============================================================
  // SECTION 14: MEDIA STEP RENDERER (Image + Video)
  // ============================================================

  function renderMediaStep(recipe) {
    var html = '<div class="cp-step-media" data-recipe-id="' + esc(recipe.id) + '">';

    if (recipe.media_type === 'video') {
      html += renderVideoMediaPanel(recipe);
    } else {
      html += renderImageMediaPanel(recipe);
    }

    html += '</div>';
    return html;
  }

  // ─── IMAGE MODE ───
  function renderImageMediaPanel(recipe) {
    var brief = recipe.image_brief || {};
    var params = brief.prompt_params || {};
    var html = '';

    // Creative brief
    html += '<div class="cp-card cp-image-brief-section">';
    html += '<div class="cp-section-header"><h3>' + icon('pen-fancy') + ' Creative Brief</h3>';
    html += renderRecipeAIBar('ai-generate-brief', recipe.id, 'AI Generate', 'sparkles');
    html += '</div>';
    html += '<p class="cp-text-muted" style="margin-bottom:8px">Describe what the image should look like, mood, key visual elements.</p>';
    html += '<textarea class="cp-textarea" data-action="save-brief-field" data-bfield="creative_brief" rows="4" placeholder="A warm indoor studio scene with the talent looking directly at camera, holding the product...">' + esc(brief.creative_brief || '') + '</textarea>';
    html += '</div>';

    // AI image prompt
    html += '<div class="cp-card cp-ai-prompt-section" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('wand-magic') + ' AI Image Prompt</h3>';
    html += renderRecipeAIBar('ai-generate-prompt', recipe.id, 'AI Generate', 'wand-magic');
    html += '</div>';
    html += '<textarea class="cp-textarea" data-action="save-brief-field" data-bfield="ai_prompt" rows="4" placeholder="Detailed AI image generation prompt...">' + esc(brief.ai_prompt || '') + '</textarea>';

    // Prompt parameters
    html += '<div class="cp-prompt-params">';
    // Aspect ratio
    html += '<div class="cp-form-group" style="min-width:100px"><label class="cp-field-label">Aspect Ratio</label>';
    html += '<select class="cp-select cp-select-sm" data-action="save-prompt-param" data-param="aspect_ratio">';
    var ratios = ['1:1', '4:5', '9:16', '16:9', '4:3'];
    for (var ri = 0; ri < ratios.length; ri++) {
      html += '<option value="' + ratios[ri] + '"' + ((params.aspect_ratio || '1:1') === ratios[ri] ? ' selected' : '') + '>' + ratios[ri] + '</option>';
    }
    html += '</select></div>';
    // Visual approach
    html += '<div class="cp-form-group" style="min-width:120px"><label class="cp-field-label">Visual Approach</label>';
    html += '<select class="cp-select cp-select-sm" data-action="save-prompt-param" data-param="visual_approach">';
    var approaches = [['photography', 'Photography'], ['illustration', 'Illustration'], ['3d_render', '3D Render'], ['flat_design', 'Flat Design'], ['mixed', 'Mixed Media']];
    for (var ai = 0; ai < approaches.length; ai++) {
      html += '<option value="' + approaches[ai][0] + '"' + ((params.visual_approach || 'photography') === approaches[ai][0] ? ' selected' : '') + '>' + approaches[ai][1] + '</option>';
    }
    html += '</select></div>';
    // Mood
    html += '<div class="cp-form-group" style="flex:1"><label class="cp-field-label">Mood</label>';
    html += '<input type="text" class="cp-input" data-action="save-prompt-param" data-param="mood" value="' + esc(params.mood || '') + '" placeholder="e.g., Warm, Energetic, Professional"></div>';
    html += '</div>';

    // Negative prompt
    html += '<div class="cp-form-group" style="margin-top:8px"><label class="cp-field-label">Negative Prompt</label>';
    html += '<input type="text" class="cp-input" data-action="save-prompt-param" data-param="negative_prompt" value="' + esc(params.negative_prompt || '') + '" placeholder="Elements to exclude..."></div>';
    html += '</div>';

    // Reference images
    html += '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('images') + ' Reference Images</h3></div>';
    var refIds = brief.reference_image_ids || [];
    html += '<div class="cp-ref-images-row">';
    for (var rii = 0; rii < refIds.length; rii++) {
      var img = S.imageMap[refIds[rii]];
      if (img) {
        var imgMeta = (S.meta.reference_images && S.meta.reference_images[img.fid]) || {};
        html += '<div class="cp-ref-image-thumb">';
        html += '<img src="' + esc(img.url) + '" alt="' + esc(img.filename) + '" title="' + esc(img.filename) + (imgMeta.description ? ' — ' + imgMeta.description : '') + '">';
        html += '<button class="cp-ref-image-remove" data-action="remove-ref-image" data-recipe-id="' + esc(recipe.id) + '" data-fid="' + esc(img.fid) + '" title="Remove">&times;</button>';
        html += '</div>';
      }
    }
    html += '<button class="cp-ref-image-add" data-action="pick-ref-images" data-recipe-id="' + esc(recipe.id) + '" title="Select reference images">' + icon('plus') + '</button>';
    if (S.$imageField && S.$imageField.length) {
      html += '<button class="cp-ref-image-add" data-action="upload-image" title="Upload new image">' + icon('upload') + '</button>';
    }
    html += '</div>';
    if (refIds.length > 0) {
      html += '<p class="cp-text-muted" style="margin-top:6px;font-size:11px">' + refIds.length + ' reference image' + (refIds.length !== 1 ? 's' : '') + ' selected. These will be included in AI context for creative brief and prompt generation.</p>';
    }
    html += '</div>';

    return html;
  }

  // ─── VIDEO MODE ───
  function renderVideoMediaPanel(recipe) {
    var vid = recipe.video || {};
    var blueprint = vid.blueprint || {};
    var scenes = blueprint.scenes || [];
    var script = vid.script || {};
    var scriptRows = script.rows || [];
    var html = '';

    // Video meta
    html += '<div class="cp-card">';
    html += '<div class="cp-section-header"><h3>' + icon('video') + ' Video Details</h3></div>';
    html += '<div class="cp-video-meta-row">';
    // Duration
    html += '<div class="cp-video-meta-field"><label class="cp-field-label">Duration (sec)</label>';
    html += '<input type="number" class="cp-input" data-action="save-video-field" data-vfield="duration_seconds" value="' + (vid.duration_seconds || 30) + '" min="5" max="180"></div>';
    // Format
    html += '<div class="cp-video-meta-field"><label class="cp-field-label">Format</label>';
    html += '<select class="cp-select" data-action="save-video-field" data-vfield="format">';
    var formats = ['Reel', 'Feed Video', 'Story', 'Long Form'];
    for (var fi = 0; fi < formats.length; fi++) {
      html += '<option value="' + formats[fi] + '"' + ((vid.format || 'Reel') === formats[fi] ? ' selected' : '') + '>' + formats[fi] + '</option>';
    }
    html += '</select></div>';
    // Aspect ratio
    html += '<div class="cp-video-meta-field"><label class="cp-field-label">Aspect Ratio</label>';
    html += '<select class="cp-select" data-action="save-video-field" data-vfield="aspect_ratio">';
    var vRatios = ['9:16', '1:1', '16:9', '4:5'];
    for (var vri = 0; vri < vRatios.length; vri++) {
      html += '<option value="' + vRatios[vri] + '"' + ((vid.aspect_ratio || '9:16') === vRatios[vri] ? ' selected' : '') + '>' + vRatios[vri] + '</option>';
    }
    html += '</select></div>';
    html += '</div>';

    // Concept
    html += '<div class="cp-form-group" style="margin-top:8px"><label class="cp-field-label">Video Concept</label>';
    html += '<textarea class="cp-textarea" data-action="save-video-field" data-vfield="concept" rows="2" placeholder="Describe the video concept...">' + esc(vid.concept || '') + '</textarea></div>';
    html += '</div>';

    // Blueprint (scenes)
    html += '<div class="cp-card cp-video-blueprint" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('film') + ' Blueprint — Scenes</h3>';
    html += renderRecipeAIBar('ai-generate-blueprint', recipe.id, 'AI Generate', 'sparkles');
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="add-scene">' + icon('plus') + ' Add Scene</button>';
    html += '</div>';

    html += '<div class="cp-scene-list">';
    if (scenes.length === 0) {
      html += '<p class="cp-text-muted">No scenes yet. Add scenes to plan your video structure.</p>';
    } else {
      for (var si = 0; si < scenes.length; si++) {
        var sc = scenes[si];
        html += '<div class="cp-scene-card" data-scene-index="' + si + '">';
        html += '<div class="cp-scene-card-header">';
        html += '<span class="cp-badge" style="background:#d9302515;color:#d93025;font-weight:800">S' + (si + 1) + '</span>';
        html += '<input type="text" class="cp-input" data-action="save-scene-field" data-scene-index="' + si + '" data-sfield="name" value="' + esc(sc.name || '') + '" placeholder="Scene name..." style="flex:1;font-weight:700">';
        html += '<span class="cp-text-muted">' + esc(sc.timestamp || '') + '</span>';
        html += '<button class="cp-btn-icon cp-btn-xs" data-action="delete-scene" data-scene-index="' + si + '">' + icon('trash') + '</button>';
        html += '</div>';
        html += '<textarea class="cp-textarea" data-action="save-scene-field" data-scene-index="' + si + '" data-sfield="description" rows="2" placeholder="What happens in this scene...">' + esc(sc.description || '') + '</textarea>';
        html += '</div>';
      }
    }
    html += '</div></div>';

    // Script table
    html += '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('file-lines') + ' Detailed Script</h3>';
    html += renderRecipeAIBar('ai-generate-script', recipe.id, 'AI Generate', 'sparkles');
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="add-script-row">' + icon('plus') + ' Add Row</button>';
    html += '</div>';

    if (scriptRows.length === 0) {
      html += '<p class="cp-text-muted">No script rows yet. Add rows manually or generate with AI.</p>';
    } else {
      html += '<div class="cp-script-table">';
      html += '<div class="cp-script-header"><div>Time</div><div>Dialogue</div><div>Visual</div><div>Camera</div><div>Audio</div></div>';
      for (var sri = 0; sri < scriptRows.length; sri++) {
        var row = scriptRows[sri];
        html += '<div class="cp-script-row" data-row-index="' + sri + '">';
        html += '<div><input type="text" class="cp-input" data-action="save-script-field" data-row-index="' + sri + '" data-srfield="time" value="' + esc(row.time || '') + '" placeholder="0:00" style="width:50px;padding:2px 4px;font-size:11px"></div>';
        html += '<div><textarea class="cp-textarea" data-action="save-script-field" data-row-index="' + sri + '" data-srfield="dialogue" rows="1" style="min-height:30px;font-size:11px;padding:3px 6px">' + esc(row.dialogue || '') + '</textarea></div>';
        html += '<div><textarea class="cp-textarea" data-action="save-script-field" data-row-index="' + sri + '" data-srfield="visual" rows="1" style="min-height:30px;font-size:11px;padding:3px 6px">' + esc(row.visual || '') + '</textarea></div>';
        html += '<div><input type="text" class="cp-input" data-action="save-script-field" data-row-index="' + sri + '" data-srfield="camera" value="' + esc(row.camera || '') + '" style="padding:2px 4px;font-size:11px"></div>';
        html += '<div><input type="text" class="cp-input" data-action="save-script-field" data-row-index="' + sri + '" data-srfield="audio" value="' + esc(row.audio || '') + '" style="padding:2px 4px;font-size:11px"></div>';
        html += '</div>';
      }
      html += '</div>';
    }

    // Export banner
    html += '<div class="cp-script-export-banner" style="margin-top:12px">';
    html += icon('circle-info') + ' <span>Blueprint + script can be exported to the Video Production app when ready.</span>';
    html += '</div>';
    html += '</div>';

    return html;
  }

