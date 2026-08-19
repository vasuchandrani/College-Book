package com.collegebook.collegebookbackend.common;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "Invalid request parameters"),
    INVALID_CREDENTIALS(HttpStatus.BAD_REQUEST, "Incorrect email or password. Please verify your credentials."),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Authentication required"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "Access denied"),
    NOT_FOUND(HttpStatus.NOT_FOUND, "Resource not found"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "User not found"),
    COLLEGE_NOT_FOUND(HttpStatus.NOT_FOUND, "College not found"),
    COURSE_NOT_FOUND(HttpStatus.NOT_FOUND, "Course not found"),
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "Email is already registered"),
    USER_ALREADY_EXISTS(HttpStatus.CONFLICT, "User is already registered"),
    HANDLE_ALREADY_EXISTS(HttpStatus.CONFLICT, "Username handle is already taken"),
    INVALID_HANDLE(HttpStatus.BAD_REQUEST, "Invalid handle format"),
    INVALID_EMAIL_DOMAIN(HttpStatus.BAD_REQUEST, "Email domain does not match selected college"),
    DOMAIN_NOT_ALLOWED(HttpStatus.BAD_REQUEST, "Email domain does not match selected college"),
    INVALID_OTP(HttpStatus.BAD_REQUEST, "Invalid or expired OTP code"),
    OTP_EXPIRED(HttpStatus.BAD_REQUEST, "OTP has expired"),
    OTP_COOLDOWN_ACTIVE(HttpStatus.TOO_MANY_REQUESTS, "Please wait before requesting another verification code"),
    OTP_LIMIT_REACHED(HttpStatus.TOO_MANY_REQUESTS, "Maximum verification requests reached for this email. Please try again later"),
    MAX_OTP_ATTEMPTS(HttpStatus.TOO_MANY_REQUESTS, "Maximum OTP verification attempts exceeded"),
    OTP_MAX_ATTEMPTS(HttpStatus.TOO_MANY_REQUESTS, "Maximum OTP verification attempts exceeded"),
    RATE_LIMIT_EXCEEDED(HttpStatus.TOO_MANY_REQUESTS, "Too many requests. Please slow down"),
    EMAIL_DELIVERY_FAILED(HttpStatus.SERVICE_UNAVAILABLE, "Unable to deliver verification email. Please try again shortly"),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "Invalid or expired token"),
    TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "Token has expired"),
    TOKEN_REVOKED(HttpStatus.UNAUTHORIZED, "Token has been revoked"),
    TEAM_NOT_FOUND(HttpStatus.NOT_FOUND, "Team not found"),
    TEAM_FULL(HttpStatus.CONFLICT, "This team has no open slots"),
    ALREADY_MEMBER(HttpStatus.CONFLICT, "You are already a member of this team"),
    REQUEST_EXISTS(HttpStatus.CONFLICT, "You already have a pending join request for this team"),
    COMMENTS_DISABLED(HttpStatus.CONFLICT, "Comments are disabled for this ad"),
    PROFILE_NOT_FOUND(HttpStatus.NOT_FOUND, "Profile not found"),
    BAD_REQUEST(HttpStatus.BAD_REQUEST, "Bad request"),
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "Invalid request"),
    INVALID_FILE_TYPE(HttpStatus.BAD_REQUEST, "Unsupported file type"),
    FILE_TOO_LARGE(HttpStatus.BAD_REQUEST, "File exceeds maximum allowed size"),
    FILE_UPLOAD_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "File upload failed"),
    VIDEO_UPLOAD_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "Video upload failed"),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");

    private final HttpStatus status;
    private final String defaultMessage;

    ErrorCode(HttpStatus status, String defaultMessage) {
        this.status = status;
        this.defaultMessage = defaultMessage;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getDefaultMessage() {
        return defaultMessage;
    }
}
