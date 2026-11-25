import { useEffect, useMemo } from 'react';
import { Html, RoundedBox } from '@react-three/drei';
import { DoubleSide, CanvasTexture, SRGBColorSpace } from 'three';
import {
  PARTS, HEADER_PINS, type ComponentId, type PinId, type Vec3,
} from '../data/circuitData';

/** Crisp printed silkscreen labels from local canvas textures; no external font downloads. */
function PrintLabel({text,position,size,color='#e2e8f0',anchorX='center'}:{text:string,position:Vec3,size:number,color?:string,anchorX?:'left'|'right'|'center'}){
  const texture=useMemo(()=>{
    const canvas=document.createElement('canvas');
    const measure=canvas.getContext('2d')!;
    measure.font='700 44px Arial, sans-serif';
    canvas.width=Math.max(85,Math.ceil(measure.measureText(text).width+24));canvas.height=68;
    const ctx=canvas.getContext('2d')!;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle=color;ctx.font='700 44px Arial, sans-serif';ctx.textBaseline='middle';
    ctx.fillText(text,12,35);
    const result=new CanvasTexture(canvas);result.colorSpace=SRGBColorSpace;
    result.anisotropy=8;return result;
  },[text,color]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  const worldH=size*1.35;
  const worldW=worldH*(texture.image.width/texture.image.height);
  const px=position[0]+(anchorX==='left'?worldW/2:anchorX==='right'?-worldW/2:0);
  return <mesh position={[px,position[1],position[2]]}>
    <planeGeometry args={[worldW,worldH]}/>
    <meshBasicMaterial map={texture} transparent depthWrite={false} side={DoubleSide}/>
  </mesh>;
}

export interface ModelProps {
  id: ComponentId;
  selected: boolean;
  dimmed: boolean;
  xray: boolean;
  status: string;
  onSelect: (id: ComponentId) => void;
  onPinSelect: (id: ComponentId, pin: PinId) => void;
}
type StandardProps = {dim:boolean;color:string;metalness?:number;roughness?:number;opacity?:number;emissive?:string};
function Mat({dim,color,metalness=0.12,roughness=.55,opacity=1,emissive='#000000'}:StandardProps){
  return <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} emissive={emissive} transparent={dim||opacity<1} opacity={dim?Math.min(opacity,.17):opacity}/>;
}
function Block({position,args,color,dim=false,roughness=.5,metalness=0,radius=.08}: {position:Vec3,args:Vec3,color:string,dim?:boolean,roughness?:number,metalness?:number,radius?:number}){
  return <RoundedBox args={args} radius={radius} smoothness={4} position={position} castShadow receiveShadow>
    <Mat color={color} dim={dim} metalness={metalness} roughness={roughness}/>
  </RoundedBox>;
}
function Screw({x,y,z=.08}: {x:number,y:number,z?:number}){
  return <group position={[x,y,z]}>
    <mesh><cylinderGeometry args={[.09,.09,.028,12]}/><meshStandardMaterial color="#a6b8c8" metalness={.85} roughness={.22}/></mesh>
    <mesh rotation={[0,0,Math.PI/4]}><boxGeometry args={[.11,.015,.032]}/><meshStandardMaterial color="#394454"/></mesh>
  </group>;
}
function Pin({position,onClick,active=false,label}: {position:Vec3,onClick:()=>void,active?:boolean,label?:string}){
  return <group position={position}>
    <mesh rotation={[Math.PI/2,0,0]} onClick={e=>{e.stopPropagation();onClick();}}>
      <cylinderGeometry args={[active?.086:.065,.065,.055,12]}/>
      <meshStandardMaterial color={active?'#fff1a6':'#e9bd5a'} metalness={.84} roughness={.18} emissive={active?'#f59e0b':'#000000'} emissiveIntensity={active?.8:0}/>
    </mesh>
    {active && label && <Html position={[0,0,.20]} center distanceFactor={8} style={{pointerEvents:'none'}}>
      <span className="pin-hover-tip">{label}</span>
    </Html>}
  </group>;
}

