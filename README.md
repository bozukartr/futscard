# Final Eleven

Bilgisayara karşı oynanan, mobil öncelikli futbol kart düellosu.

**Canlı oyun:** https://bozukartr.github.io/futscard/

## Özellikler

- Tamamı kurgusal 150 futbolcu kartı
- Pozisyona göre ağırlıklandırılmış mantıklı Defans, Pas, Şut, Hız, Dribbling ve Overall değerleri
- 7 formasyon: 4-3-3, 4-4-2, 4-2-3-1, 3-5-2, 5-3-2, 3-4-3 ve 5-4-1
- Seçilen formasyona tam uyumlu, çakışmasız 11'er kart dağıtımı
- Bilgisayara karşı 11 turluk özellik karşılaştırma maçı
- Kart havuzu ekranı ve mevki grubu filtreleri
- Galibiyet/mağlubiyet/seri kaydı
- Mobil güvenli alanlar, dokunmatik kontroller ve çevrimdışı PWA desteği

## Çalıştırma

Tarayıcı güvenlik özellikleri ve çevrimdışı destek için klasörde basit bir yerel sunucu açın:

```bash
python3 -m http.server 8080
```

Ardından `http://localhost:8080` adresini açın. Ana oyun, `index.html` dosyasına doğrudan çift tıklanarak da oynanabilir; yalnızca çevrimdışı önbellek devre dışı kalır.

## Oyun kuralı

Her tur kendi açık kartından bir özellik seçilir. Rakip kartı açılır ve yüksek değer turu kazanır. 11 turun sonunda daha çok tur kazanan taraf maçı alır. Beraberlikte iki taraf da puan kazanmaz.

Oyuncu adları ve soyadları bu proje için üretilmiştir; gerçek kişilerle olası benzerlikler tesadüfidir.
