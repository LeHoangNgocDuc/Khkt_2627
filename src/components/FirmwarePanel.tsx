import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCheck, Code2, File, FileCode2, FileUp, HardDriveDownload, Info, Trash2, UploadCloud, X } from 'lucide-react';
import {
  FLASH_FILES, FLASH_SIZE, FIRMWARE_PROFILE, scanCodePins, fmtHex,fmtSize, resolveFlashFile,
  type UserFirmwareFile, type CodePin,
} from '../data/firmwareData';
import { loadFirmwareFiles,saveFirmwareFiles } from '../utils/storage';
import type { ComponentId } from '../data/circuitData';

interface Props {onPin:(id:ComponentId,pin:string)=>void;}
const MAX_SOURCE=320*1024;
function prettyLine(line:string){
  const tokens=line.split(/(\/\/.*$|#\s*define\b|\b(?:const|constexpr|int|void|return|class|struct|GPIO_NUM_\d+)\b|\b\d+\b)/g);
  return tokens.map((token,i)=>{
    const cls=token.startsWith('//')?'code-comment':/^#/.test(token)?'code-directive':/^(?:const|constexpr|int|void|return|class|struct)$/.test(token)?'code-keyword':/^(GPIO_NUM_\d+|\d+)$/.test(token)?'code-num':'';
    return <span className={cls} key={i}>{token}</span>;
  });
}
function locate(pin:CodePin){
  const f=(pin.functionName||'').toLowerCase();
  if (f.includes('mic'))return {id:'mic' as ComponentId,pin: f.includes('bclk')?'SCK':f.includes('ws')?'WS':'SD'};
  if (f.includes('amp'))return {id:'amp' as ComponentId,pin:f.includes('bclk')?'BCLK':f.includes('lrc')?'LRC':'DIN'};
  if (f.includes('tft'))return {id:'tft' as ComponentId,pin:f.includes('scl')?'SCL':f.includes('sda')?'SDA':f.includes('rst')?'RES':f.includes('dc')?'DC':'CS'};
  if (f.includes('button'))return {id:'button' as ComponentId,pin:'1'};
  return {id:'esp32' as ComponentId,pin:`GPIO${pin.pin}`};
}

export function FirmwarePanel({onPin}:Props){
  const [files,setFiles]=useState<UserFirmwareFile[]>(loadFirmwareFiles);
  const [active,setActive]=useState(0);
  const [notice,setNotice]=useState('');
  const [dragging,setDragging]=useState(false);
  const [selectedFlash,setSelectedFlash]=useState(FLASH_FILES[3].id);
  const [fontSize,setFontSize]=useState(12);
  const inputRef=useRef<HTMLInputElement>(null);
  useEffect(()=>{
    if (!saveFirmwareFiles(files)) setNotice('Bộ nhớ trình duyệt đã đầy: các tệp này chỉ được giữ trong phiên hiện tại.');
  },[files]);
  const selected=files[active];
  const pins=useMemo(()=>selected?.kind==='code'&&selected.content?scanCodePins(selected.content):[],[selected]);
  const failed=pins.filter(p=>p.verdict==='mismatch').length;
  const matched=pins.filter(p=>p.verdict==='match').length;
  const currentFlash=FLASH_FILES.find(p=>p.id===selectedFlash)!;
  async function ingest(list:FileList|File[]){
    const incoming=Array.from(list).slice(0,8);
    const next:UserFirmwareFile[]=[];
    for(const f of incoming){
      const ext=f.name.split('.').pop()?.toLowerCase();
      if (!ext || !['h','cc','cpp','ino','c','bin'].includes(ext)){setNotice(`Bỏ qua ${f.name}: không hỗ trợ định dạng này.`);continue;}
      if (ext==='bin'){
        const flash=resolveFlashFile(f.name);
        next.push({name:f.name,size:f.size,kind:'bin',offset:flash?.offset,uploadedAt:new Date().toLocaleString('vi-VN')});
      }else{
        if (f.size>MAX_SOURCE){setNotice(`Mã nguồn ${f.name} vượt 320 KB, hãy chọn tệp nhỏ hơn.`);continue;}
        const content=await f.text();
        next.push({name:f.name,size:f.size,kind:'code',content,uploadedAt:new Date().toLocaleString('vi-VN')});
      }
    }
    if (next.length){setFiles(old=>[...next,...old.filter(a=>!next.some(b=>a.name===b.name))].slice(0,8));setActive(0);setNotice(`Đã đọc ${next.length} tệp tại trình duyệt. Không truyền dữ liệu lên máy chủ.`);}
  }
  return <div className="firmware-root">
    <div className="section-eyebrow">HỒ SƠ FIRMWARE • THEO ĐẶC TẢ</div>
    <h2 className="side-title">Phần mềm & bản đồ Flash</h2>
    <div className="fw-profile">
      <span className="fw-chip">{FIRMWARE_PROFILE.title}</span>
      <span className="fw-chip">{FIRMWARE_PROFILE.sdk}</span>
      <p><b>Board:</b> {FIRMWARE_PROFILE.board}</p>
      <p><b>Công cụ:</b> {FIRMWARE_PROFILE.flashTool}</p>
      <p><b>Thiết lập:</b> {FIRMWARE_PROFILE.target} / {FIRMWARE_PROFILE.mode} / {FIRMWARE_PROFILE.clock} / {FIRMWARE_PROFILE.ioMode} / {FIRMWARE_PROFILE.flash} / {FIRMWARE_PROFILE.crystal} / {FIRMWARE_PROFILE.baud}</p>
      <div className="soft-warning"><Info size={15}/>Thông tin firmware lấy từ thuyết minh; cần đối chiếu file và thiết bị đang sử dụng.</div>
    </div>

    <div className="subheading"><HardDriveDownload size={17}/> Sơ đồ bộ nhớ Flash 16 MB</div>
    <div className="flash-map">
      <div className="flash-ruler"><span>0x000000</span><span>8 MB</span><span>16 MB</span></div>
      <div className="flash-track"><div className="flash-half"/>
        {FLASH_FILES.map((f,i)=> <button title={`${f.filename} · ${fmtHex(f.offset)}`} key={f.id} aria-label={`Chọn phân vùng ${f.filename}`} className={`flash-node ${selectedFlash===f.id?'active':''}`} style={{left:`${(f.offset/FLASH_SIZE)*100}%`,background:f.color,top:i<4?`${5+i*10}px`:'8px'}} onClick={()=>setSelectedFlash(f.id)}/>)}
      </div>
      <p className="flash-map-note">Dấu chấm thể hiện offset bắt đầu của các file, <b>không thể hiện dung lượng/phân vùng thực</b>.</p>
      <div className="flash-detail" style={{borderLeftColor:currentFlash.color}}>
        <strong>{currentFlash.filename}</strong><span className="mono">{fmtHex(currentFlash.offset)}</span>
        <p>{currentFlash.purpose}. {currentFlash.detail}</p>
      </div>
      <div className="flash-list">
        {FLASH_FILES.map(f=><button type="button" key={f.id} className={selectedFlash===f.id?'active':''} onClick={()=>setSelectedFlash(f.id)}>
          <span style={{background:f.color}} className="flash-dot"/><span className="flash-file">{f.filename}</span><code>{fmtHex(f.offset)}</code>
        </button>)}
      </div>
    </div>

    <div className="subheading"><FileUp size={17}/> Đối chiếu mã nguồn / firmware</div>
    <div className={`drop-area ${dragging?'dragging':''}`} role="button" tabIndex={0}
      onKeyDown={e=>{if(e.key==='Enter')inputRef.current?.click();}}
      onClick={()=>inputRef.current?.click()}
      onDragOver={e=>{e.preventDefault();setDragging(true);}}
      onDragLeave={e=>{e.preventDefault();setDragging(false);}}
      onDrop={e=>{e.preventDefault();setDragging(false);void ingest(e.dataTransfer.files);}}>
      <UploadCloud size={27}/><b>Thả file vào đây hoặc chọn file</b>
      <span>.h • .cc • .cpp • .ino • .c • .bin</span>
      <small>Chỉ xử lý cục bộ. File .bin lưu tên và dung lượng; mã nguồn tối đa 320KB/tệp.</small>
      <input ref={inputRef} type="file" accept=".h,.cc,.cpp,.ino,.c,.bin" multiple hidden
        onChange={e=>{if(e.target.files)void ingest(e.target.files);e.target.value='';}}/>
    </div>
    {notice&&<div className="toast-line"><Info size={14}/>{notice}<button aria-label="Đóng thông báo" onClick={()=>setNotice('')}><X size={13}/></button></div>}
    {!!files.length&&<>
      <div className="upload-list">{files.map((f,i)=><div className={`upload-item ${active===i?'active':''}`} key={f.name+f.uploadedAt}>
        <button className="upload-pick" onClick={()=>setActive(i)}>{f.kind==='bin'?<File size={15}/>:<FileCode2 size={15}/>}<span title={f.name}>{f.name}</span><small>{fmtSize(f.size)}</small></button>
        <button title="Xóa tệp" aria-label={`Xóa tệp ${f.name}`} onClick={()=>{setFiles(old=>old.filter((_,j)=>j!==i));setActive(0);}}><Trash2 size={15}/></button>
      </div>)}</div>
      {selected?.kind==='bin'&&<div className="uploaded-detail"><File size={19}/><div><b>Thông tin file BIN</b><p>{selected.name} · {fmtSize(selected.size)}. {selected.offset!==undefined?`Offset tham chiếu: ${fmtHex(selected.offset)}`:'Không khớp tên file bản đồ, chưa xác định offset.'}</p><small>Không giải mã mã nguồn hoặc sơ đồ GPIO từ tệp nhị phân; không tự nạp chip.</small></div></div>}
      {selected?.kind==='code'&&<>
        <div className="code-metrics"><span><CheckCheck size={15}/> {matched} khớp</span><span className={failed?'danger':''}><AlertTriangle size={15}/> {failed} khác</span><span>{pins.filter(p=>p.verdict==='unknown').length} chưa rõ</span></div>
        <div className="code-header"><span><Code2 size={16}/> {selected.name}</span><div><button onClick={()=>setFontSize(n=>Math.max(10,n-1))} title="Giảm cỡ chữ">A−</button><button onClick={()=>setFontSize(n=>Math.min(18,n+1))} title="Tăng cỡ chữ">A+</button></div></div>
        <div className="code-view" style={{fontSize:fontSize+'px'}}>{(selected.content||'').split(/\r?\n/).slice(0,1200).map((line,i)=><div className="code-line" key={i}><span className="line-no">{i+1}</span><code>{prettyLine(line)||' '}</code></div>)}</div>
        <div className="subheading"><AlertTriangle size={17}/> Đối chiếu GPIO tự động</div>
        {pins.length?<div className="gpio-scan-table"><table><thead><tr><th>Tên định nghĩa</th><th>GPIO</th><th>Kết quả</th></tr></thead>
          <tbody>{pins.map((pin,i)=><tr key={`${pin.line}-${i}`} className="clickable" onClick={()=>{const target=locate(pin);onPin(target.id,target.pin);}}>
            <td><b>{pin.name}</b><small>Dòng {pin.line} · {pin.functionName||'Chưa xác định'}</small></td>
            <td><code>{pin.pin}</code></td><td><span className={`match-result ${pin.verdict}`}>{pin.verdict==='match'?'Khớp':pin.verdict==='mismatch'?`Khác (cần ${pin.expected})`:'Chưa rõ'}</span></td>
          </tr>)}</tbody></table></div>:<p className="help-line">Không phát hiện #define hoặc khai báo const int có giá trị GPIO rõ ràng trong tệp này.</p>}
        <p className="help-line">So sánh bằng biểu thức chính quy chỉ mang tính gợi ý; không giải quyết macro lồng nhau, điều kiện biên dịch hoặc mã cấu hình trong file khác.</p>
      </>}
    </>}
    <div className="subheading">Kiến trúc phần mềm</div>
    <div className="feature-list">{FIRMWARE_PROFILE.notes.map(n=><p key={n}>• {n}</p>)}</div>
  </div>;
}
