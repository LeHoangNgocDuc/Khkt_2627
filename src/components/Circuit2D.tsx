import { PARTS, WIRES, WIRE_GROUPS, type ComponentId, type WireGroup } from '../data/circuitData';
interface Props {onPart:(id:ComponentId)=>void;onWire:(id:string)=>void;groups:WireGroup[]|null;}
const nodes:{id:ComponentId;x:number;y:number}[]=[
  {id:'tft',x:44,y:43},{id:'mic',x:44,y:162},{id:'button',x:44,y:279},
  {id:'esp32',x:308,y:157},{id:'amp',x:576,y:42},{id:'speaker',x:800,y:42},
  {id:'boost',x:576,y:253},{id:'charger',x:306,y:365},{id:'battery',x:42,y:367},{id:'switch',x:569,y:365},
];
const center=(id:ComponentId)=>{const n=nodes.find(i=>i.id===id);return n?{x:n.x+93,y:n.y+33}:{x:0,y:0};};
export function Circuit2D({onPart,onWire,groups}:Props){
  return <div className="schematic-fallback">
    <div className="fallback-top"><strong>Sơ đồ 2D – Bản dự phòng không cần WebGL</strong><span>Click vào linh kiện hoặc dây để xem chi tiết</span></div>
    <svg viewBox="0 0 1000 465" role="img" aria-label="Sơ đồ khối có dây nối VisionBot">
      <defs><marker id="arrow-wire" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 z" fill="#94a3b8"/></marker></defs>
      {WIRES.filter(w=>!groups||groups.includes(w.group)).map((w,i)=>{
        const a=center(w.from.component),b=center(w.to.component);
        const dy=((i%9)-4)*2;
        return <g key={w.id} onClick={()=>onWire(w.id)} style={{cursor:'pointer'}}>
          <path d={`M ${a.x} ${a.y+dy} Q ${(a.x+b.x)/2} ${(a.y+b.y)/2-16+dy} ${b.x} ${b.y+dy}`} fill="none" stroke={w.color} strokeWidth="2.1" opacity=".6"/>
          <path d={`M ${a.x} ${a.y+dy} Q ${(a.x+b.x)/2} ${(a.y+b.y)/2-16+dy} ${b.x} ${b.y+dy}`} fill="none" stroke="transparent" strokeWidth="11"/>
          <title>{w.id} • {w.label}</title>
        </g>;
      })}
      {nodes.map(n=><g key={n.id} onClick={()=>onPart(n.id)} style={{cursor:'pointer'}}>
        <rect x={n.x} y={n.y} width="186" height="67" rx="12" fill="#122742" stroke={PARTS[n.id].accent} strokeWidth="1.4"/>
        <rect x={n.x+9} y={n.y+10} width="6" height="46" rx="3" fill={PARTS[n.id].accent}/>
        <text x={n.x+23} y={n.y+29} fill="#eef6ff" fontSize="14" fontWeight="600">{PARTS[n.id].title}</text>
        <text x={n.x+23} y={n.y+48} fill="#9db5ce" fontSize="10">{PARTS[n.id].voltage.slice(0,24)}</text>
      </g>)}
    </svg>
    <div className="schematic-groups">{Object.entries(WIRE_GROUPS).map(([key,g])=><span key={key} style={{borderColor:g.color}}>{g.label}</span>)}</div>
  </div>;
}
