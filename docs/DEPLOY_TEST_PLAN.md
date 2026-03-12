# Deploy Test Plan (h1bfinder.com)

每次部署后自动执行，目标是防止“筛选器切换导致 API 500 / 整页报错”再次发生，并在部署后尽快发现关键页面桌面端 / 移动端回归。

## Scope

### 1) 首页筛选回归（重点）
- `/?year=2025&state=VA`
- `/?year=2024&state=VA`
- `/?year=&state=VA`（空 year 容错）
- `/?state=CA`
- `/?year=2023`

验证项：
- 页面不出现已知错误模式：
  - `API Connection Error. Verify H1B_API_BASE_URL.`
  - `API 500 for http://backend:8089`
  - `Application error`
  - `Internal Server Error`
  - `Unhandled Runtime Error`
  - `__NEXT_ERROR__`
- 首页数据试用模块仍可渲染：`Test the Database`

### 2) 关键页面健康检查
- `/`
- `/companies`
- `/titles`
- `/plan`
- `/chat`
- `/legal/tos.md`
- `/legal/privacy.md`

验证项：
- HTTP 200

### 3) 全路径内容冒烟（桌面）
- `/` → `Verified H1B Intelligence`
- `/companies` → `Top Sponsors`
- `/titles` → `Top Jobs`
- `/plan` → `Generate a data-backed roadmap`
- `/chat` → `H1B Intelligence Chat`

验证项：
- 页面不出现已知错误模式
- 页面仍渲染核心业务文案，而不是空白 / 错页 / 通用异常页

### 4) 移动端冒烟（Mobile UA）
- `/` → `nav-mobile`
- `/companies` → `Top Sponsors`
- `/titles` → `Top Jobs`
- `/plan` → `Generate a data-backed roadmap`
- `/chat` → `H1B Intelligence Chat`

验证项：
- 使用 Mobile Safari UA 抓取
- 页面不出现已知错误模式
- 首页确认移动导航结构存在，其余关键页确认核心业务文案仍在

### 5) API 冒烟
- `/api/v1/meta/years`
- `/api/v1/rankings?year=2025&limit=10`
- `/api/v1/rankings/summary?year=2025&state=VA`
- `/api/v1/titles?year=2025&limit=50`

验证项：
- JSON 中包含 `"success": true`

## CI Integration

执行脚本：
- `scripts/deploy-test-plan.sh`

该脚本已集成到 Deploy workflow 的 Verify 阶段，部署后自动执行。

## Local / Manual Run

```bash
SITE_URL=https://h1bfinder.com \
HOST_NAME=h1bfinder.com \
RESOLVE_IP=127.0.0.1 \
./scripts/deploy-test-plan.sh
```

可通过环境变量覆盖 User-Agent、请求超时或解析 IP：
- `DESKTOP_UA`
- `MOBILE_UA`
- `CURL_MAX_TIME`
- `RESOLVE_IP`
