import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';
import { createCrudRouter } from '../utils/createCrudRouter.js';
import { logActivity } from '../utils/activity.js';
import { slugify } from '../utils/slug.js';
import {
  isStrongPassword,
  isValidEmail,
  isValidUsPhone,
  normalizeEmail,
} from '../utils/validation.js';
import {
  defaultAwardSections,
  defaultCultureSections,
} from '../data/defaultSeedData.js';

const router = Router();

function parseDateInput(value, boundary = 'start') {
  if (value === undefined || value === null || String(value).trim() === '') return null;

  const raw = String(value).trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const hours = boundary === 'end' ? 23 : 0;
  const minutes = boundary === 'end' ? 59 : 0;
  const seconds = boundary === 'end' ? 59 : 0;
  const milliseconds = boundary === 'end' ? 999 : 0;

  const parsed = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds, milliseconds));
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed;
}

function toUtcDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function startOfUtcDay(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
}

function addUtcDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

const HOME_BLOCK_TYPES_REQUIRING_IMAGE = new Set(['hero', 'intro', 'featured', 'leadership']);

function normalizeHomeBlockType(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function normalizeAssetId(value) {
  return String(value || '').trim() || null;
}

function validateHomeBlockImageAsset(payload, existing = null) {
  const blockType = normalizeHomeBlockType(payload.type ?? existing?.type);
  if (!HOME_BLOCK_TYPES_REQUIRING_IMAGE.has(blockType)) {
    return null;
  }

  const imageAssetId =
    payload.imageAssetId !== undefined
      ? normalizeAssetId(payload.imageAssetId)
      : normalizeAssetId(existing?.imageAssetId);

  if (!imageAssetId) {
    return 'imageAssetId is required for this home block section';
  }

  return null;
}

function sanitizeAdmin(admin) {
  return {
    id: admin.id,
    fullName: admin.fullName,
    email: admin.email,
    isSystemAdmin: admin.isSystemAdmin,
    profileImageAssetId: admin.profileImageAssetId || null,
    profileImageAsset: admin.profileImageAsset || null,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
  };
}

function validatePropertyInput(payload) {
  const requiredFields = ['title', 'brandId', 'status', 'shortDescription', 'addressLine1', 'city', 'state', 'zipCode'];

  for (const field of requiredFields) {
    if (!payload[field] || String(payload[field]).trim() === '') {
      return `${field} is required`;
    }
  }

  if (!['UNDER_CONSTRUCTION', 'COMPLETED'].includes(payload.status)) {
    return 'status must be UNDER_CONSTRUCTION or COMPLETED';
  }

  return null;
}

function registerContentPageSectionRoutes({ path, pageKey, entityType }) {
  router.get(path, async (req, res) => {
    let items = await prisma.contentPageSection.findMany({
      where: { pageKey },
      include: { imageAsset: true },
      orderBy: { sortOrder: 'asc' },
    });

    if (items.length === 0) {
      const seedMap = {
        CULTURE: defaultCultureSections,
        AWARDS: defaultAwardSections,
      };
      const defaults = seedMap[pageKey] || [];

      if (defaults.length > 0) {
        await prisma.contentPageSection.createMany({
          data: defaults.map((item, index) => ({
            pageKey,
            title: item.title,
            body: item.body,
            icon: item.icon || null,
            imageAssetId: item.imageAssetId || null,
            isVisible: item.isVisible ?? true,
            sortOrder: Number(item.sortOrder ?? index + 1),
          })),
        });

        items = await prisma.contentPageSection.findMany({
          where: { pageKey },
          include: { imageAsset: true },
          orderBy: { sortOrder: 'asc' },
        });
      }
    }
    res.json(items);
  });

  router.post(path, async (req, res) => {
    const payload = {
      title: String(req.body.title || '').trim(),
      body: String(req.body.body || '').trim(),
      icon: req.body.icon ? String(req.body.icon).trim() : null,
      imageAssetId: req.body.imageAssetId ? String(req.body.imageAssetId) : null,
      sortOrder: Number(req.body.sortOrder || 0),
      isVisible: req.body.isVisible ?? true,
      pageKey,
    };

    if (!payload.title || !payload.body) {
      return res.status(400).json({ message: 'title and body are required' });
    }

    const created = await prisma.contentPageSection.create({
      data: payload,
      include: { imageAsset: true },
    });

    await logActivity({
      admin: req.admin,
      action: 'CREATE',
      entityType,
      entityId: created.id,
      afterJson: created,
    });

    return res.status(201).json(created);
  });

  router.put(`${path}/:id`, async (req, res) => {
    const existing = await prisma.contentPageSection.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.pageKey !== pageKey) {
      return res.status(404).json({ message: `${entityType} not found` });
    }

    const payload = {
      title: req.body.title !== undefined ? String(req.body.title || '').trim() : existing.title,
      body: req.body.body !== undefined ? String(req.body.body || '').trim() : existing.body,
      icon: req.body.icon !== undefined ? String(req.body.icon || '').trim() || null : existing.icon,
      imageAssetId: req.body.imageAssetId !== undefined ? String(req.body.imageAssetId || '') || null : existing.imageAssetId,
      sortOrder: req.body.sortOrder !== undefined ? Number(req.body.sortOrder) : existing.sortOrder,
      isVisible: req.body.isVisible !== undefined ? Boolean(req.body.isVisible) : existing.isVisible,
    };

    if (!payload.title || !payload.body) {
      return res.status(400).json({ message: 'title and body are required' });
    }

    const updated = await prisma.contentPageSection.update({
      where: { id: existing.id },
      data: payload,
      include: { imageAsset: true },
    });

    await logActivity({
      admin: req.admin,
      action: 'UPDATE',
      entityType,
      entityId: updated.id,
      beforeJson: existing,
      afterJson: updated,
    });

    return res.json(updated);
  });

  router.delete(`${path}/:id`, async (req, res) => {
    const existing = await prisma.contentPageSection.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.pageKey !== pageKey) {
      return res.status(404).json({ message: `${entityType} not found` });
    }

    await prisma.contentPageSection.delete({ where: { id: existing.id } });

    await logActivity({
      admin: req.admin,
      action: 'DELETE',
      entityType,
      entityId: existing.id,
      beforeJson: existing,
    });

    return res.json({ success: true });
  });
}

