package com.alumini.alumini.connect.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.alumini.alumini.connect.dto.EventDto;
import com.alumini.alumini.connect.service.EventService;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventController {

    @Autowired
    private EventService eventService;

    @PostMapping
    public ResponseEntity<?> createEvent(@RequestBody EventDto dto, @RequestParam Long userId) {
        try {
            EventDto resp = eventService.createEvent(dto, userId);
            return ResponseEntity.ok(resp);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/college/{code}")
    public ResponseEntity<List<EventDto>> getEventsByCollege(
            @PathVariable String code,
            @RequestParam Long userId) {
        return ResponseEntity.ok(eventService.getEventsByCollege(code, userId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<EventDto>> getMyEvents(@RequestParam Long userId) {
        return ResponseEntity.ok(eventService.getMyEvents(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(
            @PathVariable Long id,
            @RequestBody EventDto dto,
            @RequestParam Long userId) {
        try {
            EventDto resp = eventService.updateEvent(id, dto, userId);
            return ResponseEntity.ok(resp);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(
            @PathVariable Long id,
            @RequestParam Long userId) {
        try {
            eventService.deleteEvent(id, userId);
            return ResponseEntity.ok().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
