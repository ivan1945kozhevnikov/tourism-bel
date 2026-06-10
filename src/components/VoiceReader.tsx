import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, VolumeX, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface VoiceReaderProps {
  text: string;
  className?: string;
  autoStopOnLanguageChange?: boolean;
}

const VoiceReader: React.FC<VoiceReaderProps> = ({
  text,
  className = '',
  autoStopOnLanguageChange = true,
}) => {
  const { i18n } = useTranslation();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLang, setCurrentLang] = useState(i18n.language);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Проверка поддержки Web Speech API
  const checkSupport = useCallback(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      setError('Ваш браузер не поддерживает голосовое воспроизведение');
      return false;
    }

    // Проверка на iOS Safari (требует взаимодействия пользователя)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      console.log('iOS device detected - speech requires user interaction');
    }

    return true;
  }, []);

  // Получаем язык для синтеза речи с правильными кодами для разных браузеров
  const getSpeechLang = useCallback(() => {
    const langMap: Record<string, string[]> = {
      ru: ['ru-RU', 'ru', 'russian'],
      en: ['en-US', 'en-GB', 'en', 'english'],
      be: ['be-BY', 'be', 'belarusian'],
    };

    const targetLangs = langMap[i18n.language] || langMap.ru;
    return targetLangs;
  }, [i18n.language]);

  // Загрузка голосов с повторными попытками
  useEffect(() => {
    if (!checkSupport()) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        setVoicesLoaded(true);
        setError(null);
      } else if (!voicesLoaded) {
        // Повторная попытка через 100ms
        setTimeout(loadVoices, 100);
      }
    };

    loadVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {
          console.warn('Error cleaning up speech synthesis:', e);
        }
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [checkSupport, voicesLoaded]);

  // Останавливаем воспроизведение при смене языка
  useEffect(() => {
    if (currentLang !== i18n.language && autoStopOnLanguageChange) {
      stopSpeaking();
      setCurrentLang(i18n.language);
    }
  }, [i18n.language, autoStopOnLanguageChange, currentLang]);

  // Останавливаем воспроизведение при смене текста
  useEffect(() => {
    if (isSpeaking && text) {
      stopSpeaking();
    }
  }, [text]);

  // Получение наилучшего доступного голоса
  const getBestVoice = useCallback(() => {
    const targetLangs = getSpeechLang();

    // Поиск точного совпадения
    for (const targetLang of targetLangs) {
      const exactMatch = voices.find((v) => v.lang === targetLang);
      if (exactMatch) return exactMatch;
    }

    // Поиск по началу кода языка
    for (const targetLang of targetLangs) {
      const langPrefix = targetLang.split('-')[0];
      const prefixMatch = voices.find((v) => v.lang.startsWith(langPrefix));
      if (prefixMatch) return prefixMatch;
    }

    // Возвращаем любой голос
    return voices[0];
  }, [voices, getSpeechLang]);

  // Безопасная остановка воспроизведения
  const stopSpeaking = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (window.speechSynthesis) {
      try {
        // Немедленная остановка
        window.speechSynthesis.cancel();

        // Дополнительная остановка для iOS
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
          window.speechSynthesis.cancel();
        }
      } catch (e) {
        console.warn('Error stopping speech:', e);
      }
    }

    setIsSpeaking(false);
    setIsLoading(false);
    utteranceRef.current = null;
  }, []);

  // Функция озвучивания с обработкой всех браузеров
  const speak = useCallback(async () => {
    if (!checkSupport()) return;
    if (!text || text.trim().length === 0) {
      setError('Нет текста для озвучивания');
      return;
    }

    // Останавливаем текущее воспроизведение
    stopSpeaking();

    // Небольшая задержка для корректной остановки
    await new Promise((resolve) => setTimeout(resolve, 100));

    setIsLoading(true);
    setError(null);

    try {
      // Обработка для iOS - требуется создание utterance в ответ на действие пользователя
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Установка языка
      const targetLangs = getSpeechLang();
      utterance.lang = targetLangs[0];

      // Настройки
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1;

      // Выбор голоса
      if (voicesLoaded && voices.length > 0) {
        const bestVoice = getBestVoice();
        if (bestVoice) {
          utterance.voice = bestVoice;
          utterance.lang = bestVoice.lang;
        }
      }

      // Обработчики событий
      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsLoading(false);
        setError(null);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsLoading(false);
        utteranceRef.current = null;
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);

        // Обработка специфичных ошибок
        if (event.error === 'not-allowed') {
          setError('Требуется разрешение для воспроизведения');
        } else if (event.error === 'synthesis-unavailable') {
          setError('Синтез речи временно недоступен');
        } else {
          setError('Ошибка при воспроизведении');
        }

        setIsSpeaking(false);
        setIsLoading(false);
        utteranceRef.current = null;
      };

      // Задержка перед воспроизведением для некоторых браузеров
      timeoutRef.current = setTimeout(() => {
        try {
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.error('Error calling speak:', e);
          setError('Ошибка при воспроизведении');
          setIsLoading(false);
        }
        timeoutRef.current = null;
      }, 50);
    } catch (e) {
      console.error('Error creating utterance:', e);
      setError('Ошибка при создании голосового сообщения');
      setIsLoading(false);
    }
  }, [
    text,
    checkSupport,
    stopSpeaking,
    getSpeechLang,
    voicesLoaded,
    voices,
    getBestVoice,
  ]);

  // Обработка видимости страницы (останавливаем речь при уходе со страницы)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isSpeaking) {
        stopSpeaking();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSpeaking, stopSpeaking]);

  // Восстановление при повторном входе на страницу
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      stopSpeaking();
    };
  }, [stopSpeaking]);

  const getListenText = () => {
    switch (i18n.language) {
      case 'en':
        return 'Listen';
      case 'be':
        return 'Слухаць';
      default:
        return 'Слушать';
    }
  };

  const getStopText = () => {
    switch (i18n.language) {
      case 'en':
        return 'Stop';
      case 'be':
        return 'Стоп';
      default:
        return 'Стоп';
    }
  };

  const getVoiceLabel = () => {
    switch (i18n.language) {
      case 'en':
        return 'Read aloud:';
      case 'be':
        return 'Азвучыць:';
      default:
        return 'Озвучить:';
    }
  };

  const getLoadingText = () => {
    switch (i18n.language) {
      case 'en':
        return 'Loading...';
      case 'be':
        return 'Загрузка...';
      default:
        return 'Загрузка...';
    }
  };

  if (!isSupported) {
    return (
      <div className={`flex items-center gap-2 text-gray-400 ${className}`}>
        <AlertCircle className="w-4 h-4" />
        <span className="text-xs">
          Голосовое воспроизведение не поддерживается
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-500">{getVoiceLabel()}</span>
        {!isSpeaking && !isLoading ? (
          <Button
            variant="outline"
            size="sm"
            onClick={speak}
            disabled={isLoading || !text || text.trim().length === 0}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
          >
            <Play className="w-4 h-4 mr-1" />
            {getListenText()}
          </Button>
        ) : isLoading ? (
          <Button
            variant="outline"
            size="sm"
            disabled
            className="bg-gray-400 text-white border-none"
          >
            <div className="w-4 h-4 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent" />
            {getLoadingText()}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={stopSpeaking}
            className="bg-gradient-to-r from-red-500 to-rose-600 text-white border-none hover:from-red-600 hover:to-rose-700"
          >
            <VolumeX className="w-4 h-4 mr-1" />
            {getStopText()}
          </Button>
        )}
      </div>
      {error && (
        <div className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default VoiceReader;
