  // ============================================================
  // SECTION 21: IMAGE PICKER (Reusable Modal)
  // ============================================================

  function renderImagePicker(selectedIds, onSelect) {
    selectedIds = selectedIds || [];
    var imgs = S.images || [];
    if (imgs.length === 0) {
      openModal('Select Images', '<div class="cp-empty-state cp-empty-state--compact"><p>No reference images available.</p><button class="cp-btn cp-btn-primary cp-btn-sm" data-action="upload-image">' + icon('upload') + ' Upload Images</button></div>', { footer: false, size: 'md' });
      return;
    }

    var html = '<div class="cp-img-picker">';
    html += '<p class="cp-text-muted" style="margin-bottom:var(--cp-space-3)">Click images to select. Selected images will be used as visual references for this recipe\'s creative brief and AI prompts.</p>';
    html += '<div class="cp-img-picker-grid">';
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      var isSel = selectedIds.indexOf(img.fid) > -1;
      var meta = (S.meta.reference_images && S.meta.reference_images[img.fid]) || {};
      html += '<div class="cp-img-picker-item' + (isSel ? ' cp-img-picker-item-selected' : '') + '" data-fid="' + esc(img.fid) + '">';
      html += '<input type="checkbox" data-fid="' + esc(img.fid) + '"' + (isSel ? ' checked' : '') + ' style="position:absolute;top:6px;left:6px;z-index:1">';
      html += '<img src="' + esc(img.url) + '" alt="' + esc(img.filename) + '">';
      html += '<div class="cp-img-picker-label">';
      if (meta.star) html += '<span style="color:#f59e0b">' + icon('star') + '</span> ';
      html += esc(truncate(img.filename, 16));
      if (meta.category) {
        var cat = (S.meta.image_categories || []).find(function(c) { return c.id === meta.category; });
        if (cat) html += '<div style="font-size:10px;color:var(--cp-text-muted)">' + esc(cat.label) + '</div>';
      }
      html += '</div>';
      html += '</div>';
    }
    html += '</div></div>';

    openModal('Select Reference Images', html, {
      size: 'lg', saveLabel: 'Select',
      onSave: function() {
        var selected = [];
        $('.cp-img-picker-item input:checked').each(function() { selected.push($(this).data('fid')); });
        if (onSelect) onSelect(selected);
        closeModal();
      }
    });

    // Toggle selection on click
    setTimeout(function() {
      $('.cp-img-picker-item').off('click.picker').on('click.picker', function(e) {
        if ($(e.target).is('input')) return;
        var $cb = $(this).find('input');
        $cb.prop('checked', !$cb.prop('checked'));
        $(this).toggleClass('cp-img-picker-item-selected', $cb.prop('checked'));
      });
    }, 50);
  }

