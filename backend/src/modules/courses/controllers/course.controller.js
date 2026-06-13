import { CourseService } from '../services/course.service.js'
import { asyncHandler } from '../../../common/utils/async-handler.js'

const courseService = new CourseService()

export class CourseController {
  static getAllCourses = asyncHandler(async (req, res) => {
    const { limit = 20, offset = 0 } = req.query
    const courses = await courseService.getAllCourses(Number(limit), Number(offset))
    res.json({ success: true, data: courses })
  })

  static getCourseById = asyncHandler(async (req, res) => {
    const { id } = req.params
    const course = await courseService.getCourseById(id)

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }

    res.json({ success: true, data: course })
  })

  static getCourseLessons = asyncHandler(async (req, res) => {
    const { id } = req.params
    const lessons = await courseService.getCourseLessons(id)
    res.json({ success: true, data: lessons })
  })

  static enrollCourse = asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { courseId } = req.body

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Course ID required' })
    }

    const progress = await courseService.enrollCourse(userId, courseId)
    res.json({ success: true, data: progress })
  })

  static getUserCourses = asyncHandler(async (req, res) => {
    const userId = req.user.id
    const courses = await courseService.getUserCourses(userId)
    res.json({ success: true, data: courses })
  })

  static updateProgress = asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { courseId, lessonId } = req.body

    if (!courseId || !lessonId) {
      return res
        .status(400)
        .json({ success: false, message: 'Course ID and Lesson ID required' })
    }

    await courseService.updateProgress(userId, courseId, lessonId)
    res.json({ success: true, message: 'Progress updated' })
  })

  static createCourse = asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { title, description, difficulty, duration_minutes, price } = req.body

    const course = await courseService.createCourse({
      title,
      description,
      difficulty,
      instructor_id: userId,
      duration_minutes,
      price,
    })

    res.status(201).json({ success: true, data: course })
  })
}
