/* ═══════════════════════════════════════════════════
   REAL AMOUNT — Quote System Logic
   Shared by create-quote.html and quote.html
   ═══════════════════════════════════════════════════ */

const APPS_SCRIPT_URL = "/api/submit";
const SITE_DOMAIN = "https://realamount.com";

// ═══════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════
const toast = document.getElementById("toast");

function showToast(message, type = "info") {
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 4000);
}

// ═══════════════════════════════════════════════════
// CREATE QUOTE PAGE LOGIC
// ═══════════════════════════════════════════════════
let adminPassword = "";
let lastCreatedQuoteData = null; // Store the quote data for sharing

// ── STEP NAVIGATION & VALIDATION ──

function verifyPasswordAndGoToStep1() {
  const input = document.getElementById("admin-password");
  const errorEl = document.getElementById("admin-password-error");
  const val = input ? input.value.trim() : "";

  if (!val) {
    if (errorEl) {
      errorEl.textContent = "Password is required";
      errorEl.classList.remove("hidden");
    }
    if (input) input.classList.add("error");
    return;
  }

  // Store password for later use in API call
  adminPassword = val;

  // Transition to Step 1
  document.getElementById("step-0").classList.add("hidden");
  document.getElementById("step-1").classList.remove("hidden");
  
  document.getElementById("prog-circle-0").innerHTML = "✓";
  document.getElementById("prog-circle-1").classList.add("active");
  document.getElementById("prog-line-0").classList.add("active");

  // Setup radio highlights, mobile format, single selects, other inputs
  setupQuoteRadios();
  setupQuoteMobile();
  setupOtherCheckboxQuote("product-other", "product-other-wrap", "product-other-input");
  setupOtherCheckboxQuote("service-other", "service-other-wrap", "service-other-input");
  enableSingleSelectCheckboxesQuote("product-checkbox-grid");
  enableSingleSelectCheckboxesQuote("service-checkbox-grid");
}

function goToStep2() {
  if (!validateStep1()) return;

  const service = document.querySelector('input[name="customerService"]:checked').value;
  
  document.getElementById("step-1").classList.add("hidden");
  
  if (service === "Service/Repair") {
    document.getElementById("step-2b").classList.remove("hidden");
  } else {
    // Buy New, Buy Used, Sell Used
    const badge = document.getElementById("step-2a-badge");
    if (badge) badge.textContent = service;
    document.getElementById("step-2a").classList.remove("hidden");
  }

  document.getElementById("prog-circle-1").innerHTML = "✓";
  document.getElementById("prog-circle-2").classList.add("active");
  document.getElementById("prog-line-1").classList.add("active");
  
  window.scrollTo(0, 0);
}

function goBackToStep1() {
  document.getElementById("step-2a").classList.add("hidden");
  document.getElementById("step-2b").classList.add("hidden");
  document.getElementById("step-1").classList.remove("hidden");

  document.getElementById("prog-circle-1").innerHTML = "1";
  document.getElementById("prog-circle-2").classList.remove("active");
  document.getElementById("prog-line-1").classList.remove("active");
  
  window.scrollTo(0, 0);
}

// ── SETUP & UI HELPERS ──

function setupQuoteRadios() {
  document.querySelectorAll('input[name="customerService"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      document.querySelectorAll('#step-1 .radio-card').forEach((card) => card.classList.remove("selected"));
      radio.closest(".radio-card").classList.add("selected");

      const errorEl = document.getElementById("customerService-error");
      if (errorEl) {
        errorEl.textContent = "";
        errorEl.classList.add("hidden");
      }
      
      // Auto advance for better UX
      if (isStep1ValidSilent()) {
        goToStep2();
      }
    });
  });
}

function setupQuoteMobile() {
  const mob = document.getElementById("customerMobile");
  if (mob) {
    mob.addEventListener("input", () => {
      mob.value = mob.value.replace(/\D/g, "").slice(0, 10);
    });
  }
}

function setupOtherCheckboxQuote(checkboxId, wrapId, inputId) {
  const cb = document.getElementById(checkboxId);
  const wrap = document.getElementById(wrapId);
  const input = document.getElementById(inputId);
  if (!cb || !wrap || !input) return;

  cb.addEventListener("change", () => {
    if (cb.checked) {
      wrap.classList.remove("hidden");
      input.focus();
    } else {
      wrap.classList.add("hidden");
      input.value = "";
    }
  });
}

