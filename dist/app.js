const canvas=document.querySelector('#canvas'),ctx=canvas.getContext('2d');
const defaults={x:500,y:415,size:260,rotation:0,turn:0,jaw:1,fade:75};
const state={...defaults};let photo=null,photoVisible=true;
const controls=[['size','Sphere size',100,420,1,''],['rotation','Head tilt',-50,50,1,'°'],['turn','Face turn',-.7,.7,.01,''],['jaw','Face length',.65,1.4,.01,''],['fade','Photo opacity',0,100,1,'%']];
for(const [id,title,min,max,step,unit] of controls){const label=document.createElement('label');label.className='field';label.innerHTML='<span class="rangehead"><span>'+title+'</span><output id="'+id+'out"></output></span><input type="range" id="'+id+'" min="'+min+'" max="'+max+'" step="'+step+'" value="'+state[id]+'">';document.querySelector('#sliders').append(label);label.querySelector('input').addEventListener('input',e=>{state[id]=Number(e.target.value);sync();draw()});}
function sync(){for(const [id,,,,,unit] of controls){document.querySelector('#'+id).value=state[id];document.querySelector('#'+id+'out').textContent=state[id]+unit;}}
function line(x1,y1,x2,y2,dash=false){ctx.setLineDash(dash?[.025,.018]:[]);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.setLineDash([])}
function ellipse(x,y,rx,ry){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.stroke()}
function draw(){ctx.clearRect(0,0,1000,1100);ctx.fillStyle='#fbfaf5';ctx.fillRect(0,0,1000,1100);
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
const left=-.86+Math.max(t,0)*.13,right=.86+Math.min(t,0)*.13;
ctx.beginPath();ctx.moveTo(left,.48);ctx.lineTo(-.65,nose+.25);ctx.quadraticCurveTo(c-.3,chin+.05,c,chin+.06);ctx.quadraticCurveTo(c+.3,chin+.05,.65,nose+.25);ctx.lineTo(right,.48);ctx.stroke();
line(-.82,brow+.2,.82,brow+.2,true);
if(document.querySelector('#labels').checked){ctx.font=(11/state.size)+'px Arial';ctx.textAlign='left';for(const [text,y] of [['HAIRLINE',hair],['BROW',brow],['NOSE',nose],['CHIN',chin]]){line(1.02,y,1.12,y);ctx.fillText(text,1.16,y+.015);}}
ctx.restore();}
function load(file){if(!file)return;if(!file.type.startsWith('image/')){statusText('Please choose an image file.');return}if(file.size>20*1024*1024){statusText('Choose an image smaller than 20 MB.');return}const url=URL.createObjectURL(file);const img=new Image();img.onload=async()=>{photo=img;photoVisible=true;Object.assign(state,defaults);document.querySelector('#hide').textContent='Hide photo';sync();draw();statusText('Reference loaded. Position the circle on the cranium and align the brow and chin.');if('FaceDetector' in window){try{const faces=await new FaceDetector({fastMode:true,maxDetectedFaces:1}).detect(img);if(photo===img&&faces.length){const b=faces[0].boundingBox,s=Math.min(1000/img.width,1100/img.height),ox=(1000-img.width*s)/2,oy=(1100-img.height*s)/2;state.size=Math.max(100,Math.min(420,b.width*s*.64));state.x=ox+(b.x+b.width/2)*s;state.y=oy+(b.y+b.height*.38)*s;sync();draw();statusText('Face found. Refine the sphere, brow, and chin to match your reference.')}}catch{statusText('Automatic placement is unavailable. Drag the guides and use the sliders to fit your reference.')}}URL.revokeObjectURL(url)};img.onerror=()=>{URL.revokeObjectURL(url);statusText('Could not open this image. Try JPG, PNG, or WEBP.')};img.src=url}
function statusText(s){document.querySelector('#status').textContent=s}
document.querySelector('#file').addEventListener('change',e=>load(e.target.files[0]));
const drop=document.querySelector('#drop');drop.addEventListener('dragover',e=>{e.preventDefault();drop.style.background='#e4eadb'});drop.addEventListener('dragleave',()=>drop.style.background='');drop.addEventListener('drop',e=>{e.preventDefault();drop.style.background='';load(e.dataTransfer.files[0])});
document.querySelector('#preset').addEventListener('change',e=>{state.turn=Number(e.target.value);sync();draw()});
for(const id of ['color','labels','guides'])document.querySelector('#'+id).addEventListener('input',draw);
document.querySelector('#reset').onclick=()=>{Object.assign(state,defaults);document.querySelector('#preset').value='0';sync();draw()};
document.querySelector('#hide').onclick=()=>{photoVisible=!photoVisible;document.querySelector('#hide').textContent=photoVisible?'Hide photo':'Show photo';draw()};
document.querySelector('#export').onclick=()=>{const a=document.createElement('a');a.download='loomis-study.png';a.href=canvas.toDataURL('image/png');a.click()};
let drag=null;
canvas.addEventListener('pointerdown',e=>{const r=canvas.getBoundingClientRect();drag={x:e.clientX,y:e.clientY,px:state.x,py:state.y,sx:1000/r.width,sy:1100/r.height};canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing'});
canvas.addEventListener('pointermove',e=>{if(!drag)return;state.x=Math.max(0,Math.min(1000,drag.px+(e.clientX-drag.x)*drag.sx));state.y=Math.max(0,Math.min(1100,drag.py+(e.clientY-drag.y)*drag.sy));draw()});
function endDrag(){drag=null;canvas.style.cursor='grab'}canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);
sync();draw();

