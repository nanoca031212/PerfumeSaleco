import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';

interface CartDebuggerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDebugger({ isOpen, onClose }: CartDebuggerProps) {
  const { items, clearCart } = useCart();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // IDs corretos conhecidos para teste
  const WORKING_IDS = [
    { handle: '3-piece-premium-fragrance-collection-set-1', id: '51141206409528' },
    { handle: '3-piece-premium-fragrance-collection-set-10', id: '51141209358648' },
    { handle: '3-piece-premium-fragrance-collection-set-31', id: '51141199855928' },
    { handle: '3-piece-premium-fragrance-collection-set-29', id: '51141199167800' },
    { handle: '3-piece-premium-fragrance-collection-set-28', id: '51141198741816' }
  ];

  const clearAllData = () => {
    // Limpar localStorage
    localStorage.clear();
    
    // Limpar sessionStorage
    sessionStorage.clear();
    
    // Limpar carrinho
    clearCart();
    
    alert('✅ Cache limpo! Recarregue a página para garantir que tudo foi resetado.');
  };

  const testWorkingUrls = async () => {
    setIsLoading(true);
    const results = [];

    for (const item of WORKING_IDS) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
      const url = `${siteUrl}/cart/${item.id}:1`;
      
      try {
        const response = await fetch(url, { method: 'HEAD' });
        results.push({
          handle: item.handle,
          id: item.id,
          url: url,
          status: response.status,
          working: response.status === 302 || response.status === 200
        });
      } catch (error) {
        results.push({
          handle: item.handle,
          id: item.id,
          url: url,
          status: 'Error',
          working: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const openWorkingUrl = (url: string) => {
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">🛠️ Cart Debugger</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Informações do Problema */}
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-bold text-red-800 mb-2">🚨 Problema Identificado</h3>
            <p className="text-red-700 mb-2">
              <strong>ID Obsoleto:</strong> <code>51243679383839</code> retorna erro 410 (Gone)
            </p>
            <p className="text-red-700 mb-2">
              <strong>Produto:</strong> 3-piece-premium-fragrance-collection-set-31
            </p>
            <p className="text-red-700">
              <strong>ID Correto:</strong> <code>51141199855928</code>
            </p>
          </div>

          {/* Carrinho Atual */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-bold text-blue-800 mb-2">🛒 Carrinho Atual</h3>
            {items.length === 0 ? (
              <p className="text-blue-700">Carrinho vazio</p>
            ) : (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="text-sm">
                    <strong>{item.title}</strong> - Handle: <code>{item.handle}</code>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="mb-6 space-y-4">
            <button
              onClick={clearAllData}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 font-medium"
            >
              🗑️ Limpar Todo Cache e Dados
            </button>

            <button
              onClick={testWorkingUrls}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              {isLoading ? '🔄 Testando...' : '🧪 Testar URLs Funcionais'}
            </button>
          </div>

          {/* Resultados dos Testes */}
          {testResults.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold mb-4">📊 Resultados dos Testes</h3>
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border ${
                      result.working 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">
                          {result.working ? '✅' : '❌'} {result.handle}
                        </div>
                        <div className="text-sm text-gray-600">
                          ID: <code>{result.id}</code> | Status: {result.status}
                        </div>
                        {result.error && (
                          <div className="text-sm text-red-600">
                            Erro: {result.error}
                          </div>
                        )}
                      </div>
                      {result.working && (
                        <button
                          onClick={() => openWorkingUrl(result.url)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Abrir
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* URLs Funcionais para Teste Manual */}
          <div className="mb-6">
            <h3 className="font-bold mb-4">🔗 URLs Funcionais para Teste</h3>
            <div className="space-y-2">
              {WORKING_IDS.map((item, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                  <div className="font-medium">{item.handle}</div>
                  <div className="text-blue-600 break-all">
                    https://tpsfragrances.shop/cart/{item.id}:1
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instruções */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-bold text-yellow-800 mb-2">📋 Instruções</h3>
            <ol className="list-decimal list-inside text-yellow-700 space-y-1">
              <li>Clique em "Limpar Todo Cache e Dados" para resetar</li>
              <li>Recarregue a página completamente (F5 ou Ctrl+R)</li>
              <li>Teste as URLs funcionais acima</li>
              <li>Se ainda houver problemas, verifique o console do navegador</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}