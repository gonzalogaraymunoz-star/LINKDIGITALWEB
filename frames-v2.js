(()=>{
  const SUPABASE_URL='https://zgbnjlrxzvzpigmwidsp.supabase.co';
  const SUPABASE_KEY='sb_publishable_RE_eqhBaLeaUMHuBjLUY2Q_OZNBm9_A';
  const bank=new Map();
  const state=new WeakMap();
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
    @media(max-width:760px){
      .scene-frame{object-fit:contain!important;object-position:center center!important;background:#d7d4ca!important;filter:brightness(1.18) contrast(.90) saturate(.82)!important;transition:none!important}
      .sticky-stage{background:#d7d4ca!important}
      .scene-overlay{z-index:3!important}
      .scene-copy{z-index:6!important}
      .progress-rail{z-index:7!important}
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
    if(!a){
      a=document.createElement('img');
      a.className='scene-frame scene-frame-a';
      a.alt='';a.decoding='async';a.draggable=false;
      stage.insertBefore(a,stage.querySelector('.scene-overlay'));
    }
    if(!b){
      b=document.createElement('img');
      b.className='scene-frame scene-frame-b';
      b.alt='';b.decoding='async';b.draggable=false;
      stage.insertBefore(b,stage.querySelector('.scene-overlay'));
    }
    return {a,b};
  }

  function setSrc(img,src,key){
    if(!src)return;
    if(img.dataset.key===key)return;
    img.dataset.key=key;
    img.classList.remove('is-ready');
    img.onload=()=>img.classList.add('is-ready');
    img.src=src;
    if(img.complete)img.classList.add('is-ready');
  }

  function renderFrame(el,p){
    const id=el.dataset.scene;
    let frames=bank.get(id);
    if((!frames||!frames.length)&&id==='link-os')frames=bank.get('automatizacion-ia');
    if(!frames||!frames.length)return;

    const stage=el.querySelector('.sticky-stage');
    if(!stage)return;
    const layers=ensureLayers(stage);

    if(mobile()){
      // Continuous blend between available keyframes. This is much smoother than snapping.
      const pos=p*Math.max(0,frames.length-1);
      const lo=Math.floor(pos);
      const hi=Math.min(frames.length-1,lo+1);
      const mix=pos-lo;
      setSrc(layers.a,frames[lo],`${id}-${lo}`);
      setSrc(layers.b,frames[hi],`${id}-${hi}`);
      layers.a.style.opacity='1';
      layers.b.style.opacity=String(mix);
    }else{
      const idx=Math.max(0,Math.min(frames.length-1,Math.round(p*(frames.length-1))));
      setSrc(layers.a,frames[idx],`${id}-${idx}`);
      layers.a.style.opacity='1';
      layers.b.style.opacity='0';
    }
  }

  function render(){
    raf=0;
    if(!ready)return;
    document.querySelectorAll('.scroll-scene').forEach(el=>{
      const r=el.getBoundingClientRect();
      if(r.bottom>-innerHeight*.15&&r.top<innerHeight*1.15)renderFrame(el,progress(el));
    });
  }

  function requestRender(){
    if(!raf)raf=requestAnimationFrame(render);
  }

  async function preloadDataUris(frames){
    // Decode only a small amount at once to protect older iPhones.
    for(let i=0;i<frames.length;i++){
      await new Promise(resolve=>{
        const img=new Image();
        img.onload=img.onerror=()=>resolve();
        img.decoding='async';
        img.src=frames[i];
        if(img.complete)resolve();
      });
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
      rows.forEach(row=>{
        if(!bank.has(row.scene_id))bank.set(row.scene_id,[]);
        bank.get(row.scene_id)[row.frame_index]=row.image_data;
      });
      for(const [id,arr] of bank)bank.set(id,arr.filter(Boolean));

      // Decode the first scene first, then let the browser continue with the rest.
      const first=bank.get('estrategia')||[];
      if(first.length)await preloadDataUris(first);
      ready=true;
      document.documentElement.classList.add('frames-ready');
      render();

      setTimeout(async()=>{
        for(const [id,frames] of bank){
          if(id==='estrategia')continue;
          await preloadDataUris(frames);
        }
      },120);
    }catch(err){
      console.error('LINK frames:',err);
    }
  }

  window.addEventListener('scroll',requestRender,{passive:true});
  window.addEventListener('resize',requestRender,{passive:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();
