import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light', // 'light' | 'dark'
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { theme: newTheme };
        }),
      setTheme: (theme) =>
        set(() => {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { theme };
        }),
      initTheme: () => {
        const stored = localStorage.getItem('theme-storage');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            const theme = parsed?.state?.theme || 'light';
            if (theme === 'dark') {
              document.documentElement.classList.add('dark');
            }
          } catch (e) {
            // ignore
          }
        }
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);

export default useThemeStore;
