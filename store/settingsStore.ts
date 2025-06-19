import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  username: string;
  theme: 'light' | 'dark';
  notifications: boolean;
  locationAwareness: boolean;
  moodTracking: boolean;
  setUsername: (name: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleNotifications: () => void;
  toggleLocationAwareness: () => void;
  toggleMoodTracking: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      username: '',
      theme: 'dark',
      notifications: true,
      locationAwareness: true,
      moodTracking: false,
      setUsername: (name) => set({ username: name }),
      setTheme: (theme) => set({ theme }),
      toggleNotifications: () => set((state) => ({ notifications: !state.notifications })),
      toggleLocationAwareness: () => set((state) => ({ locationAwareness: !state.locationAwareness })),
      toggleMoodTracking: () => set((state) => ({ moodTracking: !state.moodTracking })),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);