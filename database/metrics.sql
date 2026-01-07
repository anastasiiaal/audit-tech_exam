CREATE TABLE IF NOT EXISTS http_metrics (
    id BIGSERIAL PRIMARY KEY,
    ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    method TEXT NOT NULL,
    route TEXT NOT NULL,
    status_code INT NOT NULL,
    duration_ms INT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_http_metrics_ts ON http_metrics(ts);
CREATE INDEX IF NOT EXISTS idx_http_metrics_route_ts ON http_metrics(route, ts);
CREATE INDEX IF NOT EXISTS idx_http_metrics_status_ts ON http_metrics(status_code, ts);
