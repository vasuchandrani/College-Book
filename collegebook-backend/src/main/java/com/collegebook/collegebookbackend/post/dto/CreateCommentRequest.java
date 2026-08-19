package com.collegebook.collegebookbackend.post.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateCommentRequest {

    @NotBlank(message = "Comment body cannot be blank")
    @Size(max = 1000, message = "Comment cannot exceed 1000 characters")
    private String body;

    public CreateCommentRequest() {
    }

    public CreateCommentRequest(String body) {
        this.body = body;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }
}
