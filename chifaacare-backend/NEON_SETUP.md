# Neon Database Setup for ChifaaCare

This guide will help you migrate your ChifaaCare project to use Neon PostgreSQL database.

## Prerequisites

1. A Neon account (sign up at [console.neon.tech](https://console.neon.tech/))
2. Node.js and npm installed
3. Your ChifaaCare backend project

## Step 1: Create Neon Database

1. Go to [Neon Console](https://console.neon.tech/)
2. Sign in or create an account
3. Click "Create Project"
4. Choose a project name (e.g., "chifaacare")
5. Select a region close to your users
6. Click "Create Project"

## Step 2: Get Connection String

1. In your Neon project dashboard, go to "Connection Details"
2. Copy the connection string (it looks like):
   ```
   postgresql://username:password@ep-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

## Step 3: Setup Environment

1. Navigate to your backend directory:
   ```bash
   cd chifaacare-backend
   ```

2. Run the Neon environment setup:
   ```bash
   npm run setup:neon
   ```

3. Edit the generated `.env` file and replace the `DATABASE_URL` with your actual Neon connection string:
   ```env
   DATABASE_URL="postgresql://username:password@ep-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
   ```

## Step 4: Test Connection

Test your Neon database connection:
```bash
npm run test:neon
```

This will verify:
- Database connectivity
- PostgreSQL version
- pgcrypto extension availability
- Existing tables and migrations

## Step 5: Setup Database Schema

1. Run the database setup script:
   ```bash
   npm run setup:db
   ```

2. Deploy migrations to create the schema:
   ```bash
   npm run migrate:deploy
   ```

3. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

## Step 6: Seed Database (Optional)

If you want to populate the database with sample data:
```bash
npm run seed:safe
```

## Step 7: Start the Application

Start your development server:
```bash
npm run dev
```

## Troubleshooting

### Connection Issues

If you get connection errors:

1. **ENOTFOUND/ECONNREFUSED**: Check your DATABASE_URL format
2. **Authentication failed**: Verify username/password in Neon console
3. **SSL required**: Ensure `?sslmode=require` is in your connection string

### Migration Issues

If migrations fail:

1. Check if pgcrypto extension is enabled:
   ```sql
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";
   ```

2. Reset and redeploy migrations:
   ```bash
   npm run migrate:reset
   npm run migrate:deploy
   ```

### Performance Optimization

For better performance with Neon:

1. **Connection Pooling**: Neon automatically handles connection pooling
2. **Indexes**: Ensure proper indexes are created (already included in schema)
3. **Query Optimization**: Use Prisma's query optimization features

## Neon-Specific Features

### Branching
Neon supports database branching for development:
```bash
# Create a development branch
neon branches create dev-branch
```

### Autoscaling
Neon automatically scales based on usage - no manual configuration needed.

### Point-in-Time Recovery
Neon provides automatic backups and point-in-time recovery.

## Environment Variables

Your `.env` file should include:

```env
# Neon Database
DATABASE_URL="postgresql://username:password@ep-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

# JWT Configuration
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN="7d"

# Encryption
ENCRYPTION_KEY="your_encryption_key"

# Server
PORT=3000
NODE_ENV="development"

# Other services (update as needed)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
FRONTEND_URL="http://localhost:4200"
```

## Production Deployment

For production:

1. Create a production Neon project
2. Use production connection string
3. Set `NODE_ENV=production`
4. Use production credentials for other services
5. Enable monitoring and alerts in Neon console

## Support

- [Neon Documentation](https://neon.tech/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [ChifaaCare Issues](https://github.com/your-repo/issues)

## Security Notes

- Never commit your `.env` file to version control
- Use environment-specific connection strings
- Regularly rotate your database passwords
- Enable audit logging for HIPAA compliance
- Use SSL connections (required by Neon)
