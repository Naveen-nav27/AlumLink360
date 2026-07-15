package com.alumini.alumini.connect.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.alumini.alumini.connect.entity.PostComment;

public interface PostCommentRepository extends JpaRepository<PostComment, Long> {
    List<PostComment> findByPostIdOrderByCommentedAtAsc(Long postId);
}
