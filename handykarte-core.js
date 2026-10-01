
const DATA=window.FSD_POINT_CONTEXT.points;
const PLANNING=false;

const I18N={
  de:{
    positions:'Positionen',
    my_location:'Mein Standort',
    feedback:'Rückmeldung',
    objects:'Objekte',
    status:'Status',
    done:'Erledigt',
    missing:'Nicht gefunden',
    note_present:'Notiz vorhanden',
    planning:'Truppplanung',
    district:'Netzbezirk',
    route:'Strecke',
    object:'Objekt',
    crew:'Trupp',
    all:'Alle',
    reset:'Zurücksetzen',
    assign:'Auswahl zuweisen',
    clear_selection:'Auswahl lösen',
    save_plan:'Truppplanung speichern',
    export_plan:'Truppplanung exportieren',
    select_hint:'Linksklick = auswählen · Rechtsklick = Details anzeigen',
    selected:'ausgewählt',
    position:'Position',
    tree_species:'Baumart',
    measure:'Maßnahme',
    reason:'Betrieblicher Grund',
    source:'Quelle',
    maps_open:'Google Maps öffnen',
    open:'Offen',
    note:'Notiz',
    note_placeholder:'Notiz zur Position …',
    photos:'Fotos',
    take_photo:'📷 Foto aufnehmen',
    choose_photo:'🖼️ Foto auswählen',
    export_feedback:'Rückmeldung exportieren',
    close:'Schließen',
    map:'Karte',
    satellite:'Satellit',
    fallback:'Ersatzkarte',
    enter_crew:'Bitte zuerst einen Truppnamen eingeben.',
    select_points:'Bitte zuerst Punkte auf der Karte auswählen.',
    assigned:'Positionen wurden dem Trupp zugewiesen.',
    saved_plan:'Truppplanung wurde gespeichert. Jetzt im FSD-Hauptprogramm „Truppplanung importieren“ und danach „Handy-Truppkarte erstellen“.',
    no_positions:'Diesem Trupp sind noch keine Positionen zugewiesen.',
    photo_count:'Fotos',
    tree:'Baum', area:'Fläche', other_veg:'Veg sonstig', save_close:'Speichern & schließen',
    location_here:'Mein Standort',
    location_unsupported:'Standort wird von diesem Browser nicht unterstützt.',
    location_denied:'Standortfreigabe wurde nicht erlaubt.',
    location_failed:'Standort konnte nicht ermittelt werden.',
    local_location_blocked:'Diese Handykarte wurde lokal geöffnet. Der Browser darf hier den GPS-Standort nicht an die Karte übergeben.',
    open_google_maps:'Google Maps stattdessen öffnen?'
  },
  ro:{
    positions:'poziții',
    my_location:'Locația mea',
    feedback:'Raport',
    objects:'Obiecte',
    status:'Stare',
    done:'Finalizat',
    missing:'Nu a fost găsit',
    note_present:'Există notă',
    planning:'Planificare echipă',
    district:'District de rețea',
    route:'Linie',
    object:'Obiect',
    crew:'Echipă',
    all:'Toate',
    reset:'Resetare',
    assign:'Atribuie selecția',
    clear_selection:'Anulează selecția',
    save_plan:'Salvează planificarea',
    export_plan:'Exportă planificarea',
    select_hint:'Click stânga = selectare · Click dreapta = detalii',
    selected:'selectate',
    position:'Poziție',
    tree_species:'Specie arbore',
    measure:'Măsură',
    reason:'Motiv operațional',
    source:'Sursă',
    maps_open:'Deschide Google Maps',
    open:'Deschis',
    note:'Notă',
    note_placeholder:'Notă pentru poziție …',
    photos:'Fotografii',
    take_photo:'📷 Fă fotografie',
    choose_photo:'🖼️ Alege fotografie',
    export_feedback:'Exportă raportul',
    close:'Închide',
    map:'Hartă',
    satellite:'Satelit',
    fallback:'Hartă alternativă',
    enter_crew:'Introduceți mai întâi numele echipei.',
    select_points:'Selectați mai întâi punctele de pe hartă.',
    assigned:'Pozițiile au fost atribuite echipei.',
    saved_plan:'Planificarea a fost salvată. Importați apoi planificarea în programul principal FSD și creați harta pentru echipă.',
    no_positions:'Această echipă nu are încă poziții atribuite.',
    photo_count:'Fotografii',
    tree:'Arbore', area:'Suprafață', other_veg:'Altă vegetație', save_close:'Salvează și închide',
    location_here:'Locația mea',
    location_unsupported:'Acest browser nu acceptă localizarea.',
    location_denied:'Accesul la locație nu a fost permis.',
    location_failed:'Locația nu a putut fi determinată.',
    local_location_blocked:'Această hartă a fost deschisă local. Browserul nu poate transmite locația GPS către hartă în acest mod.',
    open_google_maps:'Deschizi Google Maps în schimb?'
  }
};