function enableSingleSelectCheckboxesQuote(gridId) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  const checkboxes = grid.querySelectorAll('input[type="checkbox"]');

  checkboxes.forEach((cb) => {
    cb.addEventListener("change", (e) => {
      if (e.target.checked) {
        checkboxes.forEach((other) => {
          if (other !== e.target) {
            other.checked = false;
            // Also hide 'other' input if it was unchecked
            if (other.id === "product-other") document.getElementById("product-other-wrap").classList.add("hidden");
            if (other.id === "service-other") document.getElementById("service-other-wrap").classList.add("hidden");
          }
        });
      }
      // Clear errors
      const errorId = gridId === "product-checkbox-grid" ? "products-error" : "services-error";
      clearFieldErrorQuote(errorId);
    });
  });
}

// ── VALIDATION ──

function validateStep1() {
  let valid = true;
  const name = document.getElementById("customerName").value.trim();
  const mobile = document.getElementById("customerMobile").value.trim();
  const address = document.getElementById("customerAddress").value.trim();
  const service = document.querySelector('input[name="customerService"]:checked');

  document.querySelectorAll(".field-error").forEach((el) => { el.textContent = ""; el.classList.add("hidden"); });
  document.querySelectorAll(".error").forEach((el) => el.classList.remove("error"));

  if (!name) { showFieldErrorQuote("customerName", "customerName-error", "Name is required"); valid = false; }
  if (!mobile || mobile.length !== 10) { showFieldErrorQuote("customerMobile", "customerMobile-error", "Enter a valid 10-digit number"); valid = false; }
  if (!address) { showFieldErrorQuote("customerAddress", "customerAddress-error", "Address is required"); valid = false; }
  if (!service) {
    const el = document.getElementById("customerService-error");
    if (el) { el.textContent = "Please select a service type"; el.classList.remove("hidden"); }
    valid = false;
  }
  return valid;
}

function isStep1ValidSilent() {
  const name = document.getElementById("customerName").value.trim();
  const mobile = document.getElementById("customerMobile").value.trim();
  const address = document.getElementById("customerAddress").value.trim();
  const service = document.querySelector('input[name="customerService"]:checked');
  return name && mobile.length === 10 && address && service;
}

function showFieldErrorQuote(fieldId, errorId, message) {
  const field = document.getElementById(fieldId);
  if (field) field.classList.add("error");
  const el = document.getElementById(errorId);
  if (el) {
    el.textContent = message;
    el.classList.remove("hidden");
  }
}

function clearFieldErrorQuote(errorId) {
  const el = document.getElementById(errorId);
  if (el) {
    el.textContent = "";
    el.classList.add("hidden");
  }
}

// ── SUBMISSION ──

async function createQuote(type) {
  // Validate Step 2 fields
  let items = [];
  let brands = "";
  let description = "";
  let offerPrice = "";

  if (type === "product") {
    document.querySelectorAll('input[name="products"]:checked').forEach(cb => {
      if (cb.value === "Other") {
        const otherVal = document.getElementById("product-other-input").value.trim();
        if (otherVal) items.push(otherVal);
      } else {
        items.push(cb.value);
      }
    });
    brands = document.getElementById("productBrands").value.trim();
    description = document.getElementById("productDescription").value.trim();
    offerPrice = document.getElementById("productOfferPrice").value.trim();

    if (items.length === 0) {
      const el = document.getElementById("products-error");
      if (el) { el.textContent = "Please select a product"; el.classList.remove("hidden"); }
      return;
    }
    if (!offerPrice) {
      showFieldErrorQuote("productOfferPrice", "productOfferPrice-error", "Offer price is required");
      return;
    }
  } else {
    document.querySelectorAll('input[name="services"]:checked').forEach(cb => {
      if (cb.value === "Other") {
        const otherVal = document.getElementById("service-other-input").value.trim();
        if (otherVal) items.push(otherVal);
      } else {
        items.push(cb.value);
      }
    });
    description = document.getElementById("serviceDescription").value.trim();
    offerPrice = document.getElementById("serviceOfferPrice").value.trim();

    if (items.length === 0) {
      const el = document.getElementById("services-error");
      if (el) { el.textContent = "Please select a service"; el.classList.remove("hidden"); }
      return;
    }
    if (!offerPrice) {
      showFieldErrorQuote("serviceOfferPrice", "serviceOfferPrice-error", "Offer price is required");
      return;
    }
  }

  const btn = document.getElementById(`btn-create-quote-${type}`);
  const btnText = document.getElementById(`btn-text-${type}`);
  btn.disabled = true;
  btnText.textContent = "Creating…";
  btn.classList.add("btn-loading");

  const serviceType = document.querySelector('input[name="customerService"]:checked').value;

  const payload = {
    action: "create_quote",
    password: adminPassword,
    customerName: document.getElementById("customerName").value.trim(),
    customerMobile: document.getElementById("customerMobile").value.trim(),
    customerAddress: document.getElementById("customerAddress").value.trim(),
    customerService: serviceType,
    selectedItems: items,
    brands: brands,
    offerPrice: offerPrice,
    description: description,
  };

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
      throw new Error("Invalid response from server");
    }

    if (!result.success) throw new Error(result.error || "Failed to create quote");

    // Show success
    const quoteId = result.quoteId;
    const quoteLink = `${SITE_DOMAIN}/quote.html?id=${quoteId}#id=${quoteId}`;

    // Store quote data for sharing (only non-personal fields)
    lastCreatedQuoteData = {
      quoteId: quoteId,
      service: payload.customerService,
      items: payload.selectedItems.join(", "),
      brands: payload.brands,
      description: payload.description,
      offerPrice: payload.offerPrice,
    };

    document.getElementById("step-2a").classList.add("hidden");
    document.getElementById("step-2b").classList.add("hidden");
    
    document.getElementById("quote-success").classList.remove("hidden");
    document.getElementById("success-quote-id").textContent = quoteId;
    document.getElementById("success-quote-link").textContent = quoteLink;

    // Store link for copy/share
    window._quoteLink = quoteLink;
    window._quoteId = quoteId;

    showToast("Quote created successfully!", "success");
    window.scrollTo(0, 0);
  } catch (err) {
    btn.disabled = false;
    btnText.textContent = "Create Quote & Get Link";
    btn.classList.remove("btn-loading");
    showToast(err.message || "Failed to create quote.", "error");
    console.error("Create quote error:", err);
  }
}

