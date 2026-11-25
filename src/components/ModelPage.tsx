import { useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, RoundedBox } from '@react-three/drei';
import { CanvasTexture, SRGBColorSpace } from 'three';
import { useEffect, useMemo, useRef } from 'react';
import type { Group } from 'three';
import { Box, Camera, ChevronDown, Eye, EyeOff, Image as ImageIcon, Layers3, Mic, MousePointer2, RotateCcw, Speaker } from 'lucide-react';
import Workbench from '../Workbench';

type Part='shell'|'camera'|'screen'|'vents'|'controls';
const PARTS: Record<Part,{name:string,description:string,details:string}>={
  shell:{name:'Vỏ bảo vệ in 3D',description:'Vỏ trắng dạng hộp nằm ngang, có mặt trước dành cho camera, TFT và các khe đèn.',details:'Cấu trúc ngoài được mô phỏng từ ảnh nguyên mẫu. Kích thước và vị trí liên kết nội bộ phải đối chiếu CAD thực tế.'},
  camera:{name:'Cửa sổ camera',description:'Ở bên trái mặt trước VisionBot, thu nhận hình ảnh phục vụ mô tả cảnh vật và nhận diện chữ.',details:'Camera được nối với ESP32-S3-CAM bằng cáp FPC nội bộ, không cần đấu chân camera ra header ngoài.'},
  screen:{name:'Màn hình màu TFT ST7789',description:'Ở bên phải mặt trước, hiển thị trạng thái kết nối, lời phản hồi hoặc thông báo.',details:'Màn hình dùng giao tiếp SPI, cấp nguồn 3,3V. Sơ đồ từng GPIO nằm tại Phân khu 3.'},
  vents:{name:'Khe đèn và âm thanh',description:'Ba khe đứng ở góc dưới bên trái, trong ảnh thật có ánh sáng màu xanh.',details:'Đây là mô phỏng phần vỏ và đèn quan sát được, không khẳng định cấu tạo điện bên dưới các khe.'},
  controls:{name:'Nút nhấn / công tắc',description:'Các chi tiết thao tác ở mép trên của sản phẩm.',details:'Chức năng từng nút phụ thuộc vào cách đấu dây và firmware đang nạp.'},
};
function ScreenTexture(){
  const texture=useMemo(()=>{
    const canvas=document.createElement('canvas');canvas.width=768;canvas.height=600;
    const c=canvas.getContext('2d')!;
    c.fillStyle='#d9f3ff';c.fillRect(0,0,768,600);
    c.fillStyle='#122f46';c.textAlign='center';c.font='600 39px Arial';c.fillText('Đang nói...',384,80);
    c.font='650 24px Arial';c.fillText('VISIONBOT',384,146);
    c.fillStyle='#eec450';c.beginPath();c.arc(384,270,80,0,Math.PI*2);c.fill();
    c.fillStyle='#5d4a33';c.beginPath();c.arc(356,250,9,0,Math.PI*2);c.arc(414,250,9,0,Math.PI*2);c.fill();
    c.strokeStyle='#5d4a33';c.lineWidth=9;c.beginPath();c.arc(384,290,34,0,Math.PI);c.stroke();
    c.fillStyle='#253f56';c.font='28px Arial';c.fillText('Sẵn sàng hỗ trợ',384,425);
    c.font='22px Arial';c.fillText('AI · Wi-Fi · Tiếng Việt',384,474);
    const tex=new CanvasTexture(canvas);tex.colorSpace=SRGBColorSpace;tex.anisotropy=8;return tex;
  },[]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  return <mesh position={[.95,0,.51]}><planeGeometry args={[2.50,2.14]}/><meshBasicMaterial map={texture}/></mesh>;
}
function Exterior({active,choose,autoRotate}:{active:Part;choose:(p:Part)=>void;autoRotate:boolean}){
  const whole=useRef<Group>(null);
  useFrame((_,d)=>{if(whole.current && autoRotate)whole.current.rotation.y+=d*.23;});
  const click=(p:Part)=>(e:any)=>{e.stopPropagation();choose(p);};
  const mat=(selected:boolean)=>({color:selected?'#ffffff':'#edf1f5',roughness:.73,metalness:.03});
  return <group ref={whole} rotation={[.08,-.24,0]}>
    <RoundedBox args={[5.65,3.62,.65]} radius={.27} smoothness={6} onClick={click('shell')} castShadow receiveShadow>
      <meshStandardMaterial {...mat(active==='shell')} />
    </RoundedBox>
    <RoundedBox args={[5.3,3.35,.08]} radius={.23} smoothness={5} position={[0,0,.37]} onClick={click('shell')}><meshStandardMaterial color="#f6f8f9" roughness={.86}/></RoundedBox>
    <mesh position={[-1.85,.58,.445]} rotation={[Math.PI/2,0,0]} onClick={click('camera')}><cylinderGeometry args={[.49,.49,.07,60]}/><meshStandardMaterial color="#222f39" metalness={.4} roughness={.5}/></mesh>
    <mesh position={[-1.85,.58,.493]} rotation={[Math.PI/2,0,0]} onClick={click('camera')}><cylinderGeometry args={[.36,.36,.08,64]}/><meshStandardMaterial color="#0e151d" roughness={.22}/></mesh>
    <mesh position={[-1.85,.58,.557]} onClick={click('camera')}><sphereGeometry args={[.19,28,20]}/><meshPhysicalMaterial color="#124471" metalness={.23} roughness={.08} clearcoat={1}/></mesh>
    <mesh position={[-1.89,.63,.735]}><sphereGeometry args={[.05,16,16]}/><meshBasicMaterial color="#86c8fa"/></mesh>
    <RoundedBox args={[2.98,2.69,.10]} radius={.13} smoothness={4} position={[.95,.0,.43]} onClick={click('screen')}><meshStandardMaterial color="#1c2835" roughness={.65}/></RoundedBox>
    <ScreenTexture />
    {[-2.22,-1.77,-1.32].map((x,i)=><group key={x} onClick={click('vents')}>
      <RoundedBox args={[.27,.88,.075]} radius={.11} position={[x,-.95,.46]}><meshStandardMaterial color="#183e42" roughness={.8}/></RoundedBox>
      <mesh position={[x,-.98,.515]}><planeGeometry args={[.12,.60]}/><meshBasicMaterial color="#12c781"/></mesh>
      {i===1&&<mesh position={[x,-.75,.55]}><sphereGeometry args={[.13,16,16]}/><meshStandardMaterial color="#5dffb6" emissive="#12e3a0" emissiveIntensity={2}/></mesh>}
    </group>)}
    {[-1.95,-.9,.10].map(x=><RoundedBox key={x} args={[.28,.14,.34]} position={[x,1.88,.12]} radius={.045} onClick={click('controls')}><meshStandardMaterial color="#111827"/></RoundedBox>)}
    <RoundedBox args={[.48,.18,.3]} radius={.09} position={[2.05,1.86,.12]} onClick={click('controls')}><meshStandardMaterial color="#aaa1dc" /></RoundedBox>
    <mesh position={[-.25,1.90,0]} onClick={click('controls')}><torusGeometry args={[.24,.09,12,32]}/><meshStandardMaterial color="#dfe5ed" roughness={.62}/></mesh>
    <RoundedBox args={[5.45,.18,.35]} radius={.07} position={[0,-1.81,-.10]}><meshStandardMaterial color="#c9d4dc" roughness={.7}/></RoundedBox>
  </group>;
}
function ExteriorScene({active,onPick,autoRotate,reset}:{active:Part;onPick:(p:Part)=>void;autoRotate:boolean;reset:number}){
  return <Canvas key={reset} dpr={[1,1.7]} shadows gl={{antialias:true,powerPreference:'high-performance'}}>
    <color attach="background" args={['#0c1d34']}/>
    <ambientLight intensity={1.55}/><hemisphereLight args={['#ffffff','#21466c',1.1]}/>
    <directionalLight position={[4,6,8]} intensity={3.2} castShadow/><directionalLight position={[-6,1,-2]} intensity={1.5}/>
    <PerspectiveCamera makeDefault fov={40} position={[4.2,2.4,10.5]}/>
    <Exterior active={active} choose={onPick} autoRotate={autoRotate}/>
    <OrbitControls enableDamping dampingFactor={.08} minDistance={5} maxDistance={27} autoRotate={false} enablePan />
  </Canvas>;
}

export function ModelPage({dark,sidebarCollapsed,onToggleSidebar}:{dark:boolean;sidebarCollapsed:boolean;onToggleSidebar:()=>void}){
  const [mode,setMode]=useState<'exterior'|'internal'|'photos'>('exterior');
  const [selected,setSelected]=useState<Part>('shell');
  const [autoRotate,setAutoRotate]=useState(false);
  const [reset,setReset]=useState(0);
  const [photo,setPhoto]=useState(0);
  const [mobileOpen,setMobileOpen]=useState(false);
  const PHOTOS=[{src:'/images/visionbot-thuc-te-1.png',name:'Góc nhìn thực tế – thiết bị trên bàn'},{src:'/images/visionbot-thuc-te-2.png',name:'Góc nhìn thực tế – camera đang hoạt động'}];
  return <div className="model-v6-zone">
    <div className="model-v6-selector" aria-label="Lựa chọn góc xem cấu tạo">
      <div><strong>CẤU TẠO VISIONBOT</strong><span>Ảnh thật và mô hình kỹ thuật</span></div>
      <div className="model-v6-options">
        <button onClick={()=>setMode('exterior')} className={mode==='exterior'?'active':''}><Box size={16}/> Mặt ngoài 3D</button>
        <button onClick={()=>setMode('internal')} className={mode==='internal'?'active':''}><Layers3 size={16}/> Tách lớp linh kiện</button>
        <button onClick={()=>setMode('photos')} className={mode==='photos'?'active':''}><ImageIcon size={16}/> Ảnh thật</button>
      </div>
    </div>
    {mode==='internal' ? <div className="embedded-workbench"><Workbench key="internal" initialDark={dark} initialTab="structure" sidebarCollapsed={sidebarCollapsed} onToggleSidebar={onToggleSidebar}/></div>
      : <div className={`model-v6-body ${sidebarCollapsed?'model-sidebar-hidden':''}`}>
        <section className="model-v6-stage" aria-label={mode==='photos'?'Ảnh sản phẩm thật':'Mô hình mặt ngoài VisionBot 3D'}>
          {mode==='exterior'?<ExteriorScene active={selected} onPick={setSelected} autoRotate={autoRotate} reset={reset}/>
            : <figure className="model-v6-real-photo"><img src={PHOTOS[photo].src} alt={PHOTOS[photo].name}/><figcaption>{PHOTOS[photo].name} · Ảnh do nhóm nghiên cứu cung cấp</figcaption></figure>}
          <div className="model-v6-docked-controls">
            {mode==='exterior'?<><span><MousePointer2 size={16}/> Kéo để xoay · Cuộn để phóng · Chọn bộ phận để giải thích</span>
              <button onClick={()=>setAutoRotate(v=>!v)}>{autoRotate?<EyeOff size={15}/>:<Eye size={15}/>} {autoRotate?'Dừng xoay':'Tự xoay'}</button>
              <button onClick={()=>setReset(v=>v+1)}><RotateCcw size={16}/> Góc nhìn gốc</button></>:
              <><span><ImageIcon size={16}/> Ảnh chụp nguyên mẫu thực tế, không phải ảnh AI</span>
                {PHOTOS.map((p,i)=><button key={p.src} onClick={()=>setPhoto(i)} className={photo===i?'active':''}>Ảnh {i+1}</button>)}
              </>}
          </div>
        </section>
        {!sidebarCollapsed&&<aside className={`model-v6-inspector ${mobileOpen?'open':''}`}>
          <button className="model-v6-mobile-handle" onClick={()=>setMobileOpen(v=>!v)}><span>Thông tin cấu tạo</span><ChevronDown size={17}/></button>
          <div className="model-v6-inspector-scroll">
            <h2>{mode==='exterior'?PARTS[selected].name:'Đối chiếu mô hình với ảnh thật'}</h2>
            <p>{mode==='exterior'?PARTS[selected].description:'Sản phẩm thực tế sử dụng vỏ nhựa trắng in 3D, camera và màn hình bên phải. Ảnh này được đưa trực tiếp vào website để tránh nhầm mô hình dựng với sản phẩm thật.'}</p>
            {mode==='exterior'&&<p className="model-v6-note">{PARTS[selected].details}</p>}
            <div className="model-v6-side-photo"><img src="/images/visionbot-thuc-te-1.png" alt="Ảnh chụp thật của VisionBot"/><span>HÌNH ẢNH THỰC TẾ CỦA THIẾT BỊ</span></div>
            <h3>Chọn bộ phận cần soi</h3>
            <div className="model-v6-part-list">{(Object.keys(PARTS) as Part[]).map(id=><button key={id} className={selected===id?'active':''} onClick={()=>setSelected(id)}>{id==='camera'?<Camera size={16}/>:id==='screen'?<Eye size={16}/>:id==='vents'?<Speaker size={16}/>:id==='controls'?<Mic size={16}/>:<Box size={16}/>} {PARTS[id].name}</button>)}</div>
            <div className="model-v6-note">Để khám phá bo ESP32-S3, camera FPC, pin, micro, ampli, loa và từng chân header, hãy chọn <strong>Tách lớp linh kiện</strong> ở thanh trên.</div>
          </div>
        </aside>}
      </div>}
  </div>;
}
