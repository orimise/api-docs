---
title: Hướng dẫn bắt đầu với Orimise API
summary: Từ đăng ký tài khoản Orimise, xác thực OTP, nhập coupon, lấy API key đến lệnh gọi API đầu tiên và cách trỏ OpenAI/Anthropic SDK sang api.orimise.com.
space: ai-gateway
slug: orimise-api-huong-dan-bat-dau
status: published
tags:
- ai-gateway
- bat-dau
- api-key
review_by: '2027-04-04'
---

> Từ đăng ký tài khoản đến gọi API đầu tiên chỉ trong **vài phút**.

Orimise là nền tảng API AI hợp nhất — cho phép bạn truy cập **20+ mô hình AI** (GPT-5, Claude Opus, Gemini Pro,...) qua **một API duy nhất**, tương thích hoàn toàn với OpenAI, Anthropic và Gemini SDK.

---

## Mục lục

1. [Bước 1 — Tạo tài khoản](#bước-1--tạo-tài-khoản)
2. [Bước 2 — Xác thực OTP](#bước-2--xác-thực-otp)
3. [Bước 3 — Nhập Coupon để nhận Credit](#bước-3--nhập-coupon-để-nhận-credit)
4. [Bước 4 — Lấy API Key](#bước-4--lấy-api-key)
5. [Bước 5 — Gọi API đầu tiên](#bước-5--gọi-api-đầu-tiên)
6. [Tích hợp với SDK](#tích-hợp-với-sdk)
7. [Xem danh sách Model & Giá](#xem-danh-sách-model--giá)
8. [FAQ — Câu hỏi thường gặp](#faq--câu-hỏi-thường-gặp)

---

## Bước 1 — Tạo tài khoản

### 1.1. Truy cập trang đăng ký

Mở trình duyệt và truy cập: **[https://orimise.com](https://orimise.com)**

Tại trang chủ, nhấn nút **"Bắt đầu"** ở góc trên bên phải (hoặc nút **"Bắt đầu ngay →"** ở giữa trang).

*(Ảnh minh họa: `images/01_homepage.png` trong repo)*

### 1.2. Điền thông tin đăng ký

Bạn sẽ được chuyển đến trang đăng ký tại `orimise.com/register`. Điền đầy đủ các thông tin:

| Trường | Mô tả |
|--------|-------|
| **Email** | Địa chỉ email của bạn (sẽ dùng để nhận mã OTP) |
| **Mật khẩu** | Tối thiểu 6 ký tự |
| **Xác nhận mật khẩu** | Nhập lại mật khẩu |
| **Đồng ý điều khoản** | Tick vào checkbox đồng ý [Điều khoản dịch vụ](https://orimise.com/terms) và [Chính sách bảo mật](https://orimise.com/privacy) |

Sau khi điền xong, nhấn nút **"Tạo tài khoản →"**.

*(Ảnh minh họa: `images/02_register.png` trong repo)*

> **💡 Lưu ý:** Nếu email đã được đăng ký nhưng chưa xác thực, hệ thống sẽ tự gửi lại mã OTP mới.

---

## Bước 2 — Xác thực OTP

### 2.1. Kiểm tra email

Sau khi nhấn **"Tạo tài khoản"**, hệ thống sẽ gửi **mã OTP 6 chữ số** đến email bạn đã đăng ký. Kiểm tra hộp thư đến (và cả thư mục spam/junk).

### 2.2. Nhập mã OTP

Trang web sẽ tự động chuyển đến màn hình xác thực. Nhập 6 chữ số OTP vào các ô trống rồi nhấn **"Xác thực →"**.

*(Ảnh minh họa: `images/03_otp.png` trong repo)*

**Một số lưu ý quan trọng:**

- ⏱️ Mã OTP có **hiệu lực 10 phút** — quá thời gian cần gửi lại mã mới.
- 🔄 Nút **"Gửi lại"** sẽ khả dụng sau **60 giây** kể từ lần gửi trước.
- ❌ Tối đa **5 lần nhập sai** — sau đó cần yêu cầu gửi OTP mới.

### 2.3. Xác thực thành công

Khi nhập đúng mã OTP:
- Tài khoản được **kích hoạt** ngay lập tức.
- Một **API Key mặc định** (Default Key) được **tự động tạo** cho bạn.
- Bạn được **tự động đăng nhập** và chuyển đến **Bảng điều khiển (Dashboard)**.

---

## Bước 3 — Nhập Coupon để nhận Credit

Tài khoản mới tạo sẽ có **số dư $0.0000**. Để bắt đầu sử dụng API, bạn cần nạp credit. Cách nhanh nhất là sử dụng **mã coupon**.

### 3.1. Truy cập trang Thanh toán

Từ sidebar bên trái, nhấn vào **"Thanh toán"** (hoặc truy cập trực tiếp: `orimise.com/dashboard/billing`).

*(Ảnh minh họa: `images/05_billing.png` trong repo)*

### 3.2. Nhập mã coupon

Tại phần **"🎫 Nhập mã coupon"**:

1. Nhập mã coupon vào ô trống
2. Nhấn nút **"Đổi mã"**
3. Hệ thống sẽ cộng credit vào tài khoản của bạn

**Định dạng mã coupon:** `prefix-XXXXX-XXXXX-XXXXX-XXXXX` (20 ký tự ngẫu nhiên, chia thành 4 nhóm).

> **📌 Phân biệt 2 loại coupon:**
>
> | Loại | Mô tả |
> |------|-------|
> | **Coupon thường** | Credit được cộng vào **số dư chính** — dùng cho tất cả model |
> | **Coupon tài trợ (Sponsored)** | Credit chỉ dùng được cho **một số model nhất định** — sẽ hiển thị Sponsored Balance riêng |

### 3.3. Xác nhận số dư

Sau khi đổi coupon thành công:
- **Số dư hiện tại** sẽ cập nhật ngay trên trang Thanh toán.
- Giao dịch sẽ xuất hiện trong phần **"Lịch sử giao dịch"** bên dưới.
- Bạn cũng có thể kiểm tra số dư tại **Dashboard** chính.

---

## Bước 4 — Lấy API Key

API Key là "chìa khóa" để xác thực khi gọi API. Hệ thống đã tự động tạo một **Default Key** khi bạn xác thực tài khoản.

### 4.1. Xem API Key

Từ sidebar, nhấn vào **"API Keys"** (hoặc truy cập: `orimise.com/dashboard/keys`).

*(Ảnh minh họa: `images/06_api_keys.png` trong repo)*

Tại đây bạn sẽ thấy:

| Cột | Mô tả |
|-----|-------|
| **Tên Key** | Tên gợi nhớ (mặc định: "Default Key") |
| **Key** | API key dạng `sk-...` (bị ẩn một phần vì bảo mật) |
| **Trạng thái** | 🟢 Hoạt động / 🔴 Đã thu hồi |
| **Chi phí** | Tổng chi phí đã dùng qua key này |
| **Tạo lúc** | Ngày tạo key |
| **Dùng lần cuối** | Lần cuối key được sử dụng |

### 4.2. Tạo thêm API Key (tuỳ chọn)

Nếu muốn tách biệt usage cho các project khác nhau:
1. Nhập tên key (ví dụ: "Production", "Testing") vào ô **"Tên key"**
2. Nhấn nút **"+ Tạo"**
3. **⚠️ Lưu ý:** Key chỉ hiển thị **đầy đủ một lần duy nhất** khi tạo — hãy copy và lưu lại ngay!

### 4.3. Thu hồi Key

Nếu key bị lộ, nhấn nút **"🗑️ Thu hồi"** để vô hiệu hóa ngay lập tức. Key đã thu hồi không thể khôi phục — bạn sẽ cần tạo key mới.

---

## Bước 5 — Gọi API đầu tiên

### 5.1. Thông tin kết nối

| Thông số | Giá trị |
|----------|---------|
| **Base URL** | `https://api.orimise.com/v1` |
| **Authentication** | `Bearer <YOUR_API_KEY>` |
| **Protocol** | Tương thích 100% OpenAI API format |

### 5.2. Gọi API bằng cURL

Mở terminal và chạy lệnh sau (thay `<YOUR_API_KEY>` bằng key thật của bạn):

```bash
curl -X POST https://api.orimise.com/v1/chat/completions \
  -H "Authorization: Bearer sk-your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5",
    "messages": [
      {"role": "user", "content": "Xin chào! Bạn là ai?"}
    ]
  }'
```

### 5.3. Response mẫu

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completions",
  "model": "gpt-5",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Xin chào! Tôi là trợ lý AI được cung cấp qua Orimise API..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 25,
    "total_tokens": 37
  }
}
```

### 5.4. Thử nhanh từ Dashboard

Bạn cũng có thể test API ngay trên Dashboard mà không cần terminal:

1. Tại **Bảng điều khiển**, tìm phần **"Quick Start"**
2. Chọn model muốn test từ dropdown (GPT-5, Claude, Gemini,...)
3. Nhấn nút **"▶ Run"** để gọi API ngay trên trang

*(Ảnh minh họa: `images/04_dashboard.png` trong repo)*

---

## Tích hợp với SDK

Vì Orimise tương thích 100% với OpenAI API format, bạn chỉ cần thay `base_url` — **không cần đổi code**!

### Python (OpenAI SDK)

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key-here",
    base_url="https://api.orimise.com/v1"
)

response = client.chat.completions.create(
    model="gpt-5",
    messages=[
        {"role": "user", "content": "Xin chào!"}
    ]
)

print(response.choices[0].message.content)
```

### Node.js (OpenAI SDK)

```javascript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "sk-your-api-key-here",
  baseURL: "https://api.orimise.com/v1",
});

const response = await client.chat.completions.create({
  model: "claude-sonnet-4-6",
  messages: [{ role: "user", content: "Xin chào!" }],
});

console.log(response.choices[0].message.content);
```

### Anthropic SDK (Python)

```python
from anthropic import Anthropic

client = Anthropic(
    api_key="sk-your-api-key-here",
    base_url="https://api.orimise.com/v1"
)

message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Xin chào!"}
    ]
)

print(message.content[0].text)
```

> **💡 Mẹo:** Bạn có thể dùng **bất kỳ model nào** (GPT, Claude, Gemini) qua cùng một SDK — chỉ cần đổi tên model!

---

## Xem danh sách Model & Giá

Truy cập **"Mô hình"** từ sidebar (hoặc: `orimise.com/dashboard/models`) để xem toàn bộ model khả dụng và bảng giá.

*(Ảnh minh họa: `images/07_models.png` trong repo)*

### Model phổ biến

| Model | Provider | Input/1M tokens | Output/1M tokens |
|-------|----------|-----------------|-------------------|
| GPT-5 | OpenAI | $2.00 | $10.00 |
| Claude Sonnet 4.6 | Anthropic | $3.00 | $15.00 |
| Gemini 2.5 Flash | Google | $0.30 | $2.50 |
| Gemini 2.5 Flash Lite | Google | $0.15 | $1.25 |
| Claude Opus 4.6 Thinking | Anthropic | $5.00 | $25.00 |

> Bạn có thể **bật/tắt** từng model bằng toggle trên trang Mô hình.

---

## FAQ — Câu hỏi thường gặp

### ❓ Tôi dùng hết credit thì sao?
Bạn có thể nạp thêm bằng cách:
- Nhập thêm coupon (nếu có)
- Chuyển khoản qua **VietQR** tại trang Thanh toán → nhấn **"Nạp tiền"**

### ❓ API có giới hạn request không?
Có rate limit để đảm bảo chất lượng dịch vụ. Thông thường đủ cho hầu hết use case.

### ❓ Tôi có thể dùng model nào?
Tất cả model hiển thị tại trang **Mô hình** đều khả dụng. Hiện hỗ trợ **18+ model** từ OpenAI, Anthropic và Google.

### ❓ API key bị lộ thì sao?
Vào trang **API Keys** → nhấn **"Thu hồi"** ngay để vô hiệu hóa key cũ → tạo key mới.

### ❓ Hỗ trợ streaming không?
Có! Thêm `"stream": true` vào request body:
```json
{
  "model": "gpt-5",
  "stream": true,
  "messages": [{"role": "user", "content": "Hello"}]
}
```

---

## Tóm tắt nhanh

```
📧 Đăng ký email → 🔢 Nhập OTP → 🎫 Đổi Coupon → 🔑 Lấy API Key → 🚀 Gọi API!
```

| Bước | Hành động | URL |
|------|-----------|-----|
| 1 | Đăng ký | [orimise.com/register](https://orimise.com/register) |
| 2 | Xác thực OTP | (tự động chuyển) |
| 3 | Nhập coupon | [orimise.com/dashboard/billing](https://orimise.com/dashboard/billing) |
| 4 | Lấy API Key | [orimise.com/dashboard/keys](https://orimise.com/dashboard/keys) |
| 5 | Gọi API | `https://api.orimise.com/v1/chat/completions` |

---

*Cần hỗ trợ? Liên hệ qua [Trò chuyện AI](https://orimise.com) trên dashboard hoặc email support@orimise.com.*
