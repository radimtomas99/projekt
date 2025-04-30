package cz.osu.pesa.swi125.service;

import cz.osu.pesa.swi125.model.dto.UserToken;
import cz.osu.pesa.swi125.model.entity.AppUser;
import cz.osu.pesa.swi125.model.entity.Role;
import cz.osu.pesa.swi125.model.repository.AppUserRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final AppUserRepository userRepository;

    public AuthService(AppUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String register(String username, String password) {
        String ret;
        if (userRepository.existsByUsernameIgnoreCase(username)) {
            ret = "Username already taken!";
        } else {
            AppUser user = new AppUser();
            user.setUsername(username);
            // Tady by bylo šifrování hesla (např. BCrypt, přidání soli apod.)
            user.setPassword(password);
            user.setRole(Role.USER);

            userRepository.save(user);
            ret = "User successfully registered!";
        }
        return ret;
    }

    public UserToken login(String username, String password) {
        AppUser user = userRepository.findByUsername(username);
        if (user != null) {
            if (user.getPassword().equals(password)) {
                return new UserToken(user.getUsername(), user.getRole());
            } else {
                throw new RuntimeException("Wrong password!");
            }
        } else {
            throw new IllegalArgumentException("Username does not exist!");
        }
    }
}
