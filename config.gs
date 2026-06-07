// ===== 設定檔 =====
// 每次新增課程，在 COURSE_MAP 加入一筆即可

var CONFIG = {

  // LINE Bot Channel Access Token（從 LINE Developers 後台取得）
  LINE_CHANNEL_ACCESS_TOKEN: 'YOUR_LINE_CHANNEL_ACCESS_TOKEN',

  // Google Drive 根資料夾 ID（在 Drive 建立一個「作業收集」資料夾，取其 ID）
  ROOT_FOLDER_ID: 'YOUR_ROOT_FOLDER_ID',

  // Google 試算表 ID（建立一張試算表用來記錄繳交紀錄，取其 ID）
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID',

  // LINE 群組 ID 對應課程名稱
  // 取得群組 ID 方法：部署後將 Bot 加入群組，傳任意訊息，
  // 查看 Apps Script 執行記錄即可看到 groupId
  COURSE_MAP: {
    'C1xxxxxxxxxxxxxxxxxxxxxxxxx': '工業控制實習',
    'C2xxxxxxxxxxxxxxxxxxxxxxxxx': '自動化程式設計',
    // 依此類推新增課程
  }
};
