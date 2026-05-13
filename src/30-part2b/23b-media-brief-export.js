  // ============================================================
  // SECTION 23B: AD MEDIA BRIEF — Structured JSON export
  // ============================================================
  //
  // The Campaign Planner does NOT generate media (image/video/carousel)
  // itself. Instead, it assembles a structured JSON brief that downstream
  // tools (Midjourney / SDXL / Sora / Runway, or an MCP-connected LLM
  // like Claude) can consume to produce the actual assets.
  //
  // The brief packages everything the downstream tool needs: full ad
  // context (campaign + ad set + persona + brand), the hook + copy + CTA,
  // and the media direction (image brief + AI prompt, video scenes +
  // script, or carousel cards) in one self-contained document.

  var MEDIA_BRIEF_SCHEMA_VERSION = '1.0';

  function buildAdMediaBrief(adId, opts) {
    opts = opts || {};
    var ad = getAd(adId);
    if (!ad) return null;
    var adSet = getAdSet(ad.ad_set_id) || null;
    var camp = adSet ? getCampaignV2(adSet.campaign_id) : null;
    var persona = adSet && adSet.persona_id ? getPersona(adSet.persona_id) : null;
    var painPoints = (persona && persona.pain_point_ids ? persona.pain_point_ids : [])
      .map(function(ppId) { return S.painPointMap[ppId]; })
      .filter(Boolean)
      .slice(0, 8);

    var brand = (S.brand && S.brand.identity) ? S.brand.identity : {};
    var voice = (S.brand && S.brand.voice)    ? S.brand.voice    : {};
    var design = (S.meta && S.meta.settings && S.meta.settings.brand_design) || {};

    var creative = ad.creative || {};
    var hook = ad.hook || {};
    var media = ad.media || {};
    var ctype = ad.creative_type || 'single_image';

    var brief = {
      schema_version: MEDIA_BRIEF_SCHEMA_VERSION,
      ad: {
        id: ad.id,
        name: ad.name || '',
        creative_type: ctype,
        pipeline_status: ad.pipeline_status || '',
        objective: camp ? (camp.objective || '') : '',
        campaign_name: camp ? (camp.name || '') : '',
        ad_set_name: adSet ? (adSet.name || '') : '',
        audience: persona ? {
          persona_id: persona.id,
          persona_name: persona.name || '',
          persona_description: persona.description || '',
          demographics: persona.demographics || {},
          psychographics: persona.psychographics || {},
          pain_points: painPoints.map(function(pp) {
            return { pain: pp.pain_point || '', solution: pp.solution || '', category: pp.category || '' };
          })
        } : null,
        brand: {
          name: brand.name || '',
          tagline: brand.tagline || '',
          description: brand.description || '',
          voice: voice.tone || '',
          guidelines: voice.guidelines || '',
          design: {
            colors: design.colors || {},
            typography: design.typography || {}
          }
        },
        hook: {
          text: hook.text || '',
          type: hook.type || 'direct'
        },
        copy: {
          primary_text: creative.primary_text || '',
          headline: creative.headline || '',
          description: creative.description || '',
          cta_type: creative.cta_type || '',
          cta_link: creative.cta_link || '',
          display_link: creative.display_link || ''
        },
        brief_context: {
          campaign_brief: camp ? (camp.brief || '') : '',
          ad_set_creative_direction: (adSet && adSet.brief) ? (adSet.brief.creative_direction || '') : '',
          ad_set_hook_angles: (adSet && adSet.brief) ? (adSet.brief.hook_angles || []) : [],
          ad_set_ai_notes: (adSet && adSet.brief) ? (adSet.brief.ai_notes || '') : ''
        }
      },
      media: _buildMediaBlock(ctype, media),
      production: {
        deliverables: _suggestedDeliverables(ctype, media),
        assigned_to: ad.assigned_to || '',
        due_date: ad.due_date || '',
        production_notes: ad.production_notes || '',
        review_notes: ad.review_notes || ''
      },
      source: {
        campaign_id: camp ? camp.id : '',
        ad_set_id: adSet ? adSet.id : '',
        ad_id: ad.id,
        exported_at: new Date().toISOString(),
        tool: 'guaCampaignPlanner',
        format: 'media-brief'
      }
    };

    if (opts.mcp) {
      brief.mcp_instructions = _mcpInstructions(ctype);
    }

    return brief;
  }

  function _buildMediaBlock(ctype, media) {
    if (ctype === 'single_image') {
      var img = media.image || {};
      return {
        type: 'image',
        image: {
          brief: img.brief || '',
          ai_prompt: img.ai_prompt || '',
          aspect_ratio: img.aspect_ratio || '1:1',
          negative_prompt: img.negative_prompt || '',
          reference_image_ids: img.reference_image_ids || []
        }
      };
    }
    if (ctype === 'single_video') {
      var vid = media.video || {};
      var blueprint = vid.blueprint || { scenes: [] };
      var script = vid.script || { rows: [] };
      return {
        type: 'video',
        video: {
          concept: vid.concept || '',
          duration_seconds: vid.duration_seconds || 30,
          aspect_ratio: vid.aspect_ratio || '9:16',
          scenes: (blueprint.scenes || []).map(function(s, i) {
            return {
              index: i,
              name: s.name || '',
              description: s.description || '',
              timestamp: s.timestamp || '',
              duration: s.duration || null
            };
          }),
          script: (script.rows || []).map(function(r, i) {
            return {
              index: i,
              time: r.time || '',
              dialogue: r.dialogue || '',
              visual: r.visual || '',
              camera: r.camera || '',
              audio: r.audio || ''
            };
          }),
          voiceover_notes: vid.voiceover_notes || '',
          music_notes: vid.music_notes || '',
          captions_notes: vid.captions_notes || ''
        }
      };
    }
    if (ctype === 'carousel') {
      return {
        type: 'carousel',
        carousel: {
          cards: (media.carousel_cards || []).map(function(c, i) {
            return {
              index: i,
              headline: c.headline || '',
              description: c.description || '',
              link: c.link || ''
            };
          }),
          sequence_narrative: ''
        }
      };
    }
    return { type: ctype };
  }

  function _suggestedDeliverables(ctype, media) {
    if (ctype === 'single_image') {
      var img = media.image || {};
      var ar = img.aspect_ratio || '1:1';
      return [ ar + ' image (JPG / PNG, sRGB, ≥1080px on the short edge)' ];
    }
    if (ctype === 'single_video') {
      var vid = media.video || {};
      var ar = vid.aspect_ratio || '9:16';
      var dur = vid.duration_seconds || 30;
      return [
        ar + ' video, ' + dur + 's, MP4 H.264, ≥1080p, ≤30Mbps',
        'Caption SRT / VTT file (sound-off optimisation)'
      ];
    }
    if (ctype === 'carousel') {
      var cards = (media.carousel_cards || []).length;
      return [ cards + ' 1:1 (or 4:5) image' + (cards !== 1 ? 's' : '') + ', one per card' ];
    }
    return [];
  }

  function _mcpInstructions(ctype) {
    var common = 'This is a Meta Ads creative brief. Use the fields under `ad` (hook, copy, audience, brand) as creative direction. The `media` block tells you what kind of asset to produce and how. Match brand voice from `ad.brand.voice` and design tokens from `ad.brand.design`. Aim for the aspect_ratio and duration specified. Keep dialogue/headlines under the character limits the brief implies.';
    if (ctype === 'single_image') {
      return common + ' For image: pass `media.image.ai_prompt` to your image-generation tool, applying `media.image.negative_prompt` if your tool supports it. Aspect ratio is in `media.image.aspect_ratio`.';
    }
    if (ctype === 'single_video') {
      return common + ' For video: each entry in `media.video.scenes` is one storyboard beat — generate one clip per scene at the implied duration, then concat. Use `media.video.script` for time-coded dialogue/voiceover and on-screen visuals. Aspect ratio is in `media.video.aspect_ratio`.';
    }
    if (ctype === 'carousel') {
      return common + ' For carousel: generate one image per entry in `media.carousel.cards`. Keep visual style consistent across cards; the `headline` and `description` describe what each card communicates.';
    }
    return common;
  }

  function exportAdMediaBriefJSON(adId, opts) {
    var brief = buildAdMediaBrief(adId, opts || {});
    if (!brief) { toast('Could not build brief — ad not found', 'error'); return; }
    var json = JSON.stringify(brief, null, 2);
    var ad = getAd(adId);
    var safeName = (ad && ad.name ? ad.name : 'ad').replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'media-brief-' + safeName + '.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function() { URL.revokeObjectURL(url); }, 250);
    logActivity('media_brief_exported', 'ad', adId, ad ? ad.name : '', 'Downloaded media brief JSON');
    toast('Media brief downloaded', 'success');
  }

  function copyAdMediaBriefJSON(adId, opts) {
    var brief = buildAdMediaBrief(adId, opts || {});
    if (!brief) { toast('Could not build brief — ad not found', 'error'); return; }
    var json = JSON.stringify(brief, null, 2);
    var done = function(ok) {
      if (ok) {
        var ad = getAd(adId);
        logActivity('media_brief_exported', 'ad', adId, ad ? ad.name : '', 'Copied media brief JSON to clipboard');
        toast(opts && opts.mcp ? 'MCP-ready brief copied to clipboard' : 'Media brief copied to clipboard', 'success');
      } else {
        toast('Copy failed — your browser blocked clipboard access', 'error');
      }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(json).then(function() { done(true); }, function() { done(false); });
    } else {
      // Fallback for older browsers
      var ta = document.createElement('textarea');
      ta.value = json; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { done(document.execCommand('copy')); } catch (e) { done(false); }
      document.body.removeChild(ta);
    }
  }

  // Open a preview modal so the user can inspect the brief before exporting.
  function openMediaBriefPreview(adId) {
    var brief = buildAdMediaBrief(adId);
    if (!brief) { toast('Could not build brief — ad not found', 'error'); return; }
    var json = JSON.stringify(brief, null, 2);
    var html = '';
    html += '<div class="cp-editor-form">';
    html += '<p class="cp-form-help">' + icon('info') + ' This JSON brief contains everything a downstream image / video / carousel tool needs to produce the creative. Copy or download to use it in Midjourney, Sora, Runway, an MCP-connected LLM, or any other production tool.</p>';
    html += '<div style="display:flex;gap:var(--cp-space-2);margin-bottom:var(--cp-space-3);flex-wrap:wrap">';
    html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="copy-media-brief" data-id="' + esc(adId) + '">' + icon('copy') + ' Copy JSON</button>';
    html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="copy-media-brief-mcp" data-id="' + esc(adId) + '">' + icon('robot') + ' Copy as MCP brief</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="download-media-brief" data-id="' + esc(adId) + '">' + icon('download') + ' Download .json</button>';
    html += '</div>';
    html += '<pre class="cp-media-brief-preview" style="max-height:55vh;overflow:auto;background:var(--cp-gray-50,#f8f9fa);padding:var(--cp-space-3);border-radius:var(--cp-radius-md);font-size:var(--cp-font-size-xs);line-height:1.5;white-space:pre">' + esc(json) + '</pre>';
    html += '</div>';
    openModal('Media brief — preview', html, {
      titleIcon: 'file-code', size: 'lg', footer: false
    });
  }
