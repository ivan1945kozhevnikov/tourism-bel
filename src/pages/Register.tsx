import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Loader2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAutoTranslate } from '@/hooks/useAutoTranslate';

const Register: React.FC = () => {
  const { i18n } = useTranslation();
  const { translateText } = useAutoTranslate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Состояния для переведенных текстов
  const [translatedTitle, setTranslatedTitle] = useState('Регистрация');
  const [translatedDescription, setTranslatedDescription] = useState(
    'Создайте аккаунт, чтобы бронировать туры',
  );
  const [translatedFirstName, setTranslatedFirstName] = useState('Имя');
  const [translatedLastName, setTranslatedLastName] = useState('Фамилия');
  const [translatedFirstNamePlaceholder, setTranslatedFirstNamePlaceholder] =
    useState('Иван');
  const [translatedLastNamePlaceholder, setTranslatedLastNamePlaceholder] =
    useState('Иванов');
  const [translatedEmail, setTranslatedEmail] = useState('Email');
  const [translatedPassword, setTranslatedPassword] = useState('Пароль');
  const [translatedPasswordPlaceholder, setTranslatedPasswordPlaceholder] =
    useState('Минимум 6 символов');
  const [translatedConfirmPassword, setTranslatedConfirmPassword] =
    useState('Подтвердите пароль');
  const [
    translatedConfirmPasswordPlaceholder,
    setTranslatedConfirmPasswordPlaceholder,
  ] = useState('Повторите пароль');
  const [translatedRegisterBtn, setTranslatedRegisterBtn] =
    useState('Зарегистрироваться');
  const [translatedRegistering, setTranslatedRegistering] =
    useState('Регистрация...');
  const [translatedHaveAccount, setTranslatedHaveAccount] =
    useState('Уже есть аккаунт?');
  const [translatedLogin, setTranslatedLogin] = useState('Войти');
  const [translatedRegisterError, setTranslatedRegisterError] =
    useState('Ошибка регистрации');
  const [translatedPasswordMismatch, setTranslatedPasswordMismatch] = useState(
    'Пароли не совпадают',
  );
  const [translatedPasswordMinLength, setTranslatedPasswordMinLength] =
    useState('Пароль должен быть не менее 6 символов');
  const [translatedLanguageRu, setTranslatedLanguageRu] = useState('Русский');
  const [translatedLanguageEn, setTranslatedLanguageEn] = useState('English');
  const [translatedLanguageBe, setTranslatedLanguageBe] =
    useState('Беларуская');

  // Перевод статических текстов
  useEffect(() => {
    const translateStaticTexts = async () => {
      const translations = await Promise.all([
        translateText('Регистрация'),
        translateText('Создайте аккаунт, чтобы бронировать туры'),
        translateText('Имя'),
        translateText('Фамилия'),
        translateText('Иван'),
        translateText('Иванов'),
        translateText('Email'),
        translateText('Пароль'),
        translateText('Минимум 6 символов'),
        translateText('Подтвердите пароль'),
        translateText('Повторите пароль'),
        translateText('Зарегистрироваться'),
        translateText('Регистрация...'),
        translateText('Уже есть аккаунт?'),
        translateText('Войти'),
        translateText('Ошибка регистрации'),
        translateText('Пароли не совпадают'),
        translateText('Пароль должен быть не менее 6 символов'),
        translateText('Русский'),
        translateText('English'),
        translateText('Беларуская'),
      ]);

      let idx = 0;
      setTranslatedTitle(translations[idx++]);
      setTranslatedDescription(translations[idx++]);
      setTranslatedFirstName(translations[idx++]);
      setTranslatedLastName(translations[idx++]);
      setTranslatedFirstNamePlaceholder(translations[idx++]);
      setTranslatedLastNamePlaceholder(translations[idx++]);
      setTranslatedEmail(translations[idx++]);
      setTranslatedPassword(translations[idx++]);
      setTranslatedPasswordPlaceholder(translations[idx++]);
      setTranslatedConfirmPassword(translations[idx++]);
      setTranslatedConfirmPasswordPlaceholder(translations[idx++]);
      setTranslatedRegisterBtn(translations[idx++]);
      setTranslatedRegistering(translations[idx++]);
      setTranslatedHaveAccount(translations[idx++]);
      setTranslatedLogin(translations[idx++]);
      setTranslatedRegisterError(translations[idx++]);
      setTranslatedPasswordMismatch(translations[idx++]);
      setTranslatedPasswordMinLength(translations[idx++]);
      setTranslatedLanguageRu(translations[idx++]);
      setTranslatedLanguageEn(translations[idx++]);
      setTranslatedLanguageBe(translations[idx++]);
    };

    translateStaticTexts();
  }, [i18n.language, translateText]);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(translatedPasswordMismatch);
      return;
    }

    if (formData.password.length < 6) {
      setError(translatedPasswordMinLength);
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || translatedRegisterError);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      {/* Language Switcher */}
      <div className="fixed top-4 right-4 z-50 flex gap-2 bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-md">
        <button
          onClick={() => changeLanguage('ru')}
          className={`px-3 py-1 rounded-full text-sm transition-all ${
            i18n.language === 'ru'
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {translatedLanguageRu}
        </button>
        <button
          onClick={() => changeLanguage('en')}
          className={`px-3 py-1 rounded-full text-sm transition-all ${
            i18n.language === 'en'
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {translatedLanguageEn}
        </button>
        <button
          onClick={() => changeLanguage('be')}
          className={`px-3 py-1 rounded-full text-sm transition-all ${
            i18n.language === 'be'
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {translatedLanguageBe}
        </button>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0 rounded-2xl relative">
        {/* Кнопка закрытия (крестик) на карточке */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all group"
          aria-label="Закрыть"
        >
          <X className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
        </button>

        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {translatedTitle}
          </CardTitle>
          <CardDescription>{translatedDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{translatedFirstName}</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder={translatedFirstNamePlaceholder}
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{translatedLastName}</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder={translatedLastNamePlaceholder}
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{translatedEmail}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{translatedPassword}</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={translatedPasswordPlaceholder}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {translatedConfirmPassword}
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder={translatedConfirmPasswordPlaceholder}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl py-6 text-lg font-semibold shadow-lg transition-all"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {translatedRegistering}
                </>
              ) : (
                translatedRegisterBtn
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600">{translatedHaveAccount} </span>
            <Link
              to="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              {translatedLogin}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
