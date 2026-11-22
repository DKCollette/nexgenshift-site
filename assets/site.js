
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
/* NexGenShift site chrome: nav, reveal, tabs. No intake logic — the canonical
   flow lives in /assets/intake.js on /start/ only; consult uses /contact/. */
})();
