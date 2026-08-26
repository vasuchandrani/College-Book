package com.collegebook.collegebookbackend.collab.dto;

import com.collegebook.collegebookbackend.collab.entity.JoinRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RespondJoinRequestDto {

    private boolean accept;
    private JoinRequestStatus status;

    public RespondJoinRequestDto(boolean accept) {
        this.accept = accept;
    }
}
