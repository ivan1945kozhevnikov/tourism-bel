import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import {
  Map,
  Calendar,
  BookOpen,
  Utensils,
  ArrowRight,
  Star,
  Scroll,
  Landmark,
  Compass,
  Sparkles,
  Camera,
  ChevronLeft,
  ChevronRight,
  User,
  Quote,
} from 'lucide-react';
import {
  feedbackAPI,
  reviewsAPI,
  legendsAPI,
  traditionsAPI,
  foodsAPI,
  placesAPI,
} from '@/services/api';
import { useAutoTranslate } from '@/hooks/useAutoTranslate';

gsap.registerPlugin(ScrollTrigger);

interface StatsData {
  landmarks: number;
  traditions: number;
  legends: number;
  food: number;
}

const Home: React.FC = () => {
  const { i18n } = useTranslation();
  const { translateText, translateArray } = useAutoTranslate();
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [featuredReviews, setFeaturedReviews] = useState<any[]>([]);
  const [translatedFeaturedReviews, setTranslatedFeaturedReviews] = useState<
    any[]
  >([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Динамическая статистика
  const [statsData, setStatsData] = useState<StatsData>({
    landmarks: 0,
    traditions: 0,
    legends: 0,
    food: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Состояния для переведенных текстов
  const [translatedWelcome, setTranslatedWelcome] =
    useState('Добро пожаловать в');
  const [translatedTitle, setTranslatedTitle] = useState('Откройте для себя');
  const [translatedCountry, setTranslatedCountry] = useState('Беларусь');
  const [translatedSubtitle, setTranslatedSubtitle] = useState(
    'Уникальные маршруты, древние замки, богатая культура и традиции',
  );
  const [translatedStart, setTranslatedStart] = useState('Начать путешествие');
  const [translatedExplore, setTranslatedExplore] = useState('Исследовать');
  const [translatedMirCastle, setTranslatedMirCastle] =
    useState('Мирский замок');
  const [translatedMirSubtitle, setTranslatedMirSubtitle] =
    useState('Объект ЮНЕСКО');
  const [translatedWhatWeOffer, setTranslatedWhatWeOffer] =
    useState('Что мы предлагаем');
  const [translatedWhatWeOfferDesc, setTranslatedWhatWeOfferDesc] = useState(
    'Откройте для себя удивительную Беларусь через наши уникальные разделы',
  );
  const [translatedPopular, setTranslatedPopular] = useState(
    'Популярные направления',
  );
  const [translatedPopularDesc, setTranslatedPopularDesc] = useState(
    'Самые посещаемые места Беларуси',
  );
  const [translatedReady, setTranslatedReady] = useState(
    'Готовы к приключениям?',
  );
  const [translatedReadyDesc, setTranslatedReadyDesc] = useState(
    'Присоединяйтесь к нам и откройте для себя удивительную Беларусь',
  );
  const [translatedRegister, setTranslatedRegister] =
    useState('Зарегистрироваться');
  const [translatedDetails, setTranslatedDetails] = useState('Подробнее');
  const [translatedFeaturedReviewsTitle, setTranslatedFeaturedReviewsTitle] =
    useState('Отзывы наших гостей');
  const [translatedFeaturedReviewsDesc, setTranslatedFeaturedReviewsDesc] =
    useState('Что говорят путешественники');
  const [translatedAllReviewsBtn, setTranslatedAllReviewsBtn] =
    useState('Все отзывы');

  // Состояния для статистики (переводимые)
  const [translatedStatsTitle, setTranslatedStatsTitle] =
    useState('Беларусь в цифрах');
  const [translatedStatsSubtitle, setTranslatedStatsSubtitle] = useState(
    'Узнайте больше о богатом культурном наследии Беларуси',
  );
  const [translatedStatsNote, setTranslatedStatsNote] = useState(
    '* Данные обновляются автоматически при добавлении нового контента',
  );
  const [translatedLandmarksLabel, setTranslatedLandmarksLabel] = useState(
    'Достопримечательностей',
  );
  const [translatedTraditionsLabel, setTranslatedTraditionsLabel] =
    useState('Традиций');
  const [translatedLegendsLabel, setTranslatedLegendsLabel] =
    useState('Легенд');
  const [translatedFoodLabel, setTranslatedFoodLabel] = useState('Блюд');

  // Состояния для фич
  const [translatedMap, setTranslatedMap] = useState('Интерактивная карта');
  const [translatedMapDesc, setTranslatedMapDesc] = useState(
    'Исследуйте достопримечательности на интерактивной карте с голосовым помощником',
  );
  const [translatedTours, setTranslatedTours] = useState('Туры и маршруты');
  const [translatedToursDesc, setTranslatedToursDesc] = useState(
    'Готовые маршруты по самым интересным местам Беларуси',
  );
  const [translatedTraditionsTitle, setTranslatedTraditionsTitle] =
    useState('Традиции');
  const [translatedTraditionsDesc, setTranslatedTraditionsDesc] = useState(
    'Узнайте о богатых культурных традициях белорусского народа',
  );
  const [translatedFoodTitle, setTranslatedFoodTitle] =
    useState('Национальная кухня');
  const [translatedFoodDesc, setTranslatedFoodDesc] = useState(
    'Знаменитые блюда белорусской кухни и рецепты',
  );
  const [translatedLegendsTitle, setTranslatedLegendsTitle] =
    useState('Легенды');
  const [translatedLegendsDesc, setTranslatedLegendsDesc] = useState(
    'Древние легенды и предания белорусской земли',
  );

  // Состояния для слайдера
  const [sliderData, setSliderData] = useState([
    {
      title: 'Мирский замок',
      subtitle: 'Памятник архитектуры XVI века',
      description:
        'Один из самых известных замков Беларуси, объект Всемирного наследия ЮНЕСКО',
      image:
        'https://minskholidays.by/img/carousel/mirskii-i-nesvijskii-zamki-1.jpg',
    },
    {
      title: 'Несвижский замок',
      subtitle: 'Резиденция рода Радзивиллов',
      description:
        'Величественный дворцово-замковый комплекс с богатой историей и парками',
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSx5Xw10mYz35ZEw0GQBuKEpHQCp3KBQj0c8w&s',
    },
    {
      title: 'Беловежская пуща',
      subtitle: 'Древнейший лес Европы',
      description:
        'Уникальный биосферный заповедник, дом для зубров и других редких животных',
      image:
        'https://minskholidays.by/img/carousel/belovezhskaya-pushcha-1.jpg',
    },
    {
      title: 'Брестская крепость',
      subtitle: 'Крепость-герой',
      description:
        'Мемориальный комплекс в память о героической обороне 1941 года',
      image:
        'https://avatars.mds.yandex.net/get-altay/9837233/2a00000189eefd207a9c977871d2b8ec15a2/L_height',
    },
    {
      title: 'Гродненский замок',
      subtitle: 'Старый и Новый замки',
      description:
        'Древняя резиденция королей и князей Великого княжества Литовского',
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeBSBcA9Qu6hqoaxfjd3kk9ew0oZmlUHMJyQ&s',
    },
    {
      title: 'Софийский собор',
      subtitle: 'Древнейший храм Полоцка',
      description: 'Памятник древнерусского зодчества XI века',
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSq3vJNOkwhvGRcB1VWTqOsDeFvz0mWO6nnMw&s',
    },
  ]);

  const [translatedSliderData, setTranslatedSliderData] = useState(sliderData);

  // Загрузка динамической статистики из API
  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const [placesRes, traditionsRes, legendsRes, foodRes] =
          await Promise.allSettled([
            placesAPI.getAll(),
            traditionsAPI.getAll(),
            legendsAPI.getAll(),
            foodsAPI.getAll(),
          ]);

        const placesCount =
          placesRes.status === 'fulfilled' &&
          Array.isArray(placesRes.value.data)
            ? placesRes.value.data.length
            : 0;

        const traditionsCount =
          traditionsRes.status === 'fulfilled' &&
          Array.isArray(traditionsRes.value.data)
            ? traditionsRes.value.data.length
            : 0;

        const legendsCount =
          legendsRes.status === 'fulfilled' &&
          Array.isArray(legendsRes.value.data)
            ? legendsRes.value.data.length
            : 0;

        const foodCount =
          foodRes.status === 'fulfilled' && Array.isArray(foodRes.value.data)
            ? foodRes.value.data.length
            : 0;

        setStatsData({
          landmarks: placesCount,
          traditions: traditionsCount,
          legends: legendsCount,
          food: foodCount,
        });
      } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
        setStatsData({
          landmarks: 0,
          traditions: 0,
          legends: 0,
          food: 0,
        });
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // ========== ИСПРАВЛЕННАЯ ЗАГРУЗКА ОТЗЫВОВ - ТОЛЬКО is_featured = 1 ==========
  const fetchFeaturedReviews = async () => {
    try {
      setReviewsLoading(true);
      // Получаем ВСЕ отзывы
      const response = await reviewsAPI.getAll();
      const allReviews = Array.isArray(response.data) ? response.data : [];

      // Фильтруем: только ОДОБРЕННЫЕ (is_approved = 1) И ИЗБРАННЫЕ (is_featured = 1)
      const featuredOnly = allReviews.filter(
        (review) => review.is_approved === 1 && review.is_featured === 1,
      );

      setFeaturedReviews(featuredOnly);
      console.log('Избранных отзывов (is_featured=1):', featuredOnly.length);
    } catch (error) {
      console.error('Ошибка загрузки избранных отзывов:', error);
      setFeaturedReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };
  // ========== КОНЕЦ ИСПРАВЛЕННОЙ ФУНКЦИИ ==========

  // Загрузка избранных отзывов
  useEffect(() => {
    fetchFeaturedReviews();
  }, []);

  // Анимация счетчика
  useEffect(() => {
    if (statsLoading) return;

    const targets = [
      statsData.landmarks,
      statsData.traditions,
      statsData.legends,
      statsData.food,
    ];

    const animateValue = (
      element: HTMLElement,
      start: number,
      end: number,
      duration: number,
    ) => {
      let startTimestamp: number | null = null;
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentValue = Math.floor(progress * (end - start) + start);
        element.textContent = currentValue.toString();
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    };

    const valueElements = document.querySelectorAll('.stat-value');
    valueElements.forEach((el, idx) => {
      const target = targets[idx];
      if (target > 0) {
        animateValue(el as HTMLElement, 0, target, 1500);
      } else {
        (el as HTMLElement).textContent = '0';
      }
    });
  }, [statsData, statsLoading]);

  // Перевод избранных отзывов
  useEffect(() => {
    const translateFeatured = async () => {
      if (featuredReviews.length === 0) return;
      const translated = await translateArray(featuredReviews, [
        'user_name',
        'text',
      ]);
      setTranslatedFeaturedReviews(translated);
    };
    translateFeatured();
  }, [featuredReviews, i18n.language, translateArray]);

  // Перевод всех текстов
  useEffect(() => {
    const translateStaticTexts = async () => {
      const [
        welcome,
        title,
        country,
        subtitle,
        start,
        explore,
        mirCastle,
        mirSubtitle,
        whatWeOffer,
        whatWeOfferDesc,
        popular,
        popularDesc,
        ready,
        readyDesc,
        registerBtn,
        details,
        mapText,
        mapDesc,
        toursText,
        toursDesc,
        traditionsTitleText,
        traditionsDescText,
        foodTitleText,
        foodDescText,
        legendsTitleText,
        legendsDescText,
        featuredReviewsTitle,
        featuredReviewsDescText,
        allReviewsBtn,
        statsTitle,
        statsSubtitle,
        statsNote,
        landmarksLabel,
        traditionsLabel,
        legendsLabel,
        foodLabel,
      ] = await Promise.all([
        translateText('Добро пожаловать в'),
        translateText('Откройте для себя'),
        translateText('Беларусь'),
        translateText(
          'Уникальные маршруты, древние замки, богатая культура и традиции',
        ),
        translateText('Начать путешествие'),
        translateText('Исследовать'),
        translateText('Мирский замок'),
        translateText('Объект ЮНЕСКО'),
        translateText('Что мы предлагаем'),
        translateText(
          'Откройте для себя удивительную Беларусь через наши уникальные разделы',
        ),
        translateText('Популярные направления'),
        translateText('Самые посещаемые места Беларуси'),
        translateText('Готовы к приключениям?'),
        translateText(
          'Присоединяйтесь к нам и откройте для себя удивительную Беларусь',
        ),
        translateText('Зарегистрироваться'),
        translateText('Подробнее'),
        translateText('Интерактивная карта'),
        translateText(
          'Исследуйте достопримечательности на интерактивной карте с голосовым помощником',
        ),
        translateText('Туры и маршруты'),
        translateText('Готовые маршруты по самым интересным местам Беларуси'),
        translateText('Традиции'),
        translateText(
          'Узнайте о богатых культурных традициях белорусского народа',
        ),
        translateText('Национальная кухня'),
        translateText('Знаменитые блюда белорусской кухни и рецепты'),
        translateText('Легенды'),
        translateText('Древние легенды и предания белорусской земли'),
        translateText('Отзывы наших гостей'),
        translateText('Что говорят путешественники'),
        translateText('Все отзывы'),
        translateText('Беларусь в цифрах'),
        translateText('Узнайте больше о богатом культурном наследии Беларуси'),
        translateText(
          '* Данные обновляются автоматически при добавлении нового контента',
        ),
        translateText('Достопримечательностей'),
        translateText('Традиций'),
        translateText('Легенд'),
        translateText('Блюд'),
      ]);

      setTranslatedWelcome(welcome);
      setTranslatedTitle(title);
      setTranslatedCountry(country);
      setTranslatedSubtitle(subtitle);
      setTranslatedStart(start);
      setTranslatedExplore(explore);
      setTranslatedMirCastle(mirCastle);
      setTranslatedMirSubtitle(mirSubtitle);
      setTranslatedWhatWeOffer(whatWeOffer);
      setTranslatedWhatWeOfferDesc(whatWeOfferDesc);
      setTranslatedPopular(popular);
      setTranslatedPopularDesc(popularDesc);
      setTranslatedReady(ready);
      setTranslatedReadyDesc(readyDesc);
      setTranslatedRegister(registerBtn);
      setTranslatedDetails(details);
      setTranslatedMap(mapText);
      setTranslatedMapDesc(mapDesc);
      setTranslatedTours(toursText);
      setTranslatedToursDesc(toursDesc);
      setTranslatedTraditionsTitle(traditionsTitleText);
      setTranslatedTraditionsDesc(traditionsDescText);
      setTranslatedFoodTitle(foodTitleText);
      setTranslatedFoodDesc(foodDescText);
      setTranslatedLegendsTitle(legendsTitleText);
      setTranslatedLegendsDesc(legendsDescText);
      setTranslatedFeaturedReviewsTitle(featuredReviewsTitle);
      setTranslatedFeaturedReviewsDesc(featuredReviewsDescText);
      setTranslatedAllReviewsBtn(allReviewsBtn);
      setTranslatedStatsTitle(statsTitle);
      setTranslatedStatsSubtitle(statsSubtitle);
      setTranslatedStatsNote(statsNote);
      setTranslatedLandmarksLabel(landmarksLabel);
      setTranslatedTraditionsLabel(traditionsLabel);
      setTranslatedLegendsLabel(legendsLabel);
      setTranslatedFoodLabel(foodLabel);
    };

    translateStaticTexts();
  }, [i18n.language, translateText]);

  // Перевод слайдера
  useEffect(() => {
    const translateSlider = async () => {
      const translated = await translateArray(sliderData, [
        'title',
        'subtitle',
        'description',
      ]);
      setTranslatedSliderData(translated);
    };
    translateSlider();
  }, [i18n.language, translateArray]);

  // GSAP анимации
  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(
      '.hero-title',
      { opacity: 0, y: 80 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' },
    );
    tl.fromTo(
      '.hero-subtitle',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      '-=0.5',
    );
    tl.fromTo(
      '.hero-buttons',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.2)' },
      '-=0.3',
    );
    tl.fromTo(
      '.hero-image',
      { opacity: 0, scale: 1.1 },
      { opacity: 1, scale: 1, duration: 1, ease: 'power3.out' },
      '-=0.8',
    );

    gsap.fromTo(
      '.feature-card',
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'back.out(1)',
        scrollTrigger: { trigger: featuresRef.current, start: 'top 75%' },
      },
    );

    gsap.fromTo(
      '.stat-item',
      { opacity: 0, y: 30, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1)',
        scrollTrigger: { trigger: statsRef.current, start: 'top 80%' },
      },
    );

    gsap.to('.floating-1', {
      y: 20,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
    });
    gsap.to('.floating-2', {
      y: -15,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
      delay: 1,
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const renderStars = (rating: number) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3 h-3 sm:w-4 sm:h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );

  const features = [
    {
      icon: Map,
      title: translatedMap,
      description: translatedMapDesc,
      link: '/map',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Calendar,
      title: translatedTours,
      description: translatedToursDesc,
      link: '/tours',
      gradient: 'from-indigo-500 to-blue-500',
    },
    {
      icon: BookOpen,
      title: translatedTraditionsTitle,
      description: translatedTraditionsDesc,
      link: '/traditions',
      gradient: 'from-sky-500 to-blue-500',
    },
    {
      icon: Utensils,
      title: translatedFoodTitle,
      description: translatedFoodDesc,
      link: '/food',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      icon: Scroll,
      title: translatedLegendsTitle,
      description: translatedLegendsDesc,
      link: '/legends',
      gradient: 'from-blue-600 to-cyan-600',
    },
  ];

  // Данные для статистики с переводимыми подписями
  const stats = [
    {
      icon: Landmark,
      value: statsData.landmarks,
      label: translatedLandmarksLabel,
    },
    {
      icon: BookOpen,
      value: statsData.traditions,
      label: translatedTraditionsLabel,
    },
    { icon: Scroll, value: statsData.legends, label: translatedLegendsLabel },
    { icon: Utensils, value: statsData.food, label: translatedFoodLabel },
  ];

  const displayFeaturedReviews =
    translatedFeaturedReviews.length > 0
      ? translatedFeaturedReviews
      : featuredReviews;

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"
      >
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Mir_Castle_2018.jpg/1920px-Mir_Castle_2018.jpg')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/50" />
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-1 absolute top-20 left-[10%] w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="floating-2 absolute bottom-20 right-[15%] w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6 mx-auto lg:mx-0">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                <span className="text-white/90 text-xs sm:text-sm">
                  {translatedWelcome}
                </span>
              </div>
              <h1 className="hero-title text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                {translatedTitle}
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
                  {' '}
                  {translatedCountry}
                </span>
              </h1>
              <p className="hero-subtitle text-base sm:text-lg md:text-xl text-white/80 max-w-xl mb-6 sm:mb-10 leading-relaxed mx-auto lg:mx-0">
                {translatedSubtitle}
              </p>
              <div className="hero-buttons flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 text-sm sm:text-base md:text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <Link to="/tours">
                    {translatedStart}
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 text-sm sm:text-base md:text-lg font-semibold rounded-full shadow-md border-white/20"
                >
                  <Link to="/map" className="flex items-center justify-center">
                    <Compass className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    {translatedExplore}
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hero-image hidden lg:block relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://minskholidays.by/img/carousel/mirskii-i-nesvijskii-zamki-1.jpg"
                  alt="Мирский замок"
                  className="w-full h-[300px] xl:h-[400px] object-cover rounded-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent" />
              </div>
              <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 border border-white/20">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm sm:text-base">
                      {translatedMirCastle}
                    </p>
                    <p className="text-white/60 text-xs sm:text-sm">
                      {translatedMirSubtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 sm:w-1.5 sm:h-3 bg-white/40 rounded-full" />
          </div>
        </div>
      </section>

      {/* Stats Section - Статистика в сине-голубых тонах */}
      <section
        ref={statsRef}
        className="py-12 sm:py-16 md:py-20 relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50"
      >
        {/* Декоративные элементы */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Заголовок */}
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 sm:mb-3">
              {translatedStatsTitle}
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base px-4">
              {translatedStatsSubtitle}
            </p>
            <div className="w-16 h-0.5 sm:w-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mx-auto mt-4 sm:mt-5" />
          </div>

          {/* Блоки статистики */}
          <div className="flex flex-wrap justify-center sm:justify-between gap-6 sm:gap-8 md:gap-10 max-w-7xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="stat-item group relative bg-white rounded-2xl p-5 sm:p-6 md:p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-blue-100 w-[190px] sm:w-[210px] md:w-[230px] lg:w-[250px]"
              >
                {/* Иконка */}
                <div className="relative z-10 mb-3 sm:mb-4 md:mb-5">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto shadow-md group-hover:scale-105 transition-transform duration-300">
                    <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                </div>

                {/* Число */}
                <div className="relative z-10 text-center">
                  {statsLoading ? (
                    <div className="flex justify-center">
                      <div className="w-16 h-8 sm:w-20 sm:h-10 bg-gray-200 rounded-lg animate-pulse" />
                    </div>
                  ) : (
                    <span className="stat-value text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 block text-center">
                      {stat.value}
                    </span>
                  )}

                  {/* Подпись */}
                  <p className="text-gray-500 font-medium text-xs sm:text-sm mt-2 sm:mt-3 text-center leading-tight">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Дополнительная информация */}
          <div className="text-center mt-8 sm:mt-10 md:mt-12">
            <p className="text-gray-400 text-[10px] sm:text-xs">
              {translatedStatsNote}
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4">
              {translatedWhatWeOffer}
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base px-4">
              {translatedWhatWeOfferDesc}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 md:gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="feature-card group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
              >
                <CardContent className="p-5 sm:p-6 md:p-8">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 sm:mb-5 md:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-800">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 text-sm sm:text-base mb-4 sm:mb-5 md:mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  <Link
                    to={feature.link}
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold group/link text-sm sm:text-base"
                  >
                    <span>{translatedDetails}</span>
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations - Слайдер */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4">
              {translatedPopular}
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base px-4">
              {translatedPopularDesc}
            </p>
          </div>
          <div className="relative px-8 sm:px-10 md:px-12">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={20}
              slidesPerView={1}
              centeredSlides={true}
              navigation={{
                nextEl: '.swiper-button-next-custom',
                prevEl: '.swiper-button-prev-custom',
              }}
              pagination={{ clickable: true, dynamicBullets: true }}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              loop={true}
              breakpoints={{
                480: { slidesPerView: 1.1, spaceBetween: 15 },
                640: { slidesPerView: 1.3, spaceBetween: 20 },
                768: { slidesPerView: 2, spaceBetween: 25 },
                1024: { slidesPerView: 3, spaceBetween: 30 },
              }}
              className="pb-10 sm:pb-12"
            >
              {translatedSliderData.map((dest, index) => (
                <SwiperSlide key={index}>
                  <div className="relative overflow-hidden rounded-2xl h-[300px] sm:h-[350px] md:h-[400px] shadow-xl group cursor-pointer">
                    <img
                      src={dest.image}
                      alt={dest.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6 text-white">
                      <h3 className="text-xl sm:text-2xl font-bold mb-1">
                        {dest.title}
                      </h3>
                      <p className="text-white/80 text-xs sm:text-sm mb-1 sm:mb-2">
                        {dest.subtitle}
                      </p>
                      <p className="text-white/60 text-xs sm:text-sm line-clamp-2">
                        {dest.description}
                      </p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <button className="swiper-button-prev-custom absolute left-0 sm:left-1 md:left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg">
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
            </button>
            <button className="swiper-button-next-custom absolute right-0 sm:right-1 md:right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg">
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
            </button>
          </div>
        </div>
      </section>

      {/* Featured Reviews Section - ТОЛЬКО ИЗБРАННЫЕ ОТЗЫВЫ */}
      {displayFeaturedReviews.length > 0 && (
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <div className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-3 sm:mb-4">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                <span className="text-blue-800 text-xs sm:text-sm font-medium">
                  {translatedFeaturedReviewsTitle}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4">
                {translatedFeaturedReviewsTitle}
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base px-4">
                {translatedFeaturedReviewsDesc}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {/* Показываем ВСЕ избранные отзывы (без slice) */}
              {displayFeaturedReviews.map((review) => (
                <Card
                  key={review.id}
                  className="border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all"
                >
                  <CardContent className="p-5 sm:p-6">
                    <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-blue-200 mb-3 sm:mb-4" />
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4 line-clamp-4">
                      "{review.text}"
                    </p>
                    <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm sm:text-base">
                            {review.user_name}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-400">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {renderStars(review.rating)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8 sm:mt-10 md:mt-12">
              <Button
                asChild
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-full px-6 sm:px-8 py-2 sm:py-2.5 text-sm sm:text-base"
              >
                <Link to="/reviews">{translatedAllReviewsBtn}</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6">
            {translatedReady}
          </h2>
          <p className="text-gray-500 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto text-sm sm:text-base md:text-lg px-4">
            {translatedReadyDesc}
          </p>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 text-sm sm:text-base md:text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <Link to="/register">
              {translatedRegister}
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Стили для анимаций */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default Home;
