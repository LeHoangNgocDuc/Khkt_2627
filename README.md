# VISIONBOT V7.0 — CẤU TẠO, ĐẤU NỐI VÀ NGUYÊN LÝ HOẠT ĐỘNG

**Tên đề tài chính thức:** VISIONBOT – Đôi mắt AI, đồng hành cùng học sinh khiếm thị trên hành trình học tập hòa nhập.

**Trường:** Trường THCS Nam Nha Trang – Phân hiệu Vĩnh Trường.

Website giới thiệu sản phẩm **vật lý**. Website là công cụ minh họa, không có tính năng điều khiển phần cứng hoặc phát hiện nguy hiểm trực tiếp. Không cần backend, API key, tài khoản hoặc kết nối AI khi trình bày.

## Nội dung V7 (chỉ 4 phân khu)

1. **Giới thiệu:** ảnh thật, tên đề tài, vấn đề học tập hòa nhập, giải pháp và nguyên tắc an toàn.
2. **Cấu tạo 3D:** vỏ ngoài công nghiệp dựng bằng React Three Fiber, mặt trước có các lỗ khoét thật, camera nhiều lớp, đèn LED, TFT texture tiếng Việt, Studio lighting; giữ mô hình linh kiện tách lớp và ảnh thực tế. Các phần có thể bấm vào để đọc cấu tạo.
3. **Đấu nối:** bảng trải phẳng SVG với 40 chân header, 30 tuyến dây từ `src/data/circuitData.ts`; zoom, pan, soi dây, nhóm nguồn/SPI/I2S, đồng hồ đo ảo. Có thể chuyển sang 3D đấu nối.
4. **Nguyên lý:** sơ đồ khối 5 bước từ camera/micro đến ESP32-S3, Wi-Fi, AI và loa/TFT; chọn bước hoặc tự chạy mô phỏng. Có tùy chọn xem luồng dữ liệu trên 3D.

Không còn các mục **Trình diễn chức năng**, **Kết quả** và **BGK 5 phút** ở thanh điều hướng. Không tự chèn số liệu thử nghiệm chưa được chứng minh.

### Ảnh thật

- `public/images/visionbot-thuc-te-1.png`: ảnh sản phẩm do nhóm nghiên cứu cung cấp.
- `public/images/visionbot-thuc-te-2.png`: ảnh sản phẩm được nhóm cung cấp trong buổi thử nghiệm trước.
- `public/images/visionbot-studio-concept.png`: **ảnh phối cảnh thiết kế nâng cấp**, không phải ảnh thiết bị đã chế tạo.

Website giữ nguyên các ảnh thật trong `<img>` và chỉ hiển thị phối cảnh bằng nhãn phân biệt rõ ràng. Mô hình 3D mặt ngoài được dựng bằng Three.js theo hình dáng quan sát được, **không phải bản CAD chính xác**. Nội thất 3D là mô hình giải thích vị trí linh kiện, chưa xác thực tỷ lệ/kích thước ngoài đời.

### Logo

Trang web tự nhận `Logo.jpg` nằm ở thư mục **gốc GitHub** (tính năng giữ nguyên từ V5), hoặc `public/logo-truong.png` nếu bạn đặt file ở đó. Không cần đổi logo đã có trên GitHub. Nút **Đổi logo** cho phép tải logo riêng của trình duyệt (localStorage).

## Chạy trên Windows

Cài Node.js 20.19+ hoặc 22.12+, mở PowerShell/Terminal tại thư mục có `package.json`:

```bash
npm install
npm run check:connections
npm run check:layout
npm run dev
```

Mở địa chỉ mà Vite thông báo, thông thường `http://localhost:5173`.

Trước khi đưa lên GitHub:

```bash
npm run build
```

Vercel: `Framework = Vite`, `Build Command = npm run build`, `Output Directory = dist`, `Root Directory = /` (thư mục gốc repo có `package.json`). Sau khi commit mã nguồn lên nhánh `main`, Vercel sẽ tự triển khai nếu đã liên kết GitHub.

## Cập nhật repo `LeHoangNgocDuc/Khkt_2627`

1. Giải nén ZIP, vào thư mục `visionbot-3d`.
2. Sao chép **các tệp bên trong** vào gốc repository (nơi có `index.html`, `package.json`, `src/`, `public/`).
3. Xóa các tệp cũ không còn dùng (DemoPage/ResultsPage/PitchBoardTV, các dữ liệu kết quả mẫu), hoặc dùng `git` để đồng bộ xóa.
4. **Giữ nguyên** file `Logo.jpg` ở gốc GitHub.
5. Commit & Push lên `main`, theo dõi Vercel Build Logs cho đến khi trạng thái `Ready`.
6. Refresh trang bằng `Ctrl+Shift+R` để bỏ cache.

