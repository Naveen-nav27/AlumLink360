package com.alumini.alumini.connect.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.alumini.alumini.connect.entity.Application;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByJobId(Long jobId);
    List<Application> findByEventId(Long eventId);
    List<Application> findByStudentId(Long studentId);
    boolean existsByJobIdAndStudentId(Long jobId, Long studentId);
    boolean existsByEventIdAndStudentId(Long eventId, Long studentId);
    long countByStudentCollegeId(Long collegeId);
}
