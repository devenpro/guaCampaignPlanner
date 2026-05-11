  // ============================================================
  // SECTION 19: FILTERING & SORTING HELPERS
  // ============================================================

  // getFilteredRecipes() is in Section 14

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
    else if (filters.sortBy === 'most_used') msgs.sort(function(a, b) { return (S.messageRecipeCounts[b.id] || 0) - (S.messageRecipeCounts[a.id] || 0); });
    else msgs.sort(function(a, b) { return (b.updated || b.created || '') > (a.updated || a.created || '') ? 1 : -1; });
    return msgs;
  }

  function getGroupedRecipes(groupBy) {
    var recipes = getFilteredRecipes();
    var groups = [];

    if (groupBy === 'status') {
      for (var sk in RECIPE_STATUSES) {
        var stCfg = RECIPE_STATUSES[sk];
        var stRecipes = recipes.filter(function(r) { return r.status === sk; });
        if (stRecipes.length > 0) {
          groups.push({ key: sk, label: stCfg.label, icon: stCfg.icon, color: stCfg.color, recipes: stRecipes });
        }
      }
    } else if (groupBy === 'campaign') {
      var campRecipes = {};
      recipes.forEach(function(r) {
        var ck = r.campaign_id || '_none';
        campRecipes[ck] = campRecipes[ck] || [];
        campRecipes[ck].push(r);
      });
      for (var cid in campRecipes) {
        var camp = S.campaignMap[cid];
        groups.push({
          key: cid, label: camp ? camp.name : 'No Campaign',
          icon: camp ? 'bullhorn' : 'folder',
          color: camp ? (CAMPAIGN_STATUSES[camp.status] || {}).color || '#80868b' : '#80868b',
          recipes: campRecipes[cid]
        });
      }
    } else if (groupBy === 'persona') {
      var perRecipes = {};
      recipes.forEach(function(r) {
        var pk = r.persona_id || '_none';
        perRecipes[pk] = perRecipes[pk] || [];
        perRecipes[pk].push(r);
      });
      for (var pid in perRecipes) {
        var persona = S.personaMap[pid];
        groups.push({ key: pid, label: persona ? persona.name : 'No Persona', icon: 'user', color: '#9334e9', recipes: perRecipes[pid] });
      }
    } else if (groupBy === 'priority') {
      for (var plk in PRIORITY_LEVELS) {
        var plCfg = PRIORITY_LEVELS[plk];
        var plRecipes = recipes.filter(function(r) { return r.priority === plk; });
        if (plRecipes.length > 0) {
          groups.push({ key: plk, label: plCfg.label, icon: plCfg.icon, color: plCfg.color, recipes: plRecipes });
        }
      }
    } else if (groupBy === 'funnel') {
      var funnels = (S.meta.settings && S.meta.settings.funnel_stages) || [];
      funnels.forEach(function(f) {
        var fRecipes = recipes.filter(function(r) {
          var msg = S.messageMap[r.message_id];
          return msg && (msg.funnel_stages || []).indexOf(f.id) > -1;
        });
        if (fRecipes.length > 0) {
          groups.push({ key: f.id, label: f.name, icon: 'filter', color: f.color, recipes: fRecipes });
        }
      });
      var noFunnel = recipes.filter(function(r) {
        var msg = S.messageMap[r.message_id];
        return !msg || !msg.funnel_stages || msg.funnel_stages.length === 0;
      });
      if (noFunnel.length > 0) {
        groups.push({ key: '_none', label: 'No Funnel Stage', icon: 'circle', color: '#80868b', recipes: noFunnel });
      }
    } else if (groupBy === 'tag') {
      var taggedRecipes = {};
      recipes.forEach(function(r) {
        var tags = r.tags || [];
        if (tags.length === 0) {
          taggedRecipes['_none'] = taggedRecipes['_none'] || [];
          taggedRecipes['_none'].push(r);
        } else {
          tags.forEach(function(tid) {
            taggedRecipes[tid] = taggedRecipes[tid] || [];
            taggedRecipes[tid].push(r);
          });
        }
      });
      for (var tid in taggedRecipes) {
        var tag = S.tagMap[tid];
        groups.push({ key: tid, label: tag ? tag.name : 'Untagged', icon: 'tag', color: tag ? tag.color : '#80868b', recipes: taggedRecipes[tid] });
      }
    }

    return groups;
  }

