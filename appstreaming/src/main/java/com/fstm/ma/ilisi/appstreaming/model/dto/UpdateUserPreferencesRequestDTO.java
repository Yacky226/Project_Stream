package com.fstm.ma.ilisi.appstreaming.model.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateUserPreferencesRequestDTO {

    @Size(min = 2, max = 5)
    private String language;

    @Size(min = 2, max = 64)
    private String timezone;

    @Size(min = 3, max = 16)
    private String theme;

    private Boolean emailNotifications;
    private Boolean pushNotifications;
    private Boolean marketingEmails;
    private Boolean courseReminders;
    private Boolean weeklyDigest;
    private Boolean autoplay;

    @DecimalMin("0.25")
    @DecimalMax("4.0")
    private Double playbackSpeed;

    private Boolean subtitles;

    @Size(min = 2, max = 16)
    private String quality;

    @Size(min = 2, max = 16)
    private String downloadQuality;

    private Boolean showOnlineStatus;
    private Boolean allowProfileViews;
    private Boolean allowCourseRecommendations;
}
