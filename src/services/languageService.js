import { franc } from 'franc';

class LanguageDetectionService {
  constructor() {
    this.langCache = new Map();
    this.minTextLength = 20;
  }

  detectLanguage(text) {
    if (text.length < this.minTextLength) {
      return this._detectShortText(text);
    }

    const cacheKey = this._getCacheKey(text);
    if (this.langCache.has(cacheKey)) {
      return this.langCache.get(cacheKey);
    }

    const detected = franc(text, { minLength: 3 });
    const lang = this._mapToSupportedLanguage(detected);
    this.langCache.set(cacheKey, lang);
    return lang;
  }

  _detectShortText(text) {
    const frenchPatterns = [
      /^(bonjour|salut|merci|oui|non)\b/i,
      /^(je|tu|il|nous|vous|ils)\b/i,
      /^(le|la|les|un|une|des)\b/i
    ];
    return frenchPatterns.some(pattern => pattern.test(text)) ? 'fr' : 'en';
  }

  _mapToSupportedLanguage(detected) {
    return ['fra', 'fr'].includes(detected) ? 'fr' : 'en';
  }

  _getCacheKey(text) {
    return text.slice(0, 100).toLowerCase();
  }
}

export const languageDetection = new LanguageDetectionService();