router.get('/dashboard', async (req, res) => {
  const { from, to } = req.query;
  const fromDate = parseDateInput(from, 'start');
  const toDate = parseDateInput(to, 'end');

  if ((from && !fromDate) || (to && !toDate)) {
    return res.status(400).json({ message: 'Invalid date range. Use YYYY-MM-DD format.' });
  }

  if (fromDate && toDate && fromDate.getTime() > toDate.getTime()) {
    return res.status(400).json({ message: 'Invalid date range. "From" cannot be after "To".' });
  }

  const where = {
    ...(fromDate || toDate
      ? {
          createdAt: {
            ...(fromDate ? { gte: fromDate } : {}),
            ...(toDate ? { lte: toDate } : {}),
          },
        }
      : {}),
  };

  const totalVisits = await prisma.viewEvent.count({ where });

  const uniqueVisitors = await prisma.viewEvent.findMany({
    where,
    select: { sessionId: true },
    distinct: ['sessionId'],
  });

  const topSections = await prisma.viewEvent.groupBy({
    by: ['sectionKey'],
    where: {
      ...where,
      sectionKey: { not: null },
    },
    _count: { sectionKey: true },
    orderBy: { _count: { sectionKey: 'desc' } },
    take: 10,
  });

  const topPropertiesRaw = await prisma.viewEvent.groupBy({
    by: ['portfolioPropertyId'],
    where: {
      ...where,
      portfolioPropertyId: { not: null },
    },
    _count: { portfolioPropertyId: true },
    orderBy: { _count: { portfolioPropertyId: 'desc' } },
    take: 10,
  });

  const propertyIds = topPropertiesRaw.map((item) => item.portfolioPropertyId).filter(Boolean);
  const properties = await prisma.portfolioProperty.findMany({
    where: { id: { in: propertyIds } },
    select: { id: true, title: true },
  });

  const propertyMap = Object.fromEntries(properties.map((property) => [property.id, property.title]));

  const topProperties = topPropertiesRaw.map((entry) => ({
    propertyId: entry.portfolioPropertyId,
    title: propertyMap[entry.portfolioPropertyId] || 'Unknown Property',
    views: entry._count.portfolioPropertyId,
  }));

  const trendEvents = await prisma.viewEvent.findMany({
    where,
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  const trendMap = new Map();
  trendEvents.forEach((event) => {
    const key = toUtcDateKey(startOfUtcDay(new Date(event.createdAt)));
    trendMap.set(key, (trendMap.get(key) || 0) + 1);
  });

  const trendEnd = startOfUtcDay(toDate || new Date());
  const trendStart = startOfUtcDay(fromDate || addUtcDays(trendEnd, -13));
  const visitsTrend = [];

  for (
    let cursor = trendStart;
    cursor.getTime() <= trendEnd.getTime();
    cursor = addUtcDays(cursor, 1)
  ) {
    const key = toUtcDateKey(cursor);
    visitsTrend.push({
      date: key,
      views: trendMap.get(key) || 0,
    });
  }

  return res.json({
    totalVisits,
    uniqueVisitors: uniqueVisitors.length,
    topSections: topSections.map((item) => ({ sectionKey: item.sectionKey, views: item._count.sectionKey })),
    topProperties,
    visitsTrend,
  });
});

router.get('/activity-logs', async (req, res) => {
  const { adminId, action, entityType, from, to } = req.query;

  const logs = await prisma.activityLog.findMany({
    where: {
      ...(adminId ? { adminId: String(adminId) } : {}),
      ...(action ? { action: String(action) } : {}),
      ...(entityType ? { entityType: String(entityType) } : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(String(from)) } : {}),
              ...(to ? { lte: new Date(String(to)) } : {}),
            },
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 500,
  });

  return res.json(logs);
});

router.get('/admins', async (req, res) => {
  const admins = await prisma.admin.findMany({
    include: { profileImageAsset: true },
    orderBy: { createdAt: 'asc' },
  });
  res.json(admins.map(sanitizeAdmin));
});

router.post('/admins', async (req, res) => {
  const fullName = String(req.body.fullName || '').trim();
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'fullName, email, and password are required' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address' });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({ message: 'Password must be 8+ characters and include letters and numbers' });
  }

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    return res.status(400).json({ message: 'Admin email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.admin.create({
    data: {
      fullName,
      email,
      passwordHash,
      isSystemAdmin: false,
    },
    include: { profileImageAsset: true },
  });

  await logActivity({
    admin: req.admin,
    action: 'CREATE',
    entityType: 'ADMIN',
    entityId: admin.id,
    afterJson: sanitizeAdmin(admin),
  });

  return res.status(201).json(sanitizeAdmin(admin));
});

