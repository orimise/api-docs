---
title: Kết nối AI agent qua MCP
summary: 'Kết nối AI agent tới Orimise qua MCP Streamable HTTP: tạo credential có phạm vi và hạn dùng trong dashboard, danh mục tool /mcp/user và /mcp/admin, cách gỡ lỗi.'
space: ai-gateway
slug: orimise-api-ket-noi-ai-agent-qua-mcp
status: published
tags:
- ai-gateway
- mcp
- ai-agent
review_by: '2027-04-04'
---

Gateway cung cấp MCP Streamable HTTP bằng official Go SDK. Hai endpoint:

| Endpoint | Scope token | Quyền |
| --- | --- | --- |
| `/mcp/user` | `user:read` | Đọc tài khoản và dữ liệu của chính chủ token |
| `/mcp/admin` | `admin:debug` | Đọc dữ liệu phục vụ điều tra hệ thống; chủ token phải đang là admin |

Phiên bản này **chỉ đọc**: không gọi model để sinh nội dung, không chi tiền,
không sửa cấu hình và không thực hiện SQL/shell/HTTP tùy ý. User vẫn sử dụng API key
với các endpoint inference hiện có để gọi model. MCP giúp agent tra cứu cách dùng,
model, số dư, giới hạn, định tuyến và chẩn đoán request.

## Cài đặt và kết nối

1. Build/chạy API và dashboard đã cập nhật. API startup chạy migration
   `040_mcp_tokens.sql`; kiểm tra migration thành công trước khi sử dụng. Không cần
   một tiến trình MCP riêng. URL API mặc định khi chạy Go là `http://localhost:8000`;
   dùng đúng host/port triển khai thực tế.
2. Mở `/dashboard/mcp` → **Tạo token**, hoặc `/admin/mcp` để tạo token debug.
3. Đặt tên riêng cho mỗi agent. User token có hạn 1–90 ngày, admin token 1–7 ngày;
   mặc định 7 ngày. Mỗi tài khoản tối đa 20 token đang hoạt động, tính chung hai scope.
4. Lưu token ngay khi hiển thị. Token chỉ được trả một lần, DB chỉ lưu SHA-256.
   Trang quản lý trả metadata của tối đa 100 token, ưu tiên token còn hiệu lực.
5. Thêm cấu hình vào MCP client hỗ trợ Streamable HTTP và custom headers:

```json
{
  "mcpServers": {
    "orimise-user": {
      "url": "https://YOUR_GATEWAY_HOST/mcp/user",
      "headers": {
        "Authorization": "Bearer YOUR_USER_MCP_TOKEN"
      }
    },
    "orimise-admin": {
      "url": "https://YOUR_GATEWAY_HOST/mcp/admin",
      "headers": {
        "Authorization": "Bearer YOUR_ADMIN_MCP_TOKEN"
      }
    }
  }
}
```

Chỉ cấu hình endpoint cần dùng. Tên trường cấu hình có thể khác theo client;
giá trị cần thiết là URL, transport Streamable HTTP và header Authorization.
Client chỉ hỗ trợ OAuth hoặc SSE cũ chưa dùng được với cơ chế này. Không dùng
JWT đăng nhập, API key inference, cookie hoặc query string để xác thực MCP.
Token user không dùng được tại endpoint admin và ngược lại.

Ở production, dùng HTTPS. Reverse proxy cần chuyển nguyên header Authorization,
Accept và MCP-Protocol-Version; không cache `/mcp/*` hoặc `/api/me/mcp-tokens`.
MCP chạy stateless, không cần sticky session; GET/DELETE MCP trả 405 theo SDK,
không phải thao tác thu hồi token. Browser client có Origin phải nằm trong danh sách
origin cụ thể đã cấu hình của API; `*` không được chấp nhận cho MCP.

## Công cụ user (cũng có trong endpoint admin, áp dụng cho chính chủ token)

| Tool | Dữ liệu |
| --- | --- |
| `gateway_account` | ID, email, trạng thái xác minh/khóa, giới hạn RPM/TPM, model bị tắt |
| `gateway_models` | Catalogue công khai, giá, giới hạn context/output, alias hiển thị cho user |
| `gateway_balance` | Số dư hiện tại từ payment service; trả lỗi nếu payment không khả dụng |
| `gateway_api_keys` | ID/tên, trạng thái, giới hạn và lần sử dụng cuối; không trả giá trị khóa |
| `gateway_usage` | Tổng request/token/chi phí và theo model, `days` 1–90 (mặc định 7) |
| `gateway_recent_requests` | Request gần đây, trạng thái, chi phí, token, latency; `limit` 1–100 |
| `gateway_request` | Một usage request theo `request_id` UUID, bắt buộc thuộc chủ token |
| `gateway_routes` | Alias do user tạo, thứ tự target và gán API key; không lộ mapping admin ẩn |

Ví dụ yêu cầu agent: “Kiểm tra số dư, giới hạn key và 20 request gần đây của tôi;
giải thích vì sao request bị lỗi hoặc chi phí tăng.” ID request của tool là UUID
usage log, có thể khác request ID phía upstream hoặc HTTP trace ID.

## Công cụ admin bổ sung

