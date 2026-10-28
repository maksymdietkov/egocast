package app.egocast.weather.user;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Находит пользователя по Google sub или создаёт нового, обновляет профиль и время входа.
     * Не привязан к Spring Security, чтобы потом переиспользовать для входа из Android.
     */
    @Transactional
    public User upsertFromGoogle(String sub, String email, String name, String pictureUrl) {
        User user = userRepository.findByGoogleSub(sub).orElseGet(User::new);
        if (user.getId() == null) {
            user.setGoogleSub(sub);
        }
        user.setEmail(email);
        user.setName(name);
        user.setPictureUrl(pictureUrl);
        user.setLastLoginAt(Instant.now());
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public java.util.Optional<User> findByGoogleSub(String sub) {
        return userRepository.findByGoogleSub(sub);
    }
}