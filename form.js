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

  // ── Auto-handle URL parameters (?type= and ?category=) ──
  handlePresetURLParams();

  // ── Partner Product Brand Cards dynamic update ──
  document.querySelectorAll('input[name="products"]').forEach((cb) => {
    cb.addEventListener("change", () => {
      if (accountType === "Partner" && selectedBusinessType === "Product Sale (Retail)") {
        renderPartnerCategoryBrandCards();
      }
    });
  });

  const prodOtherInp = document.getElementById("product-other-input");
  if (prodOtherInp) {
    prodOtherInp.addEventListener("input", () => {
      if (accountType === "Partner" && selectedBusinessType === "Product Sale (Retail)") {
        const otherCb = document.getElementById("product-other");
        if (otherCb && otherCb.checked) {
          renderPartnerCategoryBrandCards();
        }
      }
    });
  }
});

// ── CANONICAL CATEGORIES FOR DIRECT SELECTION ──
const CANONICAL_SERVICES = [
  { name: "Ac Service/Repair", icon: "https://img.icons8.com/color/48/air-conditioner.png" },
  { name: "Refrigerator Repair", icon: "https://img.icons8.com/color/48/fridge.png" },
  { name: "Tv/Led Repair", icon: "https://img.icons8.com/color/48/tv.png" },
  { name: "Mobile Repair", icon: "https://img.icons8.com/color/48/smartphone.png" },
  { name: "Laptop Repair", icon: "https://img.icons8.com/color/48/laptop.png" },
  { name: "Plumber", icon: "https://img.icons8.com/color/48/plumbing.png" },
  { name: "Car Service", icon: "https://img.icons8.com/color/48/car-service.png" },
  { name: "Two Wheeler Service", icon: "https://img.icons8.com/color/48/motorcycle.png" },
  { name: "Professional Services (CA/Tax Advocate/Doctor)", icon: "https://img.icons8.com/color/48/briefcase.png" },
  { name: "Insurance(Life/Health/Vehicle)", icon: "https://img.icons8.com/color/48/shield.png" },
  { name: "Unisex Saloon", icon: "https://img.icons8.com/color/48/barbershop.png" },
  { name: "Banking Services", icon: "https://img.icons8.com/color/48/bank.png" },
  { name: "Auto Dealer", icon: "https://img.icons8.com/color/48/steering-wheel.png" },
  { name: "Electrician", icon: "https://img.icons8.com/color/48/lightning-bolt.png" },
  { name: "Carpenter", icon: "https://img.icons8.com/color/48/saw.png" },
  { name: "Education", icon: "https://img.icons8.com/color/48/graduation-cap.png" },
  { name: "Health Care", icon: "https://img.icons8.com/color/48/hospital.png" },
  { name: "Taxi/Cab Services", icon: "https://img.icons8.com/color/48/taxi.png" },
  { name: "Financial Services", icon: "https://img.icons8.com/color/48/money.png" },
  { name: "Car Washing", icon: "https://img.icons8.com/color/48/car-service.png" },
  { name: "Photographer", icon: "https://img.icons8.com/color/48/camera.png" },
  { name: "Courier Services", icon: "https://img.icons8.com/color/48/truck.png" },
  { name: "Banquet Hall", icon: "https://img.icons8.com/color/48/city-buildings.png" },
  { name: "Real Estate", icon: "https://img.icons8.com/color/48/home.png" }
];

