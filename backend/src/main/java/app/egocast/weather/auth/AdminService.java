package app.egocast.weather.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

/** Админы задаются через env ADMIN_EMAILS (через запятую), чтобы email не жил в репо. */
@Service
public class AdminService {

    private final Set<String> adminEmails;

    public AdminService(@Value("${egocast.admin-emails:}") String adminEmails) {
        this.adminEmails = Arrays.stream(adminEmails.split(","))
                .map(s -> s.trim().toLowerCase(Locale.ROOT))
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toUnmodifiableSet());
    }

    public boolean isAdmin(String email) {
        return email != null && adminEmails.contains(email.trim().toLowerCase(Locale.ROOT));
    }
}
