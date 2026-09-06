/**
 * Real Amount — Partner & Customer Onboarding
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
 *
 * NOTE: After updating the script, you MUST create a NEW deployment
 * (not re-deploy the existing one) for changes to take effect.
 */

// ── Config ──────────────────────────────────────────
// Paste your Google Sheet ID here.
// Get it from the Sheet URL:
// https://docs.google.com/spreadsheets/d/SHEET_ID_IS_HERE/edit

const SPREADSHEET_ID = "1bIO2okfM-wZNqWJtmQia2MyYv0BRPik6bLhESBC_DJI";

const PARTNER_SHEET_NAME = "Partner Submissions";
const CUSTOMER_SHEET_NAME = "Customer Submissions";
const FOLDER_NAME = "Real Amount — Uploads";
const NOTIFICATION_EMAIL = "realamountofficial@gmail.com";
const QUOTE_SHEET_NAME = "Quotes";
const ADMIN_PASSWORD = "Realamount@123";

// ── Column headers ──────────────────────────────────
const PARTNER_HEADERS = [
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
  'Offer Price',
  'Description',
  'Product / Service Image URL',
];

const CUSTOMER_HEADERS = [
  'Timestamp',
  'Reference ID',
  'Account Type',
  'Customer Name',
  'Mobile Number',
  'Address',
  'Service Requested',
  'Items / Category',
  'Brands (if any)',
  'Razorpay Payment ID',
  'Razorpay Order ID',
  'Payment Status',
  'Description',
  'Offer Price',
  'Product / Service Image URL',
];

const QUOTE_HEADERS = [
  'Timestamp',
  'Quote ID',
  'Status',
  'Customer Name',
  'Mobile Number',
  'Address',
  'Service Requested',
  'Items / Category',
  'Brands (if any)',
  'Description',
  'Price Offered',
  'Razorpay Payment ID',
  'Razorpay Order ID',
  'Payment Status',
];

// ════════════════════════════════════════════════════
// POST handler — called when the form submits
// ════════════════════════════════════════════════════
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === 'create_razorpay_order') {
      const order = createRazorpayOrder(50); // Rs 50/- lead fee
      return jsonResponse({ success: true, order: order });
    }

    if (action === 'create_quote') {
      return handleCreateQuote(data);
    }

    if (action === 'get_quote') {
      if (!data.quoteId) return jsonResponse({ success: false, error: 'Missing quote ID' });
      return handleGetQuote(data.quoteId);
    }

    if (action === 'pay_quote') {
      return handlePayQuote(data);
    }

    const accountType = (data.accountType || '').trim();

    if (accountType === "Customer") {
      return handleCustomerSubmission(data);
    } else {
      return handlePartnerSubmission(data);
    }
  } catch (err) {
    console.error("doPost error:", err.message);
    return jsonResponse({ success: false, error: err.message });
  }
}

