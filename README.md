# astra-meta — kurumsal tek sayfa site

Statik, tek dosyalık (build gerektirmez) site. TR/EN çift dilli; Türkiye'den girenler
otomatik Türkçe, diğerleri İngilizce görür (sağ üstte TR/EN düğmesi, seçim hatırlanır).
Form Web3Forms ile çalışır (backend yok).

## Konsept (2026-09-16 yeniden tasarım)
"Yörünge" metaforu: **Getir** (çekim) + **Yönet** (yörünge) = **Büyü** (takımyıldız).
Bölümler: Hero → 01 Model (kaydırmaya bağlı yörünge hikâyesi) → 02 Hizmetler →
03 Kanıt → 04 Süreç → 05 Uyum → 06 İletişim → Final → Footer.

## Dosyalar
- `index.html` — tüm site (HTML + CSS + JS tek dosyada; sözlükler `I18N` nesnesinde)
- `logo-nav.webp` — nav/footer wordmark · `logo.jpg` — favicon · `og.jpg` — paylaşım görseli
- `privacy.html`, `terms.html`, `refund.html` — politika sayfaları
- `uk/` — ayrı landing page · `pay/` — ayrı ödeme servisi (Coolify'da ayrı app)
- `Dockerfile` — Coolify/Docker için nginx ile yayınlar (port 80)

## Eski siteye dönmek
Yeniden tasarım öncesi hâl: git tag `yedek-2026-09-16-eski-site` ve branch `eski-site-2026-09-16`.
```
git checkout yedek-2026-09-16-eski-site -- index.html
git commit -m "Eski siteye dön" && git push
```
Ayrıca Masaüstü'nde `astra-meta-site-YEDEK-2026-09-16` klasör kopyası var.

## Güncelleme
Dosyayı değiştir → `git push` → GitHub webhook Coolify'ı otomatik yeniden yayınlar.
