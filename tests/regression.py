"""NexGenShift staging regression suite (stdlib only). Run: python3 tests/regression.py [--base URL]"""
import json, sys, urllib.request, urllib.error

BASE = sys.argv[sys.argv.index("--base") + 1] if "--base" in sys.argv else "http://127.0.0.1:8799"
API = "https://9erv6r38j8.execute-api.us-east-1.amazonaws.com"
ADMIN_KEY = open("/tmp/ngs-admin-key.txt").read().strip()
results = []

def check(name, fn):
    try:
        detail = fn() or "ok"
        results.append((name, True, str(detail)[:160]))
    except AssertionError as e:
        results.append((name, False, str(e)[:200]))
    except Exception as e:
        results.append((name, False, "%s: %s" % (type(e).__name__, str(e)[:150])))

def get(path, timeout=15):
    req = urllib.request.Request(BASE + path, headers={"User-Agent": "NGS-audit/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.status, r.read().decode("utf-8", "replace")

def api(method, path, body=None, headers=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(API + path, data=data, method=method,
                                 headers={"Content-Type": "application/json", **(headers or {})})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode() or "{}")

PAGES = ["/", "/services/", "/services/websites-apps/", "/services/automation/",
         "/services/business-systems/", "/services/data-dashboards/",
         "/services/cloud-infrastructure/", "/services/security/",
         "/solutions/", "/solutions/trades-home-services/", "/solutions/health-wellness/",
         "/solutions/retail-hospitality/", "/solutions/professional-services/",
         "/portfolio/", "/reviews/", "/process/", "/pricing/", "/about/",
         "/contact/", "/start/"]

def t_pages_200():
    bad = []
    for p in PAGES:
        code, _ = get(p)
        if code != 200:
            bad.append("%s=%s" % (p, code))
    assert not bad, "non-200: " + ", ".join(bad)
    return "%d pages 200" % len(PAGES)
check("all-pages-200", t_pages_200)

def t_no_demo_submit():
    _, home = get("/")
    _, start = get("/start/")
    assert "Submit (demo)" not in home, "popup still has demo label"
    assert "guided demo pipeline is coming soon" not in start, "start flow still has demo copy"
    return "no demo-submit text"
check("no-demo-submit-text", t_no_demo_submit)

def t_no_web3forms():
    for a in ["/assets/site.js", "/assets/widgets.js", "/assets/intake.js"]:
        _, js = get(a)
        assert "web3forms" not in js.lower() and "fd874481" not in js, a + " still refs web3forms"
    _, contact = get("/contact/")
    assert "web3forms" not in contact.lower() and "fd874481" not in contact, "contact still refs web3forms"
    return "web3forms removed from js+contact"
check("no-web3forms-refs", t_no_web3forms)

def t_intake_client_wired():
    _, home = get("/")
    assert "intake-client.js" in home, "popup pages missing intake-client.js"
    _, js = get("/assets/intake-client.js")
    assert "9erv6r38j8" in js, "client not pointed at receiver"
    return "receiver wired"
check("intake-client-wired", t_intake_client_wired)

def t_pricing_config():
    _, cfg = get("/config/pricing.json")
    d = json.loads(cfg)
    ids = [p["id"] for p in d["packages"]]
    assert "web-presence" in ids, "missing web-presence"
    wp = [p for p in d["packages"] if p["id"] == "web-presence"][0]
    assert wp["price"] == "$750", "web-presence price changed unexpectedly: " + wp["price"]
    return "pricing intact ($750 web-presence), no promo terms (on hold)"
check("pricing-config-intact", t_pricing_config)

def t_admin_deindexed():
    _, admin = get("/reviews/admin.html")
    assert "noindex" in admin, "admin still indexable"
    assert "wizardModal" not in admin and "data-open-wizard" not in admin, "admin still hosts intake wizard"
    return "admin noindex + wizard removed"
check("reviews-admin-gated", t_admin_deindexed)

def t_api_health():
    code, d = api("GET", "/health")
    assert code == 200 and d.get("ok"), "health failed: %s %s" % (code, d)
    return "health ok"
check("api-health", t_api_health)

def t_api_validation():
    code, d = api("POST", "/intake", {"name": "x", "email": "bad", "message": "short"})
    assert code == 422 and d.get("error") == "validation_failed", "expected 422, got %s %s" % (code, d)
    assert len(d.get("details", [])) == 3, "expected 3 detail errors"
    return "422 + 3 details"
check("api-validation-reject", t_api_validation)

def t_api_submit_persist():
    import time
    key = "reg-%d" % int(time.time())
    code, d = api("POST", "/intake",
                  {"kind": "regression", "subject": "Regression probe - ignore",
                   "name": "Regression Bot", "email": "contact@nexgenshift.com",
                   "message": "Automated regression verification. Please ignore.",
                   "source": "regression-suite"},
                  {"X-Idempotency-Key": key})
    assert code in (200, 201) and d.get("trackingId"), "submit failed: %s %s" % (code, d)
    tid = d["trackingId"]
    code2, d2 = api("POST", "/intake",
                    {"kind": "regression", "subject": "replay",
                     "name": "Regression Bot", "email": "contact@nexgenshift.com",
                     "message": "replay - should dedupe", "source": "regression-suite"},
                    {"X-Idempotency-Key": key})
    assert d2.get("trackingId") == tid and d2.get("deduped"), "idempotency broken: %s" % d2
    code3, d3 = api("GET", "/admin/intakes", headers={"X-Admin-Key": ADMIN_KEY})
    assert code3 == 200 and any(i.get("trackingId") == tid for i in d3.get("items", [])), "record missing from admin"
    code4, _ = api("GET", "/admin/intakes", headers={"X-Admin-Key": "wrong"})
    assert code4 == 401, "admin auth bypass! got %s" % code4
    return "submit %s persisted + deduped + admin-verified" % tid
check("api-submit-persist-idem-admin", t_api_submit_persist)

passed = sum(1 for _, ok, _ in results if ok)
print("=" * 64)
for name, ok, detail in results:
    print(("PASS" if ok else "FAIL"), name, "-", detail)
print("=" * 64)
print("%d/%d passed" % (passed, len(results)))
sys.exit(0 if passed == len(results) else 1)
