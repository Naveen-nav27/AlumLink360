package com.alumini.alumini.connect.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.alumini.alumini.connect.dto.MessageDto;
import com.alumini.alumini.connect.service.MessageService;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody MessageDto dto, @RequestParam Long senderId) {
        try {
            MessageDto resp = messageService.sendMessage(dto, senderId);
            return ResponseEntity.ok(resp);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/thread/{requestId}")
    public ResponseEntity<?> getThread(@PathVariable Long requestId, @RequestParam Long userId) {
        try {
            List<MessageDto> resp = messageService.getThread(requestId, userId);
            return ResponseEntity.ok(resp);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/thread/{requestId}/read")
    public ResponseEntity<?> markThreadRead(@PathVariable Long requestId, @RequestParam Long userId) {
        try {
            messageService.markThreadRead(requestId, userId);
            return ResponseEntity.ok().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
