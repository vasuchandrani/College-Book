package com.collegebook.collegebookbackend.ad.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdResponseDto {

    private UUID id;
    private String brand;
    private String title;
    private String description;
    private String imageUrl;
    @Builder.Default
    private List<String> images = new ArrayList<>();
    private String destinationUrl;
    private String ctaText;
    private String ctaLink;
    private String discount;
    private boolean allowComments;
    private boolean commentsEnabled;
    private boolean active;
    private int likes;
    private boolean liked;
    private int commentsCount;
    private int impressions;
    private int clicks;
    private long revenue;
}
