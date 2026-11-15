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

  // ── Mobile Drawer Navigation ──
  initMobileDrawer();

  // ── Brand Picker Modal for Partners ──
  initBrandPickerModal();

  // ── Category Searchbars in Form (Services vs Products) ──
  initFormCategorySearch();

  // ── Auto-handle URL parameters (?type= and ?category=) ──
  handlePresetURLParams();

  // Initial Hero Banner sync
  updateFormBannerHeader(accountType || "default");

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

// ── FORM HERO BANNER ICONS & CONTROLLER ──
const ICON_CUSTOMER_MEGAPHONE = `
<svg viewBox="0 0 36 36" class="banner-svg-icon" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M5 14v5a1 1 0 001 1h4l8 6V7l-8 6H7a1 1 0 00-1 1z" fill="#fef3c7" stroke="#b45309" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M19 10c4 0 8-2.5 10.5-4.5v21C27 24.5 23 22 19 22" fill="#fde68a" stroke="#b45309" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M12 20v5a2 2 0 002 2h1a2 2 0 002-2v-3" stroke="#b45309" stroke-width="2.2" stroke-linecap="round"/>
</svg>
`;

const ICON_PARTNER_STORE = `
<svg viewBox="0 0 36 36" class="banner-svg-icon" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M5 14L7 6h22l2 8v1.5a3.5 3.5 0 01-6 2.3 3.5 3.5 0 01-6 0 3.5 3.5 0 01-6 0 3.5 3.5 0 01-6-2.3V14z" fill="#fde68a" stroke="#b45309" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M6 18v11a1 1 0 001 1h22a1 1 0 001-1V18" fill="#fffdf5" stroke="#b45309" stroke-width="2.2"/>
  <path d="M14 30v-9a1 1 0 011-1h6a1 1 0 011 1v9" fill="#fef3c7" stroke="#b45309" stroke-width="2"/>
  <rect x="8.5" y="19" width="3.5" height="4" rx="0.5" stroke="#b45309" stroke-width="1.8" fill="#fef3c7"/>
  <rect x="24" y="19" width="3.5" height="4" rx="0.5" stroke="#b45309" stroke-width="1.8" fill="#fef3c7"/>
</svg>
`;

