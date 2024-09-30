import { Prisma, PrismaClient } from '@prisma/client';
import ShortUniqueId from 'short-unique-id';

const db = new PrismaClient();

async function main() {
  const inviteCodes = await generateInviteCodes();

  await db.inviteCode.createMany({
    data: inviteCodes.map((code) => ({
      code,
      remaining: Math.floor(Math.random() * 2),
    })) satisfies Prisma.InviteCodeCreateManyInput[],
    skipDuplicates: true,
  });
}

async function generateInviteCodes() {
  const { randomUUID } = new ShortUniqueId({ length: 6 });
  const inviteCodes = Array.from({ length: 10 }, () => randomUUID());

  return inviteCodes;
}

main()
  .then(() => {
    console.log('Seeded');
  })
  .catch((e) => {
    console.error(e);
  });
