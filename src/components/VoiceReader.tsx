import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, VolumeX } from 'lucide-react';
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
  const [currentLang, setCurrentLang] = useState(i18n.language);

  // Функция для получения языка для синтеза речи
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

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Останавливаем воспроизведение при смене языка
  useEffect(() => {
    if (currentLang !== i18n.language && autoStopOnLanguageChange) {
      stopSpeaking();
      setCurrentLang(i18n.language);
    }
  }, [i18n.language, autoStopOnLanguageChange]);

  // Останавливаем воспроизведение при смене текста
  useEffect(() => {
    if (isSpeaking) {
      stopSpeaking();
    }
  }, [text]);

  const speak = useCallback(() => {
    if (!('speechSynthesis' in window)) return;

    // Отменяем текущее воспроизведение
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getSpeechLang();
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    // Небольшая задержка для корректной смены языка
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
  }, [text, getSpeechLang]);

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  // Получаем текст кнопки в зависимости от языка
  const getListenText = () => {
    switch (i18n.language) {
      case 'ru':
        return 'Слушать';
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
      case 'ru':
        return 'Стоп';
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
      case 'ru':
        return 'Озвучить:';
      case 'en':
        return 'Read aloud:';
      case 'be':
        return 'Азвучыць:';
      default:
        return 'Озвучить:';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-500">{getVoiceLabel()}</span>
      {!isSpeaking ? (
        <Button
          variant="outline"
          size="sm"
          onClick={speak}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none hover:from-green-600 hover:to-emerald-700"
        >
          <Play className="w-4 h-4 mr-1" />
          {getListenText()}
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
  );
};

export default VoiceReader;
