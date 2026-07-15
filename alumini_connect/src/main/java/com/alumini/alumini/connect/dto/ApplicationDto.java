package com.alumini.alumini.connect.dto;

import java.time.LocalDateTime;

public class ApplicationDto {
    private Long id;
    private Long jobId;
    private String jobTitle;
    private Long eventId;
    private String eventTitle;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private Long studentCollegeId;
    private String studentCollegeCode;
    private String studentCollegeName;
    private Double cgpaAtApply;
    private Integer gradYear;
    private String resumeUrl;
    private String notes;
    private LocalDateTime appliedAt;

    public ApplicationDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }
    public String getEventTitle() { return eventTitle; }
    public void setEventTitle(String eventTitle) { this.eventTitle = eventTitle; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }
    public Long getStudentCollegeId() { return studentCollegeId; }
    public void setStudentCollegeId(Long studentCollegeId) { this.studentCollegeId = studentCollegeId; }
    public String getStudentCollegeCode() { return studentCollegeCode; }
    public void setStudentCollegeCode(String studentCollegeCode) { this.studentCollegeCode = studentCollegeCode; }
    public String getStudentCollegeName() { return studentCollegeName; }
    public void setStudentCollegeName(String studentCollegeName) { this.studentCollegeName = studentCollegeName; }
    public Double getCgpaAtApply() { return cgpaAtApply; }
    public void setCgpaAtApply(Double cgpaAtApply) { this.cgpaAtApply = cgpaAtApply; }
    public Integer getGradYear() { return gradYear; }
    public void setGradYear(Integer gradYear) { this.gradYear = gradYear; }
    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }
}
