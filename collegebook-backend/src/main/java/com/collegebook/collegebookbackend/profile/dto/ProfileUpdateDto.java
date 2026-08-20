package com.collegebook.collegebookbackend.profile.dto;

import java.util.UUID;

public class ProfileUpdateDto {

    private String fullName;
    private String defaultBio;
    private UUID courseId;
    private UUID departmentId;
    private Short currentYear;
    private String bioExtra;
    private String avatarUrl;
    private String githubUrl;
    private String linkedinUrl;
    private String websiteUrl;
    private String customLinks;
    private String contactDetails;
    private Boolean isPublic;

    public ProfileUpdateDto() {
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getDefaultBio() {
        return defaultBio;
    }

    public void setDefaultBio(String defaultBio) {
        this.defaultBio = defaultBio;
    }

    public String getBioExtra() {
        return bioExtra;
    }

    public void setBioExtra(String bioExtra) {
        this.bioExtra = bioExtra;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }

    public String getWebsiteUrl() {
        return websiteUrl;
    }

    public void setWebsiteUrl(String websiteUrl) {
        this.websiteUrl = websiteUrl;
    }

    public String getCustomLinks() {
        return customLinks;
    }

    public void setCustomLinks(String customLinks) {
        this.customLinks = customLinks;
    }

    public String getContactDetails() {
        return contactDetails;
    }

    public void setContactDetails(String contactDetails) {
        this.contactDetails = contactDetails;
    }

    public Boolean getIsPublic() {
        return isPublic;
    }

    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }

    public UUID getCourseId() {
        return courseId;
    }

    public void setCourseId(UUID courseId) {
        this.courseId = courseId;
    }

    public UUID getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(UUID departmentId) {
        this.departmentId = departmentId;
    }

    public Short getCurrentYear() {
        return currentYear;
    }

    public void setCurrentYear(Short currentYear) {
        this.currentYear = currentYear;
    }
}
