import { mocaversePrismaClient } from './mocaverse-prisma-client';

describe('mocaversePrismaClient', () => {
  it('should work', () => {
    expect(mocaversePrismaClient()).toEqual('mocaverse-prisma-client');
  });
});
