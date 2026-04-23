import { create } from 'zustand';

interface SearchState {
  searchQuery: string;
  placeholder: string;
  setSearchQuery: (query: string) => void;
  setPlaceholder: (text: string) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  searchQuery: '',
  placeholder: 'Buscar...',
  setSearchQuery: (query) => set({ searchQuery: query }),
  setPlaceholder: (text) => set({ placeholder: text }),
}));