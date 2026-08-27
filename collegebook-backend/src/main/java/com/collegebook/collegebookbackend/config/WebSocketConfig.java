package com.collegebook.collegebookbackend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.Arrays;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtChannelInterceptor jwtChannelInterceptor;

    @Value("${app.cors.allowed-origins:http://localhost:5000,http://localhost:5173,http://localhost:8080,http://localhost:8081,https://collegebook.live,https://www.collegebook.live,https://*.collegebook.live,https://collegebook.vercel.app,https://*.vercel.app}")
    private String allowedOrigins;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable in-memory broker for topic (broadcasts) and queue (user-specific)
        config.enableSimpleBroker("/topic", "/queue");
        // Prefix for messages routed to @MessageMapping controller methods
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        String[] origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toArray(String[]::new);

        // 1. Native WebSocket endpoint
        registry.addEndpoint("/ws/chat")
                .setAllowedOriginPatterns(origins.length > 0 ? origins : new String[]{"*"});

        // 2. SockJS fallback endpoint
        registry.addEndpoint("/ws/chat")
                .setAllowedOriginPatterns(origins.length > 0 ? origins : new String[]{"*"})
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(jwtChannelInterceptor);
    }
}
