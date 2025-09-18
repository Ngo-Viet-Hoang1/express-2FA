import express from 'express'
import authRoute from './auth.route'
import errorRoute from './error.route'
import homeRoute from './home.route'

const router = express.Router()

router.use('/', homeRoute)
router.use('/auth', authRoute)
router.use('/error', errorRoute)

export default router
