package com.alumini.alumini.connect.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "connection_requests",
    uniqueConstraints = @UniqueConstraint(columnNames = {"from_user_id", "to_user_id"}))
public class ConnectionRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "from_user_id", nullable = false)
    private User fromUser;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "from_college_id", nullable = false)
    private College fromCollege;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "to_user_id", nullable = false)
    private User toUser;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "to_college_id", nullable = false)
    private College toCollege;

    @Column(name = "status", length = 20)
    private String status = "pending"; // pending, accepted, rejected

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "sent_at")
    private LocalDateTime sentAt = LocalDateTime.now();

    public ConnectionRequest() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getFromUser() { return fromUser; }
    public void setFromUser(User fromUser) { this.fromUser = fromUser; }
    public College getFromCollege() { return fromCollege; }
    public void setFromCollege(College fromCollege) { this.fromCollege = fromCollege; }
    public User getToUser() { return toUser; }
    public void setToUser(User toUser) { this.toUser = toUser; }
    public College getToCollege() { return toCollege; }
    public void setToCollege(College toCollege) { this.toCollege = toCollege; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
}
