package cz.osu.pesa.swi125.service;

import cz.osu.pesa.swi125.model.dto.AddScheduleEventRequest;
import cz.osu.pesa.swi125.model.dto.ScheduleEventDto;
import cz.osu.pesa.swi125.model.entity.AppUser;
import cz.osu.pesa.swi125.model.entity.ScheduleEvent;
import cz.osu.pesa.swi125.model.repository.AppUserRepository;
import cz.osu.pesa.swi125.model.repository.ScheduleEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ScheduleEventService {

    private final ScheduleEventRepository eventRepository;
    private final AppUserRepository userRepository;

    public ScheduleEventService(ScheduleEventRepository eventRepository, AppUserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ScheduleEventDto addEvent(AddScheduleEventRequest eventRequest) {
        if (eventRequest.getUserId() == null) {
             throw new IllegalArgumentException("User ID must be provided to add an event.");
        }
        
        AppUser user = userRepository.findById(eventRequest.getUserId())
            .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + eventRequest.getUserId()));

        if (eventRequest.getEventDate() == null || eventRequest.getEventName() == null || eventRequest.getEventName().trim().isEmpty() ||
            eventRequest.getEventColor() == null || eventRequest.getEventColor().trim().isEmpty()) {
            throw new IllegalArgumentException("Event date, name, and color cannot be empty");
        }

        ScheduleEvent event = new ScheduleEvent();
        event.setUser(user);
        event.setEventDate(eventRequest.getEventDate());
        event.setEventName(eventRequest.getEventName().trim());
        event.setEventColor(eventRequest.getEventColor().trim());

        ScheduleEvent savedEvent = eventRepository.save(event);
        return convertToDto(savedEvent);
    }

    @Transactional(readOnly = true)
    public List<ScheduleEventDto> getEventsForMonth(Integer userId, int year, int month) {
         if (userId == null) {
             throw new IllegalArgumentException("User ID must be provided to get events.");
         }
         
        AppUser user = userRepository.findById(userId)
             .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<ScheduleEvent> events = eventRepository.findByUserAndEventDateBetweenOrderByEventDateAsc(user, startDate, endDate);
        return events.stream()
                     .map(this::convertToDto)
                     .collect(Collectors.toList());
    }
    
    private ScheduleEventDto convertToDto(ScheduleEvent event) {
        return new ScheduleEventDto(
            event.getEventId(),
            event.getEventDate(),
            event.getEventName(),
            event.getEventColor()
        );
    }

    // TODO: Add methods for updating and deleting events if needed
} 