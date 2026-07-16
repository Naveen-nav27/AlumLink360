package com.alumini.alumini.connect.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.alumini.alumini.connect.entity.Event;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByCollegeId(Long collegeId);
    List<Event> findByCollegeCode(String collegeCode);
    List<Event> findByIsPublicTrue();
    List<Event> findByPostedById(Long postedById);
    long countByCollegeId(Long collegeId);
}
