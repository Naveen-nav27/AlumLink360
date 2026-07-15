package com.alumini.alumini.connect.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.alumini.alumini.connect.dto.ApplicationDto;
import com.alumini.alumini.connect.service.ApplicationService;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @PostMapping
    public ResponseEntity<?> apply(@RequestBody ApplicationDto dto, @RequestParam Long userId) {
        try {
            ApplicationDto resp = applicationService.apply(dto, userId);
            return ResponseEntity.ok(resp);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<?> getByJob(@PathVariable Long jobId, @RequestParam Long userId) {
        try {
            List<ApplicationDto> resp = applicationService.getByJob(jobId, userId);
            return ResponseEntity.ok(resp);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<?> getByEvent(@PathVariable Long eventId, @RequestParam Long userId) {
        try {
            List<ApplicationDto> resp = applicationService.getByEvent(eventId, userId);
            return ResponseEntity.ok(resp);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getByStudent(@PathVariable Long studentId, @RequestParam Long userId) {
        try {
            List<ApplicationDto> resp = applicationService.getByStudent(studentId, userId);
            return ResponseEntity.ok(resp);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
