package app.egocast.weather.service;

import app.egocast.weather.dto.Period;
import app.egocast.weather.dto.WeatherData;
import app.egocast.weather.template.AdviceResult;
import app.egocast.weather.template.TemplateEngine;
import app.egocast.weather.template.TonePackLoader;
import app.egocast.weather.template.model.TonePackDefinition;
import org.springframework.stereotype.Service;

@Service
public class AdviceService {

    private final WeatherService weatherService;
    private final TonePackLoader tonePackLoader;
    private final TemplateEngine templateEngine;

    public AdviceService(WeatherService weatherService, TonePackLoader tonePackLoader, TemplateEngine templateEngine) {
        this.weatherService = weatherService;
        this.tonePackLoader = tonePackLoader;
        this.templateEngine = templateEngine;
    }

    public AdviceResponse getAdvice(double lat, double lon, Period period, String tone, String lang) {
        WeatherData weather = weatherService.getWeather(lat, lon, period);
        TonePackDefinition pack = tonePackLoader.load(tone, lang);
        AdviceResult result = templateEngine.build(pack, weather, lang);

        return new AdviceResponse(
                result.advice(),
                result.triggerPhrase(),
                result.expandComments(),
                weather
        );
    }
}