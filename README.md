# MOR Audit Planning System

A comprehensive audit planning and case management system for the Ministry of Revenues (MOR) of Ethiopia.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at: **http://localhost:5000**

## 🎭 Demo Mode

### Login Credentials
All demo users share a universal password for easy testing:

**Password:** `password123`

### Available Demo Users (30+)
The system includes 30+ pre-configured users across 7 different roles:

| Role | Count | Example Email |
|------|-------|--------------|
| Planning Team | 3 | planning.auditor1@mor.gov.et |
| Audit Director | 1 | tesfaye.bekele@mor.gov.et |
| Senior Management | 2 | rahel.hailu@mor.gov.et |
| Regional Directors | 5 | getnet.alemu@mor.gov.et |
| Tax Center Managers | 6 | mekdes.solomon@mor.gov.et |
| Team Leaders | 5 | henok.belay@mor.gov.et |
| Auditors | 5 | kidist.mehari@mor.gov.et |

### Three Ways to Login

#### 1. Manual Login
- Enter any MOR email (e.g., `planning.auditor1@mor.gov.et`)
- Enter password: `password123`
- Click "Sign in"

#### 2. Browse All Users
- Click **"Browse All Demo Users (30)"** button
- Search or filter to find desired user
- Click any user card for instant login

#### 3. Quick Access
- Use the "Quick access demo accounts" dropdown
- Select from 9 popular pre-configured roles
- Instant auto-login

See [DEMO_USERS.md](./DEMO_USERS.md) for complete list of all available users.

## 📋 System Overview

### Core Features

#### Multi-Role Dashboard System
- **Planning Team**: Create and manage national audit plans
- **Audit Director**: Review, approve, and send plans to regions
- **Senior Management**: Final approval of national audit plans
- **Regional Directors**: Review regional allocations and provide feedback
- **Tax Center Managers**: Manage and assign audit cases
- **Team Leaders**: Assign cases to auditors
- **Auditors**: Execute and track assigned audit cases

#### Audit Planning Workflow
1. Planning team creates national audit plan
2. Director reviews and approves
3. Regions provide feedback and tax center allocations
4. Senior management provides final approval
5. Plans are deployed to tax centers
6. Cases are assigned to team leaders and auditors

#### Risk Engine Integration
- Real-time taxpayer risk analysis
- Risk-based audit case prioritization
- Risk score and level indicators
- Integration with MOR Risk Engine

#### Case Management
- Track audit cases through complete lifecycle
- Assign cases to team leaders and auditors
- Monitor case status and progress
- Support for multiple audit types:
  - Desk Audit
  - Field Audit
  - Joint Audit
  - Transfer Pricing
  - Comprehensive Audit
  - Issue Audit

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 19
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS 3
- **Icons**: Lucide React
- **State Management**: React Context API

### Project Structure
```
src/
├── api/                    # API client modules
├── components/             # Reusable React components
│   ├── allocation/        # Allocation system components
│   ├── dashboard/         # Dashboard widgets
│   ├── layout/            # Layout components
│   ├── ui/                # UI primitives
│   └── ...
├── config/                # Configuration files
├── context/               # React Context providers
├── data/                  # Mock data and constants
├── hooks/                 # Custom React hooks
├── pages/                 # Page components by role
│   ├── planning/
│   ├── director/
│   ├── regional/
│   ├── taxcenter/
│   ├── teamleader/
│   └── auditor/
├── routing/               # Routing configuration
├── services/              # Business logic services
├── styles/                # Global styles
├── utils/                 # Utility functions
├── App.jsx                # Main app component
└── main.jsx               # App entry point
```

## 🔧 Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure:

```env
# Add your environment variables here
VITE_API_URL=your_api_url
```

### API Integration
The system is designed to integrate with:
- MOR Risk Engine API
- MOR User Management API
- MOR Taxpayer Database API

API clients are located in `src/api/` directory.

## 🎨 Features

### User Interface
- Modern, responsive design
- Dark mode support
- Role-based navigation
- Real-time updates
- Interactive dashboards
- Mobile-friendly

### Organizational Hierarchy
- National level planning
- Regional distribution
- Tax center management
- Team-based assignment
- Individual auditor cases

### Data Management
- Local storage for demo mode
- Mock data generators
- Seed data for development
- Plan versioning and history
- Audit trail and timeline

## 📊 Dashboard Features by Role

### Planning Team Dashboard
- Create new audit plans
- Risk engine analysis
- National distribution planning
- Plan submission workflow
- Amendment handling

### Audit Director Dashboard
- Review submitted plans
- Approve or request amendments
- Deploy to regions
- Monitor plan status
- Regional feedback review

### Regional Director Dashboard
- View regional allocations
- Distribute to tax centers
- Submit feedback
- Monitor regional performance

### Tax Center Manager Dashboard
- View assigned cases
- Assign to team leaders
- Monitor tax center metrics
- Case tracking

### Team Leader Dashboard
- Assign cases to auditors
- Monitor team workload
- Track team performance

### Auditor Dashboard
- View assigned cases
- Update case status
- Track audit progress

## 🔐 Security Notes

**Demo/Development Mode:**
- Shared password for all users
- No authentication backend
- Local storage only
- No data encryption

**Production Requirements:**
- Integrate MOR Identity & Access Management
- Implement unique user credentials
- Add multi-factor authentication
- Enforce password policies
- Session management
- Audit logging
- Data encryption

## 📚 Documentation

- [DEMO_USERS.md](./DEMO_USERS.md) - Complete list of demo users
- [AUTHENTICATION_ENHANCEMENT.md](./AUTHENTICATION_ENHANCEMENT.md) - Authentication system details

## 🛠️ Development

### Code Style
- ES6+ JavaScript
- Functional React components
- React Hooks
- Tailwind utility classes
- JSX formatting

### Available Scripts
```bash
# Development
npm run dev          # Start dev server with hot reload

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Lint code (if configured)
npm test             # Run tests (if configured)
```

### Hot Reload
Vite provides instant hot module replacement (HMR) during development. Changes to React components, styles, and other assets are reflected immediately.

## 🌍 Regions & Tax Centers

### Supported Regions
1. **Addis Ababa** (3 Tax Centers)
2. **Amhara** (3 Tax Centers)
3. **Oromia** (3 Tax Centers)
4. **SNNPR** (3 Tax Centers)
5. **Somali** (3 Tax Centers)

Each region has dedicated:
- Regional Director
- Multiple Tax Centers
- Tax Center Managers
- Team Leaders
- Auditors

## 🎯 Business Sectors
- Construction & Real Estate
- Manufacturing
- Import/Export
- Financial Services
- Retail & Wholesale
- Agriculture
- Energy & Utilities
- Telecommunications
- Transportation
- Hospitality & Tourism

## 📈 Future Enhancements

Planned features:
- [ ] Real API integration
- [ ] Advanced analytics dashboard
- [ ] Report generation
- [ ] Email notifications
- [ ] Document management
- [ ] Advanced search and filtering
- [ ] Data export (Excel, PDF)
- [ ] Audit workflow automation
- [ ] Mobile application
- [ ] Integration with national tax database

## 🐛 Known Issues

Current limitations in demo mode:
- No backend persistence (uses localStorage)
- Limited to 30 demo cases per plan (demo cap)
- No real-time collaboration
- No file attachments
- No email notifications

## 🤝 Contributing

This is an internal MOR system. For questions or contributions, contact the development team.

## 📄 License

Proprietary - Ministry of Revenues, Ethiopia

---

**Ministry of Revenues - Audit Planning & Management System**
*Building a modern, efficient tax administration for Ethiopia*
