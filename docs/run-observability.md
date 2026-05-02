# Uygulama ve Observability Stack Calistirma

Docker Compose ile API + PostgreSQL + Grafana/Loki/Tempo/Prometheus stack'ini birlikte ayaga kaldirin:

```bash
docker compose up --build -d
docker compose ps
```

## Hizmetler

- API: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/docs`
- Metrics: `http://localhost:3000/metrics`
- Grafana: `http://localhost:3002` (`admin` / `admin`)
- Prometheus: `http://localhost:9091`
- PostgreSQL: `localhost:5432`

Grafana, provisioning ile `API SLO Overview` dashboard'unu otomatik yukler.
SLO panel ve alert detaylari icin: `docs/api-slo-dashboards.md`.

## Durdurma

```bash
docker compose down
```

Kalici veriyi de silmek icin:

```bash
docker compose down -v
```
