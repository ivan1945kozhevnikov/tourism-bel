import React, { useState, useEffect, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toursAPI, bookingsAPI } from '@/services/api';
import type { Tour, Booking } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Clock,
  Users,
  Star,
  Check,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  List,
  Compass,
  MapPinned,
  Sparkles,
  ArrowRight,
  Navigation,
  Building,
  LogIn,
} from 'lucide-react';
import { format } from 'date-fns';
import VoiceReader from '@/components/VoiceReader';
import { useTranslation } from 'react-i18next';
import { useAutoTranslate } from '@/hooks/useAutoTranslate';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = new Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const userLocationIcon = new Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const MapCenter: React.FC<{ center: [number, number]; zoom?: number }> = ({
  center,
  zoom = 13,
}) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const Tours: React.FC = () => {
  const { i18n } = useTranslation();
  const { translateText, translateArray, translateObject } = useAutoTranslate();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [tours, setTours] = useState<Tour[]>([]);
  const [translatedTours, setTranslatedTours] = useState<Tour[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState<Date | undefined>();
  const [participants, setParticipants] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  // Состояния для места отправления
  const [departureLocation, setDepartureLocation] = useState<string>('minsk');
  const [customDeparture, setCustomDeparture] = useState('');
  const [useMyLocation, setUseMyLocation] = useState(true);

  // Состояния для карты маршрута
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    53.9045, 27.5615,
  ]);

  // Состояние для переведенных названий точек маршрута
  const [translatedRoutePointsNames, setTranslatedRoutePointsNames] = useState<
    any[]
  >([]);

  // Состояния для переведенных статических текстов
  const [translatedPerson, setTranslatedPerson] = useState('чел');
  const [translatedHeroBadge, setTranslatedHeroBadge] = useState(
    'Путешествуйте с нами',
  );
  const [translatedHeroTitle, setTranslatedHeroTitle] = useState('Туры и');
  const [translatedHeroTitleHigh, setTranslatedHeroTitleHigh] =
    useState('экскурсии');
  const [translatedHeroSubtitle, setTranslatedHeroSubtitle] = useState(
    'Откройте для себя красоту Беларуси с профессиональными гидами',
  );
  const [translatedShowBookings, setTranslatedShowBookings] =
    useState('Мои бронирования');
  const [translatedShowTours, setTranslatedShowTours] =
    useState('Показать туры');
  const [translatedMyBookings, setTranslatedMyBookings] =
    useState('Мои бронирования');
  const [translatedNoBookings, setTranslatedNoBookings] = useState(
    'У вас пока нет бронирований',
  );
  const [translatedDate, setTranslatedDate] = useState('Дата');
  const [translatedParticipants, setTranslatedParticipants] =
    useState('Участники');
  const [translatedTotal, setTranslatedTotal] = useState('Сумма');
  const [translatedStatus, setTranslatedStatus] = useState('Статус');
  const [translatedCancel, setTranslatedCancel] = useState('Отменить');
  const [translatedConfirmed, setTranslatedConfirmed] =
    useState('Подтверждено');
  const [translatedPending, setTranslatedPending] = useState(
    'Ожидает подтверждения',
  );
  const [translatedCancelled, setTranslatedCancelled] = useState('Отменено');
  const [translatedBook, setTranslatedBook] = useState('Забронировать');
  const [translatedBookingTitle, setTranslatedBookingTitle] =
    useState('Бронирование тура');
  const [translatedBookingSuccess, setTranslatedBookingSuccess] = useState(
    'Бронирование успешно!',
  );
  const [translatedBookingSuccessDesc, setTranslatedBookingSuccessDesc] =
    useState('Мы свяжемся с вами для подтверждения');
  const [translatedClose, setTranslatedClose] = useState('Закрыть');
  const [translatedConfirmBooking, setTranslatedConfirmBooking] = useState(
    'Подтвердить бронирование',
  );
  const [translatedTotalLabel, setTranslatedTotalLabel] = useState('Итого');
  const [translatedIncluded, setTranslatedIncluded] = useState('Включено');
  const [translatedNotIncluded, setTranslatedNotIncluded] =
    useState('Не включено');
  const [translatedProgram, setTranslatedProgram] = useState('Программа тура');
  const [translatedBuildingRoute, setTranslatedBuildingRoute] = useState(
    'Построение маршрута...',
  );
  const [translatedRouteError, setTranslatedRouteError] = useState(
    'Не удалось построить маршрут',
  );
  const [translatedLocationError, setTranslatedLocationError] = useState(
    'Не удалось определить ваше местоположение',
  );
  const [translatedNoRoutePoints, setTranslatedNoRoutePoints] = useState(
    'Для этого тура не заданы точки маршрута',
  );
  const [translatedSummary, setTranslatedSummary] = useState(
    'Сводка бронирования',
  );
  const [translatedTour, setTranslatedTour] = useState('Тур');
  const [translatedMaxParticipants, setTranslatedMaxParticipants] =
    useState('Макс. участников');
  const [translatedDeparture, setTranslatedDeparture] =
    useState('Место отправления');
  const [translatedMyLocation, setTranslatedMyLocation] =
    useState('Моё местоположение');
  const [translatedMinsk, setTranslatedMinsk] = useState('Минск');
  const [translatedBrest, setTranslatedBrest] = useState('Брест');
  const [translatedGrodno, setTranslatedGrodno] = useState('Гродно');
  const [translatedVitebsk, setTranslatedVitebsk] = useState('Витебск');
  const [translatedMogilev, setTranslatedMogilev] = useState('Могилёв');
  const [translatedGomel, setTranslatedGomel] = useState('Гомель');
  const [translatedCustomCity, setTranslatedCustomCity] =
    useState('Другой город');
  const [translatedEnterCity, setTranslatedEnterCity] = useState(
    'Введите название города',
  );
  const [translatedRouteMap, setTranslatedRouteMap] =
    useState('Маршрут поездки');
  const [translatedFrom, setTranslatedFrom] = useState('Отправление');
  const [translatedCalculateRoute, setTranslatedCalculateRoute] =
    useState('Рассчитать маршрут');
  const [translatedRoutePoints, setTranslatedRoutePoints] =
    useState('Точки маршрута');
  const [translatedTotalDistance, setTranslatedTotalDistance] =
    useState('Общее расстояние');
  const [translatedKm, setTranslatedKm] = useState('км');
  const [translatedLoginRequired, setTranslatedLoginRequired] = useState(
    'Требуется авторизация',
  );
  const [translatedLoginRequiredDesc, setTranslatedLoginRequiredDesc] =
    useState('Чтобы забронировать тур, пожалуйста, войдите в систему');
  const [translatedGoToLogin, setTranslatedGoToLogin] = useState('Войти');
  const [translatedCancelLogin, setTranslatedCancelLogin] = useState('Отмена');

  // Загрузка туров
  useEffect(() => {
    fetchTours();
    if (isAuthenticated) {
      fetchMyBookings();
    }
    getUserLocation();
  }, [isAuthenticated]);

  // Перевод всех туров при смене языка
  useEffect(() => {
    if (tours.length > 0) {
      translateArray(tours, [
        'title',
        'description',
        'schedule',
        'included',
        'not_included',
      ]).then(setTranslatedTours);
    }
  }, [tours, i18n.language]);

  // Перевод точек маршрута для выбранного тура
  useEffect(() => {
    const translateRoutePoints = async () => {
      if (
        !selectedTour?.route_points ||
        selectedTour.route_points.length === 0
      ) {
        setTranslatedRoutePointsNames([]);
        return;
      }

      const translated = await Promise.all(
        selectedTour.route_points.map(async (point: any) => ({
          ...point,
          name: await translateText(point.name),
        })),
      );
      setTranslatedRoutePointsNames(translated);
    };

    translateRoutePoints();
  }, [selectedTour, i18n.language, translateText]);

  // Перевод статических текстов
  useEffect(() => {
    const translateStaticTexts = async () => {
      const translations = await Promise.all([
        translateText('чел'),
        translateText('Путешествуйте с нами'),
        translateText('Туры и'),
        translateText('экскурсии'),
        translateText(
          'Откройте для себя красоту Беларуси с профессиональными гидами',
        ),
        translateText('Мои бронирования'),
        translateText('Показать туры'),
        translateText('Мои бронирования'),
        translateText('У вас пока нет бронирований'),
        translateText('Дата'),
        translateText('Участники'),
        translateText('Сумма'),
        translateText('Статус'),
        translateText('Отменить'),
        translateText('Подтверждено'),
        translateText('Ожидает подтверждения'),
        translateText('Отменено'),
        translateText('Забронировать'),
        translateText('Бронирование тура'),
        translateText('Бронирование успешно!'),
        translateText('Мы свяжемся с вами для подтверждения'),
        translateText('Закрыть'),
        translateText('Подтвердить бронирование'),
        translateText('Итого'),
        translateText('Включено'),
        translateText('Не включено'),
        translateText('Программа тура'),
        translateText('Построение маршрута...'),
        translateText('Не удалось построить маршрут'),
        translateText('Не удалось определить ваше местоположение'),
        translateText('Для этого тура не заданы точки маршрута'),
        translateText('Сводка бронирования'),
        translateText('Тур'),
        translateText('Макс. участников'),
        translateText('Место отправления'),
        translateText('Моё местоположение'),
        translateText('Минск'),
        translateText('Брест'),
        translateText('Гродно'),
        translateText('Витебск'),
        translateText('Могилёв'),
        translateText('Гомель'),
        translateText('Другой город'),
        translateText('Введите название города'),
        translateText('Маршрут поездки'),
        translateText('Отправление'),
        translateText('Рассчитать маршрут'),
        translateText('Точки маршрута'),
        translateText('Общее расстояние'),
        translateText('км'),
        translateText('Требуется авторизация'),
        translateText('Чтобы забронировать тур, пожалуйста, войдите в систему'),
        translateText('Войти'),
        translateText('Отмена'),
      ]);

      let idx = 0;
      setTranslatedPerson(translations[idx++]);
      setTranslatedHeroBadge(translations[idx++]);
      setTranslatedHeroTitle(translations[idx++]);
      setTranslatedHeroTitleHigh(translations[idx++]);
      setTranslatedHeroSubtitle(translations[idx++]);
      setTranslatedShowBookings(translations[idx++]);
      setTranslatedShowTours(translations[idx++]);
      setTranslatedMyBookings(translations[idx++]);
      setTranslatedNoBookings(translations[idx++]);
      setTranslatedDate(translations[idx++]);
      setTranslatedParticipants(translations[idx++]);
      setTranslatedTotal(translations[idx++]);
      setTranslatedStatus(translations[idx++]);
      setTranslatedCancel(translations[idx++]);
      setTranslatedConfirmed(translations[idx++]);
      setTranslatedPending(translations[idx++]);
      setTranslatedCancelled(translations[idx++]);
      setTranslatedBook(translations[idx++]);
      setTranslatedBookingTitle(translations[idx++]);
      setTranslatedBookingSuccess(translations[idx++]);
      setTranslatedBookingSuccessDesc(translations[idx++]);
      setTranslatedClose(translations[idx++]);
      setTranslatedConfirmBooking(translations[idx++]);
      setTranslatedTotalLabel(translations[idx++]);
      setTranslatedIncluded(translations[idx++]);
      setTranslatedNotIncluded(translations[idx++]);
      setTranslatedProgram(translations[idx++]);
      setTranslatedBuildingRoute(translations[idx++]);
      setTranslatedRouteError(translations[idx++]);
      setTranslatedLocationError(translations[idx++]);
      setTranslatedNoRoutePoints(translations[idx++]);
      setTranslatedSummary(translations[idx++]);
      setTranslatedTour(translations[idx++]);
      setTranslatedMaxParticipants(translations[idx++]);
      setTranslatedDeparture(translations[idx++]);
      setTranslatedMyLocation(translations[idx++]);
      setTranslatedMinsk(translations[idx++]);
      setTranslatedBrest(translations[idx++]);
      setTranslatedGrodno(translations[idx++]);
      setTranslatedVitebsk(translations[idx++]);
      setTranslatedMogilev(translations[idx++]);
      setTranslatedGomel(translations[idx++]);
      setTranslatedCustomCity(translations[idx++]);
      setTranslatedEnterCity(translations[idx++]);
      setTranslatedRouteMap(translations[idx++]);
      setTranslatedFrom(translations[idx++]);
      setTranslatedCalculateRoute(translations[idx++]);
      setTranslatedRoutePoints(translations[idx++]);
      setTranslatedTotalDistance(translations[idx++]);
      setTranslatedKm(translations[idx++]);
      setTranslatedLoginRequired(translations[idx++]);
      setTranslatedLoginRequiredDesc(translations[idx++]);
      setTranslatedGoToLogin(translations[idx++]);
      setTranslatedCancelLogin(translations[idx++]);
    };

    translateStaticTexts();
  }, [i18n.language, translateText]);

  const getUserLocation = useCallback(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.latitude,
            position.coords.longitude,
          ]);
        },
        () => {
          setUserLocation([53.9045, 27.5615]);
        },
      );
    } else {
      setUserLocation([53.9045, 27.5615]);
    }
  }, []);

  const getDepartureCoordinates = useCallback((): [number, number] | null => {
    if (useMyLocation && userLocation) {
      return userLocation;
    }

    const cities: Record<string, [number, number]> = {
      minsk: [53.9045, 27.5615],
      brest: [52.0975, 23.7341],
      grodno: [53.6667, 23.8333],
      vitebsk: [55.1906, 30.2049],
      mogilev: [53.9167, 30.35],
      gomel: [52.4345, 30.9754],
    };

    const cityMap: Record<string, [number, number]> = {
      minsk: cities.minsk,
      brest: cities.brest,
      grodno: cities.grodno,
      vitebsk: cities.vitebsk,
      mogilev: cities.mogilev,
      gomel: cities.gomel,
    };

    if (departureLocation in cityMap) {
      return cityMap[departureLocation];
    }
    return null;
  }, [useMyLocation, userLocation, departureLocation]);

  const buildRoute = useCallback(async () => {
    if (!selectedTour) {
      console.log('Нет выбранного тура');
      return;
    }

    const routePoints = selectedTour.route_points;
    console.log('Точки маршрута тура:', routePoints);

    if (
      !routePoints ||
      !Array.isArray(routePoints) ||
      routePoints.length === 0
    ) {
      setRouteError(translatedNoRoutePoints);
      console.log('Нет точек маршрута');
      return;
    }

    const departureCoords = getDepartureCoordinates();
    console.log('Координаты отправления:', departureCoords);

    if (!departureCoords) {
      setRouteError(translatedLocationError);
      console.log('Нет координат отправления');
      return;
    }

    const allPoints: Array<[number, number]> = [
      departureCoords,
      ...routePoints.map((p) => [p.lat, p.lng] as [number, number]),
    ];

    console.log('Все точки маршрута:', allPoints);

    setRouteLoading(true);
    setRouteError('');

    try {
      const coordsString = allPoints.map((p) => `${p[1]},${p[0]}`).join(';');
      const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;
      console.log('URL запроса:', url);

      const response = await fetch(url);
      const data = await response.json();
      console.log('Ответ от OSRM:', data);

      if (data.code === 'Ok' && data.routes && data.routes[0]) {
        const coords = data.routes[0].geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]] as [number, number],
        );
        setRouteCoords(coords);
        console.log('Координаты маршрута:', coords);

        const allLats = allPoints.map((p) => p[0]);
        const allLngs = allPoints.map((p) => p[1]);
        const newCenter = [
          (Math.min(...allLats) + Math.max(...allLats)) / 2,
          (Math.min(...allLngs) + Math.max(...allLngs)) / 2,
        ];
        setMapCenter(newCenter as [number, number]);
        console.log('Центр карты:', newCenter);
      } else {
        setRouteError(translatedRouteError);
        console.log('Ошибка OSRM:', data);
      }
    } catch (error) {
      console.error('Route error:', error);
      setRouteError(translatedRouteError);
    } finally {
      setRouteLoading(false);
    }
  }, [
    selectedTour,
    getDepartureCoordinates,
    translatedRouteError,
    translatedLocationError,
    translatedNoRoutePoints,
  ]);

  const fetchTours = async () => {
    try {
      const response = await toursAPI.getAll();
      const fixedTours = response.data.map((tour: any) => {
        let routePoints = tour.route_points;
        if (typeof routePoints === 'string') {
          try {
            routePoints = JSON.parse(routePoints);
          } catch (e) {
            routePoints = [];
          }
        }
        return { ...tour, route_points: routePoints };
      });
      setTours(fixedTours);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tours:', error);
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const response = await bookingsAPI.getMyBookings();
      setMyBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleBookClick = (tour: Tour) => {
    // Проверяем авторизацию
    if (!isAuthenticated) {
      setLoginDialogOpen(true);
      return;
    }

    console.log('Выбран тур:', tour);
    console.log('Точки маршрута тура:', tour.route_points);
    setSelectedTour(tour);
    setBookingDialogOpen(true);
    setBookingSuccess(false);
    setBookingError('');
    setBookingDate(undefined);
    setParticipants(1);
    setUseMyLocation(true);
    setDepartureLocation('minsk');
    setCustomDeparture('');
    setRouteCoords([]);
    setRouteError('');
    setTranslatedRoutePointsNames([]);
    // Автоматически строим маршрут при открытии
    setTimeout(() => {
      buildRoute();
    }, 500);
  };

  const handleLoginRedirect = () => {
    setLoginDialogOpen(false);
    navigate('/login');
  };

  const handleBooking = async () => {
    if (!selectedTour || !bookingDate) return;

    setBookingLoading(true);
    setBookingError('');

    const departureDisplay = useMyLocation
      ? translatedMyLocation
      : departureLocation === 'custom'
        ? customDeparture
        : departureLocation === 'minsk'
          ? translatedMinsk
          : departureLocation === 'brest'
            ? translatedBrest
            : departureLocation === 'grodno'
              ? translatedGrodno
              : departureLocation === 'vitebsk'
                ? translatedVitebsk
                : departureLocation === 'mogilev'
                  ? translatedMogilev
                  : departureLocation === 'gomel'
                    ? translatedGomel
                    : '';

    try {
      await bookingsAPI.create({
        tourId: selectedTour.id,
        bookingDate: format(bookingDate, 'yyyy-MM-dd'),
        participants,
        departureLocation: departureDisplay,
      });
      setBookingSuccess(true);
      fetchMyBookings();
    } catch (err: any) {
      setBookingError(err.response?.data?.message || 'Ошибка бронирования');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    const confirmText =
      i18n.language === 'ru'
        ? 'Вы уверены, что хотите отменить бронирование?'
        : i18n.language === 'en'
          ? 'Are you sure you want to cancel the booking?'
          : 'Вы ўпэўнены, што хочаце адмяніць браніраванне?';
    if (!confirm(confirmText)) return;
    try {
      await bookingsAPI.cancel(bookingId);
      fetchMyBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
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

  const getRouteDistance = () => {
    if (routeCoords.length < 2) return null;
    let distance = 0;
    for (let i = 1; i < routeCoords.length; i++) {
      const [lat1, lng1] = routeCoords[i - 1];
      const [lat2, lng2] = routeCoords[i];
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distance += R * c;
    }
    return distance.toFixed(1);
  };

  const calculateTotalPrice = () => {
    if (!selectedTour) return 0;
    return selectedTour.price * participants;
  };

  const getDepartureDisplay = () => {
    if (useMyLocation) return translatedMyLocation;
    if (departureLocation === 'custom')
      return customDeparture || translatedCustomCity;
    if (departureLocation === 'minsk') return translatedMinsk;
    if (departureLocation === 'brest') return translatedBrest;
    if (departureLocation === 'grodno') return translatedGrodno;
    if (departureLocation === 'vitebsk') return translatedVitebsk;
    if (departureLocation === 'mogilev') return translatedMogilev;
    if (departureLocation === 'gomel') return translatedGomel;
    return '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const displayTours = translatedTours.length > 0 ? translatedTours : tours;
  const routePoints = selectedTour?.route_points || [];
  const displayRoutePoints =
    translatedRoutePointsNames.length > 0
      ? translatedRoutePointsNames
      : routePoints;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxHX85IgTy7sfLBVsgQqt9QHnU_jKS8k1LWA&s')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/50" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-white/90 text-sm">{translatedHeroBadge}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            {translatedHeroTitle}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
              {' '}
              {translatedHeroTitleHigh}
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            {translatedHeroSubtitle}
          </p>
          {isAuthenticated && (
            <Button
              variant="outline"
              onClick={() => setShowMyBookings(!showMyBookings)}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 mt-8"
            >
              {showMyBookings ? translatedShowTours : translatedShowBookings}
            </Button>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* My Bookings */}
        {showMyBookings && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {translatedMyBookings}
            </h2>
            {myBookings.length === 0 ? (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  {translatedNoBookings}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myBookings.map((booking) => (
                  <Card
                    key={booking.id}
                    className="border-0 shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <CardContent className="p-5">
                      {booking.tour_image && (
                        <img
                          src={booking.tour_image}
                          alt={booking.tour_title}
                          className="w-full h-40 object-cover rounded-lg mb-3"
                        />
                      )}
                      <h3 className="font-semibold text-lg text-gray-800 mb-2">
                        {booking.tour_title}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">
                            {translatedDate}
                          </span>
                          <span className="text-gray-700">
                            {format(
                              new Date(booking.booking_date),
                              'dd.MM.yyyy',
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">
                            {translatedParticipants}
                          </span>
                          <span className="text-gray-700">
                            {booking.participants}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">
                            {translatedTotal}
                          </span>
                          <span className="text-gray-700 font-semibold">
                            {booking.total_price} BYN
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">
                            {translatedStatus}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${getStatusColor(booking.status)}`}
                          >
                            {getStatusText(booking.status)}
                          </span>
                        </div>
                      </div>
                      {booking.status !== 'cancelled' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full mt-4 rounded-full"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          {translatedCancel}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Tours List - с одинаковой высотой карточек */}
        {!showMyBookings && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {displayTours.map((tour, index) => (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex"
              >
                <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 shadow-lg rounded-xl flex flex-col w-full">
                  {tour.image_url && (
                    <div className="relative h-64 overflow-hidden flex-shrink-0">
                      <img
                        src={tour.image_url}
                        alt={tour.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                        {tour.price} BYN
                      </div>
                    </div>
                  )}
                  <CardHeader className="pb-2 flex-shrink-0">
                    <CardTitle className="text-2xl text-gray-800 line-clamp-1">
                      {tour.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-grow flex flex-col">
                    <p className="text-gray-600 leading-relaxed line-clamp-3 flex-grow">
                      {tour.description}
                    </p>
                    <VoiceReader text={`${tour.title}. ${tour.description}`} />

                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        <Clock className="w-4 h-4 text-blue-500" />{' '}
                        {tour.duration}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        <Users className="w-4 h-4 text-blue-500" />{' '}
                        {translatedMaxParticipants}: {tour.max_participants}
                      </div>
                    </div>

                    {(tour.included || tour.not_included) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        {tour.included && (
                          <div className="bg-green-50 p-3 rounded-lg">
                            <h4 className="font-semibold text-green-700 flex items-center gap-2 text-sm mb-1">
                              <CheckCircle className="w-4 h-4" />{' '}
                              {translatedIncluded}
                            </h4>
                            <p className="text-xs text-green-600 line-clamp-2">
                              {tour.included}
                            </p>
                          </div>
                        )}
                        {tour.not_included && (
                          <div className="bg-red-50 p-3 rounded-lg">
                            <h4 className="font-semibold text-red-700 flex items-center gap-2 text-sm mb-1">
                              <XCircle className="w-4 h-4" />{' '}
                              {translatedNotIncluded}
                            </h4>
                            <p className="text-xs text-red-600 line-clamp-2">
                              {tour.not_included}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {tour.schedule && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h4 className="font-semibold text-blue-700 flex items-center gap-2 text-sm mb-1">
                          <List className="w-4 h-4" /> {translatedProgram}
                        </h4>
                        <p className="text-xs text-blue-600 whitespace-pre-line line-clamp-3">
                          {tour.schedule}
                        </p>
                      </div>
                    )}

                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full mt-auto"
                      onClick={() => handleBookClick(tour)}
                    >
                      {translatedBook}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Диалог требования авторизации */}
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl text-center">
          <div className="flex flex-col items-center py-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <LogIn className="w-8 h-8 text-blue-600" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-800 text-center">
                {translatedLoginRequired}
              </DialogTitle>
              <DialogDescription className="text-gray-500 text-center mt-2">
                {translatedLoginRequiredDesc}
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 mt-6 w-full">
              <Button
                variant="outline"
                onClick={() => setLoginDialogOpen(false)}
                className="flex-1 rounded-full"
              >
                {translatedCancelLogin}
              </Button>
              <Button
                onClick={handleLoginRedirect}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full"
              >
                {translatedGoToLogin}
                <LogIn className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Dialog - увеличенная форма с правильным порядком */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent
          className="rounded-2xl overflow-hidden"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90vw',
            maxWidth: '1000px',
            height: 'auto',
            margin: 0,
            padding: 0,
          }}
        >
          {/* Кнопка закрытия */}
          <div className="absolute right-3 top-3 z-20">
            <button
              onClick={() => setBookingDialogOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Закрыть"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3 sticky top-0 z-10">
            <DialogTitle className="text-lg text-white text-center">
              {translatedBookingTitle}
            </DialogTitle>
            <DialogDescription className="text-blue-100 text-center text-xs">
              {selectedTour?.title}
            </DialogDescription>
          </div>

          {bookingSuccess ? (
            <div className="text-center py-10 px-5">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"
              >
                <Check className="w-8 h-8 text-green-600" />
              </motion.div>
              <h3 className="text-lg font-semibold">
                {translatedBookingSuccess}
              </h3>
              <p className="text-gray-500 mt-1 text-sm">
                {translatedBookingSuccessDesc}
              </p>
              <Button
                onClick={() => setBookingDialogOpen(false)}
                className="mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full px-6 text-sm"
              >
                {translatedClose}
              </Button>
            </div>
          ) : (
            <div
              className="p-4 overflow-y-auto"
              style={{ maxHeight: 'calc(85vh - 60px)' }}
            >
              <div className="space-y-4">
                {bookingError && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription className="text-xs">
                      {bookingError}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Место отправления */}
                <div>
                  <Label className="text-gray-700 flex items-center gap-1 mb-1 text-sm">
                    <Navigation className="w-4 h-4 text-blue-500" />
                    {translatedDeparture}
                  </Label>

                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        setUseMyLocation(true);
                        setTimeout(() => buildRoute(), 100);
                      }}
                      className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-all ${
                        useMyLocation
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Navigation className="w-4 h-4" />
                      {translatedMyLocation}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUseMyLocation(false);
                        setTimeout(() => buildRoute(), 100);
                      }}
                      className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-all ${
                        !useMyLocation
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Building className="w-4 h-4" />
                      {translatedCustomCity}
                    </button>
                  </div>

                  {!useMyLocation && (
                    <select
                      value={departureLocation}
                      onChange={(e) => {
                        setDepartureLocation(e.target.value);
                        setTimeout(() => buildRoute(), 100);
                      }}
                      className="w-full border rounded-lg px-3 py-2 text-sm mb-2 bg-white"
                    >
                      <option value="minsk">{translatedMinsk}</option>
                      <option value="brest">{translatedBrest}</option>
                      <option value="grodno">{translatedGrodno}</option>
                      <option value="vitebsk">{translatedVitebsk}</option>
                      <option value="mogilev">{translatedMogilev}</option>
                      <option value="gomel">{translatedGomel}</option>
                    </select>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={buildRoute}
                    className="w-full mt-2 border-blue-300 text-blue-600 hover:bg-blue-50 rounded-lg text-sm py-2"
                    disabled={routeLoading}
                  >
                    {routeLoading ? (
                      <Loader2 className="animate-spin mr-2 w-4 h-4" />
                    ) : null}
                    {translatedCalculateRoute}
                  </Button>
                </div>

                {/* Карта маршрута */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-sm">
                    <Compass className="w-4 h-4 text-blue-500" />
                    {translatedRouteMap}
                  </h4>
                  <div className="h-[300px] w-full rounded-lg overflow-hidden border">
                    {selectedTour && (
                      <MapContainer
                        key={mapCenter.join(',')}
                        center={mapCenter}
                        zoom={7}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <MapCenter center={mapCenter} zoom={7} />

                        {(() => {
                          const coords = getDepartureCoordinates();
                          if (coords) {
                            return (
                              <Marker position={coords} icon={userLocationIcon}>
                                <Popup>
                                  {translatedFrom}: {getDepartureDisplay()}
                                </Popup>
                              </Marker>
                            );
                          }
                          return null;
                        })()}

                        {displayRoutePoints.map((point: any, idx: number) => (
                          <Marker
                            key={idx}
                            position={[point.lat, point.lng]}
                            icon={defaultIcon}
                          >
                            <Popup>
                              <div className="font-semibold text-sm">
                                {point.name}
                              </div>
                            </Popup>
                          </Marker>
                        ))}

                        {routeCoords.length > 0 && (
                          <Polyline
                            positions={routeCoords}
                            color="#3b82f6"
                            weight={4}
                            opacity={0.8}
                          />
                        )}
                      </MapContainer>
                    )}
                  </div>

                  {routeLoading && (
                    <div className="text-center py-2 text-blue-600 mt-2 text-sm">
                      <Loader2 className="animate-spin inline mr-2 w-4 h-4" />
                      {translatedBuildingRoute}
                    </div>
                  )}
                  {routeError && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription className="text-sm">
                        {routeError}
                      </AlertDescription>
                    </Alert>
                  )}

                  {routeCoords.length > 0 && getRouteDistance() && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700 flex items-center gap-2">
                        <Compass className="w-4 h-4 text-blue-500" />
                        {translatedTotalDistance}:{' '}
                        <strong>
                          {getRouteDistance()} {translatedKm}
                        </strong>
                      </p>
                    </div>
                  )}

                  {routePoints.length > 0 && (
                    <div className="mt-2">
                      <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <MapPinned className="w-4 h-4 text-blue-500" />
                        {translatedRoutePoints}:
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {displayRoutePoints.map((point: any, idx: number) => (
                          <span
                            key={idx}
                            className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs"
                          >
                            {idx + 1}. {point.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Дата */}
                <div className="flex justify-center">
                  <div className="w-[60%]">
                    <Calendar
                      mode="single"
                      selected={bookingDate}
                      onSelect={setBookingDate}
                      disabled={(date) => date < new Date()}
                      className="rounded-lg border w-full mx-auto [&_.rdp-day_selected]:bg-blue-500"
                    />
                  </div>
                </div>

                {/* Участники */}
                <div>
                  <Label className="text-gray-700 flex items-center gap-2 mb-2 text-sm">
                    <Users className="w-4 h-4 text-blue-500" />
                    {translatedParticipants}
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={selectedTour?.max_participants}
                    value={participants}
                    onChange={(e) => setParticipants(Number(e.target.value))}
                    className="rounded-lg"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {translatedMaxParticipants}:{' '}
                    {selectedTour?.max_participants}
                  </p>
                </div>

                {/* Сводка */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {translatedSummary}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{translatedTour}:</span>
                      <span className="font-medium">{selectedTour?.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{translatedFrom}:</span>
                      <span className="font-medium">
                        {getDepartureDisplay()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {translatedParticipants}:
                      </span>
                      <span className="font-medium">
                        {participants} {translatedPerson}
                      </span>
                    </div>
                    {bookingDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">{translatedDate}:</span>
                        <span className="font-medium">
                          {format(bookingDate, 'dd.MM.yyyy')}
                        </span>
                      </div>
                    )}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="font-semibold">
                          {translatedTotalLabel}
                        </span>
                        <span className="font-bold text-blue-600">
                          {calculateTotalPrice()} BYN
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleBooking}
                  disabled={!bookingDate || bookingLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg py-3 text-base font-semibold"
                >
                  {bookingLoading ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    translatedConfirmBooking
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tours;
