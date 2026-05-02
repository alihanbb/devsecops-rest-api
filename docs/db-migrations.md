# DB Kurulumu ve Migration

## SQL Dosyalari

- `db/migrations/001_create_tasks.sql`: `tasks` tablosu ve index olusturur.

## Lokal PostgreSQL'e Migration

```bash
npm run db:migrate
```

Bu komut:

1. `src/db/postgres.js` ile baglanti havuzunu acar.
2. `db/migrations` altindaki `.sql` dosyalarini alfabetik sirayla calistirir.
3. Islem sonunda baglantiyi kapatir.

## Docker ile Otomatik Init

`docker-compose.yml` icindeki Postgres servisi, ilk kurulumda `db/migrations` klasorunu
`/docker-entrypoint-initdb.d` olarak mount eder ve SQL dosyalarini otomatik uygular.

## Sik Karsilasilan Hata

- `ECONNREFUSED`: `DB_HOST`/`DB_PORT` yanlis veya Postgres ayakta degil.
- `password authentication failed`: `DB_USER`/`DB_PASSWORD` uyusmuyor.
