import { useEffect, useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Clock3, Maximize2, Mic, Pause, Play, RotateCcw, Volume2 } from 'lucide-react';
import { DEFENSE_QUESTIONS, PRESENTATION_SLIDES } from '../data/presentationData';
import type { ComponentId } from '../data/circuitData';
interface Props {
  slide: number;
  onSlide: (step:number)=>void;
  onFocus: (id:ComponentId)=>void;
  onFullscreen: ()=>void;
  seconds:number;
  playing:boolean;
  onPlay:()=>void;
  onReset:()=>void;
  teleprompter:boolean;
  onToggleTeleprompter:()=>void;
}
function displayTime(s:number){return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}
export function PresentationPanel({slide,onSlide,onFocus,onFullscreen,seconds,playing,onPlay,onReset,teleprompter,onToggleTeleprompter}:Props){
  const [qIndex,setQIndex]=useState<number|null>(null);
  const item=PRESENTATION_SLIDES[slide];
  useEffect(()=>setQIndex(null),[slide]);
  return <div className="presentation-panel-root">
    <div className="section-eyebrow">PHÂN KHU 07 / KỊCH BẢN 5 PHÚT</div>
    <h2 className="side-title">Thuyết trình trước BGK</h2>
    <p className="side-description">Website chỉ minh họa kỹ thuật. Bước cuối dành cho rô-bốt VisionBot thật và kết quả thử nghiệm đã được nhóm kiểm chứng.</p>
    <div className="present-clock-card"><div><span><Clock3 size={16}/> Đồng hồ 5 phút</span><strong>{displayTime(seconds)} <small>/ 05:00</small></strong></div><div className="clock-track"><span style={{width:`${Math.min(seconds/300*100,100)}%`}}/></div>
      <div className="clock-actions"><button onClick={onPlay}>{playing?<Pause size={15}/>:<Play size={15}/>} {playing?'Tạm dừng':'Bắt đầu'}</button><button onClick={onReset}><RotateCcw size={15}/> Đặt lại</button><button onClick={onFullscreen}><Maximize2 size={15}/> Toàn màn hình</button></div>
      {seconds>300&&<div className="time-overtime"><AlertTriangle size={14}/> Đã vượt mốc 5 phút – nên kết thúc phần trình bày.</div>}
    </div>
    <div className="presentation-sequence">{PRESENTATION_SLIDES.map((s,i)=><button key={s.id} className={i===slide?'active':i<slide?'done':''} onClick={()=>onSlide(i)}><span>{s.id}</span><div><b>{s.title}</b><small>{s.subtitle} · {s.duration} giây</small></div></button>)}</div>
    <div className="present-slide-note"><div className="selected-kicker">BƯỚC {slide+1}/7 · {item.duration} GIÂY</div><h3>{item.title}</h3><div className="present-points">{item.points.map(p=><p key={p}>• {p}</p>)}</div>
      <button className="text-action" onClick={onToggleTeleprompter}><Mic size={15}/>{teleprompter?'Ẩn lời thuyết trình':'Hiện bảng nhắc lời'} {teleprompter?<ChevronUp size={14}/>:<ChevronDown size={14}/>}</button>
      {teleprompter&&<blockquote className="teleprompter-card">{item.speech}</blockquote>}
      {slide===6&&<div className="live-demo-banner"><strong>LIVE DEMO</strong><span>MỜI BGK TRẢI NGHIỆM TRÊN VISIONBOT THẬT</span><p>Thực hiện lần lượt: mô tả cảnh → đọc chữ → thử hỏi một câu kiến thức. Nếu không có Internet, chỉ dùng kịch bản web để minh họa luồng thao tác.</p></div>}
    </div>
    <div className="qa-section"><div className="subheading"><Volume2 size={17}/> 10 câu hỏi phản biện BGK</div><p className="subtle-note">Nhấn câu hỏi để mở câu trả lời gợi ý; nếu liên quan linh kiện, mô hình sẽ zoom đúng vị trí.</p>
      <div className="qa-list">{DEFENSE_QUESTIONS.map((it,i)=><div key={i} className={qIndex===i?'qa-item opened':'qa-item'}><button onClick={()=>{setQIndex(qIndex===i?null:i);if(it.focus)onFocus(it.focus);}}><span className="qa-count">{String(i+1).padStart(2,'0')}</span><b>{it.q}</b>{qIndex===i?<ChevronUp size={16}/>:<ChevronDown size={16}/>}</button>{qIndex===i&&<p>{it.a}</p>}</div>)}</div>
    </div>
  </div>;
}
