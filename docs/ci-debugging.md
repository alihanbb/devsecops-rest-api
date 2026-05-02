# CI/CD Pipeline Debugging Runbook

Bu runbook, GitHub Actions pipeline fail olduğunda hızlı triage, local reproduction ve postmortem standardı sağlamak için hazırlanmıştır.

Referans: [How to Debug CI/CD Pipelines: A Handbook](https://www.freecodecamp.org/news/how-to-debug-cicd-pipelines-handbook/)

## 1) Fast Triage Checklist

- İlk kırılan job/step'i bul (`ci.yml`, `security.yml`, `release.yml`).
- İlk hata mesajını izole et; zincirleme hatalardan önceki root error'a in.
- Son başarılı run ile farkları kontrol et:
  - commit diff
  - workflow YAML değişiklikleri
  - kullanılan action sürümleri
  - secret / environment değişimi
- Fail sınıfı belirle:
  - `Code regression` (lint/test kırığı)
  - `Dependency/security gate` (audit/trivy/sonar)
  - `Infra/runtime` (Docker daemon, network, registry, timeout)
  - `Flaky` (tekrarlandığında farklı sonuç)
- Kör retry yerine önce local reproduction yap.

## 2) İlk Bakılacak Log ve Artifact Kaynakları

Öncelik sırası:

1. GitHub Actions Job Summary + ilk failed step logları
2. `npm` komut çıktıları (`lint`, `test:coverage`, `audit`)
3. Security artifact'ları:
   - `trivy-fs.sarif`
   - `trivy-image.sarif`
4. SonarQube:
   - quality gate sonucu
   - coverage raporu ingest edildi mi (`coverage/lcov.info`)
5. Workflow metadata:
   - event type, actor, branch/tag, SHA

Hızlı ipucu: Loglarda önce `exit code`, sonra stack trace, sonra environment farklarına bak.

## 3) Local Reproduction Playbook

Repo root altında:

```bash
npm ci
npm run lint
npm run test:coverage
npm audit --audit-level=high
npm run build
docker build -t devsecops-rest-api:scan .
```

Security araçları lokalde kuruluysa:

```bash
gitleaks detect --source . --no-git
trivy fs --severity HIGH,CRITICAL .
trivy image --severity HIGH,CRITICAL devsecops-rest-api:scan
```

Notlar:

- GitHub runner farklarını taklit etmek için Node sürümünü `20` tut.
- Lokal başarısız değil ama CI başarısız ise env/secret/permission farkı ihtimali yüksektir.
- Docker build hatalarında önce daemon erişimi, sonra base image pull, sonra network/policy bak.

## 4) Observability Stack Seçimi (Pratik)

### Loki + Grafana

- Ne zaman: küçük/orta ekip, düşük maliyet, hızlı kurulum.
- Artı: düşük kaynak, iyi log query, Grafana ile metrik korelasyonu kolay.
- Eksi: ELK kadar derin full-text analitik değil.

### ELK (Elasticsearch + Logstash + Kibana)

- Ne zaman: büyük log hacmi, gelişmiş arama/analitik ihtiyacı.
- Artı: güçlü sorgu ve dashboard kabiliyeti.
- Eksi: daha pahalı, daha operasyonel ağır.

### Lightweight (Vector/Promtail + object storage + basic dashboards)

- Ne zaman: kaynak kısıtlı ortamlar, sade ihtiyaçlar.
- Artı: en düşük operasyon maliyeti.
- Eksi: daha az out-of-box analiz ve korelasyon.

Öneri:

- Bu proje ölçeği için başlangıçta `Loki + Grafana` en dengeli seçimdir.
- Gereksinim büyürse ELK veya yönetilen log platformuna geçiş planla.

## 5) Failed Deployment Postmortem Snippet

Kısa şablon:

```md
## Incident Summary
- Date/Time (UTC):
- Environment:
- Workflow Run URL:
- Impact:

## Timeline
- T0:
- T+N:

## Detection and Diagnosis
- First failing step:
- Primary error:
- Why not caught earlier:

## Root Cause
- Technical root cause:
- Contributing factors:

## Remediation
- Immediate fix:
- Long-term fix:
- Owner + due date:

## Preventive Actions
- New test/check:
- Pipeline guardrail:
- Observability/dashboard alert added:
```

## 6) Team Operating Rules

- Root-cause bulunmadan prod deploy tekrar edilmez.
- Her kırık deploy için kısa postmortem açılır.
- Tekrarlayan failure class'ları (ör. audit drift, flaky test) için backlog'da hardening task açılır.
