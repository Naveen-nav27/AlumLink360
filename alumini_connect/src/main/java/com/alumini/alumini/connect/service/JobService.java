package com.alumini.alumini.connect.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.alumini.alumini.connect.dto.JobDto;
import com.alumini.alumini.connect.entity.College;
import com.alumini.alumini.connect.entity.Job;
import com.alumini.alumini.connect.entity.Role;
import com.alumini.alumini.connect.entity.User;
import com.alumini.alumini.connect.repository.JobRepository;
import com.alumini.alumini.connect.repository.UserRepository;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    // Helper: Map Entity to DTO
    public JobDto mapToDto(Job job) {
        if (job == null) return null;
        JobDto dto = new JobDto();
        dto.setId(job.getId());
        if (job.getCollege() != null) {
            dto.setCollegeId(job.getCollege().getId());
            dto.setCollegeCode(job.getCollege().getCode());
            dto.setCollegeName(job.getCollege().getName());
        }
        if (job.getPostedBy() != null) {
            dto.setPostedById(job.getPostedBy().getId());
            dto.setPostedByName(job.getPostedBy().getFullName());
        }
        dto.setTitle(job.getTitle());
        dto.setHostCompany(job.getHostCompany());
        dto.setLocation(job.getLocation());
        dto.setTags(job.getTags());
        dto.setDescription(job.getDescription());
        dto.setDeadline(job.getDeadline());
        dto.setIsPublic(job.getIsPublic());
        dto.setCreatedAt(job.getCreatedAt());
        return dto;
    }

    public JobDto createJob(JobDto dto, Long postedByUserId) {
        User user = userRepository.findById(postedByUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + postedByUserId));

        if (user.getRole() == Role.STUDENT) {
            throw new IllegalStateException("Unauthorized: Students cannot post jobs");
        }

        College college = user.getCollege();

        Job job = new Job();
        job.setCollege(college);
        job.setPostedBy(user);
        job.setTitle(dto.getTitle());
        job.setHostCompany(dto.getHostCompany());
        job.setLocation(dto.getLocation());
        job.setTags(dto.getTags());
        job.setDescription(dto.getDescription());
        job.setDeadline(dto.getDeadline());
        job.setIsPublic(dto.getIsPublic() != null ? dto.getIsPublic() : false);

        Job saved = jobRepository.save(job);
        return mapToDto(saved);
    }

    public List<JobDto> getJobsByCollege(String collegeCode, Long userId) {
        // OWN college + all PUBLIC jobs
        List<Job> ownJobs = jobRepository.findByCollegeCode(collegeCode.toLowerCase());
        List<Job> publicJobs = jobRepository.findByIsPublicTrue();

        ownJobs.addAll(publicJobs);

        // Deduplicate by ID
        return ownJobs.stream()
                .distinct()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<JobDto> getMyJobs(Long userId) {
        return jobRepository.findByPostedById(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public JobDto updateJob(Long id, JobDto dto, Long userId) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Job not found: " + id));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Only owner or ADMIN of same college can update
        if (user.getRole() != Role.ADMIN && !job.getPostedBy().getId().equals(userId)) {
            throw new IllegalStateException("Unauthorized: Cannot edit another user's job posting");
        }

        if (user.getRole() == Role.ADMIN && !job.getCollege().getId().equals(user.getCollege().getId())) {
            throw new IllegalStateException("Unauthorized: Admin cannot manage postings of other colleges");
        }

        if (dto.getTitle() != null) job.setTitle(dto.getTitle());
        if (dto.getHostCompany() != null) job.setHostCompany(dto.getHostCompany());
        if (dto.getLocation() != null) job.setLocation(dto.getLocation());
        if (dto.getTags() != null) job.setTags(dto.getTags());
        if (dto.getDescription() != null) job.setDescription(dto.getDescription());
        if (dto.getDeadline() != null) job.setDeadline(dto.getDeadline());
        if (dto.getIsPublic() != null) job.setIsPublic(dto.getIsPublic());

        Job updated = jobRepository.save(job);
        return mapToDto(updated);
    }

    public void deleteJob(Long id, Long userId) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Job not found: " + id));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getRole() != Role.ADMIN && !job.getPostedBy().getId().equals(userId)) {
            throw new IllegalStateException("Unauthorized: Cannot delete another user's job posting");
        }

        if (user.getRole() == Role.ADMIN && !job.getCollege().getId().equals(user.getCollege().getId())) {
            throw new IllegalStateException("Unauthorized: Admin cannot delete postings of other colleges");
        }

        jobRepository.delete(job);
    }
}
