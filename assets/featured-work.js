/* Homepage Featured Work renderer: fills .work-grid from /config/projects.json (published && featured, cap 3).
   Static cards in index.html stay as the no-JS / fetch-failure fallback. Silent catch. Disclaimer line untouched. */
(function () {
  "use strict";
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function card(p) {
    var shot = (p.screenshots && p.screenshots[0]) || null;
    var img = shot ? '<img src="' + esc(shot.src) + '" alt="' + esc(shot.alt || p.name) + '" loading="lazy" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">' : "";
    var title = p.tagline ? p.name + " \u2014 " + p.tagline : p.name;
    return '<article class="work-card"><div class="work-visual">' + img
      + '<span class="concept">' + esc(String(p.status || "").toUpperCase()) + "</span></div>"
      + "<h3>" + esc(title) + "</h3>"
      + '<p><a class="go" href="' + esc(p.caseStudyUrl || "/portfolio/") + '" style="font-weight:800;color:var(--purple);text-decoration:none">View Project \u2192</a></p></article>';
  }
  function init() {
    var grids = document.querySelectorAll(".work .work-grid");
    if (!grids.length) return;
    fetch("/config/projects.json").then(function (r) { return r.json(); }).then(function (cfg) {
      var feats = ((cfg && cfg.projects) || []).filter(function (p) { return p && p.published && p.featured; }).slice(0, 3);
      if (!feats.length) return; // keep static fallback
      grids.forEach(function (g) { g.innerHTML = feats.map(card).join(""); });
    }).catch(function () { /* static fallback covers failure */ });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
