import { useState, useEffect } from 'react';

export interface SearchItem {
  name: string;
  count: number;
  lastSearched: number;
}

const STORAGE_KEY = 'habbo_search_history';
const MAX_HISTORY = 50;

export function useSearchHistory() {
  const [searchHistory, setSearchHistory] = useState<SearchItem[]>([]);

  // Carregar histórico do localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSearchHistory(JSON.parse(stored));
      } catch (err) {
        console.error('Erro ao carregar histórico de buscas:', err);
      }
    }
  }, []);

  // Adicionar item ao histórico
  const addSearch = (itemName: string) => {
    setSearchHistory((prev) => {
      const normalized = itemName.toLowerCase().trim();
      
      // Procurar se o item já existe
      const existingIndex = prev.findIndex(
        (item) => item.name.toLowerCase() === normalized
      );

      let updated: SearchItem[];

      if (existingIndex >= 0) {
        // Item já existe, incrementar contagem
        updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          count: updated[existingIndex].count + 1,
          lastSearched: Date.now(),
        };
      } else {
        // Novo item
        updated = [
          {
            name: itemName,
            count: 1,
            lastSearched: Date.now(),
          },
          ...prev,
        ];
      }

      // Limitar ao máximo de histórico
      if (updated.length > MAX_HISTORY) {
        updated = updated.slice(0, MAX_HISTORY);
      }

      // Salvar no localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      return updated;
    });
  };

  // Obter top N itens mais pesquisados
  const getTopSearches = (limit: number = 5): SearchItem[] => {
    return [...searchHistory]
      .sort((a, b) => {
        // Ordenar por contagem (descendente) e depois por data (mais recente primeiro)
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        return b.lastSearched - a.lastSearched;
      })
      .slice(0, limit);
  };

  // Limpar histórico
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    searchHistory,
    addSearch,
    getTopSearches,
    clearHistory,
  };
}
