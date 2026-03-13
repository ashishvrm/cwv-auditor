import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

async function deployRules(): Promise<void> {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (!serviceAccountKey) {
    console.error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
    process.exit(1);
  }
  if (!projectId) {
    console.error('FIREBASE_PROJECT_ID environment variable is not set');
    process.exit(1);
  }

  const credentials = JSON.parse(serviceAccountKey);

  // Initialize admin SDK to get an access token
  const app = admin.initializeApp({
    credential: admin.credential.cert(credentials),
    projectId,
  });

  // Read the firestore.rules file
  const rulesPath = resolve(process.cwd(), '..', 'firestore.rules');
  console.log(`Reading rules from ${rulesPath}...`);

  let rulesContent: string;
  try {
    rulesContent = readFileSync(rulesPath, 'utf-8');
  } catch (error) {
    console.error(`Failed to read firestore.rules: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }

  // Get access token from the service account
  const accessToken = await app.options.credential!.getAccessToken();
  const token = accessToken.access_token;

  const baseUrl = 'https://firebaserules.googleapis.com/v1';

  try {
    // Step 1: Create a ruleset
    console.log('Creating ruleset...');
    const createResponse = await fetch(`${baseUrl}/projects/${projectId}/rulesets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: {
          files: [
            {
              name: 'firestore.rules',
              content: rulesContent,
            },
          ],
        },
      }),
    });

    if (!createResponse.ok) {
      const errorBody = await createResponse.text();
      throw new Error(`Failed to create ruleset: ${createResponse.status} ${errorBody}`);
    }

    const rulesetData = await createResponse.json() as { name: string };
    const rulesetName = rulesetData.name;
    console.log(`Ruleset created: ${rulesetName}`);

    // Step 2: Release the ruleset (make it active for cloud.firestore)
    console.log('Releasing ruleset...');
    const releaseName = `projects/${projectId}/releases/cloud.firestore`;

    // Try to update existing release first, then create if it doesn't exist
    const updateResponse = await fetch(`${baseUrl}/${releaseName}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        release: {
          name: releaseName,
          rulesetName: rulesetName,
        },
        updateMask: 'rulesetName',
      }),
    });

    if (updateResponse.ok) {
      console.log('✓ Firestore security rules deployed successfully (updated existing release)');
    } else {
      // If PATCH fails (release doesn't exist yet), create it
      const createReleaseResponse = await fetch(`${baseUrl}/projects/${projectId}/releases`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: releaseName,
          rulesetName: rulesetName,
        }),
      });

      if (!createReleaseResponse.ok) {
        const errorBody = await createReleaseResponse.text();
        throw new Error(`Failed to release ruleset: ${createReleaseResponse.status} ${errorBody}`);
      }

      console.log('✓ Firestore security rules deployed successfully (created new release)');
    }

    console.log(`  Ruleset: ${rulesetName}`);
  } catch (error) {
    console.error(`Failed to deploy Firestore rules: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

deployRules().then(() => {
  process.exit(0);
});
