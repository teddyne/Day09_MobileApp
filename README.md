# BookStore — Buổi 9 (SDK 58, ĐÃ LÀM XONG)

Bản hoàn chỉnh theo bài thực hành Buổi 9: Thanh toán, Đơn hàng & Thông báo,
đã nâng lên Expo SDK 58. Không còn khung cam TODO trên màn hình;
`grep -rn "TODO BT9" src` không còn kết quả. Bản này KHÔNG kèm file TraLoi.md
theo yêu cầu (câu hỏi bổ sung không nằm trong project này).

## Chạy
```bash
npm install
npm run api          # terminal 1: json-server http://localhost:3000
npx expo start       # terminal 2: quét QR bằng Expo Go, nhấn w để mở web
npm run typecheck    # tsc --noEmit, chạy trước khi nộp
```
Tài khoản demo: `demo@bookstore.vn` / `123456` (đã có sẵn 3 đơn mẫu, 5 thông báo).

Điện thoại thật: cùng Wi-Fi với máy tính, đặt `EXPO_PUBLIC_API_URL=http://<IP-máy>:3000` trước khi `npx expo start -c`.

> Đăng nhập là **giả lập** (so sánh mật khẩu ở client) chỉ để học; hệ thống thật phải xác thực ở server và lưu token bằng SecureStore.

Stack: Expo SDK 58 · React Native 0.88.1 · TypeScript 6 · React Navigation 7 · Redux Toolkit · Axios · json-server 0.17.4.
Giao diện mô tả: xem `docs/UI.md` và `docs/ui/*.png`.

## Đã làm xong
| ID | File | Việc |
|---|---|---|
| BT9.1a/b/c | screens/CheckoutScreen.tsx | validate dẫn xuất, 3 ô nhập địa chỉ, 2 PaymentOption |
| BT9.2 | services/orderService.ts, CheckoutScreen | `createOrder` POST /orders, submit (thông báo, xoá giỏ, về Home, lỗi giữ giỏ) |
| BT9.3a/b/c/d | OrdersScreen, orderService, AccountScreen | tải đơn mới nhất lên đầu, FlatList + chi tiết trong thẻ, empty state, menu |
| BT9.4a/b/c | EditProfileScreen, userService, AccountScreen | form hồ sơ, `updateProfile` PATCH (bỏ password khỏi store), hiện SĐT + nút sửa |
| BT9.5a–f | notificationService, NotificationsScreen, AccountScreen | tải, đánh dấu đã đọc kiểu lạc quan + hoàn lại khi lỗi, FlatList, điều hướng, menu |
| BT9.6 | screens/HomeScreen.tsx | pull-to-refresh qua BookGrid (không loading toàn trang) |
| BT9.7 | app.json | name BookStore, icon 1024×1024, splash nền #0B1F5C qua plugin expo-splash-screen, adaptiveIcon |
| BT9.C1 | OrdersScreen | thử thách "Mua lại" cho đơn hoàn tất (lấy giá/tồn kho mới nhất, cộng số lượng, chặn ở tồn kho) |
| Câu 5 | OrdersScreen | bộ lọc trạng thái Tất cả / Chờ xác nhận / Đang giao / Hoàn tất / Đã huỷ |

## Sửa sau khi chạy thử trên điện thoại (bản SDK 58)
- **Nút lọc Đơn hàng quá to:** trước đây hàng lọc là một ScrollView ngang đặt
  ngang hàng với FlatList trong View flex:1 nên bị kéo giãn dọc, và chip bị
  stretch theo. Nay hàng lọc đã đưa vào ListHeaderComponent của FlatList và
  thêm `alignItems: "center"`, nên chip chỉ cao đúng nội dung.
- **Thêm vào giỏ không thấy phản hồi:** trước đây nút "Thêm vào giỏ" ở màn Chi
  tiết chỉ gọi `add()` mà không đổi gì trên màn hình, lại nằm trên tab nên
  không thấy badge giỏ. Nay bấm xong hiện ngay dòng "✓ Đã thêm vào giỏ —
  trong giỏ có X cuốn sách này" kèm nút "Xem giỏ hàng", và mọi nút
  PrimaryButton đều mờ nhẹ khi đang chạm để thấy là đã bấm.
- **Icon / splash:** `app.json` khai báo tên `BookStore`, icon app,
  adaptive icon và splash nền #0B1F5C. Expo Go vẫn là app host, nên icon
  trên màn hình chính điện thoại vẫn là icon Expo Go; cấu hình icon riêng
  của BookStore chỉ có hiệu lực khi cài development/release build. Splash
  native cũng không được Expo Go áp dụng cho từng dự án, vì vậy lúc nạp dữ
  liệu khởi động BookStore hiển thị màn chào trong app dùng cùng ảnh splash
  và nền navy, kể cả khi chạy bằng Expo Go. SDK 58 cấu hình splash native
  qua plugin `expo-splash-screen`, không dùng trường `splash` cũ.
- **SDK 58:** nâng bằng `npx expo install expo@^58.0.0 --fix`, sửa kiểu
  ListHeaderComponent/ListEmptyComponent của BookGrid cho khớp React Native
  0.88 (không nhận `null`), `npm run typecheck` và `npx expo-doctor` đều qua.

## Luồng demo (BT9.8)
Đăng nhập → Duyệt và tìm sách → Xem chi tiết → Thêm giỏ / yêu thích
→ Thanh toán → Xem đơn hàng → Cập nhật hồ sơ → Xem thông báo.

## Ảnh chụp màn hình
Chụp trên điện thoại/giả lập hoặc bản web khi chạy demo: Checkout, Đơn hàng
(kèm màn lọc trạng thái cho câu 5), Hồ sơ, Thông báo. Thư mục `docs/ui/` trong
Starter chỉ là ảnh giao diện đích để đối chiếu, không phải ảnh chụp app đã chạy.
Trước giờ demo, giải nén lại project để `db.json` về trạng thái ban đầu.
