package com.alumini.alumini.connect.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.alumini.alumini.connect.entity.College;

public interface CollegeRepository extends JpaRepository<College, Long> {
    Optional<College> findByCode(String code);
    boolean existsByCode(String code);
}
