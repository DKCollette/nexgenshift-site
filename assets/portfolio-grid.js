/* Portfolio hub renderer: re-renders #workGrid from /config/projects.json (published only).
   Static cards in portfolio/index.html stay as the no-JS / fetch-failure fallback — same pattern as tier-grid.js.
   Fetch failure => silent catch, static cards remain. Filter keys stay the 5 hub keys; no churn. */
(function () {
  "use strict";
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function pillClass(status) {
    var s = String(status || "").toLowerCase();
    return (s === "live" || s === "working prototype" || s === "interactive demo") ? "pill ok" : "pill";
  }
  function card(p) {
    var shot = (p.screenshots && p.screenshots[0]) || null;
    var img = shot ? '<img src="' + esc(shot.src) + '" alt="' + esc(shot.alt || p.name) + '" loading="lazy" style="width:100%;border-radius:12px;border:1px solid var(--line)">' : "";
    var cats = (p.categoryKeys || []).join(" ");
    var href = p.caseStudyUrl || "/portfolio/";
    return '<article class="card work-card" data-cat="' + esc(cats) + '">'
      + img
      + '<p style="margin-top:12px"><span class="' + pillClass(p.status) + '">' + esc(String(p.status || "").toUpperCase()) + "</span></p>"
      + "<h3>" + esc(p.name) + "</h3>"
      + "<p>" + esc(p.description || "") + "</p>"
      + '<p class="hint">Status: ' + esc(p.honestLimits || "") + "</p>"
      + '<a class="go" href="' + esc(href) + '">View Project \u2192</a></article>';
  }
  function init() {
    var grid = document.getElementById("workGrid");
    if (!grid) return;
    fetch("/config/projects.json").then(function (r) { return r.json(); }).then(function (cfg) {
      var pubs = ((cfg && cfg.projects) || []).filter(function (p) { return p && p.published; });
      if (!pubs.length) return; // keep static fallback
      grid.innerHTML = pubs.map(card).join("");
      bindFilters(pubs);
    }).catch(function () { /* static fallback covers failure */ });
  }
  function bindFilters(pubs) {
    var grid = document.getElementById("workGrid");
    var count = document.getElementById("filterCount");
    var empty = document.getElementById("workEmpty");
    var btns = Array.prototype.slice.call(document.querySelectorAll(".work-filters [data-filter]"));
    // Drop legacy inline-script listeners so only the registry pass handles filtering.
    btns.forEach(function (b) {
      var label = b.textContent.replace(/\s*\(\d+\)\s*$/, "");
      var f = b.getAttribute("data-filter");
      var n = (f === "all") ? pubs.length : pubs.filter(function (p) { return (p.categoryKeys || []).indexOf(f) >= 0; }).length;
      var fresh = b.cloneNode(true);
      fresh.textContent = label + " (" + n + ")";
      b.parentNode.replaceChild(fresh, b);
    });
    btns = Array.prototype.slice.call(document.querySelectorAll(".work-filters [data-filter]"));
    function apply(f) {
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".work-card"));
      var n = 0;
      cards.forEach(function (c) {
        var cats = (c.getAttribute("data-cat") || "").split(" ").filter(Boolean);
        var show = (f === "all" || cats.indexOf(f) >= 0);
        c.classList.toggle("hidden", !show);
        if (show) n++;
      });
      btns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-filter") === f ? "true" : "false"); });
      if (count) count.textContent = "Showing " + n + " of " + cards.length + " pieces.";
      if (empty) empty.hidden = n !== 0;
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { apply(b.getAttribute("data-filter")); }); });
    apply("all");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
