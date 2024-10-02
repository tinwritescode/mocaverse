import { Prisma, PrismaClient } from '@prisma/client';
import ShortUniqueId from 'short-unique-id';

const db = new PrismaClient();

async function main() {
  if (process.env['NODE_ENV'] === 'production') {
    return;
  }

  const mockInviteCode = await generateInviteCodes({ total: 1 });
  const users = await generateUsers({ inviteCodeId: mockInviteCode[0].id });
  const inviteCodes = await generateInviteCodes({
    userId: users.map((user) => user.id),
  });

  if (users.length > 0) {
    console.log(users);
  }
  if (inviteCodes.length > 0) {
    console.log(inviteCodes);
  }
}

async function generateUsers({ inviteCodeId }: { inviteCodeId: number }) {
  const mockUsers = [
    {
      name: 'John Doe',
      inviteCodeId: inviteCodeId,
    },
  ] satisfies Prisma.UserCreateManyInput[];

  const users = await db.user.createMany({
    data: mockUsers,
    skipDuplicates: true,
  });

  console.log(`Created ${users.count} users`);

  return db.user.findMany();
}

async function generateInviteCodes({
  userId,
  total = 10,
}: {
  userId?: number[];
  total?: number;
}) {
  const { randomUUID } = new ShortUniqueId({
    length: 8,
    dictionary: 'alphanum_upper',
  });
  const inviteCodes = Array.from({ length: total }, () => randomUUID());

  const result = await db.inviteCode.createManyAndReturn({
    data: inviteCodes.map((code) => ({
      code,
      remaining: Math.floor(Math.random() * 2),
      inviterId:
        userId === undefined
          ? undefined
          : userId[Math.floor(Math.random() * userId.length)],
    })) satisfies Prisma.InviteCodeCreateManyInput[],
    skipDuplicates: true,
  });

  console.log(`Created ${inviteCodes.length} invite codes`);

  return result;
}

main()
  .then(() => {
    console.log('Seeded');
  })
  .catch((e) => {
    console.error(e);
  });
