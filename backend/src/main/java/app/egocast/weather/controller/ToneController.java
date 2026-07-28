package app.egocast.weather.controller;

import app.egocast.weather.dto.ToneInfo;
import app.egocast.weather.service.ToneCatalogService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class ToneController {

    private final ToneCatalogService toneCatalogService;

    public ToneController(ToneCatalogService toneCatalogService) {
        this.toneCatalogService = toneCatalogService;
    }

    @GetMapping("/tones")
    public List<ToneInfo> getTones() {
        return toneCatalogService.getAvailableTones();
    }
}