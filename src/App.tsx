import { useEffect, useState } from 'react';
import { BookOpen, Box, Cable, ChevronDown, CircuitBoard, Maximize2, Moon, PanelRightClose, PanelRightOpen, Sun } from 'lucide-react';
import Workbench from './Workbench';
import { PrinciplePage } from './components/PrinciplePage';
import { IntroPage } from './components/IntroPage';
import { ModelPage } from './components/ModelPage';
import { SchoolIdentity } from './components/SchoolIdentity';
import { FlatLayBoard } from './components/FlatLayBoard';
import { PROJECT_NAME, PROJECT_SHORT, SCHOOL_NAME, CAMPUS_NAME } from './data/identity';

type Zone = 'intro' | 'model' | 'wiring' | 'principle';
const NAV: Array<{ id: Zone; short: string; full: string; icon: typeof Box }> = [
  { id:'intro', short:'Giới thiệu', full:'Giới thiệu sản phẩm thật', icon:BookOpen },
  { id:'model', short:'Cấu tạo 3D', full:'Cấu tạo ngoài và bên trong', icon:Box },
  { id:'wiring', short:'Đấu nối', full:'Sơ đồ mạch & từng chân GPIO', icon:Cable },
  { id:'principle', short:'Nguyên lý', full:'Nguyên lý hoạt động & firmware', icon:CircuitBoard },
];

export default function App(){
  const [section,setSection]=useState<Zone>('intro');
  const [dark,setDark]=useState(true);
  const [expandedNav,setExpandedNav]=useState(false);
  const [wiringView,setWiringView]=useState<'flat'|'3d'>('flat');
  const [sidebarCollapsed,setSidebarCollapsed]=useState(false);
  const visualZone=section!=='intro';
  const current=NAV.find(n=>n.id===section)!;
  const toggleFullscreen=()=>{
    if(document.fullscreenElement) void document.exitFullscreen().catch(()=>{});
    else void document.documentElement.requestFullscreen?.().catch(()=>{});
  };
  useEffect(()=>{
    const onKey=(event:KeyboardEvent)=>{
      const target=event.target as HTMLElement | null;
      if(target?.closest('input,textarea,select,[contenteditable="true"]')) return;
      if(event.key.toLowerCase()==='p') {event.preventDefault();toggleFullscreen();}
    };
    window.addEventListener('keydown',onKey);
    return ()=>window.removeEventListener('keydown',onKey);
  },[]);
  function navigate(id:Zone){
    setSection(id);setExpandedNav(false);setSidebarCollapsed(false);
    document.querySelector('.portal-content')?.scrollTo({top:0,behavior:'instant'});
  }
  return <div className={`app-root vision-portal vision-v5 vision-v6 ${visualZone?'visual-zone-active':''} ${dark?'theme-dark':'theme-light'}`}>
    <header className="portal-header" aria-label="Trường và dự án VisionBot">
      <div className="portal-header-identity"><SchoolIdentity compact editable competition/></div>
      <div className="portal-header-project" title={PROJECT_NAME}>
        <strong>{PROJECT_SHORT}</strong>
        <small>Đồng hành cùng học sinh khiếm thị trên hành trình học tập hòa nhập</small>
      </div>
      <div className="portal-header-actions">
        {visualZone&&<button aria-label={sidebarCollapsed?'Mở bảng thông tin':'Thu gọn bảng thông tin'} onClick={()=>setSidebarCollapsed(v=>!v)} title="Thu gọn / mở bảng thông tin">{sidebarCollapsed?<PanelRightOpen size={19}/>:<PanelRightClose size={19}/>}</button>}
        <button aria-label="Toàn màn hình (P)" title="Toàn màn hình (P)" onClick={toggleFullscreen}><Maximize2 size={19}/></button>
        <button aria-label="Đổi giao diện sáng/tối" title="Sáng / Tối" onClick={()=>setDark(v=>!v)}>{dark?<Sun size={19}/>:<Moon size={19}/>}</button>
        <button className="mobile-section-toggle" aria-label="Mở danh sách phân khu" onClick={()=>setExpandedNav(v=>!v)}><ChevronDown size={19}/></button>
      </div>
    </header>
    <nav aria-label="4 phân khu kỹ thuật VisionBot" className={`portal-nav ${expandedNav?'expanded':''}`}>
      {NAV.map((item,i)=>{const Icon=item.icon;return <button key={item.id} className={section===item.id?'active':''} onClick={()=>navigate(item.id)} aria-current={section===item.id?'page':undefined} title={item.full}>
        <span className="portal-nav-no">{String(i+1).padStart(2,'0')}</span><Icon size={17}/><span>{item.short}</span>
      </button>;})}
    </nav>
    <div className="portal-current"><span><b>PHÂN KHU {NAV.indexOf(current)+1}/4</b> — {current.full}</span><span>{SCHOOL_NAME} · {CAMPUS_NAME}</span></div>
    <main className="portal-content">
      {section==='intro'&&<IntroPage onExplore={()=>navigate('model')} onWiring={()=>navigate('wiring')} onPrinciple={()=>navigate('principle')}/>}
      {section==='model'&&<ModelPage dark={dark} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={()=>setSidebarCollapsed(v=>!v)} />}
      {section==='wiring'&&<div className="flat-section">{wiringView==='flat'
        ? <FlatLayBoard onOpen3D={()=>setWiringView('3d')} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={()=>setSidebarCollapsed(v=>!v)}/>
        : <><div className="flat-back-3d"><button onClick={()=>setWiringView('flat')}>← Trở lại bảng đấu nối 2D</button></div><div className="embedded-workbench"><Workbench key="wiring-3d" initialDark={dark} initialTab="wiring" sidebarCollapsed={sidebarCollapsed} onToggleSidebar={()=>setSidebarCollapsed(v=>!v)}/></div></>}
      </div>}
      {section==='principle'&&<PrinciplePage dark={dark} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={()=>setSidebarCollapsed(v=>!v)}/>}
    </main>
    <footer className="portal-footer"><SchoolIdentity compact/><div><strong>{PROJECT_NAME}</strong><small>Ảnh sản phẩm thật; sơ đồ, mô hình 3D và tuyến GPIO là dữ liệu minh họa cần đối chiếu với firmware và mạch lắp thực tế.</small></div></footer>
  </div>;
}
