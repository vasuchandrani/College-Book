package com.collegebook.collegebookbackend.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAdRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String imageUrl;
    private String destinationUrl;

    @Builder.Default
    private boolean allowComments = true;
}
