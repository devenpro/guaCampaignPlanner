  // ------------------------------------------------------------------
  // SECTION 9.4c: SETUP WIZARD — STEP RENDERERS (Phase 4: Steps 5 & 6)
  // ------------------------------------------------------------------

  // --- Step 5: Messages ---

  function renderSWStep5() {
    var ws       = setupWizardState;
    var messages = ws.messages || [];
    var generated = ws.stepGenerated[5];

    var html = _buildSWStepHeader(
      'Ad Messages',
      'Select the message angles and hooks that will shape your ads. AI generates options based on your personas and pain points.',
      'b'
    );

    // Generation bar
    html += '<div class="cp-sw-gen-bar">';
    html += '<textarea class="cp-textarea" id="swMessageContext" rows="2"';
    html += ' placeholder="Optional: focus on specific angles (e.g., emphasise ROI, use testimonial hooks)...">';
    html += esc(ws._messageContext || '');
    html += '</textarea>';
    html += '<button class="cp-btn cp-btn-ai" data-action="sw-ai-gen-messages"' + (ws.aiLoading ? ' disabled' : '') + '>';
    html += icon('sparkles') + ' ' + (generated ? 'Regenerate' : 'Generate with AI');
    html += '</button>';
    html += '</div>';

    if (ws.aiLoading) {
      html += _buildSWSkeletonCards(4);
    } else if (!messages.length) {
      html += '<div class="cp-sw-empty-state">';
      html += '<div class="cp-sw-empty-icon">' + icon('message-square') + '</div>';
      html += '<p>Click <strong>Generate with AI</strong> to create message angle suggestions based on your personas and pain points.</p>';
      html += '</div>';
    } else {
      var selCount = messages.filter(function(m) { return m._selected; }).length;
      html += '<div class="cp-sw-card-bottom">';
      html += '<span class="cp-sw-sel-count' + (selCount > 0 ? ' cp-sw-sel-count--ok' : '') + '">';
      html += selCount + ' of ' + messages.length + ' message' + (messages.length !== 1 ? 's' : '') + ' selected';
      html += '</span>';
      html += '</div>';
      html += '<div class="cp-sw-card-grid">';
      for (var i = 0; i < messages.length; i++) {
        html += _buildSWMessageCard(messages[i], i);
      }
      html += '</div>';
    }

    return html;
  }

  function _buildSWMessageCard(msg, idx) {
    var selected = msg._selected;
    var expanded = setupWizardState._expandedCards['m_' + idx];

    var stageLabel = { top: 'TOFU', mid: 'MOFU', bot: 'BOFU' }[msg.funnel_stage] || msg.funnel_stage || '';

    var html = '<div class="cp-sw-sel-card' + (selected ? ' cp-sw-sel-card--selected' : '') + '" data-idx="' + idx + '" role="button" tabindex="0" aria-pressed="' + (selected ? 'true' : 'false') + '">';
    html += '<div class="cp-sw-sel-card-check">' + (selected ? icon('check') : '') + '</div>';
    html += '<div class="cp-sw-sel-card-title">' + esc(msg.name || ('Message ' + (idx + 1))) + '</div>';
    if (msg.description) {
      html += '<div class="cp-sw-sel-card-body">' + esc(truncate(msg.description, 100)) + '</div>';
    }
    var tags = [];
    if (msg.theme)      tags.push(msg.theme);
    if (msg.hook_type)  tags.push(msg.hook_type);
    if (stageLabel)     tags.push(stageLabel);
    if (tags.length) {
      html += '<div class="cp-sw-sel-card-tags">';
      for (var t = 0; t < tags.length; t++) {
        html += '<span class="cp-sw-sel-card-tag">' + esc(tags[t]) + '</span>';
      }
      html += '</div>';
    }
    if (msg.body) {
      html += '<button class="cp-sw-sel-card-expand" data-action="sw-card-expand" data-key="m_' + idx + '">';
      html += icon(expanded ? 'chevron-up' : 'chevron-down') + ' ' + (expanded ? 'Hide copy' : 'View copy angle');
      html += '</button>';
      if (expanded) {
        html += '<div class="cp-sw-sel-card-expanded-body">';
        html += '<div class="cp-sw-sel-card-detail-label">Copy angle</div>';
        html += '<div class="cp-sw-sel-card-detail-value" style="white-space:pre-line">' + esc(msg.body) + '</div>';
        html += '</div>';
      }
    }
    html += '</div>';
    return html;
  }

  // --- Step 6: Styles & Formats ---

  function renderSWStep6() {
    var ws       = setupWizardState;
    var styles   = ws.styles  || [];
    var formats  = ws.formats || [];
    var generated = ws.stepGenerated[6];
    var bothEmpty = !styles.length && !formats.length;

    var html = _buildSWStepHeader(
      'Styles &amp; Formats',
      'Select the creative styles and ad formats that fit your brand. These define how your ads will look and where they\'ll run.',
      'b'
    );

    // Single generation bar for both styles and formats
    html += '<div class="cp-sw-gen-bar">';
    html += '<textarea class="cp-textarea" id="swStyleFormatContext" rows="2"';
    html += ' placeholder="Optional: specify platforms, formats or style direction (e.g., focus on TikTok-native, minimalist aesthetic)...">';
    html += esc(ws._styleFormatContext || '');
    html += '</textarea>';
    html += '<button class="cp-btn cp-btn-ai" data-action="sw-ai-gen-styles-formats"' + (ws.aiLoading ? ' disabled' : '') + '>';
    html += icon('sparkles') + ' ' + (generated ? 'Regenerate All' : 'Generate with AI');
    html += '</button>';
    html += '</div>';

    if (ws.aiLoading) {
      // Loading — show skeleton for both sections
      html += _buildSWSubSection('Styles', 0, 0);
      html += _buildSWSkeletonCards(3);
      html += _buildSWSubSection('Formats', 0, 0);
      html += _buildSWSkeletonCards(4);
    } else if (bothEmpty && !generated) {
      html += '<div class="cp-sw-empty-state">';
      html += '<div class="cp-sw-empty-icon">' + icon('palette') + '</div>';
      html += '<p>Click <strong>Generate with AI</strong> to create creative style and ad format suggestions tailored to your product and objectives.</p>';
      html += '</div>';
    } else {
      // Styles section
      var selStyles  = styles.filter(function(s) { return s._selected; }).length;
      var selFormats = formats.filter(function(f) { return f._selected; }).length;

      html += _buildSWSubSection('Styles', selStyles, styles.length);
      if (styles.length) {
        html += '<div class="cp-sw-card-grid">';
        for (var i = 0; i < styles.length; i++) html += _buildSWStyleCard(styles[i], i);
        html += '</div>';
      } else {
        html += '<div class="cp-sw-empty-state" style="padding:var(--cp-space-4) 0"><p>No styles generated — try regenerating above.</p></div>';
      }

      // Formats section
      html += _buildSWSubSection('Formats', selFormats, formats.length);
      if (formats.length) {
        html += '<div class="cp-sw-card-grid">';
        for (var j = 0; j < formats.length; j++) html += _buildSWFormatCard(formats[j], j);
        html += '</div>';
      } else {
        html += '<div class="cp-sw-empty-state" style="padding:var(--cp-space-4) 0"><p>No formats generated — try regenerating above.</p></div>';
      }
    }

    return html;
  }

  function _buildSWSubSection(title, selCount, total) {
    var html = '<div class="cp-sw-section-divider">';
    html += '<span class="cp-sw-section-divider-title">' + esc(title) + '</span>';
    if (total > 0) {
      html += '<span class="cp-sw-section-divider-count">' + selCount + ' / ' + total + ' selected</span>';
    }
    html += '<span class="cp-sw-section-divider-line"></span>';
    html += '</div>';
    return html;
  }

  function _buildSWStyleCard(style, idx) {
    var selected = style._selected;
    var html = '<div class="cp-sw-sel-card' + (selected ? ' cp-sw-sel-card--selected' : '') + '" data-idx="' + idx + '" data-card-type="style" role="button" tabindex="0" aria-pressed="' + (selected ? 'true' : 'false') + '">';
    html += '<div class="cp-sw-sel-card-check">' + (selected ? icon('check') : '') + '</div>';
    html += '<div class="cp-sw-sel-card-title">' + esc(style.name || ('Style ' + (idx + 1))) + '</div>';
    if (style.description) {
      html += '<div class="cp-sw-sel-card-body">' + esc(truncate(style.description, 120)) + '</div>';
    }
    html += '</div>';
    return html;
  }

  function _buildSWFormatCard(format, idx) {
    var selected = format._selected;
    var html = '<div class="cp-sw-sel-card' + (selected ? ' cp-sw-sel-card--selected' : '') + '" data-idx="' + idx + '" data-card-type="format" role="button" tabindex="0" aria-pressed="' + (selected ? 'true' : 'false') + '">';
    html += '<div class="cp-sw-sel-card-check">' + (selected ? icon('check') : '') + '</div>';
    html += '<div class="cp-sw-sel-card-title">' + esc(format.name || ('Format ' + (idx + 1))) + '</div>';
    if (format.description) {
      html += '<div class="cp-sw-sel-card-body">' + esc(truncate(format.description, 100)) + '</div>';
    }
    if (format.category) {
      html += '<div class="cp-sw-sel-card-tags"><span class="cp-sw-sel-card-tag">' + esc(format.category) + '</span></div>';
    }
    html += '</div>';
    return html;
  }

