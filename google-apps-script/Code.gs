const SPREADSHEET_ID = "1M-xhT0VU4v4pGe_jq993dHjQ5Ti8nR2iKl-gvhvFmmw";
const SHEET_NAME = "Sheet1";

function doGet(e) {
  const callback = sanitizeCallback_(e.parameter.callback);
  try {
    const data = parseGetPayload_(e.parameter);
    return javascriptResponse_(callback, saveSubstitution_(data));
  } catch (err) {
    console.error(err);
    return javascriptResponse_(callback, { success: false, message: "ข้อมูลไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง" });
  }
}

function parseGetPayload_(parameters) {
  if (parameters.payloadBase64) {
    const bytes = Utilities.base64DecodeWebSafe(parameters.payloadBase64);
    return JSON.parse(Utilities.newBlob(bytes).getDataAsString("UTF-8"));
  }
  return JSON.parse(parameters.payload || "{}");
}

function doPost(e) {
  try {
    return jsonResponse_(saveSubstitution_(JSON.parse(e.postData.contents)));
  } catch (err) {
    console.error(err);
    return jsonResponse_({ success: false, message: "ข้อมูลไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง" });
  }
}

function saveSubstitution_(data) {
  const validationError = validatePayload_(data);
  if (validationError) return { success: false, message: validationError };

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error("Sheet not found: " + SHEET_NAME);

    const conflicts = findConflicts_(sheet, data);
    if (conflicts.length && !data.allowConflicts) {
      return {
        success: false,
        code: "SUBSTITUTE_CONFLICT",
        conflicts: conflicts,
        message: "พบรายการที่อาจซ้ำ: " + conflicts.map(function (item) {
          return item.teacher + " ถูกจัดสอนแทนแล้วในคาบ " + item.period;
        }).join(", ")
      };
    }

    sendLineMessage_(createLineMessage_(data));
    sheet.appendRow([new Date(), JSON.stringify(data)]);
    return { success: true, message: "ส่งข้อมูลเรียบร้อยแล้ว" };
  } finally {
    lock.releaseLock();
  }
}

function findConflicts_(sheet, incoming) {
  const existingKeys = {};
  const lastRow = sheet.getLastRow();
  if (lastRow >= 1) {
    sheet.getRange(1, 2, lastRow, 1).getDisplayValues().forEach(function (row) {
      try {
        const saved = JSON.parse(row[0]);
        if (normalize_(saved.date) !== normalize_(incoming.date)) return;
        (saved.periods || []).forEach(function (period) {
          existingKeys[assignmentKey_(period)] = true;
        });
      } catch (err) {
        console.warn("Skipped invalid JSON row: " + err);
      }
    });
  }

  const seen = {};
  const conflicts = [];
  (incoming.periods || []).forEach(function (period) {
    const key = assignmentKey_(period);
    if (existingKeys[key] || seen[key]) {
      conflicts.push({ teacher: String(period.substituteTeacher).trim(), period: String(period.period).trim() });
    }
    seen[key] = true;
  });
  return conflicts;
}

function assignmentKey_(period) {
  return normalize_(period.period) + "|" + normalize_(period.substituteTeacher);
}

function normalize_(value) {
  return String(value || "").trim().toLowerCase();
}

function validatePayload_(data) {
  if (!data.date) return "กรุณาเลือกวันที่";
  if (!data.absentTeacher) return "กรุณาเลือกครูที่ไม่มาปฏิบัติราชการ";
  if (!Array.isArray(data.periods) || !data.periods.length) return "กรุณาเพิ่มคาบสอนแทน";
  for (let i = 0; i < data.periods.length; i += 1) {
    if (!data.periods[i].period || !data.periods[i].substituteTeacher) {
      return "กรุณาระบุคาบและครูสอนแทนให้ครบในรายการที่ " + (i + 1);
    }
  }
  return "";
}

function createLineMessage_(data) {
  let msg = "📚 แจ้งตารางสอนแทน\n━━━━━━━━━━━━━━\n\n";
  msg += "📅 วันที่ : " + (data.date || "-") + "\n";
  msg += "🙋 คุณครูที่ไม่มาปฏิบัติราชการ\n" + (data.absentTeacher || "-") + "\n\n━━━━━━━━━━━━━━\n";
  (data.periods || []).forEach(function (p, index) {
    msg += "\n🔹 รายการ " + (index + 1) + "\n\n";
    msg += "🕒 คาบ : " + (p.period || "-") + "\n";
    msg += "🏫 ระดับชั้น : " + (p.level || "-") + "\n";
    msg += "📖 วิชา : " + (p.subject || "-") + "\n";
    msg += "👨‍🏫 คุณครูสอนแทน\n" + (p.substituteTeacher || "-") + "\n━━━━━━━━━━━━━━\n";
  });
  return msg;
}

function sendLineMessage_(text) {
  const properties = PropertiesService.getScriptProperties();
  const token = properties.getProperty("LINE_CHANNEL_ACCESS_TOKEN");
  const groupId = properties.getProperty("LINE_GROUP_ID");
  if (!token || !groupId) throw new Error("Missing LINE Script Properties");

  const response = UrlFetchApp.fetch("https://api.line.me/v2/bot/message/push", {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + token },
    payload: JSON.stringify({ to: groupId, messages: [{ type: "text", text: String(text) }] }),
    muteHttpExceptions: true
  });
  if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) {
    throw new Error("LINE API " + response.getResponseCode() + ": " + response.getContentText());
  }
}

// Select testLineConnection in the Apps Script toolbar and click Run.
// A successful run sends one test message to the configured LINE group.
function testLineConnection() {
  sendLineMessage_("✅ ทดสอบการเชื่อมต่อระบบตารางสอนแทนสำเร็จ");
  console.log("LINE connection test passed");
}

function sanitizeCallback_(callback) {
  const value = String(callback || "callback");
  return /^[A-Za-z_$][0-9A-Za-z_$\.]*$/.test(value) ? value : "callback";
}

function javascriptResponse_(callback, result) {
  return ContentService.createTextOutput(callback + "(" + JSON.stringify(result) + ");")
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function jsonResponse_(result) {
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
