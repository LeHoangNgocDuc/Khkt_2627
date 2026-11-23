import { useEffect, useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { CAMPUS_NAME, SCHOOL_NAME } from '../data/identity';
const KEY='visionbot-school-logo-v1';
const UPDATED='visionbot:school-logo-updated';
// Vite discovers root Logo.jpg in the existing GitHub repository without having
// to move or re-encode the original school logo. Also supports public/logo-truong.png.
const ROOT_LOGO=Object.values(import.meta.glob('../../Logo.jpg',{eager:true,query:'?url',import:'default'}))[0] as string|undefined;
const SOURCES=[ROOT_LOGO,'/logo-truong.png','/school-logo.png'].filter(Boolean) as string[];
function readSaved():string{
  try { return localStorage.getItem(KEY) || ''; } catch { return ''; }
}
/**
 * Không tái tạo/biến đổi logo. Chỉ tải nguyên bytes ảnh do trường cung cấp.
 * Để đóng gói logo cho mọi máy, đặt ảnh gốc ở public/logo-truong.png.
 */
export function SchoolIdentity({compact=false,editable=false,competition=false}:{compact?:boolean;editable?:boolean;competition?:boolean}){
  const [uploaded,setUploaded]=useState<string>(()=>readSaved());
  const [sourceIndex,setSourceIndex]=useState(0);
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
    if(file.size>1_400_000){setError('Ảnh lớn hơn 1,4 MB: hãy đặt ảnh gốc vào public/logo-truong.png trước khi triển khai.');return;}
    const reader=new FileReader();
    reader.onerror=()=>setError('Không đọc được ảnh logo.');
    reader.onload=()=>{
      const url=String(reader.result||'');
      try{localStorage.setItem(KEY,url);setUploaded(url);setError('');window.dispatchEvent(new Event(UPDATED));}
      catch{setError('Bộ nhớ trình duyệt đầy. Hãy đặt logo vào public/logo-truong.png.');}
    };
    reader.readAsDataURL(file);
  }
  return <div className={`school-identity ${compact?'identity-compact':''}`}>
    <div className="school-emblem">
      {uploaded?<img src={uploaded} alt="Logo Trường THCS Nam Nha Trang"/>:
       sourceIndex<SOURCES.length?<img src={SOURCES[sourceIndex]} alt="Logo Trường THCS Nam Nha Trang" onError={()=>setSourceIndex(n=>n+1)}/>:
       <div className="school-emblem-empty" aria-label="Chưa có ảnh logo trường">LOGO</div>}
    </div>
    <div className="school-ident-text"><strong>{SCHOOL_NAME}</strong><span>{CAMPUS_NAME}{competition?' · KHKT – STEM / AI':''}</span></div>
    {editable&&<><input ref={picker} hidden type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={e=>onFile(e.target.files?.[0])}/>
      <button className="school-upload" title="Chọn ảnh logo trường nguyên bản" onClick={()=>picker.current?.click()}><ImagePlus size={15}/><span>{uploaded||sourceIndex<SOURCES.length?'Đổi logo':'Nạp logo'}</span></button>
      {error&&<span className="school-upload-error" role="alert">{error}</span>}
    </>}
  </div>;
}
