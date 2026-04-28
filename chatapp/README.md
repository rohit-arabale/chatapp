# ChatApp — Full-Stack Real-Time Chat

A production-structured real-time chat application built with React, Node.js, MongoDB, and Socket.io.

## Tech Stack
- **Frontend**: React 18 + Vite + React Router
- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Real-time**: Socket.io
- **Auth**: JWT + bcryptjs

## Project Structure
```
chatapp/
├── backend/   → Express API + Socket.io server
└── frontend/  → React Vite app
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017 (or update MONGO_URI in backend/.env)

### 1. Backend
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### 3. Test
- Open two browser windows/tabs
- Create two accounts via /signup
- Log in as different users
- Select the other user and start chatting!

## Environment Variables

**backend/.env**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
CLIENT_URL=http://localhost:5173
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Common Errors & Fixes

| Error | Fix |
|---|---|
| `ECONNREFUSED` MongoDB | Start MongoDB with `mongod` or use Atlas |
| `401 Not authorized` | JWT expired — log in again |
| CORS error | Match `CLIENT_URL` in backend `.env` to frontend URL |
| White screen | Check browser console for import errors |
| Messages not real-time | Check server console for socket connection logs |
