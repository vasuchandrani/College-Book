package com.collegebook.collegebookbackend.post.entity;

/**
 * Distinguishes image vs video media attached to posts.
 * Maps to the PostgreSQL 'media_type' enum.
 */
public enum MediaType {
    IMAGE,
    VIDEO
}
