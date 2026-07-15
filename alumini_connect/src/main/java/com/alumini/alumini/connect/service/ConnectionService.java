package com.alumini.alumini.connect.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.alumini.alumini.connect.dto.ConnectionDto;
import com.alumini.alumini.connect.entity.College;
import com.alumini.alumini.connect.entity.ConnectionRequest;
import com.alumini.alumini.connect.entity.User;
import com.alumini.alumini.connect.repository.CollegeRepository;
import com.alumini.alumini.connect.repository.ConnectionRequestRepository;
import com.alumini.alumini.connect.repository.UserRepository;

@Service
public class ConnectionService {

    @Autowired
    private ConnectionRequestRepository connectionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CollegeRepository collegeRepository;

    // Helper: Map Entity to DTO
    public ConnectionDto mapToDto(ConnectionRequest req) {
        if (req == null) return null;
        ConnectionDto dto = new ConnectionDto();
        dto.setId(req.getId());
        
        if (req.getFromUser() != null) {
            dto.setFromUserId(req.getFromUser().getId());
            dto.setFromUserName(req.getFromUser().getFullName());
            dto.setFromUserRoll(req.getFromUser().getRollNumber() != null ? req.getFromUser().getRollNumber() : String.valueOf(req.getFromUser().getId()));
            dto.setFromUserImg(req.getFromUser().getPhotoUrl());
            dto.setFromUserDept(req.getFromUser().getDepartment());
            dto.setFromRole(req.getFromUser().getRole().name().toLowerCase());
        }
        if (req.getFromCollege() != null) {
            dto.setFromCollegeCode(req.getFromCollege().getCode());
            dto.setFromCollegeName(req.getFromCollege().getName());
        }

        if (req.getToUser() != null) {
            dto.setToUserId(req.getToUser().getId());
            dto.setToUserName(req.getToUser().getFullName());
            dto.setToUserRoll(req.getToUser().getRollNumber() != null ? req.getToUser().getRollNumber() : String.valueOf(req.getToUser().getId()));
            dto.setToUserImg(req.getToUser().getPhotoUrl());
            dto.setToUserDept(req.getToUser().getDepartment());
            dto.setToRole(req.getToUser().getRole().name().toLowerCase());
        }
        if (req.getToCollege() != null) {
            dto.setToCollegeCode(req.getToCollege().getCode());
            dto.setToCollegeName(req.getToCollege().getName());
        }

        dto.setStatus(req.getStatus());
        dto.setMessage(req.getMessage());
        dto.setSentAt(req.getSentAt());
        return dto;
    }

    public ConnectionDto sendRequest(ConnectionDto dto, Long fromUserId) {
        User fromUser = userRepository.findById(fromUserId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));

        User toUser = userRepository.findById(dto.getToUserId())
                .orElseThrow(() -> new IllegalArgumentException("Recipient not found"));

        if (fromUserId.equals(dto.getToUserId())) {
            throw new IllegalArgumentException("Cannot connect with yourself");
        }

        if (connectionRepository.findByFromUserIdAndToUserId(fromUserId, dto.getToUserId()).isPresent()) {
            throw new IllegalStateException("Connection request or link already exists between these users");
        }

        ConnectionRequest req = new ConnectionRequest();
        req.setFromUser(fromUser);
        req.setFromCollege(fromUser.getCollege());
        req.setToUser(toUser);
        req.setToCollege(toUser.getCollege());
        req.setStatus("pending");
        req.setMessage(dto.getMessage());
        req.setSentAt(LocalDateTime.now());

        ConnectionRequest saved = connectionRepository.save(req);
        return mapToDto(saved);
    }

    public ConnectionDto acceptRequest(Long requestId, Long userId) {
        ConnectionRequest req = connectionRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found: " + requestId));

        if (!req.getToUser().getId().equals(userId)) {
            throw new IllegalStateException("Unauthorized: Only the recipient can accept this connection");
        }

        req.setStatus("accepted");
        ConnectionRequest saved = connectionRepository.save(req);
        return mapToDto(saved);
    }

    public ConnectionDto rejectRequest(Long requestId, Long userId) {
        ConnectionRequest req = connectionRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found: " + requestId));

        if (!req.getToUser().getId().equals(userId)) {
            throw new IllegalStateException("Unauthorized: Only the recipient can decline this connection");
        }

        req.setStatus("rejected");
        ConnectionRequest saved = connectionRepository.save(req);
        return mapToDto(saved);
    }

    public List<ConnectionDto> getConnectionsForUser(Long userId) {
        return connectionRepository.findByFromUserIdOrToUserId(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
}
