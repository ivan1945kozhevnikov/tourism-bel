import React, { useState, useEffect, useRef } from 'react';
import { traditionsAPI } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Loader2,
  Info,
} from 'lucide-react';
import VoiceReader from '@/components/VoiceReader';
import { useTranslation } from 'react-i18next';
import { useAutoTranslate } from '@/hooks/useAutoTranslate';
import { motion, AnimatePresence } from 'framer-motion';

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

  const [originalTraditions, setOriginalTraditions] = useState<Tradition[]>([]);
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
  const [translatedMonths, setTranslatedMonths] = useState<string[]>([]);
  const [translatedNoHolidays, setTranslatedNoHolidays] = useState(
    'В этом месяце нет народных праздников',
  );
  const [translatedDescription, setTranslatedDescription] =
    useState('Содержание');

  const [translatedCategories, setTranslatedCategories] = useState<
    Record<string, string>
  >({});
  const [selectedTab, setSelectedTab] = useState<string>('');
  const selectedTabRef = useRef<string>('');

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
    if (originalTraditions.length === 0) return null;

    const today = new Date();
    let nearest: Tradition | null = null;
    let nearestDate: Date | null = null;
    let minDiff = Infinity;
    let nearestMonth = 0;

    for (const tradition of originalTraditions) {
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
      setOriginalTraditions(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching traditions:', error);
      setOriginalTraditions([]);
      setLoading(false);
    }
  };

  // Перевод традиций при смене языка
  useEffect(() => {
    const translateAllTraditions = async () => {
      if (originalTraditions.length > 0) {
        const translated = await translateArray(originalTraditions, [
          'title',
          'description',
        ]);
        setTranslatedTraditions(translated);
      }
    };
    translateAllTraditions();
  }, [originalTraditions, i18n.language]);

  // Перевод категорий
  useEffect(() => {
    const translateCategories = async () => {
      const uniqueCategories = [
        ...new Set(originalTraditions.map((t) => t.category)),
      ];
      const translations: Record<string, string> = {};
      for (const cat of uniqueCategories) {
        translations[cat] = await translateText(cat);
      }
      setTranslatedCategories(translations);
    };
    if (originalTraditions.length) translateCategories();
  }, [originalTraditions, i18n.language, translateText]);

  useEffect(() => {
    fetchTraditions();
  }, []);

  // Основной эффект для таймера
  useEffect(() => {
    if (originalTraditions.length === 0) return;

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
  }, [originalTraditions]);

  // Автоматическое переключение календаря
  useEffect(() => {
    if (originalTraditions.length > 0) {
      const result = findNextHoliday();
      if (result && result.month) {
        setSelectedMonth(result.month);
      }
    }
  }, [originalTraditions]);

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
        translateText('В этом месяце нет народных праздников'),
        translateText('Содержание'),
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
      setTranslatedNoHolidays(translations[i++]);
      setTranslatedDescription(translations[i++]);
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
    const uniqueCategories = [
      ...new Set(originalTraditions.map((t) => t.category)),
    ];
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
    return originalTraditions.filter((t) => {
      const dateInfo = getHolidayDate(t);
      if (!dateInfo) return false;
      return dateInfo.month === month;
    });
  };

  // Восстановление выбранной категории при смене языка
  useEffect(() => {
    if (selectedTab) {
      selectedTabRef.current = selectedTab;
    }
  }, [selectedTab]);

  // Ключевое исправление: при смене языка обновляем selectedTab на translatedAll
  useEffect(() => {
    if (translatedAll) {
      setSelectedTab(translatedAll);
    }
  }, [translatedAll]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  const displayTraditions =
    translatedTraditions.length > 0 ? translatedTraditions : originalTraditions;
  const displayCategories = getDisplayCategories();
  const holidaysWithDates = originalTraditions.filter(
    (t) => getHolidayDate(t) !== null,
  );

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
      {/* Hero Section - адаптивная */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-12 sm:py-16 md:py-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1920')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/50" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
            <span className="text-white/90 text-xs sm:text-sm">
              {translatedHeroBadge}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-4 sm:mb-6">
            {translatedHeroTitle}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
              {' '}
              {translatedHeroTitleHigh}
            </span>
          </h1>
          <p className="text-base sm:text-xl text-white/80 max-w-3xl mx-auto px-4">
            {translatedHeroSubtitle}
          </p>
        </div>
      </section>

      {/* Таймер до ближайшего праздника - адаптивный */}
      {nextHolidayTranslated && (
        <div className="container mx-auto px-3 sm:px-4 -mt-8 sm:-mt-12 relative z-20">
          <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
            <div className="px-4 sm:px-6 py-4 sm:py-5 text-white text-center">
              <h3 className="text-base sm:text-lg font-semibold flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                {translatedNextHoliday}: {nextHolidayTranslated.title}
              </h3>
              <div className="flex justify-center gap-2 sm:gap-4 mt-3 text-center">
                <div className="bg-white/20 rounded-lg sm:rounded-xl px-2 sm:px-4 py-1.5 sm:py-2 min-w-[55px] sm:min-w-[70px]">
                  <div className="text-xl sm:text-3xl font-bold">
                    {timeLeft.days}
                  </div>
                  <div className="text-[10px] sm:text-xs">{translatedDays}</div>
                </div>
                <div className="bg-white/20 rounded-lg sm:rounded-xl px-2 sm:px-4 py-1.5 sm:py-2 min-w-[55px] sm:min-w-[70px]">
                  <div className="text-xl sm:text-3xl font-bold">
                    {timeLeft.hours}
                  </div>
                  <div className="text-[10px] sm:text-xs">
                    {translatedHours}
                  </div>
                </div>
                <div className="bg-white/20 rounded-lg sm:rounded-xl px-2 sm:px-4 py-1.5 sm:py-2 min-w-[55px] sm:min-w-[70px]">
                  <div className="text-xl sm:text-3xl font-bold">
                    {timeLeft.minutes}
                  </div>
                  <div className="text-[10px] sm:text-xs">
                    {translatedMinutes}
                  </div>
                </div>
                <div className="bg-white/20 rounded-lg sm:rounded-xl px-2 sm:px-4 py-1.5 sm:py-2 min-w-[55px] sm:min-w-[70px]">
                  <div className="text-xl sm:text-3xl font-bold">
                    {timeLeft.seconds}
                  </div>
                  <div className="text-[10px] sm:text-xs">
                    {translatedSeconds}
                  </div>
                </div>
              </div>
              <p className="text-xs sm:text-sm mt-2 opacity-90 line-clamp-2 hidden sm:block">
                {nextHolidayTranslated.description?.substring(0, 100)}...
              </p>
              <div className="mt-2 inline-block bg-white/20 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs">
                <Calendar className="w-2 h-2 sm:w-3 sm:h-3 inline mr-1" />
                {nextHoliday ? formatHolidayDate(nextHoliday) : ''}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Календарь праздников - адаптивный */}
      {holidaysWithDates.length > 0 && (
        <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {translatedCalendarTitle}
          </h2>

          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-6 sm:mb-8">
            {translatedMonths.map((month, index) => (
              <button
                key={index}
                onClick={() => setSelectedMonth(index + 1)}
                className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full transition-all duration-300 text-xs sm:text-sm ${
                  selectedMonth === index + 1
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {month}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                  className="cursor-pointer h-full"
                  onClick={() =>
                    handleHolidayClick(translatedHoliday || holiday)
                  }
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg rounded-xl h-full flex flex-col">
                    <div className="relative h-40 sm:h-48 flex-shrink-0">
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
                      <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-white/90 backdrop-blur-sm rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-sm font-semibold text-blue-700">
                        <Calendar className="w-2 h-2 sm:w-3 sm:h-3 inline mr-1" />
                        {formatHolidayDate(holiday)}
                      </div>
                    </div>
                    <CardContent className="p-3 sm:p-4 flex-1 flex flex-col">
                      <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2 line-clamp-2">
                        {translatedHoliday?.title || holiday.title}
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm line-clamp-3 flex-1">
                        {translatedHoliday?.description || holiday.description}
                      </p>
                      <Button
                        className="w-full mt-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full transition-all duration-300 text-xs sm:text-sm py-1.5 sm:py-2"
                        onClick={() =>
                          handleHolidayClick(translatedHoliday || holiday)
                        }
                      >
                        {translatedMore}
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {getHolidaysByMonth(selectedMonth).length === 0 && (
            <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
              {translatedNoHolidays}
            </div>
          )}
        </div>
      )}

      {/* Традиции - фильтры: на ПК как было, на мобильных горизонтальная прокрутка */}
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <div className="overflow-x-auto lg:overflow-x-visible pb-2 -mx-3 lg:mx-0 px-3 lg:px-0">
          <div className="flex flex-nowrap lg:flex-wrap gap-2 lg:gap-3 min-w-max lg:min-w-0">
            {displayCategories.map((category) => (
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

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {displayTraditions
                .filter((t) => isCategoryMatch(t.category, selectedTab))
                .map((tradition) => {
                  const Icon = getCategoryIcon(tradition.category);
                  const displayCategory =
                    translatedCategories[tradition.category] ||
                    tradition.category;
                  const originalTradition = originalTraditions.find(
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
                      className="h-full"
                    >
                      <Card className="cursor-pointer hover:shadow-2xl transition-all duration-500 overflow-hidden group border-0 shadow-lg rounded-xl bg-white hover:-translate-y-2 h-full flex flex-col">
                        <div className="relative h-40 sm:h-48 md:h-52 flex-shrink-0 overflow-hidden">
                          {tradition.image_url && (
                            <img
                              src={tradition.image_url}
                              alt={tradition.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800';
                              }}
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                          <div
                            className="absolute top-2 left-2 sm:top-3 sm:left-3 w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg z-10"
                            style={{
                              backgroundColor: (() => {
                                const cat =
                                  tradition.category?.toLowerCase() || '';
                                if (cat.includes('праздник')) return '#f59e0b';
                                if (cat.includes('музык')) return '#8b5cf6';
                                if (cat.includes('искусств')) return '#ec489a';
                                if (cat.includes('обычай')) return '#10b981';
                                return '#3b82f6';
                              })(),
                            }}
                          >
                            {React.createElement(Icon, {
                              className:
                                'w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white',
                            })}
                          </div>

                          {hasDate && (
                            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/95 backdrop-blur-sm rounded-full px-1.5 sm:px-2.5 py-0.5 text-[9px] sm:text-xs font-semibold text-blue-700 shadow-md z-10">
                              <Calendar className="w-2 h-2 sm:w-3 sm:h-3 inline mr-0.5 sm:mr-1" />
                              {holidayDate}
                            </div>
                          )}

                          <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                            <h3 className="text-white text-xs sm:text-sm md:text-base font-bold leading-tight line-clamp-2">
                              {tradition.title}
                            </h3>
                          </div>
                        </div>
                        <CardContent className="p-2.5 sm:p-4 flex-1 flex flex-col">
                          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                            <span
                              className="text-[9px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: (() => {
                                  const cat =
                                    tradition.category?.toLowerCase() || '';
                                  if (cat.includes('праздник'))
                                    return '#f59e0b20';
                                  if (cat.includes('музык')) return '#8b5cf620';
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
                                  if (cat.includes('обычай')) return '#10b981';
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
                          <p className="text-gray-500 text-[11px] sm:text-sm line-clamp-3 leading-relaxed flex-1">
                            {tradition.description?.substring(0, 100)}...
                          </p>
                          <Button
                            className="w-full mt-2 sm:mt-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full transition-all duration-300 text-[11px] sm:text-sm py-1.5 sm:py-2"
                            onClick={() => handleCardClick(tradition)}
                          >
                            {translatedMore}
                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Диалог традиции - адаптивный */}
      <AnimatePresence>
        {dialogOpen && selectedTradition && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
              <motion.div
                key={selectedTradition.id}
                variants={dialogVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {selectedTradition.image_url && (
                  <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden rounded-t-xl sm:rounded-t-2xl">
                    <img
                      src={selectedTradition.image_url}
                      alt={selectedTradition.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {(() => {
                      const originalTradition = originalTraditions.find(
                        (t) => t.id === selectedTradition.id,
                      );
                      const holidayDate = originalTradition
                        ? formatHolidayDate(originalTradition)
                        : '';
                      return (
                        holidayDate && (
                          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-white/90 backdrop-blur-sm rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-sm font-semibold text-blue-700 shadow-md">
                            <Calendar className="w-2 h-2 sm:w-3 sm:h-3 inline mr-1" />
                            {holidayDate}
                          </div>
                        )
                      );
                    })()}
                  </div>
                )}

                <div className="p-4 sm:p-6">
                  <DialogHeader>
                    <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      {selectedTradition.title}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <h4 className="font-semibold text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                          <Info className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />{' '}
                          {translatedDescription}
                        </h4>
                        <VoiceReader
                          text={selectedTradition.description || ''}
                        />
                      </div>
                      <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                        {selectedTradition.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                      <span>{translatedTraditionFromCollection}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Диалог праздника - адаптивный */}
      <Dialog open={holidayDialogOpen} onOpenChange={setHolidayDialogOpen}>
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
          {selectedHoliday && (
            <>
              {selectedHoliday.image_url && (
                <div className="relative h-48 sm:h-56 overflow-hidden rounded-t-xl sm:rounded-t-2xl">
                  <img
                    src={selectedHoliday.image_url}
                    alt={selectedHoliday.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-[10px] sm:text-sm font-medium shadow-lg">
                      <Calendar className="w-2 h-2 sm:w-3 sm:h-3 inline mr-1" />
                      {(() => {
                        const originalHoliday = originalTraditions.find(
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
              <div className="p-4 sm:p-6">
                <DialogHeader>
                  <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-800">
                    {selectedHoliday.title}
                  </DialogTitle>
                </DialogHeader>
                <div className="mt-3 sm:mt-4">
                  <VoiceReader
                    text={selectedHoliday.description || ''}
                    className="mb-3 sm:mb-4"
                  />
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                    {selectedHoliday.description}
                  </p>
                </div>
                <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
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
