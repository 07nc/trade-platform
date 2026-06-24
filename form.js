/* ═══════════════════════════════════════════════════
   REAL AMOUNT — Partner Onboarding Form Logic
   ═══════════════════════════════════════════════════
   SETUP: Replace the URL below with your deployed
   Google Apps Script Web App URL.
═══════════════════════════════════════════════════ */
//
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycby7wFYYHDrUqeLF-UxwRN1BwcvEc0gI1ZjSBGizNQZgCmlk2Q9HH4OcnZLjvJT_A7-7/exec"
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

// ── "None of the above" unchecks all others ──
function setupNoneCheckbox(noneId, groupName) {
  const noneBox = document.getElementById(noneId);
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

  if (accountType === "Partner") {
    progLabel1.textContent = "Account";
    progLabel2.textContent = "Basic Info";
    progLabel3.textContent = "Business Details";
    progStep3.classList.remove("hidden");
    progLine2.classList.remove("hidden");
    step1.classList.remove("hidden");
  } else {
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

  document.getElementById("product-submit-text").textContent = "Submit Form";
  document.getElementById("service-submit-text").textContent = "Submit Form";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goToStep2Customer() {
  if (!validateStep1Customer()) return;

  const custService = document.querySelector('input[name="customerService"]:checked');
  selectedCustomerService = custService.value;

  step1Customer.classList.add("hidden");

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

  document.getElementById("product-submit-text").textContent = "Next Step";
  document.getElementById("service-submit-text").textContent = "Next Step";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goBack() {
  step2a.classList.add("hidden");
  step2b.classList.add("hidden");

  if (accountType === "Partner") {
    step1.classList.remove("hidden");
  } else {
    step1Customer.classList.remove("hidden");
  }

  progCircle3.classList.remove("active");
  progCircle2.classList.remove("completed");
  progCircle2.classList.add("active");
  progLine2.classList.remove("filled");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function handleStep2Submit(type) {
  if (!validateStep2(type)) return;

  if (accountType === "Partner") {
    submitForm();
  } else {
    if (type === "product") step2a.classList.add("hidden");
    else step2b.classList.add("hidden");

    step3Customer.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function goBackToStep2From3() {
  step3Customer.classList.add("hidden");
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
  clearAllErrors();
  const zone = document.getElementById("payment-upload-zone");
  if (!zone._attachedFile) {
    showFieldErrorMsg("payment-error", "Please upload a payment screenshot");
    scrollToField("payment-error");
    showToast("Please upload a payment screenshot.", "error");
    return false;
  }
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
    email: document.getElementById("email").value.trim(),
    businessName: document.getElementById("businessName").value.trim(),
    workplaceAddress: document.getElementById("workplaceAddress").value.trim(),
    gstNumber: document.getElementById("gstNumber").value.trim(),
    contactPerson: document.getElementById("contactPerson").value.trim(),
    mobileNumber: document.getElementById("mobile").value.trim(),
    businessType: selectedBusinessType,
    selectedItems: selectedItems,
    brands: isProduct ? document.getElementById("brands").value.trim() : "",
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

  const referenceId = generateReferenceId();
  payload.referenceId = referenceId;

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

    showSuccessScreen(payload, referenceId);
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalHTML;
    submitBtn.classList.remove("btn-loading");
    showToast("Network error. Please check your connection and try again.", "error");
    console.error("Submission error:", err);
  }
}

async function submitCustomerForm() {
  if (!validateStep3Customer()) return;

  const submitBtn = document.getElementById("customer-submit-btn");

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
    customerName: document.getElementById("customerName").value.trim(),
    customerMobile: document.getElementById("customerMobile").value.trim(),
    customerAddress: document.getElementById("customerAddress").value.trim(),
    customerService: selectedCustomerService,
    selectedItems: selectedItems,
    brands: isProduct ? document.getElementById("brands").value.trim() : "",
  };

  const zone = document.getElementById("payment-upload-zone");
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

  const referenceId = generateReferenceId();
  payload.referenceId = referenceId;

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

    showSuccessScreenCustomer(payload, referenceId);
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalHTML;
    submitBtn.classList.remove("btn-loading");
    showToast("Network error. Please check your connection and try again.", "error");
    console.error("Submission error:", err);
  }
}

// ═══════════════════════════════════════════════════
// SUCCESS SCREEN
// ═══════════════════════════════════════════════════
function showSuccessScreen(payload, referenceId) {
  step2a.classList.add("hidden");
  step2b.classList.add("hidden");
  successScreen.classList.remove("hidden");

  // Keep progress bar at 3 steps completed
  progCircle3.classList.remove("active");
  progCircle3.classList.add("completed");

  const meta = document.getElementById("success-meta");
  const tags = [
    payload.businessName,
    payload.businessType,
    `+91 ${payload.mobileNumber}`,
  ].filter(Boolean);

  meta.innerHTML = tags.map((t) => `<span class="success-tag">${escapeHtml(t)}</span>`).join("");
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
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
