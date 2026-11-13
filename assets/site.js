
(function(){
"use strict";
document.getElementById('year').textContent=new Date().getFullYear();
document.documentElement.classList.add('js-reveal');
/* mobile nav */
var ham=document.getElementById('hamburger'),nav=document.getElementById('primaryNav'),cta=document.querySelector('.nav-cta');
ham.addEventListener('click',function(){var open=nav.classList.toggle('mobile-open');cta.classList.toggle('mobile-open',open);ham.setAttribute('aria-expanded',open);ham.textContent=open?'✕':'☰';});
/* reveal */
var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reduced&&'IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12});document.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});}
else{document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('in');});}
/* tabs */
var tabs=Array.prototype.slice.call(document.querySelectorAll('[role=tab]'));
function activate(tab){tabs.forEach(function(t){var on=t===tab;t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1;var p=document.getElementById(t.getAttribute('aria-controls'));if(on){p.hidden=false;p.classList.add('active');}else{p.classList.remove('active');p.hidden=true;}});}
tabs.forEach(function(t,i){t.addEventListener('click',function(){activate(t);});t.addEventListener('keydown',function(e){var j=null;if(e.key==='ArrowRight')j=(i+1)%tabs.length;else if(e.key==='ArrowLeft')j=(i-1+tabs.length)%tabs.length;else if(e.key==='Home')j=0;else if(e.key==='End')j=tabs.length-1;if(j!==null){e.preventDefault();tabs[j].focus();activate(tabs[j]);}});});
/* wizard */
var modal=document.getElementById('wizardModal'),step=1,type='',lastFocus=null;
var next=document.getElementById('wizNext'),back=document.getElementById('wizBack');
function show(n){step=n;document.querySelectorAll('.wpane').forEach(function(p){p.classList.toggle('on',+p.dataset.pane===n);});[1,2,3,4].forEach(function(i){document.getElementById('s'+i).classList.toggle('done',i<=Math.min(n,4));});back.style.visibility=(n===1||n===5)?'hidden':'visible';next.textContent=n===4?'Submit (demo)' :(n===5?'Done':'Continue →');if(n===4){document.getElementById('wizReview').textContent='Type: '+(type||'Not selected yet')+' — '+(document.getElementById('wGoal').value||'no description yet')+'.';}}
function openWiz(mode){lastFocus=document.activeElement;modal.classList.add('open');document.body.style.overflow='hidden';if(mode==='consult'){type='Consultation';}show(1);document.getElementById('wizClose').focus();}
function closeWiz(){modal.classList.remove('open');document.body.style.overflow='';show(1);if(lastFocus)lastFocus.focus();}
document.querySelectorAll('[data-open-wizard]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();openWiz(b.dataset.mode);});});
document.getElementById('wizClose').addEventListener('click',closeWiz);
modal.addEventListener('click',function(e){if(e.target===modal)closeWiz();});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&modal.classList.contains('open'))closeWiz();});
document.querySelectorAll('#typeGrid .opt').forEach(function(o){o.addEventListener('click',function(){document.querySelectorAll('#typeGrid .opt').forEach(function(x){x.classList.remove('sel');});o.classList.add('sel');type=o.dataset.val;});});
back.addEventListener('click',function(){if(step>1)show(step-1);});
next.addEventListener('click',function(){
if(step<4){show(step+1);return;}
if(step===4){
var nm=document.getElementById('wName'),em=document.getElementById('wEmail'),gl=document.getElementById('wGoal');
var err=document.getElementById('wizErr');
function werr(m){if(!err){var d=document.createElement('p');d.id='wizErr';d.style.color='#b91c1c';document.querySelector('.wizard').appendChild(d);err=d;}err.textContent=m||'';err.style.display=m?'block':'none';}
werr('');
var n=nm?nm.value.trim():'',e=em?em.value.trim():'';
if(n.length<2||!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(e)){werr('Please add your name and a valid email.');return;}
next.disabled=true;next.textContent='Sending…';
fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({access_key:'fd874481-7338-4901-87c3-1d8e139e08ab',subject:'New Project Brief: '+(type||'General')+' | '+n,name:n,email:e,message:'Type: '+(type||'Not selected')+'\nGoal: '+((gl&&gl.value.trim())||'Not specified')+'\nBudget: '+((document.getElementById('wBudget')||{}).value||'Not specified'),from_name:'NexGenShift Website'})}).then(function(r){return r.json().catch(function(){return {};});}).then(function(){next.disabled=false;show(5);}).catch(function(){next.disabled=false;next.textContent='Submit →';werr('Could not send automatically — please email contact@nexgenshift.com directly.');});
return;}
closeWiz();});
})();
