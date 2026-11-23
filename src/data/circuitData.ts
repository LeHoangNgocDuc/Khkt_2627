/**
 * VISIONBOT 3D — SINGLE SOURCE OF TRUTH.
 * All electrical connections, pin labels, header numbering, pin anchors, safety notes,
 * assembly steps and display categories are derived from the structures in this file.
 *
 * STATUS: PROPOSED WIRING, NOT A VERIFIED FIRMWARE REVERSE-ENGINEERING.
 * Check real PCB silkscreen and firmware pin config before connecting hardware.
 * The supplied project brief intentionally allocates GPIO38/39/40 to button/I2S,
 * therefore the board's microSD slot MUST NOT be used simultaneously.
 */

export type ComponentId = 'esp32' | 'camera' | 'tft' | 'mic' | 'amp' | 'speaker' |
  'battery' | 'charger' | 'boost' | 'switch' | 'button' |
  'shellFront' | 'shellMiddle' | 'shellBack';
export type WireGroup = 'nguon' | 'man-hinh' | 'micro' | 'am-thanh' | 'nut-bam';
export type Vec3 = [number, number, number];
export type PinId = string;

export interface PartSpec {
  id: ComponentId;
  title: string;
  subtitle: string;
  explanation: string;
  voltage: string;
  pitch: string;
  assembled: Vec3;
  exploded: Vec3;
  accent: string;
  pinAnchors: Record<PinId, Vec3>;
}
export interface WireSpec {
  id: string;
  from: { component: ComponentId; pin: PinId };
  to: { component: ComponentId; pin: PinId };
  group: WireGroup;
  color: string;
  label: string;
  explanation: string;
  warning?: string;
}
export interface AssemblyStep {
  id: number;
  title: string;
  subtitle: string;
  partIds: ComponentId[];
  groups: WireGroup[];
  explanation: string;
  pitch: string;
  checks: string[];
}
export interface HeaderPin {
  no: number;
  label: string;
  side: 'L' | 'R';
  index: number;
  reserved: 'camera' | 'psram' | 'sd' | 'usb' | 'boot' | 'free' | 'power' | 'onboard';
}

const LEFT_LABELS = [
  '3V3','EN','GPIO4','GPIO5','GPIO6','GPIO7','GPIO15','GPIO16','GPIO17','GPIO18',
  'GPIO8','GPIO3','GPIO46','GPIO9','GPIO10','GPIO11','GPIO12','GPIO13','GPIO14','5V',
];
const RIGHT_LABELS = [
  'GPIO43','GPIO44','GPIO1','GPIO2','GPIO42','GPIO41','GPIO40','GPIO39','GPIO38','GPIO37',
  'GPIO36','GPIO35','GPIO0','GPIO45','GPIO48','GPIO47','GPIO21','GPIO20','GPIO19','GND',
];
const cameraPins = new Set(['GPIO4','GPIO5','GPIO6','GPIO7','GPIO8','GPIO9','GPIO10','GPIO11','GPIO12','GPIO13','GPIO15','GPIO16','GPIO17','GPIO18']);
const sdPins = new Set(['GPIO38','GPIO39','GPIO40']);
const psramPins = new Set(['GPIO35','GPIO36','GPIO37']);
function reserved(label: string): HeaderPin['reserved'] {
  if (cameraPins.has(label)) return 'camera';
  if (psramPins.has(label)) return 'psram';
  if (sdPins.has(label)) return 'sd';
  if (['GPIO19','GPIO20'].includes(label)) return 'usb';
  if (['GPIO0','GPIO45'].includes(label)) return 'boot';
  if (['3V3','5V','GND','EN'].includes(label)) return 'power';
  if (label === 'GPIO48') return 'onboard';
  return 'free';
}
export const HEADER_PINS: HeaderPin[] = [
  ...LEFT_LABELS.map((label, index) => ({ no: index + 1, label, side: 'L' as const, index, reserved: reserved(label) })),
  ...RIGHT_LABELS.map((label, index) => ({ no: 40 - index, label, side: 'R' as const, index, reserved: reserved(label) })),
];
export const HEADER_BY_NAME = Object.fromEntries(HEADER_PINS.map(p => [p.label, p])) as Record<string, HeaderPin>;
const BOARD_ANCHORS: Record<string, Vec3> = Object.fromEntries(HEADER_PINS.map(p => [
  p.label, [p.side === 'L' ? -1.02 : 1.02, 2.22 - p.index * (4.44 / 19), .19] as Vec3,
]));

const tftPins = ['GND','VCC','SCL','SDA','RES','DC','CS','BLK'];
const ampPins = ['VIN','GND','BCLK','LRC','DIN','GAIN','SD'];
const micPins = ['VDD','GND','SCK','WS','SD','L/R'];
const lineAnchors = (names: string[], x: number, top: number, gap: number): Record<string,Vec3> =>
  Object.fromEntries(names.map((n,i) => [n, [x,top-i*gap,.12] as Vec3]));

