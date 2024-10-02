import { AuthService } from '@mocaverse/auth-service';
import { ConfigService } from '@mocaverse/config-service';
import { contract } from '@mocaverse/shared-api';
import { createExpressEndpoints, initServer } from '@ts-rest/express';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import { Server } from 'http';
import * as request from 'supertest';
import { ServerError } from '../../../../core/interfaces/src';
import { authHandler } from './auth-handler';

// Mock the ConfigService and AuthService
jest.mock('@mocaverse/config-service');
jest.mock('@mocaverse/auth-service');

describe('authHandler', () => {
  let app: express.Express;
  let server: ReturnType<typeof initServer>;
  let expressServer: Server;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeAll(() => {
    // Mock process.env
    const originalEnv = process.env;
    jest.replaceProperty(process, 'env', {
      ...originalEnv,
      JWT_SECRET: 'mocked-jwt-secret',
    });

    // Setup mock services
    mockConfigService = {
      getEnv: jest.fn(),
      // Add other methods as needed
    } as unknown as jest.Mocked<ConfigService>;

    mockAuthService = {
      loginWithEmail: jest.fn(),
      registerWithEmail: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    // Inject mock services into authHandler
    const handlerWithMocks = authHandler(mockAuthService);

    app = express();
    app.use(bodyParser.json());
    server = initServer();

    const router = server.router(contract.auth, handlerWithMocks);

    createExpressEndpoints(contract.auth, router, app);
    const port = Math.floor(Math.random() * 10000) + 6900;

    expressServer = app.listen(port, () => {
      console.log(`Fake API is running on port ${port}`);
    });
  });

  describe('loginWithEmail', () => {
    it('should return 200 and tokens on successful login', async () => {
      // Setup mock return values
      mockAuthService.loginWithEmail.mockResolvedValue({
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
      });

      const response = await request(app)
        .post('/auth/login-with-email')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
      });
      expect(mockAuthService.loginWithEmail).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should return 400 on invalid credentials', async () => {
      // Setup mock to throw an error
      mockAuthService.loginWithEmail.mockRejectedValue(
        new ServerError('Invalid email or password', 400)
      );

      const response = await request(app)
        .post('/auth/login-with-email')
        .send({ email: 'test@example.com', password: 'wrongpassword' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Invalid email or password',
      });
      expect(mockAuthService.loginWithEmail).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'wrongpassword',
      });
    });
  });

  describe('refreshToken', () => {
    it('should return 200 and tokens on successful refresh', async () => {
      // Setup mock return values
      mockAuthService.refresh.mockResolvedValue({
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
      });

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'mockRefreshToken' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
      });
    });
  });

  describe('registerWithEmail', () => {
    it('should return 200 on successful registration', async () => {
      // Setup mock return values
      mockAuthService.registerWithEmail.mockResolvedValue({
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
      });

      const response = await request(app)
        .post('/auth/register-with-email')
        .send({
          email: 'test@example.com',
          password: 'password123',
          inviteCode: 'mockInviteCode',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
      });
    });
  });

  afterAll(() => {
    expressServer.close();
    // Restore the original process.env
    jest.restoreAllMocks();
  });
});
