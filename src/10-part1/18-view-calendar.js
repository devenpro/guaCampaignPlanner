  // ============================================================
  // SECTION 16: CALENDAR VIEW
  // ============================================================

  function renderCalendarView() {
    var now = new Date();
    if (S.calendarYear === null) S.calendarYear = now.getFullYear();
    if (S.calendarMonth === null) S.calendarMonth = now.getMonth();

    var year = S.calendarYear;
    var month = S.calendarMonth;
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    var mode = S.calendarMode || 'month';
    var calFilter = S.calendarFilters || {};

    // Collect recipes with due dates (apply campaign filter)
    var recipesWithDates = (S.data.recipes || []).filter(function(r) {
      if (!r.due_date) return false;
      if (calFilter.campaign && r.campaign_id !== calFilter.campaign) return false;
      if (calFilter.status && r.status !== calFilter.status) return false;
      return true;
    });
    var recipesByDate = {};
    recipesWithDates.forEach(function(r) {
      recipesByDate[r.due_date] = recipesByDate[r.due_date] || [];
      recipesByDate[r.due_date].push(r);
    });

    // Collect campaigns with date ranges
    var campaignsWithDates = (S.data.campaigns || []).filter(function(c) { return c.date_start && c.date_end; });
    if (calFilter.campaign) campaignsWithDates = campaignsWithDates.filter(function(c) { return c.id === calFilter.campaign; });

    var html = '<div class="cp-view cp-view-calendar">';

    // Header
    html += '<div class="cp-view-header"><div class="cp-view-header-left">';
    html += '<h1>' + icon('calendar') + ' Calendar</h1>';
    html += '</div>';
    html += '<div class="cp-view-header-right">';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="cal-prev">' + icon('chevron-left') + '</button>';
    html += '<span class="cp-cal-title">' + monthNames[month] + ' ' + year + '</span>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="cal-next">' + icon('chevron-right') + '</button>';
    html += '<button class="cp-btn cp-btn-outline cp-btn-sm" data-action="cal-today">Today</button>';
    html += '</div></div>';

    // Filter bar
    html += '<div class="cp-view-toolbar">';
    var camps = getAllCampaigns();
    if (camps.length > 0) {
      html += '<select class="cp-select cp-select-sm" id="cpCalCampaignFilter"><option value="">All Campaigns</option>';
      for (var cfi = 0; cfi < camps.length; cfi++) html += '<option value="' + esc(camps[cfi].id) + '"' + (calFilter.campaign === camps[cfi].id ? ' selected' : '') + '>' + esc(camps[cfi].name) + '</option>';
      html += '</select>';
    }
    html += '<select class="cp-select cp-select-sm" id="cpCalStatusFilter"><option value="">All Statuses</option>';
    for (var csk in RECIPE_STATUSES) html += '<option value="' + csk + '"' + (calFilter.status === csk ? ' selected' : '') + '>' + RECIPE_STATUSES[csk].label + '</option>';
    html += '</select>';
    html += '<span class="cp-text-muted" style="font-size:12px">' + recipesWithDates.length + ' recipe' + (recipesWithDates.length !== 1 ? 's' : '') + ' with due dates</span>';
    html += '</div>';

    // Campaign bars with phase segments
    if (campaignsWithDates.length > 0) {
      html += '<div class="cp-cal-campaign-bars">';
      for (var ci = 0; ci < campaignsWithDates.length; ci++) {
        var camp = campaignsWithDates[ci];
        var cst = CAMPAIGN_STATUSES[camp.status] || { color: '#80868b' };
        html += '<div class="cp-cal-campaign-row" data-action="go-to-campaign" data-id="' + esc(camp.id) + '" style="cursor:pointer">';
        html += '<span class="cp-cal-campaign-name" style="color:' + cst.color + '">' + icon('bullhorn') + ' ' + esc(truncate(camp.name, 16)) + '</span>';
        html += '<div class="cp-cal-campaign-bar-track">';
        var monthStart = new Date(year, month, 1);
        var monthEnd = new Date(year, month + 1, 0);
        var cStart = new Date(camp.date_start);
        var cEnd = new Date(camp.date_end);
        var daysInMonth = monthEnd.getDate();
        var barLeft = Math.max(0, Math.floor(((cStart - monthStart) / (1000 * 60 * 60 * 24)) / daysInMonth * 100));
        var barRight = Math.max(0, 100 - Math.ceil(((cEnd - monthStart) / (1000 * 60 * 60 * 24) + 1) / daysInMonth * 100));
        if (cEnd < monthStart || cStart > monthEnd) { barLeft = 0; barRight = 100; }
        html += '<div class="cp-cal-campaign-bar" style="left:' + barLeft + '%;right:' + barRight + '%;background:' + cst.color + '20;border-color:' + cst.color + '50"></div>';
        // Phase segments
        var phases = camp.phases || [];
        var phColors = ['#9334e9', '#1a73e8', '#0d904f', '#e37400', '#d93025'];
        for (var phi = 0; phi < phases.length; phi++) {
          var ph = phases[phi];
          if (!ph.date_start || !ph.date_end) continue;
          var phStart = new Date(ph.date_start);
          var phEnd = new Date(ph.date_end);
          if (phEnd < monthStart || phStart > monthEnd) continue;
          var phLeft = Math.max(0, Math.floor(((phStart - monthStart) / (1000 * 60 * 60 * 24)) / daysInMonth * 100));
          var phRight = Math.max(0, 100 - Math.ceil(((phEnd - monthStart) / (1000 * 60 * 60 * 24) + 1) / daysInMonth * 100));
          var phColor = phColors[phi % phColors.length];
          html += '<div class="cp-cal-phase-marker" style="left:' + phLeft + '%;right:' + phRight + '%;background:' + phColor + '35;border-bottom:2px solid ' + phColor + '" title="' + esc(ph.name || 'Phase ' + (phi + 1)) + '"></div>';
        }
        html += '</div></div>';
      }
      html += '</div>';
    }

    // Calendar grid
    html += renderCalMonthGrid(year, month, dayNames, recipesByDate, now);

    html += '</div>';
    return html;
  }

  function renderCalMonthGrid(year, month, dayNames, recipesByDate, now) {
    var firstDay = new Date(year, month, 1);
    var startDow = (firstDay.getDay() + 6) % 7;
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var today = now.getDate();
    var todayMonth = now.getMonth();
    var todayYear = now.getFullYear();

    var html = '<div class="cp-calendar-grid">';
    for (var dh = 0; dh < 7; dh++) html += '<div class="cp-cal-header">' + dayNames[dh] + '</div>';

    var totalCells = Math.ceil((startDow + daysInMonth) / 7) * 7;
    for (var c = 0; c < totalCells; c++) {
      var dayNum = c - startDow + 1;
      var isValid = dayNum >= 1 && dayNum <= daysInMonth;
      var isToday = isValid && dayNum === today && month === todayMonth && year === todayYear;
      var dateStr = isValid ? year + '-' + String(month + 1).padStart(2, '0') + '-' + String(dayNum).padStart(2, '0') : '';
      var dayRecipes = isValid && recipesByDate[dateStr] ? recipesByDate[dateStr] : [];

      html += '<div class="cp-cal-day' + (isValid ? '' : ' cp-cal-day-empty') + (isToday ? ' cp-cal-day-today' : '') + '">';
      if (isValid) {
        html += '<div class="cp-cal-day-header"><span class="cp-cal-day-num">' + dayNum + '</span>';
        if (dayRecipes.length > 0) html += '<span class="cp-cal-day-count">' + dayRecipes.length + '</span>';
        html += '</div>';
        for (var dri = 0; dri < Math.min(dayRecipes.length, 3); dri++) {
          var dr = dayRecipes[dri];
          var drSt = RECIPE_STATUSES[dr.status] || { color: '#80868b' };
          html += '<div class="cp-cal-recipe-chip" style="background:' + drSt.color + '15;color:' + drSt.color + '" data-action="select-recipe" data-id="' + esc(dr.id) + '">';
          html += '<span class="cp-cal-chip-title">' + esc(truncate(dr.title, 14)) + '</span>';
          html += '</div>';
        }
        if (dayRecipes.length > 3) html += '<div class="cp-cal-more">+' + (dayRecipes.length - 3) + ' more</div>';
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

