/* ═══════════════════════════════════════════════════
   REAL AMOUNT — Partner Onboarding Form Logic
   ═══════════════════════════════════════════════════
   SETUP: Replace the URL below with your deployed
   Google Apps Script Web App URL.
═══════════════════════════════════════════════════ */
//
const APPS_SCRIPT_URL = "/api/submit";
// ── State ─────────────────────────────────────────
let accountType = "";
let selectedBusinessType = "";
let selectedCustomerService = "";

// ── DOM References ────────────────────────────────
const step0 = document.getElementById("step-0");
const step1 = document.getElementById("step-1");
const step1Customer = document.getElementById("step-1-customer");
const step2a = document.getElementById("step-2a");
const step2b = document.getElementById("step-2b");
const step3Customer = document.getElementById("step-3-customer");
const successScreen = document.getElementById("success-screen");
const progCircle1 = document.getElementById("prog-circle-1");
const progCircle2 = document.getElementById("prog-circle-2");
const progCircle3 = document.getElementById("prog-circle-3");
const progLine1 = document.getElementById("prog-line-1");
const progLine2 = document.getElementById("prog-line-2");
const progLabel1 = document.getElementById("prog-label-1");
const progLabel2 = document.getElementById("prog-label-2");
const progLabel3 = document.getElementById("prog-label-3");
const progStep3 = document.getElementById("prog-step-3");
const toast = document.getElementById("toast");

// ═══════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  setupMobileInput();
  setupOtherCheckbox("product-other", "product-other-wrap", "product-other-input");
  setupOtherCheckbox("service-other", "service-other-wrap", "service-other-input");
  setupNoneCheckbox("product-none", "products");
  setupNoneCheckbox("service-none", "services");
  setupDragDrop("product-upload-zone", "product-file-input");
  setupDragDrop("service-upload-zone", "service-file-input");
  setupDragDrop("payment-upload-zone", "payment-file-input");
  setupRadioCardHighlight();
  setupLiveValidation();

  // ── Auto-skip step-0 if ?type= is in the URL ──
  const urlParams = new URLSearchParams(window.location.search);
  const presetType = urlParams.get('type');
  if (presetType === 'partner') {
    document.getElementById('at-partner').checked = true;
    document.getElementById('radio-card-partner').classList.add('selected');
    goToStep1();
  } else if (presetType === 'customer') {
    document.getElementById('at-customer').checked = true;
    document.getElementById('radio-card-customer').classList.add('selected');
    goToStep1();
  }
});

// ── Live radio card visual ──
function setupRadioCardHighlight() {
  // Account Type
  document.querySelectorAll('input[name="accountType"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      document.getElementById("radio-card-partner").classList.remove("selected");
      document.getElementById("radio-card-customer").classList.remove("selected");
      if (radio.id === "at-partner") document.getElementById("radio-card-partner").classList.add("selected");
      if (radio.id === "at-customer") document.getElementById("radio-card-customer").classList.add("selected");
      clearFieldError("accountType-error");

      // Automatically advance to the next step
      goToStep1();
    });
  });

  // Business Type
  document.querySelectorAll('input[name="businessType"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      document.getElementById("radio-card-product").classList.remove("selected");
      document.getElementById("radio-card-service").classList.remove("selected");
      if (radio.id === "bt-product") document.getElementById("radio-card-product").classList.add("selected");
      if (radio.id === "bt-service") document.getElementById("radio-card-service").classList.add("selected");
      clearFieldError("businessType-error");

      if (accountType === "Partner" && isStep1ValidSilent()) {
        goToStep2();
      }
    });
  });

  // Customer Service Type
  document.querySelectorAll('input[name="customerService"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      document.getElementById("radio-card-buy-new").classList.remove("selected");
      document.getElementById("radio-card-service-repair").classList.remove("selected");
      document.getElementById("radio-card-buy-used").classList.remove("selected");
      document.getElementById("radio-card-sell-used").classList.remove("selected");
      if (radio.id === "cs-buy-new") document.getElementById("radio-card-buy-new").classList.add("selected");
      if (radio.id === "cs-service-repair") document.getElementById("radio-card-service-repair").classList.add("selected");
      if (radio.id === "cs-buy-used") document.getElementById("radio-card-buy-used").classList.add("selected");
      if (radio.id === "cs-sell-used") document.getElementById("radio-card-sell-used").classList.add("selected");
      clearFieldError("customerService-error");

      if (accountType === "Customer" && isStep1CustomerValidSilent()) {
        goToStep2Customer();
      }
    });
  });
}

// ── Clear error on input ──
function setupLiveValidation() {
  [
    "email", "businessName", "workplaceAddress", "contactPerson", "mobile",
    "customerName", "customerMobile", "customerAddress"
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", () => {
      el.classList.remove("error");
      clearFieldError(`${id}-error`);

      // Auto-advance
      if (accountType === "Partner" && isStep1ValidSilent()) {
        goToStep2();
      } else if (accountType === "Customer" && isStep1CustomerValidSilent()) {
        goToStep2Customer();
      }
    });
  });
}

