package com.alumini.alumini.connect.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "colleges")
public class College {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", unique = true, nullable = false, length = 20)
    private String code;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "theme_color", length = 20)
    private String themeColor = "blue";

    @Column(name = "min_cgpa")
    private Double minCgpa = 6.0;

    @Column(name = "welcome_msg", length = 300)
    private String welcomeMsg = "Secure Academic Gateway Authentication";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public College() {}

    public College(String code, String name, String logoUrl, String themeColor, Double minCgpa, String welcomeMsg) {
        this.code = code;
        this.name = name;
        this.logoUrl = logoUrl;
        this.themeColor = themeColor;
        this.minCgpa = minCgpa;
        this.welcomeMsg = welcomeMsg;
        this.createdAt = LocalDateTime.now();
    }

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
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
