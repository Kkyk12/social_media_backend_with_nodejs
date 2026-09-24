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
* **Socket.IO**
* **Redis** *(optional; used for presence, rate limiting, and Socket.IO scaling)*

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

### Users, conversations, and messages

* Profile updates, usernames, display names, bios, and avatar URLs
* User search and online/offline presence
* Private conversations, groups, and channels
* Conversation membership, owner/admin/member roles, joining, leaving, and blocking
* Message replies, forwards, edits, soft deletes, pagination, search, and read receipts

### Real-time messaging

* JWT-authenticated Socket.IO connections
* New, edited, and deleted message events
* Typing indicators, online presence, and read-receipt events

## API

See [API.md](API.md) for the concise endpoint and Socket.IO reference.

### Authentication

| Method | Endpoint               | Description            |
| ------ | ---------------------- | ---------------------- |
| `POST` | `/api/auth/register`   | Register a new user    |
| `POST` | `/api/auth/login`      | Login                  |
| `POST` | `/api/auth/refresh`    | Refresh access token   |
| `POST` | `/api/auth/logout`     | Logout current session |
| `POST` | `/api/auth/logout-all` | Logout all sessions    |

### Users

| Method | Endpoint | Description |
| ------ | ------ | ------ |
| `GET` | `/api/users/me` | Get authenticated user |
| `PATCH` | `/api/users/me` | Update username, display name, bio, or avatar URL |
| `POST` | `/api/users/me/presence` | Set online/offline status |
| `GET` | `/api/users/search?q=...` | Search users by username or display name |
| `POST` / `DELETE` | `/api/users/:userId/block` | Block or unblock a user |

### Conversations and messages

All endpoints below require a Bearer access token. Set `type` to `private`, `group`, or `channel` when creating a conversation.

| Method | Endpoint | Description |
| ------ | ------ | ------ |
| `POST` | `/api/conversations` | Create a private conversation, group, or channel |
| `GET` | `/api/conversations` | List conversations for the current user |
| `GET` | `/api/conversations/:conversationId` | Get members and roles |
| `POST` / `DELETE` | `/api/conversations/:conversationId/members...` | Add or remove members |
| `PATCH` | `/api/conversations/:conversationId/members/:userId/role` | Set `admin` or `member` role |
| `POST` | `/api/conversations/:conversationId/leave` | Leave a group or channel |
| `POST` | `/api/conversations/:conversationId/join` | Join a channel |
| `POST` | `/api/conversations/:conversationId/messages` | Send a message, reply, or forward |
| `GET` | `/api/conversations/:conversationId/messages` | Paginated message history |
| `GET` | `/api/conversations/:conversationId/messages/search?q=...` | Search messages |
| `PATCH` / `DELETE` | `/api/conversations/:conversationId/messages/:messageId` | Edit or delete own messages |
| `POST` | `/api/conversations/:conversationId/messages/read` | Mark messages as read |

### Real-time events

Connect Socket.IO with `auth: { token: accessToken }`. The server supports `send-message`, `edit-message`, `delete-message`, `typing`, and `read-messages`; it emits `new-message`, `message-edited`, `message-deleted`, `typing`, `read-receipt`, and presence changes.

Set `REDIS_URL` to enable Redis-backed presence, distributed login rate limiting, and Socket.IO scaling. Without it, presence uses an in-memory fallback and the login limiter remains process-local.

## Project Structure

```text
telegram-backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── redis.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Session.js
│   │   ├── Conversation.js
│   │   └── Message.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── conversation.controller.js
│   │   └── message.controller.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── auth.validation.js
│   │   ├── user.routes.js
│   │   ├── conversation.routes.js
│   │   └── message.routes.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── validation.middleware.js
│   │   └── rate-limit.middleware.js
│   │
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── session.service.js
│   │   ├── conversation.service.js
│   │   ├── presence.service.js
│   │   ├── cache.service.js
│   │   └── token.service.js
│   │
│   ├── realtime/
│   │   └── socket.js
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

# Optional Redis support
REDIS_URL=redis://127.0.0.1:6379
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
    "email": "youremail@example.com",
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

* [x] Update profile
* [x] Change username
* [x] Bio
* [x] Avatar URL
* [x] User search
* [x] Online/offline status
* [x] Last seen

### Phase 3 — Conversations

* [x] Private conversations
* [x] Groups and channels
* [x] Conversation members
* [x] Group roles
* [x] Admin permissions
* [x] Add/remove members
* [x] Leave groups and channels
* [x] Block users

### Phase 4 — Messages

* [x] Send messages
* [x] Edit messages
* [x] Delete messages
* [x] Reply to messages
* [x] Forward messages
* [x] Message pagination
* [x] Message search
* [x] Read status

### Phase 5 — Real-Time Messaging

* [x] Socket.IO
* [x] WebSocket authentication
* [x] New message events
* [x] Message editing events
* [x] Message deletion events
* [x] Typing indicators
* [x] Online presence
* [x] Read receipts

### Phase 6 — Channels

* [x] Creating channels
* [x] Joining channels
* [x] Channel roles
* [x] Leaving channels
* [x] Viewing channels
* [x] Editing and posting in channels

### Phase 7 — Media

* [ ] Image uploads
* [ ] Video uploads
* [ ] Audio
* [ ] Documents
* [ ] Object storage
* [ ] Media metadata

### Phase 8 — Scaling

* [x] Redis integration
* [x] Presence storage
* [x] Caching
* [x] Distributed rate limiting
* [x] Socket.IO scaling

### Phase 9 — Production

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
