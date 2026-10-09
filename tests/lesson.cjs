const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const elements=new Map();
function el(){return {style:{},children:[],attributes:{},handlers:{},value:'1',textContent:'',open:false,append(c){this.children.push(c)},replaceChildren(){this.children=[]},setAttribute(k,v){this.attributes[k]=v},getTotalLength(){return 100},addEventListener(n,f){this.handlers[n]=f},querySelector(s){return get(s)},showModal(){this.open=true},close(){this.open=false;this.handlers.close()},focus(){}}}
function get(s){if(!elements.has(s))elements.set(s,el());return elements.get(s)}
let reduced=false,frame=0;const canceled=[];
const sandbox={document:{createElement:el,createElementNS:el,body:{append(d){elements.set('dialog',d)}},querySelector:get},window:{matchMedia:()=>({matches:reduced})},requestAnimationFrame:()=>++frame,cancelAnimationFrame:n=>canceled.push(n),Math,Number};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/lesson.js','utf8'),sandbox);const run=s=>vm.runInContext(s,sandbox);
assert.equal(run('lessonSteps.length'),8);
assert.equal(get('#lesson-nav').children.length,8);
get('#learn').onclick();assert(get('dialog').open);assert.equal(run('lessonIndex'),0);
get('#lesson-next').onclick();assert.equal(run('lessonIndex'),1);assert.equal(get('#lesson-paths').children.length,1);
run('tickLesson(100);tickLesson(1400)');assert(Number(get('#lesson-paths').children[0].style.strokeDashoffset)<100);
get('#lesson-play').onclick();assert.equal(run('lessonPlaying'),false);
const paused=run('lessonTime');run('tickLesson(90000)');assert.equal(run('lessonTime'),paused);
get('#lesson-play').onclick();run('tickLesson(91000)');assert.equal(run('lessonTime'),paused);
run('tickLesson(100000)');assert.equal(run('lessonIndex'),2);
run('setLessonStep(7);tickLesson(100);tickLesson(4000)');assert.equal(run('lessonPlaying'),false);
assert(get('#lesson-next').disabled);assert.match(get('#lesson-state').textContent,/complete/);
get('#lesson-replay').onclick();assert.equal(run('lessonIndex'),7);assert.equal(run('lessonTime'),0);
get('#lesson-fade').handlers.input({target:{value:'25'}});assert.equal(get('#lesson-photo').attributes.opacity,.25);
get('#lesson-close').onclick();assert(!get('dialog').open);assert.equal(run('lessonPlaying'),false);
const html=fs.readFileSync('dist/index.html','utf8');assert(html.includes('id="learn"'));assert(html.includes('src="lesson.js"'));assert(fs.statSync('dist/assets/lesson-reference.jpeg').size>0);
console.log('PASS: lesson entry, 8 steps, progressive drawing, pause/resume, automatic advance, completion, replay, photo fade, close, and bundled reference.');
