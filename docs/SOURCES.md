# 來源與查核紀錄

核對日期：2026-09-23。所有原始碼為獨立實作或延續本對話先前交付，不包含 AIStockMap 私有程式、品牌圖像、會員資料庫或授權創作者全文。

## 原站公開功能與延遲說明

- 官方 App Store 開發者介紹：https://apps.apple.com/tw/app/ai%E7%94%A2%E6%A5%AD%E5%9C%B0%E5%9C%96/id6772925636
  - 公開介紹稱台股盤中約延遲 15–20 分鐘，非即時行情。
  - 用於核對功能類型，不代表已查核它的實際系統延遲。
- 公開頁面的導覽：https://aistockmap.com/influencer/yutinghao/
- 公司頁籤範例：https://aistockmap.com/c/7014.JP/
- 服務條款與來源：https://aistockmap.com/terms/

未取得完整登入後 UI 與私人研究內容，故不宣稱逐像素或全部功能一致。

## 官方市場資料文件

- TWSE OpenAPI：https://openapi.twse.com.tw/
- TPEx OpenAPI：https://www.tpex.org.tw/openapi/
- 公開資訊觀測站：https://mops.twse.com.tw/
- FinMind 技術面：https://finmind.github.io/tutor/TaiwanMarket/Technical/
- FinMind 籌碼面：https://finmind.github.io/tutor/TaiwanMarket/Chip/
- FinMind 基本面：https://finmind.github.io/tutor/TaiwanMarket/Fundamental/
- FinMind 資料授權與免責：https://finmind.github.io/
- Twelve Data 文件：https://twelvedata.com/docs

程式內實際端點白名單見 `server/lib/data.mjs` 與 `server/lib/providers.mjs`。
MOPS 公司申報資料以交易所／櫃買 OpenAPI 發布的相應資料集為主，不假裝直接完成 MOPS 全站爬取。
FinMind 持股分級與處置資料為 Backer／Sponsor、主動式 ETF 持股為 Sponsor。其他集也可能有批次／時段／市場權限限制，依官方當期文件與使用者帳號為準。

## 部署與 AI

- Netlify Function config.path 與部署目錄：
  https://docs.netlify.com/build/functions/configuration/
- Netlify 環境變數：
  https://docs.netlify.com/build/functions/environment-variables/
- OpenAI Responses API：
  https://platform.openai.com/docs/api-reference/responses

## 本次查核的限制

本機容器無外部 DNS 連線；瀏覽器導航受到管理策略限制，因此使用 Playwright set_content 載入相同前端的單檔 bundle，加上完全獨立的測試資料。資料接口用 Node 請求 mock 與本機 HTTP 測試。
**沒有宣稱本次已在 TWSE／TPEx／FinMind／Twelve Data／線上 AI 完成真實來源端到端驗收。**
原站公開文字是功能參考，不是本版資料真實性或完整度保證。


## v10 - Yahoo Finance overseas adapter (checked 2026-09-24)

Official Yahoo sources:
- https://help.yahoo.com/kb/SLN2310.html - exchange suffixes, providers and delays.
- https://help.yahoo.com/kb/SLN2321.html - quote timestamp and real-time/delayed explanation.
- https://finance.yahoo.com/quote/7203.T/ - Tokyo listing format.
- https://finance.yahoo.com/quote/005930.KS/ - Korea listing format.
- https://legal.yahoo.com/tw/zh-hant/yahoo/terms/otos/index.html - applicable terms;
  review automated collection and redistribution restrictions and permissions.

Implementation uses the public chart route on query1.finance.yahoo.com,
not a documented paid API contract. No current official developer guarantee
for this chart route was established. Search-page metadata is not a successful
chart-API connectivity test. Live chart requests from this execution network
failed; no production Yahoo response is represented as validated.

Existing Twelve Data references above are historical v9 context only; it is
not used by the v10 overseas adapter.
