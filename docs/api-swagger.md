# Swagger / OpenAPI Kullanimi

## Endpointler

- Swagger UI: `GET /docs`
- OpenAPI JSON: `GET /docs/openapi.json`

## Kapsam

Spec icinde su endpointler dokumante edilmistir:

- `GET /health/live`
- `GET /health/ready`
- `GET /metrics`
- `GET /api/v1/tasks`
- `GET /api/v1/tasks/{id}`
- `POST /api/v1/tasks`
- `PATCH /api/v1/tasks/{id}`
- `DELETE /api/v1/tasks/{id}`

## Pratik Kullanim

1. Uygulamayi calistirin.
2. Tarayicidan `http://localhost:3000/docs` adresine gidin.
3. `Try it out` ile dogrudan istek gonderin.
