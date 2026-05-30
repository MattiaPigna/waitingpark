import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  GeoPoint,
  getDocs,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { ParkingSpot, ParkingRequest, Match, Message } from '../types';

const SPOTS_COLLECTION = 'parkingSpots';
const REQUESTS_COLLECTION = 'parkingRequests';
const MATCHES_COLLECTION = 'matches';
const MESSAGES_COLLECTION = 'messages';

// ── SPOT (chi cede il posto) ──────────────────────────────────────────────

export async function createParkingSpot(
  userId: string,
  userName: string,
  latitude: number,
  longitude: number,
  address: string,
  scheduledFor?: Date
): Promise<string> {
  const ref = await addDoc(collection(db, SPOTS_COLLECTION), {
    userId,
    userName,
    location: new GeoPoint(latitude, longitude),
    latitude,
    longitude,
    address,
    status: 'available',
    availableAt: scheduledFor ?? new Date(),
    scheduledFor: scheduledFor ?? null,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function cancelParkingSpot(spotId: string): Promise<void> {
  await updateDoc(doc(db, SPOTS_COLLECTION, spotId), { status: 'taken' });
}

// ── REQUEST (chi cerca il posto) ──────────────────────────────────────────

export async function createParkingRequest(
  userId: string,
  userName: string,
  latitude: number,
  longitude: number,
  radiusKm: number,
  scheduledFor?: Date
): Promise<string> {
  const ref = await addDoc(collection(db, REQUESTS_COLLECTION), {
    userId,
    userName,
    latitude,
    longitude,
    radiusKm,
    searchTime: scheduledFor ? 'scheduled' : 'now',
    scheduledFor: scheduledFor ?? null,
    status: 'active',
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function cancelRequest(requestId: string): Promise<void> {
  await updateDoc(doc(db, REQUESTS_COLLECTION, requestId), {
    status: 'cancelled',
  });
}

// ── MATCH ──────────────────────────────────────────────────────────────────

export async function createMatch(
  spotId: string,
  requestId: string,
  leavingUserId: string,
  searchingUserId: string
): Promise<string> {
  const ref = await addDoc(collection(db, MATCHES_COLLECTION), {
    spotId,
    requestId,
    leavingUserId,
    searchingUserId,
    status: 'pending',
    paymentAmount: 0.5,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, SPOTS_COLLECTION, spotId), {
    status: 'reserved',
    matchedWith: searchingUserId,
  });
  await updateDoc(doc(db, REQUESTS_COLLECTION, requestId), {
    status: 'matched',
    matchedSpotId: spotId,
  });
  return ref.id;
}

export async function confirmMatch(matchId: string): Promise<void> {
  await updateDoc(doc(db, MATCHES_COLLECTION, matchId), {
    status: 'confirmed',
    confirmedAt: serverTimestamp(),
  });
}

export async function completeMatch(matchId: string, spotId: string): Promise<void> {
  await updateDoc(doc(db, MATCHES_COLLECTION, matchId), {
    status: 'completed',
  });
  await updateDoc(doc(db, SPOTS_COLLECTION, spotId), { status: 'taken' });
}

export async function cancelMatch(matchId: string, spotId: string, requestId: string): Promise<void> {
  await updateDoc(doc(db, MATCHES_COLLECTION, matchId), { status: 'cancelled' });
  await updateDoc(doc(db, SPOTS_COLLECTION, spotId), {
    status: 'available',
    matchedWith: null,
  });
  await updateDoc(doc(db, REQUESTS_COLLECTION, requestId), { status: 'active' });
}

// ── MESSAGGI ──────────────────────────────────────────────────────────────

export async function sendMessage(
  matchId: string,
  senderId: string,
  senderName: string,
  text: string
): Promise<void> {
  await addDoc(collection(db, MESSAGES_COLLECTION), {
    matchId,
    senderId,
    senderName,
    text,
    createdAt: serverTimestamp(),
    read: false,
  });
}

export function subscribeToMessages(
  matchId: string,
  callback: (messages: Message[]) => void
) {
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where('matchId', '==', matchId),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate() ?? new Date(),
    })) as Message[];
    callback(msgs);
  });
}

// ── NEARBY SPOTS (ricerca per raggio approssimativo) ──────────────────────

export function subscribeToNearbySpots(
  latitude: number,
  longitude: number,
  radiusDeg: number,
  callback: (spots: ParkingSpot[]) => void
) {
  const q = query(
    collection(db, SPOTS_COLLECTION),
    where('status', '==', 'available'),
    where('latitude', '>=', latitude - radiusDeg),
    where('latitude', '<=', latitude + radiusDeg)
  );
  return onSnapshot(q, (snapshot) => {
    const spots = snapshot.docs
      .map((d) => ({
        id: d.id,
        ...d.data(),
        availableAt: d.data().availableAt?.toDate() ?? new Date(),
        createdAt: d.data().createdAt?.toDate() ?? new Date(),
      }))
      .filter(
        (s: any) =>
          Math.abs(s.longitude - longitude) <= radiusDeg
      ) as ParkingSpot[];
    callback(spots);
  });
}

export function subscribeToMatch(
  matchId: string,
  callback: (match: any) => void
) {
  return onSnapshot(doc(db, MATCHES_COLLECTION, matchId), (d) => {
    if (d.exists()) {
      callback({ id: d.id, ...d.data() });
    }
  });
}
