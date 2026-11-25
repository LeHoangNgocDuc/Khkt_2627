import { useState } from 'react';
import { ArrowRight, AudioLines, BookOpen, Camera, Cable, CheckCircle2, Cpu, Eye, HeartHandshake, Image, ShieldAlert, Wifi } from 'lucide-react';
import { PROJECT_NAME } from '../data/identity';

interface Props {onExplore:()=>void;onWiring:()=>void;onPrinciple:()=>void;}
const PHOTOS=[
  {src:'/images/visionbot-thuc-te-1.png',caption:'Ảnh thực tế: vỏ trắng in 3D, camera, màn hình TFT và khe đèn trạng thái',studio:false},
  {src:'/images/visionbot-thuc-te-2.png',caption:'Ảnh thực tế: VisionBot đang chụp ảnh và gửi yêu cầu xử lý',studio:false},
  {src:'/images/visionbot-studio-concept.png',caption:'Phối cảnh công nghiệp tham khảo: mẫu vỏ ABS trắng nâng cấp (hình ảnh thiết kế, không phải ảnh thiết bị thật)',studio:true},
];
export function IntroPage({onExplore,onWiring,onPrinciple}:Props){
  const [photo,setPhoto]=useState(0);
  return <section className="section-page intro-page intro-v6">
    <div className="hero-layout">
      <div className="hero-copy">
        <div className="micro-eyebrow"><span className="signal-dot"/> DỰ ÁN KHOA HỌC KỸ THUẬT · HỖ TRỢ GIÁO DỤC HÒA NHẬP</div>
        <h1>VISION<span>BOT</span><br/><small>ĐÔI MẮT AI<br/>VÌ HỌC TẬP HÒA NHẬP</small></h1>
        <div className="official-project-title"><b>TÊN ĐỀ TÀI CHÍNH THỨC</b><p>{PROJECT_NAME}</p></div>
        <p className="hero-lead">Thiết bị nguyên mẫu sử dụng camera, micro, ESP32-S3 và AI qua Wi-Fi để hỗ trợ mô tả cảnh vật, đọc tài liệu và giao tiếp bằng tiếng Việt. Trọng tâm của dự án là giúp học sinh khiếm thị tiếp cận việc học tập thuận lợi hơn.</p>
        <div className="hero-buttons">
          <button onClick={onExplore} className="action-primary"><BoxIcon/> Xem cấu tạo 3D <ArrowRight size={17}/></button>
          <button onClick={onWiring} className="action-secondary"><Cable size={18}/> Soi chân đấu nối</button>
          <button onClick={onPrinciple} className="action-secondary"><Wifi size={18}/> Xem nguyên lý</button>
        </div>
        <div className="hero-metrics"><span><Cpu size={17}/> ESP32-S3-CAM</span><span><Camera size={17}/> Camera FPC</span><span><AudioLines size={17}/> Giao tiếp giọng nói</span></div>
      </div>
      <figure className="hero-photo-panel">
        <div className="hero-photo-tag"><Image size={15}/> {PHOTOS[photo].studio ? "PHỐI CẢNH THIẾT KẾ – MINH HỌA" : "ẢNH CHỤP SẢN PHẨM THỰC TẾ"}</div>
        <img src={PHOTOS[photo].src} alt={PHOTOS[photo].caption} decoding="async"/>
        <figcaption>{PHOTOS[photo].caption}</figcaption>
        <div className="hero-photo-switch" role="group" aria-label="Chọn ảnh sản phẩm">
          {PHOTOS.map((item,i)=><button key={item.src} className={photo===i?'active':''} onClick={()=>setPhoto(i)} aria-pressed={photo===i}>{item.studio ? "Phối cảnh studio" : `Ảnh thật ${i+1}`}</button>)}
        </div>
      </figure>
    </div>
    <div className="intro-section-title"><span>01 / VÌ SAO CẦN VISIONBOT?</span><h2>Giải pháp kỹ thuật hướng tới học tập hòa nhập</h2></div>
    <div className="context-grid">
      <article className="context-card"><span className="context-icon"><HeartHandshake size={26}/></span><span className="card-index">NHU CẦU THỰC TẾ</span><h3>Tiếp cận tài liệu và môi trường</h3><p>Học sinh khiếm thị gặp khó khăn với văn bản, bài tập và thông tin trực quan. Thiết bị hướng tới diễn đạt những thông tin đó bằng âm thanh.</p><div className="mini-key"><CheckCircle2 size={15}/> Đọc chữ, mô tả cảnh vật</div></article>
      <article className="context-card"><span className="context-icon"><BookOpen size={26}/></span><span className="card-index">GIÁ TRỊ GIÁO DỤC</span><h3>Đồng hành học Toán và tiếng Anh</h3><p>Người dùng đặt câu hỏi bằng lời nói, có thể yêu cầu đọc đề, giải thích các bước hoặc đọc, dịch và luyện nghe tiếng Anh.</p><div className="mini-key"><CheckCircle2 size={15}/> Hỗ trợ chứ không thay giáo viên</div></article>
      <article className="context-card"><span className="context-icon"><Cpu size={26}/></span><span className="card-index">GIẢI PHÁP NHÚNG</span><h3>ESP32-S3 + AI đám mây</h3><p>ESP32-S3 thu nhận hình ảnh và giọng nói, trao đổi thông tin qua Wi-Fi; loa phát phản hồi, TFT hiển thị trạng thái hoạt động.</p><div className="mini-key"><CheckCircle2 size={15}/> Phần cứng phổ biến, vỏ in 3D</div></article>
    </div>
    <div className="intro-lower">
      <div className="intro-flow"><div className="section-eyebrow">CHU TRÌNH THỰC HIỆN</div><h3>Luồng xử lý của nguyên mẫu</h3>
        <div className="flow-inline"><span>Camera / Micro</span><ArrowRight size={17}/><span>ESP32-S3</span><ArrowRight size={17}/><span>Wi-Fi · AI</span><ArrowRight size={17}/><span>Loa / TFT</span></div>
        <button onClick={onPrinciple} className="text-action">Phân tích từng bước của hệ thống <ArrowRight size={15}/></button>
      </div>
      <div className="limit-card"><ShieldAlert size={23}/><div><h3>Giới hạn khoa học và an toàn</h3><p>AI qua Internet có thể trễ hoặc nhận diện sai. <strong>VisionBot chưa phải thiết bị dẫn đường an toàn theo thời gian thực, không thay thế gậy trắng hoặc người hỗ trợ.</strong> Sơ đồ GPIO và mô hình 3D phải đối chiếu với thiết bị và firmware thật trước khi đấu điện.</p></div></div>
    </div>
  </section>;
}
function BoxIcon(){return <Eye size={19}/>;}
