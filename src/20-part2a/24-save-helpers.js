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

