import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import speakeasy from 'speakeasy'
import qrcode from 'qrcode'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import { AppDataSource } from '../ormconfig'
import { User } from '../models/User'
import { transporter } from '../config/nodemailer'
import { MoreThan } from 'typeorm'

const createUser = async (username: string, email: string, password: string) => {
  const hashedPassword = await bcrypt.hash(password, 10)
  const apikey = uuidv4()
  const userRepository = AppDataSource.getRepository(User)
  const user = userRepository.create({ username, email, password: hashedPassword, apikey })
  return await userRepository.save(user)
}

const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body
  try {
    const user = await createUser(username, email, password)
    res.json(user)
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body
  const userRepository = AppDataSource.getRepository(User)
  const user = await userRepository.findOne({ where: { email } })

  if (user && (await bcrypt.compare(password, user.password))) {
    if (user.twoFactorEnabled) {
      res.json({ auth: false, twoFactorRequired: true })
    } else {
      req.session.user = user
      res.json({ auth: true })
    }
  } else {
    res.status(401).json({ error: 'Invalid credentials' })
  }
}

const logout = async (req: Request, res: Response) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to logout' })
      }
      res.json({ success: true })
    })
  } catch (err: any) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
}

const getMe = async (req: Request, res: Response) => {
  const userRepository = AppDataSource.getRepository(User)
  const user = await userRepository.findOne({ where: { id: req.session.user?.id } })
  res.json({ user: user ?? null })
}

const enable2FA = async (req: Request, res: Response) => {
  const userId = req.session.user!.id
  try {
    const secret = speakeasy.generateSecret({ length: 20 })
    const url = speakeasy.otpauthURL({
      secret: secret.base32,
      label: `MyApp (${req.session.user!.email})`,
      issuer: 'MyApp'
    })

    const userRepository = AppDataSource.getRepository(User)
    await userRepository.update(userId, { twoFactorSecret: secret.base32 })

    qrcode.toDataURL(url, (err, dataUrl) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to generate QR code' })
      }
      res.json({ qrCodeUrl: dataUrl })
    })
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

const verify2FA = async (req: Request, res: Response) => {
  const userId = req.session.user!.id
  const { token } = req.body
  try {
    const userRepository = AppDataSource.getRepository(User)
    const user = await userRepository.findOne({ where: { id: userId } })
    if (user && user.twoFactorSecret) {
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token
      })

      if (verified) {
        await userRepository.update(userId, { twoFactorEnabled: true })
        res.json({ success: true })
      } else {
        res.status(400).json({ error: 'Invalid token' })
      }
    } else {
      res.status(404).json({ error: 'User not found or 2FA secret missing' })
    }
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

const disable2FA = async (req: Request, res: Response) => {
  const userId = req.session.user!.id
  try {
    const userRepository = AppDataSource.getRepository(User)
    await userRepository.update(userId, { twoFactorEnabled: false, twoFactorSecret: null })
    res.json({ success: true })
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body
  try {
    const userRepository = AppDataSource.getRepository(User)
    const user = await userRepository.findOne({ where: { email } })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const token = crypto.randomBytes(20).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

    await userRepository.update(user.id, {
      resetPasswordToken: token,
      resetPasswordExpires: resetTokenExpiry
    })

    const mailOptions = {
      to: email,
      from: process.env.EMAIL_USER,
      subject: 'Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
      Please click on the following link, or paste this into your browser to complete the process:\n\n
      http://${req.headers.host}/reset/${token}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`
    }

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to send email' })
      }
      res.json({ message: 'Email sent' })
    })
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body
  try {
    const userRepository = AppDataSource.getRepository(User)
    const user = await userRepository.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: MoreThan(new Date())
      }
    })

    if (!user) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await userRepository.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    })

    res.json({ message: 'Password has been reset' })
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

export {
  createUser,
  register,
  login,
  logout,
  getMe,
  enable2FA,
  verify2FA,
  disable2FA,
  requestPasswordReset,
  resetPassword
}
