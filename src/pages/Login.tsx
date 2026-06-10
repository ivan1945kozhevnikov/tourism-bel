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

const Login: React.FC = () => {
  const { i18n } = useTranslation();
  const { translateText } = useAutoTranslate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Состояния для переведенных текстов
  const [translatedTitle, setTranslatedTitle] = useState('Вход в аккаунт');
  const [translatedDescription, setTranslatedDescription] = useState(
    'Войдите, чтобы получить доступ к бронированию туров',
  );
  const [translatedEmail, setTranslatedEmail] = useState('Email');
  const [translatedPassword, setTranslatedPassword] = useState('Пароль');
  const [translatedPasswordPlaceholder, setTranslatedPasswordPlaceholder] =
    useState('Введите пароль');
  const [translatedLoginBtn, setTranslatedLoginBtn] = useState('Войти');
  const [translatedLoggingIn, setTranslatedLoggingIn] = useState('Вход...');
  const [translatedNoAccount, setTranslatedNoAccount] =
    useState('Нет аккаунта?');
  const [translatedRegister, setTranslatedRegister] =
    useState('Зарегистрироваться');
  const [translatedLoginError, setTranslatedLoginError] =
    useState('Ошибка входа');
  const [translatedLanguageRu, setTranslatedLanguageRu] = useState('Русский');
  const [translatedLanguageEn, setTranslatedLanguageEn] = useState('English');
  const [translatedLanguageBe, setTranslatedLanguageBe] =
    useState('Беларуская');

  // Перевод статических текстов (без демо-данных)
  useEffect(() => {
    const translateStaticTexts = async () => {
      const translations = await Promise.all([
        translateText('Вход в аккаунт'),
        translateText('Войдите, чтобы получить доступ к бронированию туров'),
        translateText('Email'),
        translateText('Пароль'),
        translateText('Введите пароль'),
        translateText('Войти'),
        translateText('Вход...'),
        translateText('Нет аккаунта?'),
        translateText('Зарегистрироваться'),
        translateText('Ошибка входа'),
        translateText('Русский'),
        translateText('English'),
        translateText('Беларуская'),
      ]);

      let idx = 0;
      setTranslatedTitle(translations[idx++]);
      setTranslatedDescription(translations[idx++]);
      setTranslatedEmail(translations[idx++]);
      setTranslatedPassword(translations[idx++]);
      setTranslatedPasswordPlaceholder(translations[idx++]);
      setTranslatedLoginBtn(translations[idx++]);
      setTranslatedLoggingIn(translations[idx++]);
      setTranslatedNoAccount(translations[idx++]);
      setTranslatedRegister(translations[idx++]);
      setTranslatedLoginError(translations[idx++]);
      setTranslatedLanguageRu(translations[idx++]);
      setTranslatedLanguageEn(translations[idx++]);
      setTranslatedLanguageBe(translations[idx++]);
    };

    translateStaticTexts();
  }, [i18n.language, translateText]);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || translatedLoginError);
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
            <div className="space-y-2">
              <Label htmlFor="email">{translatedEmail}</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{translatedPassword}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={translatedPasswordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl py-6 text-lg font-semibold shadow-lg transition-all"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {translatedLoggingIn}
                </>
              ) : (
                translatedLoginBtn
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600">{translatedNoAccount} </span>
            <Link
              to="/register"
              className="text-blue-600 hover:underline font-medium"
            >
              {translatedRegister}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
