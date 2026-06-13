import request from 'supertest'
import app from '../app.js'

describe('App', () => {
  describe('GET /health', () => {
    it('should return 200 with health status', async () => {
      const response = await request(app).get('/health')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('status', 'ok')
      expect(response.body).toHaveProperty('timestamp')
    })
  })

  describe('Unknown routes', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/api/unknown-route')

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('success', false)
    })
  })
})
