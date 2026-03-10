package com.fstm.ma.ilisi.appstreaming.model.dto;

import lombok.Data;

@Data
public class UserPreferencesDTO {
    private String language;
    private String timezone;
    private String theme;
    private boolean emailNotifications;
    private boolean pushNotifications;
    private boolean marketingEmails;
    private boolean courseReminders;
    private boolean weeklyDigest;
    private boolean autoplay;
    private double playbackSpeed;
    private boolean subtitles;
    private String quality;
    private String downloadQuality;
    private boolean showOnlineStatus;
    private boolean allowProfileViews;
    private boolean allowCourseRecommendations;
}
