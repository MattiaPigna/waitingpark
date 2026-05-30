export type UserRole = 'leaving' | 'searching' | 'idle';

export interface User {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  walletBalance: number;
  totalParkingsGiven: number;
  totalParkingsTaken: number;
  fuelCredits: number;
}

export interface ParkingSpot {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  latitude: number;
  longitude: number;
  address: string;
  status: 'available' | 'reserved' | 'taken';
  availableAt: Date;
  scheduledFor?: Date;
  createdAt: Date;
  matchedWith?: string;
}

export interface ParkingRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  searchTime: 'now' | 'scheduled';
  scheduledFor?: Date;
  status: 'active' | 'matched' | 'completed' | 'cancelled';
  matchedSpotId?: string;
  createdAt: Date;
}

export interface Match {
  id: string;
  spotId: string;
  requestId: string;
  leavingUser: User;
  searchingUser: User;
  spot: ParkingSpot;
  status: 'pending' | 'confirmed' | 'payment_done' | 'completed' | 'cancelled';
  createdAt: Date;
  confirmedAt?: Date;
  paymentAmount: number;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: Date;
  read: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit' | 'fuel_reward';
  amount: number;
  description: string;
  matchId?: string;
  createdAt: Date;
}

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Activity: undefined;
  Chats: undefined;
  Wallet: undefined;
};

export type HomeStackParamList = {
  Map: undefined;
  Leaving: undefined;
  Search: undefined;
  Match: { matchId: string };
  Profile: undefined;
};
