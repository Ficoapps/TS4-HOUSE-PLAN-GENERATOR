(function(global){
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const r=(n)=>Math.round(n*10)/10;
  const room=(id,name,type,x,y,w,h,opts={})=>({id,name,type,x:r(x),y:r(y),w:r(w),h:r(h),...opts});

  function parseLot(v){const [w,h]=v.split('x').map(Number);return {w,h};}
  function collectSettings(doc=document){
    return {
      projectName:doc.querySelector('#projectName').value.trim()||'Progetto senza nome',
      lot:parseLot(doc.querySelector('#lotSize').value),
      style:doc.querySelector('#style').value,
      renderStyle:doc.querySelector('#renderStyle').value,
      floors:clamp(+doc.querySelector('#floors').value||1,1,4),
      bedrooms:clamp(+doc.querySelector('#bedrooms').value||1,1,8),
      shape:doc.querySelector('#shape').value,
      ensuite:doc.querySelector('#ensuite').checked,
      wardrobe:doc.querySelector('#wardrobe').checked,
      study:doc.querySelector('#study').checked,
      laundry:doc.querySelector('#laundry').checked,
      pantry:doc.querySelector('#pantry').checked,
      openSpace:doc.querySelector('#openSpace').checked,
      pool:doc.querySelector('#pool').checked,
      bbq:doc.querySelector('#bbq').checked,
      garden:doc.querySelector('#garden').checked,
      garage:doc.querySelector('#garage').checked,
      balcony:doc.querySelector('#balcony').checked,
      baseGame:doc.querySelector('#baseGame').checked,
      variant:+(doc.body.dataset.variant||0)
    };
  }

  function logicalSize(s){
    const w=clamp(Math.floor(s.lot.w*.66),22,42);
    const h=clamp(Math.floor(s.lot.h*.66),17,34);
    return {w,h};
  }

  function mirrorRooms(items,W){return items.map(q=>({...q,x:r(W-q.x-q.w),door:q.door?{...q.door,side:q.door.side==='left'?'right':q.door.side==='right'?'left':q.door.side}:q.door,windows:(q.windows||[]).map(w=>({...w,side:w.side==='left'?'right':w.side==='right'?'left':w.side}))}));}

  function groundFloor(s,W,H){
    const rooms=[]; const ext=[]; const mirror=s.variant%2===1;
    const lower=Math.max(10,Math.round(H*.46));
    const hallW=Math.max(5,Math.round(W*.17));
    const livingW=Math.max(10,Math.round(W*.39));
    const kitchenW=W-livingW-hallW;
    const publicY=H-lower;

    rooms.push(room('living','SOGGIORNO','living',0,publicY,livingW,lower,{zone:'giorno',windows:[{side:'bottom',n:2},{side:'left',n:1}],door:{side:'right'},floor:'wood'}));
    rooms.push(room('foyer','INGRESSO / HALL','foyer',livingW,publicY,hallW,lower,{zone:'distribuzione',windows:[{side:'bottom',n:1}],door:{side:'bottom',entry:true},floor:'stone'}));
    rooms.push(room('kitchen',s.openSpace?'CUCINA + PRANZO':'CUCINA','kitchen',livingW+hallW,publicY,kitchenW,lower,{zone:'giorno',windows:[{side:'bottom',n:2},{side:'right',n:1}],door:{side:'left'},floor:'tile'}));
    if(!s.openSpace){
      const dw=Math.max(6,Math.round(kitchenW*.46));
      rooms.push(room('dining','PRANZO','dining',livingW+hallW,publicY,dw,Math.max(6,Math.round(lower*.48)),{zone:'giorno',door:{side:'left'},floor:'wood',overlay:true}));
    }

    const upperH=publicY;
    const stairW=Math.max(5,Math.round(W*.17));
    const serviceW=Math.max(6,Math.round(W*.18));
    const leftW=Math.max(8,Math.round(W*.28));
    const centerW=W-leftW-serviceW;
    rooms.push(room('study',s.study?'STUDIO':'SALA MULTIUSO','study',0,0,leftW,Math.max(7,upperH*.58),{zone:'servizi',windows:[{side:'top',n:1},{side:'left',n:1}],door:{side:'right'},floor:'wood'}));
    if(s.study){rooms.push(room('guest','SALA LETTURA','lounge',0,Math.max(7,upperH*.58),leftW,upperH-Math.max(7,upperH*.58),{zone:'giorno',windows:[{side:'left',n:1}],door:{side:'right'},floor:'wood'}));}
    rooms.push(room('corridor','DISIMPEGNO','corridor',leftW,0,centerW,upperH,{zone:'distribuzione',floor:'stone'}));
    rooms.push(room('stairs','SCALA','stairs',leftW+Math.max(1,(centerW-stairW)/2),Math.max(1,upperH*.16),stairW,Math.max(6,upperH*.66),{zone:'distribuzione',floor:'stone'}));

    const svcX=W-serviceW;
    const pieces=[];
    let py=0;
    if(s.laundry){let ph=Math.max(4,upperH*.28);pieces.push(room('laundry','LAVANDERIA','laundry',svcX,py,serviceW,ph,{zone:'servizi',door:{side:'left'},windows:[{side:'right',n:1}],floor:'tile'}));py+=ph;}
    let ph=Math.max(4,upperH*.27);pieces.push(room('powder','BAGNO OSPITI','bath',svcX,py,serviceW,ph,{zone:'servizi',door:{side:'left'},windows:[{side:'right',n:1}],floor:'tile'}));py+=ph;
    if(s.pantry){pieces.push(room('pantry','DISPENSA','pantry',svcX,py,serviceW,Math.max(3,upperH-py),{zone:'servizi',door:{side:'left'},floor:'tile'}));}
    else if(py<upperH){pieces.push(room('storage','RIPOSTIGLIO','storage',svcX,py,serviceW,upperH-py,{zone:'servizi',door:{side:'left'},floor:'stone'}));}
    rooms.push(...pieces);

    if(s.garage){
      const gw=Math.max(10,Math.round(W*.30));
      ext.push(room('garage','GARAGE 2 POSTI','garage',W-gw,-Math.max(10,H*.38),gw,Math.max(10,H*.36),{floor:'concrete',windows:[{side:'top',n:1}],door:{side:'bottom'},exterior:true}));
    }
    if(s.bbq) ext.push(room('bbq','PATIO / BBQ COPERTO','patio',0,-Math.max(5,H*.20),Math.max(12,W*.44),Math.max(5,H*.18),{floor:'outdoor',exterior:true}));
    if(s.pool) ext.push(room('pool','PISCINA','pool',Math.max(2,W*.10),-Math.max(12,H*.48),Math.max(12,W*.44),Math.max(6,H*.22),{exterior:true}));
    if(s.balcony) ext.push(room('terrace','TERRAZZA','terrace',W*.48,H,Math.max(10,W*.42),Math.max(4,H*.13),{floor:'outdoor',exterior:true}));

    const all=mirror?mirrorRooms(rooms,W):rooms;
    return {name:'Piano terra',rooms:all,exterior:mirror?mirrorRooms(ext,W):ext,W,H,level:0,front:'bottom'};
  }

  function bedroomFloor(s,W,H,count,level,isTop=false){
    const rooms=[]; const ext=[]; const corridorY=Math.max(8,Math.round(H*.42)); const corridorH=3.2;
    const stairW=Math.max(5,Math.round(W*.17));
    rooms.push(room('corridor'+level,'DISIMPEGNO','corridor',0,corridorY,W,corridorH,{zone:'distribuzione',floor:'stone'}));
    rooms.push(room('stairs'+level,'SCALA','stairs',W/2-stairW/2,corridorY-3.5,stairW,7,{zone:'distribuzione',floor:'stone'}));

    const topH=corridorY; const botY=corridorY+corridorH; const botH=H-botY;
    const slots=[
      {x:0,y:0,w:W*.43,h:topH,side:'bottom',win:'top'},
      {x:W*.57,y:0,w:W*.43,h:topH,side:'bottom',win:'top'},
      {x:0,y:botY,w:W*.43,h:botH,side:'top',win:'bottom'},
      {x:W*.57,y:botY,w:W*.43,h:botH,side:'top',win:'bottom'}
    ];
    const names=[];
    for(let i=0;i<count;i++) names.push(isTop&&i===0?'CAMERA MASTER':`CAMERA ${i+1}`);
    names.forEach((nm,i)=>{
      const sl=slots[i%slots.length]; const master=nm==='CAMERA MASTER';
      const innerH=sl.h;
      const bedH=(s.ensuite||s.wardrobe)?Math.max(5,innerH*.66):innerH;
      rooms.push(room(`bed${level}_${i}`,nm,master?'master':'bedroom',sl.x,sl.y,sl.w,bedH,{zone:'notte',door:{side:sl.side},windows:[{side:sl.win,n:1}],floor:'wood'}));
      if(s.ensuite||s.wardrobe){
        const auxY=sl.y+(sl.y===0?bedH:0);
        const auxH=innerH-bedH;
        if(sl.y!==0){
          // bedrooms below corridor: auxiliary strip near corridor
          if(s.wardrobe) rooms.push(room(`ward${level}_${i}`,'CAB. ARMADIO','wardrobe',sl.x,sl.y,sl.w*(s.ensuite?.45:1),auxH,{zone:'notte',door:{side:'top'},floor:'wood'}));
          if(s.ensuite) rooms.push(room(`bath${level}_${i}`,'BAGNO','bath',sl.x+sl.w*(s.wardrobe?.45:0),sl.y,sl.w*(s.wardrobe?.55:1),auxH,{zone:'servizi',door:{side:'top'},windows:[{side:sl.x===0?'left':'right',n:1}],floor:'tile'}));
          // shift bed down
          rooms.find(q=>q.id===`bed${level}_${i}`).y=r(sl.y+auxH);
        } else {
          if(s.wardrobe) rooms.push(room(`ward${level}_${i}`,'CAB. ARMADIO','wardrobe',sl.x,auxY,sl.w*(s.ensuite?.45:1),auxH,{zone:'notte',door:{side:'bottom'},floor:'wood'}));
          if(s.ensuite) rooms.push(room(`bath${level}_${i}`,'BAGNO','bath',sl.x+sl.w*(s.wardrobe?.45:0),auxY,sl.w*(s.wardrobe?.55:1),auxH,{zone:'servizi',door:{side:'bottom'},windows:[{side:sl.x===0?'left':'right',n:1}],floor:'tile'}));
        }
      }
    });
    if(s.balcony){
      ext.push(room('balc'+level,'BALCONE',W*.18,-4.6,W*.64,4.6,{floor:'outdoor',exterior:true}));
      if(level===1) ext.push(room('balcSide'+level,'BALCONE',W,botY+1,4.2,Math.max(6,botH*.65),{floor:'outdoor',exterior:true}));
    }
    const mirror=(s.variant+level)%2===1;
    return {name:isTop?'Piano master':`Piano ${level+1}`,rooms:mirror?mirrorRooms(rooms,W):rooms,exterior:mirror?mirrorRooms(ext,W):ext,W,H,level,front:'bottom'};
  }

  function singleFloor(s,W,H){
    const rooms=[]; const ext=[];
    const dayH=Math.max(8,Math.round(H*.38));
    const hallY=H-dayH-3.2;
    rooms.push(room('living','SOGGIORNO','living',0,H-dayH,W*.44,dayH,{zone:'giorno',windows:[{side:'bottom',n:2},{side:'left',n:1}],floor:'wood'}));
    rooms.push(room('dining','PRANZO','dining',W*.44,H-dayH,W*.20,dayH,{zone:'giorno',windows:[{side:'bottom',n:1}],floor:'wood'}));
    rooms.push(room('kitchen',s.openSpace?'CUCINA + ISOLA':'CUCINA','kitchen',W*.64,H-dayH,W*.36,dayH,{zone:'giorno',windows:[{side:'bottom',n:1},{side:'right',n:1}],floor:'tile'}));
    rooms.push(room('corridor','DISIMPEGNO','corridor',0,hallY,W,3.2,{zone:'distribuzione',floor:'stone'}));
    const n=s.bedrooms; const bw=W/Math.min(n,4); const topH=hallY;
    for(let i=0;i<Math.min(n,4);i++){
      const x=i*bw; const master=i===0;
      const auxH=(s.ensuite||s.wardrobe)?Math.max(3.5,topH*.30):0;
      rooms.push(room('bed'+i,master?'CAMERA MASTER':`CAMERA ${i+1}`,master?'master':'bedroom',x,0,bw,topH-auxH,{zone:'notte',door:{side:'bottom'},windows:[{side:'top',n:1}],floor:'wood'}));
      if(auxH){
        if(s.wardrobe) rooms.push(room('ward'+i,'CAB. ARMADIO','wardrobe',x,topH-auxH,bw*(s.ensuite?.45:1),auxH,{zone:'notte',door:{side:'bottom'},floor:'wood'}));
        if(s.ensuite) rooms.push(room('bath'+i,'BAGNO','bath',x+bw*(s.wardrobe?.45:0),topH-auxH,bw*(s.wardrobe?.55:1),auxH,{zone:'servizi',door:{side:'bottom'},windows:[{side:i===0?'left':i===Math.min(n,4)-1?'right':'top',n:1}],floor:'tile'}));
      }
    }
    if(n>4){
      // graceful compromise, keeps the floor buildable rather than hiding impossible rooms
      rooms.push(room('flex','CAMERE AGGIUNTIVE / STUDIO','study',W*.35,hallY-5,W*.30,5,{zone:'notte',floor:'wood'}));
    }
    rooms.push(room('entry','INGRESSO','foyer',W*.42,H-dayH,W*.16,dayH*.36,{zone:'distribuzione',door:{side:'bottom',entry:true},floor:'stone',overlay:true}));
    if(s.pool) ext.push(room('pool','PISCINA','pool',W*.08,-8,W*.40,6,{exterior:true}));
    if(s.bbq) ext.push(room('bbq','PATIO / BBQ','patio',W*.52,-6,W*.38,5,{floor:'outdoor',exterior:true}));
    if(s.balcony) ext.push(room('terrace','TERRAZZA',W*.2,H,W*.6,4,{floor:'outdoor',exterior:true}));
    return {name:'Piano unico',rooms,exterior:ext,W,H,level:0,front:'bottom'};
  }

  function generate(s){
    const {w:W,h:H}=logicalSize(s); const floors=[];
    if(s.floors===1){floors.push(singleFloor(s,W,H));}
    else {
      floors.push(groundFloor(s,W,H));
      const upperCount=s.floors-1;
      let left=s.bedrooms;
      for(let lvl=1;lvl<=upperCount;lvl++){
        let count;
        const isTop=lvl===upperCount;
        if(upperCount===1){count=Math.min(4,left);}
        else if(isTop){count=Math.min(1,left);}
        else {count=Math.min(4,left-(upperCount-lvl>0?1:0));}
        count=Math.max(1,count); left-=count;
        floors.push(bedroomFloor(s,W,H,count,lvl,isTop));
      }
      if(left>0){floors[floors.length-1].notes=`${left} camera/e non rappresentate per limite del template: aumentare piani o lotto.`;}
    }
    const usable=floors.reduce((a,f)=>a+f.rooms.filter(x=>!x.overlay).reduce((s,q)=>s+q.w*q.h,0),0);
    const corridor=floors.reduce((a,f)=>a+f.rooms.filter(x=>['corridor','foyer','stairs'].includes(x.type)).reduce((s,q)=>s+q.w*q.h,0),0);
    const areaRatio=usable?corridor/usable:0;
    const audit={
      distribution:clamp(Math.round(96-areaRatio*45),72,98),
      architecture:clamp(90+(s.study?2:0)+(s.laundry?2:0)+(s.pantry?1:0)-(s.bedrooms>6?4:0),80,98),
      graphics:s.renderStyle==='Tecnica'?92:s.renderStyle==='Immobiliare'?96:98,
      sims:clamp(98-(s.shape==='split'?4:0)-(s.floors>3?2:0),88,99)
    };
    return {settings:s,floors,meta:{W,H,usable:Math.round(usable),corridorRatio:Math.round(areaRatio*100)},audit,created:new Date().toISOString()};
  }

  global.TS4Engine={collectSettings,generate};
})(window);