router.delete('/admins/:id', async (req, res) => {
  const targetAdminId = req.params.id;

  if (targetAdminId === req.admin.id) {
    return res.status(400).json({ message: 'You cannot remove yourself' });
  }

  const target = await prisma.admin.findUnique({ where: { id: targetAdminId } });

  if (!target) {
    return res.status(404).json({ message: 'Admin not found' });
  }

  if (target.isSystemAdmin) {
    return res.status(400).json({ message: 'System admin cannot be removed' });
  }

  await prisma.admin.delete({ where: { id: targetAdminId } });

  await logActivity({
    admin: req.admin,
    action: 'DELETE',
    entityType: 'ADMIN',
    entityId: targetAdminId,
    beforeJson: sanitizeAdmin(target),
  });

  return res.json({ success: true });
});

router.get('/profile', async (req, res) => {
  const admin = await prisma.admin.findUnique({
    where: { id: req.admin.id },
    include: { profileImageAsset: true },
  });

  if (!admin) {
    return res.status(404).json({ message: 'Admin not found' });
  }

  return res.json(sanitizeAdmin(admin));
});

router.put('/profile', async (req, res) => {
  const existing = await prisma.admin.findUnique({
    where: { id: req.admin.id },
    include: { profileImageAsset: true },
  });

  if (!existing) {
    return res.status(404).json({ message: 'Admin not found' });
  }

  const fullName =
    req.body.fullName !== undefined
      ? String(req.body.fullName || '').trim()
      : existing.fullName;
  const profileImageAssetId =
    req.body.profileImageAssetId !== undefined
      ? String(req.body.profileImageAssetId || '').trim() || null
      : existing.profileImageAssetId;

  if (!fullName) {
    return res.status(400).json({ message: 'fullName is required' });
  }

  if (req.body.email !== undefined) {
    const requestedEmail = normalizeEmail(req.body.email);
    if (requestedEmail !== existing.email) {
      return res.status(400).json({ message: 'Email cannot be updated from profile settings' });
    }
  }

  const updated = await prisma.admin.update({
    where: { id: existing.id },
    data: { fullName, profileImageAssetId },
    include: { profileImageAsset: true },
  });

  await logActivity({
    admin: req.admin,
    action: 'UPDATE',
    entityType: 'ADMIN_PROFILE',
    entityId: updated.id,
    beforeJson: sanitizeAdmin(existing),
    afterJson: sanitizeAdmin(updated),
  });

  return res.json(sanitizeAdmin(updated));
});

