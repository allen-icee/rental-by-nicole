-- Add 'Pending' to the rental_booking_status ENUM
ALTER TYPE rental_booking_status ADD VALUE IF NOT EXISTS 'Pending';
