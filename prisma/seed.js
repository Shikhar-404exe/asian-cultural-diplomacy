const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Ensuring essential system configuration (Admin, Categories, Settings)...');

  // 1. Create or update Administrator
  const adminPassword = process.env.ADMIN_PASSWORD || 'CulturalDiplomacy2026!';
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const adminEmail = (process.env.ADMIN_EMAIL || 'founder@asianculturaldiplomacy.org').toLowerCase().trim();

  // Primary User table
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: 'Founder & Director', role: 'ADMIN', status: 'ACTIVE', isEmailVerified: true },
    create: {
      email: adminEmail,
      name: 'Founder & Director',
      role: 'ADMIN',
      passwordHash,
      isEmailVerified: true,
      status: 'ACTIVE',
    },
  });

  // Legacy AdminUser table
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash, name: 'Founder & Director' },
    create: {
      email: adminEmail,
      passwordHash,
      name: 'Founder & Director',
      role: 'FOUNDER',
    },
  });
  console.log(`Administrator account verified: ${adminEmail}`);

  // 2. Ensure Categories exist
  const categoriesData = [
    { name: 'Diplomatic Essays', slug: 'diplomatic-essays', description: 'Deep-dive explorations of intercultural relations, treaty traditions, and statecraft.', color: '#315C85' },
    { name: 'Art & Heritage', slug: 'art-and-heritage', description: 'Visual arts, traditional crafts, architectural preservation, and aesthetic philosophy.', color: '#7699B8' },
    { name: 'Regional Dialogues', slug: 'regional-dialogues', description: 'Conversations bridging East Asia, South Asia, Southeast Asia, and Central Asia.', color: '#142D4E' },
    { name: 'Cultural Policy', slug: 'cultural-policy', description: 'Institutional frameworks, cultural exchange programs, and diplomatic initiatives.', color: '#2D7F67' },
    { name: 'Perspectives & Reflections', slug: 'perspectives-and-reflections', description: 'Personal reflections, essays, and founder field notes from across Asia.', color: '#C84B31' },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, color: cat.color },
      create: cat,
    });
  }
  console.log('Categories verified.');

  // 3. Ensure Site Settings exist
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      siteTitle: 'Asian Cultural Diplomacy',
      siteTagline: 'Bridging Traditions, Inspiring Global Dialogue & Cultivating Harmony',
      aboutFounderBio: 'An international scholar and practitioner dedicated to fostering deeper mutual understanding across Asian civilizations. Her work bridges academic research, public diplomacy, and community engagement, emphasizing the quiet power of cultural exchange as a cornerstone of enduring peace.',
      aboutMission: 'To illuminate the profound cultural tapestries of Asia, promoting genuine cross-border empathy, scholarly dialogue, and grassroots cultural diplomacy across generations and geographies.',
      aboutVision: 'A world where regional diversity is celebrated as shared human heritage, and diplomatic relationships are anchored in mutual cultural respect rather than mere transactional interest.',
      aboutObjectives: JSON.stringify([
        'Publish rigorous, accessible essays on Asian cultural history, art, and contemporary diplomacy.',
        'Facilitate public meetups, academic salons, and cultural salons across key Asian cities.',
        'Support emerging scholars, traditional artisans, and cultural practitioners in sharing their voices globally.',
        'Bridge diverse sub-regions—from South and Central Asia to East and Southeast Asia—in respectful dialogue.'
      ]),
      aboutAreasOfEngagement: JSON.stringify([
        'Bilateral and Multilateral Cultural Dialogue',
        'Intangible Cultural Heritage Preservation',
        'Traditional Architecture and Environmental Philosophy',
        'Youth and Academic Cultural Exchange Programs'
      ]),
      aboutPhilosophy: 'Cultural diplomacy is not an instrument of dominance, but an invitation to shared reflection. Like a traditional arched bridge over reflective waters, it exists to connect two distinct shores without altering the beauty of either.',
      contactEmail: 'dialogue@asianculturaldiplomacy.org',
      socialTwitter: 'https://twitter.com/AsianCultDiplo',
      socialLinkedin: 'https://linkedin.com/company/asian-cultural-diplomacy',
      socialYoutube: 'https://youtube.com',
    },
  });
  console.log('Site settings verified.');

  console.log('System configuration ready. Zero mock articles, events, or meetups seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
