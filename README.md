# CẬP NHẬT VISIONBOT V5.0 — TRÌNH CHIẾU KHÔNG CHE MẠCH

**Đơn vị:** Trường THCS Nam Nha Trang — Phân hiệu Vĩnh Trường.  
**Dự án:** VISIONBOT – RÔ-BỐT AI HỖ TRỢ NGƯỜI KHIẾM THỊ.  
**Vai trò:** Công cụ mô phỏng phục vụ thuyết trình KHKT, không phải phần mềm đo mạch điện thực tế.

## Những thay đổi so với V4

- Header 64px có tên trường, phân hiệu, nhãn KHKT và đề tài; nút thu gọn/mở bảng, toàn màn hình (P), sáng/tối.
- Thư mục nguồn của GitHub đang có `Logo.jpg` ở **gốc repository**: thành phần `SchoolIdentity` tự nhận diện tệp gốc bằng Vite `import.meta.glob('../../Logo.jpg')` khi build. **Giữ nguyên `Logo.jpg` trong repo**, không cần đổi tên. Ưu tiên tùy chọn khác: đặt logo tại `public/logo-truong.png`. Nút nạp logo tại trình duyệt ghi đè vào `localStorage` của đúng máy đó. Nếu logo nằm ở GitHub nhưng không có trong bộ mã được Vercel build, website sẽ dùng fallback, không tự tải logo từ GitHub qua mạng.
- Phân khu 2/4 (3D): Nút góc nhìn, hướng dẫn và thẻ thông số **nằm ngoài vùng WebGL**; 3D nở theo khoảng trống thật.
- Phân khu 3 (2D): Bộ lọc dây, zoom và đồng hồ vạn năng ảo đều được dock; bảng kỹ thuật bên phải cố định 360px, cuộn riêng. Không còn hộp đồng hồ hoặc tooltip nổi trên mạch.
- Khi thu gọn Sidebar, bản mạch 2D/3D rộng hết màn hình; dải 44px phía dưới vẫn cho biết kết nối đang chọn.
- Mobile: Sidebar trở thành dải kéo mở phía **dưới** vùng mô hình, không phủ lên bo mạch. Chọn chân/dây có thể mở vùng thông tin trong phần chiều cao riêng.
- Chế độ BGK: các nút zoom và gợi ý thuyết trình đã được đưa ra ngoài canvas; phần nhắc lời hiển thị như sidebar dock, không phải cửa sổ đè lên mạch.

## Chạy tại máy tính

Yêu cầu Node.js 20.19+ hoặc 22.12+. Mở Terminal ở đúng thư mục chứa `package.json`, chạy:

```bash
npm install
npm run check:connections
npm run check:layout
npm run dev
```

Trước khi triển khai, chạy `npm run build`. Tệp xuất ra ở thư mục `dist/`; với dự án Vercel sử dụng framework Vite, `Build Command = npm run build`, `Output Directory = dist`.

## Cập nhật dự án GitHub `LeHoangNgocDuc/Khkt_2627`

1. Sao lưu repository đang hoạt động.
2. Giải nén ZIP, mở thư mục `visionbot-3d`, tải **nội dung bên trong** lên gốc nhánh `main` của repository, ghi đè các tệp trùng tên và giữ nguyên các tài nguyên khác chưa thay thế, nhất là **`Logo.jpg`**.
3. Bắt buộc có `src/layout-v5.css`, `src/App.tsx`, `src/Workbench.tsx`, `src/components/FlatLayBoard.tsx`, `src/components/PitchBoardTV.tsx`, `src/components/SchoolIdentity.tsx`, `src/main.tsx` và `package.json` mới. Nếu thiếu `src/layout-v5.css`, bố cục không đổi.
4. Commit, vào Vercel kiểm tra bản triển khai mới lấy đúng commit, không lỗi Build Logs. Nhấn `Ctrl + Shift + R` trên trình duyệt để tải lại giao diện nếu bị cache.
5. Thử ở hai độ phân giải: **1920 × 1080 (TV)** và **1366 × 768 (laptop)**; trong phân khu 3, chọn dây và kiểm tra 2 đầu chân trong sidebar; thử nút thu gọn.

## Trạng thái xác minh

