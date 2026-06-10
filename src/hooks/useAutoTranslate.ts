import { useTranslation } from 'react-i18next';
import { useCallback, useRef } from 'react';

// Кэш для сохранения переведенных текстов
const translationCache = new Map<string, string>();

export const useAutoTranslate = () => {
  const { i18n } = useTranslation();

  // Перевод одного текста
  const translateText = useCallback(
    async (text: string): Promise<string> => {
      if (!text) return '';
      if (i18n.language === 'ru') return text;

      const cacheKey = `${text}_${i18n.language}`;
      if (translationCache.has(cacheKey)) {
        return translationCache.get(cacheKey)!;
      }

      try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ru&tl=${i18n.language}&dt=t&q=${encodeURIComponent(text)}`;
        const response = await fetch(url);
        const data = await response.json();
        const translated =
          data[0]?.map((item: any) => item[0]).join('') || text;
        translationCache.set(cacheKey, translated);
        return translated;
      } catch (error) {
        console.error('Translation error:', error);
        return text;
      }
    },
    [i18n.language],
  );

  // Перевод всего объекта (места, тура, традиции)
  const translateObject = useCallback(
    async <T extends Record<string, any>>(
      obj: T,
      fields: string[],
    ): Promise<T> => {
      if (!obj) return obj;
      if (i18n.language === 'ru') return obj;

      const result = { ...obj };
      for (const field of fields) {
        if (obj[field]) {
          result[field] = await translateText(obj[field]);
        }
      }
      return result;
    },
    [translateText, i18n.language],
  );

  // Перевод массива объектов
  const translateArray = useCallback(
    async <T extends Record<string, any>>(
      arr: T[],
      fields: string[],
    ): Promise<T[]> => {
      if (!arr || arr.length === 0) return arr;
      if (i18n.language === 'ru') return arr;

      return Promise.all(arr.map((item) => translateObject(item, fields)));
    },
    [translateObject, i18n.language],
  );

  return {
    translateText,
    translateObject,
    translateArray,
    currentLang: i18n.language,
  };
};
