import HomeController from '@/controllers/HomeController'
import express from 'express'

const router = express.Router()
const homeController = new HomeController()

router.get('/', homeController.index)
router.get('/testmail', homeController.testMail)
router.get('/testmail-rabbitmq', homeController.testRabbitMQSendMail)

export default router
