/**
 * Real Amount — Partner Onboarding
 * Google Apps Script Web App
 *
 * HOW TO DEPLOY:
 * 1. Go to script.google.com → New Project
 * 2. Paste this entire file into the editor
 * 3. Click "Deploy" → "New deployment"
 * 4. Type: Web App
 *    Execute as: Me
 *    Who has access: Anyone
 * 5. Click Deploy → copy the Web App URL
 * 6. Paste that URL into form.js → APPS_SCRIPT_URL
 */

// ── Config ──────────────────────────────────────────
// Paste your Google Sheet ID here.
// Get it from the Sheet URL:
// https://docs.google.com/spreadsheets/d/SHEET_ID_IS_HERE/edit

const SPREADSHEET_ID = '1bIO2okfM-wZNqWJtmQia2MyYv0BRPik6bLhESBC_DJI';

const SHEET_NAME   = 'Partner Submissions';
const FOLDER_NAME  = 'Real Amount — Visiting Cards';

// ── Column headers (must match order in appendRow) ──
const HEADERS = [
  'Timestamp',
  'Reference ID',
  'Email',
  'Business Name',
  'Workplace Address',
  'GST Number',
  'Contact Person',
  'Mobile Number',
  'Business Type',
  'Products / Services',
  'Brands Dealt In',
  'Visiting Card URL',
];

// ════════════════════════════════════════════════════
// POST handler — called when the form submits
// ════════════════════════════════════════════════════
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // ── Get / create sheet ──────────────────────────
    const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    let   sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    // Add header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length)
        .setFontWeight('bold')
        .setBackground('#1a3c5e')
        .setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }

    // ── Handle file upload ──────────────────────────
    let fileUrl = '';

    if (data.fileData && data.fileName) {
      const folders = DriveApp.getFoldersByName(FOLDER_NAME);
      const folder  = folders.hasNext()
        ? folders.next()
        : DriveApp.createFolder(FOLDER_NAME);

      const decoded  = Utilities.base64Decode(data.fileData);
      const mimeType = data.fileType || 'application/octet-stream';
      const blob     = Utilities.newBlob(decoded, mimeType, data.fileName);
      const file     = folder.createFile(blob);

      // Make the file viewable by anyone with the link
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      fileUrl = file.getUrl();
    }

    // ── Reference ID (generated on frontend, stored here)
    const referenceId = data.referenceId || getNextReferenceId(sheet);

    // ── Append data row ─────────────────────────────
    const row = [
      new Date(),
      referenceId,
      data.email            || '',
      data.businessName     || '',
      data.workplaceAddress || '',
      data.gstNumber        || '',
      data.contactPerson    || '',
      data.mobileNumber     || '',
      data.businessType     || '',
      Array.isArray(data.selectedItems)
        ? data.selectedItems.join(', ')
        : (data.selectedItems || ''),
      data.brands           || '',
      fileUrl,
    ];

    sheet.appendRow(row);

    // Auto-resize columns for readability (only first 50 rows to stay fast)
    sheet.autoResizeColumns(1, HEADERS.length);

    return jsonResponse({ success: true, referenceId: referenceId });

  } catch (err) {
    console.error('doPost error:', err.message);
    return jsonResponse({ success: false, error: err.message });
  }
}

// ── Sequential Reference ID ─────────────────────────
function getNextReferenceId(sheet) {
  const START   = 11110;
  const lastRow = sheet.getLastRow();

  // Empty sheet (no rows yet) or only header row
  if (lastRow <= 1) return 'REF' + START;

  // Read the Reference ID from the last data row (column 2)
  const lastId = sheet.getRange(lastRow, 2).getValue().toString().trim();

  if (lastId.startsWith('REF')) {
    const num = parseInt(lastId.replace('REF', ''), 10);
    if (!isNaN(num)) return 'REF' + (num + 1);
  }

  // Fallback: derive from row count
  return 'REF' + (START + lastRow - 1);
}

// ── Direct test — run this from the Apps Script editor ──
function testDoPost() {
  const fakeRequest = {
    postData: {
      contents: JSON.stringify({
        email:           'test@example.com',
        businessName:    'Test Business',
        workplaceAddress:'123 Test Street',
        gstNumber:       '',
        contactPerson:   'Test Person',
        mobileNumber:    '9876543210',
        businessType:    'Service Provider',
        selectedItems:   ['Electrician', 'Plumber'],
        brands:          '',
        referenceId:     'REF11115'
      })
    }
  };

  const result = doPost(fakeRequest);
  Logger.log('Response: ' + result.getContent());
}

// ── Health check (GET) ───────────────────────────────
function doGet() {
  return ContentService
    .createTextOutput('Real Amount Partner Form API is running.')
    .setMimeType(ContentService.MimeType.TEXT);
}

// ── Helper ───────────────────────────────────────────
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
