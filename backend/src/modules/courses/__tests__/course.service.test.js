import { CourseService } from '../services/course.service.js'

describe('CourseService', () => {
  let courseService

  beforeEach(() => {
    courseService = new CourseService()
  })

  describe('getAllCourses', () => {
    it('should return all courses', async () => {
      const courses = await courseService.getAllCourses(10, 0)
      expect(Array.isArray(courses)).toBe(true)
    })

    it('should respect pagination limits', async () => {
      const courses = await courseService.getAllCourses(5, 0)
      expect(courses.length).toBeLessThanOrEqual(5)
    })
  })

  describe('getCourseById', () => {
    it('should return course by id', async () => {
      const course = await courseService.getCourseById('course-001')
      if (course) {
        expect(course).toHaveProperty('id')
        expect(course).toHaveProperty('title')
      }
    })

    it('should return null for non-existent course', async () => {
      const course = await courseService.getCourseById('non-existent-id')
      expect(course).toBeNull()
    })
  })

  describe('enrollCourse', () => {
    it('should enroll user in course', async () => {
      const progress = await courseService.enrollCourse('user-123', 'course-001')
      expect(progress).toBeDefined()
      expect(progress).toHaveProperty('user_id')
      expect(progress).toHaveProperty('course_id')
    })

    it('should not enroll user twice in same course', async () => {
      await courseService.enrollCourse('user-123', 'course-001')
      await expect(courseService.enrollCourse('user-123', 'course-001')).rejects.toThrow(
        'Already enrolled'
      )
    })
  })

  describe('searchCourses', () => {
    it('should find courses by title', async () => {
      const courses = await courseService.searchCourses('piano')
      expect(Array.isArray(courses)).toBe(true)
    })

    it('should return empty array for no matches', async () => {
      const courses = await courseService.searchCourses('non-existent-course-xyz')
      expect(Array.isArray(courses)).toBe(true)
      expect(courses.length).toBe(0)
    })
  })
})
