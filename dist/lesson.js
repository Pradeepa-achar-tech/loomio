const lessonSteps=[
 {title:'Look before you draw',body:'The head turns slightly toward screen-left. Compare the two visible sides: the screen-left eye is narrower, and more side plane is visible on screen-right. Start with large forms, not individual hairs.',task:'On paper: lightly mark the top of the cranium and the bottom of the chin.',paths:[]},
 {title:'Build the cranium sphere',body:'Draw a light circle around the underlying skull. Hair adds volume outside it. This circle is a construction estimate: it does not trace the cheek or the face silhouette.',task:'On paper: sketch the circle with several light passes. Leave room below it for the jaw.',paths:['M 525 335 A 120 120 0 1 1 285 335 A 120 120 0 1 1 525 335']},
 {title:'Cut the visible side plane',body:'Flatten the screen-right side of the ball with an oval. Its vertical axis follows the head tilt. This plane helps locate the temple and ear; it is not an extra outline of the face.',task:'On paper: add the oval and its cross. Compare its position to the visible ear.',paths:['M 508 330 C 526 437 466 458 454 351 C 442 244 490 223 508 330','M 470 260 L 495 415','M 452 345 L 513 334']},
 {title:'Wrap the brow and centerline',body:'The brow slopes upward toward screen-right in this photo. Curve the centerline down the front of the head through the nose and chin. Keep it left of the sphere center to show the turn.',task:'On paper: place the brow through the eyebrows, then the centerline. Check the tilt before continuing.',paths:['M 295 328 Q 390 300 507 315','M 350 241 Q 326 300 342 364 Q 348 409 364 495']},
 {title:'Compare hairline, nose and chin',body:'Use roughly equal hairline-to-brow, brow-to-nose, and nose-to-chin intervals as a starting framework. Here the hairline is partly covered and the beard hides the chin, so the marks are estimates. Observation takes priority over equal thirds.',task:'On paper: compare the three intervals. Do not force the portrait into identical divisions.',paths:['M 320 261 Q 366 239 405 252','M 310 397 Q 356 381 425 384','M 338 506 Q 373 496 411 496','M 545 253 L 545 315 M 539 253 L 551 253 M 539 315 L 551 315','M 545 315 L 545 384 M 539 384 L 551 384','M 545 384 L 545 496 M 539 496 L 551 496']},
 {title:'Find the face inside the sphere',body:'Now mark the visible temple, cheek and jaw edge inside the circle. Notice the space between the screen-left cheek and the sphere: that is expected because the cranium and face are different forms. On screen-right, separate the cheek from the ear and side plane.',task:'On paper: connect temple to cheek to jaw. Keep the beard silhouette separate from the estimated jaw.',paths:['M 305 302 Q 299 347 312 394 Q 319 445 341 480 Q 364 505 393 499 Q 445 480 471 418 Q 486 380 477 350','M 341 480 Q 365 485 393 478'],color:'#287b9c'},
 {title:'Measure the eyes',body:'Fit each eye separately along the tilted eye line. The nearer screen-right eye is wider in this view; do not duplicate one eye or enforce a one-eye gap. Compare inner corners, widths, and the small visible opening of each lid.',task:'On paper: mark four eye corners first. Compare the gap with each eye width before drawing lids.',paths:['M 308 337 Q 324 325 342 332 Q 327 347 308 337','M 377 327 Q 401 308 425 322 Q 401 337 377 327','M 308 354 L 342 349 M 308 350 L 308 358 M 342 345 L 342 353','M 377 345 L 425 340 M 377 341 L 377 349 M 425 336 L 425 344','M 342 332 L 377 327'],color:'#287b9c'},
 {title:'Place the mouth, then practice',body:'Locate the mouth below the nose using the centerline, then compare its width with the eyes. The moustache partly covers the upper lip; draw a restrained estimate, not the entire moustache as a lip. Fade the photo to check the construction on its own.',task:'On paper: mark the mouth corners and lip opening. Start a second sketch from memory, then compare it with this study.',paths:['M 348 425 Q 371 409 397 421 Q 373 435 348 425','M 349 425 Q 371 419 397 421','M 348 446 L 397 442 M 348 442 L 348 450 M 397 438 L 397 446'],color:'#287b9c'}
];
const lessonDialog=document.createElement('dialog');lessonDialog.className='lesson-dialog';
lessonDialog.setAttribute('aria-labelledby','lesson-title');
lessonDialog.innerHTML='<div class="lesson-top"><div><span class="eyebrow">GUIDED PORTRAIT STUDY</span><h2 id="lesson-title">Learn the Loomis method</h2></div><button id="lesson-close" aria-label="Close lesson">✕</button></div><div class="lesson-layout"><div class="lesson-art"><svg id="lesson-svg" viewBox="245 180 320 380" role="img" aria-label="Your reference portrait with animated Loomis construction"><rect x="0" y="0" width="800" height="1200" fill="#fbfaf5"/><image id="lesson-photo" href="assets/lesson-reference.jpeg" x="0" y="0" width="800" height="1200" opacity=".65"/><g id="lesson-paths" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></g></svg><label class="lesson-fade">Reference visibility <input id="lesson-fade" type="range" min="0" max="100" value="65"></label><small>Hand-placed teaching guides. Hidden jaw and hairline are approximate.</small></div><div class="lesson-copy"><div id="lesson-stepcount"></div><h3 id="lesson-heading"></h3><p id="lesson-body"></p><div class="lesson-task"><strong>Your turn</strong><p id="lesson-task"></p></div><div class="lesson-playback"><button id="lesson-prev">← Back</button><button id="lesson-play" class="primary">Play all</button><button id="lesson-next">Next →</button><button id="lesson-replay">↻ Replay step</button></div><label class="lesson-speed">Playback speed <select id="lesson-speed"><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="1.5">1.5×</option></select></label><nav id="lesson-nav" aria-label="Lesson steps"></nav><p id="lesson-state" role="status"></p></div></div>';
document.body.append(lessonDialog);
const lq=id=>lessonDialog.querySelector('#'+id);
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let lessonIndex=0,lessonTime=0,lessonPlaying=false,lessonAuto=false,lessonFrame=0,lessonLast=0,lessonPaths=[];
const duration=8000,drawDuration=2600;
for(const [i,step] of lessonSteps.entries()){
 const button=document.createElement('button');button.textContent=(i+1)+'. '+step.title;
 button.onclick=()=>setLessonStep(i);lq('lesson-nav').append(button);
}
function setLessonStep(index,auto=false){
 cancelAnimationFrame(lessonFrame);
 lessonIndex=Math.max(0,Math.min(lessonSteps.length-1,index));lessonTime=0;lessonAuto=auto;lessonPlaying=!reducedMotion||auto;lessonLast=0;
 lq('lesson-stepcount').textContent='STEP '+(lessonIndex+1)+' OF '+lessonSteps.length;
 lq('lesson-heading').textContent=lessonSteps[lessonIndex].title;lq('lesson-body').textContent=lessonSteps[lessonIndex].body;lq('lesson-task').textContent=lessonSteps[lessonIndex].task;
 lq('lesson-prev').disabled=lessonIndex===0;lq('lesson-next').disabled=lessonIndex===lessonSteps.length-1;
 [...lq('lesson-nav').children].forEach((button,i)=>{button.setAttribute('aria-current',i===lessonIndex?'step':'false');});
 lq('lesson-paths').replaceChildren();lessonPaths=[];
 for(let i=0;i<=lessonIndex;i++)for(const d of lessonSteps[i].paths){
  const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',d);p.setAttribute('stroke',lessonSteps[i].color||'#bb5830');
  lq('lesson-paths').append(p);const length=p.getTotalLength();
  if(i===lessonIndex){p.style.strokeDasharray=String(length);lessonPaths.push({p,length})}
 }
 renderLesson(reducedMotion?1:0);updatePlayback();
 if(lessonPlaying)lessonFrame=requestAnimationFrame(tickLesson);
}
function renderLesson(progress){const count=lessonPaths.length;lessonPaths.forEach(({p,length},i)=>{const local=Math.max(0,Math.min(1,progress*count-i));p.style.strokeDashoffset=String(length*(1-local))})}
function updatePlayback(){
 lq('lesson-play').textContent=lessonPlaying?'Pause':'Play all';
 lq('lesson-state').textContent=lessonPlaying?(lessonAuto?'Playing the lesson. Pause whenever you want to sketch.':'Drawing this step…'):'Paused. Take your time to practice.';
}
function tickLesson(now){
 if(!lessonPlaying||!lessonDialog.open)return;
 if(lessonLast)lessonTime+=(now-lessonLast)*Number(lq('lesson-speed').value);lessonLast=now;
 renderLesson(reducedMotion?1:Math.min(1,lessonTime/drawDuration));
 if(lessonTime>=(lessonAuto?duration:drawDuration)){
  if(lessonAuto&&lessonIndex<lessonSteps.length-1){setLessonStep(lessonIndex+1,true);return;}
  lessonPlaying=false;updatePlayback();
  if(lessonIndex===lessonSteps.length-1)lq('lesson-state').textContent='Lesson complete. Replay any step and practice at your own pace.';
  return;
 }
 lessonFrame=requestAnimationFrame(tickLesson);
}
document.querySelector('#learn').onclick=()=>{lessonDialog.showModal();setLessonStep(0);};
lq('lesson-close').onclick=()=>lessonDialog.close();
lessonDialog.addEventListener('close',()=>{lessonPlaying=false;cancelAnimationFrame(lessonFrame);document.querySelector('#learn').focus()});
lq('lesson-prev').onclick=()=>setLessonStep(lessonIndex-1);
lq('lesson-next').onclick=()=>setLessonStep(lessonIndex+1);
lq('lesson-replay').onclick=()=>setLessonStep(lessonIndex);
lq('lesson-play').onclick=()=>{
 if(lessonPlaying){lessonPlaying=false;cancelAnimationFrame(lessonFrame);}
 else {if(lessonIndex===lessonSteps.length-1&&lessonTime>=drawDuration){setLessonStep(0,true);return;}lessonPlaying=true;lessonAuto=true;lessonLast=0;lessonFrame=requestAnimationFrame(tickLesson);}
 updatePlayback();
};
lq('lesson-fade').addEventListener('input',e=>lq('lesson-photo').setAttribute('opacity',Number(e.target.value)/100));
