import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/*
  Demo Credentials:
  ─────────────────────────────────────
  Citizen:      citizen@rirrs.in     / citizen123
  Admin:        admin@rirrs.in       / admin123
  Field Worker: fieldworker@rirrs.in / field123
  ─────────────────────────────────────
*/

const DEMO_USERS = {
  'citizen@rirrs.in': {
    id: 'usr_citizen_001',
    name: 'Rahul Sharma',
    email: 'citizen@rirrs.in',
    phone: '+91 98765 43210',
    role: 'citizen',
    avatar: null,
    isVerified: true,
    notifyPush: true,
    notifyEmail: true,
    notifySMS: true,
    password: 'citizen123',
  },
  'admin@rirrs.in': {
    id: 'usr_admin_001',
    name: 'Priya Patel',
    email: 'admin@rirrs.in',
    phone: '+91 98765 11111',
    role: 'admin',
    avatar: null,
    isVerified: true,
    notifyPush: true,
    notifyEmail: true,
    notifySMS: false,
    password: 'admin123',
  },
  'fieldworker@rirrs.in': {
    id: 'usr_field_001',
    name: 'Amit Kumar',
    email: 'fieldworker@rirrs.in',
    phone: '+91 98765 22222',
    role: 'field',
    avatar: null,
    isVerified: true,
    notifyPush: true,
    notifyEmail: false,
    notifySMS: true,
    password: 'field123',
  },
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: (email, password) => {
        set({ isLoading: true, error: null });

        // Simulate API delay
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            const demoUser = DEMO_USERS[email];
            if (demoUser && demoUser.password === password) {
              const { password: _, ...userData } = demoUser;
              set({ user: userData, isAuthenticated: true, isLoading: false, error: null });
              resolve(userData);
            } else {
              const error = 'Invalid email or password';
              set({ isLoading: false, error });
              reject(new Error(error));
            }
          }, 800);
        });
      },

      register: (name, email, phone, password) => {
        set({ isLoading: true, error: null });
        return new Promise((resolve) => {
          setTimeout(() => {
            const newUser = {
              id: 'usr_' + Date.now(),
              name,
              email,
              phone,
              role: 'citizen',
              avatar: null,
              isVerified: false,
              notifyPush: true,
              notifyEmail: true,
              notifySMS: true,
            };
            set({ user: newUser, isAuthenticated: true, isLoading: false });
            resolve(newUser);
          }, 800);
        });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, error: null });
      },

      updateProfile: (updates) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
export { DEMO_USERS };
