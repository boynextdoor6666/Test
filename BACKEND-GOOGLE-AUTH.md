# Настройка эндпоинта Google авторизации на бэкенде

Для корректной работы Google аутентификации в вашем приложении, необходимо создать эндпоинт `/auth/google/verify` на бэкенд-сервере.

## Пример реализации для Node.js + Express

```javascript
const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Эндпоинт для верификации Google токена
router.post('/auth/google/verify', async (req, res) => {
  try {
    const { credential, userType } = req.body;
    
    // Верифицируем Google токен
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    // Получаем данные пользователя из токена
    const payload = ticket.getPayload();
    
    // Ищем пользователя в базе данных по email
    let user = await User.findOne({ email: payload.email });
    
    if (!user) {
      // Если пользователь не найден - создаем нового
      user = new User({
        name: payload.name,
        email: payload.email,
        photo: payload.picture,
        userType: userType || 'worker',
        authProvider: 'google'
      });
      
      await user.save();
    }
    
    // Создаем JWT токен для авторизации в приложении
    const token = jwt.sign(
      { userId: user._id, email: user.email }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Возвращаем данные пользователя и токен
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          photo: user.photo,
          authProvider: 'google'
        },
        token
      }
    });
    
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({
      success: false,
      message: 'Ошибка аутентификации Google',
      error: error.message
    });
  }
});

module.exports = router;
```

## Необходимые зависимости

```bash
npm install google-auth-library jsonwebtoken
```

## Переменные окружения для бэкенда

```
GOOGLE_CLIENT_ID=655912811217-9dvofthoehrkkgp547dltgb9qb8tnckr.apps.googleusercontent.com
JWT_SECRET=ваш_секретный_ключ_для_jwt
```

## Подключение в основном приложении

```javascript
const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');

app.use(express.json());
app.use('/API', authRoutes); // Все маршруты будут начинаться с /API
``` 