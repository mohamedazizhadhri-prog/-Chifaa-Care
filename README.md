# ChifaaCare - Healthcare Management System

A comprehensive healthcare management system built with Angular frontend and Node.js backend, featuring secure authentication, role-based access control, and modern UI design.

## 🚀 Features

### Frontend (Angular 17)
- **Modern UI/UX**: Beautiful, responsive design with smooth animations
- **Authentication System**: Login/Signup with role selection (Patient/Doctor)
- **Role-Based Access**: Separate dashboards for patients and doctors
- **Protected Routes**: AuthGuard and RoleGuard for secure navigation
- **Reactive Forms**: Form validation and error handling
- **HTTP Interceptor**: Automatic token management and refresh
- **Responsive Design**: Mobile-first approach with modern CSS

### Backend (Node.js + Express)
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Patient and Doctor role management
- **MySQL Database**: Robust data persistence
- **Security Features**: Password hashing, CORS protection, security headers
- **Input Validation**: Zod schema validation
- **Cookie Management**: HTTP-only cookies for refresh tokens

## 🛠️ Tech Stack

### Frontend
- **Angular 17** - Latest Angular framework
- **TypeScript** - Type-safe JavaScript
- **SCSS** - Advanced CSS preprocessing
- **Font Awesome** - Icon library
- **RxJS** - Reactive programming

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL** - Relational database
- **JWT** - JSON Web Tokens
- **bcrypt** - Password hashing
- **Zod** - Schema validation
- **TypeScript** - Type safety

## 📋 Prerequisites

- **Node.js 18+** and npm
- **MySQL 8.0+** or MariaDB 10.5+
- **Git** for version control

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd chifaacare
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
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

```bash
# Set up the database
mysql -u root -p < database.sql

# Start the backend server
npm run dev
```

The backend will start on `http://localhost:3000`

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to project root
cd ..

# Install dependencies
npm install

# Start the Angular development server
npm start
```

The frontend will start on `http://localhost:4200`

## 🗄️ Database Setup

The application uses a MySQL database with the following schema:

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

## 🔐 Authentication Flow

1. **Signup**: Users create accounts with role selection
2. **Login**: Email/password authentication with role verification
3. **Token Management**: Access tokens (15min) + Refresh tokens (7 days)
4. **Route Protection**: Guards ensure proper access control
5. **Auto-refresh**: Tokens are automatically refreshed when needed

## 🎯 User Roles

### Patient
- Access to `/patient-dashboard`
- View appointments, medical records, prescriptions
- Book appointments and message doctors

### Doctor
- Access to `/doctor-dashboard`
- Manage patient appointments and records
- Write prescriptions and review reports
- View patient analytics

## 📱 Available Routes

| Route | Description | Access |
|-------|-------------|---------|
| `/` | Homepage | Public |
| `/login` | Login page | Public |
| `/signup` | Registration page | Public |
| `/patient-dashboard` | Patient dashboard | Patients only |
| `/doctor-dashboard` | Doctor dashboard | Doctors only |
| `/about`, `/services`, `/team`, `/contact` | Static pages | Public |

## 🔧 Development

### Backend Commands
```bash
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
```

### Frontend Commands
```bash
npm start            # Start development server
npm run build        # Build for production
npm run test         # Run tests
```

### Project Structure
```
chifaacare/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── config.ts       # Environment configuration
│   │   ├── database.ts     # Database connection
│   │   ├── server.ts       # Main server file
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── middlewares/    # Authentication & authorization
│   │   └── utils/          # Helper functions
│   ├── package.json
│   ├── tsconfig.json
│   ├── database.sql
│   └── README.md
├── src/                     # Angular frontend
│   ├── app/
│   │   ├── components/     # UI components
│   │   ├── services/       # Business logic
│   │   ├── guards/         # Route protection
│   │   ├── interceptors/   # HTTP interceptors
│   │   └── app.routes.ts   # Routing configuration
│   ├── assets/             # Static files
│   └── styles.scss         # Global styles
├── package.json
├── angular.json
└── README.md
```

## 🚀 Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use strong, unique JWT secrets
3. Configure HTTPS
4. Set up proper CORS origins
5. Use environment-specific database credentials
6. Consider using PM2 or similar process manager

### Frontend
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your web server
3. Configure your web server to handle Angular routing
4. Set up proper CORS configuration

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
npm run test
npm run e2e
```

## 🔒 Security Features

- **Password Hashing**: Bcrypt with 12 salt rounds
- **JWT Security**: Short-lived access tokens with refresh mechanism
- **CORS Protection**: Configured for specific origins
- **Input Validation**: Zod schemas for all inputs
- **Security Headers**: Helmet.js for security headers
- **HTTP-Only Cookies**: Secure refresh token storage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section in the backend README
2. Verify your environment variables are set correctly
3. Ensure MySQL is running and accessible
4. Check the browser console and server logs for errors

## 🎉 Acknowledgments

- **Angular Team** for the amazing framework
- **Express.js** for the robust backend framework
- **Font Awesome** for the beautiful icons
- **MySQL** for the reliable database system

---

**Made with ❤️ for better healthcare management**
