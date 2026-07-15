package com.alumini.alumini.connect.dto;

import java.time.LocalDateTime;

public class JobDto {
    private Long id;
    private Long collegeId;
    private String collegeCode;
    private String collegeName;
    private Long postedById;
    private String postedByName;
    private String title;
    private String hostCompany;
    private String location;
    private String tags;
    private String description;
    private String deadline;
    private Boolean isPublic;
    private LocalDateTime createdAt;

    public JobDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCollegeId() { return collegeId; }
    public void setCollegeId(Long collegeId) { this.collegeId = collegeId; }
    public String getCollegeCode() { return collegeCode; }
    public void setCollegeCode(String collegeCode) { this.collegeCode = collegeCode; }
    public String getCollegeName() { return collegeName; }
    public void setCollegeName(String collegeName) { this.collegeName = collegeName; }
    public Long getPostedById() { return postedById; }
    public void setPostedById(Long postedById) { this.postedById = postedById; }
    public String getPostedByName() { return postedByName; }
    public void setPostedByName(String postedByName) { this.postedByName = postedByName; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getHostCompany() { return hostCompany; }
    public void setHostCompany(String hostCompany) { this.hostCompany = hostCompany; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getDeadline() { return deadline; }
    public void setDeadline(String deadline) { this.deadline = deadline; }
    public Boolean getIsPublic() { return isPublic; }
    public void setIsPublic(Boolean isPublic) { this.isPublic = isPublic; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
