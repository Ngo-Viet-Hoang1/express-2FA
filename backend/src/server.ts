import logger from '@/config/logger'
import {
  uncaughtExceptionHandler,
  unhandledRejectionHandler,
} from '@/middlewares/errorHandler'
import app from './app'

const port = process.env.PORT || 3000

// Setup process error handlers
unhandledRejectionHandler()
uncaughtExceptionHandler()

const server = app.listen(port, () => {
  logger.info(
    `2 Factor Authentication app listening at http://localhost:${port}`,
  )
})

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  server.close(() => {
    logger.info('Process terminated')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  server.close(() => {
    logger.info('Process terminated')
    process.exit(0)
  })
})

export default server
