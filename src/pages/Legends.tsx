import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import 'leaflet/dist/leaflet.css';
import { legendsAPI } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  BookOpen,
  Ghost,
  MapPin,
  Compass,
  Info,
  History,
  ArrowRight,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  Castle,
  TreePine,
  Landmark,
  Mountain,
  Church,
  Scroll,
  Crown,
  Skull,
  QrCode,
  AlertCircle,
} from 'lucide-react';
import VoiceReader from '@/components/VoiceReader';
import { useTranslation } from 'react-i18next';
import { useAutoTranslate } from '@/hooks/useAutoTranslate';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

// Стили для попапа
const popupStyles = `
  .custom-popup .leaflet-popup-content-wrapper {
    border-radius: 20px;
    padding: 0;
    overflow: hidden;
    box-shadow: 0 20px 25px -12px rgba(0,0,0,0.25);
    background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
  }
  .custom-popup .leaflet-popup-content {
    margin: 0;
    min-width: 200px;
    max-width: 280px;
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
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 5px rgba(59,130,246,0.3); }
    50% { box-shadow: 0 0 20px rgba(59,130,246,0.6); }
  }
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  .animate-pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }
`;

// Map center component with smooth animation
const MapCenter: React.FC<{ center: [number, number]; zoom?: number }> = ({
  center,
  zoom = 10,
}) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom, {
        animate: true,
        duration: 0.5,
      });
    }
  }, [center, zoom, map]);
  return null;
};

