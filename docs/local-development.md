# Lokal Geliştirme Kurulumu

## Gereksinimler

- Node.js 20+
- npm 10+
- PostgreSQL 16+ (Docker veya lokal servis)

## Kurulum

```bash
npm ci
cp .env.example .env
```

`.env` içinde en az şu alanlari kontrol edin:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

## Migration ve Calistirma

```bash
npm run db:migrate
npm run dev
```

Uygulama varsayilan olarak `http://localhost:3000` adresinde acilir.
