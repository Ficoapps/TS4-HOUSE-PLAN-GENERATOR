(function(){
  const $=s=>document.querySelector(s); let project=null; let activeFloor=0;
  const ns='http://www.w3.org/2000/svg';
  const svgEl=(tag,attrs={},text='')=>{const e=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(text)e.textContent=text;return e;};
  const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e;};
  const floorColors={wood:'#d7b98c',tile:'#e8e3d8',stone:'#dedbd2',outdoor:'#d4d2ca',concrete:'#c8c8c8'};

  function patterns(svg){
    const defs=svgEl('defs');
    const p1=svgEl('pattern',{id:'wood',width:'34',height:'16',patternUnits:'userSpaceOnUse',patternTransform:'rotate(0)'});
    p1.append(svgEl('rect',{width:34,height:16,fill:'#d9ba8d'}),svgEl('path',{d:'M0 0H34M0 8H34M17 0V8M8 8V16M26 8V16',stroke:'#b99769','stroke-width':'0.8',opacity:'.55'}));
    const p2=svgEl('pattern',{id:'tile',width:'28',height:'28',patternUnits:'userSpaceOnUse'});p2.append(svgEl('rect',{width:28,height:28,fill:'#ece8df'}),svgEl('path',{d:'M0 0H28V28H0Z',fill:'none',stroke:'#cbc5bb','stroke-width':'1'}));
    const p3=svgEl('pattern',{id:'stone',width:'36',height:'24',patternUnits:'userSpaceOnUse'});p3.append(svgEl('rect',{width:36,height:24,fill:'#dfddd6'}),svgEl('path',{d:'M0 12H36M18 0V12M9 12V24M27 12V24',stroke:'#c6c2b8','stroke-width':'1'}));
    const p4=svgEl('pattern',{id:'outdoor',width:'24',height:'24',patternUnits:'userSpaceOnUse'});p4.append(svgEl('rect',{width:24,height:24,fill:'#d3d1c9'}),svgEl('path',{d:'M0 0L24 24M24 0L0 24',stroke:'#bbb8ae','stroke-width':'.6',opacity:'.55'}));
    defs.append(p1,p2,p3,p4);svg.append(defs);
  }

  function drawRoom(g,q,S,ox,oy,mode){
    const x=ox+q.x*S,y=oy+q.y*S,w=q.w*S,h=q.h*S;
    const fill=mode==='Tecnica'?'#fafafa':`url(#${q.floor||'wood'})`;
    if(q.type==='corridor'||q.type==='foyer'){
      g.append(svgEl('rect',{x,y,width:w,height:h,fill:mode==='Tecnica'?'#f3f3f3':fill,stroke:'#181818','stroke-width':Math.max(4,S*.16)}));
    } else if(q.type==='pool'){
      g.append(svgEl('rect',{x,y,width:w,height:h,rx:S*.3,fill:'#a9d7e4',stroke:'#5b8c9b','stroke-width':Math.max(2,S*.10)}));
      for(let i=1;i<5;i++) g.append(svgEl('path',{d:`M${x+5} ${y+h*i/5} Q${x+w/2} ${y+h*i/5-4} ${x+w-5} ${y+h*i/5}`,fill:'none',stroke:'#dff4f8','stroke-width':'1.5',opacity:'.8'}));
      label(g,q,x,y,w,h,S,mode);return;
    } else {
      g.append(svgEl('rect',{x,y,width:w,height:h,fill,stroke:'#111','stroke-width':Math.max(5,S*.18),'stroke-linejoin':'miter'}));
    }
    furniture(g,q,x,y,w,h,S,mode); label(g,q,x,y,w,h,S,mode);
  }

  function label(g,q,x,y,w,h,S,mode){
    if(q.overlay)return;
    const fs=Math.max(9,Math.min(14,S*.45));
    const t=svgEl('text',{x:x+w/2,y:y+h*.54,'text-anchor':'middle','font-size':fs,'font-family':'Arial, sans-serif','font-weight':mode==='Tecnica'?'700':'600',fill:'#272727','pointer-events':'none'},q.name);
    g.append(t);
    if(['bedroom','master','living','kitchen','dining','study','bath'].includes(q.type) && h>5*S){
      const sub=svgEl('text',{x:x+w/2,y:y+h*.54+fs+3,'text-anchor':'middle','font-size':Math.max(7,fs*.67),fill:'#5f5f5f'},`${q.w.toFixed(1)} × ${q.h.toFixed(1)} caselle`);g.append(sub);
    }
  }
  function windows(g,q,x,y,w,h,S){
    (q.windows||[]).forEach(spec=>{const n=spec.n||1;for(let i=0;i<n;i++){
      const frac=(i+1)/(n+1); const len=Math.max(S*1.8,Math.min(S*3.2,(spec.side==='top'||spec.side==='bottom'?w:h)*.28));
      if(spec.side==='top'||spec.side==='bottom'){
        const xx=x+w*frac-len/2, yy=spec.side==='top'?y:y+h;
        g.append(svgEl('line',{x1:xx,y1:yy,x2:xx+len,y2:yy,stroke:'#fff','stroke-width':Math.max(5,S*.18)}),svgEl('line',{x1:xx,y1:yy,x2:xx+len,y2:yy,stroke:'#7a98a5','stroke-width':Math.max(1.5,S*.055)}));
      } else {
        const yy=y+h*frac-len/2, xx=spec.side==='left'?x:x+w;
        g.append(svgEl('line',{x1:xx,y1:yy,x2:xx,y2:yy+len,stroke:'#fff','stroke-width':Math.max(5,S*.18)}),svgEl('line',{x1:xx,y1:yy,x2:xx,y2:yy+len,stroke:'#7a98a5','stroke-width':Math.max(1.5,S*.055)}));
      }
    }});
  }
  function door(g,q,x,y,w,h,S){if(!q.door)return;const d=q.door;const ds=Math.max(S*1.2,16);const st='#8c704f';
    let path='',leaf='';
    if(d.side==='bottom'){const cx=x+w*.5;g.append(svgEl('line',{x1:cx-ds/2,y1:y+h,x2:cx+ds/2,y2:y+h,stroke:'#fff','stroke-width':Math.max(6,S*.22)}));leaf=`M${cx-ds/2} ${y+h} L${cx-ds/2} ${y+h-ds}`;path=`M${cx-ds/2} ${y+h-ds} A${ds} ${ds} 0 0 1 ${cx+ds/2} ${y+h}`;}
    if(d.side==='top'){const cx=x+w*.5;g.append(svgEl('line',{x1:cx-ds/2,y1:y,x2:cx+ds/2,y2:y,stroke:'#fff','stroke-width':Math.max(6,S*.22)}));leaf=`M${cx-ds/2} ${y} L${cx-ds/2} ${y+ds}`;path=`M${cx-ds/2} ${y+ds} A${ds} ${ds} 0 0 0 ${cx+ds/2} ${y}`;}
    if(d.side==='left'){const cy=y+h*.5;g.append(svgEl('line',{x1:x,y1:cy-ds/2,x2:x,y2:cy+ds/2,stroke:'#fff','stroke-width':Math.max(6,S*.22)}));leaf=`M${x} ${cy-ds/2} L${x+ds} ${cy-ds/2}`;path=`M${x+ds} ${cy-ds/2} A${ds} ${ds} 0 0 1 ${x} ${cy+ds/2}`;}
    if(d.side==='right'){const cy=y+h*.5;g.append(svgEl('line',{x1:x+w,y1:cy-ds/2,x2:x+w,y2:cy+ds/2,stroke:'#fff','stroke-width':Math.max(6,S*.22)}));leaf=`M${x+w} ${cy-ds/2} L${x+w-ds} ${cy-ds/2}`;path=`M${x+w-ds} ${cy-ds/2} A${ds} ${ds} 0 0 0 ${x+w} ${cy+ds/2}`;}
    if(leaf){g.append(svgEl('path',{d:leaf,stroke:st,'stroke-width':'1.5',fill:'none'}),svgEl('path',{d:path,stroke:st,'stroke-width':'1',fill:'none','stroke-dasharray':'2 2'}));}
  }

  function openingRoom(f,id){return [...f.rooms,...f.exterior].find(q=>q.id===id);}
  function openingGeom(q,op,S){
    const x=q.x*S,y=q.y*S,w=q.w*S,h=q.h*S;
    const side=op.side,pos=Math.max(.08,Math.min(.92,op.pos==null?0.5:op.pos)),len=Math.max(S*(op.width||1.2),12);
    if(side==='top'||side==='bottom'){
      const cx=x+w*pos,yy=side==='top'?y:y+h;
      return {side:side,cx:cx,cy:yy,x1:cx-len/2,y1:yy,x2:cx+len/2,y2:yy,len:len};
    }
    const cy=y+h*pos,xx=side==='left'?x:x+w;
    return {side:side,cx:xx,cy:cy,x1:xx,y1:cy-len/2,x2:xx,y2:cy+len/2,len:len};
  }
  function drawWindowOpening(g,q,op,S){
    const z=openingGeom(q,op,S),cut=Math.max(7,S*.27),glass='#567f91',thin=Math.max(1.2,S*.045);
    g.append(svgEl('line',{x1:z.x1,y1:z.y1,x2:z.x2,y2:z.y2,stroke:'#fff','stroke-width':cut,'stroke-linecap':'butt'}));
    if(z.side==='top'||z.side==='bottom'){
      g.append(svgEl('line',{x1:z.x1,y1:z.y1-2.2,x2:z.x2,y2:z.y2-2.2,stroke:glass,'stroke-width':thin}),
               svgEl('line',{x1:z.x1,y1:z.y1+2.2,x2:z.x2,y2:z.y2+2.2,stroke:glass,'stroke-width':thin}));
      if(op.kind==='privacy') for(let i=1;i<4;i++){const xx=z.x1+(z.x2-z.x1)*i/4;g.append(svgEl('line',{x1:xx,y1:z.y1-4,x2:xx,y2:z.y1+4,stroke:glass,'stroke-width':'.8',opacity:'.75'}));}
    } else {
      g.append(svgEl('line',{x1:z.x1-2.2,y1:z.y1,x2:z.x2-2.2,y2:z.y2,stroke:glass,'stroke-width':thin}),
               svgEl('line',{x1:z.x1+2.2,y1:z.y1,x2:z.x2+2.2,y2:z.y2,stroke:glass,'stroke-width':thin}));
      if(op.kind==='privacy') for(let i=1;i<4;i++){const yy=z.y1+(z.y2-z.y1)*i/4;g.append(svgEl('line',{x1:z.x1-4,y1:yy,x2:z.x1+4,y2:yy,stroke:glass,'stroke-width':'.8',opacity:'.75'}));}
    }
  }
  function drawDoorOpening(g,q,op,S){
    const z=openingGeom(q,op,S),cut=Math.max(8,S*.30),st=op.kind==='entry'?'#6f4c2f':'#80684f',thin=Math.max(1.2,S*.05);
    g.append(svgEl('line',{x1:z.x1,y1:z.y1,x2:z.x2,y2:z.y2,stroke:'#fff','stroke-width':cut,'stroke-linecap':'butt'}));
    if(op.kind==='opening') return;
    if(op.kind==='garage'){
      g.append(svgEl('line',{x1:z.x1,y1:z.y1,x2:z.x2,y2:z.y2,stroke:st,'stroke-width':Math.max(3,S*.10)}));
      const n=5;
      for(let i=1;i<n;i++){
        const t=i/n;
        if(z.side==='top'||z.side==='bottom'){const xx=z.x1+(z.x2-z.x1)*t;g.append(svgEl('line',{x1:xx,y1:z.y1-4,x2:xx,y2:z.y1+4,stroke:'#b49d87','stroke-width':'1'}));}
        else {const yy=z.y1+(z.y2-z.y1)*t;g.append(svgEl('line',{x1:z.x1-4,y1:yy,x2:z.x1+4,y2:yy,stroke:'#b49d87','stroke-width':'1'}));}
      }
      return;
    }
    if(op.kind==='sliding'){
      if(z.side==='top'||z.side==='bottom'){
        const yy=z.y1;g.append(svgEl('line',{x1:z.x1,y1:yy-2.5,x2:z.cx+3,y2:yy-2.5,stroke:st,'stroke-width':thin}),
        svgEl('line',{x1:z.cx-3,y1:yy+2.5,x2:z.x2,y2:yy+2.5,stroke:st,'stroke-width':thin}));
      } else {
        const xx=z.x1;g.append(svgEl('line',{x1:xx-2.5,y1:z.y1,x2:xx-2.5,y2:z.cy+3,stroke:st,'stroke-width':thin}),
        svgEl('line',{x1:xx+2.5,y1:z.cy-3,x2:xx+2.5,y2:z.y2,stroke:st,'stroke-width':thin}));
      }
      return;
    }
    const half=op.kind==='double'?z.len/2:z.len;
    const drawLeaf=(hingeX,hingeY,endX,endY,arc)=>{
      g.append(svgEl('line',{x1:hingeX,y1:hingeY,x2:endX,y2:endY,stroke:st,'stroke-width':thin}));
      g.append(svgEl('path',{d:arc,fill:'none',stroke:st,'stroke-width':Math.max(.8,S*.032),opacity:'.8'}));
    };
    if(z.side==='bottom'){
      if(op.kind==='double'){
        drawLeaf(z.x1,z.cy,z.x1,z.cy-half,'M'+z.x1+' '+(z.cy-half)+' A'+half+' '+half+' 0 0 1 '+z.cx+' '+z.cy);
        drawLeaf(z.x2,z.cy,z.x2,z.cy-half,'M'+z.x2+' '+(z.cy-half)+' A'+half+' '+half+' 0 0 0 '+z.cx+' '+z.cy);
      } else drawLeaf(z.x1,z.cy,z.x1,z.cy-z.len,'M'+z.x1+' '+(z.cy-z.len)+' A'+z.len+' '+z.len+' 0 0 1 '+z.x2+' '+z.cy);
    } else if(z.side==='top'){
      if(op.kind==='double'){
        drawLeaf(z.x1,z.cy,z.x1,z.cy+half,'M'+z.x1+' '+(z.cy+half)+' A'+half+' '+half+' 0 0 0 '+z.cx+' '+z.cy);
        drawLeaf(z.x2,z.cy,z.x2,z.cy+half,'M'+z.x2+' '+(z.cy+half)+' A'+half+' '+half+' 0 0 1 '+z.cx+' '+z.cy);
      } else drawLeaf(z.x1,z.cy,z.x1,z.cy+z.len,'M'+z.x1+' '+(z.cy+z.len)+' A'+z.len+' '+z.len+' 0 0 0 '+z.x2+' '+z.cy);
    } else if(z.side==='right'){
      if(op.kind==='double'){
        drawLeaf(z.cx,z.y1,z.cx-half,z.y1,'M'+(z.cx-half)+' '+z.y1+' A'+half+' '+half+' 0 0 0 '+z.cx+' '+z.cy);
        drawLeaf(z.cx,z.y2,z.cx-half,z.y2,'M'+(z.cx-half)+' '+z.y2+' A'+half+' '+half+' 0 0 1 '+z.cx+' '+z.cy);
      } else drawLeaf(z.cx,z.y1,z.cx-z.len,z.y1,'M'+(z.cx-z.len)+' '+z.y1+' A'+z.len+' '+z.len+' 0 0 0 '+z.cx+' '+z.y2);
    } else {
      if(op.kind==='double'){
        drawLeaf(z.cx,z.y1,z.cx+half,z.y1,'M'+(z.cx+half)+' '+z.y1+' A'+half+' '+half+' 0 0 1 '+z.cx+' '+z.cy);
        drawLeaf(z.cx,z.y2,z.cx+half,z.y2,'M'+(z.cx+half)+' '+z.y2+' A'+half+' '+half+' 0 0 0 '+z.cx+' '+z.cy);
      } else drawLeaf(z.cx,z.y1,z.cx+z.len,z.y1,'M'+(z.cx+z.len)+' '+z.y1+' A'+z.len+' '+z.len+' 0 0 1 '+z.cx+' '+z.y2);
    }
  }
  function drawOpenings(g,f,S){
    const o=f.openings||{doors:[],windows:[]};
    for(const w of o.windows){const q=openingRoom(f,w.roomId);if(q)drawWindowOpening(g,q,w,S);}
    for(const d of o.doors){const q=openingRoom(f,d.roomId);if(q)drawDoorOpening(g,q,d,S);}
  }

  function furniture(g,q,x,y,w,h,S,mode){const ink=mode==='Tecnica'?'#777':'#8b7d70';const fill=mode==='Tecnica'?'#fff':'#f5f0e8';const sw=1.2;
    const rect=(rx,ry,rw,rh,extra={})=>g.append(svgEl('rect',{x:rx,y:ry,width:rw,height:rh,fill,stroke:ink,'stroke-width':sw,...extra}));
    const line=(x1,y1,x2,y2)=>g.append(svgEl('line',{x1,y1,x2,y2,stroke:ink,'stroke-width':sw}));
    const ellipse=(cx,cy,rx,ry)=>g.append(svgEl('ellipse',{cx,cy,rx,ry,fill,stroke:ink,'stroke-width':sw}));
    if(q.type==='living'){
      rect(x+w*.12,y+h*.56,w*.38,h*.22,{rx:4});line(x+w*.31,y+h*.56,x+w*.31,y+h*.78);rect(x+w*.52,y+h*.58,w*.16,h*.12,{rx:3});rect(x+w*.08,y+h*.16,w*.07,h*.38);ellipse(x+w*.70,y+h*.32,w*.09,h*.09);
    }
    if(q.type==='dining'){
      rect(x+w*.21,y+h*.30,w*.58,h*.34,{rx:3});for(let i=0;i<3;i++){rect(x+w*(.23+i*.20),y+h*.18,w*.14,h*.08,{rx:2});rect(x+w*(.23+i*.20),y+h*.66,w*.14,h*.08,{rx:2});}
    }
    if(q.type==='kitchen'){
      rect(x+w*.05,y+h*.08,w*.18,h*.78);rect(x+w*.23,y+h*.08,w*.62,h*.14);if(w>7*S)rect(x+w*.38,y+h*.46,w*.40,h*.18,{rx:3});
      ellipse(x+w*.45,y+h*.55,w*.025,h*.04);ellipse(x+w*.57,y+h*.55,w*.025,h*.04);ellipse(x+w*.69,y+h*.55,w*.025,h*.04);
    }
    if(q.type==='bedroom'||q.type==='master'){
      const bw=w*.46,bh=h*.48;rect(x+w*.12,y+h*.12,bw,bh,{rx:3});rect(x+w*.13,y+h*.13,bw*.47,bh*.22);rect(x+w*.13+bw*.50,y+h*.13,bw*.47,bh*.22);rect(x+w*.07,y+h*.18,w*.05,h*.15);rect(x+w*.58,y+h*.18,w*.05,h*.15); if(w>8*S)rect(x+w*.68,y+h*.18,w*.22,h*.12);
    }
    if(q.type==='study'){
      rect(x+w*.18,y+h*.25,w*.54,h*.22,{rx:2});ellipse(x+w*.45,y+h*.58,w*.09,h*.11);rect(x+w*.08,y+h*.10,w*.07,h*.70);
    }
    if(q.type==='bath'){
      rect(x+w*.08,y+h*.12,w*.40,h*.32,{rx:8});ellipse(x+w*.73,y+h*.28,w*.09,h*.11);ellipse(x+w*.73,y+h*.66,w*.10,h*.09);rect(x+w*.08,y+h*.60,w*.30,h*.18,{rx:2});
    }
    if(q.type==='wardrobe'){for(let i=0;i<6;i++)line(x+w*.10+i*w*.13,y+h*.18,x+w*.10+i*w*.13,y+h*.82);line(x+w*.08,y+h*.18,x+w*.86,y+h*.18);line(x+w*.08,y+h*.82,x+w*.86,y+h*.82);}
    if(q.type==='laundry'){rect(x+w*.12,y+h*.20,w*.30,h*.50,{rx:4});ellipse(x+w*.27,y+h*.45,w*.10,h*.16);rect(x+w*.56,y+h*.20,w*.30,h*.50,{rx:4});ellipse(x+w*.71,y+h*.45,w*.10,h*.16);}
    if(q.type==='pantry'||q.type==='storage'){for(let i=0;i<4;i++)rect(x+w*.12,y+h*(.16+i*.18),w*.76,h*.08);}
    if(q.type==='stairs'){
      const n=9;for(let i=0;i<=n;i++) line(x+w*.12,y+h*(.12+i*.76/n),x+w*.88,y+h*(.12+i*.76/n));g.append(svgEl('path',{d:`M${x+w*.5} ${y+h*.80} L${x+w*.5} ${y+h*.23} l${-S*.22} ${S*.35} M${x+w*.5} ${y+h*.23} l${S*.22} ${S*.35}`,stroke:ink,'stroke-width':'2',fill:'none'}));
    }
    if(q.type==='garage'){rect(x+w*.08,y+h*.18,w*.36,h*.66,{rx:10});rect(x+w*.56,y+h*.18,w*.36,h*.66,{rx:10});}
    if(q.type==='patio'){rect(x+w*.25,y+h*.26,w*.50,h*.34,{rx:4});for(let i=0;i<4;i++)ellipse(x+w*(.25+i*.16),y+h*.75,w*.035,h*.08);}
  }

  function drawFloor(f){
    const svg=$('#plan');svg.innerHTML='';patterns(svg);
    const mode=project.settings.renderStyle;
    const margin=58, logicalW=f.W+10, logicalH=f.H+16;const S=Math.min(26,900/logicalW,610/logicalH);const ox=margin+5*S,oy=margin+8*S;
    const minX=Math.min(0,...f.exterior.map(q=>q.x));const minY=Math.min(0,...f.exterior.map(q=>q.y));const maxX=Math.max(f.W,...f.exterior.map(q=>q.x+q.w));const maxY=Math.max(f.H,...f.exterior.map(q=>q.y+q.h));
    const vbW=(maxX-minX)*S+margin*2+30, vbH=(maxY-minY)*S+margin*2+30;svg.setAttribute('viewBox',`${minX*S-margin} ${minY*S-margin} ${vbW} ${vbH}`);
    const g=svgEl('g');svg.append(g);
    if(project.settings.garden && mode==='Luxury'){
      g.append(svgEl('rect',{x:(minX-2)*S,y:(minY-2)*S,width:(maxX-minX+4)*S,height:(maxY-minY+4)*S,fill:'#e9efe1',stroke:'none'}));
      for(let i=0;i<18;i++){const cx=(minX+1+(i*7)%Math.max(3,maxX-minX-2))*S,cy=(minY+1+(i*11)%Math.max(3,maxY-minY-2))*S;g.append(svgEl('circle',{cx,cy,r:Math.max(5,S*.25),fill:i%2?'#9eb78c':'#78976d',opacity:'.7'}));}
    }
    f.exterior.forEach(q=>drawRoom(g,q,S,0,0,mode));
    f.rooms.filter(q=>!q.overlay).forEach(q=>drawRoom(g,q,S,0,0,mode));
    f.rooms.filter(q=>q.overlay).forEach(q=>{const x=q.x*S,y=q.y*S,w=q.w*S,h=q.h*S;g.append(svgEl('rect',{x,y,width:w,height:h,fill:'none',stroke:'#6a6258','stroke-width':'1','stroke-dasharray':'4 3'}));});
    drawOpenings(g,f,S);
    // north/front indicator and graphic scale
    g.append(svgEl('text',{x:0,y:-18,'font-size':'10',fill:'#666'},`FRONTE PRINCIPALE ↓   |   ${f.name}`));
    g.append(svgEl('line',{x1:0,y1:f.H*S+28,x2:6*S,y2:f.H*S+28,stroke:'#222','stroke-width':'3'}));g.append(svgEl('text',{x:3*S,y:f.H*S+42,'text-anchor':'middle','font-size':'9',fill:'#555'},'6 caselle TS4'));
  }

  function renderSummary(){const s=$('#summary');s.innerHTML='';const a=project.audit,m=project.meta,st=project.settings;[
    ['Lotto',`${st.lot.w} × ${st.lot.h}`],['Piani',project.floors.length],['Superficie logica',`${m.usable} caselle²`],['Aperture',m.openingCount||0],['Distribuzione',`${a.distribution}/100`],['Compatibilità TS4',`${a.sims}/100`]
  ].forEach(([k,v])=>{const c=el('div','stat');c.innerHTML=`<b>${v}</b><span>${k}</span>`;s.append(c);});
  }
  function renderTabs(){const t=$('#floorTabs');t.innerHTML='';project.floors.forEach((f,i)=>{const b=el('button',i===activeFloor?'active':'',f.name);b.onclick=()=>{activeFloor=i;renderTabs();drawFloor(project.floors[i]);};t.append(b);});}
  function renderLegend(){const l=$('#legend');l.innerHTML='';[['#d9ba8d','Zona abitabile / legno'],['#ece8df','Bagni / cucina'],['#dfddd6','Distribuzione'],['#d3d1c9','Esterni'],['#a9d7e4','Acqua'],['#567f91','Finestre'],['#80684f','Porte / scorrevoli']].forEach(([c,n])=>{const s=el('span');s.innerHTML=`<i style="background:${c}"></i>${n}`;l.append(s);});}
  function renderAudit(){const g=$('#guidelines');const a=project.audit;g.innerHTML='<h3>Controllo del progetto</h3>';const grid=el('div','audit');[['Qualità distributiva',a.distribution],['Architettura residenziale',a.architecture],['Qualità grafica',a.graphics],['Compatibilità The Sims 4',a.sims]].forEach(([k,v])=>{const d=el('div','item');d.innerHTML=`<strong>${v}/100</strong><small>${k}</small>`;grid.append(d);});g.append(grid);if(project.floors[activeFloor]?.notes){const p=el('p','note',project.floors[activeFloor].notes);g.append(p);}}
  function generate(){project=TS4Engine.generate(TS4Engine.collectSettings());activeFloor=0;renderSummary();renderTabs();renderLegend();renderAudit();drawFloor(project.floors[0]);$('#sheetTitle').textContent=project.settings.projectName;$('#sheetSub').textContent=`${project.settings.style} · ${project.settings.renderStyle} · progettazione su griglia The Sims 4`;}
  function download(name,blob){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);}
  function exportJSON(){download(`${project.settings.projectName.replace(/\W+/g,'_')}.json`,new Blob([JSON.stringify(project,null,2)],{type:'application/json'}));}
  function exportSVG(){const svg=$('#plan').cloneNode(true);svg.setAttribute('xmlns',ns);download(`${project.settings.projectName.replace(/\W+/g,'_')}_P${activeFloor+1}.svg`,new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml'}));}
  function exportPNG(){const raw=new XMLSerializer().serializeToString($('#plan'));const blob=new Blob([raw],{type:'image/svg+xml'});const url=URL.createObjectURL(blob),img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=2200;c.height=Math.round(2200*img.height/img.width);const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);c.toBlob(b=>download(`${project.settings.projectName.replace(/\W+/g,'_')}_P${activeFloor+1}.png`,b),'image/png');URL.revokeObjectURL(url);};img.src=url;}
  function save(){localStorage.setItem('ts4-house-generator-v04',JSON.stringify(project));alert('Progetto salvato nel browser.');}
  function load(){const raw=localStorage.getItem('ts4-house-generator-v04');if(!raw)return alert('Nessun progetto salvato.');project=JSON.parse(raw);activeFloor=0;renderSummary();renderTabs();renderLegend();renderAudit();drawFloor(project.floors[0]);$('#sheetTitle').textContent=project.settings.projectName;$('#sheetSub').textContent=`${project.settings.style} · ${project.settings.renderStyle}`;}

  $('#generateBtn').onclick=generate;$('#variantBtn').onclick=()=>{document.body.dataset.variant=(+(document.body.dataset.variant||0)+1)%6;generate();};$('#exportJsonBtn').onclick=()=>{if(!project)generate();exportJSON();};$('#exportPngBtn').onclick=()=>{if(!project)generate();exportPNG();};$('#exportSvgBtn').onclick=()=>{if(!project)generate();exportSVG();};$('#saveBtn').onclick=()=>{if(!project)generate();save();};$('#loadBtn').onclick=load;
  generate();
})();
