package com.collegebook.collegebookbackend.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TypingEventDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private UUID teamId;
    private UUID userId;
    private String userName;
    private String userHandle;
    private boolean typing;
}
