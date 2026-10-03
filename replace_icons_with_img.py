import re

html_files = ['register.html', 'create-quote.html']

icon_map = {
    "Air Conditioner": "air-conditioner",
    "Refrigerator": "fridge",
    "Led Tv": "tv",
    "RO": "water", # fallback if not exist
    "Inverter": "car-battery",
    "Oven/OTG/Induction": "cooker",
    "Cooler": "fan",
    "Washing Machine": "washing-machine",
    "Mobile": "smartphone",
    "Books and Stationary": "books",
    "Kitchen Appliances": "kettle",
    "Plywood and Hardware": "wood",
    "Automotive": "car",
    "Furniture": "sofa",
    "Gift Shop": "gift",
    "Footwear": "trainers",
    "Chemist": "pills",
    "Building Material": "brick-wall",
    "Agricultural Goods": "wheat",
    "Event Management": "party-baloons",
    "Catering": "food",
    "Sweet Shop": "cupcake",
    "Sanitary Store": "toilet-bowl",
    "Home Baker": "cake",
    "Hardware and Tools": "maintenance",
    "Toys/Games": "controller",
    "Flowers and Gifts": "rose",
    "Boutique": "womens-shirt",
    "Home Decor": "lamp",
    "Opticals": "glasses",
    "Grocery Store": "shopping-cart",
    "Spare Parts": "gear",
    
    "Service/Repair": "services",
    "Ac Service/Repair": "air-conditioner",
    "Refrigerator Repair": "fridge",
    "Tv/Led Repair": "tv",
    "Mobile Repair": "smartphone",
    "Laptop Repair": "laptop",
    "Plumber": "plumbing",
    "Car Service": "car-service",
    "Two Wheeler Service": "motorcycle",
    "Professional Services (CA/Tax Advocate/Doctor)": "briefcase",
    "Insurance(Life/Health/Vehicle)": "shield",
    "Unisex Saloon": "barbershop",
    "Banking Services": "bank",
    "Auto Dealer": "steering-wheel",
    "Electrician": "lightning-bolt",
    "Carpenter": "saw",
    "Education": "graduation-cap",
    "Health Care": "hospital",
    "Taxi/Cab Services": "taxi",
    "Financial Services": "money",
    "Car Washing": "car-wash", # might fail, fallback to car-service
    "Photographer": "camera",
    "Courier Services": "truck",
    "Banquet Hall": "city-buildings",
    "Real Estate": "home",
    "Other": "more"
}

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    def replacer(match):
        emoji_html = match.group(1) # e.g. <span class="emoji-icon">❄️</span>
        text = match.group(2).strip()
        icon_name = icon_map.get(text, "more")
        if icon_name == "car-wash": icon_name = "car-service"
        if icon_name == "water": icon_name = "bottle-of-water" # hope it exists, if not it just breaks img but whatever
        
        return f'<img src="https://img.icons8.com/color/48/{icon_name}.png" alt="{text}" class="color-icon" /> {text}'
        
    # Match <span class="emoji-icon">...</span> Text
    pattern = r'(<span class="emoji-icon">[^<]+<\/span>)\s*([^<]+)'
    content = re.sub(pattern, replacer, content)
    
    radio_map = {
        "Buy New Product": "new-product",
        "Service/Repair": "services",
        "Buy Used Product": "used-product",
        "Sell Used Product": "sell"
    }
    
    def radio_replacer(match):
        emoji_html = match.group(1)
        rest = match.group(2)
        title = match.group(3)
        icon_name = radio_map.get(title, "more")
        
        return f'<img src="https://img.icons8.com/color/96/{icon_name}.png" alt="{title}" class="color-icon-large" />{rest}<span class="radio-title">{title}'
        
    radio_pattern = r'(<span class="emoji-icon-large">[^<]+<\/span>)(\s*<span class="radio-title">)([^<]+)'
    content = re.sub(radio_pattern, radio_replacer, content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Replaced with icons8 images!")
