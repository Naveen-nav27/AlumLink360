package com.alumini.alumini.connect.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.alumini.alumini.connect.dto.MessageDto;
import com.alumini.alumini.connect.entity.ConnectionRequest;
import com.alumini.alumini.connect.entity.Message;
import com.alumini.alumini.connect.entity.User;
import com.alumini.alumini.connect.repository.ConnectionRequestRepository;
import com.alumini.alumini.connect.repository.MessageRepository;
import com.alumini.alumini.connect.repository.UserRepository;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ConnectionRequestRepository connectionRepository;

    @Autowired
    private UserRepository userRepository;

    // Helper: Map Entity to DTO
    public MessageDto mapToDto(Message msg) {
        if (msg == null) return null;
        MessageDto dto = new MessageDto();
        dto.setId(msg.getId());
        if (msg.getConnectionRequest() != null) {
            dto.setConnectionRequestId(msg.getConnectionRequest().getId());
        }
        if (msg.getSender() != null) {
            dto.setSenderId(msg.getSender().getId());
            dto.setSenderName(msg.getSender().getFullName());
        }
        dto.setContent(msg.getContent());
        dto.setSentAt(msg.getSentAt());
        dto.setIsRead(msg.getIsRead());
        return dto;
    }

    public MessageDto sendMessage(MessageDto dto, Long senderId) {
        ConnectionRequest req = connectionRepository.findById(dto.getConnectionRequestId())
                .orElseThrow(() -> new IllegalArgumentException("Connection not found: " + dto.getConnectionRequestId()));

        if (!"accepted".equalsIgnoreCase(req.getStatus())) {
            throw new IllegalStateException("Cannot send message on a pending/inactive connection link");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));

        // Verify sender is participant in the connection
        if (!req.getFromUser().getId().equals(senderId) && !req.getToUser().getId().equals(senderId)) {
            throw new IllegalStateException("Unauthorized: Not a participant in this conversation thread");
        }

        Message msg = new Message();
        msg.setConnectionRequest(req);
        msg.setSender(sender);
        msg.setContent(dto.getContent());
        msg.setSentAt(LocalDateTime.now());
        msg.setIsRead(false);

        Message saved = messageRepository.save(msg);
        return mapToDto(saved);
    }

    public List<MessageDto> getThread(Long requestId, Long userId) {
        ConnectionRequest req = connectionRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Connection not found: " + requestId));

        if (!req.getFromUser().getId().equals(userId) && !req.getToUser().getId().equals(userId)) {
            throw new IllegalStateException("Unauthorized: Not a participant in this conversation thread");
        }

        // Mark incoming messages as read
        List<Message> unread = messageRepository.findByConnectionRequestIdAndIsReadFalseAndSenderIdNot(requestId, userId);
        for (Message msg : unread) {
            msg.setIsRead(true);
        }
        if (!unread.isEmpty()) {
            messageRepository.saveAll(unread);
        }

        return messageRepository.findByConnectionRequestIdOrderBySentAtAsc(requestId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public void markThreadRead(Long requestId, Long userId) {
        ConnectionRequest req = connectionRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Connection not found"));

        if (!req.getFromUser().getId().equals(userId) && !req.getToUser().getId().equals(userId)) {
            throw new IllegalStateException("Unauthorized");
        }

        List<Message> unread = messageRepository.findByConnectionRequestIdAndIsReadFalseAndSenderIdNot(requestId, userId);
        for (Message msg : unread) {
            msg.setIsRead(true);
        }
        messageRepository.saveAll(unread);
    }
}