const CANONICAL_PRODUCTS = [
  { name: "Air Conditioner", icon: "https://img.icons8.com/color/48/air-conditioner.png" },
  { name: "Refrigerator", icon: "https://img.icons8.com/color/48/fridge.png" },
  { name: "Led Tv", icon: "https://img.icons8.com/color/48/tv.png" },
  { name: "RO", icon: "https://img.icons8.com/color/48/bottle-of-water.png" },
  { name: "Inverter", icon: "https://img.icons8.com/color/48/car-battery.png" },
  { name: "Oven/OTG/Induction", icon: "https://img.icons8.com/color/48/cooker.png" },
  { name: "Cooler", icon: "https://img.icons8.com/color/48/fan.png" },
  { name: "Washing Machine", icon: "https://img.icons8.com/color/48/washing-machine.png" },
  { name: "Mobile", icon: "https://img.icons8.com/color/48/smartphone.png" },
  { name: "Books and Stationary", icon: "https://img.icons8.com/color/48/books.png" },
  { name: "Kitchen Appliances", icon: "https://img.icons8.com/color/48/kettle.png" },
  { name: "Plywood and Hardware", icon: "https://img.icons8.com/color/48/wood.png" },
  { name: "Automotive", icon: "https://img.icons8.com/color/48/car.png" },
  { name: "Furniture", icon: "https://img.icons8.com/color/48/sofa.png" },
  { name: "Gift Shop", icon: "https://img.icons8.com/color/48/gift.png" },
  { name: "Footwear", icon: "https://img.icons8.com/color/48/trainers.png" },
  { name: "Chemist", icon: "https://img.icons8.com/color/48/pills.png" },
  { name: "Building Material", icon: "https://img.icons8.com/color/48/brick-wall.png" },
  { name: "Agricultural Goods", icon: "https://img.icons8.com/color/48/wheat.png" },
  { name: "Event Management", icon: "https://img.icons8.com/color/48/party-baloons.png" },
  { name: "Catering", icon: "https://img.icons8.com/color/48/food.png" },
  { name: "Sweet Shop", icon: "https://img.icons8.com/color/48/cupcake.png" },
  { name: "Sanitary Store", icon: "https://img.icons8.com/color/48/toilet-bowl.png" },
  { name: "Home Baker", icon: "https://img.icons8.com/color/48/cake.png" },
  { name: "Hardware and Tools", icon: "https://img.icons8.com/color/48/maintenance.png" },
  { name: "Toys/Games", icon: "https://img.icons8.com/color/48/controller.png" },
  { name: "Flowers and Gifts", icon: "https://img.icons8.com/color/48/rose.png" },
  { name: "Boutique", icon: "https://img.icons8.com/color/48/womens-shirt.png" },
  { name: "Home Decor", icon: "https://img.icons8.com/color/48/lamp.png" },
  { name: "Opticals", icon: "https://img.icons8.com/color/48/glasses.png" },
  { name: "Grocery Store", icon: "https://img.icons8.com/color/48/shopping-cart.png" },
  { name: "Spare Parts", icon: "https://img.icons8.com/color/48/gear.png" }
];

