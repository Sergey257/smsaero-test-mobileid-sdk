# MobileID SDK

JS SDK для верификации телефона через MobileID.

## Установка

```bash
npm install mobileid-sdk
```

```js
import {MobileID} from 'mobileid-sdk';
// или
const {MobileID} = require('mobileid-sdk');
```

Или через `<script>`:

```html

<script src="mobileid-sdk.js"></script>
```

## Настройка URL backend

```js
// Глобально (до создания экземпляров)
MobileID.configure({tokenUrl: '/api/token'});

// Или в конструкторе
new MobileID({tokenUrl: '/api/token'});
```

## Использование

```js
const mid = new MobileID({
  tokenUrl: '/api/token',
});

mid.on('ready', () => {
});
mid.on('pending', () => {
});
mid.on('otp_required', () => { /* показать поле OTP */
});
mid.on('verified', (data) => { /* data.verify_token → на ваш backend */
});
mid.on('rejected', () => {
});
mid.on('expired', () => {
});
mid.on('invalid_code', () => { /* неверный код, ввести заново */
});
mid.on('error', (err) => { /* err.code, err.message */
});

await mid.init();
await mid.start('+7 916 123-45-67');
// после otp_required:
await mid.submitOTP('1234');
```

## API

| Метод                               | Описание                                     |
|-------------------------------------|----------------------------------------------|
| `new MobileID(options)`             | Конструктор                                  |
| `.init()`                           | Инициализация (fingerprint → токен → сессия) |
| `.start(phone)`                     | Запуск верификации (номер нормализуется)     |
| `.submitOTP(code)`                  | Отправка OTP                                 |
| `.silentRetry()`                    | Тихий перезапуск цикла                       |
| `.normalizePhone(phone, [country])` | Валидация номера                             |
| `.getPhone()`                       | Нормализованный номер                        |
| `.getSessionId()`                   | ID сессии                                    |
| `.getState()`                       | idle / ready / pending / otp / final         |
| `.destroy()`                        | Уничтожить                                   |

## События

| Событие        | Данные            | Описание              |
|----------------|-------------------|-----------------------|
| `ready`        | `{session_id}`    | Сессия создана        |
| `pending`      | `{phone}`         | Верификация запущена  |
| `otp_required` | `{}`              | Нужен OTP             |
| `verified`     | `{verify_token}`  | Пройдена (финальное)  |
| `rejected`     | `{verify_token}`  | Отклонена (финальное) |
| `expired`      | `{verify_token}`  | Истекла (финальное)   |
| `invalid_code` | `{message}`       | Неверный OTP          |
| `error`        | `{code, message}` | Ошибка                |

## Повторная попытка

```js
mid.on('rejected', async () => {
  await mid.init();
  await mid.start(phone);
});
```

## Синхронизация сессий

При повторном `start()` на тот же номер (например после перезагрузки страницы) backend синхронизирует события из
предыдущей сессии. SDK автоматически обработает синхронизированный статус и выбросит нужное событие (`otp_required`,
`verified` и т.д.) — пользователь увидит актуальный экран без задержки.

## Автоматический retry

При ошибках polling SDK автоматически перезапускает цикл (init → start) с запомненным номером. Лимит: `maxRetries` (по
умолчанию 2). При исчерпании — событие `error` с кодом `MAX_RETRIES`.
