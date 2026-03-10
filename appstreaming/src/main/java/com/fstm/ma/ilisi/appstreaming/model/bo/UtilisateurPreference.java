package com.fstm.ma.ilisi.appstreaming.model.bo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "utilisateur_preference")
@Data
public class UtilisateurPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "utilisateur_id", nullable = false, unique = true)
    private Utilisateur utilisateur;

    @Column(nullable = false, length = 5)
    private String language = "fr";

    @Column(nullable = false, length = 64)
    private String timezone = "Europe/Paris";

    @Column(nullable = false, length = 16)
    private String theme = "light";

    @Column(nullable = false)
    private boolean emailNotifications = true;

    @Column(nullable = false)
    private boolean pushNotifications = true;

    @Column(nullable = false)
    private boolean marketingEmails = false;

    @Column(nullable = false)
    private boolean courseReminders = true;

    @Column(nullable = false)
    private boolean weeklyDigest = true;

    @Column(nullable = false)
    private boolean autoplay = true;

    @Column(nullable = false)
    private double playbackSpeed = 1.0d;

    @Column(nullable = false)
    private boolean subtitles = false;

    @Column(nullable = false, length = 16)
    private String quality = "auto";

    @Column(nullable = false, length = 16)
    private String downloadQuality = "medium";

    @Column(nullable = false)
    private boolean showOnlineStatus = true;

    @Column(nullable = false)
    private boolean allowProfileViews = true;

    @Column(nullable = false)
    private boolean allowCourseRecommendations = true;
}
