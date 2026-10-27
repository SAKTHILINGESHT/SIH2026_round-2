import urllib.request
import json
import os
import sys

def download_dataset():
    url = 'https://indian-colleges-list.vercel.app/api/institutions'
    dest_dir = r'C:\Users\SAKTHI LINGESH\.gemini\antigravity\scratch\aicte-trust-engine\server\src\data'
    os.makedirs(dest_dir, exist_ok=True)
    dest_file = os.path.join(dest_dir, 'national_colleges_dataset.json')

    print(f"Downloading dataset from {url}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    
    with urllib.request.urlopen(req, timeout=45) as resp:
        content = resp.read().decode('utf-8')
        data = json.loads(content)

    records = data.get('data', [])
    print(f"Total records received: {len(records)}")

    with open(dest_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False)

    size_mb = os.path.getsize(dest_file) / (1024 * 1024)
    print(f"Saved to {dest_file} ({size_mb:.2f} MB)")

    # Print summary statistics
    types = {}
    districts = set()
    for item in records:
        itype = item.get('institution_type') or 'Unknown'
        types[itype] = types.get(itype, 0) + 1
        d = item.get('district')
        if d:
            districts.add(d)

    print("\n--- Summary ---")
    print(f"Unique Districts: {len(districts)}")
    print("Institution Types:")
    for k, v in sorted(types.items(), key=lambda x: -x[1])[:8]:
        print(f"  {k}: {v}")

if __name__ == '__main__':
    download_dataset()
