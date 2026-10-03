import re

with open('form.js', 'r') as f:
    content = f.read()

# In form.js, around line 468, add `let isFreeService = false;`
content = re.sub(
    r"let isRegisteredMerchant = false;",
    "let isRegisteredMerchant = false;\nlet isFreeService = false;",
    content
)

# We need to change the logic in handleStep2Submit
# Find where it does the check_merchant API call.
new_logic = """
    isFreeService = (selectedCustomerService === "Service/Repair");

    if (isFreeService) {
      // It's a completely free service for everyone
      const paymentBox = document.querySelector("#step-3-customer .payment-box");
      const submitBtn = document.getElementById("customer-submit-btn");
      
      if (paymentBox) {
        paymentBox.innerHTML = `
          <div style="margin-bottom: 1rem;">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#16a34a" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <p class="payment-title" style="font-size: 1.25rem; margin-bottom: 0.5rem; color: #16a34a;">
            Congratulations! 🎉
          </p>
          <p style="color: var(--text-muted); margin-bottom: 1rem;">
            You requested a <strong>Service/Repair</strong>.
            <br>This category is completely <strong>FREE</strong> for all customers!
          </p>
          <div style="font-size: 2rem; font-weight: 700; color: #16a34a; margin-bottom: 1rem; text-decoration: line-through; opacity: 0.5;">₹50.00</div>
          <div style="font-size: 2rem; font-weight: 700; color: #16a34a;">FREE ✓</div>
          <div class="policy-box" style="margin-top: 1.5rem; padding: 1rem; background: rgba(22, 163, 74, 0.05); border: 1px solid rgba(22, 163, 74, 0.2); border-radius: 8px; text-align: left; font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;">
            No platform fee is required to request services. Submit your details below to get connected!
          </div>
        `;
      }
      if (submitBtn) {
        submitBtn.innerHTML = "Submit Request";
      }
      
    } else {
      // Normal flow (Merchant check or Paid)
      try {
        const res = await fetch(APPS_SCRIPT_URL, {
"""

content = re.sub(
    r"try \{\s*const res = await fetch\(APPS_SCRIPT_URL, \{",
    new_logic.strip(),
    content
)

# And close the else block after the catch block
# The catch block ends with:
#     } catch (err) {
#       console.error("Merchant check failed:", err);
#       isRegisteredMerchant = false;
#     }

content = re.sub(
    r"(\} catch \(err\) \{\s*console\.error\(\"Merchant check failed:\", err\);\s*isRegisteredMerchant = false;\s*\})",
    r"\1\n    }",
    content
)


# Then in submitCustomerForm(), we must send merchantBypass OR freeServiceBypass
# Look for payload definition
#     const payload = {
#       accountType: accountType, ...

payload_replacement = """
    const payload = {
      accountType: accountType,
      merchantBypass: isRegisteredMerchant,
      freeServiceBypass: isFreeService,
"""
content = re.sub(
    r"const payload = \{\s*accountType: accountType,",
    payload_replacement.strip(),
    content
)

# Update the submission check:
# if (isRegisteredMerchant) {
#    payload.merchantBypass = true;
#    submitDirect();

submit_replacement = """
    if (isRegisteredMerchant || isFreeService) {
      if (isRegisteredMerchant) payload.merchantBypass = true;
      if (isFreeService) payload.freeServiceBypass = true;
      
      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      if (data.success) {
        showSuccess(data.referenceId);
      } else {
        showToast("Error: " + (data.error || "Submission failed"), "error");
      }
      return;
    }
"""

content = re.sub(
    r"if \(isRegisteredMerchant\) \{\s*payload\.merchantBypass = true;\s*const res = await fetch\(.*?return;\s*\}",
    submit_replacement.strip(),
    content,
    flags=re.DOTALL
)

with open('form.js', 'w') as f:
    f.write(content)
print("Updated form.js")
