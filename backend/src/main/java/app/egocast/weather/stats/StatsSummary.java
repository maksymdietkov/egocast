package app.egocast.weather.stats;

import java.time.LocalDate;
import java.util.List;

/** Ответ GET /api/v1/stats/summary. «Посетитель» = уникальный visitorId (анонимный id из localStorage). */
public record StatsSummary(
        LocalDate today,
        long visitorsToday,
        long visitors7d,
        long visitors30d,
        long new30d,
        long returning30d,
        long totalVisitors,
        long signedInUsers,
        List<DailyPoint> daily,
        List<Slice> tones,
        List<Slice> langs,
        List<Slice> platforms
) {

    /** Один день графика: всего посетителей и сколько из них впервые. */
    public record DailyPoint(LocalDate date, long visitors, long newVisitors) {}

    /** Кусок разбивки (тон / язык / платформа) за 30 дней. */
    public record Slice(String key, long visitors) {}
}
