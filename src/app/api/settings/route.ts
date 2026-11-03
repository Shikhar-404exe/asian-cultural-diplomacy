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
          gmailNotificationsEnabled: true,
          gmailUser: process.env.ADMIN_EMAIL || 'founder@asianculturaldiplomacy.org',
          notifyOnNewComment: true,
          notifyOnNewReader: true,
          notifyOnNewEnquiry: true,
          notifyOnFlaggedComment: true,
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
      gmailNotificationsEnabled,
      notificationEmail,
      notifyOnNewComment,
      notifyOnNewReader,
      notifyOnContactEnquiry,
    } = body;

    // Optional password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 });
      }

      // Check User table first, then fallback to AdminUser
      let user = await prisma.user.findUnique({ where: { id: session.userId } });
      let adminUser = await prisma.adminUser.findUnique({ where: { id: session.userId } });

      const existingHash = user?.passwordHash || adminUser?.passwordHash;
      if (!existingHash) {
        return NextResponse.json({ error: 'User record not found' }, { status: 404 });
      }

      const isCurrentValid = await bcrypt.compare(currentPassword, existingHash);
      if (!isCurrentValid) {
        return NextResponse.json({ error: 'Current password incorrect' }, { status: 400 });
      }

      if (newPassword.length < 8) {
        return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
      }

      const newHash = await bcrypt.hash(newPassword, 12);
      
      if (user) {
        await prisma.user.update({
          where: { id: session.userId },
          data: { passwordHash: newHash },
        });
      }
      if (adminUser) {
        await prisma.adminUser.update({
          where: { id: session.userId },
          data: { passwordHash: newHash },
        });
      }
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
    if (gmailNotificationsEnabled !== undefined) dataToUpdate.gmailNotificationsEnabled = gmailNotificationsEnabled;
    if (notificationEmail !== undefined) dataToUpdate.gmailUser = notificationEmail;
    if (body.gmailUser !== undefined) dataToUpdate.gmailUser = body.gmailUser;
    if (notifyOnNewComment !== undefined) dataToUpdate.notifyOnNewComment = notifyOnNewComment;
    if (notifyOnNewReader !== undefined) dataToUpdate.notifyOnNewReader = notifyOnNewReader;
    if (notifyOnContactEnquiry !== undefined) dataToUpdate.notifyOnNewEnquiry = notifyOnContactEnquiry;
    if (body.notifyOnNewEnquiry !== undefined) dataToUpdate.notifyOnNewEnquiry = body.notifyOnNewEnquiry;
    if (body.notifyOnFlaggedComment !== undefined) dataToUpdate.notifyOnFlaggedComment = body.notifyOnFlaggedComment;

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
