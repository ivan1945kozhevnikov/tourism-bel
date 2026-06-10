import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Contrast, Type, Check, Globe } from 'lucide-react';

const AccessibilityWidget: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [showMenu, setShowMenu] = useState(false);
  const [tooltipText, setTooltipText] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  let tooltipTimeout: NodeJS.Timeout;

  // Получение переведенных текстов в зависимости от текущего языка
  const getTranslatedTexts = () => {
    const currentLang = i18n.language;

    if (currentLang === 'en') {
      return {
        title: 'Accessibility Version',
        highContrast: 'High contrast',
        fontSize: 'Font size',
        reset: 'Reset',
        resetAll: 'Reset all settings',
        languageChanged: (lang: string) => `Language changed to ${lang}`,
        contrastOn: 'High contrast enabled',
        contrastOff: 'High contrast disabled',
        fontSizeChanged: (size: number) => `Font size changed to ${size}%`,
        resetAllMsg: 'All settings reset',
        languages: [
          {
            code: 'ru',
            name: 'Русский',
            flag: 'RU',
            tooltip: 'Russian language',
          },
          {
            code: 'en',
            name: 'English',
            flag: 'EN',
            tooltip: 'English language',
          },
          {
            code: 'be',
            name: 'Беларуская',
            flag: 'BY',
            tooltip: 'Belarusian language',
          },
        ],
      };
    } else if (currentLang === 'be') {
      return {
        title: 'Версія для слабавідушчых',
        highContrast: 'Высокі кантраст',
        fontSize: 'Памер шрыфта',
        reset: 'Скінуць',
        resetAll: 'Скінуць усе налады',
        languageChanged: (lang: string) => `Мова зменена на ${lang}`,
        contrastOn: 'Высокі кантраст уключаны',
        contrastOff: 'Высокі кантраст выключаны',
        fontSizeChanged: (size: number) => `Памер шрыфта зменены на ${size}%`,
        resetAllMsg: 'Усе налады скінуты',
        languages: [
          { code: 'ru', name: 'Русский', flag: 'RU', tooltip: 'Русская мова' },
          {
            code: 'en',
            name: 'English',
            flag: 'EN',
            tooltip: 'Англійская мова',
          },
          {
            code: 'be',
            name: 'Беларуская',
            flag: 'BY',
            tooltip: 'Беларуская мова',
          },
        ],
      };
    } else {
      // Русский по умолчанию
      return {
        title: 'Версия для слабовидящих',
        highContrast: 'Высокий контраст',
        fontSize: 'Размер шрифта',
        reset: 'Сброс',
        resetAll: 'Сбросить все настройки',
        languageChanged: (lang: string) => `Язык изменен на ${lang}`,
        contrastOn: 'Высокий контраст включен',
        contrastOff: 'Высокий контраст выключен',
        fontSizeChanged: (size: number) => `Размер шрифта изменен на ${size}%`,
        resetAllMsg: 'Все настройки сброшены',
        languages: [
          { code: 'ru', name: 'Русский', flag: 'RU', tooltip: 'Русский язык' },
          {
            code: 'en',
            name: 'English',
            flag: 'EN',
            tooltip: 'English language',
          },
          {
            code: 'be',
            name: 'Беларуская',
            flag: 'BY',
            tooltip: 'Беларуская мова',
          },
        ],
      };
    }
  };

  const texts = getTranslatedTexts();
  const languages = texts.languages;

  const showTooltipMessage = (message: string) => {
    setTooltipText(message);
    setShowTooltip(true);
    clearTimeout(tooltipTimeout);
    tooltipTimeout = setTimeout(() => {
      setShowTooltip(false);
    }, 2000);
  };

  // Загрузка сохраненных настроек
  useEffect(() => {
    const savedContrast = localStorage.getItem('high-contrast');
    const savedFontSize = localStorage.getItem('font-size');

    if (savedContrast === 'true') {
      setIsHighContrast(true);
      document.documentElement.classList.add('high-contrast');
    }
    if (savedFontSize) {
      const size = parseInt(savedFontSize);
      setFontSize(size);
      document.documentElement.style.fontSize = `${size}%`;
    }
  }, []);

  const changeLanguage = (langCode: string, langName: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
    setShowMenu(false);
    showTooltipMessage(texts.languageChanged(langName));
  };

  const toggleHighContrast = () => {
    const newValue = !isHighContrast;
    setIsHighContrast(newValue);
    if (newValue) {
      document.documentElement.classList.add('high-contrast');
      localStorage.setItem('high-contrast', 'true');
      showTooltipMessage(texts.contrastOn);
    } else {
      document.documentElement.classList.remove('high-contrast');
      localStorage.setItem('high-contrast', 'false');
      showTooltipMessage(texts.contrastOff);
    }
    setShowMenu(false);
  };

  const changeFontSize = (size: number) => {
    setFontSize(size);
    document.documentElement.style.fontSize = `${size}%`;
    localStorage.setItem('font-size', size.toString());
    showTooltipMessage(texts.fontSizeChanged(size));
    setShowMenu(false);
  };

  const resetAccessibility = () => {
    setIsHighContrast(false);
    setFontSize(100);
    document.documentElement.classList.remove('high-contrast');
    document.documentElement.style.fontSize = '100%';
    localStorage.removeItem('high-contrast');
    localStorage.removeItem('font-size');
    showTooltipMessage(texts.resetAllMsg);
    setShowMenu(false);
  };

  return (
    <div
      className="relative flex items-center gap-2"
      data-accessibility-widget="true"
    >
      {/* Всплывающая подсказка */}
      {showTooltip && (
        <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 z-[100] bg-gray-900 text-white px-4 py-2 rounded-full text-sm shadow-lg animate-fade-in">
          {tooltipText}
        </div>
      )}

      {/* Кнопки выбора языка */}
      <div className="hidden md:flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full p-1">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code, lang.name)}
            className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
              i18n.language === lang.code
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-white hover:bg-white/20'
            }`}
            title={lang.tooltip}
          >
            {lang.flag}
          </button>
        ))}
      </div>

      {/* Кнопка настроек доступности */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
        aria-label={texts.title}
        title={texts.title}
      >
        <Eye className="w-5 h-5" />
      </button>

      {/* Выпадающее меню настроек */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl z-50 p-5 border border-gray-100">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-4 pb-2 border-b">
              <Eye className="w-5 h-5 text-blue-500" />
              {texts.title}
            </h4>
            <div className="space-y-3">
              {/* Мобильный выбор языка */}
              <div className="flex items-center justify-center gap-2 p-2 bg-gray-100 rounded-xl md:hidden">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code, lang.name)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium ${
                      i18n.language === lang.code
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {lang.flag} {lang.name}
                  </button>
                ))}
              </div>

              {/* Высокий контраст */}
              <button
                onClick={toggleHighContrast}
                className={`w-full flex items-center justify-between p-3 rounded-xl ${
                  isHighContrast
                    ? 'bg-yellow-100 border border-yellow-400'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Contrast className="w-5 h-5" />
                  <span>{texts.highContrast}</span>
                </span>
                {isHighContrast && <Check className="w-5 h-5 text-green-600" />}
              </button>

              {/* Размер шрифта */}
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Type className="w-5 h-5" />
                  <span>{texts.fontSize}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => changeFontSize(Math.max(70, fontSize - 10))}
                    className="px-3 py-1 bg-gray-200 rounded-full hover:bg-gray-300"
                  >
                    A-
                  </button>
                  <div className="flex-1 text-center text-sm font-medium">
                    {fontSize}%
                  </div>
                  <button
                    onClick={() => changeFontSize(Math.min(150, fontSize + 10))}
                    className="px-3 py-1 bg-gray-200 rounded-full hover:bg-gray-300"
                  >
                    A+
                  </button>
                  <button
                    onClick={() => changeFontSize(100)}
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm hover:bg-blue-200"
                  >
                    {texts.reset}
                  </button>
                </div>
              </div>

              {/* Кнопка сброса */}
              <button
                onClick={resetAccessibility}
                className="w-full flex items-center justify-center gap-2 p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700"
              >
                <Globe className="w-4 h-4" />
                <span>{texts.resetAll}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AccessibilityWidget;