router.put('/profile/password', async (req, res) => {
  const currentPassword = String(req.body.currentPassword || '');
  const newPassword = String(req.body.newPassword || '');
  const confirmPassword = String(req.body.confirmPassword || '');

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: 'currentPassword, newPassword, and confirmPassword are required' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'New password and confirm password must match' });
  }

  if (!isStrongPassword(newPassword)) {
    return res.status(400).json({ message: 'Password must be 8+ characters and include letters and numbers' });
  }

  const admin = await prisma.admin.findUnique({ where: { id: req.admin.id } });
  if (!admin) {
    return res.status(404).json({ message: 'Admin not found' });
  }

  const passwordMatches = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!passwordMatches) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }

  if (await bcrypt.compare(newPassword, admin.passwordHash)) {
    return res.status(400).json({ message: 'New password must be different from current password' });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.admin.update({
    where: { id: admin.id },
    data: { passwordHash },
  });

  await logActivity({
    admin: req.admin,
    action: 'UPDATE',
    entityType: 'ADMIN_PASSWORD',
    entityId: admin.id,
  });

  return res.json({ success: true });
});

router.get('/site-settings', async (req, res) => {
  const setting = await prisma.siteSetting.findUnique({ where: { id: 'main' }, include: { logoAsset: true } });
  return res.json(setting);
});

router.put('/site-settings', async (req, res) => {
  const existing = await prisma.siteSetting.findUnique({ where: { id: 'main' } });

  const updated = await prisma.siteSetting.upsert({
    where: { id: 'main' },
    update: {
      brandName: req.body.brandName,
      logoAssetId: req.body.logoAssetId || null,
      footerTagline: req.body.footerTagline || null,
    },
    create: {
      id: 'main',
      brandName: req.body.brandName,
      logoAssetId: req.body.logoAssetId || null,
      footerTagline: req.body.footerTagline || null,
    },
    include: { logoAsset: true },
  });

  await logActivity({
    admin: req.admin,
    action: existing ? 'UPDATE' : 'CREATE',
    entityType: 'SITE_SETTING',
    entityId: updated.id,
    beforeJson: existing,
    afterJson: updated,
  });

  return res.json(updated);
});

router.get('/contact-info', async (req, res) => {
  const contact = await prisma.contactInfo.findFirst({ orderBy: { createdAt: 'asc' } });
  res.json(contact);
});

router.put('/contact-info', async (req, res) => {
  const existing = await prisma.contactInfo.findFirst({ orderBy: { createdAt: 'asc' } });

  const data = {
    heading: req.body.heading,
    introText: req.body.introText,
    address: req.body.address,
    investmentEmail: req.body.investmentEmail || null,
    investmentPhone: req.body.investmentPhone || null,
    generalEmail: req.body.generalEmail,
    generalPhone: req.body.generalPhone,
  };

  if (!data.heading || !data.address || !data.generalEmail || !data.generalPhone) {
    return res.status(400).json({ message: 'heading, address, generalEmail, and generalPhone are required' });
  }

  if (!isValidEmail(data.generalEmail)) {
    return res.status(400).json({ message: 'Please enter a valid general email address' });
  }

  if (!isValidUsPhone(data.generalPhone)) {
    return res.status(400).json({ message: 'Please enter a valid general phone number' });
  }

  if (data.investmentEmail && !isValidEmail(data.investmentEmail)) {
    return res.status(400).json({ message: 'Please enter a valid investment email address' });
  }

  if (data.investmentPhone && !isValidUsPhone(data.investmentPhone)) {
    return res.status(400).json({ message: 'Please enter a valid investment phone number' });
  }

  const updated = existing
    ? await prisma.contactInfo.update({ where: { id: existing.id }, data })
    : await prisma.contactInfo.create({ data });

  await logActivity({
    admin: req.admin,
    action: existing ? 'UPDATE' : 'CREATE',
    entityType: 'CONTACT_INFO',
    entityId: updated.id,
    beforeJson: existing,
    afterJson: updated,
  });

  res.json(updated);
});

router.get('/contact-messages', async (req, res) => {
  const status = req.query.status ? String(req.query.status) : undefined;
  const allowedStatuses = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'ARCHIVED'];
  if (status && status !== 'ALL' && !allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status for contact message' });
  }
  const where = status && status !== 'ALL' ? { status } : undefined;

  const messages = await prisma.contactMessage.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return res.json(messages);
});

router.put('/contact-messages/:id', async (req, res) => {
  const existing = await prisma.contactMessage.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ message: 'Contact message not found' });
  }

  const nextStatus = req.body.status ? String(req.body.status).toUpperCase() : existing.status;
  const allowedStatuses = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'ARCHIVED'];
  if (!allowedStatuses.includes(nextStatus)) {
    return res.status(400).json({ message: 'Invalid status for contact message' });
  }

  const updated = await prisma.contactMessage.update({
    where: { id: existing.id },
    data: {
      status: nextStatus,
      adminNotes: req.body.adminNotes !== undefined ? String(req.body.adminNotes || '') || null : existing.adminNotes,
    },
  });

  await logActivity({
    admin: req.admin,
    action: 'UPDATE',
    entityType: 'CONTACT_MESSAGE',
    entityId: updated.id,
    beforeJson: existing,
    afterJson: updated,
  });

  return res.json(updated);
});

