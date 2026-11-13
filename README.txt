# PKFiyat – İlk sürüm

## İçerik
- `index.html`: web arayüzü
- `style.css`: modern, mobil uyumlu tasarım
- `app.js`: arama, marka filtresi, sıralama
- `products.json`: Excel'den çıkarılmış herkese açık ürün alanları
- `update_products.py`: yeni Excel'den ürün listesini yenileme aracı

## Yerelde test
Dosyaları bir klasöre çıkarın. `index.html` dosyasına çift tıklamak yerine klasörde terminal açıp:
`python -m http.server 8000`
komutunu çalıştırın. Sonra `http://localhost:8000` adresini açın.

## Excel fiyatlarını güncelleme
1. Yeni Excel dosyasını bu klasöre kopyalayın.
2. Python kurulu değilse python.org'dan kurun.
3. Terminalde `pip install openpyxl` çalıştırın.
4. `python update_products.py "ExcelDosyaniz.xlsx"` komutunu çalıştırın.
5. Oluşan `products.json` dosyasını siteyle birlikte yayınlayın.

## Ücretsiz yayın
Bu statik site GitHub Pages ile yayınlanabilir. GitHub'da boş bir repository oluşturup bu dosyaları yükleyin; Settings > Pages bölümünden `Deploy from a branch`, `main` ve `/ (root)` seçin.
GitHub Pages ücretsiz alt alan adı verir. Özel `pkfiyat.com` alan adı ayrıca satın alınmalıdır.

## Gizlilik / fiyat alanları
`products.json` yalnızca Marka, Model İsmi, Cihaz Modeli, Cihaz Kodu, Kampanya Tipi, Kampanya Kodu, Peşine Kontrat Aboneye Kesilecek Cihaz Bedeli ve Taahhüt Süresi alanlarını içerir.
Bayi Al-Sat Kazanç, Bayi Kazancı, toplam kazanç ve mahsuplaşma tutarı dışarı aktarılmaz.
Yayınlamadan önce fiyatların herkese açık olmasının uygun olduğundan emin olun.
