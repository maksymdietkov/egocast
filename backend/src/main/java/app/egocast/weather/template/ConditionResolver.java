package app.egocast.weather.template;

import app.egocast.weather.dto.WeatherData;

import java.util.ArrayList;
import java.util.List;

/**
 * Превращает WeatherData в цепочку ключей-кандидатов для поиска шаблона —
 * от самого специфичного (storm_windy_cold) до самого общего (cold).
 */
public class ConditionResolver {

    public static List<String> resolveCandidates(WeatherData w) {
        List<String> tags = new ArrayList<>();

        // особые явления — самый специфичный тег первым
        if (isStorm(w)) {
            tags.add("storm");
        } else if (isSnow(w)) {
            tags.add("snow");
        } else if (isHeavyRain(w)) {
            tags.add("heavy_rain");
        } else if (isRain(w)) {
            tags.add("rain");
        }

        if (isWindy(w)) {
            tags.add("windy");
        }

        tags.add(tempTag(w)); // базовый тег температуры — всегда последний, гарантированный fallback

        return buildCandidateChain(tags);
    }

    private static List<String> buildCandidateChain(List<String> tags) {
        List<String> candidates = new ArrayList<>();
        for (int i = 0; i < tags.size(); i++) {
            candidates.add(String.join("_", tags.subList(i, tags.size())));
        }
        return candidates;
    }

    private static String tempTag(WeatherData w) {
        double t = w.temperature();
        if (t < 0) return "frost";
        if (t < 10) return "cold";
        if (t < 18) return "cool";
        if (t < 25) return "comfortable";
        return "hot";
    }

    private static boolean isWindy(WeatherData w) {
        return w.windSpeed() > 7;
    }

    private static boolean isRain(WeatherData w) {
        return w.precipitation() > 1;
    }

    private static boolean isHeavyRain(WeatherData w) {
        return w.precipitation() > 5;
    }

    private static boolean isSnow(WeatherData w) {
        int code = w.weatherCode();
        return code >= 71 && code <= 77;
    }

    private static boolean isStorm(WeatherData w) {
        int code = w.weatherCode();
        return code >= 95 && code <= 99;
    }
}