# Проект на NestJS + PostgreSQL + Docker

## Установка и запуск

### 1. Клонирование репозитория
```sh
git clone https://github.com/rama-997/task-manager.git
cd auth
```

### 2. Создание файла `.env`
В проекте используется .dev.env, убедитесь, что в нем указаны корректные данные.

### 3. Запуск проекта в Docker
```sh
docker-compose up -d
```

### 4. Применение миграций
```sh
npm run mig:run
```

### 5. Запустить проекта
```sh
npm install
npm run start:dev
```

### Доступ к Swagger
После успешного запуска проекта документация Swagger доступна по адресу:
```
http://localhost:5000/docs
```

## Запуск тестов

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e