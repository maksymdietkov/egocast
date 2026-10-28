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

    public record UserDto(Long id, String email, String name, String pictureUrl) {}

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    /** Текущий пользователь. 401, если не залогинен. */
    @GetMapping("/me")
    public ResponseEntity<UserDto> me(@AuthenticationPrincipal OidcUser principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return userService.findByGoogleSub(principal.getSubject())
                .map(u -> ResponseEntity.ok(
                        new UserDto(u.getId(), u.getEmail(), u.getName(), u.getPictureUrl())))
                .orElseGet(() -> ResponseEntity.status(401).build());
    }
}