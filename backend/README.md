# Piano Verse Backend API

Production-ready backend API for the Piano Verse AI piano learning platform.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis
- **Queue**: BullMQ
- **Real-time**: Socket.IO
- **Authentication**: JWT
- **File Storage**: AWS S3
- **CDN**: CloudFront
- **Container**: Docker
- **CI/CD**: GitHub Actions

## Architecture

### Modular Monolith Structure

```
src/
├── modules/
│   ├── auth/              # Authentication
│   ├── users/             # User management
│   ├── roles/             # Role-based access control
│   ├── permissions/       # Permission management
│   ├── courses/           # Course content
│   ├── practice/          # Practice sessions
│   ├── piano/             # Piano functionality
│   ├── streaming/         # Music streaming
│   ├── playlist/          # Playlists
│   ├── composition/       # Music composition
│   ├── ai/                # AI modules
│   │   ├── teacher/       # AI teacher
│   │   ├── composer/      # AI composer
│   │   ├── voice/         # Voice processing
│   │   ├── sheet/         # Sheet music generation
│   │   ├── recommendation/ # Recommendations
│   │   └── assistant/     # General AI assistant
│   ├── gamification/      # Achievements & XP
│   ├── notifications/     # Push notifications
│   ├── subscription/      # Subscription management
│   └── admin/             # Admin dashboard
├── config/                # Configuration
├── common/                # Shared utilities
│   ├── middleware/        # Global middleware
│   ├── utils/             # Helper functions
│   ├── constants/         # Constants
│   └── types/             # TypeScript types
└── index.ts               # Entry point
```

### Module Structure

Each module follows this pattern:

```
module-name/
├── controllers/           # HTTP request handlers
├── services/              # Business logic
├── repositories/          # Data access layer
├── models/                # MongoDB schemas
├── routes/                # Express routes
├── validators/            # Request validation
├── middlewares/           # Module-specific middleware
└── dtos/                  # Data transfer objects
```

## Prerequisites

- Node.js 20+
- MongoDB 7+
- Redis 7+
- Docker & Docker Compose (optional)

## Installation

### Local Development

1. **Clone the repository**:
```bash
git clone <repo-url>
cd pianoverse-backend
```

2. **Install dependencies**:
```bash
pnpm install
```

3. **Create .env file**:
```bash
cp .env.example .env
```

4. **Configure environment variables** in `.env`

5. **Run development server**:
```bash
pnpm dev
```

The API will be available at `http://localhost:3001`
API documentation: `http://localhost:3001/api-docs`

### Docker Development

1. **Start all services**:
```bash
docker-compose up
```

2. **Access the API**:
- API: `http://localhost:3001`
- MongoDB: `mongodb://localhost:27017`
- Redis: `redis://localhost:6379`
- Docs: `http://localhost:3001/api-docs`

## API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "token..."
}
```

### Protected Endpoints

Use Bearer token in Authorization header:
```http
GET /api/users/profile
Authorization: Bearer <accessToken>
```

## Project Scripts

```bash
# Development
pnpm dev              # Start dev server with hot reload
pnpm watch           # Watch TypeScript compilation

# Build & Production
pnpm build           # Compile TypeScript
pnpm start           # Start production server

# Testing
pnpm test            # Run tests
pnpm test:watch      # Run tests in watch mode

# Code Quality
pnpm lint            # Run ESLint
pnpm lint:fix        # Fix linting issues
pnpm format          # Format code with Prettier
pnpm typecheck       # Type check with TypeScript

# Docker
pnpm docker:build    # Build Docker image
pnpm docker:run      # Run Docker container

# Documentation
pnpm docs:generate   # Generate API documentation
```

## Environment Variables

```env
# Server
NODE_ENV=development
PORT=3001
HOST=localhost

# Database
MONGODB_URI=mongodb+srv://...

# Cache
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRY=7d
JWT_REFRESH_EXPIRY=30d

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET_NAME=pianoverse-files

# AI Services
OPENAI_API_KEY=...
GEMINI_API_KEY=...
DEEPGRAM_API_KEY=...
ELEVENLABS_API_KEY=...

# Frontend
FRONTEND_URL=http://localhost:3000
FRONTEND_PRODUCTION_URL=https://pianoverse.com
```

## Database Schema

### User
- Email (unique, indexed)
- Password (hashed)
- Profile info
- Role & permissions
- Practice stats
- Preferences
- Soft delete support

### Course
- Title & description
- Difficulty level
- Content modules
- Instructor info
- Enrollment tracking

### Practice Session
- User & song info
- Duration & accuracy
- Notes analysis
- Performance metrics

## Security Features

- ✅ JWT authentication with refresh tokens
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (RBAC)
- ✅ Permission-based authorization
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ XSS protection with Helmet
- ✅ Input validation & sanitization
- ✅ SQL injection prevention
- ✅ Soft delete for audit trail

## Performance Optimizations

- Database indexing on frequently queried fields
- MongoDB aggregation pipelines
- Redis caching layer
- Connection pooling
- BullMQ for background jobs
- CDN for static file delivery

## Deployment

### AWS ECS Deployment

1. **Build Docker image**:
```bash
docker build -t pianoverse-backend:latest .
```

2. **Push to ECR**:
```bash
aws ecr get-login-password | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com
docker tag pianoverse-backend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/pianoverse-backend:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/pianoverse-backend:latest
```

3. **Deploy to ECS**:
```bash
aws ecs update-service --cluster pianoverse --service pianoverse-backend --force-new-deployment
```

### MongoDB Atlas

- Managed MongoDB database
- Automatic backups
- Built-in monitoring
- Easy scaling

### Redis Cloud

- Managed Redis instance
- Auto-scaling
- High availability

## Monitoring & Logging

- Application logs to stdout
- Structured logging with timestamps
- Error tracking ready for Sentry integration
- Performance monitoring hooks

## Contributing

1. Create feature branch
2. Follow code style
3. Add tests
4. Submit PR

## License

MIT
