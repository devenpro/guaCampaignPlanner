  // ============================================================
  // SECTION 9: SETUP VIEW
  // ============================================================

  function renderSetupView() {
    var brandName = (S.brand && S.brand.identity && S.brand.identity.name) ? S.brand.identity.name : '';

    var html = '<div class="cp-view cp-view-setup">';
    html += '<div class="cp-setup-welcome">';
    html += '<div class="cp-setup-welcome-card">';

    html += '<div class="cp-setup-welcome-icon">' + icon('rocket') + '</div>';
    html += '<h1 class="cp-setup-welcome-title">Welcome to Campaign Planner</h1>';
    if (brandName) {
      html += '<p class="cp-setup-welcome-sub">Setting up for <strong>' + esc(brandName) + '</strong></p>';
    }
    html += '<p class="cp-setup-welcome-desc">The Setup Wizard should already be open. If you don\'t see it, refresh the page — or open <strong>Settings → Workspace → Setup wizard</strong> to re-run it.</p>';

    html += '<div class="cp-setup-welcome-features">';
    html += '<div class="cp-setup-welcome-feat">' + icon('users') + ' Personas</div>';
    html += '<div class="cp-setup-welcome-feat">' + icon('crosshair') + ' Pain Points</div>';
    html += '<div class="cp-setup-welcome-feat">' + icon('message-square') + ' Messages</div>';
    html += '<div class="cp-setup-welcome-feat">' + icon('palette') + ' Styles &amp; Formats</div>';
    html += '<div class="cp-setup-welcome-feat">' + icon('sparkles') + ' AI-Generated</div>';
    html += '<div class="cp-setup-welcome-feat">' + icon('flag') + ' First Campaign</div>';
    html += '</div>';

    html += '</div>'; // card
    html += '</div>'; // welcome
    html += '</div>'; // view
    return html;
  }

