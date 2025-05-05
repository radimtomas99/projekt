package cz.osu.pesa.swi125.model.repository;

import cz.osu.pesa.swi125.model.entity.ScheduleEvent;
import cz.osu.pesa.swi125.model.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ScheduleEventRepository extends JpaRepository<ScheduleEvent, Integer> {

    // Find events by user
    List<ScheduleEvent> findByUserOrderByEventDateAsc(AppUser user);

    // Find events by user and date
    List<ScheduleEvent> findByUserAndEventDate(AppUser user, LocalDate date);

    // Find events by user within a date range (useful for month view)
    List<ScheduleEvent> findByUserAndEventDateBetweenOrderByEventDateAsc(AppUser user, LocalDate startDate, LocalDate endDate);

} 