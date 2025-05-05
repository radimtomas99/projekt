package cz.osu.pesa.swi125.service;

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
    public ScheduleEventDto addEvent(ScheduleEventDto eventDto, String username) {
        AppUser user = userRepository.findByUsername(username);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        // Basic validation
        if (eventDto.getEventDate() == null || eventDto.getEventName() == null || eventDto.getEventName().trim().isEmpty() ||
            eventDto.getEventColor() == null || eventDto.getEventColor().trim().isEmpty()) {
            throw new IllegalArgumentException("Event date, name, and color cannot be empty");
        }

        ScheduleEvent event = new ScheduleEvent();
        event.setUser(user);
        event.setEventDate(eventDto.getEventDate());
        event.setEventName(eventDto.getEventName().trim());
        event.setEventColor(eventDto.getEventColor().trim());

        ScheduleEvent savedEvent = eventRepository.save(event);
        return convertToDto(savedEvent);
    }

    @Transactional(readOnly = true)
    public List<ScheduleEventDto> getEventsForMonth(String username, int year, int month) {
        AppUser user = userRepository.findByUsername(username);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<ScheduleEvent> events = eventRepository.findByUserAndEventDateBetweenOrderByEventDateAsc(user, startDate, endDate);
        return events.stream()
                     .map(this::convertToDto)
                     .collect(Collectors.toList());
    }
    
    // Helper method to convert Entity to DTO
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