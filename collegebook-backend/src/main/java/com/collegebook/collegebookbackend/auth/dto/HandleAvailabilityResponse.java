package com.collegebook.collegebookbackend.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HandleAvailabilityResponse {

    private String handle;
    private boolean available;
    private String message;
}
