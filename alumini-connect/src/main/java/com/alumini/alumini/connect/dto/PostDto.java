package com.alumini.alumini.connect.dto;

import java.time.LocalDateTime;
import java.util.List;

public class PostDto {
    private Long id;
    private Long collegeId;
    private String collegeCode;
    private Long authorId;
    private String authorName;
    private String authorRole;
    private String authorImg; // photoUrl
    private String content;   // maps to description in frontend/entity
    private String imageUrl;  // maps to image in frontend/entity
    private Boolean isPublic;
    private LocalDateTime createdAt;
    private List<String> likes; // userIds/rollNumbers who liked it
    private List<CommentDto> comments;

    public PostDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCollegeId() { return collegeId; }
    public void setCollegeId(Long collegeId) { this.collegeId = collegeId; }
    public String getCollegeCode() { return collegeCode; }
    public void setCollegeCode(String collegeCode) { this.collegeCode = collegeCode; }
    public Long getAuthorId() { return authorId; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    public String getAuthorRole() { return authorRole; }
    public void setAuthorRole(String authorRole) { this.authorRole = authorRole; }
    public String getAuthorImg() { return authorImg; }
    public void setAuthorImg(String authorImg) { this.authorImg = authorImg; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Boolean getIsPublic() { return isPublic; }
    public void setIsPublic(Boolean isPublic) { this.isPublic = isPublic; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public List<String> getLikes() { return likes; }
    public void setLikes(List<String> likes) { this.likes = likes; }
    public List<CommentDto> getComments() { return comments; }
    public void setComments(List<CommentDto> comments) { this.comments = comments; }
}
