import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/environment.js';
import { ErrorHandler } from './common/middleware/error.middleware.js';

// Route imports
import authRoutes from './modules/auth/routes/auth.routes.js';
import userRoutes from './modules/users/routes/user.routes.js';
import courseRoutes from './modules/courses/routes/course.routes.js';
import practiceRoutes from './modules/practice/routes/practice.routes.js';
import streamingRoutes from './modules/streaming/routes/streaming.routes.js';
import compositionRoutes from './modules/composition/routes/composition.routes.js';
import gamificationRoutes from './modules/gamification/routes/gamification.routes.js';
import pianoRoutes from './modules/piano/routes/piano.routes.js';
import aiRoutes from './modules/ai/routes/ai.routes.js';
import adminRoutes from './modules/admin/routes/admin.routes.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: [config.FRONTEND_URL, config.FRONTEND_PRODUCTION_URL],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging
if (config.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/streaming', streamingRoutes);
app.use('/api/compositions', compositionRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/piano', pianoRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Swagger docs
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'PianoVerse API',
    version: '1.0.0',
    description: 'Piano learning platform API',
  },
  servers: [{ url: `http://localhost:${config.PORT}`, description: 'Development server' }],
  components: {
    securitySchemes: {
      BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Đăng ký tài khoản',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'firstName', 'lastName'],
                properties: {
                  email: { type: 'string', example: 'test@gmail.com' },
                  password: { type: 'string', example: '123456' },
                  firstName: { type: 'string', example: 'Nguyen' },
                  lastName: { type: 'string', example: 'Van A' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Đăng ký thành công' } },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Đăng nhập',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'test@gmail.com' },
                  password: { type: 'string', example: '123456' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Đăng nhập thành công' } },
      },
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Làm mới token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: { refreshToken: { type: 'string' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Token mới' } },
      },
    },
    '/api/users/profile': {
      get: {
        tags: ['Users'],
        summary: 'Lấy thông tin profile',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Profile người dùng' } },
      },
      put: {
        tags: ['Users'],
        summary: 'Cập nhật profile',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fullName: { type: 'string' },
                  bio: { type: 'string' },
                  skillLevel: {
                    type: 'string',
                    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
                  },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Cập nhật thành công' } },
      },
    },
    '/api/users/statistics': {
      get: {
        tags: ['Users'],
        summary: 'Thống kê người dùng',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Thống kê' } },
      },
    },
    '/api/courses': {
      get: {
        tags: ['Courses'],
        summary: 'Danh sách khóa học',
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
        ],
        responses: { 200: { description: 'Danh sách khóa học' } },
      },
      post: {
        tags: ['Courses'],
        summary: 'Tạo khóa học mới',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
                  price: { type: 'number' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Tạo thành công' } },
      },
    },
    '/api/courses/{id}': {
      get: {
        tags: ['Courses'],
        summary: 'Chi tiết khóa học',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Chi tiết khóa học' } },
      },
    },
    '/api/courses/enroll': {
      post: {
        tags: ['Courses'],
        summary: 'Đăng ký khóa học',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { courseId: { type: 'string' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Đăng ký thành công' } },
      },
    },
    '/api/practice/sessions': {
      post: {
        tags: ['Practice'],
        summary: 'Ghi lại buổi luyện tập',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  songName: { type: 'string', example: 'Fur Elise' },
                  difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
                  durationSeconds: { type: 'integer', example: 300 },
                  notesHit: { type: 'integer', example: 150 },
                  notesMissed: { type: 'integer', example: 10 },
                  accuracyPercentage: { type: 'number', example: 93.75 },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Ghi lại thành công' } },
      },
      get: {
        tags: ['Practice'],
        summary: 'Lịch sử luyện tập',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Danh sách buổi luyện tập' } },
      },
    },
    '/api/practice/stats': {
      get: {
        tags: ['Practice'],
        summary: 'Thống kê luyện tập',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Thống kê' } },
      },
    },
    '/api/streaming/tracks': {
      get: {
        tags: ['Streaming'],
        summary: 'Danh sách bài nhạc',
        responses: { 200: { description: 'Danh sách tracks' } },
      },
    },
    '/api/streaming/tracks/search': {
      get: {
        tags: ['Streaming'],
        summary: 'Tìm kiếm bài nhạc',
        parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Kết quả tìm kiếm' } },
      },
    },
    '/api/piano/samples': {
      get: {
        tags: ['Piano'],
        summary: 'Lấy sound samples',
        responses: { 200: { description: 'Danh sách samples' } },
      },
    },
    '/api/piano/config': {
      get: {
        tags: ['Piano'],
        summary: 'Cấu hình đàn piano',
        responses: { 200: { description: 'Config' } },
      },
    },
    '/api/gamification/achievements': {
      get: {
        tags: ['Gamification'],
        summary: 'Danh sách thành tích',
        responses: { 200: { description: 'Thành tích' } },
      },
    },
    '/api/gamification/leaderboard': {
      get: {
        tags: ['Gamification'],
        summary: 'Bảng xếp hạng',
        responses: { 200: { description: 'Leaderboard' } },
      },
    },
    '/api/ai/recommendations': {
      get: {
        tags: ['AI'],
        summary: 'Gợi ý luyện tập từ AI',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Gợi ý' } },
      },
    },
    '/api/ai/chat': {
      post: {
        tags: ['AI'],
        summary: 'Chat với AI trợ lý',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  messages: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        role: { type: 'string', enum: ['user', 'assistant'] },
                        content: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Phản hồi từ AI' } },
      },
    },
    '/api/admin/stats': {
      get: {
        tags: ['Admin'],
        summary: 'Thống kê hệ thống',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Thống kê' } },
      },
    },
    '/api/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'Quản lý người dùng',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: { 200: { description: 'Danh sách users' } },
      },
    },
    '/api/health': {
      get: {
        tags: ['System'],
        summary: 'Kiểm tra server',
        responses: { 200: { description: 'Server đang chạy' } },
      },
    },
  },
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler (must be last)
app.use(ErrorHandler);

export default app;
