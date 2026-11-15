/* ═══════════════════════════════════════════════════════════════
   REAL AMOUNT — Modern App-First Home Page Logic & Localization
   ═══════════════════════════════════════════════════════════════ */

// ═══════════════════════════════════════
// LOCALIZATION (English & Hindi)
// ═══════════════════════════════════════

const I18N = {
  en: {
    // Navigation
    nav_home: "Home",
    nav_contact: "Contact Us",
    nav_whatsapp: "WhatsApp",

    // Main Headline & Search
    main_headline: "Guaranteed Best Prices,<br />Just Tell Us What You Need!",
    search_placeholder: "What are you looking for? (e.g. AC, TV, Repair...)",

    // Trust Badges
    trust_b1_l1: "Verified",
    trust_b1_l2: "Local Shops",
    trust_b2_l1: "Best Price",
    trust_b2_l2: "Offers",
    trust_b3_l1: "Secure &amp;",
    trust_b3_l2: "Trusted",

    // Primary Action Buttons
    btn_post_req_title: "Post Your<br />Requirement",
    btn_post_req_sub: "",
    btn_post_req_title_plain: "Post Requirement",
    btn_reg_biz_title: "Register<br />Your Business",
    btn_reg_biz_sub: "",
    btn_reg_biz_title_plain: "Register Business",

    // How It Works
    how_it_works_title: "How It Works?",
    hiw_step1: "Post<br />Requirement",
    hiw_step2: "Get Best<br />Offers",
    hiw_step3: "Choose &amp;<br />Connect",

    // Popular Categories Section
    popular_categories_title: "Popular Categories",
    browse_all_btn: "See All ▾",
    cat_ac: "Air Conditioner",
    cat_tv: "Television",
    cat_washing: "Washing Machine",
    cat_fridge: "Refrigerator",
    cat_repair: "Repair Service",
    cat_home_serv: "Home Services",
    cat_home_living: "Home &amp; Living",
    cat_more: "More Categories",

    // Contact Section
    contact_title: "Need Help? Contact Us",
    contact_sub: "Have questions? Reach out — we'd love to hear from you.",
    card_call_title: "Call Us",
    card_email_title: "Email Us",
    card_whatsapp_title: "WhatsApp",

    // Footer & Floating Widget
    footer_copy: "&copy; 2024 Real Amount &bull; All Rights Reserved",
    floating_wa_label: "Order on WhatsApp",

    // Modal
    modal_title: "Browse All Categories",
    modal_desc: "Select any service or product to get the best local prices",
    modal_search_ph: "Filter categories (e.g. car, ac, phone, paint...)",
    modal_tab_all: "All (56)",
    modal_tab_services: "Services &amp; Repairs (24)",
    modal_tab_products: "Products Buy/Sell (32)"
  },

  hi: {
    // Navigation
    nav_home: "होम",
    nav_contact: "संपर्क करें",
    nav_whatsapp: "WhatsApp",

    // Main Headline & Search (Exact user requirement)
    main_headline: "सही दाम की गारंटी,<br />बस अपनी ज़रूरत बताएं!",
    search_placeholder: "क्या खोज रहे हैं? (जैसे AC, TV, Repair, Plumber...)",

    // Trust Badges
    trust_b1_l1: "वेरिफाइड",
    trust_b1_l2: "लोकल दुकानें",
    trust_b2_l1: "बेस्ट प्राइस",
    trust_b2_l2: "ऑफ़र्स",
    trust_b3_l1: "सुरक्षित और",
    trust_b3_l2: "भरोसेमंद",

    // Primary Action Buttons
    btn_post_req_title: "अपनी ज़रूरत<br />बताएं",
    btn_post_req_sub: "लोकल दुकानों से सीधा बेस्ट रेट",
    btn_post_req_title_plain: "अपनी ज़रूरत बताएं",
    btn_reg_biz_title: "अपने व्यवसाय को<br />जोड़ें",
    btn_reg_biz_sub: "दुकान जोड़ें और नए ग्राहक पाएं",
    btn_reg_biz_title_plain: "अपने व्यवसाय को जोड़ें",

    // How It Works
    how_it_works_title: "यह कैसे काम करता है?",
    hiw_step1: "अपनी ज़रूरत<br />बताएं",
    hiw_step2: "बेस्ट ऑफर्स<br />पाएं",
    hiw_step3: "पसंद करें और<br />जुड़ें",

    // Popular Categories Section
    popular_categories_title: "लोकप्रिय कैटेगरी",
    browse_all_btn: "सभी देखें ▾",
    cat_ac: "एयर कंडीशनर",
    cat_tv: "टेलीविजन",
    cat_washing: "वाशिंग मशीन",
    cat_fridge: "रेफ्रिजरेटर",
    cat_repair: "रिपेयर सर्विस",
    cat_home_serv: "होम सर्विसेज",
    cat_home_living: "होम एंड लिविंग",
    cat_more: "सभी कैटेगरी",

    // Contact Section
    contact_title: "मदद चाहिए? संपर्क करें",
    contact_sub: "हम आपको बेस्ट लोकल रेट्स दिलाने के लिए हमेशा तैयार हैं।",
    card_call_title: "कॉल करें",
    card_email_title: "ईमेल करें",
    card_whatsapp_title: "WhatsApp",

    // Footer & Floating Widget
    footer_copy: "&copy; 2024 Real Amount &bull; सर्वाधिकार सुरक्षित",
    floating_wa_label: "WhatsApp पर ऑर्डर करें",

    // Modal
    modal_title: "सभी कैटेगरी देखें",
    modal_desc: "किसी भी सर्विस या प्रोडक्ट को चुनकर सबसे सस्ता रेट पाएं",
    modal_search_ph: "कैटेगरी सर्च करें (उदा. कार, एसी, फोन...)",
    modal_tab_all: "सभी (56)",
    modal_tab_services: "सर्विस व रिपेयर (24)",
    modal_tab_products: "नया/पुराना सामान (32)"
  }
};

