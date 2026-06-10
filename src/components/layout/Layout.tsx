import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  User,
  Map,
  BookOpen,
  Utensils,
  Calendar,
  Home,
  LogOut,
  Settings,
  Menu,
  Scroll,
  Compass,
  Star,
} from 'lucide-react';
import AccessibilityWidget from '@/components/AccessibilityWidget';
import { useAutoTranslate } from '@/hooks/useAutoTranslate';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { i18n } = useTranslation();
  const { translateText } = useAutoTranslate();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // Состояния для переведенных текстов
  const [translatedHome, setTranslatedHome] = useState('Главная');
  const [translatedMap, setTranslatedMap] = useState('Карта');
  const [translatedTours, setTranslatedTours] = useState('Туры');
  const [translatedTraditions, setTranslatedTraditions] = useState('Традиции');
  const [translatedLegends, setTranslatedLegends] = useState('Легенды');
  const [translatedFood, setTranslatedFood] = useState('Кухня');
  const [translatedReviews, setTranslatedReviews] = useState('Отзывы');
  const [translatedLogin, setTranslatedLogin] = useState('Вход');
  const [translatedRegister, setTranslatedRegister] = useState('Регистрация');
  const [translatedAdmin, setTranslatedAdmin] = useState('Админ панель');
  const [translatedProfile, setTranslatedProfile] = useState('Профиль');
  const [translatedLogout, setTranslatedLogout] = useState('Выйти');
  const [translatedWelcome, setTranslatedWelcome] = useState(
    'Откройте для себя удивительную Беларусь',
  );
  const [translatedNavigation, setTranslatedNavigation] = useState('Навигация');
  const [translatedForUsers, setTranslatedForUsers] =
    useState('Для пользователей');
  const [translatedContacts, setTranslatedContacts] = useState('Контакты');
  const [translatedRights, setTranslatedRights] =
    useState('Все права защищены');

  // Перевод всех текстов при смене языка
  useEffect(() => {
    const translateStaticTexts = async () => {
      const [
        home,
        map,
        tours,
        traditions,
        legends,
        food,
        reviews,
        login,
        register,
        admin,
        profile,
        logoutText,
        welcome,
        navigation,
        forUsers,
        contacts,
        rights,
      ] = await Promise.all([
        translateText('Главная'),
        translateText('Карта'),
        translateText('Туры'),
        translateText('Традиции'),
        translateText('Легенды'),
        translateText('Кухня'),
        translateText('Отзывы'),
        translateText('Вход'),
        translateText('Регистрация'),
        translateText('Админ панель'),
        translateText('Профиль'),
        translateText('Выйти'),
        translateText('Откройте для себя удивительную Беларусь'),
        translateText('Навигация'),
        translateText('Для пользователей'),
        translateText('Контакты'),
        translateText('Все права защищены'),
      ]);

      setTranslatedHome(home);
      setTranslatedMap(map);
      setTranslatedTours(tours);
      setTranslatedTraditions(traditions);
      setTranslatedLegends(legends);
      setTranslatedFood(food);
      setTranslatedReviews(reviews);
      setTranslatedLogin(login);
      setTranslatedRegister(register);
      setTranslatedAdmin(admin);
      setTranslatedProfile(profile);
      setTranslatedLogout(logoutText);
      setTranslatedWelcome(welcome);
      setTranslatedNavigation(navigation);
      setTranslatedForUsers(forUsers);
      setTranslatedContacts(contacts);
      setTranslatedRights(rights);
    };

    translateStaticTexts();
  }, [i18n.language, translateText]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/', label: translatedHome, icon: Home },
    { path: '/map', label: translatedMap, icon: Map },
    { path: '/tours', label: translatedTours, icon: Calendar },
    { path: '/traditions', label: translatedTraditions, icon: BookOpen },
    { path: '/legends', label: translatedLegends, icon: Scroll },
    { path: '/food', label: translatedFood, icon: Utensils },
    { path: '/reviews', label: translatedReviews, icon: Star },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg'
            : 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900'
        }`}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <div className="relative">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    scrolled
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md'
                      : 'bg-white/20 backdrop-blur-sm border border-white/30'
                  }`}
                >
                  <Compass className="w-5 h-5 transition-all duration-300 text-white" />
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <NavigationMenu className="hidden lg:flex">
              <NavigationMenuList className="flex space-x-1">
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.path}>
                    <NavigationMenuLink asChild>
                      <Link
                        to={item.path}
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          isActive(item.path)
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                            : scrolled
                              ? 'text-gray-700 hover:bg-gray-100'
                              : 'text-white/90 hover:bg-white/20 hover:text-white'
                        }`}
                      >
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            {/* Right side */}
            <div className="flex items-center space-x-3 min-w-[320px] justify-end">
              <div
                className={
                  scrolled
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full p-0.5'
                    : ''
                }
              >
                <AccessibilityWidget />
              </div>

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                        scrolled
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'text-white hover:bg-white/20'
                      }`}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">
                          {user?.firstName?.[0]}
                          {user?.lastName?.[0]}
                        </span>
                      </div>
                      <span className="hidden sm:inline text-sm font-medium min-w-[60px]">
                        {user?.firstName}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 mt-2 rounded-xl"
                  >
                    {isAdmin && (
                      <DropdownMenuItem
                        onClick={() => navigate('/admin')}
                        className="cursor-pointer rounded-lg"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        {translatedAdmin}
                        <span className="ml-auto bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs px-2 py-0.5 rounded-full">
                          ADMIN
                        </span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => navigate('/profile')}
                      className="cursor-pointer rounded-lg"
                    >
                      <User className="w-4 h-4 mr-2" />
                      {translatedProfile}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer rounded-lg text-red-600 focus:text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {translatedLogout}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/login')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      scrolled
                        ? 'text-gray-700 hover:bg-gray-100'
                        : 'text-white hover:bg-white/20'
                    }`}
                  >
                    {translatedLogin}
                  </Button>
                  <Button
                    onClick={() => navigate('/register')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md ${
                      scrolled
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                        : 'bg-white text-blue-600 hover:bg-gray-100'
                    }`}
                  >
                    {translatedRegister}
                  </Button>
                </div>
              )}

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`lg:hidden rounded-lg transition-all duration-200 ${
                      scrolled
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'text-white hover:bg-white/20'
                    }`}
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-0">
                  <div className="flex flex-col pt-20 pb-6">
                    <div className="px-4 space-y-1">
                      {navItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => document.body.click()}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                            isActive(item.path)
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    {isAdmin && (
                      <div className="px-4 mt-2">
                        <Link
                          to="/admin"
                          onClick={() => document.body.click()}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
                        >
                          <Settings className="w-5 h-5" />
                          {translatedAdmin}
                        </Link>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-16">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Compass className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Беларусь Туризм</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                {translatedWelcome}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">{translatedNavigation}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    to="/"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    {translatedHome}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/map"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    {translatedMap}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tours"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    {translatedTours}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/traditions"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    {translatedTraditions}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/legends"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    {translatedLegends}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/food"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    {translatedFood}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/reviews"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    {translatedReviews}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">{translatedForUsers}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    to="/login"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    {translatedLogin}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    {translatedRegister}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/profile"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    {translatedProfile}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">{translatedContacts}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Email: info@belarustourism.by
                <br />
                Телефон: +375 (17) 123-45-67
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            © 2024 Беларусь Туризм. {translatedRights}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
