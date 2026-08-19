package com.collegebook.collegebookbackend;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

@Disabled("One-time database reset tool")
@SpringBootTest
class DatabaseResetTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void executeDatabaseReset() {
        System.out.println("Starting Database Reset (Clearing users, profiles, posts, teams, comments, likes, and tokens while preserving colleges & courses)...");

        List<String> cleanupQueries = List.of(
                "TRUNCATE TABLE post_media CASCADE",
                "TRUNCATE TABLE post_likes CASCADE",
                "TRUNCATE TABLE post_saves CASCADE",
                "TRUNCATE TABLE comment_likes CASCADE",
                "TRUNCATE TABLE comments CASCADE",
                "TRUNCATE TABLE post_tags CASCADE",
                "TRUNCATE TABLE posts CASCADE",
                "TRUNCATE TABLE team_stars CASCADE",
                "TRUNCATE TABLE team_members CASCADE",
                "TRUNCATE TABLE join_requests CASCADE",
                "TRUNCATE TABLE teams CASCADE",
                "TRUNCATE TABLE notifications CASCADE",
                "TRUNCATE TABLE email_otps CASCADE",
                "TRUNCATE TABLE password_resets CASCADE",
                "TRUNCATE TABLE refresh_tokens CASCADE",
                "TRUNCATE TABLE profiles CASCADE",
                "TRUNCATE TABLE user_roles CASCADE",
                "TRUNCATE TABLE users CASCADE"
        );

        for (String query : cleanupQueries) {
            try {
                jdbcTemplate.execute(query);
                System.out.println("SUCCESS: " + query);
            } catch (Exception e) {
                System.out.println("NOTE: " + query + " -> " + e.getMessage());
            }
        }

        // Verify that colleges and courses tables are preserved
        Integer collegesCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM colleges", Integer.class);
        Integer coursesCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM courses", Integer.class);
        Integer usersCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
        Integer postsCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM posts", Integer.class);

        System.out.println("=== Database Reset Summary ===");
        System.out.println("Remaining Colleges: " + collegesCount);
        System.out.println("Remaining Courses: " + coursesCount);
        System.out.println("Remaining Users: " + usersCount);
        System.out.println("Remaining Posts: " + postsCount);
    }
}
