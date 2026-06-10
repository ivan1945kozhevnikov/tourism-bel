import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { bookingsAPI } from '@/services/api';
import type { Booking } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User,
  Mail,
  Calendar,
  X,
  Loader2,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useAutoTranslate } from '@/hooks/useAutoTranslate';

const Profile: React.FC = () => {
  const { i18n } = useTranslation();
  const { translateText } = useAutoTranslate();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Состояния для переведенных текстов
  const [translatedProfileBadge, setTranslatedProfileBadge] =
    useState('Личный кабинет');
  const [translatedMyProfile, setTranslatedMyProfile] = useState('Мой профиль');
  const [translatedManageAccount, setTranslatedManageAccount] = useState(
    'Управление аккаунтом и бронированиями',
  );
  const [translatedLogout, setTranslatedLogout] = useState('Выйти');
  const [translatedUserInfo, setTranslatedUserInfo] = useState(
    'Информация о пользователе',
  );
  const [translatedNameLabel, setTranslatedNameLabel] =
    useState('Имя и фамилия');
  const [translatedEmailLabel, setTranslatedEmailLabel] = useState('Email');
  const [translatedRoleLabel, setTranslatedRoleLabel] = useState('Роль');
  const [translatedAdmin, setTranslatedAdmin] = useState('Администратор');
  const [translatedUser, setTranslatedUser] = useState('Пользователь');
  const [translatedMyBookings, setTranslatedMyBookings] =
    useState('Мои бронирования');
  const [translatedAllTours, setTranslatedAllTours] = useState(
    'Все ваши туры и экскурсии',
  );
  const [translatedNoBookings, setTranslatedNoBookings] = useState(
    'У вас пока нет бронирований',
  );
  const [translatedSelectTour, setTranslatedSelectTour] =
    useState('Выбрать тур');
  const [translatedParticipants, setTranslatedParticipants] =
    useState('Участники');
  const [translatedAmount, setTranslatedAmount] = useState('Сумма');
  const [translatedCancel, setTranslatedCancel] = useState('Отменить');
  const [translatedCancelConfirm, setTranslatedCancelConfirm] = useState(
    'Вы уверены, что хотите отменить бронирование?',
  );
  const [translatedConfirmed, setTranslatedConfirmed] =
    useState('Подтверждено');
  const [translatedPending, setTranslatedPending] = useState(
    'Ожидает подтверждения',
  );
  const [translatedCancelled, setTranslatedCancelled] = useState('Отменено');

  // Перевод статических текстов
  useEffect(() => {
    const translateStaticTexts = async () => {
      const translations = await Promise.all([
        translateText('Личный кабинет'),
        translateText('Мой профиль'),
        translateText('Управление аккаунтом и бронированиями'),
        translateText('Выйти'),
        translateText('Информация о пользователе'),
        translateText('Имя и фамилия'),
        translateText('Email'),
        translateText('Роль'),
        translateText('Администратор'),
        translateText('Пользователь'),
        translateText('Мои бронирования'),
        translateText('Все ваши туры и экскурсии'),
        translateText('У вас пока нет бронирований'),
        translateText('Выбрать тур'),
        translateText('Участники'),
        translateText('Сумма'),
        translateText('Отменить'),
        translateText('Вы уверены, что хотите отменить бронирование?'),
        translateText('Подтверждено'),
        translateText('Ожидает подтверждения'),
        translateText('Отменено'),
      ]);

      let idx = 0;
      setTranslatedProfileBadge(translations[idx++]);
      setTranslatedMyProfile(translations[idx++]);
      setTranslatedManageAccount(translations[idx++]);
      setTranslatedLogout(translations[idx++]);
      setTranslatedUserInfo(translations[idx++]);
      setTranslatedNameLabel(translations[idx++]);
      setTranslatedEmailLabel(translations[idx++]);
      setTranslatedRoleLabel(translations[idx++]);
      setTranslatedAdmin(translations[idx++]);
      setTranslatedUser(translations[idx++]);
      setTranslatedMyBookings(translations[idx++]);
      setTranslatedAllTours(translations[idx++]);
      setTranslatedNoBookings(translations[idx++]);
      setTranslatedSelectTour(translations[idx++]);
      setTranslatedParticipants(translations[idx++]);
      setTranslatedAmount(translations[idx++]);
      setTranslatedCancel(translations[idx++]);
      setTranslatedCancelConfirm(translations[idx++]);
      setTranslatedConfirmed(translations[idx++]);
      setTranslatedPending(translations[idx++]);
      setTranslatedCancelled(translations[idx++]);
    };

    translateStaticTexts();
  }, [i18n.language, translateText]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    try {
      const response = await bookingsAPI.getMyBookings();
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm(translatedCancelConfirm)) return;

    try {
      await bookingsAPI.cancel(bookingId);
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return translatedConfirmed;
      case 'pending':
        return translatedPending;
      case 'cancelled':
        return translatedCancelled;
      default:
        return status;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-16">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Mir_Castle_2018.jpg/1920px-Mir_Castle_2018.jpg')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/50" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-white/90 text-sm">
                  {translatedProfileBadge}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {translatedMyProfile}
              </h1>
              <p className="text-white/70 mt-2">{translatedManageAccount}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-white text-blue-600 hover:bg-gray-100 hover:text-blue-700 px-8 py-6 text-lg font-semibold rounded-full shadow-md border-0"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {translatedLogout}
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {translatedUserInfo}
                </h3>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-4xl font-bold text-white">
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <label className="text-sm text-gray-500">
                      {translatedNameLabel}
                    </label>
                    <p className="font-medium text-gray-800 text-lg">
                      {user?.firstName} {user?.lastName}
                    </p>
                  </div>

                  <div className="border-b pb-3">
                    <label className="text-sm text-gray-500 flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {translatedEmailLabel}
                    </label>
                    <p className="font-medium text-gray-800">{user?.email}</p>
                  </div>

                  <div className="pb-2">
                    <label className="text-sm text-gray-500">
                      {translatedRoleLabel}
                    </label>
                    <div className="mt-1">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          user?.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {user?.role === 'admin'
                          ? translatedAdmin
                          : translatedUser}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bookings */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {translatedMyBookings}
                </h3>
                <p className="text-blue-100 text-sm">{translatedAllTours}</p>
              </div>
              <CardContent className="p-6">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-10 h-10 text-blue-400" />
                    </div>
                    <p className="text-gray-500">{translatedNoBookings}</p>
                    <Button
                      className="mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-full"
                      onClick={() => navigate('/tours')}
                    >
                      {translatedSelectTour}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="border rounded-xl p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            {booking.tour_image && (
                              <img
                                src={booking.tour_image}
                                alt={booking.tour_title}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            )}
                            <div>
                              <h3 className="font-semibold text-gray-800 text-lg">
                                {booking.tour_title}
                              </h3>
                              <div className="text-sm text-gray-500 space-y-1 mt-1">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-blue-500" />
                                  <span>
                                    {format(
                                      new Date(booking.booking_date),
                                      'dd.MM.yyyy',
                                    )}
                                  </span>
                                </div>
                                <div>
                                  👥 {translatedParticipants}:{' '}
                                  {booking.participants}
                                </div>
                                <div>
                                  💰 {translatedAmount}:{' '}
                                  <span className="font-semibold text-blue-600">
                                    {booking.total_price} BYN
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}
                            >
                              {getStatusText(booking.status)}
                            </span>

                            {booking.status !== 'cancelled' && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCancelBooking(booking.id)}
                                className="rounded-full"
                              >
                                <X className="w-4 h-4 mr-1" />
                                {translatedCancel}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