// ── Mobile: digits only ──
function setupMobileInput() {
  const mobile = document.getElementById("mobile");
  if (mobile) {
    mobile.addEventListener("input", () => {
      mobile.value = mobile.value.replace(/\D/g, "").slice(0, 10);
    });
  }
  const custMobile = document.getElementById("customerMobile");
  if (custMobile) {
    custMobile.addEventListener("input", () => {
      custMobile.value = custMobile.value.replace(/\D/g, "").slice(0, 10);
    });
  }
}

// ── "Other" checkbox reveals text input ──
function setupOtherCheckbox(checkboxId, wrapId, inputId) {
  const checkbox = document.getElementById(checkboxId);
  const wrap = document.getElementById(wrapId);
  const input = document.getElementById(inputId);

  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      wrap.classList.remove("hidden");
      input.focus();
    } else {
      wrap.classList.add("hidden");
      input.value = "";
    }
  });
}

function setupNoneCheckbox(noneId, groupName) {
  const noneBox = document.getElementById(noneId);
  if (!noneBox) return; // Add null check in case the element doesn't exist
  
  const allBoxes = document.querySelectorAll(`input[name="${groupName}"]`);

  noneBox.addEventListener("change", () => {
    if (noneBox.checked) {
      allBoxes.forEach((cb) => {
        if (cb !== noneBox) {
          cb.checked = false;
          cb.dispatchEvent(new Event("change"));
        }
      });
    }
  });

  allBoxes.forEach((cb) => {
    if (cb === noneBox) return;
    cb.addEventListener("change", () => {
      if (cb.checked) noneBox.checked = false;
    });
  });
}

// ── Single-select mode for customer checkboxes ──
function enableSingleSelectCheckboxes(groupName) {
  const allBoxes = document.querySelectorAll(`input[name="${groupName}"]`);
  allBoxes.forEach((cb) => {
    // Remove old listener by cloning
    const newCb = cb.cloneNode(true);
    cb.parentNode.replaceChild(newCb, cb);
  });

  // Re-query after cloning
  const freshBoxes = document.querySelectorAll(`input[name="${groupName}"]`);
  freshBoxes.forEach((cb) => {
    cb.addEventListener("change", () => {
      if (cb.checked) {
        freshBoxes.forEach((other) => {
          if (other !== cb) other.checked = false;
        });
        // Also close the "Other" text input if a non-Other item is selected
        if (cb.value !== "Other") {
          const otherWrap = document.getElementById(`${groupName === "products" ? "product" : "service"}-other-wrap`);
          if (otherWrap) otherWrap.classList.add("hidden");
        }
      }
    });
  });

  // Re-setup Other checkbox toggle
  const otherCb = document.querySelector(`input[name="${groupName}"][value="Other"]`);
  if (otherCb) {
    const prefix = groupName === "products" ? "product" : "service";
    const wrap = document.getElementById(`${prefix}-other-wrap`);
    const input = document.getElementById(`${prefix}-other-input`);
    otherCb.addEventListener("change", () => {
      if (otherCb.checked) {
        if (wrap) wrap.classList.remove("hidden");
        if (input) input.focus();
      } else {
        if (wrap) wrap.classList.add("hidden");
        if (input) input.value = "";
      }
    });
  }
}

// ── Drag & Drop setup ──
function setupDragDrop(zoneId, inputId) {
  const zone = document.getElementById(zoneId);
  if (!zone) return;

  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    zone.classList.add("dragover");
  });

  zone.addEventListener("dragleave", (e) => {
    if (!zone.contains(e.relatedTarget)) zone.classList.remove("dragover");
  });

  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    if (file) applyFileToZone(file, zoneId, inputId);
  });
}