function GlassDisplay({status,dim}:{status:string,dim:boolean}){
  const texture=useMemo(()=>{
    const canvas=document.createElement('canvas');canvas.width=480;canvas.height=640;
    const g=canvas.getContext('2d')!;
    const bg=g.createLinearGradient(0,0,480,640);bg.addColorStop(0,'#061a36');bg.addColorStop(1,'#112e5d');
    g.fillStyle=bg;g.fillRect(0,0,480,640);
    g.strokeStyle='#2563eb';g.lineWidth=3;g.strokeRect(12,12,456,616);
    g.fillStyle='#60a5fa';g.font='bold 30px Arial';g.fillText('VISIONBOT',33,68);
    g.font='24px Arial';g.fillStyle='#a5b4fc';g.fillText('AI   •   Wi-Fi  ◉',34,120);
    g.fillStyle='#38bdf8';g.beginPath();g.arc(240,288,97,0,Math.PI*2);g.fill();
    g.fillStyle='#0c1e37';g.beginPath();g.arc(240,288,77,0,Math.PI*2);g.fill();
    g.fillStyle='#fff';g.beginPath();g.arc(214,278,12,0,Math.PI*2);g.arc(266,278,12,0,Math.PI*2);g.fill();
    g.strokeStyle='#fff';g.lineWidth=7;g.beginPath();g.arc(240,296,25,0,Math.PI);g.stroke();
    g.font='bold 26px Arial';g.fillStyle='#f8fafc';g.textAlign='center';g.fillText(status,240,445);
    g.font='20px Arial';g.fillStyle='#a0c4ff';g.fillText('Thấy được nhiều hơn',240,510);
    g.fillStyle='#16a34a';g.fillRect(32,585,290,14);g.strokeStyle='#e2e8f0';g.strokeRect(32,585,410,14);
    const t=new CanvasTexture(canvas);t.colorSpace='srgb';return t;
  },[status]);
  return <mesh position={[0,0,.175]}>
    <planeGeometry args={[1.61,1.92]}/>
    <meshBasicMaterial map={texture} side={DoubleSide} transparent opacity={dim?.24:1}/>
  </mesh>;
}

