import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './src/services/firebase';
import { useStore } from './src/store/useStore';
import AppNavigator from './src/navigation/AppNavigator';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const { setUser, setLoading } = useStore();

  useEffect(() => {
    setLoading(true);
    // Fallback: se Firebase non risponde entro 5s (config mancante), mostra Welcome
    const fallback = setTimeout(() => setLoading(false), 5000);
    let unsub: (() => void) | undefined;
    try {
      unsub = onAuthStateChanged(auth, async (firebaseUser) => {
        clearTimeout(fallback);
        if (firebaseUser) {
          try {
            const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (snap.exists()) {
              setUser({ uid: firebaseUser.uid, ...snap.data() } as any);
            }
          } catch { /* Firestore non configurato */ }
        } else {
          setUser(null);
        }
        setLoading(false);
      });
    } catch {
      clearTimeout(fallback);
      setLoading(false);
    }
    return () => { clearTimeout(fallback); unsub?.(); };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <AppNavigator />
    </GestureHandlerRootView>
  );
}
