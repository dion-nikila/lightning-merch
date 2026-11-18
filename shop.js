'use strict';
const sketchEdition=document.body.dataset.edition==='sketch';
const clothes=['S','M','L','XL'];
const catalog=[
 ['Running tank','Signal orange',clothes,16,20,11,25,10,26,-12],
 ['Club cap','Carbon',null,40,14,15,74,5,31,-9],
 ['Track singlet','Chalk',clothes,63,21,12,74,24,27,9],
 ['Crew socks','Chalk / orange',null,86,28,11,27,86,25,-14],
 ['Warm-up crew','Bone',clothes,13,64,15,24,47,31,9],
 ['Lightning tee','Carbon',clothes,39,44,18,25,31,35,-5],
 ['Club cap','Signal orange',null,65,53,14,72,64,30,7],
 ['Race singlet','Carbon / orange',clothes,30,83,11,27,68,26,-10],
 ['Track tote','Natural',null,53,81,11,72,81,26,8],
 ['Split shorts','Carbon / orange',clothes,75,80,15,74,41,33,-8],
 ['Race bottle','Signal orange',null,91,74,7,70,94,17,11]
].map(([name,color,sizes,x,y,w,mx,my,mw,r],i)=>({name,color,sizes:sizes||['One size'],x,y,w,mx,my,mw,r,id:i,code:'LBN-'+String(i+1).padStart(3,'0'),art:(sketchEdition?'studies/':'products/')+String(i+1).padStart(2,'0')+(sketchEdition?'.webp':'.png?v=2'),price:null,available:true}));
const $=s=>document.querySelector(s),board=$('#board'),dialog=$('dialog'),panel=$('#panel');
const reduce=matchMedia('(prefers-reduced-motion: reduce)'),storageKey='lightning-merch-cart-v1';
let cart=[],lastFocus;
try{const data=JSON.parse(localStorage.getItem(storageKey));if(Array.isArray(data))cart=data.filter(v=>v&&catalog[v.id]?.sizes.includes(v.size)&&Number.isSafeInteger(v.qty)&&v.qty>0)}catch{}
function sync(){try{localStorage.setItem(storageKey,JSON.stringify(cart))}catch{}document.querySelectorAll('.cart-button b').forEach(b=>b.textContent='('+cart.reduce((n,v)=>n+v.qty,0)+')')}
function back(){if(history.state?.merch)history.back();else{history.replaceState(null,'',location.pathname);render()}}
function openPage(key){if(!dialog.open)lastFocus=document.activeElement;history.pushState({merch:true},'','#'+key);render()}
for(const p of catalog){
 const el=document.createElement('button');el.className='item';el.dataset.productId=p.id;el.setAttribute('aria-label',p.name+', '+p.color);
 for(const key of ['x','y','w','mx','my','mw'])el.style.setProperty('--'+key,p[key]+'%');
 el.style.setProperty('--r',p.r+'deg');el.innerHTML='<img class="art" alt="" draggable="false" src="'+p.art+'"><small>'+p.code+'</small>';
 el.onclick=()=>openPage(p.code);el.onpointermove=e=>{if(e.pointerType!=='mouse'||reduce.matches)return;const box=el.getBoundingClientRect();el.style.setProperty('--dx',((e.clientX-box.left)/box.width-.5)*10+'px')};board.append(el);
}
let switching=false;
function browse(p,step){
 const next=catalog[(p.id+step+catalog.length)%catalog.length];
 history.replaceState({merch:history.state?.merch||false},'','#'+next.code);
 switching=true;
 product(next);
 switching=false;
 panel.querySelector('[data-step="'+step+'"]').focus({preventScroll:true});
 if(!reduce.matches)$('.hero').animate([{opacity:.35,translate:(step*14)+'px 0'},{opacity:1,translate:'0 0'}],{duration:200});
}
dialog.addEventListener('keydown',e=>{
 const p=catalog.find(item=>location.hash==='#'+item.code);
 if(!p||e.altKey||e.metaKey||e.ctrlKey)return;
 if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();browse(p,e.key==='ArrowLeft'?-1:1)}
});
function product(p){
 const from=board.querySelector('[data-product-id="'+p.id+'"] img').getBoundingClientRect();panel.className='detail';
 const swatch = {'Signal orange':'#ff580b','Carbon':'#272420','Chalk':'#f1e6d5','Bone':'#ede1cc','Natural':'#e4d5b8','Carbon / orange':'#272420','Chalk / orange':'#f1e6d5'}[p.color];
 panel.innerHTML = `
   <div class="stage">
     <img class="hero" src="${p.art}" alt="${p.color} ${p.name}">
     <nav class="piece-nav" aria-label="Browse the collection">
       <button data-step="-1" aria-label="Previous item">←</button>
       <span>${String(p.id+1).padStart(2,'0')} <em>/</em> ${catalog.length}</span>
       <button data-step="1" aria-label="Next item">→</button>
     </nav>
   </div>
   <div class="info">
     <div class="code">${p.code}</div>
     <h1 id="title">${p.name}</h1>
     <p class="colorway"><i style="background:${swatch}"></i>${p.color}</p>
     <div class="order"><p class="price" hidden></p><div class="size-label">Size</div>
       <div class="sizes" role="group" aria-label="Size"></div>
       <button class="buy" aria-live="polite">[ Add to cart ]</button>
     </div>
   </div>`;
 if(p.price!=null){$('.price').hidden=false;$('.price').textContent='LKR '+p.price.toLocaleString()}
 let size=p.sizes[0];
 for(const s of p.sizes){
   const b=document.createElement(p.sizes.length===1?'span':'button');
   b.textContent=s;
   if(p.sizes.length>1){
     b.setAttribute('aria-pressed',s===size);
     b.onclick=()=>{size=s;for(const v of $('.sizes').children)v.setAttribute('aria-pressed',v===b)};
   }
   $('.sizes').append(b);
 }
 panel.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>browse(p,Number(b.dataset.step)));
 const hero=$('.hero'),to=hero.getBoundingClientRect();
 if(!switching&&!reduce.matches&&from.bottom>0&&from.top<innerHeight)hero.animate([{transform:'translate('+(from.x+from.width/2-to.x-to.width/2)+'px,'+(from.y+from.height/2-to.y-to.height/2)+'px) rotate('+p.r+'deg) scale('+Math.min(from.width/to.width,from.height/to.height)+')'},{transform:'rotate(-7deg)'}],{duration:380,easing:'cubic-bezier(.2,.8,.18,1)'});
 const buy=$('.buy');buy.disabled=!p.available;buy.onclick=()=>{let v=cart.find(v=>v.id===p.id&&v.size===size);if(v)v.qty++;else cart.push({id:p.id,size,qty:1});sync();buy.disabled=true;buy.textContent='[ Added ✓ ]';
 if(!reduce.matches){const spark=document.createElement('i');spark.className='spark';dialog.append(spark);const a=buy.getBoundingClientRect(),b=$('dialog .cart-button').getBoundingClientRect();spark.style.left=a.right+'px';spark.style.top=a.top+'px';spark.animate([{transform:'scale(1)'},{transform:'translate('+(b.left-a.right)+'px,'+(b.bottom-a.top)+'px) scale(.4)'}],{duration:380,easing:'ease-in'}).onfinish=()=>spark.remove()}
 setTimeout(()=>{buy.disabled=false;buy.textContent='[ Add to cart ]'},700)};
}
function basket(){
 panel.className='cart';panel.innerHTML='<h1 id="title">Your cart</h1>';if(!cart.length){panel.insertAdjacentHTML('beforeend','<p>Your cart is empty.</p>');return}
 cart.forEach((v,i)=>{const p=catalog[v.id],row=document.createElement('div');row.className='line';row.innerHTML='<img alt="" src="'+p.art+'"><div>'+p.name+'<br><small>'+p.color+' / '+v.size+'</small></div><div class="actions"><button aria-label="Decrease quantity">−</button><span>'+v.qty+'</span><button aria-label="Increase quantity">+</button><button aria-label="Remove item">×</button></div>';row.querySelectorAll('button').forEach((b,j)=>b.onclick=()=>{if(j===2)cart.splice(i,1);else{v.qty+=j===0?-1:1;if(v.qty===0)cart.splice(i,1)}sync();basket();(panel.querySelectorAll('.line')[Math.min(i,cart.length-1)]?.querySelectorAll('button')[j]||$('#back')).focus()});panel.append(row)});
 if(cart.every(v=>catalog[v.id].price!=null))panel.insertAdjacentHTML('beforeend','<p>Subtotal · LKR '+cart.reduce((n,v)=>n+catalog[v.id].price*v.qty,0).toLocaleString()+'</p>');
 panel.insertAdjacentHTML('beforeend','<p class="muted">Collection preview · Orders haven’t opened yet.</p>')
}
function render(){const key=location.hash.slice(1),p=catalog.find(p=>p.code===key);if(!p&&key!=='cart'){if(dialog.open)dialog.close();lastFocus?.focus({preventScroll:true});return}
 if(!dialog.open)dialog.showModal();$('dialog .cart-button').hidden=!p;if(p)product(p);else basket();$('#back').focus({preventScroll:true})}
