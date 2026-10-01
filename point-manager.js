'use strict';
function isPointCard(c){return c?.filters?.fsd_kind==='handykarte';}
function normalizePoints(points){
  if(!Array.isArray(points)||!points.length)throw Error('Die Datei enthält keine Positionen.');
  const seen=new Set();
  return points.map((original,i)=>{
    const p={...original};
    if(p.lat==null||p.lon==null||String(p.lat).trim()===''||String(p.lon).trim()==='')throw Error('Fehlende Koordinaten bei Position '+(p.nr??i+1));
    p.lat=Number(p.lat);p.lon=Number(p.lon);
    if(!Number.isFinite(p.lat)||!Number.isFinite(p.lon)||Math.abs(p.lat)>90||Math.abs(p.lon)>180)
      throw Error('Ungültige Koordinaten bei Position '+(p.nr??i+1));
    p.point_id=p.obj_nr?'obj:'+String(p.obj_nr).trim():String(p.point_id||p.uid||'');
    if(!p.point_id)throw Error('Eine Position hat keine feste Objekt-ID.');
    if(seen.has(p.point_id))throw Error('Doppelte Objekt-ID: '+p.point_id);
    seen.add(p.point_id);
    p.uid=p.uid||p.point_id;if(['__proto__','constructor','prototype'].includes(p.uid))p.uid='point:'+p.point_id;p.nr=p.nr??i+1;
    delete p._source_excel;delete p._source_row;
    // Importierte Rückmeldungen müssen ausdrücklich über die Cloud-Karte erfolgen.
    p.status='Offen';p.notiz='';p.fotos=[];
    if(p.link&&!/^https?:\/\//i.test(p.link))delete p.link;
    return p;
  });
}
async function readPointFile(file){
  const text=await file.text();
  let data;
  if(file.name.toLowerCase().endsWith('.json'))data=JSON.parse(text);
  else{
    const match=text.match(/\b(?:const|let|var)\s+DATA\s*=\s*(\[[\s\S]*?\]);/);
    if(!match)throw Error('Keine eingebettete FSD-Positionsliste in dieser HTML-Datei gefunden.');
    data=JSON.parse(match[1]);
  }
  return normalizePoints(Array.isArray(data)?data:data.points);
}
async function openPointEditor(card=null,clone=false){
  let points;
  if(card)points=normalizePoints(card.filters.points);
  else{
    try{const r=await fetch('50hz-anlagen-9-10.json');if(!r.ok)throw Error('Positionsdatei nicht erreichbar.');
      points=normalizePoints((await r.json()).points);
    }catch(e){alert(e.message);return;}
  }
  const modal=document.createElement('dialog');
  modal.className='pointEditor';
  modal.innerHTML='<h3></h3><label>Kartenname<input id="pointName" style="width:100%;margin:6px 0"></label>'+
    '<p class="muted">Anlagen und Positionen mit gemeinsamen Rückmeldungen.</p><div id="pointSummary"></div>'+
    '<p><label>Andere oder aktualisierte FSD-Karte laden<br><input id="pointFile" type="file" accept=".html,.json"></label></p>'+
    '<div id="pointError" role="alert" style="color:#b91c1c"></div><div class="row" style="margin-top:18px">'+
    '<button id="pointSave" class="primary">Entwurf speichern</button><button id="pointCancel" class="secondary">Abbrechen</button></div>';
  document.body.append(modal);
  modal.querySelector('h3').textContent=clone?'Neue Version mit bisherigen Rückmeldungen':card?'Anlagenkarte bearbeiten':'50-Hz-Anlagenkarte hinzufügen';
  modal.querySelector('#pointName').value=card?card.name+(clone?' – neue Version':''):'50 Hz Anlagen 9,10';
  const summary=()=>{modal.querySelector('#pointSummary').textContent=points.length+' Positionen · Inspektion '+
    [...new Set(points.map(p=>p.inspektion).filter(Boolean))].join(', ');
    if(clone){const old=new Set(card.filters.points.map(p=>p.point_id)),known=points.filter(p=>old.has(p.point_id)).length;
      modal.querySelector('#pointSummary').textContent+=' · '+known+' bekannte Positionen, '+(points.length-known)+' neue, '+(old.size-known)+' entfallen';}};summary();
  modal.querySelector('#pointFile').onchange=async e=>{
    try{const file=e.target.files[0];if(!file)return;points=await readPointFile(file);summary();
      modal.querySelector('#pointError').textContent='';modal.querySelector('#pointSave').disabled=false;}
    catch(err){modal.querySelector('#pointError').textContent=err.message;e.target.value='';modal.querySelector('#pointSave').disabled=true;}
  };
  modal.querySelector('#pointCancel').onclick=()=>modal.close();modal.onclose=()=>modal.remove();
  modal.querySelector('#pointSave').onclick=async()=>{
    const name=modal.querySelector('#pointName').value.trim();if(!name){modal.querySelector('#pointError').textContent='Bitte einen Kartenname eingeben.';return;}
    const button=modal.querySelector('#pointSave');button.disabled=true;
    try{
      // Installation prüfen, bevor überhaupt eine Karte geschrieben wird.
      const check=await sb.from('fsd_point_feedback').select('map_id').limit(0);if(check.error)throw Error('Cloud-Erweiterung fehlt. Bitte zuerst supabase-50hz.sql ausführen.');
      let r;
      if(clone)r=await sb.rpc('fsd_clone_point_map',{p_map_id:card.id,p_name:name,p_points:points});
      else if(card)r=await sb.from('maps').update({name,filters:{...card.filters,points}}).eq('id',card.id).eq('status','draft');
      else r=await sb.from('maps').insert({name,status:'draft',filters:{fsd_kind:'handykarte',points}});
      if(r.error)throw r.error;
      modal.close();await loadMaps();
    }catch(err){modal.querySelector('#pointError').textContent=err.message;button.disabled=false;}
  };
  modal.showModal();
}
function viewPointCard(c){window.open('handykarte.html?id='+encodeURIComponent(c.id),'_blank','noopener');}