export const PARTS: Record<ComponentId, PartSpec> = {
  esp32: {
    id:'esp32', title:'ESP32-S3-CAM', subtitle:'GOOUUU • 40 chân • 2 USB-C', voltage:'5V vào VIN; GPIO logic 3,3V', accent:'#38bdf8',
    explanation:'Bo điều khiển thu ảnh từ camera FPC, kết nối Wi-Fi và điều khiển màn hình, micro, ampli qua SPI/I2S. Camera dùng chân GPIO nội bộ, không phải dây tín hiệu rời.',
    pitch:'Đây là bộ não của VisionBot. ESP32-S3 thu hình, thu giọng nói và chuyển dữ liệu qua Wi-Fi tới máy chủ AI.',
    assembled:[-.65,.25,-.10], exploded:[-2.10,.3,.10], pinAnchors:BOARD_ANCHORS,
  },
  camera: {
    id:'camera',title:'Camera OV2640 / OV5640',subtitle:'Đầu nối FPC nội bộ',voltage:'Theo module camera',accent:'#34d399',
    explanation:'Camera nối trực tiếp với đầu FPC của bo ESP32-S3-CAM, không đấu dây Dupont ra các GPIO camera. Chân DVP phải giữ nguyên theo board.',
    pitch:'Ống kính ghi nhận hình ảnh, sau đó dữ liệu được gửi lên AI để mô tả bằng tiếng Việt.',
    assembled:[-.65,1.05,.35],exploded:[-2.1,1.25,.5],pinAnchors:{},
  },
  tft: {
    id:'tft',title:'Màn hình TFT ST7789',subtitle:'1,54 inch • SPI • 8 chân',voltage:'VCC 3,3V (theo module)',accent:'#60a5fa',
    explanation:'Hiển thị trạng thái khởi động, Wi-Fi, mức pin và hoạt động của trợ lý; SPI sử dụng SCL/SDA/CS/DC/RST. Phân biệt SDA là MOSI, không phải I²C.',
    pitch:'Màn hình cho người hỗ trợ biết VisionBot đang lắng nghe, phân tích hay đọc kết quả.',
    assembled:[.85,.9,.86],exploded:[-4.7,1.5,.7],pinAnchors:lineAnchors(tftPins,-.97,1.02,.26),
  },
  mic: {
    id:'mic',title:'Micro INMP441',subtitle:'MEMS • I2S RX • 6 chân',voltage:'3,3V; không cấp 5V',accent:'#a78bfa',
    explanation:'Thu lời nói từ người dùng. SCK và WS dùng chung xung I2S với ampli; SD là dữ liệu thu riêng, L/R kéo GND chọn kênh trái.',
    pitch:'Người dùng nói câu lệnh; micro biến tín hiệu âm thanh thành dữ liệu số truyền vào ESP32-S3.',
    assembled:[-1,-1.1,.8],exploded:[-4.4,-1.1,.7],pinAnchors:lineAnchors(micPins,-.82,.61,.23),
  },
  amp: {
    id:'amp',title:'MAX98357A',subtitle:'Giải mã/khuếch đại âm thanh I2S',voltage:'VIN 5V (đề xuất)',accent:'#c084fc',
    explanation:'Nhận luồng I2S từ ESP32 và khuếch đại để phát qua loa. Ngõ ra loa kiểu cầu H/BTL; không nối bất kỳ đầu loa nào vào GND.',
    pitch:'MAX98357A biến dữ liệu tiếng nói thành tín hiệu đủ mạnh để phát ra loa.',
    assembled:[.72,-.45,-.56],exploded:[2.20,1.20,.46],pinAnchors:{...lineAnchors(ampPins,-.78,.72,.22), 'SPK+':[.8,.35,.13], 'SPK-':[.8,-.33,.13]},
  },
  speaker: {
    id:'speaker',title:'Loa 4–8 Ω',subtitle:'Màng loa • 2 cực độc lập',voltage:'SPK+/SPK− từ ampli',accent:'#f59e0b',
    explanation:'Loa được điều khiển bởi ngõ ra vi sai của MAX98357A. Không nối một đầu loa về GND.',
    pitch:'Âm thanh cuối cùng được phát qua loa để người khiếm thị nghe lời mô tả.',
    assembled:[1.10,-1.62,-.38],exploded:[4.65,1.15,.4],pinAnchors:{'+':[-.99,.33,.10],'-':[-.99,-.33,.10]},
  },
  battery: {
    id:'battery',title:'Pin Li-Po 1S',subtitle:'3,7V danh định • 1000mAh',voltage:'3,0–4,2V tùy tình trạng pin',accent:'#fb7185',
    explanation:'Nguồn lưu trữ năng lượng; dây đỏ (+), dây đen (−) cấp cho B+/B− mạch sạc có bảo vệ. Cần tránh chập và ép thủng pin.',
    pitch:'Pin cung cấp năng lượng để VisionBot có thể mang theo người và hoạt động không cần cắm điện.',
    assembled:[-.20,-1.63,-.52],exploded:[.65,-2.70,.18],pinAnchors:{'+':[.9,.52,.10],'-':[.56,.52,.10]},
  },
  charger: {
    id:'charger',title:'TP4056 có bảo vệ',subtitle:'Sạc Li-Po • B+/B− • OUT+/OUT−',voltage:'Pin 1S; ngõ ra theo điện áp pin',accent:'#22d3ee',
    explanation:'Sạc pin Li-Po 1S. Mạch phải có 4 pad B+,B−,OUT+,OUT− đúng cấu hình bảo vệ; không mặc định mọi TP4056 đều có OUT riêng.',
    pitch:'Mạch sạc giúp nạp lại pin, đồng thời mạch bảo vệ phù hợp hạn chế quá xả/quá dòng.',
    assembled:[-1.03,-2.60,-.45],exploded:[-2.65,-3.20,.30],pinAnchors:{'B+':[-.63,.58,.10],'B-':[-.34,.58,.10],'OUT+':[.42,-.58,.10],'OUT-':[.65,-.58,.10]},
  },
  boost: {
    id:'boost',title:'Bộ tăng áp 5V',subtitle:'DC-DC • Cuộn cảm 4R7',voltage:'IN: điện áp pin; OUT: 5,0V',accent:'#fbbf24',
    explanation:'Nâng nguồn từ pin Li-Po lên 5,0V ổn định cho ESP32 chân 5V và ampli. Kiểm tra dòng chịu tải của module thực tế.',
    pitch:'Bộ tăng áp giữ mức 5V ổn định khi điện áp của pin giảm trong quá trình sử dụng.',
    assembled:[.60,-2.56,-.48],exploded:[-.65,-3.22,.3],pinAnchors:{'IN+':[-.64,-.35,.10],'IN-':[-.64,-.63,.10],'OUT+':[.64,.38,.10],'OUT-':[.64,.08,.10]},
  },
  switch: {
    id:'switch',title:'Công tắc nguồn',subtitle:'Gạt mini • COM / ON',voltage:'Điện áp đầu ra pin',accent:'#a3e635',
    explanation:'Ngắt đường dương giữa TP4056 OUT+ và Boost IN+; không chuyển mạch trực tiếp trên chân GND tải.',
    pitch:'Công tắc cho phép bật hoặc tắt VisionBot mà không phải tháo pin.',
    assembled:[1.58,-2.57,-.40],exploded:[3.18,-2.65,.45],pinAnchors:{COM:[-.38,-.16,.10],ON:[.38,-.16,.10]},
  },
  button: {
    id:'button',title:'Nút tác vụ',subtitle:'Tiếp điểm thường hở (NO)',voltage:'GPIO38 với INPUT_PULLUP',accent:'#86efac',
    explanation:'Nhấn nút để kích hoạt chụp ảnh/ra lệnh. Một chân nối GPIO38, một chân về GND; cần tránh nhầm tiếp điểm của nút bốn chân.',
    pitch:'Người dùng có thể bấm một nút để gọi nhanh thao tác chụp và mô tả cảnh vật.',
    assembled:[0,-2.22,1.02],exploded:[-4.62,-2.65,.82],pinAnchors:{'1':[-.40,-.25,.12],'2':[.40,-.25,.12]},
  },
  shellFront:{id:'shellFront',title:'Vỏ trước',subtitle:'PLA/PETG xanh • mặt hiển thị',voltage:'Không có điện',accent:'#3b82f6',
    explanation:'Tấm vỏ có khung camera, TFT, lỗ micro và nút tác vụ; có thể trong suốt để quan sát bên trong.',
    pitch:'Vỏ được thiết kế và in 3D, giúp lắp gọn các linh kiện và thuận tiện mang theo.',
    assembled:[0,0,1.12],exploded:[-7.15,0,1.10],pinAnchors:{}},
  shellMiddle:{id:'shellMiddle',title:'Khung giữa',subtitle:'Khung lắp vít • khoang ngăn âm',voltage:'Không có điện',accent:'#64748b',
    explanation:'Giữ bo mạch, pin và vách ngăn giữa loa với micro; bố trí khoảng trống chống ép pin và chống hồi tiếp âm.',
    pitch:'Khung giữa định vị các bộ phận và hạn chế tiếng loa dội ngược vào micro.',
    assembled:[0,0,-.60],exploded:[0,0,-.7],pinAnchors:{}},
  shellBack:{id:'shellBack',title:'Nắp sau',subtitle:'Khe công tắc • khe sạc',voltage:'Không có điện',accent:'#3b82f6',
    explanation:'Nắp sau gắn vít, có cửa tiếp cận cổng sạc và công tắc; kích thước cần đo lại theo bản in thực tế.',
    pitch:'Nắp sau bảo vệ các dây nối và mạch nguồn mà vẫn cho phép sạc pin thuận tiện.',
    assembled:[0,0,-1.15],exploded:[7.25,0,-.9],pinAnchors:{}},
};

