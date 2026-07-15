package com.alumini.alumini.connect.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.alumini.alumini.connect.dto.JobDto;
import com.alumini.alumini.connect.service.JobService;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class JobController {

    @Autowired
    private JobService jobService;

    @PostMapping
    public ResponseEntity<?> createJob(@RequestBody JobDto dto, @RequestParam Long userId) {
        try {
            JobDto resp = jobService.createJob(dto, userId);
            return ResponseEntity.ok(resp);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/college/{code}")
    public ResponseEntity<List<JobDto>> getJobsByCollege(
            @PathVariable String code,
            @RequestParam Long userId) {
        return ResponseEntity.ok(jobService.getJobsByCollege(code, userId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<JobDto>> getMyJobs(@RequestParam Long userId) {
        return ResponseEntity.ok(jobService.getMyJobs(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateJob(
            @PathVariable Long id,
            @RequestBody JobDto dto,
            @RequestParam Long userId) {
        try {
            JobDto resp = jobService.updateJob(id, dto, userId);
            return ResponseEntity.ok(resp);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(
            @PathVariable Long id,
            @RequestParam Long userId) {
        try {
            jobService.deleteJob(id, userId);
            return ResponseEntity.ok().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
