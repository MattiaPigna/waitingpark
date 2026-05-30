# WaitingPark — Guida all'avvio

## Cosa hai bisogno

- **Node.js** → https://nodejs.org (scarica la versione LTS)
- **Expo Go** sul telefono → App Store o Google Play

---

## Passo 1 — Installa le dipendenze

Apri il terminale nella cartella del progetto e digita:

```bash
npm install
```

---

## Passo 2 — Configura Firebase

1. Vai su https://console.firebase.google.com
2. Crea un nuovo progetto → chiamalo **WaitingPark**
3. Vai su **Authentication** → abilita **Email/Password**
4. Vai su **Firestore Database** → crea il database in **Europa** (europe-west1)
5. Clicca sull'icona **</>** (app web) → registra l'app → copia la configurazione
6. Apri il file `src/services/firebase.ts` e incolla i tuoi valori:

```typescript
const firebaseConfig = {
  apiKey: "il-tuo-api-key",
  authDomain: "il-tuo-progetto.firebaseapp.com",
  projectId: "il-tuo-progetto",
  storageBucket: "il-tuo-progetto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc123"
};
```

### Regole Firestore (copia/incolla nella console Firebase)

Vai su **Firestore** → **Regole** e incolla:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /parkingSpots/{spotId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    match /parkingRequests/{reqId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    match /matches/{matchId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    match /messages/{msgId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

---

## Passo 3 — Aggiungi le immagini

Metti nella cartella `assets/` queste immagini:
- `icon.png` → 1024x1024 pixel (icona dell'app)
- `splash.png` → 1284x2778 pixel (schermata di caricamento)
- `adaptive-icon.png` → 1024x1024 pixel (icona Android)

Puoi usare qualsiasi immagine per ora — anche un semplice quadrato viola.

---

## Passo 4 — Avvia l'app

```bash
npx expo start
```

Poi:
- **Su iPhone**: apri Expo Go → scansiona il QR code
- **Su Android**: apri Expo Go → scansiona il QR code
- **Su simulatore**: premi `i` (iOS) o `a` (Android) nel terminale

---

## Passo 5 — Google Maps (opzionale per ora)

Per la mappa su Android devi una chiave Google Maps API:

1. Vai su https://console.cloud.google.com
2. Crea un progetto → abilita **Maps SDK for Android** e **Maps SDK for iOS**
3. Crea una chiave API
4. Mettila in `app.json` dove c'è scritto `INSERISCI_QUI_LA_TUA_GOOGLE_MAPS_API_KEY`

> **Nota**: senza la chiave, la mappa funziona lo stesso su iOS ma può essere grigia su Android.

---

## Passo 6 — Pagamenti (Stripe) — da aggiungere dopo

Per la fase di pagamenti reali avrai bisogno di:
1. Un account Stripe → https://stripe.com
2. Installare: `npx expo install @stripe/stripe-react-native`
3. Aggiungere la logica di pagamento nella `MatchScreen.tsx`

---

## Struttura dell'app

```
src/
├── screens/
│   ├── auth/          → Login, Registrazione, Benvenuto
│   └── main/          → Mappa, Sto uscendo, Cerco, Chat, Wallet, Profilo
├── services/          → Firebase + logica parcheggi
├── store/             → Stato globale dell'app (Zustand)
├── theme/             → Colori e stili condivisi
└── types/             → Tipi TypeScript
```

---

## Problemi comuni

**"Cannot find module 'react-native-maps'"**
→ `npx expo install react-native-maps`

**"Firebase: Error (auth/...)"**
→ Controlla di aver copiato correttamente la configurazione Firebase

**La mappa non si vede su Android**
→ Aggiungi la Google Maps API key in `app.json`
