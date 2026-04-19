/**
 * Firebase Configuration and Initialization
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

/**
 * Validates connection to Firestore on initialization
 */
async function testConnection() {
  try {
    // Attempt a serve-side fetch to verify connectivity
    await getDocFromServer(doc(db, '_internal_', 'probe'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Firebase Connection Error: Client is offline. Verify configuration.");
    }
  }
}

testConnection();
