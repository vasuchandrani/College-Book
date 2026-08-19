package com.collegebook.collegebookbackend.common;

public class AppException extends RuntimeException {
    private final ErrorCode errorCode;
    private final String field;

    public AppException(ErrorCode errorCode) {
        super(errorCode.getDefaultMessage());
        this.errorCode = errorCode;
        this.field = null;
    }

    public AppException(ErrorCode errorCode, String customMessage) {
        super(customMessage);
        this.errorCode = errorCode;
        this.field = null;
    }

    public AppException(ErrorCode errorCode, String customMessage, String field) {
        super(customMessage);
        this.errorCode = errorCode;
        this.field = field;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }

    public String getField() {
        return field;
    }
}
