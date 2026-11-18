'use strict';
const plates=[
 {title:'Race kit',numbers:'01 — 02',items:[0,1,2,7],details:['neck binding','five-panel crown','side stripe','diagonal panel']},
 {title:'Warm-up',numbers:'03 — 04',items:[5,4,6,3],details:['shoulder seam','raglan sleeve','curved brim','ribbed cuff']},
 {title:'Carry',numbers:'05 — 06',items:[8,9,10],details:['canvas handle','split hem','loop cap']}
];
const merchandise=[...board.querySelectorAll('.item')];
function element(tag,cls,txt){const node=document.createElement(tag);node.className=cls;if(txt)node.textContent=txt;return node}
for(const [idx,plate] of plates.entries()){
 const sheet=element('section','sheet sheet-'+(idx+1));sheet.id='sheet-'+(idx+1);sheet.setAttribute('aria-label',plate.title+' spread');
 const title=element(idx===0?'h1':'h2','sheet-title',plate.title);sheet.append(title);
 if(idx===0){const runner=new Image();runner.src='studies/stride.webp';runner.alt='';runner.className='stride';sheet.append(runner)}
 for(const [slot,id] of plate.items.entries()){
   const button=merchandise[id];button.classList.add('slot-'+slot);
   const note=element('span','pencil-note',plate.details[slot]);note.setAttribute('aria-hidden','true');
   note.insertAdjacentHTML('afterbegin','<svg viewBox="0 0 76 32" aria-hidden="true"><path d="M72 3 C50 4 33 24 6 25 m8 -5 -9 6 11 1" pathLength="1"/></svg>');
   button.append(note);sheet.append(button);
 }
 sheet.append(element('span','folio-number',plate.numbers));
 board.append(sheet);
}
const tabs=[...document.querySelectorAll('.folios a')];
const sheets=[...board.querySelectorAll('.sheet')];
function setTab(sheet){tabs.forEach((a,i)=>{if(sheets[i]===sheet)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}
setTab(sheets[0]);
const watch=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)setTab(entry.target)},{rootMargin:'-30% 0px -30%'});
sheets.forEach(sheet=>watch.observe(sheet));
