# Database Connection Configuration

The backend service uses a `.env` file located at:

```
-Chifaa-Care-samedatabase/chifaacare-backend/.env
```

The database connection string is stored in the `DATABASE_URL` variable. Example:

```
DATABASE_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require"
```

- **Never commit real credentials to version control.**
- To update the connection, edit the `.env` file and restart the backend.
- For local development, use a Neon or Postgres test database.

**Stripe and other secrets** are also stored in this file. Keep it secure!