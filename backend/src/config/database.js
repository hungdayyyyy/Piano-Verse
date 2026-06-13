import mongoose from 'mongoose'
import { config } from './environment.js'

export const connectDatabase = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI, {
      retryWrites: true,
      w: 'majority',
    })
    console.log('✅ MongoDB connected successfully')
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    process.exit(1)
  }
}

export const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect()
    console.log('✅ MongoDB disconnected')
  } catch (error) {
    console.error('❌ MongoDB disconnection failed:', error)
  }
}

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB')
})

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err)
})

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB')
})
