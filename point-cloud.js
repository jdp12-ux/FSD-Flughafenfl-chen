'use strict';
(async()=>{
  const sb=supabase.createClient('https://ermkdluipeobbpzuqixz.supabase.co','sb_publishable_pN4WhH01n-cM_YBPucxzDw_Zd1Oi3au');
  const params=new URLSearchParams(location.search),token=params.get('t'),adminId=params.get('id');
  const status=document.getElementById('cloudStatus'),bar=document.getElementById('cloudBar');
  const clone=v=>JSON.parse(JSON.stringify(v));
  const defaults=p=>({status:p.status||'Offen',notiz:p.notiz||'',fotos:p.fotos||[],tree_notes:{}});
  let context,api,busy=false,timer=null,polling=false,connected=false;
  let pending={},versions={},server={},observed={},conflicts={},storageOK=true;
  const cacheKey='fsd_point_context_'+(token||adminId),queueKey=()=> 'fsd_point_queue_'+context.map.id;
  const fields=['status','notiz','fotos','tree_notes'];
  const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const say=(message,error=false)=>{status.textContent=message;bar.classList.toggle('error',error);};
  const getCache=key=>{try{return JSON.parse(localStorage.getItem(key)||'null');}catch{return null;}};
  function writeCache(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{storageOK=false;return false;}}
  async function fetchContext(){
    if(token){const r=await sb.rpc('fsd_get_shared_points',{p_token:token});if(r.error)throw r.error;
      if(!r.data)throw Object.assign(Error('Link ungültig oder nicht mehr aktiv.'),{invalid:true});return r.data;}
    if(!adminId)throw Object.assign(Error('Bitte die Karte über die Cloud-Verwaltung oder einen Freigabelink öffnen.'),{invalid:true});
    const {data:{session}}=await sb.auth.getSession();if(!session)throw Object.assign(Error('Bitte zuerst in der Cloud-Verwaltung anmelden.'),{invalid:true});
    const m=await sb.from('maps').select('id,name,status,filters').eq('id',adminId).is('deleted_at',null).single();if(m.error)throw m.error;
    const f=await sb.from('fsd_point_feedback').select('*').eq('map_id',adminId);if(f.error)throw f.error;
    return {map:m.data,feedback:f.data||[]};
  }
  try{
    try{context=await fetchContext();connected=true;writeCache(cacheKey,context);}
    catch(err){
      if(err.invalid||err.code==='PGRST202'||err.code==='42P01')throw err;
      context=getCache(cacheKey);if(!context)throw err;
      say('Offline · gespeicherte Karte geladen');
    }
    if(context.map.filters?.fsd_kind!=='handykarte')throw Error('Dieser Link gehört nicht zu einer Anlagenkarte.');
    context.points=context.map.filters.points;
    if(!Array.isArray(context.points)||!context.points.length)throw Error('Diese Karte enthält keine Positionen.');
    context.readOnly=!token||!['released','in_progress'].includes(context.map.status);
    const saved=getCache(queueKey());pending=saved?.pending||{};versions=saved?.versions||{};
    (context.feedback||[]).forEach(f=>{server[f.point_id]=f.payload;versions[f.point_id]=f.version;});
    window.FSD_POINT_CONTEXT=context;
    const pointById=new Map(context.points.map(p=>[p.point_id,p]));
    // Entfernte Positionen werden in dieser Version nicht mehr gesendet.
    Object.keys(pending).forEach(id=>{if(!pointById.has(id))delete pending[id];});
    function initialState(){const result={};for(const p of context.points){
      const merged={...defaults(p),...(server[p.point_id]||{}),...(pending[p.point_id]?.patch||{})};
      result[p.uid||String(p.nr)]=merged;observed[p.point_id]=clone(merged);
    }return result;}
    function saveQueue(){return writeCache(queueKey(),{pending,versions});}
    function updateBadge(){
      const count=Object.keys(pending).length,clashes=Object.keys(conflicts).length;
      if(context.readOnly)say('Ansicht · Rückmeldungen über den Freigabelink des Trupps');
      else if(!storageOK)say('Handyspeicher voll · Änderungen noch geöffnet lassen und Rückmeldung exportieren.',true);
      else if(clashes)say(clashes+' parallele Änderung(en) · bitte vergleichen',true);
      else if(count)say(count+' Rückmeldung(en) warten auf Cloud-Speicherung'+(!navigator.onLine?' · offline':''));
      else say((connected?'Cloud aktuell':'Offline · gespeicherter Stand')+' · '+context.points.length+' Positionen');
      const controls=document.getElementById('cloudConflicts');controls.replaceChildren();
      for(const id of Object.keys(conflicts)){
        const b=document.createElement('button');b.textContent='Nr. '+pointById.get(id).nr+' vergleichen';
        b.onclick=()=>resolveConflict(id);controls.append(b);
      }
    }
    function recordChanges(state){
      if(context.readOnly)return;
      for(const p of context.points){
        const id=p.point_id,entry=state[p.uid||String(p.nr)],old=observed[id];if(!entry||!old)continue;
        const patch={};for(const field of fields)if(!equal(entry[field],old[field]))patch[field]=clone(entry[field]);
        if(!Object.keys(patch).length)continue;
        const previous=pending[id];pending[id]={patch:{...(previous?.patch||{}),...patch},
          expected:previous?.expected??(versions[id]||0),revision:(previous?.revision||0)+1};
        observed[id]=clone(entry);
      }
      saveQueue();updateBadge();clearTimeout(timer);timer=setTimeout(flush,700);
    }
    function applyServer(id,payload,version){
      server[id]=clone(payload);versions[id]=version;
      const cached=(context.feedback||[]).filter(f=>f.point_id!==id);
      context.feedback=[...cached,{point_id:id,payload:clone(payload),version}];
      writeCache(cacheKey,{map:context.map,feedback:context.feedback});
      const p=pointById.get(id);if(!p||!api||pending[id])return;
      const key=p.uid||String(p.nr),next={...defaults(p),...payload};
      api.state[key]=next;observed[id]=clone(next);api.refresh();
      // Eine geöffnete Position nicht mitten beim Tippen neu zeichnen.
      if(api.current()?.point_id===id && !document.querySelector('#panel input:focus,#panel textarea:focus'))api.openPanel(p);
    }
    async function flush(){
      if(busy||context.readOnly||!api)return;busy=true;
      try{
        for(const id of Object.keys(pending)){
          if(conflicts[id])continue;
          const sent=clone(pending[id]);if(!sent)continue;
          const r=await sb.rpc('fsd_save_shared_point',{p_token:token,p_point_id:id,p_patch:sent.patch,p_expected_version:sent.expected});
          if(r.error)throw r.error;if(!r.data)throw Error('Cloud hat die Speicherung nicht bestätigt.');
          if(r.data.conflict){conflicts[id]=r.data;continue;}
          if(!r.data.ok)throw Error('Rückmeldung wurde nicht gespeichert.');connected=true;
          if(pending[id]?.revision===sent.revision)delete pending[id];
          else if(pending[id])pending[id].expected=r.data.version;
          applyServer(id,r.data.payload,r.data.version);saveQueue();
        }
        updateBadge();
      }catch(err){
        say('Noch nicht in der Cloud gespeichert · '+(err.message||'Verbindung fehlt')+'. Erneut versuchen.',true);
      }finally{busy=false;}
    }
    function resolveConflict(id){
      const remote=conflicts[id];if(!remote)return;
      const p=pointById.get(id),local=api.state[p.uid||String(p.nr)],cloud={...defaults(p),...remote.payload};
      const dialog=document.createElement('dialog');dialog.style.maxWidth='min(90vw,620px)';
      const title=document.createElement('h3');title.textContent='Nr. '+p.nr+' · parallele Änderung';dialog.append(title);
      const info=document.createElement('p');info.textContent='Ein anderes Gerät hat diese Position geändert. Wähle die Rückmeldung, die übernommen werden soll.';dialog.append(info);
      for(const [label,value] of [['Dieses Gerät',local],['Cloud',cloud]]){
        const text=document.createElement('p');text.style.whiteSpace='pre-wrap';text.textContent=label+': '+value.status+'\n'+value.notiz+'\n'+(value.fotos?.length||0)+' Fotos';dialog.append(text);
      }
      for(const [label,useLocal] of [['Dieses Gerät übernehmen',true],['Cloud übernehmen',false]]){
        const button=document.createElement('button');button.textContent=label;button.style.margin='6px';
        button.onclick=()=>{
          if(useLocal){pending[id].expected=remote.version;}
          else{delete pending[id];applyServer(id,remote.payload,remote.version);}
          delete conflicts[id];saveQueue();dialog.close();updateBadge();flush();
        };dialog.append(button);
      }
      const cancel=document.createElement('button');cancel.textContent='Später entscheiden';cancel.onclick=()=>dialog.close();dialog.append(cancel);
      dialog.onclose=()=>dialog.remove();document.body.append(dialog);dialog.showModal();
    }
    async function refreshCloud(){
      if(polling)return;polling=true;
      try{
        const latest=await fetchContext();connected=true;writeCache(cacheKey,latest);
        for(const f of latest.feedback||[])applyServer(f.point_id,f.payload,f.version);
        updateBadge();await flush();
      }catch(err){connected=false;say(err.invalid?err.message:'Cloud nicht erreichbar · '+(Object.keys(pending).length?'Rückmeldungen bleiben vorgemerkt':'gespeicherter Stand'),true);}
      finally{polling=false;}
    }
    window.FSDCloud={initialState,recordChanges,attach(handlers){
      api=handlers;
      document.getElementById('cloudTitle').textContent=context.map.name;
      const positionBar=()=>{bar.style.top=(document.getElementById('head').getBoundingClientRect().bottom+8)+'px';};
      new ResizeObserver(positionBar).observe(document.getElementById('head'));positionBar();
      if(context.readOnly){
        document.querySelectorAll('.statusBtn,.photoTools button,#pNote,.saveClose').forEach(el=>el.disabled=true);
        window.setStatus=()=>{};window.addPhotos=()=>{};window.deletePhoto=()=>{};
      }
      updateBadge();flush();setInterval(refreshCloud,20000);
    }};
    document.getElementById('cloudRetry').onclick=refreshCloud;
    window.addEventListener('online',refreshCloud);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshCloud();});
    window.addEventListener('beforeunload',e=>{if(Object.keys(pending).length){e.preventDefault();e.returnValue='';}});
    const script=document.createElement('script');script.src='handykarte-core.js';
    script.onerror=()=>say('Kartenprogramm konnte nicht geladen werden. Bitte aktualisieren.',true);document.body.append(script);
  }catch(err){
    say(err.code==='PGRST202'||err.code==='42P01'?'Cloud-Erweiterung noch nicht eingerichtet.':err.message||'Karte konnte nicht geladen werden.',true);
    document.querySelectorAll('#head button').forEach(b=>b.disabled=true);
    document.getElementById('cloudRetry').onclick=()=>location.reload();
  }
})();
