# 🚀 LumTicket

> A digital transport, logistics, and ticketing platform developed by **Lumina Holdings Ltd**.

LumTicket is a cross-platform application built using **Expo** for Android, iOS, and Web, with a **Next.js API backend** that powers authentication, business logic, payment integrations, and data management.

---

# 🏗 System Architecture

```
Expo (Android • iOS • Web)
            │
      HTTPS / REST API
            │
      Next.js Backend API
            │
        Prisma ORM
            │
       PostgreSQL
```

---

# 🛠 Tech Stack

## Frontend

- Expo
- React Native
- Expo Router
- TypeScript
- React Native Paper
- React Hook Form
- Zustand / Context API

The Expo application supports:

- 📱 Android
- 🍎 iOS
- 🌐 Web

using a single codebase.

---

## Backend

The backend is developed using:

- Next.js
- Next.js Route Handlers
- TypeScript
- Prisma ORM
- PostgreSQL

Responsibilities include:

- Authentication
- Authorization
- API Services
- Business Logic
- Database Management
- Payment Integrations
- Notifications

---

# 📁 Project Structure

```
lumticket/

├── app/                 # Expo Router pages
├── assets/
├── components/
├── hooks/
├── services/
├── utils/
├── constants/
├── context/
├── types/
├── backend/             # Next.js API
│   ├── app/
│   ├── prisma/
│   ├── lib/
│   ├── middleware.ts
│   └── package.json
│
├── README.md
└── package.json
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/LuminaHoldings/LumTicket.git
```

```
cd LumTicket
```

---

# Install Frontend Dependencies

```bash
npm install
```

---

# Start Expo

```bash
npx expo start
```

Run on Android

```bash
npm run android
```

Run on iOS

```bash
npm run ios
```

Run on Web

```bash
npm run web
```

---

# Backend Setup

Navigate to the backend directory.

```bash
cd backend
```

Install dependencies.

```bash
npm install
```

Configure your `.env` file.

```env
DATABASE_URL=

JWT_SECRET=

NEXTAUTH_SECRET=

NEXTAUTH_URL=

MPAMBA_API_KEY=

AIRTEL_MONEY_API_KEY=
```

Generate the Prisma Client.

```bash
npx prisma generate
```

Run database migrations.

```bash
npx prisma migrate dev
```

Start the backend server.

```bash
npm run dev
```

---

# Development Workflow

1. Pull the latest changes.

```bash
git pull
```

2. Create a feature branch.

```bash
git checkout -b feature/login
```

3. Develop your feature.

4. Commit your work.

```bash
git add .

git commit -m "Add login feature"
```

5. Push your branch.

```bash
git push origin feature/login
```

6. Open a Pull Request.

---

# User Roles

- Passenger
- Bus Operator
- Parcel Operator
- Event Organizer
- Customer
- Ticket Inspector
- Customer Support
- Finance Officer
- Business Administrator
- System Administrator

---

# Features

- Digital Bus Ticketing
- Parcel Logistics
- Event Ticketing
- QR Code Verification
- Mobile Money Payments
- Online Payments
- Route Management
- Fleet Management
- Booking Management
- Reports & Analytics
- Notifications
- User Management
- Business Dashboard
- REST APIs

---

# Development Team

LumTicket is developed by the engineering team at **Lumina Holdings Ltd**.

Departments involved include:

- Information Systems
- Product Management
- Business Analysis
- Software Engineering
- UI/UX Design
- Quality Assurance
- Operations

---

# License

Copyright © Lumina Holdings Ltd.

All Rights Reserved.