// ═══════════════════════════════════════════════════
// STEP NAVIGATION
// ═══════════════════════════════════════════════════
function goToStep1() {
  const accTypeInput = document.querySelector('input[name="accountType"]:checked');
  if (!accTypeInput) {
    showFieldErrorMsg("accountType-error", "Please select an account type");
    return;
  }
  accountType = accTypeInput.value;

  step0.classList.add("hidden");

  progCircle1.classList.remove("active");
  progCircle1.classList.add("completed");
  progCircle2.classList.add("active");
  progLine1.classList.add("filled");

  const mainTitle = document.getElementById("main-form-title");

  if (accountType === "Partner") {
    if (mainTitle) mainTitle.textContent = "Partner Registration Form";
    progLabel1.textContent = "Account";
    progLabel2.textContent = "Basic Info";
    progLabel3.textContent = "Business Details";
    progStep3.classList.remove("hidden");
    progLine2.classList.remove("hidden");
    step1.classList.remove("hidden");
  } else {
    if (mainTitle) mainTitle.textContent = "Customer Registration Form";
    progLabel1.textContent = "Account";
    progLabel2.textContent = "Details";
    progLabel3.textContent = "Payment";
    progLine2.classList.remove("hidden");
    progStep3.classList.remove("hidden");
    step1Customer.classList.remove("hidden");
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goBackToStep0() {
  step1.classList.add("hidden");
  step1Customer.classList.add("hidden");
  step0.classList.remove("hidden");

  const mainTitle = document.getElementById("main-form-title");
  if (mainTitle) mainTitle.textContent = "Choose your account type";

  progCircle2.classList.remove("active");
  progCircle1.classList.remove("completed");
  progCircle1.classList.add("active");
  progLine1.classList.remove("filled");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goToStep2() {
  if (!validateStep1()) return;

  const businessType = document.querySelector('input[name="businessType"]:checked');
  selectedBusinessType = businessType.value;

  step1.classList.add("hidden");

  if (selectedBusinessType === "Product Sale (Retail)") {
    step2a.classList.remove("hidden");
  } else {
    step2b.classList.remove("hidden");
  }

  // Update progress
  progCircle2.classList.remove("active");
  progCircle2.classList.add("completed");
  progCircle3.classList.add("active");
  progLine2.classList.add("filled");

  // Update UI for Partner
  const brandsLabel = document.getElementById('brands-label');
  if (brandsLabel) brandsLabel.textContent = 'Please mention the brands you deal in';
  const offerPriceProduct = document.getElementById('offer-price-product-wrapper');
  if (offerPriceProduct) offerPriceProduct.style.display = 'none';
  

  const productDesc = document.getElementById('product-description-wrapper');
  if (productDesc) productDesc.style.display = 'block';
  const serviceDesc = document.getElementById('service-description-wrapper');
  if (serviceDesc) serviceDesc.style.display = 'block';

  document.querySelectorAll('.none-item').forEach(el => el.style.display = 'inline-flex');

  const productUploadLabel = document.getElementById('product-upload-label');
  if (productUploadLabel) productUploadLabel.textContent = 'Upload visiting card / business card';
  const serviceUploadLabel = document.getElementById('service-upload-label');
  if (serviceUploadLabel) serviceUploadLabel.textContent = 'Upload visiting card / business card';

  document.getElementById("product-submit-text").textContent = "Submit Form";
  document.getElementById("service-submit-text").textContent = "Submit Form";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goToStep2Customer() {
  if (!validateStep1Customer()) return;

  const custService = document.querySelector('input[name="customerService"]:checked');
  selectedCustomerService = custService.value;

  step1Customer.classList.add("hidden");

  // Change heading and badge for customer context
  const heading = document.getElementById('step-2a-heading');
  if (heading) heading.textContent = 'What product are you interested in?';
  const badge = document.getElementById('step-2a-badge');
  if (badge) badge.textContent = 'Select a Product';

  if (selectedCustomerService === "Service/Repair") {
    step2b.classList.remove("hidden");
  } else {
    step2a.classList.remove("hidden");
  }

  // Update progress
  progCircle2.classList.remove("active");
  progCircle2.classList.add("completed");
  progCircle3.classList.add("active");
  progLine2.classList.add("filled");

  // Update UI for Customer
  const brandsLabel = document.getElementById('brands-label');
  if (brandsLabel) {
    if (selectedCustomerService === "Sell Used Product") {
      brandsLabel.textContent = 'Please mention the brand of your product';
    } else {
      brandsLabel.textContent = 'Please mention the brands you are looking for';
    }
  }

  const offerPriceProductLabel = document.getElementById('offer-price-product-label');
  if (offerPriceProductLabel) {
    if (selectedCustomerService === "Sell Used Product") {
      offerPriceProductLabel.innerHTML = 'Expected selling price <span class="asterisk">*</span>';
    } else {
      offerPriceProductLabel.innerHTML = 'Price offered to you <span class="asterisk">*</span>';
    }
  }
  
  

  const offerPriceProduct = document.getElementById('offer-price-product-wrapper');
  if (offerPriceProduct) offerPriceProduct.style.display = 'block';
  

  const productDesc = document.getElementById('product-description-wrapper');
  if (productDesc) productDesc.style.display = 'block';
  const serviceDesc = document.getElementById('service-description-wrapper');
  if (serviceDesc) serviceDesc.style.display = 'block';

  document.querySelectorAll('.none-item').forEach(el => el.style.display = 'none');

  const productUploadLabel = document.getElementById('product-upload-label');
  if (productUploadLabel) productUploadLabel.textContent = 'Upload a photo, if relevant';
  
  const serviceUploadLabel = document.getElementById('service-upload-label');
  if (serviceUploadLabel) {
    if (selectedCustomerService === "Service/Repair") {
      serviceUploadLabel.textContent = 'Upload a photo of the issue/problem';
    } else {
      serviceUploadLabel.textContent = 'Upload a photo, if relevant';
    }
  }

  document.getElementById("product-submit-text").textContent = "Next Step";
  document.getElementById("service-submit-text").textContent = "Next Step";

  // Enforce single-select for customer checkboxes
  enableSingleSelectCheckboxes("products");
  enableSingleSelectCheckboxes("services");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goBack() {
  step2a.classList.add("hidden");
  step2b.classList.add("hidden");

  // Reset step 2 submit buttons in case they were left in loading state
  ["product-submit-btn", "service-submit-btn"].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) { btn.disabled = false; btn.classList.remove("btn-loading"); }
  });

  if (accountType === "Partner") {
    step1.classList.remove("hidden");
  } else {
    step1Customer.classList.remove("hidden");
  }

  // Reset heading and badge back to default
  const heading = document.getElementById('step-2a-heading');
  if (heading) heading.textContent = 'What products do you sell?';
  const badge = document.getElementById('step-2a-badge');
  if (badge) badge.textContent = 'Product Sale (Retail)';

  progCircle3.classList.remove("active");
  progCircle2.classList.remove("completed");
  progCircle2.classList.add("active");
  progLine2.classList.remove("filled");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

let isRegisteredMerchant = false;
let isFreeService = false;
let currentPaymentAmount = 50; // Tracks if current customer is a merchant

async function handleStep2Submit(type) {
  if (!validateStep2(type)) return;

  if (accountType === "Partner") {
    submitForm();
  } else {
    if (type === "product") step2a.classList.add("hidden");
    else step2b.classList.add("hidden");

    // Check if the customer is a registered merchant
    const mobile = document.getElementById("customerMobile").value.trim();
    isRegisteredMerchant = false;

    
    isFreeService = (selectedCustomerService === "Service/Repair");

    currentPaymentAmount = 50;
    if (type === "product") {
        const price = parseFloat(document.getElementById("offerPriceProduct").value) || 0;
        currentPaymentAmount = Math.max(10, Math.min(50, Math.round(price * 0.025)));
    }


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
          <div style="font-size: 2rem; font-weight: 700; color: #16a34a; margin-bottom: 1rem; text-decoration: line-through; opacity: 0.5;">₹${currentPaymentAmount}</div>
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
                <br>The ₹${currentPaymentAmount} service fee has been <strong>waived</strong> for you.
              </p>
              
              <!-- OTP Box -->
              <div class="form-group" style="margin-top: 1.5rem; background: #fff; padding: 1rem; border-radius: 8px; border: 1px solid rgba(22, 163, 74, 0.3);">
                  <label for="merchantOtp" style="color: #16a34a; font-weight: 600; text-align: center; display: block; margin-bottom: 0.5rem;">
                    Enter OTP sent to ${result.maskedEmail || 'your email'} <span class="asterisk">*</span>
                  </label>
                  <input type="text" id="merchantOtp" name="merchantOtp" placeholder="------" maxlength="6" style="text-align: center; letter-spacing: 0.3em; font-size: 1.5rem; font-weight: bold; width: 100%; max-width: 200px; margin: 0 auto; display: block; border: 2px solid #16a34a; border-radius: 6px; padding: 0.5rem;" />
                  <span class="field-error hidden" id="merchantOtp-error" style="text-align: center; margin-top: 0.5rem;"></span>
              </div>
              
              <div style="font-size: 1.5rem; font-weight: 700; color: #16a34a; margin-top: 1rem; text-decoration: line-through; opacity: 0.5;">₹${currentPaymentAmount}</div>
              <div style="font-size: 1.5rem; font-weight: 700; color: #16a34a;">FREE ✓</div>
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
            submitBtn.innerHTML = "Verify OTP & Submit";
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
                <br>Please pay the standard ₹${currentPaymentAmount} service fee to continue.
              </p>
              <div style="font-size: 2.5rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">
                ₹${currentPaymentAmount}.00
              </div>
              <p style="color: var(--text-muted); font-size: 0.85rem;">One-time platform service fee</p>
            `;
          }
          if (submitBtn) {
            submitBtn.innerHTML = `Pay ₹${currentPaymentAmount} & Submit`;
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
                  ₹${currentPaymentAmount}.00
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
            submitBtn.innerHTML = `Pay ₹${currentPaymentAmount} & Submit`;
        }
      }
    } catch (err) {
      console.error("Merchant check failed:", err);
      isRegisteredMerchant = false;
    }
    }

    // Reset submit button state before showing step 3
    const step3SubmitBtn = document.getElementById("customer-submit-btn");
    if (step3SubmitBtn) {
      step3SubmitBtn.disabled = false;
      step3SubmitBtn.classList.remove("btn-loading");
    }

    step3Customer.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function goBackToStep2From3() {
  step3Customer.classList.add("hidden");

  // Reset all submit buttons in case they were left in loading state
  ["product-submit-btn", "service-submit-btn", "customer-submit-btn"].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) { btn.disabled = false; btn.classList.remove("btn-loading"); }
  });

  if (selectedCustomerService === "Service/Repair") {
    step2b.classList.remove("hidden");
  } else {
    step2a.classList.remove("hidden");
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ═══════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════
function validateStep1() {
  clearAllErrors();
  let valid = true;

  const email = document.getElementById("email").value.trim();
  const bizName = document.getElementById("businessName").value.trim();
  const address = document.getElementById("workplaceAddress").value.trim();
  const contact = document.getElementById("contactPerson").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const bizType = document.querySelector('input[name="businessType"]:checked');

  if (!email || !isValidEmail(email)) {
    setFieldError("email", "email-error", "Please enter a valid email address");
    valid = false;
  }
  if (!bizName) {
    setFieldError("businessName", "businessName-error", "Business name is required");
    if (valid) scrollToField("businessName");
    valid = false;
  }
  if (!address) {
    setFieldError("workplaceAddress", "workplaceAddress-error", "Workplace address is required");
    if (valid) scrollToField("workplaceAddress");
    valid = false;
  }
  if (!contact) {
    setFieldError("contactPerson", "contactPerson-error", "Contact person name is required");
    if (valid) scrollToField("contactPerson");
    valid = false;
  }
  if (!mobile || mobile.length !== 10) {
    setFieldError("mobile", "mobile-error", "Please enter a valid 10-digit mobile number");
    if (valid) scrollToField("mobile");
    valid = false;
  }
  if (!bizType) {
    showFieldErrorMsg("businessType-error", "Please select a business type");
    if (valid) scrollToField("businessType-error");
    valid = false;
  }

  if (!valid) showToast("Please fill in all required fields correctly.", "error");
  return valid;
}

function validateStep1Customer() {
  clearAllErrors();
  let valid = true;

  const name = document.getElementById("customerName").value.trim();
  const mobile = document.getElementById("customerMobile").value.trim();
  const address = document.getElementById("customerAddress").value.trim();
  const service = document.querySelector('input[name="customerService"]:checked');

  if (!name) {
    setFieldError("customerName", "customerName-error", "Name is required");
    if (valid) scrollToField("customerName");
    valid = false;
  }
  if (!mobile || mobile.length !== 10) {
    setFieldError("customerMobile", "customerMobile-error", "Please enter a valid 10-digit mobile number");
    if (valid) scrollToField("customerMobile");
    valid = false;
  }
  if (!address) {
    setFieldError("customerAddress", "customerAddress-error", "Address is required");
    if (valid) scrollToField("customerAddress");
    valid = false;
  }
  if (!service) {
    showFieldErrorMsg("customerService-error", "Please select a service type");
    if (valid) scrollToField("customerService-error");
    valid = false;
  }

  if (!valid) showToast("Please fill in all required fields correctly.", "error");
  return valid;
}

function isStep1ValidSilent() {
  const email = document.getElementById("email").value.trim();
  const bizName = document.getElementById("businessName").value.trim();
  const address = document.getElementById("workplaceAddress").value.trim();
  const contact = document.getElementById("contactPerson").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const bizType = document.querySelector('input[name="businessType"]:checked');

  if (!email || !isValidEmail(email)) return false;
  if (!bizName) return false;
  if (!address) return false;
  if (!contact) return false;
  if (!mobile || mobile.length !== 10) return false;
  if (!bizType) return false;

  return true;
}

function isStep1CustomerValidSilent() {
  const name = document.getElementById("customerName").value.trim();
  const mobile = document.getElementById("customerMobile").value.trim();
  const address = document.getElementById("customerAddress").value.trim();
  const service = document.querySelector('input[name="customerService"]:checked');

  if (!name) return false;
  if (!mobile || mobile.length !== 10) return false;
  if (!address) return false;
  if (!service) return false;

  return true;
}

function validateStep2(type) {
  clearAllErrors();
  const isProduct = type === "product";
  const groupName = isProduct ? "products" : "services";
  const errorId = isProduct ? "products-error" : "services-error";
  const checked = document.querySelectorAll(`input[name="${groupName}"]:checked`);

  if (checked.length === 0) {
    showFieldErrorMsg(errorId, `Please select at least one ${isProduct ? "product" : "service"}`);
    scrollToField(errorId);
    showToast(`Select at least one ${isProduct ? "product" : "service"}.`, "error");
    return false;
  }

  if (isProduct) {
    const otherChecked = document.getElementById("product-other").checked;
    const otherInput = document.getElementById("product-other-input").value.trim();
    if (otherChecked && !otherInput) {
      showFieldErrorMsg("products-error", 'Please specify your "Other" product');
      scrollToField("products-error");
      return false;
    }
    if (accountType === "Customer") {
      const offerPrice = document.getElementById("offerPriceProduct").value.trim();
      if (!offerPrice) {
        setFieldError("offerPriceProduct", "offerPriceProduct-error", "Offer price is required");
        scrollToField("offerPriceProduct");
        return false;
      }
    }
  } else {
    const otherChecked = document.getElementById("service-other").checked;
    const otherInput = document.getElementById("service-other-input").value.trim();
    if (otherChecked && !otherInput) {
      showFieldErrorMsg("services-error", 'Please specify your "Other" service');
      scrollToField("services-error");
      return false;
    }
    
  }

  return true;
}

function validateStep3Customer() {
  return true;
}

// ═══════════════════════════════════════════════════
// FILE HANDLING
// ═══════════════════════════════════════════════════
function handleFileSelect(input, zoneId) {
  const file = input.files[0];
  if (file) applyFileToZone(file, zoneId, input.id);
}

function applyFileToZone(file, zoneId, inputId) {
  const MAX_SIZE = 2 * 1024 * 1024;
  const ALLOWED = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
  ];

  if (file.size > MAX_SIZE) {
    showToast("File is too large. Maximum size is 2 MB.", "error");
    return;
  }
  if (!ALLOWED.includes(file.type) && !file.name.match(/\.(pdf|jpg|jpeg|png|gif|webp|bmp)$/i)) {
    showToast("Only PDF or image files are accepted.", "error");
    return;
  }

  const prefix = zoneId.replace("-upload-zone", "");
  const placeholder = document.getElementById(`${prefix}-upload-placeholder`);
  const preview = document.getElementById(`${prefix}-upload-preview`);
  const nameEl = document.getElementById(`${prefix}-file-name`);
  const sizeEl = document.getElementById(`${prefix}-file-size`);
  const zone = document.getElementById(zoneId);

  placeholder.classList.add("hidden");
  preview.classList.remove("hidden");
  nameEl.textContent = file.name;
  sizeEl.textContent = formatBytes(file.size);

  zone._attachedFile = file;
}

function removeFile(zoneId, inputId, event) {
  event.stopPropagation();
  const prefix = zoneId.replace("-upload-zone", "");
  const placeholder = document.getElementById(`${prefix}-upload-placeholder`);
  const preview = document.getElementById(`${prefix}-upload-preview`);
  const zone = document.getElementById(zoneId);
  const input = document.getElementById(inputId);

  preview.classList.add("hidden");
  placeholder.classList.remove("hidden");
  zone._attachedFile = null;
  input.value = "";
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ═══════════════════════════════════════════════════
// FORM SUBMISSION
// ═══════════════════════════════════════════════════
async function submitForm() {
  const isProduct = selectedBusinessType === "Product Sale (Retail)";
  const submitBtn = document.getElementById(isProduct ? "product-submit-btn" : "service-submit-btn");
  const groupName = isProduct ? "products" : "services";
  const zoneId = isProduct ? "product-upload-zone" : "service-upload-zone";

  const selectedItems = [];
  document.querySelectorAll(`input[name="${groupName}"]:checked`).forEach((cb) => {
    if (cb.value === "Other") {
      const otherVal = document.getElementById(`${isProduct ? "product" : "service"}-other-input`).value.trim();
      if (otherVal) selectedItems.push(`Other: ${otherVal}`);
    } else {
      selectedItems.push(cb.value);
    }
  });

  const payload = {
      accountType: accountType,
      merchantBypass: isRegisteredMerchant,
      freeServiceBypass: isFreeService,
    email: document.getElementById("email").value.trim(),
    businessName: document.getElementById("businessName").value.trim(),
    workplaceAddress: document.getElementById("workplaceAddress").value.trim(),
    gstNumber: document.getElementById("gstNumber").value.trim(),
    contactPerson: document.getElementById("contactPerson").value.trim(),
    mobileNumber: document.getElementById("mobile").value.trim(),
    businessType: selectedBusinessType,
    selectedItems: selectedItems,
    brands: isProduct ? document.getElementById("brands").value.trim() : "",
    offerPrice: isProduct ? document.getElementById("offerPriceProduct").value.trim() : "",
    description: isProduct ? document.getElementById("productDescription").value.trim() : document.getElementById("serviceDescription").value.trim(),
  };

  const zone = document.getElementById(zoneId);
  const file = zone._attachedFile;

  if (file) {
    try {
      const dataUrl = await fileToBase64(file);
      payload.fileData = dataUrl.split(",")[1];
      payload.fileName = file.name;
      payload.fileType = file.type || "application/octet-stream";
    } catch {
      showToast("Could not read the uploaded file. Please try again.", "error");
      return;
    }
  }

  const originalHTML = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting…";
  submitBtn.classList.add("btn-loading");

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      console.warn("Non-JSON response from Apps Script:", text.slice(0, 200));
      result = { success: true };
    }

    if (!result.success) throw new Error(result.error || "Submission failed");

    showSuccessScreen(payload, result.referenceId || "—");
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalHTML;
    submitBtn.classList.remove("btn-loading");
    showToast("Network error. Please check your connection and try again.", "error");
    console.error("Submission error:", err);
  }
}

// Dynamically load Razorpay script only when needed
function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (typeof Razorpay !== 'undefined') return resolve();
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.head.appendChild(script);
  });
}

async function submitCustomerForm() {
  const submitBtn = document.getElementById("customer-submit-btn");
  const originalHTML = submitBtn.innerHTML;

  submitBtn.disabled = true;
  submitBtn.classList.add("btn-loading");

  const isProduct = selectedCustomerService !== "Service/Repair";
  const groupName = isProduct ? "products" : "services";

  const selectedItems = [];
  document.querySelectorAll(`input[name="${groupName}"]:checked`).forEach((cb) => {
    if (cb.value === "Other") {
      const otherVal = document.getElementById(`${isProduct ? "product" : "service"}-other-input`).value.trim();
      if (otherVal) selectedItems.push(`Other: ${otherVal}`);
    } else {
      selectedItems.push(cb.value);
    }
  });

  const payload = {
      accountType: accountType,
      merchantBypass: isRegisteredMerchant,
      freeServiceBypass: isFreeService,
    customerName: document.getElementById("customerName").value.trim(),
    customerMobile: document.getElementById("customerMobile").value.trim(),
    customerAddress: document.getElementById("customerAddress").value.trim(),
    customerService: selectedCustomerService,
    selectedItems: selectedItems,
    brands: isProduct ? document.getElementById("brands").value.trim() : "",
    offerPrice: isProduct ? document.getElementById("offerPriceProduct").value.trim() : "",
    description: isProduct ? document.getElementById("productDescription").value.trim() : document.getElementById("serviceDescription").value.trim(),
  };

  const zoneId = isProduct ? "product-upload-zone" : "service-upload-zone";
  const zone = document.getElementById(zoneId);
  const file = zone._attachedFile;

  if (file) {
    try {
      const dataUrl = await fileToBase64(file);
      payload.fileData = dataUrl.split(",")[1];
      payload.fileName = file.name;
      payload.fileType = file.type || "application/octet-stream";
    } catch {
      showToast("Could not read the uploaded file. Please try again.", "error");
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
      submitBtn.classList.remove("btn-loading");
      return;
    }
  }

  // ── MERCHANT OR FREE SERVICE BYPASS: Skip Razorpay, submit directly ──
  if (isRegisteredMerchant || isFreeService) {
    if (isRegisteredMerchant) {
      const otpInput = document.getElementById("merchantOtp").value.trim();
      if (!otpInput || otpInput.length !== 6) {
        setFieldError("merchantOtp", "merchantOtp-error", "Please enter a valid 6-digit OTP");
        scrollToField("merchantOtp");
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
        submitBtn.classList.remove("btn-loading");
        return;
      }
      clearFieldError("merchantOtp", "merchantOtp-error");
      payload.otp = otpInput;
    }

    submitBtn.textContent = "Submitting…";

    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        result = { success: true };
      }

      if (!result.success) throw new Error(result.error || "Submission failed");

      showSuccessScreenCustomer(payload, result.referenceId || "—");
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
      submitBtn.classList.remove("btn-loading");
      showToast(err.message || "Submission failed. Please try again.", "error");
      console.error("Submission error:", err);
      // If OTP error, clear and re-focus the OTP input
      const otpField = document.getElementById("merchantOtp");
      if (otpField) {
        otpField.value = "";
        otpField.disabled = false;
        otpField.focus();
        setFieldError("merchantOtp", "merchantOtp-error", err.message || "Invalid OTP");
      }
    }
    return;
  }

  // ── NORMAL FLOW: Razorpay payment ──
  submitBtn.textContent = "Processing Payment…";

  try {
    await loadRazorpay();
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalHTML;
    submitBtn.classList.remove("btn-loading");
    showToast("Failed to load payment gateway. Please try again.", "error");
    return;
  }

  try {
    // 1. Create order on backend (Apps Script)
    const orderResponse = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ action: "create_razorpay_order", amount: currentPaymentAmount }),
    });

    const orderText = await orderResponse.text();
    let orderResult;
    try {
      orderResult = JSON.parse(orderText);
    } catch {
      throw new Error("Invalid order response from server");
    }

    if (!orderResult.success || !orderResult.order) {
      throw new Error(orderResult.error || "Failed to create order");
    }

    const orderData = orderResult.order;

    // 2. Open Razorpay Modal
    const options = {
      key: orderData.key || "rzp_test_T5neItIIPIHISX",
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Real Amount",
      description: "Service Lead Fee",
      order_id: orderData.id,
      handler: async function (response) {
        // Payment succeeded
        payload.razorpayPaymentId = response.razorpay_payment_id;
        payload.razorpayOrderId = response.razorpay_order_id;
        payload.razorpaySignature = response.razorpay_signature;

        submitBtn.textContent = "Registering…";

        try {
          const finalResponse = await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify(payload),
          });

          const finalText = await finalResponse.text();
          let finalResult;
          try {
            finalResult = JSON.parse(finalText);
          } catch {
            finalResult = { success: true };
          }

          if (!finalResult.success) throw new Error(finalResult.error || "Final registration failed");

          showSuccessScreenCustomer(payload, finalResult.referenceId || "—");
        } catch (err) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalHTML;
          submitBtn.classList.remove("btn-loading");
          showToast("Registration failed. Please contact support with Payment ID: " + response.razorpay_payment_id, "error");
          console.error(err);
        }
      },
      prefill: {
        name: payload.customerName,
        contact: payload.customerMobile,
      },

      theme: {
        color: "#1a3c5e",
      },
      modal: {
        ondismiss: function () {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalHTML;
          submitBtn.classList.remove("btn-loading");
          showToast("Payment cancelled.", "info");
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();

  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalHTML;
    submitBtn.classList.remove("btn-loading");
    showToast(err.message || "Failed to initiate payment.", "error");
    console.error("Payment initiation error:", err);
  }
}


// ═══════════════════════════════════════════════════
// SUCCESS SCREEN
// ═══════════════════════════════════════════════════
function showSuccessScreen(payload, referenceId) {
  // Query directly from DOM to avoid stale reference
  const screen = document.getElementById("success-screen");
  if (screen) {
    screen.classList.remove("hidden");
    screen.style.display = "block";
  }

  // Hide form steps AFTER showing success screen
  step2a.classList.add("hidden");
  step2b.classList.add("hidden");

  // Keep progress bar at 3 steps completed
  progCircle3.classList.remove("active");
  progCircle3.classList.add("completed");

  const meta = document.getElementById("success-meta");
  if (meta) {
    const tags = [
      payload.businessName,
      payload.businessType,
      payload.mobileNumber ? `+91 ${payload.mobileNumber}` : null,
    ].filter(Boolean);
    meta.innerHTML = tags.map((t) => `<span class="success-tag">${escapeHtml(t)}</span>`).join("");
  }

  const refEl = document.getElementById("ref-id-display");
  if (refEl) refEl.textContent = referenceId || "—";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showSuccessScreenCustomer(payload, referenceId) {
  step3Customer.classList.add("hidden");
  successScreen.classList.remove("hidden");

  // Keep progress bar at 3 steps completed
  progCircle3.classList.remove("active");
  progCircle3.classList.add("completed");

  const meta = document.getElementById("success-meta");
  const tags = [
    payload.customerName,
    payload.customerService,
    `+91 ${payload.customerMobile}`,
  ].filter(Boolean);

  meta.innerHTML = tags.map((t) => `<span class="success-tag">${escapeHtml(t)}</span>`).join("");
  const refEl = document.getElementById("ref-id-display");
  if (refEl) refEl.textContent = referenceId || "—";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function copyRefId() {
  const refId = document.getElementById("ref-id-display").textContent;
  if (!refId || refId === "—") return;

  navigator.clipboard
    .writeText(refId)
    .then(() => showToast("Reference ID copied!", "success"))
    .catch(() => {
      const el = document.getElementById("ref-id-display");
      const range = document.createRange();
      range.selectNode(el);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      document.execCommand("copy");
      showToast("Reference ID copied!", "success");
    });
}

// ═══════════════════════════════════════════════════
// RESET
// ═══════════════════════════════════════════════════
function resetForm() {
  document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea').forEach((el) => (el.value = ""));
  document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach((el) => (el.checked = false));

  ["product-other-wrap", "service-other-wrap"].forEach((id) => document.getElementById(id).classList.add("hidden"));
  ["product-other-input", "service-other-input"].forEach((id) => (document.getElementById(id).value = ""));

  ["product", "service", "payment"].forEach((prefix) => {
    const zone = document.getElementById(`${prefix}-upload-zone`);
    if (zone) zone._attachedFile = null;
    const placeholder = document.getElementById(`${prefix}-upload-placeholder`);
    if (placeholder) placeholder.classList.remove("hidden");
    const preview = document.getElementById(`${prefix}-upload-preview`);
    if (preview) preview.classList.add("hidden");
    const input = document.getElementById(`${prefix}-file-input`);
    if (input) input.value = "";
  });

  ["radio-card-partner", "radio-card-customer", "radio-card-product", "radio-card-service", "radio-card-buy-new", "radio-card-service-repair", "radio-card-buy-used", "radio-card-sell-used"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("selected");
  });

  progCircle1.className = "step-circle active";
  progCircle2.className = "step-circle";
  progCircle3.className = "step-circle";
  progLine1.classList.remove("filled");
  progLine2.classList.remove("filled");

  progLabel1.textContent = "Account Type";
  progLabel2.textContent = "Basic Info";
  progLabel3.textContent = "Payment";

  const mainTitle = document.getElementById("main-form-title");
  if (mainTitle) mainTitle.textContent = "Choose your account type";

  accountType = "";
  selectedBusinessType = "";
  selectedCustomerService = "";
  clearAllErrors();

  successScreen.classList.add("hidden");
  step1.classList.add("hidden");
  step1Customer.classList.add("hidden");
  step2a.classList.add("hidden");
  step2b.classList.add("hidden");
  step3Customer.classList.add("hidden");

  step0.classList.remove("hidden");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ═══════════════════════════════════════════════════
// REFERENCE ID
// ═══════════════════════════════════════════════════
function generateReferenceId() {
  const KEY = "ra_ref_id";
  const START = 11115;
  const last = parseInt(localStorage.getItem(KEY) || String(START - 1), 10);
  const next = last + 1;
  localStorage.setItem(KEY, String(next));
  return "REF" + next;
}

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setFieldError(fieldId, errorId, message) {
  const field = document.getElementById(fieldId);
  if (field) field.classList.add("error");
  showFieldErrorMsg(errorId, message);
}

function showFieldErrorMsg(errorId, message) {
  const el = document.getElementById(errorId);
  if (!el) return;
  el.textContent = message;
  el.classList.remove("hidden");
}

function clearFieldError(errorId) {
  const el = document.getElementById(errorId);
  if (!el) return;
  el.textContent = "";
  el.classList.add("hidden");
}

function clearAllErrors() {
  document.querySelectorAll(".field-error").forEach((el) => {
    el.textContent = "";
    el.classList.add("hidden");
  });
  document.querySelectorAll(".error").forEach((el) => el.classList.remove("error"));
}

function scrollToField(fieldId) {
  const el = document.getElementById(fieldId);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
}

function showToast(message, type = "info") {
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 4000);
}

function escapeHtml(str) {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
