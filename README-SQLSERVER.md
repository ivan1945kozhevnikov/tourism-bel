# Запуск с SQL Server (SSMS)

## 📋 Требования

1. **Node.js** (версия 18+) - [скачать](https://nodejs.org/)
2. **SQL Server** (Express/Standard/Enterprise) - [скачать](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
3. **SQL Server Management Studio (SSMS)** - [скачать](https://docs.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms)

---

## 🚀 Пошаговая инструкция

### Шаг 1: Установите SQL Server

1. Скачайте и установите **SQL Server Express** (бесплатная версия)
2. При установке выберите:
   - **Authentication Mode**: Mixed Mode (SQL Server and Windows Authentication)
   - Запомните пароль для пользователя `sa`

### Шаг 2: Создайте базу данных в SSMS

1. Откройте **SQL Server Management Studio (SSMS)**
2. Подключитесь к серверу: `localhost` или `localhost\SQLEXPRESS`
3. Создайте новую базу данных:

```sql
CREATE DATABASE belarus_tourism;
GO
```

### Шаг 3: Настройте пользователя (если нужно)

```sql
-- Включить пользователя sa (если отключен)
ALTER LOGIN sa ENABLE;
GO

-- Установить пароль для sa
ALTER LOGIN sa WITH PASSWORD = 'your_strong_password';
GO

-- Или создать нового пользователя
CREATE LOGIN tourism_user WITH PASSWORD = 'your_password';
GO

USE belarus_tourism;
GO

CREATE USER tourism_user FOR LOGIN tourism_user;
GO

ALTER ROLE db_owner ADD MEMBER tourism_user;
GO
```

### Шаг 4: Установите зависимости Node.js

Откройте **Командную строку** или **PowerShell**:

```cmd
cd C:\путь\к\проекту\app
npm install
```

### Шаг 5: Настройте подключение

Откройте файл `.env` в корне проекта и укажите ваши данные:

```env
DB_HOST=localhost
DB_PORT=1433
DB_NAME=belarus_tourism
DB_USER=sa
DB_PASSWORD=ВАШ_ПАРОЛЬ_ОТ_SQL_SERVER
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=3001
```

**Важно:** Если используете SQL Server Express, возможно потребуется указать:
```env
DB_HOST=localhost\SQLEXPRESS
```

### Шаг 6: Запустите Backend сервер

```cmd
node server-mssql.js
```

Вы должны увидеть:
```
=================================
Server running on port 3001
=================================
API: http://localhost:3001/api
App: http://localhost:3001
=================================
```

**Оставьте это окно открытым!**

### Шаг 7: Запустите Frontend (в новом окне)

Откройте **новое окно командной строки**:

```cmd
cd C:\путь\к\проекту\app
npm run dev
```

### Шаг 8: Откройте приложение

Перейдите в браузере по адресу: **http://localhost:5173**

---

## ✅ Тестовые данные

| Роль | Email | Пароль |
|------|-------|--------|
| Админ | `admin@belarus.by` | `admin123` |

---

## 🛠️ Устранение неполадок

### Ошибка: "ConnectionError: Failed to connect to localhost"

**Решение 1:** Проверьте, запущен ли SQL Server
1. Откройте **SQL Server Configuration Manager**
2. Убедитесь, что **SQL Server (SQLEXPRESS)** или **SQL Server (MSSQLSERVER)** запущен

**Решение 2:** Проверьте порт
```sql
-- В SSMS выполните:
EXEC xp_readerrorlog 0, 1, N'Server is listening on'
GO
```
Если порт не 1433, укажите правильный в `.env`

**Решение 3:** Включите TCP/IP
1. Откройте **SQL Server Configuration Manager**
2. Разверните **SQL Server Network Configuration**
3. Выберите **Protocols for SQLEXPRESS** (или MSSQLSERVER)
4. Убедитесь, что **TCP/IP** включен (Enabled = Yes)
5. Перезапустите SQL Server

### Ошибка: "Login failed for user 'sa'"

**Решение:**
1. В SSMS подключитесь с Windows Authentication
2. Выполните:
```sql
ALTER LOGIN sa ENABLE;
ALTER LOGIN sa WITH PASSWORD = 'новый_пароль';
GO
```

### Ошибка: "Port 3001 is already in use"

```cmd
# Найдите и завершите процесс
netstat -ano | findstr :3001
taskkill /PID <номер_процесса> /F
```

Или измените PORT в `.env` на другой (например, 3002)

### Ошибка: "Cannot find module 'mssql'"

```cmd
npm install mssql
```

---

## 📁 Важные файлы

| Файл | Назначение |
|------|------------|
| `server-mssql.js` | Backend для SQL Server (запускать этот!) |
| `.env` | Настройки подключения к БД |
| `dist/` | Собранный frontend |

---

## 🎯 Быстрый старт

```cmd
:: Терминал 1 - Backend
cd C:\путь\к\проекту\app
node server-mssql.js

:: Терминал 2 - Frontend  
cd C:\путь\к\проекту\app
npm run dev
```

Готово! 🎉

---

## 🔌 Параметры подключения

| Параметр | Описание | Пример |
|----------|----------|--------|
| DB_HOST | Сервер БД | `localhost` или `localhost\SQLEXPRESS` |
| DB_PORT | Порт | `1433` (стандартный) |
| DB_NAME | Имя базы | `belarus_tourism` |
| DB_USER | Пользователь | `sa` или ваш пользователь |
| DB_PASSWORD | Пароль | ваш пароль |

---

## 📞 Помощь

Если возникнут проблемы:
1. Проверьте, что SQL Server запущен в службах Windows
2. Убедитесь, что TCP/IP включен в SQL Server Configuration Manager
3. Проверьте правильность логина и пароля в `.env`
4. Попробуйте подключиться через SSMS теми же данными
