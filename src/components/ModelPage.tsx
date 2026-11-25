import { useState } from 'react';
import { Box, Camera, ChevronDown, Eye, EyeOff, Image as ImageIcon, Layers3, Mic, MousePointer2, RotateCcw, Speaker } from 'lucide-react';
import Workbench from '../Workbench';
import { VisionBotStudioScene } from '../scene/VisionBotStudioModel';
import type { StudioPart } from '../scene/VisionBotStudioModel';
import { supportsWebGL } from '../utils/webgl';

const PARTS: Record<StudioPart,{name:string;description:string;details:string}> = {
  shell: {
    name:'Vỏ ngoài – thiết kế công nghiệp',
    description:'Mô hình vỏ trắng ngang, bo tròn mềm, vật liệu ABS/PC mờ. Bố cục tham khảo ảnh nguyên mẫu VisionBot thật.',
    details:'Vỏ 3D trên website là phối cảnh nâng cấp thẩm mỹ, chưa phải file CAD hoặc kích thước sản xuất. Chuyển sang “Tách lớp linh kiện” để xem các bộ phận thực tế.',
  },
  camera: {
    name:'Camera thu nhận hình ảnh',
    description:'Ống kính tròn nằm phía trên bên trái, có viền kim loại tối, lớp kính và lỗ cảm biến phụ bên dưới.',
    details:'Camera kết nối với bo ESP32-S3-CAM bằng cáp FPC. Hình ảnh từ camera được gửi lên dịch vụ AI để mô tả cảnh vật hoặc đọc chữ.',
  },
  screen: {
    name:'Màn hình TFT ST7789',
    description:'Màn hình màu phía bên phải, có kính che và viền đen mảnh. Hiển thị trạng thái kết nối và câu trả lời tiếng Việt.',
    details:'Đồ họa “Đang nói...” trong mô hình là nội dung mô phỏng do website tạo. Các chân SPI của màn hình được giải thích chi tiết trong Phân khu 3.',
  },
  vents: {
    name:'Ba khe đèn LED xanh',
    description:'Ba khe dọc ở nửa dưới bên trái, có đèn trạng thái xanh ngọc phát sáng từ bên trong vỏ.',
    details:'Các khe và đèn được phỏng theo ảnh thật. Bản mô hình không xác nhận chính xác cấu trúc điện, số LED hoặc chức năng firmware bên trong từng khe.',
  },
  controls: {
    name:'Nút điều khiển và khe micro',
    description:'Các nút bấm nổi thấp, lỗ micro nhỏ và chi tiết kết nối ở mép trên của thiết bị.',
    details:'Tác dụng nút bấm và thứ tự chân cần đối chiếu với sản phẩm thật và firmware. Website không tự xác định sơ đồ đấu nối từ phối cảnh vỏ ngoài.',
  },
};

const PHOTOS = [
  {src:'/images/visionbot-thuc-te-1.png',name:'Sản phẩm nguyên mẫu – ảnh thực tế',studio:false},
  {src:'/images/visionbot-thuc-te-2.png',name:'VisionBot đang hoạt động – ảnh thực tế',studio:false},
  {src:'/images/visionbot-studio-concept.png',name:'Phối cảnh studio – thiết kế đề xuất, không phải ảnh sản phẩm thật',studio:true},
];