Kiểm tra parser TS/TSX và CSS (PostCSS) đã đạt, `check:connections` đạt 14 bộ phận / 40 header / 30 dây / 30 tuyến. **Môi trường tạo bản này không có quyền truy cập npm registry nên chưa thể xác minh đầy đủ `npm install`, `npm run build` hoặc chạy WebGL trên trình duyệt.** Đây không phải cam kết đã test hoàn chỉnh trên Vercel.

---

# VISIONBOT – TRỢ LÝ THUYẾT TRÌNH KỸ THUẬT 3D

**Đơn vị:** TRƯỜNG THCS NAM NHA TRANG – PHÂN HIỆU VĨNH TRƯỜNG.

**Tên đề tài:** VISIONBOT – Nghiên cứu, thiết kế và chế tạo thiết bị trợ lý thị giác ứng dụng trí tuệ nhân tạo hỗ trợ người khiếm thị trong sinh hoạt và học tập.

## CẬP NHẬT PHIÊN BẢN 2.0 – 7 PHÂN KHU

Website gồm 7 phân khu điều hướng trực tiếp: **(1) Giới thiệu, (2) Mô hình 3D, (3) Đấu nối điện, (4) Nguyên lý & Firmware, (5) Demo ngoại tuyến, (6) Kết quả nghiên cứu, (7) Thuyết trình BGK 5 phút.** Rô-bốt thật mới là sản phẩm KHKT; website chỉ minh họa để thuyết trình.

### Bổ sung logo trường nguyên gốc (quan trọng)

Ảnh logo trường được hiển thị mà **không cắt, chỉnh lại hoặc vẽ lại**. Có 2 cách sử dụng:

- **Cách 1 – đề xuất để nộp dự thi/chiếu trên mọi máy:** Đặt đúng ảnh logo trường gốc dạng PNG vào `public/school-logo.png`, sau đó chạy lại `npm run build` hoặc đưa thay đổi lên GitHub để Vercel cập nhật. Ảnh sẽ tự hiển thị ở phần đầu, phần cuối và chế độ thuyết trình. Chỉ sửa tên tệp, không sửa nội dung ảnh.
- **Cách 2 – thử nhanh tại hội trường:** Bấm **Nạp logo** trên thanh đầu trang, chọn ảnh logo của trường. Trình duyệt giữ ảnh gốc bằng `localStorage` trên **thiết bị hiện tại**. Cách này không tự đưa ảnh vào ZIP, không đồng bộ sang máy khác; khi dùng máy chiếu mới nên chọn cách 1.

Nếu ở chế độ demo chưa có ảnh, web hiển thị ô chữ `LOGO` thay cho biểu trưng. Không xem đó là logo thật.

### Tên trường và đề tài

Sửa đồng loạt trong `src/data/identity.ts` nếu cần. Cả tiêu đề, thanh trường, trang giới thiệu và trang thuyết trình đều dùng chung văn bản này.

### Định hướng mô phỏng / bằng chứng

- Các demo ngoại tuyến chỉ là **kịch bản đã dựng sẵn**, không nhận dạng AI/OCR trực tiếp.
- Bảng kết quả mặc định ở `src/data/researchResults.ts` là **SỐ LIỆU MẪU**. Bấm `Sửa nhanh số liệu` để nhập số liệu đo thực tế và xuất CSV.
- Dữ liệu đấu dây nguồn/tín hiệu nằm trong `src/data/circuitData.ts`; cần đối chiếu GPIO với firmware và linh kiện thật trước khi đấu điện.
- Chế độ trình bày BGK hỗ trợ tiến độ 7 bước, đồng hồ 5 phút, bảng nhắc lời và 10 câu hỏi phản biện; phím `←/→`, `1–7`, `R`, `P` dùng trong chế độ này.

### Các tệp mới quan trọng

- `src/App.tsx`: bộ điều hướng 7 phân khu và chế độ thuyết trình BGK.
- `src/Workbench.tsx`: mô hình 3D/đấu nối gốc, giữ các chế độ chi tiết cũ.
- `src/components/SchoolIdentity.tsx`: ảnh logo + chức năng nạp logo mà không thay đổi ảnh gốc.
- `src/data/identity.ts`: tên trường, phân hiệu và tên đề tài.
- `src/components/IntroPage.tsx`, `DemoPage.tsx`, `ResultsPage.tsx`, `PresentationPanel.tsx`: bốn màn hình thuyết trình.
- `src/data/researchResults.ts`, `presentationData.ts`: dữ liệu mẫu và kịch bản BGK.

