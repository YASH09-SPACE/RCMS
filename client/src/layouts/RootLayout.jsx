import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import useThemeStore from '../store/themeStore';

const RootLayout = () => {
  const initTheme = useThemeStore(state => state.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Outlet />
    </div>
  );
};

export default RootLayout;
