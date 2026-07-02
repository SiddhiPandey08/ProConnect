# ProConnect

A full-stack professional networking platform built with Next.js, Node.js, Express, MongoDB, and Socket.io. ProConnect lets users build profiles, share posts, grow their network through connection requests, and receive real-time notifications — inspired by the core experience of LinkedIn.

---

## Features

**Authentication**
- Register and login with hashed passwords via bcrypt
- Custom token auth using crypto.randomBytes, stored in MongoDB,
  verified via authMiddleware on all protected routes
  
**Profile**
- Editable name, headline, bio, profile picture
- Work history with company, position, and time spans
- Education section with school, degree, and field of study
- PDF resume generation via PDFKit

**Posts**
- Create posts with optional media attachments
- Edit and delete your own posts
- Like posts with optimistic UI updates
- Comment on posts with real-time rendering

**Connections**
- Send, accept, and reject connection requests
- View pending requests and accepted connections in both directions
- Connect button hides on your own profile and updates correctly regardless of which side of the connection you are on

**Real-time Notifications**
- Socket.io integration for live connection request and acceptance notifications
- Notifications panel in the dashboard sidebar
- Mark all as read clears the panel

**Dashboard**
- Feed of all posts with loading skeletons
- Right sidebar with people search, notifications, and top profiles
- Left sidebar navigation with active route highlighting
- Fully responsive with a fixed mobile bottom navigation bar

**Discover**
- Browse all users on the platform with profile cards

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, Redux Toolkit |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Real-time | Socket.io |
| File uploads | Multer, Cloudinary-compatible local storage |
| PDF generation | PDFKit |
| Styling | CSS Modules |

---

## Project Structure

```
proconnect/
├── backend/
│   ├── controllers/
│   │   ├── userControllers.js
│   │   ├── postControllers.js
│   │   └── notificationControllers.js
│   ├── models/
│   │   ├── userModel.js
│   │   ├── profileModel.js
│   │   ├── postModel.js
│   │   ├── connectionModel.js
│   │   └── notificationModel.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── postRoutes.js
│   │   └── notificationRoutes.js
|   |── middlewares/
│   |   ├── authMiddleware.js
│   |   ├── errorHandler.js
│   |   ├── rateLimiter.js
│   |   └── validate.js
├   |── validators/
│   |    ├── authValidators.js
│   |   ├── connectionValidators.js
│   |   └── profileValidators.js
|   ├── tests/
│   ├── auth.test.js
│   ├── connection.test.js
│   └── profile.test.js
|   |
│   └──server.js
└── frontend/
    └── src/
        ├── pages/
        │   ├── dashboard/
        │   ├── profile/
        │   ├── viewProfile/[username]/
        │   ├── discover/
        │   └── my_connections/
        ├── layouts/
        │   ├── index.jsx (UserLayout)
        │   └── DashboardLayout/
        ├── config/
        │   ├── redux/ (store, reducers, actions)
        │   └── socket.js
        └── components/
            ├── Toast/
            └── Skeleton/
```

---

## Getting Started

### Prerequisites

- Node.js 18 or above
- MongoDB Atlas account or local MongoDB instance

### Backend

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```
PORT=9090
MONGODB_URI=your_mongodb_connection_string
```

Start the server:

```bash
node server.js
```

### Frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file in the frontend directory:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:9090
```

Start the development server:

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

---

## Key Implementation Details

**Real-time notifications** are powered by Socket.io. On login, the client joins a room keyed to the user's ID. The backend emits `new_notification` events directly to that room whenever a connection request is sent or accepted, allowing the frontend to update the Redux store without polling.

**Connection state** is tracked bidirectionally. The view profile page checks both `authState.connections` (requests you sent) and `authState.connectionRequests` (requests received) to correctly show Connect, Pending, or Connected regardless of which side of the relationship the viewer is on.

**PDF resume generation** uses PDFKit on the backend. The resume is generated on request, saved temporarily to the uploads directory, and the file path is returned to the client for download via a new browser tab.

**Optimistic like updates** update only the affected post in Redux state without refetching the entire posts list, avoiding unnecessary re-renders across the feed.

---

## Security
- Rate limiting (global + auth-specific) via express-rate-limit
- Joi schema validation on all POST routes
- XSS protection via xss-clean
- NoSQL injection prevention via express-mongo-sanitize
- Global error handling middleware



## Screenshots






<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/cf7f0e5b-9577-4cfd-99fb-d18b2f5d3965" />
<img width="1920" height="1080" alt="Screenshot 2026-07-02 190350" src="https://github.com/user-attachments/assets/1e3b88e2-68e1-4174-a500-492ff2602e07" />
<img width="1920" height="1080" alt="Screenshot 2026-07-02 190327" src="https://github.com/user-attachments/assets/45bd8b97-2938-4282-8c78-8ce89a25145a" />









---

## Author

Built by Sddhi Pandey —  TCET Mumbai.

GitHub: SiddhiPandey08
