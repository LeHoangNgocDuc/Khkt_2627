import type { CSSProperties } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Accessibility, AlertCircle, AlertTriangle, ArrowLeft, ArrowRight,
  Box, Cable, Camera, Check, ChevronDown, CircleDot, CircuitBoard, Code2, Cpu, Eye, EyeOff,
  Fullscreen, GitBranch, HelpCircle, Layers3, Maximize2, Menu, Mic, Moon,
  MousePointer2, Pause, Play, Power, RotateCcw, Rotate3d, ShieldAlert, Sparkles,
  Sun, Volume2, Wifi, X, type LucideIcon,
} from 'lucide-react';
import {
  ASSEMBLY_STEPS, HEADER_BY_NAME, PARTS, SAFETY_WARNINGS, WIRES, WIRE_GROUPS,
  getConnectedWires, getPinHeaderNo, type ComponentId, type PinId, type WireGroup,
} from './data/circuitData';
import { VisionScene, type Preset } from './scene/VisionScene';
import { Circuit2D } from './components/Circuit2D';
import { FirmwarePanel } from './components/FirmwarePanel';
import { supportsWebGL } from './utils/webgl';

type Tab='structure'|'wiring'|'steps'|'principle'|'firmware';
interface TabDef {id:Tab;title:string;icon:LucideIcon;}
const TABS:TabDef[]=[
  {id:'structure',title:'Cấu trúc',icon:Box},
  {id:'wiring',title:'Đấu nối',icon:Cable},
  {id:'steps',title:'Lắp ráp',icon:GitBranch},
  {id:'principle',title:'Nguyên lý',icon:Sparkles},
  {id:'firmware',title:'Firmware',icon:Code2},
];
const PRESETS:{id:Preset;label:string;no:number}[]=[
  {id:'overview',label:'Toàn cảnh',no:1},
  {id:'exploded',label:'Tách lớp',no:2},
  {id:'pins',label:'Chân ESP32',no:3},
  {id:'tft',label:'Cụm TFT',no:4},
  {id:'audio',label:'Âm thanh I2S',no:5},
  {id:'power',label:'Nguồn',no:6},
  {id:'front',label:'Mặt trước',no:7},
];
const OPERATING_FLOW=[
  {title:'Khởi động',subtitle:'Nhấn nút thao tác',icon:Power,status:'Đang khởi tạo...',pitch:'VisionBot khởi động và kiểm tra nguồn, màn hình, kết nối Wi-Fi.'},
  {title:'Quan sát',subtitle:'Camera + micro',icon:Camera,status:'Đang lắng nghe...',pitch:'Camera chụp ảnh, micro ghi nhận yêu cầu từ người dùng.'},
  {title:'Truyền dữ liệu',subtitle:'ESP32-S3 qua Wi-Fi',icon:Wifi,status:'Đang kết nối...',pitch:'Ảnh và yêu cầu được truyền đến dịch vụ AI thông qua kết nối Internet.'},
  {title:'AI phân tích',subtitle:'Mô phỏng dịch vụ Cloud',icon:Sparkles,status:'AI đang phân tích...',pitch:'Dịch vụ AI phân tích cảnh vật và tạo nội dung mô tả; thao tác này là mô phỏng.'},
  {title:'Phản hồi',subtitle:'I2S, loa và TFT',icon:Volume2,status:'Đang nói...',pitch:'Kết quả được chuyển thành âm thanh tiếng Việt và trạng thái cập nhật trên TFT.'},
];
const PART_DISPLAY:ComponentId[]=['esp32','camera','tft','mic','amp','speaker','battery','charger','boost','switch','button','shellFront','shellMiddle','shellBack'];
function getPartIcon(id:ComponentId):LucideIcon {
  if(id==='esp32')return Cpu;
  if(id==='camera')return Camera;
  if(id==='tft')return Eye;
  if(id==='mic')return Mic;
  if(id==='amp'||id==='speaker')return Volume2;
  if(id==='battery'||id==='charger'||id==='boost'||id==='switch')return Power;
  if(id==='button')return CircleDot;
  return Layers3;
}
function WiringBadge({group}:{group:WireGroup}){
  return <span className="wire-badge" style={{'--wire-color':WIRE_GROUPS[group].color} as CSSProperties}>{WIRE_GROUPS[group].label}</span>;
}

