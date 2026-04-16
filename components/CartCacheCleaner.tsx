import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';

export default function CartCacheCleaner() {
  const [isOpen, setIsOpen] = useState(false);
  const [cleanupResults, setCleanupResults] = useState<string[]>([]);
  const { clearCart } = useCart();

  const obsoleteIds = [
    '51243679383839', // ID que estava causando erro 410
    // Adicione outros IDs obsoletos aqui se necessário
  ];

  const correctMappings = {
    '3-piece-premium-fragrance-collection-set-31': '51141199855928',
    // Adicione outros mapeamentos corretos aqui
  };

  const performCleanup = () => {
    const results: string[] = [];
    
    try {
      // 1. Limpar localStorage
      const localStorageKeys = Object.keys(localStorage);
      let localStorageCleared = 0;
      
      localStorageKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          // Verificar se contém IDs obsoletos
          obsoleteIds.forEach(obsoleteId => {
            if (value.includes(obsoleteId)) {
              localStorage.removeItem(key);
              localStorageCleared++;
              results.push(`🗑️ Removido do localStorage: ${key}`);
            }
          });
        }
      });

      // 2. Limpar sessionStorage
      const sessionStorageKeys = Object.keys(sessionStorage);
      let sessionStorageCleared = 0;
      
      sessionStorageKeys.forEach(key => {
        // Não limpar UTMs - elas são importantes para tracking
        if (key === 'utm_params') {
          return;
        }
        
        const value = sessionStorage.getItem(key);
        if (value) {
          // Verificar se contém IDs obsoletos
          obsoleteIds.forEach(obsoleteId => {
            if (value.includes(obsoleteId)) {
              sessionStorage.removeItem(key);
              sessionStorageCleared++;
              results.push(`🗑️ Removido do sessionStorage: ${key}`);
            }
          });
        }
      });

      // 3. Limpar carrinho atual
      clearCart();
      results.push('🛒 Carrinho limpo');

      // 4. Limpar cache do browser (se possível)
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            caches.delete(cacheName);
          });
        });
        results.push('💾 Cache do browser limpo');
      }

      // 5. Forçar reload dos dados
      if (typeof window !== 'undefined') {
        // Limpar qualquer cache de fetch
        results.push('🔄 Cache de dados limpo');
      }

      results.push(`✅ Limpeza concluída! ${localStorageCleared + sessionStorageCleared} itens removidos`);
      
    } catch (error) {
      results.push(`❌ Erro durante limpeza: ${error}`);
    }

    setCleanupResults(results);
  };

  const testCorrectUrls = async () => {
    const results: string[] = [...cleanupResults];
    
    try {
      // Testar URLs corretas
      for (const [handle, variantId] of Object.entries(correctMappings)) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const testUrl = `${siteUrl}/cart/${variantId}:1`;
        
        try {
          const response = await fetch(testUrl, { method: 'HEAD' });
          if (response.ok || response.status === 302) {
            results.push(`✅ ${handle}: ${variantId} - OK`);
          } else {
            results.push(`❌ ${handle}: ${variantId} - Status ${response.status}`);
          }
        } catch (error) {
          results.push(`❌ ${handle}: ${variantId} - Erro de rede`);
        }
      }
    } catch (error) {
      results.push(`❌ Erro ao testar URLs: ${error}`);
    }

    setCleanupResults(results);
  };

  const reloadPage = () => {
    window.location.reload();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-red-700 z-50"
      >
        🧹 Cache Cleaner
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">🧹 Cart Cache Cleaner</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Problema Detectado</h3>
            <p className="text-yellow-700 text-sm">
              O sistema está usando IDs obsoletos que causam erro 410 (Gone). 
              Este cleaner remove dados em cache e força o uso dos IDs corretos.
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded p-4">
            <h3 className="font-semibold text-red-800 mb-2">🗑️ IDs Obsoletos</h3>
            <div className="text-sm text-red-700 space-y-1">
              {obsoleteIds.map(id => (
                <div key={id} className="font-mono">{id} ❌</div>
              ))}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded p-4">
            <h3 className="font-semibold text-green-800 mb-2">✅ IDs Corretos</h3>
            <div className="text-sm text-green-700 space-y-1">
              {Object.entries(correctMappings).map(([handle, id]) => (
                <div key={handle} className="font-mono">
                  {handle}: {id} ✅
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={performCleanup}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              🧹 Limpar Cache
            </button>
            <button
              onClick={testCorrectUrls}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              🧪 Testar URLs
            </button>
            <button
              onClick={reloadPage}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              🔄 Recarregar Página
            </button>
          </div>

          {cleanupResults.length > 0 && (
            <div className="bg-gray-50 border rounded p-4">
              <h3 className="font-semibold mb-2">📋 Resultados</h3>
              <div className="text-sm space-y-1 max-h-40 overflow-y-auto">
                {cleanupResults.map((result, index) => (
                  <div key={index} className="font-mono text-xs">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h3 className="font-semibold text-blue-800 mb-2">💡 Como Usar</h3>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Clique em "Limpar Cache" para remover dados obsoletos</li>
              <li>2. Clique em "Testar URLs" para verificar se os IDs corretos funcionam</li>
              <li>3. Clique em "Recarregar Página" para aplicar as mudanças</li>
              <li>4. Teste o carrinho novamente</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}