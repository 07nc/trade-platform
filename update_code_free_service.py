import re

with open('apps-script/Code.gs', 'r') as f:
    content = f.read()

new_logic = """
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
    r"// ── Check if this is a free merchant submission ──\s*let paymentStatus = 'Pending / Unverified';\s*if \(data.merchantBypass === true\) \{.*?\} else \{",
    new_logic.strip() + " {",
    content,
    flags=re.DOTALL
)

with open('apps-script/Code.gs', 'w') as f:
    f.write(content)
print("Updated Code.gs")
