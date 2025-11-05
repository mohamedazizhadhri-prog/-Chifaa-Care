-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "googleCalendarToken" TEXT,
ADD COLUMN IF NOT EXISTS "googleCalendarRefresh" TEXT,
ADD COLUMN IF NOT EXISTS "googleCalendarExpiry" TIMESTAMP(3);

-- CreateIndex (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'User_googleCalendarToken_key'
  ) THEN
    CREATE UNIQUE INDEX "User_googleCalendarToken_key" ON "User"("googleCalendarToken");
  END IF;
END $$;
