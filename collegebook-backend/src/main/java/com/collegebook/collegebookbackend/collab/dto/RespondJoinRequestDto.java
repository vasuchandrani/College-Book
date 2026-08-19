package com.collegebook.collegebookbackend.collab.dto;

public class RespondJoinRequestDto {

    private boolean accept;

    public RespondJoinRequestDto() {
    }

    public RespondJoinRequestDto(boolean accept) {
        this.accept = accept;
    }

    public boolean isAccept() {
        return accept;
    }

    public void setAccept(boolean accept) {
        this.accept = accept;
    }
}
