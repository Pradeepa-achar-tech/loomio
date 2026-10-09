const emptyState=document.querySelector('#empty'),workspace=document.querySelector('.workspace');
// Clear a file picker restored by the browser; studies are never persisted.
document.querySelector('#file').value='';
let toastTimer;
function showToast(message){const toast=document.querySelector('#toast');toast.textContent=message;toast.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),3500)}
function refreshStudio(){
 emptyState.hidden=!!photo;
 workspace.classList.toggle("is-empty",!photo);
 document.querySelector('#hide').disabled=!photo;
 document.querySelector('#hide').setAttribute('aria-pressed',String(!photoVisible));
 document.querySelector('#export').disabled=!photo;
}
new MutationObserver(refreshStudio).observe(document.querySelector('#status'),{childList:true,characterData:true,subtree:true});
function useSample(){
 const image=new Image();image.onload=()=>{
  photo=image;photoVisible=true;selected=null;
  Object.assign(state,defaults);
  const f=imageFit();state.x=f.x+405*f.scale;state.y=f.y+335*f.scale;state.size=120*f.scale;state.turn=-.42;
  const convert=p=>fromCanvas([f.x+p[0]*f.scale,f.y+p[1]*f.scale]);
  anatomy={face:[[305,302],[304,352],[312,394],[341,480],[379,499],[440,468],[471,418],[482,380],[477,350]].map(convert),leftEye:[[308,337],[342,332],[325,331],[325,340]].map(convert),rightEye:[[377,327],[425,322],[401,318],[401,329]].map(convert),lips:[[348,425],[397,421],[372,418],[372,429]].map(convert)};
  document.querySelector('#preset').value='-.42';document.querySelector('#hide').textContent='Hide photo';
  sync();draw();statusText('Lesson portrait ready. Refine the guides, or open the animated lesson above.');refreshStudio();showToast('Example loaded. Drag blue points to refine the fit.');
 };image.onerror=()=>showToast('Could not load the example. Please try again.');image.src='assets/lesson-reference.jpeg';
}
document.querySelector('#sample').onclick=useSample;document.querySelector('#empty-sample').onclick=useSample;
document.querySelector('#focus').onclick=()=>{
 const focused=workspace.classList.toggle('focus-mode');document.querySelector('#focus').textContent=focused?'Show tools':'Focus view';document.querySelector('#focus').setAttribute('aria-pressed',String(focused));
};
document.querySelector('#hide').addEventListener('click',refreshStudio);
document.querySelector('#export').addEventListener('click',()=>showToast('PNG prepared. Check your browser downloads.'));
refreshStudio();
const studioTabs=[...document.querySelectorAll('.tool-tabs [role="tab"]')];
const studioPanels=[...document.querySelectorAll('.toolsection')];
const panelIds=['reference','structure','features','display'];
const panelTitles=['Your reference','Sphere & alignment','Face, eyes & lips','Display settings'];
function activateToolTab(index,focus=false){
 studioTabs.forEach((tab,i)=>{const active=i===index;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;studioPanels[i].hidden=!active;studioPanels[i].open=true;});
 document.querySelector('#tool-heading').textContent=panelTitles[index];
 if(focus)studioTabs[index].focus();
}
studioPanels.forEach((panel,i)=>{panel.id='panel-'+panelIds[i];panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby','tab-'+panelIds[i]);});
studioTabs.forEach((tab,i)=>{
 tab.addEventListener('click',()=>activateToolTab(i));
 tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%4;if(e.key==='ArrowLeft')next=(i+3)%4;if(e.key==='Home')next=0;if(e.key==='End')next=3;if(next!==undefined){e.preventDefault();activateToolTab(next,true);}});
});
activateToolTab(0);