const ICON_DEFAULT = `
<svg viewBox="0 0 36 36" class="banner-svg-icon" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M18 4a14 14 0 100 28 14 14 0 000-28z" fill="#fef3c7" stroke="#b45309" stroke-width="2"/>
  <path d="M12 18l4 4 8-8" stroke="#b45309" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

function updateFormBannerHeader(type) {
  const iconEl = document.getElementById("form-banner-icon");
  const titleEl = document.getElementById("main-form-title");
  const subEl = document.getElementById("main-form-subtitle");

  const cleanType = String(type || "").toLowerCase();

  if (cleanType === "customer") {
    if (iconEl) iconEl.innerHTML = ICON_CUSTOMER_MEGAPHONE;
    if (titleEl) titleEl.textContent = "Post Your Requirement";
    if (subEl) subEl.textContent = "Tell us what you need, and get the best offers from local businesses.";
  } else if (cleanType === "partner") {
    if (iconEl) iconEl.innerHTML = ICON_PARTNER_STORE;
    if (titleEl) titleEl.textContent = "Partner Registration Form";
    if (subEl) subEl.textContent = "Join the Real Amount network and grow your business.";
  } else {
    if (iconEl) iconEl.innerHTML = ICON_DEFAULT;
    if (titleEl) titleEl.textContent = "Choose your account type";
    if (subEl) subEl.textContent = "Join the Real Amount network — fill in your details below.";
  }
}

function initMobileDrawer() {
  const menuBtn = document.getElementById("menu-toggle-btn");
  const drawer = document.getElementById("app-drawer");
  const backdrop = document.getElementById("drawer-backdrop");
  const closeBtn = document.getElementById("drawer-close-btn");

  if (!menuBtn || !drawer) return;

  function openDrawer() {
    drawer.classList.add("open");
    if (backdrop) backdrop.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    drawer.classList.remove("open");
    if (backdrop) backdrop.classList.remove("open");
    document.body.style.overflow = "";
  }

  menuBtn.addEventListener("click", openDrawer);
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (backdrop) backdrop.addEventListener("click", closeDrawer);
}

// ── CANONICAL CATEGORIES FOR DIRECT SELECTION ──
const CANONICAL_SERVICES = [
  { name: "Ac Service/Repair", icon: "https://img.icons8.com/color/48/air-conditioner.png", keywords: ["ac", "air conditioner", "cooling", "gas charging", "service", "ac repair", "hvac", "repair"] },
  { name: "Refrigerator Repair", icon: "https://img.icons8.com/color/48/fridge.png", keywords: ["fridge", "refrigerator", "freezer", "cooling repair", "defrost"] },
  { name: "Tv/Led Repair", icon: "https://img.icons8.com/color/48/tv.png", keywords: ["tv", "led", "television", "smart tv", "display", "screen repair", "lcd"] },
  { name: "Mobile Repair", icon: "https://img.icons8.com/color/48/smartphone.png", keywords: ["mobile", "phone", "smartphone", "iphone", "android", "screen repair", "battery", "display"] },
  { name: "Laptop Repair", icon: "https://img.icons8.com/color/48/laptop.png", keywords: ["laptop", "computer", "pc", "macbook", "windows", "keyboard", "formatting"] },
  { name: "Plumber", icon: "https://img.icons8.com/color/48/plumbing.png", keywords: ["plumber", "plumbing", "pipe", "tap", "leakage", "water", "drainage", "fittings"] },
  { name: "Car Service", icon: "https://img.icons8.com/color/48/car-service.png", keywords: ["car", "automobile", "mechanic", "oil change", "servicing", "garage"] },
  { name: "Two Wheeler Service", icon: "https://img.icons8.com/color/48/motorcycle.png", keywords: ["bike", "motorcycle", "scooter", "scooty", "two wheeler", "two-wheeler", "mechanic", "servicing"] },
  { name: "Professional Services (CA/Tax Advocate/Doctor)", icon: "https://img.icons8.com/color/48/briefcase.png", keywords: ["ca", "chartered accountant", "tax", "gst", "advocate", "lawyer", "legal", "doctor", "consultant"] },
  { name: "Insurance(Life/Health/Vehicle)", icon: "https://img.icons8.com/color/48/shield.png", keywords: ["insurance", "life insurance", "health insurance", "car insurance", "bike insurance", "policy", "lic"] },
  { name: "Unisex Saloon", icon: "https://img.icons8.com/color/48/barbershop.png", keywords: ["saloon", "salon", "parlour", "parlor", "haircut", "beauty", "makeup", "grooming", "spa"] },
  { name: "Banking Services", icon: "https://img.icons8.com/color/48/bank.png", keywords: ["bank", "banking", "loan", "personal loan", "home loan", "credit card", "finance", "account"] },
  { name: "Auto Dealer", icon: "https://img.icons8.com/color/48/steering-wheel.png", keywords: ["auto dealer", "car dealer", "used car", "buy car", "sell car", "showroom", "vehicle"] },
  { name: "Electrician", icon: "https://img.icons8.com/color/48/lightning-bolt.png", keywords: ["electrician", "electrical", "wiring", "fan repair", "short circuit", "switch", "meter"] },
  { name: "Carpenter", icon: "https://img.icons8.com/color/48/saw.png", keywords: ["carpenter", "wood", "woodwork", "furniture repair", "door", "window", "cabinet", "interior"] },
  { name: "Education", icon: "https://img.icons8.com/color/48/graduation-cap.png", keywords: ["education", "tuition", "coaching", "school", "college", "classes", "teacher", "tutor"] },
  { name: "Health Care", icon: "https://img.icons8.com/color/48/hospital.png", keywords: ["health", "healthcare", "clinic", "hospital", "nursing", "ambulance", "physiotherapy", "pathology", "lab"] },
  { name: "Taxi/Cab Services", icon: "https://img.icons8.com/color/48/taxi.png", keywords: ["taxi", "cab", "rental car", "driver", "travel", "tour", "outstation"] },
  { name: "Financial Services", icon: "https://img.icons8.com/color/48/money.png", keywords: ["finance", "financial", "investment", "mutual fund", "sip", "advisory", "wealth"] },
  { name: "Car Washing", icon: "https://img.icons8.com/color/48/car-service.png", keywords: ["car wash", "car washing", "detailing", "car cleaning", "foam wash", "polish"] },
  { name: "Photographer", icon: "https://img.icons8.com/color/48/camera.png", keywords: ["photographer", "photography", "videography", "wedding shoot", "pre wedding", "studio", "photo shoot"] },
  { name: "Courier Services", icon: "https://img.icons8.com/color/48/truck.png", keywords: ["courier", "parcel", "delivery", "shipping", "logistics", "speed post", "cargo"] },
  { name: "Banquet Hall", icon: "https://img.icons8.com/color/48/city-buildings.png", keywords: ["banquet", "marriage hall", "party hall", "wedding venue", "resort", "reception"] },
  { name: "Real Estate", icon: "https://img.icons8.com/color/48/home.png", keywords: ["real estate", "property", "flat", "plot", "rent", "buy house", "dealer", "broker"] }
];

const CANONICAL_PRODUCTS = [
  { name: "Air Conditioner", icon: "https://img.icons8.com/color/48/air-conditioner.png", keywords: ["ac", "air conditioner", "split ac", "window ac", "cooling", "inverter ac"] },
  { name: "Refrigerator", icon: "https://img.icons8.com/color/48/fridge.png", keywords: ["fridge", "refrigerator", "double door", "single door", "deep freezer"] },
  { name: "Led Tv", icon: "https://img.icons8.com/color/48/tv.png", keywords: ["tv", "led", "television", "smart tv", "4k tv", "oled", "android tv"] },
  { name: "RO", icon: "https://img.icons8.com/color/48/bottle-of-water.png", keywords: ["ro", "water purifier", "filter", "uv", "water filter", "aquaguard"] },
  { name: "Inverter", icon: "https://img.icons8.com/color/48/car-battery.png", keywords: ["inverter", "battery", "ups", "tubular battery", "solar inverter", "power backup"] },
  { name: "Oven/OTG/Induction", icon: "https://img.icons8.com/color/48/cooker.png", keywords: ["oven", "otg", "induction", "microwave", "stove", "cooker"] },
  { name: "Cooler", icon: "https://img.icons8.com/color/48/fan.png", keywords: ["cooler", "air cooler", "desert cooler", "personal cooler", "fan"] },
  { name: "Washing Machine", icon: "https://img.icons8.com/color/48/washing-machine.png", keywords: ["washing machine", "washer", "dryer", "front load", "top load", "semi automatic"] },
  { name: "Mobile", icon: "https://img.icons8.com/color/48/smartphone.png", keywords: ["mobile", "phone", "smartphone", "iphone", "android", "cell phone"] },
  { name: "Books and Stationary", icon: "https://img.icons8.com/color/48/books.png", keywords: ["books", "stationary", "stationery", "pen", "notebook", "school books", "office supplies"] },
  { name: "Kitchen Appliances", icon: "https://img.icons8.com/color/48/kettle.png", keywords: ["kitchen appliances", "mixer", "grinder", "juicer", "blender", "chimney", "cooktop"] },
  { name: "Plywood and Hardware", icon: "https://img.icons8.com/color/48/wood.png", keywords: ["plywood", "timber", "hardware", "laminate", "mdf", "board", "hinges"] },
  { name: "Automotive", icon: "https://img.icons8.com/color/48/car.png", keywords: ["automotive", "car parts", "bike parts", "auto accessories", "vehicle accessories"] },
  { name: "Furniture", icon: "https://img.icons8.com/color/48/sofa.png", keywords: ["furniture", "sofa", "bed", "table", "chair", "almirah", "dining table", "wardrobe"] },
  { name: "Gift Shop", icon: "https://img.icons8.com/color/48/gift.png", keywords: ["gift", "gift shop", "toys", "presents", "novelties", "memento"] },
  { name: "Footwear", icon: "https://img.icons8.com/color/48/trainers.png", keywords: ["footwear", "shoes", "sneakers", "slippers", "sandals", "boots", "heels", "chappal"] },
  { name: "Chemist", icon: "https://img.icons8.com/color/48/pills.png", keywords: ["chemist", "pharmacy", "medical store", "medicines", "drugs", "supplements"] },
  { name: "Building Material", icon: "https://img.icons8.com/color/48/brick-wall.png", keywords: ["building material", "cement", "bricks", "sand", "steel", "iron", "construction"] },
  { name: "Agricultural Goods", icon: "https://img.icons8.com/color/48/wheat.png", keywords: ["agriculture", "seeds", "fertilizers", "pesticides", "farming", "crop", "kisan"] },
  { name: "Event Management", icon: "https://img.icons8.com/color/48/party-baloons.png", keywords: ["event management", "decoration", "party planner", "wedding planner", "stage", "sound"] },
  { name: "Catering", icon: "https://img.icons8.com/color/48/food.png", keywords: ["catering", "caterer", "food", "wedding food", "halwai", "party food"] },
  { name: "Sweet Shop", icon: "https://img.icons8.com/color/48/cupcake.png", keywords: ["sweet shop", "sweets", "mithai", "bakery", "snacks", "ladoo", "jalebi"] },
  { name: "Sanitary Store", icon: "https://img.icons8.com/color/48/toilet-bowl.png", keywords: ["sanitary", "sanitaryware", "tiles", "faucets", "wash basin", "bathroom fittings"] },
  { name: "Home Baker", icon: "https://img.icons8.com/color/48/cake.png", keywords: ["home baker", "cake", "pastry", "cookies", "baking", "custom cake", "birthday cake"] },
  { name: "Hardware and Tools", icon: "https://img.icons8.com/color/48/maintenance.png", keywords: ["hardware", "tools", "drill machine", "hammer", "wrench", "screws", "fasteners"] },
  { name: "Toys/Games", icon: "https://img.icons8.com/color/48/controller.png", keywords: ["toys", "games", "board games", "video games", "kids toys", "dolls", "action figures"] },
  { name: "Flowers and Gifts", icon: "https://img.icons8.com/color/48/rose.png", keywords: ["flowers", "bouquet", "florist", "roses", "plant", "gifts"] },
  { name: "Boutique", icon: "https://img.icons8.com/color/48/womens-shirt.png", keywords: ["boutique", "clothes", "clothing", "designer wear", "suit", "saree", "lehenga", "dresses"] },
  { name: "Home Decor", icon: "https://img.icons8.com/color/48/lamp.png", keywords: ["home decor", "lighting", "paintings", "curtains", "clocks", "vases", "interior decor"] },
  { name: "Opticals", icon: "https://img.icons8.com/color/48/glasses.png", keywords: ["opticals", "glasses", "spectacles", "sunglasses", "lenses", "eye checkup", "frames"] },
  { name: "Grocery Store", icon: "https://img.icons8.com/color/48/shopping-cart.png", keywords: ["grocery", "kirana", "supermarket", "ration", "daily needs", "provisions"] },
  { name: "Spare Parts", icon: "https://img.icons8.com/color/48/gear.png", keywords: ["spare parts", "parts", "components", "replacement parts", "spares"] }
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
let currentBrandPickerCategory = null;

function renderPartnerCategoryBrandCards() {
  const container = document.getElementById("partner-brands-cards-container");
  if (!container) return;

  const checkedCheckboxes = Array.from(document.querySelectorAll('input[name="products"]:checked'));

  if (checkedCheckboxes.length === 0) {
    container.innerHTML = `
      <div class="partner-brands-empty">
        <p>Please select your products from the grid above to specify the brands you deal in.</p>
      </div>
    `;
    return;
  }

  const activeCategories = [];
  checkedCheckboxes.forEach((cb) => {
    let cat = cb.value;
    if (cat === "Other") {
      const otherVal = document.getElementById("product-other-input")?.value?.trim();
      cat = otherVal ? `Other (${otherVal})` : "Other";
    }
    activeCategories.push({ name: cat, rawValue: cb.value });
  });

  let html = "";
  activeCategories.forEach(({ name }) => {
    if (!partnerCategoryBrandsState[name]) {
      partnerCategoryBrandsState[name] = { brands: new Set() };
    }
    const state = partnerCategoryBrandsState[name];
    const brandList = Array.from(state.brands || []);

    let chipsHtml = "";
    if (brandList.length > 0) {
      chipsHtml = brandList.map(brand => `
        <span class="brand-item-chip" data-brand="${escapeHtml(brand)}">
          <span class="brand-item-name">${escapeHtml(brand)}</span>
          <button type="button" class="brand-item-remove" data-category="${escapeHtml(name)}" data-brand="${escapeHtml(brand)}" aria-label="Remove ${escapeHtml(brand)}">✕</button>
        </span>
      `).join("");
    }

    html += `
      <div class="category-brands-block" data-category="${escapeHtml(name)}">
        <h4 class="category-brands-label">${escapeHtml(name)} Brands</h4>
        <div class="category-brands-chips-row">
          ${chipsHtml}
          <button type="button" class="btn-add-brand" data-category="${escapeHtml(name)}">
            <span class="plus-icon">+</span> Add Brand
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Wire remove buttons directly on the cards
  container.querySelectorAll(".brand-item-remove").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const cat = btn.dataset.category;
      const brand = btn.dataset.brand;
      if (partnerCategoryBrandsState[cat] && partnerCategoryBrandsState[cat].brands) {
        partnerCategoryBrandsState[cat].brands.delete(brand);
        renderPartnerCategoryBrandCards();
        if (currentBrandPickerCategory === cat) {
          renderModalBrandSuggestions(cat);
        }
      }
    });
  });

  // Wire + Add Brand buttons
  container.querySelectorAll(".btn-add-brand").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const cat = btn.dataset.category;
      openBrandPickerModal(cat);
    });
  });
}

