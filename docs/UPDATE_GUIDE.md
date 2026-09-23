# 明日智選 ATLAS v10｜Yahoo 海外行情更新

**程式已完成，但尚未替你修改 GitHub 或發布 Netlify。真實 Yahoo 連線需部署後驗證。**

## 這次改了什麼

- 美股、日股、韓股：改由 Yahoo Finance 圖表資料取得報價與歷史日 K，不再需要 Twelve Data 金鑰。
- 台股：保留 v9 的官方盤後與 FinMind 歷史資料。這不是 v7 MIS 即時版。
- 海外一批 5 檔，分批載入內建目錄與收藏，不再只抓前 5 檔。每次更新最多 60 檔。
- 報價時間顯示交易所時區，不把下載時間當成成交時間。
- 共用報價與日 K 快取，減少重複查詢。海外熱力圖使用成交量，不假造成交金額。
- 可用搜尋框按「從 Yahoo 查詢」，將目錄外的股票加入收藏。

## 1. 更新原網站

1. 先從原網站的「資料設定」匯出備份。本版沿用 v9 儲存名稱，不主動刪除收藏、交易或筆記。
2. 解壓縮 `Atlas_Map_Yahoo_v10.zip`。
3. GitHub → `Fusion-ATLAS-` → **Add file → Upload files**。
4. 上傳解壓後的全部內容，不是 ZIP 本身，不要多包一層資料夾。

最外層應直接看到：

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

5. **Commit changes**，等 Netlify 最新部署顯示 **Published**。
6. 保留原本 `FINMIND_TOKEN`。本版海外介面不需要新的 API Key，也不讀取 `TWELVE_DATA_API_KEY`。不要將 Token 放進 GitHub。

## 2. 從更新入口開啟

```text
https://spiffy-vacherin-6d2081.netlify.app/start.html
```

按 **更新程式並開啟**，再選上方「美股」、「日股」或「韓股」。
它只清除舊程式快取，不刪除個人紀錄。頁尾應顯示 `v10.0.0`。

來源有回應時，股價與日 K 會分批出現。每檔有足夠日 K 後，才能計算 MA、KD、MACD、RSI、DMI 與選股條件。
沒有資料時請開「資料設定」查看原因，不要重複新增 FinMind Token。

## 3. 代號怎麼填

| 市場 | 示例 | 本版規則 |
|---|---|---|
| 美股 | `AAPL`, `NVDA`, `BRK-B` | 先選 US；`BRK.B` 會轉為 `BRK-B` |
| 日股 | `7203.T`, `6758.T` | 先選 JP；`7203` 會補 `.T` |
| 韓股 KOSPI | `005930.KS`, `000660.KS` | 保留前導零 |
| 韓股 KOSDAQ | `247540.KQ` | 請明確填 `.KQ`；只填數字會預設 `.KS` |

代號範例只說明輸入方式，不是投資建議。目錄仍為 20 檔美股、4 檔日股、4 檔韓股的起始索引，不是全市場資料庫。

## 4. 檢查連線

```text
/api/atlas/status
/api/atlas/quotes?market=US&symbols=AAPL,NVDA
/api/atlas/quotes?market=JP&symbols=7203.T
/api/atlas/quotes?market=KR&symbols=005930.KS,000660.KS
/api/atlas/history?market=JP&stock=7203.T
/api/atlas/search?market=US&q=AAPL
```

以上路徑加在你的 Netlify 網址後方。若有設 `ATLAS_ACCESS_TOKEN`，請在網站資料設定填存取碼後測試，不要把密碼放網址。

`status` 的 `version` 應為 `10.0.0`，`overseasProvider` 為 `Yahoo Finance`。
**`overseasConfigured: true` 只代表介面已配置，不代表成功取得行情。**
請以 `quotes` 內容、實際成功筆數與時間判斷。不要再使用舊的 `/api/status`。

## 5. 更新頻率與正確性

本版使用 5 分鐘伺服器快取，不是 5 秒即時跳價。更新按鈕不會繞過快取或來源限制。
日 K 排除尚未完成的今日棒，不將盤中價冒充正式收盤訊號。當天收盤認定依來源時段加 30 分鐘緩衝；不明確就保守使用前一完成日。
價格與技術訊號因此可能不是同一個交易日。
Yahoo OHLC 與 `adjustedClose` 分開保存，未把調整收盤價混進原始開高低。回測不是含配息再投資的總報酬。

## 6. 失敗時不要一直重按

| 訊息 | 含義 |
|---|---|
| `YAHOO_ACCESS_DENIED` / 401 / 403 | Yahoo 拒絕存取；不是缺 Twelve Data 金鑰。本程式不繞過存取控制。 |
| `YAHOO_RATE_LIMIT` / 429 | 來源限流，程式暫停重試；請等待而非重複重整。 |
| `YAHOO_NETWORK` / `YAHOO_TIMEOUT` | 伺服器無法連到來源或逾時，不能單憑此認定是你設定錯誤。 |
| `YAHOO_SYMBOL_NOT_FOUND` | 代號不存在或來源未提供；檢查市場與後綴。 |

失敗時有舊資料就保留原時間並標示「舊快取」，沒有就顯示錯誤，不會補示範價。

## 7. 仍未完成的三項

1. **真實連線驗收**：本次環境無法連線 Yahoo 圖表端點；尚未在你的 Netlify 或 iPhone Safari 實機驗證。
2. **海外研究資料**：這次補報價、日 K 與搜尋，不包含完整美日韓財報、籌碼或全市場供應鏈分類。
3. **來源使用授權**：不是 Yahoo 正式保證提供的免費商業 API。自動擷取與資料轉傳需確認 Yahoo 及資料商條款與必要許可；「個人研究」不會自動免除這些要求。

## 測試紀錄

78 項 Node 程式測試與 46 項嵌入式瀏覽器測試通過。上游資料均為明確測試格式，不是真實行情連線成功證明。詳見 `docs/TEST_REPORT.md`。