## Trình chiếu rõ nhất trên TV / laptop

- Kết nối laptop với TV bằng HDMI. Windows + P → Nhân đôi.
- Ở Phân khu 2, mở **Mặt ngoài 3D**, kéo xoay, chọn camera/màn hình/khe LED/nút để **zoom cận cảnh**, bật tự xoay; đổi sang **Tách lớp linh kiện** để xem ESP32, pin, micro, ampli, TFT, loa.
- Phối cảnh Studio trình bày thiết kế công nghiệp đề xuất. Nếu giải thích kết quả chế tạo thực tế, hãy chọn các ảnh nguyên mẫu đã chụp.
- Ở Phân khu 3, chọn bộ lọc **Nguồn / Màn hình / Âm thanh**, nhấp vào dây để hiển thị “TỪ CHÂN → ĐẾN CHÂN”. Dùng lăn chuột để zoom chân GPIO.
- Ở Phân khu 4, chọn từng khối trong chu trình hoặc chạy tự động.
- Nhấn **P** để bật/tắt toàn màn hình. Nút thu gọn Sidebar giúp mô hình chiếm toàn bộ bề ngang.

## An toàn và tính trung thực khoa học

- **Sơ đồ đấu dây là cấu hình đề xuất.** Kiểm tra pinout GOOUUU, tính năng firmware thực tế và đường nguồn trước khi đấu điện.
- Không cấp 5V vào chân 3V3/micro; không nối loa về GND; không nối Li-Po trực tiếp đến chân 5V. Không dùng microSD cùng nhóm GPIO38–40 đang dùng I2S/nút.
- TP4056 thường không quản lý đường nguồn vừa sạc vừa hoạt động; cần kiểm tra và dùng mạch thích hợp.
- Đồng hồ vạn năng trên web **chỉ mô phỏng**, không có đo điện áp thiết bị thật.
- VisionBot hỗ trợ nhận biết và học tập **không thay gậy trắng, người hỗ trợ hay thiết bị dẫn đường thời gian thực**. AI qua mạng có thể phản hồi trễ, sai hoặc thiếu thông tin.

## Cấu trúc mã nguồn chính

```text
visionbot-3d/
  index.html
  package.json
  vite.config.ts
  vercel.json
  public/images/
    visionbot-thuc-te-1.png
    visionbot-thuc-te-2.png
    visionbot-studio-concept.png
  src/
    App.tsx
    main.tsx
    refocus-v6.css
    layout-v5.css
    flatlay.css
    styles.css
    Workbench.tsx
    components/
      IntroPage.tsx
      ModelPage.tsx
      PrinciplePage.tsx
      FlatLayBoard.tsx
      SchoolIdentity.tsx
      Circuit2D.tsx
      FirmwarePanel.tsx
    data/
      identity.ts
      circuitData.ts
      firmwareData.ts
    scene/
      VisionBotStudioModel.tsx
      VisionScene.tsx
      ProceduralParts.tsx
      WireBundle.tsx
  scripts/
    check-circuit.mjs
    check-layout.mjs
```

## V7 - Chi tiết kỹ thuật mới

- `src/scene/VisionBotStudioModel.tsx`: toàn bộ hình học 3D của vỏ ngoài, kính/cụm ống kính, màn hình, ba khe LED, nút, nguồn sáng, camera chuyển động. Không dùng API hoặc tải texture từ CDN.
- Màn hình được tạo bằng CanvasTexture độ phân giải 1536 × 1120 và hiển thị đúng câu tiếng Việt từ yêu cầu.
- `src/components/ModelPage.tsx`: giao diện điều khiển nằm trong vùng dock, không che sản phẩm; có bản xem ảnh dự phòng nếu WebGL không hỗ trợ.
- `public/images/visionbot-studio-concept.png`: render studio để tham khảo thẩm mỹ; không thay ảnh thật trong báo cáo nghiên cứu.
- Trang chính vẫn ưu tiên ảnh thật theo đúng yêu cầu dự án KHKT, và có một nút chuyển sang phối cảnh.
- Chỉ thay phần mô hình mặt ngoài và hiển thị ảnh; bộ dữ liệu đấu nối GPIO và giao diện 2D giữ nguyên.
