const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const elements=new Map();function el(){const classes=new Set();return {checked:true,value:'',textContent:'',style:{},handlers:{},classList:{toggle(k){if(classes.has(k)){classes.delete(k);return false}classes.add(k);return true},add:k=>classes.add(k),remove:k=>classes.delete(k)},setAttribute(k,v){this[k]=v},addEventListener(n,f){this.handlers[n]=f},append(){},querySelector(){return el()}}}
const get=s=>{if(!elements.has(s))elements.set(s,el());return elements.get(s)};
const ctx=new Proxy({},{get:()=>()=>{}});get('#canvas').getContext=()=>ctx;get('#color').value='#c66b46';
const sandbox={document:{querySelector:get,createElement:el},Math,Number,console,MutationObserver:class{observe(){}},Image:class{constructor(){this.width=800;this.height=1200}set src(v){this.onload()}},setTimeout:()=>1,clearTimeout(){}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/app.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/studio.js','utf8'),sandbox);const run=s=>vm.runInContext(s,sandbox);
assert(!get('#empty').hidden);assert(get('#export').disabled);get('#sample').onclick();assert(get('#empty').hidden);assert(!get('#export').disabled);assert.equal(run('photo.width'),800);assert.equal(get('#preset').value,'-.42');
const eye=run('sourcePoint(anatomy.leftEye[0])');assert(Math.abs(eye[0]-308)<1e-7);assert(Math.abs(eye[1]-337)<1e-7);
get('#focus').onclick();assert.equal(get('#focus')['aria-pressed'],'true');get('#focus').onclick();assert.equal(get('#focus')['aria-pressed'],'false');
get('#hide').onclick();get('#hide').handlers.click();assert.equal(get('#hide')['aria-pressed'],'true');
console.log('PASS: empty-state actions, fitted example coordinates, download availability, focus view, and photo-toggle accessibility');