export function ModelPage({dark,sidebarCollapsed,onToggleSidebar}:{dark:boolean;sidebarCollapsed:boolean;onToggleSidebar:()=>void}) {
  const [mode,setMode] = useState<'exterior'|'internal'|'photos'>('exterior');
  const [webglAvailable] = useState(() => supportsWebGL());
  const [selected,setSelected] = useState<StudioPart>('shell');
  const [autoRotate,setAutoRotate] = useState(false);
  const [reset,setReset] = useState(0);
  const [photo,setPhoto] = useState(0);
  const [mobileOpen,setMobileOpen] = useState(false);
  return <div className="model-v6-zone">
    <div className="model-v6-selector" aria-label="Lựa chọn góc xem cấu tạo">
      <div><strong>VISIONBOT | STUDIO 3D</strong><span>Vỏ ngoài công nghiệp · Tách lớp · Ảnh nguyên mẫu</span></div>
      <div className="model-v6-options">
        <button onClick={()=>setMode('exterior')} className={mode==='exterior'?'active':''}><Box size={16}/> Mặt ngoài 3D</button>
        <button onClick={()=>setMode('internal')} className={mode==='internal'?'active':''}><Layers3 size={16}/> Tách lớp linh kiện</button>
        <button onClick={()=>setMode('photos')} className={mode==='photos'?'active':''}><ImageIcon size={16}/> Ảnh thật & phối cảnh</button>
      </div>
    </div>
    {mode === 'internal' ? <div className="embedded-workbench"><Workbench key="internal" initialDark={dark} initialTab="structure" sidebarCollapsed={sidebarCollapsed} onToggleSidebar={onToggleSidebar}/></div>
      : <div className={`model-v6-body ${sidebarCollapsed?'model-sidebar-hidden':''}`}>
        <section className="model-v6-stage" aria-label={mode==='photos'?'Ảnh sản phẩm':'Mô hình mặt ngoài VisionBot 3D'}>
          {mode==='exterior'
            ? (webglAvailable ? <VisionBotStudioScene selected={selected} onPick={setSelected} autoRotate={autoRotate} reset={reset}/>
              : <figure className="model-v6-real-photo"><img src="/images/visionbot-studio-concept.png" alt="Phối cảnh dự phòng khi thiết bị không hỗ trợ WebGL"/><figcaption>Chế độ dự phòng: Trình duyệt chưa hỗ trợ WebGL · Ảnh phối cảnh minh họa</figcaption></figure>)
            : <figure className="model-v6-real-photo">
                <img src={PHOTOS[photo].src} alt={PHOTOS[photo].name}/>
                <figcaption>{PHOTOS[photo].name}{PHOTOS[photo].studio ? ' · Hình ảnh minh họa thiết kế nâng cấp' : ' · Ảnh do nhóm nghiên cứu cung cấp'}</figcaption>
              </figure>}
          <div className="model-v6-docked-controls">
            {mode==='exterior' && webglAvailable ? <>
              <span><MousePointer2 size={16}/> Kéo xoay 360° · Cuộn phóng to · Nhấp camera/màn hình/khe LED để xem chi tiết</span>
              <button onClick={()=>setAutoRotate(v=>!v)}>{autoRotate?<EyeOff size={15}/>:<Eye size={15}/>} {autoRotate?'Dừng xoay':'Tự xoay'}</button>
              <button onClick={()=>{setSelected('shell');setReset(v=>v+1);setAutoRotate(false);}}><RotateCcw size={16}/> Về toàn cảnh</button>
            </> : mode==='photos' ? <>
              <span><ImageIcon size={16}/> Hai ảnh nguyên mẫu và một phối cảnh nâng cấp</span>
              {PHOTOS.map((p,i)=><button key={p.src} onClick={()=>setPhoto(i)} className={photo===i?'active':''}>{i===2?'Phối cảnh':`Ảnh thật ${i+1}`}</button>)}
            </> : <span>Đang hiển thị phối cảnh 2D dự phòng vì trình duyệt không hỗ trợ WebGL.</span>}
          </div>
        </section>
        {!sidebarCollapsed && <aside className={`model-v6-inspector ${mobileOpen?'open':''}`}>
          <button className="model-v6-mobile-handle" onClick={()=>setMobileOpen(v=>!v)}><span>Thông số và cấu tạo</span><ChevronDown size={17}/></button>
          <div className="model-v6-inspector-scroll">
            <div className="model-v7-eyebrow">{mode==='exterior'?'CHI TIẾT MÔ HÌNH 3D':'HÌNH ẢNH THAM CHIẾU'}</div>
            <h2>{mode==='exterior' ? PARTS[selected].name : 'Đối chiếu mô hình với nguyên mẫu'}</h2>
            <p>{mode==='exterior' ? PARTS[selected].description : 'Hai ảnh nguyên mẫu do nhóm cung cấp và một hình studio dựng ý tưởng. Hình dựng không được trình bày là sản phẩm đã chế tạo.'}</p>
            {mode==='exterior' && <p className="model-v6-note">{PARTS[selected].details}</p>}
            <div className="model-v6-side-photo"><img src="/images/visionbot-thuc-te-1.png" alt="Ảnh chụp VisionBot nguyên mẫu"/><span>ẢNH NGUYÊN MẪU ĐỂ ĐỐI CHIẾU</span></div>
            <h3>Chọn bộ phận để phóng cận cảnh</h3>
            <div className="model-v6-part-list">{(Object.keys(PARTS) as StudioPart[]).map(id=><button key={id} className={selected===id?'active':''} onClick={()=>{setSelected(id);setMode('exterior');}}>
              {id==='camera'?<Camera size={16}/>:id==='screen'?<Eye size={16}/>:id==='vents'?<Speaker size={16}/>:id==='controls'?<Mic size={16}/>:<Box size={16}/>}
              {PARTS[id].name}
            </button>)}</div>
            <div className="model-v6-note">Chọn <strong>Tách lớp linh kiện</strong> để kiểm tra bo ESP32-S3-CAM, cáp camera FPC, pin, loa, ampli và micro. Chọn <strong>Đấu nối</strong> ở thanh menu chính để soi từng chân GPIO.</div>
          </div>
        </aside>}
      </div>}
  </div>;
}
