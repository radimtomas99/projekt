package cz.osu.pesa.swi125.model.dto;

import cz.osu.pesa.swi125.model.entity.Role;

public class UserToken {
    private Integer userId;
    private String username;
    private Role role;

    // Default constructor
    public UserToken() {}

    // All-args constructor
    public UserToken(Integer userId, String username, Role role) {
        this.userId = userId;
        this.username = username;
        this.role = role;
    }

    // Getters
    public Integer getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public Role getRole() {
        return role;
    }

    // Setters
    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    // Optional: Add toString() method for debugging
    @Override
    public String toString() {
        return "UserToken{" +
                "userId=" + userId +
                ", username='" + username + '\'' +
                ", role=" + role +
                '}';
    }
}
