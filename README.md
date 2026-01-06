# New Bus App 🚍

## 📋 Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Project Features](#-project-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Documentation](#-documentation)
- [Team Members](#-team-members)
- [License](#-license)

---

## Overview

**New Bus App** is a comprehensive university team project designed to solve real-world transportation challenges by providing a smart bus management and booking system. The system aims to digitalize bus operations, improve user experience for passengers, and provide administrators with clear control over buses, routes, and finances.

This project is developed collaboratively by a multidisciplinary team, combining backend, frontend, DevOps, UI/UX, and system analysis skills to deliver a modern, scalable, and extensible solution.

---

## Problem Statement

Traditional bus systems often suffer from:
- **Manual processes** - Time-consuming and error-prone operations
- **Poor user experience** - Difficult booking and tracking systems
- **Lack of transparency** - Limited visibility into payments and subscriptions
- **Limited financial reporting** - Insufficient analytics for administrators
- **No real-time tracking** - Passengers cannot track bus locations in real-time
- **Inefficient seat management** - Manual seat allocation and availability tracking

**New Bus App** addresses these challenges by offering a modern, scalable, and extensible solution with real-time capabilities, comprehensive management tools, and an intuitive user interface.

---

## 📌 Project Features

### 🚀 Core Functionalities

- **User Registration & Authentication**
  - Secure login system for users, drivers, and administrators
  - Email verification with Webhooks
  - Password reset functionality
  - JWT-based authentication with refresh tokens
  - Role-based access control (Student, Driver, Admin)

- **Bus & Route Management**
  - Admins can create, update, and manage buses
  - Bus status management (Active, Under Maintenance)
  - Route creation and management
  - Station management along routes
  - Faculty-based route organization

- **Trip Scheduling**
  - Define trips with dates, times, and stops
  - Assign buses and drivers to trips
  - Station-to-station trip planning
  - Trip status management (In Progress, Completed)

- **Booking System**
  - Users can spot on their locations to be visible to drivers
  - Real-time Bus availability checking


- **RESTful API N-Tier Architecture**
  - Clean separation of concerns
  - Scalable backend design
  - Repository pattern implementation
  - Unit of Work pattern for transaction management

- **Real-Time System Updates**
  - Instant reflection of booking and schedule changes
  - SignalR integration for live updates
  - WebSocket-based communication

### 🗺️ Live Tracking & Navigation

- **Real-Time GPS Tracking**
  - Track bus location live on interactive maps
  - Continuous location updates from drivers
  - Historical location tracking

- **Live Route Visualization**
  - Display active routes and current bus positions
  - Visual representation of stations and stops

- **Location Syncing**
  - Continuous updates between driver, server, and users
  - Real-time passenger location sharing
  - Driver location broadcasting

- **Real-Time Notifications**
  - Alert users of bus arrival for each station
  - Push notifications for when Bus is close to that user when it is 2 Km and when it is 0.5 Km
  - Trip status change notifications

### 📊 Admin & Operational Features

- **Fleet Management**
  - Manage bus status (Active / Under Maintenance)
  - Bus capacity and plate number management
  - Bus assignment to routes and trips

- **Route & Trip Analytics**
  - Monitor trip performance and route usage
  - Track booking statistics
  - View active and completed trips

- **Driver Assignment**
  - Assign drivers to buses and routes
  - Driver profile management
  - Driver connection tracking

- **Schedule Control**
  - Modify or cancel trips when needed
  - Manage trips

- **User Management**
  - Student registration and management
  - Faculty and group management
  - Admin account management

### 🚗 Driver Features

- **Driver Trip Control**
  - Drivers can start and end trips
  - Update trip status in real-time
  - Location sharing during active trips
  - view all available available passengers in real-time on map

- **Driver Dashboard**
  - View assigned trips
  - Monitor passengers' locations
  - view each passenger's details (name,phone..)
  - Track route and station information

### 👥 Passenger Features

- **Passenger Location Sharing**
  - Passengers can share their live location
  - Location appears as a spot on the map visible to drivers
  - Enhanced safety and coordination

- **Trip Booking**
  - Browse available trips

- **Real-Time Tracking**
  - Track bus location in real-time
  - Receive station arrival notifications
  - Receive notifications for started trips
  - Receive notifications for close trips

### 🔒 Security & Reliability

- **JWT Authentication**
  - Secure API endpoints
  - Token-based user sessions
  - Refresh token mechanism
  - Automatic token expiration handling

- **Data Validation**
  - Input validation at multiple layers
  - Prevent invalid or malicious inputs
  - Custom exception handling

- **Background Services**
  - Automated cleanup of expired tokens
  - OTP verification cleanup
  - Scheduled maintenance tasks using Quartz.NET

- **Scalable Architecture**
  - Designed to handle growth and real-world usage
  - Efficient database queries
  - Optimized API responses

### 🔄 Future Features (Planned)

- 💳 **Payment Gateway Integration** - Secure payment processing for bookings
- 🚌 **Bus Subscription Plans** - Monthly/yearly subscription options
- 📊 **Full Financial System for Admins** - Comprehensive financial reporting and analytics
- 📱 **Mobile Application Support** - Cross-Platform applications
- 🔔 **Advanced Notifications** - Push notifications and SMS alerts
- 📈 **Analytics Dashboard** - Detailed analytics and reporting tools

---

## 🏗️ Architecture

The project follows a **3-Tier N-Layer Architecture** pattern:

### Backend Architecture

```
┌─────────────────────────────────────┐
│     Presentation Layer (API)        │
│  - Controllers                      │
│  - Middleware                       │
│  - SignalR Hubs                     │
│  - Background Services              │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│     Business Logic Layer (BLL)       │
│  - Business Rules                   │
│  - Validation Logic                 │
│  - Service Interfaces               │
│  - DTOs & Mappers                   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│     Data Access Layer (DAL)          │
│  - Repository Pattern               │
│  - Unit of Work                     │
│  - Entity Framework Core            │
│  - Database Context                 │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│     Database (SQL Server)            │
└─────────────────────────────────────┘
```

### Key Design Patterns

- **Repository Pattern** - Abstraction of data access
- **Unit of Work Pattern** - Transaction management
- **Dependency Injection** - Loose coupling and testability
- **DTO Pattern** - Data transfer objects for API communication
- **AutoMapper** - Object-to-object mapping

---

## 🛠️ Tech Stack

### Backend

- **Framework**: ASP.NET Core (Web API)
- **ORM**: Entity Framework Core
- **Real-Time Communication**: SignalR
- **Authentication**: JWT (JSON Web Tokens)
- **Background Jobs**: Quartz.NET
- **Object Mapping**: AutoMapper
- **API Documentation**: Swagger/OpenAPI
- **Database**: Microsoft SQL Server
- **Language**: C#

### Frontend

- **Markup**: HTML5
- **Styling**: CSS3
- **Scripting**: JavaScript (Vanilla JS - No frameworks)
- **Maps Integration**: Google Maps API / Leaflet
- **Real-Time**: SignalR Client

### Database

- **RDBMS**: Microsoft SQL Server
- **ORM**: Entity Framework Core
- **Migrations**: Code-First Migrations

### DevOps & Tools

- **Version Control**: Git & GitHub
- **CI/CD**: Concepts implemented
- **Frontend Deployment**: Vercel
- **Backend Deployment**: ASP.NET Hosting (tryasp.net/runasp.net)
- **Configuration**: Environment-based configuration
- **Testing**: Unit Testing (xUnit/NUnit)

---

## 📚 Project Structure

```
New-Bus-App/
│
├── Backend/
│   ├── NewBusProject/
│   │   ├── NewBusAPI/              # Presentation Layer
│   │   │   ├── Controllers/        # API Controllers
│   │   │   │   ├── AdminsController.cs
│   │   │   │   ├── AuthController.cs
│   │   │   │   ├── BusesController.cs
│   │   │   │   ├── DriversController.cs
│   │   │   │   ├── FacultiesController.cs
│   │   │   │   ├── GeneralController.cs
│   │   │   │   ├── RoutesController.cs
│   │   │   │   ├── StationsController.cs
│   │   │   │   ├── StudentsController.cs
│   │   │   │   └── TripsController.cs
│   │   │   ├── clshub/            # SignalR Hubs
│   │   │   │   └── LiveHub.cs
│   │   │   ├── Middelware/        # Custom Middleware
│   │   │   │   ├── CheckLoginingMiddelware.cs
│   │   │   │   └── ErrorMiddelware.cs
│   │   │   ├── BackgroundService/ # Background Jobs
│   │   │   │   ├── RemoveOTPnoVerfied.cs
│   │   │   │   ├── RemoveRefreshTokenExpired.cs
│   │   │   │   └── RemoveRefreshTokenLogout.cs
│   │   │   ├── Program.cs         # Application Entry Point
│   │   │   └── appsettings.json   # Configuration
│   │   │
│   │   ├── NewBusBLL/             # Business Logic Layer
│   │   │   ├── Admins/
│   │   │   ├── Bus/
│   │   │   ├── Driver/
│   │   │   ├── DriverConnection/
│   │   │   ├── EmailService/
│   │   │   ├── Exceptions/
│   │   │   ├── Faculty/
│   │   │   ├── Hashing Service/
│   │   │   ├── LogoutService/
│   │   │   ├── RefreshToken/
│   │   │   ├── ResetPassword/
│   │   │   ├── Route/
│   │   │   ├── Station/
│   │   │   ├── StationTrips/
│   │   │   ├── StudentConnection/
│   │   │   ├── Students/
│   │   │   └── Trip/
│   │   │
│   │   └── NewBusDAL/              # Data Access Layer
│   │       ├── Models/             # Entity Models
│   │       │   ├── Admin.cs
│   │       │   ├── Bus.cs
│   │       │   ├── Driver.cs
│   │       │   ├── Faculty.cs
│   │       │   ├── Route.cs
│   │       │   ├── Station.cs
│   │       │   ├── Student.cs
│   │       │   ├── Trip.cs
│   │       │   └── NewBusContext.cs
│   │       ├── Repositry/          # Repository Pattern
│   │       │   ├── Interfaces/
│   │       │   └── RepoClassess/
│   │       ├── Migrations/         # EF Core Migrations
│   │       └── DTO/                # Data Transfer Objects
│   │
│   └── NewBusTest/                 # Unit Tests
│       └── NewBusBLLTest/
│
├── Frontend/
│   ├── admin.html                  # Admin Dashboard
│   ├── driver.html                 # Driver Interface
│   ├── passenger.html              # Passenger Interface
│   ├── login.html                  # Authentication Page
│   ├── admin/                      # Admin-specific assets
│   │   ├── admin.css
│   │   └── admin.js
│   ├── driver/                     # Driver-specific assets
│   │   ├── driver.css
│   │   ├── driver.js
│   │   ├── profile.css
│   │   └── profile.js
│   ├── login/                      # Login-specific assets
│   │   ├── login.css
│   │   ├── login.js
│   │   └── style.css
│   ├── passenger/                  # Passenger-specific assets
│   │   ├── passenger.css
│   │   └── passenger.js
│   ├── config.js                   # API Configuration
│   ├── style.css                   # Global Styles
│   └── QUICK_START.md              # Quick Start Guide
│
├── Documentation/                  # Project Documentation
│   ├── PHI_Project_Proposal.pdf
│   ├── PHI_Team_Info.pdf
│   ├── SRS New Bus Management System.pdf
│   ├── User Manual .pdf
│   └── project_scheduling.png
│
├── vercel.json                     # Vercel Deployment Config
├── VERCEL_SETUP.md                 # Vercel Setup Guide
├── LICENSE                         # License File
└── README.md                       # This File
```

---

## 📡 API Documentation

### Base URL

- **Production**: `https://newbus.tryasp.net/api/`
- **Development**: `http://localhost:5089/api/`
- **Swagger UI**: `https://newbus.tryasp.net/swagger/index.html`

### Authentication

All protected endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Main API Endpoints

#### Authentication (`/api/Auth`)

#### Buses (`/api/Buses`)

#### Routes (`/api/Routes`)

#### Trips (`/api/Trips`)

#### Stations (`/api/Stations`)

#### Students (`/api/Students`)

#### Drivers (`/api/Drivers`)

#### Admins (`/api/Admins`)

### SignalR Hub

- **Hub Path**: `/LiveHub`
- **Connection**: Real-time location updates and notifications
- **Authentication**: JWT token via query parameter `access_token`

For complete API documentation, visit the [Swagger UI](https://newbus.tryasp.net/swagger/index.html).

---

## 🚀 Getting Started

### Prerequisites

- **.NET SDK** (8.0 or higher)
- **SQL Server** (2019 or higher) or **SQL Server Express**
- **Git** (for version control)
- **Visual Studio 2022** or **Visual Studio Code** (recommended)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/New-Bus-App.git
   cd New-Bus-App
   ```

2. **Navigate to Backend directory**
   ```bash
   cd Backend/NewBusProject/NewBusAPI
   ```

3. **Configure Database Connection**
   - Copy `env.example.json` to create your configuration
   - Update `appsettings.json` or `appsettings.Development.json` with your connection string:
   ```json
   {
     "ConnectionStrings": {
       "myconn": "Server=localhost;Database=NewBusDB;Trusted_Connection=True;TrustServerCertificate=True;"
     },
     "JWT": {
       "SecretKey": "your-secret-key-here-minimum-32-characters"
     },
     "PasswordEmail": "your-email-password",
     "EmailFrom": "your-email@example.com",
     "FrontEndDomainLogin": "http://localhost:5500",
     "FailedVerirfingEmail": "http://localhost:5500/login.html?error=verification",
     "PageResetPassword": "http://localhost:5500/reset-password.html"
   }
   ```

4. **Run Database Migrations**
   ```bash
   dotnet ef database update --project ../NewBusDAL
   ```

5. **Restore NuGet Packages**
   ```bash
   dotnet restore
   ```

6. **Run the Application**
   ```bash
   dotnet run
   ```

   The API will be available at `https://localhost:5089` or `http://localhost:5089`

7. **Access Swagger UI**
   - Navigate to `https://localhost:5089/swagger` to view API documentation

### Frontend Setup

1. **Navigate to Frontend directory**
   ```bash
   cd Frontend
   ```

2. **Configure API Endpoint**
   - Update `config.js` with your backend API URL:
   ```javascript
   const CONFIG = {
     BASE_API_URL: "https://newbus.runasp.net/"  // or your local backend URL
   };
   ```

3. **Run Locally (Option 1: Live Server)**
   - Use VS Code Live Server extension
   - Or use any static file server
   - Open `login.html` in your browser

4. **Run Locally (Option 2: Python HTTP Server)**
   ```bash
   python -m http.server 5500
   ```
   - Access at `http://localhost:5500`

5. **Run Locally (Option 3: Node.js HTTP Server)**
   ```bash
   npx http-server -p 5500
   ```

---

## ⚙️ Configuration

### Backend Configuration

#### Environment Variables

Create `appsettings.Development.json` for local development:

```json
{
  "ConnectionStrings": {
    "myconn": "Server=localhost;Database=NewBusDB;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "JWT": {
    "SecretKey": "your-very-long-secret-key-minimum-32-characters-for-security"
  },
  "PasswordEmail": "your-email-app-password",
  "EmailFrom": "noreply@newbusapp.com",
  "FrontEndDomainLogin": "http://localhost:5500",
  "FailedVerirfingEmail": "http://localhost:5500/login.html?error=verification",
  "PageResetPassword": "http://localhost:5500/reset-password.html",
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

#### CORS Configuration

CORS is configured in `Program.cs`. Update allowed origins as needed:

```csharp
policy.WithOrigins(
    "http://127.0.0.1:5500",
    "https://newbus.vercel.app",
    "https://new-bus-app.vercel.app"
)
```

### Frontend Configuration

Update `Frontend/config.js`:

```javascript
const CONFIG = {
  BASE_API_URL: "https://newbus.runasp.net/"  // Your backend API URL
};
```

---

## 🚢 Deployment

### Frontend Deployment (Vercel)

The frontend is configured for easy deployment on Vercel.

#### Quick Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [Vercel](https://vercel.com/new)
   - Import your GitHub repository
   - **Important**: Leave Root Directory as root (`.`)
   - The `vercel.json` will automatically handle routing
   - Click "Deploy"

3. **Your site will be live!**
   - Root URL ("/") → serves `Frontend/login.html`
   - Other routes work automatically

#### Vercel Configuration

The `vercel.json` file is already configured:
- Routes root "/" to `Frontend/login.html`
- Excludes Backend and Documentation from build
- Sets up security headers
- Configures caching for static assets

For detailed instructions, see [VERCEL_SETUP.md](./VERCEL_SETUP.md) and [Frontend/QUICK_START.md](./Frontend/QUICK_START.md).

### Backend Deployment

#### Option 1: ASP.NET Hosting (tryasp.net/runasp.net)

1. **Prepare for Publishing**
   ```bash
   cd Backend/NewBusProject/NewBusAPI
   dotnet publish -c Release -o ./publish
   ```

2. **Configure Production Settings**
   - Update `appsettings.json` with production connection string
   - Set production JWT secret key
   - Configure CORS for your frontend domain

3. **Deploy via FTP/Web Deploy**
   - Use the publish profile in `Properties/PublishProfiles/`
   - Or manually upload the publish folder

#### Option 2: Azure App Service

1. **Create Azure App Service**
   - Create a new Web App in Azure Portal
   - Configure SQL Database connection

2. **Deploy via Visual Studio**
   - Right-click project → Publish
   - Select Azure App Service
   - Follow the wizard

3. **Configure Application Settings**
   - Add connection strings in Azure Portal
   - Set JWT secret key in App Settings

#### Option 3: Docker (Optional)

1. **Create Dockerfile**
   ```dockerfile
   FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
   WORKDIR /app
   EXPOSE 80
   EXPOSE 443

   FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
   WORKDIR /src
   COPY ["Backend/NewBusProject/NewBusAPI/NewBusAPI.csproj", "Backend/NewBusProject/NewBusAPI/"]
   RUN dotnet restore "Backend/NewBusProject/NewBusAPI/NewBusAPI.csproj"
   COPY . .
   WORKDIR "/src/Backend/NewBusProject/NewBusAPI"
   RUN dotnet build "NewBusAPI.csproj" -c Release -o /app/build

   FROM build AS publish
   RUN dotnet publish "NewBusAPI.csproj" -c Release -o /app/publish

   FROM base AS final
   WORKDIR /app
   COPY --from=publish /app/publish .
   ENTRYPOINT ["dotnet", "NewBusAPI.dll"]
   ```

2. **Build and Run**
   ```bash
   docker build -t newbus-api .
   docker run -p 8080:80 newbus-api
   ```

### Post-Deployment Checklist

- [ ] Update frontend `config.js` with production API URL
- [ ] Configure CORS on backend to allow frontend domain
- [ ] Set up SSL certificates (HTTPS)
- [ ] Configure production database connection
- [ ] Set secure JWT secret key
- [ ] Enable logging and monitoring
- [ ] Test all API endpoints
- [ ] Verify SignalR connections work
- [ ] Test authentication flow
- [ ] Verify email service configuration

---

## 🧪 Testing

### Running Unit Tests

```bash
cd Backend/NewBusTest/NewBusBLLTest
dotnet test
```

### Manual Testing

1. **API Testing**
   - Use Swagger UI at `/swagger`
   - Or use Postman/Thunder Client
   - Import the `NewBusProject.http` file

2. **Frontend Testing**
   - Test all user roles (Student, Driver, Admin)
   - Test booking flow
   - Test real-time tracking
   - Test authentication flows

3. **Integration Testing**
   - Test end-to-end booking process
   - Test real-time location updates
   - Test SignalR connections

---

## 📖 Documentation

### Available Documentation

- **[Project Proposal](./Documentation/PHI_Project_Proposal.pdf)** - Initial project proposal and scope
- **[Team Information](./Documentation/PHI_Team_Info.pdf)** - Team member details and roles
- **[SRS Document](./Documentation/SRS%20New%20Bus%20Management%20System.pdf)** - Software Requirements Specification
- **[User Manual](./Documentation/User%20Manual%20.pdf)** - End-user guide and instructions
- **[Project Schedule](./Documentation/project_scheduling.png)** - Project timeline and milestones

### API Documentation

- **Swagger UI**: [https://newbus.tryasp.net/swagger/index.html](https://newbus.tryasp.net/swagger/index.html)
- Interactive API documentation with request/response examples

---

## 👥 Team Members

- [**Ahmed Abdelhady**](https://github.com/ahmedabdelhady100) - Business & System Analysis
- [**Amr Desouki**](https://github.com/amrdesouki1) - UI/UX & Visual Design
- [**Ahmed Ibrahim**](https://github.com/A7med-Ibrahem) - Frontend Developer
- [**Kareem Ayman**](https://github.com/kemo225) - Backend & Real Time Features
- [**Yusuf Hussien**](https://github.com/Yusuf-Hussien) - Backend & DevOps (Team Lead)

---

## 🔗 Live Demo

- **Frontend**: https://newbus.vercel.app
- **API Swagger**: [https://newbus.tryasp.net/swagger/index.html](https://newbus.tryasp.net/swagger/index.html)
- **Production API**: [https://newbus.tryasp.net/api/](https://newbus.runasp.net/api/)

---

## 📝 License

This project is licensed under the terms specified in the [LICENSE](./LICENSE) file.

---

## 🤝 Contributing

This is a university team project. For contributions or questions, please contact the team members or create an issue in the repository.

---

## 📧 Support

For support, please refer to the documentation files in the `Documentation/` directory or contact the development team.

---

**Last Updated**: Jan 2026
**Version**: 1.0.0