function copyQuoteLink() {
  const link = window._quoteLink;
  if (!link) return;
  navigator.clipboard
    .writeText(link)
    .then(() => showToast("Link copied!", "success"))
    .catch(() => showToast("Failed to copy.", "error"));
}

function shareViaWhatsApp() {
  const link = window._quoteLink;
  const quoteId = window._quoteId;
  if (!link) return;
  const msg = `Hi! Here is your quote from Real Amount (${quoteId}). Please review the details and complete the payment:\n${link}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
}

// Share order details via WhatsApp (no personal info — only service details)
function shareOrderDetails() {
  if (!lastCreatedQuoteData) return;
  const d = lastCreatedQuoteData;
  let msg = `📋 *Real Amount — Order Details*\n\n`;
  msg += `🔖 Quote ID: ${d.quoteId}\n`;
  if (d.service) msg += `📌 Service: ${d.service}\n`;
  if (d.items) msg += `📦 Items: ${d.items}\n`;
  if (d.brands) msg += `🏷️ Brands: ${d.brands}\n`;
  if (d.description) msg += `📝 Description: ${d.description}\n`;
  if (d.offerPrice) msg += `💰 Price Offered: ${d.offerPrice}\n`;
  msg += `\n🔗 Quote Link: ${window._quoteLink}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
}

// Share order to seller (same details, different intro text)
function shareOrderToSeller() {
  if (!lastCreatedQuoteData) return;
  const d = lastCreatedQuoteData;
  let msg = `📋 *Real Amount — Customer Requirement*\n\n`;
  msg += `🔖 Quote ID: ${d.quoteId}\n`;
  if (d.service) msg += `📌 Service: ${d.service}\n`;
  if (d.items) msg += `📦 Items: ${d.items}\n`;
  if (d.brands) msg += `🏷️ Brands: ${d.brands}\n`;
  if (d.description) msg += `📝 Description: ${d.description}\n`;
  if (d.offerPrice) msg += `💰 Price Offered: ${d.offerPrice}\n`;
  msg += `\nPlease share your best offer for this requirement.`;
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
}

function createAnother() {
  // Reload the page is easiest way to reset entirely
  window.location.reload();
}


// ═══════════════════════════════════════════════════
// QUOTE VIEW PAGE LOGIC (quote.html)
// ═══════════════════════════════════════════════════
let currentQuote = null;
let isEditMode = false;

function initQuotePage() {
  const params = new URLSearchParams(window.location.search);
  let quoteId = params.get("id");
  
  // Fallback to check URL hash if query param was dropped
  if (!quoteId && window.location.hash) {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    quoteId = hashParams.get("id");
  }

  if (!quoteId) {
    showQuoteError("No quote ID provided in the URL.");
    return;
  }

  loadQuote(quoteId);
}

