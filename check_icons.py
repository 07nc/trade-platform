import urllib.request

icons = ["water-glass", "drop", "faucet", "rose", "tulip"]

found = []
missing = []

for icon in icons:
    url = f"https://img.icons8.com/color/48/{icon}.png"
    try:
        req = urllib.request.Request(url, method='HEAD')
        res = urllib.request.urlopen(req)
        found.append(icon)
    except Exception as e:
        missing.append(icon)

print(f"Found {len(found)}: {', '.join(found)}")
print(f"Missing {len(missing)}: {', '.join(missing)}")
