with open('form.js', 'r') as f:
    js = f.read()

# Replace hardcoded 50.00 in the UI with dynamic variable
js = js.replace('₹50.00\n              </div>\n              <p style="color: var(--text-muted); font-size: 0.85rem;">One-time platform service fee</p>', '₹${currentPaymentAmount}.00\n              </div>\n              <p style="color: var(--text-muted); font-size: 0.85rem;">One-time platform service fee</p>')
js = js.replace('₹50.00\n              </div>\n              <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.5rem;">\n                  One-time non-refundable fee for processing your request.', '₹${currentPaymentAmount}.00\n              </div>\n              <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.5rem;">\n                  One-time non-refundable fee for processing your request.')

# Fix string interpolation (change double quotes to backticks)
js = js.replace('"Pay ₹${currentPaymentAmount} & Submit"', '`Pay ₹${currentPaymentAmount} & Submit`')

with open('form.js', 'w') as f:
    f.write(js)

print("Updated form.js")