let LANG='de';
try{ LANG=localStorage.getItem('fsd_lang')||'de'; }catch(e){}
if(!I18N[LANG])LANG='de';

function tr(k){ return I18N[LANG]?.[k] ?? I18N.de[k] ?? k; }

function setText(id,key){
  const el=document.getElementById(id);
  if(el)el.textContent=tr(key);
}
function setLang(lang){
  LANG=I18N[lang]?lang:'de';
  try{localStorage.setItem('fsd_lang',LANG)}catch(e){}
  applyLanguage();
}
function applyLanguage(){
  document.getElementById('langDE')?.classList.toggle('active',LANG==='de');
  document.getElementById('langRO')?.classList.toggle('active',LANG==='ro');

  const bl=document.getElementById('btnLocation'); if(bl)bl.textContent='📍 '+tr('my_location');
  const bf=document.getElementById('btnFeedback'); if(bf)bf.textContent='↓ '+tr('feedback');

  const pTitle=document.querySelector('#planner .ptitle');
  if(pTitle)pTitle.textContent=tr('planning');

  const labels=document.querySelectorAll('[data-i18n]');
  labels.forEach(el=>{ const k=el.getAttribute('data-i18n'); if(k)el.textContent=tr(k); });

  const note=document.getElementById('pNote');
  if(note)note.placeholder=tr('note_placeholder');

  renderObjectLegend();

  const count=document.getElementById('count');
  if(count)count.textContent=DATA.length+' '+tr('positions');

  const sel=document.getElementById('selCount');
  if(sel){
    const n=(sel.textContent.match(/\d+/)||['0'])[0];
    sel.textContent=n+' '+tr('selected');
  }
}


// Objektfarben: auf Rechner- und Handykarte identisch.
const OBJECT_COLORS = {
  'Baum':'#d62828',
  'Veg. sonstig':'#f28c28',
  'Veg sonstig':'#f28c28',
  'Vegetation sonstig':'#f28c28',
  'Fläche':'#2563eb',
  'Flaeche':'#2563eb',
  'Gehölz':'#7c3aed',
  'Gehoelz':'#7c3aed',
  'Hecke':'#16a34a',
  'Strauch':'#0f9f7a'
};
const FALLBACK_OBJECT_COLORS=['#0891b2','#a855f7','#ca8a04','#475569','#be123c','#15803d'];

function objectLabel(x){
  const v=(x.objekt||x.objekt_typ||x['Objekt Typ']||'Sonstiges').toString().trim();
  return v || 'Sonstiges';
}
function colorForObject(obj){
  if(OBJECT_COLORS[obj]) return OBJECT_COLORS[obj];
  // Gleiche unbekannte Bezeichnung erhält immer dieselbe Farbe.
  let h=0;
  for(let i=0;i<obj.length;i++) h=((h<<5)-h)+obj.charCodeAt(i);
  return FALLBACK_OBJECT_COLORS[Math.abs(h)%FALLBACK_OBJECT_COLORS.length];
}
function translatedObjectLabel(obj){
  const raw=(obj||'').toString().trim();
  const k=raw.toLowerCase();
  if(k==='baum') return tr('tree');
  if(k==='fläche' || k==='flaeche') return tr('area');
  if(k==='veg sonstig' || k==='veg. sonstig' || k==='vegetation sonstig') return tr('other_veg');
  return raw;
}

function renderObjectLegend(){
  const el=document.getElementById('objLegend');
  if(!el)return;
  const objs=[...new Set(DATA.map(objectLabel))].sort((a,b)=>a.localeCompare(b,'de'));
  if(!objs.length){el.style.display='none';return}
  el.innerHTML=
    '<div class="lgTitle">'+tr('objects')+'</div>'+
    objs.map(o=>'<div class="lgRow"><span class="lgDot" style="background:'+colorForObject(o)+'"></span><span>'+esc(translatedObjectLabel(o))+'</span></div>').join('')+
    '<div style="height:1px;background:#d8dde2;margin:6px 0"></div>'+
    '<div class="lgTitle">'+tr('status')+'</div>'+
    '<div class="lgRow"><span class="lgDot" style="background:#16a34a"></span><span>'+tr('done')+'</span></div>'+
    '<div class="lgRow"><span class="lgDot" style="background:#5b4636"></span><span>'+tr('missing')+'</span></div>'+
    '<div class="lgRow"><span class="lgDot" style="background:#ffd400;color:#111;text-align:center;font-weight:900;line-height:11px">!</span><span>'+tr('note_present')+'</span></div>';
}