const w = (
  id:string,from:ComponentId,fromPin:string,to:ComponentId,toPin:string,
  group:WireGroup,color:string,label:string,explanation:string,warning?:string,
):WireSpec => ({id,from:{component:from,pin:fromPin},to:{component:to,pin:toPin},group,color,label,explanation,warning});
export const WIRES: WireSpec[] = [
  // Power chain, all ground rails are explicit.
  w('P01','battery','+','charger','B+','nguon','#ef4444','Pin + → TP4056 B+','Dây dương của pin Li-Po vào chân B+ của bộ sạc.'),
  w('P02','battery','-','charger','B-','nguon','#475569','Pin − → TP4056 B−','Dây âm của pin vào B−, không bỏ qua mạch bảo vệ.'),
  w('P03','charger','OUT+','switch','COM','nguon','#fb7185','OUT+ → Công tắc COM','Dây nguồn dương từ đầu ra bộ bảo vệ đến công tắc.'),
  w('P04','switch','ON','boost','IN+','nguon','#fb7185','Công tắc ON → BOOST IN+','Khi bật, nguồn pin đi qua công tắc tới đầu vào bộ tăng áp.'),
  w('P05','charger','OUT-','boost','IN-','nguon','#64748b','OUT− → BOOST IN−','Đầu ra âm của TP4056 về mạch tăng áp.'),
  w('P06','boost','OUT+','esp32','5V','nguon','#ef4444','BOOST 5V → ESP32 5V','Chỉ cấp 5V đã đo ổn định vào chân 5V.','Không cấp 5V vào chân 3V3.'),
  w('P07','boost','OUT+','amp','VIN','nguon','#ef4444','BOOST 5V → MAX98357A VIN','Ampli sử dụng nguồn 5V theo cấu hình đề xuất.'),
  w('P08','boost','OUT-','esp32','GND','nguon','#475569','BOOST GND → ESP32 GND','Tạo mốc GND chung cho hệ thống.'),
  w('P09','boost','OUT-','amp','GND','nguon','#475569','BOOST GND → MAX98357A GND','GND của ampli nối nguồn chung.'),
  w('P10','esp32','3V3','tft','VCC','nguon','#fb923c','ESP32 3V3 → TFT VCC','Chỉ dùng nếu đúng module ST7789 chấp nhận 3,3V.'),
  w('P11','esp32','GND','tft','GND','nguon','#475569','ESP32 GND → TFT GND','Màn hình chung GND với ESP32.'),
  w('P12','esp32','3V3','mic','VDD','nguon','#fb923c','ESP32 3V3 → INMP441 VDD','Micro INMP441 dùng mức 3,3V.','Không nối VDD của INMP441 vào 5V.'),
  w('P13','esp32','GND','mic','GND','nguon','#475569','ESP32 GND → INMP441 GND','GND của micro nối GND chung.'),
  w('P14','esp32','GND','mic','L/R','nguon','#475569','ESP32 GND → Micro L/R','Chọn kênh trái cho dữ liệu micro.'),
  w('P15','esp32','3V3','tft','BLK','nguon','#fb923c','3V3 → TFT BLK','Chỉ nối trực tiếp khi PCB màn hình đã có điện trở hạn dòng đèn nền; nếu không cần mạch hạn dòng/driver.','Không nối BLK trực tiếp nếu không rõ mạch hạn dòng.'),
  // LCD signal: configured GPIO mapping per project brief (not necessarily flashed firmware).
  w('T01','esp32','GPIO42','tft','SCL','man-hinh','#38bdf8','GPIO42 → TFT SCL/SCK','Clock bus SPI cho màn hình.'),
  w('T02','esp32','GPIO14','tft','SDA','man-hinh','#22d3ee','GPIO14 → TFT SDA/MOSI','Dữ liệu SPI MOSI từ ESP32 sang màn hình.'),
  w('T03','esp32','GPIO1','tft','RES','man-hinh','#60a5fa','GPIO1 → TFT RES/RST','Đặt lại bộ điều khiển LCD.'),
  w('T04','esp32','GPIO2','tft','DC','man-hinh','#06b6d4','GPIO2 → TFT DC','Phân biệt lệnh/dữ liệu LCD.'),
  w('T05','esp32','GPIO21','tft','CS','man-hinh','#3b82f6','GPIO21 → TFT CS','Chân chọn chip LCD.'),
  // RX/TX share I2S BCLK and WS; firmware must support shared clocks.
  w('M01','esp32','GPIO39','mic','SCK','micro','#a78bfa','GPIO39 → INMP441 SCK','Clock bit (BCLK) dùng chung I2S với ampli.','GPIO39 trùng chức năng thẻ nhớ microSD.'),
  w('M02','esp32','GPIO40','mic','WS','micro','#8b5cf6','GPIO40 → INMP441 WS','Clock kênh LRCLK/WS dùng chung I2S.','GPIO40 trùng chức năng thẻ nhớ microSD.'),
  w('M03','esp32','GPIO41','mic','SD','micro','#f0abfc','GPIO41 ← INMP441 SD','Tín hiệu dữ liệu microphone RX vào ESP32.'),
  w('A01','esp32','GPIO39','amp','BCLK','am-thanh','#a78bfa','GPIO39 → MAX98357A BCLK','Bus I2S dùng chung clock bit.'),
  w('A02','esp32','GPIO40','amp','LRC','am-thanh','#8b5cf6','GPIO40 → MAX98357A LRC','Bus I2S dùng chung clock phân kênh.'),
  w('A03','esp32','GPIO47','amp','DIN','am-thanh','#c084fc','GPIO47 → MAX98357A DIN','Tín hiệu âm thanh số I2S TX.'),
  w('A04','amp','SPK+','speaker','+','am-thanh','#facc15','MAX SPK+ → Loa (+)','Ngõ ra vi sai phía dương tới loa.','Không nối bất kỳ chân loa nào xuống GND.'),
  w('A05','amp','SPK-','speaker','-','am-thanh','#a16207','MAX SPK− → Loa (−)','Ngõ ra vi sai phía âm tới loa.','Không nối SPK− xuống GND.'),
  // Button
  w('B01','esp32','GPIO38','button','1','nut-bam','#84cc16','GPIO38 → Nút chân 1','Kéo lên nội bộ INPUT_PULLUP, nhấn mức LOW.','GPIO38 trùng chân khe thẻ nhớ microSD.'),
  w('B02','esp32','GND','button','2','nut-bam','#475569','GND → Nút chân 2','Nút NO đóng mạch về GND khi nhấn.'),
];
export const WIRE_GROUPS: Record<WireGroup, {label:string,color:string,description:string}> = {
  nguon:{label:'Nguồn & GND',color:'#ef4444',description:'Pin Li-Po, sạc, công tắc, boost 5V và đường 3V3/GND'},
  'man-hinh':{label:'Màn hình SPI',color:'#38bdf8',description:'Tín hiệu SPI từ ESP32 tới TFT ST7789'},
  micro:{label:'Micro I2S RX',color:'#a78bfa',description:'Thu âm số với xung BCLK và WS dùng chung'},
  'am-thanh':{label:'Ampli I2S & loa',color:'#d8b4fe',description:'Tín hiệu tiếng nói tới ampli và loa'},
  'nut-bam':{label:'Nút điều khiển',color:'#84cc16',description:'GPIO38 kéo lên nội bộ, nút kéo xuống GND'},
};
export const ASSEMBLY_STEPS: AssemblyStep[] = [
  {id:1,title:'Pin, mạch sạc và tăng áp',subtitle:'Thiết lập nguồn có bảo vệ',partIds:['battery','charger','boost','switch'],groups:['nguon'],
   explanation:'Xác nhận đúng TP4056 có bảo vệ bốn pad; nối B+/B− của pin, OUT+/OUT− qua công tắc đến IN+/IN− boost và đo OUT 5,0V trước khi cấp vào ESP32.',
   pitch:'Nhóm chúng em bắt đầu từ khối nguồn, vì cấp sai điện áp có thể làm hỏng bo mạch.',checks:['Đo đúng cực tính và điện áp đầu ra','Không chập hai cực Li-Po','Chỉ bật khi đã kiểm tra đầu ra boost']},
  {id:2,title:'Phân phối 5V và 3V3',subtitle:'Lấy nguồn chung cho các module',partIds:['esp32','tft','mic','amp','boost'],groups:['nguon'],
   explanation:'Boost OUT+ cấp 5V cho ESP32 và ampli; nguồn 3V3 từ ESP32 cấp cho TFT và micro; tất cả thiết bị dùng GND chung.',
   pitch:'ESP32 và ampli dùng nguồn 5V, trong khi micro và màn hình dùng nhánh 3,3V.',checks:['Không đưa 5V vào GPIO hoặc VDD micro','Đo tải khi phát loa','GND chung không bỏ qua OUT− bảo vệ']},
  {id:3,title:'Camera nối FPC',subtitle:'Đầu cáp dẹt tích hợp trên PCB',partIds:['camera','esp32'],groups:[],
   explanation:'Mở ngàm đầu nối FPC, gắn cáp camera đúng mặt tiếp xúc, khóa ngàm; không đấu thêm dây Dupont vào các chân camera GPIO4–13 và 15–18.',
   pitch:'Camera dùng cáp dẹt gắn trực tiếp vào bo trung tâm, giảm dây nối và giảm nhiễu tín hiệu ảnh.',checks:['Kiểm tra hướng tiếp xúc FPC','Không gập gãy cáp camera','Thử nhận ảnh trước khi đóng vỏ']},
  {id:4,title:'Màn hình TFT ST7789',subtitle:'8 dây nguồn và SPI',partIds:['esp32','tft'],groups:['man-hinh','nguon'],
   explanation:'Nối 3V3, GND, GPIO42→SCL, GPIO14→SDA, GPIO1→RST, GPIO2→DC, GPIO21→CS. BLK chỉ nối 3V3 nếu module có hạn dòng LED.',
   pitch:'Màn hình dùng SPI để cập nhật nhanh các trạng thái Wi-Fi và AI.',checks:['Xác nhận thứ tự chân trên module thật','BLK có điện trở hạn dòng','Firmware cấu hình đúng driver ST7789']},
  {id:5,title:'Micro INMP441',subtitle:'I2S RX / 3,3V',partIds:['esp32','mic'],groups:['micro','nguon'],
   explanation:'Nối VDD→3V3, GND→GND, L/R→GND, SCK→GPIO39, WS→GPIO40 và SD→GPIO41. Cấm dùng microSD với GPIO39/40.',
   pitch:'Micro MEMS dùng tín hiệu số I2S để thu âm rõ ràng hơn microphone analog.',checks:['Nguồn micro 3,3V','L/R nối GND','Không dùng khe microSD đồng thời']},
  {id:6,title:'Ampli MAX98357A và loa',subtitle:'I2S TX / ngõ ra vi sai',partIds:['amp','speaker','esp32'],groups:['am-thanh','nguon'],
   explanation:'Nối VIN 5V, GND chung, BCLK GPIO39, LRC GPIO40, DIN GPIO47. Loa nối SPK+ và SPK− trực tiếp với cọc tương ứng.',
   pitch:'Ampli nhận gói dữ liệu âm thanh số rồi điều khiển hai cực của loa để phát lời nói.',checks:['Hai cực loa không nối GND','Giảm âm lượng khi thử lần đầu','Kiểm tra chế độ xung I2S TX/RX trong firmware']},
  {id:7,title:'Nút nhấn và hoàn thiện',subtitle:'Đóng vỏ, kiểm tra tổng thể',partIds:['button','shellFront','shellMiddle','shellBack','esp32'],groups:['nut-bam'],
   explanation:'Nối nút NO từ GPIO38 về GND, bật INPUT_PULLUP trong firmware; bố trí khoang pin không bị cấn, kiểm tra dây trước khi bắt vít đóng nắp.',
   pitch:'Sau cùng, VisionBot chỉ cần một thao tác đơn giản để người dùng gọi chức năng hỗ trợ.',checks:['Thử nút nhấn ở chế độ INPUT_PULLUP','Kiểm tra không kẹp cáp/pin khi đóng vỏ','Vỏ có lỗ microphone và thoát âm loa']},
];
export const SAFETY_WARNINGS = [
  'Không cấp 5V vào chân 3V3 của ESP32 hoặc VDD của INMP441.',
  'Không nối pin Li-Po 1S trực tiếp với chân 5V; dùng bộ tăng áp đã kiểm tra.',
  'Loa phải nối vào SPK+ và SPK−; tuyệt đối không nối một đầu loa về GND.',
  'Không lắp thẻ microSD nếu GPIO38/39/40 được dùng cho nút và I2S.',
  'Đối chiếu model mạch sạc có cuộn cảm 4R7; TP4056 phổ thông không có power-path để vừa sạc vừa chạy.',
];

