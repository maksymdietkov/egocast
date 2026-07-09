package app.egocast.weather;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class WeatherAdvisorApplication {

    public static void main(String[] args) {
        SpringApplication.run(WeatherAdvisorApplication.class, args);
    }
}
