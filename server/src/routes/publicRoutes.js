import { Router } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import multer from 'multer';
import { prisma } from '../db.js';
import { env } from '../config/env.js';
import { getUsCities, getUsStates } from '../constants/usData.js';

const router = Router();

// Use /tmp on Vercel (read-only FS) or env.uploadsDir locally
const uploadsDir = process.env.VERCEL ? '/tmp/uploads' : env.uploadsDir;

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const resumeStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename(req, file, cb) {
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const resumeUpload = multer({
  storage: resumeStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const isAllowed =
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (!isAllowed) {
      return cb(new Error('Only PDF, DOC, and DOCX resumes are allowed'));
    }

    return cb(null, true);
  },
});

router.get('/site-settings', async (req, res) => {
  const data = await prisma.siteSetting.findUnique({
    where: { id: 'main' },
    include: { logoAsset: true },
  });

  res.json(data);
});

router.get('/home', async (req, res) => {
  const blocks = await prisma.homeBlock.findMany({
    where: { isVisible: true },
    include: { imageAsset: true },
    orderBy: { sortOrder: 'asc' },
  });

  res.json(blocks);
});

router.get('/about', async (req, res) => {
  const sections = await prisma.aboutSection.findMany({
    where: { isVisible: true },
    include: { imageAsset: true },
    orderBy: { sortOrder: 'asc' },
  });

  res.json(sections);
});

async function getContentPageSections(pageKey) {
  return prisma.contentPageSection.findMany({
    where: { pageKey, isVisible: true },
    include: { imageAsset: true },
    orderBy: { sortOrder: 'asc' },
  });
}

router.get('/culture', async (req, res) => {
  const sections = await getContentPageSections('CULTURE');
  res.json(sections);
});

router.get('/development', async (req, res) => {
  const sections = await getContentPageSections('DEVELOPMENT');
  res.json(sections);
});

router.get('/awards', async (req, res) => {
  const sections = await getContentPageSections('AWARDS');
  res.json(sections);
});

router.get('/team', async (req, res) => {
  const team = await prisma.teamMember.findMany({
    where: { isVisible: true },
    include: { imageAsset: true },
    orderBy: { sortOrder: 'asc' },
  });

  res.json(team);
});

router.get('/services', async (req, res) => {
  const services = await prisma.serviceItem.findMany({
    where: { isVisible: true },
    include: { imageAsset: true },
    orderBy: { sortOrder: 'asc' },
  });

  res.json(services);
});

router.get('/contact', async (req, res) => {
  const contact = await prisma.contactInfo.findFirst({ orderBy: { createdAt: 'asc' } });
  res.json(contact);
});

