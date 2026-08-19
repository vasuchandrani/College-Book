package com.collegebook.collegebookbackend;

import org.junit.jupiter.api.Test;
import java.sql.Connection;
import java.sql.DriverManager;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class DatabaseConnectionTest {

    @Test
    void testSupabaseConnection() throws Exception {
        String url = "jdbc:postgresql://aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require";
        String user = "postgres.xpaxlmztaeoeujefwzlu";
        String pass = "College-book123@";

        try (Connection conn = DriverManager.getConnection(url, user, pass)) {
            assertNotNull(conn);
        }
    }
}
