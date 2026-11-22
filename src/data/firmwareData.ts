/** Metadata supplied in the project brief. NOT read back from the user's device. */
export const FIRMWARE_PROFILE = {
  title:'Xiaozhi v2.0.3',
  sdk:'ESP-IDF v5.5.1',
  board:'bev88-Robert-Tran / ZHENGCHEN_1_54TFT_WIFI',
  flashTool:'Espressif Flash Download Tool v3.9.7',
  target:'ESP32-S3',
  mode:'Develop • DoNotChgBin',
  clock:'80MHz',
  ioMode:'DIO',
  flash:'Winbond QUAD 16MB',
  crystal:'40MHz',
  baud:'460800',
  notes:[
    'Màn hình ST7789 qua SPI3_HOST và LVGL 9; đèn nền PWM/LEDC.',
    'Âm thanh I2S, Opus; ESP-SR với WakeNet/VADNet/NSNet (theo thuyết minh).',
    'MCP: self.camera.take_photo; cổng cấu hình Wi-Fi 192.168.4.1.',
    'Đo pin ADC_CHANNEL_7 và cảm biến nhiệt độ trong (cần kiểm tra pin firmware thực tế).',
  ],
};

export interface FlashFile {
  id:string;
  filename:string;
  offset:number;
  purpose:string;
  detail:string;
  color:string;
}
export const FLASH_SIZE = 16 * 1024 * 1024;
export const FLASH_FILES: FlashFile[] = [
  {id:'bootloader',filename:'bootloader.bin',offset:0x000000,purpose:'Khởi động ESP32-S3',detail:'Chương trình khởi động và cấu hình truy cập flash; địa chỉ từ bản đặc tả, phải đối chiếu bộ file thực tế.',color:'#38bdf8'},
  {id:'partition',filename:'partition-table.bin',offset:0x008000,purpose:'Bảng phân vùng flash',detail:'Tham chiếu nvs, otadata, phy_init, ota_0, ota_1 và assets. Địa chỉ/kích thước từng phân vùng cần file .csv/.bin để xác nhận.',color:'#818cf8'},
  {id:'ota',filename:'ota_data_initial.bin',offset:0x00d000,purpose:'Quản lý OTA',detail:'Theo đặc tả: dữ liệu chọn vùng chạy OTA. Không tự động kết luận phần mềm thực tế đã nạp.',color:'#a78bfa'},
  {id:'main',filename:'xiaozhi.bin',offset:0x020000,purpose:'Chương trình chính',detail:'UI LVGL 9, ST7789, I2S, Opus, giao tiếp AI/MCP và cấu hình Wi-Fi.',color:'#34d399'},
  {id:'assets',filename:'generated_assets.bin',offset:0x800000,purpose:'Tài nguyên & mô hình',detail:'Theo tài liệu: font tiếng Việt, emoji và tài nguyên giọng nói. Dung lượng thực phải lấy từ file tải lên.',color:'#fbbf24'},
];

export type ComparisonResult = 'match'|'mismatch'|'unknown';
export interface CodePin {
  name:string;
  pin:number;
  line:number;
  expected?:number;
  functionName?:string;
  verdict:ComparisonResult;
}
// Names are hints only; regex scanning cannot fully resolve macros or conditional compilation.
const PIN_ALIASES: {functionName:string; expected:number; test:RegExp}[] = [
  {functionName:'TFT SCL/SCK',expected:42,test:/(LCD|TFT|ST7789|DISPLAY).*(SCL|SCK|CLK)/i},
  {functionName:'TFT SDA/MOSI',expected:14,test:/(LCD|TFT|ST7789|DISPLAY).*(SDA|MOSI|DIN)/i},
  {functionName:'TFT RST',expected:1,test:/(LCD|TFT|ST7789|DISPLAY).*(RST|RES|RESET)/i},
  {functionName:'TFT DC',expected:2,test:/(LCD|TFT|ST7789|DISPLAY).*(DC|DATA_COMMAND)/i},
  {functionName:'TFT CS',expected:21,test:/(LCD|TFT|ST7789|DISPLAY).*CS/i},
  {functionName:'MIC BCLK',expected:39,test:/(MIC|INMP).*(SCK|BCLK|I2S_CLK)/i},
  {functionName:'MIC WS',expected:40,test:/(MIC|INMP).*(WS|LRCLK|LRCK|I2S_WS)/i},
  {functionName:'MIC SD',expected:41,test:/(MIC|INMP).*(SD|DATA|DIN)/i},
  {functionName:'AMP BCLK',expected:39,test:/(AMP|SPEAKER|MAX98357).*(SCK|BCLK)/i},
  {functionName:'AMP LRC',expected:40,test:/(AMP|SPEAKER|MAX98357).*(WS|LRC|LRCLK)/i},
  {functionName:'AMP DIN',expected:47,test:/(AMP|SPEAKER|MAX98357).*(DIN|DATA|DOUT)/i},
  {functionName:'BUTTON',expected:38,test:/(BUTTON|KEY|USER_BTN|ACTION_BTN)/i},
];

export function scanCodePins(source:string):CodePin[] {
  const result:CodePin[] = [];
  source.split(/\r?\n/).forEach((line,i) => {
    let name = ''; let raw = '';
    // e.g. #define TFT_SCLK GPIO_NUM_42 / #define TFT_SCLK 42
    const define = line.match(/^\s*#\s*define\s+(\w+)\s+(?:GPIO_NUM_)?(\d+)\b/);
    const declaration = line.match(/\b(?:constexpr\s+)?(?:const\s+)?(?:int|gpio_num_t|uint8_t|uint16_t)\s+(\w+)\s*=\s*(?:GPIO_NUM_)?(\d+)\b/);
    const matched = define || declaration;
    if (!matched) return;
    name = matched[1]; raw = matched[2];
    const pin = Number(raw);
    if (!Number.isInteger(pin) || pin<0 || pin>48) return;
    const alias = PIN_ALIASES.find(p=>p.test.test(name));
    result.push({name,pin,line:i+1,expected:alias?.expected,functionName:alias?.functionName,verdict:alias ? (alias.expected === pin ? 'match':'mismatch') : 'unknown'});
  });
  return result;
}

export interface UserFirmwareFile {
  name:string;
  size:number;
  kind:'code'|'bin';
  offset?:number;
  content?:string;
  uploadedAt:string;
}
export function resolveFlashFile(name:string):FlashFile|undefined {
  const lower = name.toLowerCase();
  return FLASH_FILES.find(f=>f.filename===lower) || FLASH_FILES.find(f=>lower.includes(f.id));
}
export const fmtHex = (n:number)=>`0x${n.toString(16).toUpperCase().padStart(6,'0')}`;
export const fmtSize = (n:number)=> n > 1024*1024 ? `${(n/1024/1024).toFixed(2)} MB` : `${(n/1024).toFixed(1)} KB`;
