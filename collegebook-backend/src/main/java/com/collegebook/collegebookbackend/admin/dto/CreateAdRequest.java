package com.collegebook.collegebookbackend.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAdRequest {

    private String brand;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String imageUrl;

    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();

    private String destinationUrl;
    private String ctaText;
    private String ctaLink;
    private String discount;

    @Builder.Default
    private boolean allowComments = true;

    @Builder.Default
    private boolean commentsEnabled = true;
}
