import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { AlertTriangle, ArrowRight, Cable, Check, CircuitBoard, Copy, Expand, Eye, Fullscreen, Maximize2, Minus, Move, Plus, ShieldAlert, SlidersHorizontal, Unplug, Zap } from 'lucide-react';
import {
  FLAT_BOUNDS, FLAT_PINS, FLAT_ROUTES, FLAT_SIZE, HEADER_PINS, PARTS, SAFETY_WARNINGS, WIRES,
  type ComponentId, type FlatPoint, type WireSpec,
} from '../data/circuitData';

type Filter='tft'|'source'|'audio'|'button'|'all';
type Meter='battery'|'boost'|'three';
type ViewBox={x:number;y:number;width:number;height:number};
type Pos={x:number;y:number};
function clientToBoard(el:SVGSVGElement,x:number,y:number):Pos{
 const matrix=el.getScreenCTM();
 if(matrix){const q=new DOMPoint(x,y).matrixTransform(matrix.inverse());return{x:q.x,y:q.y};}
 const r=el.getBoundingClientRect();return{x:(x-r.left)/r.width*FLAT_SIZE.width,y:(y-r.top)/r.height*FLAT_SIZE.height};
}
const FIT:ViewBox={x:0,y:0,width:FLAT_SIZE.width,height:FLAT_SIZE.height};
const BUTTONS:{id:Filter;title:string;sub:string;color:string}[]=[
  {id:'tft',title:'TFT / SPI',sub:'8 chân',color:'#38bdf8'},
  {id:'source',title:'Nguồn',sub:'5V / 3V3',color:'#fb923c'},
  {id:'audio',title:'Âm thanh I2S',sub:'Micro + loa',color:'#c084fc'},
  {id:'button',title:'Nút bấm',sub:'GPIO38',color:'#84cc16'},
  {id:'all',title:'Tất cả',sub:'30 dây',color:'#d2e5f8'},
];
const METER_CHOICES:{id:Meter;title:string;red:{component:ComponentId;pin:string};black:{component:ComponentId;pin:string}}[]=[
 {id:'battery',title:'Đo pin Li-Po',red:{component:'battery',pin:'+'},black:{component:'battery',pin:'-'}},
 {id:'boost',title:'Đo Boost 5V',red:{component:'boost',pin:'OUT+'},black:{component:'boost',pin:'OUT-'}},
 {id:'three',title:'Đo nguồn 3,3V',red:{component:'esp32',pin:'3V3'},black:{component:'esp32',pin:'GND'}},
];
const stageColors={bg:'#111317',ink:'#f1f5f9',sub:'#a7b4c5',gold:'#eacb83'};
const darkGnd='#90a3b8';
function colorFor(w:WireSpec){return w.color==='#475569'||w.color==='#64748b'?darkGnd:w.color;}
function clamp(n:number,a:number,b:number){return Math.min(b,Math.max(a,n));}
function pinKey(id:ComponentId,pin:string){return `${id}:${pin}`;}
function filterWire(w:WireSpec,group:Filter){
 if(group==='all')return true;
 if(group==='source')return w.group==='nguon';
 if(group==='tft')return w.group==='man-hinh'||['P10','P11','P15'].includes(w.id);
 if(group==='audio')return w.group==='micro'||w.group==='am-thanh'||['P07','P09','P12','P13','P14'].includes(w.id);
 return w.group==='nut-bam'||w.id==='B02';
}
function isSameTerminal(a:{component:ComponentId;pin:string},b:{component:ComponentId;pin:string}){
 return a.component===b.component&&a.pin===b.pin;
}
function roundedOrthogonal(points:readonly FlatPoint[],radius=9){
 if(points.length===0)return '';
 if(points.length===1)return `M${points[0][0]},${points[0][1]}`;
 let d=`M${points[0][0]},${points[0][1]}`;
 for(let i=1;i<points.length-1;i++){
  const p=points[i],before=points[i-1],next=points[i+1];
  const dx1=p[0]-before[0],dy1=p[1]-before[1],dx2=next[0]-p[0],dy2=next[1]-p[1];
  const len1=Math.abs(dx1)+Math.abs(dy1),len2=Math.abs(dx2)+Math.abs(dy2);
  if(!len1||!len2||((dx1&&dx2)||(dy1&&dy2))){d+=` L${p[0]},${p[1]}`;continue;}
  const r=Math.min(radius,len1/2,len2/2);
  const a:[number,number]=[p[0]-Math.sign(dx1)*r,p[1]-Math.sign(dy1)*r];
  const b:[number,number]=[p[0]+Math.sign(dx2)*r,p[1]+Math.sign(dy2)*r];
  d+=` L${a[0]},${a[1]} Q${p[0]},${p[1]} ${b[0]},${b[1]}`;
 }
 const p=points[points.length-1];return d+` L${p[0]},${p[1]}`;
}
const ROUTE_PATHS=Object.fromEntries(Object.entries(FLAT_ROUTES).map(([key,route])=>[key,roundedOrthogonal(route)]));
const padAt=(part:ComponentId,pin:string)=>FLAT_PINS[part]?.[pin];
function SVGLabel({x,y,children,size=18,color=stageColors.ink,anchor='start',weight=700}:{x:number;y:number;children:ReactNode;size?:number;color?:string;anchor?:'start'|'middle'|'end';weight?:number}){
 return <text x={x} y={y} fontFamily="Arial, sans-serif" fontSize={size} fontWeight={weight} fill={color} textAnchor={anchor} pointerEvents="none">{children}</text>;
}
function PinPad({id,name,active,onClick}:{id:ComponentId;name:string;active:boolean;onClick:(id:ComponentId,pin:string)=>void}){
 const p=padAt(id,name);if(!p)return null;
 return <g className="flat-pin" onClick={(e:ReactMouseEvent<SVGGElement>)=>{e.stopPropagation();onClick(id,name);}} style={{cursor:'pointer'}}>
   {active&&<circle cx={p.x} cy={p.y} r={18} fill="none" stroke="#fff" strokeWidth="2.5" opacity=".8" className="flat-pulse"/>}
   <rect x={p.x-10} y={p.y-8} width={20} height={16} rx="4" fill="#efd38b" stroke={active?'#fff':'#7f6335'} strokeWidth={active?2.6:1.1}/>
   <circle cx={p.x} cy={p.y} r="4" fill="#3f3a2a" stroke="#ffebbb" strokeWidth="1.4"/>
   <rect x={p.x-14} y={p.y-15} width="28" height="30" rx="5" fill="transparent"/>
   <title>{PARTS[id].title} — {name}</title>
 </g>;
}
function FlatComponent({id,onPart,onPin,activePins,switchedOn}:{id:ComponentId;onPart:(id:ComponentId)=>void;onPin:(id:ComponentId,pin:string)=>void;activePins:ReadonlySet<string>;switchedOn:boolean}){
 const bounds=FLAT_BOUNDS[id];const pads=FLAT_PINS[id];if(!bounds||!pads)return null;
 const {x,y,width:w,height:h}=bounds;const title=PARTS[id].title;
 const pins=Object.keys(pads);
 const pcb=id==='amp'?'#402063':id==='tft'?'#0f5064':id==='mic'?'#26385c':id==='battery'?'#6e7885':id==='switch'?'#1c2532':id==='speaker'?'#29323b':id==='esp32'?'#151f2c':'#18517c';
 const common=<><rect x={x+8} y={y+8} width={w-16} height={h-16} rx={id==='battery'?25:15} fill={pcb} stroke="#7c8da1" strokeWidth="3"/>
   {[ [x+24,y+23],[x+w-24,y+23],[x+24,y+h-23],[x+w-24,y+h-23] ].map(([cx,cy],i)=><g key={i}><circle cx={cx} cy={cy} r="7" fill="#0b141f" stroke="#7e92a5" strokeWidth="2"/><circle cx={cx} cy={cy} r="2" fill="#c8d1d5"/></g>)}</>;
 let graphic:ReactNode=null;
 if(id==='esp32'){
   graphic=<>
    <rect x={x+79} y={y+80} width={w-158} height={150} rx="13" fill="#0c141c" stroke="#4a6070" strokeWidth="3"/>
    <rect x={x+104} y={y+115} width={w-208} height={92} rx="9" fill="#202b36" stroke="#d2a661" strokeWidth="5"/>
    <circle cx={x+w/2} cy={y+159} r="35" fill="url(#flat-camera)" stroke="#c6d6e4" strokeWidth="5"/>
    <circle cx={x+w/2} cy={y+159} r="16" fill="#081019" stroke="#6f86aa" strokeWidth="4"/>
    <path d={`M ${x+120} ${y+230} Q ${x+95} ${y+255} ${x+167} ${y+284}`} fill="none" stroke="#d97835" strokeWidth="21"/>
    <rect x={x+100} y={y+310} width={w-200} height={150} rx="12" fill="#ced8e0" stroke="#8899a8" strokeWidth="4"/>
    <SVGLabel x={x+w/2} y={y+350} size={21} anchor="middle" color="#25384b">ESP32-S3</SVGLabel>
    <SVGLabel x={x+w/2} y={y+383} size={18} anchor="middle" color="#435366">N16R8</SVGLabel>
    <SVGLabel x={x+w/2} y={y+418} size={15} anchor="middle" color="#435366">Wi-Fi · I2S · SPI</SVGLabel>
    <rect x={x+95} y={y+h-136} width={61} height={92} rx={8} fill="url(#flat-metal)" stroke="#8a9bab" strokeWidth="3"/>
    <rect x={x+w-155} y={y+h-136} width={61} height={92} rx={8} fill="url(#flat-metal)" stroke="#8a9bab" strokeWidth="3"/>
    <rect x={x+107} y={y+h-114} width={37} height={53} rx={9} fill="#101923"/>
    <rect x={x+w-143} y={y+h-114} width={37} height={53} rx={9} fill="#101923"/>
    <SVGLabel x={x+126} y={y+h-22} size={15} anchor="middle">USB-C</SVGLabel><SVGLabel x={x+w-124} y={y+h-22} size={15} anchor="middle">USB-C</SVGLabel>
    <circle cx={x+w/2} cy={y+500} r="11" fill={switchedOn?'#22c55e':'#41546b'} stroke="#627b91" strokeWidth="3"/>
    <SVGLabel x={x+w/2} y={y+535} size={15} anchor="middle">LED</SVGLabel>
    <SVGLabel x={x+w/2} y={y+580} size={15} color="#bac7d6" anchor="middle">GOOUUU</SVGLabel>
    <SVGLabel x={x+w/2} y={y+612} size={13} color="#97aabc" anchor="middle">CAM + 40 PIN</SVGLabel>
   </>;
 }
 if(id==='tft')graphic=<>
   <rect x={x+58} y={y+48} width={w-78} height={h-95} rx="14" fill="#090e18" stroke="#7293ab" strokeWidth="5"/>
   <rect x={x+72} y={y+62} width={w-105} height={h-121} rx="7" fill="url(#flat-screen)"/>
   <circle cx={x+w/2+8} cy={y+138} r="33" fill="#1d75ad" stroke="#8fe4fa" strokeWidth="3"/>
   <circle cx={x+w/2+8} cy={y+138} r="15" fill="#c4f2fe"/>
   <SVGLabel x={x+w/2+8} y={y+209} anchor="middle" size={24} color="#e8ffff">VISIONBOT</SVGLabel>
   <SVGLabel x={x+w/2+8} y={y+242} anchor="middle" size={15} color={switchedOn?'#79efd3':'#90a5b1'}>{switchedOn?'SẴN SÀNG':'ĐÃ TẮT'}</SVGLabel>
   <SVGLabel x={x+86} y={y+290} size={15} color="#b6d1dd">ST7789 · 1.54"</SVGLabel>
 </>;
 if(id==='battery')graphic=<>
   <rect x={x+42} y={y+42} width={w-92} height={h-83} rx="19" fill="url(#flat-metal)" stroke="#a7bacb" strokeWidth="4"/>
   <rect x={x+42} y={y+42} width={w-92} height="20" fill="#e3b84e" opacity=".88"/>
   <SVGLabel x={x+136} y={y+104} size={31} color="#1b3045" anchor="middle">Li-Po</SVGLabel>
   <SVGLabel x={x+136} y={y+142} size={22} color="#253a4e" anchor="middle">3.7V · 1000mAh</SVGLabel>
 </>;
 if(id==='charger')graphic=<>
   <rect x={x+95} y={y+55} width="88" height="44" rx="7" fill="url(#flat-metal)"/>
   <rect x={x+110} y={y+66} width="57" height="20" rx="4" fill="#0b1723"/>
   <rect x={x+116} y={y+122} width="65" height="51" rx="6" fill="#202a37" stroke="#8ca9c1"/>
   <circle cx={x+224} cy={y+82} r="10" fill={switchedOn?'#17e9a1':'#243b49'}/>
   <circle cx={x+250} cy={y+82} r="10" fill="#edbd4d"/>
   <SVGLabel x={x+155} y={y+195} anchor="middle" size={19}>TP4056</SVGLabel>
 </>;
 if(id==='boost')graphic=<>
   <rect x={x+117} y={y+55} width="98" height="99" rx="12" fill="#52616e" stroke="#b2bac3" strokeWidth="4"/>
   <SVGLabel x={x+165} y={y+120} anchor="middle" size={37} color="#e4eff5">4R7</SVGLabel>
   <rect x={x+86} y={y+167} width="50" height="23" rx="4" fill="#181f27"/>
   <rect x={x+201} y={y+167} width="50" height="23" rx="4" fill="#181f27"/>
   <SVGLabel x={x+164} y={y+211} size={17} anchor="middle">DC-DC · OUT 5V</SVGLabel>
 </>;
 if(id==='switch')graphic=<>
  <rect x={x+95} y={y+28} width="103" height="73" rx="13" fill="#080d12" stroke="#8ea1ad" strokeWidth="3"/>
  <rect x={x+(switchedOn?151:108)} y={y+40} width="32" height="48" rx="5" fill={switchedOn?'#25c878':'#de5555'}/>
  <SVGLabel x={x+53} y={y+79} size={20} color={switchedOn?'#67f3b9':'#ffacaa'}>{switchedOn?'ON':'OFF'}</SVGLabel>
 </>;
 if(id==='button')graphic=<>
   <circle cx={x+w/2} cy={y+h/2} r="68" fill="#161e29" stroke="#92a1b0" strokeWidth="8"/>
   <circle cx={x+w/2} cy={y+h/2} r="52" fill="#196ccc" stroke="#81cbff" strokeWidth="6"/>
   <circle cx={x+w/2-12} cy={y+h/2-12} r="8" fill="#dff3ff" opacity=".7"/>
 </>;
 if(id==='mic')graphic=<>
   <rect x={x+104} y={y+65} width="122" height="123" rx="10" fill="#d9b36e" stroke="#f3db9f" strokeWidth="4"/>
   <rect x={x+126} y={y+86} width="78" height="79" rx="7" fill="#544635"/>
   <circle cx={x+165} cy={y+124} r="14" fill="#090d14" stroke="#ad9970" strokeWidth="3"/>
   <SVGLabel x={x+166} y={y+234} anchor="middle" size={22}>MEMS · INMP441</SVGLabel>
 </>;
 if(id==='amp')graphic=<>
   <rect x={x+113} y={y+92} width={104} height={105} rx="9" fill="#1a1828" stroke="#9070b8" strokeWidth="3"/>
   <SVGLabel x={x+165} y={y+142} anchor="middle" size={16}>MAX</SVGLabel>
   <SVGLabel x={x+165} y={y+169} anchor="middle" size={16}>98357A</SVGLabel>
   <rect x={x+218} y={y+63} width="62" height="105" rx="6" fill="#237d67" stroke="#82cfb4" strokeWidth="3"/>
   <SVGLabel x={x+249} y={y+122} anchor="middle" size={14}>SPK</SVGLabel>
   {[0,1,2,3].map(i=><rect key={i} x={x+80+i*50} y={y+221} width="20" height="16" rx="3" fill="#ead8b5"/>)}
 </>;
 if(id==='speaker')graphic=<>
   <circle cx={x+123} cy={y+113} r="89" fill="#181a1e" stroke="#c0a16b" strokeWidth="13"/>
   <circle cx={x+123} cy={y+113} r="60" fill="#303b4b" stroke="#647889" strokeWidth="8"/>
   <circle cx={x+123} cy={y+113} r="29" fill="#131b22" stroke="#768798" strokeWidth="4"/>
 </>;
 return <g onClick={()=>onPart(id)} style={{cursor:'pointer'}}>
   <rect x={x+5} y={y+8} width={w} height={h} rx="22" fill="#000" opacity=".3"/>
   {common}{graphic}
   <SVGLabel x={x+16} y={y-17} size={21} color="#b9d4e5" weight={800}>{title}</SVGLabel>
   {id==='esp32'?HEADER_PINS.map(p=>{
    const yy=310+p.index*38;
    const protectedPin=p.reserved==='camera'||p.reserved==='psram';
    const active=activePins.has(pinKey('esp32',p.label));
    return <g key={p.no}>
      <SVGLabel x={p.side==='L'?962:1252} y={yy+6} color={protectedPin?'#9eb1bf':active?'#fff4b7':'#e6f1ff'} size={17} anchor={p.side==='L'?'start':'end'} weight={active?900:650}>{p.label.replace('GPIO','IO')}</SVGLabel>
      <SVGLabel x={p.side==='L'?913:1291} y={yy+5} color="#c3a565" size={12} anchor="middle">{p.no}</SVGLabel>
    </g>;
   }):pins.map(name=>{
    const p=pads[name];const textX=p.side==='left'?p.x+20:p.x-20;
    return <SVGLabel key={name} x={textX} y={p.y+6} size={17} color="#e7f2ff" anchor={p.side==='left'?'start':'end'}>{name}</SVGLabel>;
   })}
   {pins.map(name=><PinPad key={name} id={id} name={name} active={activePins.has(pinKey(id,name))} onClick={onPin}/>)}
 </g>;
}

