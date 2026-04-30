<div align="center">

# 🔐 MSG_CRYPT — Encrypted Chat

**Real-time encrypted messaging with a hacker-terminal aesthetic.**

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?style=for-the-badge&logo=socket.io)](https://socket.io/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](LICENSE)

<br/>

*A full-stack MERN chat application featuring Socket.IO-powered real-time messaging, JWT authentication, group chats, typing indicators, and a CRT-inspired hacker UI — all wrapped in a sleek, responsive dark-mode interface.*

</div>

---

## 📑 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [Key Features](#-key-features)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Socket.IO Events](#-socketio-events)
- [Data Models](#-data-models)
- [Frontend Architecture](#-frontend-architecture)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🏗 Architecture Overview

MSG_CRYPT follows a classic **MERN** (MongoDB · Express · React · Node.js) architecture with WebSocket augmentation for real-time features.

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  React 19 + Vite 8 + Tailwind CSS 4                      │  │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐ │  │
│  │  │Homepage │  │ Chatpage │  │ Modals   │  │  Context  │ │  │
│  │  │(Auth)   │  │(Messages)│  │(Profile, │  │  (Global  │ │  │
│  │  │         │  │          │  │ Group,   │  │   State)  │ │  │
│  │  │         │  │          │  │ Settings)│  │           │ │  │
│  │  └─────────┘  └──────────┘  └──────────┘  └───────────┘ │  │
│  └──────────────────────┬──────────────┬────────────────────┘  │
│                         │ HTTP (REST)  │ WebSocket (Socket.IO) │
└─────────────────────────┼──────────────┼───────────────────────┘
                          │              │
┌─────────────────────────┼──────────────┼───────────────────────┐
│                     SERVER (Node.js)   │                       │
│  ┌──────────────────────┴──────────────┴────────────────────┐  │
│  │  Express 5 HTTP Server + Socket.IO 4                     │  │
│  │  ┌──────────┐  ┌─────────────┐  ┌─────────────────────┐ │  │
│  │  │  Routes  │  │ Controllers │  │    Middleware        │ │  │
│  │  │ /users   │  │  User CRUD  │  │ JWT Auth (protect)  │ │  │
│  │  │ /chats   │  │  Chat CRUD  │  │ Error Handler       │ │  │
│  │  │ /messages│  │  Message IO │  │ 404 Not Found       │ │  │
│  │  └──────────┘  └─────────────┘  └─────────────────────┘ │  │
│  └──────────────────────┬───────────────────────────────────┘  │
│                         │ Mongoose ODM                         │
└─────────────────────────┼──────────────────────────────────────┘
                          │
┌─────────────────────────┼──────────────────────────────────────┐
│              MongoDB Atlas (Cloud Database)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                     │
│  │  Users   │  │  Chats   │  │ Messages │                     │
│  └──────────┘  └──────────┘  └──────────┘                     │
└────────────────────────────────────────────────────────────────┘
```

**Data Flow:**
1. User authenticates via **REST API** → receives a **JWT token** (valid 30 days)
2. Token is stored in `localStorage` and attached as a `Bearer` header to all subsequent requests
3. On entering the chat page, a **Socket.IO** connection is established for real-time bidirectional communication
4. Messages are persisted to **MongoDB** via REST, then broadcast to connected peers via **Socket.IO**
5. Profile images are uploaded to **Cloudinary** and the URL is stored in the user document

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **User Authentication** | Register/Login with email & password; passwords hashed with `bcryptjs`; sessions managed via JWT |
| **Real-time Messaging** | Instant message delivery powered by Socket.IO WebSockets |
| **Typing Indicators** | Live "Remote Node Transmitting..." animation when a peer is typing |
| **1-on-1 Chats** | Private direct message channels between two users |
| **Group Chats** | Create, rename, add/remove members; admin-controlled permissions |
| **User Search** | Search users by name or email with regex-powered backend queries |
| **Notifications** | Unread message badges with per-chat grouping; persisted across page refreshes via `localStorage` |
| **Profile Pictures** | Upload via Cloudinary integration; fallback to DiceBear identicons |
| **Profile Modal** | CRT scanline-effect user ID card with hacker-theme aesthetics |
| **Settings Panel** | System config modal with encryption toggle, audio feedback, and protocol level options |
| **Multi-tab Sync** | Auth state synced across browser tabs via `storage` event listener |
| **Responsive Design** | Fully responsive with a mobile slide-out drawer, optimized for all screen sizes |
| **Page Transitions** | Smooth blur-based route animations via Framer Motion |
| **Hacker UI Theme** | Terminal-inspired dark interface with green monospace typography, CRT effects, and scan-line overlays |

---

## 📁 Project Structure

```
encrypted_chats/
├── .gitignore
│
├── backend/                          # Express.js API Server
│   ├── server.js                     # ⚡ Entry point — Express + Socket.IO init
│   ├── package.json                  # Backend dependencies & scripts
│   ├── .env                          # Environment variables (gitignored)
│   │
│   ├── config/
│   │   └── db.js                     # MongoDB connection via Mongoose
│   │
│   ├── controllers/
│   │   ├── userControllers.js        # Register, Login, Search users
│   │   ├── chatControllers.js        # Create/Fetch/Group CRUD operations
│   │   └── messageController.js      # Send & retrieve messages
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js         # JWT token verification (protect)
│   │   └── errorMiddleware.js        # Global error & 404 handler
│   │
│   ├── models/
│   │   ├── userModel.js              # User schema + password hashing hooks
│   │   ├── chatModel.js              # Chat schema (1-on-1 & group)
│   │   └── messageModel.js           # Message schema
│   │
│   ├── routes/
│   │   ├── userRoutes.js             # /api/users endpoints
│   │   ├── chatRoutes.js             # /api/chats endpoints
│   │   └── messageRoutes.js          # /api/messages endpoints
│   │
│   ├── utils/
│   │   └── generateToken.js          # JWT token generator (30-day expiry)
│   │
│   └── data/
│       └── data.js                   # Sample/seed chat data
│
└── frontend2/                        # React + Vite Frontend
    ├── index.html                    # HTML shell
    ├── vite.config.js                # Vite + React + Tailwind plugin config
    ├── package.json                  # Frontend dependencies & scripts
    ├── .env                          # Frontend env vars (VITE_ prefix)
    │
    └── src/
        ├── main.jsx                  # ⚡ Entry point — React root + providers
        ├── App.jsx                   # Router + animated page transitions
        ├── App.css                   # Background styling (matrix GIF overlay)
        ├── index.css                 # Global styles, fonts, scrollbar
        │
        ├── context/
        │   └── ChatProvider.jsx      # Global state (user, chats, notifications)
        │
        ├── config/
        │   └── chatLogics.jsx        # Helper fns: getSender, getSenderFull
        │
        ├── pages/
        │   ├── Homepage.jsx          # Auth page (Login/Signup tabs)
        │   └── Chatpage.jsx          # Main chat interface layout
        │
        ├── components/
        │   └── authentication/
        │       ├── login.jsx         # Login form + API call
        │       └── signup.jsx        # Registration form + Cloudinary upload
        │
        └── ui/
            ├── AuthInput.jsx         # Reusable input with icon + glow effect
            ├── SocialButtons.jsx     # Google/GitHub OAuth placeholders
            ├── TopBar.jsx            # Header: search, notifications, profile menu
            ├── LeftSection.jsx       # Chat list sidebar with search/filter
            ├── RightSection.jsx      # Message display + input + Socket.IO logic
            │
            └── models/
                ├── ProfileModal.jsx          # User ID card with CRT effect
                ├── SettingsModal.jsx         # App settings panel
                ├── GroupChatModal.jsx         # Create new group chat
                └── UpdateGroupChatModal.jsx  # Manage group (rename/add/remove)
```

---

## 🛠 Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 18+ | JavaScript runtime |
| **Express** | 5.x | HTTP framework & REST API |
| **Socket.IO** | 4.8 | Real-time WebSocket communication |
| **Mongoose** | 9.x | MongoDB ODM |
| **MongoDB Atlas** | — | Cloud-hosted NoSQL database |
| **bcryptjs** | 3.x | Password hashing (salt rounds: 10) |
| **jsonwebtoken** | 9.x | JWT auth tokens (30-day expiry) |
| **cors** | 2.8 | Cross-origin resource sharing |
| **dotenv** | 17.x | Environment variable management |
| **nodemon** | 3.x | Dev server with hot-reload |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 19 | UI component framework |
| **Vite** | 8 | Build tool & dev server |
| **Tailwind CSS** | 4 | Utility-first CSS framework |
| **React Router** | 7.x | Client-side routing |
| **Framer Motion** | 12.x | Animations & page transitions |
| **Axios** | 1.x | HTTP client for API calls |
| **Socket.IO Client** | 4.8 | WebSocket client |
| **React Hot Toast** | 2.6 | Toast notification system |
| **Lucide React** | 1.8 | Icon library |
| **React Icons** | 5.6 | Additional icons (Google, GitHub) |
| **Cloudinary** | — | Image hosting for profile pictures |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher — [Download](https://nodejs.org/)
- **npm** v9+ (bundled with Node.js)
- **MongoDB Atlas** account — [Sign up free](https://www.mongodb.com/cloud/atlas)
- **Cloudinary** account (for image uploads) — [Sign up free](https://cloudinary.com/)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/POWER-WORLD/encrypted_chat_web.git
cd encrypted_chats
```

**2. Set up the Backend**
```bash
cd backend
npm install
```

**3. Set up the Frontend**
```bash
cd ../frontend2
npm install
```

**4. Configure environment variables** (see [Environment Variables](#-environment-variables) below)

**5. Start the development servers**

Open **two terminals**:

```bash
# Terminal 1 — Backend (API + Socket.IO)
cd backend
npm run dev          # Starts on http://localhost:5000

# Terminal 2 — Frontend (Vite dev server)
cd frontend2
npm run dev          # Starts on http://localhost:5173
```

**6. Open the app**

Navigate to `http://localhost:5173` in your browser.

### Production Build

```bash
# Build the frontend
cd frontend2
npm run build        # Outputs to frontend2/dist/

# Start the backend in production mode
cd ../backend
npm start
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
```

| Variable | Description |
|---|---|
| `PORT` | Port for the Express server (default: `5000`) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key used to sign JWT tokens |

### Frontend (`frontend2/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API URL (set to your deployed URL in production) |
| `VITE_CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary unsigned upload preset name |

> ⚠️ **Security Note:** Never commit `.env` files. Both `.env` files are included in `.gitignore`.

---

## 📡 API Reference

All protected routes require a `Bearer` token in the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

### User Routes — `/api/users`

| Method | Endpoint | Auth | Description | Request Body |
|---|---|---|---|---|
| `POST` | `/api/users/register` | ❌ | Register a new user | `{ name, email, password, profilePicture? }` |
| `POST` | `/api/users/login` | ❌ | Authenticate & get token | `{ email, password }` |
| `GET` | `/api/users?search=query` | ✅ | Search users by name/email | — |

**Register Response:**
```json
{
  "_id": "60d5ec49f1b2c72b7c8a1234",
  "name": "John Doe",
  "email": "john@example.com",
  "profilePicture": "https://res.cloudinary.com/...",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### Chat Routes — `/api/chats`

| Method | Endpoint | Auth | Description | Request Body |
|---|---|---|---|---|
| `POST` | `/api/chats` | ✅ | Access or create a 1-on-1 chat | `{ userId }` |
| `GET` | `/api/chats` | ✅ | Fetch all chats for the user | — |
| `POST` | `/api/chats/group` | ✅ | Create a group chat | `{ name, users: "[id1, id2, ...]" }` |
| `PUT` | `/api/chats/group` | ✅ | Rename a group chat | `{ chatId, chatName }` |
| `PUT` | `/api/chats/group/add` | ✅ | Add user to group | `{ chatId, userId }` |
| `PUT` | `/api/chats/group/remove` | ✅ | Remove user from group | `{ chatId, userId }` |

---

### Message Routes — `/api/messages`

| Method | Endpoint | Auth | Description | Request Body |
|---|---|---|---|---|
| `POST` | `/api/messages` | ✅ | Send a message | `{ content, chatId }` |
| `GET` | `/api/messages/:chatId` | ✅ | Get all messages for a chat | — |

---

## 🔌 Socket.IO Events

The Socket.IO server runs on the same port as the Express HTTP server.

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `setup` | `{ _id }` (user object) | User joins their private room for receiving messages |
| `join chat` | `chatId` (string) | User joins a specific chat room |
| `new message` | Message object | Broadcasts a new message to all participants |
| `typing` | `chatId` (string) | Signals typing activity to the chat room |
| `stop typing` | `chatId` (string) | Signals typing has stopped |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `connected` | — | Confirms the socket setup was successful |
| `message received` | Message object | Delivers a new message to the user's private room |
| `typing` | — | Typing indicator active |
| `stop typing` | — | Typing indicator inactive |

**Connection Configuration:**
```javascript
{
  pingTimeout: 60000,   // 60 seconds before disconnect
  cors: { origin: "*" } // Configure for production
}
```

---

## 📊 Data Models

### User

```javascript
{
  name:           String    // required
  email:          String    // required, unique
  password:       String    // required, bcrypt-hashed (pre-save hook)
  profilePicture: String    // default: anonymous avatar URL
  createdAt:      Date      // auto (timestamps)
  updatedAt:      Date      // auto (timestamps)
}
```

**Instance Methods:**
- `matchPassword(enteredPassword)` — Compares plaintext against stored hash

### Chat

```javascript
{
  chatName:      String                    // trimmed
  isGroupChat:   Boolean                   // default: false
  users:         [ObjectId → User]         // participants
  latestMessage: ObjectId → Message        // most recent message
  groupAdmin:    ObjectId → User           // group creator (groups only)
  createdAt:     Date                      // auto (timestamps)
  updatedAt:     Date                      // auto (timestamps)
}
```

### Message

```javascript
{
  sender:    ObjectId → User    // message author
  content:   String             // trimmed text content
  chat:      ObjectId → Chat    // parent chat
  createdAt: Date               // auto (timestamps)
  updatedAt: Date               // auto (timestamps)
}
```

---

## 🎨 Frontend Architecture

### State Management

Global state is managed via React Context (`ChatProvider`):

| State | Type | Purpose |
|---|---|---|
| `user` | Object / null | Currently authenticated user + JWT token |
| `currentChat` | Object / null | The actively selected chat |
| `chats` | Array | All chats for the logged-in user |
| `notification` | Array | Unread message notifications (persisted to `localStorage`) |

### Routing

| Path | Component | Description |
|---|---|---|
| `/` | `Homepage` | Auth screen (Login/Signup with animated tab switcher) |
| `/chats` | `Chatpage` | Main chat interface (protected — redirects to `/` if unauthenticated) |
| `*` | 404 | "NODE_NOT_FOUND" fallback |

### Component Hierarchy

```
App
├── Homepage
│   ├── Login (form → /api/users/login)
│   ├── Signup (form → /api/users/register + Cloudinary)
│   └── SocialButtons (Google / GitHub placeholders)
│
└── Chatpage
    ├── TopBar
    │   ├── User Search (→ /api/users?search=)
    │   ├── Notification Bell (grouped unread messages)
    │   ├── Profile Dropdown Menu
    │   ├── ProfileModal (CRT-styled user ID card)
    │   └── SettingsModal (encryption/audio/protocol toggles)
    │
    ├── LeftSection (sidebar)
    │   ├── Chat Filter (client-side search)
    │   ├── Chat List (sorted by last activity)
    │   └── GroupChatModal (create new group)
    │
    └── RightSection (main area)
        ├── Chat Header (connection status + info button)
        ├── Messages List (auto-scroll, sender alignment)
        ├── Typing Indicator (bouncing dots animation)
        ├── Message Input ($ prompt with send button)
        ├── ProfileModal (view peer's profile)
        └── UpdateGroupChatModal (rename, add/remove members, leave)
```

---

## 🤝 Contributing

Contributions are welcome! Follow these steps:

1. **Fork** the repository
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit** your changes with clear messages:
   ```bash
   git commit -m "feat: add end-to-end message encryption"
   ```
4. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open a Pull Request** with a detailed description

### Guidelines

- Follow the existing code style (ES6+, async/await, functional React components)
- Keep commits atomic and well-described
- Update this README if you add new features or endpoints
- Test both 1-on-1 and group chat flows before submitting
- Do not commit `.env` files or secrets

---

## 📄 License

This project is licensed under the **ISC License**.

---

<div align="center">

**Built with 💚 and a terminal aesthetic**

`> SYSTEM_STATUS: ONLINE`

</div>