// ── POPULAR BRANDS BY PRODUCT CATEGORY (PARTNER ONBOARDING) ──
const POPULAR_CATEGORY_BRANDS = {
  "Air Conditioner": ["Voltas", "Daikin", "LG", "Lloyd", "Blue Star", "Hitachi", "Samsung", "Carrier", "Panasonic", "Godrej", "O General", "Haier", "Mitsubishi"],
  "Refrigerator": ["Samsung", "LG", "Whirlpool", "Haier", "Godrej", "Bosch", "Panasonic", "Voltas Beko", "Kelvinator", "Liebherr"],
  "Led Tv": ["Sony", "Samsung", "LG", "Mi / Xiaomi", "OnePlus", "TCL", "Panasonic", "Vu", "Realme", "Acer", "Hisense", "Toshiba"],
  "RO": ["Kent", "Aquaguard", "Pureit", "Livpure", "Havells", "Blue Star", "AO Smith", "Aqua Fresh", "Zero B"],
  "Inverter": ["Luminous", "Microtek", "Exide", "Amaron", "Livguard", "Su-Kam", "V-Guard", "Okaya"],
  "Oven/OTG/Induction": ["Bajaj", "Philips", "Prestige", "Morphy Richards", "IFB", "Samsung", "LG", "Pigeon", "Usha"],
  "Cooler": ["Symphony", "Bajaj", "Crompton", "Kenstar", "Havells", "Orient", "Usha", "Voltas"],
  "Washing Machine": ["LG", "Samsung", "Whirlpool", "IFB", "Bosch", "Godrej", "Panasonic", "Haier", "Voltas Beko"],
  "Mobile": ["Apple (iPhone)", "Samsung", "OnePlus", "Xiaomi / Redmi", "Vivo", "Oppo", "Realme", "Motorola", "iQOO", "Nothing", "Poco"],
  "Books and Stationary": ["Classmate", "Camlin", "Navneet", "Reynolds", "Parker", "Faber-Castell", "Doms", "Luxor", "ITC"],
  "Kitchen Appliances": ["Prestige", "Bajaj", "Philips", "Hawkins", "Butterfly", "Sujata", "Morphy Richards", "Wonderchef", "Kent", "Milton"],
  "Plywood and Hardware": ["Century Ply", "Greenply", "Kitply", "Action TESA", "Kajaria", "Godrej Locks", "Dorsët", "Hettich", "Hafele", "Ebco"],
  "Automotive": ["Maruti Suzuki", "Hyundai", "Tata Motors", "Mahindra", "Honda", "Toyota", "Kia", "Hero", "Bajaj", "TVS", "Royal Enfield"],
  "Furniture": ["Godrej Interio", "Nilkamal", "Durian", "Wakefit", "Sleepwell", "Featherlite", "Damro", "Zuari"],
  "Gift Shop": ["Archies", "Miniso", "Hallmark", "Cadbury", "Ferns N Petals"],
  "Footwear": ["Bata", "Puma", "Nike", "Adidas", "Red Chief", "Campus", "Sparx", "Relaxo", "Action", "Woodland", "Liberty", "Metro"],
  "Chemist": ["Cipla", "Sun Pharma", "Dr. Reddy's", "Abbott", "Mankind", "Alkem", "Torrent", "Zydus", "Lupin", "Glenmark", "Himalaya", "Dabur"],
  "Building Material": ["UltraTech Cement", "Ambuja Cement", "ACC", "Tata Tiscon", "Jindal Panther", "Kamdhenu", "Asian Paints", "Berger Paints", "Birla White"],
  "Agricultural Goods": ["Bayer", "Syngenta", "UPL", "IFFCO", "Mahyco", "Rasi Seeds", "Kaveri Seeds", "Coromandel", "Dhanuka"],
  "Sweet Shop": ["Haldiram", "Bikanervala", "Chhappan Bhog", "Kwality", "Bikaji"],
  "Sanitary Store": ["Jaquar", "Hindware", "Cera", "Parryware", "Kohler", "Somany", "Kajaria", "Astral", "Supreme", "Ashirvad"],
  "Hardware and Tools": ["Bosch", "Stanley", "DeWalt", "Black & Decker", "Taparia", "Makita", "Godrej", "Freemans"],
  "Toys/Games": ["Lego", "Hot Wheels", "Mattel", "Hasbro", "Funskool", "Nerf", "Barbie", "Fisher-Price"],
  "Flowers and Gifts": ["Ferns N Petals", "IGP", "Interflora"],
  "Boutique": ["Manyavar", "Fabindia", "Biba", "W for Woman", "Aurelia", "Raymond"],
  "Home Decor": ["Asian Paints", "D'Decor", "Bombay Dyeing", "Spaces", "Trident", "Story@Home", "Portico"],
  "Opticals": ["Ray-Ban", "Lenskart", "Titan Eyeplus", "Fastrack", "Oakley", "Vogue", "Carrera", "Essilor", "Carl Zeiss"],
  "Grocery Store": ["Tata Sampann", "Fortune", "Aashirvaad", "Amul", "Mother Dairy", "Nestle", "Britannia", "Parle", "MDH", "Catch", "Everest"],
  "Spare Parts": ["Bosch", "Minda", "Motherson", "Gabriel", "Lucas TVS", "Denso", "Subros", "Brembo", "Valeo"]
};

const partnerCategoryBrandsState = {};

function sanitizeId(str) {
  return String(str || "").replace(/[^a-zA-Z0-9_-]/g, "_");
}

function updateCategoryBrandCountUI(cat) {
  const countEl = document.getElementById(`brand-count-${sanitizeId(cat)}`);
  if (!countEl) return;
  const state = partnerCategoryBrandsState[cat] || { brands: new Set(), custom: "" };
  const customCount = (state.custom && state.custom.trim())
    ? state.custom.split(",").map((s) => s.trim()).filter(Boolean).length
    : 0;
  const total = (state.brands ? state.brands.size : 0) + customCount;
  if (total > 0) {
    countEl.textContent = `${total} brand${total > 1 ? "s" : ""} selected`;
    countEl.className = "category-brand-count has-brands";
  } else {
    countEl.textContent = "0 brands selected";
    countEl.className = "category-brand-count";
  }
}