interface Props {onOpen3D:()=>void;sidebarCollapsed?:boolean;onToggleSidebar?:()=>void}
export function FlatLayBoard({onOpen3D,sidebarCollapsed=false,onToggleSidebar}:Props){
 const host=useRef<HTMLDivElement|null>(null);
 const [filter,setFilter]=useState<Filter>('tft');const [view,setView]=useState<ViewBox>(FIT);
 const [activeId,setActiveId]=useState<string|null>('T01');const [hoverId,setHoverId]=useState<string|null>(null);
 const [focusPin,setFocusPin]=useState<string|null>(null);
 const [meter,setMeter]=useState<Meter>('boost');const [power,setPower]=useState(true);
 const [showSafety,setShowSafety]=useState(false);const [mobileDetailsOpen,setMobileDetailsOpen]=useState(false);
 const [fullscreen,setFullscreen]=useState(false);
 const pointerState=useRef<Map<number,Pos>>(new Map());const dragStart=useRef<{point:Pos;view:ViewBox;scale:number}|null>(null);
 const pinchStart=useRef<{distance:number;view:ViewBox;anchor:Pos}|null>(null);
 const visible=useMemo(()=>WIRES.filter(w=>filterWire(w,filter)),[filter]);
 const focused=hoverId??activeId;
 const chosen=WIRES.find(w=>w.id===activeId)??null;
 const focusWire=WIRES.find(w=>w.id===focused)??null;
 const shared=useMemo(()=>{
  if(!focusWire)return new Set<string>();
  return new Set(WIRES.filter(w=>[focusWire.from,focusWire.to].some(p=>isSameTerminal(p,w.from)||isSameTerminal(p,w.to))).map(w=>w.id));
 },[focusWire]);
 const activePins=useMemo(()=>{
  const keys=new Set<string>();
  for(const w of WIRES){if(shared.has(w.id)){keys.add(pinKey(w.from.component,w.from.pin));keys.add(pinKey(w.to.component,w.to.pin));}}
  if(focusPin)keys.add(focusPin);
  return keys;
 },[shared,focusPin]);
 const meterItem=METER_CHOICES.find(m=>m.id===meter)!;
 const meterValue=meter==='battery'?'3.85':power?meter==='boost'?'5.02':'3.30':'0.00';
 const zoomPct=Math.round(FIT.width/view.width*100);
 const selectedNetNames=focused?[...shared].join(', '):'';
 const focusedWarning=focusWire?.warning??(focused?.startsWith('P')?'Kiểm tra điện áp trước khi nối thiết bị thật.':undefined);
 const screenGuard=()=>{
  const target=(host.current?.closest('.vision-v5') as HTMLElement|null)??host.current;
  if(document.fullscreenElement){void document.exitFullscreen().catch(()=>{});}
  else{void target?.requestFullscreen().catch(()=>{});}
 };
 useEffect(()=>{
  const cb=()=>setFullscreen(Boolean(document.fullscreenElement));
  document.addEventListener('fullscreenchange',cb);return()=>document.removeEventListener('fullscreenchange',cb);
 },[]);
 const zoom=useCallback((factor:number,at:Pos={x:FIT.width/2,y:FIT.height/2})=>{
  setView(v=>{
   const nw=clamp(v.width/factor,350,FIT.width*1.1),nh=clamp(v.height/factor,220,FIT.height*1.1);
   const u=(at.x-v.x)/v.width, q=(at.y-v.y)/v.height;
   return{x:at.x-u*nw,y:at.y-q*nh,width:nw,height:nh};
  });
 },[]);
 const centerTo=useCallback((pts:readonly FlatPoint[],maxWidth=860)=>{
  if(pts.length===0)return;
  const x0=Math.min(...pts.map(p=>p[0])),x1=Math.max(...pts.map(p=>p[0]));
  const y0=Math.min(...pts.map(p=>p[1])),y1=Math.max(...pts.map(p=>p[1]));
  const w=clamp(Math.max(x1-x0+300,(y1-y0+240)*(FIT.width/FIT.height)),maxWidth,FIT.width);
  const h=w*(FIT.height/FIT.width);
  setView({x:(x0+x1)/2-w/2,y:(y0+y1)/2-h/2,width:w,height:h});
 },[]);
 const selectWire=useCallback((id:string)=>{
  const w=WIRES.find(item=>item.id===id);if(!w)return;
  setActiveId(id);setFocusPin(null);setMobileDetailsOpen(true);
  centerTo(FLAT_ROUTES[id],filter==='all'?1050:900);
 },[centerTo,filter]);
 const selectPin=useCallback((component:ComponentId,pin:string)=>{
  setFocusPin(pinKey(component,pin));setMobileDetailsOpen(true);
  const associated=WIRES.find(w=>isSameTerminal(w.from,{component,pin})||isSameTerminal(w.to,{component,pin}));
  if(associated){setActiveId(associated.id);setFilter(current=>filterWire(associated,current)?current:associated.group==='nguon'?'source':associated.group==='man-hinh'?'tft':associated.group==='nut-bam'?'button':'audio');}
  else setActiveId(null);
  const p=padAt(component,pin);if(p)centerTo([[p.x,p.y]],720);
 },[centerTo]);
 const selectComponent=(id:ComponentId)=>{
  const b=FLAT_BOUNDS[id];if(b)centerTo([[b.x,b.y],[b.x+b.width,b.y+b.height]],850);
 };
 const onPointerDown=(e:ReactPointerEvent<SVGSVGElement>)=>{
  if(e.button!==0&&e.pointerType==='mouse')return;
  const p={x:e.clientX,y:e.clientY};pointerState.current.set(e.pointerId,p);
  e.currentTarget.setPointerCapture(e.pointerId);
  if(pointerState.current.size===1)dragStart.current={point:p,view,scale:e.currentTarget.getScreenCTM()?.a||1};
  if(pointerState.current.size===2){const points=[...pointerState.current.values()];pinchStart.current={distance:Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y),view,anchor:clientToBoard(e.currentTarget,(points[0].x+points[1].x)/2,(points[0].y+points[1].y)/2)};dragStart.current=null;}
 };
 const onPointerMove=(e:ReactPointerEvent<SVGSVGElement>)=>{
  if(!pointerState.current.has(e.pointerId))return;
  pointerState.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pointerState.current.size===2&&pinchStart.current){
    const points=[...pointerState.current.values()];const distance=Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y);
    const factor=distance/Math.max(1,pinchStart.current.distance);
    const base=pinchStart.current.view;
    const nw=clamp(base.width/factor,350,FIT.width*1.1),nh=clamp(base.height/factor,220,FIT.height*1.1);
    const anchor=pinchStart.current.anchor;
    const ratioX=(anchor.x-base.x)/base.width,ratioY=(anchor.y-base.y)/base.height;
    setView({x:anchor.x-nw*ratioX,y:anchor.y-nh*ratioY,width:nw,height:nh});
    return;
  }
  if(!dragStart.current)return;
  const dx=e.clientX-dragStart.current.point.x,dy=e.clientY-dragStart.current.point.y;
  setView({...dragStart.current.view,x:dragStart.current.view.x-dx/dragStart.current.scale,y:dragStart.current.view.y-dy/dragStart.current.scale});
 };
 const onPointerUp=(e:ReactPointerEvent<SVGSVGElement>)=>{
  pointerState.current.delete(e.pointerId);dragStart.current=null;pinchStart.current=null;
 };
 useEffect(()=>{
  const el=host.current?.querySelector<SVGSVGElement>('.flat-board-svg');if(!el)return;
  const onNativeWheel=(e:WheelEvent)=>{
   e.preventDefault();const at=clientToBoard(el,e.clientX,e.clientY);
   zoom(e.deltaY<0?1.17:1/1.17,at);
  };
  el.addEventListener('wheel',onNativeWheel,{passive:false});
  return()=>el.removeEventListener('wheel',onNativeWheel);
 },[zoom]);
 useEffect(()=>{
  const onKey=(e:KeyboardEvent)=>{
   const el=e.target as HTMLElement|null;if(el?.matches('input,textarea,select,[contenteditable]'))return;
   if(e.key.toLowerCase()==='r'){setView(FIT);e.preventDefault();}
   if(e.key==='+'||e.key==='='){zoom(1.2);e.preventDefault();}
   if(e.key==='-'){zoom(1/1.2);e.preventDefault();}
   if(e.key===']'||e.key==='['){const current=visible.findIndex(w=>w.id===activeId);const next=e.key===']'?current+1:current-1;const nw=visible[(next+visible.length)%visible.length];if(nw)selectWire(nw.id);e.preventDefault();}
   if(e.key==='Escape'){setHoverId(null);}
  };
  window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);
 },[zoom,activeId,selectWire,visible]);
 useEffect(()=>{
  const stage=host.current?.querySelector<HTMLElement>('.flat-board-stage');
  if(!stage||typeof ResizeObserver==='undefined')return;
  const observer=new ResizeObserver(()=>setView(v=>v.width===FIT.width?{...FIT}:v));
  observer.observe(stage);return()=>observer.disconnect();
 },[]);
 const copyConnection=()=>{
  if(!chosen)return;
  void navigator.clipboard?.writeText(`${chosen.id}: ${PARTS[chosen.from.component].title} (${chosen.from.pin}) -> ${PARTS[chosen.to.component].title} (${chosen.to.pin}). ${chosen.explanation}`).catch(()=>{});
 };
  const probeTargets=[meterItem.red,meterItem.black];
 return <div className="flat-layout-root" ref={host}>
  <section className="flat-heading">
   <div className="flat-head-main"><div className="flat-signal-mark"><CircuitBoard size={25}/></div><div><span>PHÂN KHU 03 · BẢNG ĐẤU NỐI ĐIỆN TỬ</span><h2>TRẢI PHẲNG 2D <em>SIÊU NÉT</em></h2><p>Mạch GOOUUU ESP32-S3-CAM · 40 chân · 30 đường nối · SVG vector tương tác</p></div></div>
   <div className="flat-main-actions"><button onClick={onOpen3D}><Expand size={16}/> Xem mô hình 3D</button><button className="flat-primary-action" onClick={screenGuard}><Fullscreen size={17}/> {fullscreen?'Thoát toàn màn':'TRÌNH CHIẾU TV'}</button></div>
  </section>
  <div className="flat-filterbar">
   <span className="flat-filter-label"><SlidersHorizontal size={16}/> NHÓM DÂY:</span>
   {BUTTONS.map(b=><button key={b.id} className={`flat-filter-chip ${filter===b.id?'active':''}`} style={{'--fcolor':b.color} as CSSProperties} onClick={()=>{
    setFilter(b.id);setHoverId(null);
    const first=WIRES.find(w=>filterWire(w,b.id));setActiveId(first?.id??null);setFocusPin(null);setView(FIT);
   }}><i/>{b.title}<small>{b.sub}</small></button>)}
   <div className="flat-filter-count">{visible.length} / 30 dây</div>
  </div>
  <div className={`flat-content ${sidebarCollapsed?'flat-no-inspector':''}`}>
   <div className="flat-visual-column">
    <div className="flat-controls-docked">
     <span className="flat-stage-mark"><span className="flat-live-dot"/> SƠ ĐỒ KỸ THUẬT · CẤU HÌNH ĐỀ XUẤT</span>
     <div className="flat-canvas-tools">
      <button title="Phóng to" onClick={()=>zoom(1.25)}><Plus size={20}/></button>
      <button title="Thu nhỏ" onClick={()=>zoom(1/1.25)}><Minus size={20}/></button>
      <button title="Zoom khít màn hình" onClick={()=>setView(FIT)}><Maximize2 size={20}/></button>
      <button title="Thu gọn/mở bảng giải thích" onClick={()=>onToggleSidebar?.()}><Eye size={20}/></button>
     </div>
    </div>
   <div className="flat-board-stage">
    <svg className="flat-board-svg" xmlns="http://www.w3.org/2000/svg" viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`} preserveAspectRatio="xMidYMid meet" aria-label="Bảng đấu nối phẳng VisionBot tương tác, có các chân, sợi dây và các linh kiện" role="img"
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onDoubleClick={()=>setView(FIT)}>
     <defs>
      <pattern id="flat-dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1.5" fill="#53606b" opacity=".34"/></pattern>
      <linearGradient id="flat-metal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#73889d"/><stop offset=".27" stopColor="#f7fafc"/><stop offset=".65" stopColor="#91a5b6"/><stop offset="1" stopColor="#d4dce6"/></linearGradient>
      <radialGradient id="flat-camera"><stop offset="0" stopColor="#111c2d"/><stop offset=".55" stopColor="#274d76"/><stop offset=".9" stopColor="#090c12"/><stop offset="1" stopColor="#b6cbdc"/></radialGradient>
      <linearGradient id="flat-screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#07182c"/><stop offset="1" stopColor="#0b4378"/></linearGradient>
      <filter id="flat-glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="7" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
     </defs>
     <rect x="-1000" y="-1000" width="4400" height="3700" fill={stageColors.bg}/>
     <rect x="0" y="0" width={FLAT_SIZE.width} height={FLAT_SIZE.height} fill="url(#flat-dots)"/>
     <g opacity=".7" stroke="#40505e" strokeWidth="2" fill="none"><path d="M50 85 H890 V120"/><path d="M1330 98 H2230 V120"/><path d="M50 1375 H2260"/></g>
     <SVGLabel x={90} y={93} color="#a4b4c6" size={25}>01 · KHỐI NGUỒN</SVGLabel>
     <SVGLabel x={935} y={99} color="#a4b4c6" size={25}>02 · ĐIỀU KHIỂN TRUNG TÂM</SVGLabel>
     <SVGLabel x={1500} y={93} color="#a4b4c6" size={25}>03 · HIỂN THỊ / TƯƠNG TÁC</SVGLabel>
     <SVGLabel x={1490} y={592} color="#a4b4c6" size={25}>04 · ÂM THANH I2S</SVGLabel>
     {visible.map(w=>{
       const active=shared.has(w.id),isHovered=w.id===focused;const d=ROUTE_PATHS[w.id];const color=colorFor(w);
       const inactive=Boolean(focused)&&!active;
       return <g key={w.id} className={active?'flat-path-active':''} style={{cursor:'pointer'}}
         onMouseEnter={()=>setHoverId(w.id)}
         
         onMouseLeave={()=>setHoverId(null)}
         onClick={(e:ReactMouseEvent<SVGGElement>)=>{e.stopPropagation();selectWire(w.id);}}>
          {active&&<path d={d} stroke={color} strokeWidth={17} opacity=".4" filter="url(#flat-glow)" fill="none" strokeLinejoin="round"/>}
          <path d={d} stroke="#050708" strokeWidth="11" opacity={inactive?.08:.88} fill="none" strokeLinejoin="round"/>
          <path d={d} stroke={color} strokeWidth={isHovered?8:active?7:4.6} opacity={inactive?.13:.93} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          {active&&<path d={d} stroke="#ffffff" strokeWidth="2" strokeDasharray="3 34" opacity=".98" fill="none" className="flat-flow-path"/>}
          <path d={d} stroke="transparent" strokeWidth="24" fill="none"/>
          <title>{w.id}: {PARTS[w.from.component].title} {w.from.pin} đến {PARTS[w.to.component].title} {w.to.pin}</title>
       </g>;
     })}
     {(['battery','charger','switch','boost','esp32','tft','button','mic','amp','speaker'] as ComponentId[]).map(id=><FlatComponent key={id} id={id} onPart={selectComponent} onPin={selectPin} switchedOn={power} activePins={activePins}/>)}
     {visible.flatMap(w=>[{w,at:w.from,side:'source'}, {w,at:w.to,side:'target'}]).map(({w,at,side})=>{
       const pos=padAt(at.component,at.pin);if(!pos)return null;
       return <g key={`${w.id}-${side}-ferrule`} pointerEvents="none" opacity={focused&&!shared.has(w.id)?.12:.95}>
        <circle cx={pos.x} cy={pos.y} r="11.5" fill="none" stroke={colorFor(w)} strokeWidth="3"/>
        <circle cx={pos.x} cy={pos.y} r="4.3" fill={colorFor(w)}/>
       </g>;
     })}
     {visible.filter(w=>shared.has(w.id)).flatMap(w=>[
      {w,at:w.from,kind:'start'}, {w,at:w.to,kind:'end'}
     ]).map(({w,at,kind})=>{
       const pos=padAt(at.component,at.pin);if(!pos)return null;
       return <g key={`${w.id}-${kind}`} pointerEvents="none"><circle cx={pos.x} cy={pos.y} r="16" fill={colorFor(w)} opacity=".35"/>
        <circle cx={pos.x} cy={pos.y} r="8.5" fill="#fcfcff" stroke={colorFor(w)} strokeWidth="3"/></g>;
     })}
     {(['GPIO39','GPIO40'] as const).map(pin=>{
       const pos=padAt('esp32',pin);if(!pos)return null;
       return <g key={pin} pointerEvents="none"><circle cx={pos.x+30} cy={pos.y} r="7" fill="#e1c9ff" stroke="#ad7eff" strokeWidth="3"/><SVGLabel x={pos.x+48} y={pos.y-14} size={13} color="#ddbaff">NÚT CHIA NHÁNH I2S</SVGLabel></g>;
     })}
     {probeTargets.map((target,index)=>{const p=padAt(target.component,target.pin);if(!p)return null;return <g key={index} pointerEvents="none">
        <circle cx={p.x} cy={p.y} r="22" fill="none" stroke={index===0?'#ff5656':'#b7bfc8'} strokeWidth="5" strokeDasharray="7 7" className="flat-pulse"/>
        <path d={`M ${p.x+22} ${p.y-37} l 35 -28`} stroke={index===0?'#ff5656':'#b8becb'} strokeWidth="13" strokeLinecap="round"/>
        <circle cx={p.x} cy={p.y} r="6" fill={index===0?'#ff5757':'#c9d1da'}/>
        <SVGLabel x={p.x+60} y={p.y-67} size={16} color={index===0?'#ff8d8d':'#d0d8df'}>{index===0?'QUE ĐỎ':'QUE ĐEN'}</SVGLabel>
      </g>;})}
     <SVGLabel x={58} y={1415} size={17} color="#8fa8b9">Chọn chân/dây để soi • Cuộn chuột Zoom • Kéo bảng Pan • Đúp chuột về toàn cảnh</SVGLabel>
     <SVGLabel x={2220} y={1415} size={17} color="#8fa8b9" anchor="end">SVG VECTOR · 2300 × 1440</SVGLabel>
    </svg>
   </div>
   <div className="flat-bottom-hints flat-bottom-docked"><span><Move size={14}/> Kéo để di chuyển</span><span><Plus size={14}/> Lăn chuột hoặc chụm tay để zoom</span><b>{zoomPct}%</b></div>
   </div>
   <aside className={`flat-inspector ${sidebarCollapsed?'sidebar-hidden':''} ${mobileDetailsOpen?'mobile-open':''}`}>
     <button className="flat-mobile-handle" onClick={()=>setMobileDetailsOpen(v=>!v)} aria-expanded={mobileDetailsOpen}>{mobileDetailsOpen?'Thu gọn thông tin ▲':'Xem chi tiết đường dây ▼'}</button>
     <div className="flat-inspector-top"><div><span>SOI DÂY TRỰC TIẾP</span><strong>{chosen?`${chosen.id} — ${chosen.label}`:'Chọn một chân hoặc dây'}</strong></div><button onClick={()=>onToggleSidebar?.()} aria-label="Thu gọn bảng"><Eye size={17}/></button></div>
     {chosen?<div className="flat-route-card">
        <div className="flat-route-header"><span className="flat-wire-id" style={{borderColor:colorFor(chosen),color:colorFor(chosen)}}>{chosen.id}</span><span>ĐƯỜNG DÂY ĐÃ CHỌN</span><button onClick={copyConnection} title="Sao chép kết nối"><Copy size={16}/></button></div>
        <div className="flat-route-endpoints">
         <div><small>TỪ THIẾT BỊ</small><strong>{PARTS[chosen.from.component].title}</strong><b>{chosen.from.pin}</b></div>
         <ArrowRight size={25} className="flat-arrow"/>
         <div><small>ĐẾN THIẾT BỊ</small><strong>{PARTS[chosen.to.component].title}</strong><b>{chosen.to.pin}</b></div>
        </div>
        <p>{chosen.explanation}</p>
        {selectedNetNames&&shared.size>1&&<div className="flat-junction"><Zap size={16}/> Cùng nút chia nhánh: <strong>{selectedNetNames}</strong></div>}
        {focusedWarning&&<div className="flat-single-warn"><AlertTriangle size={16}/>{focusedWarning}</div>}
       </div>:<div className="flat-route-card"><p>Nhấp một chân trên bo mạch hoặc một sợi dây trên bảng để xem cặp chân đấu nối chính xác.</p></div>}
    <div className="flat-meter" aria-label="Đồng hồ vạn năng số ảo minh họa, không đo điện thực">
     <div className="flat-meter-top"><Zap size={15}/> ĐỒNG HỒ ẢO <span>DEMO · KHÔNG ĐO THẬT</span></div>
     <div className="flat-meter-lcd"><span>DC · V</span><b>{meterValue}</b><strong>V</strong><small>{meter==='battery'?'Li-Po / B+ B−':meter==='boost'?'BOOST OUT+ / OUT−':'ESP32 3V3 / GND'}</small></div>
     <div className="flat-meter-probes"><span><i/> Que đo đỏ</span><span><i/> Que đo đen</span></div>
     <div className="flat-meter-choice">{METER_CHOICES.map(m=><button key={m.id} onClick={()=>setMeter(m.id)} className={meter===m.id?'active':''}>{m.title}</button>)}</div>
     <button className={`flat-power-toggle ${power?'on':''}`} onClick={()=>setPower(v=>!v)}>{power?<Check size={15}/>:<Unplug size={15}/>} Công tắc mô phỏng: {power?'ON':'OFF'}</button>
     <small className="flat-meter-result">{meter==='boost'&&power?'Đầu ra mẫu đạt 5V trước khi nối ESP32.':meter==='battery'?'3,85V là giá trị giả lập của pin 1S.':meter==='three'&&power?'Nguồn mô phỏng 3,30V cho TFT và micro.':'Khi OFF, đường cấp nguồn sau công tắc về 0,00V.'}</small>
    </div>
     <div className="flat-list-title"><strong>DANH SÁCH DÂY</strong><span>{visible.length} kết nối</span></div>
     <div className="flat-inspector-list">{visible.map(w=><button key={w.id} onClick={()=>selectWire(w.id)} className={chosen?.id===w.id?'active':''}>
      <span className="flat-wid" style={{background:colorFor(w)}}>{w.id}</span><span><b>{w.from.pin} <ArrowRight size={14}/> {w.to.pin}</b><small>{PARTS[w.from.component].title} → {PARTS[w.to.component].title}</small></span></button>)}</div>
     <button className="flat-safety-button" onClick={()=>setShowSafety(v=>!v)}><ShieldAlert size={18}/> 5 NGUYÊN TẮC AN TOÀN <span>{showSafety?'Ẩn':'Xem'}</span></button>
     {showSafety&&<div className="flat-warnings">{SAFETY_WARNINGS.map((item,i)=><div key={i}><b>{i+1}</b><span>{item}</span></div>)}</div>}
     <div className="flat-check-note"><AlertTriangle size={16}/> GPIO14 không phải chân camera trên GOOUUU tham chiếu; GPIO38–40 thuộc khe microSD, không dùng SD đồng thời. Đối chiếu firmware thực tế trước khi đấu điện.</div>
    </aside>
  </div>
  {sidebarCollapsed&&<div className="flat-collapsed-status"><Cable size={17}/><b>{chosen?`${chosen.from.pin} → ${chosen.to.pin}`:'BẢNG ĐẤU NỐI'}</b><span>{chosen?`${PARTS[chosen.from.component].title} đến ${PARTS[chosen.to.component].title} · ${chosen.explanation}`:'Nhấn vào dây hoặc chân để soi kết nối'}</span><button onClick={()=>onToggleSidebar?.()}>Mở bảng</button></div>}
  <div className="flat-footerbar"><span><ShieldAlert size={15}/> Bản vẽ mô phỏng theo cấu hình đề xuất, cần kiểm tra phần cứng, pinout và firmware thực tế.</span><span>Phím: <kbd>R</kbd> toàn cảnh · <kbd>+</kbd> / <kbd>−</kbd> zoom · <kbd>[</kbd> / <kbd>]</kbd> đổi dây</span></div>
 </div>;
}
