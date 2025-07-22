# 🏠 Real Estate API

A comprehensive Real Estate API with authentication, validation, and database management.

## 🚀 Features

- **User Authentication**: Local and Google OAuth login
- **Data Validation**: Comprehensive input validation and sanitization
- **Security**: JWT tokens, password hashing, XSS protection
- **Database Management**: MongoDB with automatic indexing
- **API Documentation**: Complete endpoint documentation

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd real-estate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/real-estate
   JWT_SECRET=your-super-secret-jwt-key
   ```

4. **Initialize the database**
   ```bash
   npm run db:init
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Management

### Initialize Database
```bash
npm run db:init
```
- Creates database indexes
- Sets up default admin user
- Validates database connection

### Reset Database
```bash
npm run db:reset
```
- ⚠️ **Warning**: This will delete all data
- Drops all collections
- Use with caution

### View Database Statistics
```bash
npm run db:stats
```
- Shows user statistics
- Displays recent users
- Database health information

### Database Help
```bash
npm run db:help
```
- Shows all available database commands

## 🔐 Authentication

### Default Admin User
After running `npm run db:init`, a default admin user is created:
- **Email**: `admin@realestate.com`
- **Password**: `admin123456`

### Authentication Methods

1. **Local Authentication**
   - Email and password
   - Password hashing with bcrypt
   - JWT token generation

2. **Google OAuth**
   - Google account integration
   - Automatic user creation
   - Secure token management

## 📚 API Documentation

Complete API documentation is available in [AUTH_API.md](./AUTH_API.md)

### Quick Start Examples

#### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "phoneNumber": "+1234567890"
  }'
```

#### Login with local authentication
```bash
curl -X POST http://localhost:5000/api/auth/login/local \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/real-estate` |
| `JWT_SECRET` | JWT signing secret | Required |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Optional |
| `BACKEND_BASE_URL` | Backend URL | `http://localhost:5000` |
| `FRONTEND_URL` | Frontend URL | `http://localhost:3000` |

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)
6. Add credentials to `.env` file

## 🏗️ Project Structure

```
src/
├── config/
│   └── index.js              # Database and app configuration
├── controllers/
│   └── auth/
│       └── authController.js # Authentication controller
├── middleware/
│   └── validationMiddleware.js # Validation and sanitization
├── models/
│   └── User.js               # User model
├── routes/
│   └── auth/
│       └── authRoute.js      # Authentication routes
├── scripts/
│   └── initDatabase.js       # Database initialization
├── services/
│   └── auth/
│       └── authService.js    # Authentication business logic
├── validation/
│   └── dynamicValidateAndSanitize.js # Validation system
├── app.js                    # Express app setup
└── index.js                  # Server entry point
```

## 🧪 Testing

### Manual Testing

1. **Start the server**
   ```bash
   npm run dev
   ```

2. **Test registration**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "firstName": "Test",
       "lastName": "User",
       "email": "test@example.com",
       "password": "password123",
       "phoneNumber": "+1234567890"
     }'
   ```

3. **Test login**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login/local \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123"
     }'
   ```

### Health Check
```bash
curl http://localhost:5000/health
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Input Validation**: Comprehensive data validation
- **XSS Protection**: Automatic HTML tag removal
- **NoSQL Injection Protection**: MongoDB query sanitization
- **CORS Configuration**: Secure cross-origin requests
- **HTTP-Only Cookies**: Secure token storage

## 🚀 Deployment

### Production Setup

1. **Set environment variables**
   ```env
   NODE_ENV=production
   JWT_SECRET=your-production-secret
   MONGODB_URI=your-production-mongodb-uri
   GOOGLE_CLIENT_ID=your-production-google-client-id
   GOOGLE_CLIENT_SECRET=your-production-google-client-secret
   ```

2. **Initialize production database**
   ```bash
   npm run db:init
   ```

3. **Start production server**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation in `AUTH_API.md`
- Review the database management commands with `npm run db:help` 