export const allPartList = Object.values(PARTS);
export const getConnectedWires = (id: ComponentId) => WIRES.filter(w => w.from.component===id || w.to.component===id);
export const getPinHeaderNo = (label: string): number | undefined => HEADER_BY_NAME[label]?.no;
export const mixVec = (a: Vec3, b: Vec3, t: number): Vec3 => [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
export const positionFor = (id: ComponentId, explode: number): Vec3 => mixVec(PARTS[id].assembled, PARTS[id].exploded,explode);
export const anchorFor = (id: ComponentId, pin: PinId, explode: number): Vec3 => {
  const part = PARTS[id];
  const local = part.pinAnchors[pin];
  if (!local) throw new Error(`Chưa có neo chân: ${id}.${pin}`);
  const pos = positionFor(id,explode);
  return [pos[0]+local[0],pos[1]+local[1],pos[2]+local[2]];
};
/** Runtime structural test can run this without WebGL. */
export function validateCircuit(): string[] {
  const errors: string[] = [];
  for (const w of WIRES) {
    for (const terminal of [w.from,w.to]) {
      if (!PARTS[terminal.component]?.pinAnchors[terminal.pin]) errors.push(`Mất chân ${terminal.component}.${terminal.pin} (${w.id})`);
    }
  }
  const ids = WIRES.map(w => w.id);
  if (new Set(ids).size !== ids.length) errors.push('Trùng mã dây nối');
  return errors;
}


/** Source-of-truth coordinates for the industrial flat-lay wiring board (SVG viewBox units). */
export type FlatPoint = readonly [number, number];
export type FlatBox = Readonly<{ x:number; y:number; width:number; height:number }>;
export type FlatPad = Readonly<{ x:number; y:number; side:'left'|'right' }>;
export const FLAT_SIZE = {width:2300,height:1440} as const;
export const FLAT_BOUNDS: Partial<Record<ComponentId,FlatBox>> = {
  esp32:{x:930,y:260,width:345,height:840},
  battery:{x:95,y:225,width:280,height:195},
  charger:{x:95,y:540,width:300,height:205},
  switch:{x:135,y:885,width:285,height:125},
  boost:{x:490,y:1130,width:310,height:220},
  tft:{x:1480,y:135,width:352,height:345},
  button:{x:1935,y:170,width:240,height:188},
  mic:{x:1445,y:645,width:330,height:270},
  amp:{x:1845,y:655,width:340,height:286},
  speaker:{x:1960,y:1065,width:225,height:225},
};
export const FLAT_PINS: Partial<Record<ComponentId,Record<PinId,FlatPad>>> = {
  esp32:{"3V3":{x:939,y:310,side:"left"},"EN":{x:939,y:348,side:"left"},"GPIO4":{x:939,y:386,side:"left"},"GPIO5":{x:939,y:424,side:"left"},"GPIO6":{x:939,y:462,side:"left"},"GPIO7":{x:939,y:500,side:"left"},"GPIO15":{x:939,y:538,side:"left"},"GPIO16":{x:939,y:576,side:"left"},"GPIO17":{x:939,y:614,side:"left"},"GPIO18":{x:939,y:652,side:"left"},"GPIO8":{x:939,y:690,side:"left"},"GPIO3":{x:939,y:728,side:"left"},"GPIO46":{x:939,y:766,side:"left"},"GPIO9":{x:939,y:804,side:"left"},"GPIO10":{x:939,y:842,side:"left"},"GPIO11":{x:939,y:880,side:"left"},"GPIO12":{x:939,y:918,side:"left"},"GPIO13":{x:939,y:956,side:"left"},"GPIO14":{x:939,y:994,side:"left"},"5V":{x:939,y:1032,side:"left"},"GPIO43":{x:1266,y:310,side:"right"},"GPIO44":{x:1266,y:348,side:"right"},"GPIO1":{x:1266,y:386,side:"right"},"GPIO2":{x:1266,y:424,side:"right"},"GPIO42":{x:1266,y:462,side:"right"},"GPIO41":{x:1266,y:500,side:"right"},"GPIO40":{x:1266,y:538,side:"right"},"GPIO39":{x:1266,y:576,side:"right"},"GPIO38":{x:1266,y:614,side:"right"},"GPIO37":{x:1266,y:652,side:"right"},"GPIO36":{x:1266,y:690,side:"right"},"GPIO35":{x:1266,y:728,side:"right"},"GPIO0":{x:1266,y:766,side:"right"},"GPIO45":{x:1266,y:804,side:"right"},"GPIO48":{x:1266,y:842,side:"right"},"GPIO47":{x:1266,y:880,side:"right"},"GPIO21":{x:1266,y:918,side:"right"},"GPIO20":{x:1266,y:956,side:"right"},"GPIO19":{x:1266,y:994,side:"right"},"GND":{x:1266,y:1032,side:"right"}},
  battery:{"+":{x:365,y:294,side:"right"},"-":{x:365,y:354,side:"right"}},
  charger:{"B+":{x:105,y:593,side:"left"},"B-":{x:105,y:672,side:"left"},"OUT+":{x:386,y:593,side:"right"},"OUT-":{x:386,y:672,side:"right"}},
  switch:{"COM":{x:145,y:932,side:"left"},"ON":{x:410,y:932,side:"right"}},
  boost:{"IN+":{x:500,y:1194,side:"left"},"IN-":{x:500,y:1272,side:"left"},"OUT+":{x:792,y:1194,side:"right"},"OUT-":{x:792,y:1272,side:"right"}},
  tft:{"GND":{x:1490,y:181,side:"left"},"VCC":{x:1490,y:218,side:"left"},"SCL":{x:1490,y:255,side:"left"},"SDA":{x:1490,y:292,side:"left"},"RES":{x:1490,y:329,side:"left"},"DC":{x:1490,y:366,side:"left"},"CS":{x:1490,y:403,side:"left"},"BLK":{x:1490,y:440,side:"left"}},
  button:{"1":{x:1945,y:240,side:"left"},"2":{x:2165,y:301,side:"right"}},
  mic:{"VDD":{x:1455,y:698,side:"left"},"GND":{x:1455,y:736,side:"left"},"SCK":{x:1455,y:774,side:"left"},"WS":{x:1455,y:812,side:"left"},"SD":{x:1455,y:850,side:"left"},"L/R":{x:1455,y:888,side:"left"}},
  amp:{"VIN":{x:1855,y:700,side:"left"},"GND":{x:1855,y:735,side:"left"},"BCLK":{x:1855,y:770,side:"left"},"LRC":{x:1855,y:805,side:"left"},"DIN":{x:1855,y:840,side:"left"},"GAIN":{x:1855,y:875,side:"left"},"SD":{x:1855,y:910,side:"left"},"SPK+":{x:2175,y:752,side:"right"},"SPK-":{x:2175,y:822,side:"right"}},
  speaker:{"+":{x:1970,y:1135,side:"left"},"-":{x:1970,y:1215,side:"left"}},
};
/** Pre-routed 90-degree routes with avoidance of component bodies. Regenerate when pad coordinates change. */
export const FLAT_ROUTES: Record<string,readonly FlatPoint[]> = {
  'P01':[[365,294],[410,294],[410,510],[60,510],[60,593],[105,593]],
  'P02':[[365,354],[410,354],[410,350],[400,350],[400,440],[40,440],[40,670],[60,670],[60,672],[105,672]],
  'P03':[[386,593],[430,593],[430,850],[100,850],[100,932],[145,932]],
  'P04':[[410,932],[460,932],[460,1190],[450,1190],[450,1194],[500,1194]],
  'P05':[[386,672],[430,672],[430,670],[450,670],[450,920],[440,920],[440,1270],[450,1270],[450,1272],[500,1272]],
  'P06':[[792,1194],[840,1194],[840,1030],[890,1030],[890,1032],[939,1032]],
  'P07':[[792,1194],[840,1194],[840,1190],[1810,1190],[1810,700],[1855,700]],
  'P08':[[792,1272],[840,1272],[840,1270],[1310,1270],[1310,1032],[1266,1032]],
  'P09':[[792,1272],[840,1272],[840,1290],[1780,1290],[1780,940],[1800,940],[1800,740],[1810,740],[1810,735],[1855,735]],
  'P10':[[939,310],[890,310],[890,220],[1440,220],[1440,218],[1490,218]],
  'P11':[[1266,1032],[1310,1032],[1310,240],[1450,240],[1450,180],[1440,180],[1440,181],[1490,181]],
  'P12':[[939,310],[900,310],[900,230],[1310,230],[1310,250],[1330,250],[1330,700],[1410,700],[1410,698],[1455,698]],
  'P13':[[1266,1032],[1310,1032],[1310,1030],[1410,1030],[1410,736],[1455,736]],
  'P14':[[1266,1032],[1310,1032],[1310,1030],[1320,1030],[1320,1010],[1350,1010],[1350,890],[1410,890],[1410,888],[1455,888]],
  'P15':[[939,310],[870,310],[870,200],[1440,200],[1440,440],[1490,440]],
  'T01':[[1266,462],[1310,462],[1310,460],[1420,460],[1420,260],[1440,260],[1440,255],[1490,255]],
  'T02':[[939,994],[890,994],[890,990],[900,990],[900,1120],[1300,1120],[1300,990],[1330,990],[1330,720],[1410,720],[1410,480],[1450,480],[1450,290],[1440,290],[1440,292],[1490,292]],
  'T03':[[1266,386],[1310,386],[1310,390],[1400,390],[1400,330],[1440,330],[1440,329],[1490,329]],
  'T04':[[1266,424],[1310,424],[1310,420],[1410,420],[1410,370],[1440,370],[1440,366],[1490,366]],
  'T05':[[1266,918],[1310,918],[1310,920],[1320,920],[1320,680],[1390,680],[1390,470],[1430,470],[1430,400],[1440,400],[1440,403],[1490,403]],
  'M01':[[1266,576],[1310,576],[1310,580],[1320,580],[1320,710],[1330,710],[1330,730],[1350,730],[1350,770],[1410,770],[1410,774],[1455,774]],
  'M02':[[1266,538],[1310,538],[1310,540],[1300,540],[1300,810],[1410,810],[1410,812],[1455,812]],
  'M03':[[1266,500],[1370,500],[1370,850],[1455,850]],
  'A01':[[1266,576],[1310,576],[1310,580],[1800,580],[1800,740],[1810,740],[1810,770],[1855,770]],
  'A02':[[1266,538],[1310,538],[1310,540],[1810,540],[1810,805],[1855,805]],
  'A03':[[1266,880],[1350,880],[1350,900],[1370,900],[1370,940],[1810,940],[1810,840],[1855,840]],
  'A04':[[2175,752],[2220,752],[2220,1030],[1920,1030],[1920,1135],[1970,1135]],
  'A05':[[2175,822],[2220,822],[2220,820],[2210,820],[2210,960],[1900,960],[1900,1220],[1920,1220],[1920,1215],[1970,1215]],
  'B01':[[1266,614],[1310,614],[1310,610],[1900,610],[1900,240],[1945,240]],
  'B02':[[1266,1032],[1310,1032],[1310,1040],[1880,1040],[1880,980],[2240,980],[2240,300],[2210,300],[2210,301],[2165,301]],
};
/** Electrical/visual cross-checks for the 2D map. */
export function validateFlatBoard():string[]{
 const errors:string[]=[];
 for(const wire of WIRES){
  const from=FLAT_PINS[wire.from.component]?.[wire.from.pin];
  const to=FLAT_PINS[wire.to.component]?.[wire.to.pin];
  const route=FLAT_ROUTES[wire.id];
  if(!from||!to||!route?.length){errors.push(`Thiếu tọa độ dây ${wire.id}`);continue;}
  const first=route[0],last=route[route.length-1];
  if(first[0]!==from.x||first[1]!==from.y||last[0]!==to.x||last[1]!==to.y){errors.push(`Dây ${wire.id} lệch tâm pad`);}
  for(let i=0;i<route.length-1;i++){
   if(route[i][0]!==route[i+1][0]&&route[i][1]!==route[i+1][1])errors.push(`${wire.id} có đoạn chéo`);
  }
 }
 return errors;
}
