import { createExpressEndpoints, initServer } from '@ts-rest/express';
import express from 'express';
import * as bodyParser from 'body-parser';
import { contract } from '@mocaverse/shared-api';
import { authHandler } from '@mocaverse/auth-handler';

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const s = initServer();
const router = s.router(contract, {
  auth: authHandler,
});

createExpressEndpoints(contract, router, app);

app.listen(3000, () => {
  console.log('🚀 Server is running. http://localhost:3000');
});
