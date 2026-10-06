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
public class RoomChatMessageEvent extends DomainEvent {
    public static final String TYPE = "ROOM_CHAT_MESSAGE";
    
    private UUID roomId;
    private String roomName;
    private String messagePreview;
    
    @Override
    public String getEventType() {
        return TYPE;
    }
}
