package app.egocast.weather.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
public class OpenMeteoClient {

    private final WebClient webClient;

    public OpenMeteoClient(
            WebClient.Builder webClientBuilder,
            @Value("${weather.open-meteo.base-url}") String baseUrl
    ) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
    }

    /**
     * Тянем hourly-прогноз на 2 дня вперёд (хватает на today + tomorrow),
     * timezone=auto — Open-Meteo сам определит локальный часовой пояс по координатам,
     * так что индекс "текущего часа" в массиве совпадает с реальным локальным временем.
     */
    public Mono<OpenMeteoResponse> fetchHourlyForecast(double lat, double lon) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v1/forecast")
                        .queryParam("latitude", lat)
                        .queryParam("longitude", lon)
                        .queryParam("hourly", String.join(",",
                                "temperature_2m",
                                "apparent_temperature",
                                "precipitation",
                                "precipitation_probability",
                                "weathercode",
                                "relative_humidity_2m",
                                "cloud_cover",
                                "uv_index",
                                "wind_speed_10m"
                        ))
                        .queryParam("wind_speed_unit", "ms")
                        .queryParam("forecast_days", 2)
                        .queryParam("timezone", "auto")
                        .build())
                .retrieve()
                .bodyToMono(OpenMeteoResponse.class);
    }
}
