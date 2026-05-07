import { create } from 'zustand';

interface User {
  id: string;
  first_name: string;
  role: { name: 'ADMIN' | 'SALES_REP' | 'SUPERVISOR' };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Empezamos cargando para validar la sesión al inicio
  setUser: (user) => set({ user: user?.id ? user : null, isAuthenticated: !!user?.id, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
}));