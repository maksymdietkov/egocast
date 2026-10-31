-- Статистика посещений: одна строка на посетителя (анонимный visitorId из localStorage) в день
CREATE TABLE IF NOT EXISTS visits (
    id            BIGSERIAL PRIMARY KEY,
    visitor_id    UUID        NOT NULL,
    visit_date    DATE        NOT NULL,
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    hits          INTEGER     NOT NULL DEFAULT 1,
    tone          VARCHAR(32),
    lang          VARCHAR(8),
    platform      VARCHAR(16),
    user_id       BIGINT REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uq_visits_visitor_day UNIQUE (visitor_id, visit_date)
);

CREATE INDEX IF NOT EXISTS idx_visits_date ON visits (visit_date);
