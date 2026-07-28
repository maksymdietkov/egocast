package app.egocast.weather.template;

import java.util.Map;

/**
 * Результат сборки шаблона: готовый совет + фраза-триггер разворота +
 * микрокомментарии к каждому параметру погоды.
 */
public record AdviceResult(
        String advice,
        String triggerPhrase,
        Map<String, String> expandComments
) {}