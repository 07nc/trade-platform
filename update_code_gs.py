import re

with open('apps-script/Code.gs', 'r') as f:
    content = f.read()

# 1. Update check_merchant
new_check_merchant = """
    if (action === 'check_merchant') {
      const mobile = (data.mobile || '').trim();
      if (!mobile) return jsonResponse({ success: true, isMerchant: false });
      
      const isMerchant = isMerchantByMobile(mobile);
      if (isMerchant) {
        const usedCount = getFreeRequestsCount(mobile);
        const remaining = Math.max(0, 5 - usedCount);
        
        if (remaining > 0) {
            return jsonResponse({ success: true, isMerchant: true, hasFreeQuota: true, remaining: remaining });
        } else {
            return jsonResponse({ success: true, isMerchant: true, hasFreeQuota: false, remaining: 0 });
        }
      } else {
        return jsonResponse({ success: true, isMerchant: false });
      }
    }
"""
content = re.sub(
    r"if \(action === 'check_merchant'\) \{.*?\n\s+return jsonResponse\(\{ success: true, isMerchant: isMerchant \}\);\n\s+\}",
    new_check_merchant.strip(),
    content,
    flags=re.DOTALL
)

# 2. Update handleCustomerSubmission
new_handle_customer = """
  // ── Check if this is a free merchant submission ──
  let paymentStatus = 'Pending / Unverified';
  if (data.merchantBypass === true) {
    // Verify that the mobile is indeed a registered merchant
    const mobile = (data.customerMobile || '').trim();
    if (isMerchantByMobile(mobile)) {
      const usedCount = getFreeRequestsCount(mobile);
      if (usedCount < 5) {
        paymentStatus = 'Free — Registered Merchant';
      } else {
        return jsonResponse({ success: false, error: 'Merchant free quota (5/month) exceeded. Payment is required.' });
      }
    } else {
      return jsonResponse({ success: false, error: 'Merchant verification failed. Payment is required.' });
    }
  } else {
"""
content = re.sub(
    r"// ── Check if this is a free merchant submission ──\s*let paymentStatus = 'Pending / Unverified';\s*if \(data.merchantBypass === true\) \{.*?\} else \{.*?\}\n\s+\} else \{",
    new_handle_customer.strip() + " {",
    content,
    flags=re.DOTALL
)

# 3. Add getFreeRequestsCount at the end
free_requests_fn = """
// ════════════════════════════════════════════════════
// MERCHANT FREE REQUEST COUNT
// ════════════════════════════════════════════════════
function getFreeRequestsCount(mobile) {
  if (!mobile) return 0;
  const normalized = mobile.replace(/[\s\-+]/g, '').replace(/^91/, '');
  
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CUSTOMER_SHEET_NAME);
    if (!sheet || sheet.getLastRow() <= 1) return 0;
    
    const data = sheet.getDataRange().getValues();
    let count = 0;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const timestamp = row[0];
      const rowMobile = String(row[4] || '').replace(/[\s\-+]/g, '').replace(/^91/, '');
      const paymentStatus = String(row[11] || '');
      
      if (rowMobile === normalized && paymentStatus === 'Free — Registered Merchant') {
        if (timestamp instanceof Date) {
          if (timestamp.getMonth() === currentMonth && timestamp.getFullYear() === currentYear) {
            count++;
          }
        }
      }
    }
    return count;
  } catch (err) {
    console.error('getFreeRequestsCount error:', err.message);
    return 0;
  }
}
"""
content += "\n" + free_requests_fn

with open('apps-script/Code.gs', 'w') as f:
    f.write(content)
print("Updated Code.gs")
