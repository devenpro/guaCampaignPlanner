  // ============================================================
  // SECTION 19: FILTERING & SORTING HELPERS
  // ============================================================

  function getFilteredPersonas(search) {
    var personas = (S.data.personas || []).slice();
    if (!search) return personas;
    var q = search.toLowerCase();
    return personas.filter(function(p) {
      return (p.name || '').toLowerCase().indexOf(q) > -1 ||
             (p.description || '').toLowerCase().indexOf(q) > -1 ||
             (p.demographics && p.demographics.occupation || '').toLowerCase().indexOf(q) > -1;
    });
  }

  function getFilteredMessages(filters) {
    var msgs = (S.data.messages || []).slice();
    if (!filters) return msgs;
    if (filters.search) {
      var q = filters.search.toLowerCase();
      msgs = msgs.filter(function(m) {
        return (m.title || '').toLowerCase().indexOf(q) > -1 ||
               (m.body || '').toLowerCase().indexOf(q) > -1 ||
               (m.theme || '').toLowerCase().indexOf(q) > -1;
      });
    }
    if (filters.funnel) {
      msgs = msgs.filter(function(m) { return (m.funnel_stages || []).indexOf(filters.funnel) > -1; });
    }
    if (filters.sortBy === 'title') msgs.sort(function(a, b) { return (a.title || '').localeCompare(b.title || ''); });
    else msgs.sort(function(a, b) { return (b.updated || b.created || '') > (a.updated || a.created || '') ? 1 : -1; });
    return msgs;
  }