const STORAGE_KEY='fsd_points_state_'+window.FSD_POINT_CONTEXT.map.id;
let state={};
let current=null;

function esc(v){
  return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function loadState(){
  try{
    const saved=localStorage.getItem(STORAGE_KEY);
    if(saved) state=JSON.parse(saved)||{};
  }catch(e){}
  Object.assign(state,window.FSDCloud.initialState());
  for(const x of DATA){
    const key=x.uid||String(x.nr);
    if(!state[key]){
      state[key]={status:x.status||'Offen',notiz:x.notiz||'',fotos:Array.isArray(x.fotos)?x.fotos:[],tree_notes:{}};
    }
    if(!state[key].tree_notes)state[key].tree_notes={};
  }
}
function persist(){
  window.FSDCloud.recordChanges(state);
  try{
    localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
  }catch(e){
    console.warn(e);
  }
}
loadState();

const map=L.map('map',{
  dragging:true,touchZoom:true,scrollWheelZoom:true,doubleClickZoom:true,
  boxZoom:true,keyboard:true,tap:true,zoomControl:false
});
L.control.zoom({position:'topright'}).addTo(map);

// Amtliche BVV-Karten. DOP20 bleibt Standard.
const satellite=L.tileLayer.wms('https://geoservices.bayern.de/od/wms/dop/v1/dop20?',{
  layers:'by_dop20c',format:'image/jpeg',transparent:false,version:'1.3.0',
  crs:L.CRS.EPSG3857,maxZoom:23,attribution:'Bayerische Vermessungsverwaltung · DOP20 CC BY 4.0'
}).addTo(map);
const topo=L.tileLayer('https://geoservices.bayern.de/od/wmts/geobasis/v1/1.0.0/by_amtl_karte/default/smerc/{z}/{y}/{x}.png',{
  maxZoom:22,attribution:'Bayerische Vermessungsverwaltung'
});
const gray=L.tileLayer('https://geoservices.bayern.de/od/wmts/geobasis/v1/1.0.0/by_webkarte_grau/default/smerc/{z}/{y}/{x}.png',{
  maxZoom:22,attribution:'Bayerische Vermessungsverwaltung'
});
const parcelsBY=L.tileLayer.wms('https://geoservices.bayern.de/od/wms/alkis/v1/parzellarkarte?',{
  layers:'by_alkis_parzellarkarte_umr_schwarz',format:'image/png',transparent:true,version:'1.3.0',
  crs:L.CRS.EPSG3857,maxZoom:23,opacity:.85,attribution:'Bayerische Vermessungsverwaltung · ALKIS'
});
const parcelsTH=L.tileLayer.wms('https://www.geoproxy.geoportal-th.de/geoproxy/services/INSPIREcp',{
  layers:'CP.CadastralParcel',styles:'default',format:'image/png',transparent:true,version:'1.3.0',
  maxZoom:23,opacity:.85,attribution:'GDI Thüringen · ALKIS'
});
L.control.layers(
  {'Luftbild DOP20':satellite,'Topografisch':topo,'Karte grau':gray},
  {'Flurstücke Bayern':parcelsBY,'Flurstücke Thüringen':parcelsTH},
  {position:'topright',collapsed:true}
).addTo(map);

const bounds=[];
const markerRefs=[];
const geometryRefs=[];
const markerByKey={};

function markerClass(status){
  if(status==='Erledigt') return 'done';
  if(status==='Nicht gefunden') return 'missing';
  return '';
}
function noteForItem(x){
  const key=x.uid||String(x.nr);
  const live=(state[key]?.notiz ?? x.notiz ?? '').toString().trim();
  return live;
}
function makeIcon(x){
  const key=x.uid||String(x.nr);
  const st=state[key]?.status||x.status||'Offen';
  const obj=objectLabel(x);
  const color=colorForObject(obj);
  const note=noteForItem(x);
  const noteHtml=note ? `<div class="noteFlag" title="Notiz vorhanden: ${esc(note)}">!</div>` : '';
  const statusClass=markerClass(st);

  // Offen: Objektfarbe ist die volle Markerfarbe.
  // Bearbeitet: Statusfarbe innen, Objektfarbe als Außenrand.
  let markerStyle=`background:${color};border-color:white;`;
  if(st==='Erledigt' || st==='Nicht gefunden'){
    markerStyle=`border:4px solid ${color};line-height:26px;`;
  }

  return L.divIcon({
    className:'',
    html:`<div class="numWrap">
            <div class="num ${statusClass}" style="${markerStyle}" title="${esc(obj)}">${x.nr}</div>
            ${noteHtml}
          </div>`,
    iconSize:[34,34],iconAnchor:[17,17]
  });
}
function refreshMarker(x){
  const key=x.uid||String(x.nr);
  const m=markerByKey[key];
  if(m){m.setIcon(makeIcon(x)); setTimeout(()=>updatePlanMarker(x,m),0);}
}

for(const x of DATA){
  const key=x.uid||String(x.nr);
  const m=L.marker([x.lat,x.lon],{icon:makeIcon(x),riseOnHover:true,riseOffset:1000}).addTo(map);
  markerByKey[key]=m;

  m.bindTooltip(`Nr. ${x.nr}`,{
    permanent:false,direction:'top',offset:[0,-18],className:'numlabel',opacity:1
  });
  m.on('mouseover',()=>{
    const el=m.getElement();
    if(el){
      const n=el.querySelector('.num');
      if(n)n.classList.add('hovered');
    }
    m.openTooltip();
  });
  m.on('mouseout',()=>{
    const el=m.getElement();
    if(el){
      const n=el.querySelector('.num');
      if(n)n.classList.remove('hovered');
    }
    m.closeTooltip();
  });
  m.on('click',(ev)=>{
    if(ev?.originalEvent?.stopPropagation)ev.originalEvent.stopPropagation();
    if(PLANNING && window.innerWidth>=800){
      togglePlanSelection(x,m);
    }else{
      openPanel(x);
    }
  });
  m.on('contextmenu',(ev)=>{
    if(ev?.originalEvent?.preventDefault)ev.originalEvent.preventDefault();
    if(ev?.originalEvent?.stopPropagation)ev.originalEvent.stopPropagation();
    openPanel(x);
  });

  bounds.push([x.lat,x.lon]);
  markerRefs.push({marker:m,data:x,orig:[x.lat,x.lon]});
}

// Importierte Geometrien aus dem PC-Projekt: Fläche/Linie zusätzlich zum Mittelpunkt darstellen.
for(const x of DATA){
  if(!x.geojson_geometry)continue;
  try{
    const gj={type:'Feature',geometry:x.geojson_geometry,properties:x.geojson_properties||{}};
    const gl=L.geoJSON(gj,{style:()=>({color:'#ff9800',weight:6,fillColor:'#ff9800',fillOpacity:.22})}).addTo(map);
    gl.on('click',(ev)=>{try{L.DomEvent.stopPropagation(ev.originalEvent)}catch(e){} openPanel(x);});
    gl.bindTooltip(`${esc(x.strecke||'')} ${esc(x.von_km||x.km||'')}${x.bis_km?'–'+esc(x.bis_km):''}`,{sticky:true});
    geometryRefs.push({layer:gl,data:x});
    try{const b=gl.getBounds();if(b.isValid()){bounds.push(b.getSouthWest());bounds.push(b.getNorthEast())}}catch(e){}
  }catch(e){}
}

function isMarkerVisible(ref){
  return map.hasLayer(ref.marker);
}

let layoutTimer=null;

function resetMarkerPositions(){
  markerRefs.forEach(ref=>{
    if(isMarkerVisible(ref))ref.marker.setLatLng(ref.orig);
  });
}

function screenClusters(refs, thresholdPx){
  const pts=refs.map(ref=>({
    ref,
    p:map.latLngToLayerPoint(ref.orig)
  }));
  const used=new Set();
  const out=[];

  for(let i=0;i<pts.length;i++){
    if(used.has(i))continue;
    const cluster=[];
    const queue=[i];
    used.add(i);

    while(queue.length){
      const a=queue.shift();
      cluster.push(pts[a]);
      for(let j=0;j<pts.length;j++){
        if(used.has(j))continue;
        const dx=pts[a].p.x-pts[j].p.x;
        const dy=pts[a].p.y-pts[j].p.y;
        if(Math.sqrt(dx*dx+dy*dy)<thresholdPx){
          used.add(j);
          queue.push(j);
        }
      }
    }
    out.push(cluster);
  }
  return out;
}

function spreadCluster(cluster, radius){
  if(cluster.length<=1)return;

  // Mittelpunkt bleibt direkt am tatsächlichen Arbeitsbereich.
  const cx=cluster.reduce((s,v)=>s+v.p.x,0)/cluster.length;
  const cy=cluster.reduce((s,v)=>s+v.p.y,0)/cluster.length;
  const n=cluster.length;

  cluster.forEach((entry,i)=>{
    const angle=(Math.PI*2*i/n)-Math.PI/2;
    const p=L.point(
      cx+Math.cos(angle)*radius,
      cy+Math.sin(angle)*radius
    );
    entry.ref.marker.setLatLng(map.layerPointToLatLng(p));
  });
}

function autoLayoutMarkers(){
  if(layoutTimer)clearTimeout(layoutTimer);
  layoutTimer=setTimeout(()=>{
    // Grundsätzlich immer die echten GPS-Positionen verwenden.
    resetMarkerPositions();

    const zoom=map.getZoom();
    const visible=markerRefs.filter(isMarkerVisible);

    // Weit draußen: keine künstliche Auffächerung.
    // Die Karte soll zeigen, wo die Arbeitsbereiche wirklich liegen.
    if(zoom < 16){
      markerRefs.forEach(ref=>updatePlanMarker(ref.data,ref.marker));
      return;
    }

    // Erst beim deutlichen Reinzoomen kleine Überlagerungen automatisch lösen.
    // Je weiter hineingezoomt wird, desto mehr Platz darf zwischen den Nummern entstehen.
    const threshold = zoom >= 18 ? 30 : (zoom >= 17 ? 25 : 20);
    const clusters=screenClusters(visible,threshold);

    clusters.forEach(cluster=>{
      if(cluster.length<=1)return;

      // Nur eng überlappende Marker minimal versetzen.
      // Kein großer Ring und keine Verschiebung über den eigentlichen Standort hinaus.
      let radius;
      if(zoom >= 18){
        radius = cluster.length<=3 ? 20 : (cluster.length<=6 ? 26 : 32);
      }else if(zoom >= 17){
        radius = cluster.length<=3 ? 17 : (cluster.length<=6 ? 22 : 27);
      }else{
        radius = cluster.length<=3 ? 14 : (cluster.length<=6 ? 18 : 22);
      }
      spreadCluster(cluster,radius);
    });

    markerRefs.forEach(ref=>updatePlanMarker(ref.data,ref.marker));
  },35);
}

map.on('zoomend moveend resize',autoLayoutMarkers);

function renderInspection(x){
  const fields=[
    ['Inspektion',x.inspektion],
    ['Seite',x.rkz],['Abstand Gleismitte',x.abstand_gleis?x.abstand_gleis+' m':''],
    ['Anzahl',x.anzahl],['BHD',x.bhd],['Höhe',x.hoehe?x.hoehe+' m':''],
    ['Art 1',x.art1],['Art 2',x.art2],['Art 3',x.art3],['Belaubung',x.belaubung],
    ['Eigentümer',x.eigentuemer],['VSP',x.vsp],['Befund',x.befund],
    ['Umsetzung',x.massnahmenumsetzung],['Maschine',x.maschine],['Dringlichkeit',x.dringlichkeit],
    ['Aufnahmejahr',x.aufnahmejahr]
  ].filter(z=>String(z[1]??'').trim()!=='');
  const block=document.getElementById('inspectionBlock'), el=document.getElementById('pInspection');
  if(!fields.length){block.style.display='none';el.innerHTML='';return;}
  block.style.display='block';
  el.innerHTML=fields.map(z=>`<span class="badge"><b>${esc(z[0])}:</b> ${esc(z[1])}</span>`).join(' ')+
    (x._display_offset_default?'<div style="font-size:11px;color:#666;margin-top:4px">rdB/ldB ohne Abstand: Linie/Punkt nur zur Darstellung um 4 m versetzt.</div>':'');
}
function saveTreeNote(species,value){
  if(!current)return; const key=currentKey();
  if(!state[key].tree_notes)state[key].tree_notes={};
  state[key].tree_notes[species]=value; persist();
}
function renderTreeNotes(x){
  let arr=[x.art1,x.art2,x.art3].map(v=>String(v||'').trim()).filter(Boolean);
  if(!arr.length && x.baumart)arr=String(x.baumart).split(/[,;/]+/).map(v=>v.trim()).filter(Boolean);
  arr=[...new Set(arr)];
  const block=document.getElementById('treeNotesBlock'),el=document.getElementById('pTreeNotes');
  if(!arr.length || arr.some(v=>v.toLowerCase()==='bäume und sträucher')){block.style.display='none';el.innerHTML='';return;}
  const notes=state[currentKey()]?.tree_notes||{};
  block.style.display='block';
  el.innerHTML=arr.map(sp=>`<div style="margin:5px 0"><b>${esc(sp)}</b><br><input style="width:100%;box-sizing:border-box;padding:7px;border:1px solid #bbb;border-radius:7px" value="${esc(notes[sp]||'')}" placeholder="z. B. Hebebühne / Klettern / geht so" oninput="saveTreeNote(${JSON.stringify(sp)},this.value)"></div>`).join('');
}

function openPanel(x){
  current=x;
  const key=x.uid||String(x.nr);
  const st=state[key];
  const km=x.von_km&&x.bis_km?`${x.von_km}–${x.bis_km}`:(x.km||'');
  document.getElementById('pTitle').textContent=`Nr. ${x.nr}`;
  document.getElementById('pSub').textContent=x.objekt_typ||'';
  document.getElementById('pBadges').innerHTML=
    `<span class="badge">${esc(x.objekt_typ||'')}</span><span class="badge">${esc(st.status)}</span>`;
  document.getElementById('pBezirk').textContent=x.netzbezirk||'';
  document.getElementById('pStrecke').textContent=`${x.strecke||''} / ${km}`;
  document.getElementById('pBaumart').textContent=x.baumart||'';
  document.getElementById('baumartRow').style.display=x.baumart?'block':'none';
  document.getElementById('pMassnahme').textContent=x.massnahme||'';
  document.getElementById('pGrund').textContent=x.grund||x.befund||'';
  renderInspection(x);
  renderTreeNotes(x);
  document.getElementById('pTrupp').textContent=x.trupp||'';
  document.getElementById('pQuelle').textContent=x.quelle||'';
  const maps=document.getElementById('pMaps');
  maps.href=x.link||'#';
  maps.style.display=x.link?'inline-block':'none';
  document.getElementById('pNote').value=st.notiz||'';
  updateStatusButtons(st.status);
  renderPhotos();
  document.getElementById('panel').classList.add('open');
  if(window.innerWidth>=900)document.getElementById('map').classList.add('panel-open');
}
function closePanel(){
  document.getElementById('panel').classList.remove('open');
  document.getElementById('map').classList.remove('panel-open');
  current=null;
}
function saveAndClose(){
  saveNote();
  persist();
  closePanel();
}
function currentKey(){
  return current?(current.uid||String(current.nr)):null;
}
function updateStatusButtons(status){
  for(const id of ['sOpen','sDone','sMissing'])document.getElementById(id).classList.remove('active');
  if(status==='Erledigt')document.getElementById('sDone').classList.add('active');
  else if(status==='Nicht gefunden')document.getElementById('sMissing').classList.add('active');
  else document.getElementById('sOpen').classList.add('active');
}
function setStatus(status){
  if(!current)return;
  const key=currentKey();
  state[key].status=status;
  persist();
  updateStatusButtons(status);
  document.getElementById('pBadges').innerHTML=
    `<span class="badge">${esc(current.objekt_typ||'')}</span><span class="badge">${esc(status)}</span>`;
  refreshMarker(current);
}
function saveNote(){
  if(!current)return;
  state[currentKey()].notiz=document.getElementById('pNote').value;
  persist();
  refreshMarker(current);
}

function compressImage(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onerror=reject;
    reader.onload=()=>{
      const img=new Image();
      img.onerror=reject;
      img.onload=()=>{
        const max=960;
        let w=img.width,h=img.height;
        if(w>max||h>max){
          const scale=Math.min(max/w,max/h);
          w=Math.round(w*scale);h=Math.round(h*scale);
        }
        const c=document.createElement('canvas');
        c.width=w;c.height=h;
        c.getContext('2d').drawImage(img,0,0,w,h);
        resolve({name:file.name||'Foto.jpg',data:c.toDataURL('image/jpeg',0.65)});
      };
      img.src=reader.result;
    };
    reader.readAsDataURL(file);
  });
}
async function addPhotos(files,inputId){
  if(!current||!files?.length)return;
  const key=currentKey();
  for(const f of files){
    try{
      if(state[key].fotos.length>=10){alert('Maximal 10 Fotos je Position.');break;}
      const photo=await compressImage(f);
      if(photo.data.length>800000){alert('Dieses Foto ist zu groß. Bitte einen kleineren Ausschnitt wählen.');continue;}
      state[key].fotos.push(photo);
    }catch(e){
      alert('Foto konnte nicht verarbeitet werden.');
    }
  }
  persist();
  renderPhotos();
  if(inputId && document.getElementById(inputId))document.getElementById(inputId).value='';
}
function deletePhoto(index){
  if(!current)return;
  state[currentKey()].fotos.splice(index,1);
  persist();
  renderPhotos();
}
function renderPhotos(){
  if(!current)return;
  const arr=state[currentKey()].fotos||[];
  document.getElementById('photoCount').textContent=`${arr.length}`;
  document.getElementById('photos').innerHTML=arr.map((p,i)=>
    `<div class="photo"><img src="${esc(p.data)}" alt="Foto"><button onclick="deletePhoto(${i})">✕</button></div>`
  ).join('');
}

