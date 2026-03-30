import useThemeStore from '../store/themeStore';

export const useTheme = () => {
  const { theme, toggleTheme, setTheme } = useThemeStore();
  const isDark = theme === 'dark';
  return { theme, isDark, toggleTheme, setTheme };
};

export default useTheme;
