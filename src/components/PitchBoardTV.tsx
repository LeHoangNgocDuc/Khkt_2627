import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  ArrowLeft, ArrowRight, Cable, ChevronDown, ChevronUp, Clock3, Cpu, Eye,
  EyeOff, List, Maximize2, Minus, Pause, Play, Plus,
  RotateCcw, ShieldAlert, X, type LucideIcon,
} from 'lucide-react';
import { Circuit2D } from './Circuit2D';
import { SchoolIdentity } from './SchoolIdentity';
import { PresentationPanel } from './PresentationPanel';
import { PRESENTATION_SLIDES } from '../data/presentationData';
import { CAMPUS_NAME, PROJECT_NAME, SCHOOL_NAME } from '../data/identity';
import {
  PARTS, WIRES, WIRE_GROUPS, getPinHeaderNo,
  type ComponentId, type WireGroup, type WireSpec,
} from '../data/circuitData';
import { VisionScene, type Preset } from '../scene/VisionScene';
import { supportsWebGL } from '../utils/webgl';

const GROUPS: { id: WireGroup; short: string; icon: LucideIcon; preset: Preset }[] = [
  { id: 'man-hinh', short: 'TFT / SPI', icon: Eye, preset: 'tft' },
  { id: 'micro', short: 'MIC / I2S', icon: Cpu, preset: 'audio' },
  { id: 'am-thanh', short: 'LOA / I2S', icon: Cpu, preset: 'audio' },
  { id: 'nguon', short: 'PIN / 5V', icon: ShieldAlert, preset: 'power' },
  { id: 'nut-bam', short: 'NÚT NHẤN', icon: Cable, preset: 'pins' },
];

