  // ============================================================
  // SECTION 2: MODAL SYSTEM
  // ============================================================

  var currentModal = null;

  function openModal(title, content, options) {
    options = options || {};
    closeModal();
    var size = options.size || 'md';
    var html = '<div class="cp-modal-backdrop"><div class="cp-modal cp-modal-' + size + '">';
    html += '<div class="cp-modal-header"><h3>' + (options.titleIcon ? icon(options.titleIcon) + ' ' : '') + esc(title) + '</h3>';
    html += '<button class="cp-btn-icon cp-modal-close" data-action="close-modal">' + icon('x') + '</button></div>';
    html += '<div class="cp-modal-body">' + content + '</div>';
    if (options.footer !== false) {
      html += '<div class="cp-modal-footer">';
      html += '<button class="cp-btn cp-btn-outline" data-action="close-modal">Cancel</button>';
      html += '<button class="cp-btn ' + (options.danger ? 'cp-btn-danger' : options.ai ? 'cp-btn-ai' : 'cp-btn-primary') + '" data-action="modal-save">' + (options.saveLabel || 'Save') + '</button>';
      html += '</div>';
    }
    html += '</div></div>';
    $('body').append(html);
    currentModal = options;
    setTimeout(function() { $('.cp-modal-backdrop').addClass('cp-modal-visible'); }, 10);
    // Focus first input
    setTimeout(function() { $('.cp-modal-body input:visible, .cp-modal-body textarea:visible').first().focus(); }, 100);
  }

  function closeModal() {
    $('.cp-modal-backdrop').remove();
    currentModal = null;
  }

  function openConfirmDialog(opts) {
    var html = '<div class="cp-confirm-backdrop"><div class="cp-confirm-dialog">';
    html += '<h3>' + esc(opts.title || 'Confirm') + '</h3>';
    html += '<p>' + esc(opts.message || 'Are you sure?') + '</p>';
    html += '<div class="cp-confirm-actions">';
    html += '<button class="cp-btn cp-btn-outline" data-action="confirm-cancel">Cancel</button>';
    html += '<button class="cp-btn ' + (opts.danger ? 'cp-btn-danger' : 'cp-btn-primary') + '" data-action="confirm-ok">' + esc(opts.confirmLabel || 'Confirm') + '</button>';
    html += '</div></div></div>';
    $('body').append(html);
    $(document).off('click.cp2a-cok').on('click.cp2a-cok', '[data-action="confirm-ok"]', function() {
      closeConfirmDialog();
      if (opts.onConfirm) opts.onConfirm();
    });
    $(document).off('click.cp2a-ccn').on('click.cp2a-ccn', '[data-action="confirm-cancel"]', function() {
      closeConfirmDialog();
    });
  }

  function closeConfirmDialog() {
    $('.cp-confirm-backdrop').remove();
    $(document).off('click.cp2a-cok click.cp2a-ccn');
  }

  function collectModalFields() {
    var data = {};
    $('.cp-modal-body [data-field]').each(function() {
      var $f = $(this);
      var field = $f.data('field');
      if ($f.is(':checkbox')) {
        data[field] = $f.is(':checked');
      } else if ($f.is('select[multiple]')) {
        data[field] = $f.val() || [];
      } else {
        data[field] = $f.val();
      }
    });
    return data;
  }

  // Collect funnel stage chip selections
  function collectFunnelChips() {
    var selected = [];
    $('.cp-modal-body .cp-funnel-chip-active').each(function() {
      selected.push($(this).data('stage-id'));
    });
    return selected;
  }

