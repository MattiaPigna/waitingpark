import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURAZIONE FIREBASE
//
// 1. Vai su https://console.firebase.google.com
// 2. Crea un nuovo progetto chiamato "WaitingPark"
// 3. Aggiungi un'app Web (icona </> )
// 4. Copia i valori qui sotto
// ─────────────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: 'INSERISCI_API_KEY',
  authDomain: 'INSERISCI_AUTH_DOMAIN',
  projectId: 'INSERISCI_PROJECT_ID',
  storageBucket: 'INSERISCI_STORAGE_BUCKET',
  messagingSenderId: 'INSERISCI_MESSAGING_SENDER_ID',
  appId: 'INSERISCI_APP_ID',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
