(function (global) {
  "use strict";

  var KEY = "fantasma-show-spoilers";

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      var ctx = this;
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, ms);
    };
  }

  function params() {
    return new URLSearchParams(window.location.search);
  }

  function setParams(obj) {
    var usp = new URLSearchParams();
    Object.keys(obj).forEach(function (key) {
      var value = obj[key];
      if (value === true) usp.set(key, "1");
      else if (value !== "" && value != null && value !== false) usp.set(key, String(value));
    });
    var next = usp.toString();
    var url = window.location.pathname + (next ? "?" + next : "") + window.location.hash;
    history.replaceState(null, "", url);
  }

  function showSpoilers() {
    try { return localStorage.getItem(KEY) === "1"; } catch (err) { return false; }
  }

  function setShowSpoilers(on) {
    try { localStorage.setItem(KEY, on ? "1" : "0"); } catch (err) {}
  }

  function bindSpoilerToggle(input, onChange) {
    if (!input) return;
    input.checked = showSpoilers();
    input.addEventListener("change", function () {
      setShowSpoilers(input.checked);
      onChange(input.checked);
    });
  }

  function bindNav() {
    var nav = document.querySelector(".nav");
    var toggle = document.querySelector(".nav-toggle");
    if (!toggle || !nav || toggle.getAttribute("data-bound") === "1") return;
    toggle.setAttribute("data-bound", "1");
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  var METHOD_LABELS = {
    grass: "Grass",
    surf: "Surf",
    old_rod: "Old Rod",
    good_rod: "Good Rod",
    super_rod: "Super Rod",
    rock_smash: "Rock Smash",
    dexnav_hidden: "DexNav (hidden)"
  };
  var TIME_LABELS = {
    any: "Any time",
    "morning/day/evening": "Morning / day / evening",
    night: "Night"
  };
  var KIND_LABELS = {
    gift: "Gift",
    "gift egg": "Gift Egg",
    "fossil revival": "Fossil Revival",
    trade: "Trade",
    "special fishing": "Special Fishing",
    "static encounter": "Static Encounter",
    "static battle": "Static Battle",
    "god battle": "God Battle"
  };
  var KIND_ORDER = [
    "gift", "gift egg", "fossil revival", "trade",
    "special fishing", "static encounter", "static battle", "god battle"
  ];
  var METHOD_ORDER = ["grass", "surf", "old_rod", "good_rod", "super_rod", "rock_smash", "dexnav_hidden"];
  var TIME_ORDER = { "morning/day/evening": 0, any: 1, night: 2 };

  function methodLabel(method) { return METHOD_LABELS[method] || method; }
  function timeLabel(time) { return TIME_LABELS[time] || time; }
  function kindLabel(kind) { return KIND_LABELS[kind] || kind; }

  function formatRange(min, max) {
    if (min == null && max == null) return "—";
    if (min === max) return String(min);
    return min + "–" + max;
  }

  function formatGiftLevel(level) {
    if (level === "" || level == null) return "—";
    return String(level);
  }

  function uniqueSorted(arr) {
    var seen = Object.create(null);
    var out = [];
    arr.forEach(function (value) {
      if (!value || seen[value]) return;
      seen[value] = true;
      out.push(value);
    });
    out.sort(function (a, b) {
      return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
    });
    return out;
  }

  function fillSelect(select, values, allLabel) {
    var html = '<option value="">' + escapeHtml(allLabel) + "</option>";
    values.forEach(function (value) {
      html += '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + "</option>";
    });
    select.innerHTML = html;
  }

  function fillDatalist(list, values) {
    list.innerHTML = values.map(function (value) {
      return '<option value="' + escapeHtml(value) + '">';
    }).join("");
  }

  function badge(label, cls) {
    return '<span class="badge' + (cls ? " " + cls : "") + '">' + escapeHtml(label) + "</span>";
  }

  function typeChip(type) {
    if (!type) return "";
    return '<span class="type-chip" data-type="' + escapeHtml(type) + '">' + escapeHtml(type) + "</span>";
  }

  function isSpoilerGift(row) {
    return !!row.hidden_until_found || row.kind === "god battle";
  }

  function isSpoilerEncounter(row) {
    return !!row.hidden_until_found;
  }

  function monLink(name) {
    return "dondex.html?species=" + encodeURIComponent(name);
  }

  function locLink(area) {
    return "encounters.html?area=" + encodeURIComponent(area);
  }

  function fetchJson(path) {
    return fetch(path).then(function (res) {
      if (!res.ok) throw new Error("Could not load " + path + " (" + res.status + ")");
      return res.json();
    });
  }

  function loadErrorMessage(err) {
    var hint = " If you opened this file directly, serve the folder over HTTP instead: python3 -m http.server.";
    return (err && err.message ? err.message : "Could not load the data.") + hint;
  }

  function padDex(num) {
    var n = String(num == null ? "" : num);
    while (n.length < 4) n = "0" + n;
    return "#" + n;
  }

  global.Fantasma = {
    escapeHtml: escapeHtml,
    debounce: debounce,
    params: params,
    setParams: setParams,
    showSpoilers: showSpoilers,
    setShowSpoilers: setShowSpoilers,
    bindSpoilerToggle: bindSpoilerToggle,
    bindNav: bindNav,
    methodLabel: methodLabel,
    timeLabel: timeLabel,
    kindLabel: kindLabel,
    KIND_ORDER: KIND_ORDER,
    METHOD_LABELS: METHOD_LABELS,
    METHOD_ORDER: METHOD_ORDER,
    TIME_ORDER: TIME_ORDER,
    formatRange: formatRange,
    formatGiftLevel: formatGiftLevel,
    uniqueSorted: uniqueSorted,
    fillSelect: fillSelect,
    fillDatalist: fillDatalist,
    badge: badge,
    typeChip: typeChip,
    isSpoilerGift: isSpoilerGift,
    isSpoilerEncounter: isSpoilerEncounter,
    monLink: monLink,
    locLink: locLink,
    fetchJson: fetchJson,
    loadErrorMessage: loadErrorMessage,
    padDex: padDex
  };

  document.addEventListener("DOMContentLoaded", bindNav);
})(window);
