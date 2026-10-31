package app.egocast.weather.stats;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/** Тело POST /api/v1/stats/visit. Всё, кроме visitorId, опционально и дополнительно чистится в сервисе. */
public record VisitRequest(
        @NotNull UUID visitorId,
        @Size(max = 32) String tone,
        @Size(max = 8) String lang,
        @Size(max = 16) String platform
) {}
