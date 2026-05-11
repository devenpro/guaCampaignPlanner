/**
 * Campaign Planner v1.0 - Part 1: Core Engine
 *
 * Meta ad creative planning app with 4-dimension creative diversity,
 * personas, messages, styles, visual formats, recipe pipeline, campaigns.
 *
 * Sections:
 *  1. Constants (15 objects)
 *  2. State object
 *  3. Initialization
 *  4. Migration & defaults
 *  5. Map builders
 *  6. Navigation
 *  7. Utilities (icons 100+, badges, formatters, getters)
 *  8. App shell (header, sidebar, 11 nav items) — Phase 1B
 *  9. Setup view — Phase 1B
 * 10. Dashboard view — Phase 1B
 * 11. Personas view — Phase 1C
 * 12. Messages view — Phase 1C
 * 13. Styles view — Phase 1C
 * 14. Recipes view (list) — Phase 1D
 * 15. Campaigns view — Phase 1D
 * 16. Calendar view — Phase 1D
 * 17. Activity view — Phase 1D
 * 18. Placeholder views — Phase 1D
 * 19. Filtering & sorting — Phase 1E
 * 20. Event handlers — Phase 1E
 * 21. CRUD helpers — Phase 1E
 * 22. Sync, save, toast, auto-status — Phase 1E
 * 23. API exports — Phase 1E
 *
 * @version 1.0.0
 */
(function($, Drupal) {
  'use strict';

  window._cpRenderers = window._cpRenderers || {};