export default function Workbench({initialTab='structure',initialDark=true,onOpenTV,sidebarCollapsed=false,onToggleSidebar}:{initialTab?:'structure'|'wiring'|'steps'|'principle'|'firmware';initialDark?:boolean;onOpenTV?:()=>void;sidebarCollapsed?:boolean;onToggleSidebar?:()=>void}){
  const [tab,setTab]=useState<Tab>(initialTab);
  const [explode,setExplode]=useState(43);
  const [xray,setXray]=useState(false);
  const [visibleWires,setVisibleWires]=useState(true);
  const [flow,setFlow]=useState(true);
  const [autoRotate,setAutoRotate]=useState(false);
  const [showWarnings,setShowWarnings]=useState(false);
  const [selectedPart,setSelectedPart]=useState<ComponentId|null>(null);
  const [selectedWire,setSelectedWire]=useState<string|null>(null);
  const [selectedPin,setSelectedPin]=useState<{id:ComponentId;pin:PinId}|null>(null);
  const [groups,setGroups]=useState<WireGroup[]|null>(null);
  const [preset,setPreset]=useState<Preset>('overview');
  const [focusSerial,setFocusSerial]=useState(0);
  const [step,setStep]=useState(0);
  const [stepPlaying,setStepPlaying]=useState(false);
  const [flowIndex,setFlowIndex]=useState(0);
  const [flowPlaying,setFlowPlaying]=useState(false);
  const [dark,setDark]=useState(initialDark);
  useEffect(()=>setDark(initialDark),[initialDark]);
  const [present,setPresent]=useState(false);
  const [menuOpen,setMenuOpen]=useState(false);
  const [mobilePanel,setMobilePanel]=useState(false);
  const [prefer2D,setPrefer2D]=useState(false);
  const [canWebGL]=useState(()=>supportsWebGL());
  const [checked,setChecked]=useState<Record<string,boolean>>({});
  const currentStep=ASSEMBLY_STEPS[step];
  const focusWire=WIRES.find(w=>w.id===selectedWire)||null;
  const component=selectedPart?PARTS[selectedPart]:selectedPin?PARTS[selectedPin.id]:null;
  const heroStatus=tab==='principle'?OPERATING_FLOW[flowIndex].status:'Sẵn sàng hỗ trợ';
  const noteCount=WIRES.filter(w=>Boolean(w.warning)).length;
  const activeGroups=tab==='steps'?currentStep.groups:groups;
  const webgl=canWebGL&&!prefer2D;

  const selectPart=useCallback((id:ComponentId)=>{
    setSelectedPart(id);setSelectedWire(null);setSelectedPin(null);
    if(window.innerWidth<=850)setMobilePanel(true);
    setFocusSerial(n=>n+1);
  },[]);
  const selectWire=useCallback((id:string)=>{
    setSelectedWire(id);setSelectedPart(null);setSelectedPin(null);setTab('wiring');setMobilePanel(true);
    setFocusSerial(n=>n+1);
  },[]);
  const selectPin=useCallback((id:ComponentId,pin:PinId)=>{
    setSelectedPin({id,pin});setSelectedPart(null);setSelectedWire(null);setTab('wiring');setMobilePanel(true);
    setFocusSerial(n=>n+1);
  },[]);
  const clearSelection=useCallback(()=>{setSelectedPart(null);setSelectedWire(null);setSelectedPin(null);},[]);
  const activatePreset=useCallback((which:Preset)=>{
    clearSelection();setPreset(which);setFocusSerial(n=>n+1);
    if(which==='exploded'){setExplode(100);} else if(which==='front'){setExplode(0);} else if(which==='overview'){setExplode(43);}
  },[clearSelection]);
  function changeTab(which:Tab){
    setTab(which);setMobilePanel(true);setMenuOpen(false);
    if(which==='steps'){setExplode(90);setPreset('exploded');clearSelection();}
    if(which==='wiring'){setExplode(Math.max(60,explode));setPreset('exploded');}
    if(which==='principle'){setExplode(25);setPreset('overview');clearSelection();setFlow(true);}
  }
  function chooseStep(n:number){
    const next=Math.max(0,Math.min(ASSEMBLY_STEPS.length-1,n));setStep(next);clearSelection();
    setPreset(next===2?'pins':next===3?'tft':next===4||next===5?'audio':'exploded');
    setExplode(85);setFocusSerial(i=>i+1);
  }
  const setFullscreen=()=>{
    if(document.fullscreenElement){void document.exitFullscreen();return;}
    void document.documentElement.requestFullscreen?.().catch(()=>{});
  };
  useEffect(()=>{
    if(!stepPlaying || tab!=='steps')return;
    const handle=window.setInterval(()=>setStep(v=>{if(v===ASSEMBLY_STEPS.length-1){setStepPlaying(false);return v;}return v+1;}),5200);
    return ()=>window.clearInterval(handle);
  },[stepPlaying,tab]);
  useEffect(()=>{
    if(!stepPlaying || tab!=='steps')return;
    setPreset(step===2?'pins':step===3?'tft':step===4||step===5?'audio':'exploded');
    setFocusSerial(n=>n+1);
  },[step,stepPlaying,tab]);
  useEffect(()=>{
    if(!flowPlaying || tab!=='principle')return;
    const handle=window.setInterval(()=>setFlowIndex(v=>(v+1)%OPERATING_FLOW.length),3200);
    return ()=>window.clearInterval(handle);
  },[flowPlaying,tab]);
  useEffect(()=>{
    function key(e:KeyboardEvent){
      const t=e.target as HTMLElement|null;
      if(t?.matches('input,textarea,select,[contenteditable=true]'))return;
      if(e.key>='1'&&e.key<='7'){activatePreset(PRESETS[Number(e.key)-1].id);e.preventDefault();}
      else if(e.key.toLowerCase()==='r'){activatePreset('overview');e.preventDefault();}
      else if(e.key.toLowerCase()==='p'){if(!onToggleSidebar){setPresent(v=>!v);e.preventDefault();}}
      else if(e.key===' '){setExplode(v=>v>45?0:100);e.preventDefault();}
      else if(e.key==='Escape'){setPresent(false);setMenuOpen(false);clearSelection();}
    }
    window.addEventListener('keydown',key);return ()=>window.removeEventListener('keydown',key);
  },[activatePreset,clearSelection,onToggleSidebar]);
  const pitch=useMemo(()=>{
    if(focusWire)return `${focusWire.label}. ${focusWire.explanation}`;
    if(component)return component.pitch;
    if(tab==='steps')return currentStep.pitch;
    if(tab==='principle')return OPERATING_FLOW[flowIndex].pitch;
    return 'VisionBot biến thông tin hình ảnh và giọng nói thành phản hồi âm thanh, hỗ trợ học tập và nhận biết môi trường.';
  },[focusWire,component,tab,currentStep.pitch,flowIndex]);
  const selectedPinWires=selectedPin?WIRES.filter(w=>w.from.component===selectedPin.id&&w.from.pin===selectedPin.pin||w.to.component===selectedPin.id&&w.to.pin===selectedPin.pin):[];
  const connected=selectedPart?getConnectedWires(selectedPart):[];
  const selectedHeader=selectedPin?.id==='esp32'?getPinHeaderNo(selectedPin.pin):undefined;
  const totalCheck=currentStep.checks.filter((_,i)=>checked[`${step}-${i}`]).length;

  return <div className={`app-root ${dark?'theme-dark':'theme-light'} ${present?'present-mode':''} ${sidebarCollapsed?'workbench-sidebar-collapsed':''}`}>
    <header className="main-header">
      <div className="brand-mark"><span className="brand-icon"><Cpu size={24}/><span className="eye-dot"/></span>
        <div className="brand-text"><strong>VISION<span>BOT</span><em> 3D</em></strong><small>PHÒNG THÍ NGHIỆM KHKT • STEM</small></div>
      </div>
      <nav className="header-tabs" aria-label="Các chức năng chính">
        {TABS.map(({id,title,icon:Icon})=><button type="button" className={tab===id?'active':''} key={id} onClick={()=>changeTab(id)}><Icon size={16}/>{title}</button>)}
      </nav>
      <div className="header-actions">
        <span className="sim-label"><span/> MÔ PHỎNG</span>
        <button className="icon-button" title={dark?'Giao diện sáng':'Giao diện tối'} onClick={()=>setDark(v=>!v)}>{dark?<Sun size={18}/>:<Moon size={18}/>}</button>
        <button className="icon-button" title="Cảnh báo an toàn" onClick={()=>setShowWarnings(v=>!v)}><ShieldAlert size={19}/>{noteCount>0&&<i/>}</button>
        <button className="icon-button mobile-menu" title="Mở menu" onClick={()=>setMenuOpen(v=>!v)}><Menu size={20}/></button>
      </div>
    </header>
    {menuOpen&&<div className="mobile-drawer"><div className="drawer-title">Điều hướng <button onClick={()=>setMenuOpen(false)}><X size={20}/></button></div>
      {TABS.map(({id,title,icon:Icon})=><button className={tab===id?'active':''} onClick={()=>changeTab(id)} key={id}><Icon size={17}/>{title}</button>)}
    </div>}
    <main className="workspace">
      <section className="viewport-pane" aria-label="Vùng mô hình 3D tương tác">
        <div className="viewport-heading"><div><span className="eyebrow">KHÔNG GIAN MÔ PHỎNG 3D</span><h1>Khám phá bên trong <span>VisionBot</span></h1></div>
          <div className="view-pill"><CircleDot size={14}/> {webgl?'WEBGL • THỜI GIAN THỰC':'SƠ ĐỒ 2D'}</div></div>
        <div className="canvas-stage">
          {webgl?<VisionScene explode={explode/100} xray={xray} selectedPart={selectedPart} selectedWire={selectedWire}
            selectedPin={selectedPin} activeGroups={activeGroups} showWires={visibleWires} showFlow={flow}
            autoRotate={autoRotate} preset={preset} focusSerial={focusSerial} status={heroStatus} dark={dark}
            onSelectPart={selectPart} onSelectWire={selectWire} onPinSelect={selectPin} onBackground={clearSelection}/>:
            <Circuit2D onPart={selectPart} onWire={selectWire} groups={activeGroups}/>}
        </div>
        <div className="scene-toolbar-docked">
          <div className="stage-topbar">
            <div className="stage-breadcrumb"><Box size={14}/> VISIONBOT / {tab==='wiring'?'ĐẤU NỐI':tab==='steps'?'QUY TRÌNH':tab==='firmware'?'FIRMWARE':tab==='principle'?'NGUYÊN LÝ':'CẤU TRÚC'}</div>
            <div className="stage-top-actions">
              {onOpenTV&&<button onClick={onOpenTV} className="tv-launch-button" title="Trình chiếu toàn màn hình trên TV hoặc laptop"><Maximize2 size={16}/> TRÌNH CHIẾU TV</button>}
              <button onClick={()=>setPrefer2D(v=>!v)} title="Chuyển mô hình 3D / sơ đồ 2D"><CircuitBoard size={16}/>{webgl?'2D':'3D'}</button>
              
              <button onClick={setFullscreen} title="Toàn màn hình"><Fullscreen size={16}/></button>
            </div>
          </div>
          <div className="quick-presets" aria-label="Góc nhìn nhanh">
            {PRESETS.map(v=><button key={v.id} className={preset===v.id?'active':''} title={`Phím ${v.no}`} onClick={()=>activatePreset(v.id)}><b>{v.no}</b>{v.label}</button>)}
          </div>
          <div className="stage-hint"><MousePointer2 size={13}/> Kéo để xoay <span>•</span> Cuộn để zoom <span>•</span> Chọn linh kiện/dây để xem chi tiết</div>
        </div>
        <div className="viewer-controls"><button className="sidebar-dock-toggle" onClick={()=>onToggleSidebar?.()} title="Thu gọn/mở bảng thông tin">{sidebarCollapsed?'Mở bảng thông tin':'Thu gọn bảng thông tin'}</button>
          <div className="explode-control"><Layers3 size={18}/><label htmlFor="explode"><b>Tách lớp</b><small>{explode}%</small></label>
            <input id="explode" type="range" min="0" max="100" step="1" value={explode}
              onChange={e=>setExplode(Number(e.target.value))} style={{'--value':`${explode}%`} as CSSProperties}/>
            <button className="controller-tiny" onClick={()=>setExplode(0)} title="Ghép lại">0%</button><button className="controller-tiny" onClick={()=>setExplode(100)} title="Tách tối đa">100%</button>
          </div>
          <div className="viewer-toggle-row">
            <button className={`toggle-pill ${xray?'on':''}`} onClick={()=>setXray(v=>!v)}>{xray?<Eye size={16}/>:<EyeOff size={16}/>} Xuyên thấu</button>
            <button className={`toggle-pill ${visibleWires?'on':''}`} onClick={()=>setVisibleWires(v=>!v)}><Cable size={16}/> Hiện dây</button>
            <button className={`toggle-pill ${flow?'on':''}`} onClick={()=>setFlow(v=>!v)}><Sparkles size={16}/> Dòng tín hiệu</button>
            <button className={`toggle-pill ${autoRotate?'on':''}`} onClick={()=>setAutoRotate(v=>!v)}><Rotate3d size={16}/> Tự xoay</button>
            <button className="icon-button reset-view" title="Về góc nhìn đầu" onClick={()=>activatePreset('overview')}><RotateCcw size={17}/></button>
          </div>
        </div>
        <div className="bottom-notice"><AlertCircle size={16}/><span>Mô phỏng 3D minh họa kỹ thuật – Cấu hình GPIO đề xuất, cần đối chiếu kích thước linh kiện và firmware thực tế.</span></div>
      </section>
      <aside className={`side-panel ${sidebarCollapsed?'sidebar-hidden':''} ${mobilePanel?'mobile-open':''}`}>
        <div className="side-handle" onClick={()=>setMobilePanel(v=>!v)}><span/><b>{TABS.find(t=>t.id===tab)?.title}</b><ChevronDown size={15}/></div>
        <div className="side-scroll">
          <div className="stage-info-card"><span className="info-orb"><Sparkles size={17}/></span><div>
            <strong>{focusWire?'Đường dây được chọn':component?component.title:tab==='steps'?`BƯỚC ${step+1} / 7`:'GỢI Ý THUYẾT TRÌNH'}</strong>
            <p>{pitch}</p>
          </div>{(component||focusWire)&&<button className="close-mini" aria-label="Bỏ chọn" onClick={clearSelection}><X size={17}/></button>}</div>

          {tab==='structure'&&<>
            <span className="section-eyebrow">KHÁM PHÁ BÊN TRONG</span><h2 className="side-title">Cấu tạo VisionBot</h2>
            <p className="side-description">Chọn một bộ phận để tự động xoay và phóng to mô hình, đồng thời nghe gợi ý thuyết trình.</p>
            <div className="stats-bar"><div><b>14</b><span>Thành phần</span></div><div><b>7</b><span>Bước lắp</span></div><div><b>{WIRES.length}</b><span>Dây nguồn/tín hiệu</span></div></div>
            <div className="part-list">{PART_DISPLAY.map(id=>{const item=PARTS[id];const Icon=getPartIcon(id);return <button key={id} onClick={()=>{selectPart(id);setMobilePanel(false);}} className={`part-row ${selectedPart===id?'active':''}`}>
              <span className="part-icon" style={{color:item.accent,background:item.accent+'17'}}><Icon size={20}/></span>
              <span className="part-description"><b>{item.title}</b><small>{item.subtitle}</small></span><ArrowRight size={15} className="part-arrow"/></button>;})}</div>
            <div className="side-box"><h3><HelpCircle size={17}/> Ứng dụng thực tế</h3><p>VisionBot hỗ trợ mô tả cảnh, đọc chữ và giao tiếp bằng giọng nói. Dữ liệu được gửi qua Wi-Fi để xử lý AI; không thể đảm bảo cảnh báo nguy hiểm tức thời.</p></div>
          </>}
          {tab==='wiring'&&<>
            <span className="section-eyebrow">SINGLE SOURCE OF TRUTH</span><h2 className="side-title">Bảng đấu nối điện</h2>
            <p className="side-description">Mọi chân, đường dây và nhãn trong 3D dùng dữ liệu chung từ <code>src/data/circuitData.ts</code>.</p>
            <div className="warning-strip"><AlertTriangle size={18}/><span>GPIO38/39/40 đang được dùng cho nút và I2S: <strong>KHÔNG dùng thẻ microSD.</strong></span></div>
            <div className="group-filter-title"><b>Lọc nhóm kết nối</b><button onClick={()=>setGroups(null)}>{groups?'Hiện tất cả':'Đang hiện tất cả'}</button></div>
            <div className="group-filter">{(Object.keys(WIRE_GROUPS) as WireGroup[]).map(key=>{
              const grp=WIRE_GROUPS[key];const on=!groups||groups.includes(key);return <button key={key} className={!on?'muted':'active'}
                onClick={()=>setGroups(current=> current===null?[key]: current.includes(key)?(current.length===1?null:current.filter(x=>x!==key)):[...current,key])}
                style={{'--wire-color':grp.color} as CSSProperties}><span/>{grp.label}</button>;})}</div>
            {selectedPin&&<div className="selected-detail"><div className="selected-kicker">CHÂN ĐÃ CHỌN <button onClick={clearSelection}><X size={14}/></button></div>
              <h3>{PARTS[selectedPin.id].title} • {selectedPin.pin}</h3>
              {selectedHeader!==undefined&&<p>Vị trí chân trên board: Header <b>{selectedHeader}</b> · {HEADER_BY_NAME[selectedPin.pin].side==='L'?'hàng trái':'hàng phải'}.</p>}
              {selectedPinWires.length?<div className="selection-connections">{selectedPinWires.map(w=><button onClick={()=>selectWire(w.id)} key={w.id}><WiringBadge group={w.group}/><b>{w.label}</b><small>{w.explanation}</small></button>)}</div>:<p>Chân này chưa có dây trong cấu hình đấu nối đề xuất.</p>}
            </div>}
            {focusWire&&<div className="selected-detail"><div className="selected-kicker">DÂY {focusWire.id} <button onClick={clearSelection}><X size={14}/></button></div>
              <WiringBadge group={focusWire.group}/><h3>{focusWire.label}</h3><p>{focusWire.explanation}</p>
              <div className="wire-ends"><div><small>TỪ</small><strong>{PARTS[focusWire.from.component].title}</strong><code>{focusWire.from.pin}</code></div><ArrowRight size={18}/>
                <div><small>ĐẾN</small><strong>{PARTS[focusWire.to.component].title}</strong><code>{focusWire.to.pin}</code></div></div>
              {focusWire.warning&&<div className="red-warning"><ShieldAlert size={16}/>{focusWire.warning}</div>}
            </div>}
            <div className="wires-list">
              {WIRES.filter(w=>!groups||groups.includes(w.group)).map(w=><button key={w.id} onClick={()=>selectWire(w.id)} className={`wire-row ${selectedWire===w.id?'active':''}`}>
                <span className="wire-id" style={{borderColor:w.color,color:w.color}}>{w.id}</span><span className="wire-description"><b>{w.label}</b>
                <small>{PARTS[w.from.component].title} ({w.from.pin}) → {PARTS[w.to.component].title} ({w.to.pin})</small></span>{w.warning&&<AlertTriangle size={16} className="wire-warn"/>}</button>)}
            </div>
          </>}
          {tab==='steps'&&<>
            <span className="section-eyebrow">THỰC HÀNH TỪNG BƯỚC</span><h2 className="side-title">Lắp ráp VisionBot</h2>
            <p className="side-description">Chọn bước để mô hình xoay đúng cụm linh kiện và chỉ hiện nhóm dây cần lắp.</p>
            <div className="step-progress"><div><b>Bước {step+1} <span>/ 7</span></b><span>{Math.round((step+1)/7*100)}%</span></div><div className="progress-track"><span style={{width:`${(step+1)/7*100}%`}}/></div></div>
            <div className="step-timeline">{ASSEMBLY_STEPS.map((s,i)=><button key={s.id} onClick={()=>chooseStep(i)} className={i===step?'current':i<step?'passed':''}>
              <span className="step-no">{i<step?<Check size={14}/>:s.id}</span><span><b>{s.title}</b><small>{s.subtitle}</small></span></button>)}</div>
            <div className="step-description"><div className="selected-kicker">HƯỚNG DẪN BƯỚC {currentStep.id}</div><h3>{currentStep.title}</h3>
              <p>{currentStep.explanation}</p>
              <div className="step-related"><small>Linh kiện liên quan</small><div>{currentStep.partIds.map(id=><button key={id} onClick={()=>selectPart(id)}>{PARTS[id].title}</button>)}</div></div>
              <div className="step-checks"><b>Kiểm tra trước khi tiếp tục <small>{totalCheck}/{currentStep.checks.length}</small></b>
                {currentStep.checks.map((s,i)=><label key={i}><input type="checkbox" checked={Boolean(checked[`${step}-${i}`])} onChange={e=>setChecked(old=>({...old,[`${step}-${i}`]:e.target.checked}))}/><span>{s}</span></label>)}
              </div>
            </div>
            <div className="step-actions"><button onClick={()=>chooseStep(step-1)} disabled={step===0}><ArrowLeft size={16}/> Trước</button>
              <button className={stepPlaying?'stop-step':''} onClick={()=>setStepPlaying(v=>!v)}>{stepPlaying?<Pause size={16}/>:<Play size={16}/>} {stepPlaying?'Tạm dừng':'Tự chạy'}</button>
              <button onClick={()=>chooseStep(step+1)} disabled={step===6}>Tiếp <ArrowRight size={16}/></button></div>
          </>}
          {tab==='principle'&&<>
            <span className="section-eyebrow">QUY TRÌNH DỮ LIỆU</span><h2 className="side-title">VisionBot hoạt động thế nào?</h2>
            <p className="side-description">Mô phỏng luồng thông tin từ người dùng tới xử lý AI trên mạng và phát kết quả. <b>Không gửi dữ liệu thực.</b></p>
            <div className="flow-demo">{OPERATING_FLOW.map((s,i)=>{const Icon=s.icon;return <button key={i} className={flowIndex===i?'active':flowIndex>i?'passed':''} onClick={()=>setFlowIndex(i)}>
              <span className="flow-num">{i+1}</span><span className="flow-icon"><Icon size={19}/></span><span><b>{s.title}</b><small>{s.subtitle}</small></span>{flowIndex===i&&<span className="flow-pulse"/>}</button>;})}</div>
            <div className="flow-current"><Sparkles size={18}/><div><b>{OPERATING_FLOW[flowIndex].status}</b><p>{OPERATING_FLOW[flowIndex].pitch}</p></div></div>
            <button className="primary-button" onClick={()=>{setFlowPlaying(v=>!v);setFlow(true);}}>{flowPlaying?<Pause size={17}/>:<Play size={17}/>} {flowPlaying?'Tạm dừng mô phỏng':'Chạy mô phỏng luồng dữ liệu'}</button>
            <div className="side-box"><h3><AlertTriangle size={17}/> Giới hạn quan trọng</h3><p>Mô phỏng AI không phải hệ thống đo khoảng cách thời gian thực. Không sử dụng riêng VisionBot như thiết bị đảm bảo tránh vật cản khi đi đường.</p></div>
          </>}
          {tab==='firmware'&&<FirmwarePanel onPin={selectPin}/>}
          {component&&tab==='structure'&&<div className="selected-detail part-selected"><div className="selected-kicker">ĐANG QUAN SÁT <button onClick={clearSelection}><X size={15}/></button></div>
            <h3>{component.title}</h3><p>{component.explanation}</p><div className="voltage-line"><Power size={15}/> {component.voltage}</div>
            {connected.length>0&&<button className="inline-link" onClick={()=>changeTab('wiring')}><Cable size={15}/> Xem {connected.length} dây liên quan <ArrowRight size={14}/></button>}
          </div>}
        </div>
      </aside>
    </main>
    {sidebarCollapsed&&<div className="workbench-inline-status"><Cable size={16}/><strong>{focusWire?`${focusWire.from.component} / ${focusWire.from.pin} → ${focusWire.to.component} / ${focusWire.to.pin}`:component?.title||'Chọn linh kiện hoặc dây để xem thông tin'}</strong><span>{focusWire?.warning||pitch}</span><button onClick={()=>onToggleSidebar?.()}>Xem chi tiết</button></div>}
    <footer className="main-footer"><span><Accessibility size={14}/> VISIONBOT STEM LAB • KHKT</span><span>Đấu nối theo cấu hình đề xuất • Không thay thế kiểm tra điện thực tế</span><button onClick={()=>setShowWarnings(true)}><ShieldAlert size={14}/> An toàn nguồn & GPIO</button></footer>
    {showWarnings&&<div className="modal-backdrop" onMouseDown={()=>setShowWarnings(false)}>
      <div role="dialog" aria-modal="true" aria-label="Cảnh báo an toàn khi đấu nối" className="warning-modal" onMouseDown={e=>e.stopPropagation()}>
        <div className="modal-heading"><span><ShieldAlert size={21}/> Cảnh báo an toàn mạch điện</span><button onClick={()=>setShowWarnings(false)}><X size={19}/></button></div>
        <p>Bản mô phỏng phản ánh <b>phương án GPIO đề xuất</b> trong đặc tả, không xác nhận bo mạch đã hàn đúng hoặc firmware đã dùng đúng chân.</p>
        {SAFETY_WARNINGS.map((s,i)=><div className="safety-line" key={i}><span>{i+1}</span><p>{s}</p></div>)}
        <div className="danger-footnote"><AlertTriangle size={17}/> Chỉ đấu thật sau khi đã đo 5V/3V3, xác minh pinout và có người am hiểu điện tử kiểm tra.</div>
        <button className="primary-button" onClick={()=>setShowWarnings(false)}><Check size={17}/> Đã đọc cảnh báo</button>
      </div>
    </div>}
    {present&&<div className="presentation-overlay"><div><span className="present-label">TRÌNH CHIẾU • VISIONBOT 3D</span><h2>{component?.title || focusWire?.label || (tab==='steps' ? currentStep.title : 'Cấu trúc mô phỏng')}</h2><p>{pitch}</p></div>
      <div className="present-action"><button onClick={()=>setPresent(false)}><X size={18}/> Thoát trình chiếu (P)</button></div></div>}
  </div>;
}