function renderPartnerCategoryBrandCards() {
  const container = document.getElementById("partner-brands-cards-container");
  if (!container) return;

  const checkedCheckboxes = Array.from(document.querySelectorAll('input[name="products"]:checked'));

  if (checkedCheckboxes.length === 0) {
    container.innerHTML = `
      <div class="partner-brands-empty">
        <p>Please select at least one product category above to choose your brands.</p>
      </div>
    `;
    return;
  }

  // Preserve any typed text from existing inputs in the DOM into state before re-rendering
  container.querySelectorAll(".category-brand-card").forEach((card) => {
    const cat = card.dataset.category;
    if (cat) {
      if (!partnerCategoryBrandsState[cat]) {
        partnerCategoryBrandsState[cat] = { brands: new Set(), custom: "" };
      }
      const input = card.querySelector(".custom-brand-input");
      if (input) {
        partnerCategoryBrandsState[cat].custom = input.value;
      }
    }
  });

  const activeCategories = [];
  checkedCheckboxes.forEach((cb) => {
    let cat = cb.value;
    if (cat === "Other") {
      const otherVal = document.getElementById("product-other-input")?.value?.trim();
      cat = otherVal ? `Other (${otherVal})` : "Other";
    }
    activeCategories.push({ name: cat, rawValue: cb.value });
  });

  let cardsHtml = "";
  activeCategories.forEach(({ name, rawValue }) => {
    if (!partnerCategoryBrandsState[name]) {
      partnerCategoryBrandsState[name] = { brands: new Set(), custom: "" };
    }
    const state = partnerCategoryBrandsState[name];
    const brandChips = POPULAR_CATEGORY_BRANDS[rawValue] || POPULAR_CATEGORY_BRANDS[name] || [];
    const iconObj = CANONICAL_PRODUCTS.find((p) => p.name === rawValue || p.name === name);
    const iconSrc = iconObj ? iconObj.icon : "https://img.icons8.com/color/48/star.png";

    const customCount = (state.custom && state.custom.trim())
      ? state.custom.split(",").map((s) => s.trim()).filter(Boolean).length
      : 0;
    const totalCount = (state.brands ? state.brands.size : 0) + customCount;
    const countText = totalCount > 0 ? `${totalCount} brand${totalCount > 1 ? "s" : ""} selected` : "0 brands selected";
    const countClass = totalCount > 0 ? "category-brand-count has-brands" : "category-brand-count";

    let chipsHtml = "";
    if (brandChips.length > 0) {
      chipsHtml = brandChips
        .map((brand) => {
          const isSel = state.brands && state.brands.has(brand);
          return `
          <button type="button" class="brand-chip ${isSel ? "selected" : ""}" data-category="${escapeHtml(name)}" data-brand="${escapeHtml(brand)}">
            <span class="brand-chip-check">✓</span>
            <span class="brand-chip-text">${escapeHtml(brand)}</span>
          </button>
        `;
        })
        .join("");
    }

    cardsHtml += `
      <div class="category-brand-card" data-category="${escapeHtml(name)}">
        <div class="category-brand-card-header">
          <div class="category-brand-title-wrap">
            <img src="${iconSrc}" alt="${escapeHtml(name)}" class="category-brand-icon" onerror="this.src='https://img.icons8.com/color/48/star.png'" />
            <span class="category-brand-name">${escapeHtml(name)}</span>
          </div>
          <span class="${countClass}" id="brand-count-${sanitizeId(name)}">${countText}</span>
        </div>
        ${chipsHtml ? `<div class="brand-chips-wrap">${chipsHtml}</div>` : ""}
        <div class="category-brand-custom-wrap">
          <input type="text" class="custom-brand-input" data-category="${escapeHtml(name)}"
                 placeholder="Other ${escapeHtml(name)} brands (type &amp; separate with comma)..."
                 value="${escapeHtml(state.custom || "")}" />
        </div>
      </div>
    `;
  });

  container.innerHTML = cardsHtml;

  // Re-attach event listeners
  container.querySelectorAll(".brand-chip").forEach((chip) => {
    chip.addEventListener("click", (e) => {
      e.preventDefault();
      const cat = chip.dataset.category;
      const brand = chip.dataset.brand;
      if (!partnerCategoryBrandsState[cat]) {
        partnerCategoryBrandsState[cat] = { brands: new Set(), custom: "" };
      }
      if (partnerCategoryBrandsState[cat].brands.has(brand)) {
        partnerCategoryBrandsState[cat].brands.delete(brand);
        chip.classList.remove("selected");
      } else {
        partnerCategoryBrandsState[cat].brands.add(brand);
        chip.classList.add("selected");
      }
      updateCategoryBrandCountUI(cat);
    });
  });

  container.querySelectorAll(".custom-brand-input").forEach((input) => {
    input.addEventListener("input", () => {
      const cat = input.dataset.category;
      if (!partnerCategoryBrandsState[cat]) {
        partnerCategoryBrandsState[cat] = { brands: new Set(), custom: "" };
      }
      partnerCategoryBrandsState[cat].custom = input.value;
      updateCategoryBrandCountUI(cat);
    });
  });
}

