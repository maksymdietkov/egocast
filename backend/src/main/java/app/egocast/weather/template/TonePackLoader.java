package app.egocast.weather.template;

import app.egocast.weather.template.model.ExpandTemplate;
import app.egocast.weather.template.model.TonePackDefinition;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Читает YAML тон-паков из classpath (src/main/resources/templates/{tone}/{lang}.yaml)
 * и кэширует уже распарсенные результаты в памяти.
 * Отдельно читает tone-neutral expand-параметры (templates/shared/expand.{lang}.yaml).
 *
 * Важно: кэш живёт в памяти всё время работы приложения и не инвалидируется —
 * если тон/язык один раз не загрузился и откатился на default, это остаётся
 * закэшированным под исходным ключом до перезапуска приложения.
 */
@Component
public class TonePackLoader {

    private static final Logger log = LoggerFactory.getLogger(TonePackLoader.class);

    private final ObjectMapper yamlMapper = new ObjectMapper(new YAMLFactory());
    private final Map<String, TonePackDefinition> cache = new ConcurrentHashMap<>();
    private final Map<String, ExpandTemplate> sharedExpandCache = new ConcurrentHashMap<>();

    public TonePackDefinition load(String tone, String lang) {
        String key = tone + ":" + lang;
        return cache.computeIfAbsent(key, k -> loadFromDisk(tone, lang));
    }

    public ExpandTemplate loadSharedExpand(String lang) {
        return sharedExpandCache.computeIfAbsent(lang, this::loadSharedExpandFromDisk);
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
            log.warn("Не удалось загрузить тон-пак '{}' (lang={}) из classpath:{} — откатываюсь на default/en. Причина: {}",
                    tone, lang, path, e.toString());
            return loadFromDisk("default", "en");
        }
    }

    private ExpandTemplate loadSharedExpandFromDisk(String lang) {
        String path = "templates/shared/expand.%s.yaml".formatted(lang);
        try (InputStream is = new ClassPathResource(path).getInputStream()) {
            return yamlMapper.readValue(is, ExpandTemplate.class);
        } catch (Exception e) {
            boolean alreadyDefault = lang.equals("en");
            if (alreadyDefault) {
                throw new IllegalStateException(
                        "Не найден базовый shared-файл templates/shared/expand.en.yaml — без него сервис не может работать", e);
            }
            log.warn("Не удалось загрузить shared expand для lang={} из classpath:{} — откатываюсь на en. Причина: {}",
                    lang, path, e.toString());
            return loadSharedExpandFromDisk("en");
        }
    }
}