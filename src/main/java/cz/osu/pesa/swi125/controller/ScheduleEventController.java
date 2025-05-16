package cz.osu.pesa.swi125.controller;

import cz.osu.pesa.swi125.model.dto.AddScheduleEventRequest;
import cz.osu.pesa.swi125.model.dto.ErrorResponse;
import cz.osu.pesa.swi125.model.dto.ScheduleEventDto;
import cz.osu.pesa.swi125.service.ScheduleEventService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Removed Principal import
// import java.security.Principal;
import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/schedule") // Base path for schedule related endpoints
public class ScheduleEventController {

    private final ScheduleEventService eventService;

    public ScheduleEventController(ScheduleEventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping("/events")
    // Accept AddScheduleEventRequest which includes userId
    public ResponseEntity<?> addEvent(@RequestBody AddScheduleEventRequest eventRequest) { 
        try {
            // Service now expects the request object containing userId
            ScheduleEventDto savedEvent = eventService.addEvent(eventRequest); 
            return new ResponseEntity<>(savedEvent, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(new ErrorResponse(e.getMessage()), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error adding schedule event: " + e.getMessage());
            return new ResponseEntity<>(new ErrorResponse("Failed to add event"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/events")
    public ResponseEntity<?> getEvents(
            @RequestParam int year, 
            @RequestParam int month,
            @RequestParam Integer userId) // Accept userId as query parameter
    {
        if (userId == null) {
             return new ResponseEntity<>(new ErrorResponse("userId parameter is required"), HttpStatus.BAD_REQUEST);
        }
        
        if (month < 1 || month > 12 || year < 1900 || year > 3000) {
            return new ResponseEntity<>(new ErrorResponse("Invalid year or month parameter"), HttpStatus.BAD_REQUEST);
        }

        try {
            // Call service with userId from query parameter
            List<ScheduleEventDto> events = eventService.getEventsForMonth(userId, year, month); 
            return ResponseEntity.ok(events);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(new ErrorResponse(e.getMessage()), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error fetching schedule events: " + e.getMessage());
            return new ResponseEntity<>(new ErrorResponse("Failed to retrieve events"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // TODO: Add endpoints for updating and deleting events
} 