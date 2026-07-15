package com.alumini.alumini.connect.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.alumini.alumini.connect.entity.ConnectionRequest;

public interface ConnectionRequestRepository extends JpaRepository<ConnectionRequest, Long> {
    @Query("SELECT cr FROM ConnectionRequest cr WHERE cr.fromUser.id = :userId OR cr.toUser.id = :userId")
    List<ConnectionRequest> findByFromUserIdOrToUserId(@Param("userId") Long userId);

    List<ConnectionRequest> findByToUserIdAndStatus(Long toUserId, String status);

    @Query("SELECT cr FROM ConnectionRequest cr WHERE (cr.fromUser.id = :fromUserId AND cr.toUser.id = :toUserId) OR (cr.fromUser.id = :toUserId AND cr.toUser.id = :fromUserId)")
    Optional<ConnectionRequest> findByFromUserIdAndToUserId(@Param("fromUserId") Long fromUserId, @Param("toUserId") Long toUserId);
}