router.post('/contact-messages', async (req, res) => {
  const fullName = String(req.body.fullName || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const phone = String(req.body.phone || '').trim();
  const subject = String(req.body.subject || '').trim();
  const message = String(req.body.message || '').trim();

  if (!fullName || !email || !message) {
    return res.status(400).json({ message: 'fullName, email, and message are required' });
  }

  const created = await prisma.contactMessage.create({
    data: {
      fullName,
      email,
      phone: phone || null,
      subject: subject || null,
      message,
    },
  });

  return res.status(201).json({ success: true, id: created.id });
});

router.post('/careers/apply', resumeUpload.single('resume'), async (req, res) => {
  const fullName = String(req.body.fullName || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const phone = String(req.body.phone || '').trim();
  const position = String(req.body.position || '').trim();
  const city = String(req.body.city || '').trim();
  const state = String(req.body.state || '').trim();
  const coverLetter = String(req.body.coverLetter || '').trim();
  const experienceValue = String(req.body.experienceYears || '').trim();

  if (!fullName || !email || !phone || !position) {
    return res.status(400).json({ message: 'fullName, email, phone, and position are required' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Resume file is required' });
  }

  let experienceYears = null;
  if (experienceValue !== '') {
    const parsedExperience = Number(experienceValue);
    if (!Number.isFinite(parsedExperience) || parsedExperience < 0) {
      return res.status(400).json({ message: 'experienceYears must be a valid positive number' });
    }
    experienceYears = Math.floor(parsedExperience);
  }

  const created = await prisma.careerApplication.create({
    data: {
      fullName,
      email,
      phone,
      city: city || null,
      state: state || null,
      position,
      experienceYears,
      coverLetter: coverLetter || null,
      resumeOriginalName: req.file.originalname,
      resumeStoredName: req.file.filename,
      resumeMimeType: req.file.mimetype,
      resumeSize: req.file.size,
      resumeUrl: `/uploads/${req.file.filename}`,
    },
  });

  return res.status(201).json({ success: true, id: created.id });
});

router.get('/footer', async (req, res) => {
  const [siteSetting, socialLinks, contact] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { id: 'main' }, include: { logoAsset: true } }),
    prisma.socialLink.findMany({ where: { isVisible: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.contactInfo.findFirst({ orderBy: { createdAt: 'asc' } }),
  ]);

  res.json({ siteSetting, socialLinks, contact });
});

router.get('/legal/:type', async (req, res) => {
  const type = req.params.type.toUpperCase();

  if (!['PRIVACY', 'TERMS'].includes(type)) {
    return res.status(400).json({ message: 'Invalid legal document type' });
  }

  const doc = await prisma.legalDocument.findUnique({ where: { type } });

  if (!doc) {
    return res.status(404).json({ message: 'Document not found' });
  }

  return res.json(doc);
});

router.get('/brands', async (req, res) => {
  const brands = await prisma.hotelBrand.findMany({
    where: { isActive: true },
    include: { logoAsset: true },
    orderBy: { sortOrder: 'asc' },
  });

  res.json(brands);
});

router.get('/portfolio', async (req, res) => {
  const brandId = req.query.brandId || undefined;
  const status = req.query.status || undefined;

  const properties = await prisma.portfolioProperty.findMany({
    where: {
      isVisible: true,
      ...(brandId ? { brandId } : {}),
      ...(status && status !== 'ALL' ? { status } : {}),
    },
    include: {
      brand: true,
      coverImageAsset: true,
      images: {
        include: { asset: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });

  res.json(properties);
});

router.get('/portfolio/:slug', async (req, res) => {
  const property = await prisma.portfolioProperty.findUnique({
    where: { slug: req.params.slug },
    include: {
      brand: true,
      coverImageAsset: true,
      images: {
        include: { asset: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!property || !property.isVisible) {
    return res.status(404).json({ message: 'Property not found' });
  }

  return res.json(property);
});

router.post('/view-events', async (req, res) => {
  const { sessionId, path, sectionKey, portfolioPropertyId } = req.body;

  if (!sessionId || !path) {
    return res.status(400).json({ message: 'sessionId and path are required' });
  }

  const hash = req.headers['user-agent']
    ? crypto.createHash('sha256').update(String(req.headers['user-agent'])).digest('hex')
    : null;

  await prisma.viewEvent.create({
    data: {
      sessionId,
      path,
      sectionKey: sectionKey || null,
      portfolioPropertyId: portfolioPropertyId || null,
      userAgentHash: hash,
    },
  });

  return res.status(201).json({ success: true });
});

router.get('/us/states', async (req, res) => {
  res.json(getUsStates());
});

router.get('/us/cities', async (req, res) => {
  const state = typeof req.query.state === 'string' ? req.query.state : null;
  const cities = getUsCities(state);
  res.json(cities);
});

router.get('/address-search', async (req, res) => {
  const q = req.query.q;

  if (!q || typeof q !== 'string' || q.trim().length < 3) {
    return res.status(400).json({ message: 'Query must be at least 3 characters' });
  }

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('limit', '10');
  url.searchParams.set('countrycodes', 'us');
  url.searchParams.set('q', q);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'JSR-Hotel-CMS/1.0',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    return res.status(502).json({ message: 'Address service unavailable' });
  }

  const result = await response.json();
  return res.json(result);
});

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err?.message) {
    return res.status(400).json({ message: err.message });
  }

  return next(err);
});

export default router;
