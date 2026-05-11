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

