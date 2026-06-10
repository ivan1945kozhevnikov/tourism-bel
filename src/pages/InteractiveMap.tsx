import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { placesAPI } from '@/services/api';
import type { Place } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Mic,
  MicOff,
  Volume2,
  Play,
  MapPin,
  History,
  Info,
  Sparkles,
  Compass,
  ArrowRight,
  X,
  Square,
  Filter,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { useAutoTranslate } from '@/hooks/useAutoTranslate';
import { motion, AnimatePresence } from 'framer-motion';

// Fix for default markers
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = new Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const MapCenter: React.FC<{ center: [number, number]; zoom?: number }> = ({
  center,
  zoom = 7,
}) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

// 3D Image Viewer Component
const Image3DViewer: React.FC<{
  imageUrl: string;
  title: string;
  translateHint: string;
}> = ({ imageUrl, title, translateHint }) => {
  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [startRotX, setStartRotX] = useState(0);
  const [startRotY, setStartRotY] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setStartY(e.clientY);
    setStartRotX(rotationX);
    setStartRotY(rotationY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    setRotationY(startRotY + deltaX * 0.5);
    setRotationX(startRotX - deltaY * 0.5);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setRotationX(0);
    setRotationY(0);
    setScale(1);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  return (
    <motion.div
      className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-gray-900 to-gray-800"
      style={{ perspective: 1000 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="relative h-48 sm:h-64 md:h-96 cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          rotateX: rotationX,
          rotateY: rotationY,
          scale: scale,
          transition: isDragging ? 'none' : 'all 0.3s ease-out',
          transformStyle: 'preserve-3d',
        }}
      >
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover rounded-t-2xl"
          draggable={false}
        />
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${50 + rotationY * 2}% ${50 - rotationX * 2}%, transparent 0%, rgba(0,0,0,0.3) 100%)`,
          }}
        />
      </motion.div>

      <motion.div
        className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 flex gap-1 sm:gap-2 bg-black/50 backdrop-blur-sm rounded-full p-1 sm:p-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={handleZoomOut}
          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all"
        >
          <ZoomOut className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        </button>
        <button
          onClick={handleReset}
          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all"
        >
          <Move className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        </button>
        <button
          onClick={handleZoomIn}
          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all"
        >
          <ZoomIn className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        </button>
      </motion.div>

      <motion.div
        className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 sm:px-3 sm:py-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-white text-[10px] sm:text-xs flex items-center gap-1">
          <RotateCw className="w-2 h-2 sm:w-3 sm:h-3" /> {translateHint}
        </p>
      </motion.div>
    </motion.div>
  );
};

const VoiceButton: React.FC<{ text: string }> = ({ text }) => {
  const { i18n } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);

  const getSpeechLang = () => {
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
  };

  const speak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!text) return;
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getSpeechLang();
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={speak}
      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isPlaying ? 'bg-green-500 text-white shadow-lg' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
    >
      {isPlaying ? (
        <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
      ) : (
        <Play className="w-3 h-3 sm:w-4 sm:h-4" />
      )}
    </motion.button>
  );
};

const popupStyles = `
  .custom-popup .leaflet-popup-content-wrapper {
    border-radius: 20px;
    padding: 0;
    overflow: hidden;
    box-shadow: 0 20px 25px -12px rgba(0,0,0,0.15);
  }
  .custom-popup .leaflet-popup-content {
    margin: 0;
    min-width: 200px;
    max-width: 260px;
  }
  .custom-popup .leaflet-popup-tip {
    background: white;
  }
  .custom-popup .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  @media (max-width: 640px) {
    .custom-popup .leaflet-popup-content {
      min-width: 160px;
      max-width: 200px;
    }
  }
`;

const InteractiveMap: React.FC = () => {
  const { i18n } = useTranslation();
  const { translateText, translateArray, translateObject } = useAutoTranslate();
  const [places, setPlaces] = useState<Place[]>([]);
  const [translatedPlaces, setTranslatedPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [translatedSelectedPlace, setTranslatedSelectedPlace] =
    useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    53.9045, 27.5615,
  ]);
  const [mapZoom, setMapZoom] = useState<number>(7);
  const [voiceResponse, setVoiceResponse] = useState('');
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [showAllPlaces, setShowAllPlaces] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailPlace, setDetailPlace] = useState<Place | null>(null);
  const [translatedDetailPlace, setTranslatedDetailPlace] =
    useState<Place | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>('');

  // Голосовой помощник
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  const getRecognitionLang = () => {
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
  };

  const getSpeechLang = () => {
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
  };

  const getHelpText = () => {
    switch (i18n.language) {
      case 'ru':
        return 'Я голосовой помощник. Скажите название места, например: Мирский замок';
      case 'en':
        return 'I am a voice assistant. Say the name of a place, for example: Mir Castle';
      case 'be':
        return 'Я галасавы памочнік. Скажыце назву месца, напрыклад: Мірскі замак';
      default:
        return 'Я голосовой помощник. Скажите название места, например: Мирский замок';
    }
  };

  const getNotFoundText = (command: string) => {
    switch (i18n.language) {
      case 'ru':
        return `Не могу найти "${command}". Попробуйте: Мирский замок, Несвижский замок`;
      case 'en':
        return `Cannot find "${command}". Try: Mir Castle, Nesvizh Castle`;
      case 'be':
        return `Не магу знайсці "${command}". Паспрабуйце: Мірскі замак, Нясвіжскі замак`;
      default:
        return `Не могу найти "${command}". Попробуйте: Мирский замок, Несвижский замок`;
    }
  };

  const getFoundText = (placeName: string) => {
    switch (i18n.language) {
      case 'ru':
        return `Нашел: ${placeName}`;
      case 'en':
        return `Found: ${placeName}`;
      case 'be':
        return `Знайшоў: ${placeName}`;
      default:
        return `Нашел: ${placeName}`;
    }
  };

  const getRemovePhrases = (): string[] => {
    switch (i18n.language) {
      case 'ru':
        return [
          'расскажи о',
          'расскажи про',
          'что такое',
          'где находится',
          'покажи',
          'найди',
        ];
      case 'en':
        return [
          'tell me about',
          'what is',
          'where is',
          'show',
          'find',
          'about',
        ];
      case 'be':
        return [
          'раскажы пра',
          'раскажы аб',
          'што такое',
          'дзе знаходзіцца',
          'пакажы',
          'знайдзі',
        ];
      default:
        return [
          'расскажи о',
          'расскажи про',
          'что такое',
          'где находится',
          'покажи',
          'найди',
        ];
    }
  };

  const initRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = getRecognitionLang();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        setTranscript(event.results[0][0].transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  };

  useEffect(() => {
    initRecognition();
  }, [i18n.language]);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = getRecognitionLang();
      setTranscript('');
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speak = (text: string, onEnd?: () => void) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getSpeechLang();
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };
      utterance.onerror = () => setIsSpeaking(false);
      setTimeout(() => window.speechSynthesis.speak(utterance), 100);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const isSupported = !!recognitionRef.current;

  // Переведенные тексты
  const [translated3DHint, setTranslated3DHint] = useState(
    'Зажми и крути мышкой',
  );
  const [translatedHeroBadge, setTranslatedHeroBadge] = useState(
    'Интерактивная карта',
  );
  const [translatedHeroTitle, setTranslatedHeroTitle] =
    useState('Добро пожаловать в');
  const [translatedHeroCountry, setTranslatedHeroCountry] =
    useState('Беларусь');
  const [translatedHeroSubtitle, setTranslatedHeroSubtitle] = useState(
    'Исследуйте исторические и культурные достопримечательности Беларуси',
  );
  const [translatedVoiceAssistant, setTranslatedVoiceAssistant] =
    useState('Голосовой помощник');
  const [translatedListening, setTranslatedListening] = useState('Слушаю...');
  const [translatedSpeakPlace, setTranslatedSpeakPlace] = useState(
    'Скажите название места',
  );
  const [translatedStopListening, setTranslatedStopListening] =
    useState('Остановить');
  const [translatedStartListening, setTranslatedStartListening] =
    useState('Начать');
  const [translatedStopPlaying, setTranslatedStopPlaying] =
    useState('Остановить');
  const [translatedPlaying, setTranslatedPlaying] =
    useState('Воспроизведение...');
  const [translatedYouSaid, setTranslatedYouSaid] = useState('Вы сказали');
  const [translatedExamples, setTranslatedExamples] = useState('Примеры');
  const [translatedExampleMir, setTranslatedExampleMir] =
    useState('Мирский замок');
  const [translatedHelpCommand, setTranslatedHelpCommand] = useState('Помощь');
  const [translatedAvailablePlaces, setTranslatedAvailablePlaces] =
    useState('доступных мест');
  const [translatedInteractiveMap, setTranslatedInteractiveMap] = useState(
    'Интерактивная карта',
  );
  const [translatedPlacesCount, setTranslatedPlacesCount] = useState('мест');
  const [translatedInfo, setTranslatedInfo] = useState('Информация');
  const [translatedSelectMarker, setTranslatedSelectMarker] =
    useState('Нажмите на маркер');
  const [translatedDescription, setTranslatedDescription] =
    useState('Описание');
  const [translatedHistory, setTranslatedHistory] = useState('История');
  const [translatedMore, setTranslatedMore] = useState('Подробнее');
  const [translatedAllPlaces, setTranslatedAllPlaces] = useState('Все места');
  const [translatedPopularPlaces, setTranslatedPopularPlaces] =
    useState('Популярные места');
  const [translatedHide, setTranslatedHide] = useState('Скрыть');
  const [translatedViewAll, setTranslatedViewAll] = useState('Смотреть все');
  const [translatedCoordinates, setTranslatedCoordinates] =
    useState('Координаты');
  const [translatedLatitude, setTranslatedLatitude] = useState('Широта');
  const [translatedLongitude, setTranslatedLongitude] = useState('Долгота');
  const [translatedShowOnMap, setTranslatedShowOnMap] =
    useState('Показать на карте');
  const [translatedFilterByCategory, setTranslatedFilterByCategory] = useState(
    'Фильтр по категориям',
  );
  const [translatedAllCategories, setTranslatedAllCategories] =
    useState('Все категории');

  const [translatedCategories, setTranslatedCategories] = useState<
    Record<string, string>
  >({});

  // Загрузка данных
  useEffect(() => {
    fetchPlaces();
  }, []);

  useEffect(() => {
    if (places.length > 0) {
      translateArray(places, [
        'name',
        'description',
        'history',
        'category',
      ]).then(setTranslatedPlaces);
    }
  }, [places, i18n.language]);

  useEffect(() => {
    if (selectedPlace) {
      translateObject(selectedPlace, [
        'name',
        'description',
        'history',
        'category',
      ]).then(setTranslatedSelectedPlace);
    }
  }, [selectedPlace, i18n.language]);

  useEffect(() => {
    if (detailPlace) {
      translateObject(detailPlace, [
        'name',
        'description',
        'history',
        'category',
      ]).then(setTranslatedDetailPlace);
    }
  }, [detailPlace, i18n.language]);

  useEffect(() => {
    const translateCategories = async () => {
      const uniqueCategories = [...new Set(places.map((p) => p.category))];
      const translations: Record<string, string> = {};
      for (const cat of uniqueCategories) {
        translations[cat] = await translateText(cat);
      }
      setTranslatedCategories(translations);
    };
    if (places.length > 0) translateCategories();
  }, [places, i18n.language, translateText]);

  useEffect(() => {
    const translateStaticTexts = async () => {
      const translations = await Promise.all([
        translateText('Интерактивная карта'),
        translateText('Добро пожаловать в'),
        translateText('Беларусь'),
        translateText(
          'Исследуйте исторические и культурные достопримечательности Беларуси',
        ),
        translateText('Голосовой помощник'),
        translateText('Слушаю...'),
        translateText('Скажите название места'),
        translateText('Остановить'),
        translateText('Начать'),
        translateText('Остановить'),
        translateText('Воспроизведение...'),
        translateText('Вы сказали'),
        translateText('Примеры'),
        translateText('Мирский замок'),
        translateText('Помощь'),
        translateText('доступных мест'),
        translateText('Интерактивная карта'),
        translateText('мест'),
        translateText('Информация'),
        translateText('Нажмите на маркер'),
        translateText('Описание'),
        translateText('История'),
        translateText('Подробнее'),
        translateText('Все места'),
        translateText('Популярные места'),
        translateText('Скрыть'),
        translateText('Смотреть все'),
        translateText('Координаты'),
        translateText('Широта'),
        translateText('Долгота'),
        translateText('Показать на карте'),
        translateText('Фильтр по категориям'),
        translateText('Все категории'),
        translateText('Зажми и крути мышкой'),
      ]);
      setTranslatedHeroBadge(translations[0]);
      setTranslatedHeroTitle(translations[1]);
      setTranslatedHeroCountry(translations[2]);
      setTranslatedHeroSubtitle(translations[3]);
      setTranslatedVoiceAssistant(translations[4]);
      setTranslatedListening(translations[5]);
      setTranslatedSpeakPlace(translations[6]);
      setTranslatedStopListening(translations[7]);
      setTranslatedStartListening(translations[8]);
      setTranslatedStopPlaying(translations[9]);
      setTranslatedPlaying(translations[10]);
      setTranslatedYouSaid(translations[11]);
      setTranslatedExamples(translations[12]);
      setTranslatedExampleMir(translations[13]);
      setTranslatedHelpCommand(translations[14]);
      setTranslatedAvailablePlaces(translations[15]);
      setTranslatedInteractiveMap(translations[16]);
      setTranslatedPlacesCount(translations[17]);
      setTranslatedInfo(translations[18]);
      setTranslatedSelectMarker(translations[19]);
      setTranslatedDescription(translations[20]);
      setTranslatedHistory(translations[21]);
      setTranslatedMore(translations[22]);
      setTranslatedAllPlaces(translations[23]);
      setTranslatedPopularPlaces(translations[24]);
      setTranslatedHide(translations[25]);
      setTranslatedViewAll(translations[26]);
      setTranslatedCoordinates(translations[27]);
      setTranslatedLatitude(translations[28]);
      setTranslatedLongitude(translations[29]);
      setTranslatedShowOnMap(translations[30]);
      setTranslatedFilterByCategory(translations[31]);
      setTranslatedAllCategories(translations[32]);
      setTranslated3DHint(translations[33]);
    };
    translateStaticTexts();
  }, [i18n.language, translateText]);

  // Установка выбранной вкладки после загрузки перевода
  useEffect(() => {
    if (translatedAllCategories && !selectedTab) {
      setSelectedTab(translatedAllCategories);
    }
  }, [translatedAllCategories]);

  // Обновление выбранной вкладки при смене языка
  useEffect(() => {
    if (translatedAllCategories) {
      setSelectedTab(translatedAllCategories);
    }
  }, [i18n.language, translatedAllCategories]);

  useEffect(() => {
    if (transcript) processVoiceCommand(transcript);
  }, [transcript]);

  const fetchPlaces = async () => {
    try {
      const response = await placesAPI.getAll();
      setPlaces(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching places:', error);
      setLoading(false);
    }
  };

  const handleStopVoicePlaying = () => {
    stopSpeaking();
    setIsVoicePlaying(false);
    setVoiceResponse('');
  };

  const findPlaceByVoiceCommand = (command: string): Place | null => {
    let searchTerm = command.toLowerCase().trim();
    const removePhrases = getRemovePhrases();
    for (const phrase of removePhrases) {
      searchTerm = searchTerm.replace(phrase, '');
    }
    searchTerm = searchTerm.trim();
    if (searchTerm.length < 2) return null;
    const placesToSearch =
      translatedPlaces.length > 0 ? translatedPlaces : places;
    return (
      placesToSearch.find((p) => p.name.toLowerCase().includes(searchTerm)) ||
      null
    );
  };

  const processVoiceCommand = (command: string) => {
    const commandLower = command.toLowerCase();
    if (
      commandLower.includes('помощь') ||
      commandLower.includes('help') ||
      commandLower.includes('дапамога')
    ) {
      const helpText = getHelpText();
      setIsVoicePlaying(true);
      speak(helpText, () => setIsVoicePlaying(false));
      setVoiceResponse(helpText);
      setTimeout(() => setVoiceResponse(''), 5000);
      return;
    }
    const foundPlace = findPlaceByVoiceCommand(command);
    if (foundPlace) {
      handlePlaceSelect(foundPlace);
      const description =
        foundPlace.description ||
        foundPlace.history ||
        (i18n.language === 'en'
          ? 'Interesting place in Belarus'
          : i18n.language === 'be'
            ? 'Цікавае месца ў Беларусі'
            : 'Интересное место в Беларуси');
      const responseText = `${foundPlace.name}. ${description.substring(0, 300)}`;
      setIsVoicePlaying(true);
      speak(responseText, () => setIsVoicePlaying(false));
      setVoiceResponse(getFoundText(foundPlace.name));
      setTimeout(() => setVoiceResponse(''), 3000);
    } else {
      const notFoundText = getNotFoundText(command);
      setIsVoicePlaying(true);
      speak(notFoundText, () => setIsVoicePlaying(false));
      setVoiceResponse(notFoundText);
      setTimeout(() => setVoiceResponse(''), 5000);
    }
  };

  const handlePlaceSelect = (place: Place) => {
    setSelectedPlace(place);
    setMapCenter([place.latitude, place.longitude]);
    setMapZoom(12);
    stopSpeaking();
  };

  const handleOpenDetails = (place: Place) => {
    setDetailPlace(place);
    setDetailDialogOpen(true);
  };

  const handleShowOnMap = (place: Place) => {
    setDetailDialogOpen(false);
    setSelectedPlace(place);
    setMapCenter([place.latitude, place.longitude]);
    setMapZoom(12);
    stopSpeaking();
  };

  const getUniqueCategories = () => {
    const cats = [...new Set(places.map((p) => p.category))];
    const translatedCats = cats.map((cat) => translatedCategories[cat] || cat);
    return [translatedAllCategories, ...translatedCats];
  };

  const isCategoryMatch = (placeCategory: string, selectedCategory: string) => {
    if (selectedCategory === translatedAllCategories) return true;
    const translatedCat = translatedCategories[placeCategory] || placeCategory;
    return translatedCat === selectedCategory;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const displayPlaces = translatedPlaces.length > 0 ? translatedPlaces : places;
  const displaySelectedPlace = translatedSelectedPlace || selectedPlace;
  const displayDetailPlace = translatedDetailPlace || detailPlace;
  const uniqueCategories = getUniqueCategories();
  const filteredPlaces = displayPlaces.filter((place) =>
    isCategoryMatch(place.category, selectedTab),
  );
  const displayedPlacesList = showAllPlaces
    ? filteredPlaces
    : filteredPlaces.slice(0, 4);

  const dialogVariants = {
    hidden: {
      opacity: 0,
      scale: 0.2,
      rotateX: -90,
      y: 100,
      transition: { duration: 0.3 },
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotateX: 0,
      y: 0,
      transition: { type: 'spring', damping: 15, stiffness: 200, delay: 0.1 },
    },
    exit: {
      opacity: 0,
      scale: 0.2,
      rotateX: 90,
      y: -100,
      transition: { duration: 0.3 },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { delay: 0.2, duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-x-hidden">
      <style>{popupStyles}</style>

      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-12 sm:py-16 md:py-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Mir_Castle_2018.jpg/1920px-Mir_Castle_2018.jpg')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/50" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6"
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
            <span className="text-white/90 text-xs sm:text-sm">
              {translatedHeroBadge}
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-4 sm:mb-6"
          >
            {translatedHeroTitle}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
              {' '}
              {translatedHeroCountry}
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-xl text-white/80 max-w-2xl mx-auto px-4"
          >
            {translatedHeroSubtitle}
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="relative -mt-12 sm:-mt-16 mb-6 sm:mb-8 z-20">
          <Card className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl sm:rounded-2xl shadow-2xl border-0 overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4 text-center sm:text-left">
                  <div
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center backdrop-blur-sm flex-shrink-0 ${isListening ? 'bg-red-500 animate-pulse' : isVoicePlaying ? 'bg-green-500 animate-pulse' : 'bg-white/20'}`}
                  >
                    {isListening ? (
                      <Mic className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    ) : isVoicePlaying ? (
                      <Volume2 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    ) : (
                      <MicOff className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      {translatedVoiceAssistant}
                    </h3>
                    <p className="text-blue-100 text-xs sm:text-sm">
                      {isListening
                        ? translatedListening
                        : isVoicePlaying
                          ? translatedPlaying
                          : translatedSpeakPlace}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  {isListening ? (
                    <Button
                      onClick={stopListening}
                      variant="destructive"
                      className="rounded-full px-3 sm:px-6 bg-red-500 text-white h-9 sm:h-11 text-xs sm:text-sm"
                    >
                      <MicOff className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />{' '}
                      {translatedStopListening}
                    </Button>
                  ) : isVoicePlaying ? (
                    <Button
                      onClick={handleStopVoicePlaying}
                      variant="destructive"
                      className="rounded-full px-3 sm:px-6 bg-orange-500 text-white h-9 sm:h-11 text-xs sm:text-sm"
                    >
                      <Square className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />{' '}
                      {translatedStopPlaying}
                    </Button>
                  ) : (
                    <Button
                      onClick={startListening}
                      className="bg-white text-blue-600 hover:bg-blue-50 rounded-full px-3 sm:px-6 shadow-lg h-9 sm:h-11 text-xs sm:text-sm"
                      disabled={!isSupported}
                    >
                      <Mic className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />{' '}
                      {translatedStartListening}
                    </Button>
                  )}
                </div>
              </div>
              {transcript && (
                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                  <p className="text-xs sm:text-sm text-white text-center sm:text-left">
                    {translatedYouSaid}:{' '}
                    <span className="font-medium">{transcript}</span>
                  </p>
                </div>
              )}
              {voiceResponse && (
                <div className="mt-2 p-2 bg-white/10 backdrop-blur-sm rounded-lg">
                  <p className="text-[10px] sm:text-xs text-blue-100 text-center sm:text-left">
                    {voiceResponse}
                  </p>
                </div>
              )}
              <div className="mt-3 sm:mt-4 text-center sm:text-left">
                <p className="text-xs sm:text-sm text-blue-100">
                  💡 <strong>{translatedExamples}:</strong> "
                  {translatedExampleMir}", "{translatedHelpCommand}"
                </p>
                <p className="text-blue-100 text-[10px] sm:text-xs mt-1">
                  📍 {translatedAvailablePlaces}: {places.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          <div className="lg:col-span-2">
            <div
              id="map-container"
              className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 sm:px-6 py-2 sm:py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    <span className="text-white font-medium text-sm sm:text-base">
                      {translatedInteractiveMap}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white/80 text-xs sm:text-sm">
                      {places.length} {translatedPlacesCount}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ height: '400px', width: '100%' }}>
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ height: '100%', width: '100%' }}
                  className="rounded-b-xl sm:rounded-b-2xl"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapCenter center={mapCenter} zoom={mapZoom} />
                  {places.map((place) => {
                    const translatedCategory =
                      translatedCategories[place.category] || place.category;
                    return (
                      <Marker
                        key={place.id}
                        position={[place.latitude, place.longitude]}
                        icon={defaultIcon}
                        eventHandlers={{
                          click: () => handlePlaceSelect(place),
                        }}
                      >
                        <Popup className="custom-popup">
                          <div className="p-2 min-w-[160px] max-w-[220px] sm:min-w-[200px] sm:max-w-[280px]">
                            {place.image_url && (
                              <img
                                src={place.image_url}
                                alt={place.name}
                                className="w-full h-24 sm:h-28 object-cover rounded-lg mb-2"
                              />
                            )}
                            <h3 className="font-bold text-blue-700 text-sm sm:text-base mb-1">
                              {place.name}
                            </h3>
                            <div className="flex items-center gap-1 mb-2">
                              <MapPin className="w-2 h-2 sm:w-3 sm:h-3 text-blue-400" />
                              <span className="text-[10px] sm:text-xs text-gray-500">
                                {translatedCategory}
                              </span>
                            </div>
                            {place.description && (
                              <p className="text-[10px] sm:text-xs text-gray-600 line-clamp-2 mb-2">
                                {place.description.length > 60
                                  ? `${place.description.substring(0, 60)}...`
                                  : place.description}
                              </p>
                            )}
                            <Button
                              size="sm"
                              className="w-full mt-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-[10px] sm:text-xs h-6 sm:h-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDetails(place);
                              }}
                            >
                              Подробнее{' '}
                              <ArrowRight className="w-2 h-2 sm:w-3 sm:h-3 ml-1" />
                            </Button>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden sticky top-20 sm:top-24">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 sm:px-6 py-3 sm:py-4">
                <h3 className="text-white font-semibold flex items-center gap-2 text-sm sm:text-base">
                  <Info className="w-4 h-4 sm:w-5 sm:h-5" /> {translatedInfo}
                </h3>
                <p className="text-blue-100 text-xs sm:text-sm">
                  {translatedSelectMarker}
                </p>
              </div>
              <div className="p-4 sm:p-6">
                <AnimatePresence mode="wait">
                  {displaySelectedPlace ? (
                    <motion.div
                      key={displaySelectedPlace.id}
                      variants={contentVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {displaySelectedPlace.image_url && (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="overflow-hidden rounded-lg mb-4"
                        >
                          <img
                            src={displaySelectedPlace.image_url}
                            alt={displaySelectedPlace.name}
                            className="w-full h-36 sm:h-48 object-cover rounded-lg transition-transform duration-300"
                          />
                        </motion.div>
                      )}
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                        {displaySelectedPlace.name}
                      </h2>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center text-blue-500 bg-blue-50 px-2 sm:px-3 py-1 rounded-full">
                          <MapPin className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                          <span className="text-[10px] sm:text-xs">
                            {translatedCategories[
                              displaySelectedPlace.category
                            ] || displaySelectedPlace.category}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                              <Info className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />{' '}
                              {translatedDescription}
                            </h4>
                            <VoiceButton
                              text={displaySelectedPlace.description || ''}
                            />
                          </div>
                          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                            {displaySelectedPlace.description}
                          </p>
                        </div>
                        {displaySelectedPlace.history && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                                <History className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />{' '}
                                {translatedHistory}
                              </h4>
                              <VoiceButton
                                text={displaySelectedPlace.history || ''}
                              />
                            </div>
                            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                              {displaySelectedPlace.history}
                            </p>
                          </div>
                        )}
                      </div>
                      <Button
                        className="w-full mt-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-sm sm:text-base"
                        onClick={() => handleOpenDetails(selectedPlace!)}
                      >
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />{' '}
                        {translatedMore}
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8 sm:py-12"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />
                      </div>
                      <p className="text-gray-400 text-sm sm:text-base">
                        {translatedSelectMarker}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <div id="places-list" className="mt-8 sm:mt-12">
          <div className="mb-6 p-3 sm:p-4 bg-white rounded-xl shadow-md border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                <span className="font-semibold text-gray-700 text-sm sm:text-base">
                  {translatedFilterByCategory}
                </span>
              </div>
              <span className="text-xs sm:text-sm text-gray-500">
                {filteredPlaces.length} {translatedPlacesCount}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {uniqueCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedTab(category)}
                  className={`rounded-full px-2 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-sm transition-all ${selectedTab === category ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              {showAllPlaces ? translatedAllPlaces : translatedPopularPlaces}
            </h2>
            <div className="flex gap-2">
              {showAllPlaces ? (
                <Button
                  variant="ghost"
                  onClick={() => setShowAllPlaces(false)}
                  className="text-blue-600 text-sm sm:text-base"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> {translatedHide}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => setShowAllPlaces(true)}
                  className="text-blue-600 text-sm sm:text-base"
                >
                  {translatedViewAll}{' '}
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {displayedPlacesList.map((place) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5 }}
                onMouseEnter={() => setHoveredCard(place.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <Card
                  className={`cursor-pointer hover:shadow-xl transition-all duration-300 border-0 shadow-md rounded-xl overflow-hidden ${selectedPlace?.id === place.id ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}
                  onClick={() => handlePlaceSelect(place)}
                >
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden h-28 sm:h-36">
                      {place.image_url && (
                        <motion.img
                          src={place.image_url}
                          alt={place.name}
                          className="w-full h-full object-cover"
                          animate={{
                            scale: hoveredCard === place.id ? 1.1 : 1,
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </div>
                    <div className="p-3 sm:p-4">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                            {place.name}
                          </h3>
                          <p className="text-blue-500 text-xs sm:text-sm truncate">
                            {translatedCategories[place.category] ||
                              place.category}
                          </p>
                        </div>
                        <VoiceButton
                          text={`${place.name}. ${place.description || ''}`}
                        />
                      </div>
                      <Button
                        variant="link"
                        size="sm"
                        className="mt-2 p-0 text-blue-600 text-xs sm:text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetails(place);
                        }}
                      >
                        {translatedMore} →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {detailDialogOpen && (
          <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
            <DialogContent
              className="rounded-xl sm:rounded-2xl my-4 sm:my-8 mx-3 sm:mx-auto w-[calc(100%-1.5rem)] sm:w-auto max-w-[95vw] sm:max-w-3xl"
              style={{
                maxWidth: '95vw',
                width: 'auto',
                marginTop: '5vh',
                marginBottom: '5vh',
                maxHeight: '85vh',
                overflowY: 'auto',
              }}
            >
              <AnimatePresence mode="wait">
                {displayDetailPlace && (
                  <motion.div
                    key={displayDetailPlace.id}
                    variants={dialogVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Image3DViewer
                      imageUrl={displayDetailPlace.image_url || ''}
                      title={displayDetailPlace.name}
                      translateHint={translated3DHint}
                    />
                    <div className="p-4 sm:p-6">
                      <motion.div
                        variants={contentVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <DialogHeader>
                          <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            {displayDetailPlace.name}
                          </DialogTitle>
                        </DialogHeader>
                      </motion.div>
                      <motion.div
                        className="mt-4 space-y-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                            <h4 className="font-semibold text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                              <Info className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />{' '}
                              {translatedDescription}
                            </h4>
                            <VoiceButton
                              text={displayDetailPlace.description || ''}
                            />
                          </div>
                          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                            {displayDetailPlace.description}
                          </p>
                        </div>
                        {displayDetailPlace.history && (
                          <div>
                            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                              <h4 className="font-semibold text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                                <History className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />{' '}
                                {translatedHistory}
                              </h4>
                              <VoiceButton
                                text={displayDetailPlace.history || ''}
                              />
                            </div>
                            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                              {displayDetailPlace.history}
                            </p>
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold text-gray-700 flex items-center gap-2 mb-2 text-sm sm:text-base">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />{' '}
                            {translatedCoordinates}
                          </h4>
                          <p className="text-gray-600 text-sm sm:text-base">
                            {translatedLatitude}: {displayDetailPlace.latitude},{' '}
                            {translatedLongitude}:{' '}
                            {displayDetailPlace.longitude}
                          </p>
                        </div>
                      </motion.div>
                      <motion.div
                        className="mt-6 flex justify-end"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                      >
                        <Button
                          onClick={() => handleShowOnMap(detailPlace!)}
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base"
                        >
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />{' '}
                          {translatedShowOnMap}
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InteractiveMap;