router.delete('/contact-messages/:id', async (req, res) => {
  const existing = await prisma.contactMessage.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ message: 'Contact message not found' });
  }

  await prisma.contactMessage.delete({ where: { id: existing.id } });

  await logActivity({
    admin: req.admin,
    action: 'DELETE',
    entityType: 'CONTACT_MESSAGE',
    entityId: existing.id,
    beforeJson: existing,
  });

  return res.json({ success: true });
});

router.get('/leads', async (req, res) => {
  const { isActive, source } = req.query;

  const leads = await prisma.lead.findMany({
    where: {
      ...(isActive === 'true' ? { isActive: true } : {}),
      ...(isActive === 'false' ? { isActive: false } : {}),
      ...(source ? { source: String(source) } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 1000,
  });

  return res.json(leads);
});

router.post('/leads', async (req, res) => {
  const fullName = String(req.body.fullName || '').trim();
  const email = normalizeEmail(req.body.email);
  const source = String(req.body.source || 'MANUAL').trim() || 'MANUAL';
  const notes = String(req.body.notes || '').trim();
  const isActive = req.body.isActive !== undefined ? Boolean(req.body.isActive) : true;

  if (!email) {
    return res.status(400).json({ message: 'email is required' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address' });
  }

  const existing = await prisma.lead.findUnique({ where: { email } });
  if (existing) {
    return res.status(400).json({ message: 'Lead with this email already exists' });
  }

  const created = await prisma.lead.create({
    data: {
      fullName: fullName || null,
      email,
      source,
      notes: notes || null,
      isActive,
    },
  });

  await logActivity({
    admin: req.admin,
    action: 'CREATE',
    entityType: 'LEAD',
    entityId: created.id,
    afterJson: created,
  });

  return res.status(201).json(created);
});

router.put('/leads/:id', async (req, res) => {
  const existing = await prisma.lead.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ message: 'Lead not found' });
  }

  const payload = {
    fullName: req.body.fullName !== undefined ? String(req.body.fullName || '').trim() || null : existing.fullName,
    email: req.body.email !== undefined ? normalizeEmail(req.body.email) : existing.email,
    source: req.body.source !== undefined ? String(req.body.source || '').trim() || null : existing.source,
    notes: req.body.notes !== undefined ? String(req.body.notes || '').trim() || null : existing.notes,
    isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : existing.isActive,
  };

  if (!payload.email) {
    return res.status(400).json({ message: 'email is required' });
  }

  if (!isValidEmail(payload.email)) {
    return res.status(400).json({ message: 'Please enter a valid email address' });
  }

  const duplicate = await prisma.lead.findFirst({
    where: {
      email: payload.email,
      id: { not: existing.id },
    },
    select: { id: true },
  });
  if (duplicate) {
    return res.status(400).json({ message: 'Lead with this email already exists' });
  }

  const updated = await prisma.lead.update({
    where: { id: existing.id },
    data: payload,
  });

  await logActivity({
    admin: req.admin,
    action: 'UPDATE',
    entityType: 'LEAD',
    entityId: updated.id,
    beforeJson: existing,
    afterJson: updated,
  });

  return res.json(updated);
});

router.delete('/leads/:id', async (req, res) => {
  const existing = await prisma.lead.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ message: 'Lead not found' });
  }

  await prisma.lead.delete({ where: { id: existing.id } });

  await logActivity({
    admin: req.admin,
    action: 'DELETE',
    entityType: 'LEAD',
    entityId: existing.id,
    beforeJson: existing,
  });

  return res.json({ success: true });
});

router.get('/career-opportunities', async (req, res) => {
  const opportunities = await prisma.jobOpportunity.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });
  return res.json(opportunities);
});

router.post('/career-opportunities', async (req, res) => {
  const payload = {
    title: String(req.body.title || '').trim(),
    department: String(req.body.department || '').trim() || null,
    employmentType: String(req.body.employmentType || '').trim() || null,
    locationCity: String(req.body.locationCity || '').trim() || null,
    locationState: String(req.body.locationState || '').trim() || null,
    description: String(req.body.description || '').trim(),
    isActive: req.body.isActive ?? true,
    sortOrder: Number(req.body.sortOrder || 0),
  };

  if (!payload.title || !payload.description) {
    return res.status(400).json({ message: 'title and description are required' });
  }

  const created = await prisma.jobOpportunity.create({ data: payload });

  await logActivity({
    admin: req.admin,
    action: 'CREATE',
    entityType: 'CAREER_OPPORTUNITY',
    entityId: created.id,
    afterJson: created,
  });

  return res.status(201).json(created);
});

