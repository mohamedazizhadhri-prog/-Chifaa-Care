import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyMessagesData() {
  console.log('\n=== MESSAGES DATA VERIFICATION ===\n');

  // 1. Check all users
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  });

  console.log('📋 ALL USERS IN DATABASE:');
  allUsers.forEach(user => {
    console.log(`  - ${user.name} (${user.email}) [${user.role}] ID: ${user.id}`);
  });
  console.log(`  Total: ${allUsers.length} users\n`);

  // 2. Check active doctors only
  const activeDoctors = await prisma.user.findMany({
    where: {
      role: 'DOCTOR',
      doctorProfile: {
        isNot: null
      }
    },
    include: {
      doctorProfile: true
    }
  });

  console.log('👨‍⚕️ ACTIVE DOCTORS:');
  activeDoctors.forEach(doctor => {
    console.log(`  - ${doctor.name} (${doctor.email})`);
    console.log(`    ID: ${doctor.id}`);
    console.log(`    Specialization: ${doctor.doctorProfile?.specialization || 'N/A'}`);
  });
  console.log(`  Total: ${activeDoctors.length} active doctors\n`);

  // 3. Check patients
  const patients = await prisma.user.findMany({
    where: {
      role: 'PATIENT',
      patient: {
        isNot: null
      }
    },
    include: {
      patient: true
    }
  });

  console.log('👤 PATIENTS:');
  patients.forEach(patient => {
    console.log(`  - ${patient.name} (${patient.email})`);
    console.log(`    ID: ${patient.id}`);
  });
  console.log(`  Total: ${patients.length} patients\n`);

  // 4. Check all messages
  const allMessages = await prisma.message.findMany({
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          role: true
        }
      },
      recipient: {
        select: {
          id: true,
          name: true,
          role: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 50
  });

  console.log('💬 ALL MESSAGES (Last 50):');
  if (allMessages.length === 0) {
    console.log('  No messages found');
  } else {
    allMessages.forEach(msg => {
      console.log(`  - From: ${msg.sender.name} (${msg.sender.role})`);
      console.log(`    To: ${msg.recipient.name} (${msg.recipient.role})`);
      console.log(`    Content: "${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}"`);
      console.log(`    Date: ${msg.createdAt}`);
      console.log(`    ---`);
    });
  }
  console.log(`  Total messages in database: ${allMessages.length}\n`);

  // 5. Check for any "Maria Garcia" references
  console.log('🔍 SEARCHING FOR "MARIA GARCIA":');
  const mariaUsers = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: 'Maria', mode: 'insensitive' } },
        { name: { contains: 'Garcia', mode: 'insensitive' } },
        { email: { contains: 'maria', mode: 'insensitive' } },
        { email: { contains: 'garcia', mode: 'insensitive' } }
      ]
    }
  });

  if (mariaUsers.length === 0) {
    console.log('  ✅ No "Maria Garcia" found in users table');
  } else {
    console.log('  ⚠️ Found users matching "Maria Garcia":');
    mariaUsers.forEach(user => {
      console.log(`    - ${user.name} (${user.email}) [${user.role}]`);
    });
  }

  const mariaMessages = await prisma.message.findMany({
    where: {
      OR: [
        { content: { contains: 'Maria', mode: 'insensitive' } },
        { content: { contains: 'Garcia', mode: 'insensitive' } }
      ]
    },
    include: {
      sender: { select: { name: true } },
      recipient: { select: { name: true } }
    }
  });

  if (mariaMessages.length === 0) {
    console.log('  ✅ No messages mentioning "Maria Garcia"');
  } else {
    console.log(`  ⚠️ Found ${mariaMessages.length} messages mentioning "Maria Garcia":`);
    mariaMessages.forEach(msg => {
      console.log(`    - "${msg.content.substring(0, 50)}..." (${msg.sender.name} → ${msg.recipient.name})`);
    });
  }

  // 6. Check conversations per user
  console.log('\n📊 CONVERSATIONS SUMMARY:');
  for (const patient of patients) {
    const conversationsAsSender = await prisma.message.groupBy({
      by: ['recipientId'],
      where: {
        senderId: patient.id
      },
      _count: true
    });

    const conversationsAsRecipient = await prisma.message.groupBy({
      by: ['senderId'],
      where: {
        recipientId: patient.id
      },
      _count: true
    });

    const uniqueConversations = new Set([
      ...conversationsAsSender.map(c => c.recipientId),
      ...conversationsAsRecipient.map(c => c.senderId)
    ]);

    console.log(`\n  Patient: ${patient.name}`);
    console.log(`    Active conversations: ${uniqueConversations.size}`);
    
    for (const otherUserId of uniqueConversations) {
      const otherUser = await prisma.user.findUnique({
        where: { id: otherUserId },
        select: { name: true, role: true }
      });
      
      if (otherUser) {
        const msgCount = await prisma.message.count({
          where: {
            OR: [
              { senderId: patient.id, recipientId: otherUserId },
              { senderId: otherUserId, recipientId: patient.id }
            ]
          }
        });
        
        const isActiveDoctor = activeDoctors.some(d => d.id === otherUserId);
        const status = isActiveDoctor ? '✅ Active' : '❌ Inactive/Deleted';
        
        console.log(`    - ${otherUser.name} (${otherUser.role}): ${msgCount} messages ${status}`);
      } else {
        console.log(`    - [Deleted User] (ID: ${otherUserId}): ❌ User deleted`);
      }
    }
  }

  console.log('\n=== VERIFICATION COMPLETE ===\n');
}

verifyMessagesData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
