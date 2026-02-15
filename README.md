# RecipeGram 🍳📸

A modern MERN stack social media platform for food lovers to share and discover amazing recipes. Inspired by Instagram, RecipeGram focuses on visual food presentation and recipe sharing.

## 🌟 Features

- **User Authentication**: Secure signup/login with JWT authentication
- **Recipe Posts**: Create, edit, and delete recipe posts with images, ingredients, and steps
- **Social Interactions**: Like, comment, and save recipes
- **Follow System**: Follow other food enthusiasts and build your community
- **User Profiles**: Personalized profiles with recipe collections
- **Feed Generation**: Smart feed showing recipes from followed users
- **Search & Explore**: Discover new recipes and users
- **Real-time Notifications**: Stay updated with likes, comments, and follows
- **Responsive Design**: Beautiful UI with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **React Router** - Client-side routing
- **Redux Toolkit** - State management
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📋 Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas account)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/harshhpatil/recipegramapp.git
cd recipegramapp
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all dependencies (root, client, and server)
npm run install-all
```

### 3. Environment Setup

#### Server Configuration
Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/recipegram
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

#### Client Configuration
Create a `.env` file in the `client` directory:

```bash
cd client
cp .env.example .env
```

Edit the `.env` file:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME=RecipeGram
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# For local MongoDB
mongod

# Or use MongoDB Atlas and update MONGODB_URI in server/.env
```

### 5. Run the Application

#### Development Mode (Recommended)

```bash
# Run both client and server concurrently
npm run dev
```

This will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

#### Run Separately

```bash
# Terminal 1 - Start backend
npm run server

# Terminal 2 - Start frontend
npm run client
```

### 6. Build for Production

```bash
# Build frontend
npm run build

# Start production server
npm start
```

## 🐳 Docker Setup (Alternative)

### Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- MongoDB: localhost:27017

## 📁 Project Structure

```
recipegramapp/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store and slices
│   │   ├── services/      # API service layer
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   ├── App.jsx        # Main App component
│   │   └── main.jsx       # Entry point
│   ├── public/            # Static assets
│   ├── package.json
│   └── vite.config.js
│
├── server/                # Backend Express application
│   ├── src/
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Custom middleware
│   │   ├── config/        # Configuration files
│   │   ├── util/          # Utility functions
│   │   ├── app.js         # Express app setup
│   │   └── index.js       # Server entry point
│   └── package.json
│
├── docker-compose.yml     # Docker configuration
├── package.json           # Root package.json
└── README.md             # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - Create new user account
- `POST /auth/login` - User login

### Posts
- `GET /posts` - Get all posts (feed)
- `GET /posts/:id` - Get specific post
- `POST /posts` - Create new post (authenticated)
- `PUT /posts/:id` - Update post (authenticated)
- `DELETE /posts/:id` - Delete post (authenticated)

### Likes
- `POST /likes/:postId` - Like a post (authenticated)
- `DELETE /likes/:postId` - Unlike a post (authenticated)

### Comments
- `GET /comments/:postId` - Get post comments
- `POST /comments/:postId` - Add comment (authenticated)
- `DELETE /comments/:id` - Delete comment (authenticated)

### Follow
- `POST /follow/:userId` - Follow user (authenticated)
- `DELETE /follow/:userId` - Unfollow user (authenticated)

### Notifications
- `GET /api/notifications` - Get user notifications (authenticated)

### Save
- `POST /save/:postId` - Save post (authenticated)
- `DELETE /save/:postId` - Unsave post (authenticated)

## 🧪 Testing

```bash
# Run tests (if configured)
cd client && npm test
cd server && npm test
```

## 🔒 Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **CORS**: Configured for cross-origin requests
- **Environment Variables**: Sensitive data stored in .env files
- **Input Validation**: Server-side validation for all inputs
- **XSS Protection**: Sanitized user inputs

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Harsh Patil - [@harshhpatil](https://github.com/harshhpatil)

## 🙏 Acknowledgments

- Inspired by Instagram's UI/UX
- Built as a final-year project
- Special thanks to the MERN stack community

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Made with ❤️ and lots of ☕
