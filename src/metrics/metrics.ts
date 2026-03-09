import client from 'prom-client';

//registry stores all metrics
export const register = new client.Registry();

//collect default system metrics automatically
client.collectDefaultMetrics({
    register
});

// custom metric: total HTTP requests
export const httpRequestCounter = new client.Counter({

  // metric name (Prometheus naming convention)
  name: "http_requests_total",

  // description
  help: "Total number of HTTP requests"
});

// register this metric with registry
register.registerMetric(httpRequestCounter);