function openBrandPickerModal(cat) {
  currentBrandPickerCategory = cat;
  const modal = document.getElementById("brand-picker-modal");
  const titleEl = document.getElementById("brand-modal-title");
  const input = document.getElementById("brand-modal-input");

  if (!modal) return;

  if (titleEl) titleEl.textContent = `Add Brand — ${cat}`;
  if (input) input.value = "";

  renderModalBrandSuggestions(cat);

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  if (input) setTimeout(() => input.focus(), 80);
}

function renderModalBrandSuggestions(cat) {
  const grid = document.getElementById("brand-suggestions-grid");
  if (!grid) return;

  if (!partnerCategoryBrandsState[cat]) {
    partnerCategoryBrandsState[cat] = { brands: new Set() };
  }
  const state = partnerCategoryBrandsState[cat];

  // Lookup popular brands for this category
  let lookupKey = cat;
  if (cat.startsWith("Other (") && cat.endsWith(")")) {
    lookupKey = "Other";
  }
  const brandsList = POPULAR_CATEGORY_BRANDS[lookupKey] || POPULAR_CATEGORY_BRANDS[cat] || [];

  if (brandsList.length === 0) {
    grid.innerHTML = `<p style="color: #64748b; font-size: 0.85rem; padding: 0.5rem 0;">No common brands listed for this category. Please type your brand name above and click <strong>+ Add</strong>.</p>`;
    return;
  }

  grid.innerHTML = brandsList.map(brand => {
    const isAdded = state.brands.has(brand);
    return `
      <button type="button" class="brand-suggestion-chip ${isAdded ? 'already-added' : ''}" data-brand="${escapeHtml(brand)}">
        <span class="chip-action-icon">${isAdded ? '✓' : '+'}</span>
        <span>${escapeHtml(brand)}</span>
      </button>
    `;
  }).join("");

  grid.querySelectorAll(".brand-suggestion-chip").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const brand = btn.dataset.brand;
      if (state.brands.has(brand)) {
        state.brands.delete(brand);
      } else {
        state.brands.add(brand);
      }
      renderModalBrandSuggestions(cat);
      renderPartnerCategoryBrandCards();
    });
  });
}

