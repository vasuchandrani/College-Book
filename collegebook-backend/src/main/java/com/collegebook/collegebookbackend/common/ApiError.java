package com.collegebook.collegebookbackend.common;

import java.time.Instant;

public class ApiError {
    private String code;
    private String message;
    private String field;
    private Instant timestamp;
    private String path;

    public ApiError() {
    }

    public ApiError(String code, String message, String field, Instant timestamp, String path) {
        this.code = code;
        this.message = message;
        this.field = field;
        this.timestamp = timestamp;
        this.path = path;
    }

    public static ApiErrorBuilder builder() {
        return new ApiErrorBuilder();
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getField() {
        return field;
    }

    public void setField(String field) {
        this.field = field;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public static class ApiErrorBuilder {
        private String code;
        private String message;
        private String field;
        private Instant timestamp;
        private String path;

        ApiErrorBuilder() {
        }

        public ApiErrorBuilder code(String code) {
            this.code = code;
            return this;
        }

        public ApiErrorBuilder message(String message) {
            this.message = message;
            return this;
        }

        public ApiErrorBuilder field(String field) {
            this.field = field;
            return this;
        }

        public ApiErrorBuilder timestamp(Instant timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public ApiErrorBuilder path(String path) {
            this.path = path;
            return this;
        }

        public ApiError build() {
            return new ApiError(code, message, field, timestamp, path);
        }
    }
}
