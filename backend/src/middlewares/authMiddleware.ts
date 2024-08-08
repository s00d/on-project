import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models'

const authenticateJWT = async (req: Request): Promise<any> => {
  const token = req.header('Authorization')?.split(' ')[1]

  if (token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET as string)
    } catch (err) {
      throw new Error('Invalid token')
    }
  }
  throw new Error('No token provided')
}

const authenticateSession = async (req: Request): Promise<any> => {
  console.log(11111, req.session)
  if (req.session && req.session.user) {
    return req.session.user
  }
  throw new Error('No session found')
}

const authenticateTokenInDB = async (req: Request): Promise<any> => {
  const apikey = req.header('Authorization')?.split(' ')[1]

  if (apikey) {
    try {
      const user = await User.findOne({ where: { apikey } })

      if (!user) {
        throw new Error('User not found in DB')
      }

      return user
    } catch (err) {
      throw new Error('Invalid token')
    }
  }
  throw new Error('No token provided')
}

const authenticateAll = async (req: Request, res: Response, next: NextFunction) => {

  const err = null
  try {
    req.session.user = await authenticateSession(req)
    return next()
  } catch (err) {
    // Ignore error and try next method
  }

  try {
    req.session.user = await authenticateJWT(req)
    return next()
  } catch (err) {
    // Ignore error and try next method
  }

  try {
    req.session.user = await authenticateTokenInDB(req)
    return next()
  } catch (err) {
    res.status(401).json({ error: 'Authentication failed' })
  }
}

export { authenticateAll }
