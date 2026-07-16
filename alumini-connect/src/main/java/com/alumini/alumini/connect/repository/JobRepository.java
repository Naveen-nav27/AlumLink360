package com.alumini.alumini.connect.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.alumini.alumini.connect.entity.Job;

public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByCollegeId(Long collegeId);
    List<Job> findByCollegeCode(String collegeCode);
    List<Job> findByIsPublicTrue();
    List<Job> findByPostedById(Long postedById);
    long countByCollegeId(Long collegeId);
}
