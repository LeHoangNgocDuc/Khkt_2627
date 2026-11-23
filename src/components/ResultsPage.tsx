import { useEffect, useState } from 'react';
import { AlertTriangle, BarChart3, Download, Edit3, FileSpreadsheet, RotateCcw, Save, X } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  costTotal, DEFAULT_RESEARCH_RESULTS, loadResearch, money, RESEARCH_LABEL, saveResearch,
  type ResearchResults,
} from '../data/researchResults';
const COLORS=['#449cfb','#1fa9a6','#776bdb','#e0ac56'];
const pct=(v:number)=>Math.max(0,Math.min(100,Math.round(Number(v)||0)));
const number=(v:string,min:number,max:number)=>Math.max(min,Math.min(max,Number(v)||0));
function downloadJson(value:ResearchResults){
  const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='visionbot-so-lieu-nghien-cuu.json';a.click();URL.revokeObjectURL(url);
}
function downloadCsv(value:ResearchResults){
  const rows=[['Nhóm','Chỉ số','Giá trị','Đơn vị','Số lần thử'],...value.tasks.map(t=>['Độ chính xác',t.name,String(t.accuracy),'%',String(t.trials)]),...value.latency.map(t=>['Độ trễ',t.name,String(t.seconds),'giây',String(t.trials)]),...value.costs.map(t=>['Chi phí',t.name,String(t.quantity*t.unitPrice),'VNĐ',String(t.quantity)])];
  const csv='\ufeff'+rows.map(row=>row.map(c=>'"'+c.replace(/"/g,'""')+'"').join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='visionbot-so-lieu-nghien-cuu.csv';a.click();URL.revokeObjectURL(url);
}
export function ResultsPage(){
  const [results,setResults]=useState<ResearchResults>(loadResearch);
  const [editing,setEditing]=useState(false);
  const [draft,setDraft]=useState<ResearchResults>(results);
  const [notification,setNotification]=useState('');
  useEffect(()=>{if(!editing)return;setDraft(structuredClone(results));},[editing]);
  const live=results.sample?'DỮ LIỆU MẪU • CHƯA XÁC MINH':'DỮ LIỆU DO NGƯỜI DÙNG NHẬP • CHƯA KIỂM ĐỊNH';
  const taskAverage=results.tasks.length?results.tasks.reduce((s,t)=>s+pct(t.accuracy),0)/results.tasks.length:0;
  function save(){
    const normalized:ResearchResults={...draft,sample:false, tasks:draft.tasks.map(t=>({...t,accuracy:pct(t.accuracy),correct:Math.max(0,Math.min(t.trials,Math.round(t.correct)))})), latency:draft.latency.map(t=>({...t,seconds:number(String(t.seconds),0,999)})),costs:draft.costs.map(c=>({...c,quantity:number(String(c.quantity),0,999),unitPrice:number(String(c.unitPrice),0,1e9)}))};
    setResults(normalized);setEditing(false);setNotification(saveResearch(normalized)?'Đã lưu dữ liệu trên trình duyệt này.':'Không thể lưu localStorage; dữ liệu chỉ tồn tại đến khi tải lại.');
  }
  function setTask(index:number,key:'accuracy'|'trials'|'correct',value:string){setDraft(old=>({...old,tasks:old.tasks.map((t,i)=>i===index?{...t,[key]:key==='accuracy'?pct(Number(value)):number(value,0,100000)}:t)}));}
  function setLatency(index:number,key:'seconds'|'trials',value:string){setDraft(old=>({...old,latency:old.latency.map((t,i)=>i===index?{...t,[key]:number(value,0,100000)}:t)}));}
  function setCost(index:number,key:'quantity'|'unitPrice',value:string){setDraft(old=>({...old,costs:old.costs.map((t,i)=>i===index?{...t,[key]:number(value,0,1e9)}:t)}));}
  return <section className="section-page results-page">
    <div className="page-head"><div><div className="section-eyebrow">06 / ĐÁNH GIÁ NGHIÊN CỨU</div><h1>Kết quả thử nghiệm & chi phí</h1><p>Đây là nơi trình bày bằng chứng của rô-bốt VisionBot. Chỉ công bố kết quả thật khi có bảng theo dõi số lượt thử, tiêu chí đánh giá và biên bản đo.</p></div>
      <div className="results-toolbar"><button className="action-primary" onClick={()=>setEditing(true)}><Edit3 size={16}/> Sửa nhanh số liệu</button><button className="action-secondary" onClick={()=>downloadCsv(results)}><Download size={16}/> Xuất CSV</button></div></div>
    <div className="unverified-banner"><AlertTriangle size={20}/><div><strong>{results.sample?RESEARCH_LABEL:live}</strong><span>{results.sample?results.note:'Các giá trị được nhập và lưu ở máy này; chưa được website xác thực với biên bản thực nghiệm.'}</span></div></div>
    {notification&&<div className="info-flash">{notification}<button onClick={()=>setNotification('')}><X size={15}/></button></div>}
    <div className="research-highlights"><div><span>Độ chính xác trung bình (mẫu)</span><strong>{taskAverage.toFixed(1).replace('.',',')}%</strong><small>Trung bình số học của bốn tác vụ; không phải độ chính xác chung trên dữ liệu kiểm thử.</small></div><div><span>Thời gian mạng ổn định (mẫu)</span><strong>{results.latency[0]?.seconds??0} giây</strong><small>Phụ thuộc môi trường mạng, API và kích cỡ dữ liệu.</small></div><div><span>Chi phí phần cứng nguyên mẫu (mẫu)</span><strong>{money(costTotal(results))}</strong><small>Ước tính, không bao gồm công chế tạo và phí AI sử dụng.</small></div></div>
    <div className="chart-grid"><article className="data-card"><div className="sub-panel-head"><span><BarChart3 size={17}/> Độ chính xác theo tác vụ</span><small>% · dữ liệu nhập</small></div>
      <div className="chart-inner"><ResponsiveContainer width="100%" height="100%"><BarChart data={results.tasks} margin={{top:28,right:20,bottom:42,left:0}}><CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="4 4"/><XAxis dataKey="name" stroke="var(--muted)" tick={{fontSize:11}} interval={0} angle={-13} textAnchor="end" height={60}/><YAxis domain={[0,100]} tickFormatter={(v:number)=>`${v}%`} stroke="var(--muted)" tick={{fontSize:12}}/><Tooltip formatter={(value:any)=>`${value}%`} contentStyle={{background:'#16273e',color:'#eff6ff',border:'1px solid #34506f',borderRadius:12}}/><Bar dataKey="accuracy" name="Độ chính xác" radius={[7,7,0,0]} maxBarSize={66}>{results.tasks.map((t,i)=><Cell key={t.id} fill={COLORS[i%COLORS.length]}/>)}<LabelList dataKey="accuracy" position="top" formatter={(v:any)=>`${v}%`} style={{fill:'var(--ink)',fontWeight:700,fontSize:12}}/></Bar></BarChart></ResponsiveContainer></div>
      <p className="data-caption">Gợi ý khi kiểm thử thật: ghi số câu đúng, tổng số tình huống, điều kiện môi trường và công thức tính tỷ lệ.</p></article>
      <article className="data-card"><div className="sub-panel-head"><span><BarChart3 size={17}/> Thời gian phản hồi theo mạng</span><small>Giây · dữ liệu nhập</small></div>
        <div className="chart-inner"><ResponsiveContainer width="100%" height="100%"><BarChart data={results.latency} margin={{top:28,right:20,bottom:20,left:0}}><CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="4 4"/><XAxis dataKey="name" stroke="var(--muted)" tick={{fontSize:12}} interval={0}/><YAxis stroke="var(--muted)" tick={{fontSize:12}}/><Tooltip formatter={(value:any)=>`${value} giây`} contentStyle={{background:'#16273e',color:'#eff6ff',border:'1px solid #34506f',borderRadius:12}}/><Bar dataKey="seconds" name="Phản hồi" fill="#31b59b" radius={[7,7,0,0]} maxBarSize={85}><LabelList dataKey="seconds" position="top" formatter={(v:any)=>`${v} s`} style={{fill:'var(--ink)',fontWeight:700,fontSize:12}}/></Bar></BarChart></ResponsiveContainer></div>
        <p className="data-caption">Thời gian phản hồi nên đo từ lúc bấm nút đến khi loa bắt đầu phát kết quả, cùng phương pháp ở mọi lần thử.</p></article>
    </div>
    <article className="data-card expense-card"><div className="sub-panel-head"><span><FileSpreadsheet size={18}/> Bảng dự toán linh kiện VisionBot</span><strong>Tổng: {money(costTotal(results))}</strong></div>
      <div className="table-scroller"><table className="result-table"><thead><tr><th>STT</th><th>Linh kiện / vật tư</th><th>Số lượng</th><th>Đơn giá (VNĐ)</th><th>Thành tiền</th></tr></thead><tbody>{results.costs.map((c,i)=><tr key={c.id}><td>{i+1}</td><td>{c.name}</td><td>{c.quantity}</td><td>{money(c.unitPrice)}</td><td>{money(c.quantity*c.unitPrice)}</td></tr>)}</tbody><tfoot><tr><td colSpan={4}>TỔNG CHI PHÍ NGUYÊN MẪU (ƯỚC TÍNH)</td><td>{money(costTotal(results))}</td></tr></tfoot></table></div>
      <p className="data-caption">Đơn giá có thể thay đổi theo nơi mua, thời điểm, loại bo nguồn và bản in 3D. Kinh phí sử dụng dịch vụ AI đám mây cần tính riêng.</p></article>
    {editing&&<div className="modal-backdrop editing-backdrop" onMouseDown={()=>setEditing(false)}><div className="results-editor" role="dialog" aria-modal="true" aria-label="Sửa số liệu nghiên cứu" onMouseDown={e=>e.stopPropagation()}>
      <header><div><div className="section-eyebrow">NHẬP SỐ LIỆU THỰC NGHIỆM</div><h2>Sửa nhanh dữ liệu trình chiếu</h2><p>Chỉnh số, nhấn Lưu để cập nhật biểu đồ và lưu vào localStorage của máy đang sử dụng.</p></div><button onClick={()=>setEditing(false)} className="icon-button"><X size={18}/></button></header>
      <div className="editor-content"><h3>1. Độ chính xác (%)</h3><div className="editor-grid"><span>Tác vụ</span><span>Đúng / tổng lượt thử</span><span>Độ chính xác %</span>{draft.tasks.map((t,i)=><div className="editor-row" key={t.id}><b>{t.name}</b><span><input aria-label={`Đúng ${t.name}`} type="number" min="0" value={t.correct} onChange={e=>setTask(i,'correct',e.target.value)}/> / <input aria-label={`Số lượt ${t.name}`} type="number" min="0" value={t.trials} onChange={e=>setTask(i,'trials',e.target.value)}/></span><input aria-label={`Tỉ lệ ${t.name}`} type="number" min="0" max="100" value={t.accuracy} onChange={e=>setTask(i,'accuracy',e.target.value)}/></div>)}</div><p className="subtle-note">Nhập kết quả đúng/tổng và tỷ lệ tương ứng sau khi tính. Website không tự xác minh các số liệu này.</p>
      <h3>2. Thời gian phản hồi</h3>{draft.latency.map((t,i)=><div className="simple-editor-row" key={t.id}><label>{t.name}</label><input type="number" min="0" step="0.1" aria-label={`Thời gian ${t.name}`} value={t.seconds} onChange={e=>setLatency(i,'seconds',e.target.value)}/><span>giây</span><input aria-label={`Số lần đo ${t.name}`} type="number" min="0" value={t.trials} onChange={e=>setLatency(i,'trials',e.target.value)}/><span>lượt</span></div>)}
      <h3>3. Chi phí linh kiện</h3>{draft.costs.map((c,i)=><div className="simple-editor-row" key={c.id}><label>{c.name}</label><input type="number" min="0" value={c.quantity} onChange={e=>setCost(i,'quantity',e.target.value)}/><span>cái</span><input type="number" min="0" step="1000" value={c.unitPrice} onChange={e=>setCost(i,'unitPrice',e.target.value)}/><span>đ/cái</span></div>)}</div>
      <footer><button className="action-secondary" onClick={()=>{setDraft(structuredClone(DEFAULT_RESEARCH_RESULTS));setNotification('Đang hiển thị giá trị mẫu trong cửa sổ sửa; nhấn Lưu để áp dụng.');}}><RotateCcw size={15}/> Giá trị mẫu</button><button className="action-secondary" onClick={()=>downloadJson(draft)}><Download size={15}/> Xuất JSON</button><button className="action-secondary" onClick={()=>setEditing(false)}><X size={15}/> Hủy</button><button className="action-primary" onClick={save}><Save size={17}/> Lưu số liệu</button></footer>
    </div></div>}
  </section>;
}
