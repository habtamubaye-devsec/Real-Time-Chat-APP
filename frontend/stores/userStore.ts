import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../src/gql/graphql";

const USER_STORAGE_KEY = "user-storage";

const DEFAULT_USER_STATE = {
  id: undefined as string | undefined,
  fullName: "",
  email: "",
  avatarUrl: null as string | null,
};

interface UserState {
  id: string | undefined;
  fullName: string;
  email?: string;
  avatarUrl: string | null;
  updateProfileImage: (image: string) => void;
  updateUsername: (name: string) => void;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      ...DEFAULT_USER_STATE,

      updateProfileImage: (image: string) =>
        set(() => ({ avatarUrl: image })),
      updateUsername: (name: string) =>
        set(() => ({ fullName: name })),
      setUser: (user) =>
        set({
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          avatarUrl: user.avatarUrl ?? null,
        }),
      clearUser: () => set(() => ({ ...DEFAULT_USER_STATE })),
    }),
    {
      name: USER_STORAGE_KEY,
      partialize: (state) => ({
        id: state.id,
        fullName: state.fullName,
        email: state.email,
        avatarUrl: state.avatarUrl,
      }),
    }
  )
);

// Ensure localStorage always has a default user state (logged out)
// so the app can rely on the key existing.
try {
  if (typeof window !== "undefined" && window.localStorage) {
    const existing = localStorage.getItem(USER_STORAGE_KEY);
    if (!existing) {
      localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify({ state: DEFAULT_USER_STATE, version: 0 })
      );
    }
  }
} catch {
  // ignore storage errors (private mode / blocked storage)
}
