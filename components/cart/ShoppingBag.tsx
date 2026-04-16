import Image from 'next/image'
import { X, Minus, Plus } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/router'
import { validateAndFixCartItem } from '@/lib/cacheCleanup'

interface ShoppingBagProps {
  isOpen: boolean
  onClose: () => void
}

export default function ShoppingBag({ isOpen, onClose }: ShoppingBagProps) {
  const { items, removeItem, updateQuantity, total } = useCart()
  const router = useRouter()

  const panelClasses = `fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white shadow-xl rounded-t-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'
    }`

  const overlayClasses = `fixed inset-0 bg-black transition-opacity duration-300 ${isOpen ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'
    }`

  const handleCheckout = () => {
    try {
      if (items.length === 0) {
        console.warn('Carrinho vazio');
        return;
      }

      console.log('🛒 Iniciando checkout...');

      // Validar e corrigir IDs obsoletos antes do checkout
      const validatedItems = items
        .map(item => validateAndFixCartItem(item))
        .filter(item => item !== null); // Remover itens inválidos

      if (validatedItems.length === 0) {
        console.error('❌ Todos os itens do carrinho têm IDs obsoletos');
        alert('Erro: Itens do carrinho estão desatualizados. Por favor, adicione os produtos novamente.');
        return;
      }

      // Redirecionar para a página de checkout (Embedded Checkout)
      // O evento InitiateCheckout será disparado lá após a coleta de dados
      onClose(); // Fechar o carrinho
      router.push(`/checkout${window.location.search}`);

    } catch (error) {
      console.error('❌ Erro no checkout:', error);
      alert('Erro ao processar checkout. Tente novamente.');
    }
  }

  return (
    <div className={`fixed inset-0 z-[100] overflow-hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* Overlay */}
      <div
        className={overlayClasses}
        onClick={onClose}
      />

      {/* Cart Panel */}
      <div className={panelClasses}>
        {/* Handle for dragging */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-2" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2">
          <h2 className="text-xl font-bold">SHOPPING BAG</h2>
          <button onClick={onClose} className="p-2">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="overflow-y-auto max-h-[calc(85vh-180px)] px-4">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Your shopping bag is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 py-4 border-b">
                {/* Product Image */}
                <div className="relative w-20 h-20 flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-contain"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-grow min-w-0">
                  <h3 className="text-sm font-medium truncate">{item.title}</h3>
                  <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                  <p className="text-sm font-medium mt-1">£{item.price.toFixed(2)}</p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 hover:bg-gray-100 rounded border"
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 hover:bg-gray-100 rounded border"
                      disabled={item.quantity >= 10}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-xs text-gray-500 hover:text-gray-700 self-start mt-1"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-4 bg-white">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium">Total</span>
            <span className="text-lg font-bold">£{total.toFixed(2)}</span>
          </div>



          <button
            onClick={handleCheckout}
            className={`w-full bg-black text-white py-3 rounded-full font-medium text-center
              ${items.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-900'}`}
            disabled={items.length === 0}
          >
            CHECKOUT • £{total.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  )
}