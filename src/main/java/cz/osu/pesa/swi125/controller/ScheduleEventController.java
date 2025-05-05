package cz.osu.pesa.swi125.controller;

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

    // Removed Principal parameter
    @PostMapping("/events")
    public ResponseEntity<?> addEvent(@RequestBody ScheduleEventDto eventDto) {
        String username = null; // Placeholder - This needs to be resolved!
        if (username == null) { 
            // Returning error until user identification is handled
            return new ResponseEntity<>(new ErrorResponse("User identification missing in request"), HttpStatus.UNAUTHORIZED); 
        }

        try {
             // This call will likely fail now as username is null or needs to be obtained differently
            ScheduleEventDto savedEvent = eventService.addEvent(eventDto, username); 
            return new ResponseEntity<>(savedEvent, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(new ErrorResponse(e.getMessage()), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error adding schedule event: " + e.getMessage());
            return new ResponseEntity<>(new ErrorResponse("Failed to add event"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Removed Principal parameter
    @GetMapping("/events")
    public ResponseEntity<?> getEvents(
            @RequestParam int year, 
            @RequestParam int month)
            // Removed: Principal principal 
    {
         // TODO: Resolve user identification. Principal was removed.
         //       Need to either re-add authentication, pass user info in request,
         //       or use a default user.
        String username = null; // Placeholder - This needs to be resolved!
        if (username == null) { 
            // Returning error until user identification is handled
            return new ResponseEntity<>(new ErrorResponse("User identification missing in request"), HttpStatus.UNAUTHORIZED);
        }

        if (month < 1 || month > 12 || year < 1900 || year > 3000) {
            return new ResponseEntity<>(new ErrorResponse("Invalid year or month parameter"), HttpStatus.BAD_REQUEST);
        }

        try {
             // This call will likely fail now as username is null or needs to be obtained differently
            List<ScheduleEventDto> events = eventService.getEventsForMonth(username, year, month); 
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