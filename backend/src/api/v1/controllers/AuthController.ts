import type { Request, Response } from 'express'
import { ErrorTypes } from '../models/AppError'
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

  authStatus = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      res.status(200).json({
        success: true,
        data: { user: req.user },
        message: 'User is authenticated',
      })
    },
  )

  logout = catchAsync(async (req: Request, res: Response): Promise<void> => {
    return new Promise((resolve, reject) => {
      req.logOut((err) => {
        if (err) {
          reject(ErrorTypes.INTERNAL_ERROR('Logout failed'))
        } else {
          req.session.destroy((destroyErr) => {
            if (destroyErr) {
              reject(ErrorTypes.INTERNAL_ERROR('Failed to destroy session'))
            } else {
              res.status(200).json({
                success: true,
                message: 'User logged out successfully',
              })
              resolve()
            }
          })
        }
      })
    })
  })

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