function pinText(which: { component: ComponentId; pin: string }) {
  const no = which.component === 'esp32' ? getPinHeaderNo(which.pin) : undefined;
  return { device: PARTS[which.component].title, pin: which.pin, header: no };
}
function formatTime(total: number) {
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function WireCard({wire, active, onClick}: {wire: WireSpec; active: boolean; onClick: () => void}) {
  const from=pinText(wire.from), to=pinText(wire.to);
  return <button type="button" className={`tv-wire-item ${active?'active':''}`} onClick={onClick}>
    <span className="tv-wire-id" style={{background:wire.color}}>{wire.id}</span>
    <span className="tv-wire-ends-mini"><strong>{from.pin}</strong><ArrowRight size={16}/><strong>{to.pin}</strong>
      <small>{from.device} → {to.device}</small></span>
  </button>;
}

export function PitchBoardTV({dark, onExit}:{dark:boolean;onExit:()=>void}) {
  const [slide,setSlide]=useState(0);
  const [seconds,setSeconds]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [isTV,setIsTV]=useState(true);
  const [notesOpen,setNotesOpen]=useState(false);
  const [teleprompter,setTeleprompter]=useState(false);
  const [prefer2D,setPrefer2D]=useState(false);
  const [showShell,setShowShell]=useState(true);
  const [explodedOverride,setExplodedOverride]=useState<number|null>(null);
  const [selectedPart,setSelectedPart]=useState<ComponentId|null>(null);
  const [focusSerial,setFocusSerial]=useState(0);
  const [group,setGroup]=useState<WireGroup>('man-hinh');
  const [wireId,setWireId]=useState<string|null>(null);
  const [presetOverride,setPresetOverride]=useState<Preset|null>(null);
  const [zoom,setZoom]=useState(1);
  const [showSafety,setShowSafety]=useState(false);

  const current=PRESENTATION_SLIDES[slide];
  const wiringMode=slide===3 || slide===4;
  const filtered=useMemo(()=>WIRES.filter(w=>w.group===group),[group]);
  const chosenWire=useMemo(()=>WIRES.find(w=>w.id===wireId)??null,[wireId]);
  const firstWire=filtered[0]??null;
  const wire=chosenWire&&chosenWire.group===group?chosenWire:firstWire;
  const scenePreset=presetOverride??(wiringMode?GROUPS.find(g=>g.id===group)?.preset??'exploded':current.preset);
  const show2D=prefer2D || !supportsWebGL();
  const sceneExplode=(explodedOverride??current.explode)/100;
  const stageZoom=zoom*(wiringMode||selectedPart?1:slide===1?1.38:1.10);
  const scenePart=selectedPart??(!wiringMode?current.part??null:null);
  const sceneGroups=wiringMode?[group]:null;
  const sceneWire=wiringMode&&!selectedPart?wire?.id??null:null;

  const go=useCallback((n:number)=>{
    const idx=Math.max(0,Math.min(6,n));
    setSlide(idx);
    setGroup(idx===4?'nguon':'man-hinh');
    setWireId(null);setSelectedPart(null);setExplodedOverride(null);
    setPresetOverride(null);setZoom(1);setFocusSerial(x=>x+1);
    setShowSafety(false);
    setShowShell(!(idx===3||idx===4));
  },[]);
  const chooseGroup=useCallback((g:WireGroup)=>{
    setGroup(g);setWireId(null);setSelectedPart(null);
    setFocusSerial(x=>x+1);
    setPresetOverride(null);
  },[]);
  const focusWire=useCallback((id:string)=>{
    setWireId(id);setSelectedPart(null);setFocusSerial(x=>x+1);
  },[]);
  const focusPart=useCallback((id:ComponentId)=>{
    setSelectedPart(id);setWireId(null);setFocusSerial(x=>x+1);
  },[]);
  const changeZoom=(delta:number)=>{
    setZoom(v=>Math.min(1.8,Math.max(.72,Math.round((v+delta)*100)/100)));
    setFocusSerial(x=>x+1);
  };
  const toggleFullscreen=()=>{
    if(document.fullscreenElement){void document.exitFullscreen();}
    else{void document.documentElement.requestFullscreen?.().catch(()=>{});}
  };
  useEffect(()=>{
    if(!playing)return;
    const id=window.setInterval(()=>setSeconds(s=>s+1),1000);
    return ()=>window.clearInterval(id);
  },[playing]);
  useEffect(()=>{
    function onKey(e:KeyboardEvent){
      const t=e.target as HTMLElement|null;
      if(t?.matches('input,textarea,select,[contenteditable="true"]'))return;
      if(e.key==='ArrowRight'){go(slide+1);e.preventDefault();}
      else if(e.key==='ArrowLeft'){go(slide-1);e.preventDefault();}
      else if(/^[1-7]$/.test(e.key)){go(Number(e.key)-1);e.preventDefault();}
      else if(e.key===' '){setExplodedOverride(v=>(v??current.explode)>45?0:100);e.preventDefault();}
      else if(e.key.toLowerCase()==='r'){setZoom(1);setSelectedPart(null);setWireId(null);setPresetOverride(null);setFocusSerial(n=>n+1);e.preventDefault();}
      else if(e.key.toLowerCase()==='p'){toggleFullscreen();e.preventDefault();}
      else if(e.key==='+'||e.key==='='){changeZoom(.15);e.preventDefault();}
      else if(e.key==='-'){changeZoom(-.15);e.preventDefault();}
      else if(e.key===']' && wiringMode){
        const at=filtered.findIndex(w=>w.id===wire?.id);
        focusWire(filtered[(at+1)%filtered.length]?.id??''); e.preventDefault();
      }else if(e.key==='[' && wiringMode){
        const at=filtered.findIndex(w=>w.id===wire?.id);
        focusWire(filtered[(at-1+filtered.length)%filtered.length]?.id??''); e.preventDefault();
      }else if(e.key==='Escape'){
        setNotesOpen(false);setShowSafety(false);
      }
    }
    window.addEventListener('keydown',onKey);
    return ()=>window.removeEventListener('keydown',onKey);
  },[go,slide,current.explode,wiringMode,filtered,wire,focusWire]);

  const from=wire?pinText(wire.from):null;
  const to=wire?pinText(wire.to):null;
  const exitPresentation=()=>{
    if(document.fullscreenElement){void document.exitFullscreen().catch(()=>{});}
    onExit();
  };
  const handleOnPin=(id:ComponentId,pin:string)=>{
    const match=WIRES.find(w=>w.group===group &&
      ((w.from.component===id && w.from.pin===pin)||(w.to.component===id && w.to.pin===pin)));
    if(match)focusWire(match.id); else focusPart(id);
  };
  const handleOnWire=(id:string)=>{
    const w=WIRES.find(item=>item.id===id);
    if(w){setGroup(w.group);focusWire(id);}
  };
  return <section className={`presentation-zone tv-pitch ${isTV?'tv-stage-active':'tv-page-mode'}`}>
    <div className="tv-top">
      <div className="tv-brand"><SchoolIdentity compact/><div>
        <strong>VISIONBOT <span>3D</span></strong><small>{SCHOOL_NAME} • {CAMPUS_NAME}</small>
      </div></div>
      <div className="tv-step-heading"><span>PHẦN {slide+1} / 7</span><strong>{current.title}</strong></div>
      <div className="tv-top-actions">
        <button type="button" title="Hiện bảng nhắc lời và phản biện" onClick={()=>setNotesOpen(o=>!o)} className={notesOpen?'on':''}><List size={19}/><span>Ghi chú</span></button>
        <button type="button" title="Chuyển bố cục trình chiếu TV" onClick={()=>setIsTV(v=>!v)}><Eye size={19}/><span>{isTV?'Thu nhỏ':'TV lớn'}</span></button>
        <button type="button" title="Toàn màn hình (P)" onClick={toggleFullscreen}><Maximize2 size={19}/><span>Toàn màn</span></button>
        <button type="button" className="tv-exit" onClick={exitPresentation}><X size={21}/><span>Thoát</span></button>
      </div>
    </div>

    <div className={`tv-main ${wiringMode?'tv-is-wiring':''}`}>
      <div className="tv-visual">
        <div className="tv-render" aria-label="Mô hình cấu tạo VisionBot và dây đấu nối">
          {show2D?<Circuit2D onPart={focusPart} onWire={handleOnWire} groups={sceneGroups}/>:
            <VisionScene explode={sceneExplode} xray={!showShell} selectedPart={scenePart}
              selectedWire={sceneWire} selectedPin={null} activeGroups={sceneGroups}
              showWires={wiringMode} showFlow={slide===5} autoRotate={false}
              preset={scenePreset} focusSerial={focusSerial} zoomLevel={stageZoom} projection
              status={slide===5?'Đang truyền dữ liệu AI...':'VisionBot - Sẵn sàng'} dark={isTV||dark}
              onSelectPart={focusPart} onSelectWire={handleOnWire}
              onPinSelect={handleOnPin} onBackground={()=>{setSelectedPart(null);}}/>}
        </div>
        <div className="tv-render-controls">          <div className="tv-canvas-mark">{show2D?'SƠ ĐỒ 2D':'MÔ HÌNH 3D'} <b>• MINH HỌA KỸ THUẬT</b></div>
          <div className="tv-zoom-toolbar" aria-label="Điều khiển góc nhìn">
            <button onClick={()=>changeZoom(.15)} title="Phóng to (+)"><Plus size={21}/></button>
            <button onClick={()=>changeZoom(-.15)} title="Thu nhỏ (-)"><Minus size={21}/></button>
            <button onClick={()=>{setZoom(1);setPresetOverride(null);setSelectedPart(null);setWireId(null);setFocusSerial(n=>n+1);}} title="Khôi phục góc nhìn (R)"><RotateCcw size={20}/></button>
            <button onClick={()=>setPrefer2D(v=>!v)} title="Chuyển 3D/2D">{show2D?'3D':'2D'}</button>
          </div>
          <div className="tv-visual-bottom-actions">
            <button onClick={()=>setExplodedOverride(v=>(v??current.explode)>45?0:100)}><ChevronDown size={18}/> {sceneExplode>.45?'Ghép vỏ':'Tách lớp'}</button>
            <button onClick={()=>setShowShell(v=>!v)}>{showShell?<Eye size={17}/>:<EyeOff size={17}/>} {showShell?'Xuyên thấu':'Hiện vỏ'}</button>
            <button onClick={()=>setPresetOverride('overview')}><Cpu size={17}/> Toàn cảnh</button>
            <button onClick={()=>setPresetOverride('pins')}>Soi GPIO</button>
          </div>
        </div>
        {wiringMode&&<div className="tv-connection-ribbon">
          <div className="tv-connect-head"><span className="tv-route-identifier" style={{borderColor:wire?.color}}>{wire?.id}</span>
            <div><small>ĐƯỜNG NỐI ĐANG ĐƯỢC LÀM SÁNG</small><b>{wire?.label}</b></div></div>
          {from&&to&&<div className="tv-route-pair">
            <div><span>TỪ THIẾT BỊ</span><strong>{from.device}</strong><b>{from.pin}</b>{from.header&&<small>Header số {from.header}</small>}</div>
            <ArrowRight size={34} className="tv-route-arrow"/>
            <div><span>ĐẾN THIẾT BỊ</span><strong>{to.device}</strong><b>{to.pin}</b>{to.header&&<small>Header số {to.header}</small>}</div>
          </div>}
          <p>{wire?.explanation}</p>
          {wire?.warning&&<div className="tv-specific-warning"><ShieldAlert size={17}/>{wire.warning}</div>}
        </div>}
      </div>
      {wiringMode&&!notesOpen&&<aside className="tv-wire-panel" aria-label="Bảng dây nối phóng to">
        <div className="tv-wire-panel-heading"><span>PHÒNG SOI CHÂN GPIO</span><strong>ĐẤU NỐI TỪNG DÂY</strong><small>Chọn một nhóm, sau đó chọn sợi dây. Mô hình 3D sẽ làm sáng đúng đường nối.</small></div>
        <div className="tv-groups">{GROUPS.map(item=>{const Icon=item.icon;return <button key={item.id} onClick={()=>chooseGroup(item.id)} className={group===item.id?'active':''} style={{'--grp-color':WIRE_GROUPS[item.id].color} as CSSProperties}><Icon size={16}/>{item.short}</button>;})}</div>
        <div className="tv-wires-heading"><b>{WIRE_GROUPS[group].label.toUpperCase()}</b><span>{filtered.length} dây</span></div>
        <div className="tv-wire-list">{filtered.map(item=><WireCard key={item.id} wire={item} active={wire?.id===item.id} onClick={()=>focusWire(item.id)}/>)}</div>
        <div className="tv-wires-foot"><button onClick={()=>{const i=filtered.findIndex(x=>x.id===wire?.id);focusWire(filtered[(i-1+filtered.length)%filtered.length]?.id??'');}}><ArrowLeft size={16}/> Dây trước</button><button onClick={()=>{const i=filtered.findIndex(x=>x.id===wire?.id);focusWire(filtered[(i+1)%filtered.length]?.id??'');}}>Dây tiếp <ArrowRight size={16}/></button></div>
        <button className="tv-show-safety" onClick={()=>setShowSafety(v=>!v)}><ShieldAlert size={18}/> {showSafety?'Ẩn':'Xem'} 5 nguyên tắc an toàn {showSafety?<ChevronUp size={16}/>:<ChevronDown size={16}/>}</button>
        {showSafety&&<div className="tv-safety-detail"><p>Không cấp 5V vào 3V3; không nối pin trực tiếp 5V; hai cực loa không nối GND; không dùng microSD cùng GPIO38/39/40; không vừa sạc vừa chạy với TP4056 thường.</p></div>}
      </aside>}
      {!wiringMode&&!notesOpen&&<aside className="tv-summary-panel" aria-label="Thông tin thuyết trình đang trình chiếu">
        <span>BƯỚC {slide+1} – {current.subtitle}</span>
        <strong>{selectedPart?PARTS[selectedPart].title:current.title}</strong>
        <p>{selectedPart?PARTS[selectedPart].pitch:current.points.join(' • ')}</p>
        {slide===6&&<div className="tv-live-docked"><strong>LIVE DEMO</strong><span>MỜI BAN GIÁM KHẢO TRẢI NGHIỆM TRÊN VISIONBOT THẬT</span></div>}
        <div className="tv-summary-hint">Chọn trực tiếp linh kiện trên mô hình để xem giải thích.</div>
      </aside>}
      {notesOpen&&<aside className="tv-notes-drawer"><div className="tv-drawer-heading"><strong>LỜI THUYẾT TRÌNH & PHẢN BIỆN</strong><button onClick={()=>setNotesOpen(false)}><X size={19}/></button></div><PresentationPanel slide={slide} onSlide={go}
        onFocus={focusPart} onFullscreen={toggleFullscreen} seconds={seconds} playing={playing}
        onPlay={()=>setPlaying(v=>!v)} onReset={()=>{setSeconds(0);setPlaying(false);}}
        teleprompter={teleprompter} onToggleTeleprompter={()=>setTeleprompter(v=>!v)}/></aside>}
    </div>
    <div className="tv-bottom">
      <button className="tv-prev" disabled={slide===0} onClick={()=>go(slide-1)}><ArrowLeft size={20}/><span>TRƯỚC</span></button>
      <div className="tv-progress-steps">{PRESENTATION_SLIDES.map((item,i)=><button type="button" key={item.id} title={`${i+1}. ${item.title}`} className={i===slide?'active':''} onClick={()=>go(i)}><span>{i+1}</span><small>{['MỞ ĐẦU','CẤU TẠO','ESP32','ĐẤU DÂY','NGUỒN','AI CLOUD','THỰC TẾ'][i]}</small></button>)}</div>
      <div className="tv-timer"><Clock3 size={16}/><strong>{formatTime(seconds)}</strong><button onClick={()=>setPlaying(v=>!v)} title={playing?'Tạm dừng':'Bắt đầu đếm giờ'}>{playing?<Pause size={18}/>:<Play size={18}/>}</button></div>
      <button className="tv-next" disabled={slide===6} onClick={()=>go(slide+1)}><span>TIẾP</span><ArrowRight size={20}/></button>
    </div>
    <div className="tv-disclaimer">{PROJECT_NAME} • BẢN VẼ GPIO ĐỀ XUẤT, CHƯA THAY THẾ ĐỐI CHIẾU BO MẠCH VÀ FIRMWARE THẬT. <span>Phím: ← → chuyển bước · [ ] đổi dây · + − zoom · Space tách lớp · P toàn màn hình.</span></div>
  </section>;
}
