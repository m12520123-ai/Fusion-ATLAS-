# 明日智選・產業研究地圖｜v9.0.0

全新前端與 Netlify 後端。參考 AIStockMap 公開的頁面類型，改為產業／公司研究工作台；不是原站程式或全部會員功能的複製。

**正式版不含合成行情。預設是盤後資料，不是 5 秒即時，也不是延遲 15–20 分鐘盤中服務。**

## 直接更新

閱讀 **`docs/UPDATE_GUIDE.md`**，解壓縮後把內容上傳到既有 GitHub repository 根目錄，等 Netlify 最新 commit Published。
不需要換網域，不需要把 FinMind Token 再放到程式裡。

部署完成開啟：
`https://spiffy-vacherin-6d2081.netlify.app/start.html`

新版只有一個 Netlify Function `atlas`，使用 `/api/atlas/*` 自訂路徑。不要再測舊 `/api/status`。
首次頁面自動載入台股行情、官方公司資料與前 6 檔日線；每項有獨立成功／失敗狀態。
來源失敗不生成假價格，不會因單一 health check 失敗就阻擋全站量價。

## 檔案用途

```text
site/                    正式前端（不含測試行情）
server/functions/        新版單一 Netlify Function
server/lib/              官方／FinMind／海外資料接口、驗證與快取
scripts/                 建置檢查、本機伺服器、預覽產生
tests/                   明確 mock 測試資料、計算與瀏覽器測試
docs/                    操作說明、功能缺口、來源與測試報告
netlify.toml             發布 site、Functions server/functions
```

## 本機開啟

安裝 Node.js 22 或以上：
```sh
npm start
```
用電腦瀏覽器開啟終端機列出的 localhost 網址。首次真實資料需要能連到外部來源。

僅測試 UI、不連行情來源：
```sh
ATLAS_TEST_DATA=1 npm start
```
Windows PowerShell：
```powershell
$env:ATLAS_TEST_DATA="1"; npm start
```
測試資料在 `tests/fixtures.mjs`，不會發布到 `site/`。不要將這些數字當成行情。

## 驗證與測試

```sh
npm run check
npm test
node scripts/build-preview.mjs preview.html
python -m pip install playwright
python -m playwright install chromium
python tests/browser_smoke.py --preview preview.html --chromium /path/to/chromium
```

瀏覽器測試參數可用 `--output` 指定輸出目錄。
部分受管環境禁止本機 URL 導航，測試使用 `set_content` 單檔預覽；不等於已完成真實 iPhone/Safari 驗收。

## 選用環境變數（放 Netlify，不放前端）

- `FINMIND_TOKEN`：原有 Token 可保留；有 Token 不等於有付費資料集權限。
- `TWELVE_DATA_API_KEY`：海外資料與方案權限。
- `ATLAS_ACCESS_TOKEN`：保護資料 API 的網站存取碼；前端僅當次記憶體使用。
- `OPENAI_API_KEY`、`OPENAI_MODEL`：線上 AI，另要求 `ATLAS_ACCESS_TOKEN` 及使用者傳送同意。

本機程式從 process.env 讀取，不自動載入 `.env`。可用 shell 設定，或 Node 22 的 `--env-file` 啟動。

## 使用界線

本機 localStorage 紀錄，不含雲端同步與多人登入。更換網址／瀏覽器／手機時需自己匯出／還原。
價格與日 K 依來源日期；月營收採實際營收月份而非出表日期；日線未還原除權息。
題材分類可編輯，但未逐筆查核，不能視為已證實客戶／供應商關係。
回測是單股、整股、單一多頭、次日開盤；缺公司行動、成交容量、停牌等模型，不提供買賣保證。

公開 API 仍會消耗來源額度。快取為單一 Function instance + 可用 CDN 快取，沒有分散式全域限流、正式會員權限或滲透測試。API 存取碼不能取代正式授權與安全架構。
資料商或交易所的公開瀏覽權限，不必然包含再散布權限；對外服務前須確認各資料授權。

**已實作／未完成請看 `docs/FEATURE_MATRIX.md`；不要把介面存在當成已完成所有資料連線。**
