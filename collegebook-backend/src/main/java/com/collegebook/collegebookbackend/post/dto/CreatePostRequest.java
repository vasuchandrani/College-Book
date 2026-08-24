package com.collegebook.collegebookbackend.post.dto;

import com.collegebook.collegebookbackend.storage.dto.MediaKeyDto;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePostRequest {

    @Size(max = 2000, message = "Post content cannot exceed 2000 characters")
    private String content;

    /**
     * @deprecated Use mediaKeys for Cloudflare R2 / Stream media.
     */
    @Deprecated
    private List<String> images;

    /**
     * Uploaded media references (Cloudflare R2 for images/files, Cloudflare Stream for videos).
     */
    private List<MediaKeyDto> mediaKeys;

    private List<String> tags;

    @Builder.Default
    private Boolean isGlobal = true;

    @Builder.Default
    private Boolean commentsEnabled = true;

    public CreatePostRequest(String content, List<String> images, List<String> tags) {
        this.content = content;
        this.images = images;
        this.tags = tags;
        this.isGlobal = true;
        this.commentsEnabled = true;
    }
}