router.put('/career-opportunities/:id', async (req, res) => {
  const existing = await prisma.jobOpportunity.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ message: 'Career opportunity not found' });
  }

  const payload = {
    title: req.body.title !== undefined ? String(req.body.title || '').trim() : existing.title,
    department:
      req.body.department !== undefined
        ? String(req.body.department || '').trim() || null
        : existing.department,
    employmentType:
      req.body.employmentType !== undefined
        ? String(req.body.employmentType || '').trim() || null
        : existing.employmentType,
    locationCity:
      req.body.locationCity !== undefined
        ? String(req.body.locationCity || '').trim() || null
        : existing.locationCity,
    locationState:
      req.body.locationState !== undefined
        ? String(req.body.locationState || '').trim() || null
        : existing.locationState,
    description:
      req.body.description !== undefined
        ? String(req.body.description || '').trim()
        : existing.description,
    isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : existing.isActive,
    sortOrder: req.body.sortOrder !== undefined ? Number(req.body.sortOrder) : existing.sortOrder,
  };

  if (!payload.title || !payload.description) {
    return res.status(400).json({ message: 'title and description are required' });
  }

  const updated = await prisma.jobOpportunity.update({
    where: { id: existing.id },
    data: payload,
  });

  await logActivity({
    admin: req.admin,
    action: 'UPDATE',
    entityType: 'CAREER_OPPORTUNITY',
    entityId: updated.id,
    beforeJson: existing,
    afterJson: updated,
  });

  return res.json(updated);
});

router.delete('/career-opportunities/:id', async (req, res) => {
  const existing = await prisma.jobOpportunity.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ message: 'Career opportunity not found' });
  }

  await prisma.jobOpportunity.delete({ where: { id: existing.id } });

  await logActivity({
    admin: req.admin,
    action: 'DELETE',
    entityType: 'CAREER_OPPORTUNITY',
    entityId: existing.id,
    beforeJson: existing,
  });

  return res.json({ success: true });
});

router.get('/career-applications', async (req, res) => {
  const status = req.query.status ? String(req.query.status) : undefined;
  const jobOpportunityId = req.query.jobOpportunityId ? String(req.query.jobOpportunityId) : undefined;
  const allowedStatuses = ['NEW', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'HIRED'];
  if (status && status !== 'ALL' && !allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status for career application' });
  }
  const where = {
    ...(status && status !== 'ALL' ? { status } : {}),
    ...(jobOpportunityId && jobOpportunityId !== 'ALL' ? { jobOpportunityId } : {}),
  };

  const applications = await prisma.careerApplication.findMany({
    where,
    include: {
      jobOpportunity: {
        select: {
          id: true,
          title: true,
          department: true,
          employmentType: true,
          locationCity: true,
          locationState: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return res.json(applications);
});

router.put('/career-applications/:id', async (req, res) => {
  const existing = await prisma.careerApplication.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ message: 'Career application not found' });
  }

  const nextStatus = req.body.status ? String(req.body.status).toUpperCase() : existing.status;
  const allowedStatuses = ['NEW', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'HIRED'];
  if (!allowedStatuses.includes(nextStatus)) {
    return res.status(400).json({ message: 'Invalid status for career application' });
  }

  const updated = await prisma.careerApplication.update({
    where: { id: existing.id },
    data: {
      status: nextStatus,
      adminNotes: req.body.adminNotes !== undefined ? String(req.body.adminNotes || '') || null : existing.adminNotes,
    },
  });

  await logActivity({
    admin: req.admin,
    action: 'UPDATE',
    entityType: 'CAREER_APPLICATION',
    entityId: updated.id,
    beforeJson: existing,
    afterJson: updated,
  });

  return res.json(updated);
});

router.delete('/career-applications/:id', async (req, res) => {
  const existing = await prisma.careerApplication.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ message: 'Career application not found' });
  }

  await prisma.careerApplication.delete({ where: { id: existing.id } });

  await logActivity({
    admin: req.admin,
    action: 'DELETE',
    entityType: 'CAREER_APPLICATION',
    entityId: existing.id,
    beforeJson: existing,
  });

  return res.json({ success: true });
});

router.get('/legal-documents', async (req, res) => {
  const docs = await prisma.legalDocument.findMany({ orderBy: { type: 'asc' } });
  res.json(docs);
});

