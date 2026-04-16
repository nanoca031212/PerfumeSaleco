import { useState, useEffect } from 'react';

interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  src?: string;
  sck?: string;
  xcod?: string;
}

interface UTMHook {
  utmParams: UTMParams;
  isLoaded: boolean;
}

/**
 * Hook para capturar e gerenciar parâmetros UTM
 * Persiste os parâmetros no sessionStorage para manter durante a sessão
 */
export function useUTM(): UTMHook {
  const [utmParams, setUtmParams] = useState<UTMParams>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Primeiro, tenta carregar UTMs salvos no sessionStorage
      const savedUtms = sessionStorage.getItem('utm_params');
      let utmsFromStorage: UTMParams = {};

      if (savedUtms) {
        try {
          utmsFromStorage = JSON.parse(savedUtms);
        } catch (error) {
          console.warn('Erro ao parsear UTMs do sessionStorage:', error);
        }
      }

      // Captura UTMs da URL atual
      const urlParams = new URLSearchParams(window.location.search);
      const newUtmParams: UTMParams = {};

      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'src', 'sck', 'xcod'].forEach(param => {
        const value = urlParams.get(param);
        if (value) {
          newUtmParams[param as keyof UTMParams] = value;
        }
      });

      // Se há novos UTMs na URL, eles têm prioridade
      const finalUtmParams = Object.keys(newUtmParams).length > 0 ? newUtmParams : utmsFromStorage;

      // Salva os UTMs no sessionStorage se houver algum
      if (Object.keys(finalUtmParams).length > 0) {
        sessionStorage.setItem('utm_params', JSON.stringify(finalUtmParams));
        console.log('🎯 UTMs capturados e salvos:', finalUtmParams);
      }

      setUtmParams(finalUtmParams);
    }

    setIsLoaded(true);
  }, []);

  return {
    utmParams,
    isLoaded
  };
}

/**
 * Função utilitária para limpar parâmetros UTM (útil para testes)
 */
export function clearUTMParams(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('utm_params');
  }
}

/**
 * Função utilitária para definir parâmetros UTM manualmente (útil para testes)
 */
export function setUTMParams(params: UTMParams): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('utm_params', JSON.stringify(params));
  }
}