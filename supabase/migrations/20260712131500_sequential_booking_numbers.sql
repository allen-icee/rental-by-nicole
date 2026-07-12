-- Update rental_bookings to have sequential booking numbers ordered by created_at
WITH numbered_rentals AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rnum
  FROM rental_bookings
)
UPDATE rental_bookings 
SET booking_number = 'RNT-' || numbered_rentals.rnum
FROM numbered_rentals 
WHERE rental_bookings.id = numbered_rentals.id;

-- Update fittings to have sequential booking numbers ordered by created_at
WITH numbered_fittings AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rnum
  FROM fittings
)
UPDATE fittings 
SET booking_number = 'FIT-' || numbered_fittings.rnum
FROM numbered_fittings 
WHERE fittings.id = numbered_fittings.id;
