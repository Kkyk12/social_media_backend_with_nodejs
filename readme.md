# Telegram Backend

A Telegram-like backend built from scratch using **Node.js, Express, MongoDB, and Mongoose**.

This project is mainly a learning and engineering project focused on building a real-world backend architecture, authentication system, sessions, security, and eventually real-time messaging.

## Tech Stack

* **Node.js**
* **Express.js**
* **MongoDB**
* **Mongoose**
* **JWT**
* **bcryptjs**
* **express-validator**
* **express-rate-limit**
* **Socket.IO** *(planned)*
* **Redis** *(planned)*

## Current Features

### Authentication

* User registration
* User login
* Password hashing with bcrypt
* JWT access tokens
* Refresh tokens
* Refresh token hashing with SHA-256
* Refresh token rotation
* Session/device tracking
* Session expiration
* Token revocation
* Logout current device
* Logout all devices
* JWT authentication middleware

### Validation & Security

* Request body validation
* Email validation
* Password validation
* Username validation
* Login rate limiting
* Protected routes

## API

### Authentication

| Method | Endpoint               | Description            |
| ------ | ---------------------- | ---------------------- |
| `POST` | `/api/auth/register`   | Register a new user    |
| `POST` | `/api/auth/login`      | Login                  |
| `POST` | `/api/auth/refresh`    | Refresh access token   |
| `POST` | `/api/auth/logout`     | Logout current session |
| `POST` | `/api/auth/logout-all` | Logout all sessions    |

### Users

| Method | Endpoint        | Description            |
| ------ | --------------- | ---------------------- |
| `GET`  | `/api/users/me` | Get authenticated user |

## Project Structure

```text
telegram-backend/
├── src/
│   ├── config/
│   │   └── database.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   └── Session.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── user.controller.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── auth.validation.js
│   │   └── user.routes.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── validation.middleware.js
│   │   └── rate-limit.middleware.js
│   │
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── session.service.js
│   │   └── token.service.js
│   │
│   ├── app.js
│   └── server.js
│
├── .env
├── .gitignore
├── package.json
└── package-lock.json
```

## Architecture

The backend follows a layered architecture:

```text
Request
   ↓
Route
   ↓
Middleware
   ↓
Controller
   ↓
Service
   ↓
Model
   ↓
MongoDB
```

Controllers handle HTTP requests, services contain business logic, and Mongoose models handle database operations.

## Authentication Flow

### Login

```text
Client
  ↓
POST /api/auth/login
  ↓
Validation
  ↓
Rate Limiter
  ↓
Controller
  ↓
Auth Service
  ↓
Check password
  ↓
Generate access token
  ↓
Generate refresh token
  ↓
Hash refresh token
  ↓
Store session in MongoDB
  ↓
Return tokens
```

### Access Token

Access tokens are JWTs with a short lifetime.

```text
Access Token
    ↓
Authorization: Bearer <token>
    ↓
JWT Middleware
    ↓
Verify JWT
    ↓
req.user
```

### Refresh Token

Refresh tokens are random tokens and are **not stored directly in MongoDB**.

Instead:

```text
Refresh Token
      ↓
SHA-256
      ↓
Hash stored in MongoDB
```

When refreshing:

```text
Old Refresh Token
       ↓
Find session
       ↓
Verify session
       ↓
Generate new access token
       ↓
Generate new refresh token
       ↓
Replace stored hash
```

This implements refresh-token rotation.

## Environment Variables

Create a `.env` file:

```env
PORT=3000

MONGO_URI=mongodb://127.0.0.1:27017/telegram_backend

JWT_SECRET=your_secret_here

ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d
```

**Never commit `.env` to GitHub.**

## Installation

Clone the repository:

```bash
git clone YOUR_REPOSITORY_URL
cd telegram-backend
```

Install dependencies:

```bash
npm install
```

Create your `.env` file and configure MongoDB.

Start the development server:

```bash
npm run dev
```

The server runs on:

```text
http://localhost:3000
```

## Testing

The API can be tested using **Postman**.

Example registration:

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
    "username": "username",
    "email": "email@example.com",
    "password": "mysecretpassword",
    "displayName": "name"
}
```

Example login:

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
    "email": "kkyk1286@example.com",
    "password": "mysecretpassword"
}
```

## Roadmap

### Phase 1 — Authentication

* [x] Registration
* [x] Login
* [x] JWT authentication
* [x] Refresh tokens
* [x] Sessions
* [x] Token rotation
* [x] Logout
* [x] Logout all devices
* [x] Request validation
* [x] Login rate limiting

### Phase 2 — Users

* [ ] Update profile
* [ ] Change username
* [ ] Bio
* [ ] Avatar
* [ ] User search
* [ ] Online/offline status
* [ ] Last seen

### Phase 3 — Conversations

* [ ] Private conversations
* [ ] Groups
* [ ] Conversation members
* [ ] Group roles
* [ ] Admin permissions
* [ ] Add/remove members
* [ ] Leave groups
* [ ] Block users

### Phase 4 — Messages

* [ ] Send messages
* [ ] Edit messages
* [ ] Delete messages
* [ ] Reply to messages
* [ ] Forward messages
* [ ] Message pagination
* [ ] Message search
* [ ] Read status

### Phase 5 — Real-Time Messaging

* [ ] Socket.IO
* [ ] WebSocket authentication
* [ ] New message events
* [ ] Message editing events
* [ ] Message deletion events
* [ ] Typing indicators
* [ ] Online presence
* [ ] Read receipts

### Phase 6 — Media

* [ ] Image uploads
* [ ] Video uploads
* [ ] Audio
* [ ] Documents
* [ ] Object storage
* [ ] Media metadata

### Phase 7 — Scaling

* [ ] Redis
* [ ] Presence storage
* [ ] Caching
* [ ] Distributed rate limiting
* [ ] Socket.IO scaling

### Phase 8 — Production

* [ ] Docker
* [ ] Nginx
* [ ] Production MongoDB
* [ ] Redis
* [ ] Object storage
* [ ] Logging
* [ ] Monitoring
* [ ] Load testing

## Disclaimer

This project is an independent backend implementation inspired by the functionality of modern messaging platforms. It is not affiliated with Telegram.
