package app.egocast.weather.service;

import app.egocast.weather.client.OpenMeteoClient;
import app.egocast.weather.client.OpenMeteoResponse;
import app.egocast.weather.dto.Period;
import app.egocast.weather.dto.WeatherData;
import app.egocast.weather.exception.WeatherLookupException;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class WeatherService {

    private static final DateTimeFormatter ISO_HOUR = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");
    // На какой час дня ориентируемся, когда считаем прогноз "на завтра" (полдень — самое репрезентативное время).
    private static final LocalTime TOMORROW_REFERENCE_HOUR = LocalTime.of(12, 0);

    private final OpenMeteoClient openMeteoClient;

    public WeatherService(OpenMeteoClient openMeteoClient) {
        this.openMeteoClient = openMeteoClient;
    }

    /**
     * Кэшируем на 30 минут по округлённым координатам + периоду (см. CacheConfig).
     * Координаты округляются в ключе (см. #round в SpEL) до 2 знаков (~1.1 км),
     * чтобы небольшой дрейф GPS не плодил кэш-промахи.
     */
    @Cacheable(
            value = "weatherCache",
            key = "T(java.lang.Math).round(#lat * 100) + '_' + T(java.lang.Math).round(#lon * 100) + '_' + #period"
    )
    public WeatherData getWeather(double lat, double lon, Period period) {
        OpenMeteoResponse response = openMeteoClient.fetchHourlyForecast(lat, lon)
                .blockOptional()
                .orElseThrow(() -> new WeatherLookupException("Open-Meteo вернул пустой ответ для lat=%s, lon=%s".formatted(lat, lon)));

        return extractSnapshot(response, period);
    }

    private WeatherData extractSnapshot(OpenMeteoResponse response, Period period) {
        OpenMeteoResponse.Hourly hourly = response.hourly();
        if (hourly == null || hourly.time() == null || hourly.time().isEmpty()) {
            throw new WeatherLookupException("Open-Meteo не вернул почасовые данные");
        }

        int index = findTargetIndex(hourly.time(), period);

        return new WeatherData(
                valueAt(hourly.temperature2m(), index),
                valueAt(hourly.apparentTemperature(), index),
                valueAt(hourly.windSpeed10m(), index),
                valueAt(hourly.precipitation(), index),
                (int) Math.round(valueAt(hourly.precipitationProbability(), index)),
                (int) Math.round(valueAt(hourly.relativeHumidity2m(), index)),
                (int) Math.round(valueAt(hourly.cloudCover(), index)),
                valueAt(hourly.uvIndex(), index),
                (int) Math.round(valueAt(hourly.weatherCode(), index)),
                hourly.time().get(index)
        );
    }

    /**
     * today -> ближайший к текущему моменту час в массиве.
     * tomorrow -> полдень (12:00) следующего дня.
     * Open-Meteo с timezone=auto отдаёт время уже в локальном поясе точки, так что
     * сравниваем напрямую с "локальным сейчас" по времени сервера (упрощение для MVP).
     */
    private int findTargetIndex(List<String> times, Period period) {
        LocalDateTime target = period == Period.TODAY
                ? LocalDateTime.now()
                : LocalDate.now().plusDays(1).atTime(TOMORROW_REFERENCE_HOUR);

        int bestIndex = 0;
        long bestDiff = Long.MAX_VALUE;

        for (int i = 0; i < times.size(); i++) {
            LocalDateTime slot = LocalDateTime.parse(times.get(i), ISO_HOUR);
            long diff = Math.abs(java.time.Duration.between(target, slot).toMinutes());
            if (diff < bestDiff) {
                bestDiff = diff;
                bestIndex = i;
            }
        }
        return bestIndex;
    }

    private double valueAt(List<? extends Number> values, int index) {
        if (values == null || index >= values.size() || values.get(index) == null) {
            return 0.0;
        }
        return values.get(index).doubleValue();
    }
}
