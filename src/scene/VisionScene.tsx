import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Grid, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { ACESFilmicToneMapping, Vector3 } from 'three';
import { allPartList, anchorFor, WIRES, PARTS, positionFor, type ComponentId, type PinId, type WireGroup } from '../data/circuitData';
import { ProceduralPart } from './ProceduralParts';
import { WireBundle } from './WireBundle';

export type Preset='overview'|'exploded'|'pins'|'tft'|'audio'|'power'|'front';
export interface SceneProps {
  explode:number;
  xray:boolean;
  selectedPart:ComponentId|null;
  selectedWire:string|null;
  selectedPin:{id:ComponentId;pin:PinId}|null;
  activeGroups:WireGroup[]|null;
  showWires:boolean;
  showFlow:boolean;
  autoRotate:boolean;
  preset:Preset;
  focusSerial:number;
  status:string;
  dark:boolean;
  /** TV mode: thicker, high-contrast wires and emphasis on selected routes. */
  projection?:boolean;
  /** >1 brings the camera nearer to the selected target (clamped). */
  zoomLevel?:number;
  onSelectPart:(id:ComponentId)=>void;
  onSelectWire:(id:string)=>void;
  onPinSelect:(id:ComponentId,pin:PinId)=>void;
  onBackground:()=>void;
}
const viewDefs: Record<Preset,{target:[number,number,number];camera:[number,number,number]}>={
  overview:{target:[0,0,0],camera:[10.3,5.9,19.0]},
  exploded:{target:[0,0,0],camera:[2.0,3.5,22.0]},
  pins:{target:[-2.0,.4,.18],camera:[-2.0,.3,5.8]},
  tft:{target:[-4.1,1.5,.6],camera:[-4.1,1.7,6.5]},
  audio:{target:[3.1,1.0,.1],camera:[3.5,2.1,9.0]},
  power:{target:[0,-2.5,0],camera:[.9,-1.7,10.3]},
  front:{target:[0,0,.3],camera:[0,0,14.1]},
};
function CameraMotion({p}:{p:SceneProps}){
  const {camera}=useThree();
  const orbit=useRef<any>(null);
  const targetPosition=useRef(new Vector3(10.3,5.9,19.0));
  const targetLook=useRef(new Vector3(0,0,0));
  const moving=useRef(true);
  const lastInteraction=useRef(0);
  useEffect(()=>{
    const v=viewDefs[p.preset];
    let cam=v.camera, look=v.target;
    if (p.selectedPart){
      const s=positionFor(p.selectedPart,p.explode);
      look=[s[0],s[1],s[2]];
      cam=[s[0]+1.2,s[1]+.7,s[2]+5.1];
    }
    if(p.selectedWire){
      const w=WIRES.find(x=>x.id===p.selectedWire);
      if(w){
        const a=anchorFor(w.from.component,w.from.pin,p.explode);
        const b=anchorFor(w.to.component,w.to.pin,p.explode);
        look=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
        cam=[look[0]+1.0,look[1]+.6,look[2]+5.8];
      }
    }
    if (p.selectedPin){
      const s=positionFor(p.selectedPin.id,p.explode);
      const anchor=PARTS[p.selectedPin.id].pinAnchors[p.selectedPin.pin];
      if(anchor){look=[s[0]+anchor[0],s[1]+anchor[1],s[2]+anchor[2]];cam=[look[0]+.6,look[1]+.45,look[2]+3.0];}
    }
    const k=Math.min(1.8,Math.max(.72,p.zoomLevel??1));
    cam=[look[0]+(cam[0]-look[0])/k,look[1]+(cam[1]-look[1])/k,look[2]+(cam[2]-look[2])/k];
    targetPosition.current.set(...cam);
    targetLook.current.set(...look);
    moving.current=true;
  },[p.preset,p.focusSerial,p.selectedPart,p.selectedWire,p.selectedPin,p.explode,p.zoomLevel]);
  useFrame((_,delta)=>{
    if(!orbit.current)return;
    if(moving.current){
      const factor=1-Math.exp(-3.6*delta);
      camera.position.lerp(targetPosition.current,factor);
      orbit.current.target.lerp(targetLook.current,factor);
      orbit.current.update();
      if(camera.position.distanceTo(targetPosition.current)<.02 && orbit.current.target.distanceTo(targetLook.current)<.02) moving.current=false;
    }
  });
  return <OrbitControls ref={orbit} enableDamping dampingFactor={.085} minDistance={2.2} maxDistance={44} maxPolarAngle={Math.PI*.89}
    autoRotate={p.autoRotate} autoRotateSpeed={.48} onStart={()=>{lastInteraction.current++;moving.current=false;}} />;
}

function World({p}:{p:SceneProps}){
  const visibleParts=useMemo(()=>allPartList.filter(part=>part.id!=='camera'),[]);
  return <>
    <color attach="background" args={[p.dark?'#081427':'#edf5ff']}/>
    <fog attach="fog" args={[p.dark?'#081427':'#edf5ff',18,42]}/>
    <ambientLight intensity={p.dark?.8:1.12}/>
    <hemisphereLight args={['#eaf2ff','#283f64',p.dark?1.5:1.1]}/>
    <directionalLight position={[3,9,11]} intensity={3} castShadow shadow-mapSize={[1024,1024]}/>
    <spotLight position={[-9,5,7]} intensity={20} angle={.7} penumbra={.8} color="#75b5ff"/>
    <spotLight position={[7,1,5]} intensity={10} angle={.9} penumbra={.8} color="#b2a2fa"/>
    <Grid position={[0,-4.22,-2.5]} rotation={[0,0,0]} args={[30,30]} cellSize={.6} sectionSize={3}
      cellColor={p.dark?'#28405f':'#d1ddeb'} sectionColor={p.dark?'#385779':'#b8cbdf'}
      cellThickness={.6} sectionThickness={.75} fadeDistance={22} fadeStrength={2} infiniteGrid />

    <group onPointerMissed={p.onBackground}>
      {visibleParts.map(part=>{
        const relevant=p.selectedPart===part.id || p.selectedPart==='camera'&&part.id==='esp32';
        const activeWire=p.selectedWire ? WIRES.find(w=>w.id===p.selectedWire) : null;
        const linked=activeWire ? (activeWire.from.component===part.id || activeWire.to.component===part.id) : true;
        const dimmed=Boolean(p.selectedPart && !relevant) || Boolean(activeWire && !linked);
        return <group key={part.id} position={positionFor(part.id,p.explode)}>
          <ProceduralPart id={part.id} selected={relevant} dimmed={dimmed} xray={p.xray} status={p.status}
            onSelect={p.onSelectPart} onPinSelect={p.onPinSelect}/>
        </group>;
      })}
      <WireBundle explode={p.explode} selectedWire={p.selectedWire} selectedPart={p.selectedPart} activeGroups={p.activeGroups}
        flow={p.showFlow} visible={p.showWires} projection={p.projection} onSelectWire={p.onSelectWire}/>
    </group>
    <ContactShadows position={[0,-4.10,-.8]} opacity={p.dark?.35:.24} width={28} height={15} blur={2.5} far={11}/>
  </>;
}
export function VisionScene(p:SceneProps){
  return <Canvas dpr={p.projection?[1,1.9]:[1,1.7]} shadows gl={{antialias:true,powerPreference:'high-performance',toneMapping:ACESFilmicToneMapping}}>
    <PerspectiveCamera makeDefault position={[10.3,5.9,19.0]} fov={42} near={.05} far={120}/>
    <Suspense fallback={null}><World p={p}/></Suspense>
    <CameraMotion p={p}/>
  </Canvas>;
}
