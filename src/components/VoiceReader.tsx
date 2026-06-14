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
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLang, setCurrentLang] = useState(i18n.language);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voicesLoadedRef = useRef(false);
  const userInteractedRef = useRef(false);

  // Получение языка
  const getSpeechLang = useCallback(() => {
    switch (i18n.language) {
      case 'ru':
        return 'ru-RU';
      case 'en':
        return 'en-US';
      case 'be':
        return 'be-BY';
      default:
        return 'ru-RU';
    }
  }, [i18n.language]);

  // Загрузка голосов (особенно важно для мобильных)
  const loadVoices = useCallback(() => {
    if (!window.speechSynthesis) return;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0 && !voicesLoadedRef.current) {
      voicesLoadedRef.current = true;
      setIsReady(true);
      console.log('[VoiceReader] Voices loaded:', voices.length);
    }
  }, []);

  // Инициализация speechSynthesis
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      setError('Voice not supported');
      return;
    }

    // Загружаем голоса
    loadVoices();

    // Слушаем событие загрузки голосов
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // "Пробуждение" speechSynthesis для iOS
    const wakeUp = () => {
      if (!userInteractedRef.current && window.speechSynthesis) {
        userInteractedRef.current = true;
        // Пустой speak для активации
        const dummy = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(dummy);
        setTimeout(() => {
          window.speechSynthesis.cancel();
        }, 100);
      }
    };

    document.addEventListener('click', wakeUp);
    document.addEventListener('touchstart', wakeUp);

    return () => {
      document.removeEventListener('click', wakeUp);
      document.removeEventListener('touchstart', wakeUp);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [loadVoices]);

  // Получение подходящего голоса
  const getBestVoice = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();
    const targetLang = getSpeechLang();
    const targetPrefix = targetLang.split('-')[0];

    // Поиск точного совпадения
    let voice = voices.find((v) => v.lang === targetLang);
    if (voice) return voice;

    // Поиск по префиксу
    voice = voices.find((v) => v.lang.startsWith(targetPrefix));
    if (voice) return voice;

    // Любой голос
    return voices[0];
  }, [getSpeechLang]);

  // Остановка
  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn('Stop error:', e);
      }
    }
    setIsSpeaking(false);
    utteranceRef.current = null;
    setError(null);
  }, []);

  // Воспроизведение
  const speak = useCallback(() => {
    // Очищаем ошибку
    setError(null);

    // Проверка текста
    if (!text || text.trim().length === 0) {
      setError('Нет текста');
      return;
    }

    // Проверка поддержки
    if (!window.speechSynthesis) {
      setError('Не поддерживается');
      return;
    }

    // Останавливаем текущее
    stopSpeaking();

    // Небольшая задержка
    setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);

        // Настройки
        utterance.lang = getSpeechLang();
        utterance.rate = 0.95;
        utterance.pitch = 1;
        utterance.volume = 1;

        // Выбираем голос если есть
        if (voicesLoadedRef.current) {
          const bestVoice = getBestVoice();
          if (bestVoice) {
            utterance.voice = bestVoice;
          }
        }

        // Обработчики
        utterance.onstart = () => {
          setIsSpeaking(true);
          setError(null);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          utteranceRef.current = null;
        };

        utterance.onerror = (event) => {
          console.warn('Speech error:', event);
          setIsSpeaking(false);
          utteranceRef.current = null;

          // Попытка восстановления
          if (event.error === 'not-allowed') {
            setError('Нажмите на кнопку ещё раз');
          } else if (event.error === 'synthesis-unavailable') {
            setError('Попробуйте ещё раз');
          }
        };

        utteranceRef.current = utterance;

        // Задержка для iOS
        setTimeout(() => {
          if (utteranceRef.current === utterance) {
            window.speechSynthesis.speak(utterance);
          }
        }, 50);
      } catch (err) {
        console.error('Speak error:', err);
        setError('Ошибка');
        setIsSpeaking(false);
      }
    }, 50);
  }, [text, getSpeechLang, stopSpeaking, getBestVoice]);

  // Остановка при смене языка
  useEffect(() => {
    if (currentLang !== i18n.language && autoStopOnLanguageChange) {
      stopSpeaking();
      setCurrentLang(i18n.language);
    }
  }, [i18n.language, autoStopOnLanguageChange, currentLang, stopSpeaking]);

  // Остановка при смене текста
  useEffect(() => {
    if (isSpeaking) {
      stopSpeaking();
    }
  }, [text]);

  // Тексты кнопок
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
        return 'Read:';
      case 'be':
        return 'Азвучыць:';
      default:
        return 'Озвучить:';
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1 sm:gap-2 ${className}`}>
      <span className="text-[10px] sm:text-xs text-gray-500 hidden xs:inline">
        {getVoiceLabel()}
      </span>
      {!isSpeaking ? (
        <Button
          variant="outline"
          size="sm"
          onClick={speak}
          disabled={!text || text.trim().length === 0 || !isReady}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 min-w-[60px] sm:min-w-[70px] h-7 sm:h-8 text-xs sm:text-sm"
          type="button"
        >
          <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
          {getListenText()}
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={stopSpeaking}
          className="bg-gradient-to-r from-red-500 to-rose-600 text-white border-none hover:from-red-600 hover:to-rose-700 min-w-[60px] sm:min-w-[70px] h-7 sm:h-8 text-xs sm:text-sm"
          type="button"
        >
          <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
          {getStopText()}
        </Button>
      )}
      {error && (
        <span className="text-[10px] text-red-500 hidden sm:inline">
          {error}
        </span>
      )}
    </div>
  );
};

export default VoiceReader;
