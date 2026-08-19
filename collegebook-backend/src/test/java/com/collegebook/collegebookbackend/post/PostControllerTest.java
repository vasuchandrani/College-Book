package com.collegebook.collegebookbackend.post;

import com.collegebook.collegebookbackend.common.PageResponse;
import com.collegebook.collegebookbackend.config.JwtAuthFilter;
import com.collegebook.collegebookbackend.config.JwtService;
import com.collegebook.collegebookbackend.post.controller.PostController;
import com.collegebook.collegebookbackend.post.dto.PostResponseDto;
import com.collegebook.collegebookbackend.post.service.PostService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PostController.class)
@AutoConfigureMockMvc(addFilters = false)
public class PostControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PostService postService;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @MockBean
    private JwtService jwtService;

    @Test
    void testGetFeed() throws Exception {
        PostResponseDto post = new PostResponseDto();
        post.setId(UUID.randomUUID());
        post.setContent("Hello CollegeBook campus!");
        post.setAuthorName("Vatsal");

        PageResponse<PostResponseDto> page = PageResponse.<PostResponseDto>builder()
                .items(List.of(post))
                .page(0)
                .size(20)
                .totalItems(1)
                .totalPages(1)
                .hasNext(false)
                .build();

        when(postService.getFeed(any(), any(), any(), anyInt(), anyInt())).thenReturn(page);

        mockMvc.perform(get("/api/v1/feed"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].content").value("Hello CollegeBook campus!"))
                .andExpect(jsonPath("$.items[0].authorName").value("Vatsal"));
    }

    @Test
    void testGetExplore() throws Exception {
        PostResponseDto post = new PostResponseDto();
        post.setId(UUID.randomUUID());
        post.setContent("Explore project idea!");
        post.setAuthorName("Ronak");

        PageResponse<PostResponseDto> page = PageResponse.<PostResponseDto>builder()
                .items(List.of(post))
                .page(0)
                .size(20)
                .totalItems(1)
                .totalPages(1)
                .hasNext(false)
                .build();

        when(postService.getExplore(any(), any(), anyInt(), anyInt())).thenReturn(page);

        mockMvc.perform(get("/api/v1/explore"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].content").value("Explore project idea!"))
                .andExpect(jsonPath("$.items[0].authorName").value("Ronak"));
    }

    @Test
    void testCreatePostWithMediaAndEmptyContent() throws Exception {
        PostResponseDto post = new PostResponseDto();
        post.setId(UUID.randomUUID());
        post.setContent("");
        post.setAuthorName("Vatsal");

        when(postService.createPost(any(), any())).thenReturn(post);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/posts")
                        .requestAttr("userId", UUID.randomUUID())
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content("{\"content\":\"\",\"mediaKeys\":[{\"objectKey\":\"posts/test.jpg\",\"mediaType\":\"IMAGE\"}]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value(""))
                .andExpect(jsonPath("$.authorName").value("Vatsal"));
    }

    @Test
    void testGetPostById() throws Exception {
        UUID postId = UUID.randomUUID();
        PostResponseDto post = new PostResponseDto();
        post.setId(postId);
        post.setContent("Single post content!");
        post.setAuthorName("Vatsal");
        post.setAuthorHandle("vatsal_dev");

        when(postService.getPostById(any(), any())).thenReturn(post);

        mockMvc.perform(get("/api/v1/posts/" + postId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(postId.toString()))
                .andExpect(jsonPath("$.content").value("Single post content!"))
                .andExpect(jsonPath("$.authorName").value("Vatsal"))
                .andExpect(jsonPath("$.authorHandle").value("vatsal_dev"));
    }
}
