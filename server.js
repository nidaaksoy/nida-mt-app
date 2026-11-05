// Gerekli modülleri dahil ediyoruz
require('dotenv').config();
const express = require('express');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;

// JSON gövdesini ve public statik dosyaları okumak için ara yazılımlar (middleware)
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Çeviri Endpoint'i
app.post('/api/translate', async (req, res) => {
  const { text, sourceLang, targetLang, domain, style, glossary } = req.body;

  // 1. Temel girdi kontrolleri
  if (!text || !text.trim()) {
    return res.status(400).json({
      error: 'Lütfen çevrilmesini istediğiniz bir metin girin.'
    });
  }

  // 2. API anahtarı kontrolü
  const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';
  if (!apiKey || apiKey === 'BURAYA_GEMINI_API_ANAHTARINIZI_YAZIN') {
    return res.status(401).json({
      error: 'Gemini API anahtarı bulunamadı veya henüz eklenmedi. Lütfen projenin ana dizinindeki .env dosyasını açıp GEMINI_API_KEY değerine geçerli anahtarınızı ekleyin ve sunucuyu yeniden başlatın.'
    });
  }

  try {
    // Gemini SDK istemcisini başlatıyoruz
    const ai = new GoogleGenAI({ apiKey });

    // Sistem yönergesini (System Instruction) dinamik olarak oluşturuyoruz
    let systemInstruction = `You are a professional, high-precision machine translation engine.
Your task is to translate the user text accurately from ${sourceLang || 'Auto-detect'} into ${targetLang || 'Turkish'}.

STRICT OUTPUT RULES:
- Return ONLY the direct translation.
- DO NOT add introductory text (like "Here is the translation:").
- DO NOT add quotes around the text.
- DO NOT add explanations, notes, or pronunciation guides.
- Preserve original paragraph breaks, formatting, and casing as appropriate.`;

    // Alan (Domain) tercihi
    if (domain && domain !== 'genel') {
      const domainMap = {
        hukuk: 'Legal domain: Use formal, precise legal terminology and conventions.',
        tip: 'Medical domain: Use standard, accurate clinical and medical terminology.',
        teknik: 'Technical domain: Use precise engineering, IT, and technical jargon.',
        edebi: 'Literary domain: Maintain expressive nuance, tone, and literary eloquence.'
      };
      if (domainMap[domain]) {
        systemInstruction += `\n- DOMAIN SPECIFICATION: ${domainMap[domain]}`;
      }
    }

    // Üslup (Style/Tone) tercihi
    if (style && style !== 'varsayilan') {
      const styleMap = {
        resmi: 'Formal tone: Professional, courteous, polite grammatical forms.',
        gundelik: 'Casual/Conversational tone: Natural, everyday, idiomatic expressions.'
      };
      if (styleMap[style]) {
        systemInstruction += `\n- TONE SPECIFICATION: ${styleMap[style]}`;
      }
    }

    // Terimce (Glossary) kuralları
    if (glossary && glossary.trim()) {
      systemInstruction += `\n- MANDATORY GLOSSARY: You MUST strictly use the following term pairs when the source term appears:\n${glossary.trim()}`;
    }

    // Model çağrısı: Google'ın çok hızlı ve tasarruflu modeli olan gemini-3.5-flash-lite kullanılıyor
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
    const response = await ai.models.generateContent({
      model: modelName,
      contents: text,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2 // Çeviride tutarlılık ve sadakat için düşük sıcaklık
      }
    });

    const translation = response.text ? response.text.trim() : '';

    return res.json({ translation });

  } catch (error) {
    console.error('Gemini API Hatası:', error);

    // Hata tipini belirleyip kullanıcıya Türkçe yönlendirme hazırlayalım
    const errMsg = (error.message || '').toLowerCase();
    const status = error.status || error.statusCode || 500;

    let userFriendlyMessage = 'Çeviri sırasında beklenmedik bir hata oluştu.';
    let solutionHint = 'Lütfen tekrar deneyin.';

    if (errMsg.includes('api_key') || errMsg.includes('api key') || status === 401 || errMsg.includes('unauthenticated')) {
      userFriendlyMessage = 'Gemini API anahtarı geçersiz veya yetkilendirme reddedildi.';
      solutionHint = 'Lütfen .env dosyasındaki GEMINI_API_KEY değerinin Google AI Studio’dan aldığınız geçerli anahtar ile birebir aynı olduğundan emin olun.';
    } else if (errMsg.includes('not found') || errMsg.includes('not_found') || status === 404) {
      userFriendlyMessage = 'Kullanılan Gemini modeli hesabınız için bulunamadı veya kullanımdan kaldırılmış.';
      solutionHint = 'Sunucu güncel gemini-3.5-flash modeline yönlendirildi. Lütfen sunucuyu yeniden başlatın.';
    } else if (errMsg.includes('quota') || errMsg.includes('rate_limit') || errMsg.includes('resource_exhausted') || status === 429) {
      userFriendlyMessage = 'Gemini API kullanım kotası aşıldı (Rate Limit).';
      solutionHint = 'Google hesabınızın ücretsiz istek sınırına ulaşıldı. Lütfen 1-2 dakika bekleyip tekrar deneyin veya yeni bir API anahtarı tanımlayın.';
    } else if (errMsg.includes('enotfound') || errMsg.includes('eai_again') || errMsg.includes('network') || errMsg.includes('fetch failed')) {
      userFriendlyMessage = 'İnternet bağlantısı kurulamadı veya Google sunucularına ulaşılamıyor.';
      solutionHint = 'Lütfen internet bağlantınızı kontrol edip tekrar deneyin.';
    } else if (errMsg.includes('safety') || errMsg.includes('blocked')) {
      userFriendlyMessage = 'Girilen metin güvenlik filtreleri tarafından engellendi.';
      solutionHint = 'Lütfen metnin içeriğini kontrol edip yeniden deneyin.';
    }

    return res.status(500).json({
      error: userFriendlyMessage,
      hint: solutionHint,
      details: error.message
    });
  }
});

// Sunucuyu ayağa kaldırıyoruz
app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 Çeviri uygulaması başarıyla başlatıldı!`);
  console.log(`🔗 Tarayıcınızda açın: http://localhost:${PORT}`);
  console.log(`==================================================\n`);
});