function getPartnerSelectedBrandsSummary() {
  const parts = [];
  const checkedBoxes = Array.from(document.querySelectorAll('input[name="products"]:checked'));

  checkedBoxes.forEach((cb) => {
    let cat = cb.value;
    if (cat === "Other") {
      const otherVal = document.getElementById("product-other-input")?.value?.trim();
      cat = otherVal ? `Other (${otherVal})` : "Other";
    }

    const state = partnerCategoryBrandsState[cat];
    if (!state) return;

    const brandList = Array.from(state.brands || []);
    if (state.custom && state.custom.trim()) {
      state.custom
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean)
        .forEach((b) => {
          if (!brandList.includes(b)) brandList.push(b);
        });
    }

    if (brandList.length > 0) {
      parts.push(`${cat}: ${brandList.join(", ")}`);
    }
  });

  return parts.join(" | ");
}

let preselectedCategoryData = null;

function handlePresetURLParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const presetType = urlParams.get('type');
  const presetCategory = urlParams.get('category') || urlParams.get('cat') || urlParams.get('serviceName');

  if (presetCategory) {
    // If category is provided, account type is Customer and category is pre-decided
    const catClean = presetCategory.trim().toLowerCase();

    // Check in services first
    const matchedService = CANONICAL_SERVICES.find(s => s.name.toLowerCase() === catClean || s.name.toLowerCase().includes(catClean) || catClean.includes(s.name.toLowerCase()));

    // Check in products
    const matchedProduct = CANONICAL_PRODUCTS.find(p => p.name.toLowerCase() === catClean || p.name.toLowerCase().includes(catClean) || catClean.includes(p.name.toLowerCase()));

    if (matchedService) {
      applyDecidedCategory(matchedService, "service");
      return;
    } else if (matchedProduct) {
      applyDecidedCategory(matchedProduct, "product");
      return;
    } else {
      // Fallback: match by partial word
      const anyService = CANONICAL_SERVICES.find(s => s.name.toLowerCase().split(/[\s/]+/).some(w => catClean.includes(w) && w.length > 2));
      if (anyService) {
        applyDecidedCategory(anyService, "service");
        return;
      }
      const anyProduct = CANONICAL_PRODUCTS.find(p => p.name.toLowerCase().split(/[\s/]+/).some(w => catClean.includes(w) && w.length > 2));
      if (anyProduct) {
        applyDecidedCategory(anyProduct, "product");
        return;
      }
    }
  }

  // Regular preset type handling
  if (presetType === 'partner') {
    const atP = document.getElementById('at-partner');
    if (atP) atP.checked = true;
    const cardP = document.getElementById('radio-card-partner');
    if (cardP) cardP.classList.add('selected');
    goToStep1();
  } else if (presetType === 'customer') {
    const atC = document.getElementById('at-customer');
    if (atC) atC.checked = true;
    const cardC = document.getElementById('radio-card-customer');
    if (cardC) cardC.classList.add('selected');
    goToStep1();
  }
}

