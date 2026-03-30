import useAuthStore from '../store/authStore';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error, login, register, logout, updateProfile, clearError } = useAuthStore();

  const isAdmin = user?.role === 'admin';
  const isCitizen = user?.role === 'citizen';
  const isFieldWorker = user?.role === 'field';

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    isAdmin,
    isCitizen,
    isFieldWorker,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };
};

export default useAuth;
