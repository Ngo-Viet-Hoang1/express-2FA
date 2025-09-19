import type { Request, Response } from 'express'
import { UserService } from '../services/UserService'
import { catchAsync } from '../utils/asyncHandler'
import type { RegisterInput } from '../validators/authValidator'

export default class AuthController {
  register = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body as RegisterInput

    const newUser = await UserService.createUser({ email, password })

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          emailVerified: newUser.emailVerified,
          createdAt: newUser.createdAt,
        },
      },
      message: 'User registered successfully',
    })
  })

  login = catchAsync(async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      success: true,
      data: { user: req.user },
      message: 'User logged in successfully',
    })
  })

  // authStatus = catchAsync(
  //   async (req: Request, res: Response): Promise<void> => {},
  // )

  // logout = catchAsync(async (req: Request, res: Response): Promise<void> => {})

  // setup2FA = catchAsync(
  //   async (req: Request, res: Response): Promise<void> => {},
  // )

  // verify2FA = catchAsync(
  //   async (req: Request, res: Response): Promise<void> => {},
  // )

  // reset2FA = catchAsync(
  //   async (req: Request, res: Response): Promise<void> => {},
  // )
}
