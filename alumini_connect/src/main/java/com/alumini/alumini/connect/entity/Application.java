package com.alumini.alumini.connect.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id")
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_college_id", nullable = false)
    private College studentCollege;

    @Column(name = "cgpa_at_apply")
    private Double cgpaAtApply;

    @Column(name = "grad_year")
    private Integer gradYear;

    @Column(name = "resume_url", length = 500)
    private String resumeUrl;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "applied_at")
    private LocalDateTime appliedAt = LocalDateTime.now();

    public Application() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Job getJob() { return job; }
    public void setJob(Job job) { this.job = job; }
    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }
    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
    public College getStudentCollege() { return studentCollege; }
    public void setStudentCollege(College studentCollege) { this.studentCollege = studentCollege; }
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
