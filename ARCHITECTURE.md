# RecipeGram - Project Structure Overview

This document provides an overview of the RecipeGram project structure and architecture.

## Technology Stack

### Frontend
- **React 19** - UI Library
- **React Router DOM** - Routing
- **Redux Toolkit** - State Management
- **Tailwind CSS** - Styling
- **Axios** - HTTP Client
- **Vite** - Build Tool

### Backend
- **Node.js** - Runtime
- **Express.js 5** - Web Framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password Hashing
- **express-rate-limit** - Rate Limiting

## Project Structure

```
recipegramapp/
│
├── client/                     # Frontend React Application
│   ├── src/
│   │   ├── components/         # Reusable React Components
│   │   │   ├── common/        # Common UI components
│   │   │   ├── post/          # Post-related components
│   │   │   └── user/          # User-related components
│   │   ├── constants/         # Application constants
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/             # Page components (routes)
│   │   ├── services/          # API service layer
│   │   ├── store/             # Redux store configuration
│   │   │   └── slices/        # Redux slices
│   │   ├── utils/             # Utility functions
│   │   ├── App.jsx            # Main App component
│   │   ├── index.css          # Global styles
│   │   └── main.jsx           # Entry point
│   ├── .env.example           # Environment variables template
│   ├── Dockerfile             # Docker configuration
│   ├── package.json           # Dependencies and scripts
│   └── vite.config.js         # Vite configuration
│
├── server/                     # Backend Express Application
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   │   └── dbConnection.js
│   │   ├── controller/        # Route controllers
│   │   │   ├── auth.controller.js
│   │   │   ├── comment.controller.js
│   │   │   ├── follow.controller.js
│   │   │   ├── like.controller.js
│   │   │   ├── notification.controller.js
│   │   │   ├── post.controller.js
│   │   │   ├── save.controller.js
│   │   │   └── user.controller.js
│   │   ├── middleware/        # Custom middleware
│   │   │   ├── auth.middleware.js
│   │   │   ├── cors.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   └── rateLimiter.middleware.js
│   │   ├── models/            # Mongoose models
│   │   │   ├── Comment.model.js
│   │   │   ├── Follow.model.js
│   │   │   ├── Like.model.js
│   │   │   ├── Notification.model.js
│   │   │   ├── Post.model.js
│   │   │   └── User.model.js
│   │   ├── routes/            # API routes
│   │   │   ├── auth.routes.js
│   │   │   ├── comment.routes.js
│   │   │   ├── follow.routes.js
│   │   │   ├── like.routes.js
│   │   │   ├── notification.routes.js
│   │   │   ├── post.routes.js
│   │   │   ├── save.routes.js
│   │   │   ├── test.routes.js
│   │   │   └── user.routes.js
│   │   ├── util/              # Utility functions
│   │   ├── app.js             # Express app setup
│   │   └── index.js           # Server entry point
│   ├── .env.example           # Environment variables template
│   ├── Dockerfile             # Docker configuration
│   └── package.json           # Dependencies and scripts
│
├── docs/                       # Documentation
│   ├── backend-doc.md
│   └── frontend-doc.md
│
├── .gitignore                  # Git ignore rules
├── .prettierrc                 # Prettier configuration
├── .prettierignore             # Prettier ignore rules
├── CONTRIBUTING.md             # Contribution guidelines
├── docker-compose.yml          # Docker Compose configuration
├── LICENSE                     # Project license
├── package.json                # Root package.json
├── QUICKSTART.md              # Quick start guide
└── README.md                   # Project documentation
```

## Key Features

### Authentication & Authorization
- JWT-based authentication
- Password hashing with bcryptjs
- Protected routes on frontend
- Auth middleware on backend
- Rate limiting on auth endpoints

### Recipe/Post Management
- Create, read, update, delete posts
- Image upload support
- Ingredients and steps tracking
- Like/unlike functionality
- Comment system

### Social Features
- Follow/unfollow users
- User profiles
- Feed generation
- Search functionality
- Notifications
- Save posts

### Security Features
- CORS configuration
- Rate limiting (general, auth, search)
- Password hashing
- JWT with expiration
- Error handling middleware
- Input validation

### Frontend Architecture
- **Redux State Management**: Centralized state with slices
- **React Router**: Client-side routing with protected routes
- **API Service Layer**: Axios instance with interceptors
- **Custom Hooks**: Reusable logic for auth and posts
- **Component Structure**: Organized by feature

### Backend Architecture
- **MVC Pattern**: Separated models, controllers, and routes
- **Middleware Pipeline**: CORS, rate limiting, auth, error handling
- **RESTful API**: Standard HTTP methods and status codes
- **Database**: MongoDB with Mongoose ODM

## Development Workflow

1. **Setup**: Install dependencies with `npm run install-all`
2. **Configure**: Copy `.env.example` files and configure
3. **Develop**: Run `npm run dev` for hot-reload development
4. **Test**: Build with `npm run build`
5. **Deploy**: Use Docker or traditional deployment

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Users
- `GET /users/:username` - Get user profile
- `PUT /users/profile` - Update profile
- `GET /users/:userId/posts` - Get user posts
- `GET /users/search` - Search users

### Posts
- `GET /posts` - Get all posts
- `POST /posts` - Create post
- `GET /posts/:id` - Get post by ID
- `PUT /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post

### Likes
- `POST /likes/:postId` - Like post
- `DELETE /likes/:postId` - Unlike post

### Comments
- `GET /comments/:postId` - Get comments
- `POST /comments/:postId` - Add comment
- `DELETE /comments/:id` - Delete comment

### Follow
- `POST /follow/:userId` - Follow user
- `DELETE /follow/:userId` - Unfollow user

### Notifications
- `GET /api/notifications` - Get notifications

### Save
- `POST /save/:postId` - Save post
- `DELETE /save/:postId` - Unsave post

## Rate Limits

- **General API**: 100 requests / 15 minutes
- **Authentication**: 5 attempts / 15 minutes
- **Search**: 30 requests / minute
- **Post Creation**: 10 posts / hour

## Environment Variables

### Server
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT
- `JWT_EXPIRE` - JWT expiration time
- `CLIENT_URL` - Frontend URL for CORS

### Client
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_APP_NAME` - Application name

## Docker Support

The project includes Docker configuration for easy deployment:
- MongoDB service
- Backend service (Node.js/Express)
- Frontend service (React/Vite)

Run with: `docker-compose up -d`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

See [LICENSE](LICENSE) file.
