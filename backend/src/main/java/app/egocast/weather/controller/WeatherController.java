package app.egocast.weather.controller;

import app.egocast.weather.dto.Period;
import app.egocast.weather.dto.WeatherData;
import app.egocast.weather.service.WeatherService;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
public class WeatherController {

    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    /**
     * GET /api/v1/weather?lat=&lon=&period=today|tomorrow
     * Сырые данные погоды — пригодится и напрямую, и как основа для /advice.
     */
    @GetMapping("/api/v1/weather")
    public WeatherData getWeather(
            @RequestParam @DecimalMin("-90") @DecimalMax("90") double lat,
            @RequestParam @DecimalMin("-180") @DecimalMax("180") double lon,
            @RequestParam(defaultValue = "today") Period period
    ) {
        return weatherService.getWeather(lat, lon, period);
    }
}
