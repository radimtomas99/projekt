package cz.osu.pesa.swi125.model.dto;

import cz.osu.pesa.swi125.model.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class UserToken {
    private String username;
    private Role role;
}
