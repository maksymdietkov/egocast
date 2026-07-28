package app.egocast.weather.service;

import app.egocast.weather.dto.ToneInfo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ToneCatalogService {

    // MVP: хардкод. Когда появятся реальные премиум-тона — заменим на чтение из БД или конфига.
    public List<ToneInfo> getAvailableTones() {
        return List.of(
                new ToneInfo("default", false)
        );
    }
}