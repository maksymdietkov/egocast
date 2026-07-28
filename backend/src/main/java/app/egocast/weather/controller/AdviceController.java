package app.egocast.weather.controller;

import app.egocast.weather.dto.Period;
import app.egocast.weather.service.AdviceResponse;
import app.egocast.weather.service.AdviceService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class AdviceController {

    private final AdviceService adviceService;

    public AdviceController(AdviceService adviceService) {
        this.adviceService = adviceService;
    }

    @GetMapping("/advice")
    public AdviceResponse getAdvice(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "default") String tone,
            @RequestParam(defaultValue = "en") String lang,
            @RequestParam(defaultValue = "today") Period period
    ) {
        return adviceService.getAdvice(lat, lon, period, tone, lang);
    }
}