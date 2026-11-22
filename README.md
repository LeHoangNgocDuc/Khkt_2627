# VISIONBOT 3D – PHÒNG THỰC HÀNH KHKT

Website mô phỏng kết cấu, đấu nối mạch và giải thích nguyên lý VisionBot cho học sinh THCS trình bày trước Ban Giám Khảo cuộc thi KHKT. **Không phải phần mềm nạp firmware hoặc bộ mô phỏng điện áp/dòng điện SPICE.**

## Trạng thái kiểm tra

Đã kiểm tra cú pháp của các file TypeScript/TSX bằng TypeScript 5.8 và kiểm tra dữ liệu đấu nối tự động (14 thành phần, 40 chân, 30 dây, không có neo bị thiếu). **Chưa thể chạy `npm install`/`npm run build` trong môi trường đóng gói vì không phân giải được tên miền npm registry**; cần chạy các lệnh ở mục 3 trên máy có mạng hoặc xem Build Logs trên Vercel. Đây là nguồn mã hoàn chỉnh để triển khai, nhưng chưa khẳng định đã chạy thử end-to-end trong trình duyệt thật.

## 1. Các chức năng đã viết

- Mô hình 3D thủ tục (procedural meshes) bằng **React Three Fiber + Three.js**: bo GOOUUU ESP32-S3-CAM có camera FPC, 2 USB-C, 40 pad header; màn hình ST7789 có texture giao diện; INMP441; ampli MAX98357A; loa; pin Li-Po 1S; TP4056; boost 5V (cuộn cảm 4R7); công tắc; nút nhấn; bộ vỏ 3 mảnh.
- Xoay 360°, zoom, xuyên thấu vỏ, tách lớp bằng thanh trượt 0–100%, camera presets 1–7, tự xoay, ẩn/hiện dây, hạt sáng mô phỏng luồng tín hiệu.
- Chọn từng linh kiện, từng đầu chân hoặc dây để zoom cận và hiện thông tin kỹ thuật cùng câu thuyết trình tiếng Việt.
- Đấu nối điện **30 đường dây**. Sơ đồ chân, tên và điểm neo 3D đều lấy từ **một file duy nhất** `src/data/circuitData.ts`.
- Quy trình 7 bước có nút Trước/Tiếp/Tự chạy, từng bước có checklist và chỉ rõ dây cần đấu.
- Sơ đồ luồng camera/micro → ESP32 → Wi-Fi/AI Cloud → I2S/loa và màn hình. **Chỉ minh họa, không thực sự gọi AI hay liên lạc phần cứng.**
- Tab firmware: 5 file BIN/offset theo tài liệu; hiển thị bản đồ Flash 16 MB; kéo thả `.h/.cc/.cpp/.c/.ino/.bin`, đọc nội dung mã nguồn cục bộ, quét `#define`/`const int` đơn giản để so sánh GPIO. File BIN được đọc **tên + dung lượng + offset tham chiếu**, không giải mã cấu trúc bin và không được lưu byte thực vào `localStorage`.
- Giao diện tiếng Việt, tối/sáng, responsive, chế độ trình chiếu BGK; dự phòng sơ đồ SVG 2D khi WebGL không khả dụng.

## 2. Sơ đồ thư mục

```text
visionbot-3d/
├─ index.html                   # Trang gốc Vite
├─ package.json                 # Thư viện và các lệnh
├─ tsconfig.json                # Cấu hình TypeScript
├─ vite.config.ts               # React + Tailwind 4
├─ vercel.json                  # Triển khai Vercel SPA
├─ public/favicon.svg
├─ scripts/check-circuit.mjs    # Kiểm tra dữ liệu dây/neo chân
└─ src/
   ├─ main.tsx                 # Điểm vào React
   ├─ App.tsx                  # Toàn bộ điều khiển/tabs, trạng thái, phím tắt
   ├─ styles.css               # Thiết kế responsive + Tailwind
   ├─ data/
   │  ├─ circuitData.ts        # CHỈNH PINOUT/DÂY TẠI ĐÂY
   │  └─ firmwareData.ts       # Offset Flash, đối chiếu GPIO từ code
   ├─ scene/
   │  ├─ VisionScene.tsx       # Canvas, camera, ánh sáng, OrbitControls
   │  ├─ ProceduralParts.tsx   # Mô hình PBR từng linh kiện (thay GLB ở đây)
   │  └─ WireBundle.tsx        # TubeGeometry, CatmullRomCurve3, hạt sáng
   ├─ components/
   │  ├─ Circuit2D.tsx         # SVG 2D khi không có WebGL
   │  └─ FirmwarePanel.tsx     # Flash, upload, code viewer, so GPIO
   └─ utils/
      ├─ storage.ts            # Lưu danh sách mã nguồn cục bộ
      └─ webgl.ts              # Kiểm tra WebGL
```

