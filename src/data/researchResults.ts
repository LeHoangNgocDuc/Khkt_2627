/**
 * VISIONBOT - DỮ LIỆU MINH HỌA PHỤC VỤ BIỂU ĐỒ / TRÌNH CHIẾU.
 * Đây là ví dụ GIẢ ĐỊNH, KHÔNG PHẢI kết quả đo trong báo cáo nghiên cứu.
 * Giáo viên phải nhập kết quả thử nghiệm có biên bản trước khi báo cáo BGK.
 */
export const RESEARCH_LABEL = '[SỐ LIỆU MẪU – DỄ DÀNG CHỈNH SỬA]';
export type TaskMetric = { id: string; name: string; accuracy: number; trials: number; correct: number };
export type LatencyMetric = { id: string; name: string; seconds: number; trials: number };
export type CostItem = { id: string; name: string; quantity: number; unitPrice: number };
export interface ResearchResults {
  sample: boolean;
  note: string;
  tasks: TaskMetric[];
  latency: LatencyMetric[];
  costs: CostItem[];
}
export const DEFAULT_RESEARCH_RESULTS: ResearchResults = {
  sample: true,
  note: 'Toàn bộ giá trị trong bảng là DỮ LIỆU GIẢ ĐỊNH nhằm trình diễn giao diện; chưa có bằng chứng thực nghiệm, không được đưa vào báo cáo dưới dạng kết quả đo thật.',
  tasks: [
    {id: 'ocr', name:'Đọc chữ (OCR)', accuracy:88, trials:25, correct:22},
    {id: 'objects', name:'Nhận diện đồ vật', accuracy:92, trials:25, correct:23},
    {id: 'scene', name:'Mô tả cảnh vật', accuracy:80, trials:25, correct:20},
    {id: 'qa', name:'Hỏi đáp học tập', accuracy:84, trials:25, correct:21},
  ],
  latency: [
    {id:'wifi', name:'Wi-Fi ổn định', seconds:2.8, trials:10},
    {id:'hotspot', name:'Điểm phát 4G', seconds:4.6, trials:10},
    {id:'weak', name:'Mạng yếu', seconds:9.2, trials:10},
  ],
  costs: [
    {id:'board', name:'ESP32-S3-CAM + camera', quantity:1, unitPrice:310000},
    {id:'tft', name:'TFT ST7789 1,54 inch', quantity:1, unitPrice:85000},
    {id:'mic', name:'INMP441', quantity:1, unitPrice:45000},
    {id:'amp', name:'MAX98357A', quantity:1, unitPrice:55000},
    {id:'speaker', name:'Loa 4–8Ω', quantity:1, unitPrice:45000},
    {id:'battery', name:'Li-Po 3,7V + bảo vệ', quantity:1, unitPrice:95000},
    {id:'charger', name:'Mạch sạc TP4056', quantity:1, unitPrice:25000},
    {id:'boost', name:'Boost DC-DC 5V', quantity:1, unitPrice:35000},
    {id:'controls', name:'Nút, công tắc, dây dẫn', quantity:1, unitPrice:50000},
    {id:'case', name:'Vỏ in 3D, vít, phụ kiện', quantity:1, unitPrice:170000},
  ],
};
export const costTotal = (r: ResearchResults) => r.costs.reduce((s,c)=>s+Number(c.quantity||0)*Number(c.unitPrice||0),0);
export const money = (v:number) => Math.round(v).toLocaleString('vi-VN')+' đ';
const KEY='visionbot-research-v2';
export function loadResearch():ResearchResults {
  try {
    const raw=localStorage.getItem(KEY);
    if(!raw)return structuredClone(DEFAULT_RESEARCH_RESULTS);
    const o=JSON.parse(raw) as Partial<ResearchResults>;
    if(!Array.isArray(o.tasks)||!Array.isArray(o.latency)||!Array.isArray(o.costs))throw new Error('Invalid data');
    return {sample:o.sample!==false,note:typeof o.note==='string'?o.note:'',tasks:o.tasks,latency:o.latency,costs:o.costs};
  }catch{return structuredClone(DEFAULT_RESEARCH_RESULTS);}
}
export function saveResearch(r:ResearchResults){try{localStorage.setItem(KEY,JSON.stringify(r));return true;}catch{return false;}}
