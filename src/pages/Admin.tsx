import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  placesAPI,
  toursAPI,
  traditionsAPI,
  foodsAPI,
  bookingsAPI,
  legendsAPI,
  feedbackAPI,
  reviewsAPI,
  usersAPI,
} from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  BookOpen,
  Utensils,
  Users,
  Check,
  Loader2,
  Scroll,
  Shield,
  User,
  Eye,
  Send,
  Route,
  LogOut,
  Filter,
  Star,
  X,
  Ban,
  Unlock,
  UserCog,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAutoTranslate } from '@/hooks/useAutoTranslate';

interface RoutePoint {
  id: number;
  name: string;
  lat: number;
  lng: number;
  description?: string;
  category?: string;
}

interface Place {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  category: string;
  description: string;
}

const Admin: React.FC = () => {
  const { i18n } = useTranslation();
  const { translateText } = useAutoTranslate();
  const { isAdmin, isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // Состояния
  const [activeTab, setActiveTab] = useState('places');
  const [data, setData] = useState<any[]>([]);
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [dataReviews, setDataReviews] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [responseText, setResponseText] = useState('');
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [placeCategories, setPlaceCategories] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({
    id: 0,
    is_approved: false,
    is_featured: false,
  });

  const [legendCategories, setLegendCategories] = useState<string[]>([]);
  const [legendCategoryFilter, setLegendCategoryFilter] =
    useState<string>('all');
  const [filteredLegends, setFilteredLegends] = useState<any[]>([]);

  const months = [
    { value: 1, label: 'Январь' },
    { value: 2, label: 'Февраль' },
    { value: 3, label: 'Март' },
    { value: 4, label: 'Апрель' },
    { value: 5, label: 'Май' },
    { value: 6, label: 'Июнь' },
    { value: 7, label: 'Июль' },
    { value: 8, label: 'Август' },
    { value: 9, label: 'Сентябрь' },
    { value: 10, label: 'Октябрь' },
    { value: 11, label: 'Ноябрь' },
    { value: 12, label: 'Декабрь' },
  ];

  // Переводы для пользователей
  const [translatedUsers, setTranslatedUsers] = useState('Пользователи');
  const [translatedRole, setTranslatedRole] = useState('Роль');
  const [translatedBlocked, setTranslatedBlocked] = useState('Заблокирован');
  const [translatedRegistrationDate, setTranslatedRegistrationDate] =
    useState('Дата регистрации');
  const [translatedAdmin, setTranslatedAdmin] = useState('Администратор');
  const [translatedUserRole, setTranslatedUserRole] = useState('Пользователь');
  const [translatedChangeRole, setTranslatedChangeRole] =
    useState('Изменить роль');
  const [translatedActiveUser, setTranslatedActiveUser] = useState('Активен');
  const [translatedName, setTranslatedName] = useState('Название');
  const [translatedEmail, setTranslatedEmail] = useState('Email');
  const [translatedStatus, setTranslatedStatus] = useState('Статус');
  const [translatedFirstName, setTranslatedFirstName] = useState('Имя');
  const [translatedLastName, setTranslatedLastName] = useState('Фамилия');
  const [translatedFullName, setTranslatedFullName] = useState('Полное имя');
  const [translatedNoBookings, setTranslatedNoBookings] =
    useState('Нет бронирований');
  const [translatedDeleteReviewConfirm, setTranslatedDeleteReviewConfirm] =
    useState('Удалить отзыв?');
  const [translatedReviewDeleted, setTranslatedReviewDeleted] =
    useState('Отзыв удален');
  const [translatedDeleteError, setTranslatedDeleteError] =
    useState('Ошибка удаления');
  const [translatedReviewStatusUpdated, setTranslatedReviewStatusUpdated] =
    useState('Статус отзыва обновлен');
  const [translatedReviewStatusError, setTranslatedReviewStatusError] =
    useState('Ошибка обновления статуса');
  const [translatedRoleChanged, setTranslatedRoleChanged] = useState(
    'Роль пользователя изменена на',
  );
  const [translatedAdminRole, setTranslatedAdminRole] =
    useState('Администратора');
  const [translatedUserRoleText, setTranslatedUserRoleText] =
    useState('Пользователя');
  const [translatedRoleError, setTranslatedRoleError] = useState(
    'Ошибка изменения роли',
  );
  const [translatedUserUnblocked, setTranslatedUserUnblocked] = useState(
    'Пользователь разблокирован',
  );
  const [translatedUserBlocked, setTranslatedUserBlocked] = useState(
    'Пользователь заблокирован',
  );
  const [translatedBlockStatusError, setTranslatedBlockStatusError] = useState(
    'Ошибка изменения статуса',
  );
  const [translatedUserDeleteConfirm, setTranslatedUserDeleteConfirm] =
    useState('Вы уверены, что хотите удалить этого пользователя?');
  const [translatedUserDeleted, setTranslatedUserDeleted] = useState(
    'Пользователь удален',
  );
  const [translatedUserDeleteError, setTranslatedUserDeleteError] = useState(
    'Ошибка удаления пользователя',
  );
  const [translatedUnblock, setTranslatedUnblock] = useState('Разблокировать');
  const [translatedBlock, setTranslatedBlock] = useState('Заблокировать');
  const [translatedDelete, setTranslatedDelete] = useState('Удалить');
  const [translatedNoUsers, setTranslatedNoUsers] = useState(
    'Пользователи не найдены. Проверьте подключение к базе данных.',
  );
  const [translatedUsersLoadError, setTranslatedUsersLoadError] = useState(
    'Ошибка загрузки пользователей',
  );
  const [translatedAddRecord, setTranslatedAddRecord] =
    useState('Добавить запись');

  // Переводы для форм
  const [translatedEditReviewTitle, setTranslatedEditReviewTitle] = useState(
    'Редактирование отзыва',
  );
  const [translatedApprovedLabel, setTranslatedApprovedLabel] =
    useState('Одобрен');
  const [translatedOnMainLabel, setTranslatedOnMainLabel] = useState(
    'Показывать на главной',
  );
  const [translatedOnlyApprovedHint, setTranslatedOnlyApprovedHint] = useState(
    'Только одобренные отзывы могут попасть на главную',
  );
  const [translatedModeration, setTranslatedModeration] =
    useState('На модерации');
  const [translatedApprovedStatus, setTranslatedApprovedStatus] =
    useState('Одобрен');
  const [translatedYes, setTranslatedYes] = useState('Да');
  const [translatedNo, setTranslatedNo] = useState('Нет');
  const [translatedSaveBtn, setTranslatedSaveBtn] = useState('Сохранить');
  const [translatedCancelBtn, setTranslatedCancelBtn] = useState('Отмена');
  const [translatedAdminPanel, setTranslatedAdminPanel] = useState(
    'Административная панель',
  );
  const [translatedManageContent, setTranslatedManageContent] = useState(
    'Управление контентом и пользователями',
  );
  const [translatedLogout, setTranslatedLogout] = useState('Выйти');
  const [translatedPlaces, setTranslatedPlaces] = useState('Места');
  const [translatedTours, setTranslatedTours] = useState('Туры');
  const [translatedTraditions, setTranslatedTraditions] = useState('Традиции');
  const [translatedFoods, setTranslatedFoods] = useState('Еда');
  const [translatedLegends, setTranslatedLegends] = useState('Легенды');
  const [translatedBookings, setTranslatedBookings] = useState('Бронирования');
  const [translatedFeedback, setTranslatedFeedback] =
    useState('Обратная связь');
  const [translatedReviews, setTranslatedReviews] = useState('Отзывы');
  const [translatedManageBookings, setTranslatedManageBookings] = useState(
    'Управление бронированиями',
  );
  const [translatedUserFeedback, setTranslatedUserFeedback] = useState(
    'Обратная связь от пользователей',
  );
  const [translatedManagePrefix, setTranslatedManagePrefix] =
    useState('Управление');
  const [translatedAdd, setTranslatedAdd] = useState('Добавить');
  const [translatedEdit, setTranslatedEdit] = useState('Редактировать');
  const [translatedCreate, setTranslatedCreate] = useState('Создать');
  const [translatedSave, setTranslatedSave] = useState('Сохранить');
  const [translatedCancel, setTranslatedCancel] = useState('Отмена');
  const [translatedDeleteConfirm, setTranslatedDeleteConfirm] = useState(
    'Вы уверены, что хотите удалить эту запись?',
  );
  const [translatedSuccessDeleted, setTranslatedSuccessDeleted] = useState(
    'Запись успешно удалена',
  );
  const [translatedSuccessUpdated, setTranslatedSuccessUpdated] = useState(
    'Запись успешно обновлена',
  );
  const [translatedSuccessCreated, setTranslatedSuccessCreated] = useState(
    'Запись успешно создана',
  );
  const [translatedSuccessBookingStatus, setTranslatedSuccessBookingStatus] =
    useState('Статус бронирования обновлен');
  const [translatedSuccessResponseSent, setTranslatedSuccessResponseSent] =
    useState('Ответ отправлен');
  const [translatedErrorSave, setTranslatedErrorSave] =
    useState('Ошибка сохранения');
  const [translatedErrorDelete, setTranslatedErrorDelete] =
    useState('Ошибка удаления');
  const [translatedErrorUpdateStatus, setTranslatedErrorUpdateStatus] =
    useState('Ошибка обновления статуса');
  const [translatedErrorSendResponse, setTranslatedErrorSendResponse] =
    useState('Ошибка отправки ответа');
  const [translatedPointAlreadyExists, setTranslatedPointAlreadyExists] =
    useState('Эта точка уже добавлена в маршрут');
  const [translatedNoRoutePoints, setTranslatedNoRoutePoints] =
    useState('Нет точек маршрута');
  const [translatedTourActive, setTranslatedTourActive] =
    useState('Тур активен');
  const [translatedChoosePlace, setTranslatedChoosePlace] = useState(
    '-- Выберите достопримечательность --',
  );
  const [translatedAddPoint, setTranslatedAddPoint] = useState('Добавить');
  const [translatedRoutePoints, setTranslatedRoutePoints] = useState(
    'Точки маршрута (порядок важен)',
  );
  const [translatedWhatIncluded, setTranslatedWhatIncluded] =
    useState('Что включено');
  const [translatedWhatNotIncluded, setTranslatedWhatNotIncluded] =
    useState('Что не включено');
  const [translatedTourProgram, setTranslatedTourProgram] =
    useState('Программа тура');
  const [translatedTourTitle, setTranslatedTourTitle] =
    useState('Название тура');
  const [translatedPrice, setTranslatedPrice] = useState('Цена (BYN)');
  const [translatedDuration, setTranslatedDuration] = useState('Длительность');
  const [translatedMaxParticipants, setTranslatedMaxParticipants] =
    useState('Макс. участников');
  const [translatedDescription, setTranslatedDescription] =
    useState('Описание');
  const [translatedImageUrl, setTranslatedImageUrl] =
    useState('URL изображения');
  const [translatedPlaceName, setTranslatedPlaceName] =
    useState('Название места');
  const [translatedCategory, setTranslatedCategory] = useState('Категория');
  const [translatedLatitude, setTranslatedLatitude] = useState('Широта');
  const [translatedLongitude, setTranslatedLongitude] = useState('Долгота');
  const [translatedHistory, setTranslatedHistory] = useState('История');
  const [translatedTitle, setTranslatedTitle] = useState('Название');
  const [translatedContent, setTranslatedContent] = useState(
    'Описание / Содержание',
  );
  const [translatedOrigin, setTranslatedOrigin] = useState('Происхождение');
  const [translatedIngredients, setTranslatedIngredients] =
    useState('Ингредиенты');
  const [translatedRecipe, setTranslatedRecipe] = useState('Рецепт');
  const [translatedResponseToFeedback, setTranslatedResponseToFeedback] =
    useState('Ответ на обращение');
  const [translatedYourResponse, setTranslatedYourResponse] =
    useState('Ваш ответ');
  const [translatedFrom, setTranslatedFrom] = useState('От:');
  const [translatedSend, setTranslatedSend] = useState('Отправить');
  const [translatedActive, setTranslatedActive] = useState('Активен');
  const [translatedInactive, setTranslatedInactive] = useState('Неактивен');
  const [translatedPointsCount, setTranslatedPointsCount] = useState('точек');
  const [translatedHasRoute, setTranslatedHasRoute] = useState('Есть');
  const [translatedNoRoute, setTranslatedNoRoute] = useState('Нет маршрута');
  const [translatedAnonym, setTranslatedAnonym] = useState('Аноним');
  const [translatedId, setTranslatedId] = useState('ID');
  const [translatedActions, setTranslatedActions] = useState('Действия');
  const [translatedCoordinates, setTranslatedCoordinates] =
    useState('Координаты');
  const [translatedTour, setTranslatedTour] = useState('Тур');
  const [translatedClient, setTranslatedClient] = useState('Клиент');
  const [translatedDate, setTranslatedDate] = useState('Дата');
  const [translatedSum, setTranslatedSum] = useState('Сумма');
  const [translatedSubject, setTranslatedSubject] = useState('Тема');
  const [translatedSender, setTranslatedSender] = useState('Отправитель');
  const [
    translatedBookingStatusConfirmed,
    setTranslatedBookingStatusConfirmed,
  ] = useState('Подтверждено');
  const [
    translatedBookingStatusCancelled,
    setTranslatedBookingStatusCancelled,
  ] = useState('Отменено');
  const [translatedBookingStatusPending, setTranslatedBookingStatusPending] =
    useState('Ожидает');
  const [translatedFeedbackStatusNew, setTranslatedFeedbackStatusNew] =
    useState('Новое');
  const [
    translatedFeedbackStatusResponded,
    setTranslatedFeedbackStatusResponded,
  ] = useState('Отвечено');
  const [translatedFilterByCategory, setTranslatedFilterByCategory] = useState(
    'Фильтр по категориям',
  );
  const [translatedAllCategories, setTranslatedAllCategories] =
    useState('Все категории');
  const [translatedUserName, setTranslatedUserName] = useState('Пользователь');
  const [translatedRating, setTranslatedRating] = useState('Рейтинг');
  const [translatedReviewText, setTranslatedReviewText] = useState('Отзыв');
  const [translatedOnMain, setTranslatedOnMain] = useState('На главной');
  const [translatedApproved, setTranslatedApproved] = useState('Одобрен');
  const [translatedPending, setTranslatedPending] = useState('На модерации');
  const [translatedCelebrationDate, setTranslatedCelebrationDate] =
    useState('Дата празднования');
  const [translatedDay, setTranslatedDay] = useState('День');
  const [translatedMonth, setTranslatedMonth] = useState('Месяц');
  const [translatedNoDate, setTranslatedNoDate] = useState('Нет даты');

  // Заголовки карточек
  const [translatedManagePlaces, setTranslatedManagePlaces] =
    useState('Управление местами');
  const [translatedManageTours, setTranslatedManageTours] =
    useState('Управление турами');
  const [translatedManageTraditions, setTranslatedManageTraditions] = useState(
    'Управление традициями',
  );
  const [translatedManageLegends, setTranslatedManageLegends] = useState(
    'Управление легендами',
  );
  const [translatedManageFoods, setTranslatedManageFoods] =
    useState('Управление едой');
  const [translatedManageBookingsHeader, setTranslatedManageBookingsHeader] =
    useState('Управление бронированиями');
  const [translatedManageReviews, setTranslatedManageReviews] = useState(
    'Управление отзывами',
  );
  const [translatedManageUsersHeader, setTranslatedManageUsersHeader] =
    useState('Управление пользователями');

  useEffect(() => {
    const translateStaticTexts = async () => {
      const translations = await Promise.all([
        translateText('Редактирование отзыва'),
        translateText('Одобрен'),
        translateText('Показывать на главной'),
        translateText('Только одобренные отзывы могут попасть на главную'),
        translateText('На модерации'),
        translateText('Одобрен'),
        translateText('Да'),
        translateText('Нет'),
        translateText('Сохранить'),
        translateText('Отмена'),
        translateText('Административная панель'),
        translateText('Управление контентом и пользователями'),
        translateText('Выйти'),
        translateText('Места'),
        translateText('Туры'),
        translateText('Традиции'),
        translateText('Еда'),
        translateText('Легенды'),
        translateText('Бронирования'),
        translateText('Обратная связь'),
        translateText('Отзывы'),
        translateText('Управление бронированиями'),
        translateText('Обратная связь от пользователей'),
        translateText('Управление'),
        translateText('Добавить'),
        translateText('Редактировать'),
        translateText('Создать'),
        translateText('Сохранить'),
        translateText('Отмена'),
        translateText('Вы уверены, что хотите удалить эту запись?'),
        translateText('Запись успешно удалена'),
        translateText('Запись успешно обновлена'),
        translateText('Запись успешно создана'),
        translateText('Статус бронирования обновлен'),
        translateText('Ответ отправлен'),
        translateText('Ошибка сохранения'),
        translateText('Ошибка удаления'),
        translateText('Ошибка обновления статуса'),
        translateText('Ошибка отправки ответа'),
        translateText('Эта точка уже добавлена в маршрут'),
        translateText('Нет точек маршрута'),
        translateText('Тур активен'),
        translateText('-- Выберите достопримечательность --'),
        translateText('Добавить'),
        translateText('Точки маршрута (порядок важен)'),
        translateText('Что включено'),
        translateText('Что не включено'),
        translateText('Программа тура'),
        translateText('Название тура'),
        translateText('Цена (BYN)'),
        translateText('Длительность'),
        translateText('Макс. участников'),
        translateText('Описание'),
        translateText('URL изображения'),
        translateText('Название места'),
        translateText('Категория'),
        translateText('Широта'),
        translateText('Долгота'),
        translateText('История'),
        translateText('Название'),
        translateText('Описание / Содержание'),
        translateText('Происхождение'),
        translateText('Ингредиенты'),
        translateText('Рецепт'),
        translateText('Ответ на обращение'),
        translateText('Ваш ответ'),
        translateText('От:'),
        translateText('Отправить'),
        translateText('Активен'),
        translateText('Неактивен'),
        translateText('точек'),
        translateText('Есть'),
        translateText('Нет маршрута'),
        translateText('Аноним'),
        translateText('ID'),
        translateText('Действия'),
        translateText('Координаты'),
        translateText('Статус'),
        translateText('Тур'),
        translateText('Клиент'),
        translateText('Дата'),
        translateText('Сумма'),
        translateText('Тема'),
        translateText('Отправитель'),
        translateText('Подтверждено'),
        translateText('Отменено'),
        translateText('Ожидает'),
        translateText('Новое'),
        translateText('Отвечено'),
        translateText('Фильтр по категориям'),
        translateText('Все категории'),
        translateText('Пользователь'),
        translateText('Email'),
        translateText('Рейтинг'),
        translateText('Отзыв'),
        translateText('Статус'),
        translateText('На главной'),
        translateText('Одобрен'),
        translateText('На модерации'),
        translateText('Дата празднования'),
        translateText('День'),
        translateText('Месяц'),
        translateText('Нет даты'),
        translateText('Пользователи'),
        translateText('Роль'),
        translateText('Заблокирован'),
        translateText('Дата регистрации'),
        translateText('Администратор'),
        translateText('Пользователь'),
        translateText('Изменить роль'),
        translateText('Активен'),
        translateText('Управление местами'),
        translateText('Управление турами'),
        translateText('Управление традициями'),
        translateText('Управление легендами'),
        translateText('Управление едой'),
        translateText('Нет бронирований'),
        translateText('Удалить отзыв?'),
        translateText('Отзыв удален'),
        translateText('Ошибка удаления'),
        translateText('Статус отзыва обновлен'),
        translateText('Ошибка обновления статуса'),
        translateText('Роль пользователя изменена на'),
        translateText('Администратора'),
        translateText('Пользователя'),
        translateText('Ошибка изменения роли'),
        translateText('Пользователь разблокирован'),
        translateText('Пользователь заблокирован'),
        translateText('Ошибка изменения статуса'),
        translateText('Вы уверены, что хотите удалить этого пользователя?'),
        translateText('Пользователь удален'),
        translateText('Ошибка удаления пользователя'),
        translateText('Разблокировать'),
        translateText('Заблокировать'),
        translateText('Удалить'),
        translateText('Название'),
        translateText('Имя'),
        translateText('Фамилия'),
        translateText('Полное имя'),
        translateText(
          'Пользователи не найдены. Проверьте подключение к базе данных.',
        ),
        translateText('Ошибка загрузки пользователей'),
        translateText('Добавить запись'),
        translateText('Управление бронированиями'),
        translateText('Управление отзывами'),
        translateText('Управление пользователями'),
      ]);

      let idx = 0;
      setTranslatedEditReviewTitle(translations[idx++]);
      setTranslatedApprovedLabel(translations[idx++]);
      setTranslatedOnMainLabel(translations[idx++]);
      setTranslatedOnlyApprovedHint(translations[idx++]);
      setTranslatedModeration(translations[idx++]);
      setTranslatedApprovedStatus(translations[idx++]);
      setTranslatedYes(translations[idx++]);
      setTranslatedNo(translations[idx++]);
      setTranslatedSaveBtn(translations[idx++]);
      setTranslatedCancelBtn(translations[idx++]);
      setTranslatedAdminPanel(translations[idx++]);
      setTranslatedManageContent(translations[idx++]);
      setTranslatedLogout(translations[idx++]);
      setTranslatedPlaces(translations[idx++]);
      setTranslatedTours(translations[idx++]);
      setTranslatedTraditions(translations[idx++]);
      setTranslatedFoods(translations[idx++]);
      setTranslatedLegends(translations[idx++]);
      setTranslatedBookings(translations[idx++]);
      setTranslatedFeedback(translations[idx++]);
      setTranslatedReviews(translations[idx++]);
      setTranslatedManageBookings(translations[idx++]);
      setTranslatedUserFeedback(translations[idx++]);
      setTranslatedManagePrefix(translations[idx++]);
      setTranslatedAdd(translations[idx++]);
      setTranslatedEdit(translations[idx++]);
      setTranslatedCreate(translations[idx++]);
      setTranslatedSave(translations[idx++]);
      setTranslatedCancel(translations[idx++]);
      setTranslatedDeleteConfirm(translations[idx++]);
      setTranslatedSuccessDeleted(translations[idx++]);
      setTranslatedSuccessUpdated(translations[idx++]);
      setTranslatedSuccessCreated(translations[idx++]);
      setTranslatedSuccessBookingStatus(translations[idx++]);
      setTranslatedSuccessResponseSent(translations[idx++]);
      setTranslatedErrorSave(translations[idx++]);
      setTranslatedErrorDelete(translations[idx++]);
      setTranslatedErrorUpdateStatus(translations[idx++]);
      setTranslatedErrorSendResponse(translations[idx++]);
      setTranslatedPointAlreadyExists(translations[idx++]);
      setTranslatedNoRoutePoints(translations[idx++]);
      setTranslatedTourActive(translations[idx++]);
      setTranslatedChoosePlace(translations[idx++]);
      setTranslatedAddPoint(translations[idx++]);
      setTranslatedRoutePoints(translations[idx++]);
      setTranslatedWhatIncluded(translations[idx++]);
      setTranslatedWhatNotIncluded(translations[idx++]);
      setTranslatedTourProgram(translations[idx++]);
      setTranslatedTourTitle(translations[idx++]);
      setTranslatedPrice(translations[idx++]);
      setTranslatedDuration(translations[idx++]);
      setTranslatedMaxParticipants(translations[idx++]);
      setTranslatedDescription(translations[idx++]);
      setTranslatedImageUrl(translations[idx++]);
      setTranslatedPlaceName(translations[idx++]);
      setTranslatedCategory(translations[idx++]);
      setTranslatedLatitude(translations[idx++]);
      setTranslatedLongitude(translations[idx++]);
      setTranslatedHistory(translations[idx++]);
      setTranslatedTitle(translations[idx++]);
      setTranslatedContent(translations[idx++]);
      setTranslatedOrigin(translations[idx++]);
      setTranslatedIngredients(translations[idx++]);
      setTranslatedRecipe(translations[idx++]);
      setTranslatedResponseToFeedback(translations[idx++]);
      setTranslatedYourResponse(translations[idx++]);
      setTranslatedFrom(translations[idx++]);
      setTranslatedSend(translations[idx++]);
      setTranslatedActive(translations[idx++]);
      setTranslatedInactive(translations[idx++]);
      setTranslatedPointsCount(translations[idx++]);
      setTranslatedHasRoute(translations[idx++]);
      setTranslatedNoRoute(translations[idx++]);
      setTranslatedAnonym(translations[idx++]);
      setTranslatedId(translations[idx++]);
      setTranslatedActions(translations[idx++]);
      setTranslatedCoordinates(translations[idx++]);
      setTranslatedStatus(translations[idx++]);
      setTranslatedTour(translations[idx++]);
      setTranslatedClient(translations[idx++]);
      setTranslatedDate(translations[idx++]);
      setTranslatedSum(translations[idx++]);
      setTranslatedSubject(translations[idx++]);
      setTranslatedSender(translations[idx++]);
      setTranslatedBookingStatusConfirmed(translations[idx++]);
      setTranslatedBookingStatusCancelled(translations[idx++]);
      setTranslatedBookingStatusPending(translations[idx++]);
      setTranslatedFeedbackStatusNew(translations[idx++]);
      setTranslatedFeedbackStatusResponded(translations[idx++]);
      setTranslatedFilterByCategory(translations[idx++]);
      setTranslatedAllCategories(translations[idx++]);
      setTranslatedUserName(translations[idx++]);
      setTranslatedEmail(translations[idx++]);
      setTranslatedRating(translations[idx++]);
      setTranslatedReviewText(translations[idx++]);
      setTranslatedStatus(translations[idx++]);
      setTranslatedOnMain(translations[idx++]);
      setTranslatedApproved(translations[idx++]);
      setTranslatedPending(translations[idx++]);
      setTranslatedCelebrationDate(translations[idx++]);
      setTranslatedDay(translations[idx++]);
      setTranslatedMonth(translations[idx++]);
      setTranslatedNoDate(translations[idx++]);
      setTranslatedUsers(translations[idx++]);
      setTranslatedRole(translations[idx++]);
      setTranslatedBlocked(translations[idx++]);
      setTranslatedRegistrationDate(translations[idx++]);
      setTranslatedAdmin(translations[idx++]);
      setTranslatedUserRole(translations[idx++]);
      setTranslatedChangeRole(translations[idx++]);
      setTranslatedActiveUser(translations[idx++]);
      setTranslatedManagePlaces(translations[idx++]);
      setTranslatedManageTours(translations[idx++]);
      setTranslatedManageTraditions(translations[idx++]);
      setTranslatedManageLegends(translations[idx++]);
      setTranslatedManageFoods(translations[idx++]);
      setTranslatedNoBookings(translations[idx++]);
      setTranslatedDeleteReviewConfirm(translations[idx++]);
      setTranslatedReviewDeleted(translations[idx++]);
      setTranslatedDeleteError(translations[idx++]);
      setTranslatedReviewStatusUpdated(translations[idx++]);
      setTranslatedReviewStatusError(translations[idx++]);
      setTranslatedRoleChanged(translations[idx++]);
      setTranslatedAdminRole(translations[idx++]);
      setTranslatedUserRoleText(translations[idx++]);
      setTranslatedRoleError(translations[idx++]);
      setTranslatedUserUnblocked(translations[idx++]);
      setTranslatedUserBlocked(translations[idx++]);
      setTranslatedBlockStatusError(translations[idx++]);
      setTranslatedUserDeleteConfirm(translations[idx++]);
      setTranslatedUserDeleted(translations[idx++]);
      setTranslatedUserDeleteError(translations[idx++]);
      setTranslatedUnblock(translations[idx++]);
      setTranslatedBlock(translations[idx++]);
      setTranslatedDelete(translations[idx++]);
      setTranslatedName(translations[idx++]);
      setTranslatedFirstName(translations[idx++]);
      setTranslatedLastName(translations[idx++]);
      setTranslatedFullName(translations[idx++]);
      setTranslatedNoUsers(translations[idx++]);
      setTranslatedUsersLoadError(translations[idx++]);
      setTranslatedAddRecord(translations[idx++]);
      setTranslatedManageBookingsHeader(translations[idx++]);
      setTranslatedManageReviews(translations[idx++]);
      setTranslatedManageUsersHeader(translations[idx++]);
    };
    translateStaticTexts();
  }, [i18n.language, translateText]);

  const fetchAllPlaces = async () => {
    try {
      const response = await placesAPI.getAll();
      setAllPlaces(response.data);
      setFilteredPlaces(response.data);
      const categories = [...new Set(response.data.map((p) => p.category))];
      setPlaceCategories(categories);
    } catch (error) {
      console.error('Error fetching places:', error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchData();
    fetchAllPlaces();
  }, [isAdmin, isAuthenticated, activeTab]);

  useEffect(() => {
    if (categoryFilter === 'all') {
      setFilteredPlaces(allPlaces);
    } else {
      setFilteredPlaces(allPlaces.filter((p) => p.category === categoryFilter));
    }
  }, [categoryFilter, allPlaces]);

  useEffect(() => {
    if (activeTab === 'places' && data.length > 0) {
      if (categoryFilter === 'all') {
        setFilteredData(data);
      } else {
        setFilteredData(
          data.filter((item) => item.category === categoryFilter),
        );
      }
    } else {
      setFilteredData(data);
    }
  }, [categoryFilter, data, activeTab]);

  useEffect(() => {
    if (activeTab === 'legends' && data.length > 0) {
      const categories = [...new Set(data.map((item) => item.category))];
      setLegendCategories(categories);
      if (legendCategoryFilter === 'all') {
        setFilteredLegends(data);
      } else {
        setFilteredLegends(
          data.filter((item) => item.category === legendCategoryFilter),
        );
      }
    }
  }, [activeTab, data, legendCategoryFilter]);

  useEffect(() => {
    if (activeTab === 'users' && users.length > 0) {
      if (roleFilter === 'all') {
        setFilteredUsers(users);
      } else {
        setFilteredUsers(users.filter((u) => u.role === roleFilter));
      }
    }
  }, [roleFilter, users, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let response;
      switch (activeTab) {
        case 'places':
          response = await placesAPI.getAll();
          setData(response.data);
          break;
        case 'tours':
          response = await toursAPI.getAll();
          setData(response.data);
          break;
        case 'traditions':
          response = await traditionsAPI.getAll();
          setData(response.data);
          break;
        case 'foods':
          response = await foodsAPI.getAll();
          setData(response.data);
          break;
        case 'legends':
          response = await legendsAPI.getAll();
          setData(response.data);
          break;
        case 'bookings':
          try {
            const bookingsResponse = await bookingsAPI.getAll();
            if (
              bookingsResponse &&
              bookingsResponse.data &&
              Array.isArray(bookingsResponse.data)
            ) {
              setBookings(bookingsResponse.data);
            } else if (bookingsResponse && Array.isArray(bookingsResponse)) {
              setBookings(bookingsResponse);
            } else {
              setBookings([]);
            }
            setData([]);
          } catch (err) {
            console.error('Error fetching bookings:', err);
            setBookings([]);
          }
          break;
        case 'feedback':
          response = await feedbackAPI.getAll();
          setFeedback(response.data);
          setData([]);
          break;
        case 'reviews':
          const reviewsRes = await reviewsAPI.getAll();
          setDataReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
          setData([]);
          break;
        case 'users':
          try {
            const usersResponse = await usersAPI.getAll();
            let usersData = [];
            if (usersResponse.data && Array.isArray(usersResponse.data)) {
              usersData = usersResponse.data;
            } else if (
              usersResponse.data &&
              typeof usersResponse.data === 'object'
            ) {
              if (Array.isArray(usersResponse.data.items)) {
                usersData = usersResponse.data.items;
              } else if (Array.isArray(usersResponse.data.users)) {
                usersData = usersResponse.data.users;
              } else if (Array.isArray(usersResponse.data.rows)) {
                usersData = usersResponse.data.rows;
              } else {
                usersData =
                  Object.values(usersResponse.data).filter((v) =>
                    Array.isArray(v),
                  )[0] || [];
              }
            } else if (Array.isArray(usersResponse)) {
              usersData = usersResponse;
            }
            setUsers(usersData);
            setData([]);
            const roles = ['admin', 'user'];
            setUserRoles(roles);
            if (usersData.length === 0) {
              setError(translatedNoUsers);
            } else {
              setError('');
            }
          } catch (err: any) {
            console.error('Error fetching users:', err);
            setError(err.response?.data?.message || translatedUsersLoadError);
            setUsers([]);
          }
          break;
        default:
          response = await placesAPI.getAll();
          setData(response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const handleUpdateUserRole = async (userId: number, newRole: string) => {
    try {
      await usersAPI.updateRole(userId, newRole);
      await fetchData();
      setSuccess(
        `${translatedRoleChanged} ${newRole === 'admin' ? translatedAdminRole : translatedUserRoleText}`,
      );
    } catch (error: any) {
      setError(error.response?.data?.message || translatedRoleError);
    }
  };

  const handleToggleUserBlock = async (userId: number, isBlocked: boolean) => {
    try {
      await usersAPI.toggleBlock(userId);
      await fetchData();
      setSuccess(isBlocked ? translatedUserUnblocked : translatedUserBlocked);
    } catch (error: any) {
      setError(error.response?.data?.message || translatedBlockStatusError);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm(translatedUserDeleteConfirm)) return;
    try {
      await usersAPI.delete(userId);
      await fetchData();
      setSuccess(translatedUserDeleted);
    } catch (error: any) {
      setError(error.response?.data?.message || translatedUserDeleteError);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData(getInitialFormData(activeTab));
    setRoutePoints([]);
    setSelectedPlaceId('');
    setDialogOpen(true);
    setError('');
    setSuccess('');
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    const editFormData = { ...item };
    if (activeTab === 'legends') {
      editFormData.latitude = item.latitude || '';
      editFormData.longitude = item.longitude || '';
    }
    if (activeTab === 'traditions') {
      if (item.celebration_date && typeof item.celebration_date === 'string') {
        const parts = item.celebration_date.split('.');
        if (parts.length === 2) {
          editFormData.celebration_day = parseInt(parts[0]);
          editFormData.celebration_month = parseInt(parts[1]);
        }
      } else {
        editFormData.celebration_day = item.celebration_day || '';
        editFormData.celebration_month = item.celebration_month || '';
      }
    }
    setFormData(editFormData);
    if (activeTab === 'tours') {
      let points: RoutePoint[] = [];
      if (item.route_points) {
        if (Array.isArray(item.route_points)) {
          points = item.route_points;
        } else if (typeof item.route_points === 'string') {
          try {
            const parsed = JSON.parse(item.route_points);
            points = Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            points = [];
          }
        }
      }
      setRoutePoints(points);
    } else {
      setRoutePoints([]);
    }
    setSelectedPlaceId('');
    setDialogOpen(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id: number) => {
    if (!confirm(translatedDeleteConfirm)) return;
    try {
      switch (activeTab) {
        case 'places':
          await placesAPI.delete(id);
          break;
        case 'tours':
          await toursAPI.delete(id);
          break;
        case 'traditions':
          await traditionsAPI.delete(id);
          break;
        case 'foods':
          await foodsAPI.delete(id);
          break;
        case 'legends':
          await legendsAPI.delete(id);
          break;
        case 'reviews':
          await reviewsAPI.delete(id);
          break;
      }
      fetchData();
      fetchAllPlaces();
      setSuccess(translatedSuccessDeleted);
    } catch (error: any) {
      setError(error.response?.data?.message || translatedErrorDelete);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const submitData = { ...formData };
    if (activeTab === 'tours') {
      const pointsToSave =
        routePoints.length > 0 ? JSON.stringify(routePoints) : null;
      submitData.route_points = pointsToSave;
    }
    if (activeTab === 'traditions') {
      delete submitData.celebration_date_temp;
      if (formData.celebration_day && formData.celebration_month) {
        const day = parseInt(formData.celebration_day);
        const month = parseInt(formData.celebration_month);
        if (
          !isNaN(day) &&
          !isNaN(month) &&
          day >= 1 &&
          day <= 31 &&
          month >= 1 &&
          month <= 12
        ) {
          submitData.celebration_day = day;
          submitData.celebration_month = month;
          submitData.celebration_date = `${day.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}`;
        } else {
          submitData.celebration_day = null;
          submitData.celebration_month = null;
          submitData.celebration_date = null;
        }
      } else {
        submitData.celebration_day = null;
        submitData.celebration_month = null;
        submitData.celebration_date = null;
      }
    }
    if (activeTab === 'legends') {
      submitData.latitude =
        formData.latitude && formData.latitude !== ''
          ? parseFloat(formData.latitude)
          : null;
      submitData.longitude =
        formData.longitude && formData.longitude !== ''
          ? parseFloat(formData.longitude)
          : null;
      if (submitData.latitude === null) delete submitData.latitude;
      if (submitData.longitude === null) delete submitData.longitude;
    }
    try {
      if (editingItem) {
        switch (activeTab) {
          case 'places':
            await placesAPI.update(editingItem.id, submitData);
            break;
          case 'tours':
            await toursAPI.update(editingItem.id, submitData);
            break;
          case 'traditions':
            await traditionsAPI.update(editingItem.id, submitData);
            break;
          case 'foods':
            await foodsAPI.update(editingItem.id, submitData);
            break;
          case 'legends':
            await legendsAPI.update(editingItem.id, submitData);
            break;
        }
        setSuccess(translatedSuccessUpdated);
      } else {
        switch (activeTab) {
          case 'places':
            await placesAPI.create(submitData);
            break;
          case 'tours':
            await toursAPI.create(submitData);
            break;
          case 'traditions':
            await traditionsAPI.create(submitData);
            break;
          case 'foods':
            await foodsAPI.create(submitData);
            break;
          case 'legends':
            await legendsAPI.create(submitData);
            break;
        }
        setSuccess(translatedSuccessCreated);
      }
      setDialogOpen(false);
      fetchData();
      fetchAllPlaces();
    } catch (error: any) {
      console.error('Ошибка сохранения:', error);
      setError(error.response?.data?.message || translatedErrorSave);
    }
  };

  const addRoutePointFromPlace = () => {
    if (!selectedPlaceId) return;
    const place = filteredPlaces.find(
      (p) => p.id === parseInt(selectedPlaceId),
    );
    if (!place) return;
    if (routePoints.some((p) => p.id === place.id)) {
      setError(translatedPointAlreadyExists);
      return;
    }
    setRoutePoints([
      ...routePoints,
      {
        id: place.id,
        name: place.name,
        lat: place.latitude,
        lng: place.longitude,
        description: place.description,
        category: place.category,
      },
    ]);
    setSelectedPlaceId('');
    setError('');
  };

  const removeRoutePoint = (index: number) => {
    setRoutePoints((prev) => prev.filter((_, i) => i !== index));
  };

  const moveRoutePoint = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newPoints = [...routePoints];
      [newPoints[index - 1], newPoints[index]] = [
        newPoints[index],
        newPoints[index - 1],
      ];
      setRoutePoints(newPoints);
    } else if (direction === 'down' && index < routePoints.length - 1) {
      const newPoints = [...routePoints];
      [newPoints[index + 1], newPoints[index]] = [
        newPoints[index],
        newPoints[index + 1],
      ];
      setRoutePoints(newPoints);
    }
  };

  const handleUpdateBookingStatus = async (
    bookingId: number,
    status: string,
  ) => {
    try {
      await bookingsAPI.updateStatus(bookingId, status);
      fetchData();
      setSuccess(translatedSuccessBookingStatus);
    } catch (error: any) {
      setError(error.response?.data?.message || translatedErrorUpdateStatus);
    }
  };

  const handleRespondToFeedback = async () => {
    if (!selectedFeedback || !responseText) return;
    try {
      await feedbackAPI.respond(selectedFeedback.id, responseText);
      fetchData();
      setResponseDialogOpen(false);
      setResponseText('');
      setSuccess(translatedSuccessResponseSent);
    } catch (error: any) {
      setError(error.response?.data?.message || translatedErrorSendResponse);
    }
  };

  const handleEditReview = (review: any) => {
    setReviewFormData({
      id: review.id,
      is_approved: review.is_approved,
      is_featured: review.is_featured,
    });
    setReviewDialogOpen(true);
  };

  const handleDeleteReview = async (id: number) => {
    if (!confirm(translatedDeleteReviewConfirm)) return;
    try {
      await reviewsAPI.delete(id);
      fetchData();
      setSuccess(translatedReviewDeleted);
    } catch (error) {
      setError(translatedDeleteError);
    }
  };

  const handleUpdateReviewStatus = async () => {
    try {
      await reviewsAPI.updateStatus(reviewFormData.id, {
        is_approved: reviewFormData.is_approved,
        is_featured: reviewFormData.is_featured,
      });
      setReviewDialogOpen(false);
      fetchData();
      setSuccess(translatedReviewStatusUpdated);
    } catch (error) {
      setError(translatedReviewStatusError);
    }
  };

  const getInitialFormData = (tab: string) => {
    switch (tab) {
      case 'places':
        return {
          name: '',
          description: '',
          history: '',
          latitude: '',
          longitude: '',
          category: '',
          image_url: '',
        };
      case 'tours':
        return {
          title: '',
          description: '',
          duration: '',
          price: '',
          image_url: '',
          max_participants: 10,
          included: '',
          not_included: '',
          schedule: '',
        };
      case 'traditions':
        return {
          title: '',
          description: '',
          category: '',
          image_url: '',
          celebration_day: '',
          celebration_month: '',
          celebration_date: '',
        };
      case 'foods':
        return {
          name: '',
          description: '',
          ingredients: '',
          recipe: '',
          category: '',
          image_url: '',
        };
      case 'legends':
        return {
          title: '',
          content: '',
          origin: '',
          category: '',
          image_url: '',
          latitude: '',
          longitude: '',
        };
      default:
        return {};
    }
  };

  const getColumns = () => {
    switch (activeTab) {
      case 'places':
        return [
          translatedId,
          translatedPlaceName,
          translatedCategory,
          translatedCoordinates,
          translatedActions,
        ];
      case 'tours':
        return [
          translatedId,
          translatedTourTitle,
          translatedPrice,
          translatedDuration,
          translatedRoutePoints,
          translatedStatus,
          translatedActions,
        ];
      case 'traditions':
        return [
          translatedId,
          translatedTitle,
          translatedCategory,
          translatedCelebrationDate,
          translatedActions,
        ];
      case 'legends':
        return [
          translatedId,
          translatedTitle,
          translatedCategory,
          translatedOrigin,
          translatedCoordinates,
          translatedActions,
        ];
      case 'foods':
        return [
          translatedId,
          translatedName,
          translatedCategory,
          translatedActions,
        ];
      case 'bookings':
        return [
          translatedId,
          translatedTour,
          translatedClient,
          translatedDate,
          translatedSum,
          translatedStatus,
          translatedActions,
        ];
      case 'feedback':
        return [
          translatedId,
          translatedSubject,
          translatedSender,
          translatedStatus,
          translatedActions,
        ];
      case 'reviews':
        return [
          translatedId,
          translatedUserName,
          translatedEmail,
          translatedRating,
          translatedReviewText,
          translatedStatus,
          translatedOnMain,
          translatedActions,
        ];
      case 'users':
        return [
          translatedId,
          translatedFullName,
          translatedEmail,
          translatedRole,
          translatedStatus,
          translatedRegistrationDate,
          translatedActions,
        ];
      default:
        return [];
    }
  };

  const getStatusBadge = (status: string) => {
    let displayStatus = status;
    if (status === 'confirmed')
      displayStatus = translatedBookingStatusConfirmed;
    if (status === 'cancelled')
      displayStatus = translatedBookingStatusCancelled;
    if (status === 'pending') displayStatus = translatedBookingStatusPending;
    if (status === 'new') displayStatus = translatedFeedbackStatusNew;
    if (status === 'responded')
      displayStatus = translatedFeedbackStatusResponded;
    const styles: any = {
      new: 'bg-blue-100 text-blue-700',
      responded: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return (
      <Badge className={styles[status] || 'bg-gray-100'}>{displayStatus}</Badge>
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderFormFields = () => {
    switch (activeTab) {
      case 'traditions':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  {translatedTitle}
                </Label>
                <Input
                  value={formData.title || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="w-full py-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  {translatedCategory}
                </Label>
                <Input
                  value={formData.category || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full py-2"
                />
              </div>
            </div>
            <div className="border rounded-xl p-4 bg-gray-50 space-y-3">
              <Label className="font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                {translatedCelebrationDate}
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">{translatedDay}</Label>
                  <select
                    value={formData.celebration_day || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        celebration_day: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="">--</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-sm">{translatedMonth}</Label>
                  <select
                    value={formData.celebration_month || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        celebration_month: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="">--</option>
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {formData.celebration_day && formData.celebration_month && (
                <div className="mt-2 p-2 bg-blue-100 rounded-lg text-center">
                  <span className="text-sm font-medium text-blue-700">
                    📅 {formData.celebration_day.toString().padStart(2, '0')}.
                    {formData.celebration_month.toString().padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold">
                {translatedContent}
              </Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={8}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold">
                {translatedImageUrl}
              </Label>
              <Input
                value={formData.image_url || ''}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                className="w-full py-2"
              />
            </div>
          </div>
        );
      case 'tours':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  {translatedTourTitle}
                </Label>
                <Input
                  value={formData.title || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="w-full py-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  {translatedPrice}
                </Label>
                <Input
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value),
                    })
                  }
                  required
                  className="w-full py-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  {translatedDuration}
                </Label>
                <Input
                  value={formData.duration || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  placeholder="2 дня"
                  className="w-full py-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  {translatedMaxParticipants}
                </Label>
                <Input
                  type="number"
                  value={formData.max_participants || 10}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_participants: parseInt(e.target.value),
                    })
                  }
                  className="w-full py-2"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold">
                {translatedDescription}
              </Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  {translatedWhatIncluded}
                </Label>
                <Textarea
                  value={formData.included || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, included: e.target.value })
                  }
                  rows={4}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  {translatedWhatNotIncluded}
                </Label>
                <Textarea
                  value={formData.not_included || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, not_included: e.target.value })
                  }
                  rows={4}
                  className="w-full"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold">
                {translatedTourProgram}
              </Label>
              <Textarea
                value={formData.schedule || ''}
                onChange={(e) =>
                  setFormData({ ...formData, schedule: e.target.value })
                }
                rows={6}
                className="w-full"
              />
            </div>
            <div className="border rounded-xl p-5 bg-gray-50 space-y-3">
              <Label className="font-semibold text-base flex items-center gap-2">
                <Route className="w-5 h-5 text-blue-500" />
                {translatedRoutePoints}
              </Label>
              <div className="flex gap-2">
                <select
                  value={selectedPlaceId}
                  onChange={(e) => setSelectedPlaceId(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value="">{translatedChoosePlace}</option>
                  {filteredPlaces.map((place) => (
                    <option key={place.id} value={place.id}>
                      {place.name} ({place.category})
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  onClick={addRoutePointFromPlace}
                  variant="outline"
                  className="border-blue-300 text-blue-600"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {translatedAddPoint}
                </Button>
              </div>
              {routePoints.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-4">
                  {translatedNoRoutePoints}
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {routePoints.map((point, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-white p-3 rounded-lg border"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                            {index + 1}
                          </span>
                          {point.name}
                          <Badge variant="outline" className="text-xs">
                            {point.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => moveRoutePoint(index, 'up')}
                          disabled={index === 0}
                          className="h-7 w-7 p-0"
                        >
                          ↑
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => moveRoutePoint(index, 'down')}
                          disabled={index === routePoints.length - 1}
                          className="h-7 w-7 p-0"
                        >
                          ↓
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeRoutePoint(index)}
                          className="h-7 w-7 p-0"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-6 items-end">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_active !== false}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-300"
                />
                <Label className="text-base">{translatedTourActive}</Label>
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  {translatedImageUrl}
                </Label>
                <Input
                  value={formData.image_url || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                  className="w-full py-2"
                />
              </div>
            </div>
          </div>
        );
      case 'places':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  {translatedPlaceName}
                </Label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full py-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  {translatedCategory}
                </Label>
                <Input
                  value={formData.category || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full py-2"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold">
                {translatedDescription}
              </Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  {translatedLatitude}
                </Label>
                <Input
                  type="number"
                  step="any"
                  value={formData.latitude || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      latitude: parseFloat(e.target.value),
                    })
                  }
                  required
                  className="w-full py-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  {translatedLongitude}
                </Label>
                <Input
                  type="number"
                  step="any"
                  value={formData.longitude || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      longitude: parseFloat(e.target.value),
                    })
                  }
                  required
                  className="w-full py-2"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold">
                {translatedHistory}
              </Label>
              <Textarea
                value={formData.history || ''}
                onChange={(e) =>
                  setFormData({ ...formData, history: e.target.value })
                }
                rows={5}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold">
                {translatedImageUrl}
              </Label>
              <Input
                value={formData.image_url || ''}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                className="w-full py-2"
              />
            </div>
          </div>
        );
      case 'legends':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  {translatedTitle}
                </Label>
                <Input
                  value={formData.title || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="w-full py-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  {translatedCategory}
                </Label>
                <Input
                  value={formData.category || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full py-2"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold">
                {translatedContent}
              </Label>
              <Textarea
                value={formData.content || ''}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={8}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold">
                {translatedOrigin}
              </Label>
              <Input
                value={formData.origin || ''}
                onChange={(e) =>
                  setFormData({ ...formData, origin: e.target.value })
                }
                className="w-full py-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  {translatedLatitude}
                </Label>
                <Input
                  type="number"
                  step="any"
                  value={formData.latitude || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, latitude: e.target.value })
                  }
                  placeholder="53.9045"
                  className="w-full py-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  {translatedLongitude}
                </Label>
                <Input
                  type="number"
                  step="any"
                  value={formData.longitude || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, longitude: e.target.value })
                  }
                  placeholder="27.5615"
                  className="w-full py-2"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold">
                {translatedImageUrl}
              </Label>
              <Input
                value={formData.image_url || ''}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
                className="w-full py-2"
              />
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  {translatedTitle}
                </Label>
                <Input
                  value={formData.title || formData.name || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: e.target.value,
                      name: e.target.value,
                    })
                  }
                  required
                  className="w-full py-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  {translatedCategory}
                </Label>
                <Input
                  value={formData.category || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full py-2"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold">
                {translatedContent}
              </Label>
              <Textarea
                value={formData.description || formData.content || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                    content: e.target.value,
                  })
                }
                rows={8}
                className="w-full"
              />
            </div>
            {activeTab === 'foods' && (
              <>
                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    {translatedIngredients}
                  </Label>
                  <Textarea
                    value={formData.ingredients || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, ingredients: e.target.value })
                    }
                    rows={5}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    {translatedRecipe}
                  </Label>
                  <Textarea
                    value={formData.recipe || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, recipe: e.target.value })
                    }
                    rows={8}
                    className="w-full"
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label className="text-base font-semibold">
                {translatedImageUrl}
              </Label>
              <Input
                value={formData.image_url || ''}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                className="w-full py-2"
              />
            </div>
          </div>
        );
    }
  };

  if (!isAdmin) return null;

  const displayData = activeTab === 'places' ? filteredData : data;
  const displayLegendsData = activeTab === 'legends' ? filteredLegends : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-12">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Mir_Castle_2018.jpg/1920px-Mir_Castle_2018.jpg')] bg-cover bg-center opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/50" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2 text-white">
                <Shield className="w-8 h-8 text-blue-400" />
                {translatedAdminPanel}
              </h1>
              <p className="text-white/70 mt-1">{translatedManageContent}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-white text-sm">
                  {user?.firstName} {user?.lastName}
                </span>
                <Badge className="bg-yellow-500 text-yellow-900">ADMIN</Badge>
              </div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {translatedLogout}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 bg-green-100 border-green-300">
            <Check className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Адаптивные вкладки - на ПК как обычно, на мобильных горизонтальная прокрутка */}
        <div className="mb-6 overflow-x-auto lg:overflow-x-visible pb-2 -mx-3 lg:mx-0 px-3 lg:px-0">
          <div className="flex flex-nowrap lg:flex-wrap gap-1.5 lg:gap-2 min-w-max lg:min-w-0">
            <button
              onClick={() => setActiveTab('places')}
              className={`whitespace-nowrap rounded-full px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-medium transition-all duration-300 flex items-center gap-1 lg:gap-2 ${
                activeTab === 'places'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MapPin className="w-3 h-3 lg:w-4 lg:h-4" />
              {translatedPlaces}
            </button>
            <button
              onClick={() => setActiveTab('tours')}
              className={`whitespace-nowrap rounded-full px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-medium transition-all duration-300 flex items-center gap-1 lg:gap-2 ${
                activeTab === 'tours'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-3 h-3 lg:w-4 lg:h-4" />
              {translatedTours}
            </button>
            <button
              onClick={() => setActiveTab('traditions')}
              className={`whitespace-nowrap rounded-full px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-medium transition-all duration-300 flex items-center gap-1 lg:gap-2 ${
                activeTab === 'traditions'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BookOpen className="w-3 h-3 lg:w-4 lg:h-4" />
              {translatedTraditions}
            </button>
            <button
              onClick={() => setActiveTab('foods')}
              className={`whitespace-nowrap rounded-full px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-medium transition-all duration-300 flex items-center gap-1 lg:gap-2 ${
                activeTab === 'foods'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Utensils className="w-3 h-3 lg:w-4 lg:h-4" />
              {translatedFoods}
            </button>
            <button
              onClick={() => setActiveTab('legends')}
              className={`whitespace-nowrap rounded-full px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-medium transition-all duration-300 flex items-center gap-1 lg:gap-2 ${
                activeTab === 'legends'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Scroll className="w-3 h-3 lg:w-4 lg:h-4" />
              {translatedLegends}
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`whitespace-nowrap rounded-full px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-medium transition-all duration-300 flex items-center gap-1 lg:gap-2 ${
                activeTab === 'bookings'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-3 h-3 lg:w-4 lg:h-4" />
              {translatedBookings}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`whitespace-nowrap rounded-full px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-medium transition-all duration-300 flex items-center gap-1 lg:gap-2 ${
                activeTab === 'reviews'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Star className="w-3 h-3 lg:w-4 lg:h-4" />
              {translatedReviews}
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`whitespace-nowrap rounded-full px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-medium transition-all duration-300 flex items-center gap-1 lg:gap-2 ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <UserCog className="w-3 h-3 lg:w-4 lg:h-4" />
              {translatedUsers}
            </button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value={activeTab}>
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-gray-50 to-white border-b py-4">
                <CardTitle className="text-xl text-gray-800">
                  {activeTab === 'bookings'
                    ? translatedManageBookingsHeader
                    : activeTab === 'feedback'
                      ? translatedUserFeedback
                      : activeTab === 'reviews'
                        ? translatedManageReviews
                        : activeTab === 'users'
                          ? translatedManageUsersHeader
                          : activeTab === 'places'
                            ? translatedManagePlaces
                            : activeTab === 'tours'
                              ? translatedManageTours
                              : activeTab === 'traditions'
                                ? translatedManageTraditions
                                : activeTab === 'legends'
                                  ? translatedManageLegends
                                  : activeTab === 'foods'
                                    ? translatedManageFoods
                                    : `${translatedManagePrefix} ${activeTab}`}
                </CardTitle>
                <div className="flex items-center gap-3">
                  {activeTab === 'places' && placeCategories.length > 0 && (
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="bg-transparent text-sm focus:outline-none"
                      >
                        <option value="all">{translatedAllCategories}</option>
                        {placeCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {activeTab === 'legends' && legendCategories.length > 0 && (
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <select
                        value={legendCategoryFilter}
                        onChange={(e) =>
                          setLegendCategoryFilter(e.target.value)
                        }
                        className="bg-transparent text-sm focus:outline-none"
                      >
                        <option value="all">{translatedAllCategories}</option>
                        {legendCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {activeTab === 'users' && userRoles.length > 0 && (
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="bg-transparent text-sm focus:outline-none"
                      >
                        <option value="all">{translatedAllCategories}</option>
                        <option value="admin">{translatedAdmin}</option>
                        <option value="user">{translatedUserRole}</option>
                      </select>
                    </div>
                  )}
                  {activeTab !== 'bookings' &&
                    activeTab !== 'feedback' &&
                    activeTab !== 'reviews' &&
                    activeTab !== 'users' && (
                      <Button
                        onClick={handleAdd}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {translatedAdd}
                      </Button>
                    )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          {getColumns().map((col) => (
                            <TableHead
                              key={col}
                              className="font-semibold text-gray-700"
                            >
                              {col}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeTab === 'bookings' ? (
                          Array.isArray(bookings) && bookings.length > 0 ? (
                            bookings.map((booking) => (
                              <TableRow key={booking.id}>
                                <TableCell>{booking.id}</TableCell>
                                <TableCell className="font-medium">
                                  {booking.tour_title}
                                </TableCell>
                                <TableCell>{booking.user_email}</TableCell>
                                <TableCell>
                                  {new Date(
                                    booking.booking_date,
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell>{booking.total_price} BYN</TableCell>
                                <TableCell>
                                  {getStatusBadge(booking.status)}
                                </TableCell>
                                <TableCell>
                                  {booking.status === 'pending' && (
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          handleUpdateBookingStatus(
                                            booking.id,
                                            'confirmed',
                                          )
                                        }
                                        className="bg-green-500 hover:bg-green-600"
                                      >
                                        ✓
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() =>
                                          handleUpdateBookingStatus(
                                            booking.id,
                                            'cancelled',
                                          )
                                        }
                                      >
                                        ✗
                                      </Button>
                                    </div>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={7}
                                className="text-center py-8 text-gray-500"
                              >
                                {translatedNoBookings}
                              </TableCell>
                            </TableRow>
                          )
                        ) : activeTab === 'reviews' ? (
                          (Array.isArray(dataReviews) ? dataReviews : []).map(
                            (item) => (
                              <TableRow key={item.id}>
                                <TableCell>{item.id}</TableCell>
                                <TableCell className="font-medium">
                                  {item.user_name}
                                </TableCell>
                                <TableCell>{item.user_email || '-'}</TableCell>
                                <TableCell>
                                  <div className="flex gap-0.5">
                                    {Array.from({ length: 5 }, (_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < item.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                      />
                                    ))}
                                  </div>
                                </TableCell>
                                <TableCell className="min-w-[200px] sm:min-w-[300px]">
                                  <div className="text-sm text-gray-700 break-words whitespace-normal">
                                    {item.text}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={
                                      item.is_approved
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                    }
                                  >
                                    {item.is_approved
                                      ? translatedApproved
                                      : translatedPending}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {item.is_featured ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <X className="w-4 h-4 text-gray-400" />
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEditReview(item)}
                                      className="border-blue-300 text-blue-600"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() =>
                                        handleDeleteReview(item.id)
                                      }
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ),
                          )
                        ) : activeTab === 'users' ? (
                          (Array.isArray(filteredUsers)
                            ? filteredUsers
                            : []
                          ).map((userItem) => (
                            <TableRow key={userItem.id}>
                              <TableCell>{userItem.id}</TableCell>
                              <TableCell className="font-medium">
                                {userItem.first_name} {userItem.last_name}
                              </TableCell>
                              <TableCell>{userItem.email}</TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    userItem.role === 'admin'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }
                                >
                                  {userItem.role === 'admin'
                                    ? translatedAdmin
                                    : translatedUserRole}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {userItem.is_blocked ? (
                                  <Badge className="bg-red-100 text-red-700 gap-1">
                                    <Ban className="w-3 h-3 inline mr-1" />
                                    {translatedBlocked}
                                  </Badge>
                                ) : (
                                  <Badge className="bg-green-100 text-green-700 gap-1">
                                    <Check className="w-3 h-3 inline mr-1" />
                                    {translatedActiveUser}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-sm">
                                {new Date(
                                  userItem.created_at,
                                ).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <select
                                    value={userItem.role}
                                    onChange={(e) =>
                                      handleUpdateUserRole(
                                        userItem.id,
                                        e.target.value,
                                      )
                                    }
                                    className="text-sm border rounded px-2 py-1 bg-white"
                                    title={translatedChangeRole}
                                  >
                                    <option value="user">
                                      {translatedUserRole}
                                    </option>
                                    <option value="admin">
                                      {translatedAdmin}
                                    </option>
                                  </select>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleToggleUserBlock(
                                        userItem.id,
                                        userItem.is_blocked,
                                      )
                                    }
                                    className={
                                      userItem.is_blocked
                                        ? 'border-green-300 text-green-600'
                                        : 'border-yellow-300 text-yellow-600'
                                    }
                                    title={
                                      userItem.is_blocked
                                        ? translatedUnblock
                                        : translatedBlock
                                    }
                                  >
                                    {userItem.is_blocked ? (
                                      <Unlock className="w-4 h-4" />
                                    ) : (
                                      <Ban className="w-4 h-4" />
                                    )}
                                  </Button>
                                  {userItem.role !== 'admin' && (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() =>
                                        handleDeleteUser(userItem.id)
                                      }
                                      title={translatedDelete}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : activeTab === 'traditions' ? (
                          displayData.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.id}</TableCell>
                              <TableCell className="font-medium">
                                {item.title}
                              </TableCell>
                              <TableCell>{item.category}</TableCell>
                              <TableCell>
                                {item.celebration_date ? (
                                  <Badge className="bg-blue-100 text-blue-700 gap-1">
                                    <Calendar className="w-3 h-3" />{' '}
                                    {item.celebration_date}
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="bg-gray-100 text-gray-500"
                                  >
                                    {translatedNoDate}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEdit(item)}
                                    className="border-blue-300 text-blue-600"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(item.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : activeTab === 'legends' ? (
                          displayLegendsData.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.id}</TableCell>
                              <TableCell className="font-medium">
                                {item.title}
                              </TableCell>
                              <TableCell>{item.category}</TableCell>
                              <TableCell>{item.origin || '-'}</TableCell>
                              <TableCell>
                                {item.latitude && item.longitude ? (
                                  <Badge className="bg-green-100 text-green-700">
                                    {typeof item.latitude === 'number'
                                      ? item.latitude.toFixed(4)
                                      : item.latitude}
                                    ,{' '}
                                    {typeof item.longitude === 'number'
                                      ? item.longitude.toFixed(4)
                                      : item.longitude}
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="bg-gray-100 text-gray-500"
                                  >
                                    {translatedNoDate}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEdit(item)}
                                    className="border-blue-300 text-blue-600"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(item.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          displayData.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.id}</TableCell>
                              <TableCell className="font-medium">
                                {item.name || item.title}
                              </TableCell>
                              <TableCell>
                                {item.category ||
                                  (item.is_active !== undefined
                                    ? item.is_active
                                      ? translatedActive
                                      : translatedInactive
                                    : '-')}
                              </TableCell>
                              {activeTab === 'places' && (
                                <TableCell>
                                  {item.latitude}, {item.longitude}
                                </TableCell>
                              )}
                              {activeTab === 'tours' && (
                                <>
                                  <TableCell>{item.price} BYN</TableCell>
                                  <TableCell>{item.duration}</TableCell>
                                  <TableCell>
                                    {item.route_points ? (
                                      <Badge className="bg-green-100 text-green-700">
                                        <Route className="w-3 h-3 mr-1 inline" />
                                        {(() => {
                                          try {
                                            const points =
                                              typeof item.route_points ===
                                              'string'
                                                ? JSON.parse(item.route_points)
                                                : item.route_points;
                                            return Array.isArray(points)
                                              ? `${points.length} ${translatedPointsCount}`
                                              : translatedHasRoute;
                                          } catch {
                                            return translatedHasRoute;
                                          }
                                        })()}
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant="outline"
                                        className="bg-gray-100 text-gray-500"
                                      >
                                        {translatedNoRoute}
                                      </Badge>
                                    )}
                                  </TableCell>
                                </>
                              )}
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEdit(item)}
                                    className="border-blue-300 text-blue-600"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(item.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="max-w-[95vw] w-[95vw] rounded-2xl"
          style={{ maxWidth: '85vw', width: '85vw' }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2 pb-4 border-b">
              {editingItem ? (
                <Edit className="w-6 h-6 text-blue-500" />
              ) : (
                <Plus className="w-6 h-6 text-blue-500" />
              )}
              {editingItem ? translatedEdit : translatedAdd}{' '}
              {translatedAddRecord}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit}
            className="space-y-6 max-h-[75vh] overflow-y-auto px-1"
          >
            {renderFormFields()}
            <div className="flex justify-end gap-3 pt-4 border-t mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="px-6 py-2"
              >
                {translatedCancel}
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-6 py-2"
              >
                {editingItem ? translatedSave : translatedCreate}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>{translatedResponseToFeedback}</DialogTitle>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">{selectedFeedback.subject}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {selectedFeedback.message}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {translatedFrom}{' '}
                  {selectedFeedback.user_email ||
                    selectedFeedback.user_name ||
                    translatedAnonym}
                </p>
              </div>
              <div>
                <Label>{translatedYourResponse}</Label>
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder={translatedYourResponse}
                  rows={4}
                  className="rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setResponseDialogOpen(false)}
                >
                  {translatedCancel}
                </Button>
                <Button
                  onClick={handleRespondToFeedback}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500"
                  disabled={!responseText}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {translatedSend}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>{translatedEditReviewTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{translatedApprovedLabel}</Label>
              <select
                value={reviewFormData.is_approved ? 'approved' : 'pending'}
                onChange={(e) =>
                  setReviewFormData({
                    ...reviewFormData,
                    is_approved: e.target.value === 'approved',
                  })
                }
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="pending">{translatedModeration}</option>
                <option value="approved">{translatedApprovedStatus}</option>
              </select>
            </div>
            <div>
              <Label>{translatedOnMainLabel}</Label>
              <select
                value={reviewFormData.is_featured ? 'yes' : 'no'}
                onChange={(e) =>
                  setReviewFormData({
                    ...reviewFormData,
                    is_featured: e.target.value === 'yes',
                  })
                }
                className="w-full border rounded-lg px-3 py-2"
                disabled={!reviewFormData.is_approved}
              >
                <option value="no">{translatedNo}</option>
                <option value="yes">{translatedYes}</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {translatedOnlyApprovedHint}
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setReviewDialogOpen(false)}
              >
                {translatedCancelBtn}
              </Button>
              <Button
                onClick={handleUpdateReviewStatus}
                className="bg-blue-500"
              >
                {translatedSaveBtn}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
