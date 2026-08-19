-- V9__add_memory_book_email.sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS memory_book_email VARCHAR(255);
