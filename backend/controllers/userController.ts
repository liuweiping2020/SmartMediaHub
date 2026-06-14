import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: '邮箱和密码不能为空' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: '该邮箱已注册' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: '注册成功', userId: (user as any)._id.toString() });
  } catch (error) {
    res.status(500).json({ message: '注册失败', error: String(error) });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: '用户不存在' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '密码错误' });
    }
    const token = jwt.sign({ email, userId: (user as any)._id?.toString() || email }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token, email, userId: (user as any)._id?.toString() || email });
  } catch (error) {
    res.status(500).json({ message: '登录失败', error: String(error) });
  }
};
