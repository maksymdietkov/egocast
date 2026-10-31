package app.egocast.weather.auth;

import app.egocast.weather.user.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    public record UserDto(Long id, String email, String name, String pictureUrl, boolean admin) {}

    private final UserService userService;
    private final AdminService adminService;

    public AuthController(UserService userService, AdminService adminService) {
        this.userService = userService;
        this.adminService = adminService;
    }

    /** Текущий пользователь. 401, если не залогинен. admin=true — фронт показывает экран статистики. */
    @GetMapping("/me")
    public ResponseEntity<UserDto> me(@AuthenticationPrincipal OidcUser principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return userService.findByGoogleSub(principal.getSubject())
                .map(u -> ResponseEntity.ok(new UserDto(
                        u.getId(), u.getEmail(), u.getName(), u.getPictureUrl(),
                        adminService.isAdmin(u.getEmail()))))
                .orElseGet(() -> ResponseEntity.status(401).build());
    }
}
