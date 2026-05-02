# Test Sureci

## Minimum Kontrol

```bash
npm run lint
npm test
```

## Ek Kontroller

```bash
npm run test:coverage
docker compose config
```

## Notlar

- API testleri, DB bagimliligindan bagimsiz kalmak icin task service'i mocklar.
- Service unit testleri, `TaskService` icin repository stub ile davranis dogrular.
- Gercek DB akisini dogrulamak icin container ortaminda ek smoke test onerilir:

```bash
docker compose up -d postgres
npm run db:migrate
npm run dev
```
