/* NexGenShift intake client: posts to the AWS intake receiver with idempotency,
   tracking IDs, honest errors. Falls back to Web3Forms only if receiver is
   unreachable AND a Web3Forms key is configured (none by default — fail loudly). */
(function () {
  "use strict";
  var ENDPOINT = "https://9erv6r38j8.execute-api.us-east-1.amazonaws.com";
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx".replace(/x/g, function () {
      return ((Math.random() * 16) | 0).toString(16);
    }) + Date.now().toString(16);
  }
  function validEmail(e) { return /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(e || ""); }
  function send(payload, idemKey) {
    return fetch(ENDPOINT + "/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Idempotency-Key": idemKey || uuid() },
      body: JSON.stringify(payload)
    }).then(function (r) {
      return r.json().catch(function () { return { ok: false, error: "bad_response" }; }).then(function (d) {
        if (!r.ok || !d.ok) {
          var err = new Error((d && d.error) || ("http_" + r.status));
          err.details = d && d.details;
          err.trackingId = d && d.trackingId;
          throw err;
        }
        return d;
      });
    });
  }
  window.NGSIntake = { send: send, uuid: uuid, validEmail: validEmail, endpoint: ENDPOINT };
})();
