# DevSecOps REST API (Node.js + Express)

Production-oriented, küçük ama gerçekçi bir REST API örneği. Proje; güvenlik sertleştirmesi, test, containerization ve CI/CD güvenlik kapıları ile birlikte gelir.

## Architecture Overview

- `src/server.js`: process lifecycle, graceful shutdown ve sinyal yönetimi.
- `src/app.js`: Express app composition, security middleware, router wiring.
- `src/config/*`: ortam değişkeni doğrulama (`envalid`) ve structured logger (`pino`).
- `src/routes/health.routes.js`: liveness/readiness endpoint stratejisi.
- `src/modules/tasks/*`: versioned `/api/v1/tasks` CRUD domain katmanı.
- `src/middlewares/*`: request validation ve merkezi error handling.
- `tests/*`: service unit testleri + API integration testleri (`supertest`).

## API Endpoints

- `GET /health/live` - uygulama process liveness.
- `GET /health/ready` - readiness (shutdown sırasında `503` döner).
- `GET /metrics` - Prometheus formatında metric çıktısı.
- `GET /docs` - Swagger UI.
- `GET /docs/openapi.json` - OpenAPI spec çıktısı.
- `POST /api/v1/auth/login` - JWT token al.
- `GET /api/v1/tasks` - task listele (auth gerekli).
- `GET /api/v1/tasks/:id` - task detay (auth gerekli).
- `POST /api/v1/tasks` - task oluştur (`admin` rolü).
- `PATCH /api/v1/tasks/:id` - task güncelle (`admin` rolü).
- `DELETE /api/v1/tasks/:id` - task sil (`admin` rolü).

## Uygulama Dokumantasyonu

- [Lokal geliştirme kurulumu](docs/local-development.md)
- [Uygulama + observability stack çalıştırma](docs/run-observability.md)
- [DB kurulumu ve migration akışı](docs/db-migrations.md)
- [Test workflow](docs/testing-workflow.md)
- [Swagger / OpenAPI kullanımı](docs/api-swagger.md)
- [API SLO dashboard ve alertler](docs/api-slo-dashboards.md)
- [CI/CD failure runbook](docs/ci-debugging.md)

## Local Development

```bash
npm ci
cp .env.example .env
npm run db:migrate
npm run dev
```

Diğer komutlar:

```bash
npm run lint
npm test
npm run test:coverage
npm run build
docker compose up --build
```

Observability stack ile ayağa kaldırmak için:

```bash
docker compose up --build -d
docker compose ps
```

## CI/CD Stages and Security Gates

### 1) CI (`.github/workflows/ci.yml`)

- Dependency install (`npm ci`)
- `actions/cache` ile `~/.npm` cache restore/save
- Lint gate (`npm run lint`)
- Unit/integration tests + coverage (`npm run test:coverage`)
- Build gate (`npm run build`)
- Buildx + GHA cache ile Docker layer cache
- Job summary içinde cache hit ve toplam runtime görünürlüğü

### 2) Security (`.github/workflows/security.yml`)

- `npm audit --audit-level=high` (dependency vulnerability gate)
- `gitleaks` (secret scanning gate)
- `trivy` filesystem + image scan (HIGH/CRITICAL gate)
- SonarQube SAST + coverage ingestion (`sonar-project.properties`)

### 3) Release/Deploy Stub (`.github/workflows/release.yml`)

- Manual tetiklenen release flow
- `staging` ve `production` environment gate iskeleti
- Gerçek registry push/deploy adımları için placeholder

## Production Readiness Checklist

- [x] Env config startup doğrulaması (`envalid`)
- [x] Secure headers (`helmet`)
- [x] CORS policy env tabanlı (`CORS_ORIGIN`)
- [x] Rate limiting (`express-rate-limit`)
- [x] Structured logging + env bazlı log level (`pino`, `LOG_LEVEL`)
- [x] Merkezi error handling + güvenli hata dönüşü
- [x] Liveness/readiness endpoint ayrımı
- [x] Graceful shutdown (SIGTERM/SIGINT, readiness downshift, timeout)
- [x] Non-root, multi-stage Docker image
- [x] CI + Security scanning + release gate stub

