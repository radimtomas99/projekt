package cz.osu.pesa.swi125.model.dto;

import lombok.Getter;

@Getter
public class LoginRequest {
    private String username;
    private String password;
}
