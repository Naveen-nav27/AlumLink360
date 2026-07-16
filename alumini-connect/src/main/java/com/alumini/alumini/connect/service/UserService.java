package com.alumini.alumini.connect.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.alumini.alumini.connect.dto.LoginRequest;
import com.alumini.alumini.connect.dto.RegisterRequest;
import com.alumini.alumini.connect.dto.UserResponse;
import com.alumini.alumini.connect.entity.College;
import com.alumini.alumini.connect.entity.Role;
import com.alumini.alumini.connect.entity.User;
import com.alumini.alumini.connect.repository.CollegeRepository;
import com.alumini.alumini.connect.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CollegeRepository collegeRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    // Helper: Map Entity to Response DTO
    public UserResponse mapToResponse(User user) {
        if (user == null) return null;
        UserResponse resp = new UserResponse();
        resp.setId(user.getId());
        resp.setFullName(user.getFullName());
        resp.setEmail(user.getEmail());
        resp.setRole(user.getRole().name());
        if (user.getCollege() != null) {
            resp.setCollegeCode(user.getCollege().getCode());
            resp.setCollegeName(user.getCollege().getName());
        }
        resp.setRollNumber(user.getRollNumber());
        resp.setDepartment(user.getDepartment());
        resp.setGraduationYear(user.getGraduationYear());
        resp.setPassedOutYear(user.getPassedOutYear());
        resp.setCgpa(user.getCgpa());
        resp.setResumeUrl(user.getResumeUrl());
        resp.setLinkedinUrl(user.getLinkedinUrl());
        resp.setPhotoUrl(user.getPhotoUrl());
        resp.setStatus(user.getStatus());
        return resp;
    }

    public User saveUser(User user) {
        if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // Register User via DTO
    public UserResponse register(RegisterRequest req) {
        College college = collegeRepository.findByCode(req.getCollegeCode().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("College not found: " + req.getCollegeCode()));

        if (userRepository.existsByEmailAndCollegeId(req.getEmail(), college.getId())) {
            throw new IllegalArgumentException("Email already registered for this institution");
        }

        User user = new User();
        user.setCollege(college);
        user.setFullName(req.getFullName());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole(Role.valueOf(req.getRole().toUpperCase()));
        user.setRollNumber(req.getRollNumber());
        user.setDepartment(req.getDepartment());
        user.setGraduationYear(req.getGraduationYear());
        user.setPassedOutYear(req.getPassedOutYear());
        user.setCgpa(req.getCgpa());
        user.setLinkedinUrl(req.getLinkedinUrl());
        user.setStatus("approved"); // Default approved as per original system database.js

        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }

    // Login User
    public UserResponse login(LoginRequest req) {
        College college = collegeRepository.findByCode(req.getCollegeCode().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("College not found: " + req.getCollegeCode()));

        User user = userRepository.findByEmailAndCollegeId(req.getEmail(), college.getId())
                .or(() -> userRepository.findByRollNumberAndCollegeId(req.getEmail(), college.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials or college selection"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials or college selection");
        }

        if (!user.getRole().name().equalsIgnoreCase(req.getRole())) {
            throw new IllegalArgumentException("Role mismatch for this account");
        }

        if ("suspended".equalsIgnoreCase(user.getStatus())) {
            throw new IllegalArgumentException("Account suspended. Contact administration.");
        }

        return mapToResponse(user);
    }

    // Get User by ID
    public UserResponse getById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        return mapToResponse(user);
    }

    // Get Users by College Code and Role
    public List<UserResponse> getByCollegeAndRole(String collegeCode, String roleStr) {
        Role role = Role.valueOf(roleStr.toUpperCase());
        return userRepository.findByCollegeCodeAndRole(collegeCode.toLowerCase(), role)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // List all users for a college (for admin dashboard etc)
    public List<UserResponse> getAllByCollege(String collegeCode) {
        return userRepository.findAllByCollegeCode(collegeCode.toLowerCase())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Update profile
    public UserResponse updateProfile(Long id, UserResponse req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (req.getFullName() != null) user.setFullName(req.getFullName());
        if (req.getDepartment() != null) user.setDepartment(req.getDepartment());
        if (req.getCgpa() != null) user.setCgpa(req.getCgpa());
        if (req.getResumeUrl() != null) user.setResumeUrl(req.getResumeUrl());
        if (req.getLinkedinUrl() != null) user.setLinkedinUrl(req.getLinkedinUrl());
        if (req.getPhotoUrl() != null) user.setPhotoUrl(req.getPhotoUrl());
        if (req.getStatus() != null) user.setStatus(req.getStatus());
        if (req.getGraduationYear() != null) user.setGraduationYear(req.getGraduationYear());
        if (req.getPassedOutYear() != null) user.setPassedOutYear(req.getPassedOutYear());

        User updated = userRepository.save(user);
        return mapToResponse(updated);
    }

    // Delete User
    public void deleteUser(Long id, Long adminUserId) {
        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));

        if (admin.getRole() != Role.ADMIN) {
            throw new IllegalStateException("Unauthorized: Only administrators can perform this action");
        }

        User target = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Target user not found"));

        // Admin can only manage users belonging to their own college
        if (!admin.getCollege().getId().equals(target.getCollege().getId())) {
            throw new IllegalStateException("Unauthorized: Admin cannot manage users from other colleges");
        }

        userRepository.delete(target);
    }
}