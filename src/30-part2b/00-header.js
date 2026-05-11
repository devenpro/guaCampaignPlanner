/**
 * Campaign Planner v1.0 - Part 2B: AI & Advanced Features
 *
 * Multi-provider AI (LLMService), brand context (BrandService),
 * AI research panel component, inline AI assist, 11 AI action functions,
 * Research Lab view, Settings view (6 tabs), Images view, Import/Export.
 *
 * Registry: researchView, settingsView, imagesView, imagePicker,
 *   setupResearchEvents, setupSettingsEvents, setupImagesEvents
 *
 * Sections:
 *  1. Init & imports
 *  2. LLMService (multi-provider AI)
 *  3. BrandService (brand context from Drupal)
 *  4. AI response parsing
 *  5. Brand & recipe prompt helpers
 *  6. AI retry wrapper
 *  7. AI Research Panel component
 *  8. Inline AI Assist component
 *  9. AI Status Indicator
 * 10. AI — Persona research
 * 11. AI — Pain point research
 * 12. AI — Message research
 * 13. AI — Style & format research
 * 14. AI — Recipe content
 * 15. AI — Recipe media
 * 16. Research Lab view
 * 17. Settings view (6 tabs)
 * 18. Config CRUD & settings save
 * 19. Import/Export
 * 20. Images view
 * 21. Image picker (reusable modal)
 * 22. Events & keyboard shortcuts
 * 23. API exports
 *
 * @version 1.0.0
 */
(function($, Drupal) {
  'use strict';

