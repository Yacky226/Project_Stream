package com.fstm.ma.ilisi.appstreaming.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherDashboardDTO {

    private TeacherDashboardStatsDTO stats;
    private List<TeacherDashboardCourseDTO> courses;
    private List<StudentDashboardDTO.DashboardSessionItemDTO> upcomingSessions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeacherDashboardStatsDTO {
        private Integer totalCourses;
        private Integer totalStudents;
        private Integer activeEnrollments;
        private Double averageCompletionRate;
        private Integer upcomingSessions;
        private Integer liveSessions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeacherDashboardCourseDTO {
        private String id;
        private String title;
        private String description;
        private String category;
        private Integer enrollments;
        private Integer activeEnrollments;
        private Double completionRate;
        private Integer sessions;
        private Integer liveSessions;
        private String nextSessionAt;
    }
}
