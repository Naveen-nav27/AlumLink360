package com.alumini.alumini.connect.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.alumini.alumini.connect.dto.CollegeResponse;
import com.alumini.alumini.connect.entity.College;
import com.alumini.alumini.connect.entity.Role;
import com.alumini.alumini.connect.entity.User;
import com.alumini.alumini.connect.repository.*;

@Service
public class CollegeService {

    @Autowired
    private CollegeRepository collegeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private EventRepository eventRepository;

    // Map Entity to Response DTO
    public CollegeResponse mapToResponse(College college) {
        if (college == null) return null;
        CollegeResponse resp = new CollegeResponse();
        resp.setId(college.getId());
        resp.setCode(college.getCode());
        resp.setName(college.getName());
        resp.setLogoUrl(college.getLogoUrl());
        resp.setThemeColor(college.getThemeColor());
        resp.setMinCgpa(college.getMinCgpa());
        resp.setWelcomeMsg(college.getWelcomeMsg());

        // Count stats
        resp.setStudentCount(userRepository.countByCollegeIdAndRole(college.getId(), Role.STUDENT));
        resp.setAlumniCount(userRepository.countByCollegeIdAndRole(college.getId(), Role.ALUMNI));
        resp.setJobCount(jobRepository.countByCollegeId(college.getId()));
        resp.setEventCount(eventRepository.countByCollegeId(college.getId()));

        return resp;
    }

    public List<CollegeResponse> getAllColleges() {
        return collegeRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CollegeResponse getByCode(String code) {
        College college = collegeRepository.findByCode(code.toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("College not found with code: " + code));
        return mapToResponse(college);
    }

    public CollegeResponse updateSettings(String code, CollegeResponse req, Long adminUserId) {
        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));

        if (admin.getRole() != Role.ADMIN) {
            throw new IllegalStateException("Unauthorized: Only administrators can update college settings");
        }

        College college = collegeRepository.findByCode(code.toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("College not found"));

        if (!admin.getCollege().getId().equals(college.getId())) {
            throw new IllegalStateException("Unauthorized: Admin can only manage their own college settings");
        }

        if (req.getMinCgpa() != null) college.setMinCgpa(req.getMinCgpa());
        if (req.getThemeColor() != null) college.setThemeColor(req.getThemeColor());
        if (req.getWelcomeMsg() != null) college.setWelcomeMsg(req.getWelcomeMsg());
        if (req.getLogoUrl() != null) college.setLogoUrl(req.getLogoUrl());
        if (req.getName() != null) college.setName(req.getName());

        College saved = collegeRepository.save(college);
        return mapToResponse(saved);
    }
}
