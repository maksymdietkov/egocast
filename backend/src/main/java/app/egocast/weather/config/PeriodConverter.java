package app.egocast.weather.config;

import app.egocast.weather.dto.Period;
import org.springframework.core.convert.converter.Converter;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

/**
 * По умолчанию Spring биндит @RequestParam enum через Enum.valueOf (case-sensitive),
 * а по ТЗ в URL период передаётся в нижнем регистре: ?period=today|tomorrow.
 * Этот конвертер делает биндинг регистронезависимым.
 */
@Component
public class PeriodConverter implements Converter<String, Period> {
    @Override
    public Period convert(@NonNull String source) {
        return Period.fromString(source);
    }
}
