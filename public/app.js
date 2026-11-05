// ==========================================================
// Gemini Çeviri Uygulaması - İstemci Tarafı (Client-side) JavaScript
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elemanlarını Seçelim
  const sourceText = document.getElementById('sourceText');
  const targetText = document.getElementById('targetText');
  const sourceLangSelect = document.getElementById('sourceLangSelect');
  const targetLangSelect = document.getElementById('targetLangSelect');
  const swapLangsBtn = document.getElementById('swapLangsBtn');
  
  const domainSelect = document.getElementById('domainSelect');
  const styleSelect = document.getElementById('styleSelect');
  
  const toggleGlossaryBtn = document.getElementById('toggleGlossaryBtn');
  const glossarySection = document.getElementById('glossarySection');
  const closeGlossaryBtn = document.getElementById('closeGlossaryBtn');
  const glossaryInput = document.getElementById('glossaryInput');
  const glossaryCount = document.getElementById('glossaryCount');
  
  const translateBtn = document.getElementById('translateBtn');
  const translateLoader = document.getElementById('translateLoader');
  const copyBtn = document.getElementById('copyBtn');
  const copyTooltip = document.getElementById('copyTooltip');
  const clearSourceBtn = document.getElementById('clearSourceBtn');
  
  const sourceCharCount = document.getElementById('sourceCharCount');
  const targetCharCount = document.getElementById('targetCharCount');
  const statusIndicator = document.getElementById('statusIndicator');
  
  const errorBanner = document.getElementById('errorBanner');
  const errorTitle = document.getElementById('errorTitle');
  const errorMessage = document.getElementById('errorMessage');
  const errorHint = document.getElementById('errorHint');
  const closeErrorBtn = document.getElementById('closeErrorBtn');

  // 1. Karakter Sayacı Güncelleme
  function updateCharCounts() {
    const sLen = sourceText.value.length;
    const tLen = targetText.innerText.length;
    sourceCharCount.textContent = `${sLen} karakter`;
    targetCharCount.textContent = `${tLen} karakter`;
  }

  sourceText.addEventListener('input', () => {
    updateCharCounts();
    hideError();
  });

  // 2. Terimce Çekmecesi Açma / Kapatma
  toggleGlossaryBtn.addEventListener('click', () => {
    const isHidden = glossarySection.classList.toggle('hidden');
    toggleGlossaryBtn.classList.toggle('active', !isHidden);
    toggleGlossaryBtn.setAttribute('aria-expanded', !isHidden);
  });

  closeGlossaryBtn.addEventListener('click', () => {
    glossarySection.classList.add('hidden');
    toggleGlossaryBtn.classList.remove('active');
    toggleGlossaryBtn.setAttribute('aria-expanded', 'false');
  });

  // Terim sayısını hesaplama
  glossaryInput.addEventListener('input', () => {
    const lines = glossaryInput.value.split('\n').filter(line => line.includes('='));
    glossaryCount.textContent = lines.length;
  });

  // 3. Dilleri Yer Değiştirme (Swap)
  swapLangsBtn.addEventListener('click', () => {
    const tempLang = sourceLangSelect.value;
    sourceLangSelect.value = targetLangSelect.value;
    targetLangSelect.value = tempLang;

    // Metinler varsa onları da yer değiştir
    const currentTarget = targetText.innerText.trim();
    if (currentTarget) {
      sourceText.value = currentTarget;
      targetText.innerText = '';
      updateCharCounts();
    }
  });

  // 4. Kaynak Metni Temizle
  clearSourceBtn.addEventListener('click', () => {
    sourceText.value = '';
    targetText.innerText = '';
    updateCharCounts();
    hideError();
    sourceText.focus();
  });

  // 5. Hata Göster / Gizle Yardımcı Fonksiyonları
  function showError(title, message, hint) {
    errorTitle.textContent = title || 'Hata';
    errorMessage.textContent = message;
    if (hint) {
      errorHint.textContent = 'Ne yapmalısınız: ' + hint;
      errorHint.classList.remove('hidden');
    } else {
      errorHint.classList.add('hidden');
    }
    errorBanner.classList.remove('hidden');
  }

  function hideError() {
    errorBanner.classList.add('hidden');
  }

  closeErrorBtn.addEventListener('click', hideError);

  // 6. Çeviriyi Panoya Kopyalama
  copyBtn.addEventListener('click', async () => {
    const textToCopy = targetText.innerText.trim();
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      copyTooltip.textContent = 'Kopyalandı!';
      copyBtn.style.color = 'var(--red-primary)';
      setTimeout(() => {
        copyTooltip.textContent = 'Kopyala';
        copyBtn.style.color = '';
      }, 2000);
    } catch (err) {
      console.error('Kopyalama hatası:', err);
      showError('Kopyalama Hatası', 'Metin panoya kopyalanamadı. Lütfen metni seçip elle kopyalayın.', '');
    }
  });

  // 7. Çeviri İstek Fonksiyonu
  async function performTranslation() {
    const text = sourceText.value.trim();

    if (!text) {
      showError('Metin Boş', 'Lütfen çevirmek istediğiniz bir metin girin.', 'Metin kutusuna birkaç cümle yazın veya yapıştırın.');
      sourceText.focus();
      return;
    }

    hideError();

    // UI'ı "Çevriliyor..." durumuna alalım
    translateBtn.disabled = true;
    translateLoader.classList.remove('hidden');
    statusIndicator.textContent = 'Çevriliyor...';
    statusIndicator.className = 'status-translating';

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          sourceLang: sourceLangSelect.value,
          targetLang: targetLangSelect.value,
          domain: domainSelect.value,
          style: styleSelect.value,
          glossary: glossaryInput.value
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bilinmeyen bir sunucu hatası oluştu.');
      }

      // Çeviriyi ekrana yaz
      targetText.innerText = data.translation || '';
      updateCharCounts();
      statusIndicator.textContent = 'Tamamlandı';
      statusIndicator.className = 'status-ready';

    } catch (err) {
      console.error('İstek Hatası:', err);
      // Backend'den dönen açıklayıcı hatayı ya da ağ hatasını göster
      showError(
        'Çeviri Yapılamadı',
        err.message || 'Sunucuya ulaşılamadı.',
        'Lütfen internet bağlantınızı veya .env dosyasındaki GEMINI_API_KEY bilginizi kontrol edin.'
      );
      statusIndicator.textContent = 'Hata oluştu';
      statusIndicator.className = 'status-translating';
    } finally {
      translateBtn.disabled = false;
      translateLoader.classList.add('hidden');
    }
  }

  // Butona tıklama ve Ctrl+Enter kısayolu
  translateBtn.addEventListener('click', performTranslation);

  sourceText.addEventListener('keydown', (e) => {
    // Ctrl + Enter veya Command + Enter tuşlandığında hızlı çeviri
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      performTranslation();
    }
  });
});

