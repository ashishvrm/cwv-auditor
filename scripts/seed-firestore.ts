import admin from 'firebase-admin';

const APP_CONFIG = {
  name: 'CWV Auditor',
  description: 'Core Web Vitals monitoring and auditing tool',
  icon: 'activity',
  enabled: true,
  monitoredPages: [
    {
      id: 'homepage',
      url: 'https://www.infarmbureau.com',
      name: 'Homepage',
      shortName: 'Home',
      template: 'homepage',
    },
    {
      id: 'auto-product',
      url: 'https://www.infarmbureau.com/auto',
      name: 'Auto Product',
      shortName: 'Auto',
      template: 'product',
    },
    {
      id: 'life-product',
      url: 'https://www.infarmbureau.com/life',
      name: 'Life Product',
      shortName: 'Life',
      template: 'product',
    },
    {
      id: 'article',
      url: 'https://www.infarmbureau.com/inside-story/articles/homeowners-insurance-guide-2023',
      name: 'Article Page',
      shortName: 'Article',
      template: 'article',
    },
    {
      id: 'agent-page',
      url: 'https://www.infarmbureau.com/agents/Kent-Shaffer-Marion-Indianapolis-IN',
      name: 'Agent Page',
      shortName: 'Agent',
      template: 'agent',
    },
    {
      id: 'office-page',
      url: 'https://www.infarmbureau.com/offices/Marion/Home Office Agent',
      name: 'Office Page',
      shortName: 'Office',
      template: 'office',
    },
    {
      id: 'claim-form',
      url: 'https://www.infarmbureau.com/claims/report-claim?type=auto',
      name: 'Auto Claim Form',
      shortName: 'Claim',
      template: 'form',
    },
  ],
  auditConfig: {
    strategy: 'desktop',
    categories: ['performance'],
    scheduleDay: 1,
    scheduleCron: '0 6 1 * *',
  },
  thresholds: {
    lcp: { good: 2500, poor: 4000 },
    tbt: { good: 200, poor: 600 },
    cls: { good: 0.1, poor: 0.25 },
    fcp: { good: 1800, poor: 3000 },
    tti: { good: 3800, poor: 7300 },
    si: { good: 3400, poor: 5800 },
  },
};

async function seedFirestore(): Promise<void> {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const projectId = process.env.FIREBASE_PROJECT_ID;

    if (!serviceAccountKey) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
    }

    if (!projectId) {
      throw new Error('FIREBASE_PROJECT_ID environment variable is not set');
    }

    const credentials = JSON.parse(serviceAccountKey);

    admin.initializeApp({
      credential: admin.credential.cert(credentials),
      projectId,
    });

    const db = admin.firestore();

    console.log('Initializing app_config collection...');

    // Create or overwrite the app_config/cwv-audit document
    await db.collection('app_config').doc('cwv-audit').set(APP_CONFIG, { merge: true });

    console.log('✓ app_config/cwv-audit document created successfully');
    console.log(`  - Name: ${APP_CONFIG.name}`);
    console.log(`  - Monitored pages: ${APP_CONFIG.monitoredPages.length}`);
    console.log(`  - Enabled: ${APP_CONFIG.enabled}`);
    console.log('Firestore initialization completed successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Failed to seed Firestore: ${errorMessage}`);
    process.exit(1);
  }
}

seedFirestore().then(() => {
  process.exit(0);
});
