# Belarus Tourism Portal

Информационный сайт для популяризации внутреннего туризма в Республике Беларусь.

## Возможности

- 🗺️ **Интерактивная карта** с голосовым помощником для получения информации о достопримечательностях
- 🏕️ **Бронирование туров** - просмотр и бронирование экскурсий
- 📚 **Традиции Беларуси** - информация о культуре и обычаях
- 🍽️ **Национальная кухня** - рецепты традиционных блюд
- 👤 **Регистрация и вход** для пользователей
- 🔐 **Админ-панель** для управления контентом

## Технологии

**Frontend:**
- React + TypeScript
- Tailwind CSS
- shadcn/ui
- Leaflet (карты)
- Web Speech API (голосовой помощник)

**Backend:**
- Node.js + Express
- PostgreSQL
- JWT аутентификация
- bcryptjs для хеширования паролей

## Установка

### Предварительные требования

- Node.js 18+
- PostgreSQL 14+

### 1. Клонирование и установка зависимостей

```bash
cd /mnt/okcomputer/output/app
npm install
```

### 2. Настройка базы данных

Создайте базу данных PostgreSQL:

```sql
CREATE DATABASE belarus_tourism;
```

Обновите файл `.env` с вашими данными:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=belarus_tourism
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key
PORT=3001
```

### 3. Запуск backend сервера

```bash
npm run server:dev
```

Сервер запустится на порту 3001.

### 4. Запуск frontend (в новом терминале)

```bash
npm run dev
```

Приложение будет доступно по адресу `http://localhost:5173`

## Демо-данные

### Администратор
- Email: `admin@belarus.by`
- Password: `admin123`

## Структура проекта

```
app/
├── server/                 # Backend
│   ├── controllers/        # Контроллеры API
│   ├── database/          # Подключение к БД
│   ├── middleware/        # Middleware (аутентификация)
│   ├── routes/            # API маршруты
│   └── server.ts          # Точка входа сервера
├── src/
│   ├── components/        # React компоненты
│   ├── context/           # React контексты
│   ├── pages/             # Страницы приложения
│   ├── services/          # API сервисы
│   └── types/             # TypeScript типы
└── public/                # Статические файлы
```

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/profile` - Профиль пользователя

### Места (достопримечательности)
- `GET /api/places` - Список мест
- `POST /api/places` - Создать место (admin)
- `PUT /api/places/:id` - Обновить место (admin)
- `DELETE /api/places/:id` - Удалить место (admin)

### Туры
- `GET /api/tours` - Список туров
- `POST /api/tours` - Создать тур (admin)
- `PUT /api/tours/:id` - Обновить тур (admin)
- `DELETE /api/tours/:id` - Удалить тур (admin)

### Бронирования
- `GET /api/bookings/my` - Мои бронирования
- `POST /api/bookings` - Создать бронирование
- `PUT /api/bookings/:id/status` - Обновить статус (admin)
- `DELETE /api/bookings/:id` - Отменить бронирование

### Традиции
- `GET /api/traditions` - Список традиций
- `POST /api/traditions` - Создать традицию (admin)
- `PUT /api/traditions/:id` - Обновить традицию (admin)
- `DELETE /api/traditions/:id` - Удалить традицию (admin)

### Еда
- `GET /api/foods` - Список блюд
- `POST /api/foods` - Создать блюдо (admin)
- `PUT /api/foods/:id` - Обновить блюдо (admin)
- `DELETE /api/foods/:id` - Удалить блюдо (admin)

## Голосовой помощник

Голосовой помощник работает через Web Speech API. Для использования:

1. Нажмите кнопку микрофона на странице карты
2. Скажите название места (например: "Расскажи о Мирском замке")
3. Помощник озвучит информацию о месте

Поддерживаемые команды:
- "Расскажи о [название места]" - информация о достопримечательности
- "Что ты умеешь?" - справка по командам

## Лицензия

MIT
