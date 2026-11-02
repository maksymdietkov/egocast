package app.egocast.weather.stats;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

@Service
public class StatsService {

    private static final int DAYS = 30;
    private static final Pattern TONE_PATTERN = Pattern.compile("[a-z0-9_]{1,32}");
    private static final Pattern LANG_PATTERN = Pattern.compile("[a-z]{2,8}");
    private static final Set<String> PLATFORMS = Set.of("web", "pwa", "twa");
    private static final Pattern BOT_UA = Pattern.compile(
            "bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|scanner|python|curl|wget"
                    + "|phantom|selenium|puppeteer|playwright|java/|go-http|okhttp|axios|node-fetch",
            Pattern.CASE_INSENSITIVE);

    private final JdbcTemplate jdbc;
    private final ZoneId zone;

    public StatsService(JdbcTemplate jdbc,
                        @Value("${egocast.stats.zone:Europe/Prague}") String zone) {
        this.jdbc = jdbc;
        this.zone = ZoneId.of(zone);
    }

    /** Одна строка на посетителя в день; повторные заходы за день только увеличивают hits. */
    @Transactional
    public void recordVisit(VisitRequest req, Long userId) {
        jdbc.update("""
                INSERT INTO visits (visitor_id, visit_date, tone, lang, platform, user_id)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT (visitor_id, visit_date) DO UPDATE SET
                    hits = visits.hits + 1,
                    last_seen_at = now(),
                    tone = COALESCE(EXCLUDED.tone, visits.tone),
                    lang = COALESCE(EXCLUDED.lang, visits.lang),
                    platform = COALESCE(EXCLUDED.platform, visits.platform),
                    user_id = COALESCE(EXCLUDED.user_id, visits.user_id)
                """,
                req.visitorId(),
                today(),
                clean(req.tone(), TONE_PATTERN),
                clean(req.lang(), LANG_PATTERN),
                cleanPlatform(req.platform()),
                userId);
    }

    @Transactional(readOnly = true)
    public StatsSummary summary() {
        LocalDate today = today();
        LocalDate from30 = today.minusDays(DAYS - 1);
        LocalDate from7 = today.minusDays(6);

        long visitorsToday = countVisitorsSince(today);
        long visitors7d = countVisitorsSince(from7);
        long visitors30d = countVisitorsSince(from30);

        // новый = первый визит этого visitorId попал в окно 30 дней
        Long new30 = jdbc.queryForObject("""
                SELECT COUNT(*) FROM (
                    SELECT visitor_id FROM visits GROUP BY visitor_id HAVING MIN(visit_date) >= ?
                ) t
                """, Long.class, from30);
        long new30d = new30 == null ? 0 : new30;

        // вернувшийся = заходил за 30 дней хотя бы в 2 разных дня (совпадает с серыми столбиками графика)
        Long returning30 = jdbc.queryForObject("""
                SELECT COUNT(*) FROM (
                    SELECT visitor_id FROM visits WHERE visit_date >= ?
                    GROUP BY visitor_id HAVING COUNT(DISTINCT visit_date) >= 2
                ) t
                """, Long.class, from30);
        long returning30d = returning30 == null ? 0 : returning30;

        Long total = jdbc.queryForObject("SELECT COUNT(DISTINCT visitor_id) FROM visits", Long.class);
        Long users = jdbc.queryForObject("SELECT COUNT(*) FROM users", Long.class);

        List<StatsSummary.DailyPoint> daily = jdbc.query("""
                WITH firsts AS (
                    SELECT visitor_id, MIN(visit_date) AS first_date FROM visits GROUP BY visitor_id
                )
                SELECT d::date AS day,
                       COUNT(v.visitor_id) AS visitors,
                       COUNT(v.visitor_id) FILTER (WHERE f.first_date = v.visit_date) AS new_visitors
                FROM generate_series(?::date, ?::date, interval '1 day') AS d
                LEFT JOIN visits v ON v.visit_date = d::date
                LEFT JOIN firsts f ON f.visitor_id = v.visitor_id
                GROUP BY d
                ORDER BY d
                """,
                (rs, i) -> new StatsSummary.DailyPoint(
                        rs.getObject("day", LocalDate.class),
                        rs.getLong("visitors"),
                        rs.getLong("new_visitors")),
                from30, today);

        return new StatsSummary(
                today,
                visitorsToday,
                visitors7d,
                visitors30d,
                new30d,
                returning30d,
                total == null ? 0 : total,
                users == null ? 0 : users,
                daily,
                slices("tone", from30),
                slices("lang", from30),
                slices("platform", from30));
    }

    private long countVisitorsSince(LocalDate from) {
        Long n = jdbc.queryForObject(
                "SELECT COUNT(DISTINCT visitor_id) FROM visits WHERE visit_date >= ?", Long.class, from);
        return n == null ? 0 : n;
    }

    /** column приходит только из кода (tone/lang/platform), не от клиента — подстановка безопасна. */
    private List<StatsSummary.Slice> slices(String column, LocalDate from) {
        return jdbc.query("""
                SELECT COALESCE(%1$s, 'unknown') AS k, COUNT(DISTINCT visitor_id) AS n
                FROM visits
                WHERE visit_date >= ?
                GROUP BY COALESCE(%1$s, 'unknown')
                ORDER BY n DESC
                """.formatted(column),
                (rs, i) -> new StatsSummary.Slice(rs.getString("k"), rs.getLong("n")),
                from);
    }

    /** Пустой UA или UA, похожий на робота/скрипт. Хитрых сканеров с обычным UA отсекает фронт (ждёт взаимодействия). */
    public static boolean isBot(String userAgent) {
        return userAgent == null || userAgent.isBlank() || BOT_UA.matcher(userAgent).find();
    }

    private LocalDate today() {
        return LocalDate.now(zone);
    }

    private static String clean(String value, Pattern allowed) {
        if (value == null) return null;
        String v = value.trim().toLowerCase(Locale.ROOT);
        return allowed.matcher(v).matches() ? v : null;
    }

    private static String cleanPlatform(String value) {
        if (value == null) return null;
        String v = value.trim().toLowerCase(Locale.ROOT);
        return PLATFORMS.contains(v) ? v : "other";
    }
}