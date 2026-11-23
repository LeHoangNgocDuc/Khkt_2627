import { useEffect, useState } from 'react';
import { Activity, BarChart3, Box, Cable, ChevronDown, CircuitBoard, GraduationCap, Moon, Presentation, Sun, Volume2, PanelRightClose, PanelRightOpen, Maximize2 } from 'lucide-react';
import Workbench from './Workbench';
import { IntroPage } from './components/IntroPage';
import { DemoPage } from './components/DemoPage';
import { ResultsPage } from './components/ResultsPage';
import { PitchBoardTV } from './components/PitchBoardTV';
import { SchoolIdentity } from './components/SchoolIdentity';
import { FlatLayBoard } from './components/FlatLayBoard';
import { PROJECT_NAME, SCHOOL_NAME, CAMPUS_NAME } from './data/identity';

type Zone='intro'|'model'|'wiring'|'principle'|'demo'|'results'|'presentation';
const NAV: {id:Zone;short:string;name:string;icon:typeof Box}[]=[
  {id:'intro',short:'Giới thiệu',name:'Giới thiệu sản phẩm',icon:GraduationCap},
  {id:'model',short:'Mô hình 3D',name:'Cấu tạo 3D',icon:Box},
  {id:'wiring',short:'Đấu nối',name:'Đấu nối GPIO',icon:Cable},
  {id:'principle',short:'Nguyên lý',name:'Nguyên lý & Firmware',icon:CircuitBoard},
  {id:'demo',short:'Trình diễn',name:'Demo ngoại tuyến',icon:Activity},
  {id:'results',short:'Kết quả',name:'Kết quả thử nghiệm',icon:BarChart3},
  {id:'presentation',short:'BGK 5 phút',name:'Thuyết trình BGK',icon:Presentation},
];


export default function App(){
  const [section,setSection]=useState<Zone>('intro');
  const [dark,setDark]=useState(true);
  const [demoStatus,setDemoStatus]=useState('Sẵn sàng hỗ trợ');
  const [expandedNav,setExpandedNav]=useState(false);
  const [wiringView,setWiringView]=useState<'flat'|'3d'>('flat');
  const [sidebarCollapsed,setSidebarCollapsed]=useState(false);
  const visualZone=section==='model'||section==='wiring'||section==='principle';
  const toggleFullscreen=()=>{
    if(document.fullscreenElement){void document.exitFullscreen().catch(()=>{});return;}
    void document.documentElement.requestFullscreen?.().catch(()=>{});
  };
  useEffect(()=>{
    const onKey=(event:KeyboardEvent)=>{
      const target=event.target as HTMLElement|null;
      if(target?.closest('input,textarea,select,[contenteditable="true"]'))return;
      if(event.key.toLowerCase()==='p'&&section!=='presentation'){
        event.preventDefault();toggleFullscreen();
      }
    };
    window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);
  },[section]);
  function navigate(id:Zone){setSection(id);setExpandedNav(false);window.scrollTo({top:0,behavior:'instant'});}
  const index=NAV.findIndex(n=>n.id===section);
  return <div className={`app-root vision-portal vision-v5 ${visualZone?'visual-zone-active':''} ${dark?'theme-dark':'theme-light'}`}> 
    <header className="portal-header" aria-label="Nhận diện trường và dự án VisionBot">
      <div className="portal-header-identity"><SchoolIdentity compact editable competition/></div>
      <div className="portal-header-project"><strong>VISIONBOT – RÔ-BỐT AI HỖ TRỢ NGƯỜI KHIẾM THỊ</strong><small>3D &amp; Mạch tương tác · Cuộc thi Khoa học Kỹ thuật – STEM / AI</small></div>
      <div className="portal-header-actions">
        {visualZone&&<button aria-label={sidebarCollapsed?'Mở bảng thông tin':'Thu gọn bảng thông tin'} title={sidebarCollapsed?'Mở bảng thông tin':'Thu gọn bảng thông tin'} onClick={()=>setSidebarCollapsed(v=>!v)}>{sidebarCollapsed?<PanelRightOpen size={19}/>:<PanelRightClose size={19}/>}</button>}
        <button title="Toàn màn hình BGK (P)" aria-label="Toàn màn hình BGK" onClick={toggleFullscreen}><Maximize2 size={19}/></button>
        <button title={dark?'Chế độ sáng':'Chế độ tối'} aria-label="Đổi giao diện sáng tối" onClick={()=>setDark(v=>!v)}>{dark?<Sun size={19}/>:<Moon size={19}/>}</button>
        <button className="mobile-section-toggle" aria-label="Mở danh sách 7 phân khu" onClick={()=>setExpandedNav(v=>!v)}><ChevronDown size={19}/></button>
      </div>
    </header>
    <nav aria-label="7 phân khu VisionBot" className={`portal-nav ${expandedNav?'expanded':''}`}>
      {NAV.map((item,i)=>{const Icon=item.icon;return <button key={item.id} onClick={()=>navigate(item.id)} aria-current={item.id===section?'page':undefined} className={item.id===section?'active':''} title={item.name}><span className="portal-nav-no">{String(i+1).padStart(2,'0')}</span><Icon size={17}/><span>{item.short}</span></button>;})}
    </nav>
    <div className="portal-current"><span><b>PHÂN KHU {index+1}/7</b> — {NAV[index].name}</span><span>{SCHOOL_NAME} • {CAMPUS_NAME}</span></div>
    <main className="portal-content">
      {section==='intro'&&<IntroPage onExplore={()=>navigate('model')} onDemo={()=>navigate('demo')} onPresent={()=>navigate('presentation')}/>}
      {(section==='model'||section==='principle')&&<div className="embedded-workbench"><Workbench key={section} initialDark={dark} initialTab={section==='model'?'structure':'principle'} onOpenTV={()=>navigate('presentation')} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={()=>setSidebarCollapsed(v=>!v)}/></div>}
      {section==='wiring'&&<div className="flat-section">{wiringView==='flat'?<FlatLayBoard onOpen3D={()=>setWiringView('3d')} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={()=>setSidebarCollapsed(v=>!v)}/>:<><div className="flat-back-3d"><button onClick={()=>setWiringView('flat')}>← Trở lại bảng trải phẳng 2D siêu nét</button></div><div className="embedded-workbench"><Workbench key="wiring-3d" initialDark={dark} initialTab="wiring" onOpenTV={()=>navigate('presentation')} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={()=>setSidebarCollapsed(v=>!v)}/></div></>}</div>}
      {section==='demo'&&<><DemoPage dark={dark} onStatus={setDemoStatus}/><div className="portal-demo-status"><Volume2 size={16}/> Trạng thái phản hồi trong mô hình: {demoStatus}</div></>}
      {section==='results'&&<ResultsPage/>}
      {section==='presentation'&&<PitchBoardTV dark={dark} onExit={()=>navigate('model')}/>}
    </main>
    <footer className="portal-footer"><SchoolIdentity compact/><div><strong>{PROJECT_NAME}</strong><small>Website dùng để minh họa cấu tạo và thuyết trình. Kết quả mẫu chưa phải kết quả thực nghiệm.</small></div></footer>
  </div>;
}
