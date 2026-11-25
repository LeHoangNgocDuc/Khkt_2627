import { useEffect, useState } from 'react';
import { ArrowRight, AudioLines, Box, Camera, ChevronDown, CircuitBoard, Cloud, Cpu, Mic, Pause, Play, ShieldAlert, Volume2, Wifi } from 'lucide-react';
import Workbench from '../Workbench';

const STEPS=[
  {name:'Khởi tạo và nhập yêu cầu',code:'01 · NGƯỜI DÙNG',main:'Người dùng nhấn nút hoặc nói câu hỏi',detail:'Nút tác vụ đánh dấu một yêu cầu. Micro INMP441 thu âm qua I2S; camera FPC chụp cảnh hoặc văn bản khi có yêu cầu thị giác.',note:'Ảnh phụ thuộc khoảng cách, ánh sáng và hướng camera.',icon:Mic},
  {name:'Điều khiển trung tâm ESP32-S3',code:'02 · BỘ ĐIỀU KHIỂN',main:'ESP32-S3 thu, chuẩn bị và điều phối dữ liệu',detail:'ESP32-S3-CAM nhận dữ liệu camera và âm thanh, kiểm tra trạng thái, phối hợp các bus SPI/I2S và Wi-Fi. Mức xử lý ảnh/âm thanh thực tế phụ thuộc cấu hình firmware.',note:'Camera FPC là kết nối nội bộ; không đấu lại camera ra header GPIO.',icon:Cpu},
  {name:'Truyền thông Wi-Fi',code:'03 · KẾT NỐI',main:'Gửi yêu cầu đến dịch vụ xử lý AI',detail:'Thông tin cần phân tích được truyền qua mạng Internet. Các giao thức, máy chủ và API phụ thuộc firmware đang sử dụng, không giả định một nhà cung cấp cụ thể.',note:'Kết nối yếu hoặc mất mạng có thể làm gián đoạn phản hồi.',icon:Wifi},
  {name:'AI phân tích và tạo kết quả',code:'04 · AI ĐÁM MÂY',main:'Mô tả ảnh, đọc chữ và giải thích kiến thức',detail:'Dịch vụ AI phân tích hình ảnh, văn bản và câu hỏi để tạo nội dung trả lời tiếng Việt. Có thể hỗ trợ bài Toán và tiếng Anh nhưng câu trả lời cần được kiểm tra về độ chính xác.',note:'AI có thể đọc sai, mô tả thiếu hoặc suy luận không đúng.',icon:Cloud},
  {name:'Phản hồi qua loa và TFT',code:'05 · ĐẦU RA',main:'Người dùng nghe lời nói, màn hình hiện trạng thái',detail:'Dữ liệu âm thanh số xuất qua I2S đến MAX98357A và loa; màn hình TFT ST7789 nhận tín hiệu SPI để hiển thị biểu tượng, trạng thái và thông báo.',note:'Âm thanh loa SPK+/SPK− không nối một cực về GND.',icon:Volume2},
];
export function PrinciplePage({dark,sidebarCollapsed,onToggleSidebar}:{dark:boolean;sidebarCollapsed:boolean;onToggleSidebar:()=>void}){
  const [step,setStep]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [mode,setMode]=useState<'diagram'|'scene'>('diagram');
  const [mobileOpen,setMobileOpen]=useState(false);
  useEffect(()=>{
    if(!playing||mode!=='diagram')return;
    const t=window.setInterval(()=>setStep(s=>(s+1)%STEPS.length),3200);
    return()=>window.clearInterval(t);
  },[playing,mode]);
  const current=STEPS[step];
  return <section className="principle-v6-zone">
    <div className="model-v6-selector">
      <div><strong>NGUYÊN LÝ HOẠT ĐỘNG</strong><span>Luồng thông tin camera – ESP32 – AI – loa</span></div>
      <div className="model-v6-options">
        <button className={mode==='diagram'?'active':''} onClick={()=>setMode('diagram')}><CircuitBoard size={16}/> Sơ đồ khối</button>
        <button className={mode==='scene'?'active':''} onClick={()=>setMode('scene')}><Box size={16}/> Quan sát 3D</button>
      </div>
    </div>
    {mode==='scene'?<div className="embedded-workbench"><Workbench key="principle-3d" initialDark={dark} initialTab="principle" sidebarCollapsed={sidebarCollapsed} onToggleSidebar={onToggleSidebar}/></div>:
    <div className={`principle-v6-body ${sidebarCollapsed?'collapsed':''}`}>
      <div className="principle-v6-visual">
        <div className="principle-v6-title"><strong>5 BƯỚC XỬ LÝ MỘT YÊU CẦU</strong><span>Chọn khối để xem giải thích; mô phỏng luồng, không gọi AI thật</span></div>
        <div className="principle-v6-chain">
          {STEPS.map((s,i)=>{const I=s.icon;return <div className="principle-v6-node-wrap" key={s.code}>
            <button className={`principle-v6-node ${step===i?'active':''}`} onClick={()=>{setStep(i);setPlaying(false);}} aria-current={step===i?'step':undefined}>
              <span className="principle-v6-node-icon"><I size={32}/></span>
              <b>{s.code}</b><strong>{s.name}</strong><small>{i===0?'Camera · Micro · Nút':i===1?'ESP32-S3-CAM':i===2?'Wi-Fi qua Internet':i===3?'Nhận diện · OCR · Hỏi đáp':'MAX98357A · TFT ST7789'}</small>
            </button>
            {i<STEPS.length-1&&<ArrowRight className="principle-v6-arrow" size={26}/>}
          </div>;})}
        </div>
        <div className="principle-v6-detail"><span>{current.code}</span><h2>{current.main}</h2><p>{current.detail}</p><div><ShieldAlert size={18}/>{current.note}</div></div>
        <div className="principle-v6-controls"><button onClick={()=>setPlaying(v=>!v)}>{playing?<Pause size={17}/>:<Play size={17}/>} {playing?'Dừng mô phỏng':'Tự động chạy 5 bước'}</button><button onClick={()=>setStep(s=>(s+1)%5)}>Bước kế tiếp <ArrowRight size={16}/></button></div>
        <div className="principle-v6-bottom"><div><Camera size={20}/><b>HÌNH ẢNH</b><span>Camera → ESP32 → Wi-Fi → AI thị giác</span></div><div><AudioLines size={20}/><b>ÂM THANH</b><span>Micro → ESP32 → AI → I2S → Loa</span></div></div>
      </div>
      {!sidebarCollapsed&&<aside className={`principle-v6-side ${mobileOpen?'open':''}`}>
        <button className="principle-v6-mobile-handle" onClick={()=>setMobileOpen(v=>!v)}>Giải thích kỹ thuật <ChevronDown size={17}/></button>
        <div className="principle-v6-side-scroll">
          <h2>Bản đồ phần cứng</h2>
          <div className="principle-v6-side-photo"><img src="/images/visionbot-thuc-te-1.png" alt="Ảnh sản phẩm VisionBot thực tế"/></div>
          <p>Những khối trong sơ đồ tương ứng với các cụm thật trong thiết bị. Phần cứng nhỏ gọn thực hiện thu nhận tín hiệu, điều phối giao tiếp và xuất âm thanh/màn hình; AI phức tạp được xử lý qua Internet.</p>
          <div className="principle-v6-techlist"><div><Mic size={17}/><span><b>INMP441</b> · Thu tiếng nói I2S RX</span></div><div><Cpu size={17}/><span><b>ESP32-S3-CAM</b> · Điều khiển Wi-Fi và camera</span></div><div><Volume2 size={17}/><span><b>MAX98357A</b> · Ampli I2S và loa</span></div><div><CircuitBoard size={17}/><span><b>ST7789</b> · Màn hình SPI 3,3 V</span></div></div>
          <div className="principle-v6-warning"><ShieldAlert size={20}/><span><b>Lưu ý an toàn:</b> VisionBot hỗ trợ quan sát theo yêu cầu. AI qua mạng có độ trễ; không thay gậy trắng, không bảo đảm tránh vật cản tức thời.</span></div>
        </div>
      </aside>}
    </div>}
  </section>;
}
