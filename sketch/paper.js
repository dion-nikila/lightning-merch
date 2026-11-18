'use strict';
// Product centers are set to meet the loose ends and gaps in each drawing.
const placements=[
 [12,19,16,16,-6], [35,12,58,9,8], [40,24,50,24,-2],
 [59,18,84,20,9], [84,13,84,39,-6], [88,42,13,46,3],
 [12,51,33,63,-7], [84,63,83,61,6], [62,75,64,81,-3],
 [25,85,25,89,-8], [94,84,47,94,5]
];
board.querySelectorAll('.item').forEach((button,index)=>{
 const [x,y,mx,my,angle]=placements[index];
 for(const [key,value] of Object.entries({x,y,mx,my}))button.style.setProperty('--'+key,value+'%');
 button.style.setProperty('--r',angle+'deg');
 const ring=document.createElementNS('http://www.w3.org/2000/svg','svg');
 ring.setAttribute('viewBox','0 0 100 90');ring.setAttribute('class','pencil-ring');ring.setAttribute('aria-hidden','true');
 const arc=document.createElementNS(ring.namespaceURI,'path');
 arc.setAttribute('d','M76 12C47 -1 14 14 10 43S33 81 59 76s42 -33 26 -54Q72 6 54 8');arc.setAttribute('pathLength','1');ring.append(arc);
 button.append(ring);
});
