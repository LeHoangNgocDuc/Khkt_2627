import { useState } from 'react';
import { Activity, BarChart3, Box, Cable, ChevronDown, CircuitBoard, Clock3, GraduationCap, Moon, Presentation, Sun, Volume2 } from 'lucide-react';
import Workbench from './Workbench';
import { IntroPage } from './components/IntroPage';
import { DemoPage } from './components/DemoPage';
import { ResultsPage } from './components/ResultsPage';
import { PitchBoardTV } from './components/PitchBoardTV';
import { SchoolIdentity } from './components/SchoolIdentity';
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
  function navigate(id:Zone){setSection(id);setExpandedNav(false);window.scrollTo({top:0,behavior:'instant'});}
  const index=NAV.findIndex(n=>n.id===section);
  return <div className={`app-root vision-portal ${dark?'theme-dark':'theme-light'}`}>
    <header className="portal-header">
      <div className="portal-header-identity"><SchoolIdentity compact editable/></div>
      <div className="portal-header-project"><strong>VISION<span>BOT</span></strong><small>TRỢ LÝ THUYẾT TRÌNH KỸ THUẬT 3D</small></div>
      <div className="portal-header-actions"><span className="portal-badge"><Clock3 size={13}/> KHKT • STEM</span>
        <button title="Chuyển chế độ sáng/tối" onClick={()=>setDark(v=>!v)}>{dark?<Sun size={18}/>:<Moon size={18}/>}</button>
        <button className="mobile-section-toggle" aria-label="Mở danh sách 7 phân khu" onClick={()=>setExpandedNav(v=>!v)}><ChevronDown size={18}/></button></div>
    </header>
    <nav aria-label="7 phân khu VisionBot" className={`portal-nav ${expandedNav?'expanded':''}`}>
      {NAV.map((item,i)=>{const Icon=item.icon;return <button key={item.id} onClick={()=>navigate(item.id)} aria-current={item.id===section?'page':undefined} className={item.id===section?'active':''} title={item.name}><span className="portal-nav-no">{String(i+1).padStart(2,'0')}</span><Icon size={17}/><span>{item.short}</span></button>;})}
    </nav>
    <div className="portal-current"><span><b>PHÂN KHU {index+1}/7</b> — {NAV[index].name}</span><span>{SCHOOL_NAME} • {CAMPUS_NAME}</span></div>
    <main className="portal-content">
      {section==='intro'&&<IntroPage onExplore={()=>navigate('model')} onDemo={()=>navigate('demo')} onPresent={()=>navigate('presentation')}/>}
      {(section==='model'||section==='wiring'||section==='principle')&&<div className="embedded-workbench"><Workbench key={section} initialDark={dark} initialTab={section==='model'?'structure':section==='wiring'?'wiring':'principle'} onOpenTV={()=>navigate('presentation')}/></div>}
      {section==='demo'&&<><DemoPage dark={dark} onStatus={setDemoStatus}/><div className="portal-demo-status"><Volume2 size={16}/> Trạng thái phản hồi trong mô hình: {demoStatus}</div></>}
      {section==='results'&&<ResultsPage/>}
      {section==='presentation'&&<PitchBoardTV dark={dark} onExit={()=>navigate('model')}/>}
    </main>
    <footer className="portal-footer"><SchoolIdentity compact/><div><strong>{PROJECT_NAME}</strong><small>Website dùng để minh họa cấu tạo và thuyết trình. Kết quả mẫu chưa phải kết quả thực nghiệm.</small></div></footer>
  </div>;
}
