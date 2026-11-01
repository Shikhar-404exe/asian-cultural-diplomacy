const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Asian Cultural Diplomacy database...');

  // 1. Create or update Administrator
  const adminPassword = process.env.ADMIN_PASSWORD || 'CulturalDiplomacy2026!';
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const adminEmail = process.env.ADMIN_EMAIL || 'founder@asianculturaldiplomacy.org';

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash, name: 'Founder & Director' },
    create: {
      email: adminEmail,
      passwordHash,
      name: 'Founder & Director',
      role: 'FOUNDER',
    },
  });
  console.log(`Admin account seeded: ${admin.email}`);

  // 2. Seed Categories
  const categoriesData = [
    { name: 'Diplomatic Essays', slug: 'diplomatic-essays', description: 'Deep-dive explorations of intercultural relations, treaty traditions, and statecraft.', color: '#315C85' },
    { name: 'Art & Heritage', slug: 'art-and-heritage', description: 'Visual arts, traditional crafts, architectural preservation, and aesthetic philosophy.', color: '#7699B8' },
    { name: 'Regional Dialogues', slug: 'regional-dialogues', description: 'Conversations bridging East Asia, South Asia, Southeast Asia, and Central Asia.', color: '#142D4E' },
    { name: 'Cultural Policy', slug: 'cultural-policy', description: 'Institutional frameworks, cultural exchange programs, and diplomatic initiatives.', color: '#2D7F67' },
    { name: 'Perspectives & Reflections', slug: 'perspectives-and-reflections', description: 'Personal reflections, essays, and founder field notes from across Asia.', color: '#C84B31' },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categories[cat.slug] = record;
  }
  console.log('Categories seeded.');

  // 3. Seed Site Settings
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
  console.log('Site settings seeded.');

  // 4. Seed Articles
  const articlesData = [
    {
      title: 'The Architecture of Dialogue: Building Bridges Across Asian Civilisations',
      slug: 'architecture-of-dialogue-building-bridges',
      subtitle: 'How traditional symbols of connection—from arched moon bridges to tea pavilions—illuminate the path for modern diplomatic exchange.',
      coverImage: '/art/founder-sister-bridge.jpg',
      categoryId: categories['diplomatic-essays'].id,
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
          "Cultural diplomacy does not ask a society to surrender its identity. It asks that we extend lanterns of understanding across the waters of unfamiliarity."
        </blockquote>
        <h3 class="text-2xl font-serif font-semibold text-brand-navy mt-8 mb-4">The Symbolism of Lanterns and Illumination</h3>
        <p class="mb-5 leading-relaxed text-slate-700">
          In the watercolor artwork that accompanies this essay, glowing lanterns hang gently over the waterway. In both East and South Asian traditions, the lighting of a lantern symbolizes the dispersal of ignorance and the hospitable welcome of the guest. When applied to international relations, this posture transforms foreign policy from defensive posturing into respectful hospitality.
        </p>
        <h3 class="text-2xl font-serif font-semibold text-brand-navy mt-8 mb-4">Toward an Inter-Asian Cultural Renaissance</h3>
        <p class="mb-5 leading-relaxed text-slate-700">
          As we look across Asia—from the Silk Road oases of Central Asia through the river valleys of South Asia to the maritime straits of Southeast and East Asia—we discover thousands of years of shared motifs, philosophical cross-pollination, and artistic exchange. Reconnecting these historical veins is the paramount diplomatic mission of our century.
        </p>
      `,
    },
    {
      title: 'Courtyards of Contemplation: What Classical Asian Architecture Teaches Modern Statecraft',
      slug: 'courtyards-of-contemplation-classical-architecture',
      subtitle: 'Rediscovering balance, spatial harmony, and peaceful enclosure in Chinese, Japanese, and Korean architectural philosophies.',
      coverImage: '/art/founder-sister-courtyard.jpg',
      categoryId: categories['art-and-heritage'].id,
      author: 'Founder & Director',
      isPublished: true,
      isFeatured: true,
      readingTime: 5,
      likesCount: 29,
      viewsCount: 184,
      publishedAt: new Date('2026-03-28T14:30:00Z'),
      content: `
        <p class="lead text-lg leading-relaxed text-brand-navy/90 font-serif mb-6">
          The traditional Asian courtyard—whether the Chinese <em>Siheyuan</em>, the Korean <em>Madang</em>, or the Japanese <em>Tsuboniwa</em>—creates an internal sanctuary of balance amidst the commotion of the outside world.
        </p>
        <p class="mb-5 leading-relaxed text-slate-700">
          In classical garden design, every element has intentional resonance: scholar stones suggest timeless perseverance, flowing water represents adaptability, and blooming peonies symbolize noble flourishing. When diplomats gather in spaces inspired by such balance, conversations naturally slow to a rhythm conducive to enduring agreement.
        </p>
        <h3 class="text-2xl font-serif font-semibold text-brand-navy mt-8 mb-4">Harmony Over Imposition</h3>
        <p class="mb-5 leading-relaxed text-slate-700">
          Unlike monuments designed to overpower the landscape, traditional Asian architecture bows to nature. Roof eaves tilt upward like wings, echoing mountain ridgelines; unpainted woods weather with grace. Modern diplomatic discourse would benefit immensely from adopting this humility—seeking harmony with complex realities rather than attempting to impose rigid, uniform solutions.
        </p>
      `,
    },
    {
      title: 'Mount Fuji and the Transnational Language of Serenity',
      slug: 'mount-fuji-transnational-language-of-serenity',
      subtitle: 'How natural landmarks transcend political boundaries to inspire shared cultural reverence across generations.',
      coverImage: '/images/fuji-sakura.jpg',
      categoryId: categories['regional-dialogues'].id,
      author: 'Founder & Director',
      isPublished: true,
      isFeatured: false,
      readingTime: 4,
      likesCount: 22,
      viewsCount: 142,
      publishedAt: new Date('2026-04-10T09:15:00Z'),
      content: `
        <p class="lead text-lg leading-relaxed text-brand-navy/90 font-serif mb-6">
          Standing before Mount Fuji as cherry blossoms scatter on the spring breeze, one is struck by an overwhelming sense of timeless stillness. Nature possesses a diplomatic vocabulary that requires no translation.
        </p>
        <p class="mb-5 leading-relaxed text-slate-700">
          Across Asian poetic traditions, the mountain is the axis mundi—the steadfast pillar between heaven and earth. In an era marked by geopolitical friction and accelerating technological change, rediscovering our shared reverence for sacred natural landscapes offers a profound foundation for ecological and cultural cooperation.
        </p>
      `,
    },
    {
      title: 'Preserving Intangible Cultural Heritage in a Hyper-Digital Age',
      slug: 'preserving-intangible-cultural-heritage-digital-age',
      subtitle: 'Why master craftsmanship, oral storytelling, and ceremonial rituals matter more today than ever before.',
      coverImage: '/art/founder-sister-bridge.jpg',
      categoryId: categories['cultural-policy'].id,
      author: 'Founder & Director',
      isPublished: true,
      isFeatured: false,
      readingTime: 7,
      likesCount: 17,
      viewsCount: 110,
      publishedAt: new Date('2026-04-20T11:00:00Z'),
      content: `
        <p class="lead text-lg leading-relaxed text-brand-navy/90 font-serif mb-6">
          Digital archives can preserve photographs and 3D scans of ancient temples, but who preserves the touch of the woodcarver's chisel or the breath of the traditional flutist?
        </p>
        <p class="mb-5 leading-relaxed text-slate-700">
          Intangible heritage lives within human communities, passed through intimate, embodied apprenticeship. As AI and algorithmic curation expand, policy must actively protect living masters and cultural ecosystems that sustain human dignity and ancestral wisdom.
        </p>
      `,
    },
  ];

  for (const artData of articlesData) {
    const article = await prisma.article.upsert({
      where: { slug: artData.slug },
      update: artData,
      create: artData,
    });

    // Seed sample approved comments for public viewing
    if (artData.slug === 'architecture-of-dialogue-building-bridges') {
      await prisma.comment.createMany({
        data: [
          {
            articleId: article.id,
            authorName: 'Dr. Kenji Takahashi',
            authorEmail: 'kenji.takahashi@kyoto-u.ac.jp',
            content: 'A deeply moving reflection. The metaphor of the arched bridge perfectly captures what track-two diplomacy strives to accomplish in East Asia. I look forward to your upcoming public seminar.',
            status: 'APPROVED',
            likesCount: 5,
            createdAt: new Date('2026-03-16T14:20:00Z'),
          },
          {
            articleId: article.id,
            authorName: 'Ananya Sharma',
            authorEmail: 'ananya.sharma@delhiuni.edu',
            content: 'The comparison between water reflections and mutual perspectives is profound. In our Indian philosophical tradition, Pratibimba (reflection) holds similar depth. Wonderful work!',
            status: 'APPROVED',
            likesCount: 3,
            createdAt: new Date('2026-03-17T09:12:00Z'),
          },
          {
            articleId: article.id,
            authorName: 'Mark Chen',
            authorEmail: 'mchen.studies@gmail.com',
            content: 'Can you expand on how youth ambassadors can participate in your upcoming dialogues?',
            status: 'PENDING', // Pending in moderation queue!
            likesCount: 0,
            createdAt: new Date('2026-04-29T18:05:00Z'),
          },
        ],
      });
    }
  }
  console.log('Articles and comments seeded.');

  // 5. Seed Events
  const eventsData = [
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
        { name: 'Dr. Meera Nambiar', title: 'Senior Diplomatic Envoy on Heritage' }
      ]),
      agenda: JSON.stringify([
        { time: 'Day 1: 09:30', topic: 'Opening Keynote: Reimagining Asian Intercultural Bridges' },
        { time: 'Day 1: 14:00', topic: 'Panel: Traditional Artistry as Soft Power' },
        { time: 'Day 2: 10:00', topic: 'Roundtable: Heritage Conservation in Urban Centres' },
        { time: 'Day 3: 15:00', topic: 'Youth Diplomatic Declaration & Closing Reception' }
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
        { name: 'Master Craftsman Lee Jin-Woo', title: 'UNESCO Living Treasure' }
      ]),
      agenda: JSON.stringify([
        { time: '14:00 - 15:30', topic: 'Living Craft and Cultural Diplomacy' },
        { time: '16:00 - 18:00', topic: 'Open Salon Discussion with Audience Q&A' }
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
        { name: 'Founder & Director', title: 'Host & Speaker' }
      ]),
    },
  ];

  for (const ev of eventsData) {
    await prisma.event.upsert({
      where: { slug: ev.slug },
      update: ev,
      create: ev,
    });
  }
  console.log('Events seeded.');

  // 6. Seed Meetups (Founder's Public Appearances)
  const meetupsData = [
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

  for (const m of meetupsData) {
    await prisma.meetup.upsert({
      where: { slug: m.slug },
      update: m,
      create: m,
    });
  }
  console.log('Meetups seeded.');

  // 7. Seed Media Items
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
  console.log('Media items seeded.');

  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
