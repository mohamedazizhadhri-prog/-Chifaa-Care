# Fix Doctor Signup Database Issue

## Problem
The database is missing the `rating` column in the `DoctorProfile` table.

## Solution

Run these commands in your terminal:

```bash
# 1. Reset the Prisma client
npx prisma generate

# 2. Create a new migration to sync the database
npx prisma migrate dev --name add_rating_to_doctor_profile

# OR if you just want to push the schema changes without creating a migration:
npx prisma db push
```

## If the above doesn't work, try:

```bash
# Force reset the database (WARNING: This will delete all data!)
npx prisma migrate reset

# Then run the application
npm run dev
```

## Alternative: Manual SQL Fix

If you want to keep your data, run this SQL directly in your database:

```sql
ALTER TABLE "DoctorProfile" 
ADD COLUMN IF NOT EXISTS "rating" DOUBLE PRECISION DEFAULT 0.0;
```
