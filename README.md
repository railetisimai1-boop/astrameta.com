# astra-meta — kurumsal tek sayfa site

Statik, tek dosyalık (build gerektirmez) site. TR/EN çift dilli; Türkiye dışından
girenler otomatik İngilizce görür. Form Web3Forms ile çalışır (backend yok).

## Dosyalar
- `index.html` — tüm site (HTML + CSS + JS tek dosyada)
- `Dockerfile` — Coolify/Docker için nginx ile yayınlar

## Yayınlamadan önce doldurulacaklar
1. **Web3Forms anahtarı:** web3forms.com'dan `aydin@astra-meta.com` ile ücretsiz Access Key al,
   `index.html` içinde `BURAYA_WEB3FORMS_ANAHTARI` yazan yere yapıştır.
2. **WhatsApp numarası:** `index.html` içinde `905XXXXXXXXX` (2 yerde) → kendi numaran.

## Coolify ile yayın (özet)
1. Bu repoyu GitHub'a yükle.
2. Coolify → New Resource → **Public/Private Repository** → repo URL'sini ver.
3. Build Pack: **Dockerfile** (otomatik algılanır). Port 80.
4. Domain alanına `astra-meta.com` (ve `www.astra-meta.com`) yaz → Coolify SSL'i otomatik kurar.
5. Deploy.

## DNS (Hostinger)
- `A` kaydı: `@` → VPS IP
- `A` kaydı: `www` → VPS IP
- Yayılma sonrası Coolify Let's Encrypt sertifikasını otomatik alır.

## Güncelleme
Dosyayı değiştir → `git push` → Coolify otomatik (veya tek tık) yeniden yayınlar.
