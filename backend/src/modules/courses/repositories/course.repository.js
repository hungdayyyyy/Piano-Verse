import { BaseRepository } from '../../../common/repositories/base.repository.js'
import CourseModel from '../models/course.model.js'

export class CourseRepository extends BaseRepository {
  constructor() {
    super(CourseModel)
  }

  async findByDifficulty(difficulty) {
    return this.model.find({ difficulty }).lean()
  }

  async findPopular(limit = 10) {
    return this.model
      .find()
      .sort({ enrollmentCount: -1 })
      .limit(limit)
      .lean()
  }

  async findWithLessons(courseId) {
    return this.model.findById(courseId).populate('lessons').lean()
  }

  async updateEnrollmentCount(courseId, increment = 1) {
    return this.model
      .findByIdAndUpdate(
        courseId,
        { $inc: { enrollmentCount: increment } },
        { new: true }
      )
      .lean()
  }

  async searchCourses(query) {
    return this.model
      .find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
        ],
      })
      .lean()
  }
}
