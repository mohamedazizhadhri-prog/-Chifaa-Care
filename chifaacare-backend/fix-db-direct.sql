-- Direct SQL Fix for Google Calendar Fields
-- Run this in your database console or using the fix-db-direct.bat file

BEGIN;

-- Add the missing columns to User table
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "googleCalendarToken" TEXT,
ADD COLUMN IF NOT EXISTS "googleCalendarRefresh" TEXT,
ADD COLUMN IF NOT EXISTS "googleCalendarExpiry" TIMESTAMP(3);

-- Add unique constraint for googleCalendarToken if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'User' 
    AND indexname = 'User_googleCalendarToken_key'
  ) THEN
    CREATE UNIQUE INDEX "User_googleCalendarToken_key" ON "User"("googleCalendarToken");
  END IF;
END $$;

COMMIT;

-- Verify the columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'User'
AND column_name IN ('googleCalendarToken', 'googleCalendarRefresh', 'googleCalendarExpiry');
