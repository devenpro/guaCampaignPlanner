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

    // Meta v2 CRUD
    openMetaCampaignModal: openMetaCampaignModal, confirmDeleteMetaCampaign: confirmDeleteMetaCampaign,
    openMetaAdSetModal: openMetaAdSetModal, confirmDeleteMetaAdSet: confirmDeleteMetaAdSet,
    openMetaAdModal: openMetaAdModal, openMetaAdQuickCreate: openMetaAdQuickCreate, confirmDeleteMetaAd: confirmDeleteMetaAd,
    buildPersonaSnapshot: buildPersonaSnapshot,
    // A/B testing
    openABTestConfigModal: openABTestConfigModal,
    openCompareVariantsModal: openCompareVariantsModal,
    setABWinner: setABWinner,

    // Tag CRUD
    openTagModal: openTagModal, confirmDeleteTag: confirmDeleteTag,

    // Tag Input
    renderTagInput: renderTagInput,

    // Setup Wizard
    openSetupWizard: openSetupWizard,
    maybeAutoLaunchSetupWizard: maybeAutoLaunchSetupWizard,
    refreshSetupWizard: refreshSetupWizard,
    setupWizardState: setupWizardState,
    swClearSession: swClearSession,
    swCancelAIGeneration: swCancelAIGeneration,
    swRetryStep: swRetryStep,
    swRelTime: _swRelTime,
    // Chaining signals used by Part 2B after each generator success
    _swAfterPersonasGenerated:   _swAfterPersonasGenerated,
    _swAfterPainPointsGenerated: _swAfterPainPointsGenerated,
    _swAfterStageGenerated:      _swAfterStageGenerated,

    // New Campaign Wizard
    openNewCampaignWizard: openNewCampaignWizard,
    refreshNCW: refreshNCW,
    ncwState: ncwState
  };

  console.log('[CP] Part 2A loaded');

})(jQuery, Drupal);
