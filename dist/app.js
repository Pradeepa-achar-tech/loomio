const canvas=document.querySelector('#canvas'),ctx=canvas.getContext('2d');
const defaults={x:500,y:415,size:260,rotation:0,turn:0,jaw:1,fade:75};
const state={...defaults};let photo=null,photoVisible=true;
let anatomy=initialAnatomy(), selected=null;
function initialAnatomy(){return {face:[[-.65,-.45],[-.72,.18],[-.65,.55],[-.46,.94],[0,1.22],[.46,.94],[.65,.55],[.72,.18],[.65,-.45]],leftEye:[[-.56,.25],[-.21,.25],[-.385,.20],[-.385,.30]],rightEye:[[.14,.25],[.49,.25],[.315,.20],[.315,.30]],lips:[[-.30,.88],[.30,.88],[0,.81],[0,.95]]};}
const controls=[['size','Sphere size',100,420,1,''],['rotation','Head tilt',-50,50,1,'°'],['turn','Face turn',-.7,.7,.01,''],['jaw','Face length',.65,1.4,.01,''],['fade','Photo opacity',0,100,1,'%']];
for(const [id,title,min,max,step,unit] of controls){const label=document.createElement('label');label.className='field';label.innerHTML='<span class="rangehead"><span>'+title+'</span><output id="'+id+'out"></output></span><input type="range" id="'+id+'" min="'+min+'" max="'+max+'" step="'+step+'" value="'+state[id]+'">';document.querySelector('#sliders').append(label);label.querySelector('input').addEventListener('input',e=>{state[id]=Number(e.target.value);sync();draw()});}
function sync(){for(const [id,,,,,unit] of controls){document.querySelector('#'+id).value=state[id];document.querySelector('#'+id+'out').textContent=state[id]+unit;}}
function line(x1,y1,x2,y2,dash=false){ctx.setLineDash(dash?[.025,.018]:[]);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.setLineDash([])}
function ellipse(x,y,rx,ry){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.stroke()}
function draw(exporting=false){exporting=exporting===true;updateMeasurements();ctx.clearRect(0,0,1000,1100);ctx.fillStyle='#fbfaf5';ctx.fillRect(0,0,1000,1100);
if(photo&&photoVisible){const s=Math.min(1000/photo.width,1100/photo.height);ctx.globalAlpha=state.fade/100;ctx.drawImage(photo,(1000-photo.width*s)/2,(1100-photo.height*s)/2,photo.width*s,photo.height*s);ctx.globalAlpha=1;}
if(!photo){ctx.fillStyle='#e7e7db';ctx.font='13px Arial';ctx.textAlign='center';ctx.fillText('YOUR REFERENCE, YOUR PACE',500,1015);}
if(!document.querySelector('#guides').checked)return;
ctx.save();ctx.translate(state.x,state.y);ctx.rotate(state.rotation*Math.PI/180);ctx.scale(state.size,state.size);ctx.strokeStyle=document.querySelector('#color').value;ctx.fillStyle=ctx.strokeStyle;ctx.lineWidth=2/state.size;
const t=state.turn,c=t*.65,brow=.05,nose=brow+.56*state.jaw,chin=brow+1.12*state.jaw,hair=brow-.56*state.jaw;
ellipse(0,0,1,1);
const side=t>=0?-.72:.72;ellipse(side,0,.25+Math.abs(t)*.22,.68);
line(side-.15,0,side+.15,0);line(side,-.68,side,.68);
ctx.beginPath();ctx.moveTo(c,-.98);ctx.quadraticCurveTo(c+t*.55,0,c,chin+.12);ctx.stroke();
line(-.96,brow,.96,brow);line(-.75,hair,.75,hair,true);line(-.84,nose,.84,nose,true);line(-.6,chin,.6,chin,true);
drawAnatomy(exporting);
if(document.querySelector('#labels').checked){ctx.font=(11/state.size)+'px Arial';ctx.textAlign='left';for(const [text,y] of [['HAIRLINE',hair],['BROW',brow],['NOSE',nose],['CHIN',chin]]){line(1.02,y,1.12,y);ctx.fillText(text,1.16,y+.015);}}
ctx.restore();updateMeasurements();}
function load(file){if(!file)return;if(!file.type.startsWith('image/')){statusText('Please choose an image file.');return}if(file.size>20*1024*1024){statusText('Choose an image smaller than 20 MB.');return}const url=URL.createObjectURL(file);const img=new Image();img.onload=async()=>{photo=img;photoVisible=true;Object.assign(state,defaults);anatomy=initialAnatomy();selected=null;document.querySelector('#hide').textContent='Hide photo';sync();draw();statusText('Reference loaded. Position the circle on the cranium and align the brow and chin.');if('FaceDetector' in window){try{const faces=await new FaceDetector({fastMode:true,maxDetectedFaces:1}).detect(img);if(photo===img&&faces.length){const b=faces[0].boundingBox,s=Math.min(1000/img.width,1100/img.height),ox=(1000-img.width*s)/2,oy=(1100-img.height*s)/2;state.size=Math.max(100,Math.min(420,b.width*s*.64));state.x=ox+(b.x+b.width/2)*s;state.y=oy+(b.y+b.height*.38)*s;sync();draw();statusText('Face found. Refine the sphere, brow, and chin to match your reference.')}}catch{statusText('Automatic placement is unavailable. Drag the guides and use the sliders to fit your reference.')}}URL.revokeObjectURL(url)};img.onerror=()=>{URL.revokeObjectURL(url);statusText('Could not open this image. Try JPG, PNG, or WEBP.')};img.src=url}
function statusText(s){document.querySelector('#status').textContent=s}
document.querySelector('#file').addEventListener('change',e=>load(e.target.files[0]));
const drop=document.querySelector('#drop');drop.addEventListener('dragover',e=>{e.preventDefault();drop.style.background='#e4eadb'});drop.addEventListener('dragleave',()=>drop.style.background='');drop.addEventListener('drop',e=>{e.preventDefault();drop.style.background='';load(e.dataTransfer.files[0])});
document.querySelector('#preset').addEventListener('change',e=>{state.turn=Number(e.target.value);sync();draw()});
for(const id of ['color','labels','guides'])document.querySelector('#'+id).addEventListener('input',draw);
document.querySelector('#reset').onclick=()=>{Object.assign(state,defaults);anatomy=initialAnatomy();selected=null;document.querySelector('#preset').value='0';sync();draw()};
document.querySelector('#hide').onclick=()=>{photoVisible=!photoVisible;document.querySelector('#hide').textContent=photoVisible?'Hide photo':'Show photo';draw()};
document.querySelector('#export').onclick=()=>{const a=document.createElement('a');a.download='loomis-study.png';draw(true);a.href=canvas.toDataURL('image/png');a.click();draw()};
const featureNames={leftEye:'Screen-left eye',rightEye:'Screen-right eye',lips:'Lips'};
const pointNames={face:['Left temple','Left cheekbone','Left jaw edge','Left jaw corner','Chin','Right jaw corner','Right jaw edge','Right cheekbone','Right temple'],leftEye:['Left eye outer corner','Left eye inner corner','Left eye upper lid','Left eye lower lid'],rightEye:['Right eye inner corner','Right eye outer corner','Right eye upper lid','Right eye lower lid'],lips:['Left mouth corner','Right mouth corner','Upper lip edge','Lower lip edge']};
const landmark=document.querySelector('#landmark');
for(const [group,names] of Object.entries(pointNames))names.forEach((name,index)=>{const option=document.createElement('option');option.value=group+':'+index;option.textContent=name;landmark.append(option)});
for(const [group,title] of Object.entries(featureNames)){
 const section=document.createElement('div');section.className='featuregroup';
 section.innerHTML='<h3>'+title+'</h3>';
 for(const axis of ['width','height']){
  const label=document.createElement('label');label.className='field';label.innerHTML='<span class="rangehead"><span>'+axis+'</span><output id="'+group+axis+'out"></output></span><input aria-label="'+title+' '+axis+'" id="'+group+axis+'" type="range" min="0.01" max="'+(axis==='width'?'1.3':'.6')+'" step=".005">';
  label.querySelector('input').addEventListener('input',e=>{resizeFeature(group,axis,Number(e.target.value));draw()});section.append(label);
 }
 document.querySelector('#featureControls').append(section);
}
function resizeFeature(group,axis,value){
 const p=anatomy[group],i=axis==='width'?0:2,j=i+1;
 const cx=(p[i][0]+p[j][0])/2,cy=(p[i][1]+p[j][1])/2;
 const dx=p[j][0]-p[i][0],dy=p[j][1]-p[i][1],length=Math.hypot(dx,dy);
 const ux=length?dx/length:axis==='width'?1:0,uy=length?dy/length:axis==='height'?1:0;
 p[i]=[cx-ux*value/2,cy-uy*value/2];p[j]=[cx+ux*value/2,cy+uy*value/2];
}
function toCanvas(p){const a=state.rotation*Math.PI/180;return [state.x+state.size*(p[0]*Math.cos(a)-p[1]*Math.sin(a)),state.y+state.size*(p[0]*Math.sin(a)+p[1]*Math.cos(a))]}
function fromCanvas(p){const a=-state.rotation*Math.PI/180,x=(p[0]-state.x)/state.size,y=(p[1]-state.y)/state.size;return [x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a)]}
function imageFit(){if(!photo)return {scale:1,x:0,y:0};const scale=Math.min(1000/photo.width,1100/photo.height);return {scale,x:(1000-photo.width*scale)/2,y:(1100-photo.height*scale)/2}}
function sourcePoint(p){const q=toCanvas(p),f=imageFit();return [(q[0]-f.x)/f.scale,(q[1]-f.y)/f.scale]}
function distance(a,b){return Math.hypot(a[0]-b[0],a[1]-b[1])}
function drawAnatomy(exporting){
 if(!document.querySelector('#anatomy').checked)return;
 ctx.save();ctx.strokeStyle='#287b9c';ctx.fillStyle='#287b9c';ctx.lineWidth=2/state.size;
 const face=anatomy.face;ctx.beginPath();face.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();
 for(const group of Object.keys(featureNames)){
  const [l,r,top,bottom]=anatomy[group];
  ctx.beginPath();ctx.moveTo(...l);ctx.quadraticCurveTo(top[0]*2-(l[0]+r[0])/2,top[1]*2-(l[1]+r[1])/2,...r);ctx.quadraticCurveTo(bottom[0]*2-(l[0]+r[0])/2,bottom[1]*2-(l[1]+r[1])/2,...l);ctx.stroke();
  line(...l,...r,true);line(...top,...bottom,true);
 }
 if(document.querySelector('#handles').checked&&!exporting){
  for(const [group,points] of Object.entries(anatomy))points.forEach((p,i)=>{
   ctx.beginPath();ctx.arc(...p,(selected===group+':'+i?7:4)/state.size,0,Math.PI*2);ctx.fillStyle=selected===group+':'+i?'#153f50':'#fffef9';ctx.fill();ctx.stroke();
  });
 }
 ctx.restore();
}
function updateMeasurements(){
 const factor=state.size/imageFit().scale,unit=photo?'image px':'canvas px';
 const rows=[];
 for(const [group,title] of Object.entries(featureNames)){
  const p=anatomy[group],w=distance(p[0],p[1]),h=distance(p[2],p[3]);
  for(const [axis,value] of [['width',w],['height',h]]){const slider=document.querySelector('#'+group+axis);slider.value=value;document.querySelector('#'+group+axis+'out').textContent=(value*factor).toFixed(1)+' px';}
  rows.push('<tr><th scope="row">'+title+'</th><td>'+(w*factor).toFixed(1)+'</td><td>'+(h*factor).toFixed(1)+'</td></tr>');
 }
 const gap=distance(anatomy.leftEye[1],anatomy.rightEye[0])*factor;
 document.querySelector('#measurements').innerHTML='<table><caption>Sizes in '+unit+'</caption><thead><tr><th>Feature</th><th>Width</th><th>Height</th></tr></thead><tbody>'+rows.join('')+'</tbody></table><p>Inner eye spacing: '+gap.toFixed(1)+' px<br>Lips / left eye width: '+(distance(anatomy.lips[0],anatomy.lips[1])/Math.max(.0001,distance(anatomy.leftEye[0],anatomy.leftEye[1]))).toFixed(2)+' : 1</p>';
 landmark.value=selected||'';
 for(const id of ['pointX','pointY'])document.querySelector('#'+id).disabled=!selected;
 if(selected){const [group,index]=selected.split(':'),q=sourcePoint(anatomy[group][index]);document.querySelector('#pointX').value=q[0].toFixed(1);document.querySelector('#pointY').value=q[1].toFixed(1);}
}
landmark.addEventListener('change',e=>{selected=e.target.value||null;draw()});
for(const id of ['pointX','pointY'])document.querySelector('#'+id).addEventListener('change',()=>{
 if(!selected)return;const x=Number(document.querySelector('#pointX').value),y=Number(document.querySelector('#pointY').value);if(!Number.isFinite(x)||!Number.isFinite(y))return;
 const f=imageFit(),[g,i]=selected.split(':');anatomy[g][i]=fromCanvas([x*f.scale+f.x,y*f.scale+f.y]);draw();
});
for(const id of ['anatomy','handles'])document.querySelector('#'+id).addEventListener('input',draw);
let drag=null;
function eventPoint(e){const r=canvas.getBoundingClientRect();return [(e.clientX-r.left)*1000/r.width,(e.clientY-r.top)*1100/r.height]}
canvas.addEventListener('pointerdown',e=>{
 const q=eventPoint(e),r=canvas.getBoundingClientRect();let nearest=null,best=18*1000/r.width;
 if(document.querySelector('#guides').checked&&document.querySelector('#anatomy').checked&&document.querySelector('#handles').checked){
  for(const [group,points] of Object.entries(anatomy))points.forEach((p,i)=>{const d=distance(toCanvas(p),q);if(d<best){best=d;nearest=group+':'+i}});
 }
 selected=nearest;drag={point:nearest,start:q,x:state.x,y:state.y};
 canvas.setPointerCapture(e.pointerId);canvas.focus();canvas.style.cursor='grabbing';draw();
});
canvas.addEventListener('pointermove',e=>{
 if(!drag)return;const q=eventPoint(e);
 if(drag.point){const [g,i]=drag.point.split(':');anatomy[g][i]=fromCanvas(q)}
 else {state.x=Math.max(0,Math.min(1000,drag.x+q[0]-drag.start[0]));state.y=Math.max(0,Math.min(1100,drag.y+q[1]-drag.start[1]));}
 draw();
});
function endDrag(){drag=null;canvas.style.cursor='grab'}canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);
canvas.addEventListener('keydown',e=>{
 const directions={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
 if(!selected||!directions[e.key])return;e.preventDefault();const [g,i]=selected.split(':'),p=sourcePoint(anatomy[g][i]),d=directions[e.key],step=e.shiftKey?10:1,f=imageFit();
 anatomy[g][i]=fromCanvas([(p[0]+d[0]*step)*f.scale+f.x,(p[1]+d[1]*step)*f.scale+f.y]);draw();
});
sync();draw();

