// Sistema de limpeza automática de IDs obsoletos do cache

// Lista de IDs obsoletos conhecidos que causam erro 410
const OBSOLETE_VARIANT_IDS = [
  '51243679383839', // ID obsoleto do produto 3-piece-premium-fragrance-collection-set-31
  // Adicionar outros IDs obsoletos conforme necessário
];

// Mapeamento de IDs obsoletos para IDs corretos
const OBSOLETE_TO_CORRECT_MAPPING: { [key: string]: string } = {
  '51243679383839': '51141199855928', // 3-piece-premium-fragrance-collection-set-31
  // Adicionar outros mapeamentos conforme necessário
};

/**
 * Verifica se um ID é obsoleto
 */
export function isObsoleteVariantId(variantId: string): boolean {
  return OBSOLETE_VARIANT_IDS.includes(variantId);
}

/**
 * Obtém o ID correto para um ID obsoleto
 */
export function getCorrectVariantId(obsoleteId: string): string | null {
  return OBSOLETE_TO_CORRECT_MAPPING[obsoleteId] || null;
}

/**
 * Limpa IDs obsoletos do localStorage
 */
export function cleanObsoleteIdsFromLocalStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    // Verificar todas as chaves do localStorage
    const keysToCheck = Object.keys(localStorage);
    
    keysToCheck.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          // Verificar se o valor contém IDs obsoletos
          let hasObsoleteId = false;
          let updatedValue = value;
          
          OBSOLETE_VARIANT_IDS.forEach(obsoleteId => {
            if (value.includes(obsoleteId)) {
              hasObsoleteId = true;
              const correctId = getCorrectVariantId(obsoleteId);
              if (correctId) {
                updatedValue = updatedValue.replace(new RegExp(obsoleteId, 'g'), correctId);
                console.log(`🔄 Substituindo ID obsoleto ${obsoleteId} por ${correctId} em localStorage[${key}]`);
              }
            }
          });
          
          if (hasObsoleteId) {
            // Se encontrou IDs obsoletos, atualizar ou remover
            try {
              // Tentar parsear como JSON para verificar se é válido
              JSON.parse(updatedValue);
              localStorage.setItem(key, updatedValue);
              console.log(`✅ localStorage[${key}] atualizado com IDs corretos`);
            } catch {
              // Se não conseguir parsear, remover a chave
              localStorage.removeItem(key);
              console.log(`🗑️ localStorage[${key}] removido (continha IDs obsoletos)`);
            }
          }
        }
      } catch (error) {
        console.warn(`Erro ao processar localStorage[${key}]:`, error);
      }
    });
  } catch (error) {
    console.error('Erro ao limpar localStorage:', error);
  }
}

/**
 * Limpa IDs obsoletos do sessionStorage
 */
export function cleanObsoleteIdsFromSessionStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    // Verificar todas as chaves do sessionStorage
    const keysToCheck = Object.keys(sessionStorage);
    
    keysToCheck.forEach(key => {
      // Não limpar UTMs - elas são importantes para tracking
      if (key === 'utm_params') {
        return;
      }
      
      try {
        const value = sessionStorage.getItem(key);
        if (value) {
          // Verificar se o valor contém IDs obsoletos
          let hasObsoleteId = false;
          let updatedValue = value;
          
          OBSOLETE_VARIANT_IDS.forEach(obsoleteId => {
            if (value.includes(obsoleteId)) {
              hasObsoleteId = true;
              const correctId = getCorrectVariantId(obsoleteId);
              if (correctId) {
                updatedValue = updatedValue.replace(new RegExp(obsoleteId, 'g'), correctId);
                console.log(`🔄 Substituindo ID obsoleto ${obsoleteId} por ${correctId} em sessionStorage[${key}]`);
              }
            }
          });
          
          if (hasObsoleteId) {
            // Se encontrou IDs obsoletos, atualizar ou remover
            try {
              // Tentar parsear como JSON para verificar se é válido
              JSON.parse(updatedValue);
              sessionStorage.setItem(key, updatedValue);
              console.log(`✅ sessionStorage[${key}] atualizado com IDs corretos`);
            } catch {
              // Se não conseguir parsear, remover a chave
              sessionStorage.removeItem(key);
              console.log(`🗑️ sessionStorage[${key}] removido (continha IDs obsoletos)`);
            }
          }
        }
      } catch (error) {
        console.warn(`Erro ao processar sessionStorage[${key}]:`, error);
      }
    });
  } catch (error) {
    console.error('Erro ao limpar sessionStorage:', error);
  }
}

/**
 * Limpa todos os caches obsoletos
 */
export function cleanAllObsoleteCaches(): void {
  console.log('🧹 Iniciando limpeza de IDs obsoletos...');
  
  cleanObsoleteIdsFromLocalStorage();
  cleanObsoleteIdsFromSessionStorage();
  
  console.log('✅ Limpeza de IDs obsoletos concluída');
}

/**
 * Valida se um item do carrinho tem ID obsoleto e corrige se necessário
 */
export function validateAndFixCartItem(item: any): any {
  if (!item || !item.shopifyId) return item;
  
  if (isObsoleteVariantId(item.shopifyId)) {
    const correctId = getCorrectVariantId(item.shopifyId);
    if (correctId) {
      console.log(`🔄 Corrigindo ID obsoleto no item do carrinho: ${item.shopifyId} → ${correctId}`);
      return {
        ...item,
        shopifyId: correctId
      };
    } else {
      console.warn(`⚠️ ID obsoleto encontrado mas sem mapeamento: ${item.shopifyId}`);
      return null; // Remover item com ID obsoleto sem mapeamento
    }
  }
  
  return item;
}

/**
 * Inicializa a limpeza automática quando a página carrega
 */
export function initializeAutoCleanup(): void {
  if (typeof window === 'undefined') return;
  
  // Executar limpeza quando a página carrega
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cleanAllObsoleteCaches);
  } else {
    cleanAllObsoleteCaches();
  }
  
  // Executar limpeza periodicamente (a cada 5 minutos)
  setInterval(cleanAllObsoleteCaches, 5 * 60 * 1000);
}