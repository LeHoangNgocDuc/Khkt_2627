import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Camera, CheckCircle2, FileText, Mic, Play, Scan, Volume2, VolumeX } from 'lucide-react';
import { VisionScene } from '../scene/VisionScene';
import { Circuit2D } from './Circuit2D';
import type { ComponentId, PinId } from '../data/circuitData';
import { supportsWebGL } from '../utils/webgl';

type ScenarioId='scene'|'ocr'|'objects'|'study';
const demos:{id:ScenarioId;title:string;subtitle:string;icon:typeof Camera;prompt:string;reply:string;status:string;tags:string[]}[]=[
  {id:'scene',title:'Mô tả cảnh vật',subtitle:'Quan sát môi trường xung quanh',icon:Camera,prompt:'Trước mặt tôi có gì?',reply:'Phía trước là một góc lớp học với bảng xanh, bàn học và cửa sổ. Đây là nội dung mô phỏng của một ảnh mẫu, không phải kết quả AI trực tiếp.',status:'Đang mô tả...',tags:['Bảng xanh','Bàn học','Cửa sổ']},
  {id:'ocr',title:'Đọc chữ (OCR)',subtitle:'Tài liệu và nhãn sản phẩm',icon:FileText,prompt:'Đọc dòng chữ trên trang sách.',reply:'Bài học hôm nay: Hình tam giác. Tổng ba góc trong một tam giác bằng một trăm tám mươi độ. Đây là văn bản mẫu đã chuẩn bị sẵn, không có OCR thực.',status:'Đang đọc chữ...',tags:['Sách học','Văn bản','Toán học']},
  {id:'objects',title:'Nhận biết đồ vật',subtitle:'Hình ảnh bàn học',icon:Scan,prompt:'Trên bàn có những đồ vật gì?',reply:'Trong tranh minh họa có một cuốn sách, một chiếc bút chì, một chiếc cốc và một chiếc thước kẻ. Các khung nhận diện được dựng sẵn để giới thiệu nguyên lý.',status:'Đang nhận diện...',tags:['Sách','Bút chì','Cốc','Thước']},
  {id:'study',title:'Hỗ trợ học tập',subtitle:'Hỏi đáp kiến thức THCS',icon:BookOpen,prompt:'Hỏi: Tổng ba góc trong tam giác bằng bao nhiêu?',reply:'Tổng ba góc trong một tam giác bằng 180 độ. Ví dụ, nếu hai góc lần lượt là 50 và 60 độ thì góc còn lại bằng 70 độ.',status:'Đang giải thích...',tags:['Toán THCS','Hỏi đáp','Tiếng Việt']},
];
const answerBank:[RegExp,string][]=[
  [/tam giác|ba góc/i,'Tổng ba góc trong một tam giác bằng 180 độ.'],
  [/thales|ta-lét/i,'Định lí Thales: đường thẳng song song một cạnh của tam giác và cắt hai cạnh còn lại sẽ tạo ra những đoạn thẳng tương ứng tỉ lệ.'],
  [/bình phương|hằng đẳng thức/i,'Bình phương của một tổng: (a cộng b) bình phương bằng a bình phương cộng hai a b cộng b bình phương.'],
  [/hình vuông|diện tích/i,'Diện tích hình vuông bằng độ dài một cạnh nhân với chính nó.'],
];
interface Props {dark:boolean; onStatus:(value:string)=>void;}
function SampleArtwork({id,scanning}:{id:ScenarioId;scanning:boolean}){
  return <div className={`sample-artwork artwork-${id} ${scanning?'scanning':''}`}>
    {id==='scene'&&<svg viewBox="0 0 700 380" role="img" aria-label="Tranh minh họa lớp học"><rect width="700" height="380" fill="#d9edfa"/><rect y="270" width="700" height="110" fill="#b4a5a1"/><rect x="76" y="38" width="340" height="184" rx="9" fill="#186c5e" stroke="#eee8db" strokeWidth="16"/><path d="M120 100h250M126 143h190M162 189h145" stroke="#e4fff4" strokeWidth="5" strokeLinecap="round"/><rect x="516" y="34" width="137" height="182" fill="#88d3fc" stroke="#fff" strokeWidth="12"/><path d="M583 37v177M516 122h137" stroke="#fff" strokeWidth="8"/><rect x="150" y="273" width="405" height="28" rx="4" fill="#c08952"/><rect x="171" y="300" width="24" height="70" fill="#6d4b30"/><rect x="513" y="300" width="24" height="70" fill="#6d4b30"/><rect x="274" y="246" width="110" height="30" fill="#f5e9cb"/><text x="350" y="357" textAnchor="middle" fill="#173553" fontSize="18" fontWeight="bold">LỚP HỌC - ẢNH MẪU</text></svg>}
    {id==='ocr'&&<svg viewBox="0 0 700 380" role="img" aria-label="Trang sách toán minh họa"><rect width="700" height="380" fill="#c3d4e1"/><rect x="135" y="25" width="430" height="340" rx="9" fill="#fffaf0" stroke="#b4b9c4" strokeWidth="4"/><text x="169" y="86" fontSize="19" fill="#2764aa" fontWeight="bold">TOÁN 7 • BÀI HỌC</text><text x="169" y="133" fontSize="25" fill="#273c56" fontWeight="bold">HÌNH TAM GIÁC</text><path d="M210 264 L320 174 L434 264Z" fill="none" stroke="#2681cb" strokeWidth="7"/><text x="169" y="320" fontSize="17" fill="#334155">Tổng ba góc bằng 180°</text></svg>}
    {id==='objects'&&<svg viewBox="0 0 700 380" role="img" aria-label="Đồ dùng học tập với ô nhận diện"><rect width="700" height="380" fill="#caa582"/><rect x="73" y="67" width="260" height="244" rx="12" fill="#2b579d" stroke="#e9f1ff" strokeWidth="7"/><rect x="116" y="101" width="174" height="12" fill="#95b9ef"/><text x="203" y="194" fill="#fff" fontSize="29" textAnchor="middle" fontWeight="bold">TOÁN</text><path d="M387 88l146 170" stroke="#f3d482" strokeWidth="20" strokeLinecap="round"/><path d="M525 253l17 18-29-8" fill="#363944"/><ellipse cx="587" cy="130" rx="62" ry="41" fill="#f5f8fb" stroke="#b6c2cc" strokeWidth="9"/><rect x="357" y="292" width="260" height="35" rx="4" fill="#f2e0ae"/><path d="M375 297v20M401 297v11M425 297v20M455 297v11M485 297v20M515 297v11" stroke="#7f6652" strokeWidth="3"/>
      {[{x:61,y:51,w:282,h:273,t:'Sách'},{x:352,y:68,w:202,h:222,t:'Bút chì'},{x:515,y:63,w:140,h:140,t:'Cốc'},{x:343,y:285,w:286,h:51,t:'Thước'}].map(b=><g key={b.t}><rect x={b.x} y={b.y} width={b.w} height={b.h} fill="none" stroke="#04d8ab" strokeWidth="3" strokeDasharray="12 6"/><rect x={b.x} y={b.y-26} width={Math.max(82,b.t.length*17)} height="24" rx="4" fill="#044b46"/><text x={b.x+7} y={b.y-9} fill="#fff" fontSize="16">{b.t}</text></g>)}</svg>}
    {id==='study'&&<svg viewBox="0 0 700 380" role="img" aria-label="Hình minh họa học sinh hỏi bài toán"><rect width="700" height="380" fill="#dceafd"/><rect x="66" y="56" width="567" height="270" rx="18" fill="#fff" stroke="#85aee0" strokeWidth="6"/><text x="105" y="110" fontSize="21" fill="#47648e">CÂU HỎI TOÁN THCS</text><path d="M178 266 L338 143 L510 266 Z" fill="#e1f3ff" stroke="#1672c7" strokeWidth="6"/><text x="323" y="212" fill="#075eab" fontSize="25" fontWeight="bold">180°</text><text x="120" y="294" fill="#3f668e" fontSize="20">50°</text><text x="502" y="294" fill="#3f668e" fontSize="20">60°</text><text x="350" y="349" textAnchor="middle" fontSize="15" fill="#527399">Kịch bản câu hỏi được chuẩn bị trước</text></svg>}
    {scanning&&<div className="scan-line"/>}
  </div>;
}
export function DemoPage({dark,onStatus}:Props){
  const [selected,setSelected]=useState<ScenarioId>('scene');
  const [processing,setProcessing]=useState(false);
  const [answer,setAnswer]=useState('');
  const [question,setQuestion]=useState('');
  const [speechActive,setSpeechActive]=useState(false);
  const [scene3D,setScene3D]=useState(true);
  const timeout=useRef<number|undefined>(undefined);
  const demo=demos.find(s=>s.id===selected)!;
  useEffect(()=>()=>{window.clearTimeout(timeout.current);window.speechSynthesis?.cancel();},[]);
  const speak=(text:string)=>{
    if(!('speechSynthesis' in window)){setSpeechActive(false);return;}
    window.speechSynthesis.cancel();
    const utterance=new SpeechSynthesisUtterance(text);utterance.lang='vi-VN';utterance.rate=.92;
    utterance.onend=()=>setSpeechActive(false);utterance.onerror=()=>setSpeechActive(false);
    setSpeechActive(true);window.speechSynthesis.speak(utterance);
  };
  function run(){
    window.clearTimeout(timeout.current);setProcessing(true);setAnswer('');onStatus('Đang xử lý...');
    timeout.current=window.setTimeout(()=>{
      const reply=selected==='study'&&question.trim() ? (answerBank.find(([regex])=>regex.test(question))?.[1]||'Đây là chế độ ngoại tuyến: chưa có câu trả lời mẫu cho yêu cầu này. Hãy chọn câu hỏi Toán THCS được chuẩn bị sẵn.') : demo.reply;
      setAnswer(reply);setProcessing(false);onStatus(demo.status);
    },1550);
  }
  return <section className="section-page demo-page">
    <div className="page-head"><div><div className="section-eyebrow">05 / KỊCH BẢN MINH HỌA NGOẠI TUYẾN</div><h1>Trình diễn 4 năng lực VisionBot</h1><p>Không cần Wi-Fi hay API key. Nội dung và khung nhận diện bên dưới là <strong>dữ liệu chuẩn bị trước</strong>, không phải kết quả AI/OCR chạy trên ảnh thật.</p></div><div className="sample-banner">BẢN TRÌNH DIỄN MÔ PHỎNG</div></div>
    <div className="scenario-grid">{demos.map(d=>{const Icon=d.icon;return <button key={d.id} onClick={()=>{setSelected(d.id);setAnswer('');setProcessing(false);window.clearTimeout(timeout.current);onStatus('Sẵn sàng hỗ trợ');}} className={`scenario-card ${selected===d.id?'active':''}`}><span className="scenario-icon"><Icon size={21}/></span><b>{d.title}</b><small>{d.subtitle}</small><ArrowRight size={17}/></button>;})}</div>
    <div className="demo-workspace">
      <div className="demo-primary"><div className="sub-panel-head"><span><Camera size={17}/> Dữ liệu đầu vào · {demo.title}</span><span className="demo-pill">ẢNH MẪU</span></div>
        <SampleArtwork id={selected} scanning={processing}/>
        <div className="detected-tags">{demo.tags.map(t=><span key={t}><CheckCircle2 size={13}/>{t}</span>)}</div>
        {selected==='study'?<div className="demo-question"><label htmlFor="student-question">Câu hỏi học tập (mô phỏng theo bộ câu trả lời có sẵn)</label><input id="student-question" value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Ví dụ: Tổng ba góc trong tam giác?"/><div className="question-shortcuts">{['Tổng ba góc trong tam giác?','Định lí Thales là gì?','Hằng đẳng thức bình phương một tổng?'].map(x=><button key={x} onClick={()=>setQuestion(x)}>{x}</button>)}</div></div>:<div className="demo-prompt"><Mic size={18}/> <b>Lệnh mẫu:</b> “{demo.prompt}”</div>}
        <button disabled={processing} className="action-primary demo-run" onClick={run}>{processing?<><Scan size={18}/> Đang mô phỏng quét ảnh...</>:<><Play size={18}/> Chạy kịch bản “{demo.title}”</>}</button>
      </div>
      <div className="demo-secondary"><div className="sub-panel-head"><span><Volume2 size={17}/> Phản hồi tiếng Việt</span><button className="small-link" onClick={()=>setScene3D(x=>!x)}>{scene3D?'Ẩn':'Hiện'} màn hình 3D</button></div>
        {scene3D&&<div className="demo-small-scene">{supportsWebGL()?<VisionScene explode={.32} xray={false} selectedPart={null} selectedWire={null} selectedPin={null} activeGroups={null} showWires={false} showFlow={false} autoRotate={false} preset="front" focusSerial={0} status={processing?'Đang xử lý...':answer?demo.status:'Sẵn sàng'} dark={dark}
          onSelectPart={(_id:ComponentId)=>{}} onSelectWire={(_id:string)=>{}} onPinSelect={(_id:ComponentId,_pin:PinId)=>{}} onBackground={()=>{}}/>:<Circuit2D onPart={()=>{}} onWire={()=>{}} groups={null}/>}</div>}
        <div className="demo-answer"><span className="answer-eyebrow">NỘI DUNG PHẢN HỒI MÔ PHỎNG</span>{answer?<p>{answer}</p>:<p className="empty-answer">Chọn một kịch bản và nhấn “Chạy” để xem nội dung phản hồi.</p>}</div>
        <div className="speech-buttons"><button disabled={!answer} onClick={()=>speak(answer)} className="action-secondary"><Volume2 size={17}/> Đọc tiếng Việt</button><button disabled={!speechActive} onClick={()=>{window.speechSynthesis?.cancel();setSpeechActive(false);}} className="action-secondary"><VolumeX size={17}/> Dừng</button></div>
        <p className="subtle-note">Phát giọng bằng Web Speech API của trình duyệt; chất giọng tiếng Việt phụ thuộc hệ điều hành, trình duyệt và gói giọng nói đã cài đặt. Chế độ này không phản ánh độ chính xác của rô-bốt thật.</p>
      </div>
    </div>
  </section>;
}
