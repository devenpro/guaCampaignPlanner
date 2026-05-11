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
