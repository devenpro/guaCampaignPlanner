  // ============================================================
  // SECTION 21A: SETTINGS — META v2 TAB
  // ============================================================
  //
  // Workspace-level Meta defaults + migration controls.

  function renderMetaV2Settings() {
    var setup = (S.meta && S.meta.setup) || {};
    var defaults = (S.meta && S.meta.meta_defaults) || {};
    var hasLegacy = !!(S.meta && S.meta.legacy_backup);
    var legacyCount = hasLegacy ? ((S.meta.legacy_backup.campaigns || []).length + ' campaigns + ' + (S.meta.legacy_backup.recipes || []).length + ' recipes') : '';
    var oldCamps = (S.data.campaigns || []).length;
    var oldRecipes = (S.data.recipes || []).length;
    var canMigrate = (oldCamps + oldRecipes) > 0;

    var html = '<div class="cp-settings-panel">';

    // --- Feature flag toggle ---
    html += '<div class="cp-settings-section">';
    html += '<h3>' + icon('flask') + ' Meta v2 mode</h3>';
    html += '<p class="cp-text-muted">The Meta v2 hierarchy (Campaign → Ad Set → Ad) is the new working surface for this app. When enabled, the legacy Recipes and Campaigns (v1) sidebar entries are hidden and the new Campaigns workspace takes over.</p>';
    html += '<label class="cp-form-toggle">';
    html += '<input type="checkbox" class="cp-v2-toggle-flag"' + (setup.meta_v2 ? ' checked' : '') + '>';
    html += '<span>Enable Meta v2 mode</span></label>';
    html += '</div>';

    // --- Migration wizard CTA ---
    html += '<div class="cp-settings-section">';
    html += '<h3>' + icon('wand-magic') + ' Migrate legacy data</h3>';
    if (setup.migrated_to_v2) {
      html += '<p class="cp-text-muted">This workspace has been migrated.</p>';
      if (hasLegacy) {
        html += '<p class="cp-text-muted">Legacy backup: ' + esc(legacyCount) + ' (created ' + formatRelativeTime(S.meta.legacy_backup.timestamp) + ').</p>';
        html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="v2-discard-legacy">' + icon('trash') + ' Discard legacy backup</button>';
      }
      html += '<button class="cp-btn cp-btn-outline" data-action="v2-open-migration" style="margin-left:8px">' + icon('refresh') + ' Run migration again</button>';
    } else if (canMigrate) {
      html += '<p>You have ' + oldCamps + ' legacy campaign' + (oldCamps !== 1 ? 's' : '') + ' and ' + oldRecipes + ' recipe' + (oldRecipes !== 1 ? 's' : '') + ' to migrate.</p>';
      html += '<button class="cp-btn cp-btn-ai" data-action="v2-open-migration">' + icon('wand-magic') + ' Start migration wizard</button>';
    } else {
      html += '<p class="cp-text-muted">No legacy data to migrate. You can enable Meta v2 directly above.</p>';
    }
    html += '</div>';

    // --- Meta defaults ---
    html += '<div class="cp-settings-section">';
    html += '<h3>' + icon('gear') + ' Workspace Meta defaults</h3>';
    html += '<p class="cp-text-muted">Used as defaults for new Campaigns / Ad Sets / Ads and on export.</p>';
    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Facebook Page ID</label>';
    html += '<input type="text" class="cp-input cp-v2-defaults-field" data-key="page_id" value="' + esc(defaults.page_id || '') + '" placeholder="123456789012345">';
    html += '</div><div class="cp-form-half"><label>Instagram Actor ID</label>';
    html += '<input type="text" class="cp-input cp-v2-defaults-field" data-key="instagram_actor_id" value="' + esc(defaults.instagram_actor_id || '') + '" placeholder="17841...">';
    html += '</div></div>';
    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Pixel ID</label>';
    html += '<input type="text" class="cp-input cp-v2-defaults-field" data-key="pixel_id" value="' + esc(defaults.pixel_id || '') + '" placeholder="123456789">';
    html += '</div><div class="cp-form-half"><label>Business Manager ID</label>';
    html += '<input type="text" class="cp-input cp-v2-defaults-field" data-key="business_manager_id" value="' + esc(defaults.business_manager_id || '') + '" placeholder="987654321">';
    html += '</div></div>';
    html += '<div class="cp-form-row"><div class="cp-form-half"><label>Attribution window</label>';
    html += '<select class="cp-select cp-v2-defaults-field" data-key="attribution_window">';
    for (var ak in Constants.META_ATTRIBUTION_SETTINGS) {
      html += '<option value="' + ak + '"' + (defaults.attribution_window === ak ? ' selected' : '') + '>' + esc(Constants.META_ATTRIBUTION_SETTINGS[ak].label) + '</option>';
    }
    html += '</select></div><div class="cp-form-half"><label>Currency</label>';
    html += '<select class="cp-select cp-v2-defaults-field" data-key="currency">';
    ['USD','EUR','GBP','INR','AUD','CAD','SGD','AED','JPY'].forEach(function(cc) {
      html += '<option value="' + cc + '"' + (defaults.currency === cc ? ' selected' : '') + '>' + cc + '</option>';
    });
    html += '</select></div></div>';

    html += '<div class="cp-form-row" style="margin-top:8px"><div class="cp-form-grow"><label>Time zone</label>';
    html += '<select class="cp-select cp-v2-defaults-field" data-key="time_zone">';
    ['UTC','America/New_York','America/Chicago','America/Los_Angeles','Europe/London','Europe/Paris','Asia/Tokyo','Asia/Kolkata','Asia/Dubai','Asia/Singapore'].forEach(function(tz) {
      html += '<option value="' + tz + '"' + (defaults.time_zone === tz ? ' selected' : '') + '>' + tz + '</option>';
    });
    html += '</select></div></div>';
    html += '</div>';

    html += '</div>';
    return html;
  }
