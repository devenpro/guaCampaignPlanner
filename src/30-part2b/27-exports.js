  // ============================================================
  // SECTION 23: API EXPORTS
  // ============================================================

  window._cpPart2B = {
    // Services
    LLMService: LLMService, BrandService: BrandService,

    // AI utilities
    parseJSON: parseJSON, callAIWithRetry: callAIWithRetry,
    brandSnippet: brandSnippet,
    entityContextSnippet: entityContextSnippet,

    // Components
    renderAIResearchPanelBody: renderAIResearchPanelBody,
    renderInlineAIAssist: renderInlineAIAssist,
    renderInlinePicker: LLMService.renderInlinePicker,

    // AI library research actions
    aiResearchPersonas: aiResearchPersonas, aiResearchPainPoints: aiResearchPainPoints,
    aiResearchMessages: aiResearchMessages, aiResearchStyles: aiResearchStyles,
    aiResearchFormats: aiResearchFormats,
    showAIPreview: showAIPreview,

    // Meta v2 — export
    openExportModal: openExportModal,
    exportV2JSON: exportV2JSON, exportV2CSV: exportV2CSV,
    validateForExport: validateForExport,
    copyAdField: copyAdField,
    // Per-ad media brief (structured JSON for downstream tools / MCP)
    buildAdMediaBrief: buildAdMediaBrief,
    exportAdMediaBriefJSON: exportAdMediaBriefJSON,
    copyAdMediaBriefJSON: copyAdMediaBriefJSON,
    openMediaBriefPreview: openMediaBriefPreview,

    // Meta v2 AI
    aiGenerateCampaignTree: aiGenerateCampaignTree,
    aiSuggestAdSets: aiSuggestAdSets, aiSuggestAds: aiSuggestAds,
    aiGenerateAdSetBrief: aiGenerateAdSetBrief,
    aiGenerateAdHooks: aiGenerateAdHooks,
    aiWriteAdCopy: aiWriteAdCopy, aiImproveAdCopy: aiImproveAdCopy,
    aiGenerateAdImagePrompt: aiGenerateAdImagePrompt,
    aiGenerateVideoBlueprint: aiGenerateVideoBlueprint,
    aiGenerateVideoScript: aiGenerateVideoScript,

    // Setup Wizard AI generators + finalize
    swAIGeneratePersonas: swAIGeneratePersonas, swAIGeneratePainPoints: swAIGeneratePainPoints,
    swAIGenerateMessages: swAIGenerateMessages, swAIGenerateStylesFormats: swAIGenerateStylesFormats,
    swAIGenerateCampaignIdeas: swAIGenerateCampaignIdeas,
    finalizeSetupWizard: finalizeSetupWizard,

    // New Campaign Wizard AI + finalize
    ncwAISuggestAdSets: ncwAISuggestAdSets,
    ncwAISuggestAds: ncwAISuggestAds,
    finalizeNewCampaignWizard: finalizeNewCampaignWizard,

    // Status
    updateAIStatusIndicator: updateAIStatusIndicator, testAIConnection: testAIConnection,

    // Settings & Config
    saveAllSettings: saveAllSettings, addFunnelStage: addFunnelStage,
    exportJSON: exportJSON, importJSON: importJSON,

    // Images
    renderImagePicker: renderImagePicker, saveImageMeta: saveImageMeta,
    triggerImageUpload: triggerImageUpload
  };

  console.log('[CP] Part 2B loaded');

})(jQuery, Drupal);
