import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import {
  defaultAboutSections,
  defaultBrands,
  defaultContactInfo,
  defaultHomeBlocks,
  defaultLegalDocuments,
  defaultCultureSections,
  defaultAwardSections,
  defaultServices,
  defaultSiteSetting,
  defaultSocialLinks,
  defaultTeamMembers,
} from '../server/src/data/defaultSeedData.js';

const prisma = new PrismaClient();

async function seedAdmins() {
  const count = await prisma.admin.count();
  if (count > 0) return;

  const fullName = process.env.SEED_ADMIN_FULL_NAME || 'System Admin';
  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@jsrhotels.com').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.admin.create({
    data: {
      fullName,
      email,
      passwordHash,
      isSystemAdmin: true,
    },
  });
}

async function seedSiteSettings() {
  await prisma.siteSetting.upsert({
    where: { id: 'main' },
    update: defaultSiteSetting,
    create: {
      id: 'main',
      ...defaultSiteSetting,
    },
  });
}

async function seedHomeBlocks() {
  const count = await prisma.homeBlock.count();
  if (count > 0) return;

  await prisma.homeBlock.createMany({ data: defaultHomeBlocks });
}

async function seedAboutSections() {
  const count = await prisma.aboutSection.count();
  if (count > 0) return;

  await prisma.aboutSection.createMany({ data: defaultAboutSections });
}

async function seedServices() {
  const count = await prisma.serviceItem.count();
  if (count > 0) return;

  await prisma.serviceItem.createMany({ data: defaultServices });
}

async function seedTeamMembers() {
  const count = await prisma.teamMember.count();
  if (count > 0) return;

  await prisma.teamMember.createMany({ data: defaultTeamMembers });
}

async function seedBrandsAndPortfolio() {
  const brandCount = await prisma.hotelBrand.count();
  if (brandCount === 0) {
    for (const [index, name] of defaultBrands.entries()) {
      await prisma.hotelBrand.create({
        data: {
          name,
          sortOrder: index + 1,
          isActive: true,
        },
      });
    }
  }

  const propertyCount = await prisma.portfolioProperty.count();
  if (propertyCount > 0) return;

  const brands = await prisma.hotelBrand.findMany({ orderBy: { sortOrder: 'asc' } });
  if (brands.length === 0) return;

  const samples = [
    {
      title: 'The Grand Suite',
      slug: 'the-grand-suite',
      shortDescription: 'Breathtaking city views with expansive living spaces and luxury amenities.',
      fullDescription: 'A premium property experience with concierge-level service and signature interiors.',
      status: 'UNDER_CONSTRUCTION',
      addressLine1: '1200 Sunset Blvd',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90026',
    },
    {
      title: 'Ocean View Retreat',
      slug: 'ocean-view-retreat',
      shortDescription: 'Wake up to the sound of waves in this serene, beautifully appointed setting.',
      fullDescription: 'A coastal flagship property designed around premium views and guest wellness.',
      status: 'COMPLETED',
      addressLine1: '88 Shoreline Drive',
      city: 'Miami',
      state: 'FL',
      zipCode: '33139',
    },
  ];

  for (const [index, sample] of samples.entries()) {
    const brand = brands[index % brands.length];
    await prisma.portfolioProperty.create({
      data: {
        ...sample,
        brandId: brand.id,
        country: 'USA',
        isVisible: true,
        sortOrder: index + 1,
      },
    });
  }
}

async function seedContact() {
  const existing = await prisma.contactInfo.findFirst();
  if (existing) return;

  await prisma.contactInfo.create({ data: defaultContactInfo });
}

async function seedSocialLinks() {
  const count = await prisma.socialLink.count();
  if (count > 0) return;

  await prisma.socialLink.createMany({ data: defaultSocialLinks });
}

async function seedJobOpportunities() {
  const count = await prisma.jobOpportunity.count();
  if (count > 0) return;

  await prisma.jobOpportunity.createMany({
    data: [
      {
        title: 'Front Desk Manager',
        department: 'Operations',
        employmentType: 'Full-time',
        locationCity: 'Los Angeles',
        locationState: 'CA',
        description:
          'Lead guest check-in operations, team scheduling, and service quality for a flagship property.',
        isActive: true,
        sortOrder: 1,
      },
      {
        title: 'Guest Relations Executive',
        department: 'Guest Experience',
        employmentType: 'Full-time',
        locationCity: 'Miami',
        locationState: 'FL',
        description:
          'Handle guest escalations, VIP requests, and service recovery to maintain premium experience standards.',
        isActive: true,
        sortOrder: 2,
      },
    ],
  });
}

async function seedLegalDocs() {
  for (const doc of defaultLegalDocuments) {
    await prisma.legalDocument.upsert({
      where: { type: doc.type },
      update: { title: doc.title, content: doc.content },
      create: doc,
    });
  }
}

async function seedContentPages() {
  const cultureCount = await prisma.contentPageSection.count({ where: { pageKey: 'CULTURE' } });
  if (cultureCount === 0) {
    await prisma.contentPageSection.createMany({
      data: defaultCultureSections.map((item) => ({ ...item, pageKey: 'CULTURE' })),
    });
  }

  const awardCount = await prisma.contentPageSection.count({ where: { pageKey: 'AWARDS' } });
  if (awardCount === 0) {
    await prisma.contentPageSection.createMany({
      data: defaultAwardSections.map((item) => ({ ...item, pageKey: 'AWARDS' })),
    });
  }
}

async function main() {
  await seedAdmins();
  await seedSiteSettings();
  await seedHomeBlocks();
  await seedAboutSections();
  await seedServices();
  await seedTeamMembers();
  await seedBrandsAndPortfolio();
  await seedContact();
  await seedSocialLinks();
  await seedJobOpportunities();
  await seedLegalDocs();
  await seedContentPages();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
