import { Router } from 'express';
import { prisma } from '../db.js';
import { logActivity } from './activity.js';

function sanitizePayload(payload) {
  const blocked = new Set(['id', 'createdAt', 'updatedAt']);
  return Object.fromEntries(Object.entries(payload).filter(([key]) => !blocked.has(key)));
}

export function createCrudRouter({
  model,
  entityType,
  include = undefined,
  orderBy = { sortOrder: 'asc' },
  preprocessCreate = (payload) => payload,
  preprocessUpdate = (payload) => payload,
  validateCreate = () => null,
  validateUpdate = () => null,
}) {
  const router = Router();

  router.get('/', async (req, res) => {
    const data = await prisma[model].findMany({ include, orderBy });
    res.json(data);
  });

  router.get('/:id', async (req, res) => {
    const item = await prisma[model].findUnique({ where: { id: req.params.id }, include });

    if (!item) {
      return res.status(404).json({ message: `${entityType} not found` });
    }

    return res.json(item);
  });

  router.post('/', async (req, res) => {
    const payload = sanitizePayload(req.body);
    const createValidationError = validateCreate(payload);
    if (createValidationError) {
      return res.status(400).json({ message: createValidationError });
    }

    const data = preprocessCreate(payload);
    const created = await prisma[model].create({ data, include });

    await logActivity({
      admin: req.admin,
      action: 'CREATE',
      entityType,
      entityId: created.id,
      afterJson: created,
    });

    res.status(201).json(created);
  });

  router.put('/:id', async (req, res) => {
    const existing = await prisma[model].findUnique({ where: { id: req.params.id } });

    if (!existing) {
      return res.status(404).json({ message: `${entityType} not found` });
    }

    const payload = sanitizePayload(req.body);
    const updateValidationError = validateUpdate(payload, existing);
    if (updateValidationError) {
      return res.status(400).json({ message: updateValidationError });
    }

    const data = preprocessUpdate(payload, existing);
    const updated = await prisma[model].update({
      where: { id: req.params.id },
      data,
      include,
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

  router.delete('/:id', async (req, res) => {
    const existing = await prisma[model].findUnique({ where: { id: req.params.id } });

    if (!existing) {
      return res.status(404).json({ message: `${entityType} not found` });
    }

    await prisma[model].delete({ where: { id: req.params.id } });

    await logActivity({
      admin: req.admin,
      action: 'DELETE',
      entityType,
      entityId: req.params.id,
      beforeJson: existing,
    });

    return res.json({ success: true });
  });

  return router;
}
