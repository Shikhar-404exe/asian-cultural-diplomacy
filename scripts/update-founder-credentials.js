const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateFounder() {
  const newEmail = 'shashwatiprajapati@gmail.com';
  const newPassword = 'CulturalShashwati@2026';
  const oldEmail = 'founder@asianculturaldiplomacy.org';

  console.log(`Updating founder account credentials to: ${newEmail}`);
  const passwordHash = await bcrypt.hash(newPassword, 12);

  // Check if old user exists
  const oldUser = await prisma.user.findUnique({
    where: { email: oldEmail },
  });

  let updatedUser;
  if (oldUser) {
    updatedUser = await prisma.user.update({
      where: { id: oldUser.id },
      data: {
        email: newEmail,
        passwordHash,
        role: 'ADMIN',
        name: 'Founder & Director',
        isEmailVerified: true,
        status: 'ACTIVE',
      },
    });
    console.log(`Updated existing user record from ${oldEmail} to ${newEmail}`);
  } else {
    updatedUser = await prisma.user.upsert({
      where: { email: newEmail },
      update: {
        passwordHash,
        role: 'ADMIN',
        name: 'Founder & Director',
        isEmailVerified: true,
        status: 'ACTIVE',
      },
      create: {
        email: newEmail,
        passwordHash,
        role: 'ADMIN',
        name: 'Founder & Director',
        isEmailVerified: true,
        status: 'ACTIVE',
      },
    });
    console.log(`Upserted user record for ${newEmail}`);
  }

  // Update AdminUser table for legacy compatibility
  await prisma.adminUser.deleteMany({
    where: { email: oldEmail },
  });

  await prisma.adminUser.upsert({
    where: { email: newEmail },
    update: {
      passwordHash,
      name: 'Founder & Director',
      role: 'FOUNDER',
    },
    create: {
      email: newEmail,
      passwordHash,
      name: 'Founder & Director',
      role: 'FOUNDER',
    },
  });
  console.log(`Verified AdminUser record for ${newEmail}`);

  // Also clean up any old email if it still lingers
  if (oldUser && oldUser.email !== newEmail) {
    await prisma.user.deleteMany({
      where: { email: oldEmail },
    });
  }

  console.log('--- CREDENTIALS UPDATE SUCCESSFUL ---');
  console.log({
    id: updatedUser.id,
    email: updatedUser.email,
    role: updatedUser.role,
    name: updatedUser.name,
    isEmailVerified: updatedUser.isEmailVerified,
    status: updatedUser.status,
  });
}

updateFounder()
  .catch((e) => {
    console.error('Failed to update founder credentials:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

