package app.egocast.weather.service;

import app.egocast.weather.dto.WeatherData;

import java.util.Map;

public record AdviceResponse(
        String advice,
        String triggerPhrase,
        Map<String, String> expandComments,
        WeatherData rawWeather
) {}