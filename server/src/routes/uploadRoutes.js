import { Router } from 'express';
import fs from 'node:fs';
import multer from 'multer';
import { env } from '../config/env.js';
import { prisma } from '../db.js';
import { logActivity } from '../utils/activity.js';

const router = Router();

const uploadsDir = process.env.VERCEL ? '/tmp/uploads' : env.uploadsDir;

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename(req, file, cb) {
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image uploads are allowed'));
    }

    return cb(null, true);
  },
});

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const asset = await prisma.mediaAsset.create({
    data: {
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
    },
  });

  await logActivity({
    admin: req.admin,
    action: 'CREATE',
    entityType: 'MEDIA_ASSET',
    entityId: asset.id,
    afterJson: asset,
  });

  return res.status(201).json(asset);
});

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err?.message) {
    return res.status(400).json({ message: err.message });
  }

  return next(err);
});

export default router;