function applyDecidedCategory(item, kind) {
  preselectedCategoryData = { item, kind };

  // 1. Set account type to Customer
  const atC = document.getElementById('at-customer');
  if (atC) atC.checked = true;
  const cardC = document.getElementById('radio-card-customer');
  if (cardC) cardC.classList.add('selected');

  // 2. Set service type and pre-check checkbox
  if (kind === "service") {
    selectedCustomerService = "Service/Repair";
    const radioS = document.getElementById('cs-service-repair');
    if (radioS) radioS.checked = true;
    const cardS = document.getElementById('radio-card-service-repair');
    if (cardS) cardS.classList.add('selected');

    // Pre-check the service checkbox in Step 2B
    const cb = document.querySelector(`input[name="services"][value="${item.name}"]`);
    if (cb) {
      cb.checked = true;
      const parentLabel = cb.closest('.checkbox-item');
      if (parentLabel) parentLabel.classList.add('checked');
    }
  } else {
    // Product
    selectedCustomerService = "Buy New Product";
    const radioB = document.getElementById('cs-buy-new');
    if (radioB) radioB.checked = true;
    const cardB = document.getElementById('radio-card-buy-new');
    if (cardB) cardB.classList.add('selected');

    // Pre-check the product checkbox in Step 2A
    const cb = document.querySelector(`input[name="products"][value="${item.name}"]`);
    if (cb) {
      cb.checked = true;
      const parentLabel = cb.closest('.checkbox-item');
      if (parentLabel) parentLabel.classList.add('checked');
    }
  }

  // 3. Advance to Customer Step 1
  goToStep1();

  // Hide the "What service do you want?" question since category is already selected
  const custServiceGroup = document.getElementById('customer-service-type-group');
  if (custServiceGroup) custServiceGroup.style.display = 'none';

  // 4. Render Pre-decided Category Banner
  const banner = document.getElementById('selected-category-card');
  const imgEl = document.getElementById('selected-cat-img');
  const pillEl = document.getElementById('selected-cat-type-pill');
  const titleEl = document.getElementById('selected-cat-name-display');

  if (banner && imgEl && pillEl && titleEl) {
    imgEl.src = item.icon;
    pillEl.textContent = kind === "service" ? "Service / Repair" : "Product";
    titleEl.textContent = item.name;
    banner.classList.remove('hidden');
  }

  // Update WhatsApp 1-Click link with specific category
  const waQuickBtn = document.getElementById('customer-wa-quick-btn');
  if (waQuickBtn) {
    const text = encodeURIComponent(`Hi Real Amount, I need ${item.name} near my area. Please share the best local quotes.`);
    waQuickBtn.href = `https://wa.me/917009095598?text=${text}`;
  }
}

function clearSelectedCategory() {
  if (preselectedCategoryData) {
    const { item, kind } = preselectedCategoryData;
    const groupName = kind === "service" ? "services" : "products";
    const cb = document.querySelector(`input[name="${groupName}"][value="${item.name}"]`);
    if (cb) {
      cb.checked = false;
      const parentLabel = cb.closest('.checkbox-item');
      if (parentLabel) parentLabel.classList.remove('checked');
    }
  }

  preselectedCategoryData = null;

  // Unhide the "What service do you want?" question
  const custServiceGroup = document.getElementById('customer-service-type-group');
  if (custServiceGroup) custServiceGroup.style.display = '';

  // Unhide step 2 checkbox grids and notes
  const prodGrid = document.getElementById('product-checkbox-grid');
  if (prodGrid) prodGrid.style.display = '';
  const prodNote = document.getElementById('step-2a-note');
  if (prodNote) prodNote.style.display = '';
  const servGrid = document.getElementById('service-checkbox-grid');
  if (servGrid) servGrid.style.display = '';
  const servNote = document.getElementById('step-2b-note');
  if (servNote) servNote.style.display = '';

  // Uncheck customerService radios
  document.querySelectorAll('input[name="customerService"]').forEach(r => r.checked = false);
  ["radio-card-buy-new", "radio-card-service-repair", "radio-card-buy-used", "radio-card-sell-used"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('selected');
  });

  const banner = document.getElementById('selected-category-card');
  if (banner) banner.classList.add('hidden');

  const waQuickBtn = document.getElementById('customer-wa-quick-btn');
  if (waQuickBtn) {
    const text = encodeURIComponent(`Hi Real Amount, I want to request the a local quote. Details: `);
    waQuickBtn.href = `https://wa.me/917009095598?text=${text}`;
  }

  showToast("Category cleared. Please choose your service type below.", "info");
}

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