$('#back').onclick=back;dialog.oncancel=e=>{e.preventDefault();back()};document.querySelectorAll('.cart-button').forEach(b=>b.onclick=()=>openPage('cart'));window.addEventListener('popstate',render);sync();render();

// A single 38px grid cell changes only when the pointer enters another cell.
const hoverMedia=matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
const glint=document.createElement('span');
glint.className='grid-glint';
glint.setAttribute('aria-hidden','true');
document.body.prepend(glint);
let frame=0,x=0,y=0,lastX=-1,lastY=-1;
function paintGrid(){
 frame=0;
 const col=Math.floor(x/38),row=Math.floor(y/38);
 if(col===lastX&&row===lastY)return;
 lastX=col;lastY=row;
 glint.style.transform='translate('+col*38+'px,'+row*38+'px)';
 glint.style.opacity='1';
}
function pointerGrid(e){
 if(e.pointerType!=='mouse')return;
 x=e.pageX;y=e.pageY;
 if(!frame)frame=requestAnimationFrame(paintGrid);
}
function clearGrid(){
 cancelAnimationFrame(frame);frame=0;lastX=lastY=-1;glint.style.opacity='0';
}
function configureGrid(){
 clearGrid();
 board.removeEventListener('pointermove',pointerGrid);
 if(!sketchEdition&&hoverMedia.matches)board.addEventListener('pointermove',pointerGrid,{passive:true});
}
board.addEventListener('pointerleave',clearGrid);
window.addEventListener('scroll',clearGrid,{passive:true});
hoverMedia.addEventListener('change',configureGrid);
configureGrid();
