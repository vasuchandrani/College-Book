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
public class SendJoinRequestDto {

    @NotBlank(message = "Role cannot be blank")
    private String role;

    @Size(max = 1000, message = "Message must not exceed 1000 characters")
    private String message;
}
