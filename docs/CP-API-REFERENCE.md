# Campaign Planner — API Reference

## Part 1 Exports (window._cp*)

### State & Core
| Export | Type | Description |
|--------|------|-------------|
| `_cpState` | Object | The S state object |
| `_cpRenderers` | Object | Renderer registry R |
| `_cpConstants` | Object | { STATUS_ORDER, ACTIVE_STATUSES, RECIPE_STATUSES, CAMPAIGN_STATUSES, PIPELINE_STEPS, MEDIA_TYPES, PRIORITY_LEVELS, CAMPAIGN_OBJECTIVES, DIMENSIONS, APP_VIEWS } |

### Navigation & Rendering
| Export | Signature | Description |
|--------|-----------|-------------|
| `_cpRender` | `render()` | Re-render current view |
| `_cpNavigate` | `navigate(viewKey, options?)` | Navigate to view |
| `_cpRenderCurrentView` | `renderCurrentView()` | Render just the content area |
| `_cpBuildMaps` | `buildMaps()` | Rebuild all entity lookup maps |
| `_cpSyncToTextarea` | `syncToTextarea()` | Write S.data/meta/activity to Drupal fields |

### Utilities
| Export | Signature | Description |
|--------|-----------|-------------|
| `_cpEsc` | `esc(str)` | HTML-escape string |
| `_cpIcon` | `icon(name, extraClass?)` | Font Awesome icon HTML |
| `_cpToast` | `toast(msg, type)` | Show toast notification (success/error/info/warning) |
| `_cpGenerateId` | `generateId(prefix)` | Generate unique ID |
| `_cpDeepClone` | `deepClone(obj)` | JSON deep clone |
| `_cpFormatDate` | `formatDate(iso)` | Format ISO date |
| `_cpFormatRelativeTime` | `formatRelativeTime(iso)` | "2 hours ago" |
| `_cpFormatDateShort` | `formatDateShort(iso)` | "Mar 15" |
| `_cpTruncate` | `truncate(str, len)` | Truncate with ellipsis |
| `_cpFormatNumber` | `formatNumber(n)` | "1.2K" format |
| `_cpStripHtml` | `stripHtml(html)` | Remove HTML tags |
| `_cpCountWords` | `countWords(str)` | Word count |
| `_cpCountChars` | `countChars(str)` | Character count |
| `_cpDebounce` | `debounce(fn, ms)` | Debounce function |
| `_cpUpdateSaveStatus` | `updateSaveStatus(status)` | Update save indicator |
| `_cpLogActivity` | `logActivity(type, entityType, id, title, description)` | Log activity |

### Badge Helpers
| Export | Signature |
|--------|-----------|
| `_cpBadge` | `badge(text, color)` |
| `_cpRecipeStatusBadge` | `recipeStatusBadge(status)` |
| `_cpCampaignStatusBadge` | `campaignStatusBadge(status)` |
| `_cpPriorityBadge` | `priorityBadge(priority)` |
| `_cpFunnelBadge` | `funnelBadge(funnelId)` |
| `_cpDimensionBadge` | `dimensionBadge(dimKey, entity)` |
| `_cpMediaTypeBadge` | `mediaTypeBadge(mediaType)` |
| `_cpHookTypeBadge` | `hookTypeBadge(hookType)` |
| `_cpProgressBar` | `progressBar(pct, color?)` |

### CRUD
| Export | Signature | Description |
|--------|-----------|-------------|
| `_cpCreateEntity` | `createEntity(type, data?)` | Create entity, returns new entity |
| `_cpDeleteEntity` | `deleteEntity(type, id)` | Delete entity |
| `_cpSaveEntityField` | `saveEntityField(type, id, field, value)` | Update single field |
| `_cpDuplicateEntity` | `duplicateEntity(type, id)` | Clone entity with new ID |
| `_cpEvaluateAutoStatus` | `evaluateAutoStatus(recipe)` | Calculate what status should be |
| `_cpMaybeAdvanceRecipeStatus` | `maybeAdvanceRecipeStatus(recipe, reason)` | Auto-advance status (forward only) |

### Entity Getters
| Export | Returns |
|--------|---------|
| `_cpGetAllPersonas()` | All personas array |
| `_cpGetAllMessages()` | All messages array |
| `_cpGetAllStyles()` | All styles array |
| `_cpGetAllFormats()` | All formats array |
| `_cpGetAllCategories()` | All persona categories |
| `_cpGetAllPainPoints()` | All pain points |
| `_cpGetAllCampaigns()` | All campaigns |
| `_cpGetAllTags()` | All tags |
| `_cpGetPersona(id)` | Single persona |
| `_cpGetMessage(id)` | Single message |
| `_cpGetStyle(id)` | Single style |
| `_cpGetFormat(id)` | Single format |
| `_cpGetCategory(id)` | Single category |
| `_cpGetCampaign(id)` | Single campaign |
| `_cpGetTag(id)` | Single tag |
| `_cpGetPainPoint(id)` | Single pain point |
| `_cpGetFunnelStage(id)` | Single funnel stage |
| `_cpGetPersonaPainPoints(persona)` | Pain points for persona |
| `_cpGetFilteredRecipes()` | Recipes with current filters applied |
| `_cpGetRecipe(id)` | Single recipe |
| `_cpGetRecipesByCampaign(campId)` | Recipes in campaign |
| `_cpGetRecipeCompletionPct(recipe)` | 0-100 completion % |

