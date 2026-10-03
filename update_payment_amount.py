import re

with open('form.js', 'r') as f:
    js = f.read()

# 1. Add currentPaymentAmount global variable
js = js.replace('let isFreeService = false;', 'let isFreeService = false;\nlet currentPaymentAmount = 50;')

# 2. Add calculation in handleStep2Submit
calc_code = """
    isFreeService = (selectedCustomerService === "Service/Repair");

    currentPaymentAmount = 50;
    if (type === "product") {
        const price = parseFloat(document.getElementById("offerPriceProduct").value) || 0;
        currentPaymentAmount = Math.max(10, Math.min(50, Math.round(price * 0.025)));
    }
"""
js = js.replace('isFreeService = (selectedCustomerService === "Service/Repair");', calc_code)

# 3. Replace hardcoded 50 in the HTML strings inside handleStep2Submit
# We will do simple string replacements inside the HTML blocks.
# First block (isFreeService)
js = js.replace('>₹50.00</div>', '>₹${currentPaymentAmount}</div>')
# Wait, some places say "The ₹50 service fee has been waived"
js = js.replace('The ₹50 service fee', 'The ₹${currentPaymentAmount} service fee')
js = js.replace('standard ₹50 service fee', 'standard ₹${currentPaymentAmount} service fee')
js = js.replace('Pay ₹50 & Submit', 'Pay ₹${currentPaymentAmount} & Submit')

with open('form.js', 'w') as f:
    f.write(js)

print("Updated form.js with dynamic payment amounts")
