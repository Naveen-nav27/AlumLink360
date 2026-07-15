package com.alumini.alumini.connect.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.alumini.alumini.connect.dto.ApplicationDto;
import com.alumini.alumini.connect.entity.*;
import com.alumini.alumini.connect.repository.ApplicationRepository;
import com.alumini.alumini.connect.repository.EventRepository;
import com.alumini.alumini.connect.repository.JobRepository;
import com.alumini.alumini.connect.repository.UserRepository;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private EventRepository eventRepository;

    // Helper: Map Entity to DTO
    public ApplicationDto mapToDto(Application app) {
        if (app == null) return null;
        ApplicationDto dto = new ApplicationDto();
        dto.setId(app.getId());
        if (app.getJob() != null) {
            dto.setJobId(app.getJob().getId());
            dto.setJobTitle(app.getJob().getTitle());
        }
        if (app.getEvent() != null) {
            dto.setEventId(app.getEvent().getId());
            dto.setEventTitle(app.getEvent().getTitle());
        }
        if (app.getStudent() != null) {
            dto.setStudentId(app.getStudent().getId());
            dto.setStudentName(app.getStudent().getFullName());
            dto.setStudentEmail(app.getStudent().getEmail());
        }
        if (app.getStudentCollege() != null) {
            dto.setStudentCollegeId(app.getStudentCollege().getId());
            dto.setStudentCollegeCode(app.getStudentCollege().getCode());
            dto.setStudentCollegeName(app.getStudentCollege().getName());
        }
        dto.setCgpaAtApply(app.getCgpaAtApply());
        dto.setGradYear(app.getGradYear());
        dto.setResumeUrl(app.getResumeUrl());
        dto.setNotes(app.getNotes());
        dto.setAppliedAt(app.getAppliedAt());
        return dto;
    }

    public ApplicationDto apply(ApplicationDto dto, Long studentUserId) {
        User student = userRepository.findById(studentUserId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + studentUserId));

        if (student.getRole() != Role.STUDENT) {
            throw new IllegalStateException("Unauthorized: Only students can apply for openings");
        }

        if (dto.getJobId() == null && dto.getEventId() == null) {
            throw new IllegalArgumentException("Application must reference a valid Job or Event");
        }

        Application app = new Application();
        app.setStudent(student);
        app.setStudentCollege(student.getCollege());
        app.setCgpaAtApply(student.getCgpa() != null ? student.getCgpa() : 0.0);
        app.setGradYear(student.getGraduationYear());
        app.setResumeUrl(student.getResumeUrl());
        app.setNotes(dto.getNotes());
        app.setAppliedAt(LocalDateTime.now());

        College hostCollege;

        if (dto.getJobId() != null) {
            Job job = jobRepository.findById(dto.getJobId())
                    .orElseThrow(() -> new IllegalArgumentException("Job opening not found"));

            if (applicationRepository.existsByJobIdAndStudentId(dto.getJobId(), studentUserId)) {
                throw new IllegalStateException("Already applied for this job opening");
            }

            hostCollege = job.getCollege();
            app.setJob(job);
        } else {
            Event event = eventRepository.findById(dto.getEventId())
                    .orElseThrow(() -> new IllegalArgumentException("Event opening not found"));

            if (applicationRepository.existsByEventIdAndStudentId(dto.getEventId(), studentUserId)) {
                throw new IllegalStateException("Already registered for this campus event");
            }

            hostCollege = event.getCollege();
            app.setEvent(event);
        }

        // Validate target college minimum CGPA settings
        if (hostCollege != null && hostCollege.getMinCgpa() != null) {
            double studentCgpa = student.getCgpa() != null ? student.getCgpa() : 0.0;
            if (studentCgpa < hostCollege.getMinCgpa()) {
                throw new IllegalStateException(String.format(
                    "Application blocked: Your CGPA (%.2f) is below the minimum required CGPA of %.2f configured by the hosting institution (%s).",
                    studentCgpa, hostCollege.getMinCgpa(), hostCollege.getName()));
            }
        }

        Application saved = applicationRepository.save(app);
        return mapToDto(saved);
    }

    public List<ApplicationDto> getByJob(Long jobId, Long requestingUserId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found"));

        User user = userRepository.findById(requestingUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Only the owner of the post or college admin can view applications
        if (user.getRole() != Role.ADMIN && !job.getPostedBy().getId().equals(requestingUserId)) {
            throw new IllegalStateException("Unauthorized: Only the posting creator can view applicant submissions");
        }

        if (user.getRole() == Role.ADMIN && !job.getCollege().getId().equals(user.getCollege().getId())) {
            throw new IllegalStateException("Unauthorized: Admin can only manage postings of their own college");
        }

        return applicationRepository.findByJobId(jobId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ApplicationDto> getByEvent(Long eventId, Long requestingUserId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        User user = userRepository.findById(requestingUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getRole() != Role.ADMIN && !event.getPostedBy().getId().equals(requestingUserId)) {
            throw new IllegalStateException("Unauthorized: Only the hosting organizer can view registrations");
        }

        if (user.getRole() == Role.ADMIN && !event.getCollege().getId().equals(user.getCollege().getId())) {
            throw new IllegalStateException("Unauthorized: Admin can only manage postings of their own college");
        }

        return applicationRepository.findByEventId(eventId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ApplicationDto> getByStudent(Long studentId, Long requestingUserId) {
        User requester = userRepository.findById(requestingUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (requester.getRole() != Role.ADMIN && !studentId.equals(requestingUserId)) {
            throw new IllegalStateException("Unauthorized: Cannot view another student's applications");
        }

        if (requester.getRole() == Role.ADMIN) {
            User student = userRepository.findById(studentId)
                    .orElseThrow(() -> new IllegalArgumentException("Student not found"));
            if (!requester.getCollege().getId().equals(student.getCollege().getId())) {
                throw new IllegalStateException("Unauthorized: Admin cannot view records from other colleges");
            }
        }

        return applicationRepository.findByStudentId(studentId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
}
