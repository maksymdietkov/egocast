package app.egocast.weather.exception;

public class WeatherLookupException extends RuntimeException {
    public WeatherLookupException(String message) {
        super(message);
    }

    public WeatherLookupException(String message, Throwable cause) {
        super(message, cause);
    }
}
