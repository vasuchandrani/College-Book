package com.collegebook.collegebookbackend.event;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class CollegePostCreatedEvent extends DomainEvent {
    public static final String TYPE = "COLLEGE_POST_CREATED";
    
    private UUID postId;
    private UUID collegeId;
    
    @Override
    public String getEventType() {
        return TYPE;
    }
}
