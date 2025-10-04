import { Request, Response, NextFunction } from 'express'

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error occurred:', error)

  let statusCode = 500
  let message = 'Internal server error'

  if (error.name === 'ValidationError') {
    statusCode = 400
    message = error.message
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401
    message = 'Unauthorized'
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403
    message = 'Forbidden'
  } else if (error.name === 'NotFoundError') {
    statusCode = 404
    message = 'Not found'
  }

  res.status(statusCode).json({
    error: message,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  })
}

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.path}`,
    timestamp: new Date().toISOString()
  })
}
