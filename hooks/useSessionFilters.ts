import { useState, useEffect } from 'react';
import { useUTM } from './useUTM';

interface SessionFilters {
  sort: string;
  activeFilters: string[];
  collections: string[];
}

interface UseSessionFiltersReturn {
  sessionFilters: SessionFilters;
  updateSort: (sort: string) => void;
  updateFilters: (filters: string[]) => void;
  updateCollections: (collections: string[]) => void;
  clearFilters: () => void;
  isLoaded: boolean;
}

const DEFAULT_FILTERS: SessionFilters = {
  sort: 'featured',
  activeFilters: [],
  collections: []
};

/**
 * Hook para gerenciar filtros baseados na sessão UTM
 * Cada campanha UTM mantém seus próprios filtros persistidos
 */
export function useSessionFilters(): UseSessionFiltersReturn {
  const { utmParams, isLoaded: utmLoaded } = useUTM();
  const [sessionFilters, setSessionFilters] = useState<SessionFilters>(DEFAULT_FILTERS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Gera chave única para a sessão baseada no UTM
  const getSessionKey = () => {
    const campaign = utmParams.utm_campaign || 'default';
    const source = utmParams.utm_source || 'direct';
    return `session_filters_${campaign}_${source}`;
  };

  // Carrega filtros da sessão quando UTM estiver pronto
  useEffect(() => {
    if (!utmLoaded || typeof window === 'undefined') return;

    try {
      const sessionKey = getSessionKey();
      const savedFilters = sessionStorage.getItem(sessionKey);
      
      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters);
        setSessionFilters(parsedFilters);
        console.log(`🎯 Filtros carregados para sessão ${sessionKey}:`, parsedFilters);
      } else {
        setSessionFilters(DEFAULT_FILTERS);
        console.log(`🎯 Nova sessão criada: ${sessionKey}`);
      }
      
      setIsLoaded(true);
    } catch (error) {
      console.error('Erro ao carregar filtros da sessão:', error);
      setSessionFilters(DEFAULT_FILTERS);
      setIsLoaded(true);
    }
  }, [utmLoaded, utmParams.utm_campaign, utmParams.utm_source]);

  // Salva filtros na sessão
  const saveToSession = (filters: SessionFilters) => {
    if (typeof window === 'undefined') return;

    try {
      const sessionKey = getSessionKey();
      sessionStorage.setItem(sessionKey, JSON.stringify(filters));
      console.log(`💾 Filtros salvos para sessão ${sessionKey}:`, filters);
    } catch (error) {
      console.error('Erro ao salvar filtros na sessão:', error);
    }
  };

  const updateSort = (sort: string) => {
    const newFilters = { ...sessionFilters, sort };
    setSessionFilters(newFilters);
    saveToSession(newFilters);
  };

  const updateFilters = (activeFilters: string[]) => {
    const newFilters = { ...sessionFilters, activeFilters };
    setSessionFilters(newFilters);
    saveToSession(newFilters);
  };

  const updateCollections = (collections: string[]) => {
    const newFilters = { ...sessionFilters, collections };
    setSessionFilters(newFilters);
    saveToSession(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { ...DEFAULT_FILTERS };
    setSessionFilters(clearedFilters);
    saveToSession(clearedFilters);
  };

  return {
    sessionFilters,
    updateSort,
    updateFilters,
    updateCollections,
    clearFilters,
    isLoaded
  };
}

/**
 * Função utilitária para limpar filtros de todas as sessões (útil para testes)
 */
export function clearAllSessionFilters(): void {
  if (typeof window === 'undefined') return;

  try {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('session_filters_')) {
        sessionStorage.removeItem(key);
      }
    });
    console.log('🧹 Todos os filtros de sessão foram limpos');
  } catch (error) {
    console.error('Erro ao limpar filtros de sessão:', error);
  }
}