function Board({p}:{p:ModelProps}){
  return <group>
    <Block position={[0,0,0]} args={[2.13,4.78,.18]} color="#0c1219" dim={p.dimmed} radius={.08}/>
    <Block position={[0,1.41,.115]} args={[1.51,.62,.12]} color="#242d3a" dim={p.dimmed}/>
    <mesh position={[0,1.54,.19]}><planeGeometry args={[1.12,.08]}/><meshBasicMaterial color="#b7c1c8" transparent opacity={p.dimmed?.13:1}/></mesh>
    {Array.from({length:6},(_,i)=><mesh key={'wifi'+i} position={[-.54+i*.22,1.23,.19]}><planeGeometry args={[.12,.06]}/><meshBasicMaterial color="#c2a35e" transparent opacity={p.dimmed?.15:1}/></mesh>)}
    <Block position={[0,-.33,.15]} args={[1.38,1.35,.22]} color="#333a45" dim={p.dimmed}/>
    <Block position={[0,-.32,.29]} args={[.83,.85,.045]} color="#69717d" dim={p.dimmed} metalness={.6}/>
    <Block position={[-.50,-1.37,.14]} args={[.63,.42,.17]} color="#1d2430" dim={p.dimmed}/>
    <Block position={[.50,-1.37,.14]} args={[.63,.42,.17]} color="#1d2430" dim={p.dimmed}/>
    <Block position={[-.51,-2.38,.16]} args={[.7,.45,.30]} color="#b2bccb" dim={p.dimmed} metalness={.86} radius={.08}/>
    <Block position={[.52,-2.38,.16]} args={[.7,.45,.30]} color="#bac6d1" dim={p.dimmed} metalness={.88} radius={.08}/>
    <Block position={[0,.51,.12]} args={[1.68,.39,.14]} color="#3d4857" dim={p.dimmed}/>
    {[-.66,.67].map(x=><Screw key={x} x={x} y={2.11} />)}
    {[-.66,.67].map(x=><Screw key={x+'bottom'} x={x} y={-2.07} />)}
    <mesh position={[.80,-1.87,.20]}><sphereGeometry args={[.075,12,12]}/><meshStandardMaterial color="#34d399" emissive="#16a34a" emissiveIntensity={1.2}/></mesh>
    <PrintLabel position={[0,-1.77,.221]} size={.16} color={p.dimmed?'#5b6476':'#cbd5e1'} text="ESP32-S3-CAM"/>
    <PrintLabel position={[0,.98,.21]} size={.145} color={p.dimmed?'#5b6476':'#d9e9fa'} text="GOOUUU • N16R8"/>
    {HEADER_PINS.map(h=>{
      const coord=PARTS.esp32.pinAnchors[h.label];
      const wired=['3V3','GND','5V','GPIO42','GPIO14','GPIO1','GPIO2','GPIO21','GPIO39','GPIO40','GPIO41','GPIO47','GPIO38'].includes(h.label);
      return <group key={h.no}>
        <Pin position={coord} active={p.selected && wired} label={`${h.label} · Header ${h.no}`} onClick={()=>p.onPinSelect('esp32',h.label)}/>
        <PrintLabel size={.073} color={wired?'#e4f6ff':'#8898aa'} anchorX={h.side==='L'?'left':'right'}
          position={[h.side==='L'?-.91:.91,coord[1],.22]} text={h.label.replace('GPIO','IO')}/>
      </group>;
    })}
    <group onClick={e=>{e.stopPropagation();p.onSelect('camera');}}>
      {/* FPC solder ribbon from socket to sensor */}
      <Block position={[0,.64,.28]} args={[.66,.72,.06]} color="#c56f28" dim={p.dimmed} metalness={.6}/>
      {Array.from({length:7},(_,i)=><mesh key={i} position={[-.24+i*.08,.64,.33]}>
        <boxGeometry args={[.032,.68,.015]}/><meshStandardMaterial color="#ffd27d" metalness={.8} roughness={.26}/>
      </mesh>)}
      <Block position={[0,.83,.43]} args={[.88,.81,.31]} color="#1a202c" dim={p.dimmed}/>
      <mesh position={[0,.83,.62]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.29,.34,.22,32]} /><meshStandardMaterial color="#202937" roughness={.34} metalness={.35}/></mesh>
      <mesh position={[0,.83,.75]}><sphereGeometry args={[.16,32,16]}/><meshPhysicalMaterial color="#1a4368" metalness={.28} roughness={.08} clearcoat={1}/></mesh>
      <mesh position={[-.035,.89,.887]}><sphereGeometry args={[.044,16,16]}/><meshBasicMaterial color="#91dafa"/></mesh>
    </group>
  </group>;
}
function TFT({p}:{p:ModelProps}){
  return <group>
    <Block position={[0,0,0]} args={[2.17,2.61,.12]} color="#11477f" dim={p.dimmed} />
    <Block position={[0,.12,.09]} args={[1.91,2.26,.16]} color="#05080e" dim={p.dimmed}/>
    <GlassDisplay status={p.status} dim={p.dimmed}/>
    {Object.entries(PARTS.tft.pinAnchors).map(([pin,coord])=><Pin key={pin} position={coord} onClick={()=>p.onPinSelect('tft',pin)} active={p.selected} label={pin}/>)}
    <Screw x={-.87} y={1.16} z={.10}/><Screw x={.87} y={-1.16} z={.10}/>
    <PrintLabel position={[0,-1.21,.13]} size={.125} color="#d3e8ff" text={'ST7789 1.54'}/>
  </group>;
}
function Micro({p}:{p:ModelProps}){
  return <group>
    <Block position={[0,0,0]} args={[1.8,1.13,.12]} color="#16242b" dim={p.dimmed}/>
    <Block position={[.25,0,.11]} args={[.82,.73,.13]} color="#aa8952" dim={p.dimmed} metalness={.8}/>
    <mesh position={[.25,0,.22]}><cylinderGeometry args={[.085,.085,.04,32]}/><meshStandardMaterial color="#0d1017"/></mesh>
    {Object.entries(PARTS.mic.pinAnchors).map(([pin,coord])=><Pin key={pin} position={coord} onClick={()=>p.onPinSelect('mic',pin)} active={p.selected} label={pin}/>)}
    <PrintLabel position={[.28,-.47,.13]} size={.15} color="#cedfeb" text={'INMP441'}/>
  </group>;
}
function Amp({p}:{p:ModelProps}){
  return <group>
    <Block position={[0,0,0]} args={[1.81,1.80,.13]} color="#60368f" dim={p.dimmed}/>
    <Block position={[.02,.06,.18]} args={[.66,.65,.17]} color="#1b1930" dim={p.dimmed}/>
    <PrintLabel position={[.03,.14,.28]} size={.13} color="#ebe1ff" text={'MAX'}/>
    {Array.from({length:7},(_,i)=><Block key={i} position={[.44,-.53+i*.18,.15]} args={[.21,.095,.09]} color="#d1bce5" dim={p.dimmed} radius={.02}/>)}
    {Object.entries(PARTS.amp.pinAnchors).map(([pin,coord])=><Pin key={pin} position={coord} onClick={()=>p.onPinSelect('amp',pin)} active={p.selected} label={pin}/>)}
    <Block position={[.87,0,.18]} args={[.38,.86,.34]} color="#18885c" dim={p.dimmed}/>
    <PrintLabel position={[0,-.77,.13]} size={.13} color="#faf5ff" text={'MAX98357A'}/>
  </group>;
}
function Speaker({p}:{p:ModelProps}){
  return <group>
    <mesh castShadow><cylinderGeometry args={[1.01,1.01,.14,48]}/><Mat color="#a99f87" dim={p.dimmed} metalness={.65}/></mesh>
    <mesh position={[0,0,.13]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.77,.125,14,64]}/><Mat color="#c1b68b" dim={p.dimmed} metalness={.7}/></mesh>
    <mesh position={[0,0,.21]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.78,.47,.24,64]}/><Mat color="#17202a" dim={p.dimmed} roughness={.77}/></mesh>
    <mesh position={[0,0,.34]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.28,.28,.05,32]}/><Mat color="#0a0e14" dim={p.dimmed}/></mesh>
    {[[.88,.88],[-.88,.88],[.88,-.88],[-.88,-.88]].map(([x,y],i)=><group key={i} position={[x,y,0]}><Block position={[0,0,-.08]} args={[.37,.27,.15]} color="#b09c6f" dim={p.dimmed} metalness={.8}/><Screw x={0} y={0} z={.04}/></group>)}
    <mesh position={[0,0,-.25]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.56,.56,.28,24]}/><Mat color="#4a4c50" dim={p.dimmed} metalness={.6}/></mesh>
    {Object.entries(PARTS.speaker.pinAnchors).map(([pin,coord])=><Pin key={pin} position={coord} onClick={()=>p.onPinSelect('speaker',pin)} active={p.selected} label={pin}/>)}
  </group>;
}
function Battery({p}:{p:ModelProps}){
  return <group>
    <Block position={[0,0,0]} args={[2.32,1.55,.32]} color="#c8d1db" dim={p.dimmed} metalness={.82} roughness={.26} radius={.19}/>
    <Block position={[0,.65,.14]} args={[2.23,.28,.12]} color="#e0b440" dim={p.dimmed} metalness={.3}/>
    <Block position={[0,.01,.17]} args={[1.72,.55,.05]} color="#e6ebf1" dim={p.dimmed}/>
    <PrintLabel position={[0,.08,.24]} size={.20} color="#26384f" text={'Li-Po 3,7V'}/>
    <PrintLabel position={[0,-.18,.24]} size={.15} color="#475569" text={'1000 mAh / 1S'}/>
    {Object.entries(PARTS.battery.pinAnchors).map(([pin,coord])=><Pin key={pin} position={coord} onClick={()=>p.onPinSelect('battery',pin)} active={p.selected} label={pin}/>)}
  </group>;
}
function Charger({p}:{p:ModelProps}){
  return <group>
    <Block position={[0,0,0]} args={[1.55,1.36,.12]} color="#1f70a8" dim={p.dimmed}/>
    <Block position={[0,-.34,.15]} args={[.62,.34,.27]} color="#a6b0bc" dim={p.dimmed} metalness={.85}/>
    <Block position={[0,.18,.16]} args={[.40,.40,.18]} color="#182c43" dim={p.dimmed}/>
    <mesh position={[-.50,-.18,.11]}><sphereGeometry args={[.07,10,10]}/><meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={.5}/></mesh>
    <mesh position={[.5,-.18,.11]}><sphereGeometry args={[.07,10,10]}/><meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={.4}/></mesh>
    {Object.entries(PARTS.charger.pinAnchors).map(([pin,coord])=><Pin key={pin} position={coord} onClick={()=>p.onPinSelect('charger',pin)} active={p.selected} label={pin}/>)}
    <PrintLabel position={[0,.47,.16]} size={.15} color="#e0f2fe" text={'TP4056'}/>
  </group>;
}
function Boost({p}:{p:ModelProps}){
  return <group>
    <Block position={[0,0,0]} args={[1.57,1.38,.15]} color="#17629a" dim={p.dimmed}/>
    <Block position={[.05,.10,.31]} args={[.79,.75,.43]} color="#394452" dim={p.dimmed} metalness={.46}/>
    <PrintLabel position={[.05,.09,.55]} size={.23} color="#e2e8f0" text={'4R7'}/>
    <Block position={[-.49,.48,.19]} args={[.32,.25,.19]} color="#111827" dim={p.dimmed}/>
    {Object.entries(PARTS.boost.pinAnchors).map(([pin,coord])=><Pin key={pin} position={coord} onClick={()=>p.onPinSelect('boost',pin)} active={p.selected} label={pin}/>)}
    <PrintLabel position={[0,-.56,.18]} size={.15} color="#e0f2fe" text={'BOOST 5V'}/>
  </group>;
}
function ToggleSwitch({p}:{p:ModelProps}){
  return <group>
    <Block position={[0,0,0]} args={[.93,.48,.35]} color="#131820" dim={p.dimmed}/>
    <Block position={[.19,0,.28]} args={[.22,.31,.27]} color="#bac8d6" dim={p.dimmed} metalness={.8}/>
    {Object.entries(PARTS.switch.pinAnchors).map(([pin,coord])=><Pin key={pin} position={coord} onClick={()=>p.onPinSelect('switch',pin)} active={p.selected} label={pin}/>)}
  </group>;
}
function PushButton({p}:{p:ModelProps}){
  return <group>
    <mesh><cylinderGeometry args={[.58,.58,.22,32]}/><Mat color="#39455d" dim={p.dimmed} metalness={.52}/></mesh>
    <mesh position={[0,.05,.19]}><cylinderGeometry args={[.40,.40,.32,32]}/><Mat color="#2563eb" dim={p.dimmed} roughness={.34}/></mesh>
    <mesh position={[0,.05,.40]}><cylinderGeometry args={[.34,.34,.03,32]}/><Mat color="#60a5fa" dim={p.dimmed} metalness={.35}/></mesh>
    {Object.entries(PARTS.button.pinAnchors).map(([pin,coord])=><Pin key={pin} position={coord} onClick={()=>p.onPinSelect('button',pin)} active={p.selected} label={pin}/>)}
  </group>;
}
function ShellFront({p}:{p:ModelProps}){
  const opacity=p.xray?.14:.79;
  return <group>
    {/* Four rounded side rails make openings visible instead of blocking screen/camera. */}
    <RoundedBox args={[.34,6.8,.34]} position={[-2.05,0,0]} radius={.13}><Mat color="#e8edf2" dim={p.dimmed} roughness={.45} opacity={opacity}/></RoundedBox>
    <RoundedBox args={[.34,6.8,.34]} position={[2.05,0,0]} radius={.13}><Mat color="#e8edf2" dim={p.dimmed} roughness={.45} opacity={opacity}/></RoundedBox>
    <RoundedBox args={[4.22,.36,.35]} position={[0,3.29,0]} radius={.14}><Mat color="#e8edf2" dim={p.dimmed} roughness={.45} opacity={opacity}/></RoundedBox>
    <RoundedBox args={[4.22,.36,.35]} position={[0,-3.28,0]} radius={.14}><Mat color="#e8edf2" dim={p.dimmed} roughness={.45} opacity={opacity}/></RoundedBox>
    <RoundedBox args={[4.0,.42,.27]} position={[0,1.72,-.04]} radius={.10}><Mat color="#f4f6f7" dim={p.dimmed} opacity={opacity}/></RoundedBox>
    <RoundedBox args={[4.0,.42,.27]} position={[0,-1.62,-.04]} radius={.10}><Mat color="#f4f6f7" dim={p.dimmed} opacity={opacity}/></RoundedBox>
    {[-1.83,1.83].flatMap(x=>[-2.99,2.98].map(y=><Screw key={`${x}-${y}`} x={x} y={y}/>))}
    <mesh position={[-1.07,1.72,.25]} rotation={[0,0,0]}><torusGeometry args={[.42,.09,14,40]}/><Mat color="#b1bbc6" dim={p.dimmed} opacity={opacity}/></mesh>
    <RoundedBox args={[2.13,2.35,.11]} position={[.7,.60,.2]} radius={.12}><Mat color="#102647" dim={p.dimmed} opacity={opacity}/></RoundedBox>
    {Array.from({length:3},(_,i)=>Array.from({length:4},(_,j)=><mesh key={`${i}-${j}`} position={[-1.32+j*.18,-1.26+i*.18,.17]}><cylinderGeometry args={[.05,.05,.02,6]}/><Mat color="#07152e" dim={p.dimmed} opacity={opacity}/></mesh>))}
    <mesh position={[0,-2.37,.24]}><torusGeometry args={[.48,.10,14,40]}/><Mat color="#b1bbc6" dim={p.dimmed} opacity={opacity}/></mesh>
  </group>;
}
function ShellMiddle({p}:{p:ModelProps}){
  const opacity=p.xray?.11:.7;
  return <group>
    {[-1.95,1.95].map(x=><RoundedBox key={x} args={[.17,6.5,.9]} position={[x,0,0]} radius={.06}><Mat color="#222e42" dim={p.dimmed} opacity={opacity}/></RoundedBox>)}
    {[-3.08,3.08].map(y=><RoundedBox key={y} args={[3.96,.16,.9]} position={[0,y,0]} radius={.06}><Mat color="#222e42" dim={p.dimmed} opacity={opacity}/></RoundedBox>)}
    <RoundedBox args={[3.6,.11,.6]} position={[0,-.80,0]} radius={.05}><Mat color="#314459" dim={p.dimmed} opacity={opacity}/></RoundedBox>
    <RoundedBox args={[1.0,2.6,.15]} position={[.50,-1.65,-.2]} radius={.03}><Mat color="#253954" dim={p.dimmed} opacity={opacity}/></RoundedBox>
    {[-1.68,1.68].flatMap(x=>[-2.8,2.8].map(y=><mesh key={`${x}-${y}`} position={[x,y,.30]}><cylinderGeometry args={[.13,.13,.55,16]}/><Mat color="#8999b0" dim={p.dimmed} opacity={opacity}/></mesh>))}
  </group>;
}
function ShellBack({p}:{p:ModelProps}){
  const opacity=p.xray?.11:.55;
  return <group>
    <RoundedBox args={[4.24,6.7,.18]} radius={.21} position={[0,0,0]}><Mat color="#dbe2e9" dim={p.dimmed} opacity={opacity}/></RoundedBox>
    <RoundedBox args={[1.10,.56,.12]} radius={.08} position={[1.15,-2.60,.13]}><Mat color="#0d2858" dim={p.dimmed} opacity={opacity}/></RoundedBox>
    {[-1.81,1.81].flatMap(x=>[-3,3].map(y=><Screw key={`${x}-${y}`} x={x} y={y} z={.20}/>))}
  </group>;
}

export function ProceduralPart(p:ModelProps){
  let model;
  switch(p.id){
    case 'esp32':model=<Board p={p}/>;break;
    case 'tft':model=<TFT p={p}/>;break;
    case 'mic':model=<Micro p={p}/>;break;
    case 'amp':model=<Amp p={p}/>;break;
    case 'speaker':model=<Speaker p={p}/>;break;
    case 'battery':model=<Battery p={p}/>;break;
    case 'charger':model=<Charger p={p}/>;break;
    case 'boost':model=<Boost p={p}/>;break;
    case 'switch':model=<ToggleSwitch p={p}/>;break;
    case 'button':model=<PushButton p={p}/>;break;
    case 'shellFront':model=<ShellFront p={p}/>;break;
    case 'shellMiddle':model=<ShellMiddle p={p}/>;break;
    case 'shellBack':model=<ShellBack p={p}/>;break;
    case 'camera':return null; // Camera is modeled physically inside ESP32's FPC assembly.
  }
  return <group onClick={e=>{e.stopPropagation();p.onSelect(p.id);}}
    onPointerOver={()=>{document.body.style.cursor='pointer';}}
    onPointerOut={()=>{document.body.style.cursor='auto';}}>
    {model}
  </group>;
}
