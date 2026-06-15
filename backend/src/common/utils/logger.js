import fs from 'fs'
import path from 'path'

const logsDir = path.join(process.cwd(), 'logs')

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

const getTimestamp = () => new Date().toISOString()

export class Logger {
  static log(message, data) {
    const log = `[${getTimestamp()}] INFO: ${message} ${data ? JSON.stringify(data) : ''}\n`
    console.log(log)
    Logger.writeToFile(log)
  }

  static error(message, error) {
    const log = `[${getTimestamp()}] ERROR: ${message} ${error ? JSON.stringify(error) : ''}\n`
    console.error(log)
    Logger.writeToFile(log, 'error')
  }

  static warn(message, data) {
    const log = `[${getTimestamp()}] WARN: ${message} ${data ? JSON.stringify(data) : ''}\n`
    console.warn(log)
    Logger.writeToFile(log)
  }

  static debug(message, data) {
    if (process.env.NODE_ENV === 'development') {
      const log = `[${getTimestamp()}] DEBUG: ${message} ${data ? JSON.stringify(data) : ''}\n`
      console.log(log)
      Logger.writeToFile(log)
    }
  }

  static writeToFile(message, type = 'info') {
    try {
      const fileName = `${type}.log`
      const filePath = path.join(logsDir, fileName)
      fs.appendFileSync(filePath, message)
    } catch (err) {
      console.error('Failed to write to log file:', err)
    }
  }
}
