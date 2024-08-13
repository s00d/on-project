import {
  Body,
  Controller,
  Post,
  Get,
  Route,
  Tags,
  Security,
  Request,
  Header,
  Middlewares
} from 'tsoa'
import bcrypt from 'bcrypt'
import speakeasy from 'speakeasy'
import qrcode from 'qrcode'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import { AppDataSource } from '../ormconfig'
import { User } from '../models/User'
import { transporter } from '../config/nodemailer'
import { MoreThan } from 'typeorm'
import { authenticateAll } from '../middlewares/authMiddleware'
import { isProjectCreator } from '../middlewares/roleMiddleware'

type UserDTO = Omit<
  User,
  | 'password'
  | 'twoFactorSecret'
  | 'resetPasswordToken'
  | 'resetPasswordExpires'
  | 'projects'
  | 'notifications'
  | 'comments'
  | 'tasks'
  | 'projectUsers'
  | 'history'
  | 'taskTemplates'
  | 'labels'
>

@Route('api/users')
@Tags('User')
@Security('session')
@Security('apiKey')
export class UserController extends Controller {
  @Post('register')
  public async register(
    @Body() body: { username: string; email: string; password: string }
  ): Promise<User> {
    const { username, email, password } = body
    const hashedPassword = await bcrypt.hash(password, 10)
    const apikey = uuidv4()
    const userRepository = AppDataSource.getRepository(User)
    const user = userRepository.create({ username, email, password: hashedPassword, apikey })
    return await userRepository.save(user)
  }

  @Post('login')
  public async login(
    @Body() body: { email: string; password: string },
    @Request() req: Express.Request
  ): Promise<{ auth: boolean; twoFactorRequired?: boolean }> {
    const { email, password } = body
    const userRepository = AppDataSource.getRepository(User)
    const user = await userRepository.findOne({ where: { email } })

    if (user && (await bcrypt.compare(password, user.password))) {
      if (user.twoFactorEnabled) {
        return { auth: false, twoFactorRequired: true }
      } else {
        req.session.user = user
        return { auth: true }
      }
    } else {
      this.setStatus(401)
      throw new Error('Invalid credentials')
    }
  }

  @Post('logout')
  public async logout(@Request() req: Express.Request): Promise<{ success: boolean }> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          this.setStatus(500)
          reject({ error: 'Failed to logout' })
        }
        resolve({ success: true })
      })
    })
  }

  @Get('me')
  @Middlewares([authenticateAll])
  public async getMe(@Request() req: Express.Request): Promise<{ user: UserDTO | null }> {
    const userRepository = AppDataSource.getRepository(User)
    if (!req.session.user) {
      return { user: null }
    }
    const user = await userRepository.findOne({ where: { id: req.session.user?.id } })
    return { user: user ?? null }
  }

  @Post('2fa/enable')
  @Middlewares([authenticateAll])
  public async enable2FA(@Request() req: Express.Request): Promise<{ qrCodeUrl: string }> {
    const userId = req.session.user!.id
    const secret = speakeasy.generateSecret({ length: 20 })
    const url = speakeasy.otpauthURL({
      secret: secret.base32,
      label: `MyApp (${req.session.user!.email})`,
      issuer: 'MyApp'
    })

    const userRepository = AppDataSource.getRepository(User)
    await userRepository.update(userId, { twoFactorSecret: secret.base32 })

    return new Promise((resolve, reject) => {
      qrcode.toDataURL(url, (err, dataUrl) => {
        if (err) {
          this.setStatus(500)
          reject({ error: 'Failed to generate QR code' })
        }
        resolve({ qrCodeUrl: dataUrl })
      })
    })
  }

  @Post('2fa/verify')
  @Middlewares([authenticateAll])
  public async verify2FA(
    @Body() body: { token: string },
    @Request() req: Express.Request
  ): Promise<{ success: boolean }> {
    const userId = req.session.user!.id
    const { token } = body
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
        return { success: true }
      } else {
        this.setStatus(400)
        throw new Error('Invalid token')
      }
    } else {
      this.setStatus(404)
      throw new Error('User not found or 2FA secret missing')
    }
  }

  @Post('2fa/disable')
  @Middlewares([authenticateAll])
  public async disable2FA(@Request() req: Express.Request): Promise<{ success: boolean }> {
    const userId = req.session.user!.id
    const userRepository = AppDataSource.getRepository(User)
    await userRepository.update(userId, { twoFactorEnabled: false, twoFactorSecret: null })
    return { success: true }
  }

  @Post('request-reset')
  @Middlewares([authenticateAll])
  public async requestPasswordReset(
    @Header() host: string,
    @Body() body: { email: string }
  ): Promise<{ message: string }> {
    const { email } = body
    const userRepository = AppDataSource.getRepository(User)
    const user = await userRepository.findOne({ where: { email } })
    if (!user) {
      this.setStatus(404)
      throw new Error('User not found')
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
      http://${host}/reset/${token}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`
    }

    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          this.setStatus(500)
          reject({ error: 'Failed to send email' })
        }
        resolve({ message: 'Email sent' })
      })
    })
  }

  @Post('reset-password')
  @Middlewares([authenticateAll])
  public async resetPassword(
    @Body() body: { token: string; newPassword: string }
  ): Promise<{ message: string }> {
    const { token, newPassword } = body
    const userRepository = AppDataSource.getRepository(User)
    const user = await userRepository.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: MoreThan(new Date())
      }
    })

    if (!user) {
      this.setStatus(400)
      throw new Error('Password reset token is invalid or has expired')
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await userRepository.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    })

    return { message: 'Password has been reset' }
  }
}

export const createUser = async (username: string, email: string, password: string) => {
  const hashedPassword = await bcrypt.hash(password, 10)
  const apikey = uuidv4()
  const userRepository = AppDataSource.getRepository(User)
  const user = userRepository.create({ username, email, password: hashedPassword, apikey })
  return await userRepository.save(user)
}
