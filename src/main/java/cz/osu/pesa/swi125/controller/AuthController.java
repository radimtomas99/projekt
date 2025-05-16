package cz.osu.pesa.swi125.controller;

import cz.osu.pesa.swi125.model.dto.LoginRequest;
import cz.osu.pesa.swi125.model.dto.RegistrationRequest;
import cz.osu.pesa.swi125.model.dto.RegistrationResponse;
import cz.osu.pesa.swi125.model.dto.UserToken;
import cz.osu.pesa.swi125.model.dto.ErrorResponse;
import cz.osu.pesa.swi125.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<RegistrationResponse> register(@RequestBody RegistrationRequest registrationDTO) {
        try {
            if (registrationDTO == null || registrationDTO.getUsername() == null || registrationDTO.getPassword() == null) {
                 return ResponseEntity.badRequest().body(new RegistrationResponse("Invalid registration data."));
            }
            
            String resultMessage = authService.register(registrationDTO.getUsername(), registrationDTO.getPassword());
            return ResponseEntity.ok(new RegistrationResponse(resultMessage));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new RegistrationResponse(e.getMessage()));
        } catch (Exception e) {
            System.err.println("Unexpected registration error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new RegistrationResponse("An unexpected error occurred during registration."));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginDTO) {
        try {
             if (loginDTO == null || loginDTO.getUsername() == null || loginDTO.getPassword() == null) {
                  return new ResponseEntity<>(new ErrorResponse("Invalid login data."), HttpStatus.UNAUTHORIZED); 
             }
            UserToken userToken = authService.login(loginDTO.getUsername(), loginDTO.getPassword());
            return new ResponseEntity<>(userToken, HttpStatus.OK); 
        } catch (RuntimeException e) { 
            return new ResponseEntity<>(new ErrorResponse("Login failed: Invalid username or password."), HttpStatus.UNAUTHORIZED); 
        } catch (Exception e) {
             System.err.println("Unexpected login error: " + e.getMessage());
             return new ResponseEntity<>(new ErrorResponse("An unexpected error occurred during login."), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}