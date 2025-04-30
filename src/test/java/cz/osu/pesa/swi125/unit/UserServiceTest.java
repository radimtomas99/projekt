package cz.osu.pesa.swi125.unit;

import cz.osu.pesa.swi125.model.dto.UserToken;
import cz.osu.pesa.swi125.model.entity.AppUser;
import cz.osu.pesa.swi125.model.entity.Role;
import cz.osu.pesa.swi125.model.repository.AppUserRepository;
import cz.osu.pesa.swi125.service.AuthService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {
    @Mock
    private AppUserRepository userRepository;

    @InjectMocks
    private AuthService authService;

    @Test
    void testSuccessfulRegistration() {
        when(userRepository.existsByUsernameIgnoreCase(any(String.class)))
                .thenReturn(false);

        String actualRet = authService.register("a", "a");
        String expectedRet = "User successfully registered!";

        Assertions.assertEquals(expectedRet, actualRet);
    }

    @Test
    void testDuplicateRegistration() {
        // dopsat sami
    }

    @Test
    void testSuccessfulLogin() {
        AppUser user = new AppUser(1, "existingUser", "correctPassword", Role.USER);
        when(userRepository.findByUsername(any(String.class)))
                .thenReturn(user);

        UserToken actualRet = authService.login("existingUser", "correctPassword");
        UserToken expectedRet = new UserToken(user.getUsername(), user.getRole());

        assert actualRet != null;
        Assertions.assertEquals(expectedRet.getUsername(), actualRet.getUsername());
        Assertions.assertEquals(expectedRet.getRole(), actualRet.getRole());
    }

}
