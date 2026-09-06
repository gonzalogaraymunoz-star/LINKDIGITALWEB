(()=>{
  const SUPABASE_URL='https://zgbnjlrxzvzpigmwidsp.supabase.co';
  const SUPABASE_KEY='sb_publishable_RE_eqhBaLeaUMHuBjLUY2Q_OZNBm9_A';
  const bank=new Map();
  let ready=false;
  let raf=0;
  const mobile=()=>window.matchMedia('(max-width:760px)').matches;

  const style=document.createElement('style');
  style.textContent=`
    .scene-frame{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;z-index:1;opacity:0;will-change:opacity;transform:translateZ(0);background:#111;pointer-events:none}
    .scene-frame.is-ready{opacity:1}
    .scene-frame-a{z-index:1}.scene-frame-b{z-index:2}
    .scene-placeholder{z-index:0!important}
    .frames-ready .scene-placeholder .scene-art{opacity:0}

    /* LINK OS has its own visual identity until its dedicated Flow animation is ready. */
    .scroll-scene[data-scene="link-os"] .scene-placeholder{
      background:linear-gradient(145deg,#f3f0e7 0%,#e8e4d8 60%,#d9d5c9 100%)!important;
    }
    .frames-ready .scroll-scene[data-scene="link-os"] .scene-placeholder .scene-art{opacity:1!important;display:block!important}
    .scroll-scene[data-scene="link-os"] .scene-art{position:absolute;inset:0;transform:none!important;opacity:1!important}
    .scroll-scene[data-scene="link-os"] .scene-art span{
      position:absolute;display:block;width:82px;height:82px;border-radius:20px;background:#111;border:1px solid rgba(255,255,255,.12);box-shadow:0 16px 38px rgba(0,0,0,.16)
    }
    .scroll-scene[data-scene="link-os"] .scene-art span:nth-child(1){left:18%;top:56%}
    .scroll-scene[data-scene="link-os"] .scene-art span:nth-child(2){left:39%;top:68%;width:68px;height:68px}
    .scroll-scene[data-scene="link-os"] .scene-art span:nth-child(3){right:18%;top:54%;width:76px;height:76px}
    .scroll-scene[data-scene="link-os"] .scene-art i{
      position:absolute;left:50%;top:58%;width:96px;height:96px;transform:translate(-50%,-50%);border-radius:28px;background:#e7ff00;box-shadow:0 0 0 18px rgba(231,255,0,.16),0 20px 50px rgba(0,0,0,.12)
    }
    .scroll-scene[data-scene="link-os"] .scene-art:before,.scroll-scene[data-scene="link-os"] .scene-art:after{
      content:"";position:absolute;left:22%;right:22%;top:61%;height:2px;background:linear-gradient(90deg,#111 0 35%,#e7ff00 35% 65%,#111 65% 100%);opacity:.68
    }
    .scroll-scene[data-scene="link-os"] .scene-art:after{transform:rotate(18deg);transform-origin:center;opacity:.34}

    @media(max-width:760px){
      .scene-frame{object-fit:contain!important;object-position:center center!important;background:#ebe8df!important;filter:brightness(1.13) contrast(.94) saturate(.92)!important;transition:none!important}
      .sticky-stage{background:#ebe8df!important}
      .scene-overlay{z-index:3!important}
      .scene-copy{z-index:6!important}
      .progress-rail{z-index:7!important}
      .scroll-scene[data-scene="link-os"] .scene-art span{width:58px;height:58px;border-radius:16px}
      .scroll-scene[data-scene="link-os"] .scene-art span:nth-child(1){left:12%;top:67%}
      .scroll-scene[data-scene="link-os"] .scene-art span:nth-child(2){left:34%;top:76%;width:48px;height:48px}
      .scroll-scene[data-scene="link-os"] .scene-art span:nth-child(3){right:12%;top:66%;width:54px;height:54px}
      .scroll-scene[data-scene="link-os"] .scene-art i{top:69%;width:74px;height:74px;border-radius:22px}
      .scroll-scene[data-scene="link-os"] .scene-art:before,.scroll-scene[data-scene="link-os"] .scene-art:after{top:70%;left:16%;right:16%}
    }
  `;
  document.head.appendChild(style);

  function progress(el){
    const r=el.getBoundingClientRect();
    const travel=Math.max(1,r.height-innerHeight);
    return Math.max(0,Math.min(1,-r.top/travel));
  }

  function ensureLayers(stage){
    let a=stage.querySelector('.scene-frame-a');
    let b=stage.querySelector('.scene-frame-b');
    if(!a){a=document.createElement('img');a.className='scene-frame scene-frame-a';a.alt='';a.decoding='async';a.draggable=false;stage.insertBefore(a,stage.querySelector('.scene-overlay'))}
    if(!b){b=document.createElement('img');b.className='scene-frame scene-frame-b';b.alt='';b.decoding='async';b.draggable=false;stage.insertBefore(b,stage.querySelector('.scene-overlay'))}
    return {a,b};
  }

  function setSrc(img,src,key){
    if(!src||img.dataset.key===key)return;
    img.dataset.key=key;img.classList.remove('is-ready');
    img.onload=()=>img.classList.add('is-ready');img.src=src;
    if(img.complete)img.classList.add('is-ready');
  }

  function renderFrame(el,p){
    const id=el.dataset.scene;
    const frames=bank.get(id);
    const stage=el.querySelector('.sticky-stage');
    if(!stage)return;
    const layers=ensureLayers(stage);

    /* Never reuse another product's visual for LINK OS. */
    if(id==='link-os'&&(!frames||!frames.length)){
      layers.a.style.opacity='0';layers.b.style.opacity='0';
      stage.style.setProperty('--os-progress',String(p));
      const art=stage.querySelector('.scene-art');
      if(art)art.style.transform=`translate3d(0,${(p-.5)*-10}px,0) scale(${.98+p*.04})`;
      return;
    }
    if(!frames||!frames.length)return;

    if(mobile()){
      const pos=p*Math.max(0,frames.length-1),lo=Math.floor(pos),hi=Math.min(frames.length-1,lo+1),mix=pos-lo;
      setSrc(layers.a,frames[lo],`${id}-${lo}`);setSrc(layers.b,frames[hi],`${id}-${hi}`);
      layers.a.style.opacity='1';layers.b.style.opacity=String(mix);
    }else{
      const idx=Math.max(0,Math.min(frames.length-1,Math.round(p*(frames.length-1))));
      setSrc(layers.a,frames[idx],`${id}-${idx}`);layers.a.style.opacity='1';layers.b.style.opacity='0';
    }
  }

  function render(){raf=0;if(!ready)return;document.querySelectorAll('.scroll-scene').forEach(el=>{const r=el.getBoundingClientRect();if(r.bottom>-innerHeight*.15&&r.top<innerHeight*1.15)renderFrame(el,progress(el))})}
  function requestRender(){if(!raf)raf=requestAnimationFrame(render)}

  async function preloadDataUris(frames){
    for(let i=0;i<frames.length;i++){
      await new Promise(resolve=>{const img=new Image();img.onload=img.onerror=()=>resolve();img.decoding='async';img.src=frames[i];if(img.complete)resolve()});
      if(i%4===3)await new Promise(r=>setTimeout(r,0));
    }
  }

  async function load(){
    document.querySelectorAll('.scroll-scene .sticky-stage').forEach(ensureLayers);
    try{
      const url=`${SUPABASE_URL}/rest/v1/link_digital_visual_frames?select=scene_id,frame_index,image_data&order=scene_id.asc,frame_index.asc`;
      const res=await fetch(url,{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`}});
      if(!res.ok)throw new Error(`frames ${res.status}`);
      const rows=await res.json();
      rows.forEach(row=>{if(!bank.has(row.scene_id))bank.set(row.scene_id,[]);bank.get(row.scene_id)[row.frame_index]=row.image_data});
      for(const [id,arr] of bank)bank.set(id,arr.filter(Boolean));
      const first=bank.get('estrategia')||[];if(first.length)await preloadDataUris(first);
      ready=true;document.documentElement.classList.add('frames-ready');render();
      setTimeout(async()=>{for(const [id,frames] of bank){if(id==='estrategia')continue;await preloadDataUris(frames)}},120);
    }catch(err){console.error('LINK frames:',err)}
  }

  window.addEventListener('scroll',requestRender,{passive:true});
  window.addEventListener('resize',requestRender,{passive:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();