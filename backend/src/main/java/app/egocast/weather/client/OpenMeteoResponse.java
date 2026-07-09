package app.egocast.weather.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Маппинг сырого ответа Open-Meteo /v1/forecast (hourly-блок).
 * Документация: https://open-meteo.com/en/docs
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record OpenMeteoResponse(
        double latitude,
        double longitude,
        String timezone,
        Hourly hourly
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Hourly(
            List<String> time,

            @JsonProperty("temperature_2m")
            List<Double> temperature2m,

            @JsonProperty("apparent_temperature")
            List<Double> apparentTemperature,

            @JsonProperty("precipitation")
            List<Double> precipitation,

            @JsonProperty("precipitation_probability")
            List<Integer> precipitationProbability,

            @JsonProperty("weathercode")
            List<Integer> weatherCode,

            @JsonProperty("relative_humidity_2m")
            List<Integer> relativeHumidity2m,

            @JsonProperty("cloud_cover")
            List<Integer> cloudCover,

            @JsonProperty("uv_index")
            List<Double> uvIndex,

            @JsonProperty("wind_speed_10m")
            List<Double> windSpeed10m
    ) {
    }
}
