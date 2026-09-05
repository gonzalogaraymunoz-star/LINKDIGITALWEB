(()=>{
const SUPABASE_URL='https://zgbnjlrxzvzpigmwidsp.supabase.co';
const SUPABASE_KEY='sb_publishable_RE_eqhBaLeaUMHuBjLUY2Q_OZNBm9_A';
const cache=new Map();
let ready=false,raf=0;
const style=document.createElement('style');
style.textContent=`
.scene-frame{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;z-index:1;opacity:0;transition:opacity .28s ease;will-change:opacity;transform:translateZ(0);background:#111}
.scene-frame.is-ready{opacity:1}
.scene-placeholder{z-index:0!important}
.scene-placeholder .scene-art{opacity:.22;transition:opacity .3s ease}
.frames-ready .scene-placeholder .scene-art{opacity:0}
@media(max-width:640px){.scene-frame{object-fit:cover;object-position:center 58%}.sticky-stage{background:#0b0b0b}.scene-copy{z-index:5}.scene-overlay{z-index:3}.scene-adds{z-index:5}}
`;
document.head.appendChild(style);
function progress(el){const r=el.getBoundingClientRect();const travel=Math.max(1,r.height-innerHeight);return Math.max(0,Math.min(1,-r.top/travel))}
function setFrame(el,p){const id=el.dataset.scene;let frames=cache.get(id);if((!frames||!frames.length)&&id==='link-os')frames=cache.get('automatizacion-ia');if(!frames||!frames.length)return;const img=el.querySelector('.scene-frame');if(!img)return;const idx=Math.max(0,Math.min(frames.length-1,Math.round(p*(frames.length-1))));if(img.dataset.idx!==String(idx)){img.src=frames[idx];img.dataset.idx=String(idx);if(img.complete)img.classList.add('is-ready');}}
function render(){raf=0;if(!ready)return;document.querySelectorAll('.scroll-scene').forEach(el=>{const r=el.getBoundingClientRect();if(r.bottom>-innerHeight*.2&&r.top<innerHeight*1.2)setFrame(el,progress(el))})}
function requestRender(){if(!raf)raf=requestAnimationFrame(render)}
async function load(){
 document.querySelectorAll('.scroll-scene .sticky-stage').forEach(stage=>{if(!stage.querySelector('.scene-frame')){const img=document.createElement('img');img.className='scene-frame';img.alt='';img.decoding='async';img.draggable=false;img.addEventListener('load',()=>img.classList.add('is-ready'));stage.insertBefore(img,stage.querySelector('.scene-overlay'));}});
 try{
  const url=`${SUPABASE_URL}/rest/v1/link_digital_visual_frames?select=scene_id,frame_index,image_data&order=scene_id.asc,frame_index.asc`;
  const res=await fetch(url,{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`}});
  if(!res.ok)throw new Error(`frames ${res.status}`);
  const rows=await res.json();
  rows.forEach(row=>{if(!cache.has(row.scene_id))cache.set(row.scene_id,[]);cache.get(row.scene_id)[row.frame_index]=row.image_data;});
  for(const [id,arr] of cache)cache.set(id,arr.filter(Boolean));
  ready=true;document.documentElement.classList.add('frames-ready');render();
 }catch(err){console.error('LINK frames:',err);}
}
window.addEventListener('scroll',requestRender,{passive:true});window.addEventListener('resize',requestRender,{passive:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();
