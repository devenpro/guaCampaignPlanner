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
    html += '<p class="cp-setup-welcome-desc">Our AI-powered wizard guides you through building your personas, pain points, messages, styles, and first campaign — in about 5–10 minutes.</p>';

    html += '<div class="cp-setup-welcome-features">';
    html += '<div class="cp-setup-welcome-feat">' + icon('users') + ' Personas</div>';
    html += '<div class="cp-setup-welcome-feat">' + icon('crosshair') + ' Pain Points</div>';
    html += '<div class="cp-setup-welcome-feat">' + icon('message-square') + ' Messages</div>';
    html += '<div class="cp-setup-welcome-feat">' + icon('palette') + ' Styles &amp; Formats</div>';
    html += '<div class="cp-setup-welcome-feat">' + icon('sparkles') + ' AI-Generated</div>';
    html += '<div class="cp-setup-welcome-feat">' + icon('flag') + ' First Campaign</div>';
    html += '</div>';

    html += '<button class="cp-btn cp-btn-ai cp-btn-lg" data-action="open-setup-wizard">' + icon('sparkles') + ' Start Setup Wizard</button>';
    html += '<p class="cp-setup-welcome-note">Takes about 5–10 minutes &nbsp;&middot;&nbsp; You can skip any step</p>';

    html += '</div>'; // card
    html += '</div>'; // welcome
    html += '</div>'; // view
    return html;
  }

  function completeSetup() {
    var name = ($('#cpSetupName').val() || '').trim();
    var product = ($('#cpSetupProduct').val() || '').trim();
    var objective = ($('#cpSetupObjective').val() || '').trim();
    var instructions = ($('#cpSetupInstructions').val() || '').trim();

    if (!name) { toast('Please enter a workspace name', 'warning'); $('#cpSetupName').focus(); return; }
    if (!product) { toast('Please enter a product or service', 'warning'); $('#cpSetupProduct').focus(); return; }

    S.meta.workspace.name = name;
    if (!S.meta.workspace.created) S.meta.workspace.created = new Date().toISOString();
    S.meta.setup.product_name = product;
    S.meta.setup.objective = objective;
    S.meta.setup.custom_instructions = instructions;
    S.meta.setup.setup_complete = true;

    logActivity('setup_completed', '', '', name, 'Workspace setup completed: ' + product);
    buildMaps();
    syncToTextarea();

    // Re-render full app shell with sidebar now showing correctly
    $('#cpApp').html(renderAppShell());
    S.currentView = 'dashboard';
    renderCurrentView();
    toast('Workspace setup complete! Start building your creative library.', 'success', 5000);
  }

