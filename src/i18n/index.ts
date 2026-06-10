import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Импорт из папки locales (относительный путь)
import ru from './locales/ru.json';
import en from './locales/en.json';
import be from './locales/be.json';

console.log('i18n loading...', { ru, en, be }); // Для отладки

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      en: { translation: en },
      be: { translation: be },
    },
    fallbackLng: 'ru',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
