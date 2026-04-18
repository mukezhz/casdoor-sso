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
MIIE2TCCAsGgAwIBAgIDAeJAMA0GCSqGSIb3DQEBCwUAMCYxDjAMBgNVBAoTBWFk
bWluMRQwEgYDVQQDDAtjZXJ0X3ZuNWlpbjAeFw0yNjA0MTgwNTAxNTRaFw00NjA0
MTgwNTAxNTRaMCYxDjAMBgNVBAoTBWFkbWluMRQwEgYDVQQDDAtjZXJ0X3ZuNWlp
bjCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAM6cRPUyabRItSCrUJBg
VUrPVwmNVoFDX54i5Vntf4z+//yBMGX+5TM37n7uGSYc+vI6OJp71/xTBgfjav+G
is8zIih0PDvFEcDIBD6SqOSodBSTVvdEBU3zAg2rXjo2LDvsfK2MWckXYKGPUQIp
STJqh0zPxwk03PGN2LvHLSBED/IgDst7ZzudxEuDLcbWZ/7T6zO67HEagVXFbX9l
20ToGt2Mf3wfNlGpOosSCJOML6uzyjhyR6hB9viiOl+9vqdkQXP8BZbcByGCBBUN
jI1h2Tsx9thFyp57LFVUoytWMhKS/yTuarlK7n0oNUH5ibmewSOX8z8Wgl5sIZ7O
Y0Tyy+Tp09/KpFW7WvRNmULZvxkV41KLRZWsF68oYPapvBNbIU6I4jMPIbnhg4Eo
JBw9xPCupyRXiZxqN9i4YuRHyvUlkQP/N1AOwo+0gMjAtNZLfcDt0BElkAnDssAm
dnXdPnnQcht8p+V2vPJGmwZKEhYa0p9BF4uSnXgahx0tuxSWussTt4SNCGQ1A5LZ
wpwCw2ta/wVQKt8WJXyfb+B787PwpUqz/jjAYKAvAr/liHOrgAnRRmYO5wDgODbu
32AkCjrBzSW5DWqKcvTkzpKL5kgAEWrThhse4kZJ1OTW620WwfPnfe1znlIK2IAI
t10hU6hcz1YOIA4rfUylaGKDAgMBAAGjEDAOMAwGA1UdEwEB/wQCMAAwDQYJKoZI
hvcNAQELBQADggIBALbEqIl3SBReGpyLsFwezHZN1Cb9sxgQvDXkokcmWP64x4Uf
rkluesG/tyxJnuk0/8hNJVVrWQ7XeZywTB8lBLc/trCOp4RfPuYy/zUxqSHJjKAA
VRCLcoqENrCw/Rh+D1o84/hGPpP7fQBrl4fEKb0TObGVu3Xp/zku8H+XQxevfclp
DQXqprqbkWVZrk1r8AIJYSiP39vQvvqMQrTxVJeylHAcSt+J+pm5GefmqtmWTunT
xmlc4aBK0TZUoBRYSVSghOy2Z69P+050B9+niS16td74pjjIWvYaRU8/2q+EyD8f
vEx2Nt7/91ZHIzGd0LZYpo+h2vebxyuLxTCcmOqM++wQOcH85nWXS4L9ZM4IZR3U
UBPmN81GNz+6Bjvv0XIvW9JD1aTGm9Aoa/yMhgDNoTeOqjlTHtxY3QUyJVg2MRz2
/wCyCdLcGpKuO5ghzpXgdKS1PtKGe84wZgM+JNrIPsxs3Uahq+JZww4OE7hpjtO0
ztBgbm/uyf/pbB2RKtjYBxBVa2OtQiS2zvIKfa2xx+a958pFK9uAyKBblIFXXcmt
2c7ysGCB/fh9O1pHf53ejm+O9cqTupo/YoSMhe4q7dEqXjBljixJ6U1OVZC6DNlW
glVRTTi/mtHuK2OWI9eduyc4uhWozp1jm+WnMGTeFuyrc7WYFyX4rhArkokS
-----END CERTIFICATE-----`;

const authCfg = {
  endpoint: 'http://localhost:18000',
  clientId: '337836a39ecb98df69ac',
  clientSecret: '83dfa9c41a9a23f5af0172caef622bc13266a526',
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
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
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

app.get('/api/getUserInfo', (req: Request, res: Response) => {
  try {
    const urlObj = url.parse(req.url, true).query;
    const token = urlObj.token as string;

    if (!token) {
      res.status(400).json({ error: 'Token is required' });
      return;
    }

    // console.log('Token:', token);
    const user = sdk.parseJwtToken(token);
    // console.log('User:', user);
    res.json(user);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    res.status(401).json({ error: (error as Error).message });
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
