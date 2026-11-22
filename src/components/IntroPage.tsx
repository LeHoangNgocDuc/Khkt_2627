import { PROJECT_NAME } from '../data/identity';
import { Activity, ArrowRight, AudioLines, BookOpen, Camera, CheckCircle2, Cpu, Eye, HeartHandshake, ShieldAlert, Wifi } from 'lucide-react';
interface Props {onExplore:()=>void;onDemo:()=>void;onPresent:()=>void;}
export function IntroPage({onExplore,onDemo,onPresent}:Props){
  return <section className="section-page intro-page">
    <div className="hero-layout">
      <div className="hero-copy">
        <div className="micro-eyebrow"><span className="signal-dot"/> DỰ ÁN NGHIÊN CỨU KHOA HỌC KĨ THUẬT • THCS</div>
        <h1>VISION<span>BOT</span><br/><small>TRỢ LÝ THỊ GIÁC<br/>ỨNG DỤNG AI</small></h1><div className="official-project-title"><b>TÊN ĐỀ TÀI NGHIÊN CỨU</b><p>{PROJECT_NAME}</p></div>
        <p className="hero-lead">Thiết bị hỗ trợ người khiếm thị nhận biết đồ vật, đọc chữ và học tập thông qua camera, micro, trí tuệ nhân tạo và phản hồi bằng tiếng Việt.</p>
        <div className="hero-buttons"><button onClick={onExplore} className="action-primary"><Eye size={19}/> Khám phá mô hình 3D <ArrowRight size={17}/></button>
          <button onClick={onPresent} className="action-secondary"><Activity size={18}/> Bắt đầu thuyết trình</button></div>
        <div className="hero-metrics"><span><Cpu size={17}/> ESP32-S3-CAM</span><span><Wifi size={17}/> AI qua Wi-Fi</span><span><AudioLines size={17}/> Tiếng Việt</span></div>
      </div>
      <div className="hero-art" aria-label="Minh họa thiết bị VisionBot">
        <div className="hero-halo halo-one"/><div className="hero-halo halo-two"/><div className="orbit-tag tag-top"><Camera size={15}/> Camera</div>
        <div className="orbit-tag tag-mid"><Cpu size={15}/> Xử lý nhúng</div><div className="orbit-tag tag-low"><AudioLines size={15}/> Phản hồi âm thanh</div>
        <div className="robot-illustration"><div className="robot-camera"/><div className="robot-screen"><span>VISIONBOT</span><div className="robot-face"><i/><i/></div><small>Sẵn sàng hỗ trợ</small></div><div className="robot-micro">••••</div><div className="robot-button"/></div>
        <div className="hero-art-caption">Hình dựng minh họa bố cục • Không phải bản vẽ kích thước chế tạo</div>
      </div>
    </div>
    <div className="intro-section-title"><span>01 / BỐI CẢNH & GIẢI PHÁP</span><h2>Ba vấn đề mà nhóm nghiên cứu giải quyết</h2></div>
    <div className="context-grid">
      <article className="context-card"><span className="context-icon"><HeartHandshake size={26}/></span><span className="card-index">01 · NHU CẦU THỰC TẾ</span><h3>Tiếp cận thế giới dễ dàng hơn</h3><p>Người khiếm thị gặp khó khăn khi nhận biết sự vật, đọc tài liệu, phân biệt nhãn đồ dùng hoặc tiếp cận nội dung học tập bằng hình ảnh.</p><div className="mini-key"><CheckCircle2 size={15}/> Xác định nhiệm vụ hỗ trợ phù hợp</div></article>
      <article className="context-card"><span className="context-icon"><BookOpen size={26}/></span><span className="card-index">02 · Ý TƯỞNG NGHIÊN CỨU</span><h3>Thiết bị cầm tay, giao tiếp tiếng Việt</h3><p>VisionBot hướng đến việc chụp ảnh, ghi nhận yêu cầu và phát lời giải thích qua loa, giúp người dùng chủ động hỏi về cảnh vật hoặc bài học.</p><div className="mini-key"><CheckCircle2 size={15}/> Hỗ trợ đọc chữ và học tập</div></article>
      <article className="context-card"><span className="context-icon"><Cpu size={26}/></span><span className="card-index">03 · GIẢI PHÁP KỸ THUẬT</span><h3>ESP32-S3 kết hợp AI đám mây</h3><p>Vi điều khiển thu ảnh và âm thanh, kết nối Internet để gửi yêu cầu đến dịch vụ AI rồi trả phản hồi qua màn hình và loa.</p><div className="mini-key"><CheckCircle2 size={15}/> Mô hình nhúng nhiều mô-đun</div></article>
    </div>
    <div className="intro-lower">
      <div className="intro-flow"><div className="section-eyebrow">NGUYÊN LÝ CỐT LÕI</div><h3>Một vòng tương tác – nhiều ứng dụng</h3>
        <div className="flow-inline"><span>Người dùng</span><ArrowRight size={17}/><span>Camera & Micro</span><ArrowRight size={17}/><span>ESP32 + Wi-Fi</span><ArrowRight size={17}/><span>AI đám mây</span><ArrowRight size={17}/><span>Loa / TFT</span></div>
        <button className="text-action" onClick={onDemo}>Xem 4 kịch bản trình diễn <ArrowRight size={15}/></button>
      </div>
      <div className="limit-card"><ShieldAlert size={23}/><div><h3>Giới hạn khoa học & an toàn</h3><p>VisionBot có thể chậm hoặc trả lời sai do điều kiện ảnh, mạng và AI đám mây. <strong>Không dùng thiết bị để thay thế gậy trắng, người hỗ trợ hoặc hệ thống cảnh báo vật cản thời gian thực.</strong> Những nội dung trình diễn trên web là mô phỏng, không xác thực khả năng thực tế khi chưa thử trên rô-bốt.</p></div></div>
    </div>
  </section>;
}
