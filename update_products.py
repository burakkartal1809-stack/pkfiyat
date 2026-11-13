"""
PKFiyat ürün listesini Excel'den yenileme aracı.
Kullanım:
  python update_products.py "Yeni Microsoft Excel Çalışma Sayfası.xlsx"
Gerekli paketler:
  pip install openpyxl
Çıktı: products.json (yalnızca sitede gösterilmesi gereken güvenli alanlar)
"""
import json, sys
from openpyxl import load_workbook

SOURCE = sys.argv[1] if len(sys.argv) > 1 else "Yeni Microsoft Excel Çalışma Sayfası.xlsx"
SHEET = "Peşine Kontrat SHOP (SMP&SPs)"
wb = load_workbook(SOURCE, read_only=True, data_only=True)
ws = wb[SHEET]
headers = [c.value for c in next(ws.iter_rows(min_row=1, max_row=1))]
wanted = {
    "brand": "Marka",
    "model": "Model İsmi",
    "deviceModel": "Cihaz Modeli",
    "deviceCode": "Cihaz Kodu",
    "campaignType": "Kampanya Tipi",
    "campaignCode": "Kampanya Kodu",
    "price": "Peşine Kontrat Aboneye Kesilecek Cihaz Bedeli",
    "termMonths": "Tahhüt Süresi",
}
idx = {key: headers.index(col) for key, col in wanted.items()}
items = []
for row in ws.iter_rows(min_row=2, values_only=True):
    if not any(v is not None for v in row): continue
    item = {key: row[i] for key, i in idx.items()}
    items.append(item)
with open("products.json", "w", encoding="utf-8") as f:
    json.dump(items, f, ensure_ascii=False, default=str, separators=(",", ":"))
print(f"Tamamlandı: {len(items)} ürün products.json dosyasına aktarıldı.")
print("Kontrol: products.json dosyasında bayi kazancı veya diğer ticari sütunlar bulunmaz.")
