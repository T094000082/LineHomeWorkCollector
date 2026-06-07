// ===== LINE 作業收集 Bot =====
// 平台：Google Apps Script
// 功能：接收 LINE 群組影片，依課程自動存入 Google Drive，並記錄到試算表

// 學號格式：4100E102 或 A130E113（支援兩種格式）
var STUDENT_ID_PATTERN = /[A-Z]?\d{3,4}[A-Z]\d{3}/g;

// LINE Webhook 進入點
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var events = body.events;

    for (var i = 0; i < events.length; i++) {
      handleEvent(events[i]);
    }
  } catch (err) {
    Logger.log('doPost 錯誤：' + err.message);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// 處理每一個事件
function handleEvent(event) {
  // 只處理群組訊息
  if (event.source.type !== 'group') return;

  var groupId   = event.source.groupId;
  var userId    = event.source.userId;
  var messageId = event.message ? event.message.id : null;
  var msgType   = event.message ? event.message.type : null;

  // 取得課程名稱
  var courseName = CONFIG.COURSE_MAP[groupId];
  if (!courseName) {
    Logger.log('未設定的群組 ID：' + groupId);
    return;
  }

  // 取得 LINE 顯示名稱
  var displayName = getDisplayName(userId, groupId);

  if (msgType === 'text') {
    // 文字訊息：嘗試解析學號，更新暫存
    var text = event.message.text.toUpperCase();
    var ids  = text.match(STUDENT_ID_PATTERN);
    if (ids && ids.length > 0) {
      saveUserStudentIds(userId, ids);
      Logger.log(displayName + ' 設定學號：' + ids.join(', '));
    }

  } else if (msgType === 'video') {
    // 影片訊息：下載並存入 Drive
    var studentIds = getUserStudentIds(userId);
    saveVideo(event.message.id, displayName, studentIds, courseName, groupId);
  }
}

// 下載影片並存入 Google Drive
function saveVideo(messageId, displayName, studentIds, courseName, groupId) {
  try {
    // 從 LINE 下載影片
    var url      = 'https://api-data.line.me/v2/bot/message/' + messageId + '/content';
    var response = UrlFetchApp.fetch(url, {
      headers: { 'Authorization': 'Bearer ' + CONFIG.LINE_CHANNEL_ACCESS_TOKEN }
    });

    var blob = response.getBlob();

    // 建立資料夾結構：根目錄 / 課程名稱
    var rootFolder   = DriveApp.getFolderById(CONFIG.ROOT_FOLDER_ID);
    var courseFolder = getOrCreateFolder(rootFolder, courseName);

    // 檔名：時間戳_顯示名稱_學號
    var timestamp  = Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyyMMdd_HHmmss');
    var idStr      = studentIds.length > 0 ? studentIds.join('_') : '未填學號';
    var fileName   = timestamp + '_' + displayName + '_' + idStr + '.mp4';

    blob.setName(fileName);
    var file = courseFolder.createFile(blob);

    Logger.log('影片已儲存：' + fileName);

    // 寫入試算表紀錄
    logToSheet(courseName, displayName, studentIds, fileName, file.getUrl(), new Date());

    // 回傳確認訊息給群組
    var confirmMsg = '✅ 已收到影片！\n'
      + '姓名：' + displayName + '\n'
      + '學號：' + idStr + '\n'
      + '課程：' + courseName + '\n'
      + '檔名：' + fileName;
    replyMessage(groupId, confirmMsg);

  } catch (err) {
    Logger.log('saveVideo 錯誤：' + err.message);
  }
}

// 寫入試算表
function logToSheet(courseName, displayName, studentIds, fileName, fileUrl, timestamp) {
  var ss    = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(courseName);

  // 若該課程工作表不存在則新建
  if (!sheet) {
    sheet = ss.insertSheet(courseName);
    sheet.appendRow(['繳交時間', 'LINE 名稱', '學號', '檔名', 'Drive 連結']);
    sheet.setFrozenRows(1);
  }

  var idStr = studentIds.length > 0 ? studentIds.join(', ') : '未填學號';
  sheet.appendRow([
    Utilities.formatDate(timestamp, 'Asia/Taipei', 'yyyy-MM-dd HH:mm:ss'),
    displayName,
    idStr,
    fileName,
    fileUrl
  ]);
}

// 取得或建立資料夾
function getOrCreateFolder(parent, name) {
  var folders = parent.getFoldersByName(name);
  if (folders.hasNext()) return folders.next();
  return parent.createFolder(name);
}

// 取得 LINE 使用者顯示名稱
function getDisplayName(userId, groupId) {
  try {
    var url      = 'https://api.line.me/v2/bot/group/' + groupId + '/member/' + userId;
    var response = UrlFetchApp.fetch(url, {
      headers: { 'Authorization': 'Bearer ' + CONFIG.LINE_CHANNEL_ACCESS_TOKEN }
    });
    var profile = JSON.parse(response.getContentText());
    return profile.displayName || userId;
  } catch (err) {
    return userId;
  }
}

// ===== 學號暫存（使用 PropertiesService）=====
// 學生先傳學號文字，Bot 記住，下一則影片自動對應

function saveUserStudentIds(userId, ids) {
  PropertiesService.getScriptProperties().setProperty('ids_' + userId, ids.join(','));
}

function getUserStudentIds(userId) {
  var val = PropertiesService.getScriptProperties().getProperty('ids_' + userId);
  return val ? val.split(',') : [];
}

// 推播訊息到群組
function replyMessage(groupId, text) {
  var url     = 'https://api.line.me/v2/bot/message/push';
  var payload = {
    to: groupId,
    messages: [{ type: 'text', text: text }]
  };
  UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Authorization': 'Bearer ' + CONFIG.LINE_CHANNEL_ACCESS_TOKEN },
    payload: JSON.stringify(payload)
  });
}
