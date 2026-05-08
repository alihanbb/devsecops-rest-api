# Project Roadmap

## Next Improvements

1. Authentication and authorization
- Add JWT-based auth flow and role-based access control.
- Protect task endpoints and add auth integration tests.

2. CI performance and cache optimization
- Improve dependency and Docker layer caching in GitHub Actions.
- Add workflow timing checks to detect regressions.

3. Observability dashboards
- Add Grafana dashboards for request latency, error rates, and throughput.
- Define SLO-oriented alerts for API availability and p95 latency.