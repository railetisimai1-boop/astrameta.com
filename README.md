# astra-meta — kurumsal tek sayfa site

Statik, tek dosyalık (build gerektirmez) site. TR/EN çift dilli; Türkiye'den girenler
otomatik Türkçe, diğerleri İngilizce görür (sağ üstte TR/EN düğmesi, seçim hatırlanır).
Form Web3Forms ile çalışır (backend yok).

## Konsept (2026-09-16 yeniden tasarım)
"Yörünge" metaforu: **Getir** (çekim) + **Yönet** (yörünge) = **Büyü** (takımyıldız).
Bölümler: Hero → 01 Model (kaydırmaya bağlı yörünge hikâyesi) → 02 Ana ürün (müşteri bulma
sistemi: organik web sitesi + Google/Meta reklam + yapay zekâ mail) → 03 Fark → 04 Süreç →
05 Uyum → 06 İletişim → Final → Footer. Hizmetler 2026-10-29'da ayrı sayfaya taşındı (`/hizmetler/`).

## Dosyalar
- `index.html` — tüm site (HTML + CSS + JS tek dosyada; sözlükler `I18N` nesnesinde)
- `logo-nav.webp` — nav/footer wordmark · `logo.jpg` — favicon · `og.jpg` — paylaşım görseli
- `privacy.html`, `terms.html`, `refund.html` — politika sayfaları
- `hizmetler/index.html` — Hizmetler sayfası (2026-10-29): başta şirkete özel sistem (anlatırsın, görüşürüz, kurarız),
  sonra örnekler (her birinin kendi simgesi ve rengi var, `.pm-*`): 01 proforma fatura
  otomasyonu (kaydırdıkça ilerleyen `#pfx` sahnesi: mail ya da Excel, proforma, packing list, onay, düzeltme, gönderim +
  eskiden/şimdi; sayfanın ilk ekranında, bölümün başında ve sonunda çalışan demoya bağlantı: demo.astra-meta.com; ana sayfada 02 Ürün notunda da var),
  02 rutin otomasyonu ("bir talep geldiğinde" akışı + adım adım teklif rutini örneği), 03 mağaza otomasyonu (AI Otomasyon sayfasına bağlanır), 04 AI SEO Agent (`#ai-seo`: ChatGPT, Gemini, Claude önersin diye site düzenleme; rakamlar gerçek ölçüm, müşteri adı yazılmaz, garanti verilmez). 05 fatura ve banka kaydı düzenleme (`#kayit`, 2026-11-07: çok şubeli yeme içme; örnek tablo kurgusal veri ve "sample" diye işaretli, indirilebilir Excel `hizmetler/Astra-Meta-Sample-Invoices-and-Bank-2026-11-04.xlsx`; hizmet olarak anlatılır, kurulu ürün iması yok). Nav, footer, dil ve `makePipe` ana sayfadan kopyadır.
- `ai-automation/index.html` — AI Otomasyon sayfası (Amazon + Shopify şeritleri, 2026-10-13'te ana sayfadan taşındı).
  Nav, footer, dil sistemi ve `makePipe` ana sayfadan kopyadır; ana sayfada değişirse burada da değiştir.
- `uk/` — eski UK landing page 2026-10-13'te kaldırıldı, `uk/index.html` sadece ana sayfaya yönlendirir
- `pay/` — ayrı ödeme servisi (Coolify'da ayrı app)
- demo.astra-meta.com bu depoda DEĞİL: VPS'te ayrı konteyner (`proforma-demo`). Eski yol astra-meta.com/proforma-demo/ Traefik'te oraya yönlenir. Kaynak Mac'te `ASTRA-META/proforma-otomasyonu/demo`, yayın `./deploy.sh`.
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
