import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: '未提供认证令牌' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      userId: number;
      username: string;
    };

    (req as any).user = {
      id: decoded.userId,
      username: decoded.username
    };

    next();
  } catch (error) {
    res.status(401).json({ error: '无效的认证令牌' });
  }
}; 