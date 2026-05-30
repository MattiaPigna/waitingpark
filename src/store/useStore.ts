import { create } from 'zustand';
import { User, ParkingSpot, ParkingRequest, Match, Message } from '../types';

interface AppState {
  user: User | null;
  currentSpot: ParkingSpot | null;
  currentRequest: ParkingRequest | null;
  activeMatch: Match | null;
  nearbySpots: ParkingSpot[];
  messages: Message[];
  isLoading: boolean;
  error: string | null;

  setUser: (user: User | null) => void;
  setCurrentSpot: (spot: ParkingSpot | null) => void;
  setCurrentRequest: (request: ParkingRequest | null) => void;
  setActiveMatch: (match: Match | null) => void;
  setNearbySpots: (spots: ParkingSpot[]) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateWalletBalance: (amount: number) => void;
  incrementParkingsGiven: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  currentSpot: null,
  currentRequest: null,
  activeMatch: null,
  nearbySpots: [],
  messages: [],
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setCurrentSpot: (spot) => set({ currentSpot: spot }),
  setCurrentRequest: (request) => set({ currentRequest: request }),
  setActiveMatch: (match) => set({ activeMatch: match }),
  setNearbySpots: (spots) => set({ nearbySpots: spots }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  updateWalletBalance: (amount) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, walletBalance: state.user.walletBalance + amount }
        : null,
    })),
  incrementParkingsGiven: () =>
    set((state) => {
      if (!state.user) return {};
      const newTotal = state.user.totalParkingsGiven + 1;
      const newFuelCredits =
        state.user.fuelCredits + (newTotal % 10 === 0 ? 5 : 0);
      return {
        user: {
          ...state.user,
          totalParkingsGiven: newTotal,
          fuelCredits: newFuelCredits,
        },
      };
    }),
}));