// ════════════════════════════════════════════════════
// PARTNER submission handler
// ════════════════════════════════════════════════════
function handlePartnerSubmission(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(PARTNER_SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(PARTNER_SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    appendHeaderRow(sheet, PARTNER_HEADERS);
  }

  const referenceId = data.referenceId || getNextReferenceId(sheet);

  // ── Handle file upload ──────────────────────────
  let fileUrl = "";
  if (data.fileData && data.fileName) {
    fileUrl = uploadFileToDrive(data, "partner_" + referenceId);
  }

  const row = [
    new Date(),
    referenceId,
    data.email || "",
    data.businessName || "",
    data.workplaceAddress || "",
    data.gstNumber || "",
    data.contactPerson || "",
    data.mobileNumber || "",
    data.businessType || "",
    Array.isArray(data.selectedItems)
      ? data.selectedItems.join(', ')
      : (data.selectedItems || ''),
    data.brands               || '',
    data.offerPrice           || '',
    data.description          || '',
    fileUrl,
  ];

  sheet.appendRow(row);
  sheet.autoResizeColumns(1, PARTNER_HEADERS.length);

  // Send email notification
  sendNotificationEmail('Partner', referenceId, {
    'Business Name': data.businessName || '—',
    'Contact Person': data.contactPerson || '—',
    'Mobile': data.mobileNumber || '—',
    'Email': data.email || '—',
    'Business Type': data.businessType || '—',
    'Products/Services': Array.isArray(data.selectedItems) ? data.selectedItems.join(', ') : (data.selectedItems || '—'),
    'Brands': data.brands || '—',
    'Description': data.description || '—',
    'Address': data.workplaceAddress || '—',
  });

  return jsonResponse({ success: true, referenceId: referenceId });
}

// ════════════════════════════════════════════════════
// CUSTOMER submission handler
// ════════════════════════════════════════════════════
function handleCustomerSubmission(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(CUSTOMER_SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(CUSTOMER_SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    appendHeaderRow(sheet, CUSTOMER_HEADERS);
  }

  // ── Verify Razorpay Payment Signature ───────────
  const scriptProperties = PropertiesService.getScriptProperties();
  const keySecret = (scriptProperties.getProperty('RAZORPAY_KEY_SECRET') || 'bbffW0UBFifbhIUKJMcUZiyx').trim();
  
  let paymentStatus = 'Pending / Unverified';
  if (data.razorpayPaymentId && data.razorpayOrderId && data.razorpaySignature) {
    if (keySecret) {
      const isValid = verifyRazorpaySignature(
        data.razorpayOrderId,
        data.razorpayPaymentId,
        data.razorpaySignature,
        keySecret
      );
      paymentStatus = isValid ? 'Paid' : 'Signature Verification Failed';
    } else {
      // If key secret is not set in script properties, accept signature for test
      paymentStatus = 'Paid (Unverified - Key Secret Not Set)';
    }
  }

  const referenceId = data.referenceId || getNextReferenceId(sheet);

  // ── Handle file upload ──────────────────────────
  let fileUrl = "";
  if (data.fileData && data.fileName) {
    fileUrl = uploadFileToDrive(data, "customer_" + referenceId);
  }

  const row = [
    new Date(),
    referenceId,
    "Customer",
    data.customerName || "",
    data.customerMobile || "",
    data.customerAddress || "",
    data.customerService || "",
    Array.isArray(data.selectedItems)
      ? data.selectedItems.join(', ')
      : (data.selectedItems || ''),
    data.brands               || '',
    data.razorpayPaymentId    || '',
    data.razorpayOrderId      || '',
    paymentStatus,
    data.description          || '',
    data.offerPrice           || '',
    fileUrl,
  ];

  sheet.appendRow(row);
  sheet.autoResizeColumns(1, CUSTOMER_HEADERS.length);

  // Send email notification
  sendNotificationEmail('Customer', referenceId, {
    'Name': data.customerName || '—',
    'Mobile': data.customerMobile || '—',
    'Address': data.customerAddress || '—',
    'Service': data.customerService || '—',
    'Items': Array.isArray(data.selectedItems) ? data.selectedItems.join(', ') : (data.selectedItems || '—'),
    'Brands': data.brands || '—',
    'Description': data.description || '—',
    'Price Offered': data.offerPrice || '—',
    'Payment ID': data.razorpayPaymentId || '—',
    'Payment Status': paymentStatus,
  });

  return jsonResponse({ success: true, referenceId: referenceId });
}

// ════════════════════════════════════════════════════
// EMAIL NOTIFICATION
// ════════════════════════════════════════════════════
function sendNotificationEmail(type, referenceId, details) {
  try {
    const detailRows = Object.entries(details)
      .map(([key, val]) => `<tr><td style="padding:8px 12px;font-weight:600;color:#1a3c5e;border-bottom:1px solid #eee;">${key}</td><td style="padding:8px 12px;color:#333;border-bottom:1px solid #eee;">${val}</td></tr>`)
      .join('');

    const html = `
      <div style="font-family:'Inter',Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#1a3c5e;padding:20px;border-radius:12px 12px 0 0;text-align:center;">
          <h1 style="color:#c9a84c;margin:0;font-size:22px;">Real Amount</h1>
          <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:14px;">New ${type} Registration</p>
        </div>
        <div style="background:#fff;padding:24px;border:1px solid #e5e5e5;border-top:none;">
          <p style="color:#1a3c5e;font-size:16px;margin-top:0;">A new <strong>${type}</strong> just registered on the platform.</p>
          <p style="background:#f0f7ff;padding:10px 14px;border-radius:8px;font-size:14px;color:#1a3c5e;">Reference ID: <strong>${referenceId}</strong></p>
          <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:14px;">
            ${detailRows}
          </table>
        </div>
        <div style="background:#f9f9f9;padding:14px;border-radius:0 0 12px 12px;border:1px solid #e5e5e5;border-top:none;text-align:center;">
          <p style="color:#999;font-size:12px;margin:0;">This is an automated notification from Real Amount</p>
        </div>
      </div>
    `;

    MailApp.sendEmail({
      to: NOTIFICATION_EMAIL,
      subject: `🔔 New ${type} Registration — ${referenceId}`,
      htmlBody: html,
    });
  } catch (err) {
    console.error('Email notification failed:', err.message);
    // Don't throw — email failure should not block the submission
  }
}

// ════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════

function appendHeaderRow(sheet, headers) {
  sheet.appendRow(headers);
  sheet
    .getRange(1, 1, 1, headers.length)
    .setFontWeight("bold")
    .setBackground("#1a3c5e")
    .setFontColor("#ffffff");
  sheet.setFrozenRows(1);
}

function uploadFileToDrive(data, prefix) {
  try {
    const folders = DriveApp.getFoldersByName(FOLDER_NAME);
    const folder = folders.hasNext()
      ? folders.next()
      : DriveApp.createFolder(FOLDER_NAME);

    const decoded = Utilities.base64Decode(data.fileData);
    const mimeType = data.fileType || "application/octet-stream";
    const safeName = (prefix + "_" + data.fileName).replace(
      /[^a-zA-Z0-9._\-]/g,
      "_",
    );
    const blob = Utilities.newBlob(decoded, mimeType, safeName);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (err) {
    console.error("File upload error:", err.message);
    return "";
  }
}

function getNextReferenceId(sheet) {
  const START = 11110;
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) return "REF" + START;

  const lastId = sheet.getRange(lastRow, 2).getValue().toString().trim();

  if (lastId.startsWith("REF")) {
    const num = parseInt(lastId.replace("REF", ""), 10);
    if (!isNaN(num)) return "REF" + (num + 1);
  }

  return "REF" + (START + lastRow - 1);
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

// ── Health check (GET) + Quote fetch ────────────────
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || '';

  if (action === 'get_quote') {
    const quoteId = (e.parameter.id || '').trim();
    if (!quoteId) return jsonResponse({ success: false, error: 'Missing quote ID' });
    return handleGetQuote(quoteId);
  }

  return ContentService.createTextOutput(
    "Real Amount Form API is running. Partner + Customer flows active.",
  ).setMimeType(ContentService.MimeType.TEXT);
}

// ── Razorpay Helpers ─────────────────────────────────
function createRazorpayOrder(amountRupees) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const keyId = (scriptProperties.getProperty('RAZORPAY_KEY_ID') || 'rzp_live_T8Alm8tnAkFQzi').trim();
  const keySecret = (scriptProperties.getProperty('RAZORPAY_KEY_SECRET') || 'bbffW0UBFifbhIUKJMcUZiyx').trim();
  
  const payload = {
    amount: amountRupees * 100, // Razorpay expects amount in paise
    currency: 'INR',
    receipt: 'rcpt_' + Math.random().toString(36).substring(2, 15)
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Basic ' + Utilities.base64Encode(keyId + ':' + keySecret)
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch('https://api.razorpay.com/v1/orders', options);
  const responseText = response.getContentText();
  const responseCode = response.getResponseCode();
  
  if (responseCode !== 200 && responseCode !== 201) {
    throw new Error('Razorpay Order Creation Failed: ' + responseText);
  }
  
  const orderData = JSON.parse(responseText);
  orderData.key = keyId; // Inject key ID for frontend
  return orderData;
}

function verifyRazorpaySignature(orderId, paymentId, signature, secretKey) {
  const message = orderId + '|' + paymentId;
  const signatureBytes = Utilities.computeHmacSignature(
    Utilities.MacAlgorithm.HMAC_SHA_256,
    message,
    secretKey
  );
  
  // Convert signature bytes to hex
  let hexSignature = signatureBytes.map(function(byte) {
    let hex = (byte & 0xFF).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');

  return hexSignature === signature;
}

// ════════════════════════════════════════════════════
// QUOTE HANDLERS
// ════════════════════════════════════════════════════

function handleCreateQuote(data) {
  // Verify admin password
  if (data.password !== ADMIN_PASSWORD) {
    return jsonResponse({ success: false, error: 'Invalid password' });
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(QUOTE_SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(QUOTE_SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    appendHeaderRow(sheet, QUOTE_HEADERS);
  }

  const quoteId = getNextQuoteId(sheet);

  const row = [
    new Date(),
    quoteId,
    'Unpaid',
    data.customerName || '',
    data.customerMobile || '',
    data.customerAddress || '',
    data.customerService || '',
    Array.isArray(data.selectedItems)
      ? data.selectedItems.join(', ')
      : (data.selectedItems || ''),
    data.brands || '',
    data.description || '',
    data.offerPrice || '',
    '', // Razorpay Payment ID (empty until paid)
    '', // Razorpay Order ID
    'Pending',
  ];

  sheet.appendRow(row);
  sheet.autoResizeColumns(1, QUOTE_HEADERS.length);

  // Send notification
  sendNotificationEmail('Quote Created', quoteId, {
    'Customer Name': data.customerName || '—',
    'Mobile': data.customerMobile || '—',
    'Address': data.customerAddress || '—',
    'Service': data.customerService || '—',
    'Items': Array.isArray(data.selectedItems) ? data.selectedItems.join(', ') : (data.selectedItems || '—'),
    'Brands': data.brands || '—',
    'Description': data.description || '—',
    'Price Offered': data.offerPrice || '—',
    'Status': 'Awaiting Payment',
  });

  return jsonResponse({ success: true, quoteId: quoteId });
}

function handleGetQuote(quoteId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(QUOTE_SHEET_NAME);

  if (!sheet || sheet.getLastRow() <= 1) {
    return jsonResponse({ success: false, error: 'Quote not found' });
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === quoteId) {
      const quote = {};
      for (let j = 0; j < headers.length; j++) {
        quote[headers[j]] = data[i][j];
      }
      return jsonResponse({ success: true, quote: quote });
    }
  }

  return jsonResponse({ success: false, error: 'Quote not found' });
}

function handlePayQuote(data) {
  const quoteId = (data.quoteId || '').trim();
  if (!quoteId) return jsonResponse({ success: false, error: 'Missing quote ID' });

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(QUOTE_SHEET_NAME);

  if (!sheet || sheet.getLastRow() <= 1) {
    return jsonResponse({ success: false, error: 'Quote not found' });
  }

  const allData = sheet.getDataRange().getValues();
  let quoteRowIndex = -1;

  for (let i = 1; i < allData.length; i++) {
    if (allData[i][1] === quoteId) {
      quoteRowIndex = i + 1; // 1-indexed for sheet
      break;
    }
  }

  if (quoteRowIndex === -1) {
    return jsonResponse({ success: false, error: 'Quote not found' });
  }

  // Check if already paid
  const currentStatus = sheet.getRange(quoteRowIndex, 3).getValue();
  if (currentStatus === 'Paid') {
    return jsonResponse({ success: false, error: 'Quote already paid' });
  }

  // Verify Razorpay signature
  const scriptProperties = PropertiesService.getScriptProperties();
  const keySecret = (scriptProperties.getProperty('RAZORPAY_KEY_SECRET') || 'bbffW0UBFifbhIUKJMcUZiyx').trim();

  let paymentStatus = 'Pending / Unverified';
  if (data.razorpayPaymentId && data.razorpayOrderId && data.razorpaySignature) {
    if (keySecret) {
      const isValid = verifyRazorpaySignature(
        data.razorpayOrderId,
        data.razorpayPaymentId,
        data.razorpaySignature,
        keySecret
      );
      paymentStatus = isValid ? 'Paid' : 'Signature Verification Failed';
    } else {
      paymentStatus = 'Paid (Unverified - Key Secret Not Set)';
    }
  }

  // Update the quote row
  sheet.getRange(quoteRowIndex, 3).setValue('Paid'); // Status
  sheet.getRange(quoteRowIndex, 12).setValue(data.razorpayPaymentId || ''); // Payment ID
  sheet.getRange(quoteRowIndex, 13).setValue(data.razorpayOrderId || ''); // Order ID
  sheet.getRange(quoteRowIndex, 14).setValue(paymentStatus); // Payment Status

  // Copy to Customer Submissions sheet
  const quoteRow = sheet.getRange(quoteRowIndex, 1, 1, QUOTE_HEADERS.length).getValues()[0];
  const custData = {
    accountType: 'Customer',
    customerName: quoteRow[3],
    customerMobile: quoteRow[4],
    customerAddress: quoteRow[5],
    customerService: quoteRow[6],
    selectedItems: quoteRow[7],
    brands: quoteRow[8],
    description: quoteRow[9],
    offerPrice: quoteRow[10],
    razorpayPaymentId: data.razorpayPaymentId || '',
    razorpayOrderId: data.razorpayOrderId || '',
    razorpaySignature: data.razorpaySignature || '',
  };
  handleCustomerSubmission(custData);

  return jsonResponse({ success: true, quoteId: quoteId, paymentStatus: paymentStatus });
}

function getNextQuoteId(sheet) {
  const START = 10001;
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) return 'QT' + START;

  const lastId = sheet.getRange(lastRow, 2).getValue().toString().trim();

  if (lastId.startsWith('QT')) {
    const num = parseInt(lastId.replace('QT', ''), 10);
    if (!isNaN(num)) return 'QT' + (num + 1);
  }

  return 'QT' + (START + lastRow - 1);
}

// ════════════════════════════════════════════════════
// TEST FUNCTIONS — run from Apps Script editor
// ════════════════════════════════════════════════════

/** Test a Partner submission */
function testPartnerSubmission() {
  const fakeRequest = {
    postData: {
      contents: JSON.stringify({
        accountType: "Partner",
        email: "partner@example.com",
        businessName: "Test Electronics",
        workplaceAddress: "123 Market Street, Ludhiana",
        gstNumber: "03ABCDE1234F1Z5",
        contactPerson: "Rajesh Kumar",
        mobileNumber: "9876543210",
        businessType: "Product Sale (Retail)",
        selectedItems: ["Air Conditioner", "LED Tv", "Refrigerator"],
        brands: "Samsung, LG",
        referenceId: "REF11115",
      }),
    },
  };

  const result = doPost(fakeRequest);
  Logger.log("Partner Response: " + result.getContent());
}

/** Test a Customer submission */
function testCustomerSubmission() {
  const fakeRequest = {
    postData: {
      contents: JSON.stringify({
        accountType: "Customer",
        customerName: "Priya Sharma",
        customerMobile: "9988776655",
        customerAddress: "45 Rose Garden, Jalandhar",
        customerService: "Service/Repair",
        selectedItems: ["Ac Service/Repair", "Mobile Repair"],
        brands: "",
        referenceId: "REF11116",
      }),
    },
  };

  const result = doPost(fakeRequest);
  Logger.log("Customer Response: " + result.getContent());
}