## 3. Cài trên Windows, dùng Visual Studio Code

Yêu cầu **Node.js 22 LTS hoặc mới hơn**, npm, trình duyệt Edge/Chrome mới.

1. Giải nén `VisionBot_3D_Web_Full_Source.zip` ra một thư mục dễ tìm, ví dụ `D:\\VisionBot3D`.
2. Mở Visual Studio Code → **File → Open Folder**, chọn `visionbot-3d`.
3. Trong VS Code chọn **Terminal → New Terminal**.
4. Chạy các lệnh theo thứ tự:

```bash
npm install
npm run check:connections
npm run dev
```

5. Bấm vào địa chỉ local do Vite hiển thị, thông thường là `http://localhost:5173/`.
6. Kiểm tra đầu ra sản xuất:

```bash
npm run build
npm run preview
```

Thư mục `dist/` sẽ được tạo sau khi build thành công.

> Nếu thấy lỗi `npm is not recognized`, cài Node.js LTS rồi mở lại Terminal. Không cần cài backend/Supabase/API key để sử dụng bản mô phỏng.

## 4. Đưa lên GitHub và Vercel (không cần dùng Git CLI)

### Cách qua giao diện GitHub

1. Vào GitHub, đăng nhập và tạo repository mới, ví dụ `visionbot-3d` (Public hoặc Private tùy mục đích).
2. Chọn **Add file → Upload files**; tải toàn bộ nội dung bên trong thư mục dự án (không tải `node_modules/`, `dist/`, `.env`).
3. Kiểm tra GitHub có `package.json`, `src/`, `public/`, `vite.config.ts`, `vercel.json` ở thư mục gốc repository.
4. Bấm Commit changes.

### Triển khai Vercel

1. Đăng nhập Vercel bằng GitHub.
2. Chọn **Add New → Project**, chọn repository `visionbot-3d`.
3. Framework Preset: **Vite** (thường Vercel tự phát hiện). Root Directory: `./` nếu code ở gốc.
4. Install Command: `npm install`; Build Command: `npm run build`; Output Directory: `dist`.
5. Bấm Deploy. Sau đó Vercel tạo địa chỉ `https://...vercel.app`.
6. Khi sửa code và commit lên nhánh triển khai, Vercel có thể tự build lại.

## 5. Quy trình thuyết trình cho học sinh

1. Mở ở chế độ **Cấu trúc**, chọn góc **Toàn cảnh** (phím `1`).
2. Kéo **Tách lớp** lên 100%, bật **Xuyên thấu** và nói vai trò từng linh kiện.
3. Chuyển **Đấu nối**: lọc **Nguồn & GND**, sau đó **Màn hình SPI**, **Micro I2S RX**, **Ampli I2S & loa**, **Nút điều khiển**.
4. Chọn từng dòng dây để tự zoom vào đường nối; có lời giải thích từ chân nào sang chân nào.
5. Chuyển **Lắp ráp** để thuyết trình 7 bước theo thứ tự.
6. Chuyển **Nguyên lý** → **Chạy mô phỏng**; giải thích dữ liệu lên AI Cloud và trả âm thanh.
7. Vào **Firmware** để cho BGK xem bản đồ 16 MB, nạp file `config.h` nếu có và đối chiếu GPIO.
8. Bấm `P` để trình chiếu; dùng `1–7` để đổi preset, `Space` tách/gộp, `R` về toàn cảnh.

## 6. Đấu nối đề xuất: lưu ý không bỏ qua

Bảng tổng hợp chính nằm ở `src/data/circuitData.ts`. Đối chiếu **chân vật lý trên bo** trước khi đấu thật, không suy luận theo vị trí hình minh họa chung.

