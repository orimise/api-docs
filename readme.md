# Orimise API: hướng dẫn bắt đầu

> Tạo tài khoản, lấy API key và gửi request đầu tiên tới Orimise AI Gateway.

Orimise AI Gateway cung cấp các model AI qua một API key. API hỗ trợ định dạng OpenAI Chat Completions, OpenAI Responses, Anthropic Messages và Google Gemini. Danh mục model và giá được cập nhật trong dashboard; hãy tra cứu trước khi chọn model cho ứng dụng.

## Mục lục

1. [Tạo tài khoản](#1-tạo-tài-khoản)
2. [Xác minh email](#2-xác-minh-email)
3. [Tạo API key](#3-tạo-api-key)
4. [Gọi API đầu tiên](#4-gọi-api-đầu-tiên)
5. [Tích hợp SDK](#5-tích-hợp-sdk)
6. [Endpoint và URL](#6-endpoint-và-url)
7. [Số dư, model và chi phí](#7-số-dư-model-và-chi-phí)
8. [Khắc phục sự cố](#8-khắc-phục-sự-cố)

## 1. Tạo tài khoản

Mở [trang đăng ký Orimise AI Gateway](https://aigateway.orimise.com/register), nhập email và mật khẩu (tối thiểu 8 ký tự), xác nhận mật khẩu rồi đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.

![Trang đăng ký AI Gateway](images/02_register.png)

Nếu đã có tài khoản, hãy dùng [trang đăng nhập](https://aigateway.orimise.com/login).

![Trang đăng nhập AI Gateway](images/03_login.png)

## 2. Xác minh email

Sau khi đăng ký, nhập mã OTP được gửi tới email. Mã hết hạn sau 10 phút; có thể yêu cầu gửi mã mới sau 60 giây. Nếu chưa thấy thư, kiểm tra thư mục spam/junk.

Khi xác minh thành công, đăng nhập vào dashboard tại [aigateway.orimise.com](https://aigateway.orimise.com/).

## 3. Tạo API key

1. Mở [API Keys](https://aigateway.orimise.com/dashboard/keys) sau khi đăng nhập.
2. Tạo key mới và đặt tên để nhận diện ứng dụng hoặc môi trường.
3. Sao chép key ngay lúc tạo. Giá trị đầy đủ chỉ được hiển thị một lần.

Giữ key ở phía server, chẳng hạn trong biến môi trường `ORIMISE_API_KEY`. Không commit key vào mã nguồn, không gửi key tới trình duyệt và thu hồi key ngay nếu bị lộ. Trang API Keys cũng cho phép cấu hình giới hạn request/phút, token/phút và chi tiêu theo ngày, tháng hoặc tổng.

## 4. Gọi API đầu tiên

Trước tiên, lấy danh sách model mà key của bạn có thể sử dụng:

```bash
curl https://api.orimise.com/v1/models \
  -H "Authorization: Bearer YOUR_ORIMISE_API_KEY"
```

Chọn một giá trị `id` trong kết quả rồi gửi request Chat Completions:

```bash
curl https://api.orimise.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_ORIMISE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "YOUR_MODEL_ID",
    "messages": [
      {"role": "user", "content": "Xin chào!"}
    ]
  }'
```

Thay `YOUR_ORIMISE_API_KEY` và `YOUR_MODEL_ID` bằng giá trị của bạn. Không dựa vào tên hoặc giá model ghi cứng trong bài hướng dẫn; danh mục trên dashboard là nguồn hiện hành.

## 5. Tích hợp SDK

### Python: OpenAI SDK

```python
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_ORIMISE_API_KEY",
    base_url="https://api.orimise.com/v1",
)

response = client.chat.completions.create(
    model="YOUR_MODEL_ID",
    messages=[{"role": "user", "content": "Xin chào!"}],
)

print(response.choices[0].message.content)
```

### Node.js: OpenAI SDK

```javascript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.ORIMISE_API_KEY,
  baseURL: "https://api.orimise.com/v1",
});

const response = await client.chat.completions.create({
  model: "YOUR_MODEL_ID",
  messages: [{ role: "user", content: "Xin chào!" }],
});

console.log(response.choices[0].message.content);
```

### Anthropic Messages

```bash
curl https://api.orimise.com/v1/messages \
  -H "Authorization: Bearer YOUR_ORIMISE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "YOUR_MODEL_ID",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Xin chào!"}]
  }'
```

### Google Gemini

```bash
curl https://api.orimise.com/v1beta/models/YOUR_MODEL_ID:generateContent \
  -H "Authorization: Bearer YOUR_ORIMISE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{"parts": [{"text": "Xin chào!"}]}]
  }'
```

Streaming được hỗ trợ bằng SSE. Với Chat Completions, thêm `"stream": true` vào JSON body và đọc các dòng `data:` cho đến sentinel kết thúc của stream.

## 6. Endpoint và URL

Gateway host: `https://api.orimise.com`. Dùng đường dẫn API tương ứng với định dạng request:

| Tác vụ | Method và endpoint |
|---|---|
| Liệt kê model | `GET /v1/models` |
| OpenAI Chat Completions | `POST /v1/chat/completions` |
| OpenAI Responses | `POST /v1/responses` |
| Anthropic Messages | `POST /v1/messages` |
| Đếm token theo định dạng Anthropic | `POST /v1/messages/count_tokens` |
| Liệt kê model Gemini | `GET /v1beta/models` |
| Gemini generate content | `POST /v1beta/models/{model}:generateContent` |

Mỗi request cần header `Authorization: Bearer YOUR_ORIMISE_API_KEY`. Các model khả dụng có thể khác nhau giữa các tài khoản; kiểm tra dashboard hoặc `GET /v1/models` để lấy model ID hiện tại.

Trong dashboard, [Hướng dẫn tích hợp](https://aigateway.orimise.com/dashboard/guides) tạo cấu hình cho Claude Code, Codex CLI, Gemini CLI, OpenCode, Grok Build, CC Switch và OpenClaw. Hướng dẫn có lựa chọn shell Bash, PowerShell và Windows CMD.

![Khu vực AI Gateway và giá theo mức sử dụng](images/04_api_overview.png)

## 7. Số dư, model và chi phí

- Xem model, trạng thái khả dụng và giá hiện hành tại [Mô hình](https://aigateway.orimise.com/dashboard/models).
- Theo dõi số dư, lịch sử giao dịch, nạp tiền và nhập coupon tại [Thanh toán](https://aigateway.orimise.com/dashboard/billing). Tùy chọn hiển thị phụ thuộc vào cấu hình tài khoản.
- Xem request và chi phí tại các trang usage trong dashboard.

Giá được tính theo model và lượng sử dụng. Không dùng bảng giá trong bài viết hoặc ảnh cũ để ước tính; kiểm tra bảng giá trong dashboard trước khi triển khai.

![Mục giá AI Gateway trên website Orimise](images/05_model_pricing.png)

## 8. Khắc phục sự cố

- **401 hoặc lỗi xác thực:** kiểm tra key, header Bearer và chắc chắn key chưa bị thu hồi.
- **Model không khả dụng:** lấy ID từ `GET /v1/models` và xác nhận model đó đang được bật trong dashboard.
- **Hết số dư hoặc giới hạn:** xem trang Thanh toán và kiểm tra giới hạn đã đặt cho API key.
- **Không nhận được OTP:** kiểm tra spam/junk; mã có hiệu lực 10 phút và yêu cầu gửi lại chỉ khả dụng sau thời gian chờ 60 giây.
- **Lỗi từ API:** giữ lại HTTP status và response body khi liên hệ `support@orimise.com`; xóa API key khỏi log trước khi chia sẻ.

---

Trang tham khảo: [Orimise AI Gateway](https://aigateway.orimise.com/), [Mô hình và giá](https://aigateway.orimise.com/dashboard/models), [Hướng dẫn tích hợp](https://aigateway.orimise.com/dashboard/guides).