function exportFeedback(){
  const items=DATA.map(x=>{
    const key=x.uid||String(x.nr);
    const st=state[key]||{};
    return {
      uid:x.uid||'',
      nr:x.nr,
      strecke:x.strecke||'',
      km:x.km||'',
      be_nr:x.be_nr||'', obj_nr:x.obj_nr||'', lat:x.lat, lon:x.lon,
      status:st.status||'Offen',
      notiz:st.notiz||'',
      tree_notes:st.tree_notes||{},
      fotos:Array.isArray(st.fotos)?st.fotos:[]
    };
  });
  const payload={
    type:'FSD_HANDYKARTE_RUECKMELDUNG',
    version:1,
    title:'FSD Handykarte',
    exported:new Date().toISOString(),
    items
  };
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='FSD_Rueckmeldung_'+new Date().toISOString().slice(0,10)+'.json';
  document.body.appendChild(a);
  a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);
}



const mapFilterIds={
  netzbezirk:'fBezirk',
  inspektion:'fInspektion',
  strecke:'fStrecke',
  objekt_typ:'fObjekt',
  status:'fStatus',
  trupp:'fTrupp'
};

function statusOf(x){
  const key=x.uid||String(x.nr);
  return state[key]?.status||x.status||'Offen';
}
function filterValue(x,key){
  if(key==='status')return statusOf(x);
  return String(x[key]??'').trim();
}
function fillSelect(id,values){
  const el=document.getElementById(id);
  if(!el)return;
  const current=el.value||'Alle';
  const vals=['Alle',...Array.from(new Set(values.filter(v=>String(v).trim()).map(v=>String(v).trim())))
    .sort((a,b)=>a.localeCompare(b,'de',{numeric:true}))];
  el.innerHTML=vals.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
  if(vals.includes(current))el.value=current;
}
function rebuildMapFilterOptions(){
  fillSelect('fBezirk',DATA.map(x=>x.netzbezirk||''));
  fillSelect('fInspektion',DATA.map(x=>x.inspektion??''));
  fillSelect('fStrecke',DATA.map(x=>x.strecke||''));
  fillSelect('fObjekt',DATA.map(x=>x.objekt_typ||''));
  fillSelect('fStatus',DATA.map(statusOf));
  fillSelect('fTrupp',DATA.map(x=>x.trupp||''));
}
function matchesMapFilters(x){
  for(const [key,id] of Object.entries(mapFilterIds)){
    const el=document.getElementById(id);
    if(!el||el.value==='Alle')continue;
    if(filterValue(x,key)!==el.value)return false;
  }
  return true;
}
function applyMapFilters(){
  let visible=0;
  markerRefs.forEach(ref=>{
    if(matchesMapFilters(ref.data)){
      if(!map.hasLayer(ref.marker))ref.marker.addTo(map);
      visible++;
    }else{
      if(map.hasLayer(ref.marker))map.removeLayer(ref.marker);
    }
  });
  geometryRefs.forEach(ref=>{
    if(matchesMapFilters(ref.data)){
      if(!map.hasLayer(ref.layer))ref.layer.addTo(map);
    }else{
      if(map.hasLayer(ref.layer))map.removeLayer(ref.layer);
    }
  });
  const vc=document.getElementById('viewCount');
  if(vc)vc.textContent='· '+visible+' sichtbar';
  autoLayoutMarkers();
}
function resetMapFilters(){
  Object.values(mapFilterIds).forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.value='Alle';
  });
  applyMapFilters();
}

