package com.alumini.alumini.connect.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.alumini.alumini.connect.entity.Message;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByConnectionRequestIdOrderBySentAtAsc(Long connectionRequestId);
    List<Message> findByConnectionRequestIdAndIsReadFalseAndSenderIdNot(Long connectionRequestId, Long senderId);
}
