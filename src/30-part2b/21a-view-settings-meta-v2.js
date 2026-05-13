  // ============================================================
  // SECTION 21A: SETTINGS — META v2 TAB
  // ============================================================
  //
  // Workspace-level Meta defaults (Page, Pixel, attribution, currency, etc.).

  function renderMetaV2Settings() {
    var defaults = (S.meta && S.meta.meta_defaults) || {};

    var html = '<div class="cp-settings-panel">';

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
