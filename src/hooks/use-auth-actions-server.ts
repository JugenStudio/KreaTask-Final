
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { createContext, useContext, ReactNode, useMemo } from 'react';

// This is a simplified, client-side only Firebase setup.
// It should not be used for server-side rendering.

let firebaseApp: FirebaseApp;
if (!getApps().length) {
    firebaseApp = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    });
} else {
    firebaseApp = getApp();
}

const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

interface FirebaseContextValue {
    auth: Auth;
    firestore: Firestore;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export function FirebaseProvider({ children }: { children: ReactNode }) {
    const value = useMemo(() => ({ auth, firestore }), []);
    return (
        <FirebaseContext.Provider value={value}>
            {children}
        </FirebaseContext.Provider>
    );
}

export function useFirebase() {
    const context = useContext(FirebaseContext);
    if (!context) {
        // This fallback is for when the hook is used outside the provider,
        // which can happen in simple client components. It's not ideal for SSR.
        return { auth, firestore };
    }
    return context;
}

export function useAuth() {
    return useFirebase().auth;
}

export function useFirestore() {
    return useFirebase().firestore;
}

    