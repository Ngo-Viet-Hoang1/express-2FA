import ErrorController from '@/controllers/ErrorController'
import express from 'express'
import createError from 'http-errors'
import { ErrorTypes } from '../models/AppError'
import { catchAsync } from '../utils/asyncHandler'

const router = express.Router()
const errorController = new ErrorController()

router.get('/', errorController.index)
router.get('/http-error', errorController.httpError)

router.get('/http-error-501', (req, res, next) => {
  next(createError(417, 'I am a teapot'))
})

router.get(
  '/async-error',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  catchAsync(async (req, res, next) => {
    // Simulate async operation that fails with http-errors
    await new Promise((resolve, reject) => {
      setTimeout(
        () => reject(ErrorTypes.INTERNAL_ERROR('Async operation failed')),
        99,
      )
    })
  }),
)

router.get('/not-found-error', (req, res, next) => {
  next(ErrorTypes.NOT_FOUND('This is a not found error example'))
})

router.get('/error-types/validation', (req, res, next) => {
  next(ErrorTypes.VALIDATION_ERROR('Invalid email format'))
})

router.get('/error-types/unauthorized', (req, res, next) => {
  next(ErrorTypes.UNAUTHORIZED('Invalid credentials'))
})

router.get('/error-types/forbidden', (req, res, next) => {
  next(ErrorTypes.FORBIDDEN('Access denied to admin area'))
})

router.get('/error-types/conflict', (req, res, next) => {
  next(ErrorTypes.CONFLICT('Email already exists'))
})

router.get('/error-types/rate-limit', (req, res, next) => {
  next(ErrorTypes.TOO_MANY_REQUESTS('Too many login attempts'))
})

router.get('/error-types/custom', (req, res, next) => {
  next(ErrorTypes.CUSTOM(417, 'I am a teapot - custom status code'))
})

export default router