router.put('/legal-documents/:type', async (req, res) => {
  const type = String(req.params.type).toUpperCase();
  if (!['PRIVACY', 'TERMS'].includes(type)) {
    return res.status(400).json({ message: 'Invalid legal document type' });
  }

  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: 'title and content are required' });
  }

  const existing = await prisma.legalDocument.findUnique({ where: { type } });
  const updated = await prisma.legalDocument.upsert({
    where: { type },
    update: { title, content },
    create: { type, title, content },
  });

  await logActivity({
    admin: req.admin,
    action: existing ? 'UPDATE' : 'CREATE',
    entityType: 'LEGAL_DOCUMENT',
    entityId: updated.id,
    beforeJson: existing,
    afterJson: updated,
  });

  return res.json(updated);
});

router.get('/portfolio-properties', async (req, res) => {
  const items = await prisma.portfolioProperty.findMany({
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

  res.json(items);
});

router.post('/portfolio-properties', async (req, res) => {
  const payload = {
    ...req.body,
    country: 'USA',
    slug: req.body.slug ? slugify(req.body.slug) : slugify(req.body.title || ''),
  };

  const error = validatePropertyInput(payload);
  if (error) {
    return res.status(400).json({ message: error });
  }

  if (!payload.slug) {
    return res.status(400).json({ message: 'slug is required' });
  }

  const created = await prisma.portfolioProperty.create({
    data: {
      title: payload.title,
      slug: payload.slug,
      brandId: payload.brandId,
      shortDescription: payload.shortDescription,
      fullDescription: payload.fullDescription || null,
      status: payload.status,
      isVisible: payload.isVisible ?? true,
      addressLine1: payload.addressLine1,
      addressLine2: payload.addressLine2 || null,
      city: payload.city,
      state: payload.state,
      zipCode: payload.zipCode,
      country: 'USA',
      keyInfo: payload.keyInfo || null,
      coverImageAssetId: payload.coverImageAssetId || null,
      sortOrder: Number(payload.sortOrder || 0),
    },
    include: {
      brand: true,
      coverImageAsset: true,
      images: { include: { asset: true } },
    },
  });

  await logActivity({
    admin: req.admin,
    action: 'CREATE',
    entityType: 'PORTFOLIO_PROPERTY',
    entityId: created.id,
    afterJson: created,
  });

  res.status(201).json(created);
});

router.put('/portfolio-properties/:id', async (req, res) => {
  const existing = await prisma.portfolioProperty.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ message: 'Property not found' });
  }

  const payload = {
    ...existing,
    ...req.body,
    country: 'USA',
    slug: req.body.slug ? slugify(req.body.slug) : existing.slug,
  };

  const error = validatePropertyInput(payload);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const updated = await prisma.portfolioProperty.update({
    where: { id: req.params.id },
    data: {
      title: payload.title,
      slug: payload.slug,
      brandId: payload.brandId,
      shortDescription: payload.shortDescription,
      fullDescription: payload.fullDescription || null,
      status: payload.status,
      isVisible: payload.isVisible ?? existing.isVisible,
      addressLine1: payload.addressLine1,
      addressLine2: payload.addressLine2 || null,
      city: payload.city,
      state: payload.state,
      zipCode: payload.zipCode,
      country: 'USA',
      keyInfo: payload.keyInfo || null,
      coverImageAssetId: payload.coverImageAssetId || null,
      sortOrder: Number(payload.sortOrder ?? existing.sortOrder),
    },
    include: {
      brand: true,
      coverImageAsset: true,
      images: { include: { asset: true }, orderBy: { sortOrder: 'asc' } },
    },
  });

  await logActivity({
    admin: req.admin,
    action: 'UPDATE',
    entityType: 'PORTFOLIO_PROPERTY',
    entityId: updated.id,
    beforeJson: existing,
    afterJson: updated,
  });

  res.json(updated);
});

router.delete('/portfolio-properties/:id', async (req, res) => {
  const existing = await prisma.portfolioProperty.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ message: 'Property not found' });
  }

  await prisma.portfolioProperty.delete({ where: { id: req.params.id } });

  await logActivity({
    admin: req.admin,
    action: 'DELETE',
    entityType: 'PORTFOLIO_PROPERTY',
    entityId: existing.id,
    beforeJson: existing,
  });

  res.json({ success: true });
});

router.post('/portfolio-properties/:id/images', async (req, res) => {
  const property = await prisma.portfolioProperty.findUnique({ where: { id: req.params.id } });
  if (!property) {
    return res.status(404).json({ message: 'Property not found' });
  }

  const { assetId, altText, sortOrder = 0, isCover = false } = req.body;

  if (!assetId) {
    return res.status(400).json({ message: 'assetId is required' });
  }

  const created = await prisma.propertyImage.create({
    data: {
      propertyId: property.id,
      assetId,
      altText: altText || null,
      sortOrder: Number(sortOrder),
      isCover: Boolean(isCover),
    },
    include: { asset: true },
  });

  if (isCover) {
    await prisma.propertyImage.updateMany({ where: { propertyId: property.id, id: { not: created.id } }, data: { isCover: false } });
    await prisma.portfolioProperty.update({ where: { id: property.id }, data: { coverImageAssetId: assetId } });
  }

  await logActivity({
    admin: req.admin,
    action: 'CREATE',
    entityType: 'PROPERTY_IMAGE',
    entityId: created.id,
    afterJson: created,
  });

  res.status(201).json(created);
});