---

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

---

## V3.0 - Chế độ trình chiếu rõ nét trên TV / laptop (22/11/2026)

**Mở nhanh**: vào phần **BGK 5 phút** trên website, hoặc bấm nút **TRÌNH CHIẾU TV** phía trên mô hình 3D trong phân khu Cấu tạo / Đấu nối. Chế độ TV tự ẩn điều hướng không cần thiết, tối đa diện tích mô hình. Nếu muốn cửa sổ toàn màn hình thực sự, bấm **Toàn màn** hoặc phím `P`.

**Đấu nối cận cảnh**: chuyển tới **Bước 4 - Đấu dây** hoặc **Bước 5 - Nguồn**. Khi đó màn hình chia 3D bên trái và bảng chân lớn bên phải. Chọn nhóm **TFT/SPI**, **MIC/I2S**, **LOA/I2S**, **PIN/5V**, **NÚT NHẤN** để chỉ hiện các đường dây cần giải thích. Nhấn từng dây để làm sáng cả tuyến, tự zoom và đọc thông tin **TỪ THIẾT BỊ / CHÂN → ĐẾN THIẾT BỊ / CHÂN**, kèm số chân header ESP32 khi có. Có nút **Dây trước / Dây tiếp**, bảng nhắc lời và các nguyên tắc an toàn.

### Phím tắt trên máy tính khi trình chiếu

| Phím | Chức năng |
|---|---|
| `←` / `→` | Lùi / tiến tới bước thuyết trình trước hoặc sau |
| `1`–`7` | Chuyển trực tiếp giữa 7 bước |
| `[` / `]` | Lùi / tiến một dây khi đang ở bước đấu nối/nguồn |
| `+` / `-` | Phóng to / thu nhỏ mô hình |
| `Space` | Ghép vỏ / tách lớp |
| `R` | Đặt lại góc nhìn và tỷ lệ zoom |
| `P` | Bật/tắt toàn màn hình trình duyệt |

### Thiết lập hình ảnh khi xuất lên TV hoặc máy chiếu

1. Sử dụng cáp HDMI từ laptop ra màn hình TV nếu có thể để tránh trễ và nhiễu mạng.
2. Đặt độ phân giải **1920 × 1080 (Full HD)** và tỷ lệ màn hình **16:9** trên Windows khi thiết bị hỗ trợ; với màn hình 1366 × 768, dùng chế độ TV đã tối ưu.
3. Nhấn `Windows + P`, chọn **Nhân đôi (Duplicate)** nếu học sinh cần thấy màn hình giống TV, hoặc **Mở rộng (Extend)** nếu cần hiển thị tài liệu khác trên laptop.
4. Mở web trên Chrome hoặc Edge, chọn **BGK 5 phút**, sau đó nhấn `P` hoặc nút **Toàn màn**. Điều chỉnh tỷ lệ trình duyệt 100%, tránh phóng to toàn trang.
5. Trước cuộc thi, thử lần lượt **TFT/SPI → MIC/I2S → LOA/I2S → PIN/5V**, kiểm tra các chữ GPIO từ vị trí đứng của BGK (2-4m).
6. Nếu máy tính yếu, bấm **2D** để xem bảng dây/sơ đồ tĩnh thay vì đồ họa WebGL 3D.
7. Nút **Ghi chú** chỉ mở khi cần xem lời thuyết trình; nên đóng bảng ghi chú trước khi chuyển sang phần mô hình lớn.

**Lưu ý**: cấu hình chân trong website vẫn là phương án đề xuất, không phải đo đạc xác nhận trên VisionBot thật. Sơ đồ 3D là mô hình giáo dục. Không dùng bản mô phỏng này như hướng dẫn an toàn điện hoặc thiết bị hỗ trợ tránh vật cản thời gian thực. Kết quả nghiên cứu là số liệu mẫu cho đến khi thay bằng số liệu đo được.

### Những tệp được cập nhật so với V2

- `src/components/PitchBoardTV.tsx`: khu trình chiếu TV mới, bảng điện nhóm dây, dây đang chọn, nhắc lời và phím tắt.
- `src/App.tsx`: đưa chế độ mới vào phân khu 7.
- `src/Workbench.tsx`: thêm nút **TRÌNH CHIẾU TV** trong góc nhìn 3D.
- `src/scene/VisionScene.tsx`: zoom camera theo mức và truyền cờ trình chiếu.
- `src/scene/WireBundle.tsx`: dây lớn, sáng hơn; thêm điểm neo đầu/cuối và nhánh chung I2S/nguồn.
- `src/styles.css`: giao diện tương phản cao, kích thước chữ cho TV và bố cục 16:9 / 1366×768 / điện thoại.

