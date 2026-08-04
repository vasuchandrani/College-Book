/**
 * Shared domain types for CollegeBook.
 *
 * These mirror the backend DTOs documented in `docs/03-api-contract.md`.
 * When the Spring Boot API goes live, only these shapes need to match —
 * components and pages stay untouched.
 */

export interface FeedPost {
  id: number;
  author: string;
  initials: string;
  course: string;
  time: string;
  content: string;
  likes: number;
  liked: boolean;
  saved: boolean;
  tags: string[];
  images: string[];
  videoUrl?: string;
}

export interface ExplorePost {
  id: number;
  author: string;
  initials: string;
  college: string;
  content: string;
  likes: number;
  liked: boolean;
  saved: boolean;
  tags: string[];
  images: string[];
  videoUrl?: string;
}

export interface AdData {
  id: string;
  brand: string;
  title: string;
  description: string;
  images: string[];
  ctaText: string;
  ctaLink: string;
  commentsEnabled: boolean;
  discount?: string;
}

export interface Comment {
  id: number;
  author: string;
  body: string;
  time: string;
}
