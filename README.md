# 🌐 Gemini Akıllı Makine Çevirisi Uygulaması

Gemini API destekli, özel terimce (glossary), uzmanlık alanı ve üslup seçimi yapabilen, DeepL tasarım dilinden ilham alan modern makine çevirisi web uygulaması.

---

## 🚀 Hızlı Kurulum & Çalıştırma (Yeni Başlayanlar İçin)

### 1. Adım: Bağımlılıkları Yükleyin
Proje klasöründe bir terminal (Komut İstemi veya PowerShell) açın ve şu komutu çalıştırın:
```bash
npm install
```
*(Paketler projenize zaten yüklenmiştir, gerektiğinde bu komutla yeniden kurabilirsiniz.)*

---

### 2. Adım: Gemini API Anahtarınızı Ekleyin
Proje klasöründeki `.env` dosyasını Not Defteri veya kullandığınız kod editörü ile açın:
```env
GEMINI_API_KEY=BURAYA_GEMINI_API_ANAHTARINIZI_YAZIN
PORT=3000
```
`BURAYA_GEMINI_API_ANAHTARINIZI_YAZIN` yazan yere Google AI Studio'dan aldığınız API anahtarını yapıştırıp dosyayı kaydedin.

---

### 3. Adım: Uygulamayı Başlatın
Terminalde şu komutu yazıp Enter'a basın:
```bash
npm start
```
Veya:
```bash
node server.js
```

Ekranda şu mesaj belirecektir:
```text
==================================================
🚀 Çeviri uygulaması başarıyla başlatıldı!
🔗 Tarayıcınızda açın: http://localhost:3000
==================================================
```

---

### 4. Adım: Tarayıcıda Açın
Web tarayıcınızı (Chrome, Edge vb.) açın ve adres çubuğuna şunu yazın:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🎯 Özellikler

1. **Dil Seçimi & Hızlı Değiştirme (Swap):**
   - Kaynak ve Hedef dil seçimi (İngilizce, Türkçe, Almanca, İspanyolca, Fransızca, İtalyanca, Rusça, Arapça).
   - Ortadaki ok düğmesi ile tek tıkla dilleri ve mevcut çeviriyi yer değiştirebilirsiniz.
2. **Alan (Domain) Seçimi:**
   - **Genel**, **Hukuk**, **Tıp & Sağlık**, **Teknik & Mühendislik**, **Edebi & Yaratıcı** seçenekleri.
   - Modele giden sistem talimatı otomatik olarak uzmanlık alanının terminolojisine uyum sağlar.
3. **Üslup (Ton) Seçimi:**
   - **Doğal / Varsayılan**, **Resmi (Siz)** veya **Gündelik (Sen)** modları.
4. **Zorunlu Terimce (Glossary):**
   - Çevirmenler için özel `kaynak terim = hedef terim` sözlüğü.
   - Model bu terimleri çeviride harfiyen kullanmaya zorlanır.
  - Varsayılan olarak Google'ın en güncel ve kararlı **`gemini-3.5-flash`** modeli kullanılır.
  - İsteğe bağlı olarak `.env` dosyasında `GEMINI_MODEL=gemini-3.5-flash-lite` şeklinde model adı değiştirilebilir.
5. **Temiz Çıktı Garantisi:**
   - Model doğrudan ve yalnızca çevrilmiş metni döndürür ("İşte çeviriniz:", açıklama veya tırnak işaretleri içermez).
6. **Kapsamlı Türkçe Hata Yönetimi:**
   - API anahtarı girilmediğinde, yanlış olduğunda, kota (rate-limit) dolduğunda veya ağ bağlantısı koptuğunda ne yapılması gerektiğini adım adım Türkçe açıklar.
7. **Kopyalama & Kısayol:**
   - Tek tıkla panoya kopyalama (`Kopyalandı!` geri bildirimi).
   - `Ctrl + Enter` (veya Mac'te `Cmd + Enter`) kısayolu ile hızlı çeviri tetikleme.
8. **Duyarlı (Responsive) Tasarım:**
   - Kırmızı, Lacivert ve Beyaz renk paleti.
   - Masaüstünde iki sütunlu DeepL deneyimi, mobil cihazlarda ve tabletlerde otomatik dikey düzen.