async function loadQuote(quoteId) {
  const loadingEl = document.getElementById("quote-loading");
  const contentEl = document.getElementById("quote-content");

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ action: "get_quote", quoteId: quoteId }),
    });
    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      throw new Error("Invalid response");
    }

    if (!result.success || !result.quote) {
      throw new Error(result.error || "Quote not found");
    }

    currentQuote = result.quote;

    // Hide loading
    if (loadingEl) loadingEl.classList.add("hidden");

    // Check if already paid
    if (currentQuote["Status"] === "Paid") {
      showAlreadyPaid();
      return;
    }

    if (contentEl) contentEl.classList.remove("hidden");
    renderQuote(currentQuote, quoteId);
  } catch (err) {
    showQuoteError(err.message);
  }
}

// Render only NON-personal details (service type, items, brands, description, price)
function renderQuote(quote, quoteId) {
  const idEl = document.getElementById("quote-id-display");
  if (idEl) idEl.textContent = quoteId;

  const detailsEl = document.getElementById("quote-details");
  if (!detailsEl) return;

  // Only show service-related fields — NO name, mobile, address
  const fields = [
    { label: "Service Type", key: "Service Requested" },
    { label: "Items / Category", key: "Items / Category" },
    { label: "Brands", key: "Brands (if any)" },
    { label: "Description", key: "Description" },
    { label: "Price Offered", key: "Price Offered" },
  ];

  let html = "";
  for (const field of fields) {
    const value = quote[field.key];
    if (value && value !== "" && value !== "—") {
      html += `
        <div class="quote-row">
          <span class="quote-label">${field.label}</span>
          <span class="quote-value">${escapeHtml(String(value))}</span>
        </div>
      `;
    }
  }

  if (!html) {
    html = '<p style="color: var(--text-muted); text-align: center; padding: 1rem 0;">No details available.</p>';
  }

  detailsEl.innerHTML = html;

  // Pre-fill edit fields
  const editItems = document.getElementById("edit-items");
  const editBrands = document.getElementById("edit-brands");
  const editDesc = document.getElementById("edit-description");
  const editPrice = document.getElementById("edit-price");

  if (editItems) editItems.value = quote["Items / Category"] || "";
  if (editBrands) editBrands.value = quote["Brands (if any)"] || "";
  if (editDesc) editDesc.value = quote["Description"] || "";
  if (editPrice) editPrice.value = quote["Price Offered"] || "";
}

function toggleEditMode() {
  const editSection = document.getElementById("quote-edit-section");
  const detailsSection = document.getElementById("quote-details");
  const editBtn = document.getElementById("edit-quote-btn");

  if (!isEditMode) {
    // Enter edit mode
    isEditMode = true;
    if (editSection) editSection.classList.remove("hidden");
    if (detailsSection) detailsSection.classList.add("hidden");
    if (editBtn) editBtn.textContent = "✕ Cancel Edit";
  } else {
    // Exit edit mode
    isEditMode = false;
    if (editSection) editSection.classList.add("hidden");
    if (detailsSection) detailsSection.classList.remove("hidden");
    if (editBtn) editBtn.textContent = "✏️ Edit Details";
  }
}

function confirmAndPay() {
  // If in edit mode, apply edits to currentQuote first
  if (isEditMode) {
    const editItems = document.getElementById("edit-items");
    const editBrands = document.getElementById("edit-brands");
    const editDesc = document.getElementById("edit-description");
    const editPrice = document.getElementById("edit-price");

    if (editItems) currentQuote["Items / Category"] = editItems.value.trim();
    if (editBrands) currentQuote["Brands (if any)"] = editBrands.value.trim();
    if (editDesc) currentQuote["Description"] = editDesc.value.trim();
    if (editPrice) currentQuote["Price Offered"] = editPrice.value.trim();

    // Re-render with updated data
    const quoteId = currentQuote["Quote ID"];
    renderQuote(currentQuote, quoteId);

    // Exit edit mode
    isEditMode = false;
    const editSection = document.getElementById("quote-edit-section");
    const detailsSection = document.getElementById("quote-details");
    const editBtn = document.getElementById("edit-quote-btn");
    if (editSection) editSection.classList.add("hidden");
    if (detailsSection) detailsSection.classList.remove("hidden");
    if (editBtn) editBtn.textContent = "✏️ Edit Details";
  }

  // Hide the Edit/Confirm buttons, show payment footer
  const actionBtns = document.getElementById("quote-action-btns");
  const footer = document.getElementById("quote-footer");
  if (actionBtns) actionBtns.classList.add("hidden");
  if (footer) footer.classList.remove("hidden");

  // Scroll to payment
  if (footer) footer.scrollIntoView({ behavior: "smooth", block: "center" });
}

