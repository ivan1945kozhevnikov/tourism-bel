import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Star,
  Send,
  Check,
  User,
  Mail,
  MessageSquare,
  Sparkles,
  LogIn,
} from 'lucide-react';
import { reviewsAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useAutoTranslate } from '@/hooks/useAutoTranslate';

const Reviews: React.FC = () => {
  const { i18n } = useTranslation();
  const { translateText, translateArray } = useAutoTranslate();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    user_name: '',
    user_email: '',
    rating: 5,
    text: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [translatedReviews, setTranslatedReviews] = useState<any[]>([]);
  const [error, setError] = useState('');

  // Переведенные тексты
  const [translatedTitle, setTranslatedTitle] = useState(
    'Отзывы и предложения',
  );
  const [translatedSubtitle, setTranslatedSubtitle] = useState(
    'Поделитесь впечатлениями о путешествии по Беларуси',
  );
  const [translatedYourName, setTranslatedYourName] = useState('Ваше имя');
  const [translatedYourEmail, setTranslatedYourEmail] = useState('Ваш Email');
  const [translatedYourReview, setTranslatedYourReview] = useState(
    'Ваш отзыв или предложение',
  );
  const [translatedRating, setTranslatedRating] = useState('Оценка');
  const [translatedSend, setTranslatedSend] = useState('Отправить');
  const [translatedSending, setTranslatedSending] = useState('Отправка...');
  const [translatedSuccessTitle, setTranslatedSuccessTitle] = useState(
    'Спасибо за ваш отзыв!',
  );
  const [translatedSuccessDesc, setTranslatedSuccessDesc] = useState(
    'Ваш отзыв отправлен на модерацию и скоро появится на сайте.',
  );
  const [translatedAllReviews, setTranslatedAllReviews] =
    useState('Все отзывы');
  const [translatedNoReviews, setTranslatedNoReviews] = useState(
    'Пока нет отзывов. Будьте первым!',
  );
  const [translatedEmailOptional, setTranslatedEmailOptional] = useState(
    'Необязательно, но для связи',
  );
  const [translatedExcellent, setTranslatedExcellent] = useState('Отлично');
  const [translatedGood, setTranslatedGood] = useState('Хорошо');
  const [translatedNormal, setTranslatedNormal] = useState('Нормально');
  const [translatedBad, setTranslatedBad] = useState('Плохо');
  const [translatedTerrible, setTranslatedTerrible] = useState('Ужасно');
  const [translatedLoginToReview, setTranslatedLoginToReview] = useState(
    'Войдите, чтобы оставить отзыв',
  );
  const [translatedLoginBtn, setTranslatedLoginBtn] = useState('Войти');
  const [translatedWriteReview, setTranslatedWriteReview] = useState(
    'Расскажите о своих впечатлениях...',
  );

  // Заполнение формы данными авторизованного пользователя
  useEffect(() => {
    if (isAuthenticated && user) {
      setForm((prev) => ({
        ...prev,
        user_name:
          `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
          user.email?.split('@')[0] ||
          '',
        user_email: user.email || '',
      }));
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    const translateTexts = async () => {
      setTranslatedTitle(await translateText('Отзывы и предложения'));
      setTranslatedSubtitle(
        await translateText(
          'Поделитесь впечатлениями о путешествии по Беларуси',
        ),
      );
      setTranslatedYourName(await translateText('Ваше имя'));
      setTranslatedYourEmail(await translateText('Ваш Email'));
      setTranslatedYourReview(await translateText('Ваш отзыв или предложение'));
      setTranslatedRating(await translateText('Оценка'));
      setTranslatedSend(await translateText('Отправить'));
      setTranslatedSending(await translateText('Отправка...'));
      setTranslatedSuccessTitle(await translateText('Спасибо за ваш отзыв!'));
      setTranslatedSuccessDesc(
        await translateText(
          'Ваш отзыв отправлен на модерацию и скоро появится на сайте.',
        ),
      );
      setTranslatedAllReviews(await translateText('Все отзывы'));
      setTranslatedNoReviews(
        await translateText('Пока нет отзывов. Будьте первым!'),
      );
      setTranslatedEmailOptional(
        await translateText('Необязательно, но для связи'),
      );
      setTranslatedExcellent(await translateText('Отлично'));
      setTranslatedGood(await translateText('Хорошо'));
      setTranslatedNormal(await translateText('Нормально'));
      setTranslatedBad(await translateText('Плохо'));
      setTranslatedTerrible(await translateText('Ужасно'));
      setTranslatedLoginToReview(
        await translateText('Войдите, чтобы оставить отзыв'),
      );
      setTranslatedLoginBtn(await translateText('Войти'));
      setTranslatedWriteReview(
        await translateText('Расскажите о своих впечатлениях...'),
      );
    };
    translateTexts();
  }, [i18n.language]);

  // Перевод отзывов при смене языка
  useEffect(() => {
    const translateReviews = async () => {
      if (reviews.length === 0) return;
      const translated = await translateArray(reviews, ['user_name', 'text']);
      setTranslatedReviews(translated);
    };
    translateReviews();
  }, [reviews, i18n.language, translateArray]);

  const fetchReviews = async () => {
    try {
      const res = await reviewsAPI.getAll();
      // Показываем только одобренные отзывы (is_approved = 1 или true)
      const approved = Array.isArray(res.data)
        ? res.data.filter(
            (r: any) => r.is_approved === 1 || r.is_approved === true,
          )
        : [];
      setReviews(approved);
      setTranslatedReviews(approved);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/reviews' } });
      return;
    }

    if (!form.user_name.trim() || !form.text.trim()) {
      setError('Заполните имя и отзыв');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await reviewsAPI.create({
        user_name: form.user_name,
        user_email: form.user_email || undefined,
        rating: Number(form.rating),
        text: form.text,
      });
      setSuccess(true);
      setForm({
        ...form,
        text: '',
        rating: 5,
      });
      fetchReviews();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Ошибка:', err.response?.data);
      setError(err.response?.data?.message || 'Ошибка отправки');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login', { state: { from: '/reviews' } });
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 5:
        return translatedExcellent;
      case 4:
        return translatedGood;
      case 3:
        return translatedNormal;
      case 2:
        return translatedBad;
      case 1:
        return translatedTerrible;
      default:
        return '';
    }
  };

  const renderStars = (
    rating: number,
    interactive = false,
    onChange?: (r: number) => void,
  ) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onChange?.(star)}
          className={
            interactive
              ? 'cursor-pointer hover:scale-110 transition-transform'
              : ''
          }
        >
          <Star
            className={`w-6 h-6 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        </button>
      ))}
    </div>
  );

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const displayReviews =
    translatedReviews.length > 0 ? translatedReviews : reviews;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1920')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/50" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-white/90 text-sm">{translatedTitle}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            {translatedTitle}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            {translatedSubtitle}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Форма отправки отзыва */}
          <div className="flex">
            <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  {translatedTitle}
                </h3>
                <p className="text-blue-100 text-sm mt-1">
                  Поделитесь впечатлениями
                </p>
              </div>
              <div className="p-6 flex-1">
                {!isAuthenticated ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <LogIn className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {translatedLoginToReview}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Только авторизованные пользователи могут оставлять отзывы
                    </p>
                    <Button
                      onClick={handleLoginRedirect}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-full px-8"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      {translatedLoginBtn}
                    </Button>
                  </div>
                ) : success ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {translatedSuccessTitle}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {translatedSuccessDesc}
                    </p>
                    <Button
                      onClick={() => setSuccess(false)}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                    >
                      Написать еще
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                      <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
                        {error}
                      </div>
                    )}
                    <div>
                      <Label className="text-base font-semibold">
                        {translatedYourName}{' '}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={form.user_name}
                        onChange={(e) =>
                          setForm({ ...form, user_name: e.target.value })
                        }
                        placeholder="Иван Иванов"
                        className="rounded-xl mt-1.5"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-base font-semibold">
                        {translatedYourEmail}
                      </Label>
                      <div className="relative mt-1.5">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="email"
                          value={form.user_email}
                          onChange={(e) =>
                            setForm({ ...form, user_email: e.target.value })
                          }
                          placeholder="your@email.com"
                          className="rounded-xl pl-10"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {translatedEmailOptional}
                      </p>
                    </div>
                    <div>
                      <Label className="text-base font-semibold">
                        {translatedRating}
                      </Label>
                      <div className="mt-2">
                        {renderStars(form.rating, true, (r) =>
                          setForm({ ...form, rating: r }),
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {getRatingText(form.rating)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-base font-semibold">
                        {translatedYourReview}{' '}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        value={form.text}
                        onChange={(e) =>
                          setForm({ ...form, text: e.target.value })
                        }
                        placeholder={translatedWriteReview}
                        rows={5}
                        className="rounded-xl mt-1.5"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl py-6 text-lg font-semibold"
                    >
                      {submitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          {translatedSending}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Send className="w-5 h-5" /> {translatedSend}
                        </div>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Список одобренных отзывов */}
          <div className="flex">
            <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Star className="w-5 h-5" /> {translatedAllReviews}
                  </h3>
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-white font-bold">
                        {getAverageRating()}
                      </span>
                      <span className="text-white/70 text-sm">
                        ({reviews.length})
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6 flex-1 max-h-[600px] overflow-y-auto">
                {displayReviews.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-10 h-10 text-blue-400" />
                    </div>
                    <p className="text-gray-500">{translatedNoReviews}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayReviews.map((review) => (
                      <div
                        key={review.id}
                        className="border rounded-xl p-4 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">
                                {review.user_name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {review.created_at
                                  ? new Date(
                                      review.created_at,
                                    ).toLocaleDateString()
                                  : ''}
                              </p>
                            </div>
                          </div>
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-gray-600 leading-relaxed mt-2">
                          "{review.text}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
