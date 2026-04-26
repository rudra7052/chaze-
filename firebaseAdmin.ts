import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readJsonFile(filePath: string) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Failed to parse Firebase service account at ${filePath}:`, error);
    return null;
  }
}

function loadServiceAccount() {
  const inlineJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (inlineJson) {
    try {
      return {
        credentials: JSON.parse(inlineJson),
        source: 'FIREBASE_SERVICE_ACCOUNT_JSON',
      };
    } catch (error) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', error);
    }
  }

  const candidatePaths = [
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    path.join(process.cwd(), 'serviceAccount.json'),
    path.join(__dirname, 'serviceAccount.json'),
    '/etc/secrets/serviceAccount.json',
  ].filter((value): value is string => Boolean(value));

  for (const filePath of candidatePaths) {
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const credentials = readJsonFile(filePath);
    if (credentials) {
      return {
        credentials,
        source: filePath,
      };
    }
  }

  return null;
}

export function initializeFirebaseAdmin(options?: { required?: boolean }) {
  if (admin.apps.length > 0) {
    return {
      initialized: true,
      source: 'existing-app',
    };
  }

  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) {
    if (options?.required) {
      throw new Error(
        'Firebase Admin credentials not found. Provide FIREBASE_SERVICE_ACCOUNT_JSON or a serviceAccount.json secret file.',
      );
    }

    return {
      initialized: false,
      source: null,
    };
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount.credentials),
  });

  return {
    initialized: true,
    source: serviceAccount.source,
  };
}

export { admin };
