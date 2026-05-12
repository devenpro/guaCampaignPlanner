  // ============================================================
  // SECTION 9.6: NEW CAMPAIGN WIZARD (per-campaign, Meta v2 native)
  // ============================================================
  //
  // Multi-step flow for creating a new Campaign once the workspace is set up.
  // Step 1: Basics (name, objective, budget, brief)
  // Step 2: Ad Sets (AI-suggest + manual edits, selection)
  // Step 3: Ads per Ad Set (tabbed AI-suggest, selection)
  // Step 4: Review + Launch
  //
  // Mirrors the singleton-state pattern of the setup wizard: never reassign
  // `ncwState`, always mutate. Part 2B reads it via window._cpPart2A.ncwState.

  var ncwState = {};

  var NCW_STEPS = [
    { num: 1, label: 'Basics',   icon: 'clipboard-list' },
    { num: 2, label: 'Ad Sets',  icon: 'crosshairs' },
    { num: 3, label: 'Ads',      icon: 'rectangle-ad' },
    { num: 4, label: 'Review',   icon: 'check' }
  ];

  function _ncwReplaceState(newState) {
    var keys = Object.keys(ncwState);
    for (var i = 0; i < keys.length; i++) delete ncwState[keys[i]];
    var nk = Object.keys(newState);
    for (var j = 0; j < nk.length; j++) ncwState[nk[j]] = newState[nk[j]];
  }

  function _ncwFreshState() {
    return {
      step: 1,
      aiLoading: false, aiActionId: '', aiError: '',
      _expandedCards: {}, _activeAdSetTab: 0,
      campaign: {
        name: '', description: '',
        objective: 'OUTCOME_LEADS',
        budget_mode: 'CBO', bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
        daily_budget: '', lifetime_budget: '',
        start_time: '', stop_time: '',
        brief: '', ai_instructions: ''
      },
      ad_sets: [],
      _adsContext: {},        // { setIdx: contextString }
      stepGenerated: { 2: false, 3: {} },
      created: { campaignV2Id: '', adSetIds: [], adIds: [] }
    };
  }

  function openNewCampaignWizard() {
    _ncwReplaceState(_ncwFreshState());
    _renderNCWDOM();
  }

  function _renderNCWDOM() {
    $('.cp-ncw').remove();
    var $w = $('<div class="cp-ncw" id="cpNCW" role="dialog" aria-modal="true" aria-label="New Campaign Wizard"></div>');
    $('#cpApp').append($w);
    renderNCW();
  }

  function renderNCW() {
    var html = '';
    html += '<div class="cp-ncw-progress-bar"><div class="cp-ncw-progress-fill" style="width:' + _ncwPct() + '%"></div></div>';
    html += '<div class="cp-ncw-layout">';
    html += _ncwBuildRail();
    html += _ncwBuildContent();
    html += '</div>';
    $('#cpNCW').html(html);
    setTimeout(function() {
      var $first = $('#cpNCW .cp-ncw-content-inner input, #cpNCW .cp-ncw-content-inner textarea, #cpNCW .cp-ncw-content-inner select');
      if ($first.length) $first.first().focus();
    }, 50);
  }

  function refreshNCW() {
    $('#cpNCW .cp-ncw-progress-fill').css('width', _ncwPct() + '%');
    $('#cpNCW .cp-ncw-rail-steps').html(_ncwBuildRailSteps());
    $('#cpNCW .cp-ncw-content-inner').html(_ncwBuildStepContent());
    $('#cpNCW .cp-ncw-footer').html(_ncwBuildFooter());
  }

  function _ncwPct() { return Math.round(((ncwState.step - 1) / 4) * 100); }

  function _ncwBuildRail() {
    var html = '<div class="cp-ncw-rail">';
    html += '<div class="cp-ncw-rail-header">';
    html += '<div class="cp-ncw-rail-logo">New<span class="cp-ncw-rail-logo-accent">Campaign</span></div>';
    html += '<div class="cp-ncw-rail-subtitle">Wizard</div>';
    html += '</div>';
    html += '<div class="cp-ncw-rail-steps">' + _ncwBuildRailSteps() + '</div>';
    html += '<div class="cp-ncw-rail-close"><button class="cp-btn cp-btn-ghost cp-btn-sm" data-action="ncw-close">' + icon('x') + ' Cancel</button></div>';
    html += '</div>';
    return html;
  }

  function _ncwBuildRailSteps() {
    var current = ncwState.step;
    var html = '';
    for (var i = 0; i < NCW_STEPS.length; i++) {
      var st = NCW_STEPS[i];
      var isDone = st.num < current;
      var isActive = st.num === current;
      var isLocked = st.num > current;
      var cls = 'cp-ncw-step';
      if (isActive) cls += ' cp-ncw-step--active';
      if (isDone)   cls += ' cp-ncw-step--done';
      if (isLocked) cls += ' cp-ncw-step--locked';
      var clickable = isDone;
      html += '<div class="' + cls + (clickable ? ' cp-ncw-step--clickable' : '') + '"';
      if (clickable) html += ' data-action="ncw-goto" data-step="' + st.num + '" role="button" tabindex="0"';
      html += '>';
      html += '<div class="cp-ncw-step-circle">' + (isDone ? icon('check') : st.num) + '</div>';
      html += '<div class="cp-ncw-step-label">' + esc(st.label) + '</div>';
      html += '</div>';
    }
    return html;
  }

  function _ncwBuildContent() {
    var html = '<div class="cp-ncw-content">';
    html += '<div class="cp-ncw-content-scroll"><div class="cp-ncw-content-inner">';
    html += _ncwBuildStepContent();
    html += '</div></div>';
    html += '<div class="cp-ncw-footer">' + _ncwBuildFooter() + '</div>';
    html += '</div>';
    return html;
  }

  function _ncwBuildStepContent() {
    switch (ncwState.step) {
      case 1: return _ncwRenderStep1();
      case 2: return _ncwRenderStep2();
      case 3: return _ncwRenderStep3();
      case 4: return _ncwRenderStep4();
    }
    return '';
  }

  function _ncwBuildFooter() {
    var n = ncwState.step;
    var html = '';
    html += '<div class="cp-ncw-footer-left">';
    if (n > 1) html += '<button class="cp-btn cp-btn-outline" data-action="ncw-back">' + icon('arrow-left') + ' Back</button>';
    else       html += '<span></span>';
    html += '</div>';
    html += '<div class="cp-ncw-footer-center"><div class="cp-ncw-step-counter">Step ' + n + ' of 4</div></div>';
    html += '<div class="cp-ncw-footer-right">';
    if (n < 4) html += '<button class="cp-btn cp-btn-primary" data-action="ncw-next">Next ' + icon('arrow-right') + '</button>';
    else       html += '<button class="cp-btn cp-btn-ai" data-action="ncw-launch">' + icon('rocket') + ' Create Campaign</button>';
    html += '</div>';
    return html;
  }

  function _ncwHeader(title, subtitle) {
    return '<div class="cp-ncw-step-header"><h2 class="cp-ncw-step-title">' + esc(title) + '</h2>' +
           '<p class="cp-ncw-step-subtitle">' + esc(subtitle) + '</p></div>';
  }

  // ----- Step 1: Basics -----
  function _ncwRenderStep1() {
    var cam = ncwState.campaign || {};
    var C = Constants;
    var html = _ncwHeader('Campaign Basics', 'Name your campaign, choose the Meta objective and budget mode, and provide a brief that AI will use to draft Ad Sets.');

    html += '<div class="cp-ncw-form">';

    html += '<div class="cp-field"><label class="cp-field-label">Campaign Name <span class="cp-required">*</span></label>';
    html += '<input type="text" class="cp-input" data-ncw-field="campaign.name" value="' + esc(cam.name || '') + '" placeholder="e.g., Q3 SaaS Lead Gen" autocomplete="off"></div>';

    html += '<div class="cp-ncw-field-row">';
    html += '<div class="cp-field"><label class="cp-field-label">Objective</label>';
    html += '<select class="cp-select" data-ncw-field="campaign.objective">';
    for (var ok in C.META_OBJECTIVES) {
      html += '<option value="' + esc(ok) + '"' + (cam.objective === ok ? ' selected' : '') + '>' + esc(C.META_OBJECTIVES[ok].label) + '</option>';
    }
    html += '</select></div>';
    html += '<div class="cp-field"><label class="cp-field-label">Budget mode</label>';
    html += '<select class="cp-select" data-ncw-field="campaign.budget_mode">';
    for (var bmk in C.META_BUDGET_MODES) {
      html += '<option value="' + esc(bmk) + '"' + (cam.budget_mode === bmk ? ' selected' : '') + '>' + esc(C.META_BUDGET_MODES[bmk].short) + '</option>';
    }
    html += '</select></div>';
    html += '<div class="cp-field"><label class="cp-field-label">Daily budget</label>';
    html += '<input type="number" class="cp-input" data-ncw-field="campaign.daily_budget" min="0" step="1" value="' + esc(cam.daily_budget != null ? cam.daily_budget : '') + '"></div>';
    html += '</div>';

    html += '<div class="cp-ncw-field-row">';
    html += '<div class="cp-field"><label class="cp-field-label">Start date</label>';
    html += '<input type="date" class="cp-input" data-ncw-field="campaign.start_time" value="' + esc(cam.start_time || '') + '"></div>';
    html += '<div class="cp-field"><label class="cp-field-label">End date</label>';
    html += '<input type="date" class="cp-input" data-ncw-field="campaign.stop_time" value="' + esc(cam.stop_time || '') + '"></div>';
    html += '</div>';

    html += '<div class="cp-field"><label class="cp-field-label">Brief <span class="cp-text-muted">— context for AI</span></label>';
    html += '<textarea class="cp-textarea" data-ncw-field="campaign.brief" rows="4" placeholder="Describe what you\'re selling, who you\'re targeting, what success looks like, any constraints...">';
    html += esc(cam.brief || '');
    html += '</textarea></div>';

    html += '</div>';
    return html;
  }

  // ----- Step 2: Ad Sets -----
  function _ncwRenderStep2() {
    var st = ncwState;
    var sets = st.ad_sets || [];
    var html = _ncwHeader('Ad Sets', 'Each Ad Set targets one persona or audience cut. AI will suggest 2-3 Ad Sets from your campaign brief.');

    html += _ncwErrorBanner();

    html += '<div class="cp-ncw-gen-bar">';
    html += '<button class="cp-btn cp-btn-ai"' + (st.aiLoading ? ' disabled' : '') + ' data-action="ncw-ai-suggest-sets">';
    html += icon('sparkles') + ' ' + (st.stepGenerated[2] ? 'Regenerate with AI' : 'Suggest with AI');
    html += '</button>';
    html += '<button class="cp-btn cp-btn-outline" data-action="ncw-add-ad-set">' + icon('plus') + ' Add Ad Set manually</button>';
    if (st.aiLoading) {
      html += '<button class="cp-btn cp-btn-ghost" data-action="ncw-ai-cancel">' + icon('x') + ' Cancel</button>';
    }
    html += '</div>';

    if (st.aiLoading) {
      html += _ncwBuildSetSkeleton(3);
      return html;
    }

    if (!sets.length) {
      html += '<div class="cp-ncw-empty">';
      html += '<div class="cp-ncw-empty-icon">' + icon('crosshairs') + '</div>';
      html += '<p>No Ad Sets yet. Use <strong>Suggest with AI</strong> to draft 2-3 based on your brief, or <strong>Add manually</strong>.</p>';
      html += '</div>';
      return html;
    }

    var selCount = sets.filter(function(s) { return s._selected; }).length;
    html += '<div class="cp-ncw-bar">';
    html += '<span class="cp-ncw-sel-count' + (selCount > 0 ? ' cp-ncw-sel-count--ok' : '') + '">';
    html += selCount + ' of ' + sets.length + ' Ad Set' + (sets.length !== 1 ? 's' : '') + ' selected';
    html += '</span>';
    html += '</div>';

    html += '<div class="cp-ncw-set-grid">';
    for (var i = 0; i < sets.length; i++) {
      html += _ncwBuildSetCard(sets[i], i);
    }
    html += '</div>';
    return html;
  }

  function _ncwBuildSetSkeleton(n) {
    var html = '<div class="cp-ncw-set-grid">';
    for (var i = 0; i < n; i++) {
      html += '<div class="cp-sw-skeleton-card">';
      html += '<div class="cp-sw-skeleton-line cp-sw-skeleton-line--title"></div>';
      html += '<div class="cp-sw-skeleton-line"></div><div class="cp-sw-skeleton-line"></div>';
      html += '<div class="cp-sw-skeleton-line cp-sw-skeleton-line--short"></div>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function _ncwBuildSetCard(adSet, idx) {
    var selected = adSet._selected;
    var personas = getAllPersonas ? getAllPersonas() : (S.data.personas || []);
    var goalLabel = (Constants.META_OPTIMIZATION_GOALS[adSet.optimization_goal] || {}).label || adSet.optimization_goal || '';
    var brief = adSet.brief || {};

    var html = '<div class="cp-ncw-set-card' + (selected ? ' cp-ncw-set-card--selected' : '') + '">';

    html += '<div class="cp-ncw-set-card-header">';
    html += '<button class="cp-sw-tree-check' + (selected ? ' cp-sw-tree-check--on' : '') + '" data-action="ncw-set-toggle" data-set-idx="' + idx + '">';
    html += selected ? icon('check') : '';
    html += '</button>';
    html += '<input type="text" class="cp-input cp-input-sm cp-ncw-set-name" data-ncw-set-field="name" data-set-idx="' + idx + '" value="' + esc(adSet.name || '') + '" placeholder="Ad Set name">';
    html += '<button class="cp-btn-icon cp-btn-icon-sm" data-action="ncw-set-delete" data-set-idx="' + idx + '" title="Delete">' + icon('trash') + '</button>';
    html += '</div>';

    html += '<div class="cp-ncw-set-card-fields">';
    html += '<div class="cp-field cp-field-inline"><label>Persona</label>';
    html += '<select class="cp-select cp-select-sm" data-ncw-set-field="persona_id" data-set-idx="' + idx + '">';
    html += '<option value="">(no persona)</option>';
    for (var p = 0; p < personas.length; p++) {
      html += '<option value="' + esc(personas[p].id) + '"' + (adSet.persona_id === personas[p].id ? ' selected' : '') + '>' + esc(personas[p].name) + '</option>';
    }
    html += '</select></div>';
    html += '<div class="cp-field cp-field-inline"><label>Optimization</label>';
    html += '<select class="cp-select cp-select-sm" data-ncw-set-field="optimization_goal" data-set-idx="' + idx + '">';
    for (var gk in Constants.META_OPTIMIZATION_GOALS) {
      html += '<option value="' + esc(gk) + '"' + (adSet.optimization_goal === gk ? ' selected' : '') + '>' + esc(Constants.META_OPTIMIZATION_GOALS[gk].label) + '</option>';
    }
    html += '</select></div>';
    html += '</div>';

    if (brief.creative_direction) {
      html += '<div class="cp-ncw-set-brief"><strong>Direction:</strong> ' + esc(brief.creative_direction) + '</div>';
    }
    if (brief.hook_angles && brief.hook_angles.length) {
      html += '<div class="cp-ncw-set-hooks"><strong>Hook angles:</strong> ';
      html += brief.hook_angles.map(function(h) { return '<span class="cp-badge">' + esc(h) + '</span>'; }).join('');
      html += '</div>';
    }

    var adCount = (adSet.ads || []).length;
    html += '<div class="cp-ncw-set-footer">';
    html += '<span class="cp-text-muted">' + adCount + ' Ad' + (adCount !== 1 ? 's' : '') + ' drafted</span>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  // ----- Step 3: Ads per Ad Set (tabs) -----
  function _ncwRenderStep3() {
    var st = ncwState;
    var sets = (st.ad_sets || []).filter(function(s) { return s._selected; });
    var html = _ncwHeader('Ads', 'Each Ad Set needs at least one Ad. Use AI to suggest 2-3 Ads per Ad Set, each with a distinct hook angle.');

    html += _ncwErrorBanner();

    if (!sets.length) {
      html += '<div class="cp-ncw-empty">';
      html += '<div class="cp-ncw-empty-icon">' + icon('rectangle-ad') + '</div>';
      html += '<p>No selected Ad Sets. Go back to Step 2 and select at least one.</p>';
      html += '</div>';
      return html;
    }

    var activeTab = st._activeAdSetTab || 0;
    if (activeTab >= sets.length) activeTab = 0;

    // Tab bar
    html += '<div class="cp-sw-pp-tabs">';
    for (var ti = 0; ti < sets.length; ti++) {
      var s = sets[ti];
      var adsSel = (s.ads || []).filter(function(a) { return a._selected; }).length;
      html += '<button class="cp-sw-pp-tab' + (ti === activeTab ? ' cp-sw-pp-tab--active' : '') + '" data-action="ncw-tab" data-tab="' + ti + '">';
      html += esc(truncate(s.name || ('Ad Set ' + (ti + 1)), 26));
      if (adsSel) html += ' <span class="cp-sw-pp-tab-badge">' + adsSel + '</span>';
      html += '</button>';
    }
    html += '</div>';

    var current = sets[activeTab];
    var setRealIdx = (st.ad_sets || []).indexOf(current);
    var ads = current.ads || [];
    var ctx = (st._adsContext || {})[setRealIdx] || '';
    var generated = (st.stepGenerated[3] || {})[setRealIdx];

    html += '<div class="cp-ncw-gen-bar">';
    html += '<textarea class="cp-textarea" id="ncwAdsContext" rows="2" placeholder="Optional: ad direction for this Ad Set...">' + esc(ctx) + '</textarea>';
    html += '<button class="cp-btn cp-btn-ai"' + (st.aiLoading ? ' disabled' : '') + ' data-action="ncw-ai-suggest-ads" data-set-idx="' + setRealIdx + '">';
    html += icon('sparkles') + ' ' + (generated ? 'Regenerate' : 'Suggest Ads');
    html += '</button>';
    html += '<button class="cp-btn cp-btn-outline" data-action="ncw-add-ad" data-set-idx="' + setRealIdx + '">' + icon('plus') + ' Add manually</button>';
    if (st.aiLoading) {
      html += '<button class="cp-btn cp-btn-ghost" data-action="ncw-ai-cancel">' + icon('x') + ' Cancel</button>';
    }
    html += '</div>';

    if (st.aiLoading) {
      html += _ncwBuildSetSkeleton(3);
      return html;
    }

    if (!ads.length) {
      html += '<div class="cp-ncw-empty">';
      html += '<div class="cp-ncw-empty-icon">' + icon('rectangle-ad') + '</div>';
      html += '<p>No Ads yet for this Ad Set. Use <strong>Suggest Ads</strong> or add one manually.</p>';
      html += '</div>';
      return html;
    }

    html += '<div class="cp-ncw-ad-grid">';
    for (var j = 0; j < ads.length; j++) {
      html += _ncwBuildAdCard(ads[j], setRealIdx, j);
    }
    html += '</div>';
    return html;
  }

  function _ncwBuildAdCard(ad, setIdx, adIdx) {
    var selected = ad._selected;
    var creative = ad.creative || {};
    var hook = ad.hook || {};
    var ctype = Constants.META_AD_CREATIVE_TYPES[ad.creative_type] || { label: 'Ad', icon: 'rectangle-ad' };
    var cta = Constants.META_CTA_TYPES[creative.cta_type];

    var html = '<div class="cp-ncw-ad-card' + (selected ? ' cp-ncw-ad-card--selected' : '') + '">';
    html += '<div class="cp-ncw-ad-card-header">';
    html += '<button class="cp-sw-tree-check cp-sw-tree-check--sm' + (selected ? ' cp-sw-tree-check--on' : '') + '" data-action="ncw-ad-toggle" data-set-idx="' + setIdx + '" data-ad-idx="' + adIdx + '">';
    html += selected ? icon('check') : '';
    html += '</button>';
    html += '<div class="cp-ncw-ad-card-title">' + icon(ctype.icon) + ' ' + esc(ad.name || ('Ad ' + (adIdx + 1))) + '</div>';
    html += '<button class="cp-btn-icon cp-btn-icon-sm" data-action="ncw-ad-delete" data-set-idx="' + setIdx + '" data-ad-idx="' + adIdx + '" title="Delete">' + icon('trash') + '</button>';
    html += '</div>';

    if (hook.text)             html += '<blockquote class="cp-sw-tree-ad-hook">' + esc(hook.text) + '</blockquote>';
    if (creative.primary_text) html += '<div class="cp-sw-tree-ad-text">' + esc(truncate(creative.primary_text, 160)) + '</div>';

    var meta = [];
    if (creative.headline)    meta.push('<strong>H:</strong> ' + esc(creative.headline));
    if (creative.description) meta.push('<strong>D:</strong> ' + esc(creative.description));
    if (cta)                  meta.push('<span class="cp-sw-tree-ad-cta">' + esc(cta.label) + '</span>');
    if (meta.length) html += '<div class="cp-sw-tree-ad-meta">' + meta.join(' · ') + '</div>';

    html += '</div>';
    return html;
  }

  // ----- Step 4: Review -----
  function _ncwRenderStep4() {
    var st = ncwState;
    var cam = st.campaign || {};
    var sets = (st.ad_sets || []).filter(function(s) { return s._selected; });
    var adCount = 0;
    sets.forEach(function(s) { adCount += (s.ads || []).filter(function(a) { return a._selected; }).length; });

    var html = _ncwHeader('Review & Launch', 'Final check. On Launch we create the Campaign + selected Ad Sets + selected Ads.');

    if (st.finalizing) {
      html += '<div class="cp-sw-finalize-progress"><div class="cp-sw-finalize-spinner">' + icon('loader') + '</div>';
      html += '<p class="cp-sw-finalize-msg">' + esc(st.finalizeMsg || 'Creating Campaign…') + '</p></div>';
      return html;
    }

    html += '<div class="cp-sw-review-grid">';
    html += '<div class="cp-sw-review-box"><div class="cp-sw-review-box-icon">' + icon('bullhorn') + '</div>';
    html += '<div class="cp-sw-review-box-count">1</div><div class="cp-sw-review-box-label">Campaign</div>';
    html += '<div class="cp-sw-review-box-names"><span>' + esc(cam.name || '(untitled)') + '</span></div></div>';

    html += '<div class="cp-sw-review-box"><div class="cp-sw-review-box-icon">' + icon('crosshairs') + '</div>';
    html += '<div class="cp-sw-review-box-count">' + sets.length + '</div><div class="cp-sw-review-box-label">Ad Sets</div>';
    html += '<div class="cp-sw-review-box-names">';
    sets.slice(0, 3).forEach(function(s) { html += '<span>' + esc(truncate(s.name || '', 30)) + '</span>'; });
    if (sets.length > 3) html += '<span>+' + (sets.length - 3) + ' more</span>';
    html += '</div></div>';

    html += '<div class="cp-sw-review-box"><div class="cp-sw-review-box-icon">' + icon('rectangle-ad') + '</div>';
    html += '<div class="cp-sw-review-box-count">' + adCount + '</div><div class="cp-sw-review-box-label">Ads</div></div>';
    html += '</div>';

    var objLabel = (Constants.META_OBJECTIVES[cam.objective] || {}).label || cam.objective || '';
    html += '<div class="cp-sw-info-box cp-sw-info-box--success" style="margin-top:var(--cp-space-4)">';
    html += icon('bullhorn') + ' <strong>' + esc(cam.name || '(untitled)') + '</strong>';
    if (objLabel) html += ' · ' + esc(objLabel);
    if (cam.daily_budget) html += ' · ' + esc(String(cam.daily_budget)) + '/day';
    html += '</div>';

    return html;
  }

  function _ncwErrorBanner() {
    if (!ncwState.aiError) return '';
    var html = '<div class="cp-sw-ai-error" role="alert">';
    html += '<div class="cp-sw-ai-error-icon">' + icon('triangle-alert') + '</div>';
    html += '<div class="cp-sw-ai-error-body">';
    html += '<div class="cp-sw-ai-error-title">AI failed</div>';
    html += '<div class="cp-sw-ai-error-msg">' + esc(ncwState.aiError) + '</div>';
    html += '</div>';
    html += '<button class="cp-btn cp-btn-sm cp-btn-ghost" data-action="ncw-error-dismiss">' + icon('x') + ' Dismiss</button>';
    html += '</div>';
    return html;
  }

  // ----- Field collection / navigation -----
  function _ncwCollectFields() {
    $('#cpNCW [data-ncw-field]').each(function() {
      var path = $(this).data('ncw-field'); if (!path) return;
      var parts = String(path).split('.');
      var obj = ncwState;
      for (var i = 0; i < parts.length - 1; i++) { obj = obj[parts[i]] = obj[parts[i]] || {}; }
      var val = $(this).val();
      obj[parts[parts.length - 1]] = val == null ? '' : val;
    });
  }

  function _ncwValidate(n) {
    if (n === 1) {
      if (!ncwState.campaign.name || !ncwState.campaign.name.trim()) {
        return { valid: false, message: 'Please enter a campaign name.' };
      }
    }
    if (n === 2) {
      var sets = (ncwState.ad_sets || []).filter(function(s) { return s._selected; });
      if (!sets.length) return { valid: false, message: 'Select at least one Ad Set.' };
    }
    if (n === 3) {
      var sels = (ncwState.ad_sets || []).filter(function(s) { return s._selected; });
      var anyAd = false;
      for (var i = 0; i < sels.length; i++) {
        if ((sels[i].ads || []).some(function(a) { return a._selected; })) { anyAd = true; break; }
      }
      if (!anyAd) return { valid: false, message: 'Each selected Ad Set needs at least one selected Ad.' };
    }
    return { valid: true };
  }

  function ncwGoNext() {
    _ncwCollectFields();
    var v = _ncwValidate(ncwState.step);
    if (!v.valid) { toast(v.message, 'warning'); return; }
    if (ncwState.step < 4) {
      ncwState.step++;
      refreshNCW();
    }
  }
  function ncwGoBack() { _ncwCollectFields(); if (ncwState.step > 1) { ncwState.step--; refreshNCW(); } }
  function ncwGotoStep(n) { if (n < ncwState.step) { _ncwCollectFields(); ncwState.step = n; refreshNCW(); } }
  function ncwClose() {
    openConfirmDialog(
      'Close New Campaign Wizard?',
      'Your in-progress draft will be lost.',
      function() { $('.cp-ncw').remove(); }
    );
  }

  function ncwAddAdSetManual() {
    var sets = ncwState.ad_sets || (ncwState.ad_sets = []);
    sets.push({
      name: 'Ad Set ' + (sets.length + 1),
      persona_id: '',
      audience_overrides: '',
      optimization_goal: 'OFFSITE_CONVERSIONS',
      billing_event: 'IMPRESSIONS',
      attribution_setting: '7d_click',
      brief: { creative_direction: '', message_ids: [], style_ids: [], format_ids: [], hook_angles: [], ai_notes: '' },
      ads: [],
      _selected: true
    });
    refreshNCW();
  }

  function ncwAddAdManual(setIdx) {
    var s = (ncwState.ad_sets || [])[setIdx]; if (!s) return;
    s.ads = s.ads || [];
    s.ads.push({
      name: 'Ad ' + (s.ads.length + 1), creative_type: 'single_image',
      hook: { text: '', type: 'direct' },
      creative: { primary_text: '', headline: '', description: '', cta_type: 'LEARN_MORE', cta_link: '' },
      media: { image_brief: '', image_prompt: '', video_concept: '' },
      _selected: true
    });
    refreshNCW();
  }

  function ncwLaunch() {
    if (typeof window._cpRenderers.finalizeNewCampaignWizard === 'function') {
      window._cpRenderers.finalizeNewCampaignWizard();
    } else {
      toast('Wizard finalize not loaded.', 'error');
    }
  }
