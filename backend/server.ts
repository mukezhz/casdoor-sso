// Copyright 2023 The Casdoor Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import url from 'url';
import { SDK } from 'casdoor-nodejs-sdk';
import express, { Express, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// init sdk
const cert = `-----BEGIN CERTIFICATE-----
MIIE3zCCAsegAwIBAgIDAeJAMA0GCSqGSIb3DQEBCwUAMCkxETAPBgNVBAoTCGFz
dGVyZ2FlMRQwEgYDVQQDDAtjZXJ0X2lyeGg4cDAeFw0yNjA0MjkwNTM2MzhaFw00
NjA0MjkwNTM2MzhaMCkxETAPBgNVBAoTCGFzdGVyZ2FlMRQwEgYDVQQDDAtjZXJ0
X2lyeGg4cDCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBALyR72BuAWFC
4Ub7Al6uTSbALO6iKLNbq0z4KsC7iz9jExuxf9OGA7It/8rfDkzKCZzik0So9x5h
f6HVB7MZwUgl296vNr/oHxTnvM/ghxse7NZBxfcND6VPQhMch9ne48lZiJ+VO0sz
cFWbcUXRqrszbxZkqVLfJ9sroC0oaPGuR1Ji8rDGOW5aneFofb2cEL9Tk2s+ijJE
N20eqqNpFVDkcbtl9FWZNQkp8gLkDvBUR2m7VE2+6uKpDHpce6zyFUWZFHS3KyFp
XQfgJcSy/2xFPXAP6/+Ndatd4l5dhCvzG8O6xpvTPzTOitlgoXBw4mO2cny93etm
uFFAQ3GxhIJKRl3JW5hjSqOMq2iK748/FKqaPDM9b2GCQx54mBU8tPJR5e3d45gJ
JRBoTWFsAWqGnZZ7UyDjvzMDnr02X20gw8frsFPTESCGBFtQBQYwVV7VORPG1hp6
3ccASketkhiisGAJ0daAjg7F5VMKx2SM35zgS3Pv+eciNUTyDdQ+nIzu+/HY4kDA
9zmHGHEuyMn1nGFt6kmG13QOR4IDxrtUUGCQkTi4Nrx26Z4K+hO9nunWCEI2CAGq
2EAhhJBHVa1zmVEhf9oD+0bJsAYljb3D/udyRUmsacbKUaBLR6f9/HRiNgqsmvRL
uosQleEM3qU+S2eAUAW11TeAZm60CmLXAgMBAAGjEDAOMAwGA1UdEwEB/wQCMAAw
DQYJKoZIhvcNAQELBQADggIBAAYWZzCJjGp7fBFmzMcmRhHQeHl6cN/VjgrKlAFT
f1FupiAUwOWxzsoDlUZVLa+MfGa8TE/rojM+GT+E42S3TtJHfQd+5sdIOy4VTSYN
Cq7dbdpSrcXj8NjvD+PWLQa8AK9yRv2Sk7zl0N+hoY5acJse5ywL2mNibVfmzHzA
Oz6+tP7LafRX3jkYs1wQE1cpg5RFV+mYEyISye8I5xsyk3p6i7sTDVd4iaMXVCm+
sDmlekJu1dFPhl/hF29PSEmmG1MA2e8rKBNHuLmccXHFQ6HQsGNLfxURm3Jfzuqz
MROt5zLFQtevf2cmZE+D3UN6vonkdV343VaUDCk1iV+uUfuPSFGV5wVRwv71IHCm
0Y+bvN+kFtae5pAmxSZDuKnCpbD+EWauXlsVqlKT64F9v9vQCY/syMGirnNLWczt
GwYf4ndfFpZskoudvbu6yfYpwFeWH940ffsoVqYwfH3J65+F0Y9f7f6o8GNUZv4R
p0zGr7ZJrIjyhHdalyYSsIT+uyAIcCZhZpCRQwBaDOmt5VpCRC9jmBvhUDQo5trx
MkV1cdFjm9/FiXLboqa4f54ynDu7EYvvT5AU2SO6TPNrjujHq3L3md/4ueAM/Gp6
6LNzBvflIAfXDKS/rgMMh6uW0ZpdMpb9A9/PZeriqcQkG/jlWzJ7DsX5K/JtimNU
V0Gi
-----END CERTIFICATE-----`;

const authCfg = {
  endpoint: 'http://localhost:18000',
  clientId: '5b4008e5315cbc48fa51',
  clientSecret: '00372812237a9d10471916ec16537947f5e99ce8',
  certificate: cert,
  orgName: 'astergaze',
  appName: 'asterconsult',
};

const sdk = new SDK({
  endpoint: authCfg.endpoint,
  clientId: authCfg.clientId,
  clientSecret: authCfg.clientSecret,
  certificate: authCfg.certificate,
  orgName: authCfg.orgName,
  appName: authCfg.appName,
});

const app: Express = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', "https://app.localhost", "https://bidhyarthi.localhost" ],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', "https://app.localhost", "https://bidhyarthi.localhost" ],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.get('/', (req: Request, res: Response) => {
  fs.readFile(path.resolve(__dirname, './index.html'), (err, data) => {
    if (err) {
      res.status(404).send('index.html not found');
      return;
    }
    res.setHeader('Content-Type', 'text/html');
    res.send(data);
  });
});

app.post('/api/getUserInfo', async (req: Request, res: Response) => {
  const authHeader = req.get('Authorization')
  const token = authHeader?.split(' ')[1]; // Extract token from "Bearer <token>"
  try {
    if (!token) {
      res.status(400).json({ error: 'Token is required' });
      return;
    }
    const parsedUser = sdk.parseJwtToken(token);
    if (!parsedUser || typeof parsedUser !== 'object' || !parsedUser.id) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    // Validate token with Casdoor server
    const user = await sdk.getUser(parsedUser.id);
    if (!user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
    console.log('User info retrieved:', parsedUser);
    res.json(parsedUser);
  } catch (error) {
    console.error('Error validating token:', error);
    res.status(401).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

app.post('/api/logout', async (req: Request, res: Response) => {
  try {
    const urlObj = url.parse(req.url, true).query;
    const token = urlObj.token as string;

    if (!token) {
      res.status(400).json({ error: 'Token is required' });
      return;
    }

    // Call Casdoor SSO logout endpoint
    const logoutUrl = `${authCfg.endpoint}/api/sso-logout`;
    const response = await fetch(logoutUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    console.log('SSO logout response:', result);
    res.json(result);
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('*', async (req: Request, res: Response) => {
  try {
    const urlObj = url.parse(req.url, true).query;
    const code = urlObj.code as string;

    if (!code) {
      res.status(400).json({ error: 'Code is required' });
      return;
    }

    const response = await sdk.getAuthToken(code);
    console.log('Auth response:', response);
    const accessToken = (response as any).access_token;
    res.json({ token: accessToken });
  } catch (error) {
    console.error('Error getting auth token:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
