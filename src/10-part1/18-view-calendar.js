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
    var calFilter = S.calendarFilters || {};

    // Collect Ads with due dates (apply campaign + pipeline status filter)
    var ads = (S.data.ads || []).filter(function(a) {
      if (!a.due_date) return false;
      if (calFilter.status && a.pipeline_status !== calFilter.status) return false;
      if (calFilter.campaign) {
        var aSet = S.adSetMap[a.ad_set_id];
        if (!aSet || aSet.campaign_id !== calFilter.campaign) return false;
      }
      return true;
    });
    var adsByDate = {};
    ads.forEach(function(a) {
      adsByDate[a.due_date] = adsByDate[a.due_date] || [];
      adsByDate[a.due_date].push(a);
    });

    // Collect Meta v2 campaigns with date ranges
    var camps = (S.data.campaigns_v2 || []).filter(function(c) { return c.start_time && c.stop_time; });
    if (calFilter.campaign) camps = camps.filter(function(c) { return c.id === calFilter.campaign; });

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
    var allCamps = getAllCampaignsV2 ? getAllCampaignsV2() : [];
    if (allCamps.length > 0) {
      html += '<select class="cp-select cp-select-sm" id="cpCalCampaignFilter"><option value="">All Campaigns</option>';
      for (var cfi = 0; cfi < allCamps.length; cfi++) html += '<option value="' + esc(allCamps[cfi].id) + '"' + (calFilter.campaign === allCamps[cfi].id ? ' selected' : '') + '>' + esc(allCamps[cfi].name) + '</option>';
      html += '</select>';
    }
    html += '<select class="cp-select cp-select-sm" id="cpCalStatusFilter"><option value="">All Statuses</option>';
    for (var csk in META_AD_STATUSES) html += '<option value="' + csk + '"' + (calFilter.status === csk ? ' selected' : '') + '>' + META_AD_STATUSES[csk].label + '</option>';
    html += '</select>';
    html += '<span class="cp-text-muted" style="font-size:12px">' + ads.length + ' ad' + (ads.length !== 1 ? 's' : '') + ' with due dates</span>';
    html += '</div>';

    if (cpIsPhone()) {
      // Mobile: vertical day-list — chronological cards for days with ads or
      // inside any campaign's range.
      html += renderCalMobileList(year, month, adsByDate, camps, now);
    } else {
      // Campaign bars (Meta v2)
      if (camps.length > 0) {
        html += '<div class="cp-cal-campaign-bars">';
        for (var ci = 0; ci < camps.length; ci++) {
          var camp = camps[ci];
          var cst = META_CAMPAIGN_STATUSES[camp.status] || { color: '#80868b' };
          html += '<div class="cp-cal-campaign-row" data-action="go-to-campaign" data-id="' + esc(camp.id) + '" style="cursor:pointer">';
          html += '<span class="cp-cal-campaign-name" style="color:' + cst.color + '">' + icon('bullhorn') + ' ' + esc(truncate(camp.name, 16)) + '</span>';
          html += '<div class="cp-cal-campaign-bar-track">';
          var monthStart = new Date(year, month, 1);
          var monthEnd = new Date(year, month + 1, 0);
          var cStart = new Date(camp.start_time);
          var cEnd = new Date(camp.stop_time);
          var daysInMonth = monthEnd.getDate();
          var barLeft = Math.max(0, Math.floor(((cStart - monthStart) / (1000 * 60 * 60 * 24)) / daysInMonth * 100));
          var barRight = Math.max(0, 100 - Math.ceil(((cEnd - monthStart) / (1000 * 60 * 60 * 24) + 1) / daysInMonth * 100));
          if (cEnd < monthStart || cStart > monthEnd) { barLeft = 0; barRight = 100; }
          html += '<div class="cp-cal-campaign-bar" style="left:' + barLeft + '%;right:' + barRight + '%;background:' + cst.color + '20;border-color:' + cst.color + '50"></div>';
          html += '</div></div>';
        }
        html += '</div>';
      }

      // Calendar grid
      html += renderCalMonthGrid(year, month, dayNames, adsByDate, now);
    }

    html += '</div>';
    return html;
  }

  function renderCalMobileList(year, month, adsByDate, camps, now) {
    var monthStart = new Date(year, month, 1);
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var today = now.getDate();
    var todayMonth = now.getMonth();
    var todayYear = now.getFullYear();
    var dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Active campaigns per day
    function campsOnDay(d) {
      var out = [];
      var dayDate = new Date(year, month, d);
      for (var i = 0; i < camps.length; i++) {
        var c = camps[i];
        var cs = new Date(c.start_time);
        var ce = new Date(c.stop_time);
        cs.setHours(0, 0, 0, 0); ce.setHours(23, 59, 59, 999);
        if (dayDate >= cs && dayDate <= ce) out.push(c);
      }
      return out;
    }

    var html = '<div class="cp-cal-list">';
    var hasAny = false;
    for (var d = 1; d <= daysInMonth; d++) {
      var dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
      var dayAds = adsByDate[dateStr] || [];
      var dayCamps = camps.length > 0 ? campsOnDay(d) : [];
      if (dayAds.length === 0 && dayCamps.length === 0) continue;
      hasAny = true;
      var isToday = d === today && month === todayMonth && year === todayYear;
      var dateObj = new Date(year, month, d);
      html += '<div class="cp-cal-list-day' + (isToday ? ' cp-cal-list-day-today' : '') + '">';
      html += '<div class="cp-cal-list-day-header">';
      html += '<div class="cp-cal-list-day-num">' + d + '</div>';
      html += '<div class="cp-cal-list-day-meta"><div class="cp-cal-list-day-name">' + dayLabels[dateObj.getDay()] + '</div>';
      if (isToday) html += '<div class="cp-cal-list-day-today-pill">Today</div>';
      html += '</div></div>';

      if (dayCamps.length > 0) {
        html += '<div class="cp-cal-list-camps">';
        for (var ci = 0; ci < dayCamps.length; ci++) {
          var dc = dayCamps[ci];
          var dcst = META_CAMPAIGN_STATUSES[dc.status] || { color: '#80868b' };
          html += '<span class="cp-cal-list-camp-chip" style="background:' + dcst.color + '15;color:' + dcst.color + '" data-action="go-to-campaign" data-id="' + esc(dc.id) + '">' + icon('bullhorn') + ' ' + esc(truncate(dc.name, 24)) + '</span>';
        }
        html += '</div>';
      }

      if (dayAds.length > 0) {
        html += '<div class="cp-cal-list-ads">';
        for (var ai = 0; ai < dayAds.length; ai++) {
          var ad = dayAds[ai];
          var aSt = META_AD_STATUSES[ad.pipeline_status] || { color: '#80868b', label: ad.pipeline_status || '' };
          html += '<button class="cp-cal-list-ad" data-action="ws-select-ad" data-id="' + esc(ad.id) + '">';
          html += '<span class="cp-cal-list-ad-dot" style="background:' + aSt.color + '"></span>';
          html += '<span class="cp-cal-list-ad-name">' + esc(ad.name || 'Untitled') + '</span>';
          if (aSt.label) html += '<span class="cp-cal-list-ad-status" style="color:' + aSt.color + '">' + esc(aSt.label) + '</span>';
          html += '</button>';
        }
        html += '</div>';
      }

      html += '</div>';
    }
    if (!hasAny) {
      html += '<div class="cp-cal-list-empty">' + icon('calendar') + ' Nothing scheduled this month.</div>';
    }
    html += '</div>';
    return html;
  }

  function renderCalMonthGrid(year, month, dayNames, adsByDate, now) {
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
      var dayAds = isValid && adsByDate[dateStr] ? adsByDate[dateStr] : [];

      html += '<div class="cp-cal-day' + (isValid ? '' : ' cp-cal-day-empty') + (isToday ? ' cp-cal-day-today' : '') + '">';
      if (isValid) {
        html += '<div class="cp-cal-day-header"><span class="cp-cal-day-num">' + dayNum + '</span>';
        if (dayAds.length > 0) html += '<span class="cp-cal-day-count">' + dayAds.length + '</span>';
        html += '</div>';
        for (var dai = 0; dai < Math.min(dayAds.length, 3); dai++) {
          var ad = dayAds[dai];
          var aSt = META_AD_STATUSES[ad.pipeline_status] || { color: '#80868b' };
          html += '<div class="cp-cal-recipe-chip" style="background:' + aSt.color + '15;color:' + aSt.color + '" data-action="ws-select-ad" data-id="' + esc(ad.id) + '">';
          html += '<span class="cp-cal-chip-title">' + esc(truncate(ad.name || 'Untitled', 14)) + '</span>';
          html += '</div>';
        }
        if (dayAds.length > 3) html += '<div class="cp-cal-more">+' + (dayAds.length - 3) + ' more</div>';
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

