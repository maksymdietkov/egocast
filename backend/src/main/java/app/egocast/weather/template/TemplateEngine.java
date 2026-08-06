package app.egocast.weather.template;

import app.egocast.weather.dto.WeatherData;
import app.egocast.weather.template.model.ConditionTemplate;
import app.egocast.weather.template.model.ExpandTemplate;
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
    private final TonePackLoader tonePackLoader;

    public TemplateEngine(TonePackLoader tonePackLoader) {
        this.tonePackLoader = tonePackLoader;
    }

    public AdviceResult build(TonePackDefinition pack, WeatherData data, String lang) {
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

        ExpandTemplate sharedExpand = tonePackLoader.loadSharedExpand(lang);

        return new AdviceResult(advice, trigger, buildExpandComments(sharedExpand, data));
    }

    private Map<String, String> buildExpandComments(ExpandTemplate sharedExpand, WeatherData data) {
        Map<String, Map<String, String>> params = sharedExpand.getParams();
        Map<String, String> result = new LinkedHashMap<>();

        String tempTier = ConditionResolver.tempTag(data.temperature());

        result.put("temp", fill(sharedExpand.getTemp().get(tempTier), data.temperature()));
        result.put("feels_like", fill(tierText(params, "feels_like", ExpandTierResolver.feelsLikeTag(data)), data.feelsLike()));
        result.put("wind", fill(tierText(params, "wind", ExpandTierResolver.windTag(data)), data.windSpeed()));
        result.put("humidity", fill(tierText(params, "humidity", ExpandTierResolver.humidityTag(data)), data.humidity()));
        result.put("precipitation", fill(tierText(params, "precipitation", ExpandTierResolver.precipitationTag(data)), data.precipitationProbability()));
        result.put("uv", fill(tierText(params, "uv", ExpandTierResolver.uvTag(data)), data.uvIndex()));

        return result;
    }

    private String tierText(Map<String, Map<String, String>> params, String param, String tier) {
        Map<String, String> tiers = params.get(param);
        if (tiers == null) return null;
        return tiers.get(tier);
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