let currentLang = 'en'; // Default to English as per user request

function applyLanguage(lang) {
  currentLang = (lang === 'hi') ? 'hi' : 'en';
  document.documentElement.setAttribute('lang', currentLang);

  // Update Toggle Button Text (Show the OTHER language to switch to)
  const langToggleBtn = document.getElementById('lang-toggle-btn');
  const langToggleText = document.getElementById('lang-toggle-text');
  if (langToggleText) {
    langToggleText.textContent = currentLang === 'hi' ? 'English' : 'हिन्दी';
  }

  // Translate all [data-i18n] elements
  const dict = I18N[currentLang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict && dict[key] !== undefined) {
      el.innerHTML = dict[key];
    }
  });

  // Translate all [data-i18n-placeholder] elements
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict && dict[key] !== undefined) {
      el.setAttribute('placeholder', dict[key]);
    }
  });

  // Re-render categories modal if active
  if (typeof window.refreshCategoriesModal === 'function') {
    window.refreshCategoriesModal();
  }

  // Re-render search dropdown if visible
  if (typeof window.refreshCategorySearch === 'function') {
    window.refreshCategorySearch();
  }
}

function initLanguageToggle() {
  const savedLang = localStorage.getItem('real_amount_lang') || 'en';

  const langBtn = document.getElementById('lang-toggle-btn');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      const nextLang = currentLang === 'hi' ? 'en' : 'hi';
      localStorage.setItem('real_amount_lang', nextLang);
      applyLanguage(nextLang);
    });
  }

  applyLanguage(savedLang);
}

// ═══════════════════════════════════════
// LIGHT / DARK NAVY THEME TOGGLE
// ═══════════════════════════════════════

function applyTheme(theme) {
  const validTheme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', validTheme);
  const icon = document.getElementById('theme-toggle-icon');
  if (icon) {
    icon.textContent = validTheme === 'dark' ? '☀️' : '🌙';
  }
}

function initThemeToggle() {
  const savedTheme = localStorage.getItem('real_amount_theme') || 'light';
  applyTheme(savedTheme);

  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('real_amount_theme', newTheme);
      applyTheme(newTheme);
    });
  }
}

// ═══════════════════════════════════════
// COMPLETE CATEGORIES DATA (56 CATEGORIES)
// ═══════════════════════════════════════

