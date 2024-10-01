import { authHandler } from '@mocaverse/auth-handler';
import { AuthService } from '@mocaverse/auth-service';
import { ConfigService } from '@mocaverse/config-service';
import { db } from '@mocaverse/mocaverse-prisma-client';
import { contract } from '@mocaverse/shared-api';
import { createExpressEndpoints, initServer } from '@ts-rest/express';
import * as bodyParser from 'body-parser';
import express from 'express';

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const configService = new ConfigService();
const authService = new AuthService(configService, db);

const s = initServer();
const router = s.router(contract, {
  auth: authHandler(authService),
});

createExpressEndpoints(contract, router, app);

app.listen(3000, () => {
  console.log('🚀 Server is running. http://localhost:3000');
});
