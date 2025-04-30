package cz.osu.pesa.swi125.controller;

import cz.osu.pesa.swi125.model.dto.LoginRequest;
import cz.osu.pesa.swi125.model.dto.RegistrationRequest;
import cz.osu.pesa.swi125.model.dto.UserToken;
import cz.osu.pesa.swi125.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
//test
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @RequestMapping(value = "/register", produces = "application/json", method = RequestMethod.POST)
    public ResponseEntity<String> register(@RequestBody RegistrationRequest registrationDTO) {
        System.out.println("Here");
        String ret = authService.register(registrationDTO.getUsername(), registrationDTO.getPassword());

        return new ResponseEntity<>(ret, HttpStatus.OK);
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody LoginRequest loginDTO) {
        try {
            UserToken userToken = authService.login(loginDTO.getUsername(), loginDTO.getPassword());
            return new ResponseEntity<>(userToken, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }
}
