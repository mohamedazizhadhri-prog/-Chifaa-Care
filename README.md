# ChifaaCare - Remote Healthcare Platform

ChifaaCare is a comprehensive digital health platform that bridges healthcare gaps between Libya and Tunisia through innovative telemedicine and home healthcare solutions. The platform connects Libyan patients with experienced Tunisian oncologists while empowering local Libyan clinics to deliver world-class home care services.

## 🌟 Project Overview

ChifaaCare addresses the critical need for specialized oncology care in Libya by leveraging the expertise of Tunisian specialists through a secure, user-friendly digital platform. Our mission is to ensure every patient receives the specialized treatment they deserve regardless of geographical barriers.

## 🚀 Features

### Core Services
- **Remote Oncology Consultation**: Connect Libyan patients with board-certified Tunisian oncologists
- **Home Healthcare Services**: Professional home care delivered by licensed Libyan clinics
- **Digital Health Platform**: Secure patient portal with electronic health records
- **Care Coordination**: Seamless coordination between home care providers and specialists

### Platform Features
- Secure telemedicine consultations
- Electronic health records management
- Appointment scheduling system
- Real-time communication tools
- Progress tracking and reporting
- Multi-language support (Arabic, English, French)

## 🏗️ Technology Stack

### Frontend
- **Framework**: Angular 17 (Standalone Components)
- **Styling**: SCSS with modern CSS Grid and Flexbox
- **Animations**: GSAP for smooth animations
- **3D Graphics**: Three.js for interactive visualizations
- **Icons**: Font Awesome 6
- **Fonts**: Inter (Google Fonts)

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with NestJS patterns
- **Database**: Neon PostgreSQL (cloud-hosted)
- **ORM**: Prisma
- **Authentication**: JWT with RBAC
- **Real-time**: Socket.io
- **File Storage**: Cloudinary
- **Payments**: Stripe

## 📱 Pages & Components

### Main Pages
- **Home**: Landing page with hero section, problem/solution overview, and call-to-action
- **About**: Company story, mission, vision, values, and leadership team
- **Services**: Detailed service offerings and how they work
- **Team**: Meet our expert medical professionals
- **Contact**: Contact form and office information

### Components
- **Navbar**: Responsive navigation with mobile menu
- **Hero**: Engaging hero sections for each page
- **CTA**: Call-to-action sections with animated backgrounds
- **Footer**: Comprehensive footer with links and information
- **Login Modal**: User authentication interface

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Angular CLI (v17 or higher)
- npm or yarn package manager
- Neon database account (for backend)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd -Chifaa-Care-samedatabase
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd chifaacare-backend
   npm install
   ```

3. **Setup Database (Backend)**
   ```bash
   # Setup Neon environment
   npm run setup:neon
   
   # Test connection
   npm run test:neon
   
   # Setup database schema
   npm run setup:db
   npm run migrate:deploy
   npm run prisma:generate
   ```

4. **Start development servers**
   ```bash
   # Backend (Terminal 1)
   cd chifaacare-backend
   npm run dev
   
   # Frontend (Terminal 2)
   npm start
   ```

5. **Open your browser**
   - Frontend: `http://localhost:4200`
   - Backend API: `http://localhost:3000`
   - API Docs: `http://localhost:3000/api-docs`

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## 🗄️ Database Setup

This project uses **Neon PostgreSQL** for cloud-hosted database management. Neon provides:

- **Serverless PostgreSQL**: Auto-scaling database
- **Branching**: Database branches for development
- **Point-in-Time Recovery**: Automatic backups
- **Global Edge Network**: Low-latency access

### Database Configuration

1. **Create Neon Account**: Sign up at [console.neon.tech](https://console.neon.tech/)
2. **Create Project**: Set up a new PostgreSQL project
3. **Get Connection String**: Copy the connection URL from Neon console
4. **Configure Environment**: Run `npm run setup:neon` in backend directory
5. **Deploy Schema**: Run migrations to create database tables

### Database Schema

The application includes comprehensive healthcare data models:

- **Users & Authentication**: User management with RBAC
- **Medical Records**: Patient profiles, medical history, treatments
- **Appointments**: Scheduling and consultation management
- **Messaging**: Real-time communication between patients and providers
- **Audit Logs**: HIPAA-compliant activity tracking
- **Clinic Management**: Multi-clinic support with onboarding

For detailed setup instructions, see [NEON_SETUP.md](chifaacare-backend/NEON_SETUP.md).

## 🏢 Office Locations

### Libya Office
- **Address**: 123 Healthcare Street, Tripoli, Libya
- **Phone**: +218 21 123 4567
- **Email**: libya@chifaacare.com
- **Hours**: Sunday - Thursday: 8:00 AM - 6:00 PM

### Tunisia Office
- **Address**: 456 Medical Center Blvd, Tunis, Tunisia
- **Phone**: +216 71 987 6543
- **Email**: tunisia@chifaacare.com
- **Hours**: Sunday - Thursday: 8:00 AM - 6:00 PM

## 🤝 Partnership Opportunities

### For Healthcare Providers
Join our network of clinics and start providing world-class care to your patients with support from Tunisian specialists.

### For Medical Specialists
Partner with us to extend your expertise to patients across Libya and contribute to improving healthcare outcomes.

## 📊 Impact Statistics

- **500+** Patients Served
- **25+** Partner Clinics
- **15+** Tunisian Specialists
- **95%** Patient Satisfaction Rate

## 🔒 Security & Compliance

- HIPAA-compliant platform
- End-to-end encryption
- Secure medical record sharing
- Regular security audits
- GDPR compliance for European patients

## 🌍 Regional Focus

ChifaaCare is specifically designed to serve the North African region, with a focus on:
- **Libya**: Home care delivery and patient management
- **Tunisia**: Specialist consultation and medical expertise
- **Future Expansion**: Other North African countries

## 📞 Support

For technical support or general inquiries:
- **Email**: support@chifaacare.com
- **Phone**: +218 21 123 4567 (Libya) / +216 71 987 6543 (Tunisia)
- **Business Hours**: Sunday - Thursday: 8:00 AM - 6:00 PM

## 🤝 Contributing

We welcome contributions from healthcare professionals, developers, and designers who share our vision of improving healthcare access in North Africa.

## 📄 License

This project is proprietary software owned by ChifaaCare. All rights reserved.

## 🙏 Acknowledgments

Special thanks to our medical partners, technology collaborators, and the healthcare communities in Libya and Tunisia for their support and collaboration in making this platform a reality.

---

**ChifaaCare** - Transforming healthcare delivery across North Africa, one patient at a time.
