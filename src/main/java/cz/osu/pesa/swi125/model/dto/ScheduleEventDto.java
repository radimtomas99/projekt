package cz.osu.pesa.swi125.model.dto;

import java.time.LocalDate;

public class ScheduleEventDto {
    private Integer eventId; // Include ID for potential updates/deletions
    private LocalDate eventDate;
    private String eventName;
    private String eventColor;

    // Constructors
    public ScheduleEventDto() {}

    public ScheduleEventDto(Integer eventId, LocalDate eventDate, String eventName, String eventColor) {
        this.eventId = eventId;
        this.eventDate = eventDate;
        this.eventName = eventName;
        this.eventColor = eventColor;
    }

    // Getters and Setters
    public Integer getEventId() {
        return eventId;
    }

    public void setEventId(Integer eventId) {
        this.eventId = eventId;
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