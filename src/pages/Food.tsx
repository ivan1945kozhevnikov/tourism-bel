import React, { useState, useEffect, useRef } from 'react';
import { foodsAPI } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Utensils,
  Soup,
  Cake,
  Coffee,
  ChefHat,
  Star,
  Gamepad2,
  Check,
  X,
  RefreshCw,
  Timer,
  Info,
  ArrowRight,
} from 'lucide-react';
import VoiceReader from '@/components/VoiceReader';
import { useTranslation } from 'react-i18next';
import { useAutoTranslate } from '@/hooks/useAutoTranslate';
import { motion } from 'framer-motion';

const FoodPage: React.FC = () => {
  const { i18n } = useTranslation();
  const { translateText, translateArray } = useAutoTranslate();

  const [originalFoods, setOriginalFoods] = useState<any[]>([]);
  const [translatedFoods, setTranslatedFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [gameDialogOpen, setGameDialogOpen] = useState(false);
  const [gameFood, setGameFood] = useState<any>(null);
  const [gameCurrentQuestion, setGameCurrentQuestion] = useState(0);
  const [gameCorrectCount, setGameCorrectCount] = useState(0);
  const [gameMessage, setGameMessage] = useState('');
  const [gameMessageType, setGameMessageType] = useState<
    'success' | 'error' | ''
  >('');
  const [gameShowResult, setGameShowResult] = useState(false);
  const [gameTimeLeft, setGameTimeLeft] = useState(15);
  const [gameActive, setGameActive] = useState(false);
  const [gameTotalQuestions, setGameTotalQuestions] = useState(3);
  const [gameQuestionsList, setGameQuestionsList] = useState<any[]>([]);
  const [gameAnswered, setGameAnswered] = useState(false);

  const [selectedTab, setSelectedTab] = useState<string>('');
  const selectedTabRef = useRef<string>('');

  // Статические переводы
  const [translatedHeroBadge, setTranslatedHeroBadge] = useState(
    'Кулинарное наследие',
  );
  const [translatedHeroTitle, setTranslatedHeroTitle] =
    useState('Национальная');
  const [translatedHeroTitleHigh, setTranslatedHeroTitleHigh] =
    useState('кухня Беларуси');
  const [translatedHeroSubtitle, setTranslatedHeroSubtitle] = useState('');
  const [translatedAll, setTranslatedAll] = useState('Все');
  const [translatedTraditionalDish, setTranslatedTraditionalDish] =
    useState('Традиционное блюдо');
  const [translatedDescription, setTranslatedDescription] =
    useState('Описание');
  const [translatedIngredients, setTranslatedIngredients] =
    useState('Ингредиенты');
  const [translatedRecipe, setTranslatedRecipe] = useState('Приготовление');
  const [translatedPlayGame, setTranslatedPlayGame] = useState('Игра');
  const [translatedMore, setTranslatedMore] = useState('Подробнее');
  const [translatedGameQuestion, setTranslatedGameQuestion] =
    useState('Вопрос');
  const [translatedGameTime, setTranslatedGameTime] = useState('Время');
  const [translatedGameCorrect, setTranslatedGameCorrect] =
    useState('Правильно!');
  const [translatedGameWrong, setTranslatedGameWrong] =
    useState('Неправильно!');
  const [translatedGameNext, setTranslatedGameNext] =
    useState('Следующий вопрос');
  const [translatedGameFinalTitle, setTranslatedGameFinalTitle] =
    useState('Игра окончена!');
  const [translatedGamePlayAgain, setTranslatedGamePlayAgain] =
    useState('Сыграть ещё раз');
  const [translatedGameClose, setTranslatedGameClose] = useState('Закрыть');
  const [translatedGameQuestionText, setTranslatedGameQuestionText] = useState(
    'Какой ингредиент используется в этом блюде?',
  );
  const [translatedExcellentTitle, setTranslatedExcellentTitle] =
    useState('Отлично!');
  const [translatedExcellentMessage, setTranslatedExcellentMessage] = useState(
    'Ты настоящий знаток белорусской кухни!',
  );
  const [translatedGoodTitle, setTranslatedGoodTitle] = useState('Хорошо!');
  const [translatedGoodMessage, setTranslatedGoodMessage] = useState(
    'Неплохой результат! Так держать!',
  );
  const [translatedNormalTitle, setTranslatedNormalTitle] =
    useState('Неплохо!');
  const [translatedNormalMessage, setTranslatedNormalMessage] = useState(
    'Попробуй ещё раз, будет лучше!',
  );
  const [translatedBadTitle, setTranslatedBadTitle] = useState('Попробуй ещё!');
  const [translatedBadMessage, setTranslatedBadMessage] = useState(
    'В следующий раз обязательно получится!',
  );
  const [translatedCorrectAnswersText, setTranslatedCorrectAnswersText] =
    useState('Правильных ответов');
  const [translatedOf, setTranslatedOf] = useState('из');
  const [translatedCorrectAnswer, setTranslatedCorrectAnswer] =
    useState('Правильный ответ');

  const [translatedCategories, setTranslatedCategories] = useState<
    Record<string, string>
  >({});
  const [translatedIngredientsCache, setTranslatedIngredientsCache] = useState<
    Record<string, string>
  >({});

  // Все возможные ингредиенты
  const allIngredients = [
    'Картофель',
    'Лук',
    'Мясо',
    'Сметана',
    'Яйца',
    'Мука',
    'Свекла',
    'Капуста',
    'Морковь',
    'Чеснок',
    'Творог',
    'Сахар',
    'Мед',
    'Грибы',
    'Свинина',
    'Говядина',
    'Помидоры',
    'Огурцы',
    'Зелень',
    'Молоко',
    'Сливочное масло',
    'Растительное масло',
    'Перец',
    'Соль',
    'Лавровый лист',
    'Уксус',
    'Томатная паста',
    'Ванилин',
    'Корица',
    'Имбирь',
    'Мята',
    'Гвоздика',
    'Рыба',
    'Курица',
    'Рис',
    'Гречка',
    'Макароны',
    'Сыр',
    'Колбаса',
    'Бекон',
    'Апельсин',
    'Лимон',
    'Яблоко',
    'Груша',
    'Клубника',
    'Пшеница цельная',
    'Мак',
    'Грецкие орехи',
    'Изюм',
    'Вода',
  ];

  const translateIngredient = async (ingredient: string): Promise<string> => {
    if (translatedIngredientsCache[ingredient])
      return translatedIngredientsCache[ingredient];
    const translated = await translateText(ingredient);
    setTranslatedIngredientsCache((prev) => ({
      ...prev,
      [ingredient]: translated,
    }));
    return translated;
  };

  const parseIngredients = (text: string): string[] => {
    if (!text) return [];
    const result: string[] = [];
    const words = text.split(' ');
    let currentPhrase = '';
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (word && word[0] === word[0].toUpperCase() && currentPhrase) {
        result.push(currentPhrase);
        currentPhrase = word;
      } else if (currentPhrase) {
        currentPhrase = currentPhrase + ' ' + word;
      } else {
        currentPhrase = word;
      }
    }
    if (currentPhrase) result.push(currentPhrase);
    return [...new Set(result)];
  };

  const getFinalMessage = (correctCount: number, total: number) => {
    const percentage = (correctCount / total) * 100;
    if (percentage === 100)
      return {
        emoji: '🏆',
        title: translatedExcellentTitle,
        message: translatedExcellentMessage,
        color: 'text-yellow-500',
      };
    if (percentage >= 66)
      return {
        emoji: '😊',
        title: translatedGoodTitle,
        message: translatedGoodMessage,
        color: 'text-green-500',
      };
    if (percentage >= 33)
      return {
        emoji: '🤔',
        title: translatedNormalTitle,
        message: translatedNormalMessage,
        color: 'text-blue-500',
      };
    return {
      emoji: '😢',
      title: translatedBadTitle,
      message: translatedBadMessage,
      color: 'text-red-500',
    };
  };

  const startGame = async (food: any) => {
    const originalFood = originalFoods.find((f) => f.id === food.id);
    if (!originalFood) return;

    const ingredientsList = parseIngredients(originalFood.ingredients || '');
    if (ingredientsList.length === 0) {
      alert(`Для блюда "${originalFood.name}" не указаны ингредиенты`);
      return;
    }

    const questions = [];
    for (let i = 0; i < gameTotalQuestions; i++) {
      const randomIndex = Math.floor(Math.random() * ingredientsList.length);
      const correctIngredient = ingredientsList[randomIndex];
      const otherIngredients = allIngredients.filter(
        (ing) => ing !== correctIngredient,
      );
      const shuffled = [...otherIngredients];
      for (let j = shuffled.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
      }
      const wrongOptions = shuffled.slice(0, 3);

      const translatedCorrect = await translateIngredient(correctIngredient);
      const translatedWrong = await Promise.all(
        wrongOptions.map((opt) => translateIngredient(opt)),
      );

      let options = [translatedCorrect, ...translatedWrong];
      for (let j = options.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [options[j], options[k]] = [options[k], options[j]];
      }
      questions.push({
        correct: translatedCorrect,
        originalCorrect: correctIngredient,
        options,
      });
    }

    setGameFood(originalFood);
    setGameQuestionsList(questions);
    setGameCurrentQuestion(0);
    setGameCorrectCount(0);
    setGameShowResult(false);
    setGameMessage('');
    setGameMessageType('');
    setGameAnswered(false);
    setGameTimeLeft(15);
    setGameActive(true);
    setGameDialogOpen(true);
  };

  const handleGameAnswer = (selectedIngredient: string) => {
    if (!gameActive || gameAnswered) return;
    const currentQ = gameQuestionsList[gameCurrentQuestion];
    const isCorrect = selectedIngredient === currentQ.correct;
    setGameAnswered(true);
    if (isCorrect) {
      setGameCorrectCount((prev) => prev + 1);
      setGameMessage(translatedGameCorrect);
      setGameMessageType('success');
    } else {
      setGameMessage(
        `${translatedGameWrong} ${translatedCorrectAnswer}: ${currentQ.correct}`,
      );
      setGameMessageType('error');
    }
    setGameShowResult(true);
    setGameActive(false);
  };

  const nextQuestion = () => {
    if (gameCurrentQuestion + 1 >= gameTotalQuestions) {
      setGameActive(false);
      setGameShowResult(true);
      return;
    }
    setGameCurrentQuestion((prev) => prev + 1);
    setGameShowResult(false);
    setGameMessage('');
    setGameAnswered(false);
    setGameTimeLeft(15);
    setGameActive(true);
  };

  const resetGame = () => {
    if (originalFoods.length > 0 && gameFood) {
      startGame(gameFood);
    }
  };

  const closeGame = () => {
    setGameDialogOpen(false);
    setGameActive(false);
    setGameAnswered(false);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameActive && gameTimeLeft > 0 && !gameAnswered) {
      timer = setTimeout(() => setGameTimeLeft((prev) => prev - 1), 1000);
    } else if (gameActive && gameTimeLeft === 0 && !gameAnswered) {
      handleGameAnswer('');
    }
    return () => clearTimeout(timer);
  }, [gameActive, gameTimeLeft, gameAnswered, gameCurrentQuestion]);

  const defaultFoods = [
    {
      id: 1,
      name: 'Драники',
      description: 'Картофельные оладьи',
      ingredients: 'Картофель Лук Яйца Сметана',
      recipe: 'Натереть, смешать, жарить',
      category: 'основные блюда',
      image_url:
        'https://images.unsplash.com/photo-1623238911076-e00fef5a3217?w=800',
    },
    {
      id: 2,
      name: 'Борщ',
      description: 'Суп со свеклой',
      ingredients: 'Свекла Капуста Картофель Морковь Лук',
      recipe: 'Варить',
      category: 'супы',
      image_url:
        'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
    },
  ];

  // Загрузка данных
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        const response = await foodsAPI.getAll();
        if (response.data && response.data.length > 0) {
          setOriginalFoods(response.data);
        } else {
          setOriginalFoods(defaultFoods);
        }
      } catch (error) {
        console.error('Ошибка загрузки:', error);
        setOriginalFoods(defaultFoods);
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, []);

  // Перевод блюд
  useEffect(() => {
    const translateAllFoods = async () => {
      if (originalFoods.length > 0) {
        const translated = await translateArray(originalFoods, [
          'name',
          'description',
          'ingredients',
          'recipe',
          'category',
        ]);
        setTranslatedFoods(translated);
      }
    };
    translateAllFoods();
  }, [originalFoods, i18n.language]);

  // Перевод категорий
  useEffect(() => {
    const translateCategories = async () => {
      const uniqueCategories = [
        ...new Set(originalFoods.map((f) => f.category)),
      ];
      const translations: Record<string, string> = {};
      for (const cat of uniqueCategories) {
        translations[cat] = await translateText(cat);
      }
      setTranslatedCategories(translations);
    };
    if (originalFoods.length) translateCategories();
  }, [originalFoods, i18n.language, translateText]);

  // Перевод статических текстов
  useEffect(() => {
    const translateStaticTexts = async () => {
      const translations = await Promise.all([
        translateText('Кулинарное наследие'),
        translateText('Национальная'),
        translateText('кухня Беларуси'),
        translateText(
          'Белорусская кухня — это сытная, вкусная и разнообразная кухня. Откройте для себя традиционные блюда и проверьте свои знания в игре!',
        ),
        translateText('Все'),
        translateText('Традиционное блюдо'),
        translateText('Описание'),
        translateText('Ингредиенты'),
        translateText('Приготовление'),
        translateText('Игра'),
        translateText('Подробнее'),
        translateText('Вопрос'),
        translateText('Время'),
        translateText('Правильно!'),
        translateText('Неправильно!'),
        translateText('Следующий вопрос'),
        translateText('Игра окончена!'),
        translateText('Сыграть ещё раз'),
        translateText('Закрыть'),
        translateText('Какой ингредиент используется в этом блюде?'),
        translateText('Отлично!'),
        translateText('Ты настоящий знаток белорусской кухни!'),
        translateText('Хорошо!'),
        translateText('Неплохой результат! Так держать!'),
        translateText('Неплохо!'),
        translateText('Попробуй ещё раз, будет лучше!'),
        translateText('Попробуй ещё!'),
        translateText('В следующий раз обязательно получится!'),
        translateText('Правильных ответов'),
        translateText('из'),
        translateText('Правильный ответ'),
      ]);
      let i = 0;
      setTranslatedHeroBadge(translations[i++]);
      setTranslatedHeroTitle(translations[i++]);
      setTranslatedHeroTitleHigh(translations[i++]);
      setTranslatedHeroSubtitle(translations[i++]);
      setTranslatedAll(translations[i++]);
      setTranslatedTraditionalDish(translations[i++]);
      setTranslatedDescription(translations[i++]);
      setTranslatedIngredients(translations[i++]);
      setTranslatedRecipe(translations[i++]);
      setTranslatedPlayGame(translations[i++]);
      setTranslatedMore(translations[i++]);
      setTranslatedGameQuestion(translations[i++]);
      setTranslatedGameTime(translations[i++]);
      setTranslatedGameCorrect(translations[i++]);
      setTranslatedGameWrong(translations[i++]);
      setTranslatedGameNext(translations[i++]);
      setTranslatedGameFinalTitle(translations[i++]);
      setTranslatedGamePlayAgain(translations[i++]);
      setTranslatedGameClose(translations[i++]);
      setTranslatedGameQuestionText(translations[i++]);
      setTranslatedExcellentTitle(translations[i++]);
      setTranslatedExcellentMessage(translations[i++]);
      setTranslatedGoodTitle(translations[i++]);
      setTranslatedGoodMessage(translations[i++]);
      setTranslatedNormalTitle(translations[i++]);
      setTranslatedNormalMessage(translations[i++]);
      setTranslatedBadTitle(translations[i++]);
      setTranslatedBadMessage(translations[i++]);
      setTranslatedCorrectAnswersText(translations[i++]);
      setTranslatedOf(translations[i++]);
      setTranslatedCorrectAnswer(translations[i++]);
    };
    translateStaticTexts();
  }, [i18n.language, translateText]);

  // Восстановление выбранной категории ПРИ СМЕНЕ ЯЗЫКА
  useEffect(() => {
    if (selectedTab) {
      selectedTabRef.current = selectedTab;
    }
  }, [selectedTab]);

  // КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: при смене языка обновляем selectedTab на translatedAll
  useEffect(() => {
    if (translatedAll) {
      setSelectedTab(translatedAll);
    }
  }, [translatedAll]);

  const handleCardClick = (food: any) => {
    setSelectedFood(food);
    setDialogOpen(true);
  };

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat === 'супы' || cat === 'soups') return Soup;
    if (cat === 'выпечка' || cat === 'baking') return Cake;
    if (cat === 'напитки' || cat === 'drinks') return Coffee;
    if (cat === 'основные блюда' || cat === 'main dishes') return ChefHat;
    return Utensils;
  };

  const getDisplayCategories = () => {
    const unique = [...new Set(originalFoods.map((f) => f.category))];
    return [
      translatedAll,
      ...unique.map((cat) => translatedCategories[cat] || cat),
    ];
  };

  const isCategoryMatch = (foodCategory: string, selectedCategory: string) => {
    if (selectedCategory === translatedAll) return true;
    const translatedCat = translatedCategories[foodCategory] || foodCategory;
    return translatedCat === selectedCategory;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  const displayFoods =
    translatedFoods.length > 0 ? translatedFoods : originalFoods;
  const displayCategories = getDisplayCategories();
  const currentQuestion = gameQuestionsList[gameCurrentQuestion];
  const finalMessage = getFinalMessage(gameCorrectCount, gameTotalQuestions);

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.4,
        type: 'spring',
        stiffness: 100,
      },
    }),
    hover: { y: -5, transition: { duration: 0.2 } },
    tap: { scale: 0.98 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section - адаптивная */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6">
            <ChefHat className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
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

      {/* Основной контент - адаптивный */}
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12">
        {/* Фильтры - как в Traditions: на ПК как было, на мобильных горизонтальная прокрутка */}
        <div className="overflow-x-auto lg:overflow-x-visible pb-2 -mx-3 lg:mx-0 px-3 lg:px-0">
          <div className="flex flex-nowrap lg:flex-wrap gap-2 lg:gap-3 min-w-max lg:min-w-0">
            {displayCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedTab(cat)}
                className={`whitespace-nowrap rounded-full px-4 lg:px-6 py-2 lg:py-2.5 text-sm lg:text-base font-medium transition-all duration-300 ${
                  selectedTab === cat
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Карточки блюд - адаптивные */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {displayFoods
            .filter((f) => isCategoryMatch(f.category, selectedTab))
            .map((food, idx) => {
              const Icon = getCategoryIcon(food.category);
              const displayCategory =
                translatedCategories[food.category] || food.category;
              return (
                <motion.div
                  key={food.id}
                  custom={idx}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  whileTap="tap"
                  className="h-full"
                >
                  <Card className="cursor-pointer hover:shadow-2xl transition-all duration-500 overflow-hidden group border-0 shadow-lg rounded-xl bg-white flex flex-col h-full">
                    {food.image_url && (
                      <div className="relative h-40 sm:h-48 md:h-52 overflow-hidden flex-shrink-0">
                        <img
                          src={food.image_url}
                          alt={food.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1623238911076-e00fef5a3217?w=800';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                          <h3 className="text-white text-xs sm:text-sm md:text-base font-bold leading-tight line-clamp-2">
                            {food.name}
                          </h3>
                        </div>
                      </div>
                    )}
                    <CardContent className="p-3 sm:p-4 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-md">
                            <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                          </div>
                          <span className="text-[10px] sm:text-xs text-blue-600 font-medium">
                            {displayCategory}
                          </span>
                        </div>
                        <VoiceReader
                          text={`${food.name}. ${food.description}`}
                        />
                      </div>
                      <p className="text-gray-500 text-[11px] sm:text-sm line-clamp-2 leading-relaxed flex-1">
                        {food.description}
                      </p>
                      <div className="mt-3 flex items-center text-[10px] sm:text-xs text-gray-400">
                        <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400 mr-1" />
                        <span>{translatedTraditionalDish}</span>
                      </div>
                      <div className="flex gap-2 mt-3 sm:mt-4">
                        <Button
                          className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full transition-all duration-300 text-[11px] sm:text-sm py-1.5 sm:py-2"
                          onClick={() => {
                            setSelectedFood(food);
                            setDialogOpen(true);
                          }}
                        >
                          {translatedMore}
                          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                        </Button>
                        <Button
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full transition-all duration-300 px-2 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm"
                          onClick={() => startGame(food)}
                        >
                          <Gamepad2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          {translatedPlayGame}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
        </div>
      </div>

      {/* Detail Dialog - адаптивный */}
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
          {selectedFood && (
            <>
              {selectedFood.image_url && (
                <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden rounded-t-xl sm:rounded-t-2xl">
                  <img
                    src={selectedFood.image_url}
                    alt={selectedFood.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-[10px] sm:text-sm font-medium shadow-lg">
                      {translatedCategories[selectedFood.category] ||
                        selectedFood.category}
                    </span>
                  </div>
                </div>
              )}
              <div className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
                  {selectedFood.name}
                </h2>
                <div className="mb-3 sm:mb-4">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <h4 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                      <Info className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                      {translatedDescription}
                    </h4>
                    <VoiceReader text={selectedFood.description || ''} />
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base">
                    {selectedFood.description}
                  </p>
                </div>
                {selectedFood.ingredients && (
                  <div className="mb-3 sm:mb-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-2 text-sm sm:text-base">
                      <Utensils className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                      {translatedIngredients}
                    </h4>
                    <p className="text-gray-700 text-sm sm:text-base whitespace-pre-wrap">
                      {selectedFood.ingredients}
                    </p>
                  </div>
                )}
                {selectedFood.recipe && (
                  <div className="mb-3 sm:mb-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-2 text-sm sm:text-base">
                      <ChefHat className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                      {translatedRecipe}
                    </h4>
                    <p className="text-gray-700 text-sm sm:text-base whitespace-pre-wrap">
                      {selectedFood.recipe}
                    </p>
                  </div>
                )}
                <Button
                  onClick={() => startGame(selectedFood)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full mt-3 sm:mt-4 text-sm sm:text-base py-2"
                >
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  {translatedPlayGame}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Game Dialog - адаптивный, с отступом для крестика */}
      <Dialog open={gameDialogOpen} onOpenChange={closeGame}>
        <DialogContent className="max-w-[90vw] sm:max-w-md rounded-xl sm:rounded-2xl p-0 overflow-hidden mx-3">
          {gameFood && !gameShowResult && currentQuestion && (
            <div className="p-4 sm:p-6 pt-12 sm:pt-6">
              <div className="text-center mb-3 sm:mb-4">
                <div className="flex justify-between items-center mb-2 sm:mb-3">
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Gamepad2 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                    <span className="font-semibold">
                      {translatedGameQuestion}: {gameCurrentQuestion + 1}/
                      {gameTotalQuestions}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Timer className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                    <span className="font-semibold">
                      {translatedGameTime}: {gameTimeLeft}
                    </span>
                  </div>
                </div>
                <img
                  src={gameFood.image_url}
                  alt={gameFood.name}
                  className="h-24 sm:h-32 w-full object-cover rounded-lg mb-3 sm:mb-4"
                />
                <p className="text-gray-600 text-sm sm:text-base">
                  {translatedGameQuestionText}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {currentQuestion.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleGameAnswer(opt)}
                    disabled={!gameActive}
                    className={`p-2 sm:p-3 rounded-lg border-2 text-center transition-all duration-200 text-xs sm:text-sm ${
                      !gameActive
                        ? 'cursor-not-allowed opacity-50'
                        : 'hover:border-blue-500 hover:bg-blue-50'
                    } border-gray-200`}
                  >
                    <span className="text-gray-700 font-medium">{opt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {gameShowResult && (
            <div className="p-4 sm:p-6 pt-12 sm:pt-6 text-center">
              <div
                className={`p-3 sm:p-4 rounded-lg mb-3 sm:mb-4 ${
                  gameMessageType === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                {gameMessageType === 'success' ? (
                  <Check className="w-8 h-8 sm:w-10 sm:h-10 text-green-500 mx-auto mb-2" />
                ) : (
                  <X className="w-8 h-8 sm:w-10 sm:h-10 text-red-500 mx-auto mb-2" />
                )}
                <p
                  className={`text-sm sm:text-base font-semibold ${
                    gameMessageType === 'success'
                      ? 'text-green-700'
                      : 'text-red-700'
                  }`}
                >
                  {gameMessage}
                </p>
              </div>
              {gameCurrentQuestion + 1 < gameTotalQuestions ? (
                <Button
                  onClick={nextQuestion}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-sm sm:text-base py-2"
                >
                  <ArrowRight className="w-4 h-4 mr-2" /> {translatedGameNext}
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 sm:p-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl">
                    <div
                      className={`text-5xl sm:text-6xl mb-3 ${finalMessage.color}`}
                    >
                      {finalMessage.emoji}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                      {finalMessage.title}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base mt-2">
                      {finalMessage.message}
                    </p>
                    <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-yellow-200">
                      <p className="text-xs sm:text-sm text-gray-500">
                        {translatedCorrectAnswersText}: {gameCorrectCount}{' '}
                        {translatedOf} {gameTotalQuestions}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <Button
                      onClick={resetGame}
                      variant="outline"
                      className="w-full rounded-full text-sm sm:text-base py-2 order-2 sm:order-1"
                    >
                      <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />{' '}
                      {translatedGamePlayAgain}
                    </Button>
                    <Button
                      onClick={closeGame}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-sm sm:text-base py-2 order-1 sm:order-2"
                    >
                      {translatedGameClose}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FoodPage;
