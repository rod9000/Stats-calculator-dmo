import requests
from bs4 import BeautifulSoup

resp = requests.get("https://web.archive.org/web/2026/https://dmowiki.com/Shoutmon_X7_Superior_Mode", timeout=15)
text = resp.text
print("Length:", len(text))
print("Has Cloudflare:", "challenges.cloudflare.com" in text or "Just a moment" in text)

soup = BeautifulSoup(text, "html.parser")
tables = soup.find_all("table", class_="wikitable")
print("Number of wikitable tables:", len(tables))
if tables:
    for i, t in enumerate(tables):
        print("Table %d: %d rows" % (i, len(t.find_all("tr"))))
        header = t.find("th")
        if header:
            print("  Header:", header.get_text(strip=True)[:80])

# See the actual response URL and if Wayback redirected
print("Final URL:", resp.url)

# Check for Wayback banner / content
has_wm = "web.archive.org" in text or "wayback" in text.lower()
print("Has Wayback UI:", has_wm)
