import { Router } from 'express';
import multer from 'multer';
import { prisma } from '../db.js';
import { logActivity } from '../utils/activity.js';
import { uploadToCloudinary, isCloudinaryConfigured } from '../utils/cloudinaryUpload.js';

const router = Router();

// Use memory storage — files are uploaded directly to Cloudinary, not saved to disk
const upload = multer({
  storage: multer.memoryStorage(),
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

  let url;
  let storedName;

  if (isCloudinaryConfigured()) {
    // Production: upload to Cloudinary for persistent storage
    const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
    url = result.url;
    storedName = result.publicId;
  } else {
    // Local dev fallback: use base64 data URL (no disk required)
    const base64 = req.file.buffer.toString('base64');
    url = `data:${req.file.mimetype};base64,${base64}`;
    storedName = `local-${Date.now()}-${req.file.originalname}`;
  }

  const asset = await prisma.mediaAsset.create({
    data: {
      originalName: req.file.originalname,
      storedName,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url,
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