const planSelection=new Set();

function planKey(x){return x.uid||String(x.nr)}
function updatePlanMarker(x,m){
  const el=m.getElement();
  if(!el)return;
  const n=el.querySelector('.num');
  if(!n)return;
  if(planSelection.has(planKey(x)))n.classList.add('selected');
  else n.classList.remove('selected');
}
function togglePlanSelection(x,m){
  const k=planKey(x);
  if(planSelection.has(k))planSelection.delete(k); else planSelection.add(k);
  updatePlanMarker(x,m);
  document.getElementById('selCount').textContent=planSelection.size+' '+tr('selected');
  autoLayoutMarkers();
}
function selectAllPositions(){
  DATA.forEach(x=>planSelection.add(planKey(x)));
  markerRefs.forEach(r=>updatePlanMarker(r.data,r.marker));
  document.getElementById('selCount').textContent=planSelection.size+' '+tr('selected');
  autoLayoutMarkers();
}
function clearSelection(){
  planSelection.clear();
  markerRefs.forEach(r=>updatePlanMarker(r.data,r.marker));
  document.getElementById('selCount').textContent='0 ausgewählt';
}
function assignSelectedToTrupp(){
  const t=document.getElementById('planTrupp').value.trim();
  if(!t){alert(tr('enter_crew'));return}
  if(!planSelection.size){alert(tr('select_points'));return}
  DATA.forEach(x=>{if(planSelection.has(planKey(x)))x.trupp=t});
  rebuildMapFilterOptions();
  markerRefs.forEach(ref=>refreshMarker(ref.data));
  clearSelection();
  autoLayoutMarkers();
  alert('Positionen wurden '+t+' zugewiesen.');
}
function currentTruppItems(){
  const t=document.getElementById('planTrupp').value.trim();
  if(!t)return [];
  return DATA.filter(x=>(x.trupp||'')===t);
}
function downloadCurrentTruppMap(){
  const t=document.getElementById('planTrupp').value.trim();
  if(!t){alert('Bitte Truppnamen eingeben.');return}
  const subset=currentTruppItems();
  if(!subset.length){alert(tr('no_positions'));return}
  exportTruppPlan();
  alert(tr('saved_plan'));
}