| Tool | Dữ liệu / bộ lọc |
| --- | --- |
| `admin_overview` | Tổng usage không tính admin, feature flags và thời điểm snapshot; `days` 1–90, mặc định 1 |
| `admin_users` | Tìm user theo `search`, trạng thái, rate limit, model bị tắt |
| `admin_user_usage` | Tài khoản và usage của `user_id` UUID cụ thể; `days` 1–90 |
| `admin_models` | Model đang bật/tắt, giá, token limits, allowed users; tìm theo model ID |
| `admin_routes` | Alias admin, target, provider, thứ tự và user được gán; tìm theo alias |
| `admin_providers` | Trạng thái, loại, priority, model và việc có cấu hình key hay chưa |
| `admin_requests` | Lịch sử toàn hệ thống, gồm admin: `model`, `provider`, `status`, `search`, `days` |
| `admin_system_logs` | Sự kiện có cấu trúc: `level`, `event`, status, error code, timing, correlation UUID |

Các tool phân trang nhận `limit` 1–100 (mặc định 20), `offset` 0–10000. Tìm request
lỗi bằng `status: "error"`; tìm một UUID bằng `search`. Công cụ provider và overview
là snapshot dữ liệu, không chứng minh Redis/Kafka/worker/upstream đang hoạt động.

Luồng debug gợi ý:

1. `admin_overview` để xem phạm vi thời gian và tính năng bị tắt.
2. `admin_requests` với `status: "error"`, `days: 1` để xác định model/provider/user.
3. `admin_user_usage` + `admin_models` + `admin_routes` + `admin_providers` để đối chiếu
   tài khoản, giới hạn, model, quyền truy cập và cấu hình định tuyến.
4. `admin_system_logs` với `level: "error"` hoặc event tương ứng để xem mã lỗi và timing.

Ví dụ: “Điều tra request lỗi của user X trong 24 giờ qua. Đối chiếu model, mapping,
provider và giới hạn tài khoản; ghi rõ điều gì đã xác nhận và dữ liệu còn thiếu.”

## Giới hạn dữ liệu và kiểm soát truy cập

- Quyền admin, trạng thái khóa/xóa tài khoản, thời hạn và thu hồi token được kiểm tra
  lại mỗi HTTP request. Hạ quyền admin làm token admin mất quyền ngay ở request tiếp theo.
- Tool tuân theo feature flag tương ứng. Các token không cấp quyền thay đổi dữ liệu.
- Không trả password/hash, API key, credential provider, upstream URL, notification
  settings, prompt hay response body. Log `detail` và metadata tự do bị loại bỏ;
  chỉ giữ numeric status/timing/token count, correlation UUID và error code định dạng an toàn.
  Khi cần nội dung log gốc, người quản trị xem trong giao diện admin hiện có.
- Request và system log được ghi bất đồng bộ nên có thể trễ hoặc đã hết retention.
  Không có record không có nghĩa là request chưa từng xảy ra.
- Tool errors không trả lỗi database/upstream thô; trả mã lỗi và `request_id` để đối chiếu.
  Audit `mcp.tool_call` ghi owner, token ID, tool, scope, timing, outcome; không ghi tham số,
  kết quả hay giá trị token. Ghi audit là best effort, không thay thế audit log bất biến.
- Giới hạn mỗi endpoint: 16 HTTP request đồng thời, timeout 20 giây, request body 64 KiB,
  kết quả tool 512 KiB. Đây không phải quota request/phút; có thể đặt rate limit thêm tại ingress.
- Dùng **Thu hồi token** trên dashboard để ngắt agent. Request đã được chấp nhận trước
  khi thu hồi có thể hoàn tất trong timeout; request tiếp theo bị từ chối.

## REST quản lý token

Các endpoint dưới đây sử dụng JWT đăng nhập dashboard và chỉ quản lý token của chính tài khoản:

```text
GET    /api/me/mcp-tokens
POST   /api/me/mcp-tokens
DELETE /api/me/mcp-tokens/{id}
```

Body tạo token:

```json
{"name":"My debugging agent","scope":"admin:debug","expires_in_days":1}
```

Kết quả tạo: `{"credential":{...metadata...},"token":"mcp_..."}`. Danh sách không
bao giờ trả lại giá trị token hoặc digest. Xóa token trả 204; revoke token không thuộc
chính mình trả 404.

## Kiểm thử

```sh
go test ./internal/interfaces/mcp ./internal/interfaces/http -run MCP -count=1
go test ./...
go vet ./...
go build ./cmd/...
```

`TestMCPRealSDKClient` sử dụng MCP SDK client thật qua HTTP để kiểm tra kết nối,
discovery và gọi tool. Test HTTP kiểm tra lifecycle, phân quyền, tenant isolation,
redaction, feature flags và CORS. Để kiểm tra migration, PostgreSQL repository và
giới hạn cấp token đồng thời trên database test:

```sh
# Set MCP_TEST_DATABASE_URL to a test PostgreSQL database first.
go test ./internal/infrastructure/postgres -run TestMCPTokenRepositoryIntegration -count=1
```

Test PostgreSQL tạo schema riêng và xóa schema đó khi kết thúc. Không trỏ biến này
vào database production.
