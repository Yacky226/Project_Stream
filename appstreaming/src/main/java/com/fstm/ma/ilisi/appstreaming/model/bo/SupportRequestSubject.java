package com.fstm.ma.ilisi.appstreaming.model.bo;

public enum SupportRequestSubject {
    GENERAL_INQUIRY("General Inquiry"),
    COURSE_ADMISSIONS("Course Admissions"),
    TECHNICAL_SUPPORT("Technical Support"),
    PARTNERSHIP_OPPORTUNITIES("Partnership Opportunities"),
    OTHER("Other");

    private final String label;

    SupportRequestSubject(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
