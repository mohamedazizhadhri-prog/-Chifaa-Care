# ChifaaCare Backend API

A secure Node.js + Express backend API for the ChifaaCare healthcare application with JWT authentication and role-based access control.

## Features

- 🔐 JWT-based authentication with access and refresh tokens
- 👥 Role-based access control (Patient/Doctor)
- 🛡️ Secure password hashing with bcrypt
- 📝 Input validation with Zod
- 🍪 HTTP-only cookies for refresh tokens
- 🗄️ MySQL database integration
- 🔒 CORS protection and security headers

## Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

## Installation

1. **Clone the repository and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=chifaacare_db
   DB_PORT=3306
   
   JWT_ACCESS_SECRET=your_access_secret_key_here
   JWT_REFRESH_SECRET=your_refresh_secret_key_here
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   
   PORT=3000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:4200
   ```

4. **Set up the database:**
   ```bash
   mysql -u root -p < database.sql
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/signup` | User registration | Public |
| POST | `/login` | User authentication | Public |
| POST | `/refresh` | Refresh access token | Public |
| POST | `/logout` | User logout | Public |
| GET | `/profile` | Get user profile | Protected |

### Request/Response Examples

#### Signup (Patient)
```json
POST /api/auth/signup
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "role": "PATIENT"
}
```

#### Signup (Doctor)
```json
POST /api/auth/signup
{
  "fullName": "Dr. Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "role": "DOCTOR",
  "licenseNumber": "MD12345",
  "specialty": "Cardiology"
}
```

#### Login
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123",
  "role": "PATIENT"
}
```

## Security Features

- **Password Hashing**: Bcrypt with 12 salt rounds
- **JWT Tokens**: 
  - Access token: 15 minutes
  - Refresh token: 7 days (stored in httpOnly cookie)
- **CORS**: Configured for frontend origin
- **Helmet**: Security headers
- **Input Validation**: Zod schemas for all inputs

## Database Schema

The application uses a single `users` table with the following structure:

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('PATIENT', 'DOCTOR') NOT NULL,
  license_number VARCHAR(50),
  specialty VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

## Development

### Project Structure
```
backend/
├── src/
│   ├── config.ts          # Environment configuration
│   ├── database.ts        # Database connection
│   ├── server.ts          # Main server file
│   ├── routes/
│   │   └── auth.routes.ts # Authentication routes
│   ├── controllers/
│   │   └── auth.controller.ts # Request handlers
│   ├── services/
│   │   └── auth.service.ts    # Business logic
│   ├── middlewares/
│   │   ├── auth.guard.ts      # Authentication middleware
│   │   └── role.guard.ts      # Role-based access control
│   └── utils/
│       ├── hash.ts            # Password hashing
│       └── jwt.ts             # JWT operations
├── package.json
├── tsconfig.json
├── database.sql
└── README.md
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests (when implemented)

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Use strong, unique JWT secrets
3. Configure HTTPS
4. Set up proper CORS origins
5. Use environment-specific database credentials
6. Consider using PM2 or similar process manager

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL service is running
   - Verify database credentials in `.env`
   - Ensure database exists

2. **JWT Errors**
   - Verify JWT secrets are set in `.env`
   - Check token expiration times

3. **CORS Issues**
   - Verify `CORS_ORIGIN` matches your frontend URL
   - Check if credentials are enabled on frontend

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Write tests for new features
5. Update documentation

## License

MIT License - see LICENSE file for details.
