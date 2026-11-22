(function () {
  "use strict";

  var F = window.Fantasma;
  var data = [];

  function $(id) { return document.getElementById(id); }

  function currentFilters() {
    return {
      kind: $("filter-kind").value,
      q: $("filter-q").value.trim()
    };
  }

  function syncUrl() {
    var f = currentFilters();
    F.setParams({ kind: f.kind, q: f.q });
  }

  function rowVisible(row, showSp, f) {
    if (!showSp && F.isSpoilerGift(row)) return false;
    if (f.kind && row.kind !== f.kind) return false;
    if (f.q) {
      var hay = [row.species, row.species_key, row.location, row.note, row.kind].join(" ").toLowerCase();
      if (hay.indexOf(f.q.toLowerCase()) === -1) return false;
    }
    return true;
  }

  function hiddenBySpoilers(row, f) {
    if (!F.isSpoilerGift(row)) return false;
    if (f.kind && row.kind !== f.kind) return false;
    if (f.q) {
      var hay = [row.species, row.species_key, row.location, row.note, row.kind].join(" ").toLowerCase();
      if (hay.indexOf(f.q.toLowerCase()) === -1) return false;
    }
    return true;
  }

  function renderCard(row) {
    var flags = "";
    if (!row.reachable) flags += F.badge("Not reachable", "badge-warn");
    if (row.hidden_until_found) flags += F.badge("Hidden until found", "badge-secret");
    if (!row.catchable) flags += F.badge("Cannot be caught", "badge-muted");
    else flags += F.badge("Catchable", "badge-muted");
    var cls = "gift-card" + (row.reachable ? "" : " is-unreachable");
    var note = row.note ? '<p class="gift-note">' + F.escapeHtml(row.note) + "</p>" : "";
    var level = F.formatGiftLevel(row.level);
    return '<article class="' + cls + '">' +
      "<h3><a href=\"" + F.escapeHtml(F.monLink(row.species)) + "\">" + F.escapeHtml(row.species) + "</a> " + flags + "</h3>" +
      '<p class="gift-meta">Level ' + F.escapeHtml(level) +
      ' · <span class="loc">' + F.escapeHtml(row.location) + "</span></p>" +
      note +
      "</article>";
  }

  function render() {
    var f = currentFilters();
    var showSp = F.showSpoilers();
    var visible = data.filter(function (row) { return rowVisible(row, showSp, f); });
    var concealed = showSp ? [] : data.filter(function (row) { return hiddenBySpoilers(row, f); });
    var godsConcealed = concealed.filter(function (row) { return row.kind === "god battle"; }).length;
    var otherConcealed = concealed.length - godsConcealed;

    var status = $("results-status");
    if (!visible.length && !concealed.length) {
      status.innerHTML = "No entries match these filters.";
    } else {
      var html = "Showing <strong>" + visible.length + "</strong> of " + data.length + " entries.";
      if (concealed.length) {
        var bits = [];
        if (godsConcealed) bits.push(godsConcealed + " god battle" + (godsConcealed === 1 ? "" : "s"));
        if (otherConcealed) bits.push(otherConcealed + " hidden location" + (otherConcealed === 1 ? "" : "s"));
        html += " " + bits.join(" and ") + " stay hidden until you turn on Show spoilers.";
      }
      status.innerHTML = html;
    }
    status.classList.remove("is-error");

    var groups = {};
    F.KIND_ORDER.forEach(function (kind) { groups[kind] = []; });
    visible.forEach(function (row) {
      if (!groups[row.kind]) groups[row.kind] = [];
      groups[row.kind].push(row);
    });

    var html = "";
    F.KIND_ORDER.forEach(function (kind) {
      if (!groups[kind] || !groups[kind].length) return;
      html += '<section class="kind-block"><h2>' + F.escapeHtml(F.kindLabel(kind)) +
        " · " + groups[kind].length + "</h2>" +
        groups[kind].map(renderCard).join("") + "</section>";
    });
    if (!showSp && godsConcealed && (!f.kind || f.kind === "god battle")) {
      html += '<p class="spoiler-teaser">God battles are late-game spoilers. Turn on Show spoilers to reveal them.</p>';
    }
    $("results").innerHTML = html;
    syncUrl();
  }

  function applyParams() {
    var p = F.params();
    if (p.get("kind")) $("filter-kind").value = p.get("kind");
    if (p.get("q")) $("filter-q").value = p.get("q");
  }

  function clearFilters() {
    $("filter-kind").value = "";
    $("filter-q").value = "";
    render();
  }

  F.fetchJson("assets/data/gifts_statics_trades.json").then(function (rows) {
    if (!Array.isArray(rows)) throw new Error("Unexpected gifts data.");
    data = rows;
    var kinds = F.KIND_ORDER.filter(function (kind) {
      return rows.some(function (row) { return row.kind === kind; });
    });
    $("filter-kind").innerHTML = '<option value="">All kinds</option>' + kinds.map(function (kind) {
      return '<option value="' + F.escapeHtml(kind) + '">' + F.escapeHtml(F.kindLabel(kind)) + "</option>";
    }).join("");
    applyParams();
    F.bindSpoilerToggle($("show-spoilers"), render);
    $("filter-kind").addEventListener("change", render);
    $("filter-q").addEventListener("input", F.debounce(render, 160));
    $("clear-filters").addEventListener("click", clearFilters);
    render();
  }).catch(function (err) {
    var status = $("results-status");
    status.textContent = F.loadErrorMessage(err);
    status.classList.add("is-error");
  });
})();
