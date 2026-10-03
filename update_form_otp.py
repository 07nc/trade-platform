import re

with open('form.js', 'r') as f:
    content = f.read()

# Replace the success UI with OTP input
new_ui = """
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
              
              <!-- OTP Box -->
              <div class="form-group" style="margin-top: 1.5rem; background: #fff; padding: 1rem; border-radius: 8px; border: 1px solid rgba(22, 163, 74, 0.3);">
                  <label for="merchantOtp" style="color: #16a34a; font-weight: 600; text-align: center; display: block; margin-bottom: 0.5rem;">
                    Enter OTP sent to ${result.maskedEmail || 'your email'} <span class="asterisk">*</span>
                  </label>
                  <input type="text" id="merchantOtp" name="merchantOtp" placeholder="6-digit OTP" maxlength="6" style="text-align: center; letter-spacing: 0.3em; font-size: 1.5rem; font-weight: bold; width: 100%; max-width: 200px; margin: 0 auto; display: block; border: 2px solid #16a34a; border-radius: 6px;" />
                  <span class="field-error hidden" id="merchantOtp-error" style="text-align: center; margin-top: 0.5rem;"></span>
              </div>
              
              <div style="font-size: 1.5rem; font-weight: 700; color: #16a34a; margin-top: 1rem; text-decoration: line-through; opacity: 0.5;">₹50.00</div>
              <div style="font-size: 1.5rem; font-weight: 700; color: #16a34a;">FREE ✓</div>
              <p style="color: var(--primary); font-size: 0.9rem; margin-top: 0.5rem; font-weight: 600;">
                (Free requests remaining this month: ${result.remaining})
              </p>
"""

content = re.sub(
    r"<div style=\"margin-bottom: 1rem;\">\s*<svg viewBox=\"0 0 24 24\" width=\"48\" height=\"48\" fill=\"none\" stroke=\"#16a34a\" stroke-width=\"2\">\s*<path d=\"M22 11\.08V12a10 10 0 1 1-5\.93-9\.14\"/>\s*<polyline points=\"22 4 12 14\.01 9 11\.01\"/>\s*</svg>\s*</div>\s*<p class=\"payment-title\" style=\"font-size: 1\.25rem; margin-bottom: 0\.5rem; color: #16a34a;\">\s*Registered Merchant Detected! 🎉\s*</p>\s*<p style=\"color: var\(--text-muted\); margin-bottom: 1rem;\">\s*Your mobile number <strong>\+91 \$\{mobile\}</strong> is registered as a partner\.\s*<br>The ₹50 service fee has been <strong>waived</strong> for you\.\s*</p>\s*<div style=\"font-size: 2rem; font-weight: 700; color: #16a34a; margin-bottom: 1rem; text-decoration: line-through; opacity: 0\.5;\">₹50\.00</div>\s*<div style=\"font-size: 2rem; font-weight: 700; color: #16a34a;\">FREE ✓</div>\s*<p style=\"color: var\(--primary\); font-size: 0\.9rem; margin-top: 0\.5rem; font-weight: 600;\">\s*\(Free requests remaining this month: \$\{result\.remaining\}\)\s*</p>",
    new_ui.strip(),
    content
)

# And change the submit logic in submitCustomerForm()
# From:
#      if (isRegisteredMerchant) payload.merchantBypass = true;
#      if (isFreeService) payload.freeServiceBypass = true;
# To: include OTP validation

submit_logic = """
      if (isFreeService) payload.freeServiceBypass = true;
      if (isRegisteredMerchant) {
        payload.merchantBypass = true;
        const otpInput = document.getElementById("merchantOtp");
        if (otpInput) {
            const otpVal = otpInput.value.trim();
            if (!otpVal || otpVal.length !== 6) {
                setFieldError("merchantOtp", "merchantOtp-error", "Please enter a valid 6-digit OTP.");
                return;
            }
            clearFieldError("merchantOtp-error");
            payload.otp = otpVal;
        }
      }
"""

content = re.sub(
    r"if \(isRegisteredMerchant\) payload\.merchantBypass = true;\s*if \(isFreeService\) payload\.freeServiceBypass = true;",
    submit_logic.strip(),
    content
)

# Also update the submit button text for merchant verification
content = re.sub(
    r"if \(submitBtn\) \{\s*submitBtn\.innerHTML = \"Submit Request\";\s*\}",
    'if (submitBtn) {\n            submitBtn.innerHTML = "Verify OTP & Submit";\n          }',
    content,
    count=1 # only the first one which is inside the hasFreeQuota block (actually the first one is isFreeService)
)
# Wait, count=1 might replace the free service one!
# Let's replace specifically in the merchant block by replacing the whole thing.

with open('form.js', 'w') as f:
    f.write(content)
