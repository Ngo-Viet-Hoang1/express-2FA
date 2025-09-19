import { getCorsMiddleware } from '@/config/corsConfig'
import logger from '@/config/logger'
import { getSessionConfig } from '@/config/sessionConfig'
import {
  globalErrorHandler,
  notFoundHandler,
  uncaughtExceptionHandler,
  unhandledRejectionHandler,
} from '@/middlewares/errorHandler'
import { requestIdMiddleware } from '@/middlewares/requestId'
import compression from 'compression'
import dotenv from 'dotenv'
import express from 'express'
import session from 'express-session'
import helmet from 'helmet'
import morgan from 'morgan'
import passport from './api/v1/config/passportLocal'
import path from 'path'
import { fileURLToPath } from 'url'
import routes from './api/v1/routes'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(requestIdMiddleware)
app.use(getCorsMiddleware())
app.use(helmet())
app.use(session(getSessionConfig()))
app.use(passport.initialize())
app.use(passport.session())
app.use(
  compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false
      }
      return compression.filter(req, res)
    },
  }),
)

// Logging and parsing middlewares
app.use(morgan('combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '..', 'public')))

app.use('/api/v1', routes)

// Apply error handling middlewares
// https://betterstack.com/community/guides/scaling-nodejs/error-handling-express/
app.use(notFoundHandler)
app.use(globalErrorHandler)

// Setup process error handlers
unhandledRejectionHandler()
uncaughtExceptionHandler()

app.listen(port, () => {
  logger.info(
    `2 Factor Authentication app listening at http://localhost:${port}`,
  )
})
