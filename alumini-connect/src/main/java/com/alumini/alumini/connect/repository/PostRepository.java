package com.alumini.alumini.connect.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.alumini.alumini.connect.entity.Post;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByCollegeIdOrderByCreatedAtDesc(Long collegeId);
    List<Post> findByCollegeCodeOrderByCreatedAtDesc(String collegeCode);
    List<Post> findByIsPublicTrueOrderByCreatedAtDesc();
    List<Post> findAllByOrderByCreatedAtDesc();
}
