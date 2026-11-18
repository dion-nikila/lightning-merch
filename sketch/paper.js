'use strict';
// Each gesture is finite. A quiet page schedules no drawing loop.
const svgNS='http://www.w3.org/2000/svg';
function drawing(tag,attrs){
  const node=document.createElementNS(svgNS,tag);
  for(const [key,value] of Object.entries(attrs))node.setAttribute(key,value);
  return node;
}
const marks=[
 'M13 36Q20 16 49 11M20 31Q27 19 39 16',
 'M108 21l7 -8m-2 15 13 -4m-13 12 9 2',
 'M17 91q-8 11 14 7t20 -2',
 'M96 94q21 -1 24 -16m-5 5 5 -6 3 8'
];
board.querySelectorAll('.item').forEach((item,index)=>{
 const ink=drawing('svg',{viewBox:'0 0 134 112',class:'hover-ink','aria-hidden':true});
 ink.append(drawing('path',{d:marks[index%marks.length],pathLength:1}));
 item.append(ink);
});
const margin=drawing('svg',{class:'margin-ink',viewBox:'0 0 1000 680',preserveAspectRatio:'none','aria-hidden':true});
const notes=[
 ['M24 93q13 -7 19 -21l-8 4 8 -17 -17 18 9 -2 -11 18', '#de6b3a'],
 ['M718 31q10 -6 18 -3t18 -4m-30 11 25 -7','#777066'],
 ['M913 393q21 10 45 -8m-12 2 12 -2 -4 10','#847d71'],
 ['M91 591l25 -6 -14 8 28 -9 -9 7 17 -5','#be603b'],
 ['M505 348q-8 8 -5 13m3 -18q-8 7 -9 13','#aba59c']
];
for(const [d,stroke] of notes)margin.append(drawing('path',{d,stroke,fill:'none','stroke-width':1.35,'stroke-linecap':'round','vector-effect':'non-scaling-stroke'}));
board.after(margin);
const strokeLayer=drawing('svg',{'aria-hidden':true,class:'pencil-layer'});
document.body.append(strokeLayer);
let live=null,lastPoint=null;
function stopStroke(){
 if(!live)return;
 const path=live;
 live=null;lastPoint=null;
 path.classList.add('fading');
 setTimeout(()=>path.remove(),1100);
}
board.addEventListener('pointerdown',e=>{
 if(reduce.matches||e.pointerType!=='mouse'||e.button!==0||e.target!==board)return;
 stopStroke();
 live=drawing('path',{d:'M'+e.clientX+' '+e.clientY});
 strokeLayer.append(live);lastPoint=[e.clientX,e.clientY];
 board.setPointerCapture(e.pointerId);
});
board.addEventListener('pointermove',e=>{
 if(!live)return;
 if(Math.hypot(e.clientX-lastPoint[0],e.clientY-lastPoint[1])<3)return;
 live.setAttribute('d',live.getAttribute('d')+' L'+e.clientX+' '+e.clientY);
 lastPoint=[e.clientX,e.clientY];
});
for(const type of ['pointerup','pointercancel','lostpointercapture'])board.addEventListener(type,stopStroke);
