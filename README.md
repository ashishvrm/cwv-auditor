# CWV Auditor Portal

Enterprise-grade Core Web Vitals monitoring portal for infarmbureau.com.

## Prerequisites

- Node.js 20+
- npm 10+
- Firebase CLI: `npm install -g firebase-tools`
- A GitHub account (for Actions automation)

## Initial Setup

### 1. Clone and Install

```bash
git clone <repo-url>
cd cwv-auditor-portal
npm install
cd scripts && npm install && cd ..
```

### 2. Firebase Console Setup

1. Go to https://console.firebase.google.com/project/cwv-auditor-7d032
2. **Enable Firestore**:
   - Click "Firestore Database" in the sidebar
   - Click "Create Database"
   - Select "Start in production mode"
   - Choose region: `us-central1` (or your preferred region)
3. **Enable Authentication**:
   - Click "Authentication" in the sidebar
   - Click "Get Started"
   - Go to "Sign-in method" tab
   - Enable **Email/Password** provider
   - Enable **Google** provider
     - Set the project support email to your email
4. **Deploy Firestore Rules and Indexes**:
   - From your terminal: `firebase deploy --only firestore`

### 3. Google Cloud Console Setup - OAuth Consent Screen

1. Go to https://console.cloud.google.com/apis/credentials/consent
2. Select your project (cwv-auditor-7d032)
3. Configure the OAuth consent screen:
   - User Type: **External** (or Internal if using Google Workspace)
   - App name: "CWV Auditor Portal"
   - User support email: your email
   - Developer contact: your email
4. Add scopes: `email`, `profile`, `openid`
5. Save

### 4. Google Cloud Console Setup - OAuth Credentials

1. Go to https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Click to edit it
4. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173` (for local development with Vite)
   - `http://localhost:3000`
   - `https://cwv-auditor-7d032.web.app`
   - `https://cwv-auditor-7d032.firebaseapp.com`
5. Under **Authorized redirect URIs**, add:
   - `http://localhost:5173/__/auth/handler`
   - `http://localhost:3000/__/auth/handler`
   - `https://cwv-auditor-7d032.web.app/__/auth/handler`
   - `https://cwv-auditor-7d032.firebaseapp.com/__/auth/handler`
   - `https://cwv-auditor-7d032.firebaseapp.com`
6. Save

### 5. Google PageSpeed Insights API Setup

1. Go to https://console.cloud.google.com/apis/library/pagespeedonline.googleapis.com
2. Enable the "PageSpeed Insights API"
3. Go to https://console.cloud.google.com/apis/credentials
4. Create an API Key (or use existing one)
5. (Optional) Restrict the key to only the PageSpeed Insights API

### 6. Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

Fill in:
- All VITE_FIREBASE_* values (already provided in this project)
- VITE_PSI_API_KEY with your PageSpeed Insights API key

### 7. Seed Initial Data

Run the app locally, log in with your account, then run the first audit manually from the Settings page. This will populate Firestore with initial data.

### 8. GitHub Actions Setup (for monthly automation)

1. Push this repo to GitHub
2. Go to your repo > Settings > Secrets and Variables > Actions
3. Add these repository secrets:
   - `FIREBASE_SERVICE_ACCOUNT_KEY`: Paste the full JSON content of the Firebase Admin SDK service account key file
   - `PSI_API_KEY`: Your Google PageSpeed Insights API key
   - `FIREBASE_PROJECT_ID`: `cwv-auditor-7d032`
4. The workflow will automatically run on the 1st of every month at 6 AM UTC
5. You can also trigger it manually from the Actions tab > "Monthly CWV Audit" > "Run workflow"

### 9. Deploy to Firebase Hosting

```bash
firebase login
npm run build
firebase deploy --only hosting
```

Your app will be live at:
- https://cwv-auditor-7d032.web.app
- https://cwv-auditor-7d032.firebaseapp.com

## Development

```bash
npm run dev         # Start local dev server (Vite)
npm run build       # Build for production
npm run preview     # Preview production build locally
```

## Architecture

See the BUILD_SPEC.md file for the complete architecture, data model, and component specifications.

## Security Notes

- NEVER commit `.env.local` or service account keys to the repository
- The `.gitignore` file is configured to exclude these
- All credentials should be stored in GitHub Secrets for CI/CD
- Rotate Firebase service account keys periodically
- Firestore rules restrict writes to admin SDK (server-side) except for admin users doing manual audits
