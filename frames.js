(()=>{
const SUPABASE_URL='https://zgbnjlrxzvzpigmwidsp.supabase.co';
const SUPABASE_KEY='sb_publishable_RE_eqhBaLeaUMHuBjLUY2Q_OZNBm9_A';
const cache=new Map();
let ready=false,raf=0;

const style=document.createElement('style');
style.textContent=`
/* Frame system: desktop keeps cinematic cover; mobile preserves the complete 16:9 composition. */
.scene-frame-bg,.scene-frame{position:absolute;z-index:1;opacity:0;transition:opacity .26s ease;pointer-events:none;user-select:none;-webkit-user-select:none}
.scene-frame-bg{inset:-5%;width:110%;height:110%;object-fit:cover;object-position:center;filter:blur(22px) brightness(.48) saturate(.72);transform:scale(1.06);z-index:1}
.scene-frame{inset:0;width:100%;height:100%;object-fit:cover;object-position:center;z-index:2;background:#111;transform:translateZ(0)}
.scene-frame-bg.is-ready,.scene-frame.is-ready{opacity:1}
.scene-placeholder{z-index:0!important}
.scene-placeholder .scene-art{opacity:.22;transition:opacity .3s ease}
.frames-ready .scene-placeholder .scene-art{opacity:0}
.scene-overlay{z-index:3!important}
.scene-copy,.scene-adds,.progress-rail{z-index:5!important}

@media(max-width:900px){
  .sticky-stage{background:#111;isolation:isolate}
  .scene-frame-bg{display:block}
  .scene-frame{
    inset:auto 12px 20px 12px;
    width:calc(100% - 24px);
    height:auto;
    aspect-ratio:16/9;
    object-fit:contain;
    object-position:center;
    border-radius:18px;
    background:#0d0d0d;
    box-shadow:0 18px 48px rgba(0,0,0,.28);
  }
  .scene-overlay{
    background:linear-gradient(180deg,rgba(8,8,8,.42) 0%,rgba(8,8,8,.22) 44%,rgba(8,8,8,.12) 62%,rgba(8,8,8,.28) 100%)!important;
  }
  .scene-copy{
    top:14px!important;
    left:14px!important;
    right:14px!important;
    bottom:auto!important;
    width:auto!important;
    max-width:none!important;
    transform:none!important;
    padding:18px 19px!important;
    border-radius:20px!important;
    background:rgba(8,8,8,.66)!important;
    backdrop-filter:blur(12px)!important;
    -webkit-backdrop-filter:blur(12px)!important;
  }
  .scene-title{font-size:clamp(40px,10vw,58px)!important;line-height:.9!important;margin:8px 0 10px!important}
  .scene-definition{font-size:16px!important;line-height:1.32!important;margin-bottom:10px!important}
  .scene-explanation{font-size:12.5px!important;line-height:1.48!important;margin:0!important;max-width:none!important}
  .scene-price{margin-top:13px!important;padding:9px 12px!important}
  .scene-adds{display:none!important}
  .progress-rail{right:8px!important;height:24vh!important;top:61%!important}
}

@media(max-width:640px){
  .scroll-scene{height:150vh!important}
  .sticky-stage{height:calc(100svh - var(--nav-h) - 12px)!important}
  .scene-frame{
    left:10px;right:10px;bottom:16px;
    width:calc(100% - 20px);
    max-height:43%;
  }
  .scene-copy{top:10px!important;left:10px!important;right:10px!important;padding:16px!important}
  .scene-number{font-size:11px!important}
  .scene-title{font-size:clamp(38px,11vw,52px)!important}
  .scene-definition{font-size:15.5px!important}
  .scene-explanation{font-size:12px!important;line-height:1.43!important}
  .scene-price{font-size:12px!important;margin-top:11px!important}
}

@media(max-width:390px){
  .scene-copy{padding:14px!important}
  .scene-title{font-size:38px!important}
  .scene-definition{font-size:14px!important}
  .scene-explanation{font-size:11.5px!important}
  .scene-frame{bottom:12px;max-height:40%}
}

@media(orientation:landscape) and (max-height:560px){
  .scene-frame{left:44%;right:12px;top:12px;bottom:12px;width:auto;height:calc(100% - 24px);aspect-ratio:16/9;object-fit:contain}
  .scene-copy{left:12px!important;right:auto!important;top:12px!important;width:40%!important;max-height:calc(100% - 24px);overflow:auto}
  .scene-title{font-size:34px!important}
  .scene-definition{font-size:13px!important}.scene-explanation{font-size:11px!important}.scene-price{margin-top:8px!important}
}
`;
document.head.appendChild(style);

function progress(el){const r=el.getBoundingClientRect();const travel=Math.max(1,r.height-innerHeight);return Math.max(0,Math.min(1,-r.top/travel))}
function setImage(img,src,idx){
  if(!img||img.dataset.idx===String(idx))return;
  img.classList.remove('is-ready');
  img.src=src;img.dataset.idx=String(idx);
  if(img.complete)img.classList.add('is-ready');
}
function setFrame(el,p){
  const id=el.dataset.scene;
  let frames=cache.get(id);
  if((!frames||!frames.length)&&id==='link-os')frames=cache.get('automatizacion-ia');
  if(!frames||!frames.length)return;
  const idx=Math.max(0,Math.min(frames.length-1,Math.round(p*(frames.length-1))));
  const src=frames[idx];
  setImage(el.querySelector('.scene-frame'),src,idx);
  setImage(el.querySelector('.scene-frame-bg'),src,idx);
}
function render(){raf=0;if(!ready)return;document.querySelectorAll('.scroll-scene').forEach(el=>{const r=el.getBoundingClientRect();if(r.bottom>-innerHeight*.2&&r.top<innerHeight*1.2)setFrame(el,progress(el))})}
function requestRender(){if(!raf)raf=requestAnimationFrame(render)}

async function load(){
  document.querySelectorAll('.scroll-scene .sticky-stage').forEach(stage=>{
    if(!stage.querySelector('.scene-frame-bg')){
      const bg=document.createElement('img');bg.className='scene-frame-bg';bg.alt='';bg.decoding='async';bg.draggable=false;bg.addEventListener('load',()=>bg.classList.add('is-ready'));
      stage.insertBefore(bg,stage.querySelector('.scene-overlay'));
    }
    if(!stage.querySelector('.scene-frame')){
      const img=document.createElement('img');img.className='scene-frame';img.alt='';img.decoding='async';img.draggable=false;img.addEventListener('load',()=>img.classList.add('is-ready'));
      stage.insertBefore(img,stage.querySelector('.scene-overlay'));
    }
  });
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
