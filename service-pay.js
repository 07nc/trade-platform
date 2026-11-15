/* ═══════════════════════════════════════════════════
   REAL AMOUNT — Service Payment Bill Logic (service-pay.js)
   Handles dynamic parameters and standard Razorpay checkout.
   ═══════════════════════════════════════════════════ */

const APPS_SCRIPT_URL = "/api/submit";

// State
let billData = {
  service: "AC Service / Repair",
  qty: 1,
  appNo: "",
  date: "",
  amount: 500,
  shopkeeper: "",
  mobile: "",
  note: "",
};

// ── TOAST HELPER ──
function showToast(message, type = "info") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 3500);
}

// ── EXTRACT & POPULATE URL PARAMETERS ──
function initServiceBill() {
  const params = new URLSearchParams(window.location.search);

  // Service Name
  const serviceParam = params.get("service") || params.get("title") || params.get("type");
  if (serviceParam) billData.service = serviceParam.trim();

  // Quantity / Numbers of Services
  const qtyParam = params.get("qty") || params.get("count") || params.get("numbers") || params.get("n");
  if (qtyParam) {
    const parsedQty = parseInt(qtyParam, 10);
    billData.qty = isNaN(parsedQty) || parsedQty < 1 ? 1 : parsedQty;
  }

  // Application Number
  const appNoParam = params.get("appNo") || params.get("ref") || params.get("id") || params.get("applicationNumber");
  if (appNoParam) {
    billData.appNo = appNoParam.trim();
  } else {
    const rand = Math.floor(1000 + Math.random() * 9000);
    const today = new Date();
    const ymd = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}`;
    billData.appNo = `RA-SRV-${ymd}-${rand}`;
  }

  // Date Generated
  const dateParam = params.get("date") || params.get("dt");
  if (dateParam) {
    billData.date = dateParam.trim();
  } else {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    billData.date = `${day} ${months[today.getMonth()]} ${today.getFullYear()}`;
  }

  // Total Amount
  const amtParam = params.get("amt") || params.get("amount") || params.get("price");
  if (amtParam) {
    const parsedAmt = parseFloat(amtParam.replace(/[^0-9.]/g, ""));
    billData.amount = isNaN(parsedAmt) || parsedAmt <= 0 ? 500 : Math.round(parsedAmt);
  }

  // Shopkeeper / Partner Name
  const partnerParam = params.get("shopkeeper") || params.get("partner") || params.get("merchant");
  if (partnerParam) billData.shopkeeper = partnerParam.trim();

  // Mobile
  const mobileParam = params.get("mobile") || params.get("phone");
  if (mobileParam) billData.mobile = mobileParam.trim();

  // Service Note / Remark
  const noteParam = params.get("note") || params.get("remark");
  if (noteParam) billData.note = noteParam.trim();

  // Render to DOM
  renderBillToDOM();
}

// ── RENDER TO DOM ──
function renderBillToDOM() {
  // Service name & category
  const serviceNameEl = document.getElementById("display-service-name");
  if (serviceNameEl) serviceNameEl.textContent = billData.service;

  // Icon mapping
  const serviceImg = document.getElementById("service-img");
  const sLower = billData.service.toLowerCase();
  let iconUrl = "https://img.icons8.com/color/48/maintenance.png";
  let categoryLabel = "Service & Maintenance";

  if (sLower.includes("ac") || sLower.includes("air")) {
    iconUrl = "https://img.icons8.com/color/48/air-conditioner.png";
    categoryLabel = "Air Conditioner Service";
  } else if (sLower.includes("fridge") || sLower.includes("refrigerat")) {
    iconUrl = "https://img.icons8.com/color/48/fridge.png";
    categoryLabel = "Refrigerator Repair";
  } else if (sLower.includes("tv") || sLower.includes("led")) {
    iconUrl = "https://img.icons8.com/color/48/tv.png";
    categoryLabel = "Television & LED";
  } else if (sLower.includes("wash")) {
    iconUrl = "https://img.icons8.com/color/48/washing-machine.png";
    categoryLabel = "Washing Machine Service";
  } else if (sLower.includes("plumb")) {
    iconUrl = "https://img.icons8.com/color/48/plumbing.png";
    categoryLabel = "Plumbing Services";
  } else if (sLower.includes("car")) {
    iconUrl = "https://img.icons8.com/color/48/car-service.png";
    categoryLabel = "Automotive Services";
  } else if (sLower.includes("bike") || sLower.includes("wheeler")) {
    iconUrl = "https://img.icons8.com/color/48/motorcycle.png";
    categoryLabel = "Two Wheeler Service";
  } else if (sLower.includes("electr")) {
    iconUrl = "https://img.icons8.com/color/48/lightning-bolt.png";
    categoryLabel = "Electrical Works";
  } else if (sLower.includes("ro") || sLower.includes("water")) {
    iconUrl = "https://img.icons8.com/color/48/water-filter.png";
    categoryLabel = "Water Purifier Service";
  }

  if (serviceImg) serviceImg.src = iconUrl;
  const catLabelEl = document.getElementById("display-category-label");
  if (catLabelEl) catLabelEl.textContent = categoryLabel;

  // Numbers of Services & Label
  const labelQtyEl = document.getElementById("label-qty-text");
  if (labelQtyEl) {
    if (sLower.includes("ac") || sLower.includes("air")) {
      labelQtyEl.textContent = "Numbers of AC Services";
    } else {
      labelQtyEl.textContent = `Numbers of ${billData.service} Services`;
    }
  }

  const qtyEl = document.getElementById("display-service-qty");
  if (qtyEl) {
    qtyEl.textContent = `${billData.qty} ${billData.qty === 1 ? "Service" : "Services"}`;
  }

  // Application Number
  const appNoEl = document.getElementById("display-app-no");
  if (appNoEl) appNoEl.textContent = billData.appNo;

  // Date Generated
  const dateEl = document.getElementById("display-date-generated");
  if (dateEl) dateEl.textContent = billData.date;

  // Shopkeeper / Partner
  const shopRow = document.getElementById("row-shopkeeper");
  const shopEl = document.getElementById("display-shopkeeper-name");
  if (billData.shopkeeper) {
    if (shopEl) shopEl.textContent = billData.shopkeeper;
    if (shopRow) shopRow.classList.remove("hidden");
  } else {
    if (shopEl) shopEl.textContent = "Registered Service Partner";
  }

  // Notes
  const noteRow = document.getElementById("row-note");
  const noteEl = document.getElementById("display-service-note");
  if (billData.note) {
    if (noteEl) noteEl.textContent = billData.note;
    if (noteRow) noteRow.classList.remove("hidden");
  }

  // Total Amount (Card)
  const amtEl = document.getElementById("display-total-amount");
  if (amtEl) amtEl.textContent = billData.amount.toLocaleString("en-IN");

  // Total Amount (Button)
  const btnAmtEl = document.getElementById("btn-pay-amount");
  if (btnAmtEl) btnAmtEl.textContent = billData.amount.toLocaleString("en-IN");
}

// ── COPY HELPER ──
function copyAppNumber() {
  if (!billData.appNo) return;
  navigator.clipboard.writeText(billData.appNo).then(() => {
    showToast(`Copied Application No: ${billData.appNo}`, "success");
  }).catch(() => {
    showToast(`Application No: ${billData.appNo}`, "info");
  });
}

// ── RAZORPAY CHECKOUT ──
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

async function payWithRazorpay() {
  const btn = document.getElementById("pay-btn");
  const origHTML = btn ? btn.innerHTML : "";

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span style="display:inline-block; animation: spin 1s infinite;">⏳</span> Processing Payment…`;
  }

  try {
    await loadRazorpay();

    // 1. Create order on Apps Script backend
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        action: "create_razorpay_order",
        amount: billData.amount,
      }),
    });

    const resText = await response.text();
    let orderResult;
    try {
      orderResult = JSON.parse(resText);
    } catch {
      throw new Error("Invalid response from server");
    }

    if (!orderResult.success || !orderResult.order) {
      throw new Error(orderResult.error || "Order creation failed");
    }

    const orderData = orderResult.order;

    // 2. Open Razorpay Modal
    const options = {
      key: orderData.key || "rzp_live_T8Alm8tnAkFQzi",
      amount: orderData.amount,
      currency: orderData.currency || "INR",
      name: "Real Amount",
      description: `${billData.service} (${billData.appNo})`,
      order_id: orderData.id,
      handler: function (paymentResponse) {
        // Success
        showSuccessScreen(paymentResponse.razorpay_payment_id);
      },
      prefill: {
        name: billData.shopkeeper || "Service Partner",
        contact: billData.mobile || "",
      },
      theme: {
        color: "#1a3c5e",
      },
      modal: {
        ondismiss: function () {
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = origHTML;
          }
          showToast("Payment window closed.", "info");
        },
      },
    };

    const rzp = new Razorpay(options);
    rzp.open();
  } catch (err) {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origHTML;
    }
    showToast(err.message || "Failed to initialize payment gateway.", "error");
    console.error("Razorpay error:", err);
  }
}

// ── SUCCESS SCREEN ──
function showSuccessScreen(paymentRef) {
  const billBody = document.getElementById("bill-body");
  const successScreen = document.getElementById("bill-success-screen");
  const badge = document.getElementById("bill-status-badge");

  if (billBody) billBody.classList.add("hidden");
  if (successScreen) successScreen.classList.remove("hidden");

  if (badge) {
    badge.textContent = "Payment Confirmed";
    badge.style.color = "#16a34a";
  }

  const refEl = document.getElementById("success-ref-no");
  if (refEl) refEl.textContent = billData.appNo || paymentRef || "CONFIRMED";

  const amtEl = document.getElementById("success-amount-display");
  if (amtEl) amtEl.textContent = `₹${billData.amount.toLocaleString("en-IN")}`;

  showToast("Payment completed successfully!", "success");
}

// ── INITIALIZE ON LOAD ──
document.addEventListener("DOMContentLoaded", () => {
  initServiceBill();
});
