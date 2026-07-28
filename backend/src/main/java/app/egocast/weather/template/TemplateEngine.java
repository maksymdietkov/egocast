package app.egocast.weather.template;

import app.egocast.weather.dto.WeatherData;
import app.egocast.weather.template.model.ConditionTemplate;
import app.egocast.weather.template.model.TonePackDefinition;
import app.egocast.weather.template.model.WeightedText;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Random;

@Component
public class TemplateEngine {

    private final Random random = new Random();

    public AdviceResult build(TonePackDefinition pack, WeatherData data) {
        List<String> candidates = ConditionResolver.resolveCandidates(data);

        ConditionTemplate template = candidates.stream()
                .map(key -> pack.getConditions().get(key))
                .filter(Objects::nonNull)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException(
                        "Нет ни одного шаблона даже для базового ключа. Кандидаты: " + candidates));

        String advice = String.join(" ",
                pickWeighted(template.getIntro()),
                pickWeighted(template.getAdvice()),
                pickWeighted(template.getSting())
        ).replaceAll("\\s+", " ").trim();

        String trigger = pickFromList(pack.getExpand().getTrigger());

        return new AdviceResult(advice, trigger, buildExpandComments(pack, data));
    }

    private Map<String, String> buildExpandComments(TonePackDefinition pack, WeatherData data) {
        Map<String, String> params = pack.getExpand().getParams();
        Map<String, String> result = new LinkedHashMap<>();

        result.put("temp", fill(params.get("temp"), data.temperature()));
        result.put("feels_like", fill(params.get("feels_like"), data.feelsLike()));
        result.put("wind", fill(params.get("wind"), data.windSpeed()));
        result.put("humidity", fill(params.get("humidity"), data.humidity()));
        result.put("precipitation", fill(params.get("precipitation"), data.precipitationProbability()));
        result.put("uv", fill(params.get("uv"), data.uvIndex()));

        return result;
    }

    private String fill(String template, Object value) {
        if (template == null) return null;
        return template.replace("{{value}}", String.valueOf(value));
    }

    private String pickWeighted(List<WeightedText> options) {
        if (options == null || options.isEmpty()) return "";

        int totalWeight = options.stream().mapToInt(WeightedText::getWeight).sum();
        int roll = random.nextInt(totalWeight);
        int cumulative = 0;

        for (WeightedText option : options) {
            cumulative += option.getWeight();
            if (roll < cumulative) {
                return option.getText();
            }
        }
        return options.get(options.size() - 1).getText(); // fallback, сюда не должны дойти
    }

    private String pickFromList(List<String> options) {
        if (options == null || options.isEmpty()) return "";
        return options.get(random.nextInt(options.size()));
    }
}