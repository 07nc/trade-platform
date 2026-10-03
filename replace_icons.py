import re

html_files = ['register.html', 'create-quote.html']

emoji_map = {
    "Air Conditioner": "❄️",
    "Refrigerator": "🧊",
    "Led Tv": "📺",
    "RO": "💧",
    "Inverter": "🔋",
    "Oven/OTG/Induction": "🍳",
    "Cooler": "🌀",
    "Washing Machine": "🧺",
    "Mobile": "📱",
    "Books and Stationary": "📚",
    "Kitchen Appliances": "☕",
    "Plywood and Hardware": "🪵",
    "Automotive": "🚗",
    "Furniture": "🛋️",
    "Gift Shop": "🎁",
    "Footwear": "👟",
    "Chemist": "💊",
    "Building Material": "🧱",
    "Agricultural Goods": "🌾",
    "Event Management": "🎉",
    "Catering": "🍽️",
    "Sweet Shop": "🍩",
    "Sanitary Store": "🚽",
    "Home Baker": "🎂",
    "Hardware and Tools": "🛠️",
    "Toys/Games": "🎮",
    "Flowers and Gifts": "💐",
    "Boutique": "👗",
    "Home Decor": "🖼️",
    "Opticals": "👓",
    "Grocery Store": "🛒",
    "Spare Parts": "⚙️",
    "Service/Repair": "🔧",
    "Ac Service/Repair": "❄️",
    "Refrigerator Repair": "🧊",
    "Tv/Led Repair": "📺",
    "Mobile Repair": "📱",
    "Laptop Repair": "💻",
    "Plumber": "🪠",
    "Car Service": "🚘",
    "Two Wheeler Service": "🏍️",
    "Professional Services (CA/Tax Advocate/Doctor)": "💼",
    "Insurance(Life/Health/Vehicle)": "🛡️",
    "Unisex Saloon": "✂️",
    "Banking Services": "🏦",
    "Auto Dealer": "🚙",
    "Electrician": "⚡",
    "Carpenter": "🪚",
    "Education": "🎓",
    "Health Care": "🏥",
    "Taxi/Cab Services": "🚕",
    "Financial Services": "💰",
    "Car Washing": "🧽",
    "Photographer": "📷",
    "Courier Services": "🚚",
    "Banquet Hall": "🏛️",
    "Real Estate": "🏠",
    "Other": "📦"
}

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    pattern = r'<i class="ph ph-[a-z-]+"><\/i>\s*([^<]+)'
    
    def replacer(match):
        text = match.group(1).strip()
        if text in emoji_map:
            return f'<span class="emoji-icon">{emoji_map[text]}</span> {text}'
        return match.group(0)
        
    content = re.sub(pattern, replacer, content)
    
    radio_map = {
        "Buy New Product": "🛍️",
        "Service/Repair": "🔧",
        "Buy Used Product": "♻️",
        "Sell Used Product": "🤝"
    }
    
    def radio_replacer(match):
        rest = match.group(1)
        title = match.group(2)
        if title in radio_map:
            return f'<span class="emoji-icon-large">{radio_map[title]}</span>{rest}<span class="radio-title">{title}'
        return match.group(0)
        
    radio_pattern = r'<i class="ph ph-[^"]+" style="[^"]+"><\/i>(\s*<span class="radio-title">)([^<]+)'
    content = re.sub(radio_pattern, radio_replacer, content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Icons replaced with Emojis!")
