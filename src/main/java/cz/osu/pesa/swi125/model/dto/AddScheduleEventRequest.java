package cz.osu.pesa.swi125.model.dto;

import java.time.LocalDate;

public class AddScheduleEventRequest {
    private Integer userId;
    private LocalDate eventDate;
    private String eventName;
    private String eventColor;

    // Default constructor (needed for JSON deserialization)
    public AddScheduleEventRequest() {}

    // Getters and Setters 
    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public LocalDate getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDate eventDate) {
        this.eventDate = eventDate;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public String getEventColor() {
        return eventColor;
    }

    public void setEventColor(String eventColor) {
        this.eventColor = eventColor;
    }
} 