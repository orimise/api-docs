---
title: Kết nối AI agent qua MCP
summary: 'Kết nối AI agent như Claude Desktop hay Cursor tới Orimise qua MCP chỉ đọc: tạo token có hạn dùng trong dashboard, cấu hình client, danh mục tool tra cứu số dư, usage và request của chính bạn.'
space: ai-gateway
slug: orimise-api-ket-noi-ai-agent-qua-mcp
status: published
tags:
- ai-gateway
- mcp
- ai-agent
review_by: '2027-04-04'
---

Orimise AI Gateway có sẵn một máy chủ MCP (Model Context Protocol) **chỉ đọc** để AI agent như Claude Desktop hay Cursor tra cứu tài khoản của chính bạn: số dư, giới hạn, model đang dùng được, định tuyến và các request gần đây.

MCP không gọi model để sinh nội dung, không chi tiền, không sửa cấu hình và không chạy SQL, shell hay HTTP tùy ý. Để gọi model, bạn vẫn dùng API key với các endpoint như `/v1/chat/completions`. MCP giúp agent trả lời những câu như "tháng này tôi tốn bao nhiêu" hoặc "vì sao request vừa rồi bị lỗi".

| | |
| --- | --- |
| Endpoint | `https://api.orimise.com/mcp/user` |
| Giao thức | MCP Streamable HTTP |
| Xác thực | `Authorization: Bearer YOUR_MCP_TOKEN` |
| Quyền | Chỉ đọc dữ liệu của chính chủ token |

## Cài đặt và kết nối

1. Đăng nhập dashboard Orimise, mở **MCP** (`/dashboard/mcp`) và bấm **Tạo token**.
2. Đặt tên riêng cho mỗi agent. Token có hạn từ 1 đến 90 ngày, mặc định 7 ngày. Mỗi tài khoản có tối đa 20 token đang hoạt động.
3. Lưu token ngay khi nó hiện ra. Token chỉ hiển thị một lần; Orimise chỉ lưu mã băm SHA-256 của token.
4. Thêm cấu hình vào MCP client hỗ trợ Streamable HTTP và header tùy chỉnh:

```json
{
  "mcpServers": {
    "orimise": {
      "url": "https://api.orimise.com/mcp/user",
      "headers": {
        "Authorization": "Bearer YOUR_MCP_TOKEN"
      }
    }
  }
}
```

Tên trường cấu hình có thể khác theo từng client; giá trị cần có là URL, transport Streamable HTTP và header Authorization. Client chỉ hỗ trợ OAuth hoặc SSE kiểu cũ chưa dùng được. Không dùng JWT đăng nhập, API key inference, cookie hay query string để xác thực MCP: chỉ token tạo ở trang MCP mới được chấp nhận.

## Công cụ có sẵn

| Tool | Dữ liệu trả về |
| --- | --- |
| `gateway_account` | ID, email, trạng thái xác minh hoặc khóa, giới hạn RPM/TPM, model bị tắt |
| `gateway_models` | Catalog công khai, giá, giới hạn context và output, alias hiển thị cho bạn |
| `gateway_balance` | Số dư hiện tại; báo lỗi nếu dịch vụ thanh toán tạm không khả dụng |
| `gateway_api_keys` | ID, tên, trạng thái, giới hạn và lần dùng cuối của từng key; không trả giá trị key |
| `gateway_usage` | Tổng request, token, chi phí và theo model; `days` từ 1 đến 90, mặc định 7 |
| `gateway_recent_requests` | Request gần đây với trạng thái, chi phí, token, độ trễ; `limit` từ 1 đến 100 |
| `gateway_request` | Một request theo `request_id` (UUID), bắt buộc thuộc về bạn |
| `gateway_routes` | Alias bạn tự tạo, thứ tự đích và key được gán |

Ví dụ yêu cầu cho agent: "Kiểm tra số dư, giới hạn key và 20 request gần đây của tôi; giải thích vì sao request bị lỗi hoặc chi phí tăng." `request_id` của tool là UUID trong nhật ký usage của Orimise, có thể khác ID request phía nhà cung cấp model hoặc mã trace HTTP.

## Giới hạn dữ liệu và bảo mật

- Token chỉ đọc, không cấp quyền thay đổi dữ liệu. Tool tuân theo các tính năng đang bật cho tài khoản của bạn.
- Không bao giờ trả mật khẩu, giá trị API key, thông tin xác thực của nhà cung cấp, nội dung prompt hay response. Chỉ có số liệu như trạng thái, thời gian, số token, UUID và mã lỗi.
- Nhật ký request được ghi bất đồng bộ nên có thể trễ, hoặc đã hết thời hạn lưu. Không thấy bản ghi không có nghĩa là request chưa từng xảy ra.
- Lỗi của tool chỉ trả mã lỗi và `request_id` để đối chiếu, không lộ chi tiết hệ thống.
- Mỗi endpoint xử lý tối đa 16 request đồng thời, timeout 20 giây, body request tối đa 64 KiB và kết quả tool tối đa 512 KiB.
- Dùng **Thu hồi token** trên trang MCP để ngắt một agent ngay. Request đã được chấp nhận trước khi thu hồi có thể hoàn tất trong thời gian timeout; request tiếp theo bị từ chối.

## Quản lý token bằng REST

Các endpoint sau dùng phiên đăng nhập dashboard và chỉ quản lý token của chính tài khoản:

```text
GET    /api/me/mcp-tokens
POST   /api/me/mcp-tokens
DELETE /api/me/mcp-tokens/{id}
```

Body tạo token:

```json
{"name":"My agent","scope":"user:read","expires_in_days":7}
```

Kết quả tạo là `{"credential":{...metadata...},"token":"mcp_..."}`. Danh sách không bao giờ trả lại giá trị token. Xóa token trả 204.
