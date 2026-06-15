export class BaseRepository {
  constructor(model) {
    this.model = model
  }

  async create(data) {
    return this.model.create(data)
  }

  async findById(id) {
    return this.model.findById(id).lean()
  }

  async findAll(filters, skip, limit) {
    const query = this.model.find(filters || {})
    if (skip) query.skip(skip)
    if (limit) query.limit(limit)
    return query.lean()
  }

  async findOne(filter) {
    return this.model.findOne(filter).lean()
  }

  async update(id, data) {
    return this.model.findByIdAndUpdate(id, data, { new: true }).lean()
  }

  async delete(id) {
    const result = await this.model.findByIdAndDelete(id)
    return !!result
  }

  async softDelete(id) {
    return this.model.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true })
  }

  async count(filter) {
    return this.model.countDocuments(filter || {})
  }

  async exists(filter) {
    const result = await this.model.exists(filter)
    return !!result
  }

  async updateMany(filter, data) {
    const result = await this.model.updateMany(filter, data)
    return result.modifiedCount
  }

  async deleteMany(filter) {
    const result = await this.model.deleteMany(filter)
    return result.deletedCount
  }
}
