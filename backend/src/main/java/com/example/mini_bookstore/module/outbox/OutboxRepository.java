package com.example.mini_bookstore.module.outbox;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OutboxRepository extends JpaRepository<OutboxMessage, UUID> {
  List<OutboxMessage> findTop50ByStatusOrderByCreatedAtAsc(OutboxStatus status);
}
