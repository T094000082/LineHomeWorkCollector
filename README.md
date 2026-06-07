# LINE 作業收集 Bot

學生在 LINE 群組上傳影片，Bot 自動依課程存入 Google Drive 並記錄到試算表。

---

## 部署步驟

### 1. 建立 LINE Bot
1. 前往 [LINE Developers](https://developers.line.biz/)
2. 建立 Provider → 建立 Messaging API Channel
3. 取得 **Channel Access Token**（長期）
4. 關閉 Auto-reply messages

### 2. 建立 Google Drive 資料夾
1. 在 Google Drive 建立資料夾，例如「作業收集」
2. 開啟資料夾，從網址列取得資料夾 ID
   - 網址格式：`https://drive.google.com/drive/folders/【這裡是ID】`

### 3. 建立 Google 試算表
1. 建立新的 Google 試算表
2. 從網址列取得試算表 ID
   - 網址格式：`https://docs.google.com/spreadsheets/d/【這裡是ID】/edit`

### 4. 部署 Google Apps Script
1. 前往 [Google Apps Script](https://script.google.com/)
2. 建立新專案，名稱例如「LineHomeWorkCollector」
3. 將 `config.gs` 和 `Code.gs` 的內容分別貼入對應檔案
4. 填入 `config.gs` 中的三個設定值：
   - `LINE_CHANNEL_ACCESS_TOKEN`
   - `ROOT_FOLDER_ID`
   - `SPREADSHEET_ID`
5. 部署 → 新增部署作業 → 類型選「網頁應用程式」
   - 執行身分：我（你的 Google 帳號）
   - 存取權：所有人
6. 複製部署後的網址（Webhook URL）

### 5. 設定 LINE Webhook
1. 回到 LINE Developers 後台
2. Messaging API → Webhook URL 貼上步驟 4 的網址
3. 開啟「Use webhook」

### 6. 取得群組 ID
1. 將 Bot 加入 LINE 課程群組
2. 群組內任意傳一則訊息
3. 到 Apps Script → 執行記錄 查看 `groupId`
4. 將 groupId 填入 `config.gs` 的 `COURSE_MAP`

---

## 學生使用方式

1. **先傳學號**（每學期傳一次即可）
   ```
   4100E102
   ```
   若為組別作業（多人）：
   ```
   4100E102 A130E113
   ```
2. **再上傳影片**

Bot 會自動回覆確認訊息，並將影片存入對應課程資料夾。

---

## 試算表紀錄格式

每個課程一個工作表，欄位如下：

| 繳交時間 | LINE 名稱 | 學號 | 檔名 | Drive 連結 |
|---------|----------|------|------|-----------|

---

## 注意事項

- LINE 影片上傳後僅 **24 小時**內可透過 API 下載，Bot 需即時處理
- Google Apps Script 免費版單次執行上限 6 分鐘，一般影片大小不受影響
- 學號暫存於 Script Properties，學生重新傳學號即可更新

---

## 工作交接（2026-06-07）

### 已完成
- `Code.gs`：主程式，處理 LINE Webhook、下載影片、存 Drive、寫試算表
- `config.gs`：設定檔範本，三個設定值待填入
- `README.md`：完整部署說明

### 尚未完成（請繼續）

1. **Google Apps Script 部署**
   - 開啟 https://script.google.com
   - 建立新專案「LineHomeWorkCollector」
   - 建立 `Code.gs` 和 `config.gs`，內容從此 Repo 複製貼上
   - 填入 `config.gs` 的三個設定值：
     - `LINE_CHANNEL_ACCESS_TOKEN`：從 LINE Developers 後台取得
     - `ROOT_FOLDER_ID`：Google Drive 作業收集資料夾 ID
     - `SPREADSHEET_ID`：記錄試算表 ID

2. **部署為網頁應用程式**
   - 執行身分：使用者自己的 Google 帳號
   - 存取權：所有人
   - 複製 Webhook URL 貼到 LINE Developers 後台

3. **取得各課程群組 ID 填入 COURSE_MAP**
   - Bot 加入群組後群組內傳訊息
   - 從 Apps Script 執行記錄取得 groupId
   - 填入 `config.gs` 的 `COURSE_MAP`

### 學號格式
- `4100E102`（數字開頭）
- `A130E113`（字母開頭）
- 組別作業：多個學號以空格分隔
