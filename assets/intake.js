(function(){/* intake engine v2: catalog-driven 6-step guided intake (staging) */
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
function note(msg){var n=$("preselectNote");n.textContent="✓ "+msg;n.style.display="block";}
function wizErr(t){var e=$("wizError");if(!e)return;if(!t){e.style.display="none";e.textContent="";return;}e.textContent=t;e.style.display="block";}

function renderServices(){
  var box=$("svcGrid");box.innerHTML="";
  CAT.services.forEach(function(s){
    var d=document.createElement("div");d.className="spick"+(S.service===s.id?" sel":"");d.tabIndex=0;
    d.setAttribute("role","radio");d.setAttribute("aria-checked",S.service===s.id?"true":"false");
    d.innerHTML="<b>"+esc(s.name)+"</b><br><small style=\"color:var(--muted)\">from "+esc((s.starter&&s.starter.priceDisplay)||"Custom Quote")+"</small>";
    function pick(){S.service=s.id;S.tier=null;S.upgrades={};renderServices();renderTiers();}
    d.onclick=pick;d.onkeydown=function(e){if(e.key===" "||e.key==="Enter"){e.preventDefault();pick();}};
    box.appendChild(d);
  });
}
function renderTiers(){
  var box=$("tierPick");box.innerHTML="";$("tierPromo").style.display="none";
  var s=svc();if(!s){box.innerHTML="<p class=\"hint\">Pick a service first.</p>";return;}
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
function renderCustomize(){
  var fl=$("featList"),ul=$("upList");fl.innerHTML="";ul.innerHTML="";
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
    d.textContent=(S.upgrades[u.id]?"✓ ":"+ ")+u.name+" · "+(u.priceDisplay||"Custom Quote");
    function tog(){if(S.upgrades[u.id])delete S.upgrades[u.id];else S.upgrades[u.id]=1;d.classList.toggle("sel",!!S.upgrades[u.id]);d.setAttribute("aria-checked",!!S.upgrades[u.id]?"true":"false");d.textContent=(S.upgrades[u.id]?"✓ ":"+ ")+u.name+" · "+(u.priceDisplay||"Custom Quote");}
    d.onclick=tog;d.onkeydown=function(e){if(e.key===" "||e.key==="Enter"){e.preventDefault();tog();}};
    ul.appendChild(d);
  });
  if(!ups.length)ul.innerHTML="<p class=\"hint\">No optional upgrades listed for this service — describe anything extra in your goals.</p>";
}
function renderGoals(){
  var box=$("goalCards");box.innerHTML="";
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
  // Preliminary ONLY: approved starter prices sum; growth/premium/upgrade/custom => Custom Quote path.
  var t=tier();if(!t)return {text:"Custom Quote",numeric:false};
  if(S.service==="websites"&&S.tier==="starter")return {text:"$0 build + $50/month (first month free) — preliminary",numeric:false,promo:true};
  if(typeof t.price==="number")return {text:"From $"+t.price.toLocaleString()+" one-time — preliminary",numeric:true,base:t.price};
  return {text:"Custom Quote — preliminary",numeric:false};
}
function review(){
  var s=svc(),t=tier(),g=Object.keys(S.goals),u=Object.keys(S.upgrades),est=estimate();
  var upNames=u.map(function(id){var f=CAT.upgrades.filter(function(x){return x.id===id;})[0];return f?f.name+" ("+(f.priceDisplay||"Custom Quote")+")":id;});
  $("reviewBox").innerHTML="<b>Service:</b> "+esc(s?s.name:"—")+"<br><b>Package:</b> "+esc(t?t.name:"—")+" ("+esc(t?t.priceDisplay:"—")+")"
    +"<br><b>Included:</b> "+esc((t&&(t.includes||[]).join(", "))||"—")
    +"<br><b>Upgrades:</b> "+esc(upNames.join(", ")||(S.notSure?"Not sure — help me decide":"None"))
    +"<br><b>Budget:</b> "+esc($("budgetOnce").value)+" · <b>Monthly:</b> "+esc($("budgetMonthly").value)+" · <b>Timeline:</b> "+esc($("timelineSel").value)
    +"<br><b>Preliminary estimate:</b> "+esc(est.text)+(S.promo?"<br><b>Promotion:</b> "+esc(S.promo):"")
    +"<br><span style=\"font-size:.78rem\">Estimate only — fixed quote confirmed in writing before we build.</span>";
}
function render(){
  $("stepLabel").textContent=labels[S.step];
  panels.forEach(function(p){p.classList.toggle("hidden",+p.getAttribute("data-step")!==S.step);});
  var bars=$("stepBar").children;for(var i=0;i<bars.length;i++){bars[i].style.background=i<S.step?"var(--purple)":"var(--lav2)";}
  $("wizBack").style.visibility=S.step===1?"hidden":"visible";
  $("wizNext").classList.toggle("hidden",S.step===6);
  $("wizSubmit").classList.toggle("hidden",S.step!==6);
  if(S.step===6)review();
  window.scrollTo(0,0);
}
$("wizBack").onclick=function(){if(S.step>1){S.step--;render();}};
$("wizNext").onclick=function(){
  wizErr("");
  if(S.step===1&&!S.service){wizErr("Pick a service to continue.");return;}
  if(S.step===2&&!S.tier){wizErr("Choose Starter, Growth, or Premium to continue.");return;}
  if(S.step===5&&(!$("bizName").value.trim())){wizErr("Business name is required.");return;}
  if(S.step<6){S.step++;render();}
};
$("notSure").onclick=function(){S.notSure=true;S.upgrades={};renderCustomize();note("Noted — we'll help you decide on upgrades during scoping.");};
$("timelineSel").onchange=function(){$("expedNote").style.display=$("timelineSel").value==="Expedited"?"block":"none";};
$("wizSubmit").onclick=function(){
  wizErr("");
  var nm=$("cName").value.trim(),em=$("cEmail").value.trim();
  if(nm.length<2||!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(em)){wizErr("Your name and a valid email are required.");return;}
  var btn=$("wizSubmit");btn.textContent="Sending…";btn.disabled=true;
  var s=svc(),t=tier(),g=Object.keys(S.goals).join(", "),u=Object.keys(S.upgrades);
  var upNames=u.map(function(id){var f=CAT.upgrades.filter(function(x){return x.id===id;})[0];return f?f.name+" ("+(f.priceDisplay||"Custom Quote")+")":id;}).join("; ");
  var est=estimate();
  var promoLine="";
  if(S.promo==="SBW-LAUNCH-2026"&&S.service==="websites"&&S.tier==="starter"){
    promoLine="Promotion: SBW-LAUNCH-2026 — Small-Business Website promo (regular build $750 → promotional build $0 FREE; subscription $50/month, first month FREE, recurring from month two at launch). No payment taken; billing is manual.";
  } else if(S.promo){promoLine="Promotion: "+S.promo+" (see pricing page for current terms). No payment taken; billing is manual.";}
  var subject="New Project Intake: "+$("bizName").value.trim()+" | "+(s?s.name:"General")+" "+(t?t.name:"")+" | "+$("budgetOnce").value+(S.promo?" | promo "+S.promo:"");
  var message=["Business: "+$("bizName").value.trim(),
    "Service: "+(s?s.name:"Not specified"),
    "Tier: "+(t?t.name+" ("+t.priceDisplay+")":"Not specified"),
    "Included: "+((t&&(t.includes||[]).join(", "))||"Not specified"),
    "Upgrades: "+(upNames||(S.notSure?"Not sure — help me decide":"None")),
    "Goals: "+(g||"Not specified"),
    "Description: "+(($("bizDesc").value.trim())||"Not specified"),
    "Phone: "+(($("bizPhone").value.trim()||$("cPhone").value.trim())||"Not specified"),
    "One-time budget: "+$("budgetOnce").value,
    "Monthly budget: "+$("budgetMonthly").value,
    "Preliminary estimate: "+est.text+" (NOT a final quote)",
    "Timeline: "+$("timelineSel").value,
    promoLine].filter(Boolean).join("\n");
  var payload={kind:"start-intake",subject:subject,name:nm,email:em,message:message,
    source:"start-flow-v2",promo:S.promo||null,
    service:S.service,tier:S.tier,serviceName:s?s.name:null,tierName:t?t.name:null,
    budgetOnce:$("budgetOnce").value,budgetMonthly:$("budgetMonthly").value,
    timeline:$("timelineSel").value,estimate:est.text,estimateNumeric:est.numeric,
    upgrades:u,upgradesDetail:upNames||null,needsGuidance:S.notSure};
  NGSIntake.send(payload,NGSIntake.uuid()).then(function(d){
    if(!d||!d.ok||!d.trackingId)throw new Error((d&&d.error)||"send_failed");
    $("wizCard").classList.add("hidden");
    $("doneText").textContent="Thank you, "+nm.split(" ")[0]+" — your "+(s?s.name:"project")+" intake ("+(t?t.name:"")+") is in (reference "+d.trackingId+"). Preliminary: "+est.text+". We reply within one business day with clear next steps.";
    $("doneCard").classList.remove("hidden");window.scrollTo(0,0);
  }).catch(function(err){wizErr("Could not send automatically ("+((err&&err.message)||"network error")+"). Please email contact@nexgenshift.com directly — your answers are safe on this page, just try again.");btn.textContent="Submit project intake →";btn.disabled=false;});
};
fetch("/config/pricing.json").then(function(r){return r.json();}).then(function(cfg){
  CAT=cfg;
  $("budgetOnce").innerHTML=(cfg.budgetsOnce||[]).map(function(b){return "<option>"+esc(b)+"</option>";}).join("");
  $("budgetMonthly").innerHTML=(cfg.budgetsMonthly||[]).map(function(b){return "<option>"+esc(b)+"</option>";}).join("");
  var preSvc=(Q.get("service")||"").toLowerCase(),preTier=(Q.get("tier")||"").toLowerCase();
  var svcMap={websites:"websites",web:"websites",automation:"automation",mobileapps:"mobileapps",mobile:"mobileapps",business:"webapps",data:"data",dashboards:"data",cloud:"cloud",security:"cloud"};
  if(preSvc&&svcMap[preSvc])S.service=svcMap[preSvc];
  if(preTier&&["starter","growth","premium"].indexOf(preTier)>=0)S.tier=preTier;
  var pkg=Q.get("package");
  if(pkg==="web-presence"&&!S.service){S.service="websites";}
  if(pkg==="business-systems"&&!S.service){S.service="webapps";}
  if(pkg==="data-cloud"&&!S.service){S.service="data";}
  S.promo=Q.get("promo")||null;
  var notes=[];
  if(S.service)notes.push("Service: "+S.service);
  if(S.tier)notes.push("Package: "+S.tier);
  if(pkg)notes.push("Package ref: "+pkg.replace(/-/g," "));
  if(S.promo){notes.push("Promotion applied: "+S.promo);
    if(S.service==="websites"&&(!S.tier||S.tier==="starter"))notes.push("Small-Business Website promo: $0 build + first month free ($50/mo from month two)");}
  if(notes.length)note(notes.join(" · "));
  renderServices();renderTiers();renderCustomize();renderGoals();render();
}).catch(function(){$("stepLabel").textContent="Pricing catalog failed to load — please refresh or contact us.";});
renderGoals();
})();
