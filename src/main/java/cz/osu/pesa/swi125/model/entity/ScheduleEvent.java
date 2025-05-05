package cz.osu.pesa.swi125.model.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "schedule_event")
public class ScheduleEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer eventId;

    @Column(nullable = false)
    private LocalDate eventDate;

    @Column(nullable = false, length = 200)
    private String eventName;

    @Column(nullable = false, length = 50)
    private String eventColor;

    @ManyToOne(fetch = FetchType.LAZY) // Lazy fetch is usually preferred
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    // Constructors
    public ScheduleEvent() {}

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

    public AppUser getUser() {
        return user;
    }

    public void setUser(AppUser user) {
        this.user = user;
    }
} 