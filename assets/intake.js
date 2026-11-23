(function(){/* intake engine v3: catalog-driven 6-step guided intake (unified canonical flow) */
"use strict";
var Q=new URLSearchParams(location.search);
var CAT=null;
var S={step:1,service:null,tier:null,upgrades:{},goals:{},notSure:false,promo:null,bizType:""};
var GOALS=["More phone calls","Online bookings","Sell products","Build trust","Show portfolio","Get quote requests","Grow email list","Automate manual work","Move to the cloud","Improve security","Understand my data"];
function $(id){return document.getElementById(id);}
var panels=Array.prototype.slice.call(document.querySelectorAll("[data-step]"));
var labels={1:"Step 1 of 6 — Service",2:"Step 2 of 6 — Package",3:"Step 3 of 6 — Customize",4:"Step 4 of 6 — Budget & timeline",5:"Step 5 of 6 — Business & goals",6:"Step 6 of 6 — Review & submit"};
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;");}
function svc(){return CAT&&S.service?(CAT.services.filter(function(x){return x.id===S.service;})[0]||null):null;}
function tier(){var s=svc();return s?(s[S.tier]||null):null;}
function cardStyle(el,on){el.style.border=on?"2px solid var(--purple)":"1px solid var(--line)";el.style.background=on?"rgba(147,51,234,.12)":"#FBFAFF";el.style.borderRadius="12px";el.style.padding="14px";el.style.cursor="pointer";el.style.fontSize=".86rem";el.style.textAlign="center";}
function chipStyle(el,on){el.style.border=on?"1px solid var(--purple)":"1px solid var(--line)";el.style.background=on?"rgba(147,51,234,.16)":"#F5F0FF";el.style.borderRadius="999px";el.style.padding="8px 16px";el.style.cursor="pointer";el.style.fontSize=".82rem";}
function note(msg){var n=$("preselectNote");if(!n)return;n.textContent="✓ "+msg;n.style.display="block";}
function wizErr(t){var e=$("wizError");if(!e)return;if(!t){e.style.display="none";e.textContent="";return;}e.textContent=t;e.style.display="block";}

function renderServices(){
  var box=$("svcGrid");box.innerHTML="";
  CAT.services.forEach(function(s){
    var d=document.createElement("div");d.className="spick"+(S.service===s.id?" sel":"");d.tabIndex=0;
    d.setAttribute("role","radio");d.setAttribute("aria-checked",S.service===s.id?"true":"false");
    d.innerHTML="<b>"+esc(s.name)+"</b><br><small style=\"color:var(--muted)\">from "+esc((s.starter&&s.starter.priceDisplay)||"Custom Quote")+"</small>";
    function pick(){S.service=s.id;S.tier=null;S.upgrades={};renderServices();renderTiers();renderCustomize();}
    d.onclick=pick;d.onkeydown=function(e){if(e.key===" "||e.key==="Enter"){e.preventDefault();pick();}};
    box.appendChild(d);
  });
  /* Not-sure guidance card */
  var n=document.createElement("div");n.className="spick"+(S.service==="__guidance"?" sel":"");n.tabIndex=0;
  n.setAttribute("role","radio");n.setAttribute("aria-checked",S.service==="__guidance"?"true":"false");
  n.innerHTML="<b>Not sure / Need guidance</b><br><small style=\"color:var(--muted)\">we'll recommend</small>";
  function npick(){S.service="__guidance";S.tier=null;S.upgrades={};S.notSure=true;renderServices();renderTiers(true);renderCustomize(true);}
  n.onclick=npick;n.onkeydown=function(e){if(e.key===" "||e.key==="Enter"){e.preventDefault();npick();}};
  box.appendChild(n);
}
function renderTiers(skipSvc){
  var box=$("tierPick");box.innerHTML="";$("tierPromo").style.display="none";
  var s=svc();
  if(S.service==="__guidance"){box.innerHTML="<p class=\"hint\">Guidance selected — pick the help path below or continue to describe your project. We'll recommend the right service and package.</p>";return;}
  if(!s){box.innerHTML="<p class=\"hint\">Pick a service first.</p>";return;}
  ["starter","growth","premium"].forEach(function(k){
    var t=s[k];var d=document.createElement("div");
    d.className="tpick"+(S.tier===k?" sel":"")+(k==="growth"?" hot":"");d.tabIndex=0;
    d.setAttribute("role","radio");d.setAttribute("aria-checked",S.tier===k?"true":"false");
    d.innerHTML="<h4>"+esc(t.name)+"</h4><div class=\"amt\">"+esc(t.priceDisplay)+"</div><small>"+esc(t.value||"")+"</small>";
    function pick(){S.tier=k;S.upgrades={};S.notSure=false;renderTiers();renderCustomize();}
    d.onclick=pick;d.onkeydown=function(e){if(e.key===" "||e.key==="Enter"){e.preventDefault();pick();}};
    box.appendChild(d);
  });
  if(s.id==="websites"&&S.tier==="starter"&&(CAT.promotions&&CAT.promotions.active)){
    var sbw=CAT.promotions.smallBusinessWebsite;
    $("tierPromo").textContent="✦ "+(CAT.promotions.label||"Limited-Time Offer")+": "+sbw.promoBuildPrice+" build (regularly "+sbw.regularBuildPrice+") + first month free at "+sbw.subscriptionPerMonth+". Billing from month two at launch. "+sbw.appliesTo;
    $("tierPromo").style.display="block";
  }
  var t2=tier();
  if(t2&&(t2.proposedPrice&&t2.price==null)){
    var p=document.createElement("p");p.className="hint";p.style.marginTop="10px";
    p.textContent="Indicative "+t2.proposedPrice+" — pending owner approval, treated as Custom Quote. Not a promise.";
    box.appendChild(p);
  }
}
function renderCustomize(guidance){
  var fl=$("featList"),ul=$("upList");fl.innerHTML="";ul.innerHTML="";
  if(S.service==="__guidance"||guidance){fl.innerHTML="<p class=\"hint\">Not sure where you fit — describe your project in your own words and we'll recommend the service, package, and upgrades.</p>";ul.innerHTML="";($("custHint")).textContent="We'll recommend upgrades after review.";return;}
  var t=tier();if(!t){fl.innerHTML="<p class=\"hint\">Choose a package first.</p>";return;}
  (t.includes||[]).forEach(function(f){
    var d=document.createElement("span");d.className="chipx sel";d.textContent="✓ "+f;
    d.title="Included in "+t.name;fl.appendChild(d);
  });
  var ups=(CAT.upgrades||[]).filter(function(u){return u.services.indexOf(S.service)>=0;});
  ($("custHint")).textContent=ups.length?"Included features are checked. Add premium upgrades that fit (Custom Quote) — or pick “Not sure” and we'll guide you.":"Included features are checked. Pick “Not sure” and we'll guide you.";
  ups.forEach(function(u){
    var d=document.createElement("span");d.className="chipx"+(S.upgrades[u.id]?" sel":"");d.tabIndex=0;
    d.setAttribute("role","checkbox");d.setAttribute("aria-checked",!!S.upgrades[u.id]?"true":"false");
    d.textContent=(S.upgrades[u.id]?"✓ ":"+"+" ")+u.name+" · "+(u.priceDisplay||"Custom Quote");
    function tog(){if(S.upgrades[u.id])delete S.upgrades[u.id];else S.upgrades[u.id]=1;d.classList.toggle("sel",!!S.upgrades[u.id]);d.setAttribute("aria-checked",!!S.upgrades[u.id]?"true":"false");d.textContent=(S.upgrades[u.id]?"✓ ":"+"+" ")+u.name+" · "+(u.priceDisplay||"Custom Quote");}
    d.onclick=tog;d.onkeydown=function(e){if(e.key===" "||e.key==="Enter"){e.preventDefault();tog();}};
    ul.appendChild(d);
  });
  if(!ups.length)ul.innerHTML="<p class=\"hint\">No optional upgrades listed for this service — describe anything extra in your goals.</p>";
}
function renderGoals(){
  var box=$("goalCards");if(!box)return;box.innerHTML="";
  GOALS.forEach(function(g){
    var d=document.createElement("div");d.textContent=g;d.tabIndex=0;
    d.setAttribute("role","checkbox");d.setAttribute("aria-checked",!!S.goals[g]?"true":"false");
    cardStyle(d,!!S.goals[g]);
    function tog(){if(S.goals[g])delete S.goals[g];else S.goals[g]=1;cardStyle(d,!!S.goals[g]);d.setAttribute("aria-checked",!!S.goals[g]?"true":"false");}
    d.onclick=tog;d.onkeydown=function(e){if(e.key===" "||e.key==="Enter"){e.preventDefault();tog();}};
    box.appendChild(d);
  });
}
function estimate(){
  /* Preliminary ONLY: approved numeric prices; guidance/Custom-Quote path is never numeric. */
  var t=tier();if(!t||S.service==="__guidance")return {text:"Custom Quote",numeric:false};
  if(S.service==="websites"&&S.tier==="starter")return {text:"$0 build + $50/month (first month free) — preliminary",numeric:false,promo:true};
  if(typeof t.price==="number")return {text:"From $"+t.price.toLocaleString()+" one-time — preliminary",numeric:true,base:t.price};
  return {text:"Custom Quote — preliminary",numeric:false};
}
function review(){
  var s=svc(),t=tier(),g=Object.keys(S.goals),u=Object.keys(S.upgrades),est=estimate();
  var upNames=u.map(function(id){var f=CAT.upgrades.filter(function(x){return x.id===id;})[0];return f?f.name+" ("+(f.priceDisplay||"Custom Quote")+")":id;});
  var svcLine=S.service==="__guidance"?"Not sure — needs guidance":(s?s.name:"—");
  var tierLine=S.service==="__guidance"?"To be recommended":(t?t.name+" ("+t.priceDisplay+")":"—");
  var incLine=S.service==="__guidance"?"To be recommended":(((t&&(t.includes||[]).join(", "))||"—"));
  $("reviewBox").innerHTML="<b>Service:</b> "+esc(svcLine)+"<br><b>Package:</b> "+esc(tierLine)
    +"<br><b>Included:</b> "+esc(incLine)
    +"<br><b>Upgrades:</b> "+esc(upNames.join(", ")||(S.notSure?"Not sure — help me decide":"None"))
    +"<br><b>Budget:</b> "+esc($("budgetOnce").value)+" · <b>Monthly:</b> "+esc($("budgetMonthly").value)+" · <b>Timeline:</b> "+esc($("timelineSel").value)
    +"<br><b>Preliminary estimate:</b> "+esc(est.text)+(S.promo?"<br><b>Promotion:</b> "+esc(S.promo):"")
    +"<br><span style=\"font-size:.78rem\">Estimate only — fixed quote confirmed in writing before we build.</span>";
}
function render(){
  $("stepLabel").textContent=labels[S.step];
  panels.forEach(function(p){p.classList.toggle("hidden",+p.getAttribute("data-step")!==S.step);});
  var bars=$("stepBar").children;for(var i=0;i<bars.length;i++){bars[i].style.background=i<S.step?"var(--purple)":"var(--lav2)";}
  $("flowBack").style.visibility=S.step===1?"hidden":"visible";
  $("flowNext").classList.toggle("hidden",S.step===6);
  $("flowSubmit").classList.toggle("hidden",S.step!==6);
  if(S.step===6)review();
  window.scrollTo(0,0);
}
$("flowBack").onclick=function(){if(S.step>1){S.step--;render();}};
$("flowNext").onclick=function(){
  wizErr("");
  if(S.step===1&&!S.service){wizErr("Pick a service to continue.");return;}
  if(S.step===2){
    if(S.service==="__guidance"){S.step++;render();return;}
    if(!S.tier){wizErr("Choose Starter, Growth, or Premium to continue.");return;}
  }
  if(S.step===5){
    if(!$("bizName").value.trim()){wizErr("Business name is required.");return;}
    if(!$("bizType").value){wizErr("Pick the closest business type.");return;}
    if(!$("bizDesc").value.trim()){wizErr("Describe your project in a sentence or two.");return;}
  }
  if(S.step<6){S.step++;render();}
};
$("notSure").onclick=function(){S.notSure=true;S.upgrades={};renderCustomize();note("Noted — we'll help you decide on upgrades during scoping.");};
$("timelineSel").onchange=function(){$("expedNote").style.display=$("timelineSel").value==="Expedited"?"block":"none";};
$("flowSubmit").onclick=function(){
  wizErr("");
  var nm=$("cName").value.trim(),em=$("cEmail").value.trim();
  if(nm.length<2||!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(em)){wizErr("Your name and a valid email are required.");return;}
  var btn=$("flowSubmit");btn.textContent="Sending…";btn.disabled=true;
  var s=svc(),t=tier(),g=Object.keys(S.goals).join(", "),u=Object.keys(S.upgrades);
  var upNames=u.map(function(id){var f=CAT.upgrades.filter(function(x){return x.id===id;})[0];return f?f.name+" ("+(f.priceDisplay||"Custom Quote")+")":id;}).join("; ");
  var est=estimate();
  var promoIds=(CAT.promotions&&CAT.promotions.active)?[CAT.promotions.id]:[];
  var promoLine="";
  if(promoIds.indexOf(S.promo)<0)S.promo=null; /* never trust query params beyond the allowlist */
  if(S.promo==="SBW-LAUNCH-2026"&&S.service==="websites"&&S.tier==="starter"){
    promoLine="Promotion: SBW-LAUNCH-2026 — Small-Business Website promo (regular build $750 → promotional build $0 FREE; subscription $50/month, first month FREE, recurring from month two at launch). No payment taken; billing is manual.";
  } else if(S.promo){promoLine="Promotion: "+S.promo+" (see pricing page for current terms). No payment taken; billing is manual.";}
  var phone=($("bizPhone").value.trim()||$("cPhone").value.trim())||"Not specified";
  var siteUrl=($("siteUrl")&&$("siteUrl").value.trim())||"Not specified";
  var extra=(($("timelineNote")&&$("timelineNote").value.trim())||"");
  var svcLine=S.service==="__guidance"?"Not sure — needs guidance":(s?s.name:"Not specified");
  var tierLine=S.service==="__guidance"?"To be recommended":(t?t.name+" ("+t.priceDisplay+")":"Not specified");
  var incLine=S.service==="__guidance"?"To be recommended":(((t&&(t.includes||[]).join(", "))||"Not specified"));
  var subject="New Project Intake: "+$("bizName").value.trim()+" | "+svcLine+" "+(t?t.name:"")+" | "+$("budgetOnce").value+(S.promo?" | promo "+S.promo:"");
  var message=["Business: "+$("bizName").value.trim(),
    "Business type: "+$("bizType").value,
    "Service: "+svcLine,
    "Tier: "+tierLine,
    "Included: "+incLine,
    "Upgrades: "+(upNames||(S.notSure?"Not sure — help me decide":"None")),
    "Goals: "+(g||"Not specified"),
    "Desired functionality: "+($("bizDesc").value.trim()||"Not specified"),
    "Existing website: "+siteUrl,
    "Other requirements: "+(extra||"Not specified"),
    "Phone: "+phone,
    "One-time budget: "+$("budgetOnce").value,
    "Monthly budget: "+$("budgetMonthly").value,
    "Preliminary estimate: "+est.text+" (NOT a final quote)",
    "Timeline: "+$("timelineSel").value,
    promoLine].filter(Boolean).join("\n");
  var payload={kind:"start-intake",subject:subject,name:nm,email:em,message:message,
    source:"start-flow-v3",promo:S.promo||null,
    service:S.service,tier:S.service==="__guidance"?null:S.tier,serviceName:S.service==="__guidance"?"guidance":(s?s.name:null),tierName:t?t.name:null,
    budgetOnce:$("budgetOnce").value,budgetMonthly:$("budgetMonthly").value,
    timeline:$("timelineSel").value,estimate:est.text,estimateNumeric:est.numeric,
    upgrades:u,upgradesDetail:upNames||null,needsGuidance:S.notSure||S.service==="__guidance",
    package:"start-intake",bizType:$("bizType").value,siteUrl:siteUrl==="Not specified"?null:siteUrl,extraNotes:extra||null};
  NGSIntake.send(payload,NGSIntake.uuid()).then(function(d){
    if(!d||!d.ok||!d.trackingId)throw new Error((d&&d.error)||"send_failed");
    $("wizCard").classList.add("hidden");
    $("doneText").textContent="Thank you, "+nm.split(" ")[0]+" — your "+svcLine+" intake"+(t?" ("+t.name+")":"")+" is in (reference "+d.trackingId+"). Preliminary: "+est.text+". We reply within one business day with clear next steps.";
    $("doneCard").classList.remove("hidden");window.scrollTo(0,0);
  }).catch(function(err){wizErr("Could not send automatically ("+((err&&err.message)||"network error")+"). Please email contact@nexgenshift.com directly — your answers are safe on this page, just try again.");btn.textContent="Submit project intake →";btn.disabled=false;});
};
function preselect(){
  /* Validated, allowlisted URL scheme: service, tier, upgrade(s), promo. No PII in URLs. */
  var rawSvc=(Q.get("service")||"").toLowerCase().trim();
  var rawTier=(Q.get("tier")||"").toLowerCase().trim();
  var svcMap={websites:"websites",web:"websites",website:"websites",
    automation:"automation",automations:"automation",workflow:"automation",
    webapps:"webapps",webapp:"webapps",apps:"webapps",
    mobileapps:"mobileapps",mobile:"mobileapps",
    data:"data",dashboards:"data",analytics:"data",
    cloud:"cloud",infrastructure:"cloud",
    integrations:"integrations",integration:"integrations",custom:"integrations",
    business:"business",systems:"business",
    security:"security"};
  var preSvc=svcMap[rawSvc]||(rawSvc==="guidance"?"__guidance":null);
  var tierAllow=["starter","growth","premium"];
  var preTier=tierAllow.indexOf(rawTier)>=0?rawTier:null;
  var pkg=Q.get("package");
  var pkgMap={"web-presence":"websites","business-systems":"webapps","data-cloud":"data","enterprise":null};
  if(preSvc)S.service=preSvc;
  else if(pkg&&pkgMap[pkg])S.service=pkgMap[pkg];
  /* Legacy ?service=business-systems / ?service=data-cloud fallbacks */
  if(!S.service&&rawSvc==="business-systems")S.service="business";
  if(!S.service&&rawSvc==="data-cloud")S.service="data";
  if(preTier&&S.service&&S.service!=="__guidance")S.tier=preTier;
  else if(pkg==="enterprise"){/* enterprise legacy: no tier preselect, customer picks */}
  /* Upgrade preselect: ?upgrade=id or ?upgrades=id1,id2 — must exist in catalog for the chosen service */
  var upRaw=(Q.get("upgrade")||Q.get("upgrades")||"").toLowerCase();
  var preUps=upRaw.split(",").map(function(x){return x.trim();}).filter(Boolean);
  /* Promo: only the active catalog promo id is accepted */
  var activePromo=(CAT.promotions&&CAT.promotions.active)?CAT.promotions.id:null;
  var qPromo=Q.get("promo");
  S.promo=(qPromo&&qPromo===activePromo)?qPromo:null;
  renderServices();renderTiers();renderCustomize();
  if(S.service&&S.service!=="__guidance"&&S.tier){
    var okUp=preUps.filter(function(id){return (CAT.upgrades||[]).some(function(u){return u.id===id&&u.services.indexOf(S.service)>=0;});});
    okUp.forEach(function(id){S.upgrades[id]=1;});
    if(okUp.length)renderCustomize();
  }
  var notes=[];
  if(S.service)notes.push("Service: "+(S.service==="__guidance"?"guidance":S.service));
  if(S.tier)notes.push("Package: "+S.tier);
  if(Object.keys(S.upgrades).length)notes.push("Upgrade: "+Object.keys(S.upgrades).join(", "));
  if(pkg)notes.push("Package ref: "+pkg.replace(/-/g," "));
  if(S.promo){notes.push("Promotion applied: "+S.promo);
    if(S.service==="websites"&&(!S.tier||S.tier==="starter"))notes.push("Small-Business Website promo: $0 build + first month free ($50/mo from month two)");}
  if(notes.length)note(notes.join(" · "));
}
fetch("/config/pricing.json").then(function(r){return r.json();}).then(function(cfg){
  CAT=cfg;
  $("budgetOnce").innerHTML=(cfg.budgetsOnce||[]).map(function(b){return "<option>"+esc(b)+"</option>";}).join("");
  $("budgetMonthly").innerHTML=(cfg.budgetsMonthly||[]).map(function(b){return "<option>"+esc(b)+"</option>";}).join("");
  preselect();renderGoals();render();
}).catch(function(){$("stepLabel").textContent="Pricing catalog failed to load — please refresh or contact us.";});
renderGoals();
})();