| Thiết bị | Chân đích ESP32-S3-CAM hoặc nguồn |
|---|---|
| TFT SCL/SCK | GPIO42 (header 36, hàng phải) |
| TFT SDA/MOSI | GPIO14 (header 19, hàng trái) |
| TFT RES/RST | GPIO1 (header 38, hàng phải) |
| TFT DC | GPIO2 (header 37, hàng phải) |
| TFT CS | GPIO21 (header 24, hàng phải) |
| TFT VCC / GND | 3V3 / GND (cần xác minh VCC và BLK của module) |
| INMP441 SCK / WS / SD | GPIO39 / GPIO40 / GPIO41 (header 33 / 34 / 35) |
| INMP441 VDD / GND / L/R | 3V3 / GND / GND |
| MAX98357A BCLK / LRC / DIN | GPIO39 / GPIO40 / GPIO47 |
| MAX98357A VIN / GND | Boost 5V / GND chung |
| Loa + / − | SPK+ / SPK− của MAX98357A **không phải GND** |
| Nút tác vụ | GPIO38 ↔ GND, firmware INPUT_PULLUP |
| Camera | Cáp FPC nội bộ, không có dây Dupont ra GPIO |
| Pin Li-Po 1S | B+ / B− của TP4056 có bảo vệ |
| TP4056 OUT+ | Công tắc COM → ON → Boost IN+ |
| TP4056 OUT− | Boost IN− |
| Boost OUT+ | ESP32 5V và MAX98357A VIN |
| Boost OUT− | GND chung |

**Lưu ý module:** Các chân `GAIN`, `SD/SHDN` của ampli tùy phiên bản PCB có điện trở kéo mặc định khác nhau; không tự ý kéo về GND. Chân `BLK` của TFT chỉ nối 3V3 trực tiếp nếu board có trở hạn dòng phù hợp.

**Năm cảnh báo:** (1) không cấp 5V cho 3V3/VDD micro; (2) không nối Li-Po trực tiếp chân 5V; (3) không nối một đầu loa xuống GND; (4) **không lắp thẻ microSD** khi GPIO38–40 làm nhiệm vụ khác; (5) xác nhận mạch TP4056/Boost có cuộn cảm 4R7 và không dùng TP4056 thường thiếu power-path để vừa sạc vừa chạy tải.

**Chú ý firmware:** board `bev88-Robert-Tran / ZHENGCHEN_1_54TFT_WIFI` trong thuyết minh có thể đã dùng cấu hình GPIO **khác** bảng đề xuất. Cần xem `config.h`, `board.cc` và các file cấu hình biên dịch trước khi đấu nối theo sơ đồ này. Bộ lọc regex trên web chỉ phát hiện trường hợp đơn giản, **không tự xác minh được firmware nhị phân**. Xung I2S GPIO39/40 chỉ chia chung nếu firmware cấu hình TX/RX đồng bộ phù hợp.

**Cảnh báo đối với người khiếm thị:** AI qua Internet có độ trễ và có thể suy đoán sai vật cản. Không sử dụng VisionBot như thiết bị an toàn tránh chướng ngại vật độc lập; cần cảm biến khoảng cách riêng và kiểm thử nếu phát triển chức năng cảnh báo tức thời.

## 7. Thay mô hình bằng GLB Blender

`src/scene/ProceduralParts.tsx` chứa các component render mô hình. Có thể thay phần `Board`, `TFT`, `Micro`… bằng `useGLTF('/models/ten-file.glb')` và giữ nguyên `ComponentId`, vị trí, neo chân và xử lý chọn. Nếu file GLB có kích thước/điểm gốc khác, chỉnh lại `assembled`/`exploded` và `pinAnchors` trong `circuitData.ts` để đường dây bám chính xác.

## 8. Tài liệu pinout để kiểm tra

- Espressif esp32-camera – GOOUUU DVP: https://github.com/espressif/esp32-camera/blob/master/examples/camera_example/main/camera_pinout.h
- GOOUUU ESP32-S3-CAM (bảng header/pin): https://github.com/profharris/GOOUUU_ESP32-S3-CAM
- Dự án tham khảo ghép GPIO39/40 I2S: https://github.com/shiuhou/xiao-an-robot/blob/main/hardware/wiring/esp32_pinout.md

**Phiên bản:** 1.0.0 – mô hình giáo dục offline logic (kết nối Internet chỉ để tải thư viện và deploy). Dữ liệu firmware và GPIO lấy từ bản đặc tả cung cấp cho dự án, chưa được đọc lại từ thiết bị thật.
