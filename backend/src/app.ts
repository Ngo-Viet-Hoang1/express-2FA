import { getCorsMiddleware } from '@/config/corsConfig'
import { globalErrorHandler, notFoundHandler } from '@/middlewares/errorHandler'
import limiter from '@/middlewares/rateLimiter'
import { requestIdMiddleware } from '@/middlewares/requestId'
import compression from 'compression'
import dotenv from 'dotenv'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import passport from 'passport'
import path from 'path'
import { fileURLToPath } from 'url'
import routes from './api/v1/routes'

import '@/config/passportGoogle'
import '@/config/passportJwt'
import '@/config/passportLocal'

dotenv.config()

const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Security and performance middlewares
app.use(limiter)
app.use(requestIdMiddleware)
app.use(getCorsMiddleware())
app.use(helmet())
// app.use(session(getSessionConfig()))
app.use(passport.initialize())
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

// View engine setup
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Routes
app.use('/api/v1', routes)

// Error handling middlewares
// https://betterstack.com/community/guides/scaling-nodejs/error-handling-express/
app.use(notFoundHandler)
app.use(globalErrorHandler)

export default app
