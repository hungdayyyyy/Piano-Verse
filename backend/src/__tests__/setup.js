import { config } from 'dotenv'

config({ path: '.env.test' })

jest.setTimeout(10000)

// Mock MongoDB connection
jest.mock('mongoose', () => ({
  ...jest.requireActual('mongoose'),
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
}))

// Mock Redis connection
jest.mock('redis', () => ({
  createClient: jest.fn().mockReturnValue({
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  }),
}))
