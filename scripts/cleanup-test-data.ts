import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function cleanupAndSeed() {
  console.log('--- STARTING DATABASE CLEANUP & SEEDING ---');

  // 1. Purge test reader accounts
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { endsWith: '@culturaltest.org' } },
        { email: 'prajapatishikhar43@gmail.com' },
      ],
    },
  });
  console.log(`Purged test users: ${deletedUsers.count}`);

  // 2. Purge test contact inquiries
  const deletedEnquiries = await prisma.contactEnquiry.deleteMany({
    where: {
      OR: [
        { email: { endsWith: '@culturaldiplomacy.test' } },
        { email: { contains: 'culturaltest' } },
      ],
    },
  });
  console.log(`Purged test inquiries: ${deletedEnquiries.count}`);

  // 3. Purge test articles (and cascaded revisions & tags)
  const testArticles = await prisma.article.findMany({
    where: {
      OR: [
        { title: { contains: 'Diplomatic Synergy & Shared Heritage' } },
        { title: { contains: 'Cultural Bridges in Modern Diplomacy' } },
        { title: 'xefsEWGswtg' },
      ],
    },
    select: { id: true, title: true },
  });

  if (testArticles.length > 0) {
    const testIds = testArticles.map(a => a.id);
    await prisma.articleRevision.deleteMany({ where: { articleId: { in: testIds } } });
    await prisma.articleTag.deleteMany({ where: { articleId: { in: testIds } } });
    await prisma.comment.deleteMany({ where: { articleId: { in: testIds } } });
    const deletedArticles = await prisma.article.deleteMany({ where: { id: { in: testIds } } });
    console.log(`Purged test articles: ${deletedArticles.count}`);
  }

  // 4. Purge test audit logs
  const deletedLogs = await prisma.auditLog.deleteMany({
    where: {
      OR: [
        { actorEmail: { endsWith: '@culturaltest.org' } },
        { actorEmail: 'prajapatishikhar43@gmail.com' },
      ],
    },
  });
  console.log(`Purged test audit logs: ${deletedLogs.count}`);

  // 5. Ensure Founder Admin User exists and is configured
  const adminEmail = process.env.ADMIN_EMAIL || 'founder@asianculturaldiplomacy.org';
  const adminPassword = process.env.ADMIN_PASSWORD || 'CulturalDiplomacy2026!';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'ADMIN',
      name: 'Founder & Director',
      isEmailVerified: true,
      status: 'ACTIVE',
    },
    create: {
      email: adminEmail,
      name: 'Founder & Director',
      role: 'ADMIN',
      passwordHash,
      isEmailVerified: true,
      status: 'ACTIVE',
    },
  });
  console.log(`Verified Admin User: ${adminEmail}`);

  // 6. Ensure 5 Core Categories exist
  const categoriesData = [
    { name: 'Diplomatic Essays', slug: 'diplomatic-essays', description: 'Deep-dive explorations of intercultural relations, treaty traditions, and statecraft.', color: '#315C85' },
    { name: 'Art & Heritage', slug: 'art-and-heritage', description: 'Visual arts, traditional crafts, architectural preservation, and aesthetic philosophy.', color: '#7699B8' },
    { name: 'Regional Dialogues', slug: 'regional-dialogues', description: 'Conversations bridging East Asia, South Asia, Southeast Asia, and Central Asia.', color: '#142D4E' },
    { name: 'Cultural Policy', slug: 'cultural-policy', description: 'Institutional frameworks, cultural exchange programs, and diplomatic initiatives.', color: '#2D7F67' },
    { name: 'Perspectives & Reflections', slug: 'perspectives-and-reflections', description: 'Personal reflections, essays, and founder field notes from across Asia.', color: '#C84B31' },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categories[cat.slug] = record.id;
  }
  console.log('Verified 5 Core Categories.');

  // 7. Seed Authentic Baseline Articles
  const authenticArticles = [
    {
      title: 'The Architecture of Dialogue: Building Bridges Across Asian Civilisations',
      slug: 'architecture-of-dialogue-building-bridges',
      subtitle: 'How traditional symbols of connection—from arched moon bridges to tea pavilions—illuminate the path for modern diplomatic exchange.',
      coverImage: '/art/founder-sister-bridge.jpg',
      categoryId: categories['diplomatic-essays'],
      author: 'Founder & Director',
      isPublished: true,
      isFeatured: true,
      readingTime: 6,
      likesCount: 38,
      viewsCount: 245,
      publishedAt: new Date('2026-03-15T10:00:00Z'),
      content: `
        <p class="lead text-lg leading-relaxed text-brand-navy/90 font-serif mb-6">
          In traditional Asian landscape design, a bridge is never merely a conduit for transit. It is a contemplative transition—a deliberate pause between two shores where the traveller is invited to witness their reflection in the calm waters below.
        </p>
        <p class="mb-5 leading-relaxed text-slate-700">
          When we examine the diplomatic architecture of our contemporary era, we too often observe an insistence on rapid negotiation and transactional outcomes. Yet true cultural diplomacy requires the patient craftsmanship of the arched bridge: an elevation above turbulent currents, allowing both sides to meet at the highest point of mutual perspective.
        </p>
        <blockquote class="border-l-4 border-brand-blue pl-6 py-3 my-8 italic text-brand-navy font-serif text-xl bg-brand-powder/30 rounded-r-lg">
          "A bridge does not erase the water it spans; it honours the depth below while creating a sacred space for passage."
        </blockquote>
        <h3 class="font-serif text-2xl font-bold text-brand-navy mt-8 mb-4">Historical Precedents of Aesthetic Diplomacy</h3>
        <p class="mb-5 leading-relaxed text-slate-700">
          From the envoys of the Tang Dynasty bearing hand-painted scrolls across Central Asian oasis routes, to the delicate exchange of celadon ceramics between Korean and Japanese courts, Asian diplomatic history reveals that aesthetic respect has long preceded political accord. When sovereigns exchanged calligraphy, they were not merely exchanging gifts—they were offering their philosophical worldview for intimate reading.
        </p>
      `,
    },
    {
      title: 'Courtyards of Contemplation: Spatial Philosophy in Asian Diplomacy',
      slug: 'courtyards-of-contemplation-spatial-philosophy',
      subtitle: 'The architectural wisdom of traditional courtyards provides an enduring framework for bilateral restraint and dialogue.',
      coverImage: '/art/founder-sister-courtyard.jpg',
      categoryId: categories['art-and-heritage'],
      author: 'Founder & Director',
      isPublished: true,
      isFeatured: false,
      readingTime: 5,
      likesCount: 24,
      viewsCount: 180,
      publishedAt: new Date('2026-03-22T14:30:00Z'),
      content: `
        <p class="lead text-lg leading-relaxed text-brand-navy/90 font-serif mb-6">
          The Chinese siheyuan, the Japanese tsuboniwa, and the Indian aangan all share a fundamental insight: the most important space in any dwelling is the empty center that gathers the sky, the rain, and quiet family assembly.
        </p>
        <p class="mb-5 leading-relaxed text-slate-700">
          In contemporary geopolitical discourse, silence is frequently mistrusted as hesitation or weakness. Yet the spatial philosophy of the courtyard demonstrates that perimeter walls are only meaningful when they protect an inner sanctuary of open contemplation.
        </p>
        <h3 class="font-serif text-2xl font-bold text-brand-navy mt-8 mb-4">Restoring Sanctuary to Diplomatic Practice</h3>
        <p class="mb-5 leading-relaxed text-slate-700">
          When bilateral talks take place under the glare of continuous broadcast, the space for subtle concession disappears. Cultural diplomacy creates an intellectual courtyard—a sheltered perimeter within which scholars, artists, and diplomats may converse with candour and without performative posturing.
        </p>
      `,
    },
    {
      title: 'The Silk Road of Intangible Heritage: Weaving Collective Memory',
      slug: 'silk-road-intangible-heritage-weaving-collective-memory',
      subtitle: 'Why the preservation of living crafts, oral histories, and ritual arts offers the strongest shield against regional fragmentation.',
      coverImage: '/images/fuji-sakura.jpg',
      categoryId: categories['regional-dialogues'],
      author: 'Founder & Director',
      isPublished: true,
      isFeatured: false,
      readingTime: 7,
      likesCount: 42,
      viewsCount: 310,
      publishedAt: new Date('2026-04-05T08:15:00Z'),
      content: `
        <p class="lead text-lg leading-relaxed text-brand-navy/90 font-serif mb-6">
          While stone monuments commemorate historical empires, it is the living tapestry of intangible heritage—the dye-master's recipe, the sitar-maker's ear, the communal song of tea harvesters—that sustains the beating heart of Asian civilization across millennia.
        </p>
        <p class="mb-5 leading-relaxed text-slate-700">
          In our current moment of accelerated digitisation and geographic estrangement, the living arts offer a vital counterweight. They remind us that our borders were drawn across continuous rivers of cultural transmission.
        </p>
      `,
    },
  ];

  for (const art of authenticArticles) {
    await prisma.article.upsert({
      where: { slug: art.slug },
      update: art,
      create: art,
    });
  }
  console.log('Seeded 3 Authentic Baseline Articles.');

  // 8. Seed Authentic Symposia & Events
  const authenticEvents = [
    {
      title: 'Pan-Asian Cultural Diplomacy Symposium 2026',
      slug: 'pan-asian-cultural-diplomacy-symposium-2026',
      description: 'An international academic and practitioner conference uniting cultural delegates, historians, and youth diplomats from across Asia.',
      coverImage: '/images/fuji-sakura.jpg',
      startDate: new Date('2026-06-18T09:00:00Z'),
      endDate: new Date('2026-06-20T17:00:00Z'),
      venue: 'Kyoto International Conference Hall & Digital Stream',
      city: 'Kyoto',
      country: 'Japan',
      organizer: 'Asian Cultural Diplomacy Initiative',
      registrationLink: 'https://asianculturaldiplomacy.org/register/symposium-2026',
      status: 'UPCOMING',
      isFeatured: true,
      speakers: JSON.stringify([
        { name: 'Founder & Director', title: 'Chair & Lead Fellow' },
        { name: 'Prof. Somchai Prasert', title: 'Director of Southeast Asian Cultural Studies' },
        { name: 'Dr. Meera Nambiar', title: 'Senior Diplomatic Envoy on Heritage' },
      ]),
      agenda: JSON.stringify([
        { time: 'Day 1: 09:30', topic: 'Opening Keynote: Reimagining Asian Intercultural Bridges' },
        { time: 'Day 1: 14:00', topic: 'Panel: Traditional Artistry as Soft Power' },
        { time: 'Day 2: 10:00', topic: 'Roundtable: Heritage Conservation in Urban Centres' },
        { time: 'Day 3: 15:00', topic: 'Youth Diplomatic Declaration & Closing Reception' },
      ]),
    },
    {
      title: 'Roundtable on Traditional Arts & Contemporary Statecraft',
      slug: 'roundtable-traditional-arts-statecraft',
      description: 'An intimate closed-door and public salon exploring how traditional aesthetic principles inform peaceful conflict resolution and cultural diplomacy.',
      coverImage: '/art/founder-sister-courtyard.jpg',
      startDate: new Date('2026-07-05T14:00:00Z'),
      endDate: new Date('2026-07-05T18:00:00Z'),
      venue: 'National Museum of Asian Art, Pavilion Annex',
      city: 'Singapore',
      country: 'Singapore',
      organizer: 'Asian Cultural Diplomacy & Heritage Trust',
      registrationLink: 'https://asianculturaldiplomacy.org/register/roundtable-sg',
      status: 'UPCOMING',
      isFeatured: false,
      speakers: JSON.stringify([
        { name: 'Founder & Director', title: 'Keynote Speaker' },
        { name: 'Master Craftsman Lee Jin-Woo', title: 'UNESCO Living Treasure' },
      ]),
      agenda: JSON.stringify([
        { time: '14:00 - 15:30', topic: 'Living Craft and Cultural Diplomacy' },
        { time: '16:00 - 18:00', topic: 'Open Salon Discussion with Audience Q&A' },
      ]),
    },
    {
      title: 'Winter Salon: Asian Silk Routes & Shared Memory',
      slug: 'winter-salon-silk-routes-shared-memory',
      description: 'A completed commemorative evening celebrating literary and artistic transmissions along the historical land and maritime Silk Routes.',
      coverImage: '/art/founder-sister-bridge.jpg',
      startDate: new Date('2026-01-20T18:00:00Z'),
      endDate: new Date('2026-01-20T21:00:00Z'),
      venue: 'Central Heritage Library Gallery',
      city: 'Seoul',
      country: 'South Korea',
      organizer: 'Asian Cultural Diplomacy',
      status: 'COMPLETED',
      isFeatured: false,
      speakers: JSON.stringify([
        { name: 'Founder & Director', title: 'Host & Speaker' },
      ]),
    },
  ];

  for (const ev of authenticEvents) {
    await prisma.event.upsert({
      where: { slug: ev.slug },
      update: ev,
      create: ev,
    });
  }
  console.log('Seeded 3 Authentic Symposia & Events.');

  // 9. Seed Authentic Public Meetups
  const authenticMeetups = [
    {
      title: 'University Visit & Open Dialogue: Asian Cultural Exchange',
      slug: 'university-visit-kyoto-dialogue',
      description: 'The founder will be visiting the Faculty of International Studies for an informal afternoon gathering with students, researchers, and cultural enthusiasts.',
      date: new Date('2026-05-14T14:30:00Z'),
      timeWindow: '14:30 - 16:30 JST',
      venue: 'International Studies Common Room, Building B, Yoshida Campus',
      city: 'Kyoto, Japan',
      participationInstructions: 'Free admission. Open to students, faculty, and public visitors. Please arrive 10 minutes before the session begins.',
      rsvpLink: 'https://asianculturaldiplomacy.org/rsvp/kyoto-univ-2026',
      status: 'UPCOMING',
    },
    {
      title: 'Cultural Salon & Coffee: Perspectives on Heritage Preservation',
      slug: 'cultural-salon-coffee-tokyo',
      description: 'Join the founder for an open coffee and discussion following her keynote appearance at the National Heritage Forum.',
      date: new Date('2026-05-22T17:00:00Z'),
      timeWindow: '17:00 - 18:30 JST',
      venue: 'Sora Garden Café, 2F Terrace, Roppongi',
      city: 'Tokyo, Japan',
      participationInstructions: 'Casual open meetup. Capacity is limited to 25 participants. Please RSVP to ensure reserved seating.',
      rsvpLink: 'https://asianculturaldiplomacy.org/rsvp/tokyo-salon-may',
      status: 'UPCOMING',
    },
    {
      title: 'Academic Gathering: South & East Asian Literary Connections',
      slug: 'academic-gathering-bangkok',
      description: 'A morning coffee meetup with regional cultural observers and literary translators.',
      date: new Date('2026-02-10T10:00:00Z'),
      timeWindow: '10:00 - 12:00 ICT',
      venue: 'Chulalongkorn University Arts Center',
      city: 'Bangkok, Thailand',
      participationInstructions: 'Completed public meetup. Thank you to everyone who attended.',
      status: 'COMPLETED',
    },
  ];

  for (const m of authenticMeetups) {
    await prisma.meetup.upsert({
      where: { slug: m.slug },
      update: m,
      create: m,
    });
  }
  console.log('Seeded 3 Authentic Public Meetups.');

  // 10. Seed Media Items
  const mediaItems = [
    {
      originalName: 'founder-sister-bridge.jpg',
      fileName: 'founder-sister-bridge.jpg',
      fileUrl: '/art/founder-sister-bridge.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 46027,
    },
    {
      originalName: 'founder-sister-courtyard.jpg',
      fileName: 'founder-sister-courtyard.jpg',
      fileUrl: '/art/founder-sister-courtyard.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 79780,
    },
    {
      originalName: 'fuji-sakura.jpg',
      fileName: 'fuji-sakura.jpg',
      fileUrl: '/images/fuji-sakura.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 343735,
    },
  ];

  for (const media of mediaItems) {
    await prisma.mediaItem.upsert({
      where: { fileName: media.fileName },
      update: media,
      create: media,
    });
  }
  console.log('Verified 3 Authentic Media Items.');

  // 11. Final Verification Counts
  const counts = {
    users: await prisma.user.count(),
    articles: await prisma.article.count(),
    categories: await prisma.category.count(),
    events: await prisma.event.count(),
    meetups: await prisma.meetup.count(),
    mediaItems: await prisma.mediaItem.count(),
    enquiries: await prisma.contactEnquiry.count(),
  };

  console.log('--- CLEANUP AND RESTORATION COMPLETE ---');
  console.log('Final database counts:', counts);
}

cleanupAndSeed()
  .catch((e) => {
    console.error('Cleanup and seeding failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
