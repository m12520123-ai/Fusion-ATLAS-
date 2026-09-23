# 明日智選・產業研究地圖 v9｜更新操作說明

更新日期：2026-09-23

這份是重新編寫的網站前端與 Netlify 後端，不是 v7 雷達改色，也不是 AIStockMap 原始程式。沿用既有 GitHub repository 與 Netlify 網址即可；不會自動替你發布。

## 先分清楚兩個檔案

- `Atlas_Map_Rebuild_v9.zip`：真正要上傳 GitHub 的正式原始碼。正式入口沒有合成行情；來源失敗會顯示原因。
- `Atlas_Map_Rebuild_Preview.html`：電腦瀏覽器可直接開啟的互動預覽。頂端黃色列標示「介面驗收用測試資料・非真實行情」。這份只是試操作，不要取代正式部署包，不拿其中數字判斷股票。

## 1. 上傳前備份

舊版有自行輸入交易、筆記或收藏時，先從舊版設定匯出完整備份。
新版使用獨立儲存名稱，不主動刪除舊紀錄。更換瀏覽器、網址、裝置，不會自動同步資料。

## 2. 更新同一個 GitHub repository

在電腦解壓縮 `Atlas_Map_Rebuild_v9.zip`。

開啟 GitHub 的 `Fusion-ATLAS-` → **Add file → Upload files**。
上傳解壓縮後「裡面的內容」，不是 ZIP 本身，也不是再包一層外部資料夾。

完成後最外層應該直接看到：

```text
site/
server/
scripts/
tests/
docs/
netlify.toml
package.json
README.md
```

按 **Commit changes**，提交到已連接 Netlify 的正式分支。

這版新增的 `server/` 與 `scripts/` 都必須上傳。只傳 `site/` 仍然沒有後端。

## 3. 等 Netlify 完成新的部署

進入原來的 Netlify 專案 → **Deploys**，等待最新 commit 顯示 **Published**。

檔案已配置：
- Base directory：repository 根目錄
- Build command：`node scripts/check-build.mjs`
- Publish directory：`site`
- Functions directory：`server/functions`
- Node：22
- 新版 Function 名稱：`atlas`
- 新版 API：`/api/atlas/*`

不要再加舊版 `/api/*` → `/.netlify/functions/*` 的轉址。
GitHub 中舊 `netlify/functions` 檔案即使還在，也不會被本版 Functions 設定選用。
本版 `site/_redirects` 是刻意保留的空規則檔，用來覆蓋可能殘留的舊 API rewrite。

原本 Netlify 的 `FINMIND_TOKEN` 可以保留，不需重辦，不要搬進 GitHub。
`TWELVE_DATA_API_KEY`、AI 金鑰是選用；未填也不應阻止台股頁開啟。

## 4. 先從新的更新入口進去

部署成功後，用瀏覽器開：

```text
https://spiffy-vacherin-6d2081.netlify.app/start.html
```

按 **更新程式並開啟**。

這個動作只移除同網址舊網站的 Service Worker 和 ATLAS 程式快取，不刪除交易、收藏、筆記，也不改 Netlify Token。

成功後應看到：
- 白色／紫色的「明日智選・產業地圖」新頁面，而不是綠黑色雷達首頁。
- 上方導覽有每日焦點、題材總覽、公司資料庫、供應鏈、財經創作者、熱力圖、行事曆、法說解析、處置股、選股、AI 分析、我的持股。
- 資料設定顯示後端版本 `9.0.0`。

iPhone 可使用同一網址；不要直接在附件預覽器裡使用正式網站。真正 iPhone/Safari 裝置仍需部署後驗收。

## 5. 不再靠一個「尚未連線」猜問題

網站 → **資料設定** → **重新檢查連線**。

這裡會分開列：
1. 後端 API 有沒有回應。
2. 台股行情實際取得幾檔、資料日期。
3. FinMind Token 有沒有設定。
4. 各公司日線、財務、籌碼取得的筆數或錯誤。

後端能回應，不代表行情來源一定成功；有 Token，也不代表有付費資料集權限。

需要單獨驗證時，新網址如下：

```text
https://spiffy-vacherin-6d2081.netlify.app/api/atlas/status
https://spiffy-vacherin-6d2081.netlify.app/api/atlas/quotes?market=TW
https://spiffy-vacherin-6d2081.netlify.app/api/atlas/history?market=TW&stock=2330
```

第一個應回 `version: "9.0.0"`、`apiReady: true`。
本版 `realtime: false`、`delayedIntraday: false` 是正確狀態；它是盤後資料版，不是 MIS 即時版，也沒有假裝成原站約延遲 15–20 分鐘的盤中服務。
**不要再用舊 `/api/status` 或 `/.netlify/functions/status` 判斷新版。**

## 資料來源與權限

### 先使用的台股資料
- TWSE／TPEx 官方 API：盤後量價、公司名錄、月營收、估值、重大訊息。
- FinMind：歷史日 K、個股三大法人、資券、財務等資料接口。
- API 版本、來源限流、網路或欄位變更，仍可能讓單項失敗；本次沒有完成你線上環境的全部外部來源驗收。
- 公司名錄是來源覆蓋；20 個題材／80 家分類起始索引則是可編輯的研究種子，不是原站完整分類庫，分類尚未逐筆查核。

### 不要誤以為免費 Token 包含全部
FinMind 官方文件標示：
- `TaiwanStockHoldingSharesPer`：Backer／Sponsor。
- `TaiwanStockDispositionSecuritiesPeriod`：Backer／Sponsor。
- `TaiwanStockActiveETFHolding`：Sponsor。

這些接口存在，不代表你的帳號取得了權限。本版會顯示失敗，不用合成數字替代。處置頁也不是處置門檻預測器。

海外行情需要 Twelve Data 金鑰與市場權限，並未完成美／日／韓資料方案驗收。
線上 AI 需要 `OPENAI_API_KEY`、`OPENAI_MODEL` 與 `ATLAS_ACCESS_TOKEN`；沒有設定時只提供明確標記為「非生成式 AI」的資料摘要。

## 研究工具怎麼用

題材總覽 → 選題材 → 供應鏈角色 → 點公司 → 八個公司頁籤。
有日 K 後，可用選股條件、日／週／月 K、KD／MACD／RSI／DMI 與回測。
法說解析是自己建立來源連結、頁碼與季度數字；不是自動搬運原站圖解。
行事曆支援手動事件與收藏公司股利日期的按需匯入；不是全市場法說資料庫。
我的持股從零開始，輸入真實成交後按幣別分開核算，不把美元和台幣直接相加。

## 可選的個人存取保護

你的公開 API 可能被其他人呼叫，消耗資料額度。
在 Netlify 設定 `ATLAS_ACCESS_TOKEN` 後重新部署，再在網站資料設定輸入「網站存取碼」。

這不是 FinMind Token；網站僅在當次開頁記憶體保留，不寫入 localStorage 或備份。
這是簡單的共享存取碼，不是會員帳號系統，也不是完整安全驗收。不要把它當正式多人金融服務。

## 尚未完整對等的範圍

請閱讀 `docs/FEATURE_MATRIX.md`。
原站的付費研究、完整題材與客戶關係資料庫、會員登入／訂閱、雲端同步、背景推播、庫存截圖 OCR、自動法說解析、完整處置法規引擎等，不包含在這次交付內。
