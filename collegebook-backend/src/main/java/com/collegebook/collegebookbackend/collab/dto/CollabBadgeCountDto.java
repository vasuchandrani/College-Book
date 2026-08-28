package com.collegebook.collegebookbackend.collab.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollabBadgeCountDto {

    private int totalCount;
    private int recruitingCount;
    private int formedCount;
    private int openSourceCount;
    private int pendingRequestsCount;
}
