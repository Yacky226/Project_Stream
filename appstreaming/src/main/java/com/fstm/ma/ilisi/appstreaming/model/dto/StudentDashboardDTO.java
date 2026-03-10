package com.fstm.ma.ilisi.appstreaming.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentDashboardDTO {

    private StudentDashboardStatsDTO stats;
    private List<StudentDashboardCourseDTO> courses;
    private List<DashboardSessionItemDTO> upcomingSessions;
    private List<DashboardActivityItemDTO> recentActivity;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentDashboardStatsDTO {
        private Integer enrolledCourses;
        private Integer activeCourses;
        private Integer completedCourses;
        private Double averageProgress;
        private Integer upcomingSessions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentDashboardCourseDTO {
        private String id;
        private String title;
        private String description;
        private String category;
        private Double progress;
        private String status;
        private String enrolledAt;
        private String scheduledAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardSessionItemDTO {
        private String id;
        private String courseId;
        private String courseTitle;
        private String startAt;
        private Boolean isLive;
        private String status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardActivityItemDTO {
        private String id;
        private String type;
        private String title;
        private String occurredAt;
        private String details;
    }
}
