/* Shared tier-grid renderer: service pages render Starter/Growth/Premium from the central catalog. No hardcoded prices. */
(function () {
  "use strict";
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function tierCard(svc, tierKey, tier, promo) {
    var isGrowth = tierKey === "growth";
    var feats = (tier.includes || []).map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("");
    var prop = (tier.proposedPrice && tier.price == null) ? '<p class="example-tag">Indicative ' + esc(tier.proposedPrice) + " — pending approval, shown as Custom Quote</p>" : "";
    var rec = tier.recurring ? '<p style="font-size:.8rem;color:var(--muted)">+ ' + esc(tier.recurring) + "</p>" : "";
    var promoParam = (tier.promoId && promo) ? "&promo=" + encodeURIComponent(promo.id) : "";
    return '<div class="price-card' + (isGrowth ? " hot" : "") + '" style="display:flex;flex-direction:column">'
      + '<p class="tier">' + esc(tierKey.toUpperCase()) + (isGrowth ? " · STRONG VALUE" : "") + "</p>"
      + "<h3>" + esc(tier.name) + "</h3>"
      + '<p class="amt">' + esc(tier.priceDisplay) + "</p>" + prop + rec
      + '<p style="font-size:.84rem;color:var(--muted)">' + esc(tier.value || "") + "</p>"
      + "<ul>" + feats + "</ul>"
      + '<p style="margin-top:auto;padding-top:16px"><a href="/start/?service=' + svc.id + "&tier=" + tierKey + promoParam + '" class="btn ' + (isGrowth ? "btn-primary" : "btn-ghost") + ' btn-sm" style="width:100%;justify-content:center">' + esc(tier.cta || "Choose") + " →</a></p></div>";
  }
  function render() {
    var grids = document.querySelectorAll("[data-tier-grid]");
    if (!grids.length) return;
    fetch("/config/pricing.json").then(function (r) { return r.json(); }).then(function (cfg) {
      var promo = (cfg.promotions && cfg.promotions.active) ? cfg.promotions : null;
      var byId = {};
      (cfg.services || []).forEach(function (s) { byId[s.id] = s; });
      grids.forEach(function (g) {
        var svc = byId[g.getAttribute("data-tier-grid")];
        if (!svc) return;
        g.innerHTML = ["starter", "growth", "premium"].map(function (k) { return tierCard(svc, k, svc[k], promo); }).join("");
      });
    }).catch(function () { /* noscript fallback covers failure */ });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();
