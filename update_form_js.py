import re

with open('form.js', 'r') as f:
    content = f.read()

# Replace the merchant detection logic
new_js = """
    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "check_merchant", mobile: mobile }),
      });
      const text = await res.text();
      const result = JSON.parse(text);
      
      const paymentBox = document.querySelector("#step-3-customer .payment-box");
      const submitBtn = document.getElementById("customer-submit-btn");

      if (result.success && result.isMerchant) {
        if (result.hasFreeQuota) {
          isRegisteredMerchant = true; // Use free bypass
          if (paymentBox) {
            paymentBox.innerHTML = `
              <div style="margin-bottom: 1rem;">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#16a34a" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <p class="payment-title" style="font-size: 1.25rem; margin-bottom: 0.5rem; color: #16a34a;">
                Registered Merchant Detected! 🎉
              </p>
              <p style="color: var(--text-muted); margin-bottom: 1rem;">
                Your mobile number <strong>+91 ${mobile}</strong> is registered as a partner.
                <br>The ₹50 service fee has been <strong>waived</strong> for you.
              </p>
              <div style="font-size: 2rem; font-weight: 700; color: #16a34a; margin-bottom: 1rem; text-decoration: line-through; opacity: 0.5;">₹50.00</div>
              <div style="font-size: 2rem; font-weight: 700; color: #16a34a;">FREE ✓</div>
              <p style="color: var(--primary); font-size: 0.9rem; margin-top: 0.5rem; font-weight: 600;">
                (Free requests remaining this month: ${result.remaining})
              </p>
              <div class="policy-box" style="margin-top: 1.5rem; padding: 1rem; background: rgba(22, 163, 74, 0.05); border: 1px solid rgba(22, 163, 74, 0.2); border-radius: 8px; text-align: left; font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;">
                <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <i class="ph ph-shield-check" style="color: #16a34a; font-size: 1.1rem; flex-shrink: 0; margin-top: 2px;"></i>
                    <strong style="color: var(--text);">Merchant Benefit Applied</strong>
                </div>
                As a valued partner, you can submit up to 5 free requests per month. No payment is required for this transaction.
              </div>
            `;
          }
          if (submitBtn) {
            submitBtn.innerHTML = "Submit Request";
          }
        } else {
          isRegisteredMerchant = false; // Must pay!
          if (paymentBox) {
            paymentBox.innerHTML = `
              <div style="margin-bottom: 1rem;">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#eab308" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <p class="payment-title" style="font-size: 1.25rem; margin-bottom: 0.5rem; color: #eab308;">
                Free Quota Reached
              </p>
              <p style="color: var(--text-muted); margin-bottom: 1rem;">
                Your mobile number <strong>+91 ${mobile}</strong> has used its 5 free requests for this month.
                <br>Please pay the standard ₹50 service fee to continue.
              </p>
              <div style="font-size: 2.5rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">
                ₹50.00
              </div>
              <p style="color: var(--text-muted); font-size: 0.85rem;">One-time platform service fee</p>
            `;
          }
          if (submitBtn) {
            submitBtn.innerHTML = "Pay ₹50 & Submit";
          }
        }
      } else {
        // Not a merchant, standard payment UI applies automatically (already in HTML)
        isRegisteredMerchant = false;
        // reset to default if they went back and changed mobile
        if (paymentBox) {
            paymentBox.innerHTML = `
              <div style="margin-bottom: 1rem;">
                  <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--primary)" stroke-width="2">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
              </div>
              <p class="payment-title">Platform Service Fee</p>
              <div style="font-size: 2.5rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">
                  ₹50.00
              </div>
              <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.5rem;">
                  One-time non-refundable fee for processing your request.
              </p>
              
              <div class="policy-box">
                  <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                      <i class="ph ph-shield-check" style="color: var(--primary); font-size: 1.1rem; flex-shrink: 0; margin-top: 2px;"></i>
                      <strong style="color: var(--text);">Secure Payment</strong>
                  </div>
                  Your payment is processed securely through Razorpay. Real Amount does not store your payment details.
              </div>
            `;
        }
        if (submitBtn) {
            submitBtn.innerHTML = "Pay ₹50 & Submit";
        }
      }
    } catch (err) {
      console.error("Merchant check failed:", err);
      isRegisteredMerchant = false;
    }
"""

content = re.sub(
    r"try \{\s*const res = await fetch\(APPS_SCRIPT_URL, \{.*?\}\);\s*const text = await res\.text\(\);\s*const result = JSON\.parse\(text\);\s*if \(result\.success && result\.isMerchant\) \{\s*isRegisteredMerchant = true;\s*\}\s*\} catch \(err\) \{\s*console\.error\(\"Merchant check failed:\", err\);\s*// Fall through to normal payment flow\s*\}\s*// Update step 3 UI based on merchant status\s*const paymentBox = document\.querySelector\(\"#step-3-customer .payment-box\"\);\s*const submitBtn = document\.getElementById\(\"customer-submit-btn\"\);\s*if \(isRegisteredMerchant && paymentBox && submitBtn\) \{.*?\}\s*\}",
    new_js.strip() + "\n  }",
    content,
    flags=re.DOTALL
)

with open('form.js', 'w') as f:
    f.write(content)
print("Updated form.js")
