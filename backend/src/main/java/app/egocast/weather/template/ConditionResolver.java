package app.egocast.weather.template;

import app.egocast.weather.dto.WeatherData;

import java.util.ArrayList;
import java.util.List;

/**
 * Превращает WeatherData в список ключей-кандидатов для поиска шаблона.
 * Порядок: явление (с холодной версией для дождя) > ветер+температура > температура.
 */
public class ConditionResolver {

    public static List<String> resolveCandidates(WeatherData w) {
        List<String> candidates = new ArrayList<>();

        String special = specialTag(w);
        if (special != null) {
            // для дождя и ливня при холоде ищем отдельный блок, если его нет - общий
            if (isColdRain(special, w)) {
                candidates.add(special + "_cold");
            }
            candidates.add(special);
        }

        String temp = tempTag(w.temperature());
        if (isWindy(w)) {
            candidates.add("windy_" + temp);
        }

        candidates.add(temp); // гарантированный fallback

        return candidates;
    }

    private static String specialTag(WeatherData w) {
        if (isStorm(w)) return "storm";
        if (isSnow(w)) return "snow";
        if (isHeavyRain(w)) return "heavy_rain";
        if (isRain(w)) return "rain";
        return null;
    }

    /** Холодная версия есть только у rain и heavy_rain, порог: ниже 13 градусов. */
    private static boolean isColdRain(String special, WeatherData w) {
        return (special.equals("rain") || special.equals("heavy_rain"))
                && w.temperature() < 13;
    }

    public static String tempTag(double t) {
        if (t < 0) return "frost";
        if (t < 7) return "cold";
        if (t < 13) return "chilly";
        if (t < 18) return "cool";
        if (t < 22) return "mild";
        if (t < 26) return "comfortable";
        if (t < 30) return "warm";
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