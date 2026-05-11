  // ============================================================
  // SECTION 23: API EXPORTS
  // ============================================================

  window._cpPart2B = {
    // Services
    LLMService: LLMService, BrandService: BrandService,

    // AI utilities
    parseJSON: parseJSON, callAIWithRetry: callAIWithRetry,
    brandSnippet: brandSnippet, recipeContextSnippet: recipeContextSnippet,
    entityContextSnippet: entityContextSnippet,

    // Components
    renderAIResearchPanelBody: renderAIResearchPanelBody,
    renderInlineAIAssist: renderInlineAIAssist,
    renderInlinePicker: LLMService.renderInlinePicker,

    // AI actions
    aiResearchPersonas: aiResearchPersonas, aiResearchPainPoints: aiResearchPainPoints,
    aiResearchMessages: aiResearchMessages, aiResearchStyles: aiResearchStyles,
    aiResearchFormats: aiResearchFormats,
    aiGenerateHook: aiGenerateHook, aiWriteContent: aiWriteContent,
    aiGenerateBrief: aiGenerateBrief, aiGenerateImagePrompt: aiGenerateImagePrompt,
    aiGenerateBlueprint: aiGenerateBlueprint, aiGenerateScript: aiGenerateScript,
    aiSuggestCampaignRecipes: aiSuggestCampaignRecipes,
    aiGenerateCampaignBrief: aiGenerateCampaignBrief,
    aiAnalyzeCampaignGaps: aiAnalyzeCampaignGaps,
    aiImproveContent: aiImproveContent,
    showAIPreview: showAIPreview,

    // Setup Wizard AI generators + finalize
    swAIGeneratePersonas: swAIGeneratePersonas, swAIGeneratePainPoints: swAIGeneratePainPoints,
    swAIGenerateMessages: swAIGenerateMessages, swAIGenerateStylesFormats: swAIGenerateStylesFormats,
    finalizeSetupWizard: finalizeSetupWizard,

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
