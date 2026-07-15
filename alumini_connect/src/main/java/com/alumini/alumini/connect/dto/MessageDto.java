package com.alumini.alumini.connect.dto;

import java.time.LocalDateTime;

public class MessageDto {
    private Long id;
    private Long connectionRequestId;
    private Long senderId;
    private String senderName;
    private String content; // text in frontend
    private LocalDateTime sentAt;
    private Boolean isRead;

    public MessageDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getConnectionRequestId() { return connectionRequestId; }
    public void setConnectionRequestId(Long connectionRequestId) { this.connectionRequestId = connectionRequestId; }
    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }
    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
}
