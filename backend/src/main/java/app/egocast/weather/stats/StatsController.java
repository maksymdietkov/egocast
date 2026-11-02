package app.egocast.weather.stats;

import app.egocast.weather.auth.AdminService;
import app.egocast.weather.user.User;
import app.egocast.weather.user.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/stats")
public class StatsController {

    private final StatsService statsService;
    private final UserService userService;
    private final AdminService adminService;

    public StatsController(StatsService statsService, UserService userService, AdminService adminService) {
        this.statsService = statsService;
        this.userService = userService;
        this.adminService = adminService;
    }

    /**
     * Публичный: фронт шлёт, когда на странице реально человек. Если юзер залогинен — привязываем визит к нему.
     * Боты по User-Agent получают тот же 204, но ничего не пишется — чтобы не подсказывать, что их отфильтровали.
     */
    @PostMapping("/visit")
    public ResponseEntity<Void> visit(@Valid @RequestBody VisitRequest request,
                                      @RequestHeader(value = "User-Agent", required = false) String userAgent,
                                      @AuthenticationPrincipal OidcUser principal) {
        if (StatsService.isBot(userAgent)) {
            return ResponseEntity.noContent().build();
        }
        Long userId = principal == null ? null
                : userService.findByGoogleSub(principal.getSubject()).map(User::getId).orElse(null);
        statsService.recordVisit(request, userId);
        return ResponseEntity.noContent().build();
    }

    /** Только для админа: 401 без входа, 403 если email не в ADMIN_EMAILS. */
    @GetMapping("/summary")
    public ResponseEntity<StatsSummary> summary(@AuthenticationPrincipal OidcUser principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        if (!adminService.isAdmin(principal.getEmail())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(statsService.summary());
    }
}