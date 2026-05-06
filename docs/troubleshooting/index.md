# Troubleshooting

Common issues and solutions for DClaw Forecast.

## Quick Diagnostics

```bash
# Check app pods
kubectl get pods -n dclaw-forecast

# Check logs
kubectl logs -n dclaw-forecast deployment/dclaw-forecast-backend

# Check database
kubectl get clusters -n dclaw-forecast
```

## Sections

- [Common Issues](./common-issues)
- [FAQ](./faq)
