import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  first_name: string;
  last_name?: string;
  email?: string;
  is_active?: boolean;
  role: { name: 'ADMIN' | 'SALES_REP' | 'SUPERVISOR' | 'SALES_SUPERVISOR' | string };
  seller?: {
    id: string;
  } | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true, // Empezamos cargando para validar la sesión al inicio
      setUser: (user) => set({ user: user?.id ? user : null, isAuthenticated: !!user?.id, isLoading: false }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('Error durante la hidratación del auth store:', error);
          }
          if (state) {
            state.setLoading(false);
          }
        };
      },
    }
  )
);
