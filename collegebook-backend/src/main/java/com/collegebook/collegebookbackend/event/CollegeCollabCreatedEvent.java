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
public class CollegeCollabCreatedEvent extends DomainEvent {
    public static final String TYPE = "COLLEGE_COLLAB_CREATED";
    
    private UUID collabId;
    private UUID collegeId;
    
    @Override
    public String getEventType() {
        return TYPE;
    }
}
