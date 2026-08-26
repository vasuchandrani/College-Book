package com.collegebook.collegebookbackend.chat.dto;

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
public class SendMessageRequest {

    @NotBlank(message = "Message content cannot be empty")
    @Size(max = 4000, message = "Message cannot exceed 4000 characters")
    private String content;

    @Builder.Default
    private String messageType = "TEXT";

    private String mediaUrl;
}
