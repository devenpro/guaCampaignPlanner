  // ------------------------------------------------------------------
  // SECTION 9.4c: SETUP WIZARD — STAGE 3 (Messages) + STAGE 4 (Styles & Formats)
  // ------------------------------------------------------------------

  // --- Stage 3: Messages ---

  function renderSWStep3() {
    var ws       = setupWizardState;
    var messages = ws.messages || [];
    var generated = ws.stepGenerated.messages;

    var html = _buildSWStepHeader(
      'Ad Messages',
      'Select the message angles and hooks that will shape your ads. AI generates options based on your personas and pain points.',
      'b'
    );

    html += _swAIErrorBanner(3);

    html += '<div class="cp-sw-gen-bar">';
    html += '<textarea class="cp-textarea" id="swMessageContext" rows="2"';
    html += ' placeholder="Optional: focus on specific angles (e.g., emphasise ROI, use testimonial hooks)...">';
    html += esc(ws._messageContext || '');
    html += '</textarea>';
    html += _swGenButton('sw-ai-gen-messages', generated, ws.aiLoading);
    html += '</div>';

    if (ws.aiLoading) {
      html += _buildSWSkeletonCards(4);
    } else if (generated && !messages.length) {
      html += _swAIEmptyAfterGenBanner('messages', ws._messageContext || '');
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
      html += _swLastGeneratedLabel('messages');
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
    var funnelSlug = msg.funnel_stage ? ('--funnel-' + esc(msg.funnel_stage)) : '';

    var html = '<div class="cp-sw-sel-card' + (selected ? ' cp-sw-sel-card--selected' : '') + '" data-idx="' + idx + '" data-card-type="message" role="button" tabindex="0" aria-pressed="' + (selected ? 'true' : 'false') + '">';
    html += '<div class="cp-sw-sel-card-check">' + (selected ? icon('check') : '') + '</div>';
    html += '<div class="cp-sw-sel-card-title">' + esc(msg.name || ('Message ' + (idx + 1))) + '</div>';
    if (msg.description) {
      html += '<div class="cp-sw-sel-card-body">' + esc(truncate(msg.description, 100)) + '</div>';
    }
    if (msg.body) {
      html += '<blockquote class="cp-sw-msg-body">' + esc(truncate(msg.body, 160)) + '</blockquote>';
    }
    var tags = [];
    if (msg.theme)      tags.push({ label: msg.theme,     cls: 'cp-sw-sel-card-tag--theme' });
    if (msg.hook_type)  tags.push({ label: msg.hook_type, cls: 'cp-sw-sel-card-tag--hook' });
    if (stageLabel)     tags.push({ label: stageLabel,    cls: 'cp-sw-sel-card-tag--funnel cp-sw-sel-card-tag' + funnelSlug });
    if (tags.length) {
      html += '<div class="cp-sw-sel-card-tags">';
      for (var t = 0; t < tags.length; t++) {
        html += '<span class="cp-sw-sel-card-tag ' + esc(tags[t].cls) + '">' + esc(tags[t].label) + '</span>';
      }
      html += '</div>';
    }
    if (msg.body && msg.body.length > 160) {
      html += '<button class="cp-sw-sel-card-expand" data-action="sw-card-expand" data-key="m_' + idx + '">';
      html += icon(expanded ? 'chevron-up' : 'chevron-down') + ' ' + (expanded ? 'Hide full copy' : 'Show full copy');
      html += '</button>';
      if (expanded) {
        html += '<div class="cp-sw-sel-card-expanded-body">';
        html += '<div class="cp-sw-sel-card-detail-label">Full copy angle</div>';
        html += '<div class="cp-sw-sel-card-detail-value" style="white-space:pre-line">' + esc(msg.body) + '</div>';
        html += '</div>';
      }
    }
    html += '</div>';
    return html;
  }

  // --- Stage 4: Styles & Formats ---

  function renderSWStep4() {
    var ws       = setupWizardState;
    var styles   = ws.styles  || [];
    var formats  = ws.formats || [];
    var generated = ws.stepGenerated.stylesFormats;
    var bothEmpty = !styles.length && !formats.length;

    var html = _buildSWStepHeader(
      'Styles &amp; Formats',
      'Select the creative styles and ad formats that fit your brand. These define how your ads will look and where they\'ll run.',
      'b'
    );

    html += _swAIErrorBanner(4);

    html += '<div class="cp-sw-gen-bar">';
    html += '<textarea class="cp-textarea" id="swStyleFormatContext" rows="2"';
    html += ' placeholder="Optional: specify platforms, formats or style direction (e.g., focus on TikTok-native, minimalist aesthetic)...">';
    html += esc(ws._styleFormatContext || '');
    html += '</textarea>';
    html += _swGenButton('sw-ai-gen-styles-formats', generated, ws.aiLoading);
    html += '</div>';

    if (ws.aiLoading) {
      html += _buildSWSubSection('Styles', 0, 0);
      html += _buildSWSkeletonCards(3);
      html += _buildSWSubSection('Formats', 0, 0);
      html += _buildSWSkeletonCards(4);
    } else if (generated && bothEmpty) {
      html += _swAIEmptyAfterGenBanner('styles or formats', ws._styleFormatContext || '');
    } else if (bothEmpty && !generated) {
      html += '<div class="cp-sw-empty-state">';
      html += '<div class="cp-sw-empty-icon">' + icon('palette') + '</div>';
      html += '<p>Click <strong>Generate with AI</strong> to create creative style and ad format suggestions tailored to your product and objectives.</p>';
      html += '</div>';
    } else {
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

