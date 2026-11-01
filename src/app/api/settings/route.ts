import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: 1,
          siteTitle: 'Asian Cultural Diplomacy',
          siteTagline: 'Bridging Traditions, Inspiring Global Dialogue & Cultivating Harmony',
          aboutFounderBio: 'Founder & Director',
          aboutMission: 'Promoting authentic cross-border dialogue.',
          aboutVision: 'A world anchored in mutual cultural respect.',
          aboutObjectives: '[]',
          aboutAreasOfEngagement: '[]',
          aboutPhilosophy: 'Cultural diplomacy is an invitation to shared reflection.',
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      siteTitle,
      siteTagline,
      aboutFounderBio,
      aboutMission,
      aboutVision,
      aboutObjectives,
      aboutAreasOfEngagement,
      aboutPhilosophy,
      contactEmail,
      socialTwitter,
      socialLinkedin,
      socialYoutube,
      currentPassword,
      newPassword,
    } = body;

    // Optional password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 });
      }

      const adminUser = await prisma.adminUser.findUnique({
        where: { id: session.userId },
      });

      if (!adminUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const isCurrentValid = await bcrypt.compare(currentPassword, adminUser.passwordHash);
      if (!isCurrentValid) {
        return NextResponse.json({ error: 'Current password incorrect' }, { status: 400 });
      }

      if (newPassword.length < 8) {
        return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
      }

      const newHash = await bcrypt.hash(newPassword, 12);
      await prisma.adminUser.update({
        where: { id: session.userId },
        data: { passwordHash: newHash },
      });
    }

    const dataToUpdate: any = {};
    if (siteTitle !== undefined) dataToUpdate.siteTitle = siteTitle;
    if (siteTagline !== undefined) dataToUpdate.siteTagline = siteTagline;
    if (aboutFounderBio !== undefined) dataToUpdate.aboutFounderBio = aboutFounderBio;
    if (aboutMission !== undefined) dataToUpdate.aboutMission = aboutMission;
    if (aboutVision !== undefined) dataToUpdate.aboutVision = aboutVision;
    if (aboutObjectives !== undefined) dataToUpdate.aboutObjectives = typeof aboutObjectives === 'string' ? aboutObjectives : JSON.stringify(aboutObjectives);
    if (aboutAreasOfEngagement !== undefined) dataToUpdate.aboutAreasOfEngagement = typeof aboutAreasOfEngagement === 'string' ? aboutAreasOfEngagement : JSON.stringify(aboutAreasOfEngagement);
    if (aboutPhilosophy !== undefined) dataToUpdate.aboutPhilosophy = aboutPhilosophy;
    if (contactEmail !== undefined) dataToUpdate.contactEmail = contactEmail;
    if (socialTwitter !== undefined) dataToUpdate.socialTwitter = socialTwitter;
    if (socialLinkedin !== undefined) dataToUpdate.socialLinkedin = socialLinkedin;
    if (socialYoutube !== undefined) dataToUpdate.socialYoutube = socialYoutube;

    const settings = await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: dataToUpdate,
      create: {
        id: 1,
        ...dataToUpdate,
      },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
