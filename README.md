# teaclub by kai

Мобильный минималистичный MVP без бэкенда. React + Tailwind через CDN.

## Как запустить на GitHub Pages
1. Создай публичный репозиторий и загрузи все файлы из этого архива в корень.
2. В Repo → Settings → Pages: Source = Deploy from a branch, Branch = `main` (root), Save.
3. Через минуту сайт будет доступен по `https://<username>.github.io/<repo>/`.

## Структура
- `/index.html` — входная страница
- `/src/index.css` — тема и стили
- `/src/main.jsx` — логика и UI
- `/public/catalog.json` — каталог чаёв (сид)
- `/public/posters.json` — список постеров (положи файлы в `/public/posters/…`)

## Дальше
- Добавим скоринг (BioChem/Qi) и импорт DeepResearch на отдельной странице `/admin`.
