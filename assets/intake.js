(function(){/* intake engine (production, light-theme) */
var Q=new URLSearchParams(location.search);
var SERVICE_MAP={web:"Website",mobile:"Mobile app",automation:"Automation",data:"Data & analytics",cloud:"Cloud infrastructure",security:"Security"};
var PKG_MAP={"web-presence":{service:"web"},"business-systems":{service:"mobile"},"data-cloud":{service:"data"},"enterprise":{}};
var NEED_MAP={"more-calls":"More phone calls","bookings":"Online bookings","sell":"Sell products","trust":"Build trust","portfolio":"Show portfolio","quotes":"Get quote requests","email":"Grow email list","events":"Announce events","automate":"Automate manual work","cloud":"Move to the cloud","secure":"Improve security","data":"Understand my data"};
var FEATS_BY_TYPE={
"Security":["Quote form","Service areas map","Camera packages table","Testimonials","Emergency call button","Licensing badges"],
"Restaurant":["Online menu","Reservations","Order pickup","Gallery","Hours & location","Reviews"],
"Retail":["Product catalog","Cart","Promotions","Store locator","Gift cards","Reviews"],
"Real estate":["Listings","Agent bios","Mortgage calculator","Tour scheduler","Neighborhood guides","Testimonials"],
"Website":["Contact form","Testimonials","Photo gallery","FAQ","Blog","Newsletter signup","Map & directions","Social links"],
"Mobile app":["User accounts","Push notifications","Offline mode","In-app payments","App-store listing help","Beta testing group"],
"Automation":["Workflow audit","Tool integrations","Approval flows","Reminder sequences","Data sync","Error alerts"],
"Data & analytics":["Dashboard views","Data pipeline","Scheduled reports","KPI definitions","Data cleanup","AI knowledge search"],
"Cloud infrastructure":["Architecture review","Serverless setup","Backups & recovery","Staging environments","Cost estimate","Monitoring & alerts"],
"Healthcare":["Appointment requests","Services directory","Insurance info","Patient FAQ","Directions & parking","Reviews"],
"Fitness":["Class schedule","Membership signup","Trainer bios","Gallery","Pricing table","Reviews"],
"Legal":["Consultation requests","Practice areas","Attorney bios","Case results","FAQ","Reviews"],
"Home services":["Quote form","Service areas map","Before/after gallery","Testimonials","Emergency call button","Online scheduling"],
"Other":["Contact form","Testimonials","Photo gallery","FAQ","Blog","Map & directions"],
"default":["Contact form","Testimonials","Photo gallery","FAQ","Blog","Newsletter signup","Map & directions","Social links"]};
var GOALS=["More phone calls","Online bookings","Sell products","Build trust","Show portfolio","Get quote requests","Grow email list","Announce events","Automate manual work","Move to the cloud","Improve security","Understand my data"];
var COLORS=[["Purple","#A855F7"],["Indigo","#6366F1"],["Blue","#3B82F6"],["Green","#22C55E"],["Amber","#F59E0B"],["Rose","#F43E5E"]];
var NEED_ASSESS={cloud:1,security:1};
var S={step:1,goals:{},features:{},accent:"#A855F7",service:null,pkg:null,need:null};
function $(id){return document.getElementById(id);}
var panels=Array.prototype.slice.call(document.querySelectorAll("[data-step]"));
var labels={1:"Step 1 of 5 — Business",2:"Step 2 of 5 — Goals",3:"Step 3 of 5 — Features",4:"Step 4 of 5 — Design, budget & timeline",5:"Step 5 of 5 — Review & submit"};
(function preselect(){
  var notes=[],pkg=Q.get("package"),svc=Q.get("service"),need=Q.get("need");
  if(pkg&&PKG_MAP[pkg]){S.pkg=pkg;notes.push("Pre-selected package: "+pkg.replace(/-/g," "));if(PKG_MAP[pkg].service&&!svc)svc=PKG_MAP[pkg].service;}
  if(svc&&SERVICE_MAP[svc]){S.service=svc;notes.push("Pre-selected service: "+SERVICE_MAP[svc]);}
  if(need&&NEED_MAP[need]){S.need=need;S.goals[NEED_MAP[need]]=1;notes.push("Pre-selected goal: "+NEED_MAP[need]);}
  if(need&&!svc&&SERVICE_MAP[need]){S.service=need;notes.push("Pre-selected service: "+SERVICE_MAP[need]);}
  if(S.service){var want={web:"Website",mobile:"Mobile app",automation:"Automation",data:"Data & analytics",cloud:"Cloud infrastructure",security:"Security"}[S.service];var sel=$("bizType");for(var i=0;i<sel.options.length;i++){if(sel.options[i].text.replace(/\s+/g," ").trim()===want){sel.selectedIndex=i;break;}}}
  if(notes.length){var n=$("preselectNote");n.textContent="✓ "+notes.join(" · ");n.style.display="block";}
})();
function cardStyle(el,on){el.style.border=on?"2px solid var(--purple)":"1px solid var(--line)";el.style.background=on?"rgba(147,51,234,.12)":"#FBFAFF";el.style.borderRadius="12px";el.style.padding="14px";el.style.cursor="pointer";el.style.fontSize=".86rem";el.style.textAlign="center";}
function renderGoals(){var box=$("goalCards");box.innerHTML="";GOALS.forEach(function(g){var d=document.createElement("div");d.textContent=g;d.setAttribute("role","checkbox");d.setAttribute("aria-checked",S.goals[g]?"true":"false");d.tabIndex=0;cardStyle(d,!!S.goals[g]);function tog(){if(S.goals[g]){delete S.goals[g];}else{S.goals[g]=1;}cardStyle(d,!!S.goals[g]);d.setAttribute("aria-checked",S.goals[g]?"true":"false");}d.onclick=tog;d.onkeydown=function(e){if(e.key===" "||e.key==="Enter"){e.preventDefault();tog();}};box.appendChild(d);});}
function chipStyle(el,on){el.style.border=on?"1px solid var(--purple)":"1px solid var(--line)";el.style.background=on?"rgba(147,51,234,.16)":"#F5F0FF";el.style.borderRadius="999px";el.style.padding="8px 16px";el.style.cursor="pointer";el.style.fontSize=".82rem";}
function renderColors(){var box=$("colorChips");box.innerHTML="";COLORS.forEach(function(pair){var n=pair[0],h=pair[1];var d=document.createElement("div");d.setAttribute("role","radio");d.setAttribute("aria-checked",S.accent===h?"true":"false");d.tabIndex=0;chipStyle(d,S.accent===h);d.innerHTML='<span style="display:inline-block;width:12px;height:12px;border-radius:99px;background:'+h+'"></span> '+n;function pick(){S.accent=h;Array.prototype.forEach.call(box.children,function(x,i){var on=COLORS[i][1]===h;chipStyle(x,on);x.setAttribute("aria-checked",on?"true":"false");});}d.onclick=pick;d.onkeydown=function(e){if(e.key===" "||e.key==="Enter"){e.preventDefault();pick();}};box.appendChild(d);});}
function bizTypeVal(){return $("bizType").value||(S.service?SERVICE_MAP[S.service]:"");}
function featsFor(){var t=bizTypeVal();return FEATS_BY_TYPE[t]||FEATS_BY_TYPE.default;}
function renderFeats(){var list=featsFor();$("featHint").textContent="Suggested for "+(bizTypeVal()||"your business")+" — pick all you want.";var box=$("featChips");box.innerHTML="";list.forEach(function(f){var d=document.createElement("div");d.textContent=f;d.setAttribute("role","checkbox");d.setAttribute("aria-checked",S.features[f]?"true":"false");d.tabIndex=0;chipStyle(d,!!S.features[f]);function tog(){if(S.features[f]){delete S.features[f];}else{S.features[f]=1;}chipStyle(d,!!S.features[f]);d.setAttribute("aria-checked",S.features[f]?"true":"false");}d.onclick=tog;d.onkeydown=function(e){if(e.key===" "||e.key==="Enter"){e.preventDefault();tog();}};box.appendChild(d);});var showA=S.service&&NEED_ASSESS[S.service];$("assessNote").classList.toggle("hidden",!showA);}
function render(){$("stepLabel").textContent=labels[S.step];panels.forEach(function(p){p.classList.toggle("hidden",+p.getAttribute("data-step")!==S.step);});var bars=$("stepBar").children;for(var i=0;i<bars.length;i++){bars[i].style.background=i<S.step?"var(--purple)":"var(--lav2)";}$("wizBack").style.visibility=S.step===1?"hidden":"visible";$("wizNext").classList.toggle("hidden",S.step===5);$("wizSubmit").classList.toggle("hidden",S.step!==5);if(S.step===5)review();window.scrollTo(0,0);}
function review(){var g=Object.keys(S.goals),f=Object.keys(S.features);$("reviewBox").innerHTML="<strong style=\"color:var(--plum)\">"+($("bizName").value.trim()||"—")+"</strong> · "+(bizTypeVal()||"—")+"<br>Goals: "+(g.join(", ")||"—")+"<br>Features: "+(f.join(", ")||"—")+"<br>Style: "+$("styleSel").value+" · Timeline: "+$("timeline").value+" · Budget: "+$("budget").value;}
function wizErr(t){var e=$("wizError");if(!t){e.style.display="none";e.textContent="";return;}e.textContent=t;e.style.display="block";}
$("wizBack").onclick=function(){if(S.step>1){S.step--;render();}};
$("wizNext").onclick=function(){
  wizErr("");
  if(S.step===1){if(!$("bizName").value.trim()||!bizTypeVal()){wizErr("");alert("Business name and type are required.");return;}}
  if(S.step===2){if(!Object.keys(S.goals).length){alert("Pick at least one goal.");return;}}
  if(S.step===3){renderFeats();if(!Object.keys(S.features).length){alert("Pick at least one feature.");return;}}
  if(S.step<5){S.step++;if(S.step===3)renderFeats();render();}
};
$("wizSubmit").onclick=function(){
  wizErr("");
  var nm=$("cName").value.trim(),em=$("cEmail").value.trim();
  if(!nm||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){wizErr("Your name and a valid email are required.");return;}
  var btn=$("wizSubmit");btn.textContent="Sending…";btn.disabled=true;
  var g=Object.keys(S.goals).join(", "),f=Object.keys(S.features).join(", ");
  var svcLabel=S.service?SERVICE_MAP[S.service]:"Not specified",pkgLabel=S.pkg?S.pkg.replace(/-/g," "):"None",needLabel=S.need?(NEED_MAP[S.need]||S.need):"None";
  var subject="New Project Intake: "+$("bizName").value.trim()+" | "+(S.pkg?("package "+S.pkg):svcLabel)+" | "+$("budget").value;
  var message="Business: "+$("bizName").value.trim()+"\nType: "+bizTypeVal()+"\nDescription: "+($("bizDesc").value.trim()||"Not specified")+"\nPhone: "+($("bizPhone").value.trim()||$("cPhone").value.trim()||"Not specified")+"\nService: "+svcLabel+"\nPackage: "+pkgLabel+"\nNeed: "+needLabel+"\nGoals: "+(g||"Not specified")+"\nFeatures: "+(f||"Not specified")+"\nStyle: "+$("styleSel").value+"\nAccent: "+S.accent+"\nDesign notes: "+($("designNotes").value.trim()||"None")+"\nTimeline: "+$("timeline").value+"\nBudget: "+$("budget").value;
  fetch("https://api.web3forms.com/submit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({access_key:"fd874481-7338-4901-87c3-1d8e139e08ab",subject:subject,name:nm,email:em,message:message,from_name:"NexGenShift Website"})}).then(function(r){return r.json().catch(function(){/* intake engine (production, light-theme) */return {};});}).then(function(d){
    $("wizCard").classList.add("hidden");
    $("doneText").textContent="Thank you, "+nm.split(" ")[0]+" — your intake for "+$("bizName").value.trim()+" is in. Our guided demo pipeline is coming soon: in the meantime we reply within one business day with clear next steps and a first preview of your project.";
    $("doneCard").classList.remove("hidden");window.scrollTo(0,0);
  }).catch(function(){/* intake engine (production, light-theme) */wizErr("Could not send automatically. Please email contact@nexgenshift.com directly — your answers are safe on this page, just try again.");btn.textContent="Submit project intake →";btn.disabled=false;});
};
renderGoals();renderColors();renderFeats();render();
})();
