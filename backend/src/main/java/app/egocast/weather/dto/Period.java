package app.egocast.weather.dto;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Period {
    TODAY,
    TOMORROW;

    @JsonCreator
    public static Period fromString(String value) {
        return Period.valueOf(value.trim().toUpperCase());
    }
}
