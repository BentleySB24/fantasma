(function () {
  "use strict";

  var F = window.Fantasma;
  var PAGE_SIZE = 8;
  var data = [];
  var page = 1;

  function $(id) { return document.getElementById(id); }

  function timeMatches(rowTime, filter) {
    if (!filter) return true;
    if (filter === "any") return rowTime === "any";
    return rowTime === filter || rowTime === "any";
  }

  function currentFilters() {
    return {
      area: $("filter-area").value,
      method: $("filter-method").value,
      time: $("filter-time").value,
      q: $("filter-q").value.trim()
    };
  }

  function syncUrl() {
    var f = currentFilters();
    F.setParams({
      area: f.area,
      method: f.method,
      time: f.time,
      q: f.q,
      page: page > 1 ? String(page) : ""
    });
  }

  function filteredRows() {
    var f = currentFilters();
    var q = f.q.toLowerCase();
    var showSp = F.showSpoilers();
    return data.filter(function (row) {
      if (!showSp && F.isSpoilerEncounter(row)) return false;
      if (f.area && row.area !== f.area) return false;
      if (f.method && row.method !== f.method) return false;
      if (!timeMatches(row.time_of_day, f.time)) return false;
      if (q) {
        var hay = (row.species + " " + row.species_key + " " + row.area).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function group(rows) {
    var areas = [];
    var map = Object.create(null);
    rows.forEach(function (row) {
      if (!map[row.area]) {
        map[row.area] = { area: row.area, tables: Object.create(null) };
        areas.push(map[row.area]);
      }
      var group = map[row.area];
      var key = row.method + "\0" + row.time_of_day + "\0" + (row.note || "") + "\0" + String(row.area_encounter_rate);
      if (!group.tables[key]) {
        group.tables[key] = {
          method: row.method,
          time: row.time_of_day,
          note: row.note || "",
          rate: row.area_encounter_rate,
          rows: []
        };
      }
      group.tables[key].rows.push(row);
    });
    areas.forEach(function (group) {
      var list = [];
      Object.keys(group.tables).forEach(function (key) { list.push(group.tables[key]); });
      list.sort(function (a, b) {
        var ma = F.METHOD_ORDER.indexOf(a.method);
        var mb = F.METHOD_ORDER.indexOf(b.method);
        if (ma !== mb) return ma - mb;
        var ta = F.TIME_ORDER[a.time] != null ? F.TIME_ORDER[a.time] : 9;
        var tb = F.TIME_ORDER[b.time] != null ? F.TIME_ORDER[b.time] : 9;
        if (ta !== tb) return ta - tb;
        if (a.note !== b.note) return a.note.localeCompare(b.note);
        return a.rate - b.rate;
      });
      list.forEach(function (table) {
        table.rows.sort(function (a, b) {
          if (b.chance_percent !== a.chance_percent) return b.chance_percent - a.chance_percent;
          return a.species.localeCompare(b.species);
        });
      });
      group.tableList = list;
    });
    return areas;
  }

  function accessBadges(rows) {
    var seen = Object.create(null);
    var html = "";
    rows.forEach(function (row) {
      if (row.access && row.access !== "ordinary" && !seen[row.access]) {
        seen[row.access] = true;
        html += " " + F.badge(row.access === "DexNav hidden only" ? "DexNav only" : "Optional / secret area", "badge-secret");
      }
      if (row.hidden_until_found && !seen.__hidden) {
        seen.__hidden = true;
        html += " " + F.badge("Hidden until found", "badge-secret");
      }
    });
    return html;
  }

  function renderTable(table) {
    var title = F.escapeHtml(F.methodLabel(table.method));
    title += ' <span class="muted">' + F.escapeHtml(F.timeLabel(table.time)) + "</span>";
    title += ' <span class="muted">rate ' + F.escapeHtml(String(table.rate)) + "</span>";
    if (table.note) title += " " + F.badge(table.note, table.note.indexOf("not reachable") !== -1 ? "badge-warn" : "badge-muted");
    var rows = table.rows.map(function (row) {
      var extra = "";
      if (row.access && row.access !== "ordinary") {
        extra += F.badge(row.access === "DexNav hidden only" ? "DexNav only" : "Optional / secret", "badge-secret");
      }
      if (row.hidden_until_found) extra += F.badge("Hidden until found", "badge-secret");
      return "<tr>" +
        '<td class="species"><a href="' + F.escapeHtml(F.monLink(row.species)) + '">' + F.escapeHtml(row.species) + "</a></td>" +
        '<td class="num">' + F.escapeHtml(F.formatRange(row.min_level, row.max_level)) + "</td>" +
        '<td class="num">' + F.escapeHtml(String(row.chance_percent)) + "%</td>" +
        "<td>" + extra + "</td>" +
        "</tr>";
    }).join("");
    return '<div class="method-block"><h3>' + title + "</h3>" +
      '<div class="table-wrap"><table class="data-table"><thead><tr>' +
      "<th>Species</th><th>Levels</th><th>Chance</th><th></th>" +
      "</tr></thead><tbody>" + rows + "</tbody></table></div></div>";
  }

  function render() {
    var rows = filteredRows();
    var areas = group(rows);
    var totalAreas = areas.length;
    var pages = Math.max(1, Math.ceil(totalAreas / PAGE_SIZE));
    if (page > pages) page = pages;
    if (page < 1) page = 1;
    var start = (page - 1) * PAGE_SIZE;
    var slice = areas.slice(start, start + PAGE_SIZE);
    var hiddenCount = 0;
    if (!F.showSpoilers()) {
      hiddenCount = data.filter(F.isSpoilerEncounter).length;
    }

    var status = $("results-status");
    if (!rows.length) {
      status.innerHTML = "No encounters match these filters.";
      status.classList.remove("is-error");
    } else {
      var html = "Showing <strong>" + rows.length.toLocaleString() + "</strong> encounter" +
        (rows.length === 1 ? "" : "s") + " in <strong>" + totalAreas + "</strong> area" +
        (totalAreas === 1 ? "" : "s") + ".";
      if (totalAreas > PAGE_SIZE) {
        html += " Areas " + (start + 1) + "–" + (start + slice.length) + " of " + totalAreas + ".";
      }
      if (hiddenCount) {
        html += " <span class=\"muted\">" + hiddenCount + " spoiler row" + (hiddenCount === 1 ? " is" : "s are") + " hidden.</span>";
      }
      status.innerHTML = html;
      status.classList.remove("is-error");
    }

    $("results").innerHTML = slice.map(function (group) {
      var allRows = [];
      group.tableList.forEach(function (t) { allRows = allRows.concat(t.rows); });
      var methods = F.uniqueSorted(group.tableList.map(function (t) { return F.methodLabel(t.method); }));
      return '<article class="area-block">' +
        "<header><h2>" + F.escapeHtml(group.area) + "</h2>" +
        '<p class="area-meta">' + F.escapeHtml(methods.join(" · ")) +
        " · " + allRows.length + " row" + (allRows.length === 1 ? "" : "s") +
        accessBadges(allRows) + "</p></header>" +
        group.tableList.map(renderTable).join("") +
        "</article>";
    }).join("");

    var pager = $("pager");
    if (totalAreas <= PAGE_SIZE) {
      pager.hidden = true;
    } else {
      pager.hidden = false;
      $("page-label").textContent = "Page " + page + " of " + pages;
      $("page-prev").disabled = page <= 1;
      $("page-next").disabled = page >= pages;
    }
    syncUrl();
  }

  function resetPageAndRender() {
    page = 1;
    render();
  }

  function applyParams() {
    var p = F.params();
    if (p.get("area")) $("filter-area").value = p.get("area");
    if (p.get("method")) $("filter-method").value = p.get("method");
    if (p.get("time")) $("filter-time").value = p.get("time");
    if (p.get("q")) $("filter-q").value = p.get("q");
    var parsed = parseInt(p.get("page") || "1", 10);
    page = isNaN(parsed) || parsed < 1 ? 1 : parsed;
  }

  function initFilters(rows) {
    var areas = [];
    var seen = Object.create(null);
    rows.forEach(function (row) {
      if (!seen[row.area]) { seen[row.area] = true; areas.push(row.area); }
    });
    F.fillSelect($("filter-area"), areas, "All areas");
    var methodSelect = $("filter-method");
    methodSelect.innerHTML = '<option value="">All methods</option>' +
      F.METHOD_ORDER.map(function (method) {
        return '<option value="' + F.escapeHtml(method) + '">' + F.escapeHtml(F.methodLabel(method)) + "</option>";
      }).join("");
  }

  function clearFilters() {
    $("filter-area").value = "";
    $("filter-method").value = "";
    $("filter-time").value = "";
    $("filter-q").value = "";
    page = 1;
    render();
  }

  F.fetchJson("assets/data/wild_encounters.json").then(function (rows) {
    if (!Array.isArray(rows)) throw new Error("Unexpected encounter data.");
    data = rows;
    initFilters(rows);
    applyParams();
    F.bindSpoilerToggle($("show-spoilers"), resetPageAndRender);
    ["filter-area", "filter-method", "filter-time"].forEach(function (id) {
      $(id).addEventListener("change", resetPageAndRender);
    });
    $("filter-q").addEventListener("input", F.debounce(resetPageAndRender, 160));
    $("clear-filters").addEventListener("click", clearFilters);
    $("page-prev").addEventListener("click", function () { if (page > 1) { page -= 1; render(); } });
    $("page-next").addEventListener("click", function () { page += 1; render(); });
    render();
  }).catch(function (err) {
    var status = $("results-status");
    status.textContent = F.loadErrorMessage(err);
    status.classList.add("is-error");
  });
})();
