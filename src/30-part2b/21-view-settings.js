  // ============================================================
  // SECTION 17: SETTINGS VIEW (6 tabs)
  // ============================================================

  function renderSettingsView() {
    var tab = S.settingsTab || 'workspace';
    var tabs = [
      { key: 'workspace',    label: 'Workspace',    icon: 'briefcase' },
      { key: 'funnel',       label: 'Funnel Stages', icon: 'filter' },
      { key: 'categories',   label: 'Categories',   icon: 'folder' },
      { key: 'ai',           label: 'AI',           icon: 'sparkles' },
      { key: 'brand_design', label: 'Brand Design', icon: 'palette' },
      { key: 'meta_v2',      label: 'Meta v2',      icon: 'bullhorn' },
      { key: 'import_export', label: 'Import/Export', icon: 'download' }
    ];
    var html = '<div class="cp-view cp-view-settings">';
    html += '<div class="cp-view-header"><h1>' + icon('gear') + ' Settings</h1></div>';
    html += '<div class="cp-settings-tabs">';
    for (var i = 0; i < tabs.length; i++) {
      var t = tabs[i];
      html += '<button class="cp-settings-tab' + (tab === t.key ? ' cp-settings-tab-active' : '') + '" data-action="settings-tab" data-tab="' + t.key + '">' + icon(t.icon) + ' ' + esc(t.label) + '</button>';
    }
    html += '</div>';
    html += '<div class="cp-settings-body">';
    switch(tab) {
      case 'workspace':     html += renderWorkspaceSettings(); break;
      case 'funnel':        html += renderFunnelSettings(); break;
      case 'categories':    html += renderCategorySettings(); break;
      case 'ai':            html += renderAISettings(); break;
      case 'brand_design':  html += renderBrandDesignSettings(); break;
      case 'meta_v2':       html += renderMetaV2Settings(); break;
      case 'import_export': html += renderImportExportSettings(); break;
    }
    html += '</div></div>';
    return html;
  }

  function renderWorkspaceSettings() {
    var ws = (S.meta && S.meta.workspace) || {};
    var setup = (S.meta && S.meta.setup) || {};
    var stg = (S.meta && S.meta.settings) || {};
    var html = '<div class="cp-settings-panel">';
    html += '<div class="cp-settings-section"><h3>' + icon('briefcase') + ' Workspace</h3>';
    html += '<div class="cp-form-group"><label>Workspace Name</label><input type="text" class="cp-input cp-settings-field" data-path="workspace.name" value="' + esc(ws.name || '') + '"></div>';
    html += '<div class="cp-form-group"><label>Description</label><textarea class="cp-textarea cp-settings-field" data-path="workspace.description" rows="2">' + esc(ws.description || '') + '</textarea></div>';
    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Timezone</label><select class="cp-select cp-settings-field" data-path="settings.timezone">';
    ['UTC', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Kolkata'].forEach(function(tz) { html += '<option value="' + tz + '"' + (stg.timezone === tz ? ' selected' : '') + '>' + tz + '</option>'; });
    html += '</select></div><div class="cp-form-half"><label>Default View</label><select class="cp-select cp-settings-field" data-path="settings.default_view">';
    for (var v in Constants.APP_VIEWS) html += '<option value="' + v + '"' + (stg.default_view === v ? ' selected' : '') + '>' + Constants.APP_VIEWS[v].label + '</option>';
    html += '</select></div></div></div>';

    // Setup context (editable)
    html += '<div class="cp-settings-section"><h3>' + icon('bullseye') + ' Product & Objective</h3>';
    html += '<div class="cp-form-group"><label>Product / Service Name</label><input type="text" class="cp-input cp-settings-field" data-path="setup.product_name" value="' + esc(setup.product_name || '') + '"></div>';
    html += '<div class="cp-form-group"><label>Business Objective</label><input type="text" class="cp-input cp-settings-field" data-path="setup.objective" value="' + esc(setup.objective || '') + '"></div>';
    html += '<div class="cp-form-group"><label>Custom AI Instructions</label><textarea class="cp-textarea cp-settings-field" data-path="setup.custom_instructions" rows="3" placeholder="Special instructions included in all AI prompts...">' + esc(setup.custom_instructions || '') + '</textarea></div>';
    html += '</div>';

    // Setup wizard — re-run or full reset. Auto-launch only fires on empty
    // workspaces, so this is the only manual entry-point after onboarding.
    html += '<div class="cp-settings-section"><h3>' + icon('wand-magic') + ' Setup wizard</h3>';
    html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-3)">The wizard auto-launches on empty workspaces. Use these to re-run it later, or to wipe everything and start over.</p>';
    html += '<div class="cp-settings-actions">';
    html += '<button class="cp-btn cp-btn-outline" data-action="sw-restart-keep-data">' + icon('wand-magic') + ' Re-run setup wizard</button> ';
    html += '<button class="cp-btn cp-btn-danger" data-action="sw-reset-wipe-data">' + icon('trash') + ' Reset everything from scratch</button>';
    html += '</div>';
    html += '</div>';

    html += '<div class="cp-settings-actions"><button class="cp-btn cp-btn-primary" data-action="save-settings">' + icon('check') + ' Save</button></div>';
    html += '</div>';
    return html;
  }

  function renderFunnelSettings() {
    var funnels = (S.meta.settings && S.meta.settings.funnel_stages) || [];
    var html = '<div class="cp-settings-panel">';
    html += '<div class="cp-settings-section"><div class="cp-flex-between"><h3>' + icon('filter') + ' Funnel Stages</h3>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="add-funnel-stage">' + icon('plus') + ' Add Stage</button></div>';
    html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-3)">Define your advertising funnel stages. System defaults (TOFU/MOFU/BOFU) cannot be deleted.</p>';
    for (var fi = 0; fi < funnels.length; fi++) {
      var f = funnels[fi];
      html += '<div class="cp-funnel-stage-item" data-stage-index="' + fi + '">';
      html += '<span class="cp-funnel-stage-dot" style="background:' + f.color + '"></span>';
      html += '<span class="cp-funnel-stage-name">' + esc(f.name) + '</span>';
      html += '<span class="cp-funnel-stage-short">' + esc(f.short || '') + '</span>';
      if (f.system) html += '<span class="cp-funnel-stage-system">System</span>';
      else html += '<button class="cp-btn-icon cp-btn-xs" data-action="delete-funnel-stage" data-stage-index="' + fi + '">' + icon('trash') + '</button>';
      html += '</div>';
    }
    html += '</div>';
    html += '<div class="cp-settings-actions"><button class="cp-btn cp-btn-primary" data-action="save-settings">' + icon('check') + ' Save</button></div>';
    html += '</div>';
    return html;
  }

  function renderCategorySettings() {
    var ppCats = Constants.PAIN_POINT_CATEGORIES || [];
    var fmtCats = Constants.FORMAT_CATEGORIES || [];
    var metaObjMap = Constants.META_OBJECTIVES || {};
    var html = '<div class="cp-settings-panel">';
    html += '<div class="cp-settings-section"><h3>' + icon('bolt') + ' Pain Point Categories</h3>';
    html += '<div class="cp-config-list">';
    for (var pi = 0; pi < ppCats.length; pi++) html += '<div class="cp-config-item"><span class="cp-config-item-name">' + esc(ppCats[pi].name) + '</span><span class="cp-text-muted">' + esc(ppCats[pi].id) + '</span></div>';
    html += '</div></div>';
    html += '<div class="cp-settings-section"><h3>' + icon('clapperboard') + ' Visual Format Categories</h3>';
    html += '<div class="cp-config-list">';
    for (var fi = 0; fi < fmtCats.length; fi++) html += '<div class="cp-config-item"><span class="cp-config-item-name">' + esc(fmtCats[fi].name) + '</span><span class="cp-text-muted">' + icon(fmtCats[fi].icon) + '</span></div>';
    html += '</div></div>';
    html += '<div class="cp-settings-section"><h3>' + icon('bullseye') + ' Meta Campaign Objectives</h3>';
    html += '<div class="cp-config-list">';
    for (var ok in metaObjMap) {
      var mo = metaObjMap[ok];
      html += '<div class="cp-config-item"><span class="cp-config-item-name">' + esc(mo.label || ok) + '</span><span class="cp-text-muted">' + esc(ok) + '</span></div>';
    }
    html += '</div></div>';
    html += '<p class="cp-text-muted">These categories are system defaults. Custom category management will be available in a future update.</p>';
    html += '</div>';
    return html;
  }

  function renderAISettings() {
    var prefs = S.meta.aiPreferences || {};
    var html = '<div class="cp-settings-panel">';
    // AI Status
    html += '<div class="cp-settings-section"><h3>' + icon('bolt') + ' AI Status</h3>';
    if (LLMService.isConfigured()) {
      var provs = LLMService.getActiveProviders();
      var def = LLMService.getDefault();
      html += '<div class="cp-ai-status-summary" style="background:var(--cp-success-light);color:var(--cp-success);border:1px solid rgba(13,144,79,0.2)">';
      html += icon('circle-check') + ' <strong>' + provs.length + ' provider' + (provs.length > 1 ? 's' : '') + ' active</strong>';
      if (def) html += ' — Default: ' + esc(def.provider) + ' / ' + esc(def.model);
      html += '</div>';
      // Surface a hint when the saved app-default doesn't resolve cleanly
      // (provider deactivated or model no longer active). Helps the user
      // understand why the displayed default may differ from what they saved.
      var savedDef = prefs.appDefault;
      if (def && savedDef && savedDef.provider && savedDef.model &&
          (savedDef.provider !== def.provider || savedDef.model !== def.model)) {
        html += '<div class="cp-ai-status-warning" style="margin-top:var(--cp-space-2);padding:var(--cp-space-2) var(--cp-space-3);background:var(--cp-warning-light,#fff8e1);color:var(--cp-warning,#946200);border:1px solid rgba(180,144,0,0.2);border-radius:var(--cp-radius-sm);font-size:var(--cp-font-size-sm)">';
        html += icon('warning') + ' Your saved default <strong>' + esc(savedDef.provider) + ' / ' + esc(savedDef.model) + '</strong> isn\'t active. Falling back to <strong>' + esc(def.provider) + ' / ' + esc(def.model) + '</strong>. Pick a new default below and save.';
        html += '</div>';
      }
      html += '<div style="margin-top:var(--cp-space-3)"><button class="cp-btn cp-btn-outline cp-btn-sm" data-action="test-ai-connection">' + icon('bolt') + ' Test Connection</button></div>';
    } else {
      html += '<div class="cp-ai-status-summary" style="background:var(--cp-error-light);color:var(--cp-error);border:1px solid rgba(217,48,37,0.2)">';
      html += icon('warning') + ' <strong>No AI providers found</strong></div>';
      html += '<div class="cp-ai-setup-guide" style="margin-top:var(--cp-space-3);padding:var(--cp-space-4);background:var(--cp-gray-50);border-radius:var(--cp-radius-md)">';
      html += '<p style="font-size:var(--cp-font-size-sm);margin-bottom:var(--cp-space-2)">To enable AI features:</p>';
      html += '<ol style="margin:0;padding-left:var(--cp-space-5);font-size:var(--cp-font-size-sm);color:var(--cp-text-secondary);line-height:1.8">';
      html += '<li>Go to your <strong>user profile</strong> edit page</li>';
      html += '<li>Find the <strong>LLM Config</strong> field</li>';
      html += '<li>Add API keys and model configuration</li>';
      html += '<li>Expose the config via <strong>Drupal Views</strong> on this page</li></ol>';
      html += '<p style="font-size:var(--cp-font-size-xs);color:var(--cp-text-muted);margin:var(--cp-space-2) 0 0">Looks for <code style="background:var(--cp-gray-100);padding:1px 4px;border-radius:3px">.llm-config-data</code> or <code style="background:var(--cp-gray-100);padding:1px 4px;border-radius:3px">.llm-brand-config-data</code></p>';
      html += '</div>';
    }
    html += '</div>';
    // Default provider
    if (LLMService.isConfigured()) {
      html += '<div class="cp-settings-section"><h3>Default Provider</h3>';
      html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-3)">Default AI provider and model for all actions.</p>';
      html += '<div style="display:flex;gap:var(--cp-space-2)">' + LLMService.renderInlinePicker('app-default') + '</div>';
      html += '</div>';
    }
    html += '<div class="cp-settings-actions"><button class="cp-btn cp-btn-primary" data-action="save-settings">' + icon('check') + ' Save</button></div>';
    html += '</div>';
    return html;
  }

  function renderBrandDesignSettings() {
    var bd = (S.meta.settings && S.meta.settings.brand_design) || {};
    var colors = bd.colors || {};
    var typo = bd.typography || {};
    var html = '<div class="cp-settings-panel cp-brand-design-panel">';
    html += '<div class="cp-settings-section"><h3>' + icon('palette') + ' Brand Colors</h3>';
    html += '<div class="cp-brand-color-row">';
    var colorFields = [['primary', 'Primary'], ['secondary', 'Secondary'], ['accent', 'Accent'], ['background', 'Background'], ['text', 'Text']];
    for (var ci = 0; ci < colorFields.length; ci++) {
      var cf = colorFields[ci];
      html += '<div class="cp-brand-color-field"><label>' + cf[1] + '</label>';
      html += '<div class="cp-color-input-wrap"><input type="color" class="cp-brand-color" data-color-key="' + cf[0] + '" value="' + esc(colors[cf[0]] || '#ffffff') + '">';
      html += '<input type="text" class="cp-input cp-brand-color-text" data-color-key="' + cf[0] + '" value="' + esc(colors[cf[0]] || '') + '" placeholder="#hex"></div></div>';
    }
    html += '</div></div>';
    html += '<div class="cp-settings-section"><h3>' + icon('font') + ' Typography</h3>';
    html += '<div class="cp-form-group"><label>Heading Style</label><input type="text" class="cp-input cp-settings-field" data-path="settings.brand_design.typography.heading_style" value="' + esc(typo.heading_style || '') + '" placeholder="e.g., Bold Sans-Serif, Uppercase"></div>';
    html += '<div class="cp-form-group"><label>Body Style</label><input type="text" class="cp-input cp-settings-field" data-path="settings.brand_design.typography.body_style" value="' + esc(typo.body_style || '') + '" placeholder="e.g., Clean readable sans-serif"></div>';
    html += '</div>';
    html += '<div class="cp-settings-section"><h3>' + icon('image') + ' Visual Style</h3>';
    html += '<div class="cp-form-group"><label>Visual Style Description</label><textarea class="cp-textarea cp-settings-field" data-path="settings.brand_design.visual_style" rows="3" placeholder="Describe the overall visual aesthetic...">' + esc(bd.visual_style || '') + '</textarea></div>';
    html += '<div class="cp-form-group"><label>Layout Rules</label><textarea class="cp-textarea cp-settings-field" data-path="settings.brand_design.layout_rules" rows="2" placeholder="Composition guidelines...">' + esc(bd.layout_rules || '') + '</textarea></div>';
    html += '</div>';
    // Brand prompt preview
    var preview = BrandService.buildBrandDesignText(bd);
    if (preview) {
      html += '<div class="cp-settings-section"><h3>' + icon('eye') + ' Generated Prompt Preview</h3>';
      html += '<div style="padding:var(--cp-space-3);background:var(--cp-gray-50);border-radius:var(--cp-radius-md);font-family:var(--cp-font-mono);font-size:var(--cp-font-size-xs);line-height:1.7;white-space:pre-wrap;color:var(--cp-text-secondary)">' + esc(preview) + '</div></div>';
    }
    html += '<div class="cp-settings-actions"><button class="cp-btn cp-btn-primary" data-action="save-settings">' + icon('check') + ' Save</button></div>';
    html += '</div>';
    return html;
  }

  function renderImportExportSettings() {
    var html = '<div class="cp-settings-panel">';
    html += '<div class="cp-settings-section"><h3>' + icon('download') + ' Export</h3>';
    html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-3)">Download your data as JSON for backup or migration.</p>';
    html += '<div style="display:flex;gap:var(--cp-space-2);flex-wrap:wrap">';
    html += '<button class="cp-btn cp-btn-outline" data-action="export-json" data-mode="combined">' + icon('download') + ' Export All</button>';
    html += '<button class="cp-btn cp-btn-outline" data-action="export-json" data-mode="data-only">' + icon('database') + ' Data Only</button>';
    html += '<button class="cp-btn cp-btn-outline" data-action="export-json" data-mode="meta-only">' + icon('gear') + ' Settings Only</button>';
    html += '</div></div>';
    html += '<div class="cp-settings-section"><h3>' + icon('upload') + ' Import</h3>';
    html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-3)">Import a previously exported JSON file. This will <strong>replace</strong> your current data.</p>';
    html += '<button class="cp-btn cp-btn-outline" data-action="import-json">' + icon('upload') + ' Import JSON File</button>';
    html += '<input type="file" id="cpImportFile" accept=".json" style="display:none">';
    html += '</div></div>';
    return html;
  }

  function setupSettingsEvents() {
    // Settings events handled in setupPart2BEvents
  }

