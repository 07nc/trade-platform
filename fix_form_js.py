import re

with open('form.js', 'r') as f:
    js = f.read()

# Remove references in JS
js = re.sub(r'const offerPriceService = document.getElementById\(\'offer-price-service-wrapper\'\);\s*if \(offerPriceService\) offerPriceService.style.display = \'none\';', '', js)
js = re.sub(r'const offerPriceServiceLabel = document.getElementById\(\'offer-price-service-label\'\);\s*if \(offerPriceServiceLabel\) offerPriceServiceLabel.innerHTML = \'.*?\';', '', js)
js = re.sub(r'const offerPriceService = document.getElementById\(\'offer-price-service-wrapper\'\);\s*if \(offerPriceService\) offerPriceService.style.display = \'block\';', '', js)

# Remove validation
js = re.sub(
    r'if \(accountType === "Customer"\) \{\s*const offerPrice = document\.getElementById\("offerPriceService"\)\.value\.trim\(\);\s*if \(!offerPrice\) \{\s*setFieldError\("offerPriceService", "offerPriceService-error", "Offer price is required"\);\s*scrollToField\("offerPriceService"\);\s*return false;\s*\}\s*\}',
    '',
    js
)

# Update payload mappings to not fail if element doesn't exist
# We will use an empty string for service offer price
js = js.replace(
    'offerPrice: isProduct ? document.getElementById("offerPriceProduct").value.trim() : document.getElementById("offerPriceService").value.trim(),',
    'offerPrice: isProduct ? document.getElementById("offerPriceProduct").value.trim() : "",'
)

with open('form.js', 'w') as f:
    f.write(js)

print("Fixed form.js")
