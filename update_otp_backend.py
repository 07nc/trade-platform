import re

with open('apps-script/Code.gs', 'r') as f:
    content = f.read()

# 1. Update isMerchantByMobile to return email as well
new_is_merchant = """
function isMerchantByMobile(mobile) {
  if (!mobile) return false;
  
  // Normalize: strip spaces, dashes, +91 prefix
  const normalized = mobile.replace(/[\s\-+]/g, '').replace(/^91/, '');
  
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(PARTNER_SHEET_NAME);
    if (!sheet || sheet.getLastRow() <= 1) return false;
    
    // Column 3 = Email, Column 8 = Mobile Number
    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 8).getValues();
    
    for (let i = 0; i < data.length; i++) {
      const cellValue = String(data[i][7]).replace(/[\s\-+]/g, '').replace(/^91/, '');
      if (cellValue === normalized) {
        return { isMerchant: true, email: String(data[i][2] || '') };
      }
    }
    
    return false;
  } catch (err) {
    console.error('Merchant check error:', err.message);
    return false;
  }
}
"""

content = re.sub(
    r"function isMerchantByMobile\(mobile\) \{.*?return false;\s*\}\s*\} catch \(err\) \{\s*console\.error\('Merchant check error:', err\.message\);\s*return false;\s*\}\s*\}",
    new_is_merchant.strip(),
    content,
    flags=re.DOTALL
)

# 2. Update check_merchant API endpoint
new_check_merchant = """
    if (action === 'check_merchant') {
      const mobile = (data.mobile || '').trim();
      if (!mobile) return jsonResponse({ success: true, isMerchant: false });
      
      const merchantData = isMerchantByMobile(mobile);
      if (merchantData && merchantData.isMerchant) {
        const usedCount = getFreeRequestsCount(mobile);
        const remaining = Math.max(0, 5 - usedCount);
        
        if (remaining > 0) {
            // GENERATE OTP and store in cache
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const cache = CacheService.getScriptCache();
            cache.put('otp_' + mobile, otp, 600); // 10 minutes
            
            // Mask email
            const email = merchantData.email.trim();
            let maskedEmail = "your registered email";
            if (email) {
                const parts = email.split('@');
                if (parts.length === 2) {
                    maskedEmail = parts[0].substring(0, 2) + '****@' + parts[1];
                }
                
                // Send email
                const subject = "Real Amount — Your Verification Code";
                const body = `Hello Partner,\n\nYour OTP for verifying your free request is: ${otp}\n\nThis code will expire in 10 minutes.\n\nThank you,\nReal Amount Team`;
                try {
                    MailApp.sendEmail(email, subject, body);
                } catch(e) {
                    console.error("Failed to send OTP", e);
                }
            }
            
            return jsonResponse({ success: true, isMerchant: true, hasFreeQuota: true, remaining: remaining, maskedEmail: maskedEmail });
        } else {
            return jsonResponse({ success: true, isMerchant: true, hasFreeQuota: false, remaining: 0 });
        }
      } else {
        return jsonResponse({ success: true, isMerchant: false });
      }
    }
"""

content = re.sub(
    r"if \(action === 'check_merchant'\) \{.*?\n\s*return jsonResponse\(\{ success: true, isMerchant: false \}\);\s*\}\s*\}",
    new_check_merchant.strip(),
    content,
    flags=re.DOTALL
)

# 3. Update handleCustomerSubmission for OTP verification
new_handle_customer = """
  // ── Check if this is a free merchant submission or free service ──
  let paymentStatus = 'Pending / Unverified';
  
  if (data.freeServiceBypass === true) {
    paymentStatus = 'Free — Service';
  } else if (data.merchantBypass === true) {
    // Verify that the mobile is indeed a registered merchant
    const mobile = (data.customerMobile || '').trim();
    if (isMerchantByMobile(mobile)) {
      const usedCount = getFreeRequestsCount(mobile);
      if (usedCount < 5) {
        // VERIFY OTP
        const cache = CacheService.getScriptCache();
        const storedOtp = cache.get('otp_' + mobile);
        if (!data.otp || String(data.otp) !== String(storedOtp)) {
            return jsonResponse({ success: false, error: 'Invalid or expired OTP. Please try again.' });
        }
        // OTP matched! Clear it.
        cache.remove('otp_' + mobile);
        
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
    r"// ── Check if this is a free merchant submission or free service ──.*?\}\n    \} else \{\n      return jsonResponse\(\{ success: false, error: 'Merchant verification failed\. Payment is required\.' \}\);\n    \}\n  \} else \{",
    new_handle_customer.strip() + " {",
    content,
    flags=re.DOTALL
)

with open('apps-script/Code.gs', 'w') as f:
    f.write(content)
print("Updated Code.gs for OTP")
