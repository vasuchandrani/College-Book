package com.collegebook.collegebookbackend.admin.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateAdRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String imageUrl;
    private String destinationUrl;
    private boolean allowComments = true;

    public CreateAdRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getDestinationUrl() {
        return destinationUrl;
    }

    public void setDestinationUrl(String destinationUrl) {
        this.destinationUrl = destinationUrl;
    }

    public boolean isAllowComments() {
        return allowComments;
    }

    public void setAllowComments(boolean allowComments) {
        this.allowComments = allowComments;
    }
}
