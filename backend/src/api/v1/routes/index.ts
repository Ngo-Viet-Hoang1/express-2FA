import express from 'express'
import errorRoute from './error.route'
import homeRoute from './home.route'

const router = express.Router()

router.use('/', homeRoute)
router.use('/error', errorRoute)

export default router