function showQuoteError(msg) {
  const loadingEl = document.getElementById("quote-loading");
  const errorEl = document.getElementById("quote-error");
  const msgEl = document.getElementById("quote-error-msg");

  if (loadingEl) loadingEl.classList.add("hidden");
  if (errorEl) errorEl.classList.remove("hidden");
  if (msgEl) msgEl.textContent = msg || "Quote not found.";
}

function showAlreadyPaid() {
  const loadingEl = document.getElementById("quote-loading");
  const contentEl = document.getElementById("quote-content");
  const successEl = document.getElementById("quote-paid-success");

  if (loadingEl) loadingEl.classList.add("hidden");
  if (contentEl) contentEl.classList.add("hidden");
  if (successEl) {
    successEl.classList.remove("hidden");
    const refEl = document.getElementById("paid-ref-id");
    if (refEl) refEl.textContent = currentQuote["Quote ID"] || "—";

    // Update text for already-paid
    const h2 = successEl.querySelector("h2");
    if (h2) h2.textContent = "Already Paid";
    const p = successEl.querySelector("p");
    if (p) p.textContent = "This quote has already been paid and confirmed.";
  }
}

// ── Razorpay ──
function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (typeof Razorpay !== "undefined") return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.head.appendChild(script);
  });
}

async function payQuote() {
  if (!currentQuote) return;

  const btn = document.getElementById("pay-btn");
  btn.disabled = true;
  btn.textContent = "Processing Payment…";

  try {
    await loadRazorpay();

    // Create Razorpay order
    const orderResponse = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ action: "create_razorpay_order" }),
    });

    const orderText = await orderResponse.text();
    let orderResult;
    try {
      orderResult = JSON.parse(orderText);
    } catch {
      throw new Error("Invalid order response");
    }

    if (!orderResult.success || !orderResult.order) {
      throw new Error(orderResult.error || "Failed to create order");
    }

    const orderData = orderResult.order;
    const quoteId = currentQuote["Quote ID"];

    const options = {
      key: orderData.key || "rzp_test_T5neItIIPIHISX",
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Real Amount",
      description: "Service Lead Fee",
      order_id: orderData.id,
      handler: async function (response) {
        btn.textContent = "Confirming…";

        try {
          // Include any edits the customer made
          const payPayload = {
            action: "pay_quote",
            quoteId: quoteId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          };

          // If customer edited fields, include them
          if (currentQuote._edited) {
            payPayload.editedItems = currentQuote["Items / Category"] || "";
            payPayload.editedBrands = currentQuote["Brands (if any)"] || "";
            payPayload.editedDescription = currentQuote["Description"] || "";
            payPayload.editedPrice = currentQuote["Price Offered"] || "";
          }

          const payResponse = await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify(payPayload),
          });

          const payText = await payResponse.text();
          let payResult;
          try {
            payResult = JSON.parse(payText);
          } catch {
            throw new Error("Invalid payment response");
          }

          if (!payResult.success) throw new Error(payResult.error || "Payment confirmation failed");

          // Show success
          const contentEl = document.getElementById("quote-content");
          const successEl = document.getElementById("quote-paid-success");

          if (contentEl) contentEl.classList.add("hidden");
          if (successEl) {
            successEl.classList.remove("hidden");
            const refEl = document.getElementById("paid-ref-id");
            if (refEl) refEl.textContent = quoteId;
          }

          showToast("Payment successful!", "success");
        } catch (err) {
          btn.disabled = false;
          btn.textContent = "Pay ₹50 & Confirm";
          showToast("Payment recorded but confirmation failed. Contact support with your payment ID.", "error");
          console.error(err);
        }
      },
      prefill: {
        name: currentQuote["Customer Name"] || "",
        contact: currentQuote["Mobile Number"] || "",
      },
      theme: {
        color: "#1a3c5e",
      },
      modal: {
        ondismiss: function () {
          btn.disabled = false;
          btn.textContent = "Pay ₹50 & Confirm";
          showToast("Payment cancelled.", "info");
        },
      },
    };

    const rzp = new Razorpay(options);
    rzp.open();
  } catch (err) {
    btn.disabled = false;
    btn.textContent = "Pay ₹50 & Confirm";
    showToast(err.message || "Failed to initiate payment.", "error");
    console.error("Payment error:", err);
  }
}

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════
function escapeHtml(str) {
  if (!str || typeof str !== "string") return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ═══════════════════════════════════════════════════
// AUTO-INIT
// ═══════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  // If we're on the quote view page (has ?id= param), init it
  if (document.getElementById("quote-loading")) {
    initQuotePage();
  }

  // If we're on the create-quote page, Enter key on password
  const pwInput = document.getElementById("admin-password");
  if (pwInput) {
    pwInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") verifyPasswordAndGoToStep1();
    });
  }
});