const ALL_CATEGORIES = [
  // ── Services & Repairs (24) ──
  {
    name: "Ac Service/Repair",
    nameHi: "एसी सर्विस व रिपेयर",
    type: "service",
    serviceType: "Service/Repair",
    icon: "https://img.icons8.com/color/48/air-conditioner.png",
    keywords: ["ac", "air conditioner", "cooling", "ac repair", "gas charging", "service", "ac installation", "hvac", "एसी", "एयर कंडीशनर", "कूलिंग", "गैस चार्जिंग", "रिपेयर"]
  },
  {
    name: "Refrigerator Repair",
    nameHi: "फ्रिज रिपेयर",
    type: "service",
    serviceType: "Service/Repair",
    icon: "https://img.icons8.com/color/48/fridge.png",
    keywords: ["fridge", "refrigerator", "freezer", "cooling repair", "defrost", "फ्रिज", "रेफ्रिजरेटर"]
  },
  {
    name: "Tv/Led Repair",
    nameHi: "टीवी / एलईडी रिपेयर",
    type: "service",
    serviceType: "Service/Repair",
    icon: "https://img.icons8.com/color/48/tv.png",
    keywords: ["tv", "led", "television", "smart tv", "display", "screen repair", "lcd", "टीवी", "एलईडी", "स्क्रीन"]
  },
  {
    name: "Mobile Repair",
    nameHi: "मोबाइल रिपेयर",
    type: "service",
    serviceType: "Service/Repair",
    icon: "https://img.icons8.com/color/48/smartphone.png",
    keywords: ["mobile", "phone", "smartphone", "iphone", "android", "screen repair", "battery", "display", "मोबाइल", "फोन", "डिस्प्ले", "बैटरी"]
  },
  {
    name: "Laptop Repair",
    nameHi: "लैपटॉप रिपेयर",
    type: "service",
    serviceType: "Service/Repair",
    icon: "https://img.icons8.com/color/48/laptop.png",
    keywords: ["laptop", "computer", "pc", "macbook", "windows", "keyboard", "formatting", "लैपटॉप", "कंप्यूटर"]
  },
  {
    name: "Plumber",
    nameHi: "प्लंबर (नल / पाइप मिस्त्री)",
    type: "service",
    serviceType: "Other Services",
    icon: "https://img.icons8.com/color/48/plumbing.png",
    keywords: ["plumber", "plumbing", "pipe", "tap", "leakage", "water", "drainage", "fittings", "प्लंबर", "नल", "पाइप", "लीकेज", "पानी"]
  },
  {
    name: "Car Service",
    nameHi: "कार सर्विस व मैकेनिक",
    type: "service",
    serviceType: "Service/Repair",
    icon: "https://img.icons8.com/color/48/car-service.png",
    keywords: ["car", "service", "mechanic", "oil change", "auto repair", "brake", "engine", "कार", "गाड़ी", "मैकेनिक", "सर्विस"]
  },
  {
    name: "Two Wheeler Service",
    nameHi: "बाइक व स्कूटी सर्विस",
    type: "service",
    serviceType: "Service/Repair",
    icon: "https://img.icons8.com/color/48/motorcycle.png",
    keywords: ["bike", "scooter", "motorcycle", "scooty", "two wheeler", "bike repair", "बाइक", "स्कूटी", "मोटरसाइकिल"]
  },
  {
    name: "Professional Services (CA/Tax Advocate/Doctor)",
    nameHi: "प्रोफेशनल सर्विसेज (सीए/वकील/डॉक्टर)",
    type: "service",
    serviceType: "Other Services",
    icon: "https://img.icons8.com/color/48/briefcase.png",
    keywords: ["ca", "lawyer", "advocate", "doctor", "tax", "gst", "legal", "consultant", "सीए", "वकील", "डॉक्टर", "टैक्स"]
  },
  {
    name: "Insurance(Life/Health/Vehicle)",
    nameHi: "इंश्योरेंस (लाइफ/हेल्थ/गाड़ी)",
    type: "service",
    serviceType: "Other Services",
    icon: "https://img.icons8.com/color/48/shield.png",
    keywords: ["insurance", "health insurance", "car insurance", "life insurance", "policy", "बीमा", "इंश्योरेंस", "पॉलिसी"]
  },
  {
    name: "Unisex Saloon",
    nameHi: "यूनिसेक्स सैलून व ब्यूटी पार्लर",
    type: "service",
    serviceType: "Other Services",
    icon: "https://img.icons8.com/color/48/barbershop.png",
    keywords: ["salon", "saloon", "haircut", "beauty parlor", "spa", "grooming", "सैलून", "पार्लर", "हेयरकट"]
  },
  {
    name: "Banking Services",
    nameHi: "बैंकिंग व लोन सेवाएं",
    type: "service",
    serviceType: "Other Services",
    icon: "https://img.icons8.com/color/48/bank.png",
    keywords: ["bank", "loan", "personal loan", "home loan", "credit card", "finance", "बैंक", "लोन", "क्रेडिट कार्ड"]
  },
  {
    name: "Auto Dealer",
    nameHi: "ऑटो डीलर (पुरानी कार/गाड़ी)",
    type: "service",
    serviceType: "Other Services",
    icon: "https://img.icons8.com/color/48/steering-wheel.png",
    keywords: ["auto dealer", "used car", "car sale", "second hand car", "कार डीलर", "पुरानी गाड़ी"]
  },
  {
    name: "Electrician",
    nameHi: "इलेक्ट्रीशियन (बिजली मिस्त्री)",
    type: "service",
    serviceType: "Other Services",
    icon: "https://img.icons8.com/color/48/lightning-bolt.png",
    keywords: ["electrician", "wiring", "short circuit", "fan", "switchboard", "inverter", "लाइट", "बिजली", "इलेक्ट्रीशियन"]
  },
  {
    name: "Carpenter",
    nameHi: "कारपेंटर (बढ़ई / लकड़ी का काम)",
    type: "service",
    serviceType: "Other Services",
    icon: "https://img.icons8.com/color/48/saw.png",
    keywords: ["carpenter", "wood work", "furniture repair", "door", "bed", "wardrobe", "कारपेंटर", "बढ़ई", "फर्नीचर"]
  },
  {
    name: "Coaching / Tution",
    nameHi: "कोचिंग व ट्यूशन",
    type: "service",
    serviceType: "Other Services",
    icon: "https://img.icons8.com/color/48/graduation-cap.png",
    keywords: ["coaching", "tuition", "classes", "teacher", "maths", "science", "english", "ट्यूशन", "कोचिंग", "टीचर"]
  },
  {
    name: "Doctor Clinic / Hospital",
    nameHi: "डॉक्टर क्लिनिक व अस्पताल",
    type: "service",
    serviceType: "Other Services",
    icon: "https://img.icons8.com/color/48/hospital.png",
    keywords: ["doctor", "clinic", "hospital", "physician", "medical", "treatment", "डॉक्टर", "क्लिनिक", "अस्पताल"]
  },
  {
    name: "Taxi Service / Tour & Travel",
    nameHi: "टैक्सी सर्विस व टूर ट्रैवल्स",
    type: "service",
    serviceType: "Other Services",
    icon: "https://img.icons8.com/color/48/taxi.png",
    keywords: ["taxi", "cab", "tour", "travels", "outstation cab", "car rental", "टैक्सी", "कैब", "टूर"]
  },
  {
    name: "Finance Broker",
    nameHi: "फाइनेंस ब्रोकर व एजेंट",
    type: "service",
    serviceType: "Other Services",
    icon: "https://img.icons8.com/color/48/money.png",
    keywords: ["finance", "broker", "business loan", "mortgage", "money", "फाइनेंस", "दलाल", "लोन"]
  },
  {
    name: "Car Washing",
    nameHi: "कार वाशिंग व डिटेलिंग",
    type: "service",
    serviceType: "Service/Repair",
    icon: "https://img.icons8.com/color/48/car-service.png",
    keywords: ["car wash", "detailing", "car cleaning", "foam wash", "interior cleaning", "कार वाश", "गाड़ी धोना"]
  },
  {
    name: "Photographer",
    nameHi: "फोटोग्राफर व वीडियोग्राफी",
    type: "service",
    serviceType: "Other Services",
    icon: "https://img.icons8.com/color/48/camera.png",
    keywords: ["photographer", "wedding photography", "video", "photoshoot", "drone", "कैमरा", "फोटोग्राफर", "फोटो"]
  },
  {
    name: "Transport Services",
    nameHi: "ट्रांसपोर्ट व पैकर्स मूवर्स",
    type: "service",
    serviceType: "Other Services",
    icon: "https://img.icons8.com/color/48/truck.png",
    keywords: ["transport", "goods", "tempo", "truck", "packers and movers", "shifting", "ट्रांसपोर्ट", "सामान ढुलाई"]
  },
  {
    name: "Hotel / PG / Restaurant",
    nameHi: "होटल / पीजी / रेस्टोरेंट",
    type: "service",
    serviceType: "Other Services",
    icon: "https://img.icons8.com/color/48/city-buildings.png",
    keywords: ["hotel", "pg", "hostel", "restaurant", "room", "food", "होटल", "पीजी", "रेस्टोरेंट"]
  },
  {
    name: "Property Dealer",
    nameHi: "प्रॉपर्टी डीलर (मकान/दुकान/प्लॉट)",
    type: "service",
    serviceType: "Other Services",
    icon: "https://img.icons8.com/color/48/home.png",
    keywords: ["property", "real estate", "plot", "flat", "rent", "house for sale", "मकान", "प्लॉट", "प्रॉपर्टी डीलर"]
  },

  // ── Products Buy & Sell (32) ──
  {
    name: "Air Conditioner",
    nameHi: "नया एयर कंडीशनर (एसी)",
    type: "product",
    serviceType: "Buy New Product",
    icon: "https://img.icons8.com/color/48/air-conditioner.png",
    keywords: ["ac", "air conditioner", "split ac", "inverter ac", "window ac", "1.5 ton", "एसी", "नया एसी"]
  },
  {
    name: "Refrigerator",
    nameHi: "नया रेफ्रिजरेटर (फ्रिज)",
    type: "product",
    serviceType: "Buy New Product",
    icon: "https://img.icons8.com/color/48/fridge.png",
    keywords: ["fridge", "refrigerator", "double door", "single door", "deep freezer", "फ्रिज", "नया फ्रिज"]
  },
  {
    name: "Led Tv",
    nameHi: "नया एलईडी / स्मार्ट टीवी",
    type: "product",
    serviceType: "Buy New Product",
    icon: "https://img.icons8.com/color/48/tv.png",
    keywords: ["tv", "led", "smart tv", "television", "4k", "55 inch", "43 inch", "32 inch", "टीवी", "स्मार्ट टीवी"]
  },
  {
    name: "RO",
    nameHi: "आरओ वाटर प्यूरीफायर",
    type: "product",
    serviceType: "Buy New Product",
    icon: "https://img.icons8.com/color/48/bottle-of-water.png",
    keywords: ["ro", "water purifier", "water filter", "kent", "aquaguard", "आरओ", "वाटर प्यूरीफायर", "पानी फिल्टर"]
  },
  {
    name: "Inverter Battery",
    nameHi: "इन्वर्टर व बैटरी",
    type: "product",
    serviceType: "Buy New Product",
    icon: "https://img.icons8.com/color/48/car-battery.png",
    keywords: ["inverter", "battery", "luminous", "tubular", "ups", "सोलर", "इन्वर्टर", "बैटरी"]
  },
  {
    name: "Kitchen Appliances (Oven/Chimney etc)",
    nameHi: "किचन अप्लायंसेज (ओवन/चिमनी)",
    type: "product",
    serviceType: "Buy New Product",
    icon: "https://img.icons8.com/color/48/cooker.png",
    keywords: ["microwave", "oven", "chimney", "cooktop", "gas stove", "juicer", "mixer", "चिमनी", "ओवन", "मिक्सर"]
  },
  {
    name: "Tyres(Car/Truck/Tractor etc)",
    nameHi: "टायर (कार/ट्रक/ट्रैक्टर)",
    type: "product",
    serviceType: "Buy New Product",
    icon: "https://img.icons8.com/color/48/tire.png",
    keywords: ["tyre", "tire", "car tyre", "mrf", "apollo", "ceat", "ट्यूब", "टायर"]
  },
  {
    name: "Sanitary Hardware",
    nameHi: "सैनिटरी व हार्डवेयर",
    type: "product",
    serviceType: "Buy New Product",
    icon: "https://img.icons8.com/color/48/toilet-bowl.png",
    keywords: ["sanitary", "hardware", "tiles", "bathroom fittings", "pipes", "washbasin", "हार्डवेयर", "सैनिटरी", "टाइल्स"]
  },
  {
    name: "Furniture",
    nameHi: "फर्नीचर (बेड, सोफा, अलमारी)",
    type: "product",
    serviceType: "Buy New Product",
    icon: "https://img.icons8.com/color/48/sofa.png",
    keywords: ["furniture", "sofa", "bed", "almirah", "dining table", "wardrobe", "chair", "फर्नीचर", "सोफा", "बेड"]
  },
  {
    name: "Washing Machine",
    nameHi: "नयी वाशिंग मशीन",
    type: "product",
    serviceType: "Buy New Product",
    icon: "https://img.icons8.com/color/48/washing-machine.png",
    keywords: ["washing machine", "front load", "top load", "semi automatic", "वाशिंग मशीन", "कपड़े धोने की मशीन"]
  },
  {
    name: "Mobile Phone",
    nameHi: "नया मोबाइल फोन",
    type: "product",
    serviceType: "Buy New Product",
    icon: "https://img.icons8.com/color/48/smartphone.png",
    keywords: ["mobile", "phone", "smartphone", "5g", "samsung", "iphone", "redmi", "realme", "नया मोबाइल", "स्मार्टफोन"]
  },
  {
    name: "Laptop / Desktop",
    nameHi: "लैपटॉप व कंप्यूटर",
    type: "product",
    serviceType: "Buy New Product",
    icon: "https://img.icons8.com/color/48/laptop.png",
    keywords: ["laptop", "computer", "pc", "desktop", "gaming pc", "hp", "dell", "lenovo", "लैपटॉप", "कंप्यूटर"]
  },
  {
    name: "Electric Geyser",
    nameHi: "गीज़र व वाटर हीटर",
    type: "product",
    serviceType: "Buy New Product",
    icon: "https://img.icons8.com/color/48/water-heater.png",
    keywords: ["geyser", "water heater", "instant geyser", "storage geyser", "गीजर", "वाटर हीटर"]
  },
  {
    name: "Air Cooler",
    nameHi: "कूलर (एयर कूलर)",
    type: "product",
    serviceType: "Buy New Product",
    icon: "https://img.icons8.com/color/48/air-conditioner.png",
    keywords: ["cooler", "air cooler", "desert cooler", "symphony", "kenstar", "कूलर", "कमरे का कूलर"]
  },
  {
    name: "CCTV Camera",
    nameHi: "सीसीटीवी कैमरा व सिक्योरिटी",
    type: "product",
    serviceType: "Buy New Product",
    icon: "https://img.icons8.com/color/48/camera.png",
    keywords: ["cctv", "camera", "security camera", "surveillance", "dvr", "cp plus", "hikvision", "सीसीटीवी", "कैमरा"]
  },
  {
    name: "Solar Panel & System",
    nameHi: "सोलर पैनल व इन्वर्टर",
    type: "product",
    serviceType: "Buy New Product",
    icon: "https://img.icons8.com/color/48/solar-panel.png",
    keywords: ["solar", "solar panel", "solar inverter", "rooftop solar", "सोलर", "सोलर पैनल"]
  },
  {
    name: "Grocery Store",
    nameHi: "किराना स्टोर व राशन",
    type: "product",
    serviceType: "Buy New Product",
    icon: "https://img.icons8.com/color/48/shopping-cart.png",
    keywords: ["grocery", "kirana", "supermarket", "ration", "daily needs", "spices", "oil", "किराना", "राशन", "दुकान"]
  },
  {
    name: "Spare Parts",
    nameHi: "स्पेयर पार्ट्स व मशीन पार्ट्स",
    type: "product",
    serviceType: "Buy New Product",
    icon: "https://img.icons8.com/color/48/gear.png",
    keywords: ["spare parts", "auto parts", "machine parts", "engine parts", "accessories", "स्पेयर पार्ट्स", "पार्ट्स"]
  }
];

