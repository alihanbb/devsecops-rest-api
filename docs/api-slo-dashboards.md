# API SLO Dashboards ve Alertler

Bu dokuman, Grafana ve Prometheus tarafinda provision edilen API SLO dashboard ve alert kurallarini aciklar.

## Dashboard

- Dashboard UID: `api-slo-overview`
- Provisioning yolu: `observability/grafana/provisioning/dashboards`
- Dashboard klasoru: **API SLOs**

Takip edilen temel sinyaller:

- Availability (%) - son 5 dakikada 5xx olmayan istek oranindan hesaplanir
- P95 latency (ms) - histogram quantile ile hesaplanir
- 5xx error rate (%) - son 5 dakikadaki 5xx oranini gosterir
- Throughput (req/s) - toplam API istek hizi
- Route bazli latency trendi ve hata/istek serileri

## SLO Tabanli Alert Kurallari

Prometheus rule dosyasi: `observability/prometheus/rules/api-slo-rules.yml`

- `ApiP95LatencyHigh` (warning): p95 latency > 300ms, 10 dakika
- `ApiAvailabilityLow` (critical): availability < 99%, 10 dakika
- `Api5xxErrorRateHigh` (warning): 5xx error rate > 1%, 10 dakika

## Non-production Validation

1. Stack'i kaldirin:

```bash
docker compose up --build -d
```

2. API trafigi uretin (normal + hatali istekler).
3. Grafana'da `API SLO Overview` dashboard'unun otomatik geldigini dogrulayin.
4. Prometheus'ta `Alerts` sayfasinda kurallarin yuklendiginin kontrolunu yapin.

```bash
curl http://localhost:9091/api/v1/rules
curl http://localhost:9091/api/v1/alerts
```
