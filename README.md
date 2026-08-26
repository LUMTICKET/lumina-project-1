# 🚀 Lumina Project

> A cross-platform Expo application for transport, ticketing, delivery, and event discovery.

This repository contains the front-end app built with **Expo Router**, **React Native**, and **TypeScript**. The app is designed to run on:

- 📱 Android
- 🍎 iOS
- 🌐 Web

All screens and navigation are provided from a single shared codebase.

---

# 🔍 App Overview

The app is structured around a landing page that switches between six main sections:

- **Home** — grid-driven discovery of events, routes, and ticketed services.
- **Search** — search and browse travel, ticketing, courier, and event listings.
- **Create** — content creation / action screen for posting or publishing new items.
- **Messaging** — chat-style interface for conversations and inquiries.
- **Feeds** — social-style feed with media posts, videos, likes, and ticket CTAs.
- **Settings** — user and business settings, access controls, billing options, and plan upgrades.

Additional UI features include:

- centralized theme support via `src/theme/ThemeContext.tsx`
- a responsive navbar that adapts to desktop and mobile layouts
- an authentication modal component (`AuthModal`) for sign-in or profile actions
- visually rich cards, image/video content, and filter categories

---

# 🧱 Tech Stack

- **Expo** `~57.0.8`
- **React Native** `0.86.0`
- **Expo Router** `~57.0.8`
- **TypeScript** `~6.0.3`
- **React** `19.2.3`
- **Expo vector icons**
- **Async Storage**
- **Video playback** with `expo-video`
- **Next.js** API backend
- **PostgreSQL** with Prisma ORM
- **Zod** API contract validation

---

# 📁 Project Structure

```
lumina-project-1/
├── app/                     # Expo Router root and pages
│   ├── _layout.tsx          # Root layout, theme provider
│   └── index.tsx            # Landing page and route switching
├── assets/                  # Images, icons, videos
├── src/
│   ├── components/          # Screen and UI components
│   ├── hooks/               # Custom hooks
│   └── theme/               # Theme provider and design tokens
├── backend/                 # API-only Next.js application
│   ├── src/app/             # Route Handlers
│   ├── src/contracts/       # Validated API contracts
│   └── prisma/              # PostgreSQL data model
├── package.json             # Expo app configuration
├── tsconfig.json            # TypeScript config
├── app.json                 # Expo app manifest
├── global.css               # Web global styles
└── README.md                # Project documentation
```

---

# 🚀 Running the App

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npm run start
```

Open in one of the target environments:

```bash
npm run android
npm run ios
npm run web
```

---

# 🧪 Useful Scripts

- `npm run start` — start Expo development server
- `npm run android` — launch on Android emulator/device
- `npm run ios` — launch on iOS simulator/device
- `npm run web` — launch in the browser
- `npm run lint` — run Expo lint checks
- `npm run build:web` — export the web build
- `npm run reset-project` — reset project state via `scripts/reset-project.js`

---

# 📝 Notes

- The workspace contains the Expo front end and an API-only Next.js backend.
- Backend setup and validation commands are documented in backend/README.md.
- Navigation and screen layout are defined in `src/app/index.tsx` and the component files under `src/components/`.
- `src/theme/ThemeContext.tsx` supplies colors and theme state across the app.

---

# 📌 Key Screens and Components

- `src/app/index.tsx` — top-level landing page and route switcher
- `src/app/_layout.tsx` — root layout with the theme provider
- `src/components/Navbar.tsx` — responsive sidebar / bottom nav
- `src/components/HomePage.tsx` — discovery grid and search bar
- `src/components/SearchPage.tsx` — filterable search results
- `src/components/Feeds.tsx` — social media-style feed with videos
- `src/components/Settings.tsx` — settings and toggles
- `src/components/AuthModal.tsx` — modal authentication UI

---

# 💡 How the App Works

The app loads a single landing page and renders one of the route components based on current navigation state. The navbar is responsive:

- desktop: fixed vertical sidebar
- mobile: fixed bottom tab bar

Each route component uses the theme provider for colors and styles, and several screens implement responsive column layouts depending on screen width.

The app is currently a front-end shell with UI and navigation. It is built to support travel, ticketing, delivery, and event discovery workflows.


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
