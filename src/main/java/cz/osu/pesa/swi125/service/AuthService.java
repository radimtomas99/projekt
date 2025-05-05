package cz.osu.pesa.swi125.service;

import cz.osu.pesa.swi125.model.dto.UserToken;
import cz.osu.pesa.swi125.model.entity.AppUser;
import cz.osu.pesa.swi125.model.entity.Role;
import cz.osu.pesa.swi125.model.repository.AppUserRepository;
import org.springframework.stereotype.Service;
// TODO: Inject PasswordEncoder for secure password storage
// import org.springframework.security.crypto.password.PasswordEncoder; 

@Service
public class AuthService {
    private final AppUserRepository userRepository;
    // TODO: Inject PasswordEncoder
    // private final PasswordEncoder passwordEncoder; 

    // TODO: Update constructor to inject PasswordEncoder
    public AuthService(AppUserRepository userRepository /*, PasswordEncoder passwordEncoder */) {
        this.userRepository = userRepository;
        // this.passwordEncoder = passwordEncoder;
    }

    public String register(String username, String password) throws IllegalArgumentException {
        // --- Backend Validation ---
        if (username == null || username.trim().length() < 4) {
            throw new IllegalArgumentException("Username must be at least 4 characters long.");
        }
        if (password == null || password.length() < 4) {
            // Note: Avoid revealing specific password length requirements in production error messages
            throw new IllegalArgumentException("Password does not meet requirements."); 
        }
         // Check trimmed username for existence
        if (userRepository.existsByUsernameIgnoreCase(username.trim())) {
            throw new IllegalArgumentException("Username already taken!"); 
        }
        // --- End Validation ---

        AppUser user = new AppUser();
        user.setUsername(username.trim()); // Save trimmed username
        // TODO: HASH THE PASSWORD before saving!
        // user.setPassword(passwordEncoder.encode(password)); 
        user.setPassword(password); // WARNING: Storing plain text password! Replace with hashing.
        user.setRole(Role.USER); // Default role to USER

        userRepository.save(user); // Save the new user

        return "User successfully registered!";
    }

    // Updated Login method
    public UserToken login(String username, String password) throws IllegalArgumentException, RuntimeException {
        if (username == null || username.trim().isEmpty()) {
             throw new IllegalArgumentException("Username cannot be empty.");
        }
         if (password == null || password.isEmpty()) {
             throw new IllegalArgumentException("Password cannot be empty.");
         }

        // Find user by username 
        AppUser user = userRepository.findByUsername(username); 
        
        if (user == null) {
            // Throw exception for user not found (keep message generic for security)
            throw new IllegalArgumentException("Login failed: Invalid username or password."); 
        }

        // --- !!! CRITICAL: Replace with Hashed Password Comparison !!! ---
        // boolean passwordMatches = passwordEncoder.matches(password, user.getPassword());
        boolean passwordMatches = user.getPassword().equals(password); // WARNING: Plain text comparison!
        // --- !!! END CRITICAL SECTION !!! ---

        if (!passwordMatches) {
            // Throw exception for wrong password (keep message generic for security)
             throw new RuntimeException("Login failed: Invalid username or password."); 
        }

        // If username exists and password matches, return token/user info
        // TODO: Generate a real token (e.g., JWT) instead of just user details
        return new UserToken(user.getUsername(), user.getRole());
    }
}