### Xác minh trước khi đưa lên Vercel

Sau khi giải nén hoặc đồng bộ repo mới, trên máy có Internet chạy:

```bash
npm install
npm run check:connections
npm run typecheck
npm run build
```

Chỉ triển khai phiên bản mới khi các lệnh trên không báo lỗi. Nếu Vercel tự redeploy khi push lên nhánh `main`, kiểm tra log `Build` và thử mở website ở chế độ TV trên trình duyệt thật trước buổi thi.

---

## V4.0 — PHÂN KHU 3: TRẢI PHẲNG 2D SIÊU NÉT

Website đã được bổ sung **bảng đấu nối SVG tương tác** ngay tại Phân khu 3. Đây là chế độ chính khi thuyết trình chân GPIO trên TV; mô hình 3D cũ vẫn có thể mở lại bằng nút “Xem mô hình 3D”.

**Điều hướng:** Trang chủ → `03. Đấu nối` → chọn `TFT / SPI`, `Nguồn`, `Âm thanh I2S`, `Nút bấm` hoặc `Tất cả`. Khi chọn chân hoặc dây, hệ thống zoom gần và nêu rõ **thiết bị – chân xuất phát – thiết bị – chân đích**; các nhánh chung GPIO39/40, 3V3, GND và Boost được soi sáng theo nút đầu nối.

**SVG công nghiệp:** nền `#111317` và chấm lưới 20px, 40 header của GOOUUU, pad có tâm tọa độ chính xác trong `src/data/circuitData.ts`, 30 đường nối đi theo đoạn ngang/dọc 90°, góc bo 8–9px. Các đường đã được tạo với thuật toán đi dây tránh linh kiện và được kiểm tra không đâm xuyên thân bo. Có zoom/pan bằng chuột, chụm hai ngón tay, nút vừa khít và toàn màn hình.

**Đồng hồ ảo:** chọn 3 phép đo demo (pin 3,85V; Boost 5,02V; 3V3 3,30V) và bật/tắt công tắc; đây **không phải giá trị đo trực tiếp**. Khi OFF, 5V và 3,3V về 0,00V trong mô phỏng. Cảnh báo sạc TP4056, microSD, ngõ ra loa BTL và cấp sai nguồn được đặt riêng trong bảng thông tin.

**Nơi chỉnh kỹ thuật:** `src/data/circuitData.ts` là nguồn duy nhất của sơ đồ chân, đường nối, tọa độ SVG, 2D route, dữ liệu mô hình 3D. Gọi `npm run check:connections` khi cập nhật tọa độ / chân. Hiện các tuyến 2D được dựng sẵn (precomputed) từ hệ tọa độ này để hoạt động mượt trên TV, sửa pad cần tính lại tuyến tương ứng.

**Các file chính thay đổi:** `src/components/FlatLayBoard.tsx`, `src/data/circuitData.ts`, `src/flatlay.css`, `src/App.tsx`, `src/main.tsx`, `scripts/check-circuit.mjs`. Hướng dẫn nhanh có trong `HUONG_DAN_PHAN_KHU_3_FLATLAY_V4.txt`.

**Lưu ý đối chiếu linh kiện:** Nguồn pinout tham khảo GOOUUU cho biết GPIO14 là chân độc lập có thể dùng MOSI; camera OV2640/OV5640 dùng GPIO4–13 và GPIO15–18 qua FPC. Không dùng khe microSD với GPIO38/39/40 trong cấu hình đề xuất. Mạch TP4056+Boost và firmware đang nạp phải được xác minh trước khi đấu nối thực. Tránh cấp nguồn USB/Boost đồng thời nếu không có bảo vệ cấp nguồn ngược.

**Giới hạn kiểm thử:** kiểm tra được cú pháp TSX, mapping 30 dây và kiểm tra cắt linh kiện; chưa thể chạy `npm run build` thật trong môi trường phát triển do DNS không truy cập được npm registry. Cần kiểm tra bản build trên máy có Internet hoặc trong Vercel Build Logs.
