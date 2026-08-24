package com.collegebook.collegebookbackend.collab.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDiscussionRequest {

    @NotBlank(message = "Discussion message cannot be blank")
    @Size(max = 2000, message = "Discussion message cannot exceed 2000 characters")
    private String body;
}
