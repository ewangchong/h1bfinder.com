# Deploy Test Plan (h1bfinder.com)

每次部署后自动执行，目标是防止“筛选器切换导致 API 500 / 整页报错”再次发生。

## Scope

### 1) 首页筛选回归（重点）
- `/?year=2025&state=VA`
- `/?year=2024&state=VA`
- `/?year=&state=VA`（空 year 容错）
- `/?state=CA`
- `/?year=2023`

验证项：
- 页面不出现 `API Connection Error`
- 页面不出现 `API 500`

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

### 3) API 冒烟
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
