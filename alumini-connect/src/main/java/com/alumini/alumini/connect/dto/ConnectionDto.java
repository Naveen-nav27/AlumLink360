package com.alumini.alumini.connect.dto;

import java.time.LocalDateTime;

public class ConnectionDto {
    private Long id;
    private Long fromUserId;
    private String fromUserName;
    private String fromUserRoll; // rollNumber/id in frontend
    private String fromUserImg;  // photoUrl
    private String fromUserDept;
    private String fromCollegeCode;
    private String fromCollegeName;
    private String fromRole;
    private Long toUserId;
    private String toUserName;
    private String toUserRoll; // rollNumber/id in frontend
    private String toUserImg;  // photoUrl
    private String toUserDept;
    private String toCollegeCode;
    private String toCollegeName;
    private String toRole;
    private String status;
    private String message;
    private LocalDateTime sentAt;

    public ConnectionDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getFromUserId() { return fromUserId; }
    public void setFromUserId(Long fromUserId) { this.fromUserId = fromUserId; }
    public String getFromUserName() { return fromUserName; }
    public void setFromUserName(String fromUserName) { this.fromUserName = fromUserName; }
    public String getFromUserRoll() { return fromUserRoll; }
    public void setFromUserRoll(String fromUserRoll) { this.fromUserRoll = fromUserRoll; }
    public String getFromUserImg() { return fromUserImg; }
    public void setFromUserImg(String fromUserImg) { this.fromUserImg = fromUserImg; }
    public String getFromUserDept() { return fromUserDept; }
    public void setFromUserDept(String fromUserDept) { this.fromUserDept = fromUserDept; }
    public String getFromCollegeCode() { return fromCollegeCode; }
    public void setFromCollegeCode(String collegeCode) { this.fromCollegeCode = collegeCode; }
    public String getFromCollegeName() { return fromCollegeName; }
    public void setFromCollegeName(String fromCollegeName) { this.fromCollegeName = fromCollegeName; }
    public String getFromRole() { return fromRole; }
    public void setFromRole(String fromRole) { this.fromRole = fromRole; }
    public Long getToUserId() { return toUserId; }
    public void setToUserId(Long toUserId) { this.toUserId = toUserId; }
    public String getToUserName() { return toUserName; }
    public void setToUserName(String toUserName) { this.toUserName = toUserName; }
    public String getToUserRoll() { return toUserRoll; }
    public void setToUserRoll(String toUserRoll) { this.toUserRoll = toUserRoll; }
    public String getToUserImg() { return toUserImg; }
    public void setToUserImg(String toUserImg) { this.toUserImg = toUserImg; }
    public String getToUserDept() { return toUserDept; }
    public void setToUserDept(String toUserDept) { this.toUserDept = toUserDept; }
    public String getToCollegeCode() { return toCollegeCode; }
    public void setToCollegeCode(String toCollegeCode) { this.toCollegeCode = toCollegeCode; }
    public String getToCollegeName() { return toCollegeName; }
    public void setToCollegeName(String toCollegeName) { this.toCollegeName = toCollegeName; }
    public String getToRole() { return toRole; }
    public void setToRole(String toRole) { this.toRole = toRole; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
}
