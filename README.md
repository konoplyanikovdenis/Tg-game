# Таня Гроттер: Магический контрабас

Браузерная 3D action-adventure на Babylon.js.  
Исследуй магические локации, решай загадки и летай на контрабасе.  
Карма (-100..+100) влияет на концовку. Таня всегда рядом и подсказывает.

## Технологии

- **Babylon.js 7** — 3D-движок
- **Vite 5** — сборка и dev-сервер
- **ESM** — чистый модульный JavaScript

## Запуск

```bash
npm install
npm run dev      # dev-сервер на http://localhost:5173
npm run build    # production-сборка в dist/
npm run preview  # превью production-сборки
```

## Структура

```
src/
  main.js    — инициализация сцены (engine, camera, light, mesh)
  state.js   — глобальное состояние (карма, этаж, флаги квестов)
  flight.js  — полёт на контрабасе (FollowCamera + анимация)
  tanya.js   — система реплик Тани (DOM-оверлей + интервал)
```
