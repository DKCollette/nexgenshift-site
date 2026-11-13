/* Contact dual-mode toggle (production): Ready-to-build vs Need-guidance. */
(function () {
  "use strict";
  var buildBtn = document.getElementById("modeBuild"),
      consultBtn = document.getElementById("modeConsult"),
      buildF = document.getElementById("buildFields"),
      consultF = document.getElementById("consultFields");
  if (!buildBtn || !consultBtn || !buildF || !consultF) return;
  function setMode(mode) {
    var c = mode === "consult";
    buildF.classList.toggle("hidden", c);
    consultF.classList.toggle("hidden", !c);
    buildBtn.setAttribute("aria-selected", c ? "false" : "true");
    consultBtn.setAttribute("aria-selected", c ? "true" : "false");
    try {
      var u = new URL(location.href);
      if (c) { u.searchParams.set("mode", "consult"); }
      else { u.searchParams.delete("mode"); }
      history.replaceState(null, "", u.toString());
    } catch (e) {}
  }
  buildBtn.addEventListener("click", function () { setMode("build"); });
  consultBtn.addEventListener("click", function () { setMode("consult"); });
  var m = "build";
  try { m = new URLSearchParams(location.search).get("mode") === "consult" ? "consult" : "build"; } catch (e) {}
  setMode(m);
})();