## Production için Yapılan Değişiklikler

- Basit demo kodu yerine versioned, CRUD odaklı bir REST API mimarisi kuruldu.
- Input validation, merkezi hata yönetimi ve HTTP güvenlik middleware’leri eklendi.
- Process lifecycle için graceful shutdown ve readiness düşürme mekanizması uygulandı.
- JSON log standardı ve çevreye göre log seviyesi konfigüre edildi.
- Güvenlik ve kalite kontrolleri GitHub Actions pipeline’larına ayrıştırıldı.
- OpenTelemetry tracing (Tempo), Prometheus metrics ve Loki log toplama stack'i eklendi.
- Task akışı controller ve service katmanında async hale getirildi.

## Observability Stack

- **Grafana:** `http://localhost:3002` (`admin` / `admin`)
- **Prometheus:** `http://localhost:9091`
- **Loki:** `http://localhost:3100`
- **Tempo:** `http://localhost:3200`
- **API Metrics:** `http://localhost:3000/metrics`

### Ne topluyoruz?

- **Metrics:** `prom-client` ile HTTP latency/status metrikleri + process metrikleri.
- **Traces:** OpenTelemetry auto-instrumentation ile trace'ler Tempo'ya gider.
- **Logs:** `promtail` docker container loglarını Loki'ye push eder.

### Docker lifecycle

```bash
docker compose up --build -d
docker compose logs -f api
docker compose down
```

## Trust Proxy Note

Load balancer/reverse proxy arkasında çalışırken `TRUST_PROXY=true` ayarlayın. Aksi durumda istemci IP tespiti ve rate-limit davranışı yanıltıcı olabilir.

## JWT Auth ve Roller

- Varsayılan test kullanıcıları:
  - `admin` / `admin123` (`admin`)
  - `reader` / `reader123` (`reader`)
- Token üretimi `JWT_SECRET` ve `JWT_EXPIRES_IN` env değişkenleri ile kontrol edilir.
- Production ortamında `JWT_SECRET` mutlaka güçlü bir gizli değer ile override edilmelidir.

## Required GitHub Secrets

- `SONAR_TOKEN`
- `SONAR_HOST_URL`

`GITHUB_TOKEN` GitHub Actions tarafından otomatik sağlanır.

### Fast Triage Checklist (GitHub Actions)

- Hangi stage kırıldı (`ci`, `security`, `release`) ve ilk kırılan step hangisi?
- Son yeşil run ile kırılan run arasındaki fark: commit, workflow dosyası, secret/env değişimi.
- Failure tipi: deterministic mi (hep aynı), flaky mi (aralıklı)?
- Problem kod mu, pipeline konfigürasyonu mu, yoksa environment/secret mi?
- `rerun failed jobs` sadece flaky şüphesinde; root-cause bulunmadan kör retry yapma.

### Önce Bakılacak Log/Artifact’lar

- Job Summary ve ilk hata veren step log satırları.
- `npm` output (`lint`, `test:coverage`, `audit`) ve exit code.
- Trivy SARIF upload çıktısı (`trivy-fs.sarif`, `trivy-image.sarif`).
- SonarQube quality gate sonucu + coverage ingestion durumu.
- Workflow run metadata: actor, branch, event (`push` / `pull_request` / `workflow_dispatch`).

### Local Reproduction Komutları

```bash
npm ci
npm run lint
npm run test:coverage
npm audit --audit-level=high
docker build -t devsecops-rest-api:scan .
```

Security workflow eşleşmesi için (lokalde varsa):

```bash
gitleaks detect --source . --no-git
trivy fs --severity HIGH,CRITICAL .
trivy image --severity HIGH,CRITICAL devsecops-rest-api:scan
```