function exportTruppPlan(){
  const payload={
    type:'FSD_TRUPPPLANUNG',
    version:1,
    exported:new Date().toISOString(),
    items:DATA.map(x=>({uid:x.uid||'',nr:x.nr,trupp:x.trupp||''}))
  };
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='FSD_Truppplanung_'+new Date().toISOString().slice(0,10)+'.json';
  document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);
}
if(PLANNING){
  document.getElementById('planner').classList.add('open');
  rebuildMapFilterOptions();
}else{
  const planner=document.getElementById('planner');
  if(planner)planner.remove();
}

renderObjectLegend();
applyLanguage();
document.getElementById('count').textContent=DATA.length+' '+tr('positions');
if(bounds.length){
  map.fitBounds(bounds,{padding:[90,45]});
}else{
  map.setView([48.13,11.54],13);
}
setTimeout(()=>{
  if(PLANNING)applyMapFilters();
  else autoLayoutMarkers();
},250);

let userLocationMarker=null;

function locateMe(){
  const localMode=(location.protocol==='file:' || location.protocol==='content:');
  const secureOK=(window.isSecureContext || location.hostname==='localhost' || location.hostname==='127.0.0.1');
  if(localMode || !secureOK){ locationFallback(tr('local_location_blocked')); return; }
  if(!navigator.geolocation){ alert(tr('location_unsupported')); return; }
  // Läuft die Ortung bereits, dient der Button nur als Fadenkreuz: zurück zum aktuellen Standort.
  if(window.fsdLastLocation){ map.setView(window.fsdLastLocation,17); return; }
  if(window.fsdWatchId!==undefined && window.fsdWatchId!==null) return;
  window.fsdWatchId=navigator.geolocation.watchPosition(
    p=>{
      const ll=[p.coords.latitude,p.coords.longitude];
      window.fsdLastLocation=ll;
      if(!userLocationMarker){
        userLocationMarker=L.circleMarker(ll,{radius:9,weight:3,color:'#17365d',fillColor:'#38bdf8',fillOpacity:.9}).addTo(map).bindPopup(tr('location_here'));
        map.setView(ll,17);
      }else{ userLocationMarker.setLatLng(ll); }
    },
    err=>{let reason=tr('location_failed');if(err&&err.code===1)reason=tr('location_denied');alert(reason);},
    {enableHighAccuracy:true,timeout:15000,maximumAge:3000}
  );
}

function locationFallback(reason){
  const openMaps=confirm(reason+'\n\n'+tr('open_google_maps'));
  if(openMaps){
    window.open('https://www.google.com/maps','_blank');
  }
}

window.FSDCloud.attach({state,refresh:()=>markerRefs.forEach(ref=>refreshMarker(ref.data)),current:()=>current,openPanel,closePanel});
