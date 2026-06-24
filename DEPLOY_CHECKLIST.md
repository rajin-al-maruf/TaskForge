Deployment Checklist for TaskForge

1. Environment variables

- Backend (Vercel project / server):
  - MONGODB_URL (or MONGO_URI)
  - JWT_SECRET
  - FRONTEND_URL (https://your-frontend-domain)

- Frontend (Vercel project / static site):
  - VITE_API_URL (e.g. https://your-backend.vercel.app/api)
  - VITE_FIREBASE_API_KEY
  - VITE_FIREBASE_AUTH_DOMAIN
  - VITE_FIREBASE_PROJECT_ID
  - VITE_FIREBASE_STORAGE_BUCKET
  - VITE_FIREBASE_MESSAGING_SENDER_ID
  - VITE_FIREBASE_APP_ID
  - VITE_FIREBASE_MEASUREMENT_ID

2. Firebase configuration

- In Firebase Console -> Authentication -> Sign-in method -> Google: ensure OAuth client is configured.
- Add your deployed frontend domain(s) to Authorized domains (e.g., example.com, www.example.com).
- If using redirect flows, ensure OAuth redirect URIs include your deployed domain.

3. Vercel settings

- Frontend: connect your Frontend folder as the project; ensure `build` is `vite build` and `output` points to the built `dist` (Vercel should detect).
- Backend: set up a Node serverless project pointing at `src/app.js` (current `vercel.json` rewrites to `src/app.js`). Confirm you want serverless functions.
- Set all environment variables in each Vercel project's Settings → Environment Variables (Production).
- Ensure `FRONTEND_URL` matches the protocol and domain (https://...) — used for CORS.

4. CORS & API base URL

- Confirm `FRONTEND_URL` in backend matches deployed frontend. If not set, CORS may block requests.
- Set `VITE_API_URL` in frontend to the deployed backend API base (e.g., `https://your-backend.vercel.app/api`).

5. Build & Deploy steps (local test)

- Frontend (local build):

```bash
cd Frontend
npm install
npm run build
# Optional: serve the `dist` folder to test
npx serve dist
```

- Backend (local test):

```bash
cd Backend
npm install
# Set env vars locally or use a .env file
node src/index.js
```

6. Verification after deploy

- Visit the frontend URL and try:
  - Register / Login via email/password
  - Google sign-in (popup and redirect)
- Check browser console for Firebase/auth errors.
- Check Vercel function logs for `/users/social-login` logs produced by the backend.
- Confirm localStorage `token` and `user` are set in the browser after social-login.

7. Troubleshooting common failures

- Missing env var: app may crash in production if `firebase.js` throws. Verify all `VITE_` envs are set.
- Firebase domain not authorized: Google sign-in fails silently or with `auth/unauthorized-domain`.
- Popup blocked: guide users to allow popups or use redirect flow; use `onAuthStateChanged` fallback.
- CORS: incorrect `FRONTEND_URL` or missing protocol will block API calls.

If you want, I can:
- Add structured server-side logging (Winston) and expose a short `/health` endpoint.
- Help set Vercel env vars via the Vercel dashboard or a script.
- Run local production builds and smoke tests and report results.
