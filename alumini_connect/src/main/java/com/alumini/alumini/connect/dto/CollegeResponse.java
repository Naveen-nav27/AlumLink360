package com.alumini.alumini.connect.dto;

public class CollegeResponse {
    private Long id;
    private String code;
    private String name;
    private String logoUrl;
    private String themeColor;
    private Double minCgpa;
    private String welcomeMsg;
    private long studentCount;
    private long alumniCount;
    private long jobCount;
    private long eventCount;

    public CollegeResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public String getThemeColor() { return themeColor; }
    public void setThemeColor(String themeColor) { this.themeColor = themeColor; }
    public Double getMinCgpa() { return minCgpa; }
    public void setMinCgpa(Double minCgpa) { this.minCgpa = minCgpa; }
    public String getWelcomeMsg() { return welcomeMsg; }
    public void setWelcomeMsg(String welcomeMsg) { this.welcomeMsg = welcomeMsg; }
    public long getStudentCount() { return studentCount; }
    public void setStudentCount(long studentCount) { this.studentCount = studentCount; }
    public long getAlumniCount() { return alumniCount; }
    public void setAlumniCount(long alumniCount) { this.alumniCount = alumniCount; }
    public long getJobCount() { return jobCount; }
    public void setJobCount(long jobCount) { this.jobCount = jobCount; }
    public long getEventCount() { return eventCount; }
    public void setEventCount(long eventCount) { this.eventCount = eventCount; }
}
