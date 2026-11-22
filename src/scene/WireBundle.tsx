import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CatmullRomCurve3, Vector3, TubeGeometry, type Mesh } from 'three';
import { WIRES, anchorFor, type ComponentId, type WireGroup } from '../data/circuitData';

export interface WireBundleProps {
  explode:number;
  selectedWire:string|null;
  selectedPart:ComponentId|null;
  activeGroups:WireGroup[]|null;
  flow:boolean;
  visible:boolean;
  onSelectWire:(id:string)=>void;
}
function WindingWire({w,index,p}: {w:(typeof WIRES)[number],index:number,p:WireBundleProps}){
  const bead=useRef<Mesh>(null);
  const start=anchorFor(w.from.component,w.from.pin,p.explode);
  const end=anchorFor(w.to.component,w.to.pin,p.explode);
  const curve=useMemo(()=>{
    const a=new Vector3(...start),b=new Vector3(...end);
    const lift=Math.max(a.z,b.z)+.35+(index%7)*.075;
    const laneY=Math.min(a.y,b.y)-.19-(index%5)*.08;
    const nearStart=new Vector3(a.x+Math.sign(b.x-a.x)*.26,a.y,lift);
    const nearEnd=new Vector3(b.x-Math.sign(b.x-a.x)*.26,b.y,lift);
    return new CatmullRomCurve3([a,nearStart,new Vector3(a.x*.78+b.x*.22,laneY,lift),new Vector3(a.x*.26+b.x*.74,laneY,lift),nearEnd,b],false,'centripetal',.45);
  },[start[0],start[1],start[2],end[0],end[1],end[2],index]);
  const geom=useMemo(()=>new TubeGeometry(curve,48,.028,8,false),[curve]);
  const hoverGeom=useMemo(()=>new TubeGeometry(curve,48,.125,7,false),[curve]);
  useEffect(()=>()=>{geom.dispose();hoverGeom.dispose();},[geom,hoverGeom]);
  const selected=p.selectedWire===w.id;
  const relatedPart=p.selectedPart===w.from.component||p.selectedPart===w.to.component;
  const filtered= !p.activeGroups || p.activeGroups.includes(w.group);
  const dim=Boolean(p.selectedWire && !selected) || Boolean(p.selectedPart && !relatedPart && !selected);
  const opacity=!filtered?.055:dim?.09:.93;
  useFrame(({clock})=>{
    if(!bead.current)return;
    const t=((clock.getElapsedTime()*.29+index*.09)%1);
    bead.current.position.copy(curve.getPoint(t));
  });
  if(!p.visible)return null;
  return <group>
    <mesh geometry={geom} onClick={e=>{e.stopPropagation();p.onSelectWire(w.id);}}
      onPointerOver={()=>{document.body.style.cursor='pointer';}} onPointerOut={()=>{document.body.style.cursor='auto';}}>
      <meshStandardMaterial color={w.color} roughness={.34} metalness={.12} transparent opacity={opacity}
        emissive={w.color} emissiveIntensity={selected?.68:filtered?.14:0}/>
    </mesh>
    <mesh geometry={hoverGeom} onClick={e=>{e.stopPropagation();p.onSelectWire(w.id);}}>
      <meshBasicMaterial color="#fff" transparent opacity={0} depthWrite={false}/>
    </mesh>
    {(p.flow||selected) && filtered && <mesh ref={bead}>
      <sphereGeometry args={[selected?.10:.075,10,10]}/>
      <meshBasicMaterial color={selected?'#ffffff':w.color}/>
    </mesh>}
  </group>;
}
export function WireBundle(p:WireBundleProps){
  return <group>{WIRES.map((w,i)=><WindingWire key={w.id} w={w} index={i} p={p}/>)}</group>;
}
