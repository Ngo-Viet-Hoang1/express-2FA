export interface IJwtPayload {
  id: number
  email?: string
  scope?: string
  iat?: number
  exp?: number
}
