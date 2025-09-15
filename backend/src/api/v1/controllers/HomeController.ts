import type { Request, Response } from 'express'

export default class HomeController {
  index(req: Request, res: Response): void {
    res.status(200).json({ message: 'Welcome to the API' })
  }
}
