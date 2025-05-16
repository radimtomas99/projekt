package cz.osu.pesa.swi125.model.dto;

// Simple DTO for returning error messages as JSON
public class ErrorResponse {
    private String message;

    public ErrorResponse(String message) {
        this.message = message;
    }

    // Getter is needed for JSON serialization
    public String getMessage() {
        return message;
    }

    // Setter is optional but good practice
    public void setMessage(String message) {
        this.message = message;
    }
} 