function initBrandPickerModal() {
  const modal = document.getElementById("brand-picker-modal");
  const closeBtn = document.getElementById("brand-modal-close");
  const doneBtn = document.getElementById("brand-modal-done-btn");
  const addBtn = document.getElementById("brand-modal-add-btn");
  const input = document.getElementById("brand-modal-input");

  if (!modal) return;

  function closeModal() {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
    currentBrandPickerCategory = null;
  }

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (doneBtn) doneBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  function handleCustomAdd() {
    if (!currentBrandPickerCategory || !input) return;
    const val = input.value.trim();
    if (!val) return;

    if (!partnerCategoryBrandsState[currentBrandPickerCategory]) {
      partnerCategoryBrandsState[currentBrandPickerCategory] = { brands: new Set() };
    }
    // Handle comma-separated if user pasted multiple
    val.split(",").map(b => b.trim()).filter(Boolean).forEach(b => {
      partnerCategoryBrandsState[currentBrandPickerCategory].brands.add(b);
    });

    input.value = "";
    renderModalBrandSuggestions(currentBrandPickerCategory);
    renderPartnerCategoryBrandCards();
  }

  if (addBtn) addBtn.addEventListener("click", handleCustomAdd);
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleCustomAdd();
      }
    });
  }
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
    if (!state || !state.brands || state.brands.size === 0) return;

    const brandList = Array.from(state.brands);
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

    // Check if preset for service specifically
    const presetService = urlParams.get('service') || urlParams.get('serviceType') || urlParams.get('mode');
    if (presetService && (presetService === 'repair' || presetService === 'service' || presetService === 'services')) {
      selectedCustomerService = "Service/Repair";
      const radioS = document.getElementById('cs-service-repair');
      if (radioS) radioS.checked = true;
      const cardS = document.getElementById('radio-card-service-repair');
      if (cardS) cardS.classList.add('selected');
    }

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

  // Unhide step 2 checkbox grids, search bars, and notes
  const prodGrid = document.getElementById('product-checkbox-grid');
  if (prodGrid) prodGrid.style.display = '';
  const prodSearch = document.getElementById('product-search-section');
  if (prodSearch) prodSearch.style.display = '';
  const prodNote = document.getElementById('step-2a-note');
  if (prodNote) prodNote.style.display = '';

  const servGrid = document.getElementById('service-checkbox-grid');
  if (servGrid) servGrid.style.display = '';
  const servSearch = document.getElementById('service-search-section');
  if (servSearch) servSearch.style.display = '';
  const servNote = document.getElementById('step-2b-note');
  if (servNote) servNote.style.display = '';

  if (typeof clearProductSearch === 'function') clearProductSearch();
  if (typeof clearServiceSearch === 'function') clearServiceSearch();

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

  updateFormBannerHeader(accountType);

  if (accountType === "Partner") {
    if (progLabel1) progLabel1.textContent = "Account";
    if (progLabel2) progLabel2.textContent = "Basic Info";
    if (progLabel3) progLabel3.textContent = "Business Details";
    if (progStep3) progStep3.classList.remove("hidden");
    if (progLine2) progLine2.classList.remove("hidden");
    step1.classList.remove("hidden");
  } else {
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

  updateFormBannerHeader("default");

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
      const searchSecA = document.getElementById('product-search-section');
      if (searchSecA) searchSecA.style.display = 'none';
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
      const searchSecB = document.getElementById('service-search-section');
      if (searchSecB) searchSecB.style.display = 'none';
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
    const searchSecA = document.getElementById('product-search-section');
    if (searchSecA) searchSecA.style.display = '';
    const noteA = document.getElementById('step-2a-note');
    if (noteA) noteA.style.display = '';

    const headingB = document.getElementById('step-2b-heading');
    if (headingB) headingB.textContent = 'What services do you need?';
    const badgeB = document.getElementById('step-2b-badge');
    if (badgeB) badgeB.textContent = 'Service Provider';
    const gridB = document.getElementById('service-checkbox-grid');
    if (gridB) gridB.style.display = '';
    const searchSecB = document.getElementById('service-search-section');
    if (searchSecB) searchSecB.style.display = '';
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

  updateFormBannerHeader("default");

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

// ═══════════════════════════════════════════════════
// CATEGORY SEARCH IN CUSTOMER & PARTNER FORMS
// ═══════════════════════════════════════════════════

function initFormCategorySearch() {
  setupCategorySearch({
    searchBarWrapId: "service-category-search-bar",
    inputId: "service-category-search-input",
    clearBtnId: "service-search-clear-btn",
    dropdownId: "service-search-dropdown-results",
    gridId: "service-checkbox-grid",
    categoryType: "service",
    categories: CANONICAL_SERVICES,
    inputName: "services"
  });

  setupCategorySearch({
    searchBarWrapId: "product-category-search-bar",
    inputId: "product-category-search-input",
    clearBtnId: "product-search-clear-btn",
    dropdownId: "product-search-dropdown-results",
    gridId: "product-checkbox-grid",
    categoryType: "product",
    categories: CANONICAL_PRODUCTS,
    inputName: "products"
  });
}

function setupCategorySearch(config) {
  const searchWrap = document.getElementById(config.searchBarWrapId);
  const searchInput = document.getElementById(config.inputId);
  const clearBtn = document.getElementById(config.clearBtnId);
  const dropdown = document.getElementById(config.dropdownId);
  const grid = document.getElementById(config.gridId);
  if (!searchWrap || !searchInput || !dropdown || !grid) return;

  let currentFocusIndex = -1;

  function filterList(query) {
    if (!query) return [];
    const q = query.toLowerCase().trim();
    return config.categories.filter((cat) => {
      if (cat.name.toLowerCase().includes(q)) return true;
      if (cat.keywords && cat.keywords.some((k) => k.toLowerCase().includes(q))) return true;
      return false;
    });
  }

  function filterGrid(query) {
    const q = query.toLowerCase().trim();
    const items = grid.querySelectorAll(".checkbox-item");
    const matchedCategories = filterList(q);
    const matchedNames = new Set(matchedCategories.map((c) => c.name.toLowerCase()));

    let visibleCount = 0;
    items.forEach((item) => {
      const cb = item.querySelector(`input[name="${config.inputName}"]`);
      if (!cb) return;

      const val = cb.value;
      if (val === "Other") {
        item.style.display = ""; // Always keep "Other" visible
        return;
      }

      if (!q) {
        item.style.display = "";
        visibleCount++;
        return;
      }

      const valLower = val.toLowerCase();
      const matchesDirect = valLower.includes(q);
      const matchesKeywords = matchedNames.has(valLower);

      if (matchesDirect || matchesKeywords) {
        item.style.display = "";
        visibleCount++;
      } else {
        item.style.display = "none";
      }
    });

    const noticeEl = document.getElementById(`no-matching-${config.categoryType}`);
    if (noticeEl) {
      if (q && visibleCount === 0) {
        noticeEl.classList.remove("hidden");
        noticeEl.style.display = "block";
      } else {
        noticeEl.classList.add("hidden");
        noticeEl.style.display = "none";
      }
    }
  }

  function showDropdown() {
    dropdown.classList.remove("hidden");
    dropdown.style.display = "block";
  }

  function hideDropdown() {
    dropdown.classList.add("hidden");
    dropdown.style.display = "none";
    currentFocusIndex = -1;
  }

  function renderDropdown(items) {
    dropdown.innerHTML = "";
    currentFocusIndex = -1;

    if (items.length === 0) {
      dropdown.innerHTML = `
        <div class="search-no-results">
          No ${config.categoryType}s found matching "${escapeHtml(searchInput.value)}".<br>
          <span style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; display: inline-block;">You can select "Other" below to enter a custom ${config.categoryType}.</span>
        </div>
      `;
      showDropdown();
      return;
    }

    items.forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "search-result-item";
      div.setAttribute("data-index", index);

      const typeBadge = config.categoryType === "service" ? "Service" : "Product";
      const isChecked = isCategoryChecked(config.inputName, item.name);

      div.innerHTML = `
        <img src="${item.icon}" alt="" onerror="this.onerror=null; this.src='https://img.icons8.com/color/48/maintenance.png';" />
        <span>${escapeHtml(item.name)}</span>
        ${isChecked ? '<span class="selected-indicator-pill">✓ Selected</span>' : ''}
        <span class="search-result-badge">${typeBadge}</span>
      `;

      div.addEventListener("mousedown", (e) => {
        e.preventDefault();
        selectCategoryFromSearch(item.name, config.inputName, grid);
        searchInput.value = "";
        if (clearBtn) {
          clearBtn.classList.add("hidden");
          clearBtn.style.display = "none";
        }
        filterGrid("");
        hideDropdown();
      });

      dropdown.appendChild(div);
    });

    showDropdown();
  }

  searchInput.addEventListener("focus", () => {
    const val = searchInput.value.trim();
    if (val) {
      renderDropdown(filterList(val));
    }
  });

  searchInput.addEventListener("input", () => {
    const val = searchInput.value.trim();
    if (clearBtn) {
      if (val) {
        clearBtn.classList.remove("hidden");
        clearBtn.style.display = "flex";
      } else {
        clearBtn.classList.add("hidden");
        clearBtn.style.display = "none";
      }
    }

    filterGrid(val);

    if (val) {
      renderDropdown(filterList(val));
    } else {
      hideDropdown();
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      clearBtn.classList.add("hidden");
      clearBtn.style.display = "none";
      filterGrid("");
      hideDropdown();
      searchInput.focus();
    });
  }

  document.addEventListener("click", (e) => {
    if (!searchWrap.contains(e.target) && !dropdown.contains(e.target)) {
      hideDropdown();
    }
  });

  searchInput.addEventListener("keydown", (e) => {
    const items = dropdown.querySelectorAll(".search-result-item");
    if (!items.length || dropdown.classList.contains("hidden")) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      currentFocusIndex = (currentFocusIndex + 1) % items.length;
      updateDropdownHighlight(items, currentFocusIndex);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      currentFocusIndex = (currentFocusIndex - 1 + items.length) % items.length;
      updateDropdownHighlight(items, currentFocusIndex);
    } else if (e.key === "Enter") {
      if (currentFocusIndex >= 0 && items[currentFocusIndex]) {
        e.preventDefault();
        items[currentFocusIndex].dispatchEvent(new MouseEvent("mousedown"));
      }
    } else if (e.key === "Escape") {
      hideDropdown();
    }
  });
}

