/* Production widgets: live Web3Forms contact, reviews queue, calculators, admin. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Live contact form (Web3Forms POST, production) ---- */
  $$("form[data-live-contact]").forEach(function (f) {
    var err = $(".form-err", f) || $(".form-error", f), ok = $(".form-ok", f) || $(".form-success", f);
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (err) { err.style.display = "none"; }
      if (ok) { ok.style.display = "none"; }
      var consultF = document.getElementById("consultFields");
      var consult = consultF && !consultF.classList.contains("hidden");
      var name = $("#cf-name", f).value.trim();
      var email = $("#cf-email", f).value.trim();
      var topic = consult ? ((document.getElementById("cfc-topic")||{}).value || "Consultation") : $("#cf-topic", f).value;
      var msg = consult ? ((document.getElementById("cfc-msg")||{}).value || "").trim() : $("#cf-msg", f).value.trim();
      var svcExtra = consult ? "" : ("Service: " + ((document.getElementById("cf-service")||{}).value || "Not specified") + " | Budget: " + ((document.getElementById("cf-budget")||{}).value || "Not specified") + "\n");
      if ($("#cf-company", f).value) { return; } // honeypot
      var problems = [];
      if (name.length < 2) problems.push("your name");
      if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(email)) problems.push("a valid email");
      if (msg.length < 10) problems.push("a message (10+ characters)");
      if (problems.length) {
        if (err) { err.textContent = "Please add " + problems.join(", ") + "."; err.style.display = "block"; err.tabIndex = -1; err.focus(); }
        return;
      }
      var btn = f.querySelector("[type=submit]"); if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      fetch("https://api.web3forms.com/submit", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_key: "fd874481-7338-4901-87c3-1d8e139e08ab", subject: (consult ? "Consultation Request: " : "New Inquiry: ") + topic + " | " + name, name: name, email: email, message: "Topic: " + topic + "\n\n" + msg, from_name: "NexGenShift Website" }) })
        .then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function () {
          if (ok) { ok.textContent = "Thanks, " + name.split(" ")[0] + "! Message received — we reply within one business day."; ok.style.display = "block"; }
          f.querySelectorAll("input[type=text],input[type=email],textarea").forEach(function (i) { i.value = ""; });
          if (btn) { btn.disabled = false; btn.textContent = "Send message →"; }
        }).catch(function () {
          if (err) { err.textContent = "Could not send automatically — please email contact@nexgenshift.com directly."; err.style.display = "block"; }
          if (btn) { btn.disabled = false; btn.textContent = "Send message →"; }
        });
    });
  });