router.put('/property-images/:id', async (req, res) => {
  const existing = await prisma.propertyImage.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ message: 'Property image not found' });
  }

  const updated = await prisma.propertyImage.update({
    where: { id: existing.id },
    data: {
      altText: req.body.altText ?? existing.altText,
      sortOrder: req.body.sortOrder !== undefined ? Number(req.body.sortOrder) : existing.sortOrder,
      isCover: req.body.isCover !== undefined ? Boolean(req.body.isCover) : existing.isCover,
    },
    include: { asset: true },
  });

  if (updated.isCover) {
    await prisma.propertyImage.updateMany({
      where: { propertyId: updated.propertyId, id: { not: updated.id } },
      data: { isCover: false },
    });

    await prisma.portfolioProperty.update({
      where: { id: updated.propertyId },
      data: { coverImageAssetId: updated.assetId },
    });
  }

  await logActivity({
    admin: req.admin,
    action: 'UPDATE',
    entityType: 'PROPERTY_IMAGE',
    entityId: updated.id,
    beforeJson: existing,
    afterJson: updated,
  });

  res.json(updated);
});

router.delete('/property-images/:id', async (req, res) => {
  const existing = await prisma.propertyImage.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ message: 'Property image not found' });
  }

  await prisma.propertyImage.delete({ where: { id: existing.id } });

  const cover = await prisma.propertyImage.findFirst({
    where: { propertyId: existing.propertyId, isCover: true },
  });

  if (!cover) {
    const nextImage = await prisma.propertyImage.findFirst({
      where: { propertyId: existing.propertyId },
      orderBy: { sortOrder: 'asc' },
    });

    await prisma.portfolioProperty.update({
      where: { id: existing.propertyId },
      data: { coverImageAssetId: nextImage?.assetId || null },
    });

    if (nextImage) {
      await prisma.propertyImage.update({ where: { id: nextImage.id }, data: { isCover: true } });
    }
  }

  await logActivity({
    admin: req.admin,
    action: 'DELETE',
    entityType: 'PROPERTY_IMAGE',
    entityId: existing.id,
    beforeJson: existing,
  });

  res.json({ success: true });
});

router.use('/home-blocks', createCrudRouter({
  model: 'homeBlock',
  entityType: 'HOME_BLOCK',
  include: { imageAsset: true },
  preprocessCreate: (payload) => ({
    ...payload,
    type: normalizeHomeBlockType(payload.type),
    imageAssetId: normalizeAssetId(payload.imageAssetId),
  }),
  preprocessUpdate: (payload) => ({
    ...payload,
    ...(payload.type !== undefined ? { type: normalizeHomeBlockType(payload.type) } : {}),
    ...(payload.imageAssetId !== undefined
      ? { imageAssetId: normalizeAssetId(payload.imageAssetId) }
      : {}),
  }),
  validateCreate: (payload) => validateHomeBlockImageAsset(payload),
  validateUpdate: (payload, existing) => validateHomeBlockImageAsset(payload, existing),
}));

router.use('/about-sections', createCrudRouter({
  model: 'aboutSection',
  entityType: 'ABOUT_SECTION',
  include: { imageAsset: true },
}));

router.use('/services', createCrudRouter({
  model: 'serviceItem',
  entityType: 'SERVICE_ITEM',
  include: { imageAsset: true },
}));

router.use('/team-members', createCrudRouter({
  model: 'teamMember',
  entityType: 'TEAM_MEMBER',
  include: { imageAsset: true },
}));

router.use('/hotel-brands', createCrudRouter({
  model: 'hotelBrand',
  entityType: 'HOTEL_BRAND',
  include: { logoAsset: true },
}));

router.use('/social-links', createCrudRouter({
  model: 'socialLink',
  entityType: 'SOCIAL_LINK',
}));

registerContentPageSectionRoutes({
  path: '/culture-sections',
  pageKey: 'CULTURE',
  entityType: 'CULTURE_SECTION',
});

registerContentPageSectionRoutes({
  path: '/award-sections',
  pageKey: 'AWARDS',
  entityType: 'AWARD_SECTION',
});

export default router;
