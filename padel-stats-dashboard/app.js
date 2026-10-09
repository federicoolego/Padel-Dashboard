
const C={ink:'#063b35',green:'#0d675b',green2:'#15917d',mint:'#bce8dc',soft:'#dfeae6',red:'#dc6868',yellow:'#f2c94c'};
let allMatches=[], tournaments=[], charts={};
const $=s=>document.querySelector(s);
const pct=(a,b)=>b?Math.round(a/b*100):0;
const unique=a=>[...new Set(a)].sort((x,y)=>String(x).localeCompare(String(y),'es'));
const group=(arr,key)=>arr.reduce((o,x)=>((o[x[key]]??=[]).push(x),o),{});
const win=m=>m.resultado==='PG';

async function init(){
  try{
    [allMatches,tournaments]=await Promise.all(['data/partidos.json','data/torneos.json'].map(u=>fetch(u).then(r=>{if(!r.ok)throw Error(u);return r.json()})));
    setupFilters(); render();
  }catch(e){document.querySelector('main').innerHTML='<div class="error"><strong>No se pudieron leer los JSON.</strong><br>Ejecutá el proyecto desde un servidor local. Ver README.md.</div>';}
}
function setupFilters(){
  const years=unique(allMatches.map(x=>x.anio)).sort((a,b)=>b-a);
  $('#yearFilter').innerHTML='<option value="ALL">Todos</option>'+years.map(x=>`<option>${x}</option>`).join('');
  $('#formatFilter').innerHTML+=[...unique(allMatches.map(x=>x.formato))].map(x=>`<option>${x}</option>`).join('');
  $('#courtFilter').innerHTML+=[...unique(allMatches.map(x=>x.cancha))].map(x=>`<option>${x}</option>`).join('');
  ['yearFilter','formatFilter','courtFilter'].forEach(id=>$('#'+id).addEventListener('change',render));
  $('#resetFilters').onclick=()=>{['yearFilter','formatFilter','courtFilter'].forEach(id=>$('#'+id).value='ALL');render()};
  const last=[...allMatches].sort((a,b)=>b.fecha.localeCompare(a.fecha))[0];
  $('#lastMatch').textContent=`Último registro: ${formatDate(last.fecha)}`;
}
function filtered(){return allMatches.filter(x=>($('#yearFilter').value==='ALL'||String(x.anio)===$('#yearFilter').value)&&($('#formatFilter').value==='ALL'||x.formato===$('#formatFilter').value)&&($('#courtFilter').value==='ALL'||x.cancha===$('#courtFilter').value));}
function render(){const m=filtered();renderKpis(m);renderCharts(m);renderPartners(m);renderTournaments();renderInsights(m);}
function streak(sorted){let n=0,type=null;for(const m of sorted){if(type===null)type=m.resultado;if(m.resultado!==type)break;n++}return {n,type};}
function renderKpis(m){
  const wins=m.filter(win).length, losses=m.length-wins;
  const ordered=[...m].sort((a,b)=>b.fecha.localeCompare(a.fecha)||b.id-a.id), s=streak(ordered);
  const partners=Object.entries(group(m,'companiero')).map(([name,v])=>({name,pj:v.length,pg:v.filter(win).length,rate:pct(v.filter(win).length,v.length)})).filter(x=>x.pj>=3).sort((a,b)=>b.rate-a.rate||b.pj-a.pj);
  const best=partners[0];
  const items=[['Partidos jugados',m.length,`${wins} ganados · ${losses} perdidos`],['Efectividad',`${pct(wins,m.length)}%`,m.length?'sobre el período filtrado':'sin partidos'],['Racha actual',s.n||0,s.n?`${s.type==='PG'?'victorias':'derrotas'} consecutivas`:'sin datos'],['Mejor compañero',best?.name||'—',best?`${best.rate}% en ${best.pj} partidos`:'mínimo 3 partidos']];
  $('#kpis').innerHTML=items.map(([a,b,c],i)=>`<article class="kpi"><span>${a}</span><strong>${b}</strong><small class="${i===1?'up':''}">${c}</small></article>`).join('');
}
function destroyCharts(){Object.values(charts).forEach(x=>x.destroy());charts={};}
function baseOptions(){return {responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{usePointStyle:true,boxWidth:8,color:C.ink,font:{weight:700}}}},scales:{x:{grid:{display:false},ticks:{color:'#6c817c'}},y:{beginAtZero:true,grid:{color:'#e6efeb'},ticks:{color:'#6c817c'}}}}}
function renderCharts(m){destroyCharts();
  const months=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const byMonth=group(m.map(x=>({...x,ym:`${x.anio}-${String(x.mes).padStart(2,'0')}`})),'ym');
  const monthKeys=Object.keys(byMonth).sort();
  charts.monthly=new Chart($('#monthlyChart'),{type:'bar',data:{labels:monthKeys.map(k=>`${months[+k.slice(5)-1]} ${k.slice(2,4)}`),datasets:[{type:'bar',label:'Partidos',data:monthKeys.map(k=>byMonth[k].length),backgroundColor:C.mint,borderRadius:8,yAxisID:'y'},{type:'line',label:'Efectividad',data:monthKeys.map(k=>pct(byMonth[k].filter(win).length,byMonth[k].length)),borderColor:C.green,backgroundColor:C.green,pointRadius:4,tension:.35,yAxisID:'y1'}]},options:{...baseOptions(),scales:{x:{grid:{display:false}},y:{beginAtZero:true,grid:{color:'#e6efeb'},title:{display:true,text:'Partidos'}},y1:{beginAtZero:true,max:100,position:'right',grid:{display:false},ticks:{callback:v=>v+'%'},title:{display:true,text:'Efectividad'}}}}});
  const w=m.filter(win).length;
  charts.result=new Chart($('#resultChart'),{type:'doughnut',data:{labels:['Ganados','Perdidos'],datasets:[{data:[w,m.length-w],backgroundColor:[C.green,C.red],borderWidth:0,hoverOffset:5}]},options:{responsive:true,maintainAspectRatio:false,cutout:'68%',plugins:{legend:{position:'bottom',labels:{usePointStyle:true,font:{weight:700}}}}}});
  const dayOrder=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'], byDay=group(m,'dia');
  charts.day=new Chart($('#dayChart'),{type:'bar',data:{labels:dayOrder.map(x=>x.slice(0,3)),datasets:[{label:'Partidos',data:dayOrder.map(x=>(byDay[x]||[]).length),backgroundColor:dayOrder.map(x=>pct((byDay[x]||[]).filter(win).length,(byDay[x]||[]).length)>=60?C.green:C.mint),borderRadius:8}]},options:baseOptions()});
  const courts=Object.entries(group(m,'cancha')).sort((a,b)=>b[1].length-a[1].length).slice(0,7);
  charts.court=new Chart($('#courtChart'),{type:'bar',data:{labels:courts.map(x=>x[0]),datasets:[{label:'Partidos',data:courts.map(x=>x[1].length),backgroundColor:C.green,borderRadius:8}]},options:{...baseOptions(),indexAxis:'y'}});
  const formats=Object.entries(group(m,'formato')).sort((a,b)=>b[1].length-a[1].length);
  charts.format=new Chart($('#formatChart'),{type:'bar',data:{labels:formats.map(x=>x[0]),datasets:[{label:'Efectividad %',data:formats.map(x=>pct(x[1].filter(win).length,x[1].length)),backgroundColor:formats.map((_,i)=>[C.green,C.green2,C.mint,C.yellow][i%4]),borderRadius:8}]},options:{...baseOptions(),scales:{x:{grid:{display:false},ticks:{maxRotation:25,minRotation:0}},y:{beginAtZero:true,max:100,ticks:{callback:v=>v+'%'},grid:{color:'#e6efeb'}}}}});
}
function renderPartners(m){
  const rows=Object.entries(group(m,'companiero')).map(([name,v])=>({name,pj:v.length,pg:v.filter(win).length,rate:pct(v.filter(win).length,v.length)})).filter(x=>x.pj>=3).sort((a,b)=>b.rate-a.rate||b.pj-a.pj).slice(0,8);
  $('#partnerTable').innerHTML=rows.map(x=>`<tr><td><strong>${x.name}</strong></td><td>${x.pj}</td><td>${x.pg}</td><td><div class="rate"><div class="rate-bar"><i style="width:${x.rate}%"></i></div><strong>${x.rate}%</strong></div></td></tr>`).join('')||'<tr><td colspan="4">Sin datos suficientes.</td></tr>';
}
function renderTournaments(){
  const champions=tournaments.filter(x=>x.puesto==='campeon').length;
  $('#tournamentSummary').textContent=`${tournaments.length} torneos · ${champions} títulos`;
  $('#tournamentList').innerHTML=[...tournaments].sort((a,b)=>b.fecha.localeCompare(a.fecha)).map(t=>`<article class="tournament-item ${t.puesto==='campeon'?'trophy':''}"><header><strong>${t.organizador}</strong><time>${formatDate(t.fecha)}</time></header><p>${t.categoria} · con ${t.companiero}</p><span class="pill">${t.puesto==='campeon'?'🏆 Campeón':t.puesto==='subcampeon'?'🥈 Subcampeón':stage(t)}</span></article>`).join('');
}
function stage(t){if(t.final!==null)return t.final?'Final':'Final';if(t.semifinal!==null)return t.semifinal?'Semifinal':'Semifinal';if(t.cuartos!==null)return t.cuartos?'Cuartos':'Cuartos';if(t.octavos!==null)return t.octavos?'Octavos':'Octavos';return t.zona?'Zona':'Fase inicial'}
function renderInsights(m){
  const day=Object.entries(group(m,'dia')).map(([k,v])=>({k,n:v.length,r:pct(v.filter(win).length,v.length)})).filter(x=>x.n>=3).sort((a,b)=>b.r-a.r)[0];
  const partner=Object.entries(group(m,'companiero')).map(([k,v])=>({k,n:v.length,r:pct(v.filter(win).length,v.length)})).filter(x=>x.n>=5).sort((a,b)=>b.r-a.r||b.n-a.n)[0];
  const court=Object.entries(group(m,'cancha')).map(([k,v])=>({k,n:v.length,r:pct(v.filter(win).length,v.length)})).sort((a,b)=>b.n-a.n)[0];
  const format=Object.entries(group(m,'formato')).map(([k,v])=>({k,n:v.length,r:pct(v.filter(win).length,v.length)})).filter(x=>x.n>=3).sort((a,b)=>b.r-a.r)[0];
  const items=[['📅','Tu mejor día',day?`${day.k}: ${day.r}% de efectividad en ${day.n} partidos.`:'No hay datos suficientes.'],['🤝','Sociedad destacada',partner?`Con ${partner.k}: ${partner.r}% de efectividad en ${partner.n} partidos.`:'No hay datos suficientes.'],['📍','Cancha más frecuente',court?`${court.k}: ${court.n} partidos y ${court.r}% de efectividad.`:'No hay datos suficientes.'],['🎾','Formato más efectivo',format?`${format.k}: ${format.r}% de efectividad en ${format.n} partidos.`:'No hay datos suficientes.']];
  $('#insightList').innerHTML=items.map(x=>`<div class="insight-row"><div class="insight-icon">${x[0]}</div><div><strong>${x[1]}</strong><p>${x[2]}</p></div></div>`).join('');
}
function formatDate(s){const [y,m,d]=s.split('-');return `${d}/${m}/${y}`}
init();
