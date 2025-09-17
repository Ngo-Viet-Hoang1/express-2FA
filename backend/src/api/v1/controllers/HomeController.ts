import type { Request, Response } from 'express'
import prisma from '../config/database'
import { catchAsync } from '../utils/asyncHandler'

export default class HomeController {
  index = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const users = await prisma.user.findMany()

    res.status(200).json({
      success: true,
      data: users,
      count: users.length,
    })
  })
}
