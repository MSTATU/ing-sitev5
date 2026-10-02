# Lingua Ladder - Netlify + Google Gemini

## Depo (GitHub) yapısı - EN ÖNEMLİ KISIM
Depoyu açtığında ana sayfada (kök dizinde) şunlar görünmeli:
  index.html
  netlify.toml
  package.json
  netlify/functions/ai.js
  src/app.jsx (sadece kaynak, siteyi etkilemez)
Dosyalar bir klasörün İÇİNDE kalırsa Netlify "Page not found" verir.

## Adımlar
1. aistudio.google.com > Get API key > anahtar oluştur ve kopyala.
2. GitHub'da yeni depo aç. Zip'i bilgisayarında aç, İÇİNDEKİ dosyaları (klasörün kendisini değil) depoya yükle
   (Add file > Upload files). "netlify" klasörü de yüklenmeli. .env dosyası YÜKLEME.
3. Netlify > Add new site > Import an existing project > GitHub > depoyu seç.
   Build command: boş bırak. Publish directory: . (nokta) ya da boş.
4. "Add environment variables" (Advanced) kısmından: GEMINI_API_KEY = (anahtarın). Deploy site.
   Anahtarı deploy'dan sonra eklediysen: Deploys > Trigger deploy > Clear cache and deploy site.
5. Kontrol: https://SITEN.netlify.app/.netlify/functions/ai adresini aç.
   {"ok":true,"keySet":true,...} görmelisin.
6. Siteyi aç ve bir kelime turu dene.

## Sorun giderme
- Site "Page not found": index.html depoda kök dizinde değil. Dosyaları kök dizine taşı.
- Fonksiyon adresi 404: netlify klasörü yüklenmemiş ya da netlify.toml yok. Netlify > Functions sekmesinde "ai" görünmeli.
- keySet false: GEMINI_API_KEY eklenmemiş/yanlış isim. Ekle ve "Clear cache and deploy".
- "API key not valid" / 403: anahtar yanlış ya da hesabın kısıtlı. AI Studio'da yeni anahtar oluştur.
- "models/... not found": MODEL_FAST ve MODEL_SMART ortam değişkenlerini AI Studio'daki güncel bir model adıyla ayarla.
- "timeout": Netlify varsayılan ~10 sn. THINKING_BUDGET=0 ekle (destekleyen modellerde) ya da daha hızlı bir model seç.
- "Ücretsiz kota doldu" (429): ücretsiz limit bitti; bekle ya da AI Studio'da ücretli katmanı değerlendir.
- Boş/beyaz sayfa: tarayıcıda F12 > Console'daki kırmızı hatayı bana gönder.

## Notlar
- Ücretsiz katmanda içerik Google tarafından ürün geliştirmede kullanılabilir. Kullanıcılara not düş.
- Sesli okuma tarayıcının kendi ses motorunu kullanır (ücretsiz, API gerekmez). Sağ üstteki düğmeyle otomatik okuma açılır;
  kelimenin yanındaki "Dinle" tuşu her zaman çalışır.
- Konuşma tanıma (Speaking) en iyi Chrome/Edge'de, https adresinde çalışır.
