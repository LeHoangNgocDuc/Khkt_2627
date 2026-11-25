/**
 * VISIONBOT Studio Exterior v7
 * Procedural, selectable industrial design model.
 * Reference: actual prototype photographs. This is a product-visualisation concept,
 * NOT a CAD model or a measured representation of the manufactured enclosure.
 */
import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, OrbitControls, PerspectiveCamera, RoundedBox } from '@react-three/drei';
import {
  CanvasTexture, ExtrudeGeometry, Group, Path, Shape,
  SRGBColorSpace, Vector3,
} from 'three';
import type { ThreeEvent } from '@react-three/fiber';

export type StudioPart = 'shell' | 'camera' | 'screen' | 'vents' | 'controls';
type Pick = (part: StudioPart) => void;

// Relative model units, carefully aligned to front-panel cut-outs.
const W = 7.2;
const H = 4.42;
const FACE_Z = 0.31;
const SCREEN_X = 1.00;
const SCREEN_Y = 0.03;
const CAMERA_X = -2.23;
const CAMERA_Y = 0.68;
const VENT_X = [-2.72, -2.24, -1.76];

// Preserve the concrete Three.js type: Shape for the front panel, Path for cut-outs.
// Without a generic return type, TypeScript widens the result to Path | Shape,
// which breaks Shape.holes and ExtrudeGeometry (TS2339 / TS2345).
function roundPath<T extends Shape | Path>(
  path: T, x: number, y: number, w: number, h: number, r: number, clockwise = false,
): T {
  const left = x - w / 2;
  const right = x + w / 2;
  const bottom = y - h / 2;
  const top = y + h / 2;
  if (!clockwise) {
    path.moveTo(left + r, bottom);
    path.lineTo(right - r, bottom);
    path.quadraticCurveTo(right, bottom, right, bottom + r);
    path.lineTo(right, top - r);
    path.quadraticCurveTo(right, top, right - r, top);
    path.lineTo(left + r, top);
    path.quadraticCurveTo(left, top, left, top - r);
    path.lineTo(left, bottom + r);
    path.quadraticCurveTo(left, bottom, left + r, bottom);
  } else {
    path.moveTo(left + r, bottom);
    path.lineTo(left, bottom + r);
    path.quadraticCurveTo(left, bottom, left, top - r);
    path.lineTo(left + r, top);
    path.lineTo(right - r, top);
    path.quadraticCurveTo(right, top, right, top - r);
    path.lineTo(right, bottom + r);
    path.quadraticCurveTo(right, bottom, right - r, bottom);
    path.lineTo(left + r, bottom);
  }
  path.closePath();
  return path;
}

function PanelWithRealCutouts({ onPick, selected }: { onPick: Pick; selected: StudioPart }) {
  const fascia = useMemo(() => {
    const outer = roundPath(new Shape(), 0, 0, W - 0.24, H - 0.23, 0.42);
    const camera = new Path();
    camera.absarc(CAMERA_X, CAMERA_Y, 0.53, 0, Math.PI * 2, true);
    outer.holes.push(camera);
    outer.holes.push(roundPath(new Path(), SCREEN_X, SCREEN_Y, 3.86, 2.87, 0.16, true));
    VENT_X.forEach((x) => outer.holes.push(roundPath(new Path(), x, -1.13, 0.29, 1.05, 0.14, true)));
    return new ExtrudeGeometry(outer, {
      depth: 0.07, bevelEnabled: true, bevelThickness: 0.025,
      bevelSize: 0.023, bevelSegments: 3, curveSegments: 18, steps: 1,
    });
  }, []);
  useEffect(() => () => fascia.dispose(), [fascia]);
  return (
    <group>
      <mesh geometry={fascia} position={[0, 0, FACE_Z]} onClick={(e) => { e.stopPropagation(); onPick('shell'); }} castShadow receiveShadow>
        <meshPhysicalMaterial color={selected === 'shell' ? '#f8fafc' : '#eff1f4'} roughness={0.44} metalness={0.025} clearcoat={0.18} clearcoatRoughness={0.84} />
      </mesh>
      {/* Thin front seam/edge under the faceplate - the shell remains a closed enclosure. */}
      <RoundedBox args={[7.05, 4.27, 0.10]} radius={0.038} smoothness={7} position={[0, 0, 0.20]}>
        <meshStandardMaterial color="#b7c3ce" roughness={0.52} metalness={0.12}/>
      </RoundedBox>
    </group>
  );
}

