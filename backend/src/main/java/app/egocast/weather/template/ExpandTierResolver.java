package app.egocast.weather.template;

import app.egocast.weather.dto.WeatherData;

public class ExpandTierResolver {

    public static String feelsLikeTag(WeatherData w) {
        return ConditionResolver.tempTag(w.feelsLike());
    }

    public static String windTag(WeatherData w) {
        double v = w.windSpeed();
        if (v < 2) return "calm";
        if (v < 5) return "breezy";
        if (v < 9) return "windy";
        return "gale";
    }

    public static String humidityTag(WeatherData w) {
        int v = w.humidity();
        if (v < 30) return "dry";
        if (v < 60) return "normal";
        if (v < 80) return "humid";
        return "soggy";
    }

    public static String precipitationTag(WeatherData w) {
        int v = w.precipitationProbability();
        if (v < 20) return "unlikely";
        if (v < 50) return "possible";
        if (v < 80) return "likely";
        return "certain";
    }

    public static String uvTag(WeatherData w) {
        double v = w.uvIndex();
        if (v < 3) return "low";
        if (v < 6) return "moderate";
        if (v < 8) return "high";
        return "extreme";
    }
}