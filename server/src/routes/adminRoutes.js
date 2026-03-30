import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';
import { createCrudRouter } from '../utils/createCrudRouter.js';
import { logActivity } from '../utils/activity.js';
import { slugify } from '../utils/slug.js';

const router = Router();

function sanitizeAdmin(admin) {
  return {
    id: admin.id,
    fullName: admin.fullName,
    email: admin.email,
    isSystemAdmin: admin.isSystemAdmin,
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

router.get('/dashboard', async (req, res) => {
  const { from, to } = req.query;
  const where = {
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(String(from)) } : {}),
            ...(to ? { lte: new Date(String(to)) } : {}),
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

  return res.json({
    totalVisits,
    uniqueVisitors: uniqueVisitors.length,
    topSections: topSections.map((item) => ({ sectionKey: item.sectionKey, views: item._count.sectionKey })),
    topProperties,
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
  const admins = await prisma.admin.findMany({ orderBy: { createdAt: 'asc' } });
  res.json(admins.map(sanitizeAdmin));
});

router.post('/admins', async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'fullName, email, and password are required' });
  }

  const existing = await prisma.admin.findUnique({ where: { email: String(email).toLowerCase() } });
  if (existing) {
    return res.status(400).json({ message: 'Admin email already exists' });
  }

  const passwordHash = await bcrypt.hash(String(password), 10);
  const admin = await prisma.admin.create({
    data: {
      fullName: String(fullName),
      email: String(email).toLowerCase(),
      passwordHash,
      isSystemAdmin: false,
    },
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

router.get('/career-applications', async (req, res) => {
  const status = req.query.status ? String(req.query.status) : undefined;
  const allowedStatuses = ['NEW', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'HIRED'];
  if (status && status !== 'ALL' && !allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status for career application' });
  }
  const where = status && status !== 'ALL' ? { status } : undefined;

  const applications = await prisma.careerApplication.findMany({
    where,
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

export default router;
