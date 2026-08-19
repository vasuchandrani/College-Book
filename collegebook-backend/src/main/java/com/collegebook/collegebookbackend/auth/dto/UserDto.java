package com.collegebook.collegebookbackend.auth.dto;

import com.collegebook.collegebookbackend.auth.entity.AccountStatus;
import com.collegebook.collegebookbackend.profile.dto.ProfileDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {

    private UUID id;
    private String email;
    private AccountStatus status;
    private UUID collegeId;
    private String collegeName;
    private String collegeShortName;
    private String collegeSlug;
    private List<String> roles;
    private ProfileDto profile;
}
