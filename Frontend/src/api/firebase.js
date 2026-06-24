import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Production check: Ensure all Firebase config values are present.
// In development, Vite handles this, but on Vercel, this provides a clear error if a variable is missing.
if (import.meta.env.PROD) {
    for (const key in firebaseConfig) {
        if (!firebaseConfig[key]) {
            // This will cause the app to crash with a clear error message during initialization if a variable is missing.
            throw new Error(`Firebase config error: Missing environment variable VITE_FIREBASE_${key.toUpperCase()}. Please set it in your Vercel project settings.`);
        }
    }
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();