// ═══════════════════════════════════════
// SIDE NAVIGATION DRAWER
// ═══════════════════════════════════════

function initDrawer() {
  const menuBtn = document.getElementById('menu-toggle-btn');
  const closeBtn = document.getElementById('drawer-close-btn');
  const drawer = document.getElementById('app-drawer');
  const backdrop = document.getElementById('drawer-backdrop');

  window.openDrawer = () => {
    if (drawer) drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.closeDrawer = () => {
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (menuBtn) menuBtn.addEventListener('click', window.openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', window.closeDrawer);
}

// ═══════════════════════════════════════
// CATEGORY SEARCH WITH AUTOCOMPLETE
// ═══════════════════════════════════════

function initCategorySearch() {
  const searchInput = document.getElementById('category-search-input');
  const dropdown = document.getElementById('search-dropdown-results');
  const clearBtn = document.getElementById('search-clear-btn');
  if (!searchInput || !dropdown) return;

  let currentFocusIndex = -1;

  function filterCategories(query) {
    if (!query) {
      return [];
    }
    const q = query.toLowerCase().trim();
    return ALL_CATEGORIES.filter(c => {
      if (c.name.toLowerCase().includes(q)) return true;
      if (c.nameHi && c.nameHi.toLowerCase().includes(q)) return true;
      if (c.keywords && c.keywords.some(k => k.toLowerCase().includes(q))) return true;
      return false;
    });
  }

  function showDropdown() {
    dropdown.classList.remove('hidden');
    dropdown.style.display = 'block';
  }

  function hideDropdown() {
    dropdown.classList.add('hidden');
    dropdown.style.display = 'none';
  }

  function renderDropdown(items) {
    dropdown.innerHTML = "";
    currentFocusIndex = -1;

    if (items.length === 0) {
      const noResText = currentLang === 'hi'
        ? `कोई कैटेगरी नहीं मिली।<br><a href="register.html?type=customer" style="color: var(--accent); font-weight:700; text-decoration: underline; margin-top: 6px; display:inline-block;">फिर भी फॉर्म भरें &rarr;</a>`
        : `No categories found matching your search.<br><a href="register.html?type=customer" style="color: var(--accent); font-weight:700; text-decoration: underline; margin-top: 6px; display:inline-block;">Proceed to form anyway &rarr;</a>`;
      dropdown.innerHTML = `<div class="search-no-results">${noResText}</div>`;
      showDropdown();
      return;
    }

    items.forEach((item, index) => {
      const a = document.createElement('a');
      a.className = 'search-result-item';
      a.href = `register.html?type=customer&category=${encodeURIComponent(item.name)}`;
      a.setAttribute('data-index', index);

      const displayName = (currentLang === 'hi' && item.nameHi) ? item.nameHi : item.name;
      const typeBadge = item.type === 'service'
        ? (currentLang === 'hi' ? 'सर्विस' : 'Service')
        : (currentLang === 'hi' ? 'प्रोडक्ट' : 'Product');

      a.innerHTML = `
        <img src="${item.icon}" alt="" onerror="this.onerror=null; this.src='https://img.icons8.com/color/48/maintenance.png';" />
        <span>${escapeHtml(displayName)}</span>
        <span class="search-result-badge">${typeBadge}</span>
      `;

      a.addEventListener('mousedown', (e) => {
        e.preventDefault();
        window.location.href = a.href;
      });

      dropdown.appendChild(a);
    });

    showDropdown();
  }

  searchInput.addEventListener('focus', () => {
    const val = searchInput.value.trim();
    if (val) {
      renderDropdown(filterCategories(val));
    } else {
      hideDropdown();
    }
  });

  searchInput.addEventListener('input', () => {
    const val = searchInput.value.trim();
    if (clearBtn) {
      if (val) {
        clearBtn.classList.remove('hidden');
        clearBtn.style.display = 'flex';
      } else {
        clearBtn.classList.add('hidden');
        clearBtn.style.display = 'none';
      }
    }

    if (val) {
      renderDropdown(filterCategories(val));
    } else {
      hideDropdown();
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearBtn.classList.add('hidden');
      clearBtn.style.display = 'none';
      hideDropdown();
      searchInput.focus();
    });
  }

  document.addEventListener('click', (e) => {
    const bar = document.getElementById('category-search-bar');
    if (bar && !bar.contains(e.target) && !dropdown.contains(e.target)) {
      hideDropdown();
    }
  });

  searchInput.addEventListener('keydown', (e) => {
    const items = dropdown.querySelectorAll('.search-result-item');
    if (!items.length || dropdown.classList.contains('hidden')) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      currentFocusIndex = (currentFocusIndex + 1) % items.length;
      updateHighlight(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      currentFocusIndex = (currentFocusIndex - 1 + items.length) % items.length;
      updateHighlight(items);
    } else if (e.key === 'Enter') {
      if (currentFocusIndex >= 0 && items[currentFocusIndex]) {
        e.preventDefault();
        items[currentFocusIndex].click();
      }
    } else if (e.key === 'Escape') {
      hideDropdown();
    }
  });

  function updateHighlight(items) {
    items.forEach((item, idx) => {
      if (idx === currentFocusIndex) {
        item.classList.add('highlighted');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('highlighted');
      }
    });
  }

  window.refreshCategorySearch = () => {
    const val = searchInput.value.trim();
    if (val && !dropdown.classList.contains('hidden') && dropdown.style.display !== 'none') {
      renderDropdown(filterCategories(val));
    } else {
      hideDropdown();
    }
  };
}

// ═══════════════════════════════════════
// CATEGORIES BROWSER MODAL
// ═══════════════════════════════════════

function initCategoriesModal() {
  const modal = document.getElementById('categories-modal');
  const closeBtn = document.getElementById('close-categories-modal');
  const grid = document.getElementById('modal-categories-grid');
  const searchInp = document.getElementById('modal-category-search');
  const tabBtns = document.querySelectorAll('.modal-tab');

  if (!modal || !grid) return;

  let activeTab = 'all';

  function renderGrid(filterText = '') {
    grid.innerHTML = '';
    const cleanFilter = filterText.toLowerCase().trim();

    const filtered = ALL_CATEGORIES.filter(item => {
      if (activeTab === 'services' && item.type !== 'service') return false;
      if (activeTab === 'products' && item.type !== 'product') return false;
      if (!cleanFilter) return true;
      if (item.name.toLowerCase().includes(cleanFilter)) return true;
      if (item.nameHi && item.nameHi.toLowerCase().includes(cleanFilter)) return true;
      if (item.keywords && item.keywords.some(k => k.toLowerCase().includes(cleanFilter))) return true;
      return false;
    });

    if (filtered.length === 0) {
      const msg = currentLang === 'hi'
        ? `"${escapeHtml(cleanFilter)}" से मिलती-जुलती कोई कैटेगरी नहीं मिली`
        : `No categories found matching "${escapeHtml(cleanFilter)}"`;
      grid.innerHTML = `<div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--text-sub);">${msg}</div>`;
      return;
    }

    filtered.forEach(item => {
      const a = document.createElement('a');
      a.className = 'modal-category-card';
      a.href = `register.html?type=customer&category=${encodeURIComponent(item.name)}`;
      const displayName = (currentLang === 'hi' && item.nameHi) ? item.nameHi : item.name;
      a.innerHTML = `
        <img src="${item.icon}" alt="" onerror="this.onerror=null; this.src='https://img.icons8.com/color/48/maintenance.png';" />
        <span class="modal-category-card-name">${escapeHtml(displayName)}</span>
      `;
      grid.appendChild(a);
    });
  }

  window.openCategoriesModal = () => {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    grid.scrollTop = 0;
    grid.scrollLeft = 0;
    activeTab = 'all';
    tabBtns.forEach(b => {
      if (b.getAttribute('data-tab') === 'all') b.classList.add('active');
      else b.classList.remove('active');
    });
    if (searchInp) searchInp.value = '';
    renderGrid('');
    if (searchInp) setTimeout(() => searchInp.focus(), 100);
  };

  window.closeCategoriesModal = () => {
    modal.classList.add('hidden');
    modal.style.display = 'none';
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', window.closeCategoriesModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) window.closeCategoriesModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden') && modal.style.display !== 'none') {
      window.closeCategoriesModal();
    }
  });

  if (searchInp) {
    searchInp.addEventListener('input', () => {
      renderGrid(searchInp.value);
    });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.getAttribute('data-tab');
      renderGrid(searchInp ? searchInp.value : '');
    });
  });

  window.refreshCategoriesModal = () => {
    if (modal.style.display === 'flex') {
      renderGrid(searchInp ? searchInp.value : '');
    }
  };
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ═══════════════════════════════════════
// INITIALIZATION ON DOM READY
// ═══════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initLanguageToggle();
  initDrawer();
  initCategorySearch();
  initCategoriesModal();
});
