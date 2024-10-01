import { Prisma, PrismaClient } from '@prisma/client';
import ShortUniqueId from 'short-unique-id';

const db = new PrismaClient();

async function main() {
  if (process.env['NODE_ENV'] === 'production') {
    return;
  }

  const users = await generateUsers();
  const inviteCodes = await generateInviteCodes(users.map((user) => user.id));

  console.log(users);
  console.log(inviteCodes);
}

async function generateUsers() {
  const mockUsers = [
    {
      name: 'John Doe',
    },
  ] satisfies Prisma.UserCreateManyInput[];

  const users = await db.user.createMany({
    data: mockUsers,
    skipDuplicates: true,
  });

  console.log(`Created ${users.count} users`);

  return db.user.findMany();
}

async function generateInviteCodes(userId: number[]) {
  const { randomUUID } = new ShortUniqueId({
    length: 6,
    dictionary: 'alpha_upper',
  });
  const inviteCodes = Array.from({ length: 10 }, () => randomUUID());

  await db.inviteCode.createMany({
    data: inviteCodes.map((code) => ({
      code,
      remaining: Math.floor(Math.random() * 2),
      userId: userId[Math.floor(Math.random() * userId.length)],
    })) satisfies Prisma.InviteCodeCreateManyInput[],
    skipDuplicates: true,
  });

  console.log(`Created ${inviteCodes.length} invite codes`);

  return inviteCodes;
}

main()
  .then(() => {
    console.log('Seeded');
  })
  .catch((e) => {
    console.error(e);
  });
