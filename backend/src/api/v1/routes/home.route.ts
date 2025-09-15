import HomeController from '@/controllers/HomeController'
import express from 'express'

const router = express.Router()
const homeController = new HomeController()

router.get('/', homeController.index)

export default router
