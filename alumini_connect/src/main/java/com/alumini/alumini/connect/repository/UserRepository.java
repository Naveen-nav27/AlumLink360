package com.alumini.alumini.connect.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.alumini.alumini.connect.entity.User;
import com.alumini.alumini.connect.entity.Role;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailAndCollegeId(String email, Long collegeId);
    List<User> findByCollegeIdAndRole(Long collegeId, Role role);
    long countByCollegeIdAndRole(Long collegeId, Role role);
    boolean existsByEmailAndCollegeId(String email, Long collegeId);
    List<User> findByCollegeCodeAndRole(String collegeCode, Role role);
    List<User> findAllByCollegeCode(String collegeCode);
    boolean existsByEmail(String email);
    Optional<User> findByRollNumberAndCollegeId(String rollNumber, Long collegeId);
}