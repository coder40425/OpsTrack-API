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

// request latency histogram
export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",

  // labels allow filtering in dashboards
  labelNames: ["method", "route", "status_code"],

  // latency buckets
  buckets: [0.005, 0.01, 0.05, 0.1, 0.3, 0.5, 1, 2]
});

export const mongoQueryDuration = new client.Histogram({
  name: "mongo_query_duration_seconds",
  help: "MongoDB query execution time",

  labelNames: ["operation"],

  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1]
});


register.registerMetric(mongoQueryDuration);
register.registerMetric(httpRequestCounter);
register.registerMetric(httpRequestDuration);