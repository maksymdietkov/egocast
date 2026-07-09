# Weather Advisor / EgoCast — backend

Этап 1 (частично): Spring Boot проект + интеграция с Open-Meteo + кэш 30 минут.

## Что уже готово

- Структура Maven-проекта (Java 21, Spring Boot 3.3)
- `OpenMeteoClient` — WebClient-клиент к Open-Meteo (без ключа, hourly-прогноз на 2 дня, ветер сразу в м/с)
- `WeatherService` — маппинг сырого ответа в чистый `WeatherData`, выбор часа:
  - `today` → ближайший к текущему моменту час
  - `tomorrow` → 12:00 следующего дня
  - кэш на 30 минут по координатам (округление до ~1.1 км) + периоду через Caffeine
- `GET /api/v1/weather?lat=&lon=&period=today|tomorrow` — отдаёт `WeatherData`
- Обработка ошибок (`GlobalExceptionHandler`) — валидация lat/lon, ошибки похода в Open-Meteo
- `docker-compose.local.yml` — Postgres + бэкенд собираются из исходников (`build: .`)
- JPA/PostgreSQL уже подключены как зависимости (понадобятся на Этапе 4 для `users`/`user_preferences`), но `ddl-auto: validate` — миграции будем писать руками, как в MyCarLog

## Чего пока нет (по плану — следующие шаги)

- Шаблонный движок YAML (тон-паки, основной совет, триггер разворота, микрокомментарии)
- `GET /api/v1/advice`, `GET /api/v1/tones`
- Auth (Google OAuth2 + JWT), `user_preferences`, `user_purchases` — реальные JPA-сущности и миграции
- Реальный Dockerfile-прогон в CI

## Запуск локально

```bash
docker compose -f docker-compose.local.yml up --build
```

Проверить:

```bash
curl "http://localhost:8080/api/v1/weather?lat=49.8&lon=18.3&period=today"
```

(координаты — Острава, для примера)

## Структура

```
src/main/java/app/egocast/weather/
  ├─ config/       # CacheConfig, PeriodConverter
  ├─ controller/   # WeatherController
  ├─ client/       # OpenMeteoClient + DTO сырого ответа
  ├─ dto/          # WeatherData, Period
  ├─ service/      # WeatherService (маппинг + кэш)
  └─ exception/    # WeatherLookupException, GlobalExceptionHandler
```
