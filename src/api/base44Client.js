// src/api/base44Client.js
import { createClient } from '@base44/sdk';

export const base44 = createClient({
  appId: process.env.APP_ID,
  token: process.env.TOKEN,
  functionsVersion: "v1",
  serverUrl: process.env.SERVER_URL || "", // điền backend URL nếu có
  requiresAuth: true,
  appBaseUrl: process.env.APP_BASE_URL
});