function drawScreen() {
  const canvas = document.createElement('canvas');
  canvas.width = 1536;
  canvas.height = 1120;
  const c = canvas.getContext('2d');
  if (!c) throw new Error('Canvas 2D unavailable');
  const bg = c.createLinearGradient(0, 0, 1536, 1120);
  bg.addColorStop(0, '#effaff');
  bg.addColorStop(0.55, '#bfeeff');
  bg.addColorStop(1, '#b5e6ff');
  c.fillStyle = bg;
  c.fillRect(0, 0, 1536, 1120);
  // Display status line, Wi-Fi and battery pictograms.
  c.strokeStyle = '#073e63';
  c.fillStyle = '#073e63';
  c.lineWidth = 9;
  c.lineCap = 'round';
  c.beginPath(); c.arc(115, 125, 49, Math.PI * 1.18, Math.PI * 1.82); c.stroke();
  c.beginPath(); c.arc(115, 135, 30, Math.PI * 1.18, Math.PI * 1.82); c.stroke();
  c.beginPath(); c.arc(115, 145, 11, Math.PI * 1.18, Math.PI * 1.82); c.stroke();
  c.beginPath(); c.arc(115, 157, 4, 0, 2 * Math.PI); c.fill();
  c.strokeRect(1370, 94, 87, 48);
  c.fillRect(1458, 109, 11, 18);
  c.fillRect(1380, 104, 50, 28);
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.font = '600 67px Arial, sans-serif';
  c.fillText('Đang nói...', 784, 126);
  // A restrained, cheerful icon that remains clear at small sizes.
  const smile = c.createRadialGradient(710, 390, 20, 770, 510, 215);
  smile.addColorStop(0, '#ffe98d');
  smile.addColorStop(0.7, '#ffd45c');
  smile.addColorStop(1, '#efb92a');
  c.fillStyle = smile;
  c.beginPath(); c.arc(770, 510, 185, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#68502a';
  c.beginPath(); c.ellipse(709, 486, 18, 26, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(829, 486, 18, 26, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#68502a'; c.lineWidth = 14;
  c.beginPath(); c.arc(770, 535, 73, 0.16, Math.PI - 0.16, false); c.stroke();
  c.fillStyle = '#183753';
  c.font = '500 59px Arial, sans-serif';
  c.fillText('Chắc nãy giờ căng thẳng lắm ha?', 770, 859);
  c.fillText('Có mệt người chưa?', 770, 948);
  return canvas;
}

function ScreenAssembly({ selected, onPick }: { selected: StudioPart; onPick: Pick }) {
  const texture = useMemo(() => {
    const t = new CanvasTexture(drawScreen());
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 12;
    return t;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return <group onClick={(e) => { e.stopPropagation(); onPick('screen'); }}>
    <RoundedBox args={[3.87, 2.90, 0.14]} radius={0.055} smoothness={8} position={[SCREEN_X, SCREEN_Y, 0.29]} castShadow>
      <meshStandardMaterial color="#192634" metalness={0.28} roughness={0.34}/>
    </RoundedBox>
    <RoundedBox args={[3.72, 2.76, 0.035]} radius={0.012} smoothness={6} position={[SCREEN_X, SCREEN_Y, 0.385]}>
      <meshBasicMaterial map={texture} toneMapped={false}/>
    </RoundedBox>
    <mesh position={[SCREEN_X, SCREEN_Y, 0.406]}>
      <planeGeometry args={[3.59, 2.59]} />
      <meshPhysicalMaterial color="#b6e8fa" transparent opacity={0.045} roughness={0.09} metalness={0.06} depthWrite={false} />
    </mesh>
    {selected === 'screen' && <RoundedBox args={[3.96, 3.00, 0.018]} radius={0.006} smoothness={6} position={[SCREEN_X, SCREEN_Y, 0.405]}>
      <meshBasicMaterial color="#85d9ff" transparent opacity={0.11} depthWrite={false}/>
    </RoundedBox>}
  </group>;
}

function LensAssembly({ selected, onPick }: { selected: StudioPart; onPick: Pick }) {
  const click = (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onPick('camera'); };
  return <group position={[CAMERA_X, CAMERA_Y, 0]} onClick={click}>
    <mesh position={[0, 0, 0.313]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[0.523, 0.523, 0.065, 80]}/>
      <meshStandardMaterial color="#121c29" metalness={0.64} roughness={0.34}/>
    </mesh>
    <mesh position={[0, 0, 0.377]}><torusGeometry args={[0.462, 0.046, 12, 90]}/><meshStandardMaterial color="#a8afb9" metalness={0.8} roughness={0.27}/></mesh>
    <mesh position={[0, 0, 0.392]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.419, 0.419, 0.055, 72]}/>
      <meshStandardMaterial color="#04080e" metalness={0.23} roughness={0.18}/>
    </mesh>
    <mesh position={[0, 0, 0.428]}><torusGeometry args={[0.345, 0.018, 10, 90]}/><meshStandardMaterial color="#536779" metalness={0.8} roughness={0.22}/></mesh>
    <mesh position={[0, 0, 0.441]}><circleGeometry args={[0.335, 80]}/><meshPhysicalMaterial color="#071521" metalness={0.32} roughness={0.11} clearcoat={1} clearcoatRoughness={0.07}/></mesh>
    <mesh position={[0, 0, 0.455]}><circleGeometry args={[0.206, 80]}/><meshPhysicalMaterial color="#0b355c" metalness={0.28} roughness={0.08} clearcoat={1} clearcoatRoughness={0.06}/></mesh>
    <mesh position={[0, 0, 0.477]}><circleGeometry args={[0.108, 80]}/><meshBasicMaterial color="#01050d"/></mesh>
    <mesh position={[-0.083, 0.095, 0.493]}><sphereGeometry args={[0.038, 16, 12]}/><meshBasicMaterial color="#b4e6ff" transparent opacity={0.84}/></mesh>
    {selected === 'camera' && <mesh position={[0, 0, 0.485]}><torusGeometry args={[0.533, 0.025, 12, 96]}/><meshBasicMaterial color="#7fd8ff"/></mesh>}
    {/* Tiny mic/sensor aperture directly under lens, matching user's product spec. */}
    <mesh position={[0, -0.69, 0.401]}><circleGeometry args={[0.071, 24]}/><meshStandardMaterial color="#14212c" roughness={1}/></mesh>
    <mesh position={[0, -0.69, 0.41]}><circleGeometry args={[0.031, 24]}/><meshBasicMaterial color="#020407"/></mesh>
  </group>;
}

function StatusVents({ onPick, selected }: { onPick: Pick; selected: StudioPart }) {
  const click = (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onPick('vents'); };
  return <group onClick={click}>
    {VENT_X.map((x, i) => <group key={x}>
      <RoundedBox args={[0.28, 1.045, 0.035]} radius={0.012} smoothness={5} position={[x, -1.13, 0.31]}>
        <meshStandardMaterial color="#09281f" emissive="#042618" emissiveIntensity={0.23} roughness={0.67}/>
      </RoundedBox>
      <RoundedBox args={[0.112, 0.70, 0.012]} radius={0.004} smoothness={4} position={[x, -1.17, 0.34]}>
        <meshBasicMaterial color={i === 1 ? '#24f5a3' : '#16b783'} transparent opacity={i === 1 ? 0.86 : 0.48}/>
      </RoundedBox>
      {i === 1 && <>
        <mesh position={[x, -1.02, 0.383]}><sphereGeometry args={[0.105, 20, 14]}/><meshBasicMaterial color="#9cffe1"/></mesh>
        <pointLight position={[x, -1.02, 0.55]} color="#08eb8d" intensity={0.44} distance={2.2}/>
      </>}
      {selected === 'vents' && <RoundedBox args={[0.315, 1.08, 0.012]} radius={0.004} smoothness={5} position={[x, -1.13, 0.389]}>
        <meshBasicMaterial color="#62ffd3" transparent opacity={0.14}/>
      </RoundedBox>}
    </group>)}
  </group>;
}

function TopButtons({ onPick, selected }: { onPick: Pick; selected: StudioPart }) {
  const click = (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onPick('controls'); };
  return <group onClick={click}>
    {[-2.45, -1.43, -0.42].map(x => <group key={x} position={[x, 2.285, 0.02]}>
      <RoundedBox args={[0.33, 0.12, 0.29]} radius={0.045} smoothness={4} castShadow>
        <meshStandardMaterial color="#141d28" roughness={0.5} metalness={0.28}/>
      </RoundedBox>
      <RoundedBox args={[0.24, 0.019, 0.23]} radius={0.006} position={[0, 0.068, 0]}>
        <meshStandardMaterial color="#26313c" roughness={0.45}/>
      </RoundedBox>
    </group>)}
    {[1.35, 1.53, 1.71].map(x => <mesh key={x} position={[x, 2.23, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.023, 12]}/><meshBasicMaterial color="#303f4e"/>
    </mesh>)}
    <RoundedBox args={[0.61, 0.075, 0.16]} radius={0.025} smoothness={4} position={[2.68, 2.258, 0.02]}>
      <meshPhysicalMaterial color="#a8a9c6" roughness={0.35} clearcoat={0.4} />
    </RoundedBox>
    {selected === 'controls' && <pointLight position={[-1.43, 2.52, 0.30]} color="#68c3ff" intensity={1.3} distance={2.5}/>}
  </group>;
}

function Product({ selected, onPick, autoRotate }: { selected: StudioPart; onPick: Pick; autoRotate: boolean }) {
  const unit = useRef<Group>(null);
  useFrame((_, delta) => {
    if (unit.current && autoRotate) unit.current.rotation.y += delta * 0.22;
  });
  return <group ref={unit} rotation={[0.025, -0.15, 0]} position={[0, -0.1, 0]}>
    {/* Matte pearl-white rear shell, thin seam, actual carved front fascia. */}
    <RoundedBox args={[W, H, 0.88]} radius={0.47} smoothness={10} position={[0, 0, -0.20]} castShadow receiveShadow
      onClick={(e) => { e.stopPropagation(); onPick('shell'); }}>
      <meshPhysicalMaterial color="#e9edf1" roughness={0.52} metalness={0.015} clearcoat={0.1}/>
    </RoundedBox>
    <RoundedBox args={[7.08, 4.31, 0.045]} radius={0.016} smoothness={6} position={[0, 0, 0.265]}>
      <meshStandardMaterial color="#b5c0ca" metalness={0.05} roughness={0.72}/>
    </RoundedBox>
    <PanelWithRealCutouts selected={selected} onPick={onPick}/>
    <ScreenAssembly selected={selected} onPick={onPick}/>
    <LensAssembly selected={selected} onPick={onPick}/>
    <StatusVents onPick={onPick} selected={selected}/>
    <TopButtons onPick={onPick} selected={selected}/>
    {/* Low-profile hanging loop; this shape is visible on the real prototype. */}
    <mesh position={[0.25, 2.35, -0.15]}>
      <torusGeometry args={[0.19, 0.072, 12, 32]}/>
      <meshStandardMaterial color="#e0e4e8" metalness={0.03} roughness={0.56}/>
    </mesh>
    <RoundedBox args={[0.23, 0.29, 0.15]} radius={0.055} position={[0.25, 2.25, -0.15]}>
      <meshStandardMaterial color="#e0e4e8" roughness={0.56}/>
    </RoundedBox>
  </group>;
}

const CLOSEUPS: Record<StudioPart, { target: [number, number, number]; camera: [number, number, number] }> = {
  shell: { target: [0, 0, 0], camera: [3.7, 2.1, 11.7] },
  camera: { target: [-2.23, 0.55, 0], camera: [-0.7, 1.3, 5.8] },
  screen: { target: [0.98, 0, 0], camera: [1.8, 0.8, 5.8] },
  vents: { target: [-2.22, -1.13, 0], camera: [-1.1, -0.25, 5.8] },
  controls: { target: [-1.0, 1.80, 0], camera: [1.4, 3.7, 6.7] },
};

function CameraFocus({ part }: { part: StudioPart }) {
  const { camera, controls } = useThree();
  const animation = useRef({ key: 'shell' as StudioPart, remaining: 0 });
  const destination = useMemo(() => CLOSEUPS[part], [part]);
  useEffect(() => { animation.current = { key: part, remaining: 1.3 }; }, [part]);
  useFrame((_, delta) => {
    if (animation.current.remaining <= 0) return;
    animation.current.remaining -= delta;
    const ease = 1 - Math.exp(-4.7 * delta);
    camera.position.lerp(new Vector3(...destination.camera), ease);
    // OrbitControls comes from drei. It is the makeDefault control instance.
    if (controls && 'target' in controls) {
      const orbit = controls as typeof controls & { target: Vector3; update: () => void };
      orbit.target.lerp(new Vector3(...destination.target), ease);
      orbit.update();
    }
  });
  return null;
}

export function VisionBotStudioScene({
  selected, onPick, autoRotate, reset,
}: { selected: StudioPart; onPick: Pick; autoRotate: boolean; reset: number }) {
  return <Canvas key={reset} dpr={[1, 1.8]} shadows gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}>
    <color attach="background" args={['#071324']}/>
    <fog attach="fog" args={['#071324', 15, 30]}/>
    <ambientLight intensity={1.1}/>
    <hemisphereLight args={['#ffffff', '#203450', 1.65]}/>
    <directionalLight position={[-4, 6, 7]} intensity={3.5} color="#f4f9ff" castShadow shadow-mapSize={[1024, 1024]}/>
    <directionalLight position={[5, 2, -3]} intensity={2.2} color="#74b9ff"/>
    <spotLight position={[5, 6, 6]} intensity={19} color="#ecf6ff" angle={0.67} penumbra={0.9} distance={25}/>
    <pointLight position={[-6, 0, 4]} color="#68c8ff" intensity={16} distance={14}/>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.51, 0]} receiveShadow>
      <planeGeometry args={[80, 80]}/>
      <meshStandardMaterial color="#09182a" roughness={0.37} metalness={0.15}/>
    </mesh>
    <ContactShadows frames={1} position={[0, -2.498, 0]} scale={14} opacity={0.62} blur={2.5} far={4.5} resolution={512} color="#02070d"/>
    <PerspectiveCamera makeDefault position={[3.7, 2.1, 11.7]} fov={38}/>
    <Product selected={selected} onPick={onPick} autoRotate={autoRotate}/>
    <OrbitControls makeDefault enableDamping dampingFactor={0.075} minDistance={3.5} maxDistance={23} maxPolarAngle={Math.PI / 1.6} enablePan zoomSpeed={0.9}/>
    <CameraFocus part={selected}/>
  </Canvas>;
}
