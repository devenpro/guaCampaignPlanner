/**
 * Campaign Planner v1.0 - Part 2A: CRUD, Pipeline Editor & Mix/Match
 *
 * Modals, undo/redo, 9 entity CRUDs, 5 pipeline step renderers,
 * Mix & Match Engine, tag input component, event handlers.
 *
 * Registry: step_composition, step_hook, step_content, step_media,
 *   step_review, tagInput
 *
 * Sections:
 *  1. Init & imports
 *  2. Modal system
 *  3. Undo/redo
 *  4. Category CRUD
 *  5. Persona CRUD
 *  6. Pain Point CRUD
 *  7. Message CRUD (with hooks)
 *  8. Style & Format CRUD
 *  9. Campaign CRUD
 * 10. Tag CRUD
 * 11. Composition step renderer
 * 12. Hook step renderer
 * 13. Content step renderer
 * 14. Media step renderer (image + video)
 * 15. Review step renderer
 * 16. Save helpers (pipeline-specific)
 * 17. Mix & Match Engine
 * 18. Tag input component
 * 19. Event handlers
 * 20. API exports
 *
 * @version 1.0.0
 */
(function($, Drupal) {
  'use strict';

  // Early load flag — set immediately so Part 2B knows this file loaded
  window._cpPart2AScript = true;

  // ============================================================
  // SECTION 1: INIT & IMPORTS
  // ============================================================

  var S, render, navigate, toast, generateId, buildMaps, syncToTextarea;
  var updateSaveStatus, esc, deepClone, icon, formatDate, formatRelativeTime;
  var truncate, formatNumber, stripHtml, countWords, countChars;
  var badge, recipeStatusBadge, campaignStatusBadge, priorityBadge;
  var funnelBadge, dimensionBadge, mediaTypeBadge, hookTypeBadge, progressBar;
  var logActivity, maybeAdvanceRecipeStatus;
  var createEntity, deleteEntity, saveEntityField, duplicateEntity;
  var getAllPersonas, getAllMessages, getAllStyles, getAllFormats;
  var getAllCategories, getAllPainPoints, getAllCampaigns, getAllTags;
  var getPersonaPainPoints, getPersona, getMessage, getStyle, getFormat;
  var getCategory, getCampaign, getTag, getPainPoint, getFunnelStage;
  var getFilteredRecipes, getRecipe;
  var Constants;

  console.log('[CP] Part 2A script loaded');

  var _checkCount = 0;
  var checkInterval = setInterval(function() {
    _checkCount++;
    if (window._cpState && window._cpState.initialized) {
      clearInterval(checkInterval);
      console.log('[CP] Part 2A: Part 1 ready after ' + (_checkCount * 100) + 'ms — calling initPart2A()');
      try { initPart2A(); } catch(e) { console.error('[CP] Part 2A init CRASHED:', e.message, e.stack); }
    }
    else if (_checkCount > 100) {
      clearInterval(checkInterval);
      console.error('[CP] Part 2A: Timed out. _cpState=' + !!window._cpState + ', initialized=' + !!(window._cpState && window._cpState.initialized));
    }
    else if (_checkCount === 20) {
      console.log('[CP] Part 2A: Still waiting (2s). _cpState=' + !!window._cpState + ', initialized=' + !!(window._cpState && window._cpState.initialized));
    }
  }, 100);

  function initPart2A() {
    console.log('[CP] Initializing Part 2A...');

    // Import Part 1 exports
    S = window._cpState;
    render = window._cpRender; navigate = window._cpNavigate; toast = window._cpToast;
    generateId = window._cpGenerateId; buildMaps = window._cpBuildMaps;
    syncToTextarea = window._cpSyncToTextarea; updateSaveStatus = window._cpUpdateSaveStatus;
    esc = window._cpEsc; deepClone = window._cpDeepClone; icon = window._cpIcon;
    formatDate = window._cpFormatDate; formatRelativeTime = window._cpFormatRelativeTime;
    truncate = window._cpTruncate; formatNumber = window._cpFormatNumber;
    stripHtml = window._cpStripHtml; countWords = window._cpCountWords; countChars = window._cpCountChars;
    badge = window._cpBadge;
    recipeStatusBadge = window._cpRecipeStatusBadge; campaignStatusBadge = window._cpCampaignStatusBadge;
    priorityBadge = window._cpPriorityBadge; funnelBadge = window._cpFunnelBadge;
    dimensionBadge = window._cpDimensionBadge; mediaTypeBadge = window._cpMediaTypeBadge;
    hookTypeBadge = window._cpHookTypeBadge;
    progressBar = window._cpProgressBar;
    logActivity = window._cpLogActivity; maybeAdvanceRecipeStatus = window._cpMaybeAdvanceRecipeStatus;
    createEntity = window._cpCreateEntity; deleteEntity = window._cpDeleteEntity;
    saveEntityField = window._cpSaveEntityField; duplicateEntity = window._cpDuplicateEntity;
    getAllPersonas = window._cpGetAllPersonas; getAllMessages = window._cpGetAllMessages;
    getAllStyles = window._cpGetAllStyles; getAllFormats = window._cpGetAllFormats;
    getAllCategories = window._cpGetAllCategories; getAllPainPoints = window._cpGetAllPainPoints;
    getAllCampaigns = window._cpGetAllCampaigns; getAllTags = window._cpGetAllTags;
    getPersonaPainPoints = window._cpGetPersonaPainPoints;
    getPersona = window._cpGetPersona; getMessage = window._cpGetMessage;
    getStyle = window._cpGetStyle; getFormat = window._cpGetFormat;
    getCategory = window._cpGetCategory; getCampaign = window._cpGetCampaign;
    getTag = window._cpGetTag; getPainPoint = window._cpGetPainPoint;
    getFunnelStage = window._cpGetFunnelStage;
    getFilteredRecipes = window._cpGetFilteredRecipes; getRecipe = window._cpGetRecipe;
    Constants = window._cpConstants;

    // AI picker helper — lazy evaluation (Part 2B may not be loaded yet)
    window._cpAiSel = function(actionId) {
      if (window._cpPart2B && window._cpPart2B.renderInlinePicker) {
        return window._cpPart2B.renderInlinePicker(actionId);
      }
      return '<span class="cp-ai-picker-loading" data-pending-action="' + esc(actionId) + '">' + icon('spinner') + '</span>';
    };

    // Register step renderers
    var R = window._cpRenderers = window._cpRenderers || {};
    R.step_composition = renderCompositionStep;
    R.step_hook = renderHookStep;
    R.step_content = renderContentStep;
    R.step_media = renderMediaStep;
    R.step_review = renderReviewStep;
    R.tagInput = renderTagInput;

    setupPart2AEvents();
    try { snapshot('Initial state'); } catch(snapErr) { console.warn('[CP] Part 2A: snapshot failed (non-fatal):', snapErr.message); }
    if (render) render();
    console.log('[CP] Part 2A initialized — ' + Object.keys(window._cpPart2A || {}).length + ' exports');
  }

  // ============================================================
  // SECTION 2: MODAL SYSTEM
  // ============================================================

  var currentModal = null;

  function openModal(title, content, options) {
    options = options || {};
    closeModal();
    var size = options.size || 'md';
    var html = '<div class="cp-modal-backdrop"><div class="cp-modal cp-modal-' + size + '">';
    html += '<div class="cp-modal-header"><h3>' + (options.titleIcon ? icon(options.titleIcon) + ' ' : '') + esc(title) + '</h3>';
    html += '<button class="cp-btn-icon cp-modal-close" data-action="close-modal">' + icon('x') + '</button></div>';
    html += '<div class="cp-modal-body">' + content + '</div>';
    if (options.footer !== false) {
      html += '<div class="cp-modal-footer">';
      html += '<button class="cp-btn cp-btn-outline" data-action="close-modal">Cancel</button>';
      html += '<button class="cp-btn ' + (options.danger ? 'cp-btn-danger' : options.ai ? 'cp-btn-ai' : 'cp-btn-primary') + '" data-action="modal-save">' + (options.saveLabel || 'Save') + '</button>';
      html += '</div>';
    }
    html += '</div></div>';
    $('body').append(html);
    currentModal = options;
    setTimeout(function() { $('.cp-modal-backdrop').addClass('cp-modal-visible'); }, 10);
    // Focus first input
    setTimeout(function() { $('.cp-modal-body input:visible, .cp-modal-body textarea:visible').first().focus(); }, 100);
  }

  function closeModal() {
    $('.cp-modal-backdrop').remove();
    currentModal = null;
  }

  function openConfirmDialog(opts) {
    var html = '<div class="cp-confirm-backdrop"><div class="cp-confirm-dialog">';
    html += '<h3>' + esc(opts.title || 'Confirm') + '</h3>';
    html += '<p>' + esc(opts.message || 'Are you sure?') + '</p>';
    html += '<div class="cp-confirm-actions">';
    html += '<button class="cp-btn cp-btn-outline" data-action="confirm-cancel">Cancel</button>';
    html += '<button class="cp-btn ' + (opts.danger ? 'cp-btn-danger' : 'cp-btn-primary') + '" data-action="confirm-ok">' + esc(opts.confirmLabel || 'Confirm') + '</button>';
    html += '</div></div></div>';
    $('body').append(html);
    $(document).off('click.cp2a-cok').on('click.cp2a-cok', '[data-action="confirm-ok"]', function() {
      closeConfirmDialog();
      if (opts.onConfirm) opts.onConfirm();
    });
    $(document).off('click.cp2a-ccn').on('click.cp2a-ccn', '[data-action="confirm-cancel"]', function() {
      closeConfirmDialog();
    });
  }

  function closeConfirmDialog() {
    $('.cp-confirm-backdrop').remove();
    $(document).off('click.cp2a-cok click.cp2a-ccn');
  }

  function collectModalFields() {
    var data = {};
    $('.cp-modal-body [data-field]').each(function() {
      var $f = $(this);
      var field = $f.data('field');
      if ($f.is(':checkbox')) {
        data[field] = $f.is(':checked');
      } else if ($f.is('select[multiple]')) {
        data[field] = $f.val() || [];
      } else {
        data[field] = $f.val();
      }
    });
    return data;
  }

  // Collect funnel stage chip selections
  function collectFunnelChips() {
    var selected = [];
    $('.cp-modal-body .cp-funnel-chip-active').each(function() {
      selected.push($(this).data('stage-id'));
    });
    return selected;
  }

  // ============================================================
  // SECTION 3: UNDO/REDO
  // ============================================================

  function snapshot(label) {
    S.undoStack = S.undoStack || [];
    S.undoStack.push({
      label: label || '',
      data: deepClone(S.data),
      meta: deepClone(S.meta),
      activity: deepClone(S.activity)
    });
    if (S.undoStack.length > 50) S.undoStack.shift();
    S.redoStack = [];
  }

  function undo() {
    if (!S.undoStack || S.undoStack.length <= 1) { toast('Nothing to undo', 'info'); return; }
    S.redoStack = S.redoStack || [];
    S.redoStack.push(S.undoStack.pop());
    var prev = S.undoStack[S.undoStack.length - 1];
    S.data = deepClone(prev.data);
    if (prev.meta) S.meta = deepClone(prev.meta);
    if (prev.activity) S.activity = deepClone(prev.activity);
    buildMaps(); render(); syncToTextarea();
    toast('Undone', 'info');
  }

  function redo() {
    if (!S.redoStack || S.redoStack.length === 0) { toast('Nothing to redo', 'info'); return; }
    var next = S.redoStack.pop();
    S.undoStack.push(next);
    S.data = deepClone(next.data);
    if (next.meta) S.meta = deepClone(next.meta);
    if (next.activity) S.activity = deepClone(next.activity);
    buildMaps(); render(); syncToTextarea();
    toast('Redone', 'info');
  }

  // ============================================================
  // SECTION 4: CATEGORY CRUD
  // ============================================================

  function openCategoryModal(catId) {
    var isEdit = !!catId;
    var cat = isEdit ? getCategory(catId) : null;

    var html = '<div class="cp-editor-form">';
    html += '<div class="cp-form-group"><label>Category Name *</label>';
    html += '<input type="text" class="cp-input" data-field="name" value="' + esc(cat ? cat.name : '') + '" placeholder="e.g., Educator, Student, Professional"></div>';
    html += '<div class="cp-form-group"><label>Description</label>';
    html += '<input type="text" class="cp-input" data-field="description" value="' + esc(cat ? cat.description || '' : '') + '" placeholder="Brief description of this category"></div>';
    html += '</div>';

    openModal(isEdit ? 'Edit Category' : 'New Category', html, {
      titleIcon: 'folder-plus',
      size: 'sm',
      saveLabel: isEdit ? 'Save' : 'Create Category',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.name || !fields.name.trim()) { toast('Category name is required', 'warning'); return; }
        if (isEdit) {
          snapshot('Edit category');
          saveEntityField('persona_category', catId, 'name', fields.name.trim());
          if (fields.description !== undefined) saveEntityField('persona_category', catId, 'description', fields.description || '');
        } else {
          createEntity('persona_category', { name: fields.name.trim(), description: fields.description || '' });
          snapshot('Create category');
        }
        closeModal();
      }
    });
  }

  function confirmDeleteCategory(catId) {
    var cat = getCategory(catId);
    if (!cat) return;
    var personaCount = (S.data.personas || []).filter(function(p) { return p.category_id === catId; }).length;
    openConfirmDialog({
      title: 'Delete Category',
      message: 'Delete "' + cat.name + '"?' + (personaCount > 0 ? ' ' + personaCount + ' persona(s) will become uncategorized.' : ''),
      confirmLabel: 'Delete', danger: true,
      onConfirm: function() {
        snapshot('Delete category');
        deleteEntity('persona_category', catId);
      }
    });
  }

  // ============================================================
  // SECTION 5: PERSONA CRUD
  // ============================================================

  function openPersonaModal(personaId) {
    var isEdit = !!personaId;
    var p = isEdit ? getPersona(personaId) : null;
    var demo = p ? (p.demographics || {}) : {};
    var psych = p ? (p.psychographics || {}) : {};
    var categories = getAllCategories();
    var painPoints = getAllPainPoints();
    var linkedPPs = p ? (p.pain_point_ids || []) : [];

    var html = '<div class="cp-editor-form">';

    // Basic fields
    html += '<div class="cp-form-row"><div class="cp-form-half">';
    html += '<label>Persona Name *</label>';
    html += '<input type="text" class="cp-input" data-field="name" value="' + esc(p ? p.name : '') + '" placeholder="e.g., YouTuber Educator">';
    html += '</div><div class="cp-form-half">';
    html += '<label>Category</label>';
    html += '<select class="cp-select" data-field="category_id">';
    html += '<option value="">Uncategorized</option>';
    for (var ci = 0; ci < categories.length; ci++) {
      var sel = (p && p.category_id === categories[ci].id) ? ' selected' : '';
      html += '<option value="' + esc(categories[ci].id) + '"' + sel + '>' + esc(categories[ci].name) + '</option>';
    }
    html += '</select></div></div>';

    html += '<div class="cp-form-group"><label>Description</label>';
    html += '<textarea class="cp-textarea" data-field="description" rows="2" placeholder="Brief description of this persona...">' + esc(p ? p.description || '' : '') + '</textarea></div>';

    // Demographics
    html += '<div class="cp-card cp-persona-demographics" style="margin-bottom:12px">';
    html += '<h3 style="margin-bottom:12px">' + icon('user') + ' Demographics</h3>';
    html += '<div class="cp-demo-grid">';
    var demoFields = [
      ['age_range', 'Age Range', 'e.g., 20-35'],
      ['gender', 'Gender', 'e.g., Male, Female, All'],
      ['location', 'Location', 'e.g., Tier 1/2 Cities'],
      ['income_level', 'Income Level', 'e.g., Middle, Upper'],
      ['education', 'Education', 'e.g., Graduate'],
      ['occupation', 'Occupation', 'e.g., Content Creator']
    ];
    for (var di = 0; di < demoFields.length; di++) {
      html += '<div class="cp-form-group"><label>' + esc(demoFields[di][1]) + '</label>';
      html += '<input type="text" class="cp-input" data-field="demo_' + demoFields[di][0] + '" value="' + esc(demo[demoFields[di][0]] || '') + '" placeholder="' + esc(demoFields[di][2]) + '"></div>';
    }
    html += '</div></div>';

    // Psychographics
    html += '<div class="cp-card cp-persona-psychographics" style="margin-bottom:12px">';
    html += '<h3 style="margin-bottom:12px">' + icon('heart') + ' Psychographics</h3>';
    html += '<div class="cp-psych-grid">';
    var psychFields = [
      ['desires', 'Desires & Motivations', 'What they want to achieve...'],
      ['requirements', 'Requirements', 'What they need in a solution...'],
      ['emotional_triggers', 'Emotional Triggers', 'What drives their decisions...'],
      ['motivations', 'Motivations', 'Deeper motivations...'],
      ['fears', 'Fears & Obstacles', 'What holds them back...'],
      ['values', 'Values', 'What they believe in...']
    ];
    for (var psi = 0; psi < psychFields.length; psi++) {
      html += '<div class="cp-form-group"><label>' + esc(psychFields[psi][1]) + '</label>';
      html += '<textarea class="cp-textarea" data-field="psych_' + psychFields[psi][0] + '" rows="2" placeholder="' + esc(psychFields[psi][2]) + '">' + esc(psych[psychFields[psi][0]] || '') + '</textarea></div>';
    }
    html += '</div></div>';

    // Pain Points (shared library picker)
    if (painPoints.length > 0) {
      html += '<div class="cp-card" style="margin-bottom:12px">';
      html += '<h3 style="margin-bottom:12px">' + icon('bolt') + ' Link Pain Points</h3>';
      html += '<div class="cp-pain-point-picker-list">';
      for (var ppi = 0; ppi < painPoints.length; ppi++) {
        var pp = painPoints[ppi];
        var isLinked = linkedPPs.indexOf(pp.id) > -1;
        html += '<label class="cp-pain-point-picker-item' + (isLinked ? ' cp-pain-point-picker-item-selected' : '') + '">';
        html += '<input type="checkbox" data-pp-id="' + esc(pp.id) + '"' + (isLinked ? ' checked' : '') + '>';
        html += '<div><div style="font-weight:600;font-size:13px">' + esc(truncate(pp.pain_point, 60)) + '</div>';
        if (pp.solution) html += '<div style="font-size:11px;color:var(--cp-success);margin-top:2px">' + icon('lightbulb') + ' ' + esc(truncate(pp.solution, 50)) + '</div>';
        html += '</div></label>';
      }
      html += '</div></div>';
    }

    // Notes
    html += '<div class="cp-form-group"><label>Notes</label>';
    html += '<textarea class="cp-textarea" data-field="notes" rows="2" placeholder="Any additional notes...">' + esc(p ? p.notes || '' : '') + '</textarea></div>';

    html += '</div>';

    openModal(isEdit ? 'Edit Persona' : 'New Persona', html, {
      titleIcon: 'user',
      size: 'lg',
      saveLabel: isEdit ? 'Save Persona' : 'Create Persona',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.name || !fields.name.trim()) { toast('Persona name is required', 'warning'); return; }

        // Collect pain point selections
        var selectedPPs = [];
        $('.cp-modal-body input[data-pp-id]:checked').each(function() {
          selectedPPs.push($(this).data('pp-id'));
        });

        // Build demographics object
        var demographics = {
          age_range: fields.demo_age_range || '', gender: fields.demo_gender || '',
          location: fields.demo_location || '', income_level: fields.demo_income_level || '',
          education: fields.demo_education || '', occupation: fields.demo_occupation || '', custom: {}
        };

        // Build psychographics object
        var psychographics = {
          desires: fields.psych_desires || '', requirements: fields.psych_requirements || '',
          emotional_triggers: fields.psych_emotional_triggers || '', motivations: fields.psych_motivations || '',
          fears: fields.psych_fears || '', values: fields.psych_values || '', custom: {}
        };

        if (isEdit) {
          snapshot('Edit persona');
          saveEntityField('persona', personaId, 'name', fields.name.trim());
          saveEntityField('persona', personaId, 'category_id', fields.category_id || '');
          saveEntityField('persona', personaId, 'description', fields.description || '');
          saveEntityField('persona', personaId, 'demographics', demographics);
          saveEntityField('persona', personaId, 'psychographics', psychographics);
          saveEntityField('persona', personaId, 'pain_point_ids', selectedPPs);
          saveEntityField('persona', personaId, 'notes', fields.notes || '');
        } else {
          var newPersona = createEntity('persona', {
            name: fields.name.trim(), category_id: fields.category_id || '',
            description: fields.description || '', demographics: demographics,
            psychographics: psychographics, pain_point_ids: selectedPPs,
            notes: fields.notes || ''
          });
          if (newPersona) { S.selectedPersonaId = newPersona.id; snapshot('Create persona'); }
        }
        closeModal();
      }
    });
  }

  function confirmDeletePersona(personaId) {
    var p = getPersona(personaId);
    if (!p) return;
    var recipeCount = (S.personaRecipeCounts || {})[personaId] || 0;
    openConfirmDialog({
      title: 'Delete Persona',
      message: 'Delete "' + p.name + '"?' + (recipeCount > 0 ? ' ' + recipeCount + ' recipe(s) will lose their persona reference.' : ''),
      confirmLabel: 'Delete', danger: true,
      onConfirm: function() {
        snapshot('Delete persona');
        deleteEntity('persona', personaId);
        if (S.selectedPersonaId === personaId) S.selectedPersonaId = null;
      }
    });
  }

  // ============================================================
  // SECTION 6: PAIN POINT CRUD
  // ============================================================

  function openPainPointModal(ppId) {
    var isEdit = !!ppId;
    var pp = isEdit ? getPainPoint(ppId) : null;
    var ppCats = Constants.PAIN_POINT_CATEGORIES || [];

    var html = '<div class="cp-editor-form">';
    html += '<div class="cp-form-group"><label>Pain Point *</label>';
    html += '<textarea class="cp-textarea" data-field="pain_point" rows="2" placeholder="Describe the pain point...">' + esc(pp ? pp.pain_point : '') + '</textarea></div>';
    html += '<div class="cp-form-group"><label>Solution</label>';
    html += '<textarea class="cp-textarea" data-field="solution" rows="2" placeholder="How does your product solve this?">' + esc(pp ? pp.solution || '' : '') + '</textarea></div>';
    html += '<div class="cp-form-group"><label>Category</label>';
    html += '<select class="cp-select" data-field="category">';
    html += '<option value="">None</option>';
    for (var i = 0; i < ppCats.length; i++) {
      var sel = (pp && pp.category === ppCats[i].id) ? ' selected' : '';
      html += '<option value="' + esc(ppCats[i].id) + '"' + sel + '>' + esc(ppCats[i].name) + '</option>';
    }
    html += '</select></div>';
    html += '</div>';

    openModal(isEdit ? 'Edit Pain Point' : 'New Pain Point', html, {
      titleIcon: 'bolt',
      size: 'md',
      saveLabel: isEdit ? 'Save' : 'Create Pain Point',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.pain_point || !fields.pain_point.trim()) { toast('Pain point text is required', 'warning'); return; }
        if (isEdit) {
          snapshot('Edit pain point');
          saveEntityField('pain_point', ppId, 'pain_point', fields.pain_point.trim());
          saveEntityField('pain_point', ppId, 'solution', fields.solution || '');
          saveEntityField('pain_point', ppId, 'category', fields.category || '');
        } else {
          createEntity('pain_point', { pain_point: fields.pain_point.trim(), solution: fields.solution || '', category: fields.category || '' });
          snapshot('Create pain point');
        }
        closeModal();
      }
    });
  }

  function confirmDeletePainPoint(ppId) {
    var pp = getPainPoint(ppId);
    if (!pp) return;
    openConfirmDialog({
      title: 'Delete Pain Point',
      message: 'Delete this pain point? It will be unlinked from all personas and recipes.',
      confirmLabel: 'Delete', danger: true,
      onConfirm: function() {
        snapshot('Delete pain point');
        deleteEntity('pain_point', ppId);
      }
    });
  }

  // ============================================================
  // SECTION 7: MESSAGE CRUD (with hooks)
  // ============================================================

  function openMessageModal(msgId) {
    var isEdit = !!msgId;
    var m = isEdit ? getMessage(msgId) : null;
    var funnels = (S.meta.settings && S.meta.settings.funnel_stages) || [];
    var existingStages = m ? (m.funnel_stages || []) : [];
    var existingHooks = m ? (m.hooks || []) : [];

    var html = '<div class="cp-editor-form">';

    // Title
    html += '<div class="cp-form-group"><label>Message Title *</label>';
    html += '<input type="text" class="cp-input" data-field="title" value="' + esc(m ? m.title : '') + '" placeholder="e.g., Time Freedom Angle"></div>';

    // Body
    html += '<div class="cp-form-group"><label>Message Body</label>';
    html += '<textarea class="cp-textarea" data-field="body" rows="4" placeholder="The core message text...">' + esc(m ? m.body || '' : '') + '</textarea></div>';

    // Funnel stages (chips)
    html += '<div class="cp-form-group"><label>Funnel Stages</label>';
    html += '<div class="cp-funnel-chip-selector">';
    for (var fi = 0; fi < funnels.length; fi++) {
      var f = funnels[fi];
      var isActive = existingStages.indexOf(f.id) > -1;
      html += '<button type="button" class="cp-funnel-chip' + (isActive ? ' cp-funnel-chip-active' : '') + '" data-action="toggle-funnel-chip" data-stage-id="' + esc(f.id) + '" style="--opt-color:' + f.color + ';' + (isActive ? 'background:' + f.color + ';border-color:' + f.color + ';color:#fff' : 'border-color:' + f.color + '40;color:' + f.color) + '">' + esc(f.short || f.name) + '</button>';
    }
    html += '</div></div>';

    // Delivery notes
    html += '<div class="cp-form-group"><label>Delivery & Narrative Notes</label>';
    html += '<textarea class="cp-textarea" data-field="delivery_notes" rows="3" placeholder="How should this message be delivered? Emotional direction, acting notes...">' + esc(m ? m.delivery_notes || '' : '') + '</textarea></div>';

    // Theme
    html += '<div class="cp-form-row"><div class="cp-form-half">';
    html += '<label>Theme / Topic</label>';
    html += '<input type="text" class="cp-input" data-field="theme" value="' + esc(m ? m.theme || '' : '') + '" placeholder="e.g., Productivity, Social Proof">';
    html += '</div><div class="cp-form-half">';
    html += '<label>Notes</label>';
    html += '<input type="text" class="cp-input" data-field="notes" value="' + esc(m ? m.notes || '' : '') + '" placeholder="Internal notes...">';
    html += '</div></div>';

    // Hooks sub-section
    html += '<div class="cp-card" style="margin-top:12px">';
    html += '<h3 style="margin-bottom:8px">' + icon('anchor') + ' Hooks</h3>';
    html += '<p class="cp-text-muted" style="margin-bottom:8px">Opening hooks for this message. Recipes can inherit or override these.</p>';
    html += '<div class="cp-hook-list" id="cpModalHookList">';
    for (var hi = 0; hi < existingHooks.length; hi++) {
      html += renderHookEditRow(existingHooks[hi], hi);
    }
    html += '</div>';
    html += '<div class="cp-hook-add" style="margin-top:8px">';
    html += '<button type="button" class="cp-btn cp-btn-outline cp-btn-sm" data-action="add-hook-row">' + icon('plus') + ' Add Hook</button>';
    html += '</div></div>';

    html += '</div>';

    openModal(isEdit ? 'Edit Message' : 'New Message', html, {
      titleIcon: 'comment-dots',
      size: 'lg',
      saveLabel: isEdit ? 'Save Message' : 'Create Message',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.title || !fields.title.trim()) { toast('Message title is required', 'warning'); return; }

        var funnelStages = collectFunnelChips();

        // Collect hooks from the hook list
        var hooks = [];
        $('#cpModalHookList .cp-hook-edit-row').each(function() {
          var text = $(this).find('[data-hook-field="text"]').val() || '';
          var type = $(this).find('[data-hook-field="type"]').val() || 'direct';
          var id = $(this).data('hook-id') || generateId('hk');
          if (text.trim()) {
            hooks.push({ id: id, text: text.trim(), type: type });
          }
        });

        if (isEdit) {
          snapshot('Edit message');
          saveEntityField('message', msgId, 'title', fields.title.trim());
          saveEntityField('message', msgId, 'body', fields.body || '');
          saveEntityField('message', msgId, 'funnel_stages', funnelStages);
          saveEntityField('message', msgId, 'delivery_notes', fields.delivery_notes || '');
          saveEntityField('message', msgId, 'theme', fields.theme || '');
          saveEntityField('message', msgId, 'notes', fields.notes || '');
          saveEntityField('message', msgId, 'hooks', hooks);
        } else {
          var newMsg = createEntity('message', {
            title: fields.title.trim(), body: fields.body || '',
            funnel_stages: funnelStages, delivery_notes: fields.delivery_notes || '',
            theme: fields.theme || '', notes: fields.notes || '', hooks: hooks
          });
          snapshot('Create message');
        }
        closeModal();
      }
    });
  }

  function renderHookEditRow(hook, index) {
    var hookTypes = Constants.HOOK_TYPES || {};
    var html = '<div class="cp-hook-edit-row" data-hook-id="' + esc(hook.id || '') + '" data-hook-index="' + index + '">';
    html += '<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:4px">';
    html += '<input type="text" class="cp-input" data-hook-field="text" value="' + esc(hook.text || '') + '" placeholder="Hook text..." style="flex:1">';
    html += '<select class="cp-select cp-select-sm" data-hook-field="type" style="width:auto;min-width:100px">';
    for (var tk in hookTypes) {
      var sel = (hook.type === tk) ? ' selected' : '';
      html += '<option value="' + tk + '"' + sel + '>' + esc(hookTypes[tk].label) + '</option>';
    }
    html += '</select>';
    html += '<button type="button" class="cp-btn-icon cp-btn-xs" data-action="remove-hook-row" data-hook-index="' + index + '" title="Remove">' + icon('trash') + '</button>';
    html += '</div></div>';
    return html;
  }

  function addHookRow() {
    var $list = $('#cpModalHookList');
    var idx = $list.find('.cp-hook-edit-row').length;
    $list.append(renderHookEditRow({ id: generateId('hk'), text: '', type: 'direct' }, idx));
    $list.find('.cp-hook-edit-row:last input').first().focus();
  }

  function removeHookRow(index) {
    $('#cpModalHookList .cp-hook-edit-row').eq(index).remove();
  }

  function confirmDeleteMessage(msgId) {
    var m = getMessage(msgId);
    if (!m) return;
    var recipeCount = (S.messageRecipeCounts || {})[msgId] || 0;
    openConfirmDialog({
      title: 'Delete Message',
      message: 'Delete "' + m.title + '"?' + (recipeCount > 0 ? ' ' + recipeCount + ' recipe(s) will lose their message reference.' : ''),
      confirmLabel: 'Delete', danger: true,
      onConfirm: function() {
        snapshot('Delete message');
        deleteEntity('message', msgId);
      }
    });
  }

  // ============================================================
  // SECTION 8: STYLE & FORMAT CRUD
  // ============================================================

  function openStyleModal(styleId) {
    var isEdit = !!styleId;
    var s = isEdit ? getStyle(styleId) : null;

    var html = '<div class="cp-editor-form">';
    html += '<div class="cp-form-group"><label>Style Name *</label>';
    html += '<input type="text" class="cp-input" data-field="name" value="' + esc(s ? s.name : '') + '" placeholder="e.g., Friendly & Relatable"></div>';
    html += '<div class="cp-form-group"><label>Description</label>';
    html += '<textarea class="cp-textarea" data-field="description" rows="3" placeholder="Describe the tone, approach, and feel of this style...">' + esc(s ? s.description || '' : '') + '</textarea></div>';
    html += '</div>';

    openModal(isEdit ? 'Edit Style' : 'New Style', html, {
      titleIcon: 'palette',
      size: 'md',
      saveLabel: isEdit ? 'Save' : 'Create Style',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.name || !fields.name.trim()) { toast('Style name is required', 'warning'); return; }
        if (isEdit) {
          snapshot('Edit style');
          saveEntityField('style', styleId, 'name', fields.name.trim());
          saveEntityField('style', styleId, 'description', fields.description || '');
        } else {
          createEntity('style', { name: fields.name.trim(), description: fields.description || '' });
          snapshot('Create style');
        }
        closeModal();
      }
    });
  }

  function confirmDeleteStyle(styleId) {
    var s = getStyle(styleId);
    if (!s) return;
    var recipeCount = (S.styleRecipeCounts || {})[styleId] || 0;
    openConfirmDialog({
      title: 'Delete Style',
      message: 'Delete "' + s.name + '"?' + (recipeCount > 0 ? ' ' + recipeCount + ' recipe(s) will lose their style reference.' : ''),
      confirmLabel: 'Delete', danger: true,
      onConfirm: function() { snapshot('Delete style'); deleteEntity('style', styleId); }
    });
  }

  function openFormatModal(formatId) {
    var isEdit = !!formatId;
    var f = isEdit ? getFormat(formatId) : null;
    var formatCats = Constants.FORMAT_CATEGORIES || [];

    var html = '<div class="cp-editor-form">';
    html += '<div class="cp-form-row"><div class="cp-form-half">';
    html += '<label>Format Name *</label>';
    html += '<input type="text" class="cp-input" data-field="name" value="' + esc(f ? f.name : '') + '" placeholder="e.g., Indoor Studio Shoot"></div>';
    html += '<div class="cp-form-half"><label>Category</label>';
    html += '<select class="cp-select" data-field="category">';
    html += '<option value="">None</option>';
    for (var ci = 0; ci < formatCats.length; ci++) {
      var sel = (f && f.category === formatCats[ci].id) ? ' selected' : '';
      html += '<option value="' + esc(formatCats[ci].id) + '"' + sel + '>' + esc(formatCats[ci].name) + '</option>';
    }
    html += '</select></div></div>';
    html += '<div class="cp-form-group"><label>Description</label>';
    html += '<textarea class="cp-textarea" data-field="description" rows="3" placeholder="Describe the visual approach, setting, and feel...">' + esc(f ? f.description || '' : '') + '</textarea></div>';
    html += '</div>';

    openModal(isEdit ? 'Edit Visual Format' : 'New Visual Format', html, {
      titleIcon: 'clapperboard',
      size: 'md',
      saveLabel: isEdit ? 'Save' : 'Create Format',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.name || !fields.name.trim()) { toast('Format name is required', 'warning'); return; }
        if (isEdit) {
          snapshot('Edit format');
          saveEntityField('visual_format', formatId, 'name', fields.name.trim());
          saveEntityField('visual_format', formatId, 'description', fields.description || '');
          saveEntityField('visual_format', formatId, 'category', fields.category || '');
        } else {
          createEntity('visual_format', { name: fields.name.trim(), description: fields.description || '', category: fields.category || '' });
          snapshot('Create format');
        }
        closeModal();
      }
    });
  }

  function confirmDeleteFormat(formatId) {
    var f = getFormat(formatId);
    if (!f) return;
    var recipeCount = (S.formatRecipeCounts || {})[formatId] || 0;
    openConfirmDialog({
      title: 'Delete Visual Format',
      message: 'Delete "' + f.name + '"?' + (recipeCount > 0 ? ' ' + recipeCount + ' recipe(s) will lose their format reference.' : ''),
      confirmLabel: 'Delete', danger: true,
      onConfirm: function() { snapshot('Delete format'); deleteEntity('visual_format', formatId); }
    });
  }

  // ============================================================
  // SECTION 9: CAMPAIGN CRUD
  // ============================================================

  function openCampaignModal(campId) {
    var isEdit = !!campId;
    var c = isEdit ? getCampaign(campId) : null;
    var objectives = Constants.CAMPAIGN_OBJECTIVES || [];
    var funnels = (S.meta.settings && S.meta.settings.funnel_stages) || [];
    var campStatuses = Constants.CAMPAIGN_STATUSES || {};

    // Pre-fill dimension selections for edit
    var selPersonas = (c && c.persona_ids) ? c.persona_ids.slice() : [];
    var selMessages = (c && c.message_ids) ? c.message_ids.slice() : [];
    var selStyles = (c && c.style_ids) ? c.style_ids.slice() : [];
    var selFormats = (c && c.format_ids) ? c.format_ids.slice() : [];

    var html = '<div class="cp-editor-form">';

    // Name + status
    html += '<div class="cp-form-row"><div class="cp-form-half">';
    html += '<label>Campaign Name *</label>';
    html += '<input type="text" class="cp-input" data-field="name" value="' + esc(c ? c.name : '') + '" placeholder="e.g., Q2 Lead Generation">';
    html += '</div><div class="cp-form-half">';
    html += '<label>Status</label>';
    html += '<select class="cp-select" data-field="status">';
    for (var sk in campStatuses) {
      var sel = (c && c.status === sk) ? ' selected' : '';
      if (!c && sk === 'planning') sel = ' selected';
      html += '<option value="' + sk + '"' + sel + '>' + esc(campStatuses[sk].label) + '</option>';
    }
    html += '</select></div></div>';

    // Description
    html += '<div class="cp-form-group"><label>Description</label>';
    html += '<textarea class="cp-textarea" data-field="description" rows="2" placeholder="Campaign description...">' + esc(c ? c.description || '' : '') + '</textarea></div>';

    // Objective + Funnel
    html += '<div class="cp-form-row"><div class="cp-form-half">';
    html += '<label>Objective</label>';
    html += '<select class="cp-select" data-field="objective">';
    html += '<option value="">Select...</option>';
    for (var oi = 0; oi < objectives.length; oi++) {
      var oSel = (c && c.objective === objectives[oi].id) ? ' selected' : '';
      html += '<option value="' + esc(objectives[oi].id) + '"' + oSel + '>' + esc(objectives[oi].name) + '</option>';
    }
    html += '</select></div><div class="cp-form-half">';
    html += '<label>Funnel Stage</label>';
    html += '<select class="cp-select" data-field="funnel_stage">';
    html += '<option value="">All stages</option>';
    for (var fi = 0; fi < funnels.length; fi++) {
      var fSel = (c && c.funnel_stage === funnels[fi].id) ? ' selected' : '';
      html += '<option value="' + esc(funnels[fi].id) + '"' + fSel + '>' + esc(funnels[fi].short || funnels[fi].name) + '</option>';
    }
    html += '</select></div></div>';

    // Date range
    html += '<div class="cp-form-row"><div class="cp-form-half">';
    html += '<label>Start Date</label>';
    html += '<input type="date" class="cp-input" data-field="date_start" value="' + esc(c ? c.date_start || '' : '') + '">';
    html += '</div><div class="cp-form-half">';
    html += '<label>End Date</label>';
    html += '<input type="date" class="cp-input" data-field="date_end" value="' + esc(c ? c.date_end || '' : '') + '">';
    html += '</div></div>';

    // Budget notes
    html += '<div class="cp-form-group"><label>Budget / Target Notes</label>';
    html += '<textarea class="cp-textarea" data-field="budget_notes" rows="2" placeholder="Budget range, target CPL, etc...">' + esc(c ? c.budget_notes || '' : '') + '</textarea></div>';

    // Dimension targeting — multi-select checkboxes
    var dims = [
      { key: 'persona_ids', label: 'Target Personas', icon: 'users', color: '#9334e9', items: getAllPersonas(), nameKey: 'name', selected: selPersonas },
      { key: 'message_ids', label: 'Messages', icon: 'comments', color: '#1a73e8', items: getAllMessages(), nameKey: 'title', selected: selMessages },
      { key: 'style_ids', label: 'Styles', icon: 'palette', color: '#e37400', items: getAllStyles(), nameKey: 'name', selected: selStyles },
      { key: 'format_ids', label: 'Formats', icon: 'clapperboard', color: '#0891b2', items: getAllFormats(), nameKey: 'name', selected: selFormats }
    ];

    html += '<div style="border-top:1px solid var(--cp-border-light);padding-top:var(--cp-space-3);margin-top:var(--cp-space-3)">';
    html += '<label style="font-weight:600;margin-bottom:var(--cp-space-2);display:block">' + icon('crosshairs') + ' Dimension Targeting</label>';
    html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-3)">Select which dimensions this campaign will use for recipe generation.</p>';

    for (var di = 0; di < dims.length; di++) {
      var dim = dims[di];
      if (dim.items.length === 0) continue;
      html += '<div class="cp-form-group" style="margin-bottom:var(--cp-space-2)">';
      html += '<label style="color:' + dim.color + '">' + icon(dim.icon) + ' ' + esc(dim.label) + '</label>';
      html += '<div class="cp-wizard-dim-list">';
      for (var ii = 0; ii < dim.items.length; ii++) {
        var item = dim.items[ii];
        var isSel = dim.selected.indexOf(item.id) > -1;
        html += '<label class="cp-wizard-dim-chip' + (isSel ? ' cp-wizard-dim-chip-selected' : '') + '" style="' + (isSel ? 'background:' + dim.color + '12;color:' + dim.color + ';border-color:' + dim.color : '') + '">';
        html += '<input type="checkbox" class="cp-camp-dim-check" data-dim="' + dim.key + '" data-id="' + esc(item.id) + '"' + (isSel ? ' checked' : '') + ' style="display:none">';
        html += esc(item[dim.nameKey] || 'Untitled');
        html += '</label>';
      }
      html += '</div></div>';
    }
    html += '</div>';

    // AI Instructions
    html += '<div class="cp-form-group"><label>' + icon('sparkles') + ' Campaign AI Instructions</label>';
    html += '<textarea class="cp-textarea" data-field="ai_instructions" rows="2" placeholder="Special instructions for AI when generating content for this campaign...">' + esc(c ? c.ai_instructions || '' : '') + '</textarea></div>';

    // General notes
    html += '<div class="cp-form-group"><label>Notes</label>';
    html += '<textarea class="cp-textarea" data-field="notes" rows="2" placeholder="Internal notes...">' + esc(c ? c.notes || '' : '') + '</textarea></div>';

    html += '</div>';

    openModal(isEdit ? 'Edit Campaign' : 'New Campaign', html, {
      titleIcon: 'bullhorn',
      size: 'lg',
      saveLabel: isEdit ? 'Save Campaign' : 'Create Campaign',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.name || !fields.name.trim()) { toast('Campaign name is required', 'warning'); return; }

        // Collect dimension selections from checkboxes
        var dimData = { persona_ids: [], message_ids: [], style_ids: [], format_ids: [] };
        $('.cp-camp-dim-check:checked').each(function() {
          var dimKey = $(this).data('dim');
          var itemId = $(this).data('id');
          if (dimData[dimKey] && itemId) dimData[dimKey].push(itemId);
        });

        if (isEdit) {
          saveEntityField('campaign', campId, 'name', fields.name.trim());
          saveEntityField('campaign', campId, 'description', fields.description || '');
          saveEntityField('campaign', campId, 'objective', fields.objective || '');
          snapshot('Edit campaign');
          saveEntityField('campaign', campId, 'funnel_stage', fields.funnel_stage || '');
          saveEntityField('campaign', campId, 'date_start', fields.date_start || '');
          saveEntityField('campaign', campId, 'date_end', fields.date_end || '');
          saveEntityField('campaign', campId, 'status', fields.status || 'planning');
          saveEntityField('campaign', campId, 'budget_notes', fields.budget_notes || '');
          saveEntityField('campaign', campId, 'ai_instructions', fields.ai_instructions || '');
          saveEntityField('campaign', campId, 'notes', fields.notes || '');
          saveEntityField('campaign', campId, 'persona_ids', dimData.persona_ids);
          saveEntityField('campaign', campId, 'message_ids', dimData.message_ids);
          saveEntityField('campaign', campId, 'style_ids', dimData.style_ids);
          saveEntityField('campaign', campId, 'format_ids', dimData.format_ids);
        } else {
          createEntity('campaign', {
            name: fields.name.trim(), description: fields.description || '',
            objective: fields.objective || '', funnel_stage: fields.funnel_stage || '',
            date_start: fields.date_start || '', date_end: fields.date_end || '',
            status: fields.status || 'planning', budget_notes: fields.budget_notes || '',
            ai_instructions: fields.ai_instructions || '', notes: fields.notes || '',
            persona_ids: dimData.persona_ids, message_ids: dimData.message_ids,
            style_ids: dimData.style_ids, format_ids: dimData.format_ids
          });
          snapshot('Create campaign');
        }
        closeModal();
      }
    });
  }

  function confirmDeleteCampaign(campId) {
    var c = getCampaign(campId);
    if (!c) return;
    var recipeCount = (S.data.recipes || []).filter(function(r) { return r.campaign_id === campId; }).length;
    openConfirmDialog({
      title: 'Delete Campaign',
      message: 'Delete "' + c.name + '"?' + (recipeCount > 0 ? ' ' + recipeCount + ' recipe(s) will become ungrouped.' : ''),
      confirmLabel: 'Delete', danger: true,
      onConfirm: function() { snapshot('Delete campaign'); deleteEntity('campaign', campId); }
    });
  }

  // ============================================================
  // SECTION 9.4: CAMPAIGN PHASES CRUD
  // ============================================================

  function openCampaignPhasesModal(campId) {
    var camp = getCampaign(campId);
    if (!camp) return;
    var phases = (camp.phases || []).slice();

    function renderPhasesForm() {
      var html = '<div class="cp-editor-form">';
      html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-3)">Define campaign phases (e.g., TOFU Awareness → MOFU Consideration → BOFU Conversion). Each phase can have its own date range.</p>';
      if (phases.length === 0) {
        html += '<div class="cp-empty-state cp-empty-state--compact"><p>No phases yet.</p></div>';
      } else {
        for (var i = 0; i < phases.length; i++) {
          var ph = phases[i];
          html += '<div class="cp-card" style="margin-bottom:var(--cp-space-2);padding:var(--cp-space-3)">';
          html += '<div style="display:flex;align-items:center;gap:var(--cp-space-2);margin-bottom:var(--cp-space-2)">';
          html += '<span class="cp-badge" style="background:var(--cp-primary-subtle);color:var(--cp-primary);font-weight:700">Phase ' + (i + 1) + '</span>';
          html += '<input type="text" class="cp-input cp-phase-field" data-pidx="' + i + '" data-pfield="name" value="' + esc(ph.name || '') + '" placeholder="Phase name..." style="flex:1">';
          html += '<button class="cp-btn-icon cp-btn-xs cp-phase-delete" data-pidx="' + i + '">' + icon('trash') + '</button>';
          html += '</div>';
          html += '<div class="cp-form-row">';
          html += '<div class="cp-form-third"><label class="cp-field-label">Start</label><input type="date" class="cp-input cp-phase-field" data-pidx="' + i + '" data-pfield="date_start" value="' + esc(ph.date_start || '') + '"></div>';
          html += '<div class="cp-form-third"><label class="cp-field-label">End</label><input type="date" class="cp-input cp-phase-field" data-pidx="' + i + '" data-pfield="date_end" value="' + esc(ph.date_end || '') + '"></div>';
          html += '<div class="cp-form-third"><label class="cp-field-label">Focus</label><input type="text" class="cp-input cp-phase-field" data-pidx="' + i + '" data-pfield="funnel_stage" value="' + esc(ph.funnel_stage || '') + '" placeholder="e.g., TOFU"></div>';
          html += '</div></div>';
        }
      }
      html += '<button class="cp-btn cp-btn-outline cp-btn-sm cp-phase-add" style="margin-top:var(--cp-space-2)">' + icon('plus') + ' Add Phase</button>';
      html += '</div>';
      return html;
    }

    openModal('Campaign Phases — ' + camp.name, renderPhasesForm(), {
      titleIcon: 'timeline', size: 'lg',
      saveLabel: 'Save Phases',
      onSave: function() {
        // Collect phase data from fields
        $('.cp-phase-field').each(function() {
          var idx = parseInt($(this).data('pidx'), 10);
          var field = $(this).data('pfield');
          if (phases[idx]) phases[idx][field] = $(this).val() || '';
        });
        snapshot('Update campaign phases');
        saveEntityField('campaign', campId, 'phases', phases);
        closeModal();
        toast('Campaign phases saved', 'success');
      }
    });

    // Live handlers inside modal
    $(document).off('click.cp-phase-add').on('click.cp-phase-add', '.cp-phase-add', function(e) {
      e.preventDefault();
      phases.push({ name: '', date_start: '', date_end: '', funnel_stage: '' });
      $('.cp-modal-body').html(renderPhasesForm());
    });
    $(document).off('click.cp-phase-del').on('click.cp-phase-del', '.cp-phase-delete', function(e) {
      e.preventDefault();
      var idx = parseInt($(this).data('pidx'), 10);
      phases.splice(idx, 1);
      $('.cp-modal-body').html(renderPhasesForm());
    });
  }

  // ============================================================
  // SECTION 9.4: SETUP WIZARD (First-Run Guided Setup)
  // ============================================================

  // --- State ---
  var setupWizardState = {
    step: 1,
    aiLoading: false,
    stepGenerated: {},   // { 3: true } — AI has been triggered for this step
    stepSkipped: {},     // { 4: true } — user explicitly skipped
    _expandedCards: {},  // { 'persona_2': true } — expanded detail cards
    _ppActiveTab: 0,     // active persona tab on Step 4

    workspace: { name: '', description: '', product_name: '', objective: '',
                 brand_voice: '', target_audience: '', custom_instructions: '' },
    aiConfig: { provider: '', model: '', tested: false },

    personas:    [],  // [{ name, description, demographics:{}, psychographics:{}, _selected }]
    pain_points: [],  // [{ pain_point, solution, category, _persona_idx, _selected }]
    messages:    [],  // [{ title, body, theme, funnel_stages:[], hooks:[], _selected }]
    styles:      [],  // [{ name, description, _selected }]
    formats:     [],  // [{ name, description, category, _selected }]

    campaign: { name: '', objective: '', date_start: '', date_end: '',
                budget_notes: '', ai_instructions: '', default_media_type: 'image', default_priority: 'normal' },
    combos: [],         // [{ p_idx, m_idx, s_idx, f_idx, title, selected }]

    created: { personaIds: [], painPointIds: [], messageIds: [],
               styleIds: [], formatIds: [], campaignId: '', recipeIds: [] },
    finalizing: false
  };

  var SW_STEPS = [
    { num: 1, label: 'Workspace',       sublabel: 'Brand & product',      phase: 'a', icon: 'building' },
    { num: 2, label: 'AI Setup',        sublabel: 'Configure provider',   phase: 'a', icon: 'robot' },
    { num: 3, label: 'Personas',        sublabel: 'Target audiences',     phase: 'b', icon: 'users' },
    { num: 4, label: 'Pain Points',     sublabel: 'Audience challenges',  phase: 'b', icon: 'bolt' },
    { num: 5, label: 'Messages',        sublabel: 'Ad angles & hooks',    phase: 'b', icon: 'comment-dots' },
    { num: 6, label: 'Styles & Formats', sublabel: 'Creative approach',   phase: 'b', icon: 'palette' },
    { num: 7, label: 'First Campaign',  sublabel: 'Campaign + recipes',   phase: 'c', icon: 'bullseye' },
    { num: 8, label: 'Review',          sublabel: 'Launch your planner',  phase: 'c', icon: 'rocket' }
  ];

  var SW_PHASE_LABELS = { a: 'Phase A — Foundation', b: 'Phase B — Library', c: 'Phase C — Campaign' };

  // --- State persistence (session storage) ---
  function swSaveSession() {
    try { sessionStorage.setItem('cp_sw_state', JSON.stringify(setupWizardState)); } catch(e) {}
  }
  function swLoadSession() {
    try {
      var saved = sessionStorage.getItem('cp_sw_state');
      if (saved) { var parsed = JSON.parse(saved); if (parsed && parsed.step) return parsed; }
    } catch(e) {}
    return null;
  }
  function swClearSession() {
    try { sessionStorage.removeItem('cp_sw_state'); } catch(e) {}
  }

  // --- Dot-path helpers for field collection ---
  function swSetPath(path, val) {
    var parts = path.split('.');
    var obj = setupWizardState;
    for (var i = 0; i < parts.length - 1; i++) { obj = obj[parts[i]] = obj[parts[i]] || {}; }
    obj[parts[parts.length - 1]] = val;
  }
  function swGetPath(path) {
    var parts = path.split('.');
    var obj = setupWizardState;
    for (var i = 0; i < parts.length; i++) { if (obj == null) return ''; obj = obj[parts[i]]; }
    return obj == null ? '' : obj;
  }

  // --- Collect all data-sw-field inputs from current step ---
  function swCollectFields() {
    $('.cp-sw-content-inner [data-sw-field]').each(function() {
      var path = $(this).data('sw-field');
      if (!path) return;
      var val = $(this).is(':checkbox') ? $(this).is(':checked') : $(this).val();
      swSetPath(path, val || '');
    });
    // Step 2: capture AI picker provider/model (rendered by LLMService, no data-sw-field)
    if (setupWizardState.step === 2) {
      var $prov = $('.cp-ai-provider-select[data-action-id="sw-ai-config"]');
      var $mod  = $('.cp-ai-model-select[data-action-id="sw-ai-config"]');
      if ($prov.length) setupWizardState.aiConfig.provider = $prov.val();
      if ($mod.length)  setupWizardState.aiConfig.model    = $mod.val();
    }
  }

  // --- Open wizard (entry point) ---
  function openSetupWizard(forceReset) {
    // Try to resume session unless forced reset
    if (!forceReset) {
      var saved = swLoadSession();
      if (saved && !saved.finalizing) {
        // Ask user to resume or restart
        openConfirmDialog({
          title: 'Resume Setup?',
          message: 'You have an incomplete setup from a previous session (Step ' + saved.step + ' of 8). Would you like to continue where you left off?',
          confirmLabel: 'Resume',
          cancelLabel: 'Start Over',
          onConfirm: function() { setupWizardState = saved; _renderSetupWizardDOM(); },
          onCancel:  function() { swClearSession(); _initFreshWizard(); }
        });
        return;
      }
    }
    _initFreshWizard();
  }

  function _initFreshWizard() {
    setupWizardState = {
      step: 1, aiLoading: false, stepGenerated: {}, stepSkipped: {},
      _expandedCards: {}, _ppActiveTab: 0,
      workspace: { name: '', description: '', product_name: '', objective: '',
                   brand_voice: '', target_audience: '', custom_instructions: '' },
      aiConfig: { provider: '', model: '', tested: false },
      personas: [], pain_points: [], messages: [], styles: [], formats: [],
      campaign: { name: '', objective: '', date_start: '', date_end: '',
                  budget_notes: '', ai_instructions: '',
                  default_media_type: 'image', default_priority: 'normal' },
      combos: [],
      created: { personaIds: [], painPointIds: [], messageIds: [],
                 styleIds: [], formatIds: [], campaignId: '', recipeIds: [] },
      finalizing: false
    };
    _renderSetupWizardDOM();
  }

  function _renderSetupWizardDOM() {
    // Remove any existing wizard overlay
    $('.cp-setup-wizard').remove();
    // Build and append overlay to #cpApp with ARIA dialog role
    var $wizard = $('<div class="cp-setup-wizard" id="cpSetupWizard" role="dialog" aria-modal="true" aria-label="Campaign Planner Setup Wizard"></div>');
    $('#cpApp').append($wizard);
    renderSetupWizard();
  }

  // --- Main render (full wizard shell) ---
  function renderSetupWizard() {
    var html = _buildSWProgressBar();
    html += '<div class="cp-sw-layout">';
    html += _buildSWRail();
    html += _buildSWContentArea();
    html += '</div>';
    $('#cpSetupWizard').html(html);
    // Focus first input in the content area
    setTimeout(function() {
      var $first = $('#cpSetupWizard .cp-sw-content-inner input, #cpSetupWizard .cp-sw-content-inner textarea, #cpSetupWizard .cp-sw-content-inner select');
      if ($first.length) $first.first().focus();
    }, 50);
  }

  // --- Partial refresh (rail + content only — avoids full re-render) ---
  function refreshSetupWizard() {
    swSaveSession();
    $('#cpSetupWizard .cp-sw-progress-fill').css('width', _swProgressPct() + '%');
    $('#cpSetupWizard .cp-sw-rail-steps').html(_buildSWRailSteps());
    $('#cpSetupWizard .cp-sw-content-inner').html(_buildSWStepContent());
    $('#cpSetupWizard .cp-sw-footer').html(_buildSWFooter());
    // Focus first focusable element in new step
    setTimeout(function() {
      var $first = $('#cpSetupWizard .cp-sw-content-inner input:not([type=hidden]), #cpSetupWizard .cp-sw-content-inner textarea, #cpSetupWizard .cp-sw-content-inner select');
      if ($first.length) $first.first().focus();
    }, 50);
  }

  // --- Build: top progress bar ---
  function _buildSWProgressBar() {
    return '<div class="cp-sw-progress-bar"><div class="cp-sw-progress-fill" style="width:' + _swProgressPct() + '%"></div></div>';
  }
  function _swProgressPct() {
    return Math.round(((setupWizardState.step - 1) / 8) * 100);
  }

  // --- Build: left rail ---
  function _buildSWRail() {
    var html = '<div class="cp-sw-rail">';
    html += '<div class="cp-sw-rail-header">';
    html += '<div class="cp-sw-rail-logo">Campaign<span class="cp-sw-rail-logo-accent">Planner</span></div>';
    html += '<div class="cp-sw-rail-subtitle">Setup Wizard</div>';
    html += '</div>';
    html += '<div class="cp-sw-rail-steps">' + _buildSWRailSteps() + '</div>';
    // Footer — brand connection status
    html += '<div class="cp-sw-rail-footer">';
    var brandOn = S && S.brand && S.brand.configured;
    html += '<div class="cp-sw-rail-brand">';
    html += '<div class="cp-sw-rail-brand-dot' + (brandOn ? '' : ' cp-sw-rail-brand-dot--off') + '"></div>';
    html += '<span>' + (brandOn ? 'Brand profile connected' : 'No brand profile') + '</span>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  function _buildSWRailSteps() {
    var ws          = setupWizardState;
    var currentStep = ws.step;
    // Count map: how many items are selected per step (for done badge)
    var stepCounts = {
      3: (ws.personas    || []).filter(function(p) { return p._selected; }).length,
      4: (ws.pain_points || []).filter(function(p) { return p._selected; }).length,
      5: (ws.messages    || []).filter(function(m) { return m._selected; }).length,
      6: (ws.styles      || []).filter(function(s) { return s._selected; }).length +
         (ws.formats     || []).filter(function(f) { return f._selected; }).length,
      7: (ws.combos      || []).filter(function(c) { return c.selected; }).length
    };
    var html = '';
    var lastPhase = '';
    for (var i = 0; i < SW_STEPS.length; i++) {
      var st = SW_STEPS[i];
      if (st.phase !== lastPhase) {
        html += '<div class="cp-sw-phase-label">' + esc(SW_PHASE_LABELS[st.phase]) + '</div>';
        lastPhase = st.phase;
      }
      var isDone      = st.num < currentStep;
      var isActive    = st.num === currentStep;
      var isLocked    = st.num > currentStep;
      var isClickable = isDone;
      var cls = 'cp-sw-step-item';
      if (isActive)    cls += ' cp-sw-step-item--active';
      if (isDone)      cls += ' cp-sw-step-item--done';
      if (isLocked)    cls += ' cp-sw-step-item--locked';
      if (isClickable) cls += ' cp-sw-step-item--clickable';

      html += '<div class="' + cls + '"';
      if (isClickable) html += ' data-action="sw-goto-step" data-step="' + st.num + '"';
      html += ' role="' + (isClickable ? 'button' : 'listitem') + '"';
      if (isClickable) html += ' tabindex="0"';
      if (isActive)    html += ' aria-current="step"';
      html += '>';

      html += '<div class="cp-sw-step-left">';
      html += '<div class="cp-sw-step-circle">';
      if (isDone) html += icon('check');
      else html += st.num;
      html += '</div>';
      if (i < SW_STEPS.length - 1) {
        html += '<div class="cp-sw-step-connector' + (isDone ? ' cp-sw-step-connector--done' : '') + '"></div>';
      }
      html += '</div>';

      html += '<div class="cp-sw-step-text">';
      html += '<div class="cp-sw-step-label">' + esc(st.label);
      // Selection count badge for done steps with counted items
      if (isDone && stepCounts[st.num] > 0) {
        html += '<span class="cp-sw-step-badge">' + stepCounts[st.num] + '</span>';
      }
      html += '</div>';
      html += '<div class="cp-sw-step-sublabel">' + esc(st.sublabel) + '</div>';
      html += '</div>';
      html += '</div>';
    }
    return html;
  }

  // --- Build: right content area ---
  function _buildSWContentArea() {
    var html = '<div class="cp-sw-content">';
    html += '<div class="cp-sw-content-scroll"><div class="cp-sw-content-inner">';
    html += _buildSWStepContent();
    html += '</div></div>';
    html += '<div class="cp-sw-footer">' + _buildSWFooter() + '</div>';
    html += '</div>';
    return html;
  }

  // --- Step content router ---
  function _buildSWStepContent() {
    var n = setupWizardState.step;
    // Delegate to registered step renderers (added in later phases)
    if (typeof renderSWStep1 === 'function' && n === 1) return renderSWStep1();
    if (typeof renderSWStep2 === 'function' && n === 2) return renderSWStep2();
    if (typeof renderSWStep3 === 'function' && n === 3) return renderSWStep3();
    if (typeof renderSWStep4 === 'function' && n === 4) return renderSWStep4();
    if (typeof renderSWStep5 === 'function' && n === 5) return renderSWStep5();
    if (typeof renderSWStep6 === 'function' && n === 6) return renderSWStep6();
    if (typeof renderSWStep7 === 'function' && n === 7) return renderSWStep7();
    if (typeof renderSWStep8 === 'function' && n === 8) return renderSWStep8();
    return _buildSWStepPlaceholder(n);
  }

  function _buildSWStepPlaceholder(n) {
    var st = SW_STEPS[n - 1] || {};
    var phaseKey = st.phase || 'a';
    var html = _buildSWStepHeader(st.label || 'Step ' + n, 'This step is coming soon.', phaseKey);
    html += '<div class="cp-sw-placeholder-body">';
    html += '<div class="cp-sw-placeholder-icon">' + icon(st.icon || 'circle') + '</div>';
    html += '<p>' + esc('Step ' + n + ': ' + (st.label || '')) + ' — content will be added in a later phase.</p>';
    html += '</div>';
    return html;
  }

  // --- Reusable step header builder ---
  function _buildSWStepHeader(title, subtitle, phase) {
    var phaseCls = { a: 'cp-sw-phase-badge--a', b: 'cp-sw-phase-badge--b', c: 'cp-sw-phase-badge--c' };
    var html = '<div class="cp-sw-step-header">';
    html += '<div class="cp-sw-phase-badge ' + (phaseCls[phase] || phaseCls.a) + '">' + esc(SW_PHASE_LABELS[phase] || '') + '</div>';
    html += '<h2 class="cp-sw-step-title">' + esc(title) + '</h2>';
    html += '<p class="cp-sw-step-subtitle">' + esc(subtitle) + '</p>';
    html += '</div>';
    return html;
  }

  // --- Build: footer navigation ---
  function _buildSWFooter() {
    var n = setupWizardState.step;
    var isFirst = n === 1;
    var isLast  = n === 8;
    var html = '';

    // Left: Back button
    html += '<div class="cp-sw-footer-left">';
    if (!isFirst) {
      html += '<button class="cp-btn cp-btn-outline" data-action="sw-back">' + icon('arrow-left') + ' Back</button>';
    } else {
      html += '<span></span>';
    }
    html += '</div>';

    // Center: step counter + skip link
    html += '<div class="cp-sw-footer-center">';
    html += '<div class="cp-sw-step-counter">Step ' + n + ' of 8</div>';
    if (!isFirst && !isLast && n !== 1) {
      html += '<button class="cp-sw-skip-link" data-action="sw-skip">Skip this step</button>';
    }
    html += '</div>';

    // Right: Next / Launch button
    html += '<div class="cp-sw-footer-right">';
    if (!isLast) {
      html += '<button class="cp-btn cp-btn-primary" data-action="sw-next">Next ' + icon('arrow-right') + '</button>';
    } else {
      html += '<button class="cp-btn cp-btn-ai" data-action="sw-launch">' + icon('rocket') + ' Launch Workspace</button>';
    }
    html += '</div>';

    return html;
  }

  // --- Validation ---
  function validateSWStep(n) {
    var ws = setupWizardState;
    if (n === 1) {
      if (!ws.workspace.name.trim())         return { valid: false, message: 'Please enter a workspace name to continue.' };
      if (!ws.workspace.product_name.trim()) return { valid: false, message: 'Please enter your product or service name.' };
    }
    if (n === 3) {
      if (ws.personas.filter(function(p) { return p._selected; }).length === 0) {
        return { valid: false, message: 'Please select at least one persona to continue.' };
      }
    }
    if (n === 5) {
      if (ws.messages.filter(function(m) { return m._selected; }).length === 0) {
        return { valid: false, message: 'Please select at least one message to continue.' };
      }
    }
    if (n === 6) {
      var noStyle  = ws.styles.filter(function(s) { return s._selected; }).length === 0;
      var noFormat = ws.formats.filter(function(f) { return f._selected; }).length === 0;
      if (noStyle || noFormat) {
        return { valid: false, message: 'Please select at least one style and one format to continue.' };
      }
    }
    if (n === 7) {
      if (!ws.campaign.name.trim()) return { valid: false, message: 'Please enter a campaign name.' };
      if (ws.combos.filter(function(c) { return c.selected; }).length === 0) {
        return { valid: false, message: 'Please select at least one recipe combination.' };
      }
    }
    return { valid: true };
  }

  // --- Show inline validation message ---
  function _showSWValidation(message) {
    $('.cp-sw-validation').remove();
    var $msg = $('<div class="cp-sw-validation">' + icon('warning') + ' <span>' + esc(message) + '</span></div>');
    $('.cp-sw-footer').prepend($msg);
    setTimeout(function() { $msg.fadeOut(300, function() { $msg.remove(); }); }, 4000);
  }

  // --- Navigation ---
  function swGoNext() {
    swCollectFields();
    var n = setupWizardState.step;
    var v = validateSWStep(n);
    if (!v.valid) { _showSWValidation(v.message); return; }
    if (n < 8) {
      setupWizardState.step = n + 1;
      refreshSetupWizard();
      // Trigger AI auto-generation for the new step if applicable
      _swAutoTriggerAI(setupWizardState.step);
    }
  }

  function swGoBack() {
    swCollectFields();
    if (setupWizardState.step > 1) {
      setupWizardState.step--;
      refreshSetupWizard();
    }
  }

  function swSkipStep() {
    var n = setupWizardState.step;
    setupWizardState.stepSkipped[n] = true;
    if (n < 8) {
      setupWizardState.step = n + 1;
      refreshSetupWizard();
      _swAutoTriggerAI(setupWizardState.step);
    }
  }

  function swGotoStep(n) {
    // Only allow navigating to already-completed steps
    if (n < setupWizardState.step) {
      swCollectFields();
      setupWizardState.step = n;
      refreshSetupWizard();
    }
  }

  // --- Auto-trigger AI for steps that support it ---
  function _swAutoTriggerAI(n) {
    var R   = window._cpRenderers || {};
    var cfg = setupWizardState.aiConfig;
    // Always persist the wizard AI picker selection first so Part 2B resolves it correctly
    if (cfg.provider && cfg.model && window._cpPart2B && window._cpPart2B.LLMService) {
      window._cpPart2B.LLMService.savePreference('sw-ai-config', cfg.provider, cfg.model);
    }
    // Step 7: auto-generate combos algorithmically (no AI — always refresh on entry)
    if (n === 7) { _swAutoGenerateCombos(); return; }
    // All other AI steps: only generate once per wizard session
    if (setupWizardState.stepGenerated[n]) return;
    if (n === 3 && typeof R.swAIGeneratePersonas === 'function')       R.swAIGeneratePersonas();
    if (n === 4 && typeof R.swAIGeneratePainPoints === 'function')     R.swAIGeneratePainPoints();
    if (n === 5 && typeof R.swAIGenerateMessages === 'function')       R.swAIGenerateMessages();
    if (n === 6 && typeof R.swAIGenerateStylesFormats === 'function')  R.swAIGenerateStylesFormats();
  }

  // --- Algorithmically generate recipe combos for Step 7 (no AI) ---
  function _swAutoGenerateCombos() {
    var state = setupWizardState;
    // Auto-fill campaign name from product name if still blank
    if (!state.campaign.name && state.workspace.product_name) {
      state.campaign.name = state.workspace.product_name + ' Campaign';
    }
    var selPersonas = (state.personas   || []).filter(function(p) { return p._selected; });
    var selMessages = (state.messages   || []).filter(function(m) { return m._selected; });
    var selStyles   = (state.styles     || []).filter(function(s) { return s._selected; });
    var selFormats  = (state.formats    || []).filter(function(f) { return f._selected; });

    if (!selPersonas.length && !selMessages.length) {
      state.combos = [];
      refreshSetupWizard();
      return;
    }

    var personasToUse = selPersonas.length ? selPersonas : [null];
    var messagesToUse = selMessages.length ? selMessages : [null];
    var stylesToUse   = selStyles.length   ? selStyles   : [null];
    var formatsToUse  = selFormats.length  ? selFormats  : [null];

    var combos    = [];
    var styleIdx  = 0;
    var formatIdx = 0;

    outer:
    for (var pi = 0; pi < personasToUse.length; pi++) {
      var msgSlice = messagesToUse.slice(0, 2); // up to 2 messages per persona
      for (var mi = 0; mi < msgSlice.length; mi++) {
        combos.push({
          persona:  personasToUse[pi],
          message:  msgSlice[mi],
          style:    stylesToUse[styleIdx  % stylesToUse.length],
          format:   formatsToUse[formatIdx % formatsToUse.length],
          selected: true
        });
        styleIdx++;
        formatIdx++;
        if (combos.length >= 8) break outer;
      }
    }

    state.combos = combos;
    refreshSetupWizard();
  }

  // ------------------------------------------------------------------
  // SECTION 9.4a: SETUP WIZARD — STEP RENDERERS (Phase 2: Steps 1 & 2)
  // ------------------------------------------------------------------

  function renderSWStep1() {
    var ws  = setupWizardState.workspace;
    var objectives = Constants.CAMPAIGN_OBJECTIVES || [];

    var html = _buildSWStepHeader(
      'Workspace Setup',
      'Tell us about your brand and what you\'re advertising. This context shapes every AI output throughout the wizard.',
      'a'
    );

    html += '<div class="cp-sw-form">';

    // Workspace Name
    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Workspace Name <span class="cp-required">*</span></label>';
    html += '<input type="text" class="cp-input" data-sw-field="workspace.name"';
    html += ' placeholder="e.g., Brand Q2 2026 Campaigns" value="' + esc(ws.name || '') + '" autocomplete="off">';
    html += '<p class="cp-field-hint">Names your Campaign Planner workspace — visible in the header.</p>';
    html += '</div>';

    // Product / Service
    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Product / Service <span class="cp-required">*</span></label>';
    html += '<input type="text" class="cp-input" data-sw-field="workspace.product_name"';
    html += ' placeholder="What are you advertising?" value="' + esc(ws.product_name || '') + '" autocomplete="off">';
    html += '<p class="cp-field-hint">Be specific — e.g., "SaaS project management tool for remote teams".</p>';
    html += '</div>';

    // Primary Objective
    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Primary Campaign Objective</label>';
    html += '<select class="cp-select" data-sw-field="workspace.objective">';
    html += '<option value="">Select objective...</option>';
    for (var i = 0; i < objectives.length; i++) {
      var obj = objectives[i];
      html += '<option value="' + esc(obj.id) + '"' + (ws.objective === obj.id ? ' selected' : '') + '>' + esc(obj.name) + '</option>';
    }
    html += '</select>';
    html += '</div>';

    // Product Description & Brand Voice
    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Product Description &amp; Brand Voice</label>';
    html += '<textarea class="cp-textarea" data-sw-field="workspace.description" rows="3"';
    html += ' placeholder="Describe what makes your product unique, your brand tone, key differentiators...">' + esc(ws.description || '') + '</textarea>';
    html += '<p class="cp-field-hint">The more detail here, the better your AI-generated personas, messages, and hooks will be.</p>';
    html += '</div>';

    // Target Audience Overview
    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Target Audience Overview</label>';
    html += '<textarea class="cp-textarea" data-sw-field="workspace.target_audience" rows="2"';
    html += ' placeholder="Who are your ideal customers? e.g., small business owners aged 30–50 in the US...">' + esc(ws.target_audience || '') + '</textarea>';
    html += '</div>';

    // Custom AI Instructions
    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Custom AI Instructions</label>';
    html += '<textarea class="cp-textarea" data-sw-field="workspace.custom_instructions" rows="2"';
    html += ' placeholder="Any rules for AI: tone, things to avoid, mandatory phrases...">' + esc(ws.custom_instructions || '') + '</textarea>';
    html += '</div>';

    // Brand context callout
    if (S.brand && S.brand.configured) {
      var brandName = (S.brand.identity && S.brand.identity.name) || 'Your brand';
      html += '<div class="cp-sw-info-box cp-sw-info-box--success">';
      html += icon('link') + ' <strong>Brand context connected</strong> — ' + esc(brandName) + ' data will be automatically injected into all AI prompts.';
      html += '</div>';
    } else {
      html += '<div class="cp-sw-info-box">';
      html += icon('info') + ' No brand profile connected. AI will use the information you enter above.';
      html += '</div>';
    }

    html += '</div>'; // .cp-sw-form
    return html;
  }

  function renderSWStep2() {
    var cfg   = setupWizardState.aiConfig;
    var p2b   = window._cpPart2B;
    var aiOk  = p2b && p2b.LLMService && p2b.LLMService.isConfigured();

    var html = _buildSWStepHeader(
      'AI Configuration',
      'Select the AI provider and model that will power all generation steps. API keys are managed in your Drupal LLM settings.',
      'a'
    );

    if (!aiOk) {
      html += '<div class="cp-sw-info-box cp-sw-info-box--warn">';
      html += icon('triangle-alert') + ' <div><strong>No AI providers configured.</strong> ';
      html += 'AI generation requires API keys set up in your Drupal LLM settings. ';
      html += 'You can continue through the wizard and fill in content manually.</div>';
      html += '</div>';
      html += '<p class="cp-sw-ai-skip-note">Skip this step to continue without AI assistance. You can configure AI in Settings &rarr; AI at any time.</p>';
      return html;
    }

    html += '<div class="cp-sw-form">';

    // Provider + model picker
    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">AI Provider &amp; Model</label>';
    html += '<div class="cp-sw-ai-picker-wrap" id="swAiPickerWrap">';
    html += window._cpAiSel('sw-ai-config');
    html += '</div>';
    html += '<p class="cp-field-hint">This selection will be used for all AI generation steps in this wizard.</p>';
    html += '</div>';

    // Test connection row
    html += '<div class="cp-sw-ai-test-row">';
    html += '<button class="cp-btn cp-btn-secondary" data-action="sw-test-ai" id="swTestAiBtn">' + icon('zap') + ' Test Connection</button>';
    html += '<span class="cp-sw-ai-test-status" id="swAiTestStatus">';
    if (cfg.tested === true) {
      html += '<span class="cp-sw-test-ok">' + icon('circle-check') + ' Connection verified</span>';
    } else if (cfg.tested === 'fail') {
      html += '<span class="cp-sw-test-fail">' + icon('circle-x') + ' Test failed — check your API key</span>';
    } else {
      html += '<span class="cp-sw-test-idle">Not tested yet &mdash; you can still continue</span>';
    }
    html += '</span>';
    html += '</div>';

    html += '<div class="cp-sw-info-box" style="margin-top:var(--cp-space-2)">';
    html += icon('info') + ' Skipping the test is fine — the wizard will let you know if AI calls fail during generation.';
    html += '</div>';

    html += '</div>'; // .cp-sw-form
    return html;
  }

  // Inline AI connection test for the wizard Step 2
  function _swTestAIConnection() {
    var p2b = window._cpPart2B;
    if (!p2b || !p2b.LLMService || !p2b.LLMService.isConfigured()) {
      toast('No AI provider configured — check Settings → AI.', 'warning');
      return;
    }
    var $btn    = $('#swTestAiBtn');
    var $status = $('#swAiTestStatus');
    $btn.prop('disabled', true).html(icon('spinner') + ' Testing...');
    $status.html('<span class="cp-sw-test-idle">Sending test request...</span>');

    // Capture current picker selection into state before testing
    var $prov = $('.cp-ai-provider-select[data-action-id="sw-ai-config"]');
    var $mod  = $('.cp-ai-model-select[data-action-id="sw-ai-config"]');
    if ($prov.length) setupWizardState.aiConfig.provider = $prov.val();
    if ($mod.length)  setupWizardState.aiConfig.model    = $mod.val();

    p2b.callAIWithRetry(
      'Reply with exactly one word: OK',
      function() {
        $btn.prop('disabled', false).html(icon('zap') + ' Test Connection');
        setupWizardState.aiConfig.tested = true;
        $status.html('<span class="cp-sw-test-ok">' + icon('circle-check') + ' Connection verified</span>');
      },
      function(err) {
        $btn.prop('disabled', false).html(icon('zap') + ' Test Connection');
        setupWizardState.aiConfig.tested = 'fail';
        $status.html('<span class="cp-sw-test-fail">' + icon('circle-x') + ' Test failed — ' + esc(String(err).substring(0, 80)) + '</span>');
      },
      'sw-ai-config'
    );
  }

  // ------------------------------------------------------------------
  // SECTION 9.4b: SETUP WIZARD — STEP RENDERERS (Phase 3: Steps 3 & 4)
  // ------------------------------------------------------------------

  // --- Shared helpers ---

  function _buildSWSkeletonCards(count) {
    var html = '<div class="cp-sw-ai-loading" style="margin-top:var(--cp-space-4)">';
    for (var i = 0; i < count; i++) {
      html += '<div class="cp-sw-skeleton-card">';
      html += '<div class="cp-sw-skeleton-line cp-sw-skeleton-line--title"></div>';
      html += '<div class="cp-sw-skeleton-line"></div>';
      html += '<div class="cp-sw-skeleton-line"></div>';
      html += '<div class="cp-sw-skeleton-line cp-sw-skeleton-line--short"></div>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function _swDetailCell(label, value) {
    return '<div>'
      + '<div class="cp-sw-sel-card-detail-label">' + esc(label) + '</div>'
      + '<div class="cp-sw-sel-card-detail-value">' + esc(value) + '</div>'
      + '</div>';
  }

  // --- Step 3: Personas ---

  function renderSWStep3() {
    var ws       = setupWizardState;
    var personas = ws.personas || [];
    var generated = ws.stepGenerated[3];

    var html = _buildSWStepHeader(
      'Target Personas',
      'Select the audience personas that best represent your ideal customers. AI will generate options based on your workspace setup.',
      'b'
    );

    // Generation bar
    html += '<div class="cp-sw-gen-bar">';
    html += '<textarea class="cp-textarea" id="swPersonaContext" rows="2"';
    html += ' placeholder="Optional: additional context for persona generation (e.g., focus on enterprise buyers, include a tech-savvy segment)...">';
    html += esc(ws._personaContext || '');
    html += '</textarea>';
    html += '<button class="cp-btn cp-btn-ai" data-action="sw-ai-gen-personas"' + (ws.aiLoading ? ' disabled' : '') + '>';
    html += icon('sparkles') + ' ' + (generated ? 'Regenerate' : 'Generate with AI');
    html += '</button>';
    html += '</div>';

    if (ws.aiLoading) {
      html += _buildSWSkeletonCards(4);
    } else if (!personas.length) {
      html += '<div class="cp-sw-empty-state">';
      html += '<div class="cp-sw-empty-icon">' + icon('users') + '</div>';
      html += '<p>Click <strong>Generate with AI</strong> to create persona suggestions based on your product and target audience.</p>';
      html += '</div>';
    } else {
      var selCount = personas.filter(function(p) { return p._selected; }).length;
      html += '<div class="cp-sw-card-bottom">';
      html += '<span class="cp-sw-sel-count' + (selCount > 0 ? ' cp-sw-sel-count--ok' : '') + '">';
      html += selCount + ' of ' + personas.length + ' persona' + (personas.length !== 1 ? 's' : '') + ' selected';
      html += '</span>';
      html += '</div>';
      html += '<div class="cp-sw-card-grid">';
      for (var i = 0; i < personas.length; i++) {
        html += _buildSWPersonaCard(personas[i], i);
      }
      html += '</div>';
    }

    return html;
  }

  function _buildSWPersonaCard(p, idx) {
    var selected = p._selected;
    var expanded = setupWizardState._expandedCards['p_' + idx];
    var demo  = p.demographics  || {};
    var psych = p.psychographics || {};

    var tags = [];
    if (demo.age_range)  tags.push(demo.age_range);
    if (demo.location)   tags.push(demo.location);
    if (demo.occupation) tags.push(demo.occupation);

    var html = '<div class="cp-sw-sel-card' + (selected ? ' cp-sw-sel-card--selected' : '') + '" data-idx="' + idx + '" role="button" tabindex="0" aria-pressed="' + (selected ? 'true' : 'false') + '">';
    html += '<div class="cp-sw-sel-card-check">' + (selected ? icon('check') : '') + '</div>';
    html += '<div class="cp-sw-sel-card-title">' + esc(p.name || ('Persona ' + (idx + 1))) + '</div>';
    if (p.description) {
      html += '<div class="cp-sw-sel-card-body">' + esc(truncate(p.description, 110)) + '</div>';
    }
    if (tags.length) {
      html += '<div class="cp-sw-sel-card-tags">';
      for (var t = 0; t < tags.length; t++) {
        html += '<span class="cp-sw-sel-card-tag">' + esc(tags[t]) + '</span>';
      }
      html += '</div>';
    }
    html += '<button class="cp-sw-sel-card-expand" data-action="sw-card-expand" data-key="p_' + idx + '">';
    html += icon(expanded ? 'chevron-up' : 'chevron-down') + ' ' + (expanded ? 'Less' : 'Details');
    html += '</button>';

    if (expanded) {
      html += '<div class="cp-sw-sel-card-expanded-body">';
      html += '<div class="cp-sw-sel-card-detail-grid">';
      if (demo.gender)       html += _swDetailCell('Gender',     demo.gender);
      if (demo.income_level) html += _swDetailCell('Income',     demo.income_level);
      if (demo.education)    html += _swDetailCell('Education',  demo.education);
      if (demo.industry)     html += _swDetailCell('Industry',   demo.industry);
      if (psych.desires)     html += _swDetailCell('Desires',    psych.desires);
      if (psych.fears)       html += _swDetailCell('Fears',      psych.fears);
      if (psych.motivations) html += _swDetailCell('Motivations',psych.motivations);
      if (psych.values)      html += _swDetailCell('Values',     psych.values);
      html += '</div>';
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  // --- Step 4: Pain Points ---

  function renderSWStep4() {
    var ws        = setupWizardState;
    var pps       = ws.pain_points || [];
    var selPersonas = (ws.personas || []).filter(function(p) { return p._selected; });
    var generated = ws.stepGenerated[4];

    var html = _buildSWStepHeader(
      'Pain Points',
      'Select the key challenges your personas face. These directly shape your ad messages, hooks, and copy.',
      'b'
    );

    if (!selPersonas.length) {
      html += '<div class="cp-sw-empty-state cp-sw-empty-state--warn">';
      html += icon('triangle-alert') + ' No personas selected from Step 3. Go back and select at least one persona.';
      html += '</div>';
      return html;
    }

    // Generation bar
    html += '<div class="cp-sw-gen-bar">';
    html += '<textarea class="cp-textarea" id="swPainPointContext" rows="2"';
    html += ' placeholder="Optional: focus on specific challenges or industries (e.g., focus on time management struggles)...">';
    html += esc(ws._ppContext || '');
    html += '</textarea>';
    html += '<button class="cp-btn cp-btn-ai" data-action="sw-ai-gen-painpoints"' + (ws.aiLoading ? ' disabled' : '') + '>';
    html += icon('sparkles') + ' ' + (generated ? 'Regenerate' : 'Generate with AI');
    html += '</button>';
    html += '</div>';

    if (ws.aiLoading) {
      html += _buildSWSkeletonCards(6);
    } else if (!pps.length) {
      html += '<div class="cp-sw-empty-state">';
      html += '<div class="cp-sw-empty-icon">' + icon('crosshair') + '</div>';
      html += '<p>Click <strong>Generate with AI</strong> to create pain point suggestions based on your selected personas.</p>';
      html += '</div>';
    } else {
      // Persona tab bar (only when 2+ personas selected)
      if (selPersonas.length > 1) {
        var activeTab = ws._ppActiveTab || 0;
        html += '<div class="cp-sw-pp-tabs">';
        for (var pi = 0; pi < selPersonas.length; pi++) {
          var personaRealIdx = (ws.personas || []).indexOf(selPersonas[pi]);
          var tabPPCount = pps.filter(function(pp) { return pp._persona_idx === personaRealIdx && pp._selected; }).length;
          html += '<button class="cp-sw-pp-tab' + (activeTab === pi ? ' cp-sw-pp-tab--active' : '') + '" data-action="sw-pp-tab" data-tab="' + pi + '">';
          html += esc(truncate(selPersonas[pi].name || 'Persona', 22));
          if (tabPPCount) html += ' <span class="cp-sw-pp-tab-badge">' + tabPPCount + '</span>';
          html += '</button>';
        }
        html += '</div>';
      }

      // Filter to active persona tab (or show all if single persona)
      var visiblePPs;
      if (selPersonas.length > 1) {
        var activePersona = selPersonas[ws._ppActiveTab || 0];
        var filterIdx = (ws.personas || []).indexOf(activePersona);
        visiblePPs = pps.map(function(pp, i) { return { pp: pp, i: i }; })
                        .filter(function(o) { return o.pp._persona_idx === filterIdx; });
      } else {
        visiblePPs = pps.map(function(pp, i) { return { pp: pp, i: i }; });
      }

      var totalSel = pps.filter(function(pp) { return pp._selected; }).length;
      html += '<div class="cp-sw-card-bottom">';
      html += '<span class="cp-sw-sel-count' + (totalSel > 0 ? ' cp-sw-sel-count--ok' : '') + '">';
      html += totalSel + ' of ' + pps.length + ' pain point' + (pps.length !== 1 ? 's' : '') + ' selected';
      html += '</span>';
      html += '</div>';

      html += '<div class="cp-sw-card-grid">';
      for (var j = 0; j < visiblePPs.length; j++) {
        html += _buildSWPainPointCard(visiblePPs[j].pp, visiblePPs[j].i);
      }
      html += '</div>';
    }

    return html;
  }

  function _buildSWPainPointCard(pp, idx) {
    var selected = pp._selected;
    var expanded = setupWizardState._expandedCards['pp_' + idx];

    var html = '<div class="cp-sw-sel-card' + (selected ? ' cp-sw-sel-card--selected' : '') + '" data-idx="' + idx + '" role="button" tabindex="0" aria-pressed="' + (selected ? 'true' : 'false') + '">';
    html += '<div class="cp-sw-sel-card-check">' + (selected ? icon('check') : '') + '</div>';
    html += '<div class="cp-sw-sel-card-title">' + esc(truncate(pp.pain_point || 'Pain Point', 90)) + '</div>';
    if (pp.category) {
      html += '<div class="cp-sw-sel-card-tags"><span class="cp-sw-sel-card-tag">' + esc(pp.category) + '</span></div>';
    }
    if (pp.solution) {
      html += '<button class="cp-sw-sel-card-expand" data-action="sw-card-expand" data-key="pp_' + idx + '">';
      html += icon(expanded ? 'chevron-up' : 'chevron-down') + ' ' + (expanded ? 'Hide solution' : 'View solution');
      html += '</button>';
      if (expanded) {
        html += '<div class="cp-sw-sel-card-expanded-body">';
        html += '<div class="cp-sw-sel-card-detail-label">Solution / Product angle</div>';
        html += '<div class="cp-sw-sel-card-detail-value">' + esc(pp.solution) + '</div>';
        html += '</div>';
      }
    }
    html += '</div>';
    return html;
  }

  // ------------------------------------------------------------------
  // SECTION 9.4c: SETUP WIZARD — STEP RENDERERS (Phase 4: Steps 5 & 6)
  // ------------------------------------------------------------------

  // --- Step 5: Messages ---

  function renderSWStep5() {
    var ws       = setupWizardState;
    var messages = ws.messages || [];
    var generated = ws.stepGenerated[5];

    var html = _buildSWStepHeader(
      'Ad Messages',
      'Select the message angles and hooks that will shape your ads. AI generates options based on your personas and pain points.',
      'b'
    );

    // Generation bar
    html += '<div class="cp-sw-gen-bar">';
    html += '<textarea class="cp-textarea" id="swMessageContext" rows="2"';
    html += ' placeholder="Optional: focus on specific angles (e.g., emphasise ROI, use testimonial hooks)...">';
    html += esc(ws._messageContext || '');
    html += '</textarea>';
    html += '<button class="cp-btn cp-btn-ai" data-action="sw-ai-gen-messages"' + (ws.aiLoading ? ' disabled' : '') + '>';
    html += icon('sparkles') + ' ' + (generated ? 'Regenerate' : 'Generate with AI');
    html += '</button>';
    html += '</div>';

    if (ws.aiLoading) {
      html += _buildSWSkeletonCards(4);
    } else if (!messages.length) {
      html += '<div class="cp-sw-empty-state">';
      html += '<div class="cp-sw-empty-icon">' + icon('message-square') + '</div>';
      html += '<p>Click <strong>Generate with AI</strong> to create message angle suggestions based on your personas and pain points.</p>';
      html += '</div>';
    } else {
      var selCount = messages.filter(function(m) { return m._selected; }).length;
      html += '<div class="cp-sw-card-bottom">';
      html += '<span class="cp-sw-sel-count' + (selCount > 0 ? ' cp-sw-sel-count--ok' : '') + '">';
      html += selCount + ' of ' + messages.length + ' message' + (messages.length !== 1 ? 's' : '') + ' selected';
      html += '</span>';
      html += '</div>';
      html += '<div class="cp-sw-card-grid">';
      for (var i = 0; i < messages.length; i++) {
        html += _buildSWMessageCard(messages[i], i);
      }
      html += '</div>';
    }

    return html;
  }

  function _buildSWMessageCard(msg, idx) {
    var selected = msg._selected;
    var expanded = setupWizardState._expandedCards['m_' + idx];

    var stageLabel = { top: 'TOFU', mid: 'MOFU', bot: 'BOFU' }[msg.funnel_stage] || msg.funnel_stage || '';

    var html = '<div class="cp-sw-sel-card' + (selected ? ' cp-sw-sel-card--selected' : '') + '" data-idx="' + idx + '" role="button" tabindex="0" aria-pressed="' + (selected ? 'true' : 'false') + '">';
    html += '<div class="cp-sw-sel-card-check">' + (selected ? icon('check') : '') + '</div>';
    html += '<div class="cp-sw-sel-card-title">' + esc(msg.name || ('Message ' + (idx + 1))) + '</div>';
    if (msg.description) {
      html += '<div class="cp-sw-sel-card-body">' + esc(truncate(msg.description, 100)) + '</div>';
    }
    var tags = [];
    if (msg.theme)      tags.push(msg.theme);
    if (msg.hook_type)  tags.push(msg.hook_type);
    if (stageLabel)     tags.push(stageLabel);
    if (tags.length) {
      html += '<div class="cp-sw-sel-card-tags">';
      for (var t = 0; t < tags.length; t++) {
        html += '<span class="cp-sw-sel-card-tag">' + esc(tags[t]) + '</span>';
      }
      html += '</div>';
    }
    if (msg.body) {
      html += '<button class="cp-sw-sel-card-expand" data-action="sw-card-expand" data-key="m_' + idx + '">';
      html += icon(expanded ? 'chevron-up' : 'chevron-down') + ' ' + (expanded ? 'Hide copy' : 'View copy angle');
      html += '</button>';
      if (expanded) {
        html += '<div class="cp-sw-sel-card-expanded-body">';
        html += '<div class="cp-sw-sel-card-detail-label">Copy angle</div>';
        html += '<div class="cp-sw-sel-card-detail-value" style="white-space:pre-line">' + esc(msg.body) + '</div>';
        html += '</div>';
      }
    }
    html += '</div>';
    return html;
  }

  // --- Step 6: Styles & Formats ---

  function renderSWStep6() {
    var ws       = setupWizardState;
    var styles   = ws.styles  || [];
    var formats  = ws.formats || [];
    var generated = ws.stepGenerated[6];
    var bothEmpty = !styles.length && !formats.length;

    var html = _buildSWStepHeader(
      'Styles &amp; Formats',
      'Select the creative styles and ad formats that fit your brand. These define how your ads will look and where they\'ll run.',
      'b'
    );

    // Single generation bar for both styles and formats
    html += '<div class="cp-sw-gen-bar">';
    html += '<textarea class="cp-textarea" id="swStyleFormatContext" rows="2"';
    html += ' placeholder="Optional: specify platforms, formats or style direction (e.g., focus on TikTok-native, minimalist aesthetic)...">';
    html += esc(ws._styleFormatContext || '');
    html += '</textarea>';
    html += '<button class="cp-btn cp-btn-ai" data-action="sw-ai-gen-styles-formats"' + (ws.aiLoading ? ' disabled' : '') + '>';
    html += icon('sparkles') + ' ' + (generated ? 'Regenerate All' : 'Generate with AI');
    html += '</button>';
    html += '</div>';

    if (ws.aiLoading) {
      // Loading — show skeleton for both sections
      html += _buildSWSubSection('Styles', 0, 0);
      html += _buildSWSkeletonCards(3);
      html += _buildSWSubSection('Formats', 0, 0);
      html += _buildSWSkeletonCards(4);
    } else if (bothEmpty && !generated) {
      html += '<div class="cp-sw-empty-state">';
      html += '<div class="cp-sw-empty-icon">' + icon('palette') + '</div>';
      html += '<p>Click <strong>Generate with AI</strong> to create creative style and ad format suggestions tailored to your product and objectives.</p>';
      html += '</div>';
    } else {
      // Styles section
      var selStyles  = styles.filter(function(s) { return s._selected; }).length;
      var selFormats = formats.filter(function(f) { return f._selected; }).length;

      html += _buildSWSubSection('Styles', selStyles, styles.length);
      if (styles.length) {
        html += '<div class="cp-sw-card-grid">';
        for (var i = 0; i < styles.length; i++) html += _buildSWStyleCard(styles[i], i);
        html += '</div>';
      } else {
        html += '<div class="cp-sw-empty-state" style="padding:var(--cp-space-4) 0"><p>No styles generated — try regenerating above.</p></div>';
      }

      // Formats section
      html += _buildSWSubSection('Formats', selFormats, formats.length);
      if (formats.length) {
        html += '<div class="cp-sw-card-grid">';
        for (var j = 0; j < formats.length; j++) html += _buildSWFormatCard(formats[j], j);
        html += '</div>';
      } else {
        html += '<div class="cp-sw-empty-state" style="padding:var(--cp-space-4) 0"><p>No formats generated — try regenerating above.</p></div>';
      }
    }

    return html;
  }

  function _buildSWSubSection(title, selCount, total) {
    var html = '<div class="cp-sw-section-divider">';
    html += '<span class="cp-sw-section-divider-title">' + esc(title) + '</span>';
    if (total > 0) {
      html += '<span class="cp-sw-section-divider-count">' + selCount + ' / ' + total + ' selected</span>';
    }
    html += '<span class="cp-sw-section-divider-line"></span>';
    html += '</div>';
    return html;
  }

  function _buildSWStyleCard(style, idx) {
    var selected = style._selected;
    var html = '<div class="cp-sw-sel-card' + (selected ? ' cp-sw-sel-card--selected' : '') + '" data-idx="' + idx + '" data-card-type="style" role="button" tabindex="0" aria-pressed="' + (selected ? 'true' : 'false') + '">';
    html += '<div class="cp-sw-sel-card-check">' + (selected ? icon('check') : '') + '</div>';
    html += '<div class="cp-sw-sel-card-title">' + esc(style.name || ('Style ' + (idx + 1))) + '</div>';
    if (style.description) {
      html += '<div class="cp-sw-sel-card-body">' + esc(truncate(style.description, 120)) + '</div>';
    }
    html += '</div>';
    return html;
  }

  function _buildSWFormatCard(format, idx) {
    var selected = format._selected;
    var html = '<div class="cp-sw-sel-card' + (selected ? ' cp-sw-sel-card--selected' : '') + '" data-idx="' + idx + '" data-card-type="format" role="button" tabindex="0" aria-pressed="' + (selected ? 'true' : 'false') + '">';
    html += '<div class="cp-sw-sel-card-check">' + (selected ? icon('check') : '') + '</div>';
    html += '<div class="cp-sw-sel-card-title">' + esc(format.name || ('Format ' + (idx + 1))) + '</div>';
    if (format.description) {
      html += '<div class="cp-sw-sel-card-body">' + esc(truncate(format.description, 100)) + '</div>';
    }
    if (format.category) {
      html += '<div class="cp-sw-sel-card-tags"><span class="cp-sw-sel-card-tag">' + esc(format.category) + '</span></div>';
    }
    html += '</div>';
    return html;
  }

  // ------------------------------------------------------------------
  // SECTION 9.4d: SETUP WIZARD — STEP RENDERERS (Phase 5: Steps 7 & 8)
  // ------------------------------------------------------------------

  // --- Step 7: Campaign Setup + Recipe Combos ---

  function renderSWStep7() {
    var ws     = setupWizardState;
    var cam    = ws.campaign || {};
    var combos = ws.combos   || [];

    var html = _buildSWStepHeader(
      'Campaign Setup',
      'Name your campaign, set dates, and choose which persona-message-style combinations to build as ad recipes.',
      'c'
    );

    // --- Campaign form ---
    html += '<div class="cp-sw-form">';

    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Campaign Name <span class="cp-required">*</span></label>';
    html += '<input type="text" class="cp-input" data-sw-field="campaign.name"';
    html += ' placeholder="e.g., Q3 Growth Campaign" value="' + esc(cam.name || '') + '" autocomplete="off">';
    html += '</div>';

    html += '<div class="cp-sw-field-row">';
    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Start Date</label>';
    html += '<input type="date" class="cp-input" data-sw-field="campaign.date_start"';
    html += ' value="' + esc(cam.date_start || '') + '">';
    html += '</div>';
    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">End Date</label>';
    html += '<input type="date" class="cp-input" data-sw-field="campaign.date_end"';
    html += ' value="' + esc(cam.date_end || '') + '">';
    html += '</div>';
    html += '</div>';

    html += '<div class="cp-field">';
    html += '<label class="cp-field-label">Budget Notes</label>';
    html += '<input type="text" class="cp-input" data-sw-field="campaign.budget_notes"';
    html += ' placeholder="e.g., $5,000/month" value="' + esc(cam.budget_notes || '') + '">';
    html += '</div>';

    html += '</div>'; // end .cp-sw-form

    // --- Recipe combos section ---
    var selCount = combos.filter(function(c) { return c.selected; }).length;

    html += _buildSWSubSection('Ad Recipe Combinations', selCount, combos.length);

    if (!combos.length) {
      html += '<div class="cp-sw-empty-state">';
      html += '<div class="cp-sw-empty-icon">' + icon('shuffle') + '</div>';
      html += '<p>No combinations could be generated. Go back to earlier steps and select at least one persona and one message.</p>';
      html += '</div>';
    } else {
      html += '<div class="cp-sw-card-bottom">';
      html += '<span class="cp-sw-sel-count' + (selCount > 0 ? ' cp-sw-sel-count--ok' : '') + '">';
      html += selCount + ' of ' + combos.length + ' combo' + (combos.length !== 1 ? 's' : '') + ' selected';
      html += '</span>';
      html += '<button class="cp-btn cp-btn-sm cp-btn-outline" data-action="sw-regen-combos">';
      html += icon('refresh-cw') + ' Regenerate';
      html += '</button>';
      html += '</div>';

      html += '<div class="cp-sw-card-grid">';
      for (var i = 0; i < combos.length; i++) {
        html += _buildSWComboCard(combos[i], i);
      }
      html += '</div>';
    }

    return html;
  }

  function _buildSWComboCard(combo, idx) {
    var selected = combo.selected;
    var html = '<div class="cp-sw-combo-card' + (selected ? ' cp-sw-combo-card--selected' : '') + '" data-action="sw-combo-toggle" data-idx="' + idx + '" role="button" tabindex="0" aria-pressed="' + (selected ? 'true' : 'false') + '">';
    html += '<div class="cp-sw-combo-card-header">';
    html += '<div class="cp-sw-combo-card-check">' + (selected ? icon('check') : '') + '</div>';
    html += '<div class="cp-sw-combo-card-title">Recipe ' + (idx + 1) + '</div>';
    html += '</div>';
    html += '<div class="cp-sw-combo-parts">';
    if (combo.persona) html += _swComboPart('Persona', combo.persona.name  || 'Persona');
    if (combo.message) html += _swComboPart('Message', combo.message.name  || 'Message');
    if (combo.style)   html += _swComboPart('Style',   combo.style.name    || 'Style');
    if (combo.format)  html += _swComboPart('Format',  combo.format.name   || 'Format');
    html += '</div>';
    html += '</div>';
    return html;
  }

  function _swComboPart(label, value) {
    var html = '<div class="cp-sw-combo-part">';
    html += '<span class="cp-sw-combo-part-label">' + esc(label) + '</span>';
    html += '<span class="cp-sw-combo-part-value">' + esc(truncate(value, 60)) + '</span>';
    html += '</div>';
    return html;
  }

  // --- Step 8: Review & Launch ---

  function renderSWStep8() {
    var ws         = setupWizardState;
    var selPersonas = (ws.personas    || []).filter(function(p) { return p._selected; });
    var selPPs      = (ws.pain_points  || []).filter(function(p) { return p._selected; });
    var selMessages = (ws.messages    || []).filter(function(m) { return m._selected; });
    var selStyles   = (ws.styles      || []).filter(function(s) { return s._selected; });
    var selFormats  = (ws.formats     || []).filter(function(f) { return f._selected; });
    var selCombos   = (ws.combos      || []).filter(function(c) { return c.selected; });

    var html = _buildSWStepHeader(
      'Review &amp; Launch',
      'Everything looks good! Review your selections below then launch to build your workspace.',
      'c'
    );

    // Finalizing progress state
    if (ws.finalizing) {
      html += '<div class="cp-sw-finalize-progress">';
      html += '<div class="cp-sw-finalize-spinner">' + icon('loader') + '</div>';
      html += '<p class="cp-sw-finalize-msg">' + esc(ws.finalizeMsg || 'Setting up your workspace…') + '</p>';
      html += '</div>';
      return html;
    }

    // Summary stats grid
    html += '<div class="cp-sw-review-grid">';
    html += _buildSWReviewBox('users',         'Personas',    selPersonas.length,  selPersonas.map(function(p) { return p.name; }));
    html += _buildSWReviewBox('crosshair',     'Pain Points', selPPs.length,       selPPs.map(function(p) { return p.pain_point; }));
    html += _buildSWReviewBox('message-square','Messages',    selMessages.length,  selMessages.map(function(m) { return m.name; }));
    html += _buildSWReviewBox('palette',       'Styles',      selStyles.length,    selStyles.map(function(s) { return s.name; }));
    html += _buildSWReviewBox('clapperboard',  'Formats',     selFormats.length,   selFormats.map(function(f) { return f.name; }));
    html += _buildSWReviewBox('shuffle',       'Recipes',     selCombos.length,    selCombos.map(function(c, i) { return 'Recipe ' + (i + 1); }));
    html += '</div>';

    // Campaign info box (if campaign name set)
    var cam = ws.campaign || {};
    if (cam.name) {
      html += '<div class="cp-sw-info-box cp-sw-info-box--success" style="margin-top:var(--cp-space-4)">';
      html += icon('briefcase') + ' Campaign: <strong>' + esc(cam.name) + '</strong>';
      if (cam.date_start && cam.date_end) {
        html += ' &nbsp;&middot;&nbsp; ' + esc(cam.date_start) + ' &rarr; ' + esc(cam.date_end);
      }
      if (cam.budget_notes) {
        html += ' &nbsp;&middot;&nbsp; ' + esc(cam.budget_notes);
      }
      html += '</div>';
    }

    // Launch note (button is in the footer)
    html += '<p class="cp-sw-finalize-note" style="margin-top:var(--cp-space-5);text-align:center">';
    html += 'Hit <strong>Launch Workspace</strong> below to create ' + selCombos.length + ' ad recipe' + (selCombos.length !== 1 ? 's' : '') + ' and start your campaign.';
    html += '</p>';

    return html;
  }

  function _buildSWReviewBox(iconName, label, count, names) {
    var html = '<div class="cp-sw-review-box">';
    html += '<div class="cp-sw-review-box-icon">' + icon(iconName) + '</div>';
    html += '<div class="cp-sw-review-box-count">' + count + '</div>';
    html += '<div class="cp-sw-review-box-label">' + esc(label) + '</div>';
    if (names && names.length) {
      html += '<div class="cp-sw-review-box-names">';
      var show = names.slice(0, 3);
      for (var i = 0; i < show.length; i++) {
        html += '<span>' + esc(truncate(show[i] || '', 30)) + '</span>';
      }
      if (names.length > 3) html += '<span>+' + (names.length - 3) + ' more</span>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  // ============================================================
  // SECTION 9.5: CAMPAIGN WIZARD (Multi-Step)
  // ============================================================

  var wizardState = { step: 1, data: {}, selections: { personas: [], messages: [], styles: [], formats: [] }, recipes: [], allSelected: false };

  function openCampaignWizard() {
    wizardState = {
      step: 1, data: { name: '', description: '', objective: '', funnel_stage: '', date_start: '', date_end: '', budget_notes: '', ai_instructions: '' },
      selections: { personas: [], messages: [], styles: [], formats: [] },
      recipes: [], allSelected: false
    };
    renderWizardModal();
  }

  function renderWizardModal() {
    var step = wizardState.step;
    var steps = [
      { num: 1, label: 'Basics', icon: 'clipboard-list' },
      { num: 2, label: 'Targeting', icon: 'crosshairs' },
      { num: 3, label: 'Recipes', icon: 'shuffle' },
      { num: 4, label: 'Review', icon: 'check' }
    ];

    var html = '<div class="cp-wizard">';
    // Step indicator
    html += '<div class="cp-wizard-steps">';
    for (var si = 0; si < steps.length; si++) {
      var st = steps[si];
      var cls = step === st.num ? ' cp-wizard-step-active' : (step > st.num ? ' cp-wizard-step-done' : '');
      html += '<div class="cp-wizard-step' + cls + '" data-action="wizard-go-step" data-step="' + st.num + '">';
      html += (step > st.num ? icon('circle-check') + ' ' : '') + icon(st.icon) + ' ' + esc(st.label);
      html += '</div>';
    }
    html += '</div>';

    // Body
    html += '<div class="cp-wizard-body">';
    switch(step) {
      case 1: html += renderWizardStep1(); break;
      case 2: html += renderWizardStep2(); break;
      case 3: html += renderWizardStep3(); break;
      case 4: html += renderWizardStep4(); break;
    }
    html += '</div>';

    // Footer
    html += '<div class="cp-wizard-footer">';
    if (step > 1) html += '<button class="cp-btn cp-btn-outline" data-action="wizard-prev">' + icon('arrow-left') + ' Back</button>';
    else html += '<span></span>';
    if (step < 4) html += '<button class="cp-btn cp-btn-primary" data-action="wizard-next">Next ' + icon('arrow-right') + '</button>';
    else html += '<button class="cp-btn cp-btn-ai" data-action="wizard-create">' + icon('bolt') + ' Create Campaign</button>';
    html += '</div></div>';

    openModal('Campaign Wizard', html, { titleIcon: 'wand-magic', size: 'xl', footer: false });
  }

  function renderWizardStep1() {
    var d = wizardState.data;
    var objectives = Constants.CAMPAIGN_OBJECTIVES || [];
    var funnels = (S.meta.settings && S.meta.settings.funnel_stages) || [];
    var html = '<h3 style="margin-bottom:var(--cp-space-4)">' + icon('clipboard-list') + ' Campaign Basics</h3>';
    html += '<div class="cp-form-group"><label>Campaign Name *</label>';
    html += '<input type="text" class="cp-input cp-wizard-field" data-wfield="name" value="' + esc(d.name) + '" placeholder="e.g., Q3 Creator Growth Campaign"></div>';
    html += '<div class="cp-form-group"><label>Description</label>';
    html += '<textarea class="cp-textarea cp-wizard-field" data-wfield="description" rows="2" placeholder="What is this campaign about?">' + esc(d.description) + '</textarea></div>';
    html += '<div class="cp-form-row"><div class="cp-form-third"><label>Objective</label>';
    html += '<select class="cp-select cp-wizard-field" data-wfield="objective"><option value="">Select...</option>';
    for (var oi = 0; oi < objectives.length; oi++) html += '<option value="' + esc(objectives[oi].id) + '"' + (d.objective === objectives[oi].id ? ' selected' : '') + '>' + esc(objectives[oi].name) + '</option>';
    html += '</select></div><div class="cp-form-third"><label>Start Date</label>';
    html += '<input type="date" class="cp-input cp-wizard-field" data-wfield="date_start" value="' + esc(d.date_start) + '"></div>';
    html += '<div class="cp-form-third"><label>End Date</label>';
    html += '<input type="date" class="cp-input cp-wizard-field" data-wfield="date_end" value="' + esc(d.date_end) + '"></div></div>';
    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Funnel Focus</label>';
    html += '<select class="cp-select cp-wizard-field" data-wfield="funnel_stage"><option value="">All stages</option>';
    for (var fi = 0; fi < funnels.length; fi++) html += '<option value="' + esc(funnels[fi].id) + '"' + (d.funnel_stage === funnels[fi].id ? ' selected' : '') + '>' + esc(funnels[fi].name) + '</option>';
    html += '</select></div><div class="cp-form-half"><label>Budget Notes</label>';
    html += '<input type="text" class="cp-input cp-wizard-field" data-wfield="budget_notes" value="' + esc(d.budget_notes) + '" placeholder="e.g., ₹2L/month"></div></div>';
    html += '<div class="cp-form-group"><label>AI Instructions for this Campaign</label>';
    html += '<textarea class="cp-textarea cp-wizard-field" data-wfield="ai_instructions" rows="2" placeholder="Special instructions for AI when generating recipes for this campaign...">' + esc(d.ai_instructions) + '</textarea></div>';
    return html;
  }

  function renderWizardStep2() {
    var sel = wizardState.selections;
    var dims = [
      { key: 'personas', label: 'Personas', icon: 'users', color: '#9334e9', items: getAllPersonas(), nameKey: 'name' },
      { key: 'messages', label: 'Messages', icon: 'comments', color: '#1a73e8', items: getAllMessages(), nameKey: 'title' },
      { key: 'styles', label: 'Styles', icon: 'palette', color: '#e37400', items: getAllStyles(), nameKey: 'name' },
      { key: 'formats', label: 'Formats', icon: 'clapperboard', color: '#0891b2', items: getAllFormats(), nameKey: 'name' }
    ];
    var html = '<h3 style="margin-bottom:var(--cp-space-4)">' + icon('crosshairs') + ' Select Dimensions</h3>';
    html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-4)">Choose which personas, messages, styles, and formats this campaign will use. Selected dimensions will be used for recipe generation.</p>';
    for (var di = 0; di < dims.length; di++) {
      var dim = dims[di];
      html += '<div class="cp-wizard-dim-section">';
      html += '<div class="cp-wizard-dim-header" style="color:' + dim.color + '">' + icon(dim.icon) + ' ' + esc(dim.label) + ' <span class="cp-text-muted" style="font-weight:400">(' + sel[dim.key].length + '/' + dim.items.length + ' selected)</span></div>';
      html += '<div class="cp-wizard-dim-list">';
      if (dim.items.length === 0) {
        html += '<span class="cp-text-muted">No ' + dim.label.toLowerCase() + ' in library. <a href="#" data-action="close-modal" style="color:var(--cp-primary)">Create some first.</a></span>';
      } else {
        for (var ii = 0; ii < dim.items.length; ii++) {
          var item = dim.items[ii];
          var isSel = sel[dim.key].indexOf(item.id) > -1;
          html += '<label class="cp-wizard-dim-chip' + (isSel ? ' cp-wizard-dim-chip-selected' : '') + '" style="' + (isSel ? 'background:' + dim.color + '12;color:' + dim.color + ';border-color:' + dim.color : '') + '">';
          html += '<input type="checkbox" data-action="wizard-toggle-dim" data-dim="' + dim.key + '" data-id="' + esc(item.id) + '"' + (isSel ? ' checked' : '') + ' style="display:none">';
          html += esc(item[dim.nameKey] || item.name || item.title || 'Untitled');
          html += '</label>';
        }
      }
      html += '</div></div>';
    }
    return html;
  }

  function renderWizardStep3() {
    var sel = wizardState.selections;
    var personas = sel.personas.length > 0 ? sel.personas : [''];
    var messages = sel.messages.length > 0 ? sel.messages : [''];
    var styles = sel.styles.length > 0 ? sel.styles : [''];
    var formats = sel.formats.length > 0 ? sel.formats : [''];
    var totalCombos = Math.max(1, personas.length) * Math.max(1, messages.length) * Math.max(1, styles.length) * Math.max(1, formats.length);
    var hasSel = sel.personas.length + sel.messages.length + sel.styles.length + sel.formats.length > 0;

    var html = '<h3 style="margin-bottom:var(--cp-space-3)">' + icon('shuffle') + ' Recipe Combinations</h3>';

    if (!hasSel) {
      html += '<div class="cp-empty-state cp-empty-state--compact"><p>Go back to Step 2 and select dimensions to generate recipe combinations.</p></div>';
      return html;
    }

    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--cp-space-4)">';
    html += '<p class="cp-text-muted">' + totalCombos + ' possible combination' + (totalCombos !== 1 ? 's' : '') + '. Select which ones to create.</p>';
    html += '<div style="display:flex;gap:var(--cp-space-2)">';
    html += '<button class="cp-btn cp-btn-ai cp-btn-sm" data-action="wizard-ai-suggest">' + icon('sparkles') + ' AI Suggest Best</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="wizard-select-all">' + (wizardState.allSelected ? 'Deselect All' : 'Select All') + '</button>';
    html += '</div></div>';

    // Generate recipe preview cards — preserve prior selections
    var prevSelections = {};
    for (var ps = 0; ps < wizardState.recipes.length; ps++) {
      var pr = wizardState.recipes[ps];
      prevSelections[pr.persona_id + '|' + pr.message_id + '|' + pr.style_id + '|' + pr.visual_format_id] = pr.selected;
    }
    var hadPrevRecipes = wizardState.recipes.length > 0;
    wizardState.recipes = [];
    var idx = 0;
    for (var pi = 0; pi < personas.length; pi++) {
      for (var mi = 0; mi < messages.length; mi++) {
        for (var si = 0; si < styles.length; si++) {
          for (var fi = 0; fi < formats.length; fi++) {
            if (idx >= 50) break; // Cap at 50 preview cards
            var pName = personas[pi] ? (S.personaMap[personas[pi]] || {}).name || '?' : '—';
            var mName = messages[mi] ? (S.messageMap[messages[mi]] || {}).title || '?' : '—';
            var sName = styles[si] ? (S.styleMap[styles[si]] || {}).name || '?' : '—';
            var fName = formats[fi] ? (S.formatMap[formats[fi]] || {}).name || '?' : '—';
            var comboKey = personas[pi] + '|' + messages[mi] + '|' + styles[si] + '|' + formats[fi];
            var isSelected = hadPrevRecipes ? (prevSelections[comboKey] !== undefined ? prevSelections[comboKey] : wizardState.allSelected || false) : (wizardState.allSelected || false);
            wizardState.recipes.push({
              idx: idx, persona_id: personas[pi], message_id: messages[mi],
              style_id: styles[si], visual_format_id: formats[fi],
              title: pName + ' × ' + mName + ' × ' + sName + ' × ' + fName,
              selected: isSelected
            });
            idx++;
          }
        }
      }
    }

    html += '<div class="cp-wizard-recipe-preview">';
    for (var ri = 0; ri < wizardState.recipes.length; ri++) {
      var r = wizardState.recipes[ri];
      html += '<div class="cp-wizard-recipe-card' + (r.selected ? ' cp-wizard-recipe-card-selected' : '') + '" data-action="wizard-toggle-recipe" data-ridx="' + ri + '">';
      html += '<div style="font-weight:600;font-size:12px;margin-bottom:6px">#' + (ri + 1) + '</div>';
      if (r.persona_id) html += '<div>' + dimensionBadge('persona', (S.personaMap[r.persona_id] || {}).name || '?') + '</div>';
      if (r.message_id) html += '<div>' + dimensionBadge('message', (S.messageMap[r.message_id] || {}).title || '?') + '</div>';
      if (r.style_id) html += '<div>' + dimensionBadge('style', (S.styleMap[r.style_id] || {}).name || '?') + '</div>';
      if (r.visual_format_id) html += '<div>' + dimensionBadge('format', (S.formatMap[r.visual_format_id] || {}).name || '?') + '</div>';
      html += '</div>';
    }
    html += '</div>';

    var selCount = wizardState.recipes.filter(function(r) { return r.selected; }).length;
    html += '<div style="margin-top:var(--cp-space-3)"><strong>' + selCount + '</strong> recipe' + (selCount !== 1 ? 's' : '') + ' selected for creation</div>';
    return html;
  }

  function renderWizardStep4() {
    var d = wizardState.data;
    var sel = wizardState.selections;
    var selRecipes = wizardState.recipes.filter(function(r) { return r.selected; });
    var objective = (Constants.CAMPAIGN_OBJECTIVES || []).find(function(o) { return o.id === d.objective; });

    var html = '<h3 style="margin-bottom:var(--cp-space-4)">' + icon('check') + ' Review & Create</h3>';
    html += '<div class="cp-card" style="margin-bottom:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('bullhorn') + ' Campaign Summary</h3></div>';
    html += '<div class="cp-detail-grid cp-detail-grid-2">';
    html += '<div class="cp-detail-field"><div class="cp-detail-label">Name</div><div class="cp-detail-value">' + esc(d.name || 'Untitled') + '</div></div>';
    if (objective) html += '<div class="cp-detail-field"><div class="cp-detail-label">Objective</div><div class="cp-detail-value">' + icon(objective.icon) + ' ' + esc(objective.name) + '</div></div>';
    if (d.date_start || d.date_end) html += '<div class="cp-detail-field"><div class="cp-detail-label">Dates</div><div class="cp-detail-value">' + esc(d.date_start || '?') + ' → ' + esc(d.date_end || '?') + '</div></div>';
    if (d.budget_notes) html += '<div class="cp-detail-field"><div class="cp-detail-label">Budget</div><div class="cp-detail-value">' + esc(d.budget_notes) + '</div></div>';
    html += '<div class="cp-detail-field"><div class="cp-detail-label">Dimensions</div><div class="cp-detail-value">';
    html += sel.personas.length + ' personas · ' + sel.messages.length + ' messages · ' + sel.styles.length + ' styles · ' + sel.formats.length + ' formats';
    html += '</div></div>';
    html += '<div class="cp-detail-field"><div class="cp-detail-label">Recipes to Create</div><div class="cp-detail-value" style="font-size:var(--cp-font-size-xl);font-weight:700;color:var(--cp-primary)">' + selRecipes.length + '</div></div>';
    html += '</div></div>';

    if (d.description) {
      html += '<div class="cp-card" style="margin-bottom:var(--cp-space-4)"><div class="cp-section-header"><h3>Description</h3></div>';
      html += '<p>' + esc(d.description) + '</p></div>';
    }

    if (selRecipes.length > 0) {
      html += '<div class="cp-card"><div class="cp-section-header"><h3>' + icon('shuffle') + ' Recipes (' + selRecipes.length + ')</h3></div>';
      for (var ri = 0; ri < Math.min(selRecipes.length, 15); ri++) {
        html += '<div style="padding:4px 0;border-bottom:1px solid var(--cp-border-light);font-size:var(--cp-font-size-sm)">' + esc(selRecipes[ri].title) + '</div>';
      }
      if (selRecipes.length > 15) html += '<p class="cp-text-muted" style="margin-top:4px">...and ' + (selRecipes.length - 15) + ' more</p>';
      html += '</div>';
    }
    return html;
  }

  function collectWizardFields() {
    $('.cp-wizard-field').each(function() {
      var key = $(this).data('wfield');
      if (key) wizardState.data[key] = $(this).is(':checkbox') ? $(this).is(':checked') : $(this).val() || '';
    });
  }

  function executeWizardCreate() {
    collectWizardFields();
    var d = wizardState.data;
    if (!d.name || !d.name.trim()) { toast('Campaign name is required', 'warning'); return; }

    snapshot('Campaign wizard');
    var camp = createEntity('campaign', {
      name: d.name.trim(), description: d.description || '',
      objective: d.objective || '', funnel_stage: d.funnel_stage || '',
      date_start: d.date_start || '', date_end: d.date_end || '',
      budget_notes: d.budget_notes || '', ai_instructions: d.ai_instructions || '',
      persona_ids: wizardState.selections.personas.slice(),
      message_ids: wizardState.selections.messages.slice(),
      style_ids: wizardState.selections.styles.slice(),
      format_ids: wizardState.selections.formats.slice()
    });

    if (!camp) { toast('Failed to create campaign', 'error'); return; }

    // Create selected recipes
    var selRecipes = wizardState.recipes.filter(function(r) { return r.selected; });
    for (var i = 0; i < selRecipes.length; i++) {
      var sr = selRecipes[i];
      createEntity('recipe', {
        persona_id: sr.persona_id || '', message_id: sr.message_id || '',
        style_id: sr.style_id || '', visual_format_id: sr.visual_format_id || '',
        campaign_id: camp.id
      });
    }

    logActivity('campaign_created', 'campaign', camp.id, camp.name, 'Campaign wizard: created with ' + selRecipes.length + ' recipes');
    S.selectedCampaignId = camp.id;
    closeModal();
    navigate('campaigns');
    toast('Campaign "' + d.name + '" created with ' + selRecipes.length + ' recipes', 'success', 5000);
  }

  // ============================================================
  // SECTION 10: TAG CRUD
  // ============================================================

  function openTagModal(tagId) {
    var isEdit = !!tagId;
    var t = isEdit ? getTag(tagId) : null;
    var colors = ['#1a73e8', '#7c3aed', '#0d904f', '#e37400', '#d93025', '#0891b2', '#059669', '#be123c'];
    var currentColor = t ? t.color : colors[0];

    var html = '<div class="cp-editor-form">';
    html += '<div class="cp-form-group"><label>Tag Name *</label>';
    html += '<input type="text" class="cp-input" data-field="name" value="' + esc(t ? t.name : '') + '" placeholder="e.g., Q2 Campaign"></div>';
    html += '<div class="cp-form-group"><label>Description</label>';
    html += '<input type="text" class="cp-input" data-field="description" value="' + esc(t ? t.description || '' : '') + '" placeholder="What this tag represents..."></div>';
    html += '<div class="cp-form-group"><label>Color</label><div class="cp-chip-selector">';
    for (var ci = 0; ci < colors.length; ci++) {
      html += '<button type="button" class="cp-color-swatch' + (currentColor === colors[ci] ? ' cp-color-swatch-active' : '') + '" data-action="pick-color" data-color="' + colors[ci] + '" style="width:28px;height:28px;border-radius:50%;border:2px solid ' + (currentColor === colors[ci] ? 'var(--cp-text-primary)' : 'transparent') + ';background:' + colors[ci] + ';cursor:pointer;padding:0"></button>';
    }
    html += '<input type="hidden" data-field="color" value="' + esc(currentColor) + '">';
    html += '</div></div></div>';

    openModal(isEdit ? 'Edit Tag' : 'New Tag', html, {
      titleIcon: 'tag',
      size: 'sm',
      saveLabel: isEdit ? 'Save' : 'Create Tag',
      onSave: function() {
        var fields = collectModalFields();
        if (!fields.name || !fields.name.trim()) { toast('Tag name is required', 'warning'); return; }
        if (isEdit) {
          snapshot('Edit tag');
          saveEntityField('tag', tagId, 'name', fields.name.trim());
          saveEntityField('tag', tagId, 'description', fields.description || '');
          saveEntityField('tag', tagId, 'color', fields.color || colors[0]);
        } else {
          createEntity('tag', { name: fields.name.trim(), description: fields.description || '', color: fields.color || colors[0] });
          snapshot('Create tag');
        }
        closeModal();
      }
    });
  }

  function confirmDeleteTag(tagId) {
    var t = getTag(tagId);
    if (!t) return;
    openConfirmDialog({
      title: 'Delete Tag',
      message: 'Delete "' + t.name + '"? It will be removed from all entities.',
      confirmLabel: 'Delete', danger: true,
      onConfirm: function() { snapshot('Delete tag'); deleteEntity('tag', tagId); }
    });
  }

  // ============================================================
  // SECTION 11: COMPOSITION STEP RENDERER
  // ============================================================

  function renderCompositionStep(recipe) {
    var html = '<div class="cp-step-composition" data-recipe-id="' + esc(recipe.id) + '">';

    // Composition card with 4 dimensions
    html += '<div class="cp-composition-card">';
    html += '<div class="cp-section-header"><h3>' + icon('shapes') + ' Creative Composition</h3>';
    html += '<span class="cp-text-muted">The combination of dimensions that defines this creative.</span></div>';
    html += '<div class="cp-composition-grid">';

    var dims = [
      { key: 'persona', id: recipe.persona_id, field: 'persona_id' },
      { key: 'message', id: recipe.message_id, field: 'message_id' },
      { key: 'style',   id: recipe.style_id,   field: 'style_id' },
      { key: 'format',  id: recipe.visual_format_id, field: 'visual_format_id' }
    ];
    for (var di = 0; di < dims.length; di++) {
      var dim = Constants.DIMENSIONS[dims[di].key];
      var entity = getEntityForDim(dims[di].key, dims[di].id);
      var entityName = entity ? (entity.name || entity.title || '') : '(Not set)';
      var entitySub = getEntitySubtext(dims[di].key, entity);
      var isEmpty = !entity;

      html += '<div class="cp-composition-dim' + (isEmpty ? ' cp-composition-dim-empty' : '') + '" style="border-color:' + dim.color + (isEmpty ? '15' : '30') + '">';
      html += '<div class="cp-composition-dim-icon" style="background:' + dim.color + '12;color:' + dim.color + '">' + icon(dim.icon) + '</div>';
      html += '<div class="cp-composition-dim-body">';
      html += '<div class="cp-composition-dim-label" style="color:' + dim.color + '">' + esc(dim.label) + '</div>';
      html += '<div class="cp-composition-dim-name">' + esc(entityName) + '</div>';
      if (entitySub) html += '<div class="cp-composition-dim-sub">' + esc(entitySub) + '</div>';
      html += '</div>';
      html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="change-dimension" data-dim="' + dims[di].key + '" data-recipe-id="' + esc(recipe.id) + '">' + (isEmpty ? icon('plus') + ' Set' : icon('refresh') + ' Change') + '</button>';
      html += '</div>';
    }
    html += '</div></div>';

    // Media type toggle
    html += '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('image') + ' Media Type</h3></div>';
    html += '<div class="cp-media-type-toggle">';
    for (var mtk in Constants.MEDIA_TYPES) {
      var mt = Constants.MEDIA_TYPES[mtk];
      var mtActive = recipe.media_type === mtk ? ' cp-media-type-active' : '';
      html += '<button class="cp-media-type-btn' + mtActive + '" data-action="set-media-type" data-type="' + mtk + '">' + icon(mt.icon) + ' ' + esc(mt.label) + '</button>';
    }
    html += '</div></div>';

    // Pain point selector
    html += renderPainPointSelector(recipe);

    // Title editor
    html += '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('edit') + ' Recipe Title</h3></div>';
    html += '<input type="text" class="cp-input" data-action="save-recipe-title" value="' + esc(recipe.title || '') + '" placeholder="Recipe title...">';
    html += '</div>';

    // Priority + Campaign + Due date
    html += '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('sliders') + ' Details</h3></div>';
    var camps = getAllCampaigns();
    html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">';
    // Priority
    html += '<div class="cp-form-group"><label class="cp-field-label">Priority</label>';
    html += '<select class="cp-select" data-action="save-recipe-field" data-rfield="priority">';
    for (var pk in Constants.PRIORITY_LEVELS) {
      html += '<option value="' + pk + '"' + (recipe.priority === pk ? ' selected' : '') + '>' + esc(Constants.PRIORITY_LEVELS[pk].label) + '</option>';
    }
    html += '</select></div>';
    // Campaign
    html += '<div class="cp-form-group"><label class="cp-field-label">Campaign</label>';
    html += '<select class="cp-select" data-action="save-recipe-field" data-rfield="campaign_id">';
    html += '<option value="">None</option>';
    for (var ci = 0; ci < camps.length; ci++) {
      html += '<option value="' + esc(camps[ci].id) + '"' + (recipe.campaign_id === camps[ci].id ? ' selected' : '') + '>' + esc(truncate(camps[ci].name, 25)) + '</option>';
    }
    html += '</select></div>';
    // Due date
    html += '<div class="cp-form-group"><label class="cp-field-label">Due Date</label>';
    html += '<input type="date" class="cp-input" data-action="save-recipe-field" data-rfield="due_date" value="' + esc(recipe.due_date || '') + '"></div>';
    html += '</div></div>';

    // Save as Template + Create from Template
    html += '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('bookmark') + ' Templates</h3></div>';
    html += '<div style="display:flex;gap:var(--cp-space-2);flex-wrap:wrap">';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="save-recipe-template" data-recipe-id="' + esc(recipe.id) + '">' + icon('floppy-disk') + ' Save as Template</button>';
    var templates = (S.meta && S.meta.recipe_templates) || [];
    if (templates.length > 0) {
      html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="apply-recipe-template" data-recipe-id="' + esc(recipe.id) + '">' + icon('file-import') + ' Apply Template (' + templates.length + ')</button>';
    }
    html += '</div></div>';

    html += '</div>';
    return html;
  }

  function renderPainPointSelector(recipe) {
    var persona = S.personaMap[recipe.persona_id];
    if (!persona) return '';
    var painPoints = getPersonaPainPoints(persona);
    if (painPoints.length === 0) return '';

    var selected = recipe.selected_pain_point_ids || [];
    var html = '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('bolt') + ' Pain Points to Address</h3>';
    html += '<span class="cp-text-muted">' + selected.length + ' of ' + painPoints.length + ' selected</span></div>';
    html += '<div class="cp-pain-point-picker-list">';
    for (var i = 0; i < painPoints.length; i++) {
      var pp = painPoints[i];
      var isSelected = selected.indexOf(pp.id) > -1;
      html += '<label class="cp-pain-point-picker-item' + (isSelected ? ' cp-pain-point-picker-item-selected' : '') + '">';
      html += '<input type="checkbox" data-action="toggle-recipe-pp" data-pp-id="' + esc(pp.id) + '"' + (isSelected ? ' checked' : '') + '>';
      html += '<div><div style="font-weight:600;font-size:13px">' + esc(truncate(pp.pain_point, 80)) + '</div>';
      if (pp.solution) html += '<div style="font-size:11px;color:var(--cp-success);margin-top:2px">' + icon('lightbulb') + ' ' + esc(truncate(pp.solution, 60)) + '</div>';
      html += '</div></label>';
    }
    html += '</div></div>';
    return html;
  }

  function getEntityForDim(dimKey, id) {
    if (!id) return null;
    if (dimKey === 'persona') return S.personaMap[id];
    if (dimKey === 'message') return S.messageMap[id];
    if (dimKey === 'style') return S.styleMap[id];
    if (dimKey === 'format') return S.formatMap[id];
    return null;
  }

  function getEntitySubtext(dimKey, entity) {
    if (!entity) return '';
    if (dimKey === 'persona') {
      var d = entity.demographics || {};
      return [d.age_range, d.location].filter(Boolean).join(' · ');
    }
    if (dimKey === 'message') {
      return (entity.funnel_stages || []).map(function(fid) {
        var f = S.funnelStageMap[fid]; return f ? f.short : '';
      }).filter(Boolean).join(', ');
    }
    if (dimKey === 'format' && entity.category) {
      var cat = (Constants.FORMAT_CATEGORIES || []).find(function(c) { return c.id === entity.category; });
      return cat ? cat.name : '';
    }
    return entity.description ? truncate(entity.description, 40) : '';
  }

  function openDimensionPicker(dimKey, recipeId) {
    var recipe = getRecipe(recipeId);
    if (!recipe) return;
    var dim = Constants.DIMENSIONS[dimKey];
    var items = [];
    var currentId = '';

    if (dimKey === 'persona') { items = getAllPersonas(); currentId = recipe.persona_id; }
    else if (dimKey === 'message') { items = getAllMessages(); currentId = recipe.message_id; }
    else if (dimKey === 'style') { items = getAllStyles(); currentId = recipe.style_id; }
    else if (dimKey === 'format') { items = getAllFormats(); currentId = recipe.visual_format_id; }

    var html = '<div class="cp-editor-form">';
    if (items.length === 0) {
      html += '<div class="cp-empty-state cp-empty-state--compact"><p>No ' + esc(dim.label.toLowerCase()) + 's created yet.</p>';
      html += '<button class="cp-btn cp-btn-primary cp-btn-sm" data-action="new-' + dimKey + '">' + icon('plus') + ' Create ' + esc(dim.label) + '</button></div>';
    } else {
      html += '<div class="cp-hook-radio-list">';
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var iid = item.id;
        var iname = item.name || item.title || 'Untitled';
        var isSelected = iid === currentId;
        var sub = getEntitySubtext(dimKey, item);

        html += '<label class="cp-hook-radio-item' + (isSelected ? ' cp-hook-radio-item-selected' : '') + '">';
        html += '<input type="radio" name="dim_pick" value="' + esc(iid) + '"' + (isSelected ? ' checked' : '') + ' style="margin:3px 0 0;flex-shrink:0;cursor:pointer">';
        html += '<div><div style="font-weight:600;font-size:13px">' + esc(iname) + '</div>';
        if (sub) html += '<div style="font-size:11px;color:var(--cp-text-muted);margin-top:2px">' + esc(sub) + '</div>';
        html += '</div></label>';
      }
      html += '</div>';
    }
    html += '</div>';

    openModal('Select ' + dim.label, html, {
      titleIcon: dim.icon,
      size: 'md',
      saveLabel: 'Select',
      onSave: function() {
        var selected = $('.cp-modal-body input[name="dim_pick"]:checked').val() || '';
        var fieldMap = { persona: 'persona_id', message: 'message_id', style: 'style_id', format: 'visual_format_id' };
        saveEntityField('recipe', recipeId, fieldMap[dimKey], selected);
        // Auto-update title if all 4 dimensions set
        autoUpdateRecipeTitle(recipeId);
        snapshot('Change ' + dim.label);
        closeModal();
      }
    });
  }

  function autoUpdateRecipeTitle(recipeId) {
    var recipe = getRecipe(recipeId);
    if (!recipe) return;
    // Only auto-update if title is empty or was auto-generated (contains ×)
    if (recipe.title && recipe.title.indexOf(' × ') === -1 && recipe.title !== 'New Recipe') return;
    var parts = [];
    var per = S.personaMap[recipe.persona_id]; if (per) parts.push(per.name);
    var msg = S.messageMap[recipe.message_id]; if (msg) parts.push(msg.title);
    var sty = S.styleMap[recipe.style_id]; if (sty) parts.push(sty.name);
    var vf = S.formatMap[recipe.visual_format_id]; if (vf) parts.push(vf.name);
    if (parts.length > 0) saveEntityField('recipe', recipeId, 'title', parts.join(' × '));
  }

  // ============================================================
  // SECTION 12: HOOK STEP RENDERER
  // ============================================================

  function renderHookStep(recipe) {
    var msg = S.messageMap[recipe.message_id];
    var hook = recipe.hook || {};
    var html = '<div class="cp-step-hook" data-recipe-id="' + esc(recipe.id) + '">';

    // Inherited hooks from message
    if (msg && (msg.hooks || []).length > 0) {
      html += '<div class="cp-card cp-hook-inherited">';
      html += '<div class="cp-hook-inherited-header">';
      html += '<h3>' + icon('anchor') + ' Message Hooks</h3>';
      html += '<span class="cp-text-muted">Inherited from: ' + esc(msg.title) + '</span>';
      html += '</div>';
      html += '<p class="cp-text-muted" style="margin-bottom:12px">Select a hook to open this recipe, or write a custom override below.</p>';

      html += '<div class="cp-hook-radio-list">';
      for (var hi = 0; hi < msg.hooks.length; hi++) {
        var h = msg.hooks[hi];
        var isSelected = hook.selected_hook_id === h.id;
        var htCfg = Constants.HOOK_TYPES[h.type] || { label: h.type, color: '#80868b' };

        html += '<label class="cp-hook-radio-item' + (isSelected ? ' cp-hook-radio-item-selected' : '') + '">';
        html += '<input type="radio" name="hook_select" value="' + esc(h.id) + '"' + (isSelected ? ' checked' : '') + ' data-action="select-hook" style="margin:3px 0 0;flex-shrink:0;cursor:pointer">';
        html += '<div style="flex:1"><div style="font-weight:600;font-size:13px">' + esc(h.text) + '</div>';
        html += '<div style="margin-top:4px">' + hookTypeBadge(h.type) + '</div>';
        html += '</div></label>';
      }
      html += '</div></div>';
    } else {
      html += '<div class="cp-card">';
      html += '<div class="cp-empty-state cp-empty-state--compact">';
      html += '<p>' + icon('info') + (msg ? ' No hooks defined on message "' + esc(msg.title) + '".' : ' No message linked to this recipe.') + '</p>';
      html += '</div></div>';
    }

    // Custom hook override
    html += '<div class="cp-card cp-hook-override" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('pen-fancy') + ' Custom Hook Override</h3>';
    html += renderRecipeAIBar('ai-generate-hook', recipe.id, 'AI Suggest', 'sparkles');
    html += '</div>';
    html += '<p class="cp-text-muted" style="margin-bottom:8px">Write a custom hook to override the inherited one. Leave empty to use the selected hook above.</p>';
    html += '<textarea class="cp-textarea" data-action="save-recipe-hook-custom" rows="3" placeholder="Write a custom opening hook...">' + esc(hook.custom_hook || '') + '</textarea>';

    // Hook type for custom
    if (hook.custom_hook) {
      html += '<div style="margin-top:8px"><label class="cp-field-label">Hook Type</label>';
      html += '<select class="cp-select cp-select-sm" data-action="save-recipe-hook-type" style="width:auto">';
      for (var tk in Constants.HOOK_TYPES) {
        html += '<option value="' + tk + '"' + (hook.hook_type === tk ? ' selected' : '') + '>' + esc(Constants.HOOK_TYPES[tk].label) + '</option>';
      }
      html += '</select></div>';
    }
    html += '</div>';

    // Effective hook summary
    var effectiveHook = getEffectiveHook(recipe);
    if (effectiveHook) {
      html += '<div class="cp-card" style="margin-top:var(--cp-space-4);background:var(--cp-success-light);border-color:rgba(13,144,79,0.15)">';
      html += '<div class="cp-section-header"><h3 style="color:var(--cp-success)">' + icon('check') + ' Active Hook</h3></div>';
      html += '<p style="font-weight:600;font-size:var(--cp-font-size-md);margin-bottom:4px">"' + esc(effectiveHook.text) + '"</p>';
      html += hookTypeBadge(effectiveHook.type);
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  function getEffectiveHook(recipe) {
    var hook = recipe.hook || {};
    // Custom override takes priority
    if (hook.custom_hook && hook.custom_hook.trim()) {
      return { text: hook.custom_hook.trim(), type: hook.hook_type || 'direct' };
    }
    // Selected inherited hook
    if (hook.selected_hook_id) {
      var msg = S.messageMap[recipe.message_id];
      if (msg) {
        var found = (msg.hooks || []).find(function(h) { return h.id === hook.selected_hook_id; });
        if (found) return { text: found.text, type: found.type };
      }
    }
    return null;
  }

  // ============================================================
  // SECTION 13: CONTENT STEP RENDERER
  // ============================================================

  function renderContentStep(recipe) {
    var content = recipe.content || {};
    var html = '<div class="cp-step-content" data-recipe-id="' + esc(recipe.id) + '">';

    // Ad copy (Quill editor)
    html += '<div class="cp-card cp-ad-copy-editor">';
    html += '<div class="cp-section-header"><h3>' + icon('pen-fancy') + ' Ad Copy / Primary Text</h3>';
    html += renderRecipeAIBar('ai-generate-content', recipe.id, 'AI Write', 'sparkles');
    html += renderRecipeAIBar('ai-improve-content', recipe.id, 'AI Improve', 'wand-magic');
    html += '</div>';
    html += '<div id="cpQuillEditor" class="cp-quill-container"></div>';
    html += '<input type="hidden" id="cpQuillContent" value="' + esc(content.ad_copy || '') + '">';
    html += '</div>';

    // Headline, Description, CTA
    html += '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('heading') + ' Headline & CTA</h3></div>';
    html += '<div class="cp-cta-fields">';
    html += '<div class="cp-form-group"><label class="cp-field-label">Headline</label>';
    html += '<input type="text" class="cp-input" data-action="save-content-field" data-cfield="headline" value="' + esc(content.headline || '') + '" placeholder="Short attention-grabbing headline"></div>';
    html += '<div class="cp-form-group"><label class="cp-field-label">Description</label>';
    html += '<input type="text" class="cp-input" data-action="save-content-field" data-cfield="description" value="' + esc(content.description || '') + '" placeholder="Supporting description text"></div>';
    html += '<div class="cp-form-group"><label class="cp-field-label">Call to Action</label>';
    html += '<input type="text" class="cp-input" data-action="save-content-field" data-cfield="cta" value="' + esc(content.cta || '') + '" placeholder="e.g., Book a Free Demo"></div>';
    html += '</div></div>';

    // Variants
    html += '<div class="cp-card cp-variant-panel" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('copy') + ' Variants</h3>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="add-variant">' + icon('plus') + ' Add Variant</button></div>';
    var variants = content.variants || [];
    if (variants.length === 0) {
      html += '<p class="cp-text-muted">No variants yet. Add variations of your ad copy for A/B testing.</p>';
    } else {
      for (var vi = 0; vi < variants.length; vi++) {
        html += '<div class="cp-variant-item" data-variant-index="' + vi + '">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">';
        html += '<span class="cp-field-label">Variant ' + (vi + 1) + '</span>';
        html += '<button class="cp-btn-icon cp-btn-xs" data-action="remove-variant" data-variant-index="' + vi + '">' + icon('trash') + '</button>';
        html += '</div>';
        html += '<textarea class="cp-textarea" data-action="save-variant" data-variant-index="' + vi + '" rows="3" placeholder="Variant copy...">' + esc(variants[vi].text || '') + '</textarea>';
        html += '</div>';
      }
    }
    html += '</div>';

    // Notes
    html += '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('file-text') + ' Content Notes</h3></div>';
    html += '<textarea class="cp-textarea" data-action="save-content-field" data-cfield="notes" rows="2" placeholder="Internal notes about this content...">' + esc(content.notes || '') + '</textarea>';
    html += '</div>';

    html += '</div>';

    // Init Quill after render
    setTimeout(function() { initQuillForRecipe(recipe.id); }, 50);

    return html;
  }

  var currentQuill = null;
  var currentQuillSaveTimeout = null;
  function destroyQuill() {
    if (currentQuillSaveTimeout) { clearTimeout(currentQuillSaveTimeout); currentQuillSaveTimeout = null; }
    if (currentQuill) {
      try { currentQuill.off('text-change'); } catch(e) {}
      currentQuill = null;
    }
    $('#cpQuillEditor').html('');
  }
  function initQuillForRecipe(recipeId) {
    if (typeof Quill === 'undefined') {
      console.warn('[CP] Quill not loaded');
      return;
    }
    var $container = $('#cpQuillEditor');
    if (!$container.length) return;
    destroyQuill();

    currentQuill = new Quill('#cpQuillEditor', {
      theme: 'snow',
      placeholder: 'Write your ad copy here...',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          ['link'],
          ['clean']
        ]
      }
    });

    // Load existing content
    var existing = $('#cpQuillContent').val() || '';
    if (existing) {
      try { currentQuill.root.innerHTML = existing; } catch(e) { currentQuill.setText(existing); }
    }

    // Save on change (debounced)
    currentQuill.on('text-change', function() {
      clearTimeout(currentQuillSaveTimeout);
      currentQuillSaveTimeout = setTimeout(function() {
        // Guard: only save if this Quill instance is still the active one for this recipe
        if (!currentQuill || recipeId !== S.selectedRecipeId) return;
        var recipe = getRecipe(recipeId);
        if (!recipe) return;
        recipe.content = recipe.content || {};
        recipe.content.ad_copy = currentQuill.root.innerHTML;
        recipe.updated = new Date().toISOString();
        syncToTextarea();
        if (maybeAdvanceRecipeStatus) maybeAdvanceRecipeStatus(recipe, 'content updated');
        buildMaps();
      }, 500);
    });
  }

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

  // ============================================================
  // SECTION 15: REVIEW STEP RENDERER
  // ============================================================

  function renderReviewStep(recipe) {
    var html = '<div class="cp-step-review" data-recipe-id="' + esc(recipe.id) + '">';

    // Completion checklist
    html += '<div class="cp-card cp-review-checklist">';
    html += '<div class="cp-section-header"><h3>' + icon('clipboard-check') + ' Completion Checklist</h3></div>';

    var checks = buildCompletionChecks(recipe);
    var doneCount = checks.filter(function(c) { return c.done; }).length;
    var totalChecks = checks.length;

    html += progressBar(Math.round(doneCount / totalChecks * 100), doneCount === totalChecks ? 'var(--cp-success)' : 'var(--cp-primary)');
    html += '<span class="cp-text-muted" style="display:block;margin:6px 0 12px">' + doneCount + ' of ' + totalChecks + ' complete</span>';

    for (var ci = 0; ci < checks.length; ci++) {
      var chk = checks[ci];
      html += '<div class="cp-review-check-item">';
      html += '<div class="cp-review-check-icon' + (chk.done ? ' cp-review-check-done' : ' cp-review-check-pending') + '">' + (chk.done ? icon('check') : '') + '</div>';
      html += '<span style="flex:1;font-size:var(--cp-font-size-sm);' + (chk.done ? 'color:var(--cp-success)' : '') + '">' + esc(chk.label) + '</span>';
      if (chk.action) html += '<button class="cp-btn-link cp-btn-sm" data-action="go-step" data-step="' + esc(chk.step) + '">' + icon('arrow-right') + ' Go</button>';
      html += '</div>';
    }
    html += '</div>';

    // Status management
    html += '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('signal') + ' Status</h3></div>';
    html += '<div style="margin-bottom:12px">';
    html += '<span class="cp-text-muted">Current: </span>' + recipeStatusBadge(recipe.status);
    html += '</div>';

    var stIdx = Constants.STATUS_ORDER.indexOf(recipe.status);
    // Manual status actions
    html += '<div class="cp-review-actions">';
    if (stIdx < Constants.STATUS_ORDER.indexOf('in_review') && stIdx >= Constants.STATUS_ORDER.indexOf('media_ready')) {
      html += '<button class="cp-btn cp-btn-primary" data-action="set-recipe-status" data-status="in_review">' + icon('magnifying-glass') + ' Submit for Review</button>';
    }
    if (recipe.status === 'in_review') {
      html += '<button class="cp-btn cp-btn-primary" data-action="set-recipe-status" data-status="approved">' + icon('circle-check') + ' Approve</button>';
      html += '<button class="cp-btn cp-btn-outline" data-action="set-recipe-status" data-status="content_ready">' + icon('arrow-left') + ' Request Changes</button>';
    }
    if (recipe.status === 'approved') {
      html += '<button class="cp-btn cp-btn-primary" data-action="set-recipe-status" data-status="live">' + icon('signal') + ' Mark as Live</button>';
    }
    if (recipe.status === 'live') {
      html += '<button class="cp-btn cp-btn-outline" data-action="set-recipe-status" data-status="paused">' + icon('pause') + ' Pause</button>';
    }
    if (recipe.status === 'paused') {
      html += '<button class="cp-btn cp-btn-primary" data-action="set-recipe-status" data-status="live">' + icon('signal') + ' Resume</button>';
    }
    if (recipe.status !== 'archived') {
      html += '<button class="cp-btn cp-btn-outline cp-btn-danger" data-action="set-recipe-status" data-status="archived">' + icon('box-archive') + ' Archive</button>';
    }
    html += '</div></div>';

    // Review notes
    html += '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('file-text') + ' Review Notes</h3></div>';
    html += '<textarea class="cp-textarea" data-action="save-review-notes" rows="3" placeholder="Feedback, approval notes, change requests...">' + esc(recipe.review_notes || '') + '</textarea>';
    html += '</div>';

    // Production notes
    html += '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('clipboard-list') + ' Production Notes</h3></div>';
    html += '<textarea class="cp-textarea" data-action="save-production-notes" rows="2" placeholder="Instructions for production team...">' + esc(recipe.production_notes || '') + '</textarea>';
    html += '</div>';

    // Export actions
    html += '<div class="cp-card" style="margin-top:var(--cp-space-4)">';
    html += '<div class="cp-section-header"><h3>' + icon('share-nodes') + ' Export & Share</h3></div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:var(--cp-space-2)">';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="copy-recipe-content" data-recipe-id="' + esc(recipe.id) + '">' + icon('copy') + ' Copy Ad Copy</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="copy-recipe-brief" data-recipe-id="' + esc(recipe.id) + '">' + icon('clipboard') + ' Copy Creative Brief</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="export-recipe-json" data-recipe-id="' + esc(recipe.id) + '">' + icon('download') + ' Export JSON</button>';
    html += '</div></div>';

    html += '</div>';
    return html;
  }

  function buildCompletionChecks(recipe) {
    var content = recipe.content || {};
    var hook = recipe.hook || {};
    var effectiveHook = getEffectiveHook(recipe);
    var adCopyText = stripHtml(content.ad_copy || '');

    var checks = [
      { label: 'Persona assigned', done: !!recipe.persona_id, step: 'composition', action: true },
      { label: 'Message assigned', done: !!recipe.message_id, step: 'composition', action: true },
      { label: 'Style assigned', done: !!recipe.style_id, step: 'composition', action: true },
      { label: 'Visual format assigned', done: !!recipe.visual_format_id, step: 'composition', action: true },
      { label: 'Hook selected or written', done: !!effectiveHook, step: 'hook', action: true },
      { label: 'Ad copy written (50+ chars)', done: adCopyText.trim().length >= 50, step: 'content', action: true },
      { label: 'Headline written', done: !!(content.headline && content.headline.trim()), step: 'content', action: true },
      { label: 'CTA defined', done: !!(content.cta && content.cta.trim()), step: 'content', action: true }
    ];

    // Media checks depend on type
    if (recipe.media_type === 'image') {
      var brief = recipe.image_brief || {};
      checks.push({ label: 'Creative brief written', done: !!(brief.creative_brief && brief.creative_brief.trim().length > 20), step: 'media', action: true });
    } else if (recipe.media_type === 'video') {
      var scenes = (recipe.video && recipe.video.blueprint && recipe.video.blueprint.scenes) || [];
      checks.push({ label: 'Video blueprint (2+ scenes)', done: scenes.length >= 2, step: 'media', action: true });
    }

    return checks;
  }

  // ============================================================
  // SECTION 15.5: RECIPE AI ACTION BAR (Expandable Picker)
  // ============================================================

  function renderRecipeAIBar(actionId, recipeId, label, iconName) {
    iconName = iconName || 'sparkles';
    var panelId = actionId.replace(/[^a-zA-Z0-9]/g, '_') + '_' + recipeId.substring(0, 6);
    var html = '<div class="cp-ai-action-bar" data-panel-id="' + esc(panelId) + '">';
    html += '<button class="cp-btn cp-btn-ai cp-btn-sm" data-action="expand-ai-action" data-panel-id="' + esc(panelId) + '">' + icon(iconName) + ' ' + esc(label) + '</button>';

    // Expandable panel (hidden by default)
    html += '<div class="cp-ai-action-expanded" id="cpAIPanel_' + esc(panelId) + '" style="display:none">';
    html += '<div class="cp-ai-action-row">';
    // AI Picker
    html += '<div class="cp-ai-action-picker">';
    html += (window._cpAiSel ? window._cpAiSel(actionId) : '');
    html += '</div>';
    html += '</div>';
    // Custom instructions
    html += '<div class="cp-form-group" style="margin:var(--cp-space-2) 0">';
    html += '<textarea class="cp-textarea cp-ai-custom-instructions" data-panel-id="' + esc(panelId) + '" rows="2" placeholder="Custom instructions for this AI action (optional)..."></textarea>';
    html += '</div>';
    // Generate button
    html += '<div class="cp-ai-action-footer">';
    html += '<button class="cp-btn cp-btn-ai cp-btn-sm" data-action="' + esc(actionId) + '" data-recipe-id="' + esc(recipeId) + '" data-panel-id="' + esc(panelId) + '">' + icon('sparkles') + ' Generate</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="collapse-ai-action" data-panel-id="' + esc(panelId) + '">Cancel</button>';
    html += '</div></div>';
    html += '</div>';
    return html;
  }

  // ============================================================
  // SECTION 16: SAVE HELPERS (Pipeline-specific)
  // ============================================================

  function getSelectedRecipe() {
    return S.selectedRecipeId ? S.recipeMap[S.selectedRecipeId] : null;
  }

  function saveRecipeSimpleField(recipeId, field, value) {
    saveEntityField('recipe', recipeId, field, value);
  }

  function saveContentField(cfield, value) {
    var recipe = getSelectedRecipe();
    if (!recipe) return;
    recipe.content = recipe.content || {};
    recipe.content[cfield] = value;
    recipe.updated = new Date().toISOString();
    syncToTextarea();
    if (maybeAdvanceRecipeStatus) maybeAdvanceRecipeStatus(recipe, 'content updated');
    buildMaps();
  }

  function saveBriefField(bfield, value) {
    var recipe = getSelectedRecipe();
    if (!recipe) return;
    recipe.image_brief = recipe.image_brief || {};
    recipe.image_brief[bfield] = value;
    recipe.updated = new Date().toISOString();
    syncToTextarea();
    if (maybeAdvanceRecipeStatus) maybeAdvanceRecipeStatus(recipe, 'brief updated');
    buildMaps();
  }

  function savePromptParam(param, value) {
    var recipe = getSelectedRecipe();
    if (!recipe) return;
    recipe.image_brief = recipe.image_brief || {};
    recipe.image_brief.prompt_params = recipe.image_brief.prompt_params || {};
    recipe.image_brief.prompt_params[param] = value;
    recipe.updated = new Date().toISOString();
    syncToTextarea();
  }

  function saveVideoField(vfield, value) {
    var recipe = getSelectedRecipe();
    if (!recipe) return;
    recipe.video = recipe.video || {};
    recipe.video[vfield] = value;
    recipe.updated = new Date().toISOString();
    syncToTextarea();
    if (maybeAdvanceRecipeStatus) maybeAdvanceRecipeStatus(recipe, 'video updated');
    buildMaps();
  }

  function saveSceneField(sceneIndex, sfield, value) {
    var recipe = getSelectedRecipe();
    if (!recipe) return;
    recipe.video = recipe.video || {};
    recipe.video.blueprint = recipe.video.blueprint || {};
    recipe.video.blueprint.scenes = recipe.video.blueprint.scenes || [];
    var scene = recipe.video.blueprint.scenes[sceneIndex];
    if (!scene) return;
    scene[sfield] = value;
    recipe.updated = new Date().toISOString();
    syncToTextarea();
    if (maybeAdvanceRecipeStatus) maybeAdvanceRecipeStatus(recipe, 'scene updated');
    buildMaps();
  }

  function addScene() {
    var recipe = getSelectedRecipe();
    if (!recipe) return;
    recipe.video = recipe.video || {};
    recipe.video.blueprint = recipe.video.blueprint || {};
    recipe.video.blueprint.scenes = recipe.video.blueprint.scenes || [];
    var idx = recipe.video.blueprint.scenes.length;
    recipe.video.blueprint.scenes.push({ name: 'Scene ' + (idx + 1), description: '', timestamp: '', duration: '' });
    recipe.updated = new Date().toISOString();
    snapshot('Add scene');
    buildMaps(); syncToTextarea(); render();
  }

  function deleteScene(sceneIndex) {
    var recipe = getSelectedRecipe();
    if (!recipe || !recipe.video || !recipe.video.blueprint) return;
    recipe.video.blueprint.scenes.splice(sceneIndex, 1);
    recipe.updated = new Date().toISOString();
    snapshot('Delete scene');
    buildMaps(); syncToTextarea(); render();
  }

  function saveScriptField(rowIndex, srfield, value) {
    var recipe = getSelectedRecipe();
    if (!recipe) return;
    recipe.video = recipe.video || {};
    recipe.video.script = recipe.video.script || {};
    recipe.video.script.rows = recipe.video.script.rows || [];
    var row = recipe.video.script.rows[rowIndex];
    if (!row) return;
    row[srfield] = value;
    recipe.updated = new Date().toISOString();
    syncToTextarea();
  }

  function addScriptRow() {
    var recipe = getSelectedRecipe();
    if (!recipe) return;
    recipe.video = recipe.video || {};
    recipe.video.script = recipe.video.script || {};
    recipe.video.script.rows = recipe.video.script.rows || [];
    recipe.video.script.rows.push({ time: '', dialogue: '', visual: '', camera: '', audio: '' });
    recipe.updated = new Date().toISOString();
    snapshot('Add script row');
    buildMaps(); syncToTextarea(); render();
  }

  function addVariant() {
    var recipe = getSelectedRecipe();
    if (!recipe) return;
    recipe.content = recipe.content || {};
    recipe.content.variants = recipe.content.variants || [];
    recipe.content.variants.push({ text: '', label: 'Variant ' + (recipe.content.variants.length + 1) });
    recipe.updated = new Date().toISOString();
    snapshot('Add variant');
    buildMaps(); syncToTextarea(); render();
  }

  function removeVariant(idx) {
    var recipe = getSelectedRecipe();
    if (!recipe || !recipe.content) return;
    recipe.content.variants = recipe.content.variants || [];
    recipe.content.variants.splice(idx, 1);
    recipe.updated = new Date().toISOString();
    snapshot('Remove variant');
    buildMaps(); syncToTextarea(); render();
  }

  function setRecipeStatus(recipeId, status) {
    var recipe = getRecipe(recipeId);
    if (!recipe) return;
    var oldLabel = (Constants.RECIPE_STATUSES[recipe.status] || {}).label || recipe.status;
    var newLabel = (Constants.RECIPE_STATUSES[status] || {}).label || status;
    recipe.status = status;
    recipe.updated = new Date().toISOString();
    logActivity('recipe_status_changed', 'recipe', recipeId, recipe.title, oldLabel + ' → ' + newLabel);
    snapshot('Status change');
    buildMaps(); syncToTextarea(); render();
    toast('Status changed to ' + newLabel, 'success');
  }

  // ============================================================
  // SECTION 17: MIX & MATCH ENGINE
  // ============================================================

  var mixerState = { mode: 'manual', selections: { persona: [], message: [], style: [], format: [] } };

  function openMixerModal(mode) {
    mixerState.mode = mode || 'manual';
    mixerState.selections = { persona: [], message: [], style: [], format: [] };

    var isManual = mixerState.mode === 'manual';
    var title = isManual ? 'Create Recipe' : 'Batch Generate Recipes';
    var titleIcon = isManual ? 'bolt' : 'shuffle';

    var html = '<div class="cp-mixer" data-mode="' + esc(mixerState.mode) + '">';

    // Mode description
    html += '<div style="margin-bottom:var(--cp-space-4)">';
    if (isManual) {
      html += '<p class="cp-text-muted">' + icon('info') + ' Select one from each dimension to create a single recipe.</p>';
    } else {
      html += '<p class="cp-text-muted">' + icon('info') + ' Select multiple from each dimension. All permutations will be generated as recipes.</p>';
    }
    html += '</div>';

    // Batch counter (batch mode only)
    if (!isManual) {
      html += '<div class="cp-mixer-batch-counter" id="cpMixerCounter" style="background:var(--cp-primary-light);margin-bottom:var(--cp-space-3)">';
      html += '<span class="cp-mixer-batch-count" id="cpMixerCountNum">0</span>';
      html += '<span class="cp-mixer-batch-label">recipes will be created</span>';
      html += '</div>';
    }

    // 4 columns
    html += '<div class="cp-mixer-columns">';
    var dimKeys = ['persona', 'message', 'style', 'format'];
    for (var di = 0; di < dimKeys.length; di++) {
      html += renderMixerColumn(dimKeys[di], isManual);
    }
    html += '</div>';

    // Warning zone for batch
    if (!isManual) {
      html += '<div id="cpMixerWarning" style="display:none"></div>';
    }

    html += '</div>';

    openModal(title, html, {
      titleIcon: titleIcon,
      size: 'xl',
      saveLabel: isManual ? icon('plus') + ' Create Recipe' : icon('shuffle') + ' Generate All',
      ai: !isManual,
      onSave: function() {
        if (isManual) {
          createRecipeFromMixer();
        } else {
          batchGenerateRecipes();
        }
      }
    });

    // Wire up mixer events after modal renders
    setTimeout(setupMixerEvents, 50);
  }

  function renderMixerColumn(dimKey, isManual) {
    var dim = Constants.DIMENSIONS[dimKey];
    var items = [];
    if (dimKey === 'persona') items = getAllPersonas();
    else if (dimKey === 'message') items = getAllMessages();
    else if (dimKey === 'style') items = getAllStyles();
    else if (dimKey === 'format') items = getAllFormats();

    var html = '<div class="cp-mixer-column" data-dim="' + dimKey + '">';
    html += '<div class="cp-mixer-column-header" style="background:' + dim.color + '10">';
    html += '<span class="cp-mixer-column-icon" style="color:' + dim.color + '">' + icon(dim.icon) + '</span>';
    html += '<span class="cp-mixer-column-title">' + esc(dim.label) + '</span>';
    html += '<span class="cp-mixer-column-count cp-nav-badge">' + items.length + '</span>';
    html += '</div>';

    html += '<div class="cp-mixer-list">';
    if (items.length === 0) {
      html += '<div class="cp-empty-state cp-empty-state--compact"><p>No ' + esc(dim.label.toLowerCase()) + 's yet.</p>';
      html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="new-' + dimKey + '">' + icon('plus') + ' Create</button></div>';
    } else {
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var iname = item.name || item.title || 'Untitled';
        var sub = getEntitySubtext(dimKey, item);
        var inputType = isManual ? 'radio' : 'checkbox';

        html += '<label class="cp-mixer-item" data-id="' + esc(item.id) + '" data-dim="' + dimKey + '">';
        html += '<input type="' + inputType + '" name="mixer_' + dimKey + '" value="' + esc(item.id) + '" class="cp-mixer-input" data-dim="' + dimKey + '" style="margin:3px 0 0;flex-shrink:0;cursor:pointer">';
        html += '<div style="flex:1;min-width:0">';
        html += '<div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(iname) + '</div>';
        if (sub) html += '<div style="font-size:11px;color:var(--cp-text-muted);margin-top:1px">' + esc(sub) + '</div>';
        html += '</div></label>';
      }
    }
    html += '</div></div>';
    return html;
  }

  function setupMixerEvents() {
    // Manual mode: radio selection highlight
    $('.cp-mixer-input[type="radio"]').off('change.mixer').on('change.mixer', function() {
      var dim = $(this).data('dim');
      $('.cp-mixer-item[data-dim="' + dim + '"]').removeClass('cp-mixer-item-selected');
      $(this).closest('.cp-mixer-item').addClass('cp-mixer-item-selected');
      mixerState.selections[dim] = [$(this).val()];
    });

    // Batch mode: checkbox selection + permutation counter
    $('.cp-mixer-input[type="checkbox"]').off('change.mixer').on('change.mixer', function() {
      var dim = $(this).data('dim');
      $(this).closest('.cp-mixer-item').toggleClass('cp-mixer-item-selected', this.checked);
      // Rebuild selection array
      mixerState.selections[dim] = [];
      $('.cp-mixer-input[data-dim="' + dim + '"]:checked').each(function() {
        mixerState.selections[dim].push($(this).val());
      });
      updatePermutationCount();
    });
  }

  function updatePermutationCount() {
    var sel = mixerState.selections;
    var counts = [
      Math.max(sel.persona.length, 0),
      Math.max(sel.message.length, 0),
      Math.max(sel.style.length, 0),
      Math.max(sel.format.length, 0)
    ];
    // Only count dimensions with selections; empty dims = 1 (will be left blank)
    var total = 1;
    var hasSel = false;
    for (var i = 0; i < counts.length; i++) {
      if (counts[i] > 0) { total *= counts[i]; hasSel = true; }
    }
    if (!hasSel) total = 0;

    $('#cpMixerCountNum').text(total);

    var $warn = $('#cpMixerWarning');
    if (total > 50) {
      $warn.show().html('<div class="cp-mixer-warning">' + icon('warning') + ' <strong>' + total + ' recipes</strong> is a lot! Consider narrowing your selection. Max 100 per batch.</div>');
    } else if (total > 20) {
      $warn.show().html('<div class="cp-mixer-warning" style="background:var(--cp-accent-light);border-color:rgba(227,116,0,0.2);color:#92400e">' + icon('circle-info') + ' ' + total + ' recipes will be generated.</div>');
    } else {
      $warn.hide();
    }
  }

  function createRecipeFromMixer() {
    var sel = mixerState.selections;
    var personaId = (sel.persona && sel.persona[0]) || '';
    var messageId = (sel.message && sel.message[0]) || '';
    var styleId = (sel.style && sel.style[0]) || '';
    var formatId = (sel.format && sel.format[0]) || '';

    if (!personaId && !messageId && !styleId && !formatId) {
      toast('Select at least one dimension', 'warning');
      return;
    }

    snapshot('Create recipe (mixer)');
    var newRecipe = createEntity('recipe', {
      persona_id: personaId, message_id: messageId,
      style_id: styleId, visual_format_id: formatId,
      campaign_id: S._pendingCampaignId || ''
    });

    if (newRecipe) {
      S.selectedRecipeId = newRecipe.id;
      S.currentStep = 'composition';
      S._pendingCampaignId = null;
      closeModal();
      navigate('recipes');
      toast('Recipe created', 'success');
    }
  }

  function batchGenerateRecipes() {
    var sel = mixerState.selections;
    var personas = sel.persona.length > 0 ? sel.persona : [''];
    var messages = sel.message.length > 0 ? sel.message : [''];
    var styles = sel.style.length > 0 ? sel.style : [''];
    var formats = sel.format.length > 0 ? sel.format : [''];

    var total = personas.length * messages.length * styles.length * formats.length;
    if (total === 0) { toast('Select at least one item from any dimension', 'warning'); return; }
    if (total > 100) { toast('Maximum 100 recipes per batch. Narrow your selection.', 'error'); return; }

    snapshot('Batch generate ' + total + ' recipes');
    var batchId = generateId('batch');
    var count = 0;

    for (var pi = 0; pi < personas.length; pi++) {
      for (var mi = 0; mi < messages.length; mi++) {
        for (var si = 0; si < styles.length; si++) {
          for (var fi = 0; fi < formats.length; fi++) {
            createEntity('recipe', {
              persona_id: personas[pi], message_id: messages[mi],
              style_id: styles[si], visual_format_id: formats[fi],
              batch_id: batchId, campaign_id: S._pendingCampaignId || ''
            });
            count++;
          }
        }
      }
    }

    logActivity('recipe_batch_generated', 'recipe', batchId, '', 'Batch generated ' + count + ' recipes');
    S._pendingCampaignId = null;
    closeModal();
    navigate('recipes');
    toast(count + ' recipes generated', 'success', 5000);
  }

  // ============================================================
  // SECTION 18: TAG INPUT COMPONENT
  // ============================================================

  function renderTagInput(entityTags, entityType, entityId) {
    entityTags = entityTags || [];
    var allTags = getAllTags();

    var html = '<div class="cp-tag-input" data-entity-type="' + esc(entityType || '') + '" data-entity-id="' + esc(entityId || '') + '">';
    html += '<div class="cp-tag-input-current">';
    for (var ti = 0; ti < entityTags.length; ti++) {
      var tag = S.tagMap[entityTags[ti]];
      if (tag) {
        html += '<span class="cp-badge" style="background:' + tag.color + '15;color:' + tag.color + '">' + icon('tag') + ' ' + esc(tag.name);
        html += ' <button class="cp-tag-remove" data-action="remove-entity-tag" data-tag-id="' + esc(tag.id) + '" style="border:none;background:none;cursor:pointer;color:inherit;font-size:10px;padding:0 2px">&times;</button>';
        html += '</span>';
      }
    }
    html += '</div>';

    // Tag picker dropdown
    var availableTags = allTags.filter(function(t) { return entityTags.indexOf(t.id) === -1; });
    if (availableTags.length > 0) {
      html += '<div class="cp-tag-input-add" style="margin-top:var(--cp-space-2);display:flex;gap:var(--cp-space-2);align-items:center">';
      html += '<select class="cp-select cp-select-sm" data-action="add-entity-tag" style="width:auto;min-width:120px">';
      html += '<option value="">+ Add tag...</option>';
      for (var ai = 0; ai < availableTags.length; ai++) {
        html += '<option value="' + esc(availableTags[ai].id) + '">' + esc(availableTags[ai].name) + '</option>';
      }
      html += '</select>';
      html += '</div>';
    } else if (allTags.length === 0) {
      html += '<p class="cp-text-muted" style="margin-top:4px">No tags created yet.</p>';
    }

    html += '</div>';
    return html;
  }

  // ============================================================
  // SECTION 19: EVENT HANDLERS
  // ============================================================

  function setupPart2AEvents() {
    console.log('[CP] Setting up Part 2A event handlers...');

    // --- Modal events ---
    $(document).off('click.cp2a-modal-close').on('click.cp2a-modal-close', '[data-action="close-modal"]', function(e) {
      e.preventDefault(); closeModal();
    });
    $(document).off('click.cp2a-modal-save').on('click.cp2a-modal-save', '[data-action="modal-save"]', function(e) {
      e.preventDefault();
      if (currentModal && currentModal.onSave) currentModal.onSave();
    });
    $(document).off('click.cp2a-modal-bg').on('click.cp2a-modal-bg', '.cp-modal-backdrop', function(e) {
      if ($(e.target).hasClass('cp-modal-backdrop')) closeModal();
    });

    // --- Category CRUD ---
    $(document).off('click.cp2a-new-cat').on('click.cp2a-new-cat', '[data-action="new-category"]', function(e) {
      e.preventDefault(); openCategoryModal();
    });
    $(document).off('click.cp2a-edit-cat').on('click.cp2a-edit-cat', '[data-action="edit-category"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      openCategoryModal($(this).data('id'));
    });
    $(document).off('click.cp2a-delete-cat').on('click.cp2a-delete-cat', '[data-action="delete-category"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      confirmDeleteCategory($(this).data('id'));
    });

    // --- Persona CRUD ---
    $(document).off('click.cp2a-new-persona').on('click.cp2a-new-persona', '[data-action="new-persona"]', function(e) {
      e.preventDefault(); openPersonaModal();
    });
    $(document).off('click.cp2a-edit-persona').on('click.cp2a-edit-persona', '[data-action="edit-persona"]', function(e) {
      e.preventDefault(); openPersonaModal($(this).data('id'));
    });
    $(document).off('click.cp2a-delete-persona').on('click.cp2a-delete-persona', '[data-action="delete-persona"]', function(e) {
      e.preventDefault(); confirmDeletePersona($(this).data('id'));
    });
    $(document).off('click.cp2a-add-pp-persona').on('click.cp2a-add-pp-persona', '[data-action="add-pain-point-to-persona"]', function(e) {
      e.preventDefault();
      var personaId = $(this).data('persona-id');
      if (!personaId) return;
      openPainPointModal(); // Opens new pain point modal; user can link it to persona after creation
    });

    // --- Pain Point CRUD ---
    $(document).off('click.cp2a-new-pp').on('click.cp2a-new-pp', '[data-action="new-pain-point"]', function(e) {
      e.preventDefault(); openPainPointModal();
    });
    $(document).off('click.cp2a-select-pp').on('click.cp2a-select-pp', '[data-action="select-pain-point"]', function(e) {
      e.preventDefault(); openPainPointModal($(this).data('id'));
    });
    $(document).off('click.cp2a-delete-pp').on('click.cp2a-delete-pp', '[data-action="delete-pain-point"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      confirmDeletePainPoint($(this).data('id'));
    });

    // --- Message CRUD ---
    $(document).off('click.cp2a-new-msg').on('click.cp2a-new-msg', '[data-action="new-message"]', function(e) {
      e.preventDefault(); openMessageModal();
    });
    $(document).off('click.cp2a-edit-msg').on('click.cp2a-edit-msg', '[data-action="edit-message"]', function(e) {
      e.preventDefault(); e.stopPropagation(); openMessageModal($(this).data('id'));
    });
    $(document).off('click.cp2a-delete-msg').on('click.cp2a-delete-msg', '[data-action="delete-message"]', function(e) {
      e.preventDefault(); e.stopPropagation(); confirmDeleteMessage($(this).data('id'));
    });
    $(document).off('click.cp2a-select-msg').on('click.cp2a-select-msg', '[data-action="select-message"]', function(e) {
      e.preventDefault(); openMessageModal($(this).data('id'));
    });

    // --- Style CRUD ---
    $(document).off('click.cp2a-new-style').on('click.cp2a-new-style', '[data-action="new-style"]', function(e) {
      e.preventDefault(); openStyleModal();
    });
    $(document).off('click.cp2a-edit-style').on('click.cp2a-edit-style', '[data-action="edit-style"]', function(e) {
      e.preventDefault(); e.stopPropagation(); openStyleModal($(this).data('id'));
    });
    $(document).off('click.cp2a-delete-style').on('click.cp2a-delete-style', '[data-action="delete-style"]', function(e) {
      e.preventDefault(); e.stopPropagation(); confirmDeleteStyle($(this).data('id'));
    });

    // --- Format CRUD ---
    $(document).off('click.cp2a-new-format').on('click.cp2a-new-format', '[data-action="new-format"]', function(e) {
      e.preventDefault(); openFormatModal();
    });
    $(document).off('click.cp2a-edit-format').on('click.cp2a-edit-format', '[data-action="edit-format"]', function(e) {
      e.preventDefault(); e.stopPropagation(); openFormatModal($(this).data('id'));
    });
    $(document).off('click.cp2a-delete-format').on('click.cp2a-delete-format', '[data-action="delete-format"]', function(e) {
      e.preventDefault(); e.stopPropagation(); confirmDeleteFormat($(this).data('id'));
    });

    // --- Campaign CRUD ---
    $(document).off('click.cp2a-new-camp').on('click.cp2a-new-camp', '[data-action="new-campaign"]', function(e) {
      e.preventDefault(); openCampaignModal();
    });
    $(document).off('click.cp2a-edit-camp').on('click.cp2a-edit-camp', '[data-action="edit-campaign"]', function(e) {
      e.preventDefault(); e.stopPropagation(); openCampaignModal($(this).data('id'));
    });
    $(document).off('click.cp2a-delete-camp').on('click.cp2a-delete-camp', '[data-action="delete-campaign"]', function(e) {
      e.preventDefault(); e.stopPropagation(); confirmDeleteCampaign($(this).data('id'));
    });
    $(document).off('click.cp2a-select-camp').on('click.cp2a-select-camp', '[data-action="select-campaign"]', function(e) {
      e.preventDefault();
      S.selectedCampaignId = $(this).data('id');
      render();
    });

    // --- Tag CRUD ---
    $(document).off('click.cp2a-new-tag').on('click.cp2a-new-tag', '[data-action="new-tag"]', function(e) {
      e.preventDefault(); openTagModal();
    });
    $(document).off('click.cp2a-edit-tag').on('click.cp2a-edit-tag', '[data-action="edit-tag"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      openTagModal($(this).data('id'));
    });
    $(document).off('click.cp2a-delete-tag').on('click.cp2a-delete-tag', '[data-action="delete-tag"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      confirmDeleteTag($(this).data('id'));
    });

    // --- Recipe delete ---
    $(document).off('click.cp2a-delete-recipe').on('click.cp2a-delete-recipe', '[data-action="delete-recipe"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id');
      var r = getRecipe(id);
      if (!r) return;
      openConfirmDialog({
        title: 'Delete Recipe',
        message: 'Delete "' + (r.title || 'Untitled') + '"?',
        confirmLabel: 'Delete', danger: true,
        onConfirm: function() {
          snapshot('Delete recipe'); deleteEntity('recipe', id);
          if (S.selectedRecipeId === id) { S.selectedRecipeId = null; S.currentStep = null; }
        }
      });
    });

    // --- Modal-specific interactions ---
    // Funnel chip toggle in modals
    $(document).off('click.cp2a-funnel-chip').on('click.cp2a-funnel-chip', '[data-action="toggle-funnel-chip"]', function(e) {
      e.preventDefault();
      var $chip = $(this);
      var stageId = $chip.data('stage-id');
      var f = getFunnelStage(stageId);
      if (!f) return;
      var isActive = $chip.hasClass('cp-funnel-chip-active');
      if (isActive) {
        $chip.removeClass('cp-funnel-chip-active').css({ background: '', borderColor: f.color + '40', color: f.color });
      } else {
        $chip.addClass('cp-funnel-chip-active').css({ background: f.color, borderColor: f.color, color: '#fff' });
      }
    });

    // Color swatch picker
    $(document).off('click.cp2a-color').on('click.cp2a-color', '[data-action="pick-color"]', function(e) {
      e.preventDefault();
      var color = $(this).data('color');
      $(this).closest('.cp-chip-selector').find('.cp-color-swatch').css('border-color', 'transparent').removeClass('cp-color-swatch-active');
      $(this).css('border-color', 'var(--cp-text-primary)').addClass('cp-color-swatch-active');
      $(this).closest('.cp-form-group').find('input[data-field="color"]').val(color);
    });

    // Add/remove hook rows in message modal
    $(document).off('click.cp2a-add-hook').on('click.cp2a-add-hook', '[data-action="add-hook-row"]', function(e) {
      e.preventDefault(); addHookRow();
    });
    $(document).off('click.cp2a-rm-hook').on('click.cp2a-rm-hook', '[data-action="remove-hook-row"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      removeHookRow(parseInt($(this).data('hook-index'), 10));
    });

    // Pain point picker checkbox toggle in persona modal
    $(document).off('change.cp2a-pp-check').on('change.cp2a-pp-check', '.cp-pain-point-picker-item input[type="checkbox"]', function() {
      $(this).closest('.cp-pain-point-picker-item').toggleClass('cp-pain-point-picker-item-selected', this.checked);
    });

    // --- Pipeline Step Events ---

    // Change dimension (opens picker modal)
    $(document).off('click.cp2a-change-dim').on('click.cp2a-change-dim', '[data-action="change-dimension"]', function(e) {
      e.preventDefault();
      var dim = $(this).data('dim');
      var recipeId = $(this).data('recipe-id') || (getSelectedRecipe() ? getSelectedRecipe().id : '');
      if (dim && recipeId) openDimensionPicker(dim, recipeId);
    });

    // Set media type
    $(document).off('click.cp2a-media-type').on('click.cp2a-media-type', '[data-action="set-media-type"]', function(e) {
      e.preventDefault();
      var type = $(this).data('type');
      var recipe = getSelectedRecipe();
      if (recipe && type) {
        saveEntityField('recipe', recipe.id, 'media_type', type);
        snapshot('Change media type');
      }
    });

    // Save recipe title
    $(document).off('blur.cp2a-recipe-title').on('blur.cp2a-recipe-title', '[data-action="save-recipe-title"]', function() {
      var recipe = getSelectedRecipe();
      if (recipe) saveEntityField('recipe', recipe.id, 'title', $(this).val() || '');
    });

    // Save recipe simple fields (priority, campaign, due_date)
    $(document).off('change.cp2a-recipe-field').on('change.cp2a-recipe-field', '[data-action="save-recipe-field"]', function() {
      var recipe = getSelectedRecipe();
      var field = $(this).data('rfield');
      if (recipe && field) saveEntityField('recipe', recipe.id, field, $(this).val() || '');
    });

    // Toggle recipe pain point
    $(document).off('change.cp2a-recipe-pp').on('change.cp2a-recipe-pp', '[data-action="toggle-recipe-pp"]', function() {
      var recipe = getSelectedRecipe();
      if (!recipe) return;
      var ppId = $(this).data('pp-id');
      var pps = recipe.selected_pain_point_ids || [];
      if (this.checked) { if (pps.indexOf(ppId) === -1) pps.push(ppId); }
      else { pps = pps.filter(function(id) { return id !== ppId; }); }
      saveEntityField('recipe', recipe.id, 'selected_pain_point_ids', pps);
      $(this).closest('.cp-pain-point-picker-item').toggleClass('cp-pain-point-picker-item-selected', this.checked);
    });

    // Hook selection (radio)
    $(document).off('change.cp2a-select-hook').on('change.cp2a-select-hook', '[data-action="select-hook"]', function() {
      var recipe = getSelectedRecipe();
      if (!recipe) return;
      recipe.hook = recipe.hook || {};
      recipe.hook.selected_hook_id = $(this).val() || '';
      recipe.updated = new Date().toISOString();
      syncToTextarea();
      if (maybeAdvanceRecipeStatus) maybeAdvanceRecipeStatus(recipe, 'hook selected');
      buildMaps(); render();
    });

    // Save custom hook
    $(document).off('blur.cp2a-hook-custom').on('blur.cp2a-hook-custom', '[data-action="save-recipe-hook-custom"]', function() {
      var recipe = getSelectedRecipe();
      if (!recipe) return;
      recipe.hook = recipe.hook || {};
      recipe.hook.custom_hook = $(this).val() || '';
      recipe.updated = new Date().toISOString();
      syncToTextarea();
      if (maybeAdvanceRecipeStatus) maybeAdvanceRecipeStatus(recipe, 'custom hook written');
      buildMaps();
    });

    // Save hook type
    $(document).off('change.cp2a-hook-type').on('change.cp2a-hook-type', '[data-action="save-recipe-hook-type"]', function() {
      var recipe = getSelectedRecipe();
      if (!recipe) return;
      recipe.hook = recipe.hook || {};
      recipe.hook.hook_type = $(this).val() || '';
      recipe.updated = new Date().toISOString();
      syncToTextarea();
    });

    // Save content fields (headline, description, cta, notes)
    $(document).off('blur.cp2a-content-field').on('blur.cp2a-content-field', '[data-action="save-content-field"]', function() {
      var field = $(this).data('cfield');
      if (field) saveContentField(field, $(this).val() || '');
    });

    // Save brief fields
    $(document).off('blur.cp2a-brief-field').on('blur.cp2a-brief-field', '[data-action="save-brief-field"]', function() {
      var field = $(this).data('bfield');
      if (field) saveBriefField(field, $(this).val() || '');
    });

    // Save prompt params
    $(document).off('change.cp2a-prompt-param blur.cp2a-prompt-param').on('change.cp2a-prompt-param blur.cp2a-prompt-param', '[data-action="save-prompt-param"]', function() {
      var param = $(this).data('param');
      if (param) savePromptParam(param, $(this).val() || '');
    });

    // Save video fields
    $(document).off('change.cp2a-video-field blur.cp2a-video-field').on('change.cp2a-video-field blur.cp2a-video-field', '[data-action="save-video-field"]', function() {
      var field = $(this).data('vfield');
      if (field) saveVideoField(field, $(this).val() || '');
    });

    // Save scene fields
    $(document).off('blur.cp2a-scene-field').on('blur.cp2a-scene-field', '[data-action="save-scene-field"]', function() {
      var idx = parseInt($(this).data('scene-index'), 10);
      var field = $(this).data('sfield');
      if (!isNaN(idx) && field) saveSceneField(idx, field, $(this).val() || '');
    });

    // Add/delete scene
    $(document).off('click.cp2a-add-scene').on('click.cp2a-add-scene', '[data-action="add-scene"]', function(e) { e.preventDefault(); addScene(); });
    $(document).off('click.cp2a-del-scene').on('click.cp2a-del-scene', '[data-action="delete-scene"]', function(e) {
      e.preventDefault();
      deleteScene(parseInt($(this).data('scene-index'), 10));
    });

    // Save script fields
    $(document).off('blur.cp2a-script-field').on('blur.cp2a-script-field', '[data-action="save-script-field"]', function() {
      var idx = parseInt($(this).data('row-index'), 10);
      var field = $(this).data('srfield');
      if (!isNaN(idx) && field) saveScriptField(idx, field, $(this).val() || '');
    });

    // Add script row
    $(document).off('click.cp2a-add-script-row').on('click.cp2a-add-script-row', '[data-action="add-script-row"]', function(e) { e.preventDefault(); addScriptRow(); });

    // Add/remove variants
    $(document).off('click.cp2a-add-variant').on('click.cp2a-add-variant', '[data-action="add-variant"]', function(e) { e.preventDefault(); addVariant(); });
    $(document).off('click.cp2a-rm-variant').on('click.cp2a-rm-variant', '[data-action="remove-variant"]', function(e) {
      e.preventDefault(); removeVariant(parseInt($(this).data('variant-index'), 10));
    });

    // Save variant text
    $(document).off('blur.cp2a-save-variant').on('blur.cp2a-save-variant', '[data-action="save-variant"]', function() {
      var recipe = getSelectedRecipe();
      if (!recipe) return;
      var idx = parseInt($(this).data('variant-index'), 10);
      recipe.content = recipe.content || {};
      recipe.content.variants = recipe.content.variants || [];
      if (recipe.content.variants[idx]) {
        recipe.content.variants[idx].text = $(this).val() || '';
        recipe.updated = new Date().toISOString();
        syncToTextarea();
      }
    });

    // Set recipe status (review step)
    $(document).off('click.cp2a-set-status').on('click.cp2a-set-status', '[data-action="set-recipe-status"]', function(e) {
      e.preventDefault();
      var status = $(this).data('status');
      var recipe = getSelectedRecipe();
      if (recipe && status) setRecipeStatus(recipe.id, status);
    });

    // Save review notes
    $(document).off('blur.cp2a-review-notes').on('blur.cp2a-review-notes', '[data-action="save-review-notes"]', function() {
      var recipe = getSelectedRecipe();
      if (recipe) saveEntityField('recipe', recipe.id, 'review_notes', $(this).val() || '');
    });

    // Save production notes
    $(document).off('blur.cp2a-prod-notes').on('blur.cp2a-prod-notes', '[data-action="save-production-notes"]', function() {
      var recipe = getSelectedRecipe();
      if (recipe) saveEntityField('recipe', recipe.id, 'production_notes', $(this).val() || '');
    });

    // --- Mix & Match Engine ---
    $(document).off('click.cp2a-open-mixer').on('click.cp2a-open-mixer', '[data-action="open-mixer"]', function(e) {
      e.preventDefault();
      var mode = $(this).data('mode') || 'manual';
      openMixerModal(mode);
    });

    // --- Tag Input Component ---
    $(document).off('change.cp2a-add-tag').on('change.cp2a-add-tag', '[data-action="add-entity-tag"]', function() {
      var tagId = $(this).val();
      if (!tagId) return;
      var $container = $(this).closest('.cp-tag-input');
      var entityType = $container.data('entity-type');
      var entityId = $container.data('entity-id');
      if (!entityType || !entityId) return;
      var collections = {
        persona: S.data.personas, message: S.data.messages, style: S.data.styles,
        visual_format: S.data.visual_formats, recipe: S.data.recipes, campaign: S.data.campaigns
      };
      var coll = collections[entityType];
      if (!coll) return;
      var entity = coll.find(function(e) { return e.id === entityId; });
      if (!entity) return;
      entity.tags = entity.tags || [];
      if (entity.tags.indexOf(tagId) === -1) {
        entity.tags.push(tagId);
        entity.updated = new Date().toISOString();
        syncToTextarea(); buildMaps(); render();
      }
    });

    $(document).off('click.cp2a-rm-tag').on('click.cp2a-rm-tag', '[data-action="remove-entity-tag"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var tagId = $(this).data('tag-id');
      if (!tagId) return;
      var $container = $(this).closest('.cp-tag-input');
      var entityType = $container.data('entity-type');
      var entityId = $container.data('entity-id');
      if (!entityType || !entityId) return;
      var collections = {
        persona: S.data.personas, message: S.data.messages, style: S.data.styles,
        visual_format: S.data.visual_formats, recipe: S.data.recipes, campaign: S.data.campaigns
      };
      var coll = collections[entityType];
      if (!coll) return;
      var entity = coll.find(function(e) { return e.id === entityId; });
      if (!entity || !entity.tags) return;
      entity.tags = entity.tags.filter(function(tid) { return tid !== tagId; });
      entity.updated = new Date().toISOString();
      syncToTextarea(); buildMaps(); render();
    });

    // --- AI Action Bar expand/collapse ---
    $(document).off('click.cp2a-expand-ai').on('click.cp2a-expand-ai', '[data-action="expand-ai-action"]', function(e) {
      e.preventDefault();
      var panelId = $(this).data('panel-id');
      var $panel = $('#cpAIPanel_' + panelId);
      $('.cp-ai-action-expanded:visible').not($panel).slideUp(150);
      $panel.slideToggle(200);
    });
    $(document).off('click.cp2a-collapse-ai').on('click.cp2a-collapse-ai', '[data-action="collapse-ai-action"]', function(e) {
      e.preventDefault();
      var panelId = $(this).data('panel-id');
      $('#cpAIPanel_' + panelId).slideUp(150);
    });

    // --- Campaign Wizard ---
    $(document).off('click.cp2a-open-wizard').on('click.cp2a-open-wizard', '[data-action="open-campaign-wizard"]', function(e) {
      e.preventDefault(); openCampaignWizard();
    });
    $(document).off('click.cp2a-wizard-next').on('click.cp2a-wizard-next', '[data-action="wizard-next"]', function(e) {
      e.preventDefault();
      collectWizardFields();
      if (wizardState.step === 1 && (!wizardState.data.name || !wizardState.data.name.trim())) { toast('Campaign name is required', 'warning'); return; }
      if (wizardState.step < 4) { wizardState.step++; renderWizardModal(); }
    });
    $(document).off('click.cp2a-wizard-prev').on('click.cp2a-wizard-prev', '[data-action="wizard-prev"]', function(e) {
      e.preventDefault();
      collectWizardFields();
      if (wizardState.step > 1) { wizardState.step--; renderWizardModal(); }
    });
    $(document).off('click.cp2a-wizard-step').on('click.cp2a-wizard-step', '[data-action="wizard-go-step"]', function(e) {
      e.preventDefault();
      collectWizardFields();
      var targetStep = parseInt($(this).data('step'), 10);
      if (targetStep <= wizardState.step || targetStep === wizardState.step + 1) {
        wizardState.step = targetStep;
        renderWizardModal();
      }
    });
    $(document).off('change.cp2a-wizard-dim').on('change.cp2a-wizard-dim', '[data-action="wizard-toggle-dim"]', function() {
      var dim = $(this).data('dim');
      var id = $(this).data('id');
      var sel = wizardState.selections[dim];
      if (!sel) return;
      var idx = sel.indexOf(id);
      if (this.checked && idx === -1) sel.push(id);
      else if (!this.checked && idx > -1) sel.splice(idx, 1);
      collectWizardFields();
      renderWizardModal();
    });
    $(document).off('click.cp2a-wizard-recipe').on('click.cp2a-wizard-recipe', '[data-action="wizard-toggle-recipe"]', function(e) {
      e.preventDefault();
      var ridx = parseInt($(this).data('ridx'), 10);
      if (wizardState.recipes[ridx]) {
        wizardState.recipes[ridx].selected = !wizardState.recipes[ridx].selected;
        renderWizardModal();
      }
    });
    $(document).off('click.cp2a-wizard-selall').on('click.cp2a-wizard-selall', '[data-action="wizard-select-all"]', function(e) {
      e.preventDefault();
      wizardState.allSelected = !wizardState.allSelected;
      wizardState.recipes.forEach(function(r) { r.selected = wizardState.allSelected; });
      renderWizardModal();
    });
    $(document).off('click.cp2a-wizard-create').on('click.cp2a-wizard-create', '[data-action="wizard-create"]', function(e) {
      e.preventDefault(); executeWizardCreate();
    });
    // Add recipe to campaign (from detail view) — pre-link to campaign
    $(document).off('click.cp2a-add-recipe-camp').on('click.cp2a-add-recipe-camp', '[data-action="add-recipe-to-campaign"]', function(e) {
      e.preventDefault();
      var campId = $(this).data('campaign-id');
      if (!campId) return;
      S._pendingCampaignId = campId;
      openMixerModal('manual');
    });

    // Quick create recipe from campaign (uses first available dimension from each)
    $(document).off('click.cp2a-camp-quick').on('click.cp2a-camp-quick', '[data-action="camp-quick-recipe"]', function(e) {
      e.preventDefault();
      var campId = $(this).data('campaign-id');
      var camp = getCampaign(campId);
      if (!camp) return;
      snapshot('Quick recipe from campaign');
      var newRecipe = createEntity('recipe', {
        persona_id: (camp.persona_ids || [])[0] || '',
        message_id: (camp.message_ids || [])[0] || '',
        style_id: (camp.style_ids || [])[0] || '',
        visual_format_id: (camp.format_ids || [])[0] || '',
        campaign_id: campId
      });
      if (newRecipe) {
        S.selectedRecipeId = newRecipe.id;
        S.currentStep = 'composition';
        navigate('recipes');
        toast('Recipe created — edit its dimensions in the Composition step', 'success');
      }
    });

    // Move recipe to a different campaign
    $(document).off('click.cp2a-move-recipe-camp').on('click.cp2a-move-recipe-camp', '[data-action="move-recipe-campaign"]', function(e) {
      e.preventDefault();
      var recipeId = $(this).data('id');
      var recipe = getRecipe(recipeId);
      if (!recipe) return;
      var camps = getAllCampaigns();
      var html = '<div class="cp-editor-form">';
      html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-3)">Select a campaign to assign this recipe to:</p>';
      html += '<label style="display:flex;align-items:center;gap:var(--cp-space-2);padding:var(--cp-space-2) 0;border-bottom:1px solid var(--cp-border-light);cursor:pointer">';
      html += '<input type="radio" name="cp-move-camp" value="" ' + (!recipe.campaign_id ? 'checked' : '') + '>';
      html += '<span style="color:var(--cp-text-muted)">No campaign (unassigned)</span></label>';
      for (var ci = 0; ci < camps.length; ci++) {
        var c = camps[ci];
        html += '<label style="display:flex;align-items:center;gap:var(--cp-space-2);padding:var(--cp-space-2) 0;border-bottom:1px solid var(--cp-border-light);cursor:pointer">';
        html += '<input type="radio" name="cp-move-camp" value="' + esc(c.id) + '" ' + (recipe.campaign_id === c.id ? 'checked' : '') + '>';
        html += '<span>' + icon('bullhorn') + ' ' + esc(c.name) + '</span></label>';
      }
      html += '</div>';
      openModal('Move Recipe to Campaign', html, {
        titleIcon: 'arrow-right-arrow-left', size: 'md',
        saveLabel: 'Move',
        onSave: function() {
          var newCampId = $('input[name="cp-move-camp"]:checked').val() || '';
          snapshot('Move recipe to campaign');
          saveEntityField('recipe', recipeId, 'campaign_id', newCampId);
          closeModal();
          toast(newCampId ? 'Recipe moved to ' + (S.campaignMap[newCampId] ? S.campaignMap[newCampId].name : 'campaign') : 'Recipe unassigned from campaign', 'success');
        }
      });
    });

    // Create recipe from coverage matrix cell (persona × message pre-set)
    $(document).off('click.cp2a-camp-combo').on('click.cp2a-camp-combo', '[data-action="camp-create-combo"]', function(e) {
      e.preventDefault();
      var campId = $(this).data('campaign-id');
      var personaId = $(this).data('persona-id');
      var messageId = $(this).data('message-id');
      var camp = getCampaign(campId);
      if (!camp) return;
      snapshot('Recipe from coverage matrix');
      var newRecipe = createEntity('recipe', {
        persona_id: personaId || '',
        message_id: messageId || '',
        style_id: (camp.style_ids || [])[0] || '',
        visual_format_id: (camp.format_ids || [])[0] || '',
        campaign_id: campId
      });
      if (newRecipe) {
        S.selectedRecipeId = newRecipe.id;
        S.currentStep = 'composition';
        navigate('recipes');
        toast('Recipe created from coverage matrix', 'success');
      }
    });

    // Manage campaign phases
    $(document).off('click.cp2a-camp-phases').on('click.cp2a-camp-phases', '[data-action="manage-campaign-phases"]', function(e) {
      e.preventDefault();
      var campId = $(this).data('campaign-id');
      var camp = getCampaign(campId);
      if (!camp) return;
      openCampaignPhasesModal(campId);
    });

    // --- Recipe Templates ---
    $(document).off('click.cp2a-save-template').on('click.cp2a-save-template', '[data-action="save-recipe-template"]', function(e) {
      e.preventDefault();
      var recipeId = $(this).data('recipe-id');
      var recipe = getRecipe(recipeId);
      if (!recipe) return;
      var pName = S.personaMap[recipe.persona_id] ? S.personaMap[recipe.persona_id].name : '';
      var mName = S.messageMap[recipe.message_id] ? S.messageMap[recipe.message_id].title : '';
      var sName = S.styleMap[recipe.style_id] ? S.styleMap[recipe.style_id].name : '';
      var fName = S.formatMap[recipe.visual_format_id] ? S.formatMap[recipe.visual_format_id].name : '';
      var defaultName = [pName, mName, sName, fName].filter(Boolean).join(' × ') || 'Recipe Template';

      var html = '<div class="cp-editor-form">';
      html += '<div class="cp-form-group"><label>Template Name</label>';
      html += '<input type="text" class="cp-input" data-field="name" value="' + esc(defaultName) + '"></div>';
      html += '<p class="cp-text-muted">Saves the recipe\'s composition (persona, message, style, format, media type) as a reusable template.</p>';
      html += '</div>';

      openModal('Save Recipe Template', html, {
        titleIcon: 'bookmark', size: 'md', saveLabel: 'Save Template',
        onSave: function() {
          var name = collectModalFields().name || defaultName;
          S.meta.recipe_templates = S.meta.recipe_templates || [];
          S.meta.recipe_templates.push({
            id: 'tpl_' + Date.now(),
            name: name,
            persona_id: recipe.persona_id || '',
            message_id: recipe.message_id || '',
            style_id: recipe.style_id || '',
            visual_format_id: recipe.visual_format_id || '',
            media_type: recipe.media_type || 'image',
            created: new Date().toISOString()
          });
          syncToTextarea();
          closeModal();
          toast('Template "' + name + '" saved', 'success');
        }
      });
    });

    $(document).off('click.cp2a-apply-template').on('click.cp2a-apply-template', '[data-action="apply-recipe-template"]', function(e) {
      e.preventDefault();
      var recipeId = $(this).data('recipe-id');
      var recipe = getRecipe(recipeId);
      if (!recipe) return;
      var templates = (S.meta && S.meta.recipe_templates) || [];
      if (templates.length === 0) { toast('No templates saved yet', 'info'); return; }

      var html = '<div class="cp-editor-form">';
      html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-3)">Apply a template to set this recipe\'s dimensions:</p>';
      for (var ti = 0; ti < templates.length; ti++) {
        var t = templates[ti];
        html += '<label style="display:flex;align-items:center;gap:var(--cp-space-2);padding:var(--cp-space-2) 0;border-bottom:1px solid var(--cp-border-light);cursor:pointer">';
        html += '<input type="radio" name="cp-tpl" value="' + ti + '"' + (ti === 0 ? ' checked' : '') + '>';
        html += '<div style="flex:1"><strong>' + esc(t.name) + '</strong>';
        html += '<div style="font-size:11px;color:var(--cp-text-muted)">';
        var parts = [];
        if (t.persona_id && S.personaMap[t.persona_id]) parts.push(S.personaMap[t.persona_id].name);
        if (t.message_id && S.messageMap[t.message_id]) parts.push(S.messageMap[t.message_id].title);
        if (t.style_id && S.styleMap[t.style_id]) parts.push(S.styleMap[t.style_id].name);
        if (t.visual_format_id && S.formatMap[t.visual_format_id]) parts.push(S.formatMap[t.visual_format_id].name);
        html += parts.join(' × ') + ' · ' + (t.media_type || 'image');
        html += '</div></div>';
        html += '<button class="cp-btn-icon cp-btn-xs" data-action="delete-template" data-tidx="' + ti + '" title="Delete">' + icon('trash') + '</button>';
        html += '</label>';
      }
      html += '</div>';

      openModal('Apply Template', html, {
        titleIcon: 'file-import', size: 'md', saveLabel: 'Apply',
        onSave: function() {
          var idx = parseInt($('input[name="cp-tpl"]:checked').val(), 10);
          var t = templates[idx];
          if (!t) return;
          snapshot('Apply recipe template');
          if (t.persona_id) saveEntityField('recipe', recipeId, 'persona_id', t.persona_id);
          if (t.message_id) saveEntityField('recipe', recipeId, 'message_id', t.message_id);
          if (t.style_id) saveEntityField('recipe', recipeId, 'style_id', t.style_id);
          if (t.visual_format_id) saveEntityField('recipe', recipeId, 'visual_format_id', t.visual_format_id);
          if (t.media_type) saveEntityField('recipe', recipeId, 'media_type', t.media_type);
          closeModal();
          toast('Template applied', 'success');
        }
      });
    });

    // Delete template (from within apply modal)
    $(document).off('click.cp2a-del-tpl').on('click.cp2a-del-tpl', '[data-action="delete-template"]', function(e) {
      e.preventDefault(); e.stopPropagation();
      var idx = parseInt($(this).data('tidx'), 10);
      S.meta.recipe_templates = S.meta.recipe_templates || [];
      if (S.meta.recipe_templates[idx]) {
        S.meta.recipe_templates.splice(idx, 1);
        syncToTextarea();
        toast('Template deleted', 'success');
        closeModal();
      }
    });

    // --- Duplicate recipe ---
    $(document).off('click.cp2a-dup-recipe').on('click.cp2a-dup-recipe', '[data-action="duplicate-recipe"]', function(e) {
      e.preventDefault();
      var id = $(this).data('id') || (getSelectedRecipe() ? getSelectedRecipe().id : '');
      if (id) {
        snapshot('Duplicate recipe');
        var clone = duplicateEntity('recipe', id);
        if (clone) { S.selectedRecipeId = clone.id; S.currentStep = 'composition'; }
      }
    });

    // --- Setup Wizard ---
    $(document).off('click.cp2a-sw-open').on('click.cp2a-sw-open', '[data-action="open-setup-wizard"]', function(e) {
      e.preventDefault();
      var forceReset = $(this).data('force-reset') === true || $(this).data('forceReset') === true;
      openSetupWizard(forceReset);
    });
    $(document).off('click.cp2a-sw-close').on('click.cp2a-sw-close', '[data-action="sw-close"]', function(e) {
      e.preventDefault();
      swSaveSession();
      openConfirmDialog(
        'Close Setup Wizard?',
        'Your progress has been saved. You can resume from where you left off.',
        function() { $('.cp-setup-wizard').remove(); }
      );
    });
    $(document).off('click.cp2a-sw-next').on('click.cp2a-sw-next', '[data-action="sw-next"]', function(e) {
      e.preventDefault(); swGoNext();
    });
    $(document).off('click.cp2a-sw-back').on('click.cp2a-sw-back', '[data-action="sw-back"]', function(e) {
      e.preventDefault(); swGoBack();
    });
    $(document).off('click.cp2a-sw-skip').on('click.cp2a-sw-skip', '[data-action="sw-skip"]', function(e) {
      e.preventDefault(); swSkipStep();
    });
    $(document).off('click.cp2a-sw-goto').on('click.cp2a-sw-goto', '[data-action="sw-goto-step"]', function(e) {
      e.preventDefault();
      var n = parseInt($(this).data('step'), 10);
      if (!isNaN(n)) swGotoStep(n);
    });
    $(document).off('click.cp2a-sw-card').on('click.cp2a-sw-card', '.cp-sw-sel-card', function(e) {
      // Ignore clicks that originate on the expand button
      if ($(e.target).closest('[data-action="sw-card-expand"]').length) return;
      e.preventDefault();
      var idx = parseInt($(this).data('idx'), 10);
      var step = setupWizardState.step;
      var listKey;
      if (step === 6) {
        // Step 6 hosts both styles and formats — distinguish by data-card-type
        listKey = $(this).data('card-type') === 'format' ? 'formats' : 'styles';
      } else {
        listKey = { 3: 'personas', 4: 'pain_points', 5: 'messages' }[step];
      }
      if (!listKey) return;
      var items = setupWizardState[listKey];
      if (!items || isNaN(idx) || !items[idx]) return;
      items[idx]._selected = !items[idx]._selected;
      refreshSetupWizard();
    });
    $(document).off('click.cp2a-sw-expand').on('click.cp2a-sw-expand', '[data-action="sw-card-expand"]', function(e) {
      e.preventDefault();
      var key = $(this).data('key');
      if (key) {
        setupWizardState._expandedCards[key] = !setupWizardState._expandedCards[key];
        refreshSetupWizard();
      }
    });
    $(document).off('click.cp2a-sw-gen-p').on('click.cp2a-sw-gen-p', '[data-action="sw-ai-gen-personas"]', function(e) {
      e.preventDefault();
      if (setupWizardState.aiLoading) return;
      setupWizardState._personaContext = $('#swPersonaContext').val() || '';
      var R = window._cpRenderers || {};
      if (typeof R.swAIGeneratePersonas === 'function') R.swAIGeneratePersonas();
      else toast('AI not ready — please wait for the page to fully load.', 'warning');
    });
    $(document).off('click.cp2a-sw-gen-pp').on('click.cp2a-sw-gen-pp', '[data-action="sw-ai-gen-painpoints"]', function(e) {
      e.preventDefault();
      if (setupWizardState.aiLoading) return;
      setupWizardState._ppContext = $('#swPainPointContext').val() || '';
      var R = window._cpRenderers || {};
      if (typeof R.swAIGeneratePainPoints === 'function') R.swAIGeneratePainPoints();
      else toast('AI not ready — please wait for the page to fully load.', 'warning');
    });
    $(document).off('click.cp2a-sw-pp-tab').on('click.cp2a-sw-pp-tab', '[data-action="sw-pp-tab"]', function(e) {
      e.preventDefault();
      var tab = parseInt($(this).data('tab'), 10);
      if (!isNaN(tab)) { setupWizardState._ppActiveTab = tab; refreshSetupWizard(); }
    });
    $(document).off('click.cp2a-sw-gen-msg').on('click.cp2a-sw-gen-msg', '[data-action="sw-ai-gen-messages"]', function(e) {
      e.preventDefault();
      if (setupWizardState.aiLoading) return;
      setupWizardState._messageContext = $('#swMessageContext').val() || '';
      var R = window._cpRenderers || {};
      if (typeof R.swAIGenerateMessages === 'function') R.swAIGenerateMessages();
      else toast('AI not ready — please wait for the page to fully load.', 'warning');
    });
    $(document).off('click.cp2a-sw-gen-sf').on('click.cp2a-sw-gen-sf', '[data-action="sw-ai-gen-styles-formats"]', function(e) {
      e.preventDefault();
      if (setupWizardState.aiLoading) return;
      setupWizardState._styleFormatContext = $('#swStyleFormatContext').val() || '';
      var R = window._cpRenderers || {};
      if (typeof R.swAIGenerateStylesFormats === 'function') R.swAIGenerateStylesFormats();
      else toast('AI not ready — please wait for the page to fully load.', 'warning');
    });
    $(document).off('click.cp2a-sw-combo-toggle').on('click.cp2a-sw-combo-toggle', '[data-action="sw-combo-toggle"]', function(e) {
      e.preventDefault();
      var idx = parseInt($(this).data('idx'), 10);
      var combos = setupWizardState.combos;
      if (!combos || isNaN(idx) || !combos[idx]) return;
      combos[idx].selected = !combos[idx].selected;
      refreshSetupWizard();
    });
    $(document).off('click.cp2a-sw-regen-combos').on('click.cp2a-sw-regen-combos', '[data-action="sw-regen-combos"]', function(e) {
      e.preventDefault();
      _swAutoGenerateCombos();
    });
    $(document).off('click.cp2a-sw-launch').on('click.cp2a-sw-launch', '[data-action="sw-launch"]', function(e) {
      e.preventDefault();
      if (typeof window._cpRenderers.finalizeSetupWizard === 'function') {
        window._cpRenderers.finalizeSetupWizard();
      }
    });
    $(document).off('click.cp2a-sw-test-ai').on('click.cp2a-sw-test-ai', '[data-action="sw-test-ai"]', function(e) {
      e.preventDefault(); _swTestAIConnection();
    });
    // Update wizard AI model dropdown when provider changes (Step 2)
    $(document).off('change.cp2a-sw-ai-prov').on('change.cp2a-sw-ai-prov', '.cp-sw-ai-picker-wrap .cp-ai-provider-select', function() {
      setupWizardState.aiConfig.tested = false; // reset test status on provider change
      var $prov = $(this);
      var pid = $prov.val();
      var $modelSel = $prov.closest('.cp-ai-picker').find('.cp-ai-model-select');
      if (!$modelSel.length) return;
      var p2b = window._cpPart2B;
      if (!p2b || !p2b.LLMService) return;
      var models = p2b.LLMService.getActiveModels(pid);
      var opts = '';
      for (var i = 0; i < models.length; i++) {
        opts += '<option value="' + esc(models[i].id) + '">' + esc(models[i].label || models[i].id) + '</option>';
      }
      $modelSel.html(opts);
      // Reset test status display
      $('#swAiTestStatus').html('<span class="cp-sw-test-idle">Not tested yet &mdash; you can still continue</span>');
    });

    // Escape key closes modal / wizard
    // Enter / Space activates selection cards and combo cards (accessibility)
    $(document).off('keydown.cp2a-sw-cards').on('keydown.cp2a-sw-cards', function(e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var $target = $(e.target);

      // Selection cards (personas / pain points / messages / styles / formats)
      if ($target.hasClass('cp-sw-sel-card')) {
        e.preventDefault();
        $target.trigger('click');
        return;
      }
      // Combo cards
      if ($target.hasClass('cp-sw-combo-card')) {
        e.preventDefault();
        $target.trigger('click');
        return;
      }
      // Clickable rail steps
      if ($target.hasClass('cp-sw-step-item--clickable')) {
        e.preventDefault();
        $target.trigger('click');
      }
    });

    // Tab focus trap — keep focus inside wizard overlay when it is open
    $(document).off('keydown.cp2a-sw-trap').on('keydown.cp2a-sw-trap', function(e) {
      if (e.key !== 'Tab') return;
      var $wiz = $('#cpSetupWizard');
      if (!$wiz.length) return;
      var focusable = $wiz.find(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), ' +
        'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ).filter(':visible');
      if (!focusable.length) return;
      var first = focusable.first()[0];
      var last  = focusable.last()[0];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    });

    $(document).off('keydown.cp2a-esc').on('keydown.cp2a-esc', function(e) {
      if (e.key === 'Escape') {
        if ($('.cp-confirm-backdrop').length) closeConfirmDialog();
        else if ($('.cp-modal-backdrop').length) closeModal();
        else if ($('.cp-setup-wizard').length && !setupWizardState.finalizing) {
          swSaveSession();
          openConfirmDialog(
            'Close Setup Wizard?',
            'Your progress has been saved. You can resume from the Setup page.',
            function() { $('.cp-setup-wizard').remove(); }
          );
        }
      }
    });

    // Undo/redo keyboard shortcuts
    $(document).off('keydown.cp2a-undo').on('keydown.cp2a-undo', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        if (!$(e.target).is('input, textarea, [contenteditable]')) { e.preventDefault(); undo(); }
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        if (!$(e.target).is('input, textarea, [contenteditable]')) { e.preventDefault(); redo(); }
      }
    });

    console.log('[CP] Part 2A event handlers ready');
  }

  // ============================================================
  // SECTION 20: API EXPORTS
  // ============================================================

  window._cpPart2A = {
    // Modal system
    snapshot: snapshot, undo: undo, redo: redo,
    openModal: openModal, closeModal: closeModal,
    openConfirmDialog: openConfirmDialog, closeConfirmDialog: closeConfirmDialog,
    collectModalFields: collectModalFields, collectFunnelChips: collectFunnelChips,

    // Category CRUD
    openCategoryModal: openCategoryModal, confirmDeleteCategory: confirmDeleteCategory,

    // Persona CRUD
    openPersonaModal: openPersonaModal, confirmDeletePersona: confirmDeletePersona,

    // Pain Point CRUD
    openPainPointModal: openPainPointModal, confirmDeletePainPoint: confirmDeletePainPoint,

    // Message CRUD
    openMessageModal: openMessageModal, confirmDeleteMessage: confirmDeleteMessage,
    addHookRow: addHookRow, removeHookRow: removeHookRow,

    // Style & Format CRUD
    openStyleModal: openStyleModal, confirmDeleteStyle: confirmDeleteStyle,
    openFormatModal: openFormatModal, confirmDeleteFormat: confirmDeleteFormat,

    // Campaign CRUD
    openCampaignModal: openCampaignModal, confirmDeleteCampaign: confirmDeleteCampaign,

    // Tag CRUD
    openTagModal: openTagModal, confirmDeleteTag: confirmDeleteTag,

    // Render helpers (for Part 2B to use)
    renderHookEditRow: renderHookEditRow,

    // Pipeline step helpers
    getEffectiveHook: getEffectiveHook,
    buildCompletionChecks: buildCompletionChecks,
    openDimensionPicker: openDimensionPicker,
    autoUpdateRecipeTitle: autoUpdateRecipeTitle,
    setRecipeStatus: setRecipeStatus,
    addScene: addScene, deleteScene: deleteScene,
    addScriptRow: addScriptRow,
    addVariant: addVariant, removeVariant: removeVariant,
    getSelectedRecipe: getSelectedRecipe,

    // Mix & Match
    openMixerModal: openMixerModal,
    createRecipeFromMixer: createRecipeFromMixer,
    batchGenerateRecipes: batchGenerateRecipes,

    // Tag Input
    renderTagInput: renderTagInput,

    // AI Action Bar
    renderRecipeAIBar: renderRecipeAIBar,

    // Campaign Wizard
    openCampaignWizard: openCampaignWizard, wizardState: wizardState,

    // Setup Wizard
    openSetupWizard: openSetupWizard,
    refreshSetupWizard: refreshSetupWizard,
    setupWizardState: setupWizardState,
    swClearSession: swClearSession
  };

  console.log('[CP] Part 2A loaded');

})(jQuery, Drupal);
