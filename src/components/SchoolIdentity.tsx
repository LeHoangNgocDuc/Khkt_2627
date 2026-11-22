import { useEffect, useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { CAMPUS_NAME, SCHOOL_NAME } from '../data/identity';
const KEY='visionbot-school-logo-v1';
const UPDATED='visionbot:school-logo-updated';
function readSaved():string{
  try { return localStorage.getItem(KEY) || ''; } catch { return ''; }
}
/**
 * Không tái tạo/biến đổi logo. Chỉ tải nguyên bytes ảnh do trường cung cấp.
 * Để đóng gói logo cho mọi máy, đặt ảnh gốc ở public/school-logo.png.
 */
export function SchoolIdentity({compact=false,editable=false}:{compact?:boolean;editable?:boolean}){
  const [uploaded,setUploaded]=useState<string>(()=>readSaved());
  const [fileReady,setFileReady]=useState(true);
  const [error,setError]=useState('');
  const picker=useRef<HTMLInputElement>(null);
  useEffect(()=>{
    const sync=()=>setUploaded(readSaved());
    window.addEventListener(UPDATED,sync);window.addEventListener('storage',sync);
    return ()=>{window.removeEventListener(UPDATED,sync);window.removeEventListener('storage',sync);};
  },[]);
  function onFile(file?:File){
    if(!file)return;
    if(!/^image\/(png|jpeg|webp|svg\+xml)$/.test(file.type)){setError('Chỉ nhận ảnh PNG, JPG, WebP hoặc SVG.');return;}
    if(file.size>1_400_000){setError('Ảnh lớn hơn 1,4 MB: hãy đặt ảnh gốc vào public/school-logo.png trước khi triển khai.');return;}
    const reader=new FileReader();
    reader.onerror=()=>setError('Không đọc được ảnh logo.');
    reader.onload=()=>{
      const url=String(reader.result||'');
      try{localStorage.setItem(KEY,url);setUploaded(url);setError('');window.dispatchEvent(new Event(UPDATED));}
      catch{setError('Bộ nhớ trình duyệt đầy. Hãy đặt logo vào public/school-logo.png.');}
    };
    reader.readAsDataURL(file);
  }
  return <div className={`school-identity ${compact?'identity-compact':''}`}>
    <div className="school-emblem">
      {uploaded?<img src={uploaded} alt="Logo Trường THCS Nam Nha Trang"/>:
       fileReady?<img src="/school-logo.png" alt="Logo Trường THCS Nam Nha Trang" onError={()=>setFileReady(false)}/>:
       <div className="school-emblem-empty" aria-label="Chưa có ảnh logo trường">LOGO</div>}
    </div>
    <div className="school-ident-text"><strong>{SCHOOL_NAME}</strong><span>{CAMPUS_NAME}</span></div>
    {editable&&<><input ref={picker} hidden type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={e=>onFile(e.target.files?.[0])}/>
      <button className="school-upload" title="Chọn ảnh logo trường nguyên bản" onClick={()=>picker.current?.click()}><ImagePlus size={15}/><span>{uploaded||fileReady?'Đổi logo':'Nạp logo'}</span></button>
      {error&&<span className="school-upload-error" role="alert">{error}</span>}
    </>}
  </div>;
}
