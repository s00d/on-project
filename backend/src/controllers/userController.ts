import {Request, Response} from 'express';
import {User} from '../models';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import {Op} from "sequelize";
import {transporter} from "../../config/nodemailer";
import crypto from 'crypto';
import {v4 as uuidv4} from 'uuid';


const createUser = async (username:string, email: string, password: string) =>  {
  const hashedPassword = await bcrypt.hash(password, 10);
  const apikey = uuidv4();
  return await User.create({username, email, password: hashedPassword, apikey});
}


const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  try {
    res.json(createUser(username, email, password));
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });

  if (user && await bcrypt.compare(password, user.password)) {
    if (user.twoFactorEnabled) {
      const token = jwt.sign({ id: user.id, twoFactorRequired: true }, process.env.JWT_SECRET as string, { expiresIn: '5m' });
      req.session.user = user;
      res.json({ token, twoFactorRequired: true });
    } else {
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string);
      res.json({ token });
    }
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

const getMe = async (req: Request, res: Response) => {
  const user = await User.findByPk(req.session.user?.id);
  res.json({user: user ?? null});
};

const enable2FA = async (req: Request, res: Response) => {
  const userId = req.session.user!.id;
  try {
    const secret = speakeasy.generateSecret({ length: 20 });
    const url = speakeasy.otpauthURL({
      secret: secret.base32,
      label: `MyApp (${req.session.user!.email})`,
      issuer: 'MyApp',
    });

    await User.update({ twoFactorSecret: secret.base32 }, { where: { id: userId } });

    qrcode.toDataURL(url, (err, dataUrl) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to generate QR code' });
      }
      res.json({ qrCodeUrl: dataUrl });
    });
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const verify2FA = async (req: Request, res: Response) => {
  const userId = req.session.user!.id;
  const { token } = req.body;
  try {
    const user = await User.findByPk(userId);
    if (user && user.twoFactorSecret) {
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token,
      });

      if (verified) {
        await User.update({ twoFactorEnabled: true }, { where: { id: userId } });
        res.json({ success: true });
      } else {
        res.status(400).json({ error: 'Invalid token' });
      }
    } else {
      res.status(404).json({ error: 'User not found or 2FA secret missing' });
    }
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const disable2FA = async (req: Request, res: Response) => {
  const userId = req.session.user!.id;
  try {
    await User.update({ twoFactorEnabled: false, twoFactorSecret: null }, { where: { id: userId } });
    res.json({ success: true });
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};


const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    await User.update({ resetPasswordToken: token, resetPasswordExpires: resetTokenExpiry }, { where: { email } });

    const mailOptions = {
      to: email,
      from: process.env.EMAIL_USER,
      subject: 'Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
      Please click on the following link, or paste this into your browser to complete the process:\n\n
      http://${req.headers.host}/reset/${token}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to send email' });
      }
      res.json({ message: 'Email sent' });
    });
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  try {
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          [Op.gt]: Date.now(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired' });
    }

    await user.update({ password: newPassword, resetPasswordToken: null, resetPasswordExpires: null });

    res.json({ message: 'Password has been reset' });
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

export { createUser, register, login, getMe, enable2FA, verify2FA, disable2FA, requestPasswordReset, resetPassword };
