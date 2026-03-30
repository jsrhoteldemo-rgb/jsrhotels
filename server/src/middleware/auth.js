import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../db.js';

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const admin = await prisma.admin.findUnique({ where: { id: payload.sub } });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid auth token' });
    }

    req.admin = {
      id: admin.id,
      fullName: admin.fullName,
      email: admin.email,
      isSystemAdmin: admin.isSystemAdmin,
    };

    next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}
