# v9 測試紀錄

日期：2026-09-23
環境：Node.js 22.16.0、Python 3、Playwright + /usr/bin/chromium
版本：9.0.0 / map-rebuild-9

## 已實際執行

- `node scripts/check-build.mjs`：通過，檢查新入口、部署核心檔案。
- `node --check site/atlas-app.mjs`：通過。
- `node --test tests/core.test.mjs`：**42／42 通過**。
- `python tests/browser_smoke.py --preview … --output …`：**78／78 通過**，瀏覽器頁面例外 **0**。

## 42 個 Node 檢查覆蓋

缺值處理、民國日期、成交量單位、OHLC、來源欄位空白／變更、月營收千元換算、股數、CSV 引號／公式安全、明確欄位匯出、成本／超賣／多幣別、備份格式、自訂題材格式、規則三值判定、指標計算、週 K 聚合、回測次日成交、禁止基本面前視、法人自營商去重、日期對齊、熱力分割、API 路由／狀態／權限／錯誤、Token 不進 URL 等。

## 78 個瀏覽器檢查覆蓋

14 個主要路由及 1440px 防橫向溢出、公司八個頁籤、日週月 K、四種指標、釘選 K 棒、搜尋與收藏、交易建立及超賣阻擋、筆記 HTML 轉義、行事曆、作者、法說兩季比較、條件選股、回測、非 AI 摘要、熱力圖、台韓市場隔離、390px 八個頁面及手機搜尋視窗。

另注入：
1. status API 失敗，行情仍成功：52 檔行情正常保留。
2. quotes API 失敗：沒有憑空生成行情，設定頁有錯誤。
3. 所有 API 失敗：頁面仍可開啟，資料數 0，不冒充成功。
4. 故障注入後仍無 JavaScript page exception。

## 沒有宣稱完成的測試

- **所有市場數值都來自明確合成的 mock fixtures，不是真實行情。**
- 瀏覽器管理策略禁止本機 URL 導航，因此將同一份前端邏輯生成單檔後，以 Playwright `set_content` 操作。
- 本次未完成真實 Netlify build/production、TWSE、TPEx、FinMind、海外或線上 AI 端到端連線。
- 未完成真實 iPhone Safari／加入主畫面實機、權限資費、安全滲透、原站像素一致或私有功能對等驗收。
- 單元測試通過，不代表回測報酬有效、資料來源永不改欄位或整體是可對外收費的金融服務。

附 `test-results/browser-results.json` 與 `test-results/core-final.log`，可核對逐項結果。
