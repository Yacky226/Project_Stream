package com.fstm.ma.ilisi.appstreaming.repository;

import java.time.LocalDateTime;
import java.util.Collection;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fstm.ma.ilisi.appstreaming.model.bo.SupportContactRequest;
import com.fstm.ma.ilisi.appstreaming.model.bo.SupportRequestStatus;

@Repository
public interface SupportContactRequestRepository extends JpaRepository<SupportContactRequest, Long> {
    @Query("""
            SELECT s
            FROM SupportContactRequest s
            WHERE (:status IS NULL OR s.status = :status)
              AND (
                    :search IS NULL
                    OR LOWER(s.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(s.email) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(s.message) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(s.sourcePage) LIKE LOWER(CONCAT('%', :search, '%'))
                  )
            """)
    Page<SupportContactRequest> findAllForAdmin(
            @Param("status") SupportRequestStatus status,
            @Param("search") String search,
            Pageable pageable);

    long countByStatus(SupportRequestStatus status);

    long countByStatusIn(Collection<SupportRequestStatus> statuses);

    long countByCreatedAtAfter(LocalDateTime createdAt);
}
