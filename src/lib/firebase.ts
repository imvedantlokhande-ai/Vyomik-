import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, RecaptchaVerifier, signInWithPhoneNumber, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import configJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: configJson.apiKey || import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: configJson.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: configJson.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: configJson.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: configJson.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: configJson.appId || import.meta.env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: configJson.firestoreDatabaseId
};

export const isFirebaseConfigured = !!firebaseConfig.apiKey;

let app;
let authInstance;
let dbInstance;

if (isFirebaseConfigured) {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  authInstance = getAuth(app);
  dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const auth = authInstance;
export const db = dbInstance;

// Auth wrapper to support testing without Firebase keys
export const signInAsGuest = async () => {
  if (isFirebaseConfigured) {
    return signInAnonymously(auth);
  } else {
    console.warn("Firebase not configured, using mock Guest login");
    return { user: { uid: 'mock-guest-uid', email: null, isAnonymous: true } };
  }
};

export const signInWithGoogle = async () => {
  if (isFirebaseConfigured) {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  } else {
    console.warn("Firebase not configured, using mock Google login");
    return { user: { uid: 'mock-google-uid', email: 'user@example.com', displayName: 'Test User' } };
  }
};

export const loginWithEmail = async (email, password) => {
  if (isFirebaseConfigured) {
    return signInWithEmailAndPassword(auth, email, password);
  } else {
    console.warn("Firebase not configured, using mock Email login");
    return { user: { uid: 'mock-email-uid', email } };
  }
};

export const registerWithEmail = async (email, password) => {
  if (isFirebaseConfigured) {
    return createUserWithEmailAndPassword(auth, email, password);
  } else {
    console.warn("Firebase not configured, using mock Email register");
    return { user: { uid: 'mock-email-uid', email } };
  }
};

export const setupRecaptcha = (containerId: string) => {
  if (isFirebaseConfigured) {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
      });
    }
    return (window as any).recaptchaVerifier;
  }
  return null;
};

export const sendOTP = async (phoneNumber: string, appVerifier: any) => {
  if (isFirebaseConfigured) {
    return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  } else {
    console.warn("Firebase not configured, using mock send OTP");
    return { confirm: async () => ({ user: { uid: 'mock-phone-uid', phoneNumber } }) };
  }
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const logout = async () => {
  if (isFirebaseConfigured) {
    return signOut(auth);
  } else {
    console.warn("Firebase not configured, using mock logout");
    return Promise.resolve();
  }
};
