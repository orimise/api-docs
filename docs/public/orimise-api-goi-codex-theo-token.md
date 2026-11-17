# Gói API Codex theo token — hướng dẫn kích hoạt

> Áp dụng cho gói **30M / 50M / 100M / 200M token** (hạn 1 ngày hoặc 3 ngày) và gói **GPT 6 Luna không giới hạn** (1 ngày).

## 1. Nhận mã kích hoạt

Sau khi thanh toán, mã credit được giao kèm đơn hàng. Mỗi mã dùng **một lần**.

## 2. Tạo tài khoản

Mở [aigateway.orimise.com](https://aigateway.orimise.com) → đăng ký bằng email, hoặc đăng nhập nếu đã có tài khoản.

## 3. Nạp credit

Vào [Dashboard → Billing](https://aigateway.orimise.com/dashboard/billing) → dán mã credit → xác nhận. Số dư hiện ở góc dashboard.

## 4. Chọn gói token

Vào [Dashboard → Quota packages](https://aigateway.orimise.com/dashboard/quota-packages) → chọn đúng gói bạn đã mua. Giá gói được trừ bằng credit vừa nạp. **Hạn gói bắt đầu tính từ lúc kích hoạt.**

## 5. Tạo API key

Vào [Dashboard → API keys](https://aigateway.orimise.com/dashboard/keys) → tạo key mới → copy.

Base URL:

```
https://aigateway.orimise.com/v1
```

## 6. Dùng với công cụ

Điền Base URL + API key vào: Codex CLI, Claude Code, Cursor, Cline, Roo, Continue, VS Code — các công cụ hỗ trợ chuẩn API tương thích phổ thông.

## Danh sách model trong gói Codex

| Model | Ghi chú |
|---|---|
| `gpt-6.1-sol` | Mạnh nhất trong gói |
| `gpt-6-sol` | |
| `gpt-6-luna` | Nhanh, tiết kiệm |
| `gpt-5.6-sol` | |
| `gpt-5.6-terra` | |
| `gpt-5.6-luna` | |
| `gpt-5.5` | |

Gói không bao gồm model Astra.

## Gói GPT 6 Luna không giới hạn (1 ngày)

Không giới hạn token trong 1 ngày, model `gpt-6-luna`. Cách kích hoạt giống hệt các bước trên — chọn gói *GPT 6 Luna không giới hạn* ở bước 4.

## Lưu ý & bảo hành

- Hạn gói tính liên tục, không tạm dừng.
- Token chưa dùng hết khi hết hạn sẽ không được hoàn.
- Lỗi phát sinh từ hệ thống: hoàn credit cho phần token chưa dùng.
- Không chia sẻ API key công khai; key lộ sẽ bị thu hồi.

## Hỗ trợ

Nhắn Telegram [t.me/datammocom](https://t.me/datammocom) kèm mã đơn hàng.
