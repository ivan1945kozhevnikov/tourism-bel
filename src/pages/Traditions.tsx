import React, { useState, useEffect, useRef } from 'react';
import { traditionsAPI } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Music,
  Palette,
  Users,
  Calendar,
  Sparkles,
  ArrowRight,
  Star,
  Clock,
  Utensils,
  Gift,
  ChevronRight,
  Loader2,
  Info,
  History,
} from 'lucide-react';
import VoiceReader from '@/components/VoiceReader';
import { useTranslation } from 'react-i18next';
import { useAutoTranslate } from '@/hooks/useAutoTranslate';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Tradition {
  id: number;
  title: string;
  description: string;
  category: string;
  image_url: string;
  celebration_date?: string;
  celebration_day?: number;
  celebration_month?: number;
}

const Traditions: React.FC = () => {
  const { i18n } = useTranslation();
  const { translateText, translateArray } = useAutoTranslate();
  const navigate = useNavigate();

  const [traditions, setTraditions] = useState<Tradition[]>([]);
  const [translatedTraditions, setTranslatedTraditions] = useState<Tradition[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [selectedTradition, setSelectedTradition] = useState<Tradition | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Tradition | null>(
    null,
  );
  const [holidayDialogOpen, setHolidayDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1,
  );
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [nextHoliday, setNextHoliday] = useState<Tradition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Статические переводы
  const [translatedHeroBadge, setTranslatedHeroBadge] = useState(
    'Культурное наследие',
  );
  const [translatedHeroTitle, setTranslatedHeroTitle] = useState('Традиции и');
  const [translatedHeroTitleHigh, setTranslatedHeroTitleHigh] =
    useState('культура Беларуси');
  const [translatedHeroSubtitle, setTranslatedHeroSubtitle] = useState('');
  const [translatedAll, setTranslatedAll] = useState('Все');
  const [translatedMore, setTranslatedMore] = useState('Подробнее');
  const [
    translatedTraditionFromCollection,
    setTranslatedTraditionFromCollection,
  ] = useState('Традиция из коллекции');
  const [translatedNextHoliday, setTranslatedNextHoliday] =
    useState('Ближайший праздник');
  const [translatedDays, setTranslatedDays] = useState('дней');
  const [translatedHours, setTranslatedHours] = useState('часов');
  const [translatedMinutes, setTranslatedMinutes] = useState('минут');
  const [translatedSeconds, setTranslatedSeconds] = useState('секунд');
  const [translatedCalendarTitle, setTranslatedCalendarTitle] = useState(
    'Календарь праздников',
  );
  const [translatedTraditionsTitle, setTranslatedTraditionsTitle] =
    useState('Традиции и обряды');
  const [translatedFoodsTitle, setTranslatedFoodsTitle] =
    useState('Традиционные блюда');
  const [translatedViewRecipe, setTranslatedViewRecipe] =
    useState('Смотреть рецепт');
  const [translatedMonths, setTranslatedMonths] = useState<string[]>([]);
  const [translatedNoHolidays, setTranslatedNoHolidays] = useState(
    'В этом месяце нет народных праздников',
  );
  const [translatedHolidayTraditions, setTranslatedHolidayTraditions] =
    useState('Традиции и обряды');
  const [translatedDescription, setTranslatedDescription] =
    useState('Содержание');
  const [translatedOrigin, setTranslatedOrigin] = useState('Происхождение');
  const [translatedClose, setTranslatedClose] = useState('Закрыть');

  const [translatedCategories, setTranslatedCategories] = useState<
    Record<string, string>
  >({});
  const [activeTab, setActiveTab] = useState<string>('');

  // Функция для получения даты из традиции
  const getHolidayDate = (
    tradition: Tradition,
  ): { day: number; month: number } | null => {
    if (tradition.celebration_date) {
      const parts = tradition.celebration_date.split('.');
      if (parts.length === 2) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        if (
          !isNaN(day) &&
          !isNaN(month) &&
          day >= 1 &&
          day <= 31 &&
          month >= 1 &&
          month <= 12
        ) {
          return { day, month };
        }
      }
    }
    if (tradition.celebration_day && tradition.celebration_month) {
      return {
        day: tradition.celebration_day,
        month: tradition.celebration_month,
      };
    }
    return null;
  };

  // Форматирование даты
  const formatHolidayDate = (tradition: Tradition): string => {
    if (tradition.celebration_date) return tradition.celebration_date;
    if (tradition.celebration_day && tradition.celebration_month) {
      return `${tradition.celebration_day.toString().padStart(2, '0')}.${tradition.celebration_month.toString().padStart(2, '0')}`;
    }
    return '';
  };

  // Поиск ближайшего праздника
  const findNextHoliday = () => {
    if (traditions.length === 0) return null;

    const today = new Date();
    let nearest: Tradition | null = null;
    let nearestDate: Date | null = null;
    let minDiff = Infinity;
    let nearestMonth = 0;

    for (const tradition of traditions) {
      const dateInfo = getHolidayDate(tradition);
      if (!dateInfo) continue;

      const { day, month } = dateInfo;
      let targetDate = new Date(today.getFullYear(), month - 1, day);
      targetDate.setHours(0, 0, 0, 0);

      if (targetDate < today) {
        targetDate = new Date(today.getFullYear() + 1, month - 1, day);
        targetDate.setHours(0, 0, 0, 0);
      }

      const diff = targetDate.getTime() - today.getTime();

      if (diff < minDiff && diff >= 0) {
        minDiff = diff;
        nearest = tradition;
        nearestDate = targetDate;
        nearestMonth = month;
      }
    }

    return { tradition: nearest, targetDate: nearestDate, month: nearestMonth };
  };

  // Загрузка традиций
  const fetchTraditions = async () => {
    try {
      setLoading(true);
      const response = await traditionsAPI.getAll();
      const data = response.data || [];
      setTraditions(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching traditions:', error);
      setTraditions([]);
      setLoading(false);
    }
  };

  // Перевод традиций при смене языка
  useEffect(() => {
    const translateAllTraditions = async () => {
      if (traditions.length > 0) {
        const translated = await translateArray(traditions, [
          'title',
          'description',
        ]);
        setTranslatedTraditions(translated);
      }
    };
    translateAllTraditions();
  }, [traditions, i18n.language]);

  // Перевод категорий
  useEffect(() => {
    const translateCategories = async () => {
      const uniqueCategories = [...new Set(traditions.map((t) => t.category))];
      const translations: Record<string, string> = {};
      for (const cat of uniqueCategories) {
        translations[cat] = await translateText(cat);
      }
      setTranslatedCategories(translations);
    };
    if (traditions.length > 0) translateCategories();
  }, [traditions, i18n.language, translateText]);

  useEffect(() => {
    fetchTraditions();
  }, []);

  // Основной эффект для таймера
  useEffect(() => {
    if (traditions.length === 0) return;

    const updateTimer = () => {
      const result = findNextHoliday();

      if (!result || !result.tradition || !result.targetDate) {
        setNextHoliday(null);
        return;
      }

      const now = new Date();
      const diff = result.targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        const newResult = findNextHoliday();
        if (newResult && newResult.tradition && newResult.targetDate) {
          setNextHoliday(newResult.tradition);
          const newDiff = newResult.targetDate.getTime() - now.getTime();
          setTimeLeft({
            days: Math.floor(newDiff / (1000 * 60 * 60 * 24)),
            hours: Math.floor(
              (newDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
            ),
            minutes: Math.floor((newDiff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((newDiff % (1000 * 60)) / 1000),
          });
        }
      } else {
        setNextHoliday(result.tradition);
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [traditions]);

  // Автоматическое переключение календаря
  useEffect(() => {
    if (traditions.length > 0) {
      const result = findNextHoliday();
      if (result && result.month) {
        setSelectedMonth(result.month);
      }
    }
  }, [traditions]);

  // Перевод месяцев
  useEffect(() => {
    const translateMonths = async () => {
      const months = await Promise.all([
        translateText('Январь'),
        translateText('Февраль'),
        translateText('Март'),
        translateText('Апрель'),
        translateText('Май'),
        translateText('Июнь'),
        translateText('Июль'),
        translateText('Август'),
        translateText('Сентябрь'),
        translateText('Октябрь'),
        translateText('Ноябрь'),
        translateText('Декабрь'),
      ]);
      setTranslatedMonths(months);
    };
    translateMonths();
  }, [i18n.language, translateText]);

  // Перевод статических текстов
  useEffect(() => {
    const translateStaticTexts = async () => {
      const translations = await Promise.all([
        translateText('Культурное наследие'),
        translateText('Традиции и'),
        translateText('культура Беларуси'),
        translateText(
          'Беларусь богата уникальными традициями, которые передаются из поколения в поколение. Узнайте о праздниках, обычаях, музыке и искусстве белорусского народа.',
        ),
        translateText('Все'),
        translateText('Подробнее'),
        translateText('Традиция из коллекции'),
        translateText('Ближайший праздник'),
        translateText('дней'),
        translateText('часов'),
        translateText('минут'),
        translateText('секунд'),
        translateText('Календарь праздников'),
        translateText('Традиции и обряды'),
        translateText('Традиционные блюда'),
        translateText('Смотреть рецепт'),
        translateText('В этом месяце нет народных праздников'),
        translateText('Традиции и обряды'),
        translateText('Содержание'),
        translateText('Происхождение'),
        translateText('Закрыть'),
      ]);
      let i = 0;
      setTranslatedHeroBadge(translations[i++]);
      setTranslatedHeroTitle(translations[i++]);
      setTranslatedHeroTitleHigh(translations[i++]);
      setTranslatedHeroSubtitle(translations[i++]);
      setTranslatedAll(translations[i++]);
      setTranslatedMore(translations[i++]);
      setTranslatedTraditionFromCollection(translations[i++]);
      setTranslatedNextHoliday(translations[i++]);
      setTranslatedDays(translations[i++]);
      setTranslatedHours(translations[i++]);
      setTranslatedMinutes(translations[i++]);
      setTranslatedSeconds(translations[i++]);
      setTranslatedCalendarTitle(translations[i++]);
      setTranslatedTraditionsTitle(translations[i++]);
      setTranslatedFoodsTitle(translations[i++]);
      setTranslatedViewRecipe(translations[i++]);
      setTranslatedNoHolidays(translations[i++]);
      setTranslatedHolidayTraditions(translations[i++]);
      setTranslatedDescription(translations[i++]);
      setTranslatedOrigin(translations[i++]);
      setTranslatedClose(translations[i++]);
    };
    translateStaticTexts();
  }, [i18n.language, translateText]);

  const handleCardClick = (tradition: Tradition) => {
    setSelectedTradition(tradition);
    setDialogOpen(true);
  };

  const handleHolidayClick = (holiday: Tradition) => {
    setSelectedHoliday(holiday);
    setHolidayDialogOpen(true);
  };

  const getCategoryIcon = (category: string) => {
    const categoryLower = category?.toLowerCase() || '';
    if (categoryLower === 'праздники' || categoryLower === 'holidays')
      return Calendar;
    if (categoryLower === 'музыка' || categoryLower === 'music') return Music;
    if (categoryLower === 'искусство' || categoryLower === 'art')
      return Palette;
    if (categoryLower === 'обычаи' || categoryLower === 'customs') return Users;
    return Sparkles;
  };

  const getDisplayCategories = () => {
    const uniqueCategories = [...new Set(traditions.map((t) => t.category))];
    return [
      translatedAll,
      ...uniqueCategories.map((cat) => translatedCategories[cat] || cat),
    ];
  };

  const isCategoryMatch = (
    traditionCategory: string,
    selectedCategory: string,
  ) => {
    if (selectedCategory === translatedAll) return true;
    const translatedCat =
      translatedCategories[traditionCategory] || traditionCategory;
    return translatedCat === selectedCategory;
  };

  const getHolidaysByMonth = (month: number): Tradition[] => {
    return traditions.filter((t) => {
      const dateInfo = getHolidayDate(t);
      if (!dateInfo) return false;
      return dateInfo.month === month;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  const displayTraditions =
    translatedTraditions.length > 0 ? translatedTraditions : traditions;
  const displayCategories = getDisplayCategories();
  const holidaysWithDates = traditions.filter(
    (t) => getHolidayDate(t) !== null,
  );
  const currentTab = activeTab || displayCategories[0] || 'Все';

  const nextHolidayTranslated = nextHoliday
    ? displayTraditions.find((t) => t.id === nextHoliday.id) || nextHoliday
    : null;

  // Анимация для диалога
  const dialogVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1920')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/50" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-white/90 text-sm">{translatedHeroBadge}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            {translatedHeroTitle}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
              {' '}
              {translatedHeroTitleHigh}
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            {translatedHeroSubtitle}
          </p>
        </div>
      </section>

      {/* Таймер до ближайшего праздника */}
      {nextHolidayTranslated && (
        <div className="container mx-auto px-4 -mt-8 relative z-20">
          <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 text-white text-center">
              <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                {translatedNextHoliday}: {nextHolidayTranslated.title}
              </h3>
              <div className="flex justify-center gap-4 mt-3 text-center">
                <div className="bg-white/20 rounded-xl px-4 py-2 min-w-[70px]">
                  <div className="text-3xl font-bold">{timeLeft.days}</div>
                  <div className="text-xs">{translatedDays}</div>
                </div>
                <div className="bg-white/20 rounded-xl px-4 py-2 min-w-[70px]">
                  <div className="text-3xl font-bold">{timeLeft.hours}</div>
                  <div className="text-xs">{translatedHours}</div>
                </div>
                <div className="bg-white/20 rounded-xl px-4 py-2 min-w-[70px]">
                  <div className="text-3xl font-bold">{timeLeft.minutes}</div>
                  <div className="text-xs">{translatedMinutes}</div>
                </div>
                <div className="bg-white/20 rounded-xl px-4 py-2 min-w-[70px]">
                  <div className="text-3xl font-bold">{timeLeft.seconds}</div>
                  <div className="text-xs">{translatedSeconds}</div>
                </div>
              </div>
              <p className="text-sm mt-2 opacity-90 line-clamp-2">
                {nextHolidayTranslated.description?.substring(0, 100)}...
              </p>
              <div className="mt-2 inline-block bg-white/20 rounded-full px-3 py-1 text-xs">
                <Calendar className="w-3 h-3 inline mr-1" />
                {nextHoliday ? formatHolidayDate(nextHoliday) : ''}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Календарь праздников */}
      {holidaysWithDates.length > 0 && (
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {translatedCalendarTitle}
          </h2>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {translatedMonths.map((month, index) => (
              <button
                key={index}
                onClick={() => setSelectedMonth(index + 1)}
                className={`px-4 py-2 rounded-full transition-all duration-300 ${
                  selectedMonth === index + 1
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {month}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getHolidaysByMonth(selectedMonth).map((holiday) => {
              const translatedHoliday = displayTraditions.find(
                (t) => t.id === holiday.id,
              );
              return (
                <motion.div
                  key={holiday.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className="cursor-pointer"
                  onClick={() =>
                    handleHolidayClick(translatedHoliday || holiday)
                  }
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg rounded-xl">
                    <div className="relative h-48">
                      <img
                        src={
                          holiday.image_url ||
                          'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800'
                        }
                        alt={holiday.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold text-blue-700">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {formatHolidayDate(holiday)}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-xl font-bold mb-2 line-clamp-1">
                        {translatedHoliday?.title || holiday.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {translatedHoliday?.description || holiday.description}
                      </p>
                      <Button
                        className="w-full mt-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                        onClick={() =>
                          handleHolidayClick(translatedHoliday || holiday)
                        }
                      >
                        {translatedMore}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {getHolidaysByMonth(selectedMonth).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {translatedNoHolidays}
            </div>
          )}
        </div>
      )}

      {/* Традиции */}
      <div className="container mx-auto px-4 py-12">
        <Tabs value={currentTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="flex flex-wrap justify-center gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-sm">
            {displayCategories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-lg px-4 py-2 transition-all"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {displayCategories.map((category) => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayTraditions
                  .filter((t) => isCategoryMatch(t.category, category))
                  .map((tradition) => {
                    const Icon = getCategoryIcon(tradition.category);
                    const displayCategory =
                      translatedCategories[tradition.category] ||
                      tradition.category;
                    const originalTradition = traditions.find(
                      (t) => t.id === tradition.id,
                    );
                    const holidayDate = originalTradition
                      ? formatHolidayDate(originalTradition)
                      : '';
                    const hasDate = !!holidayDate;

                    return (
                      <motion.div
                        key={tradition.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Card className="cursor-pointer hover:shadow-2xl transition-all duration-500 overflow-hidden group border-0 shadow-lg rounded-xl bg-white hover:-translate-y-2">
                          <div className="relative h-52 overflow-hidden">
                            {tradition.image_url && (
                              <>
                                <img
                                  src={tradition.image_url}
                                  alt={tradition.title}
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800';
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </>
                            )}
                            <div
                              className="absolute top-3 left-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                              style={{
                                backgroundColor: (() => {
                                  const cat =
                                    tradition.category?.toLowerCase() || '';
                                  if (cat.includes('праздник'))
                                    return '#f59e0b';
                                  if (cat.includes('музык')) return '#8b5cf6';
                                  if (cat.includes('искусств'))
                                    return '#ec489a';
                                  if (cat.includes('обычай')) return '#10b981';
                                  return '#3b82f6';
                                })(),
                              }}
                            >
                              {React.createElement(Icon, {
                                className: 'w-5 h-5 text-white',
                              })}
                            </div>
                            {hasDate && (
                              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold text-blue-700 shadow-md z-10">
                                <Calendar className="w-3 h-3 inline mr-1" />
                                {holidayDate}
                              </div>
                            )}
                          </div>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-3">
                              <span
                                className="text-sm font-medium px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: (() => {
                                    const cat =
                                      tradition.category?.toLowerCase() || '';
                                    if (cat.includes('праздник'))
                                      return '#f59e0b20';
                                    if (cat.includes('музык'))
                                      return '#8b5cf620';
                                    if (cat.includes('искусств'))
                                      return '#ec489a20';
                                    if (cat.includes('обычай'))
                                      return '#10b98120';
                                    return '#3b82f620';
                                  })(),
                                  color: (() => {
                                    const cat =
                                      tradition.category?.toLowerCase() || '';
                                    if (cat.includes('праздник'))
                                      return '#f59e0b';
                                    if (cat.includes('музык')) return '#8b5cf6';
                                    if (cat.includes('искусств'))
                                      return '#ec489a';
                                    if (cat.includes('обычай'))
                                      return '#10b981';
                                    return '#3b82f6';
                                  })(),
                                }}
                              >
                                {displayCategory}
                              </span>
                              <VoiceReader
                                text={`${tradition.title}. ${tradition.description?.substring(0, 200) || ''}`}
                              />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                              {tradition.title}
                            </h3>
                            <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">
                              {tradition.description?.substring(0, 120)}...
                            </p>
                            <Button
                              className="w-full mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                              onClick={() => handleCardClick(tradition)}
                            >
                              {translatedMore}
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Диалог традиции */}
      <AnimatePresence>
        {dialogOpen && selectedTradition && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent
              className="max-w-3xl w-[50vw] rounded-2xl my-8"
              style={{
                maxWidth: '50vw',
                width: '70vw',
                marginTop: '5vh',
                marginBottom: '5vh',
                maxHeight: '70vh',
                overflowY: 'auto',
              }}
            >
              <motion.div
                key={selectedTradition.id}
                variants={dialogVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {selectedTradition.image_url && (
                  <div className="relative h-64 overflow-hidden rounded-t-2xl">
                    <img
                      src={selectedTradition.image_url}
                      alt={selectedTradition.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-sm font-medium shadow-lg">
                        {translatedCategories[selectedTradition.category] ||
                          selectedTradition.category}
                      </span>
                    </div>
                    {(() => {
                      const originalTradition = traditions.find(
                        (t) => t.id === selectedTradition.id,
                      );
                      const holidayDate = originalTradition
                        ? formatHolidayDate(originalTradition)
                        : '';
                      return (
                        holidayDate && (
                          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold text-blue-700 shadow-md">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {holidayDate}
                          </div>
                        )
                      );
                    })()}
                  </div>
                )}

                <div className="p-6">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      {selectedTradition.title}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="mt-4 space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                          <Info className="w-4 h-4 text-blue-500" />{' '}
                          {translatedDescription}
                        </h4>
                        <VoiceReader
                          text={selectedTradition.description || ''}
                        />
                      </div>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {selectedTradition.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{translatedTraditionFromCollection}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Диалог праздника */}
      <Dialog open={holidayDialogOpen} onOpenChange={setHolidayDialogOpen}>
        <DialogContent
          className="max-w-3xl w-[50vw] rounded-2xl my-8"
          style={{
            maxWidth: '50vw',
            width: '70vw',
            marginTop: '5vh',
            marginBottom: '5vh',
            maxHeight: '70vh',
            overflowY: 'auto',
          }}
        >
          {selectedHoliday && (
            <>
              {selectedHoliday.image_url && (
                <div className="relative h-56 overflow-hidden rounded-t-2xl">
                  <img
                    src={selectedHoliday.image_url}
                    alt={selectedHoliday.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-sm font-medium shadow-lg">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {(() => {
                        const originalHoliday = traditions.find(
                          (t) => t.id === selectedHoliday.id,
                        );
                        return originalHoliday
                          ? formatHolidayDate(originalHoliday)
                          : '';
                      })()}
                    </span>
                  </div>
                </div>
              )}
              <div className="p-6">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-gray-800">
                    {selectedHoliday.title}
                  </DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  <VoiceReader
                    text={selectedHoliday.description || ''}
                    className="mb-4"
                  />
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {selectedHoliday.description}
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{translatedTraditionFromCollection}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Traditions;