// Улучшенный 3D Image Viewer с GIF-эффектами
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
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 500);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
      className="relative overflow-hidden rounded-t-xl sm:rounded-t-2xl bg-gradient-to-br from-gray-900 to-gray-800"
      style={{ perspective: 1000 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {showSparkles && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                scale: 0,
                opacity: 1,
              }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full"
              style={{
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        className="relative h-48 sm:h-64 md:h-80 lg:h-96 cursor-grab active:cursor-grabbing overflow-hidden"
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
          className="w-full h-full object-cover rounded-t-xl sm:rounded-t-2xl"
          draggable={false}
        />

        <motion.div
          className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at ${50 + rotationY * 2}% ${50 - rotationX * 2}%, transparent 0%, rgba(0,0,0,0.4) 100%)`,
          }}
        />

        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(59,130,246,0.2) 0%, transparent 70%)',
          }}
        />
      </motion.div>

      <motion.div
        className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 flex gap-1 sm:gap-2 bg-black/60 backdrop-blur-md rounded-full p-1.5 sm:p-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={handleZoomOut}
          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all hover:scale-110"
        >
          <ZoomOut className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        </button>
        <button
          onClick={handleReset}
          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all hover:scale-110"
        >
          <Move className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        </button>
        <button
          onClick={handleZoomIn}
          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all hover:scale-110"
        >
          <ZoomIn className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        </button>
      </motion.div>

      <motion.div
        className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-black/60 backdrop-blur-md rounded-full px-2 py-1 sm:px-3 sm:py-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-white text-[10px] sm:text-xs flex items-center gap-1">
          <RotateCw
            className="w-2 h-2 sm:w-3 sm:h-3 animate-spin"
            style={{ animationDuration: '2s' }}
          />{' '}
          {translateHint}
        </p>
      </motion.div>
    </motion.div>
  );
};

// Функция получения иконки и цвета для категории
const getIconAndColor = (category: string): { icon: any; color: string } => {
  const cat = category?.toLowerCase() || '';

  if (cat.includes('историческ') || cat.includes('historical')) {
    return { icon: BookOpen, color: '#ef4444' };
  }
  if (cat.includes('мистическ') || cat.includes('mystical')) {
    return { icon: Ghost, color: '#a855a7' };
  }
  if (cat.includes('мифологическ') || cat.includes('mythological')) {
    return { icon: Sparkles, color: '#f59e0b' };
  }
  if (cat.includes('замк') || cat.includes('castle')) {
    return { icon: Castle, color: '#8b5cf6' };
  }
  if (cat.includes('природ') || cat.includes('nature')) {
    return { icon: TreePine, color: '#10b981' };
  }
  if (cat.includes('памятник') || cat.includes('monument')) {
    return { icon: Landmark, color: '#3b82f6' };
  }
  if (cat.includes('гор') || cat.includes('mountain')) {
    return { icon: Mountain, color: '#78716c' };
  }
  if (cat.includes('храм') || cat.includes('church')) {
    return { icon: Church, color: '#ec489a' };
  }
  if (cat.includes('легенд') || cat.includes('legend')) {
    return { icon: Scroll, color: '#14b8a6' };
  }
  if (cat.includes('сказан') || cat.includes('tale')) {
    return { icon: Crown, color: '#f97316' };
  }
  if (cat.includes('дух') || cat.includes('spirit')) {
    return { icon: Skull, color: '#6b21a5' };
  }

  return { icon: BookOpen, color: '#6b7280' };
};

// Создание маркера с цветным фоном
const createCustomIcon = (category: string) => {
  const { icon: IconComponent, color } = getIconAndColor(category);

  const iconHtml = ReactDOMServer.renderToString(
    <div
      style={{
        backgroundColor: color,
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        border: '2px solid white',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      className="hover:scale-110 hover:shadow-xl animate-pulse-glow"
    >
      <IconComponent size={18} color="white" strokeWidth={2} />
    </div>,
  );

  return divIcon({
    html: iconHtml,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -18],
  });
};

// МАССИВ ССЫЛОК ДЛЯ QR-КОДОВ (по названию легенды)
const qrLinks = [
  {
    name: 'Русалки — утопленницы, заманивающие в воду',
    url: 'https://drive.google.com/file/d/1hDTXJ3kFWO7I8IPof1sy5nFcHxG8vpNj/view?usp=drive_link',
  },
  {
    name: 'Цветок папоротника — клады и понимание зверей',
    url: 'https://drive.google.com/file/d/1XS3QeVPl2rh1F6bR1_LTgc43z7k-Cds1/view?usp=drive_link',
  },
  {
    name: 'Урочище «Вялікі камень» — следы языческого бога',
    url: 'https://drive.google.com/file/d/1amVvBFDzQdJ7lyPLfw60RuUtgeCryPX_/view?usp=drive_link',
  },
  {
    name: 'Легенда о Миндовге',
    url: 'https://drive.google.com/file/d/1BMaKsgEsD4bBDk0MCxPyTZFwPsx2FXDw/view?usp=drive_link',
  },
  {
    name: 'Легенда о белом коне',
    url: 'https://drive.google.com/file/d/1r6uYkVlmZrsgfKeNHVuO2ocuFs07exsF/view?usp=drive_link',
  },
  {
    name: 'Призрак старого мельника',
    url: 'https://drive.google.com/file/d/183uCTfo9JG8LCBYRPqaCr7w5E0zKawq9/view?usp=drive_link',
  },
  {
    name: 'Камни-свидетели Бориса',
    url: 'https://drive.google.com/file/d/1amVvBFDzQdJ7lyPLfw60RuUtgeCryPX_/view?usp=drive_link',
  },
  {
    name: 'Танцующий лес в Гродненской области',
    url: 'https://drive.google.com/file/d/1VwPbb2A0-JC_GIp5HA1wYIYYNP9rAiiA/view?usp=drive_link',
  },
  {
    name: 'Призрак графини в Гомеле',
    url: 'https://drive.google.com/file/d/1YHkEbXNb8G-CIMeUXKd7EYyAaJXaXTxH/view?usp=drive_link',
  },
  {
    name: 'Клад князя Витовта',
    url: 'https://drive.google.com/file/d/1u6CWp8WE-JuWxSNrOBgpmQAELAo6m6mc/view?usp=drive_link',
  },
  {
    name: 'Призрак трубача из Брестской крепости',
    url: 'https://drive.google.com/file/d/1YHkEbXNb8G-CIMeUXKd7EYyAaJXaXTxH/view?usp=drive_link',
  },
  {
    name: 'Камень-следовик под Могилёвом',
    url: 'https://drive.google.com/file/d/1amVvBFDzQdJ7lyPLfw60RuUtgeCryPX_/view?usp=drive_link',
  },
  {
    name: 'Железный рыцарь озера Нарочь',
    url: 'https://drive.google.com/file/d/1FNcn7-C6ADlv-6c9iKpqJKMXFG8E_jQX/view?usp=drive_link',
  },
  {
    name: 'Летающий корабль Борисова',
    url: 'https://drive.google.com/file/d/16xrkWrg6RcNl_t7KsJURNjfAaMUxu6ZH/view?usp=drive_link',
  },
  {
    name: 'Призрак охотника в Беловежской пуще',
    url: 'https://drive.google.com/file/d/12vNsiBXU3N3bNu1eX-qidSBxFsqL-QRl/view?usp=drive_link',
  },
  {
    name: 'Русалка реки Сож',
    url: 'https://drive.google.com/file/d/1hDTXJ3kFWO7I8IPof1sy5nFcHxG8vpNj/view?usp=drive_link',
  },
  {
    name: 'Призрак рыцаря из Ляховичей',
    url: 'https://drive.google.com/file/d/1FNcn7-C6ADlv-6c9iKpqJKMXFG8E_jQX/view?usp=drive_link',
  },
  {
    name: 'Охотник из Полесья',
    url: 'https://drive.google.com/file/d/12vNsiBXU3N3bNu1eX-qidSBxFsqL-QRl/view?usp=drive_link',
  },
  {
    name: 'Змей Горыныч под Гродно',
    url: 'https://drive.google.com/file/d/1tG6A1OblICH3fQJw2Sl0u0ZvuQcvqr6n/view?usp=drive_link',
  },
  {
    name: 'Белый аист — душа человека',
    url: 'https://drive.google.com/file/d/1D9-sFgWnnhA717GFRIRL5aLi3uqdPFYt/view?usp=drive_link',
  },
  {
    name: 'Легенда о журавле',
    url: 'https://drive.google.com/file/d/1D9-sFgWnnhA717GFRIRL5aLi3uqdPFYt/view?usp=drive_link',
  },
  {
    name: 'Леший Браславских озёр',
    url: 'https://drive.google.com/file/d/13MtctlavKLGn0em-T5oNKaAEPGZ2uO8R/view?usp=drive_link',
  },
  {
    name: 'Дух болот Полесья',
    url: 'https://drive.google.com/file/d/13MtctlavKLGn0em-T5oNKaAEPGZ2uO8R/view?usp=drive_link',
  },
  {
    name: 'Золотой крест Витебска',
    url: 'https://drive.google.com/file/d/1jIgEA8arJrnvYJd1uSYXGZIA7QYZmhF1/view?usp=drive_link',
  },
  {
    name: 'Святая Ефросиния Полоцкая',
    url: 'https://drive.google.com/file/d/1jIgEA8arJrnvYJd1uSYXGZIA7QYZmhF1/view?usp=drive_link',
  },
  {
    name: 'Серебряный колокол Пинска',
    url: 'https://drive.google.com/file/d/1qEhbpLDWhstySHdqj2d-4K1TOc_aE_ju/view?usp=drive_link',
  },
  {
    name: 'Чёрный кот из Могилёвских подземелий',
    url: 'https://drive.google.com/file/d/1j-USTNjgCJe7qbYwr0Yik3-vI65weDPx/view?usp=drive_link',
  },
];

// Функция получения ссылки для QR-кода по названию легенды
const getQrUrlByLegendName = (
  legendName: string,
): { url: string; found: boolean } => {
  const found = qrLinks.find((item) => item.name === legendName);
  if (found) {
    return { url: found.url, found: true };
  }
  return { url: '', found: false };
};

// Default legends data
const defaultLegends = [
  {
    id: 1,
    title: 'Легенда о Миндовге',
    content: 'Великий князь литовский Миндовг...',
    origin: 'Новогрудок',
    category: 'Исторические',
    image_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Mir_Castle_2018.jpg/800px-Mir_Castle_2018.jpg',
    latitude: 53.601,
    longitude: 25.828,
  },
  {
    id: 2,
    title: 'Белый Бог Беловежской пущи',
    content: 'В глубинах Беловежской пущи...',
    origin: 'Беловежская пуща',
    category: 'Мифологические',
    image_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Belovezhskaya_Pushcha_national_park_02.jpg/800px-Belovezhskaya_Pushcha_national_park_02.jpg',
    latitude: 52.566,
    longitude: 23.933,
  },
  {
    id: 3,
    title: 'Призрак Мирского замка',
    content: 'В Мирском замке по ночам...',
    origin: 'Мирский замок',
    category: 'Мистические',
    image_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Niasvizh_Castle.jpg/800px-Niasvizh_Castle.jpg',
    latitude: 53.451,
    longitude: 26.473,
  },
  {
    id: 4,
    title: 'Сокровища Несвижского замка',
    content: 'В подземельях Несвижского замка...',
    origin: 'Несвижский замок',
    category: 'Мистические',
    image_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Mir_Castle_2018.jpg/800px-Mir_Castle_2018.jpg',
    latitude: 53.22,
    longitude: 26.678,
  },
  {
    id: 5,
    title: 'Камень желаний в Полоцке',
    content: 'В Полоцке, недалеко от Софийского собора...',
    origin: 'Полоцк',
    category: 'Мифологические',
    image_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Polack_St.Sophia_Cathedral.jpg/800px-Polack_St.Sophia_Cathedral.jpg',
    latitude: 55.486,
    longitude: 28.775,
  },
  {
    id: 6,
    title: 'Брестская крепость — неприступная',
    content: 'Дух героев, павших в 1941 году...',
    origin: 'Брестская крепость',
    category: 'Исторические',
    image_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Brest_Fortress_2021.jpg/800px-Brest_Fortress_2021.jpg',
    latitude: 52.097,
    longitude: 23.734,
  },
];

const Legends: React.FC = () => {
  const { i18n } = useTranslation();
  const { translateText, translateArray } = useAutoTranslate();
  const [originalLegends, setOriginalLegends] = useState<any[]>([]);
  const [translatedLegends, setTranslatedLegends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    53.9045, 27.5615,
  ]);
  const [mapZoom, setMapZoom] = useState<number>(7);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailLegend, setDetailLegend] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState<string>('');
  const selectedTabRef = useRef<string>('');

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Состояния для QR-диалога
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [currentQrUrl, setCurrentQrUrl] = useState('');
  const [currentLegendName, setCurrentLegendName] = useState('');
  const [noModelDialogOpen, setNoModelDialogOpen] = useState(false);
  const [noModelLegendName, setNoModelLegendName] = useState('');

  const [translatedAll, setTranslatedAll] = useState('Все');
  const [translatedMore, setTranslatedMore] = useState('Подробнее');
  const [translatedPlacesCount, setTranslatedPlacesCount] = useState('легенд');
  const [translatedInteractiveMap, setTranslatedInteractiveMap] =
    useState('Карта легенд');
  const [translatedDescription, setTranslatedDescription] =
    useState('Содержание');
  const [translatedHistory, setTranslatedHistory] = useState('Происхождение');
  const [translatedShowOnMap, setTranslatedShowOnMap] =
    useState('Показать на карте');
  const [translated3DHint, setTranslated3DHint] = useState(
    'Зажми и крути мышкой',
  );
  const [translatedHeroBadge, setTranslatedHeroBadge] =
    useState('Древние предания');
  const [translatedHeroTitle, setTranslatedHeroTitle] = useState('Легенды');
  const [translatedHeroTitleHigh, setTranslatedHeroTitleHigh] =
    useState('Беларуси');
  const [translatedHeroSubtitle, setTranslatedHeroSubtitle] = useState('');
  const [translatedQrTitle, setTranslatedQrTitle] = useState('QR-код легенды');
  const [translatedOpenInBrowser, setTranslatedOpenInBrowser] =
    useState('Открыть в браузере');
  const [translatedScanMe, setTranslatedScanMe] = useState(
    'Отсканируйте QR-код',
  );
  const [translatedQrFor, setTranslatedQrFor] = useState('QR-код для');
  const [translatedNoModelTitle, setTranslatedNoModelTitle] = useState(
    '3D модель не найдена',
  );
  const [translatedNoModelDesc, setTranslatedNoModelDesc] = useState(
    'Для данной легенды пока нет 3D модели',
  );

  const [translatedCategories, setTranslatedCategories] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    fetchLegends();
  }, []);

  useEffect(() => {
    const translateLegends = async () => {
      if (originalLegends.length > 0) {
        const translated = await translateArray(originalLegends, [
          'title',
          'content',
          'origin',
          'category',
        ]);
        setTranslatedLegends(translated);
      }
    };
    translateLegends();
  }, [originalLegends, i18n.language]);

  useEffect(() => {
    const translateCategories = async () => {
      const uniqueCategories = [
        ...new Set(originalLegends.map((l) => l.category)),
      ];
      const translations: Record<string, string> = {};
      for (const cat of uniqueCategories) {
        translations[cat] = await translateText(cat);
      }
      setTranslatedCategories(translations);
    };
    if (originalLegends.length > 0) translateCategories();
  }, [originalLegends, i18n.language, translateText]);

  useEffect(() => {
    const translateStaticTexts = async () => {
      const [
        newAll,
        newMore,
        newPlacesCount,
        newInteractiveMap,
        newDescription,
        newHistory,
        newShowOnMap,
        new3DHint,
        newHeroBadge,
        newHeroTitle,
        newHeroTitleHigh,
        newHeroSubtitle,
        newQrTitle,
        newOpenInBrowser,
        newScanMe,
        newQrFor,
        newNoModelTitle,
        newNoModelDesc,
      ] = await Promise.all([
        translateText('Все'),
        translateText('Подробнее'),
        translateText('легенд'),
        translateText('Карта легенд'),
        translateText('Содержание'),
        translateText('Происхождение'),
        translateText('Показать на карте'),
        translateText('Зажми и крути мышкой'),
        translateText('Древние предания'),
        translateText('Легенды'),
        translateText('Беларуси'),
        translateText(
          'Древние предания и мифы, передаваемые из поколения в поколение. Откройте для себя таинственный мир белорусского фольклора.',
        ),
        translateText('QR-код легенды'),
        translateText('Открыть в браузере'),
        translateText('Отсканируйте QR-код'),
        translateText('QR-код для'),
        translateText('3D модель не найдена'),
        translateText('Для данной легенды пока нет 3D модели'),
      ]);
      setTranslatedAll(newAll);
      setTranslatedMore(newMore);
      setTranslatedPlacesCount(newPlacesCount);
      setTranslatedInteractiveMap(newInteractiveMap);
      setTranslatedDescription(newDescription);
      setTranslatedHistory(newHistory);
      setTranslatedShowOnMap(newShowOnMap);
      setTranslated3DHint(new3DHint);
      setTranslatedHeroBadge(newHeroBadge);
      setTranslatedHeroTitle(newHeroTitle);
      setTranslatedHeroTitleHigh(newHeroTitleHigh);
      setTranslatedHeroSubtitle(newHeroSubtitle);
      setTranslatedQrTitle(newQrTitle);
      setTranslatedOpenInBrowser(newOpenInBrowser);
      setTranslatedScanMe(newScanMe);
      setTranslatedQrFor(newQrFor);
      setTranslatedNoModelTitle(newNoModelTitle);
      setTranslatedNoModelDesc(newNoModelDesc);
    };
    translateStaticTexts();
  }, [i18n.language, translateText]);

  // Сохраняем активную вкладку
  useEffect(() => {
    if (selectedTab) {
      selectedTabRef.current = selectedTab;
    }
  }, [selectedTab]);

  // Восстанавливаем активную вкладку при смене языка
  useEffect(() => {
    if (translatedAll) {
      if (selectedTabRef.current && selectedTabRef.current !== '') {
        const originalCategory = Object.keys(translatedCategories).find(
          (key) => translatedCategories[key] === selectedTabRef.current,
        );
        if (originalCategory) {
          const newTranslated = translatedCategories[originalCategory];
          if (newTranslated) {
            setSelectedTab(newTranslated);
          } else {
            setSelectedTab(translatedAll);
          }
        } else {
          setSelectedTab(translatedAll);
        }
      } else {
        setSelectedTab(translatedAll);
      }
    }
  }, [translatedAll, translatedCategories]);

  const fetchLegends = async () => {
    try {
      const response = await legendsAPI.getAll();
      if (response.data && response.data.length > 0) {
        setOriginalLegends(response.data);
      } else {
        setOriginalLegends(defaultLegends);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching legends:', error);
      setOriginalLegends(defaultLegends);
      setLoading(false);
    }
  };

  const handleOpenDetails = (legend: any) => {
    setDetailLegend(legend);
    setDetailDialogOpen(true);
  };

  const handlePlaceSelect = (legend: any) => {
    if (legend.latitude && legend.longitude) {
      setMapCenter([legend.latitude, legend.longitude]);
      setMapZoom(13);
    }
  };

  const handleShowOnMap = (legend: any) => {
    if (legend.latitude && legend.longitude) {
      setDetailDialogOpen(false);
      setMapCenter([legend.latitude, legend.longitude]);
      setMapZoom(13);
      setTimeout(() => {
        const mapContainer = document.querySelector('.leaflet-container');
        if (mapContainer) {
          mapContainer.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 100);
    }
  };

  const openQrDialog = (legend: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const result = getQrUrlByLegendName(legend.title);
    if (result.found && result.url) {
      setCurrentQrUrl(result.url);
      setCurrentLegendName(legend.title);
      setQrDialogOpen(true);
    } else {
      setNoModelLegendName(legend.title);
      setNoModelDialogOpen(true);
    }
  };

  const getUniqueCategories = () => {
    const cats = [...new Set(originalLegends.map((l) => l.category))];
    const translatedCats = cats.map((cat) => translatedCategories[cat] || cat);
    return [translatedAll, ...translatedCats];
  };

  const isCategoryMatch = (
    legendCategory: string,
    selectedCategory: string,
  ) => {
    if (selectedCategory === translatedAll) return true;
    const translatedCat =
      translatedCategories[legendCategory] || legendCategory;
    return translatedCat === selectedCategory;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const displayLegends =
    translatedLegends.length > 0 ? translatedLegends : originalLegends;
  const uniqueCategories = getUniqueCategories();
  const legendsWithCoords = displayLegends.filter(
    (legend) =>
      legend.latitude &&
      legend.longitude &&
      isCategoryMatch(legend.category, selectedTab),
  );

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <style>{popupStyles}</style>

      {/* Hero Section - адаптивная */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-12 sm:py-16 md:py-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYwXqPkg5y04t66SA4VCkz1eCMasWWd1ADVg&s')] bg-cover bg-center opacity-20" />
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
              {translatedHeroTitleHigh}
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-xl text-white/80 max-w-3xl mx-auto px-4"
          >
            {translatedHeroSubtitle}
          </motion.p>
        </div>
      </section>

      {/* Карта - адаптивная */}
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 sm:px-6 py-2.5 sm:py-3">
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
                  {legendsWithCoords.length} {translatedPlacesCount}
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
              {legendsWithCoords.map((legend) => {
                const { icon: IconComponent, color: iconColor } =
                  getIconAndColor(legend.category);
                return (
                  <Marker
                    key={legend.id}
                    position={[legend.latitude, legend.longitude]}
                    icon={createCustomIcon(legend.category)}
                    eventHandlers={{ click: () => handlePlaceSelect(legend) }}
                  >
                    <Popup className="custom-popup">
                      <div className="p-2 sm:p-3 max-w-[200px] sm:max-w-xs">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                          <div
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: iconColor }}
                          >
                            {React.createElement(IconComponent, {
                              className: 'w-4 h-4 sm:w-5 sm:h-5 text-white',
                            })}
                          </div>
                          <h3 className="font-bold text-gray-800 text-sm sm:text-base line-clamp-2">
                            {legend.title}
                          </h3>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 mb-2">
                          {legend.content?.substring(0, 80) || ''}...
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span
                            className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${iconColor}20`,
                              color: iconColor,
                            }}
                          >
                            {translatedCategories[legend.category] ||
                              legend.category}
                          </span>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-[10px] sm:text-xs h-6 sm:h-7 px-2 sm:px-3"
                            onClick={() => handleOpenDetails(legend)}
                          >
                            {translatedMore}
                          </Button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* Легенды о категориях - адаптивные иконки */}
        <div className="mt-6 sm:mt-8 mb-6 sm:mb-8 flex flex-wrap justify-center gap-3 sm:gap-6">
          {Object.entries(translatedCategories).map(([orig, trans]) => {
            const { icon: IconComp, color } = getIconAndColor(orig);
            return (
              <motion.div
                key={orig}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-1.5 sm:gap-2"
              >
                <div
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                >
                  {React.createElement(IconComp, {
                    className: 'w-3 h-3 sm:w-4 sm:h-4 text-white',
                  })}
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700">
                  {trans}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Фильтры - как в Traditions: на ПК как было, на мобильных горизонтальная прокрутка */}
        <div className="overflow-x-auto lg:overflow-x-visible pb-2 -mx-3 lg:mx-0 px-3 lg:px-0">
          <div className="flex flex-nowrap lg:flex-wrap gap-2 lg:gap-3 min-w-max lg:min-w-0">
            {uniqueCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedTab(category)}
                className={`whitespace-nowrap rounded-full px-4 lg:px-6 py-2 lg:py-2.5 text-sm lg:text-base font-medium transition-all duration-300 ${
                  selectedTab === category
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Карточки легенд - адаптивные */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {displayLegends
            .filter((l) => isCategoryMatch(l.category, selectedTab))
            .map((legend, idx) => {
              const { icon: IconComponent, color: iconColor } = getIconAndColor(
                legend.category,
              );
              const displayCategory =
                translatedCategories[legend.category] || legend.category;

              return (
                <motion.div
                  key={legend.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="h-full"
                >
                  <Card className="cursor-pointer hover:shadow-2xl transition-all duration-500 overflow-hidden group border-0 shadow-lg rounded-xl bg-white hover:-translate-y-2 h-full flex flex-col">
                    <div className="relative h-40 sm:h-48 md:h-52 overflow-hidden flex-shrink-0">
                      {legend.image_url && (
                        <>
                          <img
                            src={legend.image_url}
                            alt={legend.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Mir_Castle_2018.jpg/800px-Mir_Castle_2018.jpg';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </>
                      )}
                      <div
                        className="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg animate-float"
                        style={{ backgroundColor: iconColor }}
                      >
                        {React.createElement(IconComponent, {
                          className:
                            'w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white',
                        })}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                        <h3 className="text-white text-xs sm:text-sm md:text-base font-bold leading-tight line-clamp-2">
                          {legend.title}
                        </h3>
                      </div>
                    </div>
                    <CardContent className="p-3 sm:p-4 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <span
                          className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${iconColor}20`,
                            color: iconColor,
                          }}
                        >
                          {displayCategory}
                        </span>
                        <VoiceReader
                          text={`${legend.title}. ${legend.content?.substring(0, 200) || ''}`}
                        />
                      </div>
                      <p className="text-gray-500 text-[11px] sm:text-sm line-clamp-3 leading-relaxed flex-1">
                        {legend.content?.substring(0, 100) || ''}...
                      </p>
                      {legend.origin && (
                        <div className="flex items-center gap-1 mt-2 text-[10px] sm:text-xs text-gray-400">
                          <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span className="line-clamp-1">{legend.origin}</span>
                        </div>
                      )}
                      <div className="flex gap-2 mt-3 sm:mt-4">
                        <Button
                          className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full transition-all duration-300 text-[11px] sm:text-sm py-1.5 sm:py-2"
                          onClick={() => handleOpenDetails(legend)}
                        >
                          {translatedMore}
                          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                        </Button>
                        <Button
                          variant="outline"
                          className="rounded-full px-2 sm:px-4 py-1.5 sm:py-2"
                          onClick={(e) => openQrDialog(legend, e)}
                          title="QR-код"
                        >
                          <QrCode className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
        </div>
      </div>

      {/* QR Dialog - адаптивный */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-md rounded-xl sm:rounded-2xl text-center mx-3">
          <DialogHeader>
            <DialogTitle className="text-center text-lg sm:text-xl">
              {translatedQrTitle}
            </DialogTitle>
          </DialogHeader>
          {currentQrUrl && (
            <div className="flex flex-col items-center py-4 sm:py-6">
              <div className="bg-white p-3 sm:p-4 rounded-xl shadow-lg">
                <QRCodeSVG
                  value={currentQrUrl}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="L"
                  includeMargin={true}
                />
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                {translatedQrFor} {currentLegendName}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* No Model Dialog - адаптивный */}
      <Dialog open={noModelDialogOpen} onOpenChange={setNoModelDialogOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-md rounded-xl sm:rounded-2xl text-center mx-3">
          <div className="flex flex-col items-center py-4 sm:py-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl font-bold text-gray-800 text-center">
                {translatedNoModelTitle}
              </DialogTitle>
            </DialogHeader>
            <p className="text-gray-500 text-sm sm:text-base text-center mt-2">
              {translatedNoModelDesc} "{noModelLegendName}"
            </p>
            <Button
              onClick={() => setNoModelDialogOpen(false)}
              className="mt-5 sm:mt-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full px-5 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base"
            >
              Закрыть
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog - адаптивный для телефонов и планшетов */}
      <AnimatePresence>
        {detailDialogOpen && detailLegend && (
          <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
            <DialogContent
              className={
                isMobile
                  ? 'rounded-xl sm:rounded-2xl p-0 overflow-hidden'
                  : 'rounded-xl sm:rounded-2xl my-4 sm:my-8 mx-3 sm:mx-auto w-[calc(100%-1.5rem)] sm:w-auto max-w-[95vw] sm:max-w-3xl'
              }
              style={
                isMobile
                  ? {
                      maxWidth: '90vw',
                      width: '90vw',
                      maxHeight: '90vh',
                      height: 'auto',
                      overflowY: 'auto',
                      position: 'fixed',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      padding: 0,
                    }
                  : {
                      maxWidth: '95vw',
                      width: 'auto',
                      marginTop: '5vh',
                      marginBottom: '5vh',
                      maxHeight: '85vh',
                      overflowY: 'auto',
                    }
              }
            >
              <AnimatePresence mode="wait">
                {detailLegend && (
                  <motion.div
                    key={detailLegend.id}
                    variants={dialogVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Image3DViewer
                      imageUrl={detailLegend.image_url || ''}
                      title={detailLegend.title}
                      translateHint={translated3DHint}
                    />

                    <div
                      className="p-4 sm:p-6"
                      style={
                        isMobile ? { maxHeight: '50vh', overflowY: 'auto' } : {}
                      }
                    >
                      <motion.div
                        variants={contentVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <DialogHeader>
                          <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            {detailLegend.title}
                          </DialogTitle>
                        </DialogHeader>
                      </motion.div>

                      {detailLegend.origin && (
                        <div className="flex items-center gap-1 mt-2 text-xs sm:text-sm text-gray-500">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{detailLegend.origin}</span>
                        </div>
                      )}

                      <motion.div
                        className="mt-3 sm:mt-4 space-y-3 sm:space-y-4"
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
                            <VoiceReader text={detailLegend.content || ''} />
                          </div>
                          <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                            {detailLegend.content}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-700 flex items-center gap-2 mb-2 text-sm sm:text-base">
                            <History className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />{' '}
                            {translatedHistory}
                          </h4>
                          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                            {detailLegend.origin}
                          </p>
                        </div>

                        {detailLegend.latitude && detailLegend.longitude && (
                          <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                            <p className="text-[11px] sm:text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                              <MapPin className="w-3 h-3" />
                              📍 Координаты: {detailLegend.latitude},{' '}
                              {detailLegend.longitude}
                            </p>
                          </div>
                        )}
                      </motion.div>

                      <div className="flex gap-2 mt-5 sm:mt-6">
                        <motion.div
                          className="flex-1"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6, duration: 0.5 }}
                        >
                          <Button
                            onClick={() => handleShowOnMap(detailLegend)}
                            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base transition-all duration-300 hover:scale-105 hover:shadow-lg"
                          >
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />{' '}
                            {translatedShowOnMap}
                          </Button>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7, duration: 0.5 }}
                        >
                          <Button
                            variant="outline"
                            onClick={(e) => openQrDialog(detailLegend, e)}
                            className="rounded-full px-3 sm:px-4 py-1.5 sm:py-2"
                          >
                            <QrCode className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </motion.div>
                      </div>
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

export default Legends;
