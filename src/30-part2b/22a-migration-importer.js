  // ============================================================
  // SECTION 22A: META v2 MIGRATION IMPORTER (Stage 6)
  // ============================================================
  //
  // Wizard that converts legacy data (campaigns[] + recipes[]) into the
  // Meta v2 hierarchy (campaigns_v2[] + ad_sets[] + ads[]). Run once per
  // workspace from Settings → "Migrate legacy data". Preserves all old
  // data in S.meta.legacy_backup until the user explicitly discards.

  var v2MigrationState = { step: 1, mappings: {}, summary: null };

  // --- Mapping tables (legacy → Meta enum) ---

  var V2_OBJ_MAP = {
    'obj_leads':       'OUTCOME_LEADS',
    'obj_awareness':   'OUTCOME_AWARENESS',
    'obj_conversions': 'OUTCOME_SALES',
    'obj_traffic':     'OUTCOME_TRAFFIC',
    'obj_engagement':  'OUTCOME_ENGAGEMENT'
  };
  var V2_CAMP_STATUS_MAP = {
    'planning':  'DRAFT',
    'active':    'ACTIVE',
    'paused':    'PAUSED',
    'completed': 'ARCHIVED',
    'archived':  'ARCHIVED'
  };
  var V2_AD_STATUS_MAP = {
    'draft':         'hook_ready',
    'hook_ready':    'hook_ready',
    'content_ready': 'copy_ready',
    'media_ready':   'media_ready',
    'in_review':     'in_review',
    'approved':      'approved',
    'live':          'live',
    'paused':        'paused',
    'archived':      'archived'
  };
  var V2_CREATIVE_TYPE_MAP = {
    'image':    'single_image',
    'carousel': 'carousel',
    'video':    'single_video'
  };

  // --- Entry point ---

  function openMigrationWizard() {
    var oldCamps = (S.data.campaigns || []).length;
    var oldRecipes = (S.data.recipes || []).length;
    if (oldCamps === 0 && oldRecipes === 0) {
      toast('No legacy data to migrate. You can enable Meta v2 directly from Settings.', 'info');
      return;
    }
    if (S.meta.setup && S.meta.setup.migrated_to_v2) {
      openConfirmDialog({
        title: 'Already migrated',
        message: 'This workspace has already been migrated to Meta v2. Run again anyway? (Existing v2 entities will be preserved; legacy data will be re-imported alongside.)',
        confirmLabel: 'Run again',
        onConfirm: function() { closeConfirmDialog(); v2MigrationState = { step: 1, mappings: {}, summary: null }; renderMigrationWizardStep(); }
      });
      return;
    }
    v2MigrationState = { step: 1, mappings: {}, summary: null };
    renderMigrationWizardStep();
  }

  function renderMigrationWizardStep() {
    var step = v2MigrationState.step;
    var html = '<div class="cp-v2-migration-wizard">';
    html += renderMigrationStepIndicator(step);
    html += '<div class="cp-v2-migration-body">';
    if (step === 1)      html += renderMigrationStep1Backup();
    else if (step === 2) html += renderMigrationStep2Objectives();
    else if (step === 3) html += renderMigrationStep3AdSets();
    else if (step === 4) html += renderMigrationStep4Preview();
    else if (step === 5) html += renderMigrationStep5Summary();
    html += '</div>';
    html += '<div class="cp-v2-migration-footer">';
    if (step > 1 && step < 5) html += '<button class="cp-btn cp-btn-outline" data-action="v2-mig-back">' + icon('arrow-left') + ' Back</button>';
    else html += '<span></span>';
    if (step < 4)      html += '<button class="cp-btn cp-btn-primary" data-action="v2-mig-next">Next ' + icon('arrow-right') + '</button>';
    else if (step === 4) html += '<button class="cp-btn cp-btn-ai" data-action="v2-mig-run">' + icon('bolt') + ' Run migration</button>';
    else if (step === 5) html += '<button class="cp-btn cp-btn-primary" data-action="close-modal">Done</button>';
    html += '</div></div>';

    openModal('Migrate to Meta v2 — Step ' + step + ' of 5', html, {
      titleIcon: 'wand-magic', size: 'xl', footer: false
    });

    // Step navigation
    $(document).off('click.cpv2-mig-next').on('click.cpv2-mig-next', '[data-action="v2-mig-next"]', function(e) {
      e.preventDefault();
      v2MigrationState.step++;
      renderMigrationWizardStep();
    });
    $(document).off('click.cpv2-mig-back').on('click.cpv2-mig-back', '[data-action="v2-mig-back"]', function(e) {
      e.preventDefault();
      v2MigrationState.step--;
      renderMigrationWizardStep();
    });
    $(document).off('click.cpv2-mig-run').on('click.cpv2-mig-run', '[data-action="v2-mig-run"]', function(e) {
      e.preventDefault();
      runMigration();
    });
  }

  function renderMigrationStepIndicator(currentStep) {
    var steps = ['Backup', 'Objectives', 'Ad Sets', 'Preview', 'Done'];
    var html = '<div class="cp-v2-migration-steps">';
    for (var i = 0; i < steps.length; i++) {
      var s = i + 1;
      var cls = s === currentStep ? ' cp-v2-mig-step-active' : (s < currentStep ? ' cp-v2-mig-step-done' : '');
      html += '<div class="cp-v2-mig-step' + cls + '">';
      html += '<span class="cp-v2-mig-step-num">' + (s < currentStep ? icon('circle-check') : s) + '</span>';
      html += '<span class="cp-v2-mig-step-label">' + esc(steps[i]) + '</span>';
      html += '</div>';
      if (i < steps.length - 1) html += '<div class="cp-v2-mig-step-connector"></div>';
    }
    html += '</div>';
    return html;
  }

  // --- Step 1: Backup confirmation ---

  function renderMigrationStep1Backup() {
    var oldCamps = (S.data.campaigns || []).length;
    var oldRecipes = (S.data.recipes || []).length;
    var oldPersonas = (S.data.personas || []).length;
    var oldMessages = (S.data.messages || []).length;

    var html = '<h3>' + icon('shield') + ' Backup before we begin</h3>';
    html += '<p>Your existing workspace contains:</p>';
    html += '<div class="cp-v2-mig-stats">';
    html += '<div class="cp-v2-mig-stat"><div class="cp-v2-mig-stat-val">' + oldCamps + '</div><div class="cp-v2-mig-stat-lbl">Campaigns</div></div>';
    html += '<div class="cp-v2-mig-stat"><div class="cp-v2-mig-stat-val">' + oldRecipes + '</div><div class="cp-v2-mig-stat-lbl">Recipes</div></div>';
    html += '<div class="cp-v2-mig-stat"><div class="cp-v2-mig-stat-val">' + oldPersonas + '</div><div class="cp-v2-mig-stat-lbl">Personas (kept)</div></div>';
    html += '<div class="cp-v2-mig-stat"><div class="cp-v2-mig-stat-val">' + oldMessages + '</div><div class="cp-v2-mig-stat-lbl">Messages (kept)</div></div>';
    html += '</div>';

    html += '<div class="cp-card cp-v2-mig-info-box">';
    html += '<h4>' + icon('info') + ' What this wizard does</h4>';
    html += '<ul>';
    html += '<li>Each legacy <strong>Campaign</strong> becomes a new Meta-shaped <strong>Campaign</strong> with sensible defaults (objective mapped, status mapped, brief preserved).</li>';
    html += '<li>For each legacy campaign, recipes are grouped by their <code>persona_id</code> and become one <strong>Ad Set</strong> per persona.</li>';
    html += '<li>Each <strong>recipe</strong> becomes an <strong>Ad</strong> under its persona\'s Ad Set, preserving hook, copy, media briefs, status, assignee, and dates.</li>';
    html += '<li>The Library (personas, messages, styles, formats, pain points) stays exactly as it is — those are reusable resources.</li>';
    html += '<li>All legacy data is backed up to <code>S.meta.legacy_backup</code> so you can recover anything. Old views disappear from the sidebar after migration.</li>';
    html += '</ul>';
    html += '</div>';
    return html;
  }

  // --- Step 2: Objective mapping ---

  function renderMigrationStep2Objectives() {
    var camps = S.data.campaigns || [];
    var html = '<h3>' + icon('bullseye-arrow') + ' Map legacy objectives to Meta objectives</h3>';
    html += '<p class="cp-text-muted">We\'ve pre-filled likely matches. Adjust any that look wrong.</p>';

    if (!v2MigrationState.mappings.objectives) v2MigrationState.mappings.objectives = {};
    var objMap = v2MigrationState.mappings.objectives;

    html += '<table class="cp-v2-mig-mapping-table"><thead><tr><th>Campaign</th><th>Legacy objective</th><th>Meta objective</th></tr></thead><tbody>';
    for (var i = 0; i < camps.length; i++) {
      var c = camps[i];
      var legacyObj = (Constants.CAMPAIGN_OBJECTIVES || []).find(function(o) { return o.id === c.objective; });
      var legacyLabel = legacyObj ? legacyObj.name : (c.objective || '(none)');
      var defaultMeta = V2_OBJ_MAP[c.objective] || 'OUTCOME_LEADS';
      if (!objMap[c.id]) objMap[c.id] = defaultMeta;
      html += '<tr><td><strong>' + esc(c.name) + '</strong></td>';
      html += '<td>' + esc(legacyLabel) + '</td>';
      html += '<td><select class="cp-select cp-v2-mig-obj-select" data-camp-id="' + esc(c.id) + '">';
      for (var ok in Constants.META_OBJECTIVES) {
        var oSel = (objMap[c.id] === ok) ? ' selected' : '';
        html += '<option value="' + ok + '"' + oSel + '>' + esc(Constants.META_OBJECTIVES[ok].label) + '</option>';
      }
      html += '</select></td></tr>';
    }
    html += '</tbody></table>';

    $(document).off('change.cpv2-mig-obj').on('change.cpv2-mig-obj', '.cp-v2-mig-obj-select', function() {
      objMap[$(this).data('camp-id')] = $(this).val();
    });
    return html;
  }

  // --- Step 3: Ad Set grouping preview ---

  function renderMigrationStep3AdSets() {
    var camps = S.data.campaigns || [];
    var recipes = S.data.recipes || [];

    var html = '<h3>' + icon('crosshairs') + ' Ad Set grouping preview</h3>';
    html += '<p class="cp-text-muted">Each legacy campaign\'s recipes are grouped by persona. Each group becomes one Ad Set.</p>';

    for (var i = 0; i < camps.length; i++) {
      var c = camps[i];
      var campRecipes = recipes.filter(function(r) { return r.campaign_id === c.id; });
      // Group by persona_id
      var groups = {};
      campRecipes.forEach(function(r) {
        var key = r.persona_id || '__unassigned__';
        groups[key] = groups[key] || [];
        groups[key].push(r);
      });
      var groupKeys = Object.keys(groups);

      html += '<div class="cp-card cp-v2-mig-camp-card">';
      html += '<div class="cp-v2-mig-camp-name">' + icon('bullhorn') + ' ' + esc(c.name) + ' — ' + groupKeys.length + ' Ad Set' + (groupKeys.length !== 1 ? 's' : '') + ', ' + campRecipes.length + ' Ad' + (campRecipes.length !== 1 ? 's' : '') + '</div>';
      if (groupKeys.length === 0) {
        html += '<div class="cp-text-muted">No recipes in this campaign. The Campaign will be created without Ad Sets.</div>';
      } else {
        html += '<div class="cp-v2-mig-group-list">';
        for (var gi = 0; gi < groupKeys.length; gi++) {
          var pid = groupKeys[gi];
          var persona = (pid === '__unassigned__') ? null : S.personaMap[pid];
          var personaName = persona ? persona.name : '(no persona)';
          var groupRecipes = groups[pid];
          html += '<div class="cp-v2-mig-group">';
          html += '<span class="cp-v2-mig-group-persona">' + icon('user') + ' ' + esc(personaName) + '</span>';
          html += '<span class="cp-v2-mig-group-count">' + groupRecipes.length + ' Ad' + (groupRecipes.length !== 1 ? 's' : '') + '</span>';
          html += '</div>';
        }
        html += '</div>';
      }
      html += '</div>';
    }
    return html;
  }

  // --- Step 4: Field mapping preview ---

  function renderMigrationStep4Preview() {
    var sample = (S.data.recipes || []).slice(0, 3);
    var html = '<h3>' + icon('file-lines') + ' Field mapping preview</h3>';
    html += '<p class="cp-text-muted">Here\'s how the first few recipes will become Ads. Click "Run migration" when you\'re ready.</p>';

    if (sample.length === 0) {
      html += '<div class="cp-empty-state cp-empty-state--compact"><p>No recipes to migrate.</p></div>';
      return html;
    }

    for (var i = 0; i < sample.length; i++) {
      var r = sample[i];
      var newAd = mapRecipeToAd(r);
      html += '<div class="cp-card cp-v2-mig-preview-card">';
      html += '<div class="cp-v2-mig-preview-header">';
      html += '<div><strong>' + icon('shuffle') + ' Recipe:</strong> ' + esc(r.title || 'Untitled') + '</div>';
      html += '<div class="cp-text-muted" style="font-size:11px;margin-top:2px">→ Will become Ad: <strong>' + esc(newAd.name) + '</strong></div>';
      html += '</div>';
      html += '<div class="cp-v2-mig-preview-fields">';
      html += '<div><span class="cp-v2-mig-field-key">Creative type</span><span class="cp-v2-mig-field-val">' + esc(newAd.creative_type) + '</span></div>';
      html += '<div><span class="cp-v2-mig-field-key">Status</span><span class="cp-v2-mig-field-val">' + esc(newAd.pipeline_status) + '</span></div>';
      if (newAd.hook.text) html += '<div><span class="cp-v2-mig-field-key">Hook</span><span class="cp-v2-mig-field-val">' + esc(truncate(newAd.hook.text, 80)) + '</span></div>';
      if (newAd.creative.primary_text) html += '<div><span class="cp-v2-mig-field-key">Primary text</span><span class="cp-v2-mig-field-val">' + esc(truncate(newAd.creative.primary_text, 80)) + '</span></div>';
      if (newAd.creative.headline) html += '<div><span class="cp-v2-mig-field-key">Headline</span><span class="cp-v2-mig-field-val">' + esc(newAd.creative.headline) + '</span></div>';
      if (newAd.creative.cta_type) html += '<div><span class="cp-v2-mig-field-key">CTA</span><span class="cp-v2-mig-field-val">' + esc(newAd.creative.cta_type) + '</span></div>';
      html += '</div>';
      html += '</div>';
    }

    if ((S.data.recipes || []).length > 3) {
      html += '<div class="cp-text-muted">+ ' + ((S.data.recipes || []).length - 3) + ' more recipes will be migrated the same way.</div>';
    }
    return html;
  }

  // --- Step 5: Summary ---

  function renderMigrationStep5Summary() {
    var sum = v2MigrationState.summary || {};
    var html = '<h3>' + icon('circle-check') + ' Migration complete</h3>';
    html += '<p>Your workspace has been migrated to Meta v2.</p>';
    html += '<div class="cp-v2-mig-stats">';
    html += '<div class="cp-v2-mig-stat"><div class="cp-v2-mig-stat-val">' + (sum.campaigns || 0) + '</div><div class="cp-v2-mig-stat-lbl">Campaigns</div></div>';
    html += '<div class="cp-v2-mig-stat"><div class="cp-v2-mig-stat-val">' + (sum.ad_sets || 0) + '</div><div class="cp-v2-mig-stat-lbl">Ad Sets</div></div>';
    html += '<div class="cp-v2-mig-stat"><div class="cp-v2-mig-stat-val">' + (sum.ads || 0) + '</div><div class="cp-v2-mig-stat-lbl">Ads</div></div>';
    html += '<div class="cp-v2-mig-stat"><div class="cp-v2-mig-stat-val">' + (sum.errors || 0) + '</div><div class="cp-v2-mig-stat-lbl">Errors</div></div>';
    html += '</div>';
    html += '<div class="cp-card cp-v2-mig-info-box">';
    html += '<h4>' + icon('shield') + ' Your legacy data is safe</h4>';
    html += '<p>Old campaigns + recipes are preserved in <code>S.meta.legacy_backup</code>. You can recover or re-import anytime from Settings.</p>';
    html += '</div>';
    return html;
  }

  // --- Recipe → Ad field mapping ---

  function mapRecipeToAd(r) {
    var hook = r.hook || {};
    var content = r.content || {};
    var imgBrief = r.image_brief || {};
    var vid = r.video || {};
    return {
      name: r.title || 'Migrated Ad',
      creative_type: V2_CREATIVE_TYPE_MAP[r.media_type] || 'single_image',
      pipeline_status: V2_AD_STATUS_MAP[r.status] || 'hook_ready',
      hook: {
        text: hook.custom_hook || '',
        type: hook.hook_type || 'direct',
        source_message_id: r.message_id || '',
        selected_hook_id: hook.selected_hook_id || ''
      },
      creative: {
        primary_text: stripHtml(content.ad_copy || ''),
        headline: content.headline || '',
        description: content.description || '',
        cta_type: 'LEARN_MORE',  // Legacy stored as free text; default to LEARN_MORE
        cta_link: '',
        display_link: '',
        tracking_params: ''
      },
      media: {
        image: {
          asset_id: '',
          ai_prompt: imgBrief.ai_prompt || '',
          brief: imgBrief.creative_brief || '',
          aspect_ratio: (imgBrief.prompt_params && imgBrief.prompt_params.aspect_ratio) || '1:1',
          negative_prompt: (imgBrief.prompt_params && imgBrief.prompt_params.negative_prompt) || '',
          reference_image_ids: (imgBrief.reference_image_ids || []).slice()
        },
        video: {
          asset_id: '',
          duration_seconds: vid.duration_seconds || 30,
          aspect_ratio: vid.aspect_ratio || '9:16',
          concept: vid.concept || '',
          blueprint: vid.blueprint || { scenes: [] },
          script: vid.script || { rows: [] }
        },
        carousel_cards: []
      },
      assigned_to: r.assigned_to || '',
      due_date: r.due_date || '',
      production_notes: r.production_notes || '',
      review_notes: r.review_notes || '',
      tags: (r.tags || []).slice(),
      created: r.created || new Date().toISOString(),
      updated: r.updated || r.created || new Date().toISOString()
    };
  }

  // --- The actual migration runner ---

  function runMigration() {
    snapshot('Legacy migration');
    var summary = { campaigns: 0, ad_sets: 0, ads: 0, errors: 0 };
    var objMap = (v2MigrationState.mappings && v2MigrationState.mappings.objectives) || {};

    // Backup legacy data
    S.meta.legacy_backup = {
      timestamp: new Date().toISOString(),
      campaigns: deepClone(S.data.campaigns || []),
      recipes: deepClone(S.data.recipes || [])
    };

    var legacyCamps = S.data.campaigns || [];
    var legacyRecipes = S.data.recipes || [];

    legacyCamps.forEach(function(c) {
      try {
        // Create the v2 Campaign
        var newCamp = createEntity('campaign_v2', {
          name: c.name || 'Migrated Campaign',
          description: c.description || '',
          objective: objMap[c.id] || V2_OBJ_MAP[c.objective] || 'OUTCOME_LEADS',
          status: V2_CAMP_STATUS_MAP[c.status] || 'DRAFT',
          buying_type: 'AUCTION',
          budget_mode: 'CBO',
          bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
          start_time: c.date_start ? (new Date(c.date_start)).toISOString() : '',
          stop_time: c.date_end ? (new Date(c.date_end)).toISOString() : '',
          brief: c.brief || '',
          ai_instructions: c.ai_instructions || '',
          notes: c.budget_notes || c.target_audience_notes ? [c.budget_notes, c.target_audience_notes].filter(Boolean).join('\n\n') : (c.notes || ''),
          tags: (c.tags || []).slice(),
          created: c.created || new Date().toISOString(),
          updated: c.updated || c.created || new Date().toISOString()
        });
        if (!newCamp) { summary.errors++; return; }
        summary.campaigns++;

        // Group recipes by persona
        var campRecipes = legacyRecipes.filter(function(r) { return r.campaign_id === c.id; });
        var groups = {};
        campRecipes.forEach(function(r) {
          var key = r.persona_id || '__unassigned__';
          groups[key] = groups[key] || [];
          groups[key].push(r);
        });

        Object.keys(groups).forEach(function(personaKey) {
          var personaId = personaKey === '__unassigned__' ? '' : personaKey;
          var persona = personaId ? getPersona(personaId) : null;
          var grp = groups[personaKey];

          // Pull message_ids/style_ids/format_ids from the legacy campaign + recipe set
          var briefMessageIds = (c.message_ids || []).slice();
          var briefStyleIds = (c.style_ids || []).slice();
          var briefFormatIds = (c.format_ids || []).slice();

          var newSet = createEntity('ad_set', {
            campaign_id: newCamp.id,
            name: persona ? (newCamp.name + ' — ' + persona.name) : (newCamp.name + ' — Untargeted'),
            persona_id: persona ? persona.id : '',
            persona_snapshot: persona ? buildPersonaSnapshot(persona) : null,
            optimization_goal: Constants.META_AD_SET_DEFAULTS.optimization_goal,
            billing_event: 'IMPRESSIONS',
            attribution_setting: '7d_click',
            brief: {
              creative_direction: c.brief || '',
              message_ids: briefMessageIds,
              style_ids: briefStyleIds,
              format_ids: briefFormatIds,
              hook_angles: [],
              ai_notes: c.ai_instructions || ''
            },
            status: V2_CAMP_STATUS_MAP[c.status] === 'ACTIVE' ? 'ACTIVE' : 'DRAFT',
            created: c.created || new Date().toISOString()
          });
          if (!newSet) { summary.errors++; return; }
          summary.ad_sets++;

          // Create Ads for each recipe
          grp.forEach(function(r) {
            try {
              var adPayload = mapRecipeToAd(r);
              adPayload.ad_set_id = newSet.id;
              var newAd = createEntity('ad', adPayload);
              if (newAd) summary.ads++;
              else summary.errors++;
            } catch (e) {
              console.error('[CP v2 migration] Ad mapping failed:', r.id, e);
              summary.errors++;
            }
          });
        });
      } catch (e) {
        console.error('[CP v2 migration] Campaign mapping failed:', c.id, e);
        summary.errors++;
      }
    });

    // Clear legacy arrays now that they're safely in backup
    S.data.campaigns = [];
    S.data.recipes = [];

    // Flip flags
    S.meta.setup = S.meta.setup || {};
    S.meta.setup.meta_v2 = true;
    S.meta.setup.migrated_to_v2 = true;

    buildMaps(); syncToTextarea();
    logActivity('legacy_migrated', 'workspace', '', '', 'Migrated: ' + summary.campaigns + ' campaigns, ' + summary.ad_sets + ' ad sets, ' + summary.ads + ' ads');

    v2MigrationState.summary = summary;
    v2MigrationState.step = 5;
    renderMigrationWizardStep();
    // Force a re-render of the app shell so the sidebar regroups
    if (window._cpRenderAppShell) {
      $('#cpApp').html(window._cpRenderAppShell());
      render();
    }
  }

  // --- Discard legacy backup (Settings action) ---

  function discardLegacyBackup() {
    openConfirmDialog({
      title: 'Discard legacy backup?',
      message: 'This permanently deletes your pre-v2 campaigns and recipes. Your migrated v2 data will be unaffected.',
      confirmLabel: 'Discard backup',
      danger: true,
      onConfirm: function() {
        snapshot('Discard legacy backup');
        S.meta.legacy_backup = null;
        syncToTextarea();
        toast('Legacy backup discarded', 'success');
        render();
      }
    });
  }
