package app.egocast.weather.dto;

/**
 * Нормализованный снимок погоды на конкретный момент (сегодня/завтра).
 * Это то, что летает между OpenMeteoClient -> WeatherService -> контроллерами.
 */
public record WeatherData(
        double temperature,          // °C
        double feelsLike,            // °C
        double windSpeed,            // м/с
        double precipitation,        // мм
        int precipitationProbability,// %
        int humidity,                // %
        int cloudCover,              // %
        double uvIndex,
        int weatherCode,             // WMO weather code (0 = ясно, 61-65 дождь, 71-77 снег, 95-99 гроза...)
        String isoTime                // на какое время суток взят снимок (для дебага/кэш-ключа)
) {
}
