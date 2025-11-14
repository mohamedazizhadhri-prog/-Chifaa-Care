-- AlterTable
ALTER TABLE "User" ADD COLUMN "googleCalendarToken" TEXT,
ADD COLUMN "googleCalendarRefresh" TEXT,
ADD COLUMN "googleCalendarExpiry" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_googleCalendarToken_key" ON "User"("googleCalendarToken");
