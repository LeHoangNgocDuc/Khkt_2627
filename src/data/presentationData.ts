import type { ComponentId } from './circuitData';
import type { Preset } from '../scene/VisionScene';
export interface PresentationSlide {
  id: number; title: string; subtitle: string; duration: number;
  preset: Preset; explode: number; part?: ComponentId;
  speech: string; points: string[];
}
export const PRESENTATION_SLIDES: PresentationSlide[] = [
  {id:1,title:'Từ khó khăn thực tế đến VisionBot',subtitle:'Bối cảnh – Mục tiêu',duration:40,preset:'front',explode:0,
   speech:'Kính thưa Ban Giám khảo! Từ những khó khăn mà người khiếm thị gặp phải khi đọc chữ, nhận biết đồ vật và học tập, nhóm chúng em nghiên cứu VisionBot: một thiết bị cầm tay giao tiếp bằng tiếng Việt, có thể mô tả hình ảnh thông qua trí tuệ nhân tạo.',points:['Nhu cầu thực tế của người khiếm thị','Thiết bị hỗ trợ sinh hoạt và học tập','Không thay thế gậy trắng hoặc hệ thống tránh vật cản']},
  {id:2,title:'Cấu trúc cơ khí ba lớp',subtitle:'Vỏ in 3D – Bố trí linh kiện',duration:35,preset:'exploded',explode:100,
   speech:'Đây là mô hình ba lớp: vỏ trước có camera, màn hình, micro và nút; khung giữa cố định bo điều khiển, loa, pin; nắp sau bảo vệ mạch. Khi tách lớp, chúng ta có thể quan sát từng mô đun.',points:['Vỏ trước','Khung cố định / chống hồi tiếp âm','Nắp sau và khe sạc']},
  {id:3,title:'ESP32-S3-CAM và camera FPC',subtitle:'Bộ não của thiết bị',duration:40,preset:'pins',explode:90,part:'esp32',
   speech:'ESP32-S3-CAM là trung tâm xử lý. Camera nối sẵn bằng cáp FPC. ESP32 thu ảnh, âm thanh, kết nối mạng và điều khiển thiết bị; những GPIO dùng camera không được đấu thêm linh kiện.',points:['ESP32-S3-CAM: Wi-Fi, SPI, I2S','Camera qua cáp FPC','Hai hàng chân GPIO để đấu nối']},
  {id:4,title:'Đấu nối màn hình và âm thanh',subtitle:'SPI & I2S',duration:55,preset:'audio',explode:95,
   speech:'Màn hình ST7789 nhận dữ liệu SPI. Micro INMP441 ghi âm dạng I2S, ampli MAX98357A phát âm thanh ra loa. GPIO39 và GPIO40 dùng chung xung âm thanh theo cấu hình đề xuất, cần đồng bộ với firmware.',points:['Màn hình ST7789: SPI','INMP441: I2S RX 3,3V','MAX98357A: I2S TX và loa vi sai']},
  {id:5,title:'Nguồn điện và an toàn',subtitle:'Li-Po 1S – Sạc – Boost 5V',duration:45,preset:'power',explode:90,
   speech:'Pin Li-Po được nạp qua mạch sạc có bảo vệ; sau công tắc, bộ tăng áp tạo 5V cho ESP32 và ampli. ESP32 cung cấp 3,3V cho micro và màn hình. Nhóm không nối trực tiếp pin vào chân 5V và không nối loa xuống GND.',points:['Pin – sạc có bảo vệ – công tắc – boost','Phân phối 5V và 3,3V','Không dùng microSD với GPIO38–40']},
  {id:6,title:'Nguyên lý AI và phần mềm',subtitle:'Từ ảnh đến tiếng nói',duration:50,preset:'overview',explode:70,
   speech:'Người dùng bấm nút hoặc ra lệnh. Camera và micro đưa tín hiệu về ESP32. Thiết bị gửi yêu cầu qua Wi-Fi tới máy chủ AI, nhận phản hồi và phát giọng nói tiếng Việt. Hệ thống có độ trễ và phụ thuộc kết nối Internet.',points:['Camera / micro → ESP32','Wi-Fi → AI Cloud → phản hồi','Firmware ESP-IDF/Xiaozhi (cần đối chiếu bản nạp)']},
  {id:7,title:'Biểu diễn trên VisionBot thật',subtitle:'Mời Ban Giám khảo trải nghiệm',duration:35,preset:'front',explode:0,
   speech:'Sau phần mô phỏng, nhóm xin mời Ban Giám khảo trải nghiệm trực tiếp sản phẩm VisionBot. Chúng em xin trình diễn nhận biết vật thể, đọc chữ và hỗ trợ học tập; nếu mạng không ổn định, website có chế độ kịch bản minh họa ngoại tuyến.',points:['Dùng thiết bị vật lý để chứng minh','Đối chiếu với số liệu thực nghiệm','Nêu hạn chế, hướng cải tiến và lời cảm ơn']},
];
export const totalDuration=PRESENTATION_SLIDES.reduce((s,n)=>s+n.duration,0);
export const DEFENSE_QUESTIONS: {q:string;a:string;focus?:ComponentId}[] = [
  {q:'Tại sao chọn ESP32-S3 thay vì Raspberry Pi?',a:'ESP32-S3 nhỏ, tiết kiệm điện, tích hợp Wi-Fi, camera và I2S. Vì không chạy được mô hình AI thị giác lớn tại chỗ, thiết bị dựa vào AI đám mây.',focus:'esp32'},
  {q:'VisionBot hoạt động khi mất Internet không?',a:'Các chức năng cần AI đám mây sẽ không hoạt động đầy đủ. Website minh họa có kịch bản ngoại tuyến, nhưng không thay thế khả năng của rô bốt thật.',focus:'esp32'},
  {q:'Thiết bị có bảo đảm phát hiện vật cản để đi đường không?',a:'Không. Độ trễ mạng và giới hạn nhận diện khiến VisionBot chỉ hỗ trợ quan sát, đọc chữ, học tập; không thay thế gậy trắng hoặc thiết bị an toàn chuyên dụng.',focus:'camera'},
  {q:'Giải thích nguyên tắc hoạt động của micro INMP441?',a:'Micro MEMS tạo dữ liệu âm thanh số theo giao thức I2S; ESP32 nhận dữ liệu qua SCK, WS và SD. Micro dùng điện áp 3,3V.',focus:'mic'},
  {q:'Tại sao không nối loa trực tiếp vào ESP32?',a:'Tín hiệu I2S là dữ liệu số, cần bộ giải mã và khuếch đại MAX98357A. Hai chân SPK+/SPK− là đầu ra vi sai, không nối về GND.',focus:'amp'},
  {q:'Bảo vệ pin Li-Po và tăng áp được thiết kế thế nào?',a:'Pin 1S kết nối mạch sạc có bảo vệ, qua công tắc và bộ boost 5V; cần kiểm tra dòng tiêu thụ, nhiệt, công suất và đặc biệt không vừa sạc vừa dùng với TP4056 thiếu power-path.',focus:'battery'},
  {q:'Vì sao không thể dùng khe microSD?',a:'Trong cấu hình đề xuất, các GPIO38, 39, 40 dành cho nút và xung I2S; các chân này đồng thời được nối với khe microSD, nên dùng cùng lúc sẽ xung đột.',focus:'esp32'},
  {q:'Độ chính xác được đo như thế nào?',a:'Cần bộ dữ liệu thử độc lập, tiêu chí đúng/sai rõ ràng, số lần thử theo từng tác vụ và ghi chép điều kiện ánh sáng, mạng. Số liệu hiện trên web ban đầu chỉ là ví dụ, phải thay bằng số liệu đo thật.'},
  {q:'Điểm mới của đề tài VisionBot là gì?',a:'Cần chứng minh bằng so sánh thực nghiệm: tích hợp phần cứng giá hợp lý, cách giao tiếp tiếng Việt, thiết kế thuận tiện và thử nghiệm với người dùng mục tiêu; không xem việc gọi API AI đơn thuần là phát minh mới.'},
  {q:'Nhóm đã dùng AI trong quá trình nghiên cứu như thế nào?',a:'Cần trình bày trung thực vai trò của công cụ AI khi tìm hiểu kỹ thuật, hỗ trợ lập trình, tạo hình và tài liệu; nhóm học sinh phải trực tiếp hiểu, lắp ráp, đo đạc và kiểm thử sản phẩm.'},
];
