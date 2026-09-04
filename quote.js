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

function verifyPassword() {
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

  // Hide password gate, show form
  document.getElementById("password-gate").classList.add("hidden");
  document.getElementById("quote-form").classList.remove("hidden");

  // Setup radio highlight
  setupQuoteRadios();
  setupQuoteMobile();
}

function setupQuoteRadios() {
  document.querySelectorAll('input[name="q-customerService"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      document.querySelectorAll('#quote-form .radio-card').forEach((card) => card.classList.remove("selected"));
      radio.closest(".radio-card").classList.add("selected");

      const errorEl = document.getElementById("q-customerService-error");
      if (errorEl) {
        errorEl.textContent = "";
        errorEl.classList.add("hidden");
      }
    });
  });
}

function setupQuoteMobile() {
  const mob = document.getElementById("q-customerMobile");
  if (mob) {
    mob.addEventListener("input", () => {
      mob.value = mob.value.replace(/\D/g, "").slice(0, 10);
    });
  }
}

function validateQuoteForm() {
  let valid = true;

  const name = document.getElementById("q-customerName").value.trim();
  const mobile = document.getElementById("q-customerMobile").value.trim();
  const address = document.getElementById("q-customerAddress").value.trim();
  const service = document.querySelector('input[name="q-customerService"]:checked');

  // Clear previous errors
  document.querySelectorAll(".field-error").forEach((el) => {
    el.textContent = "";
    el.classList.add("hidden");
  });
  document.querySelectorAll(".error").forEach((el) => el.classList.remove("error"));

  if (!name) {
    showFieldError("q-customerName", "q-customerName-error", "Name is required");
    valid = false;
  }
  if (!mobile || mobile.length !== 10) {
    showFieldError("q-customerMobile", "q-customerMobile-error", "Enter a valid 10-digit number");
    valid = false;
  }
  if (!address) {
    showFieldError("q-customerAddress", "q-customerAddress-error", "Address is required");
    valid = false;
  }
  if (!service) {
    const el = document.getElementById("q-customerService-error");
    if (el) {
      el.textContent = "Please select a service type";
      el.classList.remove("hidden");
    }
    valid = false;
  }

  return valid;
}

function showFieldError(fieldId, errorId, message) {
  const field = document.getElementById(fieldId);
  if (field) field.classList.add("error");
  const el = document.getElementById(errorId);
  if (el) {
    el.textContent = message;
    el.classList.remove("hidden");
  }
}

async function createQuote() {
  if (!validateQuoteForm()) {
    showToast("Please fill all required fields.", "error");
    return;
  }

  const btn = document.getElementById("create-quote-btn");
  const btnText = document.getElementById("create-quote-text");
  btn.disabled = true;
  btnText.textContent = "Creating…";
  btn.classList.add("btn-loading");

  const service = document.querySelector('input[name="q-customerService"]:checked');
  const items = document.getElementById("q-items").value.trim();

  const payload = {
    action: "create_quote",
    password: adminPassword,
    customerName: document.getElementById("q-customerName").value.trim(),
    customerMobile: document.getElementById("q-customerMobile").value.trim(),
    customerAddress: document.getElementById("q-customerAddress").value.trim(),
    customerService: service ? service.value : "",
    selectedItems: items ? items.split(",").map((s) => s.trim()).filter(Boolean) : [],
    brands: document.getElementById("q-brands").value.trim(),
    offerPrice: document.getElementById("q-offerPrice").value.trim(),
    description: document.getElementById("q-description").value.trim(),
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
    const quoteLink = `${SITE_DOMAIN}/quote.html?id=${quoteId}`;

    document.getElementById("quote-form").classList.add("hidden");
    document.getElementById("quote-success").classList.remove("hidden");
    document.getElementById("success-quote-id").textContent = quoteId;
    document.getElementById("success-quote-link").textContent = quoteLink;

    // Store link for copy/share
    window._quoteLink = quoteLink;
    window._quoteId = quoteId;

    showToast("Quote created successfully!", "success");
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

function createAnother() {
  document.getElementById("quote-success").classList.add("hidden");
  document.getElementById("quote-form").classList.remove("hidden");

  // Clear fields
  document.querySelectorAll('#quote-form input[type="text"], #quote-form input[type="tel"], #quote-form textarea').forEach((el) => (el.value = ""));
  document.querySelectorAll('#quote-form input[type="radio"]').forEach((el) => (el.checked = false));
  document.querySelectorAll('#quote-form .radio-card').forEach((el) => el.classList.remove("selected"));
}

// ═══════════════════════════════════════════════════
// QUOTE VIEW PAGE LOGIC (quote.html)
// ═══════════════════════════════════════════════════
let currentQuote = null;

function initQuotePage() {
  const params = new URLSearchParams(window.location.search);
  const quoteId = params.get("id");

  if (!quoteId) {
    showQuoteError("No quote ID provided in the URL.");
    return;
  }

  loadQuote(quoteId);
}

async function loadQuote(quoteId) {
  const loadingEl = document.getElementById("quote-loading");
  const errorEl = document.getElementById("quote-error");
  const contentEl = document.getElementById("quote-content");

  try {
    // For GET requests, we need to hit the Apps Script URL directly with query params
    // But since we go through the Vercel rewrite, we append query params
    const response = await fetch(`${APPS_SCRIPT_URL}?action=get_quote&id=${encodeURIComponent(quoteId)}`);
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

    // Hide loading, show content
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

function renderQuote(quote, quoteId) {
  const idEl = document.getElementById("quote-id-display");
  if (idEl) idEl.textContent = quoteId;

  const detailsEl = document.getElementById("quote-details");
  if (!detailsEl) return;

  const fields = [
    { label: "Customer Name", key: "Customer Name" },
    { label: "Mobile Number", key: "Mobile Number" },
    { label: "Address", key: "Address" },
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

  detailsEl.innerHTML = html;
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
          const payResponse = await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({
              action: "pay_quote",
              quoteId: quoteId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            }),
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
      if (e.key === "Enter") verifyPassword();
    });
  }
});
