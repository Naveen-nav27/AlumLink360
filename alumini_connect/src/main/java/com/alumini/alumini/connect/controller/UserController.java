package com.alumini.alumini.connect.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.alumini.alumini.connect.dto.UserResponse;
import com.alumini.alumini.connect.service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            UserResponse resp = userService.getById(id);
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody UserResponse req) {
        try {
            UserResponse resp = userService.updateProfile(id, req);
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/college/{code}")
    public ResponseEntity<List<UserResponse>> getByCollegeAndRole(
            @PathVariable String code,
            @RequestParam(required = false) String role) {
        if (role != null) {
            return ResponseEntity.ok(userService.getByCollegeAndRole(code, role));
        } else {
            return ResponseEntity.ok(userService.getAllByCollege(code));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long id,
            @RequestParam Long adminId) {
        try {
            userService.deleteUser(id, adminId);
            return ResponseEntity.ok().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}