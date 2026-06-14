import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, VolumeX, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface VoiceReaderProps {
  text: string;
  className?: string;
  autoStopOnLanguageChange?: boolean;
}

type SpeakStrategy = {
  voice: SpeechSynthesisVoice | null;
  lang: string;
};

const LANG_FALLBACKS: Record<string, string[]> = {
  ru: ['ru-RU', 'ru'],
  en: ['en-US', 'en-GB', 'en'],
  // Белорусский голос почти нигде не установлен — откатываемся на русский
  be: ['be-BY', 'be', 'ru-RU', 'ru', 'en-US', 'en'],
};

const prepareSpeechText = (raw: string): string =>
  raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 3000);

const matchesLang = (voiceLang: string, code: string): boolean => {
  const prefix = code.split('-')[0];
  return (
    voiceLang === code ||
    voiceLang.startsWith(`${prefix}-`) ||
    voiceLang === prefix
  );
};

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
  const [errorHint, setErrorHint] = useState<string | null>(null);
  const [currentLang, setCurrentLang] = useState(i18n.language);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resumeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);
  const speakAttemptRef = useRef(0);
  const strategiesRef = useRef<SpeakStrategy[]>([]);
  const voicesPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastVoicesRef = useRef<SpeechSynthesisVoice[]>([]);

  const clearSpeakTimers = useCallback(() => {
    if (speakTimerRef.current) {
      clearTimeout(speakTimerRef.current);
      speakTimerRef.current = null;
    }
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    if (resumeIntervalRef.current) {
      clearInterval(resumeIntervalRef.current);
      resumeIntervalRef.current = null;
    }
    if (voicesPollRef.current) {
      clearInterval(voicesPollRef.current);
      voicesPollRef.current = null;
    }
  }, []);

  const startResumeHack = useCallback(() => {
    if (resumeIntervalRef.current) return;
    resumeIntervalRef.current = setInterval(() => {
      try {
        const synth = window.speechSynthesis;
        if (!synth) return;
        if (synth.speaking || synth.pending) {
          synth.resume();
        }
      } catch (e) {}
    }, 100);
  }, []);

  const primeSpeechEngine = useCallback(() => {
    try {
      const synth = window.speechSynthesis;
      synth.getVoices();
      synth.cancel();
      synth.resume();
    } catch (e) {}
  }, []);

  // Проверка поддержки Web Speech API
  const checkSupport = useCallback(() => {
    // Проверка на наличие SpeechSynthesis
    if (typeof window === 'undefined') {
      setIsSupported(false);
      return false;
    }

    const hasSpeechSynthesis = 'speechSynthesis' in window;
    const hasUtterance = 'SpeechSynthesisUtterance' in window;

    if (!hasSpeechSynthesis || !hasUtterance) {
      setIsSupported(false);
      setError('Ваш браузер не поддерживает голосовое воспроизведение');
      return false;
    }

    return true;
  }, []);

  // Получение языка для синтеза с fallback
  const getLangFallbacks = useCallback(() => {
    const lang = i18n.language.split('-')[0];
    return LANG_FALLBACKS[lang] || LANG_FALLBACKS.ru;
  }, [i18n.language]);

  const buildSpeakStrategies = useCallback(
    (voices: SpeechSynthesisVoice[]): SpeakStrategy[] => {
      const fallbacks = getLangFallbacks();
      const strategies: SpeakStrategy[] = [];
      const seen = new Set<string>();

      const addStrategy = (voice: SpeechSynthesisVoice | null, lang: string) => {
        const key = voice ? `voice:${voice.name}:${voice.lang}` : `lang:${lang}`;
        if (!lang || seen.has(key)) return;
        seen.add(key);
        strategies.push({ voice, lang });
      };

      const localVoices = voices.filter((v) => v.localService);
      const cloudVoices = voices.filter((v) => !v.localService);

      // 1. Локальные голоса Windows (не требуют сети)
      for (const code of fallbacks) {
        const matching = localVoices.filter((v) => matchesLang(v.lang, code));
        for (const voice of matching) {
          addStrategy(voice, voice.lang);
        }
      }

      // 2. Только lang, без voice — браузер сам выберет
      for (const code of fallbacks) {
        addStrategy(null, code);
      }

      // 3. Любой локальный голос (если русский пакет не найден по коду)
      for (const voice of localVoices) {
        addStrategy(voice, voice.lang);
      }

      // 4. Облачные голоса Chrome — последний вариант (нужен интернет)
      for (const code of fallbacks) {
        const matching = cloudVoices.filter((v) => matchesLang(v.lang, code));
        for (const voice of matching) {
          addStrategy(voice, voice.lang);
        }
      }

      return strategies;
    },
    [getLangFallbacks],
  );

  const getVoiceDiagnostics = useCallback((voices: SpeechSynthesisVoice[]) => {
    const local = voices.filter((v) => v.localService).length;
    const cloud = voices.length - local;
    const ru = voices.filter((v) => matchesLang(v.lang, 'ru-RU')).length;

    if (i18n.language === 'en') {
      return `Voices: ${voices.length} (local ${local}, cloud ${cloud}, ru ${ru})`;
    }
    if (i18n.language === 'be') {
      return `Галасы: ${voices.length} (лакальныя ${local}, воблачныя ${cloud}, ru ${ru})`;
    }
    return `Голосов: ${voices.length} (лок. ${local}, облако ${cloud}, ru ${ru})`;
  }, [i18n.language]);

  const getFailedPlaybackHint = useCallback(
    (voices: SpeechSynthesisVoice[]) => {
      const hasLocalRu = voices.some(
        (v) => v.localService && matchesLang(v.lang, 'ru-RU'),
      );

      if (i18n.language === 'en') {
        if (!hasLocalRu) {
          return 'Install Russian speech in Windows Settings → Time & language → Speech';
        }
        if (voices.every((v) => !v.localService)) {
          return 'Only cloud voices found — check internet or use Microsoft Edge';
        }
        return 'Try Microsoft Edge or install a speech language pack in Windows';
      }

      if (!hasLocalRu) {
        return 'Параметры Windows → Время и язык → Речь → добавьте русский язык';
      }
      if (voices.every((v) => !v.localService)) {
        return 'Только облачные голоса — проверьте интернет или откройте в Edge';
      }
      return 'Попробуйте Edge или установите речевой пакет в Windows';
    },
    [i18n.language],
  );

  const loadVoices = useCallback(() => {
    if (!checkSupport()) return;

    let attempts = 0;
    const maxAttempts = 50;

    const tryLoadVoices = () => {
      try {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          setError(null);
          return true;
        }

        attempts++;
        if (attempts < maxAttempts) {
          timerRef.current = setTimeout(tryLoadVoices, 100);
        }
        return false;
      } catch (e) {
        attempts++;
        if (attempts < maxAttempts) {
          timerRef.current = setTimeout(tryLoadVoices, 100);
        }
        return false;
      }
    };

    tryLoadVoices();

    const handleVoicesChanged = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setError(null);
      }
    };

    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      window.speechSynthesis.removeEventListener(
        'voiceschanged',
        handleVoicesChanged,
      );
    };
  }, [checkSupport]);

  const waitForVoices = useCallback(
    (onReady: (voices: SpeechSynthesisVoice[]) => void) => {
      if (!checkSupport()) {
        onReady([]);
        return;
      }

      primeSpeechEngine();

      const finish = (voices: SpeechSynthesisVoice[]) => {
        if (voicesPollRef.current) {
          clearInterval(voicesPollRef.current);
          voicesPollRef.current = null;
        }
        lastVoicesRef.current = voices;
        onReady(voices);
      };

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        finish(voices);
        return;
      }

      const onVoicesChanged = () => {
        const loaded = window.speechSynthesis.getVoices();
        if (loaded.length > 0) {
          window.speechSynthesis.removeEventListener(
            'voiceschanged',
            onVoicesChanged,
          );
          finish(loaded);
        }
      };

      window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);

      let attempts = 0;
      voicesPollRef.current = setInterval(() => {
        attempts++;
        const loaded = window.speechSynthesis.getVoices();
        if (loaded.length > 0 || attempts >= 40) {
          window.speechSynthesis.removeEventListener(
            'voiceschanged',
            onVoicesChanged,
          );
          finish(loaded);
        }
      }, 50);
    },
    [checkSupport, primeSpeechEngine],
  );

  // Инициализация
  useEffect(() => {
    mountedRef.current = true;

    if (!checkSupport()) {
      return;
    }

    // Активация SpeechSynthesis для некоторых браузеров
    const activateSpeech = () => {
      try {
        window.speechSynthesis.getVoices();
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch (e) {}
    };

    // Активируем при первом взаимодействии
    const handleInteraction = () => {
      activateSpeech();
      loadVoices();
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);
    document.addEventListener('keydown', handleInteraction);

    const cleanupLoad = loadVoices();

    return () => {
      mountedRef.current = false;
      if (cleanupLoad) cleanupLoad();
      clearSpeakTimers();
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      try {
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      } catch (e) {}
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [checkSupport, loadVoices, clearSpeakTimers]);

  // Безопасная остановка
  const stopSpeaking = useCallback(() => {
    clearSpeakTimers();

    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        // Дополнительная остановка для iOS
        setTimeout(() => {
          try {
            if (window.speechSynthesis) {
              window.speechSynthesis.cancel();
            }
          } catch (e) {}
        }, 50);
      }
    } catch (e) {}

    setIsSpeaking(false);
    setIsLoading(false);
    utteranceRef.current = null;
    setError(null);
    setErrorHint(null);
  }, [clearSpeakTimers]);

  const getPlaybackError = useCallback(
    (code: string) => {
      switch (code) {
        case 'not-allowed':
          return 'Требуется разрешение';
        case 'synthesis-unavailable':
          return 'Синтез временно недоступен';
        case 'synthesis-failed':
          return 'Ошибка воспроизведения';
        case 'language-unavailable':
          return 'Язык не поддерживается';
        default:
          return 'Ошибка';
      }
    },
    [],
  );

  const getNoVoicesError = useCallback(() => {
    switch (i18n.language) {
      case 'en':
        return 'No speech voices installed';
      case 'be':
        return 'Няма ўсталяваных галасоў';
      default:
        return 'Нет установленных голосов';
    }
  }, [i18n.language]);

  const startUtterance = useCallback(
    (speechText: string, strategyIndex: number) => {
      const strategy = strategiesRef.current[strategyIndex];
      if (!strategy || !mountedRef.current) {
        setIsLoading(false);
        return;
      }

      speakAttemptRef.current = strategyIndex;

      const utterance = new SpeechSynthesisUtterance(speechText);
      utteranceRef.current = utterance;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.lang = strategy.lang;

      if (strategy.voice) {
        utterance.voice = strategy.voice;
        utterance.lang = strategy.voice.lang;
      }

      const clearLoadingTimeout = () => {
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }
      };

      loadingTimeoutRef.current = setTimeout(() => {
        if (!mountedRef.current || utteranceRef.current !== utterance) return;
        setIsLoading(false);
        setIsSpeaking(false);
        setError(
          i18n.language === 'en'
            ? 'Playback timed out'
            : i18n.language === 'be'
              ? 'Час чакання скончыўся'
              : 'Превышено время ожидания',
        );
        setErrorHint(
          `${getFailedPlaybackHint(lastVoicesRef.current)}. ${getVoiceDiagnostics(lastVoicesRef.current)}`,
        );
        utteranceRef.current = null;
        clearSpeakTimers();
        try {
          window.speechSynthesis.cancel();
        } catch (e) {}
      }, 10000);

      utterance.onstart = () => {
        if (mountedRef.current) {
          clearLoadingTimeout();
          setIsSpeaking(true);
          setIsLoading(false);
          setError(null);
          startResumeHack();
        }
      };

      utterance.onend = () => {
        if (mountedRef.current) {
          clearLoadingTimeout();
          clearSpeakTimers();
          setIsSpeaking(false);
          setIsLoading(false);
          utteranceRef.current = null;
        }
      };

      utterance.onerror = (event) => {
        if (!mountedRef.current) return;

        clearLoadingTimeout();
        clearSpeakTimers();

        if (event.error === 'interrupted' || event.error === 'canceled') {
          setIsSpeaking(false);
          setIsLoading(false);
          return;
        }

        const nextIndex = strategyIndex + 1;
        if (
          (event.error === 'synthesis-failed' ||
            event.error === 'language-unavailable' ||
            event.error === 'synthesis-unavailable') &&
          nextIndex < strategiesRef.current.length
        ) {
          utteranceRef.current = null;
          try {
            window.speechSynthesis.cancel();
          } catch (e) {}

          speakTimerRef.current = setTimeout(() => {
            startUtterance(speechText, nextIndex);
          }, 200);
          return;
        }

        setError(getPlaybackError(event.error));
        setErrorHint(
          `${getFailedPlaybackHint(lastVoicesRef.current)}. ${getVoiceDiagnostics(lastVoicesRef.current)}`,
        );
        setIsSpeaking(false);
        setIsLoading(false);
        utteranceRef.current = null;
      };

      startResumeHack();

      speakTimerRef.current = setTimeout(() => {
        try {
          if (mountedRef.current && utteranceRef.current === utterance) {
            window.speechSynthesis.resume();
            window.speechSynthesis.speak(utterance);
          }
        } catch (e) {
          const nextIndex = strategyIndex + 1;
          if (nextIndex < strategiesRef.current.length) {
            startUtterance(speechText, nextIndex);
            return;
          }
          if (mountedRef.current) {
            setError('Не удалось запустить');
            setIsLoading(false);
          }
        }
      }, 80);
    },
    [
      clearSpeakTimers,
      startResumeHack,
      getPlaybackError,
      getFailedPlaybackHint,
      getVoiceDiagnostics,
      i18n.language,
    ],
  );

  const beginPlayback = useCallback(
    (speechText: string, voices: SpeechSynthesisVoice[]) => {
      lastVoicesRef.current = voices;

      strategiesRef.current =
        voices.length > 0
          ? buildSpeakStrategies(voices)
          : getLangFallbacks().map((lang) => ({ voice: null, lang }));

      if (strategiesRef.current.length === 0) {
        setError(getNoVoicesError());
        setErrorHint(getFailedPlaybackHint(voices));
        setIsLoading(false);
        return;
      }

      primeSpeechEngine();
      startUtterance(speechText, 0);
    },
    [
      buildSpeakStrategies,
      getLangFallbacks,
      getNoVoicesError,
      getFailedPlaybackHint,
      primeSpeechEngine,
      startUtterance,
    ],
  );

  // Воспроизведение текста — синхронный старт из обработчика клика (важно для Chrome)
  const speak = useCallback(() => {
    setError(null);
    setErrorHint(null);

    if (!checkSupport()) {
      return;
    }

    const speechText = prepareSpeechText(text);
    if (!speechText) {
      setError('Нет текста');
      return;
    }

    clearSpeakTimers();

    try {
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {}

    utteranceRef.current = null;
    setIsSpeaking(false);
    setIsLoading(true);

    waitForVoices((voices) => {
      if (!mountedRef.current) return;
      beginPlayback(speechText, voices);
    });
  }, [
    text,
    checkSupport,
    clearSpeakTimers,
    waitForVoices,
    beginPlayback,
  ]);

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
  }, [text, stopSpeaking]);

  // Остановка при размонтировании
  useEffect(() => {
    return () => {
      try {
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      } catch (e) {}
    };
  }, []);

  if (!isSupported) {
    return (
      <div className={`flex items-center gap-1 text-gray-400 ${className}`}>
        <AlertCircle className="w-3 h-3" />
        <span className="text-[10px]">Не поддерживается</span>
      </div>
    );
  }

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

  const isDisabled = !text || text.trim().length === 0 || isLoading;

  return (
    <div className={`flex items-center gap-1 sm:gap-2 flex-wrap ${className}`}>
      <span className="text-[10px] sm:text-xs text-gray-500 hidden xs:inline">
        {getVoiceLabel()}
      </span>

      {!isSpeaking && !isLoading ? (
        <Button
          variant="outline"
          size="sm"
          onClick={speak}
          disabled={isDisabled}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[60px] sm:min-w-[70px] h-7 sm:h-8 text-xs sm:text-sm"
          type="button"
        >
          <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
          {getListenText()}
        </Button>
      ) : isLoading ? (
        <Button
          variant="outline"
          size="sm"
          disabled
          className="bg-gray-400 text-white border-none cursor-wait min-w-[60px] sm:min-w-[70px] h-7 sm:h-8 text-xs sm:text-sm"
          type="button"
        >
          <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent" />
          {getLoadingText()}
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
        <span
          className="text-[10px] text-red-500 max-w-[220px] sm:max-w-xs leading-tight"
          title={errorHint || undefined}
        >
          {error}
          {errorHint && (
            <span className="block text-gray-500 mt-0.5">{errorHint}</span>
          )}
        </span>
      )}
    </div>
  );
};

export default VoiceReader;
