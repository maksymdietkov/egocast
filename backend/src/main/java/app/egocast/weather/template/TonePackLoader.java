package app.egocast.weather.template;

import app.egocast.weather.template.model.TonePackDefinition;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Читает YAML тон-паков из classpath (src/main/resources/templates/{tone}/{lang}.yaml)
 * и кэширует уже распарсенные результаты в памяти.
 */
@Component
public class TonePackLoader {

    private final ObjectMapper yamlMapper = new ObjectMapper(new YAMLFactory());
    private final Map<String, TonePackDefinition> cache = new ConcurrentHashMap<>();

    public TonePackDefinition load(String tone, String lang) {
        String key = tone + ":" + lang;
        return cache.computeIfAbsent(key, k -> loadFromDisk(tone, lang));
    }

    private TonePackDefinition loadFromDisk(String tone, String lang) {
        String path = "templates/%s/%s.yaml".formatted(tone, lang);
        try (InputStream is = new ClassPathResource(path).getInputStream()) {
            return yamlMapper.readValue(is, TonePackDefinition.class);
        } catch (Exception e) {
            boolean alreadyDefault = tone.equals("default") && lang.equals("en");
            if (alreadyDefault) {
                throw new IllegalStateException(
                        "Не найден базовый тон-пак templates/default/en.yaml — без него сервис не может работать", e);
            }
            // если запрошенный тон/язык не найден — тихо откатываемся на default/en
            return loadFromDisk("default", "en");
        }
    }
}