/* ---- Reviews: public list render + submission queue (localStorage, rate-limited) ---- */
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  var listEl = $("#review-list");
  if (listEl) {
    fetch("/data/reviews.json", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (d) {
      var items = (d && d.reviews) || [];
      if (!items.length) {
        listEl.innerHTML = "<div class='card reveal in'><h3>No public reviews yet — be the first.</h3><p>We just opened this review wall. If we've done work you're happy with, share it below. Every submission is human-moderated before it appears here. No fake reviews, ever.</p></div>";
        return;
      }
      listEl.innerHTML = items.map(function (r) {
        var stars = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);
        return "<article class='review-card'><div class='stars' aria-label='" + r.rating + " out of 5 stars'>" + stars + "</div><blockquote>" + esc(r.text) + "</blockquote><cite>— " + esc(r.name) + (r.project ? " · " + esc(r.project) : "") + " · <time>" + esc(r.date) + "</time></cite></div>";
      }).join("");
    }).catch(function () {
      listEl.innerHTML = "<div class='card'><h3>Reviews are loading offline.</h3><p>Static preview could not fetch the review file. Try the local URL directly.</p></div>";
    });
  }
  var rf = $("#review-form");
  if (rf) {
    var rerr = $("#rf-err"), rok = $("#rf-ok");
    rf.addEventListener("submit", function (e) {
      e.preventDefault();
      rerr.style.display = "none"; rok.style.display = "none";
      var now = Date.now();
      var last = parseInt(localStorage.getItem("ngs_review_last") || "0", 10);
      if (now - last < 5 * 60 * 1000) {
        rerr.textContent = "Thanks — you're submitting a little fast. Please wait a few minutes between reviews (anti-spam).";
        rerr.style.display = "block"; return;
      }
      if ($("#rf-website", rf).value) { return; } // honeypot
      var name = $("#rf-name").value.trim();
      var rating = parseInt(($("#rf-rating").value || "0"), 10);
      var text = $("#rf-text").value.trim();
      var consent = $("#rf-consent").checked;
      var problems = [];
      if (name.length < 2 || name.length > 80) problems.push("your name (2–80 chars)");
      if (!(rating >= 1 && rating <= 5)) problems.push("a star rating");
      if (text.length < 20 || text.length > 1500) problems.push("review text (20–1500 chars)");
      if (!consent) problems.push("publication consent (tick the box)");
      if (problems.length) { rerr.textContent = "Please add " + problems.join(", ") + "."; rerr.style.display = "block"; return; }
      var q = [];
      try { q = JSON.parse(localStorage.getItem("ngs_review_queue") || "[]"); } catch (ex) {}
      q.push({ name: name, rating: rating, text: text, project: $("#rf-project").value.trim().slice(0, 120), at: new Date().toISOString(), status: "pending" });
      try {
        localStorage.setItem("ngs_review_queue", JSON.stringify(q));
        localStorage.setItem("ngs_review_last", String(now));
      } catch (ex) {}
      rok.textContent = "Received — thank you! Your review is queued for human moderation and will appear publicly once approved. Nothing is published automatically.";
      rok.style.display = "block";
      rf.reset();
    });
  }

  /* ---- Admin moderation view (local-only) ---- */
  var adminEl = $("#admin-queue");
  if (adminEl) {
    var q = [];
    try { q = JSON.parse(localStorage.getItem("ngs_review_queue") || "[]"); } catch (ex) {}
    if (!q.length) {
      adminEl.innerHTML = "<p class='hint'>Queue is empty on this browser. Submissions made on this device appear here for approve/reject. Export approved items into <code>data/reviews.json</code> to publish.</p>";
    } else {
      adminEl.innerHTML = "<table class='admin-table'><thead><tr><th>When</th><th>Name</th><th>★</th><th>Text</th><th>Action</th></tr></thead><tbody>" +
        q.map(function (r, i) { return "<tr><td>" + esc(r.at) + "</td><td>" + esc(r.name) + "</td><td>" + r.rating + "</td><td>" + esc(r.text.slice(0, 140)) + "</td><td><button class='btn btn-ghost btn-sm' data-approve='" + i + "'>Copy JSON</button></td></tr>"; }).join("") + "</tbody></table>";
      $$("[data-approve]", adminEl).forEach(function (b) {
        b.addEventListener("click", function () {
          var r = q[parseInt(b.getAttribute("data-approve"), 10)];
          var line = JSON.stringify({ name: r.name, rating: r.rating, text: r.text, project: r.project || "", date: r.at.slice(0, 10), source: "site-review-form" });
          if (navigator.clipboard) navigator.clipboard.writeText(line);
          b.textContent = "Copied ✓";
        });
      });
    }
    var exp = $("#admin-export");
    if (exp) exp.addEventListener("click", function () {
      var blob = new Blob([localStorage.getItem("ngs_review_queue") || "[]"], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = "reviews-pending.json"; a.click();
    });
  }

  /* ---- Pricing estimator (example ranges) ---- */
  var est = $("#estimator");
  if (est) {
    var out = $("#est-out");
    function calc() {
      var svc = $("#est-svc").value, size = $("#est-size").value, care = $("#est-care").checked;
      var base = { website: [2500, 9000], app: [8000, 30000], automation: [1500, 8000], system: [6000, 25000], data: [2000, 10000], cloud: [1000, 6000], security: [1200, 7000] }[svc] || [2000, 8000];
      var mult = { s: 0.8, m: 1, l: 1.6 }[size] || 1;
      var lo = Math.round(base[0] * mult / 100) * 100, hi = Math.round(base[1] * mult / 100) * 100;
      var careTxt = care ? " + care plan from <b>$149/mo (example)</b>" : "";
      out.innerHTML = "Example range for your scope: <b>$" + lo.toLocaleString() + " – $" + hi.toLocaleString() + "</b>" + careTxt + ". <span class='hint'>Illustrative examples, not quotes. Final pricing is fixed in writing before we build.</span>";
    }
    ["est-svc", "est-size", "est-care"].forEach(function (id) { $("#" + id).addEventListener("change", calc); });
    calc();
  }

  /* ---- Automation savings calculator ---- */
  var sv = $("#savings");
  if (sv) {
    var so = $("#sav-out");
    function sCalc() {
      var hrs = Math.max(0, parseFloat($("#sv-hrs").value) || 0);
      var rate = Math.max(0, parseFloat($("#sv-rate").value) || 0);
      var weekly = hrs * rate, monthly = weekly * 4.33, yearly = monthly * 12;
      so.innerHTML = "Manual cost of that task: <b>$" + weekly.toFixed(0) + "/wk ≈ $" + monthly.toFixed(0) + "/mo ≈ $" + yearly.toFixed(0) + "/yr</b>. <span class='hint'>Sample math on your inputs — automation typically recovers a share of this, scoped per workflow.</span>";
    }
    ["sv-hrs", "sv-rate"].forEach(function (id) { $("#" + id).addEventListener("input", sCalc); });
    sCalc();
  }

  /* ---- Uptime/status demo (synthetic, labeled) ---- */
  $$("[data-uptime-demo]").forEach(function (el) {
    if (reduced) { el.textContent = "99.99% (illustrative)"; return; }
    var v = 99.9, t = setInterval(function () {
      v = Math.min(99.99, v + 0.01);
      el.textContent = v.toFixed(2) + "% (illustrative)";
      if (v >= 99.99) clearInterval(t);
    }, 120);
  });
})();
