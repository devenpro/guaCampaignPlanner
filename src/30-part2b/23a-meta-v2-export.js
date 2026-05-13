  // ============================================================
  // SECTION 23A: META v2 EXPORT (Stage 7)
  // ============================================================
  //
  // Two export formats:
  //   1. JSON — full Campaign tree (Campaign + Ad Sets + Ads embedded)
  //   2. Meta bulk-upload CSV — 3 CSV files (campaigns / ad sets / ads)
  //      matching Meta Ads Manager's bulk import column layout.
  //
  // Pre-flight validation runs before either export and flags missing /
  // invalid fields that would cause Meta to reject the upload.

  // --- Entry: Export modal launched from Campaign workspace or list ---

  function openExportModal(campaignId) {
    var camp = campaignId ? getCampaignV2(campaignId) : null;
    var camps = camp ? [camp] : getAllCampaignsV2();
    if (camps.length === 0) { toast('No campaigns to export', 'info'); return; }

    var validation = validateForExport(camps);

    var html = '<div class="cp-editor-form">';
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('download') + ' Export ' + esc(camp ? '"' + camp.name + '"' : 'all campaigns') + '</div>';
    html += '<p>' + camps.length + ' Campaign' + (camps.length !== 1 ? 's' : '') + ', ' +
            countAdSets(camps) + ' Ad Set' + (countAdSets(camps) !== 1 ? 's' : '') + ', ' +
            countAds(camps) + ' Ad' + (countAds(camps) !== 1 ? 's' : '') + '.</p>';
    html += '</div>';

    // Validation report
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('shield') + ' Pre-flight check</div>';
    if (validation.errors.length === 0 && validation.warnings.length === 0) {
      html += '<div class="cp-v2-export-validation-ok">' + icon('circle-check') + ' Ready to export — no issues found.</div>';
    } else {
      if (validation.errors.length) {
        html += '<div class="cp-v2-export-validation-errors">';
        html += '<div class="cp-v2-export-validation-title">' + icon('warning') + ' ' + validation.errors.length + ' error(s) — fix before exporting</div>';
        html += '<ul>';
        validation.errors.slice(0, 12).forEach(function(e) { html += '<li>' + esc(e) + '</li>'; });
        if (validation.errors.length > 12) html += '<li class="cp-text-muted">+ ' + (validation.errors.length - 12) + ' more</li>';
        html += '</ul></div>';
      }
      if (validation.warnings.length) {
        html += '<div class="cp-v2-export-validation-warnings">';
        html += '<div class="cp-v2-export-validation-title">' + icon('info') + ' ' + validation.warnings.length + ' warning(s) — review</div>';
        html += '<ul>';
        validation.warnings.slice(0, 12).forEach(function(w) { html += '<li>' + esc(w) + '</li>'; });
        if (validation.warnings.length > 12) html += '<li class="cp-text-muted">+ ' + (validation.warnings.length - 12) + ' more</li>';
        html += '</ul></div>';
      }
    }
    html += '</div>';

    // Choices
    html += '<div class="cp-form-section"><div class="cp-form-section-title">' + icon('file-lines') + ' Format</div>';
    html += '<div class="cp-v2-export-choices">';
    html += '<button class="cp-btn cp-btn-primary" data-action="v2-export-json" data-campaign-id="' + esc(camp ? camp.id : '') + '">' + icon('file-text') + ' Download JSON tree</button>';
    var blocked = validation.errors.length > 0;
    html += '<button class="cp-btn ' + (blocked ? 'cp-btn-outline' : 'cp-btn-primary') + '" data-action="v2-export-csv" data-campaign-id="' + esc(camp ? camp.id : '') + '"' + (blocked ? ' disabled' : '') + '>' + icon('rectangle-list') + ' Download Meta CSVs</button>';
    html += '</div>';
    html += '<div class="cp-form-help">JSON exports always. CSV is blocked until errors are fixed (Meta will reject otherwise).</div>';
    html += '</div>';

    html += '</div>';

    openModal('Export to Meta', html, {
      titleIcon: 'download', size: 'lg', footer: false
    });
  }

  function countAdSets(camps) { var n = 0; camps.forEach(function(c) { n += getAdSetsByCampaign(c.id).length; }); return n; }
  function countAds(camps)    { var n = 0; camps.forEach(function(c) { n += getAdsByCampaign(c.id).length; }); return n; }

  // --- Validation ---

  function validateForExport(camps) {
    var errors = [];
    var warnings = [];

    camps.forEach(function(c) {
      // Campaign-level
      if (!c.name) errors.push('Campaign has no name (id ' + c.id + ')');
      if (!c.objective) errors.push('Campaign "' + (c.name || '?') + '" has no objective');
      if (c.budget_mode === 'CBO' && !c.daily_budget && !c.lifetime_budget) {
        warnings.push('Campaign "' + c.name + '" is CBO but has no daily/lifetime budget');
      }

      var sets = getAdSetsByCampaign(c.id);
      if (sets.length === 0) warnings.push('Campaign "' + c.name + '" has no Ad Sets');

      sets.forEach(function(s) {
        if (!s.name) errors.push('Ad Set in "' + c.name + '" has no name');
        if (!s.persona_id) warnings.push('Ad Set "' + s.name + '" has no persona linked');
        if (!s.optimization_goal) errors.push('Ad Set "' + s.name + '" has no optimization goal');
        if (!s.billing_event) errors.push('Ad Set "' + s.name + '" has no billing event');
        if (c.budget_mode === 'ABO' && !s.daily_budget && !s.lifetime_budget) {
          errors.push('Ad Set "' + s.name + '" is ABO but has no budget');
        }
        if (c.budget_mode === 'CBO' && (s.daily_budget || s.lifetime_budget)) {
          warnings.push('Ad Set "' + s.name + '" has a budget but Campaign is CBO — budget will be ignored');
        }

        var ads = getAdsByAdSet(s.id);
        if (ads.length === 0) warnings.push('Ad Set "' + s.name + '" has no Ads');

        ads.forEach(function(a) {
          if (!a.name) errors.push('Ad in "' + s.name + '" has no name');
          var cr = a.creative || {};
          if (!cr.primary_text) warnings.push('Ad "' + a.name + '" has no primary text');
          if (!cr.cta_link) warnings.push('Ad "' + a.name + '" has no destination URL');
          else if (!/^https?:\/\//i.test(cr.cta_link)) errors.push('Ad "' + a.name + '" cta_link is not a valid URL');
          if (a.creative_type === 'single_image') {
            var img = (a.media && a.media.image) || {};
            if (!img.asset_id && !img.prompt && !img.ai_prompt && !img.brief) warnings.push('Ad "' + a.name + '" (single_image) has no image asset or prompt');
          }
          if (a.creative_type === 'carousel') {
            var cards = (a.media && a.media.carousel_cards) || [];
            if (cards.length < 2) errors.push('Ad "' + a.name + '" (carousel) needs at least 2 cards');
          }
        });
      });
    });

    return { errors: errors, warnings: warnings };
  }

  // --- JSON export ---

  function exportV2JSON(campaignId) {
    var camps = campaignId ? [getCampaignV2(campaignId)].filter(Boolean) : getAllCampaignsV2();
    if (camps.length === 0) { toast('Nothing to export', 'warning'); return; }

    var tree = camps.map(function(c) {
      return $.extend({}, c, {
        ad_sets: getAdSetsByCampaign(c.id).map(function(s) {
          return $.extend({}, s, { ads: getAdsByAdSet(s.id) });
        })
      });
    });

    var payload = {
      exported_at: new Date().toISOString(),
      app: 'meta-campaign-planner',
      version: 'v2',
      workspace: ((S.meta && S.meta.workspace && S.meta.workspace.name) || ''),
      campaigns: tree
    };

    var filename = 'meta-campaign-tree' + (campaignId ? '-' + (camps[0].name || 'export').replace(/[^a-z0-9-]+/gi, '-').toLowerCase() : '-all') + '-' + new Date().toISOString().split('T')[0] + '.json';
    downloadBlob(JSON.stringify(payload, null, 2), filename, 'application/json');
    logActivity('data_exported', 'workspace', '', filename, 'Exported v2 JSON');
    toast('JSON tree downloaded', 'success');
    closeModal();
  }

  // --- CSV export (3 files: campaigns, ad sets, ads) ---

  function exportV2CSV(campaignId) {
    var camps = campaignId ? [getCampaignV2(campaignId)].filter(Boolean) : getAllCampaignsV2();
    if (camps.length === 0) { toast('Nothing to export', 'warning'); return; }

    var validation = validateForExport(camps);
    if (validation.errors.length > 0) {
      toast('Fix ' + validation.errors.length + ' validation error(s) first', 'error'); return;
    }

    var dateStr = new Date().toISOString().split('T')[0];

    // Campaigns sheet
    var campRows = camps.map(function(c) {
      return {
        'Campaign Name': c.name || '',
        'Campaign ID (planner)': c.id,
        'Campaign Objective': c.objective || '',
        'Campaign Status': c.status || 'DRAFT',
        'Buying Type': c.buying_type || 'AUCTION',
        'Budget Mode': c.budget_mode || 'CBO',
        'Daily Budget': c.daily_budget != null ? c.daily_budget : '',
        'Lifetime Budget': c.lifetime_budget != null ? c.lifetime_budget : '',
        'Spend Cap': c.spend_cap != null ? c.spend_cap : '',
        'Bid Strategy': c.bid_strategy || '',
        'Start Time': c.start_time || '',
        'Stop Time': c.stop_time || '',
        'Special Ad Categories': (c.special_ad_categories || []).join(';'),
        'A/B Test Enabled': (c.ab_test && c.ab_test.enabled) ? 'TRUE' : 'FALSE',
        'A/B Primary Metric': (c.ab_test && c.ab_test.primary_metric) || '',
        'Description': c.description || ''
      };
    });

    // Ad Sets sheet
    var adSetRows = [];
    camps.forEach(function(c) {
      getAdSetsByCampaign(c.id).forEach(function(s) {
        var placements = s.placements || {};
        var placementValues = placements.advantage_enabled ? 'ADVANTAGE_PLACEMENTS' : (placements.custom_placements || []).join(';');
        var brief = s.brief || {};
        var persona = S.personaMap[s.persona_id];
        adSetRows.push({
          'Campaign Name': c.name || '',
          'Ad Set Name': s.name || '',
          'Ad Set ID (planner)': s.id,
          'Ad Set Status': s.status || 'DRAFT',
          'Optimization Goal': s.optimization_goal || '',
          'Billing Event': s.billing_event || '',
          'Attribution Setting': s.attribution_setting || '',
          'Bid Amount': s.bid_amount != null ? s.bid_amount : '',
          'Daily Budget': s.daily_budget != null ? s.daily_budget : '',
          'Lifetime Budget': s.lifetime_budget != null ? s.lifetime_budget : '',
          'Start Time': s.start_time || '',
          'Stop Time': s.stop_time || '',
          'Placements': placementValues,
          'Persona Name (planner)': persona ? persona.name : '',
          'Audience Notes': s.audience_overrides || '',
          'AB Role': s.ab_role || '',
          'Creative Direction (brief)': brief.creative_direction || '',
          'Hook Angles': (brief.hook_angles || []).join(' | ')
        });
      });
    });

    // Ads sheet
    var adRows = [];
    camps.forEach(function(c) {
      getAdsByCampaign(c.id).forEach(function(a) {
        var s = getAdSet(a.ad_set_id);
        var cr = a.creative || {};
        var m = a.media || {};
        adRows.push({
          'Campaign Name': c.name || '',
          'Ad Set Name': s ? s.name : '',
          'Ad Name': a.name || '',
          'Ad ID (planner)': a.id,
          'Ad Status (planner)': a.pipeline_status || '',
          'Creative Type': a.creative_type || 'single_image',
          'Primary Text': cr.primary_text || '',
          'Headline': cr.headline || '',
          'Description': cr.description || '',
          'Call To Action': cr.cta_type || '',
          'Destination URL': cr.cta_link || '',
          'Display Link': cr.display_link || '',
          'URL Parameters': cr.tracking_params || '',
          'Hook Text': (a.hook && a.hook.text) || '',
          'Hook Type': (a.hook && a.hook.type) || '',
          'Image Asset ID': (m.image && m.image.asset_id) || '',
          'Image Aspect Ratio': (m.image && m.image.aspect_ratio) || '',
          'Image Prompt': (m.image && (m.image.prompt || m.image.ai_prompt || m.image.brief)) || '',
          'Video Asset ID': (m.video && m.video.asset_id) || '',
          'Video Duration (s)': (m.video && m.video.duration_seconds) || '',
          'Video Aspect Ratio': (m.video && m.video.aspect_ratio) || '',
          'Video Concept': (m.video && m.video.concept) || '',
          'Carousel Card Count': ((m.carousel_cards || []).length) || '',
          'Assigned To': a.assigned_to || '',
          'Due Date': a.due_date || ''
        });
      });
    });

    var slug = campaignId ? '-' + (camps[0].name || 'export').replace(/[^a-z0-9-]+/gi, '-').toLowerCase() : '-all';
    downloadBlob(toCSV(campRows), 'meta-campaigns' + slug + '-' + dateStr + '.csv', 'text/csv');
    setTimeout(function() {
      downloadBlob(toCSV(adSetRows), 'meta-ad-sets' + slug + '-' + dateStr + '.csv', 'text/csv');
    }, 350);
    setTimeout(function() {
      downloadBlob(toCSV(adRows), 'meta-ads' + slug + '-' + dateStr + '.csv', 'text/csv');
    }, 700);

    logActivity('meta_csv_exported', 'workspace', '', '', campRows.length + ' campaigns / ' + adSetRows.length + ' ad sets / ' + adRows.length + ' ads');
    toast('3 CSV files downloaded', 'success');
    closeModal();
  }

  // --- CSV serialization (RFC 4180) ---

  function toCSV(rows) {
    if (!rows || !rows.length) return '';
    var headers = Object.keys(rows[0]);
    var escCell = function(v) {
      if (v == null) return '';
      var s = String(v);
      if (/[",\r\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    };
    var lines = [headers.map(escCell).join(',')];
    rows.forEach(function(r) {
      lines.push(headers.map(function(h) { return escCell(r[h]); }).join(','));
    });
    return lines.join('\r\n');
  }

  // --- Download trigger ---

  function downloadBlob(content, filename, mime) {
    var blob = new Blob([content], { type: mime + ';charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var $a = $('<a></a>').attr({ href: url, download: filename }).css('display', 'none');
    $('body').append($a);
    $a[0].click();
    setTimeout(function() { $a.remove(); URL.revokeObjectURL(url); }, 500);
  }

  // --- Field-level copy helpers ---

  function copyAdField(adId, field) {
    var ad = getAd(adId); if (!ad) return;
    var value = '';
    switch (field) {
      case 'primary_text': value = (ad.creative || {}).primary_text || ''; break;
      case 'headline':     value = (ad.creative || {}).headline || ''; break;
      case 'description':  value = (ad.creative || {}).description || ''; break;
      case 'cta_link':     value = (ad.creative || {}).cta_link || ''; break;
      case 'cta_type':     value = (ad.creative || {}).cta_type || ''; break;
      case 'hook':         value = (ad.hook || {}).text || ''; break;
      case 'image_prompt': var img = ((ad.media || {}).image || {}); value = img.prompt || img.ai_prompt || img.brief || ''; break;
      case 'all':
        var c = ad.creative || {};
        value = 'Primary text:\n' + (c.primary_text || '') + '\n\nHeadline:\n' + (c.headline || '') + '\n\nDescription:\n' + (c.description || '') + '\n\nCTA: ' + (c.cta_type || '') + '\nLink: ' + (c.cta_link || '');
        break;
    }
    if (!value) { toast('Nothing to copy', 'info'); return; }
    copyToClipboard(value);
    toast('Copied ' + field.replace(/_/g, ' '), 'success');
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function() { fallbackCopy(text); });
    } else {
      fallbackCopy(text);
    }
  }
  function fallbackCopy(text) {
    var $ta = $('<textarea></textarea>').val(text).css({ position: 'fixed', left: '-9999px' });
    $('body').append($ta);
    $ta[0].select();
    try { document.execCommand('copy'); } catch (_) {}
    $ta.remove();
  }