function updateDropdownHighlight(items, focusIndex) {
  items.forEach((item, idx) => {
    if (idx === focusIndex) {
      item.classList.add("highlighted");
      item.scrollIntoView({ block: "nearest" });
    } else {
      item.classList.remove("highlighted");
    }
  });
}

function isCategoryChecked(inputName, categoryName) {
  const cb = document.querySelector(`input[name="${inputName}"][value="${categoryName}"]`);
  return cb ? cb.checked : false;
}

function selectCategoryFromSearch(categoryName, inputName, grid) {
  const cb = grid.querySelector(`input[name="${inputName}"][value="${categoryName}"]`);
  if (cb) {
    cb.checked = true;
    const parentLabel = cb.closest(".checkbox-item");
    if (parentLabel) {
      parentLabel.classList.add("checked");
      parentLabel.scrollIntoView({ behavior: "smooth", block: "center" });

      parentLabel.classList.remove("just-selected-glow");
      void parentLabel.offsetWidth; // trigger reflow
      parentLabel.classList.add("just-selected-glow");
    }

    clearFieldError(`${inputName}-error`);

    if (inputName === "products" && accountType === "Partner" && typeof renderPartnerCategoryBrandCards === "function") {
      renderPartnerCategoryBrandCards();
    }

    showToast(`Selected "${categoryName}"`, "success");
  }
}

function clearProductSearch() {
  const input = document.getElementById("product-category-search-input");
  const clearBtn = document.getElementById("product-search-clear-btn");
  if (input) input.value = "";
  if (clearBtn) {
    clearBtn.classList.add("hidden");
    clearBtn.style.display = "none";
  }
  const grid = document.getElementById("product-checkbox-grid");
  if (grid) {
    grid.querySelectorAll(".checkbox-item").forEach(item => item.style.display = "");
  }
  const notice = document.getElementById("no-matching-product");
  if (notice) {
    notice.classList.add("hidden");
    notice.style.display = "none";
  }
}

function clearServiceSearch() {
  const input = document.getElementById("service-category-search-input");
  const clearBtn = document.getElementById("service-search-clear-btn");
  if (input) input.value = "";
  if (clearBtn) {
    clearBtn.classList.add("hidden");
    clearBtn.style.display = "none";
  }
  const grid = document.getElementById("service-checkbox-grid");
  if (grid) {
    grid.querySelectorAll(".checkbox-item").forEach(item => item.style.display = "");
  }
  const notice = document.getElementById("no-matching-service");
  if (notice) {
    notice.classList.add("hidden");
    notice.style.display = "none";
  }
}
