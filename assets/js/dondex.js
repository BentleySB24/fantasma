(function () {
  "use strict";

  var F = window.Fantasma;
  var PAGE_SIZE = 50;
  var data = [];
  var page = 1;
  var openKey = null;
  var jumpSpecies = null;

  function $(id) { return document.getElementById(id); }

  function currentFilters() {
    return {
      q: $("filter-q").value.trim(),
      type: $("filter-type").value,
      ability: $("filter-ability").value.trim(),
      sigil: $("filter-sigil").value.trim(),
      part1: $("filter-part1").checked
    };
  }

  function syncUrl() {
    var f = currentFilters();
    F.setParams({
      q: f.q,
      type: f.type,
      ability: f.ability,
      sigil: f.sigil,
      part1: f.part1,
      page: page > 1 ? String(page) : ""
    });
  }

  function haystack(row) {
    return [
      row.name, row.species_key, String(row.dex_number), String(row.species_id),
      row.ability_1, row.ability_2, row.hidden_ability
    ].join(" ").toLowerCase();
  }

  function hasAbility(row, q) {
    if (!q) return true;
    var needle = q.toLowerCase();
    return [row.ability_1, row.ability_2, row.hidden_ability].some(function (name) {
      return name && name.toLowerCase().indexOf(needle) !== -1;
    });
  }

  function hasSigil(row, q) {
    if (!q) return true;
    var needle = q.toLowerCase();
    return (row.sigils || []).some(function (sigil) {
      return (sigil.sigil && sigil.sigil.toLowerCase().indexOf(needle) !== -1) ||
        (sigil.ability && sigil.ability.toLowerCase().indexOf(needle) !== -1);
    });
  }

  function hasType(row, type) {
    if (!type) return true;
    return row.type_1 === type || row.type_2 === type;
  }

  function speciesMatch(row, species) {
    if (!species) return false;
    var s = species.toLowerCase();
    return row.name.toLowerCase() === s ||
      row.species_key.toLowerCase() === s ||
      row.species_key.toLowerCase() === "species_" + s.replace(/ /g, "_");
  }

  function filteredRows() {
    var f = currentFilters();
    var q = f.q.toLowerCase();
    return data.filter(function (row) {
      if (f.part1 && !row.obtainable_in_part_1) return false;
      if (!hasType(row, f.type)) return false;
      if (!hasAbility(row, f.ability)) return false;
      if (!hasSigil(row, f.sigil)) return false;
      if (q && haystack(row).indexOf(q) === -1) return false;
      return true;
    });
  }

  function abilityList(row) {
    var parts = [];
    if (row.ability_1) parts.push(F.escapeHtml(row.ability_1));
    if (row.ability_2) parts.push(F.escapeHtml(row.ability_2));
    if (row.hidden_ability) parts.push(F.escapeHtml(row.hidden_ability) + ' <span class="badge badge-muted">HA</span>');
    return parts.join(" · ") || "—";
  }

  function sigilSummary(row) {
    var names = (row.sigils || []).map(function (s) { return s.sigil; });
    if (!names.length) return '<span class="empty">—</span>';
    return F.escapeHtml(names.join(", "));
  }

  function typeHtml(row) {
    return '<div class="type-wrap">' + F.typeChip(row.type_1) + F.typeChip(row.type_2) + "</div>";
  }

  function statRow(name, value, total) {
    var max = total ? 720 : 255;
    var pct = Math.max(0, Math.min(100, (Number(value) / max) * 100));
    return '<div class="stat' + (total ? " total" : "") + '">' +
      '<span class="stat-name">' + F.escapeHtml(name) + "</span>" +
      '<span class="stat-val">' + F.escapeHtml(String(value)) + "</span>" +
      '<span class="stat-bar"><span style="width:' + pct.toFixed(1) + '%"></span></span>' +
      "</div>";
  }

  function placeItem(text, secret, showSp) {
    if (secret && !showSp) return null;
    var label = F.escapeHtml(text);
    var badge = secret ? " " + F.badge("Hidden until found", "badge-secret") : "";
    return "<li>" + label + badge + "</li>";
  }

  function renderLocations(row, showSp) {
    var items = (row.where_to_find || []).map(function (loc) {
      return placeItem(loc.text, !!loc.secret, showSp);
    }).filter(Boolean);
    var hidden = (row.where_to_find || []).filter(function (loc) { return loc.secret; }).length;
    if (!items.length) {
      if (hidden && !showSp) return '<p class="empty">Hidden until found — turn on Show spoilers to reveal.</p>';
      return '<p class="empty">No listed source in Part I. Gods are fought and reaved, never caught.</p>';
    }
    var extra = "";
    if (hidden && !showSp) extra = '<p class="empty">Some locations stay hidden until found.</p>';
    return "<ul>" + items.join("") + "</ul>" + extra;
  }

  function renderSigilDetails(row, showSp) {
    var sigils = row.sigils || [];
    if (!sigils.length) return '<p class="empty">No Part I Sigil carries one of this species’ abilities.</p>';
    return "<ul>" + sigils.map(function (sigil) {
      var places = (sigil.found_at || []).slice();
      var hiddenPlaces = sigil.found_at_hidden_until_discovered || [];
      if (showSp) places = places.concat(hiddenPlaces);
      var loc = "";
      if (places.length) {
        loc = " — " + F.escapeHtml(places.join("; "));
        if (showSp && hiddenPlaces.length) loc += " " + F.badge("Includes hidden locations", "badge-secret");
      } else if (hiddenPlaces.length && !showSp) {
        loc = " — hidden until found " + F.badge("Hidden until found", "badge-secret");
      } else {
        loc = " — location not listed";
      }
      return "<li><strong>" + F.escapeHtml(sigil.sigil) + "</strong> (" + F.escapeHtml(sigil.ability) + ")" + loc + "</li>";
    }).join("") + "</ul>";
  }

  function renderEvolution(row) {
    var parts = [];
    (row.evolves_from || []).forEach(function (name) {
      parts.push('Evolves from <a href="' + F.escapeHtml(F.monLink(name)) + '">' + F.escapeHtml(name) + "</a>");
    });
    (row.evolves_to || []).forEach(function (ev) {
      var how = ev.how ? " (" + F.escapeHtml(ev.how) + ")" : "";
      parts.push('Evolves into <a href="' + F.escapeHtml(F.monLink(ev.to)) + '">' + F.escapeHtml(ev.to) + "</a>" + how);
    });
    if (!parts.length) return '<p class="empty">Does not evolve.</p>';
    return "<ul>" + parts.map(function (p) { return "<li>" + p + "</li>"; }).join("") + "</ul>";
  }

  function detailHtml(row) {
    var showSp = F.showSpoilers();
    return '<div class="detail-grid">' +
      '<div class="detail-panel"><h3>Base stats</h3><div class="stat-list">' +
      statRow("HP", row.hp) +
      statRow("Attack", row.attack) +
      statRow("Defense", row.defense) +
      statRow("Sp. Atk", row.sp_attack) +
      statRow("Sp. Def", row.sp_defense) +
      statRow("Speed", row.speed) +
      statRow("Total", row.base_stat_total, true) +
      "</div>" +
      "<h3 style=\"margin-top:1rem\">Abilities</h3><p>" + abilityList(row) + "</p></div>" +
      '<div class="detail-panel">' +
      "<h3>Evolution</h3>" + renderEvolution(row) +
      "<h3>Where to find</h3>" + renderLocations(row, showSp) +
      "<h3>Sigils</h3>" +
      '<p class="empty" style="font-style:normal;color:var(--bone-dim);margin-bottom:0.45rem">Sigils come from rewards, not from catching this species.</p>' +
      renderSigilDetails(row, showSp) +
      "</div></div>";
  }

  function rowKey(row) { return String(row.species_id) + ":" + row.species_key; }

  function render() {
    var rows = filteredRows();
    var pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    if (page > pages) page = pages;
    if (page < 1) page = 1;

    if (jumpSpecies) {
      var idx = -1;
      rows.forEach(function (row, i) {
        if (idx === -1 && speciesMatch(row, jumpSpecies)) idx = i;
      });
      if (idx !== -1) {
        page = Math.floor(idx / PAGE_SIZE) + 1;
        openKey = rowKey(rows[idx]);
      }
      jumpSpecies = null;
    }

    var start = (page - 1) * PAGE_SIZE;
    var slice = rows.slice(start, start + PAGE_SIZE);

    var f = currentFilters();
    var status = $("results-status");
    if (!rows.length) {
      status.innerHTML = "No species match these filters.";
    } else {
      status.innerHTML = "Showing <strong>" + (start + 1) + "–" + (start + slice.length) + "</strong> of <strong>" +
        rows.length.toLocaleString() + "</strong> species or forms." +
        (f.part1 ? "" : " " + data.filter(function (r) { return r.obtainable_in_part_1; }).length + " are available in Part I.");
    }
    status.classList.remove("is-error");

    var body = slice.map(function (row) {
      var key = rowKey(row);
      var open = openKey === key;
      return '<tr class="dex-row' + (open ? " is-open" : "") + '" tabindex="0" data-key="' + F.escapeHtml(key) + '" aria-expanded="' + (open ? "true" : "false") + '">' +
        '<td class="dex-num" data-label="Dex">' + F.escapeHtml(F.padDex(row.dex_number)) + "</td>" +
        '<td class="species" data-label="Name">' + F.escapeHtml(row.name) + "</td>" +
        '<td data-label="Types">' + typeHtml(row) + "</td>" +
        '<td data-label="Abilities">' + abilityList(row) + "</td>" +
        '<td data-label="Sigils">' + sigilSummary(row) + "</td>" +
        '<td data-label="Part I">' + (row.obtainable_in_part_1 ? F.badge("Part I", "badge-part") : F.badge("Not in Part I", "badge-muted")) + "</td>" +
        "</tr>" +
        '<tr class="dex-detail"' + (open ? "" : " hidden") + ' data-for="' + F.escapeHtml(key) + '">' +
        '<td colspan="6">' + (open ? detailHtml(row) : "") + "</td></tr>";
    }).join("");

    $("dex-body").innerHTML = body;

    var pager = $("pager");
    if (rows.length <= PAGE_SIZE) pager.hidden = true;
    else {
      pager.hidden = false;
      $("page-label").textContent = "Page " + page + " of " + pages;
      $("page-prev").disabled = page <= 1;
      $("page-next").disabled = page >= pages;
    }
    syncUrl();
  }

  function findRow(key) {
    for (var i = 0; i < data.length; i++) {
      if (rowKey(data[i]) === key) return data[i];
    }
    return null;
  }

  function toggleRow(tr) {
    var key = tr.getAttribute("data-key");
    if (openKey === key) openKey = null;
    else openKey = key;
    render();
    var open = document.querySelector('.dex-row[data-key="' + key.replace(/"/g, '\\"') + '"]');
    if (open && openKey === key) open.focus();
  }

  function resetPageAndRender() {
    page = 1;
    openKey = null;
    render();
  }

  function applyParams() {
    var p = F.params();
    if (p.get("q")) $("filter-q").value = p.get("q");
    if (p.get("type")) $("filter-type").value = p.get("type");
    if (p.get("ability")) $("filter-ability").value = p.get("ability");
    if (p.get("sigil")) $("filter-sigil").value = p.get("sigil");
    $("filter-part1").checked = p.get("part1") === "1";
    var parsed = parseInt(p.get("page") || "1", 10);
    page = isNaN(parsed) || parsed < 1 ? 1 : parsed;
    jumpSpecies = p.get("species") || null;
  }

  function initFilters(rows) {
    var types = F.uniqueSorted(rows.map(function (r) { return r.type_1; }).concat(rows.map(function (r) { return r.type_2; })));
    F.fillSelect($("filter-type"), types, "All types");
    var abilities = [];
    var sigils = [];
    rows.forEach(function (row) {
      ["ability_1", "ability_2", "hidden_ability"].forEach(function (key) {
        if (row[key]) abilities.push(row[key]);
      });
      (row.sigils || []).forEach(function (s) { if (s.sigil) sigils.push(s.sigil); });
    });
    F.fillDatalist($("ability-list"), F.uniqueSorted(abilities));
    F.fillDatalist($("sigil-list"), F.uniqueSorted(sigils));
  }

  function clearFilters() {
    $("filter-q").value = "";
    $("filter-type").value = "";
    $("filter-ability").value = "";
    $("filter-sigil").value = "";
    $("filter-part1").checked = false;
    openKey = null;
    page = 1;
    var url = new URL(window.location.href);
    url.search = "";
    history.replaceState(null, "", url.pathname);
    render();
  }

  F.fetchJson("assets/data/don_dex.json").then(function (rows) {
    if (!Array.isArray(rows)) throw new Error("Unexpected Don Dex data.");
    data = rows;
    initFilters(rows);
    applyParams();
    F.bindSpoilerToggle($("show-spoilers"), render);
    $("filter-type").addEventListener("change", resetPageAndRender);
    $("filter-part1").addEventListener("change", resetPageAndRender);
    ["filter-q", "filter-ability", "filter-sigil"].forEach(function (id) {
      $(id).addEventListener("input", F.debounce(resetPageAndRender, 160));
    });
    $("clear-filters").addEventListener("click", clearFilters);
    $("page-prev").addEventListener("click", function () { if (page > 1) { page -= 1; openKey = null; render(); } });
    $("page-next").addEventListener("click", function () { page += 1; openKey = null; render(); });
    $("dex-body").addEventListener("click", function (ev) {
      var tr = ev.target.closest("tr.dex-row");
      if (tr) toggleRow(tr);
    });
    $("dex-body").addEventListener("keydown", function (ev) {
      if (ev.key !== "Enter" && ev.key !== " ") return;
      var tr = ev.target.closest("tr.dex-row");
      if (!tr) return;
      ev.preventDefault();
      toggleRow(tr);
    });
    render();
  }).catch(function (err) {
    var status = $("results-status");
    status.textContent = F.loadErrorMessage(err);
    status.classList.add("is-error");
  });
})();
