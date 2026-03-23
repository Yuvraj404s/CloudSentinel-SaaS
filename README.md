# ☁️ CloudSentinel-SaaS

A full-stack **Cloud Cost Monitoring SaaS** built with:
- **Backend**: Java 17 + Spring Boot 3 + PostgreSQL + JWT Auth
- **Frontend**: React + Recharts + Axios + TailwindCSS

## Features
- JWT-based Auth with RBAC
- CSV Billing Upload with batch processing & duplicate detection
- Analytics: Monthly spend, daily trends, cost projections
- Alert system for budget threshold breaches
- Interactive dashboard with Bar & Line charts

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Java 17+

### Run with Docker
```bash
git clone https://github.com/Yuvraj404s/CloudSentinel-SaaS.git
cd CloudSentinel-SaaS
cp backend/.env.example backend/.env
docker-compose up --build
```

- Backend: http://localhost:8080
- Frontend: http://localhost:5173

### Run Manually
```bash
# Backend
cd backend
./mvnw spring-boot:run

# Frontend
cd frontend
npm install && npm run dev
```

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login & get JWT |
| POST | /api/billing/upload | Upload CSV file |
| GET | /api/analytics/monthly | Monthly spend by service |
| GET | /api/analytics/daily | Daily cost trend (30 days) |
| GET | /api/analytics/projection | End-of-month cost projection |
| GET | /api/alerts/status | Check alert threshold |
| PUT | /api/settings/threshold | Update budget threshold |

## Sample CSV Format
```
serviceName,usageAmount,cost,billingDate,region,cloudProvider
EC2,100,45.50,2026-03-01,us-east-1,AWS
S3,500,12.30,2026-03-01,us-west-2,AWS
```
