package com.collegebook.collegebookbackend.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

@Component
public class GuestReadOnlyFilter extends GenericFilter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String method = httpRequest.getMethod();
        String path = httpRequest.getRequestURI();

        if (List.of("POST", "PUT", "DELETE", "PATCH").contains(method.toUpperCase())) {
            // Exclude auth paths
            boolean isAuthPath = path.contains("/api/v1/auth/login") || 
                                 path.contains("/api/v1/auth/signup") ||
                                 path.contains("/api/v1/auth/refresh") ||
                                 path.contains("/api/v1/auth/logout");
            if (!isAuthPath) {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.isAuthenticated() && "demo@collegebook.edu".equalsIgnoreCase(auth.getName())) {
                    httpResponse.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    httpResponse.setContentType("application/json");
                    httpResponse.getWriter().write("{\"code\":\"GUEST_RESTRICTION\",\"message\":\"Write operations are disabled in demo mode. Please register for a full student account to participate.\"}");
                    return;
                }
            }
        }

        chain.doFilter(request, response);
    }
}