### Other
| Export | Description |
|--------|-------------|
| `_cpParseImageField()` | Re-scan Drupal image field |
| `_cpIsSetupComplete()` | Check if initial setup is done |
| `_cpRenderCampaignListItem(camp)` | Render campaign list item HTML |

---

## Part 2A Exports (window._cpPart2A)

### Modal System
`openModal(title, html, options)`, `closeModal()`, `openConfirmDialog(options)`, `closeConfirmDialog()`, `collectModalFields()`, `collectFunnelChips()`

### CRUD Modals
`openCategoryModal(id?)`, `confirmDeleteCategory(id)`, `openPersonaModal(id?)`, `confirmDeletePersona(id)`, `openPainPointModal(id?)`, `confirmDeletePainPoint(id)`, `openMessageModal(id?)`, `confirmDeleteMessage(id)`, `openStyleModal(id?)`, `confirmDeleteStyle(id)`, `openFormatModal(id?)`, `confirmDeleteFormat(id)`, `openCampaignModal(id?)`, `confirmDeleteCampaign(id)`, `openTagModal(id?)`, `confirmDeleteTag(id)`

### Pipeline
`getEffectiveHook(recipe)`, `buildCompletionChecks(recipe)`, `openDimensionPicker(recipe, dimKey)`, `autoUpdateRecipeTitle(recipe)`, `setRecipeStatus(recipeId, status)`, `addScene(recipeId)`, `deleteScene(recipeId, sceneId)`, `addScriptRow(recipeId)`, `addVariant(recipeId)`, `removeVariant(recipeId, variantId)`, `getSelectedRecipe()`

### Mix & Match
`openMixerModal(mode)`, `createRecipeFromMixer(data)`, `batchGenerateRecipes(combos)`

### Other
`snapshot(label)`, `undo()`, `redo()`, `renderTagInput(entityType, entityId, tags)`, `renderRecipeAIBar(actionId, recipeId, label, icon?)`, `openCampaignWizard()`, `renderHookEditRow(hook, index)`

---

## Part 2B Exports (window._cpPart2B)

### Services
`LLMService` (object), `BrandService` (object)

### AI Utilities
`parseJSON(text)`, `callAIWithRetry(prompt, success, error, actionId, system)`, `brandSnippet(type)`, `recipeContextSnippet(recipe)`, `entityContextSnippet(entityType, entity)`

### Components
`renderAIResearchPanelBody(stateKey)`, `renderInlineAIAssist(fieldId, value, actionId)`, `renderInlinePicker(actionId)` (alias for LLMService.renderInlinePicker)

### AI Functions (15)
`aiResearchPersonas(customInput)`, `aiResearchPainPoints(personaId, customInput)`, `aiResearchMessages(customInput)`, `aiResearchStyles(customInput)`, `aiResearchFormats(customInput)`, `aiGenerateHook(recipeId, instructions)`, `aiWriteContent(recipeId, instructions)`, `aiImproveContent(recipeId, instructions)`, `aiGenerateBrief(recipeId, instructions)`, `aiGenerateImagePrompt(recipeId, instructions)`, `aiGenerateBlueprint(recipeId, instructions)`, `aiGenerateScript(recipeId, instructions)`, `aiSuggestCampaignRecipes(campaignId)`, `aiGenerateCampaignBrief(campaignId)`, `aiAnalyzeCampaignGaps(campaignId)`, `showAIPreview(options, onSelect, config)`

### Status & Config
`updateAIStatusIndicator()`, `testAIConnection()`, `saveImageMeta()`, `triggerImageUpload()`

---

## LLMService Methods
| Method | Description |
|--------|-------------|
| `init()` | Parse config from DOM |
| `isConfigured()` | Any active providers? |
| `getActiveProviders()` | Array of provider objects |
| `getActiveModels(pid)` | Models for provider |
| `getDefault()` | Default provider/model selection |
| `resolveSelection(actionId)` | Resolve per-action or last-used selection |
| `renderInlinePicker(actionId)` | HTML for provider/model dropdowns |
| `callAI(prompt, success, error, actionId, system)` | Make API call |
| `savePreference(actionId, pid, mid)` | Save model preference |

## BrandService Methods
| Method | Description |
|--------|-------------|
| `init()` | Parse brand data from DOM |
| `isConfigured()` | Brand data available? |
| `getCore()` | Core brand data |
| `getContent()` | Content/writing style data |
| `getSeo()` | SEO data |
| `getVideo()` | Video/content pillars data |
| `getAudience()` | Audience object |
| `getForbiddenWords()` | Forbidden words array |
| `getDos()` / `getDonts()` | Brand guidelines |
| `getSystemPrompt(contextType)` | Full AI system prompt with brand context |
| `getBrandDesignPrompt()` | Visual identity prompt for image AI |
| `getSetupContext()` | Workspace setup context string |
| `autoPopulateBrandDesign()` | Copy brand colors to design settings |
