import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import { logActivity } from '../utils/activity.js';

const router = Router();

function signToken(admin) {
  return jwt.sign({ sub: admin.id, email: admin.email }, env.jwtSecret, { expiresIn: '7d' });
}

router.post('/setup-first-admin', async (req, res) => {
  const adminCount = await prisma.admin.count();
  if (adminCount > 0) {
    return res.status(400).json({ message: 'Initial admin already exists' });
  }

  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'fullName, email, and password are required' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.admin.create({
    data: { fullName, email: email.toLowerCase(), passwordHash, isSystemAdmin: true },
  });

  const token = signToken(admin);

  return res.status(201).json({
    token,
    admin: { id: admin.id, fullName: admin.fullName, email: admin.email, isSystemAdmin: admin.isSystemAdmin },
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const admin = await prisma.admin.findUnique({ where: { email: email.toLowerCase() } });

  if (!admin) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isValidPassword = await bcrypt.compare(password, admin.passwordHash);

  if (!isValidPassword) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  await logActivity({
    admin,
    action: 'LOGIN',
    entityType: 'AUTH',
    entityId: admin.id,
  });

  const token = signToken(admin);

  return res.json({
    token,
    admin: { id: admin.id, fullName: admin.fullName, email: admin.email, isSystemAdmin: admin.isSystemAdmin },
  });
});

router.get('/me', requireAuth, async (req, res) => {
  res.json({ admin: req.admin });
});

export default router;
