import express from 'express'
import { CourseController } from '../controllers/course.controller.js'
import { authenticate } from '../../../common/middleware/auth.middleware.js'
import { authorizeRole } from '../../../common/middleware/authorize.middleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/courses:
 *   get:
 *     tags: [Courses]
 *     summary: Get all courses
 *     responses:
 *       200:
 *         description: List of courses
 */
router.get('/', CourseController.getAllCourses)

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     tags: [Courses]
 *     summary: Get course by ID
 */
router.get('/:id', CourseController.getCourseById)

/**
 * @swagger
 * /api/courses/{id}/lessons:
 *   get:
 *     tags: [Courses]
 *     summary: Get course lessons
 */
router.get('/:id/lessons', CourseController.getCourseLessons)

/**
 * @swagger
 * /api/courses/enroll:
 *   post:
 *     tags: [Courses]
 *     summary: Enroll in a course
 *     security:
 *       - BearerAuth: []
 */
router.post('/enroll', authenticate, CourseController.enrollCourse)

/**
 * @swagger
 * /api/courses/my-courses:
 *   get:
 *     tags: [Courses]
 *     summary: Get user's enrolled courses
 *     security:
 *       - BearerAuth: []
 */
router.get('/my-courses', authenticate, CourseController.getUserCourses)

/**
 * @swagger
 * /api/courses/progress:
 *   post:
 *     tags: [Courses]
 *     summary: Update course progress
 *     security:
 *       - BearerAuth: []
 */
router.post('/progress', authenticate, CourseController.updateProgress)

/**
 * @swagger
 * /api/courses:
 *   post:
 *     tags: [Courses]
 *     summary: Create a course
 *     security:
 *       - BearerAuth: []
 */
router.post('/', authenticate, authorizeRole(['teacher', 'admin']), CourseController.createCourse)

export default router
