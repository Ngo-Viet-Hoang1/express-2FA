import cors from 'cors'
import type { CorsOptions } from 'cors'

const getAllowedOrigins = (): string[] => {
  const corsOrigin = process.env.CORS_ORIGIN

  if (!corsOrigin) {
    return [
      'http://localhost:3000', // React default
      'http://localhost:3001', // Alternative React port
      'http://localhost:5173', // Vite default
      'http://localhost:5174', // Alternative Vite port
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
    ]
  }

  // If CORS_ORIGIN is '*', allow all origins (only for development)
  if (corsOrigin === '*') {
    return ['*']
  }

  // Parse comma-separated origins
  return corsOrigin.split(',').map((origin) => origin.trim())
}

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins()

    if (
      !origin ||
      allowedOrigins.includes('*') ||
      allowedOrigins.includes(origin)
    ) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS policy'), false)
  },

  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Request-ID',
    'X-API-Key',
  ],

  exposedHeaders: ['X-Request-ID', 'X-Total-Count'],
  credentials: true,
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204,
}

const developmentCorsOptions: CorsOptions = {
  ...corsOptions,
  origin: true, // Allow all origins in development
  credentials: true,
}

const productionCorsOptions: CorsOptions = {
  ...corsOptions,
}

export const getCorsMiddleware = (): ReturnType<typeof cors> => {
  const isProduction = process.env.NODE_ENV === 'production'

  if (isProduction) {
    return cors(productionCorsOptions)
  } else {
    return cors(developmentCorsOptions)
  }
}

export const strictCorsMiddleware = cors({
  ...corsOptions,
  origin: false, // No cross-origin requests allowed
  credentials: false,
})

export const publicCorsMiddleware = cors({
  ...corsOptions,
  origin: true, // Allow all origins
  credentials: false, // No credentials for public endpoints
})

export default getCorsMiddleware
