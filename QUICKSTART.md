# RecipeGram Quick Start Guide

Get RecipeGram up and running in minutes!

## Prerequisites

- Node.js v18+ installed
- MongoDB installed locally or MongoDB Atlas account
- Git installed

## Quick Start (5 minutes)

### 1. Clone and Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/harshhpatil/recipegramapp.git
cd recipegramapp

# Install all dependencies
npm run install-all
```

### 2. Configure Environment (1 minute)

#### Server Configuration
```bash
# Create server .env file
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/recipegram
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

#### Client Configuration
```bash
# Create client .env file
cd ../client
cp .env.example .env
```

Edit `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME=RecipeGram
```

### 3. Start MongoDB (30 seconds)

```bash
# If using local MongoDB
mongod

# OR use MongoDB Atlas and update MONGODB_URI in server/.env
```

### 4. Run the Application (1 minute)

```bash
# From the root directory
npm run dev
```

This starts both:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## What's Next?

1. **Create an Account**: Click "Sign Up" and create your first account
2. **Explore Features**: Try creating a post, searching users, or exploring recipes
3. **Read the Docs**: Check out the main [README.md](README.md) for detailed information

## Common Commands

```bash
# Run both client and server
npm run dev

# Run only client
npm run client

# Run only server
npm run server

# Build for production
npm run build

# Install all dependencies
npm run install-all
```

## Using Docker (Alternative)

If you prefer Docker:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Troubleshooting

### Port already in use
- Change `PORT` in `server/.env`
- Change Vite port in `client/vite.config.js`

### Database connection error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `server/.env`

### Cannot login after registration
- Check browser console for errors
- Verify `JWT_SECRET` is set in `server/.env`
- Clear browser local storage

## Development Tips

- **Hot Reload**: Both frontend and backend support hot reload
- **API Testing**: Use Postman or Thunder Client to test API endpoints
- **Database GUI**: Use MongoDB Compass to view your database

## Need Help?

- Check [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
- Open an issue on GitHub
- Review the main [README.md](README.md)

Happy Cooking! 🍳👨‍🍳