// ── Clear error on input & advance only on blur ──
function setupLiveValidation() {
  [
    "email", "businessName", "workplaceAddress", "contactPerson", "mobile",
    "customerName", "customerMobile", "customerAddress"
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    // Clear error while typing (never auto-advance on keystroke)
    el.addEventListener("input", () => {
      el.classList.remove("error");
      clearFieldError(`${id}-error`);
    });

    // Advance only when clicking out of the textbox (blur) after typing the full value
    el.addEventListener("blur", () => {
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

  if (progCircle1) {
    progCircle1.classList.remove("active");
    progCircle1.classList.add("completed");
  }
  if (progCircle2) progCircle2.classList.add("active");
  if (progLine1) progLine1.classList.add("filled");

  const mainTitle = document.getElementById("main-form-title");

  if (accountType === "Partner") {
    if (mainTitle) mainTitle.textContent = "Partner Registration Form";
    if (progLabel1) progLabel1.textContent = "Account";
    if (progLabel2) progLabel2.textContent = "Basic Info";
    if (progLabel3) progLabel3.textContent = "Business Details";
    if (progStep3) progStep3.classList.remove("hidden");
    if (progLine2) progLine2.classList.remove("hidden");
    step1.classList.remove("hidden");
  } else {
    if (mainTitle) mainTitle.textContent = "Customer Registration Form";
    if (progLabel1) progLabel1.textContent = "Account";
    if (progLabel2) progLabel2.textContent = "Details";
    if (progLabel3) progLabel3.textContent = "Payment";
    if (progLine2) progLine2.classList.remove("hidden");
    if (progStep3) progStep3.classList.remove("hidden");
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

  if (progCircle2) progCircle2.classList.remove("active");
  if (progCircle1) {
    progCircle1.classList.remove("completed");
    progCircle1.classList.add("active");
  }
  if (progLine1) progLine1.classList.remove("filled");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goToStep2() {
  if (step1 && step1.classList.contains("hidden")) return;
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
  if (progCircle2) {
    progCircle2.classList.remove("active");
    progCircle2.classList.add("completed");
  }
  if (progCircle3) progCircle3.classList.add("active");
  if (progLine2) progLine2.classList.add("filled");

  // Update UI for Partner
  const partnerBrandsSec = document.getElementById('partner-brands-section');
  const generalBrandsWrap = document.getElementById('general-brands-wrapper');

  if (selectedBusinessType === "Product Sale (Retail)") {
    if (partnerBrandsSec) {
      partnerBrandsSec.classList.remove('hidden');
      renderPartnerCategoryBrandCards();
    }
    if (generalBrandsWrap) generalBrandsWrap.classList.add('hidden');
  } else {
    if (partnerBrandsSec) partnerBrandsSec.classList.add('hidden');
    if (generalBrandsWrap) generalBrandsWrap.classList.add('hidden');
  }

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
  if (step1Customer && step1Customer.classList.contains("hidden")) return;
  if (!validateStep1Customer()) return;

  const custService = document.querySelector('input[name="customerService"]:checked');
  selectedCustomerService = custService.value;

  step1Customer.classList.add("hidden");

  // Change heading and badge for customer context
  if (preselectedCategoryData) {
    const { item, kind } = preselectedCategoryData;
    if (kind === "product") {
      const heading = document.getElementById('step-2a-heading');
      if (heading) heading.textContent = `Requirement Details: ${item.name}`;
      const badge = document.getElementById('step-2a-badge');
      if (badge) badge.textContent = 'Selected Product';
      const grid = document.getElementById('product-checkbox-grid');
      if (grid) grid.style.display = 'none';
      const note = document.getElementById('step-2a-note');
      if (note) note.style.display = 'none';
      step2a.classList.remove("hidden");
    } else {
      const heading = document.getElementById('step-2b-heading');
      if (heading) heading.textContent = `Service Details: ${item.name}`;
      const badge = document.getElementById('step-2b-badge');
      if (badge) badge.textContent = 'Selected Service';
      const grid = document.getElementById('service-checkbox-grid');
      if (grid) grid.style.display = 'none';
      const note = document.getElementById('step-2b-note');
      if (note) note.style.display = 'none';
      step2b.classList.remove("hidden");
    }
  } else {
    const heading = document.getElementById('step-2a-heading');
    if (heading) heading.textContent = 'What product are you interested in?';
    const badge = document.getElementById('step-2a-badge');
    if (badge) badge.textContent = 'Select a Product';
    const gridA = document.getElementById('product-checkbox-grid');
    if (gridA) gridA.style.display = '';
    const noteA = document.getElementById('step-2a-note');
    if (noteA) noteA.style.display = '';

    const headingB = document.getElementById('step-2b-heading');
    if (headingB) headingB.textContent = 'What services do you need?';
    const badgeB = document.getElementById('step-2b-badge');
    if (badgeB) badgeB.textContent = 'Service Provider';
    const gridB = document.getElementById('service-checkbox-grid');
    if (gridB) gridB.style.display = '';
    const noteB = document.getElementById('step-2b-note');
    if (noteB) noteB.style.display = '';

    if (selectedCustomerService === "Service/Repair") {
      step2b.classList.remove("hidden");
    } else {
      step2a.classList.remove("hidden");
    }
  }

  // Update progress
  if (progCircle2) {
    progCircle2.classList.remove("active");
    progCircle2.classList.add("completed");
  }
  if (progCircle3) progCircle3.classList.add("active");
  if (progLine2) progLine2.classList.add("filled");

  // Update UI for Customer
  const partnerBrandsSec = document.getElementById('partner-brands-section');
  const generalBrandsWrap = document.getElementById('general-brands-wrapper');
  if (partnerBrandsSec) partnerBrandsSec.classList.add('hidden');
  if (generalBrandsWrap) generalBrandsWrap.classList.remove('hidden');

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

  const partnerBrandsSec = document.getElementById('partner-brands-section');
  if (partnerBrandsSec) partnerBrandsSec.classList.add('hidden');

  // Reset step 2 submit buttons in case they were left in loading state
  ["product-submit-btn", "service-submit-btn"].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) { btn.disabled = false; btn.classList.remove("btn-loading"); }
  });

  if (accountType === "Partner") {
    step1.classList.remove("hidden");
  } else {
    step1Customer.classList.remove("hidden");
    const custServiceGroup = document.getElementById('customer-service-type-group');
    if (custServiceGroup) {
      custServiceGroup.style.display = preselectedCategoryData ? 'none' : '';
    }
  }

  // Reset heading and badge back to default
  const heading = document.getElementById('step-2a-heading');
  if (heading) heading.textContent = 'What products do you sell?';
  const badge = document.getElementById('step-2a-badge');
  if (badge) badge.textContent = 'Product Sale (Retail)';

  if (progCircle3) progCircle3.classList.remove("active");
  if (progCircle2) {
    progCircle2.classList.remove("completed");
    progCircle2.classList.add("active");
  }
  if (progLine2) progLine2.classList.remove("filled");

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
    brands: isProduct ? (getPartnerSelectedBrandsSummary() || document.getElementById("brands").value.trim()) : "",
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
  if (progCircle3) {
    progCircle3.classList.remove("active");
    progCircle3.classList.add("completed");
  }

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
  if (progCircle3) {
    progCircle3.classList.remove("active");
    progCircle3.classList.add("completed");
  }

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

  if (progCircle1) progCircle1.className = "step-circle active";
  if (progCircle2) progCircle2.className = "step-circle";
  if (progCircle3) progCircle3.className = "step-circle";
  if (progLine1) progLine1.classList.remove("filled");
  if (progLine2) progLine2.classList.remove("filled");

  if (progLabel1) progLabel1.textContent = "Account Type";
  if (progLabel2) progLabel2.textContent = "Basic Info";
  if (progLabel3) progLabel3.textContent = "Payment";

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
