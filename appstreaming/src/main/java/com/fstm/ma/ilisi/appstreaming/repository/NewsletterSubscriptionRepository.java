package com.fstm.ma.ilisi.appstreaming.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fstm.ma.ilisi.appstreaming.model.bo.NewsletterSubscription;

@Repository
public interface NewsletterSubscriptionRepository extends JpaRepository<NewsletterSubscription, Long> {
    Optional<NewsletterSubscription> findByEmailIgnoreCase(String email);

    @Query("""
            SELECT n
            FROM NewsletterSubscription n
            WHERE (:active IS NULL OR n.active = :active)
              AND (
                    :search IS NULL
                    OR LOWER(n.email) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(n.sourcePage) LIKE LOWER(CONCAT('%', :search, '%'))
                  )
            """)
    Page<NewsletterSubscription> findAllForAdmin(
            @Param("active") Boolean active,
            @Param("search") String search,
            Pageable pageable);

    long countByActive(boolean active);

    long countBySubscribedAtAfter(LocalDateTime